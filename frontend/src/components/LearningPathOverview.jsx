import { useState } from 'react'

function LearningPathOverview({ onOpenModule }) {
  const [searchInput, setSearchInput] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const normalizedQuery = searchInput.trim().toLowerCase()
  const matchesQuery = (text) =>
    !normalizedQuery || text.toLowerCase().includes(normalizedQuery)
  const matchesDifficulty = (difficulty) =>
    difficultyFilter === 'all' || difficultyFilter === difficulty
  const matchesStatus = (status) =>
    statusFilter === 'all' || statusFilter === status
  const matchesModuleOne = matchesQuery(
    'bacs1013 problem solving programming in progress intermediate 20 hrs 85',
  ) && matchesDifficulty('beginner') && matchesStatus('in-progress')
  const matchesModuleTwo = matchesQuery(
    'bait1023 web design development available beginner 24 hrs 92',
  ) && matchesDifficulty('beginner') && matchesStatus('available')
  const matchesModuleThree = matchesQuery(
    'bacs2023 object oriented programming locked hard 30 hrs 76',
  ) && matchesDifficulty('intermediate') && matchesStatus('locked')
  const matchesModuleFour = matchesQuery(
    'bacs2063 data structures and algorithms locked hard 40 hrs 60',
  ) && matchesDifficulty('hard') && matchesStatus('locked')
  const hasMatches =
    matchesModuleOne ||
    matchesModuleTwo ||
    matchesModuleThree ||
    matchesModuleFour

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
      `}</style>
      <div className="glow-line" aria-hidden="true"></div>
      <div className="circuit-bg">
        <div className="max-w-5xl mx-auto w-full p-6 lg:p-12 space-y-10 pb-24 relative z-10">
          <header className="mb-10">
            <div className="mt-0 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b2a] focus:ring-primary focus:border-primary dark:text-white transition-all"
                  placeholder="Search modules..."
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
                </div>
                <button
                  className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b2a] text-slate-600 dark:text-slate-300 font-semibold text-sm flex items-center gap-2 hover:text-primary hover:border-primary/40 transition-colors"
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
              <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#121827] p-4">
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
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

          <div className="space-y-6 max-w-4xl">
            {matchesModuleOne ? (
              <div
                className="group relative bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-primary/5 transition-all hover:translate-x-1"
                onClick={() => onOpenModule?.()}
                role="button"
                tabIndex={0}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-primary font-bold tracking-tighter">
                      BACS1013
                      </span>
                      <div className="relative inline-block group">
                        <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-help">
                          <span className="material-symbols-outlined text-xs">
                            psychology
                          </span>
                          AI INSIGHTS
                        </span>
                        <div className="tooltip-box absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl z-10 text-center">
                          Master this for FAANG interviews. Data structures are
                          60% of technical screens.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold flex items-center gap-3 text-[#111418] dark:text-white">
                      Problem Solving &amp; Programming
                      <span className="flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[14px]">
                          bolt
                        </span>
                        500 XP
                      </span>
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      In Progress
                    </span>
                    <span className="text-[10px] text-slate-400">
                      65% Completed
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Estimated Time
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">
                        schedule
                      </span>
                      <span className="font-bold text-sm">20 hrs</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Difficulty
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-500 text-sm">
                        bar_chart
                      </span>
                      <span className="font-bold text-sm text-emerald-600">
                        Beginner
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Avg Score
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-sm">
                        star
                      </span>
                      <span className="font-bold text-sm">85%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex -space-x-2">
                    <img
                      alt="User"
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-[#161b2a]"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQqX1I48hS8vdCg-O9YAdFkbyaAb9h9wy4KIDKP4hCiJnGsa09XEBjG0Lh7wnEuUyMhm-AqnY6nt7q6s_p895IFYTvHvUwJA6NU6GuHxJEUjEdOrR3MW-WnYZ44MUnhus0DEvi7fxPgpqx8uxpRmHcpKlVEwZYqTXWB5lL7wP3rffpTRJNyGZardC0DpHHvxNJYkDpimvL4QTNFi7CzHHykywk-7XN-g37IynsezxQZCNoXqr_rndBbmytNHRvON6OGQ_lfeCQDCJN"
                    />
                    <img
                      alt="User"
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-[#161b2a]"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBljohqIFps350ag6UtluXXx7p0v0ksfdbAkuPsy_ivd3nVIjSnMzWpkn3fBJEPDOuBgan3PZ5uzSZBNZjvg4QXEppEnPh6hBwBygryK2kn7fe0QRoCgYOlpmqKGmRYAqDjsW57v8hQ7xJuCQ6N7tCtHh_6VkcByjE3GW2mRhjqDDsTigsELFnOIi8F8M_X6qJaImSKrE_m__U1aTXjn3RwAaUNW9Pk5pbIAN92Go9P5HFRRgSpoPub98BmNF0VnKdFtecv5BcNj2AS"
                    />
                    <img
                      alt="User"
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-[#161b2a]"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcyHNjj0zyRUMZDIJ5zPj6k_98iSU5Z3vn3ZKiL3SJa9pFUBr2par1wrwgX17RN8dyfZVWIU7x02tN2grmCjWWrjPz8gf-oUP3BjRokLu5UyIjEsqAAovZXTXeUt2ICmYh3Ejn8AwvCY4aAF44YQgdprwMyqVooi5-LON9pC8iot8-rw2Ud_Pt_jV_WIQNkd31pUmHsN4gtBJK7cTSs8pv-jITgPxoxpRBH7HMFlHSjm-xvOy0AkT70eIqkoF8Dd8h3AdB-fzlV8b7"
                    />
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-[#161b2a]">
                      +102
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors border border-slate-200 dark:border-slate-700"
                      title="View Syllabus"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xl">
                        menu_book
                      </span>
                    </button>
                    <button
                      className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                      onClick={(event) => {
                        event.stopPropagation()
                        onOpenModule?.()
                      }}
                      type="button"
                    >
                      CONTINUE LEARNING
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {matchesModuleTwo ? (
              <div
                className="group relative bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:translate-x-1"
                onClick={() => onOpenModule?.()}
                role="button"
                tabIndex={0}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-primary font-bold tracking-tighter">
                        BAIT1023
                      </span>
                      <div className="relative inline-block group">
                        <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-help">
                          <span className="material-symbols-outlined text-xs">
                            psychology
                          </span>
                          AI INSIGHTS
                        </span>
                        <div className="tooltip-box absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl z-10 text-center">
                          Highly relevant for Full-Stack roles. Focus on React and
                          Tailwind components.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold flex items-center gap-3 text-[#111418] dark:text-white">
                      Web Design &amp; Development
                      <span className="flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[14px]">
                          bolt
                        </span>
                        400 XP
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase">
                    <span className="material-symbols-outlined text-sm">
                      play_arrow
                    </span>
                    Available
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Estimated Time
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">
                        schedule
                      </span>
                      <span className="font-bold text-sm">24 hrs</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Difficulty
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-500 text-sm">
                        bar_chart
                      </span>
                      <span className="font-bold text-sm text-emerald-600">
                        Beginner
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Avg Score
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-sm">
                        star
                      </span>
                      <span className="font-bold text-sm">92%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[10px] font-bold text-slate-500 italic">
                    Ready to start learning
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors border border-slate-200 dark:border-slate-700"
                      title="View Syllabus"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xl">
                        menu_book
                      </span>
                    </button>
                    <button
                      className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                      onClick={(event) => {
                        event.stopPropagation()
                        onOpenModule?.()
                      }}
                      type="button"
                    >
                      START LEARNING
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {matchesModuleThree ? (
              <div className="group relative bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 opacity-60 grayscale-[0.8] transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-bold tracking-tighter">
                      BACS2023
                    </span>
                    <div className="relative inline-block group">
                      <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-help">
                        <span className="material-symbols-outlined text-xs">
                          psychology
                        </span>
                        AI INSIGHTS
                      </span>
                      <div className="tooltip-box absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl z-10 text-center">
                        Core software engineering principles. Essential for
                        understanding scalable systems.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold flex items-center gap-3 text-slate-400">
                    Object Oriented Programming
                    <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-400/10 px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[14px]">
                        bolt
                      </span>
                      800 XP
                    </span>
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <span className="material-symbols-outlined text-sm">
                    lock_clock
                  </span>
                  Locked
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Estimated Time
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">
                      schedule
                    </span>
                    <span className="font-bold text-sm text-slate-400">
                      30 hrs
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Difficulty
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-500 text-sm">
                      bar_chart
                    </span>
                    <span className="font-bold text-sm text-yellow-500">
                      Intermediate
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Avg Score
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">
                      star
                    </span>
                    <span className="font-bold text-sm text-slate-400">
                      76%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="text-[10px] font-bold text-slate-500 italic">
                  Prerequisite: BACS2013 Problem Solving &amp; Programming
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                    title="View Syllabus"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-xl">
                      menu_book
                    </span>
                  </button>
                  <button
                    className="bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-bold px-6 py-2.5 rounded-xl cursor-not-allowed"
                    disabled
                    type="button"
                  >
                    LOCKED
                  </button>
                </div>
              </div>
              </div>
            ) : null}
            {matchesModuleFour ? (
              <div className="group relative bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 opacity-60 grayscale-[0.8] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-bold tracking-tighter">
                        BACS2063
                      </span>
                      <div className="relative inline-block group">
                        <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-help">
                          <span className="material-symbols-outlined text-xs">
                            psychology
                          </span>
                          AI INSIGHTS
                        </span>
                        <div className="tooltip-box absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl z-10 text-center">
                          Build the foundation for efficient problem solving and
                          algorithm design.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold flex items-center gap-3 text-slate-400">
                      Data Structures &amp; Algorithms
                      <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-400/10 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[14px]">
                          bolt
                        </span>
                        900 XP
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                    <span className="material-symbols-outlined text-sm">
                      lock_clock
                    </span>
                    Locked
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Estimated Time
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 text-sm">
                        schedule
                      </span>
                      <span className="font-bold text-sm text-slate-400">
                        40 hrs
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Difficulty
                    </p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-rose-500 text-sm">
                      bar_chart
                    </span>
                    <span className="font-bold text-sm text-rose-500">
                      Hard
                    </span>
                  </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                      Avg Score
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 text-sm">
                        star
                      </span>
                      <span className="font-bold text-sm text-slate-400">
                        60%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[10px] font-bold text-slate-500 italic">
                    Prerequisite: BACS2023 Object Oriented Programming
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                      title="View Syllabus"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xl">
                        menu_book
                      </span>
                    </button>
                    <button
                      className="bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-bold px-6 py-2.5 rounded-xl cursor-not-allowed"
                      disabled
                      type="button"
                    >
                      LOCKED
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            {!hasMatches ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500 dark:text-slate-400">
                No modules match your search.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearningPathOverview
