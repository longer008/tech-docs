import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: false,  // 关闭图标警告，避免误报文档内容中的数字/符号
      collections: {
        // 只加载实际用到的图标集
        'carbon': () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        'icon-park-outline': () => import('@iconify-json/icon-park-outline/icons.json').then(i => i.default),
        'octicon': () => import('@iconify-json/octicon/icons.json').then(i => i.default),
      },
    }),
  ],
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'text-primary': 'text-[var(--vp-c-brand-1)]',
    'bg-primary': 'bg-[var(--vp-c-brand-1)]',
    'border-primary': 'border-[var(--vp-c-brand-1)]',
  },
  theme: {
    colors: {
      primary: 'var(--vp-c-brand-1)',
      secondary: 'var(--vp-c-brand-2)',
    },
  },
  safelist: [
    'i-carbon-logo-github',
    'i-carbon-document',
    'i-carbon-code',
    // nolebase 插件内部使用的图标
    'i-icon-park-outline-book-open',
    'i-icon-park-outline-guide-board',
  ],
})
