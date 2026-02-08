import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
let scaleX = 0.1
let camera, scene, controls, renderer, raycaster, mouse
let gl_isExcavating = false
// 创建自定义订阅事件
const startExcavatingEndEvent = new CustomEvent('start-excavating-end', { detail: true });


const tunelConfig = {
  // 代表挖掘机
  car: {
    color: 0x0000ff,
    opacity: 1,
    transparent: true,
    name: 'car',
    radiusTop: .5,
    radiusBottom: 1,
    height: 1,
    visible: true,

    reset() {
      let mesh = findMesh(tunelConfig.car.name)
      mesh.position.set(tunelConfig.car.x, tunelConfig.car.y, tunelConfig.car.z)
    },

    // 展示html
    showHtml(ev){
      const props = {
        target: 'car',
        x: ev.clientX,
        y: ev.clientY,
        name: 'duddu',
        value: '隧道挖了 xxx m'
      }

      const showHtmlEvent = new CustomEvent('show-html', {
        detail: props
      })

      window.dispatchEvent(showHtmlEvent)
    },

    // 更新挖掘机位置
    update(x, y, z) {
      console.log('car run...')
      let carMesh = findMesh('car')
      console.log('更新car 位置', x, y, z)
      carMesh.position.set(x, y, z)
    },

    setVisible() {
      let carMesh = findMesh(tunelConfig.car.name)
      let visible = carMesh.visible;
      carMesh.visible = !visible;
    },

    x: 8.5,
    y: 1,
    z: 0,
  },
  // 表示变化开始挖掘的隧道
  change: {
    color: 0xff0000,
    opacity: 0.9,
    transparent: true,
    name: 'changeTunnel',
    width: .5,
    visible: false,
    height: 4,
    depth: 4,
    tunnelLength: 0,
    zIndex: 2,
    x: 8.5,
    y: 1,
    z: 0,

    reset() {
      let mesh = findMesh(tunelConfig.change.name)
      mesh.position.set(tunelConfig.change.x, tunelConfig.change.y, tunelConfig.change.z)
      scaleX = 0.1
      mesh.scale.set(0, 1, 1)
      mesh.visible = false
    },
    setVisible() {
      let mesh = findMesh(tunelConfig.change.name)
      let visible = mesh.visible;
      mesh.visible = !visible;
    },
    update() {
      tunelConfig.change.update = function () {
        if (!gl_isExcavating) return;

        let currentTunnelGroup = findMesh(tunelConfig.change.name);
        currentTunnelGroup.visible = true;
        if (!currentTunnelGroup) return; // 确保找到了目标对象

        scaleX += 0.1; // 加快增长速度

        // 设置缩放
        currentTunnelGroup.scale.set(scaleX, 1, 1);
        // 动态调整位置
        const halfWidth = tunelConfig.change.width / 2;
        // 当前位置 = 走的位置 - (走的距离 - 1) *  自身宽度
        currentTunnelGroup.position.x = tunelConfig.change.x - (scaleX - 1) * halfWidth;
        currentTunnelGroup.position.y = tunelConfig.change.y;
        currentTunnelGroup.position.z = tunelConfig.change.z;

        console.log('halfWidth', halfWidth)

        // 控制挖掘机前进
        tunelConfig.car.update(currentTunnelGroup.position.x - (scaleX - 1) * halfWidth, currentTunnelGroup.position.y, currentTunnelGroup.position.z)
        // 结束条件
        if (scaleX >= 20) {
          currentTunnelGroup.scale.set(20 , 1, 1);
          threeInterface.startExcavating(false);
          window.dispatchEvent(startExcavatingEndEvent);
        }
      };
    }
  },
  // 隧道默认
  unChange: {
    color: 0x00ff00,
    opacity: .6,
    transparent: true,
    tunnelLength: 5,
    name: 'staticTunnel',
    visible: true,
    width: 10,
    height: 3,
    depth: 3,
    zIndex: 3,
    x: 1,
    y: 1,
    z: 0,
    setVisible() {
      let mesh = findMesh(tunelConfig.unChange.name)
      let visible = mesh.visible;
      mesh.visible = !visible;
    },
  }
}

