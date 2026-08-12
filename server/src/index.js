import express from 'express'
import cors from 'cors'
import { migrate } from './db.js'
import { authRouter } from './routes/auth.js'
import { entriesRouter } from './routes/entries.js'
import { mediaRouter } from './routes/media.js'
import { habitsRouter } from './routes/habits.js'
import { todosRouter } from './routes/todos.js'
import { settingsRouter } from './routes/settings.js'
import { aiRouter } from './routes/ai.js'
import { backupRouter } from './routes/backup.js'

const app = express()
const PORT = process.env.PORT || 4000
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error(`Origin ${origin} is not allowed`))
    },
  }),
)
app.use(express.json({ limit: '2mb' }))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRouter)
app.use('/api/entries', entriesRouter)
app.use('/api', mediaRouter)
app.use('/api/habits', habitsRouter)
app.use('/api/todos', todosRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/ai', aiRouter)
app.use('/api/backup', backupRouter)

app.use((err, req, res, _next) => {
  if (err && err.message?.startsWith('Origin')) {
    return res.status(403).json({ error: err.message })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

async function main() {
  await migrate()
  app.listen(PORT, () => {
    console.log(`dusk server listening on port ${PORT}`)
  })
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
