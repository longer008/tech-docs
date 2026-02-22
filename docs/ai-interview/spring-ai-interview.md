# Spring AI 面试指南

> 更新时间：2025-02
> 
> Spring AI 是 Spring 生态系统中用于构建 AI 应用的框架，提供了与多种 AI 模型和向量数据库集成的抽象层。本文档基于 Spring AI 1.1+ 版本。

## 目录

[[toc]]

## 一、Spring AI 核心概念

### 1.1 什么是 Spring AI？

**Spring AI** 是一个用于简化 AI 应用开发的框架，旨在将企业数据和 API 与 AI 模型连接起来。

**核心特点**：
- 🔌 **可移植的 API**：支持多种 AI 提供商（OpenAI、Anthropic、Google、AWS、Azure、Ollama 等）
- 🗄️ **向量数据库支持**：集成主流向量数据库（Pinecone、Milvus、Chroma、PGVector 等）
- 🛠️ **工具调用**：支持 Function Calling，让模型调用客户端函数
- 📊 **可观测性**：提供 AI 操作的监控和追踪
- 🚀 **Spring Boot 集成**：自动配置和 Starter 支持
- 💬 **ChatClient API**：流式 API，类似 WebClient/RestClient

**适用场景**：
- 智能客服和聊天机器人
- 文档问答系统（RAG）
- 内容生成和摘要
- 代码助手和开发工具
- 数据分析和洞察


### 1.2 Spring AI 架构

```
┌─────────────────────────────────────────────────────────┐
│                   Spring AI Application                  │
├─────────────────────────────────────────────────────────┤
│  ChatClient API  │  Advisors  │  Prompt Templates       │
├─────────────────────────────────────────────────────────┤
│  Chat Models  │  Embedding  │  Image Gen  │  Audio      │
├─────────────────────────────────────────────────────────┤
│  OpenAI │ Anthropic │ Google │ AWS │ Azure │ Ollama     │
├─────────────────────────────────────────────────────────┤
│  Vector Stores: Pinecone, Milvus, Chroma, PGVector...   │
└─────────────────────────────────────────────────────────┘
```

**核心组件**：
1. **ChatClient API**：流式 API，用于与 AI 模型交互
2. **Advisors**：拦截器模式，用于增强 AI 交互（如 RAG、记忆管理）
3. **Prompt Templates**：提示词模板，支持占位符和参数化
4. **Chat Models**：聊天模型抽象，支持多种 AI 提供商
5. **Embedding Models**：文本嵌入模型，用于向量化文本
6. **Vector Stores**：向量数据库，用于存储和检索文档向量


## 二、快速开始

### 2.1 项目依赖

```xml
<dependencies>
    <!-- Spring AI OpenAI Starter -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
        <version>1.1.0</version>
    </dependency>
    
    <!-- Spring AI PGVector Store -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-pgvector-store-spring-boot-starter</artifactId>
        <version>1.1.0</version>
    </dependency>
</dependencies>
```

### 2.2 配置文件

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4
          temperature: 0.7
      embedding:
        options:
          model: text-embedding-3-small
```

### 2.3 简单聊天示例

```java
@Service
public class ChatService {
    private final ChatClient chatClient;
    
    public ChatService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }
    
    public String chat(String message) {
        return chatClient.prompt()
            .user(message)
            .call()
            .content();
    }
}
```


## 三、ChatClient API 详解

### 3.1 核心方法链

```java
chatClient.prompt()           // 创建提示
  .system(...)                // 设置系统消息
  .user(...)                  // 设置用户消息
  .options(...)               // 设置模型选项
  .advisors(...)              // 添加顾问
  .call()                     // 同步调用
  .stream()                   // 流式调用
  .content()                  // 获取内容
  .entity(Class)              // 转换为实体
```

### 3.2 系统消息和角色定义

```java
public String chatWithRole(String message) {
    return chatClient.prompt()
        .system("你是一位资深的 Java 架构师")
        .user(message)
        .call()
        .content();
}
```

### 3.3 模型参数配置

```java
public String chatWithOptions(String message) {
    return chatClient.prompt()
        .user(message)
        .options(OpenAiChatOptions.builder()
            .withModel("gpt-4-turbo")
            .withTemperature(0.8)      // 创造性（0-2）
            .withMaxTokens(2000)       // 最大令牌数
            .withTopP(0.9)             // 核采样
            .build())
        .call()
        .content();
}
```

### 3.4 结构化输出

```java
public Product extractProduct(String description) {
    return chatClient.prompt()
        .user("从以下描述中提取产品信息：" + description)
        .call()
        .entity(Product.class);
}

