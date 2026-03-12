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

**Q1: Nuxt 2 vs Nuxt 3 的主要区别？**

A: Nuxt 3 是基于 Vue 3 的重大升级，主要区别：
- **Vue 版本**：Nuxt 3 基于 Vue 3（Composition API、更好的 TypeScript 支持），Nuxt 2 基于 Vue 2
- **构建工具**：Nuxt 3 使用 Vite（开发更快）+ Webpack 5，Nuxt 2 使用 Webpack 4
- **服务端引擎**：Nuxt 3 使用 Nitro（更快的冷启动、边缘部署），Nuxt 2 使用传统 Node.js
- **自动导入**：Nuxt 3 支持组件、composables、工具函数自动导入，Nuxt 2 需要手动导入
- **TypeScript**：Nuxt 3 原生 TypeScript 支持，类型推断更好
- **性能**：Nuxt 3 更小的包体积、更快的 HMR、更好的 Tree Shaking

**Q2: 为什么选择 Nuxt 而不是纯 Vue？**

A: Nuxt 解决了纯 Vue SPA 的核心问题：
- **SEO 优化**：服务端渲染让搜索引擎可以抓取完整内容，提升 SEO 效果
- **首屏性能**：SSR/SSG 提供更快的首屏加载（FCP < 1.5s），改善用户体验
- **开发效率**：文件系统路由、自动导入、内置状态管理，减少配置工作
- **全栈能力**：server/ 目录支持 API 开发，一个项目搞定前后端
- **部署灵活**：支持静态部署、Serverless、边缘计算等多种部署方式
- **生态丰富**：Nuxt 模块生态（@nuxtjs/tailwindcss、@pinia/nuxt 等）开箱即用

**Q3: Nuxt 的渲染模式有哪些？**

A: Nuxt 3 支持多种渲染模式，可以按页面配置：
- **SSR（服务端渲染）**：每次请求时服务器生成 HTML，适合动态内容（用户个人页面）
- **SSG（静态生成）**：构建时预生成所有页面，适合内容相对固定的网站（博客、文档）
- **ISR（增量静态再生）**：结合 SSG 和 SSR，定期重新生成页面，平衡性能和实时性
- **SPA（单页应用）**：客户端渲染，适合不需要 SEO 的应用（后台管理系统）
- **Hybrid（混合渲染）**：不同页面使用不同渲染模式，灵活配置

```javascript
// nuxt.config.ts - 混合渲染配置
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt'] // SSG
    }
  },
  routeRules: {
    '/': { prerender: true }, // SSG
    '/admin/**': { ssr: false }, // SPA
    '/blog/**': { isr: 3600 }, // ISR (1小时)
    '/api/**': { cors: true } // API 路由
  }
})
```
- Nuxt 的渲染模式有哪些？

---

#### 2. Nuxt 3 vs Nuxt 2

