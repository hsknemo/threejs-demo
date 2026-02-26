import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import senceCube from "./model/sence/senceCube.js";
import cubeHotLayer from "./model/cubeHot/cubeHotLayer.js";
import smokeLayer from "./model/smoke/smokePoint.js";
import cubeBorderLayer from "./model/cube/cubeBorderLayer.js";
window.camera = null;
window.scene = null;
window.controls = null;
window.renderer = null;
window.raycaster = null;
window.mouse = null;
window.gui = null;

// 小窗口视图
let miniCamera, miniRenderer, miniControls;
let miniWidth = 200;
let miniHeight = 150;
let miniMargin = 10;

window.sceneConfig = {
  senceCube,
  cubeHotLayer,
  smokeLayer,
  cubeBorderLayer,
};

function initSceneMesh(scene) {
  window.sceneConfig.senceCube.layout(scene);
  window.sceneConfig.cubeBorderLayer.layout(scene);
  window.sceneConfig.cubeHotLayer.layout(scene);
  window.sceneConfig.smokeLayer.layout(scene);
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
        console.log("点到物体：", realObj.object.name);
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
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(0, 50, 0);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
  pointLight.position.set(-25, 15, 20);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0xffffff, 1.0, 100);
  pointLight2.position.set(25, 15, 20);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xffffff, 1.0, 100);
  pointLight3.position.set(-25, 15, -20);
  scene.add(pointLight3);
}

function initRenderer() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

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

function init() {
  initRenderer();
  initCamera();
  initControl();
  addLight(scene);
  createRayCaster();
  initGUIControl();
  initSceneMesh(scene);
  createMiniView();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (window.sceneConfig.senceCube.update) {
    window.sceneConfig.senceCube.update();
  }
  if (window.sceneConfig.cubeHotLayer.update) {
    window.sceneConfig.cubeHotLayer.update();
  }
  if (window.sceneConfig.smokeLayer.update) {
    window.sceneConfig.smokeLayer.update();
  }
  renderer.render(scene, camera);
  if (miniCamera && miniRenderer && controls) {
    if (controls.enabled) {
      miniCamera.position.copy(camera.position);
      miniCamera.quaternion.copy(camera.quaternion);
    }
  }
  if (miniCamera && miniRenderer && miniControls) {
    miniControls.update();
    if (miniControls.enabled) {
      camera.position.copy(miniCamera.position);
      camera.quaternion.copy(miniCamera.quaternion);
    }
  }
  if (miniCamera && miniRenderer) {
    miniRenderer.render(window.miniScene, miniCamera);
  }
}

init();
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function createMiniView() {
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    top: ${miniMargin}px;
    left: ${miniMargin}px;
    width: ${miniWidth}px;
    height: ${miniHeight}px;
    border: 2px solid #00ff00;
    border-radius: 4px;
    overflow: hidden;
    z-index: 1000;
    background: #1a1a1a;
  `;
  document.body.appendChild(container);

  miniRenderer = new THREE.WebGLRenderer({ antialias: true });
  miniRenderer.setSize(miniWidth, miniHeight);
  miniRenderer.domElement.style.width = "100%";
  miniRenderer.domElement.style.height = "100%";
  container.appendChild(miniRenderer.domElement);

  const miniScene = new THREE.Scene();
  miniScene.background = new THREE.Color(0x1a1a1a);
  window.sceneConfig.cubeBorderLayer.layout(miniScene);
  const borderMesh = miniScene.children.find(
    (child) => child.name === "cubeBorder",
  );
  if (borderMesh) {
    miniScene.clear();
    miniScene.add(borderMesh);
  }

  const miniAmbientLight = new THREE.AmbientLight(0xffffff, 0.6);
  miniScene.add(miniAmbientLight);
  const miniDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  miniDirectionalLight.position.set(30, 50, 30);
  miniScene.add(miniDirectionalLight);

  miniCamera = camera.clone();
  miniCamera.position.set(55, 50, 60);
  miniCamera.lookAt(0, 0, 0);

  miniControls = new OrbitControls(miniCamera, miniRenderer.domElement);
  miniControls.enableDamping = true;
  miniControls.enableZoom = true;
  miniControls.enableRotate = true;
  miniControls.enablePan = true;
  miniControls.enabled = false;

  miniRenderer.domElement.addEventListener("mouseenter", () => {
    miniControls.enabled = true;
    controls.enabled = false;
  });

  miniRenderer.domElement.addEventListener("mouseleave", () => {
    miniControls.enabled = false;
    controls.enabled = true;
  });

  window.miniScene = miniScene;
}
