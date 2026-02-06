# TypeScript

> JavaScript 的超集，为大型应用提供静态类型检查

**更新时间**: 2025-02

## 📋 目录

- [核心概念](#核心概念)
- [基础类型](#基础类型)
- [高级类型](#高级类型)
- [泛型](#泛型)
- [工具类型](#工具类型)
- [类型守卫](#类型守卫)
- [配置选项](#配置选项)
- [最佳实践](#最佳实践)

---

## 🎯 核心概念

### 什么是 TypeScript？

TypeScript 是 JavaScript 的超集，添加了可选的静态类型和基于类的面向对象编程。

**主要特性**：
- 静态类型检查
- 类型推断
- 接口和类型别名
- 泛型编程
- 装饰器（实验性）
- 编译时错误检测

**为什么使用 TypeScript？**

```typescript
// JavaScript - 运行时才发现错误
function add(a, b) {
  return a + b
}
add(1, '2') // "12" - 意外的字符串拼接

// TypeScript - 编译时就能发现错误
function add(a: number, b: number): number {
  return a + b
}
add(1, '2') // ❌ 编译错误：类型 'string' 不能赋值给类型 'number'
```

---

## 📦 基础类型

### 原始类型

```typescript
// 布尔值
let isDone: boolean = false

// 数字
let decimal: number = 6
let hex: number = 0xf00d
let binary: number = 0b1010
let octal: number = 0o744

// 字符串
let color: string = "blue"
let fullName: string = `Bob Bobbington`
let sentence: string = `Hello, my name is ${fullName}`

// 数组
let list: number[] = [1, 2, 3]
let list2: Array<number> = [1, 2, 3]

// 元组
let x: [string, number] = ["hello", 10]

// 枚举
enum Color {
  Red,
  Green,
  Blue
}
let c: Color = Color.Green

// Any - 任意类型（尽量避免使用）
let notSure: any = 4
notSure = "mayb
pescript
// 对象字面量类型
let obj: { name: string; age: number } = {
  name: "John",
  age: 30
}

// 可选属性
let obj2: { name: string; age?: number } = {
  name: "Jane"
}

// 只读属性
let obj3: { readonly name: string } = {
  name: "Bob"
}
// obj3.name = "Alice" // ❌ 错误：只读属性

// 索引签名
let obj4: { [key: string]: number } = {
  age: 30,
  score: 100
}
```

---

## 🔧 高级类型

### 联合类型

```typescript
// 联合类型
type StringOrNumber = string | number

function printId(id: StringOrNumber) {
  console.log("Your ID is: " + id)
}

printId(101) // ✅
printId("202") // ✅

// 字面量类型
type Direction = "north" | "south" | "east" | "west"

function move(direction: Direction) {
  console.log(`Moving ${direction}`)
}

move("north") // ✅
// move("up") // ❌ 错误
```

### 交叉类型

```typescript
interface Colorful {
  color: string
}

interface Circle {
  radius: number
}

// 交叉类型
type ColorfulCircle = Colorful & Circle

const cc: ColorfulCircle = {
  color: "red",
  radius: 42
}
```

### 类型别名 vs 接口

```typescript
// 类型别名
type Point = {
  x: number
  y: number
}

// 接口
interface Point2 {
  x: number
  y: number
}

// 类型别名可以表示联合类型
type ID = string | number

// 接口可以扩展
interface Animal {
  name: string
}

interface Bear extends Animal {
  honey: boolean
}

// 接口可以声明合并
interface Window {
  title: string
}

interface Window {
  ts: string
}

// 结果：Window { title: string; ts: string }
```

### 条件类型

```typescript
// 条件类型
type IsString<T> = T extends string ? true : false

type A = IsString<string> // true
type B = IsString<number> // false

// 实用示例
type NonNullable<T> = T extends null | undefined ? never : T

type C = NonNullable<string | null> // string
type D = NonNullable<number | undefined> // number
```

### 映射类型

```typescript
// 映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}

interface User {
  name: string
  age: number
}

type ReadonlyUser = Readonly<User>
// { readonly name: string; readonly age: number }

type PartialUser = Partial<User>
// { name?: string; age?: number }
```

---

## 🎨 泛型

### 基础泛型

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg
}

let output1 = identity<string>("myString")
let output2 = identity(123) // 类型推断

// 泛型接口
interface GenericIdentityFn<T> {
  (arg: T): T
}

let myIdentity: GenericIdentityFn<number> = identity

// 泛型类
class GenericNumber<T> {
  zeroValue: T
  add: (x: T, y: T) => T
}

let myGenericNumber = new GenericNumber<number>()
myGenericNumber.zeroValue = 0
myGenericNumber.add = function(x, y) {
  return x + y
}
```

### 泛型约束

```typescript
// 泛型约束
interface Lengthwise {
  length: number
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length) // ✅ 现在知道 arg 有 length 属性
  return arg
}

loggingIdentity({ length: 10, value: 3 }) // ✅
// loggingIdentity(3) // ❌ 错误：number 没有 length 属性

// 使用类型参数
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key]
}

let x = { a: 1, b: 2, c: 3, d: 4 }

getProperty(x, "a") // ✅
// getProperty(x, "m") // ❌ 错误：'m' 不是 x 的属性
```

---

## 🛠️ 工具类型

### 内置工具类型

```typescript
interface User {
  id: number
  name: string
  email: string
  age: number
}

// Partial<T> - 所有属性变为可选
type PartialUser = Partial<User>
// { id?: number; name?: string; email?: string; age?: number }

// Required<T> - 所有属性变为必需
type RequiredUser = Required<PartialUser>
// { id: number; name: string; email: string; age: number }

// Readonly<T> - 所有属性变为只读
type ReadonlyUser = Readonly<User>
// { readonly id: number; readonly name: string; ... }

// Pick<T, K> - 选择部分属性
type UserPreview = Pick<User, 'id' | 'name'>
// { id: number; name: string }

// Omit<T, K> - 排除部分属性
type UserWithoutEmail = Omit<User, 'email'>
// { id: number; name: string; age: number }

// Record<K, T> - 构造对象类型
type PageInfo = Record<'home' | 'about' | 'contact', { title: string }>
// { home: { title: string }; about: { title: string }; contact: { title: string } }

// Exclude<T, U> - 从 T 中排除 U
type T0 = Exclude<"a" | "b" | "c", "a"> // "b" | "c"

// Extract<T, U> - 从 T 中提取 U
type T1 = Extract<"a" | "b" | "c", "a" | "f"> // "a"

// NonNullable<T> - 排除 null 和 undefined
type T2 = NonNullable<string | number | undefined> // string | number

// ReturnType<T> - 获取函数返回类型
function f1() {
  return { x: 10, y: 3 }
}
type T3 = ReturnType<typeof f1> // { x: number; y: number }

// Parameters<T> - 获取函数参数类型
function f2(arg: { a: number; b: string }) {}
type T4 = Parameters<typeof f2> // [arg: { a: number; b: string }]

// InstanceType<T> - 获取构造函数实例类型
class C {
  x = 0
  y = 0
}
type T5 = InstanceType<typeof C> // C
```


### 自定义工具类型

```typescript
// DeepPartial - 深层可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

interface Config {
  server: {
    host: string
    port: number
  }
  database: {
    url: string
  }
}

type PartialConfig = DeepPartial<Config>
// {
//   server?: {
//     host?: string
//     port?: number
//   }
//   database?: {
//     url?: string
//   }
// }

// DeepReadonly - 深层只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// Mutable - 移除只读
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

type ReadonlyUser = Readonly<User>
type MutableUser = Mutable<ReadonlyUser>
// { id: number; name: string; email: string; age: number }

// PromiseType - 提取 Promise 类型
type PromiseType<T> = T extends Promise<infer U> ? U : never

async function fetchUser() {
  return { id: 1, name: "John" }
}

type User2 = PromiseType<ReturnType<typeof fetchUser>>
// { id: number; name: string }

// FunctionPropertyNames - 提取函数属性名
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T]

interface Person {
  name: string
  age: number
  greet(): void
  walk(): void
}

type PersonMethods = FunctionPropertyNames<Person>
// "greet" | "walk"
```

---

## 🔍 类型守卫

### typeof 类型守卫

```typescript
// typeof 类型守卫
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    // padding: number
    return Array(padding + 1).join(" ") + value
  }
  if (typeof padding === "string") {
    // padding: string
    return padding + value
  }
  throw new Error(`Expected string or number, got '${typeof padding}'.`)
}

// typeof 支持的类型
// "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
```

### instanceof 类型守卫

```typescript
// instanceof 类型守卫
function logValue(x: Date | string) {
  if (x instanceof Date) {
    // x: Date
    console.log(x.toUTCString())
  } else {
    // x: string
    console.log(x.toUpperCase())
  }
}

// 自定义类
class Bird {
  fly() {
    console.log("Flying...")
  }
}

class Fish {
  swim() {
    console.log("Swimming...")
  }
}

function move(animal: Bird | Fish) {
  if (animal instanceof Bird) {
    animal.fly()
  } else {
    animal.swim()
  }
}
```

### in 操作符类型守卫

```typescript
// in 操作符类型守卫
type Fish2 = { swim: () => void }
type Bird2 = { fly: () => void }

function move2(animal: Fish2 | Bird2) {
  if ("swim" in animal) {
    // animal: Fish2
    animal.swim()
  } else {
    // animal: Bird2
    animal.fly()
  }
}

// 检查可选属性
interface A {
  x: number
}

interface B {
  y: string
}

function doStuff(q: A | B) {
  if ("x" in q) {
    // q: A
    console.log(q.x)
  } else {
    // q: B
    console.log(q.y)
  }
}
```

### 用户自定义类型守卫

```typescript
// 用户自定义类型守卫（类型谓词）
interface Fish3 {
  name: string
  swim: () => void
}

interface Bird3 {
  name: string
  fly: () => void
}

// pet is Fish3 是类型谓词
function isFish(pet: Fish3 | Bird3): pet is Fish3 {
  return (pet as Fish3).swim !== undefined
}

function getSmallPet(): Fish3 | Bird3 {
  return Math.random() > 0.5
    ? { name: "Nemo", swim: () => {} }
    : { name: "Tweety", fly: () => {} }
}

let pet = getSmallPet()

if (isFish(pet)) {
  // pet: Fish3
  pet.swim()
} else {
  // pet: Bird3
  pet.fly()
}

// 在数组过滤中使用
const zoo: (Fish3 | Bird3)[] = [getSmallPet(), getSmallPet(), getSmallPet()]
const underWater: Fish3[] = zoo.filter(isFish)

// 复杂的类型守卫
const underWater2: Fish3[] = zoo.filter((pet): pet is Fish3 => {
  if (pet.name === "sharkey") return false
  return isFish(pet)
})
```

### 可辨识联合

```typescript
// 可辨识联合（Discriminated Unions）
interface Circle {
  kind: "circle" // 字面量类型作为判别属性
  radius: number
}

interface Square {
  kind: "square"
  sideLength: number
}

interface Triangle {
  kind: "triangle"
  base: number
  height: number
}

type Shape = Circle | Square | Triangle

// TypeScript 会根据 kind 自动收窄类型
function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // shape: Circle
      return Math.PI * shape.radius ** 2
    case "square":
      // shape: Square
      return shape.sideLength ** 2
    case "triangle":
      // shape: Triangle
      return (shape.base * shape.height) / 2
    default:
      // 穷尽性检查
      const _exhaustiveCheck: never = shape
      return _exhaustiveCheck
  }
}

