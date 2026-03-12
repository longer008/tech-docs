# Wrangler 部署指南

> 本文档说明如何通过 Wrangler CLI 将当前项目发布到 Cloudflare Pages，并与 [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md) 中的统一部署说明形成互补。

## 文档定位

[`WRANGLER_DEPLOYMENT.md`](WRANGLER_DEPLOYMENT.md) 适合以下场景：

- 你希望在本地手动执行发布
- 你想先构建再上传产物
- 你需要验证 Cloudflare Pages 的实际发布结果
- 你不想每次都依赖 Dashboard 自动构建

如果你只是要了解当前项目的 Cloudflare 主流程、环境变量、路径规则与常见故障，优先阅读 [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md)。

如果你遇到 **base 路径错误** 或 **资源 404**，再结合阅读 [`DEPLOYMENT_PATHS.md`](DEPLOYMENT_PATHS.md)。

## 当前脚本基线

请以 [`package.json`](package.json) 中的实际脚本为准：

```json
{
  "scripts": {
    "docs:build": "vitepress build docs",
    "docs:build:cf": "cross-env NODE_OPTIONS='--max-old-space-size=3072' VITE_BASE_PATH=/ vitepress build docs",
    "deploy": "cross-env VITE_BASE_PATH=/ pnpm docs:build && npx wrangler pages deploy docs/.vitepress/dist --project-name=tech-docs",
    "deploy:only": "cross-env VITE_BASE_PATH=/ npx wrangler pages deploy docs/.vitepress/dist --project-name=tech-docs"
  }
}
```

因此，本项目当前的 Wrangler 部署核心结论是：

- Cloudflare 构建使用根路径 `/`
- 发布前必须确保构建结果与 Cloudflare 路径一致
- 不应继续参考过时的旧脚本示例

## 使用前准备

### 1. 安装依赖

```bash
pnpm install
```

### 2. 登录 Cloudflare

```bash
pnpm wrangler login
```

首次登录会打开浏览器，你需要在 Cloudflare 账号中授权 Wrangler。

### 3. 确认项目名称

当前部署命令默认项目名为：

```text
tech-docs
```

如果你的 Cloudflare Pages 项目名不同，需要同步修改 [`package.json`](package.json) 中的部署命令。

## 推荐使用方式

### 方式一：一键部署

```bash
pnpm deploy
```

该命令会完成以下动作：

1. 设置 `VITE_BASE_PATH=/`
2. 执行 `pnpm docs:build`
3. 上传 [`docs/.vitepress/dist/`](docs/.vitepress/dist) 到 Cloudflare Pages

适用场景：

- 本地改完文档后直接发布
- 不需要保留单独的“构建”和“上传”步骤

### 方式二：分步构建与部署

```bash
pnpm docs:build:cf
pnpm deploy:only
```

适用场景：

- 你想先检查构建产物
- 你想确认 HTML 中的资源路径是否正确
- 你要重复上传同一份产物

## 推荐工作流

### 日常手动发布

```bash
pnpm docs:build:cf
pnpm deploy:only
```

### 快速发布

```bash
pnpm deploy
```

### 发布前检查

建议至少检查以下内容：

- 文档是否能在本地正常构建
- Cloudflare 构建路径是否为 `/`
- 产物目录是否为 [`docs/.vitepress/dist/`](docs/.vitepress/dist)
- 站点资源路径是否没有携带 `/tech-docs/`

## 如何验证构建产物

你可以在本地构建后检查生成结果，重点关注首页 HTML 中的静态资源路径。

### 预期正确结果

Cloudflare Pages 构建时，资源路径应该类似：

```html
<link rel="stylesheet" href="/assets/style.css">
<script type="module" src="/assets/app.js"></script>
<img src="/logo.svg">
```

### 常见错误结果

如果你看到类似下面的路径，说明仍然使用了 GitHub Pages 的子路径模式：

```html
<link rel="stylesheet" href="/tech-docs/assets/style.css">
<script type="module" src="/tech-docs/assets/app.js"></script>
<img src="/tech-docs/logo.svg">
```

这类问题通常与以下内容有关：

- 没有设置 `VITE_BASE_PATH=/`
- 使用了错误的构建命令
- 复用了旧的构建产物

## 与 Dashboard 自动部署的区别

| 方式 | 优点 | 缺点 | 适用场景 |
| --- | --- | --- | --- |
| Dashboard 连接 GitHub | 简单、自动、维护成本低 | 对本地发布控制较弱 | 日常默认方案 |
| Wrangler CLI | 灵活、可控、适合本地手动发布 | 需要本地执行命令 | 手动发布、临时验证 |
| GitHub Actions 到 Cloudflare | 可接入 CI/CD | 配置复杂、维护成本高 | 团队自动化扩展 |

## 常见问题

### 1. `pnpm wrangler login` 无法使用

先确认 Wrangler 已通过依赖安装成功，并重新执行：

```bash
pnpm install
pnpm wrangler login
```

### 2. 发布后资源 404

优先排查以下几点：

1. 是否使用了 `pnpm docs:build:cf` 或 `pnpm deploy`
2. 是否已经设置 `VITE_BASE_PATH=/`
3. 生成的 HTML 中是否仍然包含 `/tech-docs/`

相关文档：

- [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md)
- [`DEPLOYMENT_PATHS.md`](DEPLOYMENT_PATHS.md)

### 3. Cloudflare 项目名不匹配

如果 Pages 项目不是 `tech-docs`，需要把 [`package.json`](package.json) 中这两个命令同步改掉：

- `deploy`
- `deploy:only`

### 4. 构建时内存不足

当前项目已经提供了 Cloudflare 构建专用命令：

```bash
pnpm docs:build:cf
```

如果仍然存在问题，请继续参考 [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md) 中关于内存限制与构建配置的统一说明。

## 维护建议

后续如果继续保留 Wrangler 方案，建议遵循下面的维护方式：

1. 先更新 [`package.json`](package.json) 中的真实脚本
2. 再同步更新本文档的命令示例
3. 与 [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md) 保持一致的路径与环境变量口径
4. 不要在本文档中重复维护 Dashboard 的完整 UI 配置步骤

## 相关文档

- [`README.md`](README.md)
- [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md)
- [`DEPLOYMENT_PATHS.md`](DEPLOYMENT_PATHS.md)

## 结论

Wrangler CLI 在当前项目中是一个**补充型部署方案**：适合手动发布、快速验证和本地控制；如果没有特殊需求，Cloudflare Dashboard 自动部署仍然是默认优先选择。
