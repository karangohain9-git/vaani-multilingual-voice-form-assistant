import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleExtract, handleSubmit } from './server/apiHandler.ts'

function apiServerPlugin(): Plugin {
  return {
    name: 'vaani-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/extract') && req.method === 'POST') {
          const chunks: Buffer[] = []
          req.on('data', (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          })
          req.on('end', async () => {
            try {
              const body = Buffer.concat(chunks).toString('utf-8')
              const parsed = JSON.parse(body || '{}')
              const apiKeyFromHeader = req.headers['x-gemini-api-key'] as string | undefined
              const result = await handleExtract(parsed, apiKeyFromHeader)
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify(result))
            } catch (err: any) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ error: err?.message || 'Server error' }))
            }
          })
          return
        }

        if (req.url?.startsWith('/api/submit') && req.method === 'POST') {
          const chunks: Buffer[] = []
          req.on('data', (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          })
          req.on('end', async () => {
            try {
              const body = Buffer.concat(chunks).toString('utf-8')
              const parsed = JSON.parse(body || '{}')
              const result = await handleSubmit(parsed)
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify(result))
            } catch (err: any) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ error: err?.message || 'Server error' }))
            }
          })
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    apiServerPlugin(),
  ],
})
