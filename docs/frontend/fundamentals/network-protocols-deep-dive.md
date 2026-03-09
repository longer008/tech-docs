# 网络协议深入解析

> 更新时间：2025-02

## 目录

[[toc]]

## HTTP 协议演进

### 1. HTTP/1.1

```javascript
// HTTP/1.1 特点
const HTTP1_1 = {
  特点: [
    '持久连接（Keep-Alive）',
    '管道化（Pipelining）',
    '分块传输编码',
    '缓存控制',
    '内容协商'
  ],
  
  缺点: [
    '队头阻塞（Head-of-Line Blocking）',
    '无法多路复用',
    '头部冗余',
    '明文传输（不安全）'
  ],
  
  示例: `
    GET /api/users HTTP/1.1
    Host: example.com
    Connection: keep-alive
    Accept: application/json
    User-Agent: Mozilla/5.0
  `
}

// 队头阻塞示例
// 请求 1：大文件下载（阻塞后续请求）
fetch('/large-file.zip')

// 请求 2：必须等待请求 1 完成
fetch('/api/data')

// 解决方案：域名分片
const domains = [
  'cdn1.example.com',
  'cdn2.example.com',
  'cdn3.example.com'
]

// 将资源分散到多个域名
function loadResource(url, index) {
  const domain = domains[index % domains.length]
  return fetch(`https://${domain}${url}`)
}
```

### 2. HTTP/2

```javascript
// HTTP/2 特点
const HTTP2 = {
  核心特性: {
    二进制分帧: '将消息分解为帧，提高传输效率',
    多路复用: '单个连接可以并发多个请求/响应',
    头部压缩: 'HPACK 算法压缩头部',
    服务器推送: '服务器主动推送资源',
    流优先级: '可以设置流的优先级'
  },
  
  优势: [
    '解决队头阻塞',
    '减少延迟',
    '提高带宽利用率',
    '减少连接数'
  ],
  
  缺点: [
    'TCP 层面仍有队头阻塞',
    '服务器推送使用率低',
    '需要 HTTPS'
  ]
}

// 检测 HTTP/2 支持
function supportsHTTP2() {
  // 方法 1：检查 PerformanceResourceTiming
  const entries = performance.getEntriesByType('resource')
  return entries.some(entry => entry.nextHopProtocol === 'h2')
}

// 方法 2：检查 window.fetch
async function checkHTTP2Support() {
  try {
    const response = await fetch('https://http2.akamai.com/demo')
    const protocol = response.headers.get('x-firefox-spdy')
    return protocol === 'h2'
  } catch {
    return false
  }
}

// HTTP/2 服务器推送示例（Node.js）
const http2 = require('http2')
const fs = require('fs')

const server = http2.createSecureServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
})

server.on('stream', (stream, headers) => {
  // 主请求
  if (headers[':path'] === '/') {
    // 推送 CSS 文件
    stream.p

  }
})

server.listen(443)
```

### 3. HTTP/3

```javascript
// HTTP/3 特点
const HTTP3 = {
  核心特性: {
    基于QUIC: '使用 UDP 而非 TCP',
    连接迁移: '支持 IP 地址变化',
    零RTT: '0-RTT 连接建立',
    改进的拥塞控制: '更好的网络适应性',
    彻底解决队头阻塞: 'UDP 层面无队头阻塞'
  },
  
  QUIC协议: {
    传输层: 'UDP',
    加密: '内置 TLS 1.3',
    多路复用: '流级别的多路复用',
    连接ID: '支持连接迁移'
  },
  
  优势: [
    '更快的连接建立',
    '更好的弱网表现',
    '支持连接迁移（WiFi 切换到 4G）',
    '彻底解决队头阻塞'
  ]
}

// 检测 HTTP/3 支持
function supportsHTTP3() {
  const entries = performance.getEntriesByType('resource')
  return entries.some(entry => entry.nextHopProtocol === 'h3')
}

