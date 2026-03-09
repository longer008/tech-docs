# 前端可视化技术

> WebGL、Three.js、ECharts、Canvas 数据可视化与图形渲染 | 更新时间：2025-02

## 目录

- [Canvas 基础](#canvas-基础)
- [WebGL 核心](#webgl-核心)
- [Three.js 3D 开发](#threejs-3d-开发)
- [ECharts 数据可视化](#echarts-数据可视化)
- [性能优化](#性能优化)
- [实战案例](#实战案例)

---

## Canvas 基础

### 1. Canvas 基本用法

```html
<canvas id="myCanvas" width="800" height="600"></canvas>
```

```typescript
// 获取 Canvas 上下文
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// 绘制矩形
ctx.fillStyle = '#3498db';
ctx.fillRect(50, 50, 200, 100);

// 绘制圆形
ctx.beginPath();
ctx.arc(400, 300, 50, 0, Math.PI * 2);
ctx.fillStyle = '#e74c3c';
ctx.fill();

// 绘制线条
ctx.beginPath();
ctx.moveTo(100, 100);
ctx.lineTo(300, 200);
ctx.strokeStyle = '#2ecc71';
ctx.lineWidth = 3;
ctx.stroke();

// 绘制文字
ctx.font = '30px Arial';
ctx.fillStyle = '#34495e';
ctx.fillText('Hello Canvas', 100, 400);

// 绘制图片
const img = new Image();
img.onload = () => {
  ctx.drawImage(img, 0, 0, 200, 150);
};
img.src = 'image.jpg';
```

### 2. Canvas 动画

```typescript
// 粒子系统
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.radius = Math.random() * 3 + 1;
    this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
  }

  update(canvas: HTMLCanvasElement) {
    this.x += this.vx;
    this.y += this.vy;

    // 边界检测
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// 粒子系统管理
class ParticleSystem {
  particles: Particle[] = [];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, count: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // 创建粒子
    for (let i = 0; i < count; i++) {
      this.particles.push(
        new Particle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        )
      );
    }

    this.animate();
  }

  animate = () => {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 更新和绘制粒子
    this.particles.forEach(particle => {
      particle.update(this.canvas);
      particle.draw(this.ctx);
    });

    // 绘制连线
    this.drawConnections();

    requestAnimationFrame(this.animate);
  };

  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  }
}

// 使用
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const particleSystem = new ParticleSystem(canvas, 100);
```


### 3. Canvas 离屏渲染

```typescript
// 离屏 Canvas 优化
class OffscreenRenderer {
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private mainCanvas: HTMLCanvasElement;
  private mainCtx: CanvasRenderingContext2D;

  constructor(mainCanvas: HTMLCanvasElement) {
    this.mainCanvas = mainCanvas;
    this.mainCtx = mainCanvas.getContext('2d')!;

    // 创建离屏 Canvas
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = mainCanvas.width;
    this.offscreenCanvas.height = mainCanvas.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
  }

  // 在离屏 Canvas 上绘制
  drawOffscreen() {
    // 复杂的绘制操作
    for (let i = 0; i < 1000; i++) {
      this.offscreenCtx.fillStyle = `hsl(${i % 360}, 70%, 60%)`;
      this.offscreenCtx.fillRect(
        Math.random() * this.offscreenCanvas.width,
        Math.random() * this.offscreenCanvas.height,
        10,
        10
      );
    }
  }

  // 复制到主 Canvas
  render() {
    this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    this.mainCtx.drawImage(this.offscreenCanvas, 0, 0);
  }
}
```

---

## WebGL 核心

### 1. WebGL 基础

```typescript
// 初始化 WebGL
function initWebGL(canvas: HTMLCanvasElement): WebGLRenderingContext {
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) {
    throw new Error('WebGL not supported');
  }

  return gl as WebGLRenderingContext;
}

// 创建着色器
function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error('Shader compilation failed');
  }

  return shader;
}

// 创建程序
function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram {
  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error('Program linking failed');
  }

  return program;
}

// 顶点着色器
const vertexShaderSource = `
  attribute vec4 a_position;
  attribute vec4 a_color;
  varying vec4 v_color;

  void main() {
    gl_Position = a_position;
    v_color = a_color;
  }
`;

// 片段着色器
const fragmentShaderSource = `
  precision mediump float;
  varying vec4 v_color;

  void main() {
    gl_FragColor = v_color;
  }
`;

// 使用示例
const canvas = document.getElementById('webglCanvas') as HTMLCanvasElement;
const gl = initWebGL(canvas);

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// 设置顶点数据
const positions = new Float32Array([
  0.0,  0.5,
  -0.5, -0.5,
  0.5, -0.5
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

// 绘制
gl.useProgram(program);

const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 3);
```

### 2. WebGL 纹理

```typescript
// 加载纹理
function loadTexture(
  gl: WebGLRenderingContext,
  url: string
): WebGLTexture {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 临时填充 1x1 像素
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

    // 生成 mipmap
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
```


---

## Three.js 3D 开发

### 1. Three.js 基础

```typescript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// 基础场景设置
class ThreeScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  constructor(container: HTMLElement) {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // 添加控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // 添加光源
    this.setupLights();

    // 添加网格
    this.addGrid();

    // 响应式
    window.addEventListener('resize', this.onResize);

    // 开始渲染
    this.animate();
  }

  private setupLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // 方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // 点光源
    const pointLight = new THREE.PointLight(0xff0000, 1, 100);
    pointLight.position.set(0, 5, 0);
    this.scene.add(pointLight);
  }

  private addGrid() {
    const gridHelper = new THREE.GridHelper(20, 20);
    this.scene.add(gridHelper);
  }

  // 添加立方体
  addCube() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3498db,
      metalness: 0.5,
      roughness: 0.5
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    this.scene.add(cube);
    return cube;
  }

  // 添加球体
  addSphere() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xe74c3c,
      metalness: 0.7,
      roughness: 0.3
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(3, 1, 0);
    sphere.castShadow = true;
    this.scene.add(sphere);
    return sphere;
  }

  // 加载模型
  async loadModel(url: string) {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
    const loader = new GLTFLoader();

    return new Promise<THREE.Group>((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          this.scene.add(gltf.scene);
          resolve(gltf.scene);
        },
        undefined,
        reject
      );
    });
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    // 更新控制器
    this.controls.update();

    // 渲染场景
    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    const container = this.renderer.domElement.parentElement!;
    
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(container.clientWidth, container.clientHeight);
  };

  dispose() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}

// 使用
const container = document.getElementById('three-container')!;
const threeScene = new ThreeScene(container);

// 添加物体
const cube = threeScene.addCube();
const sphere = threeScene.addSphere();

// 动画
function animateObjects() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  
  sphere.position.y = Math.sin(Date.now() * 0.001) * 2 + 1;
  
  requestAnimationFrame(animateObjects);
}
animateObjects();
```

### 2. Three.js 粒子系统

```typescript
// 粒子系统
class ParticleSystem3D {
  private scene: THREE.Scene;
  private particles: THREE.Points;

  constructor(scene: THREE.Scene, count: number) {
    this.scene = scene;

    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // 位置
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // 颜色
      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.7, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // 大小
      sizes[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // 创建材质
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    // 创建粒子系统
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  animate() {
    this.particles.rotation.y += 0.001;
    this.particles.rotation.x += 0.0005;
  }
}
```

### 3. Three.js 后期处理

```typescript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// 后期处理
class PostProcessing {
  private composer: EffectComposer;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) {
    // 创建 Composer
    this.composer = new EffectComposer(renderer);

    // 渲染通道
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // 辉光效果
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,  // 强度
      0.4,  // 半径
      0.85  // 阈值
    );
    this.composer.addPass(bloomPass);
  }

  render() {
    this.composer.render();
  }

  setSize(width: number, height: number) {
    this.composer.setSize(width, height);
  }
}
```


---

## ECharts 数据可视化

### 1. ECharts 基础

```typescript
import * as echarts from 'echarts';

// 初始化图表
const chartDom = document.getElementById('chart')!;
const myChart = echarts.init(chartDom);

// 柱状图配置
const barOption = {
  title: {
    text: '销售数据统计',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['2022', '2023', '2024'],
    top: 30
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '2022',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110],
      itemStyle: { color: '#3498db' }
    },
    {
      name: '2023',
      type: 'bar',
      data: [150, 230, 180, 100, 90, 130],
      itemStyle: { color: '#2ecc71' }
    },
    {
      name: '2024',
      type: 'bar',
      data: [180, 260, 210, 120, 110, 150],
      itemStyle: { color: '#e74c3c' }
    }
  ]
};

myChart.setOption(barOption);

// 响应式
window.addEventListener('resize', () => {
  myChart.resize();
});
```

### 2. ECharts 折线图

```typescript
// 折线图配置
const lineOption = {
  title: {
    text: '温度变化趋势'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['最高气温', '最低气温']
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value} °C'
    }
  },
  series: [
    {
      name: '最高气温',
      type: 'line',
      data: [11, 11, 15, 13, 12, 13, 10],
      smooth: true,
      itemStyle: { color: '#e74c3c' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(231, 76, 60, 0.5)' },
          { offset: 1, color: 'rgba(231, 76, 60, 0.1)' }
        ])
      }
    },
    {
      name: '最低气温',
      type: 'line',
      data: [1, -2, 2, 5, 3, 2, 0],
      smooth: true,
      itemStyle: { color: '#3498db' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(52, 152, 219, 0.5)' },
          { offset: 1, color: 'rgba(52, 152, 219, 0.1)' }
        ])
      }
    }
  ]
};

myChart.setOption(lineOption);
```

### 3. ECh
