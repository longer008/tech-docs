# 浏览器原理面试题集

> 浏览器工作原理、渲染机制与高频面试题

## A. 面试宝典

### 基础题

#### 1. 浏览器架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome 多进程架构                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Browser Process                     │   │
│  │  (浏览器主进程: UI、网络、存储、子进程管理)          │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│      ┌──────────────────┼──────────────────┐               │
│      ▼                  ▼                  ▼               │
│  ┌────────┐      ┌────────────┐      ┌────────────┐       │
│  │Network │      │  Renderer  │      │  Renderer  │       │
│  │Process │      │  Process   │      │  Process   │       │
│  │(网络)  │      │  (Tab 1)   │      │  (Tab 2)   │       │
│  └────────┘      └────────────┘      └────────────┘       │
│                          │                                  │
│      ┌──────────────────┼──────────────────┐               │
│      ▼                  ▼                  ▼               │
│  ┌────────┐      ┌────────────┐      ┌────────────┐       │
│  │ GPU    │      │  Plugin    │      │ Extension  │       │
│  │Process │      │  Process   │      │  Process   │       │
│  └────────┘      └────────────┘      └────────────┘       │
│                                                              │
│  渲染进程内部：                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Main Thread │ Compositor │ Raster │ Worker Threads │   │
│  │  (主线程)   │ (合成线程) │ (光栅) │   (工作线程)   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**进程职责：**
| 进程 | 职责 |
|------|------|
| Browser | UI、书签、历史、网络请求、文件访问 |
| Renderer | 页面渲染、JavaScript 执行、事件处理 |
| GPU | 3D 绘制、合成 |
| Network | 网络请求 |
| Plugin | 插件运行（如 Flash） |

---

#### 2. 从 URL 到页面渲染

```
┌─────────────────────────────────────────────────────────────┐
│                    页面加载流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. URL 解析                                                │
│     └─▶ 解析协议、域名、端口、路径                          │
│                                                              │
│  2. DNS 解析                                                │
│     └─▶ 浏览器缓存 → 系统缓存 → hosts → DNS 服务器          │
│                                                              │
│  3. TCP 连接                                                │
│     └─▶ 三次握手建立连接                                    │
│                                                              │
│  4. TLS 握手（HTTPS）                                       │
│     └─▶ 证书验证、密钥交换                                  │
│                                                              │
│  5. 发送 HTTP 请求                                          │
│     └─▶ 请求行、请求头、请求体                              │
│                                                              │
│  6. 服务器响应                                              │
│     └─▶ 状态码、响应头、响应体                              │
│                                                              │
│  7. 浏览器解析                                              │
│     └─▶ HTML → DOM 树                                       │
│     └─▶ CSS → CSSOM 树                                      │
│     └─▶ DOM + CSSOM → 渲染树                                │
│                                                              │
│  8. 布局（Layout/Reflow）                                   │
│     └─▶ 计算元素尺寸和位置                                  │
│                                                              │
│  9. 绘制（Paint）                                           │
│     └─▶ 将元素绘制到位图                                    │
│                                                              │
│  10. 合成（Composite）                                      │
│      └─▶ 多图层合成、GPU 加速                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### 3. 渲染流程

```
┌─────────────────────────────────────────────────────────────┐
│                    关键渲染路径                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HTML ─────────────────────▶ DOM Tree                       │
│    │                            │                           │
│    │ 遇到 CSS                   │                           │
│    ▼                            ▼                           │
│  CSS ──────────────────────▶ CSSOM Tree                     │
│                                 │                           │
│                                 ▼                           │
│                          Render Tree                        │
│                          (渲染树)                           │
│                                 │                           │
│                                 ▼                           │
│                            Layout                           │
│                          (计算布局)                         │
│                                 │                           │
│                                 ▼                           │
│                             Paint                           │
│                          (绘制到位图)                       │
│                                 │                           │
│                                 ▼                           │
│                           Composite                         │
│                          (图层合成)                         │
│                                 │                           │
│                                 ▼                           │
│                             Display                         │
│                          (显示到屏幕)                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**渲染树特点：**
```
- 只包含可见元素（display: none 不在其中）
- visibility: hidden 在渲染树中（占位但不可见）
- 伪元素 ::before/::after 在渲染树中
- 每个节点对应一个盒子
```

