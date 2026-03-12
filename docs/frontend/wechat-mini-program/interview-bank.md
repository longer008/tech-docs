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

**Q1: 小程序与 H5 的区别？**

A: 主要区别在运行环境和能力：
- **运行环境**：小程序运行在微信客户端，H5 运行在浏览器
- **性能**：小程序有预加载和原生组件，性能更好
- **API 能力**：小程序可调用更多原生 API（支付、定位、相机等）
- **分发方式**：小程序通过微信分发，H5 通过 URL 访问
- **开发限制**：小程序有包体积限制（主包 2MB），H5 相对自由

**Q2: 小程序与原生 App 的区别？**

A: 小程序是轻量级应用，原生 App 是完整应用：
- **安装方式**：小程序即用即走，App 需要下载安装
- **开发成本**：小程序开发成本低，一套代码多端运行
- **性能**：原生 App 性能更好，小程序有一定性能损耗
- **功能限制**：小程序功能受平台限制，App 功能更完整
- **更新方式**：小程序热更新，App 需要版本发布

**Q3: 小程序的应用场景？**

A: 适合轻量级、高频、低门槛的场景：
- **工具类**：计算器、天气、翻译等简单工具
- **内容类**：新闻、资讯、小说等内容消费
- **电商类**：商品展示、下单购买等轻量电商
- **服务类**：预约挂号、外卖点餐等生活服务
- **游戏类**：休闲小游戏、社交游戏

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

**Q1: 为什么要采用双线程架构？**

A: 双线程架构的设计目的：
- **安全性**：逻辑层无法直接操作 DOM，防止恶意代码
- **稳定性**：视图层和逻辑层分离，一个崩溃不影响另一个
- **性能**：视图层可以专注渲染，逻辑层专注业务处理
- **管控性**：微信可以更好地管控小程序的行为和权限

**Q2: JSBridge 的工作原理？**

A: JSBridge 是双线程通信的桥梁：
- **消息传递**：通过 evaluateJavaScript 和 postMessage 传递消息
- **序列化**：数据通过 JSON 序列化在两个线程间传输
- **异步通信**：所有通信都是异步的，避免阻塞 UI
- **事件机制**：基于发布订阅模式，支持事件监听和触发

```javascript
// JSBridge 简化原理
class JSBridge {
  constructor() {
    this.callbacks = {}
    this.callbackId = 0
  }
  
  // 发送消息到另一个线程
  invoke(method, data, callback) {
    const id = this.callbackId++
    this.callbacks[id] = callback
    
    // 发送到另一个线程
    this.postMessage({
      method,
      data,
      callbackId: id
    })
  }
  
  // 接收另一个线程的消息
  onMessage(message) {
    const { method, data, callbackId } = message
    
    if (callbackId && this.callbacks[callbackId]) {
      this.callbacks[callbackId](data)
      delete this.callbacks[callbackId]
    }
  }
}
```
**Q3: setData 的性能影响？**

A: setData 的性能影响主要体现在：
- **序列化开销**：数据需要 JSON.stringify 序列化，大对象耗时长
- **传输开销**：跨线程传输有固定开销，频繁调用累积影响大
- **渲染开销**：视图层需要 diff 和重新渲染，复杂视图耗时长
- **阻塞风险**：大量数据传输可能阻塞 JSBridge，影响用户交互

**性能优化策略**：
```javascript
// 1. 减少传输数据量
this.setData({
  'user.name': newName  // 只更新变化的字段
})

// 2. 批量更新
const updates = {}
list.forEach((item, index) => {
  updates[`list[${index}].status`] = 'updated'
})
this.setData(updates)

// 3. 使用纯数据字段
Component({
  options: {
    pureDataPattern: /^_/  // _开头的字段不参与渲染
  },
  data: {
    renderList: [],  // 参与渲染
    _fullList: []    // 不参与渲染，减少传输量
  }
})

// 4. 节流防抖
const throttledSetData = throttle((data) => {
  this.setData(data)
}, 100)
```

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

**Q1: setData 的数据大小限制？**

A: setData 有严格的数据限制：
- **单次限制**：每次 setData 数据不能超过 1024KB
- **频率限制**：建议每秒调用不超过 20 次
- **队列限制**：待处理的 setData 不能超过 1000 个
- **路径限制**：数据路径长度不能超过一定限制

**超出限制的后果**：
- 数据传输失败
- 页面渲染卡顿
- 小程序可能被强制关闭

**Q2: 如何监控 setData 性能？**

A: 监控 setData 性能的方法：

1. **性能监控 API**：
```javascript
// 监控 setData 调用
const originalSetData = Page.prototype.setData
Page.prototype.setData = function(data, callback) {
  const start = Date.now()
  const dataSize = JSON.stringify(data).length
  
  console.log(`setData 数据大小: ${dataSize} bytes`)
  
  originalSetData.call(this, data, () => {
    const duration = Date.now() - start
    console.log(`setData 耗时: ${duration}ms`)
    callback && callback()
  })
}
```

2. **小程序开发工具**：
- 使用调试器的 Performance 面板
- 查看 setData 调用频率和数据大小
- 分析渲染性能瓶颈

3. **第三方监控**：
```javascript
// 使用微信小程序助手或其他监控工具
wx.reportMonitor('setData_performance', {
  dataSize,
  duration,
  path: getCurrentPages().pop().route
})
```
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

**Q1: onLoad 和 onShow 的区别？**

A: 两个生命周期的触发时机不同：

**onLoad**：
- **触发时机**：页面首次加载时触发，只触发一次
- **参数**：可以接收页面跳转的参数
- **用途**：初始化数据、设置页面配置
- **示例**：获取用户信息、设置导航栏标题

**onShow**：
- **触发时机**：页面显示时触发，可能多次触发
- **参数**：无参数
- **用途**：刷新数据、重新获取状态
- **示例**：刷新列表数据、检查登录状态

