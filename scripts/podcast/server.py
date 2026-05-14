"""
播客 TTS 本地服务（流式版）
支持分段生成 + 流式返回，实现边生成边播放

用法:
  python scripts/podcast/server.py

端口: 3456
"""

import asyncio
import json
import os
import io
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
import edge_tts

PORT = 3456
DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"
DEFAULT_RATE = "+5%"

# 每段最大字符数（越小首段越快，但段间可能有停顿）
CHUNK_SIZE = 2000


def split_text(text: str, max_chars: int = CHUNK_SIZE) -> list:
    """
    智能分段：按段落/句子边界切分文本
    确保不会在句子中间断开
    """
    # 先按段落分
    paragraphs = re.split(r'\n{2,}', text)
    chunks = []
    current = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        # 如果当前段落本身就超长，按句子切分
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
            # 处理最后一个（如果是奇数个）
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
            self.wfile.write(json.dumps({"status": "ok", "voice": DEFAULT_VOICE}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/tts":
            self._handle_tts()
        elif self.path == "/tts/stream":
            self._handle_tts_stream()
        else:
            self.send_response(404)
            self.end_headers()

    def _handle_tts(self):
        """一次性生成（保留兼容）"""
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

        try:
            audio_data = asyncio.run(self._generate_full(text))
            self.send_response(200)
            self.send_header("Content-Type", "audio/mp3")
            self.send_header("Content-Length", str(len(audio_data)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(audio_data)
            print(f"  ✅ 完整生成: {len(text)} 字 -> {len(audio_data)//1024} KB")
        except Exception as e:
            self._error(500, str(e))

    def _handle_tts_stream(self):
        """
        流式生成：分段生成音频，每段独立返回完整 MP3
        前端分多次请求，每次传入 chunk_index 获取对应段
        """
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

        # 分段
        chunks = split_text(text)
        total_chunks = len(chunks)

        if chunk_index >= total_chunks:
            self._error(400, f"chunk_index {chunk_index} out of range (total: {total_chunks})")
            return

        chunk_text = chunks[chunk_index]
        print(f"  📝 生成段 {chunk_index+1}/{total_chunks}: {len(chunk_text)} 字")

        try:
            audio_data = asyncio.run(self._generate_full(chunk_text, voice, rate))
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
            print(f"    ✅ 段 {chunk_index+1}/{total_chunks}: {len(audio_data)//1024} KB")
        except (BrokenPipeError, ConnectionResetError):
            print(f"  ⚠️ 客户端断开连接")
        except Exception as e:
            print(f"  ❌ 段 {chunk_index+1} 生成失败: {e}")
            self._error(500, str(e))

    async def _generate_full(self, text: str, voice: str = DEFAULT_VOICE, rate: str = DEFAULT_RATE) -> bytes:
        """生成单段音频"""
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
        if "OPTIONS" not in str(args):
            pass  # 自定义日志已在各方法中处理


def main():
    print(f"🎙️ 播客 TTS 本地服务（流式版）")
    print(f"   端口: {PORT}")
    print(f"   语音: {DEFAULT_VOICE}")
    print(f"   语速: {DEFAULT_RATE}")
    print(f"   分段: 每段 {CHUNK_SIZE} 字")
    print(f"   地址: http://127.0.0.1:{PORT}")
    print(f"")
    print(f"   API:")
    print(f"     GET  /health      - 健康检查")
    print(f"     POST /tts         - 一次性生成")
    print(f"     POST /tts/stream  - 流式生成（推荐）")
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
