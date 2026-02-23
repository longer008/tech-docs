# Cloudflare Pages 快速连接指南

## 为什么推送代码后 Cloudflare 没有自动部署？

因为你还没有在 Cloudflare Dashboard 中连接 GitHub 仓库。

目前的状态：
- ✅ GitHub Actions 部署到 GitHub Pages（自动）
- ❌ Cloudflare Pages 部署（需要手动连接）

## 快速连接步骤（5 分钟）

### 步骤 1：登录 Cloudflare

访问：https://dash.cloudflare.com/

### 步骤 2：创建 Pages 项目

1. 点击左侧菜单 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Pages** 标签
4. 点击 **Connect to Git**

### 步骤 3：授权 GitHub

1. 选择 **GitHub** 作为 Git 提供商
2. 点击 **Connect GitHub**
3. 授权 Cloudflare 访问你的 GitHub 账户
4. 选择 **Only select repositories**
5. 选择 `tech-docs` 仓库
6. 点击 **Install & Authorize**

### 步骤 4：配置项目

**项目设置**：
```yaml
项目名称: tech-docs
生产分支: main
框架预设: None (不选择预设)
```

**构建设置**：
```yaml
构建命令: NODE_OPTIONS='--max-old-space-size=3072' pnpm docs:build
构建输出目录: docs/.vitepress/dist
根目录: / (留空)
```

### 步骤 5：添加环境变量

点击 **Environment variables** → **Add variable**

添加以下变量（**Production** 环境）：

```bash
# 变量 1
名称: NODE_VERSION
值: 20

# 变量 2
名称: NODE_OPTIONS
值: --max-old-space-size=3072

# 变量 3（重要！）
名称: VITE_BASE_PATH
值: /
```

### 步骤 6：保存并部署

1. 点击 **Save and Deploy**
2. 等待首次构建完成（约 2-5 分钟）
3. 构建成功后，你会获得一个 URL：`https://tech-docs.pages.dev`

---

## 完成后的效果

### 自动部署流程

```
你推送代码到 GitHub
    ↓
GitHub 通知 Cloudflare
    ↓
Cloudflare 自动拉取代码
    ↓
自动构建（使用环境变量）
    ↓
自动部署到 Cloudflare Pages
    ↓
网站自动更新 ✅
```

### 两个部署地址

- **GitHub Pages**: `https://longer008.github.io/tech-docs/`
- **Cloudflare Pages**: `https://tech-docs.pages.dev`

两个都会自动部署，无需手动操作！

---

## 验证部署

### 1. 查看 Cloudflare 部署状态

在 Cloudflare Dashboard：
1. Workers & Pages → tech-docs
2. 点击 **Deployments** 标签
3. 查看最新的部署状态

### 2. 测试网站

访问：`https://tech-docs.pages.dev`

检查：
- ✅ 页面正常加载
- ✅ 资源路径为 `/assets/...`（根路径）
- ✅ 图片、样式正常显示

### 3. 测试自动部署

1. 修改任意文档
2. 提交并推送到 GitHub
3. 等待 2-3 分钟
4. 刷新 Cloudflare Pages 网站，查看更新

---

## 常见问题

### Q1: 为什么不使用 GitHub Actions 部署到 Cloudflare？

**A**: 
- GitHub Actions 方式需要配置 API Token 和 Account ID
- 通过 Dashboard 连接更简单，无需配置 Secrets
- 两种方式效果相同，Dashboard 方式更直观

### Q2: 可以同时部署到 GitHub Pages 和 Cloudflare Pages 吗？

**A**: 可以！
- GitHub Pages：通过 GitHub Actions 自动部署
- Cloudflare Pages：通过 Dashboard 连接自动部署
- 两个互不影响，都会自动更新

### Q3: 如果构建失败怎么办？

**A**: 
1. 在 Cloudflare Dashboard 查看构建日志
2. 检查环境变量是否正确设置
3. 确认构建命令正确
4. 参考 `CLOUDFLARE_BUILD_OPTIMIZATION.md` 解决内存问题

### Q4: 如何禁用自动部署？

**A**: 
在 Cloudflare Dashboard：
1. Settings → Builds & deployments
2. 关闭 **Automatic deployments**

---

## 相关文档

- `CLOUDFLARE_SETUP.md`：详细设置指南
- `CLOUDFLARE_ENV_VARS.md`：环境变量说明
- `DEPLOYMENT_PATHS.md`：路径配置说明
- `CLOUDFLARE_BUILD_OPTIMIZATION.md`：构建优化指南

---

## 总结

完成上述步骤后：
- ✅ 推送代码到 GitHub
- ✅ Cloudflare 自动检测并部署
- ✅ 无需手动操作
- ✅ 2-3 分钟后网站自动更新

**现在就去 Cloudflare Dashboard 连接你的 GitHub 仓库吧！** 🚀
