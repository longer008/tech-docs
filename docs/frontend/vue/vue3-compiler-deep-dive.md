# Vue 3 编译器原理深入解析

> 更新时间：2025-02

## 目录

[[toc]]

## 什么是 Vue 编译器

Vue 编译器负责将模板（Template）转换为渲染函数（Render Function），这个过程包括：

1. **解析（Parse）**：将模板字符串解析为 AST（抽象语法树）
2. **转换（Transform）**：对 AST 进行优化和转换
3. **生成（Generate）**：将 AST 生成为渲染函数代码

### 编译流程图

```
模板字符串
    ↓
解析器（Parser）
    ↓
模板 AST
    ↓
转换器（Transformer）
    ↓
JavaScript AST
    ↓
代码生成器（Generator）
    ↓
渲染函数代码
```

## 解析器（Parser）

### 基础实现

```javascript
// 解析模板为 AST
function parse(template) {
  const context = {
    source: template,
    mode: 'html',
    advanceBy(num) {
      context.source = context.source.sl
 = parseInterpolation(context)
    } else if (s[0] === '<') {
      if (s[1] === '/') {
        // 结束标签
        continue
      } else if (/[a-z]/i.test(s[1])) {
        // 开始标签
        node = parseElement(context, ancestors)
      }
    }
    
    if (!node) {
      // 解析文本
      node = parseText(context)
    }
    
    nodes.push(node)
  }
  
  return nodes
}
```

### 解析元素

```javascript
function parseElement(context, ancestors) {
  // 解析开始标签
  const element = parseTag(context, 'start')
  
  if (element.isSelfClosing) {
    return element
  }
  
  // 递归解析子节点
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()
  
  // 解析结束标签
  parseTag(context, 'end')
  
  return element
}
```

### 解析标签

```javascript
function parseTag(context, type) {
  const { advanceBy, advanceSpaces } = context
  
  // 匹配标签名
  const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source)
  const tag = match[1]
  
  advanceBy(match[0].length)
  advanceSpaces()
  
  // 解析属性
  const props = parseAttributes(context)
  
  // 检查是否自闭合
  const isSelfClosing = context.source.startsWith('/>')
  advanceBy(isSelfClosing ? 2 : 1)
  
  return {
    type: 'Element',
    tag,
    props,
    children: [],
    isSelfClosing
  }
}
```

### 解析属性

```javascript
function parseAttributes(context) {
  const { advanceBy, advanceSpaces } = context
  const props = []
  
  while (
    !context.source.startsWith('>') &&
    !context.source.startsWith('/>')
  ) {
    // 匹配属性名
    const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
    const name = match[0]
    
    advanceBy(name.length)
    advanceSpaces(
ce(0, closeIndex - 2)
  const content = rawContent.trim()
  
  advanceBy(rawContent.length)
  advanceBy(2) // 跳过 }}
  
  return {
    type: 'Interpolation',
    content: {
      type: 'Expression',
      content
    }
  }
}
```

### 解析文本

```javascript
function parseText(context) {
  // 找到文本结束位置
  const endTokens = ['<', '{{']
  let endIndex = context.source.length
  
  for (const token of endTokens) {
    const index = context.source.indexOf(token, 1)
    if (index !== -1 && index < endIndex) {
      endIndex = index
    }
  }
  
  const content = context.source.slice(0, endIndex)
  context.advanceBy(content.length)
  
  return {
    type: 'Text',
    content
  }
}
```

## 转换器（Transformer）

### 基础实现

```javascript
function transform(ast, options = {}) {
  const context = {
    currentNode: null,
    parent: null,
    childIndex: 0,
    nodeTransforms: options.nodeTransforms || [],
    replaceNode(node) {
      context.parent.children[context.childIndex] = node
      context.currentNode = node
    },
    removeNode() {
      context.parent.children.splice(context.childIndex, 1)
      context.currentNode = null
    }
  }
  
  traverseNode(ast, context)
  
  return ast
}
```