```javascript
Page({
  onLoad(options) {
    console.log('页面加载', options) // 只执行一次
    this.initData()
  },
  
  onShow() {
    console.log('页面显示') // 每次显示都执行
    this.refreshData()
  }
})
```

**Q2: 什么时候使用 onReady？**

A: onReady 在页面初次渲染完成后触发，适用于：
- **DOM 操作**：需要操作页面元素时
- **Canvas 绘制**：需要获取 Canvas 上下文
- **第三方库初始化**：需要 DOM 就绪的库
- **尺寸计算**：需要获取元素尺寸信息

```javascript
Page({
  onReady() {
    // 获取元素信息
    wx.createSelectorQuery()
      .select('#myCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        // 开始绘制
      })
  }
})
```

**Q3: 组件的 pageLifetimes 是什么？**

A: pageLifetimes 是组件监听页面生命周期的机制：
- **show**：页面显示时触发
- **hide**：页面隐藏时触发
- **resize**：页面尺寸变化时触发
- **routeDone**：路由动画完成时触发

```javascript
Component({
  pageLifetimes: {
    show() {
      // 页面显示时，组件需要做的事情
      console.log('页面显示，组件激活')
    },
    hide() {
      // 页面隐藏时，组件需要做的事情
      console.log('页面隐藏，组件暂停')
    },
    resize(size) {
      // 页面尺寸变化
      console.log('页面尺寸变化', size)
    }
  }
})
```

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

**Q1: 如何实现兄弟组件通信？**

A: 兄弟组件通信有几种方式：
- **通过父组件中转**：子组件 A → 父组件 → 子组件 B
- **全局事件总线**：使用 getApp() 或全局变量
- **状态管理**：使用 Mobx 或其他状态管理库

```javascript
// 方式1：通过父组件中转
// 子组件 A
Component({
  methods: {
    sendToSibling() {
      this.triggerEvent('sendData', { data: 'hello' })
    }
  }
})

// 父组件
Page({
  handleSendData(e) {
    // 通过 selectComponent 调用子组件 B 的方法
    this.selectComponent('#componentB').receiveData(e.detail.data)
  }
})

// 子组件 B
Component({
  methods: {
    receiveData(data) {
      console.log('收到兄弟组件数据', data)
    }
  }
})
```

**Q2: 如何实现跨层级组件通信？**

A: 跨层级组件通信的解决方案：
- **relations 关系**：定义组件间的关系
- **全局数据**：通过 getApp().globalData
- **事件总线**：自定义事件系统
- **provide/inject**：类似 Vue 的依赖注入

```javascript
// 使用 relations 实现跨层级通信
// 祖先组件
Component({
  relations: {
    './child': {
      type: 'descendant',
      linked(target) {
        // 子孙组件被插入
        this.descendants.push(target)
      }
    }
  },
  
  data: {
    descendants: []
  },
  
  methods: {
    broadcastToDescendants(data) {
      this.data.descendants.forEach(child => {
        child.receiveFromAncestor(data)
      })
    }
  }
})
```

**Q3: externalClasses 的作用？**

A: externalClasses 用于接受外部样式类：
- **样式隔离突破**：允许外部样式影响组件内部
- **主题定制**：支持外部传入主题样式
- **灵活样式**：组件可以接受多个外部样式类

```javascript
Component({
  externalClasses: ['my-class', 'theme-class'],
  
  options: {
    addGlobalClass: true  // 也可以使用全局样式
  }
})
```

```xml
<!-- 使用组件时传入外部样式 -->
<custom-component 
  my-class="custom-style" 
  theme-class="dark-theme"
/>
```

```css
/* 外部样式文件 */
.custom-style {
  background: red;
}

.dark-theme {
  color: white;
  background: #333;
}
```

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

**Q1: 插槽的作用域是什么？**

A: 小程序插槽的作用域规则：
- **数据作用域**：插槽内容的数据来自使用组件的页面
- **样式作用域**：插槽内容的样式受组件样式隔离影响
- **事件作用域**：插槽内容的事件在使用组件的页面中处理

```xml
<!-- 组件模板 -->
<view class="wrapper">
  <slot name="header"></slot>
  <view>组件内容：{{componentData}}</view>
</view>
```

```xml
<!-- 使用组件 -->
<custom-component>
  <view slot="header">页面数据：{{pageData}}</view>
</custom-component>
```

**Q2: 如何实现作用域插槽？**

A: 小程序没有原生的作用域插槽，但可以通过以下方式模拟：
- **通过 properties 传递数据**
- **通过事件传递数据**
- **使用 template 模板**

```javascript
// 组件 JS
Component({
  properties: {
    renderHeader: Function  // 接收渲染函数
  },
  
  data: {
    componentData: { name: 'component' }
  }
})
```

```xml
<!-- 组件模板 -->
<view class="wrapper">
  <template is="{{renderHeader}}" data="{{...componentData}}" />
</view>
```

**Q3: 插槽的性能影响？**

A: 插槽对性能的影响：
- **渲染性能**：插槽内容每次都会重新渲染
- **内存占用**：插槽内容会增加组件的内存占用
- **优化建议**：避免在插槽中放置复杂的逻辑和大量数据

```javascript
// 优化插槽性能
Component({
  options: {
    pureDataPattern: /^_/  // 纯数据字段不参与渲染
  },
  
  data: {
    renderData: {},  // 参与渲染
    _cacheData: {}   // 不参与渲染
  }
})
```

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

**Q1: 页面栈溢出怎么办？**

A: 页面栈最多支持 10 层，溢出时的处理方案：
- **使用 redirectTo**：关闭当前页面，不增加页面栈
- **使用 reLaunch**：清空页面栈，重新开始
- **合理的页面设计**：避免过深的页面嵌套
- **返回首页**：提供返回首页的快捷方式