// HTTP/3 连接示例（浏览器自动处理）
// 服务器需要支持 HTTP/3
fetch('https://example.com/api/data')
  .then(response => {
    // 检查使用的协议
    const protocol = response.headers.get('alt-svc')
    console.log('Protocol:', protocol)
  })
```

### 4. HTTP 协议对比

```javascript
// 协议对比表
const protocolComparison = {
  'HTTP/1.1': {
    传输层: 'TCP',
    多路复用: '❌',
    头部压缩: '❌',
    服务器推送: '❌',
    队头阻塞: '✅ 有',
    连接数: '6-8 个/域名',
    适用场景: '简单网站、兼容性要求高'
  },
  
  'HTTP/2': {
    传输层: 'TCP',
    多路复用: '✅',
    头部压缩: '✅ HPACK',
    服务器推送: '✅',
    队头阻塞: '⚠️ TCP 层面有',
    连接数: '1 个/域名',
    适用场景: '现代网站、高并发'
  },
  
  'HTTP/3': {
    传输层: 'UDP (QUIC)',
    多路复用: '✅',
    头部压缩: '✅ QPACK',
    服务器推送: '✅',
    队头阻塞: '❌ 无',
    连接数: '1 个/域名',
    适用场景: '移动端、弱网环境'
  }
}

// 性能对比
const performanceComparison = {
  连接建立: {
    'HTTP/1.1': '3 RTT (TCP + TLS)',
    'HTTP/2': '3 RTT (TCP + TLS)',
    'HTTP/3': '0-1 RTT (QUIC)'
  },
  
  并发请求: {
    'HTTP/1.1': '6-8 个',
    'HTTP/2': '无限制',
    'HTTP/3': '无限制'
  },
  
  弱网表现: {
    'HTTP/1.1': '差',
    'HTTP/2': '中',
    'HTTP/3': '好'
  }
}
```

## WebSocket 实时通信

### 1. WebSocket 基础

```javascript
// WebSocket 连接
class WebSocketClient {
  constructor(url) {
    this.url = url
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }
  
