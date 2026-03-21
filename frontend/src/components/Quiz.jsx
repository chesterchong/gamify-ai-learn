import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearMeCache, readMeCache, writeMeCache } from '../lib/authMeCache.js'
import TermsThemeStyles from './TermsThemeStyles'

const MAX_ADMIN_FILES = 10
const MAX_LIST_ID = 999

function formatListId(n) {
  const clamped = Math.min(Math.max(1, Math.floor(n)), MAX_LIST_ID)
  return String(clamped).padStart(3, '0')
}

/** Parse single "Code/Title" field for display (code chip + title). */
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
  return { code: 'IMPORT', title: t }
}

// Demo quizzes (Learn seed). Uploaded imports are loaded from GET /api/quiz/import-batches.
const STATIC_QUIZ_LIST = [
  {
    id: '001',
    title: 'Data Structures Fundamentals',
    course: {
      code: 'BACS2063',
      title: 'Data Structures & Algorithms',
      class: 'bg-blue-900/20 text-blue-400 border-blue-800/40',
    },
    status: 'STABLE',
    statusClass: 'text-green-500 border-green-500/30',
    estimatedTime: '~25 min',
    modules: [
      { label: 'BACS2063', class: 'bg-blue-900/20 text-blue-400 border-blue-800/40' },
      { label: 'SYLLABUS_V2', class: 'bg-cyan-900/20 text-primary border-cyan-800/40' },
    ],
  },
  {
    id: '002',
    title: 'Discrete Mathematics I',
    course: {
      code: 'BACS2023',
      title: 'Object Oriented Programming',
      class: 'bg-blue-900/20 text-blue-400 border-blue-800/40',
    },
    status: 'LEGACY',
    statusClass: 'text-orange-500 border-orange-500/30',
    estimatedTime: '~15 min',
    modules: [{ label: 'BACS2023', class: 'bg-blue-900/20 text-blue-400 border-blue-800/40' }],
  },
  {
    id: '003',
    title: 'Dynamic Programming & Opt.',
    course: {
      code: 'BACS2063',
      title: 'Data Structures & Algorithms',
      class: 'bg-blue-900/20 text-blue-400 border-blue-800/40',
    },
    status: 'CRITICAL',
    statusClass: 'text-red-500 border-red-500/30',
    estimatedTime: '~12 min',
    modules: [
      { label: 'BACS2063', class: 'bg-blue-900/20 text-blue-400 border-blue-800/40' },
      { label: 'HARDCORE', class: 'bg-purple-900/20 text-purple-400 border-purple-800/40' },
    ],
  },
  {
    id: '004',
    title: 'Modern CSS & Tailwind',
    course: {
      code: 'BAIT1023',
      title: 'Web Design & Development',
      class: 'bg-blue-900/20 text-blue-400 border-blue-800/40',
    },
    status: 'NEW_GEN',
    statusClass: 'text-primary border-primary/30',
    estimatedTime: '~20 min',
    modules: [
      { label: 'BAIT1023', class: 'bg-blue-900/20 text-blue-400 border-blue-800/40' },
      { label: 'FRONTEND', class: 'bg-yellow-900/20 text-yellow-500 border-yellow-800/40' },
    ],
  },
]