```
┌─────────────────────────────────────────────────────────────┐
│                    Nuxt 3 vs Nuxt 2                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性          Nuxt 2              Nuxt 3                   │
│  ──────────────────────────────────────────────────────────│
│  Vue 版本      Vue 2               Vue 3                    │
│  构建工具      Webpack 4           Vite + Webpack 5         │
│  服务端引擎    传统 Node.js        Nitro                    │
│  自动导入      手动导入            自动导入                 │
│  TypeScript    需要配置            原生支持                 │
│  包体积        较大                更小                     │
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

**标准回答：**
> Nuxt 3 相比 Nuxt 2 有重大升级：基于 Vue 3、使用 Vite 构建、Nitro 服务端引擎、自动导入、原生 TypeScript 支持等。开发体验和性能都有显著提升。

**追问点：**

**Q1: Nuxt 3 的自动导入机制是如何工作的？**

A: Nuxt 3 的自动导入基于文件约定和静态分析：
- **组件自动导入**：`components/` 目录下的组件无需手动导入，直接使用 `<ComponentName />`
- **Composables 自动导入**：`composables/` 目录下的函数自动导入，如 `useAuth()`
- **工具函数自动导入**：`utils/` 目录下的工具函数自动导入
- **Vue API 自动导入**：`ref`、`computed`、`watch` 等 Vue API 无需导入
- **Nuxt API 自动导入**：`useFetch`、`navigateTo` 等 Nuxt API 自动可用
- **构建时优化**：只导入实际使用的代码，支持 Tree Shaking

**Q2: Nitro 引擎相比传统 Node.js 有什么优势？**

A: Nitro 是 Nuxt 3 的服务端引擎，带来多项优势：
- **更快的冷启动**：优化的启动流程，冷启动时间从秒级降到毫秒级
- **边缘部署支持**：可以部署到 Vercel Edge、Cloudflare Workers 等边缘环境
- **多平台支持**：支持 Node.js、Deno、Bun 等多种运行时
- **自动优化**：自动代码分割、Tree Shaking、压缩
- **内置缓存**：智能缓存机制，提升响应速度
- **零配置部署**：支持多种部署平台，无需额外配置

**Q3: 从 Nuxt 2 迁移到 Nuxt 3 的主要挑战是什么？**

A: 迁移 Nuxt 3 需要考虑以下挑战：
- **Vue 2 → Vue 3**：需要适应 Composition API、响应式系统变化
- **数据获取方式**：`asyncData`、`fetch` → `useFetch`、`useAsyncData`
- **模块兼容性**：部分 Nuxt 2 模块可能不兼容，需要寻找替代方案
- **配置文件变化**：`nuxt.config.js` → `nuxt.config.ts`，配置项有变化
- **目录结构调整**：某些目录约定有变化，如 `static/` → `public/`
- **TypeScript 迁移**：虽然支持更好，但需要添加类型定义

```javascript
// 迁移示例：数据获取
// Nuxt 2
export default {
  async asyncData({ $axios, params }) {
    const post = await $axios.$get(`/api/posts/${params.id}`)
    return { post }
  }
}

// Nuxt 3
<script setup>
const route = useRoute()
const { data: post } = await useFetch(`/api/posts/${route.params.id}`)
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

**标准回答：**
> Nuxt 3 支持多种渲染模式：SSR（服务端渲染）、SSG（静态生成）、ISR（增量静态再生）、CSR（客户端渲染）、Hybrid（混合渲染）。可以全局配置或按路由配置，灵活适应不同场景需求。

**追问点：**

**Q1: Nuxt 3 的混合渲染（Hybrid）有什么优势？**

A: 混合渲染让不同页面使用最适合的渲染模式：
- **灵活配置**：首页用 SSG（快速加载）、用户页面用 SSR（动态内容）、管理后台用 CSR（交互密集）
- **性能优化**：静态页面享受 CDN 缓存，动态页面保持实时性
- **开发效率**：一个项目中混合使用，无需拆分多个应用
- **SEO 友好**：重要页面用 SSR/SSG 保证 SEO，私有页面用 CSR 减少服务器压力
- **成本控制**：静态页面减少服务器负载，动态页面按需渲染

```typescript
// 实际应用示例
export default defineNuxtConfig({
  routeRules: {
    // 首页 - 静态生成，CDN 缓存
    '/': { prerender: true },
    // 产品列表 - ISR，1小时更新
    '/products/**': { swr: 3600 },
    // 用户个人页面 - SSR，实时数据
    '/profile/**': { ssr: true },
    // 管理后台 - CSR，减少服务器负载
    '/admin/**': { ssr: false },
    // API 路由 - 服务端处理
    '/api/**': { cors: true, headers: { 'cache-control': 's-maxage=60' } }
  }
})
```

**Q2: ISR（增量静态再生）的工作原理是什么？**

A: ISR 结合了 SSG 和 SSR 的优势：
- **初始构建**：构建时生成静态页面，部署到 CDN
- **缓存策略**：设置缓存时间（如 1 小时），在缓存期内返回静态页面
- **后台重新生成**：缓存过期后，第一个请求触发后台重新生成
- **无缝更新**：重新生成期间仍返回旧页面，生成完成后更新缓存
- **按需更新**：只有被访问的页面才会重新生成，节省资源

```typescript
// ISR 配置示例
export default defineNuxtConfig({
  routeRules: {
    // 博客文章 - 1小时 ISR
    '/blog/**': { swr: 3600 },
    // 产品页面 - 30分钟 ISR
    '/products/**': { swr: 1800 },
    // 新闻页面 - 5分钟 ISR
    '/news/**': { swr: 300 }
  }
})
```

