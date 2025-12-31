# FastAPI 面试题集

> FastAPI 现代 Python Web 框架核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. FastAPI 核心特性

```python
from fastapi import FastAPI, HTTPException, Depends, Query, Path, Body
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List

app = FastAPI(
    title="My API",
    description="API Documentation",
    version="1.0.0"
)

# Pydantic 模型
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    age: int = Field(..., ge=0, le=120)
    tags: List[str] = []

    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "john@example.com",
                "age": 25,
                "tags": ["python", "fastapi"]
            }
        }

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True  # 支持 ORM 模型转换

# 路由
@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int = Path(..., ge=1, description="User ID"),
    include_posts: bool = Query(False, description="Include user posts")
):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate):
    db_user = await User.create(**user.dict())
    return db_user

@app.put("/users/{user_id}")
async def update_user(user_id: int, user: UserCreate):
    await User.filter(id=user_id).update(**user.dict())
    return {"status": "updated"}

@app.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int):
    await User.filter(id=user_id).delete()
```

**FastAPI 优势：**
| 特性 | 说明 |
|------|------|
| 高性能 | 基于 Starlette 和 Pydantic，接近 Node.js/Go |
| 类型提示 | 完整的 Python 类型支持 |
| 自动文档 | Swagger UI 和 ReDoc |
| 数据验证 | Pydantic 自动验证 |
| 异步支持 | 原生 async/await |

---

#### 2. 依赖注入

```python
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

# 数据库依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 认证依赖
async def get_current_user(
    token: str = Header(..., alias="Authorization")
) -> User:
    user = await verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

# 权限依赖
def require_role(role: str):
    async def role_checker(user: User = Depends(get_current_user)):
        if role not in user.roles:
            raise HTTPException(status_code=403, detail="Permission denied")
        return user
    return role_checker

# 使用依赖
@app.get("/users")
async def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(User).all()

@app.get("/admin/users")
async def admin_users(
    admin: User = Depends(require_role("admin"))
):
    return {"message": "Admin access granted"}

# 类依赖
class Pagination:
    def __init__(
        self,
        page: int = Query(1, ge=1),
        size: int = Query(10, ge=1, le=100)
    ):
        self.page = page
        self.size = size
        self.offset = (page - 1) * size

@app.get("/items")
async def get_items(pagination: Pagination = Depends()):
    return {
        "page": pagination.page,
        "size": pagination.size,
        "offset": pagination.offset
    }
```

---

#### 3. 请求与响应

```python
from fastapi import FastAPI, Request, Response, File, UploadFile, Form
from fastapi.responses import JSONResponse, HTMLResponse, StreamingResponse
from typing import Annotated

# 请求体
@app.post("/items")
async def create_item(
    name: Annotated[str, Body()],
    price: Annotated[float, Body(gt=0)],
    description: Annotated[str | None, Body()] = None
):
    return {"name": name, "price": price}

# 表单数据
@app.post("/login")
async def login(
    username: Annotated[str, Form()],
    password: Annotated[str, Form()]
):
    return {"username": username}

# 文件上传
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...)
):
    content = await file.read()
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(content)
    }

# 多文件上传
@app.post("/uploads")
async def upload_files(
    files: List[UploadFile] = File(...)
):
    return {"filenames": [f.filename for f in files]}

# 自定义响应
@app.get("/html", response_class=HTMLResponse)
async def get_html():
    return "<h1>Hello World</h1>"

@app.get("/custom")
async def custom_response():
    return JSONResponse(
        content={"message": "Hello"},
        status_code=200,
        headers={"X-Custom-Header": "value"}
    )

# 流式响应
@app.get("/stream")
async def stream():
    async def generate():
        for i in range(10):
            yield f"data: {i}\n\n"
            await asyncio.sleep(1)

    return StreamingResponse(generate(), media_type="text/event-stream")

# 访问原始请求
@app.post("/raw")
async def raw_request(request: Request):
    body = await request.body()
    headers = request.headers
    client = request.client.host
    return {"body": body.decode(), "client": client}
```

---

#### 4. 中间件与异常处理

```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import time

app = FastAPI()

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 自定义中间件
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# 请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"{request.method} {request.url}")
    response = await call_next(request)
    print(f"Status: {response.status_code}")
    return response

# 自定义异常
class BusinessException(Exception):
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message

# 异常处理器
@app.exception_handler(BusinessException)
async def business_exception_handler(request: Request, exc: BusinessException):
    return JSONResponse(
        status_code=400,
        content={"code": exc.code, "message": exc.message}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "code": 422,
            "message": "Validation error",
            "details": exc.errors()
        }
    )

# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"code": 500, "message": "Internal server error"}
    )
```

---

#### 5. 路由组织

```python
from fastapi import APIRouter

# routers/users.py
router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}}
)

@router.get("/")
async def list_users():
    return []

@router.get("/{user_id}")
async def get_user(user_id: int):
    return {"id": user_id}

@router.post("/")
async def create_user():
    return {"id": 1}

# routers/posts.py
posts_router = APIRouter(prefix="/posts", tags=["posts"])

@posts_router.get("/")
async def list_posts():
    return []

# main.py
from fastapi import FastAPI
from routers import users, posts

app = FastAPI()

app.include_router(users.router)
app.include_router(posts.posts_router)

# 带依赖的路由
app.include_router(
    admin_router,
    prefix="/admin",
    dependencies=[Depends(get_admin_user)]
)
```

---

### 进阶题

#### 6. 数据库集成 (SQLAlchemy + async)

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, ForeignKey, select

DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/db"

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# 模型
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100))

# 依赖
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# CRUD 操作
@app.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()

@app.post("/users")
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = User(**user.dict())
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

# 事务
async def transfer_money(from_id: int, to_id: int, amount: float, db: AsyncSession):
    async with db.begin():
        from_user = await db.get(User, from_id)
        to_user = await db.get(User, to_id)
        from_user.balance -= amount
        to_user.balance += amount
```

---

#### 7. 后台任务与 WebSocket

```python
from fastapi import BackgroundTasks, WebSocket, WebSocketDisconnect
from typing import List

# 后台任务
def send_email(email: str, message: str):
    # 发送邮件逻辑
    print(f"Sending email to {email}: {message}")

@app.post("/notify")
async def notify(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_email, email, "Welcome!")
    return {"message": "Notification scheduled"}

# WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Client {client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client {client_id} left")
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "FastAPI 是同步框架" | FastAPI 原生支持 async/await |
| "Pydantic 只做验证" | Pydantic 还做序列化和文档生成 |
| "Depends 只能用函数" | 可以用函数、类、生成器 |
| "BackgroundTasks 是异步队列" | 是简单后台任务，复杂场景用 Celery |
| "FastAPI 不支持 GraphQL" | 可以集成 Strawberry 等库 |

---

## B. 实战文档

### 项目结构

```
fastapi-project/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── user.py
│   ├── routers/
│   │   ├── __init__.py
│   │   └── users.py
│   ├── services/
│   │   └── user_service.py
│   └── dependencies/
│       └── auth.py
├── tests/
├── alembic/
├── requirements.txt
└── .env
```

### 启动配置

```python
# main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时
    await database.connect()
    yield
    # 关闭时
    await database.disconnect()

app = FastAPI(
    title="My API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 运行
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
