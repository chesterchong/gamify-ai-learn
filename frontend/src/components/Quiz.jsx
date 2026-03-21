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

function Quiz() {
  const [searchInput, setSearchInput] = useState('')
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
  }, [apiBaseUrl])

  useEffect(() => {
    if (!authChecked || !user) return
    loadAiCollections()
  }, [authChecked, user, loadAiCollections])

  useEffect(() => {
    if (!authChecked || !isAdmin) return
    loadImportBatches()
  }, [authChecked, isAdmin, loadImportBatches])

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

  const nextDraftId = useMemo(() => {
    return formatListId(importBatches.length + 1)
  }, [importBatches.length])

  const tableRows = useMemo(() => {
    const aiRows = (Array.isArray(aiCollections) ? aiCollections : []).map((c) => ({
      kind: 'ai',
      collectionId: c.id,
      displayId: (c.id || '').slice(0, 6).toUpperCase() || '—',
      title: c.title || 'Untitled',
      courseNote: typeof c.courseNote === 'string' ? c.courseNote : '',
      questionCount: typeof c.questionCount === 'number' ? c.questionCount : 0,
      model: c.model || '',
      createdAt: c.createdAt,
      files: Array.isArray(c.sourceFiles) ? c.sourceFiles : [],
    }))
    if (!isAdmin) return aiRows
    const chronological = [...importBatches].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    const importsChrono = chronological.map((b, index) => ({
      kind: 'import',
      batchId: b.id,
      displayId: formatListId(1 + index),
      courseNote: typeof b.courseNote === 'string' ? b.courseNote : '',
      files: Array.isArray(b.files) ? b.files : [],
    }))
    const importsReversed = [...importsChrono].reverse()
    return [...importsReversed, ...aiRows]
  }, [aiCollections, importBatches, isAdmin])

  const normalizedQuery = searchInput.trim().toLowerCase()
  const filteredTableRows = useMemo(() => {
    if (!normalizedQuery) return tableRows
    return tableRows.filter((row) => {
      if (row.kind === 'import') {
        const note = (row.courseNote || '').toLowerCase()
        const code = parseCourseFromNote(row.courseNote).code.toLowerCase()
        const matchesCode = code.includes(normalizedQuery)
        const matchesNote = note.includes(normalizedQuery)
        const matchesFile = row.files.some((f) =>
          (f.originalName || '').toLowerCase().includes(normalizedQuery),
        )
        const matchesId =
          row.batchId.toLowerCase().includes(normalizedQuery) ||
          row.displayId.toLowerCase().includes(normalizedQuery)
        const matchesTag =
          normalizedQuery.length >= 3 && /upload|import|storage/.test(normalizedQuery)
        return matchesCode || matchesNote || matchesFile || matchesId || matchesTag
      }
      if (row.kind === 'ai') {
        const code = parseCourseFromNote(row.courseNote).code.toLowerCase()
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
        return (
          matchesCode ||
          matchesTitle ||
          matchesNote ||
          matchesFile ||
          matchesId ||
          matchesAi
        )
      }
      return false
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
    const courseNote = `${codePart} ${titlePart}`
    setAdminUploading(true)
    setAdminUploadMessage('')
    try {
      const fd = new FormData()
      fd.append('courseNote', courseNote)
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
              <div className="grid grid-cols-[2.5rem_minmax(0,7rem)_minmax(0,16rem)_minmax(12rem,1fr)_12rem] gap-4 px-6 py-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-500/5 dark:bg-slate-900/30 text-[10px] sm:text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">
                <div className="w-10 text-left">Id</div>
                <div className="min-w-0">Code</div>
                <div className="min-w-0">Course</div>
                <div className="min-w-0">Files</div>
                <div className="text-right">Action</div>
              </div>
              <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                {isAdmin && (
                  <div
                    className="grid grid-cols-[2.5rem_minmax(0,7rem)_minmax(0,16rem)_minmax(12rem,1fr)_12rem] gap-4 px-6 py-4 items-center bg-primary/5 border-b border-primary/20"
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
                        className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide border px-2.5 py-1.5 rounded-lg shrink-0 text-primary border-primary/40 bg-primary/10 hover:bg-primary/20 hover:border-primary/70 cursor-pointer transition-colors disabled:opacity-50"
                        title={`Choose up to ${MAX_ADMIN_FILES} files (stored in Supabase when you click Add)`}
                        aria-label="Choose files to upload"
                      >
                        <span className="material-symbols-outlined text-[14px]" aria-hidden>
                          upload_file
                        </span>
                        {!adminUploadMessage.startsWith('Saved') && 'UPLOAD'}
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
                {filteredTableRows.map((row) => {
                  if (row.kind === 'import') {
                    return (
                    <div
                      key={`import-${row.batchId}`}
                      className="grid grid-cols-[2.5rem_minmax(0,7rem)_minmax(0,16rem)_minmax(12rem,1fr)_12rem] gap-4 px-6 py-4 items-center transition-colors hover:bg-cyan-500/5 group bg-slate-500/5 dark:bg-slate-900/40"
                      data-purpose="quiz-import-batch-row"
                    >
                      <div
                        className="w-10 text-slate-500 dark:text-slate-400 text-xs tabular-nums"
                        title={row.batchId}
                      >
                        {row.displayId}
                      </div>
                      <div className="min-w-0 flex items-center">
                        <span
                          className={`text-[9px] border px-1.5 py-0.5 rounded shrink-0 max-w-full truncate ${codeChipClassForCourseCode(parseCourseFromNote(row.courseNote).code)}`}
                          title="Imported batch"
                        >
                          {parseCourseFromNote(row.courseNote).code}
                        </span>
                      </div>
                      <div className="min-w-0 text-xs text-slate-600 dark:text-slate-300 truncate">
                        {parseCourseFromNote(row.courseNote).title || row.courseNote}
                      </div>
                      <div className="min-w-0 flex flex-col gap-1 items-start">
                        <div className="flex flex-wrap gap-1 justify-start items-center">
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
                      <div className="text-right">
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
                    )
                  }
                  if (row.kind === 'ai') {
                    return (
                    <div
                      key={`ai-${row.collectionId}`}
                      className="grid grid-cols-[2.5rem_minmax(0,7rem)_minmax(0,16rem)_minmax(12rem,1fr)_12rem] gap-4 px-6 py-4 items-center transition-colors hover:bg-violet-500/5 group bg-slate-500/5 dark:bg-slate-900/40"
                      data-purpose="quiz-ai-collection-row"
                    >
                      <div
                        className="w-10 text-slate-500 dark:text-slate-400 text-xs font-mono tabular-nums"
                        title={row.collectionId}
                      >
                        {row.displayId}
                      </div>
                      <div className="min-w-0 flex items-center">
                        <span
                          className={`text-[9px] border px-1.5 py-0.5 rounded shrink-0 max-w-full truncate ${codeChipClassForCourseCode(parseCourseFromNote(row.courseNote).code)}`}
                          title="AI-generated from imports"
                        >
                          {parseCourseFromNote(row.courseNote).code}
                        </span>
                      </div>
                      <div className="min-w-0 text-xs text-slate-600 dark:text-slate-300 truncate">
                        {row.title}
                      </div>
                      <div className="min-w-0 flex flex-wrap gap-1 justify-start items-center">
                        {row.files.map((f) => (
                          <span
                            key={f.id}
                            className="text-[9px] border px-1.5 py-0.5 rounded shrink-0 max-w-[10rem] truncate border-slate-600/50 text-slate-400"
                            title={f.originalName}
                          >
                            {f.originalName}
                          </span>
                        ))}
                        <span className="text-[9px] border px-1.5 py-0.5 rounded shrink-0 border-slate-600/50 text-slate-400">
                          {row.questionCount} Q
                        </span>
                      </div>
                      <div className="text-right flex flex-wrap items-center justify-end gap-1.5">
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
                          aria-label={`Run AI quiz ${row.collectionId}`}
                          data-purpose="ai-quiz-run"
                        >
                          <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                          Run
                        </Link>
                      </div>
                    </div>
                    )
                  }
                  return null
                })}
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
