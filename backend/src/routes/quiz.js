import { Router } from 'express'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import prisma from '../db/prisma.js'
import requireAuth from '../middleware/requireAuth.js'
import requireAdmin from '../middleware/requireAdmin.js'

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
 * multipart: files[] (max 10), optional courseNote
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
          courseNote: courseNote || null,
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

export default router
