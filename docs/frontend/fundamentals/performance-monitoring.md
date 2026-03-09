# 前端性能监控与分析完全指南

> 更新时间：2025-02

## 目录

[[toc]]

## 什么是性能监控

性能监控是指通过技术手段收集、分析和报告网站性能数据，帮助开发者发现性能瓶颈、优化用户体验。

### 监控目标

- **发现性能问题**：慢页面、慢接口、资源加载失败
- **量化用户体验**：真实用户的性能数据（RUM）
- **持续优化**：建立性能基线、设置性能预算
- **问题定位**：快速定位性能瓶颈

### 监控指标体系

```
性能监控指标
├── 加载性能
│   ├── FCP (First Contentful Paint)
│   ├── LCP (Largest Contentful Paint)
│   ├── FID (First Input Delay)
│   ├── CLS (Cumulative Layout Shift)
│   └── TTFB (Time to First Byte)
├── 运行时性能
│   ├── 长任务 (Long Tasks)
│   ├── 内存使用
│   ├── CPU 使用
│   └── 帧率 (FPS)
├── 资源性能
│   ├── 资源加载时间
│   ├── 资源大小
│   ├── 资源数量
│   └── 缓存命中率
└── 业务指标
    ├── 页面访问量 (PV)
    ├── 独立访客 (UV)
    ├── 跳出率
    └── 转化率
```

## Performance API 完全指南

### 1. Navigation Timing API

```javascript
// 页面加载性能监控
class NavigationMonitor {
  // 获取页面加载时间
  getPageLoadTime() {
    const timing = performance.timing
    
    return {
      // DNS 查询时间
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      
      // TCP 连接时间
      tcp: timing.connectEnd - timing.connectStart,
      
      // SSL 握手时间
      ssl: timing.secureConnectionStart 
        ? timing.connectEnd - timing.secureConnectionStart 
        : 0,
      
      // TTFB (Time to First Byte)
      ttfb: timing.responseStart - timing.requestStart,
      
      // 响应下载时间
      response: timing.responseEnd - timing.responseStart,
      
      // DOM 解析时间
      domParse: timing.domInteractive - timing.domLoading,
      
      // DOM 内容加载完成时间
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      
      // 页面完全加载时间
      load: timing.loadEventEnd - timing.navigationStart,
      
      // 首次渲染时间
      firstPaint: this.getFirstPaint(),
      
      // 首次内容渲染时间
      firstContentfulPaint: this.getFirstContentfulPaint()
    }
  }
  
  // 获取 First Paint
  getFirstPaint() {
    const entries = performance.getEntriesByType('paint')
    const fp = entries.find(entry => entry.name === 'first-paint')
    return fp ? fp.startTime : 0
  }
  
  // 获取 First Contentful Paint
  getFirstContentfulPaint() {
    const entries = performance.getEntriesByType('paint')
    const fcp = entries.find(entry => entry.name === 'first-contentful-paint')
    return fcp ? fcp.startTime : 0
  }
  
  // 获取页面加载瀑布图数据
  getWaterfallData() {
    const resources = performance.getEntriesByType('resource')
    
    return resources.map(resource => ({
      name: resource.name,
      type: resource.initiatorType,
      duration: resource.duration,
      size: resource.transferSize,
      startTime: resource.startTime,
      // 详细时间分解
      timing: {
        dns: resource.domainLookupEnd - resource.domainLookupStart,
        tcp: resource.connectEnd - resource.connectStart,
        request: resource.responseStart - resource.requestStart,
        response: resource.responseEnd - resource.responseStart
      }
    }))
  }
  
  // 上报性能数据
  report() {
    // 等待页面完全加载
    window.addEventListener('load', () => {
      setTimeout(() => {
        const data = this.getPageLoadTime()
        
        // 发送到监控服务器
        navigator.sendBeacon('/api/performance', JSON.stringify({
          type: 'navigation',
          url: location.href,
          data,
          timestamp: Date.now()
        }))
      }, 0)
    })
  }
}

// 使用示例
const monitor = new NavigationMonitor()
monitor.report()
```

### 2. Resource Timing API

