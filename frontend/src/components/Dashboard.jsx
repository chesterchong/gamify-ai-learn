import Layout from './Layout.jsx'

function Dashboard() {
  return (
    <Layout title="Dashboard" mainClassName="no-scrollbar">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="max-w-[800px] mx-auto px-6 py-8 pb-32">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Welcome back, Min Kit!
          </h2>
          <p className="text-text-secondary text-base">
            You're on a 12-day streak. Keep the momentum going!
          </p>
        </div>
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-dark to-[#1a1d24] border border-surface-border p-6 mb-12 shadow-lg hover:border-primary/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-9xl">code</span>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/20 text-primary text-xs font-bold mb-2 uppercase tracking-wide">
                Current Session
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                Unit 2: Object-Oriented Programming
              </h3>
              <p className="text-text-secondary text-sm">
                Lesson 4 • Inheritance &amp; Polymorphism
              </p>
            </div>
            <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-95">
              <span className="material-symbols-outlined">play_circle</span>
              <span>Resume Coding</span>
            </button>
          </div>
        </div>
        <div className="relative flex flex-col items-center">
          <div className="absolute top-0 bottom-0 w-1 bg-surface-border left-[30px] sm:left-1/2 -ml-0.5 z-0"></div>
          <div className="relative w-full flex items-center mb-12 z-10 group">
            <div className="flex sm:w-1/2 justify-start sm:justify-end pr-8 sm:pr-12 order-2 sm:order-1 ml-16 sm:ml-0">
              <div className="bg-surface-dark p-4 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(19,127,236,0.15)] max-w-[280px] w-full relative">
                <div className="absolute right-0 top-1/2 -mt-2 -mr-1.5 w-3 h-3 bg-surface-dark border-t border-r border-primary/30 rotate-45 hidden sm:block"></div>
                <div className="absolute left-0 top-1/2 -mt-2 -ml-1.5 w-3 h-3 bg-surface-dark border-b border-l border-primary/30 rotate-45 block sm:hidden"></div>
                <h4 className="text-white font-bold text-lg">Logic Gates</h4>
                <p className="text-primary text-sm font-medium mt-1">
                  Completed • 100% Score
                </p>
              </div>
            </div>
            <div className="absolute left-[10px] sm:left-1/2 sm:-ml-[20px] w-[40px] h-[40px] rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_#137fec] ring-4 ring-background-dark z-20">
              <span className="material-symbols-outlined text-white text-2xl font-bold">
                check
              </span>
            </div>
            <div className="absolute top-[-48px] bottom-1/2 w-1 bg-primary left-[30px] sm:left-1/2 -ml-0.5 -z-10 shadow-[0_0_8px_rgba(19,127,236,0.6)]"></div>
            <div className="hidden sm:block w-1/2 pl-12 order-2">
              <span className="text-text-secondary text-sm font-mono opacity-50">
                UNIT 01
              </span>
            </div>
          </div>
          <div className="relative w-full flex items-center mb-12 z-10">
            <div className="hidden sm:block w-1/2 pr-12 text-right order-1">
              <span className="text-primary text-sm font-mono font-bold">
                UNIT 02 - ACTIVE
              </span>
            </div>
            <div className="absolute left-[2px] sm:left-1/2 sm:-ml-[28px] w-[56px] h-[56px] rounded-full bg-background-dark border-[3px] border-primary flex items-center justify-center shadow-[0_0_30px_rgba(19,127,236,0.4)] ring-4 ring-background-dark z-20">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping absolute"></div>
              <span className="material-symbols-outlined text-primary text-3xl">
                code
              </span>
            </div>
            <div className="absolute top-[-48px] bottom-1/2 w-1 bg-gradient-to-b from-primary to-surface-border left-[30px] sm:left-1/2 -ml-0.5 -z-10"></div>
            <div className="flex sm:w-1/2 justify-start pl-8 sm:pl-12 order-2 ml-16 sm:ml-0">
              <div className="bg-surface-dark p-5 rounded-xl border border-primary shadow-md max-w-[300px] w-full relative group cursor-pointer hover:bg-surface-border/50 transition-colors">
                <div className="absolute left-0 top-1/2 -mt-2 -ml-1.5 w-3 h-3 bg-surface-dark border-b border-l border-primary rotate-45 hidden sm:block group-hover:bg-surface-border/50 transition-colors"></div>
                <div className="absolute left-[-6px] top-1/2 -mt-2 w-3 h-3 bg-surface-dark border-b border-l border-primary rotate-45 block sm:hidden group-hover:bg-surface-border/50 transition-colors"></div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-bold text-lg">OOP Basics</h4>
                  <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded">
                    IN PROGRESS
                  </span>
                </div>
                <p className="text-text-secondary text-sm mb-3">
                  Master classes, objects, and inheritance.
                </p>
                <div className="w-full bg-surface-border rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{ width: '45%' }}
                  ></div>
                </div>
                <div className="mt-2 text-right text-xs text-text-secondary">
                  45% Complete
                </div>
              </div>
            </div>
          </div>
          <div className="relative w-full flex items-center mb-12 z-10 opacity-70">
            <div className="flex sm:w-1/2 justify-start sm:justify-end pr-8 sm:pr-12 order-2 sm:order-1 ml-16 sm:ml-0">
              <div className="bg-background-dark p-4 rounded-xl border border-surface-border border-dashed max-w-[280px] w-full relative">
                <h4 className="text-text-secondary font-bold text-lg">
                  Algorithms
                </h4>
                <p className="text-text-secondary/60 text-sm mt-1">
                  Locked • Prerequisite needed
                </p>
              </div>
            </div>
            <div className="absolute left-[10px] sm:left-1/2 sm:-ml-[20px] w-[40px] h-[40px] rounded-full bg-surface-border flex items-center justify-center ring-4 ring-background-dark z-20">
              <span className="material-symbols-outlined text-text-secondary text-xl">
                lock
              </span>
            </div>
            <div className="hidden sm:block w-1/2 pl-12 order-2">
              <span className="text-text-secondary text-sm font-mono opacity-30">
                UNIT 03
              </span>
            </div>
          </div>
          <div className="relative w-full flex items-center mb-12 z-10 opacity-50">
            <div className="hidden sm:block w-1/2 pr-12 text-right order-1">
              <span className="text-text-secondary text-sm font-mono opacity-30">
                UNIT 04
              </span>
            </div>
            <div className="absolute left-[10px] sm:left-1/2 sm:-ml-[20px] w-[40px] h-[40px] rounded-full bg-surface-border flex items-center justify-center ring-4 ring-background-dark z-20">
              <span className="material-symbols-outlined text-text-secondary text-xl">
                lock
              </span>
            </div>
            <div className="flex sm:w-1/2 justify-start pl-8 sm:pl-12 order-2 ml-16 sm:ml-0">
              <div className="bg-transparent p-4 rounded-xl border border-surface-border border-dashed max-w-[280px] w-full relative">
                <h4 className="text-text-secondary font-bold text-lg">
                  System Design
                </h4>
                <p className="text-text-secondary/60 text-sm mt-1">Locked</p>
              </div>
            </div>
          </div>
          <div className="relative w-full flex items-center z-10 opacity-30">
            <div className="flex sm:w-1/2 justify-start sm:justify-end pr-8 sm:pr-12 order-2 sm:order-1 ml-16 sm:ml-0">
              <div className="bg-transparent p-4 rounded-xl border border-surface-border border-dashed max-w-[280px] w-full relative">
                <h4 className="text-text-secondary font-bold text-lg">
                  Capstone
                </h4>
              </div>
            </div>
            <div className="absolute left-[10px] sm:left-1/2 sm:-ml-[20px] w-[40px] h-[40px] rounded-full bg-surface-border flex items-center justify-center ring-4 ring-background-dark z-20">
              <span className="material-symbols-outlined text-text-secondary text-xl">
                emoji_events
              </span>
            </div>
            <div className="hidden sm:block w-1/2 pl-12 order-2"></div>
          </div>
        </div>
        <div className="fixed bottom-6 right-6 lg:hidden z-50">
          <button className="size-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">
              smart_toy
            </span>
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
