# uni-app 跨端开发指南

> 更新时间：2025-02

## 目录导航

- [核心概念](#核心概念)
- [跨端架构](#跨端架构)
- [项目结构](#项目结构)
- [pages.json 配置](#pagesjson-配置)
- [生命周期](#生命周期)
- [路由与导航](#路由与导航)
- [条件编译](#条件编译)
- [状态管理](#状态管理)
- [网络请求](#网络请求)
- [分包加载](#分包加载)
- [性能优化](#性能优化)
- [最佳实践](#最佳实践)

## 核心概念

### 什么是 uni-app？

uni-app 是一个使用 Vue.js 开发所有前端应用的框架，开发者编写一套代码，可发布到：

- **iOS**：原生 App
- **Android**：原生 App
- **Web**：H5 网页
- **小程序**：微信、支付宝、百度、字节跳动、QQ、快手等
- **快应用**：华为、小米等

**核心特点**：
- 一套代码，多端运行
- 基于 Vue.js 语法
- 丰富的组件和 API
- 完善的插件生态

### 技术栈

- **框架**：Vue 2 / Vue 3
- **语法**：Vue 单文件组件（SFC）
- **样式**：CSS / SCSS / Less
- **配置**：pages.json、manifest.json
- **构建**：HBuilderX / CLI

## 跨端架构

### 编译原理

uni-app 通过编译器将 Vue 代码编译成不同平台的代码：

```
Vue 代码
   ↓
编译器
   ↓
├─→ 微信小程序（WXML + WXSS + JS）
├─→ 支付宝小程序（AXML + ACSS + JS）
├─→ H5（HTML + CSS + JS）
├─→ App（Weex / 原生渲染）
└─→ 其他小程序平台
```

### 渲染模式

**1. Web 渲染（H5、小程序）**：
- 使用 WebView 渲染
- 性能较好，兼容性强

**2. 原生渲染（App - nvue）**：
- 使用 Weex 引擎
- 性能接近原生
- 适合复杂列表、视频等场景

```vue
<!-- pages/index/index.nvue -->
<template>
  <view class="container">
    <text class="title">原生渲染页面</text>
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: 'nvue 页面'
    }
  }
}
</script>

<style>
/* nvue 只支持部分 CSS */
.container {
  flex: 1;
  justify-content: center;
  align-items: center;
}
</style>
```

## 项目结构

### 标准目录结构

```
uni-app-project/
├── pages/              # 页面文件
│   ├── index/
│   │   ├── index.vue
│   │   └── index.nvue  # 原生渲染页面（可选）
│   └── detail/
│       └── detail.vue
├── components/         # 组件
│   └── custom/
│       └── custom.vue
├── static/            # 静态资源
│   ├── images/
│   └── fonts/
├── uni_modules/       # uni-app 插件
├── store/             # Vuex/Pinia 状态管理
│   └── index.js
├── utils/             # 工具函数
│   └── request.js
├── App.vue            # 应用配置
├── main.js            # 入口文件
├── manifest.json      # 应用配置
├── pages.json         # 页面路由配置
└── uni.scss           # 全局样式变量
```

### 入口文件

```javascript
// main.js
import App from './App'
import { createSSRApp } from 'vue'
import store from './store'

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  return {
    app
  }
}
```

```vue
<!-- App.vue -->
<script>
export default {
  onLaunch() {
    console.log('App Launch')
    // 应用启动时执行
  },
  onShow() {
    console.log('App Show')
    // 应用显示时执行
  },
  onHide() {
    console.log('App Hide')
    // 应用隐藏时执行
  }
}
</script>

<style>
/* 全局样式 */
@import './uni.scss';
</style>
```


## pages.json 配置

### 基础配置

pages.json 是 uni-app 的全局配置文件，类似小程序的 app.json。

```json
{
  // 页面路由
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "enablePullDownRefresh": true,
        "backgroundColor": "#f5f5f5"
      }
    },
    {
      "path": "pages/detail/detail",
      "style": {
        "navigationBarTitleText": "详情"
      }
    }
  ],
  
  // 全局样式
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "uni-app",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  },
  
  // tabBar 配置
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "static/tabbar/home.png",
        "selectedIconPath": "static/tabbar/home-active.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/user/user",
        "iconPath": "static/tabbar/user.png",
        "selectedIconPath": "static/tabbar/user-active.png",
        "text": "我的"
      }
    ]
  },
  
  // 分包配置
  "subPackages": [
    {
      "root": "pagesA",
      "pages": [
        {
          "path": "list/list",
          "style": {
            "navigationBarTitleText": "列表"
          }
        }
      ]
    }
  ],
  
  // 预下载规则
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pagesA"]
    }
  }
}
```

### 条件编译

在 pages.json 中使用条件编译：

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        // #ifdef APP-PLUS
        "titleNView": {
          "buttons": [
            {
              "text": "搜索",
              "fontSize": "16px"
            }
          ]
        }
        // #endif
      }
    }
  ],
  "subPackages": [
    // #ifdef APP-PLUS
    {
      "root": "pagesApp",
      "pages": [
        {
          "path": "native/native",
          "style": {
            "navigationBarTitleText": "App 专属页面"
          }
        }
      ]
    }
    // #endif
  ]
}
```

## 生命周期

### 应用生命周期

```vue
<!-- App.vue -->
<script>
export default {
  // 应用初始化完成时触发（全局只触发一次）
  onLaunch(options) {
    console.log('App Launch', options)
    // options.path: 启动页面路径
    // options.query: 启动参数
    // options.scene: 场景值（小程序）
  },
  
  // 应用启动或从后台进入前台时触发
  onShow(options) {
    console.log('App Show', options)
  },
  
  // 应用从前台进入后台时触发
  onHide() {
    console.log('App Hide')
  },
  
  // 应用发生错误时触发
  onError(err) {
    console.error('App Error', err)
  },
  
  // 页面不存在时触发
  onPageNotFound(res) {
    console.log('Page Not Found', res)
    // 重定向到首页
    uni.reLaunch({
      url: '/pages/index/index'
    })
  },
  
  // 应用主题改变时触发（仅 App）
  onThemeChange(res) {
    console.log('Theme Change', res.theme)
  }
}
</script>
```

### 页面生命周期

```vue
<template>
  <
{
      title: '新标题'
    })
  },
  
  // 页面隐藏时触发
  onHide() {
    console.log('Page Hide')
    // 适合：暂停任务、保存状态
  },
  
  // 页面卸载时触发
  onUnload() {
    console.log('Page Unload')
    // 适合：清理资源、取消请求
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    console.log('Pull Down Refresh')
    // 刷新数据
    this.loadData().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  
  // 上拉触底
  onReachBottom() {
    console.log('Reach Bottom')
    // 加载更多数据
    this.loadMore()
  },
  
  // 页面滚动
  onPageScroll(e) {
    console.log('Page Scroll', e.scrollTop)
  },
  
  // 用户点击右上角分享
  onShareAppMessage() {
    return {
      title: '分享标题',
      path: '/pages/index/index'
    }
  },
  
  // Tab 点击
  onTabItemTap(item) {
    console.log('Tab Item Tap', item)
  },
  
  // 窗口尺寸改变
  onResize(res) {
    console.log('Resize', res.size)
  }
}
</script>
```

### 组件生命周期

```vue
<template>
  <view class="custom">
    <text>{{ title }}</text>
  </view>
</template>

<script>
export default {
  props: {
    title: String
  },
  
  data() {
    return {
      innerData: 'value'
    }
  },
  
  // Vue 组件生命周期
  beforeCreate() {
    console.log('Before Create')
  },
  
  created() {
    console.log('Created')
  },
  
  beforeMount() {
    console.log('Before Mount')
  },
  
  mounted() {
    console.log('Mounted')
  },
  
  beforeUpdate() {
    console.log('Before Update')
  },
  
  updated() {
    console.log('Updated')
  },
  
  beforeUnmount() {
    console.log('Before Unmount')
  },
  
  unmounted() {
    console.log('Unmounted')
  }
}
</script>
```

## 路由与导航

### 路由 API

uni-app 的路由 API 与小程序类似：

```javascript
// 1. uni.navigateTo - 保留当前页面，跳转到新页面
uni.navigateTo({
  url: '/pages/detail/detail?id=123&name=test',
  success: (res) => {
    console.log('跳转成功')
  },
  fail: (err) => {
    console.error('跳转失败', err)
  }
})

// 接收参数
export default {
  onLoad(options) {
    console.log(options.id)    // '123'
    console.log(options.name)  // 'test'
  }
}

// 2. uni.redirectTo - 关闭当前页面，跳转到新页面
uni.redirectTo({
  url: '/pages/result/result'
})

// 3. uni.navigateBack - 返回上一页或多级页面
uni.navigateBack({
  delta: 1  // 返回的页面数，默认 1
})

// 4. uni.switchTab - 跳转到 tabBar 页面
uni.switchTab({
  url: '/pages/index/index'
})

// 5. uni.reLaunch - 关闭所有页面，打开新页面
uni.reLaunch({
  url: '/pages/index/index'
})
```

### 页面间通信

**1. URL 传参**：

```javascript
// 跳转时传参
uni.navigateTo({
  url: '/pages/detail/detail?id=123&name=test'
})

// 接收参数
export default {
  onLoad(options) {
    console.log(options.id, options.name)
  }
}
```

**2. EventChannel（页面间事件通信）**：

```javascript
// 页面 A 跳转到页面 B
uni.navigateTo({
  url: '/pages/detail/detail',
  success: (res) => {
    // 向页面 B 传递数据
    res.eventChannel.emit('acceptDataFromOpenerPage', {
      data: 'test'
    })
  }
})

// 页面 B 接收数据
export default {
  onLoad() {
    const eventChannel = this.getOpenerEventChannel()
    
    // 监听来自页面 A 的数据
    eventChannel.on('acceptDataFromOpenerPage', (data) => {
      console.log(data)
    })
    
    // 向页面 A 传递数据
    eventChannel.emit('acceptDataFromDetailPage', {
      result: 'success'
    })
  }
}
```

**3. 全局事件总线**：

```javascript
// utils/event-bus.js
export default {
  events: {},
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  },
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        callback(data)
      })
    }
  },
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
  }
}

