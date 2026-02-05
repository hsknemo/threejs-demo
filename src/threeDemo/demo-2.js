import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, cube, cube2
let step = 0.01
function render() {
    // 为什么cube 不会旋转呢？
    cube.rotation.x += step
    cube.rotation.y += step
    cube.rotation.z += step
    // 让立方体旋转
    cube2.rotation.x -= step
    cube2.rotation.y -= step
    cube2.rotation.z -= step


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
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        // 调整材质透明度
        opacity: 0.5,
        transparent: true,
    })
    cube = new THREE.Mesh(geometry, material)
    scene.add(cube)


    const geometry2 = new THREE.BoxGeometry(2, 2, 2)
    const material2 = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        opacity: 1,
        // 调整材质透明度
    })
    cube2 = new THREE.Mesh(geometry2, material2)
    scene.add(cube2)
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 15
    camera.lookAt(cube.position)
}

function init() {
    scene = new THREE.Scene()
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
    initMesh()
    initCamera()
    initControls()
    render()

}



init()
