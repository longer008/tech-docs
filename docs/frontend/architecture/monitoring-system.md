# 前端监控系统

> 更新时间：2025-02

## 目录导航

- [什么是前端监控](#什么是前端监控)
- [监控指标](#监控指标)
- [性能监控](#性能监控)
- [错误监控](#错误监控)
- [行为监控](#行为监控)
- [数据上报](#数据上报)
- [实战案例](#实战案例)
- [最佳实践](#最佳实践)

## 什么是前端监控

前端监控是指对前端应用的性能、错误、用户行为等进行实时监控和分析的系统。

**核心目标**：
- 发现和定位问题
- 优化用户体验
- 提升应用质量
- 数据驱动决策

**监控类型**：
- 性能监控：页面加载、资源加载、接口请求
- 错误监控：JS 错误、资源错误、接口错误
- 行为监控：用户行为、页面访问、点击事件

## 监控指标

### 1. 性能指标

**Web Vitals 核心指标**：

```javascript
// LCP (Largest Contentful Paint) - 最大内容绘制
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime)
  }
}).observe({ entryTypes: ['largest-contentful-paint'] })

// FID (First Input Delay) - 首次输入
t
// FCP (First Contentful Paint) - 首次内容绘制
// FMP (First Meaningful Paint) - 首次有意义绘制
// TTI (Time to Interactive) - 可交互时间
// TBT (Total Blocking Time) - 总阻塞时间

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.startTime)
  }
})

observer.observe({ entryTypes: ['paint', 'navigation', 'resource'] })
```

### 2. 错误指标

```javascript
// JS 错误数量
// 资源加载错误数量
// 接口错误数量
// 错误率 = 错误数 / 总请求数
```

### 3. 用户行为指标

```javascript
// PV (Page View) - 页面浏览量
// UV (Unique Visitor) - 独立访客数
// 页面停留时间
// 跳出率
// 点击率
```

## 性能监控

### 1. 页面加载性能

```javascript
class PerformanceMonitor {
  constructor() {
    this.init()
  }
  
  init() {
    if (window.PerformanceObserver) {
      this.observePerformance()
    } else {
      window.addEventListener('load', () => {
        this.collectPerformance()
      })
    }
  }
  
  observePerformance() {
    // 监听导航时间
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.reportNavigation(entry)
      }
    }).observe({ entryTypes: ['navigation'] })
    
    // 监听资源加载
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.reportResource(entry)
      }
    }).observe({ entryTypes: ['resource'] })
    
    // 监听 Web Vitals
    this.observeWebVitals()
  }
  
  collectPerformance() {
    const timing = performance.timing
    const data = {
      // DNS 查询时间
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      // TCP 连接时间
      tcp: timing.connectEnd - timing.connectStart,
      // SSL 握手时间
      ssl: timing.secureConnectionStart ? timing.connectEnd - timing.secureConnectionStart : 0,
      // 请求时间
      request: timing.responseStart - timing.requestStart,
      // 响应时间
      response: timing.responseEnd - timing.responseStart,
      // DOM 解析时间
      domParse: timing.domInteractive - timing.responseEnd,
      // 资源加载时间
      resourceLoad: timing.loadEventStart - timing.domContentLoadedEventEnd,
      // 首屏时间
      firstScreen: timing.domContentLoadedEventEnd - timing.fetchStart,
      // 页面完全加载时间
      load: timing.loadEventEnd - timing.fetchStart,
    }
    
    this.report('performance', data)
  }
  
  reportNavigation(entry) {
    const data = {
      type: 'navigation',
      url: entry.name,
      duration: entry.duration,
      transferSize: entry.transferSize,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
    }
    
    this.report('navigation', data)
  }
  
  reportResource(entry) {
    const data = {
      type: 'resource',
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      protocol: entry.nextHopProtocol,
    }
    
    this.report('resource', data)
  }
  
  observeWebVitals() {
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.report('lcp', {
        value: lastEntry.renderTime || lastEntry.loadTime,
        element: lastEntry.element,
      })
    }).observe({ entryTypes: ['largest-contentful-paint'] })
    
    // FID
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.report('fid', {
          value: entry.processingStart - entry.startTime,
        })
      }
    }).observe({ entryTypes: ['first-input'] })
    
    // CLS
    let clsScore = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value
        }
      }
      this.report('cls', { value: clsScore })
    }).observe({ entryTypes: ['layout-shift'] })
  }
  
  report(type, data) {
    // 上报数据
    console.log(`[${type}]`, data)
    // 实际项目中应该发送到服务器
    // navigator.sendBeacon('/api/monitor', JSON.stringify({ type, data }))
  }
}

// 使用
const monitor = new PerformanceMonitor()
```

### 2. 接口性能监控

```javascript
class APIMonitor {
  constructor() {
    this.interceptFetch()
    this.interceptXHR()
  }
  
  interceptFetch() {
    const originalFetch = window.fetch
    
    window.fetch = async (...args) => {
      const startTime = Date.now()
      const url = args[0]
      
      try {
        const response = await originalFetch(...args)
        const duration = Date.now() - startTime
        
        this.report({
          type: 'fetch',
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration,
          success: response.ok,
        })
        
        return response
      } catch (error) {
        const duration = Date.now() - startTime
        
        this.report({
          type: 'fetch',
          url,
          method: args[1]?.method || 'GET',
          duration,
          success: false,
          error: error.message,
        })
        
        throw error
      }
    }
  }
  
  interceptXHR() {
    const originalOpen = XMLHttpRequest.prototype.open
    const originalSend = XMLHttpRequest.prototype.send
    
    XMLHttpRequest.prototype.open = function(method, url) {
      this._method = method
      this._url = url
      this._startTime = Date.now()
      return originalOpen.apply(this, arguments)
    }
    
    XMLHttpRequest.prototype.send = function() {
      this.addEventListener('loadend', () => {
        const duration = Date.now() - this._startTime
        
        this.report({
          type: 'xhr',
          url: this._url,
          method: this._method,
          status: this.status,
          duration,
          success: this.status >= 200 && this.status < 300,
        })
      })
      
      return originalSend.apply(this, arguments)
    }
  }
  
  report(data) {
    console.log('[API]', data)
    // 上报数据
  }
}

// 使用
const apiMonitor = new APIMonitor()
```

## 错误监控

### 1. JS 错误监控

```javascript
class ErrorMonitor {
  constructor() {
    this.init()
  }
  
  init() {
    // 监听全局错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        // 资源加载错误
        this.reportResourceError(event)
      } else {
        // JS 错误
        this.reportJSError(event)
      }
    }, true)
    
    // 监听 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.reportPromiseError(event)
    })
    
    // 监听 Vue 错误
    if (window.Vue) {
      Vue.config.errorHandler = (err, vm, info) => {
        this.reportVueError(err, vm, info)
      }
    }
    
    // 监听 React 错误
    // 使用 Error Boundary
  }
  
  reportJSError(event) {
    const data = {
      type: 'js-error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: Date.now(),
      url: location.href,
      userAgent: navigator.userAgent,
    }
    
    this.report(data)
  }
  
  reportResourceError(event) {
    const data = {
      type: 'resource-error',
      tagName: event.target.tagName,
      src: event.target.src || event.target.href,
      timestamp: Date.now(),
      url: location.href,
    }
    
    this.report(data)
  }
  
  reportPromiseError(event) {
    const data = {
      type: 'promise-error',
      reason: event.reason,
      promise: event.promise,
      timestamp: Date.now(),
      url: location.href,
    }
    
    this.report(data)
  }
  
  reportVueError(err, vm, info) {
    const data = {
      type: 'vue-error',
      message: err.message,
      stack: err.stack,
      info,
      componentName: vm.$options.name,
      timestamp: Date.now(),
      url: location.href,
    }
    
    this.report(data)
  }
  
  report(data) {
    console.error('[Error]', data)
    // 上报数据
    navigator.sendBeacon('/api/error', JSON.stringify(data))
  }
}

// 使用
const errorMonitor = new ErrorMonitor()
```

### 2. React Error Boundary

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  
  componentDidCatch(error, errorInfo) {
    // 上报错误
    this.reportError({
      type: 'react-error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      url: location.href,
    })
  }
  
  reportError(data) {
    console.error('[React Error]', data)
    navigator.sendBeacon('/api/error', JSON.stringify(data))
  }
  
  render() {
    if (this.state.hasError) {
      return <div>出错了</div>
    }
    return this.props.children
  }
}

// 使用
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## 行为监控

### 1. 用户行为追踪

```javascript
class BehaviorMonitor {
  constructor() {
    this.init()
  }
  
  init() {
    // 监听页面访问
    this.trackPageView()
    
    // 监听点击事件
    this.trackClick()
    
    // 监听页面停留时间
    this.trackStayTime()
    
    // 监听页面可见性
    this.trackVisibility()
  }
  
  trackPageView() {
    const data = {
      type: 'page-view',
      url: location.href,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
    }
    
    this.report(data)
  }
  
  trackClick() {
    document.addEventListener('click', (event) => {
      const target = event.target
      const data = {
        type: 'click',
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        text: target.innerText?.slice(0, 50),
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now(),
      }
      
      this.report(data)
    }, true)
  }
  
  trackStayTime() {
    let startTime = Date.now()
    
    window.addEventListener('beforeunload', () => {
      const stayTime = Date.now() - startTime
      
      this.report({
        type: 'stay-time',
        url: location.href,
        duration: stayTime,
        timestamp: Date.now(),
      })
    })
  }
  
  trackVisibility() {
    document.addEventListener('visibilitychange', () => {
      const data = {
        type: 'visibility',
        visible: !document.hidden,
        timestamp: Date.now(),
      }
      
      this.report(data)
    })
  }
  
  report(data) {
    console.log('[Behavior]', data)
    // 上报数据
  }
}

// 使用
const behaviorMonitor = new BehaviorMonitor()
```

## 数据上报

### 1. 上报策略

```javascript
class Reporter {
  constructor(options = {}) {
    this.url = options.url || '/api/monitor'
    this.queue = []
    this.maxSize = options.maxSize || 10
    this.timeout = options.timeout || 5000
    this.timer = null
  }
  
  // 添加数据到队列
  add(data) {
    this.queue.push({
      ...data,
      timestamp: Date.now(),
      url: location.href,
      userAgent: navigator.userAgent,
    })
    
    // 队列满了立即上报
    if (this.queue.length >= this.maxSize) {
      this.flush()
    } else {
      // 否则延迟上报
      this.scheduleFlush()
    }
  }
  
  // 延迟上报
  scheduleFlush() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    
    this.timer = setTimeout(() => {
      this.flush()
    }, this.timeout)
  }
  
  // 立即上报
  flush() {
    if (this.queue.length === 0) return
    
    const data = this.queue.splice(0, this.maxSize)
    
    // 使用 sendBeacon 上报（页面卸载时也能发送）
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.url, JSON.stringify(data))
    } else {
      // 降级使用 fetch
      fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(console.error)
    }
  }
  
  // 页面卸载时上报
  beforeUnload() {
    window.addEventListener('beforeunload', () => {
      this.flush()
    })
  }
}

// 使用
const reporter = new Reporter({
  url: '/api/monitor',
  maxSize: 10,
  timeout: 5000,
})

reporter.add({ type: 'performance', data: {} })
```

### 2. 数据压缩

```javascript
// 使用 pako 压缩数据
import pako from 'pako'

function compressData(data) {
  const json = JSON.stringify(data)
  const compressed = pako.gzip(json)
  return compressed
}

// 上报压缩数据
fetch('/api/monitor', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/octet-stream',
    'Content-Encoding': 'gzip',
  },
  body: compressData(data),
})
```

## 实战案例

### 完整监控系统

```javascript
class Monitor {
  constructor(options = {}) {
    this.options = options
    this.reporter = new Reporter(options.reporter)
    this.init()
  }
  
  init() {
    // 性能监控
    this.performanceMonitor = new PerformanceMonitor()
    this.performanceMonitor.onReport = (data) => {
      this.reporter.add(data)
    }
    
    // 错误监控
    this.errorMonitor = new ErrorMonitor()
    this.errorMonitor.onReport = (data) => {
      this.reporter.add(data)
    }
    
    // 行为监控
    this.behaviorMonitor = new BehaviorMonitor()
    this.behaviorMonitor.onReport = (data) => {
      this.reporter.add(data)
    }
    
    // 接口监控
    this.apiMonitor = new APIMonitor()
    this.apiMonitor.onReport = (data) => {
      this.reporter.add(data)
    }
    
    // 页面卸载时上报
    window.addEventListener('beforeunload', () => {
      this.reporter.flush()
    })
  }
}

// 使用
const monitor = new Monitor({
  reporter: {
    url: '/api/monitor',
    maxSize: 10,
    timeout: 5000,
  },
})
```

## 最佳实践

1. **采样上报**：不是所有数据都需要上报，可以设置采样率
2. **数据压缩**：上报前压缩数据，减少网络传输
3. **批量上报**：积累一定数量后批量上报，减少请求次数
4. **错误去重**：相同错误只上报一次
5. **用户标识**：添加用户 ID，方便问题定位
6. **环境信息**：记录浏览器、操作系统等信息
7. **隐私保护**：不要上报敏感信息

## 参考资料

- [Web Vitals](https://web.dev/vitals/)
- [Performance API](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance)
- [Sentry](https://sentry.io/)
- [阿里云 ARMS](https://www.aliyun.com/product/arms)

---

> 💡 **学习建议**：前端监控是保障应用质量的重要手段。建议先学习性能监控和错误监控，然后通过实战项目积累经验。重点关注 Web Vitals、错误捕获、数据上报等核心知识点。
