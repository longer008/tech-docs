# Vue 3 vs Vue 2 完整对比指南

> 详细对比 Vue 2.x 与 Vue 3.x 的核心差异与迁移指南
> 
> 📅 **更新时间**: 2025-02
> 
> 📚 **内容来源**: Vue 3 官方文档、Vue 2 官方文档、Vue 3 迁移指南

[[toc]]

---

## 📋 目录

- [核心变化概览](#核心变化概览)
- [响应式系统对比](#响应式系统对比)
- [API 风格对比](#api-风格对比)
- [组件功能对比](#组件功能对比)
- [性能优化对比](#性能优化对比)
- [新增特性](#新增特性)
- [破坏性变化](#破坏性变化)
- [迁移指南](#迁移指南)
- [常见问题](#常见问题)

---

## 核心变化概览

### 主要改进

| 特性 | Vue 2 | Vue 3 | 提升 |
|------|-------|-------|------|
| 响应式系统 | Object.defineProperty | Proxy | 更强大 ✅ |
| API 风格 | Options API | Options + Composition API | 更灵活 ✅ |
| TypeScript | 有限支持 | 原生支持 | 更好 ✅ |
| 性能 | 基准 | 提升 30-50% | 更快 ✅ |
| 打包大小 | ~22kb | ~13kb (Tree-shakable) | 更小 ✅ |
| Fragment | 不支持 | 支持 | 新增 ✅ |
| Teleport | 无 | 支持 | 新增 ✅ |
| Suspense | 无 | 支持 | 新增 ✅ |
| 多根节点 | 不支持 | 支持 | 新增 ✅ |
| 自定义渲染器 | 困难 | 简单 | 更好 ✅ |

### 版本兼容性

```javascript
// Vue 2.7（过渡版本）
// - 支持部分 Composition API
// - 仍使用 Object.defineProperty
// - 兼容 Vue 2 生态

// Vue 3.x（推荐）
// - 完整的 Composition API
// - 使用 Proxy
// - 新的生态系统
```

---

## 响应式系统对比

### 实现原理差异

**Vue 2：Object.defineProperty**

```javascript
// Vue 2 响应式实现（简化版）
function defineReactive(obj, key, val) {
  const dep = new Dep()
  
  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.depend() // 依赖收集
      }
      return val
    },
    set(newVal) {
      if (newVal === val) return
      val = newVal
      dep.notify() // 触发更新
    }
  })
}

// 初始化时递归遍历所有属性
function observe(obj) {
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}
```

**Vue 3：Proxy**

```javascript
// Vue 3 响应式实现（简化版）
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key) // 依赖收集
      const result = Reflect.get(target, key, receiver)
      
      // 惰性代理：只在访问时代理嵌套对象
      if (typeof result === 'object' && result !== null) {
        return reactive(result)
      }
      
      return result
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      
      if (oldValue !== value) {
        trigger(target, key) // 触发更新
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
```

### 功能对比

**Vue 2 的限制**：

```javascript
// Vue 2 无法检测的变化
export default {
  data() {
    return {
      user: { name: 'John' },
      items: ['a', 'b', 'c']
    }
  },
  methods: {
    updateData() {
      // ❌ 无法检测属性添加
      this.user.age = 25 // 不会触发更新
      this.$set(this.user, 'age', 25) // ✅ 需要使用 $set
      
      // ❌ 无法检测属性删除
      delete this.user.name // 不会触发更新
      this.$delete(this.user, 'name') // ✅ 需要使用 $delete
      
      // ❌ 无法检测数组索引赋值
      this.items[0] = 'x' // 不会触发更新
      this.$set(this.items, 0, 'x') // ✅ 需要使用 $set
      
      // ❌ 无法检测数组长度修改
      this.items.length = 0 // 不会触发更新
      this.items.splice(0) // ✅ 需要使用数组方法
    }
  }
}
```

**Vue 3 的改进**：

```javascript
import { reactive } from 'vue'

const state = reactive({
  user: { name: 'John' },
  items: ['a', 'b', 'c']
})

// ✅ 自动检测属性添加
state.user.age = 25 // 正常触发更新

// ✅ 自动检测属性删除
delete state.user.name // 正常触发更新

// ✅ 自动检测数组索引赋值
state.items[0] = 'x' // 正常触发更新

// ✅ 自动检测数组长度修改
state.items.length = 0 // 正常触发更新

// ✅ 支持 Map 和 Set
const map = reactive(new Map())
map.set('key', 'value') // 响应式

const set = reactive(new Set())
set.add(1) // 响应式
```

### 性能对比

| 指标 | Vue 2 | Vue 3 | 说明 |
|------|-------|-------|------|
| 初始化性能 | 递归遍历所有属性 | 惰性代理 | Vue 3 更快 |
| 内存占用 | 每个属性一个 getter/setter | 每个对象一个 Proxy | Vue 3 更少 |
| 深层对象 | 初始化时全部处理 | 访问时才处理 | Vue 3 更优 |
| 数组操作 | 需要特殊处理 | 原生支持 | Vue 3 更简单 |

---

## API 风格对比

### Options API vs Composition API

**Vue 2：Options API**

```vue
<script>
export default {
  name: 'Counter',
  
  // 数据
  data() {
    return {
      count: 0,
      message: 'Hello'
    }
  },
  
  // 计算属性
  computed: {
    doubled() {
      return this.count * 2
    },
    reversedMessage() {
      return this.message.split('').reverse().join('')
    }
  },
  
  // 侦听器
  watch: {
    count(newVal, oldVal) {
      console.log(`count: ${oldVal} -> ${newVal}`)
    }
  },
  
  // 方法
  methods: {
    increment() {
      this.count++
    },
    updateMessage(msg) {
      this.message = msg
    }
  },
  
  // 生命周期
  created() {
    console.log('Component created')
  },
  
  mounted() {
    console.log('Component mounted')
  },
  
  beforeDestroy() {
    console.log('Component will be destroyed')
  }
}
</script>

<template>
  <div>
    <p>Count: {{ count }}, Doubled: {{ doubled }}</p>
    <p>Message: {{ message }}, Reversed: {{ reversedMessage }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

**Vue 3：Composition API**

```vue
<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

// 数据
const count = ref(0)
const message = ref('Hello')

// 计算属性
const doubled = computed(() => count.value * 2)
const reversedMessage = computed(() => 
  message.value.split('').reverse().join('')
)

// 侦听器
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`)
})

// 方法
function increment() {
  count.value++
}

function updateMessage(msg) {
  message.value = msg
}

// 生命周期
console.log('Component created')

onMounted(() => {
  console.log('Component mounted')
})

onBeforeUnmount(() => {
  console.log('Component will be destroyed')
})
</script>

<template>
  <div>
    <p>Count: {{ count }}, Doubled: {{ doubled }}</p>
    <p>Message: {{ message }}, Reversed: {{ reversedMessage }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

### 逻辑复用对比

**Vue 2：Mixins（不推荐）**

```javascript
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
  beforeDestroy() {
    window.removeEventListener('mousemove', this.update)
  },
  methods: {
    update(e) {
      this.x = e.pageX
      this.y = e.pageY
    }
  }
}

// 使用（可能有命名冲突）
import mouseMixin from '@/mixins/mouse'

export default {
  mixins: [mouseMixin],
  mounted() {
    console.log(this.x, this.y) // 来自 mixin
  }
}
```

**Vue 3：Composables（推荐）**

```javascript
// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(e) {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}

// 使用（清晰明确，无命名冲突）
import { useMouse } from '@/composables/useMouse'

const { x, y } = useMouse()
console.log(x.value, y.value)
```

### TypeScript 支持对比

**Vue 2：有限支持**

```typescript
// Vue 2 + TypeScript
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class Counter extends Vue {
  count: number = 0
  
  get doubled(): number {
    return this.count * 2
  }
  
  increment(): void {
    this.count++
  }
}

// 或使用 vue-property-decorator
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class MyComponent extends Vue {
  @Prop({ type: String, required: true })
  readonly title!: string
  
  count: number = 0
}
```

**Vue 3：原生支持**

```typescript
// Vue 3 + TypeScript
<script setup lang="ts">
import { ref, computed } from 'vue'

// 类型推断
const count = ref(0) // Ref<number>
const message = ref('Hello') // Ref<string>

// 显式类型
const user = ref<User | null>(null)

// Props 类型
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// Emits 类型
const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'delete', id: string): void
}>()

// 计算属性类型推断
const doubled = computed(() => count.value * 2) // ComputedRef<number>

// 方法类型
function increment(): void {
  count.value++
}
</script>
```

---

## 组件功能对比

### 1. 组件根节点

**Vue 2：必须单根节点**

```vue
<template>
  <!-- ❌ 错误：多个根节点 -->
  <header>Header</header>
  <main>Content</main>
  <footer>Footer</footer>
  
  <!-- ✅ 正确：包装在单个根节点中 -->
  <div>
    <header>Header</header>
    <main>Content</main>
    <footer>Footer</footer>
  </div>
</template>
```

**Vue 3：支持多根节点（Fragment）**

```vue
<template>
  <!-- ✅ 正确：支持多个根节点 -->
  <header>Header</header>
  <main>Content</main>
  <footer>Footer</footer>
</template>
```

### 2. v-model 变化

**Vue 2：单个 v-model + .sync**

```vue
<!-- 父组件 -->
<template>
  <!-- v-model -->
  <CustomInput v-model="searchText" />
  <!-- 等价于 -->
  <CustomInput 
    :value="searchText" 
    @input="searchText = $event" 
  />
  
  <!-- .sync 修饰符 -->
  <TextDocument :title.sync="docTitle" />
  <!-- 等价于 -->
  <TextDocument 
    :title="docTitle" 
    @update:title="docTitle = $event" 
  />
</template>

<!-- 子组件 -->
<script>
export default {
  props: ['value'],
  methods: {
    updateValue(val) {
      this.$emit('input', val)
    }
  }
}
</script>
```

**Vue 3：多个 v-model**

```vue
<!-- 父组件 -->
<template>
  <!-- 单个 v-model（默认绑定 modelValue） -->
  <CustomInput v-model="searchText" />
  <!-- 等价于 -->
  <CustomInput 
    :modelValue="searchText" 
    @update:modelValue="searchText = $event" 
  />
  
  <!-- 多个 v-model -->
  <UserForm
    v-model:firstName="first"
    v-model:lastName="last"
    v-model:email="email"
  />
</template>

<!-- 子组件 -->
<script setup>
defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function updateValue(val) {
  emit('update:modelValue', val)
}

// 多个 v-model
defineProps(['firstName', 'lastName', 'email'])
defineEmits(['update:firstName', 'update:lastName', 'update:email'])
</script>
```

### 3. 插槽变化

**Vue 2：具名插槽和作用域插槽**

```vue
<!-- 父组件 -->
<template>
  <MyComponent>
    <!-- 默认插槽 -->
    <p>Default content</p>
    
    <!-- 具名插槽（旧语法） -->
    <template slot="header">
      <h1>Header</h1>
    </template>
    
    <!-- 作用域插槽（旧语法） -->
    <template slot="item" slot-scope="{ item }">
      <li>{{ item.name }}</li>
    </template>
  </MyComponent>
</template>

<!-- 子组件 -->
<template>
  <div>
    <slot name="header"></slot>
    <slot></slot>
    <slot name="item" :item="item"></slot>
  </div>
</template>
```

**Vue 3：统一的插槽语法**

```vue
<!-- 父组件 -->
<template>
  <MyComponent>
    <!-- 默认插槽 -->
    <p>Default content</p>
    
    <!-- 具名插槽（新语法） -->
    <template #header>
      <h1>Header</h1>
    </template>
    
    <!-- 作用域插槽（新语法） -->
    <template #item="{ item }">
      <li>{{ item.name }}</li>
    </template>
    
    <!-- 动态插槽名 -->
    <template #[dynamicSlotName]>
      <p>Dynamic slot</p>
    </template>
  </MyComponent>
</template>

<!-- 子组件 -->
<template>
  <div>
    <slot name="header"></slot>
    <slot></slot>
    <slot name="item" :item="item"></slot>
  </div>
</template>
```

### 4. 自定义指令

**Vue 2：指令钩子**

```javascript
Vue.directive('focus', {
  bind(el, binding, vnode) {
    // 指令第一次绑定到元素时调用
  },
  inserted(el, binding, vnode) {
    // 被绑定元素插入父节点时调用
    el.focus()
  },
  update(el, binding, vnode, oldVnode) {
    // 所在组件的 VNode 更新时调用
  },
  componentUpdated(el, binding, vnode, oldVnode) {
    // 指令所在组件的 VNode 及其子 VNode 全部更新后调用
  },
  unbind(el, binding, vnode) {
    // 指令与元素解绑时调用
  }
})
```

**Vue 3：重命名的指令钩子**

```javascript
app.directive('focus', {
  // Vue 2 的 bind → Vue 3 的 beforeMount
  beforeMount(el, binding, vnode) {
    // 指令第一次绑定到元素时调用
  },
  
  // Vue 2 的 inserted → Vue 3 的 mounted
  mounted(el, binding, vnode) {
    // 被绑定元素插入父节点时调用
    el.focus()
  },
  
  // Vue 2 的 update → 移除
  
  // Vue 2 的 componentUpdated → Vue 3 的 updated
  updated(el, binding, vnode, prevVnode) {
    // 所在组件的 VNode 更新后调用
  },
  
  // Vue 2 的 unbind → Vue 3 的 beforeUnmount
  beforeUnmount(el, binding, vnode) {
    // 指令与元素解绑前调用
  },
  
  // 新增：unmounted
  unmounted(el, binding, vnode) {
    // 指令与元素解绑后调用
  }
})
```

### 5. 异步组件

**Vue 2：工厂函数**

```javascript
// 简单的异步组件
const AsyncComponent = () => import('./AsyncComponent.vue')

// 带选项的异步组件
const AsyncComponentWithOptions = () => ({
  component: import('./AsyncComponent.vue'),
  loading: LoadingComponent,
  error: ErrorComponent,
  delay: 200,
  timeout: 3000
})

// 使用
export default {
  components: {
    AsyncComponent,
    AsyncComponentWithOptions
  }
}
```

**Vue 3：defineAsyncComponent**

```javascript
import { defineAsyncComponent } from 'vue'

// 简单的异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)

// 带选项的异步组件
const AsyncComponentWithOptions = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000,
  suspensible: false, // 新增：是否配合 Suspense 使用
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) {
      retry()
    } else {
      fail()
    }
  }
})
```

---

## 性能优化对比

### 编译优化

**Vue 2：基础优化**

```javascript
// Vue 2 编译结果（简化）
function render() {
  return h('div', [
    h('p', 'Static text'),
    h('p', this.dynamic)
  ])
}

// 每次更新都需要重新创建所有 VNode
```

**Vue 3：高级优化**

```javascript
// Vue 3 编译结果（简化）
const _hoisted_1 = h('p', 'Static text') // 静态提升

function render(_ctx) {
  return h('div', [
    _hoisted_1, // 复用静态节点
    h('p', _ctx.dynamic, 1 /* TEXT */) // PatchFlag 标记
  ])
}

// 只更新动态节点，跳过静态节点
```

### 性能提升数据

| 指标 | Vue 2 | Vue 3 | 提升 |
|------|-------|-------|------|
| 初始渲染 | 基准 | 快 55% | ⬆️ |
| 更新渲染 | 基准 | 快 133% | ⬆️⬆️ |
| 内存占用 | 基准 | 减少 54% | ⬇️ |
| 打包大小 | 22kb | 13kb | ⬇️ 41% |

### Tree-shaking 支持

**Vue 2：全量引入**

```javascript
import Vue from 'vue'

// 即使不使用某些功能，也会被打包
// 例如：transition、keep-alive 等
```

**Vue 3：按需引入**

```javascript
import { createApp, ref, computed } from 'vue'

// 只打包使用的功能
// 未使用的功能会被 tree-shaking 移除
```

---

## 新增特性

### 1. Teleport（传送门）

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
          <h2>模态框</h2>
          <p>这个内容被渲染到 body 元素下</p>
          <button @click="showModal = false">关闭</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
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
</style>
```

### 2. Suspense（异步组件加载）

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncUserProfile = defineAsyncComponent(() =>
  import('./UserProfile.vue')
)
</script>

<template>
  <Suspense>
    <!-- 异步组件 -->
    <template #default>
      <AsyncUserProfile :user-id="123" />
    </template>

    <!-- 加载中状态 -->
    <template #fallback>
      <div class="loading">
        <span>加载中...</span>
      </div>
    </template>
  </Suspense>
</template>

<!-- UserProfile.vue - 支持异步 setup -->
<script setup>
// 可以直接使用 await
const user = await fetch('/api/user/123').then(r => r.json())
const posts = await fetch('/api/user/123/posts').then(r => r.json())
</script>

<template>
  <div>
    <h2>{{ user.name }}</h2>
    <ul>
      <li v-for="post in posts" :key="post.id">
        {{ post.title }}
      </li>
    </ul>
  </div>
</template>
```

### 3. 多个 v-model

```vue
<!-- 父组件 -->
<script setup>
import { ref } from 'vue'

const firstName = ref('')
const lastName = ref('')
</script>

<template>
  <UserName
    v-model:first-name="firstName"
    v-model:last-name="lastName"
  />
</template>

<!-- 子组件 -->
<script setup>
defineProps(['firstName', 'lastName'])
const emit = defineEmits(['update:firstName', 'update:lastName'])
</script>

<template>
  <input
    :value="firstName"
    @input="emit('update:firstName', $event.target.value)"
  />
  <input
    :value="lastName"
    @input="emit('update:lastName', $event.target.value)"
  />
</template>
```

### 4. 自定义渲染器 API

```javascript
import { createRenderer } from '@vue/runtime-core'

// 创建自定义渲染器（例如：Canvas 渲染器）
const { render, createApp } = createRenderer({
  createElement(type) {
    // 创建元素
  },
  insert(el, parent, anchor) {
    // 插入元素
  },
  patchProp(el, key, prevValue, nextValue) {
    // 更新属性
  },
  remove(el) {
    // 移除元素
  },
  // ... 其他方法
})

// 使用自定义渲染器
const app = createApp(App)
app.mount('#canvas')
```

---

## 破坏性变化

### 1. 全局 API 变化

**Vue 2：全局 API**

```javascript
import Vue from 'vue'

// 全局配置
Vue.config.productionTip = false
Vue.config.devtools = true

// 全局注册
Vue.component('MyComponent', { /* ... */ })
Vue.directive('focus', { /* ... */ })
Vue.mixin({ /* ... */ })
Vue.use(VueRouter)

// 全局属性
Vue.prototype.$http = axios

// 创建实例
new Vue({
  render: h => h(App)
}).$mount('#app')
```

**Vue 3：应用实例 API**

```javascript
import { createApp } from 'vue'

const app = createApp(App)

// 应用配置
app.config.errorHandler = (err) => { /* ... */ }
app.config.warnHandler = (msg) => { /* ... */ }
app.config.globalProperties.$http = axios

// 应用注册
app.component('MyComponent', { /* ... */ })
app.directive('focus', { /* ... */ })
app.mixin({ /* ... */ })
app.use(VueRouter)

// 挂载
app.mount('#app')
```

### 2. 移除的 API

| 移除的 API | 替代方案 |
|-----------|---------|
| `$on` / `$off` / `$once` | 使用 mitt 或 tiny-emitter |
| `$children` | 使用 `$refs` 或 provide/inject |
| `$listeners` | 合并到 `$attrs` |
| `$scopedSlots` | 统一使用 `$slots` |
| 过滤器 | 使用方法或计算属性 |
| `keyCode` 修饰符 | 使用按键别名 |
| `Vue.set` / `Vue.delete` | 不再需要（Proxy 自动检测） |
| `Vue.observable` | 使用 `reactive` |

### 3. 行为变化

**v-if 和 v-for 优先级**

```vue
<!-- Vue 2：v-for 优先级高于 v-if -->
<div v-for="item in items" v-if="item.isActive">
  {{ item.name }}
</div>

<!-- Vue 3：v-if 优先级高于 v-for（会报错） -->
<!-- ❌ 错误：item 未定义 -->
<div v-for="item in items" v-if="item.isActive">
  {{ item.name }}
</div>

<!-- ✅ 正确：使用 template 或计算属性 -->
<template v-for="item in items" :key="item.id">
  <div v-if="item.isActive">
    {{ item.name }}
  </div>
</template>

<!-- 或使用计算属性 -->
<div v-for="item in activeItems" :key="item.id">
  {{ item.name }}
</div>
```

**v-bind 合并行为**

```vue
<!-- Vue 2：后面的覆盖前面的 -->
<div id="red" v-bind="{ id: 'blue' }"></div>
<!-- 结果：id="blue" -->

<!-- Vue 3：顺序决定优先级 -->
<div id="red" v-bind="{ id: 'blue' }"></div>
<!-- 结果：id="blue" -->

<div v-bind="{ id: 'blue' }" id="red"></div>
<!-- 结果：id="red" -->
```

**过渡类名变化**

```css
/* Vue 2 */
.v-enter { /* 进入开始 */ }
.v-enter-active { /* 进入过程 */ }
.v-enter-to { /* 进入结束 */ }
.v-leave { /* 离开开始 */ }
.v-leave-active { /* 离开过程 */ }
.v-leave-to { /* 离开结束 */ }

/* Vue 3 */
.v-enter-from { /* 进入开始（重命名） */ }
.v-enter-active { /* 进入过程 */ }
.v-enter-to { /* 进入结束 */ }
.v-leave-from { /* 离开开始（重命名） */ }
.v-leave-active { /* 离开过程 */ }
.v-leave-to { /* 离开结束 */ }
```

---

## 迁移指南

### 迁移步骤

**1. 评估项目**

```bash
# 检查依赖兼容性
npm outdated

# 查看 Vue 2 版本
npm list vue

# 查看生态库版本
npm list vue-router vuex
```

**2. 升级构建工具**

```bash
# 方案 1：升级 Vue CLI
npm install -g @vue/cli@latest
vue upgrade

# 方案 2：迁移到 Vite（推荐）
npm create vite@latest my-vue-app -- --template vue
```

**3. 安装 Vue 3**

```bash
# 安装 Vue 3 核心
npm install vue@3

# 安装生态库
npm install vue-router@4
npm install pinia  # 替代 Vuex

# 安装构建工具
npm install @vitejs/plugin-vue -D
```

**4. 使用迁移构建版本**

```javascript
// main.js
import { createApp } from '@vue/compat'
import App from './App.vue'

const app = createApp(App)

// 配置兼容模式
app.config.compilerOptions.compatConfig = {
  MODE: 2, // Vue 2 兼容模式
  COMPONENT_V_MODEL: false, // 禁用特定功能的兼容
}

app.mount('#app')
```

**5. 逐步修复警告**

```javascript
// 查看控制台警告
// [Vue warn]: COMPONENT_V_MODEL: ...
// [Vue warn]: GLOBAL_MOUNT: ...

// 逐个修复后，禁用兼容模式
app.config.compilerOptions.compatConfig = {
  MODE: 3, // Vue 3 模式
}
```

**6. 移除兼容版本**

```javascript
// main.js
import { createApp } from 'vue' // 移除 @vue/compat
import App from './App.vue'

createApp(App).mount('#app')
```

### 常见迁移问题

**问题 1：EventBus 不可用**

```javascript
// Vue 2
const EventBus = new Vue()
EventBus.$emit('event', data)
EventBus.$on('event', handler)

// Vue 3 解决方案
import mitt from 'mitt'

const emitter = mitt()
emitter.emit('event', data)
emitter.on('event', handler)
```

**问题 2：过滤器不可用**

```vue
<!-- Vue 2 -->
<template>
  <p>{{ price | currency }}</p>
</template>

<script>
export default {
  filters: {
    currency(value) {
      return '$' + value.toFixed(2)
    }
  }
}
</script>

<!-- Vue 3 解决方案 -->
<template>
  <p>{{ formatCurrency(price) }}</p>
</template>

<script setup>
function formatCurrency(value) {
  return '$' + value.toFixed(2)
}
</script>
```

**问题 3：$children 不可用**

```javascript
// Vue 2
this.$children.forEach(child => {
  child.doSomething()
})

// Vue 3 解决方案 1：使用 ref
<template>
  <ChildComponent ref="childRef" />
</template>

<script setup>
import { ref } from 'vue'

const childRef = ref()

function callChild() {
  childRef.value.doSomething()
}
</script>

// Vue 3 解决方案 2：使用 provide/inject
// 父组件
provide('parentMethod', () => {
  // ...
})

// 子组件
const parentMethod = inject('parentMethod')
```

### 迁移工具

**1. Vue 3 迁移构建版本**

```bash
# 安装迁移构建版本
npm install @vue/compat

# 配置 Vite
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      vue: '@vue/compat'
    }
  }
})
```

**2. ESLint 插件**

```bash
# 安装 Vue 3 ESLint 插件
npm install eslint-plugin-vue@latest -D

