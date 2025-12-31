# 前端性能优化面试题集

> 前端性能优化策略与高频面试题

## A. 面试宝典

### 基础题

#### 1. 性能优化概述

```
┌─────────────────────────────────────────────────────────────┐
│                    性能优化全景                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  网络层面：                                                  │
│  ├── DNS 预解析                                             │
│  ├── HTTP/2 多路复用                                        │
│  ├── CDN 加速                                               │
│  ├── 资源压缩（Gzip/Brotli）                                │
│  ├── 减少请求数量                                           │
│  └── 缓存策略                                               │
│                                                              │
│  资源层面：                                                  │
│  ├── 代码分割                                               │
│  ├── 懒加载                                                 │
│  ├── 预加载（preload/prefetch）                             │
│  ├── 图片优化                                               │
│  └── Tree Shaking                                          │
│                                                              │
│  渲染层面：                                                  │
│  ├── 关键渲染路径优化                                       │
│  ├── 减少重排重绘                                           │
│  ├── GPU 加速                                               │
│  ├── 虚拟列表                                               │
│  └── 骨架屏                                                 │
│                                                              │
│  代码层面：                                                  │
│  ├── 防抖节流                                               │
│  ├── 缓存计算结果                                           │
│  ├── Web Worker                                             │
│  └── 内存管理                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### 2. 资源加载优化

**预加载策略：**
```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//api.example.com">

<!-- 预连接（DNS + TCP + TLS） -->
<link rel="preconnect" href="https://api.example.com">

<!-- 预加载（当前页面需要的关键资源） -->
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="hero.jpg" as="image">

<!-- 预获取（下一个页面可能需要的资源） -->
<link rel="prefetch" href="next-page.js">

<!-- 预渲染（下一个页面） -->
<link rel="prerender" href="https://example.com/next-page">
```

**脚本加载优化：**
```html
<!-- 普通脚本（阻塞） -->
<script src="app.js"></script>

<!-- async：异步加载，下载完立即执行（适合独立脚本如统计） -->
<script async src="analytics.js"></script>

<!-- defer：异步加载，DOM 解析完后按顺序执行 -->
<script defer src="app.js"></script>

<!-- 模块脚本（默认 defer） -->
<script type="module" src="app.js"></script>
```

```
┌─────────────────────────────────────────────────────────────┐
│                    脚本加载对比                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  普通脚本：                                                 │
│  HTML: ████████░░░░░░░░████████████████                    │
│  JS:          ████████                                      │
│       解析    下载执行    继续解析                          │
│                                                              │
│  async：                                                    │
│  HTML: ██████████████████░░████████████                    │
│  JS:        ████████                                        │
│       并行下载     立即执行                                  │
│                                                              │
│  defer：                                                    │
│  HTML: ██████████████████████████████                      │
│  JS:        ████████              ████                      │
│       并行下载              DOM后执行                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### 3. 图片优化

```
┌─────────────────────────────────────────────────────────────┐
│                    图片格式选择                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  格式        特点                    适用场景               │
│  ──────────────────────────────────────────────────────────│
│  JPEG       有损、不透明             照片                   │
│  PNG        无损、透明               图标、UI               │
│  GIF        动图、256色              简单动画               │
│  WebP       体积小、支持透明动画     通用（需兼容）         │
│  AVIF       更小、更高质量           现代浏览器             │
│  SVG        矢量、可缩放             图标、图形             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```html
<!-- 响应式图片 -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="description">
</picture>

<!-- 分辨率适配 -->
<img srcset="small.jpg 480w,
             medium.jpg 800w,
             large.jpg 1200w"
     sizes="(max-width: 600px) 480px,
            (max-width: 1000px) 800px,
            1200px"
     src="medium.jpg"
     alt="description">

<!-- 懒加载 -->
<img src="placeholder.jpg"
     data-src="actual.jpg"
     loading="lazy"
     alt="description">
```

```javascript
// 懒加载实现
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
}, { rootMargin: '100px' });

document.querySelectorAll('img.lazy').forEach(img => {
  observer.observe(img);
});
```

---

#### 4. 代码分割

**Webpack 代码分割：**
```javascript
// 动态导入
const module = await import('./module.js');

// React 懒加载
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}

// Vue 异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
);

// 路由懒加载
const routes = [
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
];

// Webpack 魔法注释
import(
  /* webpackChunkName: "my-chunk" */
  /* webpackPrefetch: true */
  './module.js'
);
```

**Vite 代码分割：**
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'dayjs']
        }
      }
    }
  }
}
```

---

#### 5. 缓存策略

```
┌─────────────────────────────────────────────────────────────┐
│                    缓存策略                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  强缓存：                                                   │
│  Cache-Control: max-age=31536000, immutable                 │
│  Expires: Wed, 21 Oct 2025 07:28:00 GMT                    │
│                                                              │
│  协商缓存：                                                 │
│  ETag / If-None-Match                                       │
│  Last-Modified / If-Modified-Since                          │
│                                                              │
│  推荐策略：                                                 │
│  ──────────────────────────────────────────────────────────│
│  HTML:       Cache-Control: no-cache                        │
│              ETag: "abc123"                                 │
│                                                              │
│  JS/CSS:     Cache-Control: max-age=31536000, immutable    │
│              (配合文件名 hash：app.a1b2c3.js)              │
│                                                              │
│  图片:       Cache-Control: max-age=86400                   │
│                                                              │
│  API:        Cache-Control: no-store                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Service Worker 缓存：**
```javascript
// sw.js
const CACHE_NAME = 'v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
];

// 安装
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

// 请求拦截
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
  );
});