  // 连接
  connect() {
    this.ws = new WebSocket(this.url)
    
    // 连接打开
    this.ws.onopen = () => {
      console.log('WebSocket 连接已建立')
      this.reconnectAttempts = 0
      this.onOpen?.()
    }
    
    // 接收消息
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.onMessage?.(data)
      } catch (error) {
        console.error('解析消息失败:', error)
      }
    }
    
    // 连接关闭
    this.ws.onclose = (event) => {
      console.log('WebSocket 连接已关闭', event.code, event.reason)
      this.onClose?.(event)
      
      // 自动重连
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnect()
      }
    }
    
    // 连接错误
    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error)
      this.onError?.(error)
    }
  }
  
  // 重连
  reconnect() {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`${delay}ms 后尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }
  
  // 发送消息
  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error('WebSocket 未连接')
    }
  }
  
  // 关闭连接
  close() {
    this.ws?.close()
  }
}

// 使用示例
const ws = new WebSocketClient('wss://example.com/ws')

ws.onOpen = () => {
  console.log('连接成功')
  ws.send({ type: 'subscribe', channel: 'chat' })
}

ws.onMessage = (data) => {
  console.log('收到消息:', data)
}

ws.onClose = (event) => {
  console.log('连接关闭:', event.code)
}

ws.onError = (error) => {
  console.error('连接错误:', error)
}

ws.connect()
```

### 2. WebSocket 心跳机制

```javascript
// 带心跳的 WebSocket 客户端
class WebSocketWithHeartbeat extends WebSocketClient {
  constructor(url, options = {}) {
    super(url)
    this.heartbeatInterval = options.heartbeatInterval || 30000 // 30 秒
    this.heartbeatTimer = null
    this.pongTimeout = options.pongTimeout || 5000 // 5 秒
    this.pongTimer = null
  }
  
  connect() {
    super.connect()
    
    // 连接成功后启动心跳
    const originalOnOpen = this.onOpen
    this.onOpen = () => {
      originalOnOpen?.()
      this.startHeartbeat()
    }
    
    // 连接关闭时停止心跳
    const originalOnClose = this.onClose
    this.onClose = (event) => {
      originalOnClose?.(event)
      this.stopHeartbeat()
    }
  }
  
  // 启动心跳
  startHeartbeat() {
    this.stopHeartbeat()
    
    this.heartbeatTimer = setInterval(() => {
      this.sendPing()
    }, this.heartbeatInterval)
  }
  
  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    
    if (this.pongTimer) {
      clearTimeout(this.pongTimer)
      this.pongTimer = null
    }
  }
  
  // 发送 ping
  sendPing() {
    this.send({ type: 'ping', timestamp: Date.now() })
    
    // 等待 pong 响应
    this.pongTimer = setTimeout(() => {
      console.error('心跳超时，重新连接')
      this.ws?.close()
    }, this.pongTimeout)
  }
  
  // 接收 pong
  receivePong() {
    if (this.pongTimer) {
      clearTimeout(this.pongTimer)
      this.pongTimer = null
    }
  }
  
  // 重写 onMessage
  onMessage(data) {
    if (data.type === 'pong') {
      this.receivePong()
    } else {
      // 处理其他消息
      super.onMessage?.(data)
    }
  }
}

// 使用示例
const ws = new WebSocketWithHeartbeat('wss://example.com/ws', {
  heartbeatInterval: 30000,
  pongTimeout: 5000
})

ws.connect()
```

### 3. WebSocket 服务端（Node.js）

```javascript
// 使用 ws 库
const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })

// 存储所有连接
const clients = new Set()

wss.on('connection', (ws, req) => {
  console.log('新客户端连接:', req.socket.remoteAddress)
  
  // 添加到客户端列表
  clients.add(ws)
  
  // 接收消息
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)
      
      // 处理不同类型的消息
      switch (data.type) {
        case 'ping':
          // 响应心跳
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
          break
          
        case 'broadcast':
          // 广播消息给所有客户端
          broadcast(data.content)
          break
          
        case 'private':
          // 发送私信
          sendToUser(data.userId, data.content)
          break
          
        default:
          console.log('收到消息:', data)
      }
    } catch (error) {
      console.error('解析消息失败:', error)
    }
  })
  
  // 连接关闭
  ws.on('close', () => {
    console.log('客户端断开连接')
    clients.delete(ws)
  })
  
  // 连接错误
  ws.on('error', (error) => {
    console.error('WebSocket 错误:', error)
  })
})

// 广播消息
function broadcast(message) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'broadcast',
        content: message,
        timestamp: Date.now()
      }))
    }
  })
}

// 发送给指定用户
function sendToUser(userId, message) {
  // 假设每个 ws 对象有 userId 属性
  clients.forEach(client => {
    if (client.userId === userId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'private',
        content: message,
        timestamp: Date.now()
      }))
    }
  })
}

console.log('WebSocket 服务器运行在 ws://localhost:8080')
```

## Server-Sent Events (SSE)

### 1. SSE 基础

```javascript
// SSE 客户端
class SSEClient {
  constructor(url) {
    this.url = url
    this.eventSource = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }
  
  // 连接
  connect() {
    this.eventSource = new EventSource(this.url)
    
    // 连接打开
    this.eventSource.onopen = () => {
      console.log('SSE 连接已建立')
      this.reconnectAttempts = 0
      this.onOpen?.()
    }
    
    // 接收消息
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.onMessage?.(data)
      } catch (error) {
        console.error('解析消息失败:', error)
      }
    }
    
    // 连接错误
    this.eventSource.onerror = (error) => {
      console.error('SSE 错误:', error)
      this.onError?.(error)
      
      // 自动重连
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnect()
      }
    }
  }
  
  // 监听自定义事件
  addEventListener(eventName, handler) {
    this.eventSource?.addEventListener(eventName, (event) => {
      try {
        const data = JSON.parse(event.data)
        handler(data)
      } catch (error) {
        console.error('解析消息失败:', error)
      }
    })
  }
  
  // 重连
  reconnect() {
    this.reconnectAttempts++
    const delay = 1000 * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`${delay}ms 后尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.close()
      this.connect()
    }, delay)
  }
  
  // 关闭连接
  close() {
    this.eventSource?.close()
  }
}

