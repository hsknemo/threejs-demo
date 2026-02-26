// 地热突破 - 立方体热力图（最底层）
// 宽度 50，高度 20，深度 50，使用顶点颜色模拟温度分布与波动
import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";

/**
 * 根据 0-1 数值返回地热温度颜色
 * 0: 深蓝（低温）-> 青 -> 绿 -> 黄 -> 红（高温）
 */
function getHeatColor(value) {
  value = Math.max(0, Math.min(1, value));

  const stops = [
    { pos: 0.0, r: 0, g: 32, b: 128 }, // 深蓝
    { pos: 0.25, r: 0, g: 160, b: 255 }, // 青
    { pos: 0.5, r: 0, g: 220, b: 0 }, // 绿
    { pos: 0.75, r: 255, g: 220, b: 0 }, // 黄
    { pos: 1.0, r: 255, g: 32, b: 0 }, // 红
  ];

  let lower = stops[0];
  let upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (value >= stops[i].pos && value <= stops[i + 1].pos) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const range = upper.pos - lower.pos || 1;
  const ratio = (value - lower.pos) / range;

  const r = lower.r + (upper.r - lower.r) * ratio;
  const g = lower.g + (upper.g - lower.g) * ratio;
  const b = lower.b + (upper.b - lower.b) * ratio;

  return new THREE.Color(r / 255, g / 255, b / 255);
}

export default {
  name: "cubeHot",
  // 几何尺寸
  width: 50,
  height: 5,
  depth: 50,
  // 网格细分
  segmentsX: 30,
  segmentsY: 10,
  segmentsZ: 30,
  // 动画参数
  time: 0,
  waveSpeed: 0.5,
  waveAmplitude: 0.2,
  // 破裂效果参数
  ruptureTime: 0,
  ruptureHeight: 0,
  ruptureSpeed: 0.15,
  // Three 对象引用
  mesh: null,

  /**
   * 创建一个 50x20x50 的地热立方体
   * 放置在最底部，模拟从下往上的热突破
   */
  layout(scene) {
    const geometry = new THREE.BoxGeometry(
      this.width,
      this.height,
      this.depth,
      this.segmentsX,
      this.segmentsY,
      this.segmentsZ,
    );

    const positions = geometry.attributes.position;
    const colors = [];
    const baseValues = [];

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // 归一化坐标 (0~1)
      const nx = (x + this.width / 2) / this.width;
      const ny = (y + this.height / 2) / this.height;
      const nz = (z + this.depth / 2) / this.depth;

      // 底部热源：Y 越低温度越高
      const bottomHeat = 1.0 - ny;

      // 模拟"突破口"：右下方热量最高
      const breakthroughX = 0.7;
      const breakthroughZ = 0.3;
      const dx = nx - breakthroughX;
      const dz = nz - breakthroughZ;
      const breakthroughDist = Math.sqrt(dx * dx + dz * dz);
      const breakthrough = Math.exp(-breakthroughDist * 8) * 0.8;

      // 边缘热量衰减
      const edgeFade = Math.min(nx, 1 - nx) * Math.min(nz, 1 - nz) * 4;
      const edgeHeat = Math.min(1, edgeFade);

      // 基础温度场
      let base = bottomHeat * 0.6 + breakthrough * 0.4;
      base = base * edgeHeat;
      base = Math.max(0, Math.min(1, base));

      baseValues.push(base);

      const color = getHeatColor(base);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    geometry.userData.baseValues = baseValues;

    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = this.name;

    // 放置在最底部
    this.mesh.position.set(0, -23, 0);

    scene.add(this.mesh);
  },

  /**
   * 控制是否显示该地热层
   */
  setVisible() {
    const mesh = findMeshFromScene(this.name);
    if (mesh) {
      mesh.visible = !mesh.visible;
    }
  },

  /**
   * 每帧更新：模拟热突破波动效果和破裂效果
   */
  update(delta = 0.016) {
    if (!this.mesh) return;

    this.time += delta;
    this.ruptureTime += delta;

    const geometry = this.mesh.geometry;
    const baseValues = geometry.userData.baseValues || [];
    const colorsAttr = geometry.attributes.color;
    const colors = colorsAttr.array;
    const positions = geometry.attributes.position;

    // 计算破裂高度（周期性变化）
    this.ruptureHeight = Math.min(1, this.ruptureTime * this.ruptureSpeed);

    for (let i = 0; i < positions.count; i++) {
      const base = baseValues[i] || 0;

      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const nx = (x + this.width / 2) / this.width;
      const ny = (y + this.height / 2) / this.height;
      const nz = (z + this.depth / 2) / this.depth;

      // 从下往上的波动传播
      const waveY = ny * Math.PI * 3;
      const waveX = nx * Math.PI * 2;
      const waveZ = nz * Math.PI * 2;

      let wave =
        Math.sin(
          this.time * this.waveSpeed * 2.0 + waveY - waveX * 0.5 + waveZ * 0.3,
        ) * this.waveAmplitude;

      let value = base + wave;

      // 破裂效果：顶部区域变得更红更亮
      if (ny > 0.7) {
        const ruptureIntensity = ((ny - 0.7) / 0.3) * this.ruptureHeight;
        value = Math.min(1, value + ruptureIntensity * 0.5);
        // 额外的脉冲效果
        const pulse = Math.sin(this.ruptureTime * 5) * 0.1 * ruptureIntensity;
        value = Math.min(1, value + pulse);
      }

      value = Math.max(0, Math.min(1, value));

      const color = getHeatColor(value);
      const idx = i * 3;
      colors[idx] = color.r;
      colors[idx + 1] = color.g;
      colors[idx + 2] = color.b;
    }

    colorsAttr.needsUpdate = true;
  },
};
