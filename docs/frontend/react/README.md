# React

## 元信息
- 定位与场景：用于构建用户界面的前端库，适合组件化开发与大型前端工程。
- 版本范围：以 React 18 为主，关注后续版本变更（以官方 Release Notes 为准）。
- 相关生态：React Router、状态管理（Redux/Zustand）、构建工具（Vite/Next.js）。

## 研究记录（Exa）
- 查询 1："React interview questions 2024 2025"
- 查询 2："React best practices documentation"
- 查询 3："Rules of Hooks React"
- 来源摘要：已基于官方文档与常见面试题库整理，需定期与官方文档核对。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：为什么 React 采用单向数据流？
  - A：数据从父到子单向流动，减少双向绑定带来的不可控状态，便于追踪与调试。
- Q2：`key` 在列表渲染中的作用？
  - A：帮助 Diff 算法稳定识别节点，避免重排与状态错乱。
- Q3：`useEffect` 的依赖数组如何理解？
  - A：依赖变化触发副作用，空数组表示仅挂载时执行；需注意闭包与清理函数。
- Q4：受控组件与非受控组件的差异？
  - A：受控组件状态由 React 管理；非受控由 DOM 自身维护。
- Q5：`useMemo` 与 `useCallback` 的使用场景？
  - A：前者缓存计算结果，后者缓存函数引用，避免不必要渲染。

### 进阶/场景题
- Q1：大型应用如何组织状态与数据流？
  - A：区分局部与全局状态，按领域拆分 store，避免全局状态膨胀。
- Q2：如何优化首屏性能？
  - A：按路由/组件分包、懒加载、减少首屏依赖、启用缓存与预加载。

### 避坑指南
- 在条件/循环/事件处理内调用 Hooks，违反规则导致异常。
- 使用数组索引作为 `key` 造成复用错误。
- `useEffect` 依赖遗漏引发逻辑不一致。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- React 官方文档：https://react.dev/
- Rules of Hooks：https://reactjs.org/docs/hooks-rules.html
- Thinking in React：https://reactjs.org/docs/thinking-in-react.html
```

### 常用代码片段
```jsx
import { useEffect, useMemo, useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  const doubled = useMemo(() => count * 2, [count])

  useEffect(() => {
    // 副作用示例：同步标题
    document.title = `count: ${count}`
    return () => {
      // 清理逻辑
    }
  }, [count])

  return (
    <div>
      <p>count: {count}</p>
      <p>doubled: {doubled}</p>
      <button onClick={() => setCount((v) => v + 1)}>+1</button>
    </div>
  )
}
```

### 版本差异
- React 18 引入 `createRoot` 与自动批处理（batching）。
- 新增 `useId`、`useTransition` 等并发相关 API。
- 版本升级需以官方 Release Notes 为准。
