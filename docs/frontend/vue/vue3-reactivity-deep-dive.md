# Vue 3 响应式原理深入解析

> 更新时间：2025-02

## 目录

[[toc]]

## 什么是响应式系统

Vue 3 的响应式系统是基于 **Proxy** 实现的，相比 Vue 2 的 `Object.defineProperty`，具有更好的性能和更完整的拦截能力。

### 核心概念

- **响应式对象（Reactive）**：被 Proxy 代理的对象，能够追踪依赖和触发更新
- **副作用函数（Effect）**：依赖响应式数据的函数，数据变化时自动重新执行
- **依赖收集（Track）**：记录哪些副作用函数依赖了哪些响应式数据
- **触发更新（Trigger）**：响应式数据变化时，通知所有依赖的副作用函数重新执行

### 响应式系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    响应式系统核心                          │
├─────────────────────────────────────────────────────────┤
│  reactive()  │  ref()  │  computed()  │  watch()        │
├─────────────────────────────────────────────────────────┤
│              effect() - 副作用函数系统                     │
├─────────────────────────────────────────────────────────┤
│  track() - 依赖收集  │  trigger() - 触发更新             │
├─────────────────────────────────────────────────────────┤
│              Proxy - 拦截器（get/set/...）                │
└─────────────────────────────────────────────────────────┘
```

## reactive() 实现原理

### 基础实现

```javascript
// 存储原始对象到代理对象的映射
const reactiveMap = new WeakMap()

// 创建响应式对象
function reactive(target) {
  // 如果不是对象，直接返回
  if (typeof target !== 'object' || target === null) {
    return target
  }
  
  // 如果已经是响应式对象，直接返回
  if (reactiveMap.has(target)) {
    return reactiveMap.get(target)
  }
  
  // 创建 Proxy 代理
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key)
      
      const result = Reflect.get(target, key, receiver)
      
      // 如果是对象，递归转换为响应式
      if (typeof result === 'object' && result !== null) {
        return reactive(result)
      }
      
      return result
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      
      // 只有值真正改变时才触发更新
      if (oldValue !== value) {
        trigger(target, key)
      }
      
      return result
    },
    
    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key)
      const result = Reflect.deleteProperty(target, key)
      
      if (hadKey && result) {
        trigger(target, key)
      }
      
      return result
    }
  })
  
  // 缓存代理对象
  reactiveMap.set(target, proxy)
  
  return proxy
}
```

### 使用示例

```javascript
const state = reactive({
  count: 0,
  user: {
    name: 'Alice',
    age: 25
  }
})

// 访问属性会触发依赖收集
console.log(state.count) // 0

// 修改属性会触发更新
state.count++ // 触发 trigger

// 嵌套对象也是响应式的
state.user.name = 'Bob' // 触发 trigger
```

## 依赖收集（track）

### 数据结构

```javascript
// 全局依赖映射表
// WeakMap<target, Map<key, Set<effect>>>
const targetMap = new WeakMap()

// 当前正在执行的副作用函数
let activeEffect = null

// 副作用函数栈（处理嵌套 effect）
const effectStack = []
```

### track 实现

```javascript
function track(target, key) {
  // 如果没有正在执行的副作用函数，不需要收集依赖
  if (!activeEffect) {
    return
  }
  
  // 获取 target 对应的依赖 Map
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  
  // 获取 key 对应的依赖 Set
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  
  // 将当前副作用函数添加到依赖集合
  dep.add(activeEffect)
  
  // 副作用函数也要记录它依赖了哪些属性（用于清理）
  activeEffect.deps.push(dep)
}
```

### 依赖收集流程图

```
读取响应式数据
    ↓
触发 Proxy get 拦截器
    ↓
调用 track(target, key)
    ↓
获取或创建 depsMap
    ↓
获取或创建 dep (Set)
    ↓
将 activeEffect 添加到 dep
    ↓
完成依赖收集
```

## 触发更新（trigger）

### trigger 实现

```javascript
function trigger(target, key) {
  // 获取 target 对应的依赖 Map
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  
  // 获取 key 对应的依赖 Set
  const dep = depsMap.get(key)
  if (!dep) {
    return
  }
  
  // 创建一个新的 Set 来执行副作用函数
  // 避免在遍历过程中修改 Set 导致无限循环
  const effects = new Set(dep)
  
  effects.forEach(effect => {
    // 如果副作用函数不是当前正在执行的，才执行
    // 避免无限递归
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        // 如果有调度器，使用调度器执行
        effect.scheduler()
      } else {
        // 否则直接执行
        effect()
      }
    }
  })
}
```

### 触发更新流程图

```
修改响应式数据
    ↓
