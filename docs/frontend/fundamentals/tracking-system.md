# 前端埋点系统设计与实现

> 用户行为追踪、数据采集与分析 | 更新时间：2025-02

## 目录

- [埋点基础](#埋点基础)
- [埋点方案](#埋点方案)
- [SDK 设计](#sdk-设计)
- [数据上报](#数据上报)
- [实战案例](#实战案例)
- [面试要点](#面试要点)

---

## 埋点基础

### 1. 什么是埋点

```
┌─────────────────────────────────────────────────────────────┐
│                    埋点系统架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  前端采集层                                                  │
│  ├── 页面浏览（PV/UV）                                      │
│  ├── 用户行为（点击、滚动、停留）                           │
│  ├── 业务事件（注册、购买、分享）                           │
│  └── 性能数据（加载时间、错误）                             │
│                                                              │
│  数据处理层                                                  │
│  ├── 数据清洗                                               │
│  ├── 数据聚合                                               │
│  ├── 数据存储                                               │
│  └── 实时计算                                               │
│                                                              │
│  数据应用层                                                  │
│  ├── 数据可视化                                             │
│  ├── 用户画像                                               │
│  ├── 漏斗分析                                               │
│  └── A/B 测试                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. 埋点类型

| 类型 | 说明 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| 代码埋点 | 手动在代码中插入埋点 | 精确、灵活 | 开发成本高 | 核心业务 |
| 可视化埋点 | 通过可视化工具配置 | 无需开发 | 灵活性差 | 简单事件 |
| 无埋点 | 自动采集所有事件 | 零开发成本 | 数据量大 | 快速分析 |


---

## 埋点方案

### 1. 代码埋点

```typescript
// 基础埋点接口
interface TrackEvent {
  event: string        // 事件名称
  category?: string    // 事件分类
  action?: string      // 事件动作
  label?: string       // 事件标签
  value?: number       // 事件值
  properties?: Record<string, any>  // 自定义属性
}

// 埋点 SDK 类
class Tracker {
  private config: TrackerConfig;
  private queue: TrackEvent[] = [];
  private timer: number | null = null;

  constructor(config: TrackerConfig) {
    this.config = {
      url: config.url,
      appId: config.appId,
      userId: config.userId,
      batchSize: config.batchSize || 10,
      batchInterval: config.batchInterval || 5000,
      enableAutoTrack: config.enableAutoTrack || false
    };

    this.init();
  }

  // 初始化
  private init() {
    // 自动采集 PV
    this.trackPageView();

    // 自动采集用户行为
    if (this.config.enableAutoTrack) {
      this.autoTrack();
    }

    // 页面卸载时上报
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  // 手动埋点
  track(event: TrackEvent) {
    const data = {
      ...event,
      timestamp: Date.now(),
      url: location.href,
      userId: this.config.userId,
      sessionId: this.getSessionId(),
      deviceInfo: this.getDeviceInfo()
    };

    this.queue.push(data);

    // 达到批量大小，立即上报
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    } else {
      // 否则延迟上报
      this.scheduleFlush();
    }
  }

  // 页面浏览埋点
  private trackPageView() {
    this.track({
      event: 'page_view',
      category: 'page',
      properties: {
        title: document.title,
        referrer: document.referrer,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
      }
    });
  }

  // 自动埋点
  private autoTrack() {
    // 点击事件
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const trackData = target.dataset.track;

      if (trackData) {
        try {
          const data = JSON.parse(trackData);
          this.track({
            event: 'click',
            category: 'auto',
            ...data
          });
        } catch (e) {}
      }
    }, true);

    // 曝光埋点
    this.trackExposure();
  }

  // 曝光埋点（IntersectionObserver）
  private trackExposure() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const trackData = target.dataset.exposure;

          if (trackData) {
            try {
              const data = JSON.parse(trackData);
              this.track({
                event: 'exposure',
                category: 'auto',
                ...data
              });
              observer.unobserve(target);
            } catch (e) {}
          }
        }
      });
    }, { threshold: 0.5 });

    // 观察所有带 data-exposure 的元素
    document.querySelectorAll('[data-exposure]').forEach(el => {
      observer.observe(el);
    });
  }

  // 数据上报
  private flush() {
    if (this.queue.length === 0) return;

    const data = this.queue.splice(0, this.queue.length);

    // 使用 sendBeacon（不阻塞页面卸载）
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        this.config.url,
        JSON.stringify(data)
      );
    } else {
      // 降级方案
      fetch(this.config.url, {
        method: 'POST',
        body: JSON.stringify(data),
        keepalive: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(() => {});
    }

    this.clearTimer();
  }

  // 延迟上报
  private scheduleFlush() {
    if (this.timer) return;

    this.timer = window.setTimeout(() => {
      this.flush();
    }, this.config.batchInterval);
  }

  // 清除定时器
  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  // 获取 Session ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('tracker_session_id');
    
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('tracker_session_id', sessionId);
    }

    return sessionId;
  }

  // 获取设备信息
  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };
  }

  // 生成唯一 ID
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 使用示例
const tracker = new Tracker({
  url: 'https://api.example.com/track',
  appId: 'my-app',
  userId: 'user123',
  batchSize: 10,
  batchInterval: 5000,
  enableAutoTrack: true
});

