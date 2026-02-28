// 立方体场景模块 - 包含白色线框立方体、坐标轴、双柱体渐变、粒子流动画
import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";

/**
 * 获取渐变颜色函数
 * 颜色从红(底部/起点) -> 橙 -> 黄 -> 绿(顶部/终点)
 * @param {number} value - 0-1之间的数值，表示位置比例
 * @returns {THREE.Color} 渐变后的颜色对象
 */
function getGradientColor(value) {
  // 限制值在0-1范围内
  value = Math.max(0, Math.min(1, value));

  // 定义渐变色卡：位置0-红色，位置0.33-橙色，位置0.66-黄色，位置1-绿色
  const colors = [
    { pos: 0, r: 255, g: 0, b: 0 }, // 红色 - 代表起点/底部/低压
    { pos: 0.33, r: 255, g: 128, b: 0 }, // 橙色 - 过渡色
    { pos: 0.66, r: 255, g: 255, b: 0 }, // 黄色
    { pos: 1, r: 0, g: 255, b: 0 }, // 绿色 - 代表终点/顶部/高压
  ];

  // 初始化边界颜色
  let lower = colors[0];
  let upper = colors[colors.length - 1];

  // 查找value所在的颜色区间
  for (let i = 0; i < colors.length - 1; i++) {
    if (value >= colors[i].pos && value <= colors[i + 1].pos) {
      lower = colors[i];
      upper = colors[i + 1];
      break;
    }
  }

  // 计算在上下颜色之间的插值比例
  const ratio = (value - lower.pos) / (upper.pos - lower.pos || 1);

  // 线性插值计算RGB值
  const r = lower.r + (upper.r - lower.r) * ratio;
  const g = lower.g + (upper.g - lower.g) * ratio;
  const b = lower.b + (upper.b - lower.b) * ratio;

  // 转换为Three.js颜色对象(0-1范围)
  return new THREE.Color(r / 255, g / 255, b / 255);
}

