/**
 * One-off: set account by email to max level (XP + level column).
 * Usage: node scripts/set-user-max-level.mjs <email>
 */
import prisma from '../src/db/prisma.js'
import { minXpForLevel, MAX_ACCOUNT_LEVEL } from '../src/lib/accountLevel.js'

const email = String(process.argv[2] || '')
  .trim()
  .toLowerCase()
if (!email || !email.includes('@')) {
  console.error('Usage: node scripts/set-user-max-level.mjs <email>')
  process.exit(1)
}

const xp = minXpForLevel(MAX_ACCOUNT_LEVEL)
const r = await prisma.user.updateMany({
  where: { email },
  data: { xp, level: MAX_ACCOUNT_LEVEL },
})
console.log(JSON.stringify({ email, matched: r.count, xp, level: MAX_ACCOUNT_LEVEL }))
await prisma.$disconnect()
