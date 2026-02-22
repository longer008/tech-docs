# 浏览器原理面试题集

> 浏览器工作原理、渲染机制、网络协议与高频面试题
> 
> 更新时间：2025-02

## 目录

[[toc]]

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

**为什么使用多进程架构？**
- 稳定性：一个标签页崩溃不影响其他标签页
- 安全性：渲染进程运行在沙箱中，限制系统访问
- 性能：充分利用多核 CPU，并行处理


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
│     └─▶ DO
                     │
│      └─▶ 多图层合成、GPU 加速                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### 3. 关键渲染路径（Critical Rendering Path）

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
- 只包含可见元素（`display: none` 不在其中）
- `visibility: hidden` 在渲染树中（占位但不可见）
- 伪元素 `::before/::after` 在渲染树中
- 每个节点对应一个盒子

**Parse 阶段详解：**

1. **构建 DOM 树**
   - Conversion（转换）：字节 → 字符
   - Tokenizing（分词）：字符 → 标记
   - Lexing（语法分析）：标记 → 对象
   - DOM construction（DOM 构造）：对象 → 树

2. **次级资源加载**
   - 预加载扫描器（preload scanner）并发运行
   - 提前发现 img、link 等资源并请求

3. **JavaScript 可能阻塞解析**
   - `<script>` 标签会暂停 HTML 解析
   - 使用 `defer` 或 `async` 避免阻塞
   - 或将 script 放在 body 结束标签之前


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
│  - 改变元素位置（top, left, float, position）              │
│  - 改变窗口大小                                             │
│  - 改变字体大小                                             │
│  - 读取布局属性（offsetWidth, scrollTop, clientHeight）    │
│  - 激活 CSS 伪类（:hover）                                  │
│                                                              │
│  重绘（Repaint）：                                          │
│  ──────────────────────────────────────────────────────────│
│  定义：元素外观改变，但几何属性不变                          │
│  性能：开销较小（跳过布局计算）                             │
│                                                              │
│  只触发重绘的操作：                                         │
│  - 改变颜色（color, background-color）                      │
│  - 改变可见性（visibility）                                 │
│  - 改变阴影（box-shadow, text-shadow）                      │
│  - 改变轮廓（outline）                                      │
│                                                              │
│  不触发重排重绘（合成层优化）：                             │
│  - transform                                                │
│  - opacity                                                  │
│  - filter                                                   │
│  - will-change                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**优化建议：**

```javascript
// ❌ 避免逐条修改样式
element.style.width = '100px'
element.style.height = '100px'
element.style.margin = '10px'

// ✅ 批量修改样式
element.style.cssText = 'width:100px;height:100px;margin:10px'
// 或使用 class
element.className = 'new-style'

// ❌ 避免频繁读取布局属性
for (let i = 0; i < 100; i++) {
  element.style.left = element.offsetLeft + 10 + 'px' // 每次都触发重排
}

// ✅ 缓存布局信息
let left = element.offsetLeft
for (let i = 0; i < 100; i++) {
  left += 10
}
element.style.left = left + 'px'

// ✅ 使用 DocumentFragment 批量操作 DOM
const fragment = document.createDocumentFragment()
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div')
  fragment.appendChild(div)
}
container.appendChild(fragment)

// ✅ 使用 transform 代替 top/left
// Bad
element.style.left = x + 'px'
element.style.top = y + 'px'

// Good
element.style.transform = `translate(${x}px, ${y}px)`

// ✅ 使用 will-change 提升为合成层
element.style.willChange = 'transform'
// 动画结束后移除
element.style.willChange = 'auto'
```


---

### 进阶题

#### 5. HTTP/2 vs HTTP/3

