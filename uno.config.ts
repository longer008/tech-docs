import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
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
  ],
})