// 手动埋点
tracker.track({
  event: 'button_click',
  category: 'user_action',
  action: 'click',
  label: 'submit_button',
  properties: {
    buttonText: '提交',
    formId: 'register_form'
  }
});
```


### 2. 可视化埋点

```html
<!-- HTML 中使用 data 属性 -->
<button 
  data-track='{"event":"purchase","product":"iPhone","price":999}'>
  立即购买
</button>

<div 
  data-exposure='{"event":"banner_view","bannerId":"home_banner_1"}'>
  广告横幅
</div>

<!-- 停留时长埋点 -->
<div 
  data-stay='{"event":"article_read","articleId":"123"}'>
  文章内容
</div>
```

```typescript
// 停留时长埋点
class StayTimeTracker {
  private startTime: number = 0;
  private observer: IntersectionObserver;

  constructor(private tracker: Tracker) {
    this.init();
  }

  private init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const target = entry.target as HTMLElement;
        const stayData = target.dataset.stay;

        if (!stayData) return;

        if (entry.isIntersecting) {
          // 进入视口，记录开始时间
          this.startTime = Date.now();
        } else if (this.startTime > 0) {
          // 离开视口，计算停留时长
          const duration = Date.now() - this.startTime;
          
          try {
            const data = JSON.parse(stayData);
            this.tracker.track({
              ...data,
              properties: {
                ...data.properties,
                duration
              }
            });
          } catch (e) {}

          this.startTime = 0;
        }
      });
    }, { threshold: 0.5 });

    // 观察所有带 data-stay 的元素
    document.querySelectorAll('[data-stay]').forEach(el => {
      this.observer.observe(el);
    });
  }
}
```

### 3. 无埋点（全埋点）

```typescript
// 无埋点 SDK
class AutoTracker {
  private tracker: Tracker;
  private config: AutoTrackConfig;

  constructor(tracker: Tracker, config: AutoTrackConfig = {}) {
    this.tracker = tracker;
    this.config = {
      trackClick: config.trackClick !== false,
      trackPageView: config.trackPageView !== false,
      trackScroll: config.trackScroll !== false,
      trackInput: config.trackInput !== false,
      ignoreSelectors: config.ignoreSelectors || []
    };

    this.init();
  }

  private init() {
    if (this.config.trackClick) {
      this.trackAllClicks();
    }

    if (this.config.trackPageView) {
      this.trackAllPageViews();
    }

    if (this.config.trackScroll) {
      this.trackScrollDepth();
    }

    if (this.config.trackInput) {
      this.trackAllInputs();
    }
  }

  // 自动采集所有点击
  private trackAllClicks() {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // 忽略特定元素
      if (this.shouldIgnore(target)) return;

      this.tracker.track({
        event: 'auto_click',
        category: 'auto',
        properties: {
          tagName: target.tagName,
          id: target.id,
          className: target.className,
          text: target.innerText?.substring(0, 50),
          xpath: this.getXPath(target)
        }
      });
    }, true);
  }

  // 自动采集页面浏览（SPA）
  private trackAllPageViews() {
    // 监听 popstate（浏览器前进后退）
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });

    // 监听 pushState 和 replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.trackPageView();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.trackPageView();
    };
  }

  private trackPageView() {
    this.tracker.track({
      event: 'auto_page_view',
      category: 'auto',
      properties: {
        url: location.href,
        title: document.title,
        referrer: document.referrer
      }
    });
  }

  // 滚动深度埋点
  private trackScrollDepth() {
    let maxDepth = 0;
    const depths = [25, 50, 75, 100];

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const depth = Math.round((scrollTop / scrollHeight) * 100);

      depths.forEach(d => {
        if (depth >= d && maxDepth < d) {
          maxDepth = d;
          this.tracker.track({
            event: 'scroll_depth',
            category: 'auto',
            properties: { depth: d }
          });
        }
      });
    };

    window.addEventListener('scroll', this.throttle(handleScroll, 1000));
  }

  // 输入框埋点
  private trackAllInputs() {
    document.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (this.shouldIgnore(target)) return;

        this.tracker.track({
          event: 'auto_input',
          category: 'auto',
          properties: {
            name: target.name,
            type: target.type,
            value: this.maskSensitiveData(target.value)
          }
        });
      }
    });
  }

  // 判断是否忽略
  private shouldIgnore(element: HTMLElement): boolean {
    return this.config.ignoreSelectors.some(selector => {
      return element.matches(selector);
    });
  }

  // 获取元素 XPath
  private getXPath(element: HTMLElement): string {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }

    const parts: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling = current.previousSibling;

      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && 
            sibling.nodeName === current.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }

      const tagName = current.nodeName.toLowerCase();
      const part = index > 0 ? `${tagName}[${index + 1}]` : tagName;
      parts.unshift(part);

      current = current.parentElement;
    }

    return '/' + parts.join('/');
  }

  // 脱敏处理
  private maskSensitiveData(value: string): string {
    // 手机号脱敏
    if (/^1[3-9]\d{9}$/.test(value)) {
      return value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }

    // 身份证脱敏
    if (/^\d{17}[\dXx]$/.test(value)) {
      return value.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
    }

    return value;
  }

  // 节流
  private throttle(fn: Function, delay: number) {
    let last = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn(...args);
      }
    };
  }
}