// 使用示例
const sse = new SSEClient('/api/events')

sse.onOpen = () => {
  console.log('SSE 连接成功')
}

sse.onMessage = (data) => {
  console.log('收到消息:', data)
}

// 监听自定义事件
sse.addEventListener('notification', (data) => {
  console.log('收到通知:', data)
})

sse.addEventListener('update', (data) => {
  console.log('收到更新:', data)
})

sse.connect()
```

### 2. SSE 服务端（Node.js）

```javascript
// Express 服务端
const express = require('express')
const app = express()

// SSE 端点
app.get('/api/events', (req, res) => {
  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  
  // 发送初始消息
  res.write('data: {"type":"connected","timestamp":' + Date.now() + '}\n\n')
  
  // 定时发送消息
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({
      type: 'update',
      value: Math.random(),
      timestamp: Date.now()
    })}\n\n`)
  }, 1000)
  
  // 发送自定义事件
  setTimeout(() => {
    res.write(`event: notification\n`)
    res.write(`data: ${JSON.stringify({
      message: '这是一条通知',
      timestamp: Date.now()
    })}\n\n`)
  }, 5000)
  
  // 客户端断开连接
  req.on('close', () => {
    clearInterval(interval)
    console.log('客户端断开连接')
  })
})

app.listen(3000, () => {
  console.log('SSE 服务器运行在 http://localhost:3000')
})
```

### 3. SSE vs WebSocket

```javascript
// 对比表
const comparison = {
  SSE: {
    通信方向: '单向（服务器 → 客户端）',
    协议: 'HTTP',
    数据格式: '文本',
    浏览器支持: '✅ 好（除 IE）',
    自动重连: '✅ 内置',
    适用场景: [
      '实时通知',
      '股票行情',
      '日志推送',
      '进度更新'
    ],
    优点: [
      '简单易用',
      '自动重连',
      '基于 HTTP',
      '支持自定义事件'
    ],
    缺点: [
      '单向通信',
      '只支持文本',
      'IE 不支持'
    ]
  },
  
  WebSocket: {
    通信方向: '双向（客户端 ↔ 服务器）',
    协议: 'WebSocket',
    数据格式: '文本 + 二进制',
    浏览器支持: '✅ 好',
    自动重连: '❌ 需要自己实现',
    适用场景: [
      '聊天应用',
      '在线游戏',
      '协同编辑',
      '实时数据同步'
    ],
    优点: [
      '双向通信',
      '支持二进制',
      '低延迟',
      '高效'
    ],
    缺点: [
      '需要专门的服务器',
      '需要处理重连',
      '复杂度高'
    ]
  }
}
```


## WebRTC 实时通信

### 1. WebRTC 基础

```javascript
// WebRTC 点对点连接
class WebRTCPeer {
  constructor() {
    this.peerConnection = null
    this.dataChannel = null
    this.localStream = null
  }
  
  // 初始化连接
  async init() {
    // 创建 RTCPeerConnection
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: 'turn:turn.example.com:3478',
          username: 'user',
          credential: 'pass'
        }
      ]
    })
    
    // ICE 候选
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE 候选:', event.candidate)
        // 发送给对方
        this.sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate
        })
      }
    }
    
    // 连接状态变化
    this.peerConnection.onconnectionstatechange = () => {
      console.log('连接状态:', this.peerConnection.connectionState)
    }
    
    // 接收远程流
    this.peerConnection.ontrack = (event) => {
      console.log('接收到远程流')
      const remoteVideo = document.getElementById('remoteVideo')
      remoteVideo.srcObject = event.streams[0]
    }
  }
  
  // 获取本地媒体流
  async getLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      // 添加到连接
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
      
      // 显示本地视频
      const localVideo = document.getElementById('localVideo')
      localVideo.srcObject = this.localStream
      
      return this.localStream
    } catch (error) {
      console.error('获取媒体流失败:', error)
      throw error
    }
  }
  
  // 创建 Offer
  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      
      // 发送给对方
      this.sendSignal({
        type: 'offer',
        sdp: offer
      })
      
      return offer
    } catch (error) {
      console.error('创建 Offer 失败:', error)
      throw error
    }
  }
  
  // 处理 Offer
  async handleOffer(offer) {
    try {
      await this.peerConnection.setRemoteDescription(offer)
      
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)
      
      // 发送给对方
      this.sendSignal({
        type: 'answer',
        sdp: answer
      })
      
      return answer
    } catch (error) {
      console.error('处理 Offer 失败:', error)
      throw error
    }
  }
  
  // 处理 Answer
  async handleAnswer(answer) {
    try {
      await this.peerConnection.setRemoteDescription(answer)
    } catch (error) {
      console.error('处理 Answer 失败:', error)
      throw error
    }
  }
  
  // 处理 ICE 候选
  async handleIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(candidate)
    } catch (error) {
      console.error('添加 ICE 候选失败:', error)
      throw error
    }
  }
  
  // 创建数据通道
  createDataChannel(label) {
    this.dataChannel = this.peerConnection.createDataChannel(label)
    
    this.dataChannel.onopen = () => {
      console.log('数据通道已打开')
    }
    
    this.dataChannel.onmessage = (event) => {
      console.log('收到消息:', event.data)
    }
    
    this.dataChannel.onclose = () => {
      console.log('数据通道已关闭')
    }
    
    return this.dataChannel
  }
  
  // 发送数据
  sendData(data) {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(data)
    } else {
      console.error('数据通道未打开')
    }
  }
  
  // 发送信令（需要通过信令服务器）
  sendSignal(signal) {
    // 通过 WebSocket 或其他方式发送给对方
    console.log('发送信令:', signal)
  }
  
  // 关闭连接
  close() {
    this.dataChannel?.close()
    this.peerConnection?.close()
    this.localStream?.getTracks().forEach(track => track.stop())
  }
}

// 使用示例
const peer = new WebRTCPeer()

// 初始化
await peer.init()

// 获取本地媒体流
await peer.getLocalStream()

// 创建 Offer（发起方）
await peer.createOffer()

// 或处理 Offer（接收方）
// await peer.handleOffer(offer)
```

### 2. 屏幕共享

```javascript
// 屏幕共享
class ScreenShare {
  constructor() {
    this.stream = null
  }
  
  // 开始屏幕共享
  async start() {
    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always' // 显示鼠标
        },
        audio: false
      })
      
      // 显示屏幕共享
      const video = document.getElementById('screenVideo')
      video.srcObject = this.stream
      
      // 监听停止共享
      this.stream.getVideoTracks()[0].onended = () => {
        console.log('屏幕共享已停止')
        this.stop()
      }
      
      return this.stream
    } catch (error) {
      console.error('屏幕共享失败:', error)
      throw error
    }
  }
  
  // 停止屏幕共享
  stop() {
    this.stream?.getTracks().forEach(track => track.stop())
    this.stream = null
  }
}

// 使用示例
const screenShare = new ScreenShare()

// 开始共享
document.getElementById('shareBtn').onclick = async () => {
  try {
    await screenShare.start()
  } catch (error) {
    console.error('开始共享失败:', error)
  }
}

// 停止共享
document.getElementById('stopBtn').onclick = () => {
  screenShare.stop()
}
```

## GraphQL vs REST

### 1. REST API

```javascript
// REST API 示例
class RestAPI {
  constructor(baseURL) {
    this.baseURL = baseURL
  }
  
  // 获取用户列表
  async getUsers() {
    const response = await fetch(`${this.baseURL}/users`)
    return 

    const [user, posts, comments] = await Promise.all([
      this.getUser(userId),
      this.getUserPosts(userId),
      this.getUserComments(userId)
    ])
    
    return { user, posts, comments }
  }
}

// 使用示例
const api = new RestAPI('https://api.example.com')

// 问题：需要多次请求
const userInfo = await api.getUserFullInfo(1)
```

### 2. GraphQL API

```javascript
// GraphQL API 示例
class GraphQLAPI {
  constructor(endpoint) {
    this.endpoint = endpoint
  }
  
  // 执行查询
  async query(query, variables = {}) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    })
    
    const result = await response.json()
    
    if (result.errors) {
      throw new Error(result.errors[0].message)
    }
    
    return result.data
  }
  
  // 获取用户完整信息（一次请求）
  async getUserFullInfo(userId) {
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
          posts {
            id
            title
            content
          }
          comments {
            id
            content
            post {
              id
              title
            }
          }
        }
      }
    `
    
    return this.query(query, { id: userId })
  }
  
  // 只获取需要的字段
  async getUserBasicInfo(userId) {
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
        }
      }
    `
    
    return this.query(query, { id: userId })
  }
  
  // 创建文章（Mutation）
  async createPost(title, content) {
    const mutation = `
      mutation CreatePost($title: String!, $content: String!) {
        createPost(title: $title, content: $content) {
          id
          title
          content
          createdAt
        }
      }
    `
    
    return this.query(mutation, { title, content })
  }
  
  // 订阅（Subscription）
  subscribeToNewPosts(callback) {
    const ws = new WebSocket('wss://api.example.com/graphql')
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'start',
        payload: {
          query: `
            subscription {
              newPost {
                id
                title
                content
                author {
                  name
                }
              }
            }
          `
        }
      }))
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'data') {
        callback(data.payload.data.newPost)
      }
    }
    
    return () => ws.close()
  }
}

// 使用示例
const api = new GraphQLAPI('https://api.example.com/graphql')

// 优势：一次请求获取所有数据
const userInfo = await api.getUserFullInfo(1)

// 优势：只获取需要的字段
const basicInfo = await api.getUserBasicInfo(1)

// 订阅新文章
const unsubscribe = api.subscribeToNewPosts((post) => {
  console.log('新文章:', post)
})
```

