# Vue 3 完整 API 速查表

> Vue 3、Vue Router 4、Pinia 完整 API 参考与代码示例
> 
> 📅 **更新时间**: 2025-02
> 
> 📚 **内容来源**: Vue 3 官方文档、Vue Router 4 官方文档、Pinia 官方文档（基于 MCP Context7 最新数据）

[[toc]]

---

## 📋 模板语法

### 文本插值

```vue
<template>
  <!-- 基础插值 -->
  <p>{{ message }}</p>
  
  <!-- JavaScript 表达式 -->
  <p>{{ number + 1 }}</p>
  <p>{{ ok ? 'YES' : 'NO' }}</p>
  <p>{{ message.split('').reverse().join('') }}</p>
  
  <!-- 方法调用 -->
  <p>{{ formatDate(date) }}</p>
  
  <!-- 原始 HTML（注意 XSS 风险） -->
  <div v-html="rawHtml"></div>
  
  <!-- 纯文本（不解析 HTML） -->
  <div v-text="message"></div>
</template>
```

### 属性绑定（v-bind）

```vue
<template>
  <!-- 基础绑定 -->
  <div v-bind:id="dynamicId"></div>
  <div :id="dynamicId"></div>
  
  <!-- 动态属性名 -->
  <div :[attributeName]=
# Class 绑定

```vue
<template>
  <!-- 对象语法 -->
  <div :class="{ active: isActive, 'text-danger': hasError }"></div>
  
  <!-- 数组语法 -->
  <div :class="[activeClass, errorClass]"></div>
  
  <!-- 数组 + 对象 -->
  <div :class="[{ active: isActive }, errorClass]"></div>
  
  <!-- 三元表达式 -->
  <div :class="[isActive ? activeClass : '', errorClass]"></div>
  
  <!-- 组件上的 class（会合并） -->
  <MyComponent class="static-class" :class="{ dynamic: isDynamic }" />
</template>

<script setup>
const isActive = true
const hasError = false
const activeClass = 'active'
const errorClass = 'text-danger'
</script>
```

### Style 绑定

```vue
<template>
  <!-- 对象语法 -->
  <div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
  
  <!-- 数组语法 -->
  <div :style="[baseStyles, overridingStyles]"></div>
  
  <!-- 自动添加前缀 -->
  <div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }"></div>
</template>

<script setup>
const activeColor = 'red'
const fontSize = 14
const baseStyles = { color: 'blue' }
const overridingStyles = { fontSize: '16px' }
</script>
```

### 条件渲染

```vue
<template>
  <!-- v-if / v-else-if / v-else -->
  <div v-if="type === 'A'">A</div>
  <div v-else-if="type === 'B'">B</div>
  <div v-else>Not A/B</div>
  
  <!-- template 包装（不渲染额外元素） -->
  <template v-if="ok">
    <h1>Title</h1>
    <p>Paragraph</p>
  </template>
  
  <!-- v-show（切换 display CSS） -->
  <div v-show="isVisible">Visible</div>
  
  <!-- v-if vs v-show -->
  <!-- v-if: 真正的条件渲染，惰性，切换开销高 -->
  <!-- v-show: 始终渲染，只切换 display，初始开销高 -->
</template>
```

### 列表渲染

```vue
<template>
  <!-- 数组 -->
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
  
  <!-- 数组 + 索引 -->
  <li v-for="(item, index) in items" :key="item.id">
    {{ index }}: {{ item.name }}
  </li>
  
  <!-- 对象 -->
  <div v-for="(value, key) in object" :key="key">
    {{ key }}: {{ value }}
  </div>
  
  <!-- 对象 + 索引 -->
  <div v-for="(value, key, index) in object" :key="key">
    {{ index }}. {{ key }}: {{ value }}
  </div>
  
  <!-- 范围 -->
  <span v-for="n in 10" :key="n">{{ n }}</span>
  
  <!-- template 包装 -->
  <template v-for="item in items" :key="item.id">
    <li>{{ item.name }}</li>
    <li class="divider"></li>
  </template>
  
  <!-- 组件上使用 -->
  <MyComponent
    v-for="item in items"
    :key="item.id"
    :item="item"
  />
</template>

<script setup>
const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
]

const object = {
  title: 'How to do lists in Vue',
  author: 'Jane Doe',
  publishedAt: '2016-04-10'
}
</script>
```

### 事件处理

```vue
<template>
  <!-- 内联处理器 -->
  <button @click="count++">Add 1</button>
  
  <!-- 方法处理器 -->
  <button @click="increment">Add 1</button>
  
  <!-- 传递参数 -->
  <button @click="say('hello')">Say hello</button>
  
  <!-- 访问事件对象 -->
  <button @click="warn('Form cannot be submitted yet.', $event)">
    Submit
  </button>
  
  <!-- 多个处理器 -->
  <button @click="one($event), two($event)">
    Submit
  </button>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

function say(message) {
  alert(message)
}

