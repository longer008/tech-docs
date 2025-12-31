import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import { katex } from '@mdit/plugin-katex'
import footnote from 'markdown-it-footnote'
import mark from 'markdown-it-mark'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import taskLists from 'markdown-it-task-lists'
import UnoCSS from 'unocss/vite'

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
    title: '技术面试知识库',
    description: '全栈开发技术面试准备与实战文档',
    lang: 'zh-CN',

    // 部署配置
    base: '/',
    cleanUrls: true,
    lastUpdated: true,

    // Head 配置
    head: [
      ['meta', { name: 'theme-color', content: '#3eaf7c' }],
      ['meta', { name: 'og:type', content: 'website' }],
      ['meta', { name: 'og:locale', content: 'zh-CN' }],
      // KaTeX 样式
      ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css' }],
      // 不蒜子统计
      ['script', { async: '', src: '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js' }],
    ],

    // Vite 配置
    vite: {
      plugins: [
        UnoCSS(),
      ],
    },

    // Markdown 配置
    markdown: {
      lineNumbers: true,
      // 自定义容器标签（中文）
      container: {
        tipLabel: '提示',
        warningLabel: '警告',
        dangerLabel: '危险',
        infoLabel: '信息',
        detailsLabel: '详细信息'
      },
      // TOC 配置
      toc: { level: [1, 2, 3] },
      // Markdown-it 插件配置
      config: (md) => {
        md.use(tabsMarkdownPlugin)
        md.use(katex)
        md.use(footnote)
        md.use(mark)
        md.use(sub)
        md.use(sup)
        md.use(taskLists)
      },
    },

    // Mermaid 配置
    mermaid: {
      theme: 'default',
    },
    mermaidPlugin: {
      class: 'mermaid',
    },

    // 主题配置
    themeConfig: {
      // 站点标题和 Logo
      siteTitle: '技术面试知识库',

      // 导航栏
      nav: [
        { text: '首页', link: '/' },
        { text: '快速开始', link: '/quick-start/interview-prep-checklist' },
        { text: '10天冲刺', link: '/sprint-plan/day01-js-java-core' },
        {
          text: '前端',
          items: [
            { text: '基础', link: '/frontend/fundamentals/javascript-core-interview' },
            { text: 'Vue', link: '/frontend/vue/vue3-interview' },
            { text: 'React', link: '/frontend/react/react-hooks-interview' },
            { text: 'TypeScript', link: '/frontend/typescript/' },
            { text: '跨端', link: '/frontend/cross-platform/uniapp-interview' },
          ]
        },
        {
          text: '后端',
          items: [
            { text: 'Java', link: '/backend/java/java-core-interview' },
            { text: 'Node.js', link: '/backend/nodejs/nodejs-runtime-interview' },
            { text: 'Python', link: '/backend/python/python-core-interview' },
            { text: 'Spring', link: '/backend/spring-boot/' },
          ]
        },
        {
          text: '数据库',
          items: [
            { text: 'MySQL', link: '/database/mysql/mysql-index-interview' },
            { text: 'Redis', link: '/database/redis/redis-interview' },
            { text: 'MongoDB', link: '/database/mongodb/mongodb-interview' },
            { text: '消息队列', link: '/database/mq/kafka-interview' },
          ]
        },
        { text: 'DevOps', link: '/devops/git-workflow' },
        { text: '架构图', link: '/diagrams/' },
        { text: '插件文档', link: '/vitepress-plugins' },
      ],

      // 多侧边栏配置
      sidebar: {
        // 快速开始
        '/quick-start/': [
          {
            text: '快速开始',
            items: [
              { text: '面试准备清单', link: '/quick-start/interview-prep-checklist' },
              { text: '面试学习计划', link: '/quick-start/interview-study-plan' },
              { text: '技术栈路线图', link: '/quick-start/tech-stack-roadmap' },
            ]
          }
        ],

        // 10天冲刺计划
        '/sprint-plan/': [
          {
            text: '10天冲刺计划',
            items: [
              { text: 'Day 1: JS/Java 核心', link: '/sprint-plan/day01-js-java-core' },
              { text: 'Day 2: 数据结构与算法', link: '/sprint-plan/day02-data-structures-algorithms' },
              { text: 'Day 3: 计算机网络', link: '/sprint-plan/day03-network-basics' },
              { text: 'Day 4: Vue/React 原理', link: '/sprint-plan/day04-vue-react-principles' },
              { text: 'Day 5: 数据库与 Redis', link: '/sprint-plan/day05-database-redis' },
              { text: 'Day 6: 设计模式', link: '/sprint-plan/day06-design-patterns' },
              { text: 'Day 7: 项目介绍', link: '/sprint-plan/day07-project-introduction' },
              { text: 'Day 8: 技术难点', link: '/sprint-plan/day08-technical-difficulties' },
              { text: 'Day 9: 技术亮点', link: '/sprint-plan/day09-technical-highlights' },
              { text: 'Day 10: 模拟面试', link: '/sprint-plan/day10-mock-interview' },
            ]
          }
        ],

        // 前端
        '/frontend/': [
          {
            text: '前端基础',
            collapsed: false,
            items: [
              { text: '前端100道问答', link: '/frontend/前端100道问答' },
              { text: 'HTML5', link: '/frontend/fundamentals/html5-interview' },
              { text: 'CSS 核心', link: '/frontend/fundamentals/css-core-interview' },
              { text: 'JavaScript 核心', link: '/frontend/fundamentals/javascript-core-interview' },
              { text: 'TypeScript', link: '/frontend/fundamentals/typescript-interview' },
              { text: 'SCSS/Less', link: '/frontend/fundamentals/scss-less-interview' },
              { text: '浏览器原理', link: '/frontend/fundamentals/browser-interview' },
              { text: '性能优化', link: '/frontend/fundamentals/performance-interview' },
              { text: '前端安全', link: '/frontend/fundamentals/security-interview' },
              { text: '构建工具', link: '/frontend/fundamentals/webpack-vite-interview' },
              { text: 'CSS/Tailwind', link: '/frontend/fundamentals/css-tailwind-interview' },
            ]
          },
          {
            text: 'Vue.js',
            collapsed: true,
            items: [
              { text: 'Vue2 面试题', link: '/frontend/vue/vue2-interview' },
              { text: 'Vue3 面试题', link: '/frontend/vue/vue3-interview' },
              { text: 'Vue3 vs Vue2', link: '/frontend/vue/vue3-vs-vue2' },
              { text: 'Vue 速查表', link: '/frontend/vue/vue-cheatsheet' },
              { text: 'Vue 题库', link: '/frontend/vue/interview-bank' },
            ]
          },
          {
            text: 'React',
            collapsed: true,
            items: [
              { text: 'React Hooks', link: '/frontend/react/react-hooks-interview' },
              { text: 'Next.js', link: '/frontend/react/nextjs-interview' },
              { text: 'React 速查表', link: '/frontend/react/react-cheatsheet' },
              { text: 'React 题库', link: '/frontend/react/interview-bank' },
            ]
          },
          {
            text: 'TypeScript',
            collapsed: true,
            items: [
              { text: '概述', link: '/frontend/typescript/' },
              { text: '题库', link: '/frontend/typescript/interview-bank' },
            ]
          },
          {
            text: 'CSS/Tailwind',
            collapsed: true,
            items: [
              { text: '概述', link: '/frontend/css-tailwind/' },
              { text: '题库', link: '/frontend/css-tailwind/interview-bank' },
            ]
          },
          {
            text: '构建工具',
            collapsed: true,
            items: [
              { text: '概述', link: '/frontend/webpack-vite/' },
              { text: '题库', link: '/frontend/webpack-vite/interview-bank' },
            ]
          },
          {
            text: '跨端开发',
            collapsed: true,
            items: [
              { text: 'Uniapp', link: '/frontend/cross-platform/uniapp-interview' },
              { text: '小程序', link: '/frontend/cross-platform/miniprogram-interview' },
              { text: 'Uniapp 题库', link: '/frontend/uniapp/interview-bank' },
              { text: '微信小程序 题库', link: '/frontend/wechat-mini-program/interview-bank' },
            ]
          },
        ],

        // 后端
        '/backend/': [
          {
            text: 'Java 生态',
            collapsed: false,
            items: [
              { text: 'Java 核心', link: '/backend/java/java-core-interview' },
              { text: 'JUC 并发', link: '/backend/java/juc-interview' },
              { text: 'Spring Boot', link: '/backend/java/spring-boot-interview' },
              { text: 'Spring Cloud', link: '/backend/java/spring-cloud-interview' },
              { text: 'MyBatis', link: '/backend/java/mybatis-interview' },
              { text: 'Java 速查表', link: '/backend/java/java-cheatsheet' },
              { text: 'Java 题库', link: '/backend/java/interview-bank' },
            ]
          },
          {
            text: 'Node.js 生态',
            collapsed: true,
            items: [
              { text: 'Node.js 运行时', link: '/backend/nodejs/nodejs-runtime-interview' },
              { text: 'Express/Koa', link: '/backend/nodejs/express-koa-interview' },
              { text: 'NestJS', link: '/backend/nodejs/nestjs-interview' },
              { text: 'Node.js 速查表', link: '/backend/nodejs/nodejs-cheatsheet' },
              { text: 'Node.js 题库', link: '/backend/nodejs/interview-bank' },
            ]
          },
          {
            text: 'Python 生态',
            collapsed: true,
            items: [
              { text: 'Python 核心', link: '/backend/python/python-core-interview' },
              { text: 'Django', link: '/backend/python/django-interview' },
              { text: 'FastAPI', link: '/backend/python/fastapi-interview' },
              { text: 'Python 速查表', link: '/backend/python/python-cheatsheet' },
              { text: 'Python 题库', link: '/backend/python/interview-bank' },
            ]
          },
          {
            text: 'Spring 生态',
            collapsed: true,
            items: [
              { text: 'Spring Boot', link: '/backend/spring-boot/' },
              { text: 'Spring Boot 题库', link: '/backend/spring-boot/interview-bank' },
              { text: 'Spring Cloud', link: '/backend/spring-cloud/' },
              { text: 'Spring Cloud 题库', link: '/backend/spring-cloud/interview-bank' },
            ]
          },
          {
            text: '其他框架',
            collapsed: true,
            items: [
              { text: 'Express', link: '/backend/express/' },
              { text: 'Koa', link: '/backend/koa/' },
              { text: 'NestJS', link: '/backend/nestjs/' },
              { text: 'Django', link: '/backend/django/' },
              { text: 'FastAPI', link: '/backend/fastapi/' },
              { text: 'MyBatis', link: '/backend/mybatis/' },
            ]
          },
        ],

        // 数据库
        '/database/': [
          {
            text: 'MySQL',
            collapsed: false,
            items: [
              { text: '索引', link: '/database/mysql/mysql-index-interview' },
              { text: '事务', link: '/database/mysql/mysql-transaction-interview' },
              { text: '优化', link: '/database/mysql/mysql-optimization' },
              { text: '速查表', link: '/database/mysql/mysql-cheatsheet' },
              { text: '题库', link: '/database/mysql/interview-bank' },
            ]
          },
          {
            text: 'Redis',
            collapsed: true,
            items: [
              { text: '面试题', link: '/database/redis/redis-interview' },
              { text: '集群', link: '/database/redis/redis-cluster' },
              { text: '速查表', link: '/database/redis/redis-cheatsheet' },
              { text: '题库', link: '/database/redis/interview-bank' },
            ]
          },
          {
            text: 'MongoDB',
            collapsed: true,
            items: [
              { text: '面试题', link: '/database/mongodb/mongodb-interview' },
              { text: '题库', link: '/database/mongodb/interview-bank' },
            ]
          },
          {
            text: '消息队列',
            collapsed: true,
            items: [
              { text: 'Kafka', link: '/database/mq/kafka-interview' },
              { text: 'RabbitMQ', link: '/database/mq/rabbitmq-interview' },
              { text: 'Kafka 题库', link: '/database/kafka/interview-bank' },
              { text: 'RabbitMQ 题库', link: '/database/rabbitmq/interview-bank' },
            ]
          },
        ],

        // DevOps
        '/devops/': [
          {
            text: 'DevOps',
            items: [
              { text: 'Git 工作流', link: '/devops/git-workflow' },
              { text: 'Linux 命令', link: '/devops/linux-commands' },
              { text: 'Nginx', link: '/devops/nginx-interview' },
              { text: 'Docker/K8s', link: '/devops/docker-k8s-interview' },
              { text: 'HTTP/HTTPS', link: '/devops/http-https-interview' },
              { text: '计算机网络', link: '/devops/network-interview' },
            ]
          },
          {
            text: 'Git',
            collapsed: true,
            items: [
              { text: '概述', link: '/devops/git/' },
              { text: '题库', link: '/devops/git/interview-bank' },
            ]
          },
          {
            text: 'Docker',
            collapsed: true,
            items: [
              { text: '概述', link: '/devops/docker/' },
              { text: '题库', link: '/devops/docker/interview-bank' },
            ]
          },
          {
            text: 'Kubernetes',
            collapsed: true,
            items: [
              { text: '概述', link: '/devops/kubernetes/' },
              { text: '题库', link: '/devops/kubernetes/interview-bank' },
            ]
          },
          {
            text: 'HTTP/HTTPS',
            collapsed: true,
            items: [
              { text: '概述', link: '/devops/http-https/' },
              { text: '题库', link: '/devops/http-https/interview-bank' },
            ]
          },
        ],

        // 附录
        '/appendix/': [
          {
            text: '附录',
            items: [
              { text: '算法模式', link: '/appendix/algorithm-patterns' },
              { text: '数据结构', link: '/appendix/data-structures' },
              { text: '设计模式', link: '/appendix/design-patterns' },
              { text: '系统设计模板', link: '/appendix/system-design-templates' },
              { text: '常见陷阱', link: '/appendix/common-pitfalls' },
            ]
          }
        ],

        // 架构图
        '/diagrams/': [
          {
            text: '架构图',
            items: [
              { text: '概述', link: '/diagrams/' },
            ]
          }
        ],
      },

      // 社交链接
      socialLinks: [
        { icon: 'github', link: 'https://github.com/yourusername/tech-docs' }
      ],

      // 页脚
      footer: {
        message: '基于 VitePress 构建',
        copyright: 'Copyright 2025 技术面试知识库'
      },

      // 本地搜索
      search: {
        provider: 'local',
        options: {
          translations: {
            button: {
              buttonText: '搜索文档',
              buttonAriaLabel: '搜索文档'
            },
            modal: {
              noResultsText: '无法找到相关结果',
              resetButtonTitle: '清除查询条件',
              footer: {
                selectText: '选择',
                navigateText: '切换'
              }
            }
          }
        }
      },

      // 大纲配置
      outline: {
        level: [2, 3],
        label: '页面导航'
      },

      // 文档页脚
      docFooter: {
        prev: '上一页',
        next: '下一页'
      },

      // 最后更新时间
      lastUpdated: {
        text: '最后更新于',
        formatOptions: {
          dateStyle: 'short',
          timeStyle: 'short'
        }
      },

      // 编辑链接
      editLink: {
        pattern: 'https://github.com/yourusername/tech-docs/edit/main/docs/:path',
        text: '在 GitHub 上编辑此页'
      },

      // 返回顶部
      returnToTopLabel: '返回顶部',

      // 侧边栏菜单标签
      sidebarMenuLabel: '菜单',

      // 深色模式切换标签
      darkModeSwitchLabel: '主题',
      lightModeSwitchTitle: '切换到浅色模式',
      darkModeSwitchTitle: '切换到深色模式',
    }
  })
)
