import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { after, before, test } from 'node:test'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import type { ImageGenerator } from './openai-images.js'
import { MemoryQuotaStore } from './quota.js'

const config = loadConfig({
  NODE_ENV: 'test',
  AUTH_MODE: 'development',
  MONTHLY_GENERATION_LIMIT: '2',
  MONTHLY_IMAGE_LIMIT: '4',
  MAX_VARIANTS: '2',
  REQUESTS_PER_MINUTE: '20',
})
const quota = new MemoryQuotaStore(config.limits)
const generator: ImageGenerator = {
  async generate(_image, _config, variants) {
    return {
      images: Array.from({ length: variants }, (_, index) => ({
        id: `variant-${index + 1}`,
        mimeType: 'image/webp' as const,
        dataUrl: 'data:image/webp;base64,dGVzdA==',
      })),
      upstreamRequestId: 'mock-openai-request',
    }
  },
}
const server = createServer(createApp({ config, quota, generator }))
let baseUrl = ''

before(async () => {
  await quota.initialize()
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Testserver konnte nicht gestartet werden.')
  baseUrl = `http://127.0.0.1:${address.port}`
})

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  await quota.close()
})

const validBody = {
  image: 'data:image/png;base64,iVBORw0KGgo=',
  config: {
    format: 'a3',
    variants: 2,
    style: { artStyle: 'watercolor', crop: 'balanced', colorMood: 'warm', typeMood: 'elegant' },
  },
}

test('publishes a Lovable-ready catalog', async () => {
  const response = await fetch(`${baseUrl}/api/v1/catalog`)
  const body = await response.json() as { formats: unknown[]; styles: unknown[] }
  assert.equal(response.status, 200)
  assert.equal(body.formats.length, 3)
  assert.equal(body.styles.length, 5)
})

test('accepts the multipart request used by Lovable', async () => {
  const form = new FormData()
  form.append('image', new Blob([new TextEncoder().encode('mock-image')], { type: 'image/jpeg' }), 'pet.jpg')
  form.append('config', JSON.stringify(validBody.config))
  const response = await fetch(`${baseUrl}/api/v1/generations`, {
    method: 'POST', headers: { 'x-user-id': 'multipart-user' }, body: form,
  })
  const body = await response.json() as { images: unknown[] }
  assert.equal(response.status, 201)
  assert.equal(body.images.length, 2)
})

test('supports the Lovable proxy endpoint aliases', async () => {
  const usageResponse = await fetch(`${baseUrl}/v1/usage`, {
    headers: { 'x-user-id': 'lovable-alias-user' },
  })
  assert.equal(usageResponse.status, 200)

  const response = await fetch(`${baseUrl}/v1/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-user-id': 'lovable-alias-user' },
    body: JSON.stringify(validBody),
  })
  const body = await response.json() as { images: unknown[] }
  assert.equal(response.status, 201)
  assert.equal(body.images.length, 2)
})

test('generates images and applies persistent monthly limits', async () => {
  for (let index = 0; index < 2; index += 1) {
    const response = await fetch(`${baseUrl}/api/v1/generations`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-user-id': 'quota-test-user' }, body: JSON.stringify(validBody),
    })
    const body = await response.json() as { images: unknown[]; usage: { requestsUsed: number } }
    assert.equal(response.status, 201)
    assert.equal(body.images.length, 2)
    assert.equal(body.usage.requestsUsed, index + 1)
  }
  const blocked = await fetch(`${baseUrl}/api/v1/generations`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-user-id': 'quota-test-user' }, body: JSON.stringify(validBody),
  })
  const blockedBody = await blocked.json() as { error: { code: string } }
  assert.equal(blocked.status, 429)
  assert.equal(blockedBody.error.code, 'MONTHLY_LIMIT_REACHED')
})

test('rejects untrusted customizing values', async () => {
  const response = await fetch(`${baseUrl}/api/v1/generations`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-user-id': 'validation-user' },
    body: JSON.stringify({ ...validBody, config: { ...validBody.config, style: { ...validBody.config.style, artStyle: 'arbitrary-prompt' } } }),
  })
  const body = await response.json() as { error: { code: string } }
  assert.equal(response.status, 400)
  assert.equal(body.error.code, 'INVALID_CONFIG')
})
