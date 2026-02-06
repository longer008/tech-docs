# 微信小程序开发指南

> 更新时间：2025-02

## 目录导航

- [核心概念](#核心概念)
- [架构与线程模型](#架构与线程模型)
- [生命周期](#生命周期)
- [组件化开发](#组件化开发)
- [路由与导航](#路由与导航)
- [数据绑定与更新](#数据绑定与更新)
- [分包加载](#分包加载)
- [云开发](#云开发)
- [登录授权](#登录授权)
- [性能优化](#性能优化)
- [最佳实践](#最佳实践)

## 核心概念

### 什么是微信小程序？

微信小程序是一种不需要下载安装即可使用的应用，它实现了应用"触手可及"的梦想，用户扫一扫或搜一下即可打开应用。

**核心特点**：
- 无需安装，即用即走
- 体验接近原生 App
- 开发成本低，跨平台
- 依托微信生态，流量巨大

### 技术栈

- **视图层**：WXML（类似 HTML）+ WXSS（类似 CSS）
- **逻辑层**：JavaScript（基于 V8 引擎）
- **配置**：JSON 配置文件
- **云服务**：云开发（云函数、云数据库、云存储）

## 架构与线程模型

### 双线程架构

微信小程序采用双线程架构，逻辑层和视图层分离：

```
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

**架构优势**：
- 视图层和逻辑层分离，避免 JS 阻塞渲染
- 多个 WebView 可以并存，页面切换流畅
- 逻辑层运行在独立的 JSCore 中，安全性高

**通信机制**：
- 视图层和逻辑层通过 JSBridge 进行通信
- 数据传输需要序列化和反序列化
- setData 调用会触发跨线程通信


## 生命周期

### App 生命周期

App 实例的生命周期管理整个小程序的启动、显示、隐藏和错误处理。

```javascript
// app.js
App({
  // 小程序初始化完成时触发（全局只触发一次）
  onLaunch(options) {
    console.log('小程序启动', options);
    // options.scene: 场景值
    // options.query: 启动参数
    // options.referrerInfo: 来源信息
    
    // 初始化全局数据
    this.globalData.userInfo = null;
    
    // 检查更新
    this.checkUpdate();
  },

  // 小程序启动或从后台进入前台时触发
  onShow(options) {
    console.log('小程序显示', options);
    // 刷新数据、恢复状态
  },

  // 小程序从前台进入后台时触发
  onHide() {
    console.log('小程序隐藏');
    // 保存数据、暂停任务
  },

  // 小程序发生脚本错误或 API 调用失败时触发
  onError(msg) {
    console.error('小程序错误', msg);
    // 错误上报
  },

  // 页面不存在时触发
  onPageNotFound(res) {
    console.log('页面不存在', res);
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },

  // 全局数据
  globalData: {
    userInfo: null,
    token: ''
  },

  // 检查更新
  checkUpdate() {
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });
  }
});
```

### Page 生命周期

页面的生命周期管理页面的加载、显示、隐藏和卸载。

```javascript
// pages/index/index.js
Page({
  data: {
    text: 'Hello World',
    list: []
  },

  // 页面加载时触发（一个页面只会调用一次）
  onLoad(options) {
    console.log('页面加载', options);
    // options: 页面参数
    // 适合进行页面初始化、数据请求
    this.fetchData();
  },

  // 页面显示时触发（每次打开页面都会调用）
  onShow() {
    console.log('页面显示');
    // 适合刷新数据、恢复状态
  },

  // 页面初次渲染完成时触发（一个页面只会调用一次）
  onReady() {
    console.log('页面渲染完成');
    // 适合获取节点信息、设置导航栏
    wx.setNavigationBarTitle({
      title: '首页'
    });
  },

  // 页面隐藏时触发
  onHide() {
    console.log('页面隐藏');
    // 适合暂停任务、保存状态
  },

  // 页面卸载时触发
  onUnload() {
    console.log('页面卸载');
    // 适合清理资源、取消请求
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.fetchData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 上拉触底
  onReachBottom() {
    console.log('上拉触底');
    this.loadMore();
  },

  // 页面滚动
  onPageScroll(e) {
    console.log('页面滚动', e.scrollTop);
  },

  // 用户点击右上角分享
  onShareAppMessage() {
    return {
      title: '分享标题',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    };
  },

  // 用户点击右上角分享到朋友圈
  onShareTimeline() {
    return {
      title: '分享到朋友圈',
      query: 'id=123'
    };
  },

  // 页面尺寸改变时触发
  onResize(res) {
    console.log('页面尺寸改变', res.size);
  },

  // Tab 点击时触发
  onTabItemTap(item) {
    console.log('Tab 点击', item);
  },

  // 自定义方法
  fetchData() {
    return wx.request({
      url: 'https://api.example.com/data',
      success: (res) => {
        this.setData({
          list: res.data
        });
      }
    });
  },

  loadMore() {
    // 加载更多数据
  }
});
```


### Component 生命周期

组件的生命周期管理组件的创建、附加、渲染和销毁。

```javascript
// components/custom/custom.js
Component({
  // 组件属性
  properties: {
    title: {
      type: String,
      value: '默认标题'
    },
    count: {
      type: Number,
      value: 0,
      observer(newVal, oldVal) {
        console.log('count 变化', newVal, oldVal);
      }
    }
  },

  // 组件数据
  data: {
    innerData: 'inner'
  },

  // 组件生命周期
  lifetimes: {
    // 组件实例刚刚被创建时执行
    created() {
      console.log('组件创建');
      // 此时不能调用 setData
      // 通常用于给组件 this 添加自定义属性
    },

    // 组件实例进入页面节点树时执行
    attached() {
      console.log('组件附加');
      // 此时可以调用 setData
      // 适合进行初始化、数据请求
      this.fetchData();
    },

    // 组件在视图层布局完成后执行
    ready() {
      console.log('组件渲染完成');
      // 适合获取节点信息
      this.createSelectorQuery()
        .select('.custom')
        .boundingClientRect((rect) => {
          console.log('组件位置', rect);
        })
        .exec();
    },

    // 组件实例被移动到节点树另一个位置时执行
    moved(
methods: {
    // 自定义方法
    handleTap() {
      this.setData({
        innerData: 'new value'
      });
      // 触发事件
      this.triggerEvent('customEvent', { value: 'data' });
    },

    fetchData() {
      // 数据请求
    },

    cleanup() {
      // 清理资源
    }
  }
});
```

**生命周期执行顺序**：

```
created → attached → ready → [页面生命周期] → detached
```

## 组件化开发

### 自定义组件

小程序支持自定义组件，可以将页面拆分成多个可复用的组件。

**组件结构**：

```
components/
  └── custom/
      ├── custom.js    // 组件逻辑
      ├── custom.json  // 组件配置
      ├── custom.wxml  // 组件模板
      └── custom.wxss  // 组件样式
```

**组件定义**：

```javascript
// components/custom/custom.js
Component({
  // 组件属性列表
  properties: {
    // 简化写法
    title: String,
    
    // 完整写法
    count: {
      type: Number,
      value: 0,
      observer(newVal, oldVal) {
        // 属性变化监听
      }
    }
  },

  // 组件数据
  data: {
    innerData: 'value'
  },

  // 组件方法
  methods: {
    handleTap() {
      // 修改数据
      this.setData({
        innerData: 'new value'
      });
      
      // 触发事件
      this.triggerEvent('myevent', { value: 'data' }, {
        bubbles: true,  // 是否冒泡
        composed: true, // 是否穿越组件边界
        capturePhase: false // 是否有捕获阶段
      });
    }
  }
});
```

```json
// components/custom/custom.json
{
  "component": true,
  "usingComponents": {}
}
```

```xml
<!-- components/custom/custom.wxml -->
<view class="custom" bindtap="handleTap">
  <text>{{title}}</text>
  <text>{{count}}</text>
  <slot></slot>
</view>
```

```css
/* components/custom/custom.wxss */
.custom {
  padding: 20rpx;
  background: #f5f5f5;
}
```

### 组件通信

**1. 父传子（Properties）**：

```xml
<!-- 父组件 -->
<custom title="标题" count="{{count}}" />
```

**2. 子传父（Events）**：

```javascript
// 子组件
this.triggerEvent('myevent', { value: 'data' });
```

```xml
<!-- 父组件 -->
<custom bind:myevent="handleEvent" />
```

```javascript
// 父组件
Page({
  handleEvent(e) {
    console.log(e.detail); // { value: 'data' }
  }
});
```

**3. 获取组件实例**：

```javascript
// 父组件
Page({
  onReady() {
    const custom = this.selectComponent('.custom');
    custom.setData({ innerData: 'new' });
  }
});
```

**4. 使用 Behaviors（类似 Mixins）**：

```javascript
// behaviors/common.js
module.exports = Behavior({
  properties: {
    commonProp: String
  },
  data: {
    commonData: 'value'
  },
  methods: {
    commonMethod() {
      console.log('common method');
    }
  }
});
```

```javascript
// components/custom/custom.js
const commonBehavior = require('../../behaviors/common');

Component({
  behaviors: [commonBehavior],
  // ...
});
```

### 插槽（Slot）

**单个插槽**：

```xml
<!-- 组件模板 -->
<view class="wrapper">
  <slot></slot>
</view>
```

```xml
<!-- 使用组件 -->
<custom>
  <text>插槽内容</text>
</custom>
```

**多个插槽**：

```javascript
// 组件 JS
Component({
  options: {
    multipleSlots: true // 启用多插槽
  }
});
```

```xml
<!-- 组件模板 -->
<view class="wrapper">
  <slot name="header"></slot>
  <slot></slot>
  <slot name="footer"></slot>
</view>
```

```xml
<!-- 使用组件 -->
<custom>
  <view slot="header">头部</view>
  <view>默认内容</view>
  <view slot="footer">底部</view>
</custom>
```

### 样式隔离

组件支持样式隔离，防止样式冲突。

```javascript
Component({
  options: {
    styleIsolation: 'isolated' // 样式隔离
    // isolated: 完全隔离（默认）
    // apply-shared: 页面样式影响组件
    // shared: 页面和组件样式互相影响
  }
});
```

**外部样式类**：

```javascript
Component({
  externalClasses: ['my-class']
});
```

```xml
<!-- 组件模板 -->
<view class="my-class">内容</view>
```

```xml
<!-- 使用组件 -->
<custom my-class="custom-style" />
```


## 路由与导航

### 页面栈

小程序维护一个页面栈，最多 10 层。

```
页面栈示例：
[首页] → [列表页] → [详情页] → [编辑页] → ...（最多10层）
```

### 路由 API

**1. wx.navigateTo（保留当前页面，跳转到新页面）**：

```javascript
wx.navigateTo({
  url: '/pages/detail/detail?id=123',
  success: (res) => {
    console.log('跳转成功');
  },
  fail: (err) => {
    console.error('跳转失败', err);
  }
});

// 页面栈：[首页, 详情页]
```

**2. wx.redirectTo（关闭当前页面，跳转到新页面）**：

```javascript
wx.redirectTo({
  url: '/pages/result/result'
});

// 页面栈：[结果页]（首页被关闭）
```

**3. wx.navigateBack（返回上一页或多级页面）**：

```javascript
// 返回上一页
wx.navigateBack({
  delta: 1 // 返回的页面数，默认 1
});

// 返回上两页
wx.navigateBack({
  delta: 2
});
```

**4. wx.switchTab（跳转到 tabBar 页面）**：

```javascript
wx.switchTab({
  url: '/pages/index/index'
});

// 会关闭所有非 tabBar 页面
```

**5. wx.reLaunch（关闭所有页面，打开新页面）**：

```javascript
wx.reLaunch({
  url: '/pages/index/index'
});

// 页面栈：[首页]（所有页面被关闭）
```

### 页面间通信

**1. URL 传参**：

```javascript
// 跳转时传参
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
```

**2. EventChannel（页面间事件通信）**：

```javascript
// 页面 A 跳转到页面 B
wx.navigateTo({
  url: '/pages/detail/detail',
  success: (res) => {
    // 向页面 B 传递数据
    res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' });
obalData.userInfo);
app.globalData.token = 'new token';
```

## 数据绑定与更新

### setData 机制

setData 是小程序中更新视图的唯一方法，它会触发跨线程通信。

```javascript
Page({
  data: {
    message: 'Hello',
    user: {
      name: 'Tom',
      age: 20
    },
    list: [1, 2, 3]
  },

  // 基础用法
  updateMessage() {
    this.setData({
      message: 'World'
    });
  },

  // 更新对象属性
  updateUser() {
    this.setData({
      'user.name': 'Jerry',
      'user.age': 21
    });
  },

  // 更新数组元素
  updateList() {
    this.setData({
      'list[0]': 10,
      'list[1]': 20
    });
  },

  // 批量更新
  batchUpdate() {
    this.setData({
      message: 'New Message',
      'user.name': 'Mike',
      'list[2]': 30
    });
  },

  // 使用回调
  updateWithCallback() {
    this.setData({
      message: 'Updated'
    }, () => {
      console.log('更新完成');
      // 注意：此时视图可能还未更新完成
    });
  }
});
```

### setData 性能优化

**1. 只更新变化的数据**：

```javascript
// ❌ 不好的做法
this.setData({
  user: {
    name: 'Tom',
    age: 20,
    address: '...',
    // ... 大量数据
  }
});

// ✅ 好的做法
this.setData({
  'user.name': 'Tom'
});
```

**2. 避免频繁调用**：

```javascript
// ❌ 不好的做法
for (let i = 0; i < 100; i++) {
  this.setData({
    [`list[${i}]`]: i
  });
}

// ✅ 好的做法
const updates = {};
for (let i = 0; i < 100; i++) {
  updates[`list[${i}]`] = i;
}
this.setData(updates);
```

**3. 使用节流和防抖**：

```javascript
// 节流
let timer = null;
function throttle(fn, delay) {
  return function(...args) {
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

// 防抖
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

Page({
  onPageScroll: throttle(function(e) {
    this.setData({
      scrollTop: e.scrollTop
    });
  }, 100)
});
```

**4. 使用纯数据字段**：

```javascript
Component({
  options: {
    pureDataPattern: /^_/ // 以 _ 开头的数据字段不参与渲染
  },
  data: {
    a: 1,      // 参与渲染
    _b: 2      // 不参与渲染，但可以在 JS 中使用
  }
});
```

### 数据监听器（Observers）

```javascript
Component({
  data: {
    count: 0,
    user: {
      name: 'Tom'
    }
  },

  observers: {
    // 监听单个字段
    'count': function(newVal) {
      console.log('count 变化', newVal);
    },

    // 监听多个字段
    'count, user.name': function(count, name) {
      console.log('count 或 name 变化', count, name);
    },

    // 监听对象所有属性
    'user.**': function(user) {
      console.log('user 的任意属性变化', user);
    },

    // 监听所有数据
    '**': function() {
      console.log('任意数据变化');
    }
  }
});
```


## 分包加载

### 为什么需要分包？

- 主包大小限制：2MB
- 总包大小限制：20MB（含所有分包）
- 首屏加载优化：只加载必要的代码

### 分包配置

```json
// app.json
{
  "pages": [
    "pages/index/index",
    "pages/logs/logs"
  ],
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
        "pages/apple/apple",
        "pages/banana/banana"
      ],
      "independent": true  // 独立分包
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pack1"]
    }
  }
}
```

**目录结构**：

```
├── app.js
├── app.json
├── pages/
│   ├── index/
│   └── logs/
├── packageA/
│   └── pages/
│       ├── cat/
│       └── dog/
└── packageB/
    └── pages/
        ├── apple/
        └── banana/
```

### 普通分包

普通分包在需要时才加载，可以访问主包资源。

```javascript
// 跳转到分包页面
wx.navigateTo({
  url: '/packageA/pages/cat/cat'
});
```

### 独立分包

独立分包可以独立于主包运行，不能访问主包资源。

```json
{
  "subpackages": [
    {
      "root": "packageB",
      "pages": ["pages/apple/apple"],
      "independent": true  // 标记为独立分包
    }
  ]
}
```

**独立分包特点**：
- 可以不下载主包直接运行
- 不能访问主包的 JS、模板、样式
- 适合广告页、活动页等独立功能

### 分包预下载

在进入某个页面时，预下载可能需要的分包。
s/cat/cat"]
    },
    {
      "root": "packageB",
      "pages": ["pages/dog/dog"]
    }
  ],
  "requiredBackgroundModes": ["audio"],
  "subPackages": [
    {
      "root": "packageA",
      "pages": ["pages/cat/cat"],
      "plugins": {
        "myPlugin": {
          "version": "1.0.0",
          "provider": "wxidxxxxxxxxxxxxxxxx"
        }
      }
    }
  ]
}
```

## 云开发

### 云开发简介

云开发提供云函数、云数据库、云存储等能力，无需搭建服务器。

**核心能力**：
- 云函数：在云端运行的代码
- 云数据库：JSON 数据库
- 云存储：文件存储
- 云调用：调用微信开放接口

### 初始化云开发

```javascript
// app.js
App({
  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'your-env-id',  // 云开发环境 ID
      traceUser: true      // 是否在将用户访问记录到用户管理中
    });
  }
});
```

### 云函数

**创建云函数**：

```javascript
// cloudfunctions/getUser/index.js
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { userId } = event;
  
  // 获取数据库引用
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
```

**调用云函数**：

```javascript
// 小程序端
wx.cloud.callFunction({
  name: 'getUser',
  data: {
    userId: '123'
  }
}).then(res => {
  console.log(res.result);
}).catch(err => {
  console.error(err);
});
```

### 云数据库

**增删改查**：

```javascript
const db = wx.cloud.database();
const users = db.collection('users');

// 新增
users.add({
  data: {
    name: 'Tom',
    age: 20
  }
}).then(res => {
  console.log('新增成功', res._id);
});

// 查询
users.where({
  age: 20
}).get().then(res => {
  console.log('查询结果', res.data);
});

// 更新
users.doc('user-id').update({
  data: {
    age: 21
  }
}).then(res => {
  console.log('更新成功');
});

// 删除
users.doc('user-id').remove().then(res => {
  console.log('删除成功');
});
```

**高级查询**：

```javascript
const db = wx.cloud.database();
const _ = db.command;

// 条件查询
db.collection('users').where({
  age: _.gt(18).and(_.lt(30))  // 18 < age < 30
}).get();

// 排序和分页
db.collection('users')
  .orderBy('age', 'desc')
  .skip(10)
  .limit(10)
  .get();

// 聚合查询
db.collection('users')
  .aggregate()
  .group({
    _id: '$city',
    count: _.sum(1)
  })
  .end();
```

### 云存储

```javascript
// 上传文件
wx.cloud.uploadFile({
  cloudPath: 'images/avatar.png',  // 云端路径
  filePath: tempFilePath,          // 本地临时文件路径
  success: res => {
    console.log('上传成功', res.fileID);
  }
});

// 下载文件
wx.cloud.downloadFile({
  fileID: 'cloud://xxx.png',
  success: res => {
    console.log('下载成功', res.tempFilePath);
  }
});

// 删除文件
wx.cloud.deleteFile({
  fileList: ['cloud://xxx.png']
}).then(res => {
  console.log('删除成功');
});

// 获取临时链接
wx.cloud.getTempFileURL({
  fileList: ['cloud://xxx.png']
}).then(res => {
  console.log('临时链接', res.fileList[0].tempFileURL);
});
```

## 登录授权

### 登录流程

```javascript
// 1. 调用 wx.login 获取 code
wx.login({
  success: (res) => {
    const code = res.code;
    
    // 2. 将 code 发送到后端
    wx.request({
      url: 'https://api.example.com/login',
      method: 'POST',
      data: { code },
      success: (res) => {
        // 3. 后端返回自定义登录态
        const token = res.data.token;
        
        // 4. 存储 token
        wx.setStorageSync('token', token);
      }
    });
  }
});
```

**后端处理**（Node.js 示例）：

```javascript
// 后端接口
app.post('/login', async (req, res) => {
  const { code } = req.body;
  
  // 调用微信接口换取 session_key 和 openid
  const result = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    params: {
      appid: 'your-appid',
      secret: 'your-secret',
      js_code: code,
      grant_type: 'authorization_code'
    }
  });
  
  const { openid, session_key } = result.data;
  
  // 生成自定义登录态
  const token = generateToken(openid);
  
  res.json({ token });
});
```

### 获取用户信息

```xml
<!-- 使用 button 组件获取用户信息 -->
<button open-type="getUserInfo" bindgetuserinfo="getUserInfo">
  获取用户信息
</button>
```

```javascript
Page({
  getUserInfo(e) {
    if (e.detail.userInfo) {
      console.log('用户信息', e.detail.userInfo);
      // userInfo: { nickName, avatarUrl, gender, ... }
    } else {
      console.log('用户拒绝授权');
    }
  }
});
```

### 获取手机号

```xml
<button open-type="getPhoneNumber" bindgetphonenumber="getPhoneNumber">
  获取手机号
</button>
```

```javascript
Page({
  getPhoneNumber(e) {
    if (e.detail.code) {
      // 将 code 发送到后端解密
      wx.request({
        url: 'https://api.example.com/getPhone',
        method: 'POST',
        data: { code: e.detail.code },
        success: (res) => {
          console.log('手机号', res.data.phoneNumber);
        }
      });
    }
  }
});
```

### 授权管理

```javascript
// 检查授权状态
wx.getSetting({
  success: (res) => {
    if (res.authSetting['scope.userInfo']) {
      // 已授权
      wx.getUserInfo({
        success: (res) => {
          console.log(res.userInfo);
        }
      });
    } else {
      // 未授权，引导用户授权
    }
  }
});

// 打开设置页面
wx.openSetting({
  success: (res) => {
    console.log(res.authSetting);
  }
});
```


## 性能优化

### 首屏渲染优化

**1. 使用分包加载**：

```json
{
  "subpackages": [
    {
      "root": "packageA",
      "pages": ["pages/detail/detail"]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["packageA"]
    }
  }
}
```

**2. 骨架屏**：

```xml
<!-- 骨架屏 -->
<view wx:if="{{loading}}" class="skeleton">
  <view class="skeleton-item"></view>
  <view class="skeleton-item"></view>
</view>

<!-- 实际内容 -->
<view wx:else>
  <!-- 内容 -->
</view>
```

**3. 图片懒加载**：

```xml
<image 
  src="{{item.image}}" 
  lazy-load="{{true}}"
  mode="aspectFill"
/>
```

**4. 减少首屏数据量**：

```javascript
Page({
  data: {
    list: []  // 首屏只加载必要数据
  },
  
  onLoad() {
    // 只加载首屏数据
    this.loadFirstPage();
  },
  
  onReachBottom() {
    // 滚动到底部时加载更多
    this.loadMore();
  }
});
```

### setData 优化

**1. 只更新变化的数据**：

```javascript
// ❌ 不好
this.setData({
  list: this.data.list  // 整个数组
});

// ✅ 好
this.setData({
  [`list[${index}]`]: newItem  // 只更新一项
});
```

**2. 合并多次 setData**：

```javascript
// ❌ 不好
this.setData({ a: 1 });
this.setData({ b: 2 });
this.setData({ c: 3 });

// ✅ 好
this.setData({
  a: 1,
  b: 2,
  c: 3
});
```

**3. 使用纯数据字段**：

```javascript
Component({
  options: {
    pureDataPattern: /^_/  // _ 开头的字段不参与渲染
  },
  data: {
    renderData: [],  // 参与渲染
    _cacheData: []   // 不参与渲染
  }
});
```

### 长列表优化

**1. 虚拟列表**：

```xml
<!-- 使用 recycle-view 组件 -->
<recycle-view 
  batch="{{batchSetRecycleData}}" 
  height="{{height}}"
>
  <recycle-item wx:for="{{list}}" wx:key="id">
    <view>{{item.name}}</view>
  </recycle-item>
</recycle-view>
```

**2. 分页加载**：

```javascript
Page({
  data: {
    list: [],
    page: 1,
    pageSize: 20,
    hasMore: true
  },
  
  onReachBottom() {
    if (!this.data.hasMore) return;
    
    this.loadMore();
  },
  
  loadMore() {
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
      }
    });
  }
});
```

### 图片优化

**1. 使用合适的图片格式**：

- WebP：体积小，质量高
- JPEG：适合照片
- PNG：适合图标、透明图

**2. 图片压缩**：

```javascript
// 压缩图片
wx.compressImage({
  src: tempFilePath,
  quality: 80,  // 压缩质量
  success: (res) => {
    console.log('压缩后', res.tempFilePath);
  }
});
```

**3. 使用 CDN**：

```xml
<image src="https://cdn.example.com/image.jpg" />
```

**4. 图片懒加载**：

```xml
<image 
  src="{{item.image}}" 
  lazy-load="{{true}}"
  mode="aspectFill"
/>
```

### 代码优化

**1. 避免在 WXML 中使用复杂表达式**：

```xml
<!-- ❌ 不好 -->
<view>{{item.price * item.count + item.discount}}</view>

<!-- ✅ 好 -->
<view>{{item.totalPrice}}</view>
```

```javascript
// 在 JS 中计算
this.setData({
  'list[0].totalPrice': item.price * item.count + item.discount
});
```

**2. 使用 WXS 提升性能**：

```xml
<!-- utils.wxs -->
<wxs module="utils">
  var formatPrice = function(price) {
    return '¥' + price.toFixed(2);
  };
  
  module.exports = {
    formatPrice: formatPrice
  };
</wxs>

<!-- 使用 -->
<view>{{utils.formatPrice(item.price)}}</view>
```

**3. 避免频繁的页面切换**：

```javascript
// 使用 redirectTo 代替 navigateTo
wx.redirectTo({
  url: '/pages/result/result'
});
```

### 网络优化

**1. 请求合并**：

```javascript
// ❌ 不好：多次请求
wx.request({ url: '/api/user' });
wx.request({ url: '/api/orders' });
wx.request({ url: '/api/products' });

// ✅ 好：合并请求
wx.request({
  url: '/api/batch',
  data: {
    apis: ['user', 'orders', 'products']
  }
});
```

**2. 请求缓存**：

```javascript
// 缓存请求结果
const cache = {};

function request(url) {
  if (cache[url]) {
    return Promise.resolve(cache[url]);
  }
  
  return wx.request({ url }).then(res => {
    cache[url] = res.data;
    return res.data;
  });
}
```

**3. 使用 HTTP/2**：

```javascript
// 服务器启用 HTTP/2
// 小程序会自动使用 HTTP/2
```

## 最佳实践

### 1. 代码规范

**目录结构**：

```
miniprogram/
├── pages/           # 页面
├── components/      # 组件
├── utils/           # 工具函数
├── api/             # API 接口
├── config/          # 配置文件
├── styles/          # 公共样式
└── images/          # 图片资源
```

**命名规范**：

```javascript
// 文件名：小写字母 + 连字符
// user-info.js

// 变量名：小驼峰
const userName = 'Tom';

// 常量名：大写字母 + 下划线
const API_BASE_URL = 'https://api.example.com';

// 组件名：大驼峰
Component({
  name: 'UserInfo'
});
```

### 2. 错误处理

```javascript
// 全局错误处理
App({
  onError(err) {
    console.error('全局错误', err);
    // 错误上报
    this.reportError(err);
  },
  
  reportError(err) {
    wx.request({
      url: '/api/error',
      method: 'POST',
      data: {
        error: err,
        page: getCurrentPages().pop().route,
        time: new Date().toISOString()
      }
    });
  }
});

// 页面错误处理
Page({
  fetchData() {
    wx.showLoading({ title: '加载中' });
    
    wx.request({
      url: '/api/data',
      success: (res) => {
        this.setData({ data: res.data });
      },
      fail: (e
{
  title: '提示',
  content: '确定要删除吗？',
  success: (res) => {
    if (res.confirm) {
      // 确认操作
    }
  }
});
```

**下拉刷新**：

```json
// page.json
{
  "enablePullDownRefresh": true,
  "backgroundColor": "#f5f5f5"
}
```

```javascript
Page({
  onPullDownRefresh() {
    this.fetchData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
```

### 4. 安全规范

**数据加密**：

```javascript
// 敏感数据加密存储
const crypto = require('crypto-js');

// 加密
const encrypted = crypto.AES.encrypt(data, key).toString();
wx.setStorageSync('token', encrypted);

// 解密
const decrypted = crypto.AES.decrypt(encrypted, key).toString(crypto.enc.Utf8);
```

**防止 XSS 攻击**：

```javascript
// 过滤用户输入
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
```

**HTTPS 请求**：

```javascript
// 所有请求必须使用 HTTPS
wx.request({
  url: 'https://api.example.com/data'  // 必须是 HTTPS
});
```

### 5. 性能监控

```javascript
// 性能监控
Page({
  onLoad() {
    const startTime = Date.now();
    
    this.fetchData().then(() => {
      const loadTime = Date.now() - startTime;
      console.log('页面加载时间', loadTime);
      
      // 上报性能数据
      this.reportPerformance({
        page: this.route,
        loadTime
      });
    });
  },
  
  reportPerformance(data) {
    wx.request({
      url: '/api/performance',
      method: 'POST',
      data
    });
  }
});
```

## 常见问题

### 1. 页面栈溢出

**问题**：页面栈最多 10 层，超过会报错。

**解决**：使用 `redirectTo` 或 `reLaunch` 代替 `navigateTo`。

```javascript
// ❌ 可能导致栈溢出
wx.navigateTo({ url: '/pages/detail/detail' });

// ✅ 关闭当前页面
wx.redirectTo({ url: '/pages/detail/detail' });

// ✅ 关闭所有页面
wx.reLaunch({ url: '/pages/index/index' });
```

### 2. setData 数据过大

**问题**：单次 setData 数据过大会导致卡顿。

**解决**：分批更新或使用局部更新。

```javascript
// ❌ 数据过大
this.setData({
  list: largeArray  // 可能有几千条数据
});

// ✅ 分批更新
const batchSize = 50;
for (let i = 0; i < largeArray.length; i += batchSize) {
  const batch = largeArray.slice(i, i + batchSize);
  this.setData({
    [`list[${i}]`]: batch
  });
}
```

### 3. 图片加载失败

**问题**：图片加载失败显示空白。

**解决**：使用默认图片。

```xml
<image 
  src="{{item.image}}" 
  binderror="handleImageError"
  data-index="{{index}}"
/>
```

```javascript
Page({
  handleImageError(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      [`list[${index}].image`]: '/images/default.png'
    });
  }
});
```

## 参考资源

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [小程序开发指南](https://developers.weixin.qq.com/ebook?action=get_post_info&docid=0008aeea9a8978ab0086a685851c0a)
- [小程序性能优化](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/)
- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

---

> 本文档基于微信小程序官方文档整理，包含核心概念、最佳实践和常见问题解决方案。
