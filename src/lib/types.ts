export type Category = '人' | '事' | '物' | '念'

export type Mood = '不甘' | '温柔' | '钝痛' | '焦躁' | '平静'

export type Status = 'active' | 'fulfilled' | 'released'

export interface Obsession {
  id: string
  title: string
  note: string
  category: Category
  /** 1-5，初识时你以为它有多重 */
  intensity: number
  accent: string
  status: Status
  closingNote: string
  createdAt: string
  resolvedAt: string | null
}

export interface Thought {
  id: string
  obsessionId: string
  mood: Mood
  note: string
  createdAt: string
}

export interface Profile {
  id: string
  email: string
}

export interface NewObsession {
  title: string
  note: string
  category: Category
  intensity: number
  accent: string
}

export interface Backend {
  mode: 'cloud' | 'local'
  currentUser(): Promise<Profile | null>
  signIn(email: string, password: string): Promise<void>
  signUp(email: string, password: string): Promise<{ needsConfirm: boolean }>
  signOut(): Promise<void>
  listObsessions(): Promise<Obsession[]>
  listThoughts(): Promise<Thought[]>
  createObsession(input: NewObsession): Promise<void>
  addThought(obsessionId: string, mood: Mood, note: string): Promise<void>
  resolveObsession(id: string, status: 'fulfilled' | 'released', closingNote: string): Promise<void>
  reopenObsession(id: string): Promise<void>
  deleteObsession(id: string): Promise<void>
}

export const CATEGORIES: Category[] = ['人', '事', '物', '念']

export const MOODS: Mood[] = ['不甘', '温柔', '钝痛', '焦躁', '平静']

export const ACCENTS: { key: string; label: string; color: string }[] = [
  { key: 'ember', label: '余烬', color: '#E8A33D' },
  { key: 'rust', label: '铁锈', color: '#C4544A' },
  { key: 'moss', label: '苔痕', color: '#7E9A8E' },
  { key: 'dusk', label: '暮紫', color: '#8C7BA6' },
  { key: 'bone', label: '骨白', color: '#C9BFAE' },
]

export const MOOD_COLORS: Record<Mood, string> = {
  不甘: '#C4544A',
  温柔: '#D98E6A',
  钝痛: '#8C7BA6',
  焦躁: '#D9A05B',
  平静: '#7E9A8E',
}

export function accentColor(key: string): string {
  return ACCENTS.find((a) => a.key === key)?.color ?? ACCENTS[0].color
}
