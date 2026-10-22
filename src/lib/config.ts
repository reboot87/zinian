export interface AppConfig {
  url: string
  anonKey: string
}

const STORAGE_KEY = 'zinian.supabase.config'

const envUrl = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '').trim()
const envKey = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '').trim()

const envConfig: AppConfig | null =
  envUrl && envKey && /^https?:\/\//.test(envUrl) && !envUrl.includes('your-project-ref')
    ? { url: envUrl.replace(/\/+$/, ''), anonKey: envKey }
    : null

/** 优先级：本机手动配置 > 构建时注入的环境变量 */
export function getConfig(): AppConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppConfig>
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url.replace(/\/+$/, ''), anonKey: parsed.anonKey }
      }
    }
  } catch {
    /* 忽略损坏的本机配置 */
  }
  return envConfig
}

export function saveConfig(config: AppConfig | null): void {
  if (!config) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ url: config.url.replace(/\/+$/, ''), anonKey: config.anonKey.trim() }),
  )
}

export function hasEnvConfig(): boolean {
  return envConfig !== null
}

export function isCloud(): boolean {
  return getConfig() !== null
}