record Product(String name, String category, double price) {}
```

### 3.5 流式响应

```java
public Flux<String> chatStream(String message) {
    return chatClient.prompt()
        .user(message)
        .stream()
        .content();
}
```


## 四、Function Calling（工具调用）

### 4.1 什么是 Function Calling？

**Function Calling** 允许 AI 模型调用客户端定义的函数，获取实时信息或执行操作。

**工作流程**：
```
用户提问 → AI 判断需要调用函数 → 返回函数调用请求
→ 客户端执行函数 → 将结果返回给 AI → AI 生成最终答案
```

### 4.2 定义函数

```java
@Configuration
public class FunctionConfig {
    
    @Bean
    @Description("获取指定城市的当前天气信息")
    public Function<WeatherRequest, WeatherResponse> getWeather() {
        return request -> {
            // 调用天气 API
            return new WeatherResponse(
                request.city(),
                "晴天",
                25.0
            );
        };
    }
    
    @Bean
    @Description("执行数学计算")
    public Function<CalculatorRequest, CalculatorResponse> calculator() {
        return request -> {
            double result = switch (request.operation()) {
                case "add" -> request.a() + request.b();
                case "multiply" -> request.a() * request.b();
                default -> 0.0;
            };
            return new CalculatorResponse(result);
        };
    }
}

record WeatherRequest(String city) {}
record WeatherResponse(String city, String condition, double temperature) {}
record CalculatorRequest(String operation, double a, double b) {}
record CalculatorResponse(double result) {}
```

### 4.3 使用 Function Calling

```java
@Service
public class FunctionCallingService {
    private final ChatClient chatClient;
    
    public FunctionCallingService(ChatClient.Builder builder) {
        this.chatClient = builder
            .defaultFunctions("getWeather", "calculator")
            .build();
    }
    
    public String ask(String question) {
        // 用户问："北京今天天气怎么样？"
        // AI 会自动调用 getWeather 函数
        return chatClient.prompt()
            .user(question)
            .call()
            .content();
    }
}
```


## 五、RAG（检索增强生成）

### 5.1 什么是 RAG？

**RAG（Retrieval-Augmented Generation）** 通过从知识库中检索相关文档，增强 AI 模型的回答能力。

**RAG 工作流程**：
```
文档加载 → 文本分割 → 生成 Embedding → 存储到向量数据库
                                        ↓
用户提问 → 生成问题 Embedding → 向量相似度搜索 → 检索相关文档
                                        ↓
将文档作为上下文 → AI 生成答案
```

### 5.2 文档加载和处理

```java
@Service
public class DocumentService {
    
    public List<Document> loadPdfFile(Resource resource) {
        var reader = new PdfDocumentReader(resource);
        return reader.get();
    }
    
    public List<Document> splitDocuments(List<Document> documents) {
        var splitter = new TokenTextSplitter(
            500,  // 每个块的最大 token 数
            100   // 块之间的重叠 token 数
        );
        return splitter.apply(documents);
    }
}
```

### 5.3 向量存储

```java
@Service
public class VectorStoreService {
    private final VectorStore vectorStore;
    
    public VectorStoreService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }
    
    public void addDocuments(List<Document> documents) {
        vectorStore.add(documents);
    }
    
    public List<Document> similaritySearch(String query) {
        return vectorStore.similaritySearch(
            SearchRequest.query(query).withTopK(5)
        );
    }
}
```

### 5.4 RAG 实现

```java
@Service
public class RagService {
    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    
    public RagService(ChatClient.Builder builder, VectorStore vectorStore) {
        this.vectorStore = vectorStore;
        this.chatClient = builder.build();
    }
    
    public String query(String question) {
        // 1. 检索相关文档
        var documents = vectorStore.similaritySearch(
            SearchRequest.query(question).withTopK(3)
        );
        
        // 2. 构建上下文
        String context = documents.stream()
            .map(Document::getContent)
            .collect(Collectors.joining("\n\n"));
        
        // 3. 生成答案
        return chatClient.prompt()
            .system("根据以下上下文回答问题：\n" + context)
            .user(question)
            .call()
            .content();
    }
    
