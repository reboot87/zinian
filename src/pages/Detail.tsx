import { useState } from 'react'
import { HeatChart } from '../components/HeatChart'
import { Modal } from '../components/Modal'
import { useApp } from '../context'
import { useActions } from '../hooks/useActions'
import { dateLabel, relTime } from '../lib/format'
import { ageDays, heatLabel, heatOf, heatSeries } from '../lib/heat'
import { MOODS, MOOD_COLORS, accentColor, type Mood } from '../lib/types'

export function Detail({ id }: { id: string }) {
  const { obsessions, thoughts, go } = useApp()
  const { addThought, resolve, reopen, remove } = useActions()

  const [composer, setComposer] = useState(false)
  const [mood, setMood] = useState<Mood>('平静')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [ending, setEnding] = useState<'fulfilled' | 'released' | null>(null)
  const [closing, setClosing] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const obsession = obsessions.find((o) => o.id === id)

  if (!obsession) {
    return (
      <div className="empty anim">
        <p className="empty-quote">这条执念不在了。</p>
        <button className="btn btn-ghost" onClick={() => go('/')}>
          回到清单
        </button>
      </div>
    )
  }

  const list = thoughts.filter((t) => t.obsessionId === id)
  const heat = heatOf(obsession, list)
  const color = accentColor(obsession.accent)
  const isActive = obsession.status === 'active'
  const series = heatSeries(obsession, list, 30)

  async function submitThought() {
    if (busy) return
    setBusy(true)
    const ok = await addThought(obsession!.id, mood, note.trim())
    setBusy(false)
    if (ok) {
      setNote('')
      setComposer(false)
    }
  }

  async function submitEnding() {
    if (!ending || busy) return
    setBusy(true)
    const ok = await resolve(obsession!.id, ending, closing.trim())
    setBusy(false)
    if (ok) {
      setEnding(null)
      setClosing('')
    }
  }

  return (
    <div className="anim">
      <div className="detail-top">
        <button className="btn-quiet" onClick={() => go('/')}>
          ← 清单
        </button>
        <span className="dim" style={{ fontSize: 11, letterSpacing: '0.12em' }}>
          {isActive ? '在烧' : obsession.status === 'fulfilled' ? '已实现' : '已放下'}
        </span>
      </div>

      <span className="tag">{obsession.category}</span>
      <h1 className="detail-title">{obsession.title}</h1>
      {obsession.note ? <p className="detail-note">{obsession.note}</p> : null}

      <div className="detail-meta">
        <div className="stat-inline">
          <b style={{ color }}>{isActive ? heat : '—'}</b>
          <span>热度 · {isActive ? heatLabel(heat) : '已熄'}</span>
        </div>
        <div className="stat-inline">
          <b>{list.length}</b>
          <span>想起过</span>
        </div>
        <div className="stat-inline">
          <b>{ageDays(obsession)}</b>
          <span>天</span>
        </div>
        <div className="stat-inline">
          <b style={{ fontSize: 13, paddingTop: 6 }}>{dateLabel(obsession.createdAt)}</b>
          <span>写下于</span>
        </div>
      </div>

      {isActive ? (
        <div className="card chart-card">
          <div className="chart-head">
            <span className="eyebrow">近 30 天热度</span>
            <span className="dim" style={{ fontSize: 11 }}>
              每次想起 +1，12 天衰减一半
            </span>
          </div>
          <HeatChart values={series} color={color} days={30} />
        </div>
      ) : null}

      {obsession.status !== 'active' ? (
        <div className="card" style={{ padding: '24px 26px', margin: '30px 0' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            {obsession.status === 'fulfilled' ? '实现时写下的话' : '放下时写下的话'}
          </div>
          <p className="closed-note" style={{ borderLeftColor: color }}>
            {obsession.closingNote || '（没有留下话）'}
          </p>
          <div className="closed-meta">
            <span>{obsession.resolvedAt ? dateLabel(obsession.resolvedAt) : ''}</span>
            <span>历时 {ageDays(obsession)} 天</span>
          </div>
        </div>
      ) : null}

      {isActive ? (
        composer ? (
          <div className="card composer">
            <div className="eyebrow">又想起它了 · 这次是什么感觉</div>
            <div className="mood-row">
              {MOODS.map((m) => (
                <button
                  key={m}
                  className={`mood-chip${mood === m ? ' on' : ''}`}
                  onClick={() => setMood(m)}
                >
                  <i style={{ background: MOOD_COLORS[m] }} />
                  {m}
                </button>
              ))}
            </div>
            <textarea
              className="textarea"
              placeholder="当时在想什么？（可以不写）"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
            />
            <div className="composer-foot">
              <span className="dim" style={{ fontSize: 11.5 }}>
                记下这一笔，热度会重新升起来
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-quiet" onClick={() => setComposer(false)}>
                  取消
                </button>
                <button className="btn btn-primary" onClick={submitThought} disabled={busy}>
                  {busy ? '记下…' : '记下'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', margin: '30px 0 26px', fontSize: 15 }}
            onClick={() => setComposer(true)}
          >
            又想起一次
          </button>
        )
      ) : null}

      <div className="eyebrow" style={{ margin: '34px 0 18px' }}>
        想起的时刻 · {list.length}
      </div>

      {list.length ? (
        <div className="timeline">
          {list.map((t) => (
            <div className="tl-item" key={t.id}>
              <span className="tl-dot" style={{ background: MOOD_COLORS[t.mood] }} />
              <div>
                <div className="tl-head">
                  <span className="tl-mood" style={{ color: MOOD_COLORS[t.mood] }}>
                    {t.mood}
                  </span>
                  <span className="tl-time">
                    {relTime(t.createdAt)} · {dateLabel(t.createdAt)}
                  </span>
                </div>
                {t.note ? <p className="tl-note">{t.note}</p> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="dim" style={{ fontSize: 13.5 }}>
          还没有记录。第一次想起它的时候，点上面那个按钮。
        </p>
      )}

      <div className="detail-actions">
        {isActive ? (
          <>
            <button className="btn btn-ghost" onClick={() => setEnding('fulfilled')}>
              实现了
            </button>
            <button className="btn btn-ghost" onClick={() => setEnding('released')}>
              放下了
            </button>
          </>
        ) : (
          <button className="btn btn-ghost" onClick={() => reopen(obsession.id)}>
            它又回来了
          </button>
        )}
        <button className="btn-quiet" style={{ marginLeft: 'auto' }} onClick={() => setConfirmDelete(true)}>
          删除
        </button>
      </div>

      {ending ? (
        <Modal
          title={ending === 'fulfilled' ? '它实现了' : '你放下了'}
          sub={
            ending === 'fulfilled'
              ? '写下这一刻。以后回头看，会知道这条路走了多久。'
              : '放下不是失败。写一句给从前的自己。'
          }
          onClose={() => setEnding(null)}
          footer={
            <>
              <button className="btn-quiet" onClick={() => setEnding(null)}>
                再想想
              </button>
              <button className="btn btn-primary" onClick={submitEnding} disabled={busy}>
                {busy ? '保存…' : '确定'}
              </button>
            </>
          }
        >
          <textarea
            className="textarea"
            placeholder={ending === 'fulfilled' ? '例如：终于站在那儿了。' : '例如：算了，我不用再证明了。'}
            value={closing}
            onChange={(e) => setClosing(e.target.value)}
            autoFocus
          />
        </Modal>
      ) : null}

      {confirmDelete ? (
        <Modal
          title="删掉这条执念？"
          sub="连同它所有的记录一起消失，不能恢复。如果是结束了，用「实现了」或「放下了」更好。"
          onClose={() => setConfirmDelete(false)}
          footer={
            <>
              <button className="btn-quiet" onClick={() => setConfirmDelete(false)}>
                取消
              </button>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  const ok = await remove(obsession.id)
                  setConfirmDelete(false)
                  if (ok) go('/')
                }}
              >
                删除
              </button>
            </>
          }
        />
      ) : null}
    </div>
  )
}
