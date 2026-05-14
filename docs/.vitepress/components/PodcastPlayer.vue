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
const generateProgress = ref(0) // 0-100

// Audio 元素引用
let audio: HTMLAudioElement | null = null
let cachedAudioBlob: Blob | null = null

const route = useRoute()
const { page } = useData()

// 默认语音
const VOICE = 'zh-CN-XiaoxiaoNeural'
const RATE = '+5%'
const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3'

// 格式化时间
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 进度百分比
const progress = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

const timeDisplay = computed(() => {
  return `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`
})

const rateOptions = [0.75, 1, 1.25, 1.5, 1.75, 2]

// ============ 内容提取 ============

/**
 * 从当前页面 DOM 中提取可朗读的文本
 */
function extractPageText(): string {
  const content = document.querySelector('.vp-doc')
  if (!content) return ''

  // 克隆节点避免修改原始 DOM
  const clone = content.cloneNode(true) as HTMLElement

  // 移除不需要朗读的元素
  const removeSelectors = [
    'pre',           // 代码块
    'code',          // 行内代码
    'table',         // 表格
    '.header-anchor',// 标题锚点
    'img',           // 图片
    'svg',           // SVG
    '.podcast-player', // 播放器自身
    '.reading-time', // 阅读时间组件
    'style',         // 样式
    'script',        // 脚本
    '.custom-block.details', // 折叠块
  ]

  removeSelectors.forEach(sel => {
    clone.querySelectorAll(sel).forEach(el => el.remove())
  })

  // 获取纯文本
  let text = clone.innerText || clone.textContent || ''

  // 清理多余空白
  text = text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+$/gm, '')
    .trim()

  return text
}

// ============ Edge TTS WebSocket ============

/**
 * 通过 Edge TTS WebSocket 生成音频
 */
