# React 面试题库

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

### 1. 函数组件与 Class 组件的差异？

**难度**: ⭐⭐☆☆☆

**问题**：
请说明函数组件和 Class 组件的主要区别，以及为什么现在推荐使用函数组件？

**答案**：

**主要区别**：
1. **语法简洁性**: 函数组件更简洁，无需 `this` 绑定
2. **状态管理**: 函数组件使用 Hooks（useState、useReducer），Class 组件使用 this.state
3. **生命周期**: 函数组件使用 useEffect 统一处理，Class 组件有多个生命周期方法
4. **逻辑复用**: 函数组件通过自定义 Hook 复用，Class 组件通过 HOC 或 Render Props
5. **性能优化**: 函数组件使用 React.memo，Class 组件使用 shouldComponentUpdate 或 PureComponent

**代码对比**：
```jsx
// 函数组件（推荐）
import { useState, useEffect } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    document.title = `Count: ${count}`
  }, [count])
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}

// Class 组件（遗留代码）
class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
    this.handleClick = this.handleClick.bind(this) // 需要绑定 this
  }
  
  componentDidMount() {
    document.title = `Count: ${this.state.count}`
  }
  
  componentDidUpdate() {
    document.title = `Count: ${this.state.count}`
  }
  
  handleClick() {
    this.setState({ count: this.state.count + 1 })
  }
  
  render() {
    return (
      <button onClick={this.handleClick}>
        Count: {this.state.count}
      </button>
    )
  }
}
```

**追问点**：
- Q: React.memo 和 PureComponent 的区别？
  - A: React.memo 用于函数组件，PureComponent 用于 Class 组件，都是浅比较 props
- Q: Hooks 如何替代生命周期方法？
  - A: useEffect 可以模拟 componentDidMount、componentDidUpdate、componentWillUnmount
- Q: 为什么函数组件
k
    const theme = useContext(ThemeContext)
  }
}
```

**正确示例**：
```jsx
function Good({ cond }) {
  // ✅ 正确：在函数顶层调用 Hook
  const [count, setCount] = useState(0)
  const theme = useContext(ThemeContext)
  
  useEffect(() => {
    if (cond) {
      // 条件逻辑放在 Hook 内部
      console.log('Condition is true')
    }
  }, [cond])
  
  return <div>{count}</div>
}
```

**为什么有这些规则**：
- React 依赖 Hook 的调用顺序来正确保存状态
- 如果 Hook 在条件语句中，调用顺序可能会改变，导致状态错乱

**追问点**：
- Q: useEffect 和 useLayoutEffect 的区别？
  - A: useEffect 在浏览器绘制后异步执行，useLayoutEffect 在 DOM 更新后同步执行（阻塞渲染）
- Q: 如何检测 Hook 规则违规？
  - A: 使用 ESLint 插件 `eslint-plugin-react-hooks`
- Q: 自定义 Hook 的命名规则？
  - A: 必须以 `use` 开头，如 `useLocalStorage`、`useFetch`

---

### 3. 状态更新与批处理？

**难度**: ⭐⭐⭐☆☆

**问题**：
React 如何处理多个 setState 调用？React 18 的自动批处理有什么改进？

**答案**：

**批处理机制**：
- React 会将多个 setState 调用合并成一次更新，减少重新渲染次数
- React 18 之前：只在事件处理函数中批处理
- React 18：所有更新都自动批处理（包括 Promise、setTimeout）

**代码示例**：
```jsx
function Counter() {
  const [count, setCount] = useState(0)
  
  // React 18 之前：会触发 3 次渲染
  // React 18：只触发 1 次渲染
  const handleClick = () => {
    setCount(c => c + 1)
    setCount(c => c + 1)
    setCount(c => c + 1)
  }
  
  // Promise 中的更新（React 18 也会批处理）
  const handleAsync = async () => {
    await fetch('/api/data')
    setCount(c => c + 1) // React 18: 批处理
    setCount(c => c + 1) // React 18: 批处理
  }
  
  return <button onClick={handleClick}>Count: {count}</button>
}
```

**函数式更新**：
```jsx
// ❌ 错误：依赖旧值
setCount(count + 1)
setCount(count + 1) // 仍然是 count + 1