// 使用
import EventBus from '@/utils/event-bus'

// 监听事件
EventBus.on('dataUpdate', (data) => {
  console.log(data)
})

// 触发事件
EventBus.emit('dataUpdate', { value: 'new' })

// 移除监听
EventBus.off('dataUpdate', callback)
```


## 条件编译

### 基础语法

条件编译是 uni-app 处理跨端差异的核心机制。

**语法规则**：
- `#ifdef`：if defined，仅在某平台存在
- `#ifndef`：if not defined，除了某平台均存在
- `#endif`：结束条件编译

**平台标识**：
- `APP-PLUS`：App
- `H5`：H5
- `MP-WEIXIN`：微信小程序
- `MP-ALIPAY`：支付宝小程序
- `MP-BAIDU`：百度小程序
- `MP-TOUTIAO`：字节跳动小程序
- `MP-QQ`：QQ 小程序

### JS 条件编译

```javascript
// #ifdef APP-PLUS
// 仅在 App 平台下生效的代码
console.log('This is App')
const appVersion = plus.runtime.version
// #endif

// #ifndef H5
// 除了 H5 平台，其他平台均存在的代码
console.log('Not H5')
// #endif

// #ifdef H5 || MP-WEIXIN
// 在 H5 平台或微信小程序平台存在的代码
console.log('H5 or WeChat')
// #endif

// 实战示例：平台特定的 API 调用
export default {
  methods: {
    makePhoneCall() {
      // #ifdef APP-PLUS
      // App 端使用 plus API
      plus.device.dial({
        number: '10086'
      })
      // #endif
      
      // #ifdef H5
      // H5 端使用 window.location
      window.location.href = 'tel:10086'
      // #endif
      
      // #ifdef MP-WEIXIN
      // 微信小程序使用 wx API
      wx.makePhoneCall({
        phoneNumber: '10086'
      })
      // #endif
    }
  }
}
```

