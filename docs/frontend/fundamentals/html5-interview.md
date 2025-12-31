# HTML5 面试题集

> HTML5 核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. HTML5 新特性

```
┌─────────────────────────────────────────────────────────────┐
│                    HTML5 新特性概览                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  语义化标签：                                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ header  │ │  nav    │ │ article │ │ section │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ aside   │ │ footer  │ │  main   │ │ figure  │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                              │
│  多媒体标签：                                                │
│  <audio> <video> <source> <track>                          │
│                                                              │
│  表单增强：                                                  │
│  input types: email, url, number, range, date, color...   │
│  新属性: placeholder, required, autofocus, pattern         │
│                                                              │
│  API 增强：                                                  │
│  Canvas, WebGL, SVG, Geolocation, Drag & Drop             │
│  Web Storage, Web Workers, WebSocket, History API          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**语义化标签对比：**
| 标签 | 语义 | 使用场景 |
|------|------|----------|
| `<header>` | 页头/区块头 | 页面顶部、文章头部 |
| `<nav>` | 导航 | 主导航、侧边导航 |
| `<main>` | 主内容 | 页面主体内容（唯一） |
| `<article>` | 独立内容 | 文章、帖子、评论 |
| `<section>` | 章节 | 内容分组 |
| `<aside>` | 侧边内容 | 侧边栏、广告 |
| `<footer>` | 页脚 | 版权、联系信息 |
| `<figure>` | 媒体内容 | 图片、图表 |
| `<figcaption>` | 媒体标题 | 图片说明 |

---

#### 2. DOCTYPE 的作用

```html
<!DOCTYPE html>
```

**作用：**
```
1. 告诉浏览器使用哪种 HTML 规范解析文档
2. 触发浏览器的标准模式（Standards Mode）
3. 没有 DOCTYPE 会触发怪异模式（Quirks Mode）

标准模式 vs 怪异模式：
┌─────────────────┬─────────────────────────────────────────┐
│     特性        │  标准模式          │  怪异模式          │
├─────────────────┼────────────────────┼────────────────────┤
│ 盒模型          │ content-box        │ border-box         │
│ 行内元素尺寸    │ 不能设置宽高       │ 可能允许           │
│ 图片间隙        │ 有间隙             │ 无间隙             │
│ 百分比高度      │ 需要父元素有高度   │ 相对于 body        │
└─────────────────┴────────────────────┴────────────────────┘
```

---

#### 3. 语义化的意义

```
语义化的好处：

1. 代码可读性
   ┌────────────────────────────────────────────────────────┐
   │  <div class="header">...</div>    ❌ 不语义化          │
   │  <header>...</header>             ✓ 语义化            │
   └────────────────────────────────────────────────────────┘

2. SEO 优化
   - 搜索引擎更容易理解页面结构
   - 提升关键词权重
   - 改善搜索排名

3. 无障碍访问（a11y）
   - 屏幕阅读器能正确解读
   - 帮助视障用户理解页面
   - 符合 WCAG 标准

4. 维护性
   - 代码结构清晰
   - 便于团队协作
   - 降低维护成本
```

---

#### 4. meta 标签

```html
<!-- 字符编码 -->
<meta charset="UTF-8">

<!-- 视口设置（移动端必须） -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- IE 兼容模式 -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">

<!-- SEO 相关 -->
<meta name="description" content="网页描述">
<meta name="keywords" content="关键词1,关键词2">
<meta name="author" content="作者">
<meta name="robots" content="index,follow">

<!-- 社交媒体（Open Graph） -->
<meta property="og:title" content="标题">
<meta property="og:description" content="描述">
<meta property="og:image" content="图片URL">
<meta property="og:url" content="页面URL">

<!-- 缓存控制 -->
<meta http-equiv="Cache-Control" content="no-cache">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">

