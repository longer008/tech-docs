# Java 核心面试题集

> Java SE 核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. Java 基本数据类型

| 类型 | 大小 | 默认值 | 范围 |
|------|------|--------|------|
| byte | 1字节 | 0 | -128 ~ 127 |
| short | 2字节 | 0 | -32768 ~ 32767 |
| int | 4字节 | 0 | -2^31 ~ 2^31-1 |
| long | 8字节 | 0L | -2^63 ~ 2^63-1 |
| float | 4字节 | 0.0f | IEEE 754 |
| double | 8字节 | 0.0d | IEEE 754 |
| char | 2字节 | '\u0000' | 0 ~ 65535 |
| boolean | 1位 | false | true/false |

```java
// 自动装箱与拆箱
Integer a = 100;  // 自动装箱 Integer.valueOf(100)
int b = a;        // 自动拆箱 a.intValue()

// 整数缓存 (-128 ~ 127)
Integer x = 127;
Integer y = 127;
System.out.println(x == y);  // true（缓存）

Integer m = 128;
Integer n = 128;
System.out.println(m == n);  // false（新对象）
System.out.println(m.equals(n));  // true
```

---

#### 2. String、StringBuilder、StringBuffer

| 特性 | String | StringBuilder | StringBuffer |
|------|--------|---------------|--------------|
| 可变性 | 不可变 | 可变 | 可变 |
| 线程安全 | 是（不可变） | 否 | 是（synchronized） |
| 性能 | 拼接慢 | 最快 | 较快 |
| 使用场景 | 少量拼接 | 单线程大量拼接 | 多线程大量拼接 |

```java
// String 不可变性
String s1 = "hello";
String s2 = s1.concat(" world");  // s1 不变，返回新对象

// String 常量池
String a = "hello";
String b = "hello";
String c = new String("hello");
System.out.println(a == b);       // true（常量池）
System.out.println(a == c);       // false
System.out.println(a == c.intern());  // true（intern 返回常量池引用）

// StringBuilder 使用
StringBuilder sb = new StringBuilder();
sb.append("hello").append(" ").append("world");
String result = sb.toString();
```

---

#### 3. 面向对象三大特性

```java
// 封装
public class Person {
    private String name;  // 私有属性

    public String getName() {  // 公有方法访问
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

// 继承
public class Student extends Person {
    private String school;

    @Override
    public String toString() {
        return "Student: " + getName();
    }
}

// 多态
public interface Animal {
    void speak();
}

public class Dog implements Animal {
    @Override
    public void speak() {
        System.out.println("汪汪");
    }
}

public class Cat implements Animal {
    @Override
    public void speak() {
        System.out.println("喵喵");
    }
}

// 多态使用
Animal animal = new Dog();  // 父类引用指向子类对象
animal.speak();  // 运行时绑定，调用 Dog 的 speak
```

---

#### 4. == 与 equals 的区别

```java
// == 比较
// 基本类型：比较值
// 引用类型：比较内存地址

int a = 10, b = 10;
System.out.println(a == b);  // true

String s1 = new String("hello");
String s2 = new String("hello");
System.out.println(s1 == s2);      // false（不同对象）
System.out.println(s1.equals(s2)); // true（内容相同）

// equals 方法
// Object 默认：等同于 ==
// String/Integer 等：重写为比较内容

// 重写 equals 必须重写 hashCode
public class User {
    private Long id;
    private String name;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
```

---

#### 5. 异常处理机制

```
Throwable
├── Error（严重错误，不可恢复）
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── ...
└── Exception
    ├── RuntimeException（非受检异常）
    │   ├── NullPointerException
    │   ├── IndexOutOfBoundsException
    │   ├── IllegalArgumentException
    │   └── ...
    └── 其他 Exception（受检异常）
        ├── IOException
        ├── SQLException
        └── ...
```

```java
// try-catch-finally
public void readFile(String path) {
    FileInputStream fis = null;
    try {
        fis = new FileInputStream(path);
        // 读取文件
    } catch (FileNotFoundException e) {
        e.printStackTrace();
    } finally {
        if (fis != null) {
            try {
                fis.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}

// try-with-resources（推荐）
public void readFile(String path) {
    try (FileInputStream fis = new FileInputStream(path)) {
        // 读取文件
    } catch (IOException e) {
        e.printStackTrace();
    }
    // 自动关闭资源
}

// 自定义异常
public class BusinessException extends RuntimeException {
    private int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
}
```

