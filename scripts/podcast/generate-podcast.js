/**
 * 播客生成主脚本
 * 一键将 Markdown 文档转为播客音频
 * 
 * 用法:
 *   node scripts/podcast/generate-podcast.js <markdown文件路径> [选项]
 * 
 * 示例:
 *   node scripts/podcast/generate-podcast.js docs/frontend/vue/vue3-interview.md
 *   node scripts/podcast/generate-podcast.js docs/frontend/vue/vue3-interview.md --voice yunxi --rate +10%
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { join, basename, dirname, relative } from 'path'
import { processFile } from './extract-text.js'

// 项目根目录
const ROOT = process.cwd()
const PODCAST_DIR = join(ROOT, 'docs', 'public', 'podcast')
const TEMP_DIR = join(ROOT, 'scripts', 'podcast', '.temp')

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    input: null,
    voice: 'xiaoxiao',
    rate: '+5%',  // 稍快一点更适合技术内容
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--voice' && args[i + 1]) {
      options.voice = args[++i]
    } else if (args[i] === '--rate' && args[i + 1]) {
      options.rate = args[++i]
    } else if (!args[i].startsWith('--')) {
      options.input = args[i]
    }
  }

  return options
}

function getOutputName(inputPath) {
  // 从文件路径生成输出名称
  // docs/frontend/vue/vue3-interview.md -> frontend-vue-vue3-interview
  const rel = relative(join(ROOT, 'docs'), inputPath)
  return rel
    .replace(/\\/g, '/')
    .replace(/\.md$/, '')
    .replace(/\//g, '-')
    .replace(/^-/, '')
}

async function main() {
  const options = parseArgs()

  if (!options.input) {
    console.log('🎙️ 播客生成工具')
    console.log('=' .repeat(50))
    console.log('\n用法:')
    console.log('  node scripts/podcast/generate-podcast.js <markdown文件> [选项]')
    console.log('\n选项:')
    console.log('  --voice <名称>   语音（xiaoxiao/yunxi/yunyang/xiaoyi/yunfeng）')
    console.log('  --rate <速率>    语速（如 +10%、-5%）')
    console.log('\n示例:')
    console.log('  node scripts/podcast/generate-podcast.js docs/frontend/vue/vue3-interview.md')
    console.log('  node scripts/podcast/generate-podcast.js docs/ai-interview/prompt-engineering-interview.md --voice yunxi')
    process.exit(0)
  }

  const inputPath = join(ROOT, options.input)
  if (!existsSync(inputPath)) {
    console.error(`❌ 文件不存在: ${options.input}`)
    process.exit(1)
  }

  const outputName = getOutputName(inputPath)
  console.log(`\n🎙️ 播客生成`)
  console.log(`   输入: ${options.input}`)
  console.log(`   输出名: ${outputName}`)
  console.log(`   语音: ${options.voice}`)
  console.log(`   语速: ${options.rate}`)

  // 步骤 1: 提取文本
  console.log('\n📝 步骤 1: 提取可朗读文本...')
  if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true })
  
  const text = processFile(inputPath)
  const textPath = join(TEMP_DIR, `${outputName}.txt`)
  writeFileSync(textPath, text, 'utf-8')
  console.log(`   ✅ 提取完成，${text.length} 字符`)

  // 步骤 2: 生成音频
  console.log('\n🔊 步骤 2: 生成音频...')
  const outputDir = join(PODCAST_DIR, dirname(relative(join(ROOT, 'docs'), inputPath)).replace(/\\/g, '/'))
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

  const scriptPath = join(ROOT, 'scripts', 'podcast', 'generate-audio.py')
  
  try {
    // 通过环境变量传递 rate，避免 Windows cmd 中 % 转义问题
    const { execSync } = await import('child_process')
    const env = { ...process.env, PODCAST_RATE: options.rate }
    execSync(
      `python "${scriptPath}" "${textPath}" "${outputDir}" ${options.voice}`,
      { stdio: 'inherit', cwd: ROOT, env, shell: true }
    )
  } catch (error) {
    console.error('❌ 音频生成失败:', error.message)
    process.exit(1)
  }

  // 步骤 3: 生成播客索引
  console.log('\n📋 步骤 3: 更新播客索引...')
  updatePodcastIndex(inputPath, outputName, outputDir, options)

  console.log('\n🎉 播客生成完成！')
  console.log(`   音频位置: ${relative(ROOT, outputDir)}`)
  console.log(`   在文档中使用: 页面会自动检测并显示播放器`)
}

function updatePodcastIndex(inputPath, outputName, outputDir, options) {
  const indexPath = join(PODCAST_DIR, 'index.json')
  let index = {}

  if (existsSync(indexPath)) {
    index = JSON.parse(readFileSync(indexPath, 'utf-8'))
  }

  // 计算相对于 public/podcast 的路径
  const relPath = relative(PODCAST_DIR, outputDir).replace(/\\/g, '/')
  const docPath = '/' + relative(join(ROOT, 'docs'), inputPath).replace(/\\/g, '/').replace(/\.md$/, '')

  index[docPath] = {
    title: getDocTitle(inputPath),
    audioPath: relPath ? `${relPath}/${outputName}.mp3` : `${outputName}.mp3`,
    voice: options.voice,
    generatedAt: new Date().toISOString(),
  }

  writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8')
  console.log(`   ✅ 索引已更新: ${indexPath}`)
}

function getDocTitle(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  // 尝试从 frontmatter 获取 title
  const frontmatterMatch = content.match(/^---\s*\n[\s\S]*?title:\s*(.+?)\s*\n[\s\S]*?---/m)
  if (frontmatterMatch) return frontmatterMatch[1].trim()
  
  // 尝试从第一个 # 标题获取
  const headingMatch = content.match(/^#\s+(.+)$/m)
  if (headingMatch) return headingMatch[1].trim()
  
  return basename(filePath, '.md')
}

main().catch(console.error)
