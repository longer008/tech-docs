# Electron 桌面应用开发完全指南

> 更新时间：2025-02

## 目录导航

- [Electron 简介](#electron-简介)
- [快速开始](#快速开始)
- [进程通信（IPC）](#进程通信ipc)
- [窗口管理](#窗口管理)
- [原生能力](#原生能力)
- [菜单与快捷键](#菜单与快捷键)
- [打包与分发](#打包与分发)
- [自动更新](#自动更新)
- [性能优化](#性能优化)
- [安全最佳实践](#安全最佳实践)
- [调试技巧](#调试技巧)
- [实战案例](#实战案例)
- [常见问题](#常见问题)
- [面试要点](#面试要点)

## Electron 简介

### 什么是 Electron

Electron 是一个使用 JavaScript、HTML 和 CSS 构建跨平台桌面应用的框架。它将 Chromium 和 Node.js 嵌入到一个运行时中，允许开发者使用 Web 技术开发桌面应用。

**核心特点**：
- 跨平台：一套代码，支持 Windows、macOS、Linux
- Web 技术栈：使用熟悉的前端技术
- 原生能力：访问文件系统、系统托盘、通知等
- 丰富生态：npm 生态系统支持
- 活跃社区：大量开源项目和插件

**知名应用**：
- VS Code（微软）
- Slack（团队协作）
- Discord（游戏社交）
- Figma（设计工具）
- Postman（API 测试）

### Electron 架构

Electron 采用多进程架构，类似于 Chromium 浏览器：

```
┌─────────────────────────────────────────┐
│         主进程 (Main Process)            │
│  - Node.js 运行时                        │
│  - 管理应用生命周期                       │
│  - 创建和管理窗口                         │
│  - 访问原生 API                          │
└─────────────────────────────────────────┘
              ↓ 创建
┌─────────────────────────────────────────┐
│      渲染进程 (Renderer Process)         │
│  - Chromium 运行时                       │
│  - 渲染 Web 页面                         │
│  - 执行前端代码                          │
│  - 每个窗口一个进程                       │
└─────────────────────────────────────────┘
              ↕ IPC 通信
┌─────────────────────────────────────────┐
│      预加载脚本 (Preload Script)         │
│  - 桥接主进程和渲染进程                   │
│  - 暴露安全的 API                        │
│  - 在渲染进程加载前执行                   │
└─────────────────────────────────────────┘
```

**主进程 vs 渲染进程**：

| 特性 | 主进程 | 渲染进程 |
|------|--------|----------|
| 数量 | 1 个 | 多个（每个窗口一个） |
| 运行时 | Node.js | Chromium |
| 入口文件 | main.js | index.html |
| 能力 | 完整的 Node.js API | 受限的 Node.js API |
| 原生 API | 可直接访问 | 需通过 IPC 访问 |


## 快速开始

### 环境搭建

**前置要求**：
- Node.js 16+
- npm 或 yarn 或 pnpm

**安装 Electron**：

```bash
# 创建项目目录
mkdir my-electron-app
cd my-electron-app

# 初始化项目
npm init -y

# 安装 Electron
npm install electron --save-dev
```

### 创建第一个应用

**1. 项目结构**：

```
my-electron-app/
├── main.js           # 主进程入口
├── preload.js        # 预加载脚本
├── index.html        # 渲染进程页面
├── renderer.js       # 渲染进程脚本
└── package.json      # 项目配置
```

**2. 配置 package.json**：

```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  },
  "devDependencies": {
    "electron": "^28.0.0"
  }
}
```

**3. 主进程代码（main.js）**：

```javascript
const { app, BrowserWindow } = require('electron')
const path = require('path')

// 创建窗口函数
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,  // 启用上下文隔离（安全）
      nodeIntegration: false   // 禁用 Node.js 集成（安全）
    }
  })

  // 加载页面
  win.loadFile('index.html')

  // 打开开发者工具（开发环境）
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools()
  }
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  createWindow()

  // macOS 特殊处理：点击 Dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

**4. 预加载脚本（preload.js）**：

```javascript
const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 发送消息到主进程
  sendMessage: (message) => ipcRenderer.send('message', message),
  
  // 接收主进程消息
  onReply: (callback) => ipcRenderer.on('reply', (event, data) => callback(data)),
  
  // 获取平台信息
  platform: process.platform,
  
  // 获取版本信息
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
})
```

**5. 渲染进程页面（index.html）**：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
  <title>My Electron App</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 10px;
      backdrop-filter: blur(10px);
    }
    h1 { margin-top: 0; }
    .info { margin: 20px 0; }
    button {
      background: white;
      color: #667eea;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover { opacity: 0.9; }
    #response { margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 欢迎使用 Electron</h1>
    
    <div class="info">
      <p><strong>平台：</strong><span id="platform"></span></p>
      <p><strong>Node.js：</strong><span id="node-version"></span></p>
      <p><strong>Chrome：</strong><span id="chrome-version"></span></p>
      <p><strong>Electron：</strong><span id="electron-version"></span></p>
    </div>

    <button id="send-btn">发送消息到主进程</button>
    <div id="response"></div>
  </div>

  <script src="renderer.js"></script>
</body>
</html>
```

**6. 渲染进程脚本（renderer.js）**：

```javascript
// 显示版本信息
document.getElementById('platform').textContent = window.electronAPI.platform
document.getElementById('node-version').textContent = window.electronAPI.versions.node
document.getElementById('chrome-version').textContent = window.electronAPI.versions.chrome
document.getElementById('electron-version').textContent = window.electronAPI.versions.electron

// 发送消息
document.getElementById('send-btn').addEventListener('click', () => {
  window.electronAPI.sendMessage('Hello from Renderer!')
})

// 接收回复
window.electronAPI.onReply((data) => {
  document.getElementById('response').innerHTML = `
    <p><strong>主进程回复：</strong>${data}</p>
  `
})
```

**7. 运行应用**：

```bash
npm start
```


## 进程通信（IPC）

IPC（Inter-Process Communication）是 Electron 中主进程和渲染进程之间通信的核心机制。

### IPC 通信方式

**1. 渲染进程 → 主进程（单向）**：

```javascript
// 渲染进程（通过 preload.js 暴露的 API）
window.electronAPI.sendMessage('ping')

// 主进程（main.js）
const { ipcMain } = require('electron')

ipcMain.on('message', (event, data) => {
  console.log('收到消息:', data)
})
```

**2. 渲染进程 → 主进程 → 渲染进程（双向）**：

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data)
})

// 渲染进程
const result = await window.electronAPI.invoke('get-data', { id: 1 })
console.log(result)

// 主进程
ipcMain.handle('get-data', async (event, args) => {
  // 处理请求
  return { success: true, data: args }
})
```

**3. 主进程 → 渲染进程**：

```javascript
// 主进程
const { BrowserWindow } = require('electron')

const win = BrowserWindow.getFocusedWindow()
win.webContents.send('update-data', { count: 100 })

// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  onUpdate: (callback) => ipcRenderer.on('update-data', (event, data) => callback(data))
})

// 渲染进程
window.electronAPI.onUpdate((data) => {
  console.log('收到更新:', data)
})
```

### IPC 实战案例

**案例 1：文件选择对话框**

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('select-file')
})

// 主进程
const { dialog } = require('electron')

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  if (!result.canceled) {
    return result.filePaths[0]
  }
  return null
})

// 渲染进程
document.getElementById('select-btn').addEventListener('click', async () => {
  const filePath = await window.electronAPI.selectFile()
  if (filePath) {
    console.log('选择的文件:', filePath)
  }
})
```

**案例 2：读取文件内容**

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath)
})

// 主进程
const fs = require('fs').promises

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 渲染进程
const result = await window.electronAPI.readFile('/path/to/file.txt')
if (result.success) {
  console.log('文件内容:', result.content)
}
```

**案例 3：进度通知**

```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  startTask: () => ipcRenderer.send('start-task'),
  onProgress: (callback) => ipcRenderer.on('task-progress', (event, data) => callback(data))
})

// 主进程
ipcMain.on('start-task', (event) => {
  let progress = 0
  const interval = setInterval(() => {
    progress += 10
    event.sender.send('task-progress', { progress })
    
    if (progress >= 100) {
      clearInterval(interval)
    }
  }, 500)
})

// 渲染进程
window.electronAPI.startTask()
window.electronAPI.onProgress((data) => {
  console.log('进度:', data.progress + '%')
  document.getElementById('progress').style.width = data.progress + '%'
})
```

### MessagePort 通信

MessagePort 提供了更灵活的通信方式，适用于复杂场景：

```javascript
// 主进程
const { MessageChannelMain } = require('electron')

const { port1, port2 } = new MessageChannelMain()

// 发送 port2 到渲染进程
win.webContents.postMessage('port', null, [port2])

// 监听 port1 消息
port1.on('message', (event) => {
  console.log('收到消息:', event.data)
})

port1.start()

// 渲染进程
window.addEventListener('message', (event) => {
  const [port] = event.ports
  
  // 发送消息
  port.postMessage('Hello from renderer')
  
  // 接收消息
  port.onmessage = (event) => {
    console.log('收到回复:', event.data)
  }
})
```


## 窗口管理

### BrowserWindow 配置

```javascript
const { BrowserWindow } = require('electron')

const win = new BrowserWindow({
  // 窗口尺寸
  width: 1200,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  
  // 窗口位置
  x: 100,
  y: 100,
  center: true,  // 居中显示
  
  // 窗口样式
  title: 'My App',
  icon: path.join(__dirname, 'icon.png'),
  backgroundColor: '#ffffff',
  
  // 窗口行为
  resizable: true,
  movable: true,
  minimizable: true,
  maximizable: true,
  closable: true,
  
  // 窗口类型
  frame: true,        // 显示边框
  transparent: false, // 透明窗口
  alwaysOnTop: false, // 置顶
  
  // 显示方式
  show: false,        // 创建时不显示（配合 ready-to-show 事件）
  
  // Web 偏好设置
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true
  }
})

// 页面加载完成后显示（避免白屏）
win.once('ready-to-show', () => {
  win.show()
})
```

### 多窗口管理

**创建子窗口**：

```javascript
let mainWindow = null
let childWindow = null

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800
  })
  
  mainWindow.loadFile('index.html')
  
  mainWindow.on('closed', () => {
    mainWindow = null
    // 关闭所有子窗口
    if (childWindow) {
      childWindow.close()
    }
  })
}

