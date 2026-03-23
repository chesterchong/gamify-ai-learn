import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearMeCache, readMeCache, writeMeCache } from '../lib/authMeCache.js'
import TermsThemeStyles from './TermsThemeStyles'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'

const MAX_ADMIN_FILES = 10
const MAX_LIST_ID = 999
const QUIZ_PAGE_SIZE = 20

function formatListId(n) {
  const clamped = Math.min(Math.max(1, Math.floor(n)), MAX_LIST_ID)
  return String(clamped).padStart(3, '0')
}

/**
 * Parse legacy single-field courseNote (combined code + title).
 * New rows use API fields courseCode + courseNote (title only).
 */
function parseCourseFromNote(note) {
  const t = (note || '').trim()
  if (!t) return { code: '—', title: '' }
  const bar = t.split(/\s*\|\s*/, 2)
  if (bar.length === 2 && bar[0] && bar[1]) {
    return { code: bar[0].trim().toUpperCase(), title: bar[1].trim() }
  }
  const dash = t.split(/\s+[-–—]\s+/, 2)
  if (dash.length === 2 && dash[0] && dash[1]) {
    return { code: dash[0].trim().toUpperCase(), title: dash[1].trim() }
  }
  const words = t.split(/\s+/)
  if (words.length >= 2 && /^[A-Za-z0-9]+$/.test(words[0])) {
    return { code: words[0].toUpperCase(), title: words.slice(1).join(' ') }
  }
  return { code: '—', title: t }
}

function importRowCodeTitle(row) {
  const hasCode = Boolean(row.courseCode && String(row.courseCode).trim())
  if (hasCode) {
    return {
      code: String(row.courseCode).trim().toUpperCase(),
      title: (row.courseNote || '').trim() || '—',
    }
  }
  const parsed = parseCourseFromNote(row.courseNote)
  return { code: parsed.code, title: parsed.title || row.courseNote || '—' }
}

function aiRowCode(row) {
  if (row.courseCode && String(row.courseCode).trim()) {
    return String(row.courseCode).trim().toUpperCase()
  }
  return parseCourseFromNote(row.courseNote).code
}

/** Matches STABLE / LEGACY / CRITICAL / NEW_GEN chip styling: colored text + border (no solid fill). */
const CODE_STATUS_CHIP_PALETTE = [
  'text-green-500 border-green-500/30',
  'text-orange-500 border-orange-500/30',
  'text-red-500 border-red-500/30',
  'text-primary border-primary/30',
]

function codeChipClassForCourseCode(code) {
  const s = (code || '').trim().toUpperCase()
  if (!s || s === '—') return CODE_STATUS_CHIP_PALETTE[0]
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return CODE_STATUS_CHIP_PALETTE[h % CODE_STATUS_CHIP_PALETTE.length]
}

/** Row has a real course code (not placeholder em dash). */
function courseCodeIsFilterable(code) {
  const c = String(code || '').trim().toUpperCase()
  return c.length > 0 && c !== '—'
}

function rowCourseCodeKey(row) {
  if (row.kind === 'import') return importRowCodeTitle(row).code
  return aiRowCode(row)
}

function QuizCourseCodeChip({ code, activeFilter, onToggle }) {
  const normalized = String(code || '').trim().toUpperCase()
  const filterable = courseCodeIsFilterable(normalized)
  const baseChip = `text-[9px] border px-1.5 py-0.5 rounded shrink-0 max-w-full truncate select-text ${codeChipClassForCourseCode(code)}`
  const isActive = activeFilter != null && activeFilter === normalized
  if (!filterable) {
    return (
      <span className={baseChip} title="Course code">
        {code}
      </span>
    )
  }
  return (
    <button
      type="button"
      className={`${baseChip} cursor-pointer text-left hover:brightness-110 dark:hover:brightness-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
        isActive ? 'ring-2 ring-inset ring-primary/50' : ''
      }`}
      onClick={() => onToggle(normalized)}
      title="Show only quizzes with this course code on this page. Click again to clear the filter."
      aria-pressed={isActive}
      aria-label={
        isActive
          ? `Clear course code filter (${normalized})`
          : `Filter table by course code ${normalized}`
      }
    >
      {code}
    </button>
  )
}

/** Compact file count e.g. [3]; tooltip lists original names (one per line). */
function fileCountDisplay(files) {
  const list = Array.isArray(files) ? files : []
  const n = list.length
  const tooltip =
    n === 0
      ? 'No source files'
      : list.map((f) => (f.originalName || '').trim() || '(unnamed)').join('\n')
  return { n, label: `[${n}]`, tooltip }
}

/** Imports first (pending-without-generate on top), then AI rows; matches API (search view). */
function sortQuizTableRows(rows) {
  return [...rows].sort((a, b) => {
    const aImp = a.kind === 'import' ? 1 : 0
    const bImp = b.kind === 'import' ? 1 : 0
    if (aImp !== bImp) return bImp - aImp
    const aPending = a.kind === 'import' && !a.hasGeneratedQuiz
    const bPending = b.kind === 'import' && !b.hasGeneratedQuiz
    if (aPending !== bPending) return aPending ? -1 : 1
    const ta = new Date(a.createdAt || 0).getTime()
    const tb = new Date(b.createdAt || 0).getTime()
    return tb - ta
  })
}