```
┌─────────────────────────────────────────────────────────────┐
│                HTTP 协议演进对比                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性        HTTP/1.1      HTTP/2        HTTP/3             │
│  ──────────────────────────────────────────────────────────│
│  传输层      TCP           TCP           QUIC (UDP)         │
│  连接复用    Keep-Alive    多路复用      多路复用           │
│  头部压缩    无             HPACK         QPACK             │
│  服务器推送  无             支持          支持               │
│  队头阻塞    有             TCP层有       无                │
│  连接迁移    不支持         不支持        支持               │
│  握手延迟    3-RTT         3-RTT         0-1 RTT           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**HTTP/2 核心特性：**

1. **二进制分帧（Binary Framing）**
   - 将数据分割成更小的帧
   - 每个帧都有唯一的流标识符
   - 可以交错发送，不必按顺序

2. **多路复用（Multiplexing）**
   - 单个 TCP 连接上并行交错发送多个请求/响应
   - 解决了 HTTP/1.1 的队头阻塞问题
   - 不再需要多个 TCP 连接

3. **头部压缩（HPACK）**
   - 使用 Huffman 编码压缩头部
   - 维护头部字段表，避免重复传输
   - 减少带宽消耗

4. **服务器推送（Server Push）**
   - 服务器主动推送资源
   - 减少请求往返次数
   - 提升首屏加载速度

**HTTP/3 核心改进：**

1. **基于 QUIC 协议（UDP）**
   - 避免 TCP 的队头阻塞
   - 更快的连接建立（0-RTT）
   - 内置 TLS 1.3 加密

2. **连接迁移（Connection Migration）**
   - 通过连接 ID 标识会话
   - 网络切换（WiFi ↔ 4G）不中断连接
   - 提升移动端体验

3. **改进的拥塞控制**
   - 更精确的 RTT 测量
   - 更快的丢包恢复
   - 更好的带宽利用率

**队头阻塞对比：**

```
HTTP/1.1 队头阻塞：
请求A ──────────────────▶
         请求B ─────────▶  (等待A完成)
                  请求C ─▶  (等待B完成)

HTTP/2 应用层无阻塞，但TCP层仍有：
流1: ████░░░░ (丢包，阻塞所有流)
流2: ░░░░████
流3: ░░░░████

HTTP/3 完全无阻塞：
流1: ████░░░░ (丢包，只影响流1)
流2: ████████ (继续传输)
流3: ████████ (继续传输)
```


---

#### 6. V8 引擎工作原理

```
┌─────────────────────────────────────────────────────────────┐
│                    V8 执行流程                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  JavaScript 源代码                                          │
│         │                                                   │
│         ▼                                                   │
│    Parser (解析器)                                          │
│         │                                                   │
│         ▼                                                   │
│    AST (抽象语法树)                                         │
│         │                                                   │
│         ▼                                                   │
│    Ignition (解释器)                                        │
│         │                                                   │
│         ├─▶ Bytecode (字节码)                              │
│         │                                                   │
│         ├─▶ 收集 Feedback (类型反馈)                       │
│         │                                                   │
│         ▼                                                   │
│    TurboFan (优化编译器)                                    │
│         │                                                   │
│         ▼                                                   │
│    Optimized Machine Code (优化的机器码)                    │
│         │                                                   │
│         ▼                                                   │
│    执行 / Deoptimization (反优化)                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**V8 核心优化技术：**

1. **JIT 编译（Just-In-Time）**
   - Ignition 解释器：快速启动，生成字节码
   - TurboFan 编译器：优化热点代码为机器码
   - 根据运行情况动态调整编译策略

2. **隐藏类（Hidden Classes）**
   ```javascript
   // V8 会为对象创建隐藏类
   function Point(x, y) {
     this.x = x  // 创建隐藏类 C1
     this.y = y  // 创建隐藏类 C2
   }

   // 相同属性顺序 = 相同隐藏类 = 更快
   const p1 = new Point(1, 2)
   p1.a = 5
   p1.b = 6

   const p2 = new Point(3, 4)
   p2.a = 7  // 复用 p1 的隐藏类
   p2.b = 8
   ```

3. **内联缓存（Inline Caching）**
   - 缓存属性访问的位置信息
   - 单态（Monomorphic）：最快，只有一种类型
   - 多态（Polymorphic）：较快，2-4种类型
   - 超态（Megamorphic）：慢，超过4种类型

4. **函数内联（Inlining）**
   ```javascript
   // 原始代码
   function add(a, b) {
     return a + b
   }
   function calc(x, y) {
     return add(x, y) + 10
   }

   // V8 优化后（内联）
   function calc(x, y) {
     return x + y + 10  // 直接内联 add 函数
   }
   ```

5. **垃圾回收（Garbage Collection）**
   - **分代回收**：
     - 新生代（Young Generation）：Scavenge 算法
     - 老生代（Old Generation）：标记清除 + 标记整理
   - **增量标记**：减少停顿时间
   - **并发标记**：利用多核 CPU
   - **懒清理**：延迟清理操作

**V8 性能优化建议：**