    // 使用 QuestionAnswerAdvisor 简化
    public String queryWithAdvisor(String question) {
        return chatClient.prompt()
            .user(question)
            .advisors(new QuestionAnswerAdvisor(vectorStore))
            .call()
            .content();
    }
}
```

### 5.5 完整的 RAG 应用

```java
@RestController
@RequestMapping("/api/rag")
public class RagController {
    private final DocumentService documentService;
    private final VectorStoreService vectorStoreService;
    private final RagService ragService;
    
    @PostMapping("/upload")
    public String uploadDocument(@RequestParam("file") MultipartFile file) {
        Resource resource = new ByteArrayResource(file.getBytes());
        var documents = documentService.loadPdfFile(resource);
        documents = documentService.splitDocuments(documents);
        vectorStoreService.addDocuments(documents);
        return "文档已上传";
    }
    
    @PostMapping("/query")
    public String query(@RequestBody String question) {
        return ragService.query(question);
    }
}
```


## 六、Embedding 模型

### 6.1 什么是 Embedding？

**Embedding** 是将文本转换为高维向量的过程，用于表示文本的语义信息。

### 6.2 使用 Embedding 模型

```java
@Service
public class EmbeddingService {
    private final EmbeddingModel embeddingModel;
    
    public EmbeddingService(EmbeddingModel embeddingModel) {
        this.embeddingModel = embeddingModel;
    }
    
    public List<Double> embed(String text) {
        var response = embeddingModel.embed(text);
        return response;
    }
    
