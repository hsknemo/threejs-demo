import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";
import TWEEN from "@tweenjs/tween.js";

// 挖掘机模型
export default {
  name: "excavatorMesh",
  materialConfig: {
    metalness: 0.3,
    roughness: 0.7,
    transparent: false,
    opacity: 1,
    depthTest: true,
    visible: true,
    side: THREE.DoubleSide,
  },

  // 动画状态
  animation: {
    bucketAngle: 0,
    bucketSpeed: 0.01,
    bucketDirection: 1,
    wheelRotation: 0,
    wheelSpeed: 0.02,
  },

  layout(scene) {
    //   纹理贴图
    const texture = new THREE.TextureLoader().load("/texture/wjjtt.png");
    const material = new THREE.MeshPhysicalMaterial(this.materialConfig);
    material.map = texture;

    // 创建挖掘机组
    const excavatorGroup = new THREE.Group();
    excavatorGroup.name = "excavatorGroup";

    // 创建车身
    const createBody = () => {
      const bodyGroup = new THREE.Group();

      // 底座
      const baseGeometry = new THREE.BoxGeometry(4, 1, 2);
      const base = new THREE.Mesh(baseGeometry, material);
      base.position.y = 0.5;
      bodyGroup.add(base);

      // 驾驶舱
      const cabinGeometry = new THREE.BoxGeometry(1.5, 1.5, 1);
      const cabin = new THREE.Mesh(cabinGeometry, material);
      cabin.position.set(0.5, 1.75, 0);
      bodyGroup.add(cabin);

      return bodyGroup;
    };

    // 创建履带
    const createTracks = () => {
      const tracksGroup = new THREE.Group();

      // 左侧履带
      const leftTrackGeometry = new THREE.BoxGeometry(4, 0.5, 0.5);
      const leftTrack = new THREE.Mesh(leftTrackGeometry, material);
      leftTrack.position.set(0, 0.25, 1.25);
      tracksGroup.add(leftTrack);

      // 左侧履带轮子
      const createWheel = (positionX, positionZ) => {
        const wheelGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.6, 16);
        wheelGeometry.rotateZ(Math.PI / 2);
        const wheel = new THREE.Mesh(wheelGeometry, material);
        wheel.position.set(positionX, 0.25, positionZ);
        wheel.name = "wheel";
        return wheel;
      };

      // 左侧履带轮子
      tracksGroup.add(createWheel(-2, 1.25)); // 左前
      tracksGroup.add(createWheel(2, 1.25)); // 左后

      // 右侧履带
      const rightTrackGeometry = new THREE.BoxGeometry(4, 0.5, 0.5);
      const rightTrack = new THREE.Mesh(rightTrackGeometry, material);
      rightTrack.position.set(0, 0.25, -1.25);
      tracksGroup.add(rightTrack);

      // 右侧履带轮子
      tracksGroup.add(createWheel(-2, -1.25)); // 右前
      tracksGroup.add(createWheel(2, -1.25)); // 右后

      return tracksGroup;
    };

    // 创建机械臂
    const createArm = () => {
      const armGroup = new THREE.Group();
      armGroup.name = "armGroup";

      // 大臂
      const boomGeometry = new THREE.BoxGeometry(3, 0.3, 0.3);
      const boom = new THREE.Mesh(boomGeometry, material);
      boom.position.set(1.5, 2, 0);
      boom.rotation.z = -Math.PI / 4;
      armGroup.add(boom);

      // 小臂
      const stickGeometry = new THREE.BoxGeometry(2, 0.2, 0.2);
      const stick = new THREE.Mesh(stickGeometry, material);
      stick.position.set(3, 1, 0);
      stick.rotation.z = -Math.PI / 2;
      armGroup.add(stick);

      // 漏斗
      const bucketGroup = new THREE.Group();
      bucketGroup.name = "bucketGroup";

      // 漏斗主体
      const bucketGeometry = new THREE.BoxGeometry(1, 0.5, 0.8);
      const bucket = new THREE.Mesh(bucketGeometry, material);
      bucket.position.set(4, 0.75, 0);
      bucketGroup.add(bucket);

      // 漏斗齿
      for (let i = 0; i < 5; i++) {
        const toothGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.8);
        const tooth = new THREE.Mesh(toothGeometry, material);
        tooth.position.set(4.5, 0.35, -0.8 + i * 0.4);
        bucketGroup.add(tooth);
      }

      bucketGroup.position.set(0, 0, 0);
      armGroup.add(bucketGroup);

      return armGroup;
    };

    // 组装挖掘机
    excavatorGroup.add(createTracks());
    excavatorGroup.add(createBody());
    excavatorGroup.add(createArm());

    excavatorGroup.position.set(0.3, 0.1, 29);
    excavatorGroup.rotation.set(0, 1.6, 0);
    // 将挖掘机添加到场景
    scene.add(excavatorGroup);
  },

  // 向前移动
  move(distance = 10, duration = 5000) {
    const excavatorGroup = findMeshFromScene("excavatorGroup");
    console.log("隧道", findMeshFromScene("tunnelMesh"));
    if (excavatorGroup) {
      // 获取当前位置
      const currentZ = excavatorGroup.position.z;
      const targetZ = -20; // 向前移动（负z方向）

      console.log("开始移动挖掘机", { currentZ, targetZ, distance, duration });

      // 地质体边界（立方体中心在原点，边长50，z 从 -25 到 25）
      const geologyFrontZ = 25;
      const geologyBackZ = -25;

      // 挖掘动画：前进 + 碰撞地质体时扩展孔洞
      const tween = new TWEEN.Tween(excavatorGroup.position)
        .to({ z: targetZ }, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate((pos) => {
          const excavatorZ = pos.z;
          // 碰撞检测：挖掘机进入地质体区域（z < 25）时，更新孔洞
          if (excavatorZ <= geologyFrontZ) {
            // 将 excavationFrontZ 设为 excavatorZ，孔洞从地质体前端延伸到挖掘机位置
            window.sceneConfig.cubeMesh.updateExcavationFront(excavatorZ);
          }
          // 更新挖掘进度条
          window.sceneConfig.excavatorProcessMesh.move(excavatorZ);
        })
        .onComplete(() => {
          console.log("移动完成", excavatorGroup.position.z);
        })
        .start();

      this.currentTween = tween;
    } else {
      console.log("未找到挖掘机组");
    }
  },

  // 动画更新
  update() {
    const excavatorGroup = findMeshFromScene("excavatorGroup");
    if (excavatorGroup) {
      // 更新漏斗动画
      const armGroup = excavatorGroup.getObjectByName("armGroup");
      if (armGroup) {
        const bucketGroup = armGroup.getObjectByName("bucketGroup");
        if (bucketGroup) {
          // 更新漏斗角度
          this.animation.bucketAngle +=
            this.animation.bucketSpeed * this.animation.bucketDirection;

          // 限制角度范围（向上摆动）
          if (this.animation.bucketAngle > Math.PI / 12) {
            this.animation.bucketAngle = Math.PI / 12;
            this.animation.bucketDirection = -1;
          } else if (this.animation.bucketAngle < 0) {
            this.animation.bucketAngle = 0;
            this.animation.bucketDirection = 1;
          }

          // 应用旋转
          bucketGroup.rotation.z = this.animation.bucketAngle;
        }
      }

      // 更新轮子旋转
      this.animation.wheelRotation += this.animation.wheelSpeed;
      if (this.animation.wheelRotation > Math.PI * 2) {
        this.animation.wheelRotation = 0;
      }

      // 应用轮子旋转
      excavatorGroup.traverse((child) => {
        if (child.name === "wheel") {
          child.rotation.x = this.animation.wheelRotation;
        }
      });
    }
  },

  setVisible(bool) {
    let group = findMeshFromScene("excavatorGroup");
    if (group) {
      group.visible = bool;
    }
  },
};