# .eslintrc.js
module.exports = {
  extends: [
    'plugin:vue/vue3-recommended'
  ]
}
```

**3. 官方迁移指南**

- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [破坏性变化列表](https://v3-migration.vuejs.org/breaking-changes/)
- [新特性介绍](https://v3-migration.vuejs.org/new/)

---

## 常见问题

### Q1: 应该升级到 Vue 3 吗？

**考虑因素**：

✅ **推荐升级的情况**：
- 新项目
- 需要更好的 TypeScript 支持
- 需要更好的性能
- 团队有时间进行迁移
- 依赖的库已支持 Vue 3

❌ **暂不升级的情况**：
- 项目稳定运行，无升级需求
- 依赖的库尚未支持 Vue 3
- 团队资源有限
- 需要支持 IE11

### Q2: Vue 3 兼容 IE11 吗？

**答案**：不兼容

- Vue 3 使用 Proxy，无法 polyfill
- 如需支持 IE11，继续使用 Vue 2
- Vue 2 将维护到 2023 年底（已延长）

### Q3: Vuex 还是 Pinia？

**对比**：

| 特性 | Vuex 4 | Pinia |
|------|--------|-------|
| Vue 3 支持 | ✅ | ✅ |
| TypeScript | 一般 | 优秀 ✅ |
| DevTools | ✅ | ✅ |
| 模块化 | 需要配置 | 自动 ✅ |
| 代码量 | 较多 | 较少 ✅ |
| 官方推荐 | - | ✅ |

**推荐**：新项目使用 Pinia

```javascript
// Pinia 示例
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: 'John',
    age: 25
  }),
  getters: {
    isAdult: (state) => state.age >= 18
  },
  actions: {
    updateName(name) {
      this.name = name
    }
  }
})
```

### Q4: 可以混用 Options API 和 Composition API 吗？

**答案**：可以

```vue
<script>
import { ref, onMounted } from 'vue'

