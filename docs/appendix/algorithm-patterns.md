# 算法模式速查

> 面试高频算法模式与代码模板
> 
> 更新时间：2025-02

## 目录

[[toc]]

## 数据结构

### 1. 数组与字符串

```python
# 双指针 - 两数之和（有序数组）
def two_sum(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return [left, right]
        elif s < target:
            left += 1
        else:
            right -= 1
    return []

# 滑动窗口 - 最长无重复子串
def length_of_longest_substring(s):
    char_set = set()
    left = max_len = 0
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_len = max(max_len, right - left + 1)
    return max_len

# 前缀和 - 子数组和等于 K
def subarray_sum(nums, k):
    prefix_sum = {0: 1}
    curr_sum = count = 0
    for num in nums:
        curr_sum += num
        if curr_sum - k in prefix_sum:
            count += prefix_sum[curr_sum - k]
        prefix_sum[curr_sum] = prefix_sum.get(curr_sum, 0) + 1
    return count
```

### 2. 链表

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# 反转链表
def reverse_list(head):
    prev, curr = None, head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev

# 检测环
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False

# 找环入口
def detect_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            ptr = head
            while ptr != slow:
                ptr = ptr.next
                slow = slow.next
            return ptr
    return None

# 合并两个有序链表
def merge_two_lists(l1, l2):
    dummy = ListNode()
    curr = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next
    curr.next = l1 or l2
    return dummy.next
```

### 3. 栈与队列

```python
# 有效括号
def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    return not stack

# 单调栈 - 下一个更大元素
def next_greater_element(nums):
    result = [-1] * len(nums)
    stack = []
    for i in range(len(nums)):
        while stack and nums[i] > nums[stack[-1]]:
            result[stack.pop()] = nums[i]
        stack.append(i)
    return result

# 最小栈
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val):
        self.stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)

    def pop(self):
        if self.stack.pop() == self.min_stack[-1]:
            self.min_stack.pop()

    def top(self):
        return self.stack[-1]

    def get_min(self):
        return self.min_stack[-1]
