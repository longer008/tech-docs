# JUC 并发面试题集

> Java 并发编程核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. 线程创建方式

```java
// 1. 继承 Thread 类
public class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Thread running");
    }
}
new MyThread().start();

// 2. 实现 Runnable 接口（推荐）
public class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("Runnable running");
    }
}
new Thread(new MyRunnable()).start();
// Lambda 写法
new Thread(() -> System.out.println("Lambda")).start();

// 3. 实现 Callable 接口（有返回值）
public class MyCallable implements Callable<String> {
    @Override
    public String call() throws Exception {
        return "Callable result";
    }
}
FutureTask<String> task = new FutureTask<>(new MyCallable());
new Thread(task).start();
String result = task.get();  // 阻塞获取结果

// 4. 线程池（推荐）
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> System.out.println("Pool"));
executor.shutdown();
```

---

#### 2. 线程状态与生命周期

```
NEW（新建）
  │ start()
  ↓
RUNNABLE（可运行）←──────────────────────┐
  │                                      │
  ├─ synchronized ──→ BLOCKED（阻塞）────┘
  │                   等待获取锁
  │
  ├─ wait()/join()/park() ──→ WAITING（等待）
  │                            notify()/unpark()
  │                            ↓
  │                           RUNNABLE
  │
  ├─ sleep(n)/wait(n)/join(n) ──→ TIMED_WAITING（超时等待）
  │                                 超时或被唤醒
  │                                 ↓
  │                                RUNNABLE
  ↓
TERMINATED（终止）
```

```java
Thread thread = new Thread(() -> {});
System.out.println(thread.getState());  // NEW

thread.start();
System.out.println(thread.getState());  // RUNNABLE

// 获取当前线程
Thread current = Thread.currentThread();

// 线程常用方法
thread.start();        // 启动线程
thread.join();         // 等待线程执行完成
thread.join(1000);     // 最多等待 1 秒
Thread.sleep(1000);    // 当前线程睡眠 1 秒
Thread.yield();        // 让出 CPU 时间片
thread.interrupt();    // 中断线程
thread.isInterrupted();// 检查中断标志
Thread.interrupted();  // 检查并清除中断标志
```

---

#### 3. synchronized 关键字

```java
// 1. 同步方法（锁对象是 this）
public synchronized void method() {
    // 临界区
}

// 2. 同步静态方法（锁对象是 Class）
public static synchronized void staticMethod() {
    // 临界区
}

// 3. 同步代码块
public void method() {
    synchronized (this) {
        // 临界区
    }

    synchronized (SomeClass.class) {
        // 临界区
    }

    synchronized (lockObject) {
        // 临界区
    }
}
```

**synchronized 原理：**
- 基于对象头的 Mark Word
- JDK 6 后优化：偏向锁 → 轻量级锁 → 重量级锁

| 锁类型 | 说明 | 适用场景 |
|--------|------|---------|
| 偏向锁 | 第一个线程获取，CAS 记录线程 ID | 单线程访问 |
| 轻量级锁 | CAS 自旋获取锁 | 少量竞争，短时间持有 |
| 重量级锁 | 阻塞等待，操作系统互斥量 | 大量竞争 |

---

#### 4. volatile 关键字

```java
public class VolatileExample {
    private volatile boolean running = true;

    public void stop() {
        running = false;
    }

    public void run() {
        while (running) {
            // do something
        }
    }
}
```

**volatile 特性：**
1. **可见性**：一个线程修改后，其他线程立即可见
2. **禁止指令重排序**：通过内存屏障实现
3. **不保证原子性**：`i++` 仍然不是原子操作

**适用场景：**
- 状态标志
- 双重检查锁定（DCL）
- 一写多读

---

#### 5. 线程池参数详解

```java
public ThreadPoolExecutor(
    int corePoolSize,      // 核心线程数
    int maximumPoolSize,   // 最大线程数
    long keepAliveTime,    // 空闲线程存活时间
    TimeUnit unit,         // 时间单位
    BlockingQueue<Runnable> workQueue,  // 工作队列
    ThreadFactory threadFactory,         // 线程工厂
    RejectedExecutionHandler handler     // 拒绝策略
)

// 常用线程池
Executors.newFixedThreadPool(n);      // 固定大小
Executors.newCachedThreadPool();      // 可缓存（核心 0，最大 Integer.MAX）
Executors.newSingleThreadExecutor();  // 单线程
Executors.newScheduledThreadPool(n);  // 定时任务

// 推荐手动创建
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5,                               // 核心线程数
    10,                              // 最大线程数
    60L, TimeUnit.SECONDS,           // 空闲 60 秒回收
    new LinkedBlockingQueue<>(100),  // 有界队列
    new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
);
```

