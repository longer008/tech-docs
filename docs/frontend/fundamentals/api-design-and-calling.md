# API 设计与调用完全指南

> 更新时间：2025-02

## 目录

[[toc]]

## RESTful API 设计规范

### 1. RESTful 核心原则

```javascript
// RESTful API 设计原则
const restfulPrinciples = {
  资源导向: '使用名词表示资源，而非动词',
  统一接口: '使用标准 HTTP 方法',
  无状态: '每个请求包含所有必要信息',
  可缓存: '明确标识响应是否可缓存',
  分层系统: '客户端无需知道是否直接连接到服务器',
  按需代码: '可选，服务器可以返回可执行代码'
}

// 资源命名规范
const namingConventions = {
  // ✅ 好的命名
  good: [
    'GET /users',           // 获取用户列表
    'GET /users/123',       // 获取单个用户
    'POST /users',          // 创建用户
    'PUT /users/123',       // 更新用户（完整）
    'PATCH /users/123',     // 更新用户（部分）
    'DELETE /users/123',    // 删除用户
    'GET /users/123/posts', // 获取用户的文章
  ],
  
  // ❌ 不好的命名
  bad: [
    'GET /getUsers',        // 不要使用动词
    'POST /createUser',     // 不要使用动词
    'GET /user',            // 单数形式不清晰
    'GET /users/delete/123' // 不要在 URL 中使用动词
  ]
}
```

### 2. HTTP 方法使用

```javascript
// HTTP 方法语义
const httpMethods = {
  GET: {
    用途: '获取资源',
    幂等: true,
    安全: true,
    示例: [
      'GET /users',
      'GET /users/123',
      'GET /users?page=1&size=10'
    ]
  },
  
  POST: {
    用途: '创建资源',
    幂等: false,
    安全: false,
    示例: [
      'POST /users',
      'POST /users/123/posts'
    ]
  },
  
  PUT: {
    用途: '完整更新资源',
    幂等: true,
    安全: false,
    示例: [
      'PUT /users/123'
    ],
    注意: '需要提供完整的资源数据'
  },
  
  PATCH: {
    用途: '部分更新资源',
    幂等: true,
    安全: false,
    示例: [
      'PATCH /users/123'
    ],
    注意: '只需提供要更新的字段'
  },
  
  DELETE: {
    用途: '删除资源',
    幂等: true,
    安全: false,
    示例: [
      'DELETE /users/123'
    ]
  }
}

// 实际示例
class UserAPI {
  constructor(baseURL) {
    this.baseURL = baseURL
  }
  
  // GET - 获取用户列表
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString()
    const response = await fetch(`${this.baseURL}/users?${query}`)
    return response.json()
  }
  
  // GET - 获取单个用户
  async getUser(id) {
    const response = await fetch(`${this.baseURL}/users/${id}`)
    return response.json()
  }
  
  // POST - 创建用户
  async createUser(data) {
    const response = await fetch(`${this.baseURL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }
  
  // PUT - 完整更新用户
  async updateUser(id, data) {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }
  
  // PATCH - 部分更新用户
  async patchUser(id, data) {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }
  
  // DELETE - 删除用户
  async deleteUser(id) {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      method: 'DELETE'
    })
    return response.json()
  }
}
```

### 3. 状态码使用

```javascript
// HTTP 状态码规范
const statusCodes = {
  // 2xx 成功
  '200': { name: 'OK', 用途: 'GET、PUT、PATCH 成功' },
  '201': { name: 'Created', 用途: 'POST 创建成功' },
  '204': { name: 'No Content', 用途: 'DELETE 成功，无返回内容' },
  
  // 3xx 重定向
  '301': { name: 'Moved Permanently', 用途: '永久重定向' },
  '302': { name: 'Found', 用途: '临时重定向' },
  '304': { name: 'Not Modified', 用途: '资源未修改，使用缓存' },
  
  // 4xx 客户端错误
  '400': { name: 'Bad Request', 用途: '请求参数错误' },
  '401': { name: 'Unauthorized', 用途: '未认证' },
  '403': { name: 'Forbidden', 用途: '无权限' },
  '404': { name: 'Not Found', 用途: '资源不存在' },
  '409': { name: 'Conflict', 用途: '资源冲突' },
  '422': { name: 'Unprocessable Entity', 用途: '验证失败' },
  '429': { name: 'Too Many Requests', 用途: '请求过多' },
  
  // 5xx 服务器错误
  '500': { name: 'Internal Server Error', 用途: '服务器内部错误' },
  '502': { name: 'Bad Gateway', 用途: '网关错误' },
  '503': { name: 'Service Unavailable', 用途: '服务不可用' },
  '504': { name: 'Gateway Timeout', 用途: '网关超时' }
}

