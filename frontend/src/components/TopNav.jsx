import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { clearMeCache, writeMeCache } from '../lib/authMeCache.js'
import { fetchMe } from '../lib/fetchMe.js'
import supabase from '../lib/supabase'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'

const NAV_ITEMS = [
  { to: '/dash', label: 'Dashboard' },
  { to: '/learn', label: 'Learn' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/profile', label: 'Profile' },
]

function profileSectionActive(pathname) {
  if (pathname === '/profile') return true
  if (!pathname.startsWith('/profile/')) return false
  return !pathname.startsWith('/profile/edit')
}

function isNavItemActive(to, pathname) {
  if (to === '/profile') return profileSectionActive(pathname)
  if (to === '/dash') return pathname === '/dash' || pathname === '/dashboard'
  if (to === '/learn') return pathname.startsWith('/learn')
  if (to === '/quiz') return pathname.startsWith('/quiz')
  return pathname === to
}

function TopNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState('loading')
  const [menuOpen, setMenuOpen] = useState(false)
  const apiBaseUrl = getApiBaseUrl()

  useEffect(() => {
    let isMounted = true
    const checkAuth = async () => {
      try {
        const { ok, data } = await fetchMe(apiBaseUrl)
        if (!isMounted) return
        if (ok) {
          if (data.user) writeMeCache(data.user)
          setStatus('authenticated')
        } else {
          clearMeCache()
          setStatus('unauthenticated')
        }
      } catch {
        if (!isMounted) return
        clearMeCache()
        setStatus('unauthenticated')
      }
    }
    checkAuth()
    return () => {
      isMounted = false
    }
  }, [apiBaseUrl])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const handleLogout = async () => {
    setMenuOpen(false)
    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch (_) {}
    await supabase.auth.signOut()
    clearMeCache()
    setStatus('unauthenticated')
    navigate('/', { replace: true })
  }

  const isAuthed = status === 'authenticated'
  const isLoading = status === 'loading'

  const desktopNavClass = (_props, to) => {
    const active = isNavItemActive(to, location.pathname)
    return [
      'topnav-link relative px-2 py-2 text-[10px] font-medium uppercase tracking-wider transition-colors duration-200 sm:px-3 sm:text-xs',
      active
        ? 'active text-[#00FFFF]'
        : 'text-[rgba(100,255,255,0.45)] hover:text-[rgba(100,255,255,0.75)]',
    ].join(' ')
  }

  return (
    <>
      <style>{`
        .topnav-bar {
          font-family: 'Fira Code', 'Source Code Pro', 'Ubuntu Mono', 'IBM Plex Mono', monospace;
          background: rgba(30, 30, 30, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid #404040;
          border-radius: 9999px;
        }
        .topnav-pill {
          background: rgba(20, 24, 28, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(64, 64, 64, 0.8);
          border-radius: 9999px;
        }
        .topnav-core-tag {
          background: #101418;
          color: rgba(100, 255, 255, 0.5);
          border: 1px solid #404040;
        }
        .topnav-brand {
          color: rgba(200, 255, 255, 0.95);
        }
        .topnav-link.active .topnav-cursor {
          opacity: 1;
          box-shadow: 0 0 8px #00FFFF, 0 0 12px rgba(0, 255, 255, 0.5);
        }
        .topnav-logout-btn {
          color: rgba(200, 255, 255, 0.9);
          background: rgba(0, 255, 255, 0.08);
          border: 1px solid rgba(0, 255, 255, 0.25);
          box-shadow: 0 0 12px rgba(0, 255, 255, 0.15), inset 0 0 12px rgba(0, 255, 255, 0.05);
        }
        .topnav-logout-btn:hover {
          background: rgba(0, 255, 255, 0.12);
          box-shadow: 0 0 16px rgba(0, 255, 255, 0.25), inset 0 0 8px rgba(0, 255, 255, 0.08);
        }
      `}</style>

      <header className="sticky top-0 z-50 w-full border-b border-slate-800/40 bg-[#0d1117]/90 px-3 pt-2 pb-2 backdrop-blur-md sm:px-4 md:px-6">
        <div className="mx-auto flex max-w-6xl min-h-12 items-center sm:min-h-14 lg:px-2">
          <div className="topnav-bar flex w-full min-h-12 items-center justify-between gap-2 rounded-2xl px-3 py-2 sm:min-h-14 sm:rounded-full sm:gap-3 sm:px-4 md:px-6">
            <Link
              to="/"
              className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2"
              aria-label="Home"
            >
              <span className="topnav-core-tag shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider sm:px-2 sm:py-1 sm:text-[10px] md:text-xs">
                CORE
              </span>
              <span className="topnav-brand truncate text-xs font-bold uppercase tracking-wider sm:text-sm md:text-base">
                CSARENA
              </span>
            </Link>

            {isAuthed ? (
              <nav
                className="topnav-pill hidden flex-1 items-center justify-center gap-0.5 px-2 py-1 sm:gap-1 sm:px-3 sm:py-1.5 lg:flex"
                aria-label="Main"
              >
                {NAV_ITEMS.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/dash'}
                    className={(p) => desktopNavClass(p, to)}
                  >
                    {label}
                    <span
                      className="topnav-cursor absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#00FFFF] opacity-0 transition-opacity duration-200 sm:left-3 sm:right-3"
                      aria-hidden
                    />
                  </NavLink>
                ))}
              </nav>
            ) : (
              <div className="hidden flex-1 lg:block" aria-hidden />
            )}

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {isAuthed ? (
                <>
                  <button
                    type="button"
                    className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl border border-slate-600/80 text-slate-200 transition-colors hover:border-primary/40 hover:bg-white/5 hover:text-primary lg:hidden touch-manipulation"
                    aria-expanded={menuOpen}
                    aria-controls="topnav-mobile-menu"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    onClick={() => setMenuOpen((o) => !o)}
                  >
                    <span className="material-symbols-outlined text-[26px]" aria-hidden>
                      {menuOpen ? 'close' : 'menu'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="topnav-logout-btn hidden min-h-11 items-center rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 sm:text-xs lg:inline-flex"
                  >
                    Log out
                  </button>
                </>
              ) : !isLoading ? (
                <Link
                  to="/signup"
                  className="topnav-logout-btn inline-flex min-h-11 items-center justify-center rounded-full px-3 py-2 text-[9px] font-semibold uppercase tracking-wide transition-all duration-200 sm:px-4 sm:text-[10px] md:text-xs"
                >
                  Login / Register
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        {isAuthed && menuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm touch-manipulation"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <nav
              id="topnav-mobile-menu"
              className="absolute inset-x-0 bottom-0 top-16 flex flex-col gap-1 overflow-y-auto overscroll-contain border-t border-slate-800 bg-[#0a0e14] px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl sm:top-[4.5rem]"
              role="navigation"
              aria-label="Mobile main"
            >
              {NAV_ITEMS.map(({ to, label }) => {
                const active = isNavItemActive(to, location.pathname)
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/dash'}
                    onClick={() => setMenuOpen(false)}
                    className={[
                      'flex min-h-[48px] items-center rounded-xl px-4 text-base font-medium tracking-wide transition-colors touch-manipulation',
                      active
                        ? 'border border-primary/35 bg-primary/10 text-primary'
                        : 'border border-transparent text-slate-200 hover:bg-white/5',
                    ].join(' ')}
                  >
                    {label}
                  </NavLink>
                )
              })}
              <button
                type="button"
                onClick={handleLogout}
                className="topnav-logout-btn mt-4 min-h-[48px] w-full rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wider touch-manipulation"
              >
                Log out
              </button>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}

export default TopNav
