# Vite 配置与优化进阶指南

> Vite 深度配置、性能优化与最佳实践 | 更新时间：2025-02

## 目录

- [核心配置](#核心配置)
- [性能优化](#性能优化)
- [插件开发](#插件开发)
- [生产构建优化](#生产构建优化)
- [常见问题](#常见问题)

---

## 核心配置

### 1. 基础配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  // 项目根目录
  root: process.cwd(),
  
  // 开发服务器配置
  server: {
    host: '0.0.0.0', // 监听所有地址
    port: 3000,
    open: true, // 自动打开浏览器
    cors: true, // 允许跨域
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    
    // HMR 配置
    hmr: {
      overlay: true // 错误覆盖层
    }
  },
  
  // 预览服务器配置
  preview: {
    port: 4173,
    host: '0.0.0.0'
  },
  
  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@assets': path.resolve(__dirname, 'src/assets')
    },
    // 导入时想要省略的扩展名列表
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  
  // CSS 配置
  css: {
    // CSS 预处理器配置
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      },
      less: {
        modifyVars: {
          'primary-color': '#1890ff'
        },
        javascriptEnabled: true
      }
    },
    
    // CSS Modules 配置
    modules: {
      localsConvention: 'camelCase',
      scopeBehaviour: 'local',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    
    // PostCSS 配置
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('postcss-preset-env')({
          stage: 3,
          features: {
            'nesting-rules': true
          }
        })
      ]
    }
  },
  
  // 插件配置
  plugins: [
    vue()
  ],
  
  // 构建配置
  build: {
    target: 'es2015',
    outDir: 'dist',
    a
       assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 删除 console
        drop_debugger: true // 删除 debugger
      }
    },
    
    // 分块大小警告限制
    chunkSizeWarningLimit: 1000
  },
  
  // 依赖优化
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: ['your-local-package']
  }
})
```

### 2. 环境变量配置

```bash
# .env
VITE_APP_TITLE=My App

# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_ENV=development

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_APP_ENV=production
```

```typescript
// 使用环境变量
console.log(import.meta.env.VITE_API_BASE_URL)
console.log(import.meta.env.MODE) // 'development' | 'production'
console.log(import.meta.env.DEV) // boolean
console.log(import.meta.env.PROD) // boolean

// 类型声明
// env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## 性能优化

### 1. 依赖预构建优化

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    // 强制预构建
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'lodash-es'
    ],
    
    // 排除预构建
    exclude: [
      'your-local-package'
    ],
    
    // 自定义 esbuild 配置
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'top-level-await': true
      }
    }
  }
})
```

### 2. 代码分割优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 node_modules 中的代码单独打包
          if (id.includes('node_modules')) {
            // 提取大型库
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            if (id.includes('echarts')) {
              return 'echarts'
            }
            if (id.includes('@vue')) {
              return 'vue-vendor'
            }
            // 其他 node_modules 代码
            return 'vendor'
          }
          
          // 按路由分割
          if (id.includes('src/views')) {
            const match = /src\/views\/(.+)\//.exec(id)
            if (match) {
              return `view-${match[1]}`
            }
          }
        }
      }
    }
  }
})
```

### 3. 图片优化

```typescript
// vite.config.ts
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

### 4. Gzip 压缩

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 大于 10KB 才压缩
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false
    })
  ]
})
```

### 5. CDN 加速

```typescript
// vite.config.ts
import { Plugin as importToCDN } from 'vite-plugin-cdn-import'

export default defineConfig({
  plugins: [
    importToCDN({
      modules: [
        {
          name: 'vue',
          var: 'Vue',
          path: 'https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.prod.js'
        },
        {
          name: 'vue-router',
          var: 'VueRouter',
          path: 'https://cdn.jsdelivr.net/npm/vue-router@4.2.4/dist/vue-router.global.prod.js'
        }
      ]
    })
  ]
})
```

### 6. 构建分析

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ]
})
```

---

## 插件开发

### 1. 基础插件结构

```typescript
// my-plugin.ts
import { Plugin } from 'vite'

export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    
    // 应用模式
    apply: 'build', // 'serve' | 'build' | (config, env) => boolean
    
    // 配置解析前调用
    config(config, env) {
      return {
        // 返回部分配置（会与现有配置合并）
      }
    },
    
    // 配置解析后调用
    configResolved(resolvedConfig) {
      // 存储最终解析的配置
    },
    
    // 配置开发服务器
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 自定义中间件
        next()
      })
    },
    
    // 转换 index.html
    transformIndexHtml(html) {
      return html.replace(
        /<title>(.*?)<\/title>/,
        `<title>My App</title>`
      )
    },
    
    // 自定义模块解析
    resolveId(source) {
      if (source === 'virtual-module') {
        return source
      }
    },
    
    // 加载自定义模块
    load(id) {
      if (id === 'virtual-module') {
        return 'export default "This is virtual!"'
      }
    },
    
    // 转换模块代码
    transform(code, id) {
      if (id.endsWith('.vue')) {
        // 转换 Vue 文件
        return {
          code: transformedCode,
          map: null
        }
      }
    },
    
    // 构建结束时调用
    buildEnd() {
      // 清理工作
    }
  }
}
```

### 2. 实战：自动导入插件

```typescript
// auto-import-plugin.ts
import { Plugin } from 'vite'
import MagicString from 'magic-string'

