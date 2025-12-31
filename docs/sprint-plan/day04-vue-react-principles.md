# Day 4: Vue/React 框架原理

> 第四天重点：响应式原理、虚拟 DOM、Hooks 机制

## 今日目标

- [ ] 掌握 Vue 响应式原理（Vue2 vs Vue3）
- [ ] 理解虚拟 DOM 和 diff 算法
- [ ] 熟悉 React Hooks 原理
- [ ] 掌握组件通信方式
- [ ] 理解 Fiber 架构

---

## Part A: Vue 核心原理

### 1. 响应式原理

#### Q1: Vue2 响应式原理？

**答案：**
```javascript
// Vue2 使用 Object.defineProperty
function defineReactive(obj, key, val) {
  const dep = new Dep();  // 依赖收集器

  Object.defineProperty(obj, key, {
    get() {
      // 依赖收集
      if (Dep.target) {
        dep.depend();
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      // 派发更新
      dep.notify();
    }
  });
}

// 依赖收集器
class Dep {
  static target = null;

  constructor() {
    this.subs = [];  // 订阅者列表
  }

  depend() {
    if (Dep.target) {
      this.subs.push(Dep.target);
    }
  }

  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}

// Watcher
class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;

    Dep.target = this;
    this.value = vm[expr];  // 触发 getter，收集依赖
    Dep.target = null;
  }

  update() {
    const newValue = this.vm[this.expr];
    this.cb(newValue);
  }
}
```

**Vue2 响应式的局限：**
```javascript
// 1. 无法检测对象属性的添加/删除
vm.newProperty = 'value';  // 不响应
// 解决：Vue.set(obj, 'key', value)

// 2. 无法检测数组索引修改
vm.arr[0] = 'new';  // 不响应
// 解决：Vue.set(arr, 0, 'new') 或 arr.splice(0, 1, 'new')

// 3. 无法检测数组长度修改
vm.arr.length = 0;  // 不响应
```

---

#### Q2: Vue3 响应式原理？

**答案：**
```javascript
// Vue3 使用 Proxy
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key);
      const result = Reflect.get(target, key, receiver);
      // 如果是对象，递归代理
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      // 派发更新
      trigger(target, key);
      return result;
    },
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);
      trigger(target, key);
      return result;
    }
  });
}

// 依赖收集
const targetMap = new WeakMap();
let activeEffect = null;

function track(target, key) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  dep.add(activeEffect);
}

// 派发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}

// Effect
function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}
```

**Vue3 响应式优势：**
```
1. 可以检测对象属性的添加/删除
2. 可以检测数组索引和长度变化
3. 性能更好（惰性代理）
4. 支持 Map、Set 等数据结构
```

---

#### Q3: Vue2 和 Vue3 的区别？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    Vue2 vs Vue3                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性              Vue2                  Vue3                │
│  ──────────────────────────────────────────────────────────│
│  响应式            Object.defineProperty  Proxy             │
│  API 风格          Options API           Composition API    │
│  生命周期          beforeCreate, created  setup()           │
│  代码组织          按选项分类             按功能组织         │
│  TypeScript        支持较弱               原生支持           │
│  Tree-Shaking      不支持                 支持               │
│  Fragment          不支持                 支持多根节点       │
│  Teleport          不支持                 支持               │
│  Suspense          不支持                 支持               │
│  虚拟 DOM          全量 diff              静态标记优化       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Composition API vs Options API：**
```javascript
// Options API（Vue2 风格）
export default {
  data() {
    return { count: 0 };
  },
  computed: {
    double() { return this.count * 2; }
  },
  methods: {
    increment() { this.count++; }
  }
};

// Composition API（Vue3 风格）
import { ref, computed } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const double = computed(() => count.value * 2);
    const increment = () => count.value++;

    return { count, double, increment };
  }
};

// <script setup> 语法糖（Vue3.2+）
<script setup>
import { ref, computed } from 'vue';

const count = ref(0);
const double = computed(() => count.value * 2);
const increment = () => count.value++;
</script>
```

---

### 2. 虚拟 DOM 与 Diff

#### Q4: 什么是虚拟 DOM？有什么优势？

**答案：**
```javascript
// 虚拟 DOM 是用 JavaScript 对象描述真实 DOM
const vnode = {
  tag: 'div',
  props: { id: 'app', class: 'container' },
  children: [
    { tag: 'span', props: {}, children: ['Hello'] },
    { tag: 'span', props: {}, children: ['World'] }
  ]
};

// 对应的真实 DOM
// <div id="app" class="container">
//   <span>Hello</span>
//   <span>World</span>
// </div>
```

**虚拟 DOM 的优势：**
```
1. 跨平台：可以渲染到不同平台（Web、Native、服务端）
2. 性能优化：批量更新，减少 DOM 操作
3. 声明式编程：开发者只关注状态，框架负责更新
4. 方便调试：可以记录和回溯状态变化
```

