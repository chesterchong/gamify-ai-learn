/**
 * Short-TTL in-memory cache for leaderboard payloads shared across users.
 * `isCurrentUser` is applied per request; only neutral row data is stored.
 */

const TTL_MS = Math.max(
  3000,
  Number.parseInt(String(process.env.LEADERBOARD_CACHE_TTL_MS || '25000'), 10) || 25000,
)

/** @type {Map<string, { expires: number, rows: object[] }>} */
const store = new Map()

export function leaderboardCacheGet(tab) {
  const e = store.get(tab)
  if (!e || Date.now() >= e.expires) {
    if (e) store.delete(tab)
    return null
  }
  return e.rows
}

/**
 * @param {string} tab
 * @param {object[]} rows — leaderboard rows without `isCurrentUser`
 */
export function leaderboardCacheSet(tab, rows) {
  store.set(tab, { expires: Date.now() + TTL_MS, rows })
}