```javascript
// 资源加载性能监控
class ResourceMonitor {
  constructor() {
    this.observer = null
  }
  
  // 监控资源加载
  observe() {
    // 使用 PerformanceObserver 监听新资源
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.analyzeResource(entry)
      }
    })
    
    this.observer.observe({ entryTypes: ['resource'] })
    
    // 分析已加载的资源
    const resources = performance.getEntriesByType('resource')
    resources.forEach(resource => this.analyzeResource(resource))
  }
  
  // 分析单个资源
  analyzeResource(entry) {
    const data = {
      name: entry.name,
      type: entry.initiatorType,
      duration: entry.duration,
      size: entry.transferSize,
      
      // 判断是否使用缓存
      cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
      
      // 判断是否加载失败
      failed: entry.duration === 0,
      
      // 判断是否加载缓慢（超过 3 秒）
      slow: entry.duration > 3000,
      
      // 判断是否体积过大（超过 500KB）
      large: entry.transferSize > 500 * 1024
    }
    
    // 上报慢资源
    if (data.slow || data.large) {
      this.reportSlowResource(data)
    }
    
    // 上报失败资源
    if (data.failed) {
      this.reportFailedResource(data)
    }
  }
  
  // 上报慢资源
  reportSlowResource(data) {
    navigator.sendBeacon('/api/performance/slow-resource', JSON.stringify({
      ...data,
      url: location.href,
      timestamp: Date.now()
    }))
  }
  
  // 上报失败资源
  reportFailedResource(data) {
    navigator.sendBeacon('/api/performance/failed-resource', JSON.stringify({
      ...data,
      url: location.href,
      timestamp: Date.now()
    }))
  }
  
  // 获取资源统计
  getResourceStats() {
    const resources = performance.getEntriesByType('resource')
    
    const stats = {
      total: resources.length,
      byType: {},
      totalSize: 0,
      totalDuration: 0,
      cached: 0,
      failed: 0
    }
    
    resources.forEach(resource => {
      // 按类型统计
      const type = resource.initiatorType
      if (!stats.byType[type]) {
        stats.byType[type] = { count: 0, size: 0, duration: 0 }
      }
      stats.byType[type].count++
      stats.byType[type].size += resource.transferSize
      stats.byType[type].duration += resource.duration
      
      // 总计
      stats.totalSize += resource.transferSize
      stats.totalDuration += resource.duration
      
      // 缓存命中
      if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
        stats.cached++
      }
      
      // 加载失败
      if (resource.duration === 0) {
        stats.failed++
      }
    })
    
    return stats
  }
  
  // 断开监听
  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// 使用示例
const resourceMonitor = new ResourceMonitor()
resourceMonitor.observe()

// 页面卸载时获取统计
window.addEventListener('beforeunload', () => {
  const stats = resourceMonitor.getResourceStats()
  console.log('资源统计:', stats)
  resourceMonitor.disconnect()
})
```

### 3. User Timing API

```javascript
// 自定义性能标记
class UserTimingMonitor {
  // 标记时间点
  mark(name) {
    performance.mark(name)
  }
  
  // 测量两个标记之间的时间
  measure(name, startMark, endMark) {
    performance.measure(name, startMark, endMark)
    
    const measure = performance.getEntriesByName(name, 'measure')[0]
    return measure ? measure.duration : 0
  }
  
  // 清除标记
  clearMarks(name) {
    if (name) {
      performance.clearMarks(name)
    } else {
      performance.clearMarks()
    }
  }
  
  // 清除测量
  clearMeasures(name) {
    if (name) {
      performance.clearMeasures(name)
    } else {
      performance.clearMeasures()
    }
  }
  
  // 获取所有测量结果
  getMeasures() {
    return performance.getEntriesByType('measure')
  }
}

// 使用示例：测量组件渲染时间
const timing = new UserTimingMonitor()

// Vue 组件
export default {
  name: 'MyComponent',
  
  beforeMount() {
    timing.mark('component-mount-start')
  },
  
  mounted() {
    timing.mark('component-mount-end')
    const duration = timing.measure(
      'component-mount',
      'component-mount-start',
      'component-mount-end'
    )
    console.log(`组件挂载耗时: ${duration}ms`)
  },
  
  beforeUpdate() {
    timing.mark('component-update-start')
  },
  
  updated() {
    timing.mark('component-update-end')
    const duration = timing.measure(
      'component-update',
      'component-update-start',
      'component-update-end'
    )
    console.log(`组件更新耗时: ${duration}ms`)
  }
}

// React 组件
function MyComponent() {
  useEffect(() => {
    timing.mark('component-mount-start')
    
    return () => {
      timing.mark('component-mount-end')
      const duration = timing.measure(
        'component-mount',
        'component-mount-start',
        'component-mount-end'
      )
      console.log(`组件挂载耗时: ${duration}ms`)
    }
  }, [])
  
  return <div>My Component</div>
}

// 测量 API 请求时间
async function fetchData(url) {
  timing.mark('fetch-start')
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    timing.mark('fetch-end')
    const duration = timing.measure('fetch', 'fetch-start', 'fetch-end')
    
    console.log(`API 请求耗时: ${duration}ms`)
    
    return data
  } catch (error) {
    timing.mark('fetch-error')
    throw error
  }
}
```

## Web Vitals 核心指标

### 1. LCP (Largest Contentful Paint)

