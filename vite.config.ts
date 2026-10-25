import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'

type ApiRequest = IncomingMessage & { body?: unknown }
type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse
  json: (data: unknown) => void
}

// Runs the Vercel-style functions in /api during `npm run dev`, so one command
// starts the whole site. In production Vercel serves /api itself.
function devApi(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      Object.assign(process.env, loadEnv('development', process.cwd(), ''))

      server.middlewares.use('/api', async (req, res, next) => {
        const name = (req.url ?? '').split('?')[0].replace(/^\/|\/$/g, '')
        if (!/^[a-z0-9-]+$/.test(name)) return next()

        const request = req as ApiRequest
        const response = res as ApiResponse
        response.status = (code) => {
          res.statusCode = code
          return response
        }
        response.json = (data) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        }

        const raw = await new Promise<string>((resolve) => {
          let data = ''
          req.on('data', (chunk) => (data += chunk))
          req.on('end', () => resolve(data))
        })
        try {
          request.body = raw ? JSON.parse(raw) : {}
        } catch {
          request.body = {}
        }

        try {
          const mod = await server.ssrLoadModule(`/api/${name}.js`)
          await mod.default(request, response)
        } catch (err) {
          console.error(err)
          response.status(500).json({ message: 'API error.' })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
})
