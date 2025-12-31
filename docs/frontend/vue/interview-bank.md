# Vue 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:Vue2/3 响应式原理差异？
- 标准答案:Vue2 基于 Object.defineProperty 对属性劫持，无法侦测新增/删除；Vue3 基于 Proxy 代理，支持 Map/Set/数组等更多类型且懒收集；依赖收集与派发更新仍基于 effect。
- 追问点:为何 Vue2 无法监听数组索引；Vue3 的 track/trigger；性能对比。
- 参考:https://vuejs.org/guide/extras/reactivity-in-depth.html

### Q2:Composition API 与 Options API 区别？
- 标准答案:Composition API 通过 setup/composable 按逻辑聚合，复用性与类型友好；Options API 按选项分组，学习曲线低；两者可混用但新项目推荐 Composition。
- 追问点:setup 执行时机；script setup 语法糖；组合式函数命名约定。
- 参考:https://vuejs.org/guide/extras/composition-api-faq.html

### Q3:computed 与 watch 适用场景？
- 标准答案:computed 依赖缓存，用于派生状态；watch/ watchEffect 监听副作用或异步操作；避免滥用 watch 代替计算属性。
- 追问点:computed getter/setter；flush 时机；防抖节流。
- 参考:https://vuejs.org/guide/essentials/computed.html

### Q4:虚拟 DOM diff 与 key 的作用？
- 标准答案:Vue2 基于双端比较，Vue3 使用最长递增子序列优化；key 用于稳定节点身份，避免复用错误导致状态错乱；不要用 index 作为 key。
- 追问点:同层比较原则；PatchFlags 与编译优化；Fragment。
- 参考:https://vuejs.org/guide/extras/rendering-mechanism.html

### Q5:v-model 与表单双向绑定实现？
- 标准答案:本质是 prop+事件，父传值、子发 `update:modelValue`；支持修饰符；多 v-model 对应不同 prop/事件。
- 追问点:自定义组件如何实现；与受控/非受控的取舍；v-model.number/trim。
- 参考:https://vuejs.org/guide/components/v-model.html

### Q6:路由与状态管理选型？
- 标准答案:路由用 Vue Router，支持历史/哈希模式、守卫、懒加载；全局状态推荐 Pinia（轻量、TS 友好），旧项目可用 Vuex。
- 追问点:路由守卫中的异步处理；动态路由加载；模块化 store。
- 参考:https://router.vuejs.org/guide/

### Q7:nextTick 的作用？
- 标准答案:DOM 更新异步批处理，nextTick 在更新 flush 后执行回调，适合获取更新后的 DOM；Vue3 默认微任务调度。
- 追问点:flush 时机选择；await nextTick；为何批处理有利性能。
- 参考:https://vuejs.org/api/general.html#nexttick

### Q8:keep-alive 与缓存策略？
- 标准答案:用于缓存动态组件/路由组件，`include/exclude` 控制范围，`activated/deactivated` 生命周期；注意缓存大小与 key 变化。
- 追问点:搭配 transition；缓存失效策略；与 keep-alive 内部栈结构。
- 参考:https://vuejs.org/api/built-in-components.html#keep-alive

## 场景/排查
### Q1:列表更新后视图未刷新？
- 标准答案:确认响应式限制（Vue2 对数组/对象新增需 `Vue.set`，Vue3 直接可见）；确保 key 稳定；避免直接修改 props/非响应式数据源。
- 追问点:Proxy 深层对象；解构导致响应式丢失；使用 toRef/toRefs。
- 参考:https://vuejs.org/guide/essentials/reactivity-fundamentals.html

### Q2:性能优化思路？
- 标准答案:拆分组件、使用 memoized 计算属性、v-once/v-memo、懒加载路由、虚拟列表；避免在模板中复杂计算；使用 devtools profiler。
- 追问点:PatchFlag 提示；SSR + 缓存；响应式数据规模。
- 参考:https://vuejs.org/guide/best-practices/performance.html

## 反问
### Q1:团队在 Vue2/Vue3 的比例？升级计划？
- 标准答案:了解技术债与迁移策略，评估组合式 API 采用程度。
- 追问点:兼容层/宏编译；测试覆盖；组件库兼容性。
- 参考:团队内部规范

### Q2:UI 组件库与样式方案？
- 标准答案:确认是否统一使用 Element Plus/Ant Design Vue/Tailwind，减少重复搭建。
- 追问点:主题定制；无障碍要求；SSR 兼容。
- 参考:团队内部规范