function warn(message, event) {
  if (event) {
    event.preventDefault()
  }
  alert(message)
}
</script>
```

### 事件修饰符

```vue
<template>
  <!-- .stop - 阻止事件冒泡 -->
  <a @click.stop="doThis">Stop</a>
  
  <!-- .prevent - 阻止默认行为 -->
  <form @submit.prevent="onSubmit">Submit</form>
  
  <!-- .self - 只在事件目标是元素自身时触发 -->
  <div @click.self="doThat">Self</div>
  
  <!-- .capture - 使用捕获模式 -->
  <div @click.capture="doThis">Capture</div>
  
  <!-- .once - 只触发一次 -->
  <button @click.once="doThis">Once</button>
  
  <!-- .passive - 优化滚动性能 -->
  <div @scroll.passive="onScroll">Scroll</div>
  
  <!-- 链式调用 -->
  <a @click.stop.prevent="doThat">Chain</a>
</template>
```

### 按键修饰符

```vue
<template>
  <!-- 按键别名 -->
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
  
  <!-- 组合键 -->
  <input @keyup.ctrl.enter="onCtrlEnter">
  <div @click.ctrl="onCtrlClick">Ctrl+Click</div>
  
  <!-- .exact - 精确匹配 -->
  <button @click.ctrl.exact="onCtrlClick">仅 Ctrl</button>
  <button @click.exact="onClick">无修饰键</button>
  
  <!-- 鼠标按钮修饰符 -->
  <button @click.left="onLeft">左键</button>
  <button @click.right="onRight">右键</button>
  <button @click.middle="onMiddle">中键</button>
</template>
```

### 表单输入绑定

```vue
<template>
  <!-- 文本输入 -->
  <input v-model="text" placeholder="edit me">
  <p>Message is: {{ text }}</p>
  
  <!-- 多行文本 -->
  <textarea v-model="message" placeholder="add multiple lines"></textarea>
  
  <!-- 复选框（单个） -->
  <input type="checkbox" id="checkbox" v-model="checked">
  <label for="checkbox">{{ checked }}</label>
  
  <!-- 复选框（多个） -->
  <input type="checkbox" id="jack" value="Jack" v-model="checkedNames">
  <label for="jack">Jack</label>
  <input type="checkbox" id="john" value="John" v-model="checkedNames">
  <label for="john">John</label>
  <p>Checked names: {{ checkedNames }}</p>
  
  <!-- 单选按钮 -->
  <input type="radio" id="one" value="One" v-model="picked">
  <label for="one">One</label>
  <input type="radio" id="two" value="Two" v-model="picked">
  <label for="two">Two</label>
  <p>Picked: {{ picked }}</p>
  
  <!-- 选择框（单选） -->
  <select v-model="selected">
    <option disabled value="">Please select one</option>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
  <p>Selected: {{ selected }}</p>
  
  <!-- 选择框（多选） -->
  <select v-model="multiSelected" multiple>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
  <p>Selected: {{ multiSelected }}</p>
  
  <!-- 动态选项 -->
  <select v-model="selected">
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.text }}
    </option>
  </select>
</template>

<script setup>
import { ref } from 'vue'

const text = ref('')
const message = ref('')
const checked = ref(false)
const checkedNames = ref([])
const picked = ref('')
const selected = ref('')
const multiSelected = ref([])
const options = ref([
  { text: 'One', value: 'A' },
  { text: 'Two', value: 'B' },
  { text: 'Three', value: 'C' }
])
</script>
```

### v-model 修饰符

```vue
<template>
  <!-- .lazy - 在 change 事件后同步 -->
  <input v-model.lazy="msg">
  
  <!-- .number - 自动转换为数字 -->
  <input v-model.number="age" type="number">
  
  <!-- .trim - 自动去除首尾空格 -->
  <input v-model.trim="msg">
  
  <!-- 组合使用 -->
  <input v-model.lazy.trim="msg">
</template>
```

---

## 🎯 Composition API

### 响应式核心

```javascript
import {
  ref,
  reactive,
  computed,
  readonly,
  watchEffect,
  watch
} from 'vue'

// ref - 创建响应式引用（任意类型）
const count = ref(0)
console.log(count.value) // 0
count.value++
console.log(count.value) // 1

// 在模板中自动解包
// <template>{{ count }}</template>

// reactive - 创建响应式对象
const state = reactive({
  count: 0,
  message: 'Hello'
})
state.count++

// computed - 计算属性
const doubled = computed(() => count.value * 2)

// computed with getter/setter
const fullName = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})

// readonly - 只读代理
const original = reactive({ count: 0 })
const copy = readonly(original)
// copy.count++ // 警告！

// watchEffect - 自动追踪依赖
const stop = watchEffect(() => {
  console.log(count.value)
})
// 停止监听
stop()

// watch - 侦听特定数据源
watch(count, (newValue, oldValue) => {
  console.log(`${oldValue} -> ${newValue}`)
})
```

### 响应式工具

```javascript
import {
  isRef,
  unref,
  toRef,
  toRefs,
  isReactive,
  isReadonly,
  isProxy,
  toRaw,
  markRaw,
  shallowRef,
  shallowReactive,
  shallowReadonly,
  triggerRef,
  customRef
} from 'vue'

