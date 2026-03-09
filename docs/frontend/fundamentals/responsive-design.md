# 响应式设计完全指南

> 更新时间：2025-02

## 目录

[[toc]]

## 什么是响应式设计

响应式设计（Responsive Design）是一种网页设计方法，使网站能够在不同设备和屏幕尺寸上提供最佳的浏览体验。

### 核心原则

```javascript
// 响应式设计三大核心原则
const responsivePrinciples = {
  流式布局: '使用相对单位（%、vw、vh）而非固定像素',
  弹性图片: '图片能够根据容器大小自适应',
  媒体查询: '根据设备特性应用不同的样式'
}

// 响应式设计的目标
const goals = {
  适配多设备: '手机、平板、桌面、大屏',
  优化体验: '每种设备都有最佳的浏览体验',
  统一代码: '一套代码适配所有设备',
  易于维护: '减少重复代码'
}
```

## 移动端适配方案

### 1. Viewport 设置

```html
<!-- 基础 viewport 设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 完整配置 -->
<meta name="viewport" content="
  width=device-width,
  initial-scale=1.0,
  maximum-scale=1.0,
  minimum-scale=1.0,
  user-scalable=no,
  viewport-fit=cover
">

<!-- 参数说明 -->
<!--
  width: 视口宽度（device-width 表示设备宽度）
  initial-scale: 初始缩放比例
  maximum-scale: 最大缩放比例
  minimum-scale: 最小缩放比例
  user-scalable: 是否允许用户缩放
  viewport-fit: 视口适配（cover 表示覆盖整个屏幕）
-->
```

### 2. rem 适配方案

```javascript
// rem 适配原理
// 1rem = 根元素（html）的 font-size

// 方案 1：动态设置 rem
(function() {
  const baseSize = 16 // 基准大小（设计稿 375px 时，1rem = 16px）
  const designWidth = 375 // 设计稿宽度
  
  function setRem() {
    const scale = document.documentElement.clientWidth / designWidth
    document.documentElement.style.fontSize = baseSize * scale + 'px'
  }
  
  setRem()
  window.addEventListener('resize', setRem)
  window.addEventListener('orientationchange', setRem)
})()

// 方案 2：使用 lib-flexible（淘宝方案）
// 安装: npm install lib-flexible
import 'lib-flexible'

// 配合 postcss-pxtorem 自动转换
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 37.5, // 设计稿宽度 / 10
      propList: ['*'],
      selectorBlackList: ['.no-rem'] // 不转换的类名
    }
  }
}

// 使用示例
// 设计稿 750px，元素宽度 100px
// CSS 中写 width: 100px
// 自动转换为 width: 2.6667rem
```

### 3. vw/vh 适配方案

```css
/* vw/vh 适配 */
/* 1vw = 视口宽度的 1% */
/* 1vh = 视口高度的 1% */

/* 设计稿 750px，元素宽度 100px */
/* 100 / 750 * 100 = 13.33vw */
.box {
  width: 13.33vw;
  height: 13.33vw;
}

/* 使用 postcss-px-to-viewport 自动转换 */
/* postcss.config.js */
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 750, // 设计稿宽度
      viewportHeight: 1334, // 设计稿高度
      unitPrecision: 5, // 转换精度
      viewportUnit: 'vw', // 转换单位
      selectorBlackList: ['.ignore'], // 不转换的类名
      minPixelValue: 1, // 最小转换值
      mediaQuery: false // 是否转换媒体查询中的 px
    }
  }
}
```

### 4. 1px 边框问题

