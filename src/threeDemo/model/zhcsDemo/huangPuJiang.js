import * as THREE from "three";
import {ElMessage} from "element-plus";
import {findMeshFromScene} from "../../utils/meshControl.js";

export default {
  name: '黄浦江',
  hpjJsonDataUrl:  new URL(
    `./data/黄浦江.json`,
    import.meta.url,
  ).href,

  setVisible(bool) {
    let mesh = findMeshFromScene('黄浦江')
    mesh.visible = bool
  },

  async load(sence) {
    try {
      let json = await (await fetch(this.hpjJsonDataUrl)).json()
      let coor = json.features[0].geometry.coordinates[0]
      let threeVec2Arr = []
      coor.forEach(item => {
        threeVec2Arr.push(new THREE.Vector2(item[0], item[1]))
      })
      let shape = new THREE.Shape(threeVec2Arr)
      // 填充多边形
      let shapeGeometry = new THREE.ShapeGeometry(shape)
      let shapMaterial = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
      })
      let hpjMesh = new THREE.Mesh(shapeGeometry, shapMaterial)
      hpjMesh.name = this.name
      let group = new THREE.Group()
      console.log(group)
      group.add(hpjMesh)
      sence.add(group)
    } catch (e) {
      ElMessage.error('黄浦江数据加载失败' + e)
    }
  }
}
