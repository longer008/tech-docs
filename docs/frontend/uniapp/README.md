# Uniapp

## 元信息
- 定位与场景：跨端开发框架，覆盖 H5、App、微信小程序等。
- 版本范围：以官方稳定版本为准。
- 相关生态：uni_modules、条件编译、原生能力扩展。

## 研究记录（Exa）
- 查询 1："uni-app interview questions 2024 2025"
- 查询 2："uni-app best practices documentation"
- 查询 3："uni-app pages.json"
- 来源摘要：以官方文档为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：`pages.json` 的作用？
  - A：配置页面路由、导航栏、tabBar 与分包。
- Q2：Uniapp 生命周期与 Vue 生命周期差异？
  - A：页面/应用有独立生命周期。
- Q3：条件编译如何处理多端差异？
  - A：使用 `#ifdef`/`#endif`。
- Q4：跨端组件如何组织？
  - A：统一组件目录 + 平台差异组件。
- Q5：常见平台差异点？
  - A：权限、API 支持、性能表现。

### 进阶/场景题
- Q1：如何优化首屏与包体大小？
  - A：分包加载与静态资源优化。
- Q2：如何设计统一请求与缓存层？
  - A：封装请求与错误处理。

### 避坑指南
- 平台差异未隔离导致运行异常。
- 路由配置不一致导致页面跳转错误。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Uniapp 官方文档：https://uniapp.dcloud.net.cn/
- 项目结构：https://uniapp.dcloud.net.cn/tutorial/project.html
- 路由配置：https://uniapp.dcloud.net.cn/collocation/pages.html
- 页面生命周期：https://uniapp.dcloud.net.cn/tutorial/page.html
```

### 常用代码片段
```js
// 跳转示例
uni.navigateTo({ url: '/pages/detail/detail?id=1' })
```

### 版本差异
- 平台能力与 API 支持随版本变化。
- 升级以官方 Release Notes 为准。
