# 微信小程序

## 元信息
- 定位与场景：微信生态内轻量应用，强调性能与安全规范。
- 版本范围：以官方稳定版本为准。
- 相关生态：云开发、订阅消息、支付。

## 研究记录（Exa）
- 查询 1："wechat mini program interview questions 2024 2025"
- 查询 2："wechat mini program best practices documentation"
- 查询 3："wechat mini program lifecycle"
- 来源摘要：以官方开发文档为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：页面生命周期有哪些？
  - A：onLoad/onShow/onReady/onHide/onUnload。
- Q2：`setData` 的性能影响？
  - A：更新频繁或数据大时成本高。
- Q3：分包与预加载机制？
  - A：按业务拆分包提升首屏。
- Q4：组件通信方式？
  - A：属性传递、事件回调、全局状态。
- Q5：小程序与 H5 的主要差异？
  - A：运行环境与 API 能力不同。

### 进阶/场景题
- Q1：如何优化首屏渲染？
  - A：分包、图片优化、减少首屏数据量。
- Q2：如何处理权限与安全审核？
  - A：遵循官方规范与最小权限原则。

### 避坑指南
- setData 过大导致卡顿。
- 使用不规范 API 导致审核问题。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- 小程序官方文档：https://developers.weixin.qq.com/miniprogram/dev/framework/
- 生命周期：https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page-life-cycle.html
```

### 常用代码片段
```js
Page({
  onLoad() {
    // 页面初始化
  },
  onShow() {
    // 页面显示
  }
})
```

### 版本差异
- API 能力持续演进。
- 升级以官方更新日志为准。
