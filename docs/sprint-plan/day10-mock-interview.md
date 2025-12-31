# Day 10: 模拟面试

> 第十天重点：完整模拟面试流程，查漏补缺

## 今日目标

- [ ] 完成一次完整的模拟面试
- [ ] 复习前 9 天的核心内容
- [ ] 准备好面试当天的事项
- [ ] 调整心态，保持自信

---

## Part A: 面试流程概览

### 1. 技术面试一般流程

```
┌─────────────────────────────────────────────────────────────┐
│                    技术面试流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  第一轮（45-60分钟）：基础技术面                            │
│  ├── 自我介绍（2-3分钟）                                    │
│  ├── 项目介绍（10-15分钟）                                  │
│  ├── 技术基础问题（20-30分钟）                              │
│  │   - JavaScript/框架原理                                  │
│  │   - 计算机网络                                           │
│  │   - 数据结构算法                                         │
│  └── 算法题（15-20分钟）                                    │
│                                                              │
│  第二轮（45-60分钟）：深度技术面                            │
│  ├── 项目深挖（20-30分钟）                                  │
│  │   - 技术难点                                             │
│  │   - 设计决策                                             │
│  │   - 优化方案                                             │
│  ├── 系统设计（15-20分钟）                                  │
│  └── 算法题（15-20分钟）                                    │
│                                                              │
│  第三轮（30-45分钟）：综合面/HR面                           │
│  ├── 职业规划                                               │
│  ├── 团队协作                                               │
│  ├── 学习能力                                               │
│  └── 薪资期望                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Part B: 模拟面试题库

### 1. 开场题

#### Q1: 请做一个自我介绍

**参考回答：**
```
面试官好，我是 XXX，X 年前端开发经验。

【技术背景】
主要技术栈是 Vue 全家桶，也熟悉 React。
对前端工程化、性能优化有一定研究。

【项目经验】
最近在 XXX 公司做 XXX 项目，
我负责 XXX 模块的开发，
主要亮点是实现了 XXX，性能提升了 XX%。

【求职意向】
目前在看新的机会，希望能加入技术氛围好的团队，
在 XXX 方向有更多成长。

以上是我的简单介绍。
```

---

### 2. JavaScript 基础

#### Q2: 说说 var、let、const 的区别

**参考回答：**
```javascript
// 1. 作用域
var a = 1;   // 函数作用域
let b = 2;   // 块级作用域
const c = 3; // 块级作用域

// 2. 变量提升
console.log(a);  // undefined（变量提升）
console.log(b);  // ReferenceError（暂时性死区）
var a = 1;
let b = 2;

// 3. 重复声明
var a = 1;
var a = 2;  // 允许

let b = 1;
let b = 2;  // SyntaxError

// 4. 修改
const c = 1;
c = 2;  // TypeError

const obj = { name: 'test' };
obj.name = 'new';  // 允许（修改属性）
obj = {};  // TypeError（修改引用）
```

---

#### Q3: 说说闭包的理解和应用场景

**参考回答：**
```javascript
// 闭包：函数能够访问其词法作用域外的变量

// 应用1：数据私有化
function createCounter() {
  let count = 0;  // 私有变量
  return {
    increment() { count++; },
    getCount() { return count; }
  };
}

// 应用2：函数柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...moreArgs) => curried.apply(this, args.concat(moreArgs));
  };
}

// 应用3：防抖节流
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 注意：闭包会导致变量无法被垃圾回收，可能造成内存泄漏
```

---

#### Q4: 说说 this 的指向规则

**参考回答：**
```javascript
// 1. 默认绑定：独立调用，指向全局/undefined(严格模式)
function foo() { console.log(this); }
foo();  // window / undefined

// 2. 隐式绑定：对象调用，指向调用对象
const obj = {
  name: 'obj',
  foo() { console.log(this.name); }
};
obj.foo();  // 'obj'

// 3. 显式绑定：call/apply/bind
foo.call({ name: 'explicit' });  // { name: 'explicit' }

// 4. new 绑定：指向新创建的对象
function Person(name) { this.name = name; }
const p = new Person('Alice');  // { name: 'Alice' }

// 5. 箭头函数：继承外层 this
const obj = {
  foo: () => { console.log(this); }  // window
};

