# Express.js 学习资源

> 更新时间：2025-02

## 官方资源

- [Express 官方文档](https://expressjs.com/) - 最权威的 Express 文档
- [Express API 参考](https://expressjs.com/en/4x/api.html) - 完整的 API 文档
- [Express 指南](https://expressjs.com/en/guide/routing.html) - 官方学习指南
- [Express GitHub](https://github.com/expressjs/express) - 官方 GitHub 仓库

## 中间件

- [Express 中间件列表](https://expressjs.com/en/resources/middleware.html) - 官方中间件列表
- [Helmet](https://helmetjs.github.io/) - 安全中间件
- [Morgan](https://github.com/expressjs/morgan) - HTTP 请求日志
- [CORS](https://github.com/expressjs/cors) - 跨域资源共享
- [Compression](https://github.com/expressjs/compression) - Gzip 压缩

## 最佳实践

- [Express 生产最佳实践](https://expressjs.com/en/advanced/best-practice-performance.html) - 性能优化
- [Express 安全最佳实践](https://expressjs.com/en/advanced/best-practice-security.html) - 安全加固

## MCP 查询记录

- **查询时间**：2025-02-04
- **Library ID**：`/websites/expressjs_en`
- **代码示例数量**：1366+

### 关键发现

1. **中间件机制**：按注册顺序执行，使用 next() 传递控制权
2. **错误处理**：错误处理中间件必须有 4 个参数
3. **异步处理**：Express 5 自动处理 Promise rejection
4. **路由系统**：支持路径参数、查询参数、正则表达式
5. **安全最佳实践**：使用 Helmet、CORS、输入验证、限流

---

> 本文档整理了 Express.js 学习的各类资源。