### 3. REST vs GraphQL 对比

```javascript
// 对比表
const comparison = {
  REST: {
    数据获取: '多个端点，可能需要多次请求',
    过度获取: '✅ 常见（返回不需要的字段）',
    欠获取: '✅ 常见（需要额外请求）',
    版本管理: '需要版本号（/v1/users）',
    缓存: '✅ 容易（HTTP 缓存）',
    学习曲线: '低',
    适用场景: [
      '简单 CRUD',
      '公共 API',
      '需要 HTTP 缓存',
      '团队熟悉 REST'
    ]
  },
  
  GraphQL: {
    数据获取: '单个端点，一次请求获取所有数据',
    过度获取: '❌ 无（只返回请求的字段）',
    欠获取: '❌ 无（一次获取所有需要的数据）',
    版本管理: '无需版本号（字段级别演进）',
    缓存: '⚠️ 复杂（需要客户端缓存）',
    学习曲线: '中等',
    适用场景: [
      '复杂数据关系',
      '移动应用（减少请求）',
      '快速迭代',
      '需要灵活查询'
    ]
  }
}
```

## gRPC-Web

### 1. gRPC-Web 基础

```javascript
// Protocol Buffers 定义（.proto 文件）
/*
syntax = "proto3";

package example;

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);
}

message GetUserRequest {
  int32 id = 1;
}

message ListUsersRequest {
  int32 page = 1;
  int32 page_size = 2;
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}
*/

// 生成的客户端代码
import { UserServiceClient } from './generated/user_grpc_web_pb'
import { GetUserRequest, ListUsersRequest } from './generated/user_pb'

// 创建客户端
const client = new UserServiceClient('https://api.example.com')

// 调用 RPC 方法
async function getUser(id) {
  const request = new GetUserRequest()
  request.setId(id)
  
  try {
    const response = await client.getUser(request, {})
    const user = response.toObject()
    console.log('用户:', user)
    return user
  } catch (error) {
    console.error('获取用户失败:', error)
    throw error
  }
}

// 流式响应
function listUsers(page, pageSize) {
  const request = new ListUsersRequest()
  request.setPage(page)
  request.setPageSize(pageSize)
  
  const stream = client.listUsers(request, {})
  
  stream.on('data', (user) => {
    console.log('收到用户:', user.toObject())
  })
  
  stream.on('error', (error) => {
    console.error('流错误:', error)
  })
  
  stream.on('end', () => {
    console.log('流结束')
  })
}

// 使用示例
await getUser(1)
listUsers(1, 10)
```

