# Vue.js

> 渐进式 JavaScript 框架，易学易用，性能出色，适用场景丰富

**更新时间**: 2025-02

## 📋 目录

- [元信息](#元信息)
- [核心概念](#核心概念)
- [面试宝典](#面试宝典)
- [实战文档](#实战文档)
- [学习资源](#学习资源)

## 📋 元信息

- **定位**: 渐进式前端框架，适用于 SPA、SSR 与复杂前端应用
- **适用场景**: 单页应用、服务端渲染、静态站点生成、移动端混合应用
- **版本范围**: Vue 3.x（本文档基于 Vue 3.4+，向下兼容 Vue 3.0+）
- **相关生态**: Vue Router 4、Pinia、Vite、Nuxt 3、VueUse
- **官方文档**: [https://vuejs.org/](https://vuejs.org/) | [中文文档](https://cn.vuejs.org/)

## 🎯 核心概念

### 1. 响应式系统

Vue 3 使用 Proxy 实现响应式，相比 Vue 2 的 Object.defineProperty 更强大。

**ref - 基本类型响应式**：
```javascript
import { ref } from 'vue'

const count = ref(0)
console.log(count.value) // 0

count.value++ // 触发更新
```

**reactive - 对象响应式**：
```javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  user: { name: 'John' }
})

state.count++ // 触发更新
state.user.name = 'Jane' // 深层响应式
```

**ref vs reactive 对比**：

| 特性 | ref | reactive |
|------|-----|----------|
| 支持类型 | 任意类型 | 仅对象/数组 |
| 访问方式 | 需要 .value | 直接访问 |
| 模板中 | 自动解包 | 直接使用 |
| 解构 | 保持响应式 | 丢失响应式（需 toRefs） |
| 重新赋值 | 可以 | 不可以 |

### 2. Composition API

Vue 3 引入的新 API 风格，按逻辑功能组织代码。

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// 响应式状态
const count = ref(0)

// 计算属性
const doubled = computed(() => count.value * 2)

// 侦听器
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`)
})

// 方法
function increment() {
  count.value++
}

// 生命周期
onMounted(() => {
  console.log('Component mounted')
})
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Doubled: {{ doubled }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

### 3. 组件通信

**Props / Emits（父子通信）**：
```vue
<!-- 父组件 -->
<template>
  <Child :message="msg" @update="handleUpdate" />
</templ

</script>

<!-- 后代组件 -->
<script setup>
import { inject } from 'vue'

const theme = inject('theme')
</script>
```

### 4. 模板语法

**插值和指令**：
```vue
<template>
  <!-- 文本插值 -->
  <p>{{ message }}</p>
  
  <!-- HTML 插值 -->
  <div v-html="rawHtml"></div>
  
  <!-- 属性绑定 -->
  <img :src="imageSrc" :alt="imageAlt" />
  
  <!-- 事件监听 -->
  <button @click="handleClick">Click</button>
  
  <!-- 条件渲染 -->
  <p v-if="show">Visible</p>
  <p v-else>Hidden</p>
  
  <!-- 列表渲染 -->
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
  
  <!-- 双向绑定 -->
  <input v-model="text" />
</template>
```

### 5. 生命周期

Vue 3 Composition API 生命周期钩子：

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue'

// setup() 相当于 beforeCreate + created

onBeforeMount(() => {
  console.log('组件挂载前')
})

onMounted(() => {
  console.log('组件已挂载')
})

onBeforeUpdate(() => {
  console.log('组件更新前')
})

onUpdated(() => {
  console.log('组件已更新')
})

onBeforeUnmount(() => {
  console.log('组件卸载前')
})

onUnmounted(() => {
  console.log('组件已卸载')
})
```

### 6. 计算属性和侦听器

**computed - 计算属性**：
```javascript
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 只读计算属性
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

// 可写计算属性
const fullName = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(value) {
    [firstName.value, lastName.value] = value.split(' ')
  }
})
```

**watch - 侦听器**：
```javascript
import { ref, watch } from 'vue'

const count = ref(0)

// 侦听单个源
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`)
})

// 侦听多个源
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  console.log('Multiple sources changed')
})

// 侦听对象属性
watch(
  () => state.someObject,
  (newVal) => { /* ... */ },
  { deep: true, immediate: true }
)
```

**watchEffect - 自动追踪依赖**：
```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)
const name = ref('Vue')