// 优先级：new > 显式 > 隐式 > 默认
```

---

#### Q5: 说说 Promise 和 async/await

**参考回答：**
```javascript
// Promise 三种状态：pending、fulfilled、rejected
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve('done'), 1000);
});

promise
  .then(result => console.log(result))
  .catch(err => console.error(err))
  .finally(() => console.log('completed'));

// async/await 是 Promise 的语法糖
async function fetchData() {
  try {
    const result = await promise;
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

// 并行执行
const [result1, result2] = await Promise.all([
  fetch('/api/1'),
  fetch('/api/2')
]);

// 竞速
const fastest = await Promise.race([
  fetch('/api/1'),
  fetch('/api/2')
]);
```

---

### 3. Vue/React 框架

#### Q6: Vue2 和 Vue3 响应式原理的区别

**参考回答：**
```javascript
// Vue2：Object.defineProperty
Object.defineProperty(obj, 'key', {
  get() { /* 依赖收集 */ },
  set(val) { /* 派发更新 */ }
});

// 缺点：
// 1. 无法检测属性的添加删除
// 2. 无法检测数组索引修改
// 3. 需要递归遍历对象

// Vue3：Proxy
const proxy = new Proxy(target, {
  get(target, key, receiver) {
    track(target, key);  // 依赖收集
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver);
    trigger(target, key);  // 派发更新
    return result;
  }
});

// 优点：
// 1. 可以检测属性的添加删除
// 2. 可以检测数组变化
// 3. 惰性代理，性能更好
```

---

#### Q7: React Hooks 为什么不能在条件语句中使用

**参考回答：**
```javascript
// Hooks 使用链表存储状态，按调用顺序匹配

// 错误示例
function Component() {
  if (condition) {
    const [a, setA] = useState(0);  // Hook 1
  }
  const [b, setB] = useState(0);    // Hook 2

  // 第一次：condition=true
  // hooks = [0, 0]，Hook1->0, Hook2->1

  // 第二次：condition=false
  // hooks = [0, 0]，Hook2->0（期望是1）
  // 状态错乱！
}

// Hooks 规则：
// 1. 只在最顶层使用 Hooks
// 2. 只在 React 函数组件中使用
```

---

#### Q8: 说说虚拟 DOM 和 diff 算法

**参考回答：**
```javascript
// 虚拟 DOM：用 JS 对象描述真实 DOM
const vnode = {
  tag: 'div',
  props: { id: 'app' },
  children: [
    { tag: 'span', children: ['Hello'] }
  ]
};

// diff 算法核心策略：
// 1. 同级比较，不跨层级
// 2. 不同类型直接替换
// 3. 通过 key 标识节点

// Vue 双端比较
// oldStart vs newStart
// oldEnd vs newEnd
// oldStart vs newEnd
// oldEnd vs newStart
// 以上都不匹配，用 key 查找

// key 的作用：
// - 帮助 diff 算法识别节点
// - 实现节点复用，提高性能
// - 不要用 index 作为 key
```

---

### 4. 计算机网络

#### Q9: HTTP 缓存机制

**参考回答：**
```
强缓存（不发请求）：
- Expires：绝对时间，HTTP/1.0
- Cache-Control：相对时间，HTTP/1.1
  - max-age=3600：缓存3600秒
  - no-cache：跳过强缓存
  - no-store：不缓存

协商缓存（需要请求验证）：
- Last-Modified / If-Modified-Since：文件修改时间
- ETag / If-None-Match：文件内容哈希（更精确）

流程：
1. 检查强缓存 → 有效则使用
2. 强缓存失效 → 发协商缓存请求
3. 协商缓存有效 → 返回304
4. 协商缓存失效 → 返回200和新资源
```

---

#### Q10: TCP 三次握手和四次挥手

**参考回答：**
```
三次握手（建立连接）：
1. 客户端 → SYN → 服务端
2. 服务端 → SYN+ACK → 客户端
3. 客户端 → ACK → 服务端

为什么三次？
- 防止已失效的连接请求到达服务器建立无效连接

四次挥手（断开连接）：
1. 客户端 → FIN → 服务端（我不发了）
2. 服务端 → ACK → 客户端（知道了）
3. 服务端 → FIN → 客户端（我也不发了）
4. 客户端 → ACK → 服务端（知道了）

为什么四次？
- TCP 全双工，每个方向的关闭都是独立的

TIME_WAIT 作用：
- 确保最后的 ACK 能到达
- 让旧连接的数据包消失
```

---

#### Q11: HTTPS 工作原理

**参考回答：**
```
HTTPS = HTTP + TLS

TLS 握手过程：
1. ClientHello：支持的加密套件、随机数
2. ServerHello：选择的加密套件、随机数
3. Certificate：服务器证书（含公钥）
4. ClientKeyExchange：预主密钥（用公钥加密）
5. 双方生成会话密钥
6. 加密通信

安全性：
- 机密性：对称加密通信内容
- 完整性：MAC 防篡改
- 身份认证：证书验证

为什么用非对称+对称？
- 非对称加密安全但慢，用于交换密钥
- 对称加密快，用于数据传输
```

---

### 5. 算法题

#### Q12: 反转链表

```javascript
function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  return prev;
}

