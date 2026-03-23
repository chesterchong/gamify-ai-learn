import { Router } from 'express'
import { levelFromTotalXp } from '../lib/accountLevel.js'
import multer from 'multer'
import { Prisma } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import prisma from '../db/prisma.js'
import requireAuth from '../middleware/requireAuth.js'
import requireAdmin from '../middleware/requireAdmin.js'
import {
  generateQuizFromBuffers,
  generateSocraticHint,
  effectiveMimeType,
  isLikelyGeminiSupportedMime,
} from '../services/geminiQuiz.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file
    files: 10,
  },
})

const QUIZ_IMPORT_BUCKET =
  process.env.SUPABASE_QUIZ_IMPORT_BUCKET || 'quiz-imports'

/** MCQs served per play session when the pooled collection has more than this many questions. */
const PLAY_QUIZ_QUESTION_COUNT = 10

function shuffleInPlace(arr) {
  const a = arr
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** @param {unknown} detailJson */
function questionIdsFromSubmissionDetail(detailJson) {
  if (!detailJson || typeof detailJson !== 'object' || Array.isArray(detailJson)) return []
  const answers = /** @type {{ answers?: { questionId?: string }[] }} */ (detailJson).answers
  if (!Array.isArray(answers)) return []
  return answers
    .map((x) => (x && typeof x.questionId === 'string' ? x.questionId : null))
    .filter(Boolean)
}

/**
 * @param {string} relativePath e.g. "quiz-imports/userId/batch/file.pdf"
 */
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

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} relativePath
 */
function choiceArrayFromJson(choices) {
  if (!Array.isArray(choices)) return []
  return choices.map((c) => String(c))
}

/** UTC midnight for `d`'s calendar day in UTC, and the next day's midnight (exclusive end). */
function utcDayRange(d = new Date()) {
  const start = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
  )
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  return { start, end }
}

/** Client-supplied Socratic UI snapshot; sanitized before persisting for analytics. */
function sanitizeSocraticFeedbackContext(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {}
  }
  return {
    phase: typeof raw.phase === 'string' ? raw.phase.slice(0, 64) : null,
    highlightedText:
      typeof raw.highlightedText === 'string' ? raw.highlightedText.slice(0, 500) : null,
    questionId: typeof raw.questionId === 'string' ? raw.questionId.slice(0, 64) : null,
    keywords: Array.isArray(raw.keywords)
      ? raw.keywords
          .slice(0, 20)
          .map((k) => String(k).trim().slice(0, 200))
          .filter(Boolean)
      : null,
    sourceFile: typeof raw.sourceFile === 'string' ? raw.sourceFile.slice(0, 300) : null,
    explanationPreview:
      typeof raw.explanationPreview === 'string'
        ? raw.explanationPreview.trim().slice(0, 2000)
        : null,
  }
}

async function downloadImportFileBuffer(supabase, relativePath) {
  const { bucket, objectPath } = splitStoragePath(relativePath)
  const { data, error } = await supabase.storage.from(bucket).download(objectPath)
  if (error) {
    throw new Error(error.message || 'Storage download failed')
  }
  const ab = await data.arrayBuffer()
  return Buffer.from(ab)
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ relativePath: string }[]} files
 */
async function removeImportFilesFromStorage(supabase, files) {
  for (const f of files) {
    if (!f?.relativePath) continue
    const { bucket, objectPath } = splitStoragePath(f.relativePath)
    const { error } = await supabase.storage.from(bucket).remove([objectPath])
    if (error) {
      throw new Error(error.message || 'Storage remove failed')
    }
  }
}

/**
 * GET /api/quiz/import-batches
 * Recent quiz file imports (metadata in DB; blobs in Supabase Storage). Admin only.
 */
router.get('/import-batches', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const batches = await prisma.quizImportBatch.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        files: { orderBy: { id: 'asc' } },
      },
    })
    res.set('Cache-Control', 'private, no-store')
    return res.json({ batches })
  } catch (err) {
    return next(err)
  }
})

/**
 * PATCH /api/quiz/import-batches/:batchId
 * Body: { courseCode, courseNote } (title). Admin only.
 */
router.patch('/import-batches/:batchId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { batchId } = req.params
    const courseCode =
      typeof req.body?.courseCode === 'string' ? req.body.courseCode.trim() : ''
    const courseNote =
      typeof req.body?.courseNote === 'string' ? req.body.courseNote.trim() : ''
    if (!courseCode) {
      return res.status(400).json({ error: 'Course code is required.' })
    }
    if (!courseNote) {
      return res.status(400).json({ error: 'Course title is required.' })
    }
    const updated = await prisma.quizImportBatch.update({
      where: { id: batchId },
      data: { courseCode, courseNote },
      include: { files: { orderBy: { id: 'asc' } } },
    })
    return res.json({ batch: updated })
  } catch (err) {
    if (err?.code === 'P2025') {
      return res.status(404).json({ error: 'Import batch not found' })
    }
    return next(err)
  }
})

/**
 * DELETE /api/quiz/import-batches/:batchId
 * Removes Supabase objects, then DB row (cascades QuizImportFile). Admin only.
 */