// 自动追踪回调中使用的响应式数据
watchEffect(() => {
  console.log(`Count: ${count.value}, Name: ${name.value}`)
})
```

## 💡 面试宝典

> 完整题库详见：[interview-bank.md](./interview-bank.md)

### 基础题（必会）

#### Q1: Vue 2 与 Vue 3 响应式机制的核心差异？

**答案**：
- **Vue 2**: 使用 `Object.defineProperty` 拦截对象属性的读写
  - 无法检测属性的添加和删除
  - 无法检测数组索引和长度的变化
  - 需要使用 `Vue.set` 和 `Vue.delete`
  
- **Vue 3**: 使用 `Proxy` 代理整个对象
  - 可以检测属性的添加和删除
  - 可以检测数组索引和长度的变化
  - 支持 Map、Set 等数据结构
  - 性能更好（惰性代理）

**代码示例**：
```javascript
// Vue 2 的局限
export default {
  data() {
    return {
      user: { name: 'John' }
    }
  },
  methods: {
    addAge() {
      this.user.age = 25 // ❌ 不会触发更新
      this.$set(this.user, 'age', 25) // ✅ 需要使用 $set
    }
  }
}

// Vue 3 自动检测
import { reactive } from 'vue'

const user = reactive({ name: 'John' })
user.age = 25 // ✅ 自动触发更新
```

#### Q2: 组件通信的常见方式有哪些？

**答案**：
1. **Props / Emits**: 父子组件通信
2. **v-model**: 双向绑定（语法糖）
3. **Provide / Inject**: 跨层级通信
4. **Pinia / Vuex**: 全局状态管理
5. **$refs**: 直接访问子组件实例
6. **$attrs / $listeners**: 透传属性和事件
7. **Event Bus**: 事件总线（不推荐，Vue 3 已移除）

#### Q3: v-if 与 v-show 的区别与适用场景？

**答案**：

| 特性 | v-if | v-show |
|------|------|--------|
| 渲染方式 | 条件渲染（销毁/重建） | 始终渲染（切换 display） |
| 初始开销 | 低 | 高 |
| 切换开销 | 高 | 低 |
| 适用场景 | 不频繁切换 | 频繁切换 |
| 生命周期 | 触发 | 不触发 |

**代码示例**：
```vue
<template>
  <!-- 不频繁切换，使用 v-if -->
  <div v-if="isAdmin">Admin Panel</div>
  
  <!-- 频繁切换，使用 v-show -->
  <div v-show="isVisible">Toggle Content</div>
</template>
```

#### Q4: computed 与 watch 的区别？

**答案**：

| 特性 | computed | watch |
|------|----------|-------|
| 用途 | 派生状态 | 副作用 |
| 缓存 | 有缓存 | 无缓存 |
| 返回值 | 必须返回 | 无需返回 |
| 异步 | 不支持 | 支持 |
| 使用场景 | 数据转换、过滤 | API 调用、日志记录 |

**代码示例**：
```javascript
import { ref, computed, watch } from 'vue'

const count = ref(0)

// computed - 派生状态，有缓存
const doubled = computed(() => count.value * 2)

