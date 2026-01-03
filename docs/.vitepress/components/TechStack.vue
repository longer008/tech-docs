<template>
  <div class="tech-stack">
    <div class="stack-header" v-if="title">
      <h3 class="stack-title">{{ title }}</h3>
      <p v-if="description" class="stack-description">{{ description }}</p>
    </div>

    <div class="filter-section" v-if="showFilters && categories.length > 1">
      <div class="filter-buttons">
        <button
          v-for="category in ['all', ...categories]"
          :key="category"
          @click="setActiveFilter(category)"
          class="filter-btn"
          :class="{ active: activeFilter === category }"
        >
          {{ getCategoryLabel(category) }}
        </button>
      </div>
    </div>

    <div class="tech-grid">
      <TransitionGroup name="tech-item" tag="div" class="tech-items">
        <div
          v-for="item in filteredItems"
          :key="item.name"
          class="tech-item"
          :class="`category-${item.category}`"
          @click="selectItem(item)"
        >
          <div class="item-header">
            <div class="icon-section">
              <div class="tech-icon" :class="`icon-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`">
                <component
                  :is="getIcon(item)"
                  v-if="item.icon"
                  class="custom-icon"
                />
                <span v-else class="fallback-icon">
                  {{ item.name.charAt(0).toUpperCase() }}
                </span>
              </div>
            </div>
            <div class="info-section">
              <h4 class="tech-name">{{ item.name }}</h4>
              <p v-if="item.description" class="tech-description">
                {{ item.description }}
              </p>
            </div>
          </div>

          <div class="item-content">
            <div class="level-section" v-if="showLevels">
              <div class="level-info">
                <span class="level-label">熟练度</span>
                <span class="level-value">{{ item.level }}%</span>
              </div>
              <div class="level-bar">
                <div
                  class="level-progress"
                  :style="{ width: `${item.level}%` }"
                  :class="getLevelClass(item.level)"
                ></div>
              </div>
            </div>

            <div class="tags-section" v-if="item.tags && item.tags.length">
              <span
                v-for="tag in item.tags"
                :key="tag"
                class="tech-tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="actions-section" v-if="showActions">
              <button
                v-if="item.docs"
                @click.stop="openDocs(item.docs)"
                class="action-btn docs-btn"
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                文档
              </button>
              <button
                v-if="item.playground"
                @click.stop="openPlayground(item.playground)"
                class="action-btn playground-btn"
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                练习
              </button>
            </div>
          </div>

          <div class="hover-overlay">
            <p v-if="item.summary" class="item-summary">{{ item.summary }}</p>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <div class="stack-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'

interface TechItem {
  name: string
  level: number
  category: string
  description?: string
  summary?: string
  icon?: string
  tags?: string[]
  docs?: string
  playground?: string
}

interface Props {
  items: TechItem[]
  title?: string
  description?: string
  showFilters?: boolean
  showLevels?: boolean
  showActions?: boolean
  layout?: 'grid' | 'list'
}

const props = withDefaults(defineProps<Props>(), {
  showFilters: true,
  showLevels: true,
  showActions: true,
  layout: 'grid'
})

const activeFilter = ref('all')

const categories = computed(() => {
  return [...new Set(props.items.map(item => item.category))]
})

const filteredItems = computed(() => {
  if (activeFilter.value === 'all') {
    return props.items
  }
  return props.items.filter(item => item.category === activeFilter.value)
})

const setActiveFilter = (filter: string) => {
  activeFilter.value = filter
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    all: '全部',
    frontend: '前端',
    backend: '后端',
    database: '数据库',
    devops: 'DevOps',
    mobile: '移动端',
    desktop: '桌面端',
    language: '编程语言',
    framework: '框架',
    library: '库',
    tool: '工具'
  }
  return labels[category] || category
}

const getLevelClass = (level: number) => {
  if (level >= 80) return 'level-expert'
  if (level >= 60) return 'level-advanced'
  if (level >= 40) return 'level-intermediate'
  return 'level-beginner'
}

