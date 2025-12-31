# 微信小程序 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:小程序运行架构与线程模型？
- 标准答案:逻辑层运行在独立 JS 环境(基础库)，视图层用 WebView(多 WebView 组合)；二者通过 JSBridge 通信；耗时操作应放在逻辑层/云函数，避免频繁 setData。
- 追问点:setData 开销来源；多 WebView 页面切换；Worker 的使用。
- 参考:https://developers.weixin.qq.com/miniprogram/dev/framework/

### Q2:App/Page/Component 生命周期？
- 标准答案:App: onLaunch/onShow/onHide/onError；Page: onLoad→onShow→onReady→onHide→onUnload；Component: created/attached/ready/moved/detached；需在对应钩子做初始化与清理。
- 追问点:页面返回触发顺序；onShow 与 onLoad 的区别；组件的 lifetimes 配置。
- 参考:https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/lifecycle.html

### Q3:setData 最佳实践？
- 标准答案:只更新变化的字段；避免大对象/频繁调用；可使用局部组件状态或自定义渲染层方案；批量更新时合并调用。
- 追问点:why setData 需要序列化；数据量上限；避免 setData 后立即读取未同步的 DOM。
- 参考:https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/#setdata

### Q4:组件化与通信？
- 标准答案:自定义组件 props/observers、`triggerEvent` 冒泡；全局事件总线或状态管理（mobx-miniprogram）；插槽 slot 支持；注意组件样式隔离。
- 追问点:externalClasses；纯数据字段 pureData；behavior 复用。
- 参考:https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/

### Q5:路由与页面栈限制？
- 标准答案:页面栈最多 10 层，`navigateTo` 压栈，`redirectTo`/`reLaunch`/`switchTab` 替换；tabBar 页面不可 `navigateTo`；注意栈溢出。
- 追问点:返回携带数据；自定义路由库；页面状态恢复。
- 参考:https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/route.html

### Q6:权限与登录流程？
- 标准答案:通过 wx.login 换取临时 code，再到服务端使用 session_key；敏感接口需用户授权(scope)；建议使用自定义登录态+会话续期；隐私合规需最小化数据采集。
- 追问点:session_key 过期处理；open-type=getUserInfo 变更；手机号获取流程。
- 参考:https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html

### Q7:网络与域名白名单？
- 标准答案:wx.request/websocket/uploadFile 等需在管理后台配置合法域名(https)；不支持 http；可用云开发免域名；请求并发限制 10 条。
- 追问点:超时/重试；mock 调试；CDN 缓存。
- 参考:https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html

### Q8:云开发与本地服务对比？
- 标准答案:云开发提供云函数/云数据库/云存储，免服务器运维，适合快速原型；复杂业务或合规要求可选择自建后端。
- 追问点:冷启动；资源配额；灰度发布。
- 参考:https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html

## 场景/排查
### Q1:页面卡顿/渲染慢如何优化？
- 标准答案:减少 setData 次数与数据量；使用分包/预加载；图像压缩与懒加载；避免在页面层做重计算，可用 worker/云函数。
- 追问点:渲染层/逻辑层分离瓶颈；使用 Canvas 的性能；长列表虚拟化。
- 参考:https://developers.weixin.qq.com/miniprogram/dev/framework/performance/

### Q2:小程序包体积超限？
- 标准答案:主包 <=2M，分包总计 <=20M；使用分包/独立分包；公共资源放分包或 CDN；剔除未用文件与 source map。
- 追问点:分包预下载；静态资源缓存；热更新限制。
- 参考:https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages.html

## 反问
### Q1:是否使用云开发还是自建后端？安全合规要求？
- 标准答案:影响登录、存储、部署路径。
- 追问点:数据出境限制；第三方 SDK 审核；日志留存。
- 参考:团队内部规范

### Q2:组件库/设计体系？
- 标准答案:确认是否统一使用原生组件/第三方(WeUI、Vant Weapp)，避免重复建设。
- 追问点:定制主题；无障碍要求；多端一致性。
- 参考:团队内部规范
