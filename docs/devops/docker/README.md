# Docker

## 元信息
- 定位与场景：容器化与镜像构建。
- 版本范围：以官方稳定版本为准。
- 相关生态：Docker Compose、Kubernetes。

## 研究记录（Exa）
- 查询 1："Docker interview questions 2024 2025"
- 查询 2："Docker best practices documentation"
- 查询 3："Docker multi-stage build"
- 来源摘要：以官方构建最佳实践为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：镜像与容器的区别？
  - A：镜像是只读模板，容器是运行实例。
- Q2：Dockerfile 分层与缓存原理？
  - A：每条指令生成一层，缓存可复用。
- Q3：Volume 与 Bind Mount 的差异？
  - A：Volume 由 Docker 管理；Bind Mount 绑定宿主路径。
- Q4：多阶段构建的作用？
  - A：降低镜像体积，分离构建与运行。
- Q5：常见网络模式？
  - A：bridge/host/none。

### 进阶/场景题
- Q1：如何做镜像安全加固？
  - A：使用最小基础镜像、定期重建。
- Q2：如何优化构建速度？
  - A：利用缓存与多阶段构建。

### 避坑指南
- 在镜像中保存敏感信息。
- 镜像过大导致部署慢。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Docker 官方文档：https://docs.docker.com/
- 构建最佳实践：https://docs.docker.com/build/building/best-practices/
- 多阶段构建：https://docs.docker.com/build/building/multi-stage/
```

### 常用代码片段
```Dockerfile
# syntax=docker/dockerfile:1
FROM node:lts AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

### 版本差异
- 关注构建体系与镜像格式的更新。
- 升级以官方 Release Notes 为准。
