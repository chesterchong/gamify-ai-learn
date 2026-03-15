import express from 'express'
import prisma from '../db/prisma.js'

const router = express.Router()

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next()
  }
  res.status(401).json({ error: 'Unauthorized' })
}

// Get all courses with user progress
router.get('/courses', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId

    const courses = await prisma.course.findMany({
      include: {
        prerequisite: true,
        modules: {
          include: {
            userProgress: {
              where: {
                userId: userId
              }
            }
          }
        }
      }
    })

    // Flatten the structure for easier frontend consumption
    const formattedCourses = courses.map(course => {
      // Find progress for any module in this course for this user
      const courseProgress = course.modules.flatMap(m => m.userProgress);
      // Find if any module is started (not locked)
      const activeProgress = courseProgress.find(p => p.status !== 'locked');
      
      let status = 'available'
      let progressPercent = 0
      let grade = null

      if (activeProgress) {
        status = activeProgress.status
        progressPercent = activeProgress.progress
        grade = activeProgress.grade
      } else if (course.prerequisiteId) {
        // Find the prerequisite course in the list
        const prereqCourse = courses.find(c => c.id === course.prerequisiteId);
        
        // A course is only unlocked if ALL its prerequisite's modules are completed
        const prereqModules = prereqCourse?.modules || [];
        const isPrereqCompleted = prereqModules.length > 0 && prereqModules.every(m => 
          m.userProgress.some(p => p.status === 'completed')
        );

        if (!isPrereqCompleted) {
          status = 'locked'
        }
      }

      const finalStatus = status.toLowerCase();

      // DEBUG: Log the status of each course
      console.log(`User: ${userId}, Course: ${course.code}, Prereq: ${course.prerequisite?.code || 'None'}, Status: ${finalStatus}`);

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
        progressPercent: progressPercent,
        grade: grade,
        prerequisiteId: course.prerequisiteId,
        prerequisite: course.prerequisite ? {
          code: course.prerequisite.code,
          title: course.prerequisite.title
        } : null
      }
    })

    res.json(formattedCourses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})

// Get details for a specific course roadmap (for LearningPathModule view)
router.get('/courses/:courseId/roadmap', isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.session.userId

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        prerequisite: true,
        modules: {
          orderBy: { order: 'asc' },
          include: {
            userProgress: {
              where: { userId: userId }
            }
          }
        }
      }
    })

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    // Check prerequisite for "Data Structures & Algorithms" (BACS2063) - lock if not met
    let isLocked = false
    let prerequisite = null

    if (course.code === 'BACS2063' && course.prerequisiteId) {
      const prereqCourse = await prisma.course.findUnique({
        where: { id: course.prerequisiteId },
        include: {
          modules: {
            include: {
              userProgress: {
                where: { userId: userId }
              }
            }
          }
        }
      })

      const prereqModules = prereqCourse?.modules || []
      const isPrereqCompleted =
        prereqModules.length > 0 &&
        prereqModules.every((m) =>
          m.userProgress.some((p) => p.status === 'completed')
        )

      if (!isPrereqCompleted) {
        isLocked = true
        prerequisite = course.prerequisite
          ? { code: course.prerequisite.code, title: course.prerequisite.title }
          : null
      }
    }

    // Format the roadmap data (return 200; show locked state in UI)
    const roadmap = {
      course: {
        id: course.id,
        code: course.code,
        title: course.title,
        difficulty: course.difficulty,
        xpReward: course.xpReward,
        category: course.category,
        year: course.year,
        prerequisiteId: course.prerequisiteId,
        prerequisite: course.prerequisite
          ? { code: course.prerequisite.code, title: course.prerequisite.title }
          : null,
        isLocked,
      },
      chapters: course.modules.map(m => {
        const progress = m.userProgress[0]

        let status = 'available'
        let progressPercent = 0

        if (progress) {
          status = progress.status
          progressPercent = progress.progress
        }

        // Override all chapter statuses to locked when course prerequisite not met
        if (isLocked) {
          status = 'locked'
        }

        return {
          id: m.id,
          title: m.title,
          description: m.description,
          status: status,
          progress: progressPercent,
          lessons: m.numLessons,
          problems: m.numProblems
        }
      })
    }

    res.json(roadmap)
  } catch (error) {
    console.error('Error fetching course roadmap:', error)
    res.status(500).json({ error: 'Failed to fetch course roadmap' })
  }
})

