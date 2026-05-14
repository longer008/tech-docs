/**
 * Markdown 文档内容提取器
 * 将 Markdown 转为适合 TTS 朗读的纯文本
 * 智能跳过代码块、表格、链接URL、HTML标签等不适合朗读的内容
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, basename, dirname } from 'path'

/**
 * 从 Markdown 提取适合朗读的文本
 * @param {string} markdown - Markdown 原始内容
 * @returns {string} 适合 TTS 朗读的纯文本
 */
export function extractReadableText(markdown) {
  let text = markdown

  // 1. 移除 frontmatter
  text = text.replace(/^---[\s\S]*?---\n*/m, '')

  // 2. 移除 HTML 注释
  text = text.replace(/<!--[\s\S]*?-->/g, '')

  // 3. 移除代码块（包括语言标识）
  text = text.replace(/```[\s\S]*?```/g, '')

  // 4. 移除行内代码，保留文字描述
  text = text.replace(/`([^`]+)`/g, '$1')

  // 5. 移除表格
  text = text.replace(/\|.*\|/g, '')
  text = text.replace(/[-|:]+\s*\n/g, '')

  // 6. 移除图片
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '')

  // 7. 处理链接 - 保留链接文字，去掉 URL
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // 8. 移除 HTML 标签
  text = text.replace(/<[^>]+>/g, '')

  // 9. 处理标题 - 转为朗读友好的格式
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '\n$1。\n')

  // 10. 移除加粗/斜体标记，保留文字
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  text = text.replace(/\*([^*]+)\*/g, '$1')
  text = text.replace(/__([^_]+)__/g, '$1')
  text = text.replace(/_([^_]+)_/g, '$1')

  // 11. 移除删除线
  text = text.replace(/~~([^~]+)~~/g, '$1')

  // 12. 处理无序列表 - 保留文字
  text = text.replace(/^\s*[-*+]\s+/gm, '')

  // 13. 处理有序列表 - 保留文字
  text = text.replace(/^\s*\d+\.\s+/gm, '')

  // 14. 移除引用标记
  text = text.replace(/^\s*>\s*/gm, '')

  // 15. 移除水平线
  text = text.replace(/^[-*_]{3,}\s*$/gm, '')

  // 16. 移除多余空行（保留最多一个）
  text = text.replace(/\n{3,}/g, '\n\n')

  // 17. 移除行首行尾空白
  text = text.split('\n').map(line => line.trim()).join('\n')

  // 18. 移除纯符号行（如 :::、---）
  text = text.replace(/^[:\-=*_#>|`~]+\s*$/gm, '')

  // 19. 移除 VitePress 容器语法
  text = text.replace(/^:::\s*\w+.*$/gm, '')

  // 20. 再次清理多余空行
  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}

/**
 * 为 TTS 优化文本（添加停顿标记等）
 * @param {string} text - 纯文本
 * @returns {string} TTS 优化后的文本
 */
export function optimizeForTTS(text) {
  let result = text

  // 在句号后添加短暂停顿（通过换行实现）
  // Edge TTS 会在换行处自然停顿

  // 移除过短的行（可能是残留标记）
  result = result.split('\n')
    .filter(line => line.trim().length > 2)
    .join('\n')

  return result
}

/**
 * 处理单个文件
 */
export function processFile(inputPath) {
  const content = readFileSync(inputPath, 'utf-8')
  const readable = extractReadableText(content)
  const optimized = optimizeForTTS(readable)
  return optimized
}

// CLI 模式
if (process.argv[1] && process.argv[1].includes('extract-text')) {
  const inputFile = process.argv[2]
  const outputFile = process.argv[3]

  if (!inputFile) {
    console.log('用法: node extract-text.js <输入.md> [输出.txt]')
    console.log('示例: node extract-text.js docs/frontend/vue/vue3-interview.md output.txt')
    process.exit(1)
  }

  const text = processFile(inputFile)

  if (outputFile) {
    const dir = dirname(outputFile)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(outputFile, text, 'utf-8')
    console.log(`✅ 已提取文本到: ${outputFile}`)
    console.log(`   字数: ${text.length}`)
  } else {
    console.log(text)
  }
}
