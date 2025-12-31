# Webpack / Vite 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:Webpack 与 Vite 的核心差异？
- 标准答案:Webpack 以打包为中心，开发期需先构建；Vite 基于原生 ES Modules + dev server，按需编译，冷启动快；生产时 Vite 仍用 Rollup 打包。
- 追问点:何时选择 Vite；生态兼容性；老项目迁移成本。
- 参考:https://vitejs.dev/guide/why.html

### Q2:Tree Shaking 的前提？
- 标准答案:需要 ESM、无副作用或正确标记 `sideEffects`；编译阶段需保持 import/export；动态 require 会失效；Rollup/Vite 默认支持，Webpack 需配置 mode=production。
- 追问点:CommonJS 影响；类装饰器副作用；摇不掉的原因。
- 参考:https://webpack.js.org/guides/tree-shaking/

### Q3:代码分割与按需加载？
- 标准答案:Webpack 使用 dynamic import / SplitChunks；Vite 生产构建同样基于 Rollup 的动态导入；需要合理的 chunk 拆分与 cache group 设置。
- 追问点:预加载/预取；多页面应用；包体过大拆分策略。
- 参考:https://webpack.js.org/plugins/split-chunks-plugin/

### Q4:Loader 与 Plugin 的区别？
- 标准答案:Loader 负责转换资源，单向流式；Plugin 基于 Tapable 钩子扩展编译生命周期；在 Vite 中插件遵循 Rollup 插件体系并支持 dev/serve 钩子。
- 追问点:编写自定义 loader/plugin；插件执行顺序；常见插件示例。
- 参考:https://webpack.js.org/concepts/loaders/

### Q5:Source Map 选择？
- 标准答案:开发用 `cheap-module-source-map` 或 `eval-source-map` 提升速度；生产根据安全/调试需求选择 hidden-source-map 或关闭；Vite 默认在 build 关闭，可通过 `build.sourcemap` 开启。
- 追问点:安全泄露；错误上报与 sourcemap 上传；性能影响。
- 参考:https://webpack.js.org/configuration/devtool/

### Q6:环境变量与模式？
- 标准答案:Webpack 可用 DefinePlugin 注入；Vite 通过 `.env` 文件并以 `VITE_` 前缀暴露；注意构建时替换、不可在客户端暴露敏感信息。
- 追问点:多环境配置；缓存；与 CI 集成。
- 参考:https://vitejs.dev/guide/env-and-mode.html

### Q7:性能优化要点？
- 标准答案:开启缓存(webpack 5 持久化缓存)、多线程 thread-loader/esbuild-loader、减少 polyfill、利用 alias/externals、压缩与 splitting；Vite 用 esbuild 转换与 Rollup 优化，合理配置 `optimizeDeps`。
- 追问点:大型 monorepo；预构建依赖；冷启动瓶颈定位。
- 参考:https://webpack.js.org/configuration/cache/

### Q8:HMR 工作原理？
- 标准答案:Webpack HMR 通过 dev server 与 runtime 交换模块更新；Vite 利用 ESM 直接替换受影响模块，避免重打包；状态保持取决于模块热更新处理。
- 追问点:何时会整页刷新；受控/非受控状态；React/Vue 框架处理差异。
- 参考:https://vitejs.dev/guide/api-hmr.html

## 场景/排查
### Q1:构建体积过大怎么办？
- 标准答案:开启分析工具(webpack-bundle-analyzer/rollup-plugin-visualizer)；拆分 vendors；移除未用 polyfill；使用懒加载与动态导入；开启 gzip/brotli。
- 追问点:图标/图片优化；依赖裁剪；CDN 缓存。
- 参考:https://webpack.js.org/guides/code-splitting/

### Q2:HMR 失效或全量刷新？
- 标准答案:检查是否修改了配置文件/环境变量导致重启；确认框架 HMR 插件加载；状态不可序列化导致热替换失败；排查自定义插件是否处理热更新。
- 追问点:CSS HMR 特性；SSR 项目热更；WS 连接被代理。
- 参考:https://vitejs.dev/guide/api-hmr.html

## 反问
### Q1:团队的构建工具统一吗？迁移计划？
- 标准答案:了解当前使用 webpack 还是 Vite，是否有统一配置/脚手架。
- 追问点:兼容 IE/老浏览器需求；包管理器；CI 缓存策略。
- 参考:团队内部规范

### Q2:性能指标与监控？
- 标准答案:是否监控构建时长、包体、首屏/TTI；是否有自动报警或基线。
- 追问点:SourceMap 上传流程；错误监控工具；性能 budgets。
- 参考:团队内部规范
