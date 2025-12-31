# Docker & Kubernetes 面试题集

> 容器化与容器编排核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. Docker 核心概念

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

| 概念 | 说明 |
|------|------|
| Image | 镜像，只读模板 |
| Container | 容器，镜像的运行实例 |
| Dockerfile | 构建镜像的脚本 |
| Registry | 镜像仓库 |
| Volume | 数据卷，持久化存储 |
| Network | 网络，容器间通信 |

**容器 vs 虚拟机：**
```
容器：                    虚拟机：
┌─────────────────┐      ┌─────────────────┐
│    App A │ App B│      │    App A │ App B│
├──────────┼──────┤      ├──────────┼──────┤
│  Libs A  │Libs B│      │  Libs A  │Libs B│
├──────────┴──────┤      ├──────────┴──────┤
│  Container Engine│      │   Guest OS      │
├─────────────────┤      ├─────────────────┤
│    Host OS      │      │   Hypervisor    │
├─────────────────┤      ├─────────────────┤
│   Hardware      │      │    Host OS      │
└─────────────────┘      ├─────────────────┤
                         │   Hardware      │
                         └─────────────────┘
```

---

#### 2. Dockerfile

```dockerfile
# 基础镜像
FROM node:18-alpine AS builder

# 元数据
LABEL maintainer="dev@example.com"
LABEL version="1.0"

# 设置工作目录
WORKDIR /app

# 复制依赖文件（利用缓存）
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源码
COPY . .

# 构建
RUN npm run build

# 生产阶段（多阶段构建）
FROM node:18-alpine

WORKDIR /app

# 从构建阶段复制产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

# 运行用户
USER node

# 启动命令
CMD ["node", "dist/main.js"]
```

**常用指令：**
| 指令 | 说明 |
|------|------|
| FROM | 基础镜像 |
| WORKDIR | 工作目录 |
| COPY | 复制文件 |
| ADD | 复制文件（支持 URL 和解压） |
| RUN | 执行命令 |
| ENV | 环境变量 |
| ARG | 构建参数 |
| EXPOSE | 暴露端口 |
| VOLUME | 挂载点 |
| USER | 运行用户 |
| CMD | 默认命令（可被覆盖） |
| ENTRYPOINT | 入口点（不易被覆盖） |

**最佳实践：**
```dockerfile
# 1. 使用精简基础镜像
FROM node:18-alpine  # 而不是 node:18

# 2. 多阶段构建减小镜像体积
FROM golang:1.21 AS builder
RUN go build -o app
FROM alpine:3.18
COPY --from=builder /app .

# 3. 合并 RUN 命令
RUN apt-get update && apt-get install -y \
    package1 \
    package2 \
    && rm -rf /var/lib/apt/lists/*

# 4. 利用构建缓存
COPY package*.json ./
RUN npm install
COPY . .

# 5. 使用 .dockerignore
# .dockerignore
node_modules
.git
*.md
```

---

#### 3. Docker 命令

```bash
# 镜像操作
docker build -t myapp:1.0 .
docker build -t myapp:1.0 -f Dockerfile.prod .
docker images
docker rmi image_id
docker pull nginx:latest
docker push myregistry/myapp:1.0
docker tag myapp:1.0 myregistry/myapp:1.0

# 容器操作
docker run -d --name myapp -p 8080:80 nginx
docker run -it --rm ubuntu bash
docker ps
docker ps -a
docker start/stop/restart container_id
docker rm container_id
docker rm -f $(docker ps -aq)  # 删除所有容器

# 日志与调试
docker logs container_id
docker logs -f --tail 100 container_id
docker exec -it container_id sh
docker inspect container_id
docker stats

# 数据卷
docker volume create mydata
docker volume ls
docker run -v mydata:/app/data myapp
docker run -v /host/path:/container/path myapp
docker run -v /host/path:/container/path:ro myapp  # 只读

# 网络
docker network create mynet
docker network ls
docker run --network mynet myapp
docker network connect mynet container_id

# 清理
docker system prune        # 清理无用数据
docker system prune -a     # 包括未使用的镜像
docker volume prune        # 清理无用数据卷
```

---

#### 4. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    image: myapp:1.0
    container_name: myapp-web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15
    container_name: myapp-db
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: myapp-redis
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  db-data:
  redis-data:
