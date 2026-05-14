# Edge TTS - Deno Deploy

使用 Edge TTS WebSocket 协议生成中文语音，部署到 Deno Deploy（免费）。

## 部署步骤

### 方式一：通过 GitHub（推荐）

1. 把 `deno/tts/main.ts` 推送到 GitHub
2. 打开 [dash.deno.com](https://dash.deno.com) → New Project
3. 连接 GitHub 仓库，入口文件选 `deno/tts/main.ts`
4. 点 Deploy

### 方式二：Playground（快速测试）

1. 打开 [dash.deno.com/playground](https://dash.deno.com/playground)
2. 把 `main.ts` 内容粘贴进去
3. 点 Save & Deploy

## 接入播放器

部署后修改 `docs/.vitepress/components/PodcastPlayer.vue`：

```typescript
const TTS_SERVER = 'https://your-project.deno.dev'
```

## 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| POST | `/tts` | 一次性生成 |
| POST | `/tts/stream` | 分段流式生成（推荐） |

请求体：
```json
{
  "text": "要朗读的文本",
  "voice": "zh-CN-XiaoxiaoNeural",
  "rate": "+5%"
}
```

## 可用语音

| voice | 特点 |
|-------|------|
| zh-CN-XiaoxiaoNeural | 女声，温暖自然（默认） |
| zh-CN-YunxiNeural | 男声，年轻活力 |
| zh-CN-YunyangNeural | 男声，新闻播报 |
| zh-CN-XiaoyiNeural | 女声，活泼 |
| zh-CN-YunfengNeural | 男声，沉稳 |

## 费用

Deno Deploy 免费版：
- 每月 100,000 次请求
- 每月 100 GiB 出站流量
- 个人使用完全免费