```javascript
// 检查页面栈深度
const pages = getCurrentPages()
if (pages.length >= 9) {
  // 即将溢出，使用 redirectTo
  wx.redirectTo({
    url: '/pages/target/target'
  })
} else {
  // 正常跳转
  wx.navigateTo({
    url: '/pages/target/target'
  })
}
```

**Q2: 如何实现页面返回时刷新？**

A: 页面返回时刷新数据的方法：
- **onShow 生命周期**：每次显示时刷新
- **EventChannel 通信**：页面间传递刷新标识
- **全局变量标识**：设置全局刷新标识
- **页面栈操作**：获取上一页面实例直接调用方法

```javascript
// 方法1：使用 onShow
Page({
  onShow() {
    // 每次显示都刷新数据
    this.refreshData()
  }
})

// 方法2：通过页面栈操作
// 在详情页修改数据后
const pages = getCurrentPages()
const prevPage = pages[pages.length - 2]  // 上一页
if (prevPage) {
  prevPage.setData({
    needRefresh: true
  })
}
wx.navigateBack()

// 列表页监听数据变化
Page({
  onShow() {
    if (this.data.needRefresh) {
      this.refreshData()
      this.setData({ needRefresh: false })
    }
  }
})
```

**Q3: tabBar 页面如何传参？**

A: tabBar 页面不能通过 URL 传参，解决方案：
- **全局数据**：通过 getApp().globalData
- **本地存储**：使用 wx.setStorageSync
- **页面跳转后设置**：跳转后通过页面实例设置数据
- **自定义 tabBar**：使用自定义 tabBar 支持传参

```javascript
// 方法1：全局数据
// 设置数据
getApp().globalData.tabParams = { id: 123 }
wx.switchTab({
  url: '/pages/index/index'
})

// 获取数据
Page({
  onShow() {
    const params = getApp().globalData.tabParams
    if (params) {
      this.loadData(params.id)
      getApp().globalData.tabParams = null  // 清除
    }
  }
})

// 方法2：本地存储
wx.setStorageSync('tabParams', { id: 123 })
wx.switchTab({
  url: '/pages/index/index'
})

// 获取数据
Page({
  onShow() {
    const params = wx.getStorageSync('tabParams')
    if (params) {
      this.loadData(params.id)
      wx.removeStorageSync('tabParams')  // 清除
    }
  }
})
```

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

**Q1: Observers 和 Properties 的 observer 有什么区别？**

A: 两者的主要区别：
- **触发时机**：Properties observer 在属性变化时触发，Observers 在 setData 后触发
- **监听范围**：Properties observer 只能监听单个属性，Observers 可以监听多个字段
- **功能强度**：Observers 功能更强大，支持通配符和深度监听
- **性能影响**：Observers 性能开销相对较大

```javascript
Component({
  properties: {
    count: {
      type: Number,
      observer(newVal, oldVal) {
        // Properties observer：属性变化时触发
        console.log('Properties observer', newVal, oldVal)
      }
    }
  },
  
  observers: {
    'count': function(newVal) {
      // Observers：setData 后触发
      console.log('Observers', newVal)
    }
  }
})
```

**Q2: Observers 的性能影响？**

A: Observers 对性能的影响：
- **执行频率**：每次 setData 都会检查是否需要触发
- **深度监听**：使用 `**` 通配符会增加性能开销
- **监听数量**：监听的字段越多，性能开销越大
- **优化建议**：避免在 observer 中进行复杂计算

```javascript
Component({
  observers: {
    // ❌ 性能较差：监听所有数据
    '**': function() {
      console.log('任意数据变化')
    },
    
    // ✅ 性能较好：只监听特定字段
    'user.name, user.age': function(name, age) {
      console.log('用户信息变化', name, age)
    }
  }
})
```

**Q3: 如何避免死循环？**

A: 避免 Observers 死循环的方法：
- **避免在 observer 中 setData 被监听的字段**
- **使用条件判断**：检查数据是否真的需要更新
- **使用纯数据字段**：不参与渲染的数据不会触发 observer
- **合理设计数据流**：避免循环依赖

```javascript
Component({
  observers: {
    'inputValue': function(newVal) {
      // ❌ 错误：会造成死循环
      // this.setData({
      //   inputValue: newVal.toUpperCase()
      // })
      
      // ✅ 正确：使用条件判断
      const upperValue = newVal.toUpperCase()
      if (upperValue !== newVal) {
        this.setData({
          displayValue: upperValue  // 设置不同的字段
        })
      }
    }
  }
})
```

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

**Q1: 分包预下载的时机？**

A: 分包预下载的触发时机：
- **页面首次访问时**：进入配置的页面时开始预下载
- **网络条件**：根据 network 配置（all/wifi）决定是否下载
- **下载时机**：在页面 onLoad 之后，用户操作之前的空闲时间
- **下载优先级**：按照 packages 数组的顺序依次下载

```json
{
  "preloadRule": {
    "pages/index/index": {
      "network": "wifi",           // 仅 WiFi 下预下载
      "packages": ["pack1", "pack2"]  // 预下载的分包列表
    }
  }
}
```

**Q2: 如何优化分包大小？**

A: 分包大小优化策略：
- **代码分析**：使用开发者工具分析分包大小
- **公共代码提取**：将公共代码放到主包
- **按需加载**：只在需要时加载分包
- **资源优化**：压缩图片、删除无用代码
- **依赖管理**：避免重复引入相同的库

```javascript
// 分包大小分析
const fs = require('fs')
const path = require('path')

function getPackageSize(packagePath) {
  let totalSize = 0
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir)
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        walkDir(filePath)
      } else {
        totalSize += stat.size
      }
    })
  }
  
  walkDir(packagePath)
  return totalSize
}

console.log('分包大小:', getPackageSize('./packageA'))
```

**Q3: 分包异步化是什么？**