// 使用示例
const circle: Circle = { kind: "circle", radius: 10 }
const square: Square = { kind: "square", sideLength: 5 }
console.log(getArea(circle)) // 314.159...
console.log(getArea(square)) // 25
```

### 真值收窄

```typescript
// 真值收窄
function printAll(strs: string | string[] | null) {
  // 检查 null/undefined
  if (strs) {
    if (typeof strs === "object") {
      // strs: string[]
      for (const s of strs) {
        console.log(s)
      }
    } else {
      // strs: string
      console.log(strs)
    }
  }
}

// 使用 Boolean 过滤
function multiplyAll(values: number[] | undefined, factor: number): number[] | undefined {
  if (!values) {
    return values
  } else {
    // values: number[]
    return values.map(x => x * factor)
  }
}

// 过滤假值
const arr = [0, 1, "", "hello", null, undefined, false, true]
const filtered = arr.filter(Boolean) // (string | number | boolean)[]
```

### 等值收窄

```typescript
// 等值收窄
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // x 和 y 都是 string
    x.toUpperCase()
    y.toLowerCase()
  } else {
    // x: string | number
    // y: string | boolean
    console.log(x)
    console.log(y)
  }
}

// 检查 null/undefined
function printAll2(strs: string | string[] | null) {
  if (strs !== null) {
    if (typeof strs === "object") {
      // strs: string[]
      for (const s of strs) {
        console.log(s)
      }
    } else {
      // strs: string
      console.log(strs)
    }
  }
}
```

### 控制流分析

```typescript
// 控制流分析
function example2() {
  let x: string | number | boolean

  x = Math.random() < 0.5

  // x: boolean
  console.log(x)

  if (Math.random() < 0.5) {
    x = "hello"
    // x: string
    console.log(x)
  } else {
    x = 100
    // x: number
    console.log(x)
  }

  // x: string | number
  return x
}

