/**
 * Socratic hint highlight rules. Keep in sync with frontend/src/lib/socraticHighlightRules.js
 */

export const SOCRATIC_NOT_ENOUGH_CONTEXT = 'Not enough context'

function normalizeSocraticToken(token) {
  return String(token)
    .toLowerCase()
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')
}

/**
 * @param {string} trimmedSingleLine - whitespace-collapsed text
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function validateSocraticHighlight(trimmedSingleLine) {
  const text = String(trimmedSingleLine || '')
    .trim()
    .replace(/\s+/g, ' ')
  if (text.length < 2) {
    return { ok: false, error: SOCRATIC_NOT_ENOUGH_CONTEXT }
  }
  if (text.length > 500) {
    return { ok: false, error: 'highlightedText must be 2–500 characters' }
  }

  const rawWords = text.split(/\s+/).filter(Boolean)
  if (rawWords.length < 3) {
    return { ok: false, error: SOCRATIC_NOT_ENOUGH_CONTEXT }
  }

  const tokens = rawWords.map(normalizeSocraticToken).filter(Boolean)
  if (tokens.length < 3) {
    return { ok: false, error: SOCRATIC_NOT_ENOUGH_CONTEXT }
  }

  return { ok: true }
}
