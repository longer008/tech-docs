# Cloudflare Pages 构建优化指南

## 问题：内存溢出错误

如果在 Cloudflare Pages 构建时遇到以下错误：

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

这是因为 VitePress 构建大型文档时需要较多内存，而 Cloudflare Pages 的默认内存限制较低。

## 解决方案

### 方案一：在 Cloudflare Dashboard 配置（推荐）

#### 1. 修改构建命令

在 Cloudflare Pages 项目设置中：

```bash
# 原构建命令
pnpm docs:build

# 修改为（增加内存限制）
NODE_OPTIONS='--max-old-space-size=3072' pnpm docs:build
```

#### 2. 添加环境变量

在 **Settings** → **Environment variables** 中添加：

```bash
NODE_VERSION=20
NODE_OPTIONS=--max-old-space-size=3072
```

#### 3. 重新部署

点击 **Deployments** → **Retry deployment** 或推送新代码触发构建。

---

### 方案二：使用 wrangler.toml 配置文件

项目根目录已包含 `wrangler.toml` 文件，配置如下：

```toml
[build]
command = "NODE_OPTIONS='--max-old-space-size=3072' pnpm docs:build"
cwd = "."
publish = "docs/.vitepress/dist"

[build.environment]
NODE_VERSION = "20"
NODE_OPTIONS = "--max-old-space-size=3072"
```

Cloudflare Pages 会自动读取此配置文件。

---

### 方案三：优化 VitePress 配置

如果内存问题仍然存在，可以进一步优化 VitePress 配置。

#### 1. 减少并发构建

在 `docs/.vitepress/config.mts` 中添加：

```typescript
export default defineConfig({
  // ... 其他配置
  
  vite: {
    build: {
      // 减少并发构建数量
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // 手动分块，减少单个文件大小
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router'],
            'vitepress-vendor': ['vitepress'],
            'ui-vendor': ['medium-zoom'],
          }
        }
      }
    }
  }
})
```

#### 2. 禁用某些插件（临时）

如果构建仍然失败，可以临时禁用一些插件：

```typescript
// 注释掉占用内存较多的插件
export default defineConfig({
  vite: {
    plugins: [
      // UnoCSS(),  // 临时禁用
      NProgress(),
      // groupIconVitePlugin(),  // 临时禁用
    ]
  }
})
```

#### 3. 分批构建（高级）

如果文档非常多，可以考虑分批构建：

```bash
# 只构建部分文档
pnpm docs:build --filter "docs/frontend/**"
```

---

## 内存限制说明

### Cloudflare Pages 默认限制

- 默认内存：约 1GB
- 构建时间：最长 20 分钟
- 免费额度：500 次构建/月

### Node.js 内存选项

```bash
# 1GB 内存（默认）
NODE_OPTIONS='--max-old-space-size=1024'

# 2GB 内存
NODE_OPTIONS='--max-old-space-size=2048'

# 3GB 内存（推荐）
NODE_OPTIONS='--max-old-space-size=3072'

# 4GB 内存（如果 Cloudflare 支持）
NODE_OPTIONS='--max-old-space-size=4096'
```

---

## 验证构建成功

### 1. 查看构建日志

在 Cloudflare Dashboard：
1. 进入项目 → **Deployments**
2. 点击最新的部署
3. 查看 **Build log**

成功的日志应该包含：

```
✓ building client + server bundles...
✓ rendering pages...
build complete in XXs.
```

### 2. 测试网站

访问部署的 URL：`https://tech-docs.pages.dev`

检查：
- ✅ 页面正常加载
- ✅ 导航正常工作
- ✅ 搜索功能正常
- ✅ 图片和样式正常显示

---

## 常见问题

### Q1: 为什么 GitHub Pages 构建成功，Cloudflare 失败？

**A**: GitHub Actions 的构建环境内存更大（7GB），而 Cloudflare Pages 默认只有约 1GB。

### Q2: 增加内存限制会影响性能吗？

**A**: 不会。这只是构建时的内存限制，不影响网站运行性能。

### Q3: 如果 3GB 内存还不够怎么办？

**A**: 可以尝试：
1. 优化 VitePress 配置（减少插件）
2. 分批构建文档
3. 使用 GitHub Actions 构建后上传到 Cloudflare（方案二）

### Q4: 构建时间太长怎么办？

**A**: 
1. 启用 Cloudflare 的构建缓存
2. 减少不必要的插件
3. 优化图片大小

---

## 推荐配置总结

### Cloudflare Dashboard 设置

```yaml
项目名称: tech-docs
生产分支: main
框架预设: None
构建命令: NODE_OPTIONS='--max-old-space-size=3072' pnpm docs:build
构建输出目录: docs/.vitepress/dist
根目录: /

环境变量:
  NODE_VERSION: 20
  NODE_OPTIONS: --max-old-space-size=3072
```

### package.json 脚本

```json
{
  "scripts": {
    "docs:build": "vitepress build docs",
    "docs:build:cf": "NODE_OPTIONS='--max-old-space-size=3072' vitepress build docs"
  }
}
```

### wrangler.toml 配置

```toml
[build]
command = "NODE_OPTIONS='--max-old-space-size=3072' pnpm docs:build"
publish = "docs/.vitepress/dist"

[build.environment]
NODE_VERSION = "20"
NODE_OPTIONS = "--max-old-space-size=3072"
```

---

## 相关资源

- [Cloudflare Pages 构建配置](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Node.js 内存管理](https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-megabytes)
- [VitePress 性能优化](https://vitepress.dev/guide/performance)
