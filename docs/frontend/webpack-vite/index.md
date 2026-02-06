# Webpack & Vite

> 现代前端构建工具完全指南

**更新时间**: 2025-02

## 📋 目录

- [核心概念](#核心概念)
- [Webpack 基础](#webpack-基础)
- [Vite 基础](#vite-基础)
- [构建优化](#构建优化)
- [开发体验](#开发体验)
- [生产构建](#生产构建)
- [最佳实践](#最佳实践)

---

## 🎯 核心概念

### Webpack vs Vite 对比

**Webpack**：
- 成熟的模块打包工具
- 强大的配置能力和插件生态
- 适合复杂项目和定制化需求
- 开发时需要打包，启动较慢

**Vite**：
- 下一代前端构建工具
- 基于原生 ESM 的开发服务器
- 极速的冷启动和热更新
- 生产环境使用 Rollup 打包

**核心差异**：

```javascript
// Webpack - 开发时打包所有模块
// 启动时间：10-30秒（大型项目）
// 热更新：1-3秒

// Vite - 按需编译
// 启动时间：<1秒
// 热更新：<100ms
```

**选择建议**：

| 场景 | 推荐工具 | 原因 |
|------|---------|------|
| 新项目 | Vite | 开发体验好，配置简单 |
| 大型项目 | Webpack | 生态成熟，可定制性强 |
| 库开发 | Rollup/Vite | 输出更小，支持多种格式 |
| 老项目 | Webpack | 迁移成本低 |
| 需要兼容 IE | Webpack | Vite 不支持 IE |

---

## 📦 Webpack 基础

### 核心概念

**Entry（入口）**：

```javascript
// webpack.config.js
module.exports = {
  // 单入口
  entry: './src/index.js',

  // 多入口
  entry: {
    app: './src/app.js',
    admin: './src/admin.js'
  },

  // 动态入口
  entry: () => {
    return {
      app: './src/app.js',
      vendor: ['react', 'react-dom']
    }
  }
}
```

**Output（输出）**：

```javascript
const path = require('path')

module.exports = {
  output: {
    // 输出目录
    path: path.resolve(__dirname, 'dist'),

    // 输出文件名
    filename: '[name].[contenthash:8].js',

    // chunk 文件名
    chunkFilename: '[name].[contenthash:8].chunk.js',

    // 公共路径
    publicPath: '/',

    // 清理输出目录
    clean: true
  }
}
```

**Loader（加载器）**：

```javascript
module.exports = {
  module: {
    rules: [
      // JavaScript/TypeScript
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript'
            ]
          }
        }
      },

      // CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },

      // SCSS/SASS
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },

      // 图片
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 10kb
          }
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]'
        }
      },

      // 字体
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      }
    ]
  }
}
```

**Plugin（插件）**：

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  plugins: [
    // HTML 生成
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),

    // CSS 提取
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css'
    }),

    // 清理输出目录
    new CleanWebpackPlugin(),

    // 环境变量
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.API_URL': JSON.stringify(process.env.API_URL)
    }),

    // 进度条
    new webpack.ProgressPlugin()
  ]
}
```


### 代码分割

**动态导入**：

```javascript
// 动态导入组件
const Home = () => import('./pages/Home')
const About = () => import('./pages/About')

// React 路由懒加载
import { lazy, Suspense } from 'react'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  )
}

// Vue 路由懒加载
const routes = [
  {
    path: '/',
    component: () => import('./pages/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./pages/About.vue')
  }
]
``

          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
          name: 'react',
          priority: 10
        },
        // UI 库
        antd: {
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          name: 'antd',
          priority: 10
        },
        // 公共模块
        common: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
          name: 'common'
        }
      }
    },
    // 运行时代码单独提取
    runtimeChunk: {
      name: 'runtime'
    }
  }
}
```

### Tree Shaking

**启用 Tree Shaking**：

```javascript
// webpack.config.js
module.exports = {
  mode: 'production', // 生产模式自动启用
  optimization: {
    usedExports: true, // 标记未使用的导出
    minimize: true, // 压缩代码
    sideEffects: true // 读取 package.json 的 sideEffects 字段
  }
}

