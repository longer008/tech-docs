# Canvas 完全指南

> Canvas 2D 图形绘制与动画开发 | 更新时间：2025-02

## 目录

- [Canvas 基础](#canvas-基础)
- [绘图 API](#绘图-api)
- [动画开发](#动画开发)
- [性能优化](#性能优化)
- [实战案例](#实战案例)
- [面试要点](#面试要点)

---

## Canvas 基础

### 1. Canvas 简介

Canvas 是 HTML5 提供的用于绘制图形的 API，通过 JavaScript 可以在网页上绘制 2D 图形。

```html
<canvas id="myCanvas" width="800" height="600">
  您的浏览器不支持 Canvas
</canvas>
```

```typescript
// 获取 Canvas 元素和上下文
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// 设置 Canvas 尺寸（考虑设备像素比）
function setupCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
}

setupCanvas(canvas);
```

### 2. 坐标系统

```
┌─────────────────────────────────────────────────────────────┐
│                    Canvas 坐标系                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  (0,0) ────────────────────────> X 轴                       │
│    │                                                         │
│    │                                                         │
│    │                                                         │
│    │                                                         │
│    │                                                         │
│    ↓                                                         │
│  Y 轴                                                        │
│                                                              │
│  原点在左上角                                                │
│  X 轴向右为正                                                │
│  Y 轴向下为正                                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 绘图 API

### 1. 基本图形

```typescript
// 矩形
ctx.fillStyle = '#3498db';
ctx.fillRect(50, 50, 200, 100);  // 填充矩形

ctx.strokeStyle = '#e74c3c';
ctx.lineWidth = 3;
ctx.strokeRect(300, 50, 200, 100);  // 描边矩形

ctx.clearRect(350, 60, 100, 80);  // 清除矩形区域

// 圆形和弧线
ctx.beginPath();
ctx.arc(150, 300, 50, 0, Math.PI * 2);  // 完整圆形
ctx.fillStyle = '#2ecc71';
ctx.fill();

ctx.beginPath();
ctx.arc(300, 300, 50, 0, Math.PI);  // 半圆
ctx.strokeStyle = '#9b59b6';
ctx.lineWidth = 3;
ctx.stroke();

// 椭圆
ctx.beginPath();
ctx.ellipse(450, 300, 80, 50, 0, 0, Math.PI * 2);
ctx.fillStyle = '#f39c12';
ctx.fill();

// 线条
ctx.beginPath();
ctx.moveTo(50, 450);
ctx.lineTo(150, 500);
ctx.lineTo(250, 450);
ctx.lineTo(350, 500);
ctx.strokeStyle = '#34495e';
ctx.lineWidth = 2;
ctx.stroke();

// 贝塞尔曲线
ctx.beginPath();
ctx.moveTo(400, 450);
ctx.quadraticCurveTo(450, 400, 500, 450);  // 二次贝塞尔
ctx.strokeStyle = '#e67e22';
ctx.lineWidth = 2;
ctx.stroke();

ctx.beginPath();
ctx.moveTo(550, 450);
ctx.bezierCurveTo(600, 400, 650, 500, 700, 450);  // 三次贝塞尔
ctx.strokeStyle = '#1abc9c';
ctx.lineWidth = 2;
ctx.stroke();
```

### 2. 文本绘制

```typescript
// 基础文本
ctx.font = '30px Arial';
ctx.fillStyle = '#2c3e50';
ctx.fillText('Hello Canvas', 50, 50);

// 描边文本
ctx.strokeStyle = '#e74c3c';
ctx.lineWidth = 2;
ctx.strokeText('Stroke Text', 50, 100);

// 文本对齐
ctx.textAlign = 'left';    // left, right, center, start, end
ctx.textBaseline = 'top';  // top, middle, bottom, alphabetic, hanging

// 测量文本宽度
const text = 'Measure Me';
const metrics = ctx.measureText(text);
console.log('文本宽度:', metrics.width);

// 多行文本
function drawMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

// 使用
ctx.font = '16px Arial';
ctx.fillStyle = '#34495e';
drawMultilineText(
  ctx,
  'This is a long text that will be wrapped into multiple lines automatically',
  50,
  150,
  300,
  20
);
```

### 3. 图片绘制

```typescript
// 加载图片
const img = new Image();
img.onload = () => {
  // 绘制原始图片
  ctx.drawImage(img, 0, 0);

  // 缩放图片
  ctx.drawImage(img, 0, 0, 200, 150);

  // 裁剪图片
  ctx.drawImage(
    img,
    50, 50,      // 源图片裁剪起点
    100, 100,    // 源图片裁剪尺寸
    300, 0,      // 目标位置
    150, 150     // 目标尺寸
  );
};
img.src = 'image.jpg';

// 图片滤镜
function applyFilter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  filter: (r: number, g: number, b: number, a: number) => [number, number, number, number]
) {
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = filter(data[i], data[i + 1], data[i + 2], data[i + 3]);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  }

  ctx.putImageData(imageData, x, y);
}

// 灰度滤镜
applyFilter(ctx, 0, 0, canvas.width, canvas.height, (r, g, b, a) => {
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  return [gray, gray, gray, a];
});

// 反色滤镜
applyFilter(ctx, 0, 0, canvas.width, canvas.height, (r, g, b, a) => {
  return [255 - r, 255 - g, 255 - b, a];
});
```

### 4. 渐变和图案

```typescript
// 线性渐变
const linearGradient = ctx.createLinearGradient(0, 0, 200, 0);
linearGradient.addColorStop(0, '#3498db');
linearGradient.addColorStop(0.5, '#9b59b6');
linearGradient.addColorStop(1, '#e74c3c');

ctx.fillStyle = linearGradient;
ctx.fillRect(50, 50, 200, 100);

// 径向渐变
const radialGradient = ctx.createRadialGradient(400, 100, 10, 400, 100, 80);
radialGradient.addColorStop(0, '#ffffff');
radialGradient.addColorStop(1, '#3498db');

ctx.fillStyle = radialGradient;
ctx.fillRect(300, 50, 200, 100);

// 图案填充
const patternImg = new Image();
patternImg.onload = () => {
  const pattern = ctx.createPattern(patternImg, 'repeat')!;
  ctx.fillStyle = pattern;
  ctx.fillRect(50, 200, 200, 100);
};
patternImg.src = 'pattern.png';
```

### 5. 变换

```typescript
// 保存和恢复状态
ctx.save();

// 平移
ctx.translate(100, 100);
ctx.fillRect(0, 0, 50, 50);

// 旋转
ctx.rotate(Math.PI / 4);
ctx.fillRect(0, 0, 50, 50);

// 缩放
ctx.scale(2, 2);
ctx.fillRect(0, 0, 50, 50);

// 恢复状态
ctx.restore();

// 矩阵变换
ctx.setTransform(1, 0, 0, 1, 0, 0);  // 重置变换矩阵
ctx.transform(1, 0.5, -0.5, 1, 30, 10);  // 应用变换
```

---

## 动画开发

### 1. 基础动画

```typescript
// 动画循环
class Animation {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  start() {
    this.animate();
  }

  stop() {
    cancelAnimationFrame(this.animationId);
  }

  private animate = () => {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制内容
 = radius;
    this.color = color;
  }

  update(canvas: HTMLCanvasElement) {
    // 应用重力
    this.vy += this.gravity;

    // 更新位置
    this.x += this.vx;
    this.y += this.vy;

    // 边界检测和反弹
    if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.vx *= -this.bounce;
    }
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -this.bounce;
    }
    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.vy *= -this.bounce;
    }
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy *= -this.bounce;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// 弹球动画系统
class BallAnimation extends Animation {
  private balls: Ball[] = [];

  constructor(canvas: HTMLCanvasElement, ballCount: number) {
    super(canvas);

    // 创建弹球
    for (let i = 0; i < ballCount; i++) {
      this.balls.push(
        new Ball(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 20 + 10,
          `hsl(${Math.random() * 360}, 70%, 60%)`
        )
      );
    }
  }

  protected draw() {
    this.balls.forEach(ball => {
      ball.update(this.canvas);
      ball.draw(this.ctx);
    });
  }
}

// 使用
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const ballAnimation = new BallAnimation(canvas, 20);
ballAnimation.start();
```

### 3. 粒子系统

```typescript
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    
    this.maxLife = Math.random() * 60 + 30;
    this.life = this.maxLife;
    this.size = Math.random() * 3 + 1;
    this.color = `hsl(${Math.random() * 60 + 15}, 100%, 60%)`;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1;  // 重力
    this.life--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    ctx.globalAlpha = 1;
  }

  isDead(): boolean {
    return this.life <= 0;
  }
}

class ParticleSystem {
  private particles: Particle[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // 监听点击事件
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.emit(x, y, 50);
    });

    this.animate();
  }

  emit(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y));
    }
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 更新和绘制粒子
    this.particles = this.particles.filter(particle => {
      particle.update();
      particle.draw(this.ctx);
      return !particle.isDead();
    });

    requestAnimationFrame(this.animate);
  };
}