```

### 4. 哈希表

```python
# LRU 缓存
class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}  # key -> node
        self.head = Node()  # 哨兵头
        self.tail = Node()  # 哨兵尾
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key):
        if key in self.cache:
            node = self.cache[key]
            self._move_to_head(node)
            return node.value
        return -1

    def put(self, key, value):
        if key in self.cache:
            node = self.cache[key]
            node.value = value
            self._move_to_head(node)
        else:
            node = Node(key, value)
            self.cache[key] = node
            self._add_to_head(node)
            if len(self.cache) > self.capacity:
                removed = self._remove_tail()
                del self.cache[removed.key]

    def _add_to_head(self, node):
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def _remove_node(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _move_to_head(self, node):
        self._remove_node(node)
        self._add_to_head(node)

    def _remove_tail(self):
        node = self.tail.prev
        self._remove_node(node)
        return node

class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None
```

---

## 树与图

### 5. 二叉树遍历

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# 递归遍历
def preorder(root):  # 前序：根左右
    if not root: return []
    return [root.val] + preorder(root.left) + preorder(root.right)

def inorder(root):   # 中序：左根右
    if not root: return []
    return inorder(root.left) + [root.val] + inorder(root.right)

def postorder(root): # 后序：左右根
    if not root: return []
    return postorder(root.left) + postorder(root.right) + [root.val]

# 迭代前序
def preorder_iterative(root):
    if not root: return []
    result, stack = [], [root]
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.right: stack.append(node.right)
        if node.left: stack.append(node.left)
    return result

# 层序遍历
from collections import deque

def level_order(root):
    if not root: return []
    result, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)
    return result
```

### 6. 二叉树常见问题

```python
# 最大深度
def max_depth(root):
    if not root: return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

# 是否平衡
def is_balanced(root):
    def height(node):
        if not node: return 0
        left = height(node.left)
        right = height(node.right)
        if left == -1 or right == -1 or abs(left - right) > 1:
            return -1
        return 1 + max(left, right)
    return height(root) != -1

# 最近公共祖先
def lowest_common_ancestor(root, p, q):
    if not root or root == p or root == q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right: return root
    return left or right

# 验证二叉搜索树
def is_valid_bst(root):
    def validate(node, min_val, max_val):
        if not node: return True
        if node.val <= min_val or node.val >= max_val:
            return False
        return (validate(node.left, min_val, node.val) and
                validate(node.right, node.val, max_val))
    return validate(root, float('-inf'), float('inf'))
```

### 7. 图算法

```python
# BFS - 最短路径
from collections import deque

def bfs(graph, start, end):
    queue = deque([(start, 0)])
    visited = {start}
    while queue:
        node, dist = queue.popleft()
        if node == end:
            return dist
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, dist + 1))
    return -1

# DFS - 检测环（有向图）
def has_cycle(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)

    # 0: 未访问, 1: 访问中, 2: 已完成
    state = [0] * n

    def dfs(node):
        if state[node] == 1: return True   # 有环
        if state[node] == 2: return False  # 已处理

        state[node] = 1
        for neighbor in graph[node]:
            if dfs(neighbor):
                return True
        state[node] = 2
        return False

    return any(dfs(i) for i in range(n) if state[i] == 0)

# 拓扑排序
def topological_sort(n, edges):
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for u, v in edges:
        graph[u].append(v)
        indegree[v] += 1

    queue = deque([i for i in range(n) if indegree[i] == 0])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in graph[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)

    return result if len(result) == n else []
```

---

## 经典算法

### 8. 二分查找

```python
# 标准二分
def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# 查找左边界
def left_bound(nums, target):
    left, right = 0, len(nums)
    while left < right:
        mid = (left + right) // 2
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left

# 查找右边界
def right_bound(nums, target):
    left, right = 0, len(nums)
    while left < right:
        mid = (left + right) // 2
        if nums[mid] <= target:
            left = mid + 1
        else:
            right = mid
    return left - 1
```

### 9. 动态规划

```python
# 斐波那契
def fib(n):
    if n <= 1: return n
    dp = [0, 1]
    for i in range(2, n + 1):
        dp[0], dp[1] = dp[1], dp[0] + dp[1]
    return dp[1]

# 爬楼梯
def climb_stairs(n):
    if n <= 2: return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b

# 最长递增子序列
def length_of_lis(nums):
    if not nums: return 0
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)

# 最长公共子序列
def longest_common_subsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]

# 0-1 背包
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [0] * (capacity + 1)
    for i in range(n):
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    return dp[capacity]

# 编辑距离
def min_distance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return dp[m][n]
```

### 10. 回溯

```python
# 全排列
def permute(nums):
    result = []
    def backtrack(path, used):
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]: continue
            used[i] = True
            path.append(nums[i])
            backtrack(path, used)
            path.pop()
            used[i] = False
    backtrack([], [False] * len(nums))
    return result

# 子集
def subsets(nums):
    result = []
    def backtrack(start, path):
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()
    backtrack(0, [])
    return result

# 组合总和
def combination_sum(candidates, target):
    result = []
    def backtrack(start, path, remain):
        if remain == 0:
            result.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remain: break
            path.append(candidates[i])
            backtrack(i, path, remain - candidates[i])
            path.pop()
    candidates.sort()
    backtrack(0, [], target)
    return result

# N 皇后
def solve_n_queens(n):
    result = []
    def backtrack(row, cols, diag1, diag2, board):
        if row == n:
            result.append([''.join(r) for r in board])
            return
        for col in range(n):
            if col in cols or (row-col) in diag1 or (row+col) in diag2:
                continue
            board[row][col] = 'Q'
            backtrack(row+1, cols|{col}, diag1|{row-col}, diag2|{row+col}, board)
            board[row][col] = '.'
    backtrack(0, set(), set(), set(), [['.']*n for _ in range(n)])
    return result
```

---

## 排序算法

```python
# 快速排序
def quick_sort(arr):
    if len(arr) <= 1: return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

# 归并排序
def merge_sort(arr):
    if len(arr) <= 1: return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# 堆排序
import heapq

def heap_sort(arr):
    heapq.heapify(arr)
    return [heapq.heappop(arr) for _ in range(len(arr))]
```

---

## 复杂度速查

| 算法 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| 二分查找 | O(log n) | O(1) |
| 快速排序 | O(n log n) | O(log n) |
| 归并排序 | O(n log n) | O(n) |
| 堆排序 | O(n log n) | O(1) |
| BFS/DFS | O(V + E) | O(V) |
| 动态规划 | 取决于问题 | 取决于问题 |
| 回溯 | O(N!) | O(N) |


---

## 高级算法模式

### 11. 贪心算法

```python
# 区间调度问题
def interval_scheduling(intervals):
    """
    选择最多不重叠的区间
    贪心策略：按结束时间排序，选择最早结束的
    """
    if not intervals:
        return 0
    
    # 按结束时间排序
    intervals.sort(key=lambda x: x[1])
    count = 1
    end = intervals[0][1]
    
    for i in range(1, len(intervals)):
        if intervals[i][0] >= end:
            count += 1
            end = intervals[i][1]
    
    return count

# 跳跃游戏 II
def jump(nums):
    """
    最少跳跃次数到达终点
    贪心策略：每次跳到能到达最远的位置
    """
    jumps = 0
    current_end = 0
    farthest = 0
    
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == current_end:
            jumps += 1
            current_end = farthest
            if current_end >= len(nums) - 1:
                break
    
    return jumps

# 分发饼干
def find_content_children(g, s):
    """
    g: 孩子胃口值，s: 饼干尺寸
    贪心策略：小饼干优先满足小胃口
    """
    g.sort()
    s.sort()
    child = cookie = 0
    
    while child < len(g) and cookie < len(s):
        if s[cookie] >= g[child]:
            child += 1
        cookie += 1
    
    return child

# 加油站
def can_complete_circuit(gas, cost):
    """
    判断能否环绕一圈
    贪心策略：从油量盈余最多的站点开始
    """
    if sum(gas) < sum(cost):
        return -1
    
    start = 0
    tank = 0
    
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1
            tank = 0
    
    return start
```

---

### 12. 位运算

```python
# 位运算基础
"""
& (AND)   两位都为1才为1
| (OR)    有一位为1就为1
^ (XOR)   不同为1，相同为0
~ (NOT)   按位取反
<< (左移)  乘以2
>> (右移)  除以2

常用技巧：
n & (n-1)  消除最右边的1
n & -n     保留最右边的1
n ^ n      结果为0
n ^ 0      结果为n
"""

# 只出现一次的数字
def single_number(nums):
    """所有数字异或，相同的抵消"""
    result = 0
    for num in nums:
        result ^= num
    return result

# 2的幂
def is_power_of_two(n):
    """2的幂只有一个1"""
    return n > 0 and (n & (n - 1)) == 0

# 位1的个数
def hamming_weight(n):
    count = 0
    while n:
        n &= n - 1  # 消除最右边的1
        count += 1
    return count

# 颠倒二进制位
def reverse_bits(n):
    result = 0
    for _ in range(32):
        result = (result << 1) | (n & 1)
        n >>= 1
    return result

# 数字范围按位与
def range_bitwise_and(left, right):
    """
    找公共前缀
    [5,7] -> 101, 110, 111 -> 100
    """
    shift = 0
    while left < right:
        left >>= 1
        right >>= 1
        shift += 1
    return left << shift

# 只出现一次的数字 III
def single_number_iii(nums):
    """
    两个数字只出现一次，其他都出现两次
    """
    # 所有数字异或，得到两个单独数字的异或结果
    xor = 0
    for num in nums:
        xor ^= num
    
    # 找到异或结果中的任意一个1（两数不同的位）
    diff = xor & -xor
    
    # 根据这一位分组
    result = [0, 0]
    for num in nums:
        if num & diff:
            result[0] ^= num
        else:
            result[1] ^= num
    
    return result
```

---

### 13. 滑动窗口进阶

```python
# 最小覆盖子串
def min_window(s, t):
    """
    找到 s 中包含 t 所有字符的最小子串
    """
    from collections import Counter
    
    need = Counter(t)
    window = {}
    left = right = 0
    valid = 0
    start = 0
    min_len = float('inf')
    
    while right < len(s):
        c = s[right]
        right += 1
        
        if c in need:
            window[c] = window.get(c, 0) + 1
            if window[c] == need[c]:
                valid += 1
        
        # 收缩窗口
        while valid == len(need):
            # 更新最小子串
            if right - left < min_len:
                start = left
                min_len = right - left
            
            d = s[left]
            left += 1
            
            if d in need:
                if window[d] == need[d]:
                    valid -= 1
                window[d] -= 1
    
    return "" if min_len == float('inf') else s[start:start + min_len]

# 找到字符串中所有字母异位词
def find_anagrams(s, p):
    """
    返回 s 中所有 p 的异位词的起始索引
    """
    from collections import Counter
    
    need = Counter(p)
    window = {}
    left = right = 0
    valid = 0
    result = []
    
    while right < len(s):
        c = s[right]
        right += 1
        
        if c in need:
            window[c] = window.get(c, 0) + 1
            if window[c] == need[c]:
                valid += 1
        
        # 窗口大小固定为 len(p)
        while right - left >= len(p):
            if valid == len(need):
                result.append(left)
            
            d = s[left]
            left += 1
            
            if d in need:
                if window[d] == need[d]:
                    valid -= 1
                window[d] -= 1
    
    return result

# 无重复字符的最长子串（进阶版）
def length_of_longest_substring_k_distinct(s, k):
    """
    最多包含 k 个不同字符的最长子串
    """
    window = {}
    left = right = 0
    max_len = 0
    
    while right < len(s):
        c = s[right]
        window[c] = window.get(c, 0) + 1
        right += 1
        
        # 收缩窗口
        while len(window) > k:
            d = s[left]
            window[d] -= 1
            if window[d] == 0:
                del window[d]
            left += 1
        
        max_len = max(max_len, right - left)
    
    return max_len
```

---

### 14. 单调栈进阶

```python
# 柱状图中最大的矩形
def largest_rectangle_area(heights):
    """
    单调递增栈
    """
    stack = []
    max_area = 0
    heights = [0] + heights + [0]  # 哨兵
    
    for i in range(len(heights)):
        while stack and heights[i] < heights[stack[-1]]:
            h = heights[stack.pop()]
            w = i - stack[-1] - 1
            max_area = max(max_area, h * w)
        stack.append(i)
    
    return max_area

# 接雨水
def trap(height):
    """
    单调递减栈
    """
    stack = []
    water = 0
    
    for i in range(len(height)):
        while stack and height[i] > height[stack[-1]]:
            top = stack.pop()
            if not stack:
                break
            distance = i - stack[-1] - 1
            bounded_height = min(height[i], height[stack[-1]]) - height[top]
            water += distance * bounded_height
        stack.append(i)
    
    return water

# 去除重复字母
def remove_duplicate_letters(s):
    """
    单调递增栈 + 贪心
    """
    from collections import Counter
    
    count = Counter(s)
    stack = []
    in_stack = set()
    
    for char in s:
        count[char] -= 1
        
        if char in in_stack:
            continue
        
        # 保持字典序最小
        while stack and char < stack[-1] and count[stack[-1]] > 0:
            removed = stack.pop()
            in_stack.remove(removed)
        
        stack.append(char)
        in_stack.add(char)
    
    return ''.join(stack)
```

---

### 15. 前缀和进阶

```python
# 和为 K 的子数组（哈希表优化）
def subarray_sum(nums, k):
    """
    前缀和 + 哈希表
    时间复杂度：O(n)
    """
    prefix_sum = {0: 1}
    curr_sum = count = 0
    
    for num in nums:
        curr_sum += num
        # 查找 curr_sum - k
        if curr_sum - k in prefix_sum:
            count += prefix_sum[curr_sum - k]
        prefix_sum[curr_sum] = prefix_sum.get(curr_sum, 0) + 1
    
    return count

# 连续的子数组和
def continuous_subarray_sum(nums, k):
    """
    前缀和取模 + 哈希表
    """
    prefix_sum = {0: -1}
    curr_sum = 0
    
    for i, num in enumerate(nums):
        curr_sum += num
        if k != 0:
            curr_sum %= k
        
        if curr_sum in prefix_sum:
            if i - prefix_sum[curr_sum] > 1:
                return True
        else:
            prefix_sum[curr_sum] = i
    
    return False

# 和可被 K 整除的子数组
def subarrays_div_by_k(nums, k):
    """
    前缀和取模 + 哈希表
    """
    prefix_sum = {0: 1}
    curr_sum = count = 0
    
    for num in nums:
        curr_sum += num
        modulus = curr_sum % k
        # Python 负数取模需要调整
        if modulus < 0:
            modulus += k
        
        if modulus in prefix_sum:
            count += prefix_sum[modulus]
        prefix_sum[modulus] = prefix_sum.get(modulus, 0) + 1
    
    return count

# 二维区域和检索
class NumMatrix:
    def __init__(self, matrix):
        if not matrix or not matrix[0]:
            return
        
        m, n = len(matrix), len(matrix[0])
        self.prefix_sum = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                self.prefix_sum[i][j] = (
                    matrix[i-1][j-1] +
                    self.prefix_sum[i-1][j] +
                    self.prefix_sum[i][j-1] -
                    self.prefix_sum[i-1][j-1]
                )
    
    def sum_region(self, row1, col1, row2, col2):
        return (
            self.prefix_sum[row2+1][col2+1] -
            self.prefix_sum[row1][col2+1] -
            self.prefix_sum[row2+1][col1] +
            self.prefix_sum[row1][col1]
        )
```

---

### 16. 双指针进阶

```python
# 盛最多水的容器
def max_area(height):
    """
    双指针：从两端向中间移动
    移动较短的一端
    """
    left, right = 0, len(height) - 1
    max_water = 0
    
    while left < right:
        width = right - left
        max_water = max(max_water, min(height[left], height[right]) * width)
        
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    
    return max_water

# 三数之和（去重版）
def three_sum(nums):
    """
    排序 + 双指针
    """
    nums.sort()
    result = []
    
    for i in range(len(nums) - 2):
        # 跳过重复
        if i > 0 and nums[i] == nums[i-1]:
            continue
        
        # 剪枝
        if nums[i] > 0:
            break
        
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                # 跳过重复
                while left < right and nums[left] == nums[left+1]:
                    left += 1
                while left < right and nums[right] == nums[right-1]:
                    right -= 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    
    return result

# 四数之和
def four_sum(nums, target):
    """
    排序 + 双重循环 + 双指针
    """
    nums.sort()
    result = []
    n = len(nums)
    
    for i in range(n - 3):
        if i > 0 and nums[i] == nums[i-1]:
            continue
        
        for j in range(i + 1, n - 2):
            if j > i + 1 and nums[j] == nums[j-1]:
                continue
            
            left, right = j + 1, n - 1
            while left < right:
                total = nums[i] + nums[j] + nums[left] + nums[right]
                
                if total == target:
                    result.append([nums[i], nums[j], nums[left], nums[right]])
                    while left < right and nums[left] == nums[left+1]:
                        left += 1
                    while left < right and nums[right] == nums[right-1]:
                        right -= 1
                    left += 1
                    right -= 1
                elif total < target:
                    left += 1
                else:
                    right -= 1
    
    return result

# 移除元素（原地修改）
def remove_element(nums, val):
    """
    快慢指针
    """
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != val:
            nums[slow] = nums[fast]
            slow += 1
    return slow
```

---

## 算法复杂度分析

### 时间复杂度对比

```
复杂度        10        100       1000      10000     100000
────────────────────────────────────────────────────────────
O(1)          1         1         1         1         1
O(log n)      3         7         10        13        17
O(n)          10        100       1000      10000     100000
O(n log n)    30        700       10000     130000    1700000
O(n²)         100       10000     1000000   100000000 10000000000
O(2^n)        1024      1.27e30   -         -         -
O(n!)         3628800   -         -         -         -

数据规模与复杂度选择：
n ≤ 10:       O(n!)
n ≤ 20:       O(2^n)
n ≤ 100:      O(n³)
n ≤ 1000:     O(n²)
n ≤ 10^6:     O(n log n)
n ≤ 10^8:     O(n)
n > 10^8:     O(log n) 或 O(1)
```

### 空间复杂度优化

```python
# 1. 原地修改（O(1) 空间）
def reverse_string(s):
    left, right = 0, len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1

# 2. 滚动数组（O(1) 空间）
def fib(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# 3. 状态压缩（降维）
def unique_paths(m, n):
    # 从 O(m*n) 优化到 O(n)
    dp = [1] * n
    for i in range(1, m):
        for j in range(1, n):
            dp[j] += dp[j-1]
    return dp[n-1]
```

---

## 面试真题精选

### 1. 字节跳动

```python
# 最长公共前缀
def longest_common_prefix(strs):
    if not strs:
        return ""
    
    prefix = strs[0]
    for s in strs[1:]:
        while not s.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix

# 字符串相加
def add_strings(num1, num2):
    i, j = len(num1) - 1, len(num2) - 1
    carry = 0
    result = []
    
    while i >= 0 or j >= 0 or carry:
        n1 = int(num1[i]) if i >= 0 else 0
        n2 = int(num2[j]) if j >= 0 else 0
        total = n1 + n2 + carry
        result.append(str(total % 10))
        carry = total // 10
        i -= 1
        j -= 1
    
    return ''.join(reversed(result))
```

### 2. 腾讯

```python
# 最长回文子串
def longest_palindrome(s):
    def expand_around_center(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return right - left - 1
    
    start = end = 0
    for i in range(len(s)):
        len1 = expand_around_center(i, i)      # 奇数长度
        len2 = expand_around_center(i, i + 1)  # 偶数长度
        max_len = max(len1, len2)
        if max_len > end - start:
            start = i - (max_len - 1) // 2
            end = i + max_len // 2
    
    return s[start:end + 1]

# 岛屿数量
def num_islands(grid):
    if not grid:
        return 0
    
    def dfs(i, j):
        if i < 0 or i >= len(grid) or j < 0 or j >= len(grid[0]) or grid[i][j] != '1':
            return
        grid[i][j] = '0'  # 标记为已访问
        dfs(i + 1, j)
        dfs(i - 1, j)
        dfs(i, j + 1)
        dfs(i, j - 1)
    
    count = 0
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == '1':
                dfs(i, j)
                count += 1
    
    return count
```

### 3. 阿里巴巴

```python
# 合并区间
def merge(intervals):
    if not intervals:
        return []
    
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    
    for interval in intervals[1:]:
        if interval[0] <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], interval[1])
        else:
            merged.append(interval)
    
    return merged

# 螺旋矩阵
def spiral_order(matrix):
    if not matrix:
        return []
    
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    
    while top <= bottom and left <= right:
        # 右
        for j in range(left, right + 1):
            result.append(matrix[top][j])
        top += 1
        
        # 下
        for i in range(top, bottom + 1):
            result.append(matrix[i][right])
        right -= 1
        
        if top <= bottom:
            # 左
            for j in range(right, left - 1, -1):
                result.append(matrix[bottom][j])
            bottom -= 1
        
        if left <= right:
            # 上
            for i in range(bottom, top - 1, -1):
                result.append(matrix[i][left])
            left += 1
    
    return result
```

---

## 刷题建议

### 1. 学习路线

```
第一阶段（基础，1-2周）：
- 数组、字符串、链表
- 栈、队列、哈希表
- 简单题 50-100 道

第二阶段（进阶，2-3周）：
- 二叉树、二叉搜索树
- DFS、BFS
- 双指针、滑动窗口
- 中等题 50-100 道

第三阶段（提高，3-4周）：
- 动态规划
- 回溯算法
- 贪心算法
- 中等题 + 困难题 50-100 道

第四阶段（冲刺，1-2周）：
- 高频题复习
- 模拟面试
- 查漏补缺
```

### 2. 刷题技巧

```
✅ 先理解再动手
✅ 一题多解
✅ 总结模式
✅ 定期复习
✅ 模拟面试

❌ 直接看答案
❌ 只刷简单题
❌ 不总结规律
❌ 刷完就忘
```

### 3. 推荐题单

```
LeetCode 热题 HOT 100
LeetCode 精选 TOP 面试题
剑指 Offer 系列
按公司分类题单
按标签分类题单
```

---

## 参考资料

### 在线平台

- [LeetCode](https://leetcode.com/) - 最全面的题库
- [LeetCode 中文](https://leetcode.cn/) - 中文版
- [牛客网](https://www.nowcoder.com/) - 国内题库
- [HackerRank](https://www.hackerrank.com/) - 算法竞赛

### 学习资源

- [代码随想录](https://programmercarl.com/) - 系统学习
- [labuladong 的算法小抄](https://labuladong.github.io/algo/) - 算法模板
- [fucking-algorithm](https://github.com/labuladong/fucking-algorithm) - GitHub 开源
- [Hello 算法](https://www.hello-algo.com/) - 动画图解

### 书籍推荐

- 《剑指 Offer》- 面试必备
- 《程序员代码面试指南》- 左神力作
- 《算法图解》- 入门友好
- 《算法竞赛进阶指南》- 进阶提升