// 错误响应格式
const errorResponse = {
  // 标准错误格式
  standard: {
    error: {
      code: 'VALIDATION_ERROR',
      message: '验证失败',
      details: [
        { field: 'email', message: '邮箱格式不正确' },
        { field: 'password', message: '密码长度至少 8 位' }
      ]
    }
  },
  
  // RFC 7807 Problem Details
  rfc7807: {
    type: 'https://example.com/errors/validation-error',
    title: '验证失败',
    status: 422,
    detail: '请求数据验证失败',
    instance: '/users/123',
    errors: [
      { field: 'email', message: '邮箱格式不正确' }
    ]
  }
}
```

### 4. 版本控制

```javascript
// API 版本控制方案
const versioningStrategies = {
  // 方案 1：URL 路径版本
  urlPath: {
    示例: [
      'https://api.example.com/v1/users',
      'https://api.example.com/v2/users'
    ],
    优点: '清晰、易于理解',
    缺点: 'URL 变化，缓存失效'
  },
  
  // 方案 2：查询参数版本
  queryParam: {
    示例: [
      'https://api.example.com/users?version=1',
      'https://api.example.com/users?version=2'
    ],
    优点: 'URL 不变',
    缺点: '不够直观'
  },
  
  // 方案 3：请求头版本
  header: {
    示例: [
      'Accept: application/vnd.example.v1+json',
      'Accept: application/vnd.example.v2+json'
    ],
    优点: 'URL 不变，符合 REST 原则',
    缺点: '不够直观，调试困难'
  },
  
  // 方案 4：内容协商
  contentNegotiation: {
    示例: [
      'Accept: application/json; version=1',
      'Accept: application/json; version=2'
    ],
    优点: '灵活',
    缺点: '复杂'
  }
}

// 推荐：URL 路径版本
class APIClient {
  constructor(baseURL, version = 'v1') {
    this.baseURL = `${baseURL}/${version}`
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, options)
    return response.json()
  }
}

// 使用示例
const apiV1 = new APIClient('https://api.example.com', 'v1')
const apiV2 = new APIClient('https://api.example.com', 'v2')

await apiV1.request('/users')
await apiV2.request('/users')
```

### 5. 分页、过滤、排序

```javascript
// 分页参数设计
const paginationDesign = {
  // 方案 1：基于页码
  pageNumber: {
    请求: 'GET /users?page=1&size=20',
    响应: {
      data: [],
      pagination: {
        page: 1,
        size: 20,
        total: 100,
        totalPages: 5
      }
    }
  },
  
  // 方案 2：基于游标
  cursor: {
    请求: 'GET /users?cursor=abc123&limit=20',
    响应: {
      data: [],
      pagination: {
        nextCursor: 'def456',
        hasMore: true
      }
    },
    优点: '适合实时数据、性能好',
    缺点: '无法跳页'
  },
  
  // 方案 3：基于偏移量
  offset: {
    请求: 'GET /users?offset=20&limit=20',
    响应: {
      data: [],
      pagination: {
        offset: 20,
        limit: 20,
        total: 100
      }
    }
  }
}

