
import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";

// 扇形隧道模型
export default {
  radius: 5, // 隧道半径
  length: 50, // 隧道长度
  width: 10, // 隧道宽度
  archHeight: 5, // 拱形高度
  name: "tunnelMesh",
  materialConfig: {
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.5,
    transparent: false,
    opacity: 1,
    depthTest: true,
    visible: true,
    side: THREE.DoubleSide, // 双面可见
  },
  layout(scene) {
    // 贴图
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/texture/st.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 5);

    const cfg = this.excavationConfig || {};
    const channelWidth = cfg.channelWidth ?? this.width * 0.8;
    const channelHeight = cfg.channelHeight ?? this.archHeight * 1.2;
    const channelCenterY = cfg.channelCenterY ?? -5.5;
    const zChannelStart = cfg.zChannelStart ?? -this.length / 2;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        excavationFrontZ: { value: -1 }, // -1 表示初始不镂空
        channelWidth: { value: channelWidth },
        channelHeight: { value: channelHeight },
        channelCenterY: { value: channelCenterY },
        zChannelStart: { value: zChannelStart },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float excavationFrontZ;
        uniform float channelWidth;
        uniform float channelHeight;
        uniform float channelCenterY;
        uniform float zChannelStart;

        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          // 通道长方体镂空：z 从 zChannelStart 到 excavationFrontZ
          if (excavationFrontZ > -0.001) {
            if (vPosition.z >= zChannelStart && vPosition.z <= excavationFrontZ) {
              float halfW = channelWidth / 2.0;
              float halfH = channelHeight / 2.0;
              float yMin = channelCenterY - halfH;
              float yMax = channelCenterY + halfH;
              if (abs(vPosition.x) <= halfW && vPosition.y >= yMin && vPosition.y <= yMax) {
                discard;  // 在通道长方体内部，镂空
              }
            }
          }
          vec4 texColor = texture2D(map, vUv);
          gl_FragColor = vec4(texColor.rgb, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      transparent: false,
      depthTest: true,
    });

    // 创建隧道组
    const tunnelGroup = new THREE.Group();
    tunnelGroup.name = "tunnelGroup";

    // 创建拱形隧道形状
    const createTunnelGeometry = () => {
      // 创建隧道截面形状
      const shape = new THREE.Shape();

      // 底部矩形
      const width = this.width;

      // 从左下角开始
      shape.moveTo(-width / 2, 0);
      // 向右到右下角
      shape.lineTo(width / 2, 0);
      // 向上到右拱起点
      shape.lineTo(width / 2, this.archHeight);
      // 绘制顶部半圆
      shape.absarc(0, this.archHeight, width / 2, 0, Math.PI, false);
      // 向下到左拱起点
      shape.lineTo(-width / 2, this.archHeight);
      // 闭合路径
      shape.lineTo(-width / 2, 0);

      // 创建拉伸几何体
      const extrudeSettings = {
        steps: 1,
        depth: this.length,
        bevelEnabled: false,
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

      // 旋转几何体使其水平放置（绕X轴旋转90度）
      geometry.rotateX(-Math.PI);
      geometry.rotateZ(-Math.PI);
      // 调整位置，确保隧道水平居中
      geometry.translate(0, -8, this.length / 2);

      return geometry;
    };

    // 创建隧道几何体
    const tunnelGeometry = createTunnelGeometry();
    const tunnel = new THREE.Mesh(tunnelGeometry, material);
    tunnel.name = this.name;
    // 确保隧道网格没有额外的旋转
    tunnel.rotation.set(0, 0, 0);
    // 调整隧道位置，使其底部与地面平齐
    tunnel.position.y = this.archHeight;

    // 添加隧道到组
    tunnelGroup.add(tunnel);

    // 将组添加到场景中
    scene.add(tunnelGroup);

    // 挖掘机挖掘进度
    window.sceneConfig.excavatorProcessMesh.layout(scene, tunnelGeometry);
  },
  // 挖掘通道配置（隧道局部坐标系）
  // 几何体经 rotateX(-PI)+rotateZ(-PI)+translate(0,-8,length/2) 后：
  //   X: 宽度, Y: 截面高度(-8~-3), Z: 隧道长度(-25~25)，前边为正Z
  excavationConfig: {
    channelWidth: 8,     // 通道宽度 (X方向)
    channelHeight: 5,    // 通道高度 (Y方向，覆盖拱形截面)
    channelCenterY: -5.5, // 截面中心Y（-8与-3的中点）
    zChannelStart: -25,   // 隧道后边 Z 起点
  },

  // 更新挖掘前缘：z 为挖掘前缘位置
  // 镂空区域：从 zChannelStart 到 z 的长方体通道
  updateExcavationFront(z) {
    const tunnel = findMeshFromScene("tunnelMesh");
    if (!tunnel || !tunnel.material.uniforms) return;
    tunnel.material.uniforms.excavationFrontZ.value = z;
  },
  setVisible(bool) {
    // 查找隧道组
    let group = findMeshFromScene("tunnelGroup");
    if (group) {
      group.visible = bool;
    }
  },
};
