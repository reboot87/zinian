import { useState } from 'react'
import { useApp } from '../context'
import { ACCENTS, CATEGORIES, type Category } from '../lib/types'

const INTENSITY_LABELS = ['很轻', '有点重', '放不下', '很重', '蚀骨']

export function NewObsession() {
  const { backend, refresh, go, toast } = useApp()
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [category, setCategory] = useState<Category>('事')
  const [intensity, setIntensity] = useState(3)
  const [accent, setAccent] = useState(ACCENTS[0].key)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || busy) return
    setBusy(true)
    try {
      await backend.createObsession({
        title: title.trim().slice(0, 60),
        note: note.trim().slice(0, 300),
        category,
        intensity,
        accent,
      })
      await refresh()
      toast('记下了')
      go('/')
    } catch (err) {
      toast((err as Error).message, 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="anim" style={{ maxWidth: 560 }}>
      <div className="detail-top">
        <button className="btn-quiet" onClick={() => go('/')}>
          ← 清单
        </button>
      </div>

      <div className="eyebrow">新的执念</div>
      <h1 className="page-title" style={{ marginBottom: 6 }}>
        写下它
      </h1>
      <p className="page-sub" style={{ marginBottom: 30 }}>
        写下来不是为了解决它，是为了它不再在夜里反复敲门。
      </p>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div className="field">
          <label className="field-label">是什么</label>
          <input
            className="input"
            placeholder="一句话，越具体越好"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
            autoFocus
            required
            style={{ fontFamily: 'var(--serif)', fontSize: 17, padding: '14px 16px' }}
          />
        </div>

        <div className="field">
          <label className="field-label">多说一点（可以不写）</label>
          <textarea
            className="textarea"
            placeholder="那天发生了什么？你多久想起它一次？"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
          />
        </div>

        <div className="field">
          <label className="field-label">它是关于</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip${category === c ? ' on' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">
            有多重 · <span style={{ color: 'var(--text-2)' }}>{INTENSITY_LABELS[intensity - 1]}</span>
          </label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setIntensity(n)}
                aria-label={INTENSITY_LABELS[n - 1]}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: `1px solid ${n <= intensity ? 'rgba(232,163,61,0.6)' : 'var(--line)'}`,
                  background: n <= intensity ? 'rgba(232,163,61,0.16)' : 'transparent',
                  color: n <= intensity ? 'var(--ember)' : 'var(--text-3)',
                  fontFamily: 'var(--serif)',
                  fontSize: 14,
                  transition: 'all .2s',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">颜色</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => setAccent(a.key)}
                title={a.label}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: a.color,
                  opacity: accent === a.key ? 1 : 0.35,
                  boxShadow: accent === a.key ? `0 0 0 3px ${a.color}33, 0 0 16px ${a.color}55` : 'none',
                  transition: 'all .2s',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary" type="submit" disabled={busy || !title.trim()}>
            {busy ? '保存…' : '记下它'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => go('/')}>
            算了
          </button>
        </div>
      </form>
    </div>
  )
}