    public List<List<Double>> embedBatch(List<String> texts) {
        var response = embeddingModel.embed(texts);
        return response.stream()
            .map(EmbeddingResponse.Embedding::getOutput)
            .toList();
    }
}
```

### 6.3 计算相似度

```java
public double cosineSimilarity(List<Double> vec1, List<Double> vec2) {
    double dotProduct = 0.0;
    double norm1 = 0.0;
    double norm2 = 0.0;
    
    for (int i = 0; i < vec1.size(); i++) {
        dotProduct += vec1.get(i) * vec2.get(i);
        norm1 += vec1.get(i) * vec1.get(i);
        norm2 += vec2.get(i) * vec2.get(i);
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}
```

## 七、Advisors（顾问）

### 7.1 什么是 Advisors？

**Advisors** 是拦截器模式，用于在 AI 交互前后执行额外逻辑。

### 7.2 内置 Advisors

```java
// 1. QuestionAnswerAdvisor - RAG 支持
chatClient.prompt()
    .user(question)
    .advisors(new QuestionAnswerAdvisor(vectorStore))
    .call()
    .content();

// 2. MessageChatMemoryAdvisor - 对话记忆
chatClient.prompt()
    .user(message)
    .advisors(new MessageChatMemoryAdvisor(chatMemory))
    .call()
    .content();

// 3. PromptChatMemoryAdvisor - 提示词记忆
chatClient.prompt()
    .user(message)
    .advisors(new PromptChatMemoryAdvisor(chatMemory))
    .call()
    .content();
```

### 7.3 自定义 Advisor

```java
public class LoggingAdvisor implements RequestResponseAdvisor {
    
    @Override
    public AdvisedRequest adviseRequest(
            AdvisedRequest request, 
            Map<String, Object> context) {
        log.info("Request: {}", request.userText());
        return request;
    }
    
    @Override
    public ChatResponse adviseResponse(
            ChatResponse response, 
            Map<String, Object> context) {
        log.info("Response: {}", response.getResult().getOutput().getContent());
        return response;
    }
}

// 使用自定义 Advisor
chatClient.prompt()
    .user(message)
    .advisors(new LoggingAdvisor())
    .call()
    .content();
```


## 八、多模型支持

### 8.1 支持的 AI 提供商

| 提供商 | Chat | Embedding | Image | Audio |
|--------|------|-----------|-------|-------|
| OpenAI | ✅ | ✅ | ✅ | ✅ |
| Anthropic (Claude) | ✅ | ❌ | ❌ | ❌ |
| Google (Gemini) | ✅ | ✅ | ❌ | ❌ |
| AWS Bedrock | ✅ | ✅ | ✅ | ❌ |
| Azure OpenAI | ✅ | ✅ | ✅ | ✅ |
| Ollama (本地) | ✅ | ✅ | ❌ | ❌ |

### 8.2 切换模型提供商

```yaml
# OpenAI
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat.options.model: gpt-4

# Anthropic Claude
spring:
  ai:
    anthropic:
      api-key: ${ANTHROPIC_API_KEY}
      chat.options.model: claude-3-opus-20240229

# Ollama (本地)
spring:
  ai:
    ollama:
      base-url: http://localhost:11434
      chat.options.model: llama2
```

### 8.3 图像生成

```java
@Service
public class ImageService {
    private final ImageModel imageModel;
    
    public ImageService(ImageModel imageModel) {
        this.imageModel = imageModel;
    }
    
    public String generateImage(String prompt) {
        var response = imageModel.call(
            new ImagePrompt(prompt,
                ImageOptions.builder()
                    .withModel("dall-e-3")
                    .withWidth(1024)
                    .withHeight(1024)
                    .build())
        );
        return response.getResult().getOutput().getUrl();
    }
}
```

## 九、向量数据库集成

### 9.1 支持的向量数据库

- **PGVector** (PostgreSQL)
- **Pinecone**
- **Milvus**
- **Chroma**
- **Qdrant**
- **Weaviate**
- **Redis**
- **MongoDB Atlas**
- **Elasticsearch**

### 9.2 PGVector 配置

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/vectordb
    username: postgres
    password: password
  ai:
    vectorstore:
      pgvector:
        dimensions: 1536
        distance-type: COSINE_DISTANCE
```

```sql
-- 创建向量扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建向量表
CREATE TABLE vector_store (
    id UUID PRIMARY KEY,
    content TEXT,
    metadata JSONB,
    embedding vector(1536)
);

-- 创建索引
CREATE INDEX ON vector_store USING ivfflat (embedding vector_cosine_ops);
```

### 9.3 Pinecone 配置

```yaml
spring:
  ai:
    vectorstore:
      pinecone:
        api-key: ${PINECONE_API_KEY}
        environment: us-east-1
        index-name: my-index
        namespace: default
```


## 十、面试题精选

### 10.1 基础题

**Q1: Spring AI 的核心优势是什么？**

**答案**：
1. **可移植性**：统一的 API 抽象，轻松切换 AI 提供商
2. **Spring 生态集成**：无缝集成 Spring Boot、Spring Cloud
3. **企业级特性**：可观测性、安全性、事务支持
4. **RAG 支持**：内置向量数据库集成和文档处理
5. **Function Calling**：支持工具调用，扩展 AI 能力

**Q2: ChatClient 和直接调用 ChatModel 有什么区别？**

**答案**：
- **ChatClient**：流式 API，支持链式调用，更易用
- **ChatModel**：底层 API，更灵活但代码冗长
- **推荐使用 ChatClient**，除非需要底层控制

```java
// ChatClient (推荐)
chatClient.prompt().user("Hello").call().content();

// ChatModel (底层)
chatModel.call(new Prompt("Hello")).getResult().getOutput().getContent();
```

**Q3: 如何实现流式响应？**

**答案**：
```java
public Flux<String> chatStream(String message) {
    return chatClient.prompt()
        .user(message)
        .stream()
        .content();
}

// 在 Controller 中使用
@GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> stream(@RequestParam String message) {
    return chatService.chatStream(message);
}
```

**Q4: 什么是 Embedding？如何使用？**

**答案**：
Embedding 是将文本转换为向量的过程，用于表示语义信息。

```java
@Service
public class EmbeddingService {
    private final EmbeddingModel embeddingModel;
    
    public List<Double> embed(String text) {
        return embeddingModel.embed(text);
    }
}
```

**应用场景**：
- 语义搜索
- 文档相似度计算
- RAG 系统
- 推荐系统

**Q5: 如何配置多个 AI 提供商？**

**答案**：
```java
@Configuration
public class AiConfig {
    
    @Bean
    @Primary
    public ChatClient openAiChatClient(
            @Qualifier("openAiChatModel") ChatModel chatModel) {
        return ChatClient.builder(chatModel).build();
    }
    
    @Bean
    public ChatClient claudeChatClient(
            @Qualifier("anthropicChatModel") ChatModel chatModel) {
        return ChatClient.builder(chatModel).build();
    }
}
```

### 10.2 进阶题

**Q6: 解释 RAG 的工作原理和实现步骤**

**答案**：

**工作原理**：
1. **离线阶段**：
   - 加载文档 → 分割文本 → 生成 Embedding → 存储到向量数据库

2. **在线阶段**：
   - 用户提问 → 生成问题 Embedding → 向量相似度搜索
   - 检索相关文档 → 作为上下文传给 LLM → 生成答案

**实现步骤**：
```java
// 1. 文档处理
var documents = documentReader.get();
documents = textSplitter.apply(documents);
vectorStore.add(documents);

// 2. 查询
var relevantDocs = vectorStore.similaritySearch(
    SearchRequest.query(question).withTopK(3)
);

// 3. 生成答案
String context = relevantDocs.stream()
    .map(Document::getContent)
    .collect(Collectors.joining("\n\n"));

return chatClient.prompt()
    .system("根据以下上下文回答：\n" + context)
    .user(question)
    .call()
    .content();
```

**Q7: Function Calling 的实现原理是什么？**

**答案**：

**实现原理**：
1. 定义函数并注册到 Spring 容器
2. AI 模型接收用户问题，判断是否需要调用函数
3. 如果需要，返回函数调用请求（JSON 格式）
4. Spring AI 解析请求，调用对应的 Java 函数
5. 将函数返回值传回 AI 模型
6. AI 模型基于函数结果生成最终答案

**关键点**：
- 使用 `@Description` 注解描述函数功能
- 函数参数和返回值必须是可序列化的
- AI 模型会自动决定何时调用函数

**Q8: 如何实现对话记忆？**

**答案**：
```java
@Service
public class ConversationService {
    private final ChatClient chatClient;
    private final ChatMemory chatMemory;
    
    public ConversationService(
            ChatClient.Builder builder,
            ChatMemory chatMemory) {
        this.chatMemory = chatMemory;
        this.chatClient = builder
            .defaultAdvisors(new MessageChatMemoryAdvisor(chatMemory))
            .build();
    }
    
    public String chat(String conversationId, String message) {
        return chatClient.prompt()
            .user(message)
            .advisors(advisor -> advisor
                .param("chat_memory_conversation_id", conversationId))
            .call()
            .content();
    }
}
```

**Q9: 如何优化 RAG 系统的性能？**

**答案**：

**优化策略**：
1. **文本分割优化**：
   - 合理设置 chunk size（500-1000 tokens）
   - 设置 overlap 避免语义断裂（100-200 tokens）

2. **检索优化**：
   - 使用混合检索（向量 + 关键词）
   - 调整 topK 参数（3-5 个文档）
   - 设置相似度阈值过滤低质量文档

3. **上下文优化**：
   - 重排序（Reranking）提升相关性
   - 压缩上下文减少 token 消耗
   - 使用元数据过滤

4. **缓存策略**：
   - 缓存常见问题的答案
   - 缓存 Embedding 结果

**Q10: 如何处理 AI 响应的错误和异常？**

**答案**：
```java
@Service
public class SafeChatService {
    private final ChatClient chatClient;
    
    public String chat(String message) {
        try {
            return chatClient.prompt()
                .user(message)
                .call()
                .content();
        } catch (OpenAiApiException e) {
            // API 错误（如配额超限）
            log.error("OpenAI API error", e);
            return "抱歉，服务暂时不可用";
        } catch (Exception e) {
            // 其他错误
            log.error("Unexpected error", e);
            return "抱歉，处理您的请求时出错";
        }
    }
    
    // 使用 Retry 机制
    @Retryable(
        value = {OpenAiApiException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000)
    )
    public String chatWithRetry(String message) {
        return chatClient.prompt().user(message).call().content();
    }
}
```


### 10.3 高级题

**Q11: 如何实现多租户 RAG 系统？**

**答案**：
```java
@Service
public class MultiTenantRagService {
    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    
    public String query(String tenantId, String question) {
        // 使用元数据过滤实现租户隔离
        var documents = vectorStore.similaritySearch(
            SearchRequest.query(question)
                .withTopK(3)
                .withFilterExpression("tenantId == '" + tenantId + "'")
        );
        
        String context = documents.stream()
            .map(Document::getContent)
            .collect(Collectors.joining("\n\n"));
        
        return chatClient.prompt()
            .system("根据以下上下文回答：\n" + context)
            .user(question)
            .call()
            .content();
    }
    
    public void addDocument(String tenantId, Document document) {
        document.getMetadata().put("tenantId", tenantId);
        vectorStore.add(List.of(document));
    }
}
```

**Q12: 如何实现 AI 响应的可观测性？**

**答案**：
```java
@Configuration
public class ObservabilityConfig {
    
    @Bean
    public ObservationRegistry observationRegistry() {
        return ObservationRegistry.create();
    }
    
    @Bean
    public ChatClient observableChatClient(
            ChatClient.Builder builder,
            ObservationRegistry registry) {
        return builder
            .observationRegistry(registry)
            .build();
    }
}

// 自定义观察
@Service
public class ObservableChatService {
    private final ChatClient chatClient;
    private final ObservationRegistry registry;
    
    public String chat(String message) {
        return Observation.createNotStarted("ai.chat", registry)
            .lowCardinalityKeyValue("model", "gpt-4")
            .observe(() -> 
                chatClient.prompt().user(message).call().content()
            );
    }
}
```

**Q13: 如何实现 Prompt 模板管理？**

**答案**：
```java
@Service
public class PromptTemplateService {
    private final ChatClient chatClient;
    
    // 使用 PromptTemplate
    public String generateWithTemplate(Map<String, Object> params) {
        var template = new PromptTemplate(
            "你是一位{role}，请{action}关于{topic}的内容"
        );
        
        var prompt = template.create(params);
        return chatClient.prompt(prompt).call().content();
    }
    
    // 从文件加载模板
    public String generateFromFile(String templatePath, Map<String, Object> params) {
        var resource = new ClassPathResource(templatePath);
        var template = new PromptTemplate(resource);
        var prompt = template.create(params);
        return chatClient.prompt(prompt).call().content();
    }
}

// templates/article.st
// 你是一位{role}的技术作家。
// 请写一篇关于{topic}的文章，风格要{style}。
// 字数要求：{wordCount}字。
```

**Q14: 如何实现 AI 响应的内容审核？**

**答案**：
```java
@Service
public class ModerationService {
    private final ModerationModel moderationModel;
    
    public boolean isSafe(String content) {
        var response = moderationModel.call(
            new ModerationPrompt(content)
        );
        return !response.getResult().isFlagged();
    }
}

@Service
public class SafeChatService {
    private final ChatClient chatClient;
    private final ModerationService moderationService;
    
    public String chat(String message) {
        // 1. 审核用户输入
        if (!moderationService.isSafe(message)) {
            return "您的输入包含不当内容";
        }
        
        // 2. 生成响应
        String response = chatClient.prompt()
            .user(message)
            .call()
            .content();
        
        // 3. 审核 AI 响应
        if (!moderationService.isSafe(response)) {
            return "抱歉，无法生成合适的回答";
        }
        
        return response;
    }
}
```

**Q15: 如何实现混合检索（Hybrid Search）？**

**答案**：
```java
@Service
public class HybridSearchService {
    private final VectorStore vectorStore;
    private final FullTextSearchService fullTextSearch;
    
    public List<Document> hybridSearch(String query, int topK) {
        // 1. 向量检索
        var vectorResults = vectorStore.similaritySearch(
            SearchRequest.query(query).withTopK(topK * 2)
        );
        
        // 2. 全文检索
        var fullTextResults = fullTextSearch.search(query, topK * 2);
        
        // 3. 合并和重排序（RRF - Reciprocal Rank Fusion）
        Map<String, Double> scores = new HashMap<>();
        
        for (int i = 0; i < vectorResults.size(); i++) {
            var doc = vectorResults.get(i);
            scores.merge(doc.getId(), 1.0 / (i + 60), Double::sum);
        }
        
        for (int i = 0; i < fullTextResults.size(); i++) {
            var doc = fullTextResults.get(i);
            scores.merge(doc.getId(), 1.0 / (i + 60), Double::sum);
        }
        
        // 4. 按分数排序并返回 topK
        return scores.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(topK)
            .map(entry -> findDocumentById(entry.getKey()))
            .toList();
    }
}
```

## 十一、最佳实践

### 11.1 Prompt 工程

```java
// ❌ 不好的做法
String response = chatClient.prompt()
    .user("写一篇文章")
    .call()
    .content();

// ✅ 好的做法
String response = chatClient.prompt()
    .system("""
        你是一位资深的技术作家，擅长将复杂的技术概念
        用简单易懂的语言解释给读者。
        """)
    .user("""
        请写一篇关于 Spring AI 的技术文章，要求：
        1. 字数 1000 字左右
        2. 包含代码示例
        3. 面向 Java 开发者
        4. 风格专业但易懂
        """)
    .call()
    .content();
```

### 11.2 错误处理

```java
@Service
public class RobustChatService {
    private final ChatClient chatClient;
    
    @Retryable(
        value = {OpenAiApiException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public String chat(String message) {
        return chatClient.prompt()
            .user(message)
            .call()
            .content();
    }
    
    @Recover
    public String recover(OpenAiApiException e, String message) {
        log.error("Failed after retries", e);
        return "服务暂时不可用，请稍后再试";
    }
}
```

### 11.3 性能优化

```java
@Service
public class OptimizedChatService {
    private final ChatClient chatClient;
    private final Cache cache;
    
    // 1. 缓存常见问题
    @Cacheable(value = "ai-responses", key = "#message")
    public String chat(String message) {
        return chatClient.prompt().user(message).call().content();
    }
    
    // 2. 批量处理
    public List<String> chatBatch(List<String> messages) {
        return messages.parallelStream()
            .map(this::chat)
            .toList();
    }
    
    // 3. 异步处理
    @Async
    public CompletableFuture<String> chatAsync(String message) {
        return CompletableFuture.completedFuture(
            chatClient.prompt().user(message).call().content()
        );
    }
}
```

### 11.4 安全性

```java
@Configuration
public class SecurityConfig {
    
    // 1. API Key 管理
    @Bean
    public ChatClient secureChatClient(
            @Value("${spring.ai.openai.api-key}") String apiKey) {
        // 不要硬编码 API Key
        return ChatClient.builder(chatModel).build();
    }
    
    // 2. 速率限制
    @Bean
    public RateLimiter rateLimiter() {
        return RateLimiter.create(10.0); // 每秒 10 个请求
    }
}

@Service
public class SecureChatService {
    private final ChatClient chatClient;
    private final RateLimiter rateLimiter;
    
    public String chat(String message) {
        // 速率限制
        rateLimiter.acquire();
        
        // 输入验证
        if (message.length() > 10000) {
            throw new IllegalArgumentException("消息过长");
        }
        
        return chatClient.prompt().user(message).call().content();
    }
}
```

### 11.5 成本控制

```java
@Service
public class CostAwareChatService {
    private final ChatClient chatClient;
    
    public String chat(String message) {
        return chatClient.prompt()
            .user(message)
            .options(OpenAiChatOptions.builder()
                .withModel("gpt-3.5-turbo")  // 使用更便宜的模型
                .withMaxTokens(500)          // 限制输出长度
                .build())
            .call()
            .content();
    }
    
    // 根据任务选择模型
    public String chatSmart(String message, TaskComplexity complexity) {
        String model = switch (complexity) {
            case SIMPLE -> "gpt-3.5-turbo";
            case MEDIUM -> "gpt-4";
            case COMPLEX -> "gpt-4-turbo";
        };
        
        return chatClient.prompt()
            .user(message)
            .options(OpenAiChatOptions.builder()
                .withModel(model)
                .build())
            .call()
            .content();
    }
}

enum TaskComplexity { SIMPLE, MEDIUM, COMPLEX }
```


## 十二、常见问题

### 12.1 如何选择合适的模型？

| 场景 | 推荐模型 | 原因 |
|------|---------|------|
| 简单问答 | GPT-3.5-turbo | 成本低，速度快 |
| 复杂推理 | GPT-4 | 推理能力强 |
| 代码生成 | GPT-4-turbo | 上下文窗口大 |
| 本地部署 | Ollama (Llama2) | 数据隐私 |
| 长文本处理 | Claude-3-opus | 200K 上下文 |

### 12.2 如何选择向量数据库？

| 数据库 | 优势 | 适用场景 |
|--------|------|---------|
| PGVector | 与 PostgreSQL 集成 | 已有 PG 数据库 |
| Pinecone | 托管服务，易用 | 快速原型开发 |
| Milvus | 高性能，可扩展 | 大规模生产环境 |
| Chroma | 轻量级，易部署 | 小型项目 |
| Redis | 内存存储，极快 | 实时应用 |

### 12.3 RAG 系统的常见问题

**问题 1：检索到的文档不相关**
- **原因**：Embedding 模型不合适，chunk size 不当
- **解决**：使用更好的 Embedding 模型，调整分割策略

**问题 2：答案不准确**
- **原因**：上下文不足，Prompt 设计不当
- **解决**：增加 topK，优化 Prompt，使用 Reranking

**问题 3：响应速度慢**
- **原因**：向量检索慢，LLM 调用慢
- **解决**：优化索引，使用缓存，选择更快的模型

### 12.4 成本优化建议

1. **使用缓存**：缓存常见问题的答案
2. **选择合适的模型**：简单任务用 GPT-3.5
3. **限制输出长度**：设置 maxTokens
4. **批量处理**：合并多个请求
5. **使用本地模型**：Ollama 用于开发测试

## 十三、参考资料

### 13.1 官方资源

- [Spring AI 官方文档](https://docs.spring.io/spring-ai/reference/)
- [Spring AI GitHub](https://github.com/spring-projects/spring-ai)
- [Spring AI 示例项目](https://github.com/spring-projects/spring-ai-examples)

### 13.2 AI 提供商文档

- [OpenAI API 文档](https://platform.openai.com/docs)
- [Anthropic Claude 文档](https://docs.anthropic.com/)
- [Google Gemini 文档](https://ai.google.dev/docs)
- [Ollama 文档](https://ollama.ai/docs)

### 13.3 向量数据库文档

- [PGVector](https://github.com/pgvector/pgvector)
- [Pinecone](https://docs.pinecone.io/)
- [Milvus](https://milvus.io/docs)
- [Chroma](https://docs.trychroma.com/)

### 13.4 学习路线

**初级（1-2 周）**：
1. 理解 AI 基础概念（LLM、Embedding、RAG）
2. 学习 Spring AI 核心 API（ChatClient、Embedding）
3. 完成简单的聊天应用

**中级（2-4 周）**：
1. 掌握 Function Calling
2. 实现 RAG 系统
3. 学习 Advisors 和 Prompt 工程
4. 集成向量数据库

**高级（1-2 个月）**：
1. 多模型支持和切换
2. 性能优化和成本控制
3. 可观测性和监控
4. 生产环境部署

### 13.5 实战项目推荐

1. **智能客服系统**：
   - ChatClient + Function Calling
   - 集成企业知识库（RAG）
   - 多轮对话记忆

2. **文档问答系统**：
   - PDF/Word 文档解析
   - 向量数据库存储
   - 语义搜索和问答

3. **代码助手**：
   - 代码生成和解释
   - 代码审查和优化建议
   - 集成 IDE

4. **内容生成平台**：
   - 文章生成
   - 图像生成
   - 多语言翻译

## 十四、面试技巧

### 14.1 回答框架

**STAR 法则**：
- **S (Situation)**：描述场景
- **T (Task)**：说明任务
- **A (Action)**：解释行动
- **R (Result)**：展示结果

**示例**：
> "在我们的项目中（S），需要构建一个智能客服系统（T）。我使用 Spring AI 的 ChatClient 和 RAG 技术（A），实现了基于企业知识库的自动问答，将客服响应时间从 5 分钟降低到 10 秒（R）。"

### 14.2 加分项

1. **实战经验**：
   - 展示实际项目经验
   - 分享遇到的问题和解决方案

2. **技术深度**：
   - 理解底层原理（Embedding、向量检索）
   - 掌握性能优化技巧

3. **最佳实践**：
   - 成本控制意识
   - 安全性考虑
   - 可观测性设计

4. **持续学习**：
   - 关注 AI 技术发展
   - 了解最新的模型和工具

### 14.3 高频问题

1. Spring AI 和 LangChain 的区别？
2. 如何实现 RAG 系统？
3. Function Calling 的应用场景？
4. 如何优化 AI 应用的性能？
5. 如何控制 AI 应用的成本？
6. 向量数据库的选择标准？
7. 如何处理 AI 响应的幻觉问题？
8. 多租户 RAG 系统如何实现？

## 十五、总结

Spring AI 是 Java 生态系统中构建 AI 应用的强大框架，它提供了：

✅ **统一的 API 抽象**：轻松切换 AI 提供商
✅ **完整的 RAG 支持**：从文档处理到向量检索
✅ **企业级特性**：可观测性、安全性、事务支持
✅ **Spring 生态集成**：无缝集成 Spring Boot、Spring Cloud
✅ **丰富的功能**：Function Calling、Advisors、Prompt Templates

**核心能力**：
- ChatClient API 用于聊天交互
- Embedding 模型用于文本向量化
- Vector Store 用于向量存储和检索
- Function Calling 用于工具调用
- Advisors 用于增强 AI 交互

**最佳实践**：
- 合理选择模型和向量数据库
- 优化 Prompt 设计
- 实现错误处理和重试机制
- 关注性能和成本
- 重视安全性和可观测性

**学习建议**：
1. 从简单的聊天应用开始
2. 逐步学习 RAG 和 Function Calling
3. 实践完整的项目
4. 关注最新技术发展

---

> 💡 **提示**：本文档基于 Spring AI 1.1+ 版本编写，内容来源于官方文档和实战经验。建议结合官方文档和示例项目深入学习。

> 📚 **相关文档**：
> - [Prompt Engineering 面试指南](./prompt-engineering-interview.md)
> - [AI 工具使用面试指南](./ai-tools-interview.md)
> - [AI 辅助开发实践](./ai-assisted-development.md)
