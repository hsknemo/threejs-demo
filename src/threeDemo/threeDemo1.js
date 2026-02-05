import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


// 3. 核心函数：删除几何体右侧面
function removeRightFace(geo) {
    // 获取顶点位置数组和索引数组（三角面由3个索引组成）
    const positions = geo.attributes.position.array;
    const indices = geo.index.array;
    const newIndices = []; // 保留非右侧面的索引

    // 遍历所有三角面（每3个索引为一个面）
    for (let i = 0; i < indices.length; i += 3) {
        // 获取当前三角面第一个顶点的X坐标（判断是否为右侧面）
        const idx = indices[i];
        const vertexX = positions[idx * 3]; // 顶点X坐标（每个顶点占3位：x,y,z）

        // 容错：浮点精度问题，用差值小于0.001判断
        if (!(Math.abs(vertexX - maxX) < 0.001)) {
            // 非右侧面，保留索引
            newIndices.push(indices[i], indices[i + 1], indices[i + 2]);
        }
    }

    // 创建隧道并添加到场景
    // 修改createTunnel函数
    const createTunnel = (scene, tunelPosition = {}) => {
        const tunnelLength = 1; // 隧道长度
        const tunnelSize = 1; // 隧道宽度

        const tunnelGeometry = new THREE.BoxGeometry(
            tunnelLength,
            tunnelSize,
            tunnelSize
        );
        const tunnelMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2c3e50,
            metalness: 0.2,
            roughness: 0.7,
            side: THREE.BackSide,
        });

        const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);

        // 创建隧道组，用于调整锚点
        const tunnelGroup = new THREE.Group();
        // 将隧道向左移动，使左侧边缘与组原点对齐
        tunnel.position.x = tunnelLength / 2;
        tunnelGroup.add(tunnel);
        // 调整组位置，使隧道回到指定位置
        tunnelGroup.position.set(
            tunelPosition.x || 0,
            tunelPosition.y || 0,
            tunelPosition.z || 0
        );
        scene.add(tunnelGroup);
        return tunnelGroup; // 返回组而不是隧道本身
    };

    function init() {
        // 1. 初始化基础环境
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8f9fa);

        // 相机设置
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(15, 15, 15);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // 轨道控制器
        const controls = new OrbitControls(camera, renderer.domElement);
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
        scene.add(cube);

        // 3. 添加辅助线
        const axesHelper = new THREE.AxesHelper(10);
        scene.add(axesHelper);

        // 4. 光源设置
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        scene.add(directionalLight);

        let tunnel = createTunnel(scene, {
            x: 3,
            y: 1.5,
            z: 0,
        });

        console.log(tunnel, "tunnels");
        let scaleX = 0.1;

        // 5. 动画循环
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            scaleX += 0.001;
            if (scaleX >= 5) {
                scaleX = 5;
            } else {
                tunnel.scale.set(-scaleX, 1, 1);
            }

            renderer.render(scene, camera);
        }
        animate();

        // 6. 窗口自适应
        window.addEventListener("resize", () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    export default {
        init,
    };