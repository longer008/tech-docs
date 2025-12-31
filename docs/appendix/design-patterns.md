# 设计模式面试题集

> 常用设计模式与高频面试题

## A. 面试宝典

### 基础题

#### 1. 设计模式概述

```
┌─────────────────────────────────────────────────────────────┐
│                    设计模式分类                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  创建型模式（对象创建）：                                    │
│  ├── 单例模式（Singleton）                                  │
│  ├── 工厂模式（Factory）                                    │
│  ├── 抽象工厂模式（Abstract Factory）                       │
│  ├── 建造者模式（Builder）                                  │
│  └── 原型模式（Prototype）                                  │
│                                                              │
│  结构型模式（对象组合）：                                    │
│  ├── 适配器模式（Adapter）                                  │
│  ├── 装饰器模式（Decorator）                                │
│  ├── 代理模式（Proxy）                                      │
│  ├── 外观模式（Facade）                                     │
│  ├── 桥接模式（Bridge）                                     │
│  ├── 组合模式（Composite）                                  │
│  └── 享元模式（Flyweight）                                  │
│                                                              │
│  行为型模式（对象交互）：                                    │
│  ├── 观察者模式（Observer）                                 │
│  ├── 策略模式（Strategy）                                   │
│  ├── 命令模式（Command）                                    │
│  ├── 状态模式（State）                                      │
│  ├── 模板方法模式（Template Method）                        │
│  ├── 迭代器模式（Iterator）                                 │
│  ├── 责任链模式（Chain of Responsibility）                  │
│  ├── 中介者模式（Mediator）                                 │
│  ├── 备忘录模式（Memento）                                  │
│  ├── 访问者模式（Visitor）                                  │
│  └── 解释器模式（Interpreter）                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### 2. 单例模式（Singleton）

**意图：** 确保一个类只有一个实例，并提供全局访问点。

```javascript
// JavaScript 实现
// ============================================