### CSS 条件编译

```css
/* #ifdef APP-PLUS */
/* 仅在 App 平台生效 */
.container {
  padding-top: 44px; /* 状态栏高度 */
}
/* #endif */

/* #ifndef H5 */
/* 除了 H5，其他平台生效 */
.header {
  position: fixed;
  top: 0;
}
/* #endif */

/* #ifdef 
>
</template>
```

### 整个文件条件编译

```
pages/
├── index/
│   ├── index.vue          # 通用页面
│   ├── index.app.vue      # App 专用页面
│   ├── index.h5.vue       # H5 专用页面
│   └── index.mp-weixin.vue # 微信小程序专用页面
```

**优先级**：
1. 平台特定文件（如 index.app.vue）
2. 通用文件（如 index.vue）

## 状态管理

### Vuex 集成

```javascript
// store/index.js
import { createStore } from 'vuex'

const store = createStore({
  state: {
    user: null,
    token: ''
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
    }
  },
  
  actions: {
    login({ commit }, { username, password }) {
      return new Promise((resolve, reject) => {
        uni.request({
          url: '/api/login',
          method: 'POST',
          data: { username, password },
          success: (res) => {
            commit('SET_USER', res.data.user)
            commit('SET_TOKEN', res.data.token)
            // 持久化存储
            uni.setStorageSync('token', res.data.token)
            resolve(res.data)
          },
          fail: reject
        })
      })
    },
    
    logout({ commit }) {
      commit('SET_USER', null)
      commit('SET_TOKEN', '')
      uni.removeStorageSync('token')
    }
  },
  
  getters: {
    isLogin: state => !!state.token
  }
})

export default store
```

```javascript
// main.js
import App from './App'
import { createSSRApp } from 'vue'
import store from './store'

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  return {
    app
  }
}
```

