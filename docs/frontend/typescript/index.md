# TypeScript

## 元信息
- 定位与场景：JavaScript 的类型增强语言，提升可维护性与可读性。
- 版本范围：以官方稳定版本为准，关注类型系统与编译器选项变化。
- 相关生态：tsconfig、ESLint/TSLint、前端框架生态。

## 研究记录（Exa）
- 查询 1："TypeScript interview questions 2024 2025"
- 查询 2："TypeScript best practices documentation"
- 查询 3："TypeScript handbook"
- 来源摘要：以官方 Handbook 为主要参考。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：`interface` 与 `type` 的区别？
  - A：`interface` 可合并与扩展，`type` 更灵活可表示联合/交叉类型。
- Q2：`any` 与 `unknown` 的差异？
  - A：`unknown` 更安全，使用前需类型收窄。
- Q3：泛型的应用场景？
  - A：提升复用能力与类型推断。
- Q4：类型收窄（Narrowing）如何实现？
  - A：`typeof`/`in`/`instanceof` 等守卫。
- Q5：常用工具类型有哪些？
  - A：`Partial`/`Pick`/`Omit`/`Record`。

### 进阶/场景题
- Q1：条件类型与映射类型的使用场景？
  - A：在类型层做变换与推导。
- Q2：如何设计公共类型声明以避免破坏性变更？
  - A：稳定接口、明确版本语义。

### 避坑指南
- 关闭 strict 导致类型退化。
- 滥用 `any` 破坏类型安全。
- 复杂类型过度抽象导致可读性下降。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- TypeScript 文档：https://www.typescriptlang.org/docs/
- Handbook：https://www.typescriptlang.org/docs/handbook/intro.html
- Everyday Types：https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
```

### 常用代码片段
```ts
interface User {
  id: number
  name: string
}

function identity<T>(value: T): T {
  return value
}

const user: User = { id: 1, name: 'Tom' }
const out = identity<User>(user)
```

### 版本差异
- 类型系统与编译器选项持续增强。
- 升级需参考官方 Release Notes。
