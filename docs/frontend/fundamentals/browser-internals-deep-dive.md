# 浏览器原理深入解析

> 更新时间：2025-02

## 目录

[[toc]]

## 浏览器渲染流程详解

### 1. 完整渲染流程

```javascript
// 浏览器渲染流程（从 HTML 到像素）
const renderingPipeline = {
  步骤1: 'HTML 解析 → DOM 树',
  步骤2: 'CSS 解析 → CSSOM 树',
  步骤3: 'DOM + CSSOM → 渲染树（Render Tree）',
  步骤4: '布局（Layout）→ 计算元素位置和大小',
  步骤5: '绘制（Paint）→ 绘制像素',
  步骤6: '合成（Composite）→ 合成图层'
}

// 1. HTML 解析
// 浏览器接收 HTML 字节流，转换为 DOM 树
const htmlParsing = `
  字节流 → 字符 → Token → 节点 → DOM 树
  
  示例：
  <html>
    <body>
      <div>Hello</div>
    </body>
  </html>
  
  解析为：
  Document
    └─ html
        └─ body
            └─ div
                └─ "Hello"
`

// 2. CSS 解析
// 浏览器解析 CSS，构建 CSSOM 树
const cssParsing = `
  CSS 字节流 → 字符 → Token → 节点 → CSSOM 树
  
  示例：
  body { font-size: 16px; }
  div { color: red; }
  
  解析为：
  body
    ├─ font-size: 16px
    └─ div
        └─ color: red
`


// 3. 构建渲染树
// 将 DOM 树和 CSSOM 树合并，生成渲染树
function buildRenderTree(dom, cssom) {
  const renderTree = []
  
  // 遍历 DOM 树
  function traverse(node) {
    // 跳过不可见元素（display: none）
    if (node.style.display === 'none') return
    
    // 跳过 <script>、<meta> 等不渲染的元素
    if (['SCRIPT', 'META', 'LINK'].includes(node.tagName)) return
    
    // 计算节点的最终样式
    const computedStyle = computeStyle(node, cssom)
    
    // 添加到渲染树
    renderTree.push({
      node,
      style: computedStyle
    })
    
    // 递归处理子节点
    node.children.forEach(child => traverse(child))
  }
  
  traverse(dom)
  return renderTree
}

// 4. 布局（Layout / Reflow）
// 计算每个元素的位置和大小
function layout(renderTree, v
ee.forEach(item => {
    const { node, style, box } = item
    
    // 绘制背景
    if (style.backgroundColor) {
      paintRecords.push({
        type: 'fillRect',
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        color: style.backgroundColor
      })
    }
    
    // 绘制边框
    if (style.border) {
      paintRecords.push({
        type: 'strokeRect',
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        color: style.borderColor,
        width: style.borderWidth
      })
    }
    
    // 绘制文本
    if (node.textContent) {
      paintRecords.push({
        type: 'fillText',
        text: node.textContent,
        x: box.x + style.paddingLeft,
        y: box.y + style.paddingTop,
        font: style.font,
        color: style.color
      })
    }
  })
  
  return paintRecords
}

// 6. 合成（Composite）
// 将多个图层合成为最终的页面
function composite(layers) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // 按 z-index 排序图层
  layers.sort((a, b) => a.zIndex - b.zIndex)
  
  // 逐层绘制
  layers.forEach(layer => {
    ctx.drawImage(layer.bitmap, layer.x, layer.y)
  })
  
  return canvas
}
```

### 2. 关键渲染路径优化

```javascript
// 关键渲染路径（Critical Rendering Path）
// 从接收 HTML 到首次渲染的最短路径

// 1. 减少关键资源数量
// ❌ 阻塞渲染的 CSS
<link rel="stylesheet" href="styles.css">

// ✅ 非关键 CSS 异步加载
<link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'">

// ✅ 内联关键 CSS
<style>
  /* 首屏关键样式 */
  .header { ... }
  .hero { ... }
</style>

// 2. 减少关键资源大小
// ✅ 压缩 CSS
/* 压缩前 */
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

/* 压缩后 */
body{margin:0;padding:0;font-family:Arial,sans-serif}

// ✅ 移除未使用的 CSS
// 使用 PurgeCSS 或 UnCSS

// 3. 优化关键资源加载顺序
// ✅ 预加载关键资源
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="font.woff2" as="font" crossorigin>

// ✅ DNS 预解析
<link rel="dns-prefetch" href="https://api.example.com">

// ✅ 预连接
<link rel="preconnect" href="https://cdn.example.com">

// 4. JavaScript 优化
// ❌ 阻塞解析的脚本
<script src="app.js"></script>

// ✅ 异步加载
<script src="app.js" async></script>

// ✅ 延迟加载
<script src="app.js" defer></script>

// ✅ 模块化加载
<script type="module" src="app.js"></script>

// 5. 资源提示（Resource Hints）
// 预取（Prefetch）：低优先级，空闲时加载
<link rel="prefetch" href="next-page.html">

// 预渲染（Prerender）：提前渲染整个页面
<link rel="prerender" href="next-page.html">

// 6. 实战示例：优化首屏加载
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- 1. 内联关键 CSS -->
  <style>
    /* 首屏关键样式 */
    body { margin: 0; font-family: Arial, sans-serif; }
    .header { height: 60px; background: #333; }
    .hero { height: 400px; background: #f0f0f0; }
  </style>
  
  <!-- 2. 预加载关键资源 -->
  <link rel="preload" href="hero-image.jpg" as="image">
  <link rel="preload" href="font.woff2" as="font" crossorigin>
  
  <!-- 3. 异步加载非关键 CSS -->
  <link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'">
  
  <!-- 4. DNS 预解析 -->
  <link rel="dns-prefetch" href="https://api.example.com">
</head>
<body>
  <header class="header">...</header>
  <section class="hero">...</section>
  
  <!-- 5. 延迟加载 JavaScript -->
  <script src="app.js" defer></script>
</body>
</html>
```

### 3. 渲染性能监控

