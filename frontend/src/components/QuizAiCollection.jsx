import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TermsThemeStyles from './TermsThemeStyles'
import { formatPageTitle } from '../lib/documentTitle.js'
import { formatEstimatedQuizTime } from '../lib/quizRunUtils.js'

function choiceListFromJson(choices) {
  if (Array.isArray(choices)) return choices.map((c) => (typeof c === 'string' ? c : String(c)))
  return []
}

function QuizAiCollection() {
  const { collectionId } = useParams()
  const [collection, setCollection] = useState(null)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [error, setError] = useState('')
  const [activeQuestionId, setActiveQuestionId] = useState(null)
  const questionRefs = useRef({})
  const mainScrollRef = useRef(null)
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  const questions = collection?.questions?.length
    ? [...collection.questions].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    : []

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

  useEffect(() => {
    setActiveQuestionId(null)
  }, [collectionId, collection?.id])

  useEffect(() => {
    if (!questions.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        let bestId = null
        let bestRatio = 0
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const id = e.target.getAttribute('data-qid')
          if (!id) continue
          if (e.intersectionRatio >= bestRatio) {
            bestRatio = e.intersectionRatio
            bestId = id
          }
        }
        if (bestId) setActiveQuestionId(bestId)
      },
      { root: null, rootMargin: '-12% 0px -55% 0px', threshold: [0, 0.15, 0.35, 0.55, 0.75, 1] },
    )
    const ids = questions.map((q) => q.id)
    requestAnimationFrame(() => {
      for (const id of ids) {
        const el = questionRefs.current[id]
        if (el) observer.observe(el)
      }
    })
    return () => observer.disconnect()
  }, [questions])

  useEffect(() => {
    document.title = collection?.title
      ? formatPageTitle(collection.title)
      : formatPageTitle('Quiz preview')
  }, [collection?.title, collectionId])

  const scrollToQuestion = useCallback((questionId) => {
    setActiveQuestionId(questionId)
    const el = questionRefs.current[questionId]
    if (!el) return

    const scroller = mainScrollRef.current
    const pad = 12
    const innerScrolls = scroller && scroller.scrollHeight > scroller.clientHeight + 2

    if (innerScrolls) {
      const c = scroller.getBoundingClientRect()
      const e = el.getBoundingClientRect()
      const nextTop = scroller.scrollTop + (e.top - c.top) - pad
      scroller.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    try {
      el.focus({ preventScroll: true })
    } catch {
      el.focus()
    }
  }, [])

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
    <div className="selection:bg-primary selection:text-black min-h-screen flex flex-col">
      <TermsThemeStyles />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex flex-col flex-1 min-h-0">
        <Link
          to="/quiz"
          className="inline-flex shrink-0 items-center gap-2 text-sm text-primary hover:underline mb-8"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Quiz list
        </Link>

        {error && <p className="text-amber-400 text-sm mb-6 shrink-0">{error}</p>}

        {collection && questions.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:flex-1 lg:min-h-0 lg:h-[calc(100dvh-13.5rem)] lg:max-h-[calc(100dvh-13.5rem)]">
            <aside className="w-full lg:w-[min(100%,17.5rem)] shrink-0 z-10 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
              <div className="rounded-lg border border-slate-700/40 bg-slate-950/20 p-4">
                <p className="text-[11px] text-slate-600 tabular-nums mb-3">
                  {questions.length} questions · {formatEstimatedQuizTime(questions.length)}
                </p>
                <div
                  className="grid grid-cols-5 gap-1.5"
                  role="navigation"
                  aria-label="Jump to question"
                >
                  {questions.map((q, idx) => {
                    const num = idx + 1
                    const isActive = activeQuestionId === q.id
                    let base =
                      'relative flex aspect-square min-h-0 items-center justify-center rounded border text-[11px] font-medium tabular-nums transition-[color,background-color,border-color] duration-150 border-slate-700/60 text-slate-500 bg-transparent hover:border-slate-600 hover:text-slate-400'
                    if (isActive) {
                      base += ' border-primary/70 text-slate-100'
                    }
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => scrollToQuestion(q.id)}
                        className={base}
                        aria-current={isActive ? 'true' : undefined}
                        aria-label={`Question ${num}`}
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <p className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-slate-600 leading-snug">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-sm border border-primary/60 bg-primary/15" />
                      In view
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-sm border border-emerald-500/50 bg-emerald-500/25" />
                      Correct answer
                    </span>
                  </p>
                </div>
              </div>
            </aside>

            <div
              ref={mainScrollRef}
              className="min-w-0 flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain"
            >
              <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 md:p-8 space-y-6">
                <header>
                  <h1 className="text-xl font-bold text-white">{collection.title}</h1>
                  <p className="text-xs text-slate-500 mt-2">Answer key (admin preview)</p>
                </header>
                <ol className="space-y-8 list-decimal list-inside marker:text-primary marker:font-bold">
                  {questions.map((q) => {
                    const choiceList = choiceListFromJson(q.choices)
                    return (
                      <li
                        key={q.id}
                        ref={(el) => {
                          questionRefs.current[q.id] = el
                        }}
                        data-qid={q.id}
                        tabIndex={-1}
                        className="text-slate-200 scroll-mt-3 outline-none"
                      >
                        <span className="font-medium text-white align-middle">{q.stem}</span>
                        <ul className="mt-3 ml-4 space-y-2 list-none">
                          {choiceList.map((choiceText, j) => {
                            const isCorrect = j === q.correctIndex
                            const row = isCorrect
                              ? 'block w-full text-left text-sm pl-3 py-1.5 border-l-2 rounded-r-md border-emerald-500 text-emerald-200 bg-emerald-500/[0.06] cursor-default'
                              : 'block w-full text-left text-sm pl-3 py-1.5 border-l-2 rounded-r-md border-slate-600 text-slate-500 cursor-default'
                            return (
                              <li key={j}>
                                <div className={row}>
                                  <span>{choiceText}</span>
                                  {isCorrect && (
                                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-400/90">
                                      correct
                                    </span>
                                  )}
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                        {q.explanation && (
                          <p className="mt-3 text-xs text-slate-400 bg-slate-900/50 rounded-lg p-3">
                            {q.explanation}
                          </p>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>
          </div>
        )}

        {collection && questions.length === 0 && (
          <p className="text-slate-400 text-sm">This collection has no questions.</p>
        )}
      </div>
    </div>
  )
}

export default QuizAiCollection
