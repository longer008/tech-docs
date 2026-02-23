# 部署路径配置说明

## 问题

在 Cloudflare Pages 部署后，所有资源文件（CSS、JS、图片）出现 404 错误：

```
/tech-docs/assets/style.xeOnfVMd.css  404
/tech-docs/logo.svg                   404
```

而 GitHub Pages 部署正常。

## 原因

**GitHub Pages** 和 **Cloudflare Pages** 的部署路径不同：

| 平台 | 部署路径 | 资源路径 |
|------|---------|---------|
| GitHub Pages | `https://longer008.github.io/tech-docs/` | `/tech-docs/assets/...` |
| Cloudflare Pages | `https://tech-docs.pages.dev/` | `/assets/...` |

- **GitHub Pages**：仓库名为 `tech-docs`，部署在子路径 `/tech-docs/`
- **Cloudflare Pages**：项目部署在根路径 `/`

如果 VitePress 配置 `base: '/tech-docs/'`，在 Cloudflare Pages 上会导致所有资源路径错误。

## 解决方案

### 方案一：动态 Base 路径（已实施）

修改 `docs/.vitepress/config.mts`，根据环境变量动态设置 base 路径：

```typescript
// 根据环境变量动态设置 base 路径
// GitHub Pages: /tech-docs/
// Cloudflare Pages: /
const base = process.env.VITE_BASE_PATH || (process.env.CF_PAGES ? '/' : '/tech-docs/')

export default defineConfig({
  base: base,
  
  head: [
    ['link', { rel: 'icon', href: `${base}favicon.svg` }],
    // 其他资源也使用 base 变量
  ],
  
  themeConfig: {
    logo: `${base}logo.svg`,
  }
})
```

**工作原理**：
1. **Cloudflare Pages**：
   - 自动设置 `CF_PAGES=true` 环境变量（构建时）
   - 或者手动设置 `VITE_BASE_PATH=/`（构建时环境变量）
   - base 为 `/`
   
2. **GitHub Pages**：
   - 没有 `CF_PAGES` 或 `VITE_BASE_PATH` 环境变量
   - base 为 `/tech-docs/`
   
3. **本地开发**：
   - 可以通过 `VITE_BASE_PATH` 环境变量手动指定

**重要**：这些是**构建时环境变量**，在 VitePress 构建过程中读取，不是运行时环境变量。

### 方案二：在 Cloudflare 设置构建时环境变量

在 Cloudflare Pages 项目设置中添加**构建时环境变量**：

**Settings** → **Environment variables** → **Production**

```bash
VITE_BASE_PATH=/
```

**重要说明**：
- 这是**构建时环境变量**，在 `pnpm docs:build` 执行时生效
- Cloudflare Pages 的静态站点不支持运行时环境变量
- 环境变量会在构建过程中被 VitePress 读取，生成正确的资源路径

这样可以显式指定 Cloudflare Pages 使用根路径，而不依赖 `CF_PAGES` 自动检测。

### 方案三：使用自定义域名（可选）

如果两个平台都使用自定义域名的子路径：

```
GitHub Pages:     https://docs.example.com/
Cloudflare Pages: https://docs.example.com/
```

可以将 base 设置为 `/`，两个平台都使用根路径。

## 配置步骤

### 1. 代码已更新

`docs/.vitepress/config.mts` 已修改为动态 base 路径。

### 2. Cloudflare Pages 配置

在 Cloudflare Dashboard 中：

**Settings** → **Environment variables** → **Production**

添加（可选，代码会自动检测 CF_PAGES）：

```bash
VITE_BASE_PATH=/
```

### 3. GitHub Pages 配置

无需修改，GitHub Actions 会自动使用 `/tech-docs/` 作为 base。

### 4. 本地开发

```bash
# 默认使用 /tech-docs/（模拟 GitHub Pages）
pnpm docs:dev

# 使用根路径（模拟 Cloudflare Pages）
VITE_BASE_PATH=/ pnpm docs:dev
```

## 验证

### GitHub Pages

访问：`https://longer008.github.io/tech-docs/`

检查资源路径：
```
✅ /tech-docs/assets/style.xeOnfVMd.css
✅ /tech-docs/logo.svg
✅ /tech-docs/favicon.svg
```

### Cloudflare Pages

访问：`https://tech-docs.pages.dev/`

检查资源路径：
```
✅ /assets/style.xeOnfVMd.css
✅ /logo.svg
✅ /favicon.svg
```

## 常见问题

### Q1: 为什么不统一使用根路径 `/`？

**A**: GitHub Pages 的仓库名为 `tech-docs`，必须部署在 `/tech-docs/` 子路径下。除非：
- 使用 `username.github.io` 仓库（用户/组织主页）
- 或者配置自定义域名

### Q2: 本地开发时使用哪个路径？

**A**: 默认使用 `/tech-docs/`（模拟 GitHub Pages）。如果需要测试 Cloudflare Pages 的效果：

```bash
# Windows (cmd)
set VITE_BASE_PATH=/ && pnpm docs:dev

# Windows (PowerShell)
$env:VITE_BASE_PATH="/"; pnpm docs:dev

# Linux/Mac
VITE_BASE_PATH=/ pnpm docs:dev
```

### Q3: 如何确认当前使用的 base 路径？

**A**: 查看浏览器开发者工具的 Network 标签，检查资源请求路径：
- 以 `/tech-docs/` 开头 → GitHub Pages 模式
- 以 `/` 开头 → Cloudflare Pages 模式

### Q4: 部署后如何快速修复？

**A**: 
1. 确认代码已更新（动态 base 配置）
2. 推送代码到 GitHub
3. Cloudflare Pages 会自动重新构建
4. 等待 2-3 分钟，刷新页面验证

## 相关文件

- `docs/.vitepress/config.mts`：VitePress 配置文件
- `.github/workflows/deploy-github-pages.yml`：GitHub Pages 部署配置
- `CLOUDFLARE_SETUP.md`：Cloudflare Pages 设置指南

## 总结

通过动态 base 路径配置，项目可以同时部署到：
- ✅ GitHub Pages（`/tech-docs/` 子路径）
- ✅ Cloudflare Pages（`/` 根路径）
- ✅ 本地开发（可切换）

无需维护两套配置，一次构建，多处部署！
