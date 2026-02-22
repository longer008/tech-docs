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
- Next.js 13+ App Router vs Pages Router 的区别？
- 为什么选择 Next.js 而不是纯 React？
- Next.js 的渲染模式有哪些？


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
