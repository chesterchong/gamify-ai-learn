/**
 * Account levels 1–10. XP to go from level L → L+1: 500 × 2^(L−1)
 * (500, 1000, 2000, …, 128000). Total XP to reach level 10: 255,500.
 */

export const MAX_ACCOUNT_LEVEL = 10

/** XP required to advance from `fromLevel` to `fromLevel + 1` (1…9). */
export function xpStepForLevelUp(fromLevel) {
  if (fromLevel < 1 || fromLevel >= MAX_ACCOUNT_LEVEL) return 0
  return 500 * 2 ** (fromLevel - 1)
}

/** Minimum total XP needed to be at least `level` (level 1 ⇒ 0). */
export function minXpForLevel(level) {
  const L = Math.min(MAX_ACCOUNT_LEVEL, Math.max(1, Math.floor(level)))
  if (L <= 1) return 0
  let sum = 0
  for (let from = 1; from < L; from += 1) {
    sum += xpStepForLevelUp(from)
  }
  return sum
}

/** Derive level (1–10) from lifetime XP. */
export function levelFromTotalXp(xp) {
  const x = Math.max(0, Math.floor(Number(xp) || 0))
  let level = 1
  let remaining = x
  for (let L = 1; L < MAX_ACCOUNT_LEVEL; L += 1) {
    const step = xpStepForLevelUp(L)
    if (remaining < step) break
    remaining -= step
    level += 1
  }
  return level
}

/**
 * @returns {{ level: number, xpIntoLevel: number, xpToNextLevel: number | null, progressToNext: number }}
 */
export function getLevelProgressFromXp(xp) {
  const x = Math.max(0, Math.floor(Number(xp) || 0))
  const level = levelFromTotalXp(x)
  if (level >= MAX_ACCOUNT_LEVEL) {
    const floor = minXpForLevel(MAX_ACCOUNT_LEVEL)
    return {
      level,
      xpIntoLevel: x - floor,
      xpToNextLevel: null,
      progressToNext: 1,
    }
  }
  const floor = minXpForLevel(level)
  const nextStep = xpStepForLevelUp(level)
  const xpIntoLevel = x - floor
  return {
    level,
    xpIntoLevel,
    xpToNextLevel: nextStep,
    progressToNext: Math.min(1, nextStep > 0 ? xpIntoLevel / nextStep : 1),
  }
}
