import { Router } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '../db/prisma.js'
import requireAuth from '../middleware/requireAuth.js'
import {
  leaderboardCacheGet,
  leaderboardCacheSet,
} from '../lib/leaderboardCache.js'

const router = Router()

const LEADERBOARD_TABS = new Set(['xp', 'accuracy'])

/** Browser may reuse response briefly; leaderboard also hits server RAM cache. */
const BOOTSTRAP_CACHE_CONTROL =
  'private, max-age=15, stale-while-revalidate=120'
const LEADERBOARD_CACHE_CONTROL =
  'private, max-age=20, stale-while-revalidate=120'

function displayLabel(user) {
  if (!user) return 'Learner'
  const u = user.username?.trim()
  if (u) return u
  const f = user.fullName?.trim()
  if (f) return f
  return 'Learner'
}

/**
 * One grouped SQL query per leaderboard (not one row per submission).
 * Returns quizSubmissions count + accuracyPercent per userId.
 */
async function aggregateStatsForUserIds(userIds) {
  const map = new Map()
  if (!userIds.length) return map
  const rows = await prisma.$queryRaw`
    SELECT s."userId" AS "userId",
      COUNT(*)::int AS cnt,
      AVG(
        CASE
          WHEN s."totalQuestions" > 0
          THEN (s."score"::float / s."totalQuestions"::float)
        END
      )::float AS acc
    FROM "AiQuizSubmission" s
    WHERE s."userId" IN (${Prisma.join(userIds)})
    GROUP BY s."userId"
  `
  for (const r of rows) {
    const accNum = r.acc != null ? Number(r.acc) : null
    const accuracyPercent =
      accNum != null && Number.isFinite(accNum)
        ? Math.round(accNum * 1000) / 10
        : null
    map.set(r.userId, {
      quizSubmissions: Number(r.cnt),
      accuracyPercent,
    })
  }
  return map
}

function statsMapFromAccuracyRows(rows) {
  const map = new Map()
  for (const r of rows) {
    const accNum = r.acc != null ? Number(r.acc) : null
    const accuracyPercent =
      accNum != null && Number.isFinite(accNum)
        ? Math.round(accNum * 1000) / 10
        : null
    map.set(r.userId, {
      quizSubmissions: Number(r.cnt),
      accuracyPercent,
    })
  }
  return map
}

function leaderboardRowBase(u, rank, stats) {
  const s = stats.get(u.id) || { quizSubmissions: 0, accuracyPercent: null }
  return {
    rank,
    userId: u.id,
    displayName: displayLabel(u),
    profilePhotoUrl: u.profilePhotoUrl?.trim() || null,
    xp: typeof u.xp === 'number' ? u.xp : 0,
    quizSubmissions: s.quizSubmissions,
    accuracyPercent: s.accuracyPercent,
  }
}

function attachViewer(rows, viewerUserId) {
  return rows.map((r) => ({
    ...r,
    isCurrentUser: r.userId === viewerUserId,
  }))
}

/** Neutral rows only (safe to share across users in RAM cache). */
async function computeLeaderboardRowsBase(tab) {
  if (tab === 'xp') {
    const leaders = await prisma.user.findMany({
      orderBy: [{ xp: 'desc' }, { id: 'asc' }],
      take: 10,
      select: {
        id: true,
        username: true,
        fullName: true,
        xp: true,
        profilePhotoUrl: true,
      },
    })
    const ids = leaders.map((u) => u.id)
    const stats = await aggregateStatsForUserIds(ids)
    return leaders.map((u, index) => leaderboardRowBase(u, index + 1, stats))
  }

  const rows = await prisma.$queryRaw`
    SELECT s."userId" AS "userId",
      COUNT(*)::int AS cnt,
      AVG(
        CASE
          WHEN s."totalQuestions" > 0
          THEN (s."score"::float / s."totalQuestions"::float)
        END
      )::float AS acc
    FROM "AiQuizSubmission" s
    GROUP BY s."userId"
    HAVING COUNT(*) > 0
    ORDER BY acc DESC NULLS LAST, cnt DESC, s."userId" ASC
    LIMIT 10
  `

  if (!rows.length) return []

  const orderedUserIds = rows.map((r) => r.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: orderedUserIds } },
    select: {
      id: true,
      username: true,
      fullName: true,
      xp: true,
      profilePhotoUrl: true,
    },
  })
  const byId = Object.fromEntries(users.map((u) => [u.id, u]))
  const stats = statsMapFromAccuracyRows(rows)

  return orderedUserIds
    .map((id, index) => {
      const u = byId[id]
      if (!u) return null
      return leaderboardRowBase(u, index + 1, stats)
    })
    .filter(Boolean)
}

