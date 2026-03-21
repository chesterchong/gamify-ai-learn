import { Router } from 'express'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import prisma from '../db/prisma.js'
import requireAuth from '../middleware/requireAuth.js'
import requireAdmin from '../middleware/requireAdmin.js'
import {
  generateQuizFromBuffers,
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
    return res.json({ batches })
  } catch (err) {
    return next(err)
  }
})

/**
 * POST /api/quiz/import-files
 * multipart: files[] (max 10), courseNote required (code/title)
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

      const courseNote =
        typeof req.body.courseNote === 'string' ? req.body.courseNote.trim() : ''

      if (!courseNote) {
        return res.status(400).json({
          error: 'Course code and title are required (use Code/Title field).',
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
    return res.json({
      collections: collections.map((c) => ({
        id: c.id,
        title: c.title,
        courseNote: c.courseNote,
        batchId: c.batchId,
        model: c.model,
        createdAt: c.createdAt,
        questionCount: c._count.questions,
        sourceFiles: c.batch?.files ?? [],
      })),
    })
  } catch (err) {
    return next(err)
  }
})

/**
 * GET /api/quiz/ai-collections/:collectionId
 * Full collection with ordered questions. Any authenticated user.
 */
router.get(
  '/ai-collections/:collectionId',
  requireAuth,
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
        generated = await generateQuizFromBuffers({
          apiKey,
          modelName: resolvedModel,
          files: buffers,
          courseNote: batch.courseNote || '',
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

      const collection = await prisma.$transaction(async (tx) => {
        const col = await tx.aiQuizCollection.create({
          data: {
            userId: req.user.id,
            batchId: batch.id,
            title: generated.title,
            courseNote: batch.courseNote,
            model: resolvedModel,
            questions: {
              create: generated.questions.map((q, i) => ({
                orderIndex: i,
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
        return col
      })

      return res.status(201).json({
        ok: true,
        collectionId: collection.id,
        title: collection.title,
        questionCount: collection.questions.length,
        model: collection.model,
      })
    } catch (err) {
      return next(err)
    }
  },
)

export default router