```javascript
// 使用 Performance API 监控渲染性能

// 1. 监控关键渲染指标
function measureRenderingMetrics() {
  // 获取 Navigation Timing
  const navigation = performance.getEntriesByType('navigation')[0]
  
  const metrics = {
    // DNS 查询时间
    dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
    
    // TCP 连接时间
    tcpTime: navigation.connectEnd - navigation.connectStart,
    
    // 请求响应时间
    requestTime: navigation.responseEnd - navigation.requestStart,
    
    // DOM 解析时间
    domParseTime: navigation.domInteractive - navigation.domLoading,
    
    // 资源加载时间
    resourceLoadTime: navigation.loadEventStart - navigation.domContentLoadedEventEnd,
    
    // 首次渲染时间（FP）
    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
    
    // 首次内容渲染时间（FCP）
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    
    // DOM 内容加载完成时间
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    
    // 页面完全加载时间
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart
  }
  
  console.table(metrics)
  return metrics
}

// 2. 监控长任务（Long Tasks）
// 长任务：执行时间超过 50ms 的任务
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.warn('长任务检测:', {
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime
    })
    
    // 上报到监控系统
    reportLongTask(entry)
  }
})

observer.observe({ entryTypes: ['longtask'] })

// 3. 监控布局偏移（Layout Shift）
const layoutShiftObserver = new PerformanceObserver((list) => {
  let cls = 0
  
  for (const entry of list.getEntries()) {
    // 只统计非用户交互导致的偏移
    if (!entry.hadRecentInput) {
      cls += entry.value
    }
  }
  
  console.log('累积布局偏移（CLS）:', cls)
})

layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })

// 4. 监控最大内容绘制（LCP）
const lcpObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries()
  const lastEntry = entries[entries.length - 1]
  
  console.log('最大内容绘制（LCP）:', {
    renderTime: lastEntry.renderTime,
    loadTime: lastEntry.loadTime,
    size: lastEntry.size,
    element: lastEntry.element
  })
})

lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

// 5. 监控首次输入延迟（FID）
const fidObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    const fid = entry.processingStart - entry.startTime
    
    console.log('首次输入延迟（FID）:', {
      delay: fid,
      name: entry.name,
      startTime: entry.startTime
    })
  }
})

fidObserver.observe({ entryTypes: ['first-input'] })
```


## JavaScript 引擎原理（V8）

### 1. V8 引擎架构

```javascript
// V8 引擎执行流程
const v8Pipeline = {
  步骤1: 'JavaScript 源代码',
  步骤2: 'Parser（解析器）→ AST（抽象语法树）',
  步骤3: 'Ignition（解释器）→ 字节码',
  步骤4: 'TurboFan（优化编译器）→ 机器码',
  步骤5: '执行机器码'
}

// 1. 解析（Parsing）
// 将 JavaScript 代码转换为 AST
function parseCode(code) {
  // 词法分析（Lexical Analysis）
  const tokens = lexer(code)
  
  // 语法分析（Syntax Analysis）
  const ast = parser(tokens)
  
  return ast
}

// 示例：解析函数声明
const code = 'function add(a, b) { return a + b; }'

// AST 结构
const ast = {
  type: 'FunctionDeclaration',
  id: { type: 'Identifier', name: 'add' },
  params: [
    { type: 'Identifier', name: 'a' },
    { type: 'Identifier', name: 'b' }
  ],
  body: {
    type: 'BlockStatement',
    body: [{
      type: 'ReturnStatement',
      argument: {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' }
      }
    }]
  }
}

// 2. 字节码生成（Ignition）
// 将 AST 转换为字节码
function generateBytecode(ast) {
  const bytecode = []
  
  // 遍历 AST，生成字节码指令
  function visit(node) {
    switch (node.type) {
      case 'FunctionDeclaration':
        bytecode.push(['CreateClosure', node.id.name])
        visit(node.body)
        break
      
      case 'ReturnStatement':
        visit(node.argument)
        bytecode.push(['Return'])
        break
      
      case 'BinaryExpression':
        visit(node.left)
        visit(node.right)
        bytecode.push(['Add'])
        break
      
      case 'Identifier':
        bytecode.push(['LoadLocal', node.name])
        break
    }
  }
  
  visit(ast)
  return bytecode
}

// 3. JIT 编译（TurboFan）
// 热点代码优化为机器码
class JITCompiler {
  constructor() {
    this.hotFunctions = new Map() // 热点函数
    this.threshold = 100 // 优化阈值
  }
  
  // 记录函数调用次数
  recordCall(func) {
    const count = this.hotFunctions.get(func) || 0
    this.hotFunctions.set(func, count + 1)
    
    // 达到阈值，触发优化
    if (count + 1 >= this.threshold) {
      this.optimize(func)
    }
  }
  
  // 优化函数
  optimize(func) {
    console.log('优化函数:', func.name)
    
    // 1. 内联（Inlining）
    // 将小函数直接嵌入调用处
    
    // 2. 逃逸分析（Escape Analysis）
    // 分析对象是否逃逸出函数作用域
    
    // 3. 标量替换（Scalar Replacement）
    // 将对象拆分为基本类型
    
    // 4. 死代码消除（Dead Code Elimination）
    // 移除永远不会执行的代码
    
    // 5. 循环优化（Loop Optimization）
    // 循环展开、循环不变量外提
  }
}

// 4. 隐藏类（Hidden Classes）
// V8 使用隐藏类优化对象属性访问
class HiddenClass {
  constructor() {
    this.properties = new Map()
    this.transitions = new Map()
  }
  
  // 添加属性
  addProperty(name, offset) {
    // 创建新的隐藏类
    const newClass = new HiddenClass()
    newClass.properties = new Map(this.properties)
    newClass.properties.set(name, offset)
    
    // 记录转换
    this.transitions.set(name, newClass)
    
    return newClass
  }
}

// 示例：隐藏类优化
function Point(x, y) {
  this.x = x // 隐藏类 C0 → C1
  this.y = y // 隐藏类 C1 → C2
}

// ✅ 相同的属性添加顺序，共享隐藏类
const p1 = new Point(1, 2) // 使用 C2
const p2 = new Point(3, 4) // 使用 C2

// ❌ 不同的属性添加顺序，创建新的隐藏类
const p3 = {}
p3.y = 2 // 隐藏类 C0 → C3
p3.x = 1 // 隐藏类 C3 → C4（不同于 C2）

// 5. 内联缓存（Inline Caching）
// 缓存属性访问的位置
class InlineCache {
  constructor() {
    this.cache = new Map()
  }
  
  // 获取属性
  getProperty(obj, prop) {
    const hiddenClass = obj.__hiddenClass__
    
    // 检查缓存
    const cached = this.cache.get(hiddenClass)
    if (cached && cached.prop === prop) {
      // 缓存命中，直接返回偏移量
      return obj.__data__[cached.offset]
    }
    
    // 缓存未命中，查找属性
    const offset = hiddenClass.properties.get(prop)
    
    // 更新缓存
    this.cache.set(hiddenClass, { prop, offset })
    
    return obj.__data__[offset]
  }
}

// 6. 垃圾回收（Garbage Collection）
// V8 使用分代垃圾回收
class GarbageCollector {
  constructor() {
    this.newSpace = [] // 新生代（Young Generation）
    this.oldSpace = [] // 老生代（Old Generation）
  }
  
  // 新生代垃圾回收（Scavenge）
  scavenge() {
    const survivors = []
    
    // 标记-复制算法
    for (const obj of this.newSpace) {
      if (this.isReachable(obj)) {
        // 存活对象复制到 To-Space
        survivors.push(obj)
        
        // 晋升到老生代
        if (obj.age > 1) {
          this.oldSpace.push(obj)
        }
      }
    }
    
    // 清空 From-Space
    this.newSpace = survivors
  }
  
  // 老生代垃圾回收（Mark-Sweep-Compact）
  markSweepCompact() {
    // 1. 标记（Mark）
    const marked = new Set()
    this.mark(this.roots, marked)
    
    // 2. 清除（Sweep）
    this.oldSpace = this.oldSpace.filter(obj => marked.has(obj))
    
    // 3. 整理（Compact）
    this.compact()
  }
  
  // 标记可达对象
  mark(obj, marked) {
    if (marked.has(obj)) return
    
    marked.add(obj)
    
    // 递归标记引用的对象
    for (const ref of obj.references) {
      this.mark(ref, marked)
    }
  }
  
  // 整理内存碎片
  compact() {
    // 将存活对象移动到内存的一端
    // 更新所有引用
  }
}
```

