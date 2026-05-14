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
import hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import URLError
import edge_tts

# 加载 .env 文件
def load_dotenv():
    env_paths = [
        os.path.join(os.path.dirname(__file__), '.env'),
        os.path.join(os.getcwd(), '.env'),
    ]
    for env_path in env_paths:
        if os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    if '=' in line:
                        key, _, value = line.partition('=')
                        os.environ.setdefault(key.strip(), value.strip())
            print(f"  📄 已加载: {env_path}")
            return
    print(f"  📄 未找到 .env 文件")

load_dotenv()

PORT = int(os.environ.get("PORT", 3456))
HOST = os.environ.get("HOST", "127.0.0.1")  # 服务器部署时设为 0.0.0.0

# 音频缓存目录
CACHE_DIR = os.environ.get("CACHE_DIR", os.path.join(os.path.dirname(__file__), "cache"))
os.makedirs(CACHE_DIR, exist_ok=True)


def get_cache_path(text: str, voice: str, rate: str) -> str:
    """根据文本内容生成音频缓存文件路径"""
    key = f"{voice}|{rate}|{text}"
    h = hashlib.md5(key.encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"{h}.mp3")


def get_rewrite_cache_path(text: str) -> str:
    """根据文本内容生成 AI 改写缓存文件路径"""
    h = hashlib.md5(text.encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"rewrite_{h}.json")


def get_cached_audio(text: str, voice: str, rate: str):
    """读取缓存音频，不存在返回 None"""
    path = get_cache_path(text, voice, rate)
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f.read()
    return None


def save_cached_audio(text: str, voice: str, rate: str, data: bytes):
    """保存音频到缓存"""
    path = get_cache_path(text, voice, rate)
    with open(path, "wb") as f:
        f.write(data)
    print(f"    💾 音频缓存: {os.path.basename(path)}")


def get_cached_rewrite(text: str) -> str | None:
    """读取 AI 改写缓存，不存在返回 None"""
    path = get_rewrite_cache_path(text)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f).get("text")
    return None


def save_cached_rewrite(text: str, result: str):
    """保存 AI 改写结果到缓存"""
    path = get_rewrite_cache_path(text)
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"text": result}, f, ensure_ascii=False)
    print(f"    💾 改写缓存: {os.path.basename(path)}")
DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"
DEFAULT_RATE = "+5%"
CHUNK_SIZE = 500

# AI 配置（从环境变量读取）
LLM_API_BASE = os.environ.get("LLM_API_BASE", "https://api.openai.com/v1")
LLM_API_KEY = os.environ.get("LLM_API_KEY", "")
LLM_MODEL = os.environ.get("LLM_MODEL", "gpt-4o-mini")

ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "")

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

    # 先查缓存
    cached = get_cached_rewrite(text)
    if cached:
        print(f"  🤖 改写缓存命中: {len(text)} 字")
        return cached

    # 单段文本直接改写
    if len(text) > 8000:
        text = text[:8000]

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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }

    try:
        req = Request(url, data=json.dumps(payload).encode(), headers=headers)
        resp = urlopen(req, timeout=60)
        result = json.loads(resp.read().decode())
        content = result["choices"][0]["message"]["content"]
        print(f"  🤖 AI 改写完成: {len(text)} 字 → {len(content)} 字")
        save_cached_rewrite(text, content)
        return content
    except URLError as e:
        # 打印详细错误帮助排查
        detail = ""
        if hasattr(e, 'read'):
            try:
                detail = e.read().decode()[:200]
            except:
                pass
        print(f"  ⚠️ AI 改写失败: {e} {detail}")
        print(f"     URL: {url}")
        print(f"     Model: {LLM_MODEL}")
        return text
    except Exception as e:
        print(f"  ⚠️ AI 改写失败: {e}，使用原文")
        return text


def split_for_ai(text: str, max_chars: int = 6000) -> list:
    """按段落边界分段（用于 AI 改写，保持上下文完整）"""
    paragraphs = re.split(r'\n{2,}', text)
    segments = []
    current = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if len(current) + len(para) + 2 > max_chars:
            if current:
                segments.append(current.strip())
            current = para
        else:
            current += ("\n\n" + para if current else para)

    if current.strip():
        segments.append(current.strip())

    return segments


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
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Admin-Token")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def _check_auth(self) -> bool:
        """验证管理员 Token，未配置时允许所有请求"""
        if not ADMIN_TOKEN:
            return True
        token = self.headers.get("X-Admin-Token", "")
        return token == ADMIN_TOKEN

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
                "auth_required": bool(ADMIN_TOKEN),
            }
            self.wfile.write(json.dumps(resp).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if not self._check_auth():
            self._error(401, "未授权，请使用管理员链接访问")
            return
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
        """AI 改写接口：自动分段处理长文本"""
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

        # 长文本分段改写（每段 6000 字）
        AI_CHUNK_SIZE = 6000
        if len(text) <= AI_CHUNK_SIZE:
            result = ai_rewrite(text)
        else:
            # 按段落边界分段
            segments = split_for_ai(text, AI_CHUNK_SIZE)
            print(f"     分 {len(segments)} 段改写")
            results = []
            for i, seg in enumerate(segments):
                print(f"     段 {i+1}/{len(segments)}: {len(seg)} 字")
                rewritten = ai_rewrite(seg)
                results.append(rewritten)
            result = "\n\n".join(results)

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
            # 先查缓存
            cached = get_cached_audio(text, voice, rate)
            if cached:
                print(f"  ✅ 缓存命中: {len(text)} 字 -> {len(cached)//1024} KB")
                self.send_response(200)
                self.send_header("Content-Type", "audio/mp3")
                self.send_header("Content-Length", str(len(cached)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("X-Cache", "HIT")
                self.end_headers()
                self.wfile.write(cached)
                return

            audio_data = asyncio.run(self._generate(text, voice, rate))
            save_cached_audio(text, voice, rate, audio_data)
            self.send_response(200)
            self.send_header("Content-Type", "audio/mp3")
            self.send_header("Content-Length", str(len(audio_data)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("X-Cache", "MISS")
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
    print(f"   地址: http://{HOST}:{PORT}")
    print(f"")
    print(f"   API:")
    print(f"     GET  /health      - 健康检查")
    print(f"     POST /rewrite     - AI 改写为播客脚本")
    print(f"     POST /tts         - 一次性生成语音")
    print(f"     POST /tts/stream  - 分段生成语音")
    print(f"")
    print(f"   按 Ctrl+C 停止")
    print(f"{'='*50}")

    server = HTTPServer((HOST, PORT), TTSHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 服务已停止")
        server.shutdown()


if __name__ == "__main__":
    main()
