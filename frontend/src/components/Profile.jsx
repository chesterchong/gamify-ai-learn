import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ProfileShareModal from './ProfileShareModal.jsx'
import TermsThemeStyles from './TermsThemeStyles'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'

const XP_MILESTONE = 500

function Profile() {
  const location = useLocation()
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courseStats, setCourseStats] = useState({ completed: 0, total: 0 })
  const apiBaseUrl = getApiBaseUrl()

  const loadUser = useCallback(
    async (opts = { silent: false }) => {
      if (!opts.silent) setLoading(true)
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          credentials: 'include',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await response.json()
        setUser(data.user)
        setError('')
      } catch (err) {
        setError(err.message || 'Failed to load profile data')
      } finally {
        if (!opts.silent) setLoading(false)
      }
    },
    [apiBaseUrl],
  )

  useEffect(() => {
    loadUser({ silent: false })
  }, [loadUser, location.pathname, location.key])

  useEffect(() => {
    const onFocus = () => loadUser({ silent: true })
    const onVis = () => {
      if (document.visibilityState === 'visible') loadUser({ silent: true })
    }
    const onXp = () => loadUser({ silent: true })
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('gamify-xp-updated', onXp)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('gamify-xp-updated', onXp)
    }
  }, [loadUser])

  // Fetch course progress to power "Modules Done" card
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/learning/courses`, {
          credentials: 'include',
        })
        if (!response.ok) return
        const data = await response.json()
        const total = data.length || 0
        const completed = data.filter((c) => c.status === 'completed').length
        setCourseStats({ completed, total })
      } catch {
        // Silently ignore; keep defaults if learning data is unavailable
      }
    }

    fetchCourses()
  }, [apiBaseUrl])

  // Generate profile share link from username or email
  const profileShareLink = user?.username 
    ? `sample.com/u/${user.username}` 
    : user?.email 
    ? `sample.com/u/${user.email.split('@')[0]}` 
    : 'sample.com/u/user'

  const currentXP = Number(user?.xp ?? 0)
  const nextMilestone =
    currentXP <= 0 ? XP_MILESTONE : Math.ceil((currentXP + 1) / XP_MILESTONE) * XP_MILESTONE
  const xpProgress = Math.min(100, (currentXP / nextMilestone) * 100)
  const xpToNextMilestone = Math.max(0, nextMilestone - currentXP)

  const modulesDone = courseStats.completed
  const totalModules = courseStats.total || modulesDone || 0

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
    <div className="selection:bg-primary selection:text-black">
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
      `}</style>
      <section className="relative w-full glass-deep border-b border-slate-800/50 pt-10 pb-20">
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
              <p className="text-slate-400 text-lg font-medium mb-6">
                {user.professionalRole === 'admin' ? 'Admin' : 'Student'}
              </p>
            )}
            <div className="w-full max-w-lg mb-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-400">
                  Mastery Progress
                  <span className="relative inline-flex group/xphelp">
                    <button
                      type="button"
                      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-slate-500/55 bg-slate-800/80 px-1 text-[11px] font-bold leading-none text-slate-400 hover:border-primary/45 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-help"
                      aria-label="How XP works"
                      aria-describedby="profile-xp-rules-tooltip"
                    >
                      ?
                    </button>
                    <span
                      id="profile-xp-rules-tooltip"
                      role="tooltip"
                      className="pointer-events-none invisible absolute left-0 top-full z-30 mt-2 w-[min(19rem,calc(100vw-2.5rem))] origin-top-left scale-95 opacity-0 transition-[opacity,transform,visibility] duration-150 group-hover/xphelp:visible group-hover/xphelp:scale-100 group-hover/xphelp:opacity-100 group-focus-within/xphelp:visible group-focus-within/xphelp:scale-100 group-focus-within/xphelp:opacity-100 rounded-lg border border-slate-600/90 bg-slate-950/95 px-3 py-2.5 text-left text-[11px] leading-snug text-slate-200 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.75)] backdrop-blur-md sm:left-1/2 sm:-translate-x-1/2"
                    >
                      <span className="block font-bold text-slate-100 mb-1.5">XP rules</span>
                      <span className="block text-slate-300">
                        Perfect score on an AI quiz (every question correct) adds{' '}
                        <span className="font-semibold text-amber-200/95">+100 XP</span>. Each
                        qualifying attempt counts separately.
                      </span>
                      <span className="block mt-2 text-slate-400 border-t border-slate-700/80 pt-2">
                        The bar shows progress toward your next{' '}
                        <span className="text-slate-300 font-medium">{XP_MILESTONE.toLocaleString()} XP</span>{' '}
                        milestone.
                      </span>
                    </span>
                  </span>
                </span>
                <span className="text-lg font-bold tabular-nums text-white">
                  {currentXP.toLocaleString()}{' '}
                  <span className="text-sm font-semibold text-slate-400">total XP</span>
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>
                  Next milestone: {nextMilestone.toLocaleString()} XP
                </span>
                <span className="tabular-nums">
                  {currentXP.toLocaleString()} / {nextMilestone.toLocaleString()}
                </span>
              </div>
              <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="progress-bar-fill h-full rounded-full relative overflow-hidden transition-[width] duration-300"
                  style={{ width: `${xpProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              {xpToNextMilestone > 0 && (
                <p className="text-xs text-slate-500 mt-2 text-right">
                  {xpToNextMilestone.toLocaleString()} XP until next milestone
                  {typeof user.level === 'number' ? ` · Level ${user.level}` : ''}
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
      <div className="max-w-6xl mx-auto w-full px-6 md:px-12 lg:px-16 -mt-12 mb-6 pb-4 relative z-10 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Streak */}
          <div className="relative overflow-hidden rounded-xl glass-card border border-slate-700/50 p-6 transition-all duration-200 hover:border-orange-500/40 hover:shadow-[0_0_24px_-4px_rgba(249,115,22,0.15)]">
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
          <div className="relative overflow-hidden rounded-xl glass-card border border-slate-700/50 p-6 transition-all duration-200 hover:border-violet-500/40 hover:shadow-[0_0_24px_-4px_rgba(139,92,246,0.15)]">
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
          <div className="relative overflow-hidden rounded-xl glass-card border border-slate-700/50 p-6 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.15)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-600" />
            <div className="flex items-start justify-between gap-3 pl-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Modules Done
                </p>
                <p className="text-3xl font-bold tabular-nums text-white">
                  {modulesDone}
                  <span className="text-xl font-medium text-slate-400">
                    {totalModules ? ` / ${totalModules}` : ''}
                  </span>
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
        <div className="rounded-xl glass-card border border-slate-700/50 p-6">
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
          <div className="flex flex-wrap justify-between gap-2 mt-3 pt-3 border-t border-slate-700/80 text-xs text-slate-500">
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
