import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { getDb } from '../db.js'
import { signToken, requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function publicUser(row) {
  return { id: row.id, email: row.email }
}

authRouter.post('/signup', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!isValidEmail(email) || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'A valid email and a password of at least 8 characters are required.' })
  }

  const db = await getDb()
  const normalizedEmail = email.trim().toLowerCase()
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'An account with that email already exists.' })
  }

  const id = randomUUID()
  const passwordHash = await bcrypt.hash(password, 10)
  const createdAt = Date.now()
  await db.query(
    'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)',
    [id, normalizedEmail, passwordHash, createdAt],
  )
  await db.query('INSERT INTO settings (user_id) VALUES ($1)', [id])

  const token = signToken(id)
  res.status(201).json({ token, user: { id, email: normalizedEmail } })
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!isValidEmail(email) || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const db = await getDb()
  const normalizedEmail = email.trim().toLowerCase()
  const result = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail])
  const user = result.rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Incorrect email or password.' })
  }

  const token = signToken(user.id)
  res.json({ token, user: publicUser(user) })
})

authRouter.get('/me', requireAuth, async (req, res) => {
  const db = await getDb()
  const result = await db.query('SELECT * FROM users WHERE id = $1', [req.userId])
  const user = result.rows[0]
  if (!user) return res.status(401).json({ error: 'User no longer exists.' })
  res.json({ user: publicUser(user) })
})
