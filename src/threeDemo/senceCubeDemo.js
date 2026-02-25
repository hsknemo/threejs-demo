import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import senceCube from "./model/sence/senceCube.js";

window.camera = null;
window.scene = null;
window.controls = null;
window.renderer = null;
window.raycaster = null;
window.mouse = null;
window.gui = null;

window.sceneConfig = {
  senceCube,
};

function initSceneMesh(scene) {
  window.sceneConfig.senceCube.layout(scene);
}

function createRaycaster() {
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

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    3000,
  );
  camera.position.set(55, 50, 60);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

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

  createRaycaster();
  initGUIControl();
  initSceneMesh(scene);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (window.sceneConfig.senceCube.update) {
    window.sceneConfig.senceCube.update();
  }
  renderer.render(scene, camera);
}

init();
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
