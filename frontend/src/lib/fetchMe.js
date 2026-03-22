/** Single in-flight GET /api/auth/me so TopNav, ProtectedRoute, Profile don’t triple-fetch on load. */
let inFlight = null

export function fetchMe(apiBaseUrl) {
  if (!inFlight) {
    inFlight = fetch(`${apiBaseUrl}/api/auth/me`, {
      credentials: 'include',
      cache: 'no-store',
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        return { ok: res.ok, status: res.status, data }
      })
      .finally(() => {
        inFlight = null
      })
  }
  return inFlight
}
