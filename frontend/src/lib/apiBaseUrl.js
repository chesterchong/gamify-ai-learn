/**
 * Express API origin (no trailing slash).
 *
 * Local dev: VITE_API_URL or http://localhost:4000.
 *
 * Production: Prefer same origin + /api rewrite (see frontend/vercel.json) so session cookies
 * stay first-party. Leave VITE_API_URL unset on Vercel in that setup (falls back to
 * window.location.origin). Pointing VITE_API_URL at another host (e.g. *-backend.vercel.app)
 * while the SPA is on a different subdomain often breaks email login in the browser.
 */
export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    let base = fromEnv.trim().replace(/\/+$/, '')
    if (base.endsWith('/api')) base = base.slice(0, -4)
    return base
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:4000'
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

let crossOriginWarned = false

/** Warn once if production build targets a different host than the page (cookie auth often fails). */
export function warnIfCrossOriginApiInProd() {
  if (crossOriginWarned) return
  crossOriginWarned = true
  if (typeof window === 'undefined' || !import.meta.env.PROD) return
  const fromEnv = import.meta.env.VITE_API_URL
  if (typeof fromEnv !== 'string' || !fromEnv.trim()) return
  try {
    const base = fromEnv.trim().replace(/\/+$/, '').replace(/\/api$/, '')
    const u = new URL(base.startsWith('http') ? base : `https://${base}`)
    if (u.origin !== window.location.origin) {
      console.warn(
        '[CSarena] VITE_API_URL is a different site than this page; browsers often block session cookies. Remove VITE_API_URL on Vercel and use the /api rewrite in vercel.json (same-origin).',
      )
    }
  } catch {
    /* ignore */
  }
}
