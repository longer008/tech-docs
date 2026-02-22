# 计算机网络面试题集

> 计算机网络基础知识与高频面试题
> 
> 更新时间：2025-02

## 目录

[[toc]]

## A. 面试宝典

### 基础题

#### 1. OSI 七层模型与 TCP/IP 四层模型

```
┌─────────────────────────────────────────────────────────────┐
│                    网络分层模型对比                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  OSI 七层模型          TCP/IP 四层模型        协议示例       │
│  ──────────────────────────────────────────────────────────│
│  应用层                                       HTTP, FTP     │
│  表示层                 应用层                SMTP, DNS     │
│  会话层                                       SSH, Telnet   │
│  ──────────────────────────────────────────────────────────│
│  传输层                 传输层                TCP, UDP      │
│  ──────────────────────────────────────────────────────────│
│  网络层                 网络层                IP, ICMP, ARP │
│  ──────────────────────────────────────────────────────────│
│  数据链路层                                   以太网, PPP   │
│  物理层                 网络接口层            物理介质      │
│                                                              │
│  数据封装过程：                                              │
│  应用层：数据                                               │
│  传输层：数据 + TCP/UDP头 = 段(Segment)                    │
│  网络层：段 + IP头 = 包(Packet)                            │
│  数据链路层：包 + MAC头 + 尾 = 帧(Frame)                   │
│  物理层：比特流                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### 2. TCP 三次握手与四次挥手

```
┌─────────────────────────────────────────────────────────────┐
│                    TCP 三次握手                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  客户端                              服务端                  │
│  CLOSED                              LISTEN                 │
│    │                                    │                   │
│    │──────── SYN (seq=x) ──────────▶│                      │
│    │          第一次握手                │                   │
│  SYN_SENT                              │                   │
│    │                                    │                   │
│    │◀────── SYN+ACK (seq=y, ack=x+1) ──│                   │
│    │          第二次握手                │                   │
│    │                              SYN_RCVD                  │
│    │                                    │                   │
│    │──────── ACK (ack=y+1) ────────▶│                      │
│    │          第三次握手                │                   │
│  ESTABLISHED                     ESTABLISHED               │
│                                                              │
│  为什么是三次？                                              │
│  1. 确认双方的发送和接收能力                                 │
│  2. 防止已失效的连接请求到达服务器                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    TCP 四次挥手                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  客户端                              服务端                  │
│  ESTABLISHED                       ESTABLISHED              │
│    │                                    │                   │
│    │──────── FIN (seq=u) ──────────▶│                      │
│    │          第一次挥手                │                   │
│  FIN_WAIT_1                            │                   │
│    │                                    │                   │
│    │◀────── ACK (ack=u+1) ─────────────│                   │
│    │          第二次挥手                │                   │
│  FIN_WAIT_2                        CLOSE_WAIT              │
│    │                                    │                   │
│    │◀────── FIN (seq=v) ───────────────│                   │
│    │          第三次挥手                │                   │
│    │                               LAST_ACK                │
│    │                                    │                   │
│    │──────── ACK (ack=v+1) ────────▶│                      │
│    │          第四次挥手                │                   │
│  TIME_WAIT                          CLOSED                 │
│    │                                                        │
│    │ (等待 2MSL)                                           │
│    │                                                        │
│  CLOSED                                                     │
│                                                              │
│  为什么是四次？                                              │
│  1. TCP 是全双工，每个方向都需要单独关闭                     │
│  2. 服务端可能还有数据要发送                                 │
│                                                              │
│  TIME_WAIT 作用：                                           │
│  1. 确保最后的 ACK 能到达服务端                              │
│  2. 让旧连接的数据包在网络中消失                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### 3. TCP vs UDP

```
┌─────────────────────────────────────────────────────────────┐
│                    TCP vs UDP                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性              TCP                  UDP                  │
│  ──────────────────────────────────────────────────────────│
│  连接              面向连接              无连接              │
│  可靠性            可靠传输              不可靠传输          │
│  有序性            保证顺序              不保证顺序          │
│  流量控制          有                    无                  │
│  拥塞控制          有                    无                  │
│  传输速度          较慢                  较快                │
│  头部开销          20-60字节             8字节               │
│  连接方式          点对点                支持广播/多播       │
│                                                              │
│  TCP 应用：HTTP, FTP, SMTP, SSH                             │
│  UDP 应用：DNS, DHCP, 视频流, 游戏                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**TCP 可靠传输机制：**
```
1. 序列号和确认号
   - 每个字节都有序列号
   - 接收方返回 ACK 确认