---

### 进阶题

#### 6. 集合框架

```
Collection
├── List（有序，可重复）
│   ├── ArrayList（数组，查询快）
│   ├── LinkedList（链表，增删快）
│   └── Vector（线程安全，已过时）
├── Set（无序，不重复）
│   ├── HashSet（哈希表）
│   ├── LinkedHashSet（有序哈希表）
│   └── TreeSet（红黑树，有序）
└── Queue（队列）
    ├── LinkedList
    ├── PriorityQueue（优先队列）
    └── ArrayDeque（双端队列）

Map（键值对）
├── HashMap（哈希表）
├── LinkedHashMap（有序哈希表）
├── TreeMap（红黑树，有序）
├── Hashtable（线程安全，已过时）
└── ConcurrentHashMap（线程安全，推荐）
```

```java
// ArrayList vs LinkedList
ArrayList<String> arrayList = new ArrayList<>();
// 底层数组，默认容量 10，扩容 1.5 倍
// 随机访问 O(1)，插入删除 O(n)

LinkedList<String> linkedList = new LinkedList<>();
// 底层双向链表
// 随机访问 O(n)，插入删除 O(1)（已定位）

// HashMap 原理
// JDK 7: 数组 + 链表
// JDK 8: 数组 + 链表/红黑树（链表长度 > 8 且数组长度 >= 64 转红黑树）
// 默认容量 16，负载因子 0.75，扩容 2 倍
Map<String, Integer> map = new HashMap<>();
map.put("key", 1);  // hash(key) -> 数组下标 -> 链表/红黑树
```

---

#### 7. 反射机制

```java
// 获取 Class 对象
Class<?> clazz1 = String.class;
Class<?> clazz2 = "hello".getClass();
Class<?> clazz3 = Class.forName("java.lang.String");

// 创建实例
Object obj = clazz.getDeclaredConstructor().newInstance();

// 获取字段
Field field = clazz.getDeclaredField("name");
field.setAccessible(true);  // 访问私有字段
field.set(obj, "value");
Object value = field.get(obj);

// 获取方法
Method method = clazz.getDeclaredMethod("methodName", String.class);
method.setAccessible(true);
Object result = method.invoke(obj, "param");

// 获取注解
Annotation[] annotations = clazz.getAnnotations();
MyAnnotation ann = clazz.getAnnotation(MyAnnotation.class);
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "String 是基本类型" | String 是引用类型，不可变对象 |
| "final 修饰的变量不能修改" | final 修饰的引用不能重新赋值，但对象内容可变 |
| "static 变量线程安全" | static 变量多线程共享，需要同步 |
| "HashMap 是线程安全的" | HashMap 非线程安全，多线程用 ConcurrentHashMap |
| "try 块中 return 后 finally 不执行" | finally 始终执行（除非 JVM 退出） |

---

## B. 实战文档

### 速查链接

| 资源 | 链接 |
|------|------|
| Java SE 文档 | https://docs.oracle.com/en/java/javase/ |
| Java 规范 | https://docs.oracle.com/javase/specs/ |

### 常用代码片段

```java
// 字符串操作
String str = "  Hello World  ";
str.trim();                  // 去除首尾空格
str.toLowerCase();           // 转小写
str.toUpperCase();           // 转大写
str.substring(0, 5);         // 截取
str.split(" ");              // 分割
str.replace("o", "0");       // 替换
str.contains("Hello");       // 包含
str.startsWith("He");        // 开头
str.endsWith("ld");          // 结尾
String.format("Hello %s", "World");  // 格式化
String.join(", ", list);     // 连接

// 集合操作
List<String> list = new ArrayList<>();
list.add("a");
list.addAll(Arrays.asList("b", "c"));
list.remove("a");
list.contains("b");
list.size();
list.isEmpty();
list.clear();
Collections.sort(list);
Collections.reverse(list);
Collections.shuffle(list);

// Stream API
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
numbers.stream()
    .filter(n -> n > 2)
    .map(n -> n * 2)
    .sorted()
    .distinct()
    .limit(3)
    .collect(Collectors.toList());

// Optional
Optional<String> opt = Optional.ofNullable(str);
opt.isPresent();
opt.orElse("default");
opt.orElseGet(() -> "default");
opt.orElseThrow(() -> new RuntimeException());
opt.map(String::toUpperCase);
opt.flatMap(this::findById);
```
