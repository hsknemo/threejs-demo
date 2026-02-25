// 热力图 - 分布在立方体内部，带压力动画效果
import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";

/**
 * 根据数值获取热力图颜色
 * @param {number} value - 数值，范围 0-1
 * @returns {THREE.Color} - 对应的颜色
 */
function getHeatmapColor(value) {
  // 热力图颜色渐变：蓝 -> 青 -> 绿 -> 黄 -> 红
  const colors = [
    { pos: 0.0, r: 0, g: 0, b: 255 }, // 蓝色（低温）
    { pos: 0.25, r: 0, g: 255, b: 255 }, // 青色
    { pos: 0.5, r: 0, g: 255, b: 0 }, // 绿色
    { pos: 0.75, r: 255, g: 255, b: 0 }, // 黄色
    { pos: 1.0, r: 255, g: 0, b: 0 }, // 红色（高温/高压）
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
  name: "heatLayer",
  // 立方体尺寸
  width: 50,
  height: 50,
  depth: 50,
  // 每个面的网格细分
  segmentsX: 30,
  segmentsY: 30,
  // 热力图数据点
  data: [],
  // 存储六个面的网格数组
  faceMeshes: [],
  // 存储六个面的数据
  faceData: [],
  // 压力值（0-1），用于动画
  pressure: 0,
  // 压力变化方向
  pressureDirection: 1,
  // 压力变化速度
  pressureSpeed: 0.01,
  /**
   * 初始化热力图数据
   * @param {Array} dataPoints - 数据点数组，格式：[{x, y, z, value, radius}, ...]
   */
  setData(dataPoints) {
    this.data = dataPoints;
  },
  /**
   * 生成高斯分布的热力图数据
   * @param {Array} points - 中心点数组
   */
  generateGaussianData(points, width, height, depth) {
    // 初始化网格数据
    const gridData = [];
    const segX = this.segmentsX;
    const segY = this.segmentsY;

    for (let i = 0; i <= segY; i++) {
      gridData[i] = [];
      for (let j = 0; j <= segX; j++) {
        gridData[i][j] = 0;
      }
    }

    // 对每个中心点计算高斯影响
    points.forEach((point) => {
      const { x, y, z, value, radius } = point;

      for (let i = 0; i <= segY; i++) {
        for (let j = 0; j <= segX; j++) {
          // 计算网格点坐标
          const gridX = (j / segX) * width - width / 2;
          const gridY = (i / segY) * height - height / 2;

          // 计算到中心点的距离
          const dx = gridX - x;
          const dy = gridY - y;
          const dz = z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // 高斯函数计算影响值
          if (distance < radius) {
            const gaussian = Math.exp(
              -(distance * distance) / (2 * (radius / 3) * (radius / 3)),
            );
            const contribution = value * gaussian;
            gridData[i][j] = Math.min(1, gridData[i][j] + contribution);
          }
        }
      }
    });

    return gridData;
  },
  /**
   * 创建热力图网格
   * @param {THREE.Scene} scene - Three.js 场景对象
   */
  layout(scene) {
    // 定义六个面的配置
    const faces = [
      {
        name: "right",
        pos: new THREE.Vector3(this.width / 2, 0, 0),
        rot: new THREE.Euler(0, Math.PI / 2, 0),
        size: { w: this.depth, h: this.height },
      },
      {
        name: "left",
        pos: new THREE.Vector3(-this.width / 2, 0, 0),
        rot: new THREE.Euler(0, -Math.PI / 2, 0),
        size: { w: this.depth, h: this.height },
      },
      {
        name: "top",
        pos: new THREE.Vector3(0, this.height / 2, 0),
        rot: new THREE.Euler(-Math.PI / 2, 0, 0),
        size: { w: this.width, h: this.depth },
      },
      {
        name: "bottom",
        pos: new THREE.Vector3(0, -this.height / 2, 0),
        rot: new THREE.Euler(Math.PI / 2, 0, 0),
        size: { w: this.width, h: this.depth },
      },
      {
        name: "front",
        pos: new THREE.Vector3(0, 0, this.depth / 2),
        rot: new THREE.Euler(0, 0, 0),
        size: { w: this.width, h: this.height },
      },
      {
        name: "back",
        pos: new THREE.Vector3(0, 0, -this.depth / 2),
        rot: new THREE.Euler(0, Math.PI, 0),
        size: { w: this.width, h: this.height },
      },
    ];

    // 默认热力点数据
    const defaultPoints = [
      { x: -15, y: -15, z: 0, value: 1.0, radius: 20 },
      { x: 15, y: 15, z: 0, value: 0.8, radius: 18 },
      { x: -15, y: 15, z: 0, value: 0.6, radius: 15 },
      { x: 15, y: -15, z: 0, value: 0.4, radius: 12 },
    ];

    // 创建六个面的热力图
    faces.forEach((face, faceIndex) => {
      // 为每个面生成不同的数据点（模拟从不同位置产生的压力）
      const facePoints = defaultPoints.map((p, i) => ({
        x: p.x * (faceIndex % 2 === 0 ? 1 : -1),
        y: p.y,
        z: 0,
        value: p.value,
        radius: p.radius,
      }));

      // 生成高斯分布数据
      const gridData = this.generateGaussianData(
        facePoints,
        face.size.w,
        face.size.h,
        0,
      );

      // 创建平面几何体
      const geometry = new THREE.PlaneGeometry(
        face.size.w,
        face.size.h,
        this.segmentsX,
        this.segmentsY,
      );

      // 获取位置属性并设置颜色
      const positions = geometry.attributes.position;
      const colors = [];

      for (let i = 0; i < positions.count; i++) {
        // 计算顶点在网格中的索引
        const ix = i % (this.segmentsX + 1);
        const iy = Math.floor(i / (this.segmentsX + 1));
        const value = gridData[iy] ? gridData[iy][ix] || 0 : 0;

        const color = getHeatmapColor(value);
        colors.push(color.r, color.g, color.b);
      }

      // 设置顶点颜色
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3),
      );

      // 创建材质
      const material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });

      // 创建网格
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(face.pos);
      mesh.rotation.copy(face.rot);
      mesh.name = `${this.name}_${face.name}`;

      // 存储网格和原始颜色数据
      mesh.userData.faceIndex = faceIndex;
      mesh.userData.originalColors = [...colors];
      mesh.userData.gridData = gridData;

      this.faceMeshes.push(mesh);
      this.faceData.push({ gridData, faceIndex });

      scene.add(mesh);
    });
  },
  /**
   * 更新热力图颜色动画 - 体现压力变化
   * 每一帧调用此方法
   */
  update() {
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

    // 对每个面进行颜色动画更新
    this.faceMeshes.forEach((mesh, faceIndex) => {
      const originalColors = mesh.userData.originalColors;
      const gridData = mesh.userData.gridData;
      const positions = mesh.geometry.attributes.position;
      const newColors = [];

      for (let i = 0; i < positions.count; i++) {
        const ix = i % (this.segmentsX + 1);
        const iy = Math.floor(i / (this.segmentsX + 1));
        const baseValue = gridData[iy] ? gridData[iy][ix] || 0 : 0;

        // 将基础值与压力值结合，产生波动效果
        // 使用正弦波产生脉动效果
        const time = Date.now() * 0.001;
        const pulse = Math.sin(time * 2 + faceIndex * 0.5) * 0.15;
        const pressureEffect = this.pressure * 0.5;

        // 计算最终值
        let value = baseValue + pressureEffect + pulse;
        value = Math.max(0, Math.min(1, value));

        const color = getHeatmapColor(value);
        newColors.push(color.r, color.g, color.b);
      }

      // 更新顶点颜色
      mesh.geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(newColors, 3),
      );
      mesh.geometry.attributes.color.needsUpdate = true;
    });
  },
  /**
   * 设置压力变化速度
   * @param {number} speed - 压力变化速度
   */
  setPressureSpeed(speed) {
    this.pressureSpeed = speed;
  },
  /**
   * 动态更新热力图数据
   * @param {Array} points - 新的数据点
   */
  updateHeatmapData(points) {
    const faces = [
      { size: { w: this.depth, h: this.height } },
      { size: { w: this.depth, h: this.height } },
      { size: { w: this.width, h: this.depth } },
      { size: { w: this.width, h: this.depth } },
      { size: { w: this.width, h: this.height } },
      { size: { w: this.width, h: this.height } },
    ];

    this.faceMeshes.forEach((mesh, faceIndex) => {
      const facePoints = points.map((p, i) => ({
        x: p.x * (faceIndex % 2 === 0 ? 1 : -1),
        y: p.y,
        z: p.z || 0,
        value: p.value,
        radius: p.radius,
      }));

      const gridData = this.generateGaussianData(
        facePoints,
        faces[faceIndex].size.w,
        faces[faceIndex].size.h,
        0,
      );
      mesh.userData.gridData = gridData;
    });
  },
  setVisible() {
    this.faceMeshes.forEach((mesh) => {
      mesh.visible = !mesh.visible;
    });
  },
};
