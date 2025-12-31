# 面试学习计划

> 系统化的面试准备指南，按天数和优先级安排学习内容

## 10 天冲刺计划

### 第 1-3 天：基础巩固

#### Day 1: JavaScript/Java 核心概念

**JavaScript 重点：**
```
上午（3小时）：
□ 数据类型与类型转换
  - 基本类型 vs 引用类型
  - typeof vs instanceof
  - 隐式类型转换规则

□ 作用域与闭包
  - var/let/const 区别
  - 作用域链
  - 闭包原理与应用

下午（3小时）：
□ 原型与继承
  - 原型链
  - 继承方式（ES5/ES6）
  - new 操作符原理

□ 异步编程
  - Promise 原理
  - async/await
  - 事件循环（Event Loop）

晚上（2小时）：
□ 复习 + 做题
  - 手写 Promise
  - 手写 new
  - 手写 bind/call/apply
```

**Java 重点：**
```
上午（3小时）：
□ 基础语法
  - 数据类型
  - 面向对象三大特性
  - 接口 vs 抽象类

□ 集合框架
  - List/Set/Map 区别
  - ArrayList vs LinkedList
  - HashMap 原理

下午（3小时）：
□ JVM 基础
  - 内存区域
  - 垃圾回收算法
  - 类加载机制

□ 多线程基础
  - 线程创建方式
  - synchronized 原理
  - volatile 关键字

晚上（2小时）：
□ 复习 + 做题
```

---

#### Day 2: 数据结构与算法基础

```
上午（3小时）：
□ 数组与字符串
  - 双指针技巧
  - 滑动窗口
  - 前缀和

□ 链表
  - 反转链表
  - 环检测
  - 合并链表

下午（3小时）：
□ 栈与队列
  - 有效括号
  - 单调栈
  - 最小栈

□ 哈希表
  - 两数之和
  - 字母异位词
  - LRU 缓存

晚上（2小时）：
□ LeetCode 刷题
  - 数组类 3 题
  - 链表类 3 题
  - 栈/队列类 2 题
```

**必刷题目清单：**
| 类型 | 题目 | 难度 |
|------|------|------|
| 数组 | 两数之和 | Easy |
| 数组 | 三数之和 | Medium |
| 数组 | 合并两个有序数组 | Easy |
| 链表 | 反转链表 | Easy |
| 链表 | 环形链表 II | Medium |
| 链表 | 合并两个有序链表 | Easy |
| 栈 | 有效的括号 | Easy |
| 栈 | 最小栈 | Medium |

---

#### Day 3: 计算机网络基础

```
上午（3小时）：
□ HTTP/HTTPS
  - HTTP 方法与状态码
  - HTTP 1.1/2/3 区别
  - HTTPS 握手过程
  - 缓存机制

□ TCP/UDP
  - 三次握手/四次挥手
  - TCP vs UDP
  - 拥塞控制

下午（3小时）：
□ 网络安全
  - 跨域与 CORS
  - XSS/CSRF 防御
  - HTTPS 证书验证

□ DNS 与 CDN
  - DNS 解析过程
  - CDN 原理

晚上（2小时）：
□ 复习网络协议
□ 整理常见面试题
```

---

### 第 4-6 天：框架深入

#### Day 4: Vue/React 框架原理

**Vue 重点：**
```
上午（3小时）：
□ 响应式原理
  - Vue 2 Object.defineProperty
  - Vue 3 Proxy
  - 依赖收集与派发更新

□ 虚拟 DOM
  - VNode 结构
  - diff 算法
  - key 的作用

下午（3小时）：
□ 组件通信
  - props/$emit
  - provide/inject
  - EventBus
  - Vuex/Pinia

□ 生命周期
  - 各阶段执行时机
  - 父子组件执行顺序
  - 异步组件
```

**React 重点：**
```
上午（3小时）：
□ 核心概念
  - JSX 原理
  - 虚拟 DOM
  - Fiber 架构

□ Hooks
  - useState/useEffect
  - useCallback/useMemo
  - 自定义 Hook

下午（3小时）：
□ 状态管理
  - Redux 原理
  - Context API
  - React Query

□ 性能优化
  - React.memo
  - 懒加载
  - 代码分割
```

---

#### Day 5: 数据库索引和事务