```javascript
// 监控 LCP
class LCPMonitor {
  constructor() {
    this.lcp = 0
    this.observer = null
  }
  
  observe() {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      // 更新 LCP 值
      this.lcp = lastEntry.renderTime || lastEntry.loadTime
      
      console.log('LCP:', this.lcp)
      
      // 判断 LCP 是否良好
      if (this.lcp <= 2500) {
        console.log('✅ LCP 良好')
      } else if (this.lcp <= 4000) {
        console.log('⚠️ LCP 需要改进')
      } else {
        console.log('❌ LCP 较差')
      }
    })
    
    this.observer.observe({ entryTypes: ['largest-contentful-paint'] })
  }
  
  // 上报 LCP
  report() {
    // 页面隐藏时上报
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        navigator.sendBeacon('/api/performance/lcp', JSON.stringify({
          lcp: this.lcp,
          url: location.href,
          timestamp: Date.now()
        }))
        
        this.disconnect()
      }
    })
  }
  
  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// 使用示例
const lcpMonitor = new LCPMonitor()
lcpMonitor.observe()
lcpMonitor.report()
```

### 2. FID (First Input Delay)

```javascript
// 监控 FID
class FIDMonitor {
  constructor() {
    this.fid = 0
    this.observer = null
  }
  
  observe() {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach(entry => {
        // FID 是第一次交互的延迟
        if (entry.processingStart && entry.startTime) {
          this.fid = entry.processingStart - entry.startTime
          
          console.log('FID:', this.fid)
          
          // 判断 FID 是否良好
          if (this.fid <= 100) {
            console.log('✅ FID 良好')
          } else if (this.fid <= 300) {
            console.log('⚠️ FID 需要改进')
          } else {
            console.log('❌ FID 较差')
          }
          
          // 上报 FID
          this.report()
        }
      })
    })
    
    this.observer.observe({ entryTypes: ['first-input'] })
  }
  
  report() {
    navigator.sendBeacon('/api/performance/fid', JSON.stringify({
      fid: this.fid,
      url: location.href,
      timestamp: Date.now()
    }))
    
    this.disconnect()
  }
  
  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// 使用示例
const fidMonitor = new FIDMonitor()
fidMonitor.observe()
```

### 3. CLS (Cumulative Layout Shift)

```javascript
// 监控 CLS
class CLSMonitor {
  constructor() {
    this.cls = 0
    this.observer = null
  }
  
  observe() {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach(entry => {
        // 只统计非用户输入导致的布局偏移
        if (!entry.hadRecentInput) {
          this.cls += entry.value
          
          console.log('CLS:', this.cls)
          console.log('布局偏移元素:', entry.sources)
          
          // 判断 CLS 是否良好
          if (this.cls <= 0.1) {
            console.log('✅ CLS 良好')
          } else if (this.cls <= 0.25) {
            console.log('⚠️ CLS 需要改进')
          } else {
            console.log('❌ CLS 较差')
          }
        }
      })
    })
    
    this.observer.observe({ entryTypes: ['layout-shift'] })
  }
  
  // 上报 CLS
  report() {
    // 页面隐藏时上报
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        navigator.sendBeacon('/api/performance/cls', JSON.stringify({
          cls: this.cls,
          url: location.href,
          timestamp: Date.now()
        }))
        
        this.disconnect()
      }
    })
  }
  
  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// 使用示例
const clsMonitor = new CLSMonitor()
clsMonitor.observe()
clsMonitor.report()
```

### 4. 使用 web-vitals 库

```javascript
// 安装: npm install web-vitals

import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals'

// 监控所有 Web Vitals 指标
function reportWebVitals() {
  // CLS
  onCLS((metric) => {
    console.log('CLS:', metric.value)
    sendToAnalytics(metric)
  })
  
  // FID
  onFID((metric) => {
    console.log('FID:', metric.value)
    sendToAnalytics(metric)
  })
  
  // LCP
  onLCP((metric) => {
    console.log('LCP:', metric.value)
    sendToAnalytics(metric)
  })
  
  // FCP
  onFCP((metric) => {
    console.log('FCP:', metric.value)
    sendToAnalytics(metric)
  })
  
  // TTFB
  onTTFB((metric) => {
    console.log('TTFB:', metric.value)
    sendToAnalytics(metric)
  })
}

// 上报到分析服务
function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    id: metric.id,
    url: location.href,
    timestamp: Date.now()
  })
  
  // 使用 sendBeacon 确保数据发送
  navigator.sendBeacon('/api/performance/web-vitals', body)
}

// 启动监控
reportWebVitals()
```

## 长任务监控

