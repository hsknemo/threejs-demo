// 场景控制器
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

window.controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

