# Java 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:JDK、JRE、JVM 的区别？
- 标准答案:JDK=JRE+开发工具链（编译器、调试器、javadoc 等），面向开发；JRE=JVM+核心类库，面向运行；JVM 负责字节码加载、验证、执行与内存管理，是跨平台抽象。
- 追问点:为何 JDK 里还有 src.zip；JVM 与 HotSpot 的关系；server/client VM 差异。
- 参考:https://docs.oracle.com/javase/

### Q2:`HashMap` 的底层结构与扩容机制？
- 标准答案:1.8 以后为数组+链表/红黑树；根据 hash&(n-1) 定位桶，链表长度>8 且容量>=64 时树化；装载因子默认 0.75，触发扩容时容量翻倍并重新计算索引（高位运算拆分）。
- 追问点:为何选择 0.75；并发下线程安全问题；树化与退化回链表的阈值。
- 参考:https://docs.oracle.com/javase/8/docs/api/java/util/HashMap.html

### Q3:`equals` 与 `hashCode` 约定？
- 标准答案:相等对象必须有相等 hashCode；`equals` 自反/对称/传递/一致性且非空性；覆写 `equals` 必须同步覆写 `hashCode`，否则集合行为异常。
- 追问点:如何在继承体系中保持一致性；记录类/IDE 生成的实现；与 `compareTo` 的关系。
- 参考:https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html

### Q4:创建线程的常见方式及差异？
- 标准答案:继承 Thread、实现 Runnable、实现 Callable 配合 Future/Executor、使用线程池；推荐通过线程池管理生命周期和资源；Callable 可返回结果/抛出受检异常。
- 追问点:线程池为何避免频繁创建销毁；自定义线程工厂作用；守护线程 vs 用户线程。
- 参考:https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/package-summary.html

### Q5:常见 GC 收集器及适用场景？
- 标准答案:串行/ParNew、Parallel Scavenge、CMS、G1、ZGC、Shenandoah；吞吐优先选 Parallel，低停顿选 G1/ZGC，CMS 经典但已被标记为 deprecated；根据堆大小、延迟目标选择。
- 追问点:STW 触发点；新生代/老年代算法差异；如何通过 `-XX:+PrintGCDetails` 分析。
- 参考:https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/

### Q6:Java 内存模型(JMM)的可见性/有序性/原子性？
- 标准答案:JMM 定义主内存与线程工作内存的抽象；`volatile` 提供可见性与禁止指令重排（部分有序）；原子性由锁/原子类保证；happens-before 规则确保内存效果先行。
- 追问点:volatile 不能保证复合操作原子性；final 的安全发布；DCL 需要 volatile。
- 参考:https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html

### Q7:`HashMap` 与 `ConcurrentHashMap` 的差异？
- 标准答案:ConcurrentHashMap 1.8 用 CAS+分段桶+链表/红黑树，读写均无全表锁；遍历弱一致性；不允许 null 键值；size 为近似值；HashMap 非线程安全。
- 追问点:为什么不支持 null；迭代时修改的行为；并发度如何影响性能。
- 参考:https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ConcurrentHashMap.html

### Q8:线程安全与锁优化手段？
- 标准答案:内置锁(synchronized) 与 显式锁(ReentrantLock)、读写锁；锁消除/锁粗化/偏向锁/轻量级锁等 JVM 优化；无锁方案如原子类、LongAdder。
- 追问点:ReentrantLock 的公平性设置；Condition 与 wait/notify 的区别；自旋锁的适用场景。
- 参考:https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/package-summary.html

### Q9:类加载过程与双亲委派？
- 标准答案:加载→验证→准备→解析→初始化；ClassLoader 按父→子委派防止重复加载与安全隔离；可通过自定义加载器打破委派（SPI/插件场景）。
- 追问点:什么时候会出现 NoClassDefFoundError vs ClassNotFoundException；线程上下文类加载器作用；热加载实现思路。
- 参考:https://docs.oracle.com/javase/8/docs/specs/jvms/se8/html/jvms-5.html

### Q10:Java 常见集合选型要点？
- 标准答案:顺序且可变用 ArrayList，频繁头插/删除用 LinkedList；去重用 HashSet/LinkedHashSet，排序用 TreeSet；高并发读多写少用 CopyOnWriteArrayList/Map；阻塞队列分 SynchronousQueue/ArrayBlockingQueue/LinkedBlockingQueue 等。
- 追问点:Iterator fail-fast 机制；`Arrays.asList` 的坑；为什么 HashSet 内部用 HashMap 实现。
- 参考:https://docs.oracle.com/javase/8/docs/technotes/guides/collections/overview.html

## 场景/排查
### Q1:线上 CPU 飙高伴随频繁 GC，如何定位？
- 标准答案:1) jps 找进程；2) jstat -gc/-gccause 观察 GC 频率与原因；3) jmap -heap / jmap -histo 观察对象分布；4) jstack 查看热点线程与死锁；5) 结合 GC 日志分析是否存在内存泄漏或分配速率过快；6) 优化代码或调优堆/收集器。
- 追问点:安全导出堆的注意事项；如何在线上限制风险；何时需要重启/限流。
- 参考:https://docs.oracle.com/javase/8/docs/technotes/tools/unix/

### Q2:如何设置线程池参数避免 OOM？
- 标准答案:根据 CPU/IO 比例估算核心数；明确最大线程数、队列类型与大小；拒绝策略选择（Abort/CallerRuns/Discard/DiscardOldest）；为线程命名便于排查；避免使用无界队列+无限制最大线程。
- 追问点:IO 密集公式；为什么不建议直接用 Executors 默认工厂；自定义饱和策略示例。
- 参考:https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ThreadPoolExecutor.html

## 反问
### Q1:团队的 Java 版本与 GC 策略如何选择？是否允许尝试 G1/ZGC？
- 标准答案:可用此问题了解技术栈现代化程度、性能目标与上线流程。
- 追问点:生产监控指标；压测流程；更换 GC 的验证标准。
- 参考:团队内部规范

### Q2:线上排障工具链是否统一（jcmd/jstack/arthas）？有无值班手册？
- 标准答案:帮助确认团队对 JVM 诊断的成熟度与知识传承方式。
- 追问点:权限控制；故障演练频率；核心 SOP。
- 参考:团队内部规范

### Q3:微服务调用链与限流/熔断的落地方案？
- 标准答案:了解基础设施配套（如 Sentinel/Resilience4j/Hystrix）及 SLA 期望。
- 追问点:慢调用告警阈值；链路追踪系统；容量规划方法。
- 参考:团队内部规范
