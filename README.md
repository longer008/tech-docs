# 技术面试知识库

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VitePress](https://img.shields.io/badge/Built%20with-VitePress-646CFF.svg)](https://vitepress.dev/)
[![GitHub Stars](https://img.shields.io/github/stars/longer008/tech-docs.svg)](https://github.com/longer008/tech-docs/stargazers)

> 一个面向前端、后端、数据库、DevOps、AI 面试准备的系统化知识库，兼顾八股整理、原理梳理、实战示例与学习路线。

## 项目定位

**技术面试知识库** 用于帮助开发者围绕“面试准备 + 知识复盘 + 日常速查”三个场景建立统一资料库。

项目当前基于 VitePress 构建，核心内容集中在 [`docs/`](docs) 目录，根目录文档主要承担以下职责：

- 项目介绍与快速上手
- 部署方案说明
- 路径、环境变量、Cloudflare 相关问题排查
- 插件与自定义组件说明
- 项目级开发记录

## 核心特点

### 内容覆盖完整

- **多技术栈覆盖**：前端、后端、数据库、DevOps、AI 面试与全栈主题
- **多种阅读形态**：概览文档、深度专题、速查表、题库、学习计划
- **兼顾原理与实践**：不仅整理概念，也提供运行思路、配置示例和实战经验

### 适合面试准备

- **冲刺式学习**：提供 10 天冲刺计划与快速准备清单
- **结构化复习**：按技术方向、主题层级拆分文档
- **可持续维护**：文档长期累积，适合作为个人知识库持续迭代

### 工程化文档站点

- **VitePress 驱动**：支持静态构建、主题扩展与导航配置
- **组件与插件扩展**：支持 Mermaid、KaTeX、图片缩放、进度条等增强能力
- **双部署场景**：兼容 GitHub Pages 与 Cloudflare Pages

## 快速开始

### 环境要求

- Node.js >= 16
- pnpm >= 8
- Windows / macOS / Linux 均可

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/longer008/tech-docs.git
cd tech-docs

# 安装依赖
pnpm install
```

### 本地开发

```bash
# 启动开发环境
pnpm docs:dev

# 构建站点
pnpm docs:build

# 本地预览构建结果
pnpm docs:preview
```

默认开发地址通常为 `http://localhost:5173`。

## 目录结构

```text
tech-docs/
├── docs/                      # 文档内容与 VitePress 站点源码
├── README.md                  # 项目总览与使用入口
├── AGENTS.md                  # 项目开发记录与维护约束
├── CLOUDFLARE_DEPLOYMENT.md   # Cloudflare 统一部署说明主入口
├── DEPLOYMENT_PATHS.md        # GitHub / Cloudflare 路径差异说明
├── WRANGLER_DEPLOYMENT.md     # Wrangler CLI 部署说明
├── CUSTOM_COMPONENTS_GUIDE.md # 自定义组件说明
└── PLUGIN_RECOMMENDATIONS.md  # VitePress 插件建议
```

## 文档主入口

如果你是首次进入项目，建议按下面顺序阅读：

1. [`README.md`](README.md)：了解项目定位、结构与常用命令
2. [`docs/index.md`](docs/index.md)：进入知识库首页
3. [`docs/quick-start/`](docs/quick-start)：查看快速准备与学习规划
4. [`docs/frontend/`](docs/frontend) / [`docs/backend/`](docs/backend) / [`docs/database/`](docs/database) / [`docs/devops/`](docs/devops)：按方向深入

## 根目录文档索引

### 项目与维护说明

- [`README.md`](README.md)：项目总览、快速开始、目录说明
- [`AGENTS.md`](AGENTS.md)：项目开发记录、维护约束、历史优化记录

### 部署与运维说明

- [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md)：Cloudflare 统一部署说明主入口，优先阅读
- [`WRANGLER_DEPLOYMENT.md`](WRANGLER_DEPLOYMENT.md)：Wrangler CLI 手动部署补充说明
- [`DEPLOYMENT_PATHS.md`](DEPLOYMENT_PATHS.md)：GitHub Pages 与 Cloudflare Pages 的 base 路径差异说明

### VitePress 扩展说明

- [`CUSTOM_COMPONENTS_GUIDE.md`](CUSTOM_COMPONENTS_GUIDE.md)：自定义组件设计与接入说明
- [`PLUGIN_RECOMMENDATIONS.md`](PLUGIN_RECOMMENDATIONS.md)：插件选型建议与扩展方向

## 推荐阅读路径

### 路径一：准备面试

- [`docs/quick-start/interview-prep-checklist.md`](docs/quick-start/interview-prep-checklist.md)
- [`docs/quick-start/interview-study-plan.md`](docs/quick-start/interview-study-plan.md)
- [`docs/sprint-plan/day01-js-java-core.md`](docs/sprint-plan/day01-js-java-core.md)

### 路径二：系统补基础

- [`docs/frontend/index.md`](docs/frontend/index.md)
- [`docs/backend/index.md`](docs/backend/index.md)
- [`docs/database/README.md`](docs/database/README.md)
- [`docs/devops/index.md`](docs/devops/index.md)

### 路径三：搭建与维护站点

- [`docs/.vitepress/config.mts`](docs/.vitepress/config.mts)
- [`CUSTOM_COMPONENTS_GUIDE.md`](CUSTOM_COMPONENTS_GUIDE.md)
- [`PLUGIN_RECOMMENDATIONS.md`](PLUGIN_RECOMMENDATIONS.md)
- [`docs/vitepress-plugins.md`](docs/vitepress-plugins.md)

## 常用命令

```bash
pnpm docs:dev          # 本地开发
pnpm docs:build        # 标准构建（默认 GitHub Pages 路径）
pnpm docs:build:cf     # Cloudflare 构建（根路径）
pnpm docs:preview      # 本地预览
pnpm deploy            # Wrangler 部署到 Cloudflare Pages
pnpm deploy:only       # 仅部署已构建产物
```

## 部署说明概览

### GitHub Pages

- 默认使用 `/tech-docs/` 作为 `base`
- 通常直接执行 `pnpm docs:build`
- 适合仓库级静态站点托管

### Cloudflare Pages

- 使用 `/` 作为 `base`
- 可通过 `VITE_BASE_PATH=/` 覆盖构建路径
- 推荐优先阅读 [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md)

### 路径差异排查

若出现资源地址异常、样式 404 或图片 404，优先阅读：

- [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md)
- [`DEPLOYMENT_PATHS.md`](DEPLOYMENT_PATHS.md)
- [`WRANGLER_DEPLOYMENT.md`](WRANGLER_DEPLOYMENT.md)

## 技术栈

### 站点与构建

- [VitePress](https://vitepress.dev/)
- [Vue 3](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [pnpm](https://pnpm.io/)

### 插件与增强能力

- [Mermaid](https://mermaid.js.org/)
- [KaTeX](https://katex.org/)
- [UnoCSS](https://unocss.dev/)
- [medium-zoom](https://github.com/francoischalifour/medium-zoom)

## 适用人群

- 准备校招、社招技术面试的开发者
- 想建立长期知识库与复习体系的工程师
- 正在维护 VitePress 技术文档站点的开发者
- 希望沉淀前后端与基础设施文档的团队

## 贡献与维护建议

### 内容贡献

- 补充遗漏知识点
- 优化已有文档结构与表达
- 增加更贴近真实场景的代码示例
- 修正过期链接、配置或部署说明

### 修改建议

- 优先更新已有文档，而不是新增重复文档
- 新增、删除或重命名文档后，同步更新导航配置
- 若变更部署方式，请同步修改相关根目录说明文档

## 相关链接

- 仓库地址：[https://github.com/longer008/tech-docs](https://github.com/longer008/tech-docs)
- GitHub Pages：[https://longer008.github.io/tech-docs/](https://longer008.github.io/tech-docs/)
- Cloudflare Pages：`https://tech-docs.pages.dev`

## 许可证

本项目采用 MIT License。
