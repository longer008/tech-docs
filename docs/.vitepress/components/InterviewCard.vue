<template>
  <div class="interview-card" :class="`difficulty-${difficulty}`">
    <div class="card-header" @click="toggle">
      <div class="question-section">
        <h3 class="question-title">{{ question }}</h3>
        <div class="metadata">
          <span class="difficulty-badge" :class="`badge-${difficulty}`">
            {{ difficultyText }}
          </span>
          <div class="tags" v-if="tags && tags.length">
            <span
              v-for="tag in tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
      <div class="toggle-section">
        <button class="toggle-btn" :aria-expanded="isExpanded">
          <svg
            class="toggle-icon"
            :class="{ expanded: isExpanded }"
            viewBox="0 0 24 24"
            width="20"
            height="20"
          >
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
      </div>
    </div>

    <Transition name="slide">
      <div v-show="isExpanded" class="card-content">
        <div class="answer-section">
          <div class="answer-header">
            <h4>答案解析</h4>
            <div class="action-buttons">
              <button @click="toggleFavorite" class="action-btn" :class="{ active: isFavorited }">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path v-if="!isFavorited" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  <path v-else d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                </svg>
                收藏
              </button>
              <button @click="copyLink" class="action-btn">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                复制
              </button>
            </div>
          </div>
          <div class="answer-content">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  question: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  id?: string
  defaultExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  difficulty: 'medium',
  tags: () => [],
  defaultExpanded: false
})

const isExpanded = ref(props.defaultExpanded)
const isFavorited = ref(false)

const difficultyText = computed(() => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[props.difficulty]
})

const toggle = () => {
  isExpanded.value = !isExpanded.value
}

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value

  // 保存到本地存储
  const favorites = JSON.parse(localStorage.getItem('interview-favorites') || '[]')
  if (isFavorited.value) {
    favorites.push(props.id || props.question)
  } else {
    const index = favorites.indexOf(props.id || props.question)
    if (index > -1) favorites.splice(index, 1)
  }
  localStorage.setItem('interview-favorites', JSON.stringify(favorites))
}

const copyLink = async () => {
  try {
    const url = `${window.location.href}#${encodeURIComponent(props.question)}`
    await navigator.clipboard.writeText(url)

    // 简单的提示反馈
    const btn = event?.target as HTMLElement
    const originalText = btn.textContent
    btn.textContent = '已复制!'
    setTimeout(() => {
      btn.textContent = originalText
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

onMounted(() => {
  // 检查是否已收藏
  const favorites = JSON.parse(localStorage.getItem('interview-favorites') || '[]')
  isFavorited.value = favorites.includes(props.id || props.question)
})
</script>

<style scoped>
.interview-card {
  margin: 1rem 0;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s ease;
}

.interview-card:hover {
  box-shadow: var(--vp-shadow-2);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem;
  cursor: pointer;
  user-select: none;
}

.question-section {
  flex: 1;
  margin-right: 1rem;
}

.question-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

.metadata {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-easy {
  background: var(--vp-c-success-soft);
  color: var(--vp-c-success-1);
}

.badge-medium {
  background: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-1);
}

.badge-hard {
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag {
  padding: 0.2rem 0.5rem;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.toggle-section {
  flex-shrink: 0;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--vp-c-text-2);
}

.toggle-btn:hover {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}

.toggle-icon {
  transition: transform 0.3s ease;
  fill: currentColor;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.card-content {
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.answer-section {
  padding: 1.25rem;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.answer-header h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.action-btn.active {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
  border-color: var(--vp-c-brand-1);
}

.answer-content {
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

/* 动画效果 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 1000px;
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    padding: 1rem;
  }

  .answer-section {
    padding: 1rem;
  }

  .question-title {
    font-size: 1rem;
  }

  .metadata {
    gap: 0.375rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.375rem;
  }

  .action-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
}

/* 难度主题色 */
.difficulty-easy {
  border-left: 4px solid var(--vp-c-success-1);
}

.difficulty-medium {
  border-left: 4px solid var(--vp-c-warning-1);
}

.difficulty-hard {
  border-left: 4px solid var(--vp-c-danger-1);
}
</style>