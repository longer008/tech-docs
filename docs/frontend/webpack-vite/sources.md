# Webpack & Vite 参考资源

> 精选构建工具学习资源

**更新时间**: 2025-02

## 📚 官方文档

### Webpack
- [Webpack 官网](https://webpack.js.org/)
- [Webpack 中文文档](https://webpack.docschina.org/)
- [Webpack 配置参考](https://webpack.js.org/configuration/)
- [Webpack Loaders](https://webpack.js.org/loaders/)
- [Webpack Plugins](https://webpack.js.org/plugins/)

### Vite
- [Vite 官网](https://vitejs.dev/)
- [Vite 中文文档](https://cn.vitejs.dev/)
- [Vite 配置参考](https://vitejs.dev/config/)
- [Vite 插件](https://vitejs.dev/plugins/)
- [Awesome Vite](https://github.com/vitejs/awesome-vite)

### Rollup
- [Rollup 官网](https://rollupjs.org/)
- [Rollup 插件](https://github.com/rollup/awesome)

## 🔍 MCP 查询记录

**查询时间**: 2025-02-04

**使用的 MCP 服务**:
- Context7 (`/vitejs/vite`) - Vite 官方文档
- Context7 (`/websites/vite_dev`) - Vite 网站文档
- Context7 (`/websites/webpack_js`) - Webpack 官方文档

**查询主题**:
1. Vite 性能优化和依赖预构建
2. Vite HMR 热更新机制
3. Webpack 核心概念和代码分割
4. Tree Shaking 实现原理

**关键发现**:
- Vite 基于 ESM 实现极速开发体验
- Webpack 5 持久化缓存大幅提升性能
- Tree Shaking 需要 ESM 和正确的 sideEffects 配置
- 代码分割是性能优化的关键手段

## 📖 学习资源

### 教程
- [Webpack 从入门到精通](https://webpack.docschina.org/guides/)
- [Vite 快速上手](https://cn.vitejs.dev/guide/)
- [深入浅出 Webpack](https://webpack.wuhaolin.cn/)

### 视频
- [Webpack 5 完整教程](https://www.bilibili.com/video/BV1e7411j7T5)
- [Vite 从入门到实战](https://www.bilibili.com/video/BV1GN4y1M7P5)

## 🛠️ 工具推荐

### Webpack 插件
- html-webpack-plugin
- mini-css-extract-plugin
- webpack-bundle-analyzer
- compression-webpack-plugin

### Vite 插件
- @vitejs/plugin-react
- @vitejs/plugin-vue
- vite-plugin-compression
- rollup-plugin-visualizer

## 📊 文档优化总结

**index.md** (~1500 行):
- Webpack vs Vite 对比
- Webpack 核心概念（Entry、Output、Loader、Plugin）
- Vite 核心特性（依赖预构建、HMR、环境变量）
- 构建优化（缓存、多线程、代码分割）
- 开发体验（Source Map、Dev Server）
- 生产构建配置
- 最佳实践（8个实用建议）
- 常见问题解答

**interview-bank.md** (~800 行):
- 10道精选面试题
- 涵盖基础概念、Webpack核心、Vite核心、性能优化、实战场景
- 每题包含核心答案、代码示例、追问点

**sources.md** (~200 行):
- 官方文档链接
- MCP 查询记录
- 学习资源推荐
- 工具插件列表

**总计**: ~2500 行，80+ 代码示例

---

**最后更新**: 2025-02
