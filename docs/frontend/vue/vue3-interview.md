# Vue 3 面试题库

> 精选高频面试题及详细解答
> 
> 📅 **更新时间**: 2025-02
> 
> 📚 **内容来源**: Vue 3 官方文档、Pinia 官方文档、Vue Router 4 官方文档

[[toc]]

---

## 📋 目录

- [基础题（必会）](#基础题必会)
- [进阶题（重要）](#进阶题重要)
- [高级题（加分）](#高级题加分)
- [场景题（实战）](#场景题实战)
- [反问环节](#反问环节)

---

## 基础题（必会）

### 1. Composition API 与 Options API 的差异？

**难度**: ⭐⭐☆☆☆

**问题**：
请说明 Composition API 和 Options API 的主要区别，以及为什么现在推荐使用 Composition API？

**答案**：

**主要区别**：
1. **代码组织**: Composition API 按逻辑功能分组，Options API 按选项类型分组
2. **逻辑复用**: Composition API 使用 Composables，Options API 使用 Mixins
3. **TypeScript 支持**: Composition API 类型推断更好
4. **this 使用**: Composition API 不使用 this，Options API 频繁使用 this
5. **学习曲线**: Options API 更简单，Composition API 需要理解响应式原理

**代码对比**：
```vue
<!-- Composition API（推荐） -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// 响应式状态
const count = ref(0)
const doubled = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}

// 侦听器
watch(count, (newVal) => {
  console.log(`Count changed to ${newVal}`)
})

// 生命周期
onMounted(() => {
  console.log('Component mounted')
})
</script>

<template>
  <button @click="increment">
    Count: {{ count }}, Doubled: {{ doubled }}
  </button>
</template>
```

```vue
<!-- Options API（遗留代码） -->
<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  computed: {
    doubled() {
      return this.count * 2
    }
  },
  watch: {
    count(newVal) {
      console.log(`Count changed to ${newVal}`)
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('Component mounted')
  }
}
</script>

<template>
  <button @click="increment">
    Count: {{ count }}, Doubled: {{ doubled }}
  </button>
</template>
```

**逻辑复用对比**：
```javascript
// Composition API - Composable（推荐）
// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}

// 使用
import { useMouse } from '@/composables/useMouse'
const { x, y } = useMouse()
```

```javascript
// Options API - Mixin（不推荐）
// mixins/mouse.js
export default {
  data() {
    return {
      x: 0,
      y: 0
    }
  },
  mounted() {
    window.addEventListener('mousemove', this.update)
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.update)
  },
  methods: {
    update(event) {
      this.x = event.pageX
      this.y = event.pageY
    }
  }
}

// 使用（可能有命名冲突）
import mouseMixin from '@/mixins/mouse'
export default {
  mixins: [mouseMixin]
}
```

**追问点**：
- Q: Options API 会被废弃吗？
  - A: 不会，Vue 3 完全支持 Options API，可以根据项目需求选择
- Q: 什么时候使用 Composition API？
  - A: 大型项目、需要复用逻辑、TypeScript 项目推荐使用
- Q: 可以混用两种 API 吗？
  - A: 可以，但建议在同一组件中保持一致

---

### 2. ref 和 reactive 的区别？

**难度**: ⭐⭐⭐☆☆

**问题**：
ref 和 reactive 有什么区别？什么时候使用 ref，什么时候使用 reactive？

**答案**：

**核心区别**：

| 特性 | ref | reactive |
|------|-----|----------|
| 支持类型 | 任意类型（基本类型、对象） | 仅对象/数组 |
| 访问方式 | 需要 .value | 直接访问 |
| 模板中 | 自动解包，无需 .value | 直接使用 |
| 解构 | 保持响应式 | 会丢失响应式（需 toRefs） |
| 重新赋值 | 可以整体替换 | 不能整体替换 |
| 实现原理 | 包装对象 + Proxy | Proxy |

**代码示例**：
```javascript
import { ref, reactive, isRef, isReactive, toRefs } from 'vue'

// ref - 用于任意类型
const count = ref(0)
const user = ref({ name: 'John', age: 25 })

console.log(count.value) // 0
console.log(user.value.name) // 'John'

// 可以整体替换
count.value = 10
user.value = { name: 'Jane', age: 30 }

// reactive - 只能用于对象
const state = reactive({
  count: 0,
  user: { name: 'John', age: 25 }
})

console.log(state.count) // 0
console.log(state.user.name) // 'John'

// 不能整体替换（会丢失响应式）
// state = { count: 10 } // ❌ 错误

// 应该修改属性
state.count = 10 // ✅ 正确
state.user.name = 'Jane' // ✅ 正确
```

**解构问题**：
```javascript
// reactive 解构会丢失响应式
const state = reactive({ count: 0, name: 'Vue' })
let { count, name } = state // ❌ 丢失响应式

// 解决方案 1：使用 toRefs
import { toRefs } from 'vue'
const { count, name } = toRefs(state) // ✅ count 和 name 是 ref

// 解决方案 2：使用 toRef
import { toRef } from 'vue'
const count = toRef(state, 'count') // ✅ count 是 ref

// ref 解构不会丢失响应式
const count = ref(0)
const { value } = count // value 只是数字，但 count 仍是响应式
```

**使用建议**：
```javascript
// ✅ 推荐：基本类型用 ref
const count = ref(0)
const message = ref('Hello')
const isLoading = ref(false)

// ✅ 推荐：对象用 reactive（不需要解构时）
const form = reactive({
  username: '',
  password: '',
  remember: false
})

// ✅ 推荐：需要整体替换时用 ref
const user = ref(null)
user.value = await fetchUser() // 可以整体替换

// ❌ 不推荐：对象用 ref（需要频繁 .value）
const form = ref({
  username: '',
  password: ''
})
form.value.username = 'admin' // 繁琐
```

**追问点**：
- Q: shallowRef 和 shallowReactive 的区别？
  - A: shallow 版本只有根级别是响应式的，嵌套对象不是响应式
- Q: 如何判断一个值是 ref 还是 reactive？
  - A: 使用 isRef() 和 isReactive() 函数
- Q: ref 的自动解包规则？
  - A: 在模板中自动解包，在 reactive 对象中自动解包，在数组/Map 中不解包

---

### 3. watch 和 watchEffect 的区别？

**难度**: ⭐⭐⭐☆☆

**问题**：
watch 和 watchEffect 有什么区别？什么时候使用 watch，什么时候使用 watchEffect？

**答案**：

**核心区别**：

| 特性 | watch | watchEffect |
|------|-------|-------------|
| 依赖声明 | 显式指定 | 自动追踪 |
| 首次执行 | 默认不执行（可设 immediate） | 立即执行 |
| 旧值访问 | 可获取 | 不可获取 |
| 惰性执行 | 是 | 否 |
| 使用场景 | 需要旧值、异步操作 | 简单的副作用 |

**代码示例**：
```javascript
import { ref, watch, watchEffect, watchPostEffect } from 'vue'

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

// watch 对象属性
const state = reactive({ count: 0, nested: { value: 1 } })
watch(
  () => state.count,
  (newVal) => console.log(newVal)
)

// watch 选项
watch(
  () => state.nested,
  (newVal) => console.log(newVal),
  {
    immediate: true,  // 立即执行
    deep: true,       // 深度监听
    flush: 'post',    // 在 DOM 更新后执行
    once: true        // Vue 3.4+ 只执行一次
  }
)

// watchEffect - 自动追踪依赖
watchEffect(() => {
  // 自动追踪回调中使用的响应式数据
  console.log(`Count: ${count.value}, Name: ${name.value}`)
})

// watchPostEffect - DOM 更新后执行
watchPostEffect(() => {
  // 可以安全访问更新后的 DOM
  console.log(document.querySelector('#count').textContent)
})

// watchSyncEffect - 同步执行（谨慎使用）
watchSyncEffect(() => {
  // 在响应式数据变化时同步执行
  console.log(count.value)
})

// 停止监听
const stop = watchEffect(() => {
  console.log(count.value)
})
stop() // 手动停止
```

**实际应用场景**：
```javascript
// 场景 1：数据请求（使用 watch）
const userId = ref(1)

watch(userId, async (newId, oldId) => {
  console.log(`Fetching user ${newId}, previous: ${oldId}`)
  const user = await fetchUser(newId)
  // 处理用户数据
}, { immediate: true })

// 场景 2：自动保存（使用 watchEffect）
const form = reactive({
  title: '',
  content: ''
})

watchEffect(() => {
  // 自动追踪 form 的所有属性
  localStorage.setItem('draft', JSON.stringify(form))
})

// 场景 3：防抖搜索（使用 watch）
const searchQuery = ref('')
const searchResults = ref([])

watch(searchQuery, async (newQuery) => {
  if (!newQuery) {
    searchResults.value = []
    return
  }
  
  // 防抖逻辑
  await new Promise(resolve => setTimeout(resolve, 300))
  searchResults.value = await search(newQuery)
})

// 场景 4：清理副作用
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log(count.value)
  }, 1000)
  
  // 清理函数
  onCleanup(() => {
    clearInterval(timer)
  })
})
```

**追问点**：
- Q: flush 选项的作用？
  - A: 控制回调执行时机，'pre'（默认）在 DOM 更新前，'post' 在 DOM 更新后，'sync' 同步执行
- Q: 如何监听深层对象的变化？
  - A: 使用 deep: true 选项，或监听 getter 函数
- Q: watchEffect 如何获取旧值？
  - A: 无法获取，需要使用 watch

---

### 4. 生命周期钩子的变化？

**难度**: ⭐⭐☆☆☆

**问题**：
Vue 3 的生命周期钩子有哪些变化？Composition API 中如何使用生命周期？

**答案**：

**生命周期对照表**：

| Vue 2 | Vue 3 Options API | Vue 3 Composition API |
|-------|-------------------|----------------------|
| beforeCreate | beforeCreate | setup() |
| created | created | setup() |
| beforeMount | beforeMount | onBeforeMount |
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| beforeDestroy | **beforeUnmount** | onBeforeUnmount |
| destroyed | **unmounted** | onUnmounted |
| activated | activated | onActivated |
| deactivated | deactivated | onDeactivated |
| errorCaptured | errorCaptured | onErrorCaptured |
| - | **renderTracked** | onRenderTracked |
| - | **renderTriggered** | onRenderTriggered |
| - | **serverPrefetch** | onServerPrefetch |

**Composition API 使用示例**：
```vue
<script setup>
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured,
  onRenderTracked,
  onRenderTriggered
} from 'vue'

// setup() 相当于 beforeCreate + created
console.log('setup - 组件实例创建')

onBeforeMount(() => {
  console.log('beforeMount - 挂载前')
})

onMounted(() => {
  console.log('mounted - 挂载后，可以访问 DOM')
  // 适合：数据请求、DOM 操作、第三方库初始化
})

onBeforeUpdate(() => {
  console.log('beforeUpdate - 更新前')
})

onUpdated(() => {
  console.log('updated - 更新后')
  // 注意：避免在这里修改状态，可能导致无限循环
})

onBeforeUnmount(() => {
  console.log('beforeUnmount - 卸载前')
  // 适合：清理定时器、取消订阅
})

onUnmounted(() => {
  console.log('unmounted - 卸载后')
})

// KeepAlive 组件专用
onActivated(() => {
  console.log('activated - 组件被激活')
})

onDeactivated(() => {
  console.log('deactivated - 组件被缓存')
})

// 错误捕获
onErrorCaptured((err, instance, info) => {
  console.error('Error captured:', err, info)
  return false // 阻止错误继续传播
})

// 调试钩子（开发环境）
onRenderTracked((e) => {
  console.log('Render tracked:', e)
})

onRenderTriggered((e) => {
  console.log('Render triggered:', e)
})
</script>
```

**父子组件生命周期顺序**：
```
挂载阶段：
父 setup → 父 onBeforeMount 
→ 子 setup → 子 onBeforeMount → 子 onMounted 
→ 父 onMounted

更新阶段：
父 onBeforeUpdate 
→ 子 onBeforeUpdate → 子 onUpdated 
→ 父 onUpdated

卸载阶段：
父 onBeforeUnmount 
→ 子 onBeforeUnmount → 子 onUnmounted 
→ 父 onUnmounted
```

**追问点**：
- Q: setup() 中可以使用 this 吗？
  - A: 不可以，setup() 中 this 是 undefined
- Q: 生命周期钩子可以多次调用吗？
  - A: 可以，会按顺序执行
- Q: onRenderTracked 和 onRenderTriggered 的区别？
  - A: onRenderTracked 追踪所有依赖，onRenderTriggered 只在依赖变化时触发

---

### 5. 组件通信方式？

**难度**: ⭐⭐⭐☆☆

**问题**：
Vue 3 有哪些组件通信方式？各自的适用场景是什么？

**答案**：

**通信方式对比**：

| 方式 | 适用场景 | Vue 3 变化 |
|------|---------|-----------|
| props / emits | 父子组件 | emits 需要声明 |
| v-model | 双向绑定 | 支持多个 v-model |
| provide / inject | 跨级组件 | 支持响应式 |
| $refs | 父访问子 | 需要 defineExpose |
| $attrs | 透传属性 | 包含 class 和 style |
| mitt/tiny-emitter | 任意组件 | 替代 EventBus |
| Pinia | 全局状态 | 替代 Vuex |

**1. props / emits（父子通信）**
```vue
<!-- 父组件 -->
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const count = ref(0)

function handleUpdate(newCount) {
  count.value = newCount
}
</script>

<template>
  <Child :count="count" @update="handleUpdate" />
</template>

<!-- 子组件 -->
<script setup>
// 定义 props
const props = defineProps({
  count: {
    type: Number,
    required: true
  }
})

// 定义 emits
const emit = defineEmits(['update'])

function increment() {
  emit('update', props.count + 1)
}
</script>

<template>
  <button @click="increment">Count: {{ count }}</button>
</template>
```

**2. v-model（双向绑定）**
```vue
<!-- 父组件 -->
<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
</script>

<template>
  <!-- 单个 v-model -->
  <CustomInput v-model="username" />
  
  <!-- 多个 v-model -->
  <UserForm
    v-model:username="username"
    v-model:password="password"
  />
</template>

<!-- CustomInput.vue -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function handleInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <input :value="modelValue" @input="handleInput" />
</template>

<!-- UserForm.vue -->
<script setup>
defineProps(['username', 'password'])
const emit = defineEmits(['update:username', 'update:password'])
</script>

<template>
  <input
    :value="username"
    @input="emit('update:username', $event.target.value)"
  />
  <input
    type="password"
    :value="password"
    @input="emit('update:password', $event.target.value)"
  />
</template>
```

**3. provide / inject（跨级通信）**
```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref, readonly } from 'vue'

const theme = ref('dark')
const user = ref({ name: 'John', role: 'admin' })

// 提供响应式数据
provide('theme', theme)

// 提供只读数据（防止后代修改）
provide('user', readonly(user))

// 提供方法
provide('updateTheme', (newTheme) => {
  theme.value = newTheme
})

// 使用 Symbol 作为 key（类型安全）
import { InjectionKey } from 'vue'
export const themeKey: InjectionKey<Ref<string>> = Symbol('theme')
provide(themeKey, theme)
</script>

<!-- 后代组件 -->
<script setup>
import { inject } from 'vue'

// 注入数据
const theme = inject('theme')
const user = inject('user')
const updateTheme = inject('updateTheme')

// 使用默认值
const config = inject('config', { timeout: 3000 })

// 使用工厂函数作为默认值
const settings = inject('settings', () => ({ mode: 'light' }), true)

function changeTheme() {
  updateTheme('light')
}
</script>
```

**4. defineExpose（父访问子）**
```vue
<!-- 子组件 -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
const inputRef = ref()

function increment() {
  count.value++
}

function focus() {
  inputRef.value?.focus()
}

// 暴露给父组件
defineExpose({
  count,
  increment,
  focus
})
</script>

<template>
  <input ref="inputRef" />
  <button @click="increment">{{ count }}</button>
</template>

<!-- 父组件 -->
<script setup>
import { ref, onMounted } from 'vue'
import Child from './Child.vue'

const childRef = ref()

onMounted(() => {
  console.log(childRef.value.count) // 访问子组件的 count
  childRef.value.increment() // 调用子组件的方法
  childRef.value.focus() // 调用子组件的方法
})
</script>

<template>
  <Child ref="childRef" />
</template>
```

**5. mitt（事件总线）**
```javascript
// eventBus.js
import mitt from 'mitt'

export const emitter = mitt()

// 组件 A - 发送事件
import { emitter } from '@/utils/eventBus'

emitter.emit('user-login', { userId: 123 })

// 组件 B - 接收事件
import { onMounted, onUnmounted } from 'vue'
import { emitter } from '@/utils/eventBus'

onMounted(() => {
  emitter.on('user-login', handleLogin)
})

onUnmounted(() => {
  emitter.off('user-login', handleLogin)
})

function handleLogin(data) {
  console.log('User logged in:', data.userId)
}
```

**追问点**：
- Q: provide/inject 如何实现响应式？
  - A: 提供 ref 或 reactive 对象，后代组件会自动响应变化
- Q: $attrs 包含哪些内容？
  - A: 未被 props 声明的属性，包括 class、style、事件监听器
- Q: 如何选择通信方式？
  - A: 父子用 props/emits，跨级用 provide/inject，全局用 Pinia

---

## 进阶题（重要）

### 6. Teleport 和 Suspense 的使用？

**难度**: ⭐⭐⭐⭐☆

**问题**：
Teleport 和 Suspense 是什么？如何使用？有哪些实际应用场景？

**答案**：

**Teleport - 传送门组件**：
将组件的 DOM 渲染到指定位置，常用于模态框、通知、下拉菜单等需要脱离父组件层级的场景。

**基础用法**：
```vue
<script setup>
import { ref } from 'vue'

const showModal = ref(false)
</script>

<template>
  <div class="app">
    <button @click="showModal = true">打开模态框</button>

    <!-- 将模态框渲染到 body 下 -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="showModal = false">
        <div class="modal-content" @click.stop>
          <h2>模态框标题</h2>
          <p>这个内容被渲染到 body 元素下</p>
          <button @click="showModal = false">关闭</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
}
</style>
```

**Teleport 高级用法**：
```vue
<!-- 多个 Teleport 到同一目标 -->
<Teleport to="#modals">
  <div class="modal">Modal 1</div>
</Teleport>

<Teleport to="#modals">
  <div class="modal">Modal 2</div>
</Teleport>

<!-- 条件禁用 Teleport -->
<Teleport to="body" :disabled="isMobile">
  <div class="tooltip">
    <!-- 移动端不传送，桌面端传送到 body -->
  </div>
</Teleport>

<!-- 延迟传送（等待目标元素存在） -->
<Teleport to="#late-div" :defer="true">
  <div>Deferred content</div>
</Teleport>
```

**Suspense - 异步组件加载**：
处理异步操作的加载状态，支持异步组件和异步 setup。

**基础用法**：
```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 异步组件
const AsyncComp = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)
</script>

<template>
  <Suspense>
    <!-- 异步组件 -->
    <template #default>
      <AsyncComp />
    </template>

    <!-- 加载中状态 -->
    <template #fallback>
      <div class="loading">
        <span>加载中...</span>
      </div>
    </template>
  </Suspense>
</template>
```

**异步 setup**：
```vue
<!-- UserProfile.vue -->
<script setup>
// 可以直接使用 await，Suspense 会处理加载状态
const props = defineProps(['userId'])

const user = await fetch(`/api/users/${props.userId}`).then(r => r.json())
const posts = await fetch(`/api/users/${props.userId}/posts`).then(r => r.json())
</script>

<template>
  <div class="user-profile">
    <h2>{{ user.name }}</h2>
    <ul>
      <li v-for="post in posts" :key="post.id">
        {{ post.title }}
      </li>
    </ul>
  </div>
</template>

<!-- 父组件 -->
<template>
  <Suspense>
    <UserProfile :user-id="123" />
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

**错误处理**：
```vue
<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)

onErrorCaptured((err) => {
  error.value = err
  return false // 阻止错误继续传播
})
</script>

<template>
  <div v-if="error" class="error">
    <p>加载失败: {{ error.message }}</p>
    <button @click="error = null">重试</button>
  </div>

  <Suspense v-else>
    <AsyncComponent />
    <template #fallback>
      <Loading />
    </template>
  </Suspense>
</template>
```

**嵌套 Suspense**：
```vue
<template>
  <Suspense>
    <template #default>
      <Dashboard>
        <!-- 嵌套的 Suspense -->
        <Suspense>
          <UserWidget />
          <template #fallback>
            <WidgetSkeleton />
          </template>
        </Suspense>

        <Suspense>
          <StatsWidget />
          <template #fallback>
            <WidgetSkeleton />
          </template>
        </Suspense>
      </Dashboard>
    </template>

    <template #fallback>
      <PageSkeleton />
    </template>
  </Suspense>
</template>
```

**追问点**：
- Q: Suspense 和 v-if 的区别？
  - A: Suspense 专门处理异步加载，v-if 只是条件渲染
- Q: Suspense 的 pending 事件？
  - A: 可以监听 @pending、@resolve、@fallback 事件
- Q: 如何实现骨架屏？
  - A: 在 fallback 插槽中放置骨架屏组件

---

### 7. 性能优化最佳实践？

**难度**: ⭐⭐⭐⭐☆

**问题**：
Vue 3 有哪些性能优化方法？如何优化大列表渲染？

**答案**：

**优化方法总览**：

**1. v-memo（Vue 3.2+）**
缓存子树，只有依赖变化时才重新渲染。

```vue
<template>
  <div v-for="item in list" :key="item.id">
    <!-- 只有 item.id 或 selected 变化时才重新渲染 -->
    <div v-memo="[item.id, selected]">
      <h3>{{ item.title }}</h3>
      <p>{{ item.description }}</p>
      <button @click="select(item.id)">
        {{ selected === item.id ? '已选中' : '选择' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const list = ref([/* 大量数据 */])
const selected = ref(null)

function select(id) {
  selected.value = id
}
</script>
```

**2. shallowRef 和 shallowReactive**
只有根级别是响应式的，减少响应式开销。

```javascript
import { shallowRef, shallowReactive, triggerRef } from 'vue'

// shallowRef - 只有 .value 的变化是响应式的
const state = shallowRef({
  count: 0,
  nested: { value: 1 }
})

// 不会触发更新
state.value.count++

// 会触发更新
state.value = { count: 1, nested: { value: 2 } }

// 手动触发更新
state.value.count++
triggerRef(state)

// shallowReactive - 只有根级别属性是响应式的
const state2 = shallowReactive({
  count: 0,
  nested: { value: 1 }
})

// 会触发更新
state2.count++

// 不会触发更新
state2.nested.value++
```

**3. 虚拟列表（大数据渲染）**
```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref(Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  text: `Item ${i}`
})))

const containerHeight = 600
const itemHeight = 50
const visibleCount = Math.ceil(containerHeight / itemHeight)
const scrollTop = ref(0)

const startIndex = computed(() => 
  Math.floor(scrollTop.value / itemHeight)
)

const endIndex = computed(() => 
  Math.min(startIndex.value + visibleCount + 1, items.value.length)
)

const visibleItems = computed(() => 
  items.value.slice(startIndex.value, endIndex.value)
)

const offsetY = computed(() => 
  startIndex.value * itemHeight
)

const totalHeight = computed(() => 
  items.value.length * itemHeight
)

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
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div :style="{ transform: `translateY(${offsetY}px)` }">
        <div 
          v-for="item in visibleItems" 
          :key="item.id"
          :style="{ height: itemHeight + 'px' }"
          class="item"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-list {
  overflow-y: auto;
  border: 1px solid #ccc;
}

.item {
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #eee;
}
</style>
```

**4. 组件懒加载**
```javascript
import { defineAsyncComponent } from 'vue'

// 基础用法
const AsyncComp = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
)

// 带选项
const AsyncCompWithOptions = defineAsyncComponent({
  loader: () => import('./components/AsyncComponent.vue'),
  
  // 加载中显示的组件
  loadingComponent: LoadingSpinner,
  
  // 加载失败显示的组件
  errorComponent: ErrorComponent,
  
  // 延迟显示加载组件的时间（默认 200ms）
  delay: 200,
  
  // 超时时间
  timeout: 3000,
  
  // 是否挂起（配合 Suspense 使用）
  suspensible: false,
  
  // 错误处理
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) {
      retry() // 重试
    } else {
      fail() // 失败
    }
  }
})
```

**5. KeepAlive 缓存优化**
```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const cachedViews = ref(['Home', 'UserList', 'ProductList'])

