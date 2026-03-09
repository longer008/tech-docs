# 微前端架构

> 更新时间：2025-02

## 目录导航

- [什么是微前端](#什么是微前端)
- [核心概念](#核心概念)
- [实现方案](#实现方案)
- [qiankun 框架](#qiankun-框架)
- [Module Federation](#module-federation)
- [实战案例](#实战案例)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)
- [面试要点](#面试要点)

## 什么是微前端

微前端是一种将单体前端应用拆分成多个独立、可部署的小型应用的架构风格。

**核心思想**：
- 技术栈无关：不同子应用可以使用不同的技术栈
- 独立开发：团队可以独立开发和部署
- 增量升级：可以逐步迁移旧应用
- 独立部署：子应用可以独立发布

**适用场景**：
- 大型单体应用需要拆分
- 多团队协作开发
- 技术栈迁移
- 遗留系统改造

## 核心概念

### 1. 主应用（基座）

主应用负责：
- 子应用注册和加载
- 路由分发
- 全局状态管理
- 公共资源提供

```javascript
// 主应用示例
import { registerMicroApps, start } from 'qiankun'

// 注册子应用
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:8081',
    container: '#subapp-container',
    activeRule: '/app1',
  },
  {
    name: 'app2',
    entry: '//localhost:8082',
    container: '#subapp-container',
    activeRule: '/app2',
  },
])

// 启动微前端
start()
```

### 2. 子应用

子应用需要：
- 导出生命周期钩子
- 支持独立运行
- 处理样式隔离
- 管理自身状态

```javascript
// 子应用示例
export async function bootstrap() {
  console.log('子应用启动')
}

export async function mount(props) {
  console.log('子应用挂载', props)
  render(props)
}

export async function unmount() {
  console.log('子应用卸载')
  destroy()
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render({})
}
```

### 3. 应用间通信

**方式一：Props 传递**

```javascript
// 主应用
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:8081',
    container: '#subapp-container',
    activeRule: '/app1',
    props: {
      data: { user: 'admin' },
      onGlobalStateChange: (state) => console.log(state),
    },
  },
])

// 子应用
export async function mount(props) {
  console.log('接收到的 props:', props)
  props.onGlobalStateChange((state) => {
    console.log('全局状态变化:', state)
  })
}
```

**方式二：全局状态**

```javascript
// 主应用
import { initGlobalState } from 'qiankun'

const actions = initGlobalState({
  user: 'admin',
  token: 'xxx',
})

actions.onGlobalStateChange((state, prev) => {
  console.log('主应用监听到状态变化:', state, prev)
})

// 子应用
export async function mount(props) {
  props.onGlobalStateChange((state, prev) => {
    console.log('子应用监听到状态变化:', state, prev)
  })
  
  // 修改全局状态
  props.setGlobalState({ user: 'user1' })
}
```

**方式三：自定义事件**

```javascript
// 发送事件
window.dispatchEvent(new CustomEvent('app-message', {
  detail: { type: 'update', data: { count: 100 } }
}))

// 监听事件
window.addEventListener('app-message', (event) => {
  console.log('收到消息:', event.detail)
})
```

## 实现方案

### 1. iframe 方案

**优点**：
- 天然隔离（样式、JS、全局变量）
- 实现简单
- 兼容性好

**缺点**：
- 性能开销大
- 通信复杂（postMessage）
- URL 状态同步困难
- 弹窗、遮罩层问题

```html
<!-- 主应用 -->
<div id="app">
  <nav>
    <a href="#/app1">应用1</a>
    <a href="#/app2">应用2</a>
  </nav>
  <iframe id="subapp" src=""></iframe>
</div>

<script>
window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1)
  const iframe = document.getElementById('subapp')
  
  if (hash === '/app1') {
    iframe.src = 'http://localhost:8081'
  } else if (hash === '/app2') {
    iframe.src = 'http://localhost:8082'
  }
})
</script>
```

### 2. Web Components 方案

**优点**：
- 原生支持
- 样式隔离（Shadow DOM）
- 组件化

**缺点**：
- 兼容性问题
- 学习成本
- 生态不完善

```javascript
// 定义子应用组件
class MicroApp extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })
    const container = document.createElement('div')
    shadow.appendChild(container)
    
    // 加载子应用
    this.loadApp(container)
  }
  
  async loadApp(container) {
    const entry = this.getAttribute('entry')
    const html = await fetch(entry).then(res => res.text())
    container.innerHTML = html
    
    // 执行 JS
    const scripts = container.querySelectorAll('script')
    scripts.forEach(script => {
      const newScript = document.createElement('script')
      newScript.textContent = script.textContent
      container.appendChild(newScript)
    })
  }
}

customElements.define('micro-app', MicroApp)

// 使用
<micro-app entry="http://localhost:8081"></micro-app>
```

### 3. JS 沙箱方案

**Proxy 沙箱**：

```javascript
class ProxySandbox {
  constructor() {
    this.proxy = null
    this.running = false
  }
  
  active() {
    if (!this.proxy) {
      const fakeWindow = Object.create(null)
      
      this.proxy = new Proxy(fakeWindow, {
        get(target, prop) {
          // 优先从沙箱中取值
          if (prop in target) {
            return target[prop]
          }
          // 否则从真实 window 取值
          return window[prop]
        },
        set(target, prop, value) {
          // 所有设置都在沙箱中
          target[prop] = value
          return true
        },
      })
    }
    
    this.running = true
  }
  
  inactive() {
    this.running = false
  }
}

// 使用
const sandbox = new ProxySandbox()
sandbox.active()

// 在沙箱中执行代码
with (sandbox.proxy) {
  eval(code)
}

sandbox.inactive()
```

**快照沙箱**：

```javascript
class SnapshotSandbox {
  constructor() {
    this.windowSnapshot = {}
    this.modifyPropsMap = {}
  }
  
  active() {
    // 保存当前 window 状态
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop]
    }
    
    // 恢复之前的修改
    Object.keys(this.modifyPropsMap).forEach(prop => {
      window[prop] = this.modifyPropsMap[prop]
    })
  }
  
  inactive() {
    // 记录修改
    for (const prop in window) {
      if (window[prop] !== this.windowSnapshot[prop]) {
        this.modifyPropsMap[prop] = window[prop]
        // 还原
        window[prop] = this.windowSnapshot[prop]
      }
    }
  }
}
```

## qiankun 框架

qiankun 是基于 single-spa 的微前端实现库，提供了更完善的功能。

### 1. 快速开始

**安装**：

```bash
npm install qiankun
```

**主应用配置**：

```javascript
// main.js
import { registerMicroApps, start } from 'qiankun'

// 注册子应用
registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:8081',
    container: '#subapp-container',
    activeRule: '/vue',
    props: {
      msg: 'Hello from main app',
    },
  },
  {
    name: 'react-app',
    entry: '//localhost:8082',
    container: '#subapp-container',
    activeRule: '/react',
  },
])

// 启动配置
start({
  prefetch: true,  // 预加载
  sandbox: {
    strictStyleIsolation: true,  // 严格样式隔离
    experimentalStyleIsolation: true,  // 实验性样式隔离
  },
})
```

**子应用配置（Vue）**：

```javascript
// main.js
let instance = null

function render(props = {}) {
  const { container } = props
  instance = new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// 生命周期钩子
export async function bootstrap() {
  console.log('[vue] app bootstraped')
}

export async function mount(props) {
  console.log('[vue] props from main app', props)
  render(props)
}

export async function unmount() {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
}

// webpack 配置
module.exports = {
  devServer: {
    port: 8081,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  configureWebpack: {
    output: {
      library: 'vueApp',
      libraryTarget: 'umd',
    },
  },
}
```

**子应用配置（React）**：

```javascript
// index.js
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

function render(props) {
  const { container } = props
  ReactDOM.render(
    <App />,
    container ? container.querySelector('#root') : document.querySelector('#root')
  )
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render({})
}

// 生命周期钩子
export async function bootstrap() {
  console.log('[react] app bootstraped')
}

export async function mount(props) {
  console.log('[react] props from main app', props)
  render(props)
}

export async function unmount(props) {
  const { container } = props
  ReactDOM.unmountComponentAtNode(
    container ? container.querySelector('#root') : document.querySelector('#root')
  )
}

// webpack 配置
module.exports = {
  devServer: {
    port: 8082,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    library: 'reactApp',
    libraryTarget: 'umd',
  },
}
```

### 2. 样式隔离

**方式一：strictStyleIsolation（Shadow DOM）**

```javascript
start({
  sandbox: {
    strictStyleIsolation: true,
  },
})
```

**方式二：experimentalStyleIsolation（动态样式表）**

```javascript
start({
  sandbox: {
    experimentalStyleIsolation: true,
  },
})
```

**方式三：CSS Modules**

```javascript
// 子应用使用 CSS Modules
import styles from './App.module.css'

function App() {
  return <div className={styles.container}>App</div>
}
```

**方式四：CSS-in-JS**

```javascript
// 使用 styled-components
import styled from 'styled-components'

const Container = styled.div`
  color: red;
`

function App() {
  return <Container>App</Container>
}
```

### 3. 应用间通信

**全局状态管理**：

```javascript
// 主应用
import { initGlobalState, MicroAppStateActions } from 'qiankun'

const initialState = {
  user: null,
  token: null,
}

const actions: MicroAppStateActions = initGlobalState(initialState)

// 监听状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('主应用监听到状态变化:', state, prev)
})

// 修改状态
actions.setGlobalState({ user: { name: 'admin' } })

// 获取状态
actions.offGlobalStateChange()

// 子应用
export async function mount(props) {
  // 监听状态变化
  props.onGlobalStateChange((state, prev) => {
    console.log('子应用监听到状态变化:', state, prev)
  }, true)  // true 表示立即执行一次
  
  // 修改状态
  props.setGlobalState({ token: 'xxx' })
}
```

## Module Federation

Webpack 5 的 Module Federation 提供了另一种微前端实现方案。

### 1. 基本配置

**主应用（Host）**：

```javascript
// webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://localhost:8081/remoteEntry.js',
        app2: 'app2@http://localhost:8082/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
}
```

**子应用（Remote）**：

```javascript
// webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
        './Button': './src/components/Button',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
}
```

### 2. 使用远程模块

```javascript
// 主应用
import React, { lazy, Suspense } from 'react'

// 动态导入远程模块
const RemoteApp = lazy(() => import('app1/App'))
const RemoteButton = lazy(() => import('app2/Button'))

function App() {
  return (
    <div>
      <h1>主应用</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <RemoteApp />
        <RemoteButton />
      </Suspense>
    </div>
  )
}
```

### 3. 共享依赖

```javascript
// webpack.config.js
new ModuleFederationPlugin({
  shared: {
    react: {
      singleton: true,  // 单例模式
      requiredVersion: '^17.0.0',  // 版本要求
      eager: false,  // 是否立即加载
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^17.0.0',
    },
    // 共享自定义模块
    './utils': {
      import: './src/utils',
      shareKey: 'utils',
      shareScope: 'default',
    },
  },
})
```

## 实战案例

### 1. 电商平台微前端架构

**需求**：
- 主应用：导航、用户信息、购物车
- 子应用1：商品列表（Vue）
- 子应用2：订单管理（React）
- 子应用3：用户中心（Angular）

**实现**：

```javascript
// 主应用 (main.js)
import { registerMicroApps, start, initGlobalState } from 'qiankun'

// 初始化全局状态
const actions = initGlobalState({
  user: null,
  cart: [],
})

// 注册子应用
registerMicroApps([
  {
    name: 'product-list',
    entry: '//localhost:8081',
    container: '#subapp-container',
    activeRule: '/products',
    props: { actions },
  },
  {
    name: 'order-management',
    entry: '//localhost:8082',
    container: '#subapp-container',
    activeRule: '/orders',
    props: { actions },
  },
  {
    name: 'user-center',
    entry: '//localhost:8083',
    container: '#subapp-container',
    activeRule: '/user',
    props: { actions },
  },
])

// 启动
start({
  prefetch: 'all',
  sandbox: {
    experimentalStyleIsolation: true,
  },
})

// 监听全局状态
actions.onGlobalStateChange((state) => {
  // 更新购物车数量
  document.getElementById('cart-count').textContent = state.cart.length
})

// 商品列表子应用 (Vue)
export async function mount(props) {
  const { actions } = props
  
  // 监听用户状态
  actions.onGlobalStateChange((state) => {
    store.commit('setUser', state.user)
  })
  
  // 添加到购物车
  function addToCart(product) {
    const cart = actions.getGlobalState().cart
    actions.setGlobalState({
      cart: [...cart, product],
    })
  }
  
  render(props)
}

// 订单管理子应用 (React)
export async function mount(props) {
  const { actions } = props
  
  // 监听购物车状态
  actions.onGlobalStateChange((state) => {
    setCart(state.cart)
  })
  
  // 创建订单
  function createOrder() {
    const cart = actions.getGlobalState().cart
    // 创建订单逻辑
    actions.setGlobalState({ cart: [] })
  }
  
  render(props)
}
```

### 2. 后台管理系统微前端架构

**需求**：
- 主应用：菜单、权限控制
- 子应用1：用户管理
- 子应用2：内容管理
- 子应用3：数据统计

**实现**：

```javascript
// 主应用
import { registerMicroApps, start } from 'qiankun'

// 权限控制
const hasPermission = (app) => {
  const permissions = localStorage.getItem('permissions')
  return permissions.includes(app.name)
}

// 注册子应用
const apps = [
  {
    name: 'user-management',
    entry: '//localhost:8081',
    container: '#subapp-container',
    activeRule: '/user',
  },
  {
    name: 'content-management',
    entry: '//localhost:8082',
    container: '#subapp-container',
    activeRule: '/content',
  },
  {
    name: 'data-statistics',
    entry: '//localhost:8083',
    container: '#subapp-container',
    activeRule: '/statistics',
  },
]

// 过滤有权限的应用
const allowedApps = apps.filter(hasPermission)

registerMicroApps(allowedApps, {
  beforeLoad: [
    app => {
      console.log('before load', app.name)
      // 显示加载动画
      showLoading()
    },
  ],
  beforeMount: [
    app => {
      console.log('before mount', app.name)
    },
  ],
  afterMount: [
    app => {
      console.log('after mount', app.name)
      // 隐藏加载动画
      hideLoading()
    },
  ],
  afterUnmount: [
    app => {
      console.log('after unmount', app.name)
    },
  ],
})

start()
```

## 最佳实践

### 1. 应用拆分原则

- **按业务域拆分**：每个子应用负责一个独立的业务域
- **按团队拆分**：每个团队负责一个子应用
- **按技术栈拆分**：不同技术栈的模块拆分成不同子应用
- **按更新频率拆分**：频繁更新的模块独立成子应用

### 2. 性能优化

**预加载**：

```javascript
start({
  prefetch: true,  // 预加载所有子应用
  // 或
  prefetch: 'all',  // 预加载所有子应用
  // 或
  prefetch: ['app1', 'app2'],  // 预加载指定子应用
})
```

**懒加载**：

```javascript
// 只在需要时加载子应用
import { loadMicroApp } from 'qiankun'

function loadApp() {
  const app = loadMicroApp({
    name: 'app1',
    entry: '//localhost:8081',
    container: '#subapp-container',
  })
  
  // 卸载
  app.unmount()
}
```

**资源共享**：

```javascript
// 主应用提供公共资源
window.__SHARED_LIBS__ = {
  react: React,
  'react-dom': ReactDOM,
  axios: axios,
}

// 子应用使用公共资源
const React = window.__SHARED_LIBS__.react
const ReactDOM = window.__SHARED_LIBS__['react-dom']
```

### 3. 错误处理

```javascript
// 全局错误处理
start({
  sandbox: {
    strictStyleIsolation: true,
  },
  // 错误处理
  errorHandler: (error) => {
    console.error('微前端加载失败:', error)
    // 显示错误提示
    showError('应用加载失败，请刷新重试')
  },
})

// 子应用错误边界
class ErrorBoundary extends React.Component {
  state = { hasError: false }
  
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('子应用错误:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <div>应用出错了</div>
    }
    return this.props.children
  }
}
```

### 4. 部署策略

**独立部署**：
- 每个子应用独立部署
- 主应用通过 entry 地址加载子应用
- 支持灰度发布

**统一部署**：
- 所有应用打包到一起
- 通过路径区分不同应用
- 部署简单，但失去独立性

## 常见问题

### Q1：如何处理子应用之间的路由冲突？

**解决方案**：
- 使用不同的路由前缀（/app1、/app2）
- 主应用统一管理路由
- 子应用使用相对路径

```javascript
// 主应用
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:8081',
    container: '#subapp-container',
    activeRule: '/app1',  // 路由前缀
  },
])

// 子应用（Vue）
const router = new VueRouter({
  mode: 'history',
  base: window.__POWERED_BY_QIANKUN__ ? '/app1' : '/',
  routes,
})
```

### Q2：如何处理子应用的样式污染？

**解决方案**：
- 启用样式隔离（Shadow DOM）
- 使用 CSS Modules
- 使用 CSS-in-JS
- 添加命名空间

```javascript
// 方案1：Shadow DOM
start({
  sandbox: {
    strictStyleIsolation: true,
  },
})

// 方案2：CSS Modules
import styles from './App.module.css'

// 方案3：命名空间
.app1-container {
  /* 样式 */
}
```

### Q3：如何处理子应用的全局变量污染？

**解决方案**：
- 使用 JS 沙箱
- 避免使用全局变量
- 使用模块化

```javascript
// 启用沙箱
start({
  sandbox: true,  // 默认开启
})

// 子应用避免全局变量
// ❌ 不推荐
window.myVar = 'value'

// ✅ 推荐
const myVar = 'value'
export { myVar }
```

### Q4：如何实现子应用的按需加载？

**解决方案**：
- 使用 loadMicroApp 手动加载
- 配置预加载策略
- 使用路由懒加载

```javascript
// 手动加载
import { loadMicroApp } from 'qiankun'

function loadApp() {
  const app = loadMicroApp({
    name: 'app1',
    entry: '//localhost:8081',
    container: '#subapp-container',
  })
  
  return app
}

// 预加载
start({
  prefetch: ['app1'],  // 只预加载 app1
})
```

## 面试要点

### 核心概念

1. **什么是微前端？**
   - 将单体应用拆分成多个独立应用
   - 技术栈无关
   - 独立开发和部署

2. **微前端的优缺点？**
   - 优点：技术栈无关、独立开发、增量升级
   - 缺点：复杂度增加、性能开销、调试困难

3. **微前端的实现方案？**
   - iframe
   - Web Components
   - JS 沙箱（qiankun）
   - Module Federation

### 技术细节

1. **qiankun 的原理？**
   - 基于 single-spa
   - HTML Entry 加载
   - JS 沙箱隔离
   - 样式隔离

2. **如何实现 JS 沙箱？**
   - Proxy 沙箱
   - 快照沙箱
   - Legacy 沙箱

3. **如何实现样式隔离？**
   - Shadow DOM
   - 动态样式表
   - CSS Modules
   - CSS-in-JS

### 实战经验

1. **如何处理应用间通信？**
   - Props 传递
   - 全局状态
   - 自定义事件
   - LocalStorage

2. **如何优化性能？**
   - 预加载
   - 懒加载
   - 资源共享
   - 缓存策略

3. **如何处理错误？**
   - 全局错误处理
   - 错误边界
   - 降级方案

## 参考资料

### 官方文档
- [qiankun 官方文档](https://qiankun.umijs.org/)
- [single-spa 官方文档](https://single-spa.js.org/)
- [Module Federation 文档](https://webpack.js.org/concepts/module-federation/)

### 学习资源
- [微前端实战](https://github.com/umijs/qiankun)
- [Awesome Micro Frontends](https://github.com/rajasegar/awesome-micro-frontends)

### 开源项目
- [qiankun](https://github.com/umijs/qiankun)
- [single-spa](https://github.com/single-spa/single-spa)
- [micro-app](https://github.com/micro-zoe/micro-app)

---

> 💡 **学习建议**：微前端是一种架构模式，需要结合实际项目理解。建议先学习 qiankun 基础，然后通过实战项目积累经验，最后深入学习原理和优化。重点关注应用拆分、通信机制、样式隔离、性能优化等核心知识点。
