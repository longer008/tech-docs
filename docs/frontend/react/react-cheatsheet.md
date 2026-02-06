# React 速查表

> React 18/19 常用语法与 API 快速参考

**更新时间**: 2025-02

## 📋 目录

- [JSX 语法](#jsx-语法)
- [Hooks API](#hooks-api)
- [组件模式](#组件模式)
- [状态管理](#状态管理)
- [事件处理](#事件处理)
- [表单处理](#表单处理)
- [性能优化](#性能优化)
- [TypeScript 类型](#typescript-类型)
- [常用工具函数](#常用工具函数)

---

## JSX 语法

### 基础语法

```jsx
// 基础 JSX
const element = <h1>Hello, world!</h1>

// 表达式插值
const name = 'Josh'
const element = <h1>Hello, {name}!</h1>

// 多行 JSX（需要括号）
const element = (
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
)

// 属性
<img src={user.avatarUrl} alt="Avatar" />
<button className="btn" onClick={handleClick}>Click</button>

// 展开属性
const props = { id: 'btn', className: 'primary' }
<button {...props}>Click</button>

// 子元素
<div>
  <h1>Title</h1>
  <p>Content</p>
</div>

// 注释
{/* 这是注释 */}
<div>
  {/* 
    多行注释
    可以这样写
  */}
</div>
```

### 条件渲染

```jsx
// 逻辑与（&&）
{isLoggedIn && <UserGreeting />}
{items.length > 0 && <ItemList items={items} />}

// 三元运算符
{isLoggedIn ? <UserGreeting /> : <GuestGreeting />}

// 多条件
{status === 'loading' ? (
  <Loading />
) : status === 'error' ? (
  <Error />
) : (
  <Content />
)}

// 立即执行函数
{(() => {
  if (status === 'loading') return <Loading />
  if (status === 'error') return <Error />
  return <Content />
})()}

// 提前返回（推荐）
function Component() {
  if (isLoading) return <Loading />
  if (error) return <Error />
  return <Content />
}
```

### 列表渲染

```jsx
// 基础列表
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}

// 带索引
{items.map((item, index) => (
  <li key={item.id}>
    {index + 1}. {item.name}
  </li>
))}

// 过滤 + 映射
{items
  .filter(item => item.active)
  .map(item => (
    <li key={item.id}>{item.name}</li>
  ))}

// 嵌套列表
{categories.map(category => (
  <div key={category.id}>
    <h2>{category.name}</h2>
    <ul>
      {category.items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  </div>
))}
```

### Fragment

```jsx
// 短语法
<>
  <ChildA />
  <ChildB />
</>

// 完整语法（需要 key 时）
<React.Fragment key={id}>
  <ChildA />
  <ChildB />
</React.Fragment>

// 列表中使用
{items.map(item => (
  <React.Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.description}</dd>
  </React.Fragment>
))}
```

---

## Hooks API

### useState - 状态管理

```jsx
import { useState } from 'react'

// 基础用法
const [count, setCount] = useState(0)
const [name, setName] = useState('John')
const [isOpen, setIsOpen] = useState(false)

// 更新状态
setCount(1)                      // 直接设置
setCount(prev => prev + 1)       // 函数式更新（推荐）

// 惰性初始化（避免重复计算）
const [state, setState] = useState(() => {
  const initialState = expensiveComputation()
  return initialState
})

// 对象状态
const [form, setForm] = useState({ name: '', email: '' })
setForm(prev => ({ ...prev, name: 'John' }))  // 部分更新

// 数组状态
const [items, setItems] = useState([])
setItems(prev => [...prev, newItem])           // 添加
setItems(prev => prev.filter(item => item.id !== id))  // 删除
setItems(prev => prev.map(item => 
  item.id === id ? { ...item, done: true } : item
))  // 更新

// 多个状态
const [firstName, setFirstName] = useState('')
const [lastName, setLastName] = useState('')
const [age, setAge] = useState(0)
```

### useEffect - 副作用处理

```jsx
import { useEffect } from 'react'

// 每次渲染后执行
useEffect(() => {
  console.log('每次渲染后执行')
})

// 仅挂载时执行（componentDidMount）
useEffect(() => {
  console.log('组件挂载')
}, [])

// 依赖变化时执行（componentDidUpdate）
useEffect(() => {
  console.log('count 变化:', count)
}, [count])

// 多个依赖
useEffect(() => {
  console.log('count 或 name 变化')
}, [count, name])

// 清理函数（componentWillUnmount）
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Tick')
  }, 1000)
  
  return () => {
    clearInterval(timer)  // 清理定时器
  }
}, [])

// 数据获取
useEffect(() => {
  let cancelled = false
  
  async function fetchData() {
    try {
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()
      
      if (!cancelled) {
        setUser(data)
      }
    } catch (error) {
      if (!cancelled) {
        setError(error)
      }
    }
  }
  
  fetchData()
  
  return () => {
    cancelled = true  // 防止内存泄漏
  }
}, [userId])

// 订阅
useEffect(() => {
  const subscription = props.source.subscribe()
  
  return () => {
    subscription.unsubscribe()
  }
}, [props.source])
```

### useContext - 上下文

```jsx
import { createContext, useContext, useState } from 'react'

// 1. 创建 Context
const ThemeContext = createContext('light')

// 2. 提供 Context
function App() {
  const [theme, setTheme] = useState('dark')
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Toolbar />
    </ThemeContext.Provider>
  )
}

// 3. 消费 Context
function Toolbar() {
  const { theme, setTheme } = useContext(ThemeContext)
  
  return (
    <div className={theme}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  )
}

// 自定义 Hook 封装
function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

### useReducer - 复杂状态管理

```jsx
import { useReducer } from 'react'

// 1. 定义 reducer
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    case 'reset':
      return { count: 0 }
    case 'set':
      return { count: action.payload }
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

// 2. 使用 useReducer
function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 })
  
  return (
    <>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
      <button onClick={() => dispatch({ type: 'set', payload: 10 })}>
        Set to 10
      </button>
    </>
  )
}

// 惰性初始化
function init(initialCount) {
  return { count: initialCount }
}

const [state, dispatch] = useReducer(reducer, 0, init)

// 复杂状态示例
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, { id: Date.now(), text: action.text, done: false }]
    case 'TOGGLE':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo
      )
    case 'DELETE':
      return state.filter(todo => todo.id !== action.id)
    default:
      return state
  }
}
```

### useMemo - 缓存计算结果

```jsx
import { useMemo } from 'react'

// 基础用法
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b)
}, [a, b])

