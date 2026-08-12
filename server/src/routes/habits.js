import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { getDb } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

export const habitsRouter = Router()
habitsRouter.use(requireAuth)

habitsRouter.get('/', async (req, res) => {
  const db = await getDb()
  const habitsResult = await db.query(
    'SELECT * FROM habits WHERE user_id = $1 AND archived = false ORDER BY created_at ASC',
    [req.userId],
  )
  const logsResult = await db.query(
    `SELECT hl.habit_id, hl.date FROM habit_logs hl
     JOIN habits h ON h.id = hl.habit_id
     WHERE h.user_id = $1`,
    [req.userId],
  )

  const datesByHabit = new Map()
  for (const log of logsResult.rows) {
    const list = datesByHabit.get(log.habit_id) ?? []
    list.push(log.date)
    datesByHabit.set(log.habit_id, list)
  }

  res.json(
    habitsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      color: row.color ?? undefined,
      archived: row.archived,
      createdAt: Number(row.created_at),
      logDates: datesByHabit.get(row.id) ?? [],
    })),
  )
})

habitsRouter.post('/', async (req, res) => {
  const { name } = req.body ?? {}
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required.' })
  }

  const db = await getDb()
  const id = randomUUID()
  const createdAt = Date.now()
  await db.query('INSERT INTO habits (id, user_id, name, created_at) VALUES ($1, $2, $3, $4)', [
    id,
    req.userId,
    name.trim(),
    createdAt,
  ])
  res.status(201).json({ id, name: name.trim(), archived: false, createdAt, logDates: [] })
})

habitsRouter.post('/:id/toggle', async (req, res) => {
  const { date, completed } = req.body ?? {}
  if (typeof date !== 'string' || typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'date (string) and completed (boolean) are required.' })
  }

  const db = await getDb()
  const habitCheck = await db.query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [
    req.params.id,
    req.userId,
  ])
  if (habitCheck.rows.length === 0) return res.status(404).json({ error: 'Habit not found.' })

  if (completed) {
    await db.query(
      `INSERT INTO habit_logs (habit_id, date, completed_at) VALUES ($1, $2, $3)
       ON CONFLICT (habit_id, date) DO NOTHING`,
      [req.params.id, date, Date.now()],
    )
  } else {
    await db.query('DELETE FROM habit_logs WHERE habit_id = $1 AND date = $2', [req.params.id, date])
  }
  res.json({ ok: true })
})

habitsRouter.delete('/:id', async (req, res) => {
  const db = await getDb()
  await db.query('DELETE FROM habits WHERE id = $1 AND user_id = $2', [req.params.id, req.userId])
  res.status(204).end()
})
