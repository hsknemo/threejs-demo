import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";

// 截面网格模型
export default {
  width: 50,
  height: 45,
  depth: 1, // 增加深度
  name: "crossSectionMesh",
  materialConfig: {
    color: 0xffffff,
    metalness: 0.3,
    roughness: 0.5,
    side: THREE.DoubleSide,
    visible: true,
  },
  layout(scene) {
    // 加载纹理贴图（使用与隧道相同的纹理）
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/texture/st.jpg");
    // 设置纹理重复
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    this.materialConfig.map = texture;

    // 创建长方体几何体（具有深度）
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshPhysicalMaterial(this.materialConfig);
    const crossSection = new THREE.Mesh(geometry, material);
    crossSection.name = this.name;

    // 倾斜30度（约0.5236弧度）
    crossSection.rotation.x = -Math.PI / 8; // 30度

    // 调整位置
    crossSection.position.set(0, 0, -15);

    scene.add(crossSection);
  },
  setVisible(bool) {
    let mesh = findMeshFromScene(this.name);
    if (mesh) {
      mesh.visible = bool;
    }
  },
};