### 2. V8 性能优化技巧

```javascript
// 1. 避免动态添加/删除属性
// ❌ 动态添加属性，破坏隐藏类
function Point(x, y) {
  this.x = x
  this.y = y
}

const p = new Point(1, 2)
p.z = 3 // 创建新的隐藏类

// ✅ 在构造函数中定义所有属性
function Point(x, y, z) {
  this.x = x
  this.y = y
  this.z = z || 0 // 即使不使用，也要定义
}

// 2. 保持属性添加顺序一致
// ❌ 不同的添加顺序
const obj1 = { a: 1, b: 2 }
const obj2 = { b: 2, a: 1 } // 不同的隐藏类

// ✅ 相同的添加顺序
const obj1 = { a: 1, b: 2 }
const obj2 = { a: 3, b: 4 } // 相同的隐藏类

// 3. 避免使用 delete
// ❌ 使用 delete 删除属性
const obj = { a: 1, b: 2 }
delete obj.a // 破坏隐藏类

// ✅ 设置为 undefined
const obj = { a: 1, b: 2 }
obj.a = undefined // 保持隐藏类

// 4. 使用单态函数
// ❌ 多态函数（接受不同类型的参数）
function add(a, b) {
  return a + b
}

add(1, 2)       // 数字
add('a', 'b')   // 字符串
add({}, {})     // 对象

// ✅ 单态函数（只接受一种类型）
function addNumbers(a, b) {
  return a + b
}

addNumbers(1, 2)
addNumbers(3, 4)

// 5. 避免稀疏数组
// ❌ 稀疏数组
const arr = []
arr[0] = 1
arr[1000] = 2 // 稀疏数组，性能差

// ✅ 密集数组
const arr = [1, 2, 3, 4, 5]

// 6. 使用类型化数组
// ❌ 普通数组
const arr = [1, 2, 3, 4, 5]

// ✅ 类型化数组（性能更好）
const arr = new Int32Array([1, 2, 3, 4, 5])

// 7. 避免在循环中创建函数
// ❌ 循环中创建函数
for (let i = 0; i < 1000; i++) {
  setTimeout(() => console.log(i), 1000)
}

// ✅ 循环外创建函数
function logValue(value) {
  console.log(value)
}

for (let i = 0; i < 1000; i++) {
  setTimeout(() => logValue(i), 1000)
}

// 8. 使用对象池
// ✅ 对象池，减少 GC 压力
class ObjectPool {
  constructor(createFn, resetFn) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.pool = []
  }
  
  acquire() {
    return this.pool.pop() || this.createFn()
  }
  
  release(obj) {
    this.resetFn(obj)
    this.pool.push(obj)
  }
}

// 使用示例
const pointPool = new ObjectPool(
  () => ({ x: 0, y: 0 }),
  (obj) => { obj.x = 0; obj.y = 0 }
)

const p1 = pointPool.acquire()
p1.x = 10
p1.y = 20

// 使用完毕，归还对象池
pointPool.release(p1)
```


## 垃圾回收机制

### 1. 垃圾回收算法

```javascript
// 1. 引用计数（Reference Counting）
// 记录每个对象被引用的次数
class ReferenceCountingGC {
  constructor() {
    this.objects = new Map() // 对象 → 引用计数
  }
  
  // 创建对象
  create(obj) {
    this.objects.set(obj, 0)
    return obj
  }
  
  // 增加引用
  addRef(obj) {
    const count = this.objects.get(obj) || 0
    this.objects.set(obj, count + 1)
  }
  
  // 减少引用
  removeRef(obj) {
    const count = this.objects.get(obj)
    if (count === 1) {
      // 引用计数为 0，回收对象
      this.collect(obj)
    } else {
      this.objects.set(obj, count - 1)
    }
  }
  
  // 回收对象
  collect(obj) {
    // 递归减少引用的对象的计数
    for (const ref of obj.references || []) {
      this.removeRef(ref)
    }
    
    // 删除对象
    this.objects.delete(obj)
  }
}

// 问题：循环引用无法回收
const obj1 = {}
const obj2 = {}
obj1.ref = obj2
obj2.ref = obj1 // 循环引用，引用计数永远不为 0

// 2. 标记-清除（Mark-Sweep）
// 从根对象开始标记所有可达对象，然后清除未标记的对象
class MarkSweepGC {
  constructor() {
    this.objects = new Set()
    this.roots = [] // 根对象（全局变量、栈上的变量）
  }
  
  // 标记阶段
  mark() {
    const marked = new Set()
    const queue = [...this.roots]
    
    while (queue.length > 0) {
      const obj = queue.shift()
      
      if (marked.has(obj)) continue
      
      marked.add(obj)
      
      // 标记引用的对象
      for (const ref of obj.references || []) {
        queue.push(ref)
      }
    }
    
    return marked
  }
  
  // 清除阶段
  sweep(marked) {
    for (const obj of this.objects) {
      if (!marked.has(obj)) {
        // 未标记的对象，回收
        this.objects.delete(obj)
      }
    }
  }
  
  // 执行垃圾回收
  collect() {
    const marked = this.mark()
    this.sweep(marked)
  }
}

// 3. 标记-整理（Mark-Compact）
// 标记后，将存活对象移动到内存的一端，消除碎片
class MarkCompactGC extends MarkSweepGC {
  compact(marked) {
    const survivors = []
    
    // 收集存活对象
    for (const obj of this.objects) {
      if (marked.has(obj)) {
        survivors.push(obj)
      }
    }
    
    // 重新分配内存地址
    let address = 0
    for (const obj of survivors) {
      obj.address = address
      address += obj.size
    }
    
    // 更新所有引用
    for (const obj of survivors) {
      for (const ref of obj.references || []) {
        // 更新引用地址
      }
    }
    
    this.objects = new Set(survivors)
  }
  
  collect() {
    const marked = this.mark()
    this.compact(marked)
  }
}

// 4. 分代垃圾回收（Generational GC）
// 将对象分为新生代和老生代，分别使用不同的回收策略
class GenerationalGC {
  constructor() {
    this.newSpace = {
      fromSpace: [],
      toSpace: []
    }
    this.oldSpace = []
    this.roots = []
  }
  
  // 新生代回收（Scavenge）
  scavenge() {
    const { fromSpace, toSpace } = this.newSpace
    
    // 标记-复制
    for (const obj of fromSpace) {
      if (this.isReachable(obj)) {
        // 复制到 To-Space
        toSpace.push(obj)
        obj.age++
        
        // 晋升到老生代
        if (obj.age > 2) {
          this.oldSpace.push(obj)
          toSpace.pop()
        }
      }
    }
    
    // 交换 From-Space 和 To-Space
    this.newSpace.fromSpace = toSpace
    this.newSpace.toSpace = []
  }
  
  // 老生代回收（Mark-Sweep-Compact）
  majorGC() {
    const marked = this.mark(this.roots)
    this.sweep(marked)
    this.compact(marked)
  }
  
  // 判断对象是否可达
  isReachable(obj) {
    const visited = new Set()
    const queue = [...this.roots]
    
    while (queue.length > 0) {
      const current = queue.shift()
      
      if (visited.has(current)) continue
      if (current === obj) return true
      
      visited.add(current)
      
      for (const ref of current.references || []) {
        queue.push(ref)
      }
    }
    
    return false
  }
}

// 5. 增量标记（Incremental Marking）
// 将标记过程分成多个小步骤，避免长时间暂停
class IncrementalMarkingGC {
  constructor() {
    this.objects = new Set()
    this.roots = []
    this.markQueue = []
    this.marked = new Set()
  }
  
  // 开始增量标记
  startMarking() {
    this.markQueue = [...this.roots]
    this.marked.clear()
  }
  
  // 执行一步标记
  markStep(budget = 100) {
    let processed = 0
    
    while (this.markQueue.length > 0 && processed < budget) {
      const obj = this.markQueue.shift()
      
      if (this.marked.has(obj)) continue
      
      this.marked.add(obj)
      processed++
      
      // 将引用的对象加入队列
      for (const ref of obj.references || []) {
        this.markQueue.push(ref)
      }
    }
    
    return this.markQueue.length === 0
  }
  
  // 完成标记
  finishMarking() {
    while (!this.markStep()) {
      // 继续标记
    }
    
    // 清除未标记的对象
    for (const obj of this.objects) {
      if (!this.marked.has(obj)) {
        this.objects.delete(obj)
      }
    }
  }
}
```

