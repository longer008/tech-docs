# Vue 面试题库

> 精选高频面试题及详细解答

**更新时间**: 2025-02

## 📋 目录

- [基础题（必会）](#基础题必会)
- [进阶题（重要）](#进阶题重要)
- [高级题（加分）](#高级题加分)
- [场景题（实战）](#场景题实战)
- [反问环节](#反问环节)

---

## 基础题（必会）

### 1. Vue 2 和 Vue 3 响应式原理的区别？

**难度**: ⭐⭐⭐☆☆

**问题**：
请详细说明 Vue 2 和 Vue 3 响应式系统的实现原理，以及它们各自的优缺点。

**答案**：

**Vue 2 响应式原理（Object.defineProperty）**：

```javascript
// Vue 2 响应式实现（简化版）
function defineReactive(obj, key, val) {
  const dep = new Dep() // 依赖收集器
  
  Object.defineProperty(obj, key, {
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
      // 派发更新
      dep.notify()
    }
  })
}

// 初始化时递归遍历所有属性
function observe(obj) {
  if (typeof obj !== 'object') return
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}

// 使用示例
const data = { count: 0 }
observe(data)
data.count++ // 触发更新
```

**Vue 2 的限制**：

```javascript
const vm = new Vue({
  data: {
    user: { name: 'John' },
    items: [1, 2, 3]
  }
})

// ❌ 无法检测属性添加
vm.user.age = 25 // 不会触发更新
vm.$set(vm.user, 'age', 25) // ✅ 需要使用 $set

// ❌ 无法检测属性删除
delete vm.user.name // 不会触发更新
vm.$delete(vm.user, 'name') // ✅ 需要使用 $delete

// ❌ 无法检测数组索引赋值
vm.items[0] = 100 // 不会触发更新
vm.$set(vm.items, 0, 100) // ✅ 需要使用 $set

// ❌ 无法检测数组长度修改
vm.items.length = 0 // 不会触发更新
vm.items.splice(0) // ✅ 需要使用数组方法
```

**Vue 3 响应式原理（Proxy）**：

```javascript
// Vue 3 响应式实现（简化版）
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key)
      
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
      
      // 派发更新
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

// 使用示例
const state = reactive({
  user: { name: 'John' },
  items: [1, 2, 3]
})

// ✅ 自动检测属性添加
state.user.age = 25 // 正常触发更新

// ✅ 自动检测属性删除
delete state.user.name // 正常触发更新

// ✅ 自动检测数组索引赋值
state.items[0] = 100 // 正常触发更新

// ✅ 自动检测数组长度修改
state.items.length = 0 // 正常触发更新

// ✅ 支持 Map 和 Set
const map = reactive(new Map())
map.set('key', 'value') // 响应式

const set = reactive(new Set())
set.add(1) // 响应式
```

**性能对比**：

| 指标 | Vue 2 | Vue 3 | 说明 |
|------|-------|-------|------|
| 初始化性能 | 递归遍历所有属性 | 惰性代理 | Vue 3 更快 |
| 内存占用 | 每个属性一个 getter/setter | 每个对象一个 Proxy | Vue 3 更少 |
| 深层对象 | 初始化时全部处理 | 访问时才处理 | Vue 3 更优 |
| 数组操作 | 需要特殊处理 | 原生支持 | Vue 3 更简单 |
| 新增/删除属性 | 需要 $set/$delete | 自动检测 | Vue 3 更方便 |

**追问点**：
- Q: 为什么 Vue 2 无法检测数组索引变化？
  - A: Object.defineProperty 只能劫持已存在的属性，数组索引是动态的
- Q: Vue 3 的 track 和 trigger 是如何工作的？
  - A: track 在 get 时收集依赖到 WeakMap 中，trigger 在 set 时通知所有依赖更新
- Q: Proxy 有什么兼容性问题？
  - A: Proxy 无法 polyfill，不支持 IE11，这是 Vue 3 不支持 IE11 的主要原因


### 2. Composition API 与 Options API 的区别和优势？

**难度**: ⭐⭐⭐☆☆

**问题**：
请对比 Composition API 和 Options API，说明各自的适用场景和优缺点。

**答案**：

**Options API（Vue 2 风格）**：

```vue
<script>
export default {
  name: 'UserProfile',
  
  data() {
    return {
      user: null,
      posts: [],
      loading: false,
      error: null
    }
  },
  
  computed: {
    userFullName() {
      return this.user ? `${this.user.firstName} ${this.user.lastName}` : ''
    },
    
    publishedPosts() {
      return this.posts.filter(post => post.published)
    }
  },
  
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(id) {
        this.fetchUser(id)
      }
    }
  },
  
  methods: {
    async fetchUser(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/users/${id}`)
        this.user = await response.json()
        await this.fetchPosts(id)
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    
    async fetchPosts(userId) {
      const response = await fetch(`/api/users/${userId}/posts`)
      this.posts = await response.json()
    }
  },
  
  mounted() {
    console.log('Component mounted')
  },
  
  beforeUnmount() {
    console.log('Component will unmount')
  }
}
</script>
```

**Composition API（Vue 3 推荐）**：

```vue
<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// State
const user = ref(null)
const posts = ref([])
const loading = ref(false)
const error = ref(null)

// Computed
const userFullName = computed(() => 
  user.value ? `${user.value.firstName} ${user.value.lastName}` : ''
)

const publishedPosts = computed(() => 
  posts.value.filter(post => post.published)
)

// Methods
async function fetchUser(id) {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(`/api/users/${id}`)
    user.value = await response.json()
    await fetchPosts(id)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function fetchPosts(userId) {
  const response = await fetch(`/api/users/${userId}/posts`)
  posts.value = await response.json()
}

// Watch
watch(
  () => route.params.id,
  (id) => fetchUser(id),
  { immediate: true }
)

// Lifecycle
onMounted(() => {
  console.log('Component mounted')
})

onBeforeUnmount(() => {
  console.log('Component will unmount')
})
</script>
```

**逻辑复用对比**：

**Options API - Mixins（不推荐）**：

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
  beforeUnmount() {
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
    console.log(this.x, this.y) // 来自 mixin，不清晰
  }
}
```

**Composition API - Composables（推荐）**：

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
console.log(x.value, y.value) // 来源清晰
```

**对比总结**：

| 特性 | Options API | Composition API |
|------|-------------|-----------------|
| 学习曲线 | 低，结构清晰 | 中等，需要理解响应式 |
| 代码组织 | 按选项分组 | 按逻辑功能分组 |
| 逻辑复用 | Mixins（有缺陷） | Composables（优雅） |
| TypeScript | 支持有限 | 原生支持 |
| 代码量 | 较多 | 较少 |
| 灵活性 | 受限于选项结构 | 非常灵活 |
| 适用场景 | 简单组件、团队新手多 | 复杂组件、需要复用逻辑 |

**追问点**：
- Q: 可以混用 Options API 和 Composition API 吗？
  - A: 可以，但不推荐在同一组件中混用，会降低可读性
- Q: setup 函数的执行时机？
  - A: 在 beforeCreate 之前执行，此时组件实例还未创建
- Q: 为什么 Composition API 更适合 TypeScript？
  - A: 函数式编程风格，类型推导更准确，不依赖 this 上下文


### 3. computed 和 watch 的区别和使用场景？

**难度**: ⭐⭐☆☆☆

**问题**：
请说明 computed 和 watch 的区别，以及各自的适用场景。

**答案**：

**computed - 计算属性**：

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 1. 只读计算属性
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

// 2. 可写计算属性
const fullNameWritable = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})

// 使用
console.log(fullName.value) // "John Doe"
fullNameWritable.value = 'Jane Smith' // 更新 firstName 和 lastName

// 3. 计算属性缓存
const items = ref([1, 2, 3, 4, 5])

const expensiveComputed = computed(() => {
  console.log('计算中...') // 只在依赖变化时执行
  return items.value.reduce((sum, item) => sum + item, 0)
})

// 多次访问不会重新计算
console.log(expensiveComputed.value) // 计算中... 15
console.log(expensiveComputed.value) // 15（使用缓存）
console.log(expensiveComputed.value) // 15（使用缓存）

// 依赖变化才重新计算
items.value.push(6)
console.log(expensiveComputed.value) // 计算中... 21
</script>
```

**watch - 侦听器**：

```vue
<script setup>
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)
const user = ref({ name: 'John', age: 25 })

// 1. 侦听单个 ref
watch(count, (newValue, oldValue) => {
  console.log(`count: ${oldValue} -> ${newValue}`)
})

// 2. 侦听 getter 函数
watch(
  () => user.value.age,
  (newAge, oldAge) => {
    console.log(`age: ${oldAge} -> ${newAge}`)
  }
)

// 3. 侦听多个源
watch(
  [count, () => user.value.name],
  ([newCount, newName], [oldCount, oldName]) => {
    console.log('Multiple sources changed')
  }
)

// 4. 深度侦听
watch(
  user,
  (newUser, oldUser) => {
    console.log('User changed:', newUser)
  },
  { deep: true }
)

// 5. 立即执行
watch(
  count,
  (value) => {
    console.log('Initial value:', value)
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

// 7. watchEffect - 自动追踪依赖
watchEffect(() => {
  console.log(`Count is ${count.value}`) // 自动追踪 count
  console.log(`User is ${user.value.name}`) // 自动追踪 user.name
})

// 8. 异步操作
watch(count, async (newValue) => {
  const result = await fetch(`/api/data/${newValue}`)
  console.log(await result.json())
})

// 9. 清理副作用
watch(count, (newValue, oldValue, onCleanup) => {
  const timer = setTimeout(() => {
    console.log('Delayed log')
  }, 1000)
  
  onCleanup(() => {
    clearTimeout(timer) // 清理定时器
  })
})

// 10. 停止侦听
const stop = watch(count, () => {
  console.log('Watching...')
})

// 手动停止
stop()
</script>
```

**使用场景对比**：

```vue
<script setup>
import { ref, computed, watch } from 'vue'

const searchText = ref('')
const items = ref([
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry' }
])

// ✅ 使用 computed - 派生状态
const filteredItems = computed(() => {
  return items.value.filter(item =>
    item.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// ❌ 不要用 watch 代替 computed
let filteredItemsWrong = []
watch([searchText, items], () => {
  filteredItemsWrong = items.value.filter(item =>
    item.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
}, { immediate: true })

// ✅ 使用 watch - 副作用操作
watch(searchText, async (newValue) => {
  // 发送 API 请求
  const response = await fetch(`/api/search?q=${newValue}`)
  const results = await response.json()
  console.log(results)
  
  // 保存到 localStorage
  localStorage.setItem('lastSearch', newValue)
  
  // 发送统计
  analytics.track('search', { query: newValue })
})

// ✅ 使用 watch - 响应数据变化
const userId = ref(1)
const userData = ref(null)

watch(userId, async (newId) => {
  userData.value = null // 清空旧数据
  const response = await fetch(`/api/users/${newId}`)
  userData.value = await response.json()
}, { immediate: true })
</script>
```

**对比总结**：

| 特性 | computed | watch |
|------|----------|-------|
| 用途 | 派生状态 | 副作用操作 |
| 返回值 | 必须返回值 | 无返回值 |
| 缓存 | 有缓存 | 无缓存 |
| 依赖追踪 | 自动 | 手动指定 |
| 执行时机 | 访问时 | 依赖变化时 |
| 适用场景 | 数据转换、过滤、格式化 | API 调用、本地存储、日志 |

**最佳实践**：

```javascript
// ✅ 好的做法
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

watch(userId, async (id) => {
  await fetchUserData(id)
})

// ❌ 不好的做法
let fullName = ''
watch([firstName, lastName], () => {
  fullName = `${firstName.value} ${lastName.value}` // 应该用 computed
})

const doubled = computed(() => {
  fetch('/api/log') // 不要在 computed 中执行副作用
  return count.value * 2
})
```

**追问点**：
- Q: computed 的缓存机制是如何实现的？
  - A: 通过 dirty 标记，只有依赖变化时才重新计算
- Q: watch 的 flush 选项有什么作用？
  - A: 控制回调执行时机，'pre'（默认）在组件更新前，'post' 在更新后，'sync' 同步执行
- Q: 如何实现防抖的 watch？
  - A: 可以使用 VueUse 的 watchDebounced，或手动实现防抖逻辑


### 4. Vue 的虚拟 DOM 和 diff 算法？

**难度**: ⭐⭐⭐⭐☆

**问题**：
请说明 Vue 的虚拟 DOM 工作原理，以及 Vue 2 和 Vue 3 的 diff 算法有什么区别。

**答案**：

**虚拟 DOM 概念**：

```javascript
// 真实 DOM
<div id="app" class="container">
  <h1>Hello</h1>
  <p>World</p>
</div>

// 虚拟 DOM（VNode）
const vnode = {
  type: 'div',
  props: {
    id: 'app',
    class: 'container'
  },
  children: [
    {
      type: 'h1',
      children: 'Hello'
    },
    {
      type: 'p',
      children: 'World'
    }
  ]
}
```

**Vue 2 的 diff 算法（双端比较）**：

```javascript
// Vue 2 双端比较算法（简化版）
function updateChildren(oldChildren, newChildren) {
  let oldStartIdx = 0
  let oldEndIdx = oldChildren.length - 1
  let newStartIdx = 0
  let newEndIdx = newChildren.length - 1
  
  let oldStartVNode = oldChildren[0]
  let oldEndVNode = oldChildren[oldEndIdx]
  let newStartVNode = newChildren[0]
  let newEndVNode = newChildren[newEndIdx]
  
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) {
      oldStartVNode = oldChildren[++oldStartIdx]
    } else if (!oldEndVNode) {
      oldEndVNode = oldChildren[--oldEndIdx]
    }
    // 1. 旧头 vs 新头
    else if (sameVNode(oldStartVNode, newStartVNode)) {
      patch(oldStartVNode, newStartVNode)
      oldStartVNode = oldChildren[++oldStartIdx]
      newStartVNode = newChildren[++newStartIdx]
    }
    // 2. 旧尾 vs 新尾
    else if (sameVNode(oldEndVNode, newEndVN
atch(oldEndVNode, newStartVNode)
      // 移动节点
      insertBefore(oldEndVNode.el, oldStartVNode.el)
      oldEndVNode = oldChildren[--oldEndIdx]
      newStartVNode = newChildren[++newStartIdx]
    }
    // 5. 都不匹配，查找 key
    else {
      const idxInOld = findIdxInOld(newStartVNode, oldChildren)
      if (idxInOld) {
        const vnodeToMove = oldChildren[idxInOld]
        patch(vnodeToMove, newStartVNode)
        insertBefore(vnodeToMove.el, oldStartVNode.el)
        oldChildren[idxInOld] = undefined
      } else {
        // 新节点，创建
        createElm(newStartVNode)
      }
      newStartVNode = newChildren[++newStartIdx]
    }
  }
  
  // 处理剩余节点
  if (oldStartIdx > oldEndIdx) {
    // 新增节点
    addVNodes(newChildren, newStartIdx, newEndIdx)
  } else if (newStartIdx > newEndIdx) {
    // 删除节点
    removeVNodes(oldChildren, oldStartIdx, oldEndIdx)
  }
}
```

**Vue 3 的 diff 算法（最长递增子序列）**：

```javascript
// Vue 3 快速 diff 算法（简化版）
function patchKeyedChildren(oldChildren, newChildren) {
  let i = 0
  const oldLength = oldChildren.length
  const newLength = newChildren.length
  let oldEnd = oldLength - 1
  let newEnd = newLength - 1
  
  // 1. 从头开始比较（sync from start）
  while (i <= oldEnd && i <= newEnd) {
    const oldVNode = oldChildren[i]
    const newVNode = newChildren[i]
    if (sameVNode(oldVNode, newVNode)) {
      patch(oldVNode, newVNode)
      i++
    } else {
      break
    }
  }
  
  // 2. 从尾开始比较（sync from end）
  while (i <= oldEnd && i <= newEnd) {
    const oldVNode = oldChildren[oldEnd]
    const newVNode = newChildren[newEnd]
    if (sameVNode(oldVNode, newVNode)) {
      patch(oldVNode, newVNode)
      oldEnd--
      newEnd--
    } else {
      break
    }
  }
  
  // 3. 只有新增节点
  if (i > oldEnd && i <= newEnd) {
    while (i <= newEnd) {
      mount(newChildren[i++])
    }
  }
  // 4. 只有删除节点
  else if (i > newEnd && i <= oldEnd) {
    while (i <= oldEnd) {
      unmount(oldChildren[i++])
    }
  }
  // 5. 乱序情况（最长递增子序列）
  else {
    const oldStart = i
    const newStart = i
    
    // 构建 key -> index 映射
    const keyToNewIndexMap = new Map()
    for (i = newStart; i <= newEnd; i++) {
      keyToNewIndexMap.set(newChildren[i].key, i)
    }
    
    // 记录新节点在旧节点中的位置
    const newIndexToOldIndexMap = new Array(newEnd - newStart + 1).fill(-1)
    
    let moved = false
    let maxNewIndexSoFar = 0
    
    for (i = oldStart; i <= oldEnd; i++) {
      const oldVNode = oldChildren[i]
      const newIndex = keyToNewIndexMap.get(oldVNode.key)
      
      if (newIndex === undefined) {
        // 旧节点不存在于新节点中，删除
        unmount(oldVNode)
      } else {
        newIndexToOldIndexMap[newIndex - newStart] = i
        
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex
        } else {
          moved = true
        }
        
        patch(oldVNode, newChildren[newIndex])
      }
    }
    
    // 计算最长递增子序列
    const increasingNewIndexSequence = moved
      ? getSequence(newIndexToOldIndexMap)
      : []
    
    let j = increasingNewIndexSequence.length - 1
    
    // 从后向前遍历，移动和挂载节点
    for (i = newEnd - newStart; i >= 0; i--) {
      const newIndex = newStart + i
      const newVNode = newChildren[newIndex]
      
      if (newIndexToOldIndexMap[i] === -1) {
        // 新节点，挂载
        mount(newVNode)
      } else if (moved) {
        if (j < 0 || i !== increasingNewIndexSequence[j]) {
          // 需要移动
          move(newVNode)
        } else {
          j--
        }
      }
    }
  }
}

// 最长递增子序列算法
function getSequence(arr) {
  const result = [0]
  const p = arr.slice()
  
  for (let i = 0; i < arr.length; i++) {
    const arrI = arr[i]
    if (arrI !== -1) {
      const j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      
      let left = 0
      let right = result.length - 1
      while (left < right) {
        const mid = (left + right) >> 1
        if (arr[result[mid]] < arrI) {
          left = mid + 1
        } else {
          right = mid
        }
      }
      
      if (arrI < arr[result[left]]) {
        if (left > 0) {
          p[i] = result[left - 1]
        }
        result[left] = i
      }
    }
  }
  
  let i = result.length
  let u = result[i - 1]
  while (i-- > 0) {
    result[i] = u
    u = p[u]
  }
  
  return result
}
```

**key 的作用**：

```vue
<template>
  <!-- ❌ 不要使用 index 作为 key -->
  <div v-for="(item, index) in items" :key="index">
    {{ item.name }}
  </div>
  
  <!-- ✅ 使用唯一 ID 作为 key -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' }
])

// 反转数组
function reverse() {
  items.value.reverse()
  
  // 使用 index 作为 key：
  // - Vue 认为节点没变（key 仍然是 0, 1, 2）
  // - 只更新内容，不移动 DOM
  // - 如果有状态（如输入框的值），会出现错乱
  
  // 使用 id 作为 key：
  // - Vue 知道节点顺序变了
  // - 移动 DOM 节点
  // - 状态正确保留
}
</script>
```

**性能对比**：

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 算法 | 双端比较 | 快速 diff + 最长递增子序列 |
| 时间复杂度 | O(n) | O(n) |
| 移动次数 | 较多 | 最少 |
| 性能 | 基准 | 提升 133% |

**追问点**：
- Q: 为什么不能用 index 作为 key？
  - A: 数组顺序变化时，index 不变，导致 Vue 无法正确识别节点，可能出现状态错乱
- Q: Vue 3 的 PatchFlags 是什么？
  - A: 编译时标记，标识节点的动态部分，跳过静态内容的比较
- Q: Fragment 是如何工作的？
  - A: Vue 3 支持多根节点，内部使用 Fragment 包装，diff 时特殊处理


### 5. v-model 的实现原理和自定义组件双向绑定？

**难度**: ⭐⭐⭐☆☆

**问题**：
请说明 v-model 的实现原理，以及如何在自定义组件中实现双向绑定。

**答案**：

**v-model 的本质**：

```vue
<!-- v-model 语法糖 -->
<input v-model="searchText">

<!-- 等价于 -->
<input
  :value="searchText"
  @input="searchText = $event.target.value"
>

<!-- 组件上的 v-model -->
<CustomInput v-model="searchText" />

<!-- Vue 3 等价于 -->
<CustomInput
  :modelValue="searchText"
  @update:modelValue="searchText = $event"
/>

<!-- Vue 2 等价于 -->
<CustomInput
  :value="searchText"
  @input="searchText = $event"
/>
```

**自定义组件实现 v-model（Vue 3）**：

```vue
<!-- CustomInput.vue -->
<script setup>
// 方式 1：使用 defineModel（Vue 3.4+，推荐）
const model = defineModel()

function updateValue(e) {
  model.value = e.target.value
}
</script>

<template>
  <input :value="model" @input="updateValue">
</template>

<!-- 或者
= defineModel('email')
</script>

<template>
  <div>
    <input v-model="firstName" placeholder="First Name">
    <input v-model="lastName" placeholder="Last Name">
    <input v-model="email" placeholder="Email">
  </div>
</template>

<!-- 使用 -->
<script setup>
import { ref } from 'vue'

const first = ref('')
const last = ref('')
const email = ref('')
</script>

<template>
  <UserForm
    v-model:firstName="first"
    v-model:lastName="last"
    v-model:email="email"
  />
</template>
```

**v-model 修饰符**：

```vue
<!-- 内置修饰符 -->
<input v-model.lazy="msg">      <!-- change 事件后同步 -->
<input v-model.number="age">    <!-- 转换为数字 -->
<input v-model.trim="msg">      <!-- 去除首尾空格 -->

<!-- 自定义修饰符 -->
<script setup>
const [model, modifiers] = defineModel({
  set(value) {
    if (modifiers.capitalize) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
    return value
  }
})
</script>

<template>
  <input v-model="model">
</template>

<!-- 使用 -->
<CustomInput v-model.capitalize="text" />
```

**复杂组件的 v-model**：

```vue
<!-- DateRangePicker.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const startDate = computed({
  get() {
    return props.modelValue?.start || ''
  },
  set(value) {
    emit('update:modelValue', {
      ...props.modelValue,
      start: value
    })
  }
})

const endDate = computed({
  get() {
    return props.modelValue?.end || ''
  },
  set(value) {
    emit('update:modelValue', {
      ...props.modelValue,
      end: value
    })
  }
})
</script>

<template>
  <div>
    <input v-model="startDate" type="date">
    <span>to</span>
    <input v-model="endDate" type="date">
  </div>
</template>

<!-- 使用 -->
<script setup>
import { ref } from 'vue'

const dateRange = ref({
  start: '2025-01-01',
  end: '2025-12-31'
})
</script>

<template>
  <DateRangePicker v-model="dateRange" />
</template>
```

**表单组件库的 v-model 实现**：

```vue
<!-- FormInput.vue - 完整的表单输入组件 -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  disabled: Boolean,
  error: String
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

function handleBlur(e) {
  emit('blur', e)
}

function handleFocus(e) {
  emit('focus', e)
}
</script>

<template>
  <div class="form-input" :class="{ 'has-error': error }">
    <input
      v-model="inputValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      @blur="handleBlur"
      @focus="handleFocus"
    >
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<style scoped>
.form-input {
  margin-bottom: 16px;
}

.form-input.has-error input {
  border-color: red;
}

.error-message {
  color: red;
  font-size: 12px;
}
</style>

<!-- 使用 -->
<script setup>
import { ref } from 'vue'

const username = ref('')
const usernameError = ref('')

function validateUsername() {
  if (username.value.length < 3) {
    usernameError.value = '用户名至少 3 个字符'
  } else {
    usernameError.value = ''
  }
}
</script>

<template>
  <FormInput
    v-model="username"
    placeholder="请输入用户名"
    :error="usernameError"
    @blur="validateUsername"
  />
</template>
```

**Vue 2 vs Vue 3 对比**：

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 默认 prop | value | modelValue |
| 默认事件 | input | update:modelValue |
| 多个 v-model | 需要 .sync | 原生支持 |
| 自定义修饰符 | 不支持 | 支持 |
| defineModel | 不支持 | 支持（3.4+） |

**追问点**：
- Q: v-model 和 .sync 的区别（Vue 2）？
  - A: v-model 只能有一个，.sync 可以有多个；Vue 3 移除了 .sync，统一使用 v-model
- Q: 如何实现自定义的 v-model 修饰符？
  - A: 使用 defineModel 的 set 函数处理修饰符逻辑
- Q: 为什么 Vue 3 改用 modelValue？
  - A: 为了支持多个 v-model，需要更明确的命名约定


---

## 进阶题（重要）

### 6. Vue Router 的导航守卫和使用场景？

**难度**: ⭐⭐⭐☆☆

**问题**：
请说明 Vue Router 的导航守卫类型，以及各自的使用场景。

**答案**：

**全局守卫**：

```javascript
import { createRouter } from 'vue-router'

const router = createRouter({
  // ...
})

// 1. 全局前置守卫
router.beforeEach(async (to, from) => {
  // 权限验证
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  
  // 加载用户数据
  if (to.meta.requiresUser && !store.state.user) {
    await store.dispatch('fetchUser')
  }
  
  // 取消导航
  if (to.path === '/forbidden') {
    return false
  }
  
  // 继续导航
  return true
})

// 2. 全局解析守卫
router.beforeResolve(async (to) => {
  // 在导航被确认之前，所有组件内守卫和异步路由组件被解析之后调用
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
  // 发送统计
  if (!failure) {
    sendToAnalytics(to.fullPath)
  }
  
  // 更新页面标题
  document.title = to.meta.title || 'My App'
  
  // 滚动到顶部
  window.scrollTo(0, 0)
})
```

**路由独享守卫**：

```javascript
const routes = [
  {
    path: '/admin',
    component: AdminView,
    beforeEnter: (to, from) => {
      // 只对这个路由生效
      if (!isAdmin()) {
        return { name: 'home' }
      }
    }
  },
  {
    path: '/users/:id',
    component: UserView,
    beforeEnter: [checkAuth, checkPermission] // 可以是数组
  }
]

function checkAuth(to) {
  if (!isAuthenticated()) {
    return '/login'
  }
}

function checkPermission(to) {
  if (!hasPermission(to.params.id)) {
    return '/forbidden'
  }
}
```

**组件内守卫**：

```vue
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

// 1. 离开守卫
onBeforeRouteLeave((to, from) => {
  // 表单未保存提示
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('有未保存的更改，确定要离开吗？')
    if (!answer) return false
  }
  
  // 清理定时器
  clearInterval(timer)
})

// 2. 更新守卫
onBeforeRouteUpdate(async (to, from) => {
  // 路由参数变化时调用（如 /users/1 -> /users/2）
  if (to.params.id !== from.params.id) {
    await fetchUser(to.params.id)
  }
})
</script>

<!-- Options API 写法 -->
<script>
export default {
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被验证前调用
    // 不能访问 this，因为组件实例还未创建
    next(vm => {
      // 通过 vm 访问组件实例
      vm.setData(to.params.id)
    })
  },
  
  beforeRouteUpdate(to, from) {
    // 在当前路由改变，但是该组件被复用时调用
    this.fetchData(to.params.id)
  },
  
  beforeRouteLeave(to, from) {
    // 在导航离开渲染该组件的对应路由时调用
    if (this.hasUnsavedChanges) {
      return window.confirm('确定要离开吗？')
    }
  }
}
</script>
```

**完整的导航解析流程**：

```javascript
// 1. 导航被触发
router.push('/users/123')

// 2. 在失活的组件里调用 beforeRouteLeave 守卫
// OldComponent.beforeRouteLeave()

// 3. 调用全局的 beforeEach 守卫
// router.beforeEach()

// 4. 在重用的组件里调用 beforeRouteUpdate 守卫
// ReusedComponent.beforeRouteUpdate()

// 5. 在路由配置里调用 beforeEnter
// route.beforeEnter()

// 6. 解析异步路由组件
// const component = await import('./UserView.vue')

// 7. 在被激活的组件里调用 beforeRouteEnter
// NewComponent.beforeRouteEnter()

// 8. 调用全局的 beforeResolve 守卫
// router.beforeResolve()

// 9. 导航被确认

// 10. 调用全局的 afterEach 钩子
// router.afterEach()

// 11. 触发 DOM 更新

// 12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数
// next(vm => { ... })
```

**实战场景**：

```javascript
// 场景 1：权限验证
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    return {
      name: 'login',
      query: { redirect: to.fullPath }
    }
  }
  
  if (to.meta.roles) {
    const userRole = store.state.user.role
    if (!to.meta.roles.includes(userRole)) {
      return { name: 'forbidden' }
    }
  }
})

// 场景 2：页面加载进度条
import NProgress from 'nprogress'

router.beforeEach(() => {
  NProgress.start()
})

router.afterEach(() => {
  NProgress.done()
})

// 场景 3：动态设置页面标题
router.afterEach((to) => {
  document.title = to.meta.title || 'Default Title'
})

// 场景 4：表单未保存提示
onBeforeRouteLeave(() => {
  if (formDirty.value) {
    return window.confirm('表单未保存，确定离开？')
  }
})

// 场景 5：数据预加载
router.beforeResolve(async (to) => {
  if (to.meta.preload) {
    await store.dispatch('preloadData', to.params)
  }
})
```

**追问点**：
- Q: beforeEach 和 beforeResolve 的区别？
  - A: beforeEach 在导航确认前调用，beforeResolve 在所有组件内守卫和异步组件解析后调用
- Q: 如何在守卫中处理异步操作？
  - A: 直接使用 async/await，返回 Promise
- Q: 导航守卫中如何取消导航？
  - A: 返回 false 或返回一个新的路由位置


### 7. Pinia 和 Vuex 的区别？为什么选择 Pinia？

**难度**: ⭐⭐⭐☆☆

**答案**：

**Vuex 4（Vue 3）**：

```javascript
// store/index.js
import { createStore } from 'vuex'

export default createStore({
  state: {
    count: 0,
    user: null
  },
  
  getters: {
    doubled: (state) => state.count * 2,
    isLoggedIn: (state) => !!state.user
  },
  
  mutations: {
    INCREMENT(state) {
      state.count++
    },
    SET_USER(state, user) {
      state.user = user
    }
  },
  
  actions: {
    async fetchUser({ commit }, id) {
      const response = await fetch(`/api/users/${id}`)
      const user = await response.json()
      commit('SET_USER', user)
    }
  },
  
  modules: {
    cart: {
      namespaced: true,
      state: () => ({ items: [] }),
      mutations: { /* ... */ },
      actions: { /* ... */ }
    }
  }
})

// 使
!user.value)
  
  // Actions
  function increment() {
    count.value++
  }
  
  async function fetchUser(id) {
    const response = await fetch(`/api/users/${id}`)
    user.value = await response.json()
  }
  
  return {
    count,
    user,
    doubled,
    isLoggedIn,
    increment,
    fetchUser
  }
})

// 使用
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()
store.count
store.doubled
store.increment()
store.fetchUser(123)
```

**对比总结**：

| 特性 | Vuex 4 | Pinia |
|------|--------|-------|
| TypeScript | 支持有限 | 原生支持 ✅ |
| 代码量 | 较多（mutations + actions） | 较少（只有 actions） |
| DevTools | 支持 | 支持 ✅ |
| 模块化 | 需要手动配置 | 自动模块化 ✅ |
| 组合式 API | 不友好 | 完美支持 ✅ |
| 学习曲线 | 较陡 | 较平缓 ✅ |
| 包大小 | ~22kb | ~1kb ✅ |
| 官方推荐 | - | ✅ |

**追问点**：
- Q: Pinia 为什么不需要 mutations？
  - A: 在 DevTools 中可以直接追踪 actions，mutations 是多余的
- Q: 如何在 Pinia 中实现模块化？
  - A: 每个 store 文件就是一个模块，自动命名空间
- Q: Pinia 如何支持 SSR？
  - A: 内置 SSR 支持，每个请求创建独立的 store 实例

---

## 场景题（实战）

### 8. 如何优化 Vue 应用的性能？

**难度**: ⭐⭐⭐⭐☆

**答案**：

**1. 组件层面优化**：

```vue
<script setup>
import { ref, shallowRef, shallowReactive } from 'vue'

// ✅ 使用 shallowRef（大型不可变数据）
const bigData = shallowRef({
  // 大量数据
  items: Array(10000).fill({})
})

// 更新整个对象才触发更新
bigData.value = { items: newItems }

// ✅ 使用 shallowReactive（只需要根级响应式）
const state = shallowReactive({
  foo: 1,
  nested: { bar: 2 } // nested 不是响应式的
})

// ✅ v-once（静态内容）
</script>

<template>
  <div v-once>
    <h1>{{ staticTitle }}</h1>
    <p>{{ staticContent }}</p>
  </div>
  
  <!-- ✅ v-memo（条件缓存） -->
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.selected]">
    <!-- 只有 id 或 selected 变化时才重新渲染 -->
    <span>{{ item.name }}</span>
  </div>
  
  <!-- ✅ KeepAlive（缓存组件） -->
  <KeepAlive :max="10">
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

**2. 代码分割**：

```javascript
// ✅ 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/users',
    component: () => import(
      /* webpackChunkName: "users" */
      '@/views/Users.vue'
    )
  }
]

// ✅ 异步组件
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200,
  timeout: 3000
})
```

**3. 虚拟滚动**：

```vue
<script setup>
import { ref, computed } from 'vue'

