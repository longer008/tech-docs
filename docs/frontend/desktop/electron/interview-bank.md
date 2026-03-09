# Electron 面试题集

> 更新时间：2025-02

## 目录导航

- [基础题](#基础题)
- [进阶题](#进阶题)
- [高级题](#高级题)
- [实战题](#实战题)
- [面试技巧](#面试技巧)

## 基础题

### 1. 什么是 Electron？它的核心特点是什么？

**核心答案**：

Electron 是一个使用 JavaScript、HTML 和 CSS 构建跨平台桌面应用的开源框架，由 GitHub 开发。

**核心特点**：
1. **跨平台**：一套代码支持 Windows、macOS、Linux
2. **Web 技术栈**：使用前端技术开发桌面应用
3. **原生能力**：访问文件系统、系统托盘、通知等
4. **丰富生态**：npm 生态系统支持
5. **活跃社区**：大量开源项目和插件

**技术架构**：
- Chromium：提供 Web 渲染能力
- Node.js：提供系统级 API 访问
- 原生 API：提供桌面应用特性

**知名应用**：VS Code、Slack、Discord、Figma、Postman

**追问点**：
- Electron 的优缺点？
- Electron 与 NW.js 的区别？
- 为什么选择 Electron？

### 2. Electron 的架构是怎样的？主进程和渲染进程有什么区别？

**核心答案**：

Electron 采用多进程架构，类似于 Chromium 浏览器。

**进程类型**：

| 特性 | 主进程 (Main Process) | 渲染进程 (Renderer Process) |
|------|----------------------|----------------------------|
| 数量 | 1 个 | 多个（每个窗口一个） |
| 运行时 | Node.js | Chromium |
| 入口文件 | main.js | index.html |
| 职责 | 管理应用生命周期、创建窗口 | 渲染 Web 页面 |
| Node.js API | 完整访问 | 受限访问（需配置） |
| 原生 API | 直接访问 | 通过 IPC 访问 |

**代码示例**：

```javascript
// 主进程 (main.js)
const { app, BrowserWindow } = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  
  win.loadFile('index.html')
}

app.whenReady().then(createWindow)

// 渲染进程 (renderer.js)
document.getElementById('btn').addEventListener('click', () => {
  // 通过 IPC 与主进程通信
  window.electronAPI.doSomething()
})
```

**追问点**：
- 为什么要使用多进程架构？
- 预加载脚本的作用是什么？
- 如何在渲染进程中访问 Node.js API？

### 3. 什么是 IPC？Electron 中有哪些 IPC 通信方式？

**核心答案**：

IPC（Inter-Process Communication）是 Electron 中主进程和渲染进程之间通信的机制。

**通信方式**：

**1. 渲染进程 → 主进程（单向）**

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (msg) => ipcRenderer.send('message', msg)
})

// 主进程
ipcMain.on('message', (event, msg) => {
  console.log('收到消息:', msg)
})
```

**2. 渲染进程 ↔ 主进程（双向，推荐）**

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  getData: (id) => ipcRenderer.invoke('get-data', id)
})

// 主进程
ipcMain.handle('get-data', async (event, id) => {
  return await fetchData(id)
})

// 渲染进程
const data = await window.electronAPI.getData(123)
```

**3. 主进程 → 渲染进程**

```javascript
// 主进程
win.webContents.send('update', { count: 100 })

// 渲染进程
window.electronAPI.onUpdate((data) => {
  console.log('收到更新:', data)
})
```

**追问点**：
- invoke/handle 与 send/on 的区别？
- 如何保证 IPC 通信的安全性？
- 如何实现渲染进程之间的通信？

### 4. 什么是 contextBridge？为什么要使用它？

**核心答案**：

contextBridge 是 Electron 提供的安全机制，用于在预加载脚本中暴露 API 到渲染进程。

**为什么需要 contextBridge**：
1. **安全隔离**：启用 contextIsolation 后，渲染进程无法直接访问 Node.js API
2. **最小权限原则**：只暴露必要的 API
3. **防止注入攻击**：避免恶意代码访问敏感 API

**使用示例**：

```javascript
// ❌ 不安全的做法
window.ipcRenderer = require('electron').ipcRenderer

// ✅ 安全的做法
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 只暴露特定的方法
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  writeFile: (path, content) => ipcRenderer.invoke('write-file', path, content)
})

// 渲染进程
const content = await window.electronAPI.readFile('/path/to/file')
```

**追问点**：
- contextIsolation 是什么？
- 如何验证 contextBridge 的安全性？
- 不使用 contextBridge 会有什么风险？

### 5. Electron 应用如何打包和分发？

**核心答案**：

Electron 应用打包主要使用 electron-builder 或 electron-packager。

**打包流程**：

**1. 安装 electron-builder**

```bash
npm install electron-builder --save-dev
```

**2. 配置 package.json**

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "build": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux"
  },
  "build": {
    "appId": "com.example.myapp",
    "productName": "My App",
    "win": {
      "target": ["nsis", "portable"],
      "icon": "build/icon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "build/icon.icns"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "build/icon.png"
    }
  }
}
```

**3. 打包**

```bash
npm run build
```

**分发方式**：
1. **直接下载**：提供安装包下载链接
2. **应用商店**：Microsoft Store、Mac App Store
3. **自动更新**：使用 electron-updater

**追问点**：
- 如何实现自动更新？
- 如何进行代码签名？
- 如何减小打包体积？

## 进阶题

### 6. Electron 应用如何保证安全性？

**核心答案**：

Electron 应用安全性需要从多个层面考虑。

**安全配置**：

```javascript
// 主进程
const win = new BrowserWindow({
  webPreferences: {
    // 1. 启用上下文隔离
    contextIsolation: true,
    // 2. 禁用 Node.js 集成
    nodeIntegration: false,
    // 3. 禁用远程模块
    enableRemoteModule: false,
    // 4. 使用预加载脚本
    preload: path.join(__dirname, 'preload.js'),
    // 5. 禁用 eval
    sandbox: true
  }
})

// 6. 限制导航
win.webContents.on('will-navigate', (event, url) => {
  if (!url.startsWith('https://myapp.com')) {
    event.preventDefault()
  }
})

// 7. 限制新窗口
win.webContents.setWindowOpenHandler(({ url }) => {
  if (url.startsWith('https://myapp.com')) {
    return { action: 'allow' }
  }
  return { action: 'deny' }
})
```

**输入验证**：

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (path) => {
    // 验证路径
    if (!path || typeof path !== 'string') {
      throw new Error('Invalid path')
    }
    // 限制访问范围
    const allowedDir = app.getPath('userData')
    const fullPath = path.resolve(allowedDir, path)
    if (!fullPath.startsWith(allowedDir)) {
      throw new Error('Access denied')
    }
    return ipcRenderer.invoke('read-file', fullPath)
  }
})
```

**追问点**：
- CSP（内容安全策略）如何配置？
- 如何防止 XSS 攻击？
- 如何安全地加载远程内容？

### 7. Electron 应用如何进行性能优化？

**核心答案**：

Electron 应用性能优化包括启动优化、运行时优化和内存优化。

**启动优化**：

```javascript
// 1. 延迟加载
app.whenReady().then(() => {
  createWindow()
  
  // 延迟加载非关键模块
  setTimeout(() => {
    require('./heavy-module')
  }, 1000)
})

// 2. 使用 V8 快照
// package.json
{
  "build": {
    "electronDist": "node_modules/electron/dist",
    "v8Snapshot": true
  }
}

// 3. 预加载关键资源
win.webContents.on('did-finish-load', () => {
  win.webContents.send('preload-data', criticalData)
})
```

**运行时优化**：

```javascript
// 1. 使用 Web Workers
// main.js
const worker = new Worker('worker.js')
worker.postMessage({ task: 'heavy-computation' })

// 2. 节流和防抖
const throttle = (fn, delay) => {
  let timer = null
  return (...args) => {
    if (timer) return
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}

// 3. 虚拟滚动
// 对于大列表使用虚拟滚动库
```

**内存优化**：

```javascript
// 1. 及时清理监听器
win.on('closed', () => {
  // 清理资源
  win = null
})

// 2. 限制窗口数量
const MAX_WINDOWS = 5
if (windows.length >= MAX_WINDOWS) {
  windows[0].close()
}

// 3. 使用 webContents.session.clearCache()
app.on('before-quit', () => {
  session.defaultSession.clearCache()
})
```

**追问点**：
- 如何监控 Electron 应用的性能？
- 如何减少内存占用？
- 如何优化大文件处理？

### 8. 如何实现 Electron 应用的自动更新？

**核心答案**：

使用 electron-updater 实现自动更新。

**配置更新**：

```javascript
// main.js
const { autoUpdater } = require('electron-updater')

// 1. 配置更新服务器
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'your-username',
  repo: 'your-repo'
})

// 2. 检查更新
app.whenReady().then(() => {
  createWindow()
  
  // 启动后检查更新
  autoUpdater.checkForUpdatesAndNotify()
  
  // 定期检查（每小时）
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify()
  }, 60 * 60 * 1000)
})

// 3. 监听更新事件
autoUpdater.on('checking-for-update', () => {
  console.log('正在检查更新...')
})

autoUpdater.on('update-available', (info) => {
  console.log('发现新版本:', info.version)
  // 通知渲染进程
  win.webContents.send('update-available', info)
})

autoUpdater.on('update-not-available', () => {
  console.log('当前已是最新版本')
})

autoUpdater.on('download-progress', (progress) => {
  console.log(`下载进度: ${progress.percent}%`)
  win.webContents.send('download-progress', progress)
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('更新下载完成')
  // 提示用户重启
  dialog.showMessageBox({
    type: 'info',
    title: '更新就绪',
    message: '新版本已下载完成，是否立即重启应用？',
    buttons: ['立即重启', '稍后']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  })
})
```

**package.json 配置**：

```json
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "owner": "your-username",
        "repo": "your-repo"
      }
    ]
  }
}
```

**追问点**：
- 如何实现增量更新？
- 如何处理更新失败？
- 如何实现强制更新？

## 高级题

### 9. Electron 应用如何实现多窗口管理和窗口间通信？

**核心答案**：

多窗口管理需要维护窗口实例，窗口间通信通过主进程中转。

**窗口管理**：

```javascript
// main.js
class WindowManager {
  constructor() {
    this.windows = new Map()
  }
  
  createWindow(id, options) {
    const win = new BrowserWindow({
      ...options,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true
      }
    })
    
    this.windows.set(id, win)
    
    win.on('closed', () => {
      this.windows.delete(id)
    })
    
    return win
  }
  
  getWindow(id) {
    return this.windows.get(id)
  }
  
  getAllWindows() {
    return Array.from(this.windows.values())
  }
  
  broadcast(channel, data) {
    this.windows.forEach(win => {
      win.webContents.send(channel, data)
    })
  }
}

const windowManager = new WindowManager()

// 创建主窗口
const mainWin = windowManager.createWindow('main', {
  width: 800,
  height: 600
})

// 创建子窗口
ipcMain.handle('open-child-window', () => {
  const childWin = windowManager.createWindow('child', {
    width: 400,
    height: 300,
    parent: mainWin
  })
  childWin.loadFile('child.html')
  return childWin.id
})
```

**窗口间通信**：

```javascript
// 主进程中转消息
ipcMain.on('send-to-window', (event, targetId, channel, data) => {
  const targetWin = windowManager.getWindow(targetId)
  if (targetWin) {
    targetWin.webContents.send(channel, data)
  }
})

// 广播消息
ipcMain.on('broadcast', (event, channel, data) => {
  windowManager.broadcast(channel, data)
})

// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  sendToWindow: (targetId, channel, data) => 
    ipcRenderer.send('send-to-window', targetId, channel, data),
  broadcast: (channel, data) => 
    ipcRenderer.send('broadcast', channel, data),
  onMessage: (callback) => 
    ipcRenderer.on('message', (event, data) => callback(data))
})
```

**追问点**：
- 如何实现窗口状态同步？
- 如何处理窗口关闭时的数据保存？
- 如何实现模态窗口？

### 10. Electron 应用如何调用原生能力（文件系统、系统托盘、通知等）？

**核心答案**：

Electron 提供了丰富的原生 API，通过主进程调用。

**文件系统操作**：

```javascript
// 主进程
const { dialog } = require('electron')
const fs = require('fs').promises

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Text Fil

    return result.filePath
  }
  return null
})
```

**系统托盘**：

```javascript
const { Tray, Menu } = require('electron')

let tray = null

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'))
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示窗口', click: () => win.show() },
    { label: '隐藏窗口', click: () => win.hide() },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ])
  
  tray.setToolTip('My App')
  tray.setContextMenu(contextMenu)
  
  // 点击托盘图标显示/隐藏窗口
  tray.on('click', () => {
    win.isVisible() ? win.hide() : win.show()
  })
}
```

**系统通知**：

```javascript
const { Notification } = require('electron')

ipcMain.handle('show-notification', (event, options) => {
  const notification = new Notification({
    title: options.title,
    body: options.body,
    icon: path.join(__dirname, 'icon.png')
  })
  
  notification.on('click', () => {
    win.show()
    win.focus()
  })
  
  notification.show()
})
```

**追问点**：
- 如何实现全局快捷键？
- 如何访问剪贴板？
- 如何实现拖拽文件？

### 11. Electron 应用如何进行调试和错误处理？

**核心答案**：

Electron 提供了多种调试工具和错误处理机制。

**开发者工具**：

```javascript
// 主进程
const win = new BrowserWindow({
  webPreferences: {
    devTools: true  // 启用开发者工具
  }
})

// 自动打开开发者工具
if (process.env.NODE_ENV === 'development') {
  win.webContents.openDevTools()
}

// 快捷键打开开发者工具
globalShortcut.register('F12', () => {
  const focusedWin = BrowserWindow.getFocusedWindow()
  if (focusedWin) {
    focusedWin.webContents.toggleDevTools()
  }
})
```

**主进程调试**：

```bash
# 使用 VS Code 调试
# .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Electron Main",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
      },
      "args": ["."],
      "outputCapture": "std"
    }
  ]
}
```

**错误处理**：

```javascript
// 主进程错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  // 记录日志
  fs.appendFileSync('error.log', `${new Date().toISOString()} ${error.stack}\n`)
  // 显示错误对话框
  dialog.showErrorBox('应用错误', error.message)
})

// 渲染进程错误处理
win.webContents.on('crashed', () => {
  dialog.showMessageBox({
    type: 'error',
    title: '渲染进程崩溃',
    message: '渲染进程已崩溃，是否重新加载？',
    buttons: ['重新加载', '退出']
  }).then((result) => {
    if (result.response === 0) {
      win.reload()
    } else {
      app.quit()
    }
  })
})

// IPC 错误处理
ipcMain.handle('risky-operation', async (event, data) => {
  try {
    const result = await performOperation(data)
    return { success: true, data: result }
  } catch (error) {
    console.error('操作失败:', error)
    return { success: false, error: error.message }
  }
})
```

**追问点**：
- 如何实现日志系统？
- 如何收集崩溃报告？
- 如何进行性能分析？

## 实战题

### 12. 实现一个简单的文件管理器

**需求**：
- 浏览文件夹
- 显示文件列表
- 打开文件
- 删除文件
- 搜索文件

**实现**：

```javascript
// 主进程 (main.js)
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const fs = require('fs').promises
const path = require('path')

// 获取文件列表
ipcMain.handle('get-files', async (event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true })
    return files.map(file => ({
      name: file.name,
      isDirectory: file.isDirectory(),
      path: path.join(dirPath, file.name)
    }))
  } catch (error) {
    throw new Error(`读取目录失败: ${error.message}`)
  }
})

// 打开文件
ipcMain.handle('open-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    throw new Error(`打开文件失败: ${error.message}`)
  }
})

// 删除文件
ipcMain.handle('delete-file', async (event, filePath) => {
  const result = await dialog.showMessageBox({
    type: 'warning',
    title: '确认删除',
    message: `确定要删除 ${path.basename(filePath)} 吗？`,
    buttons: ['取消', '删除'],
    defaultId: 0
  })
  
  if (result.response === 1) {
    await fs.unlink(filePath)
    return true
  }
  return false
})

// 搜索文件
ipcMain.handle('search-files', async (event, dirPath, keyword) => {
  const results = []
  
  async function search(dir) {
    const files = await fs.readdir(dir, { withFileTypes: true })
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name)
      
      if (file.name.includes(keyword)) {
        results.push({
          name: file.name,
          path: fullPath,
          isDirectory: file.isDirectory()
        })
      }
      
      if (file.isDirectory()) {
        await search(fullPath)
      }
    }
  }
  
  await search(dirPath)
  return results
})

// 渲染进程 (renderer.js)
let currentPath = require('os').homedir()

async function loadFiles(dirPath) {
  try {
    const files = await window.electronAPI.getFiles(dirPath)
    displayFiles(files)
    currentPath = dirPath
  } catch (error) {
    alert(error.message)
  }
}

function displayFiles(files) {
  const fileList = document.getElementById('file-list')
  fileList.innerHTML = ''
  
  files.forEach(file => {
    const item = document.createElement('div')
    item.className = 'file-item'
    item.innerHTML = `
      <span class="icon">${file.isDirectory ? '📁' : '📄'}</span>
      <span class="name">${file.name}</span>
      <button class="delete-btn" data-path="${file.path}">删除</button>
    `
    
    item.querySelector('.name').addEventListener('click', async () => {
      if (file.isDirectory) {
        loadFiles(file.path)
      } else {
        const content = await window.electronAPI.openFile(file.path)
        showFileContent(file.name, content)
      }
    })
    
    item.querySelector('.delete-btn').addEventListener('click', async (e) => {
      e.stopPropagation()
      const deleted = await window.electronAPI.deleteFile(file.path)
      if (deleted) {
        loadFiles(currentPath)
      }
    })
    
    fileList.appendChild(item)
  })
}

// 搜索功能
document.getElementById('search-btn').addEventListener('click', async () => {
  const keyword = document.getElementById('search-input').value
  if (keyword) {
    const results = await window.electronAPI.searchFiles(currentPath, keyword)
    displayFiles(results)
  }
})

// 初始加载
loadFiles(currentPath)
```

**追问点**：
- 如何实现文件拖拽？
- 如何显示文件图标？
- 如何实现文件预览？

### 13. 实现一个截图工具

**需求**：
- 全屏截图
- 区域截图
- 保存截图
- 复制到剪贴板

**实现**：

```javascript
// 主进程
const { screen, desktopCapturer } = require('electron')

// 创建截图窗口
ipcMain.handle('start-capture', async () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  
  const captureWin = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  
  // 获取屏幕截图
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width, height }
  })
  
  const screenshot = sources[0].thumbnail.toDataURL()
  
  captureWin.loadFile('capture.html')
  captureWin.webContents.on('did-finish-load', () => {
    captureWin.webContents.send('screenshot-data', screenshot)
  })
})

// 保存截图
ipcMain.handle('save-screenshot', async (event, dataUrl) => {
  const result = await dialog.showSaveDialog({
    defaultPath: `screenshot-${Date.now()}.png`,
    filters: [{ name: 'Images', extensions: ['png'] }]
  })
  
  if (!result.canceled) {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
    await fs.writeFile(result.filePath, base64Data, 'base64')
    return result.filePath
  }
  return null
})

// 复制到剪贴板
ipcMain.handle('copy-to-clipboard', (event, dataUrl) => {
  const { nativeImage, clipboard } = require('electron')
  const image = nativeImage.createFromDataURL(dataUrl)
  clipboard.writeImage(image)
})

// 渲染进程 (capture.html)
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let isDrawing = false
let startX, startY

// 加载截图
window.electronAPI.onScreenshotData((dataUrl) => {
  const img = new Image()
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
  }
  img.src = dataUrl
})

// 绘制选区
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true
  startX = e.offsetX
  startY = e.offsetY
})

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return
  
  const width = e.offsetX - startX
  const height = e.offsetY - startY
  
  // 重绘
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0)
  
  // 绘制选区
  ctx.strokeStyle = 'red'
  ctx.lineWidth = 2
  ctx.strokeRect(startX, startY, width, height)
})

canvas.addEventListener('mouseup', async (e) => {
  isDrawing = false
  
  const width = e.offsetX - startX
  const height = e.offsetY - startY
  
  // 裁剪选区
  const imageData = ctx.getImageData(startX, startY, width, height)
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = width
  tempCanvas.height = height
  tempCanvas.getContext('2d').putImageData(imageData, 0, 0)
  
  const croppedDataUrl = tempCanvas.toDataURL()
  
  // 保存或复制
  const action = await showActionDialog()
  if (action === 'save') {
    await window.electronAPI.saveScreenshot(croppedDataUrl)
  } else if (action === 'copy') {
    await window.electronAPI.copyToClipboard(croppedDataUrl)
  }
  
  window.close()
})
```

**追问点**：
- 如何实现多显示器截图？
- 如何添加标注功能？
- 如何实现延时截图？

## 面试技巧

### 回答框架

**STAR 法则**：
- **S**ituation（情境）：描述项目背景
- **T**ask（任务）：说明你的职责
- **A**ction（行动）：详细说明你的实现方案
- **R**esult（结果）：量化项目成果

**示例**：
> "在我负责的桌面应用项目中（S），需要实现一个高性能的文件管理器（T）。我采用了虚拟滚动技术处理大量文件列表，使用 Web Workers 进行文件搜索，并通过 IPC 优化了主进程和渲染进程的通信（A）。最终应用启动时间减少了 40%，文件列表渲染性能提升了 60%（R）。"

### 加分项

1. **深入理解原理**：
   - 能解释 Electron 的多进程架构
   - 了解 Chromium 和 Node.js 的集成原理
   - 熟悉 IPC 通信机制

2. **实战经验**：
   - 有完整的 Electron 项目经验
   - 解决过性能问题
   - 实现过复杂功能（自动更新、多窗口管理等）

3. **安全意识**：
   - 了解 Electron 安全最佳实践
   - 能识别常见安全漏洞
   - 知道如何防御 XSS、注入攻击

4. **性能优化**：
   - 有性能分析和优化经验
   - 了解内存管理和泄漏排查
   - 熟悉打包优化技巧

5. **工程化能力**：
   - 熟悉 electron-builder 配置
   - 了解 CI/CD 流程
   - 有自动更新实现经验

### 高频问题

1. **Electron 与 Web 应用的区别？**
   - 访问系统 API
   - 离线运行
   - 更好的性能
   - 原生体验

2. **如何选择 Electron 还是其他方案（Tauri、NW.js）？**
   - 项目需求（性能、包体积、生态）
   - 团队技术栈
   - 社区支持
   - 开发效率

3. **Electron 应用的性能瓶颈在哪里？**
   - 启动时间
   - 内存占用
   - IPC 通信开销
   - 渲染性能

4. **如何保证 Electron 应用的安全性？**
   - 启用 contextIsolation
   - 禁用 nodeIntegration
   - 使用 contextBridge
   - 输入验证
   - CSP 配置

5. **Electron 应用如何进行测试？**
   - 单元测试（Jest）
   - 集成测试（Spectron）
   - E2E 测试（Playwright）
   - 性能测试

## 参考资料

### 官方资源
- [Electron 官方文档](https://www.electronjs.org/docs)
- [Electron API 文档](https://www.electronjs.org/docs/api)
- [Electron 安全指南](https://www.electronjs.org/docs/tutorial/security)

### 学习资源
- [Electron 实战](https://github.com/electron/electron-quick-start)
- [Awesome Electron](https://github.com/sindresorhus/awesome-electron)
- [Electron 最佳实践](https://www.electronjs.org/docs/tutorial/best-practices)

### 工具库
- [electron-builder](https://www.electron.build/)
- [electron-updater](https://www.electron.build/auto-update)
- [electron-store](https://github.com/sindresorhus/electron-store)
- [electron-log](https://github.com/megahertz/electron-log)

### 开源项目
- [VS Code](https://github.com/microsoft/vscode)
- [Atom](https://github.com/atom/atom)
- [Hyper](https://github.com/vercel/hyper)
- [Postman](https://www.postman.com/)

---

> 💡 **面试建议**：准备 Electron 面试时，建议先掌握基础概念（进程架构、IPC 通信），然后深入学习安全性和性能优化，最后通过实战项目积累经验。重点关注多进程架构、IPC 通信、安全配置、性能优化等核心知识点。
