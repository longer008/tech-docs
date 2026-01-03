# HTTP/HTTPS

## 元信息
- 定位与场景：Web 基础协议，支撑 REST/API 通信。
- 版本范围：HTTP/1.1、HTTP/2、HTTP/3。
- 相关生态：TLS、缓存与安全头。

## 研究记录（Exa）
- 查询 1："HTTP interview questions 2024 2025"
- 查询 2："HTTPS TLS handshake"
- 查询 3："MDN HTTP documentation"
- 来源摘要：以 MDN 官方文档为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：HTTP 方法与幂等性？
  - A：GET/PUT/DELETE 幂等；POST 非幂等。
- Q2：常见状态码含义？
  - A：200/201/400/401/404/500。
- Q3：HTTPS 的核心价值？
  - A：加密传输与身份校验。
- Q4：缓存控制的核心头？
  - A：Cache-Control/ETag/Last-Modified。
- Q5：HTTP/2 与 HTTP/1.1 的差异？
  - A：多路复用与头部压缩。

### 进阶/场景题
- Q1：如何设计安全的 API？
  - A：HTTPS、鉴权、限流、CORS。
- Q2：如何排查慢请求？
  - A：关注缓存、压缩、连接复用。

### 避坑指南
- 错误使用状态码导致语义混乱。
- 缺少缓存策略导致性能问题。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- MDN HTTP：https://developer.mozilla.org/zh-CN/docs/Web/HTTP
- HTTP 缓存：https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
```

### 常用代码片段
```txt
# 常见响应头
Cache-Control: max-age=60
ETag: "abc123"
```

### 版本差异
- HTTP/2、HTTP/3 在性能与传输上改进明显。
- 升级以标准与浏览器支持为准。
