# Webpack & Vite 面试题库

> 精选构建工具核心面试题

**更新时间**: 2025-02

## 📋 目录

- [基础概念](#基础概念)
- [Webpack 核心](#webpack-核心)
- [Vite 核心](#vite-核心)
- [性能优化](#性能优化)
- [实战场景](#实战场景)

---

## 🎯 基础概念

### 1. Webpack 和 Vite 的核心区别是什么？

**核心答案**：

**Webpack**：
- 打包器（Bundler）
- 开发时需要打包所有模块
- 启动慢，但生态成熟
- 配置复杂但灵活

**Vite**：
- 基于 ESM 的开发服务器
- 按需编译，启动极快
- 生产环境使用 Rollup
- 配置简单，开箱即用

**代码示例**：

```javascript
// Webpack - 需要打包
// 启动时间：10-30秒（大型项目）
npm run dev // 等待打包完成

// Vite - 按需编译
// 启动时间：<1秒
npm run dev // 立即启动
```

**追问点**：

**Q1: 什么场景选择 Webpack？**

A: Webpack 适合以下场景：
- **复杂项目**：大型企业级应用，需要精细的构建控制和优化
- **多入口应用**：需要构建多个独立的应用或页面
- **自定义需求**：需要编写大量自定义 Loader 和 Plugin
- **兼容性要求**：需要支持老旧浏览器或特殊环境
- **成熟生态**：团队已有丰富的 Webpack 经验和配置

**Q2: Vite 如何处理 CommonJS 模块？**

A: Vite 通过依赖预构建处理 CommonJS：
- **预构建阶段**：使用 esbuild 将 CommonJS 模块转换为 ESM 格式
- **缓存机制**：转换结果缓存在 `node_modules/.vite/` 目录
- **自动检测**：检测到 CommonJS 依赖时自动触发预构建
- **兼容性**：支持混合使用 ESM 和 CommonJS 模块

```javascript
// vite.config.js - 手动配置预构建
export default {
  optimizeDeps: {
    include: ['lodash'], // 强制预构建
    exclude: ['some-esm-lib'] // 排除预构建
  }
}
```
- 为什么 Vite 生产环境用 Rollup？

---

### 2. 什么是 Tree Shaking？如何实现？

**核心答案**：

Tree Shaking 是移除未使用代码的优化技术。

**实现条件**：
1. 使用 ES6 模块（import/export）
2. 生产模式（mode: 'production'）
3. 正确配置 sideEffects

**代码示例**：

```javascript
// math.js
export const add = (a, b) => a + b
export const subtract = (a, b) => a - b
export const multiply = (a, b) => a * b

// main.js
import { add } from './math' // 只打包 add 函数

// package.json
{
  "sideEffects": false // 所有文件都可以 Tree Shaking
}

// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false
  }
}
```

**追问点**：

**Q1: sideEffects 的作用？**

A: sideEffects 告诉打包工具哪些文件是"纯净"的，可以安全地进行 Tree Shaking：
- **false**：所有文件都没有副作用，可以安全删除未使用的导出
- **数组**：指定有副作用的文件，如 `["*.css", "*.scss", "./src/polyfills.js"]`
- **未设置**：打包工具会保守处理，可能无法完全 Tree Shaking

```json
// package.json - 精确配置
{
  "sideEffects": [
    "*.css",
    "*.scss", 
    "./src/polyfills.js",
    "./src/global-setup.js"
  ]
}
```

**Q2: 为什么 CommonJS 不支持 Tree Shaking？**

A: CommonJS 的动态特性阻碍了静态分析：
- **动态导入**：`require()` 可以在运行时动态调用，无法静态分析
- **条件导入**：可以在 if 语句中使用 require，依赖关系不确定
- **属性访问**：`module.exports` 可以动态修改，导出内容不确定
- **ES6 模块**：import/export 是静态的，可以在编译时确定依赖关系

```javascript
// ❌ CommonJS - 无法 Tree Shaking
const utils = require('./utils')
if (condition) {
  const extra = require('./extra') // 动态导入
}

// ✅ ES6 模块 - 支持 Tree Shaking
import { debounce } from './utils' // 静态导入
```

**Q3: 如何验证 Tree Shaking 效果？**

A: 验证 Tree Shaking 的方法：
- **Bundle 分析**：使用 webpack-bundle-analyzer 查看打包结果
- **构建日志**：查看 Webpack 的 usedExports 信息
- **文件大小对比**：对比优化前后的文件大小
- **源码搜索**：在打包后的文件中搜索未使用的函数名

```bash
# 安装分析工具
npm install --save-dev webpack-bundle-analyzer

# 生成分析报告
npx webpack-bundle-analyzer dist/main.js
```
{
      template: './index.html'
    })
  ]
}
```

**追问点**：

**Q1: 如何编写自定义 Loader？**

A: Loader 是一个导出函数的 Node.js 模块，接收源代码并返回转换后的代码：

```javascript
// my-loader.js
module.exports = function(source) {
  // this 是 Loader 上下文，包含很多有用的方法和属性
  const options = this.getOptions() // 获取配置选项
  
  // 转换源代码
  const transformedSource = source.replace(/console\.log/g, 'console.warn')
  
  // 返回转换后的代码
  return transformedSource
}

// webpack.config.js
module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: './my-loader.js',
        options: { /* 配置选项 */ }
      }]
    }]
  }
}
```

**Q2: 如何编写自定义 Plugin？**

A: Plugin 是一个具有 apply 方法的类或函数，通过 Webpack 的钩子系统工作：

```javascript
// my-plugin.js
class MyPlugin {
  constructor(options) {
    this.options = options
  }
  