触发 Proxy set 拦截器
    ↓
调用 trigger(target, key)
    ↓
获取 depsMap 和 dep
    ↓
遍历 dep 中的所有 effect
    ↓
执行每个 effect 函数
    ↓
完成更新
```

## effect() 副作用函数

### 基础实

    effectFn()
  }
  
  return effectFn
}

// 清理副作用函数的依赖
function cleanup(effectFn) {
  effectFn.deps.forEach(dep => {
    dep.delete(effectFn)
  })
  effectFn.deps.length = 0
}
```

### 使用示例

```javascript
const state = reactive({ count: 0 })

// 创建副作用函数
effect(() => {
  console.log('count:', state.count)
})
// 输出: count: 0

// 修改数据，自动触发副作用函数
state.count++
// 输出: count: 1
```

### 嵌套 effect

```javascript
const state = reactive({ foo: 1, bar: 2 })

effect(() => {
  console.log('外层 effect')
  
  effect(() => {
    console.log('内层 effect, bar:', state.bar)
  })
  
  console.log('外层 effect, foo:', state.foo)
})

// 输出:
// 外层 effect
// 内层 effect, bar: 2
// 外层 effect, foo: 1

state.foo = 10
// 输出:
// 外层 effect
// 内层 effect, bar: 2
// 外层 effect, foo: 10
```

## ref() 实现原理

### 基础实现

```javascript
function ref(value) {
  // 如果已经是 ref，直接返回
  if (isRef(value)) {
    return value
  }
  
  return new RefImpl(value)
}

class RefImpl {
  constructor(value) {
    this._value = convert(value)
    this.__v_isRef = true
  }
  
  get value() {
    // 依赖收集
    track(this, 'value')
    return this._value
  }
  
  set value(newValue) {
    if (newValue !== this._value) {
      this._value = convert(newValue)
      // 触发更新
      trigger(this, 'value')
    }
  }
}

// 将对象转换为 reactive
function convert(value) {
  return typeof value === 'object' && value !== null
    ? reactive(value)
    : value
}

// 判断是否是 ref
function isRef(value) {
  return !!(value && value.__v_isRef === true)
}
```

### 使用示例

```javascript
const count = ref(0)

effect(() => {
  console.log('count:', count.value)
})
// 输出: count: 0

count.value++
// 输出: count: 1

// ref 包裹对象
const user = ref({ name: 'Alice' })
user.value.name = 'Bob' // 触发更新
```

### toRef 和 toRefs

```javascript
// toRef: 为响应式对象的某个属性创建 ref
function toRef(object, key) {
  return {
    get value() {
      return object[key]
    },
    set value(newValue) {
      object[key] = newValue
    },
    __v_isRef: true
  }
}

// toRefs: 将响应式对象的所有属性转换为 ref
function toRefs(object) {
  const result = {}
  for (const key in object) {
    result[key] = toRef(object, key)
  }
  return result
}

// 使用示例
const state = reactive({ count: 0, name: 'Alice' })

// 解构会失去响应性
const { count, name } = state // ❌ 失去响应性

// 使用 toRefs 保持响应性
const { count: countRef, name: nameRef } = toRefs(state) // ✅ 保持响应性

effect(() => {
  console.log(countRef.value, nameRef.value)
})

state.count++ // 触发更新
```

## computed() 实现原理

### 基础实现

```javascript
function computed(getter) {
  let value
  let dirty = true // 标记是否需要重新计算
  
  // 创建 effect，但不立即执行
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      // 当依赖变化时，标记为脏值
      dirty = true
      // 触发计算属性的依赖更新
      trigger(obj, 'value')
    }
  })
  
  const obj = {
    get value() {
      // 只有脏值时才重新计算
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      // 收集计算属性的依赖
      track(obj, 'value')
      return value
    },
    __v_isRef: true
  }
  
  return obj
}
```

### 使用示例

```javascript
const state = reactive({ count: 0 })

// 创建计算属性
const double = computed(() => state.count * 2)

console.log(double.value) // 0

state.count = 10
console.log(double.value) // 20

// 计算属性的缓存特性
effect(() => {
  console.log('double:', double.value)
  console.log('double:', double.value) // 不会重新计算
})
```