### 遍历节点

```javascript
function traverseNode(ast, context) {
  context.currentNode = ast
  
  // 应用转换插件（进入阶段）
  const exitFns = []
  const transforms = context.nodeTransforms
  
  for (const transform of transforms) {
    const onExit = transform(context.currentNode, context)
    if (onExit) {
      exitFns.push(onExit)
    }
    
    // 节点可能被移除
    if (!context.currentNode) return
  }
  
  // 递归处理子节点
  const children = context.currentNode.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      context.parent = context.currentNode
      context.childIndex = i
      traverseNode(children[i], context)
    }
  }
  
  // 应用转换插件（退出阶段）
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}
```

### 转换插件示例

```javascript
// 转换元素节点
function transformElement(node) {
  return () => {
    if (node.type !== 'Element') {
      return
    }
    
    // 创建 JavaScript AST 节点
    const callExp = {
      type: 'CallExpression',
      callee: 'h',
      arguments: [
        { type: 'StringLiteral', value: node.tag },
        node.props.length > 0 ? transformProps(node.props) : null,
        node.children.length > 0 ? transformChildren(node.children) : null
      ].filter(Boolean)
    }
    
    node.jsNode = callExp
  }
}

// 转换文本节点
function transformText(node) {
  if (node.type !== 'Text') {
    return
  }
  
  node.jsNode = {
    type: 'StringLiteral',
    value: node.content
  }
}

// 转换插值节点
function transformInterpolation(node) {
  if (node.type !== 'Interpolation') {
    return
  }
  
  node.jsNode = {
    type: 'CallExpression',
    callee: 'toString',
    arguments: [
      { type: 'Identifier', name: node.content.content }
    ]
  }
}
```

## 代码生成器（Generator）

### 基础实现

```javascript
function generate(ast) {
  const context = {
    code: '',
    push(code) {
      context.code += code
    },
    indent() {
      context.indentLevel++
    },
    deindent() {
      context.indentLevel--
    },
    newline() {
      context.code += '\n' + '  '.repeat(context.indentLevel)
    },
    indentLevel: 0
  }
  
  genFunctionPreamble(context)
  
  context.push('return ')
  
  if (ast.jsNode) {
    genNode(ast.jsNode, context)
  }
  
  return context.code
}
```

### 生成函数前导码

```javascript
function genFunctionPreamble(context) {
  const { push, newline } = context
  
  push('function render() {')
  newline()
  push('  ')
}
```

### 生成节点代码

```javascript
function genNode(node, context) {
  switch (node.type) {
    case 'FunctionDecl':
      genFunctionDecl(node, context)
      break
    case 'ReturnStatement':
      genReturnStatement(node, context)
      break
    case 'CallExpression':
      genCallExpression(node, context)
      break
    case 'StringLiteral':
      genStringLiteral(node, context)
      break
    case 'ArrayExpression':
      genArrayExpression(node, context)
      break
    case 'Identifier':
      genIdentifier(node, context)
      break
  }
}
```

### 生成函数调用