  apply(compiler) {
    // 在编译完成后执行
    compiler.hooks.done.tap('MyPlugin', (stats) => {
      console.log('构建完成！')
      console.log(`构建时间: ${stats.endTime - stats.startTime}ms`)
    })
    
    // 在生成资源到输出目录之前执行
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // 添加一个新文件到输出
      compilation.assets['build-info.txt'] = {
        source: () => `Build time: ${new Date().toISOString()}`,
        size: () => 50
      }
      callback()
    })
  }
}

module.exports = MyPlugin

// webpack.config.js
const MyPlugin = require('./my-plugin')

module.exports = {
  plugins: [
    new MyPlugin({ /* 配置选项 */ })
  ]
}
```
- Loader 的执行顺序？

**Q3: Loader 的执行顺序？**

A: Loader 的执行顺序遵循特定规则：
- **从右到左**：在 use 数组中从右到左执行
- **从下到上**：多个 rule 匹配时从下到上执行
- **pre/normal/post**：可以通过 enforce 属性控制执行顺序

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',  // 3. 最后执行
          'css-loader',    // 2. 然后执行
          'sass-loader'    // 1. 首先执行
        ]
      },
      {
        test: /\.js$/,
        enforce: 'pre',  // 预处理器，最先执行
        use: 'eslint-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader' // 正常顺序
      },
      {
        test: /\.js$/,
        enforce: 'post', // 后处理器，最后执行
        use: 'coverage-loader'
      }
    ]
  }
}

// 执行顺序：eslint-loader → babel-loader → coverage-loader
```

---

### 4. 代码分割有哪些方式？

**核心答案**：

1. **入口分割**：多个 entry
2. **动态导入**：import()
3. **SplitChunks**：提取公共代码

**代码示例**：

```javascript
// 1. 入口分割
module.exports = {
  entry: {
    app: './src/app.js',
    admin: './src/admin.js'
  }
}

// 2. 动态导入
const Home = () => import('./pages/Home')

// 3. SplitChunks
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors'
        }
      }
    }
  }
}
```

**追问点**：

**Q1: 如何控制 chunk 大小？**