// 复杂度：O(n) 时间，O(1) 空间
```

---

#### Q13: 有效的括号

```javascript
function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };

  for (const char of s) {
    if (!pairs[char]) {
      stack.push(char);
    } else if (stack.pop() !== pairs[char]) {
      return false;
    }
  }

  return stack.length === 0;
}
```

---

#### Q14: 两数之和

```javascript
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }

  return [];
}

// 复杂度：O(n) 时间，O(n) 空间
```

---

### 6. 项目问题

#### Q15: 介绍一下你最有挑战的项目

**回答要点：**
```
使用 STAR 法则：

S（Situation）：项目背景
- 什么类型的项目
- 面临什么问题

T（Task）：你的职责
- 负责哪些模块
- 角色是什么

A（Action）：采取的行动
- 技术选型
- 核心实现
- 难点处理

R（Result）：取得的成果
- 量化数据
- 业务价值
```

---

#### Q16: 项目中遇到的最大挑战

**参考结构：**
```
1. 描述问题
   - 具体场景
   - 问题表现
   - 影响范围

2. 分析过程
   - 如何定位
   - 原因是什么

3. 解决方案
   - 尝试过的方案
   - 最终方案
   - 为什么选择这个方案

4. 结果验证
   - 优化效果
   - 数据对比

5. 经验总结
   - 学到了什么
   - 后续如何避免
```

---

### 7. 行为问题

#### Q17: 你的优点和缺点是什么

**参考回答：**
```
优点：
1. 技术热情
   - 喜欢研究新技术
   - 主动学习和分享

2. 问题解决能力
   - 遇到问题能深入分析
   - 有耐心排查和解决

3. 团队协作
   - 善于沟通
   - 乐于帮助同事

缺点（结合改进措施）：
1. 有时候过于追求完美
   - 可能在细节上花太多时间
   - 正在学习权衡优先级

2. 公开演讲有些紧张
   - 在团队内做过几次分享
   - 正在逐步克服
```

---

#### Q18: 为什么选择我们公司

**回答要点：**
```
1. 业务方向
   - 对公司的产品/业务感兴趣
   - 看好这个领域的发展

2. 技术氛围
   - 了解到公司的技术栈/实践
   - 希望在技术上有更多成长

3. 团队文化
   - 了解到的团队特点
   - 与自己的期望匹配

4. 个人发展
   - 这个岗位能发挥自己的优势
   - 能学到想学的东西
```

---

#### Q19: 你有什么想问我的

**推荐问题：**
```
1. 关于团队
   - 团队的组织结构是怎样的？
   - 团队的技术栈是什么？

2. 关于工作
   - 这个岗位主要负责什么业务？
   - 有什么技术挑战？

3. 关于成长
   - 团队的技术分享氛围如何？
   - 有什么晋升通道？

4. 关于项目
   - 目前有什么有意思的项目？
   - 未来有什么技术规划？
```

---

## Part C: 面试技巧

### 1. 回答问题的方法

```
┌─────────────────────────────────────────────────────────────┐
│                    回答问题的方法                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 先思考再回答                                            │
│     - 不要着急回答                                          │
│     - 思考 5-10 秒组织语言                                  │
│     - 可以说"让我想一下"                                   │
│                                                              │
│  2. 结构化回答                                              │
│     - 先说结论/要点                                         │
│     - 再展开解释                                            │
│     - 举例说明                                              │
│                                                              │
│  3. 控制时间                                                │
│     - 简单问题 1-2 分钟                                     │
│     - 复杂问题 3-5 分钟                                     │
│     - 项目介绍 5-10 分钟                                    │
│                                                              │
│  4. 诚实回答                                                │
│     - 不会的就说不会                                        │
│     - 可以说"这个我不太确定，但我的理解是..."              │
│     - 不要胡编乱造                                          │
│                                                              │
│  5. 主动延伸                                                │
│     - 回答完可以补充相关知识                                │
│     - 展示知识面                                            │
│     - 但不要跑题                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. 算法题技巧

