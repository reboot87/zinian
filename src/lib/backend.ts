import { getConfig } from './config'
import { createLocalBackend } from './localBackend'
import { createSupabaseBackend } from './supabaseBackend'
import type { Backend } from './types'

let cached: { key: string; backend: Backend } | null = null

export function getBackend(): Backend {
  const config = getConfig()
  const key = config ? `cloud:${config.url}` : 'local'
  if (cached && cached.key === key) return cached.backend

  const backend = config ? createSupabaseBackend(config) : createLocalBackend()
  cached = { key, backend }
  return backend
}

export function resetBackend() {
  cached = null
}
