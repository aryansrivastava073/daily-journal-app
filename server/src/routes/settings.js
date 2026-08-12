import { Router } from 'express'
import { getDb } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

export const settingsRouter = Router()
settingsRouter.use(requireAuth)

function toSettings(row) {
  return {
    themeMode: row.theme_mode,
    calendarView: row.calendar_view,
    weekStartsOn: row.week_starts_on,
    lastQuoteId: row.last_quote_id ?? undefined,
    lastManifestationId: row.last_manifestation_id ?? undefined,
  }
}

settingsRouter.get('/', async (req, res) => {
  const db = await getDb()
  const result = await db.query('SELECT * FROM settings WHERE user_id = $1', [req.userId])
  if (result.rows.length === 0) {
    await db.query('INSERT INTO settings (user_id) VALUES ($1)', [req.userId])
    return res.json(toSettings({ theme_mode: 'light', calendar_view: 'month', week_starts_on: 1 }))
  }
  res.json(toSettings(result.rows[0]))
})

settingsRouter.put('/', async (req, res) => {
  const { themeMode, calendarView, weekStartsOn, lastQuoteId, lastManifestationId } = req.body ?? {}
  const db = await getDb()

  await db.query('INSERT INTO settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [
    req.userId,
  ])
  const current = (await db.query('SELECT * FROM settings WHERE user_id = $1', [req.userId])).rows[0]

  const next = {
    theme_mode: themeMode ?? current.theme_mode,
    calendar_view: calendarView ?? current.calendar_view,
    week_starts_on: weekStartsOn ?? current.week_starts_on,
    last_quote_id: lastQuoteId ?? current.last_quote_id,
    last_manifestation_id: lastManifestationId ?? current.last_manifestation_id,
  }

  await db.query(
    `UPDATE settings SET theme_mode = $1, calendar_view = $2, week_starts_on = $3,
     last_quote_id = $4, last_manifestation_id = $5 WHERE user_id = $6`,
    [next.theme_mode, next.calendar_view, next.week_starts_on, next.last_quote_id, next.last_manifestation_id, req.userId],
  )
  res.json(toSettings(next))
})