```css
/* 问题：在高清屏（DPR > 1）上，1px 边框会显得很粗 */

/* 解决方案 1：使用 transform scale */
.border-1px {
  position: relative;
}

.border-1px::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 200%;
  height: 200%;
  border: 1px solid #000;
  transform: scale(0.5);
  transform-origin: 0 0;
  box-sizing: border-box;
}

/* 解决方案 2：使用 box-shadow */
.border-1px {
  box-shadow: 0 0 0 0.5px #000;
}

/* 解决方案 3：使用 SVG */
.border-1px {
  border: 1px solid transparent;
  border-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='none' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E") 1;
}

/* 解决方案 4：使用 postcss-write-svg */
@svg 1px-border {
  width: 4px;
  height: 4px;
  @rect {
    fill: transparent;
    width: 100%;
    height: 100%;
    stroke-width: 25%;
    stroke: var(--color, black);
  }
}

.border-1px {
  border: 1px solid transparent;
  border-image: svg(1px-border param(--color #000)) 1 stretch;
}
```

### 5. 安全区域适配（iPhone X）

```css
/* iPhone X 刘海屏适配 */

/* 1. 设置 viewport-fit=cover */
<meta name="viewport" content="viewport-fit=cover">

/* 2. 使用 env() 获取安全区域 */
.header {
  /* 顶部安全区域 */
  padding-top: env(safe-area-inset-top);
}

.footer {
  /* 底部安全区域 */
  padding-bottom: env(safe-area-inset-bottom);
}

.sidebar {
  /* 左侧安全区域 */
  padding-left: env(safe-area-inset-left);
  /* 右侧安全区域 */
  padding-right: env(safe-area-inset-right);
}

/* 3. 完整示例 */
.container {
  padding: 
    env(safe-area-inset-top)
    env(safe-area-inset-right)
    env(safe-area-inset-bottom)
    env(safe-area-inset-left);
}

/* 4. 兼容性处理 */
.container {
  /* 降级方案 */
  padding: 20px;
  /* 支持 env() 的浏览器会覆盖 */
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

## 媒体查询最佳实践

### 1. 常用断点

```css
/* 移动优先（Mobile First）断点 */
/* 小屏幕（手机）：< 768px */
/* 中等屏幕（平板）：768px - 1024px */
/* 大屏幕（桌面）：> 1024px */

/* 基础样式（移动端） */
.container {
  width: 100%;
  padding: 10px;
}

/* 平板 */
@media (min-width: 768px) {
  .container {
    width: 750px;
    margin: 0 auto;
    padding: 20px;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container {
    width: 1000px;
    padding: 30px;
  }
}

/* 大屏 */
@media (min-width: 1440px) {
  .container {
    width: 1200px;
  }
}
```

### 2. 媒体查询类型

```css
/* 1. 屏幕宽度 */
@media (min-width: 768px) { }
@media (max-width: 767px) { }
@media (min-width: 768px) and (max-width: 1023px) { }

/* 2. 屏幕高度 */
@media (min-height: 600px) { }
@media (max-height: 599px) { }

/* 3. 设备方向 */
@media (orientation: portrait) { /* 竖屏 */ }
@media (orientation: landscape) { /* 横屏 */ }

/* 4. 设备像素比 */
@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) {
  /* 高清屏（Retina） */
}

/* 5. 颜色深度 */
@media (prefers-color-scheme: dark) {
  /* 深色模式 */
}

@media (prefers-color-scheme: light) {
  /* 浅色模式 */
}

/* 6. 减少动画 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* 7. 打印样式 */
@media print {
  .no-print {
    display: none;
  }
}
```

### 3. JavaScript 媒体查询

```javascript
// 使用 matchMedia API
const mediaQuery = window.matchMedia('(min-width: 768px)')

// 检查是否匹配
if (mediaQuery.matches) {
  console.log('屏幕宽度 >= 768px')
} else {
  console.log('屏幕宽度 < 768px')
}

// 监听变化
mediaQuery.addEventListener('change', (e) => {
  if (e.matches) {
    console.log('切换到桌面布局')
  } else {
    console.log('切换到移动布局')
  }
})

