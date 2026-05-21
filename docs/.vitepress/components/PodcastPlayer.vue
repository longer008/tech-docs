<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
const showTranscript = ref(true)  // 是否显示文字

// 文字同步数据：每段文本 + 对应的音频起止时间
interface Segment {
  text: string
  startTime: number  // 秒
  endTime: number    // 秒
}
const segments = ref<Segment[]>([])
const currentSegmentIndex = ref(-1)

// Audio 元素引用
let audio: HTMLAudioElement | null = null

const route = useRoute()
const { page } = useData()

// 本地 TTS 服务地址（使用 127.0.0.1 避免代理拦截 localhost）
// const TTS_SERVER = 'http://127.0.0.1:3456'
const TTS_SERVER = 'https://tts.laou.tech'

// 文本分段大小（与服务端 CHUNK_SIZE 保持一致）
const CHUNK_SIZE = 500

// ============ 管理员认证 ============

const ADMIN_KEY = 'podcast_admin_token'
const adminVerified = ref(false)  // 响应式，控制播放器显示

function getAdminToken(): string {
  if (typeof localStorage === 'undefined') return ''
  return localStorage.getItem(ADMIN_KEY) || ''
}

function checkAndSaveAdminToken() {
  if (typeof localStorage === 'undefined' || typeof window === 'undefined') return
  adminVerified.value = getAdminToken().length === 32
}

function isAdmin(): boolean {
  if (typeof localStorage === 'undefined') return false
  return getAdminToken().length === 32
}

// 带认证头的 fetch
function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAdminToken()
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { 'X-Admin-Token': token } : {}),
    },
  })
}

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
    const res = await authFetch(`${TTS_SERVER}/health`, { signal: AbortSignal.timeout(5000) })
    serverOnline.value = res.ok
  } catch {
    serverOnline.value = false
  }
}

// ============ 内容提取 ============

/**
 * 从 Markdown 源文件提取代码注释（通过 Vite 的 ?raw 接口）
 * 开发模式可用，生产模式降级为 DOM 提取
 */
async function extractCommentsFromSource(): Promise<string[]> {
  try {
    const relPath = page.value.relativePath
    if (!relPath) return extractCommentsFromDOM()

    // Vite 开发模式：通过 /@fs/ 读取源文件
    const base = import.meta.env.BASE_URL || '/'
    // 尝试读取 md 文件（开发模式下 Vite 会处理）
    const res = await fetch(`${base}${relPath}`, {
      headers: { 'Accept': 'text/plain' }
    }).catch(() => null)

    if (res?.ok) {
      const md = await res.text()
      // 如果返回的是 HTML（生产模式），降级为 DOM 提取
      if (md.trim().startsWith('<!DOCTYPE') || md.trim().startsWith('<html')) {
        return extractCommentsFromDOM()
      }
      return extractCommentsFromMarkdown(md)
    }
    return extractCommentsFromDOM()
  } catch {
    return extractCommentsFromDOM()
  }
}

/**
 * 从渲染后的 DOM 中提取注释（通过 .token.comment 类）
 */