// 过滤列表
const filteredItems = useMemo(() => {
  return items.filter(item => item.category === filter)
}, [items, filter])

// 排序
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}, [items])

// 复杂计算
const statistics = useMemo(() => {
  return {
    total: items.length,
    completed: items.filter(item => item.done).length,
    pending: items.filter(item => !item.done).length,
  }
}, [items])

// 缓存对象（避免 useEffect 依赖问题）
const options = useMemo(() => ({
  serverUrl: 'https://localhost:1234',
  roomId: roomId
}), [roomId])

useEffect(() => {
  const connection = createConnection(options)
  connection.connect()
  return () => connection.disconnect()
}, [options])
```

### useCallback - 缓存函数

```jsx
import { useCallback } from 'react'

// 基础用法
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])

// 带参数
const handleDelete = useCallback((id) => {
  setItems(items => items.filter(item => item.id !== id))
}, [])

// 依赖外部变量
const handleSubmit = useCallback(() => {
  api.submit(formData)
}, [formData])

// 配合 memo 使用
const MemoizedChild = memo(function Child({ onClick }) {
  console.log('Child rendered')
  return <button onClick={onClick}>Click</button>
})

function Parent() {
  const [count, setCount] = useState(0)
  
  // 没有 useCallback：每次渲染都创建新函数，Child 会重新渲染
  // const handleClick = () => console.log('clicked')
  
  // 使用 useCallback：函数引用保持不变，Child 不会重新渲染
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])
  
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <MemoizedChild onClick={handleClick} />
    </>
  )
}
```

### useRef - 引用 DOM 或保存可变值

```jsx
import { useRef, useEffect } from 'react'

