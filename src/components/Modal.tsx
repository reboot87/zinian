import { useEffect } from 'react'

interface Props {
  title: string
  sub?: string
  children?: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
}

export function Modal({ title, sub, children, onClose, footer }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title serif">{title}</h3>
        {sub ? <p className="modal-sub">{sub}</p> : null}
        {children}
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  )
}
