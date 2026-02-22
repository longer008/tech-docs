# Nuxt.js 面试题集

> Nuxt.js 框架核心知识点与高频面试题
> 
> 更新时间：2025-02

## 目录

[[toc]]

## A. 面试宝典

### 基础题

#### 1. Nuxt.js 的核心特性有哪些？

```
┌─────────────────────────────────────────────────────────────┐
│                    Nuxt.js 核心特性                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性              说明                                      │
│  ──────────────────────────────────────────────────────────│
│  文件系统路由      基于 pages/ 目录自动生成路由             │
│  服务端渲染        SSR/SSG/ISR 多种渲染模式                 │
│  自动导入          组件、组合式函数自动导入                 │
│  数据获取          useFetch、useAsyncData 等工具            │
│  SEO 优化          内置 Meta 标签管理                       │
│  模块系统          丰富的模块生态                           │
│  TypeScript        开箱即用的 TS 支持                       │
│  Nitro 引擎        高性能服务端引擎                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**标准回答：**
> Nuxt.js 是基于 Vue 3 的全栈框架，核心特性包括：文件系统路由、服务端渲染（SSR/SSG/ISR）、自动导入、内置数据获取工具、SEO 优化、模块系统等。它解决了 Vue SPA 的 SEO 问题，提供了优秀的开发体验和性能。

**追问点：**
- Nuxt 2 vs Nuxt 3 的主要区别？
- 为什么选择 Nuxt 而不是纯 Vue？
- Nuxt 的渲染模式有哪些？

---

#### 2. Nuxt 3 vs Nuxt 2

```
┌─────────────────────────────────────────────────────────────┐
│                    Nuxt 3 vs Nuxt 2                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性          Nuxt 2              Nuxt 3    
 更小                     │
│  生态          成熟                快速发展                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**代码对比：**

```vue
<!-- Nuxt 2 -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ count }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script>
export default {
  async asyncData({ $axios }) {
    const data = await $axios.$get('/api/data')
    return { title: data.title }
  },
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>

<!-- Nuxt 3 -->
<template>
  <div>
    <h1>{{ data?.title }}</h1>
    <p>{{ count }}</p>
    <button @click="count++">增加</button>
  </div>
</template>

<script setup>
// 自动导入，无需 import
const { data } = await useFetch('/api/data')
const count = ref(0)
</script>
```

---

#### 3. Nuxt 3 目录结构

```
my-nuxt-app/
├── .nuxt/              # 构建输出（自动生成）
├── .output/            # 生产构建输出
├── assets/             # 需要构建的资源（CSS、图片等）
├── components/         # Vue 组件（自动导入）
├── composables/        # 组合式函数（自动导入）
├── content/            # Nuxt Content 内容
├── layouts/            # 布局组件
├── middleware/         # 路由中间件
├── pages/              # 页面组件（文件系统路由）
├── plugins/            # 插件
├── public/             # 静态资源（不构建）
├── server/             # 服务端代码
│   ├── api/            # API 路由
│   ├── routes/         # 服务端路由
│   └── middleware/     # 服务端中间件
├── utils/              # 工具函数（自动导入）
├── app.vue             # 根组件
├── nuxt.config.ts      # Nuxt 配置
└── package.json
```

**关键目录说明：**

```typescript
// pages/ - 文件系统路由
pages/
├── index.vue           → /
├── about.vue           → /about
├── posts/
│   ├── index.vue       → /posts
│   └── [id].vue        → /posts/:id
└── [...slug].vue       → 捕获所有路由

// components/ - 自动导入
components/
├── TheHeader.vue       → <TheHeader />
├── base/
│   └── Button.vue      → <BaseButton />
└── content/
    └── Card.vue        → <ContentCard />

// composables/ - 自动导入
composables/
├── useAuth.ts          → useAuth()
└── useFetch.ts         → useFetch()

// server/api/ - API 路由
server/api/
├── hello.ts            → /api/hello
└── users/
    └── [id].ts         → /api/users/:id
```

---

#### 4. Nuxt 3 渲染模式

```
┌─────────────────────────────────────────────────────────────┐
│                    Nuxt 3 渲染模式                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  模式              说明                  适用场景            │
│  ──────────────────────────────────────────────────────────│
│  SSR              服务端渲染            动态内容、SEO       │
│  SSG              静态生成              博客、文档          │
│  ISR              增量静态再生成        大型网站            │
│  CSR              客户端渲染            管理后台            │
│  Hybrid           混合渲染              复杂应用            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**配置示例：**

```typescript
// nuxt.config.ts