// 类型断言（谨慎使用）
function handler(event: Event) {
  const mouseEvent = event as MouseEvent
  console.log(mouseEvent.clientX)
}

// 非空断言（!）
function liveDangerously(x?: number | null) {
  // 告诉 TypeScript x 不是 null/undefined
  console.log(x!.toFixed())
}
```

---

## ⚙️ 配置选项

### tsconfig.json 基础结构

```json
{
  "compilerOptions": {
    /* 语言和环境 */
    "target": "ES2020",                    // 编译目标
    "lib": ["ES2020", "DOM"],              // 包含的库文件
    "jsx": "react-jsx",                    // JSX 支持
    "experimentalDecorators": true,        // 装饰器支持
    "emitDecoratorMetadata": true,         // 装饰器元数据

    /* 模块 */
    "module": "ESNext",                    // 模块系统
    "moduleResolution": "bundler",         // 模块解析策略
    "baseUrl": "./",                       // 基础路径
    "paths": {                             // 路径映射
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    },
    "resolveJsonModule": true,             // 导入 JSON
    "allowImportingTsExtensions": true,    // 允许 .ts 扩展名

    /* 输出 */
    "outDir": "./dist",                    // 输出目录
    "rootDir": "./src",                    // 根目录
    "declaration": true,                   // 生成 .d.ts
    "declarationMap": true,                // 生成 .d.ts.map
    "sourceMap": true,                     // 生成 source map
    "removeComments": true,                // 移除注释
    "noEmit": true,                        // 不输出文件（仅类型检查）

    /* 类型检查 */
    "strict": true,                        // 启用所有严格检查
    "noImplicitAny": true,                 // 禁止隐式 any
    "strictNullChecks": true,              // 严格空值检查
    "strictFunctionTypes": true,           // 严格函数类型
    "strictBindCallApply": true,           // 严格 bind/call/apply
    "strictPropertyInitialization": true,  // 严格属性初始化
    "noImplicitThis": true,                // 禁止隐式 this
    "alwaysStrict": true,                  // 始终使用严格模式

    /* 额外检查 */
    "noUnusedLocals": true,                // 检查未使用的局部变量
    "noUnusedParameters": true,            // 检查未使用的参数
    "noImplicitReturns": true,             // 检查隐式返回
    "noFallthroughCasesInSwitch": true,    // 检查 switch 穿透
    "noUncheckedIndexedAccess": true,      // 索引访问检查
    "exactOptionalPropertyTypes": true,    // 精确可选属性

    /* 互操作性 */
    "esModuleInterop": true,               // ES 模块互操作
    "allowSyntheticDefaultImports": true,  // 允许合成默认导入
    "forceConsistentCasingInFileNames": true, // 强制文件名大小写一致
    "isolatedModules": true,               // 隔离模块
    "verbatimModuleSyntax": true,          // 保留模块语法

    /* 其他 */
    "skipLibCheck": true,                  // 跳过库文件检查
    "incremental": true,                   // 增量编译
    "tsBuildInfoFile": "./.tsbuildinfo"    // 增量编译信息文件
  },
  "include": ["src/**/*"],                 // 包含的文件
  "exclude": ["node_modules", "dist"]      // 排除的文件
}
```

### 常用配置场景

```json
// 1. Node.js 项目配置
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}

