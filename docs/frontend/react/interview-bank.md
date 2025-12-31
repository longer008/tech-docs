# React 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:函数组件与 Class 组件的差异？
- 标准答案:函数组件配合 Hooks 管理状态与副作用，逻辑复用靠自定义 Hook；Class 组件有生命周期方法、this 绑定；新代码优先函数组件。
- 追问点:shouldComponentUpdate vs React.memo；Hook 如何替代生命周期；渲染性能差异。
- 参考:https://react.dev/reference/react

### Q2:Hook 规则与常见陷阱？
- 标准答案:Hook 只能在函数最外层调用、只能在 React 函数组件/自定义 Hook 中使用；依赖数组需声明所有用到的值；避免在条件/循环中调用。
- 追问点:useEffect 与 useLayoutEffect 区别；自定义 Hook 传参；闭包陷阱。
- 参考:https://react.dev/reference/react/useEffect

### Q3:状态更新与批处理？
- 标准答案:在事件处理等 React 上下文中 setState 默认批处理；在 Promise/定时器中 React18 也启用自动批处理；使用函数式更新避免依赖旧值问题。
- 追问点:flushSync 作用；批处理对性能的影响；异步数据流中的 setState。
- 参考:https://react.dev/reference/react/flushSync

### Q4:列表渲染中的 key 作用？
- 标准答案:key 帮助 reconciliation 识别节点，保持稳定性，避免索引做 key 导致状态错位；需要在兄弟级唯一。
- 追问点:何时必须使用不可变数据；删除/插入时的副作用；性能影响。
- 参考:https://react.dev/learn/rendering-lists

### Q5:避免不必要的重新渲染？
- 标准答案:使用 React.memo、useMemo、useCallback、分割组件、选择性提升状态；合理使用 context，避免过度传递；使用事件处理转发减少 props 变化。
- 追问点:React.memo 的浅比较限制；使用 selector 的 context/Redux；虚拟列表。
- 参考:https://react.dev/learn/escape-hatches#memoizing

### Q6:Suspense 与并发特性？
- 标准答案:Suspense 用于协调异步数据加载/代码分割显示 fallback；React18 的并发渲染支持 startTransition、useDeferredValue 减缓输入卡顿；需配合数据源适配器。
- 追问点:Server Components 与 Suspense；错误边界与 Suspense 关系；streaming SSR。
- 参考:https://react.dev/reference/react/Suspense

### Q7:状态管理选择？
- 标准答案:本地状态用 useState/useReducer；跨组件轻量共享可用 context + reducer；复杂场景选择 Redux Toolkit/Zustand/Recoil/Jotai；根据异步数据可用 React Query/SWR。
- 追问点:何时拆分 store；状态与缓存的区分；服务端数据同步。
- 参考:https://redux-toolkit.js.org/

### Q8:SSR/同构的关键点？
- 标准答案:Next.js/Nuxt-like；需要处理数据预取、hydrate 兼容、避免使用浏览器专属 API；缓存策略与路由方案；注意跨环境差异。
- 追问点:getServerSideProps/getStaticProps；边缘渲染；SEO 指标。
- 参考:https://nextjs.org/docs

## 场景/排查
### Q1:useEffect 依赖错误导致死循环，如何排查？
- 标准答案:检查依赖数组是否遗漏/多余；使用 ESLint react-hooks 插件；对稳定引用使用 useCallback/useMemo；避免在 effect 中直接 setState 未做条件判断。
- 追问点:闭包值不变问题；自定义 Hook 如何暴露依赖；调试工具。
- 参考:https://react.dev/reference/react/useEffect

### Q2:列表拖拽后组件状态错位？
- 标准答案:确保 key 与数据唯一且稳定，不使用 index；对可重排序列表使用 ID；必要时重置内部状态或使用受控组件。
- 追问点:虚拟列表库如何设置 key；动画过渡期间的状态保持。
- 参考:https://react.dev/learn/rendering-lists

## 反问
### Q1:团队的状态管理与数据请求规范？
- 标准答案:了解是否统一使用 Redux Toolkit/React Query，便于快速对齐。
- 追问点:错误处理与重试策略；接口 mock；缓存失效规则。
- 参考:团队内部规范

### Q2:组件库与设计系统？
- 标准答案:确认是否使用内部 UI 库/Storybook/主题体系，避免重复建设。
- 追问点:可访问性要求；SSR 兼容性；样式方案(CSS-in-JS/Tailwind)。
- 参考:团队内部规范