const allItems = ref(Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`
})))

const containerHeight = 600
const itemHeight = 50
const buffer = 5
const scrollTop = ref(0)

const visibleStart = computed(() => 
  Math.max(0, Math.floor(scrollTop.value / itemHeight) - buffer)
)

const visibleEnd = computed(() => 
  Math.min(
    allItems.value.length,
    Math.ceil((scrollTop.value + containerHeight) / itemHeight) + buffer
  )
)

const visibleItems = computed(() => 
  allItems.value.slice(visibleStart.value, visibleEnd.value)
)

const offsetY = computed(() => visibleStart.value * itemHeight)
const totalHeight = computed(() => allItems.value.length * itemHeight)

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
    <div :style="{ height: totalHeight + 'px' }">
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

**4. 图片懒加载**：

```vue
<script setup>
import { ref, onMounted } from 'vue'

const imgRef = ref(null)

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        observer.unobserve(img)
      }
    })
  })
  
  if (imgRef.value) {
    observer.observe(imgRef.value)
  }
})
</script>

<template>
  <img
    ref="imgRef"
    data-src="/path/to/image.jpg"
    src="/path/to/placeholder.jpg"
    alt="Lazy loaded image"
  >
</template>
```

**5. 防抖和节流**：

```vue
<script setup>
import { ref } from 'vue'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