### 可写的计算属性

```javascript
const state = reactive({ firstName: 'John', lastName: 'Doe' })

const fullName = computed({
  get() {
    return `${state.firstName} ${state.lastName}`
  },
  set(value) {
    const [firstName, lastName] = value.split(' ')
    state.firstName = firstName
    state.lastName = lastName
  }
})

console.log(fullName.value) // John Doe

fullName.value = 'Jane Smith'
console.log(state.firstName) // Jane
console.log(state.lastName) // Smith
```


## watch() 实现原理

### 基础实现

```javascript
function watch(source, cb, options = {}) {
  let getter
  
  // 处理不同类型的 source
  if (typeof source === 'function') {
    getter = source
  } else if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => traverse(source)
  }
  
  let oldValue, newValue
  
  // 使用 scheduler 延迟执行回调
  const job = () => {
    newValue = effectFn()
    cb(newValue, oldValue)
    oldValue = newValue
  }
  
  const effectFn = effect(getter, {
    lazy: true,
    scheduler: job
  })
  
  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}

// 递归遍历对象的所有属性，触发依赖收集
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) {
    return value
  }
  
  seen.add(value)
lue, oldValue)
})

// 立即执行
watch(
  () => state.count,
  (newValue, oldValue) => {
    console.log('immediate:', newValue)
  },
  { immediate: true }
)
```

### watchEffect 实现

```javascript
function watchEffect(effect, options = {}) {
  return watch(effect, null, options)
}

// 使用示例
const state = reactive({ count: 0 })

watchEffect(() => {
  console.log('count:', state.count)
})
// 输出: count: 0

state.count++
// 输出: count: 1
```

## 响应式系统优化

### 1. 惰性响应式（Lazy Reactive）

```javascript
// 只有在访问时才转换为响应式
function shallowReactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver)
      trigger(target, key)
      return result
    }
  })
}

// 使用示例
const state = shallowReactive({
  count: 0,
  nested: { value: 1 } // nested 不是响应式的
})

effect(() => {
  console.log(state.count) // 响应式
  console.log(state.nested.value) // 非响应式
})
```

### 2. 只读响应式（Readonly）

```javascript
function readonly(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key)
      const result = Reflect.get(target, key, receiver)
      
      if (typeof result === 'object' && result !== null) {
        return readonly(result)
      }
      
      return result
    },
    set() {
      console.warn('readonly object cannot be modified')
      return true
    },
    deleteProperty() {
      console.warn('readonly object cannot be modified')
      return true
    }
  })
}

// 使用示例
const state = reactive({ count: 0 })
const readonlyState = readonly(state)

readonlyState.count = 10 // 警告: readonly object cannot be modified
```

### 3. 浅层只读（Shallow Readonly）

```javascript
function shallowReadonly(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set() {
      console.warn('readonly object cannot be modified')
      return true
    }
  })
}
```

### 4. 标记原始对象（markRaw）

```javascript
const RAW = Symbol('raw')

function markRaw(value) {
  Object.defineProperty(value, RAW, {
    value: true,
    configurable: false
  })
  return value
}

function reactive(target) {
  // 如果是标记为原始对象，不进行代理
  if (target[RAW]) {
    return target
  }
  
  // ... 其他代理逻辑
}

// 使用示例
const obj = markRaw({ count: 0 })
const state = reactive(obj) // 返回原始对象，不进行代理
```

## 响应式系统调试

### 1. 依赖追踪

```javascript
// 获取对象的所有依赖
function getDeps(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return []
  
  const dep = depsMap.get(key)
  return dep ? Array.from(dep) : []
}

// 使用示例
const state = reactive({ count: 0 })

effect(() => {
  console.log(state.count)
})

console.log(getDeps(state, 'count')) // [effectFn]
```

### 2. 响应式调试钩子

