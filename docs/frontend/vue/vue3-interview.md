# Vue 3 面试题集

> Vue 3.x 版本核心知识点与高频面试题 (2024-2025)

## A. 面试宝典

### 基础题

#### 1. Composition API 与 Options API 的区别

| 特性 | Options API | Composition API |
|------|-------------|-----------------|
| 代码组织 | 按选项类型分组 (data, methods, computed) | 按逻辑功能分组 |
| 逻辑复用 | Mixins (有命名冲突风险) | Composables (函数式，无冲突) |
| TypeScript 支持 | 一般 | 优秀 (完整类型推断) |
| 学习曲线 | 较低 | 需要理解响应式原理 |
| this 使用 | 频繁使用 this | 不使用 this |

```vue
<!-- Composition API with script setup -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 响应式状态
const count = ref(0)

// 计算属性
const doubled = computed(() => count.value * 2)

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
  <button @click="increment">{{ count }} ({{ doubled }})</button>
</template>
```

**标准回答：**
> Composition API 是 Vue 3 引入的新特性，允许使用函数式的方式组织组件逻辑。相比 Options API 按选项类型分组，Composition API 按逻辑功能分组，更利于代码复用和 TypeScript 类型推断。通过 `<script setup>` 语法糖，代码更加简洁。

---

#### 2. ref 和 reactive 的区别

```javascript
import { ref, reactive, isRef, isReactive } from 'vue'

// ref - 用于任意类型，通过 .value 访问
const count = ref(0)
const user = ref({ name: 'John' })
console.log(count.value) // 0
console.log(user.value.name) // 'John'

// reactive - 只能用于对象类型，直接访问
const state = reactive({
  count: 0,
  user: { name: 'John' }
})
console.log(state.count) // 0
console.log(state.user.name) // 'John'

// 类型检查
console.log(isRef(count)) // true
console.log(isReactive(state)) // true
```

| 特性 | ref | reactive |
|------|-----|----------|
| 支持类型 | 任意类型 | 仅对象/数组 |
| 访问方式 | 需要 .value | 直接访问 |
| 模板中 | 自动解包，无需 .value | 直接使用 |
| 解构 | 保持响应式 | 会丢失响应式（需 toRefs） |
| 重新赋值 | 可以整体替换 | 不能整体替换 |

```javascript
// reactive 解构问题
const state = reactive({ count: 0 })
let { count } = state // 失去响应式！

// 解决方案：toRefs
import { toRefs } from 'vue'
const { count } = toRefs(state) // count 是 ref，保持响应式
```

---

#### 3. Vue 3 生命周期钩子

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured
} from 'vue'

// setup() 本身相当于 beforeCreate + created
export default {
  setup() {
    onBeforeMount(() => {
      console.log('beforeMount')
    })

    onMounted(() => {
      console.log('mounted')
    })

    onBeforeUpdate(() => {
      console.log('beforeUpdate')
    })

    onUpdated(() => {
      console.log('updated')
    })

    onBeforeUnmount(() => {
      console.log('beforeUnmount')
    })

    onUnmounted(() => {
      console.log('unmounted')
    })
  }
}
```

| Vue 2 | Vue 3 Options API | Vue 3 Composition API |
|-------|-------------------|----------------------|
| beforeCreate | beforeCreate | setup() |
| created | created | setup() |
| beforeMount | beforeMount | onBeforeMount |
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| beforeDestroy | beforeUnmount | onBeforeUnmount |
| destroyed | unmounted | onUnmounted |

---

#### 4. watch 和 watchEffect 的区别

```javascript
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)
const name = ref('Vue')

// watch - 显式指定依赖
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`)
})

// watch 多个源
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  console.log('Multiple sources changed')
})

// watch 选项
watch(
  () => state.someObject,
  (newVal) => { /* ... */ },
  {
    immediate: true,  // 立即执行
    deep: true,       // 深度监听
    flush: 'post'     // 在 DOM 更新后执行
  }
)

// watchEffect - 自动追踪依赖
watchEffect(() => {
  // 自动追踪回调中使用的响应式数据
  console.log(`Count is: ${count.value}, Name is: ${name.value}`)
})

// watchPostEffect - DOM 更新后执行
watchPostEffect(() => {
  // 可以安全访问更新后的 DOM
})

// 停止监听
const stop = watchEffect(() => { /* ... */ })
stop() // 手动停止
```

| 特性 | watch | watchEffect |
|------|-------|-------------|
| 依赖声明 | 显式指定 | 自动追踪 |
| 首次执行 | 默认不执行（可设 immediate） | 立即执行 |
| 旧值访问 | 可获取 | 不可获取 |
| 惰性执行 | 是 | 否 |

---

#### 5. defineProps、defineEmits、defineExpose

```vue
<script setup lang="ts">
// defineProps - 声明 props
interface Props {
  title: string
  count?: number
  items: string[]
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => []
})

// defineEmits - 声明事件
const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'delete', id: string): void
}>()

// 或者运行时声明
const emit = defineEmits(['update', 'delete'])

// 触发事件
function handleClick() {
  emit('update', props.count + 1)
}

// defineExpose - 暴露组件实例属性
import { ref } from 'vue'

const inputRef = ref<HTMLInputElement>()
const focus = () => inputRef.value?.focus()

defineExpose({
  focus,
  inputRef
})
</script>
```

---

### 进阶/场景题

#### 1. Vue 3 响应式原理 (Proxy)

