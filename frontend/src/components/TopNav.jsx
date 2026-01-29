import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

function TopNav() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | authenticated | unauthenticated
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          credentials: 'include',
        })
        if (!isMounted) return
        setStatus(response.ok ? 'authenticated' : 'unauthenticated')
      } catch (error) {
        if (!isMounted) return
        setStatus('unauthenticated')
      }
    }

    checkAuth()
    return () => {
      isMounted = false
    }
  }, [apiBaseUrl])

  const handleLogout = async () => {
    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      // Ignore logout failures and still clear client state.
    } finally {
      await supabase.auth.signOut()
      navigate('/login', { replace: true })
    }
  }

  const isAuthed = status === 'authenticated'
  const isLoading = status === 'loading'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background-dark/95 backdrop-blur-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link className="flex items-center space-x-4 logo-lock" to="/">
          <div className="border border-primary px-1.5 py-0.5 text-xs text-primary font-bold">
            CORE
          </div>
          <span className="text-xl font-bold tracking-widest text-white uppercase">CSarena</span>
        </Link>

        {isAuthed ? (
          <div className="flex items-center space-x-8">
            <Link className="text-xs uppercase tracking-widest hover:text-primary transition-colors" to="/dash">
              [Dashboard]
            </Link>
            <Link className="text-xs uppercase tracking-widest hover:text-primary transition-colors" to="/learn">
              [Learn]
            </Link>
            <Link className="text-xs uppercase tracking-widest hover:text-primary transition-colors" to="/quiz">
              [Quiz]
            </Link>
            <Link className="text-xs uppercase tracking-widest hover:text-primary transition-colors" to="/profile">
              [Profile]
            </Link>
            <button
              className="border border-primary text-primary px-4 py-2 text-xs font-bold hover:bg-primary hover:text-black transition-all"
              onClick={handleLogout}
              type="button"
            >
              LOGOUT
            </button>
          </div>
        ) : isLoading ? (
          // Prevent a "LOGIN/REGISTER" flash while auth state loads.
          <div className="flex items-center space-x-8 opacity-0 pointer-events-none select-none">
            <span className="text-xs uppercase tracking-widest">[Dashboard]</span>
            <span className="text-xs uppercase tracking-widest">[Learn]</span>
            <span className="text-xs uppercase tracking-widest">[Quiz]</span>
            <span className="text-xs uppercase tracking-widest">[Profile]</span>
            <span className="border border-primary px-4 py-2 text-xs font-bold">LOGOUT</span>
          </div>
        ) : (
          <div className="flex items-center">
            <Link
              className="border border-primary text-primary px-4 py-2 text-xs font-bold hover:bg-primary hover:text-black transition-all"
              to="/signup"
            >
              LOGIN/REGISTER
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default TopNav

