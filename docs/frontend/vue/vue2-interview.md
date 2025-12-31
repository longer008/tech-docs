# Vue 2 面试题集

> Vue 2.x 版本核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. Vue 2 的响应式原理是什么？

**核心原理：Object.defineProperty**

```javascript
function defineReactive(obj, key, val) {
  // 递归处理嵌套对象
  observe(val)

  const dep = new Dep() // 依赖收集器

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      // 依赖收集
      if (Dep.target) {
        dep.depend()
      }
      return val
    },
    set(newVal) {
      if (newVal === val) return
      val = newVal
      observe(newVal) // 新值也要响应式处理
      dep.notify() // 通知更新
    }
  })
}

function observe(value) {
  if (typeof value !== 'object' || value === null) return
  Object.keys(value).forEach(key => {
    defineReactive(value, key, value[key])
  })
}
```

**标准回答：**
> Vue 2 使用 `Object.defineProperty` 劫持对象属性的 getter 和 setter。在 getter 中进行依赖收集（将 Watcher 添加到 Dep），在 setter 中触发更新通知（调用 Dep.notify）。由于 `Object.defineProperty` 的限制，Vue 2 无法检测对象属性的添加/删除，需要使用 `Vue.set`/`Vue.delete`。

---

#### 2. Vue 2 组件通信方式有哪些？

| 方式 | 场景 | 示例 |
|------|------|------|
| props / $emit | 父子组件 | 父传子用 props，子传父用 $emit |
| $parent / $children | 父子组件 | 直接访问父/子组件实例 |
| $refs | 父访问子 | `this.$refs.child.method()` |
| provide / inject | 跨级组件 | 祖先提供，后代注入 |
| EventBus | 任意组件 | 中央事件总线 |
| Vuex | 全局状态 | 集中式状态管理 |
| $attrs / $listeners | 跨级透传 | 透传属性和事件 |

```javascript
// EventBus 示例
// event-bus.js
import Vue from 'vue'
export const EventBus = new Vue()

// 组件 A - 发送
EventBus.$emit('custom-event', data)

// 组件 B - 接收
EventBus.$on('custom-event', (data) => {
  console.log(data)
})

// 组件销毁时移除监听
beforeDestroy() {
  EventBus.$off('custom-event')
}
```

---

#### 3. Vue 2 生命周期钩子及执行顺序

```
创建阶段
├── beforeCreate  → 实例初始化后，数据观测和事件配置之前
├── created       → 实例创建完成，可访问 data/methods，DOM 未挂载
│
挂载阶段
├── beforeMount   → 挂载开始前，render 首次调用
├── mounted       → 挂载完成，DOM 已渲染，可操作 DOM
│
更新阶段
├── beforeUpdate  → 数据变化后，DOM 更新前
├── updated       → DOM 更新完成
│
销毁阶段
├── beforeDestroy → 实例销毁前，实例仍可用
└── destroyed     → 实例销毁后，所有绑定和监听已移除
```

**父子组件生命周期顺序：**
```
挂载：父 beforeCreate → 父 created → 父 beforeMount
    → 子 beforeCreate → 子 created → 子 beforeMount → 子 mounted
    → 父 mounted

更新：父 beforeUpdate → 子 beforeUpdate → 子 updated → 父 updated

销毁：父 beforeDestroy → 子 beforeDestroy → 子 destroyed → 父 destroyed
```

---

#### 4. v-if 和 v-show 的区别

| 特性 | v-if | v-show |
|------|------|--------|
| 渲染方式 | 条件为假时不渲染 DOM | 始终渲染，用 CSS 控制显隐 |
| 切换开销 | 高（销毁/重建） | 低（只切换 display） |
| 初始开销 | 条件为假时无开销 | 始终有渲染开销 |
| 适用场景 | 条件很少改变 | 频繁切换 |
| 配合使用 | v-else, v-else-if | 无 |

```vue
<!-- v-if：条件渲染 -->
<div v-if="isShow">内容</div>

<!-- v-show：始终渲染，CSS 切换 -->
<div v-show="isShow">内容</div>
<!-- 渲染为：<div style="display: none;">内容</div> -->
```

---

#### 5. computed 和 watch 的区别

| 特性 | computed | watch |
|------|----------|-------|
| 缓存 | 有缓存，依赖不变不重新计算 | 无缓存 |
| 返回值 | 必须有返回值 | 不需要返回值 |
| 异步 | 不支持异步 | 支持异步操作 |
| 使用场景 | 依赖多个值计算出一个值 | 监听值变化执行副作用 |

```javascript
export default {
  data() {
    return {
      firstName: 'John',
      lastName: 'Doe',
      question: ''
    }
  },
  // computed：计算属性
  computed: {
    fullName() {
      return `${this.firstName} ${this.lastName}`
    }
  },
  // watch：侦听器
  watch: {
    question: {
      handler(newVal, oldVal) {
        this.fetchAnswer() // 可执行异步操作
      },
      immediate: true, // 立即执行一次
      deep: true // 深度监听
    }
  }
}
```

---

### 进阶/场景题

#### 1. Vue 2 的虚拟 DOM 和 Diff 算法

