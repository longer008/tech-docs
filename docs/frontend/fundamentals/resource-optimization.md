# 前端资源优化完全指南

> 更新时间：2025-02

## 目录

[[toc]]

## 什么是资源优化

资源优化是指通过各种技术手段减少资源体积、加快资源加载速度，从而提升网站性能和用户体验。

### 优化目标

- **减少资源体积**：压缩、Tree Shaking、代码分割
- **加快加载速度**：CDN、缓存、预加载
- **提升渲染性能**：懒加载、虚拟滚动、骨架屏
- **优化用户体验**：渐进式加载、离线可用

### 优化指标

```
资源优化指标
├── 体积指标
│   ├── 首屏资源体积 < 200KB
│   ├── 总资源体积 < 2MB
│   └── 单个资源 < 100KB
├── 速度指标
│   ├── FCP < 1.8s
│   ├── LCP < 2.5s
│   └── TTI < 3.8s
└── 数量指标
    ├── HTTP 请求 < 50
    ├── 关键资源 < 10
    └── 第三方脚本 < 5
```

## 图片优化

### 1. 图片格式选择

```javascript
// 图片格式对比
const imageFormats = {
  JPEG: {
    优点: ['压缩率高', '适合照片'],
    缺点: ['有损压缩', '不支持透明'],
    适用: '照片、复杂图像',
    体积: '中等'
  },
  PNG: {
    优点: ['无损压缩', '支持透明'],
    缺点: ['体积较大'],
    适用: 'Logo、图标、需要透明的图片',
    体积: '较大'
  },
  WebP: {
    优点: ['压缩率高', '支持透明', '支持动画'],
    缺点: ['兼容性问题'],
    适用: '现代浏览器',
    体积: '小（比 JPEG 小 25-35%）'
  },
  AVIF: {
    优点: ['压缩率最高', '支持透明'],
    缺点: ['兼容性差', '编码慢'],
    适用: '最新浏览器',
    体积: '最小（比 WebP 小 20%）'
  },
  SVG: {
    优点: ['矢量图', '体积小', '可缩放'],
    缺点: ['不适合复杂图像'],
    适用: '图标、Logo、简单图形',
    体积: '很小'
  }
}
```

### 2. 响应式图片

```html
<!-- 使用 srcset 提供多种尺寸 -->
<img
  src="image-800.jpg"
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="响应式图片"
/>

<!-- 使用 picture 元素提供多种格式 -->
<picture>
  <source srcset="image.avif" type="image/avif" />
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="图片" />
</picture>

<!-- 结合使用 -->
<picture>
  <source
    srcset="image-400.avif 400w, image-800.avif 800w"
    type="image/avif"
    sizes="(max-width: 600px) 400px, 800px"
  />
  <source
    srcset="image-400.webp 400w, image-800.webp 800w"
    type="image/webp"
    sizes="(max-width: 600px) 400px, 800px"
  />
  <img
    src="image-800.jpg"
    srcset="image-400.jpg 400w, image-800.jpg 800w"
    sizes="(max-width: 600px) 400px, 800px"
    alt="图片"
  />
</picture>
```

### 3. 图片懒加载

```javascript
// 原生懒加载
<img src="image.jpg" loading="lazy" alt="懒加载图片" />

// Intersection Observer 实现
class LazyLoad {
  constructor(selector) {
    this.images = document.querySelectorAll(selector)
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '50px', // 提前 50px 开始加载
        threshold: 0.01
      }
    )
    
    this.init()
  }
  
  init() {
    this.images.forEach(img => {
      this.observer.observe(img)
    })
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        const src = img.dataset.src
        
        if (src) {
          img.src = src
          img.removeAttribute('data-src')
          this.observer.unobserve(img)
        }
      }
    })
  }
}

// 使用
new LazyLoad('img[data-src]')
```

```html
<!-- HTML -->
<img data-src="image.jpg" alt="懒加载图片" />
```