// 动态控制缓存
watch(() => route.meta.keepAlive, (shouldCache) => {
  const componentName = route.name
  
  if (shouldCache && !cachedViews.value.includes(componentName)) {
    cachedViews.value.push(componentName)
  } else if (!shouldCache) {
    const index = cachedViews.value.indexOf(componentName)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }
})
</script>

<template>
  <RouterView v-slot="{ Component }">
    <KeepAlive :include="cachedViews" :max="10">
      <component :is="Component" :key="$route.fullPath" />
    </KeepAlive>
  </RouterView>
</template>
```

**6. 计算属性缓存**
```javascript
import { ref, computed } from 'vue'

const items = ref([/* 大量数据 */])
const filter = ref('')

// ✅ 好：使用 computed 缓存
const filteredItems = computed(() => {
  console.log('Filtering...') // 只在依赖变化时执行
  return items.value.filter(item => 
    item.name.includes(filter.value)
  )
})

// ❌ 不好：每次渲染都计算
function getFilteredItems() {
  console.log('Filtering...') // 每次渲染都执行
  return items.value.filter(item => 
    item.name.includes(filter.value)
  )
}
```

**性能对比**：

| 优化方法 | 适用场景 | 性能提升 |
|---------|---------|---------|
| v-memo | 大列表、复杂子树 | 30-50% |
| shallowRef/Reactive | 大对象、不需要深层响应式 | 20-40% |
| 虚拟列表 | 10000+ 条数据 | 90%+ |
| 懒加载 | 大型组件、路由 | 首屏 50%+ |
| KeepAlive | 频繁切换的组件 | 避免重复渲染 |

**追问点**：
- Q: v-once 和 v-memo 的区别？
  - A: v-once 只渲染一次，v-memo 可以根据依赖重新渲染
- Q: 虚拟列表的局限性？
  - A: 需要固定或可预测的高度，不支持复杂布局
- Q: 如何监控性能？
  - A: 使用 Vue DevTools 的 Performance 面板

---

### 8. Composables 最佳实践？

**难度**: ⭐⭐⭐⭐☆

**问题**：
什么是 Composables？如何编写高质量的 Composables？

**答案**：

**Composables 定义**：
- 使用 Composition API 封装可复用逻辑的函数
- 命名约定：以 `use` 开头
- 可以使用响应式 API、生命周期钩子等

**1. 鼠标位置追踪**
```typescript
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}

