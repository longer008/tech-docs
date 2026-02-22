import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h, onMounted, watch, nextTick } from 'vue'
import { useRoute, useData } from 'vitepress'
import mediumZoom from 'medium-zoom'
import vitepressBackToTop from 'vitepress-plugin-back-to-top'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import 'vitepress-plugin-nprogress/lib/css/index.css'

// nolebase 增强阅读
import {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
  InjectionKey as EnhancedReadabilitiesInjectionKey,
} from '@nolebase/vitepress-plugin-enhanced-readabilities/client'
import '@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css'

// nolebase 标题高亮
import {
  NolebaseHighlightTargetedHeading,
} from '@nolebase/vitepress-plugin-highlight-targeted-heading/client'
import '@nolebase/vitepress-plugin-highlight-targeted-heading/client/style.css'

// 代码块折叠
import codeblocksFold from 'vitepress-plugin-codeblocks-fold'
import 'vitepress-plugin-codeblocks-fold/style/index.css'

// 自定义组件导入
import InterviewCard from '../components/InterviewCard.vue'
import HighlightBox from '../components/HighlightBox.vue'
import TechStack from '../components/TechStack.vue'
import ReadingTime from '../components/ReadingTime.vue'

// 样式导入
import 'vitepress-plugin-back-to-top/dist/style.css'
import 'virtual:uno.css'
import './custom.css'

export default {
  extends: DefaultTheme,

  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(NolebaseHighlightTargetedHeading),
      'nav-bar-content-after': () => h(NolebaseEnhancedReadabilitiesMenu),
      'nav-screen-content-after': () => h(NolebaseEnhancedReadabilitiesScreenMenu),
      'doc-before': () => h(ReadingTime),
    })
  },

  enhanceApp({ app }) {
    // 注册 Tabs 插件
    enhanceAppWithTabs(app)

    // 注册返回顶部插件
    vitepressBackToTop({
      threshold: 300
    })

    // NProgress 进度条（通过 Vite 插件自动处理，无需手动初始化）

    // nolebase 增强阅读中文本地化
    app.provide(EnhancedReadabilitiesInjectionKey, {
      locales: {
        'zh-CN': {
          title: { title: '阅读增强' },
        },
      },
    })

    // 注册自定义组件
    app.component('InterviewCard', InterviewCard)
    app.component('HighlightBox', HighlightBox)
    app.component('TechStack', TechStack)
    app.component('ReadingTime', ReadingTime)
  },

  setup() {
    const route = useRoute()
    const { frontmatter } = useData()

    // 代码块折叠
    codeblocksFold({ route, frontmatter }, true, 400)

    // 初始化图片缩放
    const initZoom = () => {
      mediumZoom('.main img', {
        background: 'var(--vp-c-bg)',
        margin: 24
      })
    }

    onMounted(() => {
      initZoom()
    })

    // 路由变化时重新初始化
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    )
  }
} satisfies Theme
