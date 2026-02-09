import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { TransformControls } from 'three/addons/controls/TransformControls.js';
let scaleY = .1;
let step = 0.01;
let camera, scene, controls, renderer, raycaster, mouse, gui;
// 控制动画暂停或者执行
let gl_isExcavating = false;
// 创建自定义订阅事件
const startExcavatingEndEvent = new CustomEvent("start-excavating-end", {
    detail: true,
});

const tunelConfig = {
    // 地面配置
    ground: {
        color: "#e2e2e2",
        opacity: 1,
        transparent: true,
        name: "ground",
        width: 50,
        height: 50,
        visible: true,
        x: 0,
        y: 0,
        z: 0,
        setVisible() {
            let mesh = findMesh(tunelConfig.ground.name);
            mesh.visible = !mesh.visible;
        },
    },
    // 代表挖掘机
    car: {
        color: 0x0000ff,
        opacity: 1,
        transparent: true,
        name: "car",
        radiusTop: 0.5,
        radiusBottom: 1,
        height: 1,
        visible: true,

        reset() {
            let mesh = findMesh(tunelConfig.car.name);
            mesh.position.set(
                tunelConfig.car.x,
                tunelConfig.car.y,
                tunelConfig.car.z,
            );
        },

        // 展示html
        showHtml(ev) {
            const props = {
                target: "car",
                x: ev.clientX,
                y: ev.clientY,
                name: "duddu",
                value: "隧道挖了 xxx m",
            };

            const showHtmlEvent = new CustomEvent("show-html", {
                detail: props,
            });

            window.dispatchEvent(showHtmlEvent);
        },

        // 更新挖掘机位置
        update(x, y, z) {
            console.log("car run...");
            let carMesh = findMesh("car");
            console.log("更新car 位置", x, y, z);
            carMesh.position.set(x, y, z);
        },

        setVisible() {
            let carMesh = findMesh(tunelConfig.car.name);
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
        name: "digProgress",
        visible: false,
        zIndex: 2,
        x: 0,
        y: 0,
        z: 0,
        scaleX: 1,
        scaleY: 2.1,
        scaleZ: 2.1,
        tunnelLength: 2,

        reset() {
            let mesh = findMesh(tunelConfig.change.name);
            mesh.position.set(
                tunelConfig.change.x,
                tunelConfig.change.y,
                tunelConfig.change.z,
            );
            scaleY = 0.1;
            mesh.scale.set(0, 1, 1);
            mesh.visible = false;
        },
        setVisible() {
            let mesh = findMesh(tunelConfig.change.name);
            let visible = mesh.visible;
            mesh.visible = !visible;
        },
        update() {
                if (!gl_isExcavating) return;

                let currentTunnelGroup = findMesh(tunelConfig.change.name);

                currentTunnelGroup.visible = true;
                if (!currentTunnelGroup) return; // 确保找到了目标对象

                scaleY += step; // 加快增长速度

                // 设置缩放

                // 动态调整位置，使模型向左侧延伸
                const tunnelLength = tunelConfig.change.tunnelLength;
                currentTunnelGroup.scale.x = -scaleY
                tunelConfig.car.update(currentTunnelGroup.position.x - scaleY * tunnelLength / 2, currentTunnelGroup.position.y, currentTunnelGroup.position.z)
                    // 结束条件
                if (scaleY >= 1) {
                    threeInterface.startExcavating(false);
                    window.dispatchEvent(startExcavatingEndEvent);
                }
        },
    },
    // 隧道默认
    unChange: {
        color: 0x00ff00,
        opacity: 0.6,
        transparent: true,
        tunnelLength: 5,
        name: "staticTunnel",
        visible: true,
        width: 10,
        height: 3,
        depth: 3,
        zIndex: 3,
        x: 1,
        y: 1,
        z: 0,
        setVisible() {
            let mesh = findMesh(tunelConfig.unChange.name);
            let visible = mesh.visible;
            mesh.visible = !visible;
        },
    },
};

// 添加点击事件
function createRaycaster() {
    raycaster = new THREE.Raycaster(); // 射线检测器
    mouse = new THREE.Vector2(); // 存储鼠标坐标

    function onMouseClick(event) {
        // 1. 将鼠标屏幕坐标转换为 three.js 归一化设备坐标（NDC）
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 2. 更新射线：从相机位置指向鼠标点击的位置
        raycaster.setFromCamera(mouse, camera);

        // 3. 检测射线与哪些物体相交（返回相交的物体数组）
        const intersects = raycaster.intersectObjects(scene.children);

        // 4. 处理相交结果
        if (intersects.length > 0) {
            // 获取第一个相交的物体
            const firstIntersect = intersects[0].object;

            if (firstIntersect.name && tunelConfig[firstIntersect.name]) {
                if (tunelConfig[firstIntersect.name].showHtml) {
                    tunelConfig[firstIntersect.name].showHtml(event);
                }
            }
        }
    }

    window.addEventListener("click", onMouseClick);
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
        tunelConfig.z || 0,
    );
    tunnelGroup.name = name;
    tunnelGroup.visible = tunelConfig.visible;
    tunnelGroup.renderOrder = tunelConfig.zIndex;
    scene.add(tunnelGroup);
    return tunnelGroup; // 返回组而不是隧道本身
};

