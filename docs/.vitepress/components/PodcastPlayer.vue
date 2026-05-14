<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

// 播放器状态
const isPlaying = ref(false)
const isGenerating = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playbackRate = ref(1)
const volume = ref(0.8)
const isExpanded = ref(false)
const audioReady = ref(false)
const audioSrc = ref('')
const errorMsg = ref('')
const serverOnline = ref(false)

// Audio 元素引用
let audio: HTMLAudioElement | null = null

const route = useRoute()
const { page } = useData()

// 本地 TTS 服务地址（使用 127.0.0.1 避免代理拦截 localhost）
// 部署 Cloudflare Worker 后改为 Worker 地址，如：
// const TTS_SERVER = 'https://tech-docs-tts.<your-subdomain>.workers.dev'
// const TTS_SERVER = 'http://127.0.0.1:3456'
const TTS_SERVER = 'https://tts.fable.cc.cd'

// 格式化时间
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const progress = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

const timeDisplay = computed(() => {
  return `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`
})

const rateOptions = [0.75, 1, 1.25, 1.5, 1.75, 2]

// ============ 检查服务状态 ============

async function checkServer() {
  try {
    const res = await fetch(`${TTS_SERVER}/health`, { signal: AbortSignal.timeout(2000) })
    serverOnline.value = res.ok
  } catch {
    serverOnline.value = false
  }
}

// ============ 内容提取 ============

function extractPageText(): string {
  // 尝试多个可能的内容容器
  const content = document.querySelector('.vp-doc') 
    || document.querySelector('.content-container')
    || document.querySelector('main')
    || document.querySelector('#app')

  if (!content) {
    console.warn('[PodcastPlayer] 未找到内容容器')
    return ''
  }

  const clone = content.cloneNode(true) as HTMLElement

  // 移除不需要朗读的元素
  const removeSelectors = [
    // 代码相关
    'pre',                    // 代码块
    'code',                   // 行内代码
    '.line-numbers-wrapper',  // 行号
    '.line-numbers',          // 行号
    '.lang',                  // 语言标签
    'button.copy',            // 复制按钮
    '[class*="language-"]',   // 整个代码容器（div.language-xxx）

    // 表格和媒体
    'table',
    'img', 'svg', 'video', 'audio', 'canvas', 'iframe',

    // VitePress 特殊元素
    '.header-anchor',         // 标题锚点 #
    '.custom-block',          // 所有提示块（tip/warning/danger/info/details）
    'blockquote',             // 引用块（通常是提示信息）

    // 播放器和组件
    '.podcast-player',
    '.reading-time',

    // 其他
    'style', 'script',
    '.vp-code-group',         // 代码组
    '.vp-adaptive-theme',     // 主题相关
  ]

  removeSelectors.forEach(sel => {
    clone.querySelectorAll(sel).forEach(el => el.remove())
  })

  let text = clone.innerText || clone.textContent || ''

  // 后处理：清理残留噪音
  text = text
    // 移除连续数字行（代码行号残留）
    .replace(/^(\d+\s*\n?){3,}/gm, '')
    // 移除单独的数字行
    .replace(/^\d+\s*$/gm, '')
    // 移除 "javascript"、"typescript" 等语言标签残留
    .replace(/^(javascript|typescript|html|css|python|java|bash|shell|json|xml|sql|yaml|vue|jsx|tsx|go|rust|c|cpp)\s*$/gim, '')
    // 移除 emoji + 文字的提示行（如 ⚠️ 本文档...）
    .replace(/^[⚠️✅❌🔥💡📝🎯⏳🔄📊]+\s*.{0,20}(过时|更新中|更新时间|注意|提示|警告).*$/gm, '')
    // 移除 "更新时间：xxxx" 格式
    .replace(/^.*更新时间[：:]\s*\d{4}[-/]\d{2}.*$/gm, '')
    // 移除"参考资料"章节及其后面的内容（通常是链接列表）
    .replace(/\n参考资料[\s\S]*$/m, '')
    .replace(/\n参考链接[\s\S]*$/m, '')
    .replace(/\n相关资源[\s\S]*$/m, '')
    .replace(/\n推荐阅读[\s\S]*$/m, '')
    // 移除 URL 链接
    .replace(/https?:\/\/[^\s]+/g, '')
    // 移除多余空行
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+$/gm, '')
    .trim()

  console.debug(`[PodcastPlayer] 提取文本: ${text.length} 字符`)
  return text
}

// ============ 生成音频 ============

