// 环境光
import * as THREE from "three";

const ambientLight = new THREE.AmbientLight(0xffffff, 2.3);
ambientLight.name = "ambientLight";
scene.add(ambientLight);

// 平行光
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(0, 50, 0);
scene.add(directionalLight);