async function getLeaderboardForViewer(tab, viewerUserId) {
  const t = LEADERBOARD_TABS.has(tab) ? tab : 'xp'
  let base = leaderboardCacheGet(t)
  if (!base) {
    base = await computeLeaderboardRowsBase(t)
    leaderboardCacheSet(t, base)
  }
  return {
    tab: t,
    leaderboard: attachViewer(base, viewerUserId),
  }
}

async function getDashboardSummaryJson(userId) {
  const [submissionCount, lessonsCompleted, submissions, me] = await Promise.all([
    prisma.aiQuizSubmission.count({ where: { userId } }),
    prisma.userLessonProgress.count({ where: { userId, isCompleted: true } }),
    prisma.aiQuizSubmission.findMany({
      where: { userId },
      select: { score: true, totalQuestions: true, collectionId: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        streakCount: true,
        xp: true,
        fullName: true,
        username: true,
      },
    }),
  ])

  let accuracyPercent = null
  const perfectCollectionIds = new Set()
  if (submissions.length > 0) {
    const sumRatio = submissions.reduce((acc, s) => {
      const t = Math.max(1, s.totalQuestions)
      return acc + s.score / t
    }, 0)
    accuracyPercent = Math.round((sumRatio / submissions.length) * 1000) / 10
    for (const s of submissions) {
      if (
        s.collectionId &&
        s.totalQuestions > 0 &&
        s.score === s.totalQuestions
      ) {
        perfectCollectionIds.add(s.collectionId)
      }
    }
  }

  return {
    quizzesCompleted: submissionCount,
    perfectQuizzesCount: perfectCollectionIds.size,
    lessonsCompleted,
    accuracyPercent,
    streakDays: me?.streakCount ?? 0,
    xp: typeof me?.xp === 'number' ? me.xp : 0,
    displayName: displayLabel(me),
  }
}

/**
 * GET /api/dashboard/bootstrap?tab=xp|accuracy
 * One round trip: summary + leaderboard (DB queries run in parallel).
 */
router.get('/bootstrap', requireAuth, async (req, res, next) => {
  try {
    const tabRaw = String(req.query.tab || 'xp').toLowerCase()
    const tab = LEADERBOARD_TABS.has(tabRaw) ? tabRaw : 'xp'
    const userId = req.user.id

    const [summary, lb] = await Promise.all([
      getDashboardSummaryJson(userId),
      getLeaderboardForViewer(tab, userId),
    ])

    res.set('Cache-Control', BOOTSTRAP_CACHE_CONTROL)
    return res.json({
      summary,
      leaderboard: lb.leaderboard,
      tab: lb.tab,
    })
  } catch (err) {
    return next(err)
  }
})

/**
 * GET /api/dashboard/summary
 * Current user: quiz attempts, lessons completed, accuracy (AI quizzes), streak, xp.
 */
router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const body = await getDashboardSummaryJson(req.user.id)
    res.set('Cache-Control', 'private, no-store')
    return res.json(body)
  } catch (err) {
    return next(err)
  }
})

/**
 * GET /api/dashboard/leaderboard?tab=xp|accuracy
 * Top 10 by XP or by average AI quiz accuracy (aggregated in SQL + RAM cache).
 */
router.get('/leaderboard', requireAuth, async (req, res, next) => {
  try {
    const tabRaw = String(req.query.tab || 'xp').toLowerCase()
    const tab = LEADERBOARD_TABS.has(tabRaw) ? tabRaw : 'xp'
    const lb = await getLeaderboardForViewer(tab, req.user.id)
    res.set('Cache-Control', LEADERBOARD_CACHE_CONTROL)
    return res.json(lb)
  } catch (err) {
    return next(err)
  }
})

export default router
