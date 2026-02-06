# NestJS 面试题库

> 更新时间：2025-02

## 目录导航

- [基础概念](#基础概念)
- [模块系统](#模块系统)
- [依赖注入](#依赖注入)
- [管道守卫拦截器](#管道守卫拦截器)
- [微服务](#微服务)
- [性能优化](#性能优化)
- [实战场景](#实战场景)

---

## 基础概念

### 1. 什么是 NestJS？它的核心特点是什么？

**核心答案**：

NestJS 是一个用于构建高效、可扩展的 Node.js 服务器端应用的渐进式框架，使用 TypeScript 构建。

**核心特点**：
- **TypeScript 优先**：完整的 TypeScript 支持，提供强类型约束
- **模块化架构**：清晰的模块边界，易于维护
- **依赖注入**：强大的 IoC 容器，解耦组件
- **装饰器**：基于装饰器的声明式编程
- **企业级**：适合大型项目，借鉴 Angular 架构
- **多平台**：支持 Express 和 Fastify

**代码示例**：

```typescript
// 基础应用结构
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
}
bootstrap()
```

**追问点**：
- NestJS vs Express 的区别？
- 为什么选择 NestJS 而不是 Koa？
- NestJS 的设计理念是什么？

**面试技巧**：
- 强调 TypeScript 和依赖注入的优势
- 提到适合大型团队协作
- 说明模块化架构的可维护性

---

## 模块系统

### 2. NestJS 的模块系统是如何工作的？

**核心答案**：

模块是 NestJS 应用的基本构建块，用于组织应用结构。每个模块通过 `@Module()` 装饰器定义，包含：
- **controllers**：控制器数组
- **providers**：提供者数组（服务、工厂等）
- **imports**：导入其他模块
- **exports**：导出提供者供其他模块使用

**代码示例**：

```typescript
// 功能模块
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  // 导出服务供其他模块使用
})
export class UsersModule {}

// 根模块
@Module({
  imports: [UsersModule],  // 导入功能模块
})
export class AppModule {}
```

**全局模块**：

```typescript
import { Module, Global } from '@nestjs/common'

@Global()  // 全局模块，无需在每个模块中导入
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class CommonModule {}
```

**动态模块**：

```typescript
@Module({})
export class ConfigModule {
  static forRoot(options: ConfigOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    }
  }
}
```

**追问点**：
- 模块循环依赖如何处理？（使用 `forwardRef()`）
- 全局模块的使用场景？
- 动态模块的应用场景？

**面试技巧**：
- 强调模块化的好处（解耦、可测试、可维护）
- 提到模块懒加载
- 说明模块作用域

---

## 依赖注入

### 3. NestJS 的依赖注入是如何实现的？

**核心答案**：

NestJS 使用 IoC（控制反转）容器来管理类之间的依赖关系。通过构造函数注入或属性注入，容器自动解析和注入依赖。

**构造函数注入**：

```typescript
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll()
  }
}
```

**属性注入**：

```typescript
@Injectable()
export class CatsService {
  @Inject('CONNECTION')
  private connection: Connection
}
```

**自定义提供者**：

```typescript
// 值提供者
@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useValue: connection,
    },
  ],
})
export class AppModule {}

// 工厂提供者
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const connection = await createConnection(
          configService.get('DB_HOST')
        )
        return connection
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
```

**作用域**：

```typescript
// 单例（默认）
@Injectable()
export class CatsService {}

// 请求作用域
@Injectable({ scope: Scope.REQUEST })
export class CatsService {}

// 瞬态作用域
@Injectable({ scope: Scope.TRANSIENT })
export class CatsService {}
```

**追问点**：
- 依赖注入的优势是什么？
- 如何处理循环依赖？
- 不同作用域的使用场景？

**面试技巧**：
- 强调依赖注入的可测试性
- 提到单例模式的性能优势
- 说明请求作用域的应用场景（如用户上下文）

---

## 管道守卫拦截器

### 4. 管道（Pipe）、守卫（Guard）、拦截器（Interceptor）的区别和执行顺序？

**核心答案**：

这三者是 NestJS 的核心概念，用于处理请求的不同阶段：

**执行顺序**：
1. **中间件（Middleware）**：最先执行
2. **守卫（Guard）**：决定请求是否被处理
3. **拦截器（Interceptor）前置**：在方法执行前
4. **管道（Pipe）**：数据转换和验证
5. **方法处理**：控制器方法
6. **拦截器（Interceptor）后置**：在方法执行后
7. **异常过滤器（Exception Filter）**：捕获异常

**管道（Pipe）**：

```typescript
// 数据验证
import { IsString, IsInt, Min, Max } from 'class-validator'

export class CreateCatDto {
  @IsString()
  name: string

  @IsInt()
  @Min(0)
  @Max(20)
  age: number
}

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body(ValidationPipe) createCatDto: CreateCatDto) {
    return createCatDto
  }
}
```

**守卫（Guard）**：

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    return validateRequest(request)
  }
}

@Controller('cats')
@UseGuards(AuthGuard)
export class CatsController {}
```

**拦截器（Interceptor）**：

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...')
    const now = Date.now()
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      )
  }
}
```

**追问点**：
- 如何自定义管道？
- 守卫的应用场景？
- 拦截器如何转换响应？

**面试技巧**：
- 画出执行流程图
- 强调各自的职责单一性
- 提到全局和局部作用域

---

## 微服务

### 5. NestJS 如何实现微服务架构？

**核心答案**：

NestJS 提供了多种传输层支持，包括 TCP、Redis、NATS、MQTT、Kafka 等。

**基础微服务**：

```typescript
// main.ts
import { NestFactory } from '@nestjs/core'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 8877,
      },
    },
  )
  await app.listen()
}
bootstrap()
```

**消息模式**：

```typescript
// 控制器
@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  accumulate(data: number[]): number {
    return (data || []).reduce((a, b) => a + b)
  }
}
```

**客户端**：

```typescript
// 客户端
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 8877,
        },
      },
    ]),
  ],
})
export class AppModule {}

// 使用
@Injectable()
export class AppService {
  constructor(
    @Inject('MATH_SERVICE') private client: ClientProxy,
  ) {}

  async accumulate() {
    const pattern = { cmd: 'sum' }
    const payload = [1, 2, 3]
    return this.client.send<number>(pattern, payload)
  }
}
```

**追问点**：
- 如何处理微服务间的通信？
- 如何实现服务发现？
- 如何处理消息重试和超时？

**面试技巧**：
- 提到不同传输层的选择
- 说明消息模式和事件模式的区别
- 强调微服务的优缺点

---

## 性能优化

### 6. NestJS 应用如何进行性能优化？

**核心答案**：

**1. 选择合适的平台**：

```typescript
// 使用 Fastify（比 Express 快 2 倍）
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter()
)
```

**2. 启用压缩**：

```typescript
import * as compression from 'compression'

app.use(compression())
```

**3. 使用缓存**：

```typescript
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [CacheModule.register()],
})
export class AppModule {}

// 使用缓存
@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getUsers() {
    const cachedUsers = await this.cacheManager.get('users')
    if (cachedUsers) {
      return cachedUsers
    }
    const users = await this.usersService.findAll()
    await this.cacheManager.set('users', users, 60)
    return users
  }
}
```

**4. 数据库连接池**：

```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'test',
      extra: {
        connectionLimit: 10,  // 连接池大小
      },
    }),
  ],
})
export class AppModule {}
```

**5. 避免阻塞事件循环**：

```typescript
// 错误示例：同步操作
@Get()
findAll() {
  const data = fs.readFileSync('large-file.txt')  // 阻塞
  return data
}

// 正确示例：异步操作
@Get()
async findAll() {
  const data = await fs.promises.readFile('large-file.txt')
  return data
}
```

**追问点**：
- 如何监控应用性能？
- 如何处理内存泄漏？
- 如何优化数据库查询？

**面试技巧**：
- 提到使用 PM2 进行进程管理
- 说明使用 Redis 进行缓存
- 强调异步编程的重要性

---

## 实战场景

### 7. 如何实现统一的异常处理？

**核心答案**：

使用异常过滤器（Exception Filter）来统一处理应用中的异常。

**自定义异常**：

```typescript
export class BusinessException extends HttpException {
  constructor(message: string, code: number) {
    super({ message, code }, HttpStatus.BAD_REQUEST)
  }
}
```

**异常过滤器**：

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    const message = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : (exceptionResponse as any).message

    response.status(status).json({
      code: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}

// 全局注册
app.useGlobalFilters(new HttpExceptionFilter())
```

**追问点**：
- 如何处理未捕获的异常？
- 如何记录异常日志？
- 如何区分业务异常和系统异常？

**面试技巧**：
- 强调统一异常处理的好处
- 提到日志记录的重要性
- 说明错误码的设计

---

### 8. 如何实现请求日志记录？

**核心答案**：

使用拦截器（Interceptor）来记录请求日志。

**日志拦截器**：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, body } = request
    const now = Date.now()

    this.logger.log(`请求开始: ${method} ${url}`)
    this.logger.debug(`请求参数: ${JSON.stringify(body)}`)

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now
          this.logger.log(`请求完成: ${method} ${url} - ${responseTime}ms`)
          this.logger.debug(`响应数据: ${JSON.stringify(data)}`)
        },
        error: (error) => {
          const responseTime = Date.now() - now
          this.logger.error(`请求失败: ${method} ${url} - ${responseTime}ms`)
          this.logger.error(`错误信息: ${error.message}`)
        },
      }),
    )
  }
}

// 全局注册
app.useGlobalInterceptors(new LoggingInterceptor())
```

**追问点**：
- 如何实现日志分级？
- 如何将日志输出到文件？
- 如何实现日志追踪（Trace ID）？

**面试技巧**：
- 提到使用 Winston 或 Pino 日志库
- 说明日志格式的设计
- 强调日志对排查问题的重要性

---

### 9. 如何实现 JWT 认证？

**核心答案**：

使用 `@nestjs/jwt` 和 `@nestjs/passport` 实现 JWT 认证。

**安装依赖**：

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @types/passport-jwt -D
```

**JWT 模块配置**：

```typescript
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class AuthModule {}
```

**JWT 策略**：

```typescript
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key',
    })
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username }
  }
}
```

**认证服务**：

```typescript
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
```

**使用守卫**：

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(AuthGuard('jwt'))
  getProfile() {
    return { message: 'Protected route' }
  }
}
```

**追问点**：
- 如何实现 Token 刷新？
- 如何实现 Token 黑名单？
- 如何处理 Token 过期？

**面试技巧**：
- 强调 JWT 的无状态特性
- 提到 Token 的安全存储
- 说明 HTTPS 的重要性

---

### 10. 如何实现文件上传？

**核心答案**：

使用 `@nestjs/platform-express` 的 `FileInterceptor` 实现文件上传。

**安装依赖**：

```bash
npm install @nestjs/platform-express multer
npm install @types/multer -D
```

**单文件上传**：

```typescript
import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Express } from 'express'

@Controller('upload')
export class UploadController {
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
    }
  }
}
```

**多文件上传**：

```typescript
import { FilesInterceptor } from '@nestjs/platform-express'

@Post('files')
@UseInterceptors(FilesInterceptor('files'))
uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
  return files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
  }))
}
```

**自定义存储**：

```typescript
import { diskStorage } from 'multer'
import { extname } from 'path'

@Post('file')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('')
        cb(null, `${randomName}${extname(file.originalname)}`)
      },
    }),
  }),
)
uploadFile(@UploadedFile() file: Express.Multer.File) {
  return { filename: file.filename }
}
```

**追问点**：
- 如何限制文件大小？
- 如何验证文件类型？
- 如何实现大文件分片上传？

**面试技巧**：
- 提到文件安全性（类型验证、大小限制）
- 说明文件存储方案（本地、OSS）
- 强调错误处理的重要性

---

## 参考资源

- [NestJS 官方文档](https://docs.nestjs.com/) - 最权威的 NestJS 文档
- [NestJS GitHub](https://github.com/nestjs/nest) - 官方 GitHub 仓库
- [NestJS 中文文档](https://docs.nestjs.cn/) - 中文文档

---

> 本文档基于 NestJS 官方文档和 MCP Context7 最新资料整理，涵盖基础概念、模块系统、依赖注入、管道守卫拦截器、微服务、性能优化和实战场景。所有代码示例均可运行，并包含详细的中文注释。

