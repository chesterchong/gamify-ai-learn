import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'

function LearningPathOverview({ onOpenModule }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const apiBaseUrl = getApiBaseUrl()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/learning/courses`, {
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error('Failed to fetch courses')
        }
        const data = await response.json()
        setCourses(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [apiBaseUrl])

  const normalizedQuery = searchInput.trim().toLowerCase()
  
  const filteredCourses = courses.filter(course => {
    const matchesQuery = !normalizedQuery || 
      course.title.toLowerCase().includes(normalizedQuery) || 
      course.code.toLowerCase().includes(normalizedQuery)
    
    const matchesDifficulty = difficultyFilter === 'all' || 
      course.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
    
    const matchesStatus = statusFilter === 'all' || 
      course.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesQuery && matchesDifficulty && matchesStatus
  })

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
        <button 
          onClick={() => window.location.reload()}
          className="text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <style>{`
        .circuit-bg {
          background-image: radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }
        .glow-line {
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
        .tooltip-box {
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
          transform: translateY(10px);
        }
        .group:hover .tooltip-box {
          visibility: visible;
          opacity: 1;
          transform: translateY(0);
        }
        /* Force dark glass search background so text is always visible in prod */
        .learn-search-input {
          background-color: rgba(15, 23, 42, 0.92);
          color: #e5e7eb;
        }
        .learn-search-input::placeholder {
          color: #64748b;
        }
      `}</style>
      <div className="glow-line" aria-hidden="true"></div>
      <div className="circuit-bg">
        <div className="relative z-10 mx-auto w-full max-w-5xl space-y-8 px-4 py-6 pb-24 sm:space-y-10 sm:px-6 lg:p-12">
          <header className="mb-6 sm:mb-10">
            <div className="mt-0 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  className="learn-search-input w-full pl-10 pr-4 py-2.5 rounded-xl glass border-slate-200/50 dark:border-slate-700/50 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Search modules..."
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
                </div>
                <button
                  className="h-11 px-4 rounded-xl glass border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 font-semibold text-sm flex items-center gap-2 hover:text-primary hover:border-primary/40 transition-colors"
                  onClick={() => setIsFiltersOpen((prev) => !prev)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    tune
                  </span>
                  Filters
                  <span className="material-symbols-outlined text-[18px]">
                    {isFiltersOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>
            </div>
            {isFiltersOpen ? (
              <div className="mt-3 flex flex-col gap-3 rounded-2xl glass p-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400 mr-1">
                    DIFFICULTY
                  </p>
                  {[
                    {
                      value: 'all',
                      label: 'All',
                      activeClass: 'bg-primary text-white shadow-sm',
                    },
                    {
                      value: 'beginner',
                      label: 'Beginner',
                      activeClass: 'bg-emerald-500 text-white shadow-sm',
                    },
                    {
                      value: 'intermediate',
                      label: 'Intermediate',
                      activeClass: 'bg-yellow-500 text-white shadow-sm',
                    },
                    {
                      value: 'hard',
                      label: 'Hard',
                      activeClass: 'bg-rose-500 text-white shadow-sm',
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      className={`min-h-10 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors touch-manipulation sm:min-h-0 sm:py-1.5 ${
                        difficultyFilter === option.value
                          ? option.activeClass
                          : 'text-slate-500 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                      onClick={() => setDifficultyFilter(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400 mr-1">
                    STATUS
                  </p>
                  {[
                    {
                      value: 'all',
                      label: 'All',
                      activeClass: 'bg-primary text-white shadow-sm',
                    },
                    {
                      value: 'in-progress',
                      label: 'In Progress',
                      activeClass: 'bg-emerald-500 text-white shadow-sm',
                    },
                    {
                      value: 'available',
                      label: 'Available',
                      activeClass: 'bg-blue-500 text-white shadow-sm',
                    },
                    {
                      value: 'locked',
                      label: 'Locked',
                      activeClass: 'bg-slate-600 text-white shadow-sm',
                    },
                    {
                      value: 'completed',
                      label: 'Completed',
                      activeClass: 'bg-violet-500 text-white shadow-sm',
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      className={`min-h-10 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors touch-manipulation sm:min-h-0 sm:py-1.5 ${
                        statusFilter === option.value
                          ? option.activeClass
                          : 'text-slate-500 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                      onClick={() => setStatusFilter(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </header>

          <div className="space-y-6 w-full">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className={`group relative glass-card rounded-2xl p-4 transition-all hover:translate-x-1 sm:p-6 ${
                  course.status === 'locked' ? 'opacity-60 grayscale-[0.8]' : 'shadow-xl shadow-primary/5'
                }`}
                onClick={() => course.status !== 'locked' && onOpenModule?.(course.id)}
                role="button"
                tabIndex={0}
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className={`text-xs font-bold tracking-tighter ${course.status === 'locked' ? 'text-slate-400' : 'text-primary'}`}>
                        {course.code}
                      </span>
                      {course.aiInsights && (
                        <div className="relative inline-block group">
                          <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-help">
                            <span className="material-symbols-outlined text-xs">
                              psychology
                            </span>
                            AI INSIGHTS
                          </span>
                          <div className="tooltip-box absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl z-10 text-center">
                            {course.aiInsights}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className={`flex flex-col gap-2 text-lg font-bold sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:text-xl ${course.status === 'locked' ? 'text-slate-400' : 'text-[#111418] dark:text-white'}`}>
                      <span className="min-w-0">{course.title}</span>
                      <span className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs ${course.status === 'locked' ? 'text-slate-400 bg-slate-400/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                        <span className="material-symbols-outlined text-[14px]">
                          bolt
                        </span>
                        {course.xpReward} XP
                      </span>
                    </h3>
                  </div>
                  <div className="flex flex-col items-start gap-1 sm:items-end sm:text-right">
                    {course.prerequisite && (
                      <div className="flex max-w-full items-start gap-1 text-[10px] font-bold italic sm:items-center sm:justify-end">
                        {course.status === 'locked' ? (
                          <span className="material-symbols-outlined text-[14px] text-slate-400">
                            lock
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[14px] text-emerald-500">
                            check_circle
                          </span>
                        )}
                        <span className="min-w-0 break-words text-slate-500">
                          Prerequisite: {course.prerequisite.code} {course.prerequisite.title}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                  <div className="glass p-3 rounded-xl border border-slate-200/30 dark:border-slate-600/30">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Estimated Time
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${course.status === 'locked' ? 'text-slate-400' : 'text-primary'}`}>
                        schedule
                      </span>
                      <span className={`font-bold text-sm ${course.status === 'locked' ? 'text-slate-400' : ''}`}>{course.estimatedHrs} hrs</span>
                    </div>
                  </div>
                  <div className="glass p-3 rounded-xl border border-slate-200/30 dark:border-slate-600/30">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Difficulty
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${
                        course.difficulty.toLowerCase() === 'beginner' ? 'text-emerald-500' : 
                        course.difficulty.toLowerCase() === 'intermediate' ? 'text-yellow-500' : 
                        'text-rose-500'
                      }`}>
                        bar_chart
                      </span>
                      <span className={`font-bold text-sm ${
                        course.difficulty.toLowerCase() === 'beginner' ? 'text-emerald-600' : 
                        course.difficulty.toLowerCase() === 'intermediate' ? 'text-yellow-600' : 
                        'text-rose-600'
                      }`}>
                        {course.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="glass p-3 rounded-xl border border-slate-200/30 dark:border-slate-600/30">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Avg Score
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${course.status === 'locked' ? 'text-slate-400' : 'text-amber-500'}`}>
                        star
                      </span>
                      <span className={`font-bold text-sm ${course.status === 'locked' ? 'text-slate-400' : ''}`}>{course.avgScore}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 border-t border-gray-100 pt-2 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div className="flex w-full flex-col gap-1 sm:w-1/2">
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>Progress</span>
                      <span className={course.status === 'locked' ? 'text-slate-400' : 'text-primary'}>
                        {course.status === 'locked' ? '0%' : `${course.progressPercent ?? 0}%`}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden w-full">
                      <div
                        className={`h-full rounded-full ${course.status === 'locked' ? 'bg-slate-400/50' : 'progress-bar-fill'}`}
                        style={{ width: `${course.status === 'locked' ? 0 : (course.progressPercent ?? 0)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
                    <button
                      className="min-h-11 min-w-11 touch-manipulation rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-600 transition-colors hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      title="View Syllabus"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xl">
                        menu_book
                      </span>
                    </button>
                    <button
                      className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all touch-manipulation sm:flex-initial sm:px-6 ${
                        course.status === 'locked' 
                          ? 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800' 
                          : 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-600'
                      }`}
                      onClick={(event) => {
                        event.stopPropagation()
                        if (course.status !== 'locked') onOpenModule?.(course.id)
                      }}
                      disabled={course.status === 'locked'}
                      type="button"
                    >
                      {course.status === 'locked' ? 'LOCKED' : course.status === 'in-progress' ? 'CONTINUE LEARNING' : 'START LEARNING'}
                      {course.status !== 'locked' && (
                        <span className="material-symbols-outlined text-sm">
                          arrow_forward
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredCourses.length === 0 && (
              <div className="rounded-2xl glass border border-dashed border-slate-300/50 dark:border-slate-600/50 p-6 text-center text-slate-500 dark:text-slate-400">
                No modules match your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearningPathOverview
