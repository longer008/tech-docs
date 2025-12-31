# Day 7: 项目介绍准备

> 第七天重点：学会用 STAR 法则介绍项目，准备项目相关问题

## 今日目标

- [ ] 掌握 STAR 法则介绍项目
- [ ] 准备 2-3 个核心项目的介绍
- [ ] 熟悉项目相关常见问题
- [ ] 准备项目中的技术选型理由

---

## Part A: STAR 法则

### 1. 什么是 STAR 法则？

```
┌─────────────────────────────────────────────────────────────┐
│                    STAR 法则                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  S - Situation（情境）                                      │
│  项目背景是什么？解决什么业务问题？                          │
│  - 公司/团队背景                                            │
│  - 业务场景和痛点                                           │
│  - 项目规模和重要性                                         │
│                                                              │
│  T - Task（任务）                                           │
│  你的具体职责是什么？负责哪些模块？                          │
│  - 个人角色和职责                                           │
│  - 负责的核心功能                                           │
│  - 与团队的协作方式                                         │
│                                                              │
│  A - Action（行动）                                         │
│  你采取了哪些技术方案？如何实现的？                          │
│  - 技术选型和原因                                           │
│  - 核心实现思路                                             │
│  - 遇到的问题和解决方案                                     │
│                                                              │
│  R - Result（结果）                                         │
│  项目成果如何？有哪些量化指标？                              │
│  - 性能提升数据                                             │
│  - 业务指标改善                                             │
│  - 获得的认可或奖励                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. 项目介绍模板

#### 模板一：完整版（3-5分钟）

```
【项目背景】
我参与的是 XXX 项目，这是一个面向 XXX 用户的 XXX 系统。
当时公司面临的问题是 XXX，需要解决 XXX 的痛点。

【我的职责】
我在团队中担任 XXX 角色，主要负责：
1. XXX 模块的设计和开发
2. XXX 功能的技术选型
3. XXX 方面的性能优化

【技术方案】
在技术选型上，我们选择了 XXX，主要考虑到：
1. XXX 优势
2. XXX 适用场景

核心实现上，我采用了 XXX 方案：
- XXX 解决了 XXX 问题
- XXX 提升了 XXX 性能

【项目成果】
最终项目取得了不错的成果：
- 性能方面：XXX 提升了 XX%
- 业务方面：XXX 增长了 XX%
- 团队方面：XXX
```

#### 模板二：简洁版（1-2分钟）

```
这是一个 XXX 类型的项目，主要解决 XXX 问题。
我负责 XXX 模块，使用 XXX 技术栈。
核心亮点是 XXX，最终实现了 XXX 的效果。
```

---

## Part B: 项目介绍示例

### 示例一：电商后台管理系统

```
【项目背景】
这是一个为中小型电商提供的 SaaS 后台管理系统，支持商品管理、
订单处理、数据分析等功能。当时公司原有系统是 jQuery + PHP
技术栈，存在以下问题：
- 页面加载慢，用户体验差
- 代码维护困难，迭代效率低
- 移动端适配不足

【我的职责】
我作为前端负责人，主要负责：
1. 整体前端架构设计和技术选型
2. 核心业务模块开发（商品管理、订单中心）
3. 通用组件库的封装
4. 前端工程化建设

【技术方案】
技术栈选择：Vue3 + TypeScript + Element Plus + Vite

核心技术亮点：
1. 权限系统设计
   - 基于 RBAC 模型实现菜单和按钮级权限控制
   - 动态路由生成，支持权限热更新

2. 大数据表格优化
   - 使用虚拟滚动处理万级数据渲染
   - 实现表格列的拖拽排序和自定义配置

3. 状态管理
   - Pinia 分模块管理状态
   - 实现状态持久化和跨标签页同步

【项目成果】
- 首屏加载时间从 5s 降低到 1.5s（提升 70%）
- 开发效率提升 40%，迭代周期缩短
- 系统稳定运行，支撑日均 10w+ 订单处理
```

---

### 示例二：移动端 H5 商城

```
【项目背景】
这是一个面向 C 端用户的移动端商城，包含商品浏览、购物车、
下单支付、订单管理等核心功能。项目需要同时支持微信小程序
和 H5 页面，要求性能优秀、用户体验流畅。

