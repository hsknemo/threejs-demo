import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, cube, cube2
function render() {

    cube.rotateY(0.01)
    cube2.rotateY(-0.01)
    renderer.render(scene, camera)
    requestAnimationFrame(render)
}

function initControls() {
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.update()
}

function initMesh() {
    const geometry = new THREE.BoxGeometry(5, 5, 5)
    const material = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        // // 调整材质透明度
        // opacity: 0.5,
        // transparent: true,
    })
    cube = new THREE.Mesh(geometry, material)
    scene.add(cube)


    const geometry2 = new THREE.BoxGeometry(2, 2, 2)
    const material2 = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        // 调整材质透明度
    })
    cube2 = new THREE.Mesh(geometry2, material2)
    scene.add(cube2)
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(20, 20, 20)
    camera.lookAt(cube.position)
}


/**
 * 添加辅助坐标轴
 */
function initAxisHelper() {
    const axisHelper = new THREE.AxesHelper(10)
    scene.add(axisHelper)
}

// 添加灯光
function initLight() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    // 平行光
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set( 0, 0, 10)
    directionalLight.target = cube2;

    scene.add(directionalLight);
}

function init() {
    scene = new THREE.Scene()
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
    initMesh()
    initCamera()
    initControls()
    initAxisHelper()
    render()
    resize()
    initLight()
}

function resize() {
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
    })
}



init()
