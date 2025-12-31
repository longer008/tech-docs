# CSS 核心概念面试题集

> CSS 核心概念、选择器、定位、BFC 等高频面试题

## A. 面试宝典

### 基础题

#### 1. CSS 选择器

```
┌─────────────────────────────────────────────────────────────┐
│                    CSS 选择器类型                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  基础选择器：                                                │
│  ──────────────────────────────────────────────────────────│
│  *              全部元素                                    │
│  div            元素选择器                                  │
│  .class         类选择器                                    │
│  #id            ID 选择器                                   │
│  [attr]         属性选择器                                  │
│                                                              │
│  组合选择器：                                                │
│  ──────────────────────────────────────────────────────────│
│  div, p         并集（div 和 p）                            │
│  div p          后代（div 里所有 p）                         │
│  div > p        子代（div 的直接子 p）                       │
│  div + p        相邻兄弟（div 后紧邻的 p）                   │
│  div ~ p        通用兄弟（div 后所有兄弟 p）                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**属性选择器：**
```css
/* 存在属性 */
[title] { }

/* 属性等于值 */
[type="text"] { }

/* 属性包含值（空格分隔） */
[class~="box"] { }

/* 属性以值开头 */
[href^="https"] { }

/* 属性以值结尾 */
[src$=".png"] { }

/* 属性包含子串 */
[href*="example"] { }

/* 属性以值开头或以值-开头 */
[lang|="en"] { }
```

**伪类选择器：**
```css
/* 动态伪类 */
a:link     { }  /* 未访问 */
a:visited  { }  /* 已访问 */
a:hover    { }  /* 悬停 */
a:active   { }  /* 激活 */
a:focus    { }  /* 聚焦 */

/* 结构伪类 */
:first-child    { }  /* 第一个子元素 */
:last-child     { }  /* 最后一个子元素 */
:nth-child(n)   { }  /* 第 n 个子元素 */
:nth-child(2n)  { }  /* 偶数子元素 */
:nth-child(odd) { }  /* 奇数子元素 */
:only-child     { }  /* 唯一子元素 */

:first-of-type  { }  /* 同类型第一个 */
:last-of-type   { }  /* 同类型最后一个 */
:nth-of-type(n) { }  /* 同类型第 n 个 */

/* 状态伪类 */
:checked    { }  /* 选中 */
:disabled   { }  /* 禁用 */
:enabled    { }  /* 启用 */
:empty      { }  /* 空元素 */
:not(sel)   { }  /* 否定 */
:is(sel)    { }  /* 匹配任一 */
:where(sel) { }  /* 同 :is，但优先级为 0 */
:has(sel)   { }  /* 包含（父选择器） */
```

**伪元素选择器：**
```css
::before      { }  /* 前置内容 */
::after       { }  /* 后置内容 */
::first-line  { }  /* 首行 */
::first-letter{ }  /* 首字母 */
::selection   { }  /* 选中文本 */
::placeholder { }  /* 占位符 */
```

---

#### 2. 选择器优先级

```
┌─────────────────────────────────────────────────────────────┐
│                    选择器优先级计算                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  优先级权重（从高到低）：                                    │
│  ──────────────────────────────────────────────────────────│
│  !important              无穷大（慎用）                     │
│  内联样式 (style="")     1000                              │
│  ID 选择器               100                               │
│  类/伪类/属性选择器      10                                │
│  元素/伪元素选择器       1                                 │
│  通配符 *                0                                 │
│                                                              │
│  计算示例：                                                 │
│  ──────────────────────────────────────────────────────────│
│  #nav .item a:hover     = 100 + 10 + 1 + 10 = 121         │
│  div.container p        = 1 + 10 + 1 = 12                  │
│  [type="text"]          = 10                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**优先级规则：**
```css
/* 1. !important 最高 */
.box { color: red !important; }

/* 2. 相同优先级，后者覆盖前者 */
.box { color: red; }
.box { color: blue; }  /* 生效 */

/* 3. 更具体的选择器胜出 */
.container .box { color: red; }   /* 0,0,2,0 - 生效 */
.box { color: blue; }              /* 0,0,1,0 */

/* 4. 继承样式优先级最低 */
body { color: red; }
p { color: blue; }  /* p 元素使用 blue */
```

