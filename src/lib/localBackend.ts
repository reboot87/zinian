import type { Backend, Mood, NewObsession, Obsession, Thought } from './types'

const OBS_KEY = 'zinian.local.obsessions'
const TH_KEY = 'zinian.local.thoughts'
const SEED_KEY = 'zinian.local.seeded'
const SESSION_KEY = 'zinian.local.session'

const DAY = 86_400_000
const now = () => Date.now()
const iso = (daysAgo: number, hour = 22, minute = 10) => {
  const d = new Date(now() - daysAgo * DAY)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}
const uid = () => `local_${Math.random().toString(36).slice(2, 10)}`

function seed() {
  if (localStorage.getItem(SEED_KEY)) return

  const obs: Obsession[] = [
    {
      id: 'o_father',
      title: '跟父亲说一句对不起',
      note: '那年冬天我摔门走了。十年里，我们都假装那晚没有发生。',
      category: '人',
      intensity: 5,
      accent: 'ember',
      status: 'active',
      closingNote: '',
      createdAt: iso(64, 20, 5),
      resolvedAt: null,
    },
    {
      id: 'o_novel',
      title: '写完那本没写完的小说',
      note: '写到第 37 页，主人公站在站台上，然后我停了四年。',
      category: '事',
      intensity: 4,
      accent: 'rust',
      status: 'active',
      closingNote: '',
      createdAt: iso(41, 23, 40),
      resolvedAt: null,
    },
    {
      id: 'o_her',
      title: '再见她一面',
      note: '不为了什么，只是想确认她现在过得好。',
      category: '人',
      intensity: 4,
      accent: 'dusk',
      status: 'active',
      closingNote: '',
      createdAt: iso(23, 1, 12),
      resolvedAt: null,
    },
    {
      id: 'o_gardenia',
      title: '把阳台那盆栀子养活',
      note: '它每年都长新叶，每年都不开花。',
      category: '物',
      intensity: 2,
      accent: 'moss',
      status: 'active',
      closingNote: '',
      createdAt: iso(12, 9, 30),
      resolvedAt: null,
    },
    {
      id: 'o_ordinary',
      title: '承认自己并不特别',
      note: '这个念头每次出现，我都要花两天才能缓过来。',
      category: '念',
      intensity: 3,
      accent: 'bone',
      status: 'active',
      closingNote: '',
      createdAt: iso(7, 2, 20),
      resolvedAt: null,
    },
    {
      id: 'o_iceland',
      title: '去一次冰岛',
      note: '想站在没有树的地方，看一次极光。',
      category: '事',
      intensity: 3,
      accent: 'moss',
      status: 'fulfilled',
      closingNote: '二月，黑沙滩。风大到听不见自己说话，我在那儿站了四十分钟，什么也没想。',
      createdAt: iso(420, 10, 0),
      resolvedAt: iso(180, 15, 0),
    },
    {
      id: 'o_hate',
      title: '让她知道我恨过她',
      note: '准备了很久的一段话，一直没发出去。',
      category: '念',
      intensity: 4,
      accent: 'rust',
      status: 'released',
      closingNote: '后来发现，说出来也只是让我自己好受一点。而她并不欠我这个。算了。',
      createdAt: iso(300, 21, 0),
      resolvedAt: iso(96, 23, 30),
    },
  ]

  const thoughts: Thought[] = []
  const add = (obsessionId: string, daysAgo: number, mood: Mood, note = '', hour = 22, minute = 15) => {
    thoughts.push({ id: uid(), obsessionId, mood, note, createdAt: iso(daysAgo, hour, minute) })
  }

  // 父亲：绵长、反复
  add('o_father', 61, '钝痛', '梦见他在楼下等我，醒来发现是雨声。', 3, 12)
  add('o_father', 52, '不甘', '')
  add('o_father', 44, '钝痛', '妈说他最近血压高，我"嗯"了一声就挂了。', 20, 40)
  add('o_father', 33, '温柔', '想起他教我骑车那天，松手之前他一直扶着。', 21, 5)
  add('o_father', 27, '不甘', '')
  add('o_father', 19, '钝痛', '在超市看见有人买他常抽的那个牌子。', 18, 22)
  add('o_father', 12, '温柔', '')
  add('o_father', 8, '不甘', '打了三个字又删掉：爸，我——', 23, 55)
  add('o_father', 5, '钝痛', '')
  add('o_father', 3, '温柔', '他昨天给我发了一条天气预报，什么也没说。', 9, 8)
  add('o_father', 1, '不甘', '')

  // 小说
  add('o_novel', 38, '焦躁', '打开文档，光标闪了二十分钟。', 23, 10)
  add('o_novel', 30, '温柔', '在通勤路上想到一个结尾，记在了发票背面。', 8, 30)
  add('o_novel', 24, '不甘', '')
  add('o_novel', 17, '焦躁', '把前 37 页重读了一遍，觉得自己写得真差。', 1, 40)
  add('o_novel', 11, '平静', '')
  add('o_novel', 6, '温柔', '那个站台上的人，好像一直在等我回去。', 22, 50)
  add('o_novel', 2, '焦躁', '')

  // 她
  add('o_her', 21, '钝痛', '朋友圈里她换了头像，我没有点开。', 0, 20)
  add('o_her', 16, '温柔', '')
  add('o_her', 10, '不甘', '想知道她有没有偶尔也想起我。', 23, 15)
  add('o_her', 4, '钝痛', '')
  add('o_her', 1, '平静', '今天想起她的时候，心里没有那么疼了。', 14, 5)

  // 栀子
  add('o_gardenia', 11, '平静', '浇了水，叶子还是黄的。', 8, 0)
  add('o_gardenia', 7, '焦躁', '查了半小时资料，可能是我浇太多。', 22, 0)
  add('o_gardenia', 3, '温柔', '冒了一个新芽。', 8, 20)

  // 不特别
  add('o_ordinary', 6, '钝痛', '开会时发现，这个想法别人三年前就写过了。', 15, 0)
  add('o_ordinary', 2, '平静', '')
  add('o_ordinary', 1, '不甘', '但好像也没那么难接受了。', 1, 10)

  // 冰岛（已实现）
  add('o_iceland', 400, '温柔', '在纪录片里看到极光，截图存进了相册。', 23, 0)
  add('o_iceland', 268, '焦躁', '查了一晚上机票，又关掉了。', 22, 30)
  add('o_iceland', 205, '平静', '开始存钱。', 12, 0)

  // 恨（已放下）
  add('o_hate', 282, '不甘', '又梦见那件事，醒来手指是麻的。', 3, 0)
  add('o_hate', 154, '钝痛', '写了一段话，存成草稿。', 23, 40)
  add('o_hate', 101, '平静', '删掉了草稿。', 21, 10)

  localStorage.setItem(OBS_KEY, JSON.stringify(obs))
  localStorage.setItem(TH_KEY, JSON.stringify(thoughts))
  localStorage.setItem(SEED_KEY, '1')
}

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

