/** Fisher–Yates shuffle: returns permutation where result[i] = original index at display position i */
export function shuffleDisplayPermutation(length) {
  const perm = Array.from({ length }, (_, i) => i)
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  return perm
}

const SECONDS_PER_QUESTION = 30

export function formatEstimatedQuizTime(questionCount) {
  const n = Math.max(0, Math.floor(Number(questionCount) || 0))
  const totalSec = n * SECONDS_PER_QUESTION
  if (totalSec <= 0) return '—'
  if (totalSec < 60) return `~${totalSec} sec`
  const min = Math.ceil(totalSec / 60)
  return `~${min} min`
}
