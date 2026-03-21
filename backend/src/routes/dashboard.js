import { Router } from 'express'
import prisma from '../db/prisma.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()

function displayLabel(user) {
  if (!user) return 'Learner'
  const u = user.username?.trim()
  if (u) return u
  const f = user.fullName?.trim()
  if (f) return f
  return 'Learner'
}

/**
 * GET /api/dashboard/summary
 * Current user: quiz attempts, lessons completed, accuracy (AI quizzes), streak, xp.
 */
router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id
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

    res.set('Cache-Control', 'private, no-store')
    return res.json({
      quizzesCompleted: submissionCount,
      perfectQuizzesCount: perfectCollectionIds.size,
      lessonsCompleted,
      accuracyPercent,
      streakDays: me?.streakCount ?? 0,
      xp: typeof me?.xp === 'number' ? me.xp : 0,
      displayName: displayLabel(me),
    })
  } catch (err) {
    return next(err)
  }
})

/**
 * GET /api/dashboard/leaderboard
 * Top 10 users by XP (display fields + optional profile photo URL; no email).
 */
router.get('/leaderboard', requireAuth, async (req, res, next) => {
  try {
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

    const leaderboard = leaders.map((u, index) => ({
      rank: index + 1,
      userId: u.id,
      displayName: displayLabel(u),
      profilePhotoUrl: u.profilePhotoUrl?.trim() || null,
      xp: typeof u.xp === 'number' ? u.xp : 0,
      isCurrentUser: u.id === req.user.id,
    }))

    res.set('Cache-Control', 'private, no-store')
    return res.json({ leaderboard })
  } catch (err) {
    return next(err)
  }
})

export default router