```

```bash
# Compose 命令
docker-compose up -d
docker-compose down
docker-compose down -v  # 同时删除数据卷
docker-compose logs -f web
docker-compose exec web sh
docker-compose ps
docker-compose build
docker-compose pull
docker-compose restart web
```

---

### 进阶题

#### 5. Kubernetes 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes 架构                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Control Plane (Master)                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │  API    │ │ etcd    │ │Scheduler│ │Controller│   │   │
│  │  │ Server  │ │         │ │         │ │ Manager │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│  Worker Nodes             │                                  │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Node 1               Node 2               Node 3 │     │
│  │  ┌─────────────┐     ┌─────────────┐            │     │
│  │  │   kubelet   │     │   kubelet   │     ...    │     │
│  │  │ kube-proxy  │     │ kube-proxy  │            │     │
│  │  │ Container   │     │ Container   │            │     │
│  │  │  Runtime    │     │  Runtime    │            │     │
│  │  ├─────────────┤     ├─────────────┤            │     │
│  │  │ Pod │ Pod   │     │ Pod │ Pod   │            │     │
│  │  └─────────────┘     └─────────────┘            │     │
│  └───────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

| 组件 | 说明 |
|------|------|
| API Server | 集群入口，处理 REST 请求 |
| etcd | 分布式 KV 存储，保存集群状态 |
| Scheduler | 调度 Pod 到 Node |
| Controller Manager | 管理控制器（副本、节点等） |
| kubelet | Node 上的代理，管理 Pod |
| kube-proxy | 网络代理，实现 Service |

---

#### 6. K8s 核心资源

**Pod：**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
spec:
  containers:
    - name: myapp
      image: myapp:1.0
      ports:
        - containerPort: 3000
      resources:
        requests:
          memory: "128Mi"
          cpu: "100m"
        limits:
          memory: "256Mi"
          cpu: "500m"
      livenessProbe:
        httpGet:
          path: /health
          port: 3000
        initialDelaySeconds: 10
        periodSeconds: 10
      readinessProbe:
        httpGet:
          path: /ready
          port: 3000
        initialDelaySeconds: 5
        periodSeconds: 5
      env:
        - name: NODE_ENV
          value: "production"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
      volumeMounts:
        - name: config
          mountPath: /app/config
  volumes:
    - name: config
      configMap:
        name: myapp-config
```

**Deployment：**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: myapp:1.0
          ports:
            - containerPort: 3000
```

**Service：**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  type: ClusterIP  # ClusterIP, NodePort, LoadBalancer
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 3000

---
# NodePort
apiVersion: v1
kind: Service
metadata:
  name: myapp-nodeport
spec:
  type: NodePort
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 3000
      nodePort: 30080
```

**Ingress：**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: myapp-service
                port:
                  number: 80
  tls:
    - hosts:
        - myapp.example.com
      secretName: myapp-tls
```

**ConfigMap & Secret：**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
data:
  config.json: |
    {
      "port": 3000,
      "logLevel": "info"
    }

---
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  password: cGFzc3dvcmQ=  # base64 encoded
```

---

#### 7. K8s 命令

```bash
# 集群信息
kubectl cluster-info
kubectl get nodes
kubectl describe node node-name

# Pod 操作
kubectl get pods
kubectl get pods -o wide
kubectl get pods -l app=myapp
kubectl describe pod pod-name
kubectl logs pod-name
kubectl logs -f pod-name -c container-name
kubectl exec -it pod-name -- sh
kubectl delete pod pod-name

# Deployment
kubectl get deployments
kubectl describe deployment deployment-name
kubectl rollout status deployment/myapp
kubectl rollout history deployment/myapp
kubectl rollout undo deployment/myapp
kubectl rollout undo deployment/myapp --to-revision=2
kubectl scale deployment/myapp --replicas=5
kubectl set image deployment/myapp myapp=myapp:2.0

# Service
kubectl get services
kubectl expose deployment myapp --port=80 --target-port=3000

# 配置
kubectl apply -f deployment.yaml
kubectl apply -f . -R
kubectl delete -f deployment.yaml
kubectl get all

# 调试
kubectl get events
kubectl top nodes
kubectl top pods
kubectl port-forward pod-name 8080:3000
kubectl port-forward svc/myapp 8080:80

# 命名空间
kubectl get namespaces
kubectl create namespace dev
kubectl get pods -n dev
kubectl config set-context --current --namespace=dev
```

---

### 避坑指南

| 错误做法 | 正确做法 |
|---------|---------|
| 以 root 运行容器 | 使用非 root 用户 |
| 不设置资源限制 | 配置 requests 和 limits |
| latest 标签 | 使用具体版本标签 |
| 单副本部署 | 配置多副本和健康检查 |
| 硬编码配置 | 使用 ConfigMap 和 Secret |

---

## B. 实战文档

### 镜像优化

```dockerfile
# 优化前：~1GB
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]

# 优化后：~100MB
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
CMD ["node", "dist/main.js"]
```

### 常用 Helm 命令

```bash
# 仓库管理
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm search repo nginx

# 安装
helm install myapp bitnami/nginx
helm install myapp ./mychart
helm install myapp ./mychart -f values-prod.yaml
helm install myapp ./mychart --set replicas=3

# 管理
helm list
helm status myapp
helm upgrade myapp ./mychart
helm rollback myapp 1
helm uninstall myapp

# 模板调试
helm template myapp ./mychart
helm lint ./mychart
```

### 监控配置

```yaml
# Prometheus ServiceMonitor
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: myapp-monitor
spec:
  selector:
    matchLabels:
      app: myapp
  endpoints:
    - port: metrics
      interval: 30s
      path: /metrics
```
