# 前端测试体系

> 更新时间：2025-02

## 目录导航

- [什么是前端测试](#什么是前端测试)
- [测试类型](#测试类型)
- [单元测试](#单元测试)
- [集成测试](#集成测试)
- [E2E 测试](#e2e-测试)
- [测试工具](#测试工具)
- [最佳实践](#最佳实践)

## 什么是前端测试

前端测试是保证代码质量、减少 bug、提高开发效率的重要手段。

**测试金字塔**：
```
       /\
      /E2E\      少量 E2E 测试（慢、昂贵）
     /------\
    /集成测试\    适量集成测试（中等速度）
   /----------\
  /  单元测试  \  大量单元测试（快、便宜）
 /--------------\
```

**测试目标**：
- 发现 bug
- 保证代码质量
- 提高重构信心
- 作为文档

## 测试类型

### 1. 单元测试（Unit Testing）

测试单个函数、组件或模块。

**特点**：
- 速度快
- 隔离性好
- 易于维护
- 覆盖率高

**工具**：Jest、Vitest、Testing Library

### 2. 集成测试（Integration Testing）

测试多个模块之间的交互。

**特点**：
- 测试真实场景
- 发现接口问题
- 速度适中

**工具**：Testing Library、Cypress Component Testing

### 3. E2E 测试（End-to-End Testing）

测试完整的用户流程。

**特点**：
- 最接近真实使用
- 发现系统性问题
- 速度慢、成本高

**工具**：Playwright、Cypress、Puppeteer

## 单元测试

### 1. Jest / Vitest 基础

**安装**：
```bash
# Jest
npm install --save-dev jest @types/jest

# Vitest（推荐，更快）
npm install --save-dev vitest
```

**配置**：
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

**基础测试**：
```javascript
// sum.js
export function sum(a, b) {
  return a + b
}

// sum.test.js
import { describe, it, expect } from 'vitest'
import { sum } from './sum'

describe('sum', () => {
  it('should add two numbers', () => {
    expect(sum(1, 2)).toBe(3)
  })
  
  it('should handle negative numbers', () => {
    expect(sum(-1, -2)).toBe(-3)
  })
  
  it('should handle zero', () => {
    expect(sum(0, 0)).toBe(0)
  })
})
```

### 2. Vue 组件测试

**安装**：
```bash
npm install --save-dev @vue/test-utils
```

**基础测试**：
```javascript
// Counter.vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

// Counter.test.js
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Counter from './Counter.vue'

describe('Counter', () => {
  it('renders count', () => {
    const wrapper = mount(Counter)
    expect(wrapper.text()).toContain('Count: 0')
  })
  
  it('increments count when button clicked', async () => {
    const wrapper = mount(Counter)
    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('Count: 1')
  })
})
```

**测试 Props**：
```javascript
// UserCard.vue
<script setup>
defineProps({
  name: String,
  age: Number
})
</script>

<template>
  <div class="user-card">
    <h2>{{ name }}</h2>
    <p>Age: {{ age }}</p>
  </div>
</template>

// UserCard.test.js
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

describe('UserCard', () => {
  it('renders user info', () => {
    const wrapper = mount(UserCard, {
      props: {
        name: 'John',
        age: 25
      }
    })
    
    expect(wrapper.text()).toContain('John')
    expect(wrapper.text()).toContain('Age: 25')
  })
})
```

**测试 Events**：
```javascript
// CustomButton.vue
<script setup>
const emit = defineEmits(['click'])
</script>

<template>
  <button @click="emit('click')">
    <slot />
  </button>
</template>

// CustomButton.test.js
import { mount } from '@vue/test-utils'
import CustomButton from './CustomButton.vue'

describe('CustomButton', () => {
  it('emits click event', async () => {
    const wrapper = mount(CustomButton)
    await wrapper.trigger('click')
    
    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
```

### 3. React 组件测试

**安装**：
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**基础测试**：
```javascript
// Counter.jsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}

// Counter.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Counter } from './Counter'

describe('Counter', () => {
  it('renders count', () => {
    render(<Counter />)
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })
  
  it('increments count', () => {
    render(<Counter />)
    fireEvent.click(screen.getByText('Increment'))
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })
})
```

### 4. 测试异步代码

```javascript
// fetchUser.js
export async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

// fetchUser.test.js
import { describe, it, expect, vi } from 'vitest'
import { fetchUser } from './fetchUser'

describe('fetchUser', () => {
  it('fetches user data', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: 1, name: 'John' })
      })
    )
    
    const user = await fetchUser(1)
    
    expect(user).toEqual({ id: 1, name: 'John' })
    expect(fetch).toHaveBeenCalledWith('/api/users/1')
  })
})
```

### 5. Mock 和 Spy

```javascript
impo

    
    expect(spy).toHaveBeenCalled()
  })
})
```

## 集成测试

### 1. 测试组件交互

```javascript
// TodoList.vue
<script setup>
import { ref } from 'vue'
import TodoItem from './TodoItem.vue'

const todos = ref([])
const newTodo = ref('')

function addTodo() {
  if (newTodo.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: newTodo.value,
      done: false
    })
    newTodo.value = ''
  }
}

function toggleTodo(id) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.done = !todo.done
}
</script>

<template>
  <div>
    <input v-model="newTodo" @keyup.enter="addTodo" />
    <button @click="addTodo">Add</button>
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      @toggle="toggleTodo"
    />
  </div>
</template>

// TodoList.test.js
import { mount } from '@vue/test-utils'
import TodoList from './TodoList.vue'
import TodoItem from './TodoItem.vue'

describe('TodoList', () => {
  it('adds and toggles todo', async () => {
    const wrapper = mount(TodoList, {
      global: {
        components: { TodoItem }
      }
    })
    
    // 添加 todo
    await wrapper.find('input').setValue('Buy milk')
    await wrapper.find('button').trigger('click')
    
    // 验证添加成功
    expect(wrapper.text()).toContain('Buy milk')
    
    // 切换状态
    await wrapper.findComponent(TodoItem).trigger('click')
    
    // 验证状态改变
    expect(wrapper.findComponent(TodoItem).classes()).toContain('done')
  })
})
```

### 2. 测试路由

```javascript
// router.test.js
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import Home from './Home.vue'
import About from './About.vue'

describe('Router', () => {
  it('navigates to about page', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: Home },
        { path: '/about', component: About }
      ]
    })
    
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })
    
    await router.push('/about')
    await router.isReady()
    
    expect(wrapper.text()).toContain('About Page')
  })
})
```

### 3. 测试状态管理

```javascript
// store.test.js
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from './counter'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('increments count', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)
    
    store.increment()
    expect(store.count).toBe(1)
  })
  
  it('doubles count', () => {
    const store = useCounterStore()
    store.count = 5
    
    expect(store.doubled).toBe(10)
  })
})
```

## E2E 测试

### 1. Playwright 基础

**安装**：
```bash
npm init playwright@latest
```

**配置**：
```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
  },
})
```

**基础测试**：
```javascript
// e2e/login.spec.js
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  // 访问登录页
  await page.goto('/login')
  
  // 填写表单
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', 'password')
  
  // 点击登录
  await page.click('button[type="submit"]')
  
  // 验证跳转
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
})
```

**测试用户流程**：
```javascript
test('complete shopping flow', async ({ page }) => {
  // 1. 浏览商品
  await page.goto('/products')
  await expect(page.locator('.product')).toHaveCount(10)
  
  // 2. 添加到购物车
  await page.click('.product:first-child .add-to-cart')
  await expect(page.locator('.cart-count')).toHaveText('1')
  
  // 3. 查看购物车
  await page.click('.cart-icon')
  await expect(page).toHaveURL('/cart')
  
  // 4. 结算
  await page.click('.checkout-button')
  await page.fill('input[name="address"]', '123 Main St')
  await page.click('button[type="submit"]')
  
  // 5. 验证订单
  await expect(page).toHaveURL(/\/orders\/\d+/)
  await expect(page.locator('.order-status')).toHaveText('Pending')
})
```

### 2. Cypress 基础

**安装**：
```bash
npm install --save-dev cypress
```

**基础测试**：
```javascript
// cypress/e2e/login.cy.js
describe('Login', () => {
  it('user can login', () => {
    cy.visit('/login')
    
    cy.get('input[name="username"]').type('admin')
    cy.get('input[name="password"]').type('password')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/dashboard')
    cy.contains('h1', 'Dashboard')
  })
})
```

## 测试工具

### 1. Jest / Vitest

**特点**：
- 快速
- 零配置
- 快照测试
- 覆盖率报告

### 2. Testing Library

**特点**：
- 用户视角测试
- 鼓励最佳实践
- 框架无关

### 3. Playwright

**特点**：
- 跨浏览器
- 自动等待
- 强大的选择器
- 并行执行

### 4. Cypress

**特点**：
- 实时重载
- 时间旅行
- 自动截图
- 易于调试

## 最佳实践

### 1. 测试原则

**AAA 模式**：
```javascript
test('example', () => {
  // Arrange（准备）
  const user = { name: 'John', age: 25 }
  
  // Act（执行）
  const result = formatUser(user)
  
  // Assert（断言）
  expect(result).toBe('John (25)')
})
```

**测试命名**：
```javascript
// ✅ 好的命名
test('should return user when id exists')
test('should throw error when id is invalid')

// ❌ 不好的命名
test('test1')
test('user test')
```

### 2. 测试覆盖率

**目标**：
- 语句覆盖率：80%+
- 分支覆盖率：80%+
- 函数覆盖率：80%+
- 行覆盖率：80%+

**查看覆盖率**：
```bash
vitest --coverage
```

### 3. 测试隔离

```javascript
// ✅ 每个测试独立
describe('Counter', () => {
  it('test 1', () => {
    const counter = new Counter()
    // ...
  })
  
  it('test 2', () => {
    const counter = new Counter()
    // ...
  })
})

// ❌ 测试相互依赖
describe('Counter', () => {
  const counter = new Counter()
  
  it('test 1', () => {
    counter.increment()
  })
  
  it('test 2', () => {
    // 依赖 test 1 的结果
    expect(counter.count).toBe(1)
  })
})
```

### 4. 避免测试实现细节

```javascript
// ❌ 测试实现细节
test('counter', () => {
  const wrapper = mount(Counter)
  expect(wrapper.vm.count).toBe(0)
})

// ✅ 测试用户行为
test('counter', () => {
  const wrapper = mount(Counter)
  expect(wrapper.text()).toContain('Count: 0')
})
```

### 5. 使用测试工具函数

```javascript
// test-utils.js
export function createWrapper(component, options = {}) {
  return mount(component, {
    global: {
      plugins: [router, pinia],
      ...options.global
    },
    ...options
  })
}

// 使用
import { createWrapper } from './test-utils'

test('example', () => {
  const wrapper = createWrapper(MyComponent)
  // ...
})
```

## 参考资料

### 官方文档
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [Cypress](https://www.cypress.io/)

### 学习资源
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

> 💡 **学习建议**：前端测试是保证代码质量的重要手段。建议先学习单元测试，然后学习集成测试和 E2E 测试。重点关注测试原则、测试覆盖率、测试隔离等核心知识点。