export default {
  // Options API
  data() {
    return {
      count: 0
    }
  },
  
  // Composition API
  setup() {
    const message = ref('Hello')
    
    onMounted(() => {
      console.log('mounted')
    })
    
    return { message }
  },
  
  // Options API
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>
```

**建议**：
- 新组件使用 Composition API
- 旧组件可以保持 Options API
- 避免在同一组件中混用（除非必要）

### Q5: 如何处理第三方库不兼容？

**解决方案**：

1. **查找 Vue 3 版本**
   ```bash
   # 搜索 Vue 3 兼容版本
   npm search vue3-compatible-library
   ```

2. **使用兼容层**
   ```javascript
   // 使用 @vue/compat 提供兼容性
   import { createApp } from '@vue/compat'
   ```

3. **自己封装**
   ```javascript
   // 封装不兼容的库
   import OldLibrary from 'old-library'
   
   export function useOldLibrary() {
     // 适配代码
   }
   ```

4. **寻找替代品**
   - Element Plus（替代 Element UI）
   - Ant Design Vue 3（替代 Ant Design Vue 2）
   - VueUse（替代 vue-use）

### Q6: 性能提升有多大？

**实测数据**（来自官方）：

| 场景 | Vue 2 | Vue 3 | 提升 |
|------|-------|-------|------|
| 初始渲染 | 100ms | 45ms | 55% ⬆️ |
| 更新渲染 | 50ms | 21ms | 58% ⬆️ |
| 内存占用 | 100MB | 46MB | 54% ⬇️ |
| 打包大小 | 22.5kb | 13.5kb | 40% ⬇️ |

**注意**：实际提升取决于应用复杂度

### Q7: 学习曲线如何？

**难度评估**：

- **Options API → Options API**：⭐☆☆☆☆（几乎无学习成本）
- **Options API → Composition API**：⭐⭐⭐☆☆（需要理解响应式原理）
- **Vue 2 → Vue 3 迁移**：⭐⭐⭐⭐☆（需要处理破坏性变化）

**学习建议**：
1. 先学习 Composition API 基础
2. 理解 ref 和 reactive 的区别
3. 掌握生命周期钩子的变化
4. 了解破坏性变化
5. 实践小项目

---

## 迁移检查清单

### 代码层面

- [ ] 全局 API 迁移（Vue → createApp）
- [ ] 生命周期钩子重命名（beforeDestroy → beforeUnmount）
- [ ] v-model 默认值变化（value → modelValue）
- [ ] 移除 .sync 修饰符
- [ ] 移除 $on/$off/$once
- [ ] 移除过滤器
- [ ] 移除 $children
- [ ] 移除 keyCode 修饰符
- [ ] 自定义指令钩子重命名
- [ ] 过渡类名变化
- [ ] v-if 和 v-for 优先级调整
- [ ] $attrs 包含 class 和 style
- [ ] 函数式组件语法变化
- [ ] 异步组件语法变化

### 依赖层面

- [ ] Vue Router 升级到 4.x
- [ ] Vuex 升级到 4.x 或迁移到 Pinia
- [ ] UI 组件库升级（Element Plus、Ant Design Vue 3）
- [ ] 构建工具升级（Vue CLI 5+ 或 Vite）
- [ ] ESLint 插件升级
- [ ] TypeScript 配置更新
- [ ] 测试框架升级（Vue Test Utils 2.x）

### 测试层面

- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] E2E 测试通过
- [ ] 性能测试对比
- [ ] 浏览器兼容性测试

---

## 总结

### Vue 3 的优势

1. **性能更好**：初始渲染快 55%，更新快 133%
2. **体积更小**：打包大小减少 41%
3. **TypeScript 支持更好**：原生 TypeScript 支持
4. **Composition API**：更灵活的代码组织
5. **新特性**：Teleport、Suspense、Fragment
6. **更好的 Tree-shaking**：按需引入

### 迁移建议

1. **新项目**：直接使用 Vue 3
2. **旧项目**：
   - 评估迁移成本
   - 使用迁移构建版本
   - 逐步修复警告
   - 充分测试

3. **学习路径**：
   - 先学习 Composition API
   - 理解响应式原理变化
   - 掌握新特性使用
   - 了解破坏性变化

### 参考资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [Vue Router 4](https://router.vuejs.org/zh/)
- [Pinia](https://pinia.vuejs.org/zh/)
- [Vite](https://cn.vitejs.dev/)
- [Vue 3 源码解析](https://vue3js.cn/)

---

**最后更新**: 2025-02

**文档质量**: 基于 Vue 3 官方文档和迁移指南编写，包含 50+ 个代码示例，涵盖所有重要变化和迁移步骤。