A: Webpack 提供多种方式控制 chunk 大小：

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000, // 最小 chunk 大小 (20KB)
      maxSize: 244000, // 最大 chunk 大小 (244KB)
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          maxSize: 200000 // vendor chunk 最大 200KB
        }
      }
    }
  },
  
  // 性能提示
  performance: {
    maxAssetSize: 250000, // 单个资源最大 250KB
    maxEntrypointSize: 250000, // 入口点最大 250KB
    hints: 'warning' // 超出时显示警告
  }
}
```

**Q2: prefetch 和 preload 的区别？**

A: 两者都是资源预加载技术，但使用场景不同：

**Preload（预加载）**：
- **优先级**：高优先级，立即下载
- **使用场景**：当前页面必需的关键资源
- **时机**：页面加载时立即下载
- **示例**：关键 CSS、字体文件

**Prefetch（预获取）**：
- **优先级**：低优先级，空闲时下载
- **使用场景**：未来可能需要的资源
- **时机**：浏览器空闲时下载
- **示例**：下一页面的 JS、图片

```javascript
// Webpack 中使用
import(/* webpackPreload: true */ './critical-component')
import(/* webpackPrefetch: true */ './future-component')
```
**Q3: 如何分析打包结果？**

A: 分析打包结果的工具和方法：

1. **webpack-bundle-analyzer**：
```bash
npm install --save-dev webpack-bundle-analyzer

# 生成分析报告
npx webpack-bundle-analyzer dist/main.js

# 或在 webpack 配置中使用
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static', // 生成静态 HTML 文件
      openAnalyzer: false
    })
  ]
}
```

2. **Webpack 内置分析**：
```bash
# 生成统计信息
webpack --profile --json > stats.json

# 上传到官方分析工具
# https://webpack.github.io/analyse/
```

3. **其他分析工具**：
```javascript
// webpack-visualizer-plugin
const Visualizer = require('webpack-visualizer-plugin')

module.exports = {
  plugins: [
    new Visualizer({
      filename: './statistics.html'
    })
  ]
}
```

---

## ⚡ Vite 核心

### 5. Vite 的依赖预构建是什么？

**核心答案**：

Vite 会预构建 node_modules 中的依赖，将 CommonJS/UMD 转换为 ESM。

**原因**：
1. 兼容性：转换 CommonJS 为 ESM
2. 性能：减少模块请求数量
3. 缓存：提高二次启动速度

**代码示例**：

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ['lodash-es'], // 强制预构建
    exclude: ['your-package'], // 排除预构建
    esbuildOptions: {
      target: 'es2020'
    }
  }
}

// 清除缓存
// rm -rf node_modules/.vite
// vite --force
```

**追问点**：

**Q1: 什么时候需要手动配置依赖预构建？**

A: 以下情况需要手动配置：
- **深层依赖**：某些包的依赖没有被自动检测到
- **动态导入**：使用字符串模板的动态导入
- **CommonJS 混合**：ESM 和 CommonJS 混合使用的包
- **性能优化**：强制预构建大型库以提升开发体验
- **排除预构建**：某些包不需要或不能预构建

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: [
      'lodash', // 强制预构建
      'axios > follow-redirects' // 深层依赖
    ],
    exclude: [
      'some-esm-lib', // 排除预构建
      '@my/internal-lib' // 内部包
    ]
  }
}
```

**Q2: 如何调试预构建问题？**

A: 调试预构建问题的方法：

1. **查看预构建日志**：
```bash
vite --debug optimize
```

2. **清除缓存重新构建**：
```bash
rm -rf node_modules/.vite
npm run dev
```

3. **检查预构建结果**：
```javascript
// 查看 node_modules/.vite/deps/ 目录
// 检查生成的 _metadata.json 文件
```

4. **强制重新预构建**：
```javascript
// vite.config.js
export default {
  optimizeDeps: {
    force: true // 强制重新预构建
  }
}
```
**Q3: esbuild 的作用？**

A: esbuild 是 Vite 的核心依赖，提供极快的构建速度：
- **预构建依赖**：将 CommonJS/UMD 模块转换为 ESM 格式
- **TypeScript 转译**：比 tsc 快 10-100 倍的 TypeScript 编译
- **JSX 转换**：支持 React JSX 语法转换
- **代码压缩**：生产环境的 JavaScript 和 CSS 压缩
- **Go 语言编写**：原生性能，比 JavaScript 工具快数倍

```javascript
// vite.config.js
export default {
  esbuild: {
    target: 'es2020', // 编译目标
    jsxFactory: 'h', // 自定义 JSX 工厂函数
    jsxFragment: 'Fragment',
    drop: ['console', 'debugger'] // 生产环境移除
  }
}
```

---

### 6. Vite 的 HMR 如何工作？

**核心答案**：

Vite 利用 ESM 的特性，直接替换更新的模块。

**工作流程**：
1. 文件变化
2. 通过 WebSocket 通知客户端
3. 客户端重新请求更新的模块
4. 执行 HMR 回调

**代码示例**：

```javascript
// 自动 HMR（框架已处理）
// React/Vue 组件自动支持

