# Webpack/Vite

## 元信息
- 定位与场景：前端构建工具，Webpack 偏向可配置打包，Vite 偏向快速开发体验。
- 版本范围：以官方稳定版本为准。
- 相关生态：Rollup、Babel、ESBuild。

## 研究记录（Exa）
- 查询 1："Webpack Vite interview questions 2024 2025"
- 查询 2："Vite best practices documentation"
- 查询 3："Webpack concepts"
- 来源摘要：以官方文档为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：Webpack 与 Vite 的核心差异？
  - A：Vite 基于原生 ESM 开发服务器，Webpack 打包后运行。
- Q2：HMR 的原理与收益？
  - A：局部替换模块避免全量刷新。
- Q3：代码分割与懒加载如何实现？
  - A：动态 import。
- Q4：插件系统作用？
  - A：扩展构建能力与生态。
- Q5：多环境配置如何管理？
  - A：基于 mode/环境变量。

### 进阶/场景题
- Q1：大型项目构建性能优化手段？
  - A：缓存、并行、拆分依赖。
- Q2：如何处理兼容旧浏览器？
  - A：Polyfill 与构建目标配置。

### 避坑指南
- 过度拆分导致请求过多。
- 配置不一致引发环境差异。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Vite 官方文档：https://vitejs.dev/guide/
- Webpack 官方文档：https://webpack.js.org/concepts/
```

### 常用代码片段
```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 3000 }
})
```

### 版本差异
- Vite 与 Webpack 生态更新快，升级需参考官方文档。
