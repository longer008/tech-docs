# 微信小程序面试题集

> 微信小程序核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. 小程序的双线程架构

```
┌─────────────────────────────────────────────────┐
│                  Native (微信客户端)              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐      ┌─────────────────────┐  │
│  │  View 线程   │      │    Logic 线程       │  │
│  │  (Webview)  │      │    (JsCore)        │  │
│  │             │      │                     │  │
│  │  - WXML    │←────→│  - App Service     │  │
│  │  - WXSS    │ 通信  │  - JavaScript      │  │
│  │  - 渲染    │      │  - 数据处理         │  │
│  └─────────────┘      └─────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**特点：**
- **渲染层**：使用 Webview 渲染，可以有多个（每个页面一个）
- **逻辑层**：使用 JsCore 运行 JavaScript，只有一个
- **通信**：两线程通过 Native 层进行通信（WeixinJSBridge）

**优势：**
1. 渲染和逻辑分离，避免 JS 阻塞渲染
2. 安全性高，JS 无法直接操作 DOM
3. 多 Webview 保证页面切换流畅

**劣势：**
1. 通信有延迟（setData 性能问题）
2. 不能灵活操作 DOM

---

#### 2. 小程序生命周期

**App 生命周期 (app.js)**
```javascript
App({
  onLaunch(options) {
    // 小程序初始化（全局只触发一次）
    console.log('场景值:', options.scene)
    console.log('启动参数:', options.query)
  },
  onShow(options) {
    // 小程序显示（从后台进入前台）
  },
  onHide() {
    // 小程序隐藏（从前台进入后台）
  },
  onError(msg) {
    // 错误监听
  },
  onPageNotFound(res) {
    // 页面不存在
    wx.redirectTo({ url: '/pages/index/index' })
  }
})
```

**Page 生命周期**
```javascript
Page({
  onLoad(options) {
    // 页面加载（只触发一次）
  },
  onShow() {
    // 页面显示
  },
  onReady() {
    // 页面初次渲染完成
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面卸载
  },
  // 页面事件
  onPullDownRefresh() {
    // 下拉刷新
    wx.stopPullDownRefresh()
  },
  onReachBottom() {
    // 触底加载
  },
  onShareAppMessage() {
    return { title: '分享标题', path: '/pages/index/index' }
  },
  onPageScroll(e) {
    // 页面滚动
    console.log(e.scrollTop)
  }
})
```

**组件生命周期**
```javascript
Component({
  lifetimes: {
    created() {
      // 组件实例创建（不能调用 setData）
    },
    attached() {
      // 组件进入页面节点树
    },
    ready() {
      // 组件渲染完成
    },
    detached() {
      // 组件离开页面节点树
    }
  },
  pageLifetimes: {
    show() {
      // 所在页面显示
    },
    hide() {
      // 所在页面隐藏
    }
  }
})
```

---

#### 3. 数据绑定与事件

```html
<!-- WXML 数据绑定 -->
<view>{{ message }}</view>
<view hidden="{{ isHidden }}">条件显示</view>
<view class="item {{ active ? 'active' : '' }}">动态类名</view>
<view style="color: {{ color }}">动态样式</view>

<!-- 列表渲染 -->
<view wx:for="{{ list }}" wx:key="id" wx:for-item="item" wx:for-index="idx">
  {{ idx }}: {{ item.name }}
</view>

<!-- 条件渲染 -->
<view wx:if="{{ type === 1 }}">类型1</view>
<view wx:elif="{{ type === 2 }}">类型2</view>
<view wx:else>其他</view>

<!-- block 不会渲染为节点 -->
<block wx:for="{{ list }}" wx:key="id">
  <view>{{ item.name }}</view>
</block>

<!-- 事件绑定 -->
<button bindtap="handleTap">点击（冒泡）</button>
<button catchtap="handleTap">点击（不冒泡）</button>
<button bind:tap="handleTap">点击（推荐写法）</button>