// 手动 HMR
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console.log('模块已更新')
  })

  import.meta.hot.dispose((data) => {
    // 清理副作用
    data.state = currentState
  })
}
```

**追问点**：

**Q1: 为什么 Vite HMR 更快？**

A: Vite HMR 更快的原因：
- **ESM 原生支持**：浏览器原生支持 ES 模块，无需打包整个应用
- **精确更新**：只更新修改的模块，不影响其他模块
- **依赖图优化**：维护精确的模块依赖图，只更新必要的模块
- **无需重新编译**：开发时不需要重新编译整个应用
- **浏览器缓存**：充分利用浏览器的模块缓存机制

```javascript
// Vite HMR API
if (import.meta.hot) {
  import.meta.hot.accept('./dep.js', (newDep) => {
    // 热更新回调
  })
  
  import.meta.hot.dispose(() => {
    // 清理副作用
  })
}
```

**Q2: 什么情况会全量刷新？**

A: 以下情况 Vite 会触发全量刷新：
- **配置文件修改**：vite.config.js、package.json 等
- **环境变量修改**：.env 文件变化
- **HTML 文件修改**：index.html 等入口文件
- **无法热更新的文件**：某些特殊格式的文件
- **HMR 边界丢失**：模块导出发生变化，无法保持状态
- **错误恢复**：HMR 更新失败时的降级处理

```javascript
// 避免全量刷新的最佳实践
export default function App() {
  // 使用 React Fast Refresh
  return <div>App</div>
}

// 避免在模块顶层使用副作用
if (import.meta.hot) {
  // 在 HMR 回调中处理副作用
}
```
**Q3: 如何处理状态保持？**

A: HMR 状态保持的实现方法：

1. **React Fast Refresh**：
```javascript
// React 组件自动保持状态
function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count} {/* 热更新时状态保持 */}
    </button>
  )
}
```

2. **Vue HMR**：
```vue
<template>
  <div>{{ count }}</div>
</template>

<script setup>
// Vue 3 自动保持响应式状态
const count = ref(0)
</script>
```

3. **手动状态保持**：
```javascript
// 保存状态
if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    data.state = getCurrentState()
  })
  
  import.meta.hot.accept((newModule) => {
    if (data.state) {
      restoreState(data.state)
    }
  })
}
```

---

## 🚀 性能优化

### 7. Webpack 构建速度如何优化？

**核心答案**：

1. **缓存**：持久化缓存
2. **多线程**：thread-loader
3. **缩小范围**：include/exclude
4. **DLL**：预编译依赖（已过时）
5. **升级**：Webpack 5

**代码示例**：

```javascript
module.exports = {
  // 1. 持久化缓存
  cache: {
    type: 'filesystem'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve('src'),
        use: [
          // 2. 多线程
          'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        ]
      }
    ]
  }
}
```

**追问点**：

**Q1: 如何分析构建性能？**

A: 分析 Webpack 构建性能的方法：

1. **内置分析工具**：
```bash
# 生成构建统计信息
webpack --profile --json > stats.json

# 使用 webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer stats.json
```

2. **时间分析插件**：
```javascript
// webpack.config.js
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin()

module.exports = smp.wrap({
  // webpack 配置
})
```

3. **构建进度监控**：
```javascript
const ProgressPlugin = require('webpack').ProgressPlugin

module.exports = {
  plugins: [
    new ProgressPlugin((percentage, message, ...args) => {
      console.log(`${Math.round(percentage * 100)}%`, message, ...args)
    })
  ]
}
```

**Q2: externals 的作用？**

A: externals 用于排除某些依赖不被打包，而是在运行时从外部获取：

```javascript
// webpack.config.js
module.exports = {
  externals: {
    'react': 'React', // 从全局变量 React 获取
    'lodash': '_', // 从全局变量 _ 获取
    'jquery': 'jQuery'
  }
}

