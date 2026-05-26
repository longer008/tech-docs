# CSS3 & Tailwind CSS

> 现代 CSS 与原子化工具类完全指南

**更新时间**: 2026-05

## 📋 目录

- [CSS3 核心](#css3-核心)
- [Tailwind CSS](#tailwind-css)
- [布局技术](#布局技术)
- [响应式设计](#响应式设计)
- [最佳实践](#最佳实践)

---

## 🎨 CSS3 核心

### 盒模型

```css
/* 标准盒模型 */
.box {
  box-sizing: content-box; /* 默认 */
  width: 200px;
  padding: 20px;
  border: 10px solid;
  /* 实际宽度 = 200 + 20*2 + 10*2 = 260px */
}

/* IE 盒模型（推荐） */
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 10px solid;
  /* 实际宽度 = 200px */
}
```

### Flexbox 布局

```css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.item {
  flex: 1; /* flex-grow: 1; flex-shrink: 1; flex-basis: 0%; */
}
```

### Grid 布局

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* 响应式 Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

---

## ⚡ Tailwind CSS

### 快速开始

**v4（推荐，当前版本）**：

```bash
# Vite 项目
npm install -D tailwindcss @tailwindcss/vite
```

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default { plugins: [tailwindcss()] }
```

```css
/* CSS 入口文件 */
@import "tailwindcss";
```

**v3（旧版，仍在维护）**：

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: { extend: {} },
  plugins: []
}
```

### 基础用法

```html
<!-- 布局 -->
<div class="flex items-center justify-between p-4">
  <h1 class="text-2xl font-bold">标题</h1>
  <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    按钮
  </button>
</div>

<!-- 响应式 -->
<div class="w-full md:w-1/2 lg:w-1/3">
  响应式宽度
</div>

<!-- 状态变体 -->
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2 disabled:opacity-50">
  按钮
</button>
```

### 主题定制（v3）

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981'
      },
      spacing: {
        '128': '32rem'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  }
}
```

---

### Tailwind CSS v4（2025 年 1 月发布）

v4 是架构级重写，核心变化：**CSS 优先配置**，不再需要 `tailwind.config.js`。

**安装（Vite 项目）**：

```bash
npm install tailwindcss @tailwindcss/vite
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()]
})
```

**CSS 入口文件**：

```css
/* 替代 v3 的三行 @tailwind 指令 */
@import "tailwindcss";

/* CSS 优先主题配置（替代 tailwind.config.js） */
@theme {
  --color-primary: #3B82F6;
  --color-secondary: #10B981;
  --font-sans: 'Inter', sans-serif;
  --spacing-128: 32rem;
}
```

**v3 vs v4 对比**：

| 特性 | v3 | v4 |
|------|----|----|
| 配置文件 | `tailwind.config.js` | 可选，CSS `@theme` 优先 |
| 入口指令 | `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| 主题变量 | JS 对象 | CSS 变量（`--color-*`） |
| 内容检测 | 需配置 `content` 数组 | 自动检测 |
| 构建工具 | PostCSS 插件 | 原生 Vite/PostCSS 插件 |
| 构建速度 | 基准 | 快 5-10x（Rust 引擎） |

**v4 新增工具类**：

```html
<!-- 文字阴影 -->
<p class="text-shadow-sm text-shadow-blue-500/50">阴影文字</p>

<!-- 3D 变换 -->
<div class="rotate-x-45 perspective-500">3D 旋转</div>

<!-- 遮罩 -->
<div class="mask-radial-from-black">渐变遮罩</div>

<!-- 输入框自适应高度 -->
<textarea class="field-sizing-content">自动高度</textarea>
```

### Tailwind CSS v4.1-4.3 新特性

**v4.1**（2025 年 4 月）新增：

- **text-shadow 工具类**：`text-shadow-sm`、`text-shadow-lg`、`text-shadow-2xs` 等，支持颜色修饰符
- **mask 工具类扩展**：更多遮罩选项
- **彩色 drop-shadow**：支持带颜色的 `drop-shadow`
- **`pointer-*`/`any-pointer-*` 变体**：设备指针类型响应式变体
- **`safe` 对齐修饰符**：`safe-center`、`safe-start` 等安全对齐

```html
<!-- text-shadow（v4.1） -->
<button class="text-sky-950 text-shadow-2xs text-shadow-sky-300">Book a demo</button>

<!-- 响应式 text-shadow -->
<p class="text-shadow-none md:text-shadow-lg lg:text-shadow-xl">响应式阴影</p>
```

**v4.2**（2025 年 10 月）新增：

- **一流的 webpack 插件**：`tailwindcss-webpack-plugin`，不再依赖 PostCSS
- 更多逻辑属性工具类
- `font-features-*` 工具类
- 新颜色调色板：mauve / olive / mist / taupe
- `@source not` 和 `@source inline(…)` 指令

**v4.3**（2026 年 5 月）新增：

- **scrollbar 工具类**：原生 CSS scrollbar API 支持
- **`scrollbar-gutter-*`**：防止滚动条出现时布局偏移
- **`@container-size`**：容器尺寸查询
- **`zoom-*`** 工具类
- **`tab-*`** 工具类
- 堆叠+复合 `@variant` 语法

```html
<!-- scrollbar（v4.3） -->
<div class="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
  滚动内容
</div>

<!-- 防止布局偏移 -->
<div class="scrollbar-gutter-stable">稳定布局</div>
```

**从 v3 迁移**：

```bash
# 官方迁移工具（自动处理大部分变更）
npx @tailwindcss/upgrade
```

---

## 📚 参考资源

- [MDN CSS 文档](https://developer.mozilla.org/zh-CN/docs/Web/CSS)
- [Tailwind CSS 官网](https://tailwindcss.com/)
- [CSS Tricks](https://css-tricks.com/)

---

**最后更新**: 2026-05

---

## 最新知识补充（2025-2026）

### CSS 原生增强

CSS 原生特性正在替代预处理器核心功能：

- **CSS Nesting**：原生嵌套规则，与 Sass 嵌套语法一致，无需编译
- **`@scope`**：限定样式作用范围，替代 BEM 命名约定
- **`light-dark()`**：自动切换亮暗色值
- **CSS Anchor Positioning**：元素相对于锚点定位，替代 JS 弹窗定位计算

### Tailwind CSS v4 系列进展

v4.1-4.3 的新特性已在正文中详细说明。面试高频追问：

- **v4 安装方式变了吗？** 是的，推荐用 `@tailwindcss/vite` 插件，不再依赖 PostCSS（v4.2 起也有 webpack 插件）
- **v4 还需要 `tailwind.config.js` 吗？** 不需要，用 CSS `@theme` 块替代，但 v4 仍支持 JS 配置文件作为补充
- **v4 的 CSS 变量主题有什么好处？** 可在运行时通过 JS 修改 CSS 变量实现动态主题，无需重新构建