// 引用 DOM 元素
function TextInput() {
  const inputRef = useRef(null)
  
  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  
  return <input ref={inputRef} />
}

// 保存可变值（不触发重新渲染）
function Timer() {
  const intervalRef = useRef(null)
  const [count, setCount] = useState(0)
  
  const start = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
  }
  
  const stop = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }
  
  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  )
}

// 保存前一个值
function usePrevious(value) {
  const ref = useRef()
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref.current
}

// 使用
function Counter() {
  const [count, setCount] = useState(0)
  const prevCount = usePrevious(count)
  
  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

### useImperativeHandle - 自定义 ref 暴露的值

```jsx
import { forwardRef, useImperativeHandle, useRef } from 'react'

// React 19 之前
const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef()
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => inputRef.current.value = '',
    getValue: () => inputRef.current.value,
  }))
  
  return <input ref={inputRef} {...props} />
})

// React 19（推荐）
function FancyInput({ ref, ...props }) {
  const inputRef = useRef()
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => inputRef.current.value = '',
    getValue: () => inputRef.current.value,
  }))
  
  return <input ref={inputRef} {...props} />
}

// 使用
function Parent() {
  const inputRef = useRef()
  
  return (
    <>
      <FancyInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
      <button onClick={() => inputRef.current.clear()}>Clear</button>
      <button onClick={() => alert(inputRef.current.getValue())}>
        Get Value
      </button>
    </>
  )
}
```

### React 18/19 新 Hooks

```jsx
import {
  useId,
  useTransition,
  useDeferredValue,
  useSyncExternalStore,
} from 'react'

// useId - 生成唯一 ID（SSR 安全）
function Form() {
  const nameId = useId()
  const emailId = useId()
  
  return (
    <>
      <label htmlFor={nameId}>Name:</label>
      <input id={nameId} />
      
      <label htmlFor={emailId}>Email:</label>
      <input id={emailId} />
    </>
  )
}

// useTransition - 标记非紧急更新
function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()
  
  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)  // 紧急更新：立即更新输入框
    
    startTransition(() => {
      // 非紧急更新：可以被打断
      setResults(search(value))
    })
  }
  
  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <SearchResults results={results} />
    </>
  )
}

// useDeferredValue - 延迟值更新
function SearchPage() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const isStale = query !== deferredQuery
  
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <SearchResults query={deferredQuery} />
      </div>
    </>
  )
}

// useSyncExternalStore - 订阅外部 store
function useOnlineStatus() {
  const isOnline = useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback)
      window.addEventListener('offline', callback)
      return () => {
        window.removeEventListener('online', callback)
        window.removeEventListener('offline', callback)
      }
    },
    () => navigator.onLine,
    () => true  // 服务端默认值
  )
  
  return isOnline
}
```

---


## 组件模式

### 函数组件

```jsx
// 基础函数组件
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>
}

// 带默认值
function Welcome({ name = 'Guest', age = 18 }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Age: {age}</p>
    </div>
  )
}

// 解构 props
function UserCard({ user: { name, email, avatar } }) {
  return (
    <div>
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  )
}

// children prop
function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  )
}

// 使用
<Card title="My Card">
  <p>Card content</p>
</Card>
```

### 高阶组件 (HOC)

```jsx
// 基础 HOC
function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <Loading />
    }
    return <WrappedComponent {...props} />
  }
}

// 使用
const UserListWithLoading = withLoading(UserList)
<UserListWithLoading isLoading={isLoading} users={users} />

// 带参数的 HOC
function withAuth(requiredRole) {
  return function (WrappedComponent) {
    return function AuthenticatedComponent(props) {
      const { user } = useAuth()
      
      if (!user) {
        return <Navigate to="/login" />
      }
      
      if (requiredRole && user.role !== requiredRole) {
        return <div>Access Denied</div>
      }
      
      return <WrappedComponent {...props} />
    }
  }
}

// 使用
const AdminDashboard = withAuth('admin')(Dashboard)

// 组合多个 HOC
const EnhancedComponent = withAuth('user')(
  withLoading(
    withErrorBoundary(MyComponent)
  )
)
```

### Render Props

```jsx
// 基础 Render Props
function Mouse({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  return render(position)
}

// 使用
<Mouse render={({ x, y }) => (
  <p>Mouse position: {x}, {y}</p>
)} />

// children 作为函数
function DataProvider({ url, children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [url])
  
  return children({ data, loading })
}

// 使用
<DataProvider url="/api/users">
  {({ data, loading }) => (
    loading ? <Loading /> : <UserList users={data} />
  )}
</DataProvider>
```

### Compound Components（复合组件）

```jsx
// 创建 Context
const TabsContext = createContext()

// 主组件
function Tabs({ children, defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex)
  
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

// 子组件
Tabs.List = function TabsList({ children }) {
  return <div className="tabs-list">{children}</div>
}

Tabs.Tab = function Tab({ index, children }) {
  const { activeIndex, setActiveIndex } = useContext(TabsContext)
  const isActive = activeIndex === index
  
  return (
    <button
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  )
}

Tabs.Panels = function TabsPanels({ children }) {
  return <div className="tabs-panels">{children}</div>
}

Tabs.Panel = function TabPanel({ index, children }) {
  const { activeIndex } = useContext(TabsContext)
  
  if (activeIndex !== index) return null
  
  return <div className="tab-panel">{children}</div>
}

// 使用
<Tabs defaultIndex={0}>
  <Tabs.List>
    <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
    <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
    <Tabs.Tab index={2}>Tab 3</Tabs.Tab>
  </Tabs.List>
  
  <Tabs.Panels>
    <Tabs.Panel index={0}>Panel 1 Content</Tabs.Panel>
    <Tabs.Panel index={1}>Panel 2 Content</Tabs.Panel>
    <Tabs.Panel index={2}>Panel 3 Content</Tabs.Panel>
  </Tabs.Panels>
</Tabs>
```

---

## 状态管理

### Context + useReducer

```jsx
// 1. 创建 Context
const TodoContext = createContext()

// 2. Reducer
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, { id: Date.now(), text: action.text, done: false }]
    case 'TOGGLE':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo
      )
    case 'DELETE':
      return state.filter(todo => todo.id !== action.id)
    default:
      return state
  }
}

// 3. Provider
function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, [])
  
  return (
    <TodoContext.Provider value={{ todos, dispatch }}>
      {children}
    </TodoContext.Provider>
  )
}

// 4. 自定义 Hook
function useTodos() {
  const context = useContext(TodoContext)
  if (!context) {
    throw new Error('useTodos must be used within TodoProvider')
  }
  return context
}

// 5. 使用
function TodoList() {
  const { todos, dispatch } = useTodos()
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => dispatch({ type: 'TOGGLE', id: todo.id })}
          />
          {todo.text}
          <button onClick={() => dispatch({ type: 'DELETE', id: todo.id })}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
```

### Zustand（推荐）

```jsx
import { create } from 'zustand'

// 创建 store
const useStore = create((set) => ({
  // 状态
  count: 0,
  user: null,
  todos: [],
  
  // 同步 actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  
  // 异步 actions
  fetchUser: async (id) => {
    const user = await api.getUser(id)
    set({ user })
  },
  
  // 复杂更新
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }]
  })),
  
  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  })),
}))

// 使用
function Counter() {
  const count = useStore((state) => state.count)
  const increment = useStore((state) => state.increment)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
    </div>
  )
}

// 选择多个状态
function TodoList() {
  const { todos, addTodo, toggleTodo } = useStore((state) => ({
    todos: state.todos,
    addTodo: state.addTodo,
    toggleTodo: state.toggleTodo,
  }))
  
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

### Redux Toolkit

```jsx
import { createSlice, configureStore } from '@reduxjs/toolkit'
import { Provider, useSelector, useDispatch } from 'react-redux'

// 1. 创建 slice
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1  // Immer 允许直接修改
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },
  },
})

