import prisma from '../db/prisma.js'

/**
 * Same course list + progress shape as GET /api/learning/courses for a given user.
 * @param {string} userId
 */
export async function getFormattedCoursesForUser(userId) {
  const courses = await prisma.course.findMany({
    include: {
      prerequisite: true,
      modules: {
        include: {
          userProgress: {
            where: { userId },
          },
        },
      },
    },
  })

  return courses.map((course) => {
    const moduleProgress = course.modules.map((m) => {
      const p = m.userProgress[0]
      if (!p) {
        return { status: 'available', progress: 0, grade: null }
      }
      return { status: p.status, progress: p.progress, grade: p.grade ?? null }
    })

    const totalModules = moduleProgress.length
    const totalProgress = moduleProgress.reduce((sum, p) => sum + (p.progress || 0), 0)
    let progressPercent = totalModules > 0 ? Math.round(totalProgress / totalModules) : 0

    let status = 'available'
    if (totalModules > 0 && moduleProgress.every((p) => p.status === 'completed')) {
      status = 'completed'
    } else if (
      moduleProgress.some((p) => p.status === 'in-progress' || (p.progress || 0) > 0)
    ) {
      status = 'in-progress'
    }

    let grade = null
    const completedWithGrade = moduleProgress.find(
      (p) => p.status === 'completed' && p.grade,
    )
    const inProgressWithGrade = moduleProgress.find(
      (p) => p.status === 'in-progress' && p.grade,
    )
    if (completedWithGrade) {
      grade = completedWithGrade.grade
    } else if (inProgressWithGrade) {
      grade = inProgressWithGrade.grade
    }

    let isPrereqCompleted = true
    if (course.prerequisiteId) {
      const prereqCourse = courses.find((c) => c.id === course.prerequisiteId)
      const prereqModules = prereqCourse?.modules || []
      isPrereqCompleted =
        prereqModules.length > 0 &&
        prereqModules.every((m) => m.userProgress.some((p) => p.status === 'completed'))

      if (!isPrereqCompleted) {
        status = 'locked'
        progressPercent = 0
        grade = null
      }
    }

    const finalStatus = status.toLowerCase()

    return {
      id: course.id,
      code: course.code,
      title: course.title,
      xpReward: course.xpReward,
      estimatedHrs: course.estimatedHrs,
      difficulty: course.difficulty,
      avgScore: course.avgScore,
      aiInsights: course.aiInsights,
      status: finalStatus,
      progressPercent,
      grade,
      prerequisiteId: course.prerequisiteId,
      prerequisite: course.prerequisite
        ? {
            code: course.prerequisite.code,
            title: course.prerequisite.title,
          }
        : null,
    }
  })
}

export async function getCourseCompletionSummaryForUser(userId) {
  const formatted = await getFormattedCoursesForUser(userId)
  const total = formatted.length
  const completed = formatted.filter((c) => c.status === 'completed').length
  return { completed, total }
}
