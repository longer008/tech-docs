# 微信小程序参考资源

> 更新时间：2025-02

## 官方资源

### 官方文档

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
  - 框架、组件、API 完整文档
  - 最权威的学习资料

- [小程序开发指南](https://developers.weixin.qq.com/ebook?action=get_post_info&docid=0008aeea9a8978ab0086a685851c0a)
  - 官方电子书
  - 系统性学习小程序开发

- [小程序设计指南](https://developers.weixin.qq.com/miniprogram/design/)
  - 设计规范和最佳实践
  - UI/UX 设计指导

### 官方工具

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
  - 代码编辑、调试、预览
  - 必备开发工具

- [小程序助手](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/getstart.html#%E5%B0%8F%E7%A8%8B%E5%BA%8F%E5%8A%A9%E6%89%8B)
  - 小程序管理和数据查看
  - 移动端管理工具

## 学习教程

### 入门教程

- [小程序快速入门](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/)
  - 官方快速入门教程
  - 适合零基础学习

- [小程序开发实战](https://developers.weixin.qq.com/community/develop/article/doc/000c4e433707c072c1793e56f5c813)
  - 实战项目教程
  - 从零到一开发小程序

### 进阶教程

- [小程序性能优化](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/)
  - 性能优化最佳实践
  - 提升用户体验

- [小程序云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
  - 云开发完整教程
  - 无需搭建服务器

## 组件库

### UI 组件库

- [WeUI](https://git
 实战项目

### 开源项目

- [wechat-weapp-mall](https://github.com/EastWorld/wechat-app-mall)
  - 电商小程序
  - 完整的商城功能

- [NideShop](https://github.com/tumobi/nideshop-mini-program)
  - 开源商城小程序
  - Node.js 后端

- [wechat-weapp-gank](https://github.com/lypeer/wechat-weapp-gank)
  - Gank.io 小程序
  - 学习参考项目

### 示例项目

- [小程序示例](https://github.com/wechat-miniprogram/miniprogram-demo)
  - 官方示例项目
  - 涵盖各种功能

## 社区资源

### 技术社区

- [微信开放社区](https://developers.weixin.qq.com/community/develop/mixflow)
  - 官方技术社区
  - 问题讨论和解答

- [掘金 - 小程序专栏](https://juejin.cn/tag/%E5%B0%8F%E7%A8%8B%E5%BA%8F)
  - 技术文章和教程
  - 开发经验分享

### 博客文章

- [小程序性能优化实践](https://developers.weixin.qq.com/community/develop/article/doc/000044e3bb81a8a2f5ba0c6b756813)
  - 性能优化经验
  - 实战案例分析

- [小程序架构设计](https://developers.weixin.qq.com/community/develop/article/doc/0000e4c9290bc069f3380e7645b813)
  - 架构设计思路
  - 最佳实践分享

## MCP 查询记录

### 查询历史

本文档在编写过程中使用了 MCP Context7 查询以下内容：

1. **微信小程序官方文档**
   - Library ID: `/websites/developers_weixin_qq_miniprogram_dev_framework`
   - 查询内容：核心架构、生命周期、组件化、路由导航、分包加载、云开发
   - 代码示例：64,879 个

2. **微信小程序组件文档**
   - Library ID: `/websites/developers_weixin_qq_miniprogram_dev_component`
   - 查询内容：view、text、image、button、input、form 等组件
   - 代码示例：858 个

### 关键发现

1. **双线程架构**
   - 视图层和逻辑层分离
   - 通过 JSBridge 通信
   - setData 需要序列化和反序列化

2. **生命周期**
   - App、Page、Component 三个层级
   - 执行顺序：created → attached → ready → detached
   - pageLifetimes 用于监听页面生命周期

3. **组件通信**
   - Properties（父传子）
   - Events（子传父）
   - selectComponent（获取实例）
   - Behaviors（代码复用）

4. **分包加载**
   - 主包 ≤ 2MB，总包 ≤ 20MB
   - 普通分包、独立分包、分包预下载
   - 优化首屏加载速度

5. **性能优化**
   - setData 优化：批量更新、纯数据字段
   - 长列表优化：虚拟列表、分页加载
   - 图片优化：压缩、懒加载、CDN

## 学习路径

### 初级阶段（1-2 周）

1. **基础概念**
   - 小程序架构和原理
   - WXML、WXSS、JS 基础
   - 生命周期和路由

2. **基础开发**
   - 页面开发和布局
   - 数据绑定和事件处理
   - 组件使用

### 中级阶段（2-4 周）

1. **组件化开发**
   - 自定义组件
   - 组件通信
   - 插槽和样式隔离

2. **数据管理**
   - setData 优化
   - 数据监听器
   - 全局状态管理

3. **网络请求**
   - wx.request 使用
   - 请求封装
   - 错误处理

### 高级阶段（4-8 周）

1. **性能优化**
   - 首屏优化
   - setData 优化
   - 长列表优化

2. **工程化**
   - 分包加载
   - 代码规范
   - 自动化部署

3. **云开发**
   - 云函数
   - 云数据库
   - 云存储

## 常见问题

### 开发问题

1. **页面栈溢出**
   - 问题：页面栈最多 10 层
   - 解决：使用 redirectTo 或 reLaunch

2. **setData 数据过大**
   - 问题：单次 setData 数据过大导致卡顿
   - 解决：分批更新或使用局部更新

3. **图片加载失败**
   - 问题：图片加载失败显示空白
   - 解决：使用默认图片

### 性能问题

1. **首屏加载慢**
   - 问题：首屏加载时间过长
   - 解决：分包、骨架屏、图片懒加载

2. **长列表卡顿**
   - 问题：长列表滚动卡顿
   - 解决：虚拟列表、分页加载

3. **频繁 setData**
   - 问题：频繁调用 setData 导致卡顿
   - 解决：批量更新、节流防抖

## 更新日志

### 2025-02

- ✅ 基于 MCP Context7 查询最新官方文档
- ✅ 补充核心概念和架构原理
- ✅ 添加 60+ 个可运行代码示例
- ✅ 完善性能优化和最佳实践
- ✅ 添加实战场景和常见问题

---

> 本文档持续更新，欢迎补充和完善。所有内容基于微信小程序官方文档和 MCP Context7 查询结果。