router.delete('/import-batches/:batchId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { batchId } = req.params
    const batch = await prisma.quizImportBatch.findUnique({
      where: { id: batchId },
      include: { files: true },
    })
    if (!batch) {
      return res.status(404).json({ error: 'Import batch not found' })
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && supabaseKey && batch.files.length > 0) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      try {
        await removeImportFilesFromStorage(supabase, batch.files)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error('[quiz/delete import-batch] storage:', msg)
        return res.status(502).json({
          error: 'Failed to remove files from storage',
          detail: process.env.DEBUG_ERRORS === 'true' ? msg : undefined,
        })
      }
    }

    await prisma.quizImportBatch.delete({ where: { id: batchId } })
    return res.json({ ok: true })
  } catch (err) {
    return next(err)
  }
})

/**
 * POST /api/quiz/import-files
 * multipart: files[] (max 10), courseCode + courseNote (title) required.
 * Files are stored in Supabase Storage (bucket: SUPABASE_QUIZ_IMPORT_BUCKET or "quiz-imports").
 */
router.post(
  '/import-files',
  requireAuth,
  requireAdmin,
  upload.array('files', 10),
  async (req, res, next) => {
    try {
      const files = req.files
      if (!Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'Upload at least one file (max 10).' })
      }

      const courseCode =
        typeof req.body.courseCode === 'string' ? req.body.courseCode.trim() : ''
      const courseNote =
        typeof req.body.courseNote === 'string' ? req.body.courseNote.trim() : ''

      if (!courseCode) {
        return res.status(400).json({
          error: 'Course code is required (Code column).',
        })
      }
      if (!courseNote) {
        return res.status(400).json({
          error: 'Course title is required (Course column).',
        })
      }

      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({
          error: 'Supabase is not configured',
          detail:
            process.env.DEBUG_ERRORS === 'true'
              ? 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
              : undefined,
        })
      }

      const supabase = createClient(supabaseUrl, supabaseKey)

      const batch = await prisma.quizImportBatch.create({
        data: {
          userId: req.user.id,
          courseCode,
          courseNote,
        },
      })

      const created = []
      for (const file of files) {
        const safeBase = file.originalname.replace(/[^\w.\-]/g, '_') || 'file'
        const objectPath = `${req.user.id}/${batch.id}/${Date.now()}-${safeBase}`

        const { error: upErr } = await supabase.storage
          .from(QUIZ_IMPORT_BUCKET)
          .upload(objectPath, file.buffer, {
            contentType: file.mimetype || 'application/octet-stream',
            upsert: false,
          })

        if (upErr) {
          console.error('[quiz/import-files] Supabase upload:', upErr.message)
          return res.status(500).json({
            error: 'Failed to upload to storage',
            detail:
              process.env.DEBUG_ERRORS === 'true' ? upErr.message : undefined,
          })
        }

        const storagePath = `${QUIZ_IMPORT_BUCKET}/${objectPath}`
        const row = await prisma.quizImportFile.create({
          data: {
            batchId: batch.id,
            originalName: file.originalname,
            mimeType: file.mimetype || 'application/octet-stream',
            size: file.size,
            relativePath: storagePath,
          },
        })
        created.push({ id: row.id, originalName: row.originalName, size: row.size })
      }

      return res.status(201).json({
        ok: true,
        batchId: batch.id,
        fileCount: created.length,
        files: created,
        bucket: QUIZ_IMPORT_BUCKET,
      })
    } catch (err) {
      return next(err)
    }
  },
)

const QUIZ_TABLE_LIMIT_MAX = 20

/**
 * GET /api/quiz/table
 * Paginated rows for the Quiz page: imports + AI collections merged by createdAt (newest first).
 * Admins see both; learners see AI collections only. Query: page (0-based), limit (max 20, default 20).
 */