// package.json
{
  "sideEffects": false, // 所有文件都没有副作用
  // 或指定有副作用的文件
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

**编写可 Tree Shaking 的代码**：

```javascript
// ❌ 不利于 Tree Shaking
export default {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b
}

// ✅ 利于 Tree Shaking
export const add = (a, b) => a + b
export const subtract = (a, b) => a - b
export const multiply = (a, b) => a * b

// 使用时只导入需要的函数
import { add } from './math' // 只打包 add 函数
```

---

## ⚡ Vite 基础

### 快速开始

**创建项目**：

```bash
# npm
npm create vite@latest my-app

# yarn
yarn create vite my-app

# pnpm
pnpm create vite my-app

# 指定模板
npm create vite@latest my-app -- --template react
npm create vite@latest my-app -- --template vue
npm create vite@latest my-app -- --template react-ts
npm create vite@latest my-app -- --template vue-ts
```

**基础配置**：

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // 插件
  plugins: [react()],

  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  },

  // 开发服务器
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 构建选项
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['antd']
        }
      }
    }
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    },
    modules: {
      localsConvention: 'camelCase'
    }
  }
})
```

### 依赖预构建

**工作原理**：

Vite 会自动预构建 node_modules 中的依赖，将 CommonJS 或 UMD 转换为 ESM。

```javascript
// vite.config.js
export default defineConfig({
  optimizeDeps: {
    // 强制预构建
    include: ['lodash-es', 'axios'],

    // 排除预构建
    exclude: ['your-local-package'],

    // esbuild 选项
    esbuildOptions: {
      target: 'es2020'
    }
  }
})
```

**手动触发预构建**：

```bash
# 清除缓存并重新预构建
vite --force

# 或删除 node_modules/.vite 目录
rm -rf node_modules/.vite
```

### 环境变量

**定义环境变量**：

```bash
# .env
VITE_APP_TITLE=My App
VITE_API_URL=https://api.example.com

# .env.development
VITE_API_URL=http://localhost:8080

# .env.production
VITE_API_URL=https://api.production.com
```

**使用环境变量**：

```javascript
// 在代码中使用
console.log(import.meta.env.VITE_APP_TITLE)
console.log(import.meta.env.VITE_API_URL)

// 类型定义
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### HMR（热模块替换）

**基础用法**：

```javascript
// 自动 HMR（框架插件已处理）
// React、Vue 等框架的组件会自动支持 HMR

// 手动 HMR
if (import.meta.hot) {
  // 接受自身更新
  import.meta.hot.accept((newModule) => {
    console.log('模块已更新:', newModule)
  })

  // 接受依赖更新
  import.meta.hot.accept('./dependency.js', (newModule) => {
    console.log('依赖已更新:', newModule)
  })

  // 清理副作用
  import.meta.hot.dispose((data) => {
    // 保存状态
    data.state = currentState
  })

  // 使用保存的状态
  if (import.meta.hot.data) {
    currentState = import.meta.hot.data.state
  }
}
```

**自定义 HMR 事件**：

```javascript
// 客户端发送事件
if (import.meta.hot) {
  import.meta.hot.send('my-event', { data: 'hello' })
}

// 服务端监听事件（vite.config.js）
export default defineConfig({
  plugins: [
    {
      name: 'custom-hmr',
      configureServer(server) {
        server.ws.on('my-event', (data, client) => {
          console.log('收到客户端事件:', data)
          // 向所有客户端广播
          server.ws.send('my-event-response', { message: 'received' })
        })
      }
    }
  ]
})
```

---

## 🚀 构建优化

### Webpack 性能优化

**1. 缓存优化**：

```javascript
// webpack.config.js
module.exports = {
  // Webpack 5 持久化缓存
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack_cache'),
    buildDependencies: {
      config: [__filename]
    }
  },

  // Babel 缓存
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            cacheCompression: false
          }
        }
      }
    ]
  }
}
```

**2. 多线程构建**：

```javascript
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: 4 // 线程数
            }
          },
          'babel-loader'
        ]
      }
    ]
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true // 多线程压缩
      })
    ]
  }
}
```

**3. 缩小构建范围**：

```javascript
module.exports = {
  resolve: {
    // 减少解析范围
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],

    // 指定扩展名
    extensions: ['.js', '.jsx', '.json'],

    // 别名
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react': path.resolve(__dirname, 'node_modules/react')
    }
  },

  module: {
    // 不解析的模块
    noParse: /jquery|lodash/,

    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'), // 只处理 src 目录
        exclude: /node_modules/ // 排除 node_modules
      }
    ]
  }
}
```

**4. DLL 插件（已过时，推荐使用 Webpack 5 缓存）**：

```javascript
// webpack.dll.config.js
const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: {
    vendor: ['react', 'react-dom', 'react-router-dom']
  },
  output: {
    path: path.resolve(__dirname, 'dll'),
    filename: '[name].dll.js',
    library: '[name]_library'
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname, 'dll/[name]-manifest.json'),
      name: '[name]_library'
    })
  ]
}

// webpack.config.js
module.exports = {
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require('./dll/vendor-manifest.json')
    })
  ]
}
```

**5. 外部化依赖**：

```javascript
module.exports = {
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'lodash': '_'
  }
}

// 在 HTML 中引入 CDN
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
```

### Vite 性能优化

**1. 依赖预构建优化**：

```javascript
// vite.config.js
export default defineConfig({
  optimizeDeps: {
    // 强制预构建大型依赖
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      'lodash-es'
    ],

    // 排除不需要预构建的包
    exclude: ['your-local-package'],

    // esbuild 配置
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'top-level-await': true
      }
    }
  }
})
```

**2. 代码分割优化**：

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 手动分割 chunk
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 按包名分割
            const packageName = id.split('node_modules/')[1].split('/')[0]
            
            // React 相关
            if (['react', 'react-dom', 'react-router-dom'].includes(packageName)) {
              return 'react-vendor'
            }
            
            // UI 库
            if (packageName === 'antd') {
              return 'antd-vendor'
            }
            
            // 其他第三方库
            return 'vendor'
          }
        },

        // 或使用对象形式
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['antd', '@ant-design/icons'],
          'utils-vendor': ['lodash-es', 'dayjs', 'axios']
        }
      }
    },

    // chunk 大小警告限制
    chunkSizeWarningLimit: 1000
  }
})
```

**3. 图片优化**：

```javascript
import { defineConfig } from 'vite'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false
      },
      optipng: {
        optimizationLevel: 7
      },
      mozjpeg: {
        quality: 80
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox'
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      }
    })
  ]
})
```

**4. Gzip 压缩**：

```javascript
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 10kb 以上才压缩
      algorithm: 'gzip',
      ext: '.gz'
    }),
    // Brotli 压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ]
})
```

---

## 💡 开发体验

### Source Map 配置

**Webpack**：

```javascript
module.exports = {
  // 开发环境
  devtool: 'eval-cheap-module-source-map', // 快速，适合开发

  // 生产环境
  devtool: 'hidden-source-map', // 不暴露源码，用于错误追踪
  // 或
  devtool: false // 不生成 source map
}
```

**Vite**：

```javascript
export default defineConfig({
  build: {
    sourcemap: false, // 生产环境不生成
    // 或
    sourcemap: 'hidden' // 生成但不引用
  }
})
```

### 开发服务器

**Webpack Dev Server**：

```javascript
module.exports = {
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
    
    // 代理
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    },

    // 自定义中间件
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.get('/custom', (req, res) => {
        res.json({ message: 'Hello' })
      })
      return middlewares
    }
  }
}
```

**Vite Dev Server**：

```javascript
export default defineConfig({
  server: {
    port: 3000,
    open: true,
    cors: true,
    
    // 代理
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },

    // HMR 配置
    hmr: {
      overlay: true, // 错误覆盖层
      port: 3000
    }
  }
})
```

---

## 📦 生产构建

### Webpack 生产配置

```javascript
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  mode: 'production',

  optimization: {
    minimize: true,
    minimizer: [
      // JS 压缩
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true, // 移除 console
            drop_debugger: true // 移除 debugger
          }
        }
      }),

      // CSS 压缩
      new CssMinimizerPlugin()
    ],

    // 代码分割
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          name: 'vendors'
        },
        common: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
          name: 'common'
        }
      }
    },

    // 运行时代码
    runtimeChunk: 'single'
  },

  plugins: [
    // 打包分析
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
}
```

### Vite 生产配置

```javascript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  build: {
    // 输出目录
    outDir: 'dist',
    assetsDir: 'assets',

    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },

    // Rollup 配置
    rollupOptions: {
      output: {
        // 静态资源分类
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]
          
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            extType = 'images'
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            extType = 'fonts'
          }
          
          return `${extType}/[name]-[hash][extname]`
        }
      },

      plugins: [
        // 打包分析
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true
        })
      ]
    },

    // 警告限制
    chunkSizeWarningLimit: 1000,

    // 禁用 CSS 代码分割
    cssCodeSplit: true
  }
})
```

---

## 💡 最佳实践

### 1. 合理的代码分割策略

```javascript
// ❌ 避免：过度分割
// 导致请求过多，反而影响性能