async function generateAudio(text: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const audioChunks: Uint8Array[] = []

    // 生成请求 ID
    const requestId = crypto.randomUUID().replace(/-/g, '')

    // Edge TTS WebSocket 端点
    const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${requestId}`

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      // 发送配置
      const configMessage = `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"${OUTPUT_FORMAT}"}}}}`
      ws.send(configMessage)

      // 发送 SSML
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'><voice name='${VOICE}'><prosody rate='${RATE}' volume='+0%'>${escapeXml(text)}</prosody></voice></speak>`

      const ssmlMessage = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`
      ws.send(ssmlMessage)
    }

    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        // 二进制音频数据
        event.data.arrayBuffer().then(buffer => {
          const view = new Uint8Array(buffer)
          // 跳过头部（前 2 字节是头部长度）
          const headerLen = (view[0] << 8) | view[1]
          const audioData = view.slice(headerLen + 2)
          if (audioData.length > 0) {
            audioChunks.push(audioData)
            // 更新进度（估算）
            generateProgress.value = Math.min(95, generateProgress.value + 1)
          }
        })
      } else if (typeof event.data === 'string') {
        if (event.data.includes('Path:turn.end')) {
          // 合成完成
          generateProgress.value = 100
          ws.close()
          const blob = new Blob(audioChunks, { type: 'audio/mp3' })
          resolve(blob)
        }
      }
    }

    ws.onerror = (err) => {
      ws.close()
      reject(new Error('WebSocket 连接失败，请检查网络'))
    }

    ws.onclose = (event) => {
      if (audioChunks.length === 0 && generateProgress.value < 100) {
        reject(new Error('音频生成失败，请重试'))
      }
    }

    // 超时处理
    setTimeout(() => {
      if (generateProgress.value < 100) {
        ws.close()
        if (audioChunks.length > 0) {
          const blob = new Blob(audioChunks, { type: 'audio/mp3' })
          resolve(blob)
        } else {
          reject(new Error('生成超时，请重试'))
        }
      }
    }, 120000) // 2 分钟超时
  })
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
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
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

async function setCachedAudio(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put(blob, key)
  } catch {
    // 缓存失败不影响使用
  }
}

// ============ 播放控制 ============

function getCacheKey(): string {
  return page.value.relativePath || route.path
}

async function handleGenerate() {
  errorMsg.value = ''
  generateProgress.value = 0

  // 先检查缓存
  const cacheKey = getCacheKey()
  const cached = await getCachedAudio(cacheKey)
  if (cached) {
    cachedAudioBlob = cached
    setupAudio(cached)
    return
  }

  // 提取文本
  const text = extractPageText()
  if (!text || text.length < 10) {
    errorMsg.value = '页面内容太少，无法生成'
    return
  }

  // 文本过长时截断（Edge TTS 单次限制约 100KB）
  const maxLen = 50000
  const truncatedText = text.length > maxLen ? text.slice(0, maxLen) : text

  isGenerating.value = true
  generateProgress.value = 5

  try {
    const blob = await generateAudio(truncatedText)
    cachedAudioBlob = blob

    // 缓存到 IndexedDB
    await setCachedAudio(cacheKey, blob)

    setupAudio(blob)
  } catch (e: any) {
    errorMsg.value = e.message || '生成失败'
  } finally {
    isGenerating.value = false
  }
}

function setupAudio(blob: Blob) {
  // 释放旧的 URL
  if (audioSrc.value) {
    URL.revokeObjectURL(audioSrc.value)
  }

  audioSrc.value = URL.createObjectURL(blob)
  audioReady.value = true

  // 初始化 Audio
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

  // 自动开始播放
  audio.play().then(() => {
    isPlaying.value = true
  }).catch(() => {})
}

function onTimeUpdate() {
  if (audio) currentTime.value = audio.currentTime
}

function onLoadedMetadata() {
  if (audio) duration.value = audio.duration
}

function onEnded() {
  isPlaying.value = false
  currentTime.value = 0
}

function onError() {
  errorMsg.value = '音频播放失败'
  isPlaying.value = false
}

function togglePlay() {
  if (!audio || !audioReady.value) return

  if (isPlaying.value) {
    audio.pause()
    isPlaying.value = false
  } else {
    audio.play().then(() => {
      isPlaying.value = true
    }).catch(() => {
      errorMsg.value = '播放失败'
    })
  }
}

function seekTo(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const newTime = percent * duration.value

  if (audio) {
    audio.currentTime = newTime
    currentTime.value = newTime
  }
}

function skip(seconds: number) {
  if (audio) {
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration.value))
  }
}

function setRate(rate: number) {
  playbackRate.value = rate
  if (audio) audio.playbackRate = rate
}

function setVolume(event: Event) {
  const target = event.target as HTMLInputElement
  volume.value = parseFloat(target.value)
  if (audio) audio.volume = volume.value
}

// 路由变化时重置
watch(() => route.path, () => {
  if (audio) {
    audio.pause()
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
  }
  audioReady.value = false
  isGenerating.value = false
  generateProgress.value = 0
  errorMsg.value = ''
  cachedAudioBlob = null

  // 检查新页面是否有缓存
  checkCache()
})

async function checkCache() {
  const cacheKey = getCacheKey()
  const cached = await getCachedAudio(cacheKey)
  if (cached) {
    cachedAudioBlob = cached
    setupAudio(cached)
  }
}

// 重新生成（清除缓存）
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
  cachedAudioBlob = null

  await handleGenerate()
}

onMounted(() => {
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
  if (audioSrc.value) {
    URL.revokeObjectURL(audioSrc.value)
  }
})
</script>

<template>
  <div class="podcast-player">
    <!-- 未生成状态：显示生成按钮 -->
    <div v-if="!audioReady && !isGenerating" class="player-idle">
      <button class="btn-generate" @click="handleGenerate">
        🎧 听播客
      </button>
      <span class="idle-hint">AI 语音朗读本页内容</span>
    </div>

    <!-- 生成中 -->
    <div v-if="isGenerating" class="player-generating">
      <div class="generating-info">
        <span class="generating-icon">🔊</span>
        <span class="generating-text">正在生成语音...</span>
        <span class="generating-percent">{{ generateProgress }}%</span>
      </div>
      <div class="progress-bar generating">
        <div class="progress-fill" :style="{ width: generateProgress + '%' }"></div>
      </div>
    </div>

    <!-- 播放器 -->
    <div v-if="audioReady" class="player-bar">
      <button class="btn-play" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
        <span v-if="isPlaying" class="icon-pause">⏸️</span>
        <span v-else class="icon-play">▶️</span>
      </button>

      <div class="player-info">
        <span class="player-title">🎧 播客模式</span>
        <span class="player-time">{{ timeDisplay }}</span>
      </div>

      <!-- 进度条 -->
      <div class="progress-bar" @click="seekTo">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <!-- 控制按钮 -->
      <div class="player-controls">
        <button class="btn-skip" @click="skip(-10)" title="后退10秒">⏪</button>
        <button class="btn-skip" @click="skip(10)" title="前进10秒">⏩</button>
        <button class="btn-rate" @click="isExpanded = !isExpanded" :title="`${playbackRate}x`">
          {{ playbackRate }}x
        </button>
      </div>
    </div>

    <!-- 展开面板 -->
    <div v-if="audioReady && isExpanded" class="player-panel">
      <div class="panel-section">
        <span class="panel-label">倍速</span>
        <div class="rate-buttons">
          <button
            v-for="rate in rateOptions"
            :key="rate"
            :class="{ active: playbackRate === rate }"
            @click="setRate(rate)"
          >
            {{ rate }}x
          </button>
        </div>
      </div>

      <div class="panel-section">
        <span class="panel-label">音量</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          :value="volume"
          @input="setVolume"
          class="volume-slider"
        />
      </div>

      <div class="panel-section">
        <button class="btn-regenerate" @click="handleRegenerate">
          🔄 重新生成
        </button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="player-error">
      ⚠️ {{ errorMsg }}
    </div>
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

/* 未生成状态 */
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

/* 生成中 */
.player-generating {
  padding: 12px 16px;
}

.generating-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.generating-icon {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.generating-text {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.generating-percent {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-left: auto;
}

/* 播放器栏 */
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
  transition: transform 0.2s, background 0.2s;
  flex-shrink: 0;
}

.btn-play:hover {
  transform: scale(1.1);
  background: var(--vp-c-brand-2);
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

.player-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.player-time {
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}

/* 进度条 */
.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--vp-c-divider);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  min-width: 60px;
}

.progress-bar:hover {
  height: 8px;
}

.progress-bar.generating {
  cursor: default;
}

.progress-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  border-radius: 3px;
  transition: width 0.1s linear;
}

/* 控制按钮 */
.player-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.btn-skip,
.btn-rate {
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  transition: background 0.2s;
}

.btn-skip:hover,
.btn-rate:hover {
  background: var(--vp-c-bg-mute);
}

.btn-rate {
  font-weight: 600;
  min-width: 36px;
  text-align: center;
}

/* 展开面板 */
.player-panel {
  padding: 12px 16px;
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.panel-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-label {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.rate-buttons {
  display: flex;
  gap: 4px;
}

.rate-buttons button {
  padding: 4px 10px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.rate-buttons button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.rate-buttons button.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: white;
}

.volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--vp-c-divider);
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  cursor: pointer;
}

.btn-regenerate {
  padding: 4px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-regenerate:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* 错误提示 */
.player-error {
  padding: 8px 16px;
  font-size: 12px;
  color: var(--vp-c-danger-1);
  border-top: 1px solid var(--vp-c-divider);
}

/* 响应式 */
@media (max-width: 640px) {
  .player-bar {
    flex-wrap: wrap;
    gap: 8px;
  }

  .progress-bar {
    order: 10;
    width: 100%;
    flex: none;
  }

  .player-info {
    flex: 1;
  }
}
</style>