2. 超时重传
   - 未收到 ACK 则重传
   - RTO (Retransmission Timeout) 动态计算

3. 滑动窗口
   - 流量控制：接收方通告窗口大小
   - 发送方不能发送超过窗口大小的数据

4. 拥塞控制
   - 慢启动：指数增长
   - 拥塞避免：线性增长
   - 快重传：收到3个重复ACK立即重传
   - 快恢复：门限减半，继续发送
```

---

#### 4. HTTP 协议

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP 版本对比                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HTTP/1.0:                                                  │
│  - 每次请求都需要建立新连接                                  │
│  - 无 Host 头（不支持虚拟主机）                              │
│                                                              │
│  HTTP/1.1:                                                  │
│  - 持久连接（Keep-Alive）                                   │
│  - 管道化（Pipelining）                                     │
│  - 分块传输编码                                             │
│  - 新增缓存控制                                             │
│                                                              │
│  HTTP/2:                                                    │
│  - 二进制分帧                                               │
│  - 多路复用（一个连接多个请求）                             │
│  - 头部压缩（HPACK）                                        │
│  - 服务器推送                                               │
│  - 请求优先级                                               │
│                                                              │
│  HTTP/3:                                                    │
│  - 基于 QUIC（UDP）                                         │
│  - 0-RTT 连接                                               │
│  - 改进的拥塞控制                                           │
│  - 连接迁移                                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**HTTP 状态码：**
```
1xx 信息性：
    100 Continue

2xx 成功：
    200 OK
    201 Created
    204 No Content

3xx 重定向：
    301 Moved Permanently（永久重定向）
    302 Found（临时重定向）
    304 Not Modified（缓存有效）
    307 Temporary Redirect（保持方法）

4xx 客户端错误：
    400 Bad Request
    401 Unauthorized（未认证）
    403 Forbidden（无权限）
    404 Not Found
    405 Method Not Allowed
    429 Too Many Requests

5xx 服务器错误：
    500 Internal Server Error
    502 Bad Gateway
    503 Service Unavailable
    504 Gateway Timeout
```

**HTTP 请求方法：**
```
GET     获取资源（幂等）
POST    创建资源
PUT     更新资源（完整替换，幂等）
PATCH   部分更新
DELETE  删除资源（幂等）
HEAD    获取响应头（不返回body）
OPTIONS 获取支持的方法
```

---

#### 5. HTTPS 与 TLS

```
┌─────────────────────────────────────────────────────────────┐
│                    TLS 握手过程                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  客户端                              服务端                  │
│    │                                    │                   │
│    │─── ClientHello ───────────────▶│                      │
│    │    (支持的加密套件、随机数)        │                   │
│    │                                    │                   │
│    │◀── ServerHello ───────────────────│                   │
│    │    (选择的加密套件、随机数)        │                   │
│    │◀── Certificate ───────────────────│                   │
│    │    (服务器证书)                    │                   │
│    │◀── ServerKeyExchange ─────────────│                   │
│    │◀── ServerHelloDone ───────────────│                   │
│    │                                    │                   │
│    │─── ClientKeyExchange ─────────▶│                      │
│    │    (预主密钥，用公钥加密)          │                   │
│    │─── ChangeCipherSpec ──────────▶│                      │
│    │─── Finished ──────────────────▶│                      │
│    │                                    │                   │
│    │◀── ChangeCipherSpec ──────────────│                   │
│    │◀── Finished ──────────────────────│                   │
│    │                                    │                   │
│    │◀═══════ 加密通信 ═══════════════▶│                   │
│                                                              │
│  密钥生成：                                                  │
│  预主密钥 + 客户端随机数 + 服务端随机数 = 主密钥             │
│  主密钥派生出：会话密钥、MAC密钥、IV                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**HTTPS 特点：**
```
1. 加密：对称加密通信内容
2. 认证：服务器证书验证身份
3. 完整性：MAC 防止篡改

HTTP vs HTTPS:
- HTTP 明文传输，HTTPS 加密传输
- HTTP 80端口，HTTPS 443端口
- HTTPS 需要 SSL/TLS 证书
- HTTPS 更安全，但有轻微性能开销
```

