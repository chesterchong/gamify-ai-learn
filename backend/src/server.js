import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import pg from 'pg'
import pgSession from 'connect-pg-simple'
import authRouter from './routes/auth.js'
import learningRouter from './routes/learning.js'
import quizRouter from './routes/quiz.js'
import dashboardRouter from './routes/dashboard.js'
import { getDatabaseUrl } from './db/databaseUrl.js'
import prisma from './db/prisma.js'

const app = express()
const port = process.env.PORT || 4000

/** Cross-origin SPA (e.g. Vercel) + API on another host needs SameSite=None; Secure. */
const sessionCookiesCrossSite =
  process.env.NODE_ENV === 'production' ||
  process.env.SESSION_CROSS_SITE_COOKIES === 'true'

/** Behind Render/Railway/Fly/etc. req.secure / IPs need trust proxy (not only Vercel). */
const shouldTrustProxy =
  process.env.TRUST_PROXY === '1' ||
  process.env.TRUST_PROXY === 'true' ||
  (process.env.TRUST_PROXY !== 'false' &&
    Boolean(
      process.env.VERCEL ||
        process.env.RAILWAY_ENVIRONMENT ||
        process.env.RENDER ||
        process.env.FLY_APP_NAME ||
        process.env.NODE_ENV === 'production',
    ))
if (shouldTrustProxy) {
  app.set('trust proxy', 1)
}

/** Browsers send Origin without a trailing slash; env often mistakenly includes one. */
function parseAllowedCorsOrigins() {
  const raw = process.env.CLIENT_ORIGIN
  if (raw == null || String(raw).trim() === '') return null
  return String(raw)
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean)
}

const allowedCorsOrigins = parseAllowedCorsOrigins()

app.use(
  cors({
    origin(origin, callback) {
      if (!allowedCorsOrigins?.length) {
        callback(null, true)
        return
      }
      if (!origin) {
        callback(null, true)
        return
      }
      if (allowedCorsOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      console.warn('[cors] blocked origin:', origin, 'allowed:', allowedCorsOrigins)
      callback(null, false)
    },
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
      path: '/',
      sameSite: sessionCookiesCrossSite ? 'none' : 'lax',
      secure: sessionCookiesCrossSite,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
)

app.get('/', (_req, res) => {
  res.json({
    service: 'gamify-ai-learn-api',
    message: 'API is running. No HTML here — use the SPA or the routes below.',
    routes: { health: '/health', healthDb: '/health/db' },
  })
})

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
app.use('/api/learning', learningRouter)
app.use('/api/quiz', quizRouter)
app.use('/api/dashboard', dashboardRouter)

// Pre-warm Supabase JWKS so first OAuth login doesn't wait on remote fetch
const supabaseUrl = process.env.SUPABASE_URL
if (supabaseUrl) {
  const jwksUrl = `${supabaseUrl.replace(/\/+$/, '')}/auth/v1/.well-known/jwks.json`
  fetch(jwksUrl).catch(() => {})
}

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
