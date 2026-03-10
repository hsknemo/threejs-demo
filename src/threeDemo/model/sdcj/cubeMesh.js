import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";
// 地质体模型 - 带拱形(D形)孔洞
const cubeMesh = {
  width: 50,
  height: 50,
  depth: 50,
  name: "cubeMesh",
  // 孔洞参数（与图片中拱形孔洞一致：矩形底+半圆顶）
  holeConfig: {
    tunnelWidth: 10,      // 孔洞宽度（半圆直径=矩形宽度）
    rectHeight: 5,       // 矩形部分高度
    tunnelLength: 50,     // 孔洞沿Z轴穿透深度
    tunnelCenterY: 7,     // 孔洞中心Y轴位置（0为立方体中心）
  },
  materialConfig: {
    color: 0x333333,
    metalness: 0.1,
    roughness: 0.5,
    transparent: true,
    opacity: 0.5,
    depthTest: false,
    visible: true,
  },
  layout(scene) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/texture/dzttt.png");

    const cubeGeometry = new THREE.BoxGeometry(
      this.width,
      this.height,
      this.depth,
      32,
      32,
      32,
    );

    const cfg = this.holeConfig;
    const tunnelWidth = cfg.tunnelWidth;
    const rectHeight = cfg.rectHeight;
    // 拱形半径 = 宽度的一半，使半圆直径等于矩形宽度（D形）
    const archRadius = tunnelWidth / 2.0;
    const tunnelLength = cfg.tunnelLength;
    const tunnelCenterY = cfg.tunnelCenterY;

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        tunnelWidth: { value: tunnelWidth },
        rectHeight: { value: rectHeight },
        archRadius: { value: archRadius },
        tunnelLength: { value: tunnelLength },
        tunnelCenterY: { value: tunnelCenterY },
        opacity: { value: this.materialConfig.opacity },
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
        uniform float tunnelWidth;
        uniform float rectHeight;
        uniform float archRadius;
        uniform float tunnelLength;
        uniform float tunnelCenterY;
        uniform float opacity;

        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          // 隧道长度范围（Z轴）
          if (abs(vPosition.z) > tunnelLength / 2.0) {
            vec4 texColor = texture2D(map, vUv);
            gl_FragColor = vec4(texColor.rgb, opacity);
            return;
          }

          float halfWidth = tunnelWidth / 2.0;
          float tunnelBottom = tunnelCenterY - (rectHeight + archRadius);
          float archBottom = tunnelBottom + rectHeight;   // 矩形顶部 = 半圆底部
          float tunnelTop = tunnelCenterY + archRadius;   // 半圆顶部

          // X方向：孔洞宽度内
          if (abs(vPosition.x) > halfWidth) {
            vec4 texColor = texture2D(map, vUv);
            gl_FragColor = vec4(texColor.rgb, opacity);
            return;
          }

          // Y方向：在孔洞总高度范围内
          if (vPosition.y < tunnelBottom || vPosition.y > tunnelTop) {
            vec4 texColor = texture2D(map, vUv);
            gl_FragColor = vec4(texColor.rgb, opacity);
            return;
          }

          // 底部矩形区域：直接镂空
          if (vPosition.y < archBottom) {
            discard;
          }

          // 顶部半圆区域：在半圆内则镂空
          // 半圆中心在矩形顶部中点，半径=宽度/2
          float centerY = archBottom;
          float distSq = (vPosition.x) * (vPosition.x) + (vPosition.y - centerY) * (vPosition.y - centerY);
          if (distSq <= archRadius * archRadius) {
            discard;
          }

          vec4 texColor = texture2D(map, vUv);
          gl_FragColor = vec4(texColor.rgb, opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const cube = new THREE.Mesh(cubeGeometry, shaderMaterial);
    cube.name = this.name;
    scene.add(cube);

    console.log("地质体已添加到场景，带有拱形(D形)孔洞");
  },
  setVisible(bool) {
    let mesh = findMeshFromScene(this.name);
    if (mesh) {
      mesh.visible = bool;
    }
  },
};

export default cubeMesh;
