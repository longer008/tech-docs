# Day 2: 数据结构与算法基础

> 第二天重点：掌握高频数据结构，熟练手写经典算法

## 今日目标

- [ ] 掌握数组双指针、滑动窗口技巧
- [ ] 熟练链表反转、环检测
- [ ] 理解栈队列应用场景
- [ ] 掌握哈希表解题模式
- [ ] 完成 8 道 LeetCode 经典题

---

## Part A: 数组

### 1. 双指针技巧

#### Q1: 两数之和 (LeetCode 1)

**题目：** 给定数组和目标值，找出两个数使其和等于目标值

**答案：**
```javascript
// 方法1：哈希表 O(n)
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

// 方法2：双指针（需要先排序，适用于有序数组）
function twoSumSorted(nums, target) {
  let left = 0, right = nums.length - 1;

  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return [];
}
```

---

#### Q2: 三数之和 (LeetCode 15)

**题目：** 找出数组中所有和为 0 的三元组

**答案：**
```javascript
function threeSum(nums) {
  const result = [];
  nums.sort((a, b) => a - b);  // 排序

  for (let i = 0; i < nums.length - 2; i++) {
    // 跳过重复元素
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    // 剪枝：最小值大于0，后面不可能有解
    if (nums[i] > 0) break;

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        // 跳过重复
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
```

---

#### Q3: 盛最多水的容器 (LeetCode 11)

**题目：** 给定 n 条垂线，找出两条线使其与 x 轴构成的容器容纳最多的水

**答案：**
```javascript
function maxArea(height) {
  let left = 0, right = height.length - 1;
  let maxWater = 0;

  while (left < right) {
    const h = Math.min(height[left], height[right]);
    const w = right - left;
    maxWater = Math.max(maxWater, h * w);

    // 移动较短的那条边
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return maxWater;
}

// 为什么移动短边？
// 因为宽度在缩小，只有高度增加才可能得到更大面积
// 短边决定了高度，移动短边才有可能找到更高的边
```

---

### 2. 滑动窗口

#### Q4: 无重复字符的最长子串 (LeetCode 3)

**题目：** 找出字符串中不含重复字符的最长子串的长度

**答案：**
```javascript
function lengthOfLongestSubstring(s) {
  const map = new Map();  // 字符 -> 最新位置
  let maxLen = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    // 如果字符已存在且在窗口内，收缩左边界
    if (map.has(char) && map.get(char) >= left) {
      left = map.get(char) + 1;
    }

    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// 示例：abcabcbb
// a -> maxLen=1, left=0
// ab -> maxLen=2
// abc -> maxLen=3
// abca -> left移到1, maxLen=3
// ...
```

---

#### Q5: 最小覆盖子串 (LeetCode 76)

**题目：** 给定字符串 S 和 T，找出 S 中包含 T 所有字符的最小子串

**答案：**
```javascript
function minWindow(s, t) {
  const need = new Map();  // t 中字符需求
  const window = new Map(); // 窗口中字符计数

  for (const char of t) {
    need.set(char, (need.get(char) || 0) + 1);
  }

  let left = 0, right = 0;
  let valid = 0;  // 满足条件的字符数
  let start = 0, minLen = Infinity;

  while (right < s.length) {
    const c = s[right];
    right++;

    // 扩展窗口
    if (need.has(c)) {
      window.set(c, (window.get(c) || 0) + 1);
      if (window.get(c) === need.get(c)) {
        valid++;
      }
    }

    // 收缩窗口
    while (valid === need.size) {
      if (right - left < minLen) {
        start = left;
        minLen = right - left;
      }

      const d = s[left];
      left++;

      if (need.has(d)) {
        if (window.get(d) === need.get(d)) {
          valid--;
        }
        window.set(d, window.get(d) - 1);
      }
    }
  }

  return minLen === Infinity ? '' : s.substring(start, start + minLen);
}
```

**滑动窗口模板：**
```javascript
function slidingWindowTemplate(s) {
  const window = new Map();
  let left = 0, right = 0;

  while (right < s.length) {
    // 1. 扩展窗口，加入 s[right]
    const c = s[right];
    right++;
    // 更新窗口数据...

    // 2. 判断是否需要收缩
    while (需要收缩) {
      // 3. 收缩窗口，移除 s[left]
      const d = s[left];
      left++;
      // 更新窗口数据...
    }
  }
}
```

---

### 3. 前缀和

#### Q6: 和为 K 的子数组 (LeetCode 560)

**题目：** 找出数组中和为 k 的连续子数组的个数

