# NestJS 面试题集

> NestJS 企业级框架核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. NestJS 核心概念

```typescript
// 模块 (Module) - 组织代码的基本单元
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}

// 控制器 (Controller) - 处理 HTTP 请求
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(+id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }
}

// 服务 (Provider) - 业务逻辑
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }
}
```

---

#### 2. 依赖注入 (DI)

```typescript
// 构造器注入（推荐）
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService
  ) {}
}

// 属性注入
@Injectable()
export class UserService {
  @Inject()
  private readonly userRepository: UserRepository;
}

// 自定义 Provider
@Module({
  providers: [
    // 类 Provider
    UserService,

    // 值 Provider
    {
      provide: 'CONFIG',
      useValue: { apiKey: 'xxx' }
    },

    // 工厂 Provider
    {
      provide: 'ASYNC_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const config = await configService.get('database');
        return createConnection(config);
      },
      inject: [ConfigService]
    },

    // 别名 Provider
    {
      provide: 'AliasService',
      useExisting: UserService
    }
  ]
})
export class AppModule {}

// 使用注入令牌
@Injectable()
export class UserService {
  constructor(
    @Inject('CONFIG') private config: any,
    @Inject('ASYNC_CONNECTION') private connection: Connection
  ) {}
}
```

---

#### 3. 中间件与拦截器

```typescript
// 中间件 (Middleware)
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.url}`);
    next();
  }
}

// 应用中间件
@Module({
  imports: [UserModule]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude({ path: 'health', method: RequestMethod.GET })
      .forRoutes('*');
  }
}

// 拦截器 (Interceptor)
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        code: 200,
        message: 'success',
        data
      }))
    );
  }
}

// 日志拦截器
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(
      tap(() => console.log(`After... ${Date.now() - now}ms`))
    );
  }
}

// 应用拦截器
@UseInterceptors(TransformInterceptor)
@Controller('users')
export class UserController {}

// 全局拦截器
app.useGlobalInterceptors(new TransformInterceptor());
```

---

#### 4. 守卫与管道

```typescript
// 守卫 (Guard) - 权限验证
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

// 角色守卫
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}

// 角色装饰器
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// 使用
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Get('admin')
getAdminData() {
  return 'admin data';
}

// 管道 (Pipe) - 数据验证/转换
@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // 验证逻辑
    return value;
  }
}

// 内置管道
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.userService.findOne(id);
}

// 全局验证管道
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // 过滤非白名单属性
  forbidNonWhitelisted: true, // 非白名单属性报错
  transform: true,           // 自动类型转换
  transformOptions: {
    enableImplicitConversion: true
  }
}));
```

---

#### 5. DTO 与验证

```typescript
// DTO 定义
import { IsString, IsEmail, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 20)
  name: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(0)
  @Max(120)
  age: number;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

// 查询 DTO
export class QueryUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// 使用
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return this.userService.create(createUserDto);
}

@Get()
findAll(@Query() query: QueryUserDto) {
  return this.userService.findAll(query);
}
```

---

### 进阶题

#### 6. 异常处理

```typescript
// 自定义异常
export class BusinessException extends HttpException {
  constructor(message: string, code: number = 400) {
    super({ message, code }, HttpStatus.BAD_REQUEST);
  }
}

// 异常过滤器
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      code: status,
      message: typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message,
      timestamp: new Date().toISOString(),
      path: request.url
    });
  }
}

// 全局异常过滤器
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    this.logger.error(`${request.method} ${request.url}`, exception);

    response.status(status).json({
      code: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url
    });
  }
}

// 应用过滤器
app.useGlobalFilters(new AllExceptionsFilter(new Logger()));
```

---

#### 7. 数据库集成 (TypeORM)

```typescript
// 实体定义
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // 关联关系
  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];
}

// 模块配置
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'test',
      entities: [User],
      synchronize: process.env.NODE_ENV !== 'production'
    }),
    TypeOrmModule.forFeature([User])
  ]
})
export class AppModule {}

// Repository 使用
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAll(query: QueryUserDto): Promise<[User[], number]> {
    const { name, page, limit } = query;

    const qb = this.userRepository.createQueryBuilder('user');

    if (name) {
      qb.where('user.name LIKE :name', { name: `%${name}%` });
    }

    return qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  async findOneWithRelations(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['posts', 'roles']
    });
  }
}
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "NestJS 只能用 Express" | 支持 Express 和 Fastify 两种平台 |
| "中间件和拦截器一样" | 中间件先执行，拦截器可访问执行上下文 |
| "守卫只能验证 JWT" | 守卫可实现任何授权逻辑 |
| "管道只能验证" | 管道可以转换和验证数据 |
| "@Injectable() 可以省略" | Provider 必须使用 @Injectable() |

---

## B. 实战文档

### 项目结构

```
nest-app/
├── src/
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/
│   │   └── configuration.ts
│   ├── modules/
│   │   ├── user/
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.module.ts
│   │   └── auth/
│   ├── app.module.ts
│   └── main.ts
├── test/
├── nest-cli.json
└── package.json
```

### 启动配置

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 安全
  app.use(helmet());
  app.enableCors();

  // 全局前缀
  app.setGlobalPrefix('api');

  // 全局管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }));

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
```

### 常用装饰器

```typescript
// 控制器装饰器
@Controller('users')
@ApiTags('用户管理')
@UseGuards(AuthGuard)
export class UserController {

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, type: [UserDto] })
  findAll() {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ValidationPipe)
  create(@Body() dto: CreateUserDto) {}

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id', ParseIntPipe) id: number) {}
}

// 自定义装饰器
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);

// 使用
@Get('profile')
getProfile(@User() user: UserEntity) {
  return user;
}
```