**Q3: 如何选择合适的渲染模式？**

A: 选择渲染模式的决策依据：
- **内容更新频率**：静态内容选 SSG，动态内容选 SSR，定期更新选 ISR
- **SEO 重要性**：重要页面选 SSR/SSG/ISR，私有页面可选 CSR
- **用户个性化**：高度个性化选 SSR，通用内容选 SSG
- **服务器成本**：预算有限选 SSG/ISR，充足选 SSR
- **访问量**：高访问量选 SSG/ISR 减少服务器压力
- **交互复杂度**：交互密集的管理后台选 CSR

```typescript
// 决策树示例
const renderingStrategy = {
  // 营销页面：SEO 重要 + 内容相对固定
  marketing: 'SSG',
  // 博客：SEO 重要 + 定期更新
  blog: 'ISR',
  // 用户个人页面：个性化 + 实时数据
  profile: 'SSR',
  // 管理后台：交互密集 + 不需要 SEO
  admin: 'CSR',
  // 产品页面：SEO 重要 + 库存变化
  products: 'ISR'
}
```

---

#### 5. Nuxt 3 数据获取

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

**标准回答：**
> Nuxt 3 提供了 useFetch 和 useAsyncData 两个数据获取工具。useFetch 适合简单的 API 请求，useAsyncData 适合复杂的数据处理逻辑。两者都支持 SSR、缓存、响应式参数等特性。

**追问点：**

**Q1: useFetch 和 useAsyncData 的核心区别是什么？**

A: 两者的主要区别在于使用场景和灵活性：
- **useFetch**：内置 $fetch，适合直接的 HTTP 请求，语法简洁
- **useAsyncData**：需要自定义 fetcher 函数，适合复杂数据处理、多个请求组合
- **缓存键**：useFetch 自动生成缓存键，useAsyncData 需要手动指定
- **类型推断**：useFetch 基于 URL 自动推断类型，useAsyncData 基于返回值推断
- **错误处理**：两者都支持，但 useAsyncData 在复杂场景下更灵活

```vue
<script setup>
// useFetch - 简单场景
const { data: users } = await useFetch('/api/users')

// useAsyncData - 复杂场景
const { data: dashboard } = await useAsyncData('dashboard', async () => {
  const [users, posts, stats] = await Promise.all([
    $fetch('/api/users'),
    $fetch('/api/posts'),
    $fetch('/api/stats')
  ])
  return { users, posts, stats, total: users.length + posts.length }
})
</script>
```

**Q2: Nuxt 3 数据获取的缓存机制是如何工作的？**

A: Nuxt 3 的数据缓存分为多个层级：
- **请求去重**：同一个请求在同一次渲染中只执行一次
- **服务端缓存**：服务端渲染时的数据会传递给客户端，避免重复请求
- **客户端缓存**：基于缓存键缓存数据，页面切换时复用
- **响应式缓存**：参数变化时自动重新请求
- **手动控制**：可以通过 `refresh()`、`clear()` 手动控制缓存

```vue
<script setup>
// 缓存控制示例
const { data, refresh, clear, pending } = await useFetch('/api/users', {
  // 自定义缓存键
  key: 'users-list',
  // 缓存时间（客户端）
  default: () => [],
  // 服务端缓存
  server: true,
  // 懒加载（不阻塞页面渲染）
  lazy: true
})

// 手动刷新数据
const handleRefresh = () => refresh()

// 清除缓存
const handleClear = () => clear()
</script>
```

**Q3: 如何处理数据获取的错误和加载状态？**

A: Nuxt 3 提供了完整的状态管理：
- **pending**：加载状态，用于显示 loading 效果
- **error**：错误状态，包含错误信息
- **refresh**：重新请求函数
- **status**：请求状态（idle、pending、success、error）
- **错误边界**：可以配合 Vue 的错误边界处理

