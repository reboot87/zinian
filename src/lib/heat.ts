import type { Obsession, Thought } from './types'

const DAY = 86_400_000
/** 每 12 天，一次想起的重量衰减一半 */
const HALF_LIFE = 12

export function daysBetween(from: string | number, to: number = Date.now()): number {
  return Math.max(0, Math.floor((to - new Date(from).getTime()) / DAY))
}

export function ageDays(obsession: Obsession): number {
  const end = obsession.resolvedAt ? new Date(obsession.resolvedAt).getTime() : Date.now()
  return Math.max(1, Math.ceil((end - new Date(obsession.createdAt).getTime()) / DAY))
}

/** 执念热度：0-99，由初始重量 + 每次想起的指数衰减累加得到 */
export function heatOf(obsession: Obsession, thoughts: Thought[], now = Date.now()): number {
  let score = obsession.intensity * 0.9
  for (const t of thoughts) {
    const age = Math.max(0, (now - new Date(t.createdAt).getTime()) / DAY)
    score += Math.exp(-age / HALF_LIFE) * (t.note ? 1.25 : 1)
  }
  if (obsession.status !== 'active') return 0
  return Math.min(99, Math.max(1, Math.round(100 * (1 - Math.exp(-score / 9)))))
}

/** 过去 n 天的热度序列，用于曲线 */
export function heatSeries(
  obsession: Obsession,
  thoughts: Thought[],
  days = 30,
  now = Date.now(),
): number[] {
  const out: number[] = []
  for (let i = days - 1; i >= 0; i--) {
    const at = now - i * DAY
    let score = obsession.intensity * 0.9
    for (const t of thoughts) {
      const ts = new Date(t.createdAt).getTime()
      if (ts > at) continue
      const age = Math.max(0, (at - ts) / DAY)
      score += Math.exp(-age / HALF_LIFE) * (t.note ? 1.25 : 1)
    }
    out.push(100 * (1 - Math.exp(-score / 9)))
  }
  return out
}

export function heatLabel(heat: number): string {
  if (heat >= 80) return '灼'
  if (heat >= 60) return '炽'
  if (heat >= 40) return '温'
  if (heat >= 20) return '微'
  return '熄'
}

/** 连续多少天想起过它 */
export function streakDays(thoughts: Thought[]): number {
  if (!thoughts.length) return 0
  const days = new Set(
    thoughts.map((t) => new Date(t.createdAt).toISOString().slice(0, 10)),
  )
  let streak = 0
  const cursor = new Date()
  for (let i = 0; i < 400; i++) {
    const key = cursor.toISOString().slice(0, 10)
    if (days.has(key)) {
      streak++
    } else if (i > 0) {
      break
    }
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