// ✅ 正确：函数式更新
setCount(prev => prev + 1)
setCount(prev => prev + 1) // 正确累加
```

**退出批处理**：
```jsx
import { flushSync } from 'react-dom'

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1) // 立即更新
  })
  // DOM 已更新
  flushSync(() => {
    setCount(c => c + 1) // 立即更新
  })
}
```

**追问点**：
- Q: flushSync 的使用场景？
  - A: 需要立即读取 DOM 状态时，如测量元素尺寸
- Q: 批处理对性能的影响？
  - A: 减少渲染次数，提升性能，避免中间状态闪烁
- Q: 如何在异步代码中正确更新状态？
  - A: 使用函数式更新，避免闭包陷阱

---

### 4. 列表渲染中的 key 作用？

**难度**: ⭐⭐☆☆☆

**问题**：
为什么列表渲染需要 key？使用数组索引作为 key 有什么问题？

**答案**：

**key 的作用**：
1. 帮助 React 识别哪些元素发生了变化、添加或删除
2. 优化 Diff 算法，提高渲染性能
3. 保持组件状态的稳定性

**错误示例**：
```jsx
// ❌ 错误：使用索引作为 key
{items.map((item, index) => (
  <TodoItem key={index} data={item} />
))}

// 问题：删除第一项后，所有项的 key 都会改变
// 原始：[0: 'A', 1: 'B', 2: 'C']
// 删除 A：[0: 'B', 1: 'C']
// React 认为 0 号元素从 'A' 变成了 'B'，导致不必要的更新
```

**正确示例**：
```jsx
// ✅ 正确：使用唯一 ID
{items.map(item => (
  <TodoItem key={item.id} data={item} />
))}

// 删除第一项后，key 保持稳定
// 原始：['id-1': 'A', 'id-2': 'B', 'id-3': 'C']
// 删除 A：['id-2': 'B', 'id-3': 'C']
// React 知道 'id-1' 被删除，'id-2' 和 'id-3' 保持不变
```

**实际案例**：
```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', done: false },
    { id: 2, text: 'Build App', done: false },
  ])
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ))
  }
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => toggleTodo(todo.id)}
          />
          {todo.text}
        </li>
      ))}
    </ul>
  )
}
```

**追问点**：
- Q: key 必须全局唯一吗？
  - A: 不需要，只需要在兄弟节点中唯一
- Q: 什么时候可以使用索引作为 key？
  - A: 列表是静态的（不会重新排序、过滤或添加/删除）
- Q: key 改变会发生什么？
  - A: React 会卸载旧组件，挂载新组件，状态会丢失

---

### 5. 避免不必要的重新渲染？

**难度**: ⭐⭐⭐⭐☆

**问题**：
有哪些方法可以避免 React 组件不必要的重新渲染？

**答案**：

**优化方法**：

**1. React.memo（组件级别）**
```jsx
// 父组件更新时，子组件不会重新渲染（如果 props 没变）
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

**2. useMemo（缓存计算结果）**
```jsx
function ProductList({ products, filter }) {
  // 只有 products 或 filter 变化时才重新计算
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...')
    return products.filter(p => p.category === filter)
  }, [products, filter])
  
  return (
    <ul>
      {filteredProducts.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  )
}
```

**3. useCallback（缓存函数引用）**
```jsx
function Parent() {
  const [count, setCount] = useState(0)
  
  // 没有 useCallback：每次渲染都创建新函数，导致 Child 重新渲染
  // const handleClick = () => console.log('clicked')
  
  // 使用 useCallback：函数引用保持不变
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])
  
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <Child onClick={handleClick} />
    </>
  )
}

const Child = memo(function Child({ onClick }) {
  console.log('Child rendered')
  return <button onClick={onClick}>Click me</button>
})
```

**4. 拆分组件**
```jsx
// ❌ 不好：整个组件都会重新渲染
function Page() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveComponent /> {/* 不必要的重新渲染 */}
    </div>
  )
}

// ✅ 好：拆分组件，隔离状态
function Page() {
  return (
    <div>
      <Counter />
      <ExpensiveComponent /> {/* 不会重新渲染 */}
    </div>
  )
}

function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

**5. Context 优化**
```jsx
// ❌ 不好：所有消费者都会重新渲染
const AppContext = createContext()

function App() {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('light')
  
  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
      <Child />
    </AppContext.Provider>
  )
}

// ✅ 好：拆分 Context
const UserContext = createContext()
const ThemeContext = createContext()

