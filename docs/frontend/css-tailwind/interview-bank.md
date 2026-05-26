# CSS & Tailwind 面试题库

> 精选 CSS 和 Tailwind 核心面试题

**更新时间**: 2026-05

## 🎯 CSS 核心

### 1. 盒模型和 box-sizing 的区别？

**核心答案**：

- **content-box**（标准盒模型）：width/height 只包含内容
- **border-box**（IE盒模型）：width/height 包含 padding 和 border

```css
/* 标准盒模型 */
.box1 {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  border: 10px solid;
  /* 实际宽度 = 260px */
}

/* IE 盒模型（推荐） */
.box2 {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 10px solid;
  /* 实际宽度 = 200px */
}
```

---

### 2. Flex 和 Grid 的区别？

**核心答案**：

- **Flex**：一维布局（行或列）
- **Grid**：二维布局（行和列）

```css
/* Flex - 一维 */
.flex {
  display: flex;
  justify-content: space-between;
}

/* Grid - 二维 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
}
```

---

## ⚡ Tailwind CSS

### 3. Tailwind 的核心理念？

**核心答案**：

Utility-First（原子化CSS），通过组合小的工具类快速构建界面。

```html
<!-- 传统 CSS -->
<style>
.button {
  padding: 0.5rem 1rem;
  background-color: blue;
  color: white;
  border-radius: 0.25rem;
}
</style>
<button class="button">按钮</button>

<!-- Tailwind -->
<button class="px-4 py-2 bg-blue-500 text-white rounded">
  按钮
</button>
```

---

### 4. 如何定制 Tailwind 主题？

**核心答案**：

- **v3**：在 `tailwind.config.js` 中使用 `theme.extend` 扩展
- **v4**：直接在 CSS 文件中用 `@theme` 块定义 CSS 变量（推荐）

```javascript
// v3：tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: { primary: '#3B82F6' },
      spacing: { '128': '32rem' }
    }
  }
}
```

```css
/* v4：CSS 优先配置 */
@import "tailwindcss";

@theme {
  --color-primary: #3B82F6;
  --spacing-128: 32rem;
}
```

---

### 5. Tailwind CSS v4 有哪些重大变化？

**核心答案**：

v4（2025 年 1 月）是架构级重写，核心变化：

| 变化 | v3 | v4 |
|------|----|----|
| 配置方式 | `tailwind.config.js` | CSS `@theme` 块 |
| 入口指令 | `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| 内容检测 | 需配置 `content` 数组 | 自动检测 |
| 构建引擎 | JS | Rust（快 5-10x） |
| 主题变量 | JS 对象 | CSS 变量（`--color-*`） |

**迁移**：

```bash
# 官方迁移工具
npx @tailwindcss/upgrade
```

**追问点**：
- v4 的 CSS 变量主题有什么好处？（可在运行时通过 JS 修改，无需重新构建）
- v4 如何在 Vite 项目中集成？（`@tailwindcss/vite` 插件，替代 PostCSS 方式）
- v4.3 新增了哪些实用工具类？（scrollbar、scrollbar-gutter、@container-size、zoom-*、tab-*）

### 6. Tailwind CSS v4.1-4.3 新特性有哪些？

**核心答案**：

v4 发布后持续迭代，三个小版本都带来了实用新特性：

| 版本 | 日期 | 核心新特性 |
|------|------|-----------|
| v4.1 | 2025.04 | text-shadow 工具类、彩色 drop-shadow、mask 扩展、pointer 变体、safe 对齐 |
| v4.2 | 2025.10 | webpack 插件、逻辑属性、font-features、新颜色调色板、@source not/inline |
| v4.3 | 2026.05 | scrollbar 工具类、scrollbar-gutter、@container-size、zoom-*、tab-* |

**面试追问点**：
- scrollbar 工具类解决了什么问题？（原生 CSS scrollbar API 支持，替代第三方 scrollbar 库）
- scrollbar-gutter-stable 有什么用？（防止滚动条出现/消失时的布局偏移）

---

## 📚 参考资源

- [MDN CSS](https://developer.mozilla.org/zh-CN/docs/Web/CSS)
- [Tailwind CSS](https://tailwindcss.com/)

---

**最后更新**: 2026-05

---

## 最新知识补充（2025-2026）

### CSS 原生特性进展

2025-2026 多项 CSS 原生特性获浏览器支持，逐步替代预处理器核心功能：

| 特性 | 状态 | 替代目标 |
|------|------|---------|
| CSS Nesting | 全平台支持 | Sass/Less 嵌套 |
| `@scope` | Chrome 118+ | BEM 命名约定 |
| `light-dark()` | Chrome 123+ | CSS 变量暗色切换 |
| `@starting-style` | Chrome 117+ | JS 进入动画 |
| Container Queries | 全平台支持 | 媒体查询组件级适配 |

### 面试新增考点

Q: **CSS 原生 Nesting 是否意味着可以不用 Sass/Less？**

A: 原生 Nesting 解决了嵌套语法需求，但 Sass 的 mixin、函数、变量系统、`@use` 模块化等高级功能 CSS 尚未完全替代。简单项目可不用预处理器，复杂项目仍需 Sass 提供的抽象能力。
