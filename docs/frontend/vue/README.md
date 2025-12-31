# Vue.js

## 元信息
- 定位与场景：渐进式前端框架，适用于 SPA/SSR 与复杂前端应用。
- 版本范围：以 Vue 3 为主，兼顾 Vue 2 迁移差异。
- 相关生态：Vue Router、Pinia/Vuex、Vite、Nuxt。

## 研究记录（Exa）
- 查询 1："Vue.js interview questions 2024 2025"
- 查询 2："Vue.js best practices documentation"
- 查询 3："Vue.js architecture diagram"
- 来源摘要：已建立示例结构，内容需按来源更新为最新版本。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：Vue 2 与 Vue 3 响应式机制的核心差异？
  - A：Vue 2 以 `Object.defineProperty` 拦截为主，Vue 3 以 `Proxy` 为主，依赖追踪与触发机制更完善。
- Q2：组件通信的常见方式有哪些？
  - A：`props/emit`、`provide/inject`、状态管理（Pinia/Vuex）、事件总线（不推荐全局滥用）。
- Q3：`v-if` 与 `v-show` 区别与适用场景？
  - A：`v-if` 真实销毁/重建节点，`v-show` 仅切换显示；频繁切换用 `v-show`。
- Q4：`computed` 与 `watch` 的区别？
  - A：`computed` 用于派生状态，具缓存；`watch` 用于副作用与异步流程。
- Q5：Composition API 的核心优势？
  - A：逻辑按功能聚合，复用更好，类型推导更清晰。

### 进阶/场景题
- Q1：大型项目如何划分状态与数据流？
  - A：区分页面级与全局状态，按域划分 Store，优先 local state，避免过度全局化。
- Q2：首屏性能与 SSR 的关键优化点有哪些？
  - A：首屏资源拆分、延迟加载、缓存策略与 hydration 成本控制。

### 避坑指南
- 解构 `reactive` 导致失去响应性，使用 `toRefs`/`toRef`。
- `v-for` 列表未设置稳定 key，导致渲染与状态错乱。
- 把派生状态放进 `watch` 而非 `computed`，导致维护复杂。
- 在 Vue 2 中直接新增对象属性未触发响应式（需 `Vue.set`）。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Vue 3 文档： https://cn.vuejs.org/guide/introduction.html
- Composition API： https://cn.vuejs.org/api/composition-api-setup.html
- Vue Router： https://router.vuejs.org/zh/
- Pinia： https://pinia.vuejs.org/zh/
- Vite： https://cn.vitejs.dev/
```

### 常用代码片段
```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

watch(count, (val) => {
  if (val > 10) {
    // 超过阈值后的副作用处理
  }
})

onMounted(() => {
  // 初始化逻辑
})

const inc = () => {
  count.value += 1
}
</script>

<template>
  <div>
    <p>count: {{ count }}</p>
    <p>doubled: {{ doubled }}</p>
    <button @click="inc">+1</button>
  </div>
</template>
```

### 版本差异
- 全局 API 改为 `createApp` 创建应用实例。
- `v-model` 语法与事件命名发生变化（`modelValue`/`update:modelValue`）。
- 组合式 API 提供新的组织方式，Options API 依旧可用。
- Filters 被移除，建议使用 `computed` 或方法替代。
- 迁移需以官方迁移指南与 release notes 为准。
