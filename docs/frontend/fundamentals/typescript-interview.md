# TypeScript 面试题集

> TypeScript 核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. TypeScript 的核心优势

| 优势 | 说明 |
|------|------|
| 静态类型检查 | 编译时发现错误，减少运行时 bug |
| 智能提示 | IDE 支持更好的代码补全和重构 |
| 可维护性 | 类型即文档，代码更易理解 |
| 渐进式采用 | 可以和 JavaScript 混用 |
| 大型项目 | 更适合团队协作和大型项目 |

---

#### 2. 基础类型与类型注解

```typescript
// 基础类型
let str: string = 'hello'
let num: number = 123
let bool: boolean = true
let nul: null = null
let undef: undefined = undefined
let sym: symbol = Symbol('key')
let big: bigint = 100n

// 数组
let arr1: number[] = [1, 2, 3]
let arr2: Array<number> = [1, 2, 3]
let tuple: [string, number] = ['hello', 1] // 元组

// 对象
let obj: { name: string; age: number } = { name: 'John', age: 25 }

// 函数
function add(a: number, b: number): number {
  return a + b
}

const multiply = (a: number, b: number): number => a * b

// 可选参数与默认值
function greet(name: string, greeting?: string): string {
  return `${greeting || 'Hello'}, ${name}`
}

function greet2(name: string, greeting: string = 'Hello'): string {
  return `${greeting}, ${name}`
}

// void 与 never
function log(msg: string): void {
  console.log(msg)
}

function throwError(msg: string): never {
  throw new Error(msg)
}

function infiniteLoop(): never {
  while (true) {}
}
```

---

#### 3. interface 与 type 的区别

```typescript
// interface - 接口
interface User {
  name: string
  age: number
}

// 扩展
interface Admin extends User {
  role: string
}

// 合并声明
interface User {
  email: string // 自动合并
}

// type - 类型别名
type Point = {
  x: number
  y: number
}

// 交叉类型
type Employee = User & {
  department: string
}

// 联合类型（type 独有）
type Status = 'pending' | 'approved' | 'rejected'
type ID = string | number

// 条件类型（type 独有）
type IsString<T> = T extends string ? true : false

// 映射类型（type 独有）
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
```

| 特性 | interface | type |
|------|-----------|------|
| 对象类型 | 支持 | 支持 |
| 联合类型 | 不支持 | 支持 |
| 交叉类型 | extends | & |
| 声明合并 | 支持 | 不支持 |
| 条件类型 | 不支持 | 支持 |
| 推荐场景 | API 契约、类 | 复杂类型运算 |

---

#### 4. 泛型

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg
}

const result = identity<string>('hello') // 显式指定
const result2 = identity(123) // 类型推断

// 泛型接口
interface GenericIdentity<T> {
  (arg: T): T
}

// 泛型类
class GenericNumber<T> {
  value: T
  add: (x: T, y: T) => T
}

// 泛型约束
interface Lengthwise {
  length: number
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length) // 可以访问 length
  return arg
}

// keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// 多个泛型参数
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn)
}

// 泛型默认值
interface Response<T = any> {
  data: T
  status: number
}
```

---

#### 5. 联合类型与类型守卫

```typescript
// 联合类型
type StringOrNumber = string | number

function process(value: StringOrNumber) {
  // 类型守卫
  if (typeof value === 'string') {
    return value.toUpperCase() // string 方法
  }
  return value.toFixed(2) // number 方法
}

// 字面量类型
type Direction = 'up' | 'down' | 'left' | 'right'

// 可辨识联合
interface Circle {
  kind: 'circle'
  radius: number
}

interface Square {
  kind: 'square'
  size: number
}

type Shape = Circle | Square

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'square':
      return shape.size ** 2
  }
}

// 自定义类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

// in 操作符
function printId(id: string | number | { id: string }) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase())
  } else if (typeof id === 'number') {
    console.log(id.toFixed())
  } else if ('id' in id) {
    console.log(id.id)
  }
}

// instanceof
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toISOString())
  } else {
    console.log(x.toUpperCase())
  }
}
```

---

### 进阶题

#### 1. 工具类型

```typescript
// Partial - 所有属性可选
type Partial<T> = {
  [P in keyof T]?: T[P]
}

interface User { name: string; age: number }
type PartialUser = Partial<User>
// { name?: string; age?: number }

// Required - 所有属性必填
type Required<T> = {
  [P in keyof T]-?: T[P]
}

// Readonly - 所有属性只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

// Pick - 选取部分属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
type UserName = Pick<User, 'name'>
// { name: string }

// Omit - 排除部分属性
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
type UserWithoutAge = Omit<User, 'age'>
// { name: string }

// Record - 构造对象类型
type Record<K extends keyof any, T> = {
  [P in K]: T
}
type UserMap = Record<string, User>

// Exclude - 从联合类型中排除
type Exclude<T, U> = T extends U ? never : T
type T1 = Exclude<'a' | 'b' | 'c', 'a'>
// 'b' | 'c'

// Extract - 从联合类型中提取
type Extract<T, U> = T extends U ? T : never
type T2 = Extract<'a' | 'b' | 'c', 'a' | 'f'>
// 'a'

// NonNullable - 排除 null 和 undefined
type NonNullable<T> = T extends null | undefined ? never : T

// ReturnType - 获取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any
function fn() { return { x: 1, y: 2 } }
type FnReturn = ReturnType<typeof fn>
// { x: number; y: number }

// Parameters - 获取函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never
type FnParams = Parameters<typeof fn>
// []

// InstanceType - 获取构造函数实例类型
type InstanceType<T> = T extends new (...args: any[]) => infer R ? R : any
```

---

#### 2. 条件类型与 infer

```typescript
// 基础条件类型
type IsString<T> = T extends string ? true : false
type A = IsString<string> // true
type B = IsString<number> // false

// infer 推断
type UnpackPromise<T> = T extends Promise<infer U> ? U : T
type P1 = UnpackPromise<Promise<string>> // string
type P2 = UnpackPromise<number> // number

// 递归解包
type DeepUnpackPromise<T> = T extends Promise<infer U>
  ? DeepUnpackPromise<U>
  : T

// 数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : T
type E1 = ElementType<string[]> // string

// 函数参数类型
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any
  ? F
  : never

// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never
type TA = ToArray<string | number> // string[] | number[]

// 避免分布式
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never
type TB = ToArrayNonDist<string | number> // (string | number)[]
```

---

## B. 实战文档

### 速查链接

| 资源 | 链接 |
|------|------|
| 官方文档 | https://www.typescriptlang.org/docs/ |
| TypeScript Playground | https://www.typescriptlang.org/play |
| Type Challenges | https://github.com/type-challenges/type-challenges |

### 常用配置 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 声明文件

```typescript
// types/global.d.ts
declare global {
  interface Window {
    customProperty: string
  }
}

// 模块声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.svg' {
  const content: string
  export default content
}

// 环境变量
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    API_URL: string
  }
}
```
