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
- 什么场景选择 Webpack？
- Vite 如何处理 CommonJS 模块？
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
    usedEx
{
      template: './index.html'
    })
  ]
}
```

**追问点**：
- 如何编写自定义 Loader？
- 如何编写自定义 Plugin？
- Loader 的执行顺序？

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
- 如何控制 chunk 大小？
- prefetch 和 preload 的区别？
- 如何分析打包结果？

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
- 什么时候需要手动配置？
- 如何调试预构建问题？
- esbuild 的作用？

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
- 为什么 Vite HMR 更快？
- 什么情况会全量刷新？
- 如何处理状态保持？

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
- 如何分析构建性能？
- externals 的作用？
- 如何优化大型项目？

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
- gzip 和 brotli 的区别？
- 如何优化图片资源？
- CDN 的使用策略？

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
- 如何管理敏感信息？
- 如何实现灰度发布？
- CI/CD 如何集成？

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
- browserslist 如何配置？
- Polyfill 的按需加载？
- 如何测试兼容性？

---

## 📚 参考资源

- [Webpack 官方文档](https://webpack.js.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Rollup 官方文档](https://rollupjs.org/)

---

**最后更新**: 2025-02
