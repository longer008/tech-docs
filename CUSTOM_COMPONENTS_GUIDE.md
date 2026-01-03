# 自定义 Vue 组件指南

本文档介绍如何为技术面试知识库添加实用的自定义 Vue 组件，提升用户学习体验。

## 🎯 组件设计理念

### 核心原则
- **学习导向**: 专为技术面试学习场景设计
- **交互体验**: 提供丰富的用户交互功能
- **响应式设计**: 完美适配各种设备
- **主题一致**: 与 VitePress 默认主题无缝集成

## 📦 组件架构

### 目录结构
```
docs/.vitepress/
├── components/           # 自定义组件目录
│   ├── InterviewCard.vue     # 面试题卡片
│   ├── TechStack.vue         # 技术栈展示
│   ├── CodeComparison.vue    # 代码对比
│   ├── StudyProgress.vue     # 学习进度
│   ├── QuickReference.vue    # 快速参考
│   ├── Timeline.vue          # 时间线
│   ├── HighlightBox.vue      # 高亮提示框
│   └── TipOfTheDay.vue       # 每日提示
├── theme/
│   └── index.ts              # 主题配置
└── config.mts                # VitePress 配置
```

## 🧩 组件详细介绍

### 1. InterviewCard - 面试题卡片组件

**功能**: 展示面试题目和答案，支持展开/折叠、难度标记、标签分类

**特性**:
- ✅ 题目与答案分离展示
- ✅ 难度等级可视化
- ✅ 技术标签分类
- ✅ 收藏/标记功能
- ✅ 答题计时器

**使用示例**:
```markdown
<InterviewCard
  question="什么是 Vue.js 的响应式原理？"
  difficulty="medium"
  tags="['Vue.js', '响应式', '源码']"
  category="frontend"
>
Vue.js 响应式原理基于数据劫持和观察者模式...
</InterviewCard>
```

### 2. TechStack - 技术栈展示组件

**功能**: 可视化展示项目技术栈，支持图标、描述、熟练度

**特性**:
- ✅ 技术图标展示
- ✅ 熟练度进度条
- ✅ 悬停详细信息
- ✅ 分类筛选
- ✅ 学习建议

**使用示例**:
```markdown
<TechStack>
  <TechItem name="Vue.js" level="90" icon="vue" category="frontend" />
  <TechItem name="TypeScript" level="85" icon="typescript" category="language" />
  <TechItem name="Node.js" level="75" icon="nodejs" category="backend" />
</TechStack>
```

### 3. CodeComparison - 代码对比组件

**功能**: 并排展示不同的代码实现，便于比较学习

**特性**:
- ✅ 语法高亮
- ✅ 差异标记
- ✅ 性能对比
- ✅ 最佳实践标注
- ✅ 复制代码功能

**使用示例**:
```markdown
<CodeComparison>
  <template #left title="传统写法">
    ```javascript
    function fetchData() {
      return new Promise(resolve => {
        setTimeout(() => resolve('data'), 1000)
      })
    }
    ```
  </template>
  <template #right title="现代写法">
    ```javascript
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return 'data'
    }
    ```
  </template>
</CodeComparison>
```

### 4. StudyProgress - 学习进度组件

**功能**: 跟踪用户的学习进度，提供可视化反馈

**特性**:
- ✅ 章节完成度
- ✅ 学习时长统计
- ✅ 成就系统
- ✅ 学习建议
- ✅ 数据持久化

**使用示例**:
```markdown
<StudyProgress
  chapter="frontend-fundamentals"
  total="50"
  completed="32"
  timeSpent="12h 30m"
/>
```

### 5. QuickReference - 快速参考组件

**功能**: 可折叠的速查卡片，便于快速查阅要点

**特性**:
- ✅ 手风琴式展开
- ✅ 搜索过滤
- ✅ 标签分类
- ✅ 打印友好
- ✅ 导出功能

**使用示例**:
```markdown
<QuickReference title="JavaScript 核心 API">
  <RefItem title="数组方法" tags="['ES6', 'Array']">
    - map(), filter(), reduce()
    - find(), some(), every()
  </RefItem>
  <RefItem title="Promise API" tags="['异步', 'Promise']">
    - Promise.all(), Promise.race()
    - async/await 语法
  </RefItem>
</QuickReference>
```

### 6. Timeline - 时间线组件