A: 分包异步化是小程序的高级特性：
- **异步加载**：分包可以在运行时异步加载
- **占用主包体积**：异步分包不占用主包的 2MB 限制
- **使用场景**：适合低频使用的功能模块
- **加载时机**：通过 wx.loadSubpackage 手动加载

```javascript
// 异步加载分包
wx.loadSubpackage({
  name: 'asyncPackage',  // 分包名称
  success: (res) => {
    console.log('分包加载成功')
    // 可以跳转到分包页面
    wx.navigateTo({
      url: '/asyncPackage/pages/index/index'
    })
  },
  fail: (err) => {
    console.error('分包加载失败', err)
    wx.showToast({
      title: '功能暂时无法使用',
      icon: 'none'
    })
  }
})
```

```json
// app.json 配置异步分包
{
  "subpackages": [
    {
      "root": "asyncPackage",
      "name": "async",
      "pages": ["pages/index/index"],
      "independent": false
    }
  ]
}
```

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

**Q1: 云函数的冷启动问题？**

A: 云函数冷启动的影响和优化：
- **冷启动时间**：首次调用或长时间未调用时启动较慢（1-3秒）
- **影响因素**：函数大小、依赖包大小、运行环境初始化
- **优化策略**：减少依赖、使用预热、合理的函数拆分
- **预热机制**：定时调用保持函数活跃状态

```javascript
// 云函数优化示例
const cloud = require('wx-server-sdk')

// 在函数外部初始化，避免重复初始化
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  // 函数逻辑尽量简洁
  try {
    const result = await db.collection('users').get()
    return { success: true, data: result.data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

**Q2: 云数据库的权限控制？**

A: 云数据库权限控制机制：
- **安全规则**：基于用户身份和数据内容的访问控制
- **权限类型**：read（读取）、write（写入）、create（创建）、delete（删除）
- **权限范围**：可以针对集合、文档、字段设置不同权限
- **动态权限**：基于用户角色和数据状态的动态权限

```javascript
// 安全规则示例
{
  "read": "auth.uid != null",  // 只有登录用户可以读取
  "write": "auth.uid == resource.data.uid",  // 只能修改自己的数据
  "create": "auth.uid != null && request.data.uid == auth.uid",
  "delete": "auth.uid == resource.data.uid"
}

// 在云函数中进行权限检查
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  
  // 检查用户权限
  if (!OPENID) {
    return { error: '用户未登录' }
  }
  
  // 只能查询自己的数据
  const result = await db.collection('orders')
    .where({ uid: OPENID })
    .get()
  
  return result
}
```

**Q3: 云开发与自建后端的对比？**

A: 云开发与自建后端的优缺点对比：

**云开发优势**：
- **零运维**：无需服务器管理和运维
- **快速开发**：开箱即用，快速上线
- **自动扩容**：根据访问量自动扩容
- **成本较低**：按使用量付费，小项目成本低

**云开发劣势**：
- **功能限制**：受平台限制，扩展性有限
- **性能限制**：冷启动、并发限制
- **数据迁移**：数据绑定在平台上，迁移困难
- **成本控制**：大项目成本可能较高

```javascript
// 云开发适用场景判断
const projectRequirements = {
  userScale: 'small',      // 用户规模：small/medium/large
  complexity: 'simple',    // 业务复杂度：simple/medium/complex
  budget: 'limited',       // 预算：limited/medium/sufficient
  timeline: 'urgent'       // 时间要求：urgent/normal/flexible
}

function shouldUseCloudDev(requirements) {
  const { userScale, complexity, budget, timeline } = requirements
  
  // 适合云开发的场景
  if (
    (userScale === 'small' || userScale === 'medium') &&
    (complexity === 'simple' || complexity === 'medium') &&
    timeline === 'urgent'
  ) {
    return true
  }
  
  return false
}
```

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

**Q1: code 的有效期是多久？**

A: wx.login 返回的 code 有效期很短：
- **有效期**：5 分钟
- **一次性使用**：每个 code 只能使用一次
- **及时换取**：获取 code 后应立即发送到后端换取 session_key
- **失效处理**：code 失效后需要重新调用 wx.login

```javascript
// 正确的登录流程
function login() {
  wx.login({
    success: (res) => {
      const code = res.code
      
      // 立即发送到后端，避免 code 过期
      wx.request({
        url: 'https://api.example.com/login',
        method: 'POST',
        data: { code },
        success: (response) => {
          const { token } = response.data
          wx.setStorageSync('token', token)
        },
        fail: (error) => {
          console.error('登录失败', error)
          // 可能是 code 过期，重新登录
          if (error.errMsg.includes('code expired')) {
            login()  // 重新登录
          }
        }
      })
    }
  })
}
```

**Q2: session_key 的作用是什么？**

A: session_key 是微信服务器返回的会话密钥：
- **数据解密**：用于解密敏感数据（如手机号、运动数据）
- **数据校验**：验证数据的完整性和真实性
- **有效期**：没有固定有效期，但可能会刷新
- **安全存储**：只能在后端存储，不能传递给前端

```javascript
// 后端使用 session_key 解密数据
const crypto = require('crypto')

function decryptData(encryptedData, iv, sessionKey) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', 
    Buffer.from(sessionKey, 'base64'), 
    Buffer.from(iv, 'base64')
  )
  
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  
  return JSON.parse(decrypted)
}

// 解密手机号
app.post('/getPhone', (req, res) => {
  const { encryptedData, iv } = req.body
  const sessionKey = req.session.sessionKey  // 从会话中获取
  
  try {
    const phoneData = decryptData(encryptedData, iv, sessionKey)
    res.json({ phoneNumber: phoneData.phoneNumber })
  } catch (error) {
    res.status(400).json({ error: 'session_key 可能已过期' })
  }
})
```

**Q3: 如何实现自动登录？**

A: 自动登录的实现策略：
- **Token 存储**：将登录 token 存储在本地
- **Token 校验**：启动时检查 token 是否有效
- **静默刷新**：token 即将过期时自动刷新
- **登录状态管理**：全局管理登录状态

```javascript
// 自动登录实现
class AuthManager {
  constructor() {
    this.token = wx.getStorageSync('token')
    this.isLoggedIn = false
  }
  