// 激活（清理旧缓存）
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
});
```

---

### 进阶题

#### 6. 首屏优化

```
┌─────────────────────────────────────────────────────────────┐
│                    首屏优化策略                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 减少关键资源                                            │
│     - 内联关键 CSS                                          │
│     - 延迟非关键 CSS                                        │
│     - 异步加载 JS                                           │
│                                                              │
│  2. 优化资源加载                                            │
│     - 预加载关键资源                                        │
│     - 预连接第三方域名                                      │
│     - HTTP/2 Server Push                                    │
│                                                              │
│  3. 减少资源体积                                            │
│     - Gzip/Brotli 压缩                                      │
│     - 代码压缩混淆                                          │
│     - Tree Shaking                                          │
│     - 图片压缩                                              │
│                                                              │
│  4. 优化渲染                                                │
│     - 骨架屏                                                │
│     - 服务端渲染（SSR）                                     │
│     - 静态生成（SSG）                                       │
│     - 流式渲染                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```html
<!-- 关键 CSS 内联 -->
<head>
  <style>
    /* 首屏关键样式 */
    .hero { ... }
    .nav { ... }
  </style>
  <!-- 异步加载非关键 CSS -->
  <link rel="preload" href="main.css" as="style"
        onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="main.css"></noscript>
</head>
```

**骨架屏：**
```javascript
// Vue 骨架屏
const Skeleton = {
  template: `
    <div class="skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `
};

// 使用
<Suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <Skeleton />
  </template>
</Suspense>
```

---

#### 7. 长列表优化

**虚拟列表原理：**
```
┌─────────────────────────────────────────────────────────────┐
│                    虚拟列表                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  普通列表：渲染所有 10000 个 DOM 节点                       │
│                                                              │
│  虚拟列表：只渲染可视区域 + 缓冲区的节点                    │
│                                                              │
│  ┌─────────────────────────────────────────┐                │
│  │ 上方占位区（padding/transform）         │                │
│  ├─────────────────────────────────────────┤                │
│  │ 缓冲区（预渲染）                        │                │
│  ├─────────────────────────────────────────┤                │
│  │                                         │                │
│  │           可视区域                      │   ← viewport   │
│  │                                         │                │
│  ├─────────────────────────────────────────┤                │
│  │ 缓冲区（预渲染）                        │                │
│  ├─────────────────────────────────────────┤                │
│  │ 下方占位区（padding/transform）         │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// 简易虚拟列表实现
function VirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + Math.ceil(containerHeight / itemHeight) + 1
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, i) => (
            <div key={startIndex + i} style={{ height: itemHeight }}>
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

#### 8. 运行时性能

```javascript
// 防抖
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流
function throttle(fn, delay) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

// 使用 requestIdleCallback 处理低优先级任务
function processLargeData(data) {
  const chunks = splitIntoChunks(data, 100);
  let index = 0;

  function processChunk(deadline) {
    while (index < chunks.length && deadline.timeRemaining() > 0) {
      processItem(chunks[index]);
      index++;
    }

    if (index < chunks.length) {
      requestIdleCallback(processChunk);
    }
  }

  requestIdleCallback(processChunk);
}

// Web Worker 处理耗时计算
// main.js
const worker = new Worker('worker.js');
worker.postMessage({ data: largeData });
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

// worker.js
self.onmessage = (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
};
```

---

#### 9. React 性能优化

```javascript
// React.memo - 避免不必要的重渲染
const MemoComponent = React.memo(function Component({ data }) {
  return <div>{data}</div>;
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});

// useMemo - 缓存计算结果
function Component({ items }) {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  return <div>{expensiveValue}</div>;
}

// useCallback - 缓存函数引用
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <Child onClick={handleClick} />;
}

// 懒加载组件
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// 使用 key 优化列表
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// 避免内联对象/函数
// Bad
<Component style={{ color: 'red' }} onClick={() => {}} />

// Good
const style = useMemo(() => ({ color: 'red' }), []);
const handleClick = useCallback(() => {}, []);
<Component style={style} onClick={handleClick} />
```

---

### 避坑指南

| 误区 | 正确理解 |
|------|----------|
| 过度优化 | 先测量，针对瓶颈优化 |
| 全部使用懒加载 | 关键资源应预加载 |
| 缓存时间越长越好 | 需要考虑更新需求 |
| 虚拟列表解决一切 | 简单场景用分页更合适 |

---

## B. 实战文档

### 性能测量工具

```javascript
// Lighthouse (Chrome DevTools)
// - Performance 评分
// - 核心 Web Vitals
// - 优化建议

// Performance API
const timing = performance.timing;
console.log({
  DNS: timing.domainLookupEnd - timing.domainLookupStart,
  TCP: timing.connectEnd - timing.connectStart,
  TTFB: timing.responseStart - timing.requestStart,
  Download: timing.responseEnd - timing.responseStart,
  DOMParse: timing.domInteractive - timing.responseEnd,
  DOMReady: timing.domContentLoadedEventEnd - timing.navigationStart,
  Load: timing.loadEventEnd - timing.navigationStart
});

// PerformanceObserver
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log(entry.name, entry.startTime, entry.duration);
  });
});

observer.observe({ entryTypes: ['longtask', 'largest-contentful-paint'] });

// Web Vitals
import { getCLS, getFID, getLCP } from 'web-vitals';
getCLS(console.log);
getFID(console.log);
getLCP(console.log);
```

### Webpack 优化配置

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    // 代码分割
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
    // 运行时代码单独打包
    runtimeChunk: 'single',
    // 压缩
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: { drop_console: true }
        }
      }),
      new CssMinimizerPlugin()
    ]
  },
  // 开启 Tree Shaking
  mode: 'production',
  // 分析插件
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};
```