function App() {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('light')
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <Child />
      </ThemeContext.Provider>
    </UserContext.Provider>
  )
}
```

**追问点**：
- Q: React.memo 的浅比较有什么限制？
  - A: 只比较 props 的第一层，对象/数组引用变化会导致重新渲染
- Q: 何时使用 useMemo 和 useCallback？
  - A: 计算开销大、子组件使用 memo、依赖数组稳定时使用
- Q: 过度优化的问题？
  - A: useMemo/useCallback 本身有开销，不要过早优化

---


## 进阶题（重要）

### 6. Suspense 与并发特性？

**难度**: ⭐⭐⭐⭐☆

**问题**：
React Suspense 是什么？如何使用？React 18 的并发特性有哪些？

**答案**：

**Suspense 基础**：
- Suspense 用于协调异步操作（数据加载、代码分割）的加载状态
- 显示 fallback UI 直到子组件准备好渲染

**代码分割（Lazy Loading）**：
```jsx
import { lazy, Suspense } from 'react'

// 懒加载组件
const MarkdownPreview = lazy(() => import('./MarkdownPreview'))

function Editor() {
  const [showPreview, setShowPreview] = useState(false)
  
  return (
    <>
      <textarea />
      <label>
        <input
          type="checkbox"
          checked={showPreview}
          onChange={e => setShowPreview(e.target.checked)}
        />
        Show preview
      </label>
      
      {showPreview && (
        <Suspense fallback={<Loading />}>
          <MarkdownPreview />
        </Suspense>
      )}
    </>
  )
}
```

**数据加载（配合 React Query）**：
```jsx
import { Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'

function UserProfile({ userId }) {
  // suspense: true 让 useQuery 支持 Suspense
  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    suspense: true,
  })
  
  return <div>{data.name}</div>
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile userId={1} />
    </Suspense>
  )
}
```

**并发特性（React 18）**：

**1. useTransition - 标记非紧急更新**
```jsx
import { useState, useTransition } from 'react'

function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()
  
  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value) // 紧急更新：立即更新输入框
    
    startTransiti
edQuery
  
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <SearchResults query={deferredQuery} />
      </div>
    </>
  )
}
```

**追问点**：
- Q: Suspense 和 Error Boundary 的关系？
  - A: Suspense 处理加载状态，Error Boundary 处理错误状态，通常一起使用
- Q: Server Components 与 Suspense？
  - A: Server Components 天然支持 Suspense，可以流式传输 HTML
- Q: useTransition 和 useDeferredValue 的区别？
  - A: useTransition 控制更新时机，useDeferredValue 延迟值的变化

---

### 7. 状态管理方案选择？

**难度**: ⭐⭐⭐⭐☆

**问题**：
React 应用有哪些状态管理方案？如何选择合适的方案？

**答案**：

**状态分类**：
1. **局部状态**: 组件内部使用，不需要共享
2. **共享状态**: 多个组件需要访问
3. **服务端状态**: 来自 API 的数据，需要缓存和同步

**方案对比**：

| 方案 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| useState | 局部状态 | 简单直接 | 不能跨组件共享 |
| Context + useReducer | 中小型应用 | 无需第三方库 | 性能问题、缺少 DevTools |
| Redux Toolkit | 大型应用 | 强大的 DevTools、中间件 | 学习曲线陡峭 |
| Zustand | 中型应用 | 简单、性能好 | 生态较小 |
| Jotai/Recoil | 原子化状态 | 细粒度更新 | 概念较新 |
| React Query/SWR | 服务端状态 | 自动缓存、重试 | 仅适用于异步数据 |

**代码示例**：

**1. Context + useReducer（中小型应用）**
```jsx
const TodoContext = createContext()

function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload]
    case 'TOGGLE':
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, done: !todo.done }
          : todo
      )
    default:
      return state
  }
}

function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, [])
  
  return (
    <TodoContext.Provider value={{ todos, dispatch }}>
      {children}
    </TodoContext.Provider>
  )
}

function useTodos() {
  const context = useContext(TodoContext)
  if (!context) throw new Error('useTodos must be used within TodoProvider')
  return context
}
```

**2. Zustand（推荐）**
```jsx
import { create } from 'zustand'

const useTodoStore = create((set) => ({
  todos: [],
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }]
  })),
  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  })),
}))