// 2. 导出 actions
export const { increment, decrement, incrementByAmount } = counterSlice.actions

// 3. 创建 store
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
})

// 4. 提供 store
<Provider store={store}>
  <App />
</Provider>

// 5. 使用
function Counter() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div>
  )
}
```

---

## 事件处理

### 常用事件

```jsx
function EventExamples() {
  // 点击事件
  const handleClick = (e) => {
    console.log('clicked', e.target)
  }
  
  // 双击事件
  const handleDoubleClick = (e) => {
    console.log('double clicked')
  }
  
  // 表单提交
  const handleSubmit = (e) => {
    e.preventDefault()  // 阻止默认行为
    console.log('submitted')
  }
  
  // 输入变化
  const handleChange = (e) => {
    console.log('value:', e.target.value)
  }
  
  // 键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed')
    }
    if (e.key === 'Escape') {
      console.log('Escape pressed')
    }
  }
  
  // 焦点事件
  const handleFocus = (e) => {
    console.log('focused')
  }
  
  const handleBlur = (e) => {
    console.log('blurred')
  }
  
  // 鼠标事件
  const handleMouseEnter = (e) => {
    console.log('mouse enter')
  }
  
  const handleMouseLeave = (e) => {
    console.log('mouse leave')
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <button
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Submit
      </button>
    </form>
  )
}
```

### 事件传参

```jsx
// 方式 1：箭头函数
<button onClick={() => handleClick(id)}>Delete</button>

