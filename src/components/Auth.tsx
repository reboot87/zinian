import { useState } from 'react'
import { saveConfig } from '../lib/config'
import type { Backend } from '../lib/types'

interface Props {
  backend: Backend
  onAuthed: () => Promise<void> | void
  onSwitch: () => void
}

export function Auth({ backend, onAuthed, onSwitch }: Props) {
  const isLocal = backend.mode === 'local'
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [showConnect, setShowConnect] = useState(false)
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (mode === 'in') {
        await backend.signIn(email.trim(), password)
      } else {
        const { needsConfirm } = await backend.signUp(email.trim(), password)
        if (needsConfirm) {
          setNotice('注册好了。去邮箱点开确认链接，再回来登录。')
          setMode('in')
          setBusy(false)
          return
        }
      }
      await onAuthed()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function enterLocal() {
    setBusy(true)
    try {
      await backend.signIn('local', 'local')
      await onAuthed()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function connect(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const cleanUrl = url.trim()
    const cleanKey = key.trim()
    if (!/^https?:\/\/.+/.test(cleanUrl)) {
      setError('Project URL 应该长这样：https://xxxx.supabase.co')
      return
    }
    if (cleanKey.length < 30) {
      setError('anon key 看起来不完整，去 Supabase → Settings → API 复制 anon public 那一栏。')
      return
    }
    saveConfig({ url: cleanUrl, anonKey: cleanKey })
    onSwitch()
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card anim">
        <div className="auth-mark" />
        <h1 className="auth-title">执念</h1>
        <p className="auth-sub">
          那些说不出口的、放不下的、反复回来的，
          <br />
          都可以放在这里。没有人会看见。
        </p>

        {isLocal ? (
          <>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={enterLocal} disabled={busy}>
              {busy ? '正在打开…' : '开始（本机体验）'}
            </button>
            <p className="dim" style={{ fontSize: 12, lineHeight: 1.9, marginTop: 14 }}>
              还没连接云端，数据只保存在这台设备的浏览器里。想跨设备同步，可以连上你自己的 Supabase。
            </p>

            {error ? (
              <div className="alert" style={{ marginTop: 16 }}>
                {error}
              </div>
            ) : null}

            <div style={{ marginTop: 26, paddingTop: 22, borderTop: '1px solid var(--line)' }}>
              {!showConnect ? (
                <button className="btn-quiet" onClick={() => setShowConnect(true)}>
                  连接我的 Supabase →
                </button>
              ) : (
                <form onSubmit={connect} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="field">
                    <label className="field-label">PROJECT URL</label>
                    <input
                      className="input mono"
                      placeholder="https://xxxx.supabase.co"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">ANON PUBLIC KEY</label>
                    <input
                      className="input mono"
                      placeholder="eyJhbGciOi..."
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" type="submit">
                      连接
                    </button>
                    <button className="btn btn-ghost" type="button" onClick={() => setShowConnect(false)}>
                      取消
                    </button>
                  </div>
                  <p className="dim" style={{ fontSize: 11.5, lineHeight: 1.8, margin: 0 }}>
                    连接前请先在 Supabase 的 SQL Editor 里执行项目里的 supabase/schema.sql。
                  </p>
                </form>
              )}
            </div>
          </>
        ) : (
          <>
            <form className="auth-form" onSubmit={submit}>
              <div className="field">
                <label className="field-label">邮箱</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="field">
                <label className="field-label">密码</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 位"
                  required
                  minLength={6}
                  autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
                />
              </div>

              {error ? <div className="alert">{error}</div> : null}
              {notice ? <div className="alert ok">{notice}</div> : null}

              <button className="btn btn-primary" type="submit" disabled={busy} style={{ marginTop: 4 }}>
                {busy ? '稍等…' : mode === 'in' ? '进入' : '创建账号'}
              </button>
            </form>

            <p className="auth-switch">
              {mode === 'in' ? '还没有账号？' : '已经有账号了？'}
              <button
                onClick={() => {
                  setMode(mode === 'in' ? 'up' : 'in')
                  setError('')
                  setNotice('')
                }}
              >
                {mode === 'in' ? ' 注册一个' : ' 去登录'}
              </button>
            </p>

            <p className="auth-alt">
              数据存在你自己的 Supabase 项目里，只有你能读到。
              <br />
              首次使用若登录失败，请到 Supabase → Authentication 把 “Confirm email” 关掉，或在邮箱点确认链接。
            </p>
          </>
        )}
      </div>
    </div>
  )
}