function TodoList() {
  const { todos, toggleTodo } = useTodoStore()
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
          {todo.text}
        </li>
      ))}
    </ul>
  )
}
```

**3. React Query（服务端状态）**
```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function TodoList() {
  const queryClient = useQueryClient()
  
  // 查询数据
  const { data: todos, isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })
  
  // 修改数据
  const addTodoMutation = useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      // 刷新数据
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
  
  if (isLoading) return <Loading />
  
  return (
    <>
      <button onClick={() => addTodoMutation.mutate({ text: 'New Todo' })}>
        Add Todo
      </button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </>
  )
}
```

**选择建议**：
- 局部状态 → useState/useReducer
- 轻量共享 → Context + useReducer
- 中大型应用 → Zustand 或 Redux Toolkit
- 服务端数据 → React Query 或 SWR

**追问点**：
- Q: 何时拆分 store？
  - A: 按功能模块拆分，避免单一全局 store 过大
- Q: 状态与缓存的区别？
  - A: 状态是应用的真实数据，缓存是服务端数据的本地副本
- Q: Redux Toolkit 相比 Redux 的改进？
  - A: 简化配置、内置 Immer、集成 Redux Thunk

---

### 8. SSR/SSG 的关键点？

**难度**: ⭐⭐⭐⭐⭐

**问题**：
什么是服务端渲染（SSR）和静态站点生成（SSG）？如何实现？

**答案**：

**概念对比**：

| 特性 | CSR | SSR | SSG |
|------|-----|-----|-----|
| 渲染时机 | 客户端 | 每次请求 | 构建时 |
| 首屏速度 | 慢 | 快 | 最快 |
| SEO | 差 | 好 | 最好 |
| 服务器负载 | 低 | 高 | 低 |
| 动态内容 | 支持 | 支持 | 不支持 |

**Next.js 实现**：

**1. SSG（静态生成）**
```jsx
// pages/posts/[id].js
export async function getStaticPaths() {
  // 生成所有可能的路径
  const posts = await fetchAllPosts()
  
  return {
    paths: posts.map(post => ({
      params: { id: post.id.toString() }
    })),
    fallback: false, // 404 for unknown paths
  }
}

export async function getStaticProps({ params }) {
  // 构建时获取数据
  const post = await fetchPost(params.id)
  
  return {
    props: { post },
    revalidate: 60, // ISR: 60秒后重新生成
  }
}

