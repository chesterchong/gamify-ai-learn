import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from './Layout.jsx'
import ProfileShareModal from './ProfileShareModal.jsx'

function Profile() {
  const [isShareOpen, setIsShareOpen] = useState(false)
  const profileShareLink = 'sample.com/u/chester'

  return (
    <Layout title="Profile">
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #3b4754;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
        .heatmap-grid {
          display: grid;
          grid-template-columns: repeat(52, 1fr);
          gap: 4px;
        }
      `}</style>
      <section className="relative w-full bg-gradient-to-r from-primary to-[#0b5cb5] pt-10 pb-20 px-6 md:px-12 lg:px-16 shadow-lg">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>
        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-white to-blue-200 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
              <img
                alt="Profile picture of Chester"
                className="w-full h-full rounded-full object-cover border-4 border-primary"
                src="https://lh3.googleusercontent.com/a/ACg8ocLyRHQvwCqfDkEB8QjBR1lbWwKLf6LC773bpIZzMD1HvKM4yFTy=s432-c-"
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-yellow-400 text-black font-bold text-xs px-2 py-1 rounded-full border-2 border-[#0b5cb5]">
              LVL 12
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left text-white">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Chester
              </h1>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                @chester
              </span>
            </div>
            <p className="text-blue-100 text-lg font-medium mb-6">Student</p>
            <div className="w-full max-w-lg mb-6">
              <div className="flex justify-between text-sm font-medium text-blue-100 mb-2">
                <span>Mastery Progress</span>
                <span>4,500 / 5,000 XP</span>
              </div>
              <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-white rounded-full relative overflow-hidden"
                  style={{ width: '90%' }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
              <p className="text-xs text-blue-200 mt-2 text-right">
                500 XP to Level 13 (Veteran)
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                className="flex items-center gap-2 px-5 py-2 bg-white text-primary rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
                to="/profile/edit"
              >
                <span className="material-symbols-outlined text-[20px]">
                  edit
                </span>
                Edit Profile
              </Link>
              <button
                className="flex items-center gap-2 px-5 py-2 bg-black/20 text-white rounded-lg font-bold text-sm hover:bg-black/30 transition-colors backdrop-blur-md border border-white/10"
                onClick={() => setIsShareOpen(true)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  share
                </span>
                Share Profile
              </button>
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-6xl mx-auto w-full px-6 md:px-12 lg:px-16 -mt-12 mb-12 relative z-10 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1e2732] p-5 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300">
            <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-lg text-orange-500">
              <span className="material-symbols-outlined text-3xl">
                local_fire_department
              </span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Current Streak
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                45 Days
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1e2732] p-5 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300">
            <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-lg text-purple-500">
              <span className="material-symbols-outlined text-3xl">
                leaderboard
              </span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Class Rank
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                Top 5%
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1e2732] p-5 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300">
            <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-lg text-green-500">
              <span className="material-symbols-outlined text-3xl">
                library_books
              </span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Modules Done
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                12 / 20
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Recent Achievements
            </h2>
            <a
              className="text-primary hover:text-blue-400 text-sm font-medium flex items-center gap-1"
              href="/achievement"
            >
              View All{' '}
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#283039] p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-8xl">
                  terminal
                </span>
              </div>
              <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary dark:text-blue-400">
                <span className="material-symbols-outlined text-2xl">
                  terminal
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  CLI Master
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Completed all Bash scripting challenges.
                </p>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-auto pt-2">
                Earned 2 days ago
              </p>
            </div>
            <div className="bg-white dark:bg-[#283039] p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-8xl">
                  bug_report
                </span>
              </div>
              <div className="size-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <span className="material-symbols-outlined text-2xl">
                  bug_report
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Bug Hunter
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Fixed 50 syntax errors in the sandbox.
                </p>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-auto pt-2">
                Earned 5 days ago
              </p>
            </div>
            <div className="bg-white dark:bg-[#283039] p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-8xl">
                  database
                </span>
              </div>
              <div className="size-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <span className="material-symbols-outlined text-2xl">
                  database
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  SQL Ninja
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Optimized 10 queries with indexes.
                </p>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-auto pt-2">
                Earned 1 week ago
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-[#1e2228] p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col gap-4 relative opacity-70 hover:opacity-100 transition-opacity">
              <div className="size-12 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-2xl">
                  lock
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recursion King
                </h3>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{ width: '70%' }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">70% Complete</p>
              </div>
              <button className="text-xs text-primary font-bold mt-auto pt-2 uppercase tracking-wide text-left">
                Continue
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1e2732] p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Learning Activity
            </h2>
            <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400 items-center">
              <span>Less</span>
              <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
              <div className="size-3 rounded-sm bg-blue-300"></div>
              <div className="size-3 rounded-sm bg-blue-500"></div>
              <div className="size-3 rounded-sm bg-blue-700"></div>
              <span>More</span>
            </div>
          </div>
          <div className="w-full overflow-x-auto pb-2">
            <div className="flex flex-col gap-1 min-w-[600px]">
              <div className="flex gap-1 mb-1">
                <span className="w-8 text-xs text-slate-400">Mon</span>
                <div className="flex gap-1 flex-1">
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                </div>
              </div>
              <div className="flex gap-1 mb-1">
                <span className="w-8 text-xs text-slate-400">Wed</span>
                <div className="flex gap-1 flex-1">
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                </div>
              </div>
              <div className="flex gap-1 mb-1">
                <span className="w-8 text-xs text-slate-400">Fri</span>
                <div className="flex gap-1 flex-1">
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <div className="size-3 rounded-sm bg-blue-500"></div>
                  <div className="size-3 rounded-sm bg-blue-700"></div>
                  <div className="size-3 rounded-sm bg-blue-300"></div>
                  <div className="size-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total: 452 contributions this year</span>
            <span>Longest streak: 12 days</span>
          </div>
        </div>
      </div>
      <ProfileShareModal
        isOpen={isShareOpen}
        link={profileShareLink}
        onClose={() => setIsShareOpen(false)}
      />
    </Layout>
  )
}

export default Profile
