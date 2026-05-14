# 播客生成工具

将 Markdown 文档转为播客音频，在 VitePress 页面上播放。

## 依赖

- Python 3.8+
- edge-tts（`pip install edge-tts`）
- Node.js 16+

## 使用方法

### 生成单个文档的播客

```bash
# 基本用法
pnpm podcast:generate docs/ai-interview/index.md

# 指定语音和语速
pnpm podcast:generate docs/frontend/vue/vue3-interview.md --voice yunxi --rate +10%
```

### 可用语音

| 名称 | 语音ID | 特点 |
|------|--------|------|
| xiaoxiao | zh-CN-XiaoxiaoNeural | 女声，温暖自然（默认） |
| yunxi | zh-CN-YunxiNeural | 男声，年轻活力 |
| yunyang | zh-CN-YunyangNeural | 男声，新闻播报风格 |
| xiaoyi | zh-CN-XiaoyiNeural | 女声，活泼 |
| yunfeng | zh-CN-YunfengNeural | 男声，沉稳 |

### 语速选项

- `+0%`：正常速度
- `+5%`：稍快（默认，适合技术内容）
- `+10%`：较快
- `-10%`：较慢

## 工作原理

1. **内容提取**（extract-text.js）：解析 Markdown，智能跳过代码块、表格、HTML 等不适合朗读的内容
2. **音频生成**（generate-audio.py）：调用 Edge TTS API 将文本转为 MP3
3. **索引更新**：更新 `docs/public/podcast/index.json`，播放器组件据此判断页面是否有音频
4. **页面播放**：`PodcastPlayer.vue` 组件自动检测当前页面是否有对应音频，有则显示播放器

## 文件结构

```
scripts/podcast/
├── README.md              # 本文件
├── extract-text.js        # Markdown → 纯文本
├── generate-audio.py      # 文本 → MP3（Edge TTS）
└── generate-podcast.js    # 一键生成主脚本

docs/public/podcast/
├── index.json             # 播客索引（记录哪些页面有音频）
└── ai-interview/          # 按目录组织的音频文件
    ├── xxx.mp3
    └── xxx.json           # 字幕数据

docs/.vitepress/components/
└── PodcastPlayer.vue      # 播放器组件
```

## 内容过滤规则

以下内容会被自动跳过（不转为语音）：

- ✅ 代码块（\`\`\`....\`\`\`）
- ✅ 表格
- ✅ 图片
- ✅ HTML 标签
- ✅ 链接 URL（保留链接文字）
- ✅ Frontmatter
- ✅ VitePress 容器语法（:::）
- ✅ 水平线
- ✅ 纯符号行

保留的内容：

- ✅ 标题（转为自然停顿）
- ✅ 段落文字
- ✅ 列表文字
- ✅ 引用文字
- ✅ 加粗/斜体文字（去除标记）

## 播放器功能

- ▶️ 播放/暂停
- ⏪⏩ 快退/快进 10 秒
- 🎚️ 进度条拖动
- 🔊 音量调节
- ⚡ 倍速播放（0.75x ~ 2x）
- 📱 响应式设计