### 2. 内存泄漏排查

```javascript
// 1. 常见内存泄漏场景

// ❌ 场景1：意外的全局变量
function createLeak() {
  leak = 'I am a global variable' // 忘记使用 var/let/const
}

// ✅ 修复：使用严格模式
'use strict'
function noLeak() {
  const notLeak = 'I am a local variable'
}

// ❌ 场景2：被遗忘的定时器
const data = new Array(1000000).fill('data')

setInterval(() => {
  console.log(data) // data 永远不会被回收
}, 1000)

// ✅ 修复：清除定时器
const timerId = setInterval(() => {
  console.log(data)
}, 1000)

// 不再需要时清除
clearInterval(timerId)

// ❌ 场景3：闭包引用
function createClosure() {
  const largeData = new Array(1000000).fill('data')
  
  return function() {
    console.log(largeData[0]) // 闭包持有 largeData 的引用
  }
}

const closure = createClosure() // largeData 无法被回收

// ✅ 修复：手动释放引用
function createClosure() {
  let largeData = new Array(1000000).fill('data')
  
  return {
    getData() {
      return largeData[0]
    },
    dispose() {
      largeData = null // 释放引用
    }
  }
}

const closure = createClosure()
// 使用完毕后
closure.dispose()

// ❌ 场景4：DOM 引用
const elements = []

function addElement() {
  const div = document.createElement('div')
  document.body.appendChild(div)
  elements.push(div) // 保存 DOM 引用
}

// 即使从 DOM 中移除，elements 仍然持有引用
document.body.removeChild(elements[0])

// ✅ 修复：使用 WeakMap
const elements = new WeakMap()

function addElement() {
  const div = document.createElement('div')
  document.body.appendChild(div)
  elements.set(div, { data: 'some data' })
}

// DOM 移除后，WeakMap 中的引用会自动清除

// ❌ 场景5：事件监听器
const button = document.querySelector('button')

button.addEventListener('click', function handler() {
  console.log('clicked')
  // handler 持有外部作用域的引用
})

// ✅ 修复：移除事件监听器
const button = document.querySelector('button')

function handler() {
  console.log('clicked')
}

button.addEventListener('click', handler)

// 不再需要时移除
button.removeEventListener('click', handler)

// 2. 内存泄漏检测工具

// 使用 Chrome DevTools Memory Profiler
// 1. 打开 DevTools → Memory
// 2. 选择 "Heap snapshot"
// 3. 点击 "Take snapshot"
// 4. 执行可能导致内存泄漏的操作
// 5. 再次 "Take snapshot"
// 6. 对比两次快照，查找增长的对象

// 使用 Performance Monitor
// 1. 打开 DevTools → More tools → Performance monitor
// 2. 观察 "JS heap size" 指标
// 3. 如果持续增长，可能存在内存泄漏

// 3. 内存泄漏监控代码
class MemoryLeakDetector {
  constructor() {
    this.snapshots = []
    this.threshold = 50 * 1024 * 1024 // 50MB
  }
  
  // 记录内存快照
  takeSnapshot() {
    if (performance.memory) {
      const snapshot = {
        timestamp: Date.now(),
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      }
      
      this.snapshots.push(snapshot)
      
      // 检测内存泄漏
      this.detect()
    }
  }
  
  // 检测内存泄漏
  detect() {
    if (this.snapshots.length < 2) return
    
    const latest = this.snapshots[this.snapshots.length - 1]
    const previous = this.snapshots[this.snapshots.length - 2]
    
    const growth = latest.usedJSHeapSize - previous.usedJSHeapSize
    
    if (growth > this.threshold) {
      console.warn('检测到内存泄漏:', {
        growth: `${(growth / 1024 / 1024).toFixed(2)} MB`,
        current: `${(latest.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(latest.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      })
      
      // 上报到监控系统
      this.report(growth)
    }
  }
  
  // 上报内存泄漏
  report(growth) {
    // 发送到监控系统
    fetch('/api/memory-leak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        growth,
        userAgent: navigator.userAgent,
        url: location.href,
        timestamp: Date.now()
      })
    })
  }
  
  // 定期检测
  startMonitoring(interval = 60000) {
    setInterval(() => {
      this.takeSnapshot()
    }, interval)
  }
}