export default function Post({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

**2. SSR（服务端渲染）**
```jsx
// pages/user/[id].js
export async function getServerSideProps({ params }) {
  // 每次请求时获取数据
  const user = await fetchUser(params.id)
  
  return {
    props: { user },
  }
}

export default function UserProfile({ user }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

**3. Hydration（水合）**
```jsx
// 服务端渲染的 HTML
<div id="root">
  <h1>Hello, World!</h1>
</div>

// 客户端 hydrate
import { hydrateRoot } from 'react-dom/client'

hydrateRoot(
  document.getElementById('root'),
  <App />
)
```

**关键点**：
1. **避免使用浏览器 API**: 使用 `typeof window !== 'undefined'` 检查
2. **数据预取**: 在服务端获取数据，传递给组件
3. **Hydration 不匹配**: 确保服务端和客户端渲染结果一致
4. **性能优化**: 使用流式 SSR、选择性 Hydration

**代码示例**：
```jsx
// 避免 Hydration 不匹配
function Clock() {
  const [time, setTime] = useState(null)
  
  useEffect(() => {
    // 客户端才设置时间
    setTime(new Date().toLocaleTimeString())
  }, [])
  
  // 服务端和客户端首次渲染一致
  return <div>{time || 'Loading...'}</div>
}

// 检查浏览器环境
function BrowserOnly() {
  if (typeof window === 'undefined') {
    return null // 服务端不渲染
  }
  
  return <div>Client only content</div>
}
```

**追问点**：
- Q: ISR（增量静态再生）是什么？
  - A: 在 SSG 基础上，定期重新生成页面，兼顾性能和实时性
- Q: 边缘渲染（Edge Rendering）？
  - A: 在 CDN 边缘节点渲染，减少延迟
- Q: Streaming SSR 的优势？
  - A: 逐步发送 HTML，用户更快看到内容

---

## 高级题（加分）

### 9. React Fiber 架构？

**难度**: ⭐⭐⭐⭐⭐

**问题**：
什么是 React Fiber？它解决了什么问题？

**答案**：

**Fiber 是什么**：
- React 16 引入的新的协调引擎（Reconciliation Engine）
- 将渲染工作分解成小单元，可以暂停、恢复、优先级调度

**解决的问题**：
1. **长时间阻塞**: 旧版 React 的递归渲染无法中断，导致页面卡顿
2. **优先级调度**: 无法区分紧急更新和非紧急更新
3. **并发渲染**: 无法同时处理多个更新

**核心概念**：

**1. Fiber 节点**
```js
// 简化的 Fiber 节点结构
{
  type: 'div',           // 组件类型
  props: { ... },        // 属性
  stateNode: DOMNode,    // 对应的 DOM 节点
  child: Fiber,          // 第一个子节点
  sibling: Fiber,        // 下一个兄弟节点
  return: Fiber,         // 父节点
  alternate: Fiber,      // 上一次的 Fiber 节点
  effectTag: 'UPDATE',   // 副作用标记
}
```

**2. 双缓冲技术**
```
Current Tree (当前显示)    Work-in-Progress Tree (正在构建)
      ↓                              ↓
   Fiber A                        Fiber A'
      ↓                              ↓
   Fiber B                        Fiber B'
      ↓                              ↓
   Fiber C                        Fiber C'

完成后交换指针，Work-in-Progress 变成 Current
```

**3. 工作循环**
```js
function workLoop(deadline) {
  while (nextUnitOfWork && deadline.timeRemaining() > 1) {
    // 执行一个工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  
  if (nextUnitOfWork) {
    // 还有工作，继续调度
    requestIdleCallback(workLoop)
  } else {
    // 工作完成，提交更新
    commitRoot()
  }
}

requestIdleCallback(workLoop)
```

**4. 优先级调度**
```jsx
// 高优先级：用户输入
setQuery(value) // 立即执行

// 低优先级：搜索结果
startTransition(() => {
  setResults(search(value)) // 可以被打断
})
```

**Fiber 的优势**：
1. **可中断**: 渲染可以暂停，让出主线程给浏览器
2. **优先级**: 紧急更新优先处理
3. **并发**: 同时准备多个版本的 UI
4. **错误边界**: 更好的错误处理

**追问点**：
- Q: Fiber 如何实现时间切片？
  - A: 使用 requestIdleCallback（或 Scheduler）在浏览器空闲时执行
- Q: 什么是 Lane 模型？
  - A: React 18 的优先级模型，用二进制位表示不同优先级
- Q: Fiber 对开发者的影响？
  - A: 大部分透明，但需要注意 useEffect 的执行时机

---

### 10. 虚拟 DOM 与 Diff 算法？

**难度**: ⭐⭐⭐⭐⭐

**问题**：
什么是虚拟 DOM？React 的 Diff 算法如何工作？

**答案**：

**虚拟 DOM**：
- JavaScript 对象表示的 DOM 树
- 更新时先修改虚拟 DOM，然后计算差异，最后批量更新真实 DOM

**为什么需要虚拟 DOM**：
1. **性能优化**: 减少直接操作 DOM 的次数
2. **跨平台**: 可以渲染到不同平台（Web、Native、Canvas）
3. **声明式**: 开发者只需描述 UI 状态，React 负责更新

**Diff 算法的三个策略**：

**1. Tree Diff（树级别）**
- 只比较同层节点，不跨层比较
- 时间复杂度从 O(n³) 降到 O(n)

```jsx
// 不会跨层比较
<div>              <div>
  <A />              <B />
  <B />            </div>
</div>

// React 会删除 A，创建 B，而不是移动 A
```

**2. Component Diff（组件级别）**
- 同类型组件继续比较
- 不同类型组件直接替换

```jsx
// 类型相同：继续比较 props
<Counter count={1} /> → <Counter count={2} />

// 类型不同：卸载旧组件，挂载新组件
<Counter /> → <Timer />
```

**3. Element Diff（元素级别）**
- 使用 key 识别节点
- 支持插入、删除、移动操作

```jsx
// 没有 key：全部重新渲染
<ul>              <ul>
  <li>A</li>        <li>X</li>  // 更新 A → X
  <li>B</li>        <li>A</li>  // 更新 B → A
  <li>C</li>        <li>B</li>  // 更新 C → B
</ul>               <li>C</li>  // 插入 C
                  </ul>

// 有 key：只插入 X
<ul>              <ul>
  <li key="a">A</li>  <li key="x">X</li>  // 插入 X
  <li key="b">B</li>  <li key="a">A</li>  // 保持 A
  <li key="c">C</li>  <li key="b">B</li>  // 保持 B
</ul>               <li key="c">C</li>  // 保持 C
                  </ul>
```

**Diff 算法流程**：
```js
function diff(oldVNode, newVNode) {
  // 1. 类型不同：替换
  if (oldVNode.type !== newVNode.type) {
    return { type: 'REPLACE', newVNode }
  }
  
  // 2. 文本节点：更新文本
  if (typeof newVNode === 'string') {
    if (oldVNode !== newVNode) {
      return { type: 'TEXT', text: newVNode }
    }
    return null
  }
  
  // 3. 元素节点：比较 props 和 children
  const propsDiff = diffProps(oldVNode.props, newVNode.props)
  const childrenDiff = diffChildren(oldVNode.children, newVNode.children)
  
  return { type: 'UPDATE', propsDiff, childrenDiff }
}
```

**优化建议**：
1. 使用唯一稳定的 key
2. 避免在渲染函数中创建新组件
3. 使用 React.memo 减少不必要的比较

**追问点**：
- Q: 为什么不跨层比较？
  - A: 跨层移动很少见，牺牲这种场景换取性能
- Q: key 的比较算法？
  - A: 使用 Map 存储旧节点的 key，O(1) 查找
- Q: React 18 的 Diff 改进？
  - A: 支持并发渲染，可以中断和恢复 Diff 过程

---


## 场景题（实战）

### 11. useEffect 依赖错误导致死循环，如何排查？

**难度**: ⭐⭐⭐☆☆

**问题**：
useEffect 导致无限循环的常见原因有哪些？如何排查和解决？

**答案**：

**常见原因**：

**1. 依赖数组中的对象/数组每次都是新引用**
```jsx
// ❌ 错误：options 每次渲染都是新对象
function ChatRoom({ roomId }) {
  const options = {
    serverUrl: 'https://localhost:1234',
    roomId: roomId
  }
  
  useEffect(() => {
    const connection = createConnection(options)
    connection.connect()
    return () => connection.disconnect()
  }, [options]) // options 每次都不同，导致无限循环
}

// ✅ 解决方案 1：使用 useMemo
function ChatRoom({ roomId }) {
  const options = useMemo(() => ({
    serverUrl: 'https://localhost:1234',
    roomId: roomId
  }), [roomId])
  
  useEffect(() => {
    const connection = createConnection(options)
    connection.connect()
    return () => connection.disconnect()
  }, [options])
}

// ✅ 解决方案 2：直接在 effect 中创建
function ChatRoom({ roomId }) {
  useEffect(() => {
    const options = {
      serverUrl: 'https://localhost:1234',
      roomId: roomId
    }
    const connection = createConnection(options)
    connection.connect()
    return () => connection.disconnect()
  }, [roomId]) // 只依赖 roomId
}
```

**2. 在 effect 中更新依赖的状态**
```jsx
// ❌ 错误：count 变化 → effect 执行 → 更新 count → 无限循环
function Counter() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    setCount(count + 1) // 每次都更新 count
  }, [count])
}