function createChildWindow() {
  childWindow = new Brows
ow.webContents.send('message-from-child', { data: 'Hi' })
}

// 获取所有窗口
const allWindows = BrowserWindow.getAllWindows()
allWindows.forEach(win => {
  win.webContents.send('broadcast', { message: 'Hello all' })
})
```

### 无边框窗口

```javascript
const win = new BrowserWindow({
  width: 800,
  height: 600,
  frame: false,           // 无边框
  transparent: true,      // 透明背景
  titleBarStyle: 'hidden' // macOS 隐藏标题栏
})

// 自定义拖拽区域（CSS）
```

```css
/* 在 HTML 中定义可拖拽区域 */
.titlebar {
  -webkit-app-region: drag;  /* 可拖拽 */
  height: 32px;
  background: #333;
}

.titlebar button {
  -webkit-app-region: no-drag;  /* 按钮不可拖拽 */
}
```

```html
<div class="titlebar">
  <span>My App</span>
  <button id="minimize">−</button>
  <button id="maximize">□</button>
  <button id="close">×</button>
</div>
```

```javascript
// 渲染进程控制窗口
// preload.js
contextBridge.exposeInMainWorld('windowAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close')
})

// 主进程
ipcMain.on('window-minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender).minimize()
})

ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win.isMaximized()) {
    win.unmaximize()
  } else {
    win.maximize()
  }
})