router.get('/table', requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(0, Number.parseInt(String(req.query.page ?? '0'), 10) || 0)
    const limit = Math.min(
      QUIZ_TABLE_LIMIT_MAX,
      Math.max(
        1,
        Number.parseInt(String(req.query.limit ?? String(QUIZ_TABLE_LIMIT_MAX)), 10) ||
          QUIZ_TABLE_LIMIT_MAX,
      ),
    )
    const offset = page * limit

    const roleStr = String(req.user.role || '').toLowerCase()
    const profStr = String(req.user.professionalRole || '').toLowerCase()
    let isAdmin = roleStr === 'admin' || profStr === 'admin'
    if (!isAdmin && req.session.professionalRole === undefined) {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true, professionalRole: true },
      })
      isAdmin = Boolean(
        dbUser &&
          (String(dbUser.role || '').toLowerCase() === 'admin' ||
            String(dbUser.professionalRole || '').toLowerCase() === 'admin'),
      )
    }

    const take = limit + 1
    let combined
    if (isAdmin) {
      // All import rows first (pending = not yet generated at top among imports), then all AI rows — each group by newest first.
      combined = await prisma.$queryRaw`
        SELECT id, kind, "createdAt" FROM (
          SELECT b.id, 'import'::text AS kind, b."createdAt",
            CASE
              WHEN EXISTS (
                SELECT 1 FROM "AiQuizCollection" c
                WHERE c."batchId" = b.id
                AND EXISTS (
                  SELECT 1 FROM "AiQuizQuestion" q WHERE q."collectionId" = c.id
                )
              ) THEN 0
              ELSE 1
            END AS gen_pending
          FROM "QuizImportBatch" b
          UNION ALL
          SELECT c.id, 'ai'::text AS kind, c."createdAt", 0::int AS gen_pending
          FROM "AiQuizCollection" c
        ) sub
        ORDER BY
          CASE WHEN sub.kind = 'import' THEN 1 ELSE 0 END DESC,
          sub.gen_pending DESC,
          sub."createdAt" DESC,
          sub.id DESC
        LIMIT ${take}
        OFFSET ${offset}
      `
    } else {
      combined = await prisma.$queryRaw`
        SELECT id, kind, "createdAt" FROM (
          SELECT c.id, 'ai'::text AS kind, c."createdAt"
          FROM "AiQuizCollection" c
        ) sub
        ORDER BY "createdAt" DESC, id DESC
        LIMIT ${take}
        OFFSET ${offset}
      `
    }

    const hasMore = combined.length > limit
    const slice = hasMore ? combined.slice(0, limit) : combined

    const importIds = slice.filter((r) => r.kind === 'import').map((r) => r.id)
    const aiIds = slice.filter((r) => r.kind === 'ai').map((r) => r.id)

    const submissionAggPromise =
      aiIds.length > 0
        ? prisma.$queryRaw`
        SELECT
          s."collectionId" AS cid,
          BOOL_OR(s."totalQuestions" > 0 AND s."score" = s."totalQuestions") AS "hasPerfect"
        FROM "AiQuizSubmission" s
        WHERE s."userId" = ${req.user.id}
          AND s."collectionId" IN (${Prisma.join(aiIds)})
        GROUP BY s."collectionId"
      `
        : Promise.resolve([])

    const [batches, collections, totalImportCount, submissionRows] = await Promise.all([
      importIds.length
        ? prisma.quizImportBatch.findMany({
            where: { id: { in: importIds } },
            include: {
              files: { orderBy: { id: 'asc' } },
              primaryCollection: {
                select: {
                  id: true,
                  _count: { select: { questions: true } },
                },
              },
              aiQuizCollections: {
                select: {
                  id: true,
                  _count: { select: { questions: true } },
                },
              },
            },
          })
        : Promise.resolve([]),
      aiIds.length
        ? prisma.aiQuizCollection.findMany({
            where: { id: { in: aiIds } },
            include: {
              _count: { select: { questions: true } },
              batch: {
                select: {
                  files: {
                    orderBy: { id: 'asc' },
                    select: { id: true, originalName: true },
                  },
                },
              },
            },
          })
        : Promise.resolve([]),
      isAdmin ? prisma.quizImportBatch.count() : Promise.resolve(0),
      submissionAggPromise,
    ])

    const versionIdSet = new Set(aiIds)
    for (const b of batches) {
      if (b.primaryCollectionId) versionIdSet.add(b.primaryCollectionId)
      for (const c of b.aiQuizCollections || []) {
        if (c.id) versionIdSet.add(c.id)
      }
    }
    const versionRows =
      versionIdSet.size > 0
        ? await prisma.aiQuizQuestion.groupBy({
            by: ['collectionId'],
            where: { collectionId: { in: [...versionIdSet] } },
            _max: { generationVersion: true },
          })
        : []
    const maxGenByCollectionId = Object.fromEntries(
      versionRows.map((r) => [r.collectionId, r._max.generationVersion ?? 1]),
    )

    const batchById = Object.fromEntries(batches.map((b) => [b.id, b]))
    const collectionById = Object.fromEntries(collections.map((c) => [c.id, c]))

    const perfectCollectionIds = new Set()
    const attemptedCollectionIds = new Set()
    for (const row of submissionRows) {
      attemptedCollectionIds.add(row.cid)
      if (row.hasPerfect) perfectCollectionIds.add(row.cid)
    }

    const rows = slice
      .map((r) => {
        if (r.kind === 'import') {
          const b = batchById[r.id]
          if (!b) return null
          const hasGeneratedQuiz = (b.aiQuizCollections || []).some(
            (c) => (c._count?.questions ?? 0) > 0,
          )
          const pid = b.primaryCollectionId
          const cols = b.aiQuizCollections || []
          const sumAllQuestions = cols.reduce((sum, c) => sum + (c._count?.questions ?? 0), 0)
          let maxVAcross = 1
          for (const c of cols) {
            const v = maxGenByCollectionId[c.id] ?? 1
            if (v > maxVAcross) maxVAcross = v
          }
          let poolVersion = 0
          let totalPoolQuestions = 0
          if (pid && b.primaryCollection) {
            poolVersion = Math.max(maxGenByCollectionId[pid] ?? 1, maxVAcross)
            totalPoolQuestions = sumAllQuestions
          } else if (hasGeneratedQuiz) {
            totalPoolQuestions = sumAllQuestions
            poolVersion = maxVAcross
          }
          return {
            kind: 'import',
            batchId: b.id,
            createdAt: b.createdAt,
            courseCode: b.courseCode,
            courseNote: b.courseNote,
            files: b.files,
            hasGeneratedQuiz,
            primaryCollectionId: pid ?? null,
            poolVersion: hasGeneratedQuiz ? poolVersion : 0,
            totalPoolQuestions,
          }
        }
        const c = collectionById[r.id]
        if (!c) return null
        return {
          kind: 'ai',
          collectionId: c.id,
          createdAt: c.createdAt,
          title: c.title,
          courseCode: c.courseCode,
          courseNote: c.courseNote,
          batchId: c.batchId,
          model: c.model,
          questionCount: c._count.questions,
          poolVersion: maxGenByCollectionId[c.id] ?? 1,
          sourceFiles: c.batch?.files ?? [],
          userHasPerfectScore: perfectCollectionIds.has(c.id),
          userHasAttempted: attemptedCollectionIds.has(c.id),
        }
      })
      .filter(Boolean)

    res.set('Cache-Control', 'private, no-store')
    return res.json({
      rows,
      page,
      limit,
      hasMore,
      totalImportCount,
    })
  } catch (err) {
    return next(err)
  }
})

