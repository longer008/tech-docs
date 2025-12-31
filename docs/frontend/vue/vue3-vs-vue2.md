# Vue 3 vs Vue 2 版本差异对比

> 详细对比 Vue 2.x 与 Vue 3.x 的核心差异与迁移指南

## 核心变化概览

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 响应式系统 | Object.defineProperty | Proxy |
| API 风格 | Options API | Options + Composition API |
| TypeScript | 有限支持 | 原生支持 |
| 性能 | 基准 | 提升 30-50% |
| 打包大小 | ~22kb | ~13kb (Tree-shakable) |
| Fragment | 不支持 | 支持 |
| Teleport | 无 | 支持 |
| Suspense | 无 | 支持 |

## 详细对比

### 1. 响应式系统

**Vue 2：Object.defineProperty**
```javascript
// Vue 2 的局限性
export default {
  data() {
    return {
      user: { name: 'John' },
      items: ['a', 'b', 'c']
    }
  },
  methods: {
    updateUser() {
      // 无法检测属性添加
      this.user.age = 25 // 不会触发更新！
      this.$set(this.user, 'age', 25) // 需要使用 $set

      // 无法检测数组索引赋值
      this.items[0] = 'x' // 不会触发更新！
      this.$set(this.items, 0, 'x') // 需要使用 $set
    }
  }
}
```

**Vue 3：Proxy**
```javascript
import { reactive } from 'vue'

const state = reactive({
  user: { name: 'John' },
  items: ['a', 'b', 'c']
})

// 自动检测所有变化
state.user.age = 25 // 正常触发更新
state.items[0] = 'x' // 正常触发更新
delete state.user.name // 也能检测删除
```

### 2. 组件 API

**Vue 2：Options API**
```vue
<script>
export default {
  data() {
    return { count: 0 }
  },
  computed: {
    doubled() {
      return this.count * 2
    }
  },
  watch: {
    count(val) {
      console.log(val)
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('mounted')
  }
}
</script>
```

**Vue 3：Composition API**
```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

watch(count, (val) => console.log(val))

function increment() {
  count.value++
}

onMounted(() => console.log('mounted'))
</script>
```

### 3. 组件根节点

**Vue 2：单根节点**
```vue
<!-- Vue 2 必须有单个根元素 -->
<template>
  <div>
    <header>Header</header>
    <main>Content</main>
  </div>
</template>
```

**Vue 3：Fragment（多根节点）**
```vue
<!-- Vue 3 支持多根节点 -->
<template>
  <header>Header</header>
  <main>Content</main>
  <footer>Footer</footer>
</template>
```

### 4. v-model 变化

**Vue 2**
```vue
<!-- 父组件 -->
<CustomInput v-model="value" />
<!-- 等价于 -->
<CustomInput :value="value" @input="value = $event" />

<!-- 子组件 -->
<script>
export default {
  props: ['value'],
  methods: {
    update(val) {
      this.$emit('input', val)
    }
  }
}
</script>

<!-- .sync 修饰符 -->
<Child :title.sync="pageTitle" />
```

**Vue 3**
```vue
<!-- 父组件 -->
<CustomInput v-model="value" />
<!-- 等价于 -->
<CustomInput :modelValue="value" @update:modelValue="value = $event" />

<!-- 子组件 -->
<script setup>
defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function update(val) {
  emit('update:modelValue', val)
}
</script>

<!-- 多个 v-model -->
<UserForm
  v-model:name="userName"
  v-model:email="userEmail"
/>

<!-- 子组件 -->
<script setup>
defineProps(['name', 'email'])
defineEmits(['update:name', 'update:email'])
</script>
```

### 5. 全局 API 变化

**Vue 2：挂载在 Vue 构造函数上**
```javascript
import Vue from 'vue'

Vue.component('MyComponent', { /* ... */ })
Vue.directive('focus', { /* ... */ })
Vue.mixin({ /* ... */ })
Vue.use(plugin)
Vue.prototype.$http = axios

new Vue({
  render: h => h(App)
}).$mount('#app')
```

**Vue 3：createApp 实例方法**
```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.component('MyComponent', { /* ... */ })
app.directive('focus', { /* ... */ })
app.mixin({ /* ... */ })
app.use(plugin)
app.config.globalProperties.$http = axios

app.mount('#app')
```