  // 检查登录状态
  async checkLoginStatus() {
    if (!this.token) {
      return false
    }
    
    try {
      // 验证 token 是否有效
      const result = await this.validateToken(this.token)
      this.isLoggedIn = result.valid
      
      if (!result.valid) {
        // token 无效，清除本地存储
        wx.removeStorageSync('token')
        this.token = null
      }
      
      return this.isLoggedIn
    } catch (error) {
      console.error('Token 验证失败', error)
      return false
    }
  }
  
  // 自动登录
  async autoLogin() {
    const isValid = await this.checkLoginStatus()
    
    if (!isValid) {
      // 静默登录
      return this.silentLogin()
    }
    
    return true
  }
  
  // 静默登录
  async silentLogin() {
    return new Promise((resolve) => {
      wx.login({
        success: async (res) => {
          try {
            const response = await this.requestLogin(res.code)
            this.token = response.token
            wx.setStorageSync('token', this.token)
            this.isLoggedIn = true
            resolve(true)
          } catch (error) {
            console.error('静默登录失败', error)
            resolve(false)
          }
        },
        fail: () => resolve(false)
      })
    })
  }
  
  // 请求登录接口
  requestLogin(code) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://api.example.com/login',
        method: 'POST',
        data: { code },
        success: (res) => {
          if (res.data.success) {
            resolve(res.data)
          } else {
            reject(res.data.error)
          }
        },
        fail: reject
      })
    })
  }
  
  // 验证 token
  validateToken(token) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://api.example.com/validate',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => resolve(res.data),
        fail: reject
      })
    })
  }
}

// 在 app.js 中使用
App({
  async onLaunch() {
    this.authManager = new AuthManager()
    
    // 自动登录
    const loginSuccess = await this.authManager.autoLogin()
    
    if (loginSuccess) {
      console.log('自动登录成功')
    } else {
      console.log('需要用户手动登录')
    }
  }
})
```

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

**Q1: 用户拒绝授权后如何处理？**

A: 用户拒绝授权的处理策略：
- **引导重新授权**：通过友好的提示引导用户授权
- **功能降级**：提供不需要授权的基础功能
- **打开设置页**：引导用户到设置页面手动开启权限
- **记录拒绝状态**：避免重复弹出授权请求

```javascript
// 处理用户拒绝授权
function handleAuthDenied(authType) {
  wx.showModal({
    title: '授权提示',
    content: `需要您的${authType}权限才能正常使用功能，是否前往设置？`,
    confirmText: '去设置',
    cancelText: '暂不',
    success: (res) => {
      if (res.confirm) {
        // 打开设置页面
        wx.openSetting({
          success: (settingRes) => {
            if (settingRes.authSetting[`scope.${authType}`]) {
              wx.showToast({
                title: '授权成功',
                icon: 'success'
              })
              // 重新获取数据
              this.getUserInfo()
            }
          }
        })
      } else {
        // 用户选择暂不授权，提供降级功能
        this.showGuestMode()
      }
    }
  })
}

// 检查授权状态
function checkAuthStatus(scope) {
  return new Promise((resolve) => {
    wx.getSetting({
      success: (res) => {
        const authStatus = res.authSetting[scope]
        resolve(authStatus)
      },
      fail: () => resolve(false)
    })
  })
}
```

**Q2: 如何实现静默授权？**

A: 静默授权的实现方式：
- **检查授权状态**：先检查是否已授权
- **已授权直接获取**：如果已授权，直接调用 API 获取数据
- **未授权不弹窗**：未授权时不主动弹出授权框
- **合适时机引导**：在用户需要使用功能时再引导授权

```javascript
// 静默获取用户信息
async function silentGetUserInfo() {
  try {
    // 1. 检查是否已授权
    const authStatus = await checkAuthStatus('scope.userInfo')
    
    if (authStatus === true) {
      // 已授权，直接获取
      return new Promise((resolve, reject) => {
        wx.getUserInfo({
          success: (res) => resolve(res.userInfo),
          fail: reject
        })
      })
    } else if (authStatus === false) {
      // 用户明确拒绝过，不再请求
      throw new Error('用户已拒绝授权')
    } else {
      // 未授权过，返回空，不主动请求
      return null
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
    return null
  }
}

// 在合适的时机引导授权
function requestUserInfoWhenNeeded() {
  wx.showModal({
    title: '个性化推荐',
    content: '获取您的头像和昵称，为您提供更好的个性化服务',
    confirmText: '同意',
    cancelText: '暂不',
    success: (res) => {
      if (res.confirm) {
        // 用户同意后再请求授权
        this.getUserInfoWithAuth()
      }
    }
  })
}
```

**Q3: 授权信息如何存储？**

A: 授权信息的存储策略：
- **本地存储**：将用户信息存储在本地，减少重复获取
- **过期机制**：设置过期时间，定期更新用户信息
- **加密存储**：敏感信息进行加密存储
- **同步到服务器**：将用户信息同步到服务器

```javascript
// 用户信息存储管理
class UserInfoManager {
  constructor() {
    this.storageKey = 'userInfo'
    this.expireKey = 'userInfoExpire'
    this.expireDuration = 7 * 24 * 60 * 60 * 1000  // 7天过期
  }
  
  // 存储用户信息
  saveUserInfo(userInfo) {
    const data = {
      ...userInfo,
      timestamp: Date.now()
    }
    
    // 加密存储（简单示例）
    const encryptedData = this.encrypt(JSON.stringify(data))
    
    wx.setStorageSync(this.storageKey, encryptedData)
    wx.setStorageSync(this.expireKey, Date.now() + this.expireDuration)
  }
  
  // 获取用户信息
  getUserInfo() {
    try {
      const expireTime = wx.getStorageSync(this.expireKey)
      
      // 检查是否过期
      if (Date.now() > expireTime) {
        this.clearUserInfo()
        return null
      }
      
      const encryptedData = wx.getStorageSync(this.storageKey)
      if (!encryptedData) return null
      
      // 解密数据
      const decryptedData = this.decrypt(encryptedData)
      return JSON.parse(decryptedData)
    } catch (error) {
      console.error('获取用户信息失败', error)
      return null
    }
  }
  
  // 清除用户信息
  clearUserInfo() {
    wx.removeStorageSync(this.storageKey)
    wx.removeStorageSync(this.expireKey)
  }
  
  // 简单加密（实际项目中应使用更安全的加密方式）
  encrypt(data) {
    return btoa(data)
  }
  
  // 简单解密
  decrypt(data) {
    return atob(data)
  }
  
  // 同步到服务器
  async syncToServer(userInfo) {
    try {
      await wx.request({
        url: 'https://api.example.com/user/sync',
        method: 'POST',
        data: userInfo,
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        }
      })
    } catch (error) {
      console.error('同步用户信息失败', error)
    }
  }
}

