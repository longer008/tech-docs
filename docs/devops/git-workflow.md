# Git 工作流面试题集

> Git 版本控制核心知识点与团队协作最佳实践

## A. 面试宝典

### 基础题

#### 1. Git 核心概念

```
┌─────────────────────────────────────────────────────────────┐
│                      Git 工作区域                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Working Directory    Staging Area       Repository        │
│   (工作目录)           (暂存区)           (本地仓库)         │
│                                                              │
│   ┌─────────┐         ┌─────────┐        ┌─────────┐       │
│   │ 未跟踪  │         │         │        │  HEAD   │       │
│   │ 已修改  │ ──add──▶│ 已暂存  │──commit▶│  分支   │       │
│   └─────────┘         └─────────┘        └─────────┘       │
│        ▲                   │                  │             │
│        └───── checkout ────┴───── reset ──────┘             │
│                                                              │
│   Remote Repository (远程仓库)                               │
│   ┌─────────────────────────────────────────────────┐       │
│   │  origin/main, origin/develop, ...               │       │
│   └─────────────────────────────────────────────────┘       │
│        ▲                                      │             │
│        └──────── push ──────────── fetch/pull─┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

| 概念 | 说明 |
|------|------|
| Repository | 仓库，包含所有版本历史 |
| Commit | 提交，代码快照 |
| Branch | 分支，独立开发线 |
| HEAD | 当前分支指针 |
| Remote | 远程仓库 |
| Origin | 默认远程仓库名 |

---

#### 2. 常用命令

```bash
# 配置
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config --global core.autocrlf true  # Windows
git config --global core.autocrlf input # Mac/Linux

# 初始化与克隆
git init
git clone <url>
git clone <url> --depth 1  # 浅克隆

# 基本操作
git status
git add <file>
git add .
git add -p              # 交互式暂存
git commit -m "message"
git commit --amend      # 修改最近提交

# 分支操作
git branch              # 查看分支
git branch <name>       # 创建分支
git checkout <branch>   # 切换分支
git checkout -b <name>  # 创建并切换
git switch <branch>     # 切换分支（新命令）
git switch -c <name>    # 创建并切换

# 合并
git merge <branch>
git merge --no-ff <branch>  # 保留合并历史
git rebase <branch>

# 远程操作
git remote -v
git remote add origin <url>
git fetch origin
git pull origin main
git push origin main
git push -u origin main  # 设置上游分支

# 撤销操作
git checkout -- <file>   # 撤销工作区修改
git restore <file>       # 撤销工作区修改（新命令）
git reset HEAD <file>    # 取消暂存
git restore --staged <file>  # 取消暂存（新命令）
git reset --soft HEAD~1  # 撤销提交，保留修改
git reset --hard HEAD~1  # 撤销提交，丢弃修改
git revert <commit>      # 创建反向提交

# 查看历史
git log
git log --oneline --graph
git log -p <file>        # 查看文件修改历史
git blame <file>         # 查看每行的修改者
git diff                 # 工作区 vs 暂存区
git diff --staged        # 暂存区 vs 仓库
git diff <branch1> <branch2>

# 暂存
git stash
git stash list
git stash pop
git stash apply stash@{0}
git stash drop stash@{0}

# 标签
git tag v1.0.0
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
git push origin --tags
```

---

#### 3. 分支策略

**Git Flow：**
```
┌─────────────────────────────────────────────────────────────┐
│                      Git Flow                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  main ──●────────────────●─────────────●───────────────▶    │
│          \              /             /                      │
│  release  \──────●─────/─────────────/                      │
│             \   / \   /             /                        │
│  develop ────●───●─●─●─────●───────●──────────────────▶     │
│               \     /       \     /                          │
│  feature       ●───●         ●───●                          │
│                                                              │
│  hotfix                            ●───●                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

分支说明：
- main: 生产环境代码
- develop: 开发主线
- feature/*: 功能分支
- release/*: 发布分支
- hotfix/*: 热修复分支
```

**GitHub Flow（简化版）：**
```
main ──●───────────●───────────●───────────▶
        \         /             \
         ●───●───●               ●───●
         (feature)               (feature)

步骤：
1. 从 main 创建分支
2. 开发并提交
3. 创建 Pull Request
4. 代码审查
5. 合并到 main
6. 部署
```

**Trunk Based Development：**
```
main ──●───●───●───●───●───●───●───●───▶
       │   │   │   │   │   │   │   │
       └───┴───┴───┴───┴───┴───┴───┘
         频繁小提交，持续集成

特点：
- 短生命周期分支
- 频繁集成到主干
- 特性开关控制功能
```

---

#### 4. Merge vs Rebase

**Merge：**
```bash
# 合并 feature 到 main
git checkout main
git merge feature

# 结果
#     A---B---C (feature)
#    /         \
# --D-----E-----F (main)
```

**Rebase：**
```bash
# 将 feature 变基到 main
git checkout feature
git rebase main

# 结果
# --D---E---A'---B'---C' (feature)
#       (main)
```

| 特性 | Merge | Rebase |
|------|-------|--------|
| 历史 | 保留完整历史 | 线性历史 |
| 冲突 | 一次解决 | 逐个提交解决 |
| 适用 | 公共分支 | 本地分支整理 |
| 风险 | 低 | 不要用于公共分支 |

**黄金法则：** 不要对已推送的提交执行 rebase

---

#### 5. 解决冲突

```bash
# 冲突标记
<<<<<<< HEAD
当前分支的内容
=======
要合并的分支内容
>>>>>>> feature

# 解决步骤
1. 编辑冲突文件
2. git add <file>
3. git commit  # merge 冲突
   git rebase --continue  # rebase 冲突

# 放弃操作
git merge --abort
git rebase --abort

# 工具
git mergetool  # 使用配置的合并工具
```

---

### 进阶题

#### 6. 高级操作

**Cherry-pick：**
```bash
# 选择性应用提交
git cherry-pick <commit>
git cherry-pick <commit1> <commit2>
git cherry-pick <start>..<end>
```

**Interactive Rebase：**
```bash
git rebase -i HEAD~3

# 编辑器中的命令
pick   # 保留提交
reword # 修改提交信息
edit   # 修改提交内容
squash # 合并到上一个提交
fixup  # 合并，丢弃提交信息
drop   # 删除提交
```

**Reflog（恢复误操作）：**
```bash
git reflog
# 找到丢失的 commit
git checkout <commit>
git branch recover-branch  # 创建恢复分支
```

**Bisect（二分查找问题）：**
```bash
git bisect start
git bisect bad          # 当前版本有问题
git bisect good v1.0.0  # 这个版本正常
# Git 自动切换到中间版本
git bisect good/bad     # 标记
# 重复直到找到问题提交
git bisect reset        # 结束
```

**Submodule：**
```bash
# 添加子模块
git submodule add <url> path/to/module

# 克隆包含子模块的仓库
git clone --recursive <url>
# 或
git submodule update --init --recursive

# 更新子模块
git submodule update --remote
```

---

#### 7. Git Hooks

```bash
# 钩子位置：.git/hooks/

# 常用钩子
pre-commit      # 提交前（代码检查）
prepare-commit-msg  # 准备提交信息
commit-msg      # 验证提交信息
pre-push        # 推送前（运行测试）
post-merge      # 合并后（安装依赖）

# 示例：pre-commit
#!/bin/sh
npm run lint
if [ $? -ne 0 ]; then
    echo "Lint failed, commit aborted"
    exit 1
fi

# 使用 husky 管理（推荐）
npx husky install
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/commit-msg "npx commitlint --edit $1"
```

**Commit 规范：**
```
<type>(<scope>): <subject>

<body>

<footer>

类型：
- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 构建/工具

示例：
feat(auth): add OAuth2 login support

- Add Google OAuth2 provider
- Add Facebook OAuth2 provider

Closes #123
```

---

### 避坑指南

| 错误做法 | 正确做法 |
|---------|---------|
| 直接在 main 分支开发 | 使用功能分支 |
| 强制推送公共分支 | 只在本地分支使用 --force |
| 提交敏感信息 | 使用 .gitignore，及时清理 |
| 大文件直接提交 | 使用 Git LFS |
| 不写提交信息 | 遵循 Commit 规范 |

---

## B. 实战文档

### .gitignore 模板

```gitignore
# 依赖
node_modules/
vendor/
.venv/

# 构建产物
dist/
build/
*.pyc
__pycache__/

# 环境配置
.env
.env.local
*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# 系统文件
.DS_Store
Thumbs.db

# 日志
*.log
logs/

# 测试覆盖率
coverage/
.nyc_output/

# 临时文件
*.tmp
*.temp
```

### 常用别名

```bash
# 配置别名
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --all"
git config --global alias.last "log -1 HEAD"
git config --global alias.unstage "reset HEAD --"
git config --global alias.visual "!gitk"
```

### 多账户配置

```bash
# ~/.gitconfig
[user]
    name = Personal Name
    email = personal@email.com

[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig-work

# ~/.gitconfig-work
[user]
    name = Work Name
    email = work@company.com

# SSH 配置 ~/.ssh/config
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_personal

Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_work

# 克隆时使用
git clone git@github-work:company/repo.git
```

### 大文件处理

```bash
# 安装 Git LFS
git lfs install

# 跟踪大文件类型
git lfs track "*.psd"
git lfs track "*.zip"

# 查看跟踪的文件
git lfs ls-files

# .gitattributes
*.psd filter=lfs diff=lfs merge=lfs -text
*.zip filter=lfs diff=lfs merge=lfs -text
```

### 清理敏感信息

```bash
# 使用 BFG Repo-Cleaner（推荐）
bfg --delete-files password.txt
bfg --replace-text passwords.txt

# 使用 git filter-branch
git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch path/to/file" \
    --prune-empty --tag-name-filter cat -- --all

# 强制推送
git push origin --force --all
git push origin --force --tags
```
