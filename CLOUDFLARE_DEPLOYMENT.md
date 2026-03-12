# Cloudflare Pages 部署总说明

> [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md) 现在作为根目录中 Cloudflare 相关说明的统一入口，整合原先分散在快速开始、完整配置、环境变量、404 排查、构建优化、路径差异和 Wrangler 部署中的核心内容。

## 文档目标

本文档统一回答以下问题：

1. 当前项目应如何部署到 Cloudflare Pages
2. Cloudflare 与 GitHub Pages 的路径差异如何处理
3. 构建命令、环境变量、内存限制应如何设置
4. 资源 404、构建失败、项目名不匹配时该如何排查
5. 什么时候适合用 Cloudflare Dashboard，什么时候适合用 Wrangler CLI

如果你只需要一个结论：

- **默认推荐**：使用 Cloudflare Dashboard 直接连接 GitHub
- **本地手动发布**：使用 [`package.json`](package.json) 中的 Wrangler 相关脚本
- **路径核心原则**：Cloudflare Pages 使用 `/`，GitHub Pages 使用 `/tech-docs/`

## 当前推荐方案

### 方案一：Cloudflare Dashboard 连接 GitHub（默认推荐）

这是当前项目最推荐的方式，原因如下：

- 配置链路最短，适合 VitePress 静态文档站点
- 能被 Cloudflare 正确识别为 Pages 项目
- 推送到 `main` 分支后可自动构建与发布
- 支持 PR 预览部署
- 不需要额外维护 GitHub Secrets 与 Cloudflare Action 配置

### 推荐配置

在 Cloudflare Pages 项目中建议使用以下设置：

```yaml
项目名称: tech-docs
生产分支: main
框架预设: None
构建命令: NODE_OPTIONS='--max-old-space-size=3072' pnpm docs:build
构建输出目录: docs/.vitepress/dist
根目录: / (留空)
```

推荐环境变量：

```bash
NODE_VERSION=20
NODE_OPTIONS=--max-old-space-size=3072
VITE_BASE_PATH=/
```

这些设置分别解决以下问题：

- `NODE_VERSION=20`：统一 Cloudflare 构建环境版本
- `NODE_OPTIONS=--max-old-space-size=3072`：缓解大型文档构建时的内存不足
- `VITE_BASE_PATH=/`：确保生成的静态资源路径是 `/assets/...`，而不是 `/tech-docs/assets/...`

## 当前项目中的真实脚本基线

所有 Cloudflare 相关说明都应以 [`package.json`](package.json) 中的现有脚本为准：

```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:build:cf": "cross-env NODE_OPTIONS='--max-old-space-size=3072' VITE_BASE_PATH=/ vitepress build docs",
    "docs:preview": "vitepress preview docs",
    "deploy": "cross-env VITE_BASE_PATH=/ pnpm docs:build && npx wrangler pages deploy docs/.vitepress/dist --project-name=tech-docs",
    "deploy:only": "cross-env VITE_BASE_PATH=/ npx wrangler pages deploy docs/.vitepress/dist --project-name=tech-docs"
  }
}
```

从这些脚本可以得到当前项目的四个关键结论：

1. 标准构建 [`package.json`](package.json) 中的 `docs:build` 默认服务于 GitHub Pages
2. Cloudflare 构建需要显式设置 `VITE_BASE_PATH=/`
3. Cloudflare 手动部署依赖 Wrangler CLI，但构建产物仍然来自 [`docs/.vitepress/dist/`](docs/.vitepress/dist)
4. 后续若脚本变更，应优先修改 [`package.json`](package.json)，再同步修改本文档

## 快速开始

### 最短路径部署流程

如果你第一次部署当前项目到 Cloudflare Pages，按下面流程即可：

1. 登录 Cloudflare Dashboard
2. 进入 **Workers & Pages**
3. 选择 **Create application** → **Pages** → **Connect to Git**
4. 选择当前仓库 `tech-docs`
5. 配置构建命令与输出目录
6. 配置环境变量 `NODE_VERSION`、`NODE_OPTIONS`、`VITE_BASE_PATH`
7. 保存并开始首次部署

### 最小可用配置

```yaml
构建命令: NODE_OPTIONS='--max-old-space-size=3072' pnpm docs:build
构建输出目录: docs/.vitepress/dist
环境变量:
  NODE_VERSION: 20
  NODE_OPTIONS: --max-old-space-size=3072
  VITE_BASE_PATH: /
```

### 自动部署结果

配置完成后，Cloudflare 会在以下场景自动部署：

- 向 `main` 分支推送新提交
- 创建或更新 Pull Request 预览

## 路径与环境变量说明

### 为什么 Cloudflare Pages 必须使用 `/`

当前项目需要同时兼容两个部署目标：

- GitHub Pages：部署在子路径 [`/tech-docs/`](README.md:163)
- Cloudflare Pages：部署在根路径 `/`

因此两者不能共用同一个 `base` 值。

### 当前项目的 base 规则

- GitHub Pages 构建：默认使用 `/tech-docs/`
- Cloudflare Pages 构建：通过 `VITE_BASE_PATH=/` 覆盖为 `/`

### 正确结果示例

Cloudflare Pages 构建后的 HTML 中，资源路径应类似：

```html
<link rel="stylesheet" href="/assets/style.css">
<script type="module" src="/assets/app.js"></script>
<img src="/logo.svg">
```

如果你看到下面这种结果，就说明构建路径仍然错误：

