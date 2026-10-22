import { useState } from 'react'
import { useApp } from '../context'
import { getConfig, hasEnvConfig, saveConfig } from '../lib/config'

export function Settings() {
  const { backend, user, obsessions, thoughts, switchBackend, signOut, toast } = useApp()
  const isLocal = backend.mode === 'local'
  const config = getConfig()

  const [url, setUrl] = useState(config?.url ?? '')
  const [key, setKey] = useState(config?.anonKey ?? '')
  const [busy, setBusy] = useState(false)

  function connect(e: React.FormEvent) {
    e.preventDefault()
    const cleanUrl = url.trim()
    const cleanKey = key.trim()
    if (!/^https?:\/\/.+/.test(cleanUrl)) {
      toast('Project URL 应该长这样：https://xxxx.supabase.co', 'err')
      return
    }
    if (cleanKey.length < 30) {
      toast('anon key 看起来不完整', 'err')
      return
    }
    saveConfig({ url: cleanUrl, anonKey: cleanKey })
    switchBackend()
    toast('已切换，请重新登录')
  }

  function disconnect() {
    saveConfig(null)
    switchBackend()
    toast('已断开云端，回到本机模式')
  }

  function exportData() {
    const payload = {
      app: '执念',
      exportedAt: new Date().toISOString(),
      obsessions,
      thoughts,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `zinian-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast('已导出')
  }

  return (
    <div className="anim" style={{ maxWidth: 620 }}>
      <div className="page-head">
        <div>
          <div className="eyebrow">设置</div>
          <h1 className="page-title">存放的地方</h1>
        </div>
      </div>

      <div className="card setting-block">
        <div className="setting-row">
          <div>
            <p className="setting-title">
              数据来源 ·{' '}
              <span style={{ color: isLocal ? 'var(--text-2)' : 'var(--ember)' }}>
                {isLocal ? '本机浏览器' : 'Supabase 云端'}
              </span>
            </p>
            <p className="setting-desc">
              {isLocal
                ? '现在数据只存在这台设备的浏览器里，清缓存会丢。连上 Supabase 后会自动多端同步。'
                : `已连接 ${config?.url ?? ''}，数据通过行级权限隔离，只有你自己的账号能读。`}
            </p>
          </div>
          {!isLocal ? (
            <button className="btn btn-ghost" onClick={disconnect}>
              断开
            </button>
          ) : null}
        </div>

        {isLocal ? (
          <form onSubmit={connect} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            <div>
              <button className="btn btn-primary" type="submit" disabled={busy}>
                连接并同步
              </button>
            </div>
            <p className="dim" style={{ fontSize: 11.5, lineHeight: 1.9, margin: 0 }}>
              连接前请先在 Supabase 的 SQL Editor 执行项目里的 <span className="mono">supabase/schema.sql</span>。
              {hasEnvConfig() ? ' 当前也检测到构建时注入的配置。' : ''}
            </p>
          </form>
        ) : null}
      </div>

      <div className="card setting-block">
        <div className="setting-row">
          <div>
            <p className="setting-title">账号</p>
            <p className="setting-desc">{user.email}</p>
          </div>
          <button className="btn btn-ghost" onClick={signOut}>
            退出登录
          </button>
        </div>
      </div>

      <div className="card setting-block">
        <div className="setting-row">
          <div>
            <p className="setting-title">导出</p>
            <p className="setting-desc">
              把 {obsessions.length} 条执念和 {thoughts.length} 次记录导出成 JSON，随时带走。
            </p>
          </div>
          <button className="btn btn-ghost" onClick={exportData}>
            导出
          </button>
        </div>
      </div>

      <div className="card setting-block">
        <p className="setting-title">关于</p>
        <p className="setting-desc">
          执念 · v1.0
          <br />
          它不劝你放下，也不催你实现。它只是把你说不出口的东西，好好存起来。
        </p>
      </div>
    </div>
  )
}