// 使用示例
const detector = new MemoryLeakDetector()
detector.startMonitoring() // 每分钟检测一次
```


## 事件循环深入

### 1. 事件循环机制

```javascript
// 事件循环（Event Loop）
// JavaScript 是单线程的，通过事件循环实现异步

// 事件循环模型
const eventLoopModel = {
  调用栈: 'Call Stack - 执行同步代码',
  微任务队列: 'Microtask Queue - Promise、MutationObserver',
  宏任务队列: 'Macrotask Queue - setTimeout、setInterval、I/O',
  执行顺序: '同步代码 → 微任务 → 宏任务 → 微任务 → ...'
}

// 1. 宏任务（Macrotask）
// - setTimeout
// - setInterval
// - setImmediate（Node.js）
// - I/O
// - UI 渲染

// 2. 微任务（Microtask）
// - Promise.then/catch/finally
// - MutationObserver
// - queueMicrotask
// - process.nextTick（Node.js）

// 示例1：基础事件循环
console.log('1') // 同步代码

setTimeout(() => {
  console.log('2') // 宏任务
}, 0)

Promise.resolve().then(() => {
  console.log('3') // 微任务
})

console.log('4') // 同步代码

// 输出顺序：1 → 4 → 3 → 2

// 示例2：复杂事件循环
console.log('start')

setTimeout(() => {
  console.log('setTimeout1')
  Promise.resolve().then(() => {
    console.log('promise1')
  })
}, 0)

Promise.resolve().then(() => {
  console.log('promise2')
  setTimeout(() => {
    console.log('setTimeout2')
  }, 0)
})

console.log('end')

// 输出顺序：
// start → end → promise2 → setTimeout1 → promise1 → setTimeout2

// 示例3：async/await
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

async function async2() {
  console.log('async2')
}

console.log('script start')

setTimeout(() => {
  console.log('setTimeout')
}, 0)

async1()

new Promise(resolve => {
  console.log('promise1')
  resolve()
}).then(() => {
  console.log('promise2')
})

console.log('script end')

// 输出顺序：
// script start → async1 start → async2 → promise1 → script end
// → async1 end → promise2 → setTimeout

// 3. 事件循环实现
class EventLoop {
  constructor() {
    this.callStack = []
    this.microtaskQueue = []
    this.macrotaskQueue = []
    this.isRunning = false
  }
  
  // 执行同步代码
  execute(fn) {
    this.callStack.push(fn)
    fn()
    this.callStack.pop()
  }
  
  // 添加微任务
  queueMicrotask(fn) {
    this.microtaskQueue.push(fn)
  }
  
  // 添加宏任务
  queueMacrotask(fn) {
    this.macrotaskQueue.push(fn)
  }
  
  // 运行事件循环
  run() {
    if (this.isRunning) return
    
    this.isRunning = true
    
    while (this.macrotaskQueue.length > 0 || this.microtaskQueue.length > 0) {
      // 1. 执行一个宏任务
      if (this.macrotaskQueue.length > 0) {
        const task = this.macrotaskQueue.shift()
        this.execute(task)
      }
      
      // 2. 执行所有微任务
      while (this.microtaskQueue.length > 0) {
        const task = this.microtaskQueue.shift()
        this.execute(task)
      }
      
      // 3. 渲染（如果需要）
      this.render()
    }
    
    this.isRunning = false
  }
  
  // 渲染
  render() {
    // 更新 DOM
    // 执行 requestAnimationFrame 回调
  }
}

// 4. requestAnimationFrame
// 在浏览器下一次重绘之前执行
function animate() {
  // 更新动画
  requestAnimationFrame(animate)
}

requestAnimationFrame(animate)

// 5. requestIdleCallback
// 在浏览器空闲时执行
requestIdleCallback((deadline) => {
  // deadline.timeRemaining() 返回剩余时间
  while (deadline.timeRemaining() > 0) {
    // 执行低优先级任务
  }
})
```

### 2. Node.js 事件循环

```javascript
// Node.js 事件循环有 6 个阶段

const nodeEventLoop = {
  阶段1: 'timers - 执行 setTimeout/setInterval 回调',
  阶段2: 'pending callbacks - 执行延迟到下一个循环迭代的 I/O 回调',
  阶段3: 'idle, prepare - 仅内部使用',
  阶段4: 'poll - 检索新的 I/O 事件',
  阶段5: 'check - 执行 setImmediate 回调',
  阶段6: 'close callbacks - 执行关闭回调'
}

// process.nextTick vs setImmediate
// process.nextTick：在当前阶段结束后立即执行
// setImmediate：在 check 阶段执行

setImmediate(() => {
  console.log('setImmediate')
})

process.nextTick(() => {
  console.log('nextTick')
})

// 输出：nextTick → setImmediate

// 示例：I/O 操作
const fs = require('fs')

fs.readFile('file.txt', () => {
  console.log('readFile')
  
  setTimeout(() => {
    console.log('setTimeout')
  }, 0)
  
  setImmediate(() => {
    console.log('setImmediate')
  })
})

// 输出：readFile → setImmediate → setTimeout
// 在 I/O 回调中，setImmediate 总是先于 setTimeout 执行
```

## 浏览器缓存策略

### 1. HTTP 缓存

```javascript
// 1. 强缓存（Strong Cache）
// 不需要向服务器发送请求，直接从缓存读取

// Cache-Control（HTTP/1.1）
// 响应头
Cache-Control: max-age=3600 // 缓存 1 小时
Cache-Control: no-cache     // 需要验证
Cache-Control: no-store     // 不缓存
Cache-Control: public       // 可被任何缓存
Cache-Control: private      // 只能被浏览器缓存

// Expires（HTTP/1.0）
// 响应头
Expires: Wed, 21 Oct 2025 07:28:00 GMT

// 2. 协商缓存（Negotiation Cache）
// 需要向服务器验证缓存是否有效

// Last-Modified / If-Modified-Since
// 响应头
Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT

// 请求头
If-Modified-Since: Wed, 21 Oct 2024 07:28:00 GMT

// ETag / If-None-Match
// 响应头
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

// 请求头
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"

// 3. 缓存策略实现
class CacheStrategy {
  constructor() {
    this.cache = new Map()
  }
  
  // 设置缓存
  set(url, response, cacheControl) {
    const { maxAge, noCache, noStore } = this.parseCacheControl(cacheControl)
    
    if (noStore) {
      // 不缓存
      return
    }
    
    this.cache.set(url, {
      response,
      timestamp: Date.now(),
      maxAge,
      noCache,
      etag: response.headers.get('ETag'),
      lastModified: response.headers.get('Last-Modified')
    })
  }
  
