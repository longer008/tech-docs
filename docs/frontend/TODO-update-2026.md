# 前端文档内容更新计划

> 创建时间: 2026-05-25
> 目标: 将前端文档中过时的版本信息和时间标签更新至当前时间点

## 核心变更概览

| 框架/工具 | 文档当前版本 | 最新稳定版 | 变更级别 |
|-----------|-------------|-----------|---------|
| React | 19 (2024.12) | 19.2.6 (2026.5) | 特性更新 |
| Next.js | 15 (2024.10) | 16.2.6 (2026.5) | 大版本 |
| Vue 3 | 3.5+ | 3.5.34 / 3.6 beta | 级内更新+beta |
| Vite | 6 (2024.11) | 8.0.14 (2026.5) | 大版本x2 |
| Tailwind | v4 (2025.1) | v4.3.0 (2026.5) | 级内更新 |
| TypeScript | 5.x | 6.0.3 (2026.4) | 大版本 |
| Electron | 30+ | 42.2.0 (2026.5) | 大版本x12 |
| Nuxt | 3.x | 4.4.6 (2026.5) | 大版本 |
| Pinia | 2.x | 3.0.4 (2025.11) | 大版本 |

---

## TODO 列表

### P0 - 时间标签与分类标题修正

- [x] `architecture/monitoring-system.md` L735: "最新知识补充（2024-2025）" -> "2024-2026"
- [x] `webpack-vite/vite-advanced.md` L827: "最新知识补充（2024-2025）" -> "2024-2026"
- [x] `webpack-vite/index.md` L1429: "最新知识补充（2024-2025）" -> "2024-2026"
- [x] `visualization/index.md` L776: "最新知识补充（2024-2025）" -> "2024-2026"
- [x] `react/react-hooks-interview.md` L3: "2024-2025" -> "2024-2026"

### P1 - Vite/Webpack 模块（大版本x2，影响面大）

- [x] `webpack-vite/index.md` 补充 Vite 7/8 演进（Rolldown 统一打包器、架构变更）
- [x] `webpack-vite/vite-advanced.md` 补充 Vite 7->8 演进、Rolldown 替代 esbuild+Rollup
- [x] `webpack-vite/interview-bank.md` 补充 Vite 8 面试考点
- [x] `webpack-vite/sources.md` 更新版本引用

### P1 - Vue 模块（3.6 beta + Nuxt 4 大版本）

- [x] `vue/README.md` 版本范围补充 Vue 3.6 beta（Vapor Mode、alien-signals）-- 未单独修改，内容已在 vue3-interview.md 等补充
- [x] `vue/vue3-interview.md` 补充 3.6 beta 核心变化面试考点
- [x] `vue/vue3-reactivity-deep-dive.md` 补充 alien-signals 响应式重构
- [x] `vue/vue3-compiler-deep-dive.md` 补充 Vapor Mode 编译策略
- [x] `vue/vue3-vs-vue2.md` 补充 3.6 变化 -- 已在 vue3-interview.md 和 reactivity-deep-dive 中覆盖
- [x] `vue/vue2-interview.md` 无需更新（EOL 文档，仅供旧项目参考）
- [x] `vue/nuxtjs-interview.md` 补充 Nuxt 4（app 目录、Vue Router v5、createUseFetch）
- [x] `vue/interview-bank.md` 补充 Vue 3.6 / Pinia 3 面试考点
- [x] `vue/sources.md` 更新版本引用（Vue 3.6 beta / Pinia 3.x）

### P1 - TypeScript 模块（大版本 5->6）

- [x] `typescript/index.md` 补充 TS 6.0（桥接版本、为 TS 7 Go 重写版准备）
- [x] `typescript/interview-bank.md` 补充 TS 6.0 面试考点
- [x] `typescript/sources.md` 更新版本引用

### P1 - CSS/Tailwind 模块（级内更新，新特性多）

- [x] `css-tailwind/index.md` 补充 Tailwind v4.1-4.3 新特性（text-shadow、mask、webpack 插件、scrollbar）
- [x] `css-tailwind/interview-bank.md` 补充 v4.3 面试考点
- [x] `css-tailwind/sources.md` 更新版本引用

### P1 - 其他模块

- [x] `visualization/index.md` 更新 ECharts/Three.js 最新版本 + 时间标签 + 修复截断 ECharts 标题
- [x] `visualization/echarts-guide.md` 更新示例代码中的年份 -- 示例数据属技术演示性质，无需更新
- [x] `visualization/threejs-guide.md` 修复截断的 return 语句 + 补充面试要点标题
- [x] `visualization/canvas-guide.md` 修复 animate/ObjectPool 截断 + 补充 Ball 类定义
- [x] `visualization/webgl-guide.md` 检查是否有更新 -- 时间标签已2026-05，WebGL API变化缓慢，无需更新
- [x] `前端100道问答.md` 补充 2026 年新考点
- [x] `wechat-mini-program/` 检查微信小程序最新变化 -- 补充Skyline、基础库v3.14-3.16、隐私弹窗变化
- [x] `uniapp/` 检查 uni-app 最新版本 -- 补充uni-app x、uvue、uts、条件编译新标识
- [x] `cross-platform/` 检查跨平台最新变化 -- 补充RN 0.85、Flutter 3.44、Taro 5.0、KMP+CMP 1.11

### P2 - React 模块（级内特性更新，优先级降低）

- [x] `react/README.md` 补充 React 19.2 新特性（Activity、useEffectEvent、cacheSignal）
- [x] `react/react-hooks-interview.md` 补充 19.2.x 新增 Hooks（useEffectEvent）
- [x] `react/react-cheatsheet.md` 补充 Activity、useEffectEvent
- [x] `react/interview-bank.md` 补充 19.2 新特性面试考点
- [x] `react/sources.md` 补充 React 19.2 更新链接

### P2 - Next.js 模块（大版本 15->16，优先级降低）

- [x] `react/nextjs-interview.md` 补充 Next.js 16（Turbopack 默认、React Compiler、Cache Components、proxy.ts）
- [x] `react/sources.md` 补充 Next.js 16 链接

### P2 - Electron 模块（大版本 30->42，优先级降低）

- [x] `desktop/electron/index.md` 补充 Electron 42（Chromium 148、Node v24、WebAuthn Touch ID）
- [x] `desktop/electron/interview-bank.md` 补充 Electron 42 面试考点
- [x] `desktop/electron/ipc-communication.md` 检查新版本 IPC 变化

---

## 执行策略

1. P0 先执行（纯文本替换，改动最小最安全）
2. P1 按模块逐个处理，每个模块先读取现有内容再针对性补充（不删除旧版本内容，在"最新知识补充"或版本说明部分追加）
3. P2 等待 P0/P1 完成后再处理
4. 每个模块完成后勾选对应 TODO

## 备注

- `fundamentals/` 模块中的 Expires 示例日期属技术演示性质，不需要更新
- INP 替代 FID（2024.3）的记录已正确，无需修改
- `vue/vue2-interview.md` 是 EOL 文档，不做更新
- ES2022/ES2023/ES2024 是标准版本号，不是年份引用，不需要修改