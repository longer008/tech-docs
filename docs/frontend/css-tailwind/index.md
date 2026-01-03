# CSS3/Tailwind

## 元信息
- 定位与场景：CSS 负责样式与布局，Tailwind 提供原子化工具类。
- 版本范围：以官方稳定版本为准。
- 相关生态：PostCSS、Autoprefixer。

## 研究记录（Exa）
- 查询 1："CSS3 interview questions 2024 2025"
- 查询 2："Tailwind CSS best practices documentation"
- 查询 3："MDN CSS documentation"
- 来源摘要：以 MDN 与 Tailwind 官方文档为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：盒模型与 `box-sizing` 差异？
  - A：影响元素宽高计算方式。
- Q2：BFC 的概念与用途？
  - A：解决浮动塌陷与布局问题。
- Q3：Flex 与 Grid 的适用场景？
  - A：一维布局 vs 二维布局。
- Q4：Tailwind 的设计理念？
  - A：原子化类名提升效率。
- Q5：响应式断点如何配置？
  - A：通过 Tailwind 配置与工具类。

### 进阶/场景题
- Q1：如何控制 CSS 性能与可维护性？
  - A：模块化、减少层叠复杂度。
- Q2：如何统一样式体系？
  - A：设计 tokens + Tailwind 主题。

### 避坑指南
- 过度嵌套选择器导致维护困难。
- Tailwind 类名堆叠过多可考虑抽组件。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- MDN CSS 文档：https://developer.mozilla.org/zh-CN/docs/Web/CSS
- Tailwind 文档：https://tailwindcss.com/docs
- 响应式断点：https://tailwindcss.com/docs/responsive-design
```

### 常用代码片段
```html
<div class="flex flex-col md:flex-row gap-4">
  <div class="md:w-1/2">左侧</div>
  <div class="md:w-1/2">右侧</div>
</div>
```

### 版本差异
- CSS 特性与 Tailwind 版本随浏览器支持演进。
- 升级以官方文档为准。
