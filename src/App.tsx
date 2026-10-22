import { useCallback, useEffect, useMemo, useState } from 'react'
import { Auth } from './components/Auth'
import { Shell } from './components/Shell'
import { AppContext, type AppApi } from './context'
import { getBackend, resetBackend } from './lib/backend'
import type { Backend, Obsession, Profile, Thought } from './lib/types'
import { Archive } from './pages/Archive'
import { Detail } from './pages/Detail'
import { Home } from './pages/Home'
import { NewObsession } from './pages/NewObsession'
import { Settings } from './pages/Settings'
import { Stats } from './pages/Stats'

interface ToastState {
  id: number
  message: string
  kind: 'ok' | 'err'
}

function Loading() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'var(--ember)',
            boxShadow: '0 0 22px 5px var(--ember-glow)',
            animation: 'fade 1.4s ease-in-out infinite alternate',
          }}
        />
        <span className="dim" style={{ fontSize: 11, letterSpacing: '0.3em' }}>
          正在打开
        </span>
      </div>
    </div>
  )
}

export default function App() {
  const [backend, setBackend] = useState<Backend>(() => getBackend())
  const [user, setUser] = useState<Profile | null | undefined>(undefined)
  const [obsessions, setObsessions] = useState<Obsession[]>([])
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [toastState, setToastState] = useState<ToastState | null>(null)
  const [path, setPath] = useState(() => window.location.hash.replace(/^#/, '') || '/')

  useEffect(() => {
    const onHash = () => setPath(window.location.hash.replace(/^#/, '') || '/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = useCallback((next: string) => {
    window.location.hash = next
    window.scrollTo(0, 0)
  }, [])

  const toast = useCallback((message: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random()
    setToastState({ id, message, kind })
    window.setTimeout(() => {
      setToastState((cur) => (cur && cur.id === id ? null : cur))
    }, 2800)
  }, [])

  const refresh = useCallback(async () => {
    const [o, t] = await Promise.all([backend.listObsessions(), backend.listThoughts()])
    setObsessions(o)
    setThoughts(t)
  }, [backend])

  useEffect(() => {
    let alive = true
    setUser(undefined)
    ;(async () => {
      try {
        const current = await backend.currentUser()
        if (!alive) return
        if (current) await refresh()
        if (alive) setUser(current)
      } catch (err) {
        if (!alive) return
        setUser(null)
        toast((err as Error).message, 'err')
      }
    })()
    return () => {
      alive = false
    }
  }, [backend, refresh, toast])

  const switchBackend = useCallback(() => {
    resetBackend()
    setBackend(getBackend())
    setObsessions([])
    setThoughts([])
  }, [])

  const signOut = useCallback(async () => {
    await backend.signOut()
    setUser(null)
    setObsessions([])
    setThoughts([])
  }, [backend])

  const page = useMemo(() => {
    if (path === '/' || path === '') return <Home />
    if (path === '/new') return <NewObsession />
    if (path.startsWith('/o/')) return <Detail id={path.slice(3)} />
    if (path === '/archive') return <Archive />
    if (path === '/stats') return <Stats />
    if (path === '/settings') return <Settings />
    return <Home />
  }, [path])

  if (user === undefined) return <Loading />

  if (!user) {
    return (
      <Auth
        backend={backend}
        onAuthed={async () => {
          const current = await backend.currentUser()
          setUser(current)
          if (current) {
            try {
              await refresh()
            } catch (err) {
              toast((err as Error).message, 'err')
            }
          }
        }}
        onSwitch={switchBackend}
      />
    )
  }

  const api: AppApi = {
    backend,
    obsessions,
    thoughts,
    user,
    refresh,
    toast,
    go,
    switchBackend,
    signOut,
  }

  return (
    <AppContext.Provider value={api}>
      <Shell path={path}>
        {page}
        {toastState ? (
          <div className={`toast${toastState.kind === 'err' ? ' err' : ''}`}>{toastState.message}</div>
        ) : null}
      </Shell>
    </AppContext.Provider>
  )
}