// 使用
const autoTracker = new AutoTracker(tracker, {
  trackClick: true,
  trackPageView: true,
  trackScroll: true,
  trackInput: true,
  ignoreSelectors: ['.ignore-track', '[data-no-track]']
});
```


---

## 数据上报

### 1. 上报策略

```typescript
// 上报策略管理
class ReportStrategy {
  private queue: any[] = [];
  private config: ReportConfig;

  constructor(config: ReportConfig) {
    this.config = {
      url: config.url,
      batchSize: config.batchSize || 10,
      batchInterval: config.batchInterval || 5000,
      maxRetry: config.maxRetry || 3,
      retryDelay: config.retryDelay || 1000
    };
  }

  // 立即上报
  async reportNow(data: any) {
    return this.send([data]);
  }

  // 批量上报
  async reportBatch(data: any[]) {
    this.queue.push(...data);

    if (this.queue.length >= this.config.batchSize) {
      return this.flush();
    }
  }

  // 延迟上报
  async reportDelay(data: any) {
    this.queue.push(data);
    
    setTimeout(() => {
      this.flush();
    }, this.config.batchInterval);
  }

  // 刷新队列
  private async flush() {
    if (this.queue.length === 0) return;

    const data = this.queue.splice(0, this.queue.length);
    return this.send(data);
  }

  // 发送数据（带重试）
  private async send(data: any[], retryCount = 0): Promise<void> {
    try {
      const response = await fetch(this.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        keepalive: true
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      // 重试
      if (retryCount < this.config.maxRetry) {
        await this.delay(this.config.retryDelay * (retryCount + 1));
        return this.send(data, retryCount + 1);
      }

      // 重试失败，存储到本地
      this.saveToLocal(data);
    }
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 保存到本地存储
  private saveToLocal(data: any[]) {
    try {
      const stored = localStorage.getItem('tracker_failed_data');
      const failedData = stored ? JSON.parse(stored) : [];
      failedData.push(...data);
      
      // 限制存储大小（最多 100 条）
      if (failedData.length > 100) {
        failedData.splice(0, failedData.length - 100);
      }

      localStorage.setItem('tracker_failed_data', JSON.stringify(failedData));
    } catch (e) {}
  }

  // 重新上报失败的数据
  async retryFailed() {
    try {
      const stored = localStorage.getItem('tracker_failed_data');
      if (!stored) return;

      const failedData = JSON.parse(stored);
      if (failedData.length === 0) return;

      await this.send(failedData);
      localStorage.removeItem('tracker_failed_data');
    } catch (e) {}
  }
}
```

### 2. 数据压缩

```typescript
// 使用 pako 压缩数据
import pako from 'pako';

class CompressReporter {
  async report(data: any[]) {
    const json = JSON.stringify(data);
    
    // 压缩
    const compressed = pako.gzip(json);
    
    // 转为 Base64
    const base64 = btoa(
      String.fromCharCode.apply(null, Array.from(compressed))
    );

    await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip'
      },
      body: base64
    });
  }
}
```


---

## 实战案例

### 1. 电商漏斗分析

```typescript
// 电商购买漏斗埋点
class EcommerceFunnel {
  private tracker: Tracker;

  constructor(tracker: Tracker) {
    this.tracker = tracker;
  }

  // 1. 商品浏览
  trackProductView(product: Product) {
    this.tracker.track({
      event: 'product_view',
      category: 'ecommerce',
      properties: {
        productId: product.id,
        productName: product.name,
        price: product.price,
        category: product.category
      }
    });
  }

  // 2. 加入购物车
  trackAddToCart(product: Product, quantity: number) {
    this.tracker.track({
      event: 'add_to_cart',
      category: 'ecommerce',
      properties: {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity
      }
    });
  }

