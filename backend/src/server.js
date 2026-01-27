import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import pg from 'pg'
import pgSession from 'connect-pg-simple'
import authRouter from './routes/auth.js'
import { getDatabaseUrl } from './db/databaseUrl.js'
import prisma from './db/prisma.js'

const app = express()
const port = process.env.PORT || 4000

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  }),
)
app.use(express.json())

const PgSessionStore = pgSession(session)
const pool = new pg.Pool({
  connectionString: getDatabaseUrl(),
  ssl: { rejectUnauthorized: false },
})

app.use(
  session({
    store: new PgSessionStore({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok' })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Database connection failed',
      message: process.env.DEBUG_ERRORS === 'true' ? error.message : undefined,
    })
  }
})

app.use('/api/auth', authRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.DEBUG_ERRORS === 'true' ? err.message : undefined,
  })
})

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`)
  })
}

export default app