```vue
<!-- 页面中使用 -->
<template>
  <view>
    <text>{{ user.name }}</text>
    <button @click="handleLogin">登录</button>
  </view>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['user'])
  },
  
  methods: {
    ...mapActions(['login']),
    
    handleLogin() {
      this.login({
        username: 'admin',
        password: '123456'
      }).then(() => {
        uni.showToast({
          title: '登录成功'
        })
      })
    }
  }
}
</script>
```

### Pinia 集成

```javascript
// store/index.js
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
```

```javascript
// store/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: ''
  }),
  
  getters: {
    isLogin: (state) => !!state.token
  },
  
  actions: {
    async login(username, password) {
      const res = await uni.request({
        url: '/api/login',
        method: 'POST',
        data: { username, password }
      })
      
      this.user = res.data.user
      this.token = res.data.token
      uni.setStorageSync('token', res.data.token)
    },
    
    logout() {
      this.user = null
      this.token = ''
      uni.removeStorageSync('token')
    }
  }
})
```

```javascript
// main.js
import App from './App'
import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'

export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())
  return {
    app,
    Pinia // 必须返回 Pinia
  }
}
```

```vue
<!-- 页面中使用 -->
<template>
  <view>
    <text>{{ userStore.user?.name }}</text>
    <button @click="handleLogin">登录</button>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const handleLogin = () => {
  userStore.login('admin', '123456').then(() => {
    uni.showToast({
      title: '登录成功'
    })
  })
}
</script>
```

## 网络请求

### 基础请求

```javascript
// 基础用法
uni.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  data: {
    id: 123
  },
  header: {
    'Content-Type': 'application/json'
  },
  success: (res) => {
    console.log('请求成功', res.data)
  },
  fail: (err) => {
    console.error('请求失败', err)
  },
  complete: () => {
    console.log('请求完成')
  }
})
```

### 请求封装

```javascript
// utils/request.js
const BASE_URL = 'https://api.example.com'

// 请求拦截器
const requestInterceptor = (config) => {
  // 添加 token
  const token = uni.getStorageSync('token')
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // 显示加载提示
  uni.showLoading({
    title: '加载中...',
    mask: true
  })
  
  return config
}

// 响应拦截器
const responseInterceptor = (response) => {
  // 隐藏加载提示
  uni.hideLoading()
  
  // 处理响应
  if (response.statusCode === 200) {
    const data = response.data
    
    // 业务错误处理
    if (data.code !== 0) {
      uni.showToast({
        title: data.message || '请求失败',
        icon: 'none'
      })
      return Promise.reject(data)
    }
    
    return data.data
  } else {
    // HTTP 错误处理
    uni.showToast({
      title: `请求失败: ${response.statusCode}`,
      icon: 'none'
    })
    return Promise.reject(response)
  }
}

// 请求方法
const request = (options) => {
  // 应用请求拦截器
  const config = requestInterceptor({
    url: BASE_URL + options.url,
    method: options.method || 'GET',
    data: options.data || {},
    header: options.header || {}
  })
  
  return new Promise((resolve, reject) => {
    uni.request({
      ...config,
      success: (res) => {
        // 应用响应拦截器
        responseInterceptor(res)
          .then(resolve)
          .catch(reject)
      },
      fail: (err) => {
        uni.hideLoading()
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// 导出便捷方法
export default {
  get(url, data, options = {}) {
    return request({
      url,
      method: 'GET',
      data,
      ...options
    })
  },
  
  post(url, data, options = {}) {
    return request({
      url,
      method: 'POST',
      data,
      ...options
    })
  },
  
  put(url, data, options = {}) {
    return request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  },
  
  delete(url, data, options = {}) {
    return request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }
}
```

```javascript
// 使用封装的请求
import request from '@/utils/request'

export default {
  methods: {
    async loadData() {
      try {
        const data = await request.get('/api/list', {
          page: 1,
          pageSize: 20
        })
        console.log(data)
      } catch (err) {
        console.error(err)
      }
    }
  }
}
```

### 文件上传

```javascript
// 上传图片
uni.chooseImage({
  count: 1,
  success: (res) => {
    const tempFilePath = res.tempFilePaths[0]
    
    uni.uploadFile({
      url: 'https://api.example.com/upload',
      filePath: tempFilePath,
      name: 'file',
      formData: {
        user: 'test'
      },
      success: (uploadRes) => {
        console.log('上传成功', uploadRes.data)
      }
    })
  }
})
```


## 分包加载

### 分包配置

分包可以优化小程序的启动速度，减少首屏加载时间。