**虚拟 DOM 一定更快吗？**
```
不一定。虚拟 DOM 的优势在于：
1. 最小化 DOM 操作（但仍有 diff 计算开销）
2. 适合复杂场景（大量变化时批量更新）

简单场景直接操作 DOM 可能更快：
document.getElementById('app').textContent = 'new text';
```

---

#### Q5: Vue 的 diff 算法？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    Vue Diff 算法                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  核心策略：                                                  │
│  1. 同级比较，不跨层级                                      │
│  2. 不同类型的节点直接替换                                  │
│  3. 通过 key 标识节点                                       │
│                                                              │
│  双端比较算法（Vue2）：                                     │
│                                                              │
│  旧子节点：[A, B, C, D]                                     │
│  新子节点：[D, A, B, C]                                     │
│                                                              │
│  oldStartIdx  oldEndIdx                                     │
│       ↓           ↓                                         │
│      [A, B, C, D]                                           │
│      [D, A, B, C]                                           │
│       ↑           ↑                                         │
│  newStartIdx  newEndIdx                                     │
│                                                              │
│  比较顺序：                                                  │
│  1. oldStart vs newStart                                    │
│  2. oldEnd vs newEnd                                        │
│  3. oldStart vs newEnd                                      │
│  4. oldEnd vs newStart                                      │
│  5. 以上都不匹配，用 key 查找                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**key 的作用：**
```javascript
// 没有 key：就地复用，可能出错
<div v-for="item in items">{{ item }}</div>
// 节点重新排序时，状态可能错乱

// 有 key：精确匹配，正确复用
<div v-for="item in items" :key="item.id">{{ item }}</div>
// 通过 key 找到对应节点，移动而非重建

// 不要用 index 作为 key（列表变化时 index 会变）
```

---

### 3. 组件通信

#### Q6: Vue 组件通信方式有哪些？

**答案：**
```javascript
// 1. props / $emit（父子通信）
// 父组件
<Child :msg="message" @update="handleUpdate" />

// 子组件
props: ['msg'],
methods: {
  sendToParent() {
    this.$emit('update', newValue);
  }
}

// 2. provide / inject（跨层级）
// 祖先组件
provide() {
  return { theme: this.theme };
}

// 后代组件
inject: ['theme']

// 3. EventBus（任意组件，Vue2）
// event-bus.js
import Vue from 'vue';
export const EventBus = new Vue();

// 发送
EventBus.$emit('event-name', data);
// 接收
EventBus.$on('event-name', (data) => {});

// 4. Vuex / Pinia（全局状态管理）
// store.js
export const useStore = defineStore('main', {
  state: () => ({ count: 0 }),
  actions: {
    increment() { this.count++; }
  }
});

// 组件
const store = useStore();
store.count;
store.increment();

// 5. ref / $parent / $children（直接访问）
// 不推荐，破坏组件封装

// 6. v-model（语法糖）
// 等价于 :value + @input
<Input v-model="text" />
```

---

### 4. 生命周期

#### Q7: Vue 生命周期钩子及执行顺序？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    Vue 生命周期                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  创建阶段：                                                  │
│  beforeCreate  → 实例初始化，data/methods 不可用            │
│  created       → 实例创建完成，可访问 data/methods          │
│                  适合：API 请求                              │
│                                                              │
│  挂载阶段：                                                  │
│  beforeMount   → 模板编译完成，未挂载 DOM                   │
│  mounted       → DOM 挂载完成                               │
│                  适合：DOM 操作、第三方库初始化              │
│                                                              │
│  更新阶段：                                                  │
│  beforeUpdate  → 数据变化，DOM 未更新                       │
│  updated       → DOM 已更新                                 │
│                  注意：避免在此修改数据                      │
│                                                              │
│  卸载阶段：                                                  │
│  beforeUnmount → 组件即将卸载（Vue3）                       │
│  unmounted     → 组件已卸载（Vue3）                         │
│                  适合：清理定时器、事件监听                  │
│                                                              │
│  Vue3 Composition API：                                     │
│  setup()       → 在 beforeCreate 之前执行                   │
│  onMounted()   → mounted                                    │
│  onUpdated()   → updated                                    │
│  onUnmounted() → unmounted                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**父子组件生命周期顺序：**
```
挂载：
父 beforeCreate → 父 created → 父 beforeMount
  → 子 beforeCreate → 子 created → 子 beforeMount → 子 mounted
→ 父 mounted

更新：
父 beforeUpdate → 子 beforeUpdate → 子 updated → 父 updated

卸载：
父 beforeUnmount → 子 beforeUnmount → 子 unmounted → 父 unmounted
```

---

## Part B: React 核心原理

