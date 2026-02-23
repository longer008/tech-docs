# Cloudflare Pages 环境变量说明

## 重要提示

Cloudflare Pages 的静态站点**只支持构建时环境变量**，不支持运行时环境变量。

## 什么是构建时环境变量？

**构建时环境变量**：
- 在执行 `pnpm docs:build` 时生效
- VitePress 读取环境变量，生成静态 HTML/CSS/JS 文件
- 所有路径在构建时已经确定
- 部署后无法修改

**运行时环境变量**（Cloudflare Pages 静态站点不支持）：
- 在用户访问网站时生效
- 需要服务端代码（如 Cloudflare Workers）
- 静态站点没有服务端代码，因此不支持

## 如何设置构建时环境变量

### 在 Cloudflare Dashboard 中设置

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages → tech-docs 项目
3. 点击 **Settings** → **Environment variables**
4. 选择 **Production** 标签
5. 点击 **Add variable**

添加以下变量：

```bash
# Node.js 版本
NODE_VERSION=20

# 内存限制
NODE_OPTIONS=--max-old-space-size=3072

# Base 路径（重要！）
VITE_BASE_PATH=/
```

6. 点击 **Save**

### 环境变量的作用

#### NODE_VERSION
- 指定构建时使用的 Node.js 版本
- 推荐：20（LTS 版本）

#### NODE_OPTIONS
- 增加 Node.js 内存限制
- 防止构建大型文档时内存溢出
- 值：`--max-old-space-size=3072`（3GB）

#### VITE_BASE_PATH
- **最重要的环境变量**
- 告诉 VitePress 使用哪个 base 路径
- Cloudflare Pages：`/`（根路径）
- GitHub Pages：`/tech-docs/`（子路径）

## 工作流程

```
1. 推送代码到 GitHub
   ↓
2. Cloudflare 检测到更新
   ↓
3. 开始构建
   ↓
4. 读取环境变量
   - NODE_VERSION=20
   - NODE_OPTIONS=--max-old-space-size=3072
   - VITE_BASE_PATH=/
   ↓
5. 执行构建命令
   NODE_OPTIONS='--max-old-space-size=3072' pnpm docs:build
   ↓
6. VitePress 读取 VITE_BASE_PATH
   - base = '/'
   - 生成的 HTML 中所有路径：/assets/...
   ↓
7. 部署静态文件
   ↓
8. 用户访问网站
   - 资源路径：/assets/style.css ✅
```

## 验证环境变量

### 方法一：查看构建日志

在 Cloudflare Dashboard：
1. 进入项目 → **Deployments**
2. 点击最新的部署
3. 查看 **Build log**

搜索 `VITE_BASE_PATH`，应该能看到：
```
VITE_BASE_PATH=/
```

### 方法二：检查生成的文件

部署成功后，查看网页源代码：

```html
<!-- 正确（根路径） -->
<link rel="stylesheet" href="/assets/style.css">
<img src="/logo.svg">

<!-- 错误（子路径） -->
<link rel="stylesheet" href="/tech-docs/assets/style.css">
<img src="/tech-docs/logo.svg">
```

### 方法三：浏览器开发者工具

1. 打开网站：`https://tech-docs.pages.dev/`
2. 按 F12 打开开发者工具
3. 切换到 **Network** 标签
4. 刷新页面
5. 检查资源请求路径：
   - ✅ `/assets/style.css`（正确）
   - ❌ `/tech-docs/assets/style.css`（错误）

## 常见问题

### Q1: 为什么设置了环境变量还是 404？

**A**: 可能的原因：
1. 环境变量设置在错误的环境（Preview 而不是 Production）
2. 设置后没有重新部署
3. 浏览器缓存了旧的文件

**解决方法**：
1. 确认环境变量在 **Production** 标签下
2. 推送新代码或手动 **Retry deployment**
3. 清除浏览器缓存（Ctrl+Shift+Delete）

### Q2: 如何测试环境变量是否生效？

**A**: 本地测试：

```bash
# Windows (cmd)
set VITE_BASE_PATH=/ && pnpm docs:build

# Windows (PowerShell)
$env:VITE_BASE_PATH="/"; pnpm docs:build

# Linux/Mac
VITE_BASE_PATH=/ pnpm docs:build
```

然后检查 `docs/.vitepress/dist/index.html`，查看资源路径。

### Q3: 可以在运行时修改路径吗？

**A**: 不可以。静态站点的所有路径在构建时已经确定，部署后无法修改。

如果需要修改路径：
1. 更新环境变量
2. 重新构建和部署

### Q4: GitHub Pages 需要设置环境变量吗？

**A**: 不需要。GitHub Actions 的构建环境没有 `CF_PAGES` 或 `VITE_BASE_PATH` 环境变量，代码会自动使用 `/tech-docs/` 作为 base。

## 总结

- ✅ Cloudflare Pages 支持**构建时环境变量**
- ❌ Cloudflare Pages 静态站点不支持**运行时环境变量**
- ✅ 在 Dashboard 的 Environment variables 中设置
- ✅ 设置 `VITE_BASE_PATH=/` 解决资源 404 问题
- ✅ 推送代码后自动重新构建，应用新的环境变量

## 相关文档

- [Cloudflare Pages 环境变量](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables)
- [VitePress 配置](https://vitepress.dev/reference/site-config#base)
- `DEPLOYMENT_PATHS.md`：详细的路径配置说明
- `COMMIT_SUMMARY.md`：本次修改总结
