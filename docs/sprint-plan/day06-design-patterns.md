# Day 6: 设计模式

> 第六天重点：常用设计模式及其在前后端的应用

## 今日目标

- [ ] 掌握创建型模式（单例、工厂）
- [ ] 理解结构型模式（代理、装饰器、适配器）
- [ ] 熟悉行为型模式（观察者、策略）
- [ ] 能结合框架解释设计模式应用

---

## Part A: 创建型模式

### 1. 单例模式

#### Q1: 实现单例模式

**答案：**
```javascript
// 方式1：闭包
const Singleton = (function() {
  let instance;

  function createInstance() {
    return { name: 'singleton' };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

const a = Singleton.getInstance();
const b = Singleton.getInstance();
console.log(a === b);  // true

// 方式2：ES6 class
class Database {
  static instance;

  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    this.connection = 'connected';
    Database.instance = this;
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

// 方式3：Proxy
function singleton(ClassName) {
  let instance;
  return new Proxy(ClassName, {
    construct(target, args) {
      if (!instance) {
        instance = Reflect.construct(target, args);
      }
      return instance;
    }
  });
}
```

**Java 单例（面试常考）：**
```java
// 双重检查锁定
public class Singleton {
    private static volatile Singleton instance;

    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}

// 为什么用 volatile？
// 防止指令重排序，instance = new Singleton() 包含三步：
// 1. 分配内存
// 2. 初始化对象
// 3. instance 指向内存
// 可能重排为 1→3→2，导致其他线程获取到未初始化的对象
```

**应用场景：**
```
- 全局配置管理
- 数据库连接池
- 日志对象
- 缓存管理
- Vuex/Redux Store
```

---

### 2. 工厂模式

#### Q2: 简单工厂 vs 工厂方法 vs 抽象工厂

**答案：**
```javascript
// 简单工厂：一个工厂创建多种产品
class ProductFactory {
  static create(type) {
    switch (type) {
      case 'A':
        return new ProductA();
      case 'B':
        return new ProductB();
      default:
        throw new Error('Unknown product type');
    }
  }
}

const productA = ProductFactory.create('A');

// 工厂方法：每种产品有自己的工厂
class ProductAFactory {
  create() {
    return new ProductA();
  }
}

class ProductBFactory {
  create() {
    return new ProductB();
  }
}

// 抽象工厂：创建一系列相关产品
class UIFactory {
  createButton() {}
  createInput() {}
}

class MacUIFactory extends UIFactory {
  createButton() { return new MacButton(); }
  createInput() { return new MacInput(); }
}

class WindowsUIFactory extends UIFactory {
  createButton() { return new WindowsButton(); }
  createInput() { return new WindowsInput(); }
}

// 使用
function createUI(factory) {
  const button = factory.createButton();
  const input = factory.createInput();
  // ...
}

createUI(new MacUIFactory());
```

**应用场景：**
```javascript
// Vue 中的 createElement
const vnode = createElement('div', { class: 'container' }, [
  createElement('span', null, 'Hello')
]);

// React 中的 React.createElement
const element = React.createElement('div', { className: 'container' },
  React.createElement('span', null, 'Hello')
);

// jQuery 的 $()
$('<div></div>');  // 工厂方法创建 DOM 元素
```

---

## Part B: 结构型模式

### 3. 代理模式

#### Q3: 实现代理模式

**答案：**
```javascript
// ES6 Proxy 实现
const target = {
  name: 'Alice',
  _secret: 'password'
};

const proxy = new Proxy(target, {
  get(obj, prop) {
    if (prop.startsWith('_')) {
      console.log('Access denied');
      return undefined;
    }
    console.log(`Getting ${prop}`);
    return obj[prop];
  },
  set(obj, prop, value) {
    if (prop.startsWith('_')) {
      throw new Error('Cannot set private property');
    }
    console.log(`Setting ${prop} to ${value}`);
    obj[prop] = value;
    return true;
  }
});

proxy.name;       // Getting name → 'Alice'
proxy._secret;    // Access denied → undefined
proxy.age = 25;   // Setting age to 25
```

**应用场景：**
```javascript
// 1. Vue3 响应式
const state = reactive({ count: 0 });  // 内部使用 Proxy

// 2. 虚拟代理（延迟加载）
class ImageProxy {
  constructor(src) {
    this.src = src;
    this.image = null;
  }

  display() {
    if (!this.image) {
      console.log('Loading...');
      this.image = new Image();
      this.image.src = this.src;
    }
    // 显示图片
  }
}

// 3. 缓存代理
const memoize = (fn) => {
  const cache = new Map();
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = target.apply(thisArg, args);
      cache.set(key, result);
      return result;
    }
  });
};

// 4. 验证代理
const validator = {
  set(obj, prop, value) {
    if (prop === 'age' && (typeof value !== 'number' || value < 0)) {
      throw new TypeError('Age must be a positive number');
    }
    obj[prop] = value;
    return true;
  }
};
```

