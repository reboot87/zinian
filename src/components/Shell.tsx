import { useApp } from '../context'

const ITEMS = [
  { label: '清单', path: '/' },
  { label: '结局', path: '/archive' },
  { label: '统计', path: '/stats' },
  { label: '设置', path: '/settings' },
]

export function Shell({ path, children }: { path: string; children: React.ReactNode }) {
  const { backend, user, go } = useApp()
  const isLocal = backend.mode === 'local'

  const activeIndex = (() => {
    if (path === '/archive') return 1
    if (path === '/stats') return 2
    if (path === '/settings') return 3
    return 0
  })()

  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand" onClick={() => go('/')} role="button" tabIndex={0}>
          <span className="brand-mark" />
          <span className="brand-word">执念</span>
        </div>

        <nav className="nav">
          {ITEMS.map((item, i) => (
            <button
              key={item.path}
              className={`nav-item${activeIndex === i ? ' active' : ''}`}
              onClick={() => go(item.path)}
            >
              <span className="idx">0{i + 1}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="rail-foot">
          <span className="mode-chip">
            <i className={`mode-dot${isLocal ? ' local' : ''}`} />
            {isLocal ? '本机体验' : '云端已连接'}
          </span>
          <span
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={user.email}
          >
            {user.email}
          </span>
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  )
}