### 2. gRPC-Web vs REST vs GraphQL

```javascript
// 对比表
const comparison = {
  'REST': {
    协议: 'HTTP/1.1, HTTP/2',
    数据格式: 'JSON, XML',
    类型安全: '❌',
    代码生成: '❌',
    流式传输: '❌',
    性能: '中',
    浏览器支持: '✅ 原生',
    适用场景: '公共 API、简单 CRUD'
  },
  
  'GraphQL': {
    协议: 'HTTP/1.1, HTTP/2',
    数据格式: 'JSON',
    类型安全: '✅ (Schema)',
    代码生成: '✅',
    流式传输: '✅ (Subscription)',
    性能: '中',
    浏览器支持: '✅ 原生',
    适用场景: '复杂查询、移动应用'
  },
  
  'gRPC-Web': {
    协议: 'HTTP/2',
    数据格式: 'Protocol Buffers',
    类型安全: '✅',
    代码生成: '✅',
    流式传输: '✅',
    性能: '高',
    浏览器支持: '⚠️ 需要代理',
    适用场景: '微服务、高性能、内部 API'
  }
}
```

## 网络优化最佳实践

### 1. 连接优化

```javascript
// DNS 预解析
<link rel="dns-prefetch" href="//api.example.com">
<link rel="dns-prefetch" href="//cdn.example.com">

// 预连接
<link rel="preconnect" href="//api.example.com">
<link rel="preconnect" href="//cdn.example.com" crossorigin>

// 预加载
<link rel="preload" href="/api/data" as="fetch" crossorigin>
<link rel="preload" href="/style.css" as="style">
<link rel="preload" href="/script.js" as="script">

// 预获取
<link rel="prefetch" href="/next-page.html">
<link rel="prefetch" href="/next-page-data.json">
```

