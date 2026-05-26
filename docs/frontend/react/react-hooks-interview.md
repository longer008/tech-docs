# React Hooks 面试题集

> React Hooks 核心知识点与高频面试题 (2024-2026)

## A. 面试宝典

### 基础题

#### 1. React Hooks 是什么？为什么引入 Hooks？

**Hooks 是什么：**
- React 16.8 引入的特性
- 允许在函数组件中使用 state 和其他 React 特性
- 以 `use` 开头的函数

**引入原因：**
1. **组件间逻辑复用困难**：Class 组件需要 HOC 或 Render Props，导致"嵌套地狱"
2. **复杂组件难以理解**：生命周期方法中混杂不相关的逻辑
3. **Class 组件的 this 问题**：绑定 this 容易出错
4. **Class 不利于编译优化**：难以进行组件预编译

```jsx
// Class 组件的问题
class Example extends React.Component {
  componentDidMount() {
    // 订阅
    this.subscription = dataSource.subscribe();
    // 获取数据
    this.fetchData();
  }

  componentWillUnmount() {
    // 清理订阅
    this.subscription.unsubscribe();
  }

  // 相关逻辑分散在不同生命周期中
}

// Hooks 解决方案
function Example() {
  // 相关逻辑聚合在一起
  useEffect(() => {
    const subscription = dataSource.subscribe();
    fetchData();

    return () => subscription.unsubscribe();
  }, []);
}
```

---

#### 2. useState 的工作原理

```jsx
import { useState } from 'react';

function Counter() {
  // 数组解构：[当前值, 更新函数]
  const [count, setCount] = useState(0);

  // 直接更新
  const increment = () => setCount(count + 1);

  // 函数式更新（推荐用于依赖前值的更新）
  const incrementFunctional = () => setCount(prev => prev + 1);

  // 惰性初始化（复杂计算只在首次渲染执行）
  const [data, setData] = useState(() => {
    return expensiveComputation();
  });

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}
```

**重要特性：**
- 状态更新是异步的，多次更新会被批处理
- 状态更新是替换而非合并（与 class 组件的 setState 不同）
- 使用 Object.is 比较，相同值不会触发重渲染

**标准回答：**
> useState 返回一个状态值和更新函数的数组。内部通过链表结构存储每个 Hook 的状态，依靠调用顺序来识别每个 Hook。更新函数触发时会将新值加入更新队列，然后调度重新渲染。

---

#### 3. useEffect 详解

```jsx
import { useEffect, useState } from 'react';

function Example({ userId }) {
  const [user, setUser] = useState(null);

  // 无依赖：每次渲染后执行
  useEffect(() => {
    console.log('每次渲染后执行');
  });

  // 空依赖：仅挂载时执行（componentDidMount）
  useEffect(() => {
    console.log('仅挂载时执行');
  }, []);

  // 有依赖：依赖变化时执行
  useEffect(() => {
    console.log('userId 变化时执行');
    fetchUser(userId).then(setUser);
  }, [userId]);

  // 清理函数（componentWillUnmount + 下次 effect 前）
  useEffect(() => {
    const subscription = subscribeToUser(userId);

    // 返回清理函数
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

**执行时机：**
1. 组件渲染完成后（DOM 更新后）异步执行
2. 在下一次 effect 执行前，先执行上一次的清理函数

**常见陷阱：**
```jsx
// 陷阱1：无限循环
useEffect(() => {
  setCount(count + 1); // 每次更新触发 effect，再次更新
}); // 缺少依赖数组

// 陷阱2：闭包陈旧值
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count); // 始终打印初始值
  }, 1000);
  return () => clearInterval(timer);
}, []); // count 不在依赖中

// 解决方案
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1); // 使用函数式更新
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

---

#### 4. useCallback 和 useMemo 的区别

```jsx
import { useCallback, useMemo, useState } from 'react';

function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // useMemo：缓存计算结果
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue(count);
  }, [count]); // 只有 count 变化时重新计算

  // useCallback：缓存函数引用
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // 函数引用保持不变

  // 等价于
  const handleClickMemo = useMemo(() => {
    return () => console.log('clicked');
  }, []);

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      {/* ChildComponent 不会因为 text 变化而重渲染 */}
      <ChildComponent onClick={handleClick} value={expensiveValue} />
    </div>
  );
}

// 配合 React.memo 使用
const ChildComponent = React.memo(function Child({ onClick, value }) {
  console.log('Child rendered');
  return <button onClick={onClick}>{value}</button>;
});
```

| Hook | 缓存内容 | 返回值 | 使用场景 |
|------|---------|--------|---------|
| useMemo | 计算结果 | 缓存的值 | 避免昂贵计算 |
| useCallback | 函数引用 | 缓存的函数 | 传递给子组件的回调 |

---

#### 5. useRef 的使用场景

