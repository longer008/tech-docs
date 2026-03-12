# 修复 Cloudflare Pages 资源 404 问题

## 🐛 问题描述

部署到 Cloudflare Pages 后，所有资源文件（CSS、JS、图片等）都返回 404 错误：

```
/tech-docs/assets/style.css  404
/tech-docs/logo.svg          404
/tech-docs/assets/app.js     404
```

## 🔍 问题原因

VitePress 配置中的 `base` 路径设置不正确：

```typescript
// 错误的配置
const base = process.env.VITE_BASE_PATH || (process.env.CF_PAGES ? '/' : '/tech-docs/')
```

**问题**：
1. GitHub Pages 需要 `/tech-docs/` 路径（子路径部署）
2. Cloudflare Pages 需要 `/` 路径（根路径部署）
3. 本地使用 Wrangler 部署时，`process.env.CF_PAGES` 不存在
4. 导致构建时使用了错误的 base 路径 `/tech-docs/`

## ✅ 解决方案

### 1. 修改 VitePress 配置

**文件**：`docs/.vitepress/config.mts`

```typescript
// 修改前
const base = process.env.VITE_BASE_PATH || (process.env.CF_PAGES ? '/' : '/tech-docs/')

// 修改后
const base = process.env.VITE_BASE_PATH || '/tech-docs/'
```

**说明**：
- 默认使用 `/tech-docs/`（GitHub Pages）
- 通过 `VITE_BASE_PATH` 环境变量覆盖（Cloudflare Pages）

### 2. 更新部署命令

**文件**：`package.json`

```json
{
  "scripts": {
    "docs:build:cf": "cross-env NODE_OPTIONS='--max-old-space-size=3072' VITE_BASE_PATH=/ vitepress build docs",
    "deploy": "cross-env VITE_BASE_PATH=/ pnpm docs:build && npx wrangler pages deploy docs/.vitepress/dist --project-name=tech-docs",
    "deploy:only": "npx wrangler pages deploy docs/.vitepress/dist --project-name=tech-docs"
  }
}
```

**说明**：
- `cross-env` 用于跨平台设置环境变量
- `VITE_BASE_PATH=/` 告诉 VitePress 使用根路径
- 部署命令会自动设置正确的环境变量

### 3. 添加 cross-env 依赖

```bash
pnpm add -D cross-env
```

或者已经添加到 `package.json`：

```json
{
  "devDependencies": {
    "cross-env": "^7.0.3"
  }
}
```

## 🚀 正确的部署流程

### 方式 1：一键部署（推荐）

```bash
pnpm deploy
```

这会：
1. 自动设置 `VITE_BASE_PATH=/`
2. 构建项目
3. 部署到 Cloudflare Pages

### 方式 2：分步部署

```bash
# 1. 使用正确的环境变量构建
pnpm docs:build:cf

# 2. 部署已构建的文件
pnpm deploy:only
```

### 方式 3：手动设置环境变量

```bash
# Windows (CMD)
set VITE_BASE_PATH=/ && pnpm docs:build && pnpm deploy:only

# Windows (PowerShell)
$env:VITE_BASE_PATH="/"; pnpm docs:build; pnpm deploy:only

# Linux/Mac
VITE_BASE_PATH=/ pnpm docs:build && pnpm deploy:only
```

## 🔄 GitHub Actions 配置

如果使用 GitHub Actions 自动部署到 Cloudflare Pages：

```yaml
- name: Build
  run: pnpm docs:build
  env:
    NODE_OPTIONS: --max_old_space_size=3072
    VITE_BASE_PATH: /  # 设置 Cloudflare Pages 路径

- name: Deploy to Cloudflare Pages
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy docs/.vitepress/dist --project-name=tech-docs
```

## 📊 验证部署

### 1. 检查构建输出

构建时应该看到：

```bash
✓ building client + server bundles...
✓ rendering pages...
build complete in 123.45s.
```

### 2. 检查资源路径

打开 `docs/.vitepress/dist/index.html`，检查资源路径：

```html
<!-- 正确（Cloudflare Pages） -->
<link rel="stylesheet" href="/assets/style.css">
<script src="/assets/app.js"></script>

<!-- 错误（会导致 404） -->
<link rel="stylesheet" href="/tech-docs/assets/style.css">
<script src="/tech-docs/assets/app.js"></script>
```

### 3. 访问网站

部署成功后，访问：
```
https://tech-docs.pages.dev
```

所有资源应该正常加载，无 404 错误。

## 🎯 不同环境的 base 路径

| 环境 | base 路径 | 设置方式 |
|------|-----------|----------|
| **GitHub Pages** | `/tech-docs/` | 默认（不设置环境变量） |
| **Cloudflare Pages** | `/` | `VITE_BASE_PATH=/` |
| **本地开发** | `/tech-docs/` | 默认 |
| **本地预览** | `/tech-docs/` | 默认 |

## 💡 最佳实践

1. **GitHub Pages 部署**：
   ```bash
   pnpm docs:build  # 使用默认 base: /tech-docs/
   ```

2. **Cloudflare Pages 部署**：
   ```bash
   pnpm deploy  # 自动设置 VITE_BASE_PATH=/
   ```

3. **本地测试 Cloudflare 构建**：
   ```bash
   pnpm docs:build:cf  # 使用 VITE_BASE_PATH=/
   pnpm docs:preview   # 预览（注意：路径可能不匹配）
   ```

## 🔍 故障排查

### 问题 1：资源仍然 404

**检查**：
```bash
# 查看构建输出的 HTML 文件
cat docs/.vitepress/dist/index.html | grep "assets"
```

**解决**：
- 确认使用了 `cross-env VITE_BASE_PATH=/` 构建
- 删除 `docs/.vitepress/dist` 目录
- 重新构建：`pnpm deploy`

### 问题 2：cross-env 命令不存在

**错误**：
```
'cross-env' is not recognized as an internal or external command
```

**解决**：
```bash
pnpm install  # 安装依赖
```

### 问题 3：GitHub Pages 也出现 404

**原因**：
- 使用了 `VITE_BASE_PATH=/` 构建
- GitHub Pages 需要 `/tech-docs/` 路径

**解决**：
```bash
# GitHub Pages 部署使用默认构建
pnpm docs:build  # 不设置 VITE_BASE_PATH
```

## 📚 相关文档

- [DEPLOYMENT_PATHS.md](./DEPLOYMENT_PATHS.md) - 路径配置详解
- [WRANGLER_DEPLOYMENT.md](./WRANGLER_DEPLOYMENT.md) - Wrangler 部署指南
- [CLOUDFLARE_ENV_VARS.md](./CLOUDFLARE_ENV_VARS.md) - 环境变量说明

---

> 💡 **总结**：使用 `pnpm deploy` 命令部署到 Cloudflare Pages，它会自动设置正确的环境变量。
