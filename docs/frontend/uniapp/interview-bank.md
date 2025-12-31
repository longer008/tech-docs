# uni-app 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:uni-app 的多端架构？
- 标准答案:基于 Vue 语法编写，一套代码编译到小程序(HBuilderX/CLI)、H5、App(通过 uni-app+ 原生渲染/nvue)；跨端差异由条件编译处理。
- 追问点:Vue2/3 支持情况；nvue(weex) 与 vue 页面渲染差异；端能力缺口。
- 参考:https://uniapp.dcloud.net.cn/

### Q2:页面/应用生命周期？
- 标准答案:App：onLaunch/onShow/onHide；页面：onLoad/onShow/onReady/onHide/onUnload；组件: created/mounted 等；与微信小程序类似但事件名可能有差异。
- 追问点:App 端 vs 小程序端差异；nvue 生命周期；路由守卫。
- 参考:https://uniapp.dcloud.net.cn/collocation/frame/lifecycle.html

### Q3:网络与请求封装？
- 标准答案:使用 `uni.request`、`uploadFile`、`downloadFile` 跨端封装；支持拦截器（通过封装 Promise）；需配置合法域名（小程序）。
- 追问点:超时/重试；并发限制；使用 uniCloud 调用云函数。
- 参考:https://uniapp.dcloud.net.cn/api/request/request.html

### Q4:状态管理？
- 标准答案:可用 Vuex/Pinia，或全局数据 `getApp()`；需注意多端持久化与刷新；App 端可配合本地存储。
- 追问点:页面间通信；跨端一致性；模块化方案。
- 参考:https://uniapp.dcloud.net.cn/tutorial/vuex.html

### Q5:条件编译与平台差异？
- 标准答案:使用 `#ifdef/#ifndef` 处理平台差异；组件/样式/JS 均可；需避免大段条件导致维护难；优先写通用逻辑。
- 追问点:编译宏列表；构建流程；多平台包体。
- 参考:https://uniapp.dcloud.net.cn/tutorial/platform.html

### Q6:页面路由与 tabBar？
- 标准答案:路由 API 与小程序接近：navigateTo/redirectTo/reLaunch/switchTab；页面栈限制取决于目标平台；tabBar 在 `pages.json` 配置。
- 追问点:分包配置；H5 端路由模式；页面传参。
- 参考:https://uniapp.dcloud.net.cn/collocation/pages.html

### Q7:原生能力与插件市场？
- 标准答案:通过 uni 原生插件/App-plus 原生能力扩展；插件市场提供三方组件；App 端可使用 jsbridge 调用原生。
- 追问点:权限申请；多端兼容；安全审核。
- 参考:https://uniapp.dcloud.net.cn/tutorial/app-nvue-app.html

### Q8:性能优化？
- 标准答案:减少 setData/数据量；合并渲染；列表使用虚拟列表组件；App 端 nvue 原生渲染性能更好；合理使用分包。
- 追问点:图片优化；冷启动；内存占用。
- 参考:https://uniapp.dcloud.net.cn/tutorial/performance.html

## 场景/排查
### Q1:跨端样式不一致怎么办？
- 标准答案:使用 rpx/百分比等通用单位；慎用非标准 CSS；为差异性平台添加条件样式；在不同端分别调试。
- 追问点:字体/阴影差异；H5 与小程序组件兼容；nvue 样式限制。
- 参考:https://uniapp.dcloud.net.cn/tutorial/platform.html

### Q2:包体积超限或构建报错？
- 标准答案:启用分包；删除未使用资源；检查插件体积；HBuilderX/CLI 缓存清理；小程序端遵守 2M/20M 限制。
- 追问点:CI 打包；自定义组件依赖；SourceMap 配置。
- 参考:https://uniapp.dcloud.net.cn/tutorial/source.html

## 反问
### Q1:团队发布主要目标端是哪些？是否混用 nvue？
- 标准答案:影响组件选择与性能策略。
- 追问点:测试矩阵；端差异补偿；审核流程。
- 参考:团队内部规范

### Q2:公共组件/请求封装是否已有规范？
- 标准答案:确认基础库，避免重复封装；方便对齐错误码与登录流程。
- 追问点:多端 Mock；统一日志；网络重试。
- 参考:团队内部规范
