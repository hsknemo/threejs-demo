// 创建着色器材质
import * as THREE from "three";
import vertexShader from "./vertexShader.glsl?raw";
import fragmentShader from "./fragment.glsl?raw";
const texture = new THREE.TextureLoader().load("/texture/st.jpg");
const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
      map: {
        value: texture
      }
    }
});
let posiVect = []
for (let i = 0; i < 500; i++) {
  posiVect.push([new THREE.Vector3(Math.random() * 50 - 5, Math.random() * 50 - 5, Math.random() * 50 - 5)])
}

let group = new THREE.Group()
const geometry = new THREE.PlaneGeometry(.1, .4)

group.name = 'boxGroup'
posiVect.forEach(item => {
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
  })
  let mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(item[0].x, item[0].y, item[0].z)
  // mesh.material.color = new THREE.Color(Math.random(), Math.random(), Math.random())

  mesh.material.color = new THREE.Color(0xffffff)
  group.add(mesh)
})
console.log(group)
// 多个盒子
scene.add(group);

window.gBoxDown = () => {
  let boxGroup = scene.getObjectByName('boxGroup')
  boxGroup.children.forEach(item => {
    item.position.y -= 0.5 + Math.random() * 0.0001
    item.position.x -= 0.1
    if (item.position.y < -3) {
      item.position.y = 50
      item.position.x = Math.random() * 50 - 5
      item.position.z = Math.random() * 50 - 5
    }
  })
}

