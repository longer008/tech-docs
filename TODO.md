# 项目文档维护 TODO

> 目标：检查过期内容并更新、补充缺失内容、提取重复内容，消除冗余。
> 更新时间：2026-08-01

## 任务总览

### 阶段一：前端模块（进行中）

| 子任务 | 说明 | 状态 |
|--------|------|------|
| 1. 前端文档盘点 | 阅读全部前端文档，建立内容清单 | 已完成 |
| 2. 检查过期内容 | 标注技术过时/版本旧的内容，补充最新内容 | 已完成 |
| 3. 检查缺失内容 | 识别高频考点缺失，补充文档 | 已完成 |
| 4. 提取重复内容 | 多文件重复内容收敛到单一文档 | 已完成 |
| 5. 更新前端导航 | 同步 index.md / README.md 链接与描述 | 已完成 |

### 阶段二：其他模块（进行中）

| 子任务 | 说明 | 状态 |
|--------|------|------|
| 6. 后端模块检查 | 同前端流程（含 20 个模块 README/index 收敛） | 已完成 |
| 7. 数据库模块检查 | 同前端流程 | 已完成 |
| 8. DevOps / 其他模块检查 | 同前端流程 | 已完成 |
| 9. 根文档与部署文档检查 | README、部署、插件等 | 已完成 |

## 前端盘点结果（2026-08-01）

### 过期内���（需更新）
- [x] `fundamentals/browser-interview.md`：FID 指标已被 INP 取代（2024-03 Core Web Vitals 更新），已改为 INP + onINP + TTI 标注
- [x] `fundamentals/performance-interview.md`：同上，已改 onINP
- [x] `前端100道问答.md` 第 60 题：已改 INP 正式取代 FID
- [x] `react/README.md`：已更新为 React 18/19，reactjs.org 链接改 react.dev
- [x] `react/react-cheatsheet.md`：标题改 React 18/19
- [x] `css-tailwind/interview-bank.md`：已加 Tailwind v4 版本说明块
- [x] `vue/vue2-interview.md`：已标注 Vue 2 EOL（2023-12-31）
- [x] 根 `README.md`：已更新 Node >= 20 / pnpm >= 9
- [x] `vue/vue3-interview.md`：已补充 Vue 3.4/3.5 新特性

### 缺失内容（需补充）
- [x] `vue/vue3-interview.md`：已补 `defineModel`、`useTemplateRef`、`useId` 等（随任务2一并完成）
- [x] `react/react-hooks-interview.md` / `react-cheatsheet.md`：已补 React 19 新 Hooks（use/useActionState/useFormStatus/useOptimistic）与 Actions
- [x] `fundamentals/javascript-core-interview.md`：已补 ES2023/2024（toSorted/withResolvers/groupBy/fromAsync）
- [x] `fundamentals/browser-interview.md`：已补 AbortController / View Transitions API
- [x] `fundamentals/typescript-interview.md`：已补 TS 5.x（satisfies/const 参数/装饰器/using/NoInfer）
- [x] `react/nextjs-interview.md`：已补 Next.js 15 版本说明

### 重复内容（需收敛）
- [x] 各模块 `README.md` / `index.md`（元信息+面试题摘要）与 `interview-bank.md` 重复 → 已收敛为导航链接
- [x] `vue/vue3-interview.md` 生命周期表/响应式对比与 `vue/vue3-vs-vue2.md` 重复 → 已加引用指向对比文档
- [x] `fundamentals/css-core-interview.md` 与 `fundamentals/css-tailwind-interview.md` 内 BFC/居中/响应式/变量/代码片段重复 → 已收敛至 css-core，css-tailwind 只留盒模型/Flex/Grid/Tailwind
- [x] `cross-platform/` 与 `uniapp/`、`wechat-mini-program/` 重复 → README 收敛为导航，frontend/index.md 补全两个详解入口
- [x] `前端100道问答.md` 与其他 fundamentals 文档大量重复（通俗版）→ 保留为独立速览（避免删除）
- [x] `fundamentals/typescript-interview.md` 与 `typescript/` 目录 → 速查(interview-bank) + 详解(fundamentals) 分工，index 已链接两者

## 进度记录