---

#### 4. 重排（Reflow）与重绘（Repaint）

```
┌─────────────────────────────────────────────────────────────┐
│                    重排 vs 重绘                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  重排（Reflow）：                                           │
│  ──────────────────────────────────────────────────────────│
│  定义：元素的几何属性改变，需要重新计算布局                  │
│  性能：开销大（影响整个渲染流程）                           │
│                                                              │
│  触发重排的操作：                                           │
│  - 添加/删除元素                                            │
│  - 改变元素尺寸（width, height, padding, margin, border）  │
│  - 改变元素位置                                             │
│  - 改变窗口大小                                             │
│  - 改变字体大小                                             │
│  - 读取布局属性（offsetWidth, scrollTop 等）                │
│                                                              │
│  重绘（Repaint）：                                          │
│  ──────────────────────────────────────────────────────────│
│  定义：元素外观改变，但几何属性不变                          │
│  性能：开销较小（跳过布局计算）                             │
│                                                              │
│  只触发重绘的操作：                                         │
│  - 改变颜色（color, background-color）                      │
│  - 改变可见性（visibility）                                 │
│  - 改变阴影（box-shadow）                                   │
│  - 改变轮廓（outline）                                      │
│                                                              │
│  不触发重排重绘（合成层优化）：                             │
│  - transform                                                │
│  - opacity                                                  │
│  - filter                                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**优化建议：**
```javascript
// 避免逐条修改样式
// Bad
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// Good
element.style.cssText = 'width:100px;height:100px;margin:10px';
// 或使用 class
element.className = 'new-style';

// 避免频繁读取布局属性
// Bad
for (let i = 0; i < 100; i++) {
  element.style.left = element.offsetLeft + 10 + 'px';
}

// Good
let left = element.offsetLeft;
for (let i = 0; i < 100; i++) {
  left += 10;
}
element.style.left = left + 'px';

// 使用 DocumentFragment 批量操作 DOM
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
container.appendChild(fragment);

// 使用 transform 代替 top/left
// Bad
element.style.left = x + 'px';
element.style.top = y + 'px';

// Good
element.style.transform = `translate(${x}px, ${y}px)`;
```

---

#### 5. 事件机制

```
┌─────────────────────────────────────────────────────────────┐
│                    事件传播                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                       window                                │
│                          │                                  │
│                          ▼                                  │
│  捕获阶段    ─────────▶ document                           │
│  (Capturing)             │                                  │
│                          ▼                                  │
│                        html                                 │
│                          │                                  │
│                          ▼                                  │
│                        body                                 │
│                          │                                  │
│                          ▼                                  │
│                        div                                  │
│                          │                                  │
│                          ▼                                  │
│  目标阶段    ─────────▶ button (target)                    │
│  (Target)                │                                  │
│                          ▼                                  │
│  冒泡阶段    ◀───────── div                                │
│  (Bubbling)              │                                  │
│                          ▼                                  │
│                        body                                 │
│                          │                                  │
│                          ▼                                  │
│                        html                                 │
│                          │                                  │
│                          ▼                                  │
│                       document                              │
│                          │                                  │
│                          ▼                                  │
│                       window                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// 事件监听
element.addEventListener('click', handler, {
  capture: false,   // 是否在捕获阶段触发
  once: false,      // 是否只执行一次
  passive: false    // 是否不调用 preventDefault
});

// 事件对象
element.addEventListener('click', (e) => {
  e.target;          // 触发事件的元素
  e.currentTarget;   // 绑定事件的元素
  e.type;            // 事件类型
  e.preventDefault(); // 阻止默认行为
  e.stopPropagation(); // 阻止冒泡
  e.stopImmediatePropagation(); // 阻止后续处理函数
});