// 2. React 项目配置
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}

// 3. 库项目配置
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 严格模式选项详解

```typescript
// 1. noImplicitAny - 禁止隐式 any
// ❌ 错误
function add(a, b) {
  return a + b
}

// ✅ 正确
function add(a: number, b: number): number {
  return a + b
}

// 2. strictNullChecks - 严格空值检查
// ❌ 错误
let name: string = null // 类型 'null' 不能赋值给类型 'string'

// ✅ 正确
let name: string | null = null

function getLength(s: string | null): number {
  // ❌ 错误：对象可能为 null
  // return s.length

  // ✅ 正确：先检查
  if (s === null) {
    return 0
  }
  return s.length
}

// 3. strictFunctionTypes - 严格函数类型
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string
}

// ❌ 在严格模式下错误
let f1: (x: Animal) => void
let f2: (x: Dog) => void
// f1 = f2 // 错误：Dog 不能赋值给 Animal

// 4. strictPropertyInitialization - 严格属性初始化
class User {
  // ❌ 错误：属性未初始化
  // name: string

  // ✅ 正确方式 1：在构造函数中初始化
  name: string
  constructor(name: string) {
    this.name = name
  }

  // ✅ 正确方式 2：提供默认值
  age: number = 0

  // ✅ 正确方式 3：使用 ! 断言（确定会被初始化）
  email!: string
}

// 5. noImplicitThis - 禁止隐式 this
interface User2 {
  name: string
  greet(): void
}

// ❌ 错误
const user: User2 = {
  name: "John",
  greet() {
    // 'this' 隐式具有类型 'any'
    setTimeout(function() {
      console.log(this.name)
    }, 1000)
  }
}

// ✅ 正确：使用箭头函数
const user2: User2 = {
  name: "John",
  greet() {
    setTimeout(() => {
      console.log(this.name)
    }, 1000)
  }
}

// 6. noUnusedLocals - 检查未使用的局部变量
function example() {
  const x = 10 // ❌ 错误：'x' 已声明但从未使用
  const y = 20
  return y
}

// 7. noUnusedParameters - 检查未使用的参数
function greet(name: string, age: number) {
  // ❌ 错误：'age' 已声明但从未使用
  return `Hello, ${name}`
}

// ✅ 正确：使用下划线前缀表示有意忽略
function greet2(name: string, _age: number) {
  return `Hello, ${name}`
}

// 8. noImplicitReturns - 检查隐式返回
function getValue(x: number): string {
  if (x > 0) {
    return "positive"
  }
  // ❌ 错误：并非所有代码路径都返回值
}

// ✅ 正确
function getValue2(x: number): string {
  if (x > 0) {
    return "positive"
  }
  return "non-positive"
}
```

