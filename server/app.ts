import path from 'node:path'
import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import multer from 'multer'
import { ZodError } from 'zod'
import { createAuthMiddleware, type AuthenticatedRequest } from './auth.js'
import { publicCatalog } from './catalog.js'
import type { ServerConfig } from './config.js'
import type { ImageGenerator } from './openai-images.js'
import type { QuotaStore } from './quota.js'
import { generationConfigSchema } from './schema.js'

const upload = multer({
  storage: multer.memoryStorage(),
  // `config` is canonical. The extra fields keep older Lovable clients that
  // also send every validated config key individually backward compatible.
  limits: { fileSize: 12 * 1024 * 1024, files: 1, fields: 20 },
  fileFilter: (_request, file, done) => {
    done(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
  },
})

function imageFromRequest(request: Request) {
  if (request.file?.buffer) return request.file.buffer
  const value = typeof request.body?.image === 'string' ? request.body.image : ''
  const match = /^data:image\/(?:png|jpeg|webp);base64,([A-Za-z0-9+/=\s]+)$/.exec(value)
  if (!match) throw Object.assign(new Error('Bitte sende ein JPEG-, PNG- oder WebP-Bild.'), { status: 400, code: 'INVALID_IMAGE' })
  const buffer = Buffer.from(match[1], 'base64')
  if (!buffer.length || buffer.length > 12 * 1024 * 1024) {
    throw Object.assign(new Error('Das Bild ist leer oder größer als 12 MB.'), { status: 413, code: 'IMAGE_TOO_LARGE' })
  }
  return buffer
}

function configFromRequest(request: Request) {
  try {
    const raw = typeof request.body?.config === 'string' ? JSON.parse(request.body.config) : request.body?.config ?? request.body
    const normalized = raw && typeof raw === 'object' && !Array.isArray(raw) && !('style' in raw)
      ? {
          format: raw.format,
          variants: raw.variants,
          style: {
            artStyle: raw.artStyle,
            crop: raw.crop,
            colorMood: raw.colorMood,
            typeMood: raw.typeMood,
            intensity: raw.intensity ?? 'balanced',
            background: raw.background ?? 'paper',
          },
          ...((raw.petName || raw.name) ? {
            copy: {
              name: raw.petName ?? raw.name,
              subtitle: raw.subtitle ?? '',
              detail: raw.detail ?? '',
              quote: raw.quote ?? '',
            },
          } : {}),
        }
      : raw
    return generationConfigSchema.parse(normalized)
  } catch (error) {
    if (error instanceof ZodError) throw error
    throw Object.assign(new Error('Das Feld config enthält kein gültiges JSON.'), { status: 400, code: 'INVALID_CONFIG' })
  }
}

export function createApp(options: { config: ServerConfig; quota: QuotaStore; generator: ImageGenerator }) {
  const { config, quota, generator } = options
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(cors({
    origin(origin, done) {
      const allowed = !origin || config.allowedOrigins.some((entry) => {
        if (entry === origin) return true
        if (!entry.includes('*.')) return false
        const [protocol, hostPattern] = entry.split('://')
        try {
          const candidate = new URL(origin)
          return candidate.protocol === `${protocol}:` && candidate.hostname.endsWith(hostPattern.slice(1))
        } catch { return false }
      })
      if (allowed) return done(null, true)
      done(new Error('Origin nicht erlaubt.'))
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-User-Id', 'X-Lovable-Secret'],
  }))
  // A 12 MiB binary image expands to roughly 16 MiB as base64, plus JSON
  // framing. Multipart remains preferred, but the documented JSON fallback
  // must accept the same effective image ceiling.
  app.use(express.json({ limit: '18mb' }))
  app.use('/assets', express.static(path.resolve('lovable-assets'), { maxAge: '7d', immutable: true, fallthrough: false }))

  app.get('/health', (_request, response) => response.json({
    ok: true,
    service: 'petster-image-api',
    revision: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
  }))
  app.get('/api/v1/catalog', (_request, response) => response.json(publicCatalog()))

  const authenticate = createAuthMiddleware({
    mode: config.authMode,
    lovableSecret: config.lovableSecret,
    supabaseUrl: config.supabaseUrl,
  })
  const limiter = rateLimit({
    windowMs: 60_000,
    limit: config.limits.requestsPerMinute,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (request) => (request as AuthenticatedRequest).userId || 'anonymous',
    message: { error: { code: 'RATE_LIMITED', message: 'Zu viele Anfragen. Bitte warte kurz.' } },
  })

  app.get(['/api/v1/usage', '/v1/usage'], authenticate, async (request: AuthenticatedRequest, response, next) => {
    try {
      response.setHeader('Cache-Control', 'no-store')
      response.json(await quota.get(request.userId!))
    } catch (error) { next(error) }
  })

  app.post(['/api/v1/generations', '/v1/generate'], authenticate, limiter, upload.single('image'), async (request: AuthenticatedRequest, response, next) => {
    const requestId = randomUUID()
    let reservedImages = 0
    try {
      response.setHeader('Cache-Control', 'no-store')
      const image = imageFromRequest(request)
      const parsed = configFromRequest(request)
      const variants = parsed.variants ?? config.limits.maxVariants
      if (variants > config.limits.maxVariants) {
        response.status(400).json({ error: { code: 'TOO_MANY_VARIANTS', message: `Maximal ${config.limits.maxVariants} Varianten pro Anfrage.` }, requestId })
        return
      }

      const usage = await quota.reserve(request.userId!, variants)
      if (!usage) {
        response.status(429).json({
          error: { code: 'MONTHLY_LIMIT_REACHED', message: 'Dein monatliches Generierungslimit ist erreicht.' },
          usage: await quota.get(request.userId!), requestId,
        })
        return
      }
      reservedImages = variants
      const result = await generator.generate(image, parsed, variants)
      response.status(201).json({
        id: requestId,
        images: result.images,
        variants: result.images.map((image) => image.dataUrl),
        usage,
        upstreamRequestId: result.upstreamRequestId,
      })
    } catch (error) {
      if (reservedImages) await quota.release(request.userId!, reservedImages).catch(() => undefined)
      next(error)
    }
  })

  const frontendDirectory = path.resolve('dist')
  if (config.production && fs.existsSync(path.join(frontendDirectory, 'index.html'))) {
    app.use(express.static(frontendDirectory))
    app.use((request, response, next) => {
      if (request.method === 'GET' && request.accepts('html')) {
        response.sendFile(path.join(frontendDirectory, 'index.html'))
        return
      }
      next()
    })
  }

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
      response.status(400).json({ error: { code: 'INVALID_CONFIG', message: 'Die Customizing-Konfiguration ist ungültig.', details: error.issues } })
      return
    }
    if (error instanceof multer.MulterError) {
      response.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: { code: error.code, message: 'Der Bild-Upload ist ungültig oder zu groß.' } })
      return
    }
    const typed = error as Error & { status?: number; code?: string }
    const status = typed.status && typed.status >= 400 && typed.status < 600 ? typed.status : 500
    response.status(status).json({
      error: {
        code: typed.code || (status === 500 ? 'GENERATION_FAILED' : 'REQUEST_FAILED'),
        message: status === 500 && config.production ? 'Die Bildgenerierung ist fehlgeschlagen.' : typed.message,
      },
    })
  })
  return app
}
