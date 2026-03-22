import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import { Router } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import prisma from '../db/prisma.js'
import requireAuth from '../middleware/requireAuth.js'
import { levelFromTotalXp } from '../lib/accountLevel.js'
import {
  buildLearningActivityForCalendarYear,
  LEARNING_ACTIVITY_HEATMAP_YEAR,
} from '../lib/learningActivityGrid.js'
import { getCourseCompletionSummaryForUser } from '../lib/courseProgressForUser.js'

const router = Router()
const PASSWORD_MIN_LENGTH = 8
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEFAULT_SUPABASE_AUD = 'authenticated'
const USER_TYPES = new Set(['admin', 'student'])

const normalizeUserType = (value) => {
  if (typeof value !== 'string') return null
  const v = value.trim().toLowerCase()
  return USER_TYPES.has(v) ? v : null
}

/** Compare passcode to server secret without leaking length via timingSafeEqual input lengths. */
function adminPasscodeMatches(provided, secret) {
  if (typeof provided !== 'string' || !secret) return false
  const hProvided = crypto.createHash('sha256').update(provided, 'utf8').digest()
  const hSecret = crypto.createHash('sha256').update(secret, 'utf8').digest()
  return crypto.timingSafeEqual(hProvided, hSecret)
}

/** Display name default: email local part (before @). User can change in profile. */
function defaultFullNameFromEmail(emailLower) {
  const i = emailLower.indexOf('@')
  const local = i > 0 ? emailLower.slice(0, i) : emailLower
  const trimmed = local.trim()
  return trimmed || 'Learner'
}

/** Unique handle: lowercase [a-z0-9_], min length 3; disambiguate with random suffix if taken. */
function usernameBaseFromEmailLocal(local) {
  const lower = String(local || '').trim().toLowerCase()
  const cleaned = lower.replace(/[^a-z0-9_]/g, '')
  let base = cleaned || 'user'
  if (base.length < 3) base = `${base}usr`.slice(0, 3)
  return base.slice(0, 30)
}

async function allocateUniqueUsername(prismaClient, emailLower) {
  const local = defaultFullNameFromEmail(emailLower)
  const base = usernameBaseFromEmailLocal(local)
  for (let attempt = 0; attempt < 50; attempt++) {
    const suffix =
      attempt === 0 ? '' : `_${crypto.randomBytes(2).toString('hex')}`
    const room = Math.max(1, 30 - suffix.length)
    const candidate = `${base.slice(0, room)}${suffix}`.slice(0, 30)
    const taken = await prismaClient.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    })
    if (!taken) return candidate
  }
  throw new Error('Could not assign username')
}

async function syncUserTypeToSupabaseAuth(supabaseUserId, userType) {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey || !supabaseUserId || !userType) return

  const supabase = createClient(supabaseUrl, serviceKey)
  const { error } = await supabase.auth.admin.updateUserById(supabaseUserId, {
    user_metadata: { user_type: userType },
  })
  if (error) {
    console.error('[auth] Supabase user_metadata sync failed:', error.message)
  }
}

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
  xp: typeof user.xp === 'number' && Number.isFinite(user.xp) ? user.xp : 0,
  level: levelFromTotalXp(
    typeof user.xp === 'number' && Number.isFinite(user.xp) ? user.xp : 0,
  ),
  streakCount: user.streakCount,
  lastActiveDate: user.lastActiveDate,
  fullName: user.fullName,
  username: user.username,
  professionalRole: user.professionalRole,
  profilePhotoUrl: user.profilePhotoUrl,
  aiQuizSubmissionCount: user.aiQuizSubmissionCount ?? 0,
})

/** Mean score/totalQuestions per AI quiz attempt; matches dashboard summary accuracy. */
function avgScorePercentFromSubmissions(submissions) {
  if (!submissions?.length) return { avgScorePercent: null, aiQuizAttempts: 0 }
  const sumRatio = submissions.reduce((acc, s) => {
    const t = Math.max(1, s.totalQuestions)
    return acc + s.score / t
  }, 0)
  return {
    avgScorePercent: Math.round((sumRatio / submissions.length) * 1000) / 10,
    aiQuizAttempts: submissions.length,
  }
}