---

## 💡 最佳实践

### 1. 类型优先原则

```typescript
// ❌ 避免：过度使用 any
function processData(data: any) {
  return data.map((item: any) => item.value)
}

// ✅ 推荐：明确类型
interface DataItem {
  id: number
  value: string
}

function processData(data: DataItem[]): string[] {
  return data.map(item => item.value)
}

// ❌ 避免：类型断言滥用
const value = getValue() as string

// ✅ 推荐：类型守卫
const value = getValue()
if (typeof value === "string") {
  // 安全使用 value
}
```

### 2. 使用 unknown 代替 any

```typescript
// ❌ 避免
function processValue(value: any) {
  return value.toUpperCase() // 运行时可能出错
}

// ✅ 推荐
function processValue(value: unknown): string {
  if (typeof value === "string") {
    return value.toUpperCase()
  }
  throw new Error("Value must be a string")
}
```

### 3. 优先使用接口而非类型别名（对象类型）

```typescript
// ✅ 推荐：接口（可扩展）
interface User {
  id: number
  name: string
}

interface Admin extends User {
  role: string
}

// ✅ 适用场景：类型别名（联合类型、工具类型）
type ID = string | number
type Nullable<T> = T | null
```

### 4. 使用 const 断言

```typescript
// ❌ 类型推断为 string[]
const colors = ["red", "green", "blue"]

// ✅ 类型推断为 readonly ["red", "green", "blue"]
const colors = ["red", "green", "blue"] as const

// ✅ 对象字面量
const config = {
  api: "https://api.example.com",
  timeout: 5000
} as const
// 类型：{ readonly api: "https://api.example.com"; readonly timeout: 5000 }
```

### 5. 避免类型重复