### 4. 图片压缩

```javascript
// 使用 imagemin 压缩图片
import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminWebp from 'imagemin-webp'
import imageminAvif from 'imagemin-avif'

async function compressImages() {
  // 压缩 JPEG
  await imagemin(['images/*.jpg'], {
    destination: 'dist/images',
    plugins: [
      imageminMozjpeg({ quality: 80 })
    ]
  })
  
  // 压缩 PNG
  await imagemin(['images/*.png'], {
    destination: 'dist/images',
    plugins: [
      imageminPngquant({ quality: [0.6, 0.8] })
    ]
  })
  
  // 转换为 WebP
  await imagemin(['images/*.{jpg,png}'], {
    destination: 'dist/images',
    plugins: [
      imageminWebp({ quality: 80 })
    ]
  })
  
  // 转换为 AVIF
  await imagemin(['images/*.{jpg,png}'], {
    destination: 'dist/images',
    plugins: [
      imageminAvif({ quality: 80 })
    ]
  })
}
```

### 5. 图片 CDN 优化

```javascript
// 使用图片 CDN 服务（如阿里云 OSS、七牛云）
function getOptimizedImageUrl(url, options = {}) {
  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options
  
  const params = []
  
  if (width) params.push(`w_${width}`)
  if (height) params.push(`h_${height}`)
  params.push(`q_${quality}`)
  params.push(`f_${format}`)
  
  return `${url}?x-oss-process=image/resize,${params.join(',')}`
}

// 使用
const imageUrl = getOptimizedImageUrl('https://cdn.example.com/image.jpg', {
  width: 800,
  quality: 80,
  format: 'webp'
})
```

### 6. Base64 内联小图片

```javascript
// Webpack 配置
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8KB 以下的图片转为 Base64
          }
        }
      }
    ]
  }
}

// 手动转换
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

## 字体优化

### 1. 字体格式选择

```css
/* 现代浏览器优先使用 WOFF2 */
@font-face {
  font-family: 'MyFont';
  src: url('font.woff2') format('woff2'),
       url('font.woff') format('woff'),
       url('font.ttf') format('truetype');
  font-display: swap; /* 重要：避免 FOIT */
}
```

### 2. 字体子集化

```javascript
// 使用 fontmin 提取子集
import Fontmin from 'fontmin'

const fontmin = new Fontmin()
  .src('fonts/*.ttf')
  .use(Fontmin.glyph({
    text: '你好世界Hello World', // 只保留这些字符
    hinting: false
  }))
  .use(Fontmin.ttf2woff2())
  .dest('dist/fonts')

fontmin.run((err, files) => {
  if (err) throw err
  console.log('字体子集化完成')
})
```

### 3. font-display 策略

```css
@font-face {
  font-family: 'MyFont';
  src: url('font.woff2') format('woff2');
  
  /* font-display 选项 */
  font-display: auto;    /* 浏览器默认行为 */
  font-display: block;   /* 短暂阻塞，然后交换（FOIT） */
  font-display: swap;    /* 立即显示后备字体，然后交换（推荐） */
  font-display: fallback; /* 极短阻塞，然后交换，超时则不交换 */
  font-display: optional; /* 极短阻塞，网络好则交换，否则不交换 */
}
```

### 4. 字体预加载

```html
<!-- 预加载关键字体 -->
<link
  rel="preload"
  href="font.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

### 5. 可变字体

```css
/* 使用可变字体减少文件数量 */
@font-face {
  font-family: 'Variable Font';
  src: url('variable-font.woff2') format('woff2-variations');
  font-weight: 100 900; /* 支持 100-900 的所有字重 */
  font-stretch: 75% 125%; /* 支持不同宽度 */
}

.text {
  font-family: 'Variable Font';
  font-weight: 350; /* 任意字重 */
  font-stretch: 110%; /* 任意宽度 */
}
```

## 代码分割

### 1. 路由级代码分割