// ✅ 推荐：按路由分割
const routes = [
  {
    path: '/',
    component: () => import('./pages/Home')
  },
  {
    path: '/about',
    component: () => import('./pages/About')
  }
]

// ✅ 推荐：按功能模块分割
// 大型组件或库按需加载
const Chart = lazy(() => import('./components/Chart'))
const Editor = lazy(() => import('./components/Editor'))
```

### 2. 环境变量管理

```javascript
// ✅ 推荐：使用 .env 文件
// .env.development
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=My App (Dev)

// .env.production
VITE_API_URL=https://api.production.com
VITE_APP_TITLE=My App

// 使用
const apiUrl = import.meta.env.VITE_API_URL

// ❌ 避免：硬编码环境变量
const apiUrl = 'http://localhost:8080' // 不灵活
```

### 3. 资源优化

```javascript
// ✅ 推荐：图片懒加载
import { lazy } from 'react'

const LazyImage = ({ src, alt }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy" // 原生懒加载
    />
  )
}

// ✅ 推荐：使用 WebP 格式
// vite.config.js
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    viteImagemin({
      webp: {
        quality: 75
      }
    })
  ]
})

// ✅ 推荐：字体优化
// 使用 font-display: swap
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/myfont.woff2') format('woff2');
  font-display: swap; // 避免字体加载阻塞
}
```

### 4. 缓存策略

```javascript
// Webpack - 文件名哈希
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  }
}

// Vite - 默认使用哈希
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})

// Nginx 缓存配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

### 5. 性能监控

```javascript
// 使用 webpack-bundle-analyzer
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })
  ]
}

// 使用 rollup-plugin-visualizer
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true
    })
  ]
})

// 性能预算
// webpack.config.js
module.exports = {
  performance: {
    maxAssetSize: 250000, // 250kb
    maxEntrypointSize: 250000,
    hints: 'warning'
  }
}
```

### 6. 开发体验优化

```javascript
// ✅ 推荐：使用 TypeScript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}

// ✅ 推荐：使用 ESLint 和 Prettier
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn'
  }
}

// ✅ 推荐：使用 Git Hooks
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### 7. 错误处理

```javascript
// ✅ 推荐：错误边界
import { Component } from 'react'

class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo)
    // 上报错误到监控平台
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}

