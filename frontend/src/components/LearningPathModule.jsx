import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'

function LearningPathModule({ courseId, onBack, onOpenChapter }) {
  const [moduleData, setModuleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const apiBaseUrl = getApiBaseUrl()

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/learning/courses/${courseId}/roadmap`, {
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Failed to fetch course roadmap')
        const data = await response.json()
        setModuleData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) fetchModuleDetails()
  }, [courseId, apiBaseUrl])

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
  if (error) return <div className="text-center py-12 text-red-400">Error: {error}</div>
  if (!moduleData) return null

  const { course, chapters } = moduleData
  const isLocked = course.isLocked === true
  const prerequisite = course.prerequisite

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-6 pb-24 sm:px-6 lg:p-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <button
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
            onClick={onBack}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to Learning Path
          </button>
          <div className="flex items-center gap-2 text-primary text-sm font-bold tracking-wide uppercase">
            <span className="material-symbols-outlined text-[18px]">school</span>
            {course.category} • Year {course.year}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#111418] dark:text-white tracking-tight">
            {course.title}
          </h1>
        </div>
        <div className="flex items-center gap-6 bg-white dark:bg-[#151f2b] p-4 rounded-2xl shadow-sm border border-[#dbe0e6] dark:border-gray-800">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider mb-1">
              Difficulty
            </span>
            <div className={`font-black text-xl ${
              course.difficulty.toLowerCase() === 'beginner' ? 'text-emerald-500' :
              course.difficulty.toLowerCase() === 'intermediate' ? 'text-yellow-500' : 'text-rose-500'
            }`}>
              {course.difficulty}
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider mb-1">
              XP Reward
            </span>
            <div className="flex items-center gap-1 text-yellow-500 font-black text-xl">
              <span className="material-symbols-outlined fill-1">stars</span>{' '}
              {course.xpReward}
            </div>
          </div>
        </div>
      </div>

      {isLocked && prerequisite && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-6 flex items-center gap-4">
          <span className="material-symbols-outlined text-3xl text-amber-600 dark:text-amber-400">lock</span>
          <div>
            <p className="font-bold text-amber-800 dark:text-amber-200">Course locked</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Complete <strong>{prerequisite.code} {prerequisite.title}</strong> to unlock this course.
            </p>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute left-5 lg:left-6 top-4 bottom-4 w-1 bg-gradient-to-b from-primary via-blue-400 to-slate-200 dark:to-slate-800 rounded-full"></div>
        <div className="space-y-12 pl-12 lg:pl-16">
          {chapters.map((chapter, index) => (
            <div key={chapter.id} className={`relative ${chapter.status === 'locked' ? 'opacity-60' : ''}`}>
              <div
                className={`
                  absolute -left-[40px] lg:-left-[54px] top-7
                  w-8 h-8 lg:w-9 lg:h-9
                  rounded-full flex items-center justify-center
                  text-[16px] text-white
                  shadow-sm z-10 transition-transform
                  ring-2 ring-slate-900/70
                  ${
                    chapter.status === 'completed'
                      ? 'bg-green-500'
                      : chapter.status === 'in-progress'
                      ? 'bg-primary'
                      : chapter.status === 'available'
                      ? 'bg-slate-800'
                      : 'bg-slate-600'
                  }
                `}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {chapter.status === 'completed'
                    ? 'check_circle'
                    : chapter.status === 'in-progress'
                    ? 'play_arrow'
                    : chapter.status === 'available'
                    ? 'menu_book'
                    : 'lock'}
                </span>
              </div>
              
              <div className={`glass-card rounded-2xl p-6 shadow-sm transition-all ${
                chapter.status === 'in-progress' ? 'border-primary shadow-xl ring-1 ring-primary/10' : 
                chapter.status === 'completed' ? 'border-green-200 dark:border-green-900/30' : 'border-[#dbe0e6] dark:border-gray-800'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide ${
                        chapter.status === 'completed' ? 'bg-green-100 text-green-700' :
                        chapter.status === 'in-progress' ? 'bg-primary/10 text-primary' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {chapter.status.replace('-', ' ')}
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        Chapter {index + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#111418] dark:text-white">
                      {chapter.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {chapter.description}
                    </p>
                  </div>
                  {/* Removed A+ badge on completed chapters to simplify UI */}
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">menu_book</span>
                    {chapter.lessons} Lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">code</span>
                    {chapter.problems} Problems
                  </span>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex flex-col gap-1 w-1/2">
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>Progress</span>
                      <span className="text-primary">{chapter.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden w-full">
                      <div
                        className="progress-bar-fill h-full rounded-full"
                        style={{ width: `${chapter.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  {chapter.status === 'in-progress' && (
                    <button
                      onClick={() => onOpenChapter?.(chapter.id, course.title)}
                      className="bg-primary hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                      type="button"
                    >
                      Continue
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  )}
                  {chapter.status === 'available' && (
                    <button
                      onClick={() => onOpenChapter?.(chapter.id, course.title)}
                      className="bg-primary hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                      type="button"
                    >
                      Start
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    </button>
                  )}
                  {chapter.status === 'completed' && (
                    <button
                      onClick={() => onOpenChapter?.(chapter.id, course.title)}
                      className="bg-primary hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                      type="button"
                    >
                      Review
                      <span className="material-symbols-outlined text-[16px]">history</span>
                    </button>
                  )}
                </div>

                {/* The CTA buttons above handle all statuses; extra sections removed to keep layout consistent */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LearningPathModule