---

### 进阶题

#### 6. DNS 解析过程

```
┌─────────────────────────────────────────────────────────────┐
│                    DNS 解析流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  浏览器输入 www.example.com                                  │
│    │                                                        │
│    ▼                                                        │
│  1. 浏览器缓存                                              │
│    │ 未命中                                                 │
│    ▼                                                        │
│  2. 操作系统缓存（hosts文件）                               │
│    │ 未命中                                                 │
│    ▼                                                        │
│  3. 本地 DNS 服务器（递归查询）                             │
│    │ 未命中                                                 │
│    ▼                                                        │
│  4. 根 DNS 服务器                                           │
│    │ 返回 .com 顶级域服务器地址                             │
│    ▼                                                        │
│  5. 顶级域 DNS 服务器（.com）                               │
│    │ 返回 example.com 权威服务器地址                        │
│    ▼                                                        │
│  6. 权威 DNS 服务器                                         │
│    │ 返回 www.example.com 的 IP                             │
│    ▼                                                        │
│  7. 本地 DNS 服务器缓存并返回                               │
│    │                                                        │
│    ▼                                                        │
│  8. 浏览器缓存并发起 HTTP 请求                              │
│                                                              │
│  DNS 记录类型：                                              │
│  A     域名 → IPv4                                          │
│  AAAA  域名 → IPv6                                          │
│  CNAME 域名 → 另一个域名                                    │
│  MX    邮件服务器                                           │
│  NS    域名服务器                                           │
│  TXT   文本记录                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### 7. 从 URL 到页面显示

```
1. URL 解析
   - 协议、域名、端口、路径、查询参数

2. DNS 解析
   - 浏览器缓存 → OS缓存 → 本地DNS → 根DNS → 权威DNS

3. TCP 连接
   - 三次握手建立连接

4. TLS 握手（HTTPS）
   - 证书验证、密钥交换

5. 发送 HTTP 请求
   - 请求行、请求头、请求体

6. 服务器处理
   - 路由、业务逻辑、数据库查询

7. 返回 HTTP 响应
   - 状态码、响应头、响应体

8. 浏览器渲染
   - HTML → DOM树
   - CSS → CSSOM树
   - DOM + CSSOM → 渲染树
   - 布局（Layout）
   - 绘制（Paint）
   - 合成（Composite）

9. TCP 断开（四次挥手）
```

---

#### 8. WebSocket

```
┌─────────────────────────────────────────────────────────────┐
│                    WebSocket 特点                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HTTP vs WebSocket:                                         │
│  ──────────────────────────────────────────────────────────│
│  HTTP:                                                      │
│  - 请求-响应模式                                            │
│  - 单向通信（客户端发起）                                   │
│  - 每次请求需要重新建立连接（HTTP/1.0）                     │
│                                                              │
│  WebSocket:                                                 │
│  - 全双工通信                                               │
│  - 服务器可主动推送                                         │
│  - 持久连接，低开销                                         │
│                                                              │
│  握手过程（基于 HTTP 升级）：                               │
│                                                              │
│  请求：                                                     │
│  GET /chat HTTP/1.1                                        │
│  Host: server.example.com                                  │
│  Upgrade: websocket                                        │
│  Connection: Upgrade                                       │
│  Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==              │
│  Sec-WebSocket-Version: 13                                 │
│                                                              │
│  响应：                                                     │
│  HTTP/1.1 101 Switching Protocols                          │
│  Upgrade: websocket                                        │
│  Connection: Upgrade                                       │
│  Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=       │
│                                                              │
│  应用场景：实时聊天、股票行情、在线游戏、协同编辑           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### 9. CDN 原理

```
┌─────────────────────────────────────────────────────────────┐
│                    CDN 工作原理                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  用户请求 www.example.com                                    │
│    │                                                        │
│    ▼                                                        │
│  DNS 解析返回 CDN 节点 IP                                   │
│  (CNAME → CDN DNS → 最近节点)                               │
│    │                                                        │
│    ▼                                                        │
│  CDN 边缘节点                                               │
│    │                                                        │
│    ├── 缓存命中 → 直接返回                                  │
│    │                                                        │
│    └── 缓存未命中                                           │
│          │                                                  │
│          ▼                                                  │
│        回源到中心节点或源站                                  │
│          │                                                  │
│          ▼                                                  │
│        缓存内容并返回                                       │
│                                                              │
│  CDN 优势：                                                 │
│  1. 加速访问（就近访问）                                    │
│  2. 降低源站负载                                            │
│  3. 提高可用性（多节点）                                    │
│  4. 防御 DDoS                                               │
│                                                              │
│  适合 CDN 的内容：                                          │
│  - 静态资源（CSS、JS、图片）                                │
│  - 大文件下载                                               │
│  - 视频流媒体                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### 10. 网络安全

```
常见攻击类型：