// 方式 2：bind
<button onClick={handleClick.bind(null, id)}>Delete</button>

// 方式 3：data 属性
<button data-id={id} onClick={handleClick}>Delete</button>

function handleClick(e) {
  const id = e.target.dataset.id
  console.log('Delete:', id)
}

// 方式 4：闭包
function createHandler(id) {
  return () => {
    console.log('Delete:', id)
  }
}

<button onClick={createHandler(id)}>Delete</button>
```

### 阻止默认行为和冒泡

```jsx
function EventPrevention() {
  const handleClick = (e) => {
    e.preventDefault()     // 阻止默认行为
    e.stopPropagation()    // 阻止冒泡
    console.log('clicked')
  }
  
  return (
    <div onClick={() => console.log('div clicked')}>
      <a href="https://example.com" onClick={handleClick}>
        Click me
      </a>
    </div>
  )
}
```

---

## 表单处理

### 受控组件

```jsx
// 单个输入框
function ControlledInput() {
  const [value, setValue] = useState('')
  
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

// 多个输入框
function ControlledForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: 0,
    gender: 'male',
    agree: false,
  })
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(formData)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />
      
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      
      <input
        name="age"
        type="number"
        value={formData.age}
        onChange={handleChange}
      />
      
      <select name="gender" value={formData.gender} onChange={handleChange}>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      
      <label>
        <input
          name="agree"
          type="checkbox"
          checked={formData.agree}
          onChange={handleChange}
        />
        I agree
      </label>
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

### 非受控组件

```jsx
function UncontrolledForm() {
  const nameRef = useRef()
  const emailRef = useRef()
  const fileRef = useRef()
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    console.log({
      name: nameRef.current.value,
      email: emailRef.current.value,
      file: fileRef.current.files[0],
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} defaultValue="John" />
      <input ref={emailRef} type="email" />
      <input ref={fileRef} type="file" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### 表单验证

```jsx
function ValidatedForm() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  
  const validate = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    return newErrors
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = validate()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    console.log('Form is valid:', formData)
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // 清除错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

---

## 性能优化

### React.memo

```jsx
// 基础用法
const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  console.log('ExpensiveComponent rendered')
  return <div>{data}</div>
})

// 自定义比较函数
const MemoizedComponent = memo(
  function Component({ user }) {
    return <div>{user.name}</div>
  },
  (prevProps, nextProps) => {
    // 返回 true 表示不重新渲染
    return prevProps.user.id === nextProps.user.id
  }
)
```

### 代码分割

```jsx
import { lazy, Suspense } from 'react'

// 懒加载组件
const Dashboard = lazy(() => import('./Dashboard'))
const Settings = lazy(() => import('./Settings'))

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

// 预加载
const Dashboard = lazy(() => import(/* webpackPrefetch: true */ './Dashboard'))
```

### 虚拟列表

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

### 防抖和节流