async function assembleProfileBundle(userId, { includeEmail = false } = {}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  if (!user) return null

  const [lessonsCompleted, aiQuizSubs, courseSummary] = await Promise.all([
    prisma.userLessonProgress.count({
      where: { userId, isCompleted: true },
    }),
    prisma.aiQuizSubmission.findMany({
      where: { userId },
      select: { score: true, totalQuestions: true, createdAt: true },
    }),
    getCourseCompletionSummaryForUser(userId),
  ])

  const { avgScorePercent, aiQuizAttempts } =
    avgScorePercentFromSubmissions(aiQuizSubs)

  const learningActivity = buildLearningActivityForCalendarYear(
    aiQuizSubs,
    LEARNING_ACTIVITY_HEATMAP_YEAR,
  )
  const laLevels = learningActivity.levels
  const weekCountFromGrid =
    Array.isArray(laLevels) && laLevels.length > 0 && laLevels.length % 7 === 0
      ? laLevels.length / 7
      : learningActivity.weekCount

  const base = toSafeUser(user)
  const userOut = {
    ...base,
    lessonsCompleted,
    avgScorePercent,
    aiQuizAttempts,
  }
  if (!includeEmail) {
    delete userOut.email
  }

  return {
    user: userOut,
    learningActivity: {
      calendarYear: learningActivity.calendarYear,
      weekCount: weekCountFromGrid,
      levels: learningActivity.levels,
      counts: learningActivity.counts,
      dayLabels: learningActivity.dayLabels,
      totalSubmissionsInYear: learningActivity.totalSubmissionsInYear,
      longestStreakDays: learningActivity.longestStreakDays,
    },
    courseStats: courseSummary,
  }
}

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

    const emailLower = email.toLowerCase()
    const passwordHash = await bcrypt.hash(password, 10)
    const defaultName = defaultFullNameFromEmail(emailLower)
    const username = await allocateUniqueUsername(prisma, emailLower)
    const user = await prisma.user.create({
      data: {
        email: emailLower,
        passwordHash,
        role: 'learner',
        professionalRole: 'student',
        fullName: defaultName,
        username,
      },
    })

    req.session.userId = user.id
    req.session.role = user.role
    req.session.professionalRole = user.professionalRole
    req.session.save((saveErr) => {
      if (saveErr) return next(saveErr)
      return res.status(201).json({ user: toSafeUser(user) })
    })
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
    req.session.professionalRole = user.professionalRole
    req.session.save((saveErr) => {
      if (saveErr) return next(saveErr)
      return res.json({ user: toSafeUser(user) })
    })
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

    const supabaseUserId =
      typeof payload.sub === 'string' && payload.sub ? payload.sub : null

    if (!user) {
      const randomSecret = crypto.randomBytes(32).toString('hex')
      const passwordHash = await bcrypt.hash(randomSecret, 10)
      const defaultName = defaultFullNameFromEmail(email)
      const username = await allocateUniqueUsername(prisma, email)
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'learner',
          professionalRole: 'student',
          supabaseAuthId: supabaseUserId,
          fullName: defaultName,
          username,
        },
      })
    } else if (supabaseUserId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { supabaseAuthId: supabaseUserId },
      })
    }

    await syncUserTypeToSupabaseAuth(
      supabaseUserId || user.supabaseAuthId,
      user.professionalRole,
    )

    req.session.userId = user.id
    req.session.role = user.role
    req.session.professionalRole = user.professionalRole
    req.session.save((saveErr) => {
      if (saveErr) return next(saveErr)
      return res.json({ user: toSafeUser(user) })
    })
  } catch (error) {
    console.error('[auth/supabase]', error?.message || error)
    return next(error)
  }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const bundle = await assembleProfileBundle(req.user.id, {
      includeEmail: true,
    })
    if (!bundle) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.set('Cache-Control', 'private, no-store')
    return res.json({
      user: bundle.user,
      learningActivity: bundle.learningActivity,
      courseStats: bundle.courseStats,
      viewerIsSubject: true,
    })
  } catch (error) {
    return next(error)
  }
})

/**
 * View another learner's profile (or your own) by username. Requires login.
 * Does not expose email.
 */
router.get('/profile/:username', requireAuth, async (req, res, next) => {
  try {
    const raw = String(req.params.username || '').trim()
    if (!raw) {
      return res.status(400).json({ error: 'Username required' })
    }

    const subject = await prisma.user.findFirst({
      where: {
        username: { equals: raw, mode: 'insensitive' },
      },
      select: { id: true },
    })
    if (!subject) {
      return res.status(404).json({ error: 'User not found' })
    }

    const bundle = await assembleProfileBundle(subject.id, {
      includeEmail: false,
    })
    if (!bundle) {
      return res.status(404).json({ error: 'User not found' })
    }

    const viewerIsSubject = String(req.user.id) === String(subject.id)

    res.set('Cache-Control', 'private, no-store')
    return res.json({
      ...bundle,
      viewerIsSubject,
    })
  } catch (error) {
    return next(error)
  }
})