```javascript
// 监控长任务（超过 50ms 的任务）
class LongTaskMonitor {
  constructor() {
    this.longTasks = []
    this.observer = null
  }
  
  observe() {
    // 检查浏览器是否支持 Long Tasks API
    if (!('PerformanceLongTaskTiming' in window)) {
      console.warn('浏览器不支持 Long Tasks API')
      return
    }
    
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach(entry => {
        const task = {
          duration: entry.duration,
          startTime: entry.startTime,
          attribution: entry.attribution,
          // 获取调用栈（如果可用）
          stack: this.getStack()
        }
        
        this.longTasks.push(task)
        
        console.warn(`⚠️ 检测到长任务: ${entry.duration}ms`, task)
        
        // 上报长任务
        this.reportLongTask(task)
      })
    })
    
    this.observer.observe({ entryTypes: ['longtask'] })
  }
  
  // 获取调用栈
  getStack() {
    try {
      throw new Error()
    } catch (e) {
      return e.stack
    }
  }
  
  // 上报长任务
  reportLongTask(task) {
    navigator.sendBeacon('/api/performance/long-task', JSON.stringify({
      ...task,
      url: location.href,
      timestamp: Date.now()
    }))
  }
  
  // 获取长任务统计
  getStats() {
    return {
      total: this.longTasks.length,
      totalDuration: this.longTasks.reduce((sum, task) => sum + task.duration, 0),
      avgDuration: this.longTasks.length > 0
        ? this.longTasks.reduce((sum, task) => sum + task.duration, 0) / this.longTasks.length
        : 0,
      maxDuration: Math.max(...this.longTasks.map(task => task.duration))
    }
  }
  
  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// 使用示例
const longTaskMonitor = new LongTaskMonitor()
longTaskMonitor.observe()

// 页面卸载时获取统计
window.addEventListener('beforeunload', () => {
  const stats = longTaskMonitor.getStats()
  console.log('长任务统计:', stats)
  longTaskMonitor.disconnect()
})
```


## 内存监控

```javascript
// 内存使用监控
class MemoryMonitor {
  constructor() {
    this.samples = []
    this.timer = null
  }
  
  // 开始监控
  start(interval = 5000) {
    // 检查浏览器是否支持 Memory API
    if (!performance.memory) {
      console.warn('浏览器不支持 Memory API')
      return
    }
    
    this.timer = setInterval(() => {
      const memory = performance.memory
      
      const sample = {
        // 已使用的 JS 堆内存（字节）
        usedJSHeapSize: memory.usedJSHeapSize,
        // JS 堆内存总大小（字节）
        totalJSHeapSize: memory.totalJSHeapSize,
        // JS 堆内存限制（字节）
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        // 使用率
        usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100).toFixed(2),
        timestamp: Date.now()
      }
      
      this.samples.push(sample)
      
      console.log('内存使用:', {
        used: `${(sample.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(sample.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(sample.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
        usage: `${sample.usage}%`
      })
      
      // 内存使用超过 90% 时告警
      if (sample.usage > 90) {
        console.error('❌ 内存使用过高:', sample.usage + '%')
        this.reportHighMemory(sample)
      }
    }, interval)
  }
  
  // 停止监控
  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
  
  // 上报高内存使用
  reportHighMemory(sample) {
    navigator.sendBeacon('/api/performance/high-memory', JSON.stringify({
      ...sample,
      url: location.href
    }))
  }
  
  // 获取内存统计
  getStats() {
    if (this.samples.length === 0) return null
    
    const usages = this.samples.map(s => parseFloat(s.usage))
    
    return {
      samples: this.samples.length,
      avgUsage: (usages.reduce((a, b) => a + b, 0) / usages.length).toFixed(2),
      maxUsage: Math.max(...usages).toFixed(2),
      minUsage: Math.min(...usages).toFixed(2)
    }
  }
}

// 使用示例
const memoryMonitor = new MemoryMonitor()
memoryMonitor.start(5000) // 每 5 秒采样一次

// 页面卸载时停止监控
window.addEventListener('beforeunload', () => {
  const stats = memoryMonitor.getStats()
  console.log('内存统计:', stats)
  memoryMonitor.sto
gs: {
    // 模拟移动设备
    formFactor: 'mobile',
    // 模拟 3G 网络
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4
    },
    // 只审计性能
    onlyCategories: ['performance'],
    // 跳过某些审计
    skipAudits: ['uses-http2']
  }
}
```

### 3. 使用 Lighthouse CI

```yaml
# .lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["https://example.com"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

```yaml
# GitHub Actions 集成
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install && npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

## Chrome DevTools 性能分析

### 1. Performance 面板

```javascript
// 使用 Performance API 标记关键时间点
performance.mark('app-init-start')

// 初始化应用
initApp()

performance.mark('app-init-end')
performance.measure('app-init', 'app-init-start', 'app-init-end')

// 在 DevTools Performance 面板中可以看到这些标记
```

### 2. Coverage 面板

```javascript
// 分析代码覆盖率
// 1. 打开 DevTools
// 2. Cmd+Shift+P (Mac) 或 Ctrl+Shift+P (Windows)
// 3. 输入 "Coverage"
// 4. 点击 "Start instrumenting coverage and reload page"
// 5. 查看未使用的代码（红色部分）