<!-- 移动端相关 -->
<meta name="theme-color" content="#ffffff">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="format-detection" content="telephone=no">
```

**viewport 详解：**
| 属性 | 说明 | 常用值 |
|------|------|--------|
| width | 视口宽度 | device-width |
| height | 视口高度 | device-height |
| initial-scale | 初始缩放 | 1.0 |
| minimum-scale | 最小缩放 | 1.0 |
| maximum-scale | 最大缩放 | 1.0 |
| user-scalable | 是否允许缩放 | no |

---

#### 5. 块级元素与行内元素

```
块级元素（Block）：
┌─────────────────────────────────────────────────────────────┐
│  特点：                                                      │
│  - 独占一行                                                  │
│  - 可设置宽高、内外边距                                      │
│  - 默认宽度是父元素的 100%                                   │
│                                                              │
│  常见标签：                                                  │
│  div, p, h1-h6, ul, ol, li, table, form                    │
│  header, footer, nav, section, article, aside, main        │
└─────────────────────────────────────────────────────────────┘

行内元素（Inline）：
┌─────────────────────────────────────────────────────────────┐
│  特点：                                                      │
│  - 不独占一行，与其他行内元素同行                            │
│  - 不能设置宽高                                              │
│  - 宽高由内容决定                                            │
│  - 垂直方向的 margin/padding 不生效                          │
│                                                              │
│  常见标签：                                                  │
│  span, a, img, input, label, strong, em, i, b              │
└─────────────────────────────────────────────────────────────┘

行内块元素（Inline-Block）：
┌─────────────────────────────────────────────────────────────┐
│  特点：                                                      │
│  - 不独占一行                                                │
│  - 可设置宽高                                                │
│                                                              │
│  常见标签：                                                  │
│  img, input, button, select, textarea                      │
└─────────────────────────────────────────────────────────────┘
```

**转换方式：**
```css
/* 块级 → 行内 */
display: inline;

/* 行内 → 块级 */
display: block;

/* 行内块 */
display: inline-block;
```

---

### 进阶题

#### 6. HTML5 存储方案

```
┌─────────────────────────────────────────────────────────────┐
│                    Web 存储对比                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性           Cookie        localStorage   sessionStorage │
│  ──────────────────────────────────────────────────────────│
│  存储大小       4KB           5MB            5MB            │
│  生命周期       可设置过期    永久           会话结束        │
│  发送到服务器   每次请求      不发送         不发送          │
│  跨标签页       是            是             否              │
│  API           document.cookie  setItem/getItem            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**localStorage 使用：**
```javascript
// 存储
localStorage.setItem('key', 'value');
localStorage.setItem('obj', JSON.stringify({ name: 'test' }));

// 读取
const value = localStorage.getItem('key');
const obj = JSON.parse(localStorage.getItem('obj'));

// 删除
localStorage.removeItem('key');

// 清空
localStorage.clear();

// 遍历
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, localStorage.getItem(key));
}
```

**IndexedDB（大容量存储）：**
```javascript
// 打开数据库
const request = indexedDB.open('myDB', 1);

request.onerror = (e) => console.error('Error');
request.onsuccess = (e) => {
  const db = e.target.result;
  // 使用数据库
};

request.onupgradeneeded = (e) => {
  const db = e.target.result;
  // 创建对象存储
  const store = db.createObjectStore('users', { keyPath: 'id' });
  store.createIndex('name', 'name', { unique: false });
};
```

---

#### 7. Canvas 与 SVG

```
┌─────────────────────────────────────────────────────────────┐
│                    Canvas vs SVG                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性           Canvas              SVG                     │
│  ──────────────────────────────────────────────────────────│
│  渲染方式       位图（像素）        矢量（DOM）              │
│  事件支持       需要自己计算        支持 DOM 事件           │
│  分辨率         依赖分辨率          无限缩放                │
│  性能           适合频繁重绘        适合少量元素            │
│  动画           需要循环重绘        CSS/SMIL 动画          │
│  适用场景       游戏、图表          图标、地图              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Canvas 基础：**
```javascript
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 绘制矩形
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 100, 50);