ipcMain.on('window-close', (event) => {
  BrowserWindow.fromWebContents(event.sender).close()
})
```

### 窗口状态保存

```javascript
const Store = require('electron-store')
const store = new Store()

function createWindow() {
  // 恢复窗口状态
  const windowState = store.get('windowState', {
    width: 1200,
    height: 800,
    x: undefined,
    y: undefined
  })
  
  const win = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y
  })
  
  // 保存窗口状态
  const saveWindowState = () => {
    const bounds = win.getBounds()
    store.set('windowState', bounds)
  }
  
  win.on('resize', saveWindowState)
  win.on('move', saveWindowState)
  
  return win
}
```


## 原生能力

### 文件系统操作

```javascript
// 主进程
const { dialog } = require('electron')
const fs = require('fs').promises
const path = require('path')

// 选择文件
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  return result.filePaths
})

// 选择文件夹
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  return result.filePaths[0]
})

// 保存文件
ipcMain.handle('save-file', async (event, content) => {
  const result = await dialog.showSaveDialog({
    defaultPath: 'untitled.txt',
    filters: [
      { name: 'Text Files', extensions: ['txt'] }
    ]
  })
  
  if (!result.canceled) {
    await fs.writeFile(result.filePath, content, 'utf-8')
    return { success: true, path: result.filePath }
  }
  return { success: false }
})

// 读取文件
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 列出目录
ipcMain.handle('list-directory', async (event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true })
    return files.map(file => ({
      name: file.name,
      isDirectory: file.isDirectory(),
      path: path.join(dirPath, file.name)
    }))
  } catch (error) {
    return []
  }
})
```

### 系统托盘

```javascript
const { Tray, Menu, nativeImage } = require('electron')

let tray = null

function createTray() {
  // 创建托盘图标
  const icon = nativeImage.createFromPath(path.join(__dirname, 'tray-icon.png'))
  tray = new Tray(icon.resize({ width: 16, height: 16 }))
  
  // 设置提示文本
  tray.setToolTip('My Electron App')
  
  // 创建右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
        }
      }
    },
    {
      label: '隐藏窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.hide()
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])
  
  tray.setContextMenu(contextMenu)
  
  // 单击托盘图标
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
      }
    }
  })
}

app.whenReady().then(() => {
  createTray()
})
```

### 系统通知

```javascript
const { Notification } = require('electron')

// 检查是否支持通知
if (Notification.isSupported()) {
  // 创建通知
  const notification = new Notification({
    title: '新消息',
    body: '您有一条新消息',
    icon: path.join(__dirname, 'icon.png'),
    silent: false,
    urgency: 'normal'  // low, normal, critical
  })
  
  // 显示通知
  notification.show()
  
  // 通知点击事件
  notification.on('click', () => {
    console.log('通知被点击')
    if (mainWindow) {
      mainWindow.show()
    }
  })
}

// 从渲染进程触发通知
ipcMain.on('show-notification', (event, { title, body }) => {
  new Notification({ title, body }).show()
})
```

### 全局快捷键

```javascript
const { globalShortcut } = require('electron')

app.whenReady().then(() => {
  // 注册全局快捷键
  globalShortcut.register('CommandOrControl+Shift+K', () => {
    console.log('快捷键被触发')
    if (mainWindow) {
      mainWindow.show()
    }
  })
  
  // 检查快捷键是否注册成功
  const isRegistered = globalShortcut.isRegistered('CommandOrControl+Shift+K')
  console.log('快捷键注册状态:', isRegistered)
})

// 应用退出时注销快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
```

### 剪贴板操作

```javascript
const { clipboard } = require('electron')

// 读取剪贴板文本
ipcMain.handle('clipboard-read-text', () => {
  return clipboard.readText()
})

// 写入剪贴板文本
ipcMain.handle('clipboard-write-text', (event, text) => {
  clipboard.writeText(text)
  return true
})

// 读取剪贴板图片
ipcMain.handle('clipboard-read-image', () => {
  const image = clipboard.readImage()
  if (!image.isEmpty()) {
    return image.toDataURL()
  }
  return null
})

// 写入剪贴板图片
ipcMain.handle('clipboard-write-image', (event, dataURL) => {
  const image = nativeImage.createFromDataURL(dataURL)
  clipboard.writeImage(image)
  return true
})
```

### 屏幕截图

```javascript
const { desktopCapturer } = require('electron')

// 获取屏幕源
ipcMain.handle('get-sources', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
    thumbnailSize: { width: 1920, height: 1080 }
  })
  
  return sources.map(source => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.toDataURL()
  }))
})

// 渲染进程截图
// preload.js
contextBridge.exposeInMainWorld('captureAPI', {
  getSources: () => ipcRenderer.invoke('get-sources')
})

// renderer.js
async function captureScreen() {
  const sources = await window.captureAPI.getSources()
  
  // 选择第一个屏幕
  const source = sources[0]
  
  // 使用 getUserMedia 捕获屏幕
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  })
  
  // 创建 video 元素
  const video = document.createElement('video')
  video.srcObject = stream
  video.play()
  
  // 截图
  video.onloadedmetadata = () => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    
    // 获取图片数据
    const dataURL = canvas.toDataURL('image/png')
    
    // 停止流
    stream.getTracks().forEach(track => track.stop())
    
    return dataURL
  }
}
```


## 菜单与快捷键

### 应用菜单

```javascript
const { Menu, app } = require('electron')

