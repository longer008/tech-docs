# HTTP/HTTPS 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:HTTP/1.1、HTTP/2、HTTP/3 差异？
- 标准答案:1.1 支持持久连接与管线但有队头阻塞；2 基于单连接多路复用、二进制帧、HPACK 压缩、优先级；3 基于 QUIC(UDP) 解决握手与队头阻塞并内建 TLS1.3。
- 追问点:浏览器连接上限变化；升级/降级策略；代理兼容性。
- 参考:https://www.rfc-editor.org/rfc/rfc9114

### Q2:常见状态码语义？
- 标准答案:2xx 成功(200/201/204)、3xx 重定向(301/302/304)、4xx 客户端错误(400/401/403/404/429)、5xx 服务端错误(500/502/503/504)；幂等方法在失败后可重试。
- 追问点:307/308 与 302/301 区别；401 vs 403；429 处理。
- 参考:https://www.rfc-editor.org/rfc/rfc9110#name-status-codes

### Q3:缓存控制？
- 标准答案:强缓存(Expires/Cache-Control max-age)、协商缓存(ETag/If-None-Match、Last-Modified/If-Modified-Since)；合理设置公共/私有、no-store、s-maxage；避免敏感数据被缓存。
- 追问点:CDN 与浏览器缓存差异；Vary 头；前后端缓存一致。
- 参考:https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching

### Q4:Cookie、Session 与 Token？
- 标准答案:Cookie 为客户端存储，Session 通常在服务端；JWT/Token 无状态，携带签名；安全属性 HttpOnly/SameSite/Secure；跨域时需配合 CORS 与凭证。
- 追问点:CSRF 防护；刷新令牌；会话固定攻击。
- 参考:https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies

### Q5:跨域(CORS)的原理？
- 标准答案:通过响应头 `Access-Control-Allow-Origin/Methods/Headers/Credentials` 控制；非简单请求触发预检 OPTIONS；凭证模式下 Origin 不能为 *。
- 追问点:缓存预检 `Access-Control-Max-Age`；代理解决跨域；安全风险。
- 参考:https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

### Q6:HTTPS/TLS 握手流程？
- 标准答案:TLS1.2 及以前需多次往返交换随机数、证书、密钥协商；TLS1.3 简化握手，支持 1-RTT/0-RTT；证书链校验、SNI、ALPN 协商协议。
- 追问点:OCSP Stapling；HSTS；中间人攻击防护。
- 参考:https://www.rfc-editor.org/rfc/rfc8446

### Q7:幂等性与安全性（safe）？
- 标准答案:GET/HEAD/OPTIONS/TRACE 为安全操作不应修改资源；PUT/DELETE 幂等，POST 非幂等；设计接口时遵循以便重试与缓存。
- 追问点:PATCH 幂等性；重试策略；防重处理。
- 参考:https://www.rfc-editor.org/rfc/rfc9110

### Q8:HTTP 连接复用与队头阻塞？
- 标准答案:HTTP/1.1 pipeline 仍受 TCP 队头阻塞；HTTP/2/3 多路复用减轻；TCP 慢启动影响首包；可使用连接池、预连接、域分片（已过时）。
- 追问点:HOL 在浏览器层 vs TCP 层；预加载/预取；首字节时间优化。
- 参考:https://developer.mozilla.org/en-US/docs/Web/Performance/HTTP_2

## 场景/排查
### Q1:接口出现 499/504，如何排查？
- 标准答案:确认是否客户端主动断开(499)或网关超时(504)；检查上游超时配置、后端性能；抓取链路日志与 trace；必要时开启重试/降级。
- 追问点:超时分层设置(浏览器、网关、服务)；长轮询/流式响应；连接池耗尽。
- 参考:https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

### Q2:HTTPS 握手耗时高的优化？
- 标准答案:启用 TLS1.3、Session Resumption/0-RTT；配置 OCSP Stapling；使用 CDN 边缘终止；选择合适的证书与密钥长度。
- 追问点:HTTP/3 支持情况；证书续期自动化；性能监控。
- 参考:https://www.rfc-editor.org/rfc/rfc8446

## 反问
### Q1:网关/负载均衡的超时与重试策略？
- 标准答案:了解流控与可靠性要求，便于接口设计。
- 追问点:熔断/限流；幂等性保障；日志采集。
- 参考:团队内部规范

### Q2:安全策略要求（HSTS、CSP、CORS 白名单）？
- 标准答案:确认必须的安全头与合规要求，避免上线受阻。
- 追问点:证书管理；敏感数据传输；安全扫描流程。
- 参考:团队内部规范