**功能**: 展示学习计划、技术发展历程等时间序列内容

**特性**:
- ✅ 垂直/水平布局
- ✅ 里程碑标记
- ✅ 进度指示
- ✅ 交互式操作
- ✅ 响应式设计

**使用示例**:
```markdown
<Timeline>
  <TimelineItem date="第1天" status="completed">
    JavaScript 基础语法
  </TimelineItem>
  <TimelineItem date="第2天" status="current">
    DOM 操作与事件处理
  </TimelineItem>
  <TimelineItem date="第3天" status="pending">
    异步编程与 Promise
  </TimelineItem>
</Timeline>
```

### 7. HighlightBox - 高亮提示框组件

**功能**: 强调重要内容，支持多种样式和图标

**特性**:
- ✅ 多种预设样式
- ✅ 自定义图标
- ✅ 动画效果
- ✅ 可关闭功能
- ✅ 主题适配

**使用示例**:
```markdown
<HighlightBox type="tip" icon="lightbulb" title="学习建议">
建议先掌握 JavaScript 基础语法，再学习 Vue.js 框架。
</HighlightBox>

<HighlightBox type="warning" icon="warning" title="注意事项">
在生产环境中避免直接修改 DOM，应使用虚拟 DOM。
</HighlightBox>

<HighlightBox type="success" icon="check" title="最佳实践">
使用 TypeScript 可以提高代码的可维护性和健壮性。
</HighlightBox>
```

### 8. TipOfTheDay - 每日提示组件

**功能**: 随机展示学习技巧和面试要点

**特性**:
- ✅ 随机内容生成
- ✅ 分类筛选
- ✅ 收藏功能
- ✅ 社交分享
- ✅ 定时刷新

**使用示例**:
```markdown
<TipOfTheDay category="javascript" />
```

## 🔧 组件集成配置

### 全局注册组件

在 `docs/.vitepress/theme/index.ts` 中注册所有组件：

```typescript
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

// 导入自定义组件
import InterviewCard from '../components/InterviewCard.vue'
import TechStack from '../components/TechStack.vue'
import CodeComparison from '../components/CodeComparison.vue'
import StudyProgress from '../components/StudyProgress.vue'
import QuickReference from '../components/QuickReference.vue'
import Timeline from '../components/Timeline.vue'
import HighlightBox from '../components/HighlightBox.vue'
import TipOfTheDay from '../components/TipOfTheDay.vue'

export default {
  extends: DefaultTheme,

  enhanceApp({ app }) {
    // 注册全局组件
    app.component('InterviewCard', InterviewCard)
    app.component('TechStack', TechStack)
    app.component('CodeComparison', CodeComparison)
    app.component('StudyProgress', StudyProgress)
    app.component('QuickReference', QuickReference)
    app.component('Timeline', Timeline)
    app.component('HighlightBox', HighlightBox)
    app.component('TipOfTheDay', TipOfTheDay)
  }
} satisfies Theme
```

### 样式主题适配

创建 `docs/.vitepress/theme/components.css`：

```css
/* 组件统一样式变量 */
:root {
  --component-border: var(--vp-c-border);
  --component-bg: var(--vp-c-bg-soft);
  --component-text: var(--vp-c-text-1);
  --component-accent: var(--vp-c-brand-1);
  --component-success: var(--vp-c-success-1);
  --component-warning: var(--vp-c-warning-1);
  --component-danger: var(--vp-c-danger-1);
}

/* 响应式断点 */
@media (max-width: 768px) {
  .component-responsive {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}

/* 组件通用动画 */
.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.3s ease;
}

.component-fade-enter-from,
.component-fade-leave-to {
  opacity: 0;
}

/* 组件通用阴影 */
.component-card {
  box-shadow: var(--vp-shadow-2);
  border-radius: 8px;
  border: 1px solid var(--component-border);
  background: var(--component-bg);
}

.component-card:hover {
  box-shadow: var(--vp-shadow-3);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
```

## 💡 高级功能扩展

### 1. 状态管理

使用 Pinia 进行组件间状态管理：

