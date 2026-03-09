# Electron IPC 通信详解

> 更新时间：2025-02

## 目录导航

- [IPC 基础](#ipc-基础)
- [通信方式](#通信方式)
- [安全通信](#安全通信)
- [高级技巧](#高级技巧)
- [实战案例](#实战案例)
- [性能优化](#性能优化)
- [常见问题](#常见问题)

## IPC 基础

### 什么是 IPC

IPC（Inter-Process Communication，进程间通信）是 Electron 中主进程和渲染进程之间通信的核心机制。

**为什么需要 IPC**：
- Electron 采用多进程架构
- 主进程和渲染进程运行在不同的上下文中
- 渲染进程无法直接访问 Node.js API
- 需要通过 IPC 桥接两个进程

**IPC 通信流程**：

```
┌─────────────────────────────────────┐
│      渲染进程 (Renderer)             │
│  - 发送请求                          │
│  - 接收响应                          │
└─────────────────────────────────────┘
              ↕ IPC
┌─────────────────────────────────────┐
│      预加载脚本 (Preload)            │
│  - contextBridge                    │
│  - 暴露安全的 API                    │
└─────────────────────────────────────┘
              ↕ IPC
┌─────────────────────────────────────┐
│      主进程 (Main)                   │
│  - 处理请求                          │
│  - 返回响应                          │
│  - 访问 Node.js API                  │
└─────────────────────────────────────┘
```

### IPC 模块

**主进程模块**：
- `ipcMain`：主进程的 IPC 模块
- `ipcMain.on(channel, listener)`：监听事件
- `ipcMain.handle(channel, listener)`：处理异步请求
- `ipcMain.once(channel, listener)`：监听一次性事件

**渲染进程模块**：
- `ipcRenderer`：渲染进程的 IPC 模块
- `ipcRenderer.send(channel, ...args)`：发送异步消息
- `ipcRenderer.invoke(channel, ...args)`：发送异步请求并等待响应
- `ipcRenderer.on(channel, listener)`：监听事件
- `ipcRenderer.sendSync(channel, ...args)`：发送同步消息（不推荐）

## 通信方式

### 1. 渲染进程 → 主进程（单向）

**使用场景**：通知主进程执行某个操作，不需要返回值。

**实现方式**：

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message) => ipcRenderer.send('message', message)
})

// 渲染进程
window.electronAPI.sendMessage('Hello from renderer!')

// 主进程
const { ipcMain } = require('electron')

ipcMain.on('message', (event, message) => {
  console.log('收到消息:', message)
  // 处理消息
})
```

**特点**：
- ✅ 简单直接
- ✅ 不阻塞渲染进程
- ❌ 无法获取返回值

### 2. 渲染进程 ↔ 主进程（双向）

**使用场景**：渲染进程请求数据，主进程处理后返回结果。

**方式 A：invoke + handle（推荐）**

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  getData: (id) => ipcRenderer.invoke('get-data', id)
})

// 渲染进程
const data = await window.electronAPI.getData(123)
console.log('获取的数据:', data)

// 主进程
ipcMain.handle('get-data', async (event, id) => {
  // 异步处理
  const data = await fetchDataFromDatabase(id)
  return data
})
```

**特点**：
- ✅ 支持异步操作
- ✅ 支持 Promise
- ✅ 自动处理错误
- ✅ 推荐使用

**方式 B：send + on + reply**

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  requestData: (id) => ipcRenderer.send('request-data', id),
  onDataReply: (callback) => ipcRenderer.on('data-reply', (event, data) => callback(data))
})

// 渲染进程
window.electronAPI.requestData(123)
window.electronAPI.onDataReply((data) => {
  console.log('获取的数据:', data)
})

// 主进程
ipcMain.on('request-data', async (event, id) => {
  const data = await fetchDataFromDatabase(id)
  event.reply('data-reply', data)
})
```

**特点**：
- ✅ 灵活性高
- ❌ 代码较复杂
- ❌ 需要手动处理错误

### 3. 主进程 → 渲染进程

**使用场景**：主进程主动推送数据到渲染进程。

**实现方式**：

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  onUpdate: (callback) => ipcRenderer.on('update', (event, data) => callback(data))
})

// 渲染进程
window.electronAPI.onUpdate((data) => {
  console.log('收到更新:', data)
  // 更新 UI
})

// 主进程
const { BrowserWindow } = require('electron')

// 发送到所有窗口
BrowserWindow.getAllWindows().forEach(win => {
  win.webContents.send('update', { count: 100 })
})

// 发送到特定窗口
const win = BrowserWindow.getFocusedWindow()
win.webContents.send('update', { count: 100 })
```

**特点**：
- ✅ 主进程主动推送
- ✅ 支持广播
- ❌ 渲染进程无法回复

### 4. 渲染进程 ↔ 渲染进程

**方式 A：通过主进程中转**

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  sendToWindow: (windowId, message) => ipcRenderer.send('send-to-window', windowId, message),
  onMessage: (callback) => ipcRenderer.on('message-from-window', (event, data) => callback(data))
})

