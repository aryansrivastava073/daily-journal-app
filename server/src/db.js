import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCHEMA_SQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')

let implPromise

function wrapPgPool(pool) {
  return {
    query: (text, params) => pool.query(text, params),
    async transaction(fn) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const result = await fn({ query: (text, params) => client.query(text, params) })
        await client.query('COMMIT')
        return result
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      } finally {
        client.release()
      }
    },
  }
}

function wrapPglite(db) {
  return {
    query: (text, params) => db.query(text, params),
    transaction: (fn) => db.transaction((tx) => fn({ query: (text, params) => tx.query(text, params) })),
  }
}

async function createImpl() {
  if (process.env.DATABASE_URL) {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
    })
    return wrapPgPool(pool)
  }

  const { PGlite } = await import('@electric-sql/pglite')
  const dataDir = process.env.PGLITE_DATA_DIR ?? path.join(__dirname, '..', '.pglite-data')
  const db = await PGlite.create({ dataDir })
  return wrapPglite(db)
}

export function getDb() {
  implPromise ??= createImpl()
  return implPromise
}

export async function migrate() {
  const db = await getDb()
  for (const statement of SCHEMA_SQL.split(';').map((s) => s.trim()).filter(Boolean)) {
    await db.query(statement)
  }
}
