import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js"
import {findMeshFromScene} from "../../utils/meshControl.js";

// 城市模型
export default {
  setVisible(bool) {
    let mesh = findMeshFromScene('智慧城市')
    if (!mesh) return
    mesh.visible = bool
  },
  load(scene) {
    console.log('智慧城市加载')
    const loader = new GLTFLoader()
    let modelUrl = new URL(
      `./glb/上海外滩.glb`,
      import.meta.url,
    ).href

    loader.load(modelUrl, (gltf) => {
      console.log("智慧城市模型加载完成:", gltf)
      gltf.scene.name = "智慧城市"
      scene.add(gltf.scene)
    //   获取河面材质设置颜色
      let river = gltf.scene.getObjectByName('河面')
      river.material = new THREE.MeshPhongMaterial({
        color: 0x0000ff,
        transparent: true,
        opacity: 0.5,
      })


      let floor = gltf.scene.getObjectByName('地面')
      floor.material = new THREE.MeshPhongMaterial({
        color: '#6f3a3a',
        transparent: true,
        opacity: 0.5,
      })
    })
  }
}
