import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import senceCube from "./model/sence/senceCube.js";
import cubeHotLayer from "./model/cubeHot/cubeHotLayer.js";
import smokeLayer from "./model/smoke/smokePoint.js";
import cubeBorderLayer from "./model/cube/cubeBorderLayer.js";
import smokeCube from "./model/smoke/cube.js";
import { findMeshFromScene } from "./utils/meshControl.js";
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
let miniHeight = 200;
let miniMargin = 150;

window.sceneConfig = {
  senceCube,
  cubeHotLayer,
  smokeLayer,
  cubeBorderLayer,
  smokeCube,
};

function initSceneMesh(scene) {
  window.sceneConfig.senceCube.layout(scene);
  window.sceneConfig.cubeBorderLayer.layout(scene);
  window.sceneConfig.cubeHotLayer.layout(scene);
  window.sceneConfig.smokeLayer.layout(scene);
  window.sceneConfig.smokeCube.layout(scene);
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
    right: 50px;
    top: 100px;
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

function initCutUI() {
  setTimeout(() => {
    // 创建裁切平面的GUI控制
    const cutFolder = gui.addFolder("场景裁切");
    let target = findMeshFromScene("smokeCube");
    target.cutX = 0;
    target.cutY = 0;
    target.cutZ = 0;
    cutFolder
      .add(target, "cutX", -100, 100, 1)
      .name("裁切平面x")
      .onChange((v) => {
        window.interface.sceneClip(target.cutX, target.cutY, target.cutZ);
      });

    cutFolder
      .add(target, "cutY", -100, 100, 1)
      .name("裁切平面y")
      .onChange((v) => {
        window.interface.sceneClip(target.cutX, target.cutY, target.cutZ);
      });

    cutFolder
      .add(target, "cutZ", -100, 100, 1)
      .name("裁切平面z")
      .onChange((v) => {
        window.interface.sceneClip(target.cutX, target.cutY, target.cutZ);
      });
  }, 2000);
}
initCutUI();

// 场景裁切调用方法
window.interface.sceneClip = (x, y, z) => {
  // 裁切立方体
  // if (!item || !item.clipPlanes) return;

  // 获取所有需要裁切的物体
  const objectsToClip = [];
  Object.values(window.sceneConfig).forEach((config) => {
    console.log(config.mesh, config);
    let mesh = findMeshFromScene(config.name);
    if (mesh) {
      objectsToClip.push(mesh);
    }
  });

  // 创建裁切平面
  const clipPlanes = [];
  const plane = new THREE.Plane(new THREE.Vector3(x, y, z), 50);
  clipPlanes.push(plane);
  // 应用裁切平面到物体
  objectsToClip.forEach((object) => {
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => {
          material.clippingPlanes = clipPlanes;
          material.clipShadows = true; // 可选：裁切阴影
        });
      } else {
        object.material.clippingPlanes = clipPlanes;
        object.material.clipShadows = true;
      }
    }
  });

  // 启用渲染器裁切
  renderer.localClippingEnabled = true;
};
