---
title: 插件效果演示
description: 演示 VitePress 插件的效果
---

# 插件效果演示

本页面用于演示 VitePress 插件的效果。

## 1. NProgress 进度条插件

### 效果说明
NProgress 会在页面切换时在顶部显示一个进度条。

### 如何查看效果
1. 点击导航栏切换到其他页面
2. 观察页面顶部是否出现蓝绿色的进度条
3. 进度条会在页面加载完成后自动消失

### 特点
- ✅ 自动在页面切换时显示
- ✅ 平滑的动画效果
- ✅ 可自定义颜色和速度
- ✅ 响应式设计

### 测试链接
点击下面的链接测试进度条效果：
- [前端技术](/frontend/)
- [后端技术](/backend/)
- [数据库](/database/)
- [AI 面试](/ai-interview/)

---

## 2. 页面属性插件（阅读时间和字数统计）

### 效果说明
页面属性插件会在文档顶部显示：
- 📊 **字数统计**：当前页面的总字数
- ⏱️ **阅读时间**：根据字数估算的阅读时间（按每分钟 200-300 字计算）

### 如何查看效果
查看本页面顶部，你会看到类似这样的信息：
```
字数: 1234
阅读时间: 5 分钟
```

### 特点
- ✅ 自动计算字数和阅读时间
- ✅ 支持中英文混合计算
- ✅ 可自定义显示样式
- ✅ 支持多语言本地化
- ✅ 基于 Nolebase 插件，持续更新维护

### 配置说明
在 `theme/index.ts` 中配置：
```typescript
app.provide(NolebasePagePropertiesInjectionKey, {
  locales: {
    'zh-CN': {
      wordsCount: {
        title: '字数',
      },
      readingTime: {
        title: '阅读时间',
        minutes: '分钟',
      },
    },
  },
})
```

---

## 3. 其他已启用的插件

### 返回顶部按钮
- 向下滚动超过 300px 后，右下角会出现返回顶部按钮
- 点击可平滑滚动到页面顶部

### 代码块折叠
超过 400px 高度的代码块会自动添加折叠按钮：

```javascript
// 这是一个很长的代码示例
function example() {
  console.log('第 1 行')
  console.log('第 2 行')
  console.log('第 3 行')
  console.log('第 4 行')
  console.log('第 5 行')
  console.log('第 6 行')
  console.log('第 7 行')
  console.log('第 8 行')
  console.log('第 9 行')
  console.log('第 10 行')
  console.log('第 11 行')
  console.log('第 12 行')
  console.log('第 13 行')
  console.log('第 14 行')
  console.log('第 15 行')
  console.log('第 16 行')
  console.log('第 17 行')
  console.log('第 18 行')
  console.log('第 19 行')
  console.log('第 20 行')
  console.log('第 21 行')
  console.log('第 22 行')
  console.log('第 23 行')
  console.log('第 24 行')
  console.log('第 25 行')
  console.log('第 26 行')
  console.log('第 27 行')
  console.log('第 28 行')
  console.log('第 29 行')
  console.log('第 30 行')
}
```

### 图片缩放
点击下面的图片可以放大查看：

