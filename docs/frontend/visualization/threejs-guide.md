# Three.js 完全指南

> Three.js 3D 场景开发与实战 | 更新时间：2025-02

## 目录

- [Three.js 基础](#threejs-基础)
- [核心概念](#核心概念)
- [几何体与材质](#几何体与材质)
- [光源系统](#光源系统)
- [相机与控制器](#相机与控制器)
- [动画系统](#动画系统)
- [加载器](#加载器)
- [后期处理](#后期处理)
- [性能优化](#性能优化)
- [实战案例](#实战案例)

---

## Three.js 基础

### 1. Three.js 简介

Three.js 是一个基于 WebGL 的 JavaScript 3D 库，简化了 3D 图形开发。

```bash
# 安装
npm install three
```

```typescript
import * as THREE from 'three';

// 基础场景设置
class BasicScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    // 2. 创建相机
    this.camera = new THREE.PerspectiveCamera(
      75,                                    // 视野角度
      container.clientWidth / container.clientHeight,  // 宽高比
      0.1,                                   // 近裁剪面
      1000                                   // 远裁剪面
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    // 3. 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,                       // 抗锯齿
      alpha: true                            // 透明背景
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;  // 启用阴影
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. 添加光源
    this.setupLights();

    // 5. 添加辅助工具
    this.addHelpers();

    // 6. 响应式
    window.addEventListener('resize', this.onResize);

    // 7. 开始渲染
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
    
    // 阴影配置
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    
    this.scene.add(directionalLight);
  }

  private addHelpers() {
    // 坐标轴辅助
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // 网格辅助
    const gridHelper = new THREE.GridHelper(20, 20);
    this.scene.add(gridHelper);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  // 获取场景（用于添加物体）
  getScene(): THREE.Scene {
    return this.scene;
  }

  // 清理资源
  dispose() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}

// 使用
const container = document.getElementById('three-container')!;
const basicScene = new BasicScene(container);
```

---

## 核心概念

### 1. 场景图（Scene Graph）

```
Scene (场景)
├── Camera (相机)
├── Light (光源)
│   ├── AmbientLight (环境光)
│   ├── DirectionalLight (方向光)
│   └── PointLight (点光源)
├── Mesh (网格)
│   ├── Geometry (几何体)
│   └── Material (材质)
└── Group (组)
    ├── Mesh 1
    └── Mesh 2
```

### 2. 坐标系统

```typescript
// Three.js 使用右手坐标系
// X 轴：红色，向右为正
// Y 轴：绿色，向上为正
// Z 轴：蓝色，向外为正

// 设置物体位置
mesh.position.set(x, y, z);
mesh.position.x = 5;

// 设置物体旋转（弧度）
mesh.rotation.set(x, y, z);
mesh.rotation.y = Math.PI / 4;  // 旋转 45 度

// 设置物体缩放
mesh.scale.set(x, y, z);
mesh.scale.set(2, 2, 2);  // 放大 2 倍
```

---

## 几何体与材质

### 1. 内置几何体

```typescript
// 立方体
const boxGeometry = new THREE.BoxGeometry(2, 2, 2);

// 球体
const sphereGeometry = new THREE.SphereGeometry(
  1,      // 半径
  32,     // 水平分段数
  32      // 垂直分段数
);

// 圆柱体
const cylinderGeometry = new THREE.CylinderGeometry(
  1,      // 顶部半径
  1,      // 底部半径
  2,      // 高度
  32      // 径向分段数
);

// 圆锥体
const coneGeometry = new THREE.ConeGeometry(1, 2, 32);

// 圆环
const torusGeometry = new THREE.TorusGeometry(
  1,      // 半径
  0.4,    // 管道半径
  16,     // 径向分段数
  100     // 管道分段数
);

// 平面
const planeGeometry = new THREE.PlaneGeometry(10, 10);

// 自定义几何体
const customGeometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  -1, -1, 0,
   1, -1, 0,
   1,  1, 0,
  -1,  1, 0
]);
const indices = new Uint16Array([
  0, 1, 2,
  0, 2, 3
]);
customGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
customGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
customGeometry.computeVertexNormals();
```

### 2. 材质类型

```typescript
// 基础材质（不受光照影响）
const basicMaterial = new THREE.MeshBasicMaterial({
  color: 0x3498db,
  wireframe: false,
  transparent: false,
  opacity: 1.0
});

// Lambert 材质（漫反射）
const lambertMaterial = new THREE.MeshLambertMaterial({
  color: 0x3498db,
  emissive: 0x000000,
  emissiveIntensity: 0
});

// Phong 材质（镜面反射）
const phongMaterial = new THREE.MeshPhongMaterial({
  color: 0x3498db,
  specular: 0x111111,
  shininess: 30
});

// 标准材质（PBR）
const standardMaterial = new THREE.MeshStandardMaterial({
  color: 0x3498db,
  metalness: 0.5,    // 金属度
  roughness: 0.5,    // 粗糙度
  envMapIntensity: 1.0
});

// 物理材质（PBR 增强版）
const physicalMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x3498db,
  metalness: 0.5,
  roughness: 0.5,
  clearcoat: 1.0,           // 清漆层
  clearcoatRoughness: 0.1,
  transmission: 0.9,         // 透光性
  thickness: 0.5
});

// 卡通材质
const toonMaterial = new THREE.MeshToonMaterial({
  color: 0x3498db
});

// 法线材质（调试用）
const normalMaterial = new THREE.MeshNormalMaterial();

// 深度材质（调试用）
const depthMaterial = new THREE.MeshDepthMaterial();
```

### 3. 纹理贴图

```typescript
// 加载纹理
const textureLoader = new THREE.TextureLoader();

// 基础纹理
const texture = textureLoader.load('texture.jpg');

// 纹理配置
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(2, 2);
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.magFilter = THREE.LinearFilter;

// 应用纹理
const material = new THREE.MeshStandardMaterial({
  map: texture,                    // 颜色贴图
  normalMap: normalTexture,        // 法线贴图
  roughnessMap: roughnessTexture,  // 粗糙度贴图
  metalnessMap: metalnessTexture,  // 金属度贴图
  aoMap: aoTexture,                // 环境光遮蔽贴图
  displacementMap: dispTexture,    // 位移贴图
  emissiveMap: emissiveTexture     // 发光贴图
});

// 立方体纹理（环境贴图）
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMap = cubeTextureLoader.load([
  'px.jpg', 'nx.jpg',
  'py.jpg', 'ny.jpg',
  'pz.jpg', 'nz.jpg'
]);

material.envMap = envMap;
scene.background = envMap;
```

---

## 光源系统

### 1. 光源类型

```typescript
// 环境光（全局照明）
const ambientLight = new THREE.AmbientLight(
  0xffffff,  // 颜色
  0.5        // 强度
);
scene.add(ambientLight);

// 方向光（平行光）
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 点光源
const pointLight = new THREE.PointLight(
  0xff0000,  // 颜色
  1,         // 强度
  100,       // 距离
  2          // 衰减
);
pointLight.position.set(0, 5, 0);
pointLight.castShadow = true;
scene.add(pointLight);

// 聚光灯
const spotLight = new THREE.SpotLight(
  0xffffff,
  1,
  100,
  Math.PI / 6,  // 角度
  0.5,          // 半影
  2             // 衰减
);
spotLight.position.set(0, 10, 0);
spotLight.target.position.set(0, 0, 0);
spotLight.castShadow = true;
scene.add(spotLight);
scene.add(spotLight.target);

// 半球光（天空光）
const hemisphereLight = new THREE.HemisphereLight(
  0x87ceeb,  // 天空颜色
  0x8b4513,  // 地面颜色
  0.6        // 强度
);
scene.add(hemisphereLight);

// 矩形区域光
const rectAreaLight = new THREE.RectAreaLight(
  0xffffff,
  5,
  10,
  10
);
rectAreaLight.position.set(0, 5, 0);
rectAreaLight.lookAt(0, 0, 0);
scene.add(rectAreaLight);
```

### 2. 阴影配置

```typescript
// 启用渲染器阴影
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 光源投射阴影
directionalLight.castShadow = true;

// 阴影相机配置
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;

// 阴影贴图分辨率
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;

// 阴影偏移（解决阴影痤疮）
directionalLight.shadow.bias = -0.001;

// 物体投射阴影
mesh.castShadow = true;

// 物体接收阴影
ground.receiveShadow = true;
```

---

## 相机与控制器

### 1. 相机类型

```typescript
// 透视相机（模拟人眼）
const perspectiveCamera = new THREE.PerspectiveCamera(
  75,                    // 视野角度
  width / height,        // 宽高比
  0.1,                   // 近裁剪面
  1000                   // 远裁剪面
);

// 正交相机（无透视效果）
const orthographicCamera = new THREE.OrthographicCamera(
  -width / 2,            // 左
  width / 2,             // 右
  height / 2,            // 上
  -height / 2,           // 下
  0.1,                   // 近
  1000                   // 远
);

// 相机操作
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);
camera.up.set(0, 1, 0);
```

### 2. 控制器

```typescript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

// 轨道控制器（最常用）
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;        // 启用阻尼
orbitControls.dampingFactor = 0.05;
orbitControls.minDistance = 5;             // 最小距离
orbitControls.maxDistance = 50;            // 最大距离
orbitControls.maxPolarAngle = Math.PI / 2; // 最大俯仰角
orbitControls.enablePan = true;            // 启用平移
orbitControls.autoRotate = false;          // 自动旋转
orbitControls.autoRotateSpeed = 2.0;

// 在动画循环中更新
function animate() {
  orbitControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// 轨迹球控制器
const trackballControls = new TrackballControls(camera, renderer.domElement);
trackballControls.rotateSpeed = 1.0;
trackballControls.zoomSpeed = 1.2;
trackballControls.panSpeed = 0.8;

// 飞行控制器
const flyControls = new FlyControls(camera, renderer.domElement);
flyControls.movementSpeed = 10;
flyControls.rollSpeed = Math.PI / 24;
flyControls.autoForward = false;
flyControls.dragToLook = true;

// 第一人称控制器
const firstPersonControls = new FirstPersonControls(camera, renderer.domElement);
firstPersonControls.movementSpeed = 10;
firstPersonControls.lookSpeed = 0.1;
```

---

## 动画系统

### 1. 基础动画

```typescript
// 方法 1：requestAnimationFrame
let rotation = 0;

function animate() {
  rotation += 0.01;
  
  mesh.rotation.y = rotation;
  mesh.position.y = Math.sin(rotation) * 2;
  
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// 方法 2：Clock
const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = clock.getDelta();
  
  mesh.rotation.y = elapsedTime;
  mesh.position.y = Math.sin(elapsedTime) * 2;
  
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

### 2. 关键帧动画

```typescript
import { AnimationMixer, AnimationClip, VectorKeyframeTrack } from 'three';

// 创建关键帧轨道
const times = [0, 1, 2];
const values = [0, 0, 0,  5, 5, 5,  0, 0, 0];

const positionTrack = new VectorKeyframeTrack(
  '.position',
  times,
  values
);

// 创建动画剪辑
const clip = new AnimationClip('move', 2, [positionTrack]);

// 创建动画混合器
const mixer = new AnimationMixer(mesh);
const action = mixer.clipAction(clip);
action.play();

// 在动画循环中更新
const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  mixer.update(delta);
  
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

### 3. Tween 动画

```typescript
import TWEEN from '@tweenjs/tween.js';

// 创建补间动画
const tween = new TWEEN.Tween(mesh.position)
  .to({ x: 5, y: 5, z: 5 }, 2000)
  .easing(TWEEN.Easing.Quadratic.Out)
  .onUpdate(() => {
    // 更新回调
  })
  .onComplete(() => {
    // 完成回调
  })
  .start();

// 链式动画
tween.chain(
  new TWEEN.Tween(mesh.position)
    .to({ x: 0, y: 0, z: 0 }, 2000)
);

// 在动画循环中更新
function animate() {
  TWEEN.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```



---

## 加载器

### 1. 模型加载器

```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// GLTF/GLB 加载器（推荐）
const gltfLoader = new GLTFLoader();

gltfLoader.load(
  'model.glb',
  (gltf) => {
    const model = gltf.scene;
    
    // 设置模型
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    
    // 启用阴影
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    scene.add(model);
    
    // 播放动画
    if (gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
    }
  },
  (progress) => {
    console.log(`加载进度: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
  },
  (error) => {
    console.error('加载失败:', error);
  }
);

// FBX 加载器
const fbxLoader = new FBXLoader();

fbxLoader.load('model.fbx', (fbx) => {
  scene.add(fbx);
});

// OBJ 加载器
const objLoader = new OBJLoader();

objLoader.load('model.obj', (obj) => {
  scene.add(obj);
});
```

### 2. 纹理加载器

```typescript
import { TextureLoader } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

// 普通纹理
const textureLoader = new TextureLoader();
const texture = textureLoader.load('texture.jpg');

// HDR 环境贴图
const rgbeLoader = new RGBELoader();

rgbeLoader.load('environment.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  
  scene.background = texture;
  scene.environment = texture;
});

// 加载管理器
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = (url, loaded, total) => {
  console.log(`开始加载: ${url}`);
};

loadingManager.onLoad = () => {
  console.log('加载完成');
};

loadingManager.onProgress = (url, loaded, total) => {
  console.log(`加载进度: ${loaded}/${total}`);
};

loadingManager.onError = (url) => {
  console.error(`加载失败: ${url}`);
};

const loader = new GLTFLoader(loadingManager);
```

---

## 后期处理

### 1. 后期处理基础

```typescript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';

// 创建 Composer
const composer = new EffectComposer(renderer);

// 渲染通道
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 辉光效果
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,    // 强度
  0.4,    // 半径
  0.85    // 阈值
);
composer.addPass(bloomPass);

// 抗锯齿
const smaaPass = new SMAAPass(
  window.innerWidth * renderer.getPixelRatio(),
  window.innerHeight * renderer.getPixelRatio()
);
composer.addPass(smaaPass);

// 渲染
function animate() {
  composer.render();
  requestAnimationFrame(animate);
}
```

### 2. 常用后期效果

```typescript
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';

// 轮廓高亮
const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
);
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 1;
outlinePass.edgeThickness = 1;
outlinePass.visibleEdgeColor.set('#ffffff');
outlinePass.hiddenEdgeColor.set('#190a05');
composer.addPass(outlinePass);

// 环境光遮蔽（SSAO）
const ssaoPass = new SSAOPass(scene, camera, width, height);
ssaoPass.kernelRadius = 16;
ssaoPass.minDistance = 0.005;
ssaoPass.maxDistance = 0.1;
composer.addPass(ssaoPass);

// 景深效果
const bokehPass = new BokehPass(scene, camera, {
  focus: 1.0,
  aperture: 0.025,
  maxblur: 0.01
});
composer.addPass(bokehPass);

// 故障效果
const glitchPass = new GlitchPass();
composer.addPass(glitchPass);
```

---

## 性能优化

### 1. 几何体合并

```typescript
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

// 合并多个几何体
const geometries: THREE.BufferGeometry[] = [];

for (let i = 0; i < 100; i++) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  geometry.translate(
    Math.random() * 10 - 5,
    Math.random() * 10 - 5,
    Math.random() * 10 - 5
  );
  geometries.push(geometry);
}

const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
const mesh = new THREE.Mesh(mergedGeometry, material);
scene.add(mesh);
```

### 2. 实例化网格

```typescript
// 实例化网格（绘制大量相同物体）
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x3498db });

const count = 10000;
const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

const matrix = new THREE.Matrix4();
const color = new THREE.Color();

for (let i = 0; i < count; i++) {
  // 设置位置
  matrix.setPosition(
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
    Math.random() * 100 - 50
  );
  
  instancedMesh.setMatrixAt(i, matrix);
  
  // 设置颜色
  color.setHex(Math.random() * 0xffffff);
  instancedMesh.setColorAt(i, color);
}

scene.add(instancedMesh);
```

### 3. LOD（细节层次）

```typescript
// LOD 优化
const lod = new THREE.LOD();

// 高精度模型（近距离）
const highDetail = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  material
);
lod.addLevel(highDetail, 0);

// 中精度模型（中距离）
const mediumDetail = new THREE.Mesh(
  new THREE.SphereGeometry(1, 16, 16),
  material
);
lod.addLevel(mediumDetail, 10);

// 低精度模型（远距离）
const lowDetail = new THREE.Mesh(
  new THREE.SphereGeometry(1, 8, 8),
  material
);
lod.addLevel(lowDetail, 20);

scene.add(lod);
```

### 4. 视锥剔除

```typescript
// 视锥剔除（自动）
mesh.frustumCulled = true;

// 手动剔除
const frustum = new THREE.Frustum();
const cameraViewProjectionMatrix = new THREE.Matrix4();

function updateFrustum() {
  camera.updateMatrixWorld();
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
  cameraViewProjectionMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);
}

