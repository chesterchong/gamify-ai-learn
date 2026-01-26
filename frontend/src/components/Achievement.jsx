import Layout from './Layout.jsx'

function Achievement() {
  return (
    <Layout title="Achievements">
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
        .achievement-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .achievement-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(19, 127, 236, 0.3),
            0 8px 10px -6px rgba(19, 127, 236, 0.1);
          border-color: #137fec;
        }
        @keyframes ocean-flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .ocean-gradient-anim {
          background: linear-gradient(270deg, #38bdf8, #3b82f6, #2dd4bf);
          background-size: 200% 200%;
          animation: ocean-flow 3s ease infinite;
        }
      `}</style>
      <div className="max-w-7xl mx-auto w-full p-4 md:p-8 lg:p-12 flex flex-col gap-8 pb-20">
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                Trophy Collection
              </h1>
              <p className="text-slate-500 dark:text-[#9dabb9] text-lg font-normal">
                Level 14 • Python Practitioner
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-light dark:bg-[#283039] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#323b46] transition text-sm font-medium dark:text-white shadow-sm">
              <span className="material-symbols-outlined text-lg">share</span>
              Share Profile
            </button>
          </div>
          <div className="bg-surface-light dark:bg-[#1c252e] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
            <div className="flex flex-col gap-3 relative z-10">
              <div className="flex gap-6 justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    flag
                  </span>
                  <p className="text-slate-900 dark:text-white text-base font-semibold">
                    Your Journey So Far
                  </p>
                </div>
                <span className="text-primary font-bold text-lg">65%</span>
              </div>
              <div className="h-4 w-full bg-slate-100 dark:bg-[#3b4754] rounded-full overflow-hidden">
                <div
                  className="h-full ocean-gradient-anim relative rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                  style={{ width: '65%' }}
                >
                  <div className="absolute inset-0 bg-white/10 w-full h-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-slate-500 dark:text-[#9dabb9] text-sm">
                  Next Reward:{' '}
                  <span className="text-primary font-medium">
                    Advanced Algorithms Module
                  </span>
                </p>
                <p className="text-slate-400 dark:text-slate-600 text-xs">
                  1,250 XP to Level 15
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1 rounded-xl p-5 bg-surface-light dark:bg-[#283039] border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-500">
                  bolt
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">
                  Total XP
                </p>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
                14,500
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl p-5 bg-surface-light dark:bg-[#283039] border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-indigo-400">
                  military_tech
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">
                  Badges
                </p>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
                24{' '}
                <span className="text-lg text-slate-400 font-normal">/ 100</span>
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl p-5 bg-surface-light dark:bg-[#283039] border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                <span className="material-symbols-outlined text-8xl text-purple-500">
                  diamond
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-purple-400">
                  diamond
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">
                  Rarest
                </p>
              </div>
              <p
                className="text-slate-900 dark:text-white text-xl md:text-2xl font-bold tracking-tight truncate"
                title="Graph Theory Wizard"
              >
                Graph Wizard
              </p>
            </div>
          </div>
        </header>
        <section className="sticky top-0 md:top-[-20px] bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm z-20 py-4 -mx-4 px-4 md:mx-0 md:px-0 border-b border-transparent">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar items-center">
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary text-white px-5 shadow-lg shadow-primary/25 transition-transform active:scale-95">
              <span className="text-sm font-semibold">All</span>
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-light dark:bg-[#283039] text-slate-600 dark:text-[#9dabb9] border border-slate-200 dark:border-slate-700 px-5 hover:bg-slate-100 dark:hover:bg-[#323b46] hover:text-primary dark:hover:text-white transition-colors">
              <span className="text-sm font-medium">Algorithms</span>
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-light dark:bg-[#283039] text-slate-600 dark:text-[#9dabb9] border border-slate-200 dark:border-slate-700 px-5 hover:bg-slate-100 dark:hover:bg-[#323b46] hover:text-primary dark:hover:text-white transition-colors">
              <span className="text-sm font-medium">Data Structures</span>
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-light dark:bg-[#283039] text-slate-600 dark:text-[#9dabb9] border border-slate-200 dark:border-slate-700 px-5 hover:bg-slate-100 dark:hover:bg-[#323b46] hover:text-primary dark:hover:text-white transition-colors">
              <span className="text-sm font-medium">Web Dev</span>
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-light dark:bg-[#283039] text-slate-600 dark:text-[#9dabb9] border border-slate-200 dark:border-slate-700 px-5 hover:bg-slate-100 dark:hover:bg-[#323b46] hover:text-primary dark:hover:text-white transition-colors">
              <span className="text-sm font-medium">Speed Runs</span>
            </button>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 px-3 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">
                filter_list
              </span>
              <span className="text-sm font-medium hidden sm:block">Filter</span>
            </button>
          </div>
        </section>
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            <div className="achievement-card group relative aspect-[4/5] rounded-2xl bg-gradient-to-b from-surface-light to-slate-50 dark:from-[#283039] dark:to-[#1c252e] border border-amber-500/30 p-4 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden shadow-lg shadow-amber-900/10">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative size-20 md:size-24 mb-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 p-[2px] shadow-lg shadow-amber-500/20">
                <div className="w-full h-full rounded-full bg-[#1c252e] flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-amber-400">
                    emoji_events
                  </span>
                </div>
                <div className="absolute -bottom-2 bg-amber-500 text-[10px] font-bold text-[#101922] px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#101922]">
                  Legendary
                </div>
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-base leading-tight mb-1 group-hover:text-amber-400 transition-colors">
                Graph Wizard
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">
                Mastered all Advanced Graph Algorithms.
              </p>
              <p className="text-slate-400 dark:text-slate-600 text-[10px] mt-auto pt-2">
                Earned Oct 24
              </p>
            </div>
            <div className="achievement-card group relative aspect-[4/5] rounded-2xl bg-surface-light dark:bg-[#283039] border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 p-4 flex flex-col items-center justify-center text-center cursor-pointer">
              <div className="size-16 md:size-20 mb-4 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-4xl md:text-5xl text-purple-400">
                  psychology
                </span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm md:text-base leading-tight mb-1">
                Recursion Master
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Solved 50 recursive problems.
              </p>
              <p className="text-slate-400 dark:text-slate-600 text-[10px] mt-auto pt-2">
                Earned Oct 10
              </p>
            </div>
            <div className="achievement-card group relative aspect-[4/5] rounded-2xl bg-surface-light dark:bg-[#283039] border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 p-4 flex flex-col items-center justify-center text-center cursor-pointer">
              <div className="size-16 md:size-20 mb-4 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-4xl md:text-5xl text-blue-400">
                  bug_report
                </span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm md:text-base leading-tight mb-1">
                Bug Hunter
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Found and fixed 100 bugs.
              </p>
              <p className="text-slate-400 dark:text-slate-600 text-[10px] mt-auto pt-2">
                Earned Sep 15
              </p>
            </div>
            <div className="achievement-card group relative aspect-[4/5] rounded-2xl bg-surface-light dark:bg-[#283039] border border-slate-200 dark:border-slate-700 hover:border-green-500/50 p-4 flex flex-col items-center justify-center text-center cursor-pointer">
              <div className="size-16 md:size-20 mb-4 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-4xl md:text-5xl text-green-400">
                  waving_hand
                </span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm md:text-base leading-tight mb-1">
                Hello World
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Completed first module.
              </p>
              <p className="text-slate-400 dark:text-slate-600 text-[10px] mt-auto pt-2">
                Earned Aug 01
              </p>
            </div>
            <div className="achievement-card group relative aspect-[4/5] rounded-2xl bg-surface-light dark:bg-[#283039] border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 p-4 flex flex-col items-center justify-center text-center cursor-pointer">
              <div className="size-16 md:size-20 mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-4xl md:text-5xl text-cyan-400">
                  terminal
                </span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm md:text-base leading-tight mb-1">
                CLI Pro
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Used 50 terminal commands.
              </p>
              <p className="text-slate-400 dark:text-slate-600 text-[10px] mt-auto pt-2">
                Earned Aug 05
              </p>
            </div>
            <div className="group relative aspect-[4/5] rounded-2xl bg-slate-100 dark:bg-[#151b22] border border-dashed border-slate-300 dark:border-slate-700 p-4 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity cursor-help">
              <div className="size-16 md:size-20 mb-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-4xl md:text-5xl text-slate-400 dark:text-slate-600 blur-[2px]">
                  hub
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-slate-500 dark:text-slate-400 drop-shadow-md">
                    lock
                  </span>
                </div>
              </div>
              <h3 className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base leading-tight mb-1">
                Locked
              </h3>
              <p className="text-slate-400 dark:text-slate-600 text-xs">
                Complete 'Neural Networks' to reveal.
              </p>
              <div className="w-16 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mt-auto mb-1">
                <div className="w-2/3 h-full bg-primary rounded-full"></div>
              </div>
            </div>
            <div className="group relative aspect-[4/5] rounded-2xl bg-slate-100 dark:bg-[#151b22] border border-dashed border-slate-300 dark:border-slate-700 p-4 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity cursor-help">
              <div className="size-16 md:size-20 mb-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-4xl md:text-5xl text-slate-400 dark:text-slate-600 blur-[2px]">
                  security
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-slate-500 dark:text-slate-400 drop-shadow-md">
                    lock
                  </span>
                </div>
              </div>
              <h3 className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base leading-tight mb-1">
                Locked
              </h3>
              <p className="text-slate-400 dark:text-slate-600 text-xs">
                Requires Security module lvl 5.
              </p>
              <div className="w-16 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mt-auto mb-1">
                <div className="w-1/4 h-full bg-primary rounded-full"></div>
              </div>
            </div>
            <div className="achievement-card group relative aspect-[4/5] rounded-2xl bg-surface-light dark:bg-[#283039] border border-slate-200 dark:border-slate-700 hover:border-rose-500/50 p-4 flex flex-col items-center justify-center text-center cursor-pointer">
              <div className="size-16 md:size-20 mb-4 rounded-full bg-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-4xl md:text-5xl text-rose-400">
                  timer
                </span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm md:text-base leading-tight mb-1">
                Quick Thinker
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Solved hard problem under 2 mins.
              </p>
              <p className="text-slate-400 dark:text-slate-600 text-[10px] mt-auto pt-2">
                Earned Sep 20
              </p>
            </div>
            <div className="achievement-card group relative aspect-[4/5] rounded-2xl bg-surface-light dark:bg-[#283039] border border-slate-200 dark:border-slate-700 hover:border-orange-500/50 p-4 flex flex-col items-center justify-center text-center cursor-pointer">
              <div className="size-16 md:size-20 mb-4 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-4xl md:text-5xl text-orange-400">
                  local_fire_department
                </span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm md:text-base leading-tight mb-1">
                On Fire
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                7-day continuous streak.
              </p>
              <p className="text-slate-400 dark:text-slate-600 text-[10px] mt-auto pt-2">
                Earned Aug 12
              </p>
            </div>
            <div className="group relative aspect-[4/5] rounded-2xl bg-slate-100 dark:bg-[#151b22] border border-dashed border-slate-300 dark:border-slate-700 p-4 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity cursor-help">
              <div className="size-16 md:size-20 mb-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-4xl md:text-5xl text-slate-400 dark:text-slate-600 blur-[2px]">
                  dns
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-slate-500 dark:text-slate-400 drop-shadow-md">
                    lock
                  </span>
                </div>
              </div>
              <h3 className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base leading-tight mb-1">
                Locked
              </h3>
              <p className="text-slate-400 dark:text-slate-600 text-xs">
                Complete 'Database Design'.
              </p>
              <div className="w-16 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mt-auto mb-1">
                <div className="w-0 h-full bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </section>
        <div className="mt-8 flex justify-center pb-8">
          <p className="text-slate-400 dark:text-slate-600 text-sm">
            Keep learning to unlock 76 more badges!
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default Achievement
