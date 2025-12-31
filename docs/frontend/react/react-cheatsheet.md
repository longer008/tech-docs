# React 速查表

> React 18+ 常用语法与 API 速查

## JSX 语法

```jsx
// 基础 JSX
const element = <h1>Hello, world!</h1>;

// 表达式
const name = 'Josh';
const element = <h1>Hello, {name}</h1>;

// 属性
<img src={user.avatarUrl} alt="Avatar" />
<button className="btn" onClick={handleClick}>Click</button>

// 条件渲染
{isLoggedIn && <UserGreeting />}
{isLoggedIn ? <UserGreeting /> : <GuestGreeting />}

// 列表渲染
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}

// Fragment
<>
  <ChildA />
  <ChildB />
</>

// 或
<React.Fragment key={id}>
  <ChildA />
  <ChildB />
</React.Fragment>
```

## Hooks

### useState
```jsx
import { useState } from 'react';

// 基础用法
const [count, setCount] = useState(0);

// 更新状态
setCount(1);                    // 直接设置
setCount(prev => prev + 1);     // 函数式更新

// 惰性初始化
const [state, setState] = useState(() => {
  return expensiveComputation();
});

// 对象状态
const [form, setForm] = useState({ name: '', email: '' });
setForm(prev => ({ ...prev, name: 'John' }));
```

### useEffect
```jsx
import { useEffect } from 'react';

// 每次渲染后执行
useEffect(() => {
  console.log('每次渲染后');
});

// 仅挂载时执行
useEffect(() => {
  console.log('挂载时');
}, []);

// 依赖变化时执行
useEffect(() => {
  console.log('count 变化');
}, [count]);

// 清理函数
useEffect(() => {
  const subscription = subscribe();
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### useContext
```jsx
import { createContext, useContext, useState } from 'react';

// 创建 Context
const ThemeContext = createContext('light');

// Provider
function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={theme}>
      <Child />
    </ThemeContext.Provider>
  );
}

// Consumer
function Child() {
  const theme = useContext(ThemeContext);
  return <div>Current theme: {theme}</div>;
}
```

### useReducer
```jsx
import { useReducer } from 'react';

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return initialState;
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </>
  );
}
```

### useCallback / useMemo
```jsx
import { useCallback, useMemo, memo } from 'react';

function Parent({ items }) {
  // useMemo: 缓存计算结果
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // useCallback: 缓存函数
  const handleClick = useCallback((id) => {
    console.log('clicked', id);
  }, []);

  return <Child items={sortedItems} onClick={handleClick} />;
}

// 配合 memo 使用
const Child = memo(function Child({ items, onClick }) {
  return items.map(item => (
    <div key={item.id} onClick={() => onClick(item.id)}>
      {item.name}
    </div>
  ));
});
```

### useRef
```jsx
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

function TextInput() {
  const inputRef = useRef(null);
  const countRef = useRef(0); // 存储可变值

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} />;
}

// forwardRef
const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => inputRef.current.value = ''
  }));

  return <input ref={inputRef} {...props} />;
});
```

### React 18+ Hooks

```jsx
import {
  useId,
  useTransition,
  useDeferredValue,
  useSyncExternalStore
} from 'react';

// useId: 生成唯一 ID
function Form() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Name:</label>
      <input id={id} />
    </>
  );
}

// useTransition: 标记非紧急更新
function Search() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    setQuery(e.target.value); // 紧急更新
    startTransition(() => {
      setSearchResults(search(e.target.value)); // 非紧急更新
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
    </>
  );
}

// useDeferredValue: 延迟值更新
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      <Results query={deferredQuery} />
    </div>
  );
}
```

## 组件模式

### 函数组件
```tsx
interface Props {
  name: string;
  age?: number;
  children?: React.ReactNode;
}

function Welcome({ name, age = 18, children }: Props) {
  return (
    <div>
      <h1>Hello, {name}</h1>
      <p>Age: {age}</p>
      {children}
    </div>
  );
}

// 使用
<Welcome name="John" age={25}>
  <span>Child content</span>
</Welcome>
```

### 高阶组件 (HOC)
```jsx
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
      return <Navigate to="/login" />;
    }

    return <WrappedComponent {...props} />;
  };
}

// 使用
const ProtectedDashboard = withAuth(Dashboard);
```

### Render Props
```jsx
function Mouse({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return render(position);
}

// 使用
<Mouse render={({ x, y }) => (
  <p>Mouse position: {x}, {y}</p>
)} />
```

### Compound Components
```jsx
const Tabs = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

Tabs.List = ({ children }) => <div className="tab-list">{children}</div>;
Tabs.Tab = ({ index, children }) => {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  return (
    <button
      className={activeIndex === index ? 'active' : ''}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
};
Tabs.Panels = ({ children }) => <div className="tab-panels">{children}</div>;
Tabs.Panel = ({ index, children }) => {
  const { activeIndex } = useContext(TabsContext);
  return activeIndex === index ? <div>{children}</div> : null;
};

// 使用
<Tabs>
  <Tabs.List>
    <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
    <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panels>
    <Tabs.Panel index={0}>Panel 1</Tabs.Panel>
    <Tabs.Panel index={1}>Panel 2</Tabs.Panel>
  </Tabs.Panels>
</Tabs>
```

## 状态管理

### Context + useReducer
```jsx
const StateContext = createContext();
const DispatchContext = createContext();

function StateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

function useAppState() {
  return useContext(StateContext);
}

function useAppDispatch() {
  return useContext(DispatchContext);
}
```

### Zustand (轻量级)
```jsx
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

function Counter() {
  const { count, increment, decrement } = useStore();
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

## 事件处理

```jsx
function EventExamples() {
  // 点击事件
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('clicked');
  };

  // 表单提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('submitted');
  };

  // 输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} onKeyDown={handleKeyDown} />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

## 表单处理

```jsx
// 受控组件
function ControlledForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

// 非受控组件
function UncontrolledForm() {
  const nameRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(nameRef.current.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} defaultValue="John" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## TypeScript 类型

```typescript
// 组件 Props 类型
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

// 事件类型
type ClickHandler = React.MouseEventHandler<HTMLButtonElement>;
type ChangeHandler = React.ChangeEventHandler<HTMLInputElement>;
type SubmitHandler = React.FormEventHandler<HTMLFormElement>;

// Ref 类型
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);

// 组件实例类型
const childRef = useRef<React.ElementRef<typeof ChildComponent>>(null);

// State 类型
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);

// Context 类型
interface ContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
const ThemeContext = createContext<ContextValue | null>(null);
```
