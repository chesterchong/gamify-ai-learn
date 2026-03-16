import { useState } from 'react'
import TermsThemeStyles from './TermsThemeStyles'

function Quiz() {
  const [searchInput, setSearchInput] = useState('')

  // Course codes and titles match Learn page (api/learning/courses) / seed: BACS1013, BAIT1023, BACS2023, BACS2063
  const quizList = [
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
      modules: [
        { label: 'BACS2023', class: 'bg-blue-900/20 text-blue-400 border-blue-800/40' },
      ],
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

  const normalizedQuery = searchInput.trim().toLowerCase()
  const filteredQuizzes = quizList.filter((quiz) => {
    if (!normalizedQuery) return true
    const matchesTitle = quiz.title.toLowerCase().includes(normalizedQuery)
    const matchesModule = quiz.modules.some((m) =>
      m.label.toLowerCase().includes(normalizedQuery)
    )
    const matchesStatus = quiz.status.toLowerCase().includes(normalizedQuery)
    const matchesId = quiz.id.includes(normalizedQuery)
    const courseStr = typeof quiz.course === 'object' && quiz.course?.code
      ? `${quiz.course.code} ${quiz.course.title || ''}`.toLowerCase()
      : ''
    const matchesCourse = courseStr.includes(normalizedQuery)
    return matchesTitle || matchesModule || matchesStatus || matchesId || matchesCourse
  })

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
        /* Force dark glass search background so text is always visible in prod */
        .quiz-search-input {
          background-color: rgba(15, 23, 42, 0.92);
          color: #e5e7eb;
        }
        .quiz-search-input::placeholder {
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
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="grid grid-cols-[auto_minmax(0,14rem)_minmax(18rem,1fr)_auto_auto] gap-4 px-6 py-4 items-center transition-colors hover:bg-primary/5 group"
                  >
                    <div className="w-10 text-slate-500 dark:text-slate-400 text-xs tabular-nums">
                      {quiz.id}
                    </div>
                    <div className="min-w-0 flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[9px] border px-1.5 py-0.5 rounded shrink-0 ${quiz.course.class}`}
                      >
                        {quiz.course.code}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                        {quiz.course.title}
                      </span>
                    </div>
                    <div className="min-w-0 flex flex-wrap gap-1 justify-start">
                      <span
                        className={`text-[9px] border px-1.5 py-0.5 rounded shrink-0 ${quiz.statusClass}`}
                      >
                        {quiz.status}
                      </span>
                    </div>
                    <div className="w-20 text-center text-xs text-slate-500 dark:text-slate-400">
                      {quiz.estimatedTime}
                    </div>
                    <div className="w-28 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary border border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors"
                        aria-label={`Run quiz ${quiz.id}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                        Run
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {filteredQuizzes.length === 0 && (
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
