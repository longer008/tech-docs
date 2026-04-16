# Web API 深入解析

> 更新时间：2025-02

## 目录

[[toc]]

## Service Worker 完全指南

### 1. Service Worker 基础

```javascript
// Service Worker 是什么？
// - 运行在浏览器后台的脚本
// - 独立于网页，不能直接访问 DOM
// - 可以拦截和处理网络请求
// - 支持离线功能、推送通知、后台同步

// Service Worker 生命周期
const lifecycle = {
  注册: 'navigator.serviceWorker.register()',
  安装: 'install 事件',
  激活: 'activate 事件',
  运行: 'fetch、message 等事件',
  更新: '检测到新的 Service Worker',
  卸载: 'unregister()'
}

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW 注册成功:', registration)
        
        // 监听更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('新的 Service Worker 已安装，等待激活')
              // 提示用户刷新页面
              if (confirm('发现新版本，是否刷新页面？')) {
                window.location.reload()
              }
            }
          })
        })
      })
      .catch(error => {
        console.error('SW 注册失败:', error)
      })
  })
}

// sw.js - Service Worker 文件
const CACHE_NAME = 'my-app-v1'
const urlsToCache = [
  '/',
  '/styles.css',
  '/script.js',
  '/image.jpg'
]

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('缓存已打开')
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        // 跳过等待，立即激活
        return self.skipWaiting()
      })
  )
})

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...')
  
  event.waitUntil(
    // 清理旧缓存
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      // 立即控制所有页面
      return self.clients.claim()
    })
  )
})

// 拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中
        if (response) {
          return response
        }
        
        // 克隆请求
        const fetchRequest = event.request.clone()
        
        return fetch(fetchRequest).then((response) => {
          // 检查是否是有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          
          // 克隆响应
          const responseToCache = response.clone()
          
          // 缓存响应
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache)
            })
          
          return response
        })
      })
  )
})
```

### 2. 缓存策略

```javascript
// 1. Cache First（缓存优先）
// 适用：静态资源（CSS、JS、图片）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
      })
  )
})

// 2. Network First（网络优先）
// 适用：API 请求、动态内容
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
      })
  )
})

// 3. Cache Only（仅缓存）
// 适用：离线页面
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
  )
})

// 4. Network Only（仅网络）
// 适用：不需要缓存的请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
  )
})

// 5. Stale While Revalidate（过期重新验证）
// 适用：需要快速响应但也要保持更新的资源
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone())
          return networkResponse
        })
        
        return response || fetchPromise
      })
    })
  )
})

// 6. Cache with Network Fallback（缓存降级到网络）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        
        return fetch(event.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone())
            return response
          })
        })
      })
      .catch(() => {
        // 返回离线页面
        return caches.match('/offline.html')
      })
  )
})

// 7. 根据请求类型使用不同策略
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // API 请求：网络优先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    )
    return
  }
  
  // 静态资源：缓存优先
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request)
        .then((response) => response || fetch(request))
    )
    return
  }
  
  // HTML：过期重新验证
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((response) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          cache.put(request, networkResponse.clone())
          return networkResponse
        })
        
        return response || fetchPromise
      })
    })
  )
})
```

### 3. 后台同步

```javascript
// 注册后台同步
navigator.serviceWorker.ready.then((registration) => {
  return registration.sync.register('sync-data')
})

// sw.js - 处理后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // 同步数据
      syncData()
    )
  }
})

async function syncData() {
  // 获取待同步的数据
  const db = await openDB()
  const data = await db.getAll('pending-sync')
  
  // 发送到服务器
  for (const item of data) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(item)
      })
      
      // 同步成功，删除数据
      await db.delete('pending-sync', item.id)
    } catch (error) {
      console.error('同步失败:', error)
    }
  }
}

// 实际应用：离线表单提交
// 页面代码
async function submitForm(data) {
  try {
    // 尝试在线提交
    await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  } catch (error) {
    // 离线，保存到 IndexedDB
    const db = await openDB()
    await db.add('pending-sync', data)
    
    // 注册后台同步
    const registration = await navigator.serviceWorker.ready
    await registration.sync.register('sync-form')
    
    alert('您当前离线，数据将在恢复网络后自动提交')
  }
}
```

### 4. 推送通知

```javascript
// 请求通知权限
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission()
  
  if (permission === 'granted') {
    console.log('通知权限已授予')
    return true
  } else {
    console.log('通知权限被拒绝')
    return false
  }
}

// 订阅推送
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready
  
  // 获取公钥
  const publicKey = 'YOUR_PUBLIC_VAPID_KEY'
  
  // 订阅
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  })
  
  console.log('订阅成功:', subscription)
  
  // 发送订阅信息到服务器
  await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  })
  
  return subscription
}

// 辅助函数：转换公钥格式
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}

// sw.js - 接收推送
self.addEventListener('push', (event) => {
  console.log('收到推送:', event)
  
  let data = {}
  
  if (event.data) {
    data = event.data.json()
  }
  
  const options = {
    body: data.body || '您有新消息',
    icon: '/icon-192.png',
    badge: '/badge.png',
    image: data.image,
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: '打开' },
      { action: 'close', title: '关闭' }
    ],
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    renotify: true
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || '新消息', options)
  )
})

// 点击通知
self.addEventListener('notificationclick', (event) => {
  console.log('通知被点击:', event)
  
  event.notification.close()
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    )
  }
})

// 关闭通知
self.addEventListener('notificationclose', (event) => {
  console.log('通知被关闭:', event)
})
```

## IndexedDB 本地数据库

### 1. IndexedDB 基础

```javascript
// IndexedDB 是什么？
// - 浏览器内置的 NoSQL 数据库
// - 支持存储大量结构化数据
// - 支持事务、索引、游标
// - 异步 API

// 打开数据库
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MyDatabase', 1)
    
    // 数据库升级（创建对象存储）
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      // 创建对象存储
      if (!db.objectStoreNames.contains('users')) {
        const objectStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true })
        
        // 创建索引
        objectStore.createIndex('name', 'name', { unique: false })
        objectStore.createIndex('email', 'email', { unique: true })
      }
    }
    
    request.onsuccess = (event) => {
      resolve(event.target.result)
    }
    
    request.onerror = (event) => {
      reject(event.target.error)
    }
  })
}

// 添加数据
async function addUser(user) {
  const db = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['users'], 'readwrite')
    const objectStore = transaction.objectStore('users')
    const request = objectStore.add(user)
    
    request.onsuccess = () => {
      resolve(request.result)
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

// 获取数据
async function getUser(id) {
  const db = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['users'], 'readonly')
    const objectStore = transaction.objectStore('users')
    const request = objectStore.get(id)
    
    request.onsuccess = () => {
      resolve(request.result)
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

// 更新数据
async function updateUser(user) {
  const db = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['users'], 'readwrite')
    const objectStore = transaction.objectStore('users')
    const request = objectStore.put(user)
    
    request.onsuccess = () => {
      resolve(request.result)
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

// 删除数据
async function deleteUser(id) {
  const db = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['users'], 'readwrite')
    const objectStore = transaction.objectStore('users')
    const request = objectStore.delete(id)
    
    request.onsuccess = () => {
      resolve()
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

// 获取所有数据
async function getAllUsers() {
  const db = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['users'], 'readonly')
    const objectStore = transaction.objectStore('users')
    const request = objectStore.getAll()
    
    request.onsuccess = () => {
      resolve(request.result)
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

// 使用索引查询
async function getUserByEmail(email) {
  const db = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['users'], 'readonly')
    const objectStore = transaction.objectStore('users')
    const index = objectStore.index('email')
    const request = index.get(email)
    
    request.onsuccess = () => {
      resolve(request.result)
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

// 使用游标遍历
async function iterateUsers() {
  const db = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['users'], 'readonly')
    const objectStore = transaction.objectStore('users')
    const request = objectStore.openCursor()
    
    const users = []
    
    request.onsuccess = (event) => {
      const cursor = event.target.result
      
      if (cursor) {
        users.push(cursor.value)
        cursor.continue()
      } else {
        resolve(users)
      }
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}
```