// isRef - 检查是否为 ref
if (isRef(count)) {
  console.log(count.value)
}

// unref - 获取值（ref 返回 .value，否则返回原值）
const value = unref(maybeRef)
// 等价于
const value = isRef(maybeRef) ? maybeRef.value : maybeRef

// toRef - 为响应式对象的属性创建 ref
const state = reactive({ count: 0 })
const countRef = toRef(state, 'count')
countRef.value++ // state.count 也会更新

// toRefs - 将响应式对象转换为普通对象，每个属性都是 ref
const state = reactive({ count: 0, name: 'John' })
const { count, name } = toRefs(state)
// count 和 name 保持响应式

// isReactive - 检查是否为 reactive 对象
const state = reactive({})
console.log(isReactive(state)) // true

// isReadonly - 检查是否为 readonly 对象
const copy = readonly(state)
console.log(isReadonly(copy)) // true

// isProxy - 检查是否为 reactive 或 readonly 代理
console.log(isProxy(state)) // true

// toRaw - 获取原始对象
const raw = toRaw(state)
raw.count++ // 不会触发更新

// markRaw - 标记对象永不转换为代理
const foo = markRaw({})
console.log(isReactive(reactive(foo))) // false

// shallowRef - 浅层 ref（只有 .value 是响应式的）
const state = shallowRef({ count: 0 })
state.value = { count: 1 } // 触发更新
state.value.count = 2 // 不触发更新

// shallowReactive - 浅层 reactive
const state = shallowReactive({
  foo: 1,
  nested: { bar: 2 }
})
state.foo++ // 触发更新
state.nested.bar++ // 不触发更新

// triggerRef - 手动触发 shallowRef 更新
const shallow = shallowRef({ count: 0 })
shallow.value.count++
triggerRef(shallow) // 手动触发更新

// customRef - 自定义 ref
function useDebouncedRef(value, delay = 200) {
  let timeout
  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        value = newValue
        trigger()
      }, delay)
    }
  }))
}
```

### 侦听器详解

```javascript
import { ref, reactive, watch, watchEffect, watchPostEffect, watchSyncEffect } from 'vue'

const count = ref(0)
const state = reactive({ count: 0, nested: { value: 0 } })

// 1. 侦听单个 ref
watch(count, (newValue, oldValue) => {
  console.log(`count: ${oldValue} -> ${newValue}`)
})

// 2. 侦听 getter 函数
watch(
  () => state.count,
  (newValue, oldValue) => {
    console.log(`state.count: ${oldValue} -> ${newValue}`)
  }
)

// 3. 侦听多个源
watch(
  [count, () => state.count],
  ([newCount, newStateCount], [oldCount, oldStateCount]) => {
    console.log('Multiple sources changed')
  }
)

// 4. 深度侦听
watch(
  () => state,
  (newValue, oldValue) => {
    console.log('Deep watch triggered')
  },
  { deep: true }
)

// 5. 立即执行
watch(
  count,
  (newValue) => {
    console.log(`Initial: ${newValue}`)
  },
  { immediate: true }
)

// 6. 只执行一次（Vue 3.4+）
watch(
  count,
  () => {
    console.log('Only once')
  },
  { once: true }
)

// 7. 回调时机
watch(
  count,
  () => {
    // 默认在组件更新前调用
  },
  { flush: 'pre' } // 'pre' | 'post' | 'sync'
)

// 8. watchEffect - 自动追踪依赖
const stop = watchEffect(() => {
  console.log(count.value) // 自动追踪 count
})

// 停止侦听
stop()

// 9. watchPostEffect - DOM 更新后执行
watchPostEffect(() => {
  // 可以安全访问更新后的 DOM
  console.log(document.querySelector('#el').textContent)
})

// 10. watchSyncEffect - 同步执行
watchSyncEffect(() => {
  // 在响应式依赖变化时同步触发
  console.log(count.value)
})

// 11. 清理副作用
watchEffect((onCleanup) => {
  const token = performAsyncOperation()
  onCleanup(() => {
    // 清理操作
    token.cancel()
  })
})

