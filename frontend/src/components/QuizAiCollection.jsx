import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TermsThemeStyles from './TermsThemeStyles'
import { formatEstimatedQuizTime } from '../lib/quizRunUtils.js'

function QuizAiCollection() {
  const { collectionId } = useParams()
  const [collection, setCollection] = useState(null)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [error, setError] = useState('')
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

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

  useEffect(() => {
    if (!authReady || !isAdmin || !collectionId) return
    let m = true
    setError('')
    ;(async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/quiz/ai-collections/${collectionId}`, {
          credentials: 'include',
        })
        const data = await res.json().catch(() => ({}))
        if (!m) return
        if (!res.ok) {
          setError(data.error || `Load failed (${res.status})`)
          return
        }
        setCollection(data.collection || null)
      } catch {
        if (m) setError('Network error')
      }
    })()
    return () => {
      m = false
    }
  }, [apiBaseUrl, authReady, isAdmin, collectionId])

  if (!authReady) {
    return (
      <div className="selection:bg-primary selection:text-black min-h-screen flex items-center justify-center">
        <TermsThemeStyles />
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="selection:bg-primary selection:text-black min-h-screen">
        <TermsThemeStyles />
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <p className="text-slate-300 mb-6">This preview is only available to admins.</p>
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
      <div className="max-w-3xl mx-auto w-full px-6 py-10">
        <Link
          to="/quiz"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Quiz list
        </Link>

        {error && (
          <p className="text-amber-400 text-sm mb-6">{error}</p>
        )}

        {collection && (
          <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 md:p-8 space-y-6">
            <header>
              <h1 className="text-xl font-bold text-white">{collection.title}</h1>
              <p className="text-xs text-slate-500 mt-2">
                {collection.questions?.length ?? 0} questions · Est.{' '}
                {formatEstimatedQuizTime(collection.questions?.length ?? 0)}
              </p>
            </header>
            <ol className="space-y-8 list-decimal list-inside marker:text-primary marker:font-bold">
              {(collection.questions || []).map((q, i) => (
                <li key={q.id || i} className="text-slate-200">
                  <span className="font-medium text-white">{q.stem}</span>
                  <ul className="mt-3 ml-4 space-y-2 list-none">
                    {Array.isArray(q.choices) &&
                      q.choices.map((choice, j) => (
                        <li
                          key={j}
                          className={`text-sm pl-3 border-l-2 ${
                            j === q.correctIndex
                              ? 'border-emerald-500 text-emerald-200'
                              : 'border-slate-600 text-slate-400'
                          }`}
                        >
                          {choice}
                          {j === q.correctIndex && (
                            <span className="ml-2 text-[10px] uppercase text-emerald-500">
                              correct
                            </span>
                          )}
                        </li>
                      ))}
                  </ul>
                  {q.explanation && (
                    <p className="mt-3 text-xs text-slate-400 bg-slate-900/50 rounded-lg p-3">
                      {q.explanation}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizAiCollection
