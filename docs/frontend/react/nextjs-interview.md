# Next.js 面试题集

> Next.js 框架核心知识点与高频面试题
> 
> 更新时间：2025-02

## 目录

[[toc]]

## A. 面试宝典

### 基础题

#### 1. Next.js 的核心特性有哪些？

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 核心特性                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性              说明                                      │
│  ──────────────────────────────────────────────────────────│
│  文件系统路由      基于 app/ 目录自动生成路由               │
│  服务端渲染        SSR/SSG/ISR 多种渲染模式                 │
│  Server Components React Server Components 支持             │
│  数据获取          async/await 直接获取数据                 │
│  API Routes        内置后端 API 支持                        │
│  Image 优化        自动图片优化和懒加载                     │
│  代码分割          自动按路由分割代码                       │
│  TypeScript        开箱即用的 TS 支持                       │
│  Fast Refresh      快速热更新                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**标准回答：**
> Next.js 是基于 React 的全栈框架，核心特性包括：文件系统路由、服务端渲染（SSR/SSG/ISR）、React Server Components、内置 API Routes、自动代码分割、图片优化等。它解决了 React SPA 的 SEO 问题，提供了优秀的开发体验和性能。

**追问点：**

**Q1: Next.js 13+ App Router vs Pages Router 的主要区别？**

A: App Router（Next.js 13+）是新的路由系统，主要区别：
- **路由定义**：App Router 使用文件夹 + `page.tsx`，Pages Router 使用文件即路由
- **数据获取**：App Router 支持 async 组件直接获取数据，Pages Router 使用 `getServerSideProps`/`getStaticProps`
- **布局系统**：App Router 原生支持嵌套布局（`layout.tsx`），Pages Router 需要手动实现
- **Server Components**：App Router 默认使用 React Server Components，Pages Router 不支持
- **流式渲染**：App Router 支持 Suspense 和流式渲染，性能更好

**Q2: 为什么选择 Next.js 而不是纯 React？**

A: Next.js 解决了纯 React SPA 的几个核心问题：
- **SEO 优化**：服务端渲染（SSR）让搜索引擎可以抓取完整内容
- **首屏性能**：SSR/SSG 提供更快的首屏加载速度（FCP、LCP）
- **开发体验**：文件系统路由、自动代码分割、内置 API Routes，无需额外配置
- **图片优化**：内置 Image 组件自动优化图片（WebP、懒加载、响应式）
- **全栈能力**：API Routes 让前后端代码在同一项目中，简化开发流程

**Q3: Next.js 的渲染模式有哪些？**

A: Next.js 支持 4 种渲染模式，可以按页面混合使用：
- **SSR（服务端渲染）**：每次请求时在服务器生成 HTML，适合动态内容（如用户个人页面）
- **SSG（静态生成）**：构建时生成 HTML，适合内容不常变化的页面（如博客文章）
- **ISR（增量静态再生）**：在 SSG 基础上定期重新生成，兼顾性能和实时性（如产品列表）
- **CSR（客户端渲染）**：在客户端渲染，适合不需要 SEO 的页面（如后台管理）

**延伸**：Next.js 14+ 还支持 Partial Prerendering（PPR），可以在同一页面混合静态和动态内容。


---

#### 2. App Router vs Pages Router

```
┌─────────────────────────────────────────────────────────────┐
│                App Router vs Pages Router                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性          Pages Router      App Router                 │
│  ──────────────────────────────────────────────────────────│
│  路由定义      文件即路由        文件夹 + page.tsx          │
│  数据获取      getServerSideProps async 组件               │
│  布局          手动实现          layout.tsx 嵌套            │
│  Server Components 不支持        默认支持                   │
│  流式渲染      不支持            支持                       │
│  并行路由      不支持            支持                       │
│  拦截路由      不支持            支持                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Pages Router (传统)**

```
pages/
├── index.js          → /
├── about.js          → /about
├── blog/
│   ├── index.js      → /blog
│   └── [slug].js     → /blog/:slug
└── api/
    └── hello.js      → /api/hello
```

```jsx
// pages/blog/[slug].js
export default function BlogPost({ post }) {
  return <article>{post.title}</article>
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'hello' } }],
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.slug)
  return { props: { post } }
}
```


**App Router (Next.js 13+)**

```
app/
├── page.tsx          → /
├── layout.tsx        → 共享布局
├── loading.tsx       → 加载状态
├── error.tsx         → 错误处理
├── not-found.tsx     → 404 页面
├── about/
│   └── page.tsx      → /about
├── blog/
│   ├── page.tsx      → /blog
│   └── [slug]/
│       └── page.tsx  → /blog/:slug
└── api/
    └── hello/
        └── route.ts  → /api/hello