// 1. 基础单例
const Singleton = (function() {
  let instance;

  function createInstance() {
    return {
      name: 'Singleton Instance',
      getData() {
        return this.name;
      }
    };
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

// 2. ES6 类实现
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    this.connection = 'Connected';
    Database.instance = this;
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

// 3. 模块化单例（利用 ES Module 特性）
// database.js
class Database {
  constructor() {
    this.connection = null;
  }

  connect() {
    this.connection = 'Connected';
  }
}

export default new Database();  // 模块天然单例
```

```java
// Java 实现
// ============================================

// 1. 懒汉式（双重检查锁）
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

// 2. 饿汉式
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();

    private Singleton() {}

    public static Singleton getInstance() {
        return INSTANCE;
    }
}

// 3. 静态内部类（推荐）
public class Singleton {
    private Singleton() {}

    private static class Holder {
        private static final Singleton INSTANCE = new Singleton();
    }

    public static Singleton getInstance() {
        return Holder.INSTANCE;
    }
}

// 4. 枚举（最安全）
public enum Singleton {
    INSTANCE;

    public void doSomething() {
        // ...
    }
}
```

**应用场景：**
- 数据库连接池
- 日志管理器
- 配置管理
- 全局状态管理（Vuex/Redux store）

---

#### 3. 工厂模式（Factory）

**意图：** 定义创建对象的接口，让子类决定实例化哪个类。

```javascript
// 简单工厂
class Car {
  constructor(type) {
    this.type = type;
  }
}

class CarFactory {
  static create(type) {
    switch (type) {
      case 'sedan':
        return new Car('Sedan');
      case 'suv':
        return new Car('SUV');
      case 'sports':
        return new Car('Sports Car');
      default:
        throw new Error('Unknown car type');
    }
  }
}

const sedan = CarFactory.create('sedan');

// 工厂方法模式
class Vehicle {
  drive() {
    throw new Error('Must implement drive method');
  }
}

class Car extends Vehicle {
  drive() {
    return 'Driving a car';
  }
}

class Motorcycle extends Vehicle {
  drive() {
    return 'Riding a motorcycle';
  }
}

class VehicleFactory {
  createVehicle() {
    throw new Error('Must implement createVehicle method');
  }
}

class CarFactory extends VehicleFactory {
  createVehicle() {
    return new Car();
  }
}

class MotorcycleFactory extends VehicleFactory {
  createVehicle() {
    return new Motorcycle();
  }
}
```

```java
// Java 工厂模式
// ============================================

// 产品接口
interface Product {
    void use();
}

// 具体产品
class ConcreteProductA implements Product {
    @Override
    public void use() {
        System.out.println("Using Product A");
    }
}

class ConcreteProductB implements Product {
    @Override
    public void use() {
        System.out.println("Using Product B");
    }
}

// 工厂接口
interface Factory {
    Product create();
}

// 具体工厂
class FactoryA implements Factory {
    @Override
    public Product create() {
        return new ConcreteProductA();
    }
}

class FactoryB implements Factory {
    @Override
    public Product create() {
        return new ConcreteProductB();
    }
}
```

**应用场景：**
- React.createElement
- Vue 组件工厂
- 日志工厂（不同日志级别）
- 数据库驱动创建

---

#### 4. 观察者模式（Observer）

**意图：** 定义对象间一对多的依赖关系，当一个对象状态改变时，所有依赖者都会收到通知。

```javascript
// JavaScript 实现（发布订阅）
// ============================================

class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  // 订阅
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
    return this;
  }

  // 取消订阅
  off(event, callback) {
    if (!this.events.has(event)) return this;
    if (!callback) {
      this.events.delete(event);
    } else {
      const callbacks = this.events.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
    return this;
  }

  // 只订阅一次
  once(event, callback) {
    const wrapper = (...args) => {
      callback.apply(this, args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  // 发布
  emit(event, ...args) {
    if (!this.events.has(event)) return this;
    this.events.get(event).forEach(callback => {
      callback.apply(this, args);
    });
    return this;
  }
}

// 使用示例
const emitter = new EventEmitter();

emitter.on('userLogin', (user) => {
  console.log(`${user.name} logged in`);
});

emitter.emit('userLogin', { name: 'John' });

// Vue 响应式原理中的观察者
class Dep {
  constructor() {
    this.subscribers = new Set();
  }

  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
    }
  }

  notify() {
    this.subscribers.forEach(effect => effect());
  }
}

let activeEffect = null;

function watchEffect(effect) {
  activeEffect = effect;
  effect();
  activeEffect = null;
}
```

```java
// Java 观察者模式
// ============================================

import java.util.ArrayList;
import java.util.List;

// 观察者接口
interface Observer {
    void update(String message);
}

// 主题接口
interface Subject {
    void attach(Observer observer);
    void detach(Observer observer);
    void notifyObservers();
}

// 具体主题
class NewsPublisher implements Subject {
    private List<Observer> observers = new ArrayList<>();
    private String news;

    @Override
    public void attach(Observer observer) {
        observers.add(observer);
    }

    @Override
    public void detach(Observer observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers() {
        for (Observer observer : observers) {
            observer.update(news);
        }
    }

    public void publishNews(String news) {
        this.news = news;
        notifyObservers();
    }
}

// 具体观察者
class NewsSubscriber implements Observer {
    private String name;

    public NewsSubscriber(String name) {
        this.name = name;
    }

    @Override
    public void update(String message) {
        System.out.println(name + " received: " + message);
    }
}
```

**应用场景：**
- Vue/React 响应式系统
- DOM 事件监听
- WebSocket 消息推送
- 状态管理（Redux）

---

#### 5. 策略模式（Strategy）

**意图：** 定义一系列算法，封装每个算法，使它们可以互换。

```javascript
// JavaScript 实现
// ============================================

// 策略对象
const strategies = {
  S: (salary) => salary * 4,
  A: (salary) => salary * 3,
  B: (salary) => salary * 2
};

// 计算奖金
function calculateBonus(level, salary) {
  return strategies[level](salary);
}

console.log(calculateBonus('S', 10000));  // 40000

// 表单验证策略
const validators = {
  required: (value) => value !== '' || '此字段必填',
  minLength: (value, length) => value.length >= length || `最少${length}个字符`,
  maxLength: (value, length) => value.length <= length || `最多${length}个字符`,
  email: (value) => /^[\w-]+@[\w-]+\.[a-z]+$/i.test(value) || '邮箱格式不正确',
  phone: (value) => /^1[3-9]\d{9}$/.test(value) || '手机号格式不正确'
};

class Validator {
  constructor() {
    this.rules = [];
  }

  add(value, rule, ...params) {
    this.rules.push(() => validators[rule](value, ...params));
  }

  validate() {
    for (const rule of this.rules) {
      const result = rule();
      if (result !== true) {
        return result;
      }
    }
    return true;
  }
}

const validator = new Validator();
validator.add('', 'required');
validator.add('test@', 'email');
console.log(validator.validate());  // '此字段必填' 或 '邮箱格式不正确'
```

```java
// Java 策略模式
// ============================================

// 策略接口
interface PaymentStrategy {
    void pay(int amount);
}

// 具体策略
class CreditCardPayment implements PaymentStrategy {
    private String cardNumber;

    public CreditCardPayment(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    @Override
    public void pay(int amount) {
        System.out.println("Paid " + amount + " via Credit Card");
    }
}

class AlipayPayment implements PaymentStrategy {
    @Override
    public void pay(int amount) {
        System.out.println("Paid " + amount + " via Alipay");
    }
}

class WeChatPayment implements PaymentStrategy {
    @Override
    public void pay(int amount) {
        System.out.println("Paid " + amount + " via WeChat");
    }
}

// 上下文
class ShoppingCart {
    private PaymentStrategy paymentStrategy;

    public void setPaymentStrategy(PaymentStrategy strategy) {
        this.paymentStrategy = strategy;
    }

    public void checkout(int amount) {
        paymentStrategy.pay(amount);
    }
}
```

**应用场景：**
- 表单验证规则
- 支付方式选择
- 排序算法选择
- 动画缓动函数

---

### 进阶题

#### 6. 装饰器模式（Decorator）

**意图：** 动态地给对象添加额外职责，比继承更灵活。

```javascript
// JavaScript 装饰器
// ============================================

// 函数装饰器
function log(target, name, descriptor) {
  const original = descriptor.value;

  descriptor.value = function(...args) {
    console.log(`Calling ${name} with:`, args);
    const result = original.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };

  return descriptor;
}

class Calculator {
  @log
  add(a, b) {
    return a + b;
  }
}

// 高阶组件（React HOC）
function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...props} />;
  };
}

// 手动装饰器（无 decorator 语法）
function readonly(target, key, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveOperation = memoize((n) => {
  console.log('Computing...');
  return n * n;
});
```

```java
// Java 装饰器模式
// ============================================

// 组件接口
interface Coffee {
    String getDescription();
    double getCost();
}

// 具体组件
class SimpleCoffee implements Coffee {
    @Override
    public String getDescription() {
        return "Simple Coffee";
    }

    @Override
    public double getCost() {
        return 10.0;
    }
}

// 装饰器基类
abstract class CoffeeDecorator implements Coffee {
    protected Coffee coffee;

    public CoffeeDecorator(Coffee coffee) {
        this.coffee = coffee;
    }
}

// 具体装饰器
class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) {
        super(coffee);
    }

    @Override
    public String getDescription() {
        return coffee.getDescription() + ", Milk";
    }

    @Override
    public double getCost() {
        return coffee.getCost() + 2.0;
    }
}