```javascript
function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    
    // 调试钩子：执行前
    if (options.onTrack) {
      options.onTrack({ effect: effectFn, target, key, type: 'get' })
    }
    
    activeEffect = effectFn
    effectStack.push(effectFn)
    
    const result = fn()
    
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    
    // 调试钩子：执行后
    if (options.onTrigger) {
      options.onTrigger({ effect: effectFn, target, key, type: 'set' })
    }
    
    return result
  }
  
  effectFn.deps = []
  effectFn.scheduler = options.scheduler
  
  if (!options.lazy) {
    effectFn()
  }
  
  return effectFn
}

// 使用示例
const state = reactive({ count: 0 })

effect(
  () => {
    console.log(state.count)
  },
  {
    onTrack(e) {
      console.log('track:', e)
    },
    onTrigger(e) {
      console.log('trigger:', e)
    }
  }
)
```

## 实战案例

### 1. 实现简单的状态管理

```javascript
// 创建 store
function createStore(state, actions) {
  const store = reactive(state)
  
  const wrappedActions = {}
  for (const key in actions) {
    wrappedActions[key] = (...args) => {
      return actions[key](store, ...args)
    }
  }
  
  return {
    state: readonly(store),
    ...wrappedActions
  }
}

// 使用示例
const counterStore = createStore(
  { count: 0 },
  {
    increment(state) {
      state.count++
    },
    decrement(state) {
      state.count--
    }
  }
)

effect(() => {
  console.log('count:', counterStore.state.count)
})

counterStore.increment() // count: 1
counterStore.increment() // count: 2
```

### 2. 实现响应式表单验证

```javascript
function createForm(initialValues, rules) {
  const values = reactive(initialValues)
  const errors = reactive({})
  const touched = reactive({})
  
  // 验证单个字段
  function validateField(field) {
    const rule = rules[field]
    if (!rule) return
    
    const value = values[field]
    const error = rule(value)
    
    if (error) {
      errors[field] = error
    } else {
      delete errors[field]
    }
  }
  
  // 监听字段变化，自动验证
  for (const field in rules) {
    watch(
      () => values[field],
      () => {
        if (touched[field]) {
          validateField(field)
        }
      }
    )
  }
  
  return {
    values,
    errors: readonly(errors),
    touched: readonly(touched),
    
    handleBlur(field) {
      touched[field] = true
      validateField(field)
    },
    
    handleSubmit(callback) {
      // 标记所有字段为已触摸
      for (const field in values) {
        touched[field] = true
      }
      
      // 验证所有字段
      for (const field in rules) {
        validateField(field)
      }
      
      // 如果没有错误，执行回调
      if (Object.keys(errors).length === 0) {
        callback(values)
      }
    }
  }
}

// 使用示例
const form = createForm(
  { email: '', password: '' },
  {
    email: (value) => {
      if (!value) return '邮箱不能为空'
      if (!/\S+@\S+\.\S+/.test(value)) return '邮箱格式不正确'
    },
    password: (value) => {
      if (!value) return '密码不能为空'
      if (value.length < 6) return '密码至少6位'
    }
  }
)

// 监听表单状态
effect(() => {
  console.log('表单值:', form.values)
  console.log('表单错误:', form.errors)
})

// 修改表单值
form.values.email = 'test@example.com'
form.handleBlur('email')
```

### 3. 实现响应式缓存

```javascript
function createCache(fetcher, options = {}) {
  const cache = reactive(new Map())
  const loading = reactive(new Map())
  const { ttl = 60000 } = options // 默认缓存 60 秒
  
  async function get(key) {
    // 如果缓存中有数据且未过期，直接返回
    if (cache.has(key)) {
      const { data, timestamp } = cache.get(key)
      if (Date.now() - timestamp < ttl) {
        return data
      }
    }
    
    // 如果正在加载，等待加载完成
    if (loading.has(key)) {
      return loading.get(key)
    }
    
    // 开始加载
    const promise = fetcher(key).then(data => {
      cache.set(key, { data, timestamp: Date.now() })
      loading.delete(key)
      return data
    })
    
    loading.set(key, promise)
    return promise
  }
  
  function clear(key) {
    if (key) {
      cache.delete(key)
    } else {
      cache.clear()
    }
  }
  
  return {
    get,
    clear,
    cache: readonly(cache),
    loading: readonly(loading)
  }
}

// 使用示例
const userCache = createCache(
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  },
  { ttl: 30000 }
)

// 监听缓存状态
effect(() => {
  console.log('缓存大小:', userCache.cache.size)
  console.log('加载中:', userCache.loading.size)
})

// 获取用户数据
const user = await userCache.get(1)
```

## 性能优化技巧

### 1. 避免不必要的响应式转换