```vue
<template>
  <div>
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">
      错误：{{ error.message }}
      <button @click="refresh()">重试</button>
    </div>
    <div v-else>
      <div v-for="user in data" :key="user.id">
        {{ user.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
const { data, pending, error, refresh } = await useFetch('/api/users', {
  // 默认值，避免 undefined
  default: () => [],
  // 错误处理
  onResponseError({ response }) {
    console.error('请求失败:', response.status)
  },
  // 重试配置
  retry: 3,
  retryDelay: 1000
})

// 监听错误
watch(error, (newError) => {
  if (newError) {
    // 错误上报或用户提示
    console.error('数据获取失败:', newError)
  }
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

**标准回答：**
> Nuxt 3 支持多种中间件：全局中间件（自动执行）、命名中间件（手动指定）、内联中间件（页面内定义）、服务端中间件（API 层面）。用于处理路由守卫、权限验证、日志记录等。

**追问点：**

**Q1: 路由中间件和服务端中间件的区别是什么？**

A: 两种中间件运行在不同的层面：
- **路由中间件**：运行在客户端和服务端的页面渲染前，用于路由守卫、权限验证、重定向
- **服务端中间件**：只运行在服务端，处理所有 HTTP 请求（包括 API），用于日志、CORS、请求预处理
- **执行时机**：服务端中间件先执行，然后是路由中间件
- **访问能力**：路由中间件可以访问 Vue 组合式函数，服务端中间件只能访问原生 HTTP 对象
- **使用场景**：路由中间件处理页面逻辑，服务端中间件处理请求逻辑

```typescript
// 路由中间件 - 页面级别
export default defineNuxtRouteMiddleware((to, from) => {
  // 可以使用 Nuxt 组合式函数
  const user = useUser()
  const router = useRouter()
  
  if (!user.value) {
    return navigateTo('/login')
  }
})

// 服务端中间件 - 请求级别
export default defineEventHandler(async (event) => {
  // 只能访问原生 HTTP 对象
  const url = getRequestURL(event)
  const headers = getHeaders(event)
  
  console.log(`${event.node.req.method} ${url.pathname}`)
  
  // 设置 CORS
  if (event.node.req.method === 'OPTIONS') {
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE'
    })
    return ''
  }
})
```

**Q2: 中间件的执行顺序是怎样的？**

A: Nuxt 3 中间件按照特定顺序执行：
- **服务端中间件**：最先执行，按文件名字母顺序
- **全局路由中间件**：按文件名字母顺序执行（.global.ts 后缀）
- **页面中间件**：按 definePageMeta 中定义的顺序执行
- **内联中间件**：最后执行

```typescript
// 执行顺序示例
// 1. server/middleware/01.cors.ts
export default defineEventHandler((event) => {
  console.log('1. 服务端中间件 - CORS')
})

// 2. middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  console.log('2. 全局中间件 - 认证')
})

// 3. middleware/admin.ts
export default defineNuxtRouteMiddleware((to, from) => {
  console.log('3. 命名中间件 - 管理员')
})

// 4. pages/admin/users.vue
<script setup>
definePageMeta({
  middleware: ['admin', (to, from) => {
    console.log('4. 内联中间件')
  }]
})
</script>
```

**Q3: 如何在中间件中处理异步操作和错误？**

A: 中间件支持异步操作和完善的错误处理：
- **异步中间件**：可以使用 async/await 处理异步逻辑
- **错误处理**：使用 `throw createError()` 抛出错误
- **条件导航**：使用 `navigateTo()`、`abortNavigation()` 控制导航
- **数据预取**：可以在中间件中预取数据

```typescript
// 异步中间件示例
export default defineNuxtRouteMiddleware(async (to, from) => {
  try {
    // 异步验证用户权限
    const user = await $fetch('/api/user/current')
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '未登录'
      })
    }
    
    // 检查页面权限
    if (to.path.startsWith('/admin') && !user.isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: '权限不足'
      })
    }
    
    // 预取页面数据
    if (to.path === '/dashboard') {
      await $fetch('/api/dashboard/preload')
    }
    
  } catch (error) {
    // 错误处理
    if (error.statusCode === 401) {
      return navigateTo('/login')
    }
    
    // 其他错误继续抛出
    throw error
  }
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

**标准回答：**
> Nuxt 3 推荐使用 useState 进行简单的状态管理，复杂场景可以使用 Pinia。useState 提供了 SSR 友好的响应式状态，支持服务端和客户端状态同步。

**追问点：**

**Q1: useState 和 Pinia 的选择标准是什么？**