  // 获取缓存
  async get(url) {
    const cached = this.cache.get(url)
    
    if (!cached) {
      // 缓存未命中
      return null
    }
    
    const age = Date.now() - cached.timestamp
    
    // 检查是否过期
    if (cached.maxAge && age > cached.maxAge * 1000) {
      // 缓存过期
      if (cached.noCache || cached.etag || cached.lastModified) {
        // 需要验证
        return this.validate(url, cached)
      } else {
        // 删除缓存
        this.cache.delete(url)
        return null
      }
    }
    
    // 缓存有效
    return cached.response
  }
  
  // 验证缓存
  async validate(url, cached) {
    const headers = {}
    
    if (cached.etag) {
      headers['If-None-Match'] = cached.etag
    }
    
    if (cached.lastModified) {
      headers['If-Modified-Since'] = cached.lastModified
    }
    
    const response = await fetch(url, { headers })
    
    if (response.status === 304) {
      // 缓存仍然有效
      cached.timestamp = Date.now()
      return cached.response
    } else {
      // 缓存失效，更新缓存
      this.set(url, response, response.headers.get('Cache-Control'))
      return response
    }
  }
  
  // 解析 Cache-Control
  parseCacheControl(cacheControl) {
    if (!cacheControl) return {}
    
    const directives = cacheControl.split(',').map(d => d.trim())
    const result = {}
    
    for (const directive of directives) {
      if (directive === 'no-cache') {
        result.noCache = true
      } else if (directive === 'no-store') {
        result.noStore = true
      } else if (directive.startsWith('max-age=')) {
        result.maxAge = parseInt(directive.split('=')[1])
      }
    }
    
    return result
  }
}

// 使用示例
const cacheStrategy = new CacheStrategy()

async function fetchWithCache(url) {
  // 尝试从缓存获取
  let response = await cacheStrategy.get(url)
  
  if (!response) {
    // 缓存未命中，发起请求
    response = await fetch(url)
    
    // 缓存响应
    const cacheControl = response.headers.get('Cache-Control')
    cacheStrategy.set(url, response, cacheControl)
  }
  
  return response
}
```

### 2. Service Worker 缓存

```javascript
// Service Worker 提供更灵活的缓存控制

// sw.js
const CACHE_NAME = 'my-cache-v1'

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/script.js',
        '/image.jpg'
      ])
    })
  )
})

// 拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 缓存命中
      if (response) {
        return response
      }
      
      // 缓存未命中，发起网络请求
      return fetch(event.request).then((response) => {
        // 缓存响应
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone())
          return response
        })
      })
    })
  )
})

// 缓存策略

// 1. Cache First（缓存优先）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})

// 2. Network First（网络优先）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
    })
  )
})

// 3. Stale While Revalidate（过期重新验证）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone())
          return networkResponse
        })
        
        return response || fetchPromise
      })
    })
  )
})
```

### 3. 浏览器存储

```javascript
// 1. localStorage
// 持久化存储，容量约 5-10MB
localStorage.setItem('key', 'value')
const value = localStorage.getItem('key')
localStorage.removeItem('key')
localStorage.clear()

// 2. sessionStorage
// 会话存储，关闭标签页后清除
sessionStorage.setItem('key', 'value')
const value = sessionStorage.getItem('key')

// 3. IndexedDB
// 大容量存储，支持事务
const request = indexedDB.open('myDatabase', 1)

request.onsuccess = (event) => {
  const db = event.target.result
  
  // 添加数据
  const transaction = db.transaction(['users'], 'readwrite')
  const objectStore = transaction.objectStore('users')
  objectStore.add({ id: 1, name: '张三' })
}

// 4. Cache API
// Service Worker 缓存
caches.open('my-cache').then((cache) => {
  cache.add('/api/data')
})

// 5. Cookie
// 小容量存储，容量约 4KB
document.cookie = 'key=value; max-age=3600; path=/'

// 6. 存储对比
const storageComparison = {
  localStorage: {
    容量: '5-10MB',
    持久化: '是',
    作用域: '同源',
    API: '同步'
  },
  sessionStorage: {
    容量: '5-10MB',
    持久化: '否（会话）',
    作用域: '同源+同标签页',
    API: '同步'
  },
  IndexedDB: {
    容量: '无限制（受磁盘限制）',
    持久化: '是',
    作用域: '同源',
    API: '异步'
  },
  Cookie: {
    容量: '4KB',
    持久化: '可选',
    作用域: '同源',
    API: '同步'
  }
}
```


## 浏览器安全机制

### 1. 同源策略（Same-Origin Policy）

```javascript
// 同源：协议、域名、端口都相同

// 同源示例
const origin1 = 'https://example.com:443/page1'
const origin2 = 'https://example.com:443/page2'
// 同源 ✅

// 不同源示例
const origin3 = 'http://example.com/page'  // 协议不同 ❌
const origin4 = 'https://api.example.com/page' // 域名不同 ❌
const origin5 = 'https://example.com:8080/page' // 端口不同 ❌

// 同源策略限制
// 1. 无法读取非同源的 Cookie、LocalStorage、IndexedDB
// 2. 无法操作非同源的 DOM
// 3. 无法发送非同源的 AJAX 请求（会被浏览器拦截）

// 跨域解决方案

// 1. CORS（Cross-Origin Resource Sharing）
// 服务端设置响应头
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true

// 前端发送请求
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include' // 携带 Cookie
})

// 2. JSONP（只支持 GET 请求）
function jsonp(url, callback) {
  const script = document.createElement('script')
  const callbackName = 'jsonp_' + Date.now()
  
  window[callbackName] = (data) => {
    callback(data)
    document.body.removeChild(script)
    delete window[callbackName]
  }
  
  script.src = `${url}?callback=${callbackName}`
  document.body.appendChild(script)
}

// 使用示例
jsonp('https://api.example.com/data', (data) => {
  console.log(data)
})

// 3. 代理服务器
// 前端请求同源的代理服务器
fetch('/api/data')

// 代理服务器转发请求到目标服务器
// Nginx 配置
location /api/ {
  proxy_pass https://api.example.com/;
}

// 4. postMessage（跨窗口通信）
// 父窗口
const iframe = document.querySelector('iframe')
iframe.contentWindow.postMessage('Hello', 'https://example.com')

// 子窗口
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://parent.com') return
  
  console.log(event.data) // 'Hello'
  
  // 回复消息
  event.source.postMessage('Hi', event.origin)
})
```

### 2. 内容安全策略（CSP）

```javascript
// CSP 防止 XSS 攻击

// 设置 CSP 响应头
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com; style-src 'self' 'unsafe-inline'

// 或使用 meta 标签
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">

// CSP 指令
const cspDirectives = {
  'default-src': '默认策略',
  'script-src': '脚本来源',
  'style-src': '样式来源',
  'img-src': '图片来源',
  'font-src': '字体来源',
  'connect-src': 'AJAX、WebSocket 来源',
  'frame-src': 'iframe 来源',
  'media-src': '音视频来源'
}