**任务执行流程：**
```
提交任务
    │
    ↓
核心线程数未满? ──是──→ 创建核心线程执行
    │
    否
    ↓
工作队列未满? ──是──→ 加入队列等待
    │
    否
    ↓
最大线程数未满? ──是──→ 创建非核心线程执行
    │
    否
    ↓
执行拒绝策略
```

**拒绝策略：**
| 策略 | 说明 |
|------|------|
| AbortPolicy | 抛出 RejectedExecutionException（默认） |
| CallerRunsPolicy | 调用者线程执行任务 |
| DiscardPolicy | 直接丢弃任务 |
| DiscardOldestPolicy | 丢弃队列最老任务 |

---

### 进阶题

#### 6. AQS (AbstractQueuedSynchronizer)

```java
// AQS 是 JUC 锁的基础框架
// 核心：state 变量 + CLH 队列

// 基于 AQS 实现的锁
// - ReentrantLock
// - ReentrantReadWriteLock
// - Semaphore
// - CountDownLatch
// - CyclicBarrier

// 简化的 AQS 结构
public abstract class AbstractQueuedSynchronizer {
    private volatile int state;  // 同步状态
    private transient volatile Node head;  // CLH 队列头
    private transient volatile Node tail;  // CLH 队列尾

    // 获取锁
    protected boolean tryAcquire(int arg);
    // 释放锁
    protected boolean tryRelease(int arg);
}
```

---

#### 7. 并发工具类

```java
// CountDownLatch - 等待多个线程完成
CountDownLatch latch = new CountDownLatch(3);
for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        try {
            // 执行任务
        } finally {
            latch.countDown();  // 计数减 1
        }
    }).start();
}
latch.await();  // 等待计数为 0
System.out.println("所有任务完成");

// CyclicBarrier - 多线程相互等待
CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("所有线程到达屏障");
});
for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        // 执行任务
        barrier.await();  // 等待其他线程
        // 继续执行
    }).start();
}

// Semaphore - 信号量
Semaphore semaphore = new Semaphore(3);  // 3 个许可
semaphore.acquire();  // 获取许可
try {
    // 访问共享资源
} finally {
    semaphore.release();  // 释放许可
}

// ReentrantLock
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // 临界区
} finally {
    lock.unlock();
}

// 公平锁
ReentrantLock fairLock = new ReentrantLock(true);

// 读写锁
ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
rwLock.readLock().lock();   // 读锁（共享）
rwLock.writeLock().lock();  // 写锁（独占）
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "volatile 能保证原子性" | volatile 只保证可见性和有序性 |
| "synchronized 性能很差" | JDK 6 后大幅优化，偏向锁/轻量级锁 |
| "线程池越大越好" | 过大会导致上下文切换开销 |
| "start() 和 run() 一样" | start() 创建新线程，run() 是普通方法调用 |
| "Executors 创建线程池没问题" | 有 OOM 风险，推荐手动创建 |

---

## B. 实战文档

### 线程池配置建议

```java
// CPU 密集型
int cpuCores = Runtime.getRuntime().availableProcessors();
// 线程数 = CPU 核心数 + 1

// IO 密集型
// 线程数 = CPU 核心数 * 2
// 或 CPU 核心数 / (1 - 阻塞系数)

// 生产环境配置示例
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    cpuCores,                                    // 核心线程数
    cpuCores * 2,                                // 最大线程数
    60L, TimeUnit.SECONDS,                       // 空闲时间
    new ArrayBlockingQueue<>(1000),              // 有界队列
    new ThreadFactoryBuilder().setNameFormat("pool-%d").build(),
    new ThreadPoolExecutor.CallerRunsPolicy()   // 拒绝策略
);

// 优雅关闭
executor.shutdown();
if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
    executor.shutdownNow();
}
```

### 常见并发问题

```java
// 死锁示例
Object lock1 = new Object();
Object lock2 = new Object();

// 线程 1
synchronized (lock1) {
    Thread.sleep(100);
    synchronized (lock2) { }
}

// 线程 2
synchronized (lock2) {
    Thread.sleep(100);
    synchronized (lock1) { }  // 死锁！
}

// 解决方案
// 1. 固定加锁顺序
// 2. 使用 tryLock 超时
// 3. 使用 Lock 的 lockInterruptibly
```
