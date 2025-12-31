# HTTP/HTTPS 面试题集

> 网络协议核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. HTTP 基础

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP 请求/响应                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  请求报文：                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ GET /index.html HTTP/1.1          <- 请求行          │   │
│  │ Host: www.example.com             <- 请求头          │   │
│  │ User-Agent: Mozilla/5.0                              │   │
│  │ Accept: text/html                                    │   │
│  │ Connection: keep-alive                               │   │
│  │                                   <- 空行            │   │
│  │ [请求体]                          <- 可选            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  响应报文：                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ HTTP/1.1 200 OK                   <- 状态行          │   │
│  │ Content-Type: text/html           <- 响应头          │   │
│  │ Content-Length: 1234                                 │   │
│  │ Cache-Control: max-age=3600                          │   │
│  │                                   <- 空行            │   │
│  │ <!DOCTYPE html>...                <- 响应体          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**HTTP 方法：**
| 方法 | 说明 | 幂等 | 安全 |
|------|------|------|------|
| GET | 获取资源 | 是 | 是 |
| POST | 创建资源 | 否 | 否 |
| PUT | 更新资源（完整） | 是 | 否 |
| PATCH | 更新资源（部分） | 否 | 否 |
| DELETE | 删除资源 | 是 | 否 |
| HEAD | 获取响应头 | 是 | 是 |
| OPTIONS | 获取支持的方法 | 是 | 是 |

**状态码：**
| 范围 | 类别 | 常见状态码 |
|------|------|-----------|
| 1xx | 信息 | 100 Continue, 101 Switching Protocols |
| 2xx | 成功 | 200 OK, 201 Created, 204 No Content |
| 3xx | 重定向 | 301 永久, 302 临时, 304 Not Modified |
| 4xx | 客户端错误 | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found |
| 5xx | 服务端错误 | 500 Internal Error, 502 Bad Gateway, 503 Service Unavailable |

---

#### 2. HTTP 版本对比

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP 版本演进                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HTTP/1.0：                                                 │
│  - 每次请求建立新连接                                        │
│  - 无法复用连接                                              │
│                                                              │
│  HTTP/1.1：                                                 │
│  - 持久连接（keep-alive）                                   │
│  - 管道化（pipelining，实践中问题多）                        │
│  - 队头阻塞问题                                              │
│                                                              │
│  HTTP/2：                                                   │
│  - 二进制分帧                                               │
│  - 多路复用（解决队头阻塞）                                  │
│  - 头部压缩（HPACK）                                        │
│  - 服务器推送                                               │
│  - 单个 TCP 连接                                            │
│                                                              │
│  HTTP/3：                                                   │
│  - 基于 QUIC（UDP）                                         │
│  - 解决 TCP 队头阻塞                                        │
│  - 0-RTT 连接建立                                           │
│  - 连接迁移                                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**HTTP/2 多路复用：**
```
HTTP/1.1（队头阻塞）：
连接1: [请求1] [响应1] [请求2] [响应2]
连接2: [请求3] [响应3] [请求4] [响应4]
...

HTTP/2（多路复用）：
单连接: [帧1][帧3][帧2][帧4][帧1][帧2]...
        └─流1─┘└─流2─┘    交错传输
```

---

#### 3. HTTPS 原理

```
┌─────────────────────────────────────────────────────────────┐
│                    TLS 握手过程                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Client                                          Server     │
│    │                                               │        │
│    │ ─────── ClientHello ─────────────────────▶  │        │
│    │         (支持的加密套件、随机数)              │        │
│    │                                               │        │
│    │ ◀─────── ServerHello ─────────────────────  │        │
│    │          (选择的加密套件、随机数)             │        │
│    │                                               │        │
│    │ ◀─────── Certificate ─────────────────────  │        │
│    │          (服务器证书)                         │        │
│    │                                               │        │
│    │ ◀───── ServerHelloDone ───────────────────  │        │
│    │                                               │        │
│    │ ─────── ClientKeyExchange ────────────────▶ │        │
│    │         (预主密钥，用服务器公钥加密)          │        │
│    │                                               │        │
│    │ ─────── ChangeCipherSpec ─────────────────▶ │        │
│    │                                               │        │
│    │ ─────── Finished ─────────────────────────▶ │        │
│    │                                               │        │
│    │ ◀─────── ChangeCipherSpec ─────────────────  │        │
│    │                                               │        │
│    │ ◀─────── Finished ─────────────────────────  │        │
│    │                                               │        │
│    │ ══════════ 加密通信开始 ════════════════════ │        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**TLS 1.3 优化：**
```
- 1-RTT 握手（首次）
- 0-RTT 恢复（重连）
- 移除不安全算法
- 更简洁的加密套件
```

**证书链验证：**
```
根证书 (Root CA)
    │
    ▼
