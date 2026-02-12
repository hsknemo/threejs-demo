import * as THREE from "three"
import {OrbitControls} from "three/addons/controls/OrbitControls.js"
import {OBJLoader} from "three/addons/loaders/OBJLoader.js"
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js"
import cubeModel from "./model/jsModel/cubeModel.js";
import groundModel from "./model/jsModel/groundModel.js";
import carModel from "./model/jsModel/carModel.js";
import digProgressModel from "./model/jsModel/digProgressModel.js";
import staticTunnelModel from "./model/jsModel/staticTunnelModel.js";

window.camera = null
window.scene = null
window.controls = null
window.renderer = null
window.raycaster = null
window.mouse = null
window.gui = null
// 控制动画暂停或者执行
window.gl_isExcavating = false


window.sceneConfig = {
  // 正方体模型配置
  cube: cubeModel,
  // 地面配置
  ground: groundModel,
  // 代表挖掘机
  car: carModel,
  // 表示变化开始挖掘的隧道
  digProgress: digProgressModel,
  // 隧道默认
  staticTunnel: staticTunnelModel,
}

// 添加点击事件
function createRaycaster() {
  raycaster = new THREE.Raycaster() // 射线检测器
  mouse = new THREE.Vector2() // 存储鼠标坐标

  function onMouseClick(event) {
    // 1. 将鼠标屏幕坐标转换为 three.js 归一化设备坐标（NDC）
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1
    // y：- (鼠标y / 画布高度) * 2 + 1 （注意负号，反转y轴）
    mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1

    // 2. 更新射线：从相机位置指向鼠标点击的位置
    raycaster.setFromCamera(mouse, camera)

    // 3. 检测射线与哪些物体相交（返回相交的物体数组）
    const intersects = raycaster.intersectObjects(scene.children)

    // 4. 处理相交结果
    if (intersects.length > 0) {
      // 过滤：只保留真正的模型
      const realObj = intersects.find(item => {
        const obj = item.object
        console.log(obj)
        // 1. 必须有几何体（不是空Mesh）
        // 2. 不是辅助线/辅助格/灯光/相机
        return (
          obj.geometry &&
          !obj.type.includes('Helper') &&
          obj.type !== 'Light' &&
          obj.type !== 'Camera'
        )
      })

      // 如果找到有效物体，再处理
      if (realObj) {
        console.log('点到真正的物体：', realObj.object.name)
        // 你的点击逻辑...
        if (realObj.object.name && sceneConfig[realObj.object.name]) {
          if (sceneConfig[realObj.object.name].showHtml) {
            sceneConfig[realObj.object.name].showHtml(event)
          }
        }
      }
    }
  }

  window.addEventListener("click", onMouseClick)
}

init()

function initGUIControl() {
  gui = new GUI()
}

function init() {
  // 1. 初始化基础环境
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // 相机设置
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    3000,
  )
  camera.position.set(55, 50, 60)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // 轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // 3. 添加辅助线
  const axesHelper = new THREE.AxesHelper(10)
  scene.add(axesHelper)

  // 4. 光源设置
  const ambientLight = new THREE.AmbientLight(0xffffff, .5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
  directionalLight.position.set(5, 10, 5)
  scene.add(directionalLight)

  createRaycaster()

  initGUIControl()

  initSceneMesh(scene)
}

// 初始化场景模型
function initSceneMesh(scene) {
  // 正方体模型配置
  sceneConfig.cube.layout(scene)
  // 隧道模型初始化
  sceneConfig.staticTunnel.layout(scene)
  // 挖掘机模型初始化
  sceneConfig.car.layout(scene)
  // 地面模型初始化
  sceneConfig.ground.layout(scene)
}


function findMeshFromScene(name) {
  return scene.getObjectByName(name)
}


function animate() {
  requestAnimationFrame(animate)
  controls.update()
  sceneConfig.car.update()
  renderer.render(scene, camera)
}

animate()

// 显示mesh 的辅助线
function addMeshAxis(mesh, size = 15) {
  // 显示mesh 的辅助线
  const axesHelper = new THREE.AxesHelper(size)
  // 将辅助器添加为 mesh 的子对象（关键！跟随 mesh 坐标系）
  mesh.add(axesHelper)
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

/**
 * 交互方法挂载全局
 */
window.threeInterface = {
  startExcavating(isExcavating) {
    gl_isExcavating = isExcavating
  },
  resetExcavating() {
    gl_isExcavating = false
    sceneConfig.car.reset()
    sceneConfig.digProgress.reset()
  },

  // 控制静态隧道是否显示
  defaultTunnelControlVisible() {
    sceneConfig.staticTunnel.setVisible()
  },

  // 隧道进度控制显示
  tunnelProgressControlVisible(v) {
    sceneConfig.digProgress.setVisible(v)
  },

  // 挖掘机控制显示
  carControlVisible() {
    sceneConfig.car.setVisible()
  },
}
