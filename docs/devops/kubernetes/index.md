# Kubernetes 完全指南

> Kubernetes 容器编排完全指南 | 更新时间：2025-02

## 目录

- [Kubernetes 基础](#kubernetes-基础)
- [核心概念](#核心概念)
- [工作负载](#工作负载)
- [服务与网络](#服务与网络)
- [存储](#存储)
- [配置管理](#配置管理)
- [安全](#安全)
- [实战案例](#实战案例)

---

## Kubernetes 基础

### 1. Kubernetes 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes 架构                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Control Plane (控制平面)                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │   │
│  │  │  API Server  │  │  Scheduler   │  │Controller │  │   │
│  │  │              │  │              │  │ Manager   │  │   │
│  │  └──────────────┘  └──────────────┘  └───────────┘  │   │
│  │  ┌──────────────┐                                    │   │
│  │  │     etcd     │  (集群状态存储)                    │   │
│  │  └──────────────┘                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           │ kubectl                          │
│                           │                                  │
│  Worker Nodes (工作节点)                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Node 1                Node 2                Node 3  │   │
│  │  ┌────────────┐        ┌────────────┐      ┌──────┐ │   │
│  │  │  kubelet   │        │  kubelet   │      │kubelet│ │   │
│  │  ├────────────┤        ├────────────┤      ├──────┤ │   │
│  │  │kube-proxy  │        │kube-proxy  │      │proxy │ │   │
│  │  ├────────────┤        ├────────────┤      ├──────┤ │   │
│  │  │ Container  │        │ Container  │      │Cont. │ │   │
│  │  │  Runtime   │        │  Runtime   │      │Runtime│ │   │
│  │  └────────────┘        └────────────┘      └──────┘ │   │
│  │  ┌────────────┐        ┌────────────┐      ┌──────┐ │   │
│  │  │   Pods     │        │   Pods     │      │ Pods │ │   │
│  │  └────────────┘        └────────────┘      └──────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. 核心组件

**Control Plane 组件：**

| 组件 | 说明 |
|------|------|
| API Server | 集群的统一入口，RESTful API |
| etcd | 分布式键值存储，保存集群状态 |
| Scheduler | 负责 Pod 调度到合适的节点 |
| Controller Manager | 运行控制器进程 |
| Cloud Controller Manager | 与云提供商交互 |

**Node 组件：**

| 组件 | 说明 |
|------|------|
| kubelet | 节点代理，管理 P
od.yaml

# 查看 Pod
kubectl get pods
kubectl get pods -o wide
kubectl describe pod nginx-pod

# 查看日志
kubectl logs nginx-pod
kubectl logs -f nginx-pod

# 进入 Pod
kubectl exec -it nginx-pod -- bash

# 删除 Pod
kubectl delete pod nginx-pod
```

### 2. Namespace

命名空间用于隔离资源。

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: development
```

```bash
# 创建命名空间
kubectl create namespace development

# 查看命名空间
kubectl get namespaces

# 在指定命名空间操作
kubectl get pods -n development
kubectl apply -f pod.yaml -n development

# 设置默认命名空间
kubectl config set-context --current --namespace=development
```

### 3. Label 和 Selector

标签用于组织和选择资源。

```yaml
# 带标签的 Pod
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
    env: production
    tier: frontend
spec:
  containers:
  - name: nginx
    image: nginx:1.21
```

```bash
# 查看标签
kubectl get pods --show-labels

# 按标签筛选
kubectl get pods -l app=nginx
kubectl get pods -l env=production,tier=frontend

# 添加标签
kubectl label pod nginx-pod version=v1.0

# 删除标签
kubectl label pod nginx-pod version-
```

---

## 工作负载

### 1. Deployment

Deployment 用于管理无状态应用。

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

```bash
# 创建 Deployment
kubectl apply -f deployment.yaml

# 查看 Deployment
kubectl get deployments
kubectl describe deployment nginx-deployment

# 查看 ReplicaSet
kubectl get rs

# 扩缩容
kubectl scale deployment nginx-deployment --replicas=5

# 更新镜像
kubectl set image deployment/nginx-deployment nginx=nginx:1.22

# 查看滚动更新状态
kubectl rollout status deployment/nginx-deployment

# 查看历史版本
kubectl rollout history deployment/nginx-deployment

# 回滚
kubectl rollout undo deployment/nginx-deployment
kubectl rollout undo deployment/nginx-deployment --to-revision=2

# 暂停/恢复更新
kubectl rollout pause deployment/nginx-deployment
kubectl rollout resume deployment/nginx-deployment
```

### 2. StatefulSet

StatefulSet 用于管理有状态应用。

```yaml
# statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        ports:
        - containerPort: 3306
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

### 3. DaemonSet

DaemonSet 确保每个节点运行一个 Pod 副本。

```yaml
# daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      containers:
      - name: fluentd
        image: fluentd:v1.14
        volumeMounts:
        - name: varlog
          mountPath: /var/log
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
```

### 4. Job 和 CronJob

```yaml
# job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: backup-job
spec:
  template:
    spec:
      containers:
      - name: backup
        image: backup:v1.0
        command: ["./backup.sh"]
      restartPolicy: OnFailure
  backoffLimit: 3
  completions: 1
  parallelism: 1

---
# cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup-cronjob
spec:
  schedule: "0 2 * * *"  # 每天凌晨 2 点
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: backup:v1.0
            command: ["./backup.sh"]
          restartPolicy: OnFailure
```

---

## 服务与网络

### 1. Service

Service 提供稳定的网络端点。

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: ClusterIP  # ClusterIP, NodePort, LoadBalancer
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

**Service 类型：**

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| ClusterIP | 集群内部访问（默认） | 内部服务 |
| NodePort | 通过节点 IP 和端口访问 | 开发测试 |
| LoadBalancer | 云负载均衡器 | 生产环境 |
| ExternalName | DNS CNAME 记录 | 外部服务 |

```yaml
# NodePort Service
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 30080  # 30000-32767

---
# LoadBalancer Service
apiVersion: v1
kind: Service
metadata:
  name: nginx-lb
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

### 2. Ingress

Ingress 提供 HTTP/HTTPS 路由。

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8080
  tls:
  - hosts:
    - app.example.com
    secretName: app-tls-secret
```

---

## 存储

### 1. Volume

```yaml
# 临时存储
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-volume
spec:
  containers:
  - name: app
    image: myapp:v1.0
    volumeMounts:
    - name: cache
      mountPath: /app/cache
  volumes:
  - name: cache
    emptyDir: {}

---
# 主机路径
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-hostpath
spec:
  containers:
  - name: app
    image: myapp:v1.0
    volumeMounts:
    - name: data
      mountPath: /app/data
  volumes:
  - name: data
    hostPath:
      path: /data
      type: Directory
```

### 2. PersistentVolume 和 PersistentVolumeClaim

```yaml
# pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-nfs
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteMany
  nfs:
    server: nfs-server.example.com
    path: /data

---
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-app
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 5Gi

---
# 使用 PVC
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-pvc
spec:
  containers:
  - name: app
    image: myapp:v1.0
    volumeMounts:
    - name: data
      mountPath: /app/data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: pvc-app
```

### 3. StorageClass

```yaml
# storageclass.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iops: "3000"
reclaimPolicy: Delete
allowVolumeExpansion: true
```

---

## 配置管理

### 1. ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  app.properties: |
    server.port=8080
    db.host=mysql
  log.level: "INFO"

---
# 使用 ConfigMap
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-config
spec:
  containers:
  - name: app
    image: myapp:v1.0
    env:
    - name: LOG_LEVEL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: log.level
    volumeMounts:
    - name: config
      mountPath: /app/config
  volumes:
  - name: config
    configMap:
      name: app-config
```

### 2. Secret

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  username: YWRtaW4=  # base64 编码
  password: cGFzc3dvcmQ=

---
# 使用 Secret
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-secret
spec:
  containers:
  - name: app
    image: myapp:v1.0
    env:
    - name: DB_USERNAME
      valueFrom:
        secretKeyRef:
          name: app-secret
          key: username
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: app-secret
          key: password
```

```bash
# 创建 Secret
kubectl create secret generic app-secret \
  --from-literal=username=admin \
  --from-literal=password=secret

# 从文件创建
kubectl create secret generic tls-secret \
  --from-file=tls.crt=./cert.crt \
  --from-file=tls.key=./cert.key
```

---

## 安全

### 1. RBAC（基于角色的访问控制）

```yaml
# serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa

---
# role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]

---
# rolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
subjects:
- kind: ServiceAccount
  name: app-sa
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### 2. NetworkPolicy

```yaml
# networkpolicy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-policy
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 3306
```

---

## 实战案例

### 1. 完整的 Web 应用部署

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: myapp

---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: myapp
data:
  DATABASE_HOST: "mysql"
  DATABASE_PORT: "3306"

---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
  namespace: myapp
type: Opaque
stringData:
  DATABASE_PASSWORD: "secret123"

---
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: myapp:v1.0
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secret
        resources:
          requests:
            memory: "128Mi"
            cpu: "250m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
  namespace: myapp
s
tl describe pod <pod-name>`
2. 检查节点状态：`kubectl get nodes`
3. 检查 PVC 是否绑定：`kubectl get pvc`

### Q2：如何调试 Pod？

```bash
# 查看 Pod 详情
kubectl describe pod <pod-name>

# 查看日志
kubectl logs <pod-name>
kubectl logs <pod-name> -c <container-name>

# 进入容器
kubectl exec -it <pod-name> -- bash

# 查看事件
kubectl get events --sort-by='.lastTimestamp'
```

### Q3：如何实现零停机部署？

1. 使用滚动更新（Deployment 默认）
2. 配置 readinessProbe
3. 设置合理的 maxSurge 和 maxUnavailable

---

## 参考资料

### 官方资源

- [Kubernetes 官方文档](https://kubernetes.io/docs/)
- [Kubernetes API 参考](https://kubernetes.io/docs/reference/)

### 学习资源

- [Kubernetes 中文社区](https://www.kubernetes.org.cn/)
- [Play with Kubernetes](https://labs.play-with-k8s.com/)

### 工具推荐

- [kubectl](https://kubernetes.io/docs/reference/kubectl/) - 命令行工具
- [k9s](https://k9scli.io/) - 终端 UI
- [Lens](https://k8slens.dev/) - 桌面 IDE
- [Helm](https://helm.sh/) - 包管理器
