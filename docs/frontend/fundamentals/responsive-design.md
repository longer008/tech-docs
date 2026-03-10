# 响应式设计完全指南

> 更新时间：2025-02

## 目录

[[toc]]

## 什么是响应式设计

响应式设计（Responsive Web Design，RWD）是一种网页设计方法，使网站能够在不同设备和屏幕尺寸上提供最佳的浏览体验。

### 核心原则

```javascript
// 响应式设计三大核心原则
const responsivePrinciples = {
  流式布局: {
    描述: '使用相对单位（%、vw、vh）而非固定单位（px）',
    示例: 'width: 100%; max-width: 1200px;'
  },
  
  弹性图片: {
    描述: '图片能够根据容器大小自动缩放',
    示例: 'img { max-width: 100%; height: auto; }'
  },
  
  媒体查询: {
    描述: '根据设备特性应用不同的样式',
    示例: '@media (max-width: 768px) { ... }'
  }
}

// 响应式设计的优势
const advantages = {
  用户体验: '在任何设备上都能获得良好体验',
  SEO友好: 'Google 推荐的移动优化方案',
  维护成本低: '一套代码适配所有设备',
  未来友好: '能够适应新的设备和屏幕尺寸'
}
```

## 移动端适配方案

### 1. Viewport 设置

```html
<!-- 基础 viewport 设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 完整的 viewport 设置 -->
<meta name="viewport" content="
  width=device-width,
  initial-scale=1.0,
  maximum-scale=1.0,
  minimum-scale=1.0,
  user-scalable=no,
  viewport-fit=cover
">

<!-- viewport 属性说明 -->
<!--
  width: 视口宽度（device-width 表示设备宽度）
  initial-scale: 初始缩放比例
  maximum-scale: 最大缩放比例
  minimum-scale: 最小缩放比例
  user-scalable: 是否允许用户缩放（yes/no）
  viewport-fit: 视口适配（cover 表示覆盖整个屏幕，包括刘海区域）
-->
```

### 2. rem 适配方案

```javascript
// rem 适配原理
// 1rem = 根元素（html）的 font-size

// 方案 1：动态设置 rem 基准值
(function() {
  // 设计稿宽度
  const designWidth = 750
  
  // 基准字体大小
  const baseFontSize = 100
  
  function setRem() {
    // 获取当前设备宽度
    const deviceWidth = document.documentElement.clientWidth || window.innerWidth
    
    // 计算 rem 基准值
    const rem = (deviceWidth / designWidth) * baseFontSize
    
    // 设置根元素字体大小
    document.documentElement.style.fontSize = rem + 'px'
  }
  
  // 初始化
  setRem()
  
  // 监听窗口大小变化
  window.addEventListener('resize', setRem)
  window.addEventListener('orientationchange', setRem)
})()

// 使用示例
// 设计稿：750px
// 元素宽度：375px
// 转换：375 / 100 = 3.75rem

// CSS
.box {
  width: 3.75rem; /* 375px */
  height: 2rem;   /* 200px */
  font-size: 0.16rem; /* 16px */
}

// 方案 2：使用 postcss-pxtorem 自动转换
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 100, // 根元素字体大小
      propList: ['*'], // 需要转换的属性
      selectorBlackList: ['.no-rem'], // 不转换的选择器
      minPixelValue: 2 // 最小转换值
    }
  }
}

// CSS（编译前）
.box {
  width: 375px;
  height: 200px;
  font-size: 16px;
}

// CSS（编译后）
.box {
  width: 3.75rem;
  height: 2rem;
  font-size: 0.16rem;
}
```

### 3. vw/vh 适配方案