<!-- 传参 -->
<button data-id="{{ item.id }}" data-name="{{ item.name }}" bindtap="handleTap">
  点击
</button>
```

```javascript
Page({
  data: {
    message: 'Hello',
    list: [],
    isHidden: false
  },

  handleTap(e) {
    // 获取传参
    const { id, name } = e.currentTarget.dataset
    console.log(id, name)

    // 修改数据
    this.setData({
      message: 'World',
      'list[0].name': 'new name', // 路径更新
      ['list[' + index + '].name']: 'new name' // 动态路径
    }, () => {
      // 回调：数据更新完成
    })
  }
})
```

---

#### 4. 页面通信方式

```javascript
// 1. URL 参数
wx.navigateTo({
  url: '/pages/detail/detail?id=1&name=test'
})

// 接收
onLoad(options) {
  console.log(options.id) // "1"
}

// 2. EventChannel (wx.navigateTo)
wx.navigateTo({
  url: '/pages/detail/detail',
  events: {
    // 监听被打开页面发送的事件
    acceptDataFromOpenedPage(data) {
      console.log(data)
    }
  },
  success(res) {
    // 向被打开页面发送数据
    res.eventChannel.emit('acceptDataFromOpener', { data: 'test' })
  }
})

// 被打开页面
onLoad() {
  const eventChannel = this.getOpenerEventChannel()
  eventChannel.on('acceptDataFromOpener', (data) => {
    console.log(data)
  })
  // 向发送方发送数据
  eventChannel.emit('acceptDataFromOpenedPage', { data: 'reply' })
}

// 3. 全局变量
// app.js
App({
  globalData: {
    userInfo: null
  }
})

// 使用
const app = getApp()
app.globalData.userInfo = { name: 'test' }

// 4. 本地存储
wx.setStorageSync('key', value)
wx.getStorageSync('key')

// 5. 页面栈获取
const pages = getCurrentPages()
const prevPage = pages[pages.length - 2]
prevPage.setData({ needRefresh: true })
```

---

#### 5. 自定义组件

```javascript
// components/my-component/my-component.js
Component({
  // 组件选项
  options: {
    multipleSlots: true, // 启用多 slot
    styleIsolation: 'isolated' // 样式隔离
  },

  // 外部类
  externalClasses: ['custom-class'],

  // 属性
  properties: {
    title: {
      type: String,
      value: '默认标题',
      observer(newVal, oldVal) {
        console.log('title changed', newVal)
      }
    },
    list: {
      type: Array,
      value: []
    }
  },

  // 内部数据
  data: {
    innerData: ''
  },

  // 生命周期
  lifetimes: {
    attached() {
      this.initData()
    }
  },

  // 方法
  methods: {
    initData() {
      this.setData({ innerData: 'init' })
    },
    handleTap() {
      // 触发自定义事件
      this.triggerEvent('customEvent', { value: 'data' }, {
        bubbles: true, // 是否冒泡
        composed: true // 是否穿越组件边界
      })
    }
  },

  // 监听器
  observers: {
    'list': function(list) {
      console.log('list changed', list)
    },
    'list.**': function(list) {
      // 深度监听
    }
  }
})
```

```html
<!-- 使用组件 -->
<my-component
  title="自定义标题"
  list="{{ list }}"
  custom-class="my-class"
  bind:customEvent="onCustomEvent"
>
  <view slot="header">Header</view>
  <view slot="footer">Footer</view>
</my-component>
```

---

### 进阶题

#### 1. setData 性能优化

```javascript
// 问题：setData 是同步的，数据过大会阻塞
// 数据从逻辑层传到渲染层需要序列化和反序列化

// 优化策略：

// 1. 减少 setData 调用频率
// 错误
for (let i = 0; i < 100; i++) {
  this.setData({ [`list[${i}]`]: data[i] })
}

// 正确
this.setData({ list: data })