A: 选择依据主要看状态复杂度和使用场景：
- **useState 适用场景**：简单的全局状态（用户信息、主题、语言）、跨组件通信、SSR 友好的状态
- **Pinia 适用场景**：复杂的业务逻辑、需要 actions 和 getters、状态持久化、开发工具支持
- **性能考虑**：useState 更轻量，Pinia 功能更丰富但体积稍大
- **开发体验**：Pinia 有更好的 TypeScript 支持和开发工具
- **迁移成本**：从 Vuex 迁移到 Pinia 更容易

```typescript
// useState - 简单状态
const theme = useState('theme', () => 'light')
const user = useState('user', () => null)

// Pinia - 复杂状态
export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const total = computed(() => 
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )
  
  function addItem(product) {
    const existingItem = items.value.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }
  
  function removeItem(id) {
    const index = items.value.findIndex(item => item.id === id)
    if (index > -1) items.value.splice(index, 1)
  }
  
  return { items, total, addItem, removeItem }
})
```

**Q2: useState 的 SSR 同步机制是如何工作的？**

A: useState 通过特殊的序列化机制实现 SSR 状态同步：
- **服务端渲染**：useState 在服务端创建状态，参与页面渲染
- **状态序列化**：服务端状态被序列化到 HTML 中的 `__NUXT__` 对象
- **客户端水合**：客户端从 `__NUXT__` 对象恢复状态，保持一致性
- **响应式恢复**：状态恢复后立即变为响应式，支持后续更新
- **键值管理**：通过唯一键值避免状态冲突

```typescript
// SSR 状态同步示例
// 服务端执行
const user = useState('user', () => ({ name: 'John', id: 1 }))

// HTML 中会包含：
// <script>window.__NUXT__={state:{"user":{"name":"John","id":1}}}</script>

// 客户端水合时自动恢复状态
// 无需额外代码，状态自动同步
```

**Q3: 如何处理状态的持久化和缓存？**

A: Nuxt 3 提供多种状态持久化方案：
- **sessionStorage/localStorage**：使用 `useLocalStorage` 等工具
- **Cookie**：使用 `useCookie` 实现跨请求持久化
- **服务端缓存**：结合 `useFetch` 的缓存机制
- **Pinia 插件**：使用 `pinia-plugin-persistedstate` 自动持久化

```typescript
// Cookie 持久化
const theme = useCookie('theme', {
  default: () => 'light',
  serialize: JSON.stringify,
  deserialize: JSON.parse
})

// localStorage 持久化（仅客户端）
const preferences = useLocalStorage('preferences', {
  language: 'zh-CN',
  notifications: true
})

// Pinia 持久化
export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(null)
  
  return { user, token }
}, {
  persist: {
    storage: persistedState.localStorage,
    paths: ['token'] // 只持久化 token
  }
})

// 复杂状态管理
const useAppState = () => {
  // 内存状态（不持久化）
  const loading = useState('loading', () => false)
  
  // Cookie 状态（跨请求）
  const theme = useCookie('theme', () => 'light')
  
  // localStorage 状态（客户端持久化）
  const settings = process.client 
    ? useLocalStorage('settings', () => ({}))
    : ref({})
  
  return { loading, theme, settings }
}
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

**标准回答：**
> Nuxt 3 提供了强大的 SEO 优化工具：useHead 用于基础头部管理，useSeoMeta 专门用于 SEO 标签，支持动态生成和全局配置。内置 SSR 确保搜索引擎可以抓取完整内容。

**追问点：**

**Q1: useHead 和 useSeoMeta 的区别和使用场景？**

A: 两者功能相似但侧重点不同：
- **useHead**：通用的头部管理，支持任意 HTML 头部元素（title、meta、link、script、style）
- **useSeoMeta**：专门用于 SEO 相关的 meta 标签，提供更好的类型提示和简化的 API
- **类型安全**：useSeoMeta 有更好的 TypeScript 支持，减少拼写错误
- **API 简化**：useSeoMeta 使用驼峰命名，更符合 JavaScript 习惯
- **性能优化**：useSeoMeta 内部优化了 SEO 标签的处理

```vue
<script setup>
// useHead - 通用场景
useHead({
  title: '我的页面',
  meta: [
    { name: 'description', content: '页面描述' },
    { property: 'og:title', content: '我的页面' }
  ],
  link: [
    { rel: 'stylesheet', href: '/custom.css' }
  ],
  script: [
    { src: '/analytics.js', async: true }
  ]
})