function Quiz() {
  const [searchInput, setSearchInput] = useState('')
  /** Uppercase course code; show only rows with this exact code (current table page). */
  const [courseCodeFilter, setCourseCodeFilter] = useState(null)
  const [user, setUser] = useState(() => {
    const c = readMeCache()
    return c ? { role: c.role, professionalRole: c.professionalRole } : null
  })
  /** false until we know session (from cache on first paint, or after /me). Table shows in one shot when true. */
  const [authChecked, setAuthChecked] = useState(() => readMeCache() !== null)
  const [adminCodeDraft, setAdminCodeDraft] = useState('')
  const [adminTitleDraft, setAdminTitleDraft] = useState('')
  const [adminFiles, setAdminFiles] = useState([])
  const [adminUploading, setAdminUploading] = useState(false)
  const [adminUploadMessage, setAdminUploadMessage] = useState('')
  const adminFileInputRef = useRef(null)
  const apiBaseUrl = getApiBaseUrl()
  const [quizRows, setQuizRows] = useState([])
  const [quizHasMore, setQuizHasMore] = useState(false)
  const [quizPage, setQuizPage] = useState(0)
  const [totalImportCount, setTotalImportCount] = useState(0)
  const [tableLoading, setTableLoading] = useState(false)
  const [batchGenerate, setBatchGenerate] = useState({
    batchId: null,
    loading: false,
    error: '',
  })
  /** Admin inline edit: import batch or AI collection. */
  const [editing, setEditing] = useState(null)
  /** `'save:import:id'` | `'delete:import:id'` | same for `ai` */
  const [rowBusy, setRowBusy] = useState(null)
  const [rowActionError, setRowActionError] = useState('')
  /** After a successful /me in this session, pagination only refetches the table (overlaps network with first load). */
  const hasSyncedMeRef = useRef(false)
  const userRef = useRef(user)
  userRef.current = user

  useEffect(() => {
    hasSyncedMeRef.current = false
  }, [apiBaseUrl])

  useEffect(() => {
    let mounted = true
    const tableUrl = `${apiBaseUrl}/api/quiz/table?page=${quizPage}&limit=${QUIZ_PAGE_SIZE}`
    const tableOpts = { credentials: 'include', cache: 'no-store' }

    const applyTableJson = (td) => {
      setQuizRows(Array.isArray(td.rows) ? td.rows : [])
      setQuizHasMore(Boolean(td.hasMore))
      if (typeof td.totalImportCount === 'number') {
        setTotalImportCount(td.totalImportCount)
      }
    }

    const run = async () => {
      if (hasSyncedMeRef.current) {
        if (!userRef.current) {
          setQuizPage(0)
          setQuizRows([])
          setQuizHasMore(false)
          setTotalImportCount(0)
          setTableLoading(false)
          return
        }
        setTableLoading(true)
        try {
          const res = await fetch(tableUrl, tableOpts)
          if (!mounted) return
          if (res.status === 401) {
            hasSyncedMeRef.current = false
            clearMeCache()
            setUser(null)
            setQuizRows([])
            setQuizHasMore(false)
            setTotalImportCount(0)
            return
          }
          if (!res.ok) return
          const td = await res.json().catch(() => ({}))
          applyTableJson(td)
        } catch {
          if (mounted) setQuizRows([])
        } finally {
          if (mounted) setTableLoading(false)
        }
        return
      }

      setTableLoading(true)
      try {
        const tableP = fetch(tableUrl, tableOpts)
        const meRes = await fetch(`${apiBaseUrl}/api/auth/me`, {
          credentials: 'include',
          cache: 'no-store',
        })
        if (!mounted) return

        let nextUser = null
        if (meRes.ok) {
          const data = await meRes.json().catch(() => ({}))
          nextUser = data.user || null
          if (nextUser) writeMeCache(nextUser)
          else clearMeCache()
        } else {
          clearMeCache()
        }
        setUser(nextUser)
        setAuthChecked(true)

        if (!nextUser) {
          hasSyncedMeRef.current = false
          try {
            await tableP
          } catch {
            /* ignore */
          }
          setQuizPage(0)
          setQuizRows([])
          setQuizHasMore(false)
          setTotalImportCount(0)
          setTableLoading(false)
          return
        }

        hasSyncedMeRef.current = true

        const tableRes = await tableP
        if (!mounted) return
        if (tableRes.status === 401) {
          hasSyncedMeRef.current = false
          clearMeCache()
          setUser(null)
          setQuizRows([])
          setQuizHasMore(false)
          setTotalImportCount(0)
          setTableLoading(false)
          return
        }
        if (!tableRes.ok) {
          setQuizRows([])
          setTableLoading(false)
          return
        }
        const td = await tableRes.json().catch(() => ({}))
        applyTableJson(td)
      } catch {
        if (mounted) {
          clearMeCache()
          setUser(null)
          setQuizRows([])
        }
      } finally {
        if (mounted) setTableLoading(false)
      }
    }

    run()
    return () => {
      mounted = false
    }
  }, [apiBaseUrl, quizPage])

  const isAdmin = Boolean(
    user &&
      (user.role?.toLowerCase() === 'admin' ||
        user.professionalRole?.toLowerCase() === 'admin'),
  )

  const refreshQuizTable = useCallback(
    async (pageOverride) => {
      if (!user) return
      const page = typeof pageOverride === 'number' ? pageOverride : quizPage
      setTableLoading(true)
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/quiz/table?page=${page}&limit=${QUIZ_PAGE_SIZE}`,
          { credentials: 'include', cache: 'no-store' },
        )
        if (!res.ok) return
        const td = await res.json().catch(() => ({}))
        const rows = Array.isArray(td.rows) ? td.rows : []
        setQuizRows(rows)
        setQuizHasMore(Boolean(td.hasMore))
        if (typeof td.totalImportCount === 'number') {
          setTotalImportCount(td.totalImportCount)
        }
        if (rows.length === 0 && page > 0) {
          setQuizPage((prev) => (prev === page ? Math.max(0, prev - 1) : prev))
        }
      } catch {
        setQuizRows([])
      } finally {
        setTableLoading(false)
      }
    },
    [apiBaseUrl, user, quizPage],
  )

  const handleGenerateBatch = async (batchId) => {
    setBatchGenerate({ batchId, loading: true, error: '' })
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/quiz/batches/${batchId}/generate-questions`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionCount: 10 }),
        },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setBatchGenerate({
          batchId,
          loading: false,
          error: data.error || `Generate failed (${res.status})`,
        })
        return
      }
      if (quizPage === 0) await refreshQuizTable(0)
      else setQuizPage(0)
      setBatchGenerate({ batchId: null, loading: false, error: '' })
    } catch {
      setBatchGenerate({
        batchId,
        loading: false,
        error: 'Network error',
      })
    }
  }

  const nextDraftId = useMemo(() => {
    return formatListId(totalImportCount + 1)
  }, [totalImportCount])

  const tableRows = useMemo(() => {
    const offset = quizPage * QUIZ_PAGE_SIZE
    return (Array.isArray(quizRows) ? quizRows : []).map((r, i) => {
      if (r.kind === 'import') {
        return {
          kind: 'import',
          batchId: r.batchId,
          displayId: formatListId(offset + i + 1),
          courseCode: typeof r.courseCode === 'string' ? r.courseCode : '',
          courseNote: typeof r.courseNote === 'string' ? r.courseNote : '',
          files: Array.isArray(r.files) ? r.files : [],
          hasGeneratedQuiz: Boolean(r.hasGeneratedQuiz),
          createdAt: r.createdAt,
          primaryCollectionId:
            typeof r.primaryCollectionId === 'string' ? r.primaryCollectionId : null,
          poolVersion: typeof r.poolVersion === 'number' ? r.poolVersion : 0,
          totalPoolQuestions:
            typeof r.totalPoolQuestions === 'number' ? r.totalPoolQuestions : 0,
        }
      }
      return {
        kind: 'ai',
        collectionId: r.collectionId,
        displayId: (r.collectionId || '').slice(0, 6).toUpperCase() || '—',
        title: r.title || 'Untitled',
        courseCode: typeof r.courseCode === 'string' ? r.courseCode : '',
        courseNote: typeof r.courseNote === 'string' ? r.courseNote : '',
        model: typeof r.model === 'string' ? r.model : '',
        createdAt: r.createdAt,
        files: Array.isArray(r.sourceFiles) ? r.sourceFiles : [],
        userHasPerfectScore: Boolean(r.userHasPerfectScore),
        /** `null` if API omitted the field (legacy); boolean once backend sends it. */
        userHasAttempted:
          typeof r.userHasAttempted === 'boolean' ? r.userHasAttempted : null,
        hasGeneratedQuiz: true,
        poolVersion: typeof r.poolVersion === 'number' ? r.poolVersion : 1,
        questionCount: typeof r.questionCount === 'number' ? r.questionCount : 0,
      }
    })
  }, [quizRows, quizPage])

  useEffect(() => {
    if (courseCodeFilter != null) {
      setQuizPage(0)
    }
  }, [courseCodeFilter])

  const toggleCourseCodeFilter = useCallback((normalizedCode) => {
    const c = String(normalizedCode || '').trim().toUpperCase()
    if (!courseCodeIsFilterable(c)) return
    setCourseCodeFilter((prev) => (prev === c ? null : c))
  }, [])

  const normalizedQuery = searchInput.trim().toLowerCase()
  const visibleTableRows = useMemo(() => {
    const byCourse =
      courseCodeFilter == null
        ? tableRows
        : tableRows.filter((row) => rowCourseCodeKey(row) === courseCodeFilter)

    const filtered = !normalizedQuery
      ? byCourse
      : byCourse.filter((row) => {
      if (row.kind === 'import') {
        const { code: rowCode, title: rowTitle } = importRowCodeTitle(row)
        const note = (row.courseNote || '').toLowerCase()
        const code = rowCode.toLowerCase()
        const titleStr = (rowTitle || '').toLowerCase()
        const matchesCode = code.includes(normalizedQuery)
        const matchesTitle = titleStr.includes(normalizedQuery)
        const matchesNote = note.includes(normalizedQuery)
        const matchesFile = row.files.some((f) =>
          (f.originalName || '').toLowerCase().includes(normalizedQuery),
        )
        const matchesId =
          row.batchId.toLowerCase().includes(normalizedQuery) ||
          row.displayId.toLowerCase().includes(normalizedQuery)
        const matchesTag =
          normalizedQuery.length >= 3 && /upload|import|storage/.test(normalizedQuery)
        return (
          matchesCode ||
          matchesTitle ||
          matchesNote ||
          matchesFile ||
          matchesId ||
          matchesTag
        )
      }
      if (row.kind === 'ai') {
        const code = aiRowCode(row).toLowerCase()
        const matchesCode = code.includes(normalizedQuery)
        const matchesTitle = (row.title || '').toLowerCase().includes(normalizedQuery)
        const matchesNote = (row.courseNote || '').toLowerCase().includes(normalizedQuery)
        const matchesFile = row.files.some((f) =>
          (f.originalName || '').toLowerCase().includes(normalizedQuery),
        )
        const matchesId =
          (row.collectionId || '').toLowerCase().includes(normalizedQuery) ||
          (row.displayId || '').toLowerCase().includes(normalizedQuery)
        const matchesAi = normalizedQuery === 'ai' || normalizedQuery.includes('gemini')
        const matchesPerfect =
          row.userHasPerfectScore &&
          (normalizedQuery === 'max' ||
            normalizedQuery === 'perfect' ||
            normalizedQuery.includes('perfect score'))
        return (
          matchesCode ||
          matchesTitle ||
          matchesNote ||
          matchesFile ||
          matchesId ||
          matchesAi ||
          matchesPerfect
        )
      }
      return false
    })
    return sortQuizTableRows(filtered)
  }, [tableRows, normalizedQuery, courseCodeFilter])

  const openAdminFilePicker = () => {
    setAdminUploadMessage('')
    adminFileInputRef.current?.click()
  }

  const onAdminFileChange = (e) => {
    const picked = Array.from(e.target.files || [])
    if (!picked.length) return
    setAdminFiles((prev) => [...prev, ...picked].slice(0, MAX_ADMIN_FILES))
    setAdminUploadMessage('')
    e.target.value = ''
  }

  const removeAdminFile = (index) => {
    setAdminFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const rowKey = (kind, id) => `${kind}:${id}`

  const isRowBusy = (kind, id, op) =>
    rowBusy === `${op}:${rowKey(kind, id)}`

  const startEditImport = (row) => {
    const { code, title } = importRowCodeTitle(row)
    setRowActionError('')
    setEditing({
      kind: 'import',
      id: row.batchId,
      code: code === '—' ? '' : code,
      title: title === '—' ? '' : title,
    })
  }

  const startEditAi = (row) => {
    const code = aiRowCode(row)
    setRowActionError('')
    setEditing({
      kind: 'ai',
      id: row.collectionId,
      code: code === '—' ? '' : code,
      title: (row.title || '').trim(),
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    setRowActionError('')
  }

  const saveEdit = async () => {
    if (!editing) return
    const title = editing.title.trim()
    const codeRaw = editing.code.trim()
    const code = codeRaw ? codeRaw.toUpperCase() : ''
    if (editing.kind === 'import') {
      if (!code || !title) {
        setRowActionError('Code and title are required.')
        return
      }
    } else if (!title) {
      setRowActionError('Title is required.')
      return
    }
    const key = rowKey(editing.kind, editing.id)
    setRowBusy(`save:${key}`)
    setRowActionError('')
    try {
      if (editing.kind === 'import') {
        const res = await fetch(
          `${apiBaseUrl}/api/quiz/import-batches/${editing.id}`,
          {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseCode: code, courseNote: title }),
          },
        )
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setRowActionError(data.error || `Save failed (${res.status})`)
          return
        }
        await refreshQuizTable()
      } else {
        const res = await fetch(
          `${apiBaseUrl}/api/quiz/ai-collections/${editing.id}`,
          {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              courseCode: code || null,
            }),
          },
        )
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setRowActionError(data.error || `Save failed (${res.status})`)
          return
        }
        await refreshQuizTable()
      }
      setEditing(null)
    } catch {
      setRowActionError('Network error.')
    } finally {
      setRowBusy(null)
    }
  }

  const deleteImportBatch = async (batchId) => {
    if (
      !window.confirm(
        'Delete this import row and remove its files from storage? Generated AI quizzes stay listed; their link to this batch is cleared.',
      )
    ) {
      return
    }
    const key = rowKey('import', batchId)
    setRowBusy(`delete:${key}`)
    setRowActionError('')
    try {
      const res = await fetch(`${apiBaseUrl}/api/quiz/import-batches/${batchId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setRowActionError(data.error || `Delete failed (${res.status})`)
        return
      }
      if (editing?.kind === 'import' && editing.id === batchId) setEditing(null)
      await refreshQuizTable()
    } catch {
      setRowActionError('Network error.')
    } finally {
      setRowBusy(null)
    }
  }

  const deleteAiCollection = async (collectionId) => {
    if (
      !window.confirm(
        'Delete this AI quiz permanently? All questions and learner submissions for it will be removed.',
      )
    ) {
      return
    }
    const key = rowKey('ai', collectionId)
    setRowBusy(`delete:${key}`)
    setRowActionError('')
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/quiz/ai-collections/${collectionId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setRowActionError(data.error || `Delete failed (${res.status})`)
        return
      }
      if (editing?.kind === 'ai' && editing.id === collectionId) setEditing(null)
      await refreshQuizTable()
    } catch {
      setRowActionError('Network error.')
    } finally {
      setRowBusy(null)
    }
  }

  const submitAdminUpload = async () => {
    const codePart = adminCodeDraft.trim()
    const titlePart = adminTitleDraft.trim()
    if (!codePart) {
      setAdminUploadMessage('Enter a course code (Code column).')
      return
    }
    if (!titlePart) {
      setAdminUploadMessage('Enter a course title (Course column).')
      return
    }
    if (adminFiles.length === 0) {
      setAdminUploadMessage('Choose files with the file button, then click Add.')
      return
    }
    setAdminUploading(true)
    setAdminUploadMessage('')
    try {
      const fd = new FormData()
      fd.append('courseCode', codePart)
      fd.append('courseNote', titlePart)
      adminFiles.forEach((f) => fd.append('files', f))
      const res = await fetch(`${apiBaseUrl}/api/quiz/import-files`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setAdminUploadMessage(data.error || `Upload failed (${res.status})`)
        return
      }
      setAdminUploadMessage(
        `Saved ${data.fileCount} file(s) to Supabase${data.bucket ? ` (${data.bucket})` : ''}.`,
      )
      setAdminFiles([])
      setAdminCodeDraft('')
      setAdminTitleDraft('')
      if (adminFileInputRef.current) adminFileInputRef.current.value = ''
      if (quizPage === 0) await refreshQuizTable(0)
      else setQuizPage(0)
    } catch {
      setAdminUploadMessage('Network error. Try again.')
    } finally {
      setAdminUploading(false)
    }
  }

  return (
    <div className="selection:bg-primary selection:text-black min-h-screen">
      <TermsThemeStyles />
      <style>{`
        .quiz-circuit-bg {
          background-image: radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }
        .quiz-glow-line {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          background:
            linear-gradient(90deg, transparent 49.5%, rgba(59, 130, 246, 0.03) 50%, transparent 50.5%),
            linear-gradient(0deg, transparent 49.5%, rgba(59, 130, 246, 0.03) 50%, transparent 50.5%);
          background-size: 100px 100px;
        }
        .quiz-search-input {
          background-color: rgba(15, 23, 42, 0.92);
          color: #e5e7eb;
        }
        .quiz-search-input::placeholder {
          color: #64748b;
        }
        .quiz-admin-course-input {
          background-color: rgba(15, 23, 42, 0.85);
          color: #e5e7eb;
          border: 1px solid rgba(148, 163, 184, 0.35);
        }
        .quiz-admin-course-input::placeholder {
          color: #64748b;
        }
        @keyframes quiz-title-new-glow {
          0%,
          100% {
            text-shadow:
              0 0 3px rgba(34, 211, 238, 0.12),
              0 0 8px rgba(56, 189, 248, 0.08),
              0 0 14px rgba(14, 165, 233, 0.05);
          }
          50% {
            text-shadow:
              0 0 6px rgba(34, 211, 238, 0.28),
              0 0 12px rgba(56, 189, 248, 0.16),
              0 0 20px rgba(14, 165, 233, 0.09);
          }
        }
        .quiz-title-never-attempted {
          animation: quiz-title-new-glow 4.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .quiz-title-never-attempted {
            animation: none;
            text-shadow:
              0 0 4px rgba(34, 211, 238, 0.14),
              0 0 10px rgba(56, 189, 248, 0.09);
          }
        }
      `}</style>
      <div className="quiz-glow-line" aria-hidden="true" />
      <div className="quiz-circuit-bg relative">
        <div className="relative z-10 mx-auto w-full max-w-5xl space-y-10 px-4 py-6 pb-24 sm:px-6 lg:p-12">
          <header className="mb-10">
            <div className="mt-0 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <div className="relative flex-1 min-w-0">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    search
                  </span>
                  <input
                    className="quiz-search-input w-full pl-10 pr-4 py-2.5 rounded-xl glass border-slate-200/50 dark:border-slate-700/50 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Search quizzes..."
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    aria-label="Search quizzes"
                  />
                </div>
                {courseCodeFilter != null && (
                  <button
                    type="button"
                    onClick={() => setCourseCodeFilter(null)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary border border-primary/45 bg-primary/10 hover:bg-primary/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                    aria-label={`Clear course code filter ${courseCodeFilter}`}
                  >
                    <span className="truncate max-w-[12rem]" title={courseCodeFilter}>
                      Code: {courseCodeFilter}
                    </span>
                    <span className="material-symbols-outlined text-[16px] shrink-0" aria-hidden>
                      close
                    </span>
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="min-w-0 space-y-6 w-full">
            {!authChecked ? (
              <section
                className="glass-card rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 min-h-[280px] flex items-center justify-center"
                aria-busy="true"
                aria-label="Loading quiz table"
              >
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              </section>
            ) : (
            <section
              className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto overscroll-x-contain"
              data-purpose="quiz-log"
            >
              <div className="min-w-[52rem]">
              <div className="grid grid-cols-[2.5rem_minmax(0,5rem)_minmax(0,24rem)_minmax(10rem,1fr)_minmax(15rem,auto)] gap-3 border-b border-slate-200/50 bg-slate-500/5 px-3 py-3 text-xs font-bold tracking-wide text-slate-500 dark:border-slate-700/50 dark:bg-slate-900/30 dark:text-slate-400 sm:gap-4 sm:px-6">
                <div className="w-10 text-left">Id</div>
                <div className="min-w-0">Code</div>
                <div className="min-w-0">Course</div>
                <div className="min-w-0">Files</div>
                <div className="text-right">Action</div>
              </div>
              {isAdmin && rowActionError && (
                <div className="border-b border-slate-200/50 bg-amber-500/5 px-3 py-2 text-xs text-amber-400 dark:border-slate-700/50 sm:px-6">
                  {rowActionError}
                </div>
              )}
              <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                {isAdmin && (
                  <div
                    className="grid grid-cols-[2.5rem_minmax(0,5rem)_minmax(0,24rem)_minmax(10rem,1fr)_minmax(15rem,auto)] gap-3 items-center border-b border-primary/20 bg-primary/5 px-3 py-4 sm:gap-4 sm:px-6"
                    data-purpose="admin-new-quiz-row"
                  >
                    <div className="w-10 text-slate-500 dark:text-slate-400 text-xs tabular-nums select-none" title="Assigned when quiz is created">
                      {nextDraftId}
                    </div>
                    <div className="min-w-0">
                      <input
                        type="text"
                        value={adminCodeDraft}
                        onChange={(e) => setAdminCodeDraft(e.target.value.toUpperCase())}
                        className="quiz-admin-course-input w-full text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Code"
                        aria-label="Course code"
                        required
                      />
                    </div>
                    <div className="min-w-0">
                      <input
                        type="text"
                        value={adminTitleDraft}
                        onChange={(e) => setAdminTitleDraft(e.target.value)}
                        className="quiz-admin-course-input w-full text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Title"
                        aria-label="Course title"
                        required
                      />
                    </div>
                    <div className="min-w-0 flex flex-col gap-2 items-start">
                      <input
                        ref={adminFileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        accept="*/*"
                        aria-hidden
                        onChange={onAdminFileChange}
                      />
                      <button
                        type="button"
                        onClick={openAdminFilePicker}
                        disabled={adminUploading}
                        className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide border px-2.5 py-1.5 rounded-lg shrink-0 text-primary border-primary/40 bg-primary/10 hover:bg-primary/20 hover:border-primary/70 cursor-pointer transition-colors disabled:opacity-50"
                        title={`Choose up to ${MAX_ADMIN_FILES} files (stored in Supabase when you click Add)`}
                        aria-label="Choose files to upload"
                      >
                        <span className="material-symbols-outlined text-[14px]" aria-hidden>
                          upload_file
                        </span>
                        {!adminUploadMessage.startsWith('Saved') && 'Upload'}
                      </button>
                      {adminFiles.length > 0 && (
                        <ul className="text-[10px] text-slate-400 space-y-1 max-w-full">
                          {adminFiles.map((f, i) => (
                            <li key={`${f.name}-${i}`} className="flex items-center gap-2 min-w-0">
                              <span className="truncate flex-1" title={f.name}>
                                {f.name}
                              </span>
                              <button
                                type="button"
                                className="shrink-0 text-slate-500 hover:text-red-400"
                                onClick={() => removeAdminFile(i)}
                                disabled={adminUploading}
                                aria-label={`Remove ${f.name}`}
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {adminUploadMessage && (
                        <p
                          className={`text-[10px] max-w-full ${adminUploadMessage.startsWith('Saved') ? 'text-emerald-400' : 'text-amber-400'}`}
                        >
                          {adminUploadMessage}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={submitAdminUpload}
                        disabled={adminUploading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary border border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors disabled:opacity-50"
                        aria-label="Submit files to Supabase"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        {adminUploading ? '…' : 'Add'}
                      </button>
                    </div>
                  </div>
                )}
                {visibleTableRows.map((row) => {
                  if (row.kind === 'import') {
                    const { code: importCode, title: importTitle } = importRowCodeTitle(row)
                    const editingThis =
                      editing?.kind === 'import' && editing.id === row.batchId
                    const busySave = isRowBusy('import', row.batchId, 'save')
                    const busyDel = isRowBusy('import', row.batchId, 'delete')
                    const rowDisabled = busySave || busyDel
                    const pendingGeneration = !row.hasGeneratedQuiz
                    const importFileCount = fileCountDisplay(row.files)
                    return (
                    <div
                      key={`import-${row.batchId}`}
                      className={`grid grid-cols-[2.5rem_minmax(0,5rem)_minmax(0,24rem)_minmax(10rem,1fr)_minmax(15rem,auto)] gap-3 items-center px-3 py-4 transition-colors group sm:gap-4 sm:px-6 ${
                        pendingGeneration
                          ? 'bg-amber-500/[0.09] dark:bg-amber-950/35 hover:bg-amber-500/[0.14] dark:hover:bg-amber-950/45 ring-1 ring-inset ring-amber-500/20'
                          : 'bg-slate-500/5 dark:bg-slate-900/40 hover:bg-cyan-500/5'
                      }`}
                      data-purpose="quiz-import-batch-row"
                      data-pending-generation={pendingGeneration ? 'true' : undefined}
                    >
                      <div
                        className="w-10 text-slate-500 dark:text-slate-400 text-xs tabular-nums"
                        title={row.batchId}
                      >
                        {row.displayId}
                      </div>
                      <div className="min-w-0 flex items-center">
                        {editingThis ? (
                          <input
                            type="text"
                            value={editing.code}
                            onChange={(e) =>
                              setEditing((prev) =>
                                prev && prev.kind === 'import' && prev.id === row.batchId
                                  ? { ...prev, code: e.target.value.toUpperCase() }
                                  : prev,
                              )
                            }
                            className="quiz-admin-course-input w-full text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            aria-label="Edit course code"
                          />
                        ) : (
                          <QuizCourseCodeChip
                            code={importCode}
                            activeFilter={courseCodeFilter}
                            onToggle={toggleCourseCodeFilter}
                          />
                        )}
                      </div>
                      <div
                        className="min-w-0 text-xs text-slate-600 dark:text-slate-300 truncate"
                        title={!editingThis && importTitle ? importTitle : undefined}
                      >
                        {editingThis ? (
                          <input
                            type="text"
                            value={editing.title}
                            onChange={(e) =>
                              setEditing((prev) =>
                                prev && prev.kind === 'import' && prev.id === row.batchId
                                  ? { ...prev, title: e.target.value }
                                  : prev,
                              )
                            }
                            className="quiz-admin-course-input w-full text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            aria-label="Edit course title"
                          />
                        ) : (
                          importTitle
                        )}
                      </div>
                      <div className="min-w-0 flex flex-col gap-1 items-start">
                        <div className="flex flex-wrap gap-1 justify-start items-center">
                          <span
                            className="text-[10px] font-bold tabular-nums text-slate-400 border border-slate-600/50 px-1.5 py-0.5 rounded"
                            title={importFileCount.tooltip}
                          >
                            {importFileCount.label}
                          </span>
                          {row.hasGeneratedQuiz && row.poolVersion > 0 ? (
                            <span
                              className="rounded border border-violet-500/35 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-violet-200/95"
                              title={
                                row.totalPoolQuestions > 0
                                  ? `Pool generation Ver${row.poolVersion} · ${row.totalPoolQuestions} question(s) stored`
                                  : `Pool generation Ver${row.poolVersion}`
                              }
                            >
                              [Ver{row.poolVersion}]
                            </span>
                          ) : null}
                        </div>
                        {batchGenerate.error && batchGenerate.batchId === row.batchId && (
                          <p className="text-[10px] text-amber-400 max-w-full">{batchGenerate.error}</p>
                        )}
                      </div>
                      <div className="text-right flex flex-wrap items-center justify-end gap-1.5">
                        {editingThis ? (
                          <>
                            <button
                              type="button"
                              onClick={saveEdit}
                              disabled={rowDisabled || batchGenerate.loading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-400 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                            >
                              {busySave ? '…' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={rowDisabled}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 border border-slate-500/40 hover:bg-slate-500/10 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleGenerateBatch(row.batchId)}
                              disabled={batchGenerate.loading}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-primary border border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors disabled:opacity-50"
                              aria-label={`Generate quiz from import batch ${row.batchId}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                              {batchGenerate.loading && batchGenerate.batchId === row.batchId
                                ? '…'
                                : 'Generate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditImport(row)}
                              disabled={rowDisabled || batchGenerate.loading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 border border-slate-500/50 bg-slate-500/10 hover:bg-slate-500/20 transition-colors disabled:opacity-50"
                              aria-label={`Edit import ${row.batchId}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteImportBatch(row.batchId)}
                              disabled={rowDisabled || batchGenerate.loading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-400 border border-red-500/40 bg-red-500/5 hover:bg-red-500/15 transition-colors disabled:opacity-50"
                              aria-label={`Delete import ${row.batchId}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    )
                  }
                  if (row.kind === 'ai') {
                    const aiCode = aiRowCode(row)
                    const editingThis =
                      editing?.kind === 'ai' && editing.id === row.collectionId
                    const busySave = isRowBusy('ai', row.collectionId, 'save')
                    const busyDel = isRowBusy('ai', row.collectionId, 'delete')
                    const rowDisabled = busySave || busyDel
                    const aiFileCount = fileCountDisplay(row.files)
                    return (
                    <div
                      key={`ai-${row.collectionId}`}
                      className="grid grid-cols-[2.5rem_minmax(0,5rem)_minmax(0,24rem)_minmax(10rem,1fr)_minmax(15rem,auto)] gap-3 items-center bg-slate-500/5 px-3 py-4 transition-colors hover:bg-violet-500/5 group dark:bg-slate-900/40 sm:gap-4 sm:px-6"
                      data-purpose="quiz-ai-collection-row"
                    >
                      <div
                        className="w-10 text-slate-500 dark:text-slate-400 text-xs font-mono tabular-nums"
                        title={row.collectionId}
                      >
                        {row.displayId}
                      </div>
                      <div className="min-w-0 flex flex-wrap items-center gap-1.5">
                        {editingThis ? (
                          <input
                            type="text"
                            value={editing.code}
                            onChange={(e) =>
                              setEditing((prev) =>
                                prev && prev.kind === 'ai' && prev.id === row.collectionId
                                  ? { ...prev, code: e.target.value.toUpperCase() }
                                  : prev,
                              )
                            }
                            className="quiz-admin-course-input min-w-0 flex-1 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            aria-label="Edit course code"
                          />
                        ) : (
                          <QuizCourseCodeChip
                            code={aiCode}
                            activeFilter={courseCodeFilter}
                            onToggle={toggleCourseCodeFilter}
                          />
                        )}
                      </div>
                      <div
                        className={`min-w-0 text-xs truncate ${
                          row.userHasPerfectScore && !editingThis
                            ? ''
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                        title={!editingThis && row.title ? row.title : undefined}
                      >
                        {editingThis ? (
                          <input
                            type="text"
                            value={editing.title}
                            onChange={(e) =>
                              setEditing((prev) =>
                                prev && prev.kind === 'ai' && prev.id === row.collectionId
                                  ? { ...prev, title: e.target.value }
                                  : prev,
                              )
                            }
                            className="quiz-admin-course-input w-full text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            aria-label="Edit quiz title"
                          />
                        ) : row.userHasPerfectScore ? (
                          <span
                            className="inline-block max-w-full truncate font-semibold text-amber-100 drop-shadow-[0_0_10px_rgba(251,191,36,0.45)]"
                            aria-label={`${row.title}. You scored 100% on this quiz at least once.`}
                            data-purpose="ai-quiz-perfect-title"
                          >
                            {row.title}
                          </span>
                        ) : row.userHasAttempted === false ? (
                          <span
                            className="quiz-title-never-attempted inline-block max-w-full truncate font-semibold text-cyan-200/95 dark:text-cyan-100/85"
                            aria-label={`${row.title}. You have not taken this quiz yet.`}
                            data-purpose="ai-quiz-never-attempted-title"
                          >
                            {row.title}
                          </span>
                        ) : (
                          row.title
                        )}
                      </div>
                      <div className="min-w-0 flex flex-wrap gap-1 justify-start items-center">
                        <span
                          className="text-[10px] font-bold tabular-nums text-slate-400 border border-slate-600/50 px-1.5 py-0.5 rounded"
                          title={aiFileCount.tooltip}
                        >
                          {aiFileCount.label}
                        </span>
                        {row.poolVersion > 0 ? (
                          <span
                            className="rounded border border-violet-500/35 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-violet-200/95"
                            title={`Generation Ver${row.poolVersion} · ${row.questionCount ?? 0} question(s) in pool`}
                          >
                            [Ver{row.poolVersion}]
                          </span>
                        ) : null}
                      </div>
                      <div className="text-right flex flex-wrap items-center justify-end gap-1.5">
                        {isAdmin && editingThis && (
                          <>
                            <button
                              type="button"
                              onClick={saveEdit}
                              disabled={rowDisabled}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-400 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                            >
                              {busySave ? '…' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={rowDisabled}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 border border-slate-500/40 hover:bg-slate-500/10 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {!(isAdmin && editingThis) && (
                          <>
                            {isAdmin && (
                              <Link
                                to={`/quiz/ai/${row.collectionId}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-primary border border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors"
                                aria-label={`View AI quiz ${row.collectionId}`}
                              >
                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                View
                              </Link>
                            )}
                            <Link
                              to={`/quiz/run/${row.collectionId}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-primary border border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors"
                              aria-label={`Start AI quiz ${row.collectionId}`}
                              data-purpose="ai-quiz-run"
                            >
                              <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                              Start
                            </Link>
                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditAi(row)}
                                  disabled={rowDisabled}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 border border-slate-500/50 bg-slate-500/10 hover:bg-slate-500/20 transition-colors disabled:opacity-50"
                                  aria-label={`Edit AI quiz ${row.collectionId}`}
                                >
                                  <span className="material-symbols-outlined text-[14px]">edit</span>
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteAiCollection(row.collectionId)}
                                  disabled={rowDisabled}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-400 border border-red-500/40 bg-red-500/5 hover:bg-red-500/15 transition-colors disabled:opacity-50"
                                  aria-label={`Delete AI quiz ${row.collectionId}`}
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                  Delete
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    )
                  }
                  return null
                })}
              </div>
              {user && (
                <div className="flex flex-col gap-3 border-t border-slate-200/50 bg-slate-500/5 px-3 py-3 dark:border-slate-700/50 dark:bg-slate-900/30 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    Page {quizPage + 1}
                    {tableLoading ? (
                      <span className="ml-2 text-slate-400">Loading…</span>
                    ) : null}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={quizPage === 0 || tableLoading}
                      onClick={() => setQuizPage((p) => Math.max(0, p - 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide text-slate-300 border border-slate-500/50 bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={!quizHasMore || tableLoading}
                      onClick={() => setQuizPage((p) => p + 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide text-primary border border-primary/45 bg-primary/10 hover:bg-primary/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              </div>
            </section>
            )}

            {authChecked &&
              user &&
              visibleTableRows.length === 0 &&
              !tableLoading && (
              <div className="rounded-2xl glass border border-dashed border-slate-300/50 dark:border-slate-600/50 p-6 text-center text-slate-500 dark:text-slate-400">
                {normalizedQuery || courseCodeFilter != null
                  ? 'No quizzes match your filters on this page.'
                  : quizRows.length === 0
                    ? 'No quizzes yet.'
                    : 'No quizzes match your filters on this page.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Quiz