```javascript
// Vue Router
const routes = [
  {
    path: '/home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
]

// React Router
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

### 2. 组件级代码分割

```javascript
// Vue 3
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
)

// React
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./components/HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### 3. 第三方库代码分割

```javascript
// Webpack 配置
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 提取 node_modules 中的代码
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        // 提取公共代码
        common: {
          minChunks: 2,
          name: 'common',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
}
```

### 4. 动态导入

```javascript
// 条件导入
async function loadChart() {
  if (needChart) {
    const { Chart } = await import('chart.js')
    return new Chart(ctx, config)
  }
}

// 事件触发导入
button.addEventListener('click', async () => {
  const { default: Modal } = await import('./Modal.js')
  new Modal().show()
})

// Webpack Magic Comments
const module = await import(
  /* webpackChunkName: "my-chunk" */
  /* webpackPrefetch: true */
  './module.js'
)
```

## Tree Shaking

### 1. ES Modules

```javascript
// ✅ 好的做法：使用 ES Modules
import { debounce } from 'lodash-es'

// ❌ 不好的做法：使用 CommonJS
const _ = require('lodash')
```

### 2. sideEffects 配置

```json
// package.json
{
  "name": "my-library",
  "sideEffects": false, // 所有文件都没有副作用
  
  // 或者指定有副作用的文件
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

### 3. 避免副作用

```javascript
// ❌ 有副作用（会被保留）
console.log('Module loaded')
window.myGlobal = 'value'

export function myFunction() {
  // ...
}

// ✅ 无副作用（可以被 Tree Shaking）
export function myFunction() {
  // ...
}
```

### 4. 使用 terser 移除死代码

```javascript
// Webpack 配置
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            dead_code: true,
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log']
          }
        }
      })
    ]
  }
}
```

## 压缩优化

### 1. JavaScript 压缩

```javascript
// Terser 配置
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true, // 多进程并行
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log'],
            passes: 2 // 多次压缩
          },
          mangle: {
            safari10: true // 修复 Safari 10 bug
          },
          format: {
            comments: false // 移除注释
          }
        },
        extractComments: false
      })
    ]
  }
}
```

### 2. CSS 压缩

```javascript
// cssnano 配置
const cssnano = require('cssnano')

module.exports = {
  plugins: [
    cssnano({
      preset: ['default', {
        discardComments: {
          removeAll: true
        },
        normalizeWhitespace: true,
        colormin: true,
        minifyFontValues: true,
        minifySelectors: true
      }]
    })
  ]
}
```

### 3. HTML 压缩

```javascript
// html-minifier-terser 配置
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true
      }
    })
  ]
}
```

### 4. Gzip/Brotli 压缩

```javascript
// Webpack 配置
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = {
  plugins: [
    // Gzip 压缩
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240, // 只压缩大于 10KB 的文件
      minRatio: 0.8
    }),
    
    // Brotli 压缩（更高压缩率）
    new CompressionPlugin({
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
      compressionOptions: {
        level: 11 // 压缩级别 0-11
      }
    })
  ]
}
```

```nginx
# Nginx 配置
http {
  # Gzip 配置
  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_comp_level 6;
  gzip_types text/plain text/css text/xml text/javascript 
             application/json application/javascript application/xml+rss;
  
  # Brotli 配置
  brotli on;
  brotli_comp_level 6;
  brotli_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;
}
```


## 预加载策略

### 1. preload - 预加载关键资源

```html
<!-- 预加载字体 -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin />

<!-- 预加载关键 CSS -->
<link rel="preload" href="critical.css" as="style" />

<!-- 预加载关键 JavaScript -->
<link rel="preload" href="app.js" as="script" />

<!-- 预加载图片 -->
<link rel="preload" href="hero.jpg" as="image" />
```

```javascript
// 动态预加载
function preloadResource(url, as) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = url
  document.head.appendChild(link)
}