// 使用
<script setup>
import { useMouse } from '@/composables/useMouse'

const { x, y } = useMouse()
</script>

<template>
  <div>鼠标位置: {{ x }}, {{ y }}</div>
</template>
```

**2. 数据请求封装**
```typescript
// composables/useFetch.ts
import { ref, unref, watchEffect, toValue, type Ref } from 'vue'

export function useFetch<T>(url: string | Ref<string>) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  watchEffect(async () => {
    loading.value = true
    error.value = null
    data.value = null

    try {
      // toValue() 在 3.3+ 中可用，会自动解包 ref
      const urlValue = toValue(url)
      const res = await fetch(urlValue)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      data.value = await res.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  })

  return { data, error, loading }
}

// 使用
<script setup>
import { ref, computed } from 'vue'
import { useFetch } from '@/composables/useFetch'

const userId = ref(1)
const url = computed(() => `/api/users/${userId.value}`)

const { data: user, loading, error } = useFetch(url)
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">错误: {{ error.message }}</div>
  <div v-else-if="user">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
  </div>
</template>
```

**3. 本地存储同步**
```typescript
// composables/useLocalStorage.ts
import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): Ref<T> {
  const data = ref<T>(defaultValue)

  // 从 localStorage 读取初始值
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      data.value = JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse localStorage value:', e)
    }
  }

  // 监听变化并同步到 localStorage
  watch(
    data,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  return data as Ref<T>
}