```javascript
// Vue 3 使用 Proxy 实现响应式
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)

      // 依赖收集
      track(target, key)

      // 如果是对象，递归代理（惰性代理）
      if (typeof result === 'object' && result !== null) {
        return reactive(result)
      }

      return result
    },

    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)

      // 触发更新
      if (oldValue !== value) {
        trigger(target, key)
      }

      return result
    },

    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key)
      trigger(target, key)
      return result
    }
  })
}

// 依赖收集
const targetMap = new WeakMap()

function track(target, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  dep.add(activeEffect)
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => effect())
  }
}
```

**Vue 3 vs Vue 2 响应式对比：**

| 特性 | Vue 2 (Object.defineProperty) | Vue 3 (Proxy) |
|------|-------------------------------|---------------|
| 对象属性添加 | 需要 Vue.set | 自动检测 |
| 数组索引修改 | 需要 Vue.set | 自动检测 |
| 性能 | 初始化时递归遍历 | 惰性代理 |
| Map/Set 支持 | 不支持 | 支持 |
| 浏览器兼容 | IE9+ | 不支持 IE |

---

#### 2. Vue 3 编译优化

**1. 静态提升 (hoistStatic)**
```vue
<template>
  <div>
    <p>Static text</p>           <!-- 静态节点 -->
    <p>{{ dynamic }}</p>         <!-- 动态节点 -->
  </div>
</template>
```

编译后：
```javascript
// 静态节点被提升到渲染函数外
const _hoisted_1 = /*#__PURE__*/_createElementVNode("p", null, "Static text")

function render(_ctx) {
  return (_openBlock(), _createElementBlock("div", null, [
    _hoisted_1, // 复用静态节点
    _createElementVNode("p", null, _toDisplayString(_ctx.dynamic), 1 /* TEXT */)
  ]))
}
```

**2. PatchFlags 标记**
```javascript
// 标记类型
export const enum PatchFlags {
  TEXT = 1,           // 动态文本
  CLASS = 1 << 1,     // 动态 class
  STYLE = 1 << 2,     // 动态 style
  PROPS = 1 << 3,     // 动态 props
  FULL_PROPS = 1 << 4,// 有动态 key 的 props
  HYDRATE_EVENTS = 1 << 5,
  STABLE_FRAGMENT = 1 << 6,
  KEYED_FRAGMENT = 1 << 7,
  UNKEYED_FRAGMENT = 1 << 8,
  NEED_PATCH = 1 << 9,
  DYNAMIC_SLOTS = 1 << 10,
  HOISTED = -1,
  BAIL = -2
}
```

**3. Block Tree**
- 将动态节点收集到 Block 中
- 更新时只对比 Block 内的动态节点
- 跳过静态内容的对比

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "Vue 3 完全抛弃了 Options API" | Options API 仍然支持，可混合使用 |
| "ref 只能用于基本类型" | ref 可以包装任何类型 |
| "setup() 中可以使用 this" | setup() 中 this 为 undefined |
| "reactive 可以整体替换" | 整体替换会丢失响应式，应修改属性 |
| "所有代码都要用 Composition API 重写" | 根据场景选择，简单组件可用 Options API |

---

## B. 实战文档

### 速查链接

| 资源 | 链接 |
|------|------|
| Vue 3 官方文档 | https://vuejs.org/ |
| Vue Router 4 | https://router.vuejs.org/ |
| Pinia | https://pinia.vuejs.org/ |
| VueUse | https://vueuse.org/ |
| Vite | https://vitejs.dev/ |

### 常用代码片段

**1. 完整组件模板 (TypeScript)**
```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Props
interface Props {
  title: string
  initialCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialCount: 0
})

// Emits
const emit = defineEmits<{
  (e: 'change', value: number): void
}>()

// Router
const router = useRouter()
const route = useRoute()

// State
const count = ref(props.initialCount)
const inputRef = ref<HTMLInputElement>()

// Computed
const doubled = computed(() => count.value * 2)

// Watch
watch(count, (newVal) => {
  emit('change', newVal)
})

// Methods
function increment() {
  count.value++
}

function navigate() {
  router.push('/other')
}

// Lifecycle
onMounted(() => {
  inputRef.value?.focus()
})

// Expose
defineExpose({ count, increment })
</script>

<template>
  <div class="component">
    <h1>{{ title }}</h1>
    <input ref="inputRef" v-model.number="count" />
    <p>Count: {{ count }}, Doubled: {{ doubled }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<style scoped>
.component {
  padding: 1rem;
}
</style>
```

**2. 自定义 Composable**
```typescript
// composables/useFetch.ts
import { ref, shallowRef, type Ref } from 'vue'

interface UseFetchOptions {
  immediate?: boolean
}

interface UseFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  loading: Ref<boolean>
  execute: () => Promise<void>
}

export function useFetch<T = unknown>(
  url: string | Ref<string>,
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const { immediate = true } = options

  const data = shallowRef<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  async function execute() {
    loading.value = true
    error.value = null

    try {
      const urlValue = typeof url === 'string' ? url : url.value
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
  }

  if (immediate) {
    execute()
  }

  return { data, error, loading, execute }
}

// 使用示例
const { data, loading, error } = useFetch<User[]>('/api/users')
```

**3. Pinia Store**
```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

// Setup Store 语法（推荐）
export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string>('')

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name ?? 'Guest')

  // Actions
  async function login(email: string, password: string) {
    const response = await fetch('/api/login', {
      method: 'POST',
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
```
