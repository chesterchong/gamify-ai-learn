/**
 * Account levels 1–10 (must match backend `accountLevel.js`).
 * XP steps: 500, 1000, 2000, … doubling each level-up until level 10.
 */

export const MAX_ACCOUNT_LEVEL = 10

export function xpStepForLevelUp(fromLevel) {
  if (fromLevel < 1 || fromLevel >= MAX_ACCOUNT_LEVEL) return 0
  return 500 * 2 ** (fromLevel - 1)
}

export function minXpForLevel(level) {
  const L = Math.min(MAX_ACCOUNT_LEVEL, Math.max(1, Math.floor(level)))
  if (L <= 1) return 0
  let sum = 0
  for (let from = 1; from < L; from += 1) {
    sum += xpStepForLevelUp(from)
  }
  return sum
}

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

/**
 * Rank tier labels (levels 1–10). Used for bar + avatar ring styling.
 * @param {number} level 1–10
 */
export function getRankTierStyle(level) {
  const L = Math.min(MAX_ACCOUNT_LEVEL, Math.max(1, Math.floor(level)))
  const tiers = [
    {
      key: 'silver',
      name: 'Beginner',
      barGradient: 'linear-gradient(90deg, #64748b 0%, #94a3b8 50%, #cbd5e1 100%)',
      ringGradient: 'linear-gradient(145deg, #475569, #94a3b8, #e2e8f0)',
      outerGlow: '0 0 28px rgba(148, 163, 184, 0.45), 0 0 48px rgba(100, 116, 139, 0.2)',
      pulseGlow: 'rgba(148, 163, 184, 0.55)',
      lvlBg: 'linear-gradient(135deg, #334155, #64748b)',
      lvlText: '#0f172a',
      displayNameGradient:
        'linear-gradient(105deg, #94a3b8 0%, #cbd5e1 45%, #f8fafc 100%)',
      displayNameFilter: 'drop-shadow(0 0 12px rgba(148, 163, 184, 0.45))',
    },
    {
      key: 'silver_elite',
      name: 'Learner',
      barGradient: 'linear-gradient(90deg, #64748b 0%, #7dd3fc 55%, #bae6fd 100%)',
      ringGradient: 'linear-gradient(145deg, #475569, #38bdf8, #e0f2fe)',
      outerGlow: '0 0 26px rgba(56, 189, 248, 0.35), 0 0 40px rgba(148, 163, 184, 0.25)',
      pulseGlow: 'rgba(56, 189, 248, 0.45)',
      lvlBg: 'linear-gradient(135deg, #0e7490, #38bdf8)',
      lvlText: '#0c1220',
      displayNameGradient:
        'linear-gradient(105deg, #38bdf8 0%, #7dd3fc 50%, #e0f2fe 100%)',
      displayNameFilter:
        'drop-shadow(0 0 12px rgba(56, 189, 248, 0.4)) drop-shadow(0 0 22px rgba(125, 211, 252, 0.2))',
    },
    {
      key: 'gold_nova',
      name: 'Skilled',
      barGradient: 'linear-gradient(90deg, #b45309 0%, #f59e0b 45%, #fcd34d 100%)',
      ringGradient: 'linear-gradient(145deg, #92400e, #f59e0b, #fde68a)',
      outerGlow: '0 0 28px rgba(245, 158, 11, 0.5), 0 0 44px rgba(251, 191, 36, 0.2)',
      pulseGlow: 'rgba(251, 191, 36, 0.55)',
      lvlBg: 'linear-gradient(135deg, #b45309, #fbbf24)',
      lvlText: '#1c1004',
      displayNameGradient:
        'linear-gradient(105deg, #fbbf24 0%, #fcd34d 35%, #fef3c7 100%)',
      displayNameFilter:
        'drop-shadow(0 0 12px rgba(251, 191, 36, 0.5)) drop-shadow(0 0 24px rgba(245, 158, 11, 0.25))',
    },
    {
      key: 'master_guardian',
      name: 'Advanced',
      barGradient: 'linear-gradient(90deg, #4d7c0f 0%, #84cc16 50%, #bef264 100%)',
      ringGradient: 'linear-gradient(145deg, #365314, #84cc16, #ecfccb)',
      outerGlow: '0 0 28px rgba(132, 204, 22, 0.45), 0 0 48px rgba(163, 230, 53, 0.2)',
      pulseGlow: 'rgba(190, 242, 100, 0.5)',
      lvlBg: 'linear-gradient(135deg, #3f6212, #a3e635)',
      lvlText: '#0f172a',
      displayNameGradient:
        'linear-gradient(105deg, #84cc16 0%, #bef264 45%, #ecfccb 100%)',
      displayNameFilter:
        'drop-shadow(0 0 12px rgba(163, 230, 53, 0.45)) drop-shadow(0 0 22px rgba(132, 204, 22, 0.2))',
    },
    {
      key: 'dmg',
      name: 'Expert',
      barGradient: 'linear-gradient(90deg, #0e7490 0%, #22d3ee 50%, #67e8f9 100%)',
      ringGradient: 'linear-gradient(145deg, #155e75, #06b6d4, #cffafe)',
      outerGlow: '0 0 30px rgba(34, 211, 238, 0.45), 0 0 50px rgba(6, 182, 212, 0.2)',
      pulseGlow: 'rgba(34, 211, 238, 0.5)',
      lvlBg: 'linear-gradient(135deg, #0e7490, #22d3ee)',
      lvlText: '#042f2e',
      displayNameGradient:
        'linear-gradient(105deg, #06b6d4 0%, #22d3ee 40%, #a5f3fc 100%)',
      displayNameFilter:
        'drop-shadow(0 0 14px rgba(34, 211, 238, 0.5)) drop-shadow(0 0 26px rgba(6, 182, 212, 0.25))',
    },
    {
      key: 'legendary',
      name: 'Master',
      barGradient: 'linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #93c5fd 100%)',
      ringGradient: 'linear-gradient(145deg, #1e3a8a, #2563eb, #bfdbfe)',
      outerGlow: '0 0 32px rgba(59, 130, 246, 0.55), 0 0 52px rgba(37, 99, 235, 0.25)',
      pulseGlow: 'rgba(96, 165, 250, 0.55)',
      lvlBg: 'linear-gradient(135deg, #1d4ed8, #60a5fa)',
      lvlText: '#0c1220',
      displayNameGradient:
        'linear-gradient(105deg, #3b82f6 0%, #60a5fa 45%, #bfdbfe 100%)',
      displayNameFilter:
        'drop-shadow(0 0 14px rgba(96, 165, 250, 0.55)) drop-shadow(0 0 28px rgba(37, 99, 235, 0.3))',
    },
    {
      key: 'supreme',
      name: 'Elite',
      barGradient: 'linear-gradient(90deg, #6d28d9 0%, #a855f7 50%, #d8b4fe 100%)',
      ringGradient: 'linear-gradient(145deg, #581c87, #9333ea, #e9d5ff)',
      outerGlow: '0 0 34px rgba(168, 85, 247, 0.5), 0 0 56px rgba(147, 51, 234, 0.3)',
      pulseGlow: 'rgba(192, 132, 252, 0.55)',
      lvlBg: 'linear-gradient(135deg, #7c3aed, #c084fc)',
      lvlText: '#0f172a',
      displayNameGradient:
        'linear-gradient(105deg, #a855f7 0%, #c084fc 40%, #e9d5ff 100%)',
      displayNameFilter:
        'drop-shadow(0 0 14px rgba(192, 132, 252, 0.5)) drop-shadow(0 0 30px rgba(147, 51, 234, 0.3))',
    },
    {
      key: 'elite',
      name: 'Champion',
      barGradient: 'linear-gradient(90deg, #a21caf 0%, #e879f9 50%, #f5d0fe 100%)',
      ringGradient: 'linear-gradient(145deg, #86198f, #d946ef, #fae8ff)',
      outerGlow: '0 0 34px rgba(217, 70, 239, 0.5), 0 0 56px rgba(192, 38, 211, 0.25)',
      pulseGlow: 'rgba(232, 121, 249, 0.55)',
      lvlBg: 'linear-gradient(135deg, #a21caf, #e879f9)',
      lvlText: '#0c1220',
      displayNameGradient:
        'linear-gradient(105deg, #d946ef 0%, #e879f9 45%, #fae8ff 100%)',
      displayNameFilter:
        'drop-shadow(0 0 14px rgba(232, 121, 249, 0.55)) drop-shadow(0 0 32px rgba(192, 38, 211, 0.28))',
    },
    {
      key: 'challenger',
      name: 'Hero',
      barGradient: 'linear-gradient(90deg, #c2410c 0%, #f97316 50%, #fdba74 100%)',
      ringGradient: 'linear-gradient(145deg, #9a3412, #ea580c, #fed7aa)',
      outerGlow: '0 0 36px rgba(249, 115, 22, 0.55), 0 0 60px rgba(234, 88, 12, 0.3)',
      pulseGlow: 'rgba(251, 146, 60, 0.6)',
      lvlBg: 'linear-gradient(135deg, #ea580c, #fb923c)',
      lvlText: '#1c1004',
      displayNameGradient:
        'linear-gradient(105deg, #fb923c 0%, #fdba74 40%, #ffedd5 100%)',
      displayNameFilter:
        'drop-shadow(0 0 16px rgba(251, 146, 60, 0.55)) drop-shadow(0 0 34px rgba(249, 115, 22, 0.3))',
    },
    {
      key: 'world_elite',
      name: 'Legend',
      barGradient: 'linear-gradient(90deg, #b91c1c 0%, #f59e0b 35%, #fde047 70%, #f87171 100%)',
      ringGradient: 'linear-gradient(145deg, #7f1d1d, #dc2626, #fbbf24, #fef08a)',
      outerGlow:
        '0 0 40px rgba(239, 68, 68, 0.55), 0 0 64px rgba(251, 191, 36, 0.35), 0 0 80px rgba(220, 38, 38, 0.15)',
      pulseGlow: 'rgba(251, 191, 36, 0.65)',
      lvlBg: 'linear-gradient(135deg, #b91c1c, #f59e0b, #fde047)',
      lvlText: '#1c1004',
      displayNameGradient:
        'linear-gradient(105deg, #fbbf24 0%, #fde047 25%, #f87171 55%, #fbbf24 80%, #fef08a 100%)',
      displayNameFilter:
        'drop-shadow(0 0 16px rgba(251, 191, 36, 0.55)) drop-shadow(0 0 36px rgba(239, 68, 68, 0.35)) drop-shadow(0 0 52px rgba(250, 204, 21, 0.15))',
    },
  ]
  return tiers[L - 1]
}