// 渲染进程 A
window.electronAPI.sendToWindow(2, 'Hello from Window 1')

// 渲染进程 B
window.electronAPI.onMessage((message) => {
  console.log('收到消息:', message)
})

// 主进程
ipcMain.on('send-to-window', (event, windowId, message) => {
  const targetWindow = BrowserWindow.fromId(windowId)
  if (targetWindow) {
    targetWindow.webContents.send('message-from-window', message)
  }
})
```

**方式 B：使用 MessagePort**

```javascript
// 主进程
const { MessageChannelMain } = require('electron')

const { port1, port2 } = new MessageChannelMain()

// 发送 port 到两个渲染进程
win1.webContents.postMessage('port', null, [port1])
win2.webContents.postMessage('port', null, [port2])

// 渲染进程 A
window.addEventListener('message', (event) => {
  const [port] = event.ports
  port.postMessage('Hello from Window 1')
})

// 渲染进程 B
window.addEventListener('message', (event) => {
  const [port] = event.ports
  port.onmessage = (event) => {
    console.log('收到消息:', event.data)
  }
})
```


## 安全通信

### contextBridge 最佳实践

**❌ 不安全的做法**：

```javascript
// 直接暴露 ipcRenderer（危险！）
window.ipcRenderer = require('electron').ipcRenderer

// 渲染进程可以发送任意消息
window.ipcRenderer.send('dangerous-operation')
```

**✅ 安全的做法**：

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron')

// 只暴露特定的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 明确定义每个方法
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  writeFile: (path, content) => ipcRenderer.invoke('write-file', path, content),
  
  // 不暴露 ipcRenderer 本身
  // 不暴露 require
  // 不暴露 process
})
```

### 输入验证

**渲染进程验证**：

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (path) => {
    // 验证参数类型
    if (typeof path !== 'string') {
      throw new Error('Path must be a string')
    }
    
    // 验证路径格式
    if (!path || path.trim() === '') {
      throw new Error('Path cannot be empty')
    }
    
    return ipcRenderer.invoke('read-file', path)
  }
})
```

**主进程验证**：

```javascript
// 主进程
const path = require('path')
const fs = require('fs').promises