### 2. 使用 idb 库简化操作

```javascript
// 安装: npm install idb

import { openDB } from 'idb'

// 打开数据库
const db = await openDB('MyDatabase', 1, {
  upgrade(db) {
    // 创建对象存储
    const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true })
    userStore.createIndex('name', 'name')
    userStore.createIndex('email', 'email', { unique: true })
  }
})

// 添加数据
await db.add('users', { name: '张三', email: 'zhangsan@example.com' })

// 获取数据
const user = await db.get('users', 1)

// 更新数据
await db.put('users', { id: 1, name: '张三', email: 'zhangsan@example.com' })

// 删除数据
await db.delete('users', 1)

// 获取所有数据
const users = await db.getAll('users')

// 使用索引查询
const user = await db.getFromIndex('users', 'email', 'zhangsan@example.com')

// 使用游标
const tx = db.transaction('users', 'readonly')
let cursor = await tx.store.openCursor()

while (cursor) {
  console.log(cursor.value)
  cursor = await cursor.continue()
}

await tx.done
```

### 3. IndexedDB 实战应用

```javascript
// 离线数据同步
class OfflineDataSync {
  constructor() {
    this.dbName = 'OfflineSync'
    this.storeName = 'pending'
  }
  
  async init() {
    this.db = await openDB(this.dbName, 1, {
      upgrade(db) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true })
      }
    })
  }
  
  // 添加待同步数据
  async addPending(data) {
    await this.db.add('pending', {
      data,
      timestamp: Date.now(),
      synced: false
    })
  }
  
  // 获取待同步数据
  async getPending() {
    const all = await this.db.getAll('pending')
    return all.filter(item => !item.synced)
  }
  
  // 标记为已同步
  async markSynced(id) {
    const item = await this.db.get('pending', id)
    item.synced = true
    await this.db.put('pending', item)
  }
  
  // 同步数据
  async sync() {
    const pending = await this.getPending()
    
    for (const item of pending) {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          body: JSON.stringify(item.data)
        })
        
        await this.markSynced(item.id)
      } catch (error) {
        console.error('同步失败:', error)
      }
    }
  }
}

// 使用示例
const sync = new OfflineDataSync()
await sync.init()

// 添加数据
await sync.addPending({ type: 'create', data: { name: '张三' } })

// 同步
await sync.sync()
```

## Web Workers 多线程

### 1. Web Worker 基础

```javascript
// Web Worker 是什么？
// - 在后台线程运行 JavaScript
// - 不阻塞主线程
// - 不能访问 DOM
// - 通过消息通信

// 主线程
// 创建 Worker
const worker = new Worker('worker.js')

// 发送消息
worker.postMessage({ type: 'start', data: [1, 2, 3, 4, 5] })

// 接收消息
worker.onmessage = (event) => {
  console.log('收到消息:', event.data)
}

// 错误处理
worker.onerror = (error) => {
  console.error('Worker 错误:', error)
}

// 终止 Worker
worker.terminate()

// worker.js
// 接收消息
self.onmessage = (event) => {
  console.log('收到消息:', event.data)
  
  const { type, data } = event.data
  
  if (type === 'start') {
    // 执行计算
    const result = data.reduce((sum, num) => sum + num, 0)
    
    // 发送结果
    self.postMessage({ type: 'result', data: result })
  }
}

// 发送消息
self.postMessage({ type: 'ready' })
```

### 2. 实战应用

```javascript
// 1. 大数据处理
// 主线程
const worker = new Worker('data-processor.js')

worker.postMessage({
  type: 'process',
  data: largeDataArray
})

worker.onmessage = (event) => {
  const { type, data } = event.data
  
  if (type === 'progress') {
    console.log('进度:', data.progress + '%')
  } else if (type === 'result') {
    console.log('结果:', data)
    worker.terminate()
  }
}

// data-processor.js
self.onmessage = (event) => {
  const { type, data } = event.data
  
  if (type === 'process') {
    const total = data.length
    const result = []
    
    for (let i = 0; i < total; i++) {
      // 处理数据
      result.push(processItem(data[i]))
      
      // 报告进度
      if (i % 1000 === 0) {
        self.postMessage({
          type: 'progress',
          data: { progress: Math.round((i / total) * 100) }
        })
      }
    }
    
    // 发送结果
    self.postMessage({
      type: 'result',
      data: result
    })
  }
}

function processItem(item) {
  // 处理逻辑
  return item * 2
}

// 2. 图片处理
// 主线程
const worker = new Worker('image-processor.js')

// 获取图片数据
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
const img = new Image()

img.onload = () => {
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  
  // 发送到 Worker
  worker.postMessage({
    type: 'process',
    imageData
  }, [imageData.data.buffer]) // 转移所有权
}

img.src = 'image.jpg'

worker.onmessage = (event) => {
  const { type, imageData } = event.data
  
  if (type === 'result') {
    // 显示处理后的图片
    ctx.putImageData(imageData, 0, 0)
  }
}

// image-processor.js
self.onmessage = (event) => {
  const { type, imageData } = event.data
  
  if (type === 'process') {
    // 灰度处理
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = avg     // R
      data[i + 1] = avg // G
      data[i + 2] = avg // B
    }
    
    // 发送结果
    self.postMessage({
      type: 'result',
      imageData
    }, [imageData.data.buffer])
  }
}
```

### 3. Shared Worker

```javascript
// Shared Worker 可以被多个页面共享

// 主线程
const worker = new SharedWorker('shared-worker.js')

// 发送消息
worker.port.postMessage({ type: 'connect', id: 'page1' })

// 接收消息
worker.port.onmessage = (event) => {
  console.log('收到消息:', event.data)
}

// shared-worker.js
const connections = []

self.onconnect = (event) => {
  const port = event.ports[0]
  
  connections.push(port)
  
  port.onmessage = (event) => {
    const { type, data } = event.data
    
    if (type === 'broadcast') {
      // 广播消息给所有连接
      connections.forEach(conn => {
        conn.postMessage({ type: 'message', data })
      })
    }
  }
}
```


## File API 文件处理

### 1. 文件读取

```javascript
// 1. 使用 FileReader
const input = document.querySelector('input[type="file"]')

input.addEventListener('change', (event) => {
  const file = event.target.files[0]
  
  if (!file) return
  
  const reader = new FileReader()
  
  // 读取为文本
  reader.readAsText(file)
  
  // 或读取为 Data URL
  // reader.readAsDataURL(file)
  
  // 或读取为 ArrayBuffer
  // reader.readAsArrayBuffer(file)
  
  reader.onload = (e) => {
    console.log('文件内容:', e.target.result)
  }
  
  reader.onerror = (e) => {
    console.error('读取失败:', e)
  }
})

// 2. 读取大文件（分片读取）
async function readLargeFile(file) {
  const chunkSize = 1024 * 1024 // 1MB
  const chunks = Math.ceil(file.size / chunkSize)
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)
    
    const reader = new FileReader()
    
    await new Promise((resolve, reject) => {
      reader.onload = (e) => {
        console.log(`读取分片 ${i + 1}/${chunks}`)
        // 处理分片数据
        resolve()
      }
      
      reader.onerror = reject
      
      reader.readAsArrayBuffer(chunk)
    })
  }
}
```