function Quiz() {
  const [searchInput, setSearchInput] = useState('')
  const [user, setUser] = useState(() => {
    const c = readMeCache()
    return c ? { role: c.role, professionalRole: c.professionalRole } : null
  })
  /** false until we know session (from cache on first paint, or after /me). Table shows in one shot when true. */
  const [authChecked, setAuthChecked] = useState(() => readMeCache() !== null)
  const [adminCourseDraft, setAdminCourseDraft] = useState('')
  const [adminFiles, setAdminFiles] = useState([])
  const [adminUploading, setAdminUploading] = useState(false)
  const [adminUploadMessage, setAdminUploadMessage] = useState('')
  const adminFileInputRef = useRef(null)
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  const [importBatches, setImportBatches] = useState([])
  const [aiCollections, setAiCollections] = useState([])
  const [batchGenerate, setBatchGenerate] = useState({
    batchId: null,
    loading: false,
    error: '',
  })

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/auth/me`, { credentials: 'include' })
        if (!mounted) return
        if (res.ok) {
          const data = await res.json()
          const u = data.user || null
          if (u) writeMeCache(u)
          setUser(u)
        } else {
          clearMeCache()
          setUser(null)
        }
      } catch {
        if (mounted) {
          clearMeCache()
          setUser(null)
        }
      } finally {
        if (mounted) setAuthChecked(true)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [apiBaseUrl])

  const isAdmin = Boolean(
    user &&
      (user.role?.toLowerCase() === 'admin' ||
        user.professionalRole?.toLowerCase() === 'admin'),
  )

  const loadImportBatches = useCallback(async () => {
    if (!isAdmin) return
    try {
      const res = await fetch(`${apiBaseUrl}/api/quiz/import-batches`, {
        credentials: 'include',
      })
      if (!res.ok) return
      const data = await res.json()
      setImportBatches(Array.isArray(data.batches) ? data.batches : [])
    } catch {
      setImportBatches([])
    }
  }, [apiBaseUrl, isAdmin])

  const loadAiCollections = useCallback(async () => {
    if (!isAdmin) return
    try {
      const res = await fetch(`${apiBaseUrl}/api/quiz/ai-collections`, {
        credentials: 'include',
      })
      if (!res.ok) return
      const data = await res.json()
      setAiCollections(Array.isArray(data.collections) ? data.collections : [])
    } catch {
      setAiCollections([])
    }
  }, [apiBaseUrl, isAdmin])

  useEffect(() => {
    if (!authChecked || !isAdmin) return
    loadImportBatches()
    loadAiCollections()
  }, [authChecked, isAdmin, loadImportBatches, loadAiCollections])

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
      await loadAiCollections()
      setBatchGenerate({ batchId: null, loading: false, error: '' })
    } catch {
      setBatchGenerate({
        batchId,
        loading: false,
        error: 'Network error',
      })
    }
  }

  const staticIdMax = useMemo(() => {
    const nums = STATIC_QUIZ_LIST.map((q) => parseInt(q.id, 10)).filter((n) => !Number.isNaN(n))
    return nums.length ? Math.max(...nums) : 0
  }, [])

  const nextDraftId = useMemo(() => {
    return formatListId(staticIdMax + importBatches.length + 1)
  }, [staticIdMax, importBatches.length])

  const tableRows = useMemo(() => {
    const quizzes = STATIC_QUIZ_LIST.map((q) => ({ kind: 'quiz', ...q }))
    if (!isAdmin) return quizzes
    const chronological = [...importBatches].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    const importsChrono = chronological.map((b, index) => ({
      kind: 'import',
      batchId: b.id,
      displayId: formatListId(staticIdMax + 1 + index),
      courseNote: typeof b.courseNote === 'string' ? b.courseNote : '',
      files: Array.isArray(b.files) ? b.files : [],
    }))
    const importsReversed = [...importsChrono].reverse()
    const aiRows = (Array.isArray(aiCollections) ? aiCollections : []).map((c) => ({
      kind: 'ai',
      collectionId: c.id,
      displayId: (c.id || '').slice(0, 6).toUpperCase() || '—',
      title: c.title || 'Untitled',
      courseNote: typeof c.courseNote === 'string' ? c.courseNote : '',
      questionCount: typeof c.questionCount === 'number' ? c.questionCount : 0,
      model: c.model || '',
      createdAt: c.createdAt,
    }))
    return [...importsReversed, ...aiRows, ...quizzes]
  }, [aiCollections, importBatches, isAdmin, staticIdMax])

  const normalizedQuery = searchInput.trim().toLowerCase()
  const filteredTableRows = useMemo(() => {
    if (!normalizedQuery) return tableRows
    return tableRows.filter((row) => {
      if (row.kind === 'quiz') {
        const matchesTitle = row.title.toLowerCase().includes(normalizedQuery)
        const matchesModule = row.modules.some((m) =>
          m.label.toLowerCase().includes(normalizedQuery),
        )
        const matchesStatus = row.status.toLowerCase().includes(normalizedQuery)
        const matchesId = row.id.includes(normalizedQuery)
        const courseStr =
          typeof row.course === 'object' && row.course?.code
            ? `${row.course.code} ${row.course.title || ''}`.toLowerCase()
            : ''
        const matchesCourse = courseStr.includes(normalizedQuery)
        return matchesTitle || matchesModule || matchesStatus || matchesId || matchesCourse
      }
      if (row.kind === 'import') {
        const note = (row.courseNote || '').toLowerCase()
        const matchesNote = note.includes(normalizedQuery)
        const matchesFile = row.files.some((f) =>
          (f.originalName || '').toLowerCase().includes(normalizedQuery),
        )
        const matchesId =
          row.batchId.toLowerCase().includes(normalizedQuery) ||
          row.displayId.toLowerCase().includes(normalizedQuery)
        const matchesTag =
          normalizedQuery.length >= 3 && /upload|import|storage/.test(normalizedQuery)
        return matchesNote || matchesFile || matchesId || matchesTag
      }
      if (row.kind === 'ai') {
        const matchesTitle = (row.title || '').toLowerCase().includes(normalizedQuery)
        const matchesNote = (row.courseNote || '').toLowerCase().includes(normalizedQuery)
        const matchesId =
          (row.collectionId || '').toLowerCase().includes(normalizedQuery) ||
          (row.displayId || '').toLowerCase().includes(normalizedQuery)
        const matchesAi = normalizedQuery === 'ai' || normalizedQuery.includes('gemini')
        return matchesTitle || matchesNote || matchesId || matchesAi
      }
      return true
    })
  }, [tableRows, normalizedQuery])

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

  const submitAdminUpload = async () => {
    if (!adminCourseDraft.trim()) {
      setAdminUploadMessage('Enter course code and title (Code/Title field).')
      return
    }
    if (adminFiles.length === 0) {
      setAdminUploadMessage('Choose files with UPLOAD, then click Add.')
      return
    }
    setAdminUploading(true)
    setAdminUploadMessage('')
    try {
      const fd = new FormData()
      fd.append('courseNote', adminCourseDraft.trim())
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
      await loadImportBatches()
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
      `}</style>
      <div className="quiz-glow-line" aria-hidden="true" />
      <div className="quiz-circuit-bg relative">
        <div className="max-w-5xl mx-auto w-full p-6 lg:p-12 space-y-10 pb-24 relative z-10">
          <header className="mb-10">
            <div className="mt-0 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
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
              </div>
            </div>
          </header>

          <div className="space-y-6 w-full">
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
              className="glass-card rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto"
              data-purpose="quiz-log"
            >
              <div className="grid grid-cols-[auto_minmax(0,14rem)_minmax(18rem,1fr)_auto_auto] gap-4 px-6 py-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-500/5 dark:bg-slate-900/30 text-[10px] sm:text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">
                <div className="w-10 text-left">Id</div>
                <div className="min-w-0">Course</div>
                <div className="min-w-0">Topics</div>
                <div className="w-20 text-center">Est. Time</div>
                <div className="w-28 text-right">Action</div>
              </div>
              <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                {isAdmin && (
                  <div
                    className="grid grid-cols-[auto_minmax(0,14rem)_minmax(18rem,1fr)_auto_auto] gap-4 px-6 py-4 items-center bg-primary/5 border-b border-primary/20"
                    data-purpose="admin-new-quiz-row"
                  >
                    <div className="w-10 text-slate-500 dark:text-slate-400 text-xs tabular-nums select-none" title="Assigned when quiz is created">
                      {nextDraftId}
                    </div>
                    <div className="min-w-0">
                      <input
                        type="text"
                        value={adminCourseDraft}
                        onChange={(e) => setAdminCourseDraft(e.target.value)}
                        className="quiz-admin-course-input w-full text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Enter Code/Title"
                        aria-label="Course code and title"
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
                        className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide border px-2.5 py-1.5 rounded-lg shrink-0 text-primary border-primary/40 bg-primary/10 hover:bg-primary/20 hover:border-primary/70 cursor-pointer transition-colors disabled:opacity-50"
                        title={`Choose up to ${MAX_ADMIN_FILES} files (stored in Supabase when you click Add)`}
                        aria-label="Choose files to upload"
                      >
                        <span className="material-symbols-outlined text-[14px]" aria-hidden>
                          upload_file
                        </span>
                        UPLOAD
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
                    <div
                      className="w-20 text-center text-xs text-slate-500 dark:text-slate-400 select-none cursor-not-allowed"
                      title="Estimated by AI after processing"
                    >
                      —
                    </div>
                    <div className="w-28 text-right">
                      <button
                        type="button"
                        onClick={submitAdminUpload}
                        disabled={adminUploading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600/90 border border-emerald-500/50 hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        aria-label="Submit files to Supabase"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        {adminUploading ? '…' : 'Add'}
                      </button>
                    </div>
                  </div>
                )}
                {filteredTableRows.map((row) =>
                  row.kind === 'import' ? (
                    <div
                      key={`import-${row.batchId}`}
                      className="grid grid-cols-[auto_minmax(0,14rem)_minmax(18rem,1fr)_auto_auto] gap-4 px-6 py-4 items-center transition-colors hover:bg-cyan-500/5 group bg-slate-500/5 dark:bg-slate-900/40"
                      data-purpose="quiz-import-batch-row"
                    >
                      <div
                        className="w-10 text-slate-500 dark:text-slate-400 text-xs tabular-nums"
                        title={row.batchId}
                      >
                        {row.displayId}
                      </div>
                      <div className="min-w-0 flex flex-wrap items-center gap-2">
                        <span
                          className="text-[9px] border px-1.5 py-0.5 rounded shrink-0 bg-cyan-900/30 text-cyan-300 border-cyan-700/40"
                          title="Imported batch"
                        >
                          {parseCourseFromNote(row.courseNote).code}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          {parseCourseFromNote(row.courseNote).title || row.courseNote}
                        </span>
                      </div>
                      <div className="min-w-0 flex flex-col gap-1 items-start">
                        <div className="flex flex-wrap gap-1 justify-start items-center">
                          <span className="text-[9px] border px-1.5 py-0.5 rounded shrink-0 text-emerald-400 border-emerald-500/30">
                            UPLOAD
                          </span>
                          {row.files.map((f) => (
                            <span
                              key={f.id}
                              className="text-[9px] border px-1.5 py-0.5 rounded shrink-0 max-w-[10rem] truncate border-slate-600/50 text-slate-400"
                              title={f.originalName}
                            >
                              {f.originalName}
                            </span>
                          ))}
                        </div>
                        {batchGenerate.error && batchGenerate.batchId === row.batchId && (
                          <p className="text-[10px] text-amber-400 max-w-full">{batchGenerate.error}</p>
                        )}
                      </div>
                      <div className="w-20 text-center text-xs text-slate-500 dark:text-slate-400">—</div>
                      <div className="w-28 text-right">
                        <button
                          type="button"
                          onClick={() => handleGenerateBatch(row.batchId)}
                          disabled={batchGenerate.loading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary border border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors disabled:opacity-50"
                          aria-label={`Generate quiz from import batch ${row.batchId}`}
                        >
                          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                          {batchGenerate.loading && batchGenerate.batchId === row.batchId
                            ? '…'
                            : 'Generate'}
                        </button>
                      </div>
                    </div>
                  ) : row.kind === 'ai' ? (
                    <div
                      key={`ai-${row.collectionId}`}
                      className="grid grid-cols-[auto_minmax(0,14rem)_minmax(18rem,1fr)_auto_auto] gap-4 px-6 py-4 items-center transition-colors hover:bg-violet-500/5 group bg-slate-500/5 dark:bg-slate-900/40"
                      data-purpose="quiz-ai-collection-row"
                    >
                      <div
                        className="w-10 text-slate-500 dark:text-slate-400 text-xs font-mono tabular-nums"
                        title={row.collectionId}
                      >
                        {row.displayId}
                      </div>
                      <div className="min-w-0 flex flex-wrap items-center gap-2">
                        <span
                          className="text-[9px] border px-1.5 py-0.5 rounded shrink-0 bg-violet-900/30 text-violet-300 border-violet-700/40"
                          title="AI-generated from imports"
                        >
                          {parseCourseFromNote(row.courseNote).code}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          {row.title}
                        </span>
                      </div>
                      <div className="min-w-0 flex flex-wrap gap-1 justify-start items-center">
                        <span className="text-[9px] border px-1.5 py-0.5 rounded shrink-0 text-violet-300 border-violet-500/30">
                          GEMINI
                        </span>
                        <span className="text-[9px] border px-1.5 py-0.5 rounded shrink-0 border-slate-600/50 text-slate-400">
                          {row.questionCount} Q
                        </span>
                      </div>
                      <div className="w-20 text-center text-xs text-slate-500 dark:text-slate-400">
                        ~{Math.max(5, Math.round(row.questionCount * 1.5))} min
                      </div>
                      <div className="w-28 text-right">
                        <Link
                          to={`/quiz/ai/${row.collectionId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary border border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors"
                          aria-label={`View AI quiz ${row.collectionId}`}
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          View
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={row.id}
                      className="grid grid-cols-[auto_minmax(0,14rem)_minmax(18rem,1fr)_auto_auto] gap-4 px-6 py-4 items-center transition-colors hover:bg-primary/5 group"
                    >
                      <div className="w-10 text-slate-500 dark:text-slate-400 text-xs tabular-nums">
                        {row.id}
                      </div>
                      <div className="min-w-0 flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[9px] border px-1.5 py-0.5 rounded shrink-0 ${row.course.class}`}
                        >
                          {row.course.code}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          {row.course.title}
                        </span>
                      </div>
                      <div className="min-w-0 flex flex-wrap gap-1 justify-start">
                        <span
                          className={`text-[9px] border px-1.5 py-0.5 rounded shrink-0 ${row.statusClass}`}
                        >
                          {row.status}
                        </span>
                      </div>
                      <div className="w-20 text-center text-xs text-slate-500 dark:text-slate-400">
                        {row.estimatedTime}
                      </div>
                      <div className="w-28 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary border border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors"
                          aria-label={`Run quiz ${row.id}`}
                        >
                          <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                          Run
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>
            )}

            {authChecked && filteredTableRows.length === 0 && (
              <div className="rounded-2xl glass border border-dashed border-slate-300/50 dark:border-slate-600/50 p-6 text-center text-slate-500 dark:text-slate-400">
                No quizzes match your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Quiz
