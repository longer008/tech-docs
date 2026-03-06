# WebGL 完全指南

> WebGL 3D 图形编程与着色器开发 | 更新时间：2025-02

## 目录

- [WebGL 基础](#webgl-基础)
- [着色器编程](#着色器编程)
- [3D 变换](#3d-变换)
- [纹理贴图](#纹理贴图)
- [光照系统](#光照系统)
- [性能优化](#性能优化)
- [实战案例](#实战案例)

---

## WebGL 基础

### 1. WebGL 简介

WebGL（Web Graphics Library）是一种 JavaScript API，用于在浏览器中渲染 3D 图形，基于 OpenGL ES 2.0。

```typescript
// 初始化 WebGL 上下文
function initWebGL(canvas: HTMLCanvasElement): WebGLRenderingContext {
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) {
    throw new Error('WebGL not supported');
  }

  // 设置视口
  gl.viewport(0, 0, canvas.width, canvas.height);

  // 设置清除颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // 启用深度测试
  gl.enable(gl.DEPTH_TEST);

  return gl as WebGLRenderingContext;
}

// 使用
const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
const gl = initWebGL(canvas);
```

### 2. 着色器创建

```typescript
// 创建着色器
function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Failed to create shader');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // 检查编译状态
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation error: ${info}`);
  }

  return shader;
}

// 创建程序
function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram {
  const program = gl.createProgram();
  if (!program) {
    throw new Error('Failed to create program');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // 检查链接状态
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program linking error: ${info}`);
  }

  return program;
}

// 完整的着色器程序创建
function createShaderProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = createProgram(gl, vertexShader, fragmentShader);

  // 清理着色器（已链接到程序中）
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}
```

---

## 着色器编程

### 1. 顶点着色器

```glsl
// 基础顶点着色器
attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

varying vec4 v_color;

void main() {
  gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;
  v_color = a_color;
}
```

### 2. 片段着色器

```glsl
// 基础片段着色器
precision mediump float;

varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
```

### 3. 绘制三角形

```typescript
// 顶点着色器源码
const vertexShaderSource = `
  attribute vec4 a_position;
  attribute vec4 a_color;
  varying vec4 v_color;

  void main() {
    gl_Position = a_position;
    v_color = a_color;
  }
`;

// 片段着色器源码
const fragmentShaderSource = `
  precision mediump float;
  varying vec4 v_color;

  void main() {
    gl_FragColor = v_color;
  }
`;

// 创建程序
const program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

// 顶点数据（位置 + 颜色）
const vertices = new Float32Array([
  // 位置 (x, y, z)    颜色 (r, g, b, a)
  0.0,  0.5,  0.0,     1.0, 0.0, 0.0, 1.0,  // 顶点 1 (红色)
  -0.5, -0.5, 0.0,     0.0, 1.0, 0.0, 1.0,  // 顶点 2 (绿色)
  0.5,  -0.5, 0.0,     0.0, 0.0, 1.0, 1.0   // 顶点 3 (蓝色)
]);

// 创建缓冲区
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// 获取属性位置
const positionLocation = gl.getAttribLocation(program, 'a_position');
const colorLocation = gl.getAttribLocation(program, 'a_color');

// 设置顶点属性指针
const stride = 7 * Float32Array.BYTES_PER_ELEMENT;  // 每个顶点 7 个浮点数

gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(
  positionLocation,
  3,                    // 每个顶点 3 个分量 (x, y, z)
  gl.FLOAT,
  false,
  stride,
  0                     // 偏移量
);

gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(
  colorLocation,
  4,                    // 每个颜色 4 个分量 (r, g, b, a)
  gl.FLOAT,
  false,
  stride,
  3 * Float32Array.BYTES_PER_ELEMENT  // 偏移量
);

// 使用程序并绘制
gl.useProgram(program);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 3);
```

---

## 3D 变换

### 1. 矩阵工具类

```typescript
// 4x4 矩阵工具类
class Mat4 {
  data: Float32Array;

  constructor() {
    this.data = new Float32Array(16);
    this.identity();
  }

  // 单位矩阵
  identity(): Mat4 {
    this.data.fill(0);
    this.data[0] = this.data[5] = this.data[10] = this.data[15] = 1;
    return this;
  }

  // 平移
  translate(x: number, y: number, z: number): Mat4 {
    this.data[12] += x;
    this.data[13] += y;
    this.data[14] += z;
    return this;
  }

  // 缩放
  scale(x: number, y: number, z: number): Mat4 {
    this.data[0] *= x;
    this.data[5] *= y;
    this.data[10] *= z;
    return this;
  }

  // 旋转（绕 X 轴）
  rotateX(angle: number): Mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const m = new Float32Array(16);
    m[0] = m[15] = 1;
    m[5] = m[10] = c;
    m[6] = s;
    m[9] = -s;
    return this.multiply(m);
  }

  // 旋转（绕 Y 轴）
  rotateY(angle: number): Mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const m = new Float32Array(16);
    m[5] = m[15] = 1;
    m[0] = m[10] = c;
    m[2] = -s;
    m[8] = s;
    return this.multiply(m);
  }

  // 旋转（绕 Z 轴）
  rotateZ(angle: number): Mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const m = new Float32Array(16);
    m[10] = m[15] = 1;
    m[0] = m[5] = c;
    m[1] = s;
    m[4] = -s;
    return this.multiply(m);
  }

  // 矩阵乘法
  multiply(other: Float32Array): Mat4 {
    const result = new Float32Array(16);
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += this.data[i * 4 + k] * other[k * 4 + j];
        }
        result[i * 4 + j] = sum;
      }
    }

    this.data = result;
    return this;
  }

  // 透视投影矩阵
  perspective(fov: number, aspect: number, near: number, far: number): Mat4 {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);

    this.data.fill(0);
    this.data[0] = f / aspect;
    this.data[5] = f;
    this.data[10] = (far + near) * nf;
    this.data[11] = -1;
    this.data[14] = 2 * far * near * nf;

    return this;
  }

  // 正交投影矩阵
  ortho(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
  ): Mat4 {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    this.data.fill(0);
    this.data[0] = -2 * lr;
    this.data[5] = -2 * bt;
    this.data[10] = 2 * nf;
    this.data[12] = (left + right) * lr;
    this.data[13] = (top + bottom) * bt;
    this.data[14] = (far + near) * nf;
    this.data[15] = 1;

    return this;
  }

  // 视图矩阵（lookAt）
  lookAt(
    eyeX: number, eyeY: number, eyeZ: number,
    centerX: number, centerY: number, centerZ: number,
    upX: number, upY: number, upZ: number
  ): Mat4 {
    // 计算 Z 轴（视线方向）
    let zx = eyeX - centerX;
    let zy = eyeY - centerY;
    let zz = eyeZ - centerZ;
    let len = Math.sqrt(zx * zx + zy * zy + zz * zz);
    zx /= len;
    zy /= len;
    zz /= len;

    // 计算 X 轴（右方向）
    let xx = upY * zz - upZ * zy;
    let xy = upZ * zx - upX * zz;
    let xz = upX * zy - upY * zx;
    len = Math.sqrt(xx * xx + xy * xy + xz * xz);
    xx /= len;
    xy /= len;
    xz /= len;

    // 计算 Y 轴（上方向）
    const yx = zy * xz - zz * xy;
    const yy = zz * xx - zx * xz;
    const yz = zx * xy - zy * xx;

    this.data[0] = xx;
    this.data[1] = yx;
    this.data[2] = zx;
    this.data[3] = 0;
    this.data[4] = xy;
    this.data[5] = yy;
    this.data[6] = zy;
    this.data[7] = 0;
    this.data[8] = xz;
    this.data[9] = yz;
    this.data[10] = zz;
    this.data[11] = 0;
    this.data[12] = -(xx * eyeX + xy * eyeY + xz * eyeZ);
    this.data[13] = -(yx * eyeX + yy * eyeY + yz * eyeZ);
    this.data[14] = -(zx * eyeX + zy * eyeY + zz * eyeZ);
    this.data[15] = 1;

    return this;
  }
}
```

### 2. 旋转立方体

```typescript
// 立方体顶点数据
const cubeVertices = new Float32Array([
  // 前面
  -1, -1,  1,  1, 0, 0, 1,
   1, -1,  1,  1, 0, 0, 1,
   1,  1,  1,  1, 0, 0, 1,
  -1,  1,  1,  1, 0, 0, 1,
  // 后面
  -1, -1, -1,  0, 1, 0, 1,
  -1,  1, -1,  0, 1, 0, 1,
   1,  1, -1,  0, 1, 0, 1,
   1, -1, -1,  0, 1, 0, 1,
  // ... 其他面
]);

// 索引数据
const cubeIndices = new Uint16Array([
  0, 1, 2,  0, 2, 3,    // 前面
  4, 5, 6,  4, 6, 7,    // 后面
  // ... 其他面
]);

// 动画循环
let rotation = 0;

function animate() {
  rotation += 0.01;

  // 模型矩阵
  const modelMatrix = new Mat4()
    .rotateX(rotation)
    .rotateY(rotation * 0.7);

  // 视图矩阵
  const viewMatrix = new Mat4()
    .lookAt(0, 0, 5, 0, 0, 0, 0, 1, 0);

  // 投影矩阵
  const projectionMatrix = new Mat4()
    .perspective(Math.PI / 4, canvas.width / canvas.height, 0.1, 100);

  // 传递矩阵到着色器
  const modelViewLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');
  const projectionLocation = gl.getUniformLocation(program, 'u_projectionMatrix');

  gl.uniformMatrix4fv(modelViewLocation, false, modelMatrix.data);
  gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix.data);

  // 清除并绘制
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);

  requestAnimationFrame(animate);
}

animate();
```


---

## 纹理贴图

### 1. 加载纹理

```typescript
// 加载纹理
function loadTexture(
  gl: WebGLRenderingContext,
  url: string
): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error('Failed to create texture');
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 临时填充 1x1 蓝色像素
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255])
  );

  // 加载图片
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );

    // 检查是否是 2 的幂次方
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value: number): boolean {
  return (value & (value - 1)) === 0;
}

// 纹理着色器
const textureVertexShader = `
  attribute vec4 a_position;
  attribute vec2 a_texCoord;
  
  uniform mat4 u_matrix;
  
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = u_matrix * a_position;
    v_texCoord = a_texCoord;
  }
`;

const textureFragmentShader = `
  precision mediump float;
  
  uniform sampler2D u_texture;
  varying vec2 v_texCoord;
  
  void main() {
    gl_FragColor = texture2D(u_texture, v_texCoord);
  }
`;
```

---

## 光照系统

### 1. Phong 光照模型

```glsl
// 顶点着色器（带法线）
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_normalMatrix;

varying vec3 v_normal;
varying vec3 v_fragPos;
varying vec2 v_texCoord;

void main() {
  vec4 worldPos = u_modelMatrix * a_position;
  v_fragPos = worldPos.xyz;
  v_normal = mat3(u_normalMatrix) * a_normal;
  v_texCoord = a_texCoord;
  
  gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
}
```

```glsl
// 片段着色器（Phong 光照）
precision mediump float;

struct Light {
  vec3 position;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

struct Material {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float shininess;
};

uniform Light u_light;
uniform Material u_material;
uniform vec3 u_viewPos;
uniform sampler2D u_texture;

varying vec3 v_normal;
varying vec3 v_fragPos;
varying vec2 v_texCoord;

void main() {
  // 环境光
  vec3 ambient = u_light.ambient * u_material.ambient;
  
  // 漫反射
  vec3 norm = normalize(v_normal);
  vec3 lightDir = normalize(u_light.position - v_fragPos);
  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = u_light.diffuse * (diff * u_material.diffuse);
  
  // 镜面反射
  vec3 viewDir = normalize(u_viewPos - v_fragPos);
  vec3 reflectDir = reflect(-lightDir, norm);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_material.shininess);
  vec3 specular = u_light.specular * (spec * u_material.specular);
  
  // 纹理
  vec4 texColor = texture2D(u_texture, v_texCoord);
  
  // 最终颜色
  vec3 result = (ambient + diffuse + specular) * texColor.rgb;
  gl_FragColor = vec4(result, texColor.a);
}
```

### 2. 设置光照参数

```typescript
// 设置光照
function setupLighting(gl: WebGLRenderingContext, program: WebGLProgram) {
  // 光源属性
  const lightPosLocation = gl.getUniformLocation(program, 'u_light.position');
  const lightAmbientLocation = gl.getUniformLocation(program, 'u_light.ambient');
  const lightDiffuseLocation = gl.getUniformLocation(program, 'u_light.diffuse');
  const lightSpecularLocation = gl.getUniformLocation(program, 'u_light.specular');

  gl.uniform3f(lightPosLocation, 5.0, 5.0, 5.0);
  gl.uniform3f(lightAmbientLocation, 0.2, 0.2, 0.2);
  gl.uniform3f(lightDiffuseLocation, 0.8, 0.8, 0.8);
  gl.uniform3f(lightSpecularLocation, 1.0, 1.0, 1.0);

  // 材质属性
  const matAmbientLocation = gl.getUniformLocation(program, 'u_material.ambient');
  const matDiffuseLocation = gl.getUniformLocation(program, 'u_material.diffuse');
  const matSpecularLocation = gl.getUniformLocation(program, 'u_material.specular');
  const matShininessLocation = gl.getUniformLocation(program, 'u_material.shininess');

  gl.uniform3f(matAmbientLocation, 1.0, 0.5, 0.31);
  gl.uniform3f(matDiffuseLocation, 1.0, 0.5, 0.31);
  gl.uniform3f(matSpecularLocation, 0.5, 0.5, 0.5);
  gl.uniform1f(matShininessLocation, 32.0);

  // 视点位置
  const viewPosLocation = gl.getUniformLocation(program, 'u_viewPos');
  gl.uniform3f(viewPosLocation, 0.0, 0.0, 5.0);
}
```

---

## 性能优化

### 1. 批量绘制

```typescript
// 批量绘制管理器
class BatchRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private maxBatchSize: number = 1000;
  private vertices: Float32Array;
  private vertexCount: number = 0;
  private buffer: WebGLBuffer;

  constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
    this.gl = gl;
    this.program = program;
    this.vertices = new Float32Array(this.maxBatchSize * 7); // 位置 + 颜色
    
    const buffer = gl.createBuffer();
    if (!buffer) {
      throw new Error('Failed to create buffer');
    }
    this.buffer = buffer;
  }

  addQuad(x: number, y: number, width: number, height: number, color: number[]) {
    if (this.vertexCount >= this.maxBatchSize) {
      this.flush();
    }

    const offset = this.vertexCount * 7;

    // 顶点 1
    this.vertices[offset] = x;
    this.vertices[offset + 1] = y;
    this.vertices[offset + 2] = 0;
    this.vertices[offset + 3] = color[0];
    this.vertices[offset + 4] = color[1];
    this.vertices[offset + 5] = color[2];
    this.vertices[offset + 6] = color[3];

    // ... 其他顶点

    this.vertexCount += 6; // 2 个三角形 = 6 个顶点
  }

  flush() {
    if (this.vertexCount === 0) return;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.vertices.subarray(0, this.vertexCount * 7),
      this.gl.DYNAMIC_DRAW
    );

    // 设置属性指针
    // ...

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    this.vertexCount = 0;
  }
}
```

### 2. 实例化渲染

```typescript
// 实例化渲染（WebGL 2.0）
function setupInstancedRendering(gl: WebGL2RenderingContext) {
  // 实例数据（每个实例的位置）
  const instancePositions = new Float32Array([
    -2, 0, 0,
    0, 0, 0,
    2, 0, 0
  ]);

  const instanceBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, instancePositions, gl.STATIC_DRAW);

  const instancePosLocation = gl.getAttribLocation(program, 'a_instancePos');
  gl.enableVertexAttribArray(instancePosLocation);
  gl.vertexAttribPointer(instancePosLocation, 3, gl.FLOAT, false, 0, 0);
  
  // 设置为实例化属性
  gl.vertexAttribDivisor(instancePosLocation, 1);

  // 绘制实例
  gl.drawArraysInstanced(gl.TRIANGLES, 0, 3, 3); // 绘制 3 个实例
}
```

### 3. 纹理图集

```typescript
// 纹理图集管理
class TextureAtlas {
  private gl: WebGLRenderingContext;
  private texture: WebGLTexture;
  private width: number;
  private height: number;
  private regions: Map<string, TextureRegion> = new Map();

  constructor(gl: WebGLRenderingContext, width: number, height: number) {
    this.gl = gl;
    this.width = width;
    this.height = height;

    const texture = gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create texture');
    }
    this.texture = texture;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  addRegion(name: string, x: number, y: number, width: number, height: number, image: HTMLImageElement) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texSubImage2D(
      this.gl.TEXTURE_2D,
      0,
      x,
      y,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image
    );

    this.regions.set(name, {
      x: x / this.width,
      y: y / this.height,
      width: width / this.width,
      height: height / this.height
    });
  }

  getRegion(name: string): TextureRegion | undefined {
    return this.regions.get(name);
  }
}

interface TextureRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

---

## 实战案例

### 1. 3D 模型加载器

```typescript
// OBJ 模型加载器
class OBJLoader {
  async load(url: string): Promise<ModelData> {
    const response = await fetch(url);
    const text = await response.text();

    const positions: number[] = [];
    const normals: number[] = [];
    const texCoords: number[] = [];
    const indices: number[] = [];

    const lines = text.split('\n');

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const type = parts[0];

      switch (type) {
        case 'v':  // 顶点位置
          positions.push(
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3])
          );
          break;

        case 'vn':  // 顶点法线
          normals.push(
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3])
          );
          break;

        case 'vt':  // 纹理坐标
          texCoords.push(
            parseFloat(parts[1]),
            parseFloat(parts[2])
          );
          break;

        case 'f':  // 面
          for (let i = 1; i <= 3; i++) {
            const vertex = parts[i].split('/');
            indices.push(parseInt(vertex[0]) - 1);
          }
          break;
      }
    }

    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      texCoords: new Float32Array(texCoords),
      indices: new Uint16Array(indices)
    };
  }
}