// ✅ 推荐：全局错误处理
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  // 上报错误
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // 上报错误
})
```

### 8. 安全最佳实践

```javascript
// ✅ 推荐：环境变量不暴露敏感信息
// ❌ 避免
VITE_API_KEY=your-secret-key // 会被打包到客户端

// ✅ 正确做法：敏感信息放在服务端
// 客户端只存储公开信息
VITE_API_URL=https://api.example.com

// ✅ 推荐：CSP 配置
// index.html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">

// ✅ 推荐：依赖安全检查
npm audit
npm audit fix
```

---

## 📚 参考资源

### 官方文档

**Webpack**：
- [Webpack 官网](https://webpack.js.org/)
- [Webpack 中文文档](https://webpack.docschina.org/)
- [Webpack 配置参考](https://webpack.js.org/configuration/)
- [Webpack Loaders](https://webpack.js.org/loaders/)
- [Webpack Plugins](https://webpack.js.org/plugins/)

**Vite**：
- [Vite 官网](https://vitejs.dev/)
- [Vite 中文文档](https://cn.vitejs.dev/)
- [Vite 配置参考](https://vitejs.dev/config/)
- [Vite 插件](https://vitejs.dev/plugins/)
- [Awesome Vite](https://github.com/vitejs/awesome-vite)

### 学习资源

**教程**：
- [Webpack 从入门到精通](https://webpack.docschina.org/guides/)
- [Vite 快速上手](https://cn.vitejs.dev/guide/)
- [深入浅出 Webpack](https://webpack.wuhaolin.cn/)

**视频课程**：
- [Webpack 5 完整教程](https://www.bilib
ejs/plugin-react](https://github.com/vitejs/vite-plugin-react) - React 支持
- [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue) - Vue 支持
- [vite-plugin-compression](https://github.com/vbenjs/vite-plugin-compression) - 压缩
- [vite-plugin-imagemin](https://github.com/vbenjs/vite-plugin-imagemin) - 图片优化
- [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) - 打包分析

### 社区资源

**博客文章**：
- [Webpack 性能优化实践](https://juejin.cn/post/6844904071736852487)
- [Vite 原理解析](https://juejin.cn/post/7064853960636989454)
- [从 Webpack 迁移到 Vite](https://juejin.cn/post/7098622735286140935)

**GitHub 仓库**：
- [webpack/webpack](https://github.com/webpack/webpack)
- [vitejs/vite](https://github.com/vitejs/vite)
- [webpack-contrib](https://github.com/webpack-contrib)

---

## 🔧 常见问题

### Webpack 常见问题

**Q1: 构建速度慢怎么办？**

A: 
1. 启用持久化缓存（Webpack 5）
2. 使用 thread-loader 多线程构建
3. 缩小构建范围（include/exclude）
4. 使用 DLL 或 externals
5. 升级到 Webpack 5

**Q2: 打包体积过大怎么办？**

A:
1. 启用 Tree Shaking
2. 代码分割（SplitChunks）
3. 压缩代码（Terser）
4. 移除未使用的依赖
5. 使用 webpack-bundle-analyzer 分析

**Q3: HMR 不生效怎么办？**

A:
1. 检查 devServer.hot 是否开启
2. 确认模块是否正确导出
3. 检查是否有语法错误
4. 清除缓存重新启动

### Vite 常见问题

**Q1: 依赖预构建失败怎么办？**

A:
1. 删除 node_modules/.vite 目录
2. 使用 --force 强制重新预构建
3. 在 optimizeDeps.exclude 中排除问题依赖
4. 检查依赖是否支持 ESM

**Q2: 生产构建失败怎么办？**

A:
1. 检查是否有动态导入语法错误
2. 确认所有依赖都已安装
3. 检查 Rollup 配置是否正确
4. 查看构建日志定位问题

**Q3: 如何兼容旧浏览器？**

A:
```javascript
// vite.config.js
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
})
```

---

**最后更新**: 2025-02
