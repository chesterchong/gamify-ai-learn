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
  console.log('🔒 Updating Data Structures & Algorithms (BACS2063) lock status for all users...')

  const courseOOP = await prisma.course.findUnique({ where: { code: 'BACS2023' } })
  const courseDSA = await prisma.course.findUnique({ where: { code: 'BACS2063' } })

  if (!courseOOP || !courseDSA) {
    console.error('❌ Courses BACS2023 or BACS2063 not found. Run seed first.')
    process.exit(1)
  }

  const oopModules = await prisma.module.findMany({
    where: { courseId: courseOOP.id },
    select: { id: true },
  })
  const dsaModules = await prisma.module.findMany({
    where: { courseId: courseDSA.id },
    orderBy: { order: 'asc' },
    select: { id: true },
  })

  const users = await prisma.user.findMany({ select: { id: true } })
  let lockedCount = 0
  let unlockedCount = 0

  const oopModuleIds = oopModules.map((m) => m.id)

  for (const user of users) {
    const oopProgress = await prisma.userModuleProgress.findMany({
      where: { userId: user.id, moduleId: { in: oopModuleIds } },
      select: { status: true },
    })
    const completedOOP =
      oopModuleIds.length > 0 &&
      oopModuleIds.length === oopProgress.length &&
      oopProgress.every((p) => p.status === 'completed')

    if (!completedOOP) {
      for (const m of dsaModules) {
        await prisma.userModuleProgress.upsert({
          where: { userId_moduleId: { userId: user.id, moduleId: m.id } },
          update: { status: 'locked' },
          create: { userId: user.id, moduleId: m.id, status: 'locked', progress: 0 },
        })
      }
      lockedCount += 1
    } else {
      const firstDSA = dsaModules[0]
      const firstProgress = await prisma.userModuleProgress.findUnique({
        where: { userId_moduleId: { userId: user.id, moduleId: firstDSA.id } },
      })
      if (firstProgress?.status === 'locked') {
        await prisma.userModuleProgress.update({
          where: { userId_moduleId: { userId: user.id, moduleId: firstDSA.id } },
          data: { status: 'available' },
        })
      }
      unlockedCount += 1
    }
  }

  console.log(`✅ Updated ${users.length} users: ${lockedCount} locked, ${unlockedCount} with DSA unlocked.`)
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
