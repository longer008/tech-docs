# uni-app 学习资源

> 更新时间：2025-02

## 目录导航

- [官方资源](#官方资源)
- [学习教程](#学习教程)
- [组件库](#组件库)
- [实战项目](#实战项目)
- [开发工具](#开发工具)
- [社区资源](#社区资源)
- [MCP 查询记录](#mcp-查询记录)

## 官方资源

### 文档

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/) - 完整的官方文档，包含教程、API、组件等
- [uni-app 插件市场](https://ext.dcloud.net.cn/) - 丰富的插件、模板、组件
- [DCloud 社区](https://ask.dcloud.net.cn/) - 官方社区论坛，问答交流
- [uni-app GitHub](https://github.com/dcloudio/uni-app) - 开源仓库，可以查看源码和提交 Issue

### 工具

- [HBuilderX](https://www.dcloud.io/hbuilderx.html) - 官方 IDE，内置 uni-app 开发环境
- [uni-app CLI](https://uniapp.dcloud.net.cn/quickstart-cli.html) - 命令行工具，支持 Vue CLI 项目
- [uni-app 开发者工具](https://uniapp.dcloud.net.cn/tutorial/run/) - 各平台开发者工具配置

### API 参考

- [uni-app API](https://uniapp.dcloud.net.cn/api/) - 完整的 API 文档
- [uni-app 组件](https://uniapp.dcloud.net.cn/component/) - 内置组件文档
- [条件编译](https://uniapp.dcloud.net.cn/tutorial/platform.html) - 跨端差异处理

## 学习教程

### 入门教程

- [uni-app 快速上手](https://uniapp.dcloud.net.cn/quickstart.html) - 官方快速入门指南
- [uni-app 从入门到实战](https://www.bilibili.com/video/BV1BJ411W7pX/) - B站视频教程（黑马程序员）
- [uni-app 零基础入门](https://www.imooc.com/learn/1343) - 慕课网免费课程
- [uni-app 实战教程](https://juejin.cn/post/6844904074766262279) - 掘金详细教程

### 进阶教程

- [uni-app 性能优化](https://uniapp.dcloud.net.cn/tutorial/performance.html) - 官方性能优化指南
- [uni-app 跨端开发实践](https://juejin.cn/post/7000000000000000000) - 跨端开发经验分享
- [uni-app 插件开发](https://uniapp.dcloud.net.cn/plugin/) - 插件开发指南
- [uni-app 原生插件开发](https://nativesupport.dcloud.net.cn/) - 原生插件开发文档

### 视频课程

- [uni-app 商城实战](https://www.bilibili.com/video/BV1Zt411e7fg/) - B站完整商城项目
- [uni-app 社交应用开发](https://www.bilibili.com/video/BV1Zt411e7fg/) - 社交应用实战
- [uni-app 企业级项目实战](https://coding.imooc.com/class/526.html) - 慕课网付费课程

## 组件库

### UI 组件库

**1. uni-ui（官方）**
- [官网](https://uniapp.dcloud.net.cn/component/uniui/uni-ui.ht
e.hcoder.net/)
- 特点：组件丰富、支持多端
- 使用：通过插件市场导入

### 工具库

**1. luch-request**
- [GitHub](https://github.com/lei-mu/luch-request)
- 功能：HTTP 请求库，支持拦截器、Promise
- 安装：`npm install luch-request`

**2. uni-simple-router**
- [GitHub](https://github.com/SilurianYang/uni-simple-router)
- 功能：路由管理，类似 Vue Router
- 安装：`npm install uni-simple-router`

**3. uni-read-pages**
- [GitHub](https://github.com/SilurianYang/uni-read-pages)
- 功能：读取 pages.json 配置
- 安装：`npm install uni-read-pages`

**4. uni-ajax**
- [GitHub](https://github.com/ponjs/uni-ajax)
- 功能：基于 Promise 的 HTTP 库
- 安装：`npm install @uni-helper/uni-ajax`

## 实战项目

### 开源项目

**1. uni-shop（官方商城）**
- [GitHub](https://github.com/dcloudio/uni-shop)
- 描述：官方商城示例项目
- 技术栈：uni-app + Vue 3 + Pinia

**2. hello-uniapp（官方示例）**
- [GitHub](https://github.com/dcloudio/hello-uniapp)
- 描述：官方示例项目，包含所有组件和 API 示例
- 技术栈：uni-app + Vue 2

**3. 仿网易云音乐**
- [GitHub](https://github.com/SuiXinTop/uni-app-music)
- 描述：高仿网易云音乐小程序
- 技术栈：uni-app + Vue 2 + Vuex

**4. 仿美团外卖**
- [GitHub](https://github.com/itmanyong/uni-app-meituan)
- 描述：仿美团外卖小程序
- 技术栈：uni-app + Vue 2

**5. 社交应用**
- [GitHub](https://github.com/liuxiaoyucc/uni-app-moments)
- 描述：类似朋友圈的社交应用
- 技术栈：uni-app + Vue 2 + Vuex

**6. 新闻资讯**
- [GitHub](https://github.com/F-loat/ithome-lite)
- 描述：IT之家 Lite 版
- 技术栈：uni-app + Vue 2

### 项目模板

**1. uni-preset-vue（官方模板）**
- [GitHub](https://github.com/dcloudio/uni-preset-vue)
- 描述：官方 Vue 3 + Vite 模板
- 使用：`npx degit dcloudio/uni-preset-vue#vite my-project`

**2. uni-app-template**
- [GitHub](https://github.com/zhetengbiji/uniapp-template)
- 描述：包含常用配置和工具的模板
- 技术栈：uni-app + Vue 3 + TypeScript + Pinia

**3. uni-app-best-practice**
- [GitHub](https://github.com/itmanyong/uni-app-best-practice)
- 描述：最佳实践模板
- 技术栈：uni-app + Vue 3 + TypeScript

## 开发工具

### IDE 和编辑器

**1. HBuilderX**
- [下载](https://www.dcloud.io/hbuilderx.html)
- 特点：官方 IDE、内置 uni-app 开发环境、代码提示完善
- 推荐：初学者使用

**2. VS Code**
- [下载](https://code.visualstudio.com/)
- 插件：
  - [uni-app-snippets](https://marketplace.visualstudio.com/items?itemName=ModyQyW.vscode-uni-app-snippets) - 代码片段
  - [uni-helper](https://marketplace.visualstudio.com/items?itemName=uni-helper.uni-helper-vscode) - 代码提示
  - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3 支持
- 推荐：有 Vue 开发经验的开发者

### 调试工具

**1. 微信开发者工具**
- [下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 用途：微信小程序调试

**2. 支付宝开发者工具**
- [下载](https://opendocs.alipay.com/mini/ide/download)
- 用途：支付宝小程序调试

**3. Chrome DevTools**
- 用途：H5 端调试

**4. Android Studio / Xcode**
- 用途：App 端调试

### 辅助工具

**1. uni-app 代码生成器**
- [在线工具](https://uniapp.dcloud.net.cn/quickstart-cli.html)
- 功能：快速生成页面、组件代码

**2. rpx 转换工具**
- [在线工具](https://www.bejson.com/convert/px2rpx/)
- 功能：px 和 rpx 单位转换

**3. 图片压缩工具**
- [TinyPNG](https://tinypng.com/) - 在线图片压缩
- [ImageOptim](https://imageoptim.com/) - Mac 图片压缩工具

## 社区资源

### 问答社区

- [DCloud 社区](https://ask.dcloud.net.cn/explore/) - 官方问答社区
- [Stack Overflow](https://stackoverflow.com/questions/tagged/uniapp) - 国际问答社区
- [掘金](https://juejin.cn/tag/uni-app) - 中文技术社区
- [SegmentFault](https://segmentfault.com/t/uniapp) - 中文技术问答

### 技术博客

- [uni-app 官方博客](https://ask.dcloud.net.cn/explore/category-12) - 官方技术文章
- [掘金 uni-app 专栏](https://juejin.cn/tag/uni-app) - 社区技术文章
- [CSDN uni-app 专栏](https://blog.csdn.net/nav/mobile/uniapp) - 技术博客

### 微信群/QQ群

- uni-app 官方 QQ 群：531031261
- DCloud 开发者群：多个技术交流群（见官网）

### 社交媒体

- [uni-app 官方微博](https://weibo.com/dcloudio)
- [DCloud 官方公众号](https://mp.weixin.qq.com/s/xxx) - 微信搜索"DCloud"

## MCP 查询记录

### 查询历史

**查询 1：uni-app 官方文档**
- Library ID: `/dcloudio/unidocs-zh`
- 查询内容：uni-app 核心概念、跨端架构、生命周期
- 关键发现：
  - uni-app 基于 Vue.js，一套代码多端运行
  - 支持 iOS、Android、H5、小程序等平台
  - 通过编译器将 Vue 代码编译成不同平台的代码

**查询 2：uni-app 官网内容**
- Library ID: `/websites/uniapp_dcloud_net_cn`
- 查询内容：路由导航、条件编译、状态管理、网络请求
- 关键发现：
  - 提供 5 个路由 API：navigateTo、redirectTo、navigateBack、switchTab、reLaunch
  - 条件编译是处理跨端差异的核心机制
  - 支持 Vuex 和 Pinia 状态管理
  - 网络请求使用 uni.request API

**查询 3：uni-app 性能优化**
- Library ID: `/dcloudio/unidocs-zh`
- 查询内容：分包加载、性能优化、最佳实践
- 关键发现：
  - 分包可以优化小程序启动速度
  - 支持虚拟列表、图片懒加载、骨架屏等优化方案
  - nvue 使用原生渲染，性能更好

### 关键技术点

1. **跨端架构**：
   - 编译器将 Vue 代码编译成不同平台的代码
   - Web 渲染（H5、小程序）和原生渲染（App - nvue）

2. **条件编译**：
   - 使用 `#ifdef`、`#ifndef`、`#endif` 处理平台差异
   - 支持 JS、CSS、模板的条件编译

3. **生命周期**：
   - 应用生命周期：onLaunch、onShow、onHide
   - 页面生命周期：onLoad、onShow、onReady、onHide、onUnload
   - 组件生命周期：Vue 组件生命周期

4. **路由导航**：
   - navigateTo：保留当前页面，跳转到新页面
   - redirectTo：关闭当前页面，跳转到新页面
   - navigateBack：返回上一页或多级页面
   - switchTab：跳转到 tabBar 页面
   - reLaunch：关闭所有页面，打开新页面

5. **性能优化**：
   - 分包加载：优化小程序启动速度
   - 虚拟列表：处理大数据量渲染
   - 图片优化：压缩、懒加载、WebP 格式
   - nvue 原生渲染：适合复杂列表、视频等场景

### 学习建议

1. **入门阶段**：
   - 学习 Vue.js 基础（如果不熟悉）
   - 阅读官方文档，了解核心概念
   - 跟随官方教程创建第一个项目
   - 学习 pages.json 和 manifest.json 配置

2. **进阶阶段**：
   - 学习条件编译，处理跨端差异
   - 掌握状态管理（Vuex/Pinia）
   - 学习网络请求封装和错误处理
   - 了解分包加载和性能优化

3. **实战阶段**：
   - 参考开源项目，学习最佳实践
   - 开发完整的跨端应用
   - 学习原生插件开发（如需要）
   - 关注官方更新和社区动态

---

> 本文档整理了 uni-app 的学习资源，包括官方文档、教程、组件库、实战项目等，帮助开发者快速上手和深入学习 uni-app 跨端开发。