// ✅ 解决方案：添加条件判断
function Counter() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (count < 10) {
      setCount(count + 1)
    }
  }, [count])
}
```

**3. 依赖遗漏**
```jsx
// ❌ 错误：使用了 count 但未添加到依赖
function Counter() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count) // 闭包陷阱：count 永远是 0
    }, 1000)
    return () => clearInterval(timer)
  }, []) // 缺少 count 依赖
}

// ✅ 解决方案：添加依赖或使用函数式更新
function Counter() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1) // 函数式更新，不依赖 count
    }, 1000)
    return () => clearInterval(timer)
  }, [])
}
```

**排查工具**：
1. **ESLint 插件**: `eslint-plugin-react-hooks` 自动检测依赖问题
2. **React DevTools**: 查看组件渲染次数
3. **console.log**: 在 effect 中打印日志，追踪执行次数

**最佳实践**：
- 使用 ESLint 规则 `react-hooks/exhaustive-deps`
- 对象/数组依赖使用 useMemo
- 函数依赖使用 useCallback
- 优先使用函数式更新

**追问点**：
- Q: useEffect 和 useLayoutEffect 的执行时机？
  - A: useEffect 在浏览器绘制后异步执行，useLayoutEffect 在 DOM 更新后同步执行
- Q: 如何调试闭包陷阱？
  - A: 使用 React DevTools 查看 Hook 的值，或在 effect 中打印依赖
- Q: 自定义 Hook 如何暴露依赖？
  - A: 返回稳定的引用（useMemo/useCallback），或让调用者传入依赖

---

### 12. 列表拖拽后组件状态错位？

**难度**: ⭐⭐⭐☆☆

**问题**：
拖拽排序后，列表项的状态（如输入框的值）错位了，如何解决？

**答案**：

**问题原因**：
- 使用数组索引作为 key
- 拖拽后索引改变，React 复用了错误的组件实例

**错误示例**：
```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { text: 'Learn React', done: false },
    { text: 'Build App', done: false },
  ])
  
  const moveTodo = (from, to) => {
    const newTodos = [...todos]
    const [moved] = newTodos.splice(from, 1)
    newTodos.splice(to, 0, moved)
    setTodos(newTodos)
  }
  
  return (
    <ul>
      {todos.map((todo, index) => (
        // ❌ 错误：使用索引作为 key
        <TodoItem key={index} todo={todo} />
      ))}
    </ul>
  )
}