【我的职责】
作为核心开发，我负责：
1. 商品详情页和购物车模块
2. 首页性能优化
3. 通用业务组件封装

【技术方案】
技术栈：uni-app + Vue3 + Pinia

核心技术亮点：
1. 首页性能优化
   - 骨架屏 + 图片懒加载
   - 接口预加载和数据缓存
   - 长列表虚拟滚动

2. 购物车实现
   - 本地存储 + 服务端同步的双重保障
   - 库存校验和价格变动实时提示
   - SKU 选择器组件封装

3. 跨端适配
   - 条件编译处理平台差异
   - 统一的 API 封装层

【项目成果】
- 首页加载时间从 3s 优化到 1s
- 购物车操作流畅度提升，转化率提高 15%
- 组件复用率达 60%，开发效率显著提升
```

---

### 示例三：数据可视化大屏

```
【项目背景】
这是一个面向企业管理层的数据可视化大屏项目，用于实时展示
公司核心业务指标，包括销售数据、用户数据、运营数据等。
需要支持多种屏幕尺寸和实时数据更新。

【我的职责】
作为前端开发，我负责：
1. 整体大屏布局和适配方案
2. 图表组件封装和数据对接
3. 实时数据推送实现

【技术方案】
技术栈：Vue3 + ECharts + WebSocket

核心技术亮点：
1. 屏幕适配方案
   - 使用 scale 缩放 + rem 布局结合
   - 支持 1920x1080 到 4K 多种分辨率

2. 图表性能优化
   - 数据量大时使用 dataZoom 和 sampling
   - 图表实例复用，避免重复创建
   - 离屏渲染和增量更新

3. 实时数据
   - WebSocket 长连接保持
   - 断线重连和心跳检测
   - 数据缓冲和节流处理

【项目成果】
- 大屏流畅运行 24 小时无卡顿
- 数据延迟从 5s 降低到 500ms
- 复用于多个客户项目，节省开发成本
```

---

### 示例四：Node.js 中间层/BFF

```
【项目背景】
随着前端业务复杂度增加，前端需要调用多个后端微服务接口，
存在以下问题：
- 接口聚合困难，页面请求过多
- 数据格式不统一，前端处理逻辑复杂
- 缺乏统一的鉴权和日志

因此我们搭建了 Node.js BFF 层来解决这些问题。

【我的职责】
作为 BFF 层的主要开发者，我负责：
1. BFF 架构设计和技术选型
2. 核心中间件开发
3. 接口聚合层实现

【技术方案】
技术栈：Nest.js + TypeScript + Redis

核心技术亮点：
1. 接口聚合
   - 并行请求多个后端服务
   - 数据裁剪和格式统一
   - GraphQL 按需查询

2. 缓存策略
   - Redis 缓存热点数据
   - 多级缓存（内存 + Redis）
   - 缓存穿透和雪崩防护

3. 中间件设计
   - 统一鉴权和权限校验
   - 请求日志和链路追踪
   - 限流和熔断保护

【项目成果】
- 前端请求数减少 60%
- 首页接口响应时间从 800ms 降到 200ms
- 统一了错误处理和日志规范
```

---

## Part C: 常见项目问题

### 1. 项目背景类

#### Q1: 简单介绍一下你的项目？

**回答要点：**
- 项目类型和业务背景
- 技术栈概述
- 你的角色和职责
- 核心成果

---

#### Q2: 为什么选择这个技术栈？

**回答模板：**
```
选择 XXX 技术栈主要基于以下考虑：

1. 业务需求匹配
   - 项目需要 XXX 特性，XXX 框架很好地支持了这一点

2. 团队技术储备
   - 团队对 XXX 比较熟悉，可以快速上手

3. 生态和社区
   - XXX 生态完善，遇到问题容易找到解决方案

4. 性能考量
   - 经过调研和 POC，XXX 在我们的场景下性能表现更好

当然也有一些取舍，比如 XXX，但综合考虑还是 XXX 更适合。
```

---

#### Q3: 项目中遇到的最大挑战是什么？

**回答要点：**
- 描述具体的技术挑战
- 分析问题的原因
- 尝试过的方案
- 最终的解决方案
- 学到的经验

**示例：**
```
最大的挑战是大数据量表格的性能问题。

【问题描述】
订单管理页面需要展示数万条数据，初始方案导致：
- 页面渲染卡顿，FPS 降到 10 以下
- 内存占用过高，浏览器崩溃