class SugarDecorator extends CoffeeDecorator {
    public SugarDecorator(Coffee coffee) {
        super(coffee);
    }

    @Override
    public String getDescription() {
        return coffee.getDescription() + ", Sugar";
    }

    @Override
    public double getCost() {
        return coffee.getCost() + 1.0;
    }
}

// 使用
Coffee coffee = new SimpleCoffee();
coffee = new MilkDecorator(coffee);
coffee = new SugarDecorator(coffee);
System.out.println(coffee.getDescription());  // Simple Coffee, Milk, Sugar
System.out.println(coffee.getCost());         // 13.0
```

---

#### 7. 代理模式（Proxy）

**意图：** 为其他对象提供代理以控制对该对象的访问。

```javascript
// JavaScript Proxy
// ============================================

// 1. 数据验证代理
const validator = {
  set(target, prop, value) {
    if (prop === 'age') {
      if (!Number.isInteger(value)) {
        throw new TypeError('Age must be an integer');
      }
      if (value < 0 || value > 150) {
        throw new RangeError('Age must be between 0 and 150');
      }
    }
    target[prop] = value;
    return true;
  }
};

const person = new Proxy({}, validator);
person.age = 25;     // OK
// person.age = -5;  // RangeError

// 2. 响应式代理（Vue 3 原理）
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key);  // 依赖收集
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);  // 触发更新
      return result;
    }
  });
}

