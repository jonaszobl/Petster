import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { after, before, test } from 'node:test'
import express from 'express'
import { createAuthMiddleware, type AuthenticatedRequest } from './auth.js'

const app = express()
app.get('/protected', createAuthMiddleware({ mode: 'lovable', lovableSecret: 'test-proxy-secret' }), (request: AuthenticatedRequest, response) => {
  response.json({ userId: request.userId })
})

const server = createServer(app)
let baseUrl = ''

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Testserver konnte nicht gestartet werden.')
  baseUrl = `http://127.0.0.1:${address.port}`
})

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('accepts a signed Lovable Cloud proxy request', async () => {
  const response = await fetch(`${baseUrl}/protected`, {
    headers: { 'x-lovable-secret': 'test-proxy-secret', 'x-user-id': 'lovable-user-42' },
  })
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { userId: 'lovable-user-42' })
})

test('rejects missing or invalid Lovable proxy credentials', async () => {
  const missing = await fetch(`${baseUrl}/protected`)
  assert.equal(missing.status, 401)

  const invalid = await fetch(`${baseUrl}/protected`, {
    headers: { 'x-lovable-secret': 'wrong-secret', 'x-user-id': 'lovable-user-42' },
  })
  assert.equal(invalid.status, 401)
})