**答案：**
```javascript
function subarraySum(nums, k) {
  const prefixSumCount = new Map();
  prefixSumCount.set(0, 1);  // 前缀和为0出现1次

  let count = 0;
  let prefixSum = 0;

  for (const num of nums) {
    prefixSum += num;

    // 如果 prefixSum - k 存在，说明有子数组和为 k
    if (prefixSumCount.has(prefixSum - k)) {
      count += prefixSumCount.get(prefixSum - k);
    }

    prefixSumCount.set(prefixSum, (prefixSumCount.get(prefixSum) || 0) + 1);
  }

  return count;
}

// 原理：prefixSum[j] - prefixSum[i] = k
// 即：子数组 [i+1, j] 的和为 k
```

---

## Part B: 链表

### 1. 链表基础操作

```javascript
// 链表节点定义
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// 创建链表
function createList(arr) {
  const dummy = new ListNode(0);
  let curr = dummy;
  for (const val of arr) {
    curr.next = new ListNode(val);
    curr = curr.next;
  }
  return dummy.next;
}

// 打印链表
function printList(head) {
  const result = [];
  while (head) {
    result.push(head.val);
    head = head.next;
  }
  console.log(result.join(' -> '));
}
```

---

#### Q7: 反转链表 (LeetCode 206)

**答案：**
```javascript
// 方法1：迭代
function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr) {
    const next = curr.next;  // 保存下一个节点
    curr.next = prev;        // 反转指针
    prev = curr;             // 移动 prev
    curr = next;             // 移动 curr
  }

  return prev;
}

// 方法2：递归
function reverseListRecursive(head) {
  if (!head || !head.next) return head;

  const newHead = reverseListRecursive(head.next);
  head.next.next = head;  // 反转指针
  head.next = null;       // 断开原连接

  return newHead;
}

// 图解：
// 1 -> 2 -> 3 -> null
// null <- 1    2 -> 3 -> null  (prev=1, curr=2)
// null <- 1 <- 2    3 -> null  (prev=2, curr=3)
// null <- 1 <- 2 <- 3          (prev=3, curr=null)
```

---

#### Q8: 反转链表 II (LeetCode 92)

**题目：** 反转链表中第 m 到第 n 个节点

**答案：**
```javascript
function reverseBetween(head, left, right) {
  const dummy = new ListNode(0, head);
  let pre = dummy;

  // 找到反转区间的前一个节点
  for (let i = 1; i < left; i++) {
    pre = pre.next;
  }

  let curr = pre.next;

  // 头插法反转
  for (let i = 0; i < right - left; i++) {
    const next = curr.next;
    curr.next = next.next;
    next.next = pre.next;
    pre.next = next;
  }

  return dummy.next;
}
```

---

#### Q9: 环形链表 (LeetCode 141)

**答案：**
```javascript
// 快慢指针
function hasCycle(head) {
  let slow = head, fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      return true;
    }
  }

  return false;
}
```

---

#### Q10: 环形链表 II (LeetCode 142)

**题目：** 找出环的入口节点

**答案：**
```javascript
function detectCycle(head) {
  let slow = head, fast = head;

  // 1. 快慢指针相遇
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      // 2. 一个从头开始，一个从相遇点开始，相遇处即为入口
      let ptr = head;
      while (ptr !== slow) {
        ptr = ptr.next;
        slow = slow.next;
      }
      return ptr;
    }
  }

  return null;
}

// 数学证明：
// 设：头到入口距离 a，入口到相遇点距离 b，环长度 c
// 相遇时：slow 走了 a + b，fast 走了 a + b + n*c
// 因为 fast = 2*slow：a + b + n*c = 2(a + b)
// 所以：a = n*c - b = (n-1)*c + (c-b)
// 即：从头走 a 步 = 从相遇点走 c-b 步（都到达入口）
```

---

#### Q11: 合并两个有序链表 (LeetCode 21)

**答案：**
```javascript
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let curr = dummy;

  while (l1 && l2) {
    if (l1.val < l2.val) {
      curr.next = l1;
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next;
  }

  curr.next = l1 || l2;  // 连接剩余部分

  return dummy.next;
}

// 递归版本
function mergeTwoListsRecursive(l1, l2) {
  if (!l1) return l2;
  if (!l2) return l1;

  if (l1.val < l2.val) {
    l1.next = mergeTwoListsRecursive(l1.next, l2);
    return l1;
  } else {
    l2.next = mergeTwoListsRecursive(l1, l2.next);
    return l2;
  }
}
```

---

#### Q12: 合并 K 个有序链表 (LeetCode 23)

**答案：**
```javascript
// 方法1：分治合并
function mergeKLists(lists) {
  if (!lists.length) return null;
  return mergeRange(lists, 0, lists.length - 1);
}

function mergeRange(lists, start, end) {
  if (start === end) return lists[start];

  const mid = Math.floor((start + end) / 2);
  const left = mergeRange(lists, start, mid);
  const right = mergeRange(lists, mid + 1, end);

  return mergeTwoLists(left, right);
}

// 方法2：最小堆（更高效）
// 使用优先队列，每次取最小节点
```

