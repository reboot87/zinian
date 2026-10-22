import { useMemo, useState } from 'react'
import { QuickThought } from '../components/QuickThought'
import { Spark } from '../components/Spark'
import { useApp } from '../context'
import { greeting } from '../lib/format'
import { ageDays, heatLabel, heatOf, heatSeries } from '../lib/heat'
import { accentColor, type Obsession } from '../lib/types'

export function Home() {
  const { obsessions, thoughts, go } = useApp()
  const [quick, setQuick] = useState<Obsession | null>(null)

  const entries = useMemo(() => {
    return obsessions
      .filter((o) => o.status === 'active')
      .map((o) => {
        const list = thoughts.filter((t) => t.obsessionId === o.id)
        return { o, list, heat: heatOf(o, list), series: heatSeries(o, list, 21) }
      })
      .sort((a, b) => b.heat - a.heat)
  }, [obsessions, thoughts])

  const hero = entries[0]
  const rest = entries.slice(1)
  const closedCount = obsessions.filter((o) => o.status !== 'active').length
  const today = new Date()
  const dateText = `${today.getMonth() + 1} 月 ${today.getDate()} 日`

  return (
    <div className="anim">
      <div className="page-head">
        <div>
          <div className="eyebrow">
            {dateText} · {greeting()}
          </div>
          <h1 className="page-title">
            {entries.length ? `${entries.length} 条执念还在烧` : '这里还空着'}
          </h1>
          <p className="page-sub">
            {entries.length
              ? `已经 ${closedCount} 条有了结局。剩下的，还在等你。`
              : '那些放不下的人和事，写下来，就不会再压在心里。'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => go('/new')}>
          写一条
        </button>
      </div>

      {hero ? (
        <section className="hero">
          <div className="hero-top">
            <span className="tag">{hero.o.category}</span>
            <span className="dim" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
              最放不下的一条
            </span>
          </div>

          <h2
            className="hero-title"
            style={{ cursor: 'pointer' }}
            onClick={() => go(`/o/${hero.o.id}`)}
          >
            {hero.o.title}
          </h2>
          {hero.o.note ? <p className="hero-note">{hero.o.note}</p> : null}

          <div className="hero-body">
            <div className="heat-block">
              <span className="heat-num" style={{ color: accentColor(hero.o.accent) }}>
                {hero.heat}
              </span>
              <div className="heat-meta">
                <span className="heat-word">{heatLabel(hero.heat)}</span>
                <span className="heat-hint">
                  第 {ageDays(hero.o)} 天 · 想起 {hero.list.length} 次
                </span>
              </div>
              <div style={{ marginLeft: 6, paddingBottom: 8 }}>
                <Spark values={hero.series} color={accentColor(hero.o.accent)} width={110} height={34} />
              </div>
            </div>

            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => setQuick(hero.o)}>
                又想起一次
              </button>
              <button className="btn btn-ghost" onClick={() => go(`/o/${hero.o.id}`)}>
                看看它
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {entries.length ? (
        <>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            {rest.length ? '其余执念' : '全部执念'}
          </div>

          <div className="list">
            {rest.map(({ o, list, heat, series }, i) => (
              <div
                key={o.id}
                className="row anim"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                onClick={() => go(`/o/${o.id}`)}
              >
                <span
                  className="row-bar"
                  style={{
                    background: accentColor(o.accent),
                    opacity: Math.max(0.25, heat / 100),
                    boxShadow: `0 0 14px ${accentColor(o.accent)}55`,
                  }}
                />
                <div className="row-main">
                  <h3 className="row-title">{o.title}</h3>
                  <div className="row-meta">
                    <span>{o.category}</span>
                    <i className="dot" />
                    <span>第 {ageDays(o)} 天</span>
                    <i className="dot" />
                    <span>想起 {list.length} 次</span>
                    {list[0] ? (
                      <>
                        <i className="dot" />
                        <span>{heatLabel(heat)}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="row-right">
                  <Spark values={series} color={accentColor(o.accent)} width={72} height={24} />
                  <span className="row-heat" style={{ color: accentColor(o.accent) }}>
                    {heat}
                    <small>°</small>
                  </span>
                  <button
                    className="btn btn-ghost row-quick"
                    style={{ padding: '7px 14px', fontSize: 12.5 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setQuick(o)
                    }}
                  >
                    又想起
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty">
          <p className="empty-quote">
            还没有执念。
            <br />
            这可能是好事。
          </p>
          <p className="empty-sub">如果有一件事总在深夜回来找你，把它写下来。</p>
          <button className="btn btn-primary" onClick={() => go('/new')}>
            写下第一条
          </button>
        </div>
      )}

      {quick ? <QuickThought obsession={quick} onClose={() => setQuick(null)} /> : null}
    </div>
  )
}