### 6. 生命周期钩子

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
| errorCaptured | errorCaptured | onErrorCaptured |
| - | **renderTracked** | onRenderTracked |
| - | **renderTriggered** | onRenderTriggered |

### 7. 事件 API 移除

**Vue 2：EventBus 模式**
```javascript
// 创建事件总线
const EventBus = new Vue()

// 发送事件
EventBus.$emit('event-name', data)

// 监听事件
EventBus.$on('event-name', callback)

// 移除监听
EventBus.$off('event-name')
```

**Vue 3：使用外部库**
```javascript
// 使用 mitt 或 tiny-emitter
import mitt from 'mitt'

const emitter = mitt()

// 发送
emitter.emit('event-name', data)

// 监听
emitter.on('event-name', callback)

// 移除
emitter.off('event-name', callback)
```

### 8. 过滤器移除

**Vue 2：过滤器**
```vue
<template>
  <p>{{ price | currency }}</p>
  <p>{{ date | formatDate }}</p>
</template>

<script>
export default {
  filters: {
    currency(value) {
      return '$' + value.toFixed(2)
    }
  }
}

// 全局过滤器
Vue.filter('formatDate', value => { /* ... */ })
</script>
```

**Vue 3：使用方法或计算属性**
```vue
<template>
  <p>{{ formatCurrency(price) }}</p>
  <p>{{ formattedDate }}</p>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['price', 'date'])

function formatCurrency(value) {
  return '$' + value.toFixed(2)
}

const formattedDate = computed(() => {
  return new Date(props.date).toLocaleDateString()
})
</script>
```

### 9. 新增特性

**Teleport**
```vue
<!-- 将内容渲染到 DOM 其他位置 -->
<template>
  <button @click="showModal = true">打开弹窗</button>

  <Teleport to="body">
    <div v-if="showModal" class="modal">
      <p>这个弹窗渲染在 body 下</p>
      <button @click="showModal = false">关闭</button>
    </div>
  </Teleport>
</template>
```

**Suspense**
```vue
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
// 异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)
</script>
```

### 10. 按键修饰符变化

**Vue 2**
```vue
<!-- 使用 keyCode -->
<input @keyup.13="submit" />

<!-- 使用别名 -->
<input @keyup.enter="submit" />
```

**Vue 3**
```vue
<!-- 移除 keyCode，只能使用别名 -->
<input @keyup.enter="submit" />
<input @keyup.page-down="onPageDown" />

<!-- 系统修饰键 -->
<input @keyup.alt.enter="clear" />
<input @click.ctrl="onClick" />
```

## 迁移指南

### 推荐迁移步骤

1. **升级构建工具**
   - Vue CLI 4+ 或迁移到 Vite
   - 更新 webpack/babel 配置

2. **安装兼容版本**
   ```bash
   npm install vue@3 vue-router@4 vuex@4 # 或 pinia
   ```

3. **使用迁移构建版本**
   ```javascript
   // 提供兼容性警告
   import { createApp } from '@vue/compat'
   ```

4. **逐步修复警告**
   - 全局 API 迁移
   - 组件选项更新
   - 模板语法调整

5. **移除兼容版本**
   ```javascript
   import { createApp } from 'vue'
   ```

### 常见迁移问题

| 问题 | 解决方案 |
|------|---------|
| $on/$off/$once 不可用 | 使用 mitt 或 tiny-emitter |
| 过滤器不可用 | 改用方法或计算属性 |
| $children 不可用 | 使用 $refs 或 provide/inject |
| $listeners 不可用 | 使用 $attrs（已合并） |
| $scopedSlots 不可用 | 统一使用 $slots |
| 函数式组件语法变化 | 使用普通函数定义 |

### 破坏性变化清单

- [x] 全局 API 重构为应用实例方法
- [x] v-model 默认绑定名变化
- [x] 移除 .sync 修饰符
- [x] 移除 $on/$off/$once
- [x] 移除过滤器
- [x] 移除 $children
- [x] 移除 keyCode 修饰符
- [x] $attrs 包含 class 和 style
- [x] 自定义指令钩子重命名
- [x] 过渡类名变化 (v-enter → v-enter-from)