### 2. 文件上传

```javascript
// 1. 基础上传
async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
  
  return response.json()
}

// 2. 带进度的上传
function uploadFileWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    // 监听上传进度
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100
        onProgress(progress)
      }
    })
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error('上传失败'))
      }
    })
    
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误'))
    })
    
    const formData = new FormData()
    formData.append('file', file)
    
    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}

// 使用示例
const file = document.querySelector('input[type="file"]').files[0]

uploadFileWithProgress(file, (progress) => {
  console.log('上传进度:', progress + '%')
}).then((result) => {
  console.log('上传成功:', result)
}).catch((error) => {
  console.error('上传失败:', error)
})

// 3. 分片上传
async function uploadLargeFile(file) {
  const chunkSize = 1024 * 1024 // 1MB
  const chunks = Math.ceil(file.size / chunkSize)
  const fileId = generateFileId()
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)
    
    const formData = new FormData()
    formData.append('file', chunk)
    formData.append('fileId', fileId)
    formData.append('chunkIndex', i)
    formData.append('totalChunks', chunks)
    
    await fetch('/api/upload-chunk', {
      method: 'POST',
      body: formData
    })
    
    console.log(`上传分片 ${i + 1}/${chunks}`)
  }
  
  // 通知服务器合并分片
  await fetch('/api/merge-chunks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, totalChunks: chunks })
  })
}

function generateFileId() {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

// 4. 断点续传
class ResumableUpload {
  constructor(file) {
    this.file = file
    this.chunkSize = 1024 * 1024 // 1MB
    this.chunks = Math.ceil(file.size / this.chunkSize)
    this.fileId = this.generateFileId()
    this.uploadedChunks = new Set()
  }
  
  generateFileId() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }
  
  async upload() {
    // 检查已上传的分片
    const response = await fetch(`/api/check-upload?fileId=${this.fileId}`)
    const { uploadedChunks } = await response.json()
    
    this.uploadedChunks = new Set(uploadedChunks)
    
    // 上传未完成的分片
    for (let i = 0; i < this.chunks; i++) {
      if (this.uploadedChunks.has(i)) {
        console.log(`分片 ${i} 已上传，跳过`)
        continue
      }
      
      await this.uploadChunk(i)
    }
    
    // 合并分片
    await this.mergeChunks()
  }
  
  async uploadChunk(index) {
    const start = index * this.chunkSize
    const end = Math.min(start + this.chunkSize, this.file.size)
    const chunk = this.file.slice(start, end)
    
    const formData = new FormData()
    formData.append('file', chunk)
    formData.append('fileId', this.fileId)
    formData.append('chunkIndex', index)
    
    await fetch('/api/upload-chunk', {
      method: 'POST',
      body: formData
    })
    
    this.uploadedChunks.add(index)
    console.log(`上传分片 ${index + 1}/${this.chunks}`)
  }
  
  async mergeChunks() {
    await fetch('/api/merge-chunks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: this.fileId,
        totalChunks: this.chunks
      })
    })
  }
}

// 使用示例
const file = document.querySelector('input[type="file"]').files[0]
const upload = new ResumableUpload(file)

upload.upload().then(() => {
  console.log('上传完成')
}).catch((error) => {
  console.error('上传失败:', error)
  // 可以重新调用 upload.upload() 继续上传
})
```

### 3. 文件下载

```javascript
// 1. 下载文件
function downloadFile(url, filename) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

// 2. 下载 Blob
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  downloadFile(url, filename)
  URL.revokeObjectURL(url)
}

// 3. 下载文本
function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' })
  downloadBlob(blob, filename)
}

// 4. 下载 JSON
function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, filename)
}

// 5. 下载 Canvas
function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    downloadBlob(blob, filename)
  })
}

// 6. 带进度的下载
async function downloadWithProgress(url, onProgress) {
  const response = await fetch(url)
  const reader = response.body.getReader()
  const contentLength = +response.headers.get('Content-Length')
  
  let receivedLength = 0
  const chunks = []
  
  while (true) {
    const { done, value } = await reader.read()
    
    if (done) break
    
    chunks.push(value)
    receivedLength += value.length
    
    const progress = (receivedLength / contentLength) * 100
    onProgress(progress)
  }
  
  const blob = new Blob(chunks)
  return blob
}

// 使用示例
downloadWithProgress('/api/download/large-file', (progress) => {
  console.log('下载进度:', progress + '%')
}).then((blob) => {
  downloadBlob(blob, 'large-file.zip')
})
```

## Drag and Drop API

### API 概述

Drag and Drop API 是 HTML5 提供的原生拖放功能，支持元素拖放、文件拖放、文本拖放等操作。

**核心特性：**
- 通过 `dataTransfer` 对象传递数据
- 支持自定义拖放效果和拖放图像
- 支持文件和文件夹拖放
- 可与触摸事件结合实现移动端拖放

### 拖放事件

| 事件 | 触发时机 | 触发对象 | 是否需要 preventDefault | 说明 |
|------|---------|---------|----------------------|------|
| `dragstart` | 开始拖动元素时 | 被拖动元素 | 否 | 设置拖放数据、效果、图像 |
| `drag` | 拖动过程中（持续触发） | 被拖动元素 | 否 | 可获取鼠标位置，频繁触发 |
| `dragend` | 拖动结束时 | 被拖动元素 | 否 | 清理状态、检查拖放结果 |
| `dragenter` | 拖动元素进入目标时 | 放置目标 | 是 | 添加视觉反馈 |
| `dragover` | 拖动元素在目标上方（持续触发） | 放置目标 | 是（必须） | 设置 dropEffect，允许放置 |
| `dragleave` | 拖动元素离开目标时 | 放置目标 | 否 | 移除视觉反馈 |
| `drop` | 在目标上放置元素时 | 放置目标 | 是（必须） | 获取数据、执行放置操作 |

### DataTransfer 对象

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| `effectAllowed` | 属性 | 设置允许的拖放效果：`'copy'` `'move'` `'link'` `'copyMove'` `'copyLink'` `'linkMove'` `'all'` `'none'` |
| `dropEffect` | 属性 | 设置实际的拖放效果（在 `dragover` 中设置）：`'copy'` `'move'` `'link'` `'none'` |
| `files` | 属性 | 拖放的文件列表（FileList 对象） |
| `items` | 属性 | DataTransferItemList 对象，用于访问拖放项 |
| `types` | 属性 | 拖放数据的 MIME 类型数组 |
| `setData(format, data)` | 方法 | 设置拖放数据，format 为 MIME 类型（如 `'text/plain'`、`'text/html'`） |
| `getData(format)` | 方法 | 获取拖放数据 |
| `clearData([format])` | 方法 | 清除拖放数据，不传参数则清除所有 |
| `setDragImage(img, x, y)` | 方法 | 设置自定义拖放图像，x/y 为鼠标相对图像的偏移量 |

### 1. 拖放基础

