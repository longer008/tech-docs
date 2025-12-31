# Day 1: JavaScript/Java 核心概念

> 第一天重点：夯实语言基础，掌握核心概念

## 今日目标

- [ ] 掌握 JavaScript 数据类型与类型转换
- [ ] 理解作用域、闭包、原型链
- [ ] 熟悉异步编程（Promise、async/await）
- [ ] 掌握 Java 基础语法与面向对象
- [ ] 理解 JVM 内存模型与垃圾回收
- [ ] 完成 3 道手写题练习

---

## Part A: JavaScript 核心

### 1. 数据类型

#### Q1: JavaScript 有哪些数据类型？

**答案：**
```
基本类型（7种）：
- number    数字
- string    字符串
- boolean   布尔值
- undefined 未定义
- null      空值
- symbol    符号（ES6）
- bigint    大整数（ES2020）

引用类型（1种）：
- object    对象（包括 Array、Function、Date、RegExp 等）
```

**区别：**
```javascript
// 基本类型存储在栈中，按值访问
let a = 10;
let b = a;
b = 20;
console.log(a); // 10（不受影响）

// 引用类型存储在堆中，栈中存储引用地址
let obj1 = { name: 'Alice' };
let obj2 = obj1;
obj2.name = 'Bob';
console.log(obj1.name); // 'Bob'（被修改）
```

---

#### Q2: typeof 和 instanceof 的区别？

**答案：**
```javascript
// typeof：返回基本类型字符串
typeof 123;           // 'number'
typeof 'hello';       // 'string'
typeof true;          // 'boolean'
typeof undefined;     // 'undefined'
typeof Symbol();      // 'symbol'
typeof 123n;          // 'bigint'

// 注意特殊情况
typeof null;          // 'object'（历史遗留 bug）
typeof [];            // 'object'
typeof {};            // 'object'
typeof function() {}; // 'function'

// instanceof：检测构造函数的 prototype 是否在对象的原型链上
[] instanceof Array;   // true
[] instanceof Object;  // true
{} instanceof Object;  // true

function Person() {}
const p = new Person();
p instanceof Person;   // true
p instanceof Object;   // true
```

**准确判断类型的方法：**
```javascript
Object.prototype.toString.call([]);      // '[object Array]'
Object.prototype.toString.call({});      // '[object Object]'
Object.prototype.toString.call(null);    // '[object Null]'
Object.prototype.toString.call(undefined); // '[object Undefined]'
```

---

#### Q3: == 和 === 的区别？

**答案：**
```javascript
// === 严格相等：类型和值都必须相同
1 === 1;        // true
1 === '1';      // false
null === undefined; // false

// == 宽松相等：会进行类型转换
1 == '1';       // true（字符串转数字）
null == undefined; // true
0 == false;     // true
'' == false;    // true

// 类型转换规则
// 1. 如果有布尔值，转为数字（true→1, false→0）
// 2. 如果一个是字符串一个是数字，字符串转数字
// 3. 如果有对象，调用 valueOf() 或 toString()
// 4. null 和 undefined 相等，与其他值不等
```

**面试建议：始终使用 ===，避免隐式类型转换的坑**

---

### 2. 作用域与闭包

#### Q4: var、let、const 的区别？

**答案：**
```javascript
// 1. 作用域不同
if (true) {
  var a = 1;    // 函数作用域
  let b = 2;    // 块级作用域
  const c = 3;  // 块级作用域
}
console.log(a); // 1
console.log(b); // ReferenceError
console.log(c); // ReferenceError

// 2. 变量提升
console.log(x); // undefined（var 会提升）
var x = 1;

console.log(y); // ReferenceError（暂时性死区）
let y = 1;

// 3. 重复声明
var a = 1;
var a = 2;      // 允许

let b = 1;
let b = 2;      // SyntaxError

// 4. 全局对象属性
var globalVar = 1;
console.log(window.globalVar); // 1

let globalLet = 1;
console.log(window.globalLet); // undefined

// 5. const 必须初始化且不可重新赋值
const PI = 3.14;
PI = 3.15;      // TypeError

const obj = { a: 1 };
obj.a = 2;      // 允许（对象内容可变）
obj = {};       // TypeError（引用不可变）
```

---

#### Q5: 什么是闭包？有什么应用场景？