1. DDoS 攻击
   - SYN Flood：发送大量 SYN 包耗尽连接
   - UDP Flood：发送大量 UDP 包耗尽带宽
   - HTTP Flood：大量 HTTP 请求

2. 中间人攻击（MITM）
   - ARP 欺骗：伪造 MAC 地址
   - DNS 劫持：篡改 DNS 响应
   - SSL 剥离：降级 HTTPS 为 HTTP

3. DNS 劫持
   - 篡改 DNS 响应
   - 重定向到恶意网站

防御措施：
- 使用 HTTPS
- DNSSEC 验证
- 防火墙配置
- 流量清洗
- CDN 防护
```

---

### 避坑指南

| 问题 | 说明 |
|------|------|
| TCP 三次握手变两次 | 无法防止历史连接 |
| TIME_WAIT 过多 | 可调整内核参数或使用连接池 |
| DNS 缓存过长 | 可能导致切换延迟 |
| HTTPS 证书过期 | 需要监控和自动续期 |

---

## B. 实战文档

### 常用网络命令

```bash
# DNS 查询
nslookup example.com
dig example.com
host example.com

# 网络连通性
ping example.com
traceroute example.com
mtr example.com

# TCP 连接
telnet host port
nc -zv host port

# 抓包
tcpdump -i eth0 port 80
tcpdump -w file.pcap

# 网络统计
netstat -tlnp
ss -tlnp
lsof -i :80

# HTTP 请求
curl -v https://example.com
curl -X POST -d "data" url
curl -H "Header: value" url

# 查看路由
ip route
route -n
```

### 网络排查流程

```
1. 确认网络连通性
   ping target_ip

2. 检查 DNS 解析
   nslookup domain

3. 检查端口连通性
   telnet host port

4. 检查路由
   traceroute target

5. 抓包分析
   tcpdump -i eth0 host target

6. 查看连接状态
   netstat -an | grep ESTABLISHED
```

---

## C. HTTP 缓存机制

### 1. 强缓存

```
┌─────────────────────────────────────────────────────────────┐
│                    强缓存                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Expires（HTTP/1.0）:                                       │
│  Expires: Wed, 21 Oct 2025 07:28:00 GMT                    │
│  - 绝对时间                                                  │
│  - 受客户端时间影响                                         │
│                                                              │
│  Cache-Control（HTTP/1.1）:                                 │
│  Cache-Control: max-age=3600                                │
│  - 相对时间（秒）                                           │
│  - 优先级高于 Expires                                       │
│                                                              │
│  Cache-Control 指令：                                       │
│  - max-age=<seconds>    缓存时间                            │
│  - no-cache             需要验证                            │
│  - no-store             不缓存                              │
│  - public               可被任何缓存                        │
│  - private              只能被浏览器缓存                    │
│  - must-revalidate      过期后必须验证                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. 协商缓存

```
┌─────────────────────────────────────────────────────────────┐
│                    协商缓存                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Last-Modified / If-Modified-Since:                         │
│  ──────────────────────────────────────────────────────────│
│  响应头：Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT      │
│  请求头：If-Modified-Since: Wed, 21 Oct 2024 07:28:00 GMT  │
│  - 基于文件修改时间                                         │
│  - 精度到秒                                                 │
│  - 可能不准确（内容未变但时间变了）                         │
│                                                              │
│  ETag / If-None-Match:                                      │
│  ──────────────────────────────────────────────────────────│
│  响应头：ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"  │
│  请求头：If-None-Match: "33a64df551425fcc55e4d42a148795d9" │
│  - 基于文件内容哈希                                         │
│  - 更精确                                                   │
│  - 优先级高于 Last-Modified                                 │
│                                                              │
│  304 Not Modified:                                          │
│  - 资源未修改，使用缓存                                     │
│  - 不返回响应体，节省带宽                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. 缓存策略

```javascript
// 前端缓存策略示例