```javascript
// Drag and Drop API 完整示例
// 演示所有核心事件和方法的使用

// 拖放事件流程
const dragEvents = {
  拖动元素: ['dragstart', 'drag', 'dragend'],
  放置目标: ['dragenter', 'dragover', 'dragleave', 'drop']
}

// 1. 基础拖放示例
const draggable = document.querySelector('.draggable')

// 设置元素可拖放（必须设置 draggable 属性为 true）
draggable.draggable = true

// ========== 拖动元素事件 ==========

// dragstart - 开始拖放时触发（只触发一次）
// 作用：设置拖放数据、拖放效果、自定义拖放图像
draggable.addEventListener('dragstart', (e) => {
  console.log('开始拖放')
  
  // setData() - 设置拖放数据（必须调用，否则拖放无效）
  // 参数1：MIME 类型（'text/plain'、'text/html'、'text/uri-list' 等）
  // 参数2：数据内容
  e.dataTransfer.setData('text/plain', e.target.id)
  e.dataTransfer.setData('text/html', e.target.outerHTML)
  
  // effectAllowed - 设置允许的拖放效果
  // 可选值：'copy'（复制）、'move'（移动）、'link'（链接）
  //        'copyMove'、'copyLink'、'linkMove'、'all'、'none'
  e.dataTransfer.effectAllowed = 'move'
  
  // setDragImage() - 设置自定义拖放图像
  // 参数1：图像元素（Image、Canvas 或任何 DOM 元素）
  // 参数2：鼠标相对图像的 X 偏移量
  // 参数3：鼠标相对图像的 Y 偏移量
  const img = new Image()
  img.src = 'drag-image.png'
  e.dataTransfer.setDragImage(img, 10, 10)
  
  // 添加拖放样式（视觉反馈）
  e.target.classList.add('dragging')
})

// drag - 拖放过程中持续触发（类似 mousemove）
// 作用：跟踪拖放位置、实时更新 UI
// 注意：频繁触发，避免在此执行耗时操作
draggable.addEventListener('drag', (e) => {
  // 可以获取当前鼠标位置
  console.log('拖放中:', e.clientX, e.clientY)
  
  // 注意：在某些浏览器中，拖放到窗口外时 clientX/clientY 可能为 0
})

// dragend - 拖放结束时触发（无论成功或失败）
// 作用：清理状态、检查拖放结果、恢复 UI
draggable.addEventListener('dragend', (e) => {
  console.log('拖放结束')
  
  // 移除拖放样式
  e.target.classList.remove('dragging')
  
  // dropEffect - 检查实际的拖放效果
  // 可能值：'copy'、'move'、'link'、'none'（拖放失败）
  if (e.dataTransfer.dropEffect === 'move') {
    console.log('移动成功')
    // 可以在这里删除原元素（如果是移动操作）
  } else if (e.dataTransfer.dropEffect === 'none') {
    console.log('拖放取消或失败')
  }
})

// ========== 放置目标事件 ==========

const dropzone = document.querySelector('.dropzone')

// dragenter - 拖动元素进入放置区域时触发
// 作用：添加视觉反馈、验证是否允许放置
// 注意：必须调用 preventDefault()，否则无法触发 drop 事件
dropzone.addEventListener('dragenter', (e) => {
  e.preventDefault() // ⚠️ 必须阻止默认行为
  console.log('进入放置区域')
  
  // 添加视觉反馈（高亮显示放置区域）
  dropzone.classList.add('drag-over')
  
  // 可以根据拖放数据类型决定是否允许放置
  const types = e.dataTransfer.types
  if (!types.includes('text/plain')) {
    e.dataTransfer.dropEffect = 'none' // 不允许放置
  }
})

// dragover - 拖动元素在放置区域上方时持续触发
// 作用：设置 dropEffect、持续验证放置条件
// 注意：⚠️ 必须调用 preventDefault()，否则无法触发 drop 事件
//      这是最重要的事件，不阻止默认行为会导致拖放失败
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault() // ⚠️ 必须阻止默认行为（允许放置）
  
  // dropEffect - 设置放置效果（会显示对应的鼠标光标）
  // 必须是 effectAllowed 允许的值之一
  e.dataTransfer.dropEffect = 'move'
  
  // 可以根据鼠标位置动态调整放置位置
  // const rect = dropzone.getBoundingClientRect()
  // const y = e.clientY - rect.top
})

// dragleave - 拖动元素离开放置区域时触发
// 作用：移除视觉反馈
// 注意：子元素也会触发此事件，需要判断是否真正离开
dropzone.addEventListener('dragleave', (e) => {
  // 检查是否真正离开放置区域（不是进入子元素）
  if (e.target === dropzone) {
    console.log('离开放置区域')
    
    // 移除视觉反馈
    dropzone.classList.remove('drag-over')
  }
})

// drop - 在放置区域释放鼠标时触发
// 作用：获取拖放数据、执行放置操作
// 注意：必须调用 preventDefault()，否则浏览器会执行默认操作（如打开文件）
dropzone.addEventListener('drop', (e) => {
  e.preventDefault() // ⚠️ 必须阻止默认行为（如打开拖放的文件）
  console.log('放置')
  
  // 移除视觉反馈
  dropzone.classList.remove('drag-over')
  
  // getData() - 获取拖放数据
  // 参数：MIME 类型（必须与 setData 中的类型匹配）
  const id = e.dataTransfer.getData('text/plain')
  const html = e.dataTransfer.getData('text/html')
  
  console.log('拖放数据:', { id, html })
  
  // types - 获取所有可用的数据类型
  console.log('可用数据类型:', e.dataTransfer.types)
  
  // 执行放置操作（移动元素）
  const element = document.getElementById(id)
  if (element) {
    dropzone.appendChild(element)
  }
})
```

### 2. 文件拖放上传

```javascript
// 文件拖放上传（支持多文件）
// 演示如何处理文件拖放、验证文件类型和大小、上传文件

const dropzone = document.querySelector('.file-dropzone')

// 阻止浏览器默认打开文件行为
// 必须在所有拖放事件中阻止默认行为
;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, (e) => {
    e.preventDefault()    // 阻止默认行为（打开文件）
    e.stopPropagation()   // 阻止事件冒泡
  })
})

// 视觉反馈：进入和悬停时高亮显示
;['dragenter', 'dragover'].forEach(eventName => {
  dropzone.addEventListener(eventName, () => {
    dropzone.classList.add('highlight')
  })
})

// 视觉反馈：离开和放置时移除高亮
;['dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, () => {
    dropzone.classList.remove('highlight')
  })
})

// 处理文件拖放
dropzone.addEventListener('drop', async (e) => {
  // files - 获取拖放的文件列表（FileList 对象）
  // 注意：只有拖放文件时才有值，拖放元素时为空
  const files = Array.from(e.dataTransfer.files)
  
  console.log('拖放文件:', files)
  
  // 文件类型验证
  // file.type 返回 MIME 类型（如 'image/jpeg'、'application/pdf'）
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  const validFiles = files.filter(file => allowedTypes.includes(file.type))
  
  if (validFiles.length !== files.length) {
    alert('只支持 JPG、PNG、GIF 格式的图片')
  }
  
  // 文件大小验证（5MB = 5 * 1024 * 1024 字节）
  // file.size 返回文件大小（字节）
  const maxSize = 5 * 1024 * 1024
  const oversizedFiles = validFiles.filter(file => file.size > maxSize)
  
  if (oversizedFiles.length > 0) {
    alert('文件大小不能超过 5MB')
    return
  }
  
  // 上传所有有效文件
  for (const file of validFiles) {
    await uploadFile(file)
  }
})

// 上传文件函数
async function uploadFile(file) {
  // 使用 FormData 上传文件
  const formData = new FormData()
  formData.append('file', file)
  
  // 可以添加额外的字段
  formData.append('filename', file.name)
  formData.append('filesize', file.size)
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
      // 注意：不要设置 Content-Type，浏览器会自动设置为 multipart/form-data
    })
    
    const result = await response.json()
    console.log('上传成功:', result)
    
    // 显示预览
    displayPreview(file, result.url)
  } catch (error) {
    console.error('上传失败:', error)
  }
}

// 显示文件预览
function displayPreview(file, url) {
  // 使用 FileReader 读取文件内容
  const reader = new FileReader()
  
  // onload - 文件读取完成时触发
  reader.onload = (e) => {
    // e.target.result 包含文件的 Data URL
    const preview = document.createElement('div')
    preview.className = 'preview'
    preview.innerHTML = `
      <img src="${e.target.result}" alt="${file.name}">
      <p>${file.name} (${(file.size / 1024).toFixed(2)} KB)</p>
    `
    
    dropzone.appendChild(preview)
  }
  
  // readAsDataURL() - 将文件读取为 Data URL（base64 编码）
  // 其他方法：readAsText()、readAsArrayBuffer()、readAsBinaryString()
  reader.readAsDataURL(file)
}
```