中间证书 (Intermediate CA)
    │
    ▼
服务器证书 (Server Certificate)
```

---

#### 4. 缓存机制

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP 缓存策略                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  强缓存：                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Cache-Control: max-age=31536000                     │   │
│  │ Expires: Wed, 21 Oct 2025 07:28:00 GMT             │   │
│  └─────────────────────────────────────────────────────┘   │
│  - 直接使用缓存，不请求服务器                               │
│  - 状态码：200 (from cache)                                 │
│                                                              │
│  协商缓存：                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Last-Modified / If-Modified-Since                   │   │
│  │ ETag / If-None-Match                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  - 请求服务器验证缓存是否有效                               │
│  - 有效：304 Not Modified                                  │
│  - 失效：200 + 新资源                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Cache-Control 指令：**
| 指令 | 说明 |
|------|------|
| max-age=N | 缓存 N 秒 |
| no-cache | 协商缓存 |
| no-store | 禁止缓存 |
| public | 可被任何缓存存储 |
| private | 只能被浏览器缓存 |
| immutable | 资源不会变化 |

**缓存策略示例：**
```bash
# 静态资源（长期缓存 + 文件名哈希）
Cache-Control: max-age=31536000, immutable
# app.a1b2c3d4.js

# HTML（协商缓存）
Cache-Control: no-cache
ETag: "abc123"

# API 响应（不缓存）
Cache-Control: no-store

# 私有数据
Cache-Control: private, max-age=600
```

---

#### 5. Cookie 与 Session

```
┌─────────────────────────────────────────────────────────────┐
│                    Cookie 属性                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Set-Cookie: name=value;                                    │
│              Max-Age=3600;         // 过期时间              │
│              Expires=date;         // 过期日期              │
│              Domain=.example.com;  // 作用域                │
│              Path=/;               // 路径                  │
│              Secure;               // 仅 HTTPS              │
│              HttpOnly;             // 禁止 JS 访问          │
│              SameSite=Strict|Lax|None  // 跨站限制         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**SameSite 属性：**
| 值 | 说明 |
|------|------|
| Strict | 完全禁止跨站发送 |
| Lax | 允许安全的跨站请求（GET 导航） |
| None | 允许跨站（需配合 Secure） |

**Session vs Token：**
```
Session（服务端存储）：
Client ──Cookie: sessionId──▶ Server
                               │
                               ▼
                          Session Store
                          (Redis/Memory)

Token（客户端存储）：
Client ──Header: Authorization──▶ Server
         Bearer <JWT>             │
                                  ▼
                              验证签名
```

---

### 进阶题

#### 6. 跨域与安全

**CORS：**
```
简单请求：
GET/POST/HEAD + 简单头部

预检请求（OPTIONS）：
┌────────────────────────────────────────────────────────┐
│ OPTIONS /api/data HTTP/1.1                              │
│ Origin: https://example.com                             │
│ Access-Control-Request-Method: PUT                      │
│ Access-Control-Request-Headers: Content-Type            │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ HTTP/1.1 200 OK                                         │
│ Access-Control-Allow-Origin: https://example.com        │
│ Access-Control-Allow-Methods: GET, POST, PUT, DELETE    │
│ Access-Control-Allow-Headers: Content-Type              │
│ Access-Control-Max-Age: 86400                           │
│ Access-Control-Allow-Credentials: true                  │
└────────────────────────────────────────────────────────┘
```

**安全头部：**
```bash
# 内容安全策略
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'

# 防止点击劫持
X-Frame-Options: DENY

# XSS 防护
X-Content-Type-Options: nosniff

# HSTS（强制 HTTPS）
Strict-Transport-Security: max-age=31536000; includeSubDomains

# 引用策略
Referrer-Policy: strict-origin-when-cross-origin
```

---

#### 7. 网络模型