### 2. HTTP/2 优化

```javascript
// HTTP/2 最佳实践
const http2BestPractices = {
  // 1. 不要合并文件
  不要合并: '利用多路复用，按需加载',
  
  // 2. 不要域名分片
  不要分片: '单个连接即可',
  
  // 3. 使用服务器推送
  服务器推送: '推送关键资源',
  
  // 4. 压缩头部
  头部压缩: 'HPACK 自动处理',
  
  // 5. 设置优先级
  优先级: '关键资源优先'
}

// 服务器推送示例（Nginx）
/*
location / {
  http2_push /style.css;
  http2_push /script.js;
  http2_push /logo.png;
}
*/
```

### 3. 请求优化

```javascript
// 请求优化策略
class RequestOptimizer {
  constructor() {
    this.cache = new Map()
    this.pending = new Map()
  }
  
  // 请求去重
  async dedupe(url) {
    // 检查缓存
    if (this.cache.has(url)) {
      return this.cache.get(url)
    }
    
    // 检查是否有进行中的请求
    if (this.pending.has(url)) {
      return this.pending.get(url)
    }
    
    // 发起新请求
    const promise = fetch(url)
      .then(res => res.json())
      .then(data => {
        this.cache.set(url, data)
        this.pending.delete(url)
        return data
      })
      .catch(error => {
        this.pending.delete(url)
        throw error
      })
    
    this.pending.set(url, promise)
    return promise
  }
  
  // 请求合并
  async batch(urls) {
    return Promise.all(urls.map(url => this.dedupe(url)))
  }
  
  // 请求重试
  async retry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fetch(url).then(res => res.json())
      } catch (error) {
        if (i === maxRetries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
      }
    }
  }
  
  // 请求超时
  async timeout(url, ms = 5000) {
    return Promise.race([
      fetch(url).then(res => res.json()),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('请求超时')), ms)
      )
    ])
  }
}

// 使用示例
const optimizer = new RequestOptimizer()

// 去重
const data1 = await optimizer.dedupe('/api/users')
const data2 = await optimizer.dedupe('/api/users') // 使用缓存

// 合并
const [users, posts] = await optimizer.batch(['/api/users', '/api/posts'])

// 重试
const data = await optimizer.retry('/api/data', 3)

// 超时
const data = await optimizer.timeout('/api/data', 5000)
```

