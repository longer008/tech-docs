# 前端安全面试题集

> Web 安全攻防与高频面试题

## A. 面试宝典

### 基础题

#### 1. XSS（跨站脚本攻击）

```
┌─────────────────────────────────────────────────────────────┐
│                    XSS 攻击类型                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 存储型 XSS（Stored XSS）                               │
│     ──────────────────────────────────────────────────────│
│     攻击脚本存储在服务器数据库                              │
│     用户访问页面时自动执行                                  │
│     危害最大：评论、用户资料等场景                          │
│                                                              │
│     攻击者 ──▶ 服务器（存储恶意脚本）                      │
│                    │                                        │
│                    ▼                                        │
│     受害者 ◀── 服务器 ──▶ 执行脚本                        │
│                                                              │
│  2. 反射型 XSS（Reflected XSS）                            │
│     ──────────────────────────────────────────────────────│
│     恶意脚本通过 URL 参数传递                               │
│     服务器将其反射到响应中                                  │
│     需要诱导用户点击恶意链接                                │
│                                                              │
│     https://example.com/search?q=<script>alert(1)</script>│
│                                                              │
│  3. DOM 型 XSS（DOM-based XSS）                            │
│     ──────────────────────────────────────────────────────│
│     完全在客户端发生                                        │
│     JavaScript 动态修改 DOM 时注入恶意代码                  │
│     不经过服务器                                            │
│                                                              │
│     document.innerHTML = location.hash.slice(1);           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**XSS 防御：**
```javascript
// 1. 输出编码（最重要）
function escapeHTML(str) {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return str.replace(/[&<>"'/]/g, char => escapeMap[char]);
}

// 使用
element.textContent = userInput;  // 安全
element.innerHTML = escapeHTML(userInput);  // 需要编码

// 2. CSP（内容安全策略）
// HTTP 头
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.com

// meta 标签
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'">

// 3. HttpOnly Cookie
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict

// 4. 使用安全的 API
// 避免
element.innerHTML = userInput;
document.write(userInput);
eval(userInput);

// 推荐
element.textContent = userInput;
element.setAttribute('data-value', userInput);

// 5. Vue/React 自动转义
// Vue（自动转义）
<div>{{ userInput }}</div>
// 危险（慎用）
<div v-html="userInput"></div>

// React（自动转义）
<div>{userInput}</div>
// 危险（慎用）
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

---

#### 2. CSRF（跨站请求伪造）

```
┌─────────────────────────────────────────────────────────────┐
│                    CSRF 攻击原理                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 用户登录银行网站，获得 Cookie                           │
│                                                              │
│  2. 用户访问恶意网站                                        │
│                                                              │
│  3. 恶意网站包含：                                          │
│     <img src="https://bank.com/transfer?to=hacker&amount=1000">│
│                                                              │
│  4. 浏览器自动携带银行 Cookie 发送请求                      │
│                                                              │
│  5. 银行服务器执行转账（用户不知情）                        │
│                                                              │
│  关键条件：                                                 │
│  - 用户已登录目标网站                                       │
│  - Cookie 自动发送                                          │
│  - 请求可被伪造（GET/POST）                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**CSRF 防御：**
```javascript
// 1. CSRF Token
// 服务端生成 Token，存储在 session
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="{{ csrfToken }}">
  <input type="text" name="amount">
  <button type="submit">Transfer</button>
</form>

// 前端获取并携带 Token
const token = document.querySelector('meta[name="csrf-token"]').content;
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': token
  },
  body: JSON.stringify(data)
});

// 2. SameSite Cookie
Set-Cookie: session=abc; SameSite=Strict; Secure; HttpOnly

// SameSite 值：
// Strict: 完全禁止跨站发送
// Lax: 允许 GET 导航请求
// None: 允许跨站（需配合 Secure）

// 3. 验证 Referer/Origin
// 服务端检查请求来源
const origin = req.headers.origin || req.headers.referer;
if (!origin || !origin.startsWith('https://example.com')) {
  return res.status(403).send('Forbidden');
}

