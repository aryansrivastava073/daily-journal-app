import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { getDb } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

export const backupRouter = Router()
backupRouter.use(requireAuth)

function bufferToDataUrl(buffer, mimeType) {
  return `data:${mimeType};base64,${buffer.toString('base64')}`
}

function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Buffer.from(base64, 'base64')
}

backupRouter.get('/export', async (req, res) => {
  const db = await getDb()
  const [entries, habits, habitLogs, todos, settings, media] = await Promise.all([
    db.query('SELECT * FROM entries WHERE user_id = $1', [req.userId]),
    db.query('SELECT * FROM habits WHERE user_id = $1', [req.userId]),
    db.query(
      'SELECT hl.* FROM habit_logs hl JOIN habits h ON h.id = hl.habit_id WHERE h.user_id = $1',
      [req.userId],
    ),
    db.query('SELECT * FROM todos WHERE user_id = $1', [req.userId]),
    db.query('SELECT * FROM settings WHERE user_id = $1', [req.userId]),
    db.query('SELECT * FROM media WHERE user_id = $1', [req.userId]),
  ])

  res.json({
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    entries: entries.rows.map((r) => ({
      id: r.id,
      date: r.date,
      title: r.title,
      body: r.body,
      mood: r.mood,
      tags: r.tags ?? [],
      createdAt: Number(r.created_at),
      updatedAt: Number(r.updated_at),
    })),
    habits: habits.rows.map((r) => ({
      id: r.id,
      name: r.name,
      color: r.color ?? undefined,
      archived: r.archived,
      createdAt: Number(r.created_at),
    })),
    habitLogs: habitLogs.rows.map((r) => ({
      habitId: r.habit_id,
      date: r.date,
      completedAt: Number(r.completed_at),
    })),
    todos: todos.rows.map((r) => ({
      id: r.id,
      text: r.text,
      done: r.done,
      tag: r.tag ?? undefined,
      createdAt: Number(r.created_at),
      completedAt: r.completed_at ? Number(r.completed_at) : undefined,
    })),
    settings: settings.rows[0]
      ? {
          themeMode: settings.rows[0].theme_mode,
          calendarView: settings.rows[0].calendar_view,
          weekStartsOn: settings.rows[0].week_starts_on,
          lastQuoteId: settings.rows[0].last_quote_id ?? undefined,
          lastManifestationId: settings.rows[0].last_manifestation_id ?? undefined,
        }
      : { themeMode: 'light', calendarView: 'month', weekStartsOn: 1 },
    media: media.rows.map((r) => ({
      id: r.id,
      entryId: r.entry_id,
      kind: r.kind,
      mimeType: r.mime_type,
      fileName: r.file_name ?? undefined,
      durationSec: r.duration_sec ?? undefined,
      createdAt: Number(r.created_at),
      dataUrl: bufferToDataUrl(r.data, r.mime_type),
    })),
  })
})

function isBackupShape(value) {
  return (
    value &&
    value.schemaVersion === 1 &&
    typeof value.exportedAt === 'string' &&
    Array.isArray(value.entries) &&
    Array.isArray(value.habits) &&
    Array.isArray(value.habitLogs) &&
    Array.isArray(value.todos) &&
    Array.isArray(value.media) &&
    typeof value.settings === 'object' &&
    value.settings !== null
  )
}

backupRouter.post('/import', async (req, res) => {
  const backup = req.body
  if (!isBackupShape(backup)) {
    return res.status(400).json({ error: 'Invalid backup file.' })
  }

  const db = await getDb()
  try {
    await db.transaction(async (tx) => {
      await tx.query('DELETE FROM entries WHERE user_id = $1', [req.userId])
      await tx.query('DELETE FROM habits WHERE user_id = $1', [req.userId])
      await tx.query('DELETE FROM todos WHERE user_id = $1', [req.userId])

      const entryIdMap = new Map()
      const habitIdMap = new Map()

      for (const entry of backup.entries) {
        const id = randomUUID()
        entryIdMap.set(entry.id, id)
        await tx.query(
          `INSERT INTO entries (id, user_id, date, title, body, mood, tags, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            id,
            req.userId,
            entry.date,
            entry.title ?? '',
            entry.body ?? '',
            entry.mood ?? null,
            entry.tags ?? [],
            entry.createdAt,
            entry.updatedAt,
          ],
        )
      }

      for (const habit of backup.habits) {
        const id = randomUUID()
        habitIdMap.set(habit.id, id)
        await tx.query(
          'INSERT INTO habits (id, user_id, name, color, archived, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [id, req.userId, habit.name, habit.color ?? null, habit.archived ?? false, habit.createdAt],
        )
      }

      for (const log of backup.habitLogs) {
        const habitId = habitIdMap.get(log.habitId)
        if (!habitId) continue
        await tx.query(
          'INSERT INTO habit_logs (habit_id, date, completed_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [habitId, log.date, log.completedAt],
        )
      }

      for (const todo of backup.todos) {
        await tx.query(
          'INSERT INTO todos (id, user_id, text, done, tag, created_at, completed_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [randomUUID(), req.userId, todo.text, todo.done, todo.tag ?? null, todo.createdAt, todo.completedAt ?? null],
        )
      }

      await tx.query(
        `INSERT INTO settings (user_id, theme_mode, calendar_view, week_starts_on, last_quote_id, last_manifestation_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE SET theme_mode = $2, calendar_view = $3, week_starts_on = $4,
           last_quote_id = $5, last_manifestation_id = $6`,
        [
          req.userId,
          backup.settings.themeMode ?? 'light',
          backup.settings.calendarView ?? 'month',
          backup.settings.weekStartsOn ?? 1,
          backup.settings.lastQuoteId ?? null,
          backup.settings.lastManifestationId ?? null,
        ],
      )

      for (const media of backup.media) {
        const entryId = entryIdMap.get(media.entryId)
        if (!entryId) continue
        await tx.query(
          `INSERT INTO media (id, user_id, entry_id, kind, mime_type, file_name, duration_sec, data, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            randomUUID(),
            req.userId,
            entryId,
            media.kind,
            media.mimeType,
            media.fileName ?? null,
            media.durationSec ?? null,
            dataUrlToBuffer(media.dataUrl),
            media.createdAt,
          ],
        )
      }
    })
  } catch (err) {
    console.error('Backup import failed:', err)
    return res.status(400).json({ error: 'Failed to import backup: ' + err.message })
  }

  res.json({ ok: true })
})