```json
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    }
  ],
  
  // 分包配置
  "subPackages": [
    {
      "root": "pagesA",
      "pages": [
        {
          "path": "list/list",
          "style": {
            "navigationBarTitleText": "列表"
          }
        },
        {
          "path": "detail/detail",
          "style": {
            "navigationBarTitleText": "详情"
          }
        }
      ]
    },
    {
      "root": "pagesB",
      "pages": [
        {
          "path": "user/user",
          "style": {
            "navigationBarTitleText": "用户"
          }
        }
      ]
    }
  ],
  
  // 预下载规则
  "preloadRule": {
    "pages/index/index": {
      "network": "all",      // all: 不限网络, wifi: 仅 WiFi
      "packages": ["pagesA"] // 预下载的分包
    },
    "pagesA/list/list": {
      "network": "wifi",
      "packages": ["pagesB"]
    }
  }
}
```

**目录结构**：

```
uni-app-project/
├── pages/              # 主包页面
│   └── index/
│       └── index.vue
├── pagesA/             # 分包 A
│   ├── list/
│   │   └── list.vue
│   └── detail/
│       └── detail.vue
└── pagesB/             # 分包 B
    └── user/
        └── user.vue
```

### 跳转到分包页面

```javascript
// 跳转到分包页面
uni.navigateTo({
  url: '/pagesA/list/list'
})

// 跳转到分包详情页
uni.navigateTo({
  url: '/pagesA/detail/de
com/dcloudio/uni-app)

---

> 本文档基于 uni-app 官方文档整理，包含核心概念、最佳实践和常见问题解决方案。
 3. nvue 样式限制

**问题**：nvue 不支持所有 CSS 属性。

**解决**：使用 nvue 支持的样式，或使用 vue 页面。

```css
/* nvue 支持的样式 */
.container {
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}

/* nvue 不支持的样式 */
/* display: grid; */
/* position: sticky; */
/* box-shadow: 0 2px 4px rgba(0,0,0,0.1); */
```

## 参考资源

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [uni-app 插件市场](https://ext.dcloud.net.cn/)
- [DCloud 社区](https://ask.dcloud.net.cn/)
- [uni-app GitHub](https://github.
**解决**：
- 使用 rpx 单位（响应式像素）
- 避免使用非标准 CSS
- 使用条件编译处理差异

```css
/* 使用 rpx */
.container {
  width: 750rpx;  /* 屏幕宽度 */
  padding: 20rpx;
}

/* 条件编译 */
/* #ifdef APP-PLUS */
.header {
  padding-top: 44px; /* 状态栏高度 */
}
/* #endif */
```

### 2. 页面栈溢出

**问题**：页面栈超过限制（小程序 10 层）。

**解决**：使用 `redirectTo` 或 `reLaunch`。

```javascript
// ❌ 可能导致栈溢出
uni.navigateTo({ url: '/pages/detail/detail' })

// ✅ 关闭当前页面
uni.redirectTo({ url: '/pages/detail/detail' })

// ✅ 关闭所有页面
uni.reLaunch({ url: '/pages/index/index' })
```

###ndif
    }
  }
}
```

### 4. 性能监控

```javascript
// 页面性能监控
export default {
  data() {
    return {
      startTime: 0
    }
  },
  
  onLoad() {
    this.startTime = Date.now()
  },
  
  onReady() {
    const loadTime = Date.now() - this.startTime
    console.log('页面加载时间', loadTime)
    
    // 上报性能数据
    uni.request({
      url: '/api/performance',
      method: 'POST',
      data: {
        page: this.$mp.page.route,
        loadTime
      }
    })
  }
}
```

## 常见问题

### 1. 跨端样式不一致

**问题**：不同平台样式显示不一致。
条件编译处理平台差异
export default {
  methods: {
    getPlatform() {
      // #ifdef APP-PLUS
      return 'App'
      // #endif
      
      // #ifdef H5
      return 'H5'
      // #endif
      
      // #ifdef MP-WEIXIN
      return '微信小程序'
      // #endif
    },
    
    // 封装平台差异 API
    makePhoneCall(phoneNumber) {
      // #ifdef APP-PLUS
      plus.device.dial({
        number: phoneNumber
      })
      // #endif
      
      // #ifndef APP-PLUS
      uni.makePhoneCall({
        phoneNumber
      })
      // #e
      method: 'POST',
      data: {
        error: err,
        page: getCurrentPages().pop().route,
        time: new Date().toISOString()
      }
    })
  }
}