// 1. 强缓存（静态资源）
// HTML: no-cache（每次验证）
<meta http-equiv="Cache-Control" content="no-cache">

// CSS/JS: 长期缓存 + 文件名哈希
// style.abc123.css
Cache-Control: max-age=31536000, immutable

// 2. 协商缓存（API 数据）
fetch('/api/data', {
  headers: {
    'If-None-Match': etag,
    'If-Modified-Since': lastModified
  }
});

// 3. Service Worker 缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

---

## D. CORS 跨域

### 1. 同源策略

```
同源定义：协议 + 域名 + 端口 完全相同

示例：
https://example.com:443/page1
https://example.com:443/page2  ✅ 同源
http://example.com:443/page1   ❌ 协议不同
https://api.example.com/page1  ❌ 域名不同
https://example.com:8080/page1 ❌ 端口不同

限制：
- Ajax 请求
- Cookie、LocalStorage、IndexDB
- DOM 访问
```

### 2. CORS 解决方案

```
┌─────────────────────────────────────────────────────────────┐
│                    CORS 流程                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  简单请求：                                                  │
│  - GET, HEAD, POST                                          │
│  - Content-Type: text/plain, multipart/form-data,          │
│    application/x-www-form-urlencoded                        │
│                                                              │
│  请求：                                                     │
│  Origin: https://example.com                                │
│                                                              │
│  响应：                                                     │
│  Access-Control-Allow-Origin: https://example.com           │
│  Access-Control-Allow-Credentials: true                     │
│                                                              │
│  ──────────────────────────────────────────────────────────│
│                                                              │
│  预检请求（Preflight）：                                    │
│  - PUT, DELETE, PATCH                                       │
│  - Content-Type: application/json                           │
│  - 自定义请求头                                             │
│                                                              │
│  OPTIONS 请求：                                             │
│  Origin: https://example.com                                │
│  Access-Control-Request-Method: POST                        │
│  Access-Control-Request-Headers: Content-Type               │
│                                                              │
│  OPTIONS 响应：                                             │
│  Access-Control-Allow-Origin: https://example.com           │
│  Access-Control-Allow-Methods: GET, POST, PUT               │
│  Access-Control-Allow-Headers: Content-Type                 │
│  Access-Control-Max-Age: 86400                              │
│                                                              │
│  实际请求：                                                 │
│  POST /api/data                                             │
│  Origin: https://example.com                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// 服务端 CORS 配置（Express）
app.use((req, res, next) => {
  // 允许的源
  res.header('Access-Control-Allow-Origin', 'https://example.com');
  // 允许的方法
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  // 允许的请求头
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // 允许携带凭证
  res.header('Access-Control-Allow-Credentials', 'true');
  // 预检请求缓存时间
  res.header('Access-Control-Max-Age', '86400');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 前端请求配置
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',  // 携带 Cookie
  body: JSON.stringify(data)
});
```

### 3. 其他跨域方案

```javascript
// 1. JSONP（仅支持 GET）
function jsonp(url, callback) {
  const script = document.createElement('script');
  script.src = `${url}?callback=${callback}`;
  document.body.appendChild(script);
}

// 2. postMessage（iframe 通信）
// 父页面
iframe.contentWindow.postMessage('data', 'https://child.com');

// 子页面
window.addEventListener('message', event => {
  if (event.origin === 'https://parent.com') {
    console.log(event.data);
  }
});

// 3. WebSocket（无同源限制）
const ws = new WebSocket('wss://api.example.com');

// 4. 代理服务器
// Nginx 反向代理
location /api/ {
  proxy_pass https://api.example.com/;
}
```

---

## E. 性能优化

### 1. HTTP/2 优化

```
HTTP/2 特性：
──────────────────────────────────────────────────────────
1. 二进制分帧
   - 更高效的解析
   - 更小的传输体积

2. 多路复用
   - 一个连接多个请求
   - 解决队头阻塞
   - 不需要域名分片

3. 头部压缩（HPACK）
   - 减少重复头部
   - 静态表 + 动态表

4. 服务器推送
   - 主动推送资源
   - 减少往返时间

5. 请求优先级
   - 关键资源优先加载
```