```jsx
import { useState, useCallback, useEffect, useRef } from 'react'

// 防抖 Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [value, delay])
  
  return debouncedValue
}

// 使用
function SearchInput() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 500)
  
  useEffect(() => {
    if (debouncedQuery) {
      api.search(debouncedQuery)
    }
  }, [debouncedQuery])
  
  return <input value={query} onChange={e => setQuery(e.target.value)} />
}

// 节流 Hook
function useThrottle(value, delay) {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastRan = useRef(Date.now())
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, delay - (Date.now() - lastRan.current))
    
    return () => clearTimeout(timer)
  }, [value, delay])
  
  return throttledValue
}
```

---


## TypeScript 类型

### 组件 Props 类型

```typescript
// 基础 Props
interface ButtonProps {
  text: string
  onClick: () => void
}

// 可选属性
interface ButtonProps {
  text: string
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

// children
interface CardProps {
  title: string
  children: React.ReactNode
}

// 函数 Props
interface FormProps {
  onSubmit: (data: FormData) => void
  onChange?: (field: string, value: string) => void
}

// 泛型 Props
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

// 扩展 HTML 属性
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

// 使用
function Button({ variant = 'primary', ...props }: ButtonProps) {
  return <button className={variant} {...props} />
}
```

### 事件类型

```typescript
// 鼠标事件
type MouseHandler = React.MouseEventHandler<HTMLButtonElement>
const handleClick: MouseHandler = (e) => {
  console.log(e.clientX, e.clientY)
}

// 表单事件
type ChangeHandler = React.ChangeEventHandler<HTMLInputElement>
const handleChange: ChangeHandler = (e) => {
  console.log(e.target.value)
}

type SubmitHandler = React.FormEventHandler<HTMLFormElement>
const handleSubmit: SubmitHandler = (e) => {
  e.preventDefault()
}

// 键盘事件
type KeyHandler = React.KeyboardEventHandler<HTMLInputElement>
const handleKeyDown: KeyHandler = (e) => {
  if (e.key === 'Enter') {
    console.log('Enter pressed')
  }
}
users, setUsers] = useState<User[]>([])

// 联合类型
type Status = 'idle' | 'loading' | 'success' | 'error'
const [status, setStatus] = useState<Status>('idle')
```

### Ref 类型

```typescript
// DOM 元素 Ref
const inputRef = useRef<HTMLInputElement>(null)
const divRef = useRef<HTMLDivElement>(null)
const buttonRef = useRef<HTMLButtonElement>(null)

// 可变值 Ref
const countRef = useRef<number>(0)
const timerRef = useRef<NodeJS.Timeout | null>(null)

// 组件实例 Ref
const childRef = useRef<React.ElementRef<typeof ChildComponent>>(null)

// 使用
useEffect(() => {
  inputRef.current?.focus()
  if (timerRef.current) {
    clearInterval(timerRef.current)
  }
}, [])
```

### Context 类型

```typescript
// 定义 Context 类型
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

// 创建 Context
const ThemeContext = createContext<ThemeContextType | null>(null)

// Provider
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 自定义 Hook
function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

### 函数组件类型

```typescript
// 基础函数组件
const Component: React.FC = () => {
  return <div>Hello</div>
}

// 带 Props
const Component: React.FC<Props> = ({ name }) => {
  return <div>Hello, {name}</div>
}

// 推荐：直接定义函数
function Component({ name }: Props) {
  return <div>Hello, {name}</div>
}

// 泛型组件
function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}
```

---

## 常用工具函数

### 自定义 Hooks

```jsx
// useLocalStorage - 持久化状态
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })
  
  const setStoredValue = (value) => {
    try {
      setValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }
  
  return [value, setStoredValue]
}

// 使用
const [theme, setTheme] = useLocalStorage('theme', 'light')

// useFetch - 数据获取
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
const { data, loading, error } = useFetch('/api/users')

// useToggle - 布尔值切换
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)
  
  const toggle = useCallback(() => {
    setValue(v => !v)
  }, [])
  
  return [value, toggle]
}

// 使用
const [isOpen, toggleOpen] = useToggle(false)

// useClickOutside - 点击外部
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      handler(event)
    }
    
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

