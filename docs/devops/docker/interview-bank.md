# Docker 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:容器与虚拟机的区别？
- 标准答案:容器共享宿主内核，通过 namespace 隔离、cgroups 做资源限制；虚拟机有独立内核，开销更大但隔离更强；容器适合快速、弹性部署。
- 追问点:安全隔离差异；rootless 容器；适用场景取舍。
- 参考:https://docs.docker.com/get-started/overview/

### Q2:镜像分层与 UnionFS？
- 标准答案:镜像由只读层叠加，最上为可写容器层；相同层可复用；分层影响缓存与大小；了解 AUFS/Overlay2。
- 追问点:为何层数越多可能影响性能；如何清理悬挂层；跨平台镜像。
- 参考:https://docs.docker.com/storage/storagedriver/overlayfs-driver/

### Q3:Dockerfile 最佳实践？
- 标准答案:使用官方基础镜像、固定版本；多阶段构建减少体积；合并 RUN 以减少层；`COPY --chown` 控制权限；避免 root 运行，设置健康检查。
- 追问点:ENTRYPOINT 与 CMD 组合；构建缓存失效原因；.dockerignore 配置。
- 参考:https://docs.docker.com/develop/develop-images/dockerfile_best-practices/

### Q4:网络模式有哪些？
- 标准答案:bridge(默认)、host、none、自定义网络、container 共享网络；自定义 bridge 支持服务发现与别名；host 模式性能好但端口冲突风险。
- 追问点:端口映射原理；DNS 解析；多网卡场景。
- 参考:https://docs.docker.com/network/

### Q5:数据持久化方式？
- 标准答案:卷(volume) 由 Docker 管理，适合持久化；绑定挂载(bind mount) 直接映射宿主路径；tmpfs 内存盘；选择取决于可移植性和性能需求。
- 追问点:权限与 SELinux；卷驱动插件；备份策略。
- 参考:https://docs.docker.com/storage/

### Q6:资源限制与隔离？
- 标准答案:通过 `--memory/--cpus/--cpu-shares/--pids-limit` 等参数限制；`ulimit` 控制文件句柄；避免宿主被拖垮；需要监控容器的 cgroup 指标。
- 追问点:内存 OOM-kill 行为；内核参数 sysctl；NUMA/CPU 亲和性。
- 参考:https://docs.docker.com/config/containers/resource_constraints/

### Q7:日志与排查？
- 标准答案:默认 json-file 驱动，需配合 logrotate；可切换 syslog/fluentd 等；`docker logs` 仅适用于小流量；生产建议 stdout 收集到集中系统。
- 追问点:日志丢失风险；多行日志处理；容器崩溃日志保留。
- 参考:https://docs.docker.com/config/containers/logging/configure/

### Q8:镜像安全与签名？
- 标准答案:定期扫描漏洞；使用私有 Registry 和最小基础镜像；Notary/Content Trust 或 cosign 进行签名；控制凭证。
- 追问点:SBOM 生成；rootless 镜像拉取；CI 中的安全门。
- 参考:https://docs.docker.com/engine/security/

## 场景/排查
### Q1:镜像过大导致传输慢怎么办？
- 标准答案:多阶段构建、清理包管理缓存、选择 alpine/distroless、合并层；拆分可选功能到独立镜像；启用镜像加速或私有 registry 缓存。
- 追问点:alpine 与 glibc 兼容问题；层缓存命中技巧；构建扫描。
- 参考:https://docs.docker.com/develop/develop-images/multistage-build/

### Q2:容器内存 OOM 排查步骤？
- 标准答案:查看 docker events/内核日志确认 OOM；检查 cgroup 限制与应用峰值；分析是否存在内存泄漏或缓存未释放；必要时升配或分片。
- 追问点:Java/Node 需要手动调 JVM/heap；`--oom-score-adj`；预警指标。
- 参考:https://docs.docker.com/config/containers/resource_constraints/

## 反问
### Q1:公司标准镜像与 Registry 策略？
- 标准答案:确认是否有基础镜像、镜像扫描、拉取权限和镜像加速规则。
- 追问点:镜像保留/清理策略；签名要求；SBOM。
- 参考:团队内部规范

### Q2:编排环境是什么？K8s/Swarm/裸机？
- 标准答案:有助于决定健康检查、探针、资源限制的写法和调试工具。
- 追问点:发布流程；回滚/灰度；日志与监控采集。
- 参考:团队内部规范
