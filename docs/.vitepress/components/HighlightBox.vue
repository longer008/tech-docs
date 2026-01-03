<template>
  <div
    class="highlight-box"
    :class="[
      `type-${type}`,
      { dismissible: dismissible && !isDismissed },
      { 'with-icon': showIcon }
    ]"
    v-if="!isDismissed"
  >
    <div class="highlight-header" v-if="title || dismissible">
      <div class="header-content">
        <div class="icon-title" v-if="showIcon || title">
          <component
            :is="iconComponent"
            v-if="showIcon"
            class="highlight-icon"
            :class="`icon-${type}`"
          />
          <h4 v-if="title" class="highlight-title">{{ title }}</h4>
        </div>
        <button
          v-if="dismissible"
          @click="dismiss"
          class="dismiss-btn"
          aria-label="关闭提示"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="highlight-content">
      <slot></slot>
    </div>

    <div class="highlight-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'

interface Props {
  type?: 'info' | 'tip' | 'warning' | 'danger' | 'success' | 'note'
  title?: string
  icon?: string
  dismissible?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: false
})

const isDismissed = ref(false)

const showIcon = computed(() => {
  return props.icon !== undefined || !props.title
})

const iconComponent = computed(() => {
  const icons = {
    info: () => h('svg', {
      viewBox: '0 0 24 24',
      width: '20',
      height: '20'
    }, [
      h('path', {
        d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z',
        fill: 'currentColor'
      })
    ]),

    tip: () => h('svg', {
      viewBox: '0 0 24 24',
      width: '20',
      height: '20'
    }, [
      h('path', {
        d: 'M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z',
        fill: 'currentColor'
      })
    ]),

    warning: () => h('svg', {
      viewBox: '0 0 24 24',
      width: '20',
      height: '20'
    }, [
      h('path', {
        d: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
        fill: 'currentColor'
      })
    ]),

    danger: () => h('svg', {
      viewBox: '0 0 24 24',
      width: '20',
      height: '20'
    }, [
      h('path', {
        d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
        fill: 'currentColor'
      })
    ]),

    success: () => h('svg', {
      viewBox: '0 0 24 24',
      width: '20',
      height: '20'
    }, [
      h('path', {
        d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
        fill: 'currentColor'
      })
    ]),

    note: () => h('svg', {
      viewBox: '0 0 24 24',
      width: '20',
      height: '20'
    }, [
      h('path', {
        d: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
        fill: 'currentColor'
      })
    ])
  }

  if (props.icon && icons[props.icon as keyof typeof icons]) {
    return icons[props.icon as keyof typeof icons]
  }

  return icons[props.type] || icons.info
})

const dismiss = () => {
  isDismissed.value = true

  // 如果有 ID，保存关闭状态到本地存储
  if (props.id) {
    const dismissed = JSON.parse(localStorage.getItem('dismissed-highlights') || '[]')
    dismissed.push(props.id)
    localStorage.setItem('dismissed-highlights', JSON.stringify(dismissed))
  }
}

// 检查是否已经被关闭过
if (props.id && props.dismissible) {
  const dismissed = JSON.parse(localStorage.getItem('dismissed-highlights') || '[]')
  isDismissed.value = dismissed.includes(props.id)
}
</script>

<style scoped>
.highlight-box {
  margin: 1rem 0;
  border-radius: 8px;
  border-left: 4px solid;
  background: var(--vp-c-bg-soft);
  transition: all 0.3s ease;
  overflow: hidden;
}

.highlight-header {
  padding: 1rem 1rem 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.icon-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.highlight-icon {
  flex-shrink: 0;
}

.highlight-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

.dismiss-btn {
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.dismiss-btn:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.dismiss-btn svg {
  fill: currentColor;
}

.highlight-content {
  padding: 1rem;
}

.highlight-content:first-child {
  padding-top: 1.25rem;
}

.highlight-footer {
  padding: 0 1rem 1rem;
  border-top: 1px solid var(--vp-c-divider-light);
  margin-top: 0.5rem;
  padding-top: 1rem;
}

/* 类型样式 */
.type-info {
  border-left-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.type-info .highlight-title,
.type-info .icon-info {
  color: var(--vp-c-brand-1);
}

.type-tip {
  border-left-color: #42b883;
  background: rgba(66, 184, 131, 0.1);
}

.type-tip .highlight-title,
.type-tip .icon-tip {
  color: #42b883;
}

.type-warning {
  border-left-color: var(--vp-c-warning-1);
  background: var(--vp-c-warning-soft);
}

.type-warning .highlight-title,
.type-warning .icon-warning {
  color: var(--vp-c-warning-1);
}

.type-danger {
  border-left-color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft);
}

.type-danger .highlight-title,
.type-danger .icon-danger {
  color: var(--vp-c-danger-1);
}

.type-success {
  border-left-color: var(--vp-c-success-1);
  background: var(--vp-c-success-soft);
}

.type-success .highlight-title,
.type-success .icon-success {
  color: var(--vp-c-success-1);
}

.type-note {
  border-left-color: #6b7280;
  background: rgba(107, 114, 128, 0.1);
}

.type-note .highlight-title,
.type-note .icon-note {
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .highlight-content {
    padding: 0.75rem;
  }

  .highlight-header {
    padding: 0.75rem 0.75rem 0;
  }

  .highlight-footer {
    padding: 0 0.75rem 0.75rem;
  }

  .icon-title {
    gap: 0.5rem;
  }

  .highlight-title {
    font-size: 0.9rem;
  }
}

/* 内容样式优化 */
.highlight-content :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.highlight-content :deep(p:first-child) {
  margin-top: 0;
}

.highlight-content :deep(p:last-child) {
  margin-bottom: 0;
}

.highlight-content :deep(ul),
.highlight-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.highlight-content :deep(li) {
  margin: 0.25rem 0;
}

.highlight-content :deep(code) {
  padding: 0.2rem 0.4rem;
  background: var(--vp-code-bg);
  border-radius: 4px;
  font-size: 0.9em;
}

.highlight-content :deep(a) {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
}

.highlight-content :deep(a:hover) {
  color: var(--vp-c-brand-2);
}

/* 动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.highlight-box {
  animation: slideIn 0.3s ease;
}

/* 深色模式适配 */
.dark .type-tip {
  background: rgba(66, 184, 131, 0.15);
}

.dark .type-note {
  background: rgba(107, 114, 128, 0.15);
  color: #9ca3af;
}

.dark .type-note .highlight-title,
.dark .type-note .icon-note {
  color: #9ca3af;
}
</style>