function write<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function createLocalBackend(): Backend {
  seed()

  return {
    mode: 'local',

    async currentUser() {
      return localStorage.getItem(SESSION_KEY) ? { id: 'local-user', email: '本机体验' } : null
    },

    async signIn() {
      localStorage.setItem(SESSION_KEY, '1')
    },

    async signUp() {
      localStorage.setItem(SESSION_KEY, '1')
      return { needsConfirm: false }
    },

    async signOut() {
      localStorage.removeItem(SESSION_KEY)
    },

    async listObsessions() {
      return read<Obsession>(OBS_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },

    async listThoughts() {
      return read<Thought>(TH_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },

    async createObsession(input: NewObsession) {
      const list = read<Obsession>(OBS_KEY)
      list.push({
        id: uid(),
        title: input.title,
        note: input.note,
        category: input.category,
        intensity: input.intensity,
        accent: input.accent,
        status: 'active',
        closingNote: '',
        createdAt: new Date().toISOString(),
        resolvedAt: null,
      })
      write(OBS_KEY, list)
    },

    async addThought(obsessionId, mood, note) {
      const list = read<Thought>(TH_KEY)
      list.push({ id: uid(), obsessionId, mood, note, createdAt: new Date().toISOString() })
      write(TH_KEY, list)
    },

    async resolveObsession(id, status, closingNote) {
      const list = read<Obsession>(OBS_KEY).map((o) =>
        o.id === id
          ? { ...o, status, closingNote, resolvedAt: new Date().toISOString() }
          : o,
      )
      write(OBS_KEY, list)
    },

    async reopenObsession(id) {
      const list = read<Obsession>(OBS_KEY).map((o) =>
        o.id === id ? { ...o, status: 'active' as const, closingNote: '', resolvedAt: null } : o,
      )
      write(OBS_KEY, list)
    },

    async deleteObsession(id) {
      write(OBS_KEY, read<Obsession>(OBS_KEY).filter((o) => o.id !== id))
      write(TH_KEY, read<Thought>(TH_KEY).filter((t) => t.obsessionId !== id))
    },
  }
}
