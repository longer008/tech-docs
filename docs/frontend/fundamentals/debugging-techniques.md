# 前端调试技巧完全指南

> 更新时间：2025-02

## 目录

[[toc]]

## Chrome DevTools 高级用法

### 1. Console 面板技巧

```javascript
// 1. console 的高级用法
console.log('%c 样式化输出', 'color: blue; font-size: 20px; font-weight: bold')
console.table([{ name: '张三', age: 25 }, { name: '李四', age: 30 }])
console.group('分组')
console.log('消息 1')
console.log('消息 2')
console.groupEnd()

// 2. 性能测量
console.time('操作耗时')
// 执行操作
for (let i = 0; i < 1000000; i++) {}
console.timeEnd('操作耗时')

// 3. 断言
console.assert(1 === 2, '断言失败：1 不等于 2')

// 4. 追踪调用栈
function a() { b() }
function b() { c() }
function c() { console.trace('调用栈') }
a()

// 5. 计数器
for (let i = 0; i < 5; i++) {
  console.count('循环次数')
}

// 6. 清空控制台
console.clear()

// 7. 条件断点
// 在 Sources 面板右键断点 → Edit breakpoint
// 输入条件：i === 100

// 8. 监听对象变化
const obj = { name: '张三' }
console.log(obj) // 点击对象前的箭头可以展开查看
```

### 2. Sources 面板调试

```javascript
// 1. 断点类型
const breakpointTypes = {
  行断点: '点击行号设置',
  条件断点: '右键断点 → Edit breakpoint',
  DOM断点: 'Elements 面板右键元素 → Break on',
  XHR断点: 'Sources 面板 → XHR/fetch Breakpoints',
  事件监听断点: 'Sources 面板 → Event Listener Breakpoints'
}

// 2. 调试命令
const debugCommands = {
  'F8 / Cmd+\\': '继续执行',
  'F10 / Cmd+\'': '单步跳过',
  'F11 / Cmd+;': '单步进入',
  'Shift+F11 / Cmd+Shift+;': '单步跳出',
  'Cmd+Shift+E': '运行到光标处'
}

// 3. Watch 表达式
// Sources 面板 → Watch → 添加表达式
// 可以监听变量、表达式的值

// 4. Call Stack
// 查看函数调用栈
// 点击可以跳转到对应的代码位置

// 5. Scope
// 查看当前作用域的变量
// Local（局部变量）、Closure（闭包）、Global（全局变量）

// 6. Blackbox Script
// 右键脚本 → Blackbox script
// 调试时跳过第三方库代码
```

### 3. Network 面板分析

```javascript
// 1. 过滤请求
const networkFilters = {
  类型过滤: 'XHR、JS、CSS、Img、Media、Font、Doc、WS、Manifest、Other',
  状态过滤: 'has-response-header、is、larger-than、method、mime-type、scheme、set-cookie-domain、set-cookie-name、set-cookie-value、status-code',
  搜索: 'Cmd+F 搜索请求'
}

// 2. 请求详情
const requestDetails = {
  Headers: '请求头、响应头、查询参数',
  Preview: '格式化的响应预览',
  Response: '原始响应内容',
  Initiator: '请求发起者（调用栈）',
  Timing: '请求时间分解',
  Cookies: 'Cookie 信息'
}

// 3. 复制请求
// 右键请求 → Copy → Copy as fetch
// 可以复制为 fetch、cURL、PowerShell 等格式

// 4. 重放请求
// 右键请求 → Replay XHR

// 5. 阻止请求
// 右键请求 → Block request URL
// 或使用 Request blocking 面板

// 6. 网络节流
// Network 面板 → No throttling → Fast 3G / Slow 3G
// 模拟慢速网络
```

### 4. Performance 面板分析