// 过滤参数设计
const filteringDesign = {
  // 简单过滤
  simple: 'GET /users?status=active&role=admin',
  
  // 复杂过滤
  complex: 'GET /users?filter[status]=active&filter[role]=admin',
  
  // 范围过滤
  range: 'GET /users?age[gte]=18&age[lte]=30',
  
  // 搜索
  search: 'GET /users?q=john&fields=name,email'
}

// 排序参数设计
const sortingDesign = {
  // 单字段排序
  single: 'GET /users?sort=name',
  
  // 降序排序
  desc: 'GET /users?sort=-name',
  
  // 多字段排序
  multiple: 'GET /users?sort=name,-createdAt'
}

// 完整示例
class UserListAPI {
  constructor(baseURL) {
    this.baseURL = baseURL
  }
  
  async getUsers(options = {}) {
    const {
      page = 1,
      size = 20,
      sort = 'createdAt',
      order = 'desc',
      filters = {}
    } = options
    
    // 构建查询参数
    const params = new URLSearchParams({
      page,
      size,
      sort: order === 'desc' ? `-${sort}` : sort
    })
    
    // 添加过滤参数
    Object.entries(filters).forEach(([key, value]) => {
      params.append(`filter[${key}]`, value)
    })
    
    const response = await fetch(`${this.baseURL}/users?${params}`)
    return response.json()
  }
}

// 使用示例
const api = new UserListAPI('https://api.example.com')

const result = await api.getUsers({
  page: 1,
  size: 20,
  sort: 'name',
  order: 'asc',
  filters: {
    status: 'active',
    role: 'admin'
  }
})
```

## API 请求封装

### 1. Axios 封装

```javascript
// Axios 请求封装
import axios from 'axios'

class APIClient {
  constructor(config = {}) {
    this.instance = axios.create({
      baseURL: config.baseURL || '/api',
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    })
    
    this.setupInterceptors()
  }
  
  // 设置拦截器
  setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加 token
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // 添加请求 ID
        config.headers['X-Request-ID'] = this.generateRequestId()
        
        // 添加时间戳（防止缓存）
        if (config.method === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now()
          }
        }
        
        console.log('请求:', config.method.toUpperCase(), config.url)
        
        return config
      },
      (error) => {
        console.error('请求错误:', error)
        return Promise.reject(error)
      }
    )
    
    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        console.log('响应:', response.status, response.config.url)
        
        // 统一处理响应数据
        const { data, code, message } = response.data
        
        if (code === 0 || code === 200) {
          return data
        } else {
          return Promise.reject(new Error(message || '请求失败'))
        }
      },
      (error) => {
        console.error('响应错误:', error)
        
        // 统一错误处理
        if (error.response) {
          const { status, data } = error.response
          
          switch (status) {
            case 401:
              // 未认证，跳转登录
              this.handleUnauthorized()
              break
            case 403:
              // 无权限
              this.handleForbidden()
              break
            case 404:
              // 资源不存在
              this.handleNotFound()
              break
            case 500:
              // 服务器错误
              this.handleServerError()
              break
            default:
              this.handleError(data?.message || '请求失败')
          }
        } else if (error.request) {
          // 请求已发送但没有收到响应
          this.handleNetworkError()
        } else {
          // 请求配置错误
          this.handleError(error.message)
        }
        
        return Promise.reject(error)
      }
    )
  }
  
  // 生成请求 ID
  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  // 错误处理方法
  handleUnauthorized() {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
  
  handleForbidden() {
    console.error('无权限访问')
  }
  
  handleNotFound() {
    console.error('资源不存在')
  }
  
  handleServerError() {
    console.error('服务器错误')
  }
  
  handleNetworkError() {
    console.error('网络错误')
  }
  
  handleError(message) {
    console.error(message)
  }
  
  // 请求方法
  get(url, params, config) {
    return this.instance.get(url, { params, ...config })
  }
  
  post(url, data, config) {
    return this.instance.post(url, data, config)
  }
  
  put(url, data, config) {
    return this.instance.put(url, data, config)
  }
  
  patch(url, data, config) {
    return this.instance.patch(url, data, config)
  }
  
  delete(url, config) {
    return this.instance.delete(url, config)
  }
}