```
┌─────────────────────────────────────────────────────────────┐
│                    TCP/IP 模型                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  应用层 ─────── HTTP, HTTPS, DNS, FTP, SMTP              │
│     │                                                        │
│  传输层 ─────── TCP, UDP                                   │
│     │                                                        │
│  网络层 ─────── IP, ICMP, ARP                             │
│     │                                                        │
│  链路层 ─────── Ethernet, Wi-Fi                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**TCP 三次握手：**
```
Client                         Server
  │                               │
  │ ─── SYN (seq=x) ───────────▶ │
  │                               │
  │ ◀── SYN+ACK (seq=y, ack=x+1) ─│
  │                               │
  │ ─── ACK (ack=y+1) ──────────▶ │
  │                               │
  │ ═══════ 连接建立 ════════════ │
```

**TCP 四次挥手：**
```
Client                         Server
  │                               │
  │ ─── FIN ────────────────────▶ │
  │                               │
  │ ◀── ACK ──────────────────── │
  │                               │
  │ ◀── FIN ──────────────────── │
  │                               │
  │ ─── ACK ────────────────────▶ │
  │                               │
  │ ═══════ 连接关闭 ════════════ │
```

**TCP vs UDP：**
| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接 | 无连接 |
| 可靠性 | 可靠传输 | 不可靠 |
| 顺序 | 保证顺序 | 不保证 |
| 速度 | 较慢 | 较快 |
| 场景 | HTTP, 文件传输 | 视频流, DNS |

---

### 避坑指南

| 错误理解 | 正确理解 |
|---------|---------|
| "HTTPS 就是加密 HTTP" | HTTPS = HTTP + TLS，包含加密、认证、完整性 |
| "304 是错误状态码" | 304 表示资源未修改，使用缓存 |
| "Cookie 可以跨域" | Cookie 默认同源，需配置才能跨域 |
| "POST 比 GET 更安全" | 安全性取决于传输方式，不取决于方法 |
| "TCP 三次握手可以改成两次" | 两次无法确认双方接收能力 |

---

## B. 实战文档

### 常见请求头

```bash
# 请求头
Host: www.example.com          # 目标主机
User-Agent: Mozilla/5.0...     # 客户端标识
Accept: text/html,application/json  # 可接受类型
Accept-Language: zh-CN,en      # 语言偏好
Accept-Encoding: gzip, deflate # 编码方式
Connection: keep-alive         # 连接方式
Content-Type: application/json # 请求体类型
Content-Length: 123            # 请求体长度
Authorization: Bearer <token>  # 认证信息
Cookie: session=abc123         # Cookie
Origin: https://example.com    # 源站（CORS）
Referer: https://example.com/page  # 来源页面

# 响应头
Content-Type: application/json; charset=utf-8
Content-Length: 456
Content-Encoding: gzip
Cache-Control: max-age=3600
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT
Set-Cookie: session=xyz789; HttpOnly; Secure
Access-Control-Allow-Origin: *
```

### 性能优化

```bash
# 启用压缩
Content-Encoding: gzip

# 资源合并与拆分
# HTTP/1.1: 合并请求减少连接数
# HTTP/2: 拆分资源利用多路复用

# 预加载
<link rel="preload" href="font.woff2" as="font">
<link rel="prefetch" href="next-page.html">
<link rel="dns-prefetch" href="//api.example.com">
<link rel="preconnect" href="https://api.example.com">

# 延迟加载
<img loading="lazy" src="image.jpg">
<script defer src="script.js"></script>
<script async src="analytics.js"></script>
```

### 调试工具

```bash
# curl
curl -v https://example.com
curl -I https://example.com  # 只看响应头
curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' url

# 浏览器开发者工具
# Network 面板：查看请求详情、时序、大小
# Security 面板：查看证书信息

# openssl 检查证书
openssl s_client -connect example.com:443
openssl x509 -in cert.pem -text -noout
```

### RESTful API 设计

```bash
# URL 设计
GET    /users          # 获取用户列表
GET    /users/:id      # 获取单个用户
POST   /users          # 创建用户
PUT    /users/:id      # 更新用户（完整）
PATCH  /users/:id      # 更新用户（部分）
DELETE /users/:id      # 删除用户

# 嵌套资源
GET    /users/:id/orders
POST   /users/:id/orders

# 查询参数
GET    /users?page=1&limit=10&sort=name&order=asc

# 响应格式
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```
