# Wrangler 部署指南

## 📦 安装 Wrangler

Wrangler 已添加到 `package.json` 的 devDependencies 中。

安装依赖：
```bash
pnpm install
```

## 🔑 登录 Cloudflare

首次使用需要登录 Cloudflare 账户：

```bash
pnpm wrangler login
```

这会打开浏览器，授权 Wrangler 访问你的 Cloudflare 账户。

## 🚀 部署命令

### 1. 生产环境部署（推荐）

```bash
pnpm deploy
```

这会：
1. 设置环境变量 `VITE_BASE_PATH=/`（Cloudflare Pages 使用根路径）
2. 构建项目（使用 3GB 内存限制）
3. 部署到 Cloudflare Pages 生产环境
4. 生成 URL：`https://tech-docs.pages.dev`

**重要**：部署命令会自动设置 `VITE_BASE_PATH=/`，确保资源路径正确。

### 2. 仅部署（不重新构建）

```bash
pnpm deploy:only
```

这会：
1. 直接部署已构建的文件（`docs/.vitepress/dist`）
2. 不重新构建项目
3. 适用于已经构建好的情况

**注意**：使用此命令前，请确保已经使用正确的环境变量构建：
```bash
cross-env VITE_BASE_PATH=/ pnpm docs:build
```

### 3. Cloudflare 专用构建

```bash
pnpm docs:build:cf
```

这会：
1. 设置环境变量 `VITE_BASE_PATH=/`
2. 使用 3GB 内存限制构建
3. 输出到 `docs/.vitepress/dist`

构建完成后，可以使用 `pnpm deploy:only` 部署。

## 📝 配置文件说明

### wrangler.toml

```toml
name = "tech-docs"                              # 项目名称
compatibility_date = "2024-01-01"               # Cloudflare Workers 兼容日期
pages_build_output_dir = "docs/.vitepress/dist" # 构建输出目录
```

**注意**：
- Cloudflare Pages 的 `wrangler.toml` 不支持 `[build]` 配置
- 构建命令应该在部署前手动执行，或通过 package.json 脚本执行
- 环境变量通过 Cloudflare Dashboard 或命令行参数设置

### package.json 新增命令

```json
{
  "scripts": {
    "deploy": "pnpm docs:build && wrangler pages deploy docs/.vitepress/dist --project-name=tech-docs",
    "deploy:prod": "pnpm docs:build && wrangler pages deploy docs/.vitepress/dist --project-name=tech-docs --branch=main",
    "deploy:preview": "pnpm docs:build && wrangler pages deploy docs/.vitepress/dist --project-name=tech-docs --branch=preview"
  }
}
```

## 🔄 自动部署（GitHub Actions）

如果你想在每次推送代码时自动部署，可以创建 GitHub Actions 工作流。

### 方案 1：使用 Wrangler Action（推荐）

创建 `.github/workflows/deploy-wrangler.yml`：

```yaml
name: Deploy to Cloudflare Pages (Wrangler)

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10.8.1

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm docs:build
        env:
          NODE_OPTIONS: --max_old_space_size=3072

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy docs/.vitepress/dist --project-name=tech-docs --branch=main
```

### 配置 GitHub Secrets

1. 获取 Cloudflare API Token：
   - 登录 https://dash.cloudflare.com/
   - 点击右上角头像 → **My Profile** → **API Tokens**
   - 点击 **Create Token**
   - 使用 **Edit Cloudflare Workers** 模板
   - 权限：Account → Cloudflare Pages → Edit
   - 复制生成的 Token

2. 获取 Account ID：
   - 登录 Cloudflare Dashboard
   - 点击任意域名
   - 右侧栏显示 **Account ID**

3. 添加到 GitHub Secrets：
   - 进入 `https://github.com/longer008/tech-docs/settings/secrets/actions`
   - 添加 `CLOUDFLARE_API_TOKEN`
   - 添加 `CLOUDFLARE_ACCOUNT_ID`

## 📊 部署验证

### 查看部署状态

```bash
pnpm wrangler pages deployment list --project-name=tech-docs
```

### 查看项目信息

```bash
pnpm wrangler pages project list
```

### 查看部署日志

```bash
pnpm wrangler pages deployment tail --project-name=tech-docs
```

## 🔍 故障排查

### 1. 登录失败

**错误**：`Not logged in`

**解决**：
```bash
pnpm wrangler login
```

### 2. 项目不存在

**错误**：`Project not found`

**解决**：
首次部署会自动创建项目。如果仍然失败，手动创建：
```bash
pnpm wrangler pages project create tech-docs
```

### 3. 内存溢出

**错误**：`JavaScript heap out of memory`

**解决**：
确保使用 `pnpm deploy:prod` 命令，它会自动设置 3GB 内存限制。

或者手动设置：
```bash
NODE_OPTIONS='--max-old-space-size=4096' pnpm docs:build
pnpm wrangler pages deploy docs/.vitepress/dist --project-name=tech-docs
```

### 4. 资源文件 404

**错误**：`/tech-docs/assets/style.css 404`

**解决**：
确认 `wrangler.toml` 中的环境变量设置正确：
```toml
[env.production]
vars = { VITE_BASE_PATH = "/" }
```

## 🆚 Wrangler vs GitHub Actions vs Dashboard

| 方式 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Wrangler CLI** | 快速、灵活、本地控制 | 需要手动执行 | ⭐⭐⭐⭐⭐ |
| **GitHub Actions** | 自动化、CI/CD 集成 | 配置复杂、需要 Secrets | ⭐⭐⭐⭐ |
| **Dashboard** | 最简单、自动部署 | 功能有限、依赖 UI | ⭐⭐⭐ |

## 💡 最佳实践

1. **本地开发**：使用 `pnpm docs:dev`
2. **本地预览**：使用 `pnpm docs:preview`
3. **手动部署**：使用 `pnpm deploy:prod`
4. **自动部署**：配置 GitHub Actions
5. **预览部署**：使用 `pnpm deploy:preview` 测试新功能

## 📚 相关命令

```bash
# 开发
pnpm docs:dev              # 启动开发服务器

# 构建
pnpm docs:build            # 标准构建
pnpm docs:build:cf         # Cloudflare 构建（3GB 内存）

# 预览
pnpm docs:preview          # 本地预览构建结果

# 部署
pnpm deploy                # 部署到生产环境
pnpm deploy:prod           # 部署到生产环境（明确）
pnpm deploy:preview        # 部署到预览环境

# Wrangler 命令
pnpm wrangler login        # 登录 Cloudflare
pnpm wrangler logout       # 登出
pnpm wrangler whoami       # 查看当前用户
pnpm wrangler pages project list              # 列出所有项目
pnpm wrangler pages deployment list           # 列出部署历史
pnpm wrangler pages deployment tail           # 查看部署日志
```

## 🎯 快速开始

1. **安装依赖**
   ```bash
   pnpm install
   ```

2. **登录 Cloudflare**
   ```bash
   pnpm wrangler login
   ```

3. **部署**
   ```bash
   pnpm deploy:prod
   ```

4. **访问网站**
   ```
   https://tech-docs.pages.dev
   ```

完成！🎉

## 📖 参考资料

- [Wrangler 官方文档](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [VitePress 部署指南](https://vitepress.dev/guide/deploy)

---

> 💡 **提示**：推荐使用 Wrangler CLI 进行手动部署，配合 GitHub Actions 实现自动化部署。