// 1. 全局 SSR（默认）
export default defineNuxtConfig({
  ssr: true
})

// 2. 全局 SSG
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    prerender: {
      routes: ['/']
    }
  }
})

// 3. 全局 CSR
export default defineNuxtConfig({
  ssr: false
})

// 4. 混合渲染（路由级别）
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },              // SSG
    '/admin/**': { ssr: false },           // CSR
    '/api/**': { cors: true },             // API
    '/blog/**': { swr: 3600 },             // ISR (1小时)
  }
})
```

**页面级别配置：**

```vue
<script setup>
// 禁用 SSR
definePageMeta({
  ssr: false
})
</script>
```

---

**useFetch vs useAsyncData：**

```vue
<script setup>
// useFetch - 简洁，适合简单请求
const { data } = await useFetch('/api/users')

// useAsyncData - 灵活，适合复杂逻辑
const { data } = await useAsyncData('users', async () => {
  const users = await $fetch('/api/users')
  const posts = await $fetch('/api/posts')
  return { users, posts }
})

// 带参数
const route = useRoute()
const { data } = await useFetch(`/api/users/${route.params.id}`)

// 响应式参数
const id = ref(1)
const { data } = await useFetch('/api/users', {
  query: { id }
})

// 请求选项
const { data } = await useFetch('/api/users', {
  method: 'POST',
  body: { name: 'John' },
  headers: {
    'Authorization': 'Bearer token'
  },
  // 仅客户端执行
  server: false,
  // 懒加载
  lazy: true,
  // 立即执行
  immediate: true,
  // 监听变化
  watch: [id]
})
</script>
```

---

### 进阶题

#### 6. Nuxt 3 生命周期

```
┌─────────────────────────────────────────────────────────────┐
│                    Nuxt 3 生命周期                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  服务端（SSR）：                                             │
│  1. Nuxt Plugins                                            │
│  2. Middleware (全局 → 路由)                                │
│  3. Page Setup                                              │
│  4. useFetch/useAsyncData                                   │
│  5. 渲染 HTML                                               │
│                                                              │
│  客户端（Hydration）：                                       │
│  1. 下载 JS                                                 │
│  2. Vue 挂载                                                │
│  3. onMounted                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**生命周期钩子：**

```typescript
// plugins/lifecycle.ts
export default defineNuxtPlugin((nuxtApp) => {
  // 应用创建前
  nuxtApp.hook('app:created', () => {
    console.log('App created')
  })

  // 页面开始渲染
  nuxtApp.hook('page:start', () => {
    console.log('Page start')
  })

  // 页面渲染完成
  nuxtApp.hook('page:finish', () => {
    console.log('Page finish')
  })

  // Vue 错误
  nuxtApp.hook('vue:error', (error) => {
    console.error('Vue error:', error)
  })
})
```

---

#### 7. Nuxt 3 中间件

**中间件类型：**

```typescript
// 1. 全局中间件（自动执行）
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUser()
  
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})

// 2. 命名中间件（手动指定）
// middleware/admin.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUser()
  
  if (!user.value?.isAdmin) {
    return abortNavigation('需要管理员权限')
  }
})

// 使用命名中间件
// pages/admin.vue
<script setup>
definePageMeta({
  middleware: 'admin'
})
</script>

// 3. 内联中间件
<script setup>
definePageMeta({
  middleware: (to, from) => {
    console.log('内联中间件')
  }
})
</script>

// 4. 服务端中间件
// server/middleware/log.ts
export default defineEventHandler((event) => {
  console.log('Request:', event.node.req.url)
})
```

---

#### 8. Nuxt 3 状态管理

**使用 useState（推荐）：**

```typescript
// composables/useCounter.ts
export const useCounter = () => {
  // 跨组件共享状态
  const count = useState('counter', () => 0)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  
  return {
    count: readonly(count),
    increment,
    decrement
  }
}

// 使用
<script setup>
const { count, increment } = useCounter()
</script>
```

**使用 Pinia：**

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isLoggedIn = computed(() => !!user.value)
  
  async function login(credentials) {
    const data = await $fetch('/api/login', {
      method: 'POST',
      body: credentials
    })
    user.value = data.user
  }
  
  function logout() {
    user.value = null
  }
  
  return { user, isLoggedIn, login, logout }
})

// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt']
})
```

---

#### 9. Nuxt 3 SEO 优化

```vue
<script setup>
// 1. useHead - 基础用法
useHead({
  title: '我的页面',
  meta: [
    { name: 'description', content: '页面描述' },
    { property: 'og:title', content: '我的页面' },
    { property: 'og:image', content: '/image.jpg' }
  ],
  link: [
    { rel: 'canonical', href: 'https://example.com/page' }
  ]
})

// 2. useSeoMeta - SEO 专用（推荐）
useSeoMeta({
  title: '我的页面',
  description: '页面描述',
  ogTitle: '我的页面',
  ogDescription: '页面描述',
  ogImage: '/image.jpg',
  twitterCard: 'summary_large_image'
})

// 3. 动态 SEO
const route = useRoute()
const { data: post } = await useFetch(`/api/posts/${route.params.id}`)

useSeoMeta({
  title: post.value?.title,
  description: post.value?.excerpt,
  ogImage: post.value?.image
})

// 4. 全局配置
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      title: '默认标题',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  }
})
</script>
```

---

#### 10. Nuxt 3 性能优化

```typescript
// 1. 代码分割
// 懒加载组件
const LazyComponent = defineAsyncComponent(() => 
  import('~/components/Heavy.vue')
)

// 2. 图片优化
<template>
  <NuxtImg
    src="/image.jpg"
    width="800"
    height="600"
    loading="lazy"
    format="webp"
  />
</template>

// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/image']
})

// 3. 预加载
<template>
  <NuxtLink to="/about" prefetch>关于</NuxtLink>
</template>

// 4. 缓存策略
export default defineNuxtConfig({
  routeRules: {
    '/': { swr: 3600 },           // 1小时缓存
    '/api/**': { cache: false },  // 不缓存
    '/static/**': { static: true } // 静态资源
  }
})

// 5. 减少包体积
export default defineNuxtConfig({
  // Tree shaking
  experimental: {
    treeshakeClientOnly: true
  },
  // 按需导入
  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false
      }
    ]
  }
})

// 6. 服务端缓存
// server/api/users.ts
export default defineCachedEventHandler(async () => {
  const users = await fetchUsers()
  return users
}, {
  maxAge: 60 * 60, // 1小时
  getKey: () => 'users'
})
```

---

### 实战场景

#### 11. Nuxt 3 完整示例

**博客应用：**

```vue
<!-- pages/blog/[slug].vue -->
<script setup>
// 路由参数
const route = useRoute()

// 获取文章数据
const { data: post, error } = await useFetch(`/api/posts/${route.params.slug}`)

// 404 处理
if (!post.value) {
  throw createError({
    statusCode: 404,
    message: '文章不存在'
  })
}

// SEO
useSeoMeta({
  title: post.value.title,
  description: post.value.excerpt,
  ogImage: post.value.coverImage
})

// 面包屑
const breadcrumbs = computed(() => [
  { label: '首页', to: '/' },
  { label: '博客', to: '/blog' },
  { label: post.value.title }
])
</script>

<template>
  <div class="blog-post">
    <!-- 面包屑 -->
    <nav class="breadcrumbs">
      <NuxtLink
        v-for="(item, index) in breadcrumbs"
        :key="index"
        :to="item.to"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>

    <!-- 文章内容 -->
    <article>
      <h1>{{ post.title }}</h1>
      <div class="meta">
        <time>{{ formatDate(post.createdAt) }}</time>
        <span>作者：{{ post.author }}</span>
      </div>
      <NuxtImg
        :src="post.coverImage"
        :alt="post.title"
        width="1200"
        height="630"
      />
      <div class="content" v-html="post.content" />
    </article>

    <!-- 相关文章 -->
    <section class="related">
      <h2>相关文章</h2>
      <div class="grid">
        <BlogCard
          v-for="related in post.related"
          :key="related.id"
          :post="related"
        />
      </div>
    </section>
  </div>
</template>
```

**API 路由：**

```typescript
// server/api/posts/[slug].ts
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  // 从数据库获取
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      tags: true
    }
  })
  
  if (!post) {
    throw createError({
      statusCode: 404,
      message: 'Post not found'
    })
  }
  
  return post
})

