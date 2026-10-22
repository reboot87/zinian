# 执念 · zinian

> 那些说不出口的、放不下的、反复回来的，都可以放在这里。

一份私人的执念清单。你把放不下的人和事写下来，每想起一次就记一次，看着它的热度升温或者慢慢熄灭，最后给它一个结局：**实现了**，或者**放下了**。

- 前 端：React 18 + TypeScript + Vite（无 UI 框架，纯手写设计系统）
- 后 端：Supabase（Auth 邮箱登录 + Postgres + RLS 行级权限）
- 部署：静态站点即可，已适配 Vercel / Netlify / 任意静态托管

---

## 一、5 分钟接上你自己的 Supabase

### 1. 建项目

1. 打开 <https://supabase.com/dashboard>，用 GitHub 或邮箱注册登录
2. **New project** → 填名字（比如 `zinian`）→ 设置数据库密码 → 区域选 `Southeast Asia (Singapore)` 或 `Northeast Asia (Tokyo)`（离你近的）
3. 等 1～2 分钟，项目创建完成

### 2. 建表

左侧 **SQL Editor** → **New query** → 把项目里 `supabase/schema.sql` 的内容整段粘进去 → **Run**。

看到 `Success. No rows returned` 就对了。这个脚本会建两张表（`obsessions` 执念、`thoughts` 每次想起的记录），并开启 RLS，保证每个人只能读到自己的数据。脚本可以重复执行。

### 3. 拿 Key

左侧 **Project Settings** → **API**，复制两个值：

| 页面上的名字 | 用途 |
| --- | --- |
| **Project URL** | `https://xxxx.supabase.co` |
| **anon / public** 那一栏的 key | 前端用的公开密钥，可以放在代码里 |

> 注意：**不要**用 `service_role` key。那个是服务器密钥，泄露等于数据库裸奔。

### 4. 关掉邮箱确认（推荐，省事）

**Authentication** → **Sign In / Providers** → **Email** → 把 **Confirm email** 关掉。

关掉后注册即可直接登录。如果保持开启，注册后需要去邮箱点确认链接才能登录，应用会提示你。

### 5. 填进应用（两种方式，选一个）

**方式 A：在应用里填（最快，不用重新构建）**

打开应用 → 点「连接我的 Supabase」（登录页）或「设置」→ 粘贴 URL 和 anon key → 连接 → 注册账号。配置存在本机浏览器，立刻生效。

**方式 B：写进 `.env`（适合正式部署）**

```bash
cp .env.example .env
# 编辑 .env，填入两个值
npm run build
```

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

`npm run build` 后重新部署，打开就是云端模式。

---

## 二、本地开发

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 产物在 dist/
npm run preview    # 预览构建产物
```

没有配置 Supabase 时，应用自动进入**本机体验模式**：数据存在浏览器 localStorage 里，带一份示例数据，所有功能都能走通，适合先看效果。侧边栏左下角会标明当前是「本机体验」还是「云端已连接」。

---

## 三、部署

### GitHub Pages（已配置好，push 即部署）

仓库里已经带好了 `.github/workflows/deploy.yml`：推到 `main` 就自动构建并发布。

**第一次需要做两件事：**

1. 仓库 **Settings → Secrets and variables → Actions → New repository secret**，加两条：

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | anon public key |

2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。

之后每次 `git push` 到 `main`，Actions 会自动跑 `npm ci` → `npm run build` → 发布，链接是：

```
https://<用户名>.github.io/<仓库名>/
```

> 免费账号的 Pages 要求仓库是 **public**。代码公开没有风险——anon key 本来就是设计成放前端的，
> 数据由数据库里的 RLS 策略保护，别人拿 key 也读不到你的执念。

### Vercel

```bash
npm i -g vercel
vercel            # 按提示走，框架选 Vite
vercel --prod
```

在 Vercel 项目 **Settings → Environment Variables** 里加上 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，然后重新部署。

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### 任意静态托管

`npm run build` 后把 `dist/` 整个目录传上去即可。用的是 hash 路由（`#/o/xxx`），不需要配置服务端 rewrite。

### 部署后还要做一件事

回到 Supabase → **Authentication** → **URL Configuration**，把线上域名填进 **Site URL**（`Redirect URLs` 也加一条），否则邮件确认链接会跳回 localhost。

---

## 四、数据模型

```sql
obsessions                        -- 一条执念
  id, user_id, title, note,
  category    人 | 事 | 物 | 念
  intensity   1-5，初始重量
  accent      颜色主题
  status      active | fulfilled | released
  closing_note, created_at, resolved_at

thoughts                          -- 一次「又想起」
  id, obsession_id, user_id,
  mood        不甘 | 温柔 | 钝痛 | 焦躁 | 平静
  note, created_at
```

两张表都开了 RLS，策略统一是 `auth.uid() = user_id`，读、写、改、删都只对自己生效。

### 热度怎么算

```
score = intensity × 0.9 + Σ( e^(-天数/12) × (有笔记 ? 1.25 : 1) )
热度  = round(100 × (1 - e^(-score/9)))     // 0-99
```

意思是：每想起一次加一点重量，每次的重量在 12 天后衰减一半。所以一条执念只要不再被想起，热度会自然退下去——不是你要放下它，是它自己慢慢凉了。逻辑在 `src/lib/heat.ts`，可以自己调参。

---

## 五、目录结构

```
src/
  App.tsx                  会话、路由、数据加载
  context.ts               全局上下文
  styles.css               设计系统（墨色 + 余烬）
  lib/
    config.ts              Supabase 配置（本机 / env）
    backend.ts             数据层工厂：有配置走云端，没有走本机
    supabaseBackend.ts     Supabase 实现
    localBackend.ts        本机实现 + 示例数据
    heat.ts                热度算法
    types.ts               类型与常量
  components/              Shell / Auth / Modal / 图表 / 快捷记录
  pages/                   Home / Detail / NewObsession / Archive / Stats / Settings
supabase/schema.sql        建表 + RLS 脚本
```

数据层是一个统一的 `Backend` 接口，想换成别的后端（Firebase、自建 API）只要再实现一份，页面代码不用动。

---

## 六、常见问题

**登录报「邮箱还没确认」**
Supabase → Authentication → Email → 关掉 Confirm email；或去邮箱点确认链接。

**注册后数据是空的**
确认已经在 SQL Editor 跑过 `schema.sql`。没建表时写入会报「没有写入权限」或「数据表不存在」。

**换设备看不到数据**
本机模式的数据只在这台浏览器。连上 Supabase 后重新登录即可跨设备。设置页可以导出 JSON 备份。