// 12. 调试
watch(count, (newValue, oldValue) => {
  console.log('changed')
}, {
  onTrack(e) {
    // 依赖被追踪时调用
    debugger
  },
  onTrigger(e) {
    // 依赖变化触发时调用
    debugger
  }
})
```


### 生命周期钩子

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
  onErrorCaptured,
  onRenderTracked,
  onRenderTriggered,
  onServerPrefetch
} from 'vue'

// 挂载阶段
onBeforeMount(() => {
  console.log('组件挂载前')
})

onMounted(() => {
  console.log('组件挂载后，可以访问 DOM')
})

// 更新阶段
onBeforeUpdate(() => {
  console.log('组件更新前')
})

onUpdated(() => {
  console.log('组件更新后')
})

// 卸载阶段
onBeforeUnmount(() => {
  console.log('组件卸载前，清理定时器、事件监听等')
})

onUnmounted(() => {
  console.log('组件卸载后')
})

// KeepAlive 专用
onActivated(() => {
  console.log('被 KeepAlive 缓存的组件激活时')
})

onDeactivated(() => {
  console.log('被 KeepAlive 缓存的组件停用时')
})

// 错误捕获
onErrorCaptured((err, instance, info) => {
  console.error('捕获子组件错误:', err)
  return false // 阻止错误继续传播
})

// 调试钩子
onRenderTracked((e) => {
  console.log('依赖被追踪', e)
})

onRenderTriggered((e) => {
  console.log('依赖触发更新', e)
})

// SSR 专用
onServerPrefetch(async () => {
  // 服务端渲染时获取数据
  await fetchData()
})
```


### 依赖注入

```javascript
import { provide, inject, ref, readonly } from 'vue'

// 祖先组件提供数据
// 方式 1：提供静态值
provide('message', 'Hello from ancestor')

// 方式 2：提供响应式数据
const count = ref(0)
provide('count', count)

// 方式 3：提供只读数据（防止后代修改）
provide('readonlyCount', readonly(count))

// 方式 4：提供方法
provide('updateCount', (newValue) => {
  count.value = newValue
})

// 后代组件注入数据
// 方式 1：基础注入
const message = inject('message')

// 方式 2：提供默认值
const message = inject('message', 'default value')

// 方式 3：工厂函数默认值
const count = inject('count', () => ref(0), true)

// 方式 4：注入方法
const updateCount = inject('updateCount')
updateCount(10)

// 应用级 provide（main.js）
import { createApp } from 'vue'
const app = createApp(App)
app.provide('globalConfig', {
  apiUrl: 'https://api.example.com'
})
```

### 组合式函数（Composables）

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

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}

// composables/useFetch.js
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  watchEffect(async () => {
    loading.value = true
    data.value = null
    error.value = null

    try {
      const res = await fetch(toValue(url))
      data.value = await res.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  })

  return { data, error, loading }
}

// 使用
import { useMouse } from '@/composables/useMouse'
import { useFetch } from '@/composables/useFetch'

const { x, y } = useMouse()
const { data, error, loading } = useFetch('/api/users')
```


---

## 🧩 组件系统

### Script Setup 语法

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import ChildComponent from './ChildComponent.vue'

// 1. Props 定义
interface Props {
  title: string
  count?: number
  items: string[]
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => []
})

// 2. Emits 定义
const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'delete', id: string): void
}>()

function handleUpdate() {
  emit('update', props.count + 1)
}

// 3. Slots 定义（Vue 3.3+）
const slots = defineSlots<{
  default(props: { msg: string }): any
  header(): any
}>()

// 4. defineExpose - 暴露给父组件
const count = ref(0)
const increment = () => count.value++

defineExpose({
  count,
  increment
})

// 5. defineModel - 双向绑定（Vue 3.4+）
const modelValue = defineModel<string>()
const count = defineModel<number>('count', { default: 0 })

// 6. defineOptions - 组件选项（Vue 3.3+）
defineOptions({
  name: 'MyComponent',
  inheritAttrs: false
})

// 7. useAttrs / useSlots
import { useAttrs, useSlots } from 'vue'
const attrs = useAttrs()
const slots = useSlots()

// 8. 顶层 await（配合 Suspense）
const data = await fetch('/api/data').then(r => r.json())
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <p>Count: {{ count }}</p>
    <button @click="handleUpdate">Update</button>
    
    <slot name="header"></slot>
    <slot :msg="'Hello'"></slot>
    
    <ChildComponent />
  </div>
</template>
```


### 组件通信

```vue
<!-- 1. Props / Emits（父子通信） -->
<!-- 父组件 -->
<template>
  <ChildComponent
    :message="parentMessage"
    @update="handleUpdate"
  />
</template>

<script setup>
const parentMessage = ref('Hello')
const handleUpdate = (newValue) => {
  parentMessage.value = newValue
}
</script>

<!-- 子组件 -->
<script setup>
const props = defineProps(['message'])
const emit = defineEmits(['update'])

function updateMessage() {
  emit('update', 'New message')
}
</script>

<!-- 2. v-model（双向绑定） -->
<!-- 父组件 -->
<CustomInput v-model="searchText" />
<UserForm
  v-model:firstName="first"
  v-model:lastName="last"
/>

<!-- 子组件 -->
<script setup>
const modelValue = defineModel()
// 或
const firstName = defineModel('firstName')
const lastName = defineModel('lastName')
</script>

<!-- 3. Provide / Inject（跨层级通信） -->
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue'
const theme = ref('dark')
provide('theme', theme)
</script>

<!-- 后代组件 -->
<script setup>
import { inject } from 'vue'
const theme = inject('theme')
</script>

<!-- 4. 模板引用（访问子组件实例） -->
<template>
  <ChildComponent ref="childRef" />
  <button @click="callChild">Call Child</button>
</template>

<script setup>
import { ref } from 'vue'
const childRef = ref()

function callChild() {
  childRef.value.childMethod()
}
</script>

<!-- 5. Slots（内容分发） -->
<!-- 父组件 -->
<template>
  <ChildComponent>
    <template #header="{ title }">
      <h1>{{ title }}</h1>
    </template>
  </ChildComponent>
</template>

<!-- 子组件 -->
<template>
  <div>
    <slot name="header" :title="pageTitle"></slot>
  </div>
</template>
```


