<template>
  <div v-if="readingTime" class="reading-time-info">
    <span class="reading-time-item">
      <span class="icon">📊</span>
      <span class="label">字数：</span>
      <span class="value">{{ wordCount }}</span>
    </span>
    <span class="reading-time-separator">|</span>
    <span class="reading-time-item">
      <span class="icon">⏱️</span>
      <span class="label">阅读时间：</span>
      <span class="value">{{ readingTime }} 分钟</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()

// 计算字数（中英文混合）
const wordCount = computed(() => {
  const content = page.value.content || ''
  // 移除代码块
  const withoutCode = content.replace(/```[\s\S]*?```/g, '')
  // 移除行内代码
  const withoutInlineCode = withoutCode.replace(/`[^`]*`/g, '')
  // 移除 HTML 标签
  const withoutHtml = withoutInlineCode.replace(/<[^>]*>/g, '')
  // 移除 Markdown 语法
  const withoutMarkdown = withoutHtml
    .replace(/[#*_~`\[\]()]/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
  
  // 计算中文字符数
  const chineseChars = (withoutMarkdown.match(/[\u4e00-\u9fa5]/g) || []).length
  // 计算英文单词数
  const englishWords = (withoutMarkdown.match(/[a-zA-Z]+/g) || []).length
  
  return chineseChars + englishWords
})

// 计算阅读时间（中文每分钟 300 字，英文每分钟 200 词）
const readingTime = computed(() => {
  const words = wordCount.value
  if (words === 0) return 0
  
  // 平均每分钟阅读 250 字/词
  const minutes = Math.ceil(words / 250)
  return minutes
})
</script>

<style scoped>
.reading-time-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin: 1rem 0;
  background-color: var(--vp-c-bg-soft);
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.reading-time-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.reading-time-item .icon {
  font-size: 1rem;
}

.reading-time-item .label {
  font-weight: 500;
}

.reading-time-item .value {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.reading-time-separator {
  color: var(--vp-c-divider);
}

@media (max-width: 640px) {
  .reading-time-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .reading-time-separator {
    display: none;
  }
}
</style>