### 3. 文件夹拖放（递归读取）

```javascript
// 拖放文件夹并递归读取所有文件
// 使用 DataTransferItemList API 和 File System Access API

dropzone.addEventListener('drop', async (e) => {
  e.preventDefault()
  
  // items - DataTransferItemList 对象，提供更强大的文件访问能力
  // 与 files 的区别：
  // - files: 只能获取文件，不能获取文件夹结构
  // - items: 可以获取文件和文件夹，支持递归读取
  const items = Array.from(e.dataTransfer.items)
  
  for (const item of items) {
    // kind - 数据类型：'file'（文件）或 'string'（文本数据）
    if (item.kind === 'file') {
      // webkitGetAsEntry() - 获取文件系统入口（FileSystemEntry）
      // 注意：这是 webkit 前缀的非标准 API，但被广泛支持
      // 返回 FileSystemFileEntry（文件）或 FileSystemDirectoryEntry（目录）
      const entry = item.webkitGetAsEntry()
      
      if (entry) {
        await processEntry(entry)
      }
    }
  }
})

// 递归处理文件系统入口
async function processEntry(entry, path = '') {
  // isFile - 判断是否为文件
  if (entry.isFile) {
    // 处理文件
    const file = await getFile(entry)
    console.log('文件:', path + file.name)
    
    // 可以访问文件的所有属性
    console.log('文件信息:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    })
    
    await uploadFile(file)
  } 
  // isDirectory - 判断是否为目录
  else if (entry.isDirectory) {
    // 处理目录
    console.log('目录:', path + entry.name)
    
    // 读取目录内容
    const entries = await readDirectory(entry)
    
    // 递归处理子项
    for (const childEntry of entries) {
      await processEntry(childEntry, path + entry.name + '/')
    }
  }
}

// 读取目录内容
function readDirectory(directoryEntry) {
  return new Promise((resolve, reject) => {
    // createReader() - 创建目录读取器（DirectoryReader）
    const reader = directoryEntry.createReader()
    const entries = []
    
    // readEntries() - 读取目录项
    // 注意：一次调用可能无法读取所有项（浏览器限制），需要递归调用
    // 当返回空数组时表示读取完成
    function readEntries() {
      reader.readEntries((results) => {
        if (results.length === 0) {
          // 读取完成
          resolve(entries)
        } else {
          // 还有更多项，继续读取
          entries.push(...results)
          readEntries() // 递归调用
        }
      }, reject)
    }
    
    readEntries()
  })
}

// 获取文件对象
function getFile(fileEntry) {
  return new Promise((resolve, reject) => {
    // file() - 从 FileSystemFileEntry 获取 File 对象
    // 回调函数接收 File 对象
    fileEntry.file(resolve, reject)
  })
}
```

### 4. 拖放排序列表

```javascript
// 可拖放排序的列表
// 演示如何实现列表项的拖放排序功能

class DraggableList {
  constructor(container) {
    this.container = container
    this.draggedElement = null  // 当前被拖动的元素
    this.init()
  }
  
  init() {
    // 为所有列表项添加拖放功能
    const items = this.container.querySelectorAll('.list-item')
    
    items.forEach(item => {
      // 设置元素可拖放
      item.draggable = true
      
      // 绑定所有拖放事件
      item.addEventListener('dragstart', this.handleDragStart.bind(this))
      item.addEventListener('dragenter', this.handleDragEnter.bind(this))
      item.addEventListener('dragover', this.handleDragOver.bind(this))
      item.addEventListener('dragleave', this.handleDragLeave.bind(this))
      item.addEventListener('drop', this.handleDrop.bind(this))
      item.addEventListener('dragend', this.handleDragEnd.bind(this))
    })
  }
  
  // 开始拖动
  handleDragStart(e) {
    // 保存被拖动的元素引用
    this.draggedElement = e.target
    
    // 添加拖动样式
    e.target.classList.add('dragging')
    
    // 设置拖放数据和效果
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.innerHTML)
  }
  
  // 拖动元素进入目标
  handleDragEnter(e) {
    // 只在列表项上添加样式，且不是被拖动的元素本身
    if (e.target.classList.contains('list-item') && e.target !== this.draggedElement) {
      e.target.classList.add('drag-over')
    }
  }
  
  // 拖动元素在目标上方
  handleDragOver(e) {
    e.preventDefault()  // 必须阻止默认行为
    e.dataTransfer.dropEffect = 'move'
    return false
  }
  
  // 拖动元素离开目标
  handleDragLeave(e) {
    // 移除高亮样式
    e.target.classList.remove('drag-over')
  }
  
  // 放置元素
  handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    
    // 只在列表项上执行放置，且不是被拖动的元素本身
    if (e.target.classList.contains('list-item') && e.target !== this.draggedElement) {
      // 计算拖放位置，交换元素位置
      const allItems = Array.from(this.container.querySelectorAll('.list-item'))
      const draggedIndex = allItems.indexOf(this.draggedElement)
      const targetIndex = allItems.indexOf(e.target)
      
      // 根据拖放方向插入元素
      if (draggedIndex < targetIndex) {
        // 向下拖动：插入到目标元素之后
        e.target.parentNode.insertBefore(this.draggedElement, e.target.nextSibling)
      } else {
        // 向上拖动：插入到目标元素之前
        e.target.parentNode.insertBefore(this.draggedElement, e.target)
      }
      
      // 移除高亮样式
      e.target.classList.remove('drag-over')
    }
    
    return false
  }
  
  // 拖动结束
  handleDragEnd(e) {
    // 移除拖动样式
    e.target.classList.remove('dragging')
    
    // 清理所有列表项的高亮样式
    const items = this.container.querySelectorAll('.list-item')
    items.forEach(item => {
      item.classList.remove('drag-over')
    })
    
    // 清空拖动元素引用
    this.draggedElement = null
  }
}

// 使用示例
const list = document.querySelector('.sortable-list')
new DraggableList(list)
```

