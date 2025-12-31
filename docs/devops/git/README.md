# Git

## 元信息
- 定位与场景：分布式版本控制系统。
- 版本范围：以官方稳定版本为准。
- 相关生态：GitHub/GitLab、CI/CD。

## 研究记录（Exa）
- 查询 1："Git interview questions 2024 2025"
- 查询 2："Git best practices workflow"
- 查询 3："git workflows"
- 来源摘要：以官方文档为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：`merge` 与 `rebase` 的差异？
  - A：merge 保留分支历史；rebase 线性化历史。
- Q2：`reset` 与 `revert` 的区别？
  - A：reset 改历史；revert 生成反向提交。
- Q3：`stash` 的用途？
  - A：临时保存工作区。
- Q4：`reflog` 的作用？
  - A：恢复丢失的引用。
- Q5：常见分支策略？
  - A：Git Flow、Trunk Based。

### 进阶/场景题
- Q1：如何处理复杂冲突？
  - A：分块解决并回放测试。
- Q2：如何做历史清理？
  - A：交互式 rebase 与 squash。

### 避坑指南
- 强制推送覆盖他人提交。
- 大量混合提交导致难以回滚。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Git 官方文档：https://git-scm.com/docs
- Git 工作流：https://git-scm.com/docs/gitworkflows
```

### 常用代码片段
```txt
git status
git add -p
git commit -m "feat: add user api"
```

### 版本差异
- 关注新命令与语法变更。
- 升级以官方 Release Notes 为准。