### 2026-08-01
- 创建本 TODO 文档，规划任务
- 完成前端 44 个文档通读盘点（任务 1）
- 完成任务 2（过期内容）：FID→INP、React 18/19、Tailwind v4、Vue 2 EOL、Node>=20、Next.js 15 版本说明
- 完成任务 3（缺失内容）：Vue 3.4/3.5、React 19 Hooks、ES2023/2024、TS 5.x、现代 Web API
- 完成任务 4（重复收敛）：7 个模块 README/index 收敛为导航；css-tailwind 与 css-core 去重；跨端导航补全
- 完成任务 5（导航更新）：同步 frontend/index.md，`pnpm docs:build` 构建通过（167 页）
- **阶段一（前端模块）全部完成**；阶段二（后端/数据库/DevOps/根文档）待开始

## 阶段二盘点结果（2026-08-01）

### 任务 6：后端模块检查（已完成）
- [x] 11 个模块 `README/index` 的 "A. 面试宝典" Q&A 摘要收敛为导航链接块（java/nodejs/python 多链接，其余各 1 条链接）
- [x] 链接目标全部核验存在（java-core/juc/mybatis/spring-boot/spring-cloud、nodejs-runtime/express-koa/nestjs、python-core/django/fastapi）
- [x] 版本说明：Java 17/21 主流 LTS、Spring Boot 3.x（Java 17+）、Node.js 20/22 主流 LTS、Python 3.12
- [x] 未改动 `sources.md` / `interview-bank.md`；顶层 `backend/index.md`、`README.md` 无 A/B 结构未动

### 任务 8：DevOps 模块检查（已完成）
- [x] 4 个模块 `index.md`（git/docker/kubernetes/http-https）"A. 面试宝典"收敛为导航链接块，交叉引用 interview-bank 与综合题集
- [x] 版本说明：Nginx 1.25.1+ 弃用 `listen ... http2`（改 `http2 on;`）；Compose V2 弃用 `version` 字段；HTTP/3 生产化 + TLS 1.3（1-RTT/0-RTT、ECDHE）
- [x] 链接目标全部存在（../git-workflow.md、../docker-k8s-interview.md、../http-https-interview.md）
- [x] `http-https-interview.md`、`linux-commands.md` 内容准确未改动

### 任务 9：根文档与部署文档检查（已完成）
- [x] `README.md`：环境要求更新 Node >= 20 / pnpm >= 9，新增 v1.1.0 (2026-08) CHANGELOG 条目
- [x] `docs/index.md`：更新时间 2025-01 → 2026-08-01、Copyright 2026
- [x] `docs/sprint-plan/day09-technical-highlights.md`：FID PerformanceObserver 代码块改为 INP（2024-03 取代 FID，`type: 'event'` + 最差值统计）
- [x] 已核 `day04-vue-react-principles.md` React 18 自动批处理描述准确无需改
- [x] `quick-start/`（清单/计划/路线图）、`appendix/`、`ai-interview/`、`diagrams/`（27 个 .mmd）、`vitepress-plugins.md`、`component-examples.md` 均健康无过期

### 任务 7：数据库模块检查（已完成）
- [x] 5 个模块 `README/index`（mysql/redis/mongodb/kafka/rabbitmq）"A. 面试宝典"收敛为导航链接块（mysql 4 链接、redis 3 链接，kafka/rabbitmq 交叉引用 mq/）
- [x] 版本说明：Redis 7.x ziplist→listpack（7.2+ quicklist 节点）、RabbitMQ 镜像队列→仲裁队列（4.0 移除）、Mongoose 6+ 无需 `useNewUrlParser/useUnifiedTopology`
- [x] 链接目标全部核验存在（mysql-index/transaction/optimization/cheatsheet、redis-interview/cluster/cheatsheet、mongodb-interview、../mq/kafka-interview、../mq/rabbitmq-interview）
- [x] 待留意：Kafka 分区分配器默认值在 4.0 有变化，文档未标注版本故未改（agent 判断合理）

## 阶段二收尾（2026-08-01）
- 任务 6/7/8/9 全部完成
- 三模块并行 agent（后端/数据库/DevOps）已分别核验，链接目标全部存在
- `pnpm docs:build` 构建通过（167 页索引，build complete in 112.78s，无错误）
- **阶段二（后端/数据库/DevOps/根文档）全部完成**
