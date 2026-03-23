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

/** Gemini often suffixes titles with " Quiz" after the course name; strip one redundant trailing word. */
function normalizeGeneratedQuizTitle(rawTitle) {
  const t = rawTitle.trim()
  const stripped = t.replace(/\s+quiz$/i, '').trim()
  return stripped.length > 0 ? stripped : t
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
    title: normalizeGeneratedQuizTitle(title),
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
- "title" must be a concise topic or module name taken from the material or course context (e.g. chapter or course title). Do not append generic words like "Quiz", "MCQ", or "Test" unless those words already appear in the course context above.

Return a JSON object with this exact shape:
{
  "title": "Topic or course name (concise)",
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

function parseHintJson(text) {
  let raw = typeof text === 'string' ? text.trim() : String(text)
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) raw = fenced[1].trim()
  return JSON.parse(raw)
}

/**
 * Socratic quiz hints (keywords + optional deeper explanation). Text-only model call — uses
 * filenames, course notes, question stem, and stored sourceSnippet when available.
 *
 * @param {object} params
 * @param {string} params.apiKey
 * @param {string} [params.modelName]
 * @param {'keywords'|'explain'} params.step
 * @param {string} params.highlightedText
 * @param {string} params.quizTitle
 * @param {string|null|undefined} params.courseCode
 * @param {string|null|undefined} params.courseNote
 * @param {string[]} params.sourceFilenames
 * @param {string|null|undefined} params.questionStem
 * @param {string|null|undefined} params.sourceSnippet
 * @param {string[]} [params.keywordsFromPrior] required when step === 'explain'
 */
export async function generateSocraticHint(params) {
  const {
    apiKey,
    modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL,
    step,
    highlightedText,
    quizTitle,
    courseCode,
    courseNote,
    sourceFilenames = [],
    questionStem,
    sourceSnippet,
    keywordsFromPrior = [],
  } = params

  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: step === 'keywords' ? 0.25 : 0.45,
    },
  })

  const names = Array.isArray(sourceFilenames)
    ? sourceFilenames.map((n) => String(n).trim()).filter(Boolean)
    : []
  const fileList =
    names.length > 0
      ? names.map((n) => `- ${n}`).join('\n')
      : '(No named import files on record for this quiz.)'

  if (step === 'keywords') {
    const prompt = `You are a Socratic tutor. A student highlighted this phrase from a multiple-choice quiz:
"""${highlightedText.replace(/"""/g, '"')}"""

Quiz title: ${quizTitle}
Course code: ${courseCode || 'n/a'}
Course / batch notes: ${courseNote || 'n/a'}
${questionStem ? `Question stem (context only): ${questionStem}` : ''}
${sourceSnippet ? `Excerpt tied to this question when the quiz was authored (from study materials): ${sourceSnippet}` : ''}

Filenames of the original study materials (import batch):
${fileList}

Return JSON only with this exact shape:
{
  "keywords": ["3 to 8 short reminder terms or concepts"],
  "sourceFile": "EXACTLY one of the filenames listed above (copy the name character-for-character), OR the literal string Course context if none of those files fit"
}

Rules:
- Keywords should help the student recall ideas from the materials; do not reveal which multiple-choice option (A/B/C/D) is correct.
- "sourceFile" must be either an exact filename from the list above or "Course context".`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const raw = parseHintJson(text)
    const keywords = Array.isArray(raw.keywords)
      ? raw.keywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 12)
      : []
    const sourceFile =
      typeof raw.sourceFile === 'string' && raw.sourceFile.trim()
        ? raw.sourceFile.trim().slice(0, 300)
        : 'Course context'
    if (keywords.length === 0) {
      throw new Error('Model returned no keywords')
    }
    return { keywords, sourceFile }
  }

  const kw = keywordsFromPrior.slice(0, 12).join(', ')
  const prompt = `You are a Socratic tutor. The student is taking a multiple-choice quiz.

They highlighted: """${highlightedText.replace(/"""/g, '"')}"""
They were already shown these reminder keywords: ${kw}
${questionStem ? `Question stem: ${questionStem}` : ''}
${sourceSnippet ? `Material excerpt from when the question was authored: ${sourceSnippet}` : ''}

Write a short Socratic follow-up (2–5 sentences): use guiding questions and conceptual hints only.
Do NOT state which multiple-choice option is correct. Do NOT give the direct factual answer if it would reveal the MCQ key.

Return JSON only: { "explanation": "your text here" }`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const raw = parseHintJson(text)
  const explanation =
    typeof raw.explanation === 'string' && raw.explanation.trim()
      ? raw.explanation.trim().slice(0, 4000)
      : ''
  if (!explanation) {
    throw new Error('Model returned no explanation')
  }
  return { explanation }
}
