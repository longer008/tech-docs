# Tailwind CSS 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:Tailwind 的核心理念？
- 标准答案:Utility-first，通过原子类快速组合样式；减少自定义 CSS，避免命名冲突；搭配设计令牌(theme)保持一致性。
- 追问点:与 BEM/CSS Modules 的区别；可维护性争议；何时不适合。
- 参考:https://tailwindcss.com/docs

### Q2:JIT 模式的作用？
- 标准答案:即时编译按需生成类，构建速度更快、支持任意值语法 `[width:72px]`；默认从 v3 启用，无需手工 purge。
- 追问点:任意值的安全风险；启用条件；与旧版 purge 的区别。
- 参考:https://tailwindcss.com/docs/just-in-time-mode

### Q3:主题定制与设计令牌？
- 标准答案:在 `tailwind.config.js` 的 theme.extend 中定义颜色、间距、字体；可用 CSS 变量结合；通过 `@apply` 封装组件化样式。
- 追问点:暗色模式配置 `darkMode: 'class'|'media'`；多品牌主题切换；全局 vs 局部配置。
- 参考:https://tailwindcss.com/docs/theme

### Q4:响应式与变体用法？
- 标准答案:使用断点前缀 `sm:` `md:` 等控制不同屏幕；状态变体如 `hover:` `focus:` `disabled:`；组合顺序从小到大。
- 追问点:自定义断点；优先级与覆盖；ARIA 变体。
- 参考:https://tailwindcss.com/docs/responsive-design

### Q5:Purge/内容扫描机制？
- 标准答案:通过 `content` 配置扫描模板生成类，JIT 自动按需；若遗漏路径会导致样式丢失；动态类需使用 safelist。
- 追问点:正则匹配技巧；组件库的路径；生产构建体积优化。
- 参考:https://tailwindcss.com/docs/content-configuration

### Q6:与组件化的结合？
- 标准答案:可配合 React/Vue/JSX 直接写类；用 `clsx`/`cva`/`tailwind-variants` 管理组合；`@apply` 封装重复样式但避免过度。
- 追问点:条件类名；避免 className 过长；可访问性。
- 参考:https://tailwindcss.com/docs/reusing-styles

### Q7:生产性能与体积控制？
- 标准答案:JIT + content 精准扫描；减少自定义色板；开启 `preflight` 可选；压缩 CSS；使用基于 CDN 的按需方案(仅开发)。
- 追问点:SSR/CSR 差异；大项目类名重复率；原子化对渲染性能的影响。
- 参考:https://tailwindcss.com/docs/optimizing-for-production

### Q8:常见坑？
- 标准答案:忘记在 content 中配置 monorepo 子包；使用动态拼接类名未 safelist；`@apply` 在媒体查询内需谨慎；表单样式需配合 `@tailwindcss/forms`。
- 追问点:与 UI 库冲突；CSS 变量作用域；dark mode 触发条件。
- 参考:https://tailwindcss.com/docs/installation

## 场景/排查
### Q1:生产构建后样式缺失？
- 标准答案:检查 content 路径是否包含所有模板；动态类加 safelist；确认构建工具缓存；使用 `npx tailwindcss -i input.css -o out.css --watch` 验证。
- 追问点:与组件库 className 的集成；JIT 缓存；CI 构建环境差异。
- 参考:https://tailwindcss.com/docs/content-configuration

### Q2:类名过长影响可读性怎么办？
- 标准答案:通过抽象组件/`cva`/`tw-merge` 管理组合；对重复片段使用 `@apply`；保持语义分组顺序；利用格式化工具分行。
- 追问点:设计规范约束；Storybook 演示；lint 规则。
- 参考:https://github.com/dcastil/tailwind-merge

## 反问
### Q1:团队是否有设计令牌/主题文件？Tailwind 的使用边界？
- 标准答案:确认配色、间距、字号是否已标准化；哪些场景仍需 CSS/SCSS。
- 追问点:组件库一致性；暗色模式策略；定制流程。
- 参考:团队内部规范

### Q2:构建工具链（Vite/Next/webpack）中 Tailwind 配置是否统一？
- 标准答案:避免多项目配置漂移，确保 content 路径与 PostCSS 插件一致。
- 追问点:CI 缓存；lint/格式化；升级节奏。
- 参考:团队内部规范
