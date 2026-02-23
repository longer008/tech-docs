# Cloudflare Pages 快速启动指南

## ⚠️ 重要提示

当前项目遇到的错误：
```
✘ [ERROR] A compatibility_date is required when publishing.
```

**原因**：Cloudflare 误判项目类型为 Worker，而不是 Pages 静态站点。

---

## 🎯 推荐解决方案：使用 Cloudflare Dashboard

**不要使用 GitHub Actions 部署**，改用 Cloudflare Dashboard 连接 GitHub 仓库。

### 为什么推荐这种方式？

✅ 自动识别为 Pages 项目（不会误判为 Worker）  
✅ 无需配置 API Token 和 Secrets  
✅ 自动检测构建命令  
✅ 支持 PR 预览部署  
✅ 更简单、更稳定  

---

## 📋 详细步骤

### 1. 登录 Cloudflare Dashboard

访问：https://dash.cloudflare.com/

### 2. 创建 Pages 项目

1. 点击左侧菜单 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Pages** 标签
4. 点击 **Connect to Git**

### 3. 连接 GitHub 仓库

1. 选择 **GitHub** 作为 Git 提供商
2. 授权 Cloudflare 访问你的 GitHub 账户
3. 选择 `tech-docs` 仓库
4. 点击 **Begin setup**

### 4. 配置构建设置

```yaml
项目名称: tech-docs
生产分支: main
框架预设: None (不选择预设)
构建命令: NODE_OPTIONS='--max-old-space-size=3072' pnpm docs:build
构建输出目录: docs/.vitepress/dist
根目录: / (留空)
```

**⚠️ 重要**：
- 构建命令必须包含 `NODE_OPTIONS='--max-old-space-size=3072'`
- 这会增加内存限制到 3GB，避免构建时内存溢出

### 5. 设置环境变量

点击 **Environment variables** → **Production** 添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_VERSION` | `20` | Node.js 版本 |
| `NODE_OPTIONS` | `--max-old-space-size=3072` | 内存限制（3GB） |
| `VITE_BASE_PATH` | `/` | VitePress base 路径 |

**说明**：
- 这些是**构建时环境变量**，在构建过程中生效
- `VITE_BASE_PATH=/` 告诉 VitePress 使用根路径（Cloudflare）
- GitHub Pages 使用 `/tech-docs/` 路径，会自动检测

### 6. 保存并部署

1. 点击 **Save and Deploy**
2. 等待首次构建完成（约 2-5 分钟）
3. 构建成功后，你会获得一个 URL：`https://tech-docs.pages.dev`

---

## 🔄 自动部署

配置完成后，每次推送代码到 `main` 分支，Cloudflare 会自动：

1. 检测到新的提交
2. 触发构建流程
3. 部署到 `https://tech-docs.pages.dev`
4. 发送部署通知（可选）

**PR 预览**：
- 每个 Pull Request 会自动创建预览部署
- 预览 URL：`https://[commit-hash].tech-docs.pages.dev`

---

## 🚫 不要使用的方式

### ❌ GitHub Actions 部署

当前 `.github/workflows/deploy.yml.disabled` 文件已被禁用，因为：

1. Cloudflare 会误判项目类型为 Worker
2. 需要配置 API Token 和 Secrets（复杂）
3. 构建速度较慢
4. 容易出现兼容性问题

**建议**：删除或保持禁用状态。

### ❌ Wrangler CLI 部署

不要创建 `wrangler.toml` 文件，因为：

1. 这是 Worker 项目的配置文件
2. 会导致 Cloudflare 误判项目类型
3. Pages 项目不需要此文件

---

## 📊 验证部署

### 检查部署状态

1. 访问 Cloudflare Dashboard
2. 点击 **Workers & Pages** → `tech-docs`
3. 查看 **Deployments** 标签
4. 确认最新部署状态为 **Success**

### 访问网站

- **Cloudflare Pages**: `https://tech-docs.pages.dev`
- **GitHub Pages**: `https://longer008.github.io/tech-docs/`

两个部署地址都可以正常访问。

---

## 🔍 故障排查

### 构建失败：内存溢出

**错误信息**：
```
JavaScript heap out of memory
ELIFECYCLE Command failed with exit code 134
```

**解决方案**：
1. 确认构建命令包含 `NODE_OPTIONS='--max-old-space-size=3072'`
2. 确认环境变量 `NODE_OPTIONS=--max-old-space-size=3072` 已设置
3. 如果仍然失败，尝试增加到 4096

### 资源文件 404

**错误信息**：
```
/tech-docs/assets/style.css 404
```

**解决方案**：
1. 确认环境变量 `VITE_BASE_PATH=/` 已设置
2. 重新触发部署（推送代码或手动 Retry）
3. 清除浏览器缓存

### Worker 类型错误

**错误信息**：
```
A compatibility_date is required when publishing
```

**解决方案**：
1. 删除项目中的 `wrangler.toml` 文件（如果存在）
2. 在 Cloudflare Dashboard 中删除项目
3. 重新创建项目，确保选择 **Pages** 而不是 **Workers**

---

## 📚 相关文档

- [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) - 详细设置指南
- [CLOUDFLARE_BUILD_OPTIMIZATION.md](./CLOUDFLARE_BUILD_OPTIMIZATION.md) - 构建优化
- [CLOUDFLARE_ENV_VARS.md](./CLOUDFLARE_ENV_VARS.md) - 环境变量说明
- [DEPLOYMENT_PATHS.md](./DEPLOYMENT_PATHS.md) - 路径配置说明

---

## 💡 总结

1. ✅ 使用 Cloudflare Dashboard 连接 GitHub（推荐）
2. ✅ 设置构建命令和环境变量
3. ✅ 每次推送代码自动部署
4. ❌ 不要使用 GitHub Actions 部署
5. ❌ 不要创建 wrangler.toml 文件

**一句话总结**：通过 Cloudflare Dashboard 连接 GitHub 仓库，配置构建命令和环境变量，即可实现自动部署。