// 4. 双重 Cookie 验证
// 将 CSRF Token 同时放在 Cookie 和请求头/参数中
// 服务端对比两者是否一致
```

---

#### 3. 点击劫持（Clickjacking）

```
┌─────────────────────────────────────────────────────────────┐
│                    点击劫持原理                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  攻击者创建恶意页面：                                       │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  恶意页面（可见）                                    │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │                                             │   │   │
│  │  │  "点击领取奖品"                             │   │   │
│  │  │  [  按钮  ]  ← 用户看到的按钮              │   │   │
│  │  │                                             │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  透明 iframe（目标网站）  opacity: 0       │   │   │
│  │  │  [转账确认]  ← 实际被点击的按钮            │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**防御措施：**
```javascript
// 1. X-Frame-Options（HTTP 头）
X-Frame-Options: DENY           // 禁止所有 iframe
X-Frame-Options: SAMEORIGIN     // 只允许同源
X-Frame-Options: ALLOW-FROM uri // 允许指定来源（已废弃）

// 2. CSP frame-ancestors
Content-Security-Policy: frame-ancestors 'none';
Content-Security-Policy: frame-ancestors 'self';
Content-Security-Policy: frame-ancestors 'self' https://trusted.com;

// 3. JavaScript 防御（兜底）
if (window.top !== window.self) {
  window.top.location = window.self.location;
}

// 或隐藏内容
<style>
  html { display: none; }
</style>
<script>
  if (self === top) {
    document.documentElement.style.display = 'block';
  } else {
    top.location = self.location;
  }
</script>
```

---

#### 4. SQL 注入（前端视角）

```
┌─────────────────────────────────────────────────────────────┐
│                    SQL 注入示例                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  用户输入: ' OR '1'='1                                      │
│                                                              │
│  后端拼接 SQL:                                              │
│  SELECT * FROM users WHERE name = '' OR '1'='1'             │
│                                                              │
│  结果: 返回所有用户数据                                     │
│                                                              │
│  更危险的注入:                                              │
│  '; DROP TABLE users; --                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**前端防御（辅助）：**
```javascript
// 1. 输入验证
function validateUsername(input) {
  // 只允许字母数字
  return /^[a-zA-Z0-9]+$/.test(input);
}

// 2. 输入长度限制
<input type="text" maxlength="20" pattern="[a-zA-Z0-9]+">

