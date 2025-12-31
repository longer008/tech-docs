# Java 速查手册

> Java 开发常用代码片段与 API 速查

## 基础语法

### 数据类型转换

```java
// String → 基本类型
int i = Integer.parseInt("123");
long l = Long.parseLong("123");
double d = Double.parseDouble("123.45");
boolean b = Boolean.parseBoolean("true");

// 基本类型 → String
String s1 = String.valueOf(123);
String s2 = Integer.toString(123);
String s3 = "" + 123;

// 进制转换
String binary = Integer.toBinaryString(10);   // "1010"
String hex = Integer.toHexString(255);        // "ff"
int fromBinary = Integer.parseInt("1010", 2); // 10
int fromHex = Integer.parseInt("ff", 16);     // 255
```

### 字符串操作

```java
String str = "  Hello World  ";

// 常用方法
str.length();                    // 长度
str.isEmpty();                   // 是否为空
str.isBlank();                   // 是否空白（Java 11+）
str.trim();                      // 去除首尾空格
str.strip();                     // 去除首尾空白（Java 11+）
str.toLowerCase();               // 转小写
str.toUpperCase();               // 转大写
str.substring(0, 5);             // 截取
str.charAt(0);                   // 获取字符
str.indexOf("o");                // 查找位置
str.lastIndexOf("o");            // 最后位置
str.contains("Hello");           // 包含
str.startsWith("He");            // 开头
str.endsWith("ld");              // 结尾
str.replace("o", "0");           // 替换
str.replaceAll("\\s+", " ");     // 正则替换
str.split(" ");                  // 分割
str.repeat(3);                   // 重复（Java 11+）

// 格式化
String.format("Name: %s, Age: %d", "Tom", 25);
String.format("%.2f", 3.14159);  // "3.14"

// 连接
String.join(", ", "a", "b", "c");  // "a, b, c"
String.join(", ", list);

// StringBuilder
StringBuilder sb = new StringBuilder();
sb.append("Hello").append(" ").append("World");
sb.insert(0, "Say: ");
sb.reverse();
sb.toString();
```

### 日期时间（Java 8+）

```java
// 当前时间
LocalDate today = LocalDate.now();
LocalTime now = LocalTime.now();
LocalDateTime dateTime = LocalDateTime.now();
Instant instant = Instant.now();

// 创建
LocalDate date = LocalDate.of(2024, 1, 15);
LocalTime time = LocalTime.of(14, 30, 0);
LocalDateTime dt = LocalDateTime.of(2024, 1, 15, 14, 30);

// 解析
LocalDate.parse("2024-01-15");
LocalDateTime.parse("2024-01-15T14:30:00");
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
LocalDateTime.parse("2024-01-15 14:30:00", formatter);

// 格式化
dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

// 操作
date.plusDays(7);
date.minusMonths(1);
date.withYear(2025);
date.getDayOfWeek();
date.getDayOfMonth();
date.isLeapYear();

// 时间差
Period period = Period.between(date1, date2);
Duration duration = Duration.between(time1, time2);
ChronoUnit.DAYS.between(date1, date2);

// 时区
ZonedDateTime zdt = ZonedDateTime.now(ZoneId.of("Asia/Shanghai"));
```

---

## 集合操作

### List 操作

```java
// 创建
List<String> list = new ArrayList<>();
List<String> list = Arrays.asList("a", "b", "c");  // 固定大小
List<String> list = List.of("a", "b", "c");        // 不可变（Java 9+）
List<String> list = new ArrayList<>(Arrays.asList("a", "b", "c"));

// 常用方法
list.add("d");
list.add(0, "first");
list.addAll(otherList);
list.get(0);
list.set(0, "new");
list.remove(0);
list.remove("a");
list.contains("a");
list.indexOf("a");
list.size();
list.isEmpty();
list.clear();

// 排序
Collections.sort(list);
Collections.reverse(list);
Collections.shuffle(list);
list.sort(Comparator.naturalOrder());
list.sort(Comparator.reverseOrder());
list.sort(Comparator.comparing(User::getName));

// 转换
list.toArray(new String[0]);
Arrays.asList(array);
```

### Map 操作

