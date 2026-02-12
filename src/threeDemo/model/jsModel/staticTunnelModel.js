//  静态隧道
import {OBJLoader} from "three/addons/loaders/OBJLoader.js"
import {findMeshFromScene} from "../../utils/meshControl.js";
export default {
  opacity: 0.6,
  transparent: true,
  // 隧道高度
  tunnelHeight: 2,
  // 隧道长度
  tunnelDepth: 5,
  // 隧道宽度
  tunnelWidth: 2,

  name: "staticTunnel",
  visible: true,
  width: 10,
  height: 3,
  depth: 3,
  zIndex: 3,
  x: -6,
  y: 0,
  z: 0,

  layout(scene) {
    const loader = new OBJLoader()
    let modelUrl = new URL(
      `../tunnel/tunnel.obj`,
      import.meta.url,
    ).href
    loader.load(modelUrl, (obj) => {
      console.log("OBJ模型加载完成:", obj)
      obj.name = "staticTunnel"
      obj.opacity = .1
      obj.transparent = true
      obj.rotateX(-Math.PI / 2)
      obj.rotateZ(-Math.PI / 2)
      obj.scale.set(sceneConfig.staticTunnel.tunnelWidth, sceneConfig.staticTunnel.tunnelDepth, sceneConfig.staticTunnel.tunnelHeight)
      obj.position.set(sceneConfig.staticTunnel.x, sceneConfig.staticTunnel.y, sceneConfig.staticTunnel.z)
      obj.visible = sceneConfig.staticTunnel.visible
      scene.add(obj)

      obj.traverse((child) => {
        // 只处理网格对象
        if (child.isMesh) {
          // 提取BufferGeometry（克隆避免修改原模型）
          let tunnelGeometry = child.geometry.clone()
          // 布局：进度布局
          sceneConfig.digProgress.layout(scene, tunnelGeometry)
          // 停止遍历（如果只有一个核心Mesh）
          return false
        }
      })
    })
  },

  setVisible() {
    let mesh = findMeshFromScene(sceneConfig.staticTunnel.name)
    let visible = mesh.visible
    mesh.visible = !visible
  },
}
