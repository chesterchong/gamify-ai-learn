/** Calendar year (UTC) shown on the profile learning-activity heatmap. */
export const LEARNING_ACTIVITY_HEATMAP_YEAR = 2026

/** One calendar day in UTC (midnight). */
function utcDayStart(d) {
  const x = new Date(d)
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()))
}

const MS_PER_DAY = 86400000

function prevSunday(d) {
  const x = utcDayStart(d)
  const dow = x.getUTCDay()
  return new Date(x.getTime() - dow * MS_PER_DAY)
}

function saturdayOfWeekContaining(d) {
  const x = utcDayStart(d)
  const dow = x.getUTCDay()
  return new Date(x.getTime() + (6 - dow) * MS_PER_DAY)
}

function dayKeyUTC(d) {
  const x = utcDayStart(d)
  const y = x.getUTCFullYear()
  const m = String(x.getUTCMonth() + 1).padStart(2, '0')
  const day = String(x.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Intensity 1–3 from raw count, relative to max count in the window (GitHub-style).
 * @param {number} c
 * @param {number} maxCount
 */
function intensityForCount(c, maxCount) {
  if (c <= 0) return 0
  if (maxCount <= 1) return 3
  if (maxCount === 2) return c === 1 ? 2 : 3
  if (maxCount === 3) return c
  const t1 = Math.max(1, Math.ceil(maxCount / 3))
  const t2 = Math.max(t1 + 1, Math.ceil((2 * maxCount) / 3))
  if (c <= t1) return 1
  if (c <= t2) return 2
  return 3
}

/**
 * Build a Sunday-start, column-major heatmap (7 rows × weekCount cols) for AI quiz submissions.
 * Window: UTC Jan 1 – Dec 31 of `year` (inclusive). Partial edge weeks show empty outside that range.
 *
 * @param {Array<{ createdAt: Date | string }>} rows
 * @param {number} year — e.g. 2026
 * @returns {{
 *   calendarYear: number,
 *   weekCount: number,
 *   levels: number[],
 *   counts: number[],
 *   dayLabels: string[],
 *   totalSubmissionsInYear: number,
 *   longestStreakDays: number,
 * }}
 */
export function buildLearningActivityForCalendarYear(rows, year) {
  const windowStart = new Date(Date.UTC(year, 0, 1))
  const windowEnd = new Date(Date.UTC(year, 11, 31))

  const counts = new Map()
  for (const row of rows) {
    const d = utcDayStart(row.createdAt)
    if (d < windowStart || d > windowEnd) continue
    const key = dayKeyUTC(d)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const totalSubmissionsInYear = [...counts.values()].reduce((a, b) => a + b, 0)
  const maxCount = counts.size ? Math.max(...counts.values()) : 0

  let longestStreakDays = 0
  let run = 0
  for (let t = windowStart.getTime(); t <= windowEnd.getTime(); t += MS_PER_DAY) {
    const key = dayKeyUTC(new Date(t))
    if ((counts.get(key) ?? 0) > 0) {
      run += 1
      longestStreakDays = Math.max(longestStreakDays, run)
    } else {
      run = 0
    }
  }

  const gridStart = prevSunday(windowStart)
  const gridEnd = saturdayOfWeekContaining(windowEnd)
  const numDays = Math.round((gridEnd.getTime() - gridStart.getTime()) / MS_PER_DAY) + 1
  const numWeeks = numDays / 7

  const levels = []
  const countArr = []
  const dayLabels = []

  for (let w = 0; w < numWeeks; w++) {
    for (let r = 0; r < 7; r++) {
      const day = new Date(gridStart.getTime() + (w * 7 + r) * MS_PER_DAY)
      const label = dayKeyUTC(day)
      dayLabels.push(label)

      if (day < windowStart || day > windowEnd) {
        levels.push(0)
        countArr.push(0)
        continue
      }

      const c = counts.get(label) ?? 0
      countArr.push(c)
      levels.push(intensityForCount(c, maxCount))
    }
  }

  return {
    calendarYear: year,
    weekCount: numWeeks,
    levels,
    counts: countArr,
    dayLabels,
    totalSubmissionsInYear,
    longestStreakDays,
  }
}
