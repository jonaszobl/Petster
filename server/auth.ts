import type { NextFunction, Request, Response } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export type AuthenticatedRequest = Request & { userId?: string }

export type AuthOptions = {
  mode: 'supabase' | 'development'
  supabaseUrl?: string
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