---

### 4. 装饰器模式

#### Q4: 实现装饰器模式

**答案：**
```javascript
// 函数装饰器
function log(fn) {
  return function(...args) {
    console.log(`Calling ${fn.name} with`, args);
    const result = fn.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };
}

function add(a, b) {
  return a + b;
}

const loggedAdd = log(add);
loggedAdd(1, 2);
// Calling add with [1, 2]
// Result: 3

// ES7 装饰器语法
function readonly(target, key, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

function validate(target, key, descriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args) {
    if (args.some(arg => typeof arg !== 'number')) {
      throw new Error('Arguments must be numbers');
    }
    return original.apply(this, args);
  };
  return descriptor;
}

class Calculator {
  @readonly
  PI = 3.14159;

  @validate
  add(a, b) {
    return a + b;
  }
}
```

**应用场景：**
```javascript
// 1. React 高阶组件（HOC）
function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <Loading />;
    }
    return <WrappedComponent {...props} />;
  };
}

const EnhancedList = withLoading(List);

// 2. TypeScript 装饰器
@Controller('/users')
class UserController {
  @Get('/:id')
  @Auth()
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}

// 3. 防抖/节流装饰器
function debounce(delay) {
  return function(target, key, descriptor) {
    const original = descriptor.value;
    let timer = null;

    descriptor.value = function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        original.apply(this, args);
      }, delay);
    };

    return descriptor;
  };
}

class SearchBox {
  @debounce(300)
  search(keyword) {
    // 搜索逻辑
  }
}
```

---

### 5. 适配器模式

#### Q5: 实现适配器模式

**答案：**
```javascript
// 场景：统一不同 API 的调用方式
class OldAPI {
  request(url, callback) {
    // 旧版回调风格
    setTimeout(() => callback(null, { data: 'result' }), 100);
  }
}

class NewAPI {
  fetch(url) {
    // 新版 Promise 风格
    return Promise.resolve({ data: 'result' });
  }
}

// 适配器：将 OldAPI 适配为 Promise 风格
class APIAdapter {
  constructor(oldAPI) {
    this.oldAPI = oldAPI;
  }

  fetch(url) {
    return new Promise((resolve, reject) => {
      this.oldAPI.request(url, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
}

// 使用
const oldAPI = new OldAPI();
const adapter = new APIAdapter(oldAPI);
adapter.fetch('/users').then(console.log);  // { data: 'result' }
```

**应用场景：**
```javascript
// 1. 不同存储的适配
class StorageAdapter {
  constructor(storage) {
    this.storage = storage;
  }

  get(key) {
    if (this.storage === localStorage) {
      return JSON.parse(localStorage.getItem(key));
    }
    return this.storage.get(key);
  }

  set(key, value) {
    if (this.storage === localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      this.storage.set(key, value);
    }
  }
}

// 2. axios 适配 fetch
// axios 内部就是将 XMLHttpRequest 适配为 Promise 接口
```

---

## Part C: 行为型模式

### 6. 观察者模式

#### Q6: 实现观察者模式

**答案：**
```javascript
// 观察者模式
class Subject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter(o => o !== observer);
  }

  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

class Observer {
  update(data) {
    console.log('Received:', data);
  }
}

const subject = new Subject();
const observer1 = new Observer();
const observer2 = new Observer();

subject.subscribe(observer1);
subject.subscribe(observer2);
subject.notify('Hello!');  // 两个观察者都收到

// 发布订阅模式（多了一个事件中心）
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => this.off(event, callback);  // 返回取消订阅函数
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(...args));
  }

  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

// 使用
const emitter = new EventEmitter();
emitter.on('data', data => console.log('Received:', data));
emitter.emit('data', { name: 'Alice' });
```

**应用场景：**
```javascript
// 1. Vue 的响应式系统
// 依赖收集（订阅）+ 派发更新（发布）

// 2. Node.js EventEmitter
const EventEmitter = require('events');
const emitter = new EventEmitter();
emitter.on('request', handleRequest);

// 3. DOM 事件
element.addEventListener('click', handler);
element.removeEventListener('click', handler);

// 4. Redux
store.subscribe(() => {
  console.log(store.getState());
});
```