preloadResource('/api/data.json', 'fetch')
```

### 2. prefetch - 预获取未来资源

```html
<!-- 预获取下一页资源 -->
<link rel="prefetch" href="/next-page.html" />
<link rel="prefetch" href="/next-page.js" />
<link rel="prefetch" href="/next-page.css" />
```

```javascript
// 动态预获取
function prefetchResource(url) {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = url
  document.head.appendChild(link)
}

// 鼠标悬停时预获取
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('mouseenter', () => {
    prefetchResource(link.href)
  })
})
```

### 3. dns-prefetch - DNS 预解析

```html
<!-- 预解析第三方域名 -->
<link rel="dns-prefetch" href="//cdn.example.com" />
<link rel="dns-prefetch" href="//api.example.com" />
<link rel="dns-prefetch" href="//analytics.google.com" />
```

### 4. preconnect - 预连接

```html
<!-- 预连接到关键第三方源 -->
<link rel="preconnect" href="//cdn.example.com" />
<link rel="preconnect" href="//fonts.googleapis.com" crossorigin />
```

### 5. modulepreload - 预加载 ES 模块

```html
<!-- 预加载 ES 模块 -->
<link rel="modulepreload" href="/app.js" />
<link rel="modulepreload" href="/utils.js" />
```

### 6. 智能预加载策略

```javascript
// 基于用户行为的智能预加载
class SmartPrefetch {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.5 // 可见度阈值
    this.timeout = options.timeout || 2000 // 悬停时间阈值
    this.prefetched = new Set()
    
    this.init()
  }
  
  init() {
    // 监听链接悬停
    document.addEventListener('mouseover', this.handleMouseOver.bind(this))
    
    // 监听链接进入视口
    this.observeLinks()
  }
  
  handleMouseOver(e) {
    const link = e.target.closest('a')
    if (!link || this.prefetched.has(link.href)) return
    
    // 延迟预获取，避免误触
    clearTimeout(this.hoverTimer)
    this.hoverTimer = setTimeout(() => {
      this.prefetch(link.href)
    }, this.timeout)
  }
  
  observeLinks() {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= this.threshold) {
            const link = entry.target
            this.prefetch(link.href)
          }
        })
      },
      { threshold: this.threshold }
    )
    
    document.querySelectorAll('a[data-prefetch]').forEach(link => {
      observer.observe(link)
    })
  }
  
  prefetch(url) {
    if (this.prefetched.has(url)) return
    
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)
    
    this.prefetched.add(url)
  }
}

// 使用
new SmartPrefetch({
  threshold: 0.5,
  timeout: 1000
})
```

## CDN 优化

### 1. 静态资源 CDN

```javascript
// Webpack 配置
module.exports = {
  output: {
    publicPath: process.env.NODE_ENV === 'production'
      ? 'https://cdn.example.com/'
      : '/'
  }
}

// Vite 配置
export default {
  base: process.env.NODE_ENV === 'production'
    ? 'https://cdn.example.com/'
    : '/'
}
```

### 2. 第三方库 CDN

```html
<!-- 使用公共 CDN -->
<script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>

<!-- Webpack externals 配置 -->
<script>
module.exports = {
  externals: {
    vue: 'Vue',
    react: 'React',
    'react-dom': 'ReactDOM'
  }
}
</script>
```

### 3. CDN 回退策略

```html
<!-- CDN 失败时回退到本地 -->
<script src="https://cdn.example.com/vue.js"></script>
<script>
  window.Vue || document.write('<script src="/local/vue.js"><\/script>')
</script>
```

```javascript
// 动态 CDN 回退
async function loadScript(cdnUrl, localUrl) {
  try {
    await loadScriptFromUrl(cdnUrl)
  } catch (error) {
    console.warn('CDN 加载失败，使用本地资源')
    await loadScriptFromUrl(localUrl)
  }
}