```

```tsx
// app/blog/[slug]/page.tsx
interface Props {
  params: Promise<{ slug: string }>
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  return <article>{post.title}</article>
}

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}
```

**标准回答：**
> App Router 是 Next.js 13+ 的新路由系统，基于文件夹结构和特殊文件约定，支持嵌套布局、Server Components 等高级特性。Pages Router 是传统的基于文件即路由的系统，更简单但功能有限。

**追问点：**

**Q1: App Router 的文件约定有哪些？**

A: App Router 使用特殊文件名约定来定义路由行为：
- **page.tsx**：定义页面组件，使路由可访问
- **layout.tsx**：定义共享布局，自动包裹子路由
- **loading.tsx**：定义加载 UI，基于 Suspense
- **error.tsx**：定义错误边界，处理运行时错误
- **not-found.tsx**：定义 404 页面
- **route.tsx**：定义 API 路由处理器
- **template.tsx**：类似 layout 但每次导航都重新挂载

**Q2: 如何从 Pages Router 迁移到 App Router？**

A: 迁移策略建议渐进式迁移：
- **并存运行**：两种路由系统可以在同一项目中并存
- **优先级**：App Router 优先级高于 Pages Router
- **数据获取迁移**：`getServerSideProps` → async 组件，`getStaticProps` → 静态生成
- **布局迁移**：`_app.tsx` → `layout.tsx`，支持嵌套布局
- **API 路由**：`pages/api/` → `app/api/route.tsx`

**Q3: App Router 的性能优势是什么？**

A: App Router 带来显著的性能提升：
- **Server Components**：减少客户端 JavaScript 包大小，服务端渲染组件
- **流式渲染**：支持 Suspense，页面可以分块加载，改善 TTFB
- **并行数据获取**：多个组件可以并行获取数据，减少瀑布请求
- **自动代码分割**：按路由段自动分割，更精细的懒加载
- **缓存优化**：内置请求缓存、数据缓存、完整路由缓存

---

#### 3. Server Components vs Client Components

**Server Component (默认)**

```tsx
// app/posts/page.tsx
async function Posts() {
  // 可以直接访问数据库、文件系统等
  const posts = await db.posts.findMany()

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```


**Client Component**

```tsx
// app/components/Counter.tsx
'use client' // 标记为客户端组件

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}
```

**区别对比：**

```
┌─────────────────────────────────────────────────────────────┐
│          Server Component vs Client Component                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性              Server Component    Client Component     │
│  ──────────────────────────────────────────────────────────│
│  渲染位置          服务端              客户端               │
│  useState/useEffect 不可用            可用                  │
│  浏览器 API        不可用              可用                 │
│  事件处理          不可用              可用                 │
│  数据获取          async/await         useEffect/SWR       │
│  包含在 JS Bundle  否                  是                   │
│  SEO               优秀                较差                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**组合使用：**

```tsx
// Server Component 包含 Client Component
async function Page() {
  const data = await fetchData() // 服务端获取数据

  return (
    <div>
      <h1>{data.title}</h1>
      {/* 将数据传递给客户端组件 */}
      <InteractiveChart data={data.chartData} />
    </div>
  )
}

// 通过 children 传递 Server Component
import Modal from './ui/modal' // Client Component
import Cart from './ui/cart'   // Server Component

export default function Page() {
  return (
    <Modal>
      <Cart />
    </Modal>
  )
}
```

**标准回答：**
> Server Components 在服务端渲染，可以直接访问数据库和文件系统，不包含在客户端 JS 包中。Client Components 在客户端渲染，可以使用 React hooks 和浏览器 API，需要 'use client' 指令标记。

**追问点：**

**Q1: 什么时候使用 Server Components vs Client Components？**

A: 选择原则基于功能需求：
- **Server Components**：数据获取、SEO 重要、静态内容、减少包大小
- **Client Components**：交互功能（onClick、useState）、浏览器 API、实时更新、第三方库
- **混合使用**：Server Component 作为容器获取数据，Client Component 处理交互
- **性能考虑**：优先使用 Server Components，只在必要时使用 Client Components

**Q2: Server Components 的限制有哪些？**

A: Server Components 有以下限制：
- **不能使用 React hooks**：useState、useEffect、useContext 等
- **不能使用浏览器 API**：localStorage、window、document 等
- **不能使用事件处理器**：onClick、onSubmit 等
- **不能使用某些第三方库**：依赖浏览器环境的库
- **序列化限制**：传递给 Client Components 的 props 必须可序列化

**Q3: 如何在 Server 和 Client Components 之间传递数据？**