```javascript
// 1. 录制性能
// 点击 Record 按钮 → 执行操作 → 停止录制

// 2. 分析火焰图
const flameChart = {
  Main: '主线程活动（JS 执行、样式计算、布局、绘制）',
  Compositor: '合成线程',
  Raster: '光栅化线程',
  GPU: 'GPU 进程'
}

// 3. 查找长任务
// 黄色三角形表示长任务（超过 50ms）
// 点击可以查看详情

// 4. 查看 FPS
// 绿色条表示 FPS
// 红色表示掉帧

// 5. 查看内存
// 勾选 Memory 复选框
// 可以看到 JS Heap、Documents、Nodes、Listeners 等

// 6. 性能标记
performance.mark('start')
// 执行操作
performance.mark('end')
performance.measure('操作耗时', 'start', 'end')
// 在 Performance 面板的 Timings 中可以看到
```

### 5. Memory 面板分析

```javascript
// 1. 堆快照（Heap Snapshot）
// 拍摄当前内存快照
// 可以查看对象、内存占用

// 2. 对比快照
// 拍摄多个快照
// 对比查看内存增长

// 3. 查找内存泄漏
// 1. 拍摄快照 1
// 2. 执行操作
// 3. 拍摄快照 2
// 4. 对比快照，查看 Detached DOM nodes

// 4. Allocation Timeline
// 记录内存分配时间线
// 可以看到哪些操作导致内存增长

// 5. Allocation Sampling
// 采样内存分配
// 性能开销小，适合长时间监控

// 示例：检测内存泄漏
class MemoryLeakDetector {
  constructor() {
    this.snapshots = []
  }
  
  async takeSnapshot() {
    // 手动触发 GC（需要在 Chrome 启动时添加 --expose-gc 参数）
    if (window.gc) {
      window.gc()
    }
    
    // 等待 GC 完成
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 拍摄快照（需要在 DevTools 中手动操作）
    console.log('请在 Memory 面板拍摄快照')
  }
  
  async detectLeak(action, iterations = 3) {
    console.log('开始检测内存泄漏...')
    
    // 拍摄初始快照
    await this.takeSnapshot()
    
    // 执行操作多次
    for (let i = 0; i < iterations; i++) {
      action()
      await this.takeSnapshot()
    }
    
    console.log('检测完成，请在 Memory 面板对比快照')
  }
}

// 使用示例
const detector = new MemoryLeakDetector()

// 检测可能的内存泄漏
detector.detectLeak(() => {
  // 执行可能导致内存泄漏的操作
  const div = document.createElement('div')
  document.body.appendChild(div)
  // 忘记移除 div
}, 3)
```

## React DevTools

### 1. 组件树查看

```javascript
// 1. 查看组件层级
// Components 面板显示组件树
// 可以查看 props、state、hooks

// 2. 搜索组件
// Cmd+F 搜索组件名称

// 3. 高亮更新
// 设置 → Highlight updates when components render
// 组件更新时会高亮显示

// 4. 查看组件源码
// 右键组件 → View source

// 5. 查看渲染原因
// 点击组件 → 右侧面板 → Rendered by
// 可以看到是什么导致组件重新渲染
```

### 2. Profiler 性能分析

```javascript
// 1. 录制性能
// Profiler 面板 → 点击 Record → 执行操作 → 停止

// 2. 查看火焰图
// Flame Chart：按时间顺序显示组件渲染
// Ranked Chart：按渲染时间排序

// 3. 查看组件渲染时间
// 点击组件可以看到：
// - Render duration：渲染耗时
// - Commit duration：提交耗时

// 4. 查看渲染原因
// 点击组件 → 
. 使用 useCallback 缓存函数
function ParentComponent() {
  const [count, setCount] = useState(0)
  
  const handleClick = useCallback(() => {
    console.log('点击')
  }, [])
  
  return <ChildComponent onClick={handleClick} />
}
```

## Vue DevTools

### 1. 组件树查看

```javascript
// 1. 查看组件层级
// Components 面板显示组件树
// 可以查看 data、computed、props

// 2. 编辑组件数据
// 点击组件 → 右侧面板 → 编辑 data
// 可以实时修改组件状态

// 3. 查看组件事件
// Events 面板显示组件触发的事件

// 4. 查看 Vuex 状态
// Vuex 面板显示 state、getters、mutations、actions

// 5. 时间旅行调试
// Vuex 面板 → 点击 mutation
// 可以回到之前的状态
```

### 2. Performance 性能分析