// 导出场景配置对象
export default {
  // 模块名称
  name: "sceneCube",

  // 立方体尺寸参数
  width: 50, // 立方体宽度
  height: 50, // 立方体高度
  depth: 50, // 立方体深度

  // 柱体参数
  pillarRadius: 3, // 柱体半径
  pillarHeight: 40, // 柱体高度
  pillarOffset: 15, // 柱体偏移量(向上移动的距离，使柱头顶部露出立方体)
  pillarRadialSegments: 32, // 柱体径向分段数(决定圆柱光滑程度)
  pillarHeightSegments: 32, // 柱体高度分段数

  // 粒子流参数
  particleCount: 500, // 粒子数量
  flowSpeed: 0.15, // 粒子流动速度

  // 场景对象引用(用于更新和显示控制)
  wireframeBox: null, // 线框立方体
  axesHelper: null, // 坐标轴
  pillars: [], // 柱体数组(存储两根柱体)

  // 底部弧形粒子流相关
  rightParticleStream: null, // 底部弧形粒子流点云对象
  rightParticleCurve: null, // 底部弧形粒子流曲线
  rightParticleOffsets: null, // 底部粒子随机偏移量数组

  // 左侧柱子上行粒子流相关
  leftParticleStream: null, // 左侧柱子上行粒子流点云对象
  leftParticleCurve: null, // 左侧柱子上行粒子流曲线
  leftParticleOffsets: null, // 左侧粒子随机偏移量数组

  // 右侧柱子上行粒子流相关
  rightDownParticleStream: null, // 右侧柱子上行粒子流点云对象
  rightDownParticleCurve: null, // 右侧柱子上行粒子流曲线
  rightDownParticleOffsets: null, // 右侧粒子随机偏移量数组

  /**
   * 布局函数 - 初始化场景中的所有3D对象
   * @param {THREE.Scene} scene - Three.js场景对象
   */
  layout(scene) {
    // ==================== 1. 创建白色线框立方体 ====================
    // 使用BoxGeometry创建立方体几何体
    const cubeGeometry = new THREE.BoxGeometry(
      this.width, // 宽度50
      this.height, // 高度50
      this.depth, // 深度50
    );

    // ==================== 2. 创建坐标轴 ====================
    // AxesHelper创建三轴坐标指示器(X红、Y绿、Z蓝)
    this.axesHelper = new THREE.AxesHelper(15); // 15表示轴的长度
    this.axesHelper.name = `${this.name}_axes`;
    scene.add(this.axesHelper);

    // ==================== 3. 创建两根垂直渐变柱体 ====================
    // 定义两根柱子的x轴位置(左右对称分布)
    const pillarPositions = [
      { x: -this.pillarOffset, z: 0 }, // 左侧柱子位置 x=-15
      { x: this.pillarOffset, z: 0 }, // 右侧柱子位置 x=15
    ];

    // 遍历创建两根柱体
    pillarPositions.forEach((pos, i) => {
      // 创建圆柱几何体(上半径稍大形成锥形效果)
      const geometry = new THREE.CylinderGeometry(
        this.pillarRadius, // 顶部半径3
        this.pillarRadius * 1.2, // 底部半径3.6(略大)
        this.pillarHeight, // 高度40
        this.pillarRadialSegments, // 径向分段32
        this.pillarHeightSegments, // 高度分段32
      );

      // 获取几何体的位置属性
      const positions = geometry.attributes.position;
      const colors = []; // 存储每个顶点的颜色

      // 为每个顶点设置渐变色(基于y轴高度)
      for (let j = 0; j < positions.count; j++) {
        // 获取顶点y坐标(范围从 -pillarHeight/2 到 +pillarHeight/2)
        const y = positions.getY(j);
        // 将y坐标映射到0-1范围(底部0 -> 顶部1)
        const t = (y + this.pillarHeight / 2) / this.pillarHeight;
        // 获取对应位置的渐变色
        const color = getGradientColor(t);
        // 存储RGB值
        colors.push(color.r, color.g, color.b);
      }

      // 将颜色数组添加到几何体属性中(顶点颜色)
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3),
      );

      // 创建材质(使用顶点颜色，透明效果)
      const material = new THREE.MeshBasicMaterial({
        vertexColors: true, // 启用顶点颜色
        transparent: true, // 开启透明
        opacity: 0.15, // 透明度0.15(非常透明以便看到内部粒子)
        side: THREE.DoubleSide, // 双面可见
      });

      // 创建柱体网格
      const pillar = new THREE.Mesh(geometry, material);
      // 设置柱体位置(y轴偏移使柱头顶部露出立方体)
      pillar.position.set(pos.x, this.pillarOffset, pos.z);
      pillar.name = `${this.name}_pillar_${i}`; // 名称用于标识
      scene.add(pillar); // 添加到场景
      this.pillars.push(pillar); // 存入数组备用
    });

    // ==================== 4. 创建底部弧形粒子流 ====================
    // 弧形粒子流连接左右两根柱子的底部，从右向左流动

    // 定义弧形起点(右侧柱子底部)
    const rightBase = new THREE.Vector3(
      this.pillarOffset, // x = 15
      -this.pillarHeight / 2 + this.pillarOffset, // y = -20 + 15 = -5(柱子底部)
      0, // z = 0
    );

    // 定义弧形终点(左侧柱子底部)
    const leftBase = new THREE.Vector3(
      -this.pillarOffset, // x = -15
      -this.pillarHeight / 2 + this.pillarOffset, // y = -5
      0, // z = 0
    );

    // 创建二次贝塞尔曲线(起点、控制点、终点)
    // 控制点在中间正下方，形成弧形
    const rightCurve = new THREE.QuadraticBezierCurve3(
      rightBase, // 起点(右侧柱底)
      new THREE.Vector3(0, -this.pillarHeight / 2 + this.pillarOffset - 10, 0), // 控制点(中间下方)
      leftBase, // 终点(左侧柱底)
    );
    this.rightParticleCurve = rightCurve;

    // 创建粒子偏移数组(增加随机性使粒子散布在曲线周围)
    const rightOffsets = [];
    // 创建缓冲区几何体
    const rightGeometry = new THREE.BufferGeometry();
    const rightPositions = []; // 粒子位置数组
    const rightColors = []; // 粒子颜色数组

    // 生成粒子
    for (let i = 0; i < this.particleCount; i++) {
      // t从0到1表示粒子在曲线上的位置
      const t = i / (this.particleCount - 1);
      // 获取曲线上的点
      const point = rightCurve.getPoint(t);
      // 存储位置
      rightPositions.push(point.x, point.y, point.z);
      // 根据位置获取渐变色
      const color = getGradientColor(t);
      rightColors.push(color.r, color.g, color.b);
      // 随机偏移量(-0.75到0.75范围)
      rightOffsets.push({
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 1.5,
        z: (Math.random() - 0.5) * 1.5,
      });
    }

    // 设置几何体属性
    rightGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(rightPositions, 3),
    );
    rightGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(rightColors, 3),
    );

    // 创建粒子材质
    const rightMaterial = new THREE.PointsMaterial({
      size: 0.4, // 粒子大小
      vertexColors: true, // 使用顶点颜色
      transparent: true, // 开启透明
      opacity: 0.9, // 不透明度
      sizeAttenuation: true, // 距离衰减(远处变小)
      blending: THREE.AdditiveBlending, // 加法混合(粒子叠加发光效果)
    });

    // 创建粒子点云对象
    this.rightParticleStream = new THREE.Points(rightGeometry, rightMaterial);
    this.rightParticleStream.name = `${this.name}_right_particles`;
    this.rightParticleOffsets = rightOffsets;
    scene.add(this.rightParticleStream);

    // ==================== 5. 创建左侧柱子上行粒子流 ====================
    // 粒子从左侧柱子底部向上流动

    // 定义直线起点和终点
    const leftStart = new THREE.Vector3(
      -this.pillarOffset, // x = -15
      -this.pillarHeight / 2 + this.pillarOffset, // y = -5(底部)
      0,
    );
    const leftEnd = new THREE.Vector3(
      -this.pillarOffset, // x = -15
      this.pillarHeight / 2 + this.pillarOffset, // y = 35(顶部)
      0,
    );
    // 创建直线曲线
    this.leftParticleCurve = new THREE.LineCurve3(leftStart, leftEnd);

    // 创建粒子数据
    const leftOffsets = [];
    const leftGeometry = new THREE.BufferGeometry();
    const leftPositions = [];
    const leftColors = [];

    for (let i = 0; i < this.particleCount; i++) {
      const t = i / (this.particleCount - 1);
      const point = this.leftParticleCurve.getPoint(t);
      leftPositions.push(point.x, point.y, point.z);
      const color = getGradientColor(t);
      leftColors.push(color.r, color.g, color.b);
      leftOffsets.push({
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 1.5,
        z: (Math.random() - 0.5) * 1.5,
      });
    }

    leftGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(leftPositions, 3),
    );
    leftGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(leftColors, 3),
    );

    const leftMaterial = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    this.leftParticleStream = new THREE.Points(leftGeometry, leftMaterial);
    this.leftParticleStream.name = `${this.name}_left_particles`;
    this.leftParticleOffsets = leftOffsets;
    scene.add(this.leftParticleStream);

    // ==================== 6. 创建右侧柱子上行粒子流 ====================
    // 粒子从右侧柱子顶部向下流动(实际上是反向从底向上，但曲线方向相反)

    const rightDownStart = new THREE.Vector3(
      this.pillarOffset, // x = 15
      this.pillarHeight / 2 + this.pillarOffset, // y = 35(顶部)
      0,
    );
    const rightDownEnd = new THREE.Vector3(
      this.pillarOffset, // x = 15
      -this.pillarHeight / 2 + this.pillarOffset, // y = -5(底部)
      0,
    );
    this.rightDownParticleCurve = new THREE.LineCurve3(
      rightDownStart,
      rightDownEnd,
    );

    const rightDownOffsets = [];
    const rightDownGeometry = new THREE.BufferGeometry();
    const rightDownPositions = [];
    const rightDownColors = [];

    for (let i = 0; i < this.particleCount; i++) {
      const t = i / (this.particleCount - 1);
      const point = this.rightDownParticleCurve.getPoint(t);
      rightDownPositions.push(point.x, point.y, point.z);
      const color = getGradientColor(t);
      rightDownColors.push(color.r, color.g, color.b);
      rightDownOffsets.push({
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 1.5,
        z: (Math.random() - 0.5) * 1.5,
      });
    }

    rightDownGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(rightDownPositions, 3),
    );
    rightDownGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(rightDownColors, 3),
    );

    const rightDownMaterial = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    this.rightDownParticleStream = new THREE.Points(
      rightDownGeometry,
      rightDownMaterial,
    );
    this.rightDownParticleStream.name = `${this.name}_right_down_particles`;
    this.rightDownParticleOffsets = rightDownOffsets;
    scene.add(this.rightDownParticleStream);
  },

  /**
   * 可见性切换函数 - 切换所有元素的显示/隐藏状态
   */
  setVisible() {
    // 从场景中查找各组件
    const wireframe = findMeshFromScene(`${this.name}_wireframe`);
    const axes = findMeshFromScene(`${this.name}_axes`);
    const rightParticles = findMeshFromScene(`${this.name}_right_particles`);
    const leftParticles = findMeshFromScene(`${this.name}_left_particles`);

    // 切换可见性(!操作符取反)
    if (wireframe) wireframe.visible = !wireframe.visible;
    if (axes) axes.visible = !axes.visible;
    if (rightParticles) rightParticles.visible = !rightParticles.visible;
    if (leftParticles) leftParticles.visible = !leftParticles.visible;

    // 切换所有柱体的可见性
    this.pillars.forEach((p) => {
      p.visible = !p.visible;
    });
  },

  /**
   * 更新函数 - 每帧调用，更新粒子位置和颜色实现流动效果
   */
  update() {
    // 获取时间因子(秒 * 速度系数)
    const time = performance.now() * 0.001 * this.flowSpeed;

    // ==================== 更新底部弧形粒子流 ====================
    if (
      this.rightParticleStream &&
      this.rightParticleCurve &&
      this.rightParticleOffsets
    ) {
      // 获取位置和颜色属性数组
      const rightPositions =
        this.rightParticleStream.geometry.attributes.position;
      const rightColors =
        this.rightParticleStream.geometry.attributes.color.array;

      // 遍历更新每个粒子
      for (let i = 0; i < this.particleCount; i++) {
        // 计算粒子在曲线上的位置(加上时间实现流动)
        const tBase = i / (this.particleCount - 1 || 1);
        let t = tBase + time;
        // 处理循环(使粒子在到达终点后回到起点)
        while (t < 0) t += 1;
        while (t >= 1) t -= 1;

        // 获取曲线上的点
        const point = this.rightParticleCurve.getPoint(t);

        // 获取该粒子的随机偏移
        const offset = this.rightParticleOffsets[i];

        // 设置粒子位置(曲线点 + 偏移)
        rightPositions.setXYZ(
          i,
          point.x + offset.x,
          point.y + offset.y,
          point.z + offset.z,
        );

        // 更新粒子颜色(随位置变化)
        const color = getGradientColor(t);
        const i3 = i * 3;
        rightColors[i3] = color.r;
        rightColors[i3 + 1] = color.g;
        rightColors[i3 + 2] = color.b;
      }

      // 标记属性需要更新
      rightPositions.needsUpdate = true;
      this.rightParticleStream.geometry.attributes.color.needsUpdate = true;
    }

    // ==================== 更新左侧柱子上行粒子流 ====================
    if (
      this.leftParticleStream &&
      this.leftParticleCurve &&
      this.leftParticleOffsets
    ) {
      const leftPositions =
        this.leftParticleStream.geometry.attributes.position;
      const leftColors =
        this.leftParticleStream.geometry.attributes.color.array;

      for (let i = 0; i < this.particleCount; i++) {
        const tBase = i / (this.particleCount - 1 || 1);
        let t = tBase + time;
        while (t < 0) t += 1;
        while (t >= 1) t -= 1;
        const point = this.leftParticleCurve.getPoint(t);

        const offset = this.leftParticleOffsets[i];
        leftPositions.setXYZ(
          i,
          point.x + offset.x,
          point.y + offset.y,
          point.z + offset.z,
        );

        const color = getGradientColor(t);
        const i3 = i * 3;
        leftColors[i3] = color.r;
        leftColors[i3 + 1] = color.g;
        leftColors[i3 + 2] = color.b;
      }

      leftPositions.needsUpdate = true;
      this.leftParticleStream.geometry.attributes.color.needsUpdate = true;
    }

    // ==================== 更新右侧柱子上行粒子流 ====================
    if (
      this.rightDownParticleStream &&
      this.rightDownParticleCurve &&
      this.rightDownParticleOffsets
    ) {
      const rightDownPositions =
        this.rightDownParticleStream.geometry.attributes.position;
      const rightDownColors =
        this.rightDownParticleStream.geometry.attributes.color.array;

      for (let i = 0; i < this.particleCount; i++) {
        const tBase = i / (this.particleCount - 1 || 1);
        let t = tBase + time;
        while (t < 0) t += 1;
        while (t >= 1) t -= 1;
        const point = this.rightDownParticleCurve.getPoint(t);

        const offset = this.rightDownParticleOffsets[i];
        rightDownPositions.setXYZ(
          i,
          point.x + offset.x,
          point.y + offset.y,
          point.z + offset.z,
        );

        const color = getGradientColor(t);
        const i3 = i * 3;
        rightDownColors[i3] = color.r;
        rightDownColors[i3 + 1] = color.g;
        rightDownColors[i3 + 2] = color.b;
      }

      rightDownPositions.needsUpdate = true;
      this.rightDownParticleStream.geometry.attributes.color.needsUpdate = true;
    }
  },
};
