// 场景循环动画
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);


  if (window.sceneConfig ) {
    window.sceneConfig.pathGroup &&  window.sceneConfig.pathGroup.update()
  }
}

animate();