```css
/* vw/vh 适配原理 */
/* 1vw = 视口宽度的 1% */
/* 1vh = 视口高度的 1% */

/* 设计稿：750px */
/* 元素宽度：375px */
/* 转换：375 / 750 * 100 = 50vw */

.box {
  width: 50vw; /* 375px */
  height: 26.67vw; /* 200px */
  font-size: 2.13vw; /* 16px */
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
      selectorBlackList: ['.no-vw'], // 不转换的选择器
      minPixelValue: 1, // 最小转换值
      mediaQuery: false // 是否转换媒体查询中的 px
    }
  }
}

/* CSS（编译前） */
.box {
  width: 375px;
  height: 200px;
  font-size: 16px;
}

/* CSS（编译后） */
.box {
  width: 50vw;
  height: 26.66667vw;
  font-size: 2.13333vw;
}

/* vw/vh 的优势 */
/* 1. 不需要 JavaScript */
/* 2. 计算简单 */
/* 3. 兼容性好 */

/* vw/vh 的问题 */
/* 1. 无法设置最大最小值 */
/* 解决方案：结合 calc() 和 clamp() */
.box {
  /* 最小 16px，最大 24px */
  font-size: clamp(16px, 2.13vw, 24px);
  
  /* 或使用 calc() + min/max */
  font-size: min(max(16px, 2.13vw), 24px);
}
```

### 4. flexible 方案（淘宝）

```javascript
// lib-flexible 原理
(function(win, lib) {
  const doc = win.document
  const docEl = doc.documentElement
  let metaEl = doc.querySelector('meta[name="viewport"]')
  let flexibleEl = doc.querySelector('meta[name="flexible"]')
  let dpr = 0
  let scale = 0
  let tid
  
  // 获取 dpr
  if (metaEl) {
    const match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/)
    if (match) {
      scale = parseFloat(match[1])
      dpr = parseInt(1 / scale)
    }
  } else if (flexibleEl) {
    const content = flexibleEl.getAttribute('content')
    if (content) {
      const initialDpr = content.match(/initial\-dpr=([\d\.]+)/)
      const maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/)
      if (initialDpr) {
        dpr = parseFloat(initialDpr[1])
        scale = parseFloat((1 / dpr).toFixed(2))
      }
      if (maximumDpr) {
        dpr = parseFloat(maximumDpr[1])
        scale = parseFloat((1 / dpr).toFixed(2))
      }
    }
  }
  
  if (!dpr && !scale) {
    const isAndroid = win.navigator.appVersion.match(/android/gi)
    const isIPhone = win.navigator.appVersion.match(/iphone/gi)
    const devicePixelRatio = win.devicePixelRatio
    
    if (isIPhone) {
      // iOS 下，对于 2 和 3 的屏，用 2 倍的方案，其余的用 1 倍方案
      if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
        dpr = 3
      } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)) {
        dpr = 2
      } else {
        dpr = 1
      }
    } else {
      // 其他设备下，仍旧使用 1 倍的方案
      dpr = 1
    }
    scale = 1 / dpr
  }
  
  docEl.setAttribute('data-dpr', dpr)
  
  if (!metaEl) {
    metaEl = doc.createElement('meta')
    metaEl.setAttribute('name', 'viewport')
    metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no')
    if (docEl.firstElementChild) {
      docEl.firstElementChild.appendChild(metaEl)
    } else {
      const wrap = doc.createElement('div')
      wrap.appendChild(metaEl)
      doc.write(wrap.innerHTML)
    }
  }
  
  function refreshRem() {
    let width = docEl.getBoundingClientRect().width
    if (width / dpr > 540) {
      width = 540 * dpr
    }
    const rem = width / 10
    docEl.style.fontSize = rem + 'px'
    lib.rem = win.rem = rem
  }
  
  win.addEventListener('resize', function() {
    clearTimeout(tid)
    tid = setTimeout(refreshRem, 300)
  }, false)
  
  win.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      clearTimeout(tid)
      tid = setTimeout(refreshRem, 300)
    }
  }, false)
  
  if (doc.readyState === 'complete') {
    doc.body.style.fontSize = 12 * dpr + 'px'
  } else {
    doc.addEventListener('DOMContentLoaded', function() {
      doc.body.style.fontSize = 12 * dpr + 'px'
    }, false)
  }
  
  refreshRem()
  
  lib.dpr = win.dpr = dpr
  lib.refreshRem = refreshRem
  lib.rem2px = function(d) {
    let val = parseFloat(d) * this.rem
    if (typeof d === 'string' && d.match(/rem$/)) {
      val += 'px'
    }
    return val
  }
  lib.px2rem = function(d) {
    let val = parseFloat(d) / this.rem
    if (typeof d === 'string' && d.match(/px$/)) {
      val += 'rem'
    }
    return val
  }
})(window, window['lib'] || (window['lib'] = {}))

// 使用示例
// HTML
<html data-dpr="2">
  <head>
    <meta name="viewport" content="initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=no">
  </head>
  <body>
    <div class="box"></div>
  </body>
</html>

// CSS
.box {
  width: 3.75rem; /* 375px */
  height: 2rem;   /* 200px */
  font-size: 0.16rem; /* 16px */
}

/* 根据 dpr 设置不同的字体大小 */
[data-dpr="1"] .box { font-size: 16px; }
[data-dpr="2"] .box { font-size: 32px; }
[data-dpr="3"] .box { font-size: 48px; }
```