// 创建实例
const api = new APIClient({
  baseURL: 'https://api.example.com',
  timeout: 10000
})

// 使用示例
export default api
```

### 2. Fetch 封装

```javascript
// Fetch 请求封装
class FetchClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '/api'
    this.timeout = config.timeout || 10000
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers
    }
  }
  
  // 请求方法
  async request(url, options = {}) {
    const {
      method = 'GET',
      params,
      data,
      headers = {},
      ...restOptions
    } = options
    
    // 构建完整 URL
    let fullURL = `${this.baseURL}${url}`
    
    // 添加查询参数
    if (params) {
      const query = new URLSearchParams(params).toString()
      fullURL += `?${query}`
    }
    
    // 构建请求配置
    const config = {
      method,
      headers: {
        ...this.headers,
        ...headers
      },
      ...restOptions
    }
    
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求体
    if (data) {
      config.body = JSON.stringify(data)
    }
    
    try {
      // 添加超时控制
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      config.signal = controller.signal
      
      // 发送请求
      const response = await fetch(fullURL, config)
      
      clearTimeout(timeoutId)
      
      // 处理响应
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      return result
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时')
      }
      throw error
    }
  }
  
  // 便捷方法
  get(url, params, options) {
    return this.request(url, { method: 'GET', params, ...options })
  }
  
  post(url, data, options) {
    return this.request(url, { method: 'POST', data, ...options })
  }
  
  put(url, data, options) {
    return this.request(url, { method: 'PUT', data, ...options })
  }
  
  patch(url, data, options) {
    return this.request(url, { method: 'PATCH', data, ...options })
  }
  
  delete(url, options) {
    return this.request(url, { method: 'DELETE', ...options })
  }
}

// 创建实例
const api = new FetchClient({
  baseURL: 'https://api.example.com',
  timeout: 10000
})

// 使用示例
export default api
```


## 请求重试与取消

### 1. 请求重试

```javascript
// 请求重试策略
class RetryStrategy {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3
    this.retryDelay = options.retryDelay || 1000
    this.retryCondition = options.retryCondition || this.defaultRetryCondition
  }
  
  // 默认重试条件
  defaultRetryCondition(error) {
    // 网络错误或 5xx 错误才重试
    return !error.response || (error.response.status >= 500 && error.response.status < 600)
  }
  
  // 执行重试
  async execute(fn, retries = 0) {
    try {
      return await fn()
    } catch (error) {
      // 检查是否应该重试
      if (retries < this.maxRetries && this.retryCondition(error)) {
        // 计算延迟时间（指数退避）
        const delay = this.retryDelay * Math.pow(2, retries)
        
        console.log(`请求失败，${delay}ms 后重试 (${retries + 1}/${this.maxRetries})`)
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay))
        
        return this.execute(fn, retries + 1)
      }
      
      throw error
    }
  }
}

// 使用示例
const retryStrategy = new RetryStrategy({
  maxRetries: 3,
  retryDelay: 1000
})

async function fetchWithRetry(url) {
  return retryStrategy.execute(async () => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  })
}

// 使用
try {
  const data = await fetchWithRetry('/api/data')
  console.log('数据:', data)
} catch (error) {
  console.error('请求失败:', error)
}
```

### 2. 请求取消

```javascript
// 请求取消管理器
class RequestCanceller {
  constructor() {
    this.pendingRequests = new Map()
  }
  
  // 创建可取消的请求
  createCancellableRequest(key, requestFn) {
    // 取消之前的同名请求
    this.cancel(key)
    
    // 创建 AbortController
    const controller = new AbortController()
    
    // 保存到 pending 列表
    this.pendingRequests.set(key, controller)
    
    // 执行请求
    const promise = requestFn(controller.signal)
      .finally(() => {
        // 请求完成后移除
        this.pendingRequests.delete(key)
      })
    
    return promise
  }
  
  // 取消指定请求
  cancel(key) {
    const controller = this.pendingRequests.get(key)
    if (controller) {
      controller.abort()
      this.pendingRequests.delete(key)
    }
  }
  
