// 绘制墙
import * as THREE from "three";

export default {
  load(scene) {
    let pointArr = [
      0, 0,
      20,0,
      20, 50,
      0, 50,
      0, 0
    ]

    let gemotry = new THREE.BufferGeometry()
    let h = 20
    let posArr = [
      0, 0, 0,
      20, 0, 0,
      20, 50, 0,
      0, 50, 0,
    ]
    console.log(new Float32Array(posArr))
    gemotry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posArr), 3))
    gemotry.computeVertexNormals()
    let material = new THREE.MeshLambertMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
      wireframe: true
    })
    let mesh = new THREE.Mesh(gemotry, material)
    mesh.scale.z = 55
    mesh.position.y = 155
    scene.add(mesh)
  }
}
