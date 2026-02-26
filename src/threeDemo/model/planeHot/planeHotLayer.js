// 地质热突破 - 第一层地热图层（平面热力图）
// 宽度 50，高度 10，使用顶点颜色模拟温度分布与波动
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
  name: "planeHot",
  // 几何尺寸
  width: 50,
  height: 10,
  // 网格细分，控制热力图精细度
  segmentsX: 80,
  segmentsY: 20,
  // 动画参数
  time: 0,
  waveSpeed: 0.6,
  waveAmplitude: 0.25,
  // Three 对象引用
  mesh: null,

  /**
   * 在场景中创建一个 50x10 的地热平面
   * 横向（X）代表距离，纵向（Y）代表埋深
   */
  layout(scene) {
    const geometry = new THREE.PlaneGeometry(
      this.width,
      this.height,
      this.segmentsX,
      this.segmentsY,
    );

    const positions = geometry.attributes.position;
    const colors = [];
    const baseValues = [];

    // 预计算每个顶点的基础温度（类似静态地温场）
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);

      // X 方向：左冷右热
      const tx = (x + this.width / 2) / this.width; // 0~1
      // Y 方向：浅冷深热
      const ty = (y + this.height / 2) / this.height; // 0~1

      // 模拟一个“突破口”——靠右下角温度更高
      const hotspotX = 0.7;
      const hotspotY = 0.2;
      const dx = tx - hotspotX;
      const dy = ty - hotspotY;
      const dist2 = dx * dx + dy * dy;
      const hotspot = Math.exp(-dist2 * 20); // 越靠近突破口越热

      // 基础温度场：左右梯度 + 深度梯度 + 突破热点
      let base = tx * 0.5 + ty * 0.2 + hotspot * 0.6;
      base = Math.max(0, Math.min(1, base));

      baseValues.push(base);

      const color = getHeatColor(base);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    // 把基础温度存到 userData，后面动画只做微调
    geometry.userData.baseValues = baseValues;

    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = this.name;

    // 轻微倾斜，便于观察
    this.mesh.rotation.x = -Math.PI / 6;
    this.mesh.position.set(0, -10, 0);

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
   * 每帧更新：在基础温度上叠加缓慢波动，模拟热突破/流动
   */
  update(delta = 0.016) {
    if (!this.mesh) return;

    this.time += delta;

    const geometry = this.mesh.geometry;
    const baseValues = geometry.userData.baseValues || [];
    const colorsAttr = geometry.attributes.color;
    const colors = colorsAttr.array;
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const base = baseValues[i] || 0;

      // 沿 X 方向传播的热波
      const x = positions.getX(i);
      const tx = (x + this.width / 2) / this.width;

      const wave =
        Math.sin(this.time * this.waveSpeed * 2.0 + tx * Math.PI * 4.0) *
        this.waveAmplitude;

      let value = base + wave;
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
