# 微信小程序面试题库

> 更新时间：2025-02

## 目录导航

- [基础概念](#基础概念)
- [架构与原理](#架构与原理)
- [生命周期](#生命周期)
- [组件化开发](#组件化开发)
- [路由与导航](#路由与导航)
- [数据绑定与更新](#数据绑定与更新)
- [分包加载](#分包加载)
- [云开发](#云开发)
- [登录授权](#登录授权)
- [性能优化](#性能优化)
- [实战场景](#实战场景)

## 基础概念

### Q1: 微信小程序的核心特点是什么？

**核心答案**：

微信小程序是一种不需要下载安装即可使用的应用，具有以下核心特点：

1. **无需安装**：扫码或搜索即可打开
2. **体验流畅**：接近原生 App 的体验
3. **开发成本低**：一套代码多端运行
4. **依托微信生态**：10亿+ 用户基础

**代码示例**：

```javascript
// app.js - 小程序入口文件
App({
  onLaunch(options) {
    console.log('小程序启动', options);
    // 场景值：扫码、分享、搜索等
    console.log('场景值', options.scene);
  },
  
  globalData: {
    userInfo: null
  }
});
```

**追问点**：
- 小程序与 H5 的区别？
- 小程序与原生 App 的区别？
- 小程序的应用场景？

---

### Q2: 小程序的技术栈是什么？

**核心答案**：

小程序使用类 Web 技术栈，但不是标准的 Web 技术：

1. **视图层**：WXML（类似 HTML）+ WXSS（类似 CSS）
2. **逻辑层**：JavaScript（基于 V8 引擎）
3. **配置**：JSON 配置文件
4. **云服务**：云开发（可选）

**代码示例**：

```xml
<!-- index.wxml - 视图层 -->
<view class="container">
  <text>{{message}}</text>
  <button bindtap="handleTap">点击</button>
</view>
```

```css
/* index.wxss - 样式层 */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
}
```

```javascript
// i

┌─────────────────┐         ┌─────────────────┐
│   视图层 View    │         │  逻辑层 Logic   │
│   (WebView)     │ <─────> │  (JSCore)       │
│   WXML + WXSS   │ JSBridge│  JavaScript     │
└─────────────────┘         └─────────────────┘
         │                           │
         └───────────┬───────────────┘
                     │
              ┌──────▼──────┐
              │  Native API  │
              │  微信客户端   │
              └─────────────┘
```

**代码示例**：

```javascript
// 逻辑层代码
Page({
  data: {
    message: 'Hello'
  },
  
  updateMessage() {
    // setData 会触发跨线程通信
    this.setData({
      message: 'World'
    });
    // 数据需要序列化传递到视图层
  }
});
```

**追问点**：
- 为什么要采用双线程架构？
- JSBridge 的工作原理？
- setData 的性能影响？

---

### Q4: setData 的工作原理和性能影响？

**核心答案**：

setData 是小程序更新视图的唯一方法，工作流程：

1. **逻辑层**：调用 setData，数据序列化
2. **JSBridge**：跨线程传输数据
3. **视图层**：接收数据，反序列化，更新 DOM

**性能影响**：
- 数据需要序列化和反序列化
- 跨线程通信有开销
- 频繁调用会导致卡顿

**代码示例**：

```javascript
Page({
  data: {
    list: [],
    user: { name: 'Tom', age: 20 }
  },

  // ❌ 不好的做法
  badPractice() {
    // 1. 更新整个大对象
    this.setData({
      user: {
        name: 'Tom',
        age: 20,
        address: '...',
        // ... 大量数据
      }
    });
    
    // 2. 频繁调用
    for (let i = 0; i < 100; i++) {
      this.setData({
        [`list[${i}]`]: i
      });
    }
  },

  // ✅ 好的做法
  goodPractice() {
    // 1. 只更新变化的字段
    this.setData({
      'user.name': 'Jerry'
    });
    
    // 2. 批量更新
    const updates = {};
    for (let i = 0; i < 100; i++) {
      updates[`list[${i}]`] = i;
    }
    this.setData(updates);
    
    // 3. 使用纯数据字段
    this.setData({
      renderData: data,  // 参与渲染
      _cacheData: cache  // 不参与渲染（需配置 pureDataPattern）
    });
  }
});
```

**优化建议**：

```javascript
Component({
  options: {
    // 配置纯数据字段
    pureDataPattern: /^_/
  },
  
  data: {
    renderData: [],  // 参与渲染
    _cacheData: []   // 不参与渲染，但可在 JS 中使用
  },
  
  // 使用节流
  onPageScroll: throttle(function(e) {
    this.setData({
      scrollTop: e.scrollTop
    });
  }, 100)
});

// 节流函数
function throttle(fn, delay) {
  let timer = null;
  return function(...args) {
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}
```

**追问点**：
- setData 的数据大小限制？
- 如何监控 setData 性能？
- 有没有其他更新视图的方法？

---

## 生命周期

### Q5: 小程序的生命周期有哪些？

**核心答案**：

小程序有三个层级的生命周期：

1. **App 生命周期**：管理整个小程序
2. **Page 生命周期**：管理单个页面
3. **Component 生命周期**：管理自定义组件

**代码示例**：

```javascript
// 1. App 生命周期
App({
  onLaunch(options) {
    // 小程序初始化完成（全局只触发一次）
    console.log('小程序启动', options.scene);
  },
  
  onShow(options) {
    // 小程序启动或从后台进入前台
    console.log('小程序显示');
  },
  
  onHide() {
    // 小程序从前台进入后台
    console.log('小程序隐藏');
  },
  
  onError(msg) {
    // 小程序发生错误
    console.error('小程序错误', msg);
  }
});

// 2. Page 生命周期
Page({
  onLoad(options) {
    // 页面加载（只调用一次）
    console.log('页面加载', options);
    // 适合：初始化数据、接收参数
  },
  
  onShow() {
    // 页面显示（每次打开都调用）
    console.log('页面显示');
    // 适合：刷新数据、恢复状态
  },
  
  onReady() {
    // 页面初次渲染完成（只调用一次）
    console.log('页面渲染完成');
    // 适合：获取节点信息、设置导航栏
  },
  
  onHide() {
    // 页面隐藏
    console.log('页面隐藏');
    // 适合：暂停任务、保存状态
  },
  
  onUnload() {
    // 页面卸载
    console.log('页面卸载');
    // 适合：清理资源、取消请求
  }
});

// 3. Component 生命周期
Component({
  lifetimes: {
    created() {
      // 组件实例创建（不能调用 setData）
      console.log('组件创建');
    },
    
    attached() {
      // 组件进入页面节点树
      console.log('组件附加');
      // 适合：初始化、数据请求
    },
    
    ready() {
      // 组件布局完成
      console.log('组件渲染完成');
      // 适合：获取节点信息
    },
    
    detached() {
      // 组件离开页面节点树
      console.log('组件销毁');
      // 适合：清理资源
    }
  }
});
```

**生命周期执行顺序**：

```
App: onLaunch → onShow
  ↓
Page: onLoad → onShow → onReady
  ↓
Component: created → attached → ready
  ↓
用户操作...
  ↓
Page: onHide → onUnload
Component: detached
```

**追问点**：
- onLoad 和 onShow 的区别？
- 什么时候使用 onReady？
- 组件的 pageLifetimes 是什么？

---


## 组件化开发

### Q6: 小程序的组件通信方式有哪些？

**核心答案**：

小程序组件通信有 4 种主要方式：

1. **Properties（父传子）**：通过属性传递数据
2. **Events（子传父）**：通过事件传递数据
3. **selectComponent（获取组件实例）**：直接调用组件方法
4. **Behaviors（代码复用）**：类似 Mixins

**代码示例**：

```javascript
// 1. Properties - 父传子
// 子组件
Component({
  properties: {
    title: String,
    count: {
      type: Number,
      value: 0,
      observer(newVal, oldVal) {
        console.log('count 变化', newVal, oldVal);
      }
    }
  }
});
```

```xml
<!-- 父组件 -->
<custom-component title="标题" count="{{count}}" />
```

```javascript
// 2. Events - 子传父
// 子组件
Component({
  methods: {
    handleTap() {
      this.triggerEvent('myevent', { value: 'data' }, {
        bubbles: true,    // 是否冒泡
        composed: true,   // 是否穿越组件边界
        capturePhase: false  // 是否有捕获阶段
      });
    }
  }
});
```

```xml
<!-- 父组件 -->
<custom-component bind:myevent="handleEvent" />
```

```javascript
// 父组件
Page({
  handleEvent(e) {
    console.log(e.detail); // { value: 'data' }
  }
});
```

```javascript
// 3. selectComponent - 获取组件实例
Page({
  onReady() {
    const custom = this.selectComponent('.c
法
});
```

**追问点**：
- 如何实现兄弟组件通信？
- 如何实现跨层级组件通信？
- externalClasses 的作用？

---

### Q7: 小程序的插槽（Slot）如何使用？

**核心答案**：

小程序支持单个插槽和多个插槽（具名插槽）。

**代码示例**：

```javascript
// 1. 单个插槽
// 组件 JS
Component({
  // 默认支持单个插槽
});
```

```xml
<!-- 组件模板 -->
<view class="wrapper">
  <view class="header">头部</view>
  <slot></slot>
  <view class="footer">底部</view>
</view>
```

```xml
<!-- 使用组件 -->
<custom-component>
  <text>这是插槽内容</text>
</custom-component>
```

```javascript
// 2. 多个插槽（具名插槽）
// 组件 JS
Component({
  options: {
    multipleSlots: true  // 启用多插槽支持
  }
});
```

```xml
<!-- 组件模板 -->
<view class="wrapper">
  <view class="header">
    <slot name="header"></slot>
  </view>
  <view class="content">
    <slot></slot>  <!-- 默认插槽 -->
  </view>
  <view class="footer">
    <slot name="footer"></slot>
  </view>
</view>
```

```xml
<!-- 使用组件 -->
<custom-component>
  <view slot="header">自定义头部</view>
  <view>默认内容</view>
  <view slot="footer">自定义底部</view>
</custom-component>
```

**追问点**：
- 插槽的作用域是什么？
- 如何实现作用域插槽？
- 插槽的性能影响？

---

## 路由与导航

### Q8: 小程序的路由 API 有哪些？各有什么区别？

**核心答案**：

小程序有 5 个路由 API，区别在于页面栈的处理方式：

| API | 说明 | 页面栈变化 | 使用场景 |
|-----|------|-----------|---------|
| navigateTo | 保留当前页面，跳转到新页面 | [A] → [A, B] | 普通跳转 |
| redirectTo | 关闭当前页面，跳转到新页面 | [A] → [B] | 结果页、无需返回 |
| navigateBack | 返回上一页或多级页面 | [A, B, C] → [A, B] | 返回 |
| switchTab | 跳转到 tabBar 页面 | [A, B] → [Tab] | 切换 Tab |
| reLaunch | 关闭所有页面，打开新页面 | [A, B, C] → [D] | 重启、登录后 |

**代码示例**：

```javascript
// 1. navigateTo - 保留当前页面
wx.navigateTo({
  url: '/pages/detail/detail?id=123',
  success: (res) => {
    // 通过 eventChannel 向被打开页面传送数据
    res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' });
  }
});
// 页面栈：[首页, 详情页]
// 限制：最多 10 层

// 2. redirectTo - 关闭当前页面
wx.redirectTo({
  url: '/pages/result/result'
});
// 页面栈：[结果页]（首页被关闭）
// 适合：支付结果、提交结果等无需返回的页面

// 3. navigateBack - 返回
wx.navigateBack({
  delta: 1  // 返回的页面数，默认 1
});
// 页面栈：[首页, 列表页, 详情页] → [首页, 列表页]

// 4. switchTab - 跳转到 tabBar 页面
wx.switchTab({
  url: '/pages/index/index'
});
// 会关闭所有非 tabBar 页面
// 注意：不能带参数

// 5. reLaunch - 关闭所有页面
wx.reLaunch({
  url: '/pages/index/index?reset=1'
});
// 页面栈：[首页]（所有页面被关闭）
// 适合：登录后跳转、重启应用
```

**页面间传参**：

```javascript
// 1. URL 传参
wx.navigateTo({
  url: '/pages/detail/detail?id=123&name=test'
});

// 接收参数
Page({
  onLoad(options) {
    console.log(options.id);   // '123'
    console.log(options.name); // 'test'
  }
});

// 2. EventChannel 传参
wx.navigateTo({
  url: '/pages/detail/detail',
  success: (res) => {
    res.eventChannel.emit('acceptDataFromOpenerPage', {
      data: { id: 123, name: 'test' }
    });
  }
});

// 接收数据
Page({
  onLoad() {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOpenerPage', (data) => {
      console.log(data);
    });
  }
});
```

**追问点**：
- 页面栈溢出怎么办？
- 如何实现页面返回时刷新？
- tabBar 页面如何传参？

---

## 数据绑定与更新

### Q9: 小程序的数据监听器（Observers）如何使用？

**核心答案**：

Observers 用于监听数据变化，类似 Vue 的 watch。

**代码示例**：

```javascript
Component({
  data: {
    count: 0,
    user: {
      name: 'Tom',
      age: 20
    },
    list: [1, 2, 3]
  },

  observers: {
    // 1. 监听单个字段
    'count': function(newVal) {
      console.log('count 变化', newVal);
    },

    // 2. 监听多个字段
    'count, user.name': function(count, name) {
      console.log('count 或 name 变化', count, name);
    },

    // 3. 监听对象的所有属性
    'user.**': function(user) {
      console.log('user 的任意属性变化', user);
      // user.name 或 user.age 变化都会触发
    },

    // 4. 监听数组变化
    'list': function(newList) {
      console.log('list 变化', newList);
    },

    // 5. 监听所有数据
    '**': function() {
      console.log('任意数据变化');
      // 任何 setData 都会触发
    }
  },

  methods: {
    updateData() {
      // 触发 observers
      this.setData({
        count: this.data.count + 1,
        'user.name': 'Jerry'
      });
    }
  }
});
```

**实战应用**：

```javascript
Component({
  properties: {
    userId: String
  },

  data: {
    userInfo: null
  },

  observers: {
    // 监听 userId 变化，自动加载用户信息
    'userId': function(userId) {
      if (userId) {
        this.loadUserInfo(userId);
      }
    }
  },

  methods: {
    loadUserInfo(userId) {
      wx.request({
        url: `/api/user/${userId}`,
        success: (res) => {
          this.setData({
            userInfo: res.data
          });
        }
      });
    }
  }
});
```

**追问点**：
- Observers 和 Properties 的 observer 有什么区别？
- Observers 的性能影响？
- 如何避免死循环？

---

## 分包加载

### Q10: 小程序的分包加载机制是什么？

**核心答案**：

分包加载可以优化小程序的启动速度，将代码分成多个包按需加载。

**分包类型**：
1. **普通分包**：需要时才加载，可以访问主包资源
2. **独立分包**：可以独立运行，不能访问主包资源
3. **分包预下载**：提前下载可能需要的分包

**代码示例**：

```json
// app.json
{
  "pages": [
    "pages/index/index",
    "pages/logs/logs"
  ],
  
  // 普通分包
  "subpackages": [
    {
      "root": "packageA",
      "name": "pack1",
      "pages": [
        "pages/cat/cat",
        "pages/dog/dog"
      ]
    },
    {
      "root": "packageB",
      "name": "pack2",
      "pages": [
        "pages/apple/apple"
      ],
      "independent": true  // 独立分包
    }
  ],
  
  // 分包预下载
  "preloadRule": {
    "pages/index/index": {
      "network": "all",      // all: 不限网络, wifi: 仅 WiFi
      "packages": ["pack1"]  // 预下载的分包
    }
  }
}
```

**目录结构**：

```
miniprogram/
├── app.js
├── app.json
├── pages/              # 主包页面
│   ├── index/
│   └── logs/
├── packageA/           # 分包 A
│   └── pages/
│       ├── cat/
│       └── dog/
└── packageB/           # 分包 B（独立分包）
    └── pages/
        └── apple/
```

**跳转到分包页面**：

```javascript
// 跳转到普通分包
wx.navigateTo({
  url: '/packageA/pages/cat/cat'
});

// 跳转到独立分包
wx.navigateTo({
  url: '/packageB/pages/apple/apple'
});
```

**分包大小限制**：
- 主包：≤ 2MB
- 单个分包：≤ 2MB
- 总包大小：≤ 20MB

**独立分包特点**：

```javascript
// 独立分包不能访问主包资源
// ❌ 不能引用主包的 JS
// const utils = require('../../utils/common.js');

// ❌ 不能使用主包的组件
// <custom-component />

// ✅ 可以有自己的 app.js
// packageB/app.js
App({
  onLaunch() {
    console.log('独立分包启动');
  }
});
```

**追问点**：
- 分包预下载的时机？
- 如何优化分包大小？
- 分包异步化是什么？

---

## 云开发

### Q11: 小程序云开发的核心能力有哪些？

**核心答案**：

云开发提供无需搭建服务器的后端能力：

1. **云函数**：在云端运行的代码
2. **云数据库**：JSON 数据库
3. **云存储**：文件存储
4. **云调用**：调用微信开放接口

**代码示例**：

```javascript
// 1. 初始化云开发
// app.js
App({
  onLaunch() {
    wx.cloud.init({
      env: 'your-env-id',  // 云开发环境 ID
      traceUser: true
    });
  }
});

// 2. 云函数
// cloudfunctions/getUser/index.js
const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  const { userId } = event;
  const db = cloud.database();
  
  // 查询用户
  const user = await db.collection('users')
    .doc(userId)
    .get();
  
  return {
    success: true,
    data: user.data
  };
};

// 调用云函数
wx.cloud.callFunction({
  name: 'getUser',
  data: { userId: '123' }
}).then(res => {
  console.log(res.result);
});

// 3. 云数据库
const db = wx.cloud.database();
const users = db.collection('users');

// 增
users.add({
  data: {
    name: 'Tom',
    age: 20
  }
});

// 删
users.doc('user-id').remove();

// 改
users.doc('user-id').update({
  data: { age: 21 }
});

// 查
users.where({
  age: _.gt(18)  // age > 18
}).get();

// 4. 云存储
// 上传文件
wx.cloud.uploadFile({
  cloudPath: 'images/avatar.png',
  filePath: tempFilePath
}).then(res => {
  console.log('文件 ID', res.fileID);
});

// 下载文件
wx.cloud.downloadFile({
  fileID: 'cloud://xxx.png'
}).then(res => {
  console.log('临时路径', res.tempFilePath);
});
```

**追问点**：
- 云函数的冷启动问题？
- 云数据库的权限控制？
- 云开发与自建后端的对比？

---


## 登录授权

### Q12: 小程序的登录流程是什么？

**核心答案**：

小程序登录流程分为 4 步：

1. **小程序端**：调用 wx.login 获取 code
2. **发送到后端**：将 code 发送到开发者服务器
3. **后端换取信息**：调用微信接口换取 openid 和 session_key
4. **返回登录态**：后端生成自定义登录态返回给小程序

**流程图**：

```
小程序端                    开发者服务器                微信服务器
   │                            │                          │
   │  1. wx.login()             │                          │
   ├──────────────────────────> │                          │
   │  2. 返回 code               │                          │
   │ <────────────────────────── │                          │
   │                            │                          │
   │  3. 发送 code              │                          │
   ├──────────────────────────> │                          │
   │                            │  4. code2Session         │
   │                            ├────────────────────────> │
   │                            │  5. openid, session_key  │
   │                            │ <──────────────────────── │
   │                            │                          │
   │  6. 返
en', token);
        
        // 5. 后续请求携带 token
        wx.request({
          url: 'https://api.example.com/user',
          header: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    });
  }
});
```

```javascript
// 后端处理（Node.js 示例）
const axios = require('axios');
const jwt = require('jsonwebtoken');

app.post('/login', async (req, res) => {
  const { code } = req.body;
  
  // 调用微信接口换取 openid 和 session_key
  const result = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    params: {
      appid: 'your-appid',
      secret: 'your-secret',
      js_code: code,
      grant_type: 'authorization_code'
    }
  });
  
  const { openid, session_key } = result.data;
  
  // 生成自定义登录态（JWT）
  const token = jwt.sign(
    { openid },
    'your-secret-key',
    { expiresIn: '7d' }
  );
  
  // 返回 token
  res.json({ token });
});
```

**追问点**：
- code 的有效期是多久？
- session_key 的作用是什么？
- 如何实现自动登录？

---

### Q13: 如何获取用户信息和手机号？

**核心答案**：

获取用户信息和手机号需要用户主动授权，通过 button 组件实现。

**代码示例**：

```xml
<!-- 1. 获取用户信息 -->
<button 
  open-type="getUserInfo" 
  bindgetuserinfo="getUserInfo"
>
  获取用户信息
</button>

<!-- 2. 获取手机号 -->
<button 
  open-type="getPhoneNumber" 
  bindgetphonenumber="getPhoneNumber"
>
  获取手机号
</button>
```

```javascript
Page({
  // 1. 获取用户信息
  getUserInfo(e) {
    if (e.detail.userInfo) {
      const userInfo = e.detail.userInfo;
      console.log('用户信息', userInfo);
      // userInfo: {
      //   nickName: '昵称',
      //   avatarUrl: '头像',
      //   gender: 1,  // 0: 未知, 1: 男, 2: 女
      //   country: '国家',
      //   province: '省份',
      //   city: '城市'
      // }
      
      // 保存用户信息
      this.setData({ userInfo });
      wx.setStorageSync('userInfo', userInfo);
    } else {
      console.log('用户拒绝授权');
    }
  },

  // 2. 获取手机号
  getPhoneNumber(e) {
    if (e.detail.code) {
      // 将 code 发送到后端解密
      wx.request({
        url: 'https://api.example.com/getPhone',
        method: 'POST',
        data: {
          code: e.detail.code
        },
        success: (res) => {
          const phoneNumber = res.data.phoneNumber;
          console.log('手机号', phoneNumber);
          this.setData({ phoneNumber });
        }
      });
    } else {
      console.log('用户拒绝授权');
    }
  }
});
```

```javascript
// 后端解密手机号（Node.js 示例）
const crypto = require('crypto');

app.post('/getPhone', async (req, res) => {
  const { code } = req.body;
  
  // 1. 调用微信接口获取手机号
  const result = await axios.post(
    `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`,
    { code }
  );
  
  const phoneInfo = result.data.phone_info;
  // phoneInfo: {
  //   phoneNumber: '手机号',
  //   purePhoneNumber: '纯手机号',
  //   countryCode: '国家码'
  // }
  
  res.json(phoneInfo);
});
```

**授权管理**：

```javascript
// 检查授权状态
wx.getSetting({
  success: (res) => {
    if (res.authSetting['scope.userInfo']) {
      // 已授权，直接获取用户信息
      wx.getUserInfo({
        success: (res) => {
          console.log(res.userInfo);
        }
      });
    } else {
      // 未授权，引导用户授权
      console.log('未授权');
    }
  }
});

// 打开设置页面
wx.openSetting({
  success: (res) => {
    console.log(res.authSetting);
    // {
    //   'scope.userInfo': true,
    //   'scope.userLocation': false
    // }
  }
});
```

**追问点**：
- 用户拒绝授权后如何处理？
- 如何实现静默授权？
- 授权信息如何存储？

---

## 性能优化

### Q14: 小程序的性能优化策略有哪些？

**核心答案**：

小程序性能优化可以从以下几个方面入手：

1. **首屏优化**：分包、骨架屏、图片懒加载
2. **setData 优化**：减少调用、批量更新、纯数据字段
3. **长列表优化**：虚拟列表、分页加载
4. **图片优化**：压缩、CDN、WebP
5. **代码优化**：避免复杂计算、使用 WXS

**代码示例**：

```javascript
// 1. 首屏优化 - 骨架屏
Page({
  data: {
    loading: true,
    list: []
  },
  
  onLoad() {
    this.loadData().then(() => {
      this.setData({ loading: false });
    });
  }
});
```

```xml
<!-- 骨架屏 -->
<view wx:if="{{loading}}" class="skeleton">
  <view class="skeleton-item"></view>
  <view class="skeleton-item"></view>
</view>

<!-- 实际内容 -->
<view wx:else>
  <view wx:for="{{list}}" wx:key="id">
    {{item.name}}
  </view>
</view>
```

```javascript
// 2. setData 优化
Page({
  data: {
    list: []
  },

  // ❌ 不好的做法
  badPractice() {
    // 频繁调用 setData
    for (let i = 0; i < 100; i++) {
      this.setData({
        [`list[${i}]`]: i
      });
    }
  },

  // ✅ 好的做法
  goodPractice() {
    // 批量更新
    const updates = {};
    for (let i = 0; i < 100; i++) {
      updates[`list[${i}]`] = i;
    }
    this.setData(updates);
  }
});
```

```javascript
// 3. 长列表优化 - 分页加载
Page({
  data: {
    list: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false
  },
  
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadMore();
  },
  
  loadMore() {
    this.setData({ loading: true });
    
    wx.request({
      url: '/api/list',
      data: {
        page: this.data.page,
        pageSize: this.data.pageSize
      },
      success: (res) => {
        this.setData({
          list: [...this.data.list, ...res.data.list],
          page: this.data.page + 1,
          hasMore: res.data.hasMore,
          loading: false
        });
      }
    });
  }
});
```

```javascript
// 4. 图片优化
// 压缩图片
wx.compressImage({
  src: tempFilePath,
  quality: 80,
  success: (res) => {
    console.log('压缩后', res.tempFilePath);
  }
});
```

```xml
<!-- 图片懒加载 -->
<image 
  src="{{item.image}}" 
  lazy-load="{{true}}"
  mode="aspectFill"
/>
```

```xml
<!-- 5. 使用 WXS 提升性能 -->
<wxs module="utils">
  var formatPrice = function(price) {
    return '¥' + price.toFixed(2);
  };
  
  module.exports = {
    formatPrice: formatPrice
  };
</wxs>

<view>{{utils.formatPrice(item.price)}}</view>
```

**追问点**：
- 如何监控小程序性能？
- 虚拟列表的实现原理？
- WXS 的使用场景？

---

## 实战场景

### Q15: 如何实现小程序的下拉刷新和上拉加载？

**核心答案**：

下拉刷新和上拉加载是常见的交互模式。

**代码示例**：

```json
// page.json - 配置下拉刷新
{
  "enablePullDownRefresh": true,
  "backgroundColor": "#f5f5f5",
  "backgroundTextStyle": "dark"
}
```

```javascript
Page({
  data: {
    list: [],
    page: 1,
    pageSize: 20,
    hasMore: true
  },

  onLoad() {
    this.loadData();
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    
    // 重置数据
    this.setData({
      list: [],
      page: 1,
      hasMore: true
    });
    
    // 加载数据
    this.loadData().then(() => {
      // 停止下拉刷新
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载
  onReachBottom() {
    console.log('上拉加载');
    
    if (!this.data.hasMore) {
      wx.showToast({
        title: '没有更多了',
        icon: 'none'
      });
      return;
    }
    
    this.loadMore();
  },

  // 加载数据
  loadData() {
    return new Promise((resolve) => {
      wx.showLoading({ title: '加载中' });
      
      wx.request({
        url: '/api/list',
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize
        },
        success: (res) => {
          this.setData({
            list: res.data.list,
            page: 2,
            hasMore: res.data.hasMore
          });
          resolve();
        },
        complete: () => {
          wx.hideLoading();
        }
      });
    });
  },

  // 加载更多
  loadMore() {
    wx.showLoading({ title: '加载中' });
    
    wx.request({
      url: '/api/list',
      data: {
        page: this.data.page,
        pageSize: this.data.pageSize
      },
      success: (res) => {
        this.setData({
          list: [...this.data.list, ...res.data.list],
          page: this.data.page + 1,
          hasMore: res.data.hasMore
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  }
});
```

**优化版本（防抖）**：

```javascript
Page({
  data: {
    list: [],
    page: 1,
    loading: false,
    hasMore: true
  },

  onReachBottom() {
    // 防止重复加载
    if (this.data.loading || !this.data.hasMore) {
      return;
    }
    
    this.loadMore();
  },

  loadMore() {
    this.setData({ loading: true });
    
    wx.request({
      url: '/api/list',
      data: {
        page: this.data.page,
        pageSize: 20
      },
      success: (res) => {
        this.setData({
          list: [...this.data.list, ...res.data.list],
          page: this.data.page + 1,
          hasMore: res.data.hasMore
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  }
});
```

**追问点**：
- 如何自定义下拉刷新样式？
- 如何实现触底加载的节流？
- 如何处理加载失败的情况？

---

### Q16: 如何实现小程序的分享功能？

**核心答案**：

小程序支持分享到好友和朋友圈。

**代码示例**：

```javascript
Page({
  // 1. 分享给好友
  onShareAppMessage(options) {
    // options.from: button | menu
    // options.target: 分享按钮
    
    return {
      title: '分享标题',
      path: '/pages/index/index?id=123',  // 分享路径
      imageUrl: '/images/share.png'       // 分享图片
    };
  },

  // 2. 分享到朋友圈
  onShareTimeline() {
    return {
      title: '分享到朋友圈',
      query: 'id=123',  // 自定义参数
      imageUrl: '/images/share.png'
    };
  }
});
```

```xml
<!-- 分享按钮 -->
<button open-type="share">分享给好友</button>
```

**动态分享内容**：

```javascript
Page({
  data: {
    article: {
      id: 123,
      title: '文章标题',
      image: 'https://example.com/image.jpg'
    }
  },

  onShareAppMessage() {
    const { article } = this.data;
    
    return {
      title: article.title,
      path: `/pages/detail/detail?id=${article.id}`,
      imageUrl: article.image
    };
  }
});
```

**接收分享参数**：

```javascript
Page({
  onLoad(options) {
    // 接收分享参数
    const id = options.id;
    console.log('分享参数', id);
    
    // 加载数据
    this.loadArticle(id);
  }
});
```

**追问点**：
- 如何统计分享数据？
- 如何实现分享海报？
- 分享到朋友圈的限制？

---

## 面试技巧

### 回答策略

1. **先说核心概念**：简明扼要地说明是什么
2. **再说工作原理**：解释为什么这样设计
3. **举代码示例**：用实际代码说明用法
4. **说优化方案**：展示你的实战经验
5. **提出追问点**：引导面试官提问你擅长的领域

### 加分项

1. **性能优化经验**：setData 优化、长列表优化
2. **工程化实践**：组件化、模块化、自动化
3. **问题排查能力**：调试技巧、性能监控
4. **最佳实践**：代码规范、错误处理、用户体验

### 常见陷阱

1. **只说理论不说实践**：要结合实际项目经验
2. **忽略性能问题**：要主动提及性能优化
3. **不了解原理**：要深入理解双线程架构
4. **缺乏对比思维**：要对比小程序与其他技术

---

> 本文档包含 16 道精选面试题，涵盖小程序的核心知识点和实战场景。每题都包含核心答案、代码示例和追问点，帮助你全面掌握小程序开发。