// Get module details with lessons and user progress (for chapter page)
router.get('/modules/:moduleId', isAuthenticated, async (req, res) => {
  try {
    const { moduleId } = req.params
    const userId = req.session.userId

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: { select: { id: true, code: true, title: true } },
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            userProgress: {
              where: { userId }
            }
          }
        },
        userProgress: {
          where: { userId }
        }
      }
    })

    if (!module) {
      return res.status(404).json({ error: 'Module not found' })
    }

    const lessons = module.lessons.map((l) => ({
      id: l.id,
      order: l.order,
      title: l.title,
      type: l.type,
      content: l.content,
      durationMin: l.durationMin,
      isCompleted: l.userProgress[0]?.isCompleted ?? false,
      completedAt: l.userProgress[0]?.completedAt ?? null
    }))

    const moduleProgress = module.userProgress[0]
    const isLesson = (l) => ['reading', 'video'].includes(l.type)
    const isProblem = (l) => ['coding', 'quiz'].includes(l.type)
    const lessonItems = lessons.filter(isLesson)
    const problemItems = lessons.filter(isProblem)

    res.json({
      module: {
        id: module.id,
        title: module.title,
        description: module.description,
        order: module.order,
        numLessons: module.numLessons,
        numProblems: module.numProblems,
        course: module.course
      },
      lessons: lessonItems,
      problems: problemItems,
      progress: {
        status: moduleProgress?.status ?? 'available',
        progressPercent: moduleProgress?.progress ?? 0
      }
    })
  } catch (error) {
    console.error('Error fetching module:', error)
    res.status(500).json({ error: 'Failed to fetch module' })
  }
})

// Get single lesson details (for LessonPage with explanation and quiz)
router.get('/lessons/:lessonId', isAuthenticated, async (req, res) => {
  try {
    const { lessonId } = req.params
    const userId = req.session.userId

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: { select: { id: true, code: true, title: true } }
          }
        },
        userProgress: {
          where: { userId }
        }
      }
    })

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' })
    }

    let content = lesson.content || ''
    let quiz = []
    const quizDelim = '\n---QUIZ---\n'
    const delimIndex = content.indexOf(quizDelim)
    if (delimIndex >= 0) {
      const quizStr = content.slice(delimIndex + quizDelim.length).trim()
      content = content.slice(0, delimIndex).trim()
      try {
        quiz = JSON.parse(quizStr)
      } catch (_) {}
    }

    res.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        durationMin: lesson.durationMin,
        order: lesson.order
      },
      module: lesson.module ? {
        id: lesson.module.id,
        title: lesson.module.title,
        course: lesson.module.course
      } : null,
      content,
      quiz,
      isCompleted: lesson.userProgress[0]?.isCompleted ?? false
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    res.status(500).json({ error: 'Failed to fetch lesson' })
  }
})

// Mark lesson as complete and update module progress
router.post('/lessons/:lessonId/complete', isAuthenticated, async (req, res) => {
  try {
    const { lessonId } = req.params
    const userId = req.session.userId

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            lessons: true
          }
        }
      }
    })

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' })
    }

    await prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId }
      },
      update: { isCompleted: true, completedAt: new Date() },
      create: {
        userId,
        lessonId,
        isCompleted: true,
        completedAt: new Date()
      }
    })

    // Compute module progress: % of completed lessons
    const allLessons = lesson.module.lessons
    const completedCount = await prisma.userLessonProgress.count({
      where: {
        userId,
        lessonId: { in: allLessons.map((l) => l.id) },
        isCompleted: true
      }
    })
    const progressPercent = allLessons.length > 0
      ? Math.round((completedCount / allLessons.length) * 100)
      : 0

    let status = 'in-progress'
    if (progressPercent >= 100) {
      status = 'completed'
    }

    await prisma.userModuleProgress.upsert({
      where: {
        userId_moduleId: { userId, moduleId: lesson.moduleId }
      },
      update: { status, progress: progressPercent, completedAt: status === 'completed' ? new Date() : undefined },
      create: {
        userId,
        moduleId: lesson.moduleId,
        status,
        progress: progressPercent,
        completedAt: status === 'completed' ? new Date() : null
      }
    })

    res.json({ ok: true, progressPercent, status })
  } catch (error) {
    console.error('Error completing lesson:', error)
    res.status(500).json({ error: 'Failed to complete lesson' })
  }
})

export default router
