// 鼠标射线点击检测

import * as THREE from "three";

window.raycaster = new THREE.Raycaster();
window.mouse = new THREE.Vector2();

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
