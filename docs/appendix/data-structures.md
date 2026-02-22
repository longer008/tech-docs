# 数据结构基础面试题集

> 数据结构基础知识与高频面试题
> 
> 更新时间：2025-02

## 目录

[[toc]]

## A. 面试宝典

### 基础题

#### 1. 数组与链表

```
┌─────────────────────────────────────────────────────────────┐
│                    数组 vs 链表                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性              数组                  链表                 │
│  ──────────────────────────────────────────────────────────│
│  内存分配          连续                  分散                 │
│  随机访问          O(1)                  O(n)                │
│  插入/删除         O(n)                  O(1)*               │
│  空间利用          固定大小              动态增长             │
│  缓存友好          是                    否                   │
│                                                              │
│  * 链表插入删除 O(1) 是指在已知节点位置的情况下              │
│                                                              │
│  数组：                                                     │
│  ┌───┬───┬───┬───┬───┐                                     │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │  连续内存                           │
│  └───┴───┴───┴───┴───┘                                     │
│                                                              │
│  链表：                                                     │
│  ┌───┬───┐   ┌───┬───┐   ┌───┬───┐                        │
│  │ 1 │ ─┼──▶│ 2 │ ─┼──▶│ 3 │ ∅ │  分散内存               │
│  └───┴───┘   └───┴───┘   └───┴───┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**链表实现：**
```javascript
// 单链表节点
class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

// 单链表
class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // 头部插入 O(1)
  addFirst(val) {
    const node = new ListNode(val);
    node.next = this.head;
    this.head = node;
    this.size++;
  }

  // 尾部插入 O(n)
  addLast(val) {
    const node = new ListNode(val);
    if (!this.head) {
      this.head = node;
    } else {
      let curr = this.head;
      while (curr.next) {
        curr = curr.next;
      }
      curr.next = node;
    }
    this.size++;
  }

  // 删除节点
  remove(val) {
    if (!this.head) return false;

    if (this.head.val === val) {
      this.head = this.head.next;
      this.size--;
      return true;
    }

    let curr = this.head;
    while (curr.next && curr.next.val !== val) {
      curr = curr.next;
    }

    if (curr.next) {
      curr.next = curr.next.next;
      this.size--;
      return true;
    }
    return false;
  }

  // 反转链表
  reverse() {
    let prev = null;
    let curr = this.head;
    while (curr) {
      const next = curr.next;
      curr.next = prev;
      prev = curr;
      curr = next;
    }
    this.head = prev;
  }
}

// 双向链表节点
class DoublyListNode {
  constructor(val) {
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}
```

---

#### 2. 栈与队列

```
┌─────────────────────────────────────────────────────────────┐
│                    栈与队列                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  栈（Stack）- LIFO（后进先出）                              │
│  ────────────────────────────                               │
│  操作：push（入栈）、pop（出栈）、peek（查看栈顶）          │
│  时间复杂度：O(1)                                           │
│                                                              │
│    │     │                                                  │
│    │  3  │ ← top                                            │
│    │  2  │                                                  │
│    │  1  │                                                  │
│    └─────┘                                                  │
│                                                              │
│  队列（Queue）- FIFO（先进先出）                            │
│  ────────────────────────────                               │
│  操作：enqueue（入队）、dequeue（出队）、peek（查看队首）    │
│  时间复杂度：O(1)                                           │
│                                                              │
│    ┌───┬───┬───┬───┐                                       │
│    │ 1 │ 2 │ 3 │ 4 │                                       │
│    └───┴───┴───┴───┘                                       │
│      ↑               ↑                                      │
│    front           rear                                     │
│    出队             入队                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**实现：**
```javascript
// 栈（使用数组）
class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.pop();
  }

  peek() {
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}

// 队列（使用数组）
class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    return this.items.shift();
  }

  peek() {
    return this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

// 双端队列
class Deque {
  constructor() {
    this.items = [];
  }

  addFront(item) {
    this.items.unshift(item);
  }

  addRear(item) {
    this.items.push(item);
  }

  removeFront() {
    return this.items.shift();
  }

  removeRear() {
    return this.items.pop();
  }
}

// 用栈实现队列
class QueueUsingStacks {
  constructor() {
    this.stackIn = [];
    this.stackOut = [];
  }

  enqueue(x) {
    this.stackIn.push(x);
  }

  dequeue() {
    if (this.stackOut.length === 0) {
      while (this.stackIn.length > 0) {
        this.stackOut.push(this.stackIn.pop());
      }
    }
    return this.stackOut.pop();
  }
}
```

**应用场景：**
```
栈：
- 函数调用栈
- 浏览器前进后退
- 括号匹配
- 表达式求值
- 撤销操作

队列：
- 任务调度
- 消息队列
- BFS 广度优先搜索
- 缓冲区
```

---

#### 3. 哈希表

```
┌─────────────────────────────────────────────────────────────┐
│                    哈希表原理                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  哈希表 = 数组 + 哈希函数 + 冲突处理                        │
│                                                              │
│  键 ──▶ 哈希函数 ──▶ 索引 ──▶ 数组位置                     │
│                                                              │
│  时间复杂度（平均）：                                       │
│  - 查找：O(1)                                               │
│  - 插入：O(1)                                               │
│  - 删除：O(1)                                               │
│                                                              │
│  冲突解决方法：                                              │
│  ──────────────────────────────────────────────────────────│
│  1. 链地址法（拉链法）                                      │
│     每个位置存储链表                                        │
│     ┌───┐                                                  │
│     │ 0 │ → [A] → [B]                                      │
│     │ 1 │ → [C]                                            │
│     │ 2 │ → null                                           │
│     │ 3 │ → [D] → [E] → [F]                                │
│     └───┘                                                  │
│                                                              │
│  2. 开放地址法                                              │
│     - 线性探测：h(k) + 1, h(k) + 2, ...                    │
│     - 二次探测：h(k) + 1², h(k) + 2², ...                  │
│     - 双重哈希：h1(k) + i*h2(k)                            │
│                                                              │
│  负载因子 = 元素数量 / 数组大小                             │
│  负载因子过高需要扩容（通常阈值 0.75）                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**实现：**
```javascript
class HashMap {
  constructor(size = 53) {
    this.keyMap = new Array(size);
  }