### 内置组件

```vue
<!-- 1. Transition - 单元素过渡 -->
<template>
  <Transition name="fade">
    <p v-if="show">Hello</p>
  </Transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

<!-- 2. TransitionGroup - 列表过渡 -->
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>

<!-- 3. KeepAlive - 缓存组件 -->
<template>
  <KeepAlive :include="['ComponentA', 'ComponentB']" :max="10">
    <component :is="currentComponent" />
  </KeepAlive>
</template>

<!-- 4. Teleport - 传送门 -->
<template>
  <Teleport to="body">
    <div class="modal">
      <p>Modal content</p>
    </div>
  </Teleport>
</template>

<!-- 5. Suspense - 异步组件 -->
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
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


---

## 🚀 Vue Router 4

### 路由配置

```javascript
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // 历史模式
  history: createWebHistory('/base-path/'),
  // history: createWebHashHistory(),
  // history: createMemoryHistory(),
  
  // 路由配置
  routes: [
    // 基础路由
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
    
    // 动态路由
    {
      path: '/users/:id',
      name: 'user',
      component: UserView,
      props: true // 将 params 作为 props 传递
    },
    
    // 嵌套路由
    {
      path: '/users/:id',
      component: UserView,
      children: [
        { path: '', component: UserHome },
        { path: 'profile', component: UserProfile },
        { path: 'posts', component: UserPosts }
      ]
    },
    
    // 命名视图
    {
      path: '/dashboard',
      components: {
        default: Dashboard,
        sidebar: Sidebar,
        footer: Footer
      }
    },
    
    // 重定向
    {
      path: '/home',
      redirect: '/'
    },
    {
      path: '/search/:searchText',
      redirect: to => {
        return { path: '/search', query: { q: to.params.searchText } }
      }
    },
    
    // 别名
    {
      path: '/users',
      component: UsersView,
      alias: ['/people', '/folks']
    },
    
    // 路由元信息
    {
      path: '/admin',
      component: AdminView,
      meta: {
        requiresAuth: true,
        roles: ['admin']
      }
    },
    
    // 404 路由
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ],
  
  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { top: 0 }
    }
  }
})

export default router
```


### 编程式导航

```javascript
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 1. 导航到不同位置
router.push('/users')
router.push({ path: '/users' })
router.push({ name: 'user', params: { id: 123 } })
router.push({ path: '/register', query: { plan: 'private' } })
router.push({ path: '/about', hash: '#team' })

// 2. 替换当前位置（不留历史记录）
router.replace('/users')
router.replace({ name: 'user', params: { id: 123 } })

// 3. 历史导航
router.go(-1) // 后退一步
router.go(1)  // 前进一步
router.back() // 等同于 router.go(-1)
router.forward() // 等同于 router.go(1)

// 4. 等待导航完成
await router.push('/users')
await router.replace('/users')

// 5. 访问当前路由信息
console.log(route.path)       // '/users/123'
console.log(route.params)     // { id: '123' }
console.log(route.query)      // { plan: 'private' }
console.log(route.hash)       // '#team'
console.log(route.fullPath)   // '/users/123?plan=private#team'
console.log(route.matched)    // 匹配的路由记录数组
console.log(route.name)       // 'user'
console.log(route.meta)       // { requiresAuth: true }
```

### 导航守卫

```javascript
// 1. 全局前置守卫
router.beforeEach(async (to, from) => {
  // 返回 false 取消导航
  if (!isAuthenticated && to.meta.requiresAuth) {
    return false
  }
  
  // 返回路径重定向
  if (!isAuthenticated && to.meta.requiresAuth) {
    return '/login'
  }
  
  // 返回路由对象重定向
  if (!isAuthenticated && to.meta.requiresAuth) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  
  // 返回 undefined 或 true 继续导航
  return true
})

// 2. 全局解析守卫
router.beforeResolve(async (to) => {
  if (to.meta.requiresCamera) {
    try {
      await askForCameraPermission()
    } catch (error) {
      return false
    }
  }
})

// 3. 全局后置钩子
router.afterEach((to, from, failure) => {
  if (!failure) {
    sendToAnalytics(to.fullPath)
  }
})

// 4. 路由独享守卫
const routes = [
  {
    path: '/users/:id',
    component: UserDetails,
    beforeEnter: (to, from) => {
      // 拒绝导航
      return false
    }
  }
]