// 优化建议：
// - 移除未使用的代码
// - 使用代码分割
// - 按需加载
```

### 3. Network 面板

```javascript
// 分析网络请求
// 1. 打开 DevTools Network 面板
// 2. 勾选 "Disable cache"
// 3. 刷新页面
// 4. 查看瀑布图

// 优化建议：
// - 减少请求数量（合并资源）
// - 减小资源体积（压缩、Tree Shaking）
// - 使用 CDN
// - 启用 HTTP/2
// - 使用缓存
```

## 真实用户监控（RUM）

### 1. 完整的 RUM 系统

```javascript
// RUM 监控系统
class RUMMonitor {
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || '/api/rum',
      sampleRate: config.sampleRate || 1, // 采样率 0-1
      ...config
    }
    
    this.data = {
      // 页面信息
      page: {
        url: location.href,
        title: document.title,
        referrer: document.referrer
      },
      // 用户信息
      user: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`
      },
      // 性能数据
      performance: {},
      // 错误信息
      errors: [],
      // 用户行为
      behaviors: []
    }
    
    this.init()
  }
  
  init() {
    // 采样控制
    if (Math.random() > this.config.sampleRate) {
      return
    }
    
    // 监控性能
    this.monitorPerformance()
    
    // 监控错误
    this.monitorErrors()
    
    // 监控用户行为
    this.monitorBehaviors()
    
    // 页面卸载时上报
    this.reportOnUnload()
  }
  
  // 监控性能
  monitorPerformance() {
    // Navigation Timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing
        
        this.data.performance.navigation = {
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          tcp: timing.connectEnd - timing.connectStart,
          ttfb: timing.responseStart - timing.requestStart,
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          load: timing.loadEventEnd - timing.navigationStart
        }
      }, 0)
    })
    
    // Web Vitals
    if (typeof PerformanceObserver !== 'undefined') {
      // LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.data.performance.lcp = lastEntry.renderTime || lastEntry.loadTime
      }).observe({ entryTypes: ['largest-contentful-paint'] })
      
      // FID
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          this.data.performance.fid = entry.processingStart - entry.startTime
        })
      }).observe({ entryTypes: ['first-input'] })
      
      // CLS
      let cls = 0
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            cls += entry.value
          }
        })
        this.data.performance.cls = cls
      }).observe({ entryTypes: ['layout-shift'] })
    }
  }
  
  // 监控错误
  monitorErrors() {
    // JS 错误
    window.addEventListener('error', (event) => {
      this.data.errors.push({
        type: 'js-error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      })
    })
    
    // Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.data.errors.push({
        type: 'promise-error',
        reason: event.reason,
        timestamp: Date.now()
      })
    })
    
    // 资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.data.errors.push({
          type: 'resource-error',
          tagName: event.target.tagName,
          src: event.target.src || event.target.href,
          timestamp: Date.now()
        })
      }
    }, true)
  }
  
  // 监控用户行为
  monitorBehaviors() {
    // 页面可见性
    document.addEventListener('visibilitychange', () => {
      this.data.behaviors.push({
        type: 'visibility-change',
        visible: document.visibilityState === 'visible',
        timestamp: Date.now()
      })
    })
    
    // 页面停留时间
    const startTime = Date.now()
    window.addEventListener('beforeunload', () => {
      this.data.behaviors.push({
        type: 'page-duration',
        duration: Date.now() - startTime,
        timestamp: Date.now()
      })
    })
  }
  
  // 页面卸载时上报
  reportOnUnload() {
    window.addEventListener('beforeunload', () => {
      this.report()
    })
    
    // 页面隐藏时也上报（处理移动端场景）
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.report()
      }
    })
  }
  
  // 上报数据
  report() {
    const body = JSON.stringify({
      ...this.data,
      timestamp: Date.now()
    })
    
    // 使用 sendBeacon 确保数据发送
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.config.apiUrl, body)
    } else {
      // 降级方案
      fetch(this.config.apiUrl, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      }).catch(() => {})
    }
  }
}

// 使用示例
const rum = new RUMMonitor({
  apiUrl: '/api/rum',
  sampleRate: 0.1 // 10% 采样率
})
```

### 2. RUM 数据分析

```javascript
// 后端数据分析示例（Node.js）
class RUMAnalyzer {
  constructor(db) {
    this.db = db
  }
  
  // 分析性能数据
  async analyzePerformance(timeRange) {
    const data = await this.db.query(`
      SELECT 
        AVG(performance.lcp) as avg_lcp,
        AVG(performance.fid) as avg_fid,
        AVG(performance.cls) as avg_cls,
        AVG(performance.navigation.ttfb) as avg_ttfb,
        AVG(performance.navigation.load) as avg_load
      FROM rum_data
      WHERE timestamp BETWEEN ? AND ?
    `, [timeRange.start, timeRange.end])
    
    return {
      lcp: {
        value: data.avg_lcp,
        rating: this.rateLCP(data.avg_lcp)
      },
      fid: {
        value: data.avg_fid,
        rating: this.rateFID(data.avg_fid)
      },
      cls: {
        value: data.avg_cls,
        rating: this.rateCLS(data.avg_cls)
      },
      ttfb: data.avg_ttfb,
      load: data.avg_load
    }
  }
  
  // LCP 评级
  rateLCP(value) {
    if (value <= 2500) return 'good'
    if (value <= 4000) return 'needs-improvement'
    return 'poor'
  }
  
  // FID 评级
  rateFID(value) {
    if (value <= 100) return 'good'
    if (value <= 300) return 'needs-improvement'
    return 'poor'
  }
  
  // CLS 评级
  rateCLS(value) {
    if (value <= 0.1) return 'good'
    if (value <= 0.25) return 'needs-improvement'
    return 'poor'
  }
  
  // 分析错误数据
  async analyzeErrors(timeRange) {
    const data = await this.db.query(`
      SELECT 
        type,
        COUNT(*) as count,
        message
      FROM rum_errors
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY type, message
      ORDER BY count DESC
      LIMIT 10
    `, [timeRange.start, timeRange.end])
    
    return data
  }
  
  // 分析用户行为
  async analyzeBehaviors(timeRange) {
    const data = await this.db.query(`
      SELECT 
        AVG(duration) as avg_duration,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as page_views
      FROM rum_behaviors
      WHERE type = 'page-duration'
        AND timestamp BETWEEN ? AND ?
    `, [timeRange.start, timeRange.end])
    
    return data
  }
}
```

## 性能预算（Performance Budget）

### 1. 设置性能预算

```javascript
// performance-budget.json
{
  "budgets": [
    {
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 300
        },
        {
          "resourceType": "stylesheet",
          "budget": 100
        },
        {
          "resourceType": "image",
          "budget": 500
        },
        {
          "resourceType": "font",
          "budget": 100
        },
        {
          "resourceType": "total",
          "budget": 1000
        }
      ]
    },
    {
      "timings": [
        {
          "metric": "first-contentful-paint",
          "budget": 2000
        },
        {
          "metric": "largest-contentful-paint",
          "budget": 2500
        },
        {
          "metric": "cumulative-layout-shift",
          "budget": 0.1
        },
        {
          "metric": "first-input-delay",
          "budget": 100
        }
      ]
    }
  ]
}
```

### 2. Webpack 性能预算

```javascript
// webpack.config.js
module.exports = {
  performance: {
    // 性能提示
    hints: 'warning', // 'error' | 'warning' | false
    
    // 入口文件最大体积（字节）
    maxEntrypointSize: 300 * 1024, // 300KB
    
    // 单个资源最大体积（字节）
    maxAssetSize: 200 * 1024, // 200KB
    
    // 只检查 JS 和 CSS 文件
    assetFilter: function(assetFilename) {
      return /\.(js|css)$/.test(assetFilename)
    }
  }
}
```

### 3. 监控性能预算

```javascript
// 性能预算监控
class PerformanceBudgetMonitor {
  constructor(budget) {
    this.budget = budget
  }
  
  // 检查资源体积
  checkResourceSizes() {
    const resources = performance.getEntriesByType('resource')
    const violations = []
    
    // 按类型分组
    const byType = {}
    resources.forEach(resource => {
      const type = resource.initiatorType
      if (!byType[type]) {
        byType[type] = { size: 0, count: 0 }
      }
      byType[type].size += resource.transferSize
      byType[type].count++
    })
    
    // 检查预算
    this.budget.resourceSizes.forEach(item => {
      const actual = byType[item.resourceType]?.size || 0
      const budget = item.budget * 1024 // KB to bytes
      
      if (actual > budget) {
        violations.push({
          type: 'resource-size',
          resourceType: item.resourceType,
          actual: (actual / 1024).toFixed(2) + ' KB',
          budget: item.budget + ' KB',
          exceeded: ((actual - budget) / 1024).toFixed(2) + ' KB'
        })
      }
    })
    
    return violations
  }
  
  // 检查性能指标
  checkTimings() {
    const violations = []
    
    this.budget.timings.forEach(item => {
      let actual = 0
      
      switch (item.metric) {
        case 'first-contentful-paint':
          const fcp = performance.getEntriesByName('first-contentful-paint')[0]
          actual = fcp?.startTime || 0
          break
        case 'largest-contentful-paint':
          // 需要使用 PerformanceObserver 获取
          break
        // ... 其他指标
      }
      
      if (actual > item.budget) {
        violations.push({
          type: 'timing',
          metric: item.metric,
          actual: actual.toFixed(2) + ' ms',
          budget: item.budget + ' ms',
          exceeded: (actual - item.budget).toFixed(2) + ' ms'
        })
      }
    })
    
    return violations
  }
  
  // 生成报告
  generateReport() {
    const resourceViolations = this.checkResourceSizes()
    const timingViolations = this.checkTimings()
    
    const report = {
      passed: resourceViolations.length === 0 && timingViolations.length === 0,
      violations: [...resourceViolations, ...timingViolations]
    }
    
    if (!report.passed) {
      console.error('❌ 性能预算超标:', report.violations)
    } else {
      console.log('✅ 性能预算检查通过')
    }
    
    return report
  }
}

// 使用示例
const budget = {
  resourceSizes: [
    { resourceType: 'script', budget: 300 },
    { resourceType: 'stylesheet', budget: 100 }
  ],
  timings: [
    { metric: 'first-contentful-paint', budget: 2000 }
  ]
}

const monitor = new PerformanceBudgetMonitor(budget)

window.addEventListener('load', () => {
  setTimeout(() => {
    const report = monitor.generateReport()
    
    // 上报到监控服务
    if (!report.passed) {
      navigator.sendBeacon('/api/performance/budget-violation', JSON.stringify(report))
    }
  }, 0)
})
```


## 性能监控最佳实践

### 1. 采样策略

```javascript
// 智能采样
class SamplingStrategy {
  constructor() {
    this.sampleRate = this.calculateSampleRate()
  }
  
  // 计算采样率
  calculateSampleRate() {
    // 根据用户类型调整采样率
    const userType = this.getUserType()
    
    switch (userType) {
      case 'new':
        return 1.0 // 新用户 100% 采样
      case 'active':
        return 0.1 // 活跃用户 10% 采样
      case 'inactive':
        return 0.01 // 不活跃用户 1% 采样
      default:
        return 0.1
    }
  }
  
  // 获取用户类型
  getUserType() {
    const visitCount = parseInt(localStorage.getItem('visitCount') || '0')
    
    if (visitCount === 0) return 'new'
    if (visitCount > 10) return 'active'
    return 'inactive'
  }
  
  // 是否应该采样
  shouldSample() {
    return Math.random() < this.sampleRate
  }
}

// 使用示例
const sampling = new SamplingStrategy()

if (sampling.shouldSample()) {
  // 启动性能监控
  startPerformanceMonitoring()
}
```

### 2. 数据聚合

```javascript
// 数据聚合器
class DataAggregator {
  constructor() {
    this.buffer = []
    this.maxSize = 10
    this.flushInterval = 30000 // 30 秒
    
    this.startAutoFlush()
  }
  
  // 添加数据
  add(data) {
    this.buffer.push(data)
    
    // 缓冲区满时立即上报
    if (this.buffer.length >= this.maxSize) {
      this.flush()
    }
  }
  
  // 上报数据
  flush() {
    if (this.buffer.length === 0) return
    
    const data = {
      items: this.buffer,
      count: this.buffer.length,
      timestamp: Date.now()
    }
    
    navigator.sendBeacon('/api/performance/batch', JSON.stringify(data))
    
    this.buffer = []
  }
  
  // 自动上报
  startAutoFlush() {
    setInterval(() => {
      this.flush()
    }, this.flushInterval)
    
    // 页面卸载时上报
    window.addEventListener('beforeunload', () => {
      this.flush()
    })
  }
}

// 使用示例
const aggregator = new DataAggregator()

// 添加性能数据
aggregator.add({
  type: 'lcp',
  value: 2300,
  url: location.href
})
```

### 3. 异常处理

```javascript
// 监控系统异常处理
class MonitorErrorHandler {
  constructor() {
    this.errors = []
    this.maxErrors = 100
  }
  
  // 捕获监控系统自身的错误
  wrapMonitor(fn) {
    return (...args) => {
      try {
        return fn(...args)
      } catch (error) {
        this.handleError(error)
      }
    }
  }
  
  // 处理错误
  handleError(error) {
    // 记录错误
    this.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    })
    
    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }
    
    // 静默失败，不影响主应用
    console.warn('监控系统错误:', error)
  }
  
  // 获取错误统计
  getErrorStats() {
    return {
      total: this.errors.length,
      recent: this.errors.slice(-10)
    }
  }
}
  return urlObj.toString()
    } catch {
      return url
    }
  }
  
  // 脱敏错误堆栈
  sanitizeStack(stack) {
    if (!stack) return stack
    
    // 移除文件路径中的用户名
    return stack.replace(/\/Users\/[^\/]+\//g, '/Users/***/')
                .replace(/C:\\Users\\[^\\]+\\/g, 'C:\\Users\\***\\')
  }
  
  // 脱敏用户信息
  sanitizeUserInfo(userInfo) {
    return {
      ...userInfo,
      // 只保留浏览器类型，不保留完整 UA
      userAgent: this.getBrowserType(userInfo.userAgent),
      // 只保留屏幕分辨率范围
      screenResolution: this.getResolutionRange(userInfo.screenResolution)
    }
  }
  
  // 获取浏览器类型
  getBrowserType(ua) {
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari')) return 'Safari'
    return 'Other'
  }
  
  // 获取分辨率范围
  getResolutionRange(resolution) {
    const [width] = resolution.split('x').map(Number)
    
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    if (width < 1920) return 'desktop'
    return 'large-desktop'
  }
}

// 使用示例
const sanitizer = new DataSanitizer()

const data = {
  url: sanitizer.sanitizeUrl(location.href),
  user: sanitizer.sanitizeUserInfo({
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`
  })
}
```

## 常见问题

### 1. 如何选择性能监控指标？

**核心指标（必须监控）**：
- LCP：衡量加载性能
- FID：衡量交互性能
- CLS：衡量视觉稳定性
- TTFB：衡量服务器响应速度

**辅助指标（建议监控）**：
- FCP：首次内容渲染
- 长任务：影响交互性
- 资源加载：影响加载速度
- 内存使用：影响稳定性

### 2. 如何设置合理的采样率？

```javascript
// 根据流量和成本平衡
const sampleRates = {
  // 高流量站点：1-5%
  highTraffic: 0.01,
  
  // 中等流量：10-20%
  mediumTraffic: 0.1,
  
  // 低流量站点：50-100%
  lowTraffic: 0.5,
  
  // 新功能：100%（短期）
  newFeature: 1.0
}
```

### 3. 如何避免监控影响性能？

```javascript
// 最佳实践
const bestPractices = {
  // 1. 使用 PerformanceObserver（异步）
  usePerformanceObserver: true,
  
  // 2. 批量上报数据
  batchReporting: true,
  
  // 3. 使用 sendBeacon（不阻塞）
  useSendBeacon: true,
  
  // 4. 采样控制
  sampling: true,
  
  // 5. 延迟初始化
  deferInit: true,
  
  // 6. 异常处理
  errorHandling: true
}
```

### 4. 如何处理跨域资源的性能数据？

```html
<!-- 添加 Timing-Allow-Origin 响应头 -->
<!-- 服务器端配置 -->
Access-Control-Allow-Origin: *
Timing-Allow-Origin: *

