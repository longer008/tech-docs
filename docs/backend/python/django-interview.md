# Django 面试题集

> Django Web 框架核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. Django MTV 架构

```
┌─────────────────────────────────────────────────────┐
│                    Django MTV                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│   URL ──→ View ──→ Model ──→ Database               │
│             │                    │                   │
│             └───→ Template ←─────┘                   │
│                      │                               │
│                      ↓                               │
│                  Response                            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

| 组件 | 说明 | 对应 MVC |
|------|------|----------|
| Model | 数据模型，ORM | Model |
| Template | 模板，HTML 渲染 | View |
| View | 视图，业务逻辑 | Controller |

```python
# models.py
from django.db import models

class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

# views.py
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse

def user_list(request):
    users = User.objects.all()
    return render(request, 'users/list.html', {'users': users})

def user_detail(request, pk):
    user = get_object_or_404(User, pk=pk)
    return JsonResponse({'id': user.id, 'username': user.username})

# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.user_list, name='user_list'),
    path('users/<int:pk>/', views.user_detail, name='user_detail'),
]
```

---

#### 2. ORM 查询

```python
from django.db.models import Q, F, Count, Sum, Avg

# 基础查询
User.objects.all()
User.objects.get(pk=1)
User.objects.filter(age__gte=18)
User.objects.exclude(status='inactive')
User.objects.first()
User.objects.last()
User.objects.count()
User.objects.exists()

# 字段查找
User.objects.filter(name__exact='Tom')
User.objects.filter(name__iexact='tom')  # 不区分大小写
User.objects.filter(name__contains='om')
User.objects.filter(name__icontains='om')
User.objects.filter(name__startswith='T')
User.objects.filter(name__endswith='m')
User.objects.filter(age__in=[18, 20, 22])
User.objects.filter(age__range=(18, 30))
User.objects.filter(email__isnull=True)

# 日期查询
User.objects.filter(created_at__year=2024)
User.objects.filter(created_at__month=1)
User.objects.filter(created_at__date=date.today())

# Q 对象（复杂查询）
User.objects.filter(Q(age__gte=18) | Q(status='vip'))
User.objects.filter(Q(age__gte=18) & ~Q(status='banned'))

# F 对象（字段引用）
User.objects.filter(updated_at__gt=F('created_at'))
User.objects.update(views=F('views') + 1)

# 聚合
User.objects.aggregate(
    total=Count('id'),
    avg_age=Avg('age'),
    sum_balance=Sum('balance')
)

# 分组
User.objects.values('department').annotate(
    count=Count('id'),
    avg_age=Avg('age')
)

# 排序
User.objects.order_by('created_at')
User.objects.order_by('-created_at')  # 降序
User.objects.order_by('department', '-age')

# 分页
User.objects.all()[10:20]  # OFFSET 10 LIMIT 10

# 选择字段
User.objects.values('id', 'username')
User.objects.values_list('id', 'username')
User.objects.values_list('id', flat=True)

# 去重
User.objects.values('department').distinct()

# 关联查询
User.objects.select_related('profile')  # 一对一/多对一
User.objects.prefetch_related('posts')  # 一对多/多对多

# 原生 SQL
User.objects.raw('SELECT * FROM users WHERE age > %s', [18])
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute('SELECT * FROM users')
    rows = cursor.fetchall()
```

---

#### 3. 模型关系

```python
# 一对多
class Post(models.Model):
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    title = models.CharField(max_length=200)

# 使用
user.posts.all()
post.author

# 多对多
class Tag(models.Model):
    name = models.CharField(max_length=50)

class Article(models.Model):
    tags = models.ManyToManyField(Tag, related_name='articles')

# 使用
article.tags.all()
article.tags.add(tag)
article.tags.remove(tag)
article.tags.set([tag1, tag2])
article.tags.clear()

# 一对一
class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    avatar = models.ImageField(upload_to='avatars/')