// 创建挖掘机模型
const createCar = (scene, tunelConfig = {}, name) => {
    const geometry = new THREE.CylinderGeometry(
        tunelConfig.radiusTop,
        tunelConfig.radiusBottom,
        1,
        32,
    );
    const carMaterial = new THREE.MeshPhysicalMaterial({
        color: tunelConfig.color,
        side: THREE.DoubleSide,
    });
    const car = new THREE.Mesh(geometry, carMaterial);
    car.name = name;
    car.position.set(tunelConfig.x, tunelConfig.y, tunelConfig.z);
    // 调整位置
    car.rotateX(Math.PI / 2);
    car.rotateZ(Math.PI / 2);
    car.visible = tunelConfig.visible;
    scene.add(car);
    return car;
};

// 地面模型
const createGround = (scene, tunelConfig = {}, name) => {
    const groundGeometry = new THREE.PlaneGeometry(
        tunelConfig.width,
        tunelConfig.height,
    );
    const groundMaterial = new THREE.MeshPhysicalMaterial({
        color: tunelConfig.color,
        side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.name = name;
    ground.position.set(tunelConfig.x, tunelConfig.y, tunelConfig.z);
    ground.rotateX(-Math.PI / 2);
    ground.visible = tunelConfig.visible;
    scene.add(ground);
};

init();

function loaderModel(scene) {
    const loader = new OBJLoader();
    let modelUrl = new URL(
        `../threeDemo/model/tunnel/tunnel.obj`,
        import.meta.url,
    ).href;
    loader.load(modelUrl, (obj) => {
        console.log("OBJ模型加载完成:", obj);
        obj.name = "staticTunnel";
        obj.rotateX(-Math.PI / 2);
        obj.rotateZ(-Math.PI / 2);
        // obj.scale.set(2, 2, 2);
        // obj.position.set(-5, 0, 0);
        obj.visible = tunelConfig.unChange.visible
        scene.add(obj);

        obj.traverse((child) => {
            // 只处理网格对象
            if (child.isMesh) {
                // 提取BufferGeometry（克隆避免修改原模型）
                let tunnelGeometry = child.geometry.clone();

                initDigProgress(scene, tunnelGeometry);

                // 停止遍历（如果只有一个核心Mesh）
                return false;
            }
        });
    });
}


/**
 * 初始化挖掘进度
 */
function initDigProgress(scene, tunnelGeometry) {
    const progressMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000, // 进度模型的绿色
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
    });
    let mesh = new THREE.Mesh(tunnelGeometry, progressMaterial);
    mesh.rotateX(-Math.PI / 2);
    mesh.rotateZ(-Math.PI / 2);
    mesh.renderOrder = 6
    mesh.translateY(2.4)
    const group = new THREE.Group();
    group.add(mesh);
    group.name = "digProgress";
    group.scale.y = 1.2
    group.scale.z = 1
    scene.add(group);
    // 显示mesh 的辅助线
    const axesHelper = new THREE.AxesHelper(15);
     // 将辅助器添加为 mesh 的子对象（关键！跟随 mesh 坐标系）
    group.add(axesHelper);
    group.translateX(5)
    // mesh.add(axesHelper);

    createDigFolder()
}

function initDirControl() {
    gui = new GUI();
}

function createDigFolder() {
    let digFolder = gui.addFolder("进度控制测试");
    console.log('dig', findMesh("digProgress"))
    findMesh("digProgress").x = 0;
    findMesh("digProgress").y = 0;
    findMesh("digProgress").z = 0;

    findMesh("digProgress").changeScaleX = 0;
    findMesh("digProgress").changeScaleY = 0;
    findMesh("digProgress").changeScaleZ = 0;

    digFolder
        .add(findMesh("digProgress"), "x", -25, 25, 1)
        .name("prograss x")
        .onChange((v) => {
            findMesh("digProgress").position.x = v;
        });

    digFolder
        .add(findMesh("digProgress"), "y", 0, 1, 0.1)
        .name("prograss y")
        .onChange((v) => {
            findMesh("digProgress").position.y = v;
        });

    digFolder
        .add(findMesh("digProgress"), "z", 0, 1, 0.1)
        .name("prograss z")
        .onChange((v) => {
            findMesh("digProgress").position.z = v;
        });

    // digFolder.add(findMesh('digProgress'), 'changeScaleX', 0, 50, 1)
    //   .name('prograss scale x')
    //   .onChange(v => {
    //     findMesh('digProgress').scale.x = v
    //   })

    digFolder
        .add(findMesh("digProgress"), "changeScaleY", -25, 25, 1)
        .name("prograss scale y")
        .onChange((v) => {
            findMesh("digProgress").scale.y = v;
        });

    // digFolder.add(findMesh('digProgress'), 'changeScaleZ', 0, 1, .1)
    //   .name('prograss scale z')
    //   .onChange(v => {
    //     findMesh('digProgress').scale.z = v
    //   })
}

function init() {
    // 1. 初始化基础环境
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // 相机设置
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        3000,
    );
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
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

    // 挖掘机模型
    let car = createCar(scene, tunelConfig.car, tunelConfig.car.name);

    // 地面模型
    let ground = createGround(scene, tunelConfig.ground, tunelConfig.ground.name);

    createRaycaster();

    loaderModel(scene);

    initDirControl();



}

function findMesh(name) {
    return scene.children.find((child) => child.name === name);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    tunelConfig.change.update();
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
        gl_isExcavating = isExcavating;
    },
    resetExcavating() {
        gl_isExcavating = false;
        tunelConfig.car.reset();
        tunelConfig.change.reset();
    },

    // 控制静态隧道是否显示
    defaultTunnelControlVisible() {
        tunelConfig.unChange.setVisible();
    },

    // 隧道进度控制显示
    tunnelProgressControlVisible() {
        tunelConfig.change.setVisible();
    },

    // 挖掘机控制显示
    carControlVisible() {
        tunelConfig.car.setVisible();
    },
};
