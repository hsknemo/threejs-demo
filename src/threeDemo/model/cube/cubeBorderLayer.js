// 地质体边框
import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";

export default {
  width: 50,
  height: 50,
  depth: 50,
  name: "cubeBorder",
  materialConfig: {
    color: 0x3498db,
    linewidth: 2,
  },
  layout(scene) {
    const cubeGeometry = new THREE.BoxGeometry(
      this.width,
      this.height,
      this.depth,
    );

    const edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
    const lineMaterial = new THREE.LineBasicMaterial(this.materialConfig);
    const edges = new THREE.LineSegments(edgesGeometry, lineMaterial);
    edges.name = this.name;
    scene.add(edges);
  },
  setVisible() {
    let mesh = findMeshFromScene(this.name);
    mesh.visible = !mesh.visible;
  },
};