router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { fullName, username, professionalRole, profilePhotoUrl, password } = req.body

    const existing = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { professionalRole: true },
    })
    if (!existing) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if username is being changed and if it's already taken
    if (username !== undefined && username !== null) {
      const trimmedUsername = typeof username === 'string' ? username.trim() : ''
      if (trimmedUsername) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username: trimmedUsername,
            id: { not: req.user.id },
          },
        })
        if (existingUser) {
          return res.status(409).json({ error: 'Username already taken' })
        }
      }
    }

    // Build update data object
    const updateData = {}
    if (fullName !== undefined) {
      updateData.fullName = typeof fullName === 'string' ? fullName.trim() || null : null
    }
    if (username !== undefined) {
      updateData.username = typeof username === 'string' ? username.trim() || null : null
    }
    if (professionalRole !== undefined) {
      const normalized = normalizeUserType(professionalRole)
      if (
        typeof professionalRole === 'string' &&
        professionalRole.trim() !== '' &&
        normalized === null
      ) {
        return res
          .status(400)
          .json({ error: 'User type must be admin or student' })
      }
      const nextRole = normalized ?? 'student'
      const wasAdmin =
        String(existing.professionalRole || '').toLowerCase() === 'admin'
      if (nextRole === 'admin' && !wasAdmin) {
        const secret = process.env.PROFILE_ADMIN_PASSCODE || ''
        if (!secret) {
          return res.status(403).json({
            error:
              'Admin account type is not available. The server must set PROFILE_ADMIN_PASSCODE.',
          })
        }
        const provided =
          typeof req.body.adminPasscode === 'string' ? req.body.adminPasscode : ''
        if (!adminPasscodeMatches(provided, secret)) {
          return res.status(403).json({ error: 'Invalid admin unlock code.' })
        }
      }
      updateData.professionalRole = nextRole
    }
    if (profilePhotoUrl !== undefined) {
      updateData.profilePhotoUrl = typeof profilePhotoUrl === 'string' ? profilePhotoUrl.trim() || null : null
    }
    if (password !== undefined && password !== null && password !== '') {
      const passwordStr = typeof password === 'string' ? password : ''
      if (passwordStr.length < PASSWORD_MIN_LENGTH) {
        return res.status(400).json({
          error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
        })
      }
      updateData.passwordHash = await bcrypt.hash(passwordStr, 10)
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    })

    await syncUserTypeToSupabaseAuth(user.supabaseAuthId, user.professionalRole)

    req.session.role = user.role
    req.session.professionalRole = user.professionalRole
    req.session.save((saveErr) => {
      if (saveErr) return next(saveErr)
      return res.json({ user: toSafeUser(user) })
    })
  } catch (error) {
    console.error('[auth/profile] Error:', error?.message || error)
    console.error('[auth/profile] Stack:', error?.stack)
    // Check if it's a Prisma schema mismatch error
    if (error?.message?.includes('Unknown argument') || error?.message?.includes('Unknown field')) {
      return res.status(500).json({
        error: 'Database schema mismatch. Please run migrations: npx prisma migrate dev',
        detail: process.env.DEBUG_ERRORS === 'true' ? error.message : undefined,
      })
    }
    return next(error)
  }
})

router.post('/logout', (req, res, next) => {
  const sessionCookiesCrossSite =
    process.env.NODE_ENV === 'production' ||
    process.env.SESSION_CROSS_SITE_COOKIES === 'true'
  req.session.destroy((error) => {
    if (error) {
      return next(error)
    }
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      sameSite: sessionCookiesCrossSite ? 'none' : 'lax',
      secure: sessionCookiesCrossSite,
    })
    return res.json({ ok: true })
  })
})

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  },
})

// Photo upload endpoint
router.post('/profile/photo', requireAuth, upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: 'Supabase configuration missing',
        detail: process.env.DEBUG_ERRORS === 'true' ? 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY are required' : undefined,
      })
    }

    // Get user email for file naming
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create a unique filename
    const fileExt = req.file.originalname.split('.').pop() || 'jpg'
    const fileName = `${user.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`
    const filePath = `profile-photos/${fileName}`

    // Upload to Supabase Storage
    let uploadError = null
    let bucketName = 'avatars'

    // Try 'avatars' bucket first
    const { error: error1 } = await supabase.storage
      .from('avatars')
      .upload(filePath, req.file.buffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: req.file.mimetype,
      })

    if (error1) {
      // Try 'profile-photos' bucket
      bucketName = 'profile-photos'
      const { error: error2 } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, req.file.buffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: req.file.mimetype,
        })
      uploadError = error2
    }

    if (uploadError) {
      console.error('[auth/profile/photo] Upload error:', uploadError)
      return res.status(500).json({
        error: 'Failed to upload photo',
        detail: process.env.DEBUG_ERRORS === 'true' ? uploadError.message : undefined,
      })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return res.status(500).json({ error: 'Failed to get image URL' })
    }

    return res.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('[auth/profile/photo] Error:', error?.message || error)
    return next(error)
  }
})

export default router