<!-- 或者在资源标签上添加 crossorigin 属性 -->
<script src="https://cdn.example.com/script.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.example.com/style.css" crossorigin="anonymous">
```

## 面试要点

### 核心概念

1. **Performance API 的作用**
   - Navigation Timing：页面加载性能
   - Resource Timing：资源加载性能
   - User Timing：自定义性能标记
   - Paint Timing：渲染性能

2. **Web Vitals 核心指标**
   - LCP：最大内容渲染时间（< 2.5s）
   - FID：首次输入延迟（< 100ms）
   - CLS：累积布局偏移（< 0.1）

3. **真实用户监控（RUM）vs 合成监控（Synthetic）**
   - RUM：真实用户数据，反映实际体验
   - Synthetic：模拟测试，可控环境

### 实战经验

1. **如何实现性能监控系统？**
   - 数据采集：Performance API、PerformanceObserver
   - 数据上报：sendBeacon、批量上报
   - 数据分析：聚合、统计、告警
   - 可视化：图表、趋势、对比

2. **如何优化监控系统性能？**
   - 采样策略：根据流量调整
   - 批量上报：减少请求次数
   - 异步处理：不阻塞主线程
   - 异常处理：静默失败

3. **如何设置性能预算？**
   - 资源体积：JS < 300KB、CSS < 100KB
   - 性能指标：LCP < 2.5s、FID < 100ms
   - 监控告警：超标时通知
   - 持续优化：定期review

## 参考资料

### 官方文档
- [Performance API - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

### 工具库
- [web-vitals](https://github.com/GoogleChrome/web-vitals) - Google 官方 Web Vitals 库
- [perfume.js](https://github.com/Zizzamia/perfume.js) - 性能监控库
- [PerformanceObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceObserver) - 性能观察器

### 学习资源
- [性能优化指南 - Google](https://web.dev/fast/)
- [前端性能优化 - 掘金](https://juejin.cn/post/6844904153869713416)
- [性能监控实践 - 知乎](https://zhuanlan.zhihu.com/p/163974747)

---

> 💡 **提示**：性能监控是持续优化的基础，建立完善的监控体系可以帮助我们及时发现和解决性能问题，提升用户体验。
