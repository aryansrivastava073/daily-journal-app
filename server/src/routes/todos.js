import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { getDb } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

export const todosRouter = Router()
todosRouter.use(requireAuth)

function toTodo(row) {
  return {
    id: row.id,
    text: row.text,
    done: row.done,
    tag: row.tag ?? undefined,
    createdAt: Number(row.created_at),
    completedAt: row.completed_at ? Number(row.completed_at) : undefined,
  }
}

todosRouter.get('/', async (req, res) => {
  const db = await getDb()
  const result = await db.query('SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at ASC', [
    req.userId,
  ])
  res.json(result.rows.map(toTodo))
})

todosRouter.post('/', async (req, res) => {
  const { text, tag } = req.body ?? {}
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required.' })
  }

  const db = await getDb()
  const id = randomUUID()
  const createdAt = Date.now()
  await db.query('INSERT INTO todos (id, user_id, text, tag, created_at) VALUES ($1, $2, $3, $4, $5)', [
    id,
    req.userId,
    text.trim(),
    tag || null,
    createdAt,
  ])
  res.status(201).json({ id, text: text.trim(), tag: tag || undefined, done: false, createdAt })
})

todosRouter.put('/:id', async (req, res) => {
  const { done } = req.body ?? {}
  if (typeof done !== 'boolean') {
    return res.status(400).json({ error: 'done (boolean) is required.' })
  }

  const db = await getDb()
  const completedAt = done ? Date.now() : null
  await db.query('UPDATE todos SET done = $1, completed_at = $2 WHERE id = $3 AND user_id = $4', [
    done,
    completedAt,
    req.params.id,
    req.userId,
  ])
  const result = await db.query('SELECT * FROM todos WHERE id = $1 AND user_id = $2', [
    req.params.id,
    req.userId,
  ])
  if (result.rows.length === 0) return res.status(404).json({ error: 'Todo not found.' })
  res.json(toTodo(result.rows[0]))
})

todosRouter.delete('/:id', async (req, res) => {
  const db = await getDb()
  await db.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [req.params.id, req.userId])
  res.status(204).end()
})