// 3. 缓存代理
function createCacheProxy(fn) {
  const cache = new Map();

  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        console.log('From cache');
        return cache.get(key);
      }
      const result = Reflect.apply(target, thisArg, args);
      cache.set(key, result);
      return result;
    }
  });
}

// 4. 懒加载代理
class ImageProxy {
  constructor(url) {
    this.url = url;
    this.image = null;
  }

  display() {
    if (!this.image) {
      console.log('Loading image...');
      this.image = new Image();
      this.image.src = this.url;
    }
    return this.image;
  }
}
```

```java
// Java 代理模式
// ============================================

// 接口
interface Image {
    void display();
}

// 真实对象
class RealImage implements Image {
    private String filename;

    public RealImage(String filename) {
        this.filename = filename;
        loadFromDisk();
    }

    private void loadFromDisk() {
        System.out.println("Loading " + filename);
    }

    @Override
    public void display() {
        System.out.println("Displaying " + filename);
    }
}

// 代理对象
class ProxyImage implements Image {
    private RealImage realImage;
    private String filename;

    public ProxyImage(String filename) {
        this.filename = filename;
    }

    @Override
    public void display() {
        if (realImage == null) {
            realImage = new RealImage(filename);  // 懒加载
        }
        realImage.display();
    }
}

// 动态代理
import java.lang.reflect.*;

class LogHandler implements InvocationHandler {
    private Object target;

    public LogHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("Before: " + method.getName());
        Object result = method.invoke(target, args);
        System.out.println("After: " + method.getName());
        return result;
    }
}
```

---

#### 8. 适配器模式（Adapter）

**意图：** 将一个类的接口转换成客户期望的另一个接口。

```javascript
// JavaScript 适配器
// ============================================

// 老接口
class OldCalculator {
  operations(a, b, operation) {
    switch (operation) {
      case 'add': return a + b;
      case 'sub': return a - b;
      default: return NaN;
    }
  }
}

// 新接口
class NewCalculator {
  add(a, b) { return a + b; }
  sub(a, b) { return a - b; }
}

// 适配器
class CalculatorAdapter {
  constructor() {
    this.calculator = new NewCalculator();
  }

  operations(a, b, operation) {
    switch (operation) {
      case 'add': return this.calculator.add(a, b);
      case 'sub': return this.calculator.sub(a, b);
      default: return NaN;
    }
  }
}

// API 适配器（统一不同 API 响应格式）
class APIAdapter {
  static adapt(response, type) {
    switch (type) {
      case 'typeA':
        return {
          id: response.ID,
          name: response.NAME,
          data: response.DATA
        };
      case 'typeB':
        return {
          id: response.id,
          name: response.title,
          data: response.content
        };
      default:
        return response;
    }
  }
}
```

---

#### 9. 外观模式（Facade）

**意图：** 为子系统提供统一的高层接口，简化使用。

```javascript
// JavaScript 外观模式
// ============================================