// 使用示例
const userInfoManager = new UserInfoManager()

// 获取并存储用户信息
function getUserInfoAndStore() {
  wx.getUserInfo({
    success: (res) => {
      const userInfo = res.userInfo
      
      // 存储到本地
      userInfoManager.saveUserInfo(userInfo)
      
      // 同步到服务器
      userInfoManager.syncToServer(userInfo)
    }
  })
}
```

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

**Q1: 如何监控小程序性能？**

A: 小程序性能监控的方法：
- **官方性能监控**：使用 wx.reportMonitor 上报性能数据
- **自定义监控**：监控关键指标（启动时间、页面加载时间、接口响应时间）
- **用户体验监控**：监控用户操作响应时间、错误率
- **第三方监控**：使用腾讯云监控、阿里云 ARMS 等

```javascript
// 性能监控实现
class PerformanceMonitor {
  constructor() {
    this.startTime = Date.now()
    this.metrics = {}
  }
  
  // 监控页面加载时间
  monitorPageLoad(pageName) {
    const startTime = Date.now()
    
    return {
      end: () => {
        const loadTime = Date.now() - startTime
        this.reportMetric('page_load_time', {
          page: pageName,
          duration: loadTime
        })
      }
    }
  }
  
  // 监控接口响应时间
  monitorRequest(url) {
    const startTime = Date.now()
    
    return {
      success: () => {
        const responseTime = Date.now() - startTime
        this.reportMetric('api_response_time', {
          url,
          duration: responseTime,
          status: 'success'
        })
      },
      fail: (error) => {
        const responseTime = Date.now() - startTime
        this.reportMetric('api_response_time', {
          url,
          duration: responseTime,
          status: 'fail',
          error: error.errMsg
        })
      }
    }
  }
  
  // 上报性能指标
  reportMetric(metricName, data) {
    // 使用官方监控
    wx.reportMonitor(metricName, data)
    
    // 自定义上报
    wx.request({
      url: 'https://api.example.com/monitor',
      method: 'POST',
      data: {
        metric: metricName,
        data,
        timestamp: Date.now()
      }
    })
  }
}
```

**Q2: 虚拟列表的实现原理？**

A: 虚拟列表的核心原理：
- **可视区域渲染**：只渲染可视区域内的列表项
- **滚动计算**：根据滚动位置计算应该显示的数据
- **动态更新**：滚动时动态更新显示的数据
- **占位空间**：使用占位元素保持滚动条的正确高度

```javascript
// 虚拟列表核心逻辑
Component({
  properties: {
    list: Array,
    itemHeight: Number
  },
  
  data: {
    visibleList: [],
    startIndex: 0,
    totalHeight: 0
  },
  
  methods: {
    updateVisibleList() {
      const { list, itemHeight } = this.properties
      const { scrollTop, containerHeight } = this.data
      
      // 计算可见范围
      const startIndex = Math.floor(scrollTop / itemHeight)
      const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        list.length
      )
      
      // 获取可见数据
      const visibleList = list.slice(startIndex, endIndex)
      
      this.setData({ visibleList, startIndex })
    }
  }
})
```

**Q3: WXS 的使用场景？**

A: WXS（WeiXin Script）的主要使用场景：
- **频繁计算**：避免频繁的 setData 调用
- **数据格式化**：在模板中直接格式化数据
- **简单逻辑**：处理简单的业务逻辑
- **性能优化**：减少逻辑层和视图层的通信

```xml
<wxs module="utils">
  var formatPrice = function(price) {
    return '¥' + price.toFixed(2)
  }
  
  var formatTime = function(timestamp) {
    var date = getDate(timestamp)
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
  }
  
  module.exports = {
    formatPrice: formatPrice,
    formatTime: formatTime
  }
</wxs>

<view class="product">
  <text>{{utils.formatPrice(product.price)}}</text>
  <text>{{utils.formatTime(product.createTime)}}</text>