---

## Part C: 栈与队列

### 1. 栈的应用

#### Q13: 有效的括号 (LeetCode 20)

**答案：**
```javascript
function isValid(s) {
  const stack = [];
  const pairs = {
    ')': '(',
    ']': '[',
    '}': '{'
  };

  for (const char of s) {
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);
    } else {
      if (stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }

  return stack.length === 0;
}
```

---

#### Q14: 最小栈 (LeetCode 155)

**答案：**
```javascript
class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];  // 辅助栈存储最小值
  }

  push(val) {
    this.stack.push(val);
    // 如果 minStack 为空或 val 小于等于当前最小值
    if (
      this.minStack.length === 0 ||
      val <= this.minStack[this.minStack.length - 1]
    ) {
      this.minStack.push(val);
    }
  }

  pop() {
    const val = this.stack.pop();
    if (val === this.minStack[this.minStack.length - 1]) {
      this.minStack.pop();
    }
    return val;
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}
```

---

#### Q15: 单调栈 - 每日温度 (LeetCode 739)

**题目：** 给定每日温度数组，返回每天需要等多少天才能有更高温度

**答案：**
```javascript
function dailyTemperatures(temperatures) {
  const n = temperatures.length;
  const result = new Array(n).fill(0);
  const stack = [];  // 存储下标

  for (let i = 0; i < n; i++) {
    // 当前温度大于栈顶温度时，弹出并计算天数
    while (
      stack.length &&
      temperatures[i] > temperatures[stack[stack.length - 1]]
    ) {
      const idx = stack.pop();
      result[idx] = i - idx;
    }
    stack.push(i);
  }

  return result;
}

// 单调栈模板：找下一个更大/更小元素
```

---

### 2. 队列的应用

#### Q16: 用栈实现队列 (LeetCode 232)

**答案：**
```javascript
class MyQueue {
  constructor() {
    this.stackIn = [];   // 入队栈
    this.stackOut = [];  // 出队栈
  }

  push(x) {
    this.stackIn.push(x);
  }

  pop() {
    this.peek();
    return this.stackOut.pop();
  }

  peek() {
    if (this.stackOut.length === 0) {
      // 将 stackIn 全部倒入 stackOut
      while (this.stackIn.length) {
        this.stackOut.push(this.stackIn.pop());
      }
    }
    return this.stackOut[this.stackOut.length - 1];
  }

  empty() {
    return this.stackIn.length === 0 && this.stackOut.length === 0;
  }
}
```

---

#### Q17: 滑动窗口最大值 (LeetCode 239)

**答案：**
```javascript
function maxSlidingWindow(nums, k) {
  const result = [];
  const deque = [];  // 双端队列，存储下标，单调递减

  for (let i = 0; i < nums.length; i++) {
    // 移除超出窗口范围的元素
    if (deque.length && deque[0] <= i - k) {
      deque.shift();
    }

    // 维护单调递减：移除所有比当前值小的元素
    while (deque.length && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    deque.push(i);

    // 窗口形成后，记录最大值
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }

  return result;
}
```

---

## Part D: 哈希表

#### Q18: 字母异位词分组 (LeetCode 49)

**答案：**
```javascript
function groupAnagrams(strs) {
  const map = new Map();

  for (const str of strs) {
    // 方法1：排序作为 key
    const key = str.split('').sort().join('');

    // 方法2：字符计数作为 key
    // const count = new Array(26).fill(0);
    // for (const c of str) {
    //   count[c.charCodeAt(0) - 97]++;
    // }
    // const key = count.join('#');

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(str);
  }

  return Array.from(map.values());
}
```

---

#### Q19: LRU 缓存 (LeetCode 146)

**答案：**
```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();  // Map 保持插入顺序
  }

  get(key) {
    if (!this.cache.has(key)) {
      return -1;
    }
    // 移动到最新位置
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的（Map 的第一个元素）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

// 手写双向链表 + 哈希表版本
class LRUCacheAdvanced {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = { key: null, val: null, prev: null, next: null };
    this.tail = { key: null, val: null, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  _removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _moveToHead(node) {
    this._removeNode(node);
    this._addToHead(node);
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._moveToHead(node);
    return node.val;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.val = value;
      this._moveToHead(node);
    } else {
      const node = { key, val: value, prev: null, next: null };
      this.map.set(key, node);
      this._addToHead(node);

      if (this.map.size > this.capacity) {
        const lru = this.tail.prev;
        this._removeNode(lru);
        this.map.delete(lru.key);
      }
    }
  }
}
```

---

## Part E: 二叉树

### 1. 遍历

#### Q20: 二叉树的遍历 (LeetCode 144, 94, 145)