// CSP 值
const cspValues = {
  'self': '同源',
  'none': '禁止',
  'unsafe-inline': '允许内联脚本/样式',
  'unsafe-eval': '允许 eval()',
  'https:': '只允许 HTTPS',
  'https://example.com': '指定域名'
}

// 示例：严格的 CSP
Content-Security-Policy: 
  default-src 'none';
  script-src 'self' https://cdn.example.com;
  style-src 'self';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self'

// 违规报告
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report

// 接收违规报告
app.post('/csp-report', (req, res) => {
  console.log('CSP 违规:', req.body)
  res.status(204).end()
})
```

### 3. XSS 防护

```javascript
// XSS（Cross-Site Scripting）跨站脚本攻击

// 1. 反射型 XSS
// 攻击代码通过 URL 参数传入
// https://example.com/search?q=<script>alert('XSS')</script>

// 防护：转义用户输入
function escapeHTML(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// 或使用库
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(dirty)

// 2. 存储型 XSS
// 攻击代码存储在数据库中
// 用户评论：<script>alert('XSS')</script>

// 防护：服务端过滤
function sanitizeInput(input) {
  // 移除危险标签
  return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
              .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
              .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
}

// 3. DOM 型 XSS
// 攻击代码通过 DOM 操作注入
document.getElementById('output').innerHTML = userInput // 危险 ❌

// 防护：使用安全的 API
document.getElementById('output').textContent = userInput // 安全 ✅

// 4. XSS 防护最佳实践
const xssProtection = {
  输入验证: '验证用户输入的格式和内容',
  输出转义: '转义 HTML 特殊字符',
  CSP: '设置内容安全策略',
  HttpOnly: 'Cookie 设置 HttpOnly 标志',
  X_XSS_Protection: '启用浏览器 XSS 过滤器'
}

// 设置 HttpOnly Cookie
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict

// 启用 XSS 过滤器
X-XSS-Protection: 1; mode=block
```

### 4. CSRF 防护

```javascript
// CSRF（Cross-Site Request Forgery）跨站请求伪造

// 攻击示例
// 恶意网站包含：
<img src="https://bank.com/transfer?to=attacker&amount=1000">

// 防护方案

// 1. CSRF Token
// 服务端生成 Token
const csrfToken = generateToken()
res.cookie('csrfToken', csrfToken)

// 前端发送请求时携带 Token
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': getCookie('csrfToken')
  },
  body: JSON.stringify({ to: 'user', amount: 100 })
})

// 服务端验证 Token
app.post('/api/transfer', (req, res) => {
  const token = req.headers['x-csrf-token']
  const cookieToken = req.cookies.csrfToken
  
  if (token !== cookieToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' })
  }
  
  // 处理请求
})

// 2. SameSite Cookie
Set-Cookie: sessionId=abc123; SameSite=Strict

// SameSite 值
const sameSiteValues = {
  Strict: '完全禁止第三方 Cookie',
  Lax: '部分允许第三方 Cookie（GET 请求）',
  None: '允许第三方 Cookie（需要 Secure）'
}

// 3. 验证 Referer
app.post('/api/transfer', (req, res) => {
  const referer = req.headers.referer
  
  if (!referer || !referer.startsWith('https://bank.com')) {
    return res.status(403).json({ error: 'Invalid referer' })
  }
  
  // 处理请求
})

// 4. 双重 Cookie 验证
// 服务端设置 Cookie
res.cookie('csrfToken', token)

// 前端读取 Cookie 并作为请求参数
fetch('/api/transfer', {
  method: 'POST',
  body: JSON.stringify({
    csrfToken: getCookie('csrfToken'),
    to: 'user',
    amount: 100
  })
})

// 服务端验证
app.post('/api/transfer', (req, res) => {
  const cookieToken = req.cookies.csrfToken
  const bodyToken = req.body.csrfToken
  
  if (cookieToken !== bodyToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' })
  }
  
  // 处理请求
})
```

## 性能优化最佳实践

### 1. 资源加载优化

```javascript
// 1. 预加载（Preload）
// 提前加载关键资源
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="preload" href="hero.jpg" as="image">

// 2. 预连接（Preconnect）
// 提前建立连接
<link rel="preconnect" href="https://api.example.com">
<link rel="preconnect" href="https://cdn.example.com" crossorigin>

// 3. DNS 预解析（DNS Prefetch）
// 提前解析域名
<link rel="dns-prefetch" href="https://api.example.com">

// 4. 预取（Prefetch）
// 低优先级加载下一页资源
<link rel="prefetch" href="next-page.html">
<link rel="prefetch" href="next-page.js">

// 5. 预渲染（Prerender）
// 提前渲染整个页面
<link rel="prerender" href="next-page.html">

// 6. 模块预加载（Module Preload）
// 预加载 ES 模块
<link rel="modulepreload" href="app.js">

// 7. 动态导入
// 按需加载模块
const module = await import('./module.js')

// 8. 图片懒加载
// 使用 Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      img.src = img.dataset.src
      observer.unobserve(img)
    }
  })
})

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img)
})

// 或使用原生懒加载
<img src="image.jpg" loading="lazy">

// 9. 资源优先级
// 使用 fetchpriority 属性
<img src="hero.jpg" fetchpriority="high">
<script src="analytics.js" fetchpriority="low"></script>
```

### 2. 代码优化

```javascript
// 1. 代码分割
// 使用动态导入
const HomePage = () => import('./pages/Home.vue')
const AboutPage = () => import('./pages/About.vue')

// 2. Tree Shaking
// 移除未使用的代码
// 使用 ES Modules
import { used } from './utils' // ✅ 只打包 used
const { used, unused } = require('./utils') // ❌ 打包所有

// 3. 压缩代码
// 使用 Terser 压缩 JavaScript
// 使用 cssnano 压缩 CSS

// 4. 使用 CDN
// 加载第三方库
<script src="https://cdn.jsdelivr.net/npm/vue@3"></script>

// 5. 启用 Gzip/Brotli 压缩
// Nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;

// 6. 使用 Web Workers
// 将计算密集型任务移到 Worker
const worker = new Worker('worker.js')
worker.postMessage({ data: largeArray })
worker.onmessage = (e) => {
  console.log('结果:', e.data)
}

// 7. 使用 WebAssembly
// 执行高性能计算
const wasmModule = await WebAssembly.instantiateStreaming(
  fetch('module.wasm')
)
const result = wasmModule.instance.exports.compute(data)
```

### 3. 渲染优化

```javascript
// 1. 避免强制同步布局
// ❌ 强制同步布局
const height = element.offsetHeight // 读取布局
element.style.height = height + 10 + 'px' // 修改布局
const width = element.offsetWidth // 再次读取，触发重排

