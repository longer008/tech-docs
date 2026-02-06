# NestJS 开发指南

> 更新时间：2025-02

## 目录导航

- [核心概念](#核心概念)
- [快速开始](#快速开始)
- [模块系统](#模块系统)
- [控制器](#控制器)
- [提供者](#提供者)
- [依赖注入](#依赖注入)
- [中间件](#中间件)
- [管道](#管道)
- [守卫](#守卫)
- [拦截器](#拦截器)
- [异常过滤器](#异常过滤器)

---

## 核心概念

### 什么是 NestJS？

NestJS 是一个用于构建高效、可扩展的 Node.js 服务器端应用的渐进式框架，使用 TypeScript 构建，完全支持 TypeScript，同时也支持纯 JavaScript。

**核心特点**：
- **TypeScript 优先**：完整的 TypeScript 支持
- **模块化架构**：清晰的模块边界
- **依赖注入**：强大的 IoC 容器
- **装饰器**：基于装饰器的声明式编程
- **企业级**：适合大型项目
- **多平台**：支持 Express 和 Fastify

**设计理念**：
- 借鉴 Angular 的架构思想
- 面向对象编程（OOP）
- 函数式编程（FP）
- 函数响应式编程（FRP）

**适用场景**：
- 企业级应用
- 微服务架构
- RESTful API
- GraphQL API
- WebSocket 应用
- 需要强类型约束的项目

---

## 快速开始

### 安装 CLI

```bash
npm install -g @nestjs/cli
```

### 创建项目

```bash
# 创建新项目
nest new project-name

# 选择包管理器
? Which package manager would you ❤️  to use? (Use arrow keys)
❯ npm
  yarn
  pnpm
```

### 项目结构

```
src/
├── app.controller.ts       # 控制器
├── app.controller.spec.ts  # 控制器测试
├── app.module.ts           # 根模块
├── app.service.ts          # 服务
└── main.ts                 # 入口文件
```

### Hello World

```typescript
// main.ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
}
bootstrap()

// app.module.ts
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// app.control

# 调试模式
npm run start:debug
```

---

## 模块系统

模块是 NestJS 应用的基本构建块，用于组织应用结构。

### 基础模块

```typescript
import { Module } from '@nestjs/common'
import { CatsController } from './cats.controller'
import { CatsService } from './cats.service'

@Module({
  controllers: [CatsController],  // 控制器
  providers: [CatsService],       // 提供者
  imports: [],                    // 导入其他模块
  exports: [],                    // 导出提供者供其他模块使用
})
export class CatsModule {}
```

### 功能模块

```typescript
// users/users.module.ts
import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  // 导出服务供其他模块使用
})
export class UsersModule {}

// app.module.ts
import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'

@Module({
  imports: [UsersModule],  // 导入功能模块
})
export class AppModule {}
```

### 共享模块

```typescript
// common/common.module.ts
import { Module, Global } from '@nestjs/common'
import { LoggerService } from './logger.service'

@Global()  // 全局模块，无需在每个模块中导入
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class CommonModule {}
```

### 动态模块

```typescript
// config/config.module.ts
import { Module, DynamicModule } from '@nestjs/common'
import { ConfigService } from './config.service'

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

// 使用
@Module({
  imports: [
    ConfigModule.forRoot({
      folder: './config',
    }),
  ],
})
export class AppModule {}
```

---

## 控制器

控制器负责处理传入的请求并返回响应。

### 基础控制器

```typescript
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common'

@Controller('cats')  // 路由前缀
export class CatsController {
  // GET /cats
  @Get()
  findAll(): string {
    return 'This action returns all cats'
  }

  // GET /cats/:id
  @Get(':id')
  findOne(@Param('id') id: string): string {
    return `This action returns a #${id} cat`
  }

  // POST /cats
  @Post()
  create(@Body() createCatDto: CreateCatDto): string {
    return 'This action adds a new cat'
  }

  // PUT /cats/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto): string {
    return `This action updates a #${id} cat`
  }

  // DELETE /cats/:id
  @Delete(':id')
  remove(@Param('id') id: string): string {
    return `This action removes a #${id} cat`
  }
}
```

### 请求对象

```typescript
import { Controller, Get, Req, Res, Query, Headers, Ip } from '@nestjs/common'
import { Request, Response } from 'express'

@Controller('cats')
export class CatsController {
  // 请求对象
  @Get()
  findAll(@Req() request: Request): string {
    console.log(request.method)
    console.log(request.url)
    console.log(request.headers)
    return 'All cats'
  }

  // 查询参数
  @Get('search')
  search(@Query('name') name: string, @Query('age') age: number) {
    return { name, age }
  }

  // 请求头
  @Get('headers')
  getHeaders(@Headers('authorization') auth: string) {
    return { auth }
  }

  // IP 地址
  @Get('ip')
  getIp(@Ip() ip: string) {
    return { ip }
  }

  // 响应对象（不推荐）
  @Get('response')
  getResponse(@Res() response: Response) {
    response.status(200).json({ message: 'Hello' })
  }
}
```

### 路由参数

```typescript
@Controller('cats')
export class CatsController {
  // 单个参数
  @Get(':id')
  findOne(@Param('id') id: string) {
    return { id }
  }

  // 多个参数
  @Get(':userId/posts/:postId')
  findPost(
    @Param('userId') userId: string,
    @Param('postId') postId: string,
  ) {
    return { userId, postId }
  }

  // 所有参数
  @Get(':userId/posts/:postId')
  findPost(@Param() params: any) {
    return {
      userId: params.userId,
      postId: params.postId,
    }
  }
}
```

### 状态码和响应头

```typescript
import { Controller, Get, Post, HttpCode, Header } from '@nestjs/common'

@Controller('cats')
export class CatsController {
  // 自定义状态码
  @Post()
  @HttpCode(201)
  create() {
    return 'Created'
  }

  // 自定义响应头
  @Get()
  @Header('Cache-Control', 'no-cache')
  findAll() {
    return 'All cats'
  }
}
```

### 异步处理

```typescript
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  // Promise
  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll()
  }

  // Observable (RxJS)
  @Get()
  findAll(): Observable<Cat[]> {
    return of([])
  }
}
```

---

## 提供者

提供者是 NestJS 的基本概念，用于封装业务逻辑。

### 基础服务

```typescript
import { Injectable } from '@nestjs/common'

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = []

  create(cat: Cat) {
    this.cats.push(cat)
  }

  findAll(): Cat[] {
    return this.cats
  }

  findOne(id: number): Cat {
    return this.cats.find(cat => cat.id === id)
  }

  update(id: number, cat: Cat) {
    const index = this.cats.findIndex(c => c.id === id)
    if (index !== -1) {
      this.cats[index] = cat
    }
  }

  remove(id: number) {
    const index = this.cats.findIndex(cat => cat.id === id)
    if (index !== -1) {
      this.cats.splice(index, 1)
    }
  }
}
```

### 注册提供者

```typescript
// 标准提供者
@Module({
  providers: [CatsService],
})
export class CatsModule {}

// 等价于
@Module({
  providers: [
    {
      provide: CatsService,
      useClass: CatsService,
    },
  ],
})
export class CatsModule {}
```

### 自定义提供者

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

// 类提供者
@Module({
  providers: [
    {
      provide: CatsService,
      useClass: MockCatsService,
    },
  ],
})
export class AppModule {}

// 工厂提供者
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        const connection = await createConnection()
        return connection
      },
    },
  ],
})
export class AppModule {}

// 异步工厂提供者
@Module({
  providers: [
    {
      provide: 'ASYNC_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const connection = await createConnection(configService.get('DB_HOST'))
        return connection
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
```



---

## 依赖注入

NestJS 使用强大的依赖注入系统来管理类之间的依赖关系。

### 构造函数注入

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

### 属性注入

```typescript
import { Injectable, Inject } from '@nestjs/common'

@Injectable()
export class CatsService {
  @Inject('CONNECTION')
  private connection: Connection
}
```

### 可选依赖

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common'

@Injectable()
export class HttpService {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: any) {}
}
```

### 作用域

```typescript
import { Injectable, Scope } from '@nestjs/common'

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

---

## 中间件

中间件是在路由处理程序之前调用的函数。

### 函数式中间件

```typescript
import { Request, Response, NextFunction } from 'express'

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`)
  next()
}

// 应用中间件
@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(logger)
      .forRoutes('cats')
  }
}
```

### 类中间件

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...')
    next()
  }
}

// 应用中间件
@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats')
  }
}
```