**答案：**
```javascript
// 前序遍历（根-左-右）
function preorderTraversal(root) {
  const result = [];
  const stack = [];

  while (root || stack.length) {
    while (root) {
      result.push(root.val);  // 访问根
      stack.push(root);
      root = root.left;       // 左子树
    }
    root = stack.pop();
    root = root.right;        // 右子树
  }

  return result;
}

// 中序遍历（左-根-右）
function inorderTraversal(root) {
  const result = [];
  const stack = [];

  while (root || stack.length) {
    while (root) {
      stack.push(root);
      root = root.left;       // 左子树
    }
    root = stack.pop();
    result.push(root.val);    // 访问根
    root = root.right;        // 右子树
  }

  return result;
}

// 后序遍历（左-右-根）
function postorderTraversal(root) {
  const result = [];
  const stack = [];

  while (root || stack.length) {
    while (root) {
      result.unshift(root.val);  // 前插（反向）
      stack.push(root);
      root = root.right;         // 先右
    }
    root = stack.pop();
    root = root.left;            // 再左
  }

  return result;
}

// 层序遍历
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];

  while (queue.length) {
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
```

---

#### Q21: 二叉树的最大深度 (LeetCode 104)

**答案：**
```javascript
// 递归
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// 迭代（层序遍历）
function maxDepthBFS(root) {
  if (!root) return 0;
  let depth = 0;
  const queue = [root];

  while (queue.length) {
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    depth++;
  }

  return depth;
}
```

---

#### Q22: 验证二叉搜索树 (LeetCode 98)

**答案：**
```javascript
function isValidBST(root) {
  return validate(root, -Infinity, Infinity);
}

function validate(node, min, max) {
  if (!node) return true;

  if (node.val <= min || node.val >= max) {
    return false;
  }

  return validate(node.left, min, node.val) &&
         validate(node.right, node.val, max);
}

// 中序遍历（BST 中序遍历是升序）
function isValidBSTInorder(root) {
  let prev = -Infinity;
  const stack = [];

  while (root || stack.length) {
    while (root) {
      stack.push(root);
      root = root.left;
    }
    root = stack.pop();

    if (root.val <= prev) return false;
    prev = root.val;

    root = root.right;
  }

  return true;
}
```

---

## Part F: 排序算法

### 常见排序算法对比

```
┌─────────────────────────────────────────────────────────────┐
│                    排序算法对比                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  算法        平均      最坏      最好      空间    稳定      │
│  ──────────────────────────────────────────────────────────│
│  冒泡排序    O(n²)     O(n²)     O(n)      O(1)    稳定     │
│  选择排序    O(n²)     O(n²)     O(n²)     O(1)    不稳定   │
│  插入排序    O(n²)     O(n²)     O(n)      O(1)    稳定     │
│  希尔排序    O(n^1.3)  O(n²)     O(n)      O(1)    不稳定   │
│  归并排序    O(nlogn)  O(nlogn)  O(nlogn)  O(n)    稳定     │
│  快速排序    O(nlogn)  O(n²)     O(nlogn)  O(logn) 不稳定   │
│  堆排序      O(nlogn)  O(nlogn)  O(nlogn)  O(1)    不稳定   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Q23: 快速排序

**答案：**
```javascript
function quickSort(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return;

  const pivot = partition(arr, left, right);
  quickSort(arr, left, pivot - 1);
  quickSort(arr, pivot + 1, right);

  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right];  // 选择最右边作为基准
  let i = left;

  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }

  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}
```

---

#### Q24: 归并排序

**答案：**
```javascript
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}
```

---

## 今日必刷题目清单

| 序号 | 题目 | 难度 | 分类 | 状态 |
|------|------|------|------|------|
| 1 | 两数之和 | Easy | 数组/哈希 | [ ] |
| 2 | 三数之和 | Medium | 双指针 | [ ] |
| 3 | 无重复字符的最长子串 | Medium | 滑动窗口 | [ ] |
| 4 | 反转链表 | Easy | 链表 | [ ] |
| 5 | 环形链表 II | Medium | 快慢指针 | [ ] |
| 6 | 合并两个有序链表 | Easy | 链表 | [ ] |
| 7 | 有效的括号 | Easy | 栈 | [ ] |
| 8 | LRU 缓存 | Medium | 哈希+链表 | [ ] |

---

## 复习检查清单

- [ ] 掌握双指针模板
- [ ] 掌握滑动窗口模板
- [ ] 能手写链表反转（迭代+递归）
- [ ] 理解快慢指针检测环的原理
- [ ] 能手写单调栈解决下一个更大元素
- [ ] 能手写 LRU 缓存
- [ ] 能手写快速排序
- [ ] 能手写归并排序

---

> 明日预告：Day 3 - 计算机网络基础