// ✅ 批量读取和修改
const height = element.offsetHeight
const width = element.offsetWidth
element.style.height = height + 10 + 'px'
element.style.width = width + 10 + 'px'

// 2. 使用 requestAnimationFrame
// ❌ 直接修改样式
setInterval(() => {
  element.style.left = element.offsetLeft + 1 + 'px'
}, 16)

// ✅ 使用 rAF
function animate() {
  element.style.left = element.offsetLeft + 1 + 'px'
  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)

// 3. 使用 transform 代替 top/left
// ❌ 触发重排
element.style.left = '100px'

// ✅ 只触发合成
element.style.transform = 'translateX(100px)'

// 4. 使用 will-change
// 提示浏览器元素将要变化
element.style.willChange = 'transform'

// 使用后移除
element.addEventListener('animationend', () => {
  element.style.willChange = 'auto'
})

// 5. 虚拟滚动
// 只渲染可见区域的元素
class VirtualScroll {
  constructor(container, items, itemHeight) {
    this.container = container
    this.items = items
    this.itemHeight = itemHeight
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight)
    
    this.render()
    this.container.addEventListener('scroll', () => this.render())
  }
  
  render() {
    const scrollTop = this.container.scrollTop
    const startIndex = Math.floor(scrollTop / this.itemHeight)
    const endIndex = startIndex + this.visibleCount
    
    const visibleItems = this.items.slice(startIndex, endIndex)
    
    this.container.innerHTML = visibleItems.map((item, index) => `
      <div style="position: absolute; top: ${(startIndex + index) * this.itemHeight}px; height: ${this.itemHeight}px;">
        ${item}
      </div>
    `).join('')
    
    this.container.style.height = this.items.length * this.itemHeight + 'px'
  }
}

// 6. 使用 CSS Containment
// 限制浏览器的样式、布局和绘制范围
.item {
  contain: layout style paint;
}

// 7. 使用 content-visibility
// 跳过屏幕外元素的渲染
.item {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
```

## 面试要点

### 1. 高频面试题

```javascript
// Q1：浏览器渲染流程
// 答案：
// 1. 解析 HTML → DOM 树
// 2. 解析 CSS → CSSOM 树
// 3. DOM + CSSOM → 渲染树
// 4. 布局（Layout）→ 计算位置和大小
// 5. 绘制（Paint）→ 绘制像素
// 6. 合成（Composite）→ 合成图层

// Q2：重排和重绘的区别
// 答案：
// 重排（Reflow）：元素的几何属性变化，需要重新计算布局
// 重绘（Repaint）：元素的外观变化，不影响布局
// 重排一定会导致重绘，重绘不一定导致重排

// Q3：如何优化重排和重绘
// 答案：
// 1. 批量修改 DOM
// 2. 使用 transform 代替 top/left
// 3. 使用 will-change 提示浏览器
// 4. 避免频繁读取布局信息
// 5. 使用 DocumentFragment
// 6. 使用 CSS3 动画代替 JavaScript 动画

// Q4：V8 引擎的优化技巧
// 答案：
// 1. 保持对象形状一致（隐藏类）
// 2. 避免动态添加/删除属性
// 3. 使用单态函数
// 4. 避免稀疏数组
// 5. 使用类型化数组
// 6. 避免在循环中创建函数

// Q5：垃圾回收机制
// 答案：
// 1. 新生代：Scavenge 算法（标记-复制）
// 2. 老生代：Mark-Sweep-Compact 算法
// 3. 增量标记：避免长时间暂停
// 4. 并发标记：在主线程执行的同时进行标记

// Q6：事件循环
// 答案：
// 1. 执行同步代码
// 2. 执行所有微任务
// 3. 执行一个宏任务
// 4. 执行所有微任务
// 5. 渲染（如果需要）
// 6. 重复步骤 3-5

// Q7：浏览器缓存策略
// 答案：
// 1. 强缓存：Cache-Control、Expires
// 2. 协商缓存：ETag、Last-Modified
// 3. Service Worker 缓存
// 4. 浏览器存储：localStorage、sessionStorage、IndexedDB

// Q8：跨域解决方案
// 答案：
// 1. CORS
// 2. JSONP
// 3. 代理服务器
// 4. postMessage
// 5. WebSocket

// Q9：XSS 防护
// 答案：
// 1. 输入验证
// 2. 输出转义
// 3. CSP
// 4. HttpOnly Cookie
// 5. X-XSS-Protection

// Q10：CSRF 防护
// 答案：
// 1. CSRF Token
// 2. SameSite Cookie
// 3. 验证 Referer
// 4. 双重 Cookie 验证
```

### 2. 面试技巧

```javascript
// 1. 回答框架（STAR 法则）
const starMethod = {
  Situation: '描述场景',
  Task: '说明任务',
  Action: '采取的行动',
  Result: '取得的结果'
}

// 示例：优化页面性能
// Situation：页面加载时间超过 5 秒，用户体验差
// Task：将加载时间优化到 2 秒以内
// Action：
// 1. 使用 Lighthouse 分析性能瓶颈
// 2. 压缩图片，使用 WebP 格式
// 3. 代码分割，按需加载
// 4. 启用 Gzip 压缩
// 5. 使用 CDN 加速
// Result：加载时间从 5 秒降低到 1.8 秒，用户满意度提升 30%

// 2. 加分项
const bonusPoints = [
  '了解浏览器内部实现原理',
  '能够使用 Chrome DevTools 分析性能',
  '有实际的性能优化经验',
  '了解最新的 Web 标准和 API',
  '能够解释复杂概念（如事件循环、垃圾回收）',
  '有开源项目或技术博客'
]

// 3. 高频问题
const frequentQuestions = [
  '浏览器渲染流程',
  '重排和重绘',
  'V8 引擎优化',
  '垃圾回收机制',
  '事件循环',
  '浏览器缓存',
  '跨域解决方案',
  'XSS 和 CSRF 防护',
  '性能优化',
  'Web Vitals'
]
```

## 参考资料

### 官方资源
- [Chrome DevTools 文档](https://developer.chrome.com/docs/devtools/)
- [V8 引擎博客](https://v8.dev/blog)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev](https://web.dev/)

### 学习资源
- [浏览器工作原理](https://www.html5rocks.com/zh/tutorials/internals/howbrowserswork/)
- [深入理解 V8](https://v8.dev/docs)
- [JavaScript 内存管理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management)
- [事件循环详解](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)

### 性能工具
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/evaluate-performance/)
- [Performance API](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance)

### 学习路线
1. **初级**：了解浏览器渲染流程、事件循环、缓存机制
2. **中级**：深入 V8 引擎、垃圾回收、性能优化
3. **高级**：浏览器安全、Service Worker、WebAssembly

---

> 💡 **提示**：浏览器原理是前端面试的重点，建议结合实际项目经验，深入理解每个概念的原理和应用场景。