// 添加点击事件
function createRaycaster(){
  raycaster = new THREE.Raycaster(); // 射线检测器
  mouse = new THREE.Vector2(); // 存储鼠标坐标


  function onMouseClick(event) {
    // 1. 将鼠标屏幕坐标转换为 three.js 归一化设备坐标（NDC）
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // 2. 更新射线：从相机位置指向鼠标点击的位置
    raycaster.setFromCamera(mouse, camera);

    // 3. 检测射线与哪些物体相交（返回相交的物体数组）
    const intersects = raycaster.intersectObjects(scene.children);

    // 4. 处理相交结果
    if (intersects.length > 0) {
      // 获取第一个相交的物体
      const firstIntersect = intersects[0].object;
      console.log(firstIntersect, '点击的是')

      if (firstIntersect.name && tunelConfig[firstIntersect.name]) {
        tunelConfig[firstIntersect.name].showHtml(event)
      }
    }

  }




  window.addEventListener('click', onMouseClick);
}
// 创建隧道并添加到场景
// 修改createTunnel函数
const createTunnel = (scene, tunelConfig = {}, name) => {
  const tunnelGeometry = new THREE.BoxGeometry(
    tunelConfig.width,
    tunelConfig.height,
    tunelConfig.depth,
  );
  const tunnelMaterial = new THREE.MeshPhysicalMaterial({
    color: tunelConfig.color,
    metalness: 0.2,
    roughness: 0.7,
    side: THREE.BackSide,
    transparent: tunelConfig.transparent,
    opacity: tunelConfig.opacity,
  });

  const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);

  // 创建隧道组，用于调整锚点
  const tunnelGroup = new THREE.Group();
  // 将隧道向左移动，使左侧边缘与组原点对齐
  tunnel.position.x = tunelConfig.tunnelLength / 2;
  tunnelGroup.add(tunnel);
  // 调整组位置，使隧道回到指定位置
  tunnelGroup.position.set(
    tunelConfig.x || 0,
    tunelConfig.y || 0,
    tunelConfig.z || 0
  );
  tunnelGroup.name = name
  tunnelGroup.visible = tunelConfig.visible
  tunnelGroup.renderOrder = tunelConfig.zIndex
  scene.add(tunnelGroup);
  return tunnelGroup; // 返回组而不是隧道本身
};

// 创建挖掘机模型
const createCar = (scene, tunelConfig = {}, name) => {
  const geometry = new THREE.CylinderGeometry(tunelConfig.radiusTop, tunelConfig.radiusBottom, 1, 32);
  const carMaterial = new THREE.MeshPhysicalMaterial({
    color: tunelConfig.color,
    side: THREE.DoubleSide,
  })
  const car = new THREE.Mesh(geometry, carMaterial);
  car.name = name
  car.position.set(
    tunelConfig.x,
    tunelConfig.y,
    tunelConfig.z
  )
  // 调整位置
  car.rotateX(Math.PI / 2)
  car.rotateZ(Math.PI / 2)
  car.visible = tunelConfig.visible
  scene.add(car)
  return car
}

init()

function init() {
  // 1. 初始化基础环境
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8f9fa);

  // 相机设置
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );
  camera.position.set(15, 15, 15);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 2. 创建正方体
  const cubeGeometry = new THREE.BoxGeometry(15, 15, 15);
  const cubeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x3498db,
    metalness: 0.3,
    roughness: 0.4,
    transparent: true,
    opacity: 0.5,
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  // scene.add(cube);

  // 3. 添加辅助线
  const axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);

  // 4. 光源设置
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 5);
  scene.add(directionalLight);

  // 隧道进度模型
  let tunnel = createTunnel(scene,  tunelConfig.change, tunelConfig.change.name);

  // 隧道默认模型
  let tunnel2 = createTunnel(scene,  tunelConfig.unChange, tunelConfig.unChange.name);

  // 挖掘机模型
  let car = createCar( scene, tunelConfig.car, tunelConfig.car.name)



  createRaycaster()

}


function findMesh(name) {
  console.log(scene)
  return scene.children.find(child => child.name === name);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  tunelConfig.change.update()
  renderer.render(scene, camera);
}

animate();



window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


window.threeInterface = {
  startExcavating(isExcavating) {
    gl_isExcavating = isExcavating
  },
  resetExcavating() {
    gl_isExcavating = false
    tunelConfig.car.reset()
    tunelConfig.change.reset()
  },

  // 控制静态隧道是否显示
  defaultTunnelControlVisible() {
    tunelConfig.unChange.setVisible()
  },

  // 隧道进度控制显示
  tunnelProgressControlVisible() {
    tunelConfig.change.setVisible()
  },

  // 挖掘机控制显示
  carControlVisible() {
    tunelConfig.car.setVisible()
  },

}
