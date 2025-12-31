# Django 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:MVT 架构与请求生命周期？
- 标准答案:URL 路由→视图(View)处理→模板(Template)渲染→模型(Model)与 ORM 交互；中间件在请求/响应链执行；WSGI/ASGI 入口。
- 追问点:ASGI 对异步的支持；中间件顺序；钩子点。
- 参考:https://docs.djangoproject.com/en/stable/topics/http/overview/

### Q2:ORM QuerySet 特性？
- 标准答案:惰性执行、链式过滤、延迟加载；支持 select_related/prefetch_related 减少查询；事务通过 atomic 控制。
- 追问点:N+1 场景；F/Value 表达式；bulk 操作限制。
- 参考:https://docs.djangoproject.com/en/stable/topics/db/queries/

### Q3:模型设计与迁移？
- 标准答案:模型字段类型/约束；通过 makemigrations/migrate 管理 schema；修改字段需考虑数据迁移；自定义迁移脚本；多数据库路由。
- 追问点:迁移冲突解决；默认值处理；大表迁移策略。
- 参考:https://docs.djangoproject.com/en/stable/topics/migrations/

### Q4:认证与权限体系？
- 标准答案:内置 User/Auth、Session、Permission、Group；支持认证后端扩展；中间件处理 session；可用 DRF 权限/认证组件强化。
- 追问点:Token/JWT 集成；密码哈希算法；CSRF 保护。
- 参考:https://docs.djangoproject.com/en/stable/topics/auth/

### Q5:中间件与信号？
- 标准答案:中间件封装横切逻辑；信号如 post_save、pre_delete 传递事件；避免在信号中做重操作；必要时使用任务队列。
- 追问点:信号的弱引用；中间件实例化时机；替代方案。
- 参考:https://docs.djangoproject.com/en/stable/ref/signals/

### Q6:缓存策略？
- 标准答案:支持 per-view、template fragment、低级缓存 API；后端可选内存、Redis、Memcached；合理设置键前缀与过期；配合缓存版本号。
- 追问点:缓存雪崩；多级缓存；缓存失效策略。
- 参考:https://docs.djangoproject.com/en/stable/topics/cache/

### Q7:文件上传与静态资源？
- 标准答案:静态文件用 collectstatic 收集；媒体文件配置 MEDIA_ROOT/URL；大文件需流式处理与存储服务；权限控制。
- 追问点:云存储后端；Nginx 加速；安全校验。
- 参考:https://docs.djangoproject.com/en/stable/howto/static-files/

### Q8:DRF 的核心概念？
- 标准答案:Serializer/ModelSerializer、ViewSet/GenericViewSet、Router、认证/权限/节流、分页；支持 Browsable API；可快速搭建 REST 接口。
- 追问点:序列化性能；自定义分页；过滤/搜索。
- 参考:https://www.django-rest-framework.org/

## 场景/排查
### Q1:遇到 N+1 查询如何优化？
- 标准答案:使用 select_related/prefetch_related；对 ManyToMany/反向外键使用 prefetch；必要时在 serializer 中减少嵌套查询；开启 Django Debug Toolbar。
- 追问点:prefetch 的自定义 queryset；缓存组合；数据量大分页。
- 参考:https://docs.djangoproject.com/en/stable/topics/db/optimization/

### Q2:长事务或锁等待怎么办？
- 标准答案:使用 atomic 控制范围；将耗时操作放任务队列；数据库层加索引、减少扫描；调整隔离级别；监控慢查询。
- 追问点:乐观锁实现；幂等重试；数据库连接池配置。
- 参考:https://docs.djangoproject.com/en/stable/topics/db/transactions/

## 反问
### Q1:项目使用 WSGI 还是 ASGI？部署栈？
- 标准答案:确认 gunicorn/uwsgi/daphne/uvicorn 等，影响同步/异步选择与中间件。
- 追问点:反向代理；静态资源托管；灰度策略。
- 参考:团队内部规范

### Q2:任务队列与定时任务方案？
- 标准答案:是否使用 Celery/RQ/APScheduler，队列后端选择；保证任务幂等与监控。
- 追问点:失败重试策略；延迟队列；集中配置。
- 参考:团队内部规范