// 使用
<script setup>
import { useLocalStorage } from '@/composables/useLocalStorage'

const theme = useLocalStorage('theme', 'light')
const userSettings = useLocalStorage('settings', {
  notifications: true,
  language: 'zh-CN'
})
</script>
```

**4. 防抖和节流**
```typescript
// composables/useDebounce.ts
import { ref, watch, type Ref } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay = 300): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout>

  watch(value, (newValue) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}

// composables/useThrottle.ts
export function useThrottle<T>(value: Ref<T>, delay = 300): Ref<T> {
  const throttledValue = ref(value.value) as Ref<T>
  let lastUpdate = 0

  watch(value, (newValue) => {
    const now = Date.now()
    if (now - lastUpdate >= delay) {
      throttledValue.value = newValue
      lastUpdate = now
    }
  })

  return throttledValue
}

// 使用
<script setup>
import { ref, watch } from 'vue'
import { useDebounce } from '@/composables/useDebounce'

const searchQuery = ref('')
const debouncedQuery = useDebounce(searchQuery, 500)

// 只有当用户停止输入 500ms 后才会触发搜索
watch(debouncedQuery, (query) => {
  performSearch(query)
})
</script>
```

**5. 网络状态监听**
```typescript
// composables/useOnline.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useOnline() {
  const isOnline = ref(navigator.onLine)

  function updateOnlineStatus() {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  })

  return { isOnline }
}