// 5. 组件内守卫
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteLeave((to, from) => {
  const answer = window.confirm('确定要离开吗？未保存的更改将丢失。')
  if (!answer) return false
})

onBeforeRouteUpdate(async (to, from) => {
  // 路由参数变化时调用
  userData.value = await fetchUser(to.params.id)
})
</script>
```



---

## 📦 Pinia 状态管理

### Store 定义

```javascript
// stores/counter.js - Setup Store（推荐）
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  const name = ref('Eduardo')
  
  // Getters
  const doubleCount = computed(() => count.value * 2)
  const isEven = computed(() => count.value % 2 === 0)
  
  // Actions
  function increment() {
    count.value++
  }
  
  async function incrementAsync() {
    await new Promise(resolve => setTimeout(resolve, 1000))
    count.value++
  }
  
  function $reset() {
    count.value = 0
    name.value = 'Eduardo'
  }
  
  return {
    count,
    name,
    doubleCount,
    isEven,
    increment,
    incrementAsync,
    $reset
  }
})

// stores/user.js - Options Store
export const useUserStore = defineStore('user', {
  // State
  state: () => ({
    name: 'John',
    age: 25,
    todos: []
  }),
  
  // Getters
  getters: {
    isAdult: (state) => state.age >= 18,
    
    // 访问其他 getter
    fullInfo() {
      return `${this.name} (${this.age})`
    },
    
    // 访问其他 store
    otherStoreGetter() {
      const otherStore = useOtherStore()
      return otherStore.data
    },
    
    // 返回函数（不会缓存）
    getTodoById: (state) => {
      return (id) => state.todos.find(todo => todo.id === id)
    }
  },
  
  // Actions
  actions: {
    updateName(newName) {
      this.name = newName
    },
    
    async fetchUser(id) {
      try {
        const user = await fetch(`/api/users/${id}`).then(r => r.json())
        this.name = user.name
        this.age = user.age
      } catch (error) {
        console.error(error)
      }
    },
    
    // 访问其他 store
    async orderCart() {
      const cartStore = useCartStore()
      await cartStore.purchase()
    }
  }
})
```


### Store 使用

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

// 1. 获取 store 实例
const store = useCounterStore()

// 2. 访问 state
console.log(store.count)
store.count++

// 3. 解构 state（失去响应式）
const { count, name } = store // ❌ 不响应式

// 4. 使用 storeToRefs 解构（保持响应式）
const { count, name, doubleCount } = storeToRefs(store) // ✅ 响应式

// 5. 解构 actions（不需要 storeToRefs）
const { increment, incrementAsync } = store

// 6. 修改 state
// 方式 1：直接修改
store.count++

// 方式 2：$patch 对象
store.$patch({
  count: store.count + 1,
  name: 'New Name'
})

// 方式 3：$patch 函数
store.$patch((state) => {
  state.count++
  state.todos.push({ id: 1, text: 'New Todo' })
})

// 7. 替换整个 state
store.$state = { count: 0, name: 'Eduardo' }

// 8. 重置 state
store.$reset()

// 9. 订阅 state 变化
store.$subscribe((mutation, state) => {
  console.log('State changed:', mutation.type)
  // 持久化到 localStorage
  localStorage.setItem('counter', JSON.stringify(state))
})

// 10. 订阅 actions
store.$onAction(({
  name,      // action 名称
  store,     // store 实例
  args,      // action 参数
  after,     // action 成功后的钩子
  onError    // action 失败后的钩子
}) => {
  console.log(`Action ${name} called with args:`, args)
  
  after((result) => {
    console.log('Action succeeded with result:', result)
  })
  
  onError((error) => {
    console.error('Action failed:', error)
  })
})
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```


### Pinia 插件

```javascript
// plugins/piniaPlugin.js
export function myPiniaPlugin(context) {
  // context 包含：
  // - app: Vue 应用实例
  // - pinia: Pinia 实例
  // - store: 当前 store
  // - options: defineStore 的选项
  
  // 1. 为所有 store 添加属性
  return {
    secret: 'the cake is a lie',
    router: markRaw(router)
  }
  
  // 2. 添加新的 state
  store.$state.hasError = ref(false)
  
  // 3. 订阅 store 变化
  store.$subscribe((mutation, state) => {
    localStorage.setItem(store.$id, JSON.stringify(state))
  })
  
  // 4. 订阅 actions
  store.$onAction(({ name, after, onError }) => {
    after(() => {
      console.log(`Action ${name} succeeded`)
    })
    onError((error) => {
      console.error(`Action ${name} failed:`, error)
    })
  })
}

// main.js
import { createPinia } from 'pinia'
import { myPiniaPlugin } from './plugins/piniaPlugin'

const pinia = createPinia()
pinia.use(myPiniaPlugin)

app.use(pinia)
```

---

## 🛠️ 常用工具函数

### 应用 API