---

### 7. 策略模式

#### Q7: 实现策略模式

**答案：**
```javascript
// 场景：不同的计算策略
const strategies = {
  normal: (price) => price,
  vip: (price) => price * 0.9,
  svip: (price) => price * 0.8,
  blackFriday: (price) => price * 0.5
};

function calculatePrice(price, strategy = 'normal') {
  return strategies[strategy](price);
}

console.log(calculatePrice(100, 'vip'));  // 90

// 表单验证策略
const validators = {
  required: (value) => value !== '' || '必填',
  minLength: (min) => (value) => value.length >= min || `最少${min}个字符`,
  email: (value) => /^\S+@\S+$/.test(value) || '邮箱格式错误',
  phone: (value) => /^1\d{10}$/.test(value) || '手机号格式错误'
};

function validate(value, rules) {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) {
      return result;  // 返回错误信息
    }
  }
  return true;
}

// 使用
const rules = [
  validators.required,
  validators.minLength(6),
  validators.email
];

console.log(validate('test@example.com', rules));  // true
console.log(validate('test', rules));  // '邮箱格式错误'
```

**应用场景：**
```javascript
// 1. 表单验证（Element Plus、Ant Design）
// 2. 支付方式选择
// 3. 动画效果
// 4. 压缩算法选择
```

---

### 8. 模板方法模式

#### Q8: 模板方法模式的应用

**答案：**
```javascript
// 定义算法骨架，子类实现具体步骤
class DataProcessor {
  // 模板方法
  process() {
    const data = this.fetchData();
    const cleanedData = this.cleanData(data);
    const result = this.analyzeData(cleanedData);
    this.saveResult(result);
    return result;
  }

  fetchData() {
    throw new Error('Must implement fetchData');
  }

  cleanData(data) {
    // 默认实现
    return data.filter(item => item !== null);
  }

  analyzeData(data) {
    throw new Error('Must implement analyzeData');
  }

  saveResult(result) {
    console.log('Saved:', result);
  }
}

class UserDataProcessor extends DataProcessor {
  fetchData() {
    return [{ name: 'Alice' }, { name: 'Bob' }, null];
  }

  analyzeData(data) {
    return data.map(user => user.name);
  }
}

const processor = new UserDataProcessor();
processor.process();  // ['Alice', 'Bob']
```

**应用场景：**
```javascript
// 1. React 生命周期
class MyComponent extends React.Component {
  componentDidMount() {}  // 钩子方法
  componentDidUpdate() {}
  render() {}  // 必须实现
}

// 2. Vue 生命周期
export default {
  created() {},
  mounted() {},
  // ...
}

// 3. 测试框架
describe('Test Suite', () => {
  beforeEach(() => {});  // 钩子
  afterEach(() => {});
  it('test case', () => {});
});
```

---

## Part D: SOLID 原则

#### Q9: 解释 SOLID 原则

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    SOLID 原则                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  S - 单一职责原则（Single Responsibility）                  │
│  一个类只做一件事                                           │
│  ✗ UserService 同时处理用户逻辑和发邮件                     │
│  ✓ UserService + EmailService 分离                          │
│                                                              │
│  O - 开闭原则（Open/Closed）                                │
│  对扩展开放，对修改关闭                                      │
│  ✗ 添加新功能需要修改原有代码                               │
│  ✓ 通过继承/组合扩展功能                                    │
│                                                              │
│  L - 里氏替换原则（Liskov Substitution）                    │
│  子类可以替换父类使用                                        │
│  ✗ 子类重写方法改变了行为                                   │
│  ✓ 子类保持与父类兼容                                       │
│                                                              │
│  I - 接口隔离原则（Interface Segregation）                  │
│  接口要小而专                                                │
│  ✗ 一个大接口包含很多方法                                   │
│  ✓ 多个小接口，按需实现                                     │
│                                                              │
│  D - 依赖倒置原则（Dependency Inversion）                   │
│  依赖抽象而非具体实现                                        │
│  ✗ 高层模块直接依赖低层模块                                 │
│  ✓ 都依赖抽象接口                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 复习检查清单

- [ ] 能手写单例模式（JS 和 Java）
- [ ] 理解工厂模式的几种变体
- [ ] 能用 Proxy 实现代理模式
- [ ] 理解装饰器模式和 HOC 的关系
- [ ] 能手写发布订阅模式
- [ ] 理解策略模式的应用场景
- [ ] 能解释 SOLID 原则

---

> 明日预告：Day 7 - 项目介绍准备
