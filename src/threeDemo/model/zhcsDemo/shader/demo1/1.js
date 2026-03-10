// 创建着色器材质
import * as THREE from "three";
import vertexShader from "./vertexShader.glsl?raw";
import fragmentShader from "./fragment.glsl?raw";
const texture = new THREE.TextureLoader().load("/texture/st.jpg");
const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
        map: {
            value: texture,
        },
    },
});
// const points = new Float32Array([
//   0, 0, 0,
//   20, 20, 0,
//   20, 0, 0,
// ])
// const geometry = new THREE.BufferGeometry();
// geometry.attributes.position = new THREE.BufferAttribute(points, 3);
// geometry.attributes.color = new THREE.BufferAttribute(new Float32Array([
//   1, 0, 0,
//   0, 1, 0,
//   0, 0, 1,
// ]), 3);

// 球体
const geometry = new THREE.SphereGeometry(10, 32, 32);
const mesh = new THREE.Points(geometry, shaderMaterial);
mesh.position.set(0, 0, 0);
mesh.name = "ball";
scene.add(mesh);