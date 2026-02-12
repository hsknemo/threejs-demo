import * as THREE from "three";
import {findMeshFromScene} from "../../utils/meshControl.js";

export default {
  color: 0xff0000,
  opacity: 0.9,
  transparent: true,
  name: "progressMesh",
  groupName: 'digProgressGroup',
  visible: false,
  zIndex: 2,
  x: 0,
  y: 0,
  z: 0,
  scaleX: 1,
  scaleY: 2.1,
  scaleZ: 2.1,
  tunnelLength: 2,

  /**
   * 构建调试面板
   */
  createDebugUI() {
    let digFolder = gui.addFolder("控制-进度测试")

    let target = findMeshFromScene(this.groupName)

    // 需要调试的属性进行声明
    target.x = 0
    target.y = 0
    target.z = 0
    target.changeScaleX = 0
    target.changeScaleY = 0
    target.changeScaleZ = 0

    digFolder
      .add(target, "x", -25, 25, 1)
      .name("prograss x")
      .onChange((v) => {
        target.position.x = v
      })

    digFolder
      .add(target, "y", 0, 1, 0.1)
      .name("prograss y")
      .onChange((v) => {
        target.position.y = v
      })

    digFolder
      .add(target, "z", 0, 1, 0.1)
      .name("prograss z")
      .onChange((v) => {
        target.position.z = v
      })

    digFolder.add(target, 'changeScaleX', -50, 50, .1)
      .name('prograss scale x')
      .onChange(v => {
        target.scale.x = v
      })

    digFolder
      .add(target, "changeScaleY", -25, 25, 1)
      .name("prograss scale y")
      .onChange((v) => {
        target.scale.y = v
      })

    digFolder.add(target, 'changeScaleZ', 0, 1, .1)
      .name('prograss scale z')
      .onChange(v => {
        target.scale.z = v
      })
  },

  layout(scene, tunnelGeometry) {
    const progressMaterial = new THREE.MeshBasicMaterial({
      color: '#1eff57', // 进度模型的绿色
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    })
    let mesh = new THREE.Mesh(tunnelGeometry, progressMaterial)
    mesh.rotateX(-Math.PI / 2)
    mesh.rotateZ(-Math.PI / 2)
    mesh.renderOrder = 6
    const group = new THREE.Group()
    mesh.name = this.name
    // 布局：让隧道动画保持在父级group 右侧，做单侧动画使用
    mesh.translateY(11.5)

    console.log('mesh start', mesh)
    // 布局：保持跟隧道一样, 防止交叉增加细微参数
    mesh.scale.set(sceneConfig.staticTunnel.tunnelWidth + .5, sceneConfig.staticTunnel.tunnelDepth, sceneConfig.staticTunnel.tunnelHeight + .5)
    group.add(mesh)
    group.name = this.groupName
    group.scale.z = 1
    scene.add(group)
    group.translateX(20)
    // addMeshAxis(group)
    group.visible = this.visible
    // 保存初始化位置，方便后续重置
    this.groupUserData = group.position.clone()
    this.meshUserData = mesh.position.clone()
    this.createDebugUI()
  },

  /**
   * 进度场景重置
   */
  reset() {
    let mesh = findMeshFromScene(sceneConfig.digProgress.name)
    let group = findMeshFromScene(sceneConfig.digProgress.groupName)
    group.scale.z = 1
    group.scale.x = 1
    // 重新设置位置
    mesh.position.set(this.meshUserData.x, this.meshUserData.y, this.meshUserData.z)
    group.position.set(this.groupUserData.x, this.groupUserData.y, this.groupUserData.z)
    group.visible = false
    this.step = 0.1
  },
  setVisible(visible ) {
    let mesh = findMeshFromScene(this.groupName)
    if (Object.prototype.toString.call(visible) === '[object Boolean]') {
      mesh.visible = visible
      return
    }
    mesh.visible = !mesh.visible
  },
  step: 0.1,
  update() {
    let mesh = findMeshFromScene(this.groupName)
    this.step += 0.1
    mesh.scale.x = -this.step * 0.029
  },
}
