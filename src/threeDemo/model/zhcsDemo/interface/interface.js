// 挂载全局方法
window.interface = {
  sceneControl(item) {
    let selectStatus = item.checkStatus;
    let layerName = item.layerName;
    console.log(layerName, window.sceneConfig);
    window.sceneConfig[layerName].setVisible(selectStatus);
  }
}