// useSeoMeta - SEO 专用（推荐）
useSeoMeta({
  title: '我的页面',
  description: '页面描述',
  ogTitle: '我的页面',        // 自动转换为 og:title
  ogDescription: '页面描述',   // 自动转换为 og:description
  twitterCard: 'summary_large_image'
})
</script>
```

**Q2: 如何实现动态 SEO 和结构化数据？**

A: Nuxt 3 支持基于数据的动态 SEO 优化：
- **动态标题和描述**：基于页面数据动态生成 SEO 标签
- **结构化数据**：使用 JSON-LD 格式添加结构化数据
- **Open Graph 图片**：动态生成社交媒体分享图片
- **面包屑导航**：自动生成面包屑结构化数据
- **多语言 SEO**：支持 hreflang 标签

```vue
<script setup>
// 动态 SEO 示例
const route = useRoute()
const { data: article } = await useFetch(`/api/articles/${route.params.slug}`)

// 动态 SEO 标签
useSeoMeta({
  title: `${article.value?.title} - 我的博客`,
  description: article.value?.excerpt,
  ogTitle: article.value?.title,
  ogDescription: article.value?.excerpt,
  ogImage: article.value?.coverImage,
  ogUrl: `https://myblog.com/articles/${route.params.slug}`,
  twitterCard: 'summary_large_image'
})

// 结构化数据
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.value?.title,
        description: article.value?.excerpt,
        image: article.value?.coverImage,
        author: {
          '@type': 'Person',
          name: article.value?.author.name
        },
        datePublished: article.value?.publishedAt,
        dateModified: article.value?.updatedAt
      })
    }
  ]
})
</script>
```

**Q3: 如何优化 Nuxt 应用的 Core Web Vitals？**

A: Nuxt 3 内置了多项性能优化，有助于改善 Core Web Vitals：
- **LCP 优化**：使用 SSR/SSG 快速渲染首屏，`<NuxtImg>` 组件优化图片加载
- **FID 优化**：代码分割减少 JavaScript 包大小，懒加载非关键组件
- **CLS 优化**：为图片设置尺寸属性，使用骨架屏避免布局偏移
- **TTFB 优化**：Nitro 引擎提供更快的服务端响应，边缘部署减少延迟
- **性能监控**：使用 `@nuxtjs/web-vitals` 模块监控实际性能

```vue
<template>
  <!-- LCP 优化：优先加载首屏图片 -->
  <NuxtImg
    src="/hero.jpg"
    alt="Hero Image"
    width="1200"
    height="600"
    priority
    placeholder
  />
  
  <!-- CLS 优化：设置图片尺寸 -->
  <NuxtImg
    src="/content.jpg"
    width="800"
    height="400"
    loading="lazy"
  />
  
  <!-- FID 优化：懒加载重型组件 -->
  <LazyHeavyComponent v-if="showComponent" />
</template>

<script setup>
// 性能优化配置
// nuxt.config.ts
export default defineNuxtConfig({
  // 图片优化
  image: {
    formats: ['webp', 'avif'],
    quality: 80
  },
  
  // 字体优化
  googleFonts: {
    display: 'swap',
    preload: true
  },
  
  // 性能监控
  modules: ['@nuxtjs/web-vitals'],
  
  // 预加载策略
  experimental: {
    payloadExtraction: false, // 减少 payload 大小
    inlineSSRStyles: false    // 避免内联样式导致的 CLS
  }
})

// 懒加载组件
const LazyHeavyComponent = defineAsyncComponent(() => 
  import('~/components/HeavyComponent.vue')
)
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

**标准回答：**
> Nuxt 3 性能优化包括代码分割、图片优化、预加载、缓存策略、包体积优化等。通过 NuxtImg 组件、懒加载、路由缓存、服务端缓存等技术，可以显著提升应用性能。

**追问点：**

**Q1: Nuxt 3 的缓存层级有哪些？**

A: Nuxt 3 提供了多层缓存机制：
- **浏览器缓存**：HTTP 缓存头控制静态资源缓存
- **CDN 缓存**：边缘节点缓存静态内容和 API 响应
- **路由缓存**：`routeRules` 配置页面级缓存（SWR、静态生成）
- **服务端缓存**：`defineCachedEventHandler` 缓存 API 响应
- **数据缓存**：`useFetch` 和 `useAsyncData` 的客户端缓存
- **Nitro 缓存**：内置的智能缓存机制