```javascript
function genCallExpression(node, context) {
  const { push } = context
  const { callee, arguments: args } = node
  
  push(`${callee}(`)
  
  for (let i = 0; i < args.length; i++) {
    genNode(args[i], context)
    if (i < args.length - 1) {
      push(', ')
    }
  }
  
  push(')')
}
```

### 生成数组表达式

```javascript
function genArrayExpression(node, context) {
  const { push } = context
  
  push('[')
  
  for (let i = 0; i < node.elements.length; i++) {
    genNode(node.elements[i], context)
    if (i < node.elements.length - 1) {
      push(', ')
    }
  }
  
  push(']')
}
```

## 完整编译示例

```javascript
// 模板
const template = `
  <div id="app">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
  </div>
`

// 1. 解析
const ast = parse(template)
console.log(JSON.stringify(ast, null, 2))

// 2. 转换
transform(ast, {
  nodeTransforms: [
    transformElement,
    transformText,
    transformInterpolation
  ]
})

// 3. 生成
const code = generate(ast)
console.log(code)

// 输出的渲染函数：
// function render() {
//   return h('div', { id: 'app' }, [
//     h('h1', null, [toString(title)]),
//     h('p', null, [toString(message)])
//   ])
// }
```

## 编译优化

### 1. 静态提升（Static Hoisting）

```javascript
// 编译前
<div>
  <p>静态文本</p>
  <p>{{ dynamic }}</p>
</div>

// 编译后（优化）
const _hoisted_1 = h('p', null, '静态文本')

function render() {
  return h('div', null, [
    _hoisted_1, // 静态节点提升到外部
    h('p', null, toString(dynamic))
  ])
}
```

### 2. 预字符串化（Pre-Stringification）

```javascript
// 编译前
<div>
  <p>文本1</p>
  <p>文本2</p>
  <p>文本3</p>
</div>

// 编译后（优化）
const _hoisted_1 = createStaticVNode(
  '<p>文本1</p><p>文本2</p><p>文本3</p>'
)

function render() {
  return h('div', null, [_hoisted_1])
}
```

### 3. 缓存事件处理函数

```javascript
// 编译前
<button @click="handleClick">点击</button>

// 编译后（优化）
function render(_ctx, _cache) {
  return h('button', {
    onClick: _cache[0] || (_cache[0] = (...args) => _ctx.handleClick(...args))
  }, '点击')
}
```

### 4. Block Tree 优化

```javascript
// 编译前
<div>
  <p>{{ text }}</p>
</div>

// 编译后（优化）
function render() {
  return (openBlock(), createBlock('div', null, [
    createVNode('p', null, toString(text), 1 /* TEXT */)
  ]))
}

// Block 收集动态节点，diff 时只比较动态节点
```

## 指令编译

### v-if 编译

```javascript
// 模板
<div v-if="ok">Yes</div>
<div v-else>No</div>

// 编译后
function render() {
  return ok
    ? h('div', null, 'Yes')
    : h('div', null, 'No')
}
```

### v-for 编译

```javascript
// 模板
<li v-for="item in items" :key="item.id">
  {{ item.text }}
</li>

// 编译后
function render() {
  return renderList(items, (item) => {
    return h('li', { key: item.id }, toString(item.text))
  })
}
```

### v-model 编译

```javascript
// 模板
<input v-model="text" />

// 编译后
function render() {
  return h('input', {
    value: text,
    onInput: ($event) => {
      text = $event.target.value
    }
  })
}
```

### v-bind 编译

```javascript
// 模板
<div :class="{ active: isActive }" :style="{ color: textColor }">
  内容
</div>

// 编译后
function render() {
  return h('div', {
    class: { active: isActive },
    style: { color: textColor }
  }, '内容')
}
```

## 插槽编译

### 默认插槽

```javascript
// 模板
<MyComponent>
  <p>插槽内容</p>
</MyComponent>

// 编译后
function render() {
  return h(MyComponent, null, {
    default: () => [h('p', null, '插槽内容')]
  })
}
```

### 具名插槽

```javascript
// 模板
<MyComponent>
  <template #header>
    <h1>标题</h1>
  </template>
  <template #default>
    <p>内容</p>
  </template>
</MyComponent>

// 编译后
function render() {
  return h(MyComponent, null, {
    header: () => [h('h1', null, '标题')],
    default: () => [h('p', null, '内容')]
  })
}
```

### 作用域插槽

```javascript
// 模板
<MyComponent>
  <template #default="{ item }">
    <p>{{ item.text }}</p>
  </template>
</MyComponent>

// 编译后
function render() {
  return h(MyComponent, null, {
    default: ({ item }) => [h('p', null, toString(item.text))]
  })
}
```

## 性能优化标记

### PatchFlags

```javascript
// 动态文本
<div>{{ text }}</div>
// PatchFlag: 1 (TEXT)

// 动态 class
<div :class="cls"></div>
// PatchFlag: 2 (CLASS)

// 动态 style
<div :style="style"></div>
// PatchFlag: 4 (STYLE)

// 动态 props
<div :id="id"></div>
// PatchFlag: 8 (PROPS)

// 完整 props
<div v-bind="attrs"></div>
// PatchFlag: 16 (FULL_PROPS)
```

### ShapeFlags

```javascript
// 元素节点
ShapeFlags.ELEMENT = 1

// 函数式组件
ShapeFlags.FUNCTIONAL_COMPONENT = 2

// 有状态组件
ShapeFlags.STATEFUL_COMPONENT = 4

// 文本子节点
ShapeFlags.TEXT_CHILDREN = 8

// 数组子节点
ShapeFlags.ARRAY_CHILDREN = 16

// 插槽子节点
ShapeFlags.SLOTS_CHILDREN = 32
```

## 实战案例

### 1. 自定义编译器插件

```javascript
// 自动添加 data-test 属性
function addTestIdPlugin() {
  return (node) => {
    if (node.type === 'Element') {
      node.props.push({
        type: 'Attribute',
        name: 'data-test',
        value: node.tag
      })
    }
  }
}

// 使用
transform(ast, {
  nodeTransforms: [
    addTestIdPlugin(),
    transformElement
  ]
})
```

### 2. 编译时宏

```javascript
// 定义宏
const macros = {
  __DEV__: process.env.NODE_ENV !== 'production',
  __VERSION__: '3.0.0'
}

// 替换宏
function replaceMacros(code) {
  return code.replace(/__\w+__/g, (match) => {
    return macros[match] !== undefined
      ? JSON.stringify(macros[match])
      : match
  })
}

// 使用
const code = generate(ast)
const finalCode = replaceMacros(code)
```

## 常见问题

### 1. 为什么需要编译器？

- 提供更好的开发体验（模板语法）
- 编译时优化（静态提升、预字符串化）
- 更好的错误提示

### 2. 运行时编译 vs 构建时编译？

```javascript
// 运行时编译（体积大，性能差）
import { createApp } from 'vue'

createApp({
  template: '<div>{{ msg }}</div>',
  data() {
    return { msg: 'Hello' }
  }
})

// 构建时编译（体积小，性能好）
import { createApp, h } from 'vue'

createApp({
  render() {
    return h('div', this.msg)
  },
  data() {
    return { msg: 'Hello' }
  }
})
```

### 3. 如何调试编译结果？

```javascript
// 使用 @vue/compiler-sfc
import { compile } from '@vue/compiler-sfc'

const { code } = compile(`
  <template>
    <div>{{ msg }}</div>
  </template>
`)

console.log(code)
```

## 面试要点

### 核心问题

1. **Vue 编译器的三个阶段是什么？**
   - 解析（Parse）：模板 → AST
   - 转换（Transform）：AST 优化
   - 生成（Generate）：AST → 代码

2. **Vue 3 编译器有哪些优化？**
   - 静态提升
   - 预字符串化
   - 缓存事件处理函数
   - Block Tree
   - PatchFlags

3. **v-if 和 v-for 如何编译？**
   - v-if 编译为三元表达式
   - v-for 编译为 renderList 函数调用

### 追问点

- 编译器如何处理指令？
- 插槽如何编译？
- 如何实现编译时优化？
- 运行时编译和构建时编译的区别？

## 参考资料

- [Vue 3 编译器源码](https://github.com/vuejs/core/tree/main/packages/compiler-core)
- [Vue 3 模板编译原理](https://cn.vuejs.org/guide/extras/rendering-mechanism.html)
- [Vue.js 设计与实现 - 编译器篇](https://book.douban.com/subject/35768338/)
