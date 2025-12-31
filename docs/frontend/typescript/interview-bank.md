# TypeScript 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:TypeScript 的类型系统特点？
- 标准答案:结构化类型系统（鸭子类型），支持类型推断、联合/交叉、字面量类型、控制流类型收窄；提供丰富的内置工具类型与泛型编程能力。
- 追问点:结构化 vs 名义化；类型擦除只在编译期生效；any/unknown/never 的区别。
- 参考:https://www.typescriptlang.org/docs/handbook/type-compatibility.html

### Q2:interface 与 type 有何差异？
- 标准答案:interface 可声明合并、继承；type 更通用，可用于联合/交叉/映射类型；大多数结构类型场景可互换，但混用时注意可读性与合并需求。
- 追问点:何时必须用 type（联合、条件类型）；何时用 interface（库声明、扩展）；命名规范。
- 参考:https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#interfaces

### Q3:泛型的作用与常见约束？
- 标准答案:泛型让类型参数化以复用；可用 `extends` 约束、默认类型、泛型条件/映射；避免滥用 any 保持类型安全。
- 追问点:泛型推断；可变元组类型；`keyof`/`in` 的用法。
- 参考:https://www.typescriptlang.org/docs/handbook/2/generics.html

### Q4:常用工具类型？
- 标准答案:Partial/Required/Pick/Omit/Readonly/Record/ReturnType/Parameters 等；配合索引类型与映射类型快速派生；可以自定义 DeepPartial 等。
- 追问点:工具类型的局限；深层可选处理；TS 5.x 新增 `satisfies`。
- 参考:https://www.typescriptlang.org/docs/handbook/utility-types.html

### Q5:any、unknown、never 区别？
- 标准答案:any 绕过检查；unknown 更安全，使用前需收窄；never 表示不可能到达的类型(throw/死循环)；应尽量减少 any，增加类型收窄。
- 追问点:strictNullChecks 的影响；`never` 在判别联合中的作用；lib DOM 抛出 never 的意义。
- 参考:https://www.typescriptlang.org/docs/handbook/2/basic-types.html

### Q6:类型收窄与控制流分析？
- 标准答案:通过 typeof/instanceof/in、字面量判别、用户自定义类型守卫等让 TS 根据分支收窄类型；`satisfies` 提供表达式级校验而不改变结果类型。
- 追问点:可辨识联合；`as const`；类型保护函数的返回类型写法。
- 参考:https://www.typescriptlang.org/docs/handbook/2/narrowing.html

### Q7:模块解析与路径别名？
- 标准答案:tsconfig `moduleResolution` 影响查找；`paths`/`baseUrl` 配合构建工具；需要同时配置编译器与打包器；区分 ESM/CJS 输出。
- 追问点:声明文件路径；`types` 字段；node16/next 模块解析差异。
- 参考:https://www.typescriptlang.org/tsconfig#moduleResolution

### Q8:tsconfig 常用严格选项？
- 标准答案:`strict` 总开关；`noImplicitAny`、`strictNullChecks`、`noUnusedLocals`、`exactOptionalPropertyTypes` 等；严格模式提升安全性但需要适配。
- 追问点:库作者应该开启哪些；增量编译 `incremental`；`skipLibCheck` 的权衡。
- 参考:https://www.typescriptlang.org/tsconfig

## 场景/排查
### Q1:any 滥用导致类型失效，如何治理？
- 标准答案:开启 `noImplicitAny` 与 `noImplicitThis`；为接口逐步补充类型；引入 lint 规则限制 any；通过类型守卫/泛型替换 any。
- 追问点:渐进式收敛计划；第三方库声明缺失怎么办；使用 `unknown` 替代。
- 参考:https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html

### Q2:前端/后端共享类型如何管理？
- 标准答案:抽离独立包或 monorepo workspace；使用 `tsup/tsc` 生成 d.ts；发布版本化；避免循环依赖；可借助 OpenAPI 代码生成。
- 追问点:树摇与 sideEffects；多环境构建；兼容 ESM/CJS。
- 参考:https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html

## 反问
### Q1:项目的 TS 严格模式与代码规范？
- 标准答案:了解团队容忍度与现有 debt，方便评估改造成本。
- 追问点:CI 类型检查；lint/formatter；`paths` 规则。
- 参考:团队内部规范

### Q2:类型与接口文档的来源？
- 标准答案:确认是否使用 OpenAPI/GraphQL 生成类型，避免手写不一致。
- 追问点:更新流程；mock 数据同步；后端变更告警。
- 参考:团队内部规范