// 绘制路径
ctx.beginPath();
ctx.moveTo(50, 50);
ctx.lineTo(100, 100);
ctx.stroke();

// 绘制圆
ctx.beginPath();
ctx.arc(100, 100, 50, 0, Math.PI * 2);
ctx.fill();

// 绘制文字
ctx.font = '20px Arial';
ctx.fillText('Hello', 50, 50);

// 绘制图片
const img = new Image();
img.onload = () => ctx.drawImage(img, 0, 0);
img.src = 'image.png';
```

**SVG 基础：**
```html
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 矩形 -->
  <rect x="10" y="10" width="100" height="50" fill="red" />

  <!-- 圆 -->
  <circle cx="100" cy="100" r="50" fill="blue" />

  <!-- 椭圆 -->
  <ellipse cx="100" cy="100" rx="50" ry="30" fill="green" />

  <!-- 线 -->
  <line x1="0" y1="0" x2="100" y2="100" stroke="black" />

  <!-- 路径 -->
  <path d="M10 10 L100 100 L100 10 Z" fill="purple" />

  <!-- 文字 -->
  <text x="50" y="50" font-size="20">Hello</text>
</svg>
```

---

#### 8. Web Workers

```javascript
// main.js - 主线程
const worker = new Worker('worker.js');

// 发送消息给 Worker
worker.postMessage({ type: 'calculate', data: [1, 2, 3, 4, 5] });

// 接收 Worker 消息
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

// 错误处理
worker.onerror = (e) => {
  console.error('Worker error:', e.message);
};

// 终止 Worker
worker.terminate();

// worker.js - Worker 线程
self.onmessage = (e) => {
  const { type, data } = e.data;

  if (type === 'calculate') {
    // 耗时计算
    const result = data.reduce((a, b) => a + b, 0);

    // 返回结果
    self.postMessage(result);
  }
};
```

**Worker 限制：**
```
1. 无法访问 DOM
2. 无法访问 window 对象
3. 无法访问 document 对象
4. 同源限制
5. 不能使用 alert()、confirm()
```

**SharedWorker（多标签页共享）：**
```javascript
// 创建共享 Worker
const sharedWorker = new SharedWorker('shared-worker.js');

// 通过 port 通信
sharedWorker.port.start();
sharedWorker.port.postMessage('hello');
sharedWorker.port.onmessage = (e) => {
  console.log(e.data);
};
```

---

#### 9. History API

```javascript
// 添加历史记录（不刷新页面）
history.pushState({ page: 1 }, 'title', '/page1');

// 替换当前记录
history.replaceState({ page: 2 }, 'title', '/page2');

// 前进后退
history.back();
history.forward();
history.go(-1); // 后退一步
history.go(2);  // 前进两步

// 监听 popstate 事件（浏览器前进后退时触发）
window.addEventListener('popstate', (e) => {
  console.log('State:', e.state);
});

// 当前状态
console.log(history.state);
console.log(history.length);
```

**SPA 路由原理：**
```javascript
// Hash 模式
window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1);
  render(hash);
});

// History 模式
// 需要服务器配置支持
window.addEventListener('popstate', () => {
  const path = location.pathname;
  render(path);
});

// 导航
function navigate(path) {
  history.pushState(null, '', path);
  render(path);
}
```

---

#### 10. 拖放 API

```html
<div id="drag" draggable="true">拖动我</div>
<div id="drop">放置区域</div>
```

```javascript
const dragElement = document.getElementById('drag');
const dropZone = document.getElementById('drop');

// 拖动开始
dragElement.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', e.target.id);
  e.dataTransfer.effectAllowed = 'move';
});

// 拖动结束
dragElement.addEventListener('dragend', (e) => {
  console.log('Drag ended');
});

// 拖动进入目标区域
dropZone.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dropZone.classList.add('over');
});

