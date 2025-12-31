# Uniapp 面试题集

> Uniapp 跨端开发核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. Uniapp 是什么？有什么优势？

**定义：**
Uniapp 是一个使用 Vue.js 开发所有前端应用的框架，开发者编写一套代码，可发布到 iOS、Android、Web、以及各种小程序平台。

**核心优势：**
| 优势 | 说明 |
|------|------|
| 跨平台 | 一套代码，多端发布 |
| 基于 Vue | 学习成本低，生态丰富 |
| 丰富的组件库 | 内置组件 + uni-ui |
| 条件编译 | 针对不同平台编写特定代码 |
| 原生能力 | 支持调用原生 API 和插件 |

---

#### 2. Uniapp 的生命周期

**应用生命周期 (App.vue)**
```javascript
export default {
  onLaunch() {
    console.log('应用初始化')
  },
  onShow() {
    console.log('应用显示（从后台进入前台）')
  },
  onHide() {
    console.log('应用隐藏（从前台进入后台）')
  },
  onError(err) {
    console.log('应用错误', err)
  }
}
```

**页面生命周期**
```javascript
export default {
  onLoad(options) {
    console.log('页面加载', options)
  },
  onShow() {
    console.log('页面显示')
  },
  onReady() {
    console.log('页面初次渲染完成')
  },
  onHide() {
    console.log('页面隐藏')
  },
  onUnload() {
    console.log('页面卸载')
  },
  onPullDownRefresh() {
    console.log('下拉刷新')
  },
  onReachBottom() {
    console.log('触底加载')
  },
  onShareAppMessage() {
    return { title: '分享标题', path: '/pages/index/index' }
  }
}
```

**组件生命周期（同 Vue）**
```javascript
export default {
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {}
}
```

---

#### 3. 条件编译

```vue
<template>
  <!-- #ifdef H5 -->
  <div>仅在 H5 平台显示</div>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN -->
  <view>仅在微信小程序显示</view>
  <!-- #endif -->

  <!-- #ifndef APP-PLUS -->
  <view>除 App 外都显示</view>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN || MP-ALIPAY -->
  <view>微信或支付宝小程序显示</view>
  <!-- #endif -->
</template>

<script>
export default {
  methods: {
    getPlatformInfo() {
      // #ifdef H5
      console.log('H5 平台')
      // #endif

      // #ifdef APP-PLUS
      console.log('App 平台')
      // #endif
    }
  }
}
</script>

<style>
/* #ifdef H5 */
.container { padding: 20px; }
/* #endif */

/* #ifdef MP-WEIXIN */
.container { padding: 10px; }
/* #endif */
</style>
```

**平台标识：**
| 标识 | 平台 |
|------|------|
| H5 | Web |
| APP-PLUS | App（包含 nvue） |
| APP-NVUE | App nvue |
| MP-WEIXIN | 微信小程序 |
| MP-ALIPAY | 支付宝小程序 |
| MP-BAIDU | 百度小程序 |
| MP-TOUTIAO | 字节跳动小程序 |

---

#### 4. 页面通信方式

```javascript
// 1. URL 参数传递
uni.navigateTo({
  url: '/pages/detail/detail?id=1&name=test'
})

// 接收
onLoad(options) {
  console.log(options.id, options.name)
}

// 2. EventChannel (页面间通信)
uni.navigateTo({
  url: '/pages/detail/detail',
  success(res) {
    res.eventChannel.emit('acceptDataFromOpener', { data: 'test' })
  }
})

// 接收页
onLoad() {
  const eventChannel = this.getOpenerEventChannel()
  eventChannel.on('acceptDataFromOpener', (data) => {
    console.log(data)
  })
}

// 3. 全局事件
// 发送
uni.$emit('updateData', { data: 'test' })

// 监听
uni.$on('updateData', (data) => {
  console.log(data)
})

// 移除监听
uni.$off('updateData')

// 4. Vuex/Pinia 全局状态
// 5. 本地存储
uni.setStorageSync('key', 'value')
uni.getStorageSync('key')
```

---

#### 5. 网络请求封装

