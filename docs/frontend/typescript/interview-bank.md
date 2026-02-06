# TypeScript 面试题库

> 精选 TypeScript 核心面试题，涵盖类型系统、泛型、工具类型等关键知识点

**更新时间**: 2025-02

## 📋 目录

- [基础概念](#基础概念)
- [类型系统](#类型系统)
- [泛型编程](#泛型编程)
- [高级类型](#高级类型)
- [工具类型](#工具类型)
- [类型守卫](#类型守卫)
- [配置与工程化](#配置与工程化)
- [实战场景](#实战场景)

---

## 🎯 基础概念

### 1. TypeScript 是什么？它解决了什么问题？

**核心答案**：

TypeScript 是 JavaScript 的超集，添加了静态类型系统和编译时类型检查。

**解决的问题**：
- 运行时错误提前到编译时发现
- 提供更好的 IDE 智能提示和重构支持
- 增强代码可维护性和可读性
- 支持大型项目的协作开发

**代码示例**：

```typescript
// JavaScript - 运行时才发现错误
function calculateTotal(price, quantity) {
  return price * quantity
}
calculateTotal(100, "5") // 返回 "100100100100100"（字符串重复）

// TypeScript - 编译时就能发现错误
function calculateTotal(price: number, quantity: number): number {
  return price * quantity
}
calculateTotal(100, "5") // ❌ 编译错误：类型 'string' 不能赋值给类型 'number'
```

**追问点**：
- TypeScript 的类型擦除机制
- 与 Flow、JSDoc 的区别
- 编译后的 JavaScript 代码

---

### 2. interface 和 type 的区别是什么？

**核心答案**：

两者都可以定义对象类型，但有以下区别：

**interface 特点**：
- 可以声明合并（同名接口自动合并）
- 只能描述对象类型
- 支持 extends 继承
- 更适合定义公共 API

**type 特点**：
- 更通用，可以定义联合类型、交叉类型、元组等
- 不支持声明合并
- 使用 & 实现交叉类型
- 更适合复杂类型组合

**代码示例**：

```typescript
// interface - 声明合并
interface User {
  name: string
}

interface User {
  age: number
}

// 自动合并为：{ name: string; age: number }
const user: User = { name: "John", age: 30 }

// type - 联合类型
type ID = string | number
type Status = "pending" | "active" | "inactive"

// type - 交叉类型
type Person = { name: string }
type Employee = { employeeId: number }
type Staff = Person & Employee

const staff: Staff = {
  name: "Alice",
  employeeId: 123
}

// interface - 继承
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string
}
```

**追问点**：
- 什么时候必须用 type？（联合类型、映射类型）
- 什么时候推荐用 interface？（库的公共 API）
- 性能差异（几乎没有）

---

### 3. any、unknown、never 的区别？

**核心答案**：

**any**：
- 绕过所有类型检查
- 可以赋值给任何类型
- 任何类型都可以赋值给 any
- 应尽量避免使用

**unknown**：
- 类型安全的 any
- 可以赋值给 unknown
- 使用前必须进行类型检查
- 推荐替代 any

**never**：
- 表示永远不会发生的类型
- 用于函数永不返回（抛出异常、死循环）
- 用于穷尽性检查

**代码示例**：

```typescript
// any - 不安全
let value1: any = "hello"
value1 = 123
value1.toUpperCase() // 运行时可能出错

// unknown - 安全
let value2: unknown = "hello"
// value2.toUpperCase() // ❌ 编译错误

// 必须先检查类型
if (typeof value2 === "string") {
  value2.toUpperCase() // ✅ 正确
}

// never - 永不返回
function throwError(message: string): never {
  throw new Error(message)
}

function infiniteLoop(): never {
  while (true) {}
}

// never - 穷尽性检查
type Shape = "circle" | "square" | "triangle"

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle":
      return Math.PI * 10 * 10
    case "square":
      return 10 * 10
    case "triangle":
      return (10 * 10) / 2
    default:
      // 如果添加新的 shape 类型但忘记处理，这里会报错
      const _exhaustiveCheck: never = shape
      return _exhaustiveCheck
  }
}
```

**追问点**：
- void 和 never 的区别
- unknown 如何进行类型收窄
- never 在联合类型中的行为（被移除）

---

## 🔧 类型系统

### 4. TypeScript 的类型推断机制是什么？

**核心答案**：

TypeScript 可以根据上下文自动推断变量的类型，无需显式声明。

**推断场景**：
- 变量初始化
- 函数返回值
- 默认参数
- 解构赋值
- 泛型参数

**代码示例**：

```typescript
// 1. 变量初始化推断
let x = 3 // 推断为 number
let y = "hello" // 推断为 string
let z = [1, 2, 3] // 推断为 number[]

// 2. 函数返回值推断
function add(a: number, b: number) {
  return a + b // 推断返回类型为 number
}

// 3. 最佳通用类型推断
let arr = [1, 2, null] // 推断为 (number | null)[]

// 4. 上下文类型推断
window.onmousedown = function(mouseEvent) {
  // mouseEvent 自动推断为 MouseEvent
  console.log(mouseEvent.button)
}

// 5. 泛型推断
function identity<T>(arg: T): T {
  return arg
}

let output = identity("hello") // T 推断为 string

// 6. 字面量类型推断
let status = "pending" // 推断为 string
const status2 = "pending" // 推断为 "pending"（字面量类型）

// 使用 as const 获得更精确的推断
const config = {
  api: "https://api.example.com",
  timeout: 5000
} as const
// 推断为：{ readonly api: "https://api.example.com"; readonly timeout: 5000 }
```

**追问点**：
- 何时需要显式类型注解
- const 和 let 的推断差异
- as const 的作用

---

### 5. 联合类型和交叉类型的区别？

**核心答案**：

**联合类型（Union Types）**：
- 使用 `|` 连接
- 表示"或"的关系
- 值可以是其中任意一种类型

**交叉类型（Intersection Types）**：
- 使用 `&` 连接
- 表示"且"的关系
- 值必须同时满足所有类型

**代码示例**：

```typescript
// 联合类型
type StringOrNumber = string | number

let value: StringOrNumber
value = "hello" // ✅
value = 123 // ✅
// value = true // ❌ 错误

// 联合类型 - 只能访问共同属性
interface Bird {
  fly(): void
  layEggs(): void
}

interface Fish {
  swim(): void
  layEggs(): void
}

function getSmallPet(): Bird | Fish {
  return Math.random() > 0.5
    ? { fly: () => {}, layEggs: () => {} }
    : { swim: () => {}, layEggs: () => {} }
}

let pet = getSmallPet()
pet.layEggs() // ✅ 共同属性
// pet.fly() // ❌ 错误：Fish 没有 fly 方法

// 交叉类型
interface Colorful {
  color: string
}

interface Circle {
  radius: number
}

type ColorfulCircle = Colorful & Circle

const cc: ColorfulCircle = {
  color: "red",
  radius: 42 // 必须同时有 color 和 radius
}

// 交叉类型 - 合并对象类型
type Person = {
  name: string
  age: number
}

type Employee = {
  employeeId: number
  department: string
}

type Staff = Person & Employee

const staff: Staff = {
  name: "Alice",
  age: 30,
  employeeId: 123,
  department: "Engineering"
}

// 交叉类型 - 冲突处理
type A = { x: number }
type B = { x: string }
type C = A & B // x: never（number & string = never）
```

**追问点**：
- 联合类型如何进行类型收窄
- 交叉类型的属性冲突如何处理
- 何时使用联合类型，何时使用交叉类型

---

## 🎨 泛型编程

### 6. 什么是泛型？为什么需要泛型？

**核心答案**：

泛型允许在定义函数、接口或类时不预先指定具体类型，而是在使用时再指定类型。

**优势**：
- 代码复用：一份代码支持多种类型
- 类型安全：保持类型检查
- 避免类型断言和 any

**代码示例**：

```typescript
// ❌ 没有泛型 - 需要为每种类型写一个函数
function identityString(arg: string): string {
  return arg
}

function identityNumber(arg: number): number {
  return arg
}

// ❌ 使用 any - 失去类型安全
function identity(arg: any): any {
  return arg
}

// ✅ 使用泛型 - 既复用又类型安全
function identity<T>(arg: T): T {
  return arg
}

let output1 = identity<string>("hello") // 显式指定
let output2 = identity(123) // 类型推断为 number

// 泛型数组
function loggingIdentity<T>(arg: T[]): T[] {
  console.log(arg.length) // 数组有 length 属性
  return arg
}

// 泛型接口
interface GenericIdentityFn<T> {
  (arg: T): T
}

let myIdentity: GenericIdentityFn<number> = identity

// 泛型类
class GenericNumber<T> {
  zeroValue: T
  add: (x: T, y: T) => T

  constructor(zeroValue: T, addFn: (x: T, y: T) => T) {
    this.zeroValue = zeroValue
    this.add = addFn
  }
}

let myGenericNumber = new GenericNumber<number>(0, (x, y) => x + y)
console.log(myGenericNumber.add(5, 10)) // 15

let stringNumeric = new GenericNumber<string>("", (x, y) => x + y)
console.log(stringNumeric.add("Hello ", "World")) // "Hello World"
```

**追问点**：
- 泛型约束（extends）
- 多个泛型参数
- 泛型默认值

---

### 7. 泛型约束是什么？如何使用？

**核心答案**：

泛型约束使用 `extends` 关键字限制泛型参数必须满足某些条件。

**代码示例**：

```typescript
// 1. 基础约束 - 确保有 length 属性
interface Lengthwise {
  length: number
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length) // ✅ 现在知道 arg 有 length 属性
  return arg
}

loggingIdentity({ length: 10, value: 3 }) // ✅
loggingIdentity("hello") // ✅ string 有 length
loggingIdentity([1, 2, 3]) // ✅ array 有 length
// loggingIdentity(3) // ❌ 错误：number 没有 length

// 2. 使用类型参数约束另一个类型参数
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

let x = { a: 1, b: 2, c: 3, d: 4 }

getProperty(x, "a") // ✅ 返回 number
// getProperty(x, "m") // ❌ 错误：'m' 不是 x 的属性

// 3. 构造函数约束
function create<T>(c: new () => T): T {
  return new c()
}

class BeeKeeper {
  hasMask: boolean = true
}

class ZooKeeper {
  nametag: string = "Mikle"
}

let keeper1 = create(BeeKeeper) // BeeKeeper
let keeper2 = create(ZooKeeper) // ZooKeeper

// 4. 多重约束
interface HasId {
  id: number
}

interface HasName {
  name: string
}

function process<T extends HasId & HasName>(item: T): void {
  console.log(`Processing ${item.name} with ID ${item.id}`)
}

process({ id: 1, name: "Item 1" }) // ✅
// process({ id: 1 }) // ❌ 错误：缺少 name

// 5. 条件约束
type NonNullable<T> = T extends null | undefined ? never : T

type A = NonNullable<string | null> // string
type B = NonNullable<number | undefined> // number
```

**追问点**：
- keyof 操作符的作用
- 泛型约束与类型守卫的区别
- 条件类型的应用场景

---

## 🚀 高级类型

### 8. 映射类型是什么？如何使用？

**核心答案**：

映射类型可以从旧类型创建新类型，通过遍历旧类型的属性来生成新类型。

**代码示例**：

```typescript
// 1. 基础映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}

interface User {
  id: number
  name: string
  email: string
}

type ReadonlyUser = Readonly<User>
// { readonly id: number; readonly name: string; readonly email: string }

type PartialUser = Partial<User>
// { id?: number; name?: string; email?: string }

// 2. 添加/移除修饰符
type Mutable<T> = {
  -readonly [P in keyof T]: T[P] // 移除 readonly
}

type Required<T> = {
  [P in keyof T]-?: T[P] // 移除可选
}

// 3. 键名重映射
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
}

interface Person {
  name: string
  age: number
}

type PersonGetters = Getters<Person>
// {
//   getName: () => string
//   getAge: () => number
// }

// 4. 条件映射
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P]
}

interface Mixed {
  id: number
  name: string
  age: number
  active: boolean
}

type StringProps = PickByType<Mixed, string>
// { name: string }

type NumberProps = PickByType<Mixed, number>
// { id: number; age: number }

// 5. 深度映射
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
    pool: {
      min: number
      max: number
    }
  }
}

type PartialConfig = DeepPartial<Config>
// 所有嵌套属性都变为可选
```

**追问点**：
- keyof 和 in 的作用
- 如何实现 DeepReadonly
- 映射类型的性能考虑

---

### 9. 条件类型是什么？有哪些应用场景？

**核心答案**：

条件类型根据类型关系选择不同的类型，语法类似三元表达式：`T extends U ? X : Y`

**代码示例**：

```typescript
// 1. 基础条件类型
type IsString<T> = T extends string ? true : false

type A = IsString<string> // true
type B = IsString<number> // false

// 2. 提取类型
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object"

type T0 = TypeName<string> // "string"
type T1 = TypeName<"a"> // "string"
type T2 = TypeName<() => void> // "function"

// 3. 分布式条件类型
type ToArray<T> = T extends any ? T[] : never

type StrArrOrNumArr = ToArray<string | number>
// string[] | number[]（分布式应用）

// 4. infer 关键字 - 提取类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

function f1() {
  return { x: 10, y: 3 }
}

type T3 = ReturnType<typeof f1> // { x: number; y: number }

// 提取 Promise 类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

type T4 = UnwrapPromise<Promise<string>> // string
type T5 = UnwrapPromise<number> // number

// 提取数组元素类型
type ElementType<T> = T extends (infer U)[] ? U : T

type T6 = ElementType<string[]> // string
type T7 = ElementType<number> // number

// 5. 递归条件类型
type Flatten<T> = T extends any[]
  ? T[number] extends any[]
    ? Flatten<T[number]>
    : T[number]
  : T

type T8 = Flatten<number[]> // number
type T9 = Flatten<number[][]> // number
type T10 = Flatten<number[][][]> // number

// 6. 实用工具类型
type NonNullable<T> = T extends null | undefined ? never : T

type T11 = NonNullable<string | null | undefined> // string

type Exclude<T, U> = T extends U ? never : T

type T12 = Exclude<"a" | "b" | "c", "a"> // "b" | "c"

type Extract<T, U> = T extends U ? T : never

type T13 = Extract<"a" | "b" | "c", "a" | "f"> // "a"
```

**追问点**：
- infer 的工作原理
- 分布式条件类型的触发条件
- 如何避免条件类型的循环引用

---

## 🛠️ 工具类型

### 10. 常用的内置工具类型有哪些？如何实现？

**核心答案**：

TypeScript 提供了多个内置工具类型来简化常见的类型转换操作。

**代码示例**：

```typescript
interface User {
  id: number
  name: string
  email: string
  age: number
}

// 1. Partial<T> - 所有属性变为可选
type PartialUser = Partial<User>
// { id?: number; name?: string; email?: string; age?: number }

// 实现
type MyPartial<T> = {
  [P in keyof T]?: T[P]
}

// 2. Required<T> - 所有属性变为必需
type RequiredUser = Required<Partial<User>>
// { id: number; name: string; email: string; age: number }

// 实现
type MyRequired<T> = {
  [P in keyof T]-?: T[P]
}

// 3. Readonly<T> - 所有属性变为只读
type ReadonlyUser = Readonly<User>
// { readonly id: number; readonly name: string; ... }

// 实现
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P]
}

// 4. Pick<T, K> - 选择部分属性
type UserPreview = Pick<User, 'id' | 'name'>
// { id: number; name: string }

// 实现
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

// 5. Omit<T, K> - 排除部分属性
type UserWithoutEmail = Omit<User, 'email'>
// { id: number; name: string; age: number }

// 实现
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>

// 6. Record<K, T> - 构造对象类型
type PageInfo = Record<'home' | 'about' | 'contact', { title: string; url: string }>
// {
//   home: { title: string; url: string }
//   about: { title: string; url: string }
//   contact: { title: string; url: string }
// }

// 实现
type MyRecord<K extends keyof any, T> = {
  [P in K]: T
}

// 7. Exclude<T, U> - 从 T 中排除 U
type T0 = Exclude<"a" | "b" | "c", "a"> // "b" | "c"
type T1 = Exclude<string | number | (() => void), Function> // string | number

// 实现
type MyExclude<T, U> = T extends U ? never : T

// 8. Extract<T, U> - 从 T 中提取 U
type T2 = Extract<"a" | "b" | "c", "a" | "f"> // "a"
type T3 = Extract<string | number | (() => void), Function> // () => void

// 实现
type MyExtract<T, U> = T extends U ? T : never

// 9. NonNullable<T> - 排除 null 和 undefined
type T4 = NonNullable<string | number | undefined> // string | number
type T5 = NonNullable<string | null> // string

// 实现
type MyNonNullable<T> = T extends null | undefined ? never : T

// 10. ReturnType<T> - 获取函数返回类型
function f1() {
  return { x: 10, y: 3 }
}

type T6 = ReturnType<typeof f1> // { x: number; y: number }

// 实现
type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any

// 11. Parameters<T> - 获取函数参数类型
function f2(arg: { a: number; b: string }) {
  return arg
}

type T7 = Parameters<typeof f2> // [arg: { a: number; b: string }]

// 实现
type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never

// 12. InstanceType<T> - 获取构造函数实例类型
class C {
  x = 0
  y = 0
}

type T8 = InstanceType<typeof C> // C

// 实现
type MyInstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : any

// 13. Awaited<T> - 提取 Promise 类型
type T9 = Awaited<Promise<string>> // string
type T10 = Awaited<Promise<Promise<number>>> // number

// 实现
type MyAwaited<T> =
  T extends null | undefined ? T :
  T extends object & { then(onfulfilled: infer F): any } ?
    F extends ((value: infer V, ...args: any) => any) ?
      MyAwaited<V> :
      never :
  T
```

**追问点**：
- 如何实现 DeepPartial、DeepReadonly
- Omit 为什么不直接用 Exclude
- 工具类型的组合使用

---

## 🔍 类型守卫

### 11. 什么是类型守卫？有哪些实现方式？

**核心答案**：

类型守卫是一种在运行时检查类型的机制，帮助 TypeScript 在特定代码块中收窄类型。

**实现方式**：
1. typeof 类型守卫
2. instanceof 类型守卫
3. in 操作符类型守卫
4. 用户自定义类型守卫（类型谓词）
5. 可辨识联合

**代码示例**：

```typescript
// 1. typeof 类型守卫
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

// 2. instanceof 类型守卫
class Bird {
  fly() {
    console.log("Flying...")
  }
  layEggs() {
    console.log("Laying eggs...")
  }
}

class Fish {
  swim() {
    console.log("Swimming...")
  }
  layEggs() {
    console.log("Laying eggs...")
  }
}

function move(animal: Bird | Fish) {
  if (animal instanceof Bird) {
    // animal: Bird
    animal.fly()
  } else {
    // animal: Fish
    animal.swim()
  }
}

// 3. in 操作符类型守卫
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

// 4. 用户自定义类型守卫（类型谓词）
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

// 5. 可辨识联合（Discriminated Unions）
interface Circle {
  kind: "circle" // 判别属性
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

// 6. 真值收窄
function printAll(strs: string | string[] | null) {
  if (strs && typeof strs === "object") {
    // strs: string[]
    for (const s of strs) {
      console.log(s)
    }
  } else if (typeof strs === "string") {
    // strs: string
    console.log(strs)
  }
}

// 7. 等值收窄
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

// 8. 控制流分析
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
```

**追问点**：
- 类型谓词的返回值类型
- 可辨识联合的最佳实践
- 如何实现自定义的类型守卫函数

---

## ⚙️ 配置与工程化

### 12. tsconfig.json 中的 strict 模式包含哪些选项？

**核心答案**：

`strict: true` 会启用所有严格类型检查选项，包括：

**代码示例**：

```typescript
// 1. noImplicitAny - 禁止隐式 any
// ❌ 错误
function add(a, b) { // 参数隐式具有 'any' 类型
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
  if (s === null) {
    return 0
  }
  return s.length
}

// 3. strictFunctionTypes - 严格函数类型检查
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string
}

let f1: (x: Animal) => void
let f2: (x: Dog) => void

// ❌ 在严格模式下错误
// f1 = f2 // 错误：参数类型不兼容

// 4. strictBindCallApply - 严格的 bind/call/apply 检查
function fn(x: string) {
  return parseInt(x)
}

// ✅ 正确
const n1 = fn.call(undefined, "10")

// ❌ 错误
// const n2 = fn.call(undefined, false) // 类型 'boolean' 不能赋值给类型 'string'

// 5. strictPropertyInitialization - 严格属性初始化
class User {
  // ❌ 错误：属性未初始化
  // name: string

  // ✅ 正确方式
  name: string
  age: number = 0 // 提供默认值
  email!: string // 使用断言（确定会被初始化）

  constructor(name: string) {
    this.name = name
  }
}

// 6. noImplicitThis - 禁止隐式 this
interface User2 {
  name: string
  greet(): void
}

const user: User2 = {
  name: "John",
  greet() {
    // ✅ 使用箭头函数
    setTimeout(() => {
      console.log(this.name)
    }, 1000)

    // ❌ 错误：'this' 隐式具有类型 'any'
    // setTimeout(function() {
    //   console.log(this.name)
    // }, 1000)
  }
}

// 7. alwaysStrict - 始终使用严格模式
// 编译后的 JS 文件会自动添加 "use strict"

// 8. noUnusedLocals - 检查未使用的局部变量
function example() {
  // const x = 10 // ❌ 错误：'x' 已声明但从未使用
  const y = 20
  return y
}

// 9. noUnusedParameters - 检查未使用的参数
// ❌ 错误
function greet(name: string, age: number) {
  // 'age' 已声明但从未使用
  return `Hello, ${name}`
}

// ✅ 正确：使用下划线前缀
function greet2(name: string, _age: number) {
  return `Hello, ${name}`
}

// 10. noImplicitReturns - 检查隐式返回
// ❌ 错误
function getValue(x: number): string {
  if (x > 0) {
    return "positive"
  }
  // 并非所有代码路径都返回值
}

// ✅ 正确
function getValue2(x: number): string {
  if (x > 0) {
    return "positive"
  }
  return "non-positive"
}
```

**追问点**：
- 如何逐步启用严格模式
- 哪些选项对性能有影响
- 如何处理第三方库的类型问题

---

### 13. 如何配置路径别名（Path Mapping）？

**核心答案**：

路径别名需要在 tsconfig.json 中配置 `baseUrl` 和 `paths`，同时需要配置构建工具。

**代码示例**：

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

```typescript
// 使用路径别名
import { Button } from "@components/Button"
import { formatDate } from "@utils/date"
import type { User } from "@types/user"

// 而不是
// import { Button } from "../../components/Button"
// import { formatDate } from "../../../utils/date"
```

```javascript
// vite.config.ts - Vite 配置
import { defineConfig } from "vite"
import path from "path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types")
    }
  }
})

// webpack.config.js - Webpack 配置
module.exports = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@types": path.resolve(__dirname, "src/types")
    }
  }
}
```

**追问点**：
- 为什么需要同时配置 TypeScript 和构建工具
- 如何处理 Jest 等测试工具的路径别名
- 路径别名对打包体积的影响

---

## 💼 实战场景

### 14. 如何为第三方库添加类型声明？

**核心答案**：

当第三方库没有类型声明时，可以通过以下方式添加：

**代码示例**：

```typescript
// 1. 创建 .d.ts 文件（推荐）
// src/types/my-library.d.ts
declare module "my-library" {
  export function doSomething(value: string): number
  export class MyClass {
    constructor(name: string)
    getName(): string
  }
}

// 2. 使用 @types 包
// npm install --save-dev @types/lodash

// 3. 全局声明
// src/types/global.d.ts
declare global {
  interface Window {
    myCustomProperty: string
  }
}

export {}

// 使用
window.myCustomProperty = "hello"

// 4. 模块扩展
// src/types/express.d.ts
import "express"

declare module "express" {
  interface Request {
    user?: {
      id: number
      name: string
    }
  }
}

// 使用
import { Request, Response } from "express"

app.get("/profile", (req: Request, res: Response) => {
  console.log(req.user?.name) // ✅ 类型安全
})

// 5. 命名空间声明
// src/types/jquery.d.ts
declare namespace JQuery {
  interface AjaxSettings {
    customOption?: boolean
  }
}

// 6. 临时解决方案（不推荐）
declare module "some-untyped-library"

import * as lib from "some-untyped-library" // any 类型
```

**追问点**：
- .d.ts 文件的查找规则
- 如何发布类型声明包
- DefinitelyTyped 项目的作用

---

### 15. 如何处理 React 组件的类型？

**核心答案**：

React 组件有多种类型定义方式，需要根据场景选择。

**代码示例**：

```typescript
import React, { FC, ReactNode, PropsWithChildren } from "react"

// 1. 函数组件 - 使用 FC（React.FC）
interface ButtonProps {
  text: string
  onClick: () => void
  disabled?: boolean
}

const Button: FC<ButtonProps> = ({ text, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  )
}

// 2. 函数组件 - 不使用 FC（推荐）
interface CardProps {
  title: string
  children: ReactNode
}

function Card({ title, children }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  )
}

// 3. 带泛型的组件
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => ReactNode
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item,
 formData.get("email") as string
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(e.clientX, e.clientY)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" onChange={handleChange} />
      <input name="email" type="email" />
      <button type="submit" onClick={handleClick}>
        Submit
      </button>
    </form>
  )
}

// 5. Hooks 类型
import { useState, useEffect, useRef, useCallback } from "react"

function Example() {
  // useState
  const [count, setCount] = useState<number>(0)
  const [user, setUser] = useState<{ name: string; age: number } | null>(null)

  // useRef
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)

  // useCallback
  const handleClick = useCallback((id: number) => {
    console.log(id)
  }, [])

  // useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Timer")
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={() => handleClick(1)}>Click</button>
    </div>
  )
}

// 6. 高阶组件（HOC）
interface WithLoadingProps {
  loading: boolean
}

function withLoading<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & WithLoadingProps> {
  return ({ loading, ...props }: WithLoadingProps & P) => {
    if (loading) {
      return <div>Loading...</div>
    }
    return <Component {...(props as P)} />
  }
}

// 使用
interface UserProfileProps {
  name: string
  email: string
}

const UserProfile: FC<UserProfileProps> = ({ name, email }) => (
  <div>
    <p>{name}</p>
    <p>{email}</p>
  </div>
)

const UserProfileWithLoading = withLoading(UserProfile)

// 7. Context 类型
interface ThemeContextType {
  theme: "light" | "dark"
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
```

**追问点**：
- FC 和普通函数组件的区别
- 如何处理 forwardRef 的类型
- 如何为 Context 提供类型安全

---

### 16. 如何实现类型安全的 API 请求？

**核心答案**：

通过泛型和类型约束实现类型安全的 HTTP 请求。

**代码示例**：

```typescript
// 1. 定义 API 响应类型
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface User {
  id: number
  name: string
  email: string
}

interface Post {
  id: number
  title: string
  content: string
  authorId: number
}

// 2. 封装请求函数
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: ApiResponse<T> = await response.json()

  if (data.code !== 200) {
    throw new Error(data.message)
  }

  return data.data
}

// 3. 使用类型安全的请求
async function getUser(id: number): Promise<User> {
  return request<User>(`/api/users/${id}`)
}

async function getPosts(): Promise<Post[]> {
  return request<Post[]>("/api/posts")
}

// 使用
const user = await getUser(1)
console.log(user.name) // ✅ 类型安全

const posts = await getPosts()
posts.forEach(post => {
  console.log(post.title) // ✅ 类型安全
})

// 4. 更完善的封装
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" })
  }

  async post<T, D = any>(path: string, data: D): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
  }

  async put<T, D = any>(path: string, data: D): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" })
  }

  private async request<T>(path: string, options: RequestInit): Promise<T> {
    const url = `${this.baseURL}${path}`
    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse<T> = await response.json()

    if (data.code !== 200) {
      throw new Error(data.message)
    }

    return data.data
  }
}

// 使用
const api = new ApiClient("https://api.example.com")

const user = await api.get<User>("/users/1")
const newPost = await api.post<Post, Omit<Post, "id">>("/posts", {
  title: "New Post",
  content: "Content",
  authorId: 1
})

// 5. 使用 Axios 的类型
import axios, { AxiosResponse } from "axios"

const axiosInstance = axios.create({
  baseURL: "https://api.example.com"
})

async function fetchUser(id: number): Promise<User> {
  const response: AxiosResponse<ApiResponse<User>> = await axiosInstance.get(
    `/users/${id}`
  )
  return response.data.data
}

// 6. 使用 React Query 的类型
import { useQuery, useMutation } from "@tanstack/react-query"

function useUser(id: number) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id)
  })
}

function useCreatePost() {
  return useMutation({
    mutationFn: (data: Omit<Post, "id">) =>
      api.post<Post, Omit<Post, "id">>("/posts", data)
  })
}

// 使用
function UserProfile({ userId }: { userId: number }) {
  const { data: user, isLoading, error } = useUser(userId)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!user) return null

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

**追问点**：
- 如何处理错误类型
- 如何实现请求拦截器的类型
- 如何为 GraphQL 提供类型支持

---

### 17. 如何实现类型安全的状态管理？

**核心答案**：

使用 TypeScript 为状态管理提供完整的类型支持。

**代码示例**：

```typescript
// 1. Redux Toolkit 类型
import { createSlice, PayloadAction, configureStore } from "@reduxjs/toolkit"

interface User {
  id: number
  name: string
  email: string
}

interface UserState {
  users: User[]
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload)
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter(user => user.id !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const { setUsers, addUser, removeUser, setLoading, setError } = userSlice.actions

const store = configureStore({
  reducer: {
    user: userSlice.reducer
  }
})

// 类型推断
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// 2. 类型安全的 Hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// 使用
function UserList() {
  const dispatch = useAppDispatch()
  const users = useAppSelector(state => state.user.users)
  const loading = useAppSelector(state => state.user.loading)

  const handleAddUser = () => {
    dispatch(addUser({ id: 1, name: "John", email: "john@example.com" }))
  }

  return (
    <div>
      {loading ? <div>Loading...</div> : null}
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={handleAddUser}>Add User</button>
    </div>
  )
}

// 3. Zustand 类型
import create from "zustand"

interface BearState {
  bears: number
  increase: () => void
  decrease: () => void
  reset: () => void
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  decrease: () => set((state) => ({ bears: state.bears - 1 })),
  reset: () => set({ bears: 0 })
}))

// 使用
function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  const increase = useBearStore((state) => state.increase)

  return (
    <div>
      <h1>{bears} bears</h1>
      <button onClick={increase}>Add bear</button>
    </div>
  )
}

// 4. Pinia 类型（Vue）
import { defineStore } from "pinia"

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [] as User[],
    loading: false,
    error: null as string | null
  }),
  getters: {
    userCount: (state) => state.users.length,
    getUserById: (state) => {
      return (id: number) => state.users.find(user => user.id === id)
    }
  },
  actions: {
    async fetchUsers() {
      this.loading = true
      try {
        const response = await fetch("/api/users")
        this.users = await response.json()
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Unknown error"
      } finally {
        this.loading = false
      }
    },
    addUser(user: User) {
      this.users.push(user)
    }
  }
})

// 使用
import { useUserStore } from "@/stores/user"

const userStore = useUserStore()
userStore.fetchUsers()
console.log(userStore.userCount)
```

**追问点**：
- 如何处理异步 action 的类型
- 如何为中间件提供类型支持
- 如何实现类型安全的 selector

---

## 📚 参考资源

### 官方文档
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### 学习资源
- [Type Challenges](https://github.com/type-challenges/type-challenges) - TypeScript 类型挑战
- [TypeScript 中文网](https://www.tslang.cn/)
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) - 类型声明仓库

### 工具推荐
- [ts-node](https://github.com/TypeStrong/ts-node) - 直接运行 TypeScript
- [tsc-watch](https://github.com/gilamran/tsc-watch) - TypeScript 编译监听
- [typescript-eslint](https://typescript-eslint.io/) - TypeScript ESLint 规则

---

## 💡 面试技巧

### 回答策略

1. **基础概念题**：
   - 先说定义，再说特点
   - 举例说明应用场景
   - 对比相关概念的区别

2. **代码实现题**：
   - 先说思路，再写代码
   - 考虑边界情况
   - 说明时间复杂度和空间复杂度

3. **实战场景题**：
   - 分析问题的本质
   - 提供多种解决方案
   - 说明各方案的优缺点

### 常见追问

1. **类型系统**：
   - 结构化类型 vs 名义化类型
   - 类型擦除的影响
   - 协变和逆变

2. **泛型**：
   - 泛型约束的实现原理
   - 泛型推断的规则
   - 泛型的性能影响

3. **工程化**：
   - 如何渐进式迁移到 TypeScript
   - 如何处理第三方库的类型问题
   - 如何优化编译性能

### 加分项

1. **深入理解**：
   - 了解 TypeScript 编译器的工作原理
   - 熟悉 TypeScript 的发展历史
   - 关注 TypeScript 的最新特性

2. **实战经验**：
   - 分享实际项目中的类型设计
   - 讨论遇到的类型问题及解决方案
   - 展示对类型系统的深刻理解

3. **最佳实践**：
   - 代码规范和风格指南
   - 性能优化经验
   - 团队协作经验

---

**最后更新**: 2025-02
