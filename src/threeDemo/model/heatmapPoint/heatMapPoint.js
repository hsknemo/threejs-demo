// 热力图点云 - 密密麻麻、层级分明
import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";

/**
 * 根据数值获取热力图颜色
 * @param {number} value - 数值，范围 0-1
 * @returns {THREE.Color} - 对应的颜色
 */
function getHeatmapColor(value) {
  // 热力图颜色渐变：蓝（正常）-> 紫 -> 红（最高压力预警）
  const colors = [
    { pos: 0.0, r: 0, g: 0, b: 255 }, // 蓝色（正常/底部）
    { pos: 0.5, r: 128, g: 0, b: 128 }, // 紫色（中等压力）
    { pos: 1.0, r: 255, g: 0, b: 0 }, // 红色（最高压力预警/顶部）
  ];

  // 确保值在0-1范围内
  value = Math.max(0, Math.min(1, value));

  // 找到value所在的颜色区间
  let lower = colors[0];
  let upper = colors[colors.length - 1];

  for (let i = 0; i < colors.length - 1; i++) {
    if (value >= colors[i].pos && value <= colors[i + 1].pos) {
      lower = colors[i];
      upper = colors[i + 1];
      break;
    }
  }

  // 计算在区间内的插值比例
  const range = upper.pos - lower.pos;
  const ratio = range === 0 ? 0 : (value - lower.pos) / range;

  // 线性插值计算颜色
  const r = Math.round(lower.r + (upper.r - lower.r) * ratio);
  const g = Math.round(lower.g + (upper.g - lower.g) * ratio);
  const b = Math.round(lower.b + (upper.b - lower.b) * ratio);

  return new THREE.Color(r / 255, g / 255, b / 255);
}

export default {
  name: "heatMapPoint",
  // 点云对象
  points: null,
  // 点数据
  data: [],
  // 点数量
  pointCount: 100000,
  // 立方体范围 - 长方体：宽50，高50，深50
  rangeX: 25,
  rangeY: 25,
  rangeZ: 25,
  // 存储每个点的初始位置和速度
  pointData: [],
  // 压力值（0-1），用于动画
  pressure: 0,
  // 压力变化方向
  pressureDirection: 1,
  // 压力变化速度
  pressureSpeed: 0.008,
  // 间隔
  density: 25,
  /**
   * 初始化热力图点云
   * @param {THREE.Scene} scene - Three.js 场景对象
   * @param {Object} config - 配置参数
   */
  layout(scene, config) {
    // 如果传入了配置，覆盖默认配置
    if (config) {
      Object.assign(this, config);
    }

    // 创建点云几何体
    const geometry = new THREE.BufferGeometry();

    // 生成随机点数据
    this.generatePointData();

    // 创建位置数组
    const positions = [];
    // 创建颜色数组
    const colors = [];

    // 初始化每个点
    for (let i = 0; i < this.pointCount; i++) {
      const p = this.pointData[i];

      // 设置位置
      positions.push(p.x, p.y, p.z);

      // 根据初始热度值设置颜色
      const color = getHeatmapColor(p.heat);
      colors.push(color.r, color.g, color.b);
    }

    // 设置位置属性
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );

    // 设置颜色属性
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    // 创建点云材质 - 减小点大小以实现密密麻麻效果
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    // 创建点云对象
    this.points = new THREE.Points(geometry, material);

    // 设置点云名称
    this.points.name = this.name;

    // 将点云添加到场景
    scene.add(this.points);
  },
  /**
   * 生成点数据 - 行列分布，层级分明
   */
  generatePointData() {
    this.pointData = [];

    // 行列网格分布参数 - 稍微密集一点
    const density = this.density; // 每行/列的点数
    const halfX = this.rangeX;
    const halfY = this.rangeY;
    const halfZ = this.rangeZ;

    // 生成3D网格点 - 行列分布
    for (let ix = 0; ix < density; ix++) {
      for (let iy = 0; iy < density; iy++) {
        for (let iz = 0; iz < density; iz++) {
          // 计算位置：在范围内均匀分布
          const x = (ix / (density - 1) - 0.5) * 2 * halfX;
          const y = (iy / (density - 1) - 0.5) * 2 * halfY;
          const z = (iz / (density - 1) - 0.5) * 2 * halfZ;

          // 添加微小的随机偏移，让点云更自然
          const jitter = 0.3;
          const jx = (Math.random() - 0.5) * jitter;
          const jy = (Math.random() - 0.5) * jitter;
          const jz = (Math.random() - 0.5) * jitter;

          const px = x + jx;
          const py = y + jy;
          const pz = z + jz;

          // 根据Y轴位置计算热度：从下到上（蓝->红）
          // Y范围是 -25 到 25，映射到 0 到 1
          const normalizedY = (py + this.rangeY) / (2 * this.rangeY);
          const baseHeat = Math.max(0, Math.min(1, normalizedY));

          // 随机相位
          const phase = Math.random() * Math.PI * 2;

          this.pointData.push({
            x: px,
            y: py,
            z: pz,
            baseHeat,
            phase,
          });
        }
      }
    }

    // 更新点数量
    this.pointCount = this.pointData.length;
  },
  /**
   * 切换热力图点云可见性
   */
  setVisible() {
    let mesh = findMeshFromScene(this.name);
    mesh.visible = !mesh.visible;
  },
  /**
   * 更新热力图点云动画 - 体现压力变化
   * 每一帧调用此方法
   */
  update() {
    if (!this.points) return;

    // 更新压力值（0-1之间循环变化）
    this.pressure += this.pressureSpeed * this.pressureDirection;

    // 压力达到上下限时反转方向
    if (this.pressure >= 1) {
      this.pressure = 1;
      this.pressureDirection = -1;
    } else if (this.pressure <= 0) {
      this.pressure = 0;
      this.pressureDirection = 1;
    }

    // 获取颜色数组
    const colors = this.points.geometry.attributes.color.array;
    const time = Date.now() * 0.001;

    // 更新每个点的颜色
    for (let i = 0; i < this.pointCount; i++) {
      const p = this.pointData[i];

      // 计算热力值（基础热度 + 压力效果 + 脉动效果）
      const pulse = Math.sin(time * 4 + p.phase) * 0.08 * p.baseHeat;
      const pressureEffect = this.pressure * 0.25;
      let heat = p.baseHeat + pressureEffect + pulse;
      heat = Math.max(0, Math.min(1, heat));

      // 根据热度更新颜色
      const color = getHeatmapColor(heat);
      const i3 = i * 3;
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    // 标记颜色属性需要更新
    this.points.geometry.attributes.color.needsUpdate = true;
  },
  /**
   * 设置压力变化速度
   * @param {number} speed - 压力变化速度
   */
  setPressureSpeed(speed) {
    this.pressureSpeed = speed;
  },
  /**
   * 重新生成点数据
   */
  regenerate() {
    this.generatePointData();
  },
};