```typescript
// ❌ 避免：重复定义
interface User {
  id: number
  name: string
  email: string
}

interface UserUpdate {
  id: number
  name: string
  email: string
}

// ✅ 推荐：使用工具类型
interface User {
  id: number
  name: string
  email: string
}

type UserUpdate = Partial<User> & { id: number }

// ✅ 推荐：提取公共类型
interface BaseUser {
  id: number
  name: string
}

interface User extends BaseUser {
  email: string
  createdAt: Date
}

interface UserPreview extends BaseUser {
  avatar: string
}
```

### 6. 使用泛型提高复用性

```typescript
// ❌ 避免：为每种类型写一个函数
function getFirstString(arr: string[]): string | undefined {
  return arr[0]
}

function getFirstNumber(arr: number[]): number | undefined {
  return arr[0]
}

// ✅ 推荐：使用泛型
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0]
}

const firstString = getFirst(["a", "b", "c"]) // string | undefined
const firstNumber = getFirst([1, 2, 3]) // number | undefined
```

### 7. 正确处理异步类型

```typescript
// ✅ 推荐：明确 Promise 类型
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

// ✅ 推荐：错误处理
async function fetchUserSafe(id: number): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`)
    if (!response.ok) {
      return null
    }
    return response.json()
  } catch (error) {
    console.error("Failed to fetch user:", error)
    return null
  }
}

// ✅ 推荐：使用 Result 类型
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

async function fetchUserResult(id: number): Promise<Result<User>> {
  try {
    const response = await fetch(`/api/users/${id}`)
    if (!response.ok) {
      return { success: false, error: new Error("Failed to fetch") }
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}
```

### 8. 使用枚举的最佳实践

```typescript
// ❌ 避免：数字枚举（不够类型安全）
enum Status {
  Pending,
  Active,
  Inactive
}

// ✅ 推荐：字符串枚举
enum Status {
  Pending = "PENDING",
  Active = "ACTIVE",
  Inactive = "INACTIVE"
}

// ✅ 更推荐：const 对象 + as const
const Status = {
  Pending: "PENDING",
  Active: "ACTIVE",
  Inactive: "INACTIVE"
} as const

type Status = typeof Status[keyof typeof Status]
// "PENDING" | "ACTIVE" | "INACTIVE"
```

### 9. 类型安全的环境变量

```typescript
// ✅ 推荐：定义环境变量类型
interface Env {
  NODE_ENV: "development" | "production" | "test"
  API_URL: string
  API_KEY: string
}

// 类型安全的访问
declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

// 使用
const apiUrl: string = process.env.API_URL
const nodeEnv: "development" | "production" | "test" = process.env.NODE_ENV
```

### 10. 性能优化建议

```typescript
// 1. 使用 skipLibCheck 跳过库文件检查
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}

// 2. 使用增量编译
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}

// 3. 使用项目引用（大型项目）
// tsconfig.json
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/utils" }
  ]
}

// 4. 避免过度复杂的类型
// ❌ 避免：过度嵌套的条件类型
type ComplexType<T> = T extends A
  ? T extends B
    ? T extends C
      ? D
      : E
    : F
  : G

// ✅ 推荐：拆分为多个简单类型
type IsA<T> = T extends A ? true : false
type IsB<T> = T extends B ? true : false
type SimpleType<T> = IsA<T> extends true
  ? IsB<T> extends true
    ? D
    : E
  : F
```

### 11. 文档注释

```typescript
/**
 * 计算两个数的和
 * @param a - 第一个数字
 * @param b - 第二个数字
 * @returns 两数之和
 * @example
 * ```ts
 * add(1, 2) // 3
 * ```
 */
function add(a: number, b: number): number {
  return a + b
}

/**
 * 用户接口
 * @interface User
 */
interface User {
  /** 用户 ID */
  id: number
  /** 用户名 */
  name: string
  /** 邮箱地址 */
  email: string
  /** 创建时间 */
  createdAt: Date
}
```

### 12. 错误处理模式

```typescript
// ✅ 推荐：使用自定义错误类
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message)
    this.name = "ValidationError"
  }
}

function validateEmail(email: string): void {
  if (!email.includes("@")) {
    throw new ValidationError("Invalid email format", "email")
  }
}

// ✅ 推荐：类型安全的错误处理
function handleError(error: unknown): string {
  if (error instanceof ValidationError) {
    return `Validation failed for ${error.field}: ${error.message}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return "An unknown error occurred"
}
```

---

## 📚 参考资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [TypeScript 中文网](https://www.tslang.cn/)

---

**最后更新**: 2025-02
