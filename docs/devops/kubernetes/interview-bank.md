# Kubernetes 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:Pod、ReplicaSet、Deployment 的关系？
- 标准答案:Pod 是最小调度单元；ReplicaSet 维持指定副本数；Deployment 管理 RS 以实现滚动更新/回滚；StatefulSet/DaemonSet 针对有状态或守护进程场景。
- 追问点:Deployment 与 StatefulSet 差异；Revision 控制；Pod 模板不可变的部分。
- 参考:https://kubernetes.io/docs/concepts/workloads/controllers/deployment/

### Q2:Service 类型与作用？
- 标准答案:ClusterIP 集群内访问；NodePort 暴露到节点端口；LoadBalancer 依赖云提供商；Headless 提供直连/服务发现；配合 Endpoints/EndpointSlice。
- 追问点:SessionAffinity；ExternalName；服务暴露安全性。
- 参考:https://kubernetes.io/docs/concepts/services-networking/service/

### Q3:Ingress 与 Ingress Controller？
- 标准答案:Ingress 定义七层路由规则，需要 Ingress Controller 实现(Nginx, Traefik, Istio Gateway)；可配置 TLS、重写、限流等。
- 追问点:CRD Gateway API；Nginx Ingress 与 Istio Gateway 差别；跨命名空间访问。
- 参考:https://kubernetes.io/docs/concepts/services-networking/ingress/

### Q4:ConfigMap 与 Secret 的区别？
- 标准答案:ConfigMap 存储非敏感配置，Secret 存储敏感数据(Base64 编码需加密存储)；可通过环境变量、卷、命令行参数挂载；Secret 支持 CSI 密钥管理。
- 追问点:密钥加密 at-rest；热更新；多环境管理。
- 参考:https://kubernetes.io/docs/concepts/configuration/secret/

### Q5:探针与生命周期钩子？
- 标准答案:liveness/readiness/startup 探针确保存活与就绪；支持 HTTP/TCP/exec/GRPC；生命周期钩子 postStart/preStop 可做初始化和优雅下线。
- 追问点:探针频率/超时设置；滚动更新时的配合；端口复用。
- 参考:https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/

### Q6:资源 requests/limits 的意义？
- 标准答案:requests 参与调度，limits 控制 cgroup；CPU 可突发，内存超限会 OOMKill；需结合 HPA/VPA 合理设定。
- 追问点:QoS 等级(Guaranteed/Burstable/BestEffort)；OOM 排查；CPU 抢占。
- 参考:https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/

### Q7:存储卷类型？
- 标准答案:临时卷(emptyDir)、hostPath、本地持久卷；持久卷 PV/PVC/StorageClass 支持动态供给(云盘/NFS/Ceph)；StatefulSet 支持卷模板。
- 追问点:ReadWriteOnce/Many 模式；卷回收策略；拓扑约束。
- 参考:https://kubernetes.io/docs/concepts/storage/

### Q8:滚动更新与回滚？
- 标准答案:Deployment 默认滚动更新，参数 maxSurge/maxUnavailable 控制；回滚可 `kubectl rollout undo`；StatefulSet 支持分片更新；DaemonSet 支持 maxUnavailable。
- 追问点:蓝绿/金丝雀实现；应用探针与更新配合；历史版本清理。
- 参考:https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment

## 场景/排查
### Q1:Pod 处于 CrashLoopBackOff 怎么查？
- 标准答案:查看 `kubectl logs -p` 与 describe；确认探针失败/配置错误/依赖未就绪；检查资源限制导致 OOM；可增加启动延时或调整探针。
- 追问点:initContainer；镜像拉取失败 vs 应用异常；重启退避。
- 参考:https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-lifetime

### Q2:节点 NotReady/调度失败？
- 标准答案:检查 kubelet/容器运行时日志；资源不足、污点/容忍度、节点标签与亲和性冲突；网络插件/证书过期；调度器事件提示原因。
- 追问点:cordon/drain 影响；优先级抢占；集群自动伸缩。
- 参考:https://kubernetes.io/docs/concepts/scheduling-eviction/

## 反问
### Q1:集群规模与 CNI/CSI 选择？
- 标准答案:了解网络/存储栈，决定排查与性能基线。
- 追问点:多集群/多租户方案；安全策略(NetworkPolicy)；服务网格使用情况。
- 参考:团队内部规范

### Q2:发布策略与运维工具链？
- 标准答案:确认是否使用 Helm/Kustomize、GitOps(ArgoCD/Flux)、观测体系(Prometheus/Grafana/ELK)；影响日常工作流。
- 追问点:RBAC 管控；审计；成本优化。
- 参考:团队内部规范