function extractCommentsFromDOM(): string[] {
  const comments: string[] = []
  // Prism/Shiki 渲染的注释有 .token.comment 或 .comment 类
  document.querySelectorAll('.vp-doc .token.comment, .vp-doc .comment').forEach(el => {
    const text = (el.textContent || '')
      .replace(/^\/\/\s*/, '')
      .replace(/^\/\*+\s*|\s*\*+\//g, '')
      .replace(/^#\s*/, '')
      .trim()
    if (isGoodComment(text)) comments.push(text)
  })
  return [...new Set(comments)]
}

/**
 * 从 Markdown 文本中提取代码块注释
 */
function extractCommentsFromMarkdown(md: string): string[] {
  const comments: string[] = []

  // 找出所有代码块
  const codeBlocks = md.match(/```[\s\S]*?```/g) || []

  for (const block of codeBlocks) {
    const lines = block.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()

      // // 单行注释
      const slashMatch = trimmed.match(/^\/\/\s*(.+)/)
      if (slashMatch) {
        const text = slashMatch[1].trim()
        if (isGoodComment(text)) comments.push(text)
        continue
      }

      // # 注释（Python/Shell/YAML/SCSS）
      const hashMatch = trimmed.match(/^#\s+(.+)/)
      if (hashMatch) {
        const text = hashMatch[1].trim()
        if (isGoodComment(text) && !/^[!\/]/.test(text)) comments.push(text)
      }
    }

    // 多行注释 /* ... */
    const multiMatches = block.match(/\/\*[\s\S]*?\*\//g) || []
    for (const m of multiMatches) {
      const text = m
        .replace(/\/\*+\s*|\s*\*+\//g, '')
        .replace(/^\s*\*\s*/gm, '')
        .trim()
      if (text.length > 4) comments.push(text)
    }
  }

  // 去重
  return [...new Set(comments)]
}

function isGoodComment(text: string): boolean {
  return (
    text.length > 4 &&
    !/^[=\-*+{}()\[\]<>\/\\|@$#!]+$/.test(text) &&  // 纯符号
    !/^\w+\s*[({]/.test(text) &&                      // 像函数调用
    !/^https?:\/\//.test(text) &&                     // URL
    !/^\d+$/.test(text)                               // 纯数字
  )
}

/**
 * 提取原始页面文本（保留代码内容，供 AI 理解）
 */
/**
 * 提取原始页面文本（保留代码注释，供 AI 理解，但不含完整代码）
 */
function extractRawPageText(): string {
  const content = document.querySelector('.vp-doc')
    || document.querySelector('.content-container')
    || document.querySelector('main')
  if (!content) return ''

  const clone = content.cloneNode(true) as HTMLElement

  // 第一步：先收集代码块中的注释（在 DOM 操作之前）
  const codeComments: string[] = []
  clone.querySelectorAll('pre').forEach(pre => {
    const code = pre.querySelector('code')
    const text = (code || pre).textContent || ''
    // 提取 // 注释
    const lines = text.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      const m = trimmed.match(/^\/\/\s*(.+)/) || trimmed.match(/^#\s+(.+)/)
      if (m) {
        const comment = m[1].trim()
        if (comment.length > 4 && !/^https?:\/\//.test(comment) && !/^\w+\s*[({]/.test(comment)) {
          codeComments.push(comment)
        }
      }
    }
  })

  // 第二步：移除代码块和 UI 噪音
  const removeSelectors = [
    'pre', 'code',
    '.podcast-player', '.reading-time', '.header-anchor',
    'style', 'script', 'img', 'svg', '.vp-adaptive-theme',
    '.table-of-contents', '[class*="toc"]',
    '.line-numbers-wrapper', '.line-numbers',
    'button.copy', '.lang',
    'blockquote', '.custom-block',
  ]
  removeSelectors.forEach(sel => {
    clone.querySelectorAll(sel).forEach(el => el.remove())
  })

  // 第三步：获取正文
  const bodyText = (clone.innerText || clone.textContent || '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+$/gm, '')
    .trim()

  // 第四步：合并正文 + 去重注释
  const uniqueComments = [...new Set(codeComments)]
  if (uniqueComments.length === 0) return bodyText

  return bodyText + '\n\n代码要点：\n' + uniqueComments.join('\n')
}

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

    // [[toc]] 生成的目录
    '.table-of-contents',     // VitePress toc 容器
    '.vp-toc',
    'nav.table-of-contents',
    '[class*="toc"]',         // 任何包含 toc 的类

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
    // 移除 [[toc]] 标记
    .replace(/\[\[toc\]\]/gi, '')
    // 移除目录列表（以 - [ 开头的行，通常是 markdown 目录链接）
    .replace(/^[-*]\s+\[.+\]\(#.+\)\s*$/gm, '')
    // 移除难度星星，转为数字描述（⭐⭐☆☆☆ → 2颗星）
    .replace(/[⭐★]+[☆✩]*/g, (match) => {
      const filled = (match.match(/[⭐★]/g) || []).length
      return `${filled}颗星`
    })
    // 移除多余空行
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+$/gm, '')
    .trim()

  console.debug(`[PodcastPlayer] 提取文本: ${text.length} 字符`)
  return text
}

// ============ 生成音频 ============

async function handleGenerate(force = false) {
  if (isGenerating.value) return  // 防止重复触发
  errorMsg.value = ''

  // 检查服务是否在线
  await checkServer()
  if (!serverOnline.value) {
    errorMsg.value = '请先启动 TTS 服务：python scripts/podcast/server.py'
    return
  }

  // 提取文本（用原始版本，包含代码注释）
  const rawText = extractRawPageText()
  if (!rawText || rawText.length < 5) {
    errorMsg.value = `页面内容提取失败（${rawText.length} 字符），请刷新后重试`
    return
  }

  isGenerating.value = true
  segments.value = []
  currentSegmentIndex.value = -1

  try {
    console.debug(`[PodcastPlayer] 原始文本: ${rawText.length} 字符`)

    // 按 3000 字分批 AI 改写，改写完立即 TTS
    const AI_BATCH = 5000
    const batches = splitIntoBatches(rawText, AI_BATCH)
    console.debug(`[PodcastPlayer] 分 ${batches.length} 批 AI 改写`)

    const allAudioChunks: Uint8Array[] = []
    let firstChunkPlayed = false
    let rewrittenFull = ''  // 收集所有改写结果，用于缓存

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      // 1. AI 改写当前批次
      let batchScript = batches[batchIdx]
      try {
        const rewriteRes = await authFetch(`${TTS_SERVER}/rewrite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: batchScript, force }),
          signal: AbortSignal.timeout(60000),
        })
        if (rewriteRes.ok) {
          const { text: rewritten } = await rewriteRes.json()
          if (rewritten && rewritten.length > 20) {
            batchScript = rewritten
            console.debug(`[PodcastPlayer] 批次 ${batchIdx + 1}/${batches.length} AI 改写: ${batches[batchIdx].length} → ${batchScript.length} 字`)
          }
        }
      } catch (e: any) {
        // AI 超时或失败，用原文继续
        console.warn(`[PodcastPlayer] AI 改写失败: ${e.message}，使用原文`)
      }

      rewrittenFull += (rewrittenFull ? '\n\n' : '') + batchScript

      // 2. 对改写结果分段 TTS（并行请求，按顺序追加）
      const ttsSegments = splitIntoBatches(batchScript, 500)

      if (batchIdx === 0 && !firstChunkPlayed) {
        // 第一批：第一段单独先请求，快速开始播放
        const firstSeg = ttsSegments[0]
        const firstRes = await authFetch(`${TTS_SERVER}/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: firstSeg, force, page_path: page.value.relativePath }),
          signal: AbortSignal.timeout(60000),
        })
        if (firstRes.ok) {
          const buf = await firstRes.arrayBuffer()
          const chunk = new Uint8Array(buf)
          if (chunk.length >= 100) {
            const startTime = 0
            const segDuration = chunk.length / 6000
            allAudioChunks.push(chunk)
            segments.value.push({ text: firstSeg, startTime, endTime: segDuration })
            firstChunkPlayed = true
            setupAudio(new Blob(allAudioChunks, { type: 'audio/mp3' }))
          }
        }

        // 剩余段并行请求
        const restSegs = ttsSegments.slice(1)
        if (restSegs.length > 0) {
          const results = await Promise.all(
            restSegs.map(seg =>
              authFetch(`${TTS_SERVER}/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: seg, force, page_path: page.value.relativePath }),
                signal: AbortSignal.timeout(60000),
              }).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null)
            )
          )
          for (let i = 0; i < results.length; i++) {
            if (!results[i]) continue
            const chunk = new Uint8Array(results[i]!)
            if (chunk.length < 100) continue
            const prev = segments.value[segments.value.length - 1]
            const startTime = prev ? prev.endTime : 0
            segments.value.push({ text: restSegs[i], startTime, endTime: startTime + chunk.length / 6000 })
            allAudioChunks.push(chunk)
          }
        }
      } else {
        // 后续批次：全部并行请求，按顺序追加
        const results = await Promise.all(
          ttsSegments.map(seg =>
            authFetch(`${TTS_SERVER}/tts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: seg, force, page_path: page.value.relativePath }),
              signal: AbortSignal.timeout(60000),
            }).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null)
          )
        )
        for (let i = 0; i < results.length; i++) {
          if (!results[i]) continue
          const chunk = new Uint8Array(results[i]!)
          if (chunk.length < 100) continue
          const prev = segments.value[segments.value.length - 1]
          const startTime = prev ? prev.endTime : 0
          segments.value.push({ text: ttsSegments[i], startTime, endTime: startTime + chunk.length / 6000 })
          allAudioChunks.push(chunk)
        }
      }

      // 每批完成后更新播放器（保持播放位置）
      if (allAudioChunks.length > 0 && firstChunkPlayed) {
        const currentPos = audio ? audio.currentTime : 0
        const wasPlaying = isPlaying.value
        setupAudio(new Blob(allAudioChunks, { type: 'audio/mp3' }))
        if (audio && currentPos > 0) {
          audio.currentTime = currentPos
          if (wasPlaying) audio.play().catch(() => {})
        }
      }
    }

    if (allAudioChunks.length === 0) {
      throw new Error('未生成任何音频，请检查 TTS 服务')
    }

    // 替换为完整音频（不再缓存到浏览器，服务端已缓存）
    const fullBlob = new Blob(allAudioChunks, { type: 'audio/mp3' })
    const currentPos = audio ? audio.currentTime : 0
    const wasPlaying = isPlaying.value
    setupAudio(fullBlob)
    if (audio && currentPos > 0) {
      audio.currentTime = currentPos
      if (wasPlaying) audio.play().catch(() => {})
    }

  } catch (e: any) {
    errorMsg.value = e.message || '生成失败，请重试'
  } finally {
    isGenerating.value = false
  }
}

function splitIntoBatches(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text]

  // 按段落边界切分，避免在句子中间断开
  const paras = text.split(/\n{2,}/)
  const batches: string[] = []
  let cur = ''

  for (const p of paras) {
    const para = p.trim()
    if (!para) continue

    if (cur.length + para.length + 2 > maxChars) {
      if (cur) batches.push(cur.trim())
      // 单段超长时按句子切分
      if (para.length > maxChars) {
        const sentences = para.split(/([。！？；\n])/)
        let sentBuf = ''
        for (let i = 0; i < sentences.length - 1; i += 2) {
          const s = sentences[i] + (sentences[i + 1] ?? '')
          if (sentBuf.length + s.length > maxChars) {
            if (sentBuf) batches.push(sentBuf.trim())
            sentBuf = s
          } else {
            sentBuf += s
          }
        }
        if (sentBuf.trim()) batches.push(sentBuf.trim())
        cur = ''
      } else {
        cur = para
      }
    } else {
      cur += (cur ? '\n\n' : '') + para
    }
  }
  if (cur.trim()) batches.push(cur.trim())
  return batches
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

function onTimeUpdate() {
  if (!audio) return
  currentTime.value = audio.currentTime

  // 更新当前播放的段落索引
  const t = audio.currentTime
  const idx = segments.value.findIndex(s => t >= s.startTime && t < s.endTime)
  if (idx !== -1 && idx !== currentSegmentIndex.value) {
    currentSegmentIndex.value = idx
    // 自动滚动到当前段落
    nextTick(() => {
      const container = document.querySelector('.transcript')
      const active = container?.querySelector('.active')
      if (active && container) {
        active.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }
}
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

function seekToSegment(idx: number) {
  if (audio && segments.value[idx]) {
    audio.currentTime = segments.value[idx].startTime
    currentSegmentIndex.value = idx
    if (!isPlaying.value) {
      audio.play().then(() => { isPlaying.value = true }).catch(() => {})
    }
  }
}

async function handleRegenerate() {
  audioReady.value = false
  isPlaying.value = false
  segments.value = []
  if (audio) audio.pause()
  await handleGenerate(true)  // force=true 跳过服务端缓存
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
  checkAndSaveAdminToken()
  if (isAdmin()) {
    checkServer()
    checkCache()
  }
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
  <div v-if="adminVerified" class="podcast-player" role="region" aria-label="播客播放器">
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
        <button class="btn-regenerate" @click="handleRegenerate" :disabled="isGenerating">🔄 重新生成</button>
        <button class="btn-transcript" @click="showTranscript = !showTranscript">
          {{ showTranscript ? '📖 隐藏文字' : '📖 显示文字' }}
        </button>
      </div>
    </div>

    <!-- 文字同步展示 -->
    <div v-if="audioReady && showTranscript && segments.length > 0" class="transcript" ref="transcriptRef">
      <p
        v-for="(seg, idx) in segments"
        :key="idx"
        :class="{ active: idx === currentSegmentIndex, past: idx < currentSegmentIndex }"
        @click="seekToSegment(idx)"
      >{{ seg.text }}</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="player-error">⚠️ {{ errorMsg }}</div>
  </div>
</template>

<style scoped>
/* ── 容器 ─────────────────────────────────────────── */
.podcast-player {
  margin: 16px 0 24px;
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}
.podcast-player:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* ── 未生成状态 ───────────────────────────────────── */
.player-idle {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
}

.btn-generate {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 22px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  white-space: nowrap;
}
.btn-generate:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.btn-generate:active { transform: translateY(0); }

.idle-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

/* ── 生成中 ───────────────────────────────────────── */
.player-generating {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
}
.generating-icon { font-size: 16px; animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.9); }
}
.generating-text { font-size: 13px; color: var(--vp-c-text-2); }

/* ── 播放器主栏 ───────────────────────────────────── */
.player-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.btn-play {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: var(--vp-c-brand-1);
  color: white;
  font-size: 17px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.btn-play:hover {
  background: var(--vp-c-brand-2);
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.btn-play:active { transform: scale(0.96); }

.player-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
  min-width: 80px;
}
.player-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  letter-spacing: 0.3px;
}
.player-time {
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}

/* ── 进度条 ───────────────────────────────────────── */
.progress-bar {
  flex: 1;
  height: 5px;
  background: var(--vp-c-divider);
  border-radius: 3px;
  cursor: pointer;
  min-width: 60px;
  position: relative;
  transition: height 0.15s;
}
.progress-bar:hover { height: 7px; }
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  border-radius: 3px;
  transition: width 0.1s linear;
}

/* ── 控制按钮 ─────────────────────────────────────── */
.player-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.btn-skip, .btn-rate {
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 8px;
  font-size: 12px;
  transition: background 0.15s, color 0.15s;
}
.btn-skip:hover, .btn-rate:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}
.btn-rate { font-weight: 700; min-width: 38px; text-align: center; }

/* ── 展开面板 ─────────────────────────────────────── */
.player-panel {
  padding: 10px 16px 12px;
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  background: var(--vp-c-bg-alt);
}
.panel-section { display: flex; align-items: center; gap: 8px; }
.panel-label { font-size: 11px; color: var(--vp-c-text-3); font-weight: 500; }

.rate-buttons { display: flex; gap: 4px; }
.rate-buttons button {
  padding: 3px 9px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.rate-buttons button:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.rate-buttons button.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: white;
  font-weight: 600;
}

.volume-slider {
  width: 80px; height: 4px;
  -webkit-appearance: none; appearance: none;
  background: var(--vp-c-divider); border-radius: 2px; outline: none; cursor: pointer;
}
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 14px; height: 14px;
  border-radius: 50%; background: var(--vp-c-brand-1); cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.btn-regenerate, .btn-transcript {
  padding: 4px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-regenerate:hover, .btn-transcript:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.btn-regenerate:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── 文字同步展示 ─────────────────────────────────── */
.transcript {
  max-height: 360px;
  overflow-y: auto;
  padding: 16px 20px;
  border-top: 1px solid var(--vp-c-divider);
  scroll-behavior: smooth;
  background: var(--vp-c-bg);
}
.transcript::-webkit-scrollbar { width: 4px; }
.transcript::-webkit-scrollbar-track { background: transparent; }
.transcript::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 2px;
}

.transcript p {
  margin: 0 0 4px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: all 0.25s;
  border-left: 3px solid transparent;
}
.transcript p:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
}
.transcript p.active {
  color: var(--vp-c-text-1);
  background: var(--vp-c-brand-soft);
  border-left-color: var(--vp-c-brand-1);
  font-weight: 500;
}
.transcript p.past { color: var(--vp-c-text-2); }

/* ── 错误提示 ─────────────────────────────────────── */
.player-error {
  padding: 8px 16px;
  font-size: 12px;
  color: var(--vp-c-danger-1);
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-danger-soft);
}

/* ── 响应式 ───────────────────────────────────────── */
@media (max-width: 640px) {
  .player-bar { flex-wrap: wrap; gap: 8px; }
  .progress-bar { order: 10; width: 100%; flex: none; }
  .player-info { flex: 1; }
  .transcript { max-height: 280px; }
}
</style>