**答案：**
```javascript
// 闭包定义：函数能够访问其词法作用域外的变量
function outer() {
  let count = 0;

  return function inner() {
    count++;
    return count;
  };
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
// inner 函数「记住」了 outer 的 count 变量

// 应用场景 1：数据私有化
function createPerson(name) {
  let _age = 0;  // 私有变量

  return {
    getName: () => name,
    getAge: () => _age,
    setAge: (age) => {
      if (age > 0) _age = age;
    }
  };
}

// 应用场景 2：函数柯里化
function add(a) {
  return function(b) {
    return a + b;
  };
}
const add5 = add(5);
console.log(add5(3)); // 8

// 应用场景 3：防抖节流
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 应用场景 4：模块模式
const module = (function() {
  let privateData = 'secret';

  return {
    getData: () => privateData,
    setData: (data) => { privateData = data; }
  };
})();
```

**闭包的内存问题：**
```javascript
// 闭包会使变量一直存在于内存中，可能导致内存泄漏
function createClosures() {
  const arr = [];
  for (var i = 0; i < 10000; i++) {
    arr.push(function() { return i; });
  }
  return arr;
}
// 解决：及时解除引用，或使用 let 替代 var
```

---

### 3. 原型与继承

#### Q6: 请解释原型链

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    原型链示意图                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  实例对象                                                   │
│     │                                                       │
│     │ __proto__                                             │
│     ▼                                                       │
│  构造函数.prototype（原型对象）                             │
│     │                                                       │
│     │ __proto__                                             │
│     ▼                                                       │
│  Object.prototype                                           │
│     │                                                       │
│     │ __proto__                                             │
│     ▼                                                       │
│   null（原型链终点）                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
function Person(name) {
  this.name = name;
}
Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const person = new Person('Alice');

// 原型链查找过程
person.sayHello();     // 在 Person.prototype 上找到
person.toString();     // 在 Object.prototype 上找到
person.xxx;            // 沿原型链查找直到 null，返回 undefined

// 验证原型链
console.log(person.__proto__ === Person.prototype);        // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null);          // true

// 重要属性
console.log(Person.prototype.constructor === Person);      // true
console.log(person.constructor === Person);                // true
```

---

#### Q7: new 操作符做了什么？手写 new

**答案：**
```javascript
// new 操作符的执行过程：
// 1. 创建一个新的空对象
// 2. 将新对象的 __proto__ 指向构造函数的 prototype
// 3. 将 this 绑定到新对象，执行构造函数
// 4. 如果构造函数返回对象，则返回该对象；否则返回新对象

function myNew(Constructor, ...args) {
  // 1. 创建新对象，并设置原型
  const obj = Object.create(Constructor.prototype);

  // 2. 执行构造函数，绑定 this
  const result = Constructor.apply(obj, args);

  // 3. 判断返回值
  return result instanceof Object ? result : obj;
}

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const p1 = myNew(Person, 'Alice', 25);
console.log(p1.name);  // 'Alice'
p1.sayHello();         // "Hello, I'm Alice"
console.log(p1 instanceof Person); // true
```

---

### 4. 异步编程

#### Q8: 事件循环（Event Loop）是什么？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    事件循环机制                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  执行顺序：同步代码 → 微任务 → 宏任务                       │
│                                                              │
│  宏任务（Macro Task）：                                     │
│  - script 整体代码                                          │
│  - setTimeout / setInterval                                 │
│  - setImmediate (Node.js)                                   │
│  - I/O 操作                                                 │
│  - UI 渲染                                                  │
│                                                              │
│  微任务（Micro Task）：                                     │
│  - Promise.then/catch/finally                               │
│  - process.nextTick (Node.js)                               │
│  - MutationObserver                                         │
│  - queueMicrotask                                           │
│                                                              │
│  执行流程：                                                  │
│  1. 执行同步代码（属于宏任务）                              │
│  2. 执行完所有同步代码后，检查微任务队列                    │
│  3. 执行所有微任务                                          │
│  4. 执行下一个宏任务                                        │
│  5. 重复 2-4                                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
}, 0);

Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => console.log('5'), 0);
});

console.log('6');

// 输出顺序：1 6 4 2 3 5
// 解析：
// 1. 同步：1, 6
// 2. 微任务：4（这里又添加了一个宏任务 setTimeout）
// 3. 宏任务：2（这里又添加了一个微任务）
// 4. 微任务：3
// 5. 宏任务：5
```

---

#### Q9: 手写 Promise