// 或者使用函数形式
externals: [
  function(context, request, callback) {
    if (/^@my\//.test(request)) {
      return callback(null, 'commonjs ' + request)
    }
    callback()
  }
]
```

**使用场景**：
- **CDN 加载**：从 CDN 加载大型库（React、Vue）
- **减少包体积**：排除不需要打包的依赖
- **微前端**：共享依赖，避免重复打包
**Q3: 如何优化大型项目？**

A: 大型项目的构建优化策略：

1. **模块联邦（Module Federation）**：
```javascript
// webpack.config.js
const ModuleFederationPlugin = require('@module-federation/webpack')

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        mfe1: 'mfe1@http://localhost:3001/remoteEntry.js',
        mfe2: 'mfe2@http://localhost:3002/remoteEntry.js'
      }
    })
  ]
}
```

2. **增量构建**：
```javascript
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename] // 配置文件变化时重新构建
    }
  }
}
```

3. **并行构建**：
```javascript
// 使用 thread-loader
module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      use: [
        'thread-loader', // 多线程处理
        'babel-loader'
      ]
    }]
  }
}
```

4. **构建分析和监控**：
```javascript
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin()

module.exports = smp.wrap({
  // webpack 配置
})
```

---

### 8. 如何减小打包体积？

**核心答案**：

1. **Tree Shaking**：移除未使用代码
2. **代码分割**：按需加载
3. **压缩**：Terser/esbuild
4. **分析**：webpack-bundle-analyzer
5. **优化依赖**：替换大型库

**代码示例**：

```javascript
// 1. Tree Shaking
import { debounce } from 'lodash-es' // ✅ 只打包 debounce
// import _ from 'lodash' // ❌ 打包整个 lodash

// 2. 代码分割
const Chart = lazy(() => import('./Chart'))

// 3. 压缩配置
module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  }
}
```

**追问点**：

**Q1: gzip 和 brotli 的区别？**

A: 两者都是压缩算法，但特点不同：

**Gzip**：
- **兼容性**：所有浏览器都支持
- **压缩率**：中等（通常 70-80% 压缩率）
- **压缩速度**：快
- **使用场景**：通用选择，兼容性最好

**Brotli**：
- **兼容性**：现代浏览器支持（IE 不支持）
- **压缩率**：更高（比 gzip 高 15-25%）
- **压缩速度**：稍慢
- **使用场景**：现代应用，追求更小体积

```javascript
// webpack.config.js
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = {
  plugins: [
    // Gzip 压缩
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192, // 只压缩大于 8KB 的文件
      minRatio: 0.8 // 只保留压缩率小于 80% 的文件
    }),
    
    // Brotli 压缩
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: { level: 11 },
      threshold: 8192,
      minRatio: 0.8
    })
  ]
}
```

**Q2: 如何优化图片资源？**

A: 图片优化的多种方法：

1. **格式选择**：
```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [{
      test: /\.(png|jpe?g|gif)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8192, // 小于 8KB 转 base64
          name: 'images/[name].[hash:8].[ext]'
        }
      }]
    }]
  }
}
```

2. **图片压缩**：
```javascript
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')

module.exports = {
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['imagemin-mozjpeg', { quality: 80 }],
              ['imagemin-pngquant', { quality: [0.6, 0.8] }]
            ]
          }
        }
      })
    ]
  }
}
```

3. **响应式图片**：
```javascript
// 使用 responsive-loader
{
  test: /\.(png|jpe?g)$/,
  use: {
    loader: 'responsive-loader',
    options: {
      sizes: [300, 600, 1200],
      placeholder: true,
      quality: 80
    }
  }
}
```
**Q3: CDN 的使用策略？**

A: CDN 在构建工具中的使用策略：

1. **静态资源 CDN**：
```javascript
// webpack.config.js
module.exports = {
  output: {
    publicPath: process.env.NODE_ENV === 'production' 
      ? 'https://cdn.example.com/assets/' 
      : '/'
  }
}
```

2. **第三方库 CDN**：
```javascript
// webpack.config.js
module.exports = {
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'lodash': '_'
  }
}

