import Layout from './Layout.jsx'

function Learn() {
  return (
    <Layout title="Learning Path">
      <div className="max-w-5xl mx-auto p-6 lg:p-12 space-y-10 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary text-sm font-bold tracking-wide uppercase">
              <span className="material-symbols-outlined text-[18px]">
                school
              </span>
              Computer Science • Year 2
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#111418] dark:text-white tracking-tight">
              Data Structures &amp; Algorithms
            </h1>
            <p className="text-[#617589] dark:text-gray-400 max-w-xl text-lg">
              Master the fundamental building blocks of software engineering.
              Ace your interviews and build scalable systems.
            </p>
          </div>
          <div className="flex items-center gap-6 bg-white dark:bg-[#151f2b] p-4 rounded-2xl shadow-sm border border-[#dbe0e6] dark:border-gray-800">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider mb-1">
                Streak
              </span>
              <div className="flex items-center gap-1 text-orange-500 font-black text-xl">
                <span className="material-symbols-outlined fill-1">
                  local_fire_department
                </span>{' '}
                12
              </div>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider mb-1">
                XP
              </span>
              <div className="flex items-center gap-1 text-yellow-500 font-black text-xl">
                <span className="material-symbols-outlined fill-1">
                  stars
                </span>{' '}
                2.4k
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-4 bottom-4 w-1 bg-gradient-to-b from-green-500 via-primary to-gray-200 dark:to-gray-800 rounded-full"></div>
          <div className="space-y-12 pl-12 lg:pl-16">
            <div className="relative group">
              <div className="absolute -left-[45px] lg:-left-[61px] top-6 size-8 lg:size-10 rounded-full bg-green-500 border-4 border-background-light dark:border-background-dark flex items-center justify-center text-white shadow-lg z-10 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[20px] font-bold">
                  check
                </span>
              </div>
              <div className="bg-white dark:bg-[#151f2b] border border-green-200 dark:border-green-900/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all opacity-75 hover:opacity-100 cursor-pointer group-hover:-translate-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                        Completed
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        Module 1
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#111418] dark:text-white">
                      Introduction to Complexity
                    </h3>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="size-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-black border-2 border-white dark:border-[#151f2b] z-20 shadow-lg">
                      A+
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      menu_book
                    </span>{' '}
                    4 Lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      code
                    </span>{' '}
                    12 Problems
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-[45px] lg:-left-[61px] top-8 size-8 lg:size-10 rounded-full bg-primary border-4 border-background-light dark:border-background-dark flex items-center justify-center text-white shadow-lg shadow-blue-500/30 z-10 ring-4 ring-blue-100 dark:ring-blue-900/20">
                <span className="material-symbols-outlined text-[20px] font-bold animate-pulse">
                  play_arrow
                </span>
              </div>
              <div className="bg-white dark:bg-[#151f2b] border border-blue-100 dark:border-blue-900/30 rounded-2xl overflow-hidden shadow-xl ring-1 ring-primary/10 transition-transform hover:-translate-y-1">
                <div
                  className="h-32 bg-cover bg-center relative"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBXAH2QYZwOZtZLPi0CX3UGHEqwDQbR4xTkt5mPuMX7PCfIPChGIyWTOpOPJrjwvVifGZ6sTF35nRb-cT7vORS90Pb_6EpvMBSTLMns5di-A3xhwrKJpvd_jHqDqg3DXW0urrmee_oYcRr3x8mmQRRN1Q0Cfw37X6gvsidAmrPMmWXAXDrj6SXTOPb0C_poZOuZ3ol-FZ73Dt6DTZcY-vlzAQffz6tEEy4WcvlgnjogTMQhchTT24LLuG2MoT_TXKVNbXkqyzC7SY3L')",
                  }}
                >
                  <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151f2b] to-transparent opacity-90 dark:opacity-100"></div>
                  <div className="absolute bottom-4 left-6 text-white z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide border border-white/30 shadow-sm">
                        In Progress
                      </span>
                      <span className="text-xs font-bold text-blue-100 opacity-90">
                        Module 2
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold drop-shadow-sm">
                      Arrays &amp; Strings
                    </h3>
                  </div>
                  <div className="absolute top-4 right-4 text-white/20">
                    <span className="material-symbols-outlined text-6xl">
                      data_array
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                    Learn how to manipulate arrays and strings efficiently.
                    Includes two-pointer techniques, sliding window, and prefix
                    sums.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                      <div className="size-6 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-outlined text-[14px] font-bold">
                          check
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 line-through opacity-70">
                        Static vs Dynamic Arrays
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 shadow-sm relative overflow-hidden group/lesson cursor-pointer hover:bg-primary/10 transition-colors">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                      <div className="size-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[14px] font-bold animate-pulse">
                          play_arrow
                        </span>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-[#111418] dark:text-white block group-hover/lesson:text-primary transition-colors">
                          Two Pointers Technique
                        </span>
                        <span className="text-xs text-primary font-medium flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[12px]">
                            schedule
                          </span>{' '}
                          12 mins
                        </span>
                      </div>
                      <button className="bg-white dark:bg-[#1e2732] text-primary text-xs font-bold px-3 py-1.5 rounded-lg border border-primary/10 hover:bg-primary hover:text-white transition-colors shadow-sm">
                        Start
                      </button>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl opacity-60">
                      <div className="size-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 shrink-0">
                        <span className="material-symbols-outlined text-[14px]">
                          lock
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Sliding Window Pattern
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div className="flex flex-col gap-1 w-1/2">
                      <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span>Module Progress</span>
                        <span className="text-primary">35%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden w-full">
                        <div className="h-full bg-primary rounded-full w-[35%] shadow-sm"></div>
                      </div>
                    </div>
                    <button className="bg-primary hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
                      Continue
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative opacity-50 hover:opacity-80 transition-opacity duration-300">
              <div className="absolute -left-[45px] lg:-left-[61px] top-6 size-8 lg:size-10 rounded-full bg-gray-300 dark:bg-gray-700 border-4 border-background-light dark:border-background-dark flex items-center justify-center text-white z-10">
                <span className="material-symbols-outlined text-[18px]">
                  lock
                </span>
              </div>
              <div className="bg-white dark:bg-[#151f2b] border border-[#dbe0e6] dark:border-gray-800 rounded-2xl p-6 border-dashed">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                        Locked
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        Module 3
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#111418] dark:text-white">
                      Hash Maps &amp; Sets
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Collision resolution, caching, and fast lookups.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative opacity-50 hover:opacity-80 transition-opacity duration-300">
              <div className="absolute -left-[45px] lg:-left-[61px] top-6 size-8 lg:size-10 rounded-full bg-gray-300 dark:bg-gray-700 border-4 border-background-light dark:border-background-dark flex items-center justify-center text-white z-10">
                <span className="material-symbols-outlined text-[18px]">
                  lock
                </span>
              </div>
              <div className="bg-white dark:bg-[#151f2b] border border-[#dbe0e6] dark:border-gray-800 rounded-2xl p-6 border-dashed">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                        Locked
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        Module 4
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#111418] dark:text-white">
                      Linked Lists
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Singly and doubly linked lists, pointer manipulation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent z-0 pointer-events-none"></div>
        </div>
      </div>
    </Layout>
  )
}

export default Learn