**答案：**
```javascript
class MyPromise {
  static PENDING = 'pending';
  static FULFILLED = 'fulfilled';
  static REJECTED = 'rejected';

  constructor(executor) {
    this.status = MyPromise.PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.status === MyPromise.PENDING) {
        this.status = MyPromise.FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.status === MyPromise.PENDING) {
        this.status = MyPromise.REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e };

    const promise2 = new MyPromise((resolve, reject) => {
      const fulfilledMicrotask = () => {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      };

      const rejectedMicrotask = () => {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      };

      if (this.status === MyPromise.FULFILLED) {
        fulfilledMicrotask();
      } else if (this.status === MyPromise.REJECTED) {
        rejectedMicrotask();
      } else {
        this.onFulfilledCallbacks.push(fulfilledMicrotask);
        this.onRejectedCallbacks.push(rejectedMicrotask);
      }
    });

    return promise2;
  }

  resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      return reject(new TypeError('Chaining cycle detected'));
    }
    if (x instanceof MyPromise) {
      x.then(resolve, reject);
    } else {
      resolve(x);
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason })
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise(resolve => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let count = 0;

      if (promises.length === 0) {
        resolve(results);
        return;
      }

      promises.forEach((p, i) => {
        MyPromise.resolve(p).then(value => {
          results[i] = value;
          if (++count === promises.length) {
            resolve(results);
          }
        }).catch(reject);
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(p => {
        MyPromise.resolve(p).then(resolve).catch(reject);
      });
    });
  }
}
```

---

#### Q10: 手写 bind/call/apply

**答案：**
```javascript
// 手写 call
Function.prototype.myCall = function(context, ...args) {
  context = context || window;
  const fn = Symbol('fn');
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

// 手写 apply
Function.prototype.myApply = function(context, args = []) {
  context = context || window;
  const fn = Symbol('fn');
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

// 手写 bind
Function.prototype.myBind = function(context, ...args) {
  const self = this;

  const fBound = function(...innerArgs) {
    // 如果是 new 调用，this 指向实例
    return self.apply(
      this instanceof fBound ? this : context,
      [...args, ...innerArgs]
    );
  };

  // 维护原型链
  fBound.prototype = Object.create(this.prototype);
  return fBound;
};

// 测试
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: 'Alice' };

greet.myCall(person, 'Hello', '!');    // Hello, Alice!
greet.myApply(person, ['Hi', '?']);    // Hi, Alice?

const boundGreet = greet.myBind(person, 'Hey');
boundGreet('~');                        // Hey, Alice~
```

---

## Part B: Java 核心

### 1. 基础语法

#### Q11: Java 基本数据类型有哪些？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    Java 基本数据类型                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  类型        字节    默认值      范围                        │
│  ──────────────────────────────────────────────────────────│
│  byte        1       0          -128 ~ 127                  │
│  short       2       0          -32768 ~ 32767              │
│  int         4       0          -2^31 ~ 2^31-1              │
│  long        8       0L         -2^63 ~ 2^63-1              │
│  float       4       0.0f       IEEE 754                    │
│  double      8       0.0d       IEEE 754                    │
│  char        2       '\u0000'   0 ~ 65535                   │
│  boolean     1       false      true/false                  │
│                                                              │
│  包装类：Byte, Short, Integer, Long, Float, Double,        │
│          Character, Boolean                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```java
// 自动装箱与拆箱
Integer a = 100;      // 自动装箱：Integer.valueOf(100)
int b = a;            // 自动拆箱：a.intValue()

// Integer 缓存池（-128 ~ 127）
Integer c = 127;
Integer d = 127;
System.out.println(c == d);  // true（缓存池）

Integer e = 128;
Integer f = 128;
System.out.println(e == f);  // false（新对象）
System.out.println(e.equals(f)); // true
```

---

#### Q12: String、StringBuilder、StringBuffer 的区别？

**答案：**
```java
// String：不可变，每次修改都会创建新对象
String s1 = "hello";
s1 = s1 + " world";  // 创建了新的 String 对象

// StringBuilder：可变，线程不安全，效率高
StringBuilder sb = new StringBuilder();
sb.append("hello");
sb.append(" world");
String s2 = sb.toString();

// StringBuffer：可变，线程安全（synchronized），效率较低
StringBuffer sbf = new StringBuffer();
sbf.append("hello");
sbf.append(" world");
String s3 = sbf.toString();

// 使用场景：
// - 少量字符串操作：String
// - 单线程大量字符串操作：StringBuilder
// - 多线程大量字符串操作：StringBuffer
```

**String 不可变的原因：**
```java
public final class String {
    private final char value[];  // final + private
    // Java 9+ 改为 byte[]
}
// 1. String 类被 final 修饰，不能被继承
// 2. value 数组被 private final 修饰
// 3. 不提供修改 value 的方法
```

---

### 2. 面向对象

#### Q13: 面向对象三大特性

