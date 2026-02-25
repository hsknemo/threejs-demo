import * as THREE from "three";

export default {
  name: 'shaderModel',
  layout(scene) {
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 }, // 时间变量（用于动画）
        uSpeed: { value: 1.0 } // 动画速度（可自定义）
      },
      vertexShader: `
        // 顶点着色器：传递 UV 坐标
        varying vec2 vUv;
        void main() {
          vUv = uv; // 将几何体的 UV 坐标传递给片元着色器
          // 固定公式：计算顶点最终位置
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        // 片元着色器：计算像素颜色
        varying vec2 vUv; // 接收顶点着色器的 UV 坐标
        uniform float uTime; // 接收外部的时间变量
        uniform float uSpeed; // 接收外部的速度变量

        void main() {
          // 核心逻辑：根据 UV 和时间计算颜色
          // 1. 用 sin 函数生成 0~1 的动态值（sin 输出 -1~1，加 1 除 2 映射到 0~1）
          float red = (sin(vUv.x * 5.0 + uTime * uSpeed) + 1.0) / 2.0;
          float green = (sin(vUv.y * 5.0 + uTime * uSpeed * 0.8) + 1.0) / 2.0;
          float blue = (sin((vUv.x + vUv.y) * 3.0 + uTime * uSpeed * 0.5) + 1.0) / 2.0;
          
          // 2. 设置像素颜色（rgba，第四个值是透明度，1=不透明）
          gl_FragColor = vec4(red, green, blue, 1.0);
        }
      `
    });
    this.material = shaderMaterial;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), shaderMaterial);
    plane.name = this.name
    scene.add(plane);
  },

  update() {
    if (this.material) {
      this.material.uniforms.uTime.value += 0.01;
    }
  }
}