// 页面错误处理
export default {
  methods: {
    async loadData() {
      try {
        const data = await request.get('/api/data')
        this.list = data
      } catch (err) {
        console.error('加载失败', err)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    }
  }
}
```

### 3. 平台差异处理

```javascript
// 使用数
├── api/               # API 接口
├── store/             # 状态管理
├── mixins/            # 混入
└── filters/           # 过滤器
```

**命名规范**：

```javascript
// 文件名：小写字母 + 连字符
// user-info.vue

// 组件名：大驼峰
export default {
  name: 'UserInfo'
}

// 变量名：小驼峰
const userName = 'Tom'

// 常量名：大写字母 + 下划线
const API_BASE_URL = 'https://api.example.com'
```

### 2. 错误处理

```javascript
// 全局错误处理
// App.vue
export default {
  onError(err) {
    console.error('全局错误', err)
    
    // 错误上报
    uni.request({
      url: '/api/error',t>
export default {
  data() {
    return {
      list: []
    }
  }
}
</script>

<style>
/* nvue 只支持部分 CSS */
.list {
  flex: 1;
}

.item {
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: #e5e5e5;
}

.title {
  font-size: 16px;
  color: #333;
}

.desc {
  font-size: 14px;
  color: #999;
  margin-top: 10px;
}
</style>
```

## 最佳实践

### 1. 代码规范

**目录结构**：

```
uni-app-project/
├── pages/              # 页面
├── components/         # 组件
├── static/            # 静态资源
├── utils/             # 工具函mple.com/image'
    }
  },
  
  methods: {
    handleImageError(e) {
      // WebP 加载失败，降级到 JPG
      e.target.src = this.imageUrl + '.jpg'
    }
  }
}
</script>
```

### nvue 原生渲染

nvue 使用原生渲染，性能更好，适合复杂列表、视频等场景。

```vue
<!-- pages/list/list.nvue -->
<template>
  <list class="list">
    <cell v-for="item in list" :key="item.id">
      <view class="item">
        <text class="title">{{ item.title }}</text>
        <text class="desc">{{ item.desc }}</text>
      </view>
    </cell>
  </list>
</template>

<scrip片优化

**1. 图片压缩**：

```javascript
// 压缩图片
uni.chooseImage({
  count: 1,
  success: (res) => {
    uni.compressImage({
      src: res.tempFilePaths[0],
      quality: 80,
      success: (compressRes) => {
        console.log('压缩后', compressRes.tempFilePath)
      }
    })
  }
})
```

**2. 使用 WebP 格式**：

```vue
<template>
  <!-- 优先使用 WebP，不支持则降级到 JPG -->
  <image 
    :src="imageUrl + '.webp'" 
    @error="handleImageError"
  />
</template>

<script>
export default {
  data() {
    return {
      imageUrl: 'https://exa}
      })
      
      this.list = res.data.list
      this.hasMore = res.data.hasMore
      this.loading = false
    },
    
    async loadMore() {
      this.loading = true
      this.page++
      
      const res = await uni.request({
        url: '/api/list',
        data: {
          page: this.page,
          pageSize: this.pageSize
        }
      })
      
      this.list = [...this.list, ...res.data.list]
      this.hasMore = res.data.hasMore
      this.loading = false
    }
  }
}
</script>
```

### 图mplate>

<script>
export default {
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 20,
      loading: false,
      hasMore: true
    }
  },
  
  onLoad() {
    this.loadData()
  },
  
  onReachBottom() {
    if (!this.hasMore || this.loading) return
    this.loadMore()
  },
  
  methods: {
    async loadData() {
      this.loading = true
      
      const res = await uni.request({
        url: '/api/list',
        data: {
          page: this.page,
          pageSize: this.pageSize
        ollTop
      const startIndex = Math.floor(scrollTop / this.itemHeight)
      const endIndex = startIndex + this.visibleCount
      
      this.visibleList = this.list.slice(startIndex, endIndex)
    }
  }
}
</script>
```

**2. 分页加载**：

```vue
<template>
  <view class="container">
    <view v-for="item in list" :key="item.id">
      {{ item.name }}
    </view>
    
    <view v-if="loading" class="loading">
      加载中...
    </view>
    
    <view v-if="!hasMore" class="no-more">
      没有更多了
    </view>
  </view>
</tet: scrollHeight + 'px' }"
      @scroll="handleScroll"
    >
      <view 
        v-for="item in visibleList" 
        :key="item.id"
        class="item"
      >
        {{ item.name }}
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      list: [],           // 完整列表
      visibleList: [],    // 可见列表
      scrollHeight: 600,
      itemHeight: 80,
      visibleCount: 10
    }
  },
  
  methods: {
    handleScroll(e) {
      const scrollTop = e.detail.scrleton-item {
  height: 80rpx;
  background: #f5f5f5;
  margin-bottom: 20rpx;
  border-radius: 8rpx;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
```

**3. 图片懒加载**：

```vue
<template>
  <image 
    :src="item.image" 
    lazy-load
    mode="aspectFill"
  />
</template>
```

### 长列表优化

**1. 虚拟列表**：

```vue
<template>
  <view class="container">
    <scroll-view 
      scroll-y
      :style="{ heigh-->
    <view v-if="loading" class="skeleton">
      <view class="skeleton-item"></view>
      <view class="skeleton-item"></view>
    </view>
    
    <!-- 实际内容 -->
    <view v-else>
      <view v-for="item in list" :key="item.id">
        {{ item.name }}
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      list: []
    }
  },
  
  onLoad() {
    this.loadData().then(() => {
      this.loading = false
    })
  }
}
</script>