/**
 * GET /api/quiz/ai-collections
 * AI-generated quiz collections (MCQs from Gemini). Any authenticated user.
 */
router.get('/ai-collections', requireAuth, async (req, res, next) => {
  try {
    const collections = await prisma.aiQuizCollection.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        _count: { select: { questions: true } },
        batch: {
          select: {
            files: {
              orderBy: { id: 'asc' },
              select: { id: true, originalName: true },
            },
          },
        },
      },
    })

    const collectionIds = collections.map((c) => c.id)
    const genRows =
      collectionIds.length > 0
        ? await prisma.aiQuizQuestion.groupBy({
            by: ['collectionId'],
            where: { collectionId: { in: collectionIds } },
            _max: { generationVersion: true },
          })
        : []
    const maxGenByCollectionId = Object.fromEntries(
      genRows.map((r) => [r.collectionId, r._max.generationVersion ?? 1]),
    )

    const perfectCollectionIds = new Set()
    const attemptedCollectionIds = new Set()
    if (collectionIds.length > 0) {
      const aggRows = await prisma.$queryRaw`
        SELECT
          s."collectionId" AS cid,
          BOOL_OR(s."totalQuestions" > 0 AND s."score" = s."totalQuestions") AS "hasPerfect"
        FROM "AiQuizSubmission" s
        WHERE s."userId" = ${req.user.id}
          AND s."collectionId" IN (${Prisma.join(collectionIds)})
        GROUP BY s."collectionId"
      `
      for (const row of aggRows) {
        attemptedCollectionIds.add(row.cid)
        if (row.hasPerfect) perfectCollectionIds.add(row.cid)
      }
    }

    res.set('Cache-Control', 'private, no-store')
    return res.json({
      collections: collections.map((c) => ({
        id: c.id,
        title: c.title,
        courseCode: c.courseCode,
        courseNote: c.courseNote,
        batchId: c.batchId,
        model: c.model,
        createdAt: c.createdAt,
        questionCount: c._count.questions,
        poolVersion: maxGenByCollectionId[c.id] ?? 1,
        sourceFiles: c.batch?.files ?? [],
        userHasPerfectScore: perfectCollectionIds.has(c.id),
        userHasAttempted: attemptedCollectionIds.has(c.id),
      })),
    })
  } catch (err) {
    return next(err)
  }
})

/**
 * GET /api/quiz/ai-collections/:collectionId/my-submissions
 * Current user's past attempts on this quiz (for score history). Any authenticated user.
 */
router.get(
  '/ai-collections/:collectionId/my-submissions',
  requireAuth,
  async (req, res, next) => {
    try {
      const { collectionId } = req.params
      const col = await prisma.aiQuizCollection.findUnique({
        where: { id: collectionId },
        select: { id: true },
      })
      if (!col) {
        return res.status(404).json({ error: 'Collection not found' })
      }
      const [attemptCount, rows] = await prisma.$transaction([
        prisma.aiQuizSubmission.count({
          where: { userId: req.user.id, collectionId },
        }),
        prisma.aiQuizSubmission.findMany({
          where: { userId: req.user.id, collectionId },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            score: true,
            totalQuestions: true,
            createdAt: true,
          },
        }),
      ])
      return res.json({
        attemptCount,
        attempts: rows.map((r) => ({
          id: r.id,
          score: r.score,
          total: r.totalQuestions,
          createdAt: r.createdAt,
        })),
      })
    } catch (err) {
      return next(err)
    }
  },
)

/**
 * GET /api/quiz/ai-collections/:collectionId/play
 * Questions for taking the quiz (no correct answers). Any authenticated user.
 * Pooled collections: up to PLAY_QUIZ_QUESTION_COUNT random questions; prefers avoiding the
 * set from the user's previous attempt on this collection when the pool is large enough.
 */
router.get('/ai-collections/:collectionId/play', requireAuth, async (req, res, next) => {
  try {
    const { collectionId } = req.params
    const userId = req.user.id

    const col = await prisma.aiQuizCollection.findUnique({
      where: { id: collectionId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          select: { id: true, stem: true, choices: true },
        },
      },
    })
    if (!col) {
      return res.status(404).json({ error: 'Collection not found' })
    }

    const all = col.questions.map((q) => ({
      id: q.id,
      stem: q.stem,
      choices: choiceArrayFromJson(q.choices),
    }))

    const lastSub = await prisma.aiQuizSubmission.findFirst({
      where: { userId, collectionId },
      orderBy: { createdAt: 'desc' },
      select: { detailJson: true },
    })
    const lastIds = new Set(questionIdsFromSubmissionDetail(lastSub?.detailJson))
    let pool = all
    if (lastIds.size > 0 && all.length > lastIds.size) {
      const without = all.filter((q) => !lastIds.has(q.id))
      if (without.length >= PLAY_QUIZ_QUESTION_COUNT) {
        pool = without
      }
    }

    shuffleInPlace(pool)
    const take = Math.min(PLAY_QUIZ_QUESTION_COUNT, pool.length)
    const selected = pool.slice(0, take)

    return res.json({
      title: col.title,
      questions: selected,
      playQuestionCount: selected.length,
      poolQuestionCount: all.length,
    })
  } catch (err) {
    return next(err)
  }
})