```javascript
// ✅ 保持对象形状一致
class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

// ❌ 避免动态添加属性
const obj = {}
obj.a = 1  // 改变隐藏类
obj.b = 2  // 再次改变隐藏类

// ✅ 初始化时定义所有属性
const obj = { a: 1, b: 2 }

// ✅ 使用单态函数
function process(obj) {
  return obj.x + obj.y  // 只处理 Point 类型
}

// ❌ 避免多态函数
function process(obj) {
  return obj.value  // 处理多种类型，性能下降
}

// ✅ 避免在循环中创建函数
for (let i = 0; i < 1000; i++) {
  const fn = () => i  // ❌ 每次都创建新函数
}

const fn = (i) => i  // ✅ 复用函数
for (let i = 0; i < 1000; i++) {
  fn(i)
}
```


---

#### 7. 浏览器缓存机制

```
┌─────────────────────────────────────────────────────────────┐
│                    浏览器缓存策略                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  强缓存（不发请求）：                                       │
│  ──────────────────────────────────────────────────────────│
│  Cache-Control: max-age=3600  (优先级高)                    │
│  Expires: Wed, 21 Oct 2025 07:28:00 GMT  (优先级低)         │
│                                                              │
│  协商缓存（发请求验证）：                                   │
│  ──────────────────────────────────────────────────────────│
│  ETag / If-None-Match  (优先级高，精确)                     │
│  Last-Modified / If-Modified-Since  (优先级低，秒级)        │
│                                                              │
│  缓存位置（优先级从高到低）：                               │
│  1. Service Worker Cache                                    │
│  2. Memory Cache (内存缓存)                                 │
│  3. Disk Cache (磁盘缓存)                                   │
│  4. Push Cache (HTTP/2 推送缓存)                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**缓存策略示例：**

```javascript
// 强缓存配置
Cache-Control: max-age=31536000, immutable  // 1年，不可变
Cache-Control: no-cache  // 每次都协商
Cache-Control: no-store  // 不缓存

// 协商缓存流程
// 1. 首次请求
Response Headers:
  ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
  Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT

// 2. 再次请求
Request Headers:
  If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
  If-Modified-Since: Wed, 21 Oct 2024 07:28:00 GMT

// 3. 服务器响应
304 Not Modified  // 使用缓存
200 OK  // 返回新内容
```

---

#### 8. 浏览器存储

```
┌─────────────────────────────────────────────────────────────┐
│                    浏览器存储对比                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性         Cookie   localStorage  sessionStorage  IndexedDB│
│  ──────────────────────────────────────────────────────────│
│  容量         4KB      5-10MB       5-10MB          无限制   │
│  生命周期     可设置   永久         会话            永久     │
│  与服务器通信 自动发送 不发送       不发送          不发送   │
│  API          复杂     简单         简单            较复杂   │
│  跨标签页     是       是           否              是       │
│  数据类型     字符串   字符串       字符串          多种     │
│  同步/异步    同步     同步         同步            异步     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// Cookie
document.cookie = 'name=value; max-age=3600; path=/; secure; samesite=strict'

// localStorage / sessionStorage
localStorage.setItem('key', JSON.stringify({ data: 'value' }))
const data = JSON.parse(localStorage.getItem('key'))
localStorage.removeItem('key')
localStorage.clear()

// 监听 storage 变化（跨标签页通信）
window.addEventListener('storage', (e) => {
  console.log(e.key, e.oldValue, e.newValue)
})

// IndexedDB
const request = indexedDB.open('myDB', 1)

request.onupgradeneeded = (e) => {
  const db = e.target.result
  const store = db.createObjectStore('users', { keyPath: 'id' })
  store.createIndex('name', 'name', { unique: false })
}

request.onsuccess = (e) => {
  const db = e.target.result
  const tx = db.transaction(
│
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
│  - INP (Interaction to Next Paint): 交互到下次绘制          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// 使用 Performance API
const timing = performance.timing
const pageLoadTime = timing.loadEventEnd - timing.navigationStart
const dnsTime = timing.domainLookupEnd - timing.domainLookupStart
const tcpTime = timing.connectEnd - timing.connectStart
const ttfb = timing.responseStart - timing.requestStart

// 使用 PerformanceObserver
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.startTime, entry.duration)
  }
})

observer.observe({ entryTypes: ['largest-contentful-paint'] })

// Web Vitals 库
import { getCLS, getFID, getLCP, getINP } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getLCP(console.log)
getINP(console.log)
```


---

## B. 避坑指南

### 常见误区

| 误区 | 正确理解 |
|------|----------|
| 所有 CSS 都阻塞渲染 | 媒体查询不匹配的 CSS 不阻塞 |
| async 和 defer 一样 | async 下载完立即执行，defer 等待 DOM |
| 重绘一定比重排快 | 大面积重绘可能比小范围重排慢 |
| localStorage 无限容量 | 约 5-10MB，超出会抛异常 |
| HTTP/2 完全解决队头阻塞 | TCP 层仍有队头阻塞，HTTP/3 才彻底解决 |
| V8 总是优化代码 | 类型不稳定会导致反优化 |

### 性能优化清单

```
✅ 减少关键资源数量
  - 延迟加载非关键 CSS/JS
  - 使用 async/defer 加载脚本
  - 代码分割和按需加载

