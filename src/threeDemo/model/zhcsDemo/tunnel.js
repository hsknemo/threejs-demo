import * as THREE from 'three'
import { CSG } from 'three-csg-ts';
// 核心：引入变换控制器
import { TransformControls } from 'three/addons/controls/TransformControls.js';

export default class Tunnel {
  constructor(props) {
    this.width = 5
    this.height = 5
    this.depth = 5
    this.name = '隧道'
    this.scene = props.scene
    this.mesh = null
    // 开启调试模式
    this.debugMode = true

    this.init()
    this.initGUI()
  }

  getGeometry() {
    return new THREE.Shape()
  }

  getMaterial() {
    return new THREE.MeshPhysicalMaterial({
      // color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
    })
  }

  getMesh() {
    const geometry = this.getGeometry()
    const material = this.getMaterial()
    return new THREE.Mesh(geometry, material)
  }


  init() {

    // 三个CylinderGeometry 拼成一个模型
    this.mesh = new THREE.Group()

    this.t_left_gemo = new THREE.CylinderGeometry(
      .5,
      .5,
      5,
      100,
      1,
      true,
        0,
      3,
    )

    this.t_right_gemo = new THREE.CylinderGeometry(
      .5,
      .5,
      5,
      100,
      1,
      true,
      0,
      1,
    )

    const material = new THREE.MeshBasicMaterial({
      // color: 'red',
      side: THREE.DoubleSide,
    })
    this.initTexture(material)
    let mesh = new THREE.Mesh(this.t_left_gemo, material)
    let mesh2 = new THREE.Mesh(this.t_right_gemo, material)
    mesh2.rotateY(-Math.PI / 3)
    mesh2.name = '隧道顶部右平面'
    mesh2.rotateY(0.09)

    const planeGeometry = new THREE.PlaneGeometry(.9, 5)
    const plane = new THREE.Mesh(planeGeometry, material)
    this.rightPlane = plane.clone()
    this.botomPlane = plane.clone()
    this.botomPlane.geometry = plane.geometry.clone()

    this.botomPlane.scale.set(1.1, 1, 1)
    plane.rotation.y = 43.2

    plane.scale.set(1.12, 1, 1)


    plane.position.x = 0.06344625806275707
    plane.position.y =  -0.00037105165168744474
    plane.position.z = -0.6276595883866547



    this.plane = plane



    this.rightPlane.rotation.y = 43.2
    this.rightPlane.position.x =  -0.6672091348347107
    this.rightPlane.position.y =   -0.008430859496826424
    this.rightPlane.position.z = 0.03811404636249565


    this.botomPlane.position.x =  -0.6388053535872107
    this.botomPlane.position.y =  0.012908921899559543
    this.botomPlane.position.z =  -0.6245363136501636



    this.botomPlane.rotation.z = 0
    this.botomPlane.rotation.y = 0.8

    mesh.rotation.y = -0.8
    this.topVert = mesh

    this.mesh.add(this.topVert, this.plane, this.rightPlane, this.botomPlane)
    this.mesh.rotation.y = 47.1
    this.mesh.rotation.x = 0.82
    this.mesh.rotation.z = 1.54
    this.mesh.name = this.name
    this.scene.add(this.mesh)

    this.mesh.scale.set(1, .9, 1)
    this.mesh.position.set(.3, 0, 0)
  }

  initTexture(material) {
    let imgUrl = '/texture/st.jpg'
    const texture = new THREE.TextureLoader().load(
      imgUrl
    )
    material.map = texture
  }

  changeCubeMaterialProperty(property, value) {
    this.mesh.material[property] = value
  }

  initGUI() {
    if (!this.debugMode) return
    let g = window.gui.addFolder("隧道控制")

    g
      .add(this.mesh.rotation, "y", -360, 360, .1)
      .name('隧道 旋转y')
    g
      .add(this.mesh.rotation, "x", -360, 360, .01)
      .name('隧道 旋转x')

    g
      .add(this.mesh.rotation, "z", -360, 360, .01)
      .name('隧道 旋转z')

    g
      .add(this.botomPlane.rotation, "y", -360, 360, .1)
      .name('底部 旋转y')
    g
      .add(this.botomPlane.rotation, "x", -360, 360, .01)
      .name('底部 旋转x')

    g
      .add(this.botomPlane.rotation, "z", -360, 360, .01)
      .name('底部 旋转z')

    g
      .add(this.botomPlane.position, "x", -360, 360, .01)
      .name('底部 位置x')

    g
      .add(this.botomPlane.position, "z", -360, 360, .01)
      .name('底部 位置z')


  }
}