```javascript
// HTTP/2 服务器推送示例（Node.js）
const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
});

server.on('stream', (stream, headers) => {
  if (headers[':path'] === '/') {
    // 推送 CSS
    stream.pushStream({ ':path': '/style.css' }, (err, pushStream) => {
      pushStream.respondWithFile('style.css');
    });
    
    // 推送 JS
    stream.pushStream({ ':path': '/script.js' }, (err, pushStream) => {
      pushStream.respondWithFile('script.js');
    });
    
    // 响应 HTML
    stream.respondWithFile('index.html');
  }
});
```

### 2. 网络性能指标

```
关键指标：
──────────────────────────────────────────────────────────
DNS 查询时间：< 100ms
TCP 连接时间：< 100ms
TLS 握手时间：< 200ms
首字节时间（TTFB）：< 200ms
内容下载时间：取决于大小

优化目标：
- FCP（First Contentful Paint）：< 1.8s
- LCP（Largest Contentful Paint）：< 2.5s
- FID（First Input Delay）：< 100ms
- CLS（Cumulative Layout Shift）：< 0.1
```

### 3. 网络优化技巧

```javascript
// 1. 资源预加载
<link rel="dns-prefetch" href="//api.example.com">
<link rel="preconnect" href="https://api.example.com">
<link rel="prefetch" href="/next-page.html">
<link rel="preload" href="/critical.css" as="style">

// 2. 懒加载
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});

// 3. 资源压缩
// Gzip/Brotli 压缩
// 图片压缩（WebP, AVIF）
// 代码压缩（Minify）

// 4. CDN 加速
// 静态资源使用 CDN
// 就近访问
// 缓存优化

// 5. 减少请求
// 合并文件
// 雪碧图
// Base64 内联小图片
```

---

## F. 网络安全进阶

### 1. XSS 攻击与防御

```javascript
// XSS 类型：
// 1. 存储型 XSS：恶意脚本存储在服务器
// 2. 反射型 XSS：恶意脚本在 URL 参数中
// 3. DOM 型 XSS：通过 DOM 操作注入

// 防御措施：

// 1. 输入验证
function validateInput(input) {
  const pattern = /^[a-zA-Z0-9\s]+$/;
  return pattern.test(input);
}

// 2. 输出转义
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// 3. CSP（Content Security Policy）
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">

// 4. HttpOnly Cookie
res.cookie('session', value, {
  httpOnly: true,  // 防止 JS 访问
  secure: true,    // 仅 HTTPS
  sameSite: 'strict'
});

// 5. 使用安全的 API
// 避免：innerHTML, document.write
// 使用：textContent, createElement
element.textContent = userInput;  // 安全
```

### 2. CSRF 攻击与防御

```javascript
// CSRF（Cross-Site Request Forgery）跨站请求伪造

// 防御措施：

// 1. CSRF Token
// 服务端生成
const csrfToken = crypto.randomBytes(32).toString('hex');
res.cookie('csrf-token', csrfToken);

// 前端携带
fetch('/api/data', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': getCookie('csrf-token')
  }
});

// 服务端验证
if (req.headers['x-csrf-token'] !== req.cookies['csrf-token']) {
  return res.status(403).send('Invalid CSRF token');
}

// 2. SameSite Cookie
res.cookie('session', value, {
  sameSite: 'strict'  // 或 'lax'
});

// 3. 验证 Referer/Origin
if (req.headers.origin !== 'https://example.com') {
  return res.status(403).send('Invalid origin');
}

// 4. 双重 Cookie 验证
// Cookie + 请求头都携带 token
```

### 3. SQL 注入防御

```javascript
// 危险示例（不要这样做）
const query = `SELECT * FROM users WHERE username = '${username}'`;

// 安全做法：

// 1. 参数化查询（推荐）
const query = 'SELECT * FROM users WHERE username = ?';
db.query(query, [username]);

// 2. ORM 框架
const user = await User.findOne({ where: { username } });

// 3. 输入验证
function validateUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

// 4. 最小权限原则
// 数据库用户只授予必要权限
```

---

## G. 面试高频问题

### 1. 输入 URL 到页面显示（完整版）

