# Docker 完全指南

> Docker 容器化技术完全指南 | 更新时间：2025-02

## 目录

- [Docker 基础](#docker-基础)
- [镜像管理](#镜像管理)
- [容器管理](#容器管理)
- [数据管理](#数据管理)
- [网络管理](#网络管理)
- [Dockerfile 最佳实践](#dockerfile-最佳实践)
- [Docker Compose](#docker-compose)
- [性能优化](#性能优化)
- [实战案例](#实战案例)

---

## Docker 基础

### 1. Docker 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker 架构                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                   Docker Client                      │   │
│   │              docker build, run, pull                │   │
│   └───────────────────────┬─────────────────────────────┘   │
│                           │ REST API                        │
│   ┌───────────────────────▼─────────────────────────────┐   │
│   │                   Docker Daemon                      │   │
│   │                     dockerd                          │   │
│   └───────────────────────┬─────────────────────────────┘   │
│                           │                                  │
│   ┌───────────┬───────────┴───────────┬───────────┐        │
│   │  Images   │     Containers        │  Networks │        │
│   └───────────┘                       └───────────┘        │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                   Docker Registry                    │   │
│   │               Docker Hub, 私有仓库                   │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. 核心概念

| 概念 | 说明 | 类比 |
|------|------|------|
| Image（镜像） | 只读模板，包含运行应用所需的一切 | 类的定义 |
| Container（容器） | 镜像的运行实例 | 类的实例 |
| Dockerfile | 构建镜像的脚本 | 构建配置 |
| Registry（仓库） | 存储和分发镜像 | GitHub |
| Volume（数据卷） | 持久化存储 | 外部硬盘 |
| Network（网络） | 容器间通信 | 局域网 |

### 3. 容器 vs 虚拟机

```
容器：                          虚拟机：
┌─────────────────────┐        ┌─────────────────────┐
│   App A   │  App B  │        │   App A   │  App B  │
├───────────┼─────────┤        ├───────────┼─────────┤
│   Bins/Libs         │        │   Bins/Libs         │
├─────────────────────┤        ├─────────────────────┤
│   Docker Engine     │        │  Guest OS │ Guest OS│
├─────────────────────┤        ├─────────────────────┤
│   Host OS           │        │   Hypervisor        │
├─────────────────────┤        ├─────────────────────┤
│   Infrastructure    │        │   Host OS           │
└─────────────────────┘        ├─────────────────────┤
                               │   Infrastructure    │
                               └─────────────────────┘
```

| 特性 | 容器 | 虚拟机 |
|------|------|--------|
| 启动速度 | 秒级 | 分钟级 |
| 资源占用 | MB | GB |
| 性能 | 接近原生 | 有损耗 |
| 隔离性 | 进程级 | 系统级 |
| 可移植性 | 高 | 中 |

---

## 镜像管理

### 1. 镜像基础命令

```bash
# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx:latest
docker pull nginx:1.21

# 查看本地镜像
docker images
docker image ls

# 查看镜像详情
docker inspect nginx:latest

# 查看镜像历史
docker history nginx:latest

# 删除镜像
docker rmi nginx:latest
docker image rm nginx:latest

# 删除所有未使用的镜像
docker image prune -a

# 导出镜像
docker save nginx:latest -o nginx.tar

# 导入镜像
docker load -i nginx.tar

# 给镜像打标签
docker tag nginx:latest myregistry.com/nginx:v1.0
```

### 2. 构建镜像

```dockerfile
# Dockerfile 示例
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动命令
CMD ["node", "server.js"]
```

```bash
# 构建镜像
docker build -t myapp:v1.0 .

# 使用构建参数
docker build --build-arg NODE_VERSION=16 -t myapp:v1.0 .

# 不使用缓存构建
docker build --no-cache -t myapp:v1.0 .

# 指定 Dockerfile
docker build -f Dockerfile.prod -t myapp:v1.0 .
```

### 3. 多阶段构建

```dockerfile
# 多阶段构建示例（减小镜像体积）
# 阶段 1：构建
FROM node:16 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 阶段 2：运行
FROM node:16-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

---

## 容器管理

### 1. 容器基础命令

```bash
# 运行容器
docker run nginx
docker run -d nginx                    # 后台运行
docker run -d --name mynginx nginx     # 指定名称
docker run -d -p 8080:80 nginx         # 端口映射
docker run -d -v /data:/app nginx      # 挂载数据卷
docker run -d -e NODE_ENV=prod nginx   # 设置环境变量

# 查看容器
docker ps                              # 运行中的容器
docker ps -a                           # 所有容器
docker ps -q                           # 只显示容器 ID

# 查看容器详情
docker inspect mynginx

# 查看容器日志
docker logs mynginx
docker logs -f mynginx                 # 实时查看
docker logs --tail 100 mynginx         # 最后 100 行

# 进入容器
docker exec -it mynginx bash
docker exec -it mynginx sh

# 停止容器
docker stop mynginx
docker stop $(docker ps -q)            # 停止所有容器

# 启动容器
docker start mynginx

# 重启容器
docker restart mynginx

# 删除容器
docker rm mynginx
docker rm -f mynginx                   # 强制删除
docker rm $(docker ps -aq)             # 删除所有容器

# 查看容器资源使用
docker stats
docker stats mynginx

# 查看容器进程
docker top mynginx

# 复制文件
docker cp mynginx:/app/log.txt ./
docker cp ./config.json mynginx:/app/
```

### 2. 容器生命周期

```
┌─────────────────────────────────────────────────────────────┐
│                    容器生命周期                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   docker create                                              │
│        │                                                     │
│        ▼                                                     │
│   ┌─────────┐  docker start   ┌─────────┐                  │
│   │ Created │ ───────────────▶ │ Running │                  │
│   └─────────┘                  └─────────┘                  │
│        ▲                            │                        │
│        │                            │ docker stop/kill       │
│        │                            ▼                        │
│        │                       ┌─────────┐                  │
│        │                       │ Stopped │                  │
│        │                       └─────────┘                  │
│        │                            │                        │
│        │                            │ docker rm              │
│        │                            ▼                        │
│        │                       ┌─────────┐                  │
│        └───────────────────────│ Deleted │                  │
│                                └─────────┘                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 数据管理

### 1. Volume（数据卷）

```bash
# 创建数据卷
docker volume create mydata

# 查看数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect mydata

# 使用数据卷
docker run -d -v mydata:/app/data nginx

# 删除数据卷
docker volume rm mydata

# 删除所有未使用的数据卷
docker volume prune
```

### 2. Bind Mount（绑定挂载）

```bash
# 挂载主机目录
docker run -d -v /host/path:/container/path nginx

# 只读挂载
docker run -d -v /host/path:/co
et
docker network create --driver bridge mynet

# 查看网络
docker network ls

# 查看网络详情
docker network inspect mynet

# 连接容器到网络
docker network connect mynet mynginx

# 断开容器网络
docker network disconnect mynet mynginx

# 删除网络
docker network rm mynet

# 删除所有未使用的网络
docker network prune
```

### 3. 容器互联

```bash
# 创建自定义网络
docker network create myapp-net

# 启动数据库容器
docker run -d \
  --name mysql \
  --network myapp-net \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8.0

# 启动应用容器（可以通过容器名访问数据库）
docker run -d \
  --name app \
  --network myapp-net \
  -e DB_HOST=mysql \
  myapp:v1.0
```

---

## Dockerfile 最佳实践

### 1. 优化镜像体积

```dockerfile
# ❌ 不好的做法
FROM ubuntu:20.04
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get install -y python3-pip
COPY . /app
RUN pip3 install -r requirements.txt

# ✅ 好的做法
FROM python:3.9-slim

# 合并 RUN 命令，减少层数
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 先复制依赖文件，利用缓存
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 最后复制应用代码
COPY . .

CMD ["python3", "app.py"]
```

### 2. 使用 .dockerignore

```.dockerignore
# .dockerignore 文件
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.DS_Store
*.log
dist
coverage
```

### 3. 多阶段构建

```dockerfile
# 前端应用多阶段构建
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4. 安全最佳实践

```dockerfile
# 使用非 root 用户
FROM node:16-alpine

# 创建应用用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# 复制文件并设置权限
COPY --chown=nodejs:nodejs . .

# 切换到非 root 用户
USER nodejs

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Docker Compose

### 1. 基础配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Web 应用
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
      - redis
    networks:
      - app-network
    volumes:
      - ./logs:/app/logs

  # 数据库
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=secret
      - MYSQL_DATABASE=myapp
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - app-network

  # 缓存
  redis:
    image: redis:alpine
    networks:
      - app-network

volumes:
  db-data:

networks:
  app-network:
    driver: bridge
```

### 2. Compose 命令

```bash
# 启动服务
docker-compose up
docker-compose up -d                    # 后台运行
docker-compose up --build               # 重新构建

# 停止服务
docker-compose stop
docker-compose down                     # 停止并删除容器
docker-compose down -v                  # 同时删除数据卷

# 查看服务
docker-compose ps
docker-compose logs
docker-compose logs -f web              # 实时查看日志

# 执行命令
docker-compose exec web
 bash
docker-compose run web npm test

# 扩展服务
docker-compose up -d --scale web=3
```

### 3. 完整示例

```yaml
# 生产环境 docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
    networks:
      - frontend
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis
    networks:
      - frontend
      - backend
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
      - POSTGRES_DB=myapp
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - backend
    secrets:
      - db_password
    restart: unless-stopped

  redis:
    image: redis:alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - backend
    restart: unless-stopped

volumes:
  db-data:
  redis-data:

networks:
  frontend:
  backend:

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

---

## 性能优化

### 1. 镜像优化

```dockerfile
# 使用更小的基础镜像
FROM node:16-alpine  # 而不是 node:16

# 使用多阶段构建
FROM golang:1.19 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o app

FROM scratch
COPY --from=builder /app/app /app
CMD ["/app"]
```

### 2. 构建缓存优化

```dockerfile
# 优化层顺序，将变化少的放前面
FROM node:16-alpine

WORKDIR /app

# 1. 先复制依赖文件（变化少）
COPY package*.json ./
RUN npm ci --only=production

# 2. 再复制应用代码（变化多）
COPY . .

CMD ["node", "server.js"]
```

### 3. 资源限制

```bash
# 限制 CPU 和内存
docker run -d \
  --cpus="1.5" \
  --memory="512m" \
  --memory-swap="1g" \
  nginx

# Docker Compose 中限制资源
services:
  web:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

---

## 实战案例

### 1. Node.js 应用部署

```dockerfile
# Dockerfile
FROM node:16-alpine

# 安装 dumb-init（处理信号）
RUN apk add --no-cache dumb-init

# 创建应用用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# 复制依赖文件
COPY --chown=nodejs:nodejs package*.json ./

# 安装依赖
RUN npm ci --only=production && \
    npm cache clean --force

# 复制应用代码
COPY --chown=nodejs:nodejs . .

# 切换用户
USER nodejs

EXPOSE 3000

# 使用 dumb-init 启动
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

```yaml
# doc

    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./gateway/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - user-service
      - product-service
    networks:
      - frontend

  # 用户服务
  user-service:
    build: ./services/user
    environment:
      - DB_HOST=user-db
    depends_on:
      - user-db
    networks:
      - frontend
      - backend
    deploy:
      replicas: 2

  # 产品服务
  product-service:
    build: ./services/product
    environment:
      - DB_HOST=product-db
    depends_on:
      - product-db
    networks:
      - frontend
      - backend
    deploy:
      replicas: 2

  # 用户数据库
  user-db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=users
      - POSTGRES_PASSWORD=secret
    volumes:
      - user-db-data:/var/lib/postgresql/data
    networks:
      - backend

  # 产品数据库
  product-db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=products
      - POSTGRES_PASSWORD=secret
    volumes:
      - product-db-data:/var/lib/postgresql/data
    networks:
      - backend

volumes:
  user-db-data:
  product-db-data:

networks:
  frontend:
  backend:
```

---

## 常见问题

### Q1：如何减小镜像体积？

1. 使用更小的基础镜像（alpine）
2. 使用多阶段构建
3. 合并 RUN 命令
4. 清理缓存和临时文件
5. 使用 .dockerignore

### Q2：容器如何持久化数据？

1. 使用 Volume（推荐）
2. 使用 Bind Mount
3. 使用外部存储（NFS、云存储）

### Q3：如何优化构建速度？

1. 利用构建缓存
2. 优化 Dockerfile 层顺序
3. 使用 BuildKit
4. 使用镜像缓存

---

## 参考资料

### 官方资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Dockerfile 最佳实践](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

### 学习资源

- [Docker 从入门到实践](https://yeasy.gitbook.io/docker_practice/)
- [Play with Docker](https://labs.play-with-docker.com/)

### 工具推荐

- [Dive](https://github.com/wagoodman/dive) - 镜像分析工具
- [Hadolint](https://github.com/hadolint/hadolint) - Dockerfile 检查工具
- [D
ocker Slim](https://github.com/docker-slim/docker-slim) - 镜像优化工具