### 5. 拖放到不同容器

```javascript
// 多个容器之间拖放
class DragDropManager {
  constructor() {
    this.containers = document.querySelectorAll('.drag-container')
    this.init()
  }
  
  init() {
    this.containers.forEach(container => {
      // 拖动元素
      const items = container.querySelectorAll('.drag-item')
      items.forEach(item => {
        item.draggable = true
        item.addEventListener('dragstart', this.handleDragStart.bind(this))
        item.addEventListener('dragend', this.handleDragEnd.bind(this))
      })
      
      // 放置容器
      container.addEventListener('dragenter', this.handleDragEnter.bind(this))
      container.addEventListener('dragover', this.handleDragOver.bind(this))
      container.addEventListener('dragleave', this.handleDragLeave.bind(this))
      container.addEventListener('drop', this.handleDrop.bind(this))
    })
  }
  
  handleDragStart(e) {
    e.target.classList.add('dragging')
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', e.target.dataset.id)
  }
  
  handleDragEnd(e) {
    e.target.classList.remove('dragging')
  }
  
  handleDragEnter(e) {
    if (e.target.classList.contains('drag-container')) {
      e.target.classList.add('drag-over')
    }
  }
  
  handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  
  handleDragLeave(e) {
    if (e.target.classList.contains('drag-container')) {
      e.target.classList.remove('drag-over')
    }
  }
  
  handleDrop(e) {
    e.preventDefault()
    
    if (e.target.classList.contains('drag-container')) {
      e.target.classList.remove('drag-over')
      
      const id = e.dataTransfer.getData('text/plain')
      const draggedElement = document.querySelector(`[data-id="${id}"]`)
      
      if (draggedElement) {
        e.target.appendChild(draggedElement)
        
        // 触发自定义事件
        const event = new CustomEvent('itemMoved', {
          detail: {
            item: draggedElement,
            from: draggedElement.parentElement,
            to: e.target
          }
        })
        document.dispatchEvent(event)
      }
    }
  }
}

// 使用
const manager = new DragDropManager()

// 监听移动事件
document.addEventListener('itemMoved', (e) => {
  console.log('元素移动:', e.detail)
})
```

### 6. 拖放与触摸事件兼容

```javascript
// 同时支持鼠标拖放和触摸拖放
class TouchDragDrop {
  constructor(element) {
    this.element = element
    this.isDragging = false
    this.currentX = 0
    this.currentY = 0
    this.initialX = 0
    this.initialY = 0
    this.xOffset = 0
    this.yOffset = 0
    
    this.init()
  }
  
  init() {
    // 鼠标事件
    this.element.addEventListener('dragstart', this.dragStart.bind(this))
    this.element.addEventListener('dragend', this.dragEnd.bind(this))
    
    // 触摸事件
    this.element.addEventListener('touchstart', this.touchStart.bind(this), { passive: false })
    this.element.addEventListener('touchmove', this.touchMove.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.touchEnd.bind(this))
  }
  
  // 鼠标拖放
  dragStart(e) {
    this.isDragging = true
    this.element.classList.add('dragging')
  }
  
  dragEnd(e) {
    this.isDragging = false
    this.element.classList.remove('dragging')
  }
  
  // 触摸拖放
  touchStart(e) {
    e.preventDefault()
    
    this.initialX = e.touches[0].clientX - this.xOffset
    this.initialY = e.touches[0].clientY - this.yOffset
    
    this.isDragging = true
    this.element.classList.add('dragging')
  }
  
  touchMove(e) {
    if (this.isDragging) {
      e.preventDefault()
      
      this.currentX = e.touches[0].clientX - this.initialX
      this.currentY = e.touches[0].clientY - this.initialY
      
      this.xOffset = this.currentX
      this.yOffset = this.currentY
      
      this.setTranslate(this.currentX, this.currentY)
    }
  }
  
  touchEnd(e) {
    this.isDragging = false
    this.element.classList.remove('dragging')
    
    // 检查是否放置在目标区域
    const dropzone = document.elementFromPoint(
      e.changedTouches[0].clientX,
      e.changedTouches[0].clientY
    )
    
    if (dropzone && dropzone.classList.contains('dropzone')) {
      dropzone.appendChild(this.element)
      this.xOffset = 0
      this.yOffset = 0
      this.setTranslate(0, 0)
    }
  }
  
  setTranslate(xPos, yPos) {
    this.element.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`
  }
}

// 使用
const draggables = document.querySelectorAll('.touch-draggable')
draggables.forEach(el => new TouchDragDrop(el))
```

### 7. 完整示例：看板拖放

```javascript
// Kanban 看板拖放系统
class KanbanBoard {
  constructor(boardElement) {
    this.board = boardElement
    this.columns = this.board.querySelectorAll('.kanban-column')
    this.init()
  }
  
  init() {
    // 初始化所有卡片
    this.columns.forEach(column => {
      this.initColumn(column)
    })
  }
  
  initColumn(column) {
    const cards = column.querySelectorAll('.kanban-card')
    
    // 卡片可拖放
    cards.forEach(card => {
      card.draggable = true
      card.addEventListener('dragstart', this.handleCardDragStart.bind(this))
      card.addEventListener('dragend', this.handleCardDragEnd.bind(this))
    })
    
    // 列可接收拖放
    column.addEventListener('dragenter', this.handleColumnDragEnter.bind(this))
    column.addEventListener('dragover', this.handleColumnDragOver.bind(this))
    column.addEventListener('dragleave', this.handleColumnDragLeave.bind(this))
    column.addEventListener('drop', this.handleColumnDrop.bind(this))
  }
  
  handleCardDragStart(e) {
    e.target.classList.add('dragging')
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', e.target.dataset.cardId)
    
    // 设置拖放图像
    const ghost = e.target.cloneNode(true)
    ghost.style.opacity = '0.5'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => ghost.remove(), 0)
  }
  
  handleCardDragEnd(e) {
    e.target.classList.remove('dragging')
  }
  
  handleColumnDragEnter(e) {
    e.preventDefault()
    
    if (e.target.classList.contains('kanban-column')) {
      e.target.classList.add('drag-over')
    }
  }
  
  handleColumnDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    // 获取拖放位置
    const column = e.target.closest('.kanban-column')
    if (!column) return
    
    const afterElement = this.getDragAfterElement(column, e.clientY)
    const draggable = document.querySelector('.dragging')
    
    if (afterElement == null) {
      column.appendChild(draggable)
    } else {
      column.insertBefore(draggable, afterElement)
    }
  }
  
  handleColumnDragLeave(e) {
    if (e.target.classList.contains('kanban-column')) {
      e.target.classList.remove('drag-over')
    }
  }
  
  handleColumnDrop(e) {
    e.preventDefault()
    
    const column = e.target.closest('.kanban-column')
    if (!column) return
    
    column.classList.remove('drag-over')
    
    const cardId = e.dataTransfer.getData('text/plain')
    const card = document.querySelector(`[data-card-id="${cardId}"]`)
    
    if (card) {
      // 更新后端
      this.updateCardStatus(cardId, column.dataset.status)
    }
  }
  
  getDragAfterElement(column, y) {
    const draggableElements = [
      ...column.querySelectorAll('.kanban-card:not(.dragging)')
    ]
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect()
      const offset = y - box.top - box.height / 2
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }
      } else {
        return closest
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element
  }
  
  async updateCardStatus(cardId, status) {
    try {
      await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      console.log('卡片状态已更新')
    } catch (error) {
      console.error('更新失败:', error)
    }
  }
}