/**
 * POST /api/quiz/ai-collections/:collectionId/socratic-hint
 * Body: { highlightedText, questionId?, step: "keywords"|"explain", keywords?: string[] }
 * Uses Gemini + collection metadata and optional per-question sourceSnippet (never exposes answers).
 */
router.post(
  '/ai-collections/:collectionId/socratic-hint',
  requireAuth,
  async (req, res, next) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey || !String(apiKey).trim()) {
        return res.status(503).json({
          error: 'Socratic hints are unavailable (GEMINI_API_KEY is not configured).',
        })
      }

      const { collectionId } = req.params
      const { highlightedText, questionId, step, keywords } = req.body || {}

      if (step !== 'keywords' && step !== 'explain') {
        return res.status(400).json({ error: 'step must be "keywords" or "explain"' })
      }

      const ht =
        typeof highlightedText === 'string' ? highlightedText.trim().replace(/\s+/g, ' ') : ''
      if (ht.length < 2 || ht.length > 500) {
        return res.status(400).json({ error: 'highlightedText must be 2–500 characters' })
      }

      const col = await prisma.aiQuizCollection.findUnique({
        where: { id: collectionId },
        select: {
          id: true,
          title: true,
          courseCode: true,
          courseNote: true,
          batch: {
            select: {
              files: { select: { originalName: true }, orderBy: { id: 'asc' } },
            },
          },
        },
      })
      if (!col) {
        return res.status(404).json({ error: 'Collection not found' })
      }

      let questionStem
      let sourceSnippet
      if (questionId && typeof questionId === 'string') {
        const q = await prisma.aiQuizQuestion.findFirst({
          where: { id: questionId, collectionId },
          select: { stem: true, sourceSnippet: true },
        })
        if (q) {
          questionStem = q.stem
          sourceSnippet = q.sourceSnippet
        }
      }

      const sourceFilenames = (col.batch?.files || [])
        .map((f) => f.originalName)
        .filter((n) => typeof n === 'string' && n.trim())

      let keywordList = []
      if (step === 'explain') {
        if (!Array.isArray(keywords) || keywords.length === 0) {
          return res.status(400).json({ error: 'keywords array is required for explain step' })
        }
        keywordList = keywords
          .slice(0, 12)
          .map((k) => String(k).trim())
          .filter(Boolean)
        if (keywordList.length === 0) {
          return res.status(400).json({ error: 'keywords array is required for explain step' })
        }
      }

      const resolvedModel =
        (typeof process.env.GEMINI_MODEL === 'string' && process.env.GEMINI_MODEL.trim()) ||
        undefined

      const payload = await generateSocraticHint({
        apiKey: String(apiKey).trim(),
        modelName: resolvedModel,
        step,
        highlightedText: ht,
        quizTitle: col.title,
        courseCode: col.courseCode,
        courseNote: col.courseNote,
        sourceFilenames,
        questionStem,
        sourceSnippet,
        keywordsFromPrior: keywordList,
      })

      return res.json(payload)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[quiz/socratic-hint]', msg)
      return res.status(502).json({
        error: 'Failed to generate hint. Try again in a moment.',
        detail: process.env.DEBUG_ERRORS === 'true' ? msg : undefined,
      })
    }
  },
)

/**
 * POST /api/quiz/ai-collections/:collectionId/socratic-feedback
 * Body: { vote: "upvote"|"downvote"|"feedback", feedbackText?, context? }
 * Persists learner ratings / free-text feedback for analytics (Postgres / Supabase).
 */
router.post(
  '/ai-collections/:collectionId/socratic-feedback',
  requireAuth,
  async (req, res, next) => {
    try {
      const { collectionId } = req.params
      const { vote, feedbackText, context } = req.body || {}

      const v = typeof vote === 'string' ? vote.trim().toLowerCase() : ''
      if (!['upvote', 'downvote', 'feedback'].includes(v)) {
        return res.status(400).json({ error: 'vote must be upvote, downvote, or feedback' })
      }

      let text = typeof feedbackText === 'string' ? feedbackText.trim() : ''
      if (v === 'feedback') {
        if (text.length < 1) {
          return res.status(400).json({ error: 'feedbackText is required for feedback votes' })
        }
        if (text.length > 2000) {
          return res.status(400).json({ error: 'feedbackText must be at most 2000 characters' })
        }
      } else {
        text = ''
      }

      const col = await prisma.aiQuizCollection.findUnique({
        where: { id: collectionId },
        select: { id: true },
      })
      if (!col) {
        return res.status(404).json({ error: 'Collection not found' })
      }

      const safeContext = sanitizeSocraticFeedbackContext(context)
      let questionId = null
      if (safeContext.questionId) {
        const q = await prisma.aiQuizQuestion.findFirst({
          where: { id: safeContext.questionId, collectionId },
          select: { id: true },
        })
        if (q) questionId = q.id
      }

      await prisma.socraticHintFeedback.create({
        data: {
          userId: req.user.id,
          collectionId,
          questionId,
          vote: v,
          feedbackText: v === 'feedback' ? text : null,
          contextJson: safeContext,
        },
      })

      return res.status(201).json({ ok: true })
    } catch (err) {
      return next(err)
    }
  },
)