```
上午（3小时）：
□ MySQL 索引
  - B+ 树原理
  - 聚簇索引 vs 非聚簇索引
  - 索引失效场景
  - 覆盖索引

□ 索引优化
  - EXPLAIN 分析
  - 慢查询优化
  - 索引设计原则

下午（3小时）：
□ 事务
  - ACID 特性
  - 隔离级别
  - MVCC 原理
  - 锁机制

□ Redis
  - 数据类型与应用
  - 持久化（RDB/AOF）
  - 缓存穿透/击穿/雪崩

晚上（2小时）：
□ SQL 练习
□ 复习事务隔离级别
```

---

#### Day 6: 常见设计模式

```
上午（3小时）：
□ 创建型模式
  - 单例模式
  - 工厂模式
  - 建造者模式

□ 结构型模式
  - 代理模式
  - 装饰器模式
  - 适配器模式

下午（3小时）：
□ 行为型模式
  - 观察者模式
  - 策略模式
  - 模板方法模式

□ 前端设计模式
  - 发布订阅
  - 模块模式
  - MVC/MVVM

晚上（2小时）：
□ 代码实现练习
□ 结合框架理解
```

---

### 第 7-9 天：项目梳理

#### Day 7: 项目介绍准备

**STAR 法则模板：**
```
S（Situation）- 背景
  - 项目是什么？
  - 团队规模？
  - 你的角色？

T（Task）- 任务
  - 负责哪些模块？
  - 面临什么挑战？

A（Action）- 行动
  - 采用什么技术方案？
  - 如何解决问题？
  - 做了哪些优化？

R（Result）- 结果
  - 量化成果（性能提升 XX%）
  - 业务价值
  - 个人收获
```

**项目介绍示例：**
```markdown
## 电商平台重构项目

【背景】
公司主营电商业务，原有系统使用 jQuery + PHP，
随着业务增长，遇到性能和维护问题。

【任务】
作为前端负责人，主导 Vue 3 + TypeScript 重构，
负责首页、商品详情、购物车核心模块。

【行动】
1. 技术选型：Vue 3 + Vite + Pinia + Element Plus
2. 架构设计：微前端方案，主应用 + 多个子应用
3. 性能优化：
   - 虚拟列表处理万级商品列表
   - 图片懒加载 + WebP 格式
   - 路由懒加载 + 代码分割
4. 工程化：
   - ESLint + Prettier 代码规范
   - Husky + lint-staged 提交检查
   - Jest + Cypress 测试覆盖

【结果】
- 首屏加载时间从 4s 降至 1.2s（提升 70%）
- 代码可维护性大幅提升
- 开发效率提升 40%
```

---

#### Day 8: 技术难点复盘

**难点整理模板：**
```
┌─────────────────────────────────────────────────────────────┐
│                    技术难点模板                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  问题描述：                                                  │
│  [具体遇到什么问题，现象是什么]                             │
│                                                              │
│  分析过程：                                                  │
│  1. [排查步骤 1]                                            │
│  2. [排查步骤 2]                                            │
│  3. [定位到原因]                                            │
│                                                              │
│  解决方案：                                                  │
│  [采用什么方案解决]                                         │
│                                                              │
│  技术要点：                                                  │
│  - [涉及的技术知识点]                                       │
│  - [学到了什么]                                             │
│                                                              │
│  效果验证：                                                  │
│  [解决后的效果，最好有数据]                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**常见技术难点类型：**
```
1. 性能优化类
   - 首屏加载优化
   - 长列表渲染
   - 内存泄漏处理

2. 架构设计类
   - 状态管理方案
   - 组件设计
   - 权限系统设计

3. 问题排查类
   - 线上 Bug 定位
   - 兼容性问题
   - 第三方库问题

4. 工程化类
   - 构建优化
   - 自动化部署
   - 代码规范落地
```

---

#### Day 9: 技术亮点讲解准备

**亮点讲解要点：**
```
1. 为什么做（Why）
   - 业务背景
   - 痛点分析

2. 怎么做（How）
   - 技术方案
   - 实现细节
   - 踩过的坑

3. 做得怎样（Result）
   - 效果数据
   - 对比分析