// 使用
const board = document.querySelector('.kanban-board')
new KanbanBoard(board)
```

### 9. 面试要点

**Q1: dragover 事件为什么必须调用 preventDefault()？**

A: 因为浏览器默认不允许在元素上放置拖动的内容。如果不调用 `preventDefault()`，`drop` 事件不会触发，拖放操作会失败。这是 Drag and Drop API 最容易出错的地方。

```javascript
// ❌ 错误：不阻止默认行为，drop 事件不会触发
dropzone.addEventListener('dragover', (e) => {
  e.dataTransfer.dropEffect = 'move'
})

// ✅ 正确：必须阻止默认行为
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault()  // 允许放置
  e.dataTransfer.dropEffect = 'move'
})
```

**Q2: effectAllowed 和 dropEffect 有什么区别？**

A: 
- `effectAllowed`：在 `dragstart` 中设置，定义允许的拖放效果（如 'copy'、'move'、'link'）
- `dropEffect`：在 `dragover` 中设置，定义实际的拖放效果，必须是 `effectAllowed` 允许的值之一
- `dropEffect` 会影响鼠标光标的显示

```javascript
// dragstart 中设置允许的效果
draggable.addEventListener('dragstart', (e) => {
  e.dataTransfer.effectAllowed = 'copyMove'  // 允许复制或移动
})

// dragover 中设置实际效果
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'  // 实际使用复制效果
})
```

**Q3: 如何区分拖放元素和拖放文件？**

A: 通过检查 `dataTransfer.files` 和 `dataTransfer.types`：

```javascript
dropzone.addEventListener('drop', (e) => {
  e.preventDefault()
  
  // 检查是否拖放了文件
  if (e.dataTransfer.files.length > 0) {
    console.log('拖放文件:', e.dataTransfer.files)
    // 处理文件
  } else {
    // 检查数据类型
    console.log('数据类型:', e.dataTransfer.types)
    // 处理元素拖放
    const data = e.dataTransfer.getData('text/plain')
  }
})
```

**Q4: 如何实现拖放时的自定义预览图像？**

A: 使用 `setDragImage()` 方法：

```javascript
draggable.addEventListener('dragstart', (e) => {
  // 方法1：使用现有图片
  const img = new Image()
  img.src = 'preview.png'
  e.dataTransfer.setDragImage(img, 0, 0)
  
  // 方法2：使用 Canvas
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 100
  canvas.height = 100
  ctx.fillStyle = '#3498db'
  ctx.fillRect(0, 0, 100, 100)
  e.dataTransfer.setDragImage(canvas, 50, 50)
  
  // 方法3：克隆当前元素
  const clone = e.target.cloneNode(true)
  clone.style.opacity = '0.5'
  document.body.appendChild(clone)
  e.dataTransfer.setDragImage(clone, 0, 0)
  setTimeout(() => clone.remove(), 0)
})
```

**Q5: 如何处理拖放时的数据安全问题？**

A: 
1. 验证数据来源和类型
2. 对拖放数据进行清理和验证
3. 使用白名单验证文件类型
4. 限制文件大小
5. 在服务端再次验证

```javascript
dropzone.addEventListener('drop', (e) => {
  e.preventDefault()
  
  // 1. 验证数据类型
  const allowedTypes = ['text/plain', 'text/html']
  const hasValidType = e.dataTransfer.types.some(type => 
    allowedTypes.includes(type)
  )
  
  if (!hasValidType) {
    console.error('不支持的数据类型')
    return
  }
  
  // 2. 清理 HTML 数据（防止 XSS）
  const html = e.dataTransfer.getData('text/html')
  const sanitized = DOMPurify.sanitize(html)  // 使用 DOMPurify 库
  
  // 3. 验证文件
  if (e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0]
    
    // 验证文件类型（MIME type 可以伪造，需要服务端再次验证）
    const allowedFileTypes = ['image/jpeg', 'image/png']
    if (!allowedFileTypes.includes(file.type)) {
      console.error('不支持的文件类型')
      return
    }
    
    // 验证文件大小
    const maxSize = 5 * 1024 * 1024  // 5MB
    if (file.size > maxSize) {
      console.error('文件过大')
      return
    }
    
    // 验证文件扩展名
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
      console.error('不支持的文件扩展名')
      return
    }
  }
})
```

**Q6: 如何实现跨窗口拖放？**

A: 使用 `dataTransfer` 传递数据，但有限制：

```javascript
// 窗口 A：设置数据
draggable.addEventListener('dragstart', (e) => {
  // 只能传递字符串数据
  e.dataTransfer.setData('text/plain', JSON.stringify({
    id: 123,
    name: 'Item'
  }))
  
  // 不能传递对象引用或函数
})

// 窗口 B：接收数据
dropzone.addEventListener('drop', (e) => {
  e.preventDefault()
  
  const data = JSON.parse(e.dataTransfer.getData('text/plain'))
  console.log('接收到数据:', data)
})
```

**注意事项：**
1. 跨窗口拖放只能传递字符串数据
2. 不能传递对象引用、函数、DOM 元素
3. 需要考虑同源策略限制
4. 移动端支持有限，需要使用触摸事件模拟

### 8. CSS 样式

```css
/* ========== 基础拖放样式 ========== */

/* 可拖放元素 */
.draggable {
  cursor: move;              /* 鼠标悬停时显示移动光标 */
  user-select: none;         /* 禁止文本选择 */
  -webkit-user-drag: element; /* Safari 支持 */
}

/* 拖动中的元素 */
.dragging {
  opacity: 0.5;              /* 半透明效果 */
  cursor: grabbing;          /* 抓取光标 */
  transform: rotate(2deg);   /* 轻微旋转 */
}

/* 放置目标高亮 */
.drag-over {
  background-color: #e3f2fd; /* 浅蓝色背景 */
  border: 2px dashed #2196f3; /* 虚线边框 */
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.3); /* 发光效果 */
}

/* ========== 文件拖放区域 ========== *//* ========== 文件拖放区域 ========== */

.file-dropzone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  background-color: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
}

/* 拖放悬停状态 */
.file-dropzone.highlight {
  border-color: #2196f3;
  background-color: #e3f2fd;
  transform: scale(1.02);    /* 轻微放大 */
}

/* ========== 列表项样式 ========== */