```jsx
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

function TextInput() {
  // 1. 访问 DOM 元素
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  // 2. 保存可变值（不触发重渲染）
  const timerRef = useRef(null);
  const countRef = useRef(0);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      countRef.current += 1;
      console.log(countRef.current);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
  };

  return <input ref={inputRef} />;
}

// 3. forwardRef 转发 ref
const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();

  // 自定义暴露给父组件的实例值
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    getValue: () => inputRef.current.value
  }));

  return <input ref={inputRef} />;
});

// 父组件使用
function Parent() {
  const fancyInputRef = useRef();

  const handleClick = () => {
    fancyInputRef.current.focus();
  };

  return <FancyInput ref={fancyInputRef} />;
}
```

**useRef vs useState：**
| 特性 | useRef | useState |
|------|--------|----------|
| 更新触发渲染 | 否 | 是 |
| 值在渲染间保持 | 是 | 是 |
| 同步访问最新值 | 是（.current） | 否（闭包） |

---

### 进阶/场景题

#### 1. 自定义 Hook 设计

```jsx
// useFetch：数据请求 Hook
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(url);
        const result = await response.json();
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}

// useLocalStorage：本地存储 Hook
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// useDebounce：防抖 Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

#### 2. Hooks 的实现原理

**Fiber 架构中的 Hooks：**
```javascript
// 简化的 Hooks 实现原理
let currentlyRenderingFiber = null;
let workInProgressHook = null;

function useState(initialState) {
  // 获取当前 Hook
  const hook = updateWorkInProgressHook();

  if (currentlyRenderingFiber.alternate === null) {
    // 首次渲染
    hook.memoizedState = initialState;
  }

  const dispatch = (action) => {
    hook.memoizedState = typeof action === 'function'
      ? action(hook.memoizedState)
      : action;
    // 调度更新
    scheduleUpdateOnFiber(currentlyRenderingFiber);
  };

  return [hook.memoizedState, dispatch];
}

function updateWorkInProgressHook() {
  // Hooks 以链表形式存储
  let hook;
  if (workInProgressHook === null) {
    hook = currentlyRenderingFiber.memoizedState;
  } else {
    hook = workInProgressHook.next;
  }
  workInProgressHook = hook;
  return hook;
}
```

**为什么 Hooks 不能在条件语句中调用？**
- Hooks 依靠调用顺序来识别每个 Hook
- 条件语句可能改变调用顺序，导致状态错乱

```jsx
// 错误示例
function BadComponent({ condition }) {
  if (condition) {
    const [a, setA] = useState(0); // 有时调用，有时不调用
  }
  const [b, setB] = useState(0);
  // b 的 Hook 可能对应到 a 的状态！
}

// 正确做法
function GoodComponent({ condition }) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  // 条件放在 Hook 内部
  useEffect(() => {
    if (condition) {
      // ...
    }
  }, [condition]);
}
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "useState 是同步的" | setState 是异步的，会被批处理 |
| "useEffect 等同于 componentDidMount" | useEffect 在 DOM 更新后异步执行，时机不完全相同 |
| "useCallback 能提升性能" | 需配合 React.memo 使用才有意义 |
| "useRef 只能用于 DOM 引用" | 也可用于存储任意可变值 |
| "Hooks 可以在任何地方调用" | 只能在函数组件顶层或自定义 Hook 中调用 |

---

## B. 实战文档

### 速查链接

| 资源 | 链接 |
|------|------|
| React 官方文档 | https://react.dev/ |
| Hooks API 参考 | https://react.dev/reference/react |
| React TypeScript | https://react-typescript-cheatsheet.netlify.app/ |

### 常用 Hooks 速查

```jsx
// 基础 Hooks
useState(initialState)
useEffect(effect, deps?)
useContext(Context)

// 额外 Hooks
useReducer(reducer, initialArg, init?)
useCallback(fn, deps)
useMemo(() => value, deps)
useRef(initialValue)
useImperativeHandle(ref, createHandle, deps?)
useLayoutEffect(effect, deps?)  // 同步执行
useDebugValue(value, format?)

// React 18+ 新增
useId()                         // 生成唯一 ID
useTransition()                 // 标记非紧急更新
useDeferredValue(value)         // 延迟值更新
useSyncExternalStore(subscribe, getSnapshot)
useInsertionEffect(effect, deps?)

// React 19+ 新增
use(promise)                    // 读取 Promise/Context
useActionState(action, initialState)
useFormStatus()
useOptimistic(state, updateFn)
```

### 完整组件示例

```tsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface User {
  id: number;
  name: string;
}

interface Props {
  userId: number;
}

export function UserProfile({ userId }: Props) {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Ref
  const abortControllerRef = useRef<AbortController | null>(null);

  // Effect: 获取用户数据
  useEffect(() => {
    abortControllerRef.current = new AbortController();

    async function fetchUser() {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: abortControllerRef.current?.signal
        });
        const data = await response.json();
        setUser(data);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [userId]);

  // Memoized value
  const displayName = useMemo(() => {
    return user?.name.toUpperCase() ?? 'Unknown';
  }, [user?.name]);

  // Callback
  const handleRefresh = useCallback(() => {
    setUser(null);
    // 触发重新获取
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{displayName}</h1>
      <button onClick={handleRefresh}>Refresh</button>
      </div>
  );
}
```

---

## React 19 稳定版新特性

> React 19 于 2024 年 12 月正式发布稳定版，带来了多项重要更新。

### 1. use() -- 读取 Promise 和 Context

```tsx
import { use, Suspense } from 'react';

// 读取 Promise（需配合 Suspense 使用）
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  // use() 可以在条件语句中调用（与其他 Hooks 不同）
  const user = use(userPromise);
  return <div>{user.name}</div>;
}

// 读取 Context（替代 useContext）
function ThemedButton() {
  const theme = use(ThemeContext);
  return <button style={{ background: theme.background }}>Click</button>;
}

// 配合 Suspense 使用
function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile userPromise={fetchUser()} />
    </Suspense>
  );
}
```

**注意**：`use()` 是唯一可以在条件语句（if/循环）中调用的 Hook。

### 2. useActionState -- 表单 Action 状态管理

```tsx
import { useActionState } from 'react';

// 替代之前的 useFormState（React 18 实验性 API）
function SubmitForm() {
  const [state, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const name = formData.get('name');
      const error = validate(name);
      if (error) return { error };

      await submitToServer(name);
      return { success: true, error: null };
    },
    { error: null, success: false } // 初始状态
  );

  return (
    <form action={submitAction}>
      <input name="name" />
      {state.error && <span>{state.error}</span>}
      <button type="submit" disabled={isPending}>
        {isPending ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

### 3. useFormStatus -- 表单状态感知

```tsx
import { useFormStatus } from 'react-dom';

// 必须在 <form> 内部的子组件中使用
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  );
}

// 使用方式
function Form() {
  return (
    <form action={submitAction}>
      <input name="email" />
      <SubmitButton /> {/* 自动感知表单状态 */}
    </form>
  );
}
```

### 4. useOptimistic -- 乐观更新

```tsx
import { useOptimistic } from 'react';

function LikeButton({ postId, initialLiked }) {
  const [liked, setLiked] = useState(initialLiked);
  const [optimisticLiked, addOptimistic] = useOptimistic(liked);

  async function handleLike() {
    // 立即显示乐观状态
    addOptimistic(!liked);
    try {
      const newLiked = await toggleLike(postId);
      setLiked(newLiked); // 服务器确认后更新真实状态
    } catch {
      // 失败时自动回退到真实状态
    }
  }

  return (
    <button onClick={handleLike} disabled={optimisticLiked !== liked}>
      {optimisticLiked ? '已点赞' : '点赞'}
    </button>
  );
}
```

### 5. ref 作为 prop（无需 forwardRef）

```tsx
// React 19 之前：需要 forwardRef
const MyInput = forwardRef((props, ref) => (
  <input ref={ref} {...props} />
));

// React 19：ref 可以作为普通 prop 传递
function MyInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// 使用
function App() {
  const inputRef = useRef(null);
  return <MyInput ref={inputRef} />;
}
```

### 6. ref 清理函数

```tsx
function InputWithCleanup() {
  const ref = useCallback((node) => {
    const observer = new IntersectionObserver(/* ... */);
    if (node) observer.observe(node);

    // React 19 支持返回清理函数
    return () => {
      observer.disconnect();
    };
  }, []);

  return <input ref={ref} />;
}
```

### 7. Server Components 与 Server Actions

```tsx
// Server Component（默认，无需 'use client'）
async function BlogPost({ slug }: { slug: string }) {
  const post = await db.posts.findUnique({ where: { slug } });
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}

// Server Action
'use server';
async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  await db.posts.create({ data: { title } });
  revalidatePath('/posts');
}
```

### React 19 面试高频追问

**Q1: use() 和 useContext 的区别？**
- A: `use()` 可以读取 Promise 和 Context，而 `useContext` 只能读取 Context。`use()` 可以在条件语句中调用，`useContext` 不能。

**Q2: useActionState 和 useState + 异步函数的区别？**
- A: `useActionState` 专为表单 Action 设计，自动追踪 pending 状态，与 `<form action>` 原生集成，支持渐进增强（JS 禁用时也能工作）。

**Q3: React 19 为什么移除了 forwardRef？**
- A: 简化组件 API，ref 现在作为普通 prop 传递，减少了模板代码。forwardRef 仍然可用但不再推荐。

**Q4: Server Components 的限制？**
- A: 不能使用 state（useState/useReducer）、副作用（useEffect）、浏览器 API、事件监听器。仅限服务端运行。