// 2. 避免传输不必要的数据
// 错误
this.setData({ allData: hugeObject })

// 正确
this.setData({
  displayName: hugeObject.name,
  displayAge: hugeObject.age
})

// 3. 使用路径更新
// 只更新需要变化的部分
this.setData({
  'list[0].checked': true
})

// 4. 分批处理长列表
const BATCH_SIZE = 20
function loadBatch(start) {
  const batch = data.slice(start, start + BATCH_SIZE)
  this.setData({
    list: [...this.data.list, ...batch]
  }, () => {
    if (start + BATCH_SIZE < data.length) {
      setTimeout(() => loadBatch(start + BATCH_SIZE), 50)
    }
  })
}

// 5. 使用自定义组件拆分
// 将长列表项封装为组件，减少单次 setData 的数据量
```

---

#### 2. 小程序登录流程

```javascript
// 完整登录流程
async function login() {
  try {
    // 1. 调用 wx.login 获取 code
    const { code } = await wx.login()

    // 2. 发送 code 到后端
    const { token, userInfo } = await request({
      url: '/api/login',
      method: 'POST',
      data: { code }
    })

    // 3. 保存 token
    wx.setStorageSync('token', token)

    // 4. 获取用户信息（需要用户授权）
    // 注意：getUserProfile 需要点击触发
    return { token, userInfo }
  } catch (err) {
    console.error('登录失败', err)
  }
}

// 后端流程
// 1. 用 code 换取 openid 和 session_key
// 2. 自定义登录态（生成 token）
// 3. 返回 token 给前端
```

```
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│  小程序  │      │  后端   │      │微信服务器│      │  用户   │
└────┬────┘      └────┬────┘      └────┬────┘      └────┬────┘
     │                │                │                │
     │  wx.login()    │                │                │
     │───────────────→│                │                │
     │      code      │                │                │
     │←───────────────│                │                │
     │                │                │                │
     │  发送 code     │                │                │
     │───────────────→│                │                │
     │                │   code+appid   │                │
     │                │───────────────→│                │
     │                │    openid      │                │
     │                │←───────────────│                │
     │    token       │                │                │
     │←───────────────│                │                │
     │                │                │                │
```

---

## B. 实战文档

### 速查链接

| 资源 | 链接 |
|------|------|
| 官方文档 | https://developers.weixin.qq.com/miniprogram/dev/ |
| WeUI 组件库 | https://developers.weixin.qq.com/miniprogram/dev/extended/weui/ |

### 项目结构

```
├── app.js              # 小程序入口
├── app.json            # 全局配置
├── app.wxss            # 全局样式
├── project.config.json # 项目配置
├── sitemap.json        # 搜索配置
├── pages/              # 页面
│   └── index/
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
├── components/         # 组件
├── utils/              # 工具函数
└── assets/             # 静态资源
```

### 常用 API

```javascript
// 路由
wx.navigateTo({ url: '/pages/detail/detail' })
wx.redirectTo({ url: '/pages/index/index' })
wx.reLaunch({ url: '/pages/index/index' })
wx.switchTab({ url: '/pages/home/home' })
wx.navigateBack({ delta: 1 })

// 网络
wx.request({ url, method, data, success, fail })
wx.uploadFile({ url, filePath, name, success })
wx.downloadFile({ url, success })

// 存储
wx.setStorageSync('key', value)
wx.getStorageSync('key')
wx.removeStorageSync('key')

// 交互
wx.showToast({ title: '成功', icon: 'success' })
wx.showLoading({ title: '加载中' })
wx.hideLoading()
wx.showModal({ title: '提示', content: '确认?' })
wx.showActionSheet({ itemList: ['选项1', '选项2'] })

// 设备
wx.getSystemInfoSync()
wx.makePhoneCall({ phoneNumber: '10086' })
wx.scanCode({ success(res) { } })
wx.getLocation({ type: 'gcj02', success(res) { } })
```