.list-item {
  padding: 12px 16px;
  margin: 8px 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: move;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* 列表项悬停 */
.list-item:hover {
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transform: translateY(-1px);
}

/* 拖动中的列表项 */
.list-item.dragging {
  opacity: 0.5;
  transform: rotate(2deg) scale(0.95);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* 放置目标列表项 */
.list-item.drag-over {
  border-top: 3px solid #2196f3;
  margin-top: 12px;          /* 增加间距 */
}

/* ========== Kanban 看板样式 ========== */

.kanban-board {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f0f0f0;
  min-height: 100vh;
  overflow-x: auto;
}

/* 看板列 */
.kanban-column {
  flex: 1;
  min-width: 300px;
  max-width: 350px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  min-height: 500px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 列拖放悬停 */
.kanban-column.drag-over {
  background: #e3f2fd;
  border: 2px dashed #2196f3;
}

/* 看板卡片 */
.kanban-card {
  background: white;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: move;
  transition: all 0.2s ease;
}

/* 卡片悬停 */
.kanban-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

/* 拖动中的卡片 */
.kanban-card.dragging {
  opacity: 0.5;
  transform: rotate(3deg);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

/* ========== 响应式设计 ========== */

@media (max-width: 768px) {
  .kanban-board {
    flex-direction: column;
  }
  
  .kanban-column {
    min-width: 100%;
    max-width: 100%;
  }
  
  .file-dropzone {
    padding: 20px;
  }
}
```

## Clipboard API

### 1. 剪贴板操作

```javascript
// 1. 复制文本
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('复制成功')
  } catch (error) {
    console.error('复制失败:', error)
  }
}

// 2. 粘贴文本
async function pasteText() {
  try {
    const text = await navigator.clipboard.readText()
    console.log('粘贴内容:', text)
    return text
  } catch (error) {
    console.error('粘贴失败:', error)
  }
}

// 3. 复制图片
async function copyImage(blob) {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ])
    console.log('复制图片成功')
  } catch (error) {
    console.error('复制图片失败:', error)
  }
}

// 4. 粘贴图片
async function pasteImage() {
  try {
    const items = await navigator.clipboard.read()
    
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type)
          const url = URL.createObjectURL(blob)
          
          const img = document.createElement('img')
          img.src = url
          document.body.appendChild(img)
          
          return blob
        }
      }
    }
  } catch (error) {
    console.error('粘贴图片失败:', error)
  }
}

// 5. 监听粘贴事件
document.addEventListener('paste', async (e) => {
  e.preventDefault()
  
  const items = e.clipboardData.items
  
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      const url = URL.createObjectURL(file)
      
      const img = document.createElement('img')
      img.src = url
      document.body.appendChild(img)
    } else if (item.type === 'text/plain') {
      const text = await new Promise((resolve) => {
        item.getAsString(resolve)
      })
      
      console.log('粘贴文本:', text)
    }
  }
})

// 6. 复制 HTML
async function copyHTML(html) {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([html], { type: 'text/plain' })
      })
    ])
    console.log('复制 HTML 成功')
  } catch (error) {
    console.error('复制 HTML 失败:', error)
  }
}
```

## Intersection Observer API

### 1. 基础用法

```javascript
// 创建观察器
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('元素进入视口:', entry.target)
      
      // 执行操作
      entry.target.classList.add('visible')
      
      // 停止观察
      observer.unobserve(entry.target)
    }
  })
}, {
  root: null, // 视口
  rootMargin: '0px', // 边距
  threshold: 0.5 // 50% 可见时触发
})

// 观察元素
const elements = document.querySelectorAll('.observe')
elements.forEach(el => observer.observe(el))
```

### 2. 图片懒加载

```javascript
// HTML
<img data-src="image.jpg" alt="图片" class="lazy">

// JavaScript
const lazyImages = document.querySelectorAll('.lazy')

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      img.src = img.dataset.src
      img.classList.remove('lazy')
      observer.unobserve(img)
    }
  })
})

lazyImages.forEach(img => imageObserver.observe(img))
```

### 3. 无限滚动

```javascript
// HTML
<div class="list">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <!-- ... -->
  <div class="sentinel"></div>
</div>

// JavaScript
const sentinel = document.querySelector('.sentinel')
const list = document.querySelector('.list')

let page = 1
let loading = false

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !loading) {
      loadMore()
    }
  })
})

observer.observe(sentinel)

async function loadMore() {
  loading = true
  
  // 加载数据
  const data = await fetch(`/api/items?page=${page}`).then(res => res.json())
  
  // 渲染数据
  data.forEach(item => {
    const div = document.createElement('div')
    div.className = 'item'
    div.textContent = item.name
    list.insertBefore(div, sentinel)
  })
  
  page++
  loading = false
}
```

### 4. 曝光统计

```javascript
// 统计元素曝光
const exposureObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const element = entry.target
      const id = element.dataset.id
      
      // 上报曝光
      reportExposure(id)
      
      // 停止观察
      exposureObserver.unobserve(element)
    }
  })
}, {
  threshold: 0.5 // 50% 可见时统计
})

// 观察所有需要统计的元素
const items = document.querySelectorAll('[data-id]')
items.forEach(item => exposureObserver.observe(item))

function reportExposure(id) {
  fetch('/api/exposure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, timestamp: Date.now() })
  })
}
```

## 常见问题

### 1. Service Worker 如何更新？

```javascript
// 检测到新的 Service Worker 时提示用户
navigator.serviceWorker.register('/sw.js').then(registration => {
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // 提示用户刷新
        if (confirm('发现新版本，是否刷新页面？')) {
          newWorker.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      }
    })
  })
})

// sw.js
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
```

### 2. IndexedDB 如何处理版本升级？

```javascript
const request = indexedDB.open('MyDatabase', 2) // 版本号 +1

request.onupgradeneeded = (event) => {
  const db = event.target.result
  const oldVersion = event.oldVersion
  const newVersion = event.newVersion
  
  console.log(`升级数据库: ${oldVersion} -> ${newVersion}`)
  
  // 根据旧版本号执行不同的升级操作
  if (oldVersion < 1) {
    // 创建对象存储
    db.createObjectStore('users', { keyPath: 'id' })
  }
  
  if (oldVersion < 2) {
    // 添加索引
    const transaction = event.target.transaction
    const userStore = transaction.objectStore('users')
    userStore.createIndex('email', 'email', { unique: true })
  }
}
```

### 3. Web Worker 如何共享数据？

```javascript
// 使用 SharedArrayBuffer（需要 HTTPS 和特定的响应头）
// 主线程
const buffer = new SharedArrayBuffer(1024)
const array = new Int32Array(buffer)

worker.postMessage({ buffer })

// Worker
self.onmessage = (event) => {
  const { buffer } = event.data
  const array = new Int32Array(buffer)
  
  // 修改共享内存
  array[0] = 42
}

// 或使用 Atomics 进行原子操作
Atomics.store(array, 0, 42)
const value = Atomics.load(array, 0)
```

## 面试要点

### 核心概念

1. **Service Worker**
   - 生命周期（注册、安装、激活、运行）
   - 缓存策略（Cache First、Network First 等）
   - 后台同步、推送通知

2. **IndexedDB**
   - NoSQL 数据库
   - 事务、索引、游标
   - 版本升级

3. **Web Workers**
   - 多线程
   - 消息通信
   - 不能访问 DOM

4. **File API**
   - FileReader
   - 文件上传（分片、断点续传）
   - 文件下载

### 实战经验

1. **如何实现离线功能？**
   - Service Worker 缓存静态资源
   - IndexedDB 存储数据
   - 后台同步

2. **如何优化大文件上传？**
   - 分片上传
   - 断点续传
   - 并发上传

3. **如何实现图片懒加载？**
   - Intersection Observer
   - loading="lazy"
   - 占位图

## 参考资料

### 官方文档
- [Service Worker API - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)
- [IndexedDB API - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)
- [Web Workers API - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API)
- [File API - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/File_API)

### 工具库
- [Workbox](https://developers.google.com/web/tools/workbox) - Service Worker 工具库
- [idb](https://github.com/jakearchibald/idb) - IndexedDB 封装库
- [Comlink](https://github.com/GoogleChromeLabs/comlink) - Web Worker 通信库

---

> 💡 **提示**：掌握 Web API 可以实现强大的离线功能、文件处理、多线程计算等高级特性，提升 Web 应用的能力。