// watch - 副作用，支持异步
watch(count, async (newVal) => {
  if (newVal > 10) {
    await api.logCount(newVal)
  }
})
```

#### Q5: Composition API 的核心优势？

**答案**：
1. **逻辑复用**: 通过 composables 函数复用逻辑，无命名冲突
2. **代码组织**: 按功能聚合代码，而非按选项类型
3. **类型推导**: 更好的 TypeScript 支持
4. **Tree-shaking**: 按需引入，减小打包体积
5. **灵活性**: 可以在 setup 中使用任何 JavaScript 特性

**代码示例**：
```javascript
// 可复用的 composable
function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}

// 在组件中使用
<script setup>
const { count, increment } = useCounter()
</script>
```

### 进阶题（重要）

#### Q1: 大型项目如何划分状态与数据流？

**答案**：
1. **区分状态类型**：
   - 局部状态：组件内部使用，用 ref/reactive
   - 共享状态：多组件共享，用 Pinia store
   - 服务端状态：API 数据，用 VueUse/TanStack Query

2. **按领域拆分 Store**：
   ```javascript
   // stores/user.js
   export const useUserStore = defineStore('user', () => {
     const user = ref(null)
     const login = async () => { /* ... */ }
     return { user, login }
   })
   
   // stores/cart.js
   export const useCartStore = defineStore('cart', () => {
     const items = ref([])
     const addItem = () => { /* ... */ }
     return { items, addItem }
   })
   ```

3. **避免过度全局化**：
   - 优先使用局部状态
   - 仅在必要时提升到全局
   - 使用 provide/inject 处理跨层级通信

#### Q2: 首屏性能与 SSR 的关键优化点？

**答案**：
1. **代码分割**：
   ```javascript
   // 路由懒加载
   const routes = [
     {
       path: '/dashboard',
       component: () => import('./views/Dashboard.vue')
     }
   ]
   ```

2. **资源优化**：
   - 图片懒加载
   - 使用 WebP 格式
   - CDN 加速

3. **SSR 优化**：
   - 使用 Nuxt 3
   - 静态生成（SSG）
   - 边缘渲染

4. **Hydration 优化**：
   - 减少客户端 JavaScript
   - 使用 `<ClientOnly>` 组件
   - 延迟非关键组件

### 常见陷阱

::: warning 陷阱 1: 解构 reactive 丢失响应式
**错误示例**：
```javascript
const state = reactive({ count: 0 })
let { count } = state // ❌ 丢失响应式
```

**正确做法**：
```javascript
import { toRefs } from 'vue'

const state = reactive({ count: 0 })
const { count } = toRefs(state) // ✅ 保持响应式
```
:::

::: warning 陷阱 2: v-for 未设置稳定 key
**错误示例**：
```vue
<li v-for="(item, index) in items" :key="index">
  {{ item.name }}
</li>
```

**正确做法**：
```vue
<li v-for="item in items" :key="item.id">
  {{ item.name }}
</li>
```
:::

::: warning 陷阱 3: 在 computed 中执行副作用
**错误示例**：
```javascript
const doubled = computed(() => {
  api.log(count.value) // ❌ 副作用
  return count.value * 2
})
```

**正确做法**：
```javascript
// computed 只做计算
const doubled = computed(() => count.value * 2)

// 副作用用 watch
watch(count, (val) => {
  api.log(val)
})
```
:::


## 🛠️ 实战文档

### Vue 3 新特性

#### 1. `<script setup>` 语法糖

更简洁的 Composition API 写法：

```vue
<script setup>
import { ref, computed } from 'vue'
import MyComponent from './MyComponent.vue'

// 自动注册组件
// 自动暴露给模板

const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>

<template>
  <div>
    <p>{{ count }} x 2 = {{ doubled }}</p>
    <button @click="increment">+1</button>
    <MyComponent />
  </div>
</template>
```

#### 2. Teleport（传送门）

将组件渲染到 DOM 的其他位置：

```vue
<template>
  <button @click="showModal = true">打开弹窗</button>
  
  <!-- 渲染到 body 下 -->
  <Teleport to="body">
    <div v-if="showModal" class="modal">
      <p>这是一个弹窗</p>
      <button @click="showModal = false">关闭</button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const showModal = ref(false)
