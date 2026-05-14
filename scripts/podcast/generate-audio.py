"""
Edge TTS 音频生成脚本
将提取的文本转为 MP3 音频文件
支持批量处理和单文件处理
"""

import asyncio
import edge_tts
import os
import sys
import json
import re
from pathlib import Path

# 中文语音选项（推荐）
VOICES = {
    "xiaoxiao": "zh-CN-XiaoxiaoNeural",      # 女声，温暖自然（推荐）
    "yunxi": "zh-CN-YunxiNeural",             # 男声，年轻活力
    "yunyang": "zh-CN-YunyangNeural",         # 男声，新闻播报风格
    "xiaoyi": "zh-CN-XiaoyiNeural",           # 女声，活泼
    "yunfeng": "zh-CN-YunfengNeural",         # 男声，沉稳
}

# 默认配置
DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"
DEFAULT_RATE = "+0%"        # 语速：-50% ~ +100%
DEFAULT_VOLUME = "+0%"      # 音量：-50% ~ +50%
DEFAULT_PITCH = "+0Hz"      # 音调：-50Hz ~ +50Hz


async def text_to_speech(text: str, output_path: str, voice: str = DEFAULT_VOICE,
                         rate: str = DEFAULT_RATE, volume: str = DEFAULT_VOLUME):
    """
    将文本转为语音文件
    
    Args:
        text: 要转换的文本
        output_path: 输出音频文件路径（.mp3）
        voice: 语音名称
        rate: 语速
        volume: 音量
    """
    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    communicate = edge_tts.Communicate(text, voice, rate=rate, volume=volume)
    await communicate.save(output_path)
    
    # 获取文件大小
    size = os.path.getsize(output_path)
    size_mb = size / (1024 * 1024)
    print(f"  ✅ 生成完成: {output_path} ({size_mb:.1f} MB)")


async def generate_with_subtitles(text: str, output_path: str, subtitle_path: str,
                                   voice: str = DEFAULT_VOICE, rate: str = DEFAULT_RATE):
    """
    生成音频和字幕文件（用于播放器同步显示）
    
    Args:
        text: 要转换的文本
        output_path: 输出音频文件路径
        subtitle_path: 输出字幕文件路径（.json）
        voice: 语音名称
        rate: 语速
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    subtitles = []
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    
    with open(output_path, "wb") as audio_file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                subtitles.append({
                    "offset": chunk["offset"],          # 时间偏移（100纳秒单位）
                    "duration": chunk["duration"],      # 持续时间
                    "text": chunk["text"],              # 文字内容
                })
    
    # 保存字幕数据
    with open(subtitle_path, "w", encoding="utf-8") as f:
        json.dump(subtitles, f, ensure_ascii=False, indent=2)
    
    size = os.path.getsize(output_path)
    size_mb = size / (1024 * 1024)
    print(f"  ✅ 音频: {output_path} ({size_mb:.1f} MB)")
    print(f"  ✅ 字幕: {subtitle_path} ({len(subtitles)} 个词)")


def split_text_into_chunks(text: str, max_chars: int = 5000) -> list:
    """
    将长文本分割为多个片段（Edge TTS 有字符限制）
    按段落分割，确保不会在句子中间断开
    
    Args:
        text: 原始文本
        max_chars: 每个片段最大字符数
    
    Returns:
        文本片段列表
    """
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        
        if len(current_chunk) + len(para) + 2 > max_chars:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = para
        else:
            current_chunk += "\n\n" + para if current_chunk else para
    
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks


async def process_text_file(text_path: str, output_dir: str, voice: str = DEFAULT_VOICE,
                            rate: str = DEFAULT_RATE):
    """
    处理单个文本文件，生成音频
    
    Args:
        text_path: 输入文本文件路径
        output_dir: 输出目录
        voice: 语音名称
        rate: 语速
    """
    print(f"\n📖 处理文件: {text_path}")
    
    with open(text_path, "r", encoding="utf-8") as f:
        text = f.read()
    
    if not text.strip():
        print("  ⚠️ 文件为空，跳过")
        return
    
    # 文件名（不含扩展名）
    name = Path(text_path).stem
    
    # 分割长文本
    chunks = split_text_into_chunks(text)
    print(f"  📝 文本长度: {len(text)} 字符，分为 {len(chunks)} 个片段")
    
    if len(chunks) == 1:
        # 单个片段，直接生成
        output_path = os.path.join(output_dir, f"{name}.mp3")
        subtitle_path = os.path.join(output_dir, f"{name}.json")
        await generate_with_subtitles(chunks[0], output_path, subtitle_path, voice, rate)
    else:
        # 多个片段，分别生成
        for i, chunk in enumerate(chunks):
            output_path = os.path.join(output_dir, f"{name}_part{i+1}.mp3")
            subtitle_path = os.path.join(output_dir, f"{name}_part{i+1}.json")
            print(f"  🔊 生成片段 {i+1}/{len(chunks)}...")
            await generate_with_subtitles(chunk, output_path, subtitle_path, voice, rate)
    
    # 生成元数据
    metadata = {
        "source": text_path,
        "voice": voice,
        "rate": rate,
        "totalChars": len(text),
        "chunks": len(chunks),
        "files": [f"{name}_part{i+1}.mp3" for i in range(len(chunks))] if len(chunks) > 1 else [f"{name}.mp3"]
    }
    
    meta_path = os.path.join(output_dir, f"{name}.meta.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    print(f"  ✅ 元数据: {meta_path}")


async def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("Edge TTS 音频生成工具")
        print("=" * 50)
        print("\n用法:")
        print("  python generate-audio.py <文本文件> [输出目录] [语音] [语速]")
        print("\n示例:")
        print("  python generate-audio.py output.txt docs/public/podcast")
        print("  python generate-audio.py output.txt docs/public/podcast xiaoxiao +10%")
        print("\n可用语音:")
        for key, value in VOICES.items():
            print(f"  {key:12s} -> {value}")
        print(f"\n默认语音: {DEFAULT_VOICE}")
        print(f"默认语速: {DEFAULT_RATE}")
        return
    
    text_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "docs/public/podcast"
    voice_key = sys.argv[3] if len(sys.argv) > 3 else None
    rate = sys.argv[4] if len(sys.argv) > 4 else os.environ.get("PODCAST_RATE", DEFAULT_RATE)
    
    # 解析语音
    voice = VOICES.get(voice_key, DEFAULT_VOICE) if voice_key else DEFAULT_VOICE
    
    if not os.path.exists(text_path):
        print(f"❌ 文件不存在: {text_path}")
        return
    
    print(f"🎙️ Edge TTS 音频生成")
    print(f"   语音: {voice}")
    print(f"   语速: {rate}")
    print(f"   输出: {output_dir}")
    
    await process_text_file(text_path, output_dir, voice, rate)
    
    print(f"\n🎉 完成！")


if __name__ == "__main__":
    asyncio.run(main())
