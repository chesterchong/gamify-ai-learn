import TopNav from './TopNav'
import TermsThemeStyles from './TermsThemeStyles'
import ShinyText from './ShinyText'

function Dash() {
  return (
    <div className="bg-background-dark selection:bg-primary selection:text-black min-h-screen">
      <TermsThemeStyles />
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .dash-v2 .dash-primary { color: #257bf4; }
        .dash-v2 .dash-primary-bg { background-color: #257bf4; }
        .dash-v2 .dash-surface { background-color: #161b22; }
        .dash-v2 .dash-surface-border { border-color: #1f2937; }
        .dash-v2 .donut-gradient {
          background: conic-gradient(#257bf4 84%, #1e293b 0);
        }
        .dash-v2 .glow-blue {
          box-shadow: 0 0 15px rgba(37, 123, 244, 0.2);
        }
        .dash-v2 .glow-purple {
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
        }
<<<<<<< Current (Your changes)
        .dash-v2 .sparkle-emoji {
          display: inline-block;
          animation: dash-sparkle 2s ease-in-out infinite;
        }
        @keyframes dash-sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          25% { transform: scale(1.2) rotate(90deg); opacity: 0.8; }
          50% { transform: scale(1.1) rotate(180deg); opacity: 1; }
          75% { transform: scale(1.2) rotate(270deg); opacity: 0.8; }
        }
=======
>>>>>>> Incoming (Background Agent changes)
      `}</style>

      <TopNav />

      <main className="dash-v2 min-h-[calc(100vh-4rem)]">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight">
              <span className="sparkle-emoji">✨</span>{' '}
              <ShinyText
                text="Performance Analytics"
                color="#94a3b8"
                shineColor="#ffffff"
                speed={2}
                spread={120}
              />
            </h2>
          </div>

          <div className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-12 lg:col-span-8 relative overflow-hidden bg-slate-900 rounded-2xl p-6 md:p-8 border border-primary/30 group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" style={{ backgroundColor: 'rgba(37,123,244,0.2)' }} />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined dash-primary" style={{ color: '#257bf4' }}>auto_awesome</span>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#257bf4' }}>AI Success Prediction</span>
                </div>
                <div className="flex flex-wrap items-end gap-8 mb-8">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Exam Readiness</p>
                    <h4 className="text-4xl md:text-5xl font-black text-white">High <span className="text-2xl ml-2" style={{ color: '#257bf4' }}>94%</span></h4>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Confidence Score</p>
                    <h4 className="text-2xl font-bold text-slate-200">89%</h4>
                  </div>
                </div>
                <div className="mt-auto bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(37,123,244,0.2)' }}>
                      <span className="material-symbols-outlined text-base" style={{ color: '#257bf4' }}>lightbulb</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      &quot;You&apos;re excelling in logic! Focus <span className="font-bold" style={{ color: '#257bf4' }}>15% more on Big O notation</span> and memory management to secure your A+ in the upcoming finals.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
              <div className="dash-surface p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Average Score</p>
                  <h4 className="text-2xl font-bold text-white">88.5%</h4>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <span className="material-symbols-outlined text-blue-500">percent</span>
                </div>
              </div>
              <div className="dash-surface p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Quizzes Completed</p>
                  <h4 className="text-2xl font-bold text-white">42</h4>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <span className="material-symbols-outlined text-purple-500">task_alt</span>
                </div>
              </div>
              <div className="dash-surface p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Accuracy Rate</p>
                  <h4 className="text-2xl font-bold text-white">91.2%</h4>
                </div>
                <div className="p-3 bg-teal-500/10 rounded-xl">
                  <span className="material-symbols-outlined text-teal-500">ads_click</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-12 lg:col-span-4 dash-surface p-6 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-6">Mastery Overview</h3>
              <div className="flex flex-col items-center">
                <div className="relative w-44 h-44 rounded-full flex items-center justify-center donut-gradient">
                  <div className="absolute inset-4 dash-surface rounded-full flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">84%</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">Curriculum</span>
                  </div>
                </div>
                <div className="mt-6 w-full space-y-3">
                  <div className="flex justify-between items-center text-sm text-slate-300">
                    <span className="text-slate-500">Learning Hours</span>
                    <span className="font-bold text-white">124h</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-300">
                    <span className="text-slate-500">Active Days</span>
                    <span className="font-bold" style={{ color: '#257bf4' }}>18 Day Streak</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="dash-surface p-6 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-green-500">verified</span>
                  <h3 className="text-lg font-bold text-white">Top Strengths</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                    <span className="text-sm font-medium text-slate-200">UI/UX Design</span>
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">95% Mastery</span>
                  </li>
                  <li className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                    <span className="text-sm font-medium text-slate-200">SQL &amp; Databases</span>
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">88% Mastery</span>
                  </li>
                  <li className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                    <span className="text-sm font-medium text-slate-200">Data Structures</span>
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">92% Mastery</span>
                  </li>
                </ul>
              </div>
              <div className="dash-surface p-6 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-orange-500">trending_up</span>
                  <h3 className="text-lg font-bold text-white">Areas for Improvement</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center justify-between p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <span className="text-sm font-medium text-slate-200">Big O Notation</span>
                    <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">Focus Needed</span>
                  </li>
                  <li className="flex items-center justify-between p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <span className="text-sm font-medium text-slate-200">Memory Management</span>
                    <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">Review Required</span>
                  </li>
                  <li className="flex items-center justify-between p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <span className="text-sm font-medium text-slate-200">Network Protocols</span>
                    <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">Practice More</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <footer className="py-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
            <p>© 2024 CS Analytics Platform. Empowering code learners.</p>
            <div className="flex gap-6">
              <a className="hover:opacity-80 transition-opacity" href="#">Documentation</a>
              <a className="hover:opacity-80 transition-opacity" href="#">Privacy Policy</a>
              <a className="hover:opacity-80 transition-opacity" href="#">API Status</a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default Dash