  // 3. 开始结算
  trackBeginCheckout(cart: CartItem[]) {
    this.tracker.track({
      event: 'begin_checkout',
      category: 'ecommerce',
      properties: {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      }
    });
  }

  // 4. 完成支付
  trackPurchase(order: Order) {
    this.tracker.track({
      event: 'purchase',
      category: 'ecommerce',
      value: order.totalAmount,
      properties: {
        orderId: order.id,
        items: order.items,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod
      }
    });
  }
}
```

### 2. 用户行为路径分析

```typescript
// 用户行为路径追踪
class UserPathTracker {
  private tracker: Tracker;
  private path: string[] = [];
  private maxPathLength = 20;

  constructor(tracker: Tracker) {
    this.tracker = tracker;
    this.init();
  }

  private init() {
    // 监听路由变化
    window.addEventListener('popstate', () => {
      this.addPath(location.pathname);
    });

    // 初始路径
    this.addPath(location.pathname);
  }

  private addPath(path: string) {
    this.path.push(path);

    // 限制路径长度
    if (this.path.length > this.maxPathLength) {
      this.path.shift();
    }

    // 上报路径
    this.tracker.track({
      event: 'user_path',
      category: 'behavior',
      properties: {
        path: this.path,
        currentPage: path
      }
    });
  }

  // 获取用户路径
  getPath(): string[] {
    return [...this.path];
  }
}
```

### 3. 性能监控埋点

```typescript
// 性能监控
class PerformanceTracker {
  private tracker: Tracker;

  constructor(tracker: Tracker) {
    this.tracker = tracker;
    this.init();
  }

  private init() {
    // 页面加载性能
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.trackPagePerformance();
      }, 0);
    });

    // 资源加载性能
    this.trackResourcePerformance();

    // Web Vitals
    this.trackWebVitals();
  }

  private trackPagePerformance() {
    const timing = performance.timing;

    this.tracker.track({
      event: 'page_performance',
      category: 'performance',
      properties: {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - timing.requestStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        load: timing.loadEventEnd - timing.navigationStart
      }
    });
  }

  private trackResourcePerformance() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 1000) {
          this.tracker.track({
            event: 'slow_resource',
            category: 'performance',
            properties: {
              name: entry.name,
              duration: entry.duration,
              size: (entry as any).transferSize
            }
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private trackWebVitals() {
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      this.tracker.track({
        event: 'lcp',
        category: 'performance',
        value: (lastEntry as any).renderTime || (lastEntry as any).loadTime
      });
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  }
}
```


---

## 面试要点

### 常见问题

**Q1：如何设计一个埋点 SDK？**

核心要点：
1. 数据采集（手动埋点、自动埋点、可视化埋点）
2. 数据处理（批量上报、数据压缩、数据脱敏）
3. 数据上报（sendBeacon、fetch、重试机制）
4. 性能优化（节流防抖、懒加载、Web Worker）

**Q2：埋点数据如何保证准确性？**

1. 去重：使用唯一 ID（事件 ID、用户 ID、Session ID）
2. 时序：记录时间戳，服务端校验
3. 完整性：关键事件立即上报，非关键事件批量上报
4. 容错：本地存储失败数据，定期重试

**Q3：如何处理埋点数据的隐私问题？**

1. 数据脱敏：手机号、身份证、密码等敏感信息
2. 用户授权：获取用户同意后再采集
3. 数据加密：HTTPS 传输，服务端加密存储
4. 最小化原则：只采集必要的数据

**Q4：埋点对性能的影响如何优化？**

1. 异步上报：不阻塞主线程
2. 批量上报：减少请求次数
3. 数据压缩：减少传输体积
4. 采样上报：高频事件采样
5. 懒加载：SDK 按需加载

### 最佳实践

1. **命名规范**：统一事件命名（snake_case）
2. **数据结构**：统一数据格式（JSON Schema）
3. **版本管理**：SDK 版本号，数据格式版本号
4. **监控告警**：上报成功率、数据质量监控
5. **文档完善**：埋点文档、接入文档、数据字典

---

## 参考资料

### 开源方案

- [Google Analytics](https://analytics.google.com/)
- [Mixpanel](https://mixpanel.com/)
- [Sentry](https://sentry.io/)（错误监控）
- [神策数据](https://www.sensorsdata.cn/)
- [友盟](https://www.umeng.com/)

### 学习资源

- [前端埋点方案设计](https://juejin.cn/post/6844904195131375623)
- [无埋点技术原理](https://zhuanlan.zhihu.com/p/69784219)
- [数据采集 SDK 设计](https://tech.meituan.com/2017/03/02/mt-mobile-analytics-practice.html)
