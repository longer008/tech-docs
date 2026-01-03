# Kubernetes

## 元信息
- 定位与场景：容器编排平台，自动化部署与扩缩容。
- 版本范围：以官方稳定版本为准。
- 相关生态：Helm、Prometheus、Istio。

## 研究记录（Exa）
- 查询 1："Kubernetes interview questions 2024 2025"
- 查询 2："Kubernetes best practices documentation"
- 查询 3："Kubernetes concepts"
- 来源摘要：以官方 Concepts 文档为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：Pod、Deployment、Service 的关系？
  - A：Pod 是最小单元，Deployment 管理副本，Service 暴露访问。
- Q2：ConfigMap/Secret 的用途？
  - A：配置与敏感信息管理。
- Q3：Liveness/Readiness 探针的作用？
  - A：健康检查与流量控制。
- Q4：Ingress 的作用？
  - A：统一入口与路由。
- Q5：资源请求/限制如何设置？
  - A：通过 requests/limits 影响调度。

### 进阶/场景题
- Q1：如何做滚动升级与回滚？
  - A：Deployment 策略控制。
- Q2：如何排查 Pod CrashLoop？
  - A：查看事件与日志。

### 避坑指南
- 未设置资源限制导致抢占。
- 探针配置不当导致频繁重启。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Kubernetes 文档：https://kubernetes.io/docs/
- Concepts：https://kubernetes.io/docs/concepts/
```

### 常用代码片段
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo
  template:
    metadata:
      labels:
        app: demo
    spec:
      containers:
        - name: web
          image: nginx:alpine
          ports:
            - containerPort: 80
```

### 版本差异
- 关注 API 版本弃用与升级。
- 升级以官方 Release Notes 为准。
