import dotenv from 'dotenv'
import { createServer } from 'node:http'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { OpenAIImageGenerator } from './openai-images.js'
import { createQuotaStore } from './quota.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const config = loadConfig()
const quota = createQuotaStore(config.databaseUrl, config.limits, config.production)
await quota.initialize()

const generator = new OpenAIImageGenerator(config.openAiApiKey, config.openAiModel)
const server = createServer(createApp({ config, quota, generator }))

server.listen(config.port, '0.0.0.0', () => {
  console.log(`Petster Image API listening on port ${config.port}`)
})

async function shutdown() {
  server.close(async () => {
    await quota.close()
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