// 封装响应式工具类
class ResponsiveHelper {
  constructor() {
    this.breakpoints = {
      mobile: '(max-width: 767px)',
      tablet: '(min-width: 768px) and (max-width: 1023px)',
      desktop: '(min-width: 1024px)'
    }
    
    this.listeners = new Map()
  }
  
  // 检查断点
  is(breakpoint) {
    const query = this.breakpoints[breakpoint]
    return window.matchMedia(query).matches
  }
  
  // 监听断点变化
  on(breakpoint, callback) {
    const query = this.breakpoints[breakpoint]
    const mediaQuery = window.matchMedia(query)
    
    const handler = (e) => callback(e.matches)
    mediaQuery.addEventListener('change', handler)
    
    // 保存监听器以便移除
    this.listeners.set(callback, { mediaQuery, handler })
    
    // 立即执行一次
    callback(mediaQuery.matches)
  }
  
  // 移除监听
  off(callback) {
    const listener = this.listeners.get(callback)
    if (listener) {
      listener.mediaQuery.removeEventListener('change', listener.handler)
      this.listeners.delete(callback)
    }
  }
  
  // 获取当前断点
  getCurrentBreakpoint() {
    if (this.is('mobile')) return 'mobile'
    if (this.is('tablet')) return 'tablet'
    if (this.is('desktop')) return 'desktop'
    return 'unknown'
  }
}

// 使用示例
const responsive = new ResponsiveHelper()

// 检查断点
if (responsive.is('mobile')) {
  console.log('移动端')
}

// 监听断点变化
responsive.on('mobile', (matches) => {
  if (matches) {
    console.log('切换到移动端')
  }
})

// 获取当前断点
console.log('当前断点:', responsive.getCurrentBreakpoint())
```

## 响应式图片

### 1. srcset 和 sizes

```html
<!-- 基础用法 -->
<img
  src="image-400.jpg"
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="响应式图片"
>

<!-- 说明 -->
<!--
  srcset: 提供多个图片源和宽度描述符（w）
  sizes: 告诉浏览器在不同视口宽度下图片的显示宽度
  浏览器会根据设备像素比和视口宽度自动选择最合适的图片
-->

<!-- 使用像素密度描述符 -->
<img
  src="image.jpg"
  srcset="
    image.jpg 1x,
    image@2x.jpg 2x,
    image@3x.jpg 3x
  "
  alt="高清图片"
>
```

### 2. picture 元素

```html
<!-- 艺术指导（Art Direction） -->
<picture>
  <!-- 移动端：竖版图片 -->
  <source media="(max-width: 767px)" srcset="image-mobile.jpg">
  
  <!-- 平板：横版图片 -->
  <source media="(min-width: 768px) and (max-width: 1023px)" srcset="image-tablet.jpg">
  
  <!-- 桌面：宽屏图片 -->
  <source media="(min-width: 1024px)" srcset="image-desktop.jpg">
  
  <!-- 降级方案 -->
  <img src="image-desktop.jpg" alt="响应式图片">
</picture>

<!-- 不同格式图片 -->
<picture>
  <!-- WebP 格式（现代浏览器） -->
  <source type="image/webp" srcset="image.webp">
  
  <!-- AVIF 格式（最新浏览器） -->
  <source type="image/avif" srcset="image.avif">
  
  <!-- JPEG 格式（降级方案） -->
  <img src="image.jpg" alt="图片">
</picture>

<!-- 结合使用 -->
<picture>
  <!-- 移动端 WebP -->
  <source
    media="(max-width: 767px)"
    type="image/webp"
    srcset="image-mobile.webp"
  >
  
  <!-- 移动端 JPEG -->
  <source
    media="(max-width: 767px)"
    srcset="image-mobile.jpg"
  >
  
  <!-- 桌面 WebP -->
  <source
    type="image/webp"
    srcset="image-desktop.webp"
  >
  
  <!-- 降级方案 -->
  <img src="image-desktop.jpg" alt="图片">
