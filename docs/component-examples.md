# 自定义组件使用示例

本页面展示如何在文档中使用我们创建的自定义 Vue 组件。

## 🎯 InterviewCard 组件

面试题卡片组件，适用于展示面试问题和答案：

<InterviewCard
  question="什么是 Vue.js 的响应式原理？"
  difficulty="medium"
  :tags="['Vue.js', '响应式', '源码分析']"
  id="vue-reactivity"
>

Vue.js 的响应式原理主要基于以下几个核心概念：

**1. 数据劫持（Data Hijacking）**
- Vue 2.x 使用 `Object.defineProperty()` 来劫持对象属性的 getter 和 setter
- Vue 3.x 使用 ES6 的 `Proxy` API 来实现数据代理

**2. 观察者模式（Observer Pattern）**
- **Observer**: 负责监听数据变化，收集依赖
- **Dep**: 依赖收集器，管理 Watcher 实例
- **Watcher**: 观察者，当数据变化时执行回调

**3. 虚拟 DOM 和 Diff 算法**
```javascript
// Vue 3 响应式核心代码示例
import { reactive, effect } from 'vue'

const state = reactive({
  count: 0
})

effect(() => {
  console.log(state.count) // 收集依赖
})

state.count++ // 触发更新
```

**关键优势**：
- 自动追踪依赖关系
- 细粒度更新，只更新变化的部分
- 支持嵌套对象和数组的深度监听

</InterviewCard>

<InterviewCard
  question="如何理解 JavaScript 中的闭包？"
  difficulty="hard"
  :tags="['JavaScript', '作用域', '闭包']"
  id="javascript-closure"
>

**闭包（Closure）** 是 JavaScript 中的一个重要概念：

**定义**：闭包是指有权访问另一个函数作用域中变量的函数。

**形成条件**：
1. 函数嵌套
2. 内部函数引用外部函数的变量
3. 外部函数被调用

**经典示例**：
```javascript
function outerFunction(x) {
  // 外部函数的变量
  let outerVariable = x;

  // 内部函数
  function innerFunction(y) {
    console.log(outerVariable + y); // 访问外部变量
  }

  return innerFunction; // 返回内部函数
}

const closure = outerFunction(10);
closure(5); // 输出: 15
```

**实际应用场景**：
- 模块化开发
- 数据私有化
- 函数柯里化
- 事件处理和异步编程

</InterviewCard>

## 💡 HighlightBox 组件

高亮提示框，用于强调重要内容：

<HighlightBox type="tip" title="学习建议">
建议按照以下顺序学习前端技术栈：

1. **HTML/CSS 基础** - 网页结构和样式
2. **JavaScript 核心** - 语言基础和 ES6+
3. **框架选择** - Vue.js 或 React
4. **工程化工具** - Webpack/Vite、ESLint、Prettier
5. **状态管理** - Vuex/Pinia 或 Redux
6. **TypeScript** - 类型安全
</HighlightBox>

<HighlightBox type="warning" title="常见面试陷阱">
⚠️ 在回答算法题时，要注意以下几点：

- 不要急于写代码，先分析问题
- 考虑边界条件和异常情况
- 分析时间复杂度和空间复杂度
- 提供多种解决方案并比较优劣
</HighlightBox>

<HighlightBox type="success" title="面试成功秘诀">
✅ 技术面试的成功要素：

- **扎实的基础知识**：计算机基础、语言特性
- **项目实战经验**：能够清晰描述项目难点和亮点
- **学习能力**：展示持续学习和技术追求
- **沟通表达**：逻辑清晰，重点突出
</HighlightBox>

<HighlightBox type="danger" title="面试禁忌">
❌ 面试中应避免的行为：

- 不要说"不知道"就结束，尝试分析和推理
- 不要贬低之前的公司或同事
- 不要夸大项目贡献或技术能力
- 不要在面试中表现出不耐烦或傲慢
</HighlightBox>

<HighlightBox type="info" title="技术栈选择建议">
🤔 选择技术栈时的考虑因素：

**公司规模**：
- 大公司：稳定的技术栈，如 React/Vue + TypeScript
- 创业公司：快速开发，可能使用 Next.js/Nuxt.js

**项目类型**：
- 管理后台：Element Plus/Ant Design
- 移动端：Uniapp/React Native
- 官网展示：Gatsby/VitePress