### 5. 适配方案对比

```javascript
// 适配方案对比
const comparisonTable = {
  rem: {
    原理: '动态设置根元素字体大小',
    优点: [
      '兼容性好',
      '可以设置最大最小值',
      '计算简单'
    ],
    缺点: [
      '需要 JavaScript',
      '首屏可能闪烁'
    ],
    适用场景: '大部分移动端项目'
  },
  
  vw_vh: {
    原理: '使用视口单位',
    优点: [
      '不需要 JavaScript',
      '计算简单',
      '兼容性好'
    ],
    缺点: [
      '无法设置最大最小值（需要配合 clamp）',
      '某些浏览器有兼容性问题'
    ],
    适用场景: '简单的移动端项目'
  },
  
  flexible: {
    原理: 'rem + dpr',
    优点: [
      '解决 1px 问题',
      '适配各种屏幕',
      '淘宝方案，成熟稳定'
    ],
    缺点: [
      '需要 JavaScript',
      '配置复杂'
    ],
    适用场景: '对视觉要求高的项目'
  },
  
  媒体查询: {
    原理: '根据屏幕宽度应用不同样式',
    优点: [
      '灵活',
      '可以针对不同设备定制'
    ],
    缺点: [
      '代码量大',
      '维护成本高'
    ],
    适用场景: '响应式网站'
  }
}
```

## 媒体查询最佳实践

### 1. 常用断点

```css
/* 移动优先（Mobile First） */
/* 默认样式（移动端） */
.container {
  width: 100%;
  padding: 0 15px;
}

/* 平板（≥768px） */
@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}

/* 桌面（≥992px） */
@media (min-width: 992px) {
  .container {
    max-width: 970px;
  }
}

/* 大屏（≥1200px） */
@media (min-width: 1200px) {
  .container {
    max-width: 1170px;
  }
}

/* 超大屏（≥1400px） */
@media (min-width: 1400px) {
  .container {
    max-width: 1320px;
  }
}

/* 桌面优先（Desktop First） */
/* 默认样式（桌面） */
.container {
  max-width: 1170px;
  margin: 0 auto;
}

/* 平板（≤992px） */
@media (max-width: 992px) {
  .container {
    max-width: 750px;
  }
}

/* 移动端（≤768px） */
@media (max-width: 768px) {
  .container {
    width: 100%;
    padding: 0 15px;
  }
}

/* Bootstrap 断点 */
/* xs: <576px */
/* sm: ≥576px */
/* md: ≥768px */
/* lg: ≥992px */
/* xl: ≥1200px */
/* xxl: ≥1400px */

/* Tailwind CSS 断点 */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */
```

### 2. 媒体查询类型

```css
/* 1. 屏幕宽度 */
@media (min-width: 768px) { }
@media (max-width: 768px) { }
@media (min-width: 768px) and (max-width: 992px) { }

/* 2. 屏幕高度 */
@media (min-height: 600px) { }
@media (max-height: 600px) { }

/* 3. 设备方向 */
@media (orientation: portrait) { /* 竖屏 */ }
@media (orientation: landscape) { /* 横屏 */ }

/* 4. 设备像素比 */
@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) {
  /* Retina 屏幕 */
}

/* 5. 颜色深度 */
@media (min-color: 8) { }

/* 6. 悬停能力 */
@media (hover: hover) {
  /* 支持悬停（鼠标） */
  .button:hover {
    background: blue;
  }
}

@media (hover: none) {
  /* 不支持悬停（触摸屏） */
  .button:active {
    background: blue;
  }
}

/* 7. 指针精度 */
@media (pointer: fine) {
  /* 精确指针（鼠标） */
  .button {
    padding: 5px 10px;
  }
}

@media (pointer: coarse) {
  /* 粗糙指针（手指） */
  .button {
    padding: 10px 20px;
  }
}

/* 8. 深色模式 */
@media (prefers-color-scheme: dark) {
  body {
    background: #000;
    color: #fff;
  }
}

@media (prefers-color-scheme: light) {
  body {
    background: #fff;
    color: #000;
  }
}

/* 9. 减少动画 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* 10. 打印样式 */
@media print {
  body {
    font-size: 12pt;
  }
  
  .no-print {
    display: none;
  }
}
```

