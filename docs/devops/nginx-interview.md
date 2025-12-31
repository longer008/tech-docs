# Nginx 配置面试题集

> Nginx 核心配置与高频面试题

## A. 面试宝典

### 基础题

#### 1. Nginx 概述

```
┌─────────────────────────────────────────────────────────────┐
│                    Nginx 特点与应用                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  核心特点：                                                  │
│  ├── 高性能：异步非阻塞，单机支持数万并发                   │
│  ├── 低内存：内存占用少                                     │
│  ├── 高可靠：热部署、平滑重启                               │
│  ├── 模块化：功能模块化设计                                 │
│  └── 跨平台：支持 Linux、Windows、macOS                     │
│                                                              │
│  主要应用：                                                  │
│  ├── Web 服务器：静态资源服务                               │
│  ├── 反向代理：代理后端服务                                 │
│  ├── 负载均衡：分发请求到多台服务器                         │
│  ├── HTTP 缓存：缓存后端响应                                │
│  └── API 网关：路由、限流、认证                             │
│                                                              │
│  工作模型：                                                  │
│  ├── Master 进程：管理 Worker 进程                          │
│  └── Worker 进程：处理请求（通常等于 CPU 核心数）           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**常用命令：**
```bash
# 启动
nginx                       # 启动
nginx -c /path/nginx.conf   # 指定配置文件启动

# 停止
nginx -s stop               # 快速停止
nginx -s quit               # 优雅停止（等待请求处理完）

# 重载配置
nginx -s reload             # 重载配置（不停机）
nginx -s reopen             # 重新打开日志文件

# 检查配置
nginx -t                    # 测试配置语法
nginx -T                    # 测试并输出配置

# 查看版本
nginx -v                    # 版本
nginx -V                    # 版本和编译参数
```

---

#### 2. 配置文件结构

```nginx
# nginx.conf 基本结构
# ============================================

# 全局块
user nginx;                         # 运行用户
worker_processes auto;              # Worker 进程数（auto = CPU核心数）
error_log /var/log/nginx/error.log; # 错误日志
pid /run/nginx.pid;                 # PID 文件

# 事件块
events {
    worker_connections 1024;        # 每个 Worker 最大连接数
    use epoll;                      # 事件模型（Linux 用 epoll）
    multi_accept on;                # 一次接受多个连接
}