**团队情况**：
- 新手较多：Vue.js（学习曲线平缓）
- 资深团队：React（生态丰富，灵活性高）
</HighlightBox>

## 🛠️ TechStack 组件

技术栈展示组件，可视化展示技术水平：

<TechStack
  title="我的技术栈"
  description="以下是我目前掌握的主要技术，以及对应的熟练程度"
  :items="[
    {
      name: 'Vue.js',
      level: 85,
      category: 'frontend',
      description: '现代前端框架',
      summary: '熟练掌握 Vue 3 Composition API，有大型项目开发经验',
      tags: ['SPA', '组件化', '响应式'],
      docs: 'https://vuejs.org/',
      playground: 'https://sfc.vuejs.org/'
    },
    {
      name: 'React',
      level: 75,
      category: 'frontend',
      description: '流行的前端框架',
      summary: '掌握 React Hooks 和现代开发模式，有中型项目经验',
      tags: ['JSX', 'Virtual DOM', 'Hooks'],
      docs: 'https://react.dev/',
      playground: 'https://codesandbox.io/'
    },
    {
      name: 'TypeScript',
      level: 80,
      category: 'language',
      description: 'JavaScript 超集',
      summary: '熟练使用类型系统，能够设计复杂的类型定义',
      tags: ['类型安全', '开发效率', 'IntelliSense'],
      docs: 'https://www.typescriptlang.org/'
    },
    {
      name: 'Node.js',
      level: 70,
      category: 'backend',
      description: '服务端 JavaScript',
      summary: '掌握 Express/Koa 开发，熟悉 RESTful API 设计',
      tags: ['服务端', 'API', '异步编程'],
      docs: 'https://nodejs.org/'
    },
    {
      name: 'MySQL',
      level: 75,
      category: 'database',
      description: '关系型数据库',
      summary: '熟练编写 SQL，理解索引优化和事务处理',
      tags: ['SQL', '索引', '事务'],
      docs: 'https://dev.mysql.com/doc/'
    },
    {
      name: 'Redis',
      level: 65,
      category: 'database',
      description: '内存数据库',
      summary: '掌握基本缓存策略，了解集群配置',
      tags: ['缓存', 'NoSQL', '高性能'],
      docs: 'https://redis.io/documentation'
    },
    {
      name: 'Docker',
      level: 60,
      category: 'devops',
      description: '容器化技术',
      summary: '能够编写 Dockerfile，掌握基本的容器管理',
      tags: ['容器', '微服务', 'DevOps'],
      docs: 'https://docs.docker.com/'
    },
    {
      name: 'Webpack',
      level: 70,
      category: 'tool',
      description: '模块打包器',
      summary: '熟练配置构建流程，理解模块化和优化策略',
      tags: ['打包', '优化', '模块化'],
      docs: 'https://webpack.js.org/'
    }
  ]"
/>

## 📚 组件功能说明

### InterviewCard 特性
- ✅ 可展开/折叠答案内容
- ✅ 难度等级可视化（简单/中等/困难）
- ✅ 技术标签分类
- ✅ 收藏功能（本地存储）
- ✅ 复制链接分享
- ✅ 响应式设计

### HighlightBox 特性
- ✅ 多种预设类型：`tip`, `warning`, `success`, `danger`, `info`, `note`
- ✅ 自定义标题和图标
- ✅ 可关闭功能（支持本地存储记忆）
- ✅ 主题色自动适配
- ✅ 深色模式支持

### TechStack 特性
- ✅ 技术熟练度可视化进度条
- ✅ 分类筛选功能
- ✅ 技术图标展示
- ✅ 悬停详细信息
- ✅ 快速链接到文档和练习平台
- ✅ 响应式网格布局

## 🎨 自定义样式

所有组件都支持 CSS 变量自定义：

```css
:root {
  --component-border: var(--vp-c-border);
  --component-bg: var(--vp-c-bg-soft);
  --component-text: var(--vp-c-text-1);
  --component-accent: var(--vp-c-brand-1);
}
```

## 🔄 数据持久化

组件支持本地存储功能：
- 面试题收藏状态
- 提示框关闭记录
- 学习进度追踪（即将推出）

## 📱 移动端适配

所有组件都经过移动端优化：
- 响应式布局
- 触摸友好的交互
- 合适的字体大小
- 简化的操作界面

---

**这些组件大大增强了文档的交互性和学习效果，让技术面试准备更加高效有趣！**