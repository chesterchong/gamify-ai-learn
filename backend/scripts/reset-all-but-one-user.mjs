/**
 * Destructive: remove all app users and their data except one account (by email).
 * - Clears connect-pg-simple sessions
 * - Removes quiz import files from Supabase Storage for batches owned by deleted users
 * - Deletes all User rows except KEEP_EMAIL (cascades progress, imports, AI quizzes owned by them, etc.)
 * - Deletes all other Supabase Auth users (requires SUPABASE_SERVICE_ROLE_KEY)
 *
 * Run from backend/:
 *   KEEP_EMAIL=chesterchongmk@gmail.com RESET_DB_EXCEPT_USER_CONFIRM=YES node scripts/reset-all-but-one-user.mjs
 *
 * Windows PowerShell:
 *   $env:KEEP_EMAIL="chesterchongmk@gmail.com"; $env:RESET_DB_EXCEPT_USER_CONFIRM="YES"; node scripts/reset-all-but-one-user.mjs
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import prisma from '../src/db/prisma.js'

const QUIZ_IMPORT_BUCKET =
  process.env.SUPABASE_QUIZ_IMPORT_BUCKET || 'quiz-imports'

function splitStoragePath(relativePath) {
  const parts = String(relativePath || '')
    .split('/')
    .filter(Boolean)
  if (parts.length < 2) {
    throw new Error('Invalid storage path')
  }
  const bucket = parts[0]
  const objectPath = parts.slice(1).join('/')
  return { bucket, objectPath }
}

async function removeImportFilesFromStorage(supabase, files) {
  for (const f of files) {
    if (!f?.relativePath) continue
    try {
      const { bucket, objectPath } = splitStoragePath(f.relativePath)
      const { error } = await supabase.storage.from(bucket).remove([objectPath])
      if (error) {
        console.warn(`[storage] skip remove (${objectPath}): ${error.message}`)
      }
    } catch (e) {
      console.warn(`[storage] skip (${f.relativePath}): ${e?.message || e}`)
    }
  }
}

async function deleteOtherAuthUsers(supabase, keepEmailLower) {
  const perPage = 1000
  let page = 1
  let removed = 0
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw new Error(`listUsers: ${error.message}`)
    const users = data?.users ?? []
    for (const u of users) {
      const em = (u.email || '').trim().toLowerCase()
      if (em && em === keepEmailLower) continue
      const { error: delErr } = await supabase.auth.admin.deleteUser(u.id)
      if (delErr) {
        console.warn(`[auth] failed delete ${u.id}: ${delErr.message}`)
      } else {
        removed += 1
      }
    }
    if (users.length < perPage) break
    page += 1
  }
  return removed
}

async function main() {
  if (process.env.RESET_DB_EXCEPT_USER_CONFIRM !== 'YES') {
    console.error(
      'Refusing to run: set RESET_DB_EXCEPT_USER_CONFIRM=YES to confirm.',
    )
    process.exit(1)
  }

  const keepEmail = (process.env.KEEP_EMAIL || 'chesterchongmk@gmail.com')
    .trim()
    .toLowerCase()
  if (!keepEmail) {
    console.error('KEEP_EMAIL is empty.')
    process.exit(1)
  }

  const keepUser = await prisma.user.findFirst({
    where: { email: { equals: keepEmail, mode: 'insensitive' } },
    select: { id: true, email: true },
  })

  if (!keepUser) {
    console.error(
      `No User row found for email (case-insensitive): ${keepEmail}. Aborting — no data deleted.`,
    )
    process.exit(1)
  }

  const others = await prisma.user.findMany({
    where: { id: { not: keepUser.id } },
    select: { id: true, email: true },
  })
  console.log(`Keeping: ${keepUser.email} (${keepUser.id})`)
  console.log(`Will remove ${others.length} other user(s) from the database.`)

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase =
    supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null

  if (!supabase) {
    console.warn(
      '[warn] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — skipping storage + Auth admin cleanup.',
    )
  }

  const files = await prisma.quizImportFile.findMany({
    where: { batch: { userId: { not: keepUser.id } } },
    select: { relativePath: true },
  })
  if (supabase && files.length > 0) {
    console.log(`Removing ${files.length} quiz import file object(s) from Storage…`)
    await removeImportFilesFromStorage(supabase, files)
  }

  const sessions = await prisma.session.deleteMany({})
  console.log(`Cleared ${sessions.count} session row(s).`)

  const deleted = await prisma.user.deleteMany({
    where: { id: { not: keepUser.id } },
  })
  console.log(`Deleted ${deleted.count} User row(s) (cascaded related data).`)

  if (supabase) {
    console.log('Deleting other Supabase Auth users (by email)…')
    const authRemoved = await deleteOtherAuthUsers(supabase, keepEmail)
    console.log(`Removed ${authRemoved} Auth user(s).`)
  }

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