---

#### 3. 定位（Position）

```
┌─────────────────────────────────────────────────────────────┐
│                    Position 定位类型                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  static（默认）：                                           │
│  - 正常文档流                                               │
│  - top/right/bottom/left 无效                              │
│                                                              │
│  relative（相对定位）：                                      │
│  - 相对于自身原始位置偏移                                    │
│  - 保留原始空间                                             │
│  - 创建定位上下文                                           │
│                                                              │
│  absolute（绝对定位）：                                      │
│  - 脱离文档流                                               │
│  - 相对于最近的定位祖先                                      │
│  - 没有定位祖先则相对于 ICB（初始包含块）                    │
│                                                              │
│  fixed（固定定位）：                                        │
│  - 脱离文档流                                               │
│  - 相对于视口                                               │
│  - 滚动时位置不变                                           │
│                                                              │
│  sticky（粘性定位）：                                       │
│  - 相对定位和固定定位的混合                                  │
│  - 滚动到阈值前是 relative                                  │
│  - 滚动到阈值后是 fixed                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**定位示例：**
```css
/* 相对定位 */
.relative {
  position: relative;
  top: 10px;
  left: 20px;
}

/* 绝对定位 */
.parent {
  position: relative;  /* 创建定位上下文 */
}
.absolute {
  position: absolute;
  top: 0;
  right: 0;
}

/* 固定定位 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
}

/* 粘性定位 */
.sticky-nav {
  position: sticky;
  top: 0;
  /* 滚动到顶部时固定 */
}

/* 居中技巧 */
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

---

#### 4. BFC（块级格式化上下文）

```
┌─────────────────────────────────────────────────────────────┐
│                    BFC 块级格式化上下文                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  触发 BFC 的条件：                                          │
│  ──────────────────────────────────────────────────────────│
│  1. 根元素（html）                                          │
│  2. float 不为 none                                         │
│  3. position 为 absolute 或 fixed                          │
│  4. overflow 不为 visible                                   │
│  5. display 为 inline-block, table-cell, table-caption     │
│  6. display 为 flex, grid                                  │
│  7. display: flow-root（推荐）                             │
│                                                              │
│  BFC 的特性：                                               │
│  ──────────────────────────────────────────────────────────│
│  1. 内部盒子垂直排列                                        │
│  2. 同一 BFC 内相邻 margin 会合并                           │
│  3. BFC 区域不与 float 元素重叠                             │
│  4. BFC 是独立容器，内外不互相影响                          │
│  5. BFC 可以包含浮动元素（清除浮动）                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**BFC 应用：**
```css
/* 1. 清除浮动（父元素塌陷） */
.clearfix {
  display: flow-root;  /* 推荐 */
  /* 或 overflow: hidden; */
}

/* 2. 阻止 margin 合并 */
.wrapper {
  overflow: hidden;  /* 创建 BFC */
}
.wrapper .child {
  margin: 20px;  /* 不会与外部 margin 合并 */
}

/* 3. 自适应两栏布局 */
.sidebar {
  float: left;
  width: 200px;
}
.main {
  overflow: hidden;  /* 创建 BFC，不与浮动重叠 */
}
```

---

#### 5. 层叠上下文（Stacking Context）

```
┌─────────────────────────────────────────────────────────────┐
│                    层叠上下文                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  创建层叠上下文的条件：                                      │
│  ──────────────────────────────────────────────────────────│
│  1. 根元素（html）                                          │
│  2. position: relative/absolute + z-index 非 auto          │
│  3. position: fixed/sticky                                  │
│  4. flex/grid 子项 + z-index 非 auto                        │
│  5. opacity < 1                                             │
│  6. transform 非 none                                       │
│  7. filter 非 none                                          │
│  8. isolation: isolate                                      │
│                                                              │
│  层叠顺序（从下到上）：                                      │
│  ──────────────────────────────────────────────────────────│
│  1. 层叠上下文的背景和边框                                  │
│  2. z-index 为负值                                          │
│  3. 块级盒子                                                │
│  4. 浮动盒子                                                │
│  5. 行内盒子                                                │
│  6. z-index: 0 / auto                                       │
│  7. z-index 为正值                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```css
/* 层叠上下文示例 */
.parent {
  position: relative;
  z-index: 1;  /* 创建层叠上下文 */
}

.child {
  position: absolute;
  z-index: 999;  /* 不会超出父元素的层叠上下文 */
}

/* 隔离层叠上下文 */
.isolated {
  isolation: isolate;  /* 创建新的层叠上下文 */
}
```