ipcMain.handle('read-file', async (event, filePath) => {
  // 1. 验证来源
  if (!isValidSender(event.sender)) {
    throw new Error('Unauthorized sender')
  }
  
  // 2. 验证参数
  if (typeof filePath !== 'string') {
    throw new Error('Invalid file path')
  }
  
  // 3. 路径安全检查
  const normalizedPath = path.normalize(filePath)
  const allowedDir = path.join(app.getPath('userData'), 'files')
  
  if (!normalizedPath.startsWith(allowedDir)) {
    throw new Error('Access denied: path outside allowed directory')
  }
  
  // 4. 文件存在性检查
  try {
    await fs.access(normalizedPath, fs.constants.R_OK)
  } catch (error) {
    throw new Error('File not accessible')
  }
  
  // 5. 读取文件
  try {
    const content = await fs.readFile(normalizedPath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

function isValidSender(sender) {
  // 验证发送者是否是可信的窗口
  const validWindows = BrowserWindow.getAllWindows()
  return validWindows.some(win => win.webContents === sender)
}
```

### 权限控制

```javascript
// 主进程
const permissions = {
  'read-file': ['admin', 'user'],
  'write-file': ['admin'],
  'delete-file': ['admin']
}

function checkPermission(channel, userRole) {
  const allowedRoles = permissions[channel]
  return allowedRoles && allowedRoles.includes(userRole)
}

ipcMain.handle('read-file', async (event, filePath) => {
  const userRole = getUserRole(event.sender)
  
  if (!checkPermission('read-file', userRole)) {
    throw new Error('Permission denied')
  }
  
  // 执行操作
  return await readFile(filePath)
})
```

## 高级技巧

### 1. 批量请求

**问题**：频繁的 IPC 调用会影响性能。

**解决方案**：批量处理请求。

```javascript
// preload.js
let requestQueue = []
let timer = null

contextBridge.exposeInMainWorld('electronAPI', {
  batchRequest: (data) => {
    return new Promise((resolve) => {
      requestQueue.push({ data, resolve })
      
      // 延迟 100ms 批量发送
      clearTimeout(timer)
      timer = setTimeout(async () => {
        const batch = requestQueue.splice(0)
        const results = aw
: 3 })
])
```

### 2. 流式传输

**问题**：传输大文件时，一次性传输会占用大量内存。

**解决方案**：分块传输。

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  uploadFile: (filePath) => ipcRenderer.invoke('upload-file', filePath),
  onUploadProgress: (callback) => ipcRenderer.on('upload-progress', (event, data) => callback(data))
})

// 主进程
const fs = require('fs')
const CHUNK_SIZE = 1024 * 1024  // 1MB

ipcMain.handle('upload-file', async (event, filePath) => {
  const fileSize = (await fs.promises.stat(filePath)).size
  const stream = fs.createReadStream(filePath, { highWaterMark: CHUNK_SIZE })
  
  let uploaded = 0
  
  for await (const chunk of stream) {
    // 处理数据块
    await processChunk(chunk)
    
    // 发送进度
    uploaded += chunk.length
    const progress = (uploaded / fileSize) * 100
    event.sender.send('upload-progress', { progress, uploaded, total: fileSize })
  }
  
  return { success: true }
})

// 渲染进程
window.electronAPI.onUploadProgress(({ progress, uploaded, total }) => {
  console.log(`上传进度: ${progress.toFixed(2)}% (${uploaded}/${total})`)
})

await window.electronAPI.uploadFile('/path/to/large-file.zip')
```

### 3. 超时处理

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  requestWithTimeout: (data, timeout = 5000) => {
    return Promise.race([
      ipcRenderer.invoke('process-data', data),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ])
  }
})

// 渲染进程
try {
  const result = await window.electronAPI.requestWithTimeout({ id: 1 }, 3000)
  console.log('结果:', result)
} catch (error) {
  if (error.message === 'Request timeout') {
    console.error('请求超时')
  }
}
```

### 4. 错误处理

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  safeInvoke: async (channel, ...args) => {
    try {
      const result = await ipcRenderer.invoke(channel, ...args)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
})

// 主进程
ipcMain.handle('risky-operation', async (event, data) => {
  try {
    const result = await performRiskyOperation(data)
    return result
  } catch (error) {
    // 记录错误
    log.error('Operation failed:', error)
    
    // 抛出友好的错误消息
    throw new Error(`操作失败: ${error.message}`)
  }
})

// 渲染进程
const result = await window.electronAPI.safeInvoke('risky-operation', data)
if (result.success) {
  console.log('成功:', result.data)
} else {
  console.error('失败:', result.error)
}
```

### 5. 事件去重

```javascript
// preload.js
const listeners = new Map()

contextBridge.exposeInMainWorld('electronAPI', {
  on: (channel, callback) => {
    // 移除旧的监听器
    if (listeners.has(channel)) {
      ipcRenderer.removeListener(channel, listeners.get(channel))
    }
    
    // 添加新的监听器
    const listener = (event, ...args) => callback(...args)
    listeners.set(channel, listener)
    ipcRenderer.on(channel, listener)
  },
  
  off: (channel) => {
    if (listeners.has(channel)) {
      ipcRenderer.removeListener(channel, listeners.get(channel))
      listeners.delete(channel)
    }
  }
})

// 渲染进程
window.electronAPI.on('update', (data) => {
  console.log('更新:', data)
})

// 移除监听器
window.electronAPI.off('update')
```


## 实战案例

### 案例 1：文件管理系统

**需求**：实现文件的增删改查功能。

**完整实现**：

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('fileAPI', {
  // 列出目录
  listDirectory: (dirPath) => ipcRenderer.invoke('file:list', dirPath),
  
  // 读取文件
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  
  // 写入文件
  writeFile: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content),
  
  // 删除文件
  deleteFile: (filePath) => ipcRenderer.invoke('file:delete', filePath),
  
  // 复制文件
  copyFile: (src, dest) => ipcRenderer.invoke('file:copy', src, dest),
  
  // 移动文件
  moveFile: (src, dest) => ipcRenderer.invoke('file:move', src, dest),
  
  // 监听文件变化
  onFileChange: (callback) => ipcRenderer.on('file:changed', (event, data) => callback(data))
})

// 主进程
const { ipcMain, app } = require('electron')
const fs = require('fs').promises
const path = require('path')
const chokidar = require('chokidar')

// 允许的目录
const ALLOWED_DIR = path.join(app.getPath('userData'), 'files')

// 验证路径
function validatePath(filePath) {
  const normalized = path.normalize(filePath)
  if (!normalized.startsWith(ALLOWED_DIR)) {
    throw new Error('Access denied')
  }
  return normalized
}

// 列出目录
ipcMain.handle('file:list', async (event, dirPath) => {
  const validPath = validatePath(dirPath)
  
  try {
    const files = await fs.readdir(validPath, { withFileTypes: true })
    return files.map(file => ({
      name: file.name,
      isDirectory: file.isDirectory(),
      path: path.join(validPath, file.name)
    }))
  } catch (error) {
    throw new Error(`Failed to list directory: ${error.message}`)
  }
})

// 读取文件
ipcMain.handle('file:read', async (event, filePath) => {
  const validPath = validatePath(filePath)
  
  try {
    const content = await fs.readFile(validPath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 写入文件
ipcMain.handle('file:write', async (event, filePath, content) => {
  const validPath = validatePath(filePath)
  
  try {
    await fs.writeFile(validPath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 删除文件
ipcMain.handle('file:delete', async (event, filePath) => {
  const validPath = validatePath(filePath)
  
  try {
    await fs.unlink(validPath)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 复制文件
ipcMain.handle('file:copy', async (event, src, dest) => {
  const validSrc = validatePath(src)
  const validDest = validatePath(dest)
  
  try {
    await fs.copyFile(validSrc, validDest)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 移动文件
ipcMain.handle('file:move', async (event, src, dest) => {
  const validSrc = validatePath(src)
  const validDest = validatePath(dest)
  
  try {
    await fs.rename(validSrc, validDest)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 监听文件变化
const watcher = chokidar.watch(ALLOWED_DIR, {
  persistent: true,
  ignoreInitial: true
})

watcher.on('all', (event, filePath) => {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('file:changed', { event, path: filePath })
  })
})

// 渲染进程
async function loadFiles() {
  const files = await window.fileAPI.listDirectory('/path/to/dir')
  displayFiles(files)
}

async function saveFile(filePath, content) {
  const result = await window.fileAPI.writeFile(filePath, content)
  if (result.success) {
    alert('保存成功')
  } else {
    alert('保存失败: ' + result.error)
  }
}

// 监听文件变化
window.fileAPI.onFileChange(({ event, path }) => {
  console.log(`文件 ${event}: ${path}`)
  loadFiles()  // 重新加载文件列表
})
```

### 案例 2：实时数据同步

**需求**：主进程定时获取数据，实时推送到所有渲染进程。

**完整实现**：

```javascript
// preload.js
contextBridge.exposeInMainWorld('dataAPI', {
  // 订阅数据更新
  subscribe: (callback) => {
    ipcRenderer.on('data:update', (event, data) => callback(data))
  },
  
  // 取消订阅
  unsubscribe: () => {
    ipcRenderer.removeAllListeners('data:update')
  },
  
  // 手动刷新
  refresh: () => ipcRenderer.send('data:refresh')
})

// 主进程
const { ipcMain, BrowserWindow } = require('electron')

// 数据缓存
let cachedData = null

// 获取数据
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch data:', error)
    return null
  }
}

// 广播数据到所有窗口
function broadcastData(data) {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('data:update', data)
  })
}

// 定时更新数据
setInterval(async () => {
  const data = await fetchData()
  if (data) {
    cachedData = data
    broadcastData(data)
  }
}, 5000)  // 每 5 秒更新一次

// 手动刷新
ipcMain.on('data:refresh', async (event) => {
  const data = await fetchData()
  if (data) {
    cachedData = data
    event.sender.send('data:update', data)
  }
})

// 新窗口创建时发送缓存数据
app.on('browser-window-created', (event, win) => {
  win.webContents.on('did-finish-load', () => {
    if (cachedData) {
      win.webContents.send('data:update', cachedData)
    }
  })
})

// 渲染进程
let unsubscribe = null

function startSync() {
  unsubscribe = window.dataAPI.subscribe((data) => {
    console.log('收到数据更新:', data)
    updateUI(data)
  })
}

function stopSync() {
  if (unsubscribe) {
    window.dataAPI.unsubscribe()
    unsubscribe = null
  }
}

// 手动刷新
document.getElementById('refresh-btn').addEventListener('click', () => {
  window.dataAPI.refresh()
})

// 页面加载时开始同步
window.addEventListener('load', startSync)

// 页面卸载时停止同步
window.addEventListener('beforeunload', stopSync)
```

### 案例 3：多窗口协作

**需求**：多个窗口之间共享状态，一个窗口修改后其他窗口同步更新。

**完整实现**：

```javascript
// preload.js
contextBridge.exposeInMainWorld('stateAPI', {
  // 获取状态
  getState: () => ipcRenderer.invoke('state:get'),
  
  // 更新状态
  setState: (key, value) => ipcRenderer.invoke('state:set', key, value),
  
  // 监听状态变化
  onStateChange: (callback) => {
    ipcRenderer.on('state:changed', (event, data) => callback(data))
  }
})

// 主进程
const { ipcMain, BrowserWindow } = require('electron')

// 全局状态
const globalState = {
  count: 0,
  user: null,
  settings: {}
}

// 获取状态
ipcMain.handle('state:get', () => {
  return globalState
})

// 更新状态
ipcMain.handle('state:set', (event, key, value) => {
  globalState[key] = value
  
  // 广播状态变化到所有窗口（除了发送者）
  BrowserWindow.getAllWindows().forEach(win => {
    if (win.webContents !== event.sender) {
      win.webContents.send('state:changed', { key, value })
    }
  })
  
  return { success: true }
})

// 渲染进程
let localState = {}

// 初始化状态
async function initState() {
  localState = await window.stateAPI.getState()
  renderUI(localState)
}

// 更新状态
async function updateCount(newCount) {
  await window.stateAPI.setState('count', newCount)
  localState.count = newCount
  renderUI(localState)
}

// 监听其他窗口的状态变化
window.stateAPI.onStateChange(({ key, value }) => {
  console.log(`状态变化: ${key} = ${value}`)
  localState[key] = value
  renderUI(localState)
})

// 页面加载时初始化
window.addEventListener('load', initState)

// 示例：增加计数
document.getElementById('increment-btn').addEventListener('click', () => {
  updateCount(localState.count + 1)
})
```

## 性能优化

### 1. 减少 IPC 调用次数

**❌ 不好的做法**：

```javascript
// 频繁调用
for (let i = 0; i < 1000; i++) {
  await window.electronAPI.saveData(i)
}
```

**✅ 好的做法**：

```javascript
// 批量处理
const data = Array.from({ length: 1000 }, (_, i) => i)
await window.electronAPI.saveBatchData(data)
```

### 2. 使用缓存

```javascript
// preload.js
const cache = new Map()

contextBridge.exposeInMainWorld('electronAPI', {
  getData: async (id) => {
    // 检查缓存
    if (cache.has(id)) {
      return cache.get(id)
    }
    
    // 请求数据
    const data = await ipcRenderer.invoke('get-data', id)
    
    // 缓存数据
    cache.set(id, data)
    
    return data
  },
  
  // 清除缓存
  clearCache: () => cache.clear()
})
```

### 3. 防抖和节流

```javascript
// preload.js
function debounce(func, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    return new Promise((resolve) => {
      timer = setTimeout(async () => {
        const result = await func(...args)
        resolve(result)
      }, delay)
    })
  }
}

contextBridge.exposeInMainWorld('electronAPI', {
  // 防抖搜索
  search: debounce((keyword) => {
    return ipcRenderer.invoke('search', keyword)
  }, 300)
})

// 渲染进程
document.getElementById('search-input').addEventListener('input', async (e) => {
  const results = await window.electronAPI.search(e.target.value)
  displayResults(results)
})
```

### 4. 异步处理

```javascript
// ❌ 同步调用（阻塞）
const result = ipcRenderer.sendSync('get-data')

// ✅ 异步调用（不阻塞）
const result = await ipcRenderer.invoke('get-data')
```

## 常见问题

### Q1：IPC 通信失败怎么办？

**排查步骤**：

1. **检查通道名称是否一致**

```javascript
// 渲染进程
ipcRenderer.send('my-channel', data)

// 主进程（通道名称必须一致）
ipcMain.on('my-channel', (event, data) => {
  // 处理
})
```

2. **检查 contextBridge 是否正确配置**

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (msg) => ipcRenderer.send('message', msg)
})

// 渲染进程（确保使用暴露的 API）
window.electronAPI.sendMessage('Hello')
```

3. **检查是否启用了 contextIsolation**

```javascript
// main.js
const win = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,  // 必须启用
    preload: path.join(__dirname, 'preload.js')
  }
})
```

### Q2：如何调试 IPC 通信？

**方法 1：使用日志**

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (msg) => {
    console.log('[Preload] Sending message:', msg)
    return ipcRenderer.invoke('message', msg)
  }
})

// 主进程
ipcMain.handle('message', (event, msg) => {
  console.log('[Main] Received message:', msg)
  return { success: true }
})

// 渲染进程
const result = await window.electronAPI.sendMessage('Hello')
console.log('[Renderer] Got result:', result)
```

**方法 2：使用 DevTools**

```javascript
// 主进程
win.webContents.openDevTools()

// 在 Console 中查看日志
```

### Q3：IPC 通信性能差怎么办？

**优化方案**：

1. 减少调用次数（批量处理）
2. 使用缓存
3. 异步处理
4. 避免传输大对象
5. 使用流式传输

### Q4：如何处理 IPC 错误？

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  safeInvoke: async (channel, ...args) => {
    try {
      return await ipcRenderer.invoke(channel, ...args)
    } catch (error) {
      console.error(`IPC Error [${channel}]:`, error)
      throw error
    }
  }
})

// 主进程
ipcMain.handle('risky-operation', async (event, data) => {
  try {
    return await performOperation(data)
  } catch (error) {
    console.error('Operation failed:', error)
    throw new Error(`操作失败: ${error.message}`)
  }
})

// 渲染进程
try {
  const result = await window.electronAPI.safeInvoke('risky-operation', data)
  console.log('成功:', result)
} catch (error) {
  console.error('失败:', error.message)
  alert('操作失败，请重试')
}
```

## 总结

IPC 通信是 Electron 应用的核心，掌握 IPC 通信机制对于开发高质量的 Electron 应用至关重要。

**核心要点**：
1. ✅ 使用 `invoke/handle` 进行双向通信（推荐）
2. ✅ 通过 `contextBridge` 暴露安全的 API
3. ✅ 验证所有输入数据
4. ✅ 使用批量处理减少调用次数
5. ✅ 实现错误处理和超时机制
6. ✅ 避免传输大对象
7. ✅ 使用缓存提高性能

通过本指南的学习，你将能够实现安全、高效的 IPC 通信！
