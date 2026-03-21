import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PerfectScoreBadge from './PerfectScoreBadge.jsx'
import TermsThemeStyles from './TermsThemeStyles.jsx'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'

function formatAccuracy(p) {
  if (p == null || Number.isNaN(p)) return '—'
  return `${p % 1 === 0 ? String(Math.round(p)) : p.toFixed(1)}%`
}

function LeaderboardAvatar({ photoUrl, isCurrentUser }) {
  const [failed, setFailed] = useState(false)
  const showImg = Boolean(photoUrl && !failed)
  return (
    <div
      className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-800 ring-2 ${
        isCurrentUser ? 'ring-primary/55' : 'ring-slate-600/55'
      }`}
    >
      {showImg ? (
        <img
          src={photoUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center" aria-hidden>
          <span className="material-symbols-outlined text-[18px] text-slate-500">person</span>
        </div>
      )}
    </div>
  )
}

/** Podium medals for leaderboard top 3 (filled military_tech + tier glow). */
function LeaderboardMedal({ rank }) {
  if (rank === 1) {
    return (
      <span
        className="dash-medal dash-medal--gold inline-flex items-center justify-center w-9 h-9 rounded-full bg-amber-500/10 border border-amber-400/35 shadow-[0_0_20px_-6px_rgba(251,191,36,0.65)]"
        aria-label="1st place"
      >
        <span
          className="material-symbols-outlined text-[22px] text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.45)]"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden
        >
          military_tech
        </span>
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span
        className="dash-medal dash-medal--silver inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-400/10 border border-slate-300/30 shadow-[0_0_16px_-6px_rgba(226,232,240,0.35)]"
        aria-label="2nd place"
      >
        <span
          className="material-symbols-outlined text-[22px] text-slate-200 drop-shadow-[0_0_8px_rgba(226,232,240,0.25)]"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden
        >
          military_tech
        </span>
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span
        className="dash-medal dash-medal--bronze inline-flex items-center justify-center w-9 h-9 rounded-full bg-orange-600/15 border border-orange-500/35 shadow-[0_0_16px_-6px_rgba(234,88,12,0.4)]"
        aria-label="3rd place"
      >
        <span
          className="material-symbols-outlined text-[22px] text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.35)]"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden
        >
          military_tech
        </span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 text-sm font-bold tabular-nums text-slate-500">
      {rank}
    </span>
  )
}

const LEADERBOARD_TABS = [
  { id: 'xp', label: 'XP' },
  { id: 'accuracy', label: 'Accuracy rate' },
]

function Dashboard() {
  const apiBaseUrl = getApiBaseUrl()
  const [summary, setSummary] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [leaderboardTab, setLeaderboardTab] = useState('xp')
  const [loading, setLoading] = useState(true)
  const [boardRefreshing, setBoardRefreshing] = useState(false)
  const [error, setError] = useState('')

  const apiBaseUrlRef = useRef(apiBaseUrl)
  const isFirstBootstrapForApi = useRef(true)

  useEffect(() => {
    if (apiBaseUrlRef.current !== apiBaseUrl) {
      apiBaseUrlRef.current = apiBaseUrl
      isFirstBootstrapForApi.current = true
    }
  }, [apiBaseUrl])

  /** One round trip: summary + leaderboard; server RAM cache + Cache-Control for repeat visits. */
  useEffect(() => {
    let mounted = true
    const fullPageLoad = isFirstBootstrapForApi.current
    if (fullPageLoad) {
      setLoading(true)
    } else {
      setBoardRefreshing(true)
    }
    setError('')
    ;(async () => {
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/dashboard/bootstrap?tab=${encodeURIComponent(leaderboardTab)}`,
          { credentials: 'include' },
        )
        if (!mounted) return
        if (res.status === 401) {
          setError('signin')
          setSummary(null)
          setLeaderboard([])
          return
        }
        if (!res.ok) {
          setError('load')
          return
        }
        const data = await res.json()
        setSummary(data.summary ?? null)
        setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : [])
      } catch {
        if (mounted) setError('load')
      } finally {
        if (mounted) {
          setLoading(false)
          setBoardRefreshing(false)
          isFirstBootstrapForApi.current = false
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [apiBaseUrl, leaderboardTab])

  const perfectCount = summary?.perfectQuizzesCount ?? 0
  const accuracy = summary?.accuracyPercent
  const showAccuracyPerfect =
    typeof accuracy === 'number' &&
    accuracy >= 100 &&
    (summary?.quizzesCompleted ?? 0) > 0

  return (
    <div className="selection:bg-primary selection:text-black min-h-[min(100vh,100dvh)] relative">
      <TermsThemeStyles />
      <style>{`
        .dash-circuit-bg {
          background-image: radial-gradient(circle at 2px 2px, rgba(251, 191, 36, 0.04) 1px, transparent 0);
          background-size: 40px 40px;
        }
        .dash-glow-line {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            linear-gradient(90deg, transparent 49.5%, rgba(251, 191, 36, 0.025) 50%, transparent 50.5%),
            linear-gradient(0deg, transparent 49.5%, rgba(59, 130, 246, 0.03) 50%, transparent 50.5%);
          background-size: 100px 100px;
          animation: dash-grid-breathe 14s ease-in-out infinite;
        }
        .dash-ambient-wrap {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .dash-ambient {
          position: absolute;
          border-radius: 50%;
          filter: blur(72px);
        }
        .dash-ambient--a {
          width: min(52vw, 420px);
          height: min(52vw, 420px);
          top: -8%;
          right: -12%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.38) 0%, transparent 68%);
          animation: dash-orb-a 22s ease-in-out infinite;
        }
        .dash-ambient--b {
          width: min(48vw, 380px);
          height: min(48vw, 380px);
          bottom: 5%;
          left: -14%;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.22) 0%, transparent 70%);
          animation: dash-orb-b 26s ease-in-out infinite;
        }
        .dash-ambient--c {
          width: min(36vw, 280px);
          height: min(36vw, 280px);
          top: 42%;
          left: 35%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 72%);
          animation: dash-orb-c 18s ease-in-out infinite;
        }
        @keyframes dash-grid-breathe {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.95; }
        }
        @keyframes dash-orb-a {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.32; }
          40% { transform: translate(-4vw, 6vh) scale(1.06); opacity: 0.48; }
          70% { transform: translate(2vw, 2vh) scale(0.96); opacity: 0.38; }
        }
        @keyframes dash-orb-b {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.28; }
          45% { transform: translate(5vw, -4vh) scale(1.1); opacity: 0.42; }
          75% { transform: translate(-2vw, 3vh) scale(0.94); opacity: 0.34; }
        }
        @keyframes dash-orb-c {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.35; }
        }
        .dash-stat-glow {
          animation: dash-stat-pulse-violet 6s ease-in-out infinite;
        }
        .dash-stat-glow--emerald {
          animation-name: dash-stat-pulse-emerald;
          animation-delay: -2s;
        }
        .dash-stat-glow--sky {
          animation-name: dash-stat-pulse-sky;
          animation-delay: -4s;
        }
        .dash-stat-glow--amber {
          animation-name: dash-stat-pulse-amber;
          animation-delay: -1s;
        }
        @keyframes dash-stat-pulse-violet {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
          50% { box-shadow: 0 12px 40px -14px rgba(139, 92, 246, 0.22); }
        }
        @keyframes dash-stat-pulse-emerald {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
          50% { box-shadow: 0 12px 40px -14px rgba(52, 211, 153, 0.2); }
        }
        @keyframes dash-stat-pulse-sky {
          0%, 100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
          50% { box-shadow: 0 12px 40px -14px rgba(56, 189, 248, 0.18); }
        }
        @keyframes dash-stat-pulse-amber {
          0%, 100% {
            box-shadow: 0 0 28px -12px rgba(251, 191, 36, 0.2), 0 0 0 0 rgba(251, 191, 36, 0);
          }
          50% {
            box-shadow: 0 0 40px -10px rgba(251, 191, 36, 0.45), 0 0 60px -20px rgba(251, 191, 36, 0.15);
          }
        }
        .dash-leader-shell {
          animation: dash-leader-halo 8s ease-in-out infinite;
        }
        @keyframes dash-leader-halo {
          0%, 100% { box-shadow: 0 0 0 0 rgba(148, 163, 184, 0); }
          50% { box-shadow: 0 0 36px -12px rgba(148, 163, 184, 0.12); }
        }
        .dash-section-title {
          animation: dash-title-shimmer 10s ease-in-out infinite;
          background: linear-gradient(
            90deg,
            rgb(100, 116, 139) 0%,
            rgb(148, 163, 184) 45%,
            rgb(100, 116, 139) 90%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        @keyframes dash-title-shimmer {
          0%, 100% { background-position: 100% 50%; }
          50% { background-position: 0% 50%; }
        }
        .dash-medal {
          animation: dash-medal-pulse 3.2s ease-in-out infinite;
        }
        .dash-medal--silver { animation-delay: -0.8s; }
        .dash-medal--bronze { animation-delay: -1.6s; }
        @keyframes dash-medal-pulse {
          0%, 100% { filter: brightness(1); transform: scale(1); }
          50% { filter: brightness(1.12); transform: scale(1.04); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dash-glow-line,
          .dash-ambient--a,
          .dash-ambient--b,
          .dash-ambient--c,
          .dash-stat-glow,
          .dash-stat-glow--emerald,
          .dash-stat-glow--sky,
          .dash-stat-glow--amber,
          .dash-leader-shell,
          .dash-section-title,
          .dash-medal {
            animation: none !important;
          }
          .dash-section-title {
            background: none;
            -webkit-background-clip: unset;
            background-clip: unset;
            color: rgb(100, 116, 139);
          }
        }
      `}</style>
      <div className="dash-ambient-wrap" aria-hidden="true">
        <div className="dash-ambient dash-ambient--a" />
        <div className="dash-ambient dash-ambient--b" />
        <div className="dash-ambient dash-ambient--c" />
      </div>
      <div className="dash-glow-line" aria-hidden="true" />
      <div className="dash-circuit-bg relative z-[1] isolate">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 pb-24">
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading your dashboard…</p>
            </div>
          )}

          {!loading && error === 'signin' && (
            <div className="rounded-2xl border border-dashed border-slate-600/50 bg-slate-900/20 p-8 text-center">
              <p className="text-slate-300 mb-4">Sign in to view your dashboard.</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Go to home
              </Link>
            </div>
          )}

          {!loading && error === 'load' && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center text-red-300 text-sm">
              Could not load dashboard. Try refreshing the page.
            </div>
          )}

          {!loading && !error && summary && (
            <>
            <section aria-labelledby="dash-stats-heading" className="mb-12">
              <h2
                id="dash-stats-heading"
                className="dash-section-title text-xs font-bold uppercase tracking-widest mb-4"
              >
                Your progress
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="dash-stat-glow rounded-2xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-sm p-5 relative overflow-hidden group hover:border-violet-500/35 transition-colors">
                  <div className="absolute -right-2 -top-2 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
                    <span className="material-symbols-outlined text-7xl text-violet-400">quiz</span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Quizzes completed
                  </p>
                  <p
                    className="text-3xl font-bold tabular-nums text-white"
                    title="Number of AI quiz attempts you have submitted"
                  >
                    {summary.quizzesCompleted ?? 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">AI quiz submissions</p>
                  {perfectCount > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <PerfectScoreBadge
                        label={String(perfectCount)}
                        className="text-[10px] px-2 py-1"
                        iconSizeClass="text-[15px]"
                        title="Distinct AI quizzes where you’ve scored 100% at least once"
                      />
                      <span className="text-[11px] text-amber-200/75 font-medium">
                        {perfectCount === 1 ? 'quiz maxed' : 'quizzes maxed'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="dash-stat-glow dash-stat-glow--emerald rounded-2xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-sm p-5 relative overflow-hidden group hover:border-emerald-500/35 transition-colors">
                  <div className="absolute -right-2 -top-2 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
                    <span className="material-symbols-outlined text-7xl text-emerald-400">
                      menu_book
                    </span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Lessons completed
                  </p>
                  <p className="text-3xl font-bold tabular-nums text-white">
                    {summary.lessonsCompleted ?? 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Marked complete on the learning path</p>
                </div>
                <div
                  className={`dash-stat-glow rounded-2xl border bg-slate-900/40 backdrop-blur-sm p-5 relative overflow-hidden group transition-colors ${
                    showAccuracyPerfect
                      ? 'dash-stat-glow--amber border-amber-500/35 shadow-[0_0_28px_-12px_rgba(251,191,36,0.25)] hover:border-amber-400/45'
                      : 'dash-stat-glow--sky border-slate-700/60 hover:border-sky-500/35'
                  }`}
                >
                  <div className="absolute -right-2 -top-2 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
                    <span
                      className={`material-symbols-outlined text-7xl ${showAccuracyPerfect ? 'text-amber-400/90' : 'text-sky-400'}`}
                    >
                      target
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Accuracy rate
                    </p>
                    {showAccuracyPerfect && (
                      <PerfectScoreBadge
                        className="scale-95 origin-top-right"
                        title="Your average across all quiz attempts is 100%"
                      />
                    )}
                  </div>
                  <p
                    className="text-3xl font-bold tabular-nums text-white"
                    title="Average score across all AI quiz attempts (score ÷ questions per attempt)"
                  >
                    {formatAccuracy(summary.accuracyPercent)}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Avg. across {summary.quizzesCompleted > 0 ? 'your' : 'no'} quiz attempts
                  </p>
                </div>
              </div>
            </section>

            <section aria-labelledby="dash-leader-heading">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <h2
                  id="dash-leader-heading"
                  className="dash-section-title text-xs font-bold uppercase tracking-widest"
                >
                  Top 10 rankings
                </h2>
                <div
                  role="tablist"
                  aria-label="Leaderboard category"
                  className="flex flex-wrap gap-1 rounded-xl border border-slate-700/60 bg-slate-900/35 p-1 backdrop-blur-sm shadow-inner shadow-black/20"
                >
                  {LEADERBOARD_TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={leaderboardTab === t.id}
                      id={`dash-lb-tab-${t.id}`}
                      aria-controls="dash-lb-panel"
                      onClick={() => setLeaderboardTab(t.id)}
                      className={`rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                        leaderboardTab === t.id
                          ? 'bg-slate-100/10 text-white shadow-sm ring-1 ring-white/10'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div
                id="dash-lb-panel"
                role="tabpanel"
                aria-labelledby={`dash-lb-tab-${leaderboardTab}`}
                className="dash-leader-shell relative rounded-2xl border border-slate-700/60 bg-slate-900/30 overflow-hidden"
              >
                {boardRefreshing && (
                  <div
                    className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px]"
                    aria-hidden
                  >
                    <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
                {leaderboard.length === 0 ? (
                  <p className="p-8 text-center text-sm text-slate-500">
                    {leaderboardTab === 'xp' && (
                      <>No learners yet. Earn XP from quizzes and lessons to appear here.</>
                    )}
                    {leaderboardTab === 'accuracy' && (
                      <>No quiz attempts yet. Submit an AI quiz to build accuracy rankings.</>
                    )}
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-800/80">
                    {leaderboard.map((row) => (
                      <li
                        key={row.userId}
                        className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 transition-colors ${
                          row.isCurrentUser
                            ? 'bg-primary/10 border-l-2 border-l-primary'
                            : 'hover:bg-slate-800/30'
                        } ${
                          row.rank === 1
                            ? 'bg-gradient-to-r from-amber-500/[0.06] to-transparent'
                            : row.rank === 2
                              ? 'bg-gradient-to-r from-slate-400/[0.05] to-transparent'
                              : row.rank === 3
                                ? 'bg-gradient-to-r from-orange-600/[0.07] to-transparent'
                                : ''
                        }`}
                      >
                        <div className="flex w-10 shrink-0 items-center justify-center">
                          <LeaderboardMedal rank={row.rank} />
                        </div>
                        <LeaderboardAvatar
                          photoUrl={row.profilePhotoUrl}
                          isCurrentUser={row.isCurrentUser}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {row.displayName}
                            {row.isCurrentUser && (
                              <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-primary">
                                You
                              </span>
                            )}
                          </p>
                        </div>
                        {leaderboardTab === 'xp' && (
                          <span className="shrink-0 text-sm font-bold tabular-nums text-slate-200">
                            {row.xp.toLocaleString()}{' '}
                            <span className="text-xs font-medium text-slate-500">XP</span>
                          </span>
                        )}
                        {leaderboardTab === 'accuracy' && (
                          <div className="shrink-0 text-right">
                            <span className="text-sm font-bold tabular-nums text-slate-200">
                              {formatAccuracy(row.accuracyPercent)}
                            </span>
                            {row.quizSubmissions > 0 && (
                              <p className="mt-0.5 text-[10px] text-slate-500">
                                {row.quizSubmissions}{' '}
                                {row.quizSubmissions === 1 ? 'attempt' : 'attempts'}
                              </p>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