```typescript
// stores/study.ts
import { defineStore } from 'pinia'

export const useStudyStore = defineStore('study', {
  state: () => ({
    progress: {},
    favorites: [],
    settings: {
      theme: 'auto',
      difficulty: 'all'
    }
  }),

  actions: {
    updateProgress(chapter: string, progress: number) {
      this.progress[chapter] = progress
    },

    toggleFavorite(questionId: string) {
      const index = this.favorites.indexOf(questionId)
      if (index > -1) {
        this.favorites.splice(index, 1)
      } else {
        this.favorites.push(questionId)
      }
    }
  },

  persist: true // 持久化存储
})
```

### 2. 数据持久化

实现本地存储和云同步：

```typescript
// utils/storage.ts
export class StudyDataManager {
  private static readonly STORAGE_KEY = 'tech-docs-study-data'

  static saveProgress(data: StudyProgress) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
  }

  static loadProgress(): StudyProgress | null {
    const data = localStorage.getItem(this.STORAGE_KEY)
    return data ? JSON.parse(data) : null
  }

  static async syncToCloud(data: StudyProgress) {
    // 集成 Firebase 或其他云存储
    // await firebase.firestore().collection('progress').doc(userId).set(data)
  }
}
```

### 3. 国际化支持

添加多语言支持：

```typescript
// i18n/index.ts
export const messages = {
  'zh-CN': {
    interview: {
      difficulty: {
        easy: '简单',
        medium: '中等',
        hard: '困难'
      },
      actions: {
        expand: '展开答案',
        collapse: '收起答案',
        favorite: '收藏',
        share: '分享'
      }
    }
  },
  'en-US': {
    interview: {
      difficulty: {
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard'
      },
      actions: {
        expand: 'Show Answer',
        collapse: 'Hide Answer',
        favorite: 'Favorite',
        share: 'Share'
      }
    }
  }
}
```

## 🎨 主题定制

### 深色模式适配

确保所有组件支持深色模式：

```css
.dark {
  --component-bg: var(--vp-c-bg-soft);
  --component-border: var(--vp-c-border);
  --component-text: var(--vp-c-text-1);
}

@media (prefers-color-scheme: dark) {
  .component-auto-theme {
    /* 自动适配系统主题 */
  }
}
```

### 自定义主题色

支持用户自定义主题色：

```typescript
// composables/useTheme.ts
export function useCustomTheme() {
  const primaryColor = ref('#3eaf7c')

  const updateThemeColor = (color: string) => {
    primaryColor.value = color
    document.documentElement.style.setProperty('--vp-c-brand-1', color)
  }

  return {
    primaryColor,
    updateThemeColor
  }
}
```

## 📱 移动端优化

### 响应式设计原则

```css
/* 移动端优先设计 */
.interview-card {
  /* 基础移动端样式 */
}

@media (min-width: 768px) {
  .interview-card {
    /* 平板端样式 */
  }
}

@media (min-width: 1024px) {
  .interview-card {
    /* 桌面端样式 */
  }
}
```

### 触摸手势支持

```typescript
// composables/useTouch.ts
export function useTouchGestures() {
  const onSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    // 处理滑动手势
  }

  const onPinch = (scale: number) => {
    // 处理缩放手势
  }

  return { onSwipe, onPinch }
}
```

## 🚀 性能优化

### 组件懒加载

```typescript
// 动态导入组件
const InterviewCard = defineAsyncComponent(() =>
  import('../components/InterviewCard.vue')
)
```

### 虚拟列表

对于大量数据的组件，使用虚拟滚动：

```vue
<!-- 使用 vue-virtual-scroller -->
<VirtualList
  :items="interviewQuestions"
  :item-height="100"
  height="500px"
  v-slot="{ item, index }"
>
  <InterviewCard :question="item" :key="index" />
</VirtualList>
```

## 📊 使用统计

### 组件使用分析

```typescript
// utils/analytics.ts
export function trackComponentUsage(componentName: string, action: string) {
  // 集成 Google Analytics 或其他分析工具
  gtag('event', action, {
    event_category: 'Component Usage',
    event_label: componentName
  })
}
```

### 用户行为跟踪

```typescript
// 跟踪用户学习行为
export function trackStudyBehavior(event: StudyEvent) {
  const data = {
    timestamp: Date.now(),
    event: event.type,
    duration: event.duration,
    chapter: event.chapter
  }

  // 发送到分析服务
  analytics.track('study_session', data)
}
```

---

**通过添加这些自定义组件，技术面试知识库将具备更强的交互性和学习辅助功能，为用户提供更优质的学习体验。**