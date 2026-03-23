import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'

function ChapterPage({ moduleId, courseId, courseTitle, onBack, onOpenLesson }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const apiBaseUrl = getApiBaseUrl()

  const fetchModule = async () => {
    if (!moduleId) {
      setLoading(false)
      setError('No chapter selected')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${apiBaseUrl}/api/learning/modules/${moduleId}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        let msg = `Failed to fetch module (${res.status})`
        try {
          const body = await res.json()
          if (body?.error) msg = body.error
        } catch (_) {}
        throw new Error(msg)
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModule()
  }, [moduleId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Error: {error}</p>
        <p className="text-sm text-slate-500 mb-4">
          {error.includes('401') && 'You may need to log in again.'}
          {error.includes('404') && 'The chapter or API route may not exist. Try restarting the backend server.'}
          {error.includes('500') && 'Server error. Check the backend console for details.'}
          {(error.includes('Failed to fetch') || error.includes('NetworkError')) && 'Network error. Ensure the backend is running and VITE_API_URL points to it.'}
        </p>
        <button
          onClick={() => { setError(null); setLoading(true); fetchModule() }}
          className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }
  if (!data) return null

  const { module, lessons, problems, progress } = data

  const typeIcon = (type) => {
    switch (type) {
      case 'reading': return 'menu_book'
      case 'video': return 'play_circle'
      case 'quiz': return 'quiz'
      case 'coding': return 'code'
      default: return 'article'
    }
  }

  const typeLabel = (type) => {
    switch (type) {
      case 'reading': return 'Lesson'
      case 'video': return 'Video'
      case 'quiz': return 'Quiz'
      case 'coding': return 'Problem'
      default: return 'Lesson'
    }
  }

  const ItemCard = ({ item }) => (
    <div
      className={`rounded-xl border p-4 transition-all cursor-pointer ${
        item.isCompleted
          ? 'border-green-200 dark:border-green-900/40 bg-green-50/50 dark:bg-green-950/20'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b2a] hover:border-primary/40'
      }`}
      onClick={() => onOpenLesson?.(item.id)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              {item.isCompleted ? 'check_circle' : typeIcon(item.type)}
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-500">
              {typeLabel(item.type)}
            </span>
            {item.durationMin && (
              <span className="text-[10px] text-slate-400">{item.durationMin} min</span>
            )}
          </div>
          <h4 className="font-bold text-[#111418] dark:text-white mt-1">{item.title}</h4>
        </div>
        <span className="shrink-0 material-symbols-outlined text-slate-400">
          {item.isCompleted ? 'check_circle' : 'arrow_forward'}
        </span>
      </div>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 py-6 pb-24 sm:px-6 lg:p-12">
      <button
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
        onClick={onBack}
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to {courseTitle || data?.module?.course?.title || 'Course'}
      </button>

      <div>
        <p className="text-primary text-sm font-bold uppercase tracking-wide mb-1">
          {module?.course?.code} • {module?.course?.title}
        </p>
        <h1 className="text-3xl font-black text-[#111418] dark:text-white tracking-tight">
          {module?.title}
        </h1>
        {module?.description && (
          <p className="text-slate-600 dark:text-slate-400 mt-2">{module.description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4 sm:gap-4 rounded-2xl bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800">
        <div className="min-w-0 flex-1 basis-[12rem]">
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Progress</p>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="progress-bar-fill h-full rounded-full transition-all"
              style={{ width: `${progress?.progressPercent ?? 0}%` }}
            />
          </div>
        </div>
        <span className="text-sm font-bold text-primary">{progress?.progressPercent ?? 0}%</span>
        <span className={`text-xs font-bold px-2 py-1 rounded ${
          progress?.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          progress?.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        }`}>
          {progress?.status || 'available'}
        </span>
      </div>

      {lessons?.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-[#111418] dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">menu_book</span>
            Lessons
          </h2>
          <div className="space-y-3">
            {lessons.map((l) => (
              <ItemCard key={l.id} item={l} />
            ))}
          </div>
        </section>
      )}

      {problems?.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-[#111418] dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">code</span>
            Practice Problems
          </h2>
          <div className="space-y-3">
            {problems.map((p) => (
              <ItemCard key={p.id} item={p} />
            ))}
          </div>
        </section>
      )}

      {(!lessons?.length && !problems?.length) && (
        <p className="text-slate-500 dark:text-slate-400 py-8 text-center">
          No lessons or problems in this chapter yet.
        </p>
      )}
    </div>
  )
}

export default ChapterPage