### 3. 容器查询（Container Queries）

```css
/* 容器查询（CSS Container Queries） */
/* 根据容器大小而非视口大小应用样式 */

/* 定义容器 */
.container {
  container-type: inline-size; /* 或 size、normal */
  container-name: sidebar; /* 可选 */
}

/* 容器查询 */
@container (min-width: 400px) {
  .card {
    display: flex;
  }
}

/* 命名容器查询 */
@container sidebar (min-width: 400px) {
  .card {
    display: flex;
  }
}

/* 实际示例 */
.sidebar {
  container-type: inline-size;
}

.card {
  display: block;
}

/* 当容器宽度 ≥ 400px 时 */
@container (min-width: 400px) {
  .card {
    display: flex;
    gap: 1rem;
  }
  
  .card-image {
    width: 40%;
  }
  
  .card-content {
    width: 60%;
  }
}

/* 容器查询单位 */
/* cqw: 容器宽度的 1% */
/* cqh: 容器高度的 1% */
/* cqi: 容器内联尺寸的 1% */
/* cqb: 容器块尺寸的 1% */
/* cqmin: cqi 和 cqb 中较小的值 */
/* cqmax: cqi 和 cqb 中较大的值*/

.card-title {
  font-size: clamp(1rem, 5cqi, 2rem);
}
```

## 响应式图片

### 1. srcset 和 sizes

```html
<!-- 基础用法 -->
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

<!-- srcset 说明 -->
<!-- 400w 表示图片宽度为 400px -->
<!-- 浏览器会根据设备像素比和 sizes 选择合适的图片 -->

<!-- sizes 说明 -->
<!-- (max-width: 600px) 400px: 视口宽度 ≤600px 时，图片显示宽度为 400px -->
<!-- (max-width: 1000px) 800px: 视口宽度 ≤1000px 时，图片显示宽度为 800px -->
<!-- 1200px: 默认显示宽度为 1200px -->

<!-- 使用 x 描述符（设备像素比） -->
<img
  src="image-1x.jpg"
  srcset="
    image-1x.jpg 1x,
    image-2x.jpg 2x,
    image-3x.jpg 3x
  "
  alt="响应式图片"
/>

<!-- 完整示例 -->
<img
  src="fallback.jpg"
  srcset="
    small.jpg 300w,
    medium.jpg 600w,
    large.jpg 1200w
  "
  sizes="
    (max-width: 320px) 280px,
    (max-width: 640px) 580px,
    1000px
  "
  alt="响应式图片"
  loading="lazy"
/>
```

### 2. picture 元素

```html
<!-- 基础用法 -->
<picture>
  <source srcset="image.webp" type="image/webp" />
  <source srcset="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="图片" />
</picture>

<!-- 根据屏幕宽度选择图片 -->
<picture>
  <source media="(max-width: 600px)" srcset="small.jpg" />
  <source media="(max-width: 1200px)" srcset="medium.jpg" />
  <img src="large.jpg" alt="图片" />
</picture>

<!-- 结合 srcset -->
<picture>
  <source
    media="(max-width: 600px)"
    srcset="small-1x.jpg 1x, small-2x.jpg 2x"
  />
  <source
    media="(max-width: 1200px)"
    srcset="medium-1x.jpg 1x, medium-2x.jpg 2x"
  />
  <img
    src="large-1x.jpg"
    srcset="large-1x.jpg 1x, large-2x.jpg 2x"
    alt="图片"
  />
</picture>

<!-- 艺术指导（Art Direction） -->
<!-- 不同屏幕显示不同裁剪的图片 -->
<picture>
  <!-- 移动端：竖版图片 -->
  <source
    media="(max-width: 600px)"
    srcset="portrait.jpg"
  />
  <!-- 桌面端：横版图片 -->
  <source
    media="(min-width: 601px)"
    srcset="landscape.jpg"
  />
  <img src="landscape.jpg" alt="图片" />
</picture>

<!-- 深色模式 -->
<picture>
  <source
    srcset="dark.jpg"
    media="(prefers-color-scheme: dark)"
  />
  <img src="light.jpg" alt="图片" />
</picture>
```