// 复杂子系统
class CPU {
  freeze() { console.log('CPU freeze'); }
  jump() { console.log('CPU jump'); }
  execute() { console.log('CPU execute'); }
}

class Memory {
  load() { console.log('Memory load'); }
}

class HardDrive {
  read() { console.log('HardDrive read'); }
}

// 外观
class ComputerFacade {
  constructor() {
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hardDrive = new HardDrive();
  }

  start() {
    this.cpu.freeze();
    this.memory.load();
    this.hardDrive.read();
    this.cpu.jump();
    this.cpu.execute();
    console.log('Computer started');
  }
}

// 使用
const computer = new ComputerFacade();
computer.start();

// 实际应用：jQuery
// $(selector) 是对复杂 DOM 操作的外观
$('#myElement').addClass('active').show().fadeIn();
```

---

#### 10. 命令模式（Command）

**意图：** 将请求封装为对象，支持撤销、队列、日志等操作。

```javascript
// JavaScript 命令模式
// ============================================

// 命令接口
class Command {
  execute() {}
  undo() {}
}

// 具体命令
class AddTextCommand extends Command {
  constructor(editor, text) {
    super();
    this.editor = editor;
    this.text = text;
  }

  execute() {
    this.editor.content += this.text;
  }

  undo() {
    this.editor.content = this.editor.content.slice(0, -this.text.length);
  }
}

// 接收者
class Editor {
  constructor() {
    this.content = '';
  }
}

// 调用者
class EditorInvoker {
  constructor() {
    this.history = [];
    this.redoStack = [];
  }

  execute(command) {
    command.execute();
    this.history.push(command);
    this.redoStack = [];
  }

  undo() {
    const command = this.history.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
    }
  }

  redo() {
    const command = this.redoStack.pop();
    if (command) {
      command.execute();
      this.history.push(command);
    }
  }
}

// 使用
const editor = new Editor();
const invoker = new EditorInvoker();

invoker.execute(new AddTextCommand(editor, 'Hello '));
invoker.execute(new AddTextCommand(editor, 'World'));
console.log(editor.content);  // 'Hello World'

invoker.undo();
console.log(editor.content);  // 'Hello '

invoker.redo();
console.log(editor.content);  // 'Hello World'
```

---

### 避坑指南

| 误区 | 正确理解 |
|------|----------|
| 过度使用设计模式 | 简单问题不需要复杂模式 |
| 单例滥用 | 全局状态难以测试和维护 |
| 工厂返回 new 对象 | 应该返回接口/抽象类型 |
| 观察者内存泄漏 | 记得取消订阅 |
| 策略过多 if-else | 使用对象映射或 Map |

---

## B. 实战文档

### 前端常用模式

```javascript
// 1. 模块模式（Module Pattern）
const Module = (function() {
  // 私有变量和方法
  let privateVar = 0;

  function privateMethod() {
    return privateVar;
  }

  // 公开接口
  return {
    publicMethod() {
      return privateMethod();
    },
    increment() {
      privateVar++;
    }
  };
})();

// 2. 揭示模块模式（Revealing Module）
const RevealingModule = (function() {
  let privateVar = 'private';

  function privateMethod() {
    return privateVar;
  }

  function publicMethod() {
    return privateMethod();
  }

  return {
    get: publicMethod
  };
})();

// 3. 中介者模式（聊天室）
class ChatRoom {
  constructor() {
    this.users = new Map();
  }

  register(user) {
    this.users.set(user.name, user);
    user.chatRoom = this;
  }

  send(message, from, to) {
    if (to) {
      // 私聊
      this.users.get(to).receive(message, from);
    } else {
      // 群发
      this.users.forEach((user, name) => {
        if (name !== from) {
          user.receive(message, from);
        }
      });
    }
  }
}

class User {
  constructor(name) {
    this.name = name;
    this.chatRoom = null;
  }

  send(message, to) {
    this.chatRoom.send(message, this.name, to);
  }

  receive(message, from) {
    console.log(`${from} to ${this.name}: ${message}`);
  }
}

