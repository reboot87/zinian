import { useApp } from '../context'
import type { Mood } from '../lib/types'

export function useActions() {
  const { backend, refresh, toast } = useApp()

  return {
    async addThought(obsessionId: string, mood: Mood, note: string) {
      try {
        await backend.addThought(obsessionId, mood, note)
        await refresh()
        toast('记下了')
        return true
      } catch (e) {
        toast((e as Error).message, 'err')
        return false
      }
    },

    async resolve(obsessionId: string, status: 'fulfilled' | 'released', closingNote: string) {
      try {
        await backend.resolveObsession(obsessionId, status, closingNote)
        await refresh()
        toast(status === 'fulfilled' ? '它有了结局' : '放下的那一刻，也算一种完成')
        return true
      } catch (e) {
        toast((e as Error).message, 'err')
        return false
      }
    },

    async reopen(obsessionId: string) {
      try {
        await backend.reopenObsession(obsessionId)
        await refresh()
        toast('它又回来了')
        return true
      } catch (e) {
        toast((e as Error).message, 'err')
        return false
      }
    },

    async remove(obsessionId: string) {
      try {
        await backend.deleteObsession(obsessionId)
        await refresh()
        toast('已删除')
        return true
      } catch (e) {
        toast((e as Error).message, 'err')
        return false
      }
    },
  }
}
