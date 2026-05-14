<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

// 播放器状态
const isPlaying = ref(false)
const isLoading = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playbackRate = ref(1)
const volume = ref(0.8)
const isExpanded = ref(false)
const hasAudio = ref(false)
const audioSrc = ref('')
const podcastTitle = ref('')
const errorMsg = ref('')

// Audio 元素引用
let audio: HTMLAudioElement | null = null

const route = useRoute()
const { frontmatter } = useData()

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

// 格式化的当前时间和总时长
const timeDisplay = computed(() => {
  return `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`
})

// 倍速选项
const rateOptions = [0.75, 1, 1.25, 1.5, 1.75, 2]

// 检查当前页面是否有对应的播客音频
async function checkAudioAvailability() {
  hasAudio.value = false
  errorMsg.value = ''
  
  try {
    // 获取 base 路径
    const base = import.meta.env.BASE_URL || '/'
    const indexUrl = `${base}podcast/index.json`
    
    const response = await fetch(indexUrl)
    if (!response.ok) return
    
    const index = await response.json()
    
    // 当前页面路径（去掉 base 前缀和 .html 后缀）
    const base2 = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    let currentPath = route.path
      .replace(/\.html$/, '')
      .replace(/\/$/, '')
    // 去掉 base 前缀
    if (base2 && currentPath.startsWith(base2)) {
      currentPath = currentPath.slice(base2.length)
    }
    if (!currentPath) currentPath = '/index'
    
    // 查找匹配的音频
    for (const [docPath, info] of Object.entries(index) as [string, any][]) {
      const normalizedDocPath = docPath.replace(/\/$/, '')
      if (currentPath === normalizedDocPath) {
        hasAudio.value = true
        audioSrc.value = `${base}podcast/${info.audioPath}`
        podcastTitle.value = info.title || '播客音频'
        break
      }
    }
  } catch (e) {
    // 静默失败，不显示播放器
  }
}

// 初始化音频
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
}

function onTimeUpdate() {
  if (audio) currentTime.value = audio.currentTime
}

function onLoadedMetadata() {
  if (audio) {
    duration.value = audio.duration
    isLoading.value = false
  }
}

function onEnded() {
  isPlaying.value = false
  currentTime.value = 0
}

function onError() {
  errorMsg.value = '音频加载失败'
  isLoading.value = false
  isPlaying.value = false
}

// 播放/暂停
function togglePlay() {
  if (!audio) {
    initAudio()
  }
  
  if (isPlaying.value) {
    audio?.pause()
    isPlaying.value = false
  } else {
    isLoading.value = true
    audio?.play().then(() => {
      isPlaying.value = true
      isLoading.value = false
    }).catch(() => {
      isLoading.value = false
      errorMsg.value = '播放失败，请重试'
    })
  }
}

// 进度条点击
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

// 快进/快退
function skip(seconds: number) {
  if (audio) {
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration.value))
  }
}

// 设置倍速
function setRate(rate: number) {
  playbackRate.value = rate
  if (audio) audio.playbackRate = rate
}

// 设置音量
function setVolume(event: Event) {
  const target = event.target as HTMLInputElement
  volume.value = parseFloat(target.value)
  if (audio) audio.volume = volume.value
}

// 监听路由变化
watch(() => route.path, () => {
  // 停止当前播放
  if (audio) {
    audio.pause()
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
  }
  // 检查新页面
  checkAudioAvailability()
})

onMounted(() => {
  checkAudioAvailability()
})

onUnmounted(() => {
  if (audio) {
    audio.pause()
    audio.removeEventListener('timeupdate', onTimeUpdate)
    audio.removeEventListener('loadedmetadata', onLoadedMetadata)
    audio.removeEventListener('ended', onEnded)
    audio.removeEventListener('error', onError)
  }
})
</script>

<template>
  <div v-if="hasAudio" class="podcast-player" :class="{ expanded: isExpanded }">
    <!-- 迷你模式 -->
    <div class="player-bar">
      <button class="btn-play" @click="togglePlay" :disabled="isLoading" :title="isPlaying ? '暂停' : '播放'">
        <span v-if="isLoading" class="icon-loading">⏳</span>
        <span v-else-if="isPlaying" class="icon-pause">⏸️</span>
        <span v-else class="icon-play">▶️</span>
      </button>

      <div class="player-info">
        <span class="player-title">🎧 {{ podcastTitle }}</span>
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
        
        <button class="btn-rate" @click="isExpanded = !isExpanded" :title="`${playbackRate}x 倍速`">
          {{ playbackRate }}x
        </button>
      </div>
    </div>

    <!-- 展开面板 -->
    <div v-if="isExpanded" class="player-panel">
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
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="player-error">
      {{ errorMsg }}
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
  transition: all 0.3s ease;
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
  transition: transform 0.2s, background 0.2s;
  flex-shrink: 0;
}

.btn-play:hover {
  transform: scale(1.1);
  background: var(--vp-c-brand-2);
}

.btn-play:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.icon-loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex-shrink: 0;
}

.player-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-time {
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--vp-c-divider);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  min-width: 80px;
}

.progress-bar:hover {
  height: 8px;
}

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
  flex-direction: column;
  gap: 12px;
}

.panel-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-label {
  font-size: 12px;
  color: var(--vp-c-text-3);
  min-width: 36px;
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
  flex: 1;
  max-width: 120px;
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