【解决过程】
1. 首先分析了性能瓶颈，发现主要是 DOM 节点过多
2. 尝试了分页方案，但业务方需要看到全部数据
3. 研究了虚拟滚动技术，但表格有合并单元格需求

【最终方案】
采用定制化虚拟滚动 + 懒加载：
- 只渲染可视区域的 DOM 节点
- 滚动时动态计算并复用 DOM
- 合并单元格通过计算逻辑特殊处理

【成果】
- 10 万条数据流畅滚动，FPS 稳定在 60
- 内存占用从 800MB 降到 100MB
```

---

### 2. 技术细节类

#### Q4: 你项目中的权限系统是怎么设计的？

**答案：**
```
我们采用的是 RBAC（基于角色的访问控制）模型：

【数据模型】
用户 → 角色 → 权限
- 用户可以拥有多个角色
- 角色包含多个权限
- 权限分为菜单权限和按钮权限

【前端实现】
1. 登录后获取用户权限列表
2. 根据权限动态生成路由
3. 通过自定义指令控制按钮显示

// 动态路由生成
function generateRoutes(menus, permissions) {
  return menus.filter(menu => {
    if (permissions.includes(menu.permission)) {
      if (menu.children) {
        menu.children = generateRoutes(menu.children, permissions);
      }
      return true;
    }
    return false;
  });
}

// 权限指令
app.directive('permission', {
  mounted(el, binding) {
    const permission = binding.value;
    if (!hasPermission(permission)) {
      el.parentNode?.removeChild(el);
    }
  }
});

【安全考虑】
- 前端只做展示控制，后端必须做权限校验
- 敏感操作需要二次确认
- 记录操作日志便于审计
```

---

#### Q5: 项目中如何处理接口请求的？

**答案：**
```javascript
// 基于 axios 的请求封装

import axios from 'axios';
import { message } from 'ant-design-vue';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { code, data, message: msg } = response.data;

    if (code === 0) {
      return data;
    }

    // 业务错误
    message.error(msg || '请求失败');
    return Promise.reject(new Error(msg));
  },
  error => {
    // HTTP 错误
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 401:
          // token 过期，跳转登录
          router.push('/login');
          break;
        case 403:
          message.error('没有权限');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error('网络错误');
      }
    }
    return Promise.reject(error);
  }
);

// 取消重复请求
const pendingRequests = new Map();

function addPendingRequest(config) {
  const key = `${config.method}:${config.url}`;
  if (pendingRequests.has(key)) {
    config.cancelToken = new axios.CancelToken(cancel => cancel('重复请求'));
  } else {
    config.cancelToken = new axios.CancelToken(cancel => {
      pendingRequests.set(key, cancel);
    });
  }
}

function removePendingRequest(config) {
  const key = `${config.method}:${config.url}`;
  pendingRequests.delete(key);
}
```

---

#### Q6: 项目中如何做状态管理的？

**答案：**
```javascript
// Pinia 状态管理示例

// stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: localStorage.getItem('token') || '',
    permissions: [],
  }),

  getters: {
    isLogin: state => !!state.token,
    userName: state => state.userInfo?.name || '游客',
  },

  actions: {
    async login(credentials) {
      try {
        const { token, user } = await loginApi(credentials);
        this.token = token;
        this.userInfo = user;
        localStorage.setItem('token', token);
        return true;
      } catch (error) {
        return false;
      }
    },

    async fetchPermissions() {
      const permissions = await getPermissionsApi();
      this.permissions = permissions;
      return permissions;
    },

    logout() {
      this.token = '';
      this.userInfo = null;
      this.permissions = [];
      localStorage.removeItem('token');
    },
  },

  // 持久化
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token'],
  },
});

// 使用
const userStore = useUserStore();
await userStore.login({ username, password });
```

---

### 3. 性能优化类

#### Q7: 你在项目中做过哪些性能优化？

**答案：**
```
从以下几个维度进行优化：

【加载性能】
1. 路由懒加载
   const Home = () => import('./views/Home.vue');

2. 图片优化
   - 使用 WebP 格式
   - 图片懒加载
   - CDN 加速

3. 代码分割
   - 按路由分割
   - 按组件分割（大型第三方库）