// 使用
<script setup>
import { useOnline } from '@/composables/useOnline'

const { isOnline } = useOnline()
</script>

<template>
  <div v-if="!isOnline" class="offline-banner">
    您当前处于离线状态
  </div>
</template>
```

**Composables 最佳实践**：
1. **命名约定**：以 `use` 开头
2. **返回值**：返回 ref 或 reactive 对象
3. **清理副作用**：在 onUnmounted 中清理
4. **参数灵活**：支持 ref 和普通值
5. **类型安全**：使用 TypeScript
6. **单一职责**：每个 composable 只做一件事

**追问点**：
- Q: Composables 和 Mixins 的区别？
  - A: Composables 更灵活、无命名冲突、类型推断更好
- Q: 如何测试 Composables？
  - A: 使用 @vue/test-utils 的 renderless 组件测试
- Q: Composables 可以嵌套使用吗？
  - A: 可以，一个 composable 可以调用其他 composables

---

## 高级题（加分）

### 9. Vue 3 响应式原理？

**难度**: ⭐⭐⭐⭐⭐

**问题**：
Vue 3 的响应式系统是如何实现的？Proxy 相比 Object.defineProperty 有什么优势？

**答案**：

**Proxy 实现原理**：
```javascript
// 简化的 reactive 实现
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
let activeEffect = null

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

