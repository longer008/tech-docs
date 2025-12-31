# 数据结构基础面试题集

> 数据结构基础知识与高频面试题

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