```javascript
// 1. 录制性能
// Performance 面板 → 点击 Record → 执行操作 → 停止

// 2. 查看组件渲染
// 可以看到每个组件的渲染时间

// 3. 查看渲染原因
// 点击组件可以看到是什么导致重新渲染

// 示例：优化 Vue 组件性能
export default {
  name: 'MyComponent',
  
  // 1. 使用 computed 缓存计算结果
  computed: {
    expensiveValue() {
      console.log('计算 expensiveValue')
      return this.items.reduce((sum, item) => sum + item.value, 0)
    }
  },
  
  // 2. 使用 watch 监听变化
  watch: {
    items: {
      handler(newVal, oldVal) {
        console.log('items 变化', newVal, oldVal)
      },
      deep: true // 深度监听
    }
  },
  
  // 3. 使用 v-once 渲染一次
  template: `
    <div>
      <div v-once>{{ staticContent }}</div>
      <div>{{ dynamicContent }}</div>
    </div>
  `
}
```

## 移动端调试

### 1. Chrome 远程调试

```javascript
// Android 设备调试
// 1. 手机开启 USB 调试
// 2. 连接电脑
// 3. Chrome 访问 chrome://inspect
// 4. 选择设备和页面

// iOS 设备调试（Mac）
// 1. 手机开启 Web 检查器
// 2. 连接电脑
// 3. Safari → 开发 → 选择设备和页面
```

### 2. vConsole

```javascript
// 安装
npm install vconsole

// 使用
import VConsole from 'vconsole'

// 初始化
const vConsole = new VConsole()

// 或者只在开发环境启用
if (process.env.NODE_ENV === 'development') {
  new VConsole()
}

// 自定义配置
const vConsole = new VConsole({
  defaultPlugins: ['system', 'network', 'element', 'storage'],
  maxLogNumber: 1000,
  onReady() {
    console.log('vConsole 已就绪')
  }
})

// 添加自定义面板
vConsole.addPlugin({
  id: 'my_plugin',
  name: '我的插件',
  event: {
    renderTab(callback) {
      const html = '<div>自定义内容</div>'
      callback(html)
    }
  }
})
```

### 3. Eruda

```javascript
// CDN 引入
<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
<script>
  eruda.init()
</script>

// NPM 安装
npm install eruda

// 使用
import eruda from 'eruda'

eruda.init()

// 自定义配置
eruda.init({
  container: document.body,
  tool: ['console', 'elements', 'network', 'resources', 'sources', 'info', 'snippets']
})
```

## Source Map 原理

### 1. 什么是 Source Map

```javascript
// Source Map 是一个映射文件
// 将压缩/编译后的代码映射回源代码

// 示例：压缩前
function add(a, b) {
  return a + b
}

// 压缩后
function add(n,r){return n+r}

// Source Map 文件（.map）
{
  "version": 3,
  "sources": ["source.js"],
  "names": ["add", "a", "b"],
  "mappings": "AAAA,SAASA,IAAIC,EAAGC,GACd,OAAOD,EAAIC",
  "file": "bundle.js"
}
```

### 2. 生成 Source Map

```javascript
// Webpack 配置
module.exports = {
  devtool: 'source-map', // 生产环境
  // 或
  devtool: 'eval-source-map', // 开发环境
  
  // Source Map 类型
  devtool: {
    'eval': '最快，但只能定位到文件',
    'source-map': '最慢，但最完整',
    'cheap-source-map': '较快，只定位到行',
    'inline-source-map': 'Source Map 内联到文件中',
    'hidden-source-map': '不在文件中添加引用注释',
    'nosources-source-map': '不包含源代码'
  }
}

// Vite 配置
export default {
  build: {
    sourcemap: true // 或 'inline' | 'hidden'
  }
}
```

### 3. 使用 Source Map

