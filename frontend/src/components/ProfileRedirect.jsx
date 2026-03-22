import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiBaseUrl } from '../lib/apiBaseUrl.js'
import { fetchMe } from '../lib/fetchMe.js'

/**
 * Canonical profile URLs are /profile/:username. /profile alone redirects using the session user.
 */
function ProfileRedirect() {
  const navigate = useNavigate()
  const apiBaseUrl = getApiBaseUrl()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { ok, data } = await fetchMe(apiBaseUrl)
        if (cancelled) return
        const u = data?.user?.username?.trim()
        if (ok && u) {
          navigate(`/profile/${encodeURIComponent(u)}`, { replace: true })
          return
        }
        navigate('/profile/edit', { replace: true })
      } catch {
        if (!cancelled) navigate('/profile/edit', { replace: true })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [apiBaseUrl, navigate])

  return (
    <div className="bg-background-dark selection:bg-primary selection:text-black min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        <p className="text-slate-400">Loading profile…</p>
      </div>
    </div>
  )
}

export default ProfileRedirect