// 使用
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const particleSystem = new ParticleSystem(canvas);
```


---

## 性能优化

### 1. 离屏渲染

```typescript
// 离屏 Canvas 优化
class OffscreenCanvasRenderer {
  private mainCanvas: HTMLCanvasElement;
  private mainCtx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;

  constructor(mainCanvas: HTMLCanvasElement) {
    this.mainCanvas = mainCanvas;
    this.mainCtx = mainCanvas.getContext('2d')!;

    // 创建离屏 Canvas
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = mainCanvas.width;
    this.offscreenCanvas.height = mainCanvas.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
  }

  // 在离屏 Canvas 上绘制复杂图形
  drawComplex() {
    this.offscreenCtx.clearRect(
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height
    );

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

### 2. 分层渲染

```typescript
// 多层 Canvas 优化
class LayeredCanvas {
  private container: HTMLElement;
  private layers: Map<string, HTMLCanvasElement> = new Map();

  constructor(container: HTMLElement, width: number, height: number) {
    this.container = container;
    container.style.position = 'relative';
  }

  createLayer(name: string, zIndex: number): CanvasRenderingContext2D {
    const canvas = document.createElement('canvas');
    canvas.width = this.container.clientWidth;
    canvas.height = this.container.clientHeight;
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.zIndex = zIndex.toString();

    this.container.appendChild(canvas);
    this.layers.set(name, canvas);

    return canvas.getContext('2d')!;
  }

  getLayer(name: string): CanvasRenderingContext2D | null {
    const canvas = this.layers.get(name);
    return canvas ? canvas.getContext('2d') : null;
  }

  clearLayer(name: string) {
    const canvas = this.layers.get(name);
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}

// 使用
const container = document.getElementById('canvas-container')!;
const layered = new LayeredCanvas(container, 800, 600);

// 背景层（不经常变化）
const bgCtx = layered.createLayer('background', 1);
bgCtx.fillStyle = '#1a1a1a';
bgCtx.fillRect(0, 0, 800, 600);

// 内容层（经常变化）
const contentCtx = layered.createLayer('content', 2);

// UI 层（最上层）
const uiCtx = layered.createLayer('ui', 3);
```

### 3. 局部刷新

```typescript
// 局部刷新优化
class DirtyRectRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dirtyRects: Set<DirtyRect> = new Set();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  markDirty(x: number, y: number, width: number, height: number) {
    this.dirtyRects.add({ x, y, width, height });
  }

  render(drawFn: (ctx: CanvasRenderingContext2D, rect: DirtyRect) => void) {
    this.dirtyRects.forEach(rect => {
      // 只清除脏区域
      this.ctx.clearRect(rect.x, rect.y, rect.width, rect.height);

      // 设置裁剪区域
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
      this.ctx.clip();

      // 绘制
      drawFn(this.ctx, rect);

      this.ctx.restore();
    });

    this.dirtyRects.clear();
  }
}

interface DirtyRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### 4. 对象池

```typescript
// 对象池优化
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 10) {
    this.createFn = createFn;
    this.resetF
 },
  100
);