# HTTP 块
http {
    # 基础设置
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent"';

    access_log /var/log/nginx/access.log main;

    # 性能优化
    sendfile on;                    # 零拷贝
    tcp_nopush on;                  # 优化数据包发送
    tcp_nodelay on;                 # 禁用 Nagle 算法
    keepalive_timeout 65;           # 保持连接超时

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # 包含其他配置
    include /etc/nginx/conf.d/*.conf;

    # Server 块
    server {
        listen 80;
        server_name example.com;
        root /var/www/html;

        # Location 块
        location / {
            index index.html;
        }
    }
}
```

---

#### 3. 静态资源服务

```nginx
server {
    listen 80;
    server_name static.example.com;

    # 静态文件根目录
    root /var/www/static;

    # 默认首页
    index index.html index.htm;

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;                        # 缓存30天
        add_header Cache-Control "public";
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }

    # 防盗链
    location ~* \.(jpg|jpeg|png|gif)$ {
        valid_referers none blocked server_names *.example.com;
        if ($invalid_referer) {
            return 403;
        }
    }

    # 目录列表（调试用）
    location /files/ {
        autoindex on;                       # 开启目录浏览
        autoindex_exact_size off;           # 显示文件大小
        autoindex_localtime on;             # 显示本地时间
    }

    # try_files 尝试查找文件
    location / {
        try_files $uri $uri/ /index.html;   # SPA 路由支持
    }

    # 错误页面
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

---

#### 4. 反向代理

```nginx
# 基础反向代理
# ============================================

upstream backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://backend;

        # 代理头设置
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # WebSocket 代理
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;           # WebSocket 长连接
    }
}

# 多路径代理
server {
    listen 80;
    server_name example.com;

    # API 服务
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
    }

    # 用户服务
    location /user/ {
        proxy_pass http://127.0.0.1:3001/;
    }

    # 静态资源
    location / {
        root /var/www/frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

---

#### 5. 负载均衡

```nginx
# 负载均衡策略
# ============================================

# 1. 轮询（默认）
upstream backend {
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;
    server 192.168.1.3:8080;
}

# 2. 加权轮询
upstream backend {
    server 192.168.1.1:8080 weight=5;       # 权重5
    server 192.168.1.2:8080 weight=3;       # 权重3
    server 192.168.1.3:8080 weight=2;       # 权重2
}

# 3. IP Hash（会话保持）
upstream backend {
    ip_hash;
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;
    server 192.168.1.3:8080;
}

# 4. 最少连接
upstream backend {
    least_conn;
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;
    server 192.168.1.3:8080;
}

# 5. URL Hash（需要第三方模块）
upstream backend {
    hash $request_uri consistent;
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;
}

# 服务器状态参数
upstream backend {
    server 192.168.1.1:8080 weight=5;
    server 192.168.1.2:8080 backup;         # 备用服务器
    server 192.168.1.3:8080 down;           # 下线
    server 192.168.1.4:8080 max_fails=3 fail_timeout=30s;
}

# 健康检查（商业版或第三方模块）
upstream backend {
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;

    # 需要 nginx_upstream_check_module
    check interval=3000 rise=2 fall=3 timeout=1000 type=http;
    check_http_send "HEAD /health HTTP/1.0\r\n\r\n";
    check_http_expect_alive http_2xx http_3xx;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
        proxy_next_upstream error timeout http_500 http_502 http_503;
    }
}
```

---

### 进阶题

#### 6. HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    # SSL 证书
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    # SSL 协议版本
    ssl_protocols TLSv1.2 TLSv1.3;

    # 加密套件
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;

    # SSL 会话缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        root /var/www/html;
        index index.html;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

---

#### 7. 缓存配置

```nginx
# 代理缓存
# ============================================

http {
    # 定义缓存路径
    proxy_cache_path /var/cache/nginx
                     levels=1:2
                     keys_zone=my_cache:10m
                     max_size=10g
                     inactive=60m
                     use_temp_path=off;

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend;

            # 启用缓存
            proxy_cache my_cache;
            proxy_cache_key $scheme$request_method$host$request_uri;

            # 缓存有效期
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;

            # 缓存条件
            proxy_cache_bypass $http_cache_control;
            proxy_no_cache $http_pragma;

            # 添加缓存状态头
            add_header X-Cache-Status $upstream_cache_status;

            # 过期后允许使用过期缓存
            proxy_cache_use_stale error timeout updating http_500 http_502;

            # 后台更新缓存
            proxy_cache_background_update on;
        }

        # 不缓存的路径
        location ~ ^/(api|admin) {
            proxy_pass http://backend;
            proxy_cache off;
        }
    }
}

# 静态资源缓存
server {
    listen 80;
    server_name static.example.com;

    location ~* \.(css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(jpg|jpeg|png|gif|ico|webp)$ {
        expires 30d;
        add_header Cache-Control "public";
    }

    location ~* \.(html|htm)$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
```

---

#### 8. 限流配置

```nginx
http {
    # 定义限流区域
    # 按 IP 限制请求速率
    limit_req_zone $binary_remote_addr zone=req_limit:10m rate=10r/s;

    # 按 IP 限制连接数
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

    server {
        listen 80;
        server_name example.com;

        # 请求速率限制
        location /api/ {
            limit_req zone=req_limit burst=20 nodelay;
            # burst: 突发请求数
            # nodelay: 不延迟处理突发请求

            proxy_pass http://backend;
        }

        # 连接数限制
        location /download/ {
            limit_conn conn_limit 5;         # 每 IP 最多5个连接
            limit_rate 500k;                 # 限速 500KB/s

            root /var/www/files;
        }

        # 自定义限流响应
        limit_req_status 429;
        limit_conn_status 429;

        error_page 429 /429.html;
        location = /429.html {
            root /var/www/error;
        }
    }
}

# 基于地理位置限流
http {
    geo $limit {
        default 1;
        10.0.0.0/8 0;                       # 内网不限制
        192.168.0.0/16 0;
    }

    map $limit $limit_key {
        0 "";
        1 $binary_remote_addr;
    }

    limit_req_zone $limit_key zone=req_limit:10m rate=5r/s;
}
```

---

#### 9. 日志配置

```nginx
http {
    # 自定义日志格式
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '"$http_x_forwarded_for" '
                    '$request_time $upstream_response_time';

    log_format json escape=json
        '{"time":"$time_iso8601",'
        '"remote_addr":"$remote_addr",'
        '"request":"$request",'
        '"status":$status,'
        '"body_bytes_sent":$body_bytes_sent,'
        '"request_time":$request_time,'
        '"upstream_response_time":"$upstream_response_time",'
        '"http_referer":"$http_referer",'
        '"http_user_agent":"$http_user_agent"}';

    # 默认访问日志
    access_log /var/log/nginx/access.log main;

    # 按域名分离日志
    server {
        server_name example.com;
        access_log /var/log/nginx/example.com.access.log main;
        error_log /var/log/nginx/example.com.error.log warn;
    }

    # 条件日志
    map $status $loggable {
        ~^[23] 0;                            # 2xx、3xx 不记录
        default 1;
    }

    server {
        access_log /var/log/nginx/error.access.log main if=$loggable;
    }

    # 关闭日志
    location /health {
        access_log off;
        return 200 "OK";
    }
}

# 日志常用变量
# $remote_addr        客户端 IP
# $remote_user        客户端用户名
# $time_local         本地时间
# $request            请求行
# $status             响应状态码
# $body_bytes_sent    发送的字节数
# $http_referer       来源页面
# $http_user_agent    用户代理
# $request_time       请求处理时间
# $upstream_response_time 上游响应时间
```

---

#### 10. 安全配置

```nginx
server {
    listen 80;
    server_name example.com;

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 隐藏版本号
    server_tokens off;

    # 禁止特定 User-Agent
    if ($http_user_agent ~* (wget|curl|libwww-perl)) {
        return 403;
    }

    # 禁止特定请求方法
    if ($request_method !~ ^(GET|POST|HEAD)$) {
        return 405;
    }

    # 防止目录遍历
    location ~ /\. {
        deny all;
    }

    # 限制上传大小
    client_max_body_size 10m;

    # 基础认证
    location /admin {
        auth_basic "Admin Area";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://backend;
    }

    # IP 白名单
    location /internal {
        allow 192.168.1.0/24;
        allow 10.0.0.0/8;
        deny all;

        proxy_pass http://backend;
    }
}

# 防止 DDoS
http {
    # 限制连接
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    limit_conn addr 100;

    # 限制请求速率
    limit_req_zone $binary_remote_addr zone=one:10m rate=30r/m;
    limit_req zone=one burst=5;
}
```

---

### 避坑指南

| 问题 | 解决方案 |
|------|----------|
| proxy_pass 末尾有无 `/` | 有 `/` 会替换 location，无 `/` 会追加 |
| 502 Bad Gateway | 检查后端服务是否启动、端口是否正确 |
| 504 Gateway Timeout | 增加 proxy_read_timeout |
| 配置不生效 | 执行 nginx -t && nginx -s reload |
| 权限问题 | 检查 user 配置和文件权限 |

---

## B. 实战文档

### 完整配置模板

```nginx
# /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    '$request_time $upstream_response_time';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript
               application/xml application/xml+rss text/javascript;

    # 安全
    server_tokens off;

    # 缓存
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=cache:10m
                     max_size=1g inactive=60m use_temp_path=off;

    # 限流
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=conn:10m;

    # 上游服务
    upstream backend {
        least_conn;
        server 127.0.0.1:3000 weight=5;
        server 127.0.0.1:3001 weight=3;
        keepalive 32;
    }

    include /etc/nginx/conf.d/*.conf;
}
```

### 前后端分离配置

```nginx
# /etc/nginx/conf.d/app.conf
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    # SSL
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # 前端静态资源
    root /var/www/frontend/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 30d;
        add_header Cache-Control "public";
    }

    # API 代理
    location /api/ {
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://backend/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "OK";
    }
}
```

### Location 匹配规则

```
┌─────────────────────────────────────────────────────────────┐
│                    Location 匹配优先级                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  优先级从高到低：                                            │
│                                                              │
│  1. =  精确匹配                                              │
│     location = /exact { }                                   │
│                                                              │
│  2. ^~ 前缀匹配（停止正则搜索）                              │
│     location ^~ /static/ { }                                │
│                                                              │
│  3. ~  区分大小写的正则                                      │
│     location ~ \.php$ { }                                   │
│                                                              │
│  4. ~* 不区分大小写的正则                                    │
│     location ~* \.(jpg|png)$ { }                            │
│                                                              │
│  5. /  普通前缀匹配                                          │
│     location / { }                                          │
│                                                              │
│  匹配流程：                                                  │
│  1. 先检查所有前缀匹配，记住最长匹配                         │
│  2. 如果最长匹配是 = 或 ^~，直接使用                         │
│  3. 否则按顺序检查正则，使用第一个匹配的                     │
│  4. 如果没有正则匹配，使用之前记住的最长前缀匹配             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 常见变量

```nginx
# 请求相关
$request            # 完整请求行
$request_method     # 请求方法
$request_uri        # 带参数的 URI
$uri                # 不带参数的 URI
$args               # 查询参数
$query_string       # 同 $args
$scheme             # 协议 http/https
$host               # 主机名
$server_name        # 服务器名

# 客户端
$remote_addr        # 客户端 IP
$remote_port        # 客户端端口
$http_user_agent    # User-Agent
$http_referer       # Referer
$http_cookie        # Cookie
$http_x_forwarded_for  # 代理链 IP

# 响应
$status             # 响应状态码
$body_bytes_sent    # 发送的字节数

# 时间
$time_local         # 本地时间
$time_iso8601       # ISO 8601 格式时间
$request_time       # 请求处理时间
$upstream_response_time # 上游响应时间
```
