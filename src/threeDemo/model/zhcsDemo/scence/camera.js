// 相机
import * as THREE from "three";

window.camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.1,
  3000,
);
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

