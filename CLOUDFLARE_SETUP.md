# Cloudflare Pages 快速设置指南

## 🚀 方案一：通过 Cloudflare Dashboard 自动部署（推荐）

这是最简单的方法，无需配置 GitHub Actions。

### 步骤 1：登录 Cloudflare

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 使用你的账号登录

### 步骤 2：创建 Pages 项目

1. 点击左侧菜单 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Pages** 标签
4. 点击 **Connect to Git**

### 步骤 3：连接 GitHub 仓库

1. 选择 **GitHub** 作为 Git 提供商
2. 授权 Cloudflare 访问你的 GitHub 账户
3. 选择 `tech-docs` 仓库
4. 点击 **Begin setup**

### 步骤 4：配置构建设置

```yaml
项目名称: tech-docs
生产分支: main
框架预设: None (不选择预设)
构建命令: NODE_OPTIONS='--max-old-space-size=3072' pnpm docs:build
构建输出目录: docs/.vitepress/dist
根目录: / (留空)
```

**重要**：构建命令必须包含 `NODE_OPTIONS='--max-old-space-size=3072'` 以增加内存限制，避免构建时内存溢出。

### 步骤 5：环境变量（可选）

点击 **Environment variables** 添加：

```bash
# Node.js 版本
NODE_VERSION=20

# 内存限制（重要！防止构建时内存溢出）
NODE_OPTIONS=--max-old-space-size=3072
```

**说明**：
- `NODE_VERSION=20`：指定 Node.js 版本
- `NODE_OPTIONS=--max-old-space-size=3072`：增加内存限制到 3GB

### 步骤 6：保存并部署

1. 点击 **Save and Deploy**
2. 等待首次构建完成（约 2-5 分钟）
3. 构建成功后，你会获得一个 URL：`https://tech-docs.pages.dev`

### 步骤 7：禁用 GitHub Actions 部署（可选）

如果使用 Cloudflare 自动部署，可以禁用 GitHub Actions：

```bash
# 重命名文件以禁用
mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled
```

或者删除该文件：

```bash
git rm .github/workflows/deploy.yml
git commit -m "chore: 禁用 GitHub Actions Cloudflare 部署"
git push
```

---

## 🔧 方案二：使用 GitHub Actions 部署

如果你想继续使用 GitHub Actions，需要先创建项目并配置 Secrets。

### 步骤 1：在 Cloudflare 创建空项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击 **Workers & Pages** → **Create application** → **Pages**
3. 选择 **Direct Upload**（直接上传）
4. 项目名称：`tech-docs`
5. 点击 **Create project**

### 步骤 2：获取 API Token

1. 访问 [API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **Create Token**
3. 选择 **Edit Cloudflare Workers** 模板
4. 或者使用自定义 Token，权限设置为：
   - Account - Cloudflare Pages - Edit
5. 复制生成的 Token

### 步骤 3：获取 Account ID

1. 在 Cloudflare Dashboard 右侧找到 **Account ID**
2. 或者访问 Workers & Pages 页面，URL 中包含 Account ID
3. 复制 Account ID

### 步骤 4：配置 GitHub Secrets

1. 访问你的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下 Secrets：

```
名称: CLOUDFLARE_API_TOKEN
值: [你的 API Token]

名称: CLOUDFLARE_ACCOUNT_ID
值: [你的 Account ID]
```

### 步骤 5：推送代码触发部署

```bash
git push origin main
```

---

## 📊 部署验证

### 检查部署状态

**Cloudflare Dashboard：**
1. 访问 Workers & Pages
2. 点击 `tech-docs` 项目
3. 查看 **Deployments** 标签

**GitHub Actions：**
1. 访问仓库的 Actions 标签
2. 查看最新的 workflow 运行状态

### 访问网站

- Cloudflare Pages URL: `https://tech-docs.pages.dev`
- 自定义域名（如果配置）: `https://your-domain.com`

---

## 🎯 推荐配置

### 使用 Cloudflare 自动部署的优势

✅ 无需配置 GitHub Secrets  
✅ 自动检测框架和构建命令  
✅ 更快的部署速度  
✅ 自动预览部署（PR）  
✅ 内置回滚功能  
✅ 免费 SSL 证书  
✅ 全球 CDN 加速  

### 同时使用两种部署方式

如果你想同时部署到 GitHub Pages 和 Cloudflare Pages：

1. **GitHub Pages**: 保留 `.github/workflows/deploy-github-pages.yml`
2. **Cloudflare Pages**: 使用 Cloudflare Dashboard 自动部署
3. 删除或禁用 `.github/workflows/deploy.yml`

这样你就有两个部署地址：
- GitHub Pages: `https://longer008.github.io/tech-docs/`
- Cloudflare Pages: `https://tech-docs.pages.dev`

---

## 🔍 故障排查

### 构建失败

**检查构建日志：**
- Cloudflare Dashboard → 项目 → Deployments → 点击失败的部署

**常见问题：**
1. Node.js 版本不匹配 → 设置 `NODE_VERSION=20`
2. 依赖安装失败 → 检查 `pnpm-lock.yaml`
3. 构建命令错误 → 确认 `pnpm docs:build` 正确

### API Token 权限不足

如果使用 GitHub Actions 部署失败：
1. 检查 API Token 权限
2. 确保 Token 包含 **Cloudflare Pages - Edit** 权限
3. 重新生成 Token 并更新 GitHub Secrets

---

## 📚 相关文档

- [Cloudflare Pages 官方文档](https://developers.cloudflare.com/pages/)
- [VitePress 部署指南](https://vitepress.dev/guide/deploy)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
