# React

> 用于构建用户界面的 JavaScript 库，专注于组件化开发和声明式编程

**更新时间**: 2025-02

## 📋 目录

- [元信息](#元信息)
- [核心概念](#核心概念)
- [面试宝典](#面试宝典)
- [实战文档](#实战文档)
- [学习资源](#学习资源)

## 📋 元信息

- **定位**: 用于构建用户界面的前端库，适合组件化开发与大型前端工程
- **适用场景**: 单页应用（SPA）、服务端渲染（SSR）、静态站点生成（SSG）、移动端应用（React Native）
- **版本范围**: React 18/19（本文档基于 React 19 最新特性，向下兼容 React 18）
- **相关生态**: React Router、状态管理（Redux Toolkit/Zustand/Jotai）、构建工具（Vite/Next.js）、UI 库（Ant Design/Material-UI）
- **官方文档**: [https://react.dev/](https://react.dev/)

## 🎯 核心概念

### 1. 组件（Components）

React 应用由组件构成，组件是可复用的 UI 单元。

**函数组件**（推荐）：
```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>
}
```

**类组件**（遗留代码）：
```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>
  }
}
```

### 2. JSX 语法

JSX 是 JavaScript 的语法扩展，允许在 JS 中编写类似 HTML 的代码。

```jsx
const element = (
  <div className="container">
    <h1>{user.name}</h1>
    <p>Age: {user.age}</p>
  </div>
)
```

### 3. Props（属性）

Props 是组件间传递数据的方式，单向数据流从父组件流向子组件。

```jsx
function UserCard({ name, age, avatar }) {
  return (
    <div>
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>Age: {age}</p>
    </div>
  )
}

// 使用
<UserCard name="Alice" age={25} avatar="/avatar.jpg" />
```

### 4. State（状态）

State 是组件内部的可变数据，状态改变会触发组件重新渲染。

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}
```

### 5. Hooks（钩子）

Hooks 让函数组件拥有状态和副作用管理能力。

**常用 Hooks**：
- `useState`: 状态管理
- `useEffect`: 副作用处理
- `useContext`: 上下文消费
- `useReducer`: 复杂状态管理
- `useMemo`: 缓存计算结果
- `useCallback`: 缓存函数引用
- `useRef`: 引用 DOM 或保存可变值

### 6. 生命周期

函数组件通过 `useEffect` 模拟生命周期：

```jsx
useEffect(() => {
  // 组件挂载时执行（componentDidMount）
  console.log('Component mounted')
  
  return () => {
    // 组件卸载时执行（componentWillUnmount）
    console.log('Component will unmount')
  }
}, []) // 空依赖数组表示仅在挂载/卸载时执行

useEffect(() => {
  // 依赖变化时执行（componentDidUpdate）
  console.log('Count changed:', count)
}, [count])
```

## 💡 面试宝典

> 完整题库详见：[interview-bank.md](./interview-bank.md)

### 基础题（必会）

#### Q1: 为什么 React 采用单向数据流？

**答案**：
- 数据从父组件流向子组件（Props），子组件通过回调函数通知父组件
- 减少双向绑定带来的不可控状态，便于追踪数据变化和调试
- 提高代码可预测性和可维护性

**代码示例**：
```jsx
// 父组件
function Parent() {
  const [count, setCount] = useState(0)
  
  return <Child count={count} onIncrement={() => setCount(count + 1)} />
}

// 子组件
function Child({ count, onIncrement }) {
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={onIncrement}>+1</button>
    </div>
  )
}
```

#### Q2: `key` 在列表渲染中的作用？

**答案**：
- 帮助 React 的 Diff 算法识别哪些元素发生了变化、添加或删除
- 保持组件状态的稳定性，避免不必要的重新渲染
- 必须在兄弟节点中唯一，不推荐使用数组索引

**代码示例**：
```jsx
// ❌ 错误：使用索引作为 key
{items.map((item, index) => (
  <Item key={index} data={item} />
))}

// ✅ 正确：使用唯一 ID
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

#### Q3: `useEffect` 的依赖数组如何理解？

**答案**：
- 依赖数组中的值发生变化时，effect 会重新执行
- 空数组 `[]` 表示仅在组件挂载时执行一次
- 不传依赖数组表示每次渲染都执行（通常不推荐）
- 必须包含 effect 中使用的所有外部变量（ESLint 会提示）

**代码示例**：
```jsx
// 仅挂载时执行
useEffect(() => {
  console.log('Component mounted')
}, [])

// 依赖 count 变化
useEffect(() => {
  document.title = `Count: ${count}`
}, [count])

// 清理函数
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Tick')
  }, 1000)
  
  return () => clearInterval(timer) // 组件卸载时清理
}, [])
```

#### Q4: `useMemo` 与 `useCallback` 的区别？

**答案**：
- `useMemo`: 缓存**计算结果**，避免重复计算
- `useCallback`: 缓存**函数引用**，避免子组件不必要的重新渲染
- 两者都接收依赖数组，依赖变化时重新计算/创建

**代码示例**：
```jsx
function ProductPage({ productId, referrer }) {
  const product = useData('/product/' + productId)
  
  // useMemo 缓存计算结果
  const requirements = useMemo(() => {
    return computeRequirements(product)
  }, [product])
  
  // useCallback 缓存函数引用
  const handleSubmit = useCallback((orderDetails) => {
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails,
    })
  }, [productId, referrer])
  
  return <ShippingForm requirements={requirements} onSubmit={handleSubmit} />
}
```

#### Q5: 受控组件与非受控组件的差异？

**答案**：
- **受控组件**: 表单数据由 React state 管理，通过 `value` 和 `onChange` 控制
- **非受控组件**: 表单数据由 DOM 自身管理，通过 `ref` 获取值
- 推荐使用受控组件，更符合 React 的数据流理念

**代码示例**：
```jsx
// 受控组件
function ControlledInput() {
  const [value, setValue] = useState('')
  
  return (
    <input 
      value={value} 
      onChange={e => setValue(e.target.value)} 
    />
  )
}

// 非受控组件
function UncontrolledInput() {
  const inputRef = useRef()
  
  const handleSubmit = () => {
    console.log(inputRef.current.value)
  }
  
  return <input ref={inputRef} />
}
```

### 进阶题（重要）

#### Q1: 如何避免不必要的重新渲染？

**答案**：
1. 使用 `React.memo` 包裹组件，进行浅比较
2. 使用 `useMemo` 缓存计算结果
3. 使用 `useCallback` 缓存函数引用
4. 合理拆分组件，避免大组件
5. 使用 Context 时注意拆分，避免过度渲染

**代码示例**：
```jsx
// React.memo 避免父组件更新导致子组件重新渲染
const ExpensiveChild = memo(function ExpensiveChild({ name }) {
  console.log('ExpensiveChild rendered')
  return <div>Hello, {name}!</div>
})

function Parent() {
  const [count, setCount] = useState(0)
  
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveChild name="John" /> {/* name 不变，不会重新渲染 */}
    </>
  )
}
```

#### Q2: 大型应用如何组织状态管理？

**答案**：
- **局部状态**: 使用 `useState`/`useReducer`，仅在组件内部使用
- **共享状态**: 使用 Context API 或状态管理库（Redux Toolkit/Zustand）
- **服务端状态**: 使用 React Query/SWR 管理异步数据和缓存
- **按领域拆分**: 避免单一全局 store，按功能模块拆分

**推荐方案**：
```jsx
// 局部状态
const [isOpen, setIsOpen] = useState(false)

// 全局状态（Zustand 示例）
import create from 'zustand'

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

// 服务端状态（React Query 示例）
import { useQuery } from '@tanstack/react-query'

function UserProfile({ userId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })
  
  if (isLoading) return <div>Loading...</div>
  return <div>{data.name}</div>
}
```

#### Q3: 如何优化首屏性能？

**答案**：
1. **代码分割**: 使用 `React.lazy` 和 `Suspense` 按路由懒加载
2. **预加载**: 使用 `<link rel="preload">` 预加载关键资源
3. **SSR/SSG**: 使用 Next.js 等框架进行服务端渲染或静态生成
4. **减少包体积**: Tree Shaking、按需引入、压缩代码
5. **图片优化**: 使用 WebP 格式、懒加载、CDN

**代码示例**：
```jsx
import { lazy, Suspense } from 'react'

// 懒加载组件
const Dashboard = lazy(() => import('./Dashboard'))
const Profile = lazy(() => import('./Profile'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  )
}
```

### 常见陷阱

::: warning 陷阱 1: 违反 Hooks 规则
**错误示例**：
```jsx
function Bad({ cond }) {
  if (cond) {
    // ❌ 错误：在条件语句中调用 Hook
    const [count, setCount] = useState(0)
  }
  
  for (let i = 0; i < 10; i++) {
    // ❌ 错误：在循环中调用 Hook
    useEffect(() => {})
  }
}
```

**正确做法**：
```jsx
function Good({ cond }) {
  // ✅ 正确：在函数顶层调用 Hook
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (cond) {
      // 条件逻辑放在 Hook 内部
    }
  }, [cond])
}
```
:::

::: warning 陷阱 2: useEffect 依赖遗漏
**错误示例**：
```jsx
function Bad() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    // ❌ 错误：使用了 count 但未添加到依赖数组
    console.log(count)
  }, [])
}
```

**正确做法**：
```jsx
function Good() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    // ✅ 正确：包含所有依赖
    console.log(count)
  }, [count])
}
```
:::

::: warning 陷阱 3: 使用数组索引作为 key
**错误示例**：
```jsx
// ❌ 错误：使用索引作为 key
{items.map((item, index) => (
  <Item key={index} data={item} />
))}
```

**正确做法**：
```jsx
// ✅ 正确：使用唯一 ID
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```
:::

::: warning 陷阱 4: 直接修改 state
**错误示例**：
```jsx
// ❌ 错误：直接修改 state
const [user, setUser] = useState({ name: 'Alice' })
user.name = 'Bob' // 不会触发重新渲染
```

**正确做法**：
```jsx
// ✅ 正确：创建新对象
setUser({ ...user, name: 'Bob' })
// 或
setUser(prev => ({ ...prev, name: 'Bob' }))
```
:::

## 🛠️ 实战文档

### React 19 新特性

#### 1. ref 作为 prop（无需 forwardRef）

React 19 允许直接将 `ref` 作为 prop 传递，无需使用 `forwardRef`。

```jsx
// React 19 之前
import { forwardRef } from 'react'

const MyInput = forwardRef(function MyInput({ placeholder }, ref) {
  return <input placeholder={placeholder} ref={ref} />
})

// React 19（推荐）
function MyInput({ placeholder, ref }) {
  return <input placeholder={placeholder} ref={ref} />
}

// 使用
<MyInput ref={inputRef} placeholder="Enter text" />
```

#### 2. Server Components（服务端组件）

Server Components 允许在服务端渲染组件，减少客户端 JavaScript 体积。

```jsx
// app/page.js (Server Component)
async function Page() {
  const data = await fetchData() // 在服务端执行
  
  return (
    <div>
      <h1>{data.title}</h1>
      <ClientComponent data={data} />
    </div>
  )
}

// components/ClientComponent.js
'use client' // 标记为客户端组件

export default function ClientComponent({ data }) {
  const [count, setCount] = useState(0)
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

#### 3. Actions（表单处理）

React 19 引入了 Actions，简化表单处理和异步操作。

```jsx
import { useActionState } from 'react'

function AddToCartForm({ productId }) {
  async function addToCart(prevState, formData) {
    const quantity = formData.get('quantity')
    await api.addToCart(productId, quantity)
    return { success: true }
  }
  
  const [state, formAction] = useActionState(addToCart, { success: false })
  
  return (
    <form action={formAction}>
      <input name="quantity" type="number" defaultValue={1} />
      <button type="submit">Add to Cart</button>
      {state.success && <p>Added successfully!</p>}
    </form>
  )
}
```

### 常用 Hooks 速查

#### useState - 状态管理

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  // 函数式更新（推荐）
  const increment = () => setCount(prev => prev + 1)
  
  return <button onClick={increment}>Count: {count}</button>
}
```

#### useEffect - 副作用处理

```jsx
import { useEffect } from 'react'

function DataFetcher({ userId }) {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    let cancelled = false
    
    async function fetchData() {
      const result = await api.getUser(userId)
      if (!cancelled) {
        setData(result)
      }
    }
    
    fetchData()
    
    // 清理函数
    return () => {
      cancelled = true
    }
  }, [userId])
  
  return <div>{data?.name}</div>
}
```

#### useContext - 上下文消费

```jsx
import { createContext, useContext } from 'react'

const ThemeContext = createContext('light')

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  )
}

function Toolbar() {
  const theme = useContext(ThemeContext)
  return <div className={theme}>Toolbar</div>
}
```

#### useReducer - 复杂状态管理

```jsx
import { useReducer } from 'react'

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    default:
      return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 })
  
  return (
    <>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  )
}
```

#### useRef - 引用 DOM 或保存可变值

```jsx
import { useRef, useEffect } from 'react'

function TextInput() {
  const inputRef = useRef(null)
  
  useEffect(() => {
    // 自动聚焦
    inputRef.current?.focus()
  }, [])
  
  return <input ref={inputRef} />
}

// 保存可变值（不触发重新渲染）
function Timer() {
  const intervalRef = useRef(null)
  
  const start = () => {
    intervalRef.current = setInterval(() => {
      console.log('Tick')
    }, 1000)
  }
  
  const stop = () => {
    clearInterval(intervalRef.current)
  }
  
  return (
    <>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  )
}
```

### 性能优化最佳实践

#### 1. 代码分割与懒加载

```jsx
import { lazy, Suspense } from 'react'

// 路由级别懒加载
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}
```

#### 2. 虚拟列表（大数据渲染）

```jsx
import { FixedSizeList } from 'react-window'

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  )
  
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

#### 3. 防抖与节流

```jsx
import { useState, useCallback } from 'react'
import { debounce } from 'lodash'

function SearchInput() {
  const [query, setQuery] = useState('')
  
  // 防抖搜索
  const debouncedSearch = useCallback(
    debounce((value) => {
      api.search(value)
    }, 300),
    []
  )
  
  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }
  
  return <input value={query} onChange={handleChange} />
}
```

### 常用代码片段

#### 自定义 Hook - useLocalStorage

```jsx
import { useState, useEffect } from 'react'

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  })
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  
  return [value, setValue]
}

