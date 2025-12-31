# SCSS/Less 预处理器面试题集

> CSS 预处理器核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. 预处理器概述

```
┌─────────────────────────────────────────────────────────────┐
│                    CSS 预处理器对比                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性           SCSS/Sass       Less          Stylus        │
│  ──────────────────────────────────────────────────────────│
│  语法           CSS 超集        CSS 超集      灵活语法       │
│  变量           $variable       @variable     variable      │
│  编译           Ruby/Dart       JavaScript    JavaScript    │
│  嵌套           ✓               ✓             ✓             │
│  Mixin          ✓               ✓             ✓             │
│  函数           丰富            较少          丰富          │
│  模块化         @use/@forward   @import       @import       │
│  流行度         最高            较高          一般          │
│                                                              │
│  SCSS vs Sass：                                             │
│  - SCSS: 使用大括号和分号，兼容 CSS 语法                   │
│  - Sass: 缩进语法，无大括号和分号                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### 2. 变量

**SCSS 变量：**
```scss
// 定义变量
$primary-color: #007bff;
$font-size-base: 16px;
$font-stack: 'Helvetica', Arial, sans-serif;
$border-radius: 4px;

// 使用变量
.button {
  background-color: $primary-color;
  font-size: $font-size-base;
  font-family: $font-stack;
  border-radius: $border-radius;
}

// 变量默认值（!default）
$primary-color: #ff0000 !default;  // 如果已定义则不覆盖

// 变量作用域
$global: 'global';

.container {
  $local: 'local';  // 局部变量

  // 提升为全局变量
  $new-global: 'new' !global;
}

// 插值语法 #{}
$property: margin;
$direction: top;
$selector: '.box';

#{$selector} {
  #{$property}-#{$direction}: 10px;
}
// 编译为：.box { margin-top: 10px; }
```

**Less 变量：**
```less
// 定义变量
@primary-color: #007bff;
@font-size-base: 16px;
@font-stack: 'Helvetica', Arial, sans-serif;

// 使用变量
.button {
  background-color: @primary-color;
  font-size: @font-size-base;
  font-family: @font-stack;
}

// 变量延迟加载（后定义可用）
.container {
  color: @color;  // 使用后面定义的变量
}
@color: red;

// 变量插值
@property: margin;
@selector: box;

.@{selector} {
  @{property}: 10px;
}

// 属性作为变量
.container {
  color: red;
  background-color: $color;  // 引用自身 color 属性
}
```

---

#### 3. 嵌套规则

**SCSS 嵌套：**
```scss
// 选择器嵌套
.nav {
  background: #fff;

  ul {
    list-style: none;

    li {
      display: inline-block;

      a {
        color: #333;
        text-decoration: none;
      }
    }
  }
}

// 父选择器 &
.button {
  color: blue;

  &:hover {
    color: red;
  }

  &:active {
    color: green;
  }

  &::before {
    content: '>';
  }

  // BEM 命名
  &__icon {
    margin-right: 5px;
  }

  &--primary {
    background: blue;
  }

  // & 在后面
  .container & {
    color: purple;
  }
}

// 编译结果：
// .button { color: blue; }
// .button:hover { color: red; }
// .button__icon { margin-right: 5px; }
// .button--primary { background: blue; }
// .container .button { color: purple; }

// 属性嵌套
.container {
  font: {
    family: Arial;
    size: 14px;
    weight: bold;
  }
  margin: {
    top: 10px;
    bottom: 10px;
  }
}
```

**Less 嵌套：**
```less
.nav {
  background: #fff;

  ul {
    list-style: none;

    li {
      display: inline-block;

      a {
        color: #333;

        &:hover {
          color: red;
        }
      }
    }
  }
}
```

---

#### 4. Mixin（混入）

**SCSS Mixin：**
```scss
// 基础 mixin
@mixin center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  @include center;
  height: 100vh;
}