// 使用
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef()
  
  useClickOutside(ref, () => setIsOpen(false))
  
  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div>Dropdown content</div>}
    </div>
  )
}

// useWindowSize - 窗口尺寸
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return size
}

// 使用
const { width, height } = useWindowSize()

// useInterval - 定时器
function useInterval(callback, delay) {
  const savedCallback = useRef()
  
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])
  
  useEffect(() => {
    if (delay === null) return
    
    const tick = () => savedCallback.current()
    const id = setInterval(tick, delay)
    
    return () => clearInterval(id)
  }, [delay])
}

// 使用
function Counter() {
  const [count, setCount] = useState(0)
  
  useInterval(() => {
    setCount(count + 1)
  }, 1000)
  
  return <div>{count}</div>
}

// usePrevious - 获取前一个值
function usePrevious(value) {
  const ref = useRef()
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref.current
}

// 使用
function Counter() {
  const [count, setCount] = useState(0)
  const prevCount = usePrevious(count)
  
  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}

// useMediaQuery - 媒体查询
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    
    return () => media.removeEventListener('change', listener)
  }, [matches, query])
  
  return matches
}

// 使用
function Component() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  )
}
```

### 工具函数

```jsx
// 类名合并
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

// 使用
<div className={classNames(
  'base-class',
  isActive && 'active',
  isDisabled && 'disabled'
)} />

// 深拷贝
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// 防抖
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流
function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 格式化日期
function formatDate(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

// 生成唯一 ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
```

---

## 📚 快速参考

### 生命周期对应关系

| Class 组件 | 函数组件 (Hooks) |
|-----------|-----------------|
| constructor | useState |
| componentDidMount | useEffect(() => {}, []) |
| componentDidUpdate | useEffect(() => {}, [deps]) |
| componentWillUnmount | useEffect(() => { return () => {} }, []) |
| shouldComponentUpdate | React.memo |
| getDerivedStateFromProps | 在渲染时计算 |

### 常用快捷键

```jsx
// 快速创建组件
rafce  // React Arrow Function Component Export
rfce   // React Function Component Export

// 快速导入
imr    // import React from 'react'
imrc   // import React, { Component } from 'react'
imrs   // import React, { useState } from 'react'
```

### 性能优化检查清单

- [ ] 使用 React.memo 包裹纯组件
- [ ] 使用 useMemo 缓存计算结果
- [ ] 使用 useCallback 缓存函数引用
- [ ] 使用 lazy + Suspense 代码分割
- [ ] 避免在渲染函数中创建新对象/数组
- [ ] 使用虚拟列表渲染大列表
- [ ] 使用 key 优化列表渲染
- [ ] 避免不必要的状态提升
- [ ] 使用 Context 时注意拆分
- [ ] 使用 React DevTools Profiler 分析性能

### 常见错误和解决方案

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| Cannot read property of undefined | 数据未加载完成 | 使用可选链 `?.` 或条件渲染 |
| Maximum update depth exceeded | 无限循环更新 | 检查 useEffect 依赖数组 |
| Objects are not valid as a React child | 直接渲染对象 | 使用 `JSON.stringify()` 或提取属性 |
| Each child should have a unique key | 列表缺少 key | 添加唯一的 key 属性 |
| Cannot update during render | 在渲染时更新状态 | 移到 useEffect 或事件处理函数 |

---

## 🔗 相关资源

### 官方文档
- [React 官方文档](https://react.dev/)
- [React API 参考](https://react.dev/reference/react)
- [React Hooks 参考](https://react.dev/reference/react/hooks)

### 推荐工具
- [React DevTools](https://react.dev/learn/react-developer-tools) - 调试工具
- [Create React App](https://create-react-app.dev/) - 脚手架
- [Vite](https://vitejs.dev/) - 构建工具
- [Next.js](https://nextjs.org/) - React 框架

### 状态管理
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Jotai](https://jotai.org/)
- [React Query](https://tanstack.com/query/latest)

### UI 组件库
- [Ant Design](https://ant.design/)
- [Material-UI](https://mui.com/)
- [Chakra UI](https://chakra-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**内容来源**: 基于 [React 官方文档](https://react.dev/) 和实战经验整理（2025-02）