</script>
```

#### 3. Suspense（异步组件）

处理异步组件的加载状态：

```vue
<template>
  <Suspense>
    <!-- 异步组件 -->
    <template #default>
      <AsyncComponent />
    </template>
    
    <!-- 加载中显示 -->
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)
</script>
```

#### 4. Fragment（多根节点）

组件可以有多个根节点：

```vue
<template>
  <header>Header</header>
  <main>Content</main>
  <footer>Footer</footer>
</template>
```

### 常用代码片段

#### 完整组件模板（TypeScript）

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Props
in
function increment() {
  localCount.value++
}

function navigate() {
  router.push('/other')
}

// Lifecycle
onMounted(() => {
  inputRef.value?.focus()
})

// Expose
defineExpose({
  localCount,
  increment
})
</script>

<template>
  <div class="component">
    <h1>{{ title }}</h1>
    <input ref="inputRef" v-model.number="localCount" />
    <p>Count: {{ localCount }}, Doubled: {{ doubled }}</p>
    <button @click="increment">+1</button>
    <button @click="navigate">Navigate</button>
  </div>
</template>

<style scoped>
.component {
  padding: 1rem;
}
</style>
```

#### 自定义 Composable

```typescript
// composables/useFetch.ts
import { ref, shallowRef, watchEffect, toValue, type Ref } from 'vue'

export function useFetch<T>(url: string | Ref<string>) {
  const data = shallowRef<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  
  watchEffect(async () => {
    loading.value = true
    error.value = null
    
    try {
      const urlValue = toValue(url)
      const response = await fetch(urlValue)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  })
  
  return { data, error, loading }
}

// 使用
<script setup lang="ts">
import { useFetch } from '@/composables/useFetch'

interface User {
  id: number
  name: string
}

const { data, loading, error } = useFetch<User[]>('/api/users')
</script>
```

#### Pinia Store

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref('')
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name ?? 'Guest')
  
  // Actions
  async function login(email: string, password: string) {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    user.value = data.user
    token.value = data.token
  }
  
  function logout() {
    user.value = null
    token.value = ''
  }
  
  return {
    user,
    token,
    isLoggedIn,
    userName,
    login,
    logout
  }
})

// 使用
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

async function handleLogin() {
  await userStore.login('user@example.com', 'password')
}
</script>
```

### 性能优化

#### 1. 虚拟列表

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref(Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`
})))

const containerHeight = 600
const itemHeight = 50
const visibleCount = Math.ceil(containerHeight / itemHeight)

const scrollTop = ref(0)

const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / itemHeight)
  const end = start + visibleCount
  return items.value.slice(start, end).map((item, index) => ({
    ...item,
    top: (start + index) * itemHeight
  }))
})

function handleScroll(e) {
  scrollTop.value = e.target.scrollTop
}
</script>

<template>
  <div
    class="virtual-list"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <div :style="{ height: items.length * itemHeight + 'px' }">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        :style="{ position: 'absolute', top: item.top + 'px', height: itemHeight + 'px' }"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
```

#### 2. 组件懒加载

```javascript
// 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue')
  },
  {
    path: '/settings',
    component: () => import('./views/Settings.vue')
  }
]

// 组件懒加载
<script setup>
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>

<template>
  <Suspense>
    <HeavyComponent />
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

#### 3. v-memo 优化

```vue
<template>
  <!-- 仅当 item.id 或 selected 变化时才更新 -->
  <div v-for="item in list" :key="item.id" v-memo="[item.id, selected]">
    <p>{{ item.name }}</p>
    <p>{{ item.description }}</p>
    <button @click="select(item)">Select</button>
  </div>
</template>
```

### 版本差异