### 1. Hooks 原理

#### Q8: React Hooks 原理？为什么不能在条件语句中使用？

**答案：**
```javascript
// Hooks 使用链表存储状态
// 每次渲染按顺序调用 Hook，通过索引匹配状态

let hookIndex = 0;
const hooks = [];

function useState(initialValue) {
  const currentIndex = hookIndex;

  // 首次渲染使用初始值，后续使用已存储的值
  if (hooks[currentIndex] === undefined) {
    hooks[currentIndex] = initialValue;
  }

  const setState = (newValue) => {
    hooks[currentIndex] = newValue;
    render();  // 触发重新渲染
  };

  hookIndex++;
  return [hooks[currentIndex], setState];
}

function useEffect(callback, deps) {
  const currentIndex = hookIndex;
  const prevDeps = hooks[currentIndex];

  // 比较依赖是否变化
  const hasChanged = prevDeps
    ? !deps.every((d, i) => d === prevDeps[i])
    : true;

  if (hasChanged) {
    callback();
    hooks[currentIndex] = deps;
  }

  hookIndex++;
}

// 渲染前重置索引
function render() {
  hookIndex = 0;
  // 重新执行组件函数
}
```

**为什么不能在条件语句中使用？**
```javascript
// 错误示例
function Component() {
  if (condition) {
    const [a, setA] = useState(0);  // Hook 1
  }
  const [b, setB] = useState(0);    // Hook 2

  // 第一次渲染：condition=true
  // hooks = [0, 0]
  // Hook 1 → index 0
  // Hook 2 → index 1

  // 第二次渲染：condition=false
  // hooks = [0, 0]
  // Hook 2 → index 0（期望 index 1）
  // 状态错乱！
}

// Hooks 按调用顺序存储在数组中
// 条件语句会导致顺序不一致，索引错乱
```

---

#### Q9: useState 和 useReducer 的区别？

**答案：**
```javascript
// useState：简单状态
const [count, setCount] = useState(0);
setCount(count + 1);
setCount(prev => prev + 1);  // 函数式更新

// useReducer：复杂状态逻辑
const reducer = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, { count: 0 });
dispatch({ type: 'increment' });

// 使用场景：
// useState：简单值、布尔值、字符串
// useReducer：
//   - 复杂状态对象
//   - 下一个状态依赖前一个状态
//   - 需要优化性能（dispatch 不变）
```

---

#### Q10: useEffect 和 useLayoutEffect 的区别？

**答案：**
```javascript
// useEffect：异步执行，不阻塞渲染
useEffect(() => {
  // 浏览器绑定 DOM 后异步执行
  // 适合：数据获取、订阅、日志
}, []);

// useLayoutEffect：同步执行，阻塞渲染
useLayoutEffect(() => {
  // DOM 更新后、浏览器绘制前同步执行
  // 适合：DOM 测量、滚动位置恢复
}, []);

// 执行顺序：
// render → DOM 更新 → useLayoutEffect → 浏览器绘制 → useEffect

// 示例：闪烁问题
function Component() {
  const [position, setPosition] = useState(0);

  // 使用 useEffect 可能闪烁
  // 因为先渲染初始值，再更新
  useEffect(() => {
    setPosition(calculatePosition());
  }, []);

  // 使用 useLayoutEffect 不会闪烁
  // 在绘制前就更新了位置
  useLayoutEffect(() => {
    setPosition(calculatePosition());
  }, []);
}
```

---

#### Q11: useMemo 和 useCallback 的区别？

**答案：**
```javascript
// useMemo：缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// useCallback：缓存函数
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);

// useCallback(fn, deps) 等价于 useMemo(() => fn, deps)

// 使用场景：
// useMemo：
//   - 计算量大的值
//   - 避免子组件不必要的渲染（配合 React.memo）

// useCallback：
//   - 传递给子组件的函数
//   - 作为 useEffect 的依赖

// 示例：优化子组件渲染
const Parent = () => {
  const [count, setCount] = useState(0);

  // 不使用 useCallback，每次渲染都是新函数
  // 导致 Child 重新渲染
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <Child onClick={handleClick} />;
};

const Child = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});
```

---

### 2. Fiber 架构

