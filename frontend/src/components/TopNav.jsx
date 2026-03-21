import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { clearMeCache, writeMeCache } from '../lib/authMeCache.js'
import supabase from '../lib/supabase'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'

const NAV_ITEMS = [
  { to: '/dash', label: 'DASHBOARD' },
  { to: '/learn', label: 'LEARN' },
  { to: '/quiz', label: 'QUIZ' },
  { to: '/profile', label: 'PROFILE' },
]

function TopNav() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const apiBaseUrl = getApiBaseUrl()

  useEffect(() => {
    let isMounted = true
    const checkAuth = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, { credentials: 'include' })
        if (!isMounted) return
        if (response.ok) {
          const data = await response.json().catch(() => ({}))
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
    return () => { isMounted = false }
  }, [apiBaseUrl])

  const handleLogout = async () => {
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
        .topnav-link {
          color: rgba(100, 255, 255, 0.4);
        }
        .topnav-link.active {
          color: #00FFFF;
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

      <header className="sticky top-0 z-50 w-full pt-3 pb-2 px-4 sm:px-6 bg-[#0d1117]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto topnav-bar flex items-center justify-between gap-4 h-14 px-4 sm:px-6">
          {/* Left: Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="Home"
          >
            <span className="topnav-core-tag px-2 py-1 text-[10px] sm:text-xs font-semibold tracking-wider uppercase rounded">
              CORE
            </span>
            <span className="topnav-brand text-sm sm:text-base font-bold tracking-widest uppercase">
              CSARENA
            </span>
          </Link>

          {/* Center: Glass pill nav (hide completely when not authenticated) */}
          {isAuthed ? (
            <nav className="topnav-pill flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 shrink-0">
              {NAV_ITEMS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/dash'}
                  className={({ isActive: navActive }) =>
                    `topnav-link relative px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium tracking-wider uppercase transition-colors duration-200 ${
                      navActive ? 'active' : 'hover:text-[rgba(100,255,255,0.7)]'
                    }`
                  }
                >
                  {label}
                  <span
                    className="topnav-cursor absolute left-2 right-2 sm:left-3 sm:right-3 bottom-0 h-0.5 bg-[#00FFFF] rounded-full opacity-0 transition-opacity duration-200"
                    aria-hidden
                  />
                </NavLink>
              ))}
            </nav>
          ) : (
            <div className="shrink-0" />
          )}

          {/* Right: Logout / Login */}
          <div className="flex items-center shrink-0">
            {isAuthed ? (
              <button
                type="button"
                onClick={handleLogout}
                className="topnav-logout-btn px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-200"
              >
                LOGOUT
              </button>
            ) : !isLoading ? (
              <Link
                to="/signup"
                className="topnav-logout-btn px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-200 inline-block"
              >
                LOGIN / REGISTER
              </Link>
            ) : null}
          </div>
        </div>
      </header>
    </>
  )
}

export default TopNav