  // 取消所有请求
  cancelAll() {
    this.pendingRequests.forEach(controller => controller.abort())
    this.pendingRequests.clear()
  }
}

// 使用示例
const canceller = new RequestCanceller()

// 搜索功能（取消之前的搜索请求）
async function search(keyword) {
  return canceller.createCancellableRequest('search', async (signal) => {
    const response = await fetch(`/api/search?q=${keyword}`, { signal })
    return response.json()
  })
}

// 用户输入时触发搜索
let searchTimeout
input.addEventListener('input', (e) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      const results = await search(e.target.value)
      console.log('搜索结果:', results)
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('搜索已取消')
      } else {
        console.error('搜索失败:', error)
      }
(this.running >= this.concurrency || this.queue.length === 0) {
      return
    }
    
    this.running++
    
    const { requestFn, resolve, reject } = this.queue.shift()
    
    try {
      const result = await requestFn()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      this.running--
      this.process()
    }
  }
}

// 使用示例
const queue = new RequestQueue({ concurrency: 3 })

// 批量请求
const urls = [
  '/api/data1',
  '/api/data2',
  '/api/data3',
  '/api/data4',
  '/api/data5'
]

const promises = urls.map(url => 
  queue.add(() => fetch(url).then(res => res.json()))
)

const results = await Promise.all(promises)
console.log('所有请求完成:', results)
```

## 接口 Mock

### 1. Mock.js

```javascript
// 使用 Mock.js
import Mock from 'mockjs'

// 定义 Mock 数据
Mock.mock('/api/users', 'get', {
  code: 0,
  message: 'success',
  'data|10': [{
    'id|+1': 1,
    'name': '@cname',
    'email': '@email',
    'age|18-60': 1,
    'avatar': '@image("200x200")',
    'createdAt': '@datetime'
  }]
})

Mock.mock('/api/users/:id', 'get', (options) => {
  const id = options.url.match(/\/api\/users\/(\d+)/)[1]
  
  return {
    code: 0,
    message: 'success',
    data: {
      id: parseInt(id),
      name: Mock.Random.cname(),
      email: Mock.Random.email(),
      age: Mock.Random.integer(18, 60),
      avatar: Mock.Random.image('200x200'),
      createdAt: Mock.Random.datetime()
    }
  }
})

Mock.mock('/api/users', 'post', (options) => {
  const body = JSON.parse(options.body)
  
  return {
    code: 0,
    message: 'success',
    data: {
      id: Mock.Random.integer(1, 1000),
      ...body,
      createdAt: Mock.Random.datetime()
    }
  }
})

// 使用
async function getUsers() {
  const response = await fetch('/api/users')
  const data = await response.json()
  console.log('用户列表:', data)
}
```

### 2. MSW (Mock Service Worker)

```javascript
// 使用 MSW
import { setupWorker, rest } from 'msw'

// 定义 Mock 处理器
const handlers = [
  // GET 请求
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        message: 'success',
        data: [
          { id: 1, name: '张三', email: 'zhangsan@example.com' },
          { id: 2, name: '李四', email: 'lisi@example.com' }
        ]
      })
    )
  }),
  
  // GET 单个资源
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params
    
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        message: 'success',
        data: {
          id: parseInt(id),
          name: '张三',
          email: 'zhangsan@example.com'
        }
      })
    )
  }),
  
  // POST 请求
  rest.post('/api/users', async (req, res, ctx) => {
    const body = await req.json()
    
    return res(
      ctx.status(201),
      ctx.json({
        code: 0,
        message: 'success',
        data: {
          id: Math.floor(Math.random() * 1000),
          ...body,
          createdAt: new Date().toISOString()
        }
      })
    )
  }),
  
  // 模拟延迟
  rest.get('/api/slow', (req, res, ctx) => {
    return res(
      ctx.delay(2000), // 延迟 2 秒
      ctx.status(200),
      ctx.json({ message: '慢速响应' })
    )
  }),
  
  // 模拟错误
  rest.get('/api/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        code: 500,
        message: '服务器错误'
      })
    )
  })
]

