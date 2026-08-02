import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h, onMounted, watch, nextTick, defineAsyncComponent } from 'vue'
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

// 运行时类型声明：__PODCAST_ENABLED__ 由 config.mts 的 vite.define 注入（编译期常量）
declare const __PODCAST_ENABLED__: boolean

// 播客/TTS 组件：仅在 Cloudflare 部署（__PODCAST_ENABLED__）时加载。
// 通过编译期常量做条件导入，GitHub 构建时此分支为死代码，PodcastPlayer 不会进入产物。
// 使用 defineAsyncComponent 而非静态 import，确保为 false 时组件代码被 tree-shake。
const PodcastPlayer = __PODCAST_ENABLED__
  ? defineAsyncComponent(() => import('../components/PodcastPlayer.vue'))
  : () => null

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
      'doc-before': () => [h(ReadingTime), __PODCAST_ENABLED__ ? h(PodcastPlayer) : null],
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
    if (__PODCAST_ENABLED__) {
      app.component('PodcastPlayer', PodcastPlayer)
    }
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

      // 播客功能专属：全局检查 admin token（确保任何页面都能保存）
      if (__PODCAST_ENABLED__ && typeof localStorage !== 'undefined' && typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        const token = url.searchParams.get('admin')
        if (token && token.length === 32) {
          localStorage.setItem('podcast_admin_token', token)
          url.searchParams.delete('admin')
          window.history.replaceState({}, '', url.toString())
        }
      }
    })

    // 路由变化时重新初始化
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    )
  }
} satisfies Theme