</picture>
```

### 3. 懒加载

```javascript
// 方案 1：原生懒加载
<img src="image.jpg" loading="lazy" alt="懒加载图片">

// 方案 2：Intersection Observer
class LazyLoad {
  constructor(selector = 'img[data-src]') {
    this.images = document.querySelectorAll(selector)
    this.observer = null
    this.init()
  }
  
  init() {
    // 检查浏览器支持
    if (!('IntersectionObserver' in window)) {
      this.loadAllImages()
      return
    }
    
    // 创建观察器
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target)
          this.observer.unobserve(entry.target)
        }
      })
    }, {
      rootMargin: '50px' // 提前 50px 开始加载
    })
    
    // 观察所有图片
    this.images.forEach(img => this.observer.observe(img))
  }
  
  loadImage(img) {
    const src = img.dataset.src
    const srcset = img.dataset.srcset
    
    if (src) {
      img.src = src
    }
    
    if (srcset) {
      img.srcset = srcset
    }
    
    img.classList.add('loaded')
  }
  
  loadAllImages() {
    this.images.forEach(img => this.loadImage(img))
  }
}

// 使用示例
// HTML
<img
  data-src="image.jpg"
  data-srcset="image-400.jpg 400w, image-800.jpg 800w"
  alt="懒加载图片"
>

// JavaScript
const lazyLoad = new LazyLoad()
```

## 移动端性能优化

### 1. 首屏优化

```javascript
// 1. 关键资源内联
// 将关键 CSS 内联到 HTML 中
<style>
  /* 关键 CSS */
  .header { /* ... */ }
  .hero { /* ... */ }
</style>

// 2. 预加载关键资源
<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="preload" href="hero.jpg" as="image">

// 3. 骨架屏
const SkeletonScreen = () => {
  return (
    <div className="skeleton">
      <div className="skeleton-header"></div>
      <div className="skeleton-content">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>
    </div>
  )
}

// 4. 代码分割
// React
const LazyComponent = React.lazy(() => import('./Component'))

// Vue
const LazyComponent = () => import('./Component.vue')

// 5. 路由懒加载
// React Router
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

// Vue Router
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
```

### 2. 滚动性能优化

```css
/* 1. 使用 will-change */
.scroll-container {
  will-change: transform;
}

/* 2. 使用 transform 代替 top/left */
/* ❌ 不好 */
.element {
  position: absolute;
  top: 100px;
  left: 100px;
}

/* ✅ 好 */
.element {
  transform: translate(100px, 100px);
}

/* 3. 使用 CSS containment */
.card {
  contain: layout style paint;
}

/* 4. 虚拟滚动 */
```

```javascript
// 虚拟滚动实现
class VirtualScroll {
  constructor(options) {
    this.container = options.container
    this.items = options.items
    this.itemHeight = options.itemHeight
    this.renderItem = options.renderItem
    
    this.visibleCount = Math.ceil(this.container.clientHeight / this.itemHeight)
    this.startIndex = 0
    
    this.init()
  }
  
  init() {
    // 创建容器
    this.scrollContainer = document.createElement('div')
    this.scrollContainer.style.height = this.items.length * this.itemHeight + 'px'
    this.scrollContainer.style.position = 'relative'
    
    this.contentContainer = document.createElement('div')
    this.contentContainer.style.position = 'absolute'
    this.contentContainer.style.top = '0'
    this.contentContainer.style.left = '0'
    this.contentContainer.style.right = '0'
    
    this.scrollContainer.appendChild(this.contentContainer)
    this.container.appendChild(this.scrollContainer)
    
    // 监听滚动
    this.container.addEventListener('scroll', () => this.handleScroll())
    
    // 初始渲染
    this.render()
  }
  
  handleScroll() {
    const scrollTop = this.container.scrollTop
    const newStartIndex = Math.floor(scrollTop / this.itemHeight)
    
    if (newStartIndex !== this.startIndex) {
      this.startIndex = newStartIndex
      this.render()
    }
  }
  