/**
 * POST /api/quiz/ai-collections/:collectionId/submit
 * Body: { answers: [{ questionId, selectedOriginalIndex }] } (indices in DB choice order)
 * Grades server-side, saves submission for analytics (Postgres / Supabase).
 *
 * Perfect score XP: base 100 per perfect submit (unchanged for retries).
 * Same-day streak (UTC calendar day): first perfect on a *different* quiz today → +20% of base
 * (20 XP) on the first perfect of *this* quiz today only (no streak on same-quiz retries).
 */
router.post('/ai-collections/:collectionId/submit', requireAuth, async (req, res, next) => {
  try {
    const { collectionId } = req.params
    const answers = req.body?.answers

    const col = await prisma.aiQuizCollection.findUnique({
      where: { id: collectionId },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
      },
    })
    if (!col) {
      return res.status(404).json({ error: 'Collection not found' })
    }
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers must be an array' })
    }
    const maxPerAttempt = Math.min(PLAY_QUIZ_QUESTION_COUNT, col.questions.length)
    if (answers.length < 1) {
      return res.status(400).json({ error: 'Submit at least one answer.' })
    }
    if (answers.length > maxPerAttempt) {
      return res.status(400).json({
        error: `Submit at most ${maxPerAttempt} answer(s) for this attempt.`,
      })
    }

    const byQuestionId = new Map(col.questions.map((q) => [q.id, q]))
    const seen = new Set()

    for (const a of answers) {
      if (!a || typeof a.questionId !== 'string') {
        return res.status(400).json({ error: 'Each answer needs questionId' })
      }
      if (seen.has(a.questionId)) {
        return res.status(400).json({ error: 'Duplicate questionId in answers' })
      }
      seen.add(a.questionId)
      const q = byQuestionId.get(a.questionId)
      if (!q) {
        return res.status(400).json({ error: `Unknown question: ${a.questionId}` })
      }
      const choiceList = choiceArrayFromJson(q.choices)
      const sel = a.selectedOriginalIndex
      if (typeof sel !== 'number' || !Number.isInteger(sel) || sel < 0 || sel >= choiceList.length) {
        return res.status(400).json({ error: 'Invalid selectedOriginalIndex' })
      }
    }

    if (seen.size !== answers.length) {
      return res.status(400).json({ error: 'Invalid answers payload' })
    }

    const detailAnswers = []
    let score = 0

    for (const a of answers) {
      const q = byQuestionId.get(a.questionId)
      const choiceList = choiceArrayFromJson(q.choices)
      const selectedOriginalIndex = a.selectedOriginalIndex
      const isCorrect = selectedOriginalIndex === q.correctIndex
      if (isCorrect) score += 1
      detailAnswers.push({
        questionId: q.id,
        stem: q.stem,
        selectedOriginalIndex,
        correctOriginalIndex: q.correctIndex,
        isCorrect,
        choiceTexts: choiceList,
        selectedText: choiceList[selectedOriginalIndex] ?? null,
        correctText: choiceList[q.correctIndex] ?? null,
        explanation: q.explanation ?? null,
      })
    }

    const totalQuestions = answers.length
    const PERFECT_SCORE_XP = 100
    const SAME_DAY_STREAK_BONUS_RATE = 0.2
    const isPerfectScore = totalQuestions > 0 && score === totalQuestions
    const perfectScoreXpAwarded = isPerfectScore ? PERFECT_SCORE_XP : 0

    const { lifetimeAiQuizSubmissions, xp, xpAwarded, streakBonusXp, level: newLevel } =
      await prisma.$transaction(async (tx) => {
        const { start: dayStart, end: dayEnd } = utcDayRange(new Date())
        const priorPerfectOthers = await tx.aiQuizSubmission.findMany({
          where: {
            userId: req.user.id,
            createdAt: { gte: dayStart, lt: dayEnd },
            collectionId: { not: col.id },
          },
          select: { collectionId: true, score: true, totalQuestions: true },
        })
        const distinctOtherPerfectToday = new Set(
          priorPerfectOthers
            .filter((s) => s.totalQuestions > 0 && s.score === s.totalQuestions)
            .map((s) => s.collectionId),
        ).size
        const priorSameQuizToday = await tx.aiQuizSubmission.findMany({
          where: {
            userId: req.user.id,
            collectionId: col.id,
            createdAt: { gte: dayStart, lt: dayEnd },
          },
          select: { score: true, totalQuestions: true },
        })
        const alreadyPerfectThisQuizToday = priorSameQuizToday.some(
          (s) => s.totalQuestions > 0 && s.score === s.totalQuestions,
        )
        const streakBonusXpCalc =
          isPerfectScore &&
          !alreadyPerfectThisQuizToday &&
          distinctOtherPerfectToday > 0
            ? Math.floor(PERFECT_SCORE_XP * SAME_DAY_STREAK_BONUS_RATE)
            : 0
        const totalXpGained = perfectScoreXpAwarded + streakBonusXpCalc

        await tx.aiQuizSubmission.create({
          data: {
            userId: req.user.id,
            collectionId: col.id,
            score,
            totalQuestions,
            detailJson: {
              schemaVersion: 1,
              userId: req.user.id,
              collectionId: col.id,
              collectionTitle: col.title,
              courseNote: col.courseNote,
              model: col.model ?? null,
              submittedAt: new Date().toISOString(),
              answers: detailAnswers,
              perfectScoreXpAwarded,
              streakBonusXp: streakBonusXpCalc,
              sameDayDistinctPerfectOthersBefore: distinctOtherPerfectToday,
              alreadyPerfectThisQuizTodayBefore: alreadyPerfectThisQuizToday,
              streakBonusRate: SAME_DAY_STREAK_BONUS_RATE,
            },
          },
        })
        const u = await tx.user.update({
          where: { id: req.user.id },
          data: {
            aiQuizSubmissionCount: { increment: 1 },
            ...(totalXpGained > 0 ? { xp: { increment: totalXpGained } } : {}),
          },
          select: { aiQuizSubmissionCount: true, xp: true },
        })
        const nextLevel = levelFromTotalXp(u.xp)
        await tx.user.update({
          where: { id: req.user.id },
          data: { level: nextLevel },
        })
        return {
          lifetimeAiQuizSubmissions: u.aiQuizSubmissionCount,
          xp: u.xp,
          xpAwarded: totalXpGained,
          streakBonusXp: streakBonusXpCalc,
          level: nextLevel,
        }
      })

    return res.status(201).json({
      ok: true,
      score,
      total: totalQuestions,
      lifetimeAiQuizSubmissions,
      xp,
      xpAwarded,
      perfectScoreXp: perfectScoreXpAwarded,
      streakBonusXp,
      level: newLevel,
      results: detailAnswers.map((d) => ({
        questionId: d.questionId,
        isCorrect: d.isCorrect,
        selectedOriginalIndex: d.selectedOriginalIndex,
        correctOriginalIndex: d.correctOriginalIndex,
        explanation: d.explanation,
      })),
    })
  } catch (err) {
    return next(err)
  }
})

