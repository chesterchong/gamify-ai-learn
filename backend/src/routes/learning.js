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

export default router