**答案：**
```java
// 1. 封装：隐藏内部实现，暴露公共接口
public class Person {
    private String name;  // 私有属性
    private int age;

    public String getName() { return name; }
    public void setAge(int age) {
        if (age > 0) this.age = age;  // 校验逻辑
    }
}

// 2. 继承：子类继承父类的属性和方法
public class Student extends Person {
    private String school;

    @Override
    public String toString() {
        return "Student: " + getName();
    }
}

// 3. 多态：同一行为的不同实现
public interface Animal {
    void speak();
}

public class Dog implements Animal {
    @Override
    public void speak() { System.out.println("Woof!"); }
}

public class Cat implements Animal {
    @Override
    public void speak() { System.out.println("Meow!"); }
}

// 多态调用
Animal animal = new Dog();
animal.speak();  // Woof!

animal = new Cat();
animal.speak();  // Meow!
```

---

#### Q14: 接口和抽象类的区别？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    接口 vs 抽象类                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性              接口                  抽象类              │
│  ──────────────────────────────────────────────────────────│
│  关键字            interface             abstract class     │
│  方法              默认 public abstract  可以有具体方法     │
│  变量              默认 public static    可以有普通变量     │
│                    final                                    │
│  构造器            无                    有                  │
│  继承              多实现                单继承              │
│  设计层面          定义行为规范          定义共同特征        │
│                                                              │
│  Java 8+ 接口新特性：                                       │
│  - default 方法（默认实现）                                 │
│  - static 方法                                              │
│  - private 方法（Java 9+）                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```java
// 接口示例
public interface Flyable {
    void fly();  // 抽象方法

    default void land() {  // 默认方法
        System.out.println("Landing...");
    }

    static void info() {  // 静态方法
        System.out.println("Flyable interface");
    }
}

// 抽象类示例
public abstract class Bird {
    protected String name;

    public Bird(String name) {
        this.name = name;
    }

    public abstract void sing();  // 抽象方法

    public void eat() {  // 具体方法
        System.out.println(name + " is eating");
    }
}

// 使用场景：
// - 接口：定义能力/行为，多个不相关的类可以共同实现
// - 抽象类：定义模板，有 is-a 关系的类继承
```

---

### 3. 集合框架

#### Q15: HashMap 的原理？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    HashMap 结构（JDK 8+）                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  数组 + 链表 + 红黑树                                       │
│                                                              │
│  ┌───┬───┬───┬───┬───┬───┬───┬───┐                        │
│  │ 0 │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │  数组（桶）             │
│  └─┬─┴───┴─┬─┴───┴───┴─┬─┴───┴───┘                        │
│    │       │           │                                    │
│    ▼       ▼           ▼                                    │
│   [A]     [C]         [E]      链表节点                     │
│    │       │           │                                    │
│    ▼       ▼           ▼                                    │
│   [B]     [D]         [F]                                   │
│            │           │                                    │
│            ▼           ▼                                    │
│           null      红黑树（节点数 > 8）                    │
│                                                              │
│  关键参数：                                                  │
│  - 默认初始容量：16                                         │
│  - 加载因子：0.75                                           │
│  - 树化阈值：8（链表转红黑树）                              │
│  - 退化阈值：6（红黑树转链表）                              │
│  - 树化最小容量：64                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```java
// put 过程
// 1. 计算 key 的 hash 值：(h = key.hashCode()) ^ (h >>> 16)
// 2. 计算桶位置：(n - 1) & hash
// 3. 如果桶为空，直接放入
// 4. 如果桶不为空：
//    - 如果 key 相同（equals），更新 value
//    - 如果是红黑树，调用树的插入方法
//    - 否则遍历链表，尾插法插入
// 5. 检查是否需要树化或扩容

// 扩容机制
// - 容量翻倍：newCap = oldCap << 1
// - 重新计算位置：要么在原位置，要么在原位置+旧容量

// 线程不安全问题
// - JDK 7：头插法，并发扩容可能形成环形链表
// - JDK 8：尾插法，解决了环形链表问题，但仍有数据覆盖问题
```

---

