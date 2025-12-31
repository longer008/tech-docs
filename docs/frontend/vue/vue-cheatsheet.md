# Vue 速查表

> Vue 2/3 常用语法与 API 速查

## 模板语法

### 插值
```vue
<!-- 文本插值 -->
{{ message }}

<!-- 原始 HTML -->
<span v-html="rawHtml"></span>

<!-- 属性绑定 -->
<div :id="dynamicId"></div>
<div :[attrName]="value"></div>

<!-- 表达式 -->
{{ number + 1 }}
{{ ok ? 'YES' : 'NO' }}
{{ message.split('').reverse().join('') }}
```

### 指令
```vue
<!-- v-bind 缩写 -->
<a :href="url">Link</a>
<div :class="{ active: isActive }"></div>
<div :style="{ color: textColor }"></div>

<!-- v-on 缩写 -->
<button @click="handleClick">Click</button>
<input @keyup.enter="submit">

<!-- v-model -->
<input v-model="message">
<input v-model.lazy="message">
<input v-model.number="age">
<input v-model.trim="message">

<!-- 条件渲染 -->
<div v-if="type === 'A'">A</div>
<div v-else-if="type === 'B'">B</div>
<div v-else>C</div>

<div v-show="isVisible">Show/Hide</div>

<!-- 列表渲染 -->
<li v-for="item in items" :key="item.id">
  {{ item.name }}
</li>

<li v-for="(item, index) in items" :key="index">
  {{ index }}: {{ item.name }}
</li>

<div v-for="(value, key, index) in object" :key="key">
  {{ index }}. {{ key }}: {{ value }}
</div>
```

### Class 与 Style 绑定
```vue
<!-- 对象语法 -->
<div :class="{ active: isActive, 'text-danger': hasError }"></div>

<!-- 数组语法 -->
<div :class="[activeClass, errorClass]"></div>
<div :class="[isActive ? activeClass : '', errorClass]"></div>
<div :class="[{ active: isActive }, errorClass]"></div>

<!-- 内联样式 -->
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
<div :style="[baseStyles, overridingStyles]"></div>
```

### 事件处理
```vue
<!-- 方法处理器 -->
<button @click="increment">+1</button>

<!-- 内联处理器 -->
<button @click="count++">+1</button>
<button @click="say('hello', $event)">Say</button>

<!-- 事件修饰符 -->
<a @click.stop="doThis">阻止冒泡</a>
<form @submit.prevent="onSubmit">阻止默认</form>
<a @click.stop.prevent="doThat">链式</a>
<div @click.capture="doThis">捕获模式</div>
<div @click.self="doThat">只在自身触发</div>
<button @click.once="doThis">只触发一次</button>
<div @scroll.passive="onScroll">优化滚动</div>

<!-- 按键修饰符 -->
<input @keyup.enter="submit">
<input @keyup.tab="onTab">
<input @keyup.delete="onDelete">
<input @keyup.esc="onEsc">
<input @keyup.space="onSpace">
<input @keyup.up="onUp">
<input @keyup.down="onDown">
<input @keyup.left="onLeft">
<input @keyup.right="onRight">

<!-- 系统修饰键 -->
<input @keyup.ctrl="onCtrl">
<input @keyup.alt="onAlt">
<input @keyup.shift="onShift">
<input @keyup.meta="onMeta">
<div @click.ctrl="onClick">Ctrl+Click</div>
<div @click.ctrl.exact="onCtrlClick">仅 Ctrl+Click</div>

<!-- 鼠标按钮修饰符 -->
<button @click.left="onClick">左键</button>
<button @click.right="onRightClick">右键</button>
<button @click.middle="onMiddleClick">中键</button>
```

## Composition API (Vue 3)

### 响应式
```javascript
import {
  ref,
  reactive,
  computed,
  readonly,
  shallowRef,
  shallowReactive,
  toRef,
  toRefs,
  isRef,
  isReactive,
  unref
} from 'vue'

// ref - 任意类型
const count = ref(0)
count.value++

// reactive - 对象类型
const state = reactive({ count: 0 })
state.count++

// computed
const doubled = computed(() => count.value * 2)

// computed with getter/setter
const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (val) => {
    [firstName.value, lastName.value] = val.split(' ')
  }
})

// readonly
const readonlyState = readonly(state)

// toRefs - 解构保持响应式
const { name, age } = toRefs(state)

// toRef - 单个属性
const nameRef = toRef(state, 'name')

// unref - 获取值
const value = unref(maybeRef) // ref ? ref.value : ref
```