// 带参数
@mixin button($bg-color, $text-color: #fff) {
  background-color: $bg-color;
  color: $text-color;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary-btn {
  @include button(#007bff);
}

.secondary-btn {
  @include button(#6c757d, #000);
}

// 可变参数
@mixin box-shadow($shadows...) {
  box-shadow: $shadows;
}

.card {
  @include box-shadow(
    0 2px 4px rgba(0,0,0,0.1),
    0 4px 8px rgba(0,0,0,0.1)
  );
}

// @content 内容块
@mixin media($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (min-width: 576px) { @content; }
  } @else if $breakpoint == 'md' {
    @media (min-width: 768px) { @content; }
  } @else if $breakpoint == 'lg' {
    @media (min-width: 992px) { @content; }
  }
}

.container {
  width: 100%;

  @include media('md') {
    width: 750px;
  }

  @include media('lg') {
    width: 970px;
  }
}
```

**Less Mixin：**
```less
// 基础 mixin（类选择器即可）
.center() {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  .center();
  height: 100vh;
}

// 带参数
.button(@bg-color; @text-color: #fff) {
  background-color: @bg-color;
  color: @text-color;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
}

.primary-btn {
  .button(#007bff);
}

// 可变参数
.box-shadow(@shadows...) {
  box-shadow: @shadows;
}

// 模式匹配
.mixin(dark; @color) {
  color: darken(@color, 10%);
}
.mixin(light; @color) {
  color: lighten(@color, 10%);
}

.dark-theme {
  .mixin(dark; #333);
}
```

---

#### 5. 继承

**SCSS 继承：**
```scss
// 使用 @extend
.message {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.success {
  @extend .message;
  border-color: green;
  color: green;
}

.error {
  @extend .message;
  border-color: red;
  color: red;
}

// 编译结果（合并选择器）：
// .message, .success, .error { padding: 10px; ... }
// .success { border-color: green; ... }
// .error { border-color: red; ... }

// 占位符选择器 %（不会编译输出）
%button-base {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary-btn {
  @extend %button-base;
  background: blue;
}

.secondary-btn {
  @extend %button-base;
  background: gray;
}

// 编译结果：
// .primary-btn, .secondary-btn { padding: 10px 20px; ... }
// .primary-btn { background: blue; }
// .secondary-btn { background: gray; }
```

**Less 继承：**
```less
// Less 没有真正的继承，使用 mixin 模拟
.message {
  padding: 10px;
  border: 1px solid #ccc;
}

.success {
  .message();  // 复制样式
  border-color: green;
}

// 或使用 :extend
.success {
  &:extend(.message);
  border-color: green;
}
```

---

### 进阶题

#### 6. 函数

**SCSS 内置函数：**
```scss
// 颜色函数
$color: #007bff;

.box {
  // 变亮/变暗
  background: lighten($color, 10%);
  border-color: darken($color, 10%);

  // 饱和度
  color: saturate($color, 20%);
  color: desaturate($color, 20%);

  // 透明度
  background: rgba($color, 0.5);
  background: transparentize($color, 0.5);
  background: opacify(rgba(0,0,0,0.5), 0.2);

  // 混合颜色
  background: mix($color, #fff, 50%);

  // 反转颜色
  color: invert($color);

  // 补色
  color: complement($color);
}

// 数学函数
.box {
  width: percentage(0.5);  // 50%
  width: round(4.6px);     // 5px
  width: ceil(4.2px);      // 5px
  width: floor(4.8px);     // 4px
  width: abs(-10px);       // 10px
  width: min(10px, 20px);  // 10px
  width: max(10px, 20px);  // 20px
}

// 字符串函数
$str: "hello world";
.box {
  content: quote(hello);           // "hello"
  content: unquote("hello");       // hello
  content: str-length($str);       // 11
  content: str-index($str, "world"); // 7
  content: to-upper-case($str);    // "HELLO WORLD"
}

// 列表函数
$list: 10px 20px 30px;
.box {
  margin: nth($list, 1);      // 10px
  margin: length($list);      // 3
  margin: append($list, 40px); // 10px 20px 30px 40px
  margin: join($list, 40px 50px); // 10px 20px 30px 40px 50px
}

// Map 函数
$colors: (
  'primary': #007bff,
  'success': #28a745,
  'danger': #dc3545
);

.box {
  color: map-get($colors, 'primary');  // #007bff
  // map-keys, map-values, map-has-key, map-merge
}
```

**自定义函数：**
```scss
@function px-to-rem($px, $base: 16) {
  @return ($px / $base) * 1rem;
}

.container {
  font-size: px-to-rem(14);  // 0.875rem
  padding: px-to-rem(20);    // 1.25rem
}

@function strip-unit($value) {
  @return $value / ($value * 0 + 1);
}

@function fluid-size($min, $max, $min-vw: 320, $max-vw: 1200) {
  $min: strip-unit($min);
  $max: strip-unit($max);
  @return calc(#{$min}px + #{$max - $min} * (100vw - #{$min-vw}px) / #{$max-vw - $min-vw});
}

h1 {
  font-size: fluid-size(24px, 48px);
}
```

**Less 函数：**
```less
// 颜色函数
@color: #007bff;

.box {
  background: lighten(@color, 10%);
  border-color: darken(@color, 10%);
  color: fade(@color, 50%);  // 透明度
  background: mix(@color, #fff, 50%);
}

// 数学函数
.box {
  width: percentage(0.5);
  width: round(4.6px);
  width: ceil(4.2px);
  width: floor(4.8px);
}
```

---

#### 7. 控制指令

**SCSS 控制指令：**
```scss
// @if / @else if / @else
@mixin theme($theme) {
  @if $theme == 'dark' {
    background: #333;
    color: #fff;
  } @else if $theme == 'light' {
    background: #fff;
    color: #333;
  } @else {
    background: #f5f5f5;
    color: #666;
  }
}

.container {
  @include theme('dark');
}

// @for 循环
@for $i from 1 through 5 {
  .col-#{$i} {
    width: 20% * $i;
  }
}
// 编译为：.col-1 { width: 20%; } ... .col-5 { width: 100%; }

// @each 遍历
$colors: (
  'primary': #007bff,
  'success': #28a745,
  'danger': #dc3545
);

@each $name, $color in $colors {
  .text-#{$name} {
    color: $color;
  }
  .bg-#{$name} {
    background-color: $color;
  }
}

// 遍历列表
$sizes: sm, md, lg;
@each $size in $sizes {
  .btn-#{$size} {
    // ...
  }
}

// @while 循环
$i: 1;
@while $i <= 5 {
  .item-#{$i} {
    width: 10px * $i;
  }
  $i: $i + 1;
}
```

**Less 控制指令：**
```less
// 条件（使用 when）
.mixin(@color) when (lightness(@color) >= 50%) {
  color: black;
}
.mixin(@color) when (lightness(@color) < 50%) {
  color: white;
}

// 循环（递归）
.generate-columns(@n, @i: 1) when (@i =< @n) {
  .col-@{i} {
    width: (@i * 100% / @n);
  }
  .generate-columns(@n, (@i + 1));
}

.generate-columns(12);

// each 循环
each(@colors, {
  .text-@{key} {
    color: @value;
  }
});
```

---

#### 8. 模块化

**SCSS 模块化（@use/@forward）：**
```scss
// _variables.scss（部分文件，不独立编译）
$primary-color: #007bff;
$font-size-base: 16px;

// _mixins.scss
@mixin center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// _functions.scss
@function px-to-rem($px) {
  @return ($px / 16) * 1rem;
}

// main.scss（使用 @use）
@use 'variables' as vars;
@use 'mixins';
@use 'functions' as fn;

.container {
  color: vars.$primary-color;
  font-size: fn.px-to-rem(14);
  @include mixins.center;
}

// @forward 转发
// _base.scss
@forward 'variables';
@forward 'mixins';

// main.scss
@use 'base';
.box {
  color: base.$primary-color;
}

// @use with 配置
@use 'variables' with (
  $primary-color: #ff0000
);
```

**Less 模块化（@import）：**
```less
// variables.less
@primary-color: #007bff;

// mixins.less
.center() {
  display: flex;
  justify-content: center;
  align-items: center;
}

// main.less
@import 'variables';
@import 'mixins';

.container {
  color: @primary-color;
  .center();
}

// reference 只导入不输出
@import (reference) 'bootstrap';
```

---

#### 9. 实用技巧

```scss
// 1. 响应式 Mixin
$breakpoints: (
  'sm': 576px,
  'md': 768px,
  'lg': 992px,
  'xl': 1200px
);

@mixin respond-to($breakpoint) {
  $value: map-get($breakpoints, $breakpoint);
  @if $value {
    @media (min-width: $value) {
      @content;
    }
  } @else {
    @warn "Unknown breakpoint: #{$breakpoint}";
  }
}

.container {
  width: 100%;

  @include respond-to('md') {
    width: 750px;
  }

  @include respond-to('lg') {
    width: 970px;
  }
}

// 2. 自动生成工具类
$spacing-values: (0, 1, 2, 3, 4, 5);
$spacing-unit: 0.25rem;

@each $value in $spacing-values {
  .m-#{$value} { margin: $value * $spacing-unit; }
  .mt-#{$value} { margin-top: $value * $spacing-unit; }
  .mb-#{$value} { margin-bottom: $value * $spacing-unit; }
  .ml-#{$value} { margin-left: $value * $spacing-unit; }
  .mr-#{$value} { margin-right: $value * $spacing-unit; }
  .p-#{$value} { padding: $value * $spacing-unit; }
  // ...
}

// 3. 主题切换
$themes: (
  'light': (
    'bg': #ffffff,
    'text': #333333,
    'primary': #007bff
  ),
  'dark': (
    'bg': #1a1a1a,
    'text': #ffffff,
    'primary': #4da6ff
  )
);

@mixin themed {
  @each $theme-name, $theme-map in $themes {
    .theme-#{$theme-name} & {
      @content($theme-map);
    }
  }
}

.button {
  @include themed using ($theme) {
    background: map-get($theme, 'primary');
    color: map-get($theme, 'text');
  }
}

// 4. CSS Grid 布局生成器
@mixin grid($columns: 12, $gap: 20px) {
  display: grid;
  grid-template-columns: repeat($columns, 1fr);
  gap: $gap;

  @for $i from 1 through $columns {
    .col-#{$i} {
      grid-column: span $i;
    }
  }
}

.grid {
  @include grid(12, 30px);
}
```

---

### 避坑指南

| 常见错误 | 正确做法 |
|----------|----------|
| 嵌套过深（超过3层） | 控制嵌套层级，使用 BEM |
| 滥用 @extend | 优先使用 mixin 或占位符 |
| @import 导致重复编译 | 使用 @use（SCSS）|
| 变量命名无规范 | 统一命名规则如 $color-primary |
| mixin 过于复杂 | 拆分为多个小 mixin |

---

## B. 实战文档

### 项目结构

```
scss/
├── abstracts/          # 变量、函数、mixin
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _functions.scss
│   └── _index.scss     # @forward 所有
├── base/               # 基础样式
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _index.scss
├── components/         # 组件样式
│   ├── _button.scss
│   ├── _card.scss
│   └── _index.scss
├── layout/             # 布局
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _grid.scss
│   └── _index.scss
├── pages/              # 页面特定样式
│   ├── _home.scss
│   └── _about.scss
├── themes/             # 主题
│   ├── _light.scss
│   └── _dark.scss
├── vendors/            # 第三方样式
│   └── _bootstrap.scss
└── main.scss           # 入口文件
```

### 常用 Mixin 库

```scss
// 清除浮动
@mixin clearfix {
  &::after {
    content: '';
    display: table;
    clear: both;
  }
}

// 文本截断
@mixin text-ellipsis($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// Flexbox 居中
@mixin flex-center($direction: row) {
  display: flex;
  flex-direction: $direction;
  justify-content: center;
  align-items: center;
}

// 绝对定位居中
@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

// 绝对定位填充
@mixin absolute-fill {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

// 尺寸
@mixin size($width, $height: $width) {
  width: $width;
  height: $height;
}

// 圆形
@mixin circle($size) {
  @include size($size);
  border-radius: 50%;
}

// 三角形
@mixin triangle($direction, $size, $color) {
  width: 0;
  height: 0;
  border: $size solid transparent;

  @if $direction == 'up' {
    border-bottom-color: $color;
  } @else if $direction == 'down' {
    border-top-color: $color;
  } @else if $direction == 'left' {
    border-right-color: $color;
  } @else if $direction == 'right' {
    border-left-color: $color;
  }
}

// 过渡动画
@mixin transition($props...) {
  $result: ();
  @each $prop in $props {
    $result: append($result, $prop 0.3s ease, comma);
  }
  transition: $result;
}

// 隐藏滚动条
@mixin hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```

### 编译配置

```javascript
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/abstracts" as *;`
      }
    }
  }
}

// webpack (sass-loader)
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              additionalData: `@use "@/styles/abstracts" as *;`
            }
          }
        ]
      }
    ]
  }
}
```