### 3. CSS 响应式背景图

```css
/* 基础用法 */
.hero {
  background-image: url('small.jpg');
}

@media (min-width: 768px) {
  .hero {
    background-image: url('medium.jpg');
  }
}

@media (min-width: 1200px) {
  .hero {
    background-image: url('large.jpg');
  }
}

/* 使用 image-set() */
.hero {
  background-image: image-set(
    url('image-1x.jpg') 1x,
    url('image-2x.jpg') 2x,
    url('image-3x.jpg') 3x
  );
}

/* WebP 支持检测 */
.hero {
  background-image: url('image.jpg');
}

@supports (background-image: image-set(url('image.webp') type('image/webp'))) {
  .hero {
    background-image: image-set(
      url('image.webp') type('image/webp'),
      url('image.jpg') type('image/jpeg')
    );
  }
}

/* 深色模式 */
.hero {
  background-image: url('light.jpg');
}

@media (prefers-color-scheme: dark) {
  .hero {
    background-image: url('dark.jpg');
  }
}
```

### 4. 图片懒加载

```html
<!-- 原生懒加载 -->
<img src="image.jpg" alt="图片" loading="lazy" />

<!-- 浏览器支持检测 -->
<script>
if ('loading' in HTMLImageElement.prototype) {
  // 支持原生懒加载
  const images = document.querySelectorAll('img[loading="lazy"]')
  images.forEach(img => {
    img.src = img.dataset.src
  })
} else {
  // 不支持，使用 polyfill
  const script = document.createElement('script')
  script.src = 'lazysizes.min.js'
  document.body.appendChild(script)
}
</script>

<!-- 使用 Intersection Observer -->
<img data-src="image.jpg" alt="图片" class="lazy" />

<script>
const lazyImages = document.querySelectorAll('.lazy')

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      img.src = img.dataset.src
      img.classList.remove('lazy')
      observer.unobserve(img)
    }
  })
})

lazyImages.forEach(img => imageObserver.observe(img))
</script>
```


## 移动端性能优化

### 1. 首屏优化

```javascript
// 1. 关键资源内联
// 将关键 CSS 内联到 HTML 中
<style>
  /* 关键 CSS */
  body { margin: 0; font-family: sans-serif; }
  .header { height: 60px; background: #fff; }
</style>

// 2. 预加载关键资源
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="critical.js" as="script">
<link rel="preload" href="hero.jpg" as="image">

// 3. 延迟加载非关键资源
<link rel="stylesheet" href="non-critical.css" media="print" onload="this.media='all'">

// 4. 使用骨架屏
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

// CSS
.skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// 5. 代码分割
// React
const LazyComponent = React.lazy(() => import('./Component'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  )
}

// Vue
const AsyncComponent = () => import('./Component.vue')

export default {
  components: {
    AsyncComponent
  }
}
```

### 2. 图片优化

```javascript
// 1. 使用 WebP 格式
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="图片">
</picture>

// 2. 图片压缩
// 使用 imagemin
const imagemin = require('imagemin')
const imageminWebp = require('imagemin-webp')

await imagemin(['images/*.{jpg,png}'], {
  destination: 'build/images',
  plugins: [
    imageminWebp({ quality: 75 })
  ]
})

// 3. 响应式图片
<img
  srcset="small.jpg 400w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  src="medium.jpg"
  alt="图片"
>

// 4. 懒加载
<img src="placeholder.jpg" data-src="real-image.jpg" loading="lazy">

// 5. 使用 CDN
<img src="https://cdn.example.com/image.jpg" alt="图片">
```

### 3. 网络优化

