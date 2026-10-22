import { useState } from 'react'
import { useApp } from '../context'
import { dateLabel } from '../lib/format'
import { ageDays } from '../lib/heat'
import { accentColor } from '../lib/types'

export function Archive() {
  const { obsessions, thoughts, go } = useApp()
  const [tab, setTab] = useState<'fulfilled' | 'released'>('fulfilled')

  const fulfilled = obsessions.filter((o) => o.status === 'fulfilled')
  const released = obsessions.filter((o) => o.status === 'released')
  const items = tab === 'fulfilled' ? fulfilled : released

  return (
    <div className="anim">
      <div className="page-head">
        <div>
          <div className="eyebrow">结局</div>
          <h1 className="page-title">有些事已经结束了</h1>
          <p className="page-sub">
            实现了 {fulfilled.length} 条，放下了 {released.length} 条。两种都算走出来。
          </p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'fulfilled' ? ' on' : ''}`} onClick={() => setTab('fulfilled')}>
          已实现 · {fulfilled.length}
        </button>
        <button className={`tab${tab === 'released' ? ' on' : ''}`} onClick={() => setTab('released')}>
          已放下 · {released.length}
        </button>
      </div>

      {items.length ? (
        items.map((o, i) => {
          const count = thoughts.filter((t) => t.obsessionId === o.id).length
          return (
            <div
              key={o.id}
              className="closed-card anim"
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms`, cursor: 'pointer' }}
              onClick={() => go(`/o/${o.id}`)}
            >
              <span className="tag" style={{ marginBottom: 10 }}>
                {o.category}
              </span>
              <h3 className="closed-title">{o.title}</h3>
              <p className="closed-note" style={{ borderLeftColor: accentColor(o.accent) }}>
                {o.closingNote || '（没有留下话）'}
              </p>
              <div className="closed-meta">
                <span>{o.resolvedAt ? dateLabel(o.resolvedAt) : ''}</span>
                <span>历时 {ageDays(o)} 天</span>
                <span>想起 {count} 次</span>
              </div>
            </div>
          )
        })
      ) : (
        <div className="empty">
          <p className="empty-quote">
            {tab === 'fulfilled' ? '还没有实现过的执念。' : '还没有放下的执念。'}
          </p>
          <p className="empty-sub">
            {tab === 'fulfilled'
              ? '慢慢来，执念本来就需要时间。'
              : '放下不是忘记，是不再被它牵着走。'}
          </p>
        </div>
      )}
    </div>
  )
}