```javascript
import { createApp, h } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 1. 全局配置
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
}

app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Global warning:', msg)
}

app.config.performance = true // 开启性能追踪

app.config.globalProperties.$http = axios // 全局属性

// 2. 注册全局组件
app.component('MyComponent', MyComponent)

// 3. 注册全局指令
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 4. 使用插件
app.use(router)
app.use(pinia)
app.use(MyPlugin, { /* options */ })

// 5. 提供全局数据
app.provide('globalConfig', {
  apiUrl: 'https://api.example.com'
})

// 6. 挂载应用
app.mount('#app')

// 7. 卸载应用
app.unmount()
```


### 渲染函数

```javascript
import { h, ref, reactive } from 'vue'

// 1. 基础用法
export default {
  setup() {
    return () => h('div', { class: 'container' }, 'Hello')
  }
}

// 2. 使用 props 和 children
h('div', { id: 'foo', class: 'bar' }, [
  h('span', 'Hello'),
  h('span', 'World')
])

// 3. 事件监听
h('button', {
  onClick: () => console.log('clicked')
}, 'Click me')

// 4. v-model
h('input', {
  modelValue: value.value,
  'onUpdate:modelValue': (v) => value.value = v
})

// 5. 插槽
h(MyComponent, null, {
  default: () => h('span', 'default slot'),
  header: () => h('h1', 'header slot')
})

// 6. 组件
h(MyComponent, {
  prop1: 'value',
  onCustomEvent: handleEvent
})

// 7. Fragment
h(Fragment, [
  h('div', 'First'),
  h('div', 'Second')
])

// 8. 完整示例
export default {
  props: ['items'],
  setup(props) {
    const count = ref(0)
    
    return () => h('div', [
      h('h1', `Count: ${count.value}`),
      h('button', {
        onClick: () => count.value++
      }, '+1'),
      h('ul', props.items.map(item =>
        h('li', { key: item.id }, item.name)
      ))
    ])
  }
}
```

### 异步组件

```javascript
import { defineAsyncComponent } from 'vue'

// 1. 基础用法
const AsyncComp = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
)

// 2. 带选项
const AsyncComp = defineAsyncComponent({
  // 加载函数
  loader: () => import('./AsyncComponent.vue'),
  
  // 加载中显示的组件
  loadingComponent: LoadingComponent,
  
  // 加载失败显示的组件
  errorComponent: ErrorComponent,
  
  // 延迟显示加载组件的时间（默认 200ms）
  delay: 200,
  
  // 超时时间（默认 Infinity）
  timeout: 3000,
  
  // 是否可以与 Suspense 一起使用
  suspensible: false,
  
  // 错误处理
  onError(error, retry, fail, attempts) {
    if (error.message.match(/fetch/) && attempts <= 3) {
      retry() // 重试
    } else {
      fail() // 失败
    }
  }
})
```


### 自定义指令

```javascript
// 1. 全局注册
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 2. 局部注册
<script setup>
const vFocus = {
  mounted: (el) => el.focus()
}
</script>

<template>
  <input v-focus />
</template>

// 3. 完整的钩子函数
app.directive('example', {
  // 在绑定元素的 attribute 或事件监听器被应用之前调用
  created(el, binding, vnode, prevVnode) {},
  
  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode, prevVnode) {},
  
  // 在绑定元素的父组件及其所有子节点都挂载完成后调用
  mounted(el, binding, vnode, prevVnode) {},
  
  // 在父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},
  
  // 在父组件及其所有子组件都更新后调用
  updated(el, binding, vnode, prevVnode) {},
  
  // 在绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode, prevVnode) {},
  
  // 在绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode, prevVnode) {}
})

// 4. 指令参数
<div v-example:arg.modifier="value"></div>

// binding 对象包含：
// - value: 传递给指令的值
// - oldValue: 之前的值
// - arg: 传递给指令的参数
// - modifiers: 包含修饰符的对象
// - instance: 使用该指令的组件实例
// - dir: 指令的定义对象

// 5. 实用示例
// v-debounce
app.directive('debounce', {
  mounted(el, binding) {
    let timer
    el.addEventListener('input', () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        binding.value()
      }, binding.arg || 300)
    })
  }
})

// v-lazy
app.directive('lazy', {
  mounted(el, binding) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.src = binding.value
        observer.unobserve(el)
      }
    })
    observer.observe(el)
  }
})

// v-permission
app.directive('permission', {
  mounted(el, binding) {
    const { value } = binding
    const permissions = store.state.user.permissions
    
    if (!permissions.includes(value)) {
      el.parentNode?.removeChild(el)
    }
  }
})
```


### TypeScript 支持

