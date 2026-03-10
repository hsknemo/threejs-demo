import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import cubeMesh from "./cubeMesh.js";
import tunnelMesh from "./tunnelMesh.js";
import crossSectionMesh from "./crossSectionMesh.js";
import excavatorMesh from "./excavatorMesh.js";
import excavatorProcessMesh from "./excavatorProcessMesh.js";
import TWEEN from "@tweenjs/tween.js";

import sensorMesh from "./sensorMesh.js";
import nineBoxMesh from "./nineBoxMesh.js";

import { findMeshFromScene } from "@/threeDemo/utils/meshControl.js";
window.camera = null;
window.scene = null;
window.controls = null;
window.renderer = null;
window.raycaster = null;
window.mouse = null;
window.gui = null;

window.sceneConfig = {
  // 地质体
  cubeMesh,
  // 隧道模型
  tunnelMesh,
  // 截面网格模型
  crossSectionMesh,
  // 挖掘机模型
  excavatorMesh,
  // 挖掘机挖掘进度
  excavatorProcessMesh,
  // 传感器模型
  //   sensorMesh,
  // 九面体模型
  //   nineBoxMesh,
};

function initSceneMesh(scene) {
  window.sceneConfig.cubeMesh.layout(scene);
  window.sceneConfig.tunnelMesh.layout(scene);
  // 截面网格模型
  window.sceneConfig.crossSectionMesh.layout(scene);
  // 挖掘机模型
  window.sceneConfig.excavatorMesh.layout(scene);
  // window.sceneConfig.sensorMesh.layout(scene);
  // window.sceneConfig.nineBoxMesh.layout(scene);
}

function initAxisHelper() {
  const axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);
}

function createRayCaster() {
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  function onMouseClick(event) {
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      const realObj = intersects.find((item) => {
        const obj = item.object;
        return (
          obj.geometry &&
          !obj.type.includes("Helper") &&
          obj.type !== "Light" &&
          obj.type !== "Camera"
        );
      });
      if (realObj) {
        // console.log("点到物体：", realObj.object.name);
        if (realObj.object.name && window.sceneConfig[realObj.object.name]) {
          // 根据界面勾选判断物体是否可以被点击
          if (window.sceneConfig[realObj.object.name].canClick) {
            if (window.sceneConfig[realObj.object.name].layerProxyClick) {
              window.sceneConfig[realObj.object.name].layerProxyClick(event);
            }
          }
        }
      }
    }
  }

  window.addEventListener("click", onMouseClick);
}

function initGUIControl() {
  gui = new GUI();
}

function addLight(scene) {
  // 环境光 - 提供基础照明
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // 方向光 - 模拟主光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(50, 50, 50); // 从斜上方照射
  scene.add(directionalLight);

  // 点光源 - 增强隧道内部照明
  const pointLight = new THREE.PointLight(0xffffff, 0.8);
  pointLight.position.set(0, 0, 0); // 隧道中心
  scene.add(pointLight);
}

function initRenderer() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function initControl() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    3000,
  );
  camera.position.set(55, 50, 60);
  camera.lookAt(0, 0, 0);
}

// 场景初始化
function init() {
  // 1. 初始化基础环境
  initRenderer();
  // 2. 初始化相机和轨道控制器
  initCamera();
  // 3. 初始化轨道控制器
  initControl();
  // 4. 添加光源
  addLight(scene);
  // 5. 创建射线投射器
  createRayCaster();
  // 6. 初始化GUI控制
  initGUIControl();
  // 7. 初始化场景模型
  initSceneMesh(scene);
  initAxisHelper();
}

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  // 更新挖掘机动画
  window.sceneConfig.excavatorMesh.update();
  // 更新所有tween动画
  TWEEN.update();
}

init();
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 暴露全局调用控制场景方法
window.interface = {
  sceneControl: (item) => {
    let selectStatus = item.checkStatus;
    let layerName = item.layerName;
    console.log(layerName, window.sceneConfig);
    window.sceneConfig[layerName].setVisible(selectStatus);
  },

  refreshMeshCanClick(item) {
    let layerName = item.layerName;
    if (window.sceneConfig[layerName]) {
      window.sceneConfig[layerName].canClick = item.canClick;
    }
  },
};