---

### 进阶题

#### 6. Margin 塌陷与合并

```
┌─────────────────────────────────────────────────────────────┐
│                    Margin 问题                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Margin 合并（相邻元素）：                               │
│  ┌─────────────────┐                                        │
│  │ margin-bottom:20│                                        │
│  └─────────────────┘                                        │
│          ↓ 合并后取较大值 20px                              │
│  ┌─────────────────┐                                        │
│  │ margin-top: 10  │                                        │
│  └─────────────────┘                                        │
│                                                              │
│  2. Margin 塌陷（父子元素）：                               │
│  父元素没有 border/padding/BFC                              │
│  子元素的 margin-top 会"穿透"到父元素外                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**解决方案：**
```css
/* 解决 margin 合并 */
/* 方案1：只设置一边的 margin */
.box { margin-bottom: 20px; }
.box + .box { margin-top: 0; }

/* 解决 margin 塌陷 */
/* 方案1：父元素加边框 */
.parent { border-top: 1px solid transparent; }

/* 方案2：父元素加 padding */
.parent { padding-top: 1px; }

/* 方案3：父元素创建 BFC */
.parent { overflow: hidden; }
.parent { display: flow-root; }  /* 推荐 */
```

---

#### 7. 居中方案

```css
/* ============= 水平居中 ============= */

/* 1. 行内元素 */
.parent {
  text-align: center;
}

/* 2. 块级元素（定宽） */
.block {
  width: 200px;
  margin: 0 auto;
}

/* 3. Flex */
.parent {
  display: flex;
  justify-content: center;
}

/* ============= 垂直居中 ============= */

/* 1. 单行文本 */
.text {
  height: 50px;
  line-height: 50px;
}

/* 2. Flex */
.parent {
  display: flex;
  align-items: center;
}

/* 3. 绝对定位 + transform */
.child {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

/* ============= 水平垂直居中 ============= */

/* 1. Flex（推荐） */
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 2. Grid */
.parent {
  display: grid;
  place-items: center;
}

/* 3. 绝对定位 + transform */
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 4. 绝对定位 + margin auto（定宽高） */
.child {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 200px;
  height: 100px;
}

/* 5. 表格布局 */
.parent {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}
```

---

#### 8. 响应式设计

```css
/* 媒体查询 */
/* 移动优先 */
.box {
  width: 100%;
}

@media (min-width: 576px) {
  .box { width: 50%; }
}

@media (min-width: 768px) {
  .box { width: 33.33%; }
}

@media (min-width: 992px) {
  .box { width: 25%; }
}

@media (min-width: 1200px) {
  .box { width: 20%; }
}

/* 桌面优先 */
.box {
  width: 20%;
}

@media (max-width: 1199px) {
  .box { width: 25%; }
}

/* 响应式断点 */
/*
  xs: < 576px   手机竖屏
  sm: 576px+    手机横屏
  md: 768px+    平板
  lg: 992px+    笔记本
  xl: 1200px+   桌面
  xxl: 1400px+  大屏
*/

/* 容器查询（CSS Container Queries） */
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: flex;
  }
}

/* 响应式单位 */
.responsive {
  /* 视口单位 */
  width: 50vw;   /* 视口宽度的 50% */
  height: 100vh; /* 视口高度的 100% */
  font-size: 2vmin; /* vw 和 vh 的较小值 */

  /* 相对单位 */
  font-size: 1rem;  /* 根元素字体大小 */
  padding: 1em;     /* 当前元素字体大小 */

  /* clamp 函数 */
  font-size: clamp(16px, 4vw, 24px);
  width: clamp(200px, 50%, 600px);
}
```

---

#### 9. CSS 变量（自定义属性）

```css
/* 定义变量 */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-size-base: 16px;
  --spacing: 8px;
  --border-radius: 4px;
}