#### Q12: React Fiber 是什么？解决了什么问题？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    React Fiber                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  问题（React 15 及之前）：                                  │
│  - 同步递归渲染，不可中断                                   │
│  - 大组件树渲染时间长，阻塞主线程                           │
│  - 用户交互卡顿                                             │
│                                                              │
│  Fiber 解决方案：                                            │
│  - 将渲染工作拆分成小单元                                   │
│  - 可中断、可恢复                                           │
│  - 支持优先级调度                                           │
│                                                              │
│  Fiber 节点结构：                                            │
│  {                                                          │
│    type,           // 组件类型                              │
│    key,            // key                                   │
│    props,          // 属性                                  │
│    stateNode,      // DOM 节点或组件实例                    │
│    child,          // 第一个子节点                          │
│    sibling,        // 下一个兄弟节点                        │
│    return,         // 父节点                                │
│    effectTag,      // 副作用标记                            │
│    nextEffect,     // 下一个副作用节点                      │
│  }                                                          │
│                                                              │
│  工作阶段：                                                  │
│  1. Reconciliation（协调）                                  │
│     - 可中断                                                │
│     - 构建 Fiber 树，标记副作用                             │
│                                                              │
│  2. Commit（提交）                                          │
│     - 不可中断                                              │
│     - 执行 DOM 操作                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**时间切片（Time Slicing）：**
```javascript
// 利用 requestIdleCallback 思想
function workLoop(deadline) {
  while (nextUnitOfWork && deadline.timeRemaining() > 0) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  if (nextUnitOfWork) {
    requestIdleCallback(workLoop);
  } else {
    commitRoot();  // 所有工作完成，提交
  }
}

requestIdleCallback(workLoop);
```

---

### 3. 组件通信

#### Q13: React 组件通信方式有哪些？

**答案：**
```javascript
// 1. Props（父传子）
<Child data={data} onChange={handleChange} />

// 2. Callback（子传父）
const Child = ({ onSubmit }) => {
  return <button onClick={() => onSubmit(value)}>Submit</button>;
};

// 3. Context（跨层级）
const ThemeContext = createContext('light');

// Provider
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>

// Consumer
const theme = useContext(ThemeContext);

// 4. Redux / Zustand / Jotai（全局状态）
import { useSelector, useDispatch } from 'react-redux';
const count = useSelector(state => state.count);
const dispatch = useDispatch();

// 5. Ref（直接访问）
const childRef = useRef();
<Child ref={childRef} />
childRef.current.doSomething();

// 6. 状态提升（Lifting State Up）
// 共同祖先持有状态，通过 props 传递
```

---

### 4. 性能优化

#### Q14: React 性能优化手段有哪些？

**答案：**
```javascript
// 1. React.memo（防止不必要的渲染）
const Child = React.memo(({ data }) => {
  return <div>{data}</div>;
});

// 2. useMemo / useCallback（缓存值和函数）
const memoizedValue = useMemo(() => compute(a, b), [a, b]);
const memoizedFn = useCallback(() => {}, [deps]);

// 3. 懒加载（代码分割）
const LazyComponent = React.lazy(() => import('./Component'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>

// 4. 虚拟列表（大数据量）
import { FixedSizeList } from 'react-window';

<FixedSizeList height={400} itemCount={1000} itemSize={50}>
  {({ index, style }) => <div style={style}>{items[index]}</div>}
</FixedSizeList>

// 5. 批量更新（React 18 自动批处理）
// React 18 前，异步代码中不会批处理
setTimeout(() => {
  setCount(1);
  setFlag(true);
  // React 17: 两次渲染
  // React 18: 一次渲染（自动批处理）
}, 0);

// 6. 使用 key 优化列表
{items.map(item => <Item key={item.id} {...item} />)}

// 7. 避免内联对象和函数
// 不好
<Child style={{ color: 'red' }} onClick={() => {}} />

// 好
const style = useMemo(() => ({ color: 'red' }), []);
const handleClick = useCallback(() => {}, []);
<Child style={style} onClick={handleClick} />
```

---

## Part C: Vue vs React 对比

#### Q15: Vue 和 React 的主要区别？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    Vue vs React                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性              Vue                   React               │
│  ──────────────────────────────────────────────────────────│
│  定位              渐进式框架            UI 库               │
│  模板              单文件组件（SFC）     JSX                 │
│  响应式            自动依赖追踪          手动状态管理         │
│  更新机制          组件级精确更新        自顶向下重新渲染     │
│  状态更新          直接赋值              setState/dispatch   │
│  学习曲线          较平缓                较陡峭              │
│  生态              官方全家桶            社区驱动            │
│  TypeScript        良好支持              原生支持            │
│                                                              │
│  相同点：                                                    │
│  - 虚拟 DOM                                                 │
│  - 组件化                                                   │
│  - 单向数据流                                               │
│  - 服务端渲染                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 复习检查清单

- [ ] 能解释 Vue2 和 Vue3 响应式原理的区别
- [ ] 理解虚拟 DOM 和 diff 算法
- [ ] 掌握 Vue 组件通信方式
- [ ] 理解 React Hooks 原理和规则
- [ ] 能区分 useEffect 和 useLayoutEffect
- [ ] 理解 Fiber 架构解决的问题
- [ ] 掌握 React 性能优化手段
- [ ] 能对比 Vue 和 React 的区别

---

> 明日预告：Day 5 - 数据库索引和事务
