# Koa.js 学习资源

> 更新时间：2025-02

## 官方资源

- [Koa 官方文档](https://koajs.com/) - 最权威的 Koa 文档
- [Koa GitHub](https://github.com/koajs/koa) - 官方 GitHub 仓库
- [@koa/router](https://github.com/koajs/router) - 官方路由中间件
- [Koa 中间件列表](https://github.com/koajs/koa/wiki) - 社区中间件

## 常用中间件

- [koa-bodyparser](https://github.com/koajs/bodyparser) - 请求体解析
- [@koa/multer](https://github.com/koajs/multer) - 文件上传
- [koa-static](https://github.com/koajs/static) - 静态文件服务
- [koa-session](https://github.com/koajs/session) - Session 管理
- [@koa/cors](https://github.com/koajs/cors) - CORS 支持
- [koa-helmet](https://github.com/venables/koa-helmet) - 安全头
- [koa-compress](https://github.com/koajs/compress) - 压缩
- [koa-logger](https://github.com/koajs/logger) - 日志

## MCP 查询记录

- **查询时间**：2025-02-04
- **Library ID**：`/koajs/koa`
- **代码示例数量**：373+

### 关键发现

1. **洋葱模型**：中间件先进后出，便于前后处理
2. **Async/Await**：原生支持，避免回调地狱
3. **Context 对象**：封装 req 和 res，提供更友好的 API
4. **错误处理**：基于 try-catch，更容易捕获异步错误
5. **轻量级**：核心代码极简，不绑定任何中间件

---

> 本文档整理了 Koa.js 学习的各类资源。