<style>
.ske

      const scrollTop = e.detail.scrollTop
      const startIndex = Math.floor(scrollTop / this.itemHeight)
      const endIndex = startIndex + this.visibleCount
      
      this.visibleList = this.list.slice(startIndex, endIndex)
    }
  }
}
</script>
```

**2. 分页加载**：

```vue
<template>
  <view class="container">
    <view v-for="item in list" :key="item.id">
      {{ item.name }}
    </view>
    
    <view v-if="loading" class="loading">
      加载中...
    </view>
    
    <view v-if="!hasMore" class="no-more">
      没有更多了
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 20,
      loading: false,
      hasMore: true
    }
  },
  
  onLoad() {
    this.loadData()
  },
  
  onReachBottom() {
    if (!this.hasMore || this.loading) return
    this.loadMore()
  },
  
  methods: {
    async loadData() {
      this.loading = true
      
      const res = await uni.request({
        url: '/api/list',
        data: {
          page: this.page,
          pageSize: this.pageSize
        }
      })
      
      this.list = res.data.list
      this.hasMore = res.data.hasMore
      this.loading = false
    },
    
    async loadMore() {
      this.loading = true
      this.page++
      
      const res = await uni.request({
        url: '/api/list',
        data: {
          page: this.page,
          pageSize: this.pageSize
        }
      })
image 
    :src="imageUrl + '.webp'" 
    @error="handleImageError"
  />
</template>

<script>
export default {
  data() {
    return {
      imageUrl: 'https://example.com/image'
    }
  },
  
  methods: {
    handleImageError(e) {
      // WebP 加载失败，降级到 JPG
      e.target.src = this.imageUrl + '.jpg'
    }
  }
}
</script>
```

### nvue 原生渲染

nvue 使用原生渲染，性能更好，适合复杂列表、视频等场景。

```vue
<!-- pages/list/list.nvue -->
<template>
  <list class="list">
    <cell v-for="item in list" :key="item.id">
      <view class="item">
        <text class="title">{{ item.title }}</text>
        <text class="desc">{{ item.desc }}</text>
      </view>
    </cell>
  </list>
</template>

<script>
export default {
  data() {
    return {
      list: []
    }
  }
}
</script>

<style>
/* nvue 只支持部分 CSS */
.list {
  flex: 1;
}

.item {
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: #e5e5e5;
}

.title {
  font-size: 16px;
  color: #333;
}

.desc {
  font-size: 14px;
  color: #999;
  margin-top: 10px;
}
</style>
```

## 最佳实践

### 1. 代码规范

**目录结构**：

```
uni-app-project/
├── pages/              # 页面
├── components/         # 组件
├── static/            # 静态资源
├── utils/             # 工具函数
├── api/               # API 接口
├── store/             # 状态管理
├── mixins/            # 混入
└── filters/           # 过滤器
```

**命名规范**：

```javascript
// 文件名：小写字母 + 连字符
// user-info.vue

// 组件名：大驼峰
export default {
  name: 'UserInfo'
}

// 变量名：小驼峰
const userName = 'Tom'

// 常量名：大写字母 + 下划线
const API_BASE_URL = 'https://api.example.com'
```

### 2. 错误处理

```javascript
// 全局错误处理
// App.vue
export default {
  onError(err) {
    console.error('全局错误', err)
    
    // 错误上报
    uni.request({
      url: '/api/error',
      method: 'POST',
      data: {
        error: err,
        page: getCurrentPages().pop().route,
        time: new Date().toISOString()
      }
    })
  }
}

// 页面错误处理
export default {
  methods: {
    async loadData() {
      try {
        const data = await request.get('/api/data')
        this.list = data
      } catch (err) {
        console.error('加载失败', err)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    }
  }
}
```

### 3. 平台差异处理

```javascript
// 使用条件编译处理平台差异
export default {
  methods: {
    getPlatform() {
      // #ifdef APP-PLUS
      return 'App'
      // #endif
      
      // #ifdef H5
      return 'H5'
      // #endif
      
      // #ifdef MP-WEIXIN
      return '微信小程序'
      // #endif
    },
    
    // 封装平台差异 API
    makePhoneCall(phoneNumber) {
      // #ifdef APP-PLUS
      plus.device.dial({
        number: phoneNumber
      })
      // #endif
      
      // #ifndef APP-PLUS
      uni.makePhoneCall({
        phoneNumber
      })
      // #endif
    }
  }
}
```

### 4. 性能监控

```javascript
// 页面性能监控
export default {
  data() {
    return {
      startTime: 0
    }
  },
  
  onLoad() {
    this.startTime = Date.now()
  },
  
  onReady() {
    const loadTime = Date.now() - this.startTime
    console.log('页面加载时间', loadTime)
    
    // 上报性能数据
    uni.request({
      url: '/api/performance',
      method: 'POST',
      data: {
        page: this.$mp.page.route,
        loadTime
      }
    })
  }
}
```

## 常见问题

### 1. 跨端样式不一致

**问题**：不同平台样式显示不一致。

**解决**：
- 使用 rpx 单位（响应式像素）
- 避免使用非标准 CSS
- 使用条件编译处理差异

```css
/* 使用 rpx */
.container {
  width: 750rpx;  /* 屏幕宽度 */
  padding: 20rpx;
}

/* 条件编译 */
/* #ifdef APP-PLUS */
.header {
  padding-top: 44px; /* 状态栏高度 */
}
/* #endif */
```

### 2. 页面栈溢出

**问题**：页面栈超过限制（小程序 10 层）。

**解决**：使用 `redirectTo` 或 `reLaunch`。

```javascript
// ❌ 可能导致栈溢出
uni.navigateTo({ url: '/pages/detail/detail' })

// ✅ 关闭当前页面
uni.redirectTo({ url: '/pages/detail/detail' })

// ✅ 关闭所有页面
uni.reLaunch({ url: '/pages/index/index' })
```

### 3. nvue 样式限制

**问题**：nvue 不支持所有 CSS 属性。

**解决**：使用 nvue 支持的样式，或使用 vue 页面。

```css
/* nvue 支持的样式 */
.container {
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}

/* nvue 不支持的样式 */
/* display: grid; */
/* position: sticky; */
/* box-shadow: 0 2px 4px rgba(0,0,0,0.1); */
```

### 4. 分包大小限制

**问题**：小程序分包大小限制（主包 2MB，总包 20MB）。

**解决**：
- 优化图片资源（使用 CDN）
- 按需引入组件库
- 使用分包异步化

```json
// manifest.json
{
  "mp-weixin": {
    "optimization": {
      "subPackages": true
    }
  }
}
```

### 5. 生命周期执行顺序

**问题**：不清楚生命周期的执行顺序。

**解决**：理解生命周期的执行顺序。

```
应用启动：
App.onLaunch → App.onShow → Page.onLoad → Page.onShow → Page.onReady

页面切换：
Page A.onHide → Page B.onLoad → Page B.onShow → Page B.onReady

返回上一页：
Page B.onUnload → Page A.onShow

应用后台：
Page.onHide → App.onHide

应用前台：
App.onShow → Page.onShow
```

## 参考资源

### 官方资源

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/) - 完整的官方文档
- [uni-app 插件市场](https://ext.dcloud.net.cn/) - 丰富的插件和模板
- [DCloud 社区](https://ask.dcloud.net.cn/) - 官方社区论坛
- [uni-app GitHub](https://github.com/dcloudio/uni-app) - 开源仓库

### 学习教程

- [uni-app 从入门到实战](https://www.bilibili.com/video/BV1BJ411W7pX/) - B站视频教程
- [uni-app 实战教程](https://juejin.cn/post/6844904074766262279) - 掘金教程
- [uni-app 开发指南](https://www.yuque.com/uniapp) - 语雀文档

### 组件库

- [uni-ui](https://uniapp.dcloud.net.cn/component/uniui/uni-ui.html) - 官方组件库
- [uView UI](https://www.uviewui.com/) - 多平台快速开发的UI框架
- [ColorUI](https://github.com/weilanwl/ColorUI) - 高颜值的小程序组件库
- [ThorUI](https://thorui.cn/) - 轻量、简洁的移动端组件库

### 实战项目

- [uni-app 商城项目](https://github.com/dcloudio/uni-shop) - 官方商城示例
- [uni-app 新闻项目](https://github.com/dcloudio/hello-uniapp) - 官方示例项目
- [仿网易云音乐](https://github.com/SuiXinTop/uni-app-music) - 开源音乐项目

### 社区资源

- [uni-app 中文社区](https://ask.dcloud.net.cn/explore/) - 问答社区
- [uni-app 插件开发](https://uniapp.dcloud.net.cn/plugin/) - 插件开发指南
- [uni-app 性能优化](https://uniapp.dcloud.net.cn/tutorial/performance.html) - 官方优化指南

---

> 本文档基于 uni-app 官方文档整理，包含核心概念、最佳实践和常见问题解决方案。适合初学者入门和进阶开发者参考。