// 事件委托
document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log('Clicked:', e.target.textContent);
  }
});
```

---

### 进阶题

#### 6. 浏览器存储

```
┌─────────────────────────────────────────────────────────────┐
│                    浏览器存储对比                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性         Cookie   localStorage  sessionStorage  IndexedDB│
│  ──────────────────────────────────────────────────────────│
│  容量         4KB      5MB          5MB             无限制   │
│  生命周期     可设置   永久         会话            永久     │
│  与服务器通信 自动发送 不发送       不发送          不发送   │
│  API          复杂     简单         简单            较复杂   │
│  跨标签页     是       是           否              是       │
│  数据类型     字符串   字符串       字符串          多种     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// Cookie
document.cookie = 'name=value; max-age=3600; path=/; secure; samesite=strict';

// 解析 Cookie
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
};

// localStorage / sessionStorage
localStorage.setItem('key', JSON.stringify({ data: 'value' }));
const data = JSON.parse(localStorage.getItem('key'));
localStorage.removeItem('key');
localStorage.clear();

// 监听 storage 变化（跨标签页通信）
window.addEventListener('storage', (e) => {
  console.log(e.key, e.oldValue, e.newValue);
});

// IndexedDB
const request = indexedDB.open('myDB', 1);

request.onupgradeneeded = (e) => {
  const db = e.target.result;
  const store = db.createObjectStore('users', { keyPath: 'id' });
  store.createIndex('name', 'name', { unique: false });
};

request.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction('users', 'readwrite');
  const store = tx.objectStore('users');

  // 增
  store.add({ id: 1, name: 'John' });
  // 查
  store.get(1).onsuccess = (e) => console.log(e.target.result);
  // 改
  store.put({ id: 1, name: 'Jane' });
  // 删
  store.delete(1);
};
```

---

#### 7. 跨域解决方案

```
┌─────────────────────────────────────────────────────────────┐
│                    跨域解决方案                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  同源策略：协议 + 域名 + 端口 必须相同                      │
│                                                              │
│  1. CORS（推荐）                                            │
│     ──────────────────────────────────────────────────────│
│     服务端设置响应头：                                      │
│     Access-Control-Allow-Origin: https://example.com       │
│     Access-Control-Allow-Methods: GET, POST, PUT           │
│     Access-Control-Allow-Headers: Content-Type             │
│     Access-Control-Allow-Credentials: true                 │
│                                                              │
│  2. JSONP（仅支持 GET）                                     │
│     ──────────────────────────────────────────────────────│
│     利用 script 标签不受同源策略限制                        │
│                                                              │
│  3. 代理服务器                                              │
│     ──────────────────────────────────────────────────────│
│     开发环境：webpack devServer proxy                       │
│     生产环境：Nginx 反向代理                                │
│                                                              │
│  4. postMessage                                             │
│     ──────────────────────────────────────────────────────│
│     iframe 或 window.open 之间通信                          │
│                                                              │
│  5. WebSocket                                               │
│     ──────────────────────────────────────────────────────│
│     不受同源策略限制                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// JSONP 实现
function jsonp(url, callback) {
  const callbackName = 'jsonp_' + Date.now();
  window[callbackName] = (data) => {
    callback(data);
    delete window[callbackName];
    document.body.removeChild(script);
  };

  const script = document.createElement('script');
  script.src = `${url}?callback=${callbackName}`;
  document.body.appendChild(script);
}

// postMessage
// 发送方
const popup = window.open('https://other.com');
popup.postMessage({ msg: 'hello' }, 'https://other.com');