  render() {
    const endIndex = Math.min(
      this.startIndex + this.visibleCount + 1,
      this.items.length
    )
    
    const visibleItems = this.items.slice(this.startIndex, endIndex)
    
    this.contentContainer.innerHTML = ''
    this.contentContainer.style.transform = `translateY(${this.startIndex * this.itemHeight}px)`
    
    visibleItems.forEach((item, index) => {
      const element = this.renderItem(item, this.startIndex + index)
      element.style.height = this.itemHeight + 'px'
      this.contentContainer.appendChild(element)
    })
  }
}

// 使用示例
const virtualScroll = new VirtualScroll({
  container: document.getElementById('list'),
  items: Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `Item ${i}` })),
  itemHeight: 50,
  renderItem: (item) => {
    const div = document.createElement('div')
    div.textContent = item.text
    div.className = 'list-item'
    return div
  }
})
```

### 3. 触摸优化

```css
/* 1. 禁用点击延迟 */
* {
  touch-action: manipulation;
}

/* 2. 平滑滚动 */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  overflow-y: scroll;
}

/* 3. 禁用选择 */
.button {
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

```javascript
// 4. FastClick（已过时，现代浏览器不需要）
// 现代浏览器使用 touch-action: manipulation 即可

// 5. 触摸事件优化
class TouchOptimizer {
  constructor(element) {
    this.element = element
    this.startX = 0
    this.startY = 0
    
    this.init()
  }
  
  init() {
    // 使用 passive 监听器提高滚动性能
    this.element.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX
      this.startY = e.touches[0].clientY
    }, { passive: true })
    
    this.element.addEventListener('touchmove', (e) => {
      const deltaX = e.touches[0].clientX - this.startX
      const deltaY = e.touches[0].clientY - this.startY
      
      // 处理滑动
      this.handleSwipe(deltaX, deltaY)
    }, { passive: true })
  }
  
  handleSwipe(deltaX, deltaY) {
    // 判断滑动方向
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (deltaX > 0) {
        console.log('向右滑动')
      } else {
        console.log('向左滑动')
      }
    } else {
      // 垂直滑动
      if (deltaY > 0) {
        console.log('向下滑动')
      } else {
        console.log('向上滑动')
      }
    }
  }
}
```



## PWA 渐进式 Web 应用

### 1. Service Worker

```javascript
// 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker 注册成功:', registration)
      })
      .catch(error => {
        console.error('Service Worker 注册失败:', error)
      })
  })
}

// sw.js - Service Worker 文件
const CACHE_NAME = 'my-app-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/logo.png'
]

// 安装事件
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开')
        return cache.addAll(urlsToCache)
      })
  )
})

// 激活事件
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// 拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中，返回缓存
        if (response) {
          return response
        }
        
        // 缓存未命中，发起网络请求
        return fetch(event.request).then(response => {
          // 检查是否是有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          
          // 克隆响应
          const responseToCache = response.clone()
          
          // 缓存响应
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache)
          })
          
          return response
        })
      })
  )
})
```

### 2. Web App Manifest

```json
// manifest.json
{
  "name": "我的应用",
  "short_name": "应用",
  "description": "这是一个 PWA 应用",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3eaf7c",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

```html
<!-- 在 HTML 中引入 -->
<link rel="manifest" href="/manifest.json">

<!-- iOS 支持 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="我的应用">
<link rel="apple-touch-icon" href="/icon-180.png">
```

### 3. 离线功能

```javascript
// 检测网络状态
window.addEventListener('online', () => {
  console.log('网络已连接')
  // 同步离线数据
  syncOfflineData()
})

window.addEventListener('offline', () => {
  console.log('网络已断开')
  // 显示离线提示
  showOfflineNotice()
})

// 离线数据存储
class OfflineStorage {
  constructor() {
    this.dbName = 'offline-db'
    this.storeName = 'pending-requests'
    this.db = null
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true })
        }
      }
    })
  }
  
  async add(data) {
    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)
    return store.add(data)
  }
  
  async getAll() {
    const transaction = this.db.transaction([this.storeName], 'readonly')
    const store = transaction.objectStore(this.storeName)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  
  async delete(id) {
    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)
    return store.delete(id)
  }
}