```javascript
// 1. 使用 HTTP/2
// 服务器配置（Nginx）
server {
  listen 443 ssl http2;
  # ...
}

// 2. 启用压缩
// Gzip
server {
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;
  gzip_min_length 1000;
}

// Brotli
server {
  brotli on;
  brotli_types text/plain text/css application/json application/javascript;
}

// 3. 使用 Service Worker 缓存
// sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/script.js',
        '/image.jpg'
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})

// 4. 预连接
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">

// 5. 资源提示
<link rel="prefetch" href="next-page.html">
<link rel="prerender" href="next-page.html">
```

## PWA 渐进式 Web 应用

### 1. Manifest 配置

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
<!-- HTML 引入 -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#3eaf7c">
<link rel="apple-touch-icon" href="/icon-192.png">
```

### 2. Service Worker

```javascript
// 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW 注册成功:', registration)
      })
      .catch(error => {
        console.log('SW 注册失败:', error)
      })
  })
}

// sw.js
const CACHE_NAME = 'my-app-v1'
const urlsToCache = [
  '/',
  '/styles.css',
  '/script.js',
  '/image.jpg'
]

// 安装
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
      })
  )
})

// 激活
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
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
      .then((response) => {
        // 缓存命中
        if (response) {
          return response
        }
        
        // 网络请求
        return fetch(event.request).then((response) => {
          // 检查是否是有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          
          // 克隆响应
          const responseToCache = response.clone()
          
          // 缓存响应
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache)
            })
          
          return response
        })
      })
  )
})
```

### 3. 离线功能

```javascript
// 离线页面
// sw.js
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(OFFLINE_URL))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
          .then((response) => {
            return response || caches.match(OFFLINE_URL)
          })
      })
  )
})

// offline.html
<!DOCTYPE html>
<html>
<head>
  <title>离线</title>
</head>
<body>
  <h1>您当前处于离线状态</h1>
  <p>请检查网络连接</p>
</body>
</html>
```

### 4. 推送通知

```javascript
// 请求通知权限
Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    console.log('通知权限已授予')
  }
})

// 订阅推送
navigator.serviceWorker.ready.then((registration) => {
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'YOUR_PUBLIC_KEY'
  }).then((subscription) => {
    console.log('订阅成功:', subscription)
    
    // 发送订阅信息到服务器
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    })
  })
})

// sw.js - 接收推送
self.addEventListener('push', (event) => {
  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge.png',
    data: {
      url: data.url
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// 点击通知
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  )
})
```

## 响应式布局技巧

### 1. Flexbox 布局

```css
/* 基础 Flex 布局 */
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.item {
  flex: 1 1 300px; /* flex-grow flex-shrink flex-basis */
}

/* 响应式 Flex 布局 */
.container {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}

/* 自适应卡片布局 */
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  flex: 1 1 calc(33.333% - 1rem);
  min-width: 250px;
}

@media (max-width: 768px) {
  .card {
    flex: 1 1 calc(50% - 1rem);
  }
}