// HTML 中引入 CDN
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
```

3. **动态 CDN 切换**：
```javascript
// 根据环境动态选择 CDN
const getCDNUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://cdn.example.com'
  }
  return process.env.DEV_CDN || 'http://localhost:8080'
}

module.exports = {
  output: {
    publicPath: getCDNUrl() + '/assets/'
  }
}
```

4. **CDN 回退策略**：
```html
<!-- CDN 加载失败时的回退 -->
<script>
window.React || document.write('<script src="/fallback/react.js"><\/script>')
</script>
```

---

## 💼 实战场景

### 9. 如何配置多环境？

**核心答案**：

使用环境变量和不同的配置文件。

**代码示例**：

```javascript
// Webpack
// webpack.dev.js
module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map'
})

// webpack.prod.js
module.exports = merge(common, {
  mode: 'production',
  devtool: 'hidden-source-map'
})

// Vite
// .env.development
VITE_API_URL=http://localhost:8080

// .env.production
VITE_API_URL=https://api.production.com

// 使用
const apiUrl = import.meta.env.VITE_API_URL
```

**追问点**：

**Q1: 如何管理敏感信息？**

A: 管理敏感信息的最佳实践：

1. **环境变量**：
```javascript
// webpack.config.js
const webpack = require('webpack')

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
}

// .env 文件
API_KEY=your-secret-key
DATABASE_URL=your-database-url

// .env.example 文件（提交到 git）
API_KEY=your-api-key-here
DATABASE_URL=your-database-url-here
```

2. **分环境配置**：
```javascript
// config/development.js
module.exports = {
  apiUrl: 'http://localhost:3000',
  debug: true
}

// config/production.js
module.exports = {
  apiUrl: 'https://api.example.com',
  debug: false
}

// webpack.config.js
const config = require(`./config/${process.env.NODE_ENV}`)
```

3. **运行时配置**：
```javascript
// 通过接口获取配置，避免硬编码
fetch('/api/config').then(res => res.json()).then(config => {
  // 使用配置
})
```

**Q2: 如何实现灰度发布？**

A: 灰度发布的实现方式：

1. **多版本构建**：
```javascript
// webpack.config.js
module.exports = (env) => ({
  output: {
    filename: env.version === 'beta' 
      ? '[name].beta.[contenthash].js'
      : '[name].[contenthash].js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.VERSION': JSON.stringify(env.version || 'stable')
    })
  ]
})

// 构建命令
// npm run build -- --env version=beta
// npm run build -- --env version=stable
```

2. **特性开关**：
```javascript
// feature-flags.js
export const FEATURES = {
  NEW_UI: process.env.FEATURE_NEW_UI === 'true',
  BETA_API: process.env.FEATURE_BETA_API === 'true'
}

// 组件中使用
import { FEATURES } from './feature-flags'

function App() {
  return (
    <div>
      {FEATURES.NEW_UI ? <NewUI /> : <OldUI />}
    </div>
  )
}
```

3. **CDN 分流**：
```javascript
// 根据用户标识加载不同版本
const userGroup = getUserGroup() // 'beta' | 'stable'
const scriptSrc = userGroup === 'beta' 
  ? '/assets/app.beta.js'
  : '/assets/app.js'

loadScript(scriptSrc)
```
**Q3: CI/CD 如何集成？**

A: 构建工具与 CI/CD 的集成方案：

1. **GitHub Actions 集成**：
```yaml
# .github/workflows/build.yml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
          API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy
        run: npm run deploy
```

2. **多环境构建**：
```javascript
// webpack.config.js
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'
  const environment = env.ENVIRONMENT || 'development'
  
  return {
    mode: argv.mode,
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(argv.mode),
        'process.env.ENVIRONMENT': JSON.stringify(environment)
      })
    ]
  }
}

// package.json
{
  "scripts": {
    "build:dev": "webpack --mode=development --env ENVIRONMENT=development",
    "build:staging": "webpack --mode=production --env ENVIRONMENT=staging",
    "build:prod": "webpack --mode=production --env ENVIRONMENT=production"
  }
}
```

3. **构建缓存优化**：
```yaml
# GitHub Actions 缓存
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

