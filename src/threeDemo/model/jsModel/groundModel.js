// 地面
import * as THREE from "three";
import {findMeshFromScene} from "../../utils/meshControl.js";

export default {
  color: "#e2e2e2",
  opacity: 1,
  transparent: true,
  name: "ground",
  width: 80,
  height: 80,
  visible: false,
  x: 0,
  y: 0,
  z: 0,
  setVisible() {
    let mesh = findMeshFromScene(sceneConfig.ground.name)
    mesh.visible = !mesh.visible
  },
  layout(scene) {
    const groundGeometry = new THREE.PlaneGeometry(
      this.width,
      this.height,
    )
    const groundMaterial = new THREE.MeshPhysicalMaterial({
      color: this.color,
      side: THREE.DoubleSide,
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.name = name
    ground.position.set(this.x, this.y, this.z)
    ground.rotateX(-Math.PI / 2)
    ground.visible = this.visible
    scene.add(ground)
  }
}
