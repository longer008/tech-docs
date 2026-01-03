import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import mediumZoom from 'medium-zoom'
import vitepressBackToTop from 'vitepress-plugin-back-to-top'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'

// 自定义组件导入
import InterviewCard from '../components/InterviewCard.vue'
import HighlightBox from '../components/HighlightBox.vue'
import TechStack from '../components/TechStack.vue'

// 样式导入
import 'vitepress-plugin-back-to-top/dist/style.css'
import 'virtual:uno.css'
import './custom.css'

export default {
  extends: DefaultTheme,

  enhanceApp({ app }) {
    // 注册 Tabs 插件
    enhanceAppWithTabs(app)

    // 注册返回顶部插件
    vitepressBackToTop({
      threshold: 300
    })

    // 注册自定义组件
    app.component('InterviewCard', InterviewCard)
    app.component('HighlightBox', HighlightBox)
    app.component('TechStack', TechStack)
  },

  setup() {
    const route = useRoute()

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