**虚拟 DOM 结构：**
```javascript
// VNode 结构
{
  tag: 'div',
  data: {
    attrs: { id: 'app' },
    class: { active: true }
  },
  children: [
    { tag: 'span', text: 'Hello' }
  ],
  text: undefined,
  elm: undefined, // 对应的真实 DOM
  key: undefined
}
```

**Diff 算法策略：**
1. **同层比较**：只比较同一层级的节点
2. **双端比较**：新旧节点列表从两端向中间比较
3. **Key 的作用**：精确匹配可复用节点

```javascript
// 双端比较伪代码
while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
  if (sameVnode(oldStartVnode, newStartVnode)) {
    // 头头比较
    patchVnode(oldStartVnode, newStartVnode)
    oldStartVnode = oldCh[++oldStartIdx]
    newStartVnode = newCh[++newStartIdx]
  } else if (sameVnode(oldEndVnode, newEndVnode)) {
    // 尾尾比较
    patchVnode(oldEndVnode, newEndVnode)
    oldEndVnode = oldCh[--oldEndIdx]
    newEndVnode = newCh[--newEndIdx]
  } else if (sameVnode(oldStartVnode, newEndVnode)) {
    // 头尾比较
    patchVnode(oldStartVnode, newEndVnode)
    // 移动节点
    parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling)
  } else if (sameVnode(oldEndVnode, newStartVnode)) {
    // 尾头比较
    patchVnode(oldEndVnode, newStartVnode)
    parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm)
  } else {
    // 通过 key 查找
    // ...
  }
}
```

---

#### 2. Vuex 核心概念及数据流

```
┌─────────────────────────────────────────────────┐
│                   Vue Component                  │
│  ┌──────────┐    dispatch    ┌──────────────┐  │
│  │  State   │ ←───────────── │   Actions    │  │
│  │ (状态)   │                │  (异步操作)   │  │
│  └────┬─────┘                └──────┬───────┘  │
│       │ render                commit │          │
│       ↓                             ↓          │
│  ┌──────────┐                ┌──────────────┐  │
│  │  View    │                │  Mutations   │  │
│  │ (视图)   │ ──────────────→│  (同步修改)   │  │
│  └──────────┘    dispatch    └──────────────┘  │
└─────────────────────────────────────────────────┘
```

```javascript
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0,
    todos: []
  },

  getters: {
    doneTodos: state => state.todos.filter(t => t.done),
    doneTodosCount: (state, getters) => getters.doneTodos.length
  },

  mutations: {
    INCREMENT(state) {
      state.count++
    },
    SET_TODOS(state, todos) {
      state.todos = todos
    }
  },

  actions: {
    async fetchTodos({ commit }) {
      const res = await api.getTodos()
      commit('SET_TODOS', res.data)
    },
    incrementAsync({ commit }) {
      setTimeout(() => commit('INCREMENT'), 1000)
    }
  },

  modules: {
    user: userModule,
    product: productModule
  }
})
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "Vue 2 可以检测数组索引变化" | 需要使用 `Vue.set` 或数组变异方法 |
| "data 可以是对象" | 组件中 data 必须是函数，避免数据共享 |
| "created 中可以操作 DOM" | DOM 未挂载，需在 mounted 中操作 |
| "watch 可以监听 computed" | 可以，但通常不需要 |
| "$forceUpdate 可以解决所有响应式问题" | 应该找到根本原因，使用 Vue.set |

---

## B. 实战文档

### 速查链接

| 资源 | 链接 |
|------|------|
| Vue 2 官方文档 | https://v2.vuejs.org/ |
| Vue Router 3.x | https://v3.router.vuejs.org/ |
| Vuex 3.x | https://v3.vuex.vuejs.org/ |
| Vue CLI | https://cli.vuejs.org/ |

### 常用代码片段

**1. 组件基础模板**
```vue
<template>
  <div class="my-component">
    <h1>{{ title }}</h1>
    <button @click="handleClick">Click</button>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',

  props: {
    title: {
      type: String,
      required: true
    }
  },

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
    count(newVal, oldVal) {
      console.log(`count changed: ${oldVal} -> ${newVal}`)
    }
  },

  created() {
    this.fetchData()
  },

  methods: {
    handleClick() {
      this.count++
      this.$emit('clicked', this.count)
    },
    async fetchData() {
      // ...
    }
  }
}
</script>

<style scoped>
.my-component {
  padding: 20px;
}
</style>
```

**2. 全局注册组件/指令/过滤器**
```javascript
// main.js
import Vue from 'vue'

// 全局组件
Vue.component('MyButton', {
  template: '<button class="my-btn"><slot></slot></button>'
})

// 全局指令
Vue.directive('focus', {
  inserted(el) {
    el.focus()
  }
})

// 全局过滤器
Vue.filter('currency', (value) => {
  return '$' + Number(value).toFixed(2)
})
```

**3. 混入 (Mixin)**
```javascript
// mixins/pagination.js
export default {
  data() {
    return {
      page: 1,
      pageSize: 10,
      total: 0
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    }
  },
  methods: {
    goToPage(page) {
      this.page = page
      this.fetchData()
    }
  }
}

// 使用
import paginationMixin from '@/mixins/pagination'

export default {
  mixins: [paginationMixin],
  methods: {
    fetchData() {
      // 实现具体的数据获取逻辑
    }
  }
}
```