// effect 函数
function effect(fn) {
  activeEffect = fn
  fn()
  activeEffect = null
}
```

**Proxy vs Object.defineProperty 对比**：

| 特性 | Vue 2 (Object.defineProperty) | Vue 3 (Proxy) |
|------|-------------------------------|---------------|
| 对象属性添加 | 需要 Vue.set | 自动检测 ✅ |
| 对象属性删除 | 需要 Vue.delete | 自动检测 ✅ |
| 数组索引修改 | 需要 Vue.set | 自动检测 ✅ |
| 数组长度修改 | 不支持 | 支持 ✅ |
| Map/Set 支持 | 不支持 | 支持 ✅ |
| 性能 | 初始化时递归遍历 | 惰性代理 ✅ |
| 浏览器兼容 | IE9+ | 不支持 IE |

**代码对比**：
```javascript
// Vue 2 的限制
const obj = { count: 0 }
obj.newProp = 1 // ❌ 不会触发更新
Vue.set(obj, 'newProp', 1) // ✅ 需要使用 Vue.set

const arr = [1, 2, 3]
arr[0] = 10 // ❌ 不会触发更新
Vue.set(arr, 0, 10) // ✅ 需要使用 Vue.set

// Vue 3 自动检测
const state = reactive({ count: 0 })
state.newProp = 1 // ✅ 自动触发更新

const arr = reactive([1, 2, 3])
arr[0] = 10 // ✅ 自动触发更新
arr.length = 0 // ✅ 自动触发更新

// 支持 Map 和 Set
const map = reactive(new Map())
map.set('key', 'value') // ✅ 响应式

const set = reactive(new Set())
set.add(1) // ✅ 响应式
```

**追问点**：
- Q: Proxy 的性能开销？
  - A: 初始化更快（惰性代理），但访问时有轻微开销
- Q: 如何处理 Proxy 不支持的浏览器？
  - A: Vue 3 不支持 IE11，需要使用 Vue 2
- Q: ref 的实现原理？
  - A: 使用 getter/setter 包装对象，在模板中自动解包

---

### 10. 编译优化原理？

**难度**: ⭐⭐⭐⭐⭐

**问题**：
Vue 3 的编译器做了哪些优化？什么是 PatchFlags 和 Block Tree？

**答案**：

**编译优化策略**：

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

// 编译示例
<div :class="className">{{ text }}</div>

// 编译后
_createElementVNode("div", {
  class: _ctx.className
}, _toDisplayString(_ctx.text), 3 /* TEXT, CLASS */)
```

**3. Block Tree**
- 将动态节点收集到 Block 中
- 更新时只对比 Block 内的动态节点
- 跳过静态内容的对比

```javascript
// Block 示例
<div>
  <p>Static</p>
  <p>{{ dynamic1 }}</p>
  <p>Static</p>
  <p>{{ dynamic2 }}</p>
</div>

// 编译后的 Block
{
  type: 'div',
  dynamicChildren: [
    { type: 'p', children: dynamic1, patchFlag: TEXT },
    { type: 'p', children: dynamic2, patchFlag: TEXT }
  ]
}
```

**4. 缓存事件处理器**
```vue
<template>
  <button @click="handleClick">Click</button>
</template>

<!-- 编译后 -->
<script>
// 事件处理器被缓存
const _cache = []
_cache[0] = _ctx.handleClick
</script>
```

**性能提升**：
- 静态提升：减少创建 VNode 的开销
- PatchFlags：精确更新，跳过不必要的对比
- Block Tree：减少遍历节点数量
- 事件缓存：避免重复创建函数