  _hash(key) {
    let total = 0;
    const PRIME = 31;
    for (let i = 0; i < Math.min(key.length, 100); i++) {
      const char = key[i];
      const value = char.charCodeAt(0) - 96;
      total = (total * PRIME + value) % this.keyMap.length;
    }
    return total;
  }

  set(key, value) {
    const index = this._hash(key);
    if (!this.keyMap[index]) {
      this.keyMap[index] = [];
    }
    // 检查是否已存在
    for (let pair of this.keyMap[index]) {
      if (pair[0] === key) {
        pair[1] = value;
        return;
      }
    }
    this.keyMap[index].push([key, value]);
  }

  get(key) {
    const index = this._hash(key);
    if (this.keyMap[index]) {
      for (let pair of this.keyMap[index]) {
        if (pair[0] === key) {
          return pair[1];
        }
      }
    }
    return undefined;
  }

  delete(key) {
    const index = this._hash(key);
    if (this.keyMap[index]) {
      for (let i = 0; i < this.keyMap[index].length; i++) {
        if (this.keyMap[index][i][0] === key) {
          this.keyMap[index].splice(i, 1);
          return true;
        }
      }
    }
    return false;
  }
}
```

---

#### 4. 树

```
┌─────────────────────────────────────────────────────────────┐
│                    二叉树基础                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  二叉树结构：                                               │
│                  1 (根节点)                                 │
│                /   \                                        │
│               2     3                                       │
│              / \   / \                                      │
│             4   5 6   7                                     │
│            (叶子节点)                                       │
│                                                              │
│  遍历方式：                                                  │
│  ──────────────────────────────────────────────────────────│
│  前序遍历（根-左-右）：1, 2, 4, 5, 3, 6, 7                  │
│  中序遍历（左-根-右）：4, 2, 5, 1, 6, 3, 7                  │
│  后序遍历（左-右-根）：4, 5, 2, 6, 7, 3, 1                  │
│  层序遍历（BFS）：    1, 2, 3, 4, 5, 6, 7                   │
│                                                              │
│  特殊二叉树：                                               │
│  - 满二叉树：每层节点数都是最大值                           │
│  - 完全二叉树：除最后一层外都满，最后一层靠左               │
│  - 二叉搜索树：左 < 根 < 右                                 │
│  - 平衡二叉树：任意节点左右子树高度差 ≤ 1                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**实现：**
```javascript
// 二叉树节点
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

// 遍历
// 前序遍历（递归）
function preorder(root) {
  if (!root) return [];
  return [root.val, ...preorder(root.left), ...preorder(root.right)];
}

// 中序遍历（递归）
function inorder(root) {
  if (!root) return [];
  return [...inorder(root.left), root.val, ...inorder(root.right)];
}

// 后序遍历（递归）
function postorder(root) {
  if (!root) return [];
  return [...postorder(root.left), ...postorder(root.right), root.val];
}

// 层序遍历（BFS）
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const level = [];
    const size = queue.length;

    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

// 前序遍历（迭代）
function preorderIterative(root) {
  if (!root) return [];
  const result = [];
  const stack = [root];

  while (stack.length > 0) {
    const node = stack.pop();
    result.push(node.val);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return result;
}

// 二叉树高度
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// 判断是否平衡
function isBalanced(root) {
  if (!root) return true;
  const leftHeight = maxDepth(root.left);
  const rightHeight = maxDepth(root.right);
  return Math.abs(leftHeight - rightHeight) <= 1
    && isBalanced(root.left)
    && isBalanced(root.right);
}
```

---

#### 5. 二叉搜索树（BST）

```
┌─────────────────────────────────────────────────────────────┐
│                    二叉搜索树                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  性质：左子树 < 根节点 < 右子树                             │
│                                                              │
│              8                                               │
│            /   \                                             │
│           3     10                                           │
│          / \      \                                          │
│         1   6     14                                         │
│            / \    /                                          │
│           4   7  13                                          │
│                                                              │
│  中序遍历结果有序：1, 3, 4, 6, 7, 8, 10, 13, 14             │
│                                                              │
│  时间复杂度（平均/最坏）：                                   │
│  - 查找：O(log n) / O(n)                                    │
│  - 插入：O(log n) / O(n)                                    │
│  - 删除：O(log n) / O(n)                                    │
│                                                              │
│  最坏情况：退化为链表（需要平衡树解决）                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
class BST {
  constructor() {
    this.root = null;
  }

  // 插入
  insert(val) {
    const node = new TreeNode(val);
    if (!this.root) {
      this.root = node;
      return;
    }

    let curr = this.root;
    while (true) {
      if (val < curr.val) {
        if (!curr.left) {
          curr.left = node;
          return;
        }
        curr = curr.left;
      } else {
        if (!curr.right) {
          curr.right = node;
          return;
        }
        curr = curr.right;
      }
    }
  }

  // 查找
  search(val) {
    let curr = this.root;
    while (curr) {
      if (val === curr.val) return curr;
      if (val < curr.val) {
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }
    return null;
  }

  // 查找最小值
  findMin(node = this.root) {
    while (node && node.left) {
      node = node.left;
    }
    return node;
  }

  // 查找最大值
  findMax(node = this.root) {
    while (node && node.right) {
      node = node.right;
    }
    return node;
  }

  // 删除
  delete(val, node = this.root) {
    if (!node) return null;

    if (val < node.val) {
      node.left = this.delete(val, node.left);
    } else if (val > node.val) {
      node.right = this.delete(val, node.right);
    } else {
      // 找到要删除的节点
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      // 有两个子节点：用右子树最小值替换
      const minRight = this.findMin(node.right);
      node.val = minRight.val;
      node.right = this.delete(minRight.val, node.right);
    }
    return node;
  }
}
```

---

### 进阶题

#### 6. 堆

```
┌─────────────────────────────────────────────────────────────┐
│                    堆（优先队列）                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  最大堆：父节点 ≥ 子节点                                    │
│  最小堆：父节点 ≤ 子节点                                    │
│                                                              │
│  最大堆示例：                                               │
│               9                                              │
│             /   \                                            │
│            7     8                                           │
│           / \   /                                            │
│          5   6 3                                             │
│                                                              │
│  数组表示：[9, 7, 8, 5, 6, 3]                               │
│  索引关系：                                                  │
│  - 父节点：(i - 1) / 2                                      │
│  - 左子节点：2 * i + 1                                      │
│  - 右子节点：2 * i + 2                                      │
│                                                              │
│  时间复杂度：                                               │
│  - 插入：O(log n)                                           │
│  - 删除最值：O(log n)                                       │
│  - 获取最值：O(1)                                           │
│  - 建堆：O(n)                                               │
│                                                              │
│  应用场景：                                                  │
│  - 优先队列                                                  │
│  - 堆排序                                                    │
│  - Top K 问题                                               │
│  - 中位数                                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// 最小堆
class MinHeap {
  constructor() {
    this.heap = [];
  }

  // 上浮
  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex] <= this.heap[index]) break;
      [this.heap[parentIndex], this.heap[index]] =
        [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  // 下沉
  bubbleDown(index) {
    const length = this.heap.length;
    while (true) {
      const leftIndex = 2 * index + 1;
      const rightIndex = 2 * index + 2;
      let smallest = index;

      if (leftIndex < length && this.heap[leftIndex] < this.heap[smallest]) {
        smallest = leftIndex;
      }
      if (rightIndex < length && this.heap[rightIndex] < this.heap[smallest]) {
        smallest = rightIndex;
      }
      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] =
        [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }

  // 插入
  push(val) {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  // 删除最小值
  pop() {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return min;
  }

  // 获取最小值
  peek() {
    return this.heap[0];
  }

  size() {
    return this.heap.length;
  }
}

// Top K 问题
function topK(arr, k) {
  const heap = new MinHeap();
  for (const num of arr) {
    heap.push(num);
    if (heap.size() > k) {
      heap.pop();
    }
  }
  return heap.heap;
}
```

---

#### 7. 图

```
┌─────────────────────────────────────────────────────────────┐
│                    图的表示                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  图：G = (V, E)  V: 顶点集  E: 边集                         │
│                                                              │
│  示例图：                                                   │
│      0 ─── 1                                                │
│      │ \ / │                                                │
│      │  X  │                                                │
│      │ / \ │                                                │
│      2 ─── 3                                                │
│                                                              │
│  1. 邻接矩阵：                                              │
│      0 1 2 3                                                │
│    ┌─────────                                               │
│  0 │ 0 1 1 1                                                │
│  1 │ 1 0 1 1                                                │
│  2 │ 1 1 0 1                                                │
│  3 │ 1 1 1 0                                                │
│                                                              │
│  2. 邻接表：                                                │
│  0: [1, 2, 3]                                               │
│  1: [0, 2, 3]                                               │
│  2: [0, 1, 3]                                               │
│  3: [0, 1, 2]                                               │
│                                                              │
│  邻接矩阵 vs 邻接表：                                       │
│  - 矩阵：空间 O(V²)，查边 O(1)，适合稠密图                  │
│  - 邻接表：空间 O(V+E)，适合稀疏图                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// 图（邻接表）
class Graph {
  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(v1, v2) {
    this.adjacencyList.get(v1).push(v2);
    this.adjacencyList.get(v2).push(v1);  // 无向图
  }

  // 深度优先搜索（DFS）
  dfs(start) {
    const result = [];
    const visited = new Set();

    const dfsHelper = (vertex) => {
      if (!vertex) return;
      visited.add(vertex);
      result.push(vertex);

      for (const neighbor of this.adjacencyList.get(vertex)) {
        if (!visited.has(neighbor)) {
          dfsHelper(neighbor);
        }
      }
    };

    dfsHelper(start);
    return result;
  }

  // 广度优先搜索（BFS）
  bfs(start) {
    const result = [];
    const visited = new Set();
    const queue = [start];
    visited.add(start);

    while (queue.length > 0) {
      const vertex = queue.shift();
      result.push(vertex);

      for (const neighbor of this.adjacencyList.get(vertex)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return result;
  }
}
```

---

### 避坑指南

| 数据结构 | 常见陷阱 |
|----------|----------|
| 数组 | 越界访问、空数组判断 |
| 链表 | 空指针、断链、循环链表 |
| 栈/队列 | 空栈/队列操作 |
| 哈希表 | 哈希冲突、扩容时机 |
| 二叉树 | 空树处理、递归终止条件 |
| 堆 | 索引计算错误 |

---

## B. 实战文档

### 时间复杂度速查

```
O(1)      常数时间    数组访问、哈希表查找
O(log n)  对数时间    二分查找、平衡树操作
O(n)      线性时间    遍历数组、链表
O(n log n)线性对数    快排、归并排序、堆排序
O(n²)     平方时间    冒泡排序、选择排序
O(2^n)    指数时间    斐波那契递归、子集枚举
O(n!)     阶乘时间    全排列
```

### JavaScript 内置数据结构

```javascript
// 数组
const arr = [1, 2, 3];
arr.push(4);           // O(1)
arr.pop();             // O(1)
arr.shift();           // O(n)
arr.unshift(0);        // O(n)
arr.splice(1, 1);      // O(n)
arr.slice(0, 2);       // O(n)

// Map（哈希表）
const map = new Map();
map.set('key', 'value');  // O(1)
map.get('key');           // O(1)
map.has('key');           // O(1)
map.delete('key');        // O(1)

// Set（集合）
const set = new Set();
set.add(1);               // O(1)
set.has(1);               // O(1)
set.delete(1);            // O(1)

// 对象（哈希表）
const obj = {};
obj.key = 'value';        // O(1)
obj.key;                  // O(1)
delete obj.key;           // O(1)
```


---

#### 8. Trie 树（前缀树）

```
┌─────────────────────────────────────────────────────────────┐
│                    Trie 树结构                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  存储单词：cat, car, card, dog, door                        │
│                                                              │
│                  root                                        │
│                 /    \                                       │
│                c      d                                      │
│               /        \                                     │
│              a          o                                    │
│             / \          \                                   │
│            t   r          g*                                 │
│           *     \          \                                 │
│                  d          o                                │
│                   \          \                               │
│                    *          r*                             │
│                                                              │
│  * 表示单词结束                                              │
│                                                              │
│  时间复杂度：                                               │
│  - 插入：O(m)  m为字符串长度                                │
│  - 查找：O(m)                                               │
│  - 前缀搜索：O(m)                                           │
│                                                              │
│  空间复杂度：O(ALPHABET_SIZE * N * M)                      │
│  N为单词数，M为平均长度                                     │
│                                                              │
│  应用场景：                                                  │
│  - 自动补全                                                  │
│  - 拼写检查                                                  │
│  - IP 路由表                                                │
│  - 字符串前缀匹配                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// Trie 节点
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

// Trie 树
class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // 插入单词
  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isEndOfWord = true;
  }

  // 查找单词
  search(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char);
    }
    return node.isEndOfWord;
  }

  // 前缀搜索
  startsWith(prefix) {
    let node = this.root;
    for (const char of p
ath);
      }
      for (const [char, child] of node.children) {
        dfs(child, path + char);
      }
    };

    dfs(node, '');
    return result;
  }

  // 删除单词
  delete(word) {
    const deleteHelper = (node, word, index) => {
      if (index === word.length) {
        if (!node.isEndOfWord) return false;
        node.isEndOfWord = false;
        return node.children.size === 0;
      }

      const char = word[index];
      const child = node.children.get(char);
      if (!child) return false;

      const shouldDeleteChild = deleteHelper(child, word, index + 1);

      if (shouldDeleteChild) {
        node.children.delete(char);
        return node.children.size === 0 && !node.isEndOfWord;
      }

      return false;
    };

    deleteHelper(this.root, word, 0);
  }
}

// 使用示例
const trie = new Trie();
trie.insert('apple');
trie.insert('app');
trie.insert('application');
console.log(trie.search('app'));        // true
console.log(trie.startsWith('app'));    // true
console.log(trie.autocomplete('app'));  // ['app', 'apple', 'application']
```

---

#### 9. 并查集（Union-Find）

```
┌─────────────────────────────────────────────────────────────┐
│                    并查集原理                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  用途：处理不相交集合的合并与查询                           │
│                                                              │
│  初始状态（每个元素独立）：                                 │
│  0  1  2  3  4  5                                           │
│  │  │  │  │  │  │                                           │
│                                                              │
│  合并 0-1, 2-3, 4-5：                                       │
│  0     2     4                                              │
│  │     │     │                                              │
│  1     3     5                                              │
│                                                              │
│  再合并 0-2：                                               │
│      0                                                      │
│    /   \                                                    │
│   1     2                                                   │
│         │                                                   │
│         3                                                   │
│                                                              │
│  操作：                                                      │
│  - find(x)：查找 x 的根节点                                 │
│  - union(x, y)：合并 x 和 y 所在集合                        │
│  - connected(x, y)：判断 x 和 y 是否在同一集合              │
│                                                              │
│  优化：                                                      │
│  1. 路径压缩：find 时将节点直接连到根                       │
│  2. 按秩合并：小树合并到大树                                │
│                                                              │
│  时间复杂度：O(α(n))  α为反阿克曼函数，近似 O(1)            │
│                                                              │
│  应用场景：                                                  │
│  - 判断图的连通性                                           │
│  - 最小生成树（Kruskal）                                    │
│  - 社交网络（朋友圈）                                       │
│  - 图像分割                                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// 并查集
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(1);  // 树的高度
    this.count = n;  // 连通分量数
  }

  // 查找根节点（路径压缩）
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);  // 路径压缩
    }
    return this.parent[x];
  }

  // 合并两个集合（按秩合并）
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return false;

    // 按秩合并：小树合并到大树
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    this.count--;
    return true;
  }

  // 判断是否连通
  connected(x, y) {
    return this.find(x) === this.find(y);
  }

  // 获取连通分量数
  getCount() {
    return this.count;
  }
}

// 应用：判断图中是否有环
function hasCycle(n, edges) {
  const uf = new UnionFind(n);
  for (const [u, v] of edges) {
    if (uf.connected(u, v)) {
      return true;  // 已连通，添加边会形成环
    }
    uf.union(u, v);
  }
  return false;
}

// 应用：朋友圈数量
function findCircleNum(isConnected) {
  const n = isConnected.length;
  const uf = new UnionFind(n);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isConnected[i][j] === 1) {
        uf.union(i, j);
      }
    }
  }

  return uf.getCount();
}
```

---

#### 10. 线段树（Segment Tree）

```
┌─────────────────────────────────────────────────────────────┐
│                    线段树结构                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  数组：[1, 3, 5, 7, 9, 11]                                  │
│                                                              │
│  线段树（存储区间和）：                                      │
│                                                              │
│                    [0,5]:36                                  │
│                   /         \                                │
│            [0,2]:9          [3,5]:27                         │
│           /      \          /       \                        │
│       [0,1]:4  [2,2]:5  [3,4]:16  [5,5]:11                  │
│       /    \            /     \                              │
│   [0,0]:1 [1,1]:3   [3,3]:7  [4,4]:9                        │
│                                                              │
│  操作：                                                      │
│  - build：构建线段树 O(n)                                   │
│  - update：更新单点 O(log n)                                │
│  - query：查询区间 O(log n)                                 │
│                                                              │
│  应用场景：                                                  │
│  - 区间求和/最值                                            │
│  - 区间更新                                                 │
│  - 动态 RMQ（Range Minimum Query）                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// 线段树（区间求和）
class SegmentTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n).fill(0);
    this.build(arr, 0, 0, this.n - 1);
  }

  // 构建线段树
  build(arr, node, start, end) {
    if (start === end) {
      this.tree[node] = arr[start];
      return;
    }

    const mid = Math.floor((start + end) / 2);
    const leftNode = 2 * node + 1;
    const rightNode = 2 * node + 2;

    this.build(arr, leftNode, start, mid);
    this.build(arr, rightNode, mid + 1, end);

    this.tree[node] = this.tree[leftNode] + this.tree[rightNode];
  }

  // 更新单点
  update(index, value) {
    this._update(0, 0, this.n - 1, index, value);
  }

  _update(node, start, end, index, value) {
    if (start === end) {
      this.tree[node] = value;
      return;
    }

    const mid = Math.floor((start + end) / 2);
    const leftNode = 2 * node + 1;
    const rightNode = 2 * node + 2;

    if (index <= mid) {
      this._update(leftNode, start, mid, index, value);
    } else {
      this._update(rightNode, mid + 1, end, index, value);
    }

    this.tree[node] = this.tree[leftNode] + this.tree[rightNode];
  }

  // 查询区间和
  query(left, right) {
    return this._query(0, 0, this.n - 1, left, right);
  }

  _query(node, start, end, left, right) {
    // 区间完全不重叠
    if (right < start || left > end) {
      return 0;
    }

    // 区间完全包含
    if (left <= start && end <= right) {
      return this.tree[node];
    }

    // 区间部分重叠
    const mid = Math.floor((start + end) / 2);
    const leftNode = 2 * node + 1;
    const rightNode = 2 * node + 2;

    const leftSum = this._query(leftNode, start, mid, left, right);
    const rightSum = this._query(rightNode, mid + 1, end, left, right);

    return leftSum + rightSum;
  }
}

// 使用示例
const arr = [1, 3, 5, 7, 9, 11];
const segTree = new SegmentTree(arr);
console.log(segTree.query(1, 3));  // 3 + 5 + 7 = 15
segTree.update(1, 10);
console.log(segTree.query(1, 3));  // 10 + 5 + 7 = 22
```

---

### 高频面试题

#### 11. LRU 缓存实现

```javascript
/**
 * LRU（Least Recently Used）缓存
 * 使用哈希表 + 双向链表实现
 * 
 * 时间复杂度：get O(1), put O(1)
 * 空间复杂度：O(capacity)
 */

class LRUNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
    // 哨兵节点
    this.head = new LRUNode(0, 0);
    this.tail = new LRUNode(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key) {
    if (!this.cache.has(key)) {
      return -1;
    }
    const node = this.cache.get(key);
    // 移到头部（最近使用）
    this.removeNode(node);
    this.addToHead(node);
    return node.value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      // 更新已存在的节点
      const node = this.cache.get(key);
      node.value = value;
      this.removeNode(node);
      this.addToHead(node);
    } else {
      // 添加新节点
      const node = new LRUNode(key, value);
      this.cache.set(key, node);
      this.addToHead(node);

      // 超过容量，删除尾部（最久未使用）
      if (this.cache.size > this.capacity) {
        const removed = this.removeTail();
        this.cache.delete(removed.key);
      }
    }
  }

  addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  removeTail() {
    const node = this.tail.prev;
    this.removeNode(node);
    return node;
  }
}

// 使用示例
const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1));  // 1
cache.put(3, 3);            // 淘汰 key 2
console.log(cache.get(2));  // -1
```

---

#### 12. 跳表（Skip List）

```
┌─────────────────────────────────────────────────────────────┐
│                    跳表结构                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Level 3:  1 ────────────────────────▶ 9                   │
│  Level 2:  1 ──────▶ 4 ──────▶ 7 ───▶ 9                    │
│  Level 1:  1 ──▶ 3 ─▶ 4 ──▶ 6 ─▶ 7 ──▶ 9                   │
│  Level 0:  1 ─▶ 2 ─▶ 3 ─▶ 4 ─▶ 5 ─▶ 6 ─▶ 7 ─▶ 8 ─▶ 9      │
│                                                              │
│  特点：                                                      │
│  - 有序链表 + 多层索引                                      │
│  - 空间换时间                                               │
│  - 随机化层数                                               │
│                                                              │
│  时间复杂度：                                               │
│  - 查找：O(log n)                                           │
│  - 插入：O(log n)                                           │
│  - 删除：O(log n)                                           │
│                                                              │
│  应用：Redis 的 Sorted Set                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
class SkipListNode {
  constructor(value, level) {
    this.value = value;
    this.forward = new Array(level + 1).fill(null);
  }
}

class SkipList {
  constructor(maxLevel = 16, p = 0.5) {
    this.maxLevel = maxLevel;
    this.p = p;
    this.level = 0;
    this.header = new SkipListNode(-Infinity, maxLevel);
  }

  // 随机层数
  randomLevel() {
    let level = 0;
    while (Math.random() < this.p && level < this.maxLevel) {
      level++;
    }
    return level;
  }

  // 查找
  search(target) {
    let curr = this.header;
    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].value < target) {
        curr = curr.forward[i];
      }
    }
    curr = curr.forward[0];
    return curr && curr.value === target;
  }

  // 插入
  insert(value) {
    const update = new Array(this.maxLevel + 1).fill(null);
    let curr = this.header;

    // 找到每层的插入位置
    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].value < value) {
        curr = curr.forward[i];
      }
      update[i] = curr;
    }

    const newLevel = this.randomLevel();
    if (newLevel > this.level) {
      for (let i = this.level + 1; i <= newLevel; i++) {
        update[i] = this.header;
      }
      this.level = newLevel;
    }

    const newNode = new SkipListNode(value, newLevel);
    for (let i = 0; i <= newLevel; i++) {
      newNode.forward[i] = update[i].forward[i];
      update[i].forward[i] = newNode;
    }
  }

  // 删除
  delete(value) {
    const update = new Array(this.maxLevel + 1).fill(null);
    let curr = this.header;

    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].value < value) {
        curr = curr.forward[i];
      }
      update[i] = curr;
    }

    curr = curr.forward[0];
    if (curr && curr.value === value) {
      for (let i = 0; i <= this.level; i++) {
        if (update[i].forward[i] !== curr) break;
        update[i].forward[i] = curr.forward[i];
      }

      // 更新层数
      while (this.level > 0 && !this.header.forward[this.level]) {
        this.level--;
      }
      return true;
    }
    return false;
  }
}
```

---

## C. 数据结构选择指南

### 场景对应表

| 场景 | 推荐数据结构 | 原因 |
|------|-------------|------|
| 快速查找 | 哈希表 | O(1) 查找 |
| 有序数据 | 二叉搜索树、跳表 | 支持范围查询 |
| 优先级队列 | 堆 | O(log n) 插入删除 |
| 最近使用 | LRU（哈希表+链表） | O(1) 访问和更新 |
| 前缀匹配 | Trie 树 | 高效前缀搜索 |
| 集合操作 | 并查集 | 快速合并查询 |
| 区间查询 | 线段树、树状数组 | O(log n) 区间操作 |
| 撤销操作 | 栈 | LIFO 特性 |
| 任务调度 | 队列 | FIFO 特性 |
| 图遍历 | DFS（栈）、BFS（队列） | 系统性遍历 |

### 性能对比

```
数据结构          查找      插入      删除      空间
──────────────────────────────────────────────────
数组              O(n)      O(n)      O(n)      O(n)
有序数组          O(log n)  O(n)      O(n)      O(n)
链表              O(n)      O(1)*     O(1)*     O(n)
哈希表            O(1)      O(1)      O(1)      O(n)
二叉搜索树        O(log n)  O(log n)  O(log n)  O(n)
平衡树(AVL/红黑)  O(log n)  O(log n)  O(log n)  O(n)
堆                O(n)      O(log n)  O(log n)  O(n)
Trie              O(m)      O(m)      O(m)      O(ALPHABET*N*M)
跳表              O(log n)  O(log n)  O(log n)  O(n log n)

* 已知位置的情况下
m: 字符串长度
```

---

## D. 面试技巧

### 1. 问题分析步骤

```
1. 理解问题
   - 输入输出是什么？
   - 有什么限制条件？
   - 边界情况有哪些？

2. 选择数据结构
   - 需要什么操作？
   - 时间空间要求？
   - 是否需要有序？

3. 设计算法
   - 暴力解法
   - 优化思路
   - 权衡取舍

4. 编码实现
   - 清晰的变量命名
   - 处理边界情况
   - 添加注释

5. 测试验证
   - 正常用例
   - 边界用例
   - 异常用例
```

### 2. 常见优化技巧

```javascript
// 1. 空间换时间：使用哈希表
// 两数之和 - O(n²) → O(n)
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

// 2. 双指针：减少嵌套循环
// 三数之和 - O(n³) → O(n²)
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}

// 3. 单调栈：优化查找
// 下一个更大元素 - O(n²) → O(n)
function nextGreaterElement(nums) {
  const result = new Array(nums.length).fill(-1);
  const stack = [];
  
  for (let i = 0; i < nums.length; i++) {
    while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {
      const index = stack.pop();
      result[index] = nums[i];
    }
    stack.push(i);
  }
  return result;
}

// 4. 前缀和：优化区间查询
// 区间和查询 - O(n) → O(1)
class NumArray {
  constructor(nums) {
    this.prefixSum = [0];
    for (const num of nums) {
      this.prefixSum.push(this.prefixSum[this.prefixSum.length - 1] + num);
    }
  }
  
  sumRange(left, right) {
    return this.prefixSum[right + 1] - this.prefixSum[left];
  }
}
```

### 3. 面试加分项

```
✅ 主动讨论时间空间复杂度
✅ 考虑边界情况和异常处理
✅ 代码风格清晰，命名规范
✅ 提出多种解法并对比
✅ 优化思路清晰
✅ 能够举一反三

❌ 直接写代码不思考
❌ 忽略边界情况
❌ 代码混乱难读
❌ 只会一种解法
❌ 不考虑复杂度
```

---

## E. 参考资料

### 在线资源

- [LeetCode](https://leetcode.com/) - 算法题库
- [VisuAlgo](https://visualgo.net/) - 数据结构可视化
- [Big-O Cheat Sheet](https://www.bigocheatsheet.com/) - 复杂度速查
- [JavaScript Algorithms](https://github.com/trekhleb/javascript-algorithms) - JS 算法实现

### 推荐书籍

- 《算法导论》- 经典教材
- 《数据结构与算法分析》- 系统学习
- 《剑指 Offer》- 面试题集
- 《编程珠玑》- 算法思维

### 学习路线

```
初级（1-2个月）：
- 数组、链表、栈、队列
- 哈希表、字符串
- 基础算法（排序、查找）

中级（2-3个月）：
- 树（二叉树、BST、堆）
- 图（DFS、BFS）
- 动态规划入门
- 回溯算法

高级（3-6个月）：
- 高级树（Trie、线段树、并查集）
- 高级图算法
- 复杂动态规划
- 贪心算法
```
