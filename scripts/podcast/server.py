"""
播客 TTS 本地服务
AI 改写 + Edge TTS 语音生成

用法:
  python scripts/podcast/server.py

环境变量（在 .env 或命令行设置）:
  LLM_API_BASE=https://api.openai.com/v1   # OpenAI 兼容 API 地址
  LLM_API_KEY=sk-xxx                        # API Key
  LLM_MODEL=gpt-4o-mini                     # 模型名称

端口: 3456
"""

import asyncio
import json
import os
import io
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import URLError
import edge_tts

PORT = 3456
DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"
DEFAULT_RATE = "+5%"
CHUNK_SIZE = 500

# AI 配置（从环境变量读取）
LLM_API_BASE = os.environ.get("LLM_API_BASE", "https://api.openai.com/v1")
LLM_API_KEY = os.environ.get("LLM_API_KEY", "")
LLM_MODEL = os.environ.get("LLM_MODEL", "gpt-4o-mini")

PODCAST_SYSTEM_PROMPT = """你是一个技术播客主播，擅长把技术文档转化为口语化的播客内容。

规则：
1. 用自然、口语化的中文表达，像在和朋友聊天
2. 保留所有技术要点，但用通俗的方式解释
3. 适当添加过渡语（"接下来我们看看..."、"这里有个重点..."）
4. 代码相关内容用文字描述其作用，不要念代码本身
5. 控制在原文 60% 的篇幅内，去掉冗余
6. 不要添加开场白和结束语（会由系统添加）
7. 不要使用 markdown 格式，输出纯文本"""


def ai_rewrite(text: str) -> str:
    """调用 LLM 将文档内容改写为播客脚本"""
    if not LLM_API_KEY:
        print("  ⚠️ 未配置 LLM_API_KEY，跳过 AI 改写")
        return text

    # 截断过长文本（避免超出 token 限制）
    max_input = 8000
    if len(text) > max_input:
        text = text[:max_input] + "\n...(内容过长已截断)"

    url = f"{LLM_API_BASE}/chat/completions"
    payload = {
        "model": LLM_MODEL,
        "messages": [
            {"role": "system", "content": PODCAST_SYSTEM_PROMPT},
            {"role": "user", "content": f"请将以下技术文档内容改写为播客脚本：\n\n{text}"},
        ],
        "temperature": 0.7,
        "max_tokens": 4000,
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {LLM_API_KEY}",
    }

    try:
        req = Request(url, data=json.dumps(payload).encode(), headers=headers)
        # 绕过代理访问 API
        proxy_handler = None
        if "127.0.0.1" in LLM_API_BASE or "localhost" in LLM_API_BASE:
            import urllib.request
            proxy_handler = urllib.request.ProxyHandler({})

        if proxy_handler:
            import urllib.request
            opener = urllib.request.build_opener(proxy_handler)
            resp = opener.open(req, timeout=60)
        else:
            resp = urlopen(req, timeout=60)

        result = json.loads(resp.read().decode())
        content = result["choices"][0]["message"]["content"]
        print(f"  🤖 AI 改写完成: {len(text)} 字 → {len(content)} 字")
        return content
    except Exception as e:
        print(f"  ⚠️ AI 改写失败: {e}，使用原文")
        return text


def split_text(text: str, max_chars: int = CHUNK_SIZE) -> list:
    """智能分段：按段落/句子边界切分"""
    paragraphs = re.split(r'\n{2,}', text)
    chunks = []
    current = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len(para) > max_chars:
            sentences = re.split(r'([。！？；\n])', para)
            for i in range(0, len(sentences) - 1, 2):
                sentence = sentences[i] + (sentences[i + 1] if i + 1 < len(sentences) else '')
                if len(current) + len(sentence) > max_chars:
                    if current:
                        chunks.append(current.strip())
                    current = sentence
                else:
                    current += sentence
            if len(sentences) % 2 == 1:
                last = sentences[-1]
                if len(current) + len(last) > max_chars:
                    if current:
                        chunks.append(current.strip())
                    current = last
                else:
                    current += last
        elif len(current) + len(para) + 2 > max_chars:
            if current:
                chunks.append(current.strip())
            current = para
        else:
            current += ("\n\n" + para if current else para)

    if current.strip():
        chunks.append(current.strip())

    return chunks


class TTSHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            resp = {
                "status": "ok",
                "voice": DEFAULT_VOICE,
                "ai_enabled": bool(LLM_API_KEY),
                "model": LLM_MODEL if LLM_API_KEY else None,
            }
            self.wfile.write(json.dumps(resp).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/tts":
            self._handle_tts()
        elif self.path == "/tts/stream":
            self._handle_tts_stream()
        elif self.path == "/rewrite":
            self._handle_rewrite()
        else:
            self.send_response(404)
            self.end_headers()

    def _handle_rewrite(self):
        """单独的 AI 改写接口（前端可先改写再分段请求 TTS）"""
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")

        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._error(400, "Invalid JSON")
            return

        text = data.get("text", "").strip()
        if not text:
            self._error(400, "text is required")
            return

        print(f"  🤖 AI 改写请求: {len(text)} 字")
        result = ai_rewrite(text)

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"text": result}).encode())

    def _handle_tts(self):
        """一次性生成"""
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")

        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._error(400, "Invalid JSON")
            return

        text = data.get("text", "").strip()
        if not text:
            self._error(400, "text is required")
            return

        voice = data.get("voice", DEFAULT_VOICE)
        rate = data.get("rate", DEFAULT_RATE)

        try:
            audio_data = asyncio.run(self._generate(text, voice, rate))
            self.send_response(200)
            self.send_header("Content-Type", "audio/mp3")
            self.send_header("Content-Length", str(len(audio_data)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(audio_data)
            print(f"  ✅ 生成: {len(text)} 字 -> {len(audio_data)//1024} KB")
        except Exception as e:
            self._error(500, str(e))

    def _handle_tts_stream(self):
        """分段生成：前端传 chunk_index 获取对应段"""
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")

        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._error(400, "Invalid JSON")
            return

        text = data.get("text", "").strip()
        voice = data.get("voice", DEFAULT_VOICE)
        rate = data.get("rate", DEFAULT_RATE)
        chunk_index = int(data.get("chunk_index", 0))

        if not text:
            self._error(400, "text is required")
            return

        if len(text) > 100000:
            text = text[:100000]

        chunks = split_text(text)
        total_chunks = len(chunks)

        if chunk_index >= total_chunks:
            self._error(400, f"chunk_index {chunk_index} out of range (total: {total_chunks})")
            return

        chunk_text = chunks[chunk_index]
        print(f"  🔊 段 {chunk_index+1}/{total_chunks}: {len(chunk_text)} 字")

        try:
            audio_data = asyncio.run(self._generate(chunk_text, voice, rate))
            if not audio_data:
                raise Exception("edge-tts 返回空数据")

            self.send_response(200)
            self.send_header("Content-Type", "audio/mp3")
            self.send_header("Content-Length", str(len(audio_data)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("X-Chunk-Index", str(chunk_index))
            self.send_header("X-Total-Chunks", str(total_chunks))
            self.end_headers()
            self.wfile.write(audio_data)
            print(f"    ✅ {len(audio_data)//1024} KB")
        except (BrokenPipeError, ConnectionResetError):
            print(f"  ⚠️ 客户端断开")
        except Exception as e:
            print(f"  ❌ 失败: {e}")
            self._error(500, str(e))

    async def _generate(self, text: str, voice: str, rate: str) -> bytes:
        """调用 edge-tts 生成音频"""
        communicate = edge_tts.Communicate(text, voice, rate=rate)
        buffer = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buffer.write(chunk["data"])
        return buffer.getvalue()

    def _error(self, code: int, message: str):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode())
        print(f"  ❌ {code}: {message}")

    def log_message(self, format, *args):
        pass


def main():
    print(f"🎙️ 播客 TTS 本地服务")
    print(f"   端口: {PORT}")
    print(f"   语音: {DEFAULT_VOICE}")
    print(f"   语速: {DEFAULT_RATE}")
    print(f"   分段: 每段 {CHUNK_SIZE} 字")
    print(f"   AI:   {'✅ ' + LLM_MODEL if LLM_API_KEY else '❌ 未配置（设置 LLM_API_KEY 环境变量）'}")
    print(f"   地址: http://127.0.0.1:{PORT}")
    print(f"")
    print(f"   API:")
    print(f"     GET  /health      - 健康检查")
    print(f"     POST /rewrite     - AI 改写为播客脚本")
    print(f"     POST /tts         - 一次性生成语音")
    print(f"     POST /tts/stream  - 分段生成语音")
    print(f"")
    print(f"   按 Ctrl+C 停止")
    print(f"{'='*50}")

    server = HTTPServer(("127.0.0.1", PORT), TTSHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 服务已停止")
        server.shutdown()


if __name__ == "__main__":
    main()