// 获取粒子
const particle = particlePool.acquire();
particle.x = 100;
particle.y = 100;

// 释放粒子
particlePool.release(particle);
```

---

## 实战案例

### 1. 签名板

```typescript
class SignaturePad {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.setupCanvas();
    this.bindEvents();
  }

  private setupCanvas() {
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  private bindEvents() {
    this.canvas.addEventListener('mousedown', this.startDrawing);
    this.canvas.addEventListener('mousemove', this.draw);
    this.canvas.addEventListener('mouseup', this.stopDrawing);
    this.canvas.addEventListener('mouseout', this.stopDrawing);

    // 触摸事件
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
    this.canvas.addEventListener('touchend', this.stopDrawing);
  }

  private startDrawing = (e: MouseEvent) => {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
  };

  private draw = (e: MouseEvent) => {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  };

  private stopDrawing = () => {
    this.isDrawing = false;
  };

  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    this.isDrawing = true;
    this.lastX = touch.clientX - rect.left;
    this.lastY = touch.clientY - rect.top;
  };

  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (!this.isDrawing) return;

    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  };

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  toDataURL(type: string = 'image/png'): string {
    return this.canvas.toDataURL(type);
  }

  toBlob(callback: BlobCallback, type: string = 'image/png') {
    this.canvas.toBlob(callback, type);
  }
}

// 使用
const canvas = document.getElementById('signature') as HTMLCanvasElement;
const signaturePad = new SignaturePad(canvas);

// 清除按钮
document.getElementById('clear')?.addEventListener('click', () => {
  signaturePad.clear();
});

