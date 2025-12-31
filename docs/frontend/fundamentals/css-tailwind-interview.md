# CSS/Tailwind 面试题集

> CSS3 与 Tailwind CSS 核心知识点与高频面试题

## A. 面试宝典

### CSS 基础

#### 1. 盒模型

```css
/* 标准盒模型（默认）*/
.standard-box {
  box-sizing: content-box;
  width: 100px;  /* 内容宽度 */
  padding: 10px;
  border: 5px solid #000;
  margin: 10px;
  /* 总宽度 = 100 + 10*2 + 5*2 = 130px */
}

/* IE 盒模型 / 怪异盒模型 */
.ie-box {
  box-sizing: border-box;
  width: 100px;  /* 总宽度（包含 padding 和 border）*/
  padding: 10px;
  border: 5px solid #000;
  margin: 10px;
  /* 总宽度 = 100px，内容宽度 = 100 - 10*2 - 5*2 = 70px */
}

/* 推荐全局设置 */
*, *::before, *::after {
  box-sizing: border-box;
}
```

---

#### 2. Flexbox 布局

```css
.container {
  display: flex;

  /* 主轴方向 */
  flex-direction: row | row-reverse | column | column-reverse;

  /* 换行 */
  flex-wrap: nowrap | wrap | wrap-reverse;

  /* 主轴对齐 */
  justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;

  /* 交叉轴对齐 */
  align-items: flex-start | flex-end | center | stretch | baseline;

  /* 多行对齐 */
  align-content: flex-start | flex-end | center | stretch | space-between | space-around;

  /* 间距 */
  gap: 10px;
  row-gap: 10px;
  column-gap: 20px;
}

.item {
  /* 放大比例 */
  flex-grow: 0;

  /* 缩小比例 */
  flex-shrink: 1;

  /* 基准大小 */
  flex-basis: auto;

  /* 简写 */
  flex: 0 1 auto; /* 默认 */
  flex: 1;        /* 等同于 flex: 1 1 0% */
  flex: auto;     /* 等同于 flex: 1 1 auto */
  flex: none;     /* 等同于 flex: 0 0 auto */

  /* 单独对齐 */
  align-self: auto | flex-start | flex-end | center | stretch | baseline;

  /* 排序 */
  order: 0;
}
```

---

#### 3. Grid 布局

```css
.container {
  display: grid;

  /* 定义列 */
  grid-template-columns: 100px 200px 100px;
  grid-template-columns: 1fr 2fr 1fr;           /* 比例 */
  grid-template-columns: repeat(3, 1fr);        /* 重复 */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* 响应式 */

  /* 定义行 */
  grid-template-rows: 100px auto 100px;

  /* 间距 */
  gap: 10px;
  row-gap: 10px;
  column-gap: 20px;

  /* 区域命名 */
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";

  /* 对齐 */
  justify-items: start | end | center | stretch;
  align-items: start | end | center | stretch;
  justify-content: start | end | center | stretch | space-around | space-between;
  align-content: start | end | center | stretch | space-around | space-between;
}

.item {
  /* 跨列 */
  grid-column: 1 / 3;
  grid-column: span 2;

  /* 跨行 */
  grid-row: 1 / 3;

  /* 区域 */
  grid-area: header;

  /* 单独对齐 */
  justify-self: start | end | center | stretch;
  align-self: start | end | center | stretch;
}
```

---

#### 4. 居中方案

```css
/* 1. Flexbox 居中 */
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 2. Grid 居中 */
.grid-center {
  display: grid;
  place-items: center;
}

/* 3. 绝对定位 + transform */
.absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 4. 绝对定位 + margin auto */
.absolute-margin {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 100px;
  height: 100px;
}

/* 5. 行内元素水平居中 */
.text-center {
  text-align: center;
}

/* 6. 块元素水平居中 */
.block-center {
  margin-left: auto;
  margin-right: auto;
}

/* 7. 单行文本垂直居中 */
.line-height-center {
  height: 50px;
  line-height: 50px;
}
```