```typescript
// 多层缓存配置示例
export default defineNuxtConfig({
  // 路由级缓存
  routeRules: {
    '/': { prerender: true },                    // 静态生成
    '/blog/**': { swr: 3600 },                  // 1小时 SWR
    '/api/posts': { cache: { maxAge: 300 } },   // 5分钟缓存
    '/admin/**': { ssr: false, cache: false }   // 不缓存
  },
  
  // Nitro 缓存配置
  nitro: {
    storage: {
      redis: {
        driver: 'redis',
        // Redis 配置
      }
    }
  }
})

// 服务端 API 缓存
export default defineCachedEventHandler(async (event) => {
  const posts = await fetchPosts()
  return posts
}, {
  maxAge: 60 * 10, // 10分钟
  getKey: (event) => `posts:${getQuery(event).page || 1}`,
  varies: ['Accept-Language'] // 根据语言缓存
})
```

**Q2: 如何优化 Nuxt 3 应用的首屏加载速度？**

A: 首屏优化的关键策略：
- **渲染模式选择**：首页使用 SSG 或 SSR，减少客户端渲染时间
- **关键资源优先级**：使用 `priority` 属性优先加载首屏图片
- **代码分割**：懒加载非首屏组件，减少初始 JavaScript 包大小
- **预加载策略**：预加载关键路由和资源
- **字体优化**：使用 `font-display: swap` 避免字体阻塞渲染
- **CSS 优化**：内联关键 CSS，异步加载非关键样式

```vue
<template>
  <!-- 首屏图片优先加载 -->
  <NuxtImg
    src="/hero.jpg"
    alt="Hero"
    width="1200"
    height="600"
    priority
    placeholder="blur"
  />
  
  <!-- 非首屏组件懒加载 -->
  <LazyTestimonials />
  <LazyNewsletter />
</template>

<script setup>
// 预加载关键路由
const router = useRouter()
onMounted(() => {
  router.prefetch('/products')
  router.prefetch('/about')
})

// 懒加载组件
const LazyTestimonials = defineAsyncComponent(() => 
  import('~/components/Testimonials.vue')
)
const LazyNewsletter = defineAsyncComponent(() => 
  import('~/components/Newsletter.vue')
)

// 页面级优化
definePageMeta({
  // 预加载关键数据
  key: route => route.fullPath
})
</script>

<style>
/* 关键 CSS 内联 */
.hero {
  height: 100vh;
  display: flex;
  align-items: center;
}

/* 非关键 CSS 异步加载 */
@import url('/css/non-critical.css') layer(non-critical);
</style>
```

**Q3: 如何监控和分析 Nuxt 3 应用的性能？**

A: Nuxt 3 提供了多种性能监控方案：
- **Web Vitals 监控**：使用 `@nuxtjs/web-vitals` 监控核心性能指标
- **Lighthouse CI**：集成到 CI/CD 流程中自动化性能测试
- **Bundle 分析**：使用 `@nuxt/devtools` 分析包大小和依赖
- **服务端监控**：监控 API 响应时间和错误率
- **真实用户监控**：收集实际用户的性能数据

```typescript
// nuxt.config.ts - 性能监控配置
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/web-vitals',
    '@nuxt/devtools'
  ],
  
  // Web Vitals 配置
  webVitals: {
    provider: 'ga', // Google Analytics
    debug: process.env.NODE_ENV === 'development',
    disabled: false
  },
  
  // 开发工具
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },
  
  // 性能预算
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            ui: ['@headlessui/vue', '@heroicons/vue']
          }
        }
      }
    }
  }
})

// 自定义性能监控
// plugins/performance.client.ts
export default defineNuxtPlugin(() => {
  // 监控页面加载时间
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        console.log('页面加载时间:', entry.loadEventEnd - entry.fetchStart)
      }
    }
  })
  
  observer.observe({ entryTypes: ['navigation'] })
  
  // 监控 Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log)
    getFID(console.log)
    getFCP(console.log)
    getLCP(console.log)
    getTTFB(console.log)
  })
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
