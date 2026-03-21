import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import TermsThemeStyles from './TermsThemeStyles'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'

const MAX_FILES = 10

function QuizUpload() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialCourse = searchParams.get('course') || ''
  const [courseCode, setCourseCode] = useState(initialCourse)
  const [courseTitle, setCourseTitle] = useState('')
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const fileInputRef = useRef(null)
  const apiBaseUrl = getApiBaseUrl()

  useEffect(() => {
    let m = true
    ;(async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/auth/me`, { credentials: 'include' })
        if (!m) return
        if (res.ok) {
          const data = await res.json()
          setUser(data.user || null)
        }
      } finally {
        if (m) setAuthReady(true)
      }
    })()
    return () => {
      m = false
    }
  }, [apiBaseUrl])

  const isAdmin = Boolean(
    user &&
      (user.role?.toLowerCase() === 'admin' ||
        user.professionalRole?.toLowerCase() === 'admin'),
  )

  const onFileChange = (e) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length > MAX_FILES) {
      setMessage(`You can upload at most ${MAX_FILES} files.`)
      setFiles(selected.slice(0, MAX_FILES))
      return
    }
    setMessage('')
    setFiles(selected)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!courseCode.trim()) {
      setMessage('Enter a course code (Code).')
      return
    }
    if (!courseTitle.trim()) {
      setMessage('Enter a course title (Course).')
      return
    }
    if (files.length === 0) {
      setMessage('Select at least one file.')
      return
    }
    setStatus('submitting')
    setMessage('')
    try {
      const fd = new FormData()
      fd.append('courseCode', courseCode.trim())
      fd.append('courseNote', courseTitle.trim())
      files.forEach((f) => fd.append('files', f))
      const res = await fetch(`${apiBaseUrl}/api/quiz/import-files`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data.error || `Upload failed (${res.status})`)
        setStatus('idle')
        return
      }
      setStatus('success')
      setMessage(`Uploaded ${data.fileCount} file(s). Batch ID: ${data.batchId}`)
      setFiles([])
    } catch {
      setMessage('Network error. Try again.')
      setStatus('idle')
    }
  }

  if (!authReady) {
    return (
      <div className="selection:bg-primary selection:text-black min-h-screen flex items-center justify-center">
        <TermsThemeStyles />
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  if (authReady && user && !isAdmin) {
    return (
      <div className="selection:bg-primary selection:text-black min-h-screen">
        <TermsThemeStyles />
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <p className="text-slate-300 mb-6">This upload page is only available to admin accounts.</p>
          <Link to="/quiz" className="text-primary font-semibold hover:underline">
            Back to Quiz
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="selection:bg-primary selection:text-black min-h-screen">
      <TermsThemeStyles />
      <div className="max-w-2xl mx-auto w-full px-6 py-10">
        <Link
          to="/quiz"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Quiz list
        </Link>
        <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 md:p-8">
          <h1 className="text-xl font-bold text-white mb-2">Upload quiz source files</h1>
          <p className="text-sm text-slate-400 mb-6">
            Up to {MAX_FILES} files per batch. On the Quiz page, use{' '}
            <span className="text-slate-300 font-semibold">Generate</span> on the import row to build MCQs with Gemini and
            save them to the database.
          </p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
                  htmlFor="courseCode"
                >
                  Code <span className="text-amber-500/90">(required)</span>
                </label>
                <input
                  id="courseCode"
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-600 text-slate-100 placeholder:text-slate-500 focus:ring-primary focus:border-primary"
                  placeholder="e.g. BACS1013"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
                  htmlFor="courseTitle"
                >
                  Course <span className="text-amber-500/90">(required)</span>
                </label>
                <input
                  id="courseTitle"
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-600 text-slate-100 placeholder:text-slate-500 focus:ring-primary focus:border-primary"
                  placeholder="Course title"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="files">
                Files (max {MAX_FILES})
              </label>
              <input
                ref={fileInputRef}
                id="files"
                type="file"
                multiple
                onChange={onFileChange}
                className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
              />
              {files.length > 0 && (
                <ul className="mt-3 text-xs text-slate-400 space-y-1">
                  {files.map((f) => (
                    <li key={f.name + f.size}>{f.name} ({Math.round(f.size / 1024)} KB)</li>
                  ))}
                </ul>
              )}
            </div>
            {message && (
              <p className={`text-sm ${status === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {message}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-6 py-2.5 rounded-xl bg-primary text-black font-bold text-sm hover:opacity-90 disabled:opacity-50"
              >
                {status === 'submitting' ? 'Uploading…' : 'Upload to server'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/quiz')}
                className="px-6 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default QuizUpload
