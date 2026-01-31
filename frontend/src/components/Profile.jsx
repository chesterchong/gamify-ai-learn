import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProfileShareModal from './ProfileShareModal.jsx'
import TermsThemeStyles from './TermsThemeStyles'

function Profile() {
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await response.json()
        setUser(data.user)
      } catch (err) {
        setError(err.message || 'Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [apiBaseUrl])

  // Generate profile share link from username or email
  const profileShareLink = user?.username 
    ? `sample.com/u/${user.username}` 
    : user?.email 
    ? `sample.com/u/${user.email.split('@')[0]}` 
    : 'sample.com/u/user'

  // Calculate XP progress (example: 4500/5000 = 90%)
  const currentXP = user?.xp || 0
  const xpForNextLevel = 5000 // This could be calculated based on level
  const xpProgress = Math.min((currentXP / xpForNextLevel) * 100, 100)
  const xpNeeded = Math.max(xpForNextLevel - currentXP, 0)

  // Learning activity heatmap: 7 rows (e.g. days) × 52 columns (weeks). Each cell = 0–3 (intensity).
  // Replace with real contribution data from API when ready.
  const HEATMAP_ROWS = 7
  const HEATMAP_COLS = 52
  const activityHeatmap = Array.from(
    { length: HEATMAP_ROWS * HEATMAP_COLS },
    (_, i) => (i * 11 + 7) % 4
  )

  if (loading) {
    return (
      <div className="bg-background-dark selection:bg-primary selection:text-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-background-dark selection:bg-primary selection:text-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link to="/" className="text-primary hover:text-blue-400">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="bg-background-dark selection:bg-primary selection:text-black min-h-screen">
      <TermsThemeStyles />
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
        @keyframes achievementShine {
          0% { transform: translateX(-100%) skewX(-12deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(200%) skewX(-12deg); opacity: 0; }
        }
        .animate-achievement-shine {
          animation: achievementShine 0.7s ease-out forwards;
        }
      `}</style>
      <section className="relative w-full bg-[#0b111b] border-b border-slate-800 pt-10 pb-20">
        <div className="relative max-w-6xl mx-auto w-full px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
          <div className="relative group">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-[#162235] border-2 border-slate-600/80 ring-2 ring-primary/20">
              {user.profilePhotoUrl ? (
                <img
                  alt={`Profile picture of ${user.fullName || user.email}`}
                  className="w-full h-full rounded-full object-cover border-4 border-primary"
                  src={user.profilePhotoUrl}
                  onError={(e) => {
                    // Hide image and show fallback icon if image fails to load
                    e.target.style.display = 'none'
                    const fallback = e.target.parentElement.querySelector('.profile-photo-fallback')
                    if (fallback) {
                      fallback.classList.remove('hidden')
                    }
                  }}
                />
              ) : null}
              <div className={`w-full h-full rounded-full bg-slate-700 flex items-center justify-center ${user.profilePhotoUrl ? 'hidden profile-photo-fallback' : ''}`}>
                <span className="material-symbols-outlined text-4xl md:text-5xl text-slate-400">
                  account_circle
                </span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-white font-bold text-xs px-2 py-1 rounded-full border border-slate-600">
              LVL {user.level || 1}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                {user.fullName || user.email?.split('@')[0] || 'User'}
              </h1>
              {user.username && (
                <span className="bg-slate-700/60 text-slate-200 text-xs font-semibold px-3 py-1 rounded-full border border-slate-600">
                  @{user.username}
                </span>
              )}
            </div>
            {user.professionalRole && (
              <p className="text-slate-400 text-lg font-medium mb-6">{user.professionalRole}</p>
            )}
            <div className="w-full max-w-lg mb-6">
              <div className="flex justify-between text-sm font-medium text-slate-400 mb-2">
                <span>Mastery Progress</span>
                <span>{currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</span>
              </div>
              <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full relative overflow-hidden transition-[width] duration-300"
                  style={{ width: `${xpProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              {xpNeeded > 0 && (
                <p className="text-xs text-slate-500 mt-2 text-right">
                  {xpNeeded.toLocaleString()} XP to Level {user.level + 1}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                className="flex items-center gap-2 px-5 py-2 bg-slate-700/60 text-white rounded-lg font-bold text-sm hover:bg-slate-600/60 transition-colors border border-slate-600"
                to="/profile/edit"
              >
                <span className="material-symbols-outlined text-[20px]">
                  edit
                </span>
                Edit Profile
              </Link>
              <button
                className="flex items-center gap-2 px-5 py-2 bg-slate-700/60 text-white rounded-lg font-bold text-sm hover:bg-slate-600/60 transition-colors border border-slate-600"
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
          {/* Current Streak */}
          <div className="relative overflow-hidden rounded-xl border border-slate-700/80 bg-[#0f1623] p-6 transition-all duration-200 hover:border-orange-500/40 hover:shadow-[0_0_24px_-4px_rgba(249,115,22,0.15)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-amber-600" />
            <div className="flex items-start justify-between gap-3 pl-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Current Streak
                </p>
                <p className="text-3xl font-bold tabular-nums text-white">
                  {user.streakCount || 0}
                  <span className="ml-1 text-lg font-medium text-slate-400">
                    {user.streakCount === 1 ? 'day' : 'days'}
                  </span>
                </p>
              </div>
              <div className="rounded-lg bg-orange-500/10 p-2.5 text-orange-400">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
              </div>
            </div>
          </div>
          {/* Class Rank */}
          <div className="relative overflow-hidden rounded-xl border border-slate-700/80 bg-[#0f1623] p-6 transition-all duration-200 hover:border-violet-500/40 hover:shadow-[0_0_24px_-4px_rgba(139,92,246,0.15)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-purple-600" />
            <div className="flex items-start justify-between gap-3 pl-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Class Rank
                </p>
                <p className="text-3xl font-bold text-white">
                  Top 5<span className="text-xl font-semibold text-slate-400">%</span>
                </p>
              </div>
              <div className="rounded-lg bg-violet-500/10 p-2.5 text-violet-400">
                <span className="material-symbols-outlined text-2xl">
                  leaderboard
                </span>
              </div>
            </div>
          </div>
          {/* Modules Done */}
          <div className="relative overflow-hidden rounded-xl border border-slate-700/80 bg-[#0f1623] p-6 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.15)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-600" />
            <div className="flex items-start justify-between gap-3 pl-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Modules Done
                </p>
                <p className="text-3xl font-bold tabular-nums text-white">
                  12<span className="text-xl font-medium text-slate-400"> / 20</span>
                </p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400">
                <span className="material-symbols-outlined text-2xl">
                  library_books
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Recent Achievements */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Recent Achievements
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              className="group relative overflow-hidden rounded-xl border border-slate-700/80 bg-[#0f1623] p-4 transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_0_24px_-4px_rgba(59,130,246,0.35)] hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl" aria-hidden>
                <div className="absolute inset-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-12deg] opacity-0 group-hover:opacity-100 group-hover:animate-achievement-shine" />
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/70" />
              <div className="flex gap-3 pl-2 relative z-10">
                <div className="size-10 shrink-0 rounded-lg bg-primary/15 flex items-center justify-center text-blue-400">
                  <span className="material-symbols-outlined text-xl">terminal</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white truncate">CLI Master</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">Completed all Bash scripting challenges.</p>
                  <p className="text-[11px] text-slate-600 mt-2">Earned 2 days ago</p>
                </div>
              </div>
            </div>
            <div
              className="group relative overflow-hidden rounded-xl border border-slate-700/80 bg-[#0f1623] p-4 transition-all duration-300 hover:border-red-500/40 hover:shadow-[0_0_24px_-4px_rgba(239,68,68,0.35)] hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl" aria-hidden>
                <div className="absolute inset-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-12deg] opacity-0 group-hover:opacity-100 group-hover:animate-achievement-shine" />
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500" />
              <div className="flex gap-3 pl-2 relative z-10">
                <div className="size-10 shrink-0 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400">
                  <span className="material-symbols-outlined text-xl">bug_report</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white truncate">Bug Hunter</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">Fixed 50 syntax errors in the sandbox.</p>
                  <p className="text-[11px] text-slate-600 mt-2">Earned 5 days ago</p>
                </div>
              </div>
            </div>
            <div
              className="group relative overflow-hidden rounded-xl border border-slate-700/80 bg-[#0f1623] p-4 transition-all duration-300 hover:border-violet-500/40 hover:shadow-[0_0_24px_-4px_rgba(139,92,246,0.35)] hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl" aria-hidden>
                <div className="absolute inset-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-12deg] opacity-0 group-hover:opacity-100 group-hover:animate-achievement-shine" />
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-500" />
              <div className="flex gap-3 pl-2 relative z-10">
                <div className="size-10 shrink-0 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400">
                  <span className="material-symbols-outlined text-xl">database</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white truncate">SQL Ninja</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">Optimized 10 queries with indexes.</p>
                  <p className="text-[11px] text-slate-600 mt-2">Earned 1 week ago</p>
                </div>
              </div>
            </div>
            <Link
              to="/learn"
              className="group relative overflow-hidden rounded-xl border border-dashed border-slate-600 bg-[#0c131f] p-4 transition-all duration-300 hover:border-slate-500 hover:bg-[#0f1623] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_0_20px_-4px_rgba(100,116,139,0.2)]"
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl" aria-hidden>
                <div className="absolute inset-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-12deg] opacity-0 group-hover:opacity-100 group-hover:animate-achievement-shine" />
              </div>
              <div className="flex gap-3 relative z-10">
                <div className="size-10 shrink-0 rounded-lg bg-slate-700 flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white truncate">Recursion King</h3>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-[width]" style={{ width: '70%' }} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">70% complete</p>
                  <span className="inline-block text-xs font-semibold text-primary mt-2 uppercase tracking-wide">Continue</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700/80 bg-[#0f1623] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg font-bold text-white">
              Learning Activity
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Less</span>
              <div className="flex gap-0.5">
                <div className="size-3 rounded-sm bg-slate-700" title="0" />
                <div className="size-3 rounded-sm bg-primary/30" title="1" />
                <div className="size-3 rounded-sm bg-primary/60" title="2" />
                <div className="size-3 rounded-sm bg-primary" title="3+" />
              </div>
              <span>More</span>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <div className="inline-grid gap-[3px] min-w-0" style={{ gridTemplateColumns: 'repeat(52, 10px)', gridAutoRows: '10px' }}>
              {activityHeatmap.map((level, i) => (
                <div
                  key={i}
                  className={`size-[10px] rounded-[2px] ${level === 0 ? 'bg-slate-700' : level === 1 ? 'bg-primary/30' : level === 2 ? 'bg-primary/60' : 'bg-primary'}`}
                  title={level > 0 ? `${level} contribution(s)` : 'No activity'}
                  aria-hidden
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-2 mt-4 pt-4 border-t border-slate-700/80 text-xs text-slate-500">
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
    </div>
  )
}

export default Profile
