import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

function LessonPage({ lessonId, onBack, onComplete, initialModuleData }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState({})
  const [allCorrect, setAllCorrect] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [sidebarData, setSidebarData] = useState({ lessons: [], problems: [], progress: null })
  const [sidebarLoading, setSidebarLoading] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  const QUIZ_DELIM = '\n---QUIZ---\n'
  const FALLBACK_OPTIONS = ['All of the above', 'None of the above', 'Not sure', 'Skip for now']

  const computeProgress = (lessons, problems) => {
    const items = [...(lessons || []), ...(problems || [])]
    if (!items.length) return { status: 'available', progressPercent: 0 }
    const completedCount = items.filter((i) => i.isCompleted).length
    const percent = Math.round((completedCount / items.length) * 100)
    let status = 'available'
    if (percent > 0 && percent < 100) status = 'in-progress'
    if (percent >= 100) status = 'completed'
    return { status, progressPercent: percent }
  }

  const buildDataFromSidebar = (targetLessonId, moduleFromData) => {
    if (!targetLessonId) return null
    const items = [
      ...(sidebarData.lessons || []),
      ...(sidebarData.problems || []),
    ]
    const lessonItem = items.find((l) => l.id === targetLessonId)
    if (!lessonItem) return null

    let content = lessonItem.content || ''
    let quiz = []
    const idx = content.indexOf(QUIZ_DELIM)
    if (idx >= 0) {
      const quizStr = content.slice(idx + QUIZ_DELIM.length).trim()
      content = content.slice(0, idx).trim()
      try {
        quiz = JSON.parse(quizStr)
      } catch {
        quiz = []
      }
    }

    return {
      lesson: {
        id: lessonItem.id,
        title: lessonItem.title,
        type: lessonItem.type,
        durationMin: lessonItem.durationMin,
        order: lessonItem.order,
      },
      module: moduleFromData || null,
      content,
      quiz,
      isCompleted: lessonItem.isCompleted ?? false,
    }
  }

  useEffect(() => {
    if (!lessonId) {
      setLoading(false)
      setError('No lesson selected')
      return
    }

    // Ensure we start at the top whenever a new lesson is loaded
    window.scrollTo({ top: 0, behavior: 'auto' })

    // If we have prefetched module data and haven't built the sidebar yet, initialize from it
    if (
      initialModuleData &&
      !sidebarData.lessons.length &&
      !sidebarData.problems.length
    ) {
      const lessons = initialModuleData.lessons || []
      const problems = initialModuleData.problems || []
      setSidebarData({
        lessons,
        problems,
        progress: computeProgress(lessons, problems),
      })
      if (!data) {
        const optimistic = buildDataFromSidebar(
          lessonId,
          initialModuleData.module,
        )
        if (optimistic) {
          setData(optimistic)
          setAnswers({})
          setChecked({})
          setAllCorrect(false)
          setLoading(false)
        }
      }
    }

    const load = async () => {
      setError(null)

      // If we already have sidebar data and module info, switch instantly using it
      if ((sidebarData.lessons.length || sidebarData.problems.length) && data?.module) {
        const cached = buildDataFromSidebar(lessonId, data.module)
        if (cached) {
          setData(cached)
          setAnswers({})
          setChecked({})
          setAllCorrect(false)
          setLoading(false)

          // Optional: background refresh from backend, without showing spinner
          try {
            const res = await fetch(`${apiBaseUrl}/api/learning/lessons/${lessonId}`, {
              credentials: 'include',
            })
            if (res.ok) {
              const json = await res.json()
              setData((prev) => prev?.lesson?.id === lessonId ? json : prev)
            }
          } catch {
            // ignore background errors
          }
          return
        }
      }

      // Fallback: initial load or cache miss – show spinner
      setLoading(true)
      try {
        const res = await fetch(`${apiBaseUrl}/api/learning/lessons/${lessonId}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch lesson')
        const json = await res.json()
        setData(json)
        setAnswers({})
        setChecked({})
        setAllCorrect(false)

        // Fetch module lessons for sidebar navigation on first load
        if (json?.module?.id) {
          setSidebarLoading(true)
          try {
            const modRes = await fetch(`${apiBaseUrl}/api/learning/modules/${json.module.id}`, {
              credentials: 'include',
            })
            if (modRes.ok) {
              const modJson = await modRes.json()
              const lessons = modJson.lessons || []
              const problems = modJson.problems || []
              setSidebarData({
                lessons,
                problems,
                progress: computeProgress(lessons, problems),
              })
            }
          } catch {
            // sidebar is a nice-to-have; ignore errors
          } finally {
            setSidebarLoading(false)
          }
        } else {
          setSidebarData({ lessons: [], problems: [], progress: computeProgress([], []) })
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, apiBaseUrl])

  const normalize = (s) => String(s || '').trim().toLowerCase()
  const isCorrect = (idx, correctAnswers) => {
    const user = normalize(answers[idx])
    return correctAnswers.some((a) => normalize(a) === user)
  }

  const getOptionsForQuestion = (quiz, idx) => {
    const q = quiz[idx]
    if (!q) return []

    const corrects = Array.from(
      new Set((q.answers || []).map((a) => String(a ?? '').trim())),
    ).filter((a) => a.length > 0)

    let pool = [...corrects]

    // Pull extra candidates from other questions in the same quiz
    const otherAnswers = quiz.flatMap((qq, i) =>
      i === idx ? [] : (qq.answers || []).map((a) => String(a ?? '').trim()),
    )
    for (const cand of otherAnswers) {
      if (!cand || pool.includes(cand)) continue
      pool.push(cand)
      if (pool.length >= 4) break
    }

    // If still fewer than 4, pad with generic fallback options that are not correct
    for (const fb of FALLBACK_OPTIONS) {
      if (!pool.includes(fb) && !corrects.includes(fb)) {
        pool.push(fb)
      }
      if (pool.length >= 4) break
    }

    // Ensure at least one correct option is present
    if (!corrects.length) {
      // No known correct answer; just return first 4 options
      return pool.slice(0, 4)
    }

    // Shuffle options so answer position is randomized per render
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.max(4, Math.min(shuffled.length, 6)))
  }

  const handleCheckAnswers = () => {
    if (!data?.quiz?.length) {
      setAllCorrect(true)
      return
    }
    const results = {}
    let correct = true
    data.quiz.forEach((q, i) => {
      const ok = isCorrect(i, q.answers || [])
      results[i] = ok
      if (!ok) correct = false
    })
    setChecked(results)
    setAllCorrect(correct)

    // Auto-complete graded lessons only when all answers are correct
    if (correct && !data.isCompleted) {
      handleMarkComplete()
    }
  }

  const handleMarkComplete = async () => {
    if (!data?.lesson?.id || completing) return

    // Optimistic UI update: mark as completed immediately
    setData((prev) =>
      prev
        ? {
            ...prev,
            isCompleted: true,
          }
        : prev,
    )
    setSidebarData((prev) => {
      const lessons = (prev.lessons || []).map((l) =>
        l.id === lessonId ? { ...l, isCompleted: true } : l,
      )
      const problems = (prev.problems || []).map((p) =>
        p.id === lessonId ? { ...p, isCompleted: true } : p,
      )
      return {
        lessons,
        problems,
        progress: computeProgress(lessons, problems),
      }
    })
    onComplete?.()

    // Background save: prevent double-submit but don't block UI
    setCompleting(true)
    try {
      const res = await fetch(`${apiBaseUrl}/api/learning/lessons/${lessonId}/complete`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error('Failed to save progress')
      }
    } catch (err) {
      console.error(err)
      // In case of error, we keep the optimistic UI but log for debugging
    } finally {
      setCompleting(false)
    }
  }

  const renderContent = (text) => {
    if (!text) return null
    return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-sm">{part.slice(1, -1)}</code>
      }
      return <span key={i}>{part}</span>
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        Error: {error}
        <button onClick={onBack} className="ml-4 text-primary hover:underline">Back</button>
      </div>
    )
  }
  if (!data) return null

  const { lesson, module, content, quiz, isCompleted } = data
  const hasQuiz = quiz?.length > 0

  const sidebarItems = [
    ...(sidebarData.lessons || []).map((l) => ({ ...l, kind: 'lesson' })),
    ...(sidebarData.problems || []).map((p) => ({ ...p, kind: 'problem' })),
  ].sort((a, b) => (a.order || 0) - (b.order || 0))

  const getNextLessonId = () => {
    if (!lesson?.id) return null
    const idx = sidebarItems.findIndex((item) => item.id === lesson.id)
    if (idx === -1) return null
    const next = sidebarItems[idx + 1]
    return next ? next.id : null
  }

  const handleSelectLesson = (id) => {
    if (!id) return
    const params = new URLSearchParams(searchParams)
    params.set('view', 'lesson')
    if (module?.course?.id) params.set('courseId', module.course.id)
    if (module?.id) params.set('moduleId', module.id)
    params.set('lessonId', id)
    setSearchParams(params)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10 pb-24">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors mb-4"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to chapter
      </button>

      <div className="flex gap-6">
        {/* Sidebar: lessons and problems in this chapter (Terms-style navigation) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center">
              <span className="material-symbols-outlined text-sm mr-2">menu_book</span>
              {module?.title || 'Current chapter'}
            </p>

            {sidebarData.progress && (
              <div className="mb-5">
                <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                  <span>Progress</span>
                  <span className="text-primary">
                    {sidebarData.progress.progressPercent ?? 0}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="progress-bar-fill h-full rounded-full transition-all"
                    style={{ width: `${sidebarData.progress.progressPercent ?? 0}%` }}
                  />
                </div>
              </div>
            )}

            <nav className="text-xs">
              <div className="flex flex-col border-l border-slate-800">
                {sidebarLoading && (
                  <div className="px-4 py-2 text-[11px] text-slate-500">
                    Loading lessons…
                  </div>
                )}
                {!sidebarLoading && sidebarItems.length === 0 && (
                  <div className="px-4 py-2 text-[11px] text-slate-500">
                    No lessons found for this chapter.
                  </div>
                )}
                {sidebarItems.map((item, index) => {
                  const isActive = item.id === lesson?.id
                  const isDone = item.isCompleted
                  const isProblem = item.kind === 'problem'
                  const labelPrefix = String(index + 1).padStart(2, '0')
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectLesson(item.id)}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 border-l-2 transition-all ${
                        isActive
                          ? 'text-primary border-primary bg-primary/5'
                          : 'text-slate-400 border-transparent hover:text-primary hover:border-slate-600'
                      }`}
                    >
                      <span className="text-[10px] text-slate-600 mr-1">
                        {labelPrefix}
                      </span>
                      <span className="material-symbols-outlined text-[16px]">
                        {isDone ? 'check_circle' : isProblem ? 'code' : 'menu_book'}
                      </span>
                      <span className="flex-1 truncate">
                        {item.title}
                      </span>
                      {item.durationMin && (
                        <span className="text-[10px] text-slate-500 ml-1">
                          {item.durationMin}m
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main lesson content */}
        <div className="flex-1 space-y-8">
          <header>
            <p className="text-primary text-xs font-bold uppercase tracking-wide mb-1">
              {module?.course?.code} • {module?.course?.title}
            </p>
            <p className="text-slate-500 text-sm mb-1">{module?.title}</p>
            <h1 className="text-2xl md:text-3xl font-black text-[#111418] dark:text-white tracking-tight">
              {lesson?.title}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              {lesson?.durationMin && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  {lesson.durationMin} min
                </span>
              )}
              {isCompleted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-500/40 text-[11px] text-slate-300 bg-slate-900/40">
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  Review session
                </span>
              )}
            </div>
          </header>

          <section className="prose prose-slate dark:prose-invert max-w-none">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b2a] p-6 leading-relaxed text-[#111418] dark:text-slate-300">
              {renderContent(content)}
            </div>
          </section>

          {hasQuiz && (
            <section>
              <h2 className="text-lg font-bold text-[#111418] dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">quiz</span>
                Multiple choice quiz
              </h2>
              <div className="space-y-4">
                {quiz.map((q, idx) => {
                  const options = getOptionsForQuestion(quiz, idx)
                  const hasOptions = options.length >= 4

                  return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-4 ${
                      checked[idx] === true
                        ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
                        : checked[idx] === false
                        ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b2a]'
                    }`}
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      {q.prompt?.replace(/_____/g, '_____')}
                    </p>
                    {hasOptions ? (
                      <div className="space-y-2">
                        <div className="grid gap-2 sm:grid-cols-2">
                          {options.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setAnswers((prev) => ({ ...prev, [idx]: opt }))
                                  setChecked((prev) => ({ ...prev, [idx]: undefined }))
                                  setAllCorrect(false)
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg border text-xs sm:text-sm transition-colors ${
                                  answers[idx] === opt
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111418] text-[#111418] dark:text-white hover:border-primary/60 hover:bg-primary/5'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                          {checked[idx] === true && (
                            <span
                              className="material-symbols-outlined text-green-500"
                              title="Correct"
                            >
                              check_circle
                            </span>
                          )}
                          {checked[idx] === false && (
                            <span
                              className="material-symbols-outlined text-red-500"
                              title="Incorrect"
                            >
                              cancel
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Quiz options are not available for this question.
                      </p>
                    )}
                  </div>
                  )
                })}
              </div>
              <button
                onClick={handleCheckAnswers}
                className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">fact_check</span>
                Check answers
              </button>
            </section>
          )}

          {/* Completion footer */}
          <section className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-sm">
            <div className="text-xs text-slate-500">
              {hasQuiz && 'Complete the quiz correctly to finish this lesson.'}
            </div>
            <div>
              {isCompleted ? (
                getNextLessonId() ? (
                  <button
                    type="button"
                    onClick={() => handleSelectLesson(getNextLessonId())}
                    className="px-4 py-2 rounded-full bg-primary text-black text-xs font-semibold hover:bg-blue-400 transition-colors inline-flex items-center gap-1"
                  >
                    Next lesson
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 rounded-full bg-primary text-black text-xs font-semibold hover:bg-blue-400 transition-colors inline-flex items-center gap-1"
                  >
                    Back to chapters
                    <span className="material-symbols-outlined text-[16px]">segment</span>
                  </button>
                )
              ) : hasQuiz ? (
                // For graded lessons, completion happens automatically when quiz is correct
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-[11px] text-slate-500">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Locked until all answers are correct
                </span>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  disabled={completing}
                  className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-200 hover:border-primary hover:text-primary disabled:opacity-50 transition-colors flex items-center gap-1"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Mark as done
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default LessonPage