interface ModelData {
  positions: Float32Array;
  normals: Float32Array;
  texCoords: Float32Array;
  indices: Uint16Array;
}
```

### 2. 粒子系统

```typescript
// WebGL 粒子系统
class ParticleSystemWebGL {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private particleCount: number;
  private positions: Float32Array;
  private velocities: Float32Array;
  private colors: Float32Array;
  private buffer: WebGLBuffer;

  constructor(gl: WebGLRenderingContext, program: WebGLProgram, count: number) {
    this.gl = gl;
    this.program = program;
    this.particleCount = count;

    // 初始化粒子数据
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.colors = new Float32Array(count * 4);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const i4 = i * 4;

      // 位置
      this.positions[i3] = (Math.random() - 0.5) * 10;
      this.positions[i3 + 1] = (Math.random() - 0.5) * 10;
      this.positions[i3 + 2] = (Math.random() - 0.5) * 10;

      // 速度
      this.velocities[i3] = (Math.random() - 0.5) * 0.1;
      this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
      this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

      // 颜色
      this.colors[i4] = Math.random();
      this.colors[i4 + 1] = Math.random();
      this.colors[i4 + 2] = Math.random();
      this.colors[i4 + 3] = 1.0;
    }

    const buffer = gl.createBuffer();
    if (!buffer) {
      throw new Error('Failed to create buffer');
    }
    this.buffer = buffer;
  }

  update(deltaTime: number) {
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // 更新位置
      this.positions[i3] += this.velocities[i3] * deltaTime;
      this.positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
      this.positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime;

      // 边界检测
      if (Math.abs(this.positions[i3]) > 5) this.velocities[i3] *= -1;
      if (Math.abs(this.positions[i3 + 1]) > 5) this.velocities[i3 + 1] *= -1;
      if (Math.abs(this.positions[i3 + 2]) > 5) this.velocities[i3 + 2] *= -1;
    }
  }

  render() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.positions, this.gl.DYNAMIC_DRAW);

    // 设置属性指针
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);

    // 绘制点
    this.gl.drawArrays(this.gl.POINTS, 0, this.particleCount);
  }
}
```

---

## 面试要点

### 常见问题

**Q1：WebGL 的渲染管线流程？**

1. 顶点着色器：处理顶点数据（位置、颜色、法线等）
2. 图元装配：将顶点组装成图元（点、线、三角形）
3. 光栅化：将图元转换为片段
4. 片段着色器：处理每个片段（像素）的颜色
5. 测试与混合：深度测试、模板测试、颜色混合
6. 帧缓冲：输出到屏幕

**Q2：如何优化 WebGL 性能？**

1. 批量绘制：减少 draw call
2. 实例化渲染：绘制多个相同物体
3. 纹理图集：减少纹理切换
4. LOD（细节层次）：根据距离调整模型精度
5. 视锥剔除：不绘制视野外的物体
6. 遮挡剔除：不绘制被遮挡的物体

**Q3：WebGL 1.0 和 WebGL 2.0 的区别？**

| 特性 | WebGL 1.0 | WebGL 2.0 |
|------|-----------|-----------|
| 基于 | OpenGL ES 2.0 | OpenGL ES 3.0 |
| 3D 纹理 | 不支持 | 支持 |
| 实例化渲染 | 扩展 | 原生支持 |
| 多重渲染目标 | 扩展 | 原生支持 |
| 变换反馈 | 不支持 | 支持 |

---

## 参考资料

### 官方文档

- [WebGL Specification](https://www.khronos.org/webgl/)
- [MDN WebGL API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API)

### 学习资源

- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Learning WebGL](http://learningwebgl.com/)
- [The Book of Shaders](https://thebookofshaders.com/)

### 工具库

- [Three.js](https://threejs.org/) - 3D 库
- [Babylon.js](https://www.babylonjs.com/) - 游戏引擎
- [PixiJS](https://pixijs.com/) - 2D 渲染引擎