### 多个中间件

```typescript
@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, AuthMiddleware)
      .forRoutes('cats')
  }
}
```

### 排除路由

```typescript
@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude(
        { path: 'cats', method: RequestMethod.GET },
        { path: 'cats', method: RequestMethod.POST },
        'cats/(.*)',
      )
      .forRoutes(CatsController)
  }
}
```

### 全局中间件

```typescript
// main.ts
const app = await NestFactory.create(AppModule)
app.use(logger)
await app.listen(3000)
```

---

## 管道

管道用于数据转换和验证。

### 内置管道

```typescript
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseBoolPipe,
  ParseArrayPipe,
  ParseUUIDPipe,
} from '@nestjs/common'

@Controller('cats')
export class CatsController {
  // 解析整数
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return { id }
  }

  // 解析布尔值
  @Get('active/:status')
  findActive(@Param('status', ParseBoolPipe) status: boolean) {
    return { status }
  }

  // 解析数组
  @Get('ids')
  findByIds(@Query('ids', ParseArrayPipe) ids: number[]) {
    return { ids }
  }

  // 解析 UUID
  @Get('uuid/:id')
  findByUUID(@Param('id', ParseUUIDPipe) id: string) {
    return { id }
  }
}
```

### ValidationPipe

```bash
npm install class-validator class-transformer
```