</view>
```

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

**Q1: 如何自定义下拉刷新样式？**

A: 自定义下拉刷新样式的方法：
- **配置样式**：通过 page.json 配置下拉刷新样式
- **自定义组件**：使用 scroll-view 实现自定义下拉刷新
- **动画效果**：添加加载动画和过渡效果
- **状态管理**：管理下拉刷新的各种状态

```json
// page.json 配置
{
  "enablePullDownRefresh": true,
  "backgroundColor": "#f8f8f8",
  "backgroundTextStyle": "dark",
  "onReachBottomDistance": 50
}
```

```javascript
// 自定义下拉刷新组件
Component({
  data: {
    refreshing: false,
    pullDistance: 0,
    refreshThreshold: 80
  },
  
  methods: {
    onTouchStart(e) {
      this.startY = e.touches[0].clientY
    },
    
    onTouchMove(e) {
      if (this.data.refreshing) return
      
      const currentY = e.touches[0].clientY
      const pullDistance = Math.max(0, currentY - this.startY)
      
      if (pullDistance > 0) {
        this.setData({ pullDistance })
      }
    },
    
    onTouchEnd() {
      const { pullDistance, refreshThreshold } = this.data
      
      if (pullDistance >= refreshThreshold) {
        this.triggerRefresh()
      } else {
        this.setData({ pullDistance: 0 })
      }
    },
    
    triggerRefresh() {
      this.setData({ refreshing: true })
      
      // 触发刷新事件
      this.triggerEvent('refresh', {}, {
        bubbles: true,
        composed: true
      })
    },
    
    stopRefresh() {
      this.setData({
        refreshing: false,
        pullDistance: 0
      })
    }
  }
})
```

**Q2: 如何实现触底加载的节流？**

A: 触底加载节流的实现方法：
- **防抖处理**：避免快速滚动时重复触发
- **加载状态管理**：防止重复请求
- **距离阈值**：设置合适的触底距离
- **错误重试**：加载失败时的重试机制

```javascript
Page({
  data: {
    list: [],
    loading: false,
    hasMore: true,
    page: 1
  },
  
  onReachBottom() {
    // 防止重复加载
    if (this.data.loading || !this.data.hasMore) {
      return
    }
    
    this.loadMore()
  },
  
  // 节流加载更多
  loadMore: throttle(function() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    wx.request({
      url: '/api/list',
      data: {
        page: this.data.page,
        pageSize: 20
      },
      success: (res) => {
        const newList = res.data.list || []
        
        this.setData({
          list: [...this.data.list, ...newList],
          page: this.data.page + 1,
          hasMore: newList.length === 20,
          loading: false
        })
      },
      fail: (error) => {
        this.setData({ loading: false })
        
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
      }
    })
  }, 1000),  // 1秒内只能触发一次
  
  // 重试加载
  retryLoad() {
    this.loadMore()
  }
})