// 拖动离开目标区域
dropZone.addEventListener('dragleave', (e) => {
  dropZone.classList.remove('over');
});

// 在目标区域上方（必须阻止默认行为）
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
});

// 放置
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const element = document.getElementById(id);
  dropZone.appendChild(element);
});
```

---

### 避坑指南

| 常见错误 | 正确做法 |
|----------|----------|
| 滥用 div | 优先使用语义化标签 |
| 忘记设置 viewport | 移动端必须设置 |
| img 没有 alt 属性 | 始终添加 alt 提升可访问性 |
| 表格用于布局 | 表格只用于展示数据 |
| 内联样式过多 | 使用外部样式表 |
| 不关闭标签 | 严格遵循 HTML 规范 |

---

## B. 实战文档

### 页面骨架模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="description" content="页面描述">
  <title>页面标题</title>
  <link rel="icon" href="/favicon.ico">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header>
    <nav>
      <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <header>
        <h1>文章标题</h1>
        <time datetime="2024-01-01">2024年1月1日</time>
      </header>
      <section>
        <h2>章节标题</h2>
        <p>内容...</p>
      </section>
      <footer>
        <p>作者：XXX</p>
      </footer>
    </article>

    <aside>
      <h3>侧边栏</h3>
    </aside>
  </main>

  <footer>
    <p>&copy; 2024 版权所有</p>
  </footer>

  <script src="/js/main.js"></script>
</body>
</html>
```

### 表单最佳实践

```html
<form action="/submit" method="POST" novalidate>
  <!-- 文本输入 -->
  <div class="form-group">
    <label for="username">用户名</label>
    <input
      type="text"
      id="username"
      name="username"
      required
      minlength="3"
      maxlength="20"
      pattern="[a-zA-Z0-9]+"
      placeholder="请输入用户名"
      autocomplete="username"
    >
    <span class="error"></span>
  </div>

  <!-- 邮箱 -->
  <div class="form-group">
    <label for="email">邮箱</label>
    <input
      type="email"
      id="email"
      name="email"
      required
      placeholder="请输入邮箱"
      autocomplete="email"
    >
  </div>

  <!-- 密码 -->
  <div class="form-group">
    <label for="password">密码</label>
    <input
      type="password"
      id="password"
      name="password"
      required
      minlength="8"
      autocomplete="new-password"
    >
  </div>

  <!-- 数字 -->
  <div class="form-group">
    <label for="age">年龄</label>
    <input
      type="number"
      id="age"
      name="age"
      min="1"
      max="120"
      step="1"
    >
  </div>

  <!-- 日期 -->
  <div class="form-group">
    <label for="birthday">生日</label>
    <input
      type="date"
      id="birthday"
      name="birthday"
      min="1900-01-01"
      max="2024-12-31"
    >
  </div>

  <!-- 下拉选择 -->
  <div class="form-group">
    <label for="city">城市</label>
    <select id="city" name="city" required>
      <option value="">请选择</option>
      <optgroup label="华东">
        <option value="shanghai">上海</option>
        <option value="hangzhou">杭州</option>
      </optgroup>
      <optgroup label="华北">
        <option value="beijing">北京</option>
      </optgroup>
    </select>
  </div>

  <!-- 单选 -->
  <fieldset>
    <legend>性别</legend>
    <label>
      <input type="radio" name="gender" value="male"> 男
    </label>
    <label>
      <input type="radio" name="gender" value="female"> 女
    </label>
  </fieldset>

  <!-- 多选 -->
  <fieldset>
    <legend>爱好</legend>
    <label>
      <input type="checkbox" name="hobby" value="reading"> 阅读
    </label>
    <label>
      <input type="checkbox" name="hobby" value="sports"> 运动
    </label>
  </fieldset>

  <!-- 文件上传 -->
  <div class="form-group">
    <label for="avatar">头像</label>
    <input
      type="file"
      id="avatar"
      name="avatar"
      accept="image/*"
    >
  </div>

  <!-- 文本域 -->
  <div class="form-group">
    <label for="bio">简介</label>
    <textarea
      id="bio"
      name="bio"
      rows="4"
      maxlength="500"
      placeholder="请介绍自己"
    ></textarea>
  </div>

  <!-- 提交 -->
  <button type="submit">提交</button>
  <button type="reset">重置</button>
</form>
```