```
1. URL 解析
   - 协议、域名、端口、路径、查询参数、锚点

2. DNS 解析
   - 浏览器缓存 → OS 缓存 → 路由器缓存
   - 本地 DNS 服务器 → 根 DNS → 顶级域 DNS → 权威 DNS
   - 返回 IP 地址

3. 建立 TCP 连接
   - 三次握手
   - 客户端 SYN → 服务端 SYN+ACK → 客户端 ACK

4. TLS 握手（HTTPS）
   - ClientHello → ServerHello
   - 证书验证
   - 密钥交换
   - ChangeCipherSpec

5. 发送 HTTP 请求
   - 请求行：GET /index.html HTTP/1.1
   - 请求头：Host, User-Agent, Cookie, etc.
   - 请求体（POST）

6. 服务器处理
   - 路由匹配
   - 业务逻辑
   - 数据库查询
   - 生成响应

7. 返回 HTTP 响应
   - 状态行：HTTP/1.1 200 OK
   - 响应头：Content-Type, Set-Cookie, etc.
   - 响应体：HTML 内容

8. 浏览器解析渲染
   - 解析 HTML → DOM 树
   - 解析 CSS → CSSOM 树
   - 合并 → 渲染树（Render Tree）
   - 布局（Layout/Reflow）：计算位置大小
   - 绘制（Paint）：绘制像素
   - 合成（Composite）：合成图层

9. 加载资源
   - 并行下载 CSS、JS、图片
   - 执行 JavaScript
   - 触发 DOMContentLoaded
   - 触发 load 事件

10. 断开连接
    - 四次挥手
    - 客户端 FIN → 服务端 ACK
    - 服务端 FIN → 客户端 ACK
    - TIME_WAIT（2MSL）
```

### 2. TCP 与 UDP 的选择

```
使用 TCP 的场景：
- 文件传输（FTP）
- 邮件（SMTP）
- 网页浏览（HTTP/HTTPS）
- 远程登录（SSH）
- 需要可靠传输的场景

使用 UDP 的场景：
- 视频直播
- 在线游戏
- DNS 查询
- 语音通话（VoIP）
- 实时性要求高、容忍丢包的场景
```

### 3. HTTP 状态码详解

```
1xx 信息性响应：
100 Continue - 继续请求
101 Switching Protocols - 切换协议（WebSocket）

2xx 成功：
200 OK - 成功
201 Created - 已创建
202 Accepted - 已接受
204 No Content - 无内容
206 Partial Content - 部分内容（断点续传）

3xx 重定向：
301 Moved Permanently - 永久重定向（SEO 友好）
302 Found - 临时重定向
303 See Other - 查看其他位置
304 Not Modified - 未修改（缓存）
307 Temporary Redirect - 临时重定向（保持方法）
308 Permanent Redirect - 永久重定向（保持方法）

4xx 客户端错误：
400 Bad Request - 请求错误
401 Unauthorized - 未认证
403 Forbidden - 禁止访问
404 Not Found - 未找到
405 Method Not Allowed - 方法不允许
408 Request Timeout - 请求超时
409 Conflict - 冲突
410 Gone - 已删除
413 Payload Too Large - 请求体过大
414 URI Too Long - URI 过长
415 Unsupported Media Type - 不支持的媒体类型
429 Too Many Requests - 请求过多（限流）

5xx 服务器错误：
500 Internal Server Error - 服务器内部错误
501 Not Implemented - 未实现
502 Bad Gateway - 网关错误
503 Service Unavailable - 服务不可用
504 Gateway Timeout - 网关超时
505 HTTP Version Not Supported - HTTP 版本不支持
```

---

## H. 参考资料

### 学习资源

- [MDN Web Docs](https://developer.mozilla.org/) - 权威文档
- [HTTP/2 explained](https://http2-explained.haxx.se/) - HTTP/2 详解
- [High Performance Browser Networking](https://hpbn.co/) - 网络性能
- [图解 HTTP](https://book.douban.com/subject/25863515/) - 入门书籍

### 工具推荐

- [Wireshark](https://www.wireshark.org/) - 抓包分析
- [Postman](https://www.postman.com/) - API 测试
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - 网络调试
- [WebPageTest](https://www.webpagetest.org/) - 性能测试

### 面试准备

```
必须掌握：
- OSI 七层模型
- TCP/IP 协议栈
- TCP 三次握手/四次挥手
- HTTP/HTTPS 原理
- DNS 解析过程
- 常见状态码

加分项：
- HTTP/2、HTTP/3
- WebSocket
- QUIC 协议
- 网络安全
- 性能优化
```