// 节流函数
function throttle(fn, delay) {
  let timer = null
  return function(...args) {
    if (timer) return
    
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}
```

**Q3: 如何处理加载失败的情况？**

A: 加载失败的处理策略：
- **错误提示**：友好的错误提示信息
- **重试机制**：提供重试按钮或自动重试
- **降级处理**：提供离线数据或缓存数据
- **错误上报**：记录错误信息用于分析

```javascript
Page({
  data: {
    list: [],
    loading: false,
    error: null,
    retryCount: 0,
    maxRetry: 3
  },
  
  async loadData() {
    this.setData({ loading: true, error: null })
    
    try {
      const result = await this.requestData()
      this.setData({
        list: result.data,
        loading: false,
        retryCount: 0
      })
    } catch (error) {
      this.handleLoadError(error)
    }
  },
  
  handleLoadError(error) {
    const { retryCount, maxRetry } = this.data
    
    // 自动重试
    if (retryCount < maxRetry) {
      setTimeout(() => {
        this.setData({ retryCount: retryCount + 1 })
        this.loadData()
      }, 1000 * Math.pow(2, retryCount))  // 指数退避
      return
    }
    
    // 超过重试次数，显示错误
    this.setData({
      loading: false,
      error: {
        message: this.getErrorMessage(error),
        canRetry: true
      }
    })
    
    // 错误上报
    this.reportError(error)
  },
  
  getErrorMessage(error) {
    const errorMap = {
      'timeout': '请求超时，请检查网络连接',
      'network': '网络连接失败，请检查网络设置',
      'server': '服务器错误，请稍后重试',
      'default': '加载失败，请重试'
    }
    
    return errorMap[error.type] || errorMap.default
  },
  
  // 手动重试
  onRetry() {
    this.setData({ retryCount: 0 })
    this.loadData()
  },
  
  // 错误上报
  reportError(error) {
    wx.request({
      url: '/api/error/report',
      method: 'POST',
      data: {
        error: error.message,
        stack: error.stack,
        page: getCurrentPages().pop().route,
        timestamp: Date.now()
      }
    })
  },
  
  // 请求数据
  requestData() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: '/api/list',
        timeout: 10000,  // 10秒超时
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject({ type: 'server', message: '服务器错误' })
          }
        },
        fail: (error) => {
          if (error.errMsg.includes('timeout')) {
            reject({ type: 'timeout', message: '请求超时' })
          } else {
            reject({ type: 'network', message: '网络错误' })
          }
        }
      })
    })
  }
})
```

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

**Q1: 如何统计分享数据？**

A: 分享数据统计的实现方法：
- **分享事件监听**：监听分享成功和失败事件
- **分享参数追踪**：在分享链接中添加追踪参数
- **用户行为分析**：分析分享用户的行为路径
- **数据上报**：将分享数据上报到服务器

```javascript
Page({
  onShareAppMessage(options) {
    const shareId = this.generateShareId()
    
    // 记录分享行为
    this.recordShareAction({
      shareId,
      from: options.from,
      target: options.target,
      page: getCurrentPages().pop().route
    })
    
    return {
      title: '精彩内容分享',
      path: `/pages/detail/detail?id=123&shareId=${shareId}`,
      imageUrl: '/images/share.png',
      success: (res) => {
        // 分享成功
        this.recordShareResult(shareId, 'success', res)
      },
      fail: (error) => {
        // 分享失败
        this.recordShareResult(shareId, 'fail', error)
      }
    }
  },
  
  // 生成分享ID
  generateShareId() {
    return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  // 记录分享行为
  recordShareAction(data) {
    wx.request({
      url: '/api/share/action',
      method: 'POST',
      data: {
        ...data,
        userId: getApp().globalData.userId,
        timestamp: Date.now()
      }
    })
  },
  
  // 记录分享结果
  recordShareResult(shareId, status, result) {
    wx.request({
      url: '/api/share/result',
      method: 'POST',
      data: {
        shareId,
        status,
        result,
        timestamp: Date.now()
      }
    })
  },
  
  // 页面加载时检查是否来自分享
  onLoad(options) {
    if (options.shareId) {
      this.recordShareVisit(options.shareId)
    }
  },
  
  // 记录分享访问
  recordShareVisit(shareId) {
    wx.request({
      url: '/api/share/visit',
      method: 'POST',
      data: {
        shareId,
        visitTime: Date.now(),
        userAgent: wx.getSystemInfoSync()
      }
    })
  }
})
```

**Q2: 如何实现分享海报？**

A: 分享海报的实现方法：
- **Canvas 绘制**：使用 Canvas 绘制海报
- **图片合成**：将头像、二维码、文字等元素合成
- **保存到相册**：生成海报后保存到用户相册
- **分享到朋友圈**：引导用户分享到朋友圈

```javascript
Page({
  data: {
    posterUrl: ''
  },
  
  // 生成分享海报
  async generatePoster() {
    wx.showLoading({ title: '生成中...' })
    
    try {
      const posterUrl = await this.drawPoster()
      this.setData({ posterUrl })
      wx.hideLoading()
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      })
    }
  },
  
  // 绘制海报
  drawPoster() {
    return new Promise((resolve, reject) => {
      const query = wx.createSelectorQuery()
      query.select('#posterCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          
          // 设置画布尺寸
          const dpr = wx.getSystemInfoSync().pixelRatio
          canvas.width = 750 * dpr
          canvas.height = 1334 * dpr
          ctx.scale(dpr, dpr)
          
          // 绘制背景
          this.drawBackground(ctx)
          
          // 绘制内容
          Promise.all([
            this.drawUserAvatar(ctx),
            this.drawQRCode(ctx),
            this.drawText(ctx)
          ]).then(() => {
            // 导出图片
            wx.canvasToTempFilePath({
              canvas,
              success: (res) => resolve(res.tempFilePath),
              fail: reject
            })
          }).catch(reject)
        })
    })
  },
  
  // 绘制背景
  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 1334)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 750, 1334)
  },
  
  // 绘制用户头像
  drawUserAvatar(ctx) {
    return new Promise((resolve) => {
      const img = canvas.createImage()
      img.onload = () => {
        // 绘制圆形头像
        ctx.save()
        ctx.beginPath()
        ctx.arc(375, 200, 50, 0, 2 * Math.PI)
        ctx.clip()
        ctx.drawImage(img, 325, 150, 100, 100)
        ctx.restore()
        resolve()
      }
      img.src = getApp().globalData.userInfo.avatarUrl
    })
  },
  
  // 绘制二维码
  drawQRCode(ctx) {
    return new Promise((resolve) => {
      wx.request({
        url: '/api/qrcode/generate',
        data: { scene: 'poster_share' },
        success: (res) => {
          const img = canvas.createImage()
          img.onload = () => {
            ctx.drawImage(img, 550, 1000, 150, 150)
            resolve()
          }
          img.src = res.data.qrCodeUrl
        }
      })
    })
  },
  
  // 绘制文字
  drawText(ctx) {
    return new Promise((resolve) => {
      // 标题
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 48px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('精彩内容分享', 375, 350)
      
      // 描述
      ctx.font = '32px sans-serif'
      ctx.fillStyle = '#f0f0f0'
      this.drawMultilineText(ctx, '这里是分享的详细描述内容', 375, 450, 600, 40)
      
      resolve()
    })
  },
  
  // 绘制多行文字
  drawMultilineText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split('')
    let line = ''
    let currentY = y
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i]
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY)
        line = words[i]
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    
    ctx.fillText(line, x, currentY)
  },
  
  // 保存海报到相册
  savePoster() {
    if (!this.data.posterUrl) {
      wx.showToast({
        title: '请先生成海报',
        icon: 'none'
      })
      return
    }
    
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterUrl,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
      },
      fail: (error) => {
        if (error.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '提示',
            content: '需要您授权保存图片到相册',
            confirmText: '去授权',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting()
              }
            }
          })
        }
      }
    })
  }
})
```

**Q3: 分享到朋友圈的限制？**

A: 分享到朋友圈的限制和注意事项：
- **功能限制**：小程序无法直接分享到朋友圈
- **替代方案**：生成海报图片，引导用户手动分享
- **内容限制**：朋友圈分享内容需要符合微信规范
- **用户体验**：需要引导用户完成分享操作

```javascript
Page({
  // 分享到朋友圈（实际是生成海报）
  shareToMoments() {
    wx.showModal({
      title: '分享到朋友圈',
      content: '将为您生成精美海报，保存后可分享到朋友圈',
      confirmText: '生成海报',
      success: (res) => {
        if (res.confirm) {
          this.generateAndSavePoster()
        }
      }
    })
  },
  
  // 生成并保存海报
  async generateAndSavePoster() {
    try {
      // 生成海报
      const posterUrl = await this.generatePoster()
      
      // 保存到相册
      await this.saveToAlbum(posterUrl)
      
      // 引导用户分享
      this.showShareGuide()
    } catch (error) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },
  
  // 保存到相册
  saveToAlbum(filePath) {
    return new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath,
        success: resolve,
        fail: reject
      })
    })
  },
  
  // 显示分享引导
  showShareGuide() {
    wx.showModal({
      title: '海报已保存',
      content: '海报已保存到相册，快去朋友圈分享吧！',
      showCancel: false,
      confirmText: '知道了'
    })
  },
  
  // onShareTimeline（仅支持部分场景）
  onShareTimeline() {
    // 注意：这个API只在特定场景下有效
    return {
      title: '精彩内容分享',
      query: 'from=timeline',
      imageUrl: '/images/share.png'
    }
  }
})
```

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