#### Q16: ArrayList 和 LinkedList 的区别？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    ArrayList vs LinkedList                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  特性              ArrayList           LinkedList           │
│  ──────────────────────────────────────────────────────────│
│  底层结构          动态数组             双向链表             │
│  随机访问          O(1)                 O(n)                │
│  头部插入/删除      O(n)                 O(1)                │
│  尾部插入          O(1) 均摊            O(1)                │
│  中间插入/删除      O(n)                 O(n)                │
│  内存占用          连续内存             分散内存+指针        │
│  扩容              1.5 倍扩容           无需扩容             │
│  缓存友好          是                   否                   │
│                                                              │
│  使用场景：                                                  │
│  - ArrayList：随机访问多，增删少                            │
│  - LinkedList：头部增删多，不需要随机访问                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```java
// ArrayList 扩容
public boolean add(E e) {
    ensureCapacityInternal(size + 1);  // 检查容量
    elementData[size++] = e;
    return true;
}

private void grow(int minCapacity) {
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1);  // 1.5 倍
    // ...
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

---

### 4. JVM 基础

#### Q17: JVM 内存区域有哪些？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    JVM 内存结构                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  线程私有：                                                  │
│  ├── 程序计数器（Program Counter）                          │
│  │   - 当前线程执行的字节码行号                             │
│  │   - 唯一不会 OOM 的区域                                  │
│  │                                                          │
│  ├── 虚拟机栈（VM Stack）                                   │
│  │   - 每个方法对应一个栈帧                                 │
│  │   - 栈帧包含：局部变量表、操作数栈、动态链接、返回地址   │
│  │   - StackOverflowError / OutOfMemoryError               │
│  │                                                          │
│  └── 本地方法栈（Native Method Stack）                      │
│      - 为 Native 方法服务                                   │
│                                                              │
│  线程共享：                                                  │
│  ├── 堆（Heap）                                             │
│  │   - 对象实例和数组                                       │
│  │   - 分代：新生代（Eden、S0、S1）、老年代                 │
│  │   - GC 主要区域                                          │
│  │   - OutOfMemoryError                                     │
│  │                                                          │
│  └── 方法区（Method Area）/ 元空间（Metaspace）             │
│      - 类信息、常量、静态变量                               │
│      - JDK 8 后使用本地内存实现                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### Q18: 垃圾回收算法有哪些？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    垃圾回收算法                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 标记-清除（Mark-Sweep）                                 │
│     过程：标记存活对象 → 清除未标记对象                     │
│     缺点：产生内存碎片                                      │
│                                                              │
│  2. 标记-复制（Mark-Copy）                                  │
│     过程：将存活对象复制到另一块区域                        │
│     优点：无碎片                                            │
│     缺点：空间利用率低（50%）                               │
│     应用：新生代（Eden:S0:S1 = 8:1:1）                      │
│                                                              │
│  3. 标记-整理（Mark-Compact）                               │
│     过程：标记存活对象 → 移动到一端 → 清除边界外内存        │
│     优点：无碎片                                            │
│     缺点：移动对象开销大                                    │
│     应用：老年代                                            │
│                                                              │
│  分代收集：                                                  │
│  - 新生代：标记-复制（对象存活率低）                        │
│  - 老年代：标记-清除/标记-整理（对象存活率高）              │
│                                                              │
│  常见收集器：                                                │
│  - Serial：单线程，STW                                      │
│  - ParNew：Serial 多线程版                                  │
│  - CMS：并发标记清除，低延迟                                │
│  - G1：分区收集，可预测停顿                                 │
│  - ZGC：超低延迟（<10ms）                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 今日手写题练习

### 练习 1：实现防抖函数
```javascript
function debounce(fn, delay, immediate = false) {
  let timer = null;

  return function(...args) {
    const callNow = immediate && !timer;

    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        fn.apply(this, args);
      }
    }, delay);

    if (callNow) {
      fn.apply(this, args);
    }
  };
}
```

### 练习 2：实现深拷贝
```javascript
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);

  if (map.has(obj)) return map.get(obj);

  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);

  for (const key of Reflect.ownKeys(obj)) {
    clone[key] = deepClone(obj[key], map);
  }

  return clone;
}
```

### 练习 3：实现数组扁平化
```javascript
// 方法 1：递归
function flatten(arr, depth = 1) {
  return depth > 0
    ? arr.reduce((acc, val) =>
        acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])
    : arr.slice();
}

// 方法 2：迭代
function flattenIterative(arr) {
  const result = [];
  const stack = [...arr];

  while (stack.length) {
    const item = stack.pop();
    if (Array.isArray(item)) {
      stack.push(...item);
    } else {
      result.unshift(item);
    }
  }

  return result;
}
```

---

## 复习检查清单

- [ ] 能准确说出 7 种基本数据类型
- [ ] 理解 == 和 === 的区别
- [ ] 能解释闭包并举例应用场景
- [ ] 能画出原型链图并解释查找过程
- [ ] 理解事件循环，能分析输出顺序
- [ ] 手写 Promise 基本版本
- [ ] 手写 bind/call/apply
- [ ] 理解 HashMap 的结构和 put 过程
- [ ] 能说出 JVM 内存区域
- [ ] 理解分代收集的原因

---

> 明日预告：Day 2 - 数据结构与算法基础