const template = [
  {
    label: '文件',
    submenu: [
      {
        label: '新建',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          console.log('新建文件')
        }
      },
      {
        label: '打开',
        accelerator: 'CmdOrCtrl+O',
        click: async () => {
          const result = await dialog.showOpenDialog({
            properties: ['openFile']
          })
          console.log(result.filePaths)
        }
      },
      {
        label: '保存',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          console.log('保存文件')
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        accelerator: 'CmdOrCtrl+Q',
        role: 'quit'
      }
    ]
  },
  {
    label: '编辑',
    submenu: [
      { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
      { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
      { type: 'separator' },
      { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
      { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
      { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
    ]
  },
  {
    label: '视图',
    submenu: [
      { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
      { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
      { label: '开发者工具', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' },
      { type: 'separator' },
      { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
      { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
      { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
      { type: 'separator' },
      { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' }
    ]
  },
  {
    label: '帮助',
    submenu: [
      {
        label: '关于',
        click: () => {
          dialog.showMessageBox({
            type: 'info',
            title: '关于',
            message: 'My Electron App',
            detail: 'Version 1.0.0'
          })
        }
      },
      {
        label: '检查更新',
        click: () => {
          console.log('检查更新')
        }
      }
    ]
  }
]

// macOS 特殊处理：添加应用名称菜单
if (process.platform === 'darwin') {
  template.unshift({
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  })
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
```

### 上下文菜单

```javascript
// 渲染进程
window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  window.electronAPI.showContextMenu()
})

// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  showContextMenu: () => ipcRenderer.send('show-context-menu')
})

// 主进程
const { Menu } = require('electron')

ipcMain.on('show-context-menu', (event) => {
  const template = [
    {
      label: '复制',
      role: 'copy'
    },
    {
      label: '粘贴',
      role: 'paste'
    },
    { type: 'separator' },
    {
      label: '刷新',
      click: () => {
        event.sender.reload()
      }
    }
  ]
  
  const menu = Menu.buildFromTemplate(template)
  menu.popup(BrowserWindow.fromWebContents(event.sender))
})
```

## 打包与分发

### 使用 electron-builder

**1. 安装**：

```bash
npm install electron-builder --save-dev
```

**2. 配置 package.json**：

```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux"
  },
  "build": {
    "appId": "com.example.myapp",
    "productName": "My Electron App",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "preload.js",
      "renderer.js",
      "index.html",
      "package.json"
    ],
    "win": {
      "target": ["nsis", "portable"],
 Windows 图标（256x256）
├── icon.icns     # macOS 图标
└── icon.png      # Linux 图标（512x512）
```

**4. 打包**：

```bash
# 打包当前平台
npm run build

# 打包 Windows
npm run build:win

# 打包 macOS
npm run build:mac

# 打包 Linux
npm run build:linux
```

### 多平台打包配置

```json
{
  "build": {
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "icon": "build/icon.ico",
      "requestedExecutionLevel": "asInvoker"
    },
    "mac": {
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        },
        {
          "target": "zip",
          "arch": ["x64", "arm64"]
        }
      ],
      "icon": "build/icon.icns",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    },
    "linux": {
      "target": ["AppImage", "deb", "rpm"],
      "icon": "build/icons",
      "category": "Utility",
      "maintainer": "your-email@example.com"
    }
  }
}
```

### 代码签名

**Windows 签名**：

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "password",
      "signingHashAlgorithms": ["sha256"],
      "sign": "./customSign.js"
    }
  }
}
```

**macOS 签名**：

```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name (TEAM_ID)",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist"
    },
    "afterSign": "scripts/notarize.js"
  }
}
```

**notarize.js**（macOS 公证）：

```javascript
const { notarize } = require('electron-notarize')

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  
  if (electronPlatformName !== 'darwin') {
    return
  }
  
  const appName = context.packager.appInfo.productFilename
  
  return await notarize({
    appBundleId: 'com.example.myapp',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID
  })
}
```


## 自动更新

### 使用 electron-updater

**1. 安装**：

```bash
npm install electron-updater --save
```

**2. 配置 package.json**：

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

**3. 主进程代码**：

```javascript
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')

// 配置日志
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

// 检查更新
function checkForUpdates() {
  autoUpdater.checkForUpdatesAndNotify()
}

// 更新事件
autoUpdater.on('checking-for-update', () => {
  log.info('正在检查更新...')
  sendStatusToWindow('正在检查更新...')
})

autoUpdater.on('update-available', (info) => {
  log.info('发现新版本')
  sendStatusToWindow('发现新版本')
})

autoUpdater.on('update-not-available', (info) => {
  log.info('当前已是最新版本')
  sendStatusToWindow('当前已是最新版本')
})

autoUpdater.on('error', (err) => {
  log.error('更新错误:', err)
  sendStatusToWindow('更新错误: ' + err)
})

autoUpdater.on('download-progress', (progressObj) => {
  let message = `下载速度: ${progressObj.bytesPerSecond}`
  message += ` - 已下载 ${progressObj.percent}%`
  message += ` (${progressObj.transferred}/${progressObj.total})`
  
  log.info(message)
  sendStatusToWindow(message)
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('更新下载完成')
  sendStatusToWindow('更新下载完成')
  
  // 提示用户重启应用
  dialog.showMessageBox({
    type: 'info',
    title: '安装更新',
    message: '更新已下载完成，是否立即重启应用？',
    buttons: ['立即重启', '稍后']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  })
})

function sendStatusToWindow(text) {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', text)
  }
}

// 应用启动后检查更新
app.whenReady().then(() => {
  createWindow()
  
  // 延迟 3 秒后检查更新
  setTimeout(() => {
    checkForUpdates()
  }, 3000)
})

// 手动检查更新
ipcMain.on('check-for-updates', () => {
  checkForUpdates()
})
```

**4. 渲染进程代码**：

```javascript
// preload.js
contextBridge.exposeInMainWorld('updaterAPI', {
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, tex
itHub 仓库创建新的 Release
- 上传构建产物（.exe、.dmg、.AppImage 等）
- electron-updater 会自动检测新版本

### 灰度发布

```javascript
const { autoUpdater } = require('electron-updater')

// 配置更新通道
autoUpdater.channel = 'beta'  // stable, beta, alpha

// 或者根据用户配置
const userChannel = store.get('updateChannel', 'stable')
autoUpdater.channel = userChannel

// 检查更新
autoUpdater.checkForUpdates()
```

## 性能优化

### 启动优化

**1. 延迟加载**：

```javascript
// 主进程
app.whenReady().then(() => {
  // 立即创建主窗口
  createWindow()
  
  // 延迟加载其他功能
  setTimeout(() => {
    initTray()
    initAutoUpdater()
    initGlobalShortcuts()
  }, 1000)
})
```

**2. 预加载优化**：

```javascript
// 只暴露必要的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 核心 API
  platform: process.platform,
  
  // 按需加载的 API
  loadFileAPI: () => {
    return {
      selectFile: () => ipcRenderer.invoke('select-file'),
      readFile: (path) => ipcRenderer.invoke('read-file', path)
    }
  }
})
```

**3. 窗口显示优化**：

```javascript
const win = new BrowserWindow({
  show: false,  // 创建时不显示
  backgroundColor: '#ffffff'  // 设置背景色避免闪烁
})

// 页面加载完成后显示
win.once('ready-to-show', () => {
  win.show()
})
```

### 内存优化

**1. 及时释放资源**：

```javascript
// 关闭窗口时释放资源
win.on('closed', () => {
  win = null
  // 清理其他资源
  clearInterval(timer)
  removeAllListeners()
})
```

**2. 限制渲染进程数量**：

```javascript
// 复用窗口而不是创建新窗口
function showWindow() {
  if (win) {
    win.show()
  } else {
    createWindow()
  }
}
```

**3. 使用 webContents.session 清理缓存**：

```javascript
// 清理缓存
app.on('before-quit', async () => {
  const session = require('electron').session
  await session.defaultSession.clearCache()
  await session.defaultSession.clearStorageData()
})
```

### 渲染优化

**1. 虚拟列表**：

```javascript
// 使用 react-window 或 vue-virtual-scroller
import { FixedSizeList } from 'react-window'

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index]}
        </div>
      )}
    </FixedSizeList>
  )
}
```

**2. 懒加载图片**：

```javascript
// 使用 Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      img.src = img.dataset.src
      observer.unobserve(img)
    }
  })
})

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img)
})
```

### 打包体积优化

**1. 排除不必要的文件**：

```json
{
  "build": {
    "files": [
      "main.js",
      "preload.js",
      "renderer/**/*",
      "!node_modules/**/*",
      "node_modules/electron-store/**/*"
    ],
    "asarUnpack": [
      "node_modules/native-module/**/*"
    ]
  }
}
```

**2. 使用 asar 压缩**：

```json
{
  "build": {
    "asar": true,
    "asarUnpack": [
      "**/*.node"
    ]
  }
}
```

**3. 代码分割**：

```javascript
// 使用动态导入
button.addEventListener('click', async () => {
  const module = await import('./heavy-module.js')
  module.doSomething()
})
```


## 安全最佳实践

### 核心安全配置

```javascript
const win = new BrowserWindow({
  webPreferences: {
    // 1. 启用上下文隔离（必须）
    contextIsolation: true,
    
    // 2. 禁用 Node.js 集成（必须）
    nodeIntegration: false,
    
    // 3. 启用沙箱（推荐）
    sandbox: true,
    
    // 4. 禁用远程模块（已废弃）
    enableRemoteModule: false,
    
    // 5. 使用预加载脚本
    preload: path.join(__dirname, 'preload.js'),
    
    // 6. 禁用 webview 标签
    webviewTag: false
  }
})
```

### CSP（内容安全策略）

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:;">
```