# on_delete 选项
# CASCADE    - 级联删除
# PROTECT    - 阻止删除
# SET_NULL   - 设为 NULL
# SET_DEFAULT - 设为默认值
# DO_NOTHING - 不做任何操作
```

---

#### 4. 类视图 (CBV)

```python
from django.views import View
from django.views.generic import (
    ListView, DetailView, CreateView, UpdateView, DeleteView
)

# 基础类视图
class UserView(View):
    def get(self, request):
        users = User.objects.all()
        return JsonResponse({'users': list(users.values())})

    def post(self, request):
        data = json.loads(request.body)
        user = User.objects.create(**data)
        return JsonResponse({'id': user.id}, status=201)

# 通用视图
class UserListView(ListView):
    model = User
    template_name = 'users/list.html'
    context_object_name = 'users'
    paginate_by = 10

    def get_queryset(self):
        queryset = super().get_queryset()
        name = self.request.GET.get('name')
        if name:
            queryset = queryset.filter(name__icontains=name)
        return queryset

class UserDetailView(DetailView):
    model = User
    template_name = 'users/detail.html'

class UserCreateView(CreateView):
    model = User
    fields = ['username', 'email']
    template_name = 'users/form.html'
    success_url = '/users/'

class UserUpdateView(UpdateView):
    model = User
    fields = ['username', 'email']
    template_name = 'users/form.html'

class UserDeleteView(DeleteView):
    model = User
    success_url = '/users/'
```

---

#### 5. 中间件

```python
# 函数式中间件
def simple_middleware(get_response):
    def middleware(request):
        # 请求处理前
        print(f"Before: {request.path}")

        response = get_response(request)

        # 响应处理后
        print(f"After: {response.status_code}")
        return response

    return middleware

# 类式中间件
class LoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 请求处理前
        start_time = time.time()

        response = self.get_response(request)

        # 响应处理后
        duration = time.time() - start_time
        print(f"{request.method} {request.path} - {duration:.3f}s")
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        # 视图调用前
        pass

    def process_exception(self, request, exception):
        # 异常处理
        pass

    def process_template_response(self, request, response):
        # 模板响应处理
        return response

# settings.py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'myapp.middleware.LoggingMiddleware',  # 自定义中间件
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]
```

---

### 进阶题

#### 6. Django REST Framework

```python
# serializers.py
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        name = self.request.query_params.get('name')
        if name:
            queryset = queryset.filter(name__icontains=name)
        return queryset

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'status': 'activated'})

# urls.py
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('users', UserViewSet)

urlpatterns = router.urls
```

---

#### 7. 信号与缓存

```python
# 信号
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

@receiver(post_save, sender=User)
def user_created(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(pre_delete, sender=User)
def user_deleted(sender, instance, **kwargs):
    # 清理操作
    pass

# 缓存
from django.core.cache import cache
from django.views.decorators.cache import cache_page

# 低级缓存 API
cache.set('key', 'value', timeout=300)
value = cache.get('key', default=None)
cache.delete('key')
cache.clear()

# 视图缓存
@cache_page(60 * 15)  # 15 分钟
def user_list(request):
    pass

# 模板缓存
{% load cache %}
{% cache 300 sidebar request.user.id %}
    ... sidebar content ...
{% endcache %}

# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "QuerySet 立即执行" | QuerySet 是惰性的，使用时才执行 |
| "ForeignKey 默认可为空" | 默认 NOT NULL，需显式 null=True |
| "select_related 用于多对多" | 多对多用 prefetch_related |
| "中间件顺序不重要" | 顺序很重要，影响执行流程 |
| "Django ORM 不支持事务" | 支持，使用 transaction.atomic() |

---

## B. 实战文档

### 项目结构

```
myproject/
├── manage.py
├── requirements.txt
├── myproject/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── users/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── tests.py
│   └── posts/
├── templates/
├── static/
└── media/
```

### 常用命令

```bash
# 创建项目
django-admin startproject myproject

# 创建应用
python manage.py startapp myapp

# 迁移
python manage.py makemigrations
python manage.py migrate

# 创建超级用户
python manage.py createsuperuser

# 运行服务器
python manage.py runserver

# Shell
python manage.py shell

# 测试
python manage.py test

# 收集静态文件
python manage.py collectstatic
```
