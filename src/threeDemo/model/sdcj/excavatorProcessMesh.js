/*
 * @Author: qinkai 937817514@qq.com
 * @Date: 2026-02-26 17:20:38
 * @LastEditors: qinkai 937817514@qq.com
 * @LastEditTime: 2026-02-27 09:50:53
 * @FilePath: /vite-project/src/threeDemo/model/sdcj/excavatorProcessMesh.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";

// 挖掘机挖掘进度
export default {
  name: "excavatorProcessMesh",
  groupName: "excavatorProcessGroup",

  // 动画状态
  animation: {
    currentScaleZ: 0.1,
    targetScaleZ: 10,
    speed: 0.01,
  },

  layout(scene, tunnelGeometry) {
    let cloneGeo = tunnelGeometry.clone();
    const progressMaterial = new THREE.MeshBasicMaterial({
      color: "#1eff57", // 进度模型的绿色
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      visible: false,
    });
    let mesh = new THREE.Mesh(cloneGeo, progressMaterial);
    mesh.renderOrder = 6;
    const group = new THREE.Group();
    mesh.name = this.name;
    mesh.geometry.translate(0, 0, 25);
    // mesh 长度调小
    mesh.scale.set(1.3, 1.1, 0);
    // 布局：让隧道动画保持在父级group 右侧，做单侧动画使用
    // 布局：保持跟隧道一样, 防止交叉增加细微参数
    // mesh.scale.set(
    //   sceneConfig.tunnelMesh.height + 0.5,
    //   sceneConfig.tunnelMesh.height,
    //   sceneConfig.tunnelMesh.height + 0.5,
    // );
    group.add(mesh);
    scene.add(group);

    group.name = this.groupName;

    // addMeshAxis(mesh);
    mesh.x = 0;
    group.position.set(0, 5, 26);
    let digFolder = gui.addFolder("控制-进度测试");
    digFolder
      .add(mesh, "x", -25, 25, 0.1)
      .name("prograss x")
      .onChange((v) => {
        mesh.scale.set(1, 1.2, v);
      });
  },
  move(carPosi) {
    let mesh = findMeshFromScene(this.name);
    if (mesh) {
      if (carPosi > 0) return;
      // 如何根据车的进度来更新进度条
      // 进度条长度为20m, 车的进度为carPosi, 则进度条进度为carPosi/20
      mesh.scale.set(1.3, 1.1, carPosi / 20);
    }
  },

  // 动画更新
  update() {
    const group = findMeshFromScene(this.groupName);
    if (group) {
      const mesh = group.getObjectByName(this.name);
      if (mesh) {
        // 朝着z方向扩大scale
        this.animation.currentScaleZ += this.animation.speed;

        // 限制最大值
        if (this.animation.currentScaleZ > this.animation.targetScaleZ) {
          this.animation.currentScaleZ = 0.1; // 重置到初始值
        }

        // 应用scale
        mesh.scale.set(1, 1.2, this.animation.currentScaleZ);
      }
    }
  },

  setVisible(visible) {
    let mesh = findMeshFromScene(this.groupName);
    if (Object.prototype.toString.call(visible) === "[object Boolean]") {
      mesh.visible = visible;
      return;
    }
    mesh.visible = !mesh.visible;
  },
};

// 显示mesh 的辅助线
function addMeshAxis(mesh, size = 15) {
  // 显示mesh 的辅助线
  const axesHelper = new THREE.AxesHelper(size);
  // 将辅助器添加为 mesh 的子对象（关键！跟随 mesh 坐标系）
  mesh.add(axesHelper);
  // 将轴移动到mesh的右侧
}