function loadScriptFromUrl(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}
```

### 4. 多 CDN 策略

```javascript
// 多个 CDN 源，自动选择最快的
const cdnSources = [
  'https://cdn1.example.com',
  'https://cdn2.example.com',
  'https://cdn3.example.com'
]

async function getFastestCDN() {
  const promises = cdnSources.map(cdn =>
    fetch(`${cdn}/ping`, { method: 'HEAD' })
      .then(() => cdn)
      .catch(() => null)
  )
  
  return Promise.race(promises.filter(Boolean))
}

// 使用
const fastestCDN = await getFastestCDN()
console.log('最快的 CDN:', fastestCDN)
```

## 缓存策略

### 1. HTTP 缓存

```nginx
# Nginx 配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
  # 强缓存 1 年
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location ~* \.(html)$ {
  # 协商缓存
  expires -1;
  add_header Cache-Control "no-cache";
}
```

```javascript
// Express 配置
const express = require('express')
const app = express()

app.use('/static', express.static('public', {
  maxAge: '1y', // 缓存 1 年
  immutable: true
}))

app.get('/api/*', (req, res) => {
  res.set('Cache-Control', 'no-cache')
  // ...
})
```

### 2. Service Worker 缓存

```javascript
// sw.js
const CACHE_NAME = 'my-app-v1'
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png'
]

// 安装时缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

// 拦截请求，优先使用缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中，返回缓存
        if (response) {
          return response
        }
        
        // 缓存未命中，发起网络请求
        return fetch(event.request).then(response => {
          // 缓存新资源
          if (response.status === 200) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache)
              })
          }
          
          return response
        })
      })
  )
})

// 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
```

### 3. 本地存储缓存

```javascript
// 封装本地存储缓存
class LocalCache {
  constructor(prefix = 'cache_') {
    this.prefix = prefix
  }
  
  set(key, value, ttl = 3600000) { // 默认 1 小时
    const item = {
      value,
      expiry: Date.now() + ttl
    }
    localStorage.setItem(this.prefix + key, JSON.stringify(item))
  }
  
  get(key) {
    const itemStr = localStorage.getItem(this.prefix + key)
    if (!itemStr) return null
    
    const item = JSON.parse(itemStr)
    
    // 检查是否过期
    if (Date.now() > item.expiry) {
      localStorage.removeItem(this.prefix + key)
      return null
    }
    
    return item.value
  }
  
  remove(key) {
    localStorage.removeItem(this.prefix + key)
  }
  
  clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }
}

// 使用
const cache = new LocalCache()

// 缓存 API 响应
async function fetchWithCache(url, ttl) {
  const cached = cache.get(url)
  if (cached) {
    return cached
  }
  
  const response = await fetch(url)
  const data = await response.json()
  
  cache.set(url, data, ttl)
  
  return data
}
```

### 4. 内存缓存

```javascript
// LRU 缓存实现
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return null
    }
    
    // 移到最后（最近使用）
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    
    return value
  }
  
  set(key, value) {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    
    // 如果超出容量，删除最久未使用的
    if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, value)
  }
  
  has(key) {
    return this.cache.has(key)
  }
  
  clear() {
    this.cache.clear()
  }
}

// 使用
const cache = new LRUCache(100)

async function fetchWithMemoryCache(url) {
  if (cache.has(url)) {
    return cache.get(url)
  }
  
  const response = await fetch(url)
  const data = await response.json()
  
  cache.set(url, data)
  
  return data
}
```

## 实战案例

### 1. 图片优化完整方案

```javascript
// 图片优化工具类
class ImageOptimizer {
  constructor(options = {}) {
    this.quality = options.quality || 80
    this.formats = options.formats || ['avif', 'webp', 'jpg']
    this.sizes = options.sizes || [400, 800, 1200]
  }
  
