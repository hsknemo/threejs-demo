// 挖掘机模型
import * as THREE from "three";
import {findMeshFromScene} from "../../utils/meshControl.js";
// 创建自定义订阅事件
const startExcavatingEndEvent = new CustomEvent("start-excavating-end", {
  detail: true,
})
export default {
  color: 0x0000ff,
    opacity: 1,
  transparent: true,
  name: "car",
  groupName: 'carGroup',
  radiusTop: 0.5,
  radiusBottom: 1,
  height: 1,
  visible: true,

  x: 20,
  y: 1,
  z: 0,

  reset() {
  let car = findMeshFromScene(this.groupName)
  car.position.set(this.x, this.y, this.z)
},

  // 展示html
  showHtml(ev) {
  const props = {
    target: "car",
    x: ev.clientX,
    y: ev.clientY,
    name: "duddu",
    value: "隧道挖了 xxx m",
  }

  const showHtmlEvent = new CustomEvent("show-html", {
    detail: props,
  })

  window.dispatchEvent(showHtmlEvent)
},

  layout(scene) {
  const geometry = new THREE.CylinderGeometry(
    this.radiusTop,
    this.radiusBottom,
    1,
    32,
  )
  const carMaterial = new THREE.MeshPhysicalMaterial({
    color: this.color,
    side: THREE.DoubleSide,
  })
  const car = new THREE.Mesh(geometry, carMaterial)
  // car.position.set(this.x, this.y, this.z)
  // 调整位置
  car.rotateX(Math.PI / 2)
  car.rotateZ(Math.PI / 2)
  let group = new THREE.Group()
  group.add(car)
  car.name = this.name
  group.name = this.groupName
  group.visible = this.visible
  group.position.set(this.x, this.y, this.z)
  // addMeshAxis(group, 5)
  scene.add(group)
},

  runStep: .1,

    // 更新挖掘机位置
    update() {
  if (!gl_isExcavating) {
    return
  }
  // 开启隧道显示
  threeInterface.tunnelProgressControlVisible(true)
  let end = -16

  let carMesh = findMeshFromScene("carGroup")

  // 停止
  if (carMesh.position.x <= end) {
    gl_isExcavating = false
    threeInterface.startExcavating(false)

    window.dispatchEvent(startExcavatingEndEvent)
    return
  }

  // 运动
  carMesh.position.x = Number(carMesh.position.x - this.runStep).toFixed(2)

  sceneConfig.digProgress.update(carMesh.position.x)
},

  setVisible(visible) {
  let carGroup = findMeshFromScene(this.groupName)
  if (Object.prototype.toString.call(visible) === '[object Boolean]') {
    carGroup.visible = visible
    return
  }
  carGroup.visible = !carGroup.visible
},

}