// 使用示例
const storage = new OfflineStorage()
await storage.init()

// 离线时保存请求
if (!navigator.onLine) {
  await storage.add({
    url: '/api/data',
    method: 'POST',
    body: { name: '张三' },
    timestamp: Date.now()
  })
}

// 在线时同步数据
async function syncOfflineData() {
  const pendingRequests = await storage.getAll()
  
  for (const request of pendingRequests) {
    try {
      await fetch(request.url, {
        method: request.method,
        body: JSON.stringify(request.body),
        headers: { 'Content-Type': 'application/json' }
      })
      
      await storage.delete(request.id)
      console.log('同步成功:', request)
    } catch (error) {
      console.error('同步失败:', error)
    }
  }
}
```

## 响应式设计最佳实践

### 1. 设计原则

```javascript
const designPrinciples = {
  移动优先: {
    原则: '先设计移动端，再扩展到桌面端',
    优点: '确保核心功能在小屏幕上可用',
    示例: `
      /* 移动端样式（基础） */
      .container { width: 100%; }
      
      /* 桌面端样式（扩展） */
      @media (min-width: 1024px) {
        .container { width: 1000px; }
      }
    `
  },
  
  渐进增强: {
    原则: '基础功能在所有设备上可用，高级功能逐步增强',
    优点: '确保兼容性',
    示例: `
      /* 基础样式 */
      .button { background: blue; }
      
      /* 支持 CSS Grid 的浏览器 */
      @supports (display: grid) {
        .container { display: grid; }
      }
    `
  },
  
  内容优先: {
    原则: '内容决定设计，而非设备',
    优点: '更灵活的断点设置',
    示例: '当内容在某个宽度下显示不佳时，添加断点'
  }
}
```

### 2. 性能优化清单

```javascript
const performanceChecklist = {
  图片优化: [
    '✅ 使用 WebP/AVIF 格式',
    '✅ 使用 srcset 提供多尺寸',
    '✅ 使用懒加载',
    '✅ 压缩图片',
    '✅ 使用 CDN'
  ],
  
  CSS优化: [
    '✅ 关键 CSS 内联',
    '✅ 非关键 CSS 异步加载',
    '✅ 使用 CSS containment',
    '✅ 避免复杂选择器',
    '✅ 使用 will-change'
  ],
  
  JavaScript优化: [
    '✅ 代码分割',
    '✅ 路由懒加载',
    '✅ Tree Shaking',
    '✅ 压缩代码',
    '✅ 使用 Web Workers'
  ],
  
  网络优化: [
    '✅ 使用 HTTP/2',
    '✅ 启用 Gzip/Brotli',
    '✅ 使用 CDN',
    '✅ 预加载关键资源',
    '✅ Service Worker 缓存'
  ]
}
```

### 3. 测试清单

```javascript
const testingChecklist = {
  设备测试: [
    '✅ iPhone（Safari）',
    '✅ Android（Chrome）',
    '✅ iPad（Safari）',
    '✅ 桌面（Chrome、Firefox、Safari、Edge）'
  ],
  
  屏幕尺寸: [
    '✅ 320px（小屏手机）',
    '✅ 375px（iPhone）',
    '✅ 768px（平板）',
    '✅ 1024px（小桌面）',
    '✅ 1440px（大桌面）'
  ],
  
  功能测试: [
    '✅ 触摸操作',
    '✅ 滚动性能',
    '✅ 表单输入',
    '✅ 图片加载',
    '✅ 离线功能'
  ],
  
  性能测试: [
    '✅ Lighthouse 评分 > 90',
    '✅ FCP < 1.8s',
    '✅ LCP < 2.5s',
    '✅ CLS < 0.1'
  ]
}
```

## 常见问题

### 1. 如何选择适配方案？

```javascript
const adaptationComparison = {
  rem: {
    优点: '兼容性好、易于理解',
    缺点: '需要 JS 动态设置',
    适用: '大部分项目'
  },
  
  'vw/vh': {
    优点: '纯 CSS、无需 JS',
    缺点: '兼容性稍差',
    适用: '现代浏览器项目'
  },
  
  '媒体查询': {
    优点: '灵活、可控',
    缺点: '断点较多时代码冗余',
    适用: '需要精细控制的项目'
  }
}
```

### 2. 如何处理横竖屏切换？

```javascript
// 监听方向变化
window.addEventListener('orientationchange', () => {
  if (window.orientation === 90 || window.orientation === -90) {
    console.log('横屏')
  } else {
    console.log('竖屏')
  }
})