```javascript
// 或在主进程设置
win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'"]
    }
  })
})
```

### 安全的 IPC 通信

```javascript
// ❌ 不安全：直接暴露 ipcRenderer
window.ipcRenderer = require('electron').ipcRenderer

// ✅ 安全：通过 contextBridge 暴露特定 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 只暴露需要的方法
  readFile: (path) => {
    // 验证路径
    if (!isValidPath(path)) {
      throw new Error('Invalid path')
    }
    return ipcRenderer.invoke('read-file', path)
  }
})

// 主进程验证
ipcMain.handle('read-file', async (event, filePath) => {
  // 验证来源
  if (!isValidSender(event.sender)) {
    throw new Error('Unauthorized')
  }
  
  // 验证路径
  if (!isValidPath(filePath)) {
    throw new Error('Invalid path')
  }
  
  // 读取文件
  return await fs.readFile(filePath, 'utf-8')
})
```

### 防止远程内容注入

```javascript
// 加载远程内容时的安全措施
win.loadURL('https://example.com', {
  userAgent: 'MyApp/1.0.0',
  extraHeaders: 'X-Custom-Header: value'
})

// 监听导航事件
win.webContents.on('will-navigate', (event, url) => {
  // 只允许特定域名
  const allowedDomains = ['https://example.com']
  const parsedUrl = new URL(url)
  
  if (!allowedDomains.includes(parsedUrl.origin)) {
    event.preventDefault()
    console.warn('Blocked navigation to:', url)
  }
})

// 阻止新窗口打开
win.webContents.setWindowOpenHandler(({ url }) => {
  // 在默认浏览器中打开
  shell.openExternal(url)
  return { action: 'deny' }
})
```

### 输入验证

```javascript
// 主进程
ipcMain.handle('save-data', async (event, data) => {
  // 验证数据类型
  if (typeof data !== 'object') {
    throw new Error('Invalid data type')
  }
  
  // 验证必填字段
  if (!data.name || !data.email) {
    throw new Error('Missing required fields')
  }
  
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    throw new Error('Invalid email format')
  }
  
  // 清理输入（防止 XSS）
  const cleanData = {
    name: sanitizeHtml(data.name),
    email: sanitizeHtml(data.email)
  }
  
  // 保存数据
  await saveToDatabase(cleanData)
})
```

## 调试技巧

### 渲染进程调试

**1. 使用 DevTools**：

```javascript
// 主进程
const win = new BrowserWindow({
  webPreferences: {
    devTools: true  // 启用 DevTools
  }
})

// 打开 DevTools
win.webContents.openDevTools()

// 分离 DevTools
win.webContents.openDevTools({ mode: 'detach' })

// 关闭 DevTools
win.webContents.closeDevTools()
```

**2. 使用 Vue/React DevTools**：