function isInFrustum(object: THREE.Object3D): boolean {
  return frustum.intersectsObject(object);
}
```

### 5. 纹理优化

```typescript
// 压缩纹理
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath('basis/');
ktx2Loader.detectSupport(renderer);

ktx2Loader.load('texture.ktx2', (texture) => {
  material.map = texture;
});

// 纹理尺寸优化
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

// 释放纹理
texture.dispose();
```

---

## 实战案例

### 1. 3D 产品展示

```typescript
class ProductViewer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private model: THREE.Group | null = null;

  constructor(container: HTMLElement) {
    // 初始化场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    // 初始化相机
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 5);

    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    container.appendChild(this.renderer.domElement);

    // 初始化控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    this.controls.maxPolarAngle = Math.PI / 2;

    // 添加光源
    this.setupLights();

    // 添加地面
    this.addGround();

    // 加载模型
    this.loadModel('product.glb');

    // 开始渲染
    this.animate();
  }

  private setupLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // 主光源
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);

    // 补光
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);
  }

  private addGround() {
    const geometry = new THREE.CircleGeometry(5, 32);
    const material = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private async loadModel(url: string) {
    const loader = new GLTFLoader();
    
    try {
      const gltf = await loader.loadAsync(url);
      this.model = gltf.scene;
      
      // 居中模型
      const box = new THREE.Box3().setFromObject(this.model);
      const center = box.getCenter(new THREE.Vector3());
      this.model.position.sub(center);
      
      // 启用阴影
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
        }
      });
      
      this.scene.add(this.model);
    } catch (error) {
      console.error('模型加载失败:', error);
    }
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  // 切换模型颜色
  changeColor(color: string) {
    if (!this.model) return;
    
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.color.set(color);
        }
      }
    });
  }

  // 旋转模型
  rotateModel(angle: number) {
    if (!this.model) return;
    
    new TWEEN.Tween(this.model.rotation)
      .to({ y: angle }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  }
}

