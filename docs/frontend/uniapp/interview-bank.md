# uni-app 面试题库

> 更新时间：2025-02

## 目录导航

- [基础概念](#基础概念)
- [跨端架构](#跨端架构)
- [生命周期](#生命周期)
- [路由与导航](#路由与导航)
- [条件编译](#条件编译)
- [状态管理](#状态管理)
- [网络请求](#网络请求)
- [分包加载](#分包加载)
- [性能优化](#性能优化)
- [实战场景](#实战场景)

## 基础概念

### Q1: uni-app 的核心特点是什么？

**核心答案**：

uni-app 是一个使用 Vue.js 开发所有前端应用的框架，核心特点：

1. **一套代码，多端运行**：编写一次，发布到 iOS、Android、H5、小程序等平台
2. **基于 Vue.js**：使用 Vue 语法，学习成本低
3. **丰富的组件和 API**：提供跨端组件和 API
4. **完善的插件生态**：uni_modules 插件市场

**代码示例**：

```vue
<!-- 一套代码，多端运行 -->
<template>
  <view class="container">
    <text>{{ message }}</text>
    <button @click="handleClick">点击</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello uni-app'
    }
  },
  
  methods: {
    handleClick() {
      uni.showToast({
        title: '点击成功'
      })
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
}
</style>
```

**追问点**：
- uni-app 与原生开发的区别？
- uni-app 与其他跨端框架的对比？
- uni-app 的适用场景？

---

### Q2: uni-app 的多端架构是什么？

**核心答案**：

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
n 的作用是什么？

**核心答案**：

pages.json 是 uni-app 的全局配置文件，用于配置：

1. **页面路由**：pages 数组
2. **全局样式**：globalStyle
3. **tabBar 配置**：tabBar
4. **分包配置**：subPackages
5. **预下载规则**：preloadRule

**代码示例**：

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "enablePullDownRefresh": true
      }
    }
  ],
  
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "uni-app",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  },
  
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      }
    ]
  },
  
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
  ]
}
```

**追问点**：
- pages.json 与小程序 app.json 的区别？
- 如何配置分包？
- 如何使用条件编译？

---

## 生命周期

### Q4: uni-app 的生命周期有哪些？

**核心答案**：

uni-app 有三个层级的生命周期：

1. **应用生命周期**：onLaunch、onShow、onHide、onError
2. **页面生命周期**：onLoad、onShow、onReady、onHide、onUnload
3. **组件生命周期**：Vue 组件生命周期

**代码示例**：

```vue
<!-- App.vue - 应用生命周期 -->
<script>
export default {
  onLaunch(options) {
    console.log('App Launch', options)
  },
  
  onShow(options) {
    console.log('App Show', options)
  },
  
  onHide() {
    console.log('App Hide')
  }
}
</script>

<!-- 页面生命周期 -->
<script>
export default {
  onLoad(options) {
    console.log('Page Load', options)
    // 适合：初始化数据、接收参数
  },
  
  onShow() {
    console.log('Page Show')
    // 适合：刷新数据、恢复状态
  },
  
  onReady() {
    console.log('Page Ready')
    // 适合：获取节点信息、设置导航栏
  },
  
  onHide() {
    console.log('Page Hide')
  },
  
  onUnload() {
    console.log('Page Unload')
    // 适合：清理资源、取消请求
  }
}
</script>
```

**追问点**：
- onLoad 和 onShow 的区别？
- 什么时候使用 onReady？
- 组件生命周期与页面生命周期的关系？

---

## 路由与导航

### Q5: uni-app 的路由 API 有哪些？

**核心答案**：

uni-app 提供 5 个路由 API：

| API | 说明 | 页面栈变化 |
|-----|------|-----------|
| navigateTo | 保留当前页面，跳转到新页面 | [A] → [A, B] |
| redirectTo | 关闭当前页面，跳转到新页面 | [A] → [B] |
| navigateBack | 返回上一页或多级页面 | [A, B, C] → [A, B] |
| switchTab | 跳转到 tabBar 页面 | [A, B] → [Tab] |
| reLaunch | 关闭所有页面，打开新页面 | [A, B, C] → [D] |

**代码示例**：

```javascript
// 1. navigateTo - 保留当前页面
uni.navigateTo({
  url: '/pages/detail/detail?id=123'
})

// 2. redirectTo - 关闭当前页面
uni.redirectTo({
  url: '/pages/result/result'
})

// 3. navigateBack - 返回
uni.navigateBack({
  delta: 1  // 返回的页面数
})

// 4. switchTab - 跳转到 tabBar 页面
uni.switchTab({
  url: '/pages/index/index'
})

// 5. reLaunch - 关闭所有页面
uni.reLaunch({
  url: '/pages/index/index'
})

// 接收参数
export default {
  onLoad(options) {
    console.log(options.id)  // '123'
  }
}
```

**追问点**：
- 页面栈的限制是多少？
- 如何实现页面间通信？
- tabBar 页面如何传参？

---

## 条件编译

### Q6: uni-app 的条件编译如何使用？

**核心答案**：

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

**代码示例**：

```javascript
// JS 条件编译
// #ifdef APP-PLUS
console.log('仅在 App 平台生效')
const appVersion = plus.runtime.version
// #endif

// #ifndef H5
console.log('除了 H5，其他平台生效')
// #endif

// #ifdef H5 || MP-WEIXIN
console.log('H5 或微信小程序生效')
// #endif
```

```css
/* CSS 条件编译 */
/* #ifdef APP-PLUS */
.container {
  padding-top: 44px; /* 状态栏高度 */
}
/* #endif */

/* #ifndef H5 */
.header {
  position: fixed;
  top: 0;
}
/* #endif */
```

```vue
<!-- 模板条件编译 -->
<template>
  <view>
    <!-- #ifdef APP-PLUS -->
    <view>仅 App 显示</view>
    <!-- #endif -->
    
    <!-- #ifndef H5 -->
    <view>非 H5 显示</view>
    <!-- #endif -->
  </view>
</template>
```

**追问点**：
- 如何处理复杂的平台差异？
- 条件编译的最佳实践？
- 如何减少条件编译的使用？

---

## 状态管理

### Q7: uni-app 如何集成 Vuex/Pinia？

**核心答案**：

uni-app 支持 Vuex 和 Pinia 进行状态管理。

**Vuex 集成**：

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
    }
  },
  
  actions: {
    async login({ commit }, { username, password }) {
      const res = await uni.request({
        url: '/api/login',
        method: 'POST',
        data: { username, password }
      })
      commit('SET_USER', res.data.user)
      uni.setStorageSync('token', res.data.token)
    }
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
  return { app }
}
```

**Pinia 集成**：

```javascript
// store/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: ''
  }),
  
  actions: {
    async login(username, password) {
      const res = await uni.request({
        url: '/api/login',
        method: 'POST',
        data: { username, password }
      })
      this.user = res.data.user
      this.token = res.data.token
    }
  }
})
```

**追问点**：
- Vuex 和 Pinia 的区别？
- 如何实现数据持久化？
- 如何处理多端差异？

---

## 网络请求

### Q8: 如何封装 uni-app 的网络请求？

**核心答案**：

封装网络请求可以统一处理请求拦截、响应拦截、错误处理等。

**代码示例**：

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
  uni.showLoading({ title: '加载中...', mask: true })
  
  return config
}