/**
 * GET /api/quiz/ai-collections/:collectionId
 * Full collection with ordered questions (includes answers). Admin only.
 */
router.get(
  '/ai-collections/:collectionId',
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { collectionId } = req.params
      const col = await prisma.aiQuizCollection.findUnique({
        where: { id: collectionId },
        include: {
          questions: { orderBy: { orderIndex: 'asc' } },
        },
      })
      if (!col) {
        return res.status(404).json({ error: 'Collection not found' })
      }
      return res.json({ collection: col })
    } catch (err) {
      return next(err)
    }
  },
)

/**
 * PATCH /api/quiz/ai-collections/:collectionId
 * Body: optional { title?, courseCode?, courseNote? } — at least one field required.
 */
router.patch(
  '/ai-collections/:collectionId',
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { collectionId } = req.params
      const body = req.body || {}
      const data = {}
      if (typeof body.title === 'string') {
        const t = body.title.trim()
        if (!t) return res.status(400).json({ error: 'title cannot be empty' })
        data.title = t
      }
      if (Object.prototype.hasOwnProperty.call(body, 'courseCode')) {
        if (body.courseCode === null) {
          data.courseCode = null
        } else if (typeof body.courseCode === 'string') {
          data.courseCode = body.courseCode.trim() || null
        }
      }
      if (typeof body.courseNote === 'string') {
        data.courseNote = body.courseNote.trim() || null
      }
      if (Object.keys(data).length === 0) {
        return res.status(400).json({
          error: 'Send at least one of: title, courseCode, courseNote',
        })
      }
      const updated = await prisma.aiQuizCollection.update({
        where: { id: collectionId },
        data,
        include: {
          _count: { select: { questions: true } },
          batch: {
            select: {
              files: {
                orderBy: { id: 'asc' },
                select: { id: true, originalName: true },
              },
            },
          },
        },
      })
      return res.json({
        collection: {
          id: updated.id,
          title: updated.title,
          courseCode: updated.courseCode,
          courseNote: updated.courseNote,
          batchId: updated.batchId,
          model: updated.model,
          createdAt: updated.createdAt,
          questionCount: updated._count.questions,
          sourceFiles: updated.batch?.files ?? [],
        },
      })
    } catch (err) {
      if (err?.code === 'P2025') {
        return res.status(404).json({ error: 'Collection not found' })
      }
      return next(err)
    }
  },
)

/**
 * DELETE /api/quiz/ai-collections/:collectionId
 * Cascades questions and submissions. Admin only.
 */
router.delete(
  '/ai-collections/:collectionId',
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { collectionId } = req.params
      await prisma.aiQuizCollection.delete({ where: { id: collectionId } })
      return res.json({ ok: true })
    } catch (err) {
      if (err?.code === 'P2025') {
        return res.status(404).json({ error: 'Collection not found' })
      }
      return next(err)
    }
  },
)

/**
 * POST /api/quiz/batches/:batchId/generate-questions
 * Body: { questionCount?: number } (default 10, max 50)
 * Downloads batch files from Supabase, sends to Gemini, saves AiQuizCollection + questions.
 */