- name: Cache webpack build
  uses: actions/cache@v3
  with:
    path: node_modules/.cache
    key: ${{ runner.os }}-webpack-${{ hashFiles('webpack.config.js') }}
```

---

### 10. 如何处理兼容性问题？

**核心答案**：

使用 Babel 转译和 Polyfill。

**代码示例**：

```javascript
// Webpack + Babel
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: '> 0.25%, not dead',
                useBuiltIns: 'usage',
                corejs: 3
              }]
            ]
          }
        }
      }
    ]
  }
}

// Vite + Legacy
import legacy from '@vitejs/plugin-legacy'

export default {
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
}
```

**追问点**：

**Q1: browserslist 如何配置？**

A: browserslist 用于定义目标浏览器，影响 Babel、Autoprefixer 等工具的行为：

1. **配置方式**：
```json
// package.json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "not ie <= 11"
  ]
}

// 或 .browserslistrc 文件
> 1%
last 2 versions
not dead
not ie <= 11

# 生产环境
[production]
> 1%
last 2 versions
not dead

# 开发环境
[development]
last 1 chrome version
last 1 firefox version
last 1 safari version
```

2. **常用查询语句**：
```javascript
// 市场份额
"> 1%" // 全球使用率 > 1%
"> 5% in CN" // 中国使用率 > 5%

// 版本范围
"last 2 versions" // 每个浏览器的最后 2 个版本
"last 2 Chrome versions" // Chrome 最后 2 个版本

// 特定浏览器
"Chrome >= 60" // Chrome 60 及以上
"iOS >= 10" // iOS Safari 10 及以上

// 排除条件
"not dead" // 排除官方不再支持的浏览器
"not ie <= 11" // 排除 IE 11 及以下
```

**Q2: Polyfill 的按需加载？**

A: 按需加载 Polyfill 的方法：

1. **@babel/preset-env 自动按需**：
```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage', // 按需引入
      corejs: 3, // core-js 版本
      targets: {
        browsers: ['> 1%', 'last 2 versions']
      }
    }]
  ]
}
```

2. **动态 Polyfill 服务**：
```html
<!-- polyfill.io 服务 -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6,es2017,es2018"></script>

<!-- 或者条件加载 -->
<script>
if (!window.Promise) {
  document.write('<script src="/polyfills/promise.js"><\/script>')
}
</script>
```

3. **Webpack 动态导入**：
```javascript
// 检测特性支持情况
async function loadPolyfills() {
  const polyfills = []
  
  if (!window.fetch) {
    polyfills.push(import('whatwg-fetch'))
  }
  
  if (!window.IntersectionObserver) {
    polyfills.push(import('intersection-observer'))
  }
  
  await Promise.all(polyfills)
}

// 应用启动前加载
loadPolyfills().then(() => {
  // 启动应用
  import('./app').then(({ default: App }) => {
    new App()
  })
})
```
**Q3: 如何测试兼容性？**

A: 兼容性测试的方法和工具：

1. **自动化测试**：
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
}

// setupTests.js
import 'core-js/stable'
import 'regenerator-runtime/runtime'

// 模拟不支持的 API
if (!window.IntersectionObserver) {
  window.IntersectionObserver = jest.fn()
}
```

2. **Browserslist 验证**：
```bash
# 查看目标浏览器列表
npx browserslist

# 查看特定查询的结果
npx browserslist "> 1%, last 2 versions"

# 检查特定功能支持情况
npx browserslist --coverage
```

3. **Polyfill 测试**：
```javascript
// polyfill-test.js
const features = [
  'Promise',
  'fetch',
  'IntersectionObserver',
  'ResizeObserver'
]

features.forEach(feature => {
  if (!(feature in window)) {
    console.warn(`${feature} not supported, loading polyfill`)
    // 动态加载 polyfill
  }
})
```

4. **跨浏览器测试**：
```javascript
// playwright.config.js
module.exports = {
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 12'] } }
  ]
}
```

---

## 📚 参考资源

- [Webpack 官方文档](https://webpack.js.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Rollup 官方文档](https://rollupjs.org/)

---

**最后更新**: 2025-02