```typescript
// 1. 组件 Props 类型
<script setup lang="ts">
interface Props {
  msg: string
  count?: number
  labels: string[]
  obj: { id: number; name: string }
  callback: (id: number) => void
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  labels: () => []
})
</script>

// 2. Emits 类型
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()

// 或使用类型别名
type Emits = {
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}
const emit = defineEmits<Emits>()
</script>

// 3. Ref 类型
import { ref, Ref } from 'vue'

const count: Ref<number> = ref(0)
const user = ref<User | null>(null)

// 4. Reactive 类型
import { reactive } from 'vue'

interface State {
  count: number
  name: string
}

const state: State = reactive({
  count: 0,
  name: 'John'
})

// 5. Computed 类型
import { computed, ComputedRef } from 'vue'

const doubled: ComputedRef<number> = computed(() => count.value * 2)

// 6. 模板引用类型
const inputRef = ref<HTMLInputElement | null>(null)
const componentRef = ref<InstanceType<typeof MyComponent> | null>(null)

// 7. 事件处理器类型
function handleClick(event: MouseEvent) {
  console.log(event.clientX)
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  console.log(target.value)
}

// 8. Provide / Inject 类型
import { provide, inject, InjectionKey } from 'vue'

const key: InjectionKey<string> = Symbol()

// 提供
provide(key, 'value')

// 注入
const value = inject(key) // string | undefined
const value = inject(key, 'default') // string

// 9. 组件实例类型
import { ComponentPublicInstance } from 'vue'

type ComponentInstance = ComponentPublicInstance<{
  publicMethod: () => void
}>

const instance = ref<ComponentInstance | null>(null)
```



---

## 🎨 性能优化

### 代码分割

```javascript
// 1. 路由懒加载
const routes = [
  {
    path: '/users',
    component: () => import('@/views/Users.vue')
  }
]

// 2. 异步组件
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
)

// 3. 动态导入
async function loadComponent() {
  const module = await import('./MyComponent.vue')
  return module.default
}
```

### 虚拟滚动

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

function handleScroll(e) {
  scrollTop.value = e.target.scrollTop
}
</script>

<template>
  <div 
    class="container" 
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <div :style="{ height: items.length * itemHeight + 'px' }">
      <div 
        class="items" 
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div 
          v-for="item in visibleItems" 
          :key="item.id"
          :style="{ height: itemHeight + 'px' }"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>
```

### 性能优化技巧

```vue
<script setup>
import { ref, shallowRef, shallowReactive, markRaw } from 'vue'

// 1. 使用 shallowRef（只有 .value 是响应式的）
const state = shallowRef({ count: 0 })
state.value = { count: 1 } // 触发更新
state.value.count = 2 // 不触发更新

// 2. 使用 shallowReactive（只有根级属性是响应式的）
const state = shallowReactive({
  foo: 1,
  nested: { bar: 2 }
})
state.foo++ // 触发更新
state.nested.bar++ // 不触发更新

// 3. 使用 markRaw（标记对象永不转换为响应式）
const foo = markRaw({})
const bar = reactive({ foo })
console.log(isReactive(bar.foo)) // false

// 4. v-once（只渲染一次）
</script>

<template>
  <div v-once>
    <h1>{{ title }}</h1>
    <p>{{ content }}</p>
  </div>
  
  <!-- 5. v-memo（条件缓存） -->
  <div v-memo="[valueA, valueB]">
    <!-- 只有 valueA 或 valueB 变化时才重新渲染 -->
  </div>
  
  <!-- 6. KeepAlive 缓存组件 -->
  <KeepAlive :max="10">
    <component :is="currentComponent" />
  </KeepAlive>
</template>
```

---

## 📚 常用模式

### 组合式函数模式

```javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubled = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  function reset() {
    count.value = initialValue
  }
  
  return {
    count,
    doubled,
    increment,
    decrement,
    reset
  }
}

// 使用
const { count, doubled, increment } = useCounter(10)
```

### 状态共享模式

```javascript
// shared/state.js
import { reactive } from 'vue'

export const state = reactive({
  user: null,
  isLoggedIn: false
})

export function login(user) {
  state.user = user
  state.isLoggedIn = true
}

export function logout() {
  state.user = null
  state.isLoggedIn = false
}

// 在组件中使用
import { state, login, logout } from '@/shared/state'
```

### 依赖注入模式

```javascript
// 祖先组件
import { provide, readonly } from 'vue'

const theme = ref('dark')
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

provide('theme', readonly(theme))
provide('toggleTheme', toggleTheme)

// 后代组件
import { inject } from 'vue'

const theme = inject('theme')
const toggleTheme = inject('toggleTheme')
```

---

## 🔗 参考资源

### 官方文档
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vue Router 4 文档](https://router.vuejs.org/zh/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)

### 生态工具
- [Vite](https://cn.vitejs.dev/) - 下一代前端构建工具
- [VueUse](https://vueuse.org/) - Vue 组合式 API 工具集
- [Nuxt 3](https://nuxt.com/) - Vue 全栈框架
- [Element Plus](https://element-plus.org/) - Vue 3 UI 组件库
- [Ant Design Vue](https://antdv.com/) - Vue 3 UI 组件库

---

**最后更新**: 2025-02

**文档质量**: 基于 Vue 3、Vue Router 4、Pinia 官方文档（MCP Context7 最新数据），包含 100+ 个代码示例，涵盖所有核心 API 和最佳实践。

