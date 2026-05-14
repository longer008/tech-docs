/**
 * Edge TTS Deno Deploy 服务
 *
 * 部署步骤：
 * 1. 打开 https://dash.deno.com → New Project → Deploy from URL
 * 2. 填入此文件的 GitHub 地址（或直接粘贴到 Playground）
 * 3. 把部署地址填到 PodcastPlayer.vue 的 TTS_SERVER 变量
 *
 * 接口：
 *   GET  /health       健康检查
 *   POST /tts          一次性生成
 *   POST /tts/stream   分段流式生成（推荐）
 *
 * 请求体：{ "text": "...", "voice": "zh-CN-XiaoxiaoNeural", "rate": "+5%" }
 */

// ─── 配置 ────────────────────────────────────────────────────────────────────

const TOKEN        = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'
const WSS_URL      = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1'
const OUTPUT_FMT   = 'audio-24khz-48kbitrate-mono-mp3'
const DEFAULT_VOICE = 'zh-CN-XiaoxiaoNeural'
const DEFAULT_RATE  = '+5%'
const CHUNK_SIZE    = 2000

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// ─── 工具 ────────────────────────────────────────────────────────────────────

function randomHex(n: number): string {
  const b = new Uint8Array(n)
  crypto.getRandomValues(b)
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('')
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function splitText(text: string, max = CHUNK_SIZE): string[] {
  const paras = text.split(/\n{2,}/)
  const chunks: string[] = []
  let cur = ''

  for (const raw of paras) {
    const p = raw.trim()
    if (!p) continue

    if (p.length > max) {
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

const jsonResp = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })

const errResp = (msg: string, status = 500) => jsonResp({ error: msg }, status)

// ─── Edge TTS WebSocket ───────────────────────────────────────────────────────

function synthesize(text: string, voice: string, rate: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reqId  = randomHex(16).toUpperCase()
    const connId = randomHex(16)
    const url    = `${WSS_URL}?TrustedClientToken=${TOKEN}&ConnectionId=${connId}`

    const ws = new WebSocket(url)
    const audioChunks: Uint8Array[] = []
    let totalBytes = 0

    const timeout = setTimeout(() => {
      ws.close()
      if (totalBytes === 0) reject(new Error('生成超时（30s）'))
    }, 30000)

    ws.onopen = () => {
      // 发送配置
      ws.send(
        `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
        `{"context":{"synthesis":{"audio":{"metadataoptions":` +
        `{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},` +
        `"outputFormat":"${OUTPUT_FMT}"}}}}`
      )
      // 发送 SSML
      const ssml =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'>` +
        `<voice name='${voice}'><prosody rate='${rate}' volume='+0%'>` +
        `${escapeXml(text)}</prosody></voice></speak>`
      ws.send(`X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`)
    }

    ws.onmessage = (ev) => {
      if (ev.data instanceof ArrayBuffer) {
        const view = new Uint8Array(ev.data)
        const headerLen = (view[0] << 8) | view[1]
        const audio = view.slice(headerLen + 2)
        if (audio.length > 0) {
          audioChunks.push(audio)
          totalBytes += audio.length
        }
      } else if (typeof ev.data === 'string' && ev.data.includes('Path:turn.end')) {
        clearTimeout(timeout)
        ws.close()
        const merged = new Uint8Array(totalBytes)
        let off = 0
        for (const c of audioChunks) { merged.set(c, off); off += c.length }
        resolve(merged)
      }
    }

    ws.onerror = () => {
      clearTimeout(timeout)
      ws.close()
      reject(new Error('WebSocket 连接失败'))
    }

    ws.onclose = (ev) => {
      clearTimeout(timeout)
      if (totalBytes === 0) {
        reject(new Error(`连接关闭，无音频数据 (code: ${ev.code})`))
      }
    }
  })
}

// ─── 路由处理 ────────────────────────────────────────────────────────────────

async function handleTTS(req: Request): Promise<Response> {
  const body = await req.json().catch(() => null) as Record<string, string> | null
  const text = body?.text?.trim()
  if (!text) return errResp('text is required', 400)

  const voice = body?.voice || DEFAULT_VOICE
  const rate  = body?.rate  || DEFAULT_RATE

  try {
    const audio = await synthesize(text.slice(0, 50000), voice, rate)
    return new Response(audio, {
      headers: { 'Content-Type': 'audio/mp3', ...CORS_HEADERS },
    })
  } catch (e) {
    return errResp((e as Error).message)
  }
}

async function handleStream(req: Request): Promise<Response> {
  const body = await req.json().catch(() => null) as Record<string, string> | null
  const text = body?.text?.trim()
  if (!text) return errResp('text is required', 400)

  const voice  = body?.voice || DEFAULT_VOICE
  const rate   = body?.rate  || DEFAULT_RATE
  const chunks = splitText(text.slice(0, 50000))

  // 先生成第一段，验证连接正常
  let firstAudio: Uint8Array
  try {
    firstAudio = await synthesize(chunks[0], voice, rate)
  } catch (e) {
    return errResp(`TTS 生成失败: ${(e as Error).message}`)
  }

  // TransformStream 流式返回剩余段
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()

  ;(async () => {
    try {
      await writer.write(firstAudio)
      for (let i = 1; i < chunks.length; i++) {
        const audio = await synthesize(chunks[i], voice, rate)
        await writer.write(audio)
      }
    } catch (e) {
      console.error('stream error:', (e as Error).message)
    } finally {
      await writer.close()
    }
  })()

  return new Response(readable, {
    headers: {
      'Content-Type': 'audio/mp3',
      'X-Total-Chunks': String(chunks.length),
      ...CORS_HEADERS,
    },
  })
}

// ─── 入口 ────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const { method, url } = req
  const path = new URL(url).pathname

  if (method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  if (method === 'GET'  && path === '/health')    return jsonResp({ status: 'ok', voice: DEFAULT_VOICE })
  if (method === 'POST' && path === '/tts')        return handleTTS(req)
  if (method === 'POST' && path === '/tts/stream') return handleStream(req)

  return new Response('Not Found', { status: 404, headers: CORS_HEADERS })
})
