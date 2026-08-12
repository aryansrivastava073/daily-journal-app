import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { getDb } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

export const entriesRouter = Router()
entriesRouter.use(requireAuth)

function toEntry(row) {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    body: row.body,
    mood: row.mood,
    tags: row.tags ?? [],
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  }
}

entriesRouter.get('/', async (req, res) => {
  const { from, to } = req.query
  const db = await getDb()
  const result =
    from && to
      ? await db.query(
          'SELECT * FROM entries WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date ASC',
          [req.userId, from, to],
        )
      : await db.query('SELECT * FROM entries WHERE user_id = $1 ORDER BY date ASC', [req.userId])
  res.json(result.rows.map(toEntry))
})

entriesRouter.get('/:date', async (req, res) => {
  const db = await getDb()
  const result = await db.query('SELECT * FROM entries WHERE user_id = $1 AND date = $2', [
    req.userId,
    req.params.date,
  ])
  if (result.rows.length === 0) return res.status(404).json({ error: 'No entry for that date.' })
  res.json(toEntry(result.rows[0]))
})

entriesRouter.put('/:date', async (req, res) => {
  const { title = '', body = '', mood = null, tags = [] } = req.body ?? {}
  if (typeof title !== 'string' || typeof body !== 'string') {
    return res.status(400).json({ error: 'title and body must be strings.' })
  }

  const db = await getDb()
  const now = Date.now()
  const existing = await db.query('SELECT id, created_at FROM entries WHERE user_id = $1 AND date = $2', [
    req.userId,
    req.params.date,
  ])

  const id = existing.rows[0]?.id ?? randomUUID()
  const createdAt = existing.rows[0]?.created_at ?? now
  await db.query(
    `INSERT INTO entries (id, user_id, date, title, body, mood, tags, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (user_id, date)
     DO UPDATE SET title = $4, body = $5, mood = $6, tags = $7, updated_at = $9`,
    [id, req.userId, req.params.date, title, body, mood, tags, createdAt, now],
  )

  const result = await db.query('SELECT * FROM entries WHERE id = $1', [id])
  res.json(toEntry(result.rows[0]))
})

entriesRouter.delete('/:id', async (req, res) => {
  const db = await getDb()
  await db.query('DELETE FROM entries WHERE id = $1 AND user_id = $2', [req.params.id, req.userId])
  res.status(204).end()
})