```javascript
// ❌ 不好的做法
const state = reactive({
  largeArray: new Array(10000).fill(0).map((_, i) => ({ id: i, value: i }))
})

// ✅ 好的做法
const state = reactive({
  largeArray: markRaw(new Array(10000).fill(0).map((_, i) => ({ id: i, value: i })))
})
```

### 2. 使用 shallowReactive 减少嵌套代理

```javascript
// ❌ 深层响应式（性能开销大）
const state = reactive({
  list: [
    { id: 1, data: { /* 大量数据 */ } },
    { id: 2, data: { /* 大量数据 */ } }
  ]
})

// ✅ 浅层响应式（只代理第一层）
const state = shallowReactive({
  list: [
    { id: 1, data: { /* 大量数据 */ } },
    { id: 2, data: { /* 大量数据 */ } }
  ]
})
```

### 3. 批量更新优化

```javascript
// ❌ 多次触发更新
state.count++
state.count++
state.count++

// ✅ 使用 nextTick 批量更新
import { nextTick } from 'vue'

state.count++
state.count++
state.count++

await nextTick()
// 此时 DOM 已更新
```

### 4. 使用 computed 缓存计算结果

```javascript
// ❌ 每次都重新计算
effect(() => {
  const result = expensiveComputation(state.data)
  console.log(result)
})

// ✅ 使用 computed 缓存
const result = computed(() => expensiveComputation(state.data))

effect(() => {
  console.log(result.value)
})
```

## 常见问题

### 1. 为什么 reactive 不能代理基本类型？

```javascript
// ❌ 错误：reactive 只能代理对象
const count = reactive(0)

// ✅ 正确：使用 ref 包裹基本类型
const count = ref(0)
```

**原因**：Proxy 只能代理对象，不能代理基本类型。ref 内部使用对象包裹基本类型值。

### 2. 为什么解构会失去响应性？

```javascript
const state = reactive({ count: 0, name: 'Alice' })

// ❌ 失去响应性
const { count, name } = state

// ✅ 使用 toRefs 保持响应性
const { count, name } = toRefs(state)
```

**原因**：解构会创建新的变量，不再是响应式对象的属性。toRefs 为每个属性创建 ref，保持响应性。

### 3. 为什么数组索引赋值不触发更新？

```javascript
const state = reactive({ list: [1, 2, 3] })

// ✅ 会触发更新（Vue 3 已修复）
state.list[0] = 10

// Vue 2 中需要使用 Vue.set
// Vue.set(state.list, 0, 10)
```

**原因**：Vue 3 使用 Proxy 可以拦截数组索引操作，Vue 2 使用 Object.defineProperty 无法拦截。

### 4. 如何避免循环依赖？

```javascript
// ❌ 循环依赖
const state = reactive({ count: 0 })

effect(() => {
  state.count = state.count + 1 // 无限循环
})

// ✅ 使用条件判断
effect(() => {
  if (state.count < 10) {
    state.count++
  }
})
```

## 面试要点

### 核心问题

1. **Vue 3 响应式系统的核心原理是什么？**
   - 基于 Proxy 实现
   - 依赖收集（track）和触发更新（trigger）
   - 副作用函数（effect）系统

2. **reactive 和 ref 的区别？**
   - reactive 用于对象，ref 用于基本类型
   - reactive 返回代理对象，ref 返回包装对象
   - ref 需要 .value 访问，reactive 直接访问

3. **computed 的缓存原理？**
   - 使用 dirty 标记是否需要重新计算
   - 依赖变化时标记为脏值
   - 访问时才重新计算

4. **watch 和 watchEffect 的区别？**
   - watch 需要指定监听源，watchEffect 自动收集依赖
   - watch 可以访问旧值，watchEffect 不能
   - watch 默认惰性执行，watchEffect 立即执行

### 追问点

- 如何实现深度监听？
- 如何避免响应式系统的性能问题？
- 如何调试响应式系统？
- 响应式系统如何处理数组？
- 响应式系统如何处理 Set/Map？

## 参考资料

- [Vue 3 官方文档 - 深入响应式系统](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)
- [Vue 3 源码解析 - 响应式系统](https://github.com/vuejs/core/tree/main/packages/reactivity)
- [Vue.js 设计与实现](https://book.douban.com/subject/35768338/)
- [深入理解 Vue 3 响应式原理](https://juejin.cn/post/7001999813344493581)
