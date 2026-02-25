// 导入 THREE 库
import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";

// 平面层

export default {
  width: 50,
  height: 30,
  depth: 20,
  name: "planeLayer",
  planeGroup: null,
  materialConfig: {
    color: 0x888888,
    side: THREE.DoubleSide,
  },
  layout(scene) {
    this.planeGroup = new THREE.Group();
    this.planeGroup.name = this.name;

    const planeGeometry = new THREE.PlaneGeometry(this.width, this.height);
    const planeMaterial = new THREE.MeshBasicMaterial(this.materialConfig);
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.rotation.y = -Math.PI / 3;
    plane.position.x = -10;
    this.planeGroup.add(plane);

    scene.add(this.planeGroup);
  },
  setVisible(visible) {
    let mesh = findMeshFromScene(this.name);
    if (mesh) {
      mesh.visible = visible;
    }
  },
};