```java
// 创建
Map<String, Integer> map = new HashMap<>();
Map<String, Integer> map = Map.of("a", 1, "b", 2);  // 不可变

// 常用方法
map.put("key", 1);
map.putIfAbsent("key", 1);
map.get("key");
map.getOrDefault("key", 0);
map.containsKey("key");
map.containsValue(1);
map.remove("key");
map.size();
map.isEmpty();
map.clear();

// 遍历
map.forEach((k, v) -> System.out.println(k + ": " + v));
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    entry.getKey();
    entry.getValue();
}

// 计算
map.compute("key", (k, v) -> v == null ? 1 : v + 1);
map.computeIfAbsent("key", k -> expensiveCompute(k));
map.merge("key", 1, Integer::sum);  // 累加
```

### Stream API

```java
List<User> users = getUserList();

// 过滤
users.stream()
    .filter(u -> u.getAge() > 18)
    .collect(Collectors.toList());

// 映射
users.stream()
    .map(User::getName)
    .collect(Collectors.toList());

// 排序
users.stream()
    .sorted(Comparator.comparing(User::getAge))
    .collect(Collectors.toList());

// 去重
users.stream()
    .distinct()
    .collect(Collectors.toList());

// 限制
users.stream()
    .limit(10)
    .skip(5)
    .collect(Collectors.toList());

// 聚合
long count = users.stream().count();
int sum = users.stream().mapToInt(User::getAge).sum();
double avg = users.stream().mapToInt(User::getAge).average().orElse(0);
int max = users.stream().mapToInt(User::getAge).max().orElse(0);

// 分组
Map<String, List<User>> byDept = users.stream()
    .collect(Collectors.groupingBy(User::getDepartment));

// 分区
Map<Boolean, List<User>> partition = users.stream()
    .collect(Collectors.partitioningBy(u -> u.getAge() > 30));

// 连接
String names = users.stream()
    .map(User::getName)
    .collect(Collectors.joining(", "));

// 统计
IntSummaryStatistics stats = users.stream()
    .mapToInt(User::getAge)
    .summaryStatistics();
stats.getMax();
stats.getMin();
stats.getAverage();
stats.getSum();
stats.getCount();

// 匹配
boolean anyMatch = users.stream().anyMatch(u -> u.getAge() > 60);
boolean allMatch = users.stream().allMatch(u -> u.getAge() > 18);
boolean noneMatch = users.stream().noneMatch(u -> u.getAge() < 0);

// 查找
Optional<User> first = users.stream().findFirst();
Optional<User> any = users.stream().findAny();

// 归约
int totalAge = users.stream()
    .map(User::getAge)
    .reduce(0, Integer::sum);
```

---

## 并发编程

### 线程池

```java
// 推荐手动创建
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5,                                  // 核心线程数
    10,                                 // 最大线程数
    60L, TimeUnit.SECONDS,              // 空闲存活时间
    new LinkedBlockingQueue<>(100),     // 工作队列
    new ThreadFactoryBuilder().setNameFormat("pool-%d").build(),
    new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
);

// 提交任务
executor.execute(() -> doSomething());
Future<String> future = executor.submit(() -> "result");

// 关闭
executor.shutdown();
executor.awaitTermination(60, TimeUnit.SECONDS);
```

### CompletableFuture

```java
// 创建
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> "result");
CompletableFuture<Void> cf = CompletableFuture.runAsync(() -> doSomething());

// 链式调用
CompletableFuture<String> result = CompletableFuture
    .supplyAsync(() -> fetchData())
    .thenApply(data -> process(data))
    .thenApply(data -> format(data))
    .exceptionally(ex -> "default");

// 组合
CompletableFuture<String> cf1 = CompletableFuture.supplyAsync(() -> "Hello");
CompletableFuture<String> cf2 = CompletableFuture.supplyAsync(() -> "World");

cf1.thenCombine(cf2, (s1, s2) -> s1 + " " + s2);

// 等待所有完成
CompletableFuture.allOf(cf1, cf2).join();

// 任意一个完成
CompletableFuture.anyOf(cf1, cf2).join();

// 超时（Java 9+）
cf.orTimeout(5, TimeUnit.SECONDS);
cf.completeOnTimeout("default", 5, TimeUnit.SECONDS);
```

### 原子类

```java
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();    // ++count
count.getAndIncrement();    // count++
count.addAndGet(10);        // count += 10
count.compareAndSet(0, 1);  // CAS

AtomicReference<User> ref = new AtomicReference<>(user);
ref.compareAndSet(oldUser, newUser);

LongAdder adder = new LongAdder();  // 高并发计数器
adder.increment();
adder.sum();
```

