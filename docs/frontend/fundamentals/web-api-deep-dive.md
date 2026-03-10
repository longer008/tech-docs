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

### 1. 拖放基础

```javascript
// 可拖放元素
const draggable = document.querySelector('.draggable')

draggable.draggable = true

// 拖放事件
draggable.addEventListener('dragstart', (e) => {
  console.log('开始拖放')
  
  // 设置拖放数据
  e.dataTransfer.setData('text/plain', e.target.id)
  
  // 设置拖放效果
  e.dataTransfer.effectAllowed = 'move'
  
  // 设置拖放图像
  const img = new Image()
  img.src = 'drag-image.png'
  e.dataTransfer.setDragImage(img, 0, 0)
})

draggable.addEventListener('drag', (e) => {
  console.log('拖放中')
})

draggable.addEventListener('dragend', (e) => {
  console.log('拖放结束')
})

// 放置目标
const dropzone = document.querySelector('.dropzone')

dropzone.addEventListener('dragenter', (e) => {
  e.preventDefault()
  console.log('进入放置区域')
  dropzone.classList.add('drag-over')
})

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
})

dropzone.addEventListener('dragleave', (e) => {
  console.log('离开放置区域')
  dropzone.classList.remove('drag-over')
})

dropzone.addEventListener('drop', (e) => {
  e.preventDefault()
  console.log('放置')
  
  dropzone.classList.remove('drag-over')
  
  // 获取拖放数据
  const data = e.dataTransfer.getData('text/plain')
  const element = document.getElementById(data)
  
  // 移动元素
  dropzone.appendChild(element)
})
```

### 2. 文件拖放

```javascript
// 文件拖放上传
const dropzone = document.querySelector('.dropzone')

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
})

dropzone.addEventListener('drop', async (e) => {
  e.preventDefault()
  
  const files = Array.from(e.dataTransfer.files)
  
  console.log('拖放文件:', files)
  
  // 上传文件
  for (const file of files) {
    await uploadFile(file)
  }
})

// 拖放文件夹
dropzone.addEventListener('drop', async (e) => {
  e.preventDefault()
  
  const items = Array.from(e.dataTransfer.items)
  
  for (const item of items) {
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry()
      
      if (entry.isDirectory) {
        await readDirectory(entry)
      } else {
        const file = item.getAsFile()
        await uploadFile(file)
      }
    }
  }
})

async function readDirectory(directoryEntry) {
  const reader = directoryEntry.createReader()
  
  const entries = await new Promise((resolve, reject) => {
    reader.readEntries(resolve, reject)
  })
  
  for (const entry of entries) {
    if (entry.isDirectory) {
      await readDirectory(entry)
    } else {
      const file = await new Promise((resolve, reject) => {
        entry.file(resolve, reject)
      })
      
      await uploadFile(file)
    }
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