// 使用媒体查询
@media (orientation: landscape) {
  /* 横屏样式 */
}

@media (orientation: portrait) {
  /* 竖屏样式 */
}
```

### 3. 如何优化移动端滚动？

```css
/* 1. 使用 -webkit-overflow-scrolling */
.scroll-container {
  -webkit-overflow-scrolling: touch;
}

/* 2. 使用 will-change */
.scroll-container {
  will-change: transform;
}

/* 3. 使用 transform 代替 top/left */
.element {
  transform: translateY(100px);
}
```

### 4. 如何实现深色模式？

```css
/* 使用 CSS 变量 */
:root {
  --bg-color: #ffffff;
  --text-color: #000000;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #000000;
    --text-color: #ffffff;
  }
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

```javascript
// JavaScript 切换
class ThemeToggle {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'auto'
    this.apply()
  }
  
  apply() {
    if (this.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (this.theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // 跟随系统
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
    }
  }
  
  toggle() {
    const themes = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(this.theme)
    this.theme = themes[(currentIndex + 1) % themes.length]
    localStorage.setItem('theme', this.theme)
    this.apply()
  }
}

const themeToggle = new ThemeToggle()
```

## 面试要点

### 核心概念

1. **响应式设计三大原则**
   - 流式布局、弹性图片、媒体查询

2. **移动端适配方案**
   - rem、vw/vh、媒体查询
   - 1px 边框问题
   - 安全区域适配

3. **PWA 核心技术**
   - Service Worker
   - Web App Manifest
   - 离线功能

### 实战经验

1. **如何实现移动端适配？**
   - 设置 viewport
   - 使用 rem 或 vw/vh
   - 媒体查询
   - 响应式图片

2. **如何优化移动端性能？**
   - 首屏优化（骨架屏、代码分割）
   - 图片优化（懒加载、WebP）
   - 滚动优化（虚拟滚动、will-change）
   - 触摸优化（touch-action、passive）

3. **如何实现 PWA？**
   - 注册 Service Worker
   - 配置 Manifest
   - 实现离线缓存
   - 添加到主屏幕

## 参考资料

### 官方文档
- [响应式设计 - MDN](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [媒体查询 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Media_Queries)
- [PWA - Google](https://web.dev/progressive-web-apps/)
- [Service Worker - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)

### 工具库
- [lib-flexible](https://github.com/amfe/lib-flexible) - 淘宝移动端适配方案
- [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem) - px 转 rem
- [postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport) - px 转 vw
- [Workbox](https://developers.google.com/web/tools/workbox) - Service Worker 工具库

### 学习资源
- [响应式设计模式](https://web.dev/responsive-web-design-basics/)
- [移动端适配方案](https://juejin.cn/post/6844903845617729549)
- [PWA 实战](https://lavas-project.github.io/pwa-book/)

---

> 💡 **提示**：响应式设计是现代 Web 开发的基础，掌握移动端适配和性能优化技巧可以大大提升用户体验。

