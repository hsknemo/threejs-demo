import './scence/index.js'

import city from "./city.js";
import qiang from "./qiang.js";

// 导入场景需要的模型
window.sceneConfig = {
  city,
  qiang,
}

// 初始化模型
function initSceneMesh(scene) {
  sceneConfig.city.load(scene)
  sceneConfig.qiang.load(scene)
}

initSceneMesh(scene);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