### 侦听器
```javascript
import { watch, watchEffect, watchPostEffect } from 'vue'

// watch 单个 ref
watch(count, (newVal, oldVal) => {
  console.log(`${oldVal} -> ${newVal}`)
})

// watch reactive 对象的属性
watch(
  () => state.count,
  (newVal) => console.log(newVal)
)

// watch 多个源
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  // ...
})

// watch 选项
watch(source, callback, {
  immediate: true,  // 立即执行
  deep: true,       // 深度监听
  flush: 'post',    // 'pre' | 'post' | 'sync'
  once: true        // Vue 3.4+ 只执行一次
})

// watchEffect - 自动追踪
const stop = watchEffect(() => {
  console.log(count.value) // 自动追踪依赖
})
stop() // 停止监听

// watchPostEffect - DOM 更新后执行
watchPostEffect(() => {
  // 可安全访问更新后的 DOM
})
```

### 生命周期
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

onMounted(() => {
  console.log('mounted')
})

onUnmounted(() => {
  console.log('unmounted')
})

onErrorCaptured((err, instance, info) => {
  console.error(err)
  return false // 阻止错误继续传播
})
```

### 依赖注入
```javascript
import { provide, inject } from 'vue'

// 祖先组件
provide('key', value)
provide('key', ref(value)) // 响应式

// 后代组件
const value = inject('key')
const value = inject('key', 'default') // 默认值
const value = inject('key', () => computeDefault(), true) // 工厂函数
```

### 组合式函数 (Composables)
```javascript
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

## 组件

### Script Setup
```vue
<script setup lang="ts">
// Props
interface Props {
  title: string
  count?: number
}
const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// Emits
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()

// Expose
defineExpose({
  publicMethod,
  publicRef
})

// Slots
const slots = defineSlots<{
  default(props: { msg: string }): any
  header(): any
}>()

// Model (Vue 3.4+)
const model = defineModel<string>()

// Attrs
import { useAttrs } from 'vue'
const attrs = useAttrs()
</script>
```

### 插槽
```vue
<!-- 子组件 -->
<template>
  <div>
    <!-- 默认插槽 -->
    <slot></slot>

    <!-- 具名插槽 -->
    <slot name="header"></slot>

    <!-- 作用域插槽 -->
    <slot name="item" :item="item" :index="index"></slot>
  </div>
</template>

<!-- 父组件 -->
<MyComponent>
  <!-- 默认插槽 -->
  <p>Default content</p>

  <!-- 具名插槽 -->
  <template #header>
    <h1>Header</h1>
  </template>

  <!-- 作用域插槽 -->
  <template #item="{ item, index }">
    <li>{{ index }}: {{ item.name }}</li>
  </template>
</MyComponent>
```

## Vue Router 4

```javascript
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/user/:id', component: User, props: true },
    { path: '/admin', component: Admin, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ]
})

// 导航守卫
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login'
  }
})

// 组合式 API
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

router.push('/users')
router.push({ name: 'user', params: { id: 1 } })
router.replace('/users')
router.go(-1)

console.log(route.params.id)
console.log(route.query.search)
```

## Pinia

```javascript
// stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)

  // Getters
  const doubled = computed(() => count.value * 2)

  // Actions
  function increment() {
    count.value++
  }

  async function incrementAsync() {
    await new Promise(r => setTimeout(r, 1000))
    count.value++
  }

  return { count, doubled, increment, incrementAsync }
})

// 使用
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()
store.count
store.doubled
store.increment()
store.$reset()
store.$patch({ count: 10 })
```

## 常用工具函数

```javascript
import { nextTick, defineAsyncComponent } from 'vue'

// nextTick - 等待 DOM 更新
async function onClick() {
  count.value++
  await nextTick()
  // DOM 已更新
}

// 异步组件
const AsyncComp = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
)

const AsyncCompWithOptions = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

## TypeScript 类型

```typescript
import type {
  Ref,
  ComputedRef,
  PropType,
  ComponentPublicInstance
} from 'vue'

// Ref 类型
const count: Ref<number> = ref(0)
const user: Ref<User | null> = ref(null)

// Props 类型
interface Props {
  items: Item[]
  callback: (id: number) => void
}

// 事件类型
const emit = defineEmits<{
  (e: 'change', id: number): void
}>()

// 模板引用类型
const inputRef = ref<HTMLInputElement | null>(null)
const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)

// 组件实例类型
type ComponentInstance = ComponentPublicInstance<{
  publicMethod: () => void
}>
```
