/*
 * @Author: qinkai 937817514@qq.com
 * @Date: 2026-02-25 08:04:48
 * @LastEditors: qinkai 937817514@qq.com
 * @LastEditTime: 2026-02-26 10:39:22
 * @FilePath: /vite-project/src/threeDemo/model/smoke/cube.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 地质体
import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";

export default {
  width: 50,
  height: 50,
  depth: 50,
  name: "smokeCube",
  materialConfig: {
    color: 0x3498db,
    metalness: 0.3,
    roughness: 0.4,
    transparent: true,
    opacity: 0.5,
    // 关闭深度测试，不被正方体遮挡
    depthTest: false,
    visible: true,
  },
  layout(scene) {
    const cubeGeometry = new THREE.BoxGeometry(
      this.width,
      this.height,
      this.depth,
    );
    const cubeMaterial = new THREE.MeshPhysicalMaterial(this.materialConfig);
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.name = this.name;
    scene.add(cube);
  },
  setVisible() {
    let mesh = findMeshFromScene(this.name);
    mesh.visible = !mesh.visible;
  },

  layerProxyClick(event) {
    console.log(event, "点击了烟雾 cube");
  },
};
