/**
 * One-off: delete all QuizImportFile + QuizImportBatch rows (orphaned uploads, bad tests).
 * Run: npm run clear-quiz-imports  (from backend/)
 */
import 'dotenv/config'
import prisma from '../src/db/prisma.js'

async function main() {
  const deletedFiles = await prisma.quizImportFile.deleteMany({})
  const deletedBatches = await prisma.quizImportBatch.deleteMany({})
  console.log(
    `Cleared quiz imports: ${deletedFiles.count} file row(s), ${deletedBatches.count} batch(es).`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