// 4. 状态模式（交通灯）
class TrafficLight {
  constructor() {
    this.states = {
      red: new RedLight(this),
      yellow: new YellowLight(this),
      green: new GreenLight(this)
    };
    this.current = this.states.red;
  }

  change() {
    this.current.change();
  }

  setState(state) {
    this.current = this.states[state];
  }
}

class RedLight {
  constructor(light) {
    this.light = light;
  }

  change() {
    console.log('Red -> Green');
    this.light.setState('green');
  }
}

class GreenLight {
  constructor(light) {
    this.light = light;
  }

  change() {
    console.log('Green -> Yellow');
    this.light.setState('yellow');
  }
}

class YellowLight {
  constructor(light) {
    this.light = light;
  }

  change() {
    console.log('Yellow -> Red');
    this.light.setState('red');
  }
}
```

### 框架中的设计模式

```javascript
// Vue 中的设计模式
// ============================================

// 1. 观察者模式 - 响应式系统
// Vue 3 使用 Proxy 实现

// 2. 发布订阅 - 事件总线
const eventBus = {
  events: {},
  $on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  $emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(...args));
    }
  },
  $off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
};

// 3. 策略模式 - 指令
Vue.directive('permission', {
  inserted(el, binding) {
    const strategies = {
      admin: () => true,
      user: () => binding.value === 'read',
      guest: () => false
    };

    const role = getCurrentUserRole();
    if (!strategies[role]()) {
      el.parentNode.removeChild(el);
    }
  }
});

// React 中的设计模式
// ============================================

// 1. 组合模式 - 组件组合
function Card({ children }) {
  return <div className="card">{children}</div>;
}

Card.Header = ({ children }) => <div className="card-header">{children}</div>;
Card.Body = ({ children }) => <div className="card-body">{children}</div>;

// 使用
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>

// 2. 装饰器模式 - HOC
function withAuth(WrappedComponent) {
  return function(props) {
    const isAuthenticated = useAuth();
    if (!isAuthenticated) {
      return <Redirect to="/login" />;
    }
    return <WrappedComponent {...props} />;
  };
}

// 3. 渲染属性模式
class Mouse extends React.Component {
  state = { x: 0, y: 0 };

  handleMouseMove = (e) => {
    this.setState({ x: e.clientX, y: e.clientY });
  };

  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

// 使用
<Mouse render={({ x, y }) => <p>Position: {x}, {y}</p>} />

// 4. 自定义 Hook（组合模式）
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

### 设计原则（SOLID）

```
┌─────────────────────────────────────────────────────────────┐
│                    SOLID 原则                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  S - 单一职责原则（Single Responsibility）                  │
│  ──────────────────────────────────────────────────────────│
│  一个类只负责一件事                                         │
│  Bad:  UserService 处理登录、权限、日志                     │
│  Good: AuthService、PermissionService、LogService          │
│                                                              │
│  O - 开放封闭原则（Open/Closed）                           │
│  ──────────────────────────────────────────────────────────│
│  对扩展开放，对修改封闭                                     │
│  Bad:  修改原有代码添加新功能                               │
│  Good: 通过继承或组合扩展功能                               │
│                                                              │
│  L - 里氏替换原则（Liskov Substitution）                   │
│  ──────────────────────────────────────────────────────────│
│  子类可以替换父类                                           │
│  Bad:  子类重写父类方法改变行为                             │
│  Good: 子类扩展父类功能，保持接口一致                       │
│                                                              │
│  I - 接口隔离原则（Interface Segregation）                 │
│  ──────────────────────────────────────────────────────────│
│  多个专用接口优于一个通用接口                               │
│  Bad:  一个大接口包含所有方法                               │
│  Good: 拆分为多个小接口                                     │
│                                                              │
│  D - 依赖倒置原则（Dependency Inversion）                  │
│  ──────────────────────────────────────────────────────────│
│  依赖抽象而非具体实现                                       │
│  Bad:  高层模块直接依赖低层模块                             │
│  Good: 都依赖抽象接口                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