---

## I/O 操作

### 文件操作（NIO）

```java
Path path = Paths.get("/path/to/file.txt");

// 读取
String content = Files.readString(path);                    // Java 11+
List<String> lines = Files.readAllLines(path);
byte[] bytes = Files.readAllBytes(path);

// 写入
Files.writeString(path, content);                           // Java 11+
Files.write(path, lines);
Files.write(path, content.getBytes(), StandardOpenOption.APPEND);

// 文件操作
Files.exists(path);
Files.createFile(path);
Files.createDirectories(path);
Files.delete(path);
Files.deleteIfExists(path);
Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
Files.move(source, target);

// 遍历目录
try (Stream<Path> stream = Files.walk(path)) {
    stream.filter(Files::isRegularFile)
          .forEach(System.out::println);
}

// 查找文件
try (Stream<Path> stream = Files.find(path, 10,
        (p, attr) -> p.toString().endsWith(".java"))) {
    stream.forEach(System.out::println);
}
```

### 资源读取

```java
// 从 classpath 读取
InputStream is = getClass().getResourceAsStream("/config.properties");
InputStream is = getClass().getClassLoader().getResourceAsStream("config.properties");

// Properties
Properties props = new Properties();
props.load(is);
String value = props.getProperty("key", "default");
```

---

## JSON 处理

### Jackson

```java
ObjectMapper mapper = new ObjectMapper();

// 序列化
String json = mapper.writeValueAsString(user);
mapper.writeValue(new File("user.json"), user);

// 反序列化
User user = mapper.readValue(json, User.class);
List<User> users = mapper.readValue(json, new TypeReference<List<User>>() {});

// 配置
mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
mapper.registerModule(new JavaTimeModule());

// 注解
@JsonProperty("user_name")
@JsonIgnore
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
@JsonInclude(JsonInclude.Include.NON_NULL)
```

---

## 常用工具

### Objects

```java
Objects.equals(a, b);           // 空安全比较
Objects.hash(a, b, c);          // 生成哈希值
Objects.requireNonNull(obj);    // 非空检查
Objects.requireNonNullElse(obj, defaultValue);  // Java 9+
Objects.isNull(obj);
Objects.nonNull(obj);
```

### Optional

```java
Optional<String> opt = Optional.ofNullable(value);

opt.isPresent();
opt.isEmpty();                            // Java 11+
opt.get();                                // 不推荐
opt.orElse("default");
opt.orElseGet(() -> computeDefault());
opt.orElseThrow(() -> new RuntimeException());
opt.ifPresent(v -> process(v));
opt.ifPresentOrElse(v -> process(v), () -> handleAbsent());  // Java 9+
opt.map(String::toUpperCase);
opt.flatMap(this::findById);
opt.filter(s -> s.length() > 5);
opt.stream();                             // Java 9+
```

### 正则表达式

```java
// 匹配
String regex = "\\d+";
boolean matches = str.matches(regex);

// 替换
str.replaceAll("\\s+", " ");
str.replaceFirst("\\d+", "X");

// Pattern
Pattern pattern = Pattern.compile("(\\d{4})-(\\d{2})-(\\d{2})");
Matcher matcher = pattern.matcher("2024-01-15");
if (matcher.find()) {
    matcher.group(0);  // 完整匹配
    matcher.group(1);  // 第一组
}

// 查找所有
pattern.matcher(text).results()
    .map(m -> m.group())
    .collect(Collectors.toList());
```

---

## Spring Boot 常用注解

```java
// 控制器
@RestController
@RequestMapping("/api")
@GetMapping("/users/{id}")
@PostMapping("/users")
@PutMapping("/users/{id}")
@DeleteMapping("/users/{id}")
@PathVariable
@RequestParam
@RequestBody
@RequestHeader

// 服务层
@Service
@Transactional
@Async

// 数据层
@Repository
@Mapper

// 配置
@Configuration
@Bean
@Value("${property.name}")
@ConfigurationProperties(prefix = "app")

// 依赖注入
@Autowired
@Resource
@Qualifier

// 校验
@Valid
@NotNull
@NotBlank
@Size(min = 1, max = 100)
@Email
@Pattern(regexp = "...")

// 日志
@Slf4j  // Lombok
log.info("message: {}", value);
log.error("error", exception);
```
