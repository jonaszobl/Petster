import sharp from 'sharp'
import { formats } from './catalog.js'
import { buildPrompt } from './prompt.js'
import type { GenerationConfig } from './schema.js'

export type GeneratedImage = { id: string; mimeType: 'image/webp'; dataUrl: string }
export type GenerationResult = { images: GeneratedImage[]; upstreamRequestId?: string }

export interface ImageGenerator {
  generate(image: Buffer, config: GenerationConfig, variants: number): Promise<GenerationResult>
}

type OpenAIImageResponse = {
  data?: Array<{ b64_json?: string }>
  error?: { message?: string; code?: string }
}

export class OpenAIImageGenerator implements ImageGenerator {
  constructor(
    private readonly apiKey: string,
    private readonly model = 'gpt-image-2',
    private readonly timeoutMs = 170_000,
  ) {}

  async generate(input: Buffer, config: GenerationConfig, variants: number): Promise<GenerationResult> {
    let normalized: Buffer
    try {
      normalized = await sharp(input, { failOn: 'error' })
        .rotate()
        .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 88, mozjpeg: true })
        .toBuffer()
    } catch {
      throw Object.assign(new Error('Das hochgeladene Bild konnte nicht verarbeitet werden.'), { status: 400, code: 'INVALID_IMAGE' })
    }

    const form = new FormData()
    form.append('model', this.model)
    const imageBytes = normalized.buffer.slice(normalized.byteOffset, normalized.byteOffset + normalized.byteLength) as ArrayBuffer
    form.append('image[]', new Blob([imageBytes], { type: 'image/jpeg' }), 'pet-reference.jpg')
    form.append('prompt', buildPrompt(config))
    form.append('n', String(variants))
    form.append('size', formats[config.format].outputSize)
    form.append('quality', 'low')
    form.append('output_format', 'webp')
    form.append('output_compression', '82')
    form.append('moderation', 'auto')

    const response = await this.requestWithRetry(form)
    const payload = await response.json() as OpenAIImageResponse
    if (!response.ok) {
      const message = payload.error?.message || `OpenAI API-Fehler (${response.status})`
      const error = new Error(message) as Error & { status?: number; code?: string }
      error.status = response.status
      error.code = payload.error?.code
      throw error
    }

    const images = (payload.data ?? []).flatMap((item, index) => item.b64_json ? [{
      id: `variant-${index + 1}`,
      mimeType: 'image/webp' as const,
      dataUrl: `data:image/webp;base64,${item.b64_json}`,
    }] : [])
    if (images.length !== variants) throw new Error(`Die API hat ${images.length} statt ${variants} Bildern zurückgegeben.`)
    return { images, upstreamRequestId: response.headers.get('x-request-id') || undefined }
  }

  private async requestWithRetry(form: FormData) {
    let lastResponse: Response | undefined
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs)
      try {
        const response = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.apiKey}` },
          body: form,
          signal: controller.signal,
        })
        lastResponse = response
        if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
          await response.arrayBuffer()
          const retryAfter = Math.min(5, Number(response.headers.get('retry-after') || 1))
          await new Promise((resolve) => setTimeout(resolve, Math.max(1, retryAfter) * 1000))
          continue
        }
        return response
      } finally {
        clearTimeout(timeout)
      }
    }
    if (!lastResponse) throw new Error('Die OpenAI API konnte nicht erreicht werden.')
    return lastResponse
  }
}