router.post(
  '/batches/:batchId/generate-questions',
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        return res.status(503).json({
          error: 'Gemini is not configured',
          detail:
            process.env.DEBUG_ERRORS === 'true'
              ? 'Set GEMINI_API_KEY in the API environment'
              : undefined,
        })
      }

      const { batchId } = req.params
      const rawCount = req.body?.questionCount
      const questionCount = Math.min(
        50,
        Math.max(1, Number.parseInt(String(rawCount ?? 10), 10) || 10),
      )

      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Supabase is not configured' })
      }

      const batch = await prisma.quizImportBatch.findUnique({
        where: { id: batchId },
        include: { files: { orderBy: { id: 'asc' } } },
      })
      if (!batch) {
        return res.status(404).json({ error: 'Import batch not found' })
      }
      if (!batch.files.length) {
        return res.status(400).json({ error: 'This batch has no files' })
      }

      const unsupported = batch.files.filter(
        (f) => !isLikelyGeminiSupportedMime(f.mimeType, f.originalName),
      )
      if (unsupported.length) {
        return res.status(400).json({
          error:
            'One or more files use a MIME type Gemini may not support. Use PDF, text, or images.',
          files: unsupported.map((f) => f.originalName),
        })
      }

      const supabase = createClient(supabaseUrl, supabaseKey)
      const buffers = []
      for (const f of batch.files) {
        const buffer = await downloadImportFileBuffer(supabase, f.relativePath)
        buffers.push({
          buffer,
          mimeType: effectiveMimeType(f.mimeType, f.originalName),
          displayName: f.originalName,
        })
      }

      const resolvedModel =
        (typeof process.env.GEMINI_MODEL === 'string' && process.env.GEMINI_MODEL.trim()) ||
        'gemini-2.5-flash'
      let generated
      try {
        const geminiContext = [batch.courseCode, batch.courseNote]
          .filter((s) => typeof s === 'string' && s.trim())
          .join(' — ')
        generated = await generateQuizFromBuffers({
          apiKey,
          modelName: resolvedModel,
          files: buffers,
          courseNote: geminiContext,
          questionCount,
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error('[quiz/generate-questions] Gemini:', msg)
        return res.status(502).json({
          error: 'Failed to generate quiz from Gemini',
          detail: process.env.DEBUG_ERRORS === 'true' ? msg : undefined,
        })
      }

      const out = await prisma.$transaction(async (tx) => {
        let col = null
        let primaryId = batch.primaryCollectionId

        if (primaryId) {
          col = await tx.aiQuizCollection.findFirst({
            where: { id: primaryId, batchId: batch.id },
          })
        }
        if (!col) {
          const oldest = await tx.aiQuizCollection.findFirst({
            where: { batchId: batch.id },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          })
          if (oldest) {
            col = oldest
            await tx.quizImportBatch.update({
              where: { id: batch.id },
              data: { primaryCollectionId: oldest.id },
            })
          }
        }

        if (col) {
          const maxOrder = await tx.aiQuizQuestion.aggregate({
            where: { collectionId: col.id },
            _max: { orderIndex: true },
          })
          const maxGen = await tx.aiQuizQuestion.aggregate({
            where: { collectionId: col.id },
            _max: { generationVersion: true },
          })
          const nextGen = (maxGen._max.generationVersion ?? 0) + 1
          const baseOrder = (maxOrder._max.orderIndex ?? -1) + 1

          await tx.aiQuizQuestion.createMany({
            data: generated.questions.map((q, i) => ({
              collectionId: col.id,
              orderIndex: baseOrder + i,
              generationVersion: nextGen,
              stem: q.stem,
              choices: q.choices,
              correctIndex: q.correctIndex,
              explanation: q.explanation ?? null,
              sourceSnippet: q.sourceSnippet ?? null,
            })),
          })

          await tx.aiQuizCollection.update({
            where: { id: col.id },
            data: {
              title: generated.title,
              model: resolvedModel,
            },
          })

          const total = await tx.aiQuizQuestion.count({ where: { collectionId: col.id } })
          return {
            collectionId: col.id,
            title: generated.title,
            questionCount: total,
            pooledAppend: true,
            generationVersion: nextGen,
            model: resolvedModel,
          }
        }

        const newCol = await tx.aiQuizCollection.create({
          data: {
            userId: req.user.id,
            batchId: batch.id,
            title: generated.title,
            courseCode: batch.courseCode,
            courseNote: batch.courseNote,
            model: resolvedModel,
            questions: {
              create: generated.questions.map((q, i) => ({
                orderIndex: i,
                generationVersion: 1,
                stem: q.stem,
                choices: q.choices,
                correctIndex: q.correctIndex,
                explanation: q.explanation,
                sourceSnippet: q.sourceSnippet,
              })),
            },
          },
          include: { questions: { orderBy: { orderIndex: 'asc' } } },
        })
        await tx.quizImportBatch.update({
          where: { id: batch.id },
          data: { primaryCollectionId: newCol.id },
        })
        return {
          collectionId: newCol.id,
          title: newCol.title,
          questionCount: newCol.questions.length,
          pooledAppend: false,
          generationVersion: 1,
          model: newCol.model,
        }
      })

      return res.status(201).json({
        ok: true,
        collectionId: out.collectionId,
        title: out.title,
        questionCount: out.questionCount,
        pooledAppend: out.pooledAppend,
        poolGenerationVersion: out.generationVersion,
        model: out.model,
      })
    } catch (err) {
      return next(err)
    }
  },
)

export default router
