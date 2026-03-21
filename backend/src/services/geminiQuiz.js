import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server'

/** @see https://ai.google.dev/gemini-api/docs/models/gemini */
const DEFAULT_MODEL = 'gemini-2.5-flash'

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * @param {string} mime
 * @param {string} [filename]
 */
export function effectiveMimeType(mime, filename = '') {
  const m = (mime || '').toLowerCase()
  if (m && m !== 'application/octet-stream') return m
  const ext = (filename || '').split('.').pop()?.toLowerCase()
  const map = {
    pdf: 'application/pdf',
    txt: 'text/plain',
    md: 'text/markdown',
    html: 'text/html',
    htm: 'text/html',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
  }
  return map[ext] || mime || 'application/octet-stream'
}

/**
 * @param {string} mime
 * @param {string} [filename]
 */
export function isLikelyGeminiSupportedMime(mime, filename = '') {
  const eff = effectiveMimeType(mime, filename)
  if (eff.startsWith('application/pdf')) return true
  if (eff.startsWith('text/')) return true
  if (eff.startsWith('image/')) return true
  return false
}

/**
 * @param {GoogleAIFileManager} fileManager
 * @param {string} fileName
 * @param {{ maxWaitMs?: number, intervalMs?: number }} [opts]
 */
async function waitForFileActive(fileManager, fileName, opts = {}) {
  const maxWaitMs = opts.maxWaitMs ?? 120_000
  const intervalMs = opts.intervalMs ?? 2000
  const deadline = Date.now() + maxWaitMs
  while (Date.now() < deadline) {
    const meta = await fileManager.getFile(fileName)
    if (meta.state === FileState.ACTIVE) return meta
    if (meta.state === FileState.FAILED) {
      const msg = meta.error?.message || 'File processing failed in Gemini'
      throw new Error(msg)
    }
    await sleep(intervalMs)
  }
  throw new Error('Timed out waiting for Gemini to process uploaded file(s)')
}

function parseQuizJson(text) {
  let raw = typeof text === 'string' ? text.trim() : String(text)
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) raw = fenced[1].trim()
  return JSON.parse(raw)
}

/**
 * @param {unknown} data
 * @param {number} requestedCount
 */
function validateQuizPayload(data, requestedCount) {
  if (!data || typeof data !== 'object') {
    throw new Error('Model returned invalid JSON (not an object)')
  }
  const title = /** @type {{ title?: unknown }} */ (data).title
  const questions = /** @type {{ questions?: unknown }} */ (data).questions
  if (typeof title !== 'string' || !title.trim()) {
    throw new Error('Model response missing string "title"')
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Model response missing non-empty "questions" array')
  }
  if (questions.length > 50) {
    throw new Error('Too many questions in model response (max 50)')
  }
  if (questions.length < Math.min(3, requestedCount)) {
    throw new Error(
      `Expected at least ${Math.min(3, requestedCount)} questions, got ${questions.length}`,
    )
  }
  questions.forEach((q, i) => {
    if (!q || typeof q !== 'object') {
      throw new Error(`Question ${i + 1}: invalid entry`)
    }
    const stem = /** @type {{ stem?: unknown }} */ (q).stem
    const choices = /** @type {{ choices?: unknown }} */ (q).choices
    const correctIndex = /** @type {{ correctIndex?: unknown }} */ (q).correctIndex
    if (typeof stem !== 'string' || !stem.trim()) {
      throw new Error(`Question ${i + 1}: missing stem`)
    }
    if (!Array.isArray(choices) || choices.length < 2) {
      throw new Error(`Question ${i + 1}: need at least 2 choices`)
    }
    if (!choices.every((c) => typeof c === 'string' && c.trim())) {
      throw new Error(`Question ${i + 1}: choices must be non-empty strings`)
    }
    if (typeof correctIndex !== 'number' || !Number.isInteger(correctIndex)) {
      throw new Error(`Question ${i + 1}: correctIndex must be an integer`)
    }
    if (correctIndex < 0 || correctIndex >= choices.length) {
      throw new Error(`Question ${i + 1}: correctIndex out of range`)
    }
  })
  return {
    title: title.trim(),
    questions: questions.map((q) => {
      const o = /** @type {Record<string, unknown>} */ (q)
      return {
        stem: String(o.stem).trim(),
        choices: /** @type {string[]} */ (o.choices).map((c) => String(c).trim()),
        correctIndex: /** @type {number} */ (o.correctIndex),
        explanation:
          typeof o.explanation === 'string' && o.explanation.trim()
            ? o.explanation.trim()
            : null,
        sourceSnippet:
          typeof o.sourceSnippet === 'string' && o.sourceSnippet.trim()
            ? o.sourceSnippet.trim()
            : null,
      }
    }),
  }
}

/**
 * Upload study files to Gemini, generate MCQs, delete remote files.
 *
 * @param {object} params
 * @param {string} params.apiKey
 * @param {string} [params.modelName]
 * @param {Array<{ buffer: Buffer, mimeType: string, displayName: string }>} params.files
 * @param {string} [params.courseNote]
 * @param {number} [params.questionCount]
 */
export async function generateQuizFromBuffers(params) {
  const {
    apiKey,
    modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL,
    files,
    courseNote = '',
    questionCount = 10,
  } = params

  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('No files to send to Gemini')
  }

  const count = Math.min(50, Math.max(1, Math.floor(Number(questionCount)) || 10))
  const fileManager = new GoogleAIFileManager(apiKey)
  const uploadedNames = []

  try {
    const fileParts = []
    for (const f of files) {
      const upload = await fileManager.uploadFile(f.buffer, {
        mimeType: f.mimeType,
        displayName: (f.displayName || 'source').slice(0, 200),
      })
      uploadedNames.push(upload.file.name)
      const active = await waitForFileActive(fileManager, upload.file.name)
      fileParts.push({
        fileData: {
          fileUri: active.uri,
          mimeType: f.mimeType,
        },
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.35,
      },
    })

    const prompt = `You are an exam author. Using ONLY the attached file(s), produce exactly ${count} multiple-choice questions for students.

Course / context (may be partial): ${courseNote || 'General study material'}

Rules:
- Each question must have exactly 4 choices (four strings in "choices").
- "correctIndex" is 0-based into the "choices" array.
- Questions must be answerable from the documents; do not invent facts not grounded in the text.
- Include "explanation" (brief) and when possible a short "sourceSnippet" quoting the material.

Return a JSON object with this exact shape:
{
  "title": "short quiz title",
  "questions": [
    {
      "stem": "question text",
      "choices": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "why the answer is correct",
      "sourceSnippet": "optional short quote"
    }
  ]
}

The "questions" array must contain exactly ${count} items.`

    const result = await model.generateContent([...fileParts, { text: prompt }])
    const text = result.response.text()
    const raw = parseQuizJson(text)
    return validateQuizPayload(raw, count)
  } finally {
    await Promise.all(
      uploadedNames.map((name) => fileManager.deleteFile(name).catch(() => {})),
    )
  }
}