```bash
# 安装 electron-devtools-installer
npm install electron-devtools-installer --save-dev
```

```javascript
// 主进程
const { default: installExtension, REACT_DEVELOPER_TOOLS, VUEJS_DEVTOOLS } = require('electron-devtools-installer')

app.whenReady().then(() => {
  // 安装 React DevTools
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension: ${name}`))
    .catch((err) => console.log('An error occurred: ', err))
  
  // 安装 Vue DevTools
  installExtension(VUEJS_DEVTOOLS)
    .then((name) => console.log(`Added Extension: ${name}`))
    .catch((err) => console.log('An error occurred: ', err))
})
```

### 主进程调试

**1. 使用 VS Code 调试**：

`.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Electron: Main",
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

**2. 使用 Chrome DevTools**：

```bash
# 启动时添加 --inspect 参数
electron --inspect=5858 .

# 或在代码中启用
# main.js
if (process.env.NODE_ENV === 'development') {
  require('electron').app.commandLine.appendSwitch('inspect', '5858')
}
```

然后在 Chrome 中访问 `chrome://inspect`。

### 日志系统

```javascript
// 使用 electron-log
const log = require('electron-log')

// 配置日志
log.transports.file.level = 'info'
log.transports.file.maxSize = 5 * 1024 * 1024  // 5MB
log.transports.console.level = 'debug'

// 记录日志
log.info('应用启动')
log.warn('警告信息')
log.error('错误信息', error)

// 查看日志文件位置
console.log(log.transports.file.getFile().path)
// Windows: %USERPROFILE%\AppData\Roaming\<app name>\logs\main.log
// macOS: ~/Library/Logs/<app name>/main.log
// Linux: ~/.config/<app name>/logs/main.log
```

### 崩溃报告

```javascript
const { crashReporter } = require('electron')

// 启动崩溃报告
crashReporter.start({
  productName: 'MyApp',
  companyName: 'MyCompany',
  submitURL: 'https://your-crash-report-server.com/submit',
  uploadToServer: true
})

// 主进程崩溃处理
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error)
  // 显示错误对话框
  dialog.showErrorBox('应用错误', error.message)
})

// 渲染进程崩溃处理
win.webContents.on('crashed', (event, killed) => {
  log.error('Renderer process crashed')
  
  // 重新加载页面
  const options = {
    type: 'error',
    title: '应用崩溃',
    message: '应用遇到了一个错误，是否重新加载？',
    buttons: ['重新加载', '退出']
  }
  
  dialog.showMessageBox(options).then((result) => {
    if (result.response === 0) {
      win.reload()
    } else {
      app.quit()
    }
  })
})
```


## 实战案例

### 案例 1：Markdown 编辑器

**功能需求**：
- 文件打开/保存
- 实时预览
- 语法高亮
- 导出 PDF

**项目结构**：

```
markdown-editor/
├── main.js
├── preload.js
├── src/
│   ├── index.html
│   ├── editor.js
│   ├── preview.js
│   └── styles.css
└── package.json
```

**核心代码**：

```javascript
// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const fs = require('fs').promises
const path = require('path')

let mainWindow = null
let currentFilePath = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  
  mainWindow.loadFile('src/index.html')
}

// 打开文件
ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  if (!result.canceled) {
    currentFilePath = result.filePaths[0]
    const content = await fs.readFile(currentFilePath, 'utf-8')
    return { success: true, content, path: currentFilePath }
  }
  return { success: false }
})

// 保存文件
ipcMain.handle('save-file', async (event, content) => {
  if (currentFilePath) {
    await fs.writeFile(currentFilePath, content, 'utf-8')
    return { success: true, path: currentFilePath }
  } else {
    return await saveFileAs(content)
  }
})

// 另存为
ipcMain.handle('save-file-as', async (event, content) => {
  return await saveFileAs(content)
})

async function saveFileAs(content) {
  const result = await dialog.showSaveDialog({
    defaultPath: 'untitled.md',
    filters: [
      { name: 'Markdown', extensions: ['md'] }
    ]
  })
  
  if (!result.canceled) {
    currentFilePath = result.filePath
    await fs.writeFile(currentFilePath, content, 'utf-8')
ateWindow)
```

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('editorAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (content) => ipcRenderer.invoke('save-file', content),
  saveFileAs: (content) => ipcRenderer.invoke('save-file-as', content),
  exportPDF: () => ipcRenderer.invoke('export-pdf')
})
```

```html
<!-- src/index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Markdown Editor</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/marked/marked.min.css">
</head>
<body>
  <div class="toolbar">
    <button id="open-btn">打开</button>
    <button id="save-btn">保存</button>
    <button id="save-as-btn">另存为</button>
    <button id="export-pdf-btn">导出 PDF</button>
  </div>
  
  <div class="container">
    <div class="editor-pane">
      <textarea id="editor" placeholder="在此输入 Markdown..."></textarea>
    </div>
    <div class="preview-pane">
      <div id="preview"></div>
    </div>
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="editor.js"></script>
</body>
</html>
```

```javascript
// src/editor.js
const editor = document.getElementById('editor')
const preview = document.getElementById('preview')

// 实时预览
editor.addEventListener('input', () => {
  const markdown = editor.value
  const html = marked.parse(markdown)
  preview.innerHTML = html
})

// 打开文件
document.getElementById('open-btn').addEventListener('click', async () => {
  const result = await window.editorAPI.openFile()
  if (result.success) {
    editor.value = result.content
    editor.dispatchEvent(new Event('input'))
  }
})

// 保存文件
document.getElementById('save-btn').addEventListener('click', async () => {
  const content = editor.value
  const result = await window.editorAPI.saveFile(content)
  if (result.success) {
    alert('保存成功')
  }
})

// 另存为
document.getElementById('save-as-btn').addEventListener('click', async () => {
  const content = editor.value
  const result = await window.editorAPI.saveFileAs(content)
  if (result.success) {
    alert('保存成功')
  }
})