async function handleGenerate() {
  errorMsg.value = ''

  // 先检查缓存
  const cacheKey = getCacheKey()
  const cached = await getCachedAudio(cacheKey)
  if (cached) {
    setupAudio(cached)
    return
  }

  // 检查服务是否在线
  await checkServer()
  if (!serverOnline.value) {
    errorMsg.value = '请先启动 TTS 服务：python scripts/podcast/server.py'
    return
  }

  // 提取文本
  const text = extractPageText()
  if (!text || text.length < 5) {
    errorMsg.value = `页面内容提取失败（${text.length} 字符），请刷新后重试`
    return
  }

  isGenerating.value = true

  try {
    // 使用流式接口，边生成边播放
    const response = await fetch(`${TTS_SERVER}/tts/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 50000) }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: '生成失败' }))
      throw new Error(err.error || `HTTP ${response.status}`)
    }

    // 流式读取音频数据
    const reader = response.body?.getReader()
    if (!reader) throw new Error('浏览器不支持流式读取')

    const audioChunks: Uint8Array[] = []
    let firstChunkPlayed = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      audioChunks.push(value)

      // 收到第一批数据后立即开始播放
      if (!firstChunkPlayed && getTotalSize(audioChunks) > 8000) {
        firstChunkPlayed = true
        const partialBlob = new Blob(audioChunks, { type: 'audio/mp3' })
        setupAudio(partialBlob)
      }
    }

    // 全部完成，用完整音频替换
    const fullBlob = new Blob(audioChunks, { type: 'audio/mp3' })

    if (fullBlob.size < 100) {
      throw new Error('未收到音频数据，请检查 TTS 服务是否正常运行')
    }

    const currentPos = audio ? audio.currentTime : 0
    const wasPlaying = isPlaying.value

    setupAudio(fullBlob)

    // 恢复播放位置
    if (audio && currentPos > 0) {
      audio.currentTime = currentPos
      if (wasPlaying) audio.play().catch(() => {})
    }

    // 缓存完整音频
    await setCachedAudio(cacheKey, fullBlob)

  } catch (e: any) {
    errorMsg.value = e.message || '生成失败，请重试'
  } finally {
    isGenerating.value = false
  }
}

function getTotalSize(chunks: Uint8Array[]): number {
  return chunks.reduce((sum, c) => sum + c.length, 0)
}

// ============ IndexedDB 缓存 ============

const DB_NAME = 'podcast-cache'
const STORE_NAME = 'audio'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getCachedAudio(key: string): Promise<Blob | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const request = tx.objectStore(STORE_NAME).get(key)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
  } catch { return null }
}

async function setCachedAudio(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(blob, key)
  } catch {}
}

function getCacheKey(): string {
  return page.value.relativePath || route.path
}

// ============ 播放控制 ============

function setupAudio(blob: Blob) {
  if (audioSrc.value) URL.revokeObjectURL(audioSrc.value)
  audioSrc.value = URL.createObjectURL(blob)
  audioReady.value = true
  initAudio()
}

function initAudio() {
  if (audio) {
    audio.pause()
    audio.removeEventListener('timeupdate', onTimeUpdate)
    audio.removeEventListener('loadedmetadata', onLoadedMetadata)
    audio.removeEventListener('ended', onEnded)
    audio.removeEventListener('error', onError)
  }

  audio = new Audio(audioSrc.value)
  audio.volume = volume.value
  audio.playbackRate = playbackRate.value
  audio.addEventListener('timeupdate', onTimeUpdate)
  audio.addEventListener('loadedmetadata', onLoadedMetadata)
  audio.addEventListener('ended', onEnded)
  audio.addEventListener('error', onError)

  // 自动播放
  audio.play().then(() => { isPlaying.value = true }).catch(() => {})
}

function onTimeUpdate() { if (audio) currentTime.value = audio.currentTime }
function onLoadedMetadata() { if (audio) duration.value = audio.duration }
function onEnded() { isPlaying.value = false; currentTime.value = 0 }
function onError() { errorMsg.value = '音频播放失败'; isPlaying.value = false }

function togglePlay() {
  if (!audio || !audioReady.value) return
  if (isPlaying.value) {
    audio.pause()
    isPlaying.value = false
  } else {
    audio.play().then(() => { isPlaying.value = true }).catch(() => { errorMsg.value = '播放失败' })
  }
}

function seekTo(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  if (audio) {
    audio.currentTime = percent * duration.value
    currentTime.value = audio.currentTime
  }
}

function skip(seconds: number) {
  if (audio) audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration.value))
}

function setRate(rate: number) {
  playbackRate.value = rate
  if (audio) audio.playbackRate = rate
}

function setVolume(event: Event) {
  volume.value = parseFloat((event.target as HTMLInputElement).value)
  if (audio) audio.volume = volume.value
}

async function handleRegenerate() {
  const cacheKey = getCacheKey()
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(cacheKey)
  } catch {}
  audioReady.value = false
  isPlaying.value = false
  if (audio) audio.pause()
  await handleGenerate()
}

// 路由变化时重置
watch(() => route.path, () => {
  if (audio) { audio.pause(); isPlaying.value = false }
  currentTime.value = 0
  duration.value = 0
  audioReady.value = false
  isGenerating.value = false
  errorMsg.value = ''
  checkCache()
})

async function checkCache() {
  const cached = await getCachedAudio(getCacheKey())
  if (cached) setupAudio(cached)
}

onMounted(() => {
  checkServer()
  checkCache()
})

onUnmounted(() => {
  if (audio) {
    audio.pause()
    audio.removeEventListener('timeupdate', onTimeUpdate)
    audio.removeEventListener('loadedmetadata', onLoadedMetadata)
    audio.removeEventListener('ended', onEnded)
    audio.removeEventListener('error', onError)
  }
  if (audioSrc.value) URL.revokeObjectURL(audioSrc.value)
})
</script>

<template>
  <div class="podcast-player" role="region" aria-label="播客播放器">
    <!-- 未生成：显示生成按钮 -->
    <div v-if="!audioReady && !isGenerating" class="player-idle">
      <button class="btn-generate" @click="handleGenerate" aria-label="生成并播放本页语音">
        🎧 听播客
      </button>
      <span class="idle-hint">AI 语音朗读本页内容</span>
    </div>

    <!-- 生成中 -->
    <div v-if="isGenerating" class="player-generating">
      <span class="generating-icon">🔊</span>
      <span class="generating-text">正在生成语音，请稍候...</span>
    </div>

    <!-- 播放器 -->
    <div v-if="audioReady" class="player-bar">
      <button class="btn-play" @click="togglePlay" :aria-label="isPlaying ? '暂停播放' : '开始播放'">
        <span v-if="isPlaying">⏸️</span>
        <span v-else>▶️</span>
      </button>

      <div class="player-info">
        <span class="player-title">🎧 播客模式</span>
        <span class="player-time">{{ timeDisplay }}</span>
      </div>

      <div class="progress-bar" @click="seekTo" role="slider" :aria-valuenow="Math.round(progress)" aria-valuemin="0" aria-valuemax="100" aria-label="播放进度">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <div class="player-controls">
        <button class="btn-skip" @click="skip(-10)" aria-label="后退10秒">⏪</button>
        <button class="btn-skip" @click="skip(10)" aria-label="前进10秒">⏩</button>
        <button class="btn-rate" @click="isExpanded = !isExpanded" :aria-label="`当前${playbackRate}倍速，点击展开设置`">{{ playbackRate }}x</button>
      </div>
    </div>

    <!-- 展开面板 -->
    <div v-if="audioReady && isExpanded" class="player-panel">
      <div class="panel-section">
        <span class="panel-label">倍速</span>
        <div class="rate-buttons">
          <button v-for="rate in rateOptions" :key="rate" :class="{ active: playbackRate === rate }" @click="setRate(rate)">{{ rate }}x</button>
        </div>
      </div>
      <div class="panel-section">
        <span class="panel-label">音量</span>
        <input type="range" min="0" max="1" step="0.1" :value="volume" @input="setVolume" class="volume-slider" />
      </div>
      <div class="panel-section">
        <button class="btn-regenerate" @click="handleRegenerate">🔄 重新生成</button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="player-error">⚠️ {{ errorMsg }}</div>
  </div>
</template>

<style scoped>
.podcast-player {
  margin: 16px 0;
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.player-idle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.btn-generate {
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  background: var(--vp-c-brand-1);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}
.btn-generate:hover {
  transform: scale(1.05);
  background: var(--vp-c-brand-2);
}

.idle-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.player-generating {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
}
.generating-icon {
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.generating-text {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.player-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.btn-play {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--vp-c-brand-1);
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.btn-play:hover { transform: scale(1.1); }

.player-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}
.player-title { font-size: 13px; font-weight: 600; color: var(--vp-c-text-1); }
.player-time { font-size: 11px; color: var(--vp-c-text-3); font-variant-numeric: tabular-nums; }

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--vp-c-divider);
  border-radius: 3px;
  cursor: pointer;
  min-width: 60px;
}
.progress-bar:hover { height: 8px; }
.progress-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  border-radius: 3px;
  transition: width 0.1s linear;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.btn-skip, .btn-rate {
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
}
.btn-skip:hover, .btn-rate:hover { background: var(--vp-c-bg-mute); }
.btn-rate { font-weight: 600; min-width: 36px; text-align: center; }

.player-panel {
  padding: 12px 16px;
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.panel-section { display: flex; align-items: center; gap: 8px; }
.panel-label { font-size: 12px; color: var(--vp-c-text-3); }

.rate-buttons { display: flex; gap: 4px; }
.rate-buttons button {
  padding: 4px 10px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
}
.rate-buttons button:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.rate-buttons button.active { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: white; }

.volume-slider {
  width: 80px; height: 4px;
  -webkit-appearance: none; appearance: none;
  background: var(--vp-c-divider); border-radius: 2px; outline: none;
}
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 14px; height: 14px;
  border-radius: 50%; background: var(--vp-c-brand-1); cursor: pointer;
}

.btn-regenerate {
  padding: 4px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
}
.btn-regenerate:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }

.player-error {
  padding: 8px 16px;
  font-size: 12px;
  color: var(--vp-c-danger-1);
  border-top: 1px solid var(--vp-c-divider);
}

@media (max-width: 640px) {
  .player-bar { flex-wrap: wrap; gap: 8px; }
  .progress-bar { order: 10; width: 100%; flex: none; }
  .player-info { flex: 1; }
}
</style>