```javascript
// utils/request.js
const BASE_URL = 'https://api.example.com'

const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.showLoading({ title: '加载中' })

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': uni.getStorageSync('token') || ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            uni.showToast({ title: res.data.message, icon: 'none' })
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.navigateTo({ url: '/pages/login/login' })
          reject(res)
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      },
      complete: () => {
        uni.hideLoading()
      }
    })
  })
}

export const get = (url, data) => request({ url, method: 'GET', data })
export const post = (url, data) => request({ url, method: 'POST', data })

export default request
```

---

### 进阶题

#### 1. nvue 与 vue 的区别

| 特性 | vue 页面 | nvue 页面 |
|------|---------|----------|
| 渲染引擎 | Webview | Weex 原生渲染 |
| 性能 | 一般 | 更高 |
| CSS 支持 | 完整 | 有限（Flexbox 为主） |
| 组件支持 | 完整 | 部分组件不支持 |
| 适用场景 | 普通页面 | 长列表、高性能需求页面 |

```vue
<!-- nvue 页面 -->
<template>
  <!-- nvue 不支持 div，使用 view -->
  <view class="container">
    <!-- 列表使用 list + cell -->
    <list>
      <cell v-for="item in list" :key="item.id">
        <text>{{ item.name }}</text>
      </cell>
    </list>
  </view>
</template>

<style>
/* nvue 只支持 Flexbox 布局 */
.container {
  flex: 1;
  flex-direction: column;
}
/* nvue 不支持简写，需要完整写法 */
/* 不支持: margin: 10px; */
/* 需要: margin-top: 10px; margin-right: 10px; ... */
</style>
```

---

#### 2. 性能优化策略

```javascript
// 1. 长列表优化
<scroll-view
  scroll-y
  :scroll-into-view="scrollIntoView"
  @scrolltolower="loadMore"
>
  <!-- 使用虚拟列表组件 -->
</scroll-view>

// 2. 图片优化
<image
  :src="imageUrl"
  mode="aspectFill"
  lazy-load
/>

// 3. 分包加载 (manifest.json)
{
  "subPackages": [
    {
      "root": "pages/sub",
      "pages": [
        { "path": "page1/page1" }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages/sub"]
    }
  }
}

// 4. 骨架屏
<template>
  <skeleton v-if="loading" />
  <view v-else>{{ content }}</view>
</template>

// 5. 避免频繁 setData
// 错误
for (let i = 0; i < 100; i++) {
  this.list.push(item)
}

// 正确
const tempList = []
for (let i = 0; i < 100; i++) {
  tempList.push(item)
}
this.list = [...this.list, ...tempList]
```

---

## B. 实战文档

### 速查链接

| 资源 | 链接 |
|------|------|
| Uniapp 官方文档 | https://uniapp.dcloud.net.cn/ |
| uni-ui 组件库 | https://uniapp.dcloud.net.cn/component/uniui/uni-ui.html |
| 插件市场 | https://ext.dcloud.net.cn/ |

### 常用 API 速查

```javascript
// 路由
uni.navigateTo({ url: '/pages/detail/detail' })
uni.redirectTo({ url: '/pages/index/index' })
uni.reLaunch({ url: '/pages/index/index' })
uni.switchTab({ url: '/pages/home/home' })
uni.navigateBack({ delta: 1 })

// 存储
uni.setStorageSync('key', value)
uni.getStorageSync('key')
uni.removeStorageSync('key')
uni.clearStorageSync()

// 交互
uni.showToast({ title: '成功', icon: 'success' })
uni.showLoading({ title: '加载中' })
uni.hideLoading()
uni.showModal({ title: '提示', content: '确认删除?' })
uni.showActionSheet({ itemList: ['选项1', '选项2'] })

// 网络
uni.request({ url, method, data, success, fail })
uni.uploadFile({ url, filePath, name, success })
uni.downloadFile({ url, success })

// 设备
uni.getSystemInfoSync()
uni.getNetworkType({ success(res) { console.log(res.networkType) } })
uni.makePhoneCall({ phoneNumber: '10086' })
uni.scanCode({ success(res) { console.log(res.result) } })

// 位置
uni.getLocation({ type: 'gcj02', success(res) { } })
uni.openLocation({ latitude, longitude, name, address })
uni.chooseLocation({ success(res) { } })

// 媒体
uni.chooseImage({ count: 9, success(res) { } })
uni.previewImage({ urls: [], current: 0 })
uni.chooseVideo({ success(res) { } })
```