// 3. 前端编码（仅辅助，后端必须做）
function sanitizeInput(str) {
  return str.replace(/['"\\]/g, '\\$&');
}

// 重点：真正的防御在后端
// 使用参数化查询
// 使用 ORM
// 最小权限原则
```

---

### 进阶题

#### 5. 安全 HTTP 头

```
┌─────────────────────────────────────────────────────────────┐
│                    安全 HTTP 头                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Content-Security-Policy（CSP）                             │
│  ──────────────────────────────────────────────────────────│
│  default-src 'self';                    // 默认只允许同源   │
│  script-src 'self' 'unsafe-inline';     // 脚本来源        │
│  style-src 'self' 'unsafe-inline';      // 样式来源        │
│  img-src 'self' data: https:;           // 图片来源        │
│  connect-src 'self' https://api.example.com; // 请求来源  │
│  frame-ancestors 'none';                // 禁止 iframe     │
│  report-uri /csp-report;                // 违规报告        │
│                                                              │
│  Strict-Transport-Security（HSTS）                         │
│  ──────────────────────────────────────────────────────────│
│  max-age=31536000; includeSubDomains; preload              │
│  强制 HTTPS，防止降级攻击                                   │
│                                                              │
│  X-Content-Type-Options                                    │
│  ──────────────────────────────────────────────────────────│
│  nosniff                                                   │
│  防止 MIME 类型嗅探                                        │
│                                                              │
│  X-Frame-Options                                           │
│  ──────────────────────────────────────────────────────────│
│  DENY | SAMEORIGIN                                         │
│  防止点击劫持                                               │
│                                                              │
│  X-XSS-Protection（已废弃，用 CSP）                        │
│  ──────────────────────────────────────────────────────────│
│  1; mode=block                                             │
│                                                              │
│  Referrer-Policy                                           │
│  ──────────────────────────────────────────────────────────│
│  strict-origin-when-cross-origin                           │
│  控制 Referer 头发送                                        │
│                                                              │
│  Permissions-Policy                                        │
│  ──────────────────────────────────────────────────────────│
│  camera=(), microphone=(), geolocation=()                  │
│  控制浏览器 API 权限                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Nginx 配置示例：**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

#### 6. 身份认证安全

```javascript
// JWT 安全使用
// 1. 使用强密钥
const secret = crypto.randomBytes(64).toString('hex');

// 2. 设置合理的过期时间
const token = jwt.sign({ userId: 1 }, secret, { expiresIn: '1h' });

// 3. 存储位置
// HttpOnly Cookie（推荐）：防止 XSS
// localStorage：容易受 XSS 攻击

// 4. 刷新令牌机制
const accessToken = jwt.sign({ userId }, secret, { expiresIn: '15m' });
const refreshToken = jwt.sign({ userId }, refreshSecret, { expiresIn: '7d' });

// 密码安全
// 1. 使用 bcrypt
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 10);
const isMatch = await bcrypt.compare(password, hash);

// 2. 密码强度验证
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}

// 3. 登录安全
// - 限制登录尝试次数
// - 验证码
// - 多因素认证（MFA）
// - 登录通知
```

---

#### 7. 敏感数据处理

```javascript
// 1. 敏感信息脱敏
function maskPhone(phone) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function maskEmail(email) {
  const [name, domain] = email.split('@');
  const maskedName = name[0] + '***' + name.slice(-1);
  return `${maskedName}@${domain}`;
}

function maskIdCard(id) {
  return id.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2');
}

// 2. 前端不存储敏感信息
// 避免
localStorage.setItem('password', password);
localStorage.setItem('token', sensitiveToken);

// 推荐
// 使用 HttpOnly Cookie
// 使用 sessionStorage（浏览器关闭清除）
// 及时清理敏感数据

// 3. 安全传输
// 使用 HTTPS
// 加密敏感字段
const encrypted = CryptoJS.AES.encrypt(data, key).toString();

// 4. 防止信息泄露
// 错误消息不要暴露系统信息
// Bad: "MySQL error: syntax error at line 1"
// Good: "登录失败，请稍后重试"

// 生产环境禁用调试信息
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.debug = () => {};
}
```

---

#### 8. 第三方资源安全

```html
<!-- 1. 子资源完整性（SRI） -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>

<!-- 2. 沙箱化 iframe -->
<iframe
  src="https://third-party.com"
  sandbox="allow-scripts allow-same-origin"
  loading="lazy">
</iframe>

<!-- sandbox 属性值：
  allow-scripts: 允许脚本
  allow-same-origin: 允许同源
  allow-forms: 允许表单
  allow-popups: 允许弹窗
  allow-modals: 允许模态框
-->

<!-- 3. 第三方脚本隔离 -->
<script>
// 使用 iframe 隔离第三方脚本
const iframe = document.createElement('iframe');
iframe.style.display = 'none';
document.body.appendChild(iframe);
iframe.contentWindow.eval(thirdPartyCode);
</script>
```

```javascript
// 4. 依赖安全审计
// npm audit
npm audit
npm audit fix

// 使用锁文件
package-lock.json
yarn.lock
pnpm-lock.yaml

// 5. 检查依赖许可证
npx license-checker

// 6. 避免供应链攻击
// 锁定版本
"dependencies": {
  "lodash": "4.17.21"  // 而不是 "^4.17.21"
}

// 使用私有镜像
npm config set registry https://registry.npmmirror.com
```

---

### 避坑指南

| 常见错误 | 正确做法 |
|----------|----------|
| innerHTML 直接插入用户输入 | 使用 textContent 或转义 |
| 前端存储密码/Token | 使用 HttpOnly Cookie |
| 只在前端做输入验证 | 前后端都要验证 |
| 相信 Referer 头 | 可被伪造，需配合其他措施 |
| 使用 GET 请求修改数据 | 敏感操作使用 POST/PUT |

---

## B. 实战文档

### 安全检查清单

```markdown
## 输入验证
- [ ] 所有用户输入都经过验证
- [ ] 使用白名单而非黑名单
- [ ] 验证数据类型、长度、格式
- [ ] 服务端二次验证

## XSS 防护
- [ ] 输出编码
- [ ] CSP 配置
- [ ] HttpOnly Cookie
- [ ] 避免危险 API（innerHTML, eval）

## CSRF 防护
- [ ] CSRF Token
- [ ] SameSite Cookie
- [ ] 验证 Origin/Referer

## 认证安全
- [ ] 安全的密码存储
- [ ] Session 管理
- [ ] 登录失败限制
- [ ] 多因素认证

## 通信安全
- [ ] HTTPS
- [ ] HSTS
- [ ] 证书校验

## 依赖安全
- [ ] 定期更新依赖
- [ ] npm audit 检查
- [ ] 锁定版本号
```

### 安全配置模板

```javascript
// Express 安全配置
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');

const app = express();

// Helmet 设置安全头
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:']
  }
}));

// 限速
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// CSRF
app.use(csrf());
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Cookie 安全
app.use(session({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000
  }
}));
```