export default function autoImportPlugin(): Plugin {
  const imports = new Map([
    ['ref', 'vue'],
    ['reactive', 'vue'],
    ['computed', 'vue'],
    ['watch', 'vue']
  ])

  return {
    name: 'auto-import',
    
    transform(code, id) {
      if (!id.endsWith('.vue') && !id.endsWith('.ts')) {
        return null
      }

      const s = new MagicString(code)
      const usedImports = new Set<string>()

      // 检测使用的 API
      imports.forEach((source, name) => {
        const regex = new RegExp(`\\b${name}\\b`, 'g')
        if (regex.test(code)) {
          usedImports.add(name)
        }
      })

      // 生成导入语句
      if (usedImports.size > 0) {
        const importStatement = `import { ${Array.from(usedImports).join(', ')} } from 'vue';\n`
        s.prepend(importStatement)
      }

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      }
    }
  }
}
```

### 3. 实战：Markdown 插件

```typescript
// markdown-plugin.ts
import { Plugin } from 'vite'
import MarkdownIt from 'markdown-it'

export default function markdownPlugin(): Plugin {
  const md = new MarkdownIt()

  return {
    name: 'markdown',
    
    // 处理 .md 文件
    transform(code, id) {
      if (!id.endsWith('.md')) {
        return null
      }

      const html = md.render(code)
      
      return {
        code: `export default ${JSON.stringify(html)}`,
        map: null
      }
    }
  }
}

// 使用
import content from './README.md'
console.log(content) // HTML 字符串
```

---

## 生产构建优化

### 1. 完整的生产配置

```typescript
// vite.config.prod.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  mode: 'production',
  
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
    
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus'],
          'utils': ['lodash-es', 'dayjs', 'axios']
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]
          
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'media'
          } else if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'img'
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'fonts'
          }
          
          return `${extType}/[name]-[hash].[ext]`
        }
      }
    },
    
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      },
      format: {
        comments: false
      }
    },
    
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false // 禁用 gzip 压缩大小报告
  },
  
  plugins: [
    vue(),
    
    // Gzip 压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
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
    }),
    
    // 图片压缩
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9], speed: 4 }
    }),
    
    // 构建分析
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ]
})
```

### 2. 多页面应用配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        mobile: resolve(__dirname, 'mobile/index.html')
      }
    }
  }
})
```

### 3. Library 模式

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      fileName: (format) => `my-lib.${format}.js`,
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

---

## 常见问题

### 1. 解决 CommonJS 依赖问题

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['problematic-package']
  },
  
  build: {
    commonjsOptions: {
      include: [/problematic-package/, /node_modules/]
    }
  }
})
```

### 2. 解决路径别名问题

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'node_modules')
    }
  }
})

// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "~/*": ["node_modules/*"]
    }
  }
}
```

### 3. 解决动态导入问题

```typescript
// 使用 import.meta.glob
const modules = import.meta.glob('./modules/*.ts')

// 懒加载
const modules = import.meta.glob('./modules/*.ts', { eager: false })

// 直接导入
const modules = import.meta.glob('./modules/*.ts', { eager: true })

// 自定义导入
const modules = import.meta.glob('./modules/*.ts', {
  import: 'setup',
  eager: true
})
```

### 4. 解决环境变量类型问题

```typescript
// env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 5. 解决 HMR 问题

```typescript
// 接受自身更新
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 更新逻辑
  })
}

// 接受依赖更新
if (import.meta.hot) {
  import.meta.hot.accept('./dep.js', (newDep) => {
    // 更新逻辑
  })
}

// 处理更新失败
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // 清理副作用
  })
}
```

---

## 最佳实践

### 1. 开发环境优化

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    // 预热常用文件
    warmup: {
      clientFiles: [
        './src/components/**/*.vue',
        './src/utils/**/*.ts'
      ]
    }
  },
  
  optimizeDeps: {
    // 强制预构建
    include: ['vue', 'vue-router', 'pinia']
  }
})
```

### 2. 生产环境优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 禁用 CSS 代码分割（如果 CSS 很小）
    cssCodeSplit: false,
    
    // 启用 CSS 压缩
    cssMinify: true,
    
    // 禁用 brotli 压缩大小报告（加快构建）
    reportCompressedSize: false
  }
})
```

### 3. 性能监控

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    {
      name: 'performance-monitor',
      buildStart() {
        this.startTime = Date.now()
      },
      buildEnd() {
        console.log(`Build time: ${Date.now() - this.startTime}ms`)
      }
    }
  ]
})
```

---

## 参考资料

- [Vite 官方文档](https://vitejs.dev/)
- [Rollup 官方文档](https://rollupjs.org/)
- [esbuild 官方文档](https://esbuild.github.io/)
- [Vite 插件开发指南](https://vitejs.dev/guide/api-plugin.html)
