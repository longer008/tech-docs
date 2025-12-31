# Git 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:merge 与 rebase 的区别与适用场景？
- 标准答案:merge 保留分支合并历史，产生合并提交；rebase 重写提交基底形成线性历史，更整洁但会改变 commit hash；禁止对共享分支强制 push rebase 后的历史。
- 追问点:交互式 rebase 的用途；何时使用 squash；rebase --onto 应用场景。
- 参考:https://git-scm.com/docs/git-rebase

### Q2:reset、revert、checkout/restore 的差异？
- 标准答案:reset 移动分支指针并可影响暂存区/工作区，适合本地回退；revert 创建反向提交，安全用于已推送历史；checkout/restore 还原文件或切换分支。
- 追问点:soft/mixed/hard 各做什么；如何恢复误删分支；使用 reflog。
- 参考:https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified

### Q3:stash 的作用？
- 标准答案:临时保存工作区/暂存区改动以便切换分支，可带 message、选择性存储，`stash pop`/`apply` 恢复；支持跟踪未跟踪文件 `-u`。
- 追问点:冲突处理；多份 stash 管理；与工作树 worktree 对比。
- 参考:https://git-scm.com/docs/git-stash

### Q4:cherry-pick 的使用注意？
- 标准答案:将单个/多个提交拷贝到当前分支；需处理冲突；跨版本发布常用；保持提交顺序避免依赖缺失。
- 追问点:-m 处理合并提交；重复 cherry-pick 的幂等性；如何记录 cherry-picked-from。
- 参考:https://git-scm.com/docs/git-cherry-pick

### Q5:标签(tag)与分支的区别？
- 标准答案:标签是固定指针用于发布版本，分轻量/附注；分支是可移动指针；发布应使用附注标签便于校验；标签创建后不应随意修改。
- 追问点:签名标签；tag push/删除；里程碑与 release note。
- 参考:https://git-scm.com/book/en/v2/Git-Basics-Tagging

### Q6:submodule 与 subtree ？
- 标准答案:submodule 保持外部仓库独立，记录特定提交；subtree 复制依赖代码并可合并回上游；小团队优先 subtree 简化；需根据更新频率选择。
- 追问点:更新与同步流程；CI 中递归拉取；替代方案（包管理）。
- 参考:https://git-scm.com/book/en/v2/Git-Tools-Submodules

### Q7:git bisect 如何定位问题？
- 标准答案:二分提交历史，标记 good/bad 自动找到第一个坏提交；需要可重复的检测步骤，支持脚本自动化。
- 追问点:结合 CI 自动 bisect；找到坏提交后的修复流程。
- 参考:https://git-scm.com/docs/git-bisect

### Q8:常见忽略文件与 .gitattributes？
- 标准答案:.gitignore 控制跟踪；.gitattributes 可定义行结尾、合并策略、文本/二进制；跨平台项目应设 `* text=auto`，避免 CRLF 问题。
- 追问点:强制检出二进制；自定义 merge driver；LFS 场景。
- 参考:https://git-scm.com/docs/gitattributes

## 场景/排查
### Q1:误删分支/提交如何恢复？
- 标准答案:使用 `git reflog` 找到丢失的 commit，再 `git branch` 指回；若已 push，可在远端的 refs 或 CI 记录中找哈希；尽量避免垃圾回收前拖延。
- 追问点:gc 触发时间；保护分支策略；备份方案。
- 参考:https://git-scm.com/docs/git-reflog

### Q2:合并冲突的处理步骤？
- 标准答案:阅读冲突标记，按预期修改；`git add` 后继续 merge/rebase；必要时 `git mergetool`；提交前自测；保持小步提交减少冲突。
- 追问点:冲突自动化策略；二进制文件冲突；代码格式化导致的假冲突。
- 参考:https://git-scm.com/docs/git-merge

## 反问
### Q1:团队分支模型（Git Flow/Trunk Based）？
- 标准答案:了解发布节奏与代码评审策略，匹配工作方式。
- 追问点:保护分支规则；CI 触发点；版本发布流程。
- 参考:团队内部规范

### Q2:代码审查与提交规范？
- 标准答案:确认 commit message 规范(Conventional Commits)、PR 模板、lint/测试要求，避免返工。
- 追问点:自动化检查；合并策略(squash/rebase/merge)；变基政策。
- 参考:团队内部规范
