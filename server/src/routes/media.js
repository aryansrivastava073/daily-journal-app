import { Router } from 'express'
import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { getDb } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

export const mediaRouter = Router()
mediaRouter.use(requireAuth)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
})

const KINDS = new Set(['image', 'video', 'audio'])

function toMediaMeta(row) {
  return {
    id: row.id,
    entryId: row.entry_id,
    kind: row.kind,
    mimeType: row.mime_type,
    fileName: row.file_name ?? undefined,
    durationSec: row.duration_sec ?? undefined,
    createdAt: Number(row.created_at),
  }
}

mediaRouter.post('/entries/:entryId/media', upload.single('file'), async (req, res) => {
  const { kind, durationSec } = req.body ?? {}
  if (!KINDS.has(kind)) {
    return res.status(400).json({ error: 'kind must be image, video, or audio.' })
  }
  if (!req.file) {
    return res.status(400).json({ error: 'A file is required.' })
  }

  const db = await getDb()
  const entryCheck = await db.query('SELECT id FROM entries WHERE id = $1 AND user_id = $2', [
    req.params.entryId,
    req.userId,
  ])
  if (entryCheck.rows.length === 0) {
    return res.status(404).json({ error: 'Entry not found.' })
  }

  const id = randomUUID()
  const createdAt = Date.now()
  await db.query(
    `INSERT INTO media (id, user_id, entry_id, kind, mime_type, file_name, duration_sec, data, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      id,
      req.userId,
      req.params.entryId,
      kind,
      req.file.mimetype,
      req.file.originalname || null,
      durationSec ? Number(durationSec) : null,
      req.file.buffer,
      createdAt,
    ],
  )

  res.status(201).json({
    id,
    entryId: req.params.entryId,
    kind,
    mimeType: req.file.mimetype,
    fileName: req.file.originalname || undefined,
    durationSec: durationSec ? Number(durationSec) : undefined,
    createdAt,
  })
})

mediaRouter.get('/entries/:entryId/media', async (req, res) => {
  const db = await getDb()
  const result = await db.query(
    `SELECT id, entry_id, kind, mime_type, file_name, duration_sec, created_at
     FROM media WHERE entry_id = $1 AND user_id = $2 ORDER BY created_at ASC`,
    [req.params.entryId, req.userId],
  )
  res.json(result.rows.map(toMediaMeta))
})

mediaRouter.get('/media/:id', async (req, res) => {
  const db = await getDb()
  const result = await db.query('SELECT * FROM media WHERE id = $1 AND user_id = $2', [
    req.params.id,
    req.userId,
  ])
  const row = result.rows[0]
  if (!row) return res.status(404).json({ error: 'Media not found.' })
  res.set('Content-Type', row.mime_type)
  res.send(row.data)
})

mediaRouter.delete('/media/:id', async (req, res) => {
  const db = await getDb()
  await db.query('DELETE FROM media WHERE id = $1 AND user_id = $2', [req.params.id, req.userId])
  res.status(204).end()
})