// 保存按钮
document.getElementById('save')?.addEventListener('click', () => {
  const dataURL = signaturePad.toDataURL();
  const link = document.createElement('a');
  link.download = 'signature.png';
  link.href = dataURL;
  link.click();
});
```

### 2. 图片裁剪器

```typescript
class ImageCropper {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement | null = null;
  private cropArea: CropArea = { x: 0, y: 0, width: 200, height: 200 };
  private isDragging: boolean = false;
  private dragStart: { x: number; y: number } = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.bindEvents();
  }

  loadImage(src: string) {
    const img = new Image();
    img.onload = () => {
      this.image = img;
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      this.render();
    };
    img.src = src;
  }

  private bindEvents() {
    this.canvas.addEventListener('mousedown', this.startDrag);
    this.canvas.addEventListener('mousemove', this.drag);
    this.canvas.addEventListener('mouseup', this.stopDrag);
  }

  private startDrag = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否点击在裁剪区域内
    if (
      x >= this.cropArea.x &&
      x <= this.cropArea.x + this.cropArea.width &&
      y >= this.cropArea.y &&
      y <= this.cropArea.y + this.cropArea.height
    ) {
      this.isDragging = true;
      this.dragStart = { x: x - this.cropArea.x, y: y - this.cropArea.y };
    }
  };

  private drag = (e: MouseEvent) => {
    if (!this.isDragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.cropArea.x = x - this.dragStart.x;
    this.cropArea.y = y - this.dragStart.y;

    // 边界限制
    this.cropArea.x = Math.max(0, Math.min(this.cropArea.x, this.canvas.width - this.cropArea.width));
    this.cropArea.y = Math.max(0, Math.min(this.cropArea.y, this.canvas.height - this.cropArea.height));

    this.render();
  };

  private stopDrag = () => {
    this.isDragging = false;
  };

  private render() {
    if (!this.image) return;

    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制图片
    this.ctx.drawImage(this.image, 0, 0);

    // 绘制遮罩
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 清除裁剪区域的遮罩
    this.ctx.clearRect(
      this.cropArea.x,
      this.cropArea.y,
      this.cropArea.width,
      this.cropArea.height
    );

    // 重新绘制裁剪区域的图片
    this.ctx.drawImage(
      this.image,
      this.cropArea.x,
      this.cropArea.y,
      this.cropArea.width,
      this.cropArea.height,
      this.cropArea.x,
      this.cropArea.y,
      this.cropArea.width,
      this.cropArea.height
    );

    // 绘制裁剪框
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      this.cropArea.x,
      this.cropArea.y,
      this.cropArea.width,
      this.cropArea.height
    );
  }

  crop(): HTMLCanvasElement {
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = this.cropArea.width;
    croppedCanvas.height = this.cropArea.height;
    const croppedCtx = croppedCanvas.getContext('2d')!;

    if (this.image) {
      croppedCtx.drawImage(
        this.image,
        this.cropArea.x,
        this.cropArea.y,
        this.cropArea.width,
        this.cropArea.height,
        0,
        0,
        this.cropArea.width,
        this.cropArea.height
      );
    }

    return croppedCanvas;
  }
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

---

## 面试要点

### 常见问题

**Q1：Canvas 和 SVG 的区别？**

| 特性 | Canvas | SVG |
|------|--------|-----|
| 渲染方式 | 位图（像素） | 矢量图 |
| 性能 | 适合大量元素 | 适合少量元素 |
| 交互 | 需要手动实现 | 原生支持事件 |
| 缩放 | 会失真 | 不失真 |
| 适用场景 | 游戏、动画、图表 | 图标、地图、图形编辑 |

**Q2：如何优化 Canvas 性能？**

1. 离屏渲染：复杂图形先在离屏 Canvas 绘制
2. 分层渲染：静态内容和动态内容分层
3. 局部刷新：只重绘变化的区域
4. 对象池：复用对象，减少 GC
5. 避免频繁状态切换：批量设置样式
6. 使用 requestAnimationFrame：同步浏览器刷新率

**Q3：Canvas 如何实现高清显示？**

```typescript
function setupHDCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
}
```

---

## 参考资料

### 官方文档

- [MDN Canvas API](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
- [HTML5 Canvas 教程](https://www.w3schools.com/html/html5_canvas.asp)

### 学习资源

- [Canvas 从入门到精通](https://juejin.cn/post/6844903815627669512)
- [Canvas 性能优化](https://www.html5rocks.com/zh/tutorials/canvas/performance/)

### 开源库

- [Fabric.js](http://fabricjs.com/) - Canvas 对象模型库
- [Konva.js](https://konvajs.org/) - 2D Canvas 框架
- [Paper.js](http://paperjs.org/) - 矢量图形脚本框架