// 响应拦截器
const responseInterceptor = (response) => {
  uni.hideLoading()
  
  if (response.statusCode === 200) {
    const data = response.data
    if (data.code !== 0) {
      uni.showToast({
        title: data.message || '请求失败',
        icon: 'none'
      })
      return Promise.reject(data)
    }
    return data.data
  } else {
    uni.showToast({
      title: `请求失败: ${response.statusCode}`,
      icon: 'none'
    })
    return Promise.reject(response)
  }
}

// 请求方法
const request = (options) => {
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
        responseInterceptor(res).then(resolve).catch(reject)
      },
      fail: (err) => {
        uni.hideLoading()
        uni.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      }
    })
  })
}

export default {
  get(url, data, options = {}) {
    return request({ url, method: 'GET', data, ...options })
  },
  
  post(url, data, options = {}) {
    return request({ url, method: 'POST', data, ...options })
  }
}
```

**追问点**：
- 如何处理请求超时？
- 如何实现请求重试？
- 如何处理并发请求？

---

## 分包加载

### Q9: uni-app 的分包加载如何配置？

**核心答案**：

分包加载可以优化小程序的启动速度，减少首屏加载时间。

**代码示例**：

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
  
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pagesA"]
    }
  }
}
```

**App 端分包优化**：

```json
// manifest.json
{
  "app-plus": {
    "optimization": {
      "subPackages": true
    },
    "runmode": "liberate"
  }
}
```

**追问点**：
- 分包的大小限制？
- 如何优化分包大小？
- 预下载的时机？

---

## 性能优化

### Q10: uni-app 的性能优化策略有哪些？

**核心答案**：

uni-app 性能优化可以从以下几个方面入手：

1. **首屏优化**：分包、骨架屏、图片懒加载
2. **长列表优化**：虚拟列表、分页加载
3. **图片优化**：压缩、WebP、CDN
4. **代码优化**：避免复杂计算、使用 nvue

**代码示例**：

```vue
<!-- 1. 骨架屏 -->
<template>
  <view>
    <view v-if="loading" class="skeleton">
      <view class="skeleton-item"></view>
    </view>
    <view v-else>
      <!-- 实际内容 -->
    </view>
  </view>
</template>

<!-- 2. 图片懒加载 -->
<image :src="item.image" lazy-load mode="aspectFill" />

<!-- 3. 分页加载 -->
<script>
export default {
  data() {
    return {
      list: [],
      page: 1,
      loading: false,
      hasMore: true
    }
  },
  
  onReachBottom() {
    if (!this.hasMore || this.loading) return
    this.loadMore()
  },
  
  async loadMore() {
    this.loading = true
    const res = await uni.request({
      url: '/api/list',
      data: { page: this.page, pageSize: 20 }
    })
    this.list = [...this.list, ...res.data.list]
    this.page++
    this.hasMore = res.data.hasMore
    this.loading = false
  }
}
</script>
```

**追问点**：
- nvue 的使用场景？
- 如何监控性能？
- 如何优化包体积？

---

## 面试技巧

### 回答策略

1. **先说核心概念**：简明扼要地说明是什么
2. **再说工作原理**：解释为什么这样设计
3. **举代码示例**：用实际代码说明用法
4. **说优化方案**：展示你的实战经验
5. **提出追问点**：引导面试官提问你擅长的领域

### 加分项

1. **跨端开发经验**：多平台适配、条件编译
2. **性能优化经验**：首屏优化、长列表优化
3. **工程化实践**：组件化、模块化、自动化
4. **问题排查能力**：调试技巧、性能监控

---

> 本文档包含 10 道精选面试题，涵盖 uni-app 的核心知识点和实战场景。每题都包含核心答案、代码示例和追问点，帮助你全面掌握 uni-app 开发。
