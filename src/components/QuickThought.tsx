import { useState } from 'react'
import { useActions } from '../hooks/useActions'
import { MOODS, MOOD_COLORS, type Mood, type Obsession } from '../lib/types'
import { Modal } from './Modal'

export function QuickThought({
  obsession,
  onClose,
}: {
  obsession: Obsession
  onClose: () => void
}) {
  const { addThought } = useActions()
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(mood: Mood) {
    if (busy) return
    setBusy(true)
    await addThought(obsession.id, mood, note.trim())
    setBusy(false)
    onClose()
  }

  return (
    <Modal
      title="又想起它了"
      sub={`「${obsession.title}」——这次是什么感觉？点一下就记下。`}
      onClose={onClose}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '4px 0 18px' }}>
        {MOODS.map((m) => (
          <button
            key={m}
            className="mood-chip"
            disabled={busy}
            onClick={() => submit(m)}
            style={{ padding: '9px 16px' }}
          >
            <i style={{ background: MOOD_COLORS[m] }} />
            {m}
          </button>
        ))}
      </div>

      <textarea
        className="textarea"
        placeholder="想说点什么？（可以不写）"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ minHeight: 70 }}
      />

      <div className="modal-foot">
        <button className="btn-quiet" onClick={onClose}>
          算了
        </button>
      </div>
    </Modal>
  )
}
