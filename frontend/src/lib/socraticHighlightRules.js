/**
 * Socratic hint highlight rules. Keep in sync with backend/src/lib/socraticHighlightRules.js
 *
 * Meaningfulness algorithm (heuristic — approximates “enough conceptual signal” for hints):
 *
 * 1. **Bounds** — After trim and collapsing whitespace: length must be in [2, 500].
 * 2. **Word count** — At least 3 whitespace-separated words (discourages “a”, “is it”).
 * 3. **Token quality** — At least 3 non-empty tokens after stripping leading/trailing punctuation
 *    from each word.
 * 4. **Letter-bearing tokens** — At least 3 tokens that contain a Unicode letter (filters
 *    “1 2 3” or punctuation-only fragments).
 * 5. **Repetition spam** — If there are ≥3 letter-bearing tokens and they are all the same word,
 *    treat as meaningless (e.g. “foo foo foo”).
 * 6. **Content vs function words** — Build `contentTokens`: a token counts as content if either
 *    (a) length ≥ 5, or (b) length ≥ 2 and not in `FUNCTION_WORDS` (articles, pronouns, auxiliaries,
 *    common prepositions, quiz scaffolding like “following”, “ways”, number words one–five, etc.).
 * 7. **Content quorum** — Need at least 2 content tokens, OR exactly 1 content token with length ≥ 5
 *    (so a single strong term like “parallelization” plus fluff can pass, but “the a run” does not).
 */

export const SOCRATIC_NOT_ENOUGH_CONTEXT = 'Not enough context'

/** Common English function / scaffolding words (lowercase). Not a ban list — used only for density. */
const FUNCTION_WORDS = new Set(
  `
  a an the and or but nor if of at by for in on to from with without into onto upon
  about above below between through during before after over under again further
  then once here there when where why how all any both each few more most other some such
  no not only own same so than too very just also can will now
  is are was were be been being am
  have has had do does did get got
  i me my we us our you your he him his she her it its they them their
  this that these those what which who whom whose
  will would could should may might must shall can
  either neither per via as
  one two three four five first second next last following way ways
  `
    .trim()
    .split(/\s+/),
)

function normalizeSocraticToken(token) {
  return String(token)
    .toLowerCase()
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')
}

/**
 * @param {string} collapsedTrimmed - single line, whitespace collapsed
 * @returns {boolean}
 */
export function isSocraticHighlightMeaningful(collapsedTrimmed) {
  const text = String(collapsedTrimmed || '')
    .trim()
    .replace(/\s+/g, ' ')
  if (text.length < 2 || text.length > 500) return false

  const rawWords = text.split(/\s+/).filter(Boolean)
  if (rawWords.length < 3) return false

  const tokens = rawWords.map(normalizeSocraticToken).filter(Boolean)
  if (tokens.length < 3) return false

  const letterTokens = tokens.filter((t) => /[\p{L}]/u.test(t))
  if (letterTokens.length < 3) return false

  const uniqueLetter = new Set(letterTokens)
  if (letterTokens.length >= 3 && uniqueLetter.size === 1) return false

  const contentTokens = letterTokens.filter(
    (t) => t.length >= 5 || (t.length >= 2 && !FUNCTION_WORDS.has(t)),
  )
  if (contentTokens.length === 0) return false
  if (contentTokens.length >= 2) return true
  return contentTokens[0].length >= 5
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
    return { ok: false, error: 'Selection is too long (max 500 characters).' }
  }
  if (!isSocraticHighlightMeaningful(text)) {
    return { ok: false, error: SOCRATIC_NOT_ENOUGH_CONTEXT }
  }
  return { ok: true }
}
