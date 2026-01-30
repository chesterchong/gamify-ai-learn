import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import { Router } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import prisma from '../db/prisma.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()
const PASSWORD_MIN_LENGTH = 8
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEFAULT_SUPABASE_AUD = 'authenticated'

let supabaseJwks = null
let supabaseIssuer = null
let supabaseAudience = null

const getSupabaseVerifier = () => {
  const baseUrl = process.env.SUPABASE_URL
  if (!baseUrl) {
    throw new Error('SUPABASE_URL is not configured')
  }

  if (!supabaseJwks) {
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')
    supabaseIssuer = `${normalizedBaseUrl}/auth/v1`
    const jwksUrl =
      process.env.SUPABASE_JWKS_URL || `${supabaseIssuer}/.well-known/jwks.json`
    supabaseJwks = createRemoteJWKSet(new URL(jwksUrl))
    supabaseAudience = process.env.SUPABASE_JWT_AUD || DEFAULT_SUPABASE_AUD
  }

  return { supabaseJwks, supabaseIssuer, supabaseAudience }
}

const toSafeUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  xp: user.xp,
  level: user.level,
  streakCount: user.streakCount,
  lastActiveDate: user.lastActiveDate,
})

router.post('/register', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : ''
    const password =
      typeof req.body.password === 'string' ? req.body.password : ''

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'learner',
      },
    })

    req.session.userId = user.id
    req.session.role = user.role
    return res.status(201).json({ user: toSafeUser(user) })
  } catch (error) {
    return next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : ''
    const password =
      typeof req.body.password === 'string' ? req.body.password : ''

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email and password are required' })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    req.session.userId = user.id
    req.session.role = user.role
    return res.json({ user: toSafeUser(user) })
  } catch (error) {
    return next(error)
  }
})

router.post('/supabase', async (req, res, next) => {
  try {
    const accessToken =
      typeof req.body.accessToken === 'string' ? req.body.accessToken : ''

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' })
    }

    const { supabaseJwks, supabaseIssuer, supabaseAudience } =
      getSupabaseVerifier()
    let payload
    try {
      const result = await jwtVerify(accessToken, supabaseJwks, {
        issuer: supabaseIssuer,
        audience: supabaseAudience,
      })
      payload = result.payload
    } catch (jwtError) {
      console.error('[auth/supabase] JWT verification failed:', jwtError?.message || jwtError)
      return res.status(401).json({
        error: 'Invalid or expired token',
        ...(process.env.DEBUG_ERRORS === 'true' && { detail: jwtError?.message }),
      })
    }

    const email =
      typeof payload.email === 'string' ? payload.email.toLowerCase() : ''

    if (!email) {
      return res.status(400).json({ error: 'Email not available from OAuth provider' })
    }

    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      const randomSecret = crypto.randomBytes(32).toString('hex')
      const passwordHash = await bcrypt.hash(randomSecret, 10)
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'learner',
        },
      })
    }

    req.session.userId = user.id
    req.session.role = user.role
    return res.json({ user: toSafeUser(user) })
  } catch (error) {
    console.error('[auth/supabase]', error?.message || error)
    return next(error)
  }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({ user: toSafeUser(user) })
  } catch (error) {
    return next(error)
  }
})

router.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error)
    }
    res.clearCookie('connect.sid')
    return res.json({ ok: true })
  })
})

export default router