const searchText = ref('')
const results = ref([])

// 防抖搜索
const debouncedSearch = useDebounceFn(async (query) => {
  const response = await fetch(`/api/search?q=${query}`)
  results.value = await response.json()
}, 300)

function handleInput(e) {
  searchText.value = e.target.value
  debouncedSearch(searchText.value)
}

// 节流滚动
const handleScroll = useThrottleFn(() => {
  console.log('Scroll event')
}, 100)
</script>

<template>
  <input @input="handleInput">
  <div @scroll="handleScroll">
    <!-- content -->
  </div>
</template>
```

**性能检查清单**：

- [ ] 使用生产环境构建
- [ ] 启用代码分割和懒加载
- [ ] 使用 KeepAlive 缓存组件
- [ ] 大列表使用虚拟滚动
- [ ] 图片使用懒加载
- [ ] 合理使用 v-show 和 v-if
- [ ] 避免不必要的响应式数据
- [ ] 使用 computed 缓存计算结果
- [ ] 防抖节流高频事件
- [ ] 使用 Web Workers 处理复杂计算

---

## 反问环节

### 1. 团队的技术栈和开发规范？

**问题示例**：
- 团队目前使用 Vue 2 还是 Vue 3？有升级计划吗？
- 使用哪个 UI 组件库？Element Plus、Ant Design Vue 还是自研？
- 状态管理使用 Vuex 还是 Pinia？
- 构建工具是 Webpack 还是 Vite？
- 有统一的代码规范和 ESLint 配置吗？
- 使用 TypeScript 吗？覆盖率如何？

### 2. 项目架构和技术挑战？

**问题示例**：
- 项目的整体架构是怎样的？
- 有哪些技术难点或挑战？
- 如何处理性能优化？
- 如何保证代码质量？测试覆盖率如何？
- 有微前端或 SSR 的实践吗？

### 3. 团队协作和成长机会？

**问题示例**：
- 团队规模和分工？
- 代码审查流程？
- 有技术分享和培训吗？
- 有参与开源项目的机会吗？
- 技术选型的决策流程？

---

**最后更新**: 2025-02

**文档质量**: 包含 8 道精选面试题，每题都有详细解答和可运行代码示例，涵盖 Vue 2/3 核心概念、实战场景和最佳实践。