### SEO 优化清单

```html
<!-- 1. 标题优化 -->
<title>主关键词 - 副关键词 | 品牌名</title>

<!-- 2. Meta 描述 -->
<meta name="description" content="页面描述，包含关键词，150字以内">

<!-- 3. 结构化数据 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "author": {
    "@type": "Person",
    "name": "作者名"
  },
  "datePublished": "2024-01-01"
}
</script>

<!-- 4. 规范链接 -->
<link rel="canonical" href="https://example.com/page">

<!-- 5. 多语言 -->
<link rel="alternate" hreflang="en" href="https://example.com/en/page">
<link rel="alternate" hreflang="zh" href="https://example.com/zh/page">

<!-- 6. 社交分享 -->
<meta property="og:title" content="标题">
<meta property="og:description" content="描述">
<meta property="og:image" content="https://example.com/image.jpg">
<meta name="twitter:card" content="summary_large_image">

<!-- 7. 图片优化 -->
<img src="image.jpg" alt="关键词描述" loading="lazy" width="800" height="600">

<!-- 8. 链接优化 -->
<a href="/page" title="页面描述">锚文本包含关键词</a>
<a href="https://external.com" rel="nofollow noopener">外部链接</a>
```

### 无障碍（a11y）指南

```html
<!-- 1. 跳过链接 -->
<a href="#main-content" class="skip-link">跳到主内容</a>

<!-- 2. 语言声明 -->
<html lang="zh-CN">

<!-- 3. 图片替代文本 -->
<img src="logo.png" alt="公司 Logo">
<img src="decorative.png" alt="" role="presentation"> <!-- 装饰性图片 -->

<!-- 4. 表单标签关联 -->
<label for="email">邮箱</label>
<input type="email" id="email" name="email" aria-required="true">

<!-- 5. ARIA 属性 -->
<button aria-label="关闭" aria-expanded="false">×</button>
<nav aria-label="主导航">...</nav>
<div role="alert" aria-live="polite">消息内容</div>

<!-- 6. 焦点管理 -->
<button tabindex="0">可聚焦</button>
<div tabindex="-1">程序可聚焦</div>

<!-- 7. 键盘导航 -->
<div role="menu" aria-label="选项菜单">
  <div role="menuitem" tabindex="0">选项1</div>
  <div role="menuitem" tabindex="-1">选项2</div>
</div>

<!-- 8. 进度指示 -->
<div role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
  50%
</div>
```

### 性能优化

```html
<!-- 1. 资源预加载 -->
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="hero.jpg" as="image">

<!-- 2. DNS 预解析 -->
<link rel="dns-prefetch" href="//api.example.com">
<link rel="preconnect" href="https://api.example.com">

<!-- 3. 资源预获取 -->
<link rel="prefetch" href="next-page.html">
<link rel="prerender" href="next-page.html">

<!-- 4. 图片懒加载 -->
<img src="placeholder.jpg" data-src="image.jpg" loading="lazy">

<!-- 5. 脚本优化 -->
<script src="app.js" defer></script>  <!-- 延迟执行 -->
<script src="analytics.js" async></script>  <!-- 异步加载 -->

<!-- 6. 内联关键 CSS -->
<style>
  /* 首屏关键样式 */
</style>
<link rel="preload" href="full.css" as="style" onload="this.rel='stylesheet'">

<!-- 7. 响应式图片 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.avif" type="image/avif">
  <img src="image.jpg" alt="描述">
</picture>

<img srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
     sizes="(max-width: 600px) 480px, 800px"
     src="medium.jpg" alt="描述">
```