// 启动 Service Worker
const worker = setupWorker(...handlers)

// 在开发环境启动
if (process.env.NODE_ENV === 'development') {
  worker.start()
}
```

### 3. 本地 Mock 服务器

```javascript
// 使用 json-server
// 安装: npm install -g json-server

// db.json
{
  "users": [
    { "id": 1, "name": "张三", "email": "zhangsan@example.com" },
    { "id": 2, "name": "李四", "email": "lisi@example.com" }
  ],
  "posts": [
    { "id": 1, "title": "文章1", "userId": 1 },
    { "id": 2, "title": "文章2", "userId": 2 }
  ]
}

// 启动服务器
// json-server --watch db.json --port 3000

// 自动生成的 API
// GET    /users
// GET    /users/1
// POST   /users
// PUT    /users/1
// PATCH  /users/1
// DELETE /users/1

// 支持过滤、分页、排序
// GET /users?name=张三
// GET /users?_page=1&_limit=10
// GET /users?_sort=name&_order=asc
```

## API 文档

### 1. OpenAPI (Swagger)

```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: 用户 API
  version: 1.0.0
  description: 用户管理 API

servers:
  - url: https://api.example.com/v1
    description: 生产环境
  - url: https://api-dev.example.com/v1
    description: 开发环境

paths:
  /users:
    get:
      summary: 获取用户列表
      tags:
        - Users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: size
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                  message:
                    type: string
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
    
    post:
      summary: 创建用户
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: 创建成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                  message:
                    type: string
                  data:
                    $ref: '#/components/schemas/User'

  /users/{id}:
    get:
      summary: 获取单个用户
      tags:
        - Users
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                  message:
                    type: string
                  data:
                    $ref: '#/components/schemas/User'
        '404':
          description: 用户不存在

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
          format: email
        createdAt:
          type: string
          format: date-time
    
    CreateUserRequest:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 50
        email:
          type: string
          format: email
```

### 2. 使用 Swagger UI

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>API 文档</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  
  <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/openapi.yaml',
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ]
    })
  </script>
</body>
</html>
```

### 3. 从代码生成文档

```javascript
// 使用 JSDoc 注释
/**
 * @swagger
 * /users:
 *   get:
 *     summary: 获取用户列表
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
app.get('/users', async (req, res) => {
  const { page = 1, size = 20 } = req.query
  const users = await User.findAll({ limit: size, offset: (page - 1) * size })
  res.json({ code: 0, data: users })
})

// 使用 swagger-jsdoc 生成文档
const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API 文档',
      version: '1.0.0'
    }
  },
  apis: ['./routes/*.js']
}

const specs = swaggerJsdoc(options)
```

## 最佳实践

### 1. API 设计清单

```javascript
const apiDesignChecklist = {
  命名规范: [
    '✅ 使用名词表示资源',
    '✅ 使用复数形式',
    '✅ 使用小写字母和连字符',
    '❌ 不要使用动词'
  ],
  
  HTTP方法: [
    '✅ GET 获取资源',
    '✅ POST 创建资源',
    '✅ PUT 完整更新',
    '✅ PATCH 部分更新',
    '✅ DELETE 删除资源'
  ],
  
  状态码: [
    '✅ 2xx 成功',
    '✅ 4xx 客户端错误',
    '✅ 5xx 服务器错误'
  ],
  
  响应格式: [
    '✅ 统一的响应结构',
    '✅ 包含错误信息',
    '✅ 包含分页信息'
  ],
  
  安全性: [
    '✅ 使用 HTTPS',
    '✅ 实现认证授权',
    '✅ 输入验证',
    '✅ 限流'
  ],
  
  文档: [
    '✅ 提供 API 文档',
    '✅ 包含示例',
    '✅ 保持更新'
  ]
}
```

### 2. 错误处理

