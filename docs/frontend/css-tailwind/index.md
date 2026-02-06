# CSS3 & Tailwind CSS

> 现代 CSS 与原子化工具类完全指南

**更新时间**: 2025-02

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

```bash
# 安装
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 配置 tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {}
  },
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

### 主题定制

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

## 📚 参考资源

- [MDN CSS 文档](https://developer.mozilla.org/zh-CN/docs/Web/CSS)
- [Tailwind CSS 官网](https://tailwindcss.com/)
- [CSS Tricks](https://css-tricks.com/)

---

**最后更新**: 2025-02
