import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import city from "./city.js";
import huangPuJiang from "./huangPuJiang.js";

window.camera = null;
window.scene = null;
window.controls = null;
window.renderer = null;
window.raycaster = null;
window.mouse = null;
window.gui = null;

window.sceneConfig = {
  city,
  huangPuJiang,
};

function initSceneMesh(scene) {
  // sceneConfig.city.load(scene)
  sceneConfig.huangPuJiang.load(scene)
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
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.3);
  ambientLight.name = "ambientLight";
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(0, 50, 0);
  scene.add(directionalLight);
}

function initRenderer() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}


var x = 121.49526536464691;//东方明珠经纬度坐标
var y = 31.24189350905988;
function initControl() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  controls.target.set(x, y, 0);
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    0.001,
    3000,
  );

  camera.position.set(x+0.02, y+0.02, 0.02)
  // camera.position.set(5861, 3343, 5513);
  camera.lookAt(0, 0, 0);
}

function init() {
  initRenderer();
  initCamera();
  initControl();
  addLight(scene);
  createRayCaster();
  initGUIControl();
  initSceneMesh(scene);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

init();
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.interface = {
  sceneControl(item) {
    let selectStatus = item.checkStatus;
    let layerName = item.layerName;
    console.log(layerName, window.sceneConfig);
    window.sceneConfig[layerName].setVisible(selectStatus);
  }
}