// 使用
const container = document.getElementById('product-viewer')!;
const viewer = new ProductViewer(container);

// 切换颜色
document.getElementById('red')?.addEventListener('click', () => {
  viewer.changeColor('#e74c3c');
});

// 旋转
document.getElementById('rotate')?.addEventListener('click', () => {
  viewer.rotateModel(Math.PI * 2);
});
```

### 2. 粒子星空

```typescript
class StarField {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particles: THREE.Points;

  constructor(container: HTMLElement, count: number = 10000) {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 创建粒子
    this.particles = this.createParticles(count);
    this.scene.add(this.particles);

    this.animate();
  }

  private createParticles(count: number): THREE.Points {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // 位置
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;

      // 颜色
      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.7, 0.8);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // 大小
      sizes[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    return new THREE.Points(geometry, mater
ee.js 性能？**

1. 几何体合并：减少 draw call
2. 实例化网格：绘制大量相同物体
3. LOD：根据距离调整精度
4. 视锥剔除：不渲染视野外物体
5. 纹理优化：压缩纹理、合理尺寸
6. 后期处理：按需使用

**Q3：Three.js 和原生 WebGL 的区别？**

| 特性 | Three.js | WebGL |
|------|----------|-------|
| 学习曲线 | 简单 | 陡峭 |
| 开发效率 | 高 | 低 |
| 性能 | 略低 | 最优 |
| 功能 | 丰富 | 基础 |
| 适用场景 | 快速开发 | 极致性能 |

---

## 参考资料

### 官方资源

- [Three.js 官网](https://threejs.org/)
- [Three.js 文档](https://threejs.org/docs/)
- [Three.js 示例](https://threejs.org/examples/)

### 学习资源

- [Three.js Journey](https://threejs-journey.com/)
- [Discover Three.js](https://discoverthreejs.com/)
- [Three.js Fundamentals](https://threejsfundamentals.org/)

### 工具库

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) - React 集成
- [Drei](https://github.com/pmndrs/drei) - Three.js 辅助库
- [Cannon.js](https://github.com/schteppe/cannon.js) - 物理引擎
- [Ammo.js](https://github.com/kripken/ammo.js/) - 物理引擎