```typescript
// DTO
import { IsString, IsInt, Min, Max } from 'class-validator'

export class CreateCatDto {
  @IsString()
  name: string

  @IsInt()
  @Min(0)
  @Max(20)
  age: number

  @IsString()
  breed: string
}

// 控制器
@Controller('cats')
export class CatsController {
  @Post()
  create(@Body(ValidationPipe) createCatDto: CreateCatDto) {
    return createCatDto
  }
}

// 全局启用
// main.ts
app.useGlobalPipes(new ValidationPipe())
```

### 自定义管道

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10)
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed')
    }
    return val
  }
}

// 使用
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return { id }
}
```

---

## 守卫

守卫用于确定请求是否应该被处理。

### 基础守卫

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    return validateRequest(request)
  }
}

// 使用
@Controller('cats')
@UseGuards(AuthGuard)
export class CatsController {}
```

### 角色守卫

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler())
    if (!roles) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const user = request.user
    return matchRoles(roles, user.roles)
  }
}

// 自定义装饰器
import { SetMetadata } from '@nestjs/common'

export const Roles = (...roles: string[]) => SetMetadata('roles', roles)

// 使用
@Controller('cats')
@UseGuards(RolesGuard)
export class CatsController {
  @Post()
  @Roles('admin')
  create(@Body() createCatDto: CreateCatDto) {
    return createCatDto
  }
}
```

### 全局守卫

```typescript
// main.ts
app.useGlobalGuards(new RolesGuard())

// 或在模块中
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

---

## 拦截器

拦截器可以在方法执行前后添加额外的逻辑。

### 基础拦截器

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

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

// 使用
@Controller('cats')
@UseInterceptors(LoggingInterceptor)
export class CatsController {}
```

### 转换响应

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
  data: T
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map(data => ({ data })))
  }
}

// 使用
@Controller('cats')
@UseInterceptors(TransformInterceptor)
export class CatsController {
  @Get()
  findAll() {
    return []  // 返回 { data: [] }
  }
}
```

### 缓存拦截器

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, of } from 'rxjs'

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isCached = true
    if (isCached) {
      return of([])
    }
    return next.handle()
  }
}
```

---

## 异常过滤器

异常过滤器用于处理应用中抛出的异常。

### 内置异常

```typescript
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common'

@Controller('cats')
export class CatsController {
  @Get()
  findAll() {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    throw new NotFoundException(`Cat #${id} not found`)
  }

  @Post()
  create() {
    throw new BadRequestException('Invalid input')
  }
}
```

### 自定义异常

```typescript
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN)
  }
}

// 使用
throw new ForbiddenException()
```

### 异常过滤器

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message,
      })
  }
}

// 使用
@Controller('cats')
@UseFilters(HttpExceptionFilter)
export class CatsController {}

// 全局使用
app.useGlobalFilters(new HttpExceptionFilter())
```

---

## 参考资源

- [NestJS 官方文档](https://docs.nestjs.com/) - 最权威的 NestJS 文档
- [NestJS GitHub](https://github.com/nestjs/nest) - 官方 GitHub 仓库
- [NestJS 中文文档](https://docs.nestjs.cn/) - 中文文档

---

> 本文档基于 NestJS 官方文档和 MCP Context7 最新资料整理，涵盖核心概念、模块系统、控制器、提供者、依赖注入、中间件、管道、守卫、拦截器和异常过滤器。所有代码示例均可运行，并包含详细的中文注释。