```
1. 先理解题意
   - 确认输入输出
   - 问清楚边界条件
   - 举例验证理解

2. 先说思路
   - 不要直接写代码
   - 说明算法思路
   - 分析时间复杂度

3. 边写边说
   - 解释关键步骤
   - 注意代码规范
   - 边界情况处理

4. 测试验证
   - 用示例验证
   - 考虑边界情况
   - 主动说出可能的优化
```

### 3. 面试当天准备

```
前一天：
□ 早睡，保证睡眠
□ 准备好需要的文件
□ 检查面试工具（电脑、网络等）
□ 复习核心内容

面试当天：
□ 提前 10-15 分钟到达/上线
□ 准备纸笔（记录问题）
□ 准备水
□ 调整好心态

面试中：
□ 保持微笑和眼神交流
□ 认真倾听问题
□ 不懂就问
□ 展示真实的自己
```

---

## Part D: 核心知识点清单

### Day 1-10 复习清单

```
Day 1: JavaScript/Java 核心
□ 数据类型和类型判断
□ 闭包和作用域
□ 原型链
□ Promise 和 async/await
□ Event Loop

Day 2: 数据结构与算法
□ 数组双指针
□ 链表反转
□ 栈和队列
□ 哈希表
□ 二叉树遍历
□ 快速排序

Day 3: 计算机网络
□ HTTP 方法和状态码
□ HTTP 缓存
□ TCP 三次握手四次挥手
□ HTTPS 原理
□ 跨域解决方案

Day 4: Vue/React 框架
□ Vue2/Vue3 响应式原理
□ 虚拟 DOM 和 diff
□ React Hooks 原理
□ Fiber 架构
□ 组件通信

Day 5: 数据库
□ B+ 树索引
□ 索引失效场景
□ 事务 ACID
□ 隔离级别
□ Redis 数据类型
□ 缓存问题

Day 6: 设计模式
□ 单例模式
□ 工厂模式
□ 代理模式
□ 观察者模式
□ SOLID 原则

Day 7-9: 项目准备
□ STAR 法则介绍项目
□ 技术难点案例
□ 技术亮点讲解
□ 量化数据准备
```

---

## Part E: 面试复盘模板

### 面试后记录

```
日期：
公司：
岗位：
面试官：

【面试问题记录】
1. 问题：
   我的回答：
   正确答案：
   改进点：

2. 问题：
   我的回答：
   正确答案：
   改进点：

【算法题】
题目：
我的解法：
最优解法：

【项目问题】
问到的点：
我的表现：
可以改进的地方：

【整体感受】
- 面试难度：
- 表现如何：
- 需要加强：

【后续计划】
- 需要复习的知识点：
- 需要准备的问题：
```

---

## 最后的话

```
┌─────────────────────────────────────────────────────────────┐
│                    面试心态                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 面试是双向选择                                          │
│     - 公司在选你，你也在选公司                              │
│     - 不必过于紧张                                          │
│                                                              │
│  2. 展示真实的自己                                          │
│     - 不要过度包装                                          │
│     - 诚实回答问题                                          │
│                                                              │
│  3. 一次失败不代表什么                                      │
│     - 面试是有运气成分的                                    │
│     - 每次面试都是学习机会                                  │
│                                                              │
│  4. 保持学习                                                │
│     - 技术在不断发展                                        │
│     - 面试也是检验学习成果的机会                            │
│                                                              │
│  祝你面试顺利！                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 复习检查清单

- [ ] 完成一次完整的模拟面试
- [ ] 复习所有核心知识点
- [ ] 准备好自我介绍
- [ ] 准备好项目介绍
- [ ] 准备好 2-3 个技术难点
- [ ] 准备好 2-3 个技术亮点
- [ ] 调整好心态

---

**10 天冲刺计划完成！祝面试成功！**