#### Vue 2 vs Vue 3 主要变化

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 响应式 | Object.defineProperty | Proxy |
| API 风格 | Options API | Options + Composition API |
| 组件根节点 | 单根节点 | 多根节点（Fragment） |
| v-model | value + input | modelValue + update:modelValue |
| 全局 API | Vue.xxx | createApp().xxx |
| 生命周期 | beforeDestroy/destroyed | beforeUnmount/unmounted |
| 过滤器 | 支持 | 移除 |
| 事件 API | $on/$off/$once | 移除 |
| TypeScript | 有限支持 | 原生支持 |
| 性能 | 基准 | 提升 30-50% |
| 打包大小 | ~22kb | ~13kb |

#### 迁移指南

1. **安装 Vue 3**：
   ```bash
   npm install vue@3 vue-router@4 pinia
   ```

2. **更新全局 API**：
   ```javascript
   // Vue 2
   import Vue from 'vue'
   Vue.component('MyComponent', {})
   new Vue({ render: h => h(App) }).$mount('#app')
   
   // Vue 3
   import { createApp } from 'vue'
   const app = createApp(App)
   app.component('MyComponent', {})
   app.mount('#app')
   ```

3. **更新 v-model**：
   ```vue
   <!-- Vue 2 -->
   <CustomInput :value="val" @input="val = $event" />
   
   <!-- Vue 3 -->
   <CustomInput :modelValue="val" @update:modelValue="val = $event" />
   <!-- 或简写 -->
   <CustomInput v-model="val" />
   ```

4. **使用 Composition API**：
   ```vue
   <!-- Vue 2 Options API -->
   <script>
   export default {
     data() {
       return { count: 0 }
     },
     methods: {
       increment() {
         this.count++
       }
     }
   }
   </script>
   
   <!-- Vue 3 Composition API -->
   <script setup>
   import { ref } from 'vue'
   
   const count = ref(0)
   
   function increment() {
     count.value++
   }
   </script>
   ```

## 📚 学习资源

### 官方文档
- [Vue 3 官方文档](https://vuejs.org/) - 最新的官方文档
- [Vue 3 中文文档](https://cn.vuejs.org/) - 中文翻译
- [Vue Router 4](https://router.vuejs.org/) - 官方路由
- [Pinia](https://pinia.vuejs.org/) - 官方状态管理
- [Vite](https://vitejs.dev/) - 官方构建工具

### 推荐阅读
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/) - 从 Vue 2 迁移
- [Vue 3 设计理念](https://vuejs.org/guide/extras/composition-api-faq.html) - Composition API FAQ
- [VueUse](https://vueuse.org/) - Vue Composition 工具集
- [Vue Macros](https://vue-macros.sxzz.moe/) - Vue 宏扩展

### 实用工具
- [Vue DevTools](https://devtools.vuejs.org/) - 官方调试工具
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - VS Code 插件
- [Vue Test Utils](https://test-utils.vuejs.org/) - 测试工具
- [Nuxt 3](https://nuxt.com/) - Vue 全栈框架

### UI 组件库
- [Element Plus](https://element-plus.org/) - 桌面端组件库
- [Ant Design Vue](https://antdv.com/) - 企业级组件库
- [Naive UI](https://www.naiveui.com/) - 现代化组件库
- [Vuetify](https://vuetifyjs.com/) - Material Design 组件库

## 🔗 相关文档

- [Vue 3 面试题库](./interview-bank.md) - 完整面试题
- [Vue 3 速查表](./vue-cheatsheet.md) - 常用 API 速查
- [Vue 3 vs Vue 2](./vue3-vs-vue2.md) - 版本差异对比
- [Vue 3 面试专题](./vue3-interview.md) - 深度面试题
- [参考资料来源](./sources.md) - 学习资源汇总

---

**内容来源**: 基于 [Vue 官方文档](https://vuejs.org/) 和最新面试题库整理，使用 Context7 MCP 验证最新特性（2025-02）