---

#### 5. BFC (块级格式化上下文)

**触发条件：**
- `float` 不为 `none`
- `position` 为 `absolute` 或 `fixed`
- `display` 为 `inline-block`、`flex`、`grid`、`table-cell` 等
- `overflow` 不为 `visible`

**特性与应用：**
```css
/* 1. 清除浮动 */
.clearfix {
  overflow: hidden; /* 或 auto */
}

/* 2. 阻止外边距折叠 */
.prevent-margin-collapse {
  overflow: hidden;
}

/* 3. 阻止元素被浮动元素覆盖 */
.sidebar {
  float: left;
  width: 200px;
}
.main {
  overflow: hidden; /* 创建 BFC，不会环绕浮动元素 */
}
```

---

### CSS3 进阶

#### 6. 响应式设计

```css
/* 媒体查询 */
@media screen and (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}

@media screen and (min-width: 769px) and (max-width: 1024px) {
  .container {
    padding: 20px;
  }
}

/* 常用断点 */
/* 手机: max-width: 767px */
/* 平板: 768px - 1023px */
/* 桌面: 1024px+ */

/* 响应式单位 */
.responsive {
  font-size: 16px;           /* 固定 */
  font-size: 1rem;           /* 相对于根元素 */
  font-size: 1em;            /* 相对于父元素 */
  width: 50vw;               /* 视口宽度 */
  height: 50vh;              /* 视口高度 */
  font-size: clamp(14px, 2vw, 20px); /* 响应式范围 */
}

/* 响应式图片 */
img {
  max-width: 100%;
  height: auto;
}
```

---

#### 7. CSS 变量

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --spacing-unit: 8px;
  --font-size-base: 16px;
}

.button {
  background-color: var(--primary-color);
  padding: calc(var(--spacing-unit) * 2);
  font-size: var(--font-size-base);
}

/* 局部覆盖 */
.dark-theme {
  --primary-color: #0056b3;
}

/* JavaScript 操作 */
/* document.documentElement.style.setProperty('--primary-color', '#ff0000') */
```

---

### Tailwind CSS

#### 8. Tailwind 核心概念

```html
<!-- 基础用法 -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Button
</button>

<!-- 响应式 -->
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- 手机全宽，平板 1/2，桌面 1/3 -->
</div>

<!-- 状态变体 -->
<input class="border focus:border-blue-500 focus:ring-2" />
<button class="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50">
  Button
</button>

<!-- 暗色模式 -->
<div class="bg-white dark:bg-gray-800 text-black dark:text-white">
  Dark mode support
</div>

<!-- Flexbox -->
<div class="flex items-center justify-between gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

---

#### 9. Tailwind 配置

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,vue}',
    './public/index.html'
  ],
  darkMode: 'class', // 'media' | 'class'
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      },
      spacing: {
        '128': '32rem'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
}
```

---

## B. 实战文档

### CSS 常用代码片段

```css
/* 文本截断 */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 多行截断 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

/* 渐变背景 */
.gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 毛玻璃效果 */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 阴影 */
.shadow {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

### Tailwind 常用类名速查

| 类别 | 示例 |
|------|------|
| 宽度 | `w-full w-1/2 w-screen w-64` |
| 高度 | `h-full h-screen h-64 min-h-screen` |
| 内边距 | `p-4 px-4 py-2 pt-4 pr-4 pb-4 pl-4` |
| 外边距 | `m-4 mx-auto my-2 mt-4 -mt-4` |
| Flex | `flex flex-col items-center justify-between gap-4` |
| Grid | `grid grid-cols-3 gap-4` |
| 文字 | `text-lg text-center text-gray-500 font-bold` |
| 背景 | `bg-blue-500 bg-opacity-50 bg-gradient-to-r` |
| 边框 | `border border-2 border-gray-300 rounded-lg` |
| 阴影 | `shadow shadow-lg shadow-none` |
| 响应式 | `sm: md: lg: xl: 2xl:` |
| 状态 | `hover: focus: active: disabled: dark:` |