/* 使用变量 */
.button {
  background-color: var(--primary-color);
  padding: calc(var(--spacing) * 2);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
}

/* 带默认值 */
.box {
  color: var(--text-color, #333);
}

/* 局部覆盖 */
.dark-theme {
  --primary-color: #0d6efd;
  --text-color: #fff;
  --bg-color: #212529;
}

/* JavaScript 操作 */
// 获取变量
getComputedStyle(document.documentElement)
  .getPropertyValue('--primary-color');

// 设置变量
document.documentElement.style
  .setProperty('--primary-color', '#ff0000');
```

---

#### 10. CSS 动画

```css
/* Transition 过渡 */
.box {
  transition: all 0.3s ease;
  /* transition: property duration timing-function delay; */

  transition-property: transform, opacity;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  transition-delay: 0s;
}

.box:hover {
  transform: scale(1.1);
  opacity: 0.8;
}

/* Animation 动画 */
@keyframes slideIn {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 或使用 from/to */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animated {
  animation: slideIn 0.5s ease-out forwards;
  /* animation: name duration timing-function delay iteration-count direction fill-mode; */

  animation-name: slideIn;
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-delay: 0s;
  animation-iteration-count: 1;  /* infinite */
  animation-direction: normal;   /* reverse, alternate */
  animation-fill-mode: forwards; /* backwards, both */
  animation-play-state: running; /* paused */
}

/* 性能优化：使用 transform 和 opacity */
/* 这两个属性不触发重排重绘，由 GPU 加速 */
.performant {
  transform: translateX(100px);
  opacity: 0.5;
}

/* will-change 提示浏览器优化 */
.will-animate {
  will-change: transform, opacity;
}
```

---

### 避坑指南

| 常见错误 | 正确做法 |
|----------|----------|
| 使用 px 固定尺寸 | 使用 rem/em/% 响应式单位 |
| !important 滥用 | 提高选择器优先级 |
| 浮动未清除 | 使用 BFC 或 clearfix |
| z-index 层级混乱 | 建立 z-index 管理规范 |
| 动画性能差 | 只用 transform/opacity |
| 选择器嵌套过深 | 控制在 3 层以内 |

---

## B. 实战文档

### 常用布局模式

```css
/* 1. 两栏布局（左固定右自适应） */
.layout-two-column {
  display: flex;
}
.sidebar {
  width: 200px;
  flex-shrink: 0;
}
.main {
  flex: 1;
}

/* 2. 三栏布局（圣杯/双飞翼） */
.layout-three-column {
  display: flex;
}
.left, .right {
  width: 200px;
  flex-shrink: 0;
}
.center {
  flex: 1;
}

/* 3. 等高布局 */
.equal-height {
  display: flex;
}
.equal-height > * {
  flex: 1;
}

/* 4. 粘性页脚 */
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
main {
  flex: 1;
}
footer {
  flex-shrink: 0;
}

/* 5. 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

/* 6. 瀑布流（Masonry） */
.masonry {
  columns: 3;
  column-gap: 20px;
}
.masonry-item {
  break-inside: avoid;
  margin-bottom: 20px;
}
```

### 常用样式片段

```css
/* 文本截断 */
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 多行截断 */
.text-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 清除浮动 */
.clearfix::after {
  content: '';
  display: table;
  clear: both;
}

/* 隐藏滚动条 */
.hide-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}

/* 禁止选中 */
.no-select {
  user-select: none;
}

/* 图片自适应 */
.img-responsive {
  max-width: 100%;
  height: auto;
}

/* 图片覆盖 */
.img-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 毛玻璃效果 */
.glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

/* 阴影 */
.shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
.shadow-md { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.shadow-lg { box-shadow: 0 10px 15px rgba(0,0,0,0.1); }

/* 渐变 */
.gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 三角形 */
.triangle {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 15px solid #333;
}

/* 圆形 */
.circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
```

### CSS Reset

```css
/* Modern CSS Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  min-height: 100vh;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

a {
  color: inherit;
  text-decoration: none;
}

ul, ol {
  list-style: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}
```
