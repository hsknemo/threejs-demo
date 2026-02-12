// 地质体
import * as THREE from "three";
import {findMeshFromScene} from "../../utils/meshControl.js";

export default {
  width: 50,
  height: 50,
  depth: 50,
  name: "outCube",
  materialConfig: {
    color: 0x3498db,
    metalness: 0.3,
    roughness: 0.4,
    transparent: true,
    opacity: 0.5,
    // 关闭深度测试，不被正方体遮挡
    depthTest: false,
  },
  layout(scene) {
    const cubeGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth)
    const cubeMaterial = new THREE.MeshPhysicalMaterial(this.materialConfig)
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
    cube.name = this.name
    scene.add(cube)
  },
  setVisible() {
    let mesh = findMeshFromScene(this.name)
    mesh.visible = !mesh.visible
  }
}
