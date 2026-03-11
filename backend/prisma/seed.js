import 'dotenv/config'
import pkg from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { getDatabaseUrl } from '../src/db/databaseUrl.js'

const { PrismaClient } = pkg

const pool = new pg.Pool({
  connectionString: getDatabaseUrl(),
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create Courses
  const course1 = await prisma.course.upsert({
    where: { code: 'BACS1013' },
    update: {},
    create: {
      code: 'BACS1013',
      title: 'Problem Solving & Programming',
      description: 'Master the fundamentals of logic and programming structures.',
      xpReward: 500,
      estimatedHrs: 20,
      difficulty: 'Beginner',
      avgScore: 85,
      aiInsights: 'Master this for FAANG interviews. Data structures are 60% of technical screens.',
      category: 'Computer Science',
      year: 1,
    },
  })

  const course2 = await prisma.course.upsert({
    where: { code: 'BAIT1023' },
    update: {},
    create: {
      code: 'BAIT1023',
      title: 'Web Design & Development',
      description: 'Learn to build modern, responsive websites using React and Tailwind.',
      xpReward: 400,
      estimatedHrs: 24,
      difficulty: 'Beginner',
      avgScore: 92,
      aiInsights: 'Highly relevant for Full-Stack roles. Focus on React and Tailwind components.',
      category: 'Web Development',
      year: 1,
    },
  })

  // Course 3 depends on Course 1
  const course3 = await prisma.course.upsert({
    where: { code: 'BACS2023' },
    update: {
      prerequisiteId: course1.id
    },
    create: {
      code: 'BACS2023',
      title: 'Object Oriented Programming',
      description: 'Deep dive into classes, inheritance, and polymorphism.',
      xpReward: 800,
      estimatedHrs: 30,
      difficulty: 'Intermediate',
      avgScore: 76,
      aiInsights: 'Core software engineering principles. Essential for understanding scalable systems.',
      category: 'Computer Science',
      year: 2,
      prerequisiteId: course1.id
    },
  })

  // Course 4 depends on Course 3
  const course4 = await prisma.course.upsert({
    where: { code: 'BACS2063' },
    update: {
      prerequisiteId: course3.id
    },
    create: {
      code: 'BACS2063',
      title: 'Data Structures & Algorithms',
      description: 'The foundation of efficient problem solving.',
      xpReward: 900,
      estimatedHrs: 40,
      difficulty: 'Hard',
      avgScore: 60,
      aiInsights: 'Build the foundation for efficient problem solving and algorithm design.',
      category: 'Computer Science',
      year: 2,
      prerequisiteId: course3.id
    },
  })

  // --- ROADMAP DATA SEEDING ---
  
  // 1. Problem Solving & Programming (BACS1013)
  const bacs1013Modules = [
    { order: 1, title: 'Logic & Flowcharts', description: 'Mastering the art of visual problem solving.', numLessons: 4, numProblems: 12 },
    { order: 2, title: 'Control Structures', description: 'If-else, switch, and loops in depth.', numLessons: 6, numProblems: 20 },
    { order: 3, title: 'Functions & Modularization', description: 'Breaking down complex problems into smaller tasks.', numLessons: 5, numProblems: 15 },
    { order: 4, title: 'Arrays & Data Handling', description: 'Storing and manipulating collections of data.', numLessons: 8, numProblems: 25 }
  ]

  for (const m of bacs1013Modules) {
    await prisma.module.upsert({
      where: { id: `m-bacs1013-${m.order}` },
      update: { ...m },
      create: { id: `m-bacs1013-${m.order}`, courseId: course1.id, ...m }
    })
  }

  // 2. Web Design & Development (BAIT1023)
  const bait1023Modules = [
    { order: 1, title: 'HTML5 & Semantic Web', description: 'Building the skeleton of the modern web.', numLessons: 5, numProblems: 10 },
    { order: 2, title: 'CSS3 & Responsive Design', description: 'Styling with Flexbox, Grid, and Media Queries.', numLessons: 7, numProblems: 15 },
    { order: 3, title: 'JavaScript Fundamentals', description: 'Adding interactivity to your web pages.', numLessons: 10, numProblems: 30 },
    { order: 4, title: 'React Basics', description: 'Introduction to component-based architecture.', numLessons: 12, numProblems: 20 }
  ]

  for (const m of bait1023Modules) {
    await prisma.module.upsert({
      where: { id: `m-bait1023-${m.order}` },
      update: { ...m },
      create: { id: `m-bait1023-${m.order}`, courseId: course2.id, ...m }
    })
  }

  // 3. Object Oriented Programming (BACS2023)
  const bacs2023Modules = [
    { order: 1, title: 'Classes & Objects', description: 'The core pillars of Object-Oriented Programming.', numLessons: 6, numProblems: 12 },
    { order: 2, title: 'Inheritance & Polymorphism', description: 'Reusing code and creating flexible structures.', numLessons: 8, numProblems: 18 },
    { order: 3, title: 'Abstraction & Interfaces', description: 'Defining contracts and hiding implementation details.', numLessons: 5, numProblems: 10 },
    { order: 4, title: 'Design Patterns', description: 'Common solutions to recurring software design problems.', numLessons: 10, numProblems: 15 }
  ]

  for (const m of bacs2023Modules) {
    await prisma.module.upsert({
      where: { id: `m-bacs2023-${m.order}` },
      update: { ...m },
      create: { id: `m-bacs2023-${m.order}`, courseId: course3.id, ...m }
    })
  }

  // 4. Data Structures & Algorithms (BACS2063)
  const bacs2063Modules = [
    { order: 1, title: 'Introduction to Complexity', description: 'Understanding Big O notation and performance analysis.', numLessons: 4, numProblems: 12 },
    { order: 2, title: 'Arrays & Strings', description: 'Learn how to manipulate arrays and strings efficiently.', numLessons: 6, numProblems: 20 },
    { order: 3, title: 'Hash Maps & Sets', description: 'Collision resolution, caching, and fast lookups.', numLessons: 5, numProblems: 15 },
    { order: 4, title: 'Linked Lists', description: 'Singly and doubly linked lists, pointer manipulation.', numLessons: 5, numProblems: 15 }
  ]

  for (const m of bacs2063Modules) {
    await prisma.module.upsert({
      where: { id: `m-bacs2063-${m.order}` },
      update: { ...m },
      create: { id: `m-bacs2063-${m.order}`, courseId: course4.id, ...m }
    })
  }

  // 2. Setup user progress
  const users = await prisma.user.findMany()
  
  if (users.length === 0) {
    console.log('⚠️ No users found. Please create a user first.')
  }

  // First, clean up any old "Getting Started" or "Web Basics" modules that were created by mistake
  await prisma.module.deleteMany({
    where: {
      OR: [
        { title: 'Getting Started' },
        { title: 'Web Basics' },
        { title: 'OOP Concepts' },
        { title: 'Algorithms Basics' }
      ]
    }
  })

  for (const user of users) {
    console.log(`👤 Seeding progress for user: ${user.email} (${user.id})`)
    // Get all modules we just created
    const allModules = await prisma.module.findMany()
    
    for (const m of allModules) {
      let status = 'available'
      let progress = 0
      
      // BACS1013 first module in progress
      if (m.id === 'm-bacs1013-1') {
        status = 'in-progress'
        progress = 65
      }
      
      // RESTORE PREREQUISITE LOGIC:
      // BACS2023 depends on BACS1013 being completed.
      if (m.id.startsWith('m-bacs2023')) {
        status = 'locked'
      }

      // BACS2063 depends on BACS2023 being completed.
      if (m.id.startsWith('m-bacs2063')) {
        status = 'locked'
      }

      await prisma.userModuleProgress.upsert({
        where: { userId_moduleId: { userId: user.id, moduleId: m.id } },
        update: { status, progress },
        create: { userId: user.id, moduleId: m.id, status, progress }
      })
    }
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