const getIcon = (item: TechItem) => {
  const iconMap: Record<string, any> = {
    vue: () => h('svg', { viewBox: '0 0 24 24', width: '24', height: '24' }, [
      h('path', {
        d: 'M2 3h3.5L12 15 18.5 3H22L12 21L2 3z',
        fill: '#4FC08D'
      })
    ]),
    react: () => h('svg', { viewBox: '0 0 24 24', width: '24', height: '24' }, [
      h('circle', { cx: '12', cy: '12', r: '2', fill: '#61DAFB' }),
      h('path', {
        d: 'M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M21,12A3,3 0 0,1 18,15H12A3,3 0 0,1 9,12A3,3 0 0,1 12,9H18A3,3 0 0,1 21,12M12,22A3,3 0 0,1 9,19V13A3,3 0 0,1 12,10A3,3 0 0,1 15,13V19A3,3 0 0,1 12,22Z',
        fill: '#61DAFB'
      })
    ]),
    typescript: () => h('svg', { viewBox: '0 0 24 24', width: '24', height: '24' }, [
      h('rect', { width: '24', height: '24', rx: '3', fill: '#3178C6' }),
      h('text', {
        x: '12', y: '16',
        'text-anchor': 'middle',
        fill: 'white',
        'font-family': 'monospace',
        'font-weight': 'bold',
        'font-size': '12'
      }, 'TS')
    ]),
    javascript: () => h('svg', { viewBox: '0 0 24 24', width: '24', height: '24' }, [
      h('rect', { width: '24', height: '24', rx: '3', fill: '#F7DF1E' }),
      h('text', {
        x: '12', y: '16',
        'text-anchor': 'middle',
        fill: 'black',
        'font-family': 'monospace',
        'font-weight': 'bold',
        'font-size': '12'
      }, 'JS')
    ]),
    nodejs: () => h('svg', { viewBox: '0 0 24 24', width: '24', height: '24' }, [
      h('path', {
        d: 'M12,1.85C11.73,1.85 11.45,1.92 11.22,2.05L3.78,6.35C3.32,6.61 3.07,7.11 3.07,7.65V16.35C3.07,16.89 3.32,17.39 3.78,17.65L11.22,21.95C11.45,22.08 11.73,22.15 12,22.15C12.27,22.15 12.55,22.08 12.78,21.95L20.22,17.65C20.68,17.39 20.93,16.89 20.93,16.35V7.65C20.93,7.11 20.68,6.61 20.22,6.35L12.78,2.05C12.55,1.92 12.27,1.85 12,1.85Z',
        fill: '#8CC84B'
      })
    ])
  }

  const iconKey = item.name.toLowerCase().replace(/[^a-z0-9]/g, '')
  return iconMap[iconKey] || iconMap[item.icon?.toLowerCase() || '']
}

const selectItem = (item: TechItem) => {
  // 触发选择事件
  console.log('Selected tech item:', item)
}

const openDocs = (url: string) => {
  window.open(url, '_blank')
}

const openPlayground = (url: string) => {
  window.open(url, '_blank')
}
</script>

<style scoped>
.tech-stack {
  margin: 2rem 0;
}

.stack-header {
  text-align: center;
  margin-bottom: 2rem;
}

.stack-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.stack-description {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 1rem;
  line-height: 1.6;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.filter-btn.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.tech-items {
  display: contents;
}

.tech-item {
  position: relative;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.tech-item:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: var(--vp-shadow-3);
  transform: translateY(-4px);
}

.item-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.icon-section {
  flex-shrink: 0;
}

.tech-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
}

.custom-icon {
  width: 24px;
  height: 24px;
}

.fallback-icon {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.info-section {
  flex: 1;
  min-width: 0;
}

.tech-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.tech-description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

.item-content {
  space-y: 1rem;
}

.level-section {
  margin-bottom: 1rem;
}

.level-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.level-label {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.level-value {
  font-size: 0.8rem;
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.level-bar {
  height: 6px;
  background: var(--vp-c-bg);
  border-radius: 3px;
  overflow: hidden;
}

.level-progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.level-beginner {
  background: var(--vp-c-danger-1);
}

.level-intermediate {
  background: var(--vp-c-warning-1);
}

.level-advanced {
  background: var(--vp-c-success-1);
}

.level-expert {
  background: var(--vp-c-brand-1);
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.tech-tag {
  padding: 0.25rem 0.5rem;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.actions-section {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.action-btn svg {
  fill: currentColor;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.3s ease;
}

.tech-item:hover .hover-overlay {
  opacity: 0.95;
  transform: translateY(0);
}

.item-summary {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 动画效果 */
.tech-item-enter-active,
.tech-item-leave-active {
  transition: all 0.3s ease;
}

.tech-item-enter-from,
.tech-item-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.tech-item-move {
  transition: transform 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tech-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .tech-item {
    padding: 1rem;
  }

  .item-header {
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .tech-icon {
    width: 40px;
    height: 40px;
  }

  .custom-icon {
    width: 20px;
    height: 20px;
  }

  .tech-name {
    font-size: 1rem;
  }

  .tech-description {
    font-size: 0.8rem;
  }

  .filter-buttons {
    justify-content: flex-start;
  }

  .filter-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .actions-section {
    flex-direction: column;
  }

  .action-btn {
    padding: 0.6rem;
    justify-content: center;
  }
}

/* 类别主题色 */
.category-frontend {
  border-left: 3px solid #42b883;
}

.category-backend {
  border-left: 3px solid #ff6b6b;
}

.category-database {
  border-left: 3px solid #4ecdc4;
}

.category-devops {
  border-left: 3px solid #ffe66d;
}

.category-mobile {
  border-left: 3px solid #a8e6cf;
}

.category-language {
  border-left: 3px solid #ff8b94;
}

/* 列表布局 */
.tech-stack[data-layout="list"] .tech-grid {
  grid-template-columns: 1fr;
}

.tech-stack[data-layout="list"] .tech-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
}

.tech-stack[data-layout="list"] .item-header {
  margin-bottom: 0;
  margin-right: 2rem;
}

.tech-stack[data-layout="list"] .item-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
}
</style>