```javascript
// 统一错误处理
class APIError extends Error {
  constructor(code, message, details) {
    super(message)
    this.code = code
    this.details = details
  }
}

// 错误码定义
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SERVER_ERROR: 'SERVER_ERROR'
}

// 错误处理中间件（Express）
app.use((error, req, res, next) => {
  if (error instanceof APIError) {
    res.status(getStatusCode(error.code)).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    })
  } else {
    res.status(500).json({
      error: {
        code: ErrorCodes.SERVER_ERROR,
        message: '服务器内部错误'
      }
    })
  }
})

function getStatusCode(code) {
  const statusMap = {
    [ErrorCodes.VALIDATION_ERROR]: 422,
    [ErrorCodes.NOT_FOUND]: 404,
    [ErrorCodes.UNAUTHORIZED]: 401,
    [ErrorCodes.FORBIDDEN]: 403,
    [ErrorCodes.SERVER_ERROR]: 500
  }
  return statusMap[code] || 500
}
```

### 3. 性能优化

```javascript
// API 性能优化策略
const performanceOptimization = {
  缓存: {
    HTTP缓存: 'Cache-Control, ETag',
    应用缓存: 'Redis, Memcached',
    CDN缓存: 'CloudFlare, AWS CloudFront'
  },
  
  压缩: {
    Gzip: '文本压缩',
    Brotli: '更好的压缩率'
  },
  
  分页: {
    基于游标: '适合实时数据',
    基于页码: '适合静态数据'
  },
  
  字段过滤: {
    fields参数: 'GET /users?fields=id,name',
    GraphQL: '灵活查询'
  },
  
  批量操作: {
    批量获取: 'GET /users?ids=1,2,3',
    批量创建: 'POST /users (数组)'
  },
  
  异步处理: {
    长时间任务: '返回任务 ID，轮询状态',
    WebHook: '任务完成后回调'
  }
}
```

## 常见问题

### 1. PUT vs PATCH 如何选择？

- PUT：完整更新，需要提供所有字段
- PATCH：部分更新，只需提供要更新的字段

### 2. 如何实现 API 版本控制？

推荐使用 URL 路径版本：`/v1/users`、`/v2/users`

### 3. 如何处理大文件上传？

- 使用分片上传
- 使用 multipart/form-data
- 返回上传进度

### 4. 如何实现 API 限流？

- 使用 Token Bucket 算法
- 使用 Redis 记录请求次数
- 返回 429 状态码和 Retry-After 头

## 面试要点

### 核心概念

1. **RESTful API 设计原则**
   - 资源导向、统一接口、无状态
   - HTTP 方法语义
   - 状态码使用

2. **API 请求封装**
   - 拦截器（请求/响应）
   - 错误处理
   - 重试策略

3. **接口 Mock**
   - Mock.js、MSW
   - 本地 Mock 服务器
   - 开发环境隔离

### 实战经验

1. **如何设计 RESTful API？**
   - 资源命名规范
   - HTTP 方法选择
   - 状态码使用
   - 响应格式统一

2. **如何处理 API 错误？**
   - 统一错误格式
   - 错误码定义
   - 错误拦截器
   - 用户友好提示

3. **如何优化 API 性能？**
   - 缓存策略
   - 压缩
   - 分页
   - 批量操作

## 参考资料

### 官方文档
- [RESTful API 设计指南](https://restfulapi.net/)
- [HTTP 状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Axios](https://axios-http.com/)

### 工具库
- [Axios](https://github.com/axios/axios) - HTTP 客户端
- [Mock.js](http://mockjs.com/) - 数据 Mock
- [MSW](https://mswjs.io/) - Mock Service Worker
- [json-server](https://github.com/typicode/json-server) - Mock 服务器

### 学习资源
- [RESTful API 最佳实践](https://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api)
- [API 设计指南 - Google](https://cloud.google.com/apis/design)
- [HTTP API 设计指南](https://github.com/interagent/http-api-design)

---

> 💡 **提示**：良好的 API 设计是前后端协作的基础，遵循 RESTful 规范可以提高 API 的可维护性和可扩展性。