**追问点**：
- Q: 如何查看编译结果？
  - A: 使用 Vue SFC Playground 或 @vue/compiler-sfc
- Q: v-once 和静态提升的区别？
  - A: v-once 运行时跳过更新，静态提升是编译时优化
- Q: 如何禁用编译优化？
  - A: 使用 compilerOptions.hoistStatic: false

---

## 场景题（实战）

### 11. 组件状态丢失问题？

**难度**: ⭐⭐⭐☆☆

**问题**：
列表拖拽排序后，组件的内部状态（如输入框的值）错位了，如何解决？

**答案**：

**问题原因**：
- 使用数组索引作为 key
- 拖拽后索引改变，Vue 复用了错误的组件实例

**错误示例**：
```vue
<script setup>
import { ref } from 'vue'

const todos = ref([
  { text: 'Learn Vue', done: false },
  { text: 'Build App', done: false },
])

function moveTodo(from, to) {
  const [moved] = todos.value.splice(from, 1)
  todos.value.splice(to, 0, moved)
}
</script>

<template>
  <div v-for="(todo, index) in todos" :key="index">
    <!-- ❌ 错误：使用索引作为 key -->
    <input v-model="todo.text" />
  </div>
</template>
```

**正确示例**：
```vue
<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, text: 'Learn Vue', done: false },
  { id: 2, text: 'Build App', done: false },
])

function moveTodo(from, to) {
  const [moved] = todos.value.splice(from, 1)
  todos.value.splice(to, 0, moved)
}
</script>

<template>
  <div v-for="todo in todos" :key="todo.id">
    <!-- ✅ 正确：使用唯一 ID -->
    <input v-model="todo.text" />
  </div>
</template>
```

**受控组件方案**：
```vue
<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, text: 'Learn Vue', editing: false },
  { id: 2, text: 'Build App', editing: false },
])

function updateTodo(id, updates) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    Object.assign(todo, updates)
  }
}
</script>

<template>
  <div v-for="todo in todos" :key="todo.id">
    <input
      v-if="todo.editing"
      :value="todo.text"
      @input="updateTodo(todo.id, { text: $event.target.value })"
    />
    <span v-else @click="updateTodo(todo.id, { editing: true })">
      {{ todo.text }}
    </span>
  </div>
</template>
```

**追问点**：
- Q: 什么时候需要重置组件状态？
  - A: key 改变时，Vue 会卸载旧组件，挂载新组件
- Q: 如何生成唯一 ID？
  - A: 使用 UUID 库、nanoid，或服务端返回的 ID
- Q: 虚拟列表如何处理 key？
  - A: 使用 itemKey 函数指定 key 生成规则

---

### 12. 内存泄漏排查？

**难度**: ⭐⭐⭐⭐☆

**问题**：
组件卸载后内存没有释放，如何排查和解决内存泄漏？

**答案**：

**常见原因**：

**1. 定时器未清理**
```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

let timer

onMounted(() => {
  // ❌ 错误：定时器未清理
  timer = setInterval(() => {
    console.log('tick')
  }, 1000)
})

// ✅ 正确：清理定时器
onUnmounted(() => {
  clearInterval(timer)
})
</script>
```

**2. 事件监听器未移除**
```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

function handleResize() {
  console.log('resize')
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// ✅ 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
```

**3. 第三方库实例未销毁**
```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import ECharts from 'echarts'

const chartRef = ref()
let chartInstance

onMounted(() => {
  chartInstance = ECharts.init(chartRef.value)
  chartInstance.setOption({/* ... */})
})

// ✅ 销毁图表实例
onUnmounted(() => {
  chartInstance?.dispose()
})
</script>

<template>
  <div ref="chartRef" style="width: 600px; height: 400px"></div>
</template>
```

**4. 全局状态未清理**
```javascript
// ❌ 错误：组件卸载后仍持有引用
const globalStore = {
  listeners: []
}

export default {
  setup() {
    const listener = () => console.log('event')
    globalStore.listeners.push(listener)
    
    // 忘记清理
  }
}

// ✅ 正确：清理全局引用
export default {
  setup() {
    const listener = () => console.log('event')
    globalStore.listeners.push(listener)
    
    onUnmounted(() => {
      const index = globalStore.listeners.indexOf(listener)
      if (index > -1) {
        globalStore.listeners.splice(index, 1)
      }
    })
  }
}
```

**5. 闭包引用大对象**
```vue
<script setup>
import { ref, watch } from 'vue'

const largeData = ref(new Array(1000000).fill(0))

// ❌ 错误：闭包持有 largeData 引用
watch(someValue, () => {
  console.log(largeData.value.length)
})

// ✅ 正确：只引用需要的数据
const dataLength = computed(() => largeData.value.length)
watch(someValue, () => {
  console.log(dataLength.value)
})
</script>
```

**排查工具**：
1. **Chrome DevTools Memory Profiler**
   - 拍摄堆快照
   - 对比组件挂载前后的内存
   - 查找 Detached DOM 节点

2. **Vue DevTools**
   - 查看组件树
   - 检查是否有未卸载的组件

3. **Performance Monitor**
   - 监控内存使用趋势
   - 查看 JS Heap Size

**追问点**：
- Q: 如何检测内存泄漏？
  - A: 重复挂载/卸载组件，观察内存是否持续增长
- Q: WeakMap 和 Map 的区别？
  - A: WeakMap 的 key 是弱引用，可以被垃圾回收
- Q: 如何避免闭包陷阱？
  - A: 使用 computed 或在 watch 中只引用需要的数据

---

### 13. SSR 水合不匹配？

**难度**: ⭐⭐⭐⭐☆

**问题**：
服务端渲染后，客户端水合时出现警告：Hydration mismatch，如何解决？

**答案**：

**常见原因**：

