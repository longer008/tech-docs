# Next.js 面试题集

> Next.js 框架核心知识点与高频面试题 (2024-2025)

## A. 面试宝典

### 基础题

#### 1. Next.js 的核心特性有哪些？

| 特性 | 说明 |
|------|------|
| **文件系统路由** | 基于文件夹结构自动生成路由 |
| **多种渲染模式** | SSR/SSG/ISR/CSR 灵活选择 |
| **API Routes** | 内置后端 API 支持 |
| **Image 优化** | 自动图片优化和懒加载 |
| **代码分割** | 自动按路由分割代码 |
| **TypeScript** | 开箱即用的 TS 支持 |
| **Fast Refresh** | 快速热更新 |

**标准回答：**
> Next.js 是基于 React 的全栈框架，核心特性包括：文件系统路由、多种渲染模式（SSR/SSG/ISR）、内置 API Routes、自动代码分割、图片优化等。它解决了 React SPA 的 SEO 问题，同时提供了优秀的开发体验。

---

#### 2. App Router vs Pages Router

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
  return <article>{post.title}</article>;
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'hello' } }],
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.slug);
  return { props: { post } };
}
```

**App Router (Next.js 13+)**
```
app/
├── page.tsx          → /
├── layout.tsx        → 共享布局
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
  params: { slug: string };
}

export default async function BlogPost({ params }: Props) {
  const post = await getPost(params.slug);
  return <article>{post.title}</article>;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

| 特性 | Pages Router | App Router |
|------|-------------|------------|
| 路由定义 | 文件即路由 | 文件夹 + page.tsx |
| 数据获取 | getServerSideProps/getStaticProps | 直接 async 组件 |
| 布局 | 手动实现 | layout.tsx 嵌套 |
| 服务端组件 | 不支持 | 默认支持 |
| 流式渲染 | 不支持 | 支持 |

---

#### 3. SSR/SSG/ISR 的区别

**SSR (Server-Side Rendering)**
```tsx
// App Router - 默认行为或使用 force-dynamic
export const dynamic = 'force-dynamic';

async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store' // 每次请求都获取新数据
  });
  return <div>{data}</div>;
}

// Pages Router
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}
```

**SSG (Static Site Generation)**
```tsx
// App Router - 默认行为
async function Page() {
  const data = await fetch('https://api.example.com/data');
  // 默认会被缓存（SSG）
  return <div>{data}</div>;
}

// Pages Router
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data } };
}
```

**ISR (Incremental Static Regeneration)**
```tsx
// App Router
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 } // 60秒后重新验证
  });
  return <div>{data}</div>;
}

// Pages Router
export async function getStaticProps() {
  const data = await fetchData();
  return {
    props: { data },
    revalidate: 60 // 60秒后重新生成
  };
}
```

| 模式 | 生成时机 | 适用场景 | SEO |
|------|---------|---------|-----|
| SSG | 构建时 | 静态内容、博客 | 优秀 |
| SSR | 请求时 | 个性化内容、实时数据 | 优秀 |
| ISR | 构建时 + 增量更新 | 经常更新的内容 | 优秀 |
| CSR | 客户端 | 交互密集、私有内容 | 较差 |

---

#### 4. Server Components vs Client Components

```tsx
// Server Component (默认)
// app/posts/page.tsx
async function Posts() {
  // 可以直接访问数据库、文件系统等
  const posts = await db.posts.findMany();

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

// Client Component
// app/components/Counter.tsx
'use client'; // 标记为客户端组件

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

**区别对比：**
| 特性 | Server Component | Client Component |
|------|-----------------|------------------|
| 渲染位置 | 服务端 | 客户端 |
| useState/useEffect | 不可用 | 可用 |
| 浏览器 API | 不可用 | 可用 |
| 事件处理 | 不可用 | 可用 |
| 数据获取 | 直接 async/await | useEffect 或 SWR |
| 包含在 JS Bundle | 否 | 是 |

**组合使用：**
```tsx
// Server Component 包含 Client Component
async function Page() {
  const data = await fetchData(); // 服务端获取数据

  return (
    <div>
      <h1>{data.title}</h1>
      {/* 将数据传递给客户端组件 */}
      <InteractiveChart data={data.chartData} />
    </div>
  );
}
```

---

#### 5. Next.js 数据获取方式

**App Router 数据获取：**
```tsx
// 1. 服务端组件直接获取
async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data}</div>;
}

// 2. 并行数据获取
async function Page() {
  // 并行请求
  const [users, posts] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json())
  ]);

  return (
    <div>
      <UserList users={users} />
      <PostList posts={posts} />
    </div>
  );
}

// 3. 使用 React Cache
import { cache } from 'react';

const getUser = cache(async (id: string) => {
  const user = await db.user.findUnique({ where: { id } });
  return user;
});

// 4. 使用 Server Actions
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  await db.posts.create({ data: { title } });
  revalidatePath('/posts');
}
```

---

### 进阶/场景题

#### 1. Next.js 性能优化策略

```tsx
// 1. Image 组件优化
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  priority // 首屏图片优先加载
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>

// 2. 动态导入
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false // 禁用服务端渲染
});

// 3. 路由预加载
import Link from 'next/link';

<Link href="/about" prefetch={true}>About</Link>

// 4. 流式渲染 + Suspense
import { Suspense } from 'react';

async function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}

// 5. 并行路由和拦截路由
// app/@modal/(.)photo/[id]/page.tsx - 拦截路由
// app/layout.tsx
export default function Layout({ children, modal }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
```

---

#### 2. Middleware 和 Edge Runtime

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. 重定向
  if (request.nextUrl.pathname === '/old') {
    return NextResponse.redirect(new URL('/new', request.url));
  }

  // 2. 重写
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.rewrite(new URL('/api/v2' + request.nextUrl.pathname, request.url));
  }

  // 3. 设置请求头
  const response = NextResponse.next();
  response.headers.set('x-custom-header', 'custom-value');

  // 4. 认证检查
  const token = request.cookies.get('token');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**Edge Runtime：**
```tsx
// app/api/hello/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  return new Response(JSON.stringify({ message: 'Hello from Edge!' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "Next.js 只能做 SSR" | 支持 SSR/SSG/ISR/CSR 多种模式 |
| "App Router 完全取代 Pages Router" | 两者可以共存，Pages Router 仍然支持 |
| "Server Component 不能有交互" | 可以包含 Client Component 实现交互 |
| "getServerSideProps 每次都查数据库" | 可以加缓存层优化 |
| "ISR 只能在 Vercel 使用" | 自托管也支持，需要正确配置 |

---

## B. 实战文档

### 速查链接

| 资源 | 链接 |
|------|------|
| Next.js 官方文档 | https://nextjs.org/docs |
| App Router 文档 | https://nextjs.org/docs/app |
| API 参考 | https://nextjs.org/docs/app/api-reference |

### 项目结构模板

```
my-app/
├── app/
│   ├── (auth)/           # 路由组
│   │   ├── login/
│   │   └── register/
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── dashboard/
│   ├── api/
│   │   └── [...route]/
│   ├── layout.tsx        # 根布局
│   ├── loading.tsx       # 全局加载
│   ├── error.tsx         # 全局错误
│   └── not-found.tsx     # 404 页面
├── components/
│   ├── ui/               # UI 组件
│   └── features/         # 功能组件
├── lib/
│   ├── db.ts             # 数据库
│   └── utils.ts          # 工具函数
├── public/
├── next.config.js
└── middleware.ts
```