```javascript
// 1. 浏览器自动加载
// 压缩文件末尾添加注释
//# sourceMappingURL=bundle.js.map

// 2. 手动上传到错误监控平台
// Sentry 示例
const SentryWebpackPlugin = require('@sentry/webpack-plugin')

module.exports = {
  plugins: [
    new SentryWebpackPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'my-org',
      project: 'my-project',
      include: './dist',
      ignore: ['node_modules']
    })
  ]
}

// 3. 本地解析 Source Map
const sourceMap = require('source-map')

async function getOriginalPosition(line, column) {
  const rawSourceMap = require('./bundle.js.map')
  
  const consumer = await new sourceMap.SourceMapConsumer(rawSourceMap)
  
  const position = consumer.originalPositionFor({
    line,
    column
  })
  
  console.log('原始位置:', position)
  // { source: 'source.js', line: 1, column: 9, name: 'add' }
  
  consumer.destroy()
}
```

## 调试技巧总结

### 1. 常用调试方法

```javascript
const debuggingMethods = {
  // 1. console 调试
  console: {
    优点: '简单快速',
    缺点: '需要手动添加和删除',
    适用: '快速定位问题'
  },
  
  // 2. 断点调试
  breakpoint: {
    优点: '可以查看调用栈、变量',
    缺点: '需要手动设置',
    适用: '深入分析问题'
  },
  
  // 3. 性能分析
  performance: {
    优点: '可以看到完整的执行流程',
    缺点: '数据量大，分析复杂',
    适用: '性能优化'
  },
  
  // 4. 网络分析
  network: {
    优点: '可以看到所有请求',
    缺点: '只能看到网络层面',
    适用: '接口调试'
  },
  
  // 5. 内存分析
  memory: {
    优点: '可以找到内存泄漏',
    缺点: '需要专业知识',
    适用: '内存问题排查'
  }
}
```

### 2. 调试最佳实践

```javascript
const bestPractices = {
  // 1. 使用有意义的变量名
  good: 'const userList = []',
  bad: 'const arr = []',
  
  // 2. 添加注释
  comment: '// 获取用户列表',
  
  // 3. 使用 debugger 语句
  debugger: 'debugger; // 代码会在这里暂停',
  
  // 4. 使用条件断点
  conditional: 'i === 100',
  
  // 5. 使用 console.group 分组
  group: `
    console.group('用户信息')
    console.log('姓名:', name)
    console.log('年龄:', age)
    console.groupEnd()
  `,
  
  // 6. 使用 console.table 显示表格
  table: `
    console.table([
      { name: '张三', age: 25 },
      { name: '李四', age: 30 }
    ])
  `,
  
  // 7. 使用 console.time 测量性能
  time: `
    console.time('操作耗时')
    // 执行操作
    console.timeEnd('操作耗时')
  `
}
```

## 常见问题

### 1. 如何调试压缩后的代码？

使用 Source Map 将压缩代码映射回源代码。

### 2. 如何调试移动端页面？

- Android：Chrome 远程调试
- iOS：Safari 远程调试
- 通用：vConsole、Eruda

### 3. 如何找到内存泄漏？

1. 拍摄堆快照
2. 执行操作
3. 再次拍摄快照
4. 对比快照，查找 Detached DOM nodes

### 4. 如何调试异步代码？

- 使用 async/await
- 使用断点
- 使用 console.log

## 面试要点

### 核心概念

1. **Chrome DevTools 面板**
   - Console、Sources、Network、Performance、Memory

2. **断点类型**
   - 行断点、条件断点、DOM 断点、XHR 断点、事件监听断点

3. **Source Map**
   - 映射压缩代码到源代码
   - 生成和使用

### 实战经验

1. **如何调试性能问题？**
   - Performance 面板录制
   - 查找长任务
   - 分析火焰图

2. **如何调试内存泄漏？**
   - Memory 面板拍摄快照
   - 对比快照
   - 查找 Detached DOM nodes

3. **如何调试移动端？**
   - Chrome 远程调试
   - vConsole、Eruda

## 参考资料

### 官方文档
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Vue DevTools](https://devtools.vuejs.org/)

### 工具库
- [vConsole](https://github.com/Tencent/vConsole) - 移动端调试工具
- [Eruda](https://github.com/liriliri/eruda) - 移动端调试工具
- [source-map](https://github.com/mozilla/source-map) - Source Map 解析库

---

> 💡 **提示**：掌握调试技巧可以大大提高开发效率，快速定位和解决问题。