## 常见问题

### 1. 如何选择实时通信方案？

```javascript
// 选择指南
const guide = {
  '单向推送（服务器 → 客户端）': {
    推荐: 'Server-Sent Events (SSE)',
    场景: '实时通知、股票行情、日志推送'
  },
  
  '双向通信': {
    推荐: 'WebSocket',
    场景: '聊天、在线游戏、协同编辑'
  },
  
  '音视频通信': {
    推荐: 'WebRTC',
    场景: '视频会议、屏幕共享、P2P 文件传输'
  },
  
  '轮询': {
    推荐: '短轮询 / 长轮询',
    场景: '兼容性要求高、实时性要求低'
  }
}
```

### 2. WebSocket 如何处理断线重连？

参考前面的 `WebSocketClient` 类实现，包含：
- 指数退避重连策略
- 最大重连次数限制
- 心跳机制检测连接状态

### 3. HTTP/2 和 HTTP/3 如何选择？

```javascript
// 选择建议
const recommendation = {
  'HTTP/2': {
    适用: '大部分场景',
    优势: '成熟稳定、广泛支持',
    劣势: 'TCP 队头阻塞'
  },
  
  'HTTP/3': {
    适用: '移动端、弱网环境',
    优势: '无队头阻塞、连接迁移',
    劣势: '支持度较低、需要 UDP'
  },
  
  建议: '优先使用 HTTP/2，HTTP/3 作为降级方案'
}
```

## 面试要点

### 核心概念

1. **HTTP 协议演进**
   - HTTP/1.1：持久连接、管道化、队头阻塞
   - HTTP/2：二进制分帧、多路复用、头部压缩、服务器推送
   - HTTP/3：基于 QUIC、0-RTT、连接迁移、无队头阻塞

2. **实时通信方案**
   - WebSocket：双向通信、需要专门服务器
   - SSE：单向推送、基于 HTTP、自动重连
   - WebRTC：P2P 通信、音视频、数据通道

3. **API 设计**
   - REST：资源导向、多端点、HTTP 缓存
   - GraphQL：查询语言、单端点、灵活查询
   - gRPC：高性能、类型安全、流式传输

### 实战经验

1. **如何优化网络请求？**
   - 减少请求数量（合并、雪碧图）
   - 使用 HTTP/2 多路复用
   - 启用压缩（Gzip、Brotli）
   - 使用 CDN
   - 实现请求缓存

2. **如何实现 WebSocket 心跳？**
   - 定时发送 ping 消息
   - 等待 pong 响应
   - 超时则重连
   - 参考前面的实现

3. **GraphQL 的优缺点？**
   - 优点：灵活查询、减少请求、类型安全
   - 缺点：缓存复杂、学习曲线、查询复杂度控制

## 参考资料

### 官方文档
- [HTTP/2 - RFC 7540](https://httpwg.org/specs/rfc7540.html)
- [HTTP/3 - RFC 9114](https://www.rfc-editor.org/rfc/rfc9114.html)
- [WebSocket - RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455)
- [WebRTC](https://webrtc.org/)
- [GraphQL](https://graphql.org/)
- [gRPC](https://grpc.io/)

### 学习资源
- [HTTP/2 详解 - Google](https://developers.google.com/web/fundamentals/performance/http2)
- [WebSocket 教程 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)
- [WebRTC 入门 - WebRTC.org](https://webrtc.org/getting-started/overview)
- [GraphQL 中文文档](https://graphql.cn/)

---

> 💡 **提示**：选择合适的网络协议和通信方案对应用性能和用户体验至关重要。根据实际场景选择最合适的技术方案。