@media (max-width: 480px) {
  .card {
    flex: 1 1 100%;
  }
}
```

### 2. Grid 布局

```css
/* 基础 Grid 布局 */
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* 响应式 Grid 布局 */
.container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .container {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 自适应 Grid 布局 */
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* auto-fit vs auto-fill */
/* auto-fit: 拉伸列以填充空间 */
/* auto-fill: 保持列宽，留空 */

/* Grid 区域布局 */
.container {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 200px 1fr 1fr;
  gap: 1rem;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }

@media (max-width: 768px) {
  .container {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

### 3. 多列布局

```css
/* CSS 多列布局 */
.container {
  column-count: 3;
  column-gap: 2rem;
  column-rule: 1px solid #ddd;
}

/* 响应式多列 */
.container {
  column-count: 1;
}

@media (min-width: 768px) {
  .container {
    column-count: 2;
  }
}

@media (min-width: 1024px) {
  .container {
    column-count: 3;
  }
}

/* 或使用 column-width */
.container {
  column-width: 250px;
  column-gap: 2rem;
}

/* 防止元素被分割 */
.item {
  break-inside: avoid;
}
```

## 触摸优化

### 1. 触摸事件

```javascript
// 基础触摸事件
element.addEventListener('touchstart', (e) => {
  console.log('触摸开始', e.touches)
})

element.addEventListener('touchmove', (e) => {
  console.log('触摸移动', e.touches)
})

element.addEventListener('touchend', (e) => {
  console.log('触摸结束', e.changedTouches)
})

element.addEventListener('touchcancel', (e) => {
  console.log('触摸取消')
})

// 滑动检测
class SwipeDetector {
  constructor(element) {
    this.element = element
    this.startX = 0
    this.startY = 0
    this.threshold = 50 // 最小滑动距离
    
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this))
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this))
  }
  
  handleTouchStart(e) {
    this.startX = e.touches[0].clientX
    this.startY = e.touches[0].clientY
  }
  
  handleTouchEnd(e) {
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    
    const deltaX = endX - this.startX
    const deltaY = endY - this.startY
    
    // 水平滑动
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.threshold) {
      if (deltaX > 0) {
        this.onSwipeRight?.()
      } else {
        this.onSwipeLeft?.()
      }
    }
    
    // 垂直滑动
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > this.threshold) {
      if (deltaY > 0) {
        this.onSwipeDown?.()
      } else {
        this.onSwipeUp?.()
      }
    }
  }
}

// 使用示例
const detector = new SwipeDetector(document.querySelector('.swipeable'))

detector.onSwipeLeft = () => console.log('向左滑动')
detector.onSwipeRight = () => console.log('向右滑动')
detector.onSwipeUp = () => console.log('向上滑动')
detector.onSwipeDown = () => console.log('向下滑动')
```

### 2. 触摸优化

```css
/* 1. 增大触摸区域 */
.button {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 24px;
}

/* 2. 禁用点击延迟 */
* {
  touch-action: manipulation;
}

/* 3. 禁用文本选择 */
.no-select {
  user-select: none;
  -webkit-user-select: none;
}

/* 4. 禁用长按菜单 */
.no-context-menu {
  -webkit-touch-callout: none;
}

/* 5. 平滑滚动 */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  overflow-y: scroll;
}

/* 6. 触摸反馈 */
.button {
  transition: transform 0.1s;
}

.button:active {
  transform: scale(0.95);
}

/* 7. 禁用双击缩放 */
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### 3. 手势库

```javascript
// 使用 Hammer.js
import Hammer from 'hammerjs'

const element = document.querySelector('.gesture')
const hammer = new Hammer(element)

// 滑动
hammer.on('swipeleft', () => console.log('向左滑动'))
hammer.on('swiperight', () => console.log('向右滑动'))

// 捏合
hammer.get('pinch').set({ enable: true })
hammer.on('pinch', (e) => {
  console.log('捏合', e.scale)
})

// 旋转
hammer.get('rotate').set({ enable: true })
hammer.on('rotate', (e) => {
  console.log('旋转', e.rotation)
})

// 双击
hammer.on('doubletap', () => console.log('双击'))

// 长按
hammer.on('press', () => console.log('长按'))
```

## 常见问题

### 1. 1px 边框问题

```css
/* 问题：在 Retina 屏幕上，1px 边框看起来很粗 */

/* 解决方案 1：使用 transform */
.border {
  position: relative;
}

.border::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #000;
  transform: scaleY(0.5);
  transform-origin: 0 0;
}

/* 解决方案 2：使用 box-shadow */
.border {
  box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.1);
}

/* 解决方案 3：使用 SVG */
.border {
  border: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='1'%3E%3Cline x1='0' y1='0' x2='100%25' y2='0' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E");
  background-repeat: repeat-x;
  background-position: bottom;
}

/* 解决方案 4：使用 viewport + rem */
/* 设置 viewport 的 scale 为 1/dpr */
<meta name="viewport" content="width=device-width, initial-scale=0.5">

.border {
  border: 1px solid #000;
}
```

### 2. 安全区域适配（刘海屏）

```css
/* iOS 11+ 安全区域 */
body {
  /* env() 函数获取安全区域 */
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}

/* 或使用 constant()（iOS 11.0-11.2） */
body {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

/* 固定定位元素 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  padding-top: env(safe-area-inset-top);
}

/* viewport-fit=cover */
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

### 3. 横竖屏切换

```javascript
// 监听屏幕方向变化
window.addEventListener('orientationchange', () => {
  if (window.orientation === 90 || window.orientation === -90) {
    console.log('横屏')
  } else {
    console.log('竖屏')
  }
})

// 使用 Screen Orientation API
screen.orientation.addEventListener('change', () => {
  console.log('屏幕方向:', screen.orientation.type)
  // portrait-primary, portrait-secondary
  // landscape-primary, landscape-secondary
})

// 锁定屏幕方向
screen.orientation.lock('portrait').then(() => {
  console.log('锁定为竖屏')
}).catch((error) => {
  console.error('锁定失败:', error)
})

// CSS 媒体查询
@media (orientation: portrait) {
  /* 竖屏样式 */
}

@media (orientation: landscape) {
  /* 横屏样式 */
}
```

## 最佳实践

### 1. 响应式设计清单

```javascript
const responsiveChecklist = {
  布局: [
    '✅ 使用流式布局',
    '✅ 使用 Flexbox 或 Grid',
    '✅ 设置合理的断点',
    '✅ 移动优先设计'
  ],
  
  图片: [
    '✅ 使用响应式图片',
    '✅ 使用 WebP 格式',
    '✅ 实现图片懒加载',
    '✅ 压缩图片'
  ],
  
  性能: [
    '✅ 优化首屏加载',
    '✅ 使用代码分割',
    '✅ 启用缓存',
    '✅ 使用 CDN'
  ],
  
  交互: [
    '✅ 增大触摸区域',
    '✅ 优化触摸反馈',
    '✅ 禁用点击延迟',
    '✅ 实现手势操作'
  ],
  
  兼容性: [
    '✅ 测试多种设备',
    '✅ 处理安全区域',
    '✅ 解决 1px 问题',
    '✅ 适配横竖屏'
  ]
}
```

### 2. 性能优化建议

```javascript
const performanceTips = {
  关键渲染路径: [
    '内联关键 CSS',
    '延迟加载非关键 CSS',
    '预加载关键资源',
    '使用骨架屏'
  ],
  
  资源优化: [
    '压缩图片',
    '使用 WebP',
    '实现懒加载',
    '使用 CDN'
  ],
  
  代码优化: [
    '代码分割',
    'Tree Shaking',
    '压缩代码',
    '使用 HTTP/2'
  ],
  
  缓存策略: [
    'Service Worker',
    'HTTP 缓存',
    '本地存储',
    'CDN 缓存'
  ]
}
```

## 面试要点

### 核心概念

1. **响应式设计三大原则**
   - 流式布局、弹性图片、媒体查询

2. **移动端适配方案**
   - rem、vw/vh、flexible、媒体查询

3. **响应式图片**
   - srcset、sizes、picture、懒加载

4. **PWA**
   - Manifest、Service Worker、离线功能、推送通知

### 实战经验

1. **如何实现移动端适配？**
   - 选择适配方案（rem/vw）
   - 设置 viewport
   - 使用 postcss 自动转换
   - 处理 1px 问题

2. **如何优化移动端性能？**
   - 首屏优化（骨架屏、代码分割）
   - 图片优化（WebP、懒加载）
   - 网络优化（HTTP/2、压缩、CDN）
   - 使用 PWA

3. **如何处理响应式图片？**
   - 使用 srcset 和 sizes
   - 使用 picture 元素
   - 实现懒加载
   - 使用 WebP 格式

## 参考资料

### 官方文档
- [Responsive Web Design - MDN](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Media Queries - MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Media_Queries)
- [PWA - Google](https://web.dev/progressive-web-apps/)
- [Service Worker - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)

### 工具库
- [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem) - px 转 rem
- [postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport) - px 转 vw
- [lib-flexible](https://github.com/amfe/lib-flexible) - 淘宝适配方案
- [Hammer.js](https://hammerjs.github.io/) - 手势库

### 学习资源
- [响应式设计指南 - Google](https://developers.google.com/web/fundamentals/design-and-ux/responsive)
- [移动端适配方案 - 掘金](https://juejin.cn/post/6844903951012200456)
- [PWA 实战 - Google](https://developers.google.com/web/ilt/pwa)

---

> 💡 **提示**：响应式设计是现代 Web 开发的基础，掌握移动端适配和性能优化技巧可以大大提升用户体验。