  // 生成响应式图片 HTML
  generateResponsiveImage(src, alt) {
    const picture = document.createElement('picture')
    
    // 为每种格式生成 source
    this.formats.forEach(format => {
      const source = document.createElement('source')
      
      const srcset = this.sizes
        .map(size => `${this.getOptimizedUrl(src, size, format)} ${size}w`)
        .join(', ')
      
      source.srcset = srcset
      source.type = `image/${format}`
      source.sizes = this.generateSizes()
      
      picture.appendChild(source)
    })
    
    // 添加 fallback img
    const img = document.createElement('img')
    img.src = this.getOptimizedUrl(src, 800, 'jpg')
    img.alt = alt
    img.loading = 'lazy'
    
    picture.appendChild(img)
    
    return picture
  }
  
  getOptimizedUrl(src, width, format) {
    return `${src}?w=${width}&q=${this.quality}&f=${format}`
  }
  
  generateSizes() {
    return '(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px'
  }
}

// 使用
const optimizer = new ImageOptimizer({
  quality: 80,
  formats: ['avif', 'webp', 'jpg'],
  sizes: [400, 800, 1200]
})

const picture = optimizer.generateResponsiveImage('/images/hero.jpg', 'Hero Image')
document.body.appendChild(picture)
```

### 2. 资源加载优先级管理

```javascript
// 资源加载优先级管理器
class ResourcePriorityManager {
  constructor() {
    this.queue = {
      critical: [],
      high: [],
      normal: [],
      low: []
    }
    this.loading = new Set()
    this.loaded = new Set()
  }
  
  // 添加资源到队列
  add(url, priority = 'normal', type = 'script') {
    if (this.loaded.has(url) || this.loading.has(url)) {
      return Promise.resolve()
    }
    
    return new Promise((resolve, reject) => {
      this.queue[priority].push({ url, type, resolve, reject })
      this.process()
    })
  }
  
  // 处理队列
  async process() {
    // 按优先级处理
    for (const priority of ['critical', 'high', 'normal', 'low']) {
      while (this.queue[priority].length > 0) {
        const resource = this.queue[priority].shift()
        await this.load(resource)
      }
    }
  }
  
  // 加载资源
  async load({ url, type, resolve, reject }) {
    if (this.loaded.has(url)) {
      resolve()
      return
    }
    
    this.loading.add(url)
    
    try {
      if (type === 'script') {
        await this.loadScript(url)
      } else if (type === 'style') {
        await this.loadStyle(url)
      } else if (type === 'image') {
        await this.loadImage(url)
      }
      
      this.loaded.add(url)
      this.loading.delete(url)
      resolve()
    } catch (error) {
      this.loading.delete(url)
      reject(error)
    }
  }
  
  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = url
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  
  loadStyle(url) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url
      link.onload = resolve
      link.onerror = reject
      document.head.appendChild(link)
    })
  }
  
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })
  }
}

// 使用
const manager = new ResourcePriorityManager()

// 关键资源优先加载
await manager.add('/critical.js', 'critical', 'script')
await manager.add('/critical.css', 'critical', 'style')

// 高优先级资源
await manager.add('/important.js', 'high', 'script')

// 普通资源
await manager.add('/normal.js', 'normal', 'script')

// 低优先级资源
await manager.add('/analytics.js', 'low', 'script')
```

## 性能监控

### 1. 资源加载监控

```javascript
// 监控资源加载性能
function monitorResourceLoading() {
  const resources = performance.getEntriesByType('resource')
  
  const stats = {
    total: resources.length,
    byType: {},
    slow: [],
    large: []
  }
  
  resources.forEach(resource => {
    // 按类型统计
    const type = resource.initiatorType
    if (!stats.byType[type]) {
      stats.byType[type] = {
        count: 0,
        totalSize: 0,
        totalDuration: 0
      }
    }
    
    stats.byType[type].count++
    stats.byType[type].totalSize += resource.transferSize || 0
    stats.byType[type].totalDuration += resource.duration
    
    // 记录慢资源（> 1s）
    if (resource.duration > 1000) {
      stats.slow.push({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize
      })
    }
    
    // 记录大资源（> 100KB）
    if (resource.transferSize > 100 * 1024) {
      stats.large.push({
        name: resource.name,
        size: resource.transferSize,
        duration: resource.duration
      })
    }
  })
  
  return stats
}