function TodoItem({ todo }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(todo.
oved] = newTodos.splice(from, 1)
    newTodos.splice(to, 0, moved)
    setTodos(newTodos)
  }
  
  return (
    <ul>
      {todos.map(todo => (
        // ✅ 正确：使用唯一 ID
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}
```

**受控组件方案**：
```jsx
// 使用受控组件，状态由父组件管理
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', editing: false },
    { id: 2, text: 'Build App', editing: false },
  ])
  
  const updateTodo = (id, updates) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    ))
  }
  
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={updates => updateTodo(todo.id, updates)}
        />
      ))}
    </ul>
  )
}

function TodoItem({ todo, onUpdate }) {
  return (
    <li>
      {todo.editing ? (
        <input
          value={todo.text}
          onChange={e => onUpdate({ text: e.target.value })}
        />
      ) : (
        <span onClick={() => onUpdate({ editing: true })}>
          {todo.text}
        </span>
      )}
    </li>
  )
}
```

**虚拟列表场景**：
```jsx
import { FixedSizeList } from 'react-window'

function VirtualTodoList({ todos }) {
  const Row = ({ index, style }) => {
    const todo = todos[index]
    
    // 虚拟列表必须使用稳定的 key
    return (
      <div style={style} key={todo.id}>
        <TodoItem todo={todo} />
      </div>
    )
  }
  
  return (
    <FixedSizeList
      height={600}
      itemCount={todos.length}
      itemSize={50}
      itemKey={index => todos[index].id} // 指定 key 生成函数
    >
      {Row}
    </FixedSizeList>
  )
}
```

**追问点**：
- Q: 什么时候需要重置组件状态？
  - A: key 改变时，React 会卸载旧组件，挂载新组件，状态自动重置
- Q: 动画过渡期间如何保持状态？
  - A: 使用 CSS 动画而不是改变 DOM 结构，或使用动画库（Framer Motion）
- Q: 如何生成唯一 ID？
  - A: 使用 UUID 库、nanoid，或服务端返回的 ID

---

### 13. 大列表性能优化？

**难度**: ⭐⭐⭐⭐☆

**问题**：
渲染 10000+ 条数据的列表，如何优化性能？

**答案**：

**优化方案**：

**1. 虚拟列表（推荐）**
```jsx
import { FixedSizeList } from 'react-window'

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style} className="row">
      {items[index].name}
    </div>
  )
  
  return (
    <FixedSizeList
      height={600}        // 可视区域高度
      itemCount={items.length}  // 总数据量
      itemSize={50}       // 每项高度
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}

// 动态高度
import { VariableSizeList } from 'react-window'

function DynamicList({ items }) {
  const getItemSize = (index) => {
    // 根据内容计算高度
    return items[index].content.length > 100 ? 100 : 50
  }
  
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].content}
    </div>
  )
  
  return (
    <VariableSizeList
      height={600}
      itemCount={items.length}
      itemSize={getItemSize}
      width="100%"
    >
      {Row}
    </VariableSizeList>
  )
}
```

**2. 分页加载**
```jsx
function PaginatedList({ items }) {
  const [page, setPage] = useState(1)
  const pageSize = 50
  
  const paginatedItems = items.slice(
    (page - 1) * pageSize,
    page * pageSize
  )
  
  return (
    <>
      <ul>
        {paginatedItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(page + 1)}>
        Next
      </button>
    </>
  )
}
```

**3. 无限滚动**
```jsx
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'

function InfiniteList() {
  const { ref, inView } = useInView()
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['items'],
    queryFn: ({ pageParam = 0 }) => fetchItems(pageParam),
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  })
  
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])
  
  return (
    <div>
      {data?.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.items.map(item => (
            <div key={item.id}>{item.name}</div>
          ))}
        </React.Fragment>
      ))}
      <div ref={ref}>
        {isFetchingNextPage && <Loading />}
      </div>
    </div>
  )
}
```

**4. 优化列表项**
```jsx
// 使用 memo 避免不必要的重新渲染
const ListItem = memo(function ListItem({ item, onDelete }) {
  console.log('ListItem rendered:', item.id)
  
  return (
    <div>
      <span>{item.name}</span>
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  )
})