// 使用
function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  )
}
```

#### 自定义 Hook - useFetch

```jsx
import { useState, useEffect } from 'react'

function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    let cancelled = false
    
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(url)
        const json = await response.json()
        
        if (!cancelled) {
          setData(json)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    fetchData()
    
    return () => {
      cancelled = true
    }
  }, [url])
  
  return { data, loading, error }
}

// 使用
function UserProfile({ userId }) {
  const { data, loading, error } = useFetch(`/api/users/${userId}`)
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>{data.name}</div>
}
```

### 版本差异

#### React 18 主要特性
- **并发渲染**: 支持 `startTransition` 和 `useDeferredValue`
- **自动批处理**: 所有更新自动批处理，包括 Promise、setTimeout
- **新 API**: `useId`、`useTransition`、`useDeferredValue`
- **Suspense SSR**: 支持流式 SSR

#### React 19 主要特性
- **ref 作为 prop**: 无需 `forwardRef`
- **Server Components**: 服务端组件支持
- **Actions**: 简化表单和异步操作
- **use Hook**: 读取 Promise 和 Context
- **优化的 Hydration**: 更快的首屏加载

::: tip 升级建议
- React 18 → 19: 主要是新增特性，向下兼容
- 使用 React Compiler 自动优化性能
- 逐步迁移到 Server Components（Next.js 14+）
:::

## 📚 学习资源

### 官方文档
- [React 官方文档](https://react.dev/) - 最新的官方文档（推荐）
- [React 19 发布说明](https://react.dev/blog/2024/12/05/react-19) - React 19 新特性
- [Hooks API 参考](https://react.dev/reference/react) - 完整的 Hooks API
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) - Hooks 使用规则

### 推荐阅读
- [Thinking in React](https://react.dev/learn/thinking-in-react) - React 思维方式
- [React 性能优化](https://react.dev/learn/render-and-commit) - 渲染与提交
- [React Query 文档](https://tanstack.com/query/latest) - 服务端状态管理
- [Next.js 文档](https://nextjs.org/docs) - React 全栈框架

### 实用工具
- [React DevTools](https://react.dev/learn/react-developer-tools) - 官方调试工具
- [ESLint Plugin React Hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) - Hooks 规则检查
- [React Testing Library](https://testing-library.com/react) - 测试工具
- [Storybook](https://storybook.js.org/) - 组件开发工具

## 🔗 相关文档

- [React Hooks 面试题](./interview-bank.md) - 完整面试题库
- [React 速查表](./react-cheatsheet.md) - 常用 API 速查
- [Next.js 面试题](./nextjs-interview.md) - Next.js 相关
- [TypeScript + React](../typescript/index.md) - TypeScript 集成

---

**内容来源**: 基于 [React 官方文档](https://react.dev/) 和最新面试题库整理，使用 Context7 MCP 验证最新特性（2025-02）
