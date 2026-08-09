import type { NextFunction, Request, Response } from 'express'
import { timingSafeEqual } from 'node:crypto'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export type AuthenticatedRequest = Request & { userId?: string }

export type AuthOptions = {
  mode: 'lovable' | 'supabase' | 'development'
  lovableSecret?: string
  supabaseUrl?: string
}

function secretsMatch(actual: string | undefined, expected: string | undefined) {
  if (!actual || !expected) return false
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
}

export function createAuthMiddleware(options: AuthOptions) {
  const issuer = options.supabaseUrl ? `${options.supabaseUrl.replace(/\/$/, '')}/auth/v1` : undefined
  const jwks = issuer ? createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`)) : undefined

  return async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    if (options.mode === 'development') {
      request.userId = request.header('x-user-id')?.trim() || 'local-demo-user'
      next()
      return
    }

    if (options.mode === 'lovable') {
      const userId = request.header('x-user-id')?.trim()
      if (!userId || userId.length > 128 || !secretsMatch(request.header('x-lovable-secret'), options.lovableSecret)) {
        response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Eine gültige Lovable-Cloud-Anfrage ist erforderlich.' } })
        return
      }
      request.userId = userId
      next()
      return
    }

    const token = /^Bearer\s+(.+)$/i.exec(request.header('authorization') || '')?.[1]
    if (!token || !issuer || !jwks) {
      response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Eine gültige Anmeldung ist erforderlich.' } })
      return
    }

    try {
      const { payload } = await jwtVerify(token, jwks, { issuer, audience: 'authenticated' })
      if (!payload.sub) throw new Error('Token enthält keine User-ID.')
      request.userId = payload.sub
      next()
    } catch {
      response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Die Anmeldung ist ungültig oder abgelaufen.' } })
    }
  }
}
