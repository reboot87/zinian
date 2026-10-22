import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { AppConfig } from './config'
import type { Backend, Mood, NewObsession, Obsession, Profile, Thought } from './types'

type ObsessionRow = {
  id: string
  title: string
  note: string | null
  category: string
  intensity: number
  accent: string
  status: string
  closing_note: string | null
  created_at: string
  resolved_at: string | null
}

type ThoughtRow = {
  id: string
  obsession_id: string
  mood: string
  note: string | null
  created_at: string
}

function friendlyError(error: { message?: string; code?: string } | null): Error {
  const msg = error?.message ?? '未知错误'
  if (msg.includes('Invalid login credentials')) return new Error('邮箱或密码不对，再试一次。')
  if (msg.includes('Email not confirmed')) return new Error('邮箱还没确认，请先去收件箱点开确认链接。')
  if (msg.includes('User already registered')) return new Error('这个邮箱已经注册过了，直接登录吧。')
  if (msg.includes('Password should be at least')) return new Error('密码至少要 6 位。')
  if (msg.includes('row-level security') || error?.code === '42501') {
    return new Error('没有写入权限：请确认已在 Supabase 执行过建表与 RLS 脚本。')
  }
  if (msg.includes('relation') && msg.includes('does not exist')) {
    return new Error('数据表不存在：请先在 Supabase SQL Editor 里执行 supabase/schema.sql。')
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return new Error('连不上 Supabase，检查一下 Project URL 和网络。')
  }
  return new Error(msg)
}

export function createSupabaseBackend(config: AppConfig): Backend {
  const client: SupabaseClient = createClient(config.url, config.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  })

  async function requireUserId(): Promise<string> {
    const { data, error } = await client.auth.getUser()
    if (error || !data.user) throw new Error('登录状态已失效，请重新登录。')
    return data.user.id
  }

  const mapObsession = (r: ObsessionRow): Obsession => ({
    id: r.id,
    title: r.title,
    note: r.note ?? '',
    category: r.category as Obsession['category'],
    intensity: r.intensity,
    accent: r.accent,
    status: r.status as Obsession['status'],
    closingNote: r.closing_note ?? '',
    createdAt: r.created_at,
    resolvedAt: r.resolved_at,
  })

  const mapThought = (r: ThoughtRow): Thought => ({
    id: r.id,
    obsessionId: r.obsession_id,
    mood: r.mood as Mood,
    note: r.note ?? '',
    createdAt: r.created_at,
  })

  return {
    mode: 'cloud',

    async currentUser(): Promise<Profile | null> {
      const { data } = await client.auth.getSession()
      const user = data.session?.user
      return user ? { id: user.id, email: user.email ?? '' } : null
    },

    async signIn(email, password) {
      const { error } = await client.auth.signInWithPassword({ email, password })
      if (error) throw friendlyError(error)
    },

    async signUp(email, password) {
      const { data, error } = await client.auth.signUp({ email, password })
      if (error) throw friendlyError(error)
      return { needsConfirm: !data.session }
    },

    async signOut() {
      await client.auth.signOut()
    },

    async listObsessions() {
      const { data, error } = await client
        .from('obsessions')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw friendlyError(error)
      return (data as ObsessionRow[]).map(mapObsession)
    },

    async listThoughts() {
      const { data, error } = await client
        .from('thoughts')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw friendlyError(error)
      return (data as ThoughtRow[]).map(mapThought)
    },

    async createObsession(input: NewObsession) {
      const userId = await requireUserId()
      const { error } = await client.from('obsessions').insert({
        user_id: userId,
        title: input.title,
        note: input.note,
        category: input.category,
        intensity: input.intensity,
        accent: input.accent,
      })
      if (error) throw friendlyError(error)
    },

    async addThought(obsessionId, mood, note) {
      const userId = await requireUserId()
      const { error } = await client
        .from('thoughts')
        .insert({ obsession_id: obsessionId, user_id: userId, mood, note })
      if (error) throw friendlyError(error)
    },

    async resolveObsession(id, status, closingNote) {
      const { error } = await client
        .from('obsessions')
        .update({
          status,
          closing_note: closingNote,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw friendlyError(error)
    },

    async reopenObsession(id) {
      const { error } = await client
        .from('obsessions')
        .update({ status: 'active', closing_note: '', resolved_at: null })
        .eq('id', id)
      if (error) throw friendlyError(error)
    },

    async deleteObsession(id) {
      const { error } = await client.from('obsessions').delete().eq('id', id)
      if (error) throw friendlyError(error)
    },
  }
}