**1. 使用浏览器 API**
```vue
<script setup>
import { ref, onMounted } from 'vue'

// ❌ 错误：服务端没有 window
const width = ref(window.innerWidth)

// ✅ 正确：只在客户端获取
const width = ref(0)
onMounted(() => {
  width.value = window.innerWidth
})
</script>
```

**2. 随机数或时间戳**
```vue
<script setup>
import { ref, onMounted } from 'vue'

// ❌ 错误：服务端和客户端值不同
const id = ref(Math.random())
const time = ref(Date.now())

// ✅ 正确：使用固定值或在客户端生成
const id = ref(null)
onMounted(() => {
  id.value = Math.random()
})
</script>
```

**3. 第三方库渲染不一致**
```vue
<script setup>
import { ref, onMounted } from 'vue'

const isClient = ref(false)

onMounted(() => {
  isClient.value = true
})
</script>

<template>
  <!-- 服务端不渲染，客户端才渲染 -->
  <ClientOnly>
    <ThirdPartyComponent />
  </ClientOnly>
  
  <!-- 或使用条件渲染 -->
  <ThirdPartyComponent v-if="isClient" />
</template>
```

**4. 条件渲染差异**
```vue
<script setup>
import { ref } from 'vue'

// ❌ 错误：服务端和客户端条件不同
const isMobile = ref(window.innerWidth < 768)

// ✅ 正确：使用 User-Agent 或统一的初始值
const isMobile = ref(false) // 服务端默认 false
onMounted(() => {
  isMobile.value = window.innerWidth < 768
})
</script>
```

**解决方案**：

**1. 使用 ClientOnly 组件**
```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    
    <!-- 只在客户端渲染 -->
    <ClientOnly>
      <BrowserOnlyComponent />
      <template #fallback>
        <div>Loading...</div>
      </template>
    </ClientOnly>
  </div>
</template>
```

**2. 检查环境**
```javascript
// 检查是否在浏览器环境
if (typeof window !== 'undefined') {
  // 浏览器代码
}

// 或使用 import.meta.env.SSR
if (!import.meta.env.SSR) {
  // 客户端代码
}
```

**3. 统一初始状态**
```vue
<script setup>
import { ref, onMounted } from 'vue'

// 服务端和客户端使用相同的初始值
const data = ref(null)

onMounted(async () => {
  // 客户端再获取数据
  data.value = await fetchData()
})
</script>
```

**追问点**：
- Q: 什么是水合（Hydration）？
  - A: 客户端接管服务端渲染的 HTML，添加事件监听器和响应式
- Q: 如何调试水合不匹配？
  - A: 查看控制台警告，对比服务端和客户端的 HTML
- Q: 水合失败会怎样？
  - A: Vue 会销毁服务端 HTML，重新渲染，失去 SSR 的优势

---

## 反问环节

### 1. 团队的技术栈和开发规范？

**问题**：
- 使用的 Vue 版本？是否计划升级到 Vue 3？
- 状态管理方案？Pinia 还是 Vuex？
- UI 组件库？Element Plus、Ant Design Vue 还是自研？
- 是否使用 TypeScript？代码规范如何？
- 是否使用 Vite？构建工具是什么？

**为什么问**：
- 了解技术栈，评估学习成本
- 了解团队规范，快速融入
- 评估项目现代化程度

---

### 2. 项目架构和代码质量？

**问题**：
- 项目规模？代码行数？组件数量？
- 是否有组件库？Storybook？设计系统？
- 测试覆盖率？使用什么测试框架？
- CI/CD 流程？代码审查机制？
- 是否使用 Monorepo？如何管理多个项目？

**为什么问**：
- 评估项目复杂度
- 了解代码质量要求
- 了解工程化水平

---

### 3. 性能优化和监控？

**问题**：
- 是否有性能监控？使用什么工具？
- 首屏加载时间要求？
- 是否使用 SSR/SSG？
- 如何处理大数据量渲染？
- 移动端性能优化策略？

**为什么问**：
- 了解性能要求
- 评估技术挑战
- 了解优化经验

---

### 4. 团队协作和成长？

**问题**：
- 团队规模？前端团队多少人？
- 技术分享机制？
- 是否有导师制度？
- 技术选型的决策流程？
- 如何平衡业务需求和技术债？

**为什么问**：
- 了解团队氛围
- 评估成长空间
- 了解技术话语权

---

## 📚 学习资源

### 官方文档
- [Vue 3 官方文档](https://cn.vuejs.org/) - 最新的官方文档
- [Vue Router 4](https://router.vuejs.org/zh/) - 官方路由
- [Pinia](https://pinia.vuejs.org/zh/) - 官方状态管理
- [VueUse](https://vueuse.org/) - Vue 组合式工具集
- [Vite](https://cn.vitejs.dev/) - 下一代构建工具

### 推荐阅读
- [Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/) - 深入理解 Vue 原理
- [Vue.js 设计与实现](https://book.douban.com/subject/35768338/) - HcySunYang 著
- [Vue 3 源码解析](https://vue3js.cn/) - 源码学习

### 社区资源
- [Awesome Vue](https://github.com/vuejs/awesome-vue) - Vue 资源大全
- [Vue Land Discord](https://chat.vuejs.org/) - Vue 官方社区
- [Vue.js Developers](https://vuejsdevelopers.com/) - Vue 开发者社区

---

## 🎯 总结

本文档涵盖了 Vue 3 面试的核心知识点：

**基础题（必会）**：
- Composition API vs Options API
- ref vs reactive
- watch vs watchEffect
- 生命周期钩子
- 组件通信方式

**进阶题（重要）**：
- Teleport 和 Suspense
- 性能优化最佳实践
- Composables 最佳实践

**高级题（加分）**：
- Vue 3 响应式原理
- 编译优化原理

**场景题（实战）**：
- 组件状态丢失问题
- 内存泄漏排查
- SSR 水合不匹配

掌握这些知识点，你将能够自信地应对 Vue 3 面试！

---

**最后更新**: 2025-02
