import { useApp } from '../context'
import { ageDays } from '../lib/heat'
import { MOODS, MOOD_COLORS, accentColor } from '../lib/types'

const BUCKETS = [
  { label: '深夜 0–6', from: 0, to: 6 },
  { label: '上午 6–12', from: 6, to: 12 },
  { label: '下午 12–18', from: 12, to: 18 },
  { label: '夜里 18–24', from: 18, to: 24 },
]

export function Stats() {
  const { obsessions, thoughts, go } = useApp()

  const active = obsessions.filter((o) => o.status === 'active')
  const fulfilled = obsessions.filter((o) => o.status === 'fulfilled')
  const released = obsessions.filter((o) => o.status === 'released')
  const longest = obsessions.reduce((max, o) => Math.max(max, ageDays(o)), 0)

  const moodCounts = MOODS.map((m) => ({
    mood: m,
    count: thoughts.filter((t) => t.mood === m).length,
  }))
  const moodMax = Math.max(1, ...moodCounts.map((x) => x.count))

  const bucketCounts = BUCKETS.map((b) => ({
    ...b,
    count: thoughts.filter((t) => {
      const h = new Date(t.createdAt).getHours()
      return h >= b.from && h < b.to
    }).length,
  }))
  const bucketMax = Math.max(1, ...bucketCounts.map((b) => b.count))

  const top = obsessions
    .map((o) => ({ o, n: thoughts.filter((t) => t.obsessionId === o.id).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3)

  const nightShare = thoughts.length
    ? Math.round(
        (thoughts.filter((t) => {
          const h = new Date(t.createdAt).getHours()
          return h >= 22 || h < 6
        }).length /
          thoughts.length) *
          100,
      )
    : 0

  return (
    <div className="anim">
      <div className="page-head">
        <div>
          <div className="eyebrow">统计</div>
          <h1 className="page-title">你被什么牵着</h1>
          <p className="page-sub">数字不能说明什么，但它诚实地记着你花在它们身上的时间。</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-cell">
          <b style={{ color: 'var(--ember)' }}>{active.length}</b>
          <span>正在烧</span>
        </div>
        <div className="stat-cell">
          <b>{fulfilled.length}</b>
          <span>已实现</span>
        </div>
        <div className="stat-cell">
          <b>{released.length}</b>
          <span>已放下</span>
        </div>
        <div className="stat-cell">
          <b>{longest}</b>
          <span>最久一条 · 天</span>
        </div>
      </div>

      <div className="card" style={{ padding: '22px 24px', marginBottom: 12 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          想起时的情绪 · 共 {thoughts.length} 次
        </div>
        {thoughts.length ? (
          moodCounts.map((m) => (
            <div className="bar-row" key={m.mood}>
              <span style={{ color: 'var(--text-2)' }}>{m.mood}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(m.count / moodMax) * 100}%`,
                    background: MOOD_COLORS[m.mood],
                    opacity: m.count ? 0.85 : 0,
                  }}
                />
              </div>
              <span className="dim" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {m.count}
              </span>
            </div>
          ))
        ) : (
          <p className="dim" style={{ fontSize: 13 }}>
            还没有记录。等你第一次点「又想起一次」。
          </p>
        )}
      </div>

      <div className="card" style={{ padding: '22px 24px', marginBottom: 12 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          它们什么时候来找你
        </div>
        {bucketCounts.map((b) => (
          <div className="bar-row" key={b.label}>
            <span style={{ color: 'var(--text-2)' }}>{b.label}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${(b.count / bucketMax) * 100}%`,
                  background: 'var(--ember)',
                  opacity: b.count ? 0.8 : 0,
                }}
              />
            </div>
            <span className="dim" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {b.count}
            </span>
          </div>
        ))}
        <p className="dim" style={{ fontSize: 12, marginTop: 14, marginBottom: 0, lineHeight: 1.8 }}>
          {thoughts.length
            ? `${nightShare}% 的想起发生在夜里十点之后。夜里的人不太会骗自己。`
            : '数据还不够，先多记几次。'}
        </p>
      </div>

      <div className="card" style={{ padding: '22px 24px' }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          最常想起
        </div>
        {top.length ? (
          top.map(({ o, n }, i) => (
            <div
              key={o.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '10px 0',
                borderBottom: i < top.length - 1 ? '1px solid var(--line)' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => go(`/o/${o.id}`)}
            >
              <span className="dim mono" style={{ width: 16 }}>
                {i + 1}
              </span>
              <span
                className="serif"
                style={{ flex: 1, fontSize: 16, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {o.title}
              </span>
              <span style={{ fontSize: 13, color: accentColor(o.accent) }}>{n} 次</span>
            </div>
          ))
        ) : (
          <p className="dim" style={{ fontSize: 13 }}>
            还没有数据。
          </p>
        )}
      </div>
    </div>
  )
}