![示例图片](https://via.placeholder.com/600x400?text=Click+to+Zoom)

### Tabs 标签页
:::tabs
== JavaScript
```javascript
console.log('Hello JavaScript')
```

== TypeScript
```typescript
const message: string = 'Hello TypeScript'
console.log(message)
```

== Python
```python
print('Hello Python')
```
:::

### 增强阅读性
点击导航栏右上角的"阅读增强"按钮，可以调节：
- 字体大小
- 内容宽度
- 行高
- 段落间距

---

## 故障排查

### NProgress 不显示？
1. 检查是否正确导入样式：
   ```ts
   import 'vitepress-plugin-nprogress/lib/css/index.css'
   ```
2. 确认 router 参数已传入：
   ```ts
   enhanceApp({ app, router }) {
     NProgress(router)
   }
   ```
3. 清除浏览器缓存重试

### 页面属性不显示？
1. 确认已安装插件：
   ```bash
   pnpm add -D @nolebase/vitepress-plugin-page-properties
   ```
2. 检查是否正确导入和配置
3. 确认在 Layout 中添加了组件：
   ```ts
   'doc-before': () => h(NolebasePagePropertiesEditor)
   ```

### 如何自定义 NProgress 样式？
在 `custom.css` 中添加：

```css
/* 自定义进度条颜色 */
#nprogress .bar {
  background: #42b883 !important; /* VitePress 绿色 */
  height: 3px !important;
}

#nprogress .peg {
  box-shadow: 0 0 10px #42b883, 0 0 5px #42b883 !important;
}

/* 隐藏加载圈 */
#nprogress .spinner {
  display: none !important;
}
```

---

## 总结

- ✅ **NProgress**：页面切换时自动显示进度条，提升用户体验
- ✅ **页面属性**：显示字数和阅读时间，帮助读者了解文章长度
- ✅ **返回顶部**：长页面快速返回顶部
- ✅ **代码折叠**：长代码块自动折叠
- ✅ **图片缩放**：点击图片放大查看
- ✅ **Tabs**：多语言代码示例切换
- ✅ **增强阅读**：自定义阅读体验

这些插件共同提升了文档站点的交互体验和功能完整性。


### 返回顶部按钮
- 向下滚动超过 300px 后，右下角会出现返回顶部按钮
- 点击可平滑滚动到页面顶部

### 代码块折叠
超过 400px 高度的代码块会自动添加折叠按钮：

```javascript
// 这是一个很长的代码示例
function example() {
  console.log('第 1 行')
  console.log('第 2 行')
  console.log('第 3 行')
  console.log('第 4 行')
  console.log('第 5 行')
  console.log('第 6 行')
  console.log('第 7 行')
  console.log('第 8 行')
  console.log('第 9 行')
  console.log('第 10 行')
  console.log('第 11 行')
  console.log('第 12 行')
  console.log('第 13 行')
  console.log('第 14 行')
  console.log('第 15 行')
  console.log('第 16 行')
  console.log('第 17 行')
  console.log('第 18 行')
  console.log('第 19 行')
  console.log('第 20 行')
  console.log('第 21 行')
  console.log('第 22 行')
  console.log('第 23 行')
  console.log('第 24 行')
  console.log('第 25 行')
  console.log('第 26 行')
  console.log('第 27 行')
  console.log('第 28 行')
  console.log('第 29 行')
  console.log('第 30 行')
}
```

### 图片缩放
点击下面的图片可以放大查看：

![示例图片](https://via.placeholder.com/600x400?text=Click+to+Zoom)

### Tabs 标签页
:::tabs
== JavaScript
```javascript
console.log('Hello JavaScript')
```

== TypeScript
```typescript
const message: string = 'Hello TypeScript'
console.log(message)
```

== Python
```python
print('Hello Python')
```
:::

---

## 故障排查

### NProgress 不显示？
1. 检查是否正确导入样式：
   ```ts
   import 'vitepress-plugin-nprogress/lib/css/index.css'
   ```
2. 确认 router 参数已传入：
   ```ts
   enhanceApp({ app, router }) {
     NProgress(router)
   }
   ```
3. 清除浏览器缓存重试

### Giscus 不显示？
1. 确认 GitHub 仓库是公开的
2. 确认已启用 Discussions 功能
3. 确认已安装 Giscus App
4. 检查配置参数是否正确（repo、repoId、categoryId）
5. 打开浏览器控制台查看错误信息

### 如何自定义 NProgress 样式？
在 `custom.css` 中添加：

```css
/* 自定义进度条颜色 */
#nprogress .bar {
  background: #42b883 !important; /* VitePress 绿色 */
  height: 3px !important;
}

#nprogress .peg {
  box-shadow: 0 0 10px #42b883, 0 0 5px #42b883 !important;
}

/* 隐藏加载圈 */
#nprogress .spinner {
  display: none !important;
}
```

---

## 总结

- ✅ **NProgress**：页面切换时自动显示进度条，提升用户体验
- ✅ **Giscus**：基于 GitHub Discussions 的评论系统，无需后端
- ✅ **返回顶部**：长页面快速返回顶部
- ✅ **代码折叠**：长代码块自动折叠
- ✅ **图片缩放**：点击图片放大查看
- ✅ **Tabs**：多语言代码示例切换

这些插件共同提升了文档站点的交互体验和功能完整性。