// 使用
window.addEventListener('load', () => {
  const stats = monitorResourceLoading()
  console.log('资源加载统计:', stats)
  
  // 上报到监控系统
  sendToAnalytics('resource-loading', stats)
})
```

### 2. 资源大小监控

```javascript
// 监控资源大小
function monitorResourceSize() {
  const resources = performance.getEntriesByType('resource')
  
  const sizeStats = {
    total: 0,
    compressed: 0,
    uncompressed: 0,
    byType: {}
  }
  
  resources.forEach(resource => {
    const type = resource.initiatorType
    const transferSize = resource.transferSize || 0
    const encodedSize = resource.encodedBodySize || 0
    const decodedSize = resource.decodedBodySize || 0
    
    sizeStats.total += transferSize
    sizeStats.compressed += encodedSize
    sizeStats.uncompressed += decodedSize
    
    if (!sizeStats.byType[type]) {
      sizeStats.byType[type] = {
        transfer: 0,
        encoded: 0,
        decoded: 0
      }
    }
    
    sizeStats.byType[type].transfer += transferSize
    sizeStats.byType[type].encoded += encodedSize
    sizeStats.byType[type].decoded += decodedSize
  })
  
  // 计算压缩率
  sizeStats.compressionRatio = 
    (1 - sizeStats.compressed / sizeStats.uncompressed) * 100
  
  return sizeStats
}
```

## 常见问题

### 1. 如何选择图片格式？

- **照片**：JPEG/WebP/AVIF
- **图标/Logo**：SVG/PNG
- **动画**：WebP/AVIF（替代 GIF）
- **透明背景**：PNG/WebP/AVIF

### 2. 何时使用 preload vs prefetch？

- **preload**：当前页面必需的资源
- **prefetch**：未来页面可能需要的资源

### 3. 如何避免 FOIT/FOUT？

```css
/* 使用 font-display: swap */
@font-face {
  font-family: 'MyFont';
  src: url('font.woff2') format('woff2');
  font-display: swap; /* 立即显示后备字体 */
}
```

### 4. 如何优化第三方脚本？

```html
<!-- 延迟加载 -->
<script src="analytics.js" defer></script>

<!-- 异步加载 -->
<script src="ads.js" async></script>

<!-- 动态加载 -->
<script>
  setTimeout(() => {
    const script = document.createElement('script')
    script.src = 'non-critical.js'
    document.body.appendChild(script)
  }, 3000)
</script>
```

## 面试要点

### 核心问题

1. **如何优化图片加载？**
   - 选择合适的格式（WebP、AVIF）
   - 响应式图片（srcset、picture）
   - 懒加载（loading="lazy"）
   - 图片压缩和 CDN

2. **什么是代码分割？如何实现？**
   - 路由级分割（动态 import）
   - 组件级分割（lazy、Suspense）
   - 第三方库分割（splitChunks）

3. **如何实现资源预加载？**
   - preload：关键资源
   - prefetch：未来资源
   - dns-prefetch：DNS 预解析
   - preconnect：预连接

4. **Tree Shaking 的原理？**
   - 基于 ES Modules 的静态分析
   - 移除未使用的代码
   - 需要 sideEffects 配置

### 追问点

- 如何优化字体加载？
- 如何选择缓存策略？
- 如何监控资源加载性能？
- 如何优化第三方脚本？

## 参考资料

- [Web.dev - 图片优化](https://web.dev/fast/#optimize-your-images)
- [MDN - 预加载内容](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Preloading_content)
- [Webpack - 代码分割](https://webpack.js.org/guides/code-splitting/)
- [Chrome DevTools - 性能分析](https://developer.chrome.com/docs/devtools/performance/)
