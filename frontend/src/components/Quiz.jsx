import TermsThemeStyles from './TermsThemeStyles'

function Quiz() {
  return (
    <div className="selection:bg-primary selection:text-black min-h-screen">
      <TermsThemeStyles />
      <style>{`
        .code-syntax-keyword {
          color: #C678DD;
        }
        .code-syntax-func {
          color: #61AFEF;
        }
        .code-syntax-string {
          color: #98C379;
        }
        .code-syntax-num {
          color: #D19A66;
        }
        .code-syntax-comment {
          color: #5C6370;
          font-style: italic;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <header className="flex items-center justify-between px-6 py-4 glass border-b border-[#e5e7eb]/30 dark:border-slate-700/50">
          <button className="flex items-center gap-2 text-[#637588] dark:text-[#94a3b8] hover:text-[#111418] dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[24px]">close</span>
            <span className="text-sm font-bold hidden sm:block">Quit</span>
          </button>
          <div className="flex-1 max-w-md mx-4 sm:mx-8">
            <div className="flex justify-between mb-1.5 text-xs font-bold text-[#637588] dark:text-[#94a3b8] uppercase tracking-wider">
              <span>Question 4 / 10</span>
              <span>40%</span>
            </div>
            <div className="h-3 w-full bg-[#e5e7eb] dark:bg-[#2d3b4a] rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: '40%' }}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[#e15433]">
              <span
                className="material-symbols-outlined fill-1"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              <span className="font-bold text-lg">12</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#f59e0b]">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
              <span className="font-bold text-lg">450</span>
            </div>
          </div>
        </header>
        <main className="flex-grow flex flex-col items-center justify-start px-4 sm:px-6 py-8 pb-28 overflow-y-auto scrollbar-hide w-full max-w-[960px] mx-auto">
          <div className="w-full mb-8 animate-fade-in-up">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-[#111418] dark:text-white tracking-tight">
              Analyze the Algorithm
            </h1>
            <p className="text-base sm:text-lg text-[#4f5b67] dark:text-[#94a3b8] leading-relaxed">
              Review the Python function below. Identify the{' '}
              <span className="font-bold text-[#111418] dark:text-white">
                Big O time complexity
              </span>{' '}
              based on the nested loop structure.
            </p>
          </div>
          <div className="w-full mb-10 rounded-xl overflow-hidden shadow-lg glass-card border border-[#e5e7eb]/50 dark:border-slate-700/50">
            <div className="bg-[#eef0f2] dark:bg-[#1f2933] px-4 py-2 flex items-center gap-2 border-b border-[#e5e7eb] dark:border-[#2d3b4a]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
              <span className="ml-2 text-xs font-mono text-[#637588] dark:text-[#94a3b8]">
                algorithm_analysis.py
              </span>
            </div>
            <div className="bg-code-bg p-5 overflow-x-auto">
              <pre className="font-mono text-sm sm:text-base leading-relaxed text-[#abb2bf]">
                <code>
                  <span className="select-none text-[#4b5263] pr-4 border-r border-[#4b5263] mr-4">
                    1
                  </span>
                  <span className="code-syntax-keyword">def</span>{' '}
                  <span className="code-syntax-func">analyze_complexity</span>(n):
                  {'\n'}
                  <span className="select-none text-[#4b5263] pr-4 border-r border-[#4b5263] mr-4">
                    2
                  </span>{' '}
                  <span className="code-syntax-comment">
                    # Outer loop runs n times
                  </span>
                  {'\n'}
                  <span className="select-none text-[#4b5263] pr-4 border-r border-[#4b5263] mr-4">
                    3
                  </span>{' '}
                  <span className="code-syntax-keyword">for</span> i{' '}
                  <span className="code-syntax-keyword">in</span>{' '}
                  <span className="code-syntax-func">range</span>(n):
                  {'\n'}
                  <span className="select-none text-[#4b5263] pr-4 border-r border-[#4b5263] mr-4">
                    4
                  </span>{' '}
                  <span className="code-syntax-comment">
                    # Inner loop runs n times
                  </span>
                  {'\n'}
                  <span className="select-none text-[#4b5263] pr-4 border-r border-[#4b5263] mr-4">
                    5
                  </span>{' '}
                  <span className="code-syntax-keyword">for</span> j{' '}
                  <span className="code-syntax-keyword">in</span>{' '}
                  <span className="code-syntax-func">range</span>(n):
                  {'\n'}
                  <span className="select-none text-[#4b5263] pr-4 border-r border-[#4b5263] mr-4">
                    6
                  </span>{' '}
                  <span className="code-syntax-func">print</span>(i, j)
                </code>
              </pre>
            </div>
          </div>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="group relative flex items-center p-4 rounded-xl border-2 border-[#e5e7eb]/50 dark:border-slate-700/50 glass hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0f2f4]/80 dark:bg-[#1f2933]/80 text-[#637588] dark:text-[#94a3b8] font-bold group-hover:bg-white group-hover:text-primary transition-colors">
                A
              </div>
              <div className="ml-4 flex-1">
                <p className="font-mono text-lg font-medium text-[#111418] dark:text-white">
                  O(n)
                </p>
                <p className="text-xs text-[#637588] dark:text-[#94a3b8]">
                  Linear Time
                </p>
              </div>
            </button>
            <button className="group relative flex items-center p-4 rounded-xl border-2 border-[#e5e7eb]/50 dark:border-slate-700/50 glass hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0f2f4]/80 dark:bg-[#1f2933]/80 text-[#637588] dark:text-[#94a3b8] font-bold group-hover:bg-white group-hover:text-primary transition-colors">
                B
              </div>
              <div className="ml-4 flex-1">
                <p className="font-mono text-lg font-medium text-[#111418] dark:text-white">
                  O(n log n)
                </p>
                <p className="text-xs text-[#637588] dark:text-[#94a3b8]">
                  Log-Linear Time
                </p>
              </div>
            </button>
            <button className="relative flex items-center p-4 rounded-xl border-2 border-primary bg-primary/10 dark:bg-primary/20 transition-all text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark ring-offset-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold shadow-sm">
                C
              </div>
              <div className="ml-4 flex-1">
                <p className="font-mono text-lg font-medium text-primary dark:text-white">
                  O(n²)
                </p>
                <p className="text-xs text-primary/80 dark:text-gray-300">
                  Quadratic Time
                </p>
              </div>
              <div className="absolute top-4 right-4 text-primary">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </button>
            <button className="group relative flex items-center p-4 rounded-xl border-2 border-[#e5e7eb]/50 dark:border-slate-700/50 glass hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0f2f4] dark:bg-[#1f2933] text-[#637588] dark:text-[#94a3b8] font-bold group-hover:bg-white group-hover:text-primary transition-colors">
                D
              </div>
              <div className="ml-4 flex-1">
                <p className="font-mono text-lg font-medium text-[#111418] dark:text-white">
                  O(1)
                </p>
                <p className="text-xs text-[#637588] dark:text-[#94a3b8]">
                  Constant Time
                </p>
              </div>
            </button>
          </div>
        </main>
        <footer className="sticky bottom-0 left-0 right-0 glass border-t border-[#e5e7eb]/30 dark:border-slate-700/50 p-4 sm:px-8 z-10">
          <div className="max-w-[960px] mx-auto flex items-center justify-between gap-4">
            <button className="hidden sm:flex px-6 py-3 rounded-lg text-[#637588] dark:text-[#94a3b8] font-bold text-sm hover:bg-[#f0f2f4] dark:hover:bg-[#1f2933] transition-colors focus:outline-none focus:ring-2 focus:ring-[#637588]/50">
              Skip Question
            </button>
            <button className="flex-1 sm:flex-none sm:min-w-[200px] bg-primary hover:bg-primary-hover text-white font-bold text-base py-3.5 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/30 flex items-center justify-center gap-2">
              <span>Check Answer</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Quiz