// 导出 PDF
document.getElementById('export-pdf-btn').addEventListener('click', async () => {
  const result = await window.editorAPI.exportPDF()
  if (result.success) {
    alert('导出成功')
  }
})
```

### 案例 2：系统监控工具

**功能需求**：
- CPU 使用率
- 内存使用率
- 磁盘使用率
- 网络流量
- 系统托盘显示

**核心代码**：

```javascript
// main.js
const { app, BrowserWindow, Tray, Menu } = require('electron')
const os = require('os')
const si = require('systeminformation')

let mainWindow = null
let tray = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  
  mainWindow.loadFile('index.html')
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'))
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示', click: () => mainWindow.show() },
    { label: '退出', click: () => app.quit() }
  ])
  
  tray.setContextMenu(contextMenu)
  tray.setToolTip('系统监控')
}

// 获取系统信息
ipcMain.handle('get-system-info', async () => {
  const [cpu, mem, disk, network] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.networkStats()
  ])
  
  return {
    cpu: {
      usage: cpu.currentLoad.toFixed(2),
      cores: os.cpus().length
    },
    memory: {
      total: (mem.total / 1024 / 1024 / 1024).toFixed(2),
      used: (mem.used / 1024 / 1024 / 1024).toFixed(2),
      usage: ((mem.used / mem.total) * 100).toFixed(2)
    },
    disk: disk.map(d => ({
      fs: d.fs,
      size: (d.size / 1024 / 1024 / 1024).toFixed(2),
      used: (d.used / 1024 / 1024 / 1024).toFixed(2),
      usage: d.use.toFixed(2)
    })),
    network: network.map(n => ({
      iface: n.iface,
      rx: (n.rx_sec / 1024).toFixed(2),
      tx: (n.tx_sec / 1024).toFixed(2)
    }))
  }
})

app.whenReady().then(() => {
  createWindow()
  createTray()
})
```

## 常见问题

### 1. 白屏问题

**原因**：
- 页面加载失败
- 路径错误
- CSP 配置过严

**解决方案**：

```javascript
// 1. 检查路径
win.loadFile('index.html')  // 相对路径
win.loadURL(`file://${__dirname}/index.html`)  // 绝对路径

// 2. 监听加载事件
win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
  console.error('页面加载失败:', errorDescription)
})

// 3. 延迟显示窗口
win.once('ready-to-show', () => {
  win.show()
})
```

### 2. 打包后无法运行

**原因**：
- 路径问题（开发环境 vs 生产环境）
- 原生模块未正确打包
- 缺少依赖

**解决方案**：

```javascript
// 1. 使用正确的路径
const isDev = process.env.NODE_ENV === 'development'
const preloadPath = isDev
  ? path.join(__dirname, 'preload.js')
  : path.join(process.resourcesPath, 'app.asar', 'preload.js')

// 2. 配置 asar 解包
{
  "build": {
    "asarUnpack": [
      "node_modules/native-module/**/*"
    ]
  }
}

// 3. 使用 extraResources
{
  "build": {
    "extraResources": [
      {
        "from": "resources/",
        "to": "resources/"
      }
    ]
  }
}
```

### 3. IPC 通信失败

**原因**：
- 通道名称不匹配
- 未正确注册监听器
- 上下文隔离问题

**解决方案**：

```javascript
// 1. 确保通道名称一致
// 渲染进程
ipcRenderer.send('my-channel', data)

// 主进程
ipcMain.on('my-channel', (event, data) => {
  // 处理
})

// 2. 使用 invoke/handle（推荐）
// 渲染进程
const result = await ipcRenderer.invoke('my-channel', data)

// 主进程
ipcMain.handle('my-channel', async (event, data) => {
  return result
})

// 3. 检查 contextBridge
contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => ipcRenderer.send(channel, data)
})
```

### 4. 内存泄漏

**原因**：
- 未移除事件监听器
- 循环引用
- 大对象未释放

**解决方案**：

```javascript
// 1. 及时移除监听器
const handler = () => {}
ipcMain.on('event', handler)
// 使用完后移除
ipcMain.removeListener('event', handler)

// 2. 使用 once 代替 on
ipcMain.once('event', handler)

// 3. 清理窗口引用
win.on('closed', () => {
  win = null
})