```html
<link rel="stylesheet" href="/tech-docs/assets/style.css">
<script type="module" src="/tech-docs/assets/app.js"></script>
```

### 环境变量的作用链路

```text
推送代码
  ↓
Cloudflare 开始构建
  ↓
读取环境变量
  - NODE_VERSION=20
  - NODE_OPTIONS=--max-old-space-size=3072
  - VITE_BASE_PATH=/
  ↓
执行构建命令
  NODE_OPTIONS='--max-old-space-size=3072' pnpm docs:build
  ↓
VitePress 根据 VITE_BASE_PATH 生成资源路径
  ↓
产物输出到 docs/.vitepress/dist
  ↓
Cloudflare 发布静态资源
```

## 构建与发布方式

### 方式一：Cloudflare Dashboard 自动部署

这是日常默认方式，适合：

- 文档改动主要通过 Git 提交触发发布
- 希望使用 Cloudflare 提供的自动预览能力
- 不想在本地维护复杂部署步骤

### 方式二：Wrangler CLI 手动部署

适合以下场景：

- 你希望在本地手动控制发布时间
- 你需要先构建，再单独上传产物
- 你要验证本地构建后的实际 Pages 发布结果

常用命令：

```bash
pnpm deploy
```

或者分步执行：

```bash
pnpm docs:build:cf
pnpm deploy:only
```

Wrangler 模式下的关键注意点：

- 发布前必须确认构建使用的是 `VITE_BASE_PATH=/`
- 当前默认 Pages 项目名是 `tech-docs`
- 如果 Cloudflare 项目名变化，需要同步修改 [`package.json`](package.json) 中的 `deploy` 与 `deploy:only`

## 常见问题排查

### 1. 资源文件 404

这是当前项目里最常见的问题。优先检查以下三点：

1. 是否使用了 Cloudflare 对应的构建方式，如 `pnpm docs:build:cf` 或 `pnpm deploy`
2. 是否已经设置 `VITE_BASE_PATH=/`
3. 生成的 HTML 中是否仍然包含 `/tech-docs/`

快速检查方法：打开 [`docs/.vitepress/dist/index.html`](docs/.vitepress/dist/index.html) 并确认资源引用是否为 `/assets/...`

### 2. Cloudflare 构建内存不足

如果构建日志中出现内存溢出、heap out of memory 或构建被中断，优先检查：

- 是否设置了 `NODE_OPTIONS=--max-old-space-size=3072`
- Cloudflare 构建命令是否仍然包含该参数
- Node 版本是否统一到 20

推荐构建命令：

```bash
NODE_OPTIONS='--max-old-space-size=3072' pnpm docs:build
```

### 3. `A compatibility_date is required when publishing`

这通常说明流程被误判成 Worker 发布而不是 Pages 发布。优先使用 Cloudflare Dashboard 连接 GitHub，可以避免把静态站点误走 Worker 流程。

### 4. Cloudflare 项目名不匹配

如果命令行部署时报项目不存在或项目名不匹配，检查 [`package.json`](package.json) 中以下脚本是否仍然指向正确项目：

- `deploy`
- `deploy:only`

### 5. `cross-env` 命令不存在

说明本地依赖没有安装完整。先执行：

```bash
pnpm install
```

然后再执行 Cloudflare 构建或部署命令。

## 验证清单

### 构建成功应满足

- 构建输出目录是 [`docs/.vitepress/dist/`](docs/.vitepress/dist)
- HTML 中资源地址是 `/assets/...`
- 图片与静态资源路径不包含 `/tech-docs/`
- Cloudflare 构建环境中已设置 `VITE_BASE_PATH=/`

### 本地验证命令

```bash
pnpm docs:build:cf
pnpm deploy:only
```

如果只想检查产物而不立即发布，也至少应确认 [`docs/.vitepress/dist/index.html`](docs/.vitepress/dist/index.html) 中的路径是否正确。

## 历史方案与边界说明

### GitHub Actions 自动部署到 Cloudflare Pages

该方案不是不能用，而是对当前项目来说不是首选。原因包括：

- 配置复杂度更高
- 需要维护 Secrets、权限与工作流
- 历史上更容易出现项目识别、Wrangler 参数和路径配置不一致的问题

如果后续项目确实需要统一 CI/CD，再单独评估是否恢复该方案。

### `wrangler.toml` 配置

它只在特定 CLI 或自动化方案中才有意义，不是当前项目的默认入口。对于当前仓库，更重要的是保证 [`package.json`](package.json) 中的脚本、Cloudflare Dashboard 的构建命令以及环境变量保持一致。

## 建议的维护方式

后续如再调整 Cloudflare 发布方式，建议按这个顺序维护：

1. 先更新 [`package.json`](package.json) 中的真实脚本
2. 再更新 [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md) 作为统一入口
3. 如果保留其他 Cloudflare 文档，应把它们降级为补充说明，而不是继续各自维护完整主流程
4. 所有 Cloudflare 相关结论都以当前有效脚本和当前有效部署方式为准

## 结论

对于当前项目：

- **默认推荐**：Cloudflare Dashboard 连接 GitHub
- **补充手段**：Wrangler CLI 手动部署
- **关键变量**：`VITE_BASE_PATH=/`
- **关键优化**：`NODE_OPTIONS=--max-old-space-size=3072`
- **关键差异**：GitHub Pages 使用 `/tech-docs/`，Cloudflare Pages 使用 `/`

如果根目录只保留一个 Cloudflare 主说明文件，应优先保留 [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md)。
