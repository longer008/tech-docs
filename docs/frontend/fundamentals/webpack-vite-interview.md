# 构建工具面试题集 (Webpack/Vite)

> 前端构建工具核心知识点与高频面试题

## A. 面试宝典

### Webpack 基础

#### 1. Webpack 核心概念

```javascript
// webpack.config.js
module.exports = {
  // 入口
  entry: './src/index.js',
  // 或多入口
  entry: {
    main: './src/main.js',
    vendor: './src/vendor.js'
  },

  // 输出
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },

  // 模式
  mode: 'production', // 'development' | 'production' | 'none'

  // Loader：处理非 JS 文件
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource'
      }
    ]
  },

  // 插件：扩展功能
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],

  // 解析
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}
```

| 概念 | 说明 |
|------|------|
| Entry | 入口文件，构建的起点 |
| Output | 输出配置，打包后的文件 |
| Loader | 转换器，处理非 JS 文件 |
| Plugin | 插件，扩展 Webpack 功能 |
| Mode | 模式，决定优化策略 |

---

#### 2. Loader 执行顺序

```javascript
// Loader 从右到左、从下到上执行
module: {
  rules: [
    {
      test: /\.scss$/,
      use: [
        'style-loader',    // 3. 将 CSS 注入 DOM
        'css-loader',      // 2. 处理 CSS 中的 @import 和 url()
        'sass-loader'      // 1. 将 SCSS 编译为 CSS
      ]
    }
  ]
}

// 常用 Loader
// babel-loader     - 转译 ES6+/JSX
// css-loader       - 处理 CSS
// style-loader     - 将 CSS 注入 DOM
// sass-loader      - 编译 SCSS
// postcss-loader   - CSS 后处理
// file-loader      - 处理文件
// url-loader       - 小文件转 base64
// ts-loader        - 编译 TypeScript
// vue-loader       - 处理 Vue 单文件组件
```

---

#### 3. 常用插件

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  plugins: [
    // 生成 HTML 文件
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: { collapseWhitespace: true }
    }),

    // 提取 CSS 到单独文件
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    }),

    // 打包分析
    new BundleAnalyzerPlugin()
  ],

  optimization: {
    minimizer: [
      // JS 压缩
      new TerserPlugin(),
      // CSS 压缩
      new CssMinimizerPlugin()
    ]
  }
}
```

---

#### 4. 代码分割

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all', // 'async' | 'initial' | 'all'
      cacheGroups: {
        // 第三方库
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        // 公共模块
        common: {
          name: 'common',
          minChunks: 2, // 被引用 2 次以上
          chunks: 'all',
          priority: 5
        }
      }
    }
  }
}

// 动态导入
const LazyComponent = () => import('./LazyComponent')

// React 懒加载
const LazyComponent = React.lazy(() => import('./LazyComponent'))

// Vue 异步组件
const AsyncComponent = defineAsyncComponent(() => import('./AsyncComponent.vue'))
```

---

### Vite 基础

#### 5. Vite 核心特性

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 插件
  plugins: [vue()],

  // 开发服务器
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  },

  // 路径别名
  resolve: {
    alias: {
      '@': '/src'
    }
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})
```

**Vite vs Webpack：**
| 特性 | Vite | Webpack |
|------|------|---------|
| 启动速度 | 快（按需编译） | 慢（全量打包） |
| HMR 速度 | 快 | 一般 |
| 开发原理 | 原生 ESM | Bundle |
| 生产构建 | Rollup | 自身 |
| 配置复杂度 | 简单 | 复杂 |
| 生态成熟度 | 发展中 | 成熟 |

---

### 进阶题

#### 6. Webpack 热更新 (HMR) 原理

```
┌─────────┐      ┌─────────────┐      ┌─────────┐
│  编辑器  │──→──│  Webpack    │──→──│  浏览器  │
│         │      │  Dev Server │      │         │
└─────────┘      └──────┬──────┘      └────┬────┘
     │                  │                   │
     │  1. 文件变化     │                   │
     │────────────────→│                   │
     │                  │  2. 增量编译      │
     │                  │──────────────────→│
     │                  │  3. WebSocket 通知│
     │                  │←─────────────────→│
     │                  │  4. 请求更新模块  │
     │                  │←──────────────────│
     │                  │  5. 返回更新代码  │
     │                  │──────────────────→│
     │                  │                   │
     │                  │  6. 模块热替换    │
     │                  │                   │
```

```javascript
// HMR API
if (module.hot) {
  module.hot.accept('./module.js', () => {
    // 模块更新后的处理
  })
}
```

---

#### 7. Tree Shaking 原理

```javascript
// utils.js
export function add(a, b) {
  return a + b
}

export function multiply(a, b) {
  return a * b
}

// main.js
import { add } from './utils' // multiply 不会被打包

console.log(add(1, 2))
```

**条件：**
1. 使用 ES Module（import/export）
2. production 模式
3. 代码无副作用（或配置 sideEffects）

```json
// package.json
{
  "sideEffects": false,
  // 或指定有副作用的文件
  "sideEffects": ["*.css", "*.scss"]
}
```

---

## B. 实战文档

### Webpack 常用配置模板

```javascript
// webpack.config.js (生产环境)
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: { maxSize: 8 * 1024 }
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash:8].css' })
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
}
```

### Vite 常用配置模板

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})
```