function List({ items }) {
  const [deletedIds, setDeletedIds] = useState(new Set())
  
  // 使用 useCallback 保持函数引用稳定
  const handleDelete = useCallback((id) => {
    setDeletedIds(prev => new Set([...prev, id]))
  }, [])
  
  const visibleItems = items.filter(item => !deletedIds.has(item.id))
  
  return (
    <div>
      {visibleItems.map(item => (
        <ListItem key={item.id} item={item} onDelete={handleDelete} />
      ))}
    </div>
  )
}
```

**5. Web Worker 处理数据**
```jsx
// worker.js
self.addEventListener('message', (e) => {
  const { items, filter } = e.data
  const filtered = items.filter(item => item.name.includes(filter))
  self.postMessage(filtered)
})

// Component
function FilteredList({ items }) {
  const [filter, setFilter] = useState('')
  const [filtered, setFiltered] = useState(items)
  const workerRef = useRef()
  
  useEffect(() => {
    workerRef.current = new Worker('worker.js')
    workerRef.current.onmessage = (e) => {
      setFiltered(e.data)
    }
    return () => workerRef.current.terminate()
  }, [])
  
  useEffect(() => {
    workerRef.current.postMessage({ items, filter })
  }, [items, filter])
  
  return (
    <>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      <ul>
        {filtered.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </>
  )
}
```

**性能对比**：

| 方案 | 10000 条数据 | 优点 | 缺点 |
|------|-------------|------|------|
| 全部渲染 | 卡顿严重 | 简单 | 性能差 |
| 虚拟列表 | 流畅 | 性能最好 | 需要固定高度 |
| 分页 | 流畅 | 简单 | 用户体验一般 |
| 无限滚动 | 流畅 | 用户体验好 | 实现复杂 |

**追问点**：
- Q: 虚拟列表的原理？
  - A: 只渲染可视区域的元素，通过滚动位置计算应该显示哪些元素
- Q: 如何处理动态高度？
  - A: 使用 VariableSizeList，或先渲染测量高度再缓存
- Q: 虚拟列表的局限性？
  - A: 不支持复杂布局（Grid、Masonry），需要固定或可预测的高度

---

## 反问环节

### 1. 团队的技术栈和开发规范？

**问题**：
- 使用的 React 版本？是否计划升级到 React 19？
- 状态管理方案？Redux Toolkit、Zustand 还是其他？
- 数据请求方案？React Query、SWR 还是自己封装？
- 是否使用 TypeScript？代码规范如何？

**为什么问**：
- 了解技术栈，评估学习成本
- 了解团队规范，快速融入

---

### 2. 项目架构和代码质量？

**问题**：
- 项目规模？代码行数？组件数量？
- 是否有组件库？Storybook？设计系统？
- 测试覆盖率？使用什么测试框架？
- CI/CD 流程？代码审查机制？

**为什么问**：
- 评估项目复杂度
- 了解代码质量要求

---

### 3. 性能优化和监控？

**问题**：
- 是否有性能监控？使用什么工具？
- 首屏加载时间要求？
- 是否使用 SSR/SSG？
- 如何处理大数据量渲染？

**为什么问**：
- 了解性能要求
- 评估技术挑战

---

### 4. 团队协作和成长？

**问题**：
- 团队规模？前端团队多少人？
- 技术分享机制？
- 是否有导师制度？
- 技术选型的决策流程？

**为什么问**：
- 了解团队氛围
- 评估成长空间

---

## 📚 学习资源

### 官方文档
- [React 官方文档](https://react.dev/) - 最新的官方文档
- [React 面试题](https://react.dev/learn) - 官方学习指南
- [React Hooks 参考](https://react.dev/reference/react) - 完整的 Hooks API

### 推荐阅读
- [React 技术揭秘](https://react.iamkasong.com/) - 深入理解 React 原理
- [React 设计模式](https://www.patterns.dev/posts/react-patterns) - 常用设计模式
- [React 性能优化](https://kentcdodds.com/blog/usememo-and-usecallback) - Kent C. Dodds 的博客

### 实战项目
- [Real World React](https://github.com/gothinkster/react-redux-realworld-example-app) - 真实项目示例
- [React 面试题集](https://github.com/sudheerj/reactjs-interview-questions) - GitHub 面试题库

---

**内容来源**: 基于 [React 官方文档](https://react.dev/) 和最新面试经验整理，使用 Context7 MCP 验证最新特性（2025-02）