A: 数据传递的几种方式：
- **Props 传递**：Server Component 通过 props 向 Client Component 传递数据
- **Children 模式**：Client Component 通过 children 接收 Server Component
- **Context 限制**：Context 只能在 Client Components 中使用
- **序列化要求**：传递的数据必须是可序列化的（JSON.stringify 兼容）

```tsx
// ✅ 正确：通过 props 传递
function ServerComponent() {
  const data = await fetchData()
  return <ClientComponent data={data} />
}

// ✅ 正确：通过 children 传递
function ClientWrapper({ children }) {
  return <div className="interactive">{children}</div>
}

// ❌ 错误：不能传递函数
function ServerComponent() {
  const handler = () => console.log('click')
  return <ClientComponent onClick={handler} /> // 序列化错误
}
```

---

#### 4. SSR/SSG/ISR 的区别

**SSR (Server-Side Rendering)**

```tsx
// App Router - 使用 force-dynamic
export const dynamic = 'force-dynamic'

async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store' // 每次请求都获取新数据
  })
  return <div>{data}</div>
}
```



**SSG (Static Site Generation)**

```tsx
// App Router - 默认行为
async function Page() {
  const data = await fetch('https://api.example.com/data')
  // 默认会被缓存（SSG）
  return <div>{data}</div>
}
```

**ISR (Incremental Static Regeneration)**

```tsx
// App Router
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 } // 60秒后重新验证
  })
  return <div>{data}</div>
}
```

**渲染模式对比：**

```
┌─────────────────────────────────────────────────────────────┐
│                    渲染模式对比                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  模式    生成时机        适用场景              SEO          │
│  ──────────────────────────────────────────────────────────│
│  SSG    构建时          静态内容、博客        优秀          │
│  SSR    请求时          个性化内容、实时数据  优秀          │
│  ISR    构建时+增量更新  经常更新的内容       优秀          │
│  CSR    客户端          交互密集、私有内容    较差          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**标准回答：**
> SSR 在每次请求时服务端渲染，适合动态内容；SSG 在构建时生成静态页面，适合不常变化的内容；ISR 结合两者优势，支持增量更新静态页面。选择依据内容更新频率和个性化需求。

**追问点：**

**Q1: 如何选择合适的渲染模式？**

A: 选择渲染模式的决策树：
- **内容是否个性化？** 是 → SSR，否 → 继续
- **内容更新频率？** 实时 → SSR，很少 → SSG，定期 → ISR
- **SEO 重要性？** 重要 → SSR/SSG/ISR，不重要 → CSR
- **构建时间考虑？** 页面很多且构建慢 → ISR，否则 SSG
- **服务器成本？** 预算有限 → SSG/ISR，充足 → SSR

**Q2: ISR 的工作原理是什么？**

A: ISR（增量静态再生）的工作流程：
- **初始构建**：构建时生成静态页面
- **首次访问**：返回缓存的静态页面
- **后台重新生成**：到达 revalidate 时间后，后台重新生成页面
- **更新缓存**：新页面生成后更新缓存
- **按需重新验证**：可以通过 API 手动触发重新生成

```tsx
// 时间基础的重新验证
export const revalidate = 3600 // 1小时

// 按需重新验证
await revalidatePath('/posts/[slug]')
await revalidateTag('posts')
```

**Q3: 如何在同一应用中混合使用不同渲染模式？**

A: Next.js 支持页面级别的渲染模式混合：
- **路由段配置**：每个页面可以独立配置渲染模式
- **动态配置**：通过 `dynamic`、`revalidate` 等配置项控制
- **条件渲染**：根据用户状态或环境动态选择渲染方式
- **最佳实践**：首页用 SSG，用户页面用 SSR，内容页面用 ISR

```tsx
// 不同页面使用不同模式
// app/page.tsx - SSG
export default async function HomePage() {
  const data = await fetch('https://api.example.com/static')
  return <div>{data}</div>
}

// app/profile/page.tsx - SSR
export const dynamic = 'force-dynamic'
export default async function ProfilePage() {
  const user = await getCurrentUser()
  return <div>Welcome {user.name}</div>
}

// app/posts/[slug]/page.tsx - ISR
export const revalidate = 3600
export default async function PostPage({ params }) {
  const post = await getPost(params.slug)
  return <article>{post.content}</article>
}
```

---

#### 5. Next.js 数据获取方式

**1. 服务端组件直接获取**

```tsx
async function Page() {
  const data = await fetch('https://api.example.com/data')
  const json = await data.json()
  return <div>{json.title}</div>
}
```

**2. 并行数据获取**

```tsx
async function Page() {
  // 并行请求
  const [users, posts] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json())
  ])

  return (
    <div>
      <UserList users={users} />
      <PostList posts={posts} />
    </div>
  )
}
```

**3. 使用 React Cache**

```tsx
import { cache } from 'react'