```

**推荐准备的技术亮点：**
```
前端方向：
□ 组件库/工具库封装
□ 性能监控平台
□ 微前端架构
□ 自动化测试体系
□ 低代码平台
□ 可视化大屏

后端方向：
□ 分布式系统设计
□ 高并发处理
□ 缓存架构
□ 消息队列应用
□ 数据库优化
□ 微服务拆分
```

---

### 第 10 天：模拟面试

#### 自我介绍（2 分钟）

**模板：**
```
您好，我是 XXX，[X] 年工作经验。

【技术栈】
主要技术栈是 [Vue/React] + [Node.js/Java]，
熟悉 [TypeScript/MySQL/Redis] 等技术。

【工作经历】
之前在 [公司名]，主要负责 [业务方向]，
参与/主导了 [核心项目] 的开发。

【核心成果】
在 [某项目] 中，通过 [技术方案]，
实现了 [量化成果]。

【求职意向】
目前希望在 [方向] 有更深入的发展，
贵司的 [业务/技术] 方向与我的发展规划很匹配。

以上就是我的简单介绍，谢谢。
```

---

#### 手写代码练习清单

```javascript
// 必会手写题

// 1. 防抖
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 2. 节流
function throttle(fn, delay) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

// 3. 深拷贝
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (map.has(obj)) return map.get(obj);

  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], map);
    }
  }
  return clone;
}

// 4. 数组扁平化
function flatten(arr, depth = 1) {
  return depth > 0
    ? arr.reduce((acc, val) =>
        acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])
    : arr.slice();
}

// 5. Promise.all
Promise.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let count = 0;

    promises.forEach((p, i) => {
      Promise.resolve(p).then(res => {
        results[i] = res;
        if (++count === promises.length) {
          resolve(results);
        }
      }).catch(reject);
    });
  });
};

// 6. 发布订阅
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, ...args) {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(cb => cb.apply(this, args));
    }
  }

  off(event, callback) {
    const callbacks = this.events[event];
    if (callbacks) {
      this.events[event] = callbacks.filter(cb => cb !== callback);
    }
  }
}
```

---

#### 系统设计题练习

**常见系统设计题：**
```
1. 设计短链系统
2. 设计秒杀系统
3. 设计消息推送系统
4. 设计 Feed 流系统
5. 设计分布式缓存
6. 设计 IM 即时通讯
```

**回答框架：**
```
1. 需求澄清（5 分钟）
   - 核心功能
   - 用户规模
   - 性能要求

2. 高层设计（10 分钟）
   - 画架构图
   - 核心组件
   - 数据流向

3. 详细设计（15 分钟）
   - 数据模型
   - API 设计
   - 关键算法

4. 扩展讨论（5 分钟）
   - 扩展性
   - 容错性
   - 监控告警
```

---

## 学习资源推荐

### 书籍
| 方向 | 书籍 | 优先级 |
|------|------|--------|
| JavaScript | 《JavaScript 高级程序设计》 | ★★★★★ |
| 算法 | 《剑指 Offer》 | ★★★★★ |
| 计算机网络 | 《图解 HTTP》 | ★★★★☆ |
| 设计模式 | 《JavaScript 设计模式与开发实践》 | ★★★★☆ |
| 数据库 | 《高性能 MySQL》 | ★★★★☆ |

### 在线资源
- LeetCode（算法练习）
- 掘金/思否（技术文章）
- GitHub（源码学习）
- B 站（视频教程）

### 刷题建议
```
1. 按类型刷题，不要随机刷
2. 每道题至少做两遍
3. 总结解题模板
4. 控制每题时间（Easy 10 分钟，Medium 20 分钟）
5. 不会的看题解后自己重新实现
```

---

## 面试复盘模板

```markdown
## 面试复盘 - [公司名] [岗位]

**日期：** YYYY-MM-DD
**面试轮次：** 一面/二面/HR面

### 面试官问题

1. [问题 1]
   - 我的回答：...
   - 标准答案：...
   - 评价：✓/✗

2. [问题 2]
   - 我的回答：...
   - 标准答案：...
   - 评价：✓/✗

### 不会的问题
- [ ] [问题]：[需要学习的知识点]

### 回答不好的问题
- [ ] [问题]：[如何改进]

### 总结
- 表现好的地方：...
- 需要改进的地方：...
- 下一步学习计划：...
```
