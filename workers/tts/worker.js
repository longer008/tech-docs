/**
 * Edge TTS Cloudflare Worker
 *
 * 使用方法：
 * 1. 打开 https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. 把这个文件的内容粘贴进去，点 Deploy
 * 3. 把 Worker 地址填到 PodcastPlayer.vue 的 TTS_SERVER 变量
 *
 * 接口：
 *   GET  /health       健康检查
 *   POST /tts          一次性生成（小文本用）
 *   POST /tts/stream   流式生成（推荐，边生成边播放）
 *
 * 请求体：{ "text": "...", "voice": "zh-CN-XiaoxiaoNeural", "rate": "+5%" }
 */

// ─── 配置 ────────────────────────────────────────────────────────────────────

const TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'
const WSS   = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1'
const FMT   = 'audio-24khz-48kbitrate-mono-mp3'

const DEFAULT_VOICE = 'zh-CN-XiaoxiaoNeural'
const DEFAULT_RATE  = '+5%'
const CHUNK_SIZE    = 2000   // 每段字符数，越小首段越快

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// ─── 工具 ────────────────────────────────────────────────────────────────────

function randomHex(n) {
  const b = new Uint8Array(n)
  crypto.getRandomValues(b)
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('')
}

function escapeXml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&apos;')
}

/**
 * 按段落/句子边界切分文本，避免在句子中间断开
 */
function splitText(text, max = CHUNK_SIZE) {
  const paras = text.split(/\n{2,}/)
  const chunks = []
  let cur = ''

  for (const raw of paras) {
    const p = raw.trim()
    if (!p) continue

    if (p.length > max) {
      // 段落本身超长，按句子切
      const parts = p.split(/([。！？；\n])/)
      for (let i = 0; i < parts.length - 1; i += 2) {
        const s = parts[i] + (parts[i + 1] ?? '')
        if (cur.length + s.length > max) { if (cur) chunks.push(cur.trim()); cur = s }
        else cur += s
      }
      if (parts.length % 2 === 1) {
        const last = parts[parts.length - 1]
        if (cur.length + last.length > max) { if (cur) chunks.push(cur.trim()); cur = last }
        else cur += last
      }
    } else if (cur.length + p.length + 2 > max) {
      if (cur) chunks.push(cur.trim())
      cur = p
    } else {
      cur += (cur ? '\n\n' : '') + p
    }
  }
  if (cur.trim()) chunks.push(cur.trim())
  return chunks
}

// ─── Edge TTS WebSocket 核心 ─────────────────────────────────────────────────

/**
 * 调用 Edge TTS WebSocket，返回 MP3 的 Uint8Array
 */
function synthesize(text, voice, rate) {
  return new Promise((resolve, reject) => {
    const reqId  = randomHex(16).toUpperCase()
    const connId = randomHex(16)
    const url    = `${WSS}?TrustedClientToken=${TOKEN}&ConnectionId=${connId}`

    const ws = new WebSocket(url, ['synthesize'])

    const chunks = []
    let total = 0

    ws.addEventListener('open', () => {
      // 发送配置
      ws.send(
        `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
        `{"context":{"synthesis":{"audio":{"metadataoptions":` +
        `{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},` +
        `"outputFormat":"${FMT}"}}}}`
      )
      // 发送 SSML
      const ssml =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'>` +
        `<voice name='${voice}'><prosody rate='${rate}' volume='+0%'>` +
        `${escapeXml(text)}</prosody></voice></speak>`
      ws.send(`X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`)
    })

    ws.addEventListener('message', ev => {
      if (ev.data instanceof ArrayBuffer) {
        const v = new Uint8Array(ev.data)
        const headerLen = (v[0] << 8) | v[1]
        const audio = v.slice(headerLen + 2)
        if (audio.length > 0) { chunks.push(audio); total += audio.length }
      } else if (typeof ev.data === 'string' && ev.data.includes('Path:turn.end')) {
        ws.close()
        const merged = new Uint8Array(total)
        let off = 0
        for (const c of chunks) { merged.set(c, off); off += c.length }
        resolve(merged)
      }
    })

    ws.addEventListener('error', () => { ws.close(); reject(new Error('WebSocket 连接失败')) })

    ws.addEventListener('close', ev => {
      if (total === 0) reject(new Error(`连接关闭，无音频数据 (code:${ev.code})`))
    })

    setTimeout(() => {
      if (total === 0) { ws.close(); reject(new Error('生成超时')) }
    }, 28000)
  })
}

// ─── 响应工具 ────────────────────────────────────────────────────────────────

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })

const err = (msg, status = 500) => json({ error: msg }, status)

async function parseBody(req) {
  try { return await req.json() }
  catch { return null }
}

// ─── 路由处理 ────────────────────────────────────────────────────────────────

async function handleTTS(req) {
  const body = await parseBody(req)
  if (!body?.text?.trim()) return err('text is required', 400)

  const text  = body.text.trim().slice(0, 50000)
  const voice = body.voice || DEFAULT_VOICE
  const rate  = body.rate  || DEFAULT_RATE

  try {
    const audio = await synthesize(text, voice, rate)
    return new Response(audio, {
      headers: { 'Content-Type': 'audio/mp3', ...CORS },
    })
  } catch (e) {
    return err(e.message)
  }
}

async function handleStream(req) {
  const body = await parseBody(req)
  if (!body?.text?.trim()) return err('text is required', 400)

  const text   = body.text.trim().slice(0, 50000)
  const voice  = body.voice || DEFAULT_VOICE
  const rate   = body.rate  || DEFAULT_RATE
  const chunks = splitText(text)

  // TransformStream 实现流式响应：每段生成完立即写入
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()

  ;(async () => {
    try {
      for (const chunk of chunks) {
        const audio = await synthesize(chunk, voice, rate)
        await writer.write(audio)
      }
    } catch (e) {
      console.error('stream error:', e.message)
    } finally {
      await writer.close()
    }
  })()

  return new Response(readable, {
    headers: {
      'Content-Type': 'audio/mp3',
      'X-Total-Chunks': String(chunks.length),
      ...CORS,
    },
  })
}

// ─── Worker 入口 ─────────────────────────────────────────────────────────────

export default {
  async fetch(request) {
    const { method, url } = request
    const path = new URL(url).pathname

    if (method === 'OPTIONS') return new Response(null, { headers: CORS })

    if (method === 'GET'  && path === '/health')     return json({ status: 'ok', voice: DEFAULT_VOICE })
    if (method === 'POST' && path === '/tts')         return handleTTS(request)
    if (method === 'POST' && path === '/tts/stream')  return handleStream(request)

    return new Response('Not Found', { status: 404, headers: CORS })
  },
}