const getUser = cache(async (id: string) => {
  const user = await db.user.findUnique({ where: { id } })
  return user
})

// 多次调用只会执行一次
async function Page() {
  const user1 = await getUser('1')
  const user2 = await getUser('1') // 使用缓存
  return <div>{user1.name}</div>
}
```


**4. 使用 Server Actions**

```tsx
// app/actions.ts
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  await db.posts.create({ data: { title } })
  revalidatePath('/posts')
}

// app/page.tsx
import { createPost } from './actions'

export default function Page() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">创建</button>
    </form>
  )
}
```

---

### 进阶题

#### 6. Next.js 路由系统

**动态路由**

```
app/
├── blog/
│   └── [slug]/
│       └── page.tsx      → /blog/:slug
├── shop/
│   └── [...slug]/
│       └── page.tsx      → /shop/* (捕获所有)
└── docs/
    └── [[...slug]]/
        └── page.tsx      → /docs 和 /docs/* (可选捕获所有)
```

```tsx
// app/blog/[slug]/page.tsx
interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params
  const { tag } = await searchParams
  
  const post = await getPost(slug)
  return <article>{post.title}</article>
}
```

**路由组 (Route Groups)**

```
app/
├── (marketing)/
│   ├── about/
│   └── blog/
├── (shop)/
│   ├── products/
│   └── cart/
└── layout.tsx
```

**并行路由 (Parallel Routes)**

```
app/
├── @team/
│   └── page.tsx
├── @analytics/
│   └── page.tsx
└── layout.tsx

// layout.tsx
export default function Layout({ children, team, analytics }) {
  return (
    <>
      {children}
      {team}
      {analytics}
    </>
  )
}
```


**拦截路由 (Intercepting Routes)**

```
app/
├── feed/
│   └── page.tsx
├── photo/
│   └── [id]/
│       └── page.tsx
└── @modal/
    └── (.)photo/
        └── [id]/
            └── page.tsx  → 拦截 /photo/[id]
```

**标准回答：**
> Next.js App Router 基于文件系统路由，支持动态路由、路由组、并行路由、拦截路由等高级特性。通过文件夹结构和特殊文件约定，可以构建复杂的路由架构。

**追问点：**

**Q1: 动态路由的不同类型有什么区别？**

A: Next.js 支持三种动态路由类型：
- **单段动态路由 `[slug]`**：匹配单个路径段，如 `/blog/hello-world`
- **捕获所有路由 `[...slug]`**：匹配多个路径段，如 `/shop/clothes/shirts/red`，params 为数组
- **可选捕获所有 `[[...slug]]`**：既匹配根路径又匹配多段路径，如 `/docs` 和 `/docs/api/reference`
- **参数获取**：通过 `await params` 获取路由参数，`await searchParams` 获取查询参数

**Q2: 路由组 (Route Groups) 的使用场景是什么？**

A: 路由组用于组织路由结构而不影响 URL 路径：
- **逻辑分组**：将相关路由分组管理，如 `(marketing)`、`(dashboard)`
- **不同布局**：不同路由组可以有不同的 `layout.tsx`
- **团队协作**：不同团队负责不同路由组，便于代码管理
- **条件渲染**：可以根据路由组条件渲染不同的导航或侧边栏
- **URL 不变**：路由组名称不会出现在 URL 中，只是文件组织方式

**Q3: 并行路由和拦截路由的实际应用场景？**

A: 这两个高级特性适用于复杂的 UI 场景：
- **并行路由应用**：仪表盘同时显示多个数据面板、电商页面同时显示商品和推荐、社交媒体的多栏布局
- **拦截路由应用**：图片画廊的模态框预览、社交媒体的帖子详情弹窗、电商的快速预览
- **组合使用**：可以结合使用，如在并行路由中使用拦截路由实现复杂的模态框系统
- **性能优势**：避免页面跳转，提供更流畅的用户体验

```tsx
// 实际应用示例：图片画廊拦截路由
// app/@modal/(.)photo/[id]/page.tsx
export default function PhotoModal({ params }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <Image src={`/photos/${params.id}`} />
        <button onClick={() => router.back()}>关闭</button>
      </div>
    </div>
  )
}
```

---

#### 7. Next.js 性能优化

**1. Image 组件优化**

```tsx
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  priority // 首屏图片优先加载
  placeholder="blur"
  blurDataURL={blurDataUrl}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**2. 动态导入**

```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false // 禁用服务端渲染
})

// 命名导出
const Chart = dynamic(() => import('./Chart').then(mod => mod.Chart), {
  ssr: false
})
```

**3. 路由预加载**

```tsx
import Link from 'next/link'

// 默认预加载
<Link href="/about">About</Link>

// 禁用预加载
<Link href="/about" prefetch={false}>About</Link>

// 编程式预加载
import { useRouter } from 'next/navigation'

const router = useRouter()
router.prefetch('/dashboard')
```

**4. 流式渲染 + Suspense**

```tsx
import { Suspense } from 'react'

async function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <AnotherSlowComponent />
      </Suspense>
    </div>
  )
}
```

**5. 缓存策略**

```tsx
// 1. fetch 缓存
fetch('https://api.example.com/data', {
  cache: 'force-cache' // 默认，永久缓存
})

fetch('https://api.example.com/data', {
  cache: 'no-store' // 不缓存，每次请求
})

fetch('https://api.example.com/data', {
  next: { revalidate: 3600 } // 1小时后重新验证
})

// 2. 路由段配置
export const dynamic = 'force-dynamic' // 强制动态渲染
export const revalidate = 3600 // 路由级别重新验证
```

**标准回答：**
> Next.js 性能优化包括图片优化、代码分割、路由预加载、流式渲染、缓存策略等。通过 Image 组件、动态导入、Suspense、合理的缓存配置，可以显著提升应用性能。

**追问点：**

**Q1: Next.js Image 组件相比普通 img 标签有哪些优势？**

A: Next.js Image 组件提供了全面的图片优化：
- **自动格式转换**：自动转换为 WebP、AVIF 等现代格式，减少文件大小
- **响应式图片**：根据设备尺寸提供不同大小的图片，通过 `sizes` 属性控制
- **懒加载**：默认启用懒加载，只有图片进入视口时才加载
- **占位符**：支持模糊占位符（blur）和自定义占位符，改善用户体验
- **优先级控制**：`priority` 属性让首屏图片优先加载，避免 LCP 延迟
- **自动优化**：自动调整图片质量和尺寸，平衡文件大小和视觉效果

**Q2: 什么时候应该使用动态导入？**

A: 动态导入适用于以下场景：
- **大型组件**：图表库、富文本编辑器等体积较大的组件
- **条件渲染**：只在特定条件下才显示的组件（如管理员面板）
- **第三方库**：体积较大的第三方库，如地图、视频播放器
- **移动端优化**：在移动端不需要的功能组件
- **首屏优化**：非首屏关键内容可以延迟加载

```tsx
// 条件动态导入示例
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  ssr: false,
  loading: () => <div>Loading admin panel...</div>
})

function Dashboard({ user }) {
  return (
    <div>
      <h1>Dashboard</h1>
      {user.isAdmin && <AdminPanel />}
    </div>
  )
}
```

**Q3: Next.js 的缓存层级有哪些？**

A: Next.js 有多层缓存机制，从内到外：
- **Request Memoization**：同一请求周期内的重复 fetch 调用会被缓存
- **Data Cache**：fetch 请求的响应会被持久化缓存，可通过 `revalidate` 控制
- **Full Route Cache**：整个路由的 HTML 和 RSC payload 会被缓存
- **Router Cache**：客户端路由缓存，缓存访问过的路由段
- **CDN 缓存**：部署到 Vercel 等平台时的边缘缓存

```tsx
// 缓存控制示例
// 1. 请求级别缓存
fetch('/api/data', { next: { revalidate: 3600 } })

// 2. 路由级别缓存
export const revalidate = 3600

// 3. 标签缓存
fetch('/api/data', { next: { tags: ['posts'] } })
// 手动重新验证
revalidateTag('posts')
```


---

#### 8. Middleware 和 Edge Runtime

**Middleware 基础**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. 重定向
  if (request.nextUrl.pathname === '/old') {
    return NextResponse.redirect(new URL('/new', request.url))
  }

  // 2. 重写
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.rewrite(
      new URL('/api/v2' + request.nextUrl.pathname, request.url)
    )
  }

  // 3. 设置请求头
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'custom-value')

  // 4. 认证检查
  const token = request.cookies.get('token')
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

**Edge Runtime**

```tsx
// app/api/hello/route.ts
export const runtime = 'edge'

export async function GET(request: Request) {
  return new Response(
    JSON.stringify({ message: 'Hello from Edge!' }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
```

**标准回答：**
> Middleware 在请求到达页面之前运行，可以进行认证、重定向、重写等操作。Edge Runtime 提供更快的冷启动和更低的延迟，适合简单的 API 和 Middleware。

**追问点：**

**Q1: Middleware 的执行时机和限制是什么？**

A: Middleware 的执行特点：
- **执行时机**：在请求到达页面或 API 路由之前执行，在服务端渲染之前
- **运行环境**：运行在 Edge Runtime 中，有一些 Node.js API 限制
- **执行顺序**：按照文件系统路径匹配，从根目录开始匹配
- **性能限制**：执行时间有限制，不适合复杂的计算或数据库操作
- **API 限制**：不能使用 Node.js 特定的 API，如 `fs`、`path` 等

```typescript
// ✅ 支持的操作
const response = NextResponse.next()
response.cookies.set('theme', 'dark')
response.headers.set('x-middleware', 'true')

// ❌ 不支持的操作
import fs from 'fs' // 错误：Edge Runtime 不支持
const data = await db.query() // 错误：不建议在 Middleware 中进行数据库操作
```

**Q2: Edge Runtime vs Node.js Runtime 的区别？**

A: 两种运行时的对比：
- **启动速度**：Edge Runtime 冷启动更快（~0ms），Node.js Runtime 较慢（~100ms+）
- **API 支持**：Edge Runtime 支持 Web API，Node.js Runtime 支持完整 Node.js API
- **内存限制**：Edge Runtime 内存限制更严格，Node.js Runtime 内存更充足
- **地理分布**：Edge Runtime 在全球边缘节点运行，Node.js Runtime 在特定区域
- **适用场景**：Edge Runtime 适合简单逻辑，Node.js Runtime 适合复杂应用

**Q3: Middleware 的常见使用场景有哪些？**

A: Middleware 的典型应用场景：
- **身份认证**：检查 JWT token，未登录用户重定向到登录页
- **国际化**：根据用户地理位置或语言偏好重定向到对应语言版本
- **A/B 测试**：根据用户特征分配不同的页面版本
- **速率限制**：限制 API 请求频率，防止滥用
- **安全头设置**：添加 CSP、HSTS 等安全相关的 HTTP 头
- **日志记录**：记录请求信息，用于分析和监控

```typescript
// 实际应用示例：多功能 Middleware
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 1. 安全头
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // 2. 认证检查
  const token = request.cookies.get('auth-token')
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // 3. 国际化
  const locale = request.cookies.get('locale')?.value || 'en'
  if (!request.nextUrl.pathname.startsWith(`/${locale}`)) {
    return NextResponse.redirect(
      new URL(`/${locale}${request.nextUrl.pathname}`, request.url)
    )
  }
  
  return response
}
```

---

#### 9. Metadata 和 SEO 优化

**静态 Metadata**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '我的网站',
  description: '网站描述',
  keywords: ['Next.js', 'React', 'TypeScript'],
  openGraph: {
    title: '我的网站',
    description: '网站描述',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '我的网站',
    description: '网站描述',
    images: ['/twitter-image.jpg'],
  },
}
```

**动态 Metadata**

```tsx
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}
```

**标准回答：**
> Next.js 提供了强大的 Metadata API，支持静态和动态 metadata 生成。通过 generateMetadata 函数可以为每个页面生成个性化的 SEO 标签，包括 Open Graph、Twitter Cards 等社交媒体优化。

**追问点：**

**Q1: Next.js 的 Metadata API 相比传统方式有什么优势？**

A: Metadata API 提供了更好的开发体验和 SEO 效果：
- **类型安全**：TypeScript 支持，避免拼写错误和遗漏字段
- **自动合并**：子页面的 metadata 会与父级 layout 的 metadata 自动合并
- **动态生成**：可以基于路由参数和数据动态生成 metadata
- **重复数据删除**：自动去除重复的 meta 标签
- **流式支持**：支持流式渲染，metadata 可以在数据加载完成后更新
- **社交媒体优化**：内置 Open Graph、Twitter Cards 支持

**Q2: 如何优化 Next.js 应用的 SEO？**

A: Next.js SEO 优化的最佳实践：
- **结构化数据**：使用 JSON-LD 添加结构化数据，帮助搜索引擎理解内容
- **语义化 HTML**：使用正确的 HTML 标签（h1、h2、article、section）
- **图片优化**：使用 Next.js Image 组件，添加 alt 属性
- **内部链接**：使用 Next.js Link 组件，构建良好的内部链接结构
- **网站地图**：生成 sitemap.xml 和 robots.txt
- **页面速度**：利用 SSR/SSG、代码分割、图片优化提升页面速度

```tsx
// 结构化数据示例
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)
  
  return {
    title: post.title,
    description: post.excerpt,
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        author: {
          '@type': 'Person',
          name: post.author.name,
        },
        datePublished: post.publishedAt,
      }),
    },
  }
}
```

**Q3: 如何处理多语言网站的 SEO？**

A: 多语言 SEO 需要考虑以下方面：
- **hreflang 标签**：告诉搜索引擎页面的语言和地区
- **URL 结构**：使用子目录（/en/、/zh/）或子域名（en.example.com）
- **语言切换**：提供清晰的语言切换功能
- **内容本地化**：不仅翻译文本，还要本地化日期、货币、图片等
- **独立 sitemap**：为每种语言生成独立的 sitemap

```tsx
// 多语言 metadata 示例
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPost(slug, locale)
  
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      languages: {
        'en': `/en/blog/${slug}`,
        'zh': `/zh/blog/${slug}`,
        'ja': `/ja/blog/${slug}`,
      },
    },
    openGraph: {
      locale: locale,
      alternateLocale: ['en', 'zh', 'ja'].filter(l => l !== locale),
    },
  }
}
```


---

### 实战场景

#### 10. Next.js 完整示例

**博客应用**

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  params: Promise<{ slug: string }>
}

// 生成静态参数
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

// 生成 Metadata
export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}

// 页面组件
export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <time>{formatDate(post.createdAt)}</time>
      
      <Suspense fallback={<div>Loading image...</div>}>
        <Image
          src={post.coverImage}
          alt={post.title}
          width={1200}
          height={630}
          priority
        />
      </Suspense>

      <div dangerouslySetInnerHTML={{ __html: post.content }} />

      <Suspense fallback={<div>Loading comments...</div>}>
        <Comments postId={post.id} />
      </Suspense>
    </article>
  )
}

// 相关文章组件
async function Comments({ postId }: { postId: string }) {
  const comments = await getComments(postId)
  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>{comment.text}</div>
      ))}
    </div>
  )
}
```

**API 路由**

```typescript
// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const post = await db.post.findUnique({
    where: { id },
    include: { author: true, tags: true }
  })

  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(post)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const post = await db.post.update({
    where: { id },
    data: body
  })

  return NextResponse.json(post)
}
```

**标准回答：**
> Next.js 完整应用包括页面组件、数据获取、Metadata 生成、API 路由等。通过 generateStaticParams 实现 SSG，generateMetadata 优化 SEO，Suspense 实现流式渲染，API 路由提供后端功能。

**追问点：**

**Q1: 如何在 Next.js 中实现错误处理和加载状态？**

A: Next.js 提供了多种错误处理和加载状态的方案：
- **error.tsx**：路由级别的错误边界，捕获页面和子组件的错误
- **loading.tsx**：路由级别的加载状态，在页面加载时显示
- **not-found.tsx**：404 页面，当 `notFound()` 被调用时显示
- **global-error.tsx**：全局错误处理，捕获根布局的错误
- **Suspense**：组件级别的加载状态，配合 async 组件使用

```tsx
// app/blog/error.tsx
'use client'
export default function Error({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}

// app/blog/loading.tsx
export default function Loading() {
  return <div>Loading blog posts...</div>
}

// app/blog/not-found.tsx
export default function NotFound() {
  return <div>Blog post not found</div>
}
```

**Q2: 如何在 Next.js 中处理表单和数据变更？**

A: Next.js 13+ 推荐使用 Server Actions 处理表单：
- **Server Actions**：在服务端执行的函数，可以直接操作数据库
- **表单集成**：通过 `action` 属性直接绑定到表单
- **数据重新验证**：使用 `revalidatePath` 或 `revalidateTag` 更新缓存
- **错误处理**：Server Actions 可以返回错误信息
- **渐进增强**：即使 JavaScript 禁用也能正常工作

```tsx
// app/actions.ts
'use server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  try {
    await db.posts.create({
      data: { title, content }
    })
    revalidatePath('/blog')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to create post' }
  }
}

// app/blog/new/page.tsx
import { createPost } from '@/app/actions'

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" required />
      <textarea name="content" placeholder="Content" required />
      <button type="submit">Create Post</button>
    </form>
  )
}
```

**Q3: 如何优化 Next.js 应用的构建和部署？**

A: Next.js 构建和部署优化策略：
- **分析包大小**：使用 `@next/bundle-analyzer` 分析包大小
- **环境变量**：合理使用环境变量，区分构建时和运行时变量
- **静态导出**：对于纯静态网站，使用 `output: 'export'`
- **增量构建**：利用 Vercel 等平台的增量构建功能
- **缓存优化**：合理配置 CDN 缓存策略
- **监控性能**：使用 Web Vitals 监控实际用户体验

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 包大小分析
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
  },
  
  // 图片优化
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 实验性功能
  experimental: {
    ppr: true, // Partial Prerendering
  },
  
  // 输出配置
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
}

module.exports = nextConfig
```


---

## B. 避坑指南

### 常见错误

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| Hydration mismatch | 服务端和客户端渲染不一致 | 使用 `suppressHydrationWarning` 或确保一致性 |
| 'use client' 滥用 | 不必要的客户端组件 | 只在需要交互的组件使用 |
| fetch 缓存问题 | 默认缓存导致数据不更新 | 使用 `cache: 'no-store'` 或 `revalidate` |
| params 未 await | 直接使用 params 对象 | `const { id } = await params` |
| 动态路由 404 | 未生成静态参数 | 实现 `generateStaticParams` |

### 最佳实践

```typescript
// ✅ 推荐 - Server Component 获取数据
async function Page() {
  const data = await fetch('/api/data')
  return <div>{data}</div>
}

// ❌ 不推荐 - Client Component 获取数据
'use client'
function Page() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/data').then(setData)
  }, [])
  return <div>{data}</div>
}

// ✅ 推荐 - 组合使用
async function Page() {
  const data = await fetchData() // Server Component
  return <InteractiveChart data={data} /> // Client Component
}

// ✅ 推荐 - 错误处理
async function Page() {
  try {
    const data = await fetch('/api/data')
    return <div>{data}</div>
  } catch (error) {
    return <div>Error: {error.message}</div>
  }
}

// ✅ 推荐 - 类型安全
interface Post {
  id: string
  title: string
}

async function Page() {
  const posts = await fetch<Post[]>('/api/posts')
  return <div>{posts[0].title}</div>
}
```

---

## C. 面试技巧

### 1. 回答框架

```
1. 概念定义
   - Next.js 是什么
   - 核心特性

2. 技术细节
   - 渲染模式
   - Server Components
   - 路由系统

3. 实战经验
   - 项目应用
   - 性能优化
   - 问题解决

4. 对比分析
   - vs Nuxt.js
   - vs 纯 React
```

### 2. 加分项

```
✅ 了解 Next.js 13+ App Router
✅ 掌握 Server Components
✅ 熟悉多种渲染模式
✅ 有实际项目经验
✅ 了解性能优化
✅ 掌握 SEO 优化

❌ 只会 Pages Router
❌ 不了解渲染原理
❌ 没有性能意识
❌ 不会错误处理
```

### 3. 高频问题

```
1. Next.js 13+ 相比之前有哪些改进？
2. Server Components 和 Client Components 的区别？
3. 如何选择合适的渲染模式？
4. Next.js 的数据获取方式有哪些？
5. 如何优化 Next.js 应用性能？
6. Next.js 的 SEO 优化方案？
7. Middleware 的使用场景？
8. Next.js vs Nuxt.js 的选择？
```


---

## D. 参考资料

### 官方资源

- [Next.js 官方文档](https://nextjs.org/docs)
- [App Router 文档](https://nextjs.org/docs/app)
- [API 参考](https://nextjs.org/docs/app/api-reference)
- [Next.js 博客](https://nextjs.org/blog)
- [Next.js GitHub](https://github.com/vercel/next.js)

### 学习资源

- [Next.js 入门教程](https://nextjs.org/learn)
- [Next.js 示例](https://github.com/vercel/next.js/tree/canary/examples)
- [Next.js Conf](https://nextjs.org/conf)
- [Vercel 文档](https://vercel.com/docs)

### 常用库

- [@vercel/analytics](https://vercel.com/analytics) - 分析工具
- [next-auth](https://next-auth.js.org/) - 认证
- [next-intl](https://next-intl-docs.vercel.app/) - 国际化
- [next-themes](https://github.com/pacocoursey/next-themes) - 主题切换
- [next-seo](https://github.com/garmeeh/next-seo) - SEO 优化

### 实战项目

- [Next.js Commerce](https://github.com/vercel/commerce) - 电商模板
- [Next.js Blog](https://github.com/vercel/next.js/tree/canary/examples/blog) - 博客模板
- [Next.js Dashboard](https://github.com/vercel/nextjs-dashboard) - 仪表盘模板
- [Taxonomy](https://github.com/shadcn-ui/taxonomy) - 完整应用示例

### 学习路线

```
初级（1-2周）：
- Next.js 基础概念
- 文件系统路由
- 页面和布局
- 数据获取

中级（2-3周）：
- Server Components
- 渲染模式选择
- API Routes
- Middleware
- SEO 优化

高级（3-4周）：
- 性能优化
- 缓存策略
- 流式渲染
- 并行路由
- 部署上线
```

### MCP 查询记录

**查询来源**：Context7 - Next.js 官方文档
**代码示例数量**：2043+
**最新版本**：Next.js 15+
**关键发现**：
- App Router 是 Next.js 13+ 的推荐方式
- Server Components 默认启用，显著减少客户端 JavaScript
- 支持流式渲染和 Suspense
- 内置图片优化和字体优化
- Edge Runtime 提供更快的响应速度
- 灵活的缓存策略（fetch、路由段、全页面）
- 支持并行路由和拦截路由等高级特性
