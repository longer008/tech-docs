# CSS & Tailwind 面试题库

> 精选 CSS 和 Tailwind 核心面试题

**更新时间**: 2025-02

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

在 `tailwind.config.js` 中使用 `theme.extend` 扩展默认主题。

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6'
      },
      spacing: {
        '128': '32rem'
      }
    }
  }
}
```

---

## 📚 参考资源

- [MDN CSS](https://developer.mozilla.org/zh-CN/docs/Web/CSS)
- [Tailwind CSS](https://tailwindcss.com/)

---

**最后更新**: 2025-02
