import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import TermsThemeStyles from './TermsThemeStyles'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'
import { fetchMe } from '../lib/fetchMe.js'
import {
  MAX_ACCOUNT_LEVEL,
  getLevelProgressFromXp,
  getRankTierStyle,
  levelFromTotalXp,
  xpStepForLevelUp,
} from '../lib/accountLevel.js'

function formatAvgScorePercent(p) {
  if (p == null || Number.isNaN(Number(p))) return '—'
  const n = Number(p)
  return `${n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1)}%`
}

function activityCellTitle(dayLabel, count) {
  if (!dayLabel) return 'Activity unavailable'
  if (count <= 0) return `${dayLabel} · no AI quiz submissions`
  return `${dayLabel} · ${count} AI quiz submission${count === 1 ? '' : 's'}`
}

/** Heatmap uses inline colors so cells render without Tailwind CDN JIT missing dynamic `bg-primary/30`. */
const PROFILE_ACTIVITY_HEAT_BG = {
  0: 'rgb(51, 65, 85)',
  1: 'rgba(19, 127, 236, 0.35)',
  2: 'rgba(19, 127, 236, 0.65)',
  3: 'rgb(19, 127, 236)',
}

const HEAT_CELL_PX = 10
const HEAT_GAP_PX = 3

const HEATMAP_MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** Matches backend grid: column = week starting Sunday, rows Sun→Sat (UTC). */
const HEATMAP_WEEKDAY_ROWS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function firstDayLabelInHeatmapColumn(cells, weekIndex) {
  for (let r = 0; r < 7; r++) {
    const d = cells[weekIndex * 7 + r]?.dayLabel
    if (d) return d
  }
  return ''
}

/** Month ticks: first letter only, every 2nd month starting January (Jan, Mar, May, …). */
function buildHeatmapMonthTicks(cells, weekCount) {
  const ticks = []
  let prevMonth = -1
  for (let w = 0; w < weekCount; w++) {
    const dl = firstDayLabelInHeatmapColumn(cells, w)
    if (!dl || dl.length < 7) continue
    const m = parseInt(dl.slice(5, 7), 10)
    if (Number.isNaN(m) || m < 1 || m > 12) continue
    if (m === prevMonth) continue
    prevMonth = m
    if ((m - 1) % 2 !== 0) continue
    ticks.push({
      weekIndex: w,
      label: HEATMAP_MONTH_ABBR[m - 1].charAt(0),
    })
  }
  return ticks
}

/** 1-based index along x-axis; oldest week = 1 (GitHub-style left→right time). */
function buildHeatmapWeekIndexTicks(weekCount, step) {
  const ticks = []
  for (let w = 0; w < weekCount; w += step) {
    ticks.push({ weekIndex: w, label: String(w + 1) })
  }
  const last = weekCount - 1
  if (weekCount > 0 && (ticks.length === 0 || ticks[ticks.length - 1].weekIndex !== last)) {
    if (!ticks.some((t) => t.weekIndex === last)) {
      ticks.push({ weekIndex: last, label: String(weekCount) })
    }
  }
  return ticks
}

