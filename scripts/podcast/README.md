# 播客 TTS 服务

Edge TTS + AI 改写的语音生成服务。

## 文件说明

```
server.py       # 主服务文件
.env.example    # 环境变量示例（复制为 .env 并填写）
.env            # 实际配置（不提交到 git）
```

## 部署到服务器

### 1. 安装依赖

```bash
pip install edge-tts
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，填写 LLM_API_KEY、ADMIN_TOKEN 等
```

### 3. 启动服务

```bash
# 直接运行
python server.py

# 停掉当前进程
kill $(pgrep -f server.py)

# 后台运行（推荐）
nohup python -u server.py > server.log 2>&1 &

# 或用 systemd / supervisor 管理进程
```

### 4. 配置前端

修改 `docs/.vitepress/components/PodcastPlayer.vue`：

```typescript
const TTS_SERVER = 'https://your-server.com:3456'
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `LLM_API_BASE` | OpenAI 兼容 API 地址 | `https://api.openai.com/v1` |
| `LLM_API_KEY` | API Key | 空（不启用 AI 改写） |
| `LLM_MODEL` | 模型名称 | `gpt-4o-mini` |
| `ADMIN_TOKEN` | 32位管理员密钥 | 空（不启用认证） |

## 生成 ADMIN_TOKEN

```bash
python -c "import secrets; print(secrets.token_hex(16))"
```

## 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| POST | `/rewrite` | AI 改写文本 |
| POST | `/tts` | 生成语音（需 X-Admin-Token 头） |
| POST | `/tts/stream` | 分段生成语音（需 X-Admin-Token 头） |