✅ 减少关键资源大小
  - 压缩 HTML/CSS/JS
  - 使用 Gzip/Brotli 压缩
  - 图片优化（WebP、AVIF）

✅ 减少关键路径长度
  - 减少重定向
  - 使用 CDN
  - 启用 HTTP/2 或 HTTP/3

✅ 优化渲染性能
  - 避免强制同步布局
  - 使用 transform 代替 top/left
  - 使用 will-change 提升合成层
  - 虚拟滚动处理长列表

✅ 优化 JavaScript 执行
  - 保持对象形状一致
  - 避免多态函数
  - 使用 Web Workers 处理密集计算
  - 防抖节流优化事件处理

✅ 优化资源加载
  - 使用 preload/prefetch
  - 实现懒加载
  - 使用 Service Worker 缓存
  - 启用浏览器缓存策略
```

---

## C. 面试技巧

### 1. 回答框架

```
1. 概念定义
   - 浏览器架构
   - 渲染流程
   - 网络协议

2. 技术细节
   - 关键渲染路径
   - 重排重绘机制
   - HTTP/2、HTTP/3 特性
   - V8 引擎优化

3. 实战经验
   - 性能优化案例
   - 问题排查方法
   - 监控指标

4. 对比分析
   - HTTP 版本对比
   - 缓存策略对比
   - 存储方案对比
```

### 2. 加分项

```
✅ 了解浏览器多进程架构
✅ 掌握关键渲染路径优化
✅ 熟悉 HTTP/2、HTTP/3 特性
✅ 理解 V8 引擎优化原理
✅ 掌握 Web Vitals 指标
✅ 有性能优化实战经验
✅ 了解浏览器缓存策略

❌ 只知道表面概念
❌ 不了解底层原理
❌ 没有性能意识
❌ 不会使用性能工具
```

### 3. 高频问题

```
1. 从输入 URL 到页面展示发生了什么？
2. 浏览器的渲染流程是怎样的？
3. 什么是重排和重绘？如何优化？
4. HTTP/2 相比 HTTP/1.1 有哪些改进？
5. HTTP/3 为什么使用 UDP？
6. V8 引擎是如何优化 JavaScript 执行的？
7. 浏览器的缓存策略有哪些？
8. 如何优化首屏加载速度？
9. Web Vitals 核心指标是什么？
10. 如何排查页面性能问题？
```

---

## D. 参考资料

### 官方资源

- [Chrome DevTools 文档](https://developer.chrome.com/docs/devtools/)
- [MDN Web 性能](https://developer.mozilla.org/zh-CN/docs/Web/Performance)
- [Web Vitals](https://web.dev/vitals/)
- [V8 官方博客](https://v8.dev/blog)
- [HTTP/2 RFC 7540](https://httpwg.org/specs/rfc7540.html)
- [HTTP/3 RFC 9114](https://www.rfc-editor.org/rfc/rfc9114.html)

### 学习资源

- [浏览器工作原理](https://www.html5rocks.com/zh/tutorials/internals/howbrowserswork/)
- [关键渲染路径](https://developer.mozilla.org/zh-CN/docs/Web/Performance/Guides/Critical_rendering_path)
- [HTTP/2 详解](https://http2.github.io/)
- [QUIC 协议](https://www.chromium.org/quic/)
- [V8 引擎深入](https://v8.dev/docs)

### 性能工具

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [web-vitals 库](https://github.com/GoogleChrome/web-vitals)

### 学习路线

```
初级（1-2周）：
- 浏览器架构
- 渲染流程
- HTTP 基础
- 缓存机制

中级（2-3周）：
- 关键渲染路径
- 重排重绘优化
- HTTP/2 特性
- V8 引擎基础
- Web Vitals 指标

高级（3-4周）：
- HTTP/3 和 QUIC
- V8 引擎优化
- 性能监控
- 性能优化实战
- 问题排查方法
```

### 实战建议

```
1. 使用 Chrome DevTools 分析页面性能
2. 实践 Web Vitals 指标优化
3. 对比 HTTP/1.1、HTTP/2、HTTP/3 性能
4. 编写性能测试用例
5. 搭建性能监控系统
6. 参与开源项目性能优化
```
