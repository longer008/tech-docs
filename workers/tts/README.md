# TTS Worker

Edge TTS 代理服务，部署到 Cloudflare Workers。

## 部署步骤

```bash
cd workers/tts

# 安装依赖
pnpm install

# 登录 Cloudflare（首次需要）
npx wrangler login

# 本地测试
pnpm dev

# 部署
pnpm deploy
```

部署成功后会输出类似：
```
https://tech-docs-tts.<your-subdomain>.workers.dev
```

## 接入播放器

部署后，修改 `docs/.vitepress/components/PodcastPlayer.vue` 中的服务地址：

```typescript
const TTS_SERVER = 'https://tech-docs-tts.<your-subdomain>.workers.dev'
```

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| POST | `/tts` | 一次性生成 |
| POST | `/tts/stream` | 流式生成（推荐） |

请求体：
```json
{
  "text": "要朗读的文本",
  "voice": "zh-CN-XiaoxiaoNeural",
  "rate": "+5%"
}
```

## 注意事项

- Cloudflare Workers 免费版每天 10 万次请求，个人使用足够
- 每次请求 CPU 时间限制 10ms（生成音频是 I/O 操作，不消耗 CPU）
- 单次请求超时 30 秒，长文本已自动分段处理
- 使用 `nodejs_compat` 兼容标志支持 WebSocket
