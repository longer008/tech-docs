"""
播客 TTS 本地服务
启动后浏览器可以通过 HTTP 请求生成语音

用法:
  python scripts/podcast/server.py

默认端口: 3456
"""

import asyncio
import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import edge_tts
import io
import threading

PORT = 3456
DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"
DEFAULT_RATE = "+5%"


class TTSHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """处理 CORS 预检请求"""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def do_GET(self):
        """健康检查"""
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "voice": DEFAULT_VOICE}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        """生成语音"""
        parsed = urlparse(self.path)
        if parsed.path != "/tts":
            self.send_response(404)
            self.end_headers()
            return

        # 读取请求体
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")

        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"error": "Invalid JSON"}')
            return

        text = data.get("text", "").strip()
        voice = data.get("voice", DEFAULT_VOICE)
        rate = data.get("rate", DEFAULT_RATE)

        if not text:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "text is required"}).encode())
            return

        if len(text) > 100000:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "text too long (max 100000)"}).encode())
            return

        # 生成音频
        try:
            audio_data = asyncio.run(self._generate(text, voice, rate))
            self.send_response(200)
            self.send_header("Content-Type", "audio/mp3")
            self.send_header("Content-Length", str(len(audio_data)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(audio_data)
            print(f"  ✅ 生成完成: {len(text)} 字 -> {len(audio_data)/1024:.1f} KB")
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
            print(f"  ❌ 生成失败: {e}")

    async def _generate(self, text: str, voice: str, rate: str) -> bytes:
        """调用 edge-tts 生成音频"""
        communicate = edge_tts.Communicate(text, voice, rate=rate)
        audio_buffer = io.BytesIO()

        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_buffer.write(chunk["data"])

        return audio_buffer.getvalue()

    def log_message(self, format, *args):
        """自定义日志格式"""
        if "OPTIONS" not in str(args):
            print(f"  [{self.log_date_time_string()}] {args[0]}")


def main():
    print(f"🎙️ 播客 TTS 本地服务")
    print(f"   端口: {PORT}")
    print(f"   语音: {DEFAULT_VOICE}")
    print(f"   语速: {DEFAULT_RATE}")
    print(f"   地址: http://localhost:{PORT}")
    print(f"")
    print(f"   API:")
    print(f"     GET  /health     - 健康检查")
    print(f"     POST /tts        - 生成语音 (body: {{\"text\": \"...\"}}) ")
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