4. 预加载
   - prefetch 预加载下一页资源
   - preload 预加载关键资源

【渲染性能】
1. 虚拟滚动处理长列表
2. 使用 v-show 替代频繁切换的 v-if
3. 合理使用 computed 和 watch
4. 避免不必要的响应式数据

【打包优化】
1. Tree Shaking 去除无用代码
2. 压缩代码和资源
3. 分析打包体积，优化依赖

【具体数据】
- 首屏加载时间从 5s 降到 1.5s
- Lighthouse 性能评分从 60 提升到 90
- 打包体积减少 40%
```

---

#### Q8: 首屏加载慢如何排查和优化？

**答案：**
```
【排查步骤】
1. Chrome DevTools Performance 分析
   - 查看 FCP、LCP、TTI 等指标
   - 分析主线程任务耗时

2. Network 面板分析
   - 查看资源加载时间和大小
   - 分析阻塞渲染的资源

3. Lighthouse 报告
   - 获取具体优化建议
   - 定位性能瓶颈

4. webpack-bundle-analyzer 分析打包
   - 查看各模块体积
   - 发现冗余依赖

【常见问题和解决】
1. JS 体积过大
   → 代码分割、Tree Shaking、压缩

2. 图片资源大
   → 压缩、懒加载、WebP 格式

3. 第三方库大
   → 按需引入、CDN 外置

4. API 请求慢
   → 接口聚合、预加载、缓存

5. CSS 阻塞渲染
   → Critical CSS、异步加载非关键 CSS
```

---

## Part D: 项目亮点提炼

### 如何提炼技术亮点？

```
┌─────────────────────────────────────────────────────────────┐
│                    技术亮点提炼方法                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 解决了什么问题？                                        │
│     - 性能问题：优化前后的对比数据                          │
│     - 体验问题：用户反馈或业务指标改善                      │
│     - 效率问题：开发效率或维护成本降低                      │
│                                                              │
│  2. 用了什么技术方案？                                      │
│     - 技术选型的考量过程                                    │
│     - 核心实现原理                                          │
│     - 与其他方案的对比                                      │
│                                                              │
│  3. 有什么创新点？                                          │
│     - 是否有自己的思考和改进                                │
│     - 是否形成了可复用的方案                                │
│     - 是否沉淀了文档或组件                                  │
│                                                              │
│  4. 量化的结果                                              │
│     - 性能指标：加载时间、FPS、内存占用                     │
│     - 业务指标：转化率、用户留存                            │
│     - 效率指标：开发周期、bug 数量                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 亮点描述模板

```
【亮点名称】XXX 优化/实现

【背景问题】
在 XXX 场景下，存在 XXX 问题，具体表现为：
- 问题1：XXX
- 问题2：XXX

【解决方案】
采用 XXX 技术/方案，核心思路是：
1. XXX
2. XXX

【实现细节】
（关键代码或架构图）

【最终效果】
- 指标1：从 XXX 提升到 XXX（提升 XX%）
- 指标2：XXX
```

---

## Part E: 自我介绍模板

### 技术面试自我介绍（1-2分钟）

```
面试官好，我是 XXX，X 年前端开发经验。

【技术栈】
主要技术栈是 Vue 全家桶，也熟悉 React。
对前端工程化、性能优化有一定研究。

【项目经验】
最近的项目是 XXX，这是一个 XXX 系统。
我负责 XXX 模块，主要亮点是 XXX，
实现了 XXX 的效果。

【求职意向】
目前在看 XXX 方向的机会，
希望能加入一个技术氛围好的团队，
在 XXX 方面有更多成长。

以上是我的简单介绍，请面试官指教。
```

---

## 复习检查清单

- [ ] 能用 STAR 法则流畅介绍 2-3 个项目
- [ ] 准备好每个项目的技术亮点
- [ ] 能解释清楚技术选型的原因
- [ ] 准备好项目中的难点和解决方案
- [ ] 能说出具体的量化数据
- [ ] 准备好自我介绍

---

## 实战练习

### 练习1：准备你的项目介绍
按照 STAR 法则，写下你最有把握的项目介绍。

### 练习2：模拟问答
让朋友或同事问你项目相关问题，练习临场回答。

### 练习3：录音复盘
录下自己的项目介绍，听一遍，找出可以改进的地方。

---

> 明日预告：Day 8 - 技术难点复盘
