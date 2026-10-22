import { createContext, useContext } from 'react'
import type { Backend, Obsession, Profile, Thought } from './lib/types'

export interface AppApi {
  backend: Backend
  obsessions: Obsession[]
  thoughts: Thought[]
  user: Profile
  refresh: () => Promise<void>
  toast: (message: string, kind?: 'ok' | 'err') => void
  go: (path: string) => void
  switchBackend: () => void
  signOut: () => Promise<void>
}

export const AppContext = createContext<AppApi | null>(null)

export function useApp(): AppApi {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('AppContext 未初始化')
  return ctx
}
