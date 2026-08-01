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

> 更多 CSS 基础（居中方案、BFC、响应式设计、CSS 变量、动画等）与 [CSS 核心面试题集](css-core-interview.md) 重复，已收敛至该文档。

---

### Tailwind CSS

#### 4. Tailwind 核心概念

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

#### 5. Tailwind 配置

> **版本说明**：Tailwind v4 改为 CSS-first 配置（`@import "tailwindcss"` + `@theme`），不再推荐 `tailwind.config.js`（v3 写法仍兼容但不升级）。以下两种都列出。

```css
/* Tailwind v4：CSS-first 配置（推荐） */
@import "tailwindcss";

/* 自定义主题变量（替代 v3 的 theme.extend） */
@theme {
  --color-primary-500: #3b82f6;
  --font-sans: "Inter", sans-serif;
  --spacing-128: 32rem;
}
```

```javascript
// Tailwind v3：tailwind.config.js（旧写法，v4 不再需要）
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

> v4 中部分 v3 类名已调整：`bg-opacity-50` 改为透明度语法 `bg-blue-500/50`、`shadow-sm` 改为 `shadow-xs`、`shadow` 改为 `shadow-sm` 等；若旧项目迁移，可在 CSS 中用 `@config "../tailwind.config.js"` 继续加载 v3 配置。

---

## B. 实战文档

> CSS 常用代码片段（截断、渐变、毛玻璃、动画等）与 [CSS 核心面试题集](css-core-interview.md) 的「常用样式片段」重复，已收敛至该文档。

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
| 背景 | `bg-blue-500 bg-blue-500/50 bg-gradient-to-r` |
| 边框 | `border border-2 border-gray-300 rounded-lg` |
| 阴影 | `shadow shadow-lg shadow-none` |
| 响应式 | `sm: md: lg: xl: 2xl:` |
| 状态 | `hover: focus: active: disabled: dark:` |

---

## 最新知识补充（2025-2026）

### Tailwind CSS 4.0 叇化

Tailwind CSS 4.0 主要变化：

- **基于 Rust 的 Oxide 引擎**：构建速度提升 10 倍以上
- **CSS-first 配置**：用 `@theme` 替代 `tailwind.config.js`
- **零配置自动检测**：扫描源码自动生成所需类名

```css
/* Tailwind 4.0 CSS-first 配置 */
@theme {
  --color-primary: #3b82f6;
  --font-family-display: "Inter", sans-serif;
}
```

### 面试新增考点

Q: **Tailwind CSS 和传统 CSS 方案怎么选？**

A: Tailwind 适合快速开发、设计约束明确的项目（后台管理、内部工具）；传统 CSS 方案适合设计高度定制、品牌感强的项目。核心争议是可维护性：Tailwind 类名集中易读但 HTML 臃肿，传统 CSS 结构清晰但样式分散。
