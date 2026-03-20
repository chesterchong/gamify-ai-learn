const ME_CACHE_KEY = 'csarena_me'

/**
 * Cached fields from GET /api/auth/me so Quiz (and others) can read admin synchronously on first paint.
 */
export function readMeCache() {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(ME_CACHE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw)
    if (!o || typeof o !== 'object') return null
    return {
      role: o.role,
      professionalRole: o.professionalRole,
    }
  } catch {
    return null
  }
}

export function writeMeCache(user) {
  if (typeof window === 'undefined' || !user) return
  try {
    sessionStorage.setItem(
      ME_CACHE_KEY,
      JSON.stringify({
        role: user.role,
        professionalRole: user.professionalRole,
      }),
    )
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearMeCache() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(ME_CACHE_KEY)
  } catch {
    /* ignore */
  }
}
