/**
 * Express API origin (no trailing slash).
 * - Local dev: defaults to http://localhost:4000 when VITE_API_URL is unset.
 * - Production: set VITE_API_URL at build time (e.g. Vercel → Environment Variables)
 *   to your deployed API, e.g. https://your-api.vercel.app — otherwise requests would
 *   incorrectly use localhost. If you proxy /api on the same host as the SPA, you can
 *   omit VITE_API_URL and this falls back to window.location.origin.
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
