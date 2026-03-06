# 前端性能优化进阶指南

> Web 性能优化与小程序性能优化实战 | 更新时间：2025-02

## 目录

- [小程序性能优化](#小程序性能优化)
- [性能监控系统](#性能监控系统)
- [Web Vitals 详解](#web-vitals-详解)
- [缓存策略实战](#缓存策略实战)
- [移动端性能优化](#移动端性能优化)

---

## 小程序性能优化

### 1. 微信小程序性能优化

#### 启动性能优化

```javascript
// 1. 分包加载
// app.json
{
  "pages": [
    "pages/index/index",  // 主包
    "pages/home/home"
  ],
  "subpackages": [
    {
      "root": "packageA",
      "pages": [
        "pages/cat/cat",
        "pages/dog/dog"
      ]
    },
    {
      "root": "packageB",
      "name": "pack2",
      "pages": [
        "pages/apple/apple",
        "pages/banana/banana"
      ],
      "independent": true  // 独立分包
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["packageA"]
    }
  }
}

// 2. 按需注入
// app.json
{
  "lazyCodeLoading": "requiredComponents"
}

// 3. 用时注入
// app.json
{
  "useExtendedLib": {
    "weui": true  // 使用 WeUI 扩展库
  }
}
```

#### 渲染性能优化

```javascript
// 1. setData 优化
// Bad: 频繁 setData
for (let i = 0; i < 100; i++) {
  this.setData({
    [`list[${i}]`]: data[i]
  });
}

// Good: 批量 setData
const updates = {};
for (let i = 0; i < 100; i++) {
  updates[`list[${i}]`] = data[i];
}
this.setData(updates);

// 2. 只更新变化的数据
// Bad: 更新整个对象
this.setData({
  userInfo: newUserInfo
});

// Good: 只更新变化的字段
this.setData({
  'userInfo.name': newName,
  'userInfo.avatar': ne
">
    <view>{{item.text}}</view>
  </recycle-item>
  <view slot="after">长列表后面的内容</view>
</recycle-view>
```

#### 网络请求优化

```javascript
// 1. 请求合并
class RequestQueue {
  constructor() {
    this.queue = [];
    this.timer = null;
  }

  add(request) {
    this.queue.push(request);
    
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.flush();
      }, 50);
    }
  }

  flush() {
    if (this.queue.length === 0) return;

    // 合并请求
    wx.request({
      url: '/api/batch',
      method: 'POST',
      data: {
        requests: this.queue
      },
      success: (res) => {
        // 分发响应
        res.data.responses.forEach((response, index) => {
          this.queue[index].success(response);
        });
      }
    });

    this.queue = [];
    this.timer = null;
  }
}

// 2. 请求缓存
class RequestCache {
  constructor() {
    this.cache = new Map();
    this.pending = new Map();
  }

  async request(url, options = {}) {
    const key = `${url}_${JSON.stringify(options)}`;
    const ttl = options.ttl || 60000; // 默认 1 分钟

    // 检查缓存
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    // 检查是否有相同请求正在进行
    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    // 发起请求
    const promise = new Promise((resolve, reject) => {
      wx.request({
        url,
        ...options,
        success: (res) => {
          this.cache.set(key, {
            data: res.data,
            timestamp: Date.now()
          });
          this.pending.delete(key);
          resolve(res.data);
        },
        fail: (err) => {
          this.pending.delete(key);
          reject(err);
        }
      });
    });

    this.pending.set(key, promise);
    return promise;
  }
}

// 使用
const requestCache = new RequestCache();

Page({
  async onLoad() {
    const data = await requestCache.request('/api/data', {
      ttl: 300000 // 5 分钟缓存
    });
  }
});

// 3. 预加载数据
// 在 onShow 时预加载下一页数据
Page({
  data: {
    currentPage: 1,
    nextPageData: null
  },

  onShow() {
    // 预加载下一页
    this.preloadNextPage();
  },

  async preloadNextPage() {
    const nextPage = this.data.currentPage + 1;
    const data = await this.fetchData(nextPage);
    this.setData({
      nextPageData: data
    });
  },

  async loadMore() {
    // 使用预加载的数据
    if (this.data.nextPageData) {
      this.setData({
        list: [...this.data.list, ...this.data.nextPageData],
        currentPage: this.data.currentPage + 1,
        nextPageData: null
      });
      
      // 预加载下一页
      this.preloadNextPage();
    }
  }
});
```

#### 包体积优化

```javascript
// 1. 图片优化
// - 使用 WebP 格式
// - 使用 CDN
// - 图片懒加载
// - 使用 image 组件的 lazy-load 属性

<image 
  src="{{imageUrl}}" 
  lazy-load="{{true}}"
  mode="aspectFill"
/>

// 2. 代码优化
// - 移除无用代码
// - 使用 ES6+ 语法（更简洁）
// - 避免引入大型第三方库

// Bad: 引入整个 lodash
import _ from 'lodash';

// Good: 按需引入
import debounce from 'lodash/debounce';

// 3. 分包优化
// - 主包只放首页和 tabBar 页面
// - 其他页面放入分包
// - 使用独立分包（不依赖主包）

// 4. 资源优化
// - 删除无用的图片、字体
// - 压缩图片
// - 使用字体图标代替图片图标
```

### 2. UniApp 性能优化

```javascript
// 1. 条件编译（减少包体积）
// #ifdef H5
console.log('H5 平台代码');
// #endif

// #ifdef MP-WEIXIN
console.log('微信小程序代码');
// #endif

// #ifdef APP-PLUS
console.log('App 平台代码');
// #endif

// 2. nvue 页面优化（App 端）
// nvue 使用原生渲染，性能更好
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "app-plus": {
          "titleNView": false,
          "subNVues": [{
            "id": "drawer",
            "path": "pages/drawer",
            "type": "popup"
          }]
        }
      }
    }
  ]
}

// 3. 长列表优化
<template>
  <list>
    <cell v-for="item in list" :key="item.id">
      <text>{{item.title}}</text>
    </cell>
  </list>
</template>

// 4. 图片优化
<image 
  :src="imageUrl" 
  lazy-load
  @load="onImageLoad"
  @error="onImageError"
/>

// 5. 页面预载
// manifest.json
{
  "h5": {
    "optimization": {
      "prefetch": true,
      "preload": true
    }
  }
}
```

---

## 性能监控系统

### 完整的性能监控方案

```javascript
class PerformanceMonitor {
  constructor(options = {}) {
    this.reportUrl = options.reportUrl || '/api/performance';
    this.sampleRate = options.sampleRate || 1;
    this.init();
  }

  init() {
    this.observePageLoad();
    this.observeResources();
    this.observeLongTasks();
    this.observeWebVitals();
    this.observeMemory();
    this.observeErrors();
  }

  // 页面加载性能
  observePageLoad() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing;
        const navigation = performance.getEntriesByType('navigation')[0];

        const metrics = {
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          tcp: timing.connectEnd - timing.connectStart,
          ssl: timing.secureConnectionStart > 0
            ? timing.connectEnd - timing.secureConnectionStart
            : 0,
          ttfb: timing.responseStart - timing.requestStart,
          download: timing.responseEnd - timing.responseStart,
          domParse: timing.domInteractive - timing.responseEnd,
          resourceLoad: timing.loadEventStart - timing.domContentLoadedEventEnd,
          domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
          load: timing.loadEventEnd - timing.navigationStart,
          fp: this.getFirstPaint(),
          fcp: this.getFirstContentfulPaint()
        };

        this.report('page-load', metrics);
      }, 0);
    });
  }

  // 资源加载性能
  observeResources() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 1000) {
          this.report('slow-resource', {
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize,
            cached: entry.transferSize === 0
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  // 长任务监控
  observeLongTasks() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        this.report('long-task', {
          duration: entry.duration,
          startTime: entry.startTime,
          attribution: entry.attribution
        });
      });
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {}
  }

  // Web Vitals 监控
  observeWebVitals() {
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.report('lcp', {
        value: lastEntry.renderTime || lastEntry.loadTime,
        element: lastEntry.element?.tagName,
        url: lastEntry.url
      });
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // FID
    new PerformanceObserver((list) => {
      const entry = list.getEntries()[0];
      
      this.report('fid', {
        value: entry.processingStart - entry.startTime,
        eventType: entry.name
      });
    }).observe({ type: 'first-input', buffered: true });

    // CLS
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      
      this.report('cls', { value: clsValue });
    }).observe({ type: 'layout-shift', buffered: true });
  }

  // 内存监控
  observeMemory() {
    if (!performance.memory) return;

    setInterval(() => {
      const memory = performance.memory;
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (usageRatio > 0.8) {
        this.report('high-memory', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          ratio: usageRatio
        });
      }
    }, 30000);
  }

  // 错误监控
  observeErrors() {
    window.addEventListener('error', (event) => {
      this.report('js-error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.report('promise-error', {
        reason: event.reason,
        promise: event.promise
      });
    });
  }

  getFirstPaint() {
    const entries = performance.getEntriesByType('paint');
    const fp = entries.find(e => e.name === 'first-paint');
    return fp ? fp.startTime : 0;
  }

  getFirstContentfulPaint() {
    const entries = performance.getEntriesByType('paint');
    const fcp = entries.find(e => e.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }

  report(type, data) {
    if (Math.random() > this.sampleRate) return;

    const reportData = {
      type,
      data,
      timestamp: Date.now(),
      url: location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo()
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        this.reportUrl,
        JSON.stringify(reportData)
      );
    } else {
      fetch(this.reportUrl, {
        method: 'POST',
        body: JSON.stringify(reportData),
        keepalive: true
      }).catch(() => {});
    }
  }

  getConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) return {};

    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
}

// 使用
const monitor = new PerformanceMonitor({
  reportUrl: '/api/performance',
  sampleRate: 0.1
});
```

---

## Web Vitals 详解

### 核心指标

```
┌─────────────────────────────────────────────────────────────┐
│                    Core Web Vitals                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LCP (Largest Contentful Paint) - 最大内容绘制              │
│  ├── 衡量：加载性能                                         │
│  ├── 目标：< 2.5s                                           │
│  └── 优化：                                                 │
│      - 优化服务器响应时间                                   │
│      - 使用 CDN                                             │
│      - 预加载关键资源                                       │
│      - 压缩图片                                             │
│                                                              │
│  FID (First Input Delay) - 首次输入延迟                     │
│  ├── 衡量：交互性能                                         │
│  ├── 目标：< 100ms                                          │
│  └── 优化：                                                 │
│      - 减少 JavaScript 执行时间                             │
│      - 代码分割                                             │
│      - 使用 Web Worker                                      │
│      - 延迟加载第三方脚本                                   │
│                                                              │
│  CLS (Cumulative Layout Shift) - 累积布局偏移               │
│  ├── 衡量：视觉稳定性                                       │
│  ├── 目标：< 0.1                                            │
│  └── 优化：                                                 │
│      - 为图片/视频设置尺寸                                  │
│      - 避免在现有内容上方插入内容                           │
│      - 使用 transform 动画                                  │
│      - 预留广告位空间                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 测量和优化

```javascript
// 测量 Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
    rating: metric.rating
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body);
  } else {
    fetch('/analytics', { body, method: 'POST', keepalive: true });
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// CLS 优化
.image-container {
  aspect-ratio: 16 / 9;
  width: 100%;
}

@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap;
}

.animate {
  animation: transform-move 1s;
}

@keyframes transform-move {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
```

---

## 缓存策略实战

### 多级缓存

```javascript
class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.storageCache = window.localStorage;
    this.maxMemorySize = 50;
  }

  async get(key, options = {}) {
    const { ttl = 3600000, fetchFn } = options;

    // 1. 内存缓存
    const memoryData = this.memoryCache.get(key);
    if (memoryData && Date.now() - memoryData.timestamp < ttl) {
      return memoryData.value;
    }

    // 2. 本地存储
    const storageData = this.storageCache.getItem(key);
    if (storageData) {
      try {
        const parsed = JSON.parse(storageData);
        if (Date.now() - parsed.timestamp < ttl) {
          this.setMemoryCache(key, parsed.value);
          return parsed.value;
        }
      } catch (e) {}
    }

    // 3. 网络获取
    if (fetchFn) {
      const value = await fetchFn();
      this.set(key, value);
      return value;
    }

    return null;
  }

  set(key, value) {
    const data = {
      value,
      timestamp: Date.now()
    };

    this.setMemoryCache(key, value);

    try {
      this.storageCache.setItem(key, JSON.stringify(data));
    } catch (e) {
      this.clearOldStorage();
      try {
        this.storageCache.setItem(key, JSON.stringify(data));
      } catch (e) {}
    }
  }

  setMemoryCache(key, value) {
    if (this.memoryCache.has(key)) {
      this.memoryCache.delete(key);
    }

    if (this.memoryCache.size >= this.maxMemorySize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }

    this.memoryCache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  clearOldStorage() {
    const keys = Object.keys(this.storageCache);
    const items = keys.map(key => {
      try {
        const data = JSON.parse(this.storageCache.getItem(key));
        return { key, timestamp: data.timestamp || 0 };
      } catch (e) {
        return { key, timestamp: 0 };
      }
    });

    items.sort((a, b) => a.timestamp - b.timestamp);
    const deleteCount = Math.ceil(items.length * 0.2);
    items.slice(0, deleteCount).forEach(item => {
      this.storageCache.removeItem(item.key);
    });
  }

  clear(key) {
    if (key) {
      this.memoryCache.delete(key);
      this.storageCache.removeItem(key);
    } else {
      this.memoryCache.clear();
      this.storageCache.clear();
    }
  }
}

// 使用
const cache = new CacheManager();

async function getUserInfo(userId) {
  return cache.get(`user:${userId}`, {
    ttl: 600000,
    fetchFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    }
  });
}
```

---

## 移动端性能优化

### 触摸事件优化

```javascript
// 1. 使用 FastClick
import FastClick from 'fastclick';
FastClick.attach(document.body);

// 2. CSS 禁用延迟
.button {
  touch-action: manipulation;
}

// 3. 滚动性能
.scroll-container {
  -webkit-overflow-scrolling: touch;
  will-change: transform;
  overscroll-behavior: contain;
}
```

### 图片懒加载

```javascript
class LazyLoad {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.1;
    this.rootMargin = options.rootMargin || '50px';
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersect.bind(this),
        {
          threshold: this.threshold,
          rootMargin: this.rootMargin
        }
      );

      this.observe();
    } else {
      this.loadAll();
    }

    this.observeConnection();
  }

  observe() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => this.observer.observe(img));
  }

  handleIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  loadImage(img) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection && connection.effectiveType === 'slow-2g') {
      img.src = img.dataset.srcLow || img.dataset.src;
    } else {
      img.src = img.dataset.src;
    }

    img.onload = () => {
      img.classList.add('loaded');
    };
  }

  loadAll() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => this.loadImage(img));
  }

  observeConnection() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', () => {
        if (connection.effectiveType === '4g') {
          this.upgradeImages();
        }
      });
    }
  }

  upgradeImages() {
    const images = document.querySelectorAll('img[data-src-high]');
    images.forEach(img => {
      if (img.src !== img.dataset.srcHigh) {
        img.src = img.dataset.srcHigh;
      }
    });
  }
}

const lazyLoad = new LazyLoad({
  threshold: 0.1,
  rootMargin: '50px'
});
```

---

## 参考资料

### 官方资源

- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [微信小程序性能优化](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/)
- [UniApp 性能优化](https://uniapp.dcloud.net.cn/tutorial/performance.html)

### 工具推荐

- Lighthouse
- WebPageTest
- Chrome DevTools
- Performance API
- web-vitals 库

### 学习路线

1. **初级**：理解性能指标、使用 DevTools
2. **中级**：掌握优化技巧、实现监控系统
3. **高级**：性能架构设计、自动化优化