// server/api/posts/index.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      ...(query.tag && { tags: { some: { name: query.tag } } })
    },
    orderBy: { createdAt: 'desc' },
    take: Number(query.limit) || 10,
    skip: Number(query.offset) || 0
  })
  
  return posts
})
```

---

## B. 避坑指南

### 常见错误

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| Hydration mismatch | 服务端和客户端渲染不一致 | 使用 `<ClientOnly>` 包裹客户端组件 |
| useState 不共享 | 没有使用唯一 key | `useState('uniqueKey', () => value)` |
| useFetch 重复请求 | 没有使用 key | `useFetch(url, { key: 'uniqueKey' })` |
| 组件未自动导入 | 命名不规范 | 使用 PascalCase 命名 |
| API 路由 404 | 路径错误 | 检查 `server/api/` 目录结构 |

### 最佳实践

```typescript
// ✅ 推荐
const { data } = await useFetch('/api/users', {
  key: 'users',
  transform: (data) => data.map(u => ({ ...u, fullName: `${u.firstName} ${u.lastName}` }))
})

// ❌ 不推荐
const data = await $fetch('/api/users')

// ✅ 推荐 - 错误处理
const { data, error } = await useFetch('/api/users')
if (error.value) {
  showError(error.value)
}

// ❌ 不推荐 - 忽略错误
const { data } = await useFetch('/api/users')

// ✅ 推荐 - 类型安全
interface User {
  id: number
  name: string
}
const { data } = await useFetch<User[]>('/api/users')

// ❌ 不推荐 - 无类型
const { data } = await useFetch('/api/users')
```

---

## C. 面试技巧

### 1. 回答框架

```
1. 概念定义
   - Nuxt.js 是什么
   - 核心特性

2. 技术细节
   - 渲染模式
   - 数据获取
   - 路由系统

3. 实战经验
   - 项目应用
   - 性能优化
   - 问题解决

4. 对比分析
   - vs Next.js
   - vs 纯 Vue
```

### 2. 加分项

```
✅ 了解 Nuxt 3 新特性
✅ 掌握多种渲染模式
✅ 熟悉性能优化
✅ 有实际项目经验
✅ 了解 Nitro 引擎
✅ 掌握 SEO 优化

❌ 只会基础用法
❌ 不了解渲染原理
❌ 没有性能意识
❌ 不会错误处理
```

### 3. 高频问题

```
1. Nuxt 3 相比 Nuxt 2 有哪些改进？
2. 如何选择合适的渲染模式？
3. useFetch 和 useAsyncData 的区别？
4. 如何优化 Nuxt 应用性能？
5. Nuxt 的 SEO 优化方案？
6. 如何处理 Hydration 问题？
7. Nuxt vs Next.js 的选择？
```

---

## D. 参考资料

### 官方资源

- [Nuxt 3 官方文档](https://nuxt.com/)
- [Nuxt 3 示例](https://nuxt.com/docs/examples)
- [Nuxt Modules](https://nuxt.com/modules)
- [Nitro 文档](https://nitro.unjs.io/)

### 学习资源

- [Nuxt 3 入门教程](https://nuxt.com/docs/getting-started)
- [Vue School - Nuxt 3](https://vueschool.io/courses/nuxt-3-fundamentals)
- [Nuxt 3 视频教程](https://www.youtube.com/c/NuxtJS)

### 常用模块

- [@nuxt/image](https://image.nuxt.com/) - 图片优化
- [@nuxt/content](https://content.nuxt.com/) - 内容管理
- [@pinia/nuxt](https://pinia.vuejs.org/ssr/nuxt.html) - 状态管理
- [@nuxtjs/tailwindcss](https://tailwindcss.nuxtjs.org/) - Tailwind CSS
- [@vueuse/nuxt](https://vueuse.org/nuxt/README.html) - VueUse 集成

### 实战项目

- [Nuxt 3 博客模板](https://github.com/nuxt/content/tree/main/examples/blog)
- [Nuxt 3 电商模板](https://github.com/nuxt/examples)
- [Docus](https://github.com/nuxt-themes/docus) - 文档主题

### 学习路线

```
初级（1-2周）：
- Nuxt 3 基础概念
- 文件系统路由
- 数据获取
- 组件开发

中级（2-3周）：
- 渲染模式选择
- 中间件使用
- 状态管理
- SEO 优化

高级（3-4周）：
- 性能优化
- 服务端开发
- 模块开发
- 部署上线
```