// 接收方
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://example.com') return;
  console.log(e.data);
});
```

---

#### 8. 垃圾回收机制

```
┌─────────────────────────────────────────────────────────────┐
│                    垃圾回收算法                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 标记清除（Mark and Sweep）                              │
│     ──────────────────────────────────────────────────────│
│     - 从根对象开始，标记所有可达对象                        │
│     - 未被标记的对象视为垃圾，进行回收                      │
│     - V8 主要使用此算法                                     │
│                                                              │
│  2. 引用计数（已废弃）                                      │
│     ──────────────────────────────────────────────────────│
│     - 记录每个对象被引用的次数                              │
│     - 引用为 0 时回收                                       │
│     - 问题：循环引用导致内存泄漏                            │
│                                                              │
│  V8 分代回收：                                              │
│  ──────────────────────────────────────────────────────────│
│  新生代（Young Generation）：                               │
│  - Scavenge 算法                                            │
│  - 空间分为 From 和 To 两部分                               │
│  - 存活对象从 From 复制到 To，然后交换                      │
│  - 晋升：多次存活或 To 空间超过 25%                         │
│                                                              │
│  老生代（Old Generation）：                                 │
│  - 标记清除 + 标记整理                                      │
│  - 增量标记（减少停顿）                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**内存泄漏常见原因：**
```javascript
// 1. 意外的全局变量
function leak() {
  leakedVar = 'I am global';  // 没有声明，成为全局变量
}

// 2. 被遗忘的定时器
const timer = setInterval(() => {
  // 即使不需要了也在运行
}, 1000);
// 需要 clearInterval(timer)

// 3. 闭包引用
function outer() {
  const bigData = new Array(1000000);
  return function inner() {
    console.log(bigData.length);  // 持有 bigData 引用
  };
}

// 4. DOM 引用
const elements = {
  button: document.getElementById('button')
};
document.body.removeChild(document.getElementById('button'));
// elements.button 仍然引用已删除的 DOM

// 5. 事件监听器未移除
element.addEventListener('click', handler);
// 需要 element.removeEventListener('click', handler)
```

---

#### 9. 性能指标

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Vitals 核心指标                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LCP (Largest Contentful Paint) - 最大内容绘制              │
│  ──────────────────────────────────────────────────────────│
│  - 测量主要内容加载完成的时间                               │
│  - 良好: < 2.5s                                             │
│  - 需要改进: 2.5s ~ 4s                                      │
│  - 差: > 4s                                                 │
│                                                              │
│  FID (First Input Delay) - 首次输入延迟                     │
│  ──────────────────────────────────────────────────────────│
│  - 测量首次交互响应延迟                                     │
│  - 良好: < 100ms                                            │
│  - 需要改进: 100ms ~ 300ms                                  │
│  - 差: > 300ms                                              │
│                                                              │
│  CLS (Cumulative Layout Shift) - 累积布局偏移               │
│  ──────────────────────────────────────────────────────────│
│  - 测量页面视觉稳定性                                       │
│  - 良好: < 0.1                                              │
│  - 需要改进: 0.1 ~ 0.25                                     │
│  - 差: > 0.25                                               │
│                                                              │
│  其他指标：                                                 │
│  - FCP (First Contentful Paint): 首次内容绘制               │
│  - TTFB (Time to First Byte): 首字节时间                    │
│  - TTI (Time to Interactive): 可交互时间                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// 使用 Performance API
// 获取性能数据
const timing = performance.timing;
const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
const tcpTime = timing.connectEnd - timing.connectStart;
const ttfb = timing.responseStart - timing.requestStart;

// 使用 PerformanceObserver
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.startTime, entry.duration);
  }
});

observer.observe({ entryTypes: ['largest-contentful-paint'] });

// Web Vitals 库
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getLCP(console.log);
```

---

### 避坑指南

| 误区 | 正确理解 |
|------|----------|
| 所有 CSS 都阻塞渲染 | 媒体查询不匹配的 CSS 不阻塞 |
| async 和 defer 一样 | async 下载完立即执行，defer 等待 DOM |
| 重绘一定比重排快 | 大面积重绘可能比小范围重排慢 |
| localStorage 无限容量 | 约 5MB，超出会抛异常 |

---

## B. 实战文档

### Performance API

```javascript
// 资源加载时间
performance.getEntriesByType('resource').forEach(entry => {
  console.log(entry.name, entry.duration);
});

// 标记自定义时间点
performance.mark('start');
// ... 执行代码
performance.mark('end');
performance.measure('myMeasure', 'start', 'end');

const measures = performance.getEntriesByName('myMeasure');
console.log(measures[0].duration);

// 内存使用（Chrome）
console.log(performance.memory);
```

### requestAnimationFrame

```javascript
// 动画优化
function animate() {
  // 更新动画
  element.style.transform = `translateX(${x}px)`;
  x += speed;

  if (x < target) {
    requestAnimationFrame(animate);
  }
}

requestAnimationFrame(animate);

// 节流替代方案
let ticking = false;

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      // 处理滚动
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll);
```

### Intersection Observer

```javascript
// 懒加载图片
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
}, {
  rootMargin: '100px',
  threshold: 0.1
});

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
```
