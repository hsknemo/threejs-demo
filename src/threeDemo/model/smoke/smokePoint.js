// 烟雾粒子
import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";

export default {
  name: "smokePointLayer",
  // 粒子数量
  particleCount: 2000,
  // 粒子大小
  particleSize: 0.2,
  // 扩散半径，控制烟雾分布范围
  spreadRadius: 30,
  // 上升速度，控制烟雾上升的快慢
  riseSpeed: 0.02,
  // 扩散速度，控制烟雾水平扩散的速度
  spreadSpeed: 0.05,
  // 透明度，控制烟雾的透明程度
  opacity: 0.4,
  // 烟雾颜色
  color: "red",
  // 粒子系统对象
  particles: null,
  // 存储每个粒子的速度向量 [vx, vy, vz, vx, vy, vz, ...]
  velocities: null,
  /**
   * 创建烟雾粒子系统并添加到场景
   * @param {THREE.Scene} scene - Three.js 场景对象
   */
  layout(scene) {
    // 创建缓冲区几何体，用于存储粒子位置
    const geometry = new THREE.BufferGeometry();
    // 存储所有粒子的位置数据 [x, y, z, x, y, z, ...]
    const positions = [];
    // 存储所有粒子的速度数据 [vx, vy, vz, vx, vy, vz, ...]
    const velocities = [];

    // 遍历创建指定数量的粒子
    for (let i = 0; i < this.particleCount; i++) {
      // 随机生成粒子在x轴的位置，范围在 -spreadRadius/2 到 spreadRadius/2 之间
      const x = (Math.random() - 0.5) * this.spreadRadius;
      // 随机生成粒子在y轴的位置，范围在 0 到 spreadRadius*0.5 之间（初始在底部区域）
      const y = Math.random() * this.spreadRadius * 0.5;
      // 随机生成粒子在z轴的位置，范围在 -spreadRadius/2 到 spreadRadius/2 之间
      const z = (Math.random() - 0.5) * this.spreadRadius;

      // 将粒子位置添加到positions数组
      positions.push(x, y, z);

      // 设置粒子的速度分量
      // vx: x轴速度，随机正负方向的扩散速度
      // vy: y轴速度，基础上升速度 + 随机增量，使粒子上升速度略有不同
      // vz: z轴速度，随机正负方向的扩散速度
      velocities.push(
        (Math.random() - 0.5) * this.spreadSpeed,
        this.riseSpeed + Math.random() * this.riseSpeed * 0.5,
        (Math.random() - 0.5) * this.spreadSpeed,
      );
    }

    // 将位置数据设置为几何体的position属性
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );

    // 保存速度数据，用于后续更新粒子位置
    this.velocities = velocities;

    // 创建粒子材质
    const material = new THREE.PointsMaterial({
      // 粒子颜色
      color: this.color,
      // 粒子大小
      size: this.particleSize,
      // 启用透明
      transparent: true,
      // 透明度
      opacity: this.opacity,
      // 关闭深度写入，解决粒子透明时的遮挡问题
      depthWrite: false,
      // 使用加法混合，增强粒子重叠时的发光效果
      blending: THREE.AdditiveBlending,
      // 启用大小衰减，使远处的粒子看起来更小
      sizeAttenuation: true,
    });

    // 创建粒子系统对象
    this.particles = new THREE.Points(geometry, material);
    // 设置粒子系统名称
    this.particles.name = this.name;
    // 将粒子系统添加到场景
    scene.add(this.particles);
  },
  /**
   * 切换烟雾粒子的可见性
   */
  setVisible() {
    let mesh = findMeshFromScene(this.name);
    mesh.visible = !mesh.visible;
  },
  /**
   * 更新粒子位置，实现烟雾上升动画
   * 需要在每一帧调用此方法
   */
  update() {
    // 如果粒子系统不存在，则直接返回
    if (!this.particles) return;

    // 获取粒子位置数组的引用
    const positions = this.particles.geometry.attributes.position.array;
    // 获取速度数组的引用
    const velocities = this.velocities;

    // 遍历所有粒子，更新每个粒子的位置
    for (let i = 0; i < this.particleCount; i++) {
      // 计算当前粒子在数组中的索引位置（每个粒子有3个坐标值）
      const i3 = i * 3;

      // 更新粒子位置：当前位置 += 速度
      // positions[i3]     是粒子的x坐标
      // positions[i3 + 1] 是粒子的y坐标
      // positions[i3 + 2] 是粒子的z坐标
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // 检查粒子是否超过最大高度
      if (positions[i3 + 1] > this.spreadRadius * 0.5) {
        // 粒子超过高度后，重置到起始位置，形成循环动画
        // 重置x坐标到随机位置
        positions[i3] = (Math.random() - 0.5) * this.spreadRadius;
        // 重置y坐标到底部（从0开始重新上升）
        positions[i3 + 1] = 0;
        // 重置z坐标到随机位置
        positions[i3 + 2] = (Math.random() - 0.5) * this.spreadRadius;
      }
    }

    // 标记位置数据需要更新，通知GPU重新渲染
    this.particles.geometry.attributes.position.needsUpdate = true;
  },
};