function Profile() {
  const location = useLocation()
  const [copyFeedback, setCopyFeedback] = useState('idle')
  const copyResetTimeoutRef = useRef(null)
  const meFetchGenRef = useRef(0)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courseStats, setCourseStats] = useState({ completed: 0, total: 0 })
  const [learningActivity, setLearningActivity] = useState(null)
  const apiBaseUrl = getApiBaseUrl()

  const loadUser = useCallback(
    async (opts = { silent: false }) => {
      const gen = ++meFetchGenRef.current
      if (!opts.silent) setLoading(true)
      try {
        const { ok, data } = await fetchMe(apiBaseUrl)

        if (!ok) {
          throw new Error('Failed to fetch user data')
        }
        if (gen !== meFetchGenRef.current) return
        setUser(data.user)
        setLearningActivity(data.learningActivity ?? null)
        setError('')
      } catch (err) {
        if (gen !== meFetchGenRef.current) return
        setError(err.message || 'Failed to load profile data')
      } finally {
        if (gen !== meFetchGenRef.current) return
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

  useEffect(
    () => () => {
      if (copyResetTimeoutRef.current != null) {
        window.clearTimeout(copyResetTimeoutRef.current)
      }
    },
    [],
  )

  const copyProfileLink = useCallback(() => {
    const url = `${window.location.origin}/profile`
    const write = async () => {
      try {
        await navigator.clipboard.writeText(url)
        return true
      } catch {
        try {
          const ta = document.createElement('textarea')
          ta.value = url
          ta.setAttribute('readonly', '')
          ta.style.position = 'fixed'
          ta.style.left = '-9999px'
          document.body.appendChild(ta)
          ta.select()
          const ok = document.execCommand('copy')
          document.body.removeChild(ta)
          return ok
        } catch {
          return false
        }
      }
    }
    void (async () => {
      const ok = await write()
      setCopyFeedback(ok ? 'copied' : 'error')
      if (copyResetTimeoutRef.current != null) {
        window.clearTimeout(copyResetTimeoutRef.current)
      }
      copyResetTimeoutRef.current = window.setTimeout(() => {
        setCopyFeedback('idle')
        copyResetTimeoutRef.current = null
      }, 2000)
    })()
  }, [])

  const currentXP = Math.max(0, Math.floor(Number(user?.xp ?? 0)))
  const lvProg = getLevelProgressFromXp(currentXP)
  const displayLevel = levelFromTotalXp(currentXP)
  const tier = getRankTierStyle(displayLevel)
  const xpProgressPct = lvProg.progressToNext * 100
  const xpRemainingInBracket =
    lvProg.xpToNextLevel != null
      ? Math.max(0, lvProg.xpToNextLevel - lvProg.xpIntoLevel)
      : 0
  const nextStepXp = lvProg.xpToNextLevel

  const modulesDone = courseStats.completed
  const totalModules = courseStats.total || modulesDone || 0

  const heatmapLevels = Array.isArray(learningActivity?.levels)
    ? learningActivity.levels
    : null
  const heatmapCounts = Array.isArray(learningActivity?.counts)
    ? learningActivity.counts
    : null
  const heatmapDayLabels = Array.isArray(learningActivity?.dayLabels)
    ? learningActivity.dayLabels
    : null
  const heatmapWeeks =
    heatmapLevels &&
    heatmapLevels.length > 0 &&
    heatmapLevels.length % 7 === 0
      ? heatmapLevels.length / 7
      : Math.max(1, Number(learningActivity?.weekCount) || 52)
  const heatmapCellCount = heatmapWeeks * 7
  const heatmapCells =
    heatmapLevels && heatmapLevels.length === heatmapCellCount
      ? heatmapLevels.map((level, i) => ({
          level: Math.min(3, Math.max(0, Math.round(Number(level)) || 0)),
          count: Math.max(0, Math.round(Number(heatmapCounts?.[i]) || 0)),
          dayLabel: heatmapDayLabels?.[i] ?? '',
        }))
      : Array.from({ length: heatmapCellCount }, () => ({
          level: 0,
          count: 0,
          dayLabel: '',
        }))
  const activityHeatmapYear = learningActivity?.calendarYear ?? 2026
  const activityTotalInYear =
    learningActivity?.totalSubmissionsInYear ??
    learningActivity?.totalSubmissions365 ??
    0
  const activityLongestStreak = learningActivity?.longestStreakDays ?? 0

  const heatmapMonthTicks = buildHeatmapMonthTicks(heatmapCells, heatmapWeeks)
  const heatmapWeekIndexTicks = buildHeatmapWeekIndexTicks(heatmapWeeks, 4)
  const monthTickByWeek = new Map(heatmapMonthTicks.map((t) => [t.weekIndex, t.label]))
  const weekTickByWeek = new Map(heatmapWeekIndexTicks.map((t) => [t.weekIndex, t.label]))

  const heatmapRowTemplate = `${HEAT_CELL_PX}px repeat(7, ${HEAT_CELL_PX}px) ${HEAT_CELL_PX}px`

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
        @keyframes profile-tier-breathe {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.94; transform: scale(1.015); }
        }
        .profile-avatar-tier-ring {
          animation: profile-tier-breathe 4s ease-in-out infinite;
        }
        @keyframes profile-name-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .profile-display-name-tier {
          -webkit-text-fill-color: transparent;
        }
        .profile-display-name-tier--legend {
          animation: profile-name-shimmer 5.5s ease-in-out infinite alternate;
        }
      `}</style>
      <section className="relative w-full glass-deep border-b border-slate-800/50 pt-10 pb-20">
        <div className="relative max-w-6xl mx-auto w-full px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
          <div className="relative group">
            <div
              className="profile-avatar-tier-ring relative w-32 h-32 md:w-40 md:h-40 rounded-full p-[3px]"
              style={{
                background: tier.ringGradient,
                boxShadow: tier.outerGlow,
              }}
            >
              {user.profilePhotoUrl ? (
                <img
                  alt={`Profile picture of ${user.fullName || user.email}`}
                  className="h-full w-full rounded-full object-cover ring-2 ring-black/40"
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
              <div
                className={`flex h-full w-full items-center justify-center rounded-full bg-slate-800/95 ${
                  user.profilePhotoUrl ? 'hidden profile-photo-fallback' : ''
                }`}
              >
                <span className="material-symbols-outlined text-4xl md:text-5xl text-slate-400">
                  account_circle
                </span>
              </div>
            </div>
            <div
              className="absolute bottom-0 right-0 rounded-full border border-black/30 px-2 py-1 text-xs font-bold shadow-md"
              style={{ background: tier.lvlBg, color: tier.lvlText }}
            >
              LVL {displayLevel}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full min-w-0">
            <div className="mb-1 flex w-full flex-wrap items-center justify-center gap-3 md:justify-between md:gap-4">
              <div className="flex min-w-0 flex-wrap items-center justify-center gap-3 md:justify-start">
                <div className="flex min-w-0 max-w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-2 md:justify-start">
                  <h1
                    className={`profile-display-name-tier min-w-0 max-w-full break-words text-3xl font-bold tracking-tight md:text-4xl ${
                      displayLevel >= MAX_ACCOUNT_LEVEL
                        ? 'profile-display-name-tier--legend'
                        : ''
                    }`}
                    style={{
                      backgroundImage: tier.displayNameGradient,
                      backgroundSize:
                        displayLevel >= MAX_ACCOUNT_LEVEL ? '220% auto' : '100% 100%',
                      backgroundRepeat: 'no-repeat',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      filter: tier.displayNameFilter,
                    }}
                  >
                    {user.fullName || user.email?.split('@')[0] || 'User'}
                  </h1>
                </div>
                {user.username && (
                  <span className="inline-flex items-center gap-2">
                    {user.professionalRole === 'admin' && (
                      <span
                        className="inline-flex shrink-0 items-center"
                        title="Administrator account"
                        aria-label="Administrator account"
                      >
                        <span
                          className="material-symbols-outlined text-[22px] text-violet-300/95 sm:text-[24px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          aria-hidden
                        >
                          admin_panel_settings
                        </span>
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full border border-[rgba(64,64,64,0.85)] bg-[rgba(20,24,28,0.55)] px-3.5 py-1 font-mono text-[11px] font-semibold tracking-wide text-[rgba(0,255,255,0.88)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_18px_-6px_rgba(0,255,255,0.22)] backdrop-blur-md sm:text-xs">
                      {user.username}
                    </span>
                  </span>
                )}
              </div>
              <div
                className="flex shrink-0 items-center gap-1.5"
                role="group"
                aria-label="Profile actions"
              >
                <Link
                  to="/profile/edit"
                  title="Edit profile"
                  aria-label="Edit profile"
                  className="inline-flex size-10 items-center justify-center rounded-xl border border-[rgba(64,64,64,0.8)] bg-[rgba(20,24,28,0.6)] text-[rgba(100,255,255,0.4)] shadow-[0_0_12px_rgba(0,255,255,0.06)] backdrop-blur-sm transition-[color,border-color,box-shadow,opacity] duration-200 hover:border-[rgba(100,255,255,0.22)] hover:text-[rgba(100,255,255,0.7)] hover:shadow-[0_0_10px_rgba(0,255,255,0.12)] active:border-[rgba(0,255,255,0.35)] active:text-[#00FFFF] active:shadow-[0_0_8px_#00FFFF,0_0_12px_rgba(0,255,255,0.35)] active:opacity-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00FFFF]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c121c]"
                >
                  <span className="material-symbols-outlined text-[22px]" aria-hidden>
                    edit
                  </span>
                </Link>
                <button
                  type="button"
                  title="Copy profile link"
                  aria-label={
                    copyFeedback === 'copied'
                      ? 'Profile link copied'
                      : copyFeedback === 'error'
                        ? 'Could not copy link'
                        : 'Copy profile link'
                  }
                  onClick={copyProfileLink}
                  className={`inline-flex size-10 items-center justify-center rounded-xl border backdrop-blur-sm transition-[color,border-color,box-shadow,opacity] duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c121c] ${
                    copyFeedback === 'copied'
                      ? 'border-emerald-500/35 bg-[rgba(20,24,28,0.6)] text-emerald-400/90 shadow-[0_0_12px_rgba(16,185,129,0.12)] hover:border-emerald-400/50 hover:text-emerald-300 focus-visible:ring-emerald-400/40'
                      : copyFeedback === 'error'
                        ? 'border-red-500/35 bg-[rgba(20,24,28,0.6)] text-red-400/90 shadow-[0_0_12px_rgba(248,113,113,0.1)] hover:border-red-400/50 hover:text-red-300 focus-visible:ring-red-400/40'
                        : 'border-[rgba(64,64,64,0.8)] bg-[rgba(20,24,28,0.6)] text-[rgba(100,255,255,0.4)] shadow-[0_0_12px_rgba(0,255,255,0.06)] hover:border-[rgba(100,255,255,0.22)] hover:text-[rgba(100,255,255,0.7)] hover:shadow-[0_0_10px_rgba(0,255,255,0.12)] active:border-[rgba(0,255,255,0.35)] active:text-[#00FFFF] active:shadow-[0_0_8px_#00FFFF,0_0_12px_rgba(0,255,255,0.35)] active:opacity-100 focus-visible:ring-[#00FFFF]/45'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]" aria-hidden>
                    {copyFeedback === 'copied'
                      ? 'check'
                      : copyFeedback === 'error'
                        ? 'error'
                        : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>
            <span className="sr-only" aria-live="polite">
              {copyFeedback === 'copied'
                ? 'Profile link copied to clipboard.'
                : copyFeedback === 'error'
                  ? 'Copy failed.'
                  : ''}
            </span>
            <div className="w-full max-w-lg mb-6">
              <div className="flex justify-between items-center gap-2 text-xs text-slate-500 mb-2">
                <span>
                  {displayLevel >= MAX_ACCOUNT_LEVEL ? (
                    <>
                      Level {displayLevel} ·{' '}
                      <span className="font-semibold text-slate-300">{tier.name}</span>
                    </>
                  ) : (
                    <>
                      Level {displayLevel} ·{' '}
                      <span className="font-semibold text-slate-300">{tier.name}</span>
                      <span className="text-slate-600"> · </span>
                      <span className="text-slate-500">next: {displayLevel + 1}</span>
                    </>
                  )}
                </span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  {displayLevel >= MAX_ACCOUNT_LEVEL ? (
                    <span>{currentXP.toLocaleString()} XP</span>
                  ) : (
                    <span>
                      {lvProg.xpIntoLevel.toLocaleString()} /{' '}
                      {nextStepXp != null ? nextStepXp.toLocaleString() : '—'} XP
                    </span>
                  )}
                  <span className="relative inline-flex shrink-0 group/xphelp">
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
                      className="pointer-events-none invisible absolute right-0 top-full z-30 mt-2 w-[min(19rem,calc(100vw-2.5rem))] origin-top-right scale-95 opacity-0 transition-[opacity,transform,visibility] duration-150 group-hover/xphelp:visible group-hover/xphelp:scale-100 group-hover/xphelp:opacity-100 group-focus-within/xphelp:visible group-focus-within/xphelp:scale-100 group-focus-within/xphelp:opacity-100 rounded-lg border border-slate-600/90 bg-slate-950/95 px-3 py-2.5 text-left text-[11px] leading-snug text-slate-200 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.75)] backdrop-blur-md"
                    >
                      <span className="block font-bold text-slate-100 mb-1.5">XP rules</span>
                      <span className="block text-slate-300">
                        Perfect score on an AI quiz (every question correct) adds{' '}
                        <span className="font-semibold text-amber-200/95">+100 XP</span>. Each
                        qualifying attempt counts separately.
                      </span>
                      <span className="block mt-2 text-slate-400 border-t border-slate-700/80 pt-2">
                        {displayLevel >= MAX_ACCOUNT_LEVEL ? (
                          <>Max level {MAX_ACCOUNT_LEVEL} reached ({tier.name}).</>
                        ) : (
                          <>
                            Levels 1–{MAX_ACCOUNT_LEVEL}: each step doubles (500, 1k, 2k…). You need{' '}
                            <span className="text-slate-300 font-medium">
                              {xpStepForLevelUp(displayLevel).toLocaleString()} XP
                            </span>{' '}
                            in this bracket to reach level {displayLevel + 1}. Bar and ring colors match
                            your tier.
                          </>
                        )}
                      </span>
                    </span>
                  </span>
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-800/90 ring-1 ring-slate-700/80 overflow-hidden">
                <div
                  className="progress-bar-fill h-full rounded-full relative overflow-hidden transition-[width] duration-300"
                  style={{
                    width: `${xpProgressPct}%`,
                    background: tier.barGradient,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                >
                  <div className="absolute inset-0 bg-white/15 animate-pulse" />
                </div>
              </div>
              {displayLevel >= MAX_ACCOUNT_LEVEL ? (
                <p className="text-xs text-slate-500 mt-2 text-right">
                  Max level · {tier.name}
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-2 text-right">
                  {xpRemainingInBracket.toLocaleString()} XP until level {displayLevel + 1}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-6xl mx-auto w-full px-6 md:px-12 lg:px-16 -mt-12 mb-6 pb-4 relative z-10 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative overflow-hidden rounded-xl glass-card border border-slate-700/50 p-6 transition-all duration-200 hover:border-amber-500/40 hover:shadow-[0_0_24px_-4px_rgba(245,158,11,0.15)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-orange-600" />
            <div className="flex items-start justify-between gap-3 pl-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Avg score
                </p>
                <p className="text-3xl font-bold tabular-nums text-white">
                  {formatAvgScorePercent(user.avgScorePercent)}
                </p>
                <p className="text-xs text-slate-500 mt-1.5">
                  {Number(user.aiQuizAttempts) > 0
                    ? `Across ${user.aiQuizAttempts} AI quiz ${user.aiQuizAttempts === 1 ? 'attempt' : 'attempts'}`
                    : 'No AI quiz attempts yet'}
                </p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-400">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  percent
                </span>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl glass-card border border-slate-700/50 p-6 transition-all duration-200 hover:border-sky-500/40 hover:shadow-[0_0_24px_-4px_rgba(14,165,233,0.15)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-500 to-blue-600" />
            <div className="flex items-start justify-between gap-3 pl-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Lessons completed
                </p>
                <p className="text-3xl font-bold tabular-nums text-white">
                  {Math.max(0, Math.floor(Number(user.lessonsCompleted ?? 0)))}
                </p>
              </div>
              <div className="rounded-lg bg-sky-500/10 p-2.5 text-sky-400">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  menu_book
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
            <h2 className="text-lg font-bold text-white">Learning Activity</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Less</span>
              <div className="flex gap-0.5">
                <div
                  className="size-3 rounded-sm"
                  style={{ backgroundColor: PROFILE_ACTIVITY_HEAT_BG[0] }}
                  title="No submissions"
                />
                <div
                  className="size-3 rounded-sm"
                  style={{ backgroundColor: PROFILE_ACTIVITY_HEAT_BG[1] }}
                  title="Lower volume"
                />
                <div
                  className="size-3 rounded-sm"
                  style={{ backgroundColor: PROFILE_ACTIVITY_HEAT_BG[2] }}
                  title="Medium"
                />
                <div
                  className="size-3 rounded-sm"
                  style={{ backgroundColor: PROFILE_ACTIVITY_HEAT_BG[3] }}
                  title="Higher volume"
                />
              </div>
              <span>More</span>
            </div>
          </div>
          <div className="w-full overflow-x-auto pb-1">
            <div className="inline-block min-w-0">
              <div className="flex items-start gap-1">
                <div
                  className="grid shrink-0 w-9 pr-1 text-[10px] text-slate-500 text-right tabular-nums leading-none"
                  style={{
                    gridTemplateRows: heatmapRowTemplate,
                    rowGap: HEAT_GAP_PX,
                  }}
                  aria-hidden
                >
                  <div />
                  {HEATMAP_WEEKDAY_ROWS.map((d) => (
                    <div key={d} className="flex min-h-0 items-center justify-end">
                      {d}
                    </div>
                  ))}
                  <div />
                </div>
                <div
                  className="grid min-w-0"
                  style={{
                    gridTemplateColumns: `repeat(${heatmapWeeks}, ${HEAT_CELL_PX}px)`,
                    columnGap: HEAT_GAP_PX,
                    rowGap: HEAT_GAP_PX,
                    gridTemplateRows: heatmapRowTemplate,
                  }}
                  role="img"
                  aria-label={`AI quiz activity heatmap for ${activityHeatmapYear}: ${activityTotalInYear} submissions; longest daily streak in this year ${activityLongestStreak} days.`}
                >
                  {Array.from({ length: heatmapWeeks }, (_, w) => (
                    <div
                      key={`mh-${w}`}
                      className="flex min-h-0 min-w-0 items-center justify-center text-[10px] leading-none text-slate-500"
                      style={{ gridRow: 1, gridColumn: w + 1 }}
                    >
                      {monthTickByWeek.get(w) ?? ''}
                    </div>
                  ))}
                  {heatmapCells.map((cell, i) => {
                    const w = Math.floor(i / 7)
                    const r = i % 7
                    return (
                      <div
                        key={i}
                        className="min-h-0 min-w-0 rounded-[2px]"
                        style={{
                          gridRow: r + 2,
                          gridColumn: w + 1,
                          backgroundColor:
                            PROFILE_ACTIVITY_HEAT_BG[cell.level] ??
                            PROFILE_ACTIVITY_HEAT_BG[0],
                        }}
                        title={activityCellTitle(cell.dayLabel, cell.count)}
                        aria-hidden
                      />
                    )
                  })}
                  {Array.from({ length: heatmapWeeks }, (_, w) => (
                    <div
                      key={`wk-${w}`}
                      className="flex min-h-0 min-w-0 items-center justify-center text-[10px] leading-none text-slate-500 tabular-nums"
                      style={{ gridRow: 9, gridColumn: w + 1 }}
                    >
                      {weekTickByWeek.get(w) ?? ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-2 mt-3 pt-3 border-t border-slate-700/80 text-xs text-slate-500">
            <span>
              {activityTotalInYear.toLocaleString()} submission
              {activityTotalInYear === 1 ? '' : 's'} in {activityHeatmapYear} (UTC)
            </span>
            <span>
              Longest streak: {activityLongestStreak.toLocaleString()} day
              {activityLongestStreak === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
