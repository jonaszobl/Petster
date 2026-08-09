export type ServerConfig = ReturnType<typeof loadConfig>

function positiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function loadConfig(env = process.env) {
  const production = env.NODE_ENV === 'production'
  const authMode: 'development' | 'supabase' = env.AUTH_MODE
    ? env.AUTH_MODE === 'development' ? 'development' : 'supabase'
    : production ? 'supabase' : 'development'
  if (production && authMode === 'development') throw new Error('AUTH_MODE=development ist in Produktion nicht erlaubt.')
  if (production && !env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY ist erforderlich.')
  if (authMode === 'supabase' && !env.SUPABASE_URL) throw new Error('SUPABASE_URL ist für AUTH_MODE=supabase erforderlich.')

  return {
    production,
    port: positiveInt(env.PORT, 8787),
    openAiApiKey: env.OPENAI_API_KEY || 'test-key',
    openAiModel: env.OPENAI_IMAGE_MODEL || 'gpt-image-2',
    databaseUrl: env.DATABASE_URL,
    authMode,
    supabaseUrl: env.SUPABASE_URL,
    allowedOrigins: (env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:4173')
      .split(',').map((value) => value.trim()).filter(Boolean),
    limits: {
      requests: positiveInt(env.MONTHLY_GENERATION_LIMIT, 10),
      images: positiveInt(env.MONTHLY_IMAGE_LIMIT, 40),
      maxVariants: Math.min(4, positiveInt(env.MAX_VARIANTS, 4)),
      requestsPerMinute: positiveInt(env.REQUESTS_PER_MINUTE, 4),
    },
  }
}
