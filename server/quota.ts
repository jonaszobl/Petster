import { Pool } from 'pg'

export type Usage = {
  periodStart: string
  requestsUsed: number
  requestsLimit: number
  imagesUsed: number
  imagesLimit: number
  used: number
  limit: number
  remaining: number
  resetsAt: string
}

export interface QuotaStore {
  initialize(): Promise<void>
  get(userId: string): Promise<Usage>
  reserve(userId: string, images: number): Promise<Usage | null>
  release(userId: string, images: number): Promise<void>
  close(): Promise<void>
}

type Limits = { requests: number; images: number }

function periodStart() {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`
}

function usage(limits: Limits, requestsUsed = 0, imagesUsed = 0): Usage {
  const start = periodStart()
  const [year, month] = start.split('-').map(Number)
  const resetsAt = new Date(Date.UTC(year, month, 1)).toISOString()
  return {
    periodStart: start,
    requestsUsed,
    requestsLimit: limits.requests,
    imagesUsed,
    imagesLimit: limits.images,
    used: requestsUsed,
    limit: limits.requests,
    remaining: Math.max(0, limits.requests - requestsUsed),
    resetsAt,
  }
}

export class MemoryQuotaStore implements QuotaStore {
  private counters = new Map<string, { requests: number; images: number }>()
  constructor(private readonly limits: Limits) {}
  async initialize() {}
  async get(userId: string) {
    const value = this.counters.get(`${userId}:${periodStart()}`)
    return usage(this.limits, value?.requests, value?.images)
  }
  async reserve(userId: string, images: number) {
    const key = `${userId}:${periodStart()}`
    const value = this.counters.get(key) ?? { requests: 0, images: 0 }
    if (value.requests + 1 > this.limits.requests || value.images + images > this.limits.images) return null
    const next = { requests: value.requests + 1, images: value.images + images }
    this.counters.set(key, next)
    return usage(this.limits, next.requests, next.images)
  }
  async release(userId: string, images: number) {
    const key = `${userId}:${periodStart()}`
    const value = this.counters.get(key)
    if (!value) return
    this.counters.set(key, { requests: Math.max(0, value.requests - 1), images: Math.max(0, value.images - images) })
  }
  async close() {}
}

export class PostgresQuotaStore implements QuotaStore {
  private pool: Pool
  constructor(databaseUrl: string, private readonly limits: Limits) {
    this.pool = new Pool({ connectionString: databaseUrl })
  }
  async initialize() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS user_usage (
        user_id TEXT NOT NULL,
        period_start DATE NOT NULL,
        request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
        image_count INTEGER NOT NULL DEFAULT 0 CHECK (image_count >= 0),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, period_start)
      )
    `)
  }
  async get(userId: string) {
    const result = await this.pool.query<{ request_count: number; image_count: number }>(
      'SELECT request_count, image_count FROM user_usage WHERE user_id = $1 AND period_start = $2',
      [userId, periodStart()],
    )
    const row = result.rows[0]
    return usage(this.limits, row?.request_count, row?.image_count)
  }
  async reserve(userId: string, images: number) {
    const result = await this.pool.query<{ request_count: number; image_count: number }>(`
      INSERT INTO user_usage (user_id, period_start, request_count, image_count)
      VALUES ($1, $2, 1, $3)
      ON CONFLICT (user_id, period_start) DO UPDATE SET
        request_count = user_usage.request_count + 1,
        image_count = user_usage.image_count + EXCLUDED.image_count,
        updated_at = NOW()
      WHERE user_usage.request_count + 1 <= $4
        AND user_usage.image_count + EXCLUDED.image_count <= $5
      RETURNING request_count, image_count
    `, [userId, periodStart(), images, this.limits.requests, this.limits.images])
    const row = result.rows[0]
    return row ? usage(this.limits, row.request_count, row.image_count) : null
  }
  async release(userId: string, images: number) {
    await this.pool.query(`
      UPDATE user_usage SET
        request_count = GREATEST(0, request_count - 1),
        image_count = GREATEST(0, image_count - $3),
        updated_at = NOW()
      WHERE user_id = $1 AND period_start = $2
    `, [userId, periodStart(), images])
  }
  async close() { await this.pool.end() }
}

export function createQuotaStore(databaseUrl: string | undefined, limits: Limits, production: boolean): QuotaStore {
  if (databaseUrl) return new PostgresQuotaStore(databaseUrl, limits)
  if (production) throw new Error('DATABASE_URL ist in Produktion erforderlich.')
  return new MemoryQuotaStore(limits)
}
