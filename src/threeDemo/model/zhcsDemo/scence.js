import './scence/index.js'

import Cube from "./cube.js";
import Tunnel from "./tunnel.js";

// 导入场景需要的模型
window.sceneConfig = {
}

// 初始化模型
function initSceneMesh(scene) {
  // 地质体
  window.sceneConfig.cube = new Cube({
    scene,
  })
  // 隧道
  window.sceneConfig.tunnel = new Tunnel({
    scene,
  })
}

initSceneMesh(scene);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