// 4. 使用 WeakMap/WeakSet
const cache = new WeakMap()
```


## 面试要点

### 基础概念

**Q1：什么是 Electron？它的架构是怎样的？**

**核心答案**：
- Electron 是使用 Web 技术构建跨平台桌面应用的框架
- 基于 Chromium（渲染引擎）和 Node.js（运行时）
- 采用多进程架构：主进程 + 多个渲染进程
- 主进程管理应用生命周期和窗口，渲染进程负责页面渲染

**追问点**：
- 主进程和渲染进程的区别？
- 为什么要使用多进程架构？
- Electron 的优缺点？

**Q2：Electron 的 IPC 通信机制是什么？**

**核心答案**：
- IPC（Inter-Process Communication）用于主进程和渲染进程通信
- 主要方式：
  - `ipcRenderer.send` + `ipcMain.on`（单向）
  - `ipcRenderer.invoke` + `ipcMain.handle`（双向，推荐）
  - `webContents.send`（主进程 → 渲染进程）
- 通过预加载脚本和 contextBridge 暴露安全的 API

**追问点**：
- 如何保证 IPC 通信的安全性？
- MessagePort 是什么？
- 如何实现渲染进程之间的通信？

### 安全性

**Q3：Electron 应用有哪些安全风险？如何防范？**

**核心答案**：

**安全风险**：
1. XSS 攻击
2. 远程代码执行
3. 原生能力滥用
4. 中间人攻击

**防范措施**：
1. 启用 `contextIsolation`
2. 禁用 `nodeIntegration`
3. 启用 `sandbox`
4. 配置 CSP
5. 验证所有输入
6. 使用 HTTPS
7. 代码签名

**代码示例**：
```javascript
const win = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    preload: path.join(__dirname, 'preload.js')
  }
})
```

**追问点**：
- contextIsolation 的作用？
- 如何安全地暴露 Node.js API？
- 如何防止 XSS 攻击？

### 性能优化

**Q4：如何优化 Electron 应用的性能？**

**核心答案**：

**启动优化**：
1. 延迟加载非核心功能
2. 使用 `show: false` + `ready-to-show`
3. 预加载脚本优化

**内存优化**：
1. 及时释放资源
2. 限制渲染进程数量
3. 使用 WeakMap/WeakSet
4. 清理缓存

**渲染优化**：
1. 虚拟列表
2. 懒加载图片
3. 代码分割
4. 使用 Web Workers

**打包优化**：
1. 排除不必要的文件
2. 使用 asar 压缩
3. 代码压缩和混淆

**追问点**：
- 如何排查内存泄漏？
- 如何减小打包体积？
- 如何监控应用性能？

### 打包与分发

**Q5：如何打包和分发 Electron 应用？**

**核心答案**：

**打包工具**：
- electron-builder（推荐）
- electron-packager
- electron-forge

**多平台打包**：
```json
{
  "build": {
    "win": { "target": ["nsis", "portable"] },
    "mac": { "target": ["dmg", "zip"] },
    "linux": { "target": ["AppImage", "deb"] }
  }
}
```

**代码签名**：
- Windows：使用 .pfx 证书
- macOS：使用 Developer ID + 公证
- Linux：不强制要求

**自动更新**：
- 使用 electron-updater
- 配置更新服务器（GitHub Releases）
- 实现增量更新

**追问点**：
- 如何实现自动更新？
- 如何进行代码签名？
- 如何实现灰度发布？

### 实战场景

**Q6：如何实现一个文件管理器？**

**核心答案**：

**功能模块**：
1. 文件浏览（fs.readdir）
2. 文件操作（复制、移动、删除）
3. 文件预览（图片、文本、PDF）
4. 搜索功能
5. 右键菜单

**关键技术**：
```javascript
// 1. 列出目录
ipcMain.handle('list-directory', async (event, dirPath) => {
  const files = await fs.readdir(dirPath, { withFileTypes: true })
  return files.map(file => ({
    name: file.name,
    isDirectory: file.isDirectory(),
    size: file.isFile() ? (await fs.stat(path.join(dirPath, fi

3. 使用 Canvas 绘制选区
4. 截取选区图片
5. 保存或复制到剪贴板

**关键代码**：
```javascript
// 1. 获取屏幕源
const sources = await desktopCapturer.getSources({
  types: ['screen'],
  thumbnailSize: { width: 1920, height: 1080 }
})

// 2. 创建截图窗口
const captureWin = new BrowserWindow({
  fullscreen: true,
  transparent: true,
  frame: false,
  alwaysOnTop: true
})

// 3. 截图并保存
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
ctx.drawImage(video, x, y, width, height, 0, 0, width, height)
const dataURL = canvas.toDataURL('image/png')
```

**追问点**：
- 如何实现多显示器截图？
- 如何添加标注功能？
- 如何优化截图性能？

## 参考资料

### 官方资源

- [Electron 官方文档](https://www.electronjs.org/docs/latest/)
- [Electron API 文档](https://www.electronjs.org/docs/latest/api/app)
- [Electron 示例应用](https://github.com/electron/electron-quick-start)
- [Electron Fiddle](https://www.electronjs.org/fiddle)（在线试验）

### 学习教程

- [Electron 入门教程](https://www.electronjs.org/docs/latest/tutorial/quick-start)
- [Electron 安全指南](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron 性能优化](https://www.electronjs.org/docs/latest/tutorial/performance)
- [Electron 打包指南](https://www.electronjs.org/docs/latest/tutorial/application-distribution)

### 常用库

**开发工具**：
- electron-builder（打包）
- electron-updater（自动更新）
- electron-store（数据持久化）
- electron-log（日志）
- electron-devtools-installer（DevTools 扩展）

**UI 框架**：
- React + Electron
- Vue + Electron
- Angular + Electron
- Svelte + Electron

**实用库**：
- systeminformation（系统信息）
- node-notifier（通知）
- chokidar（文件监听）
- sharp（图片处理）

### 开源项目

**知名应用**：
- [VS Code](https://github.com/microsoft/vscode)
- [Atom](https://github.com/atom/atom)
- [Hyper](https://github.com/vercel/hyper)
- [Postman](https://www.postman.com/)

**示例项目**：
- [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate)
- [electron-vue](https://github.com/SimulatedGREG/electron-vue)
- [electron-quick-start](https://github.com/electron/electron-quick-start)

### 社区资源

- [Electron 中文社区](https://electronjs.org/community)
- [Awesome Electron](https://github.com/sindresorhus/awesome-electron)
- [Electron Discord](https://discord.com/invite/electron)
- [Stack Overflow - Electron](https://stackoverflow.com/questions/tagged/electron)

### 学习路线

**初级（1-2 周）**：
1. 了解 Electron 架构
2. 创建第一个应用
3. 学习 IPC 通信
4. 掌握窗口管理

**中级（2-4 周）**：
1. 原生能力调用
2. 菜单与快捷键
3. 打包与分发
4. 自动更新

**高级（1-2 月）**：
1. 性能优化
2. 安全最佳实践
3. 调试技巧
4. 实战项目

---

## 总结

Electron 是一个强大的跨平台桌面应用开发框架，它让前端开发者能够使用熟悉的 Web 技术构建桌面应用。掌握 Electron 需要理解其多进程架构、IPC 通信机制、安全最佳实践和性能优化策略。

**核心要点**：
1. ✅ 理解主进程和渲染进程的区别
2. ✅ 掌握 IPC 通信的各种方式
3. ✅ 遵循安全最佳实践（contextIsolation、nodeIntegration）
4. ✅ 学会使用原生能力（文件系统、系统托盘、通知等）
5. ✅ 掌握打包和分发流程
6. ✅ 实现自动更新机制
7. ✅ 进行性能优化和调试

通过本指南的学习和实践，你将能够独立开发和发布专业的 Electron 桌面应用！
