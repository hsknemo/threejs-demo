import * as THREE from "three";

export class PathGroup {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    // 点位坐标索引
    this.startPointIndex = 0;

    // 线的坐标

    this.lineCoordinate = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 50, 0),
      new THREE.Vector3(0, 5, 10),
      new THREE.Vector3(0, 5, 20),
    ]);

    this.points = this.lineCoordinate.getPoints(150);

    this.layout(scene);
  }

  layout() {
    console.log("create");
    // 创建路径线
    this.createLineMesh();
    // 创建点
    this.createPointMesh();
  }

  createLineMesh() {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(this.points),
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
      }),
    );
    this.group.add(line);
  }

  createPointMesh() {
    // 创建一个空的 BufferGeometry，不设置初始位置
    const geometry = new THREE.BufferGeometry();
    // 使用 Points 材质，禁用大小衰减
    const point = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0x00ff00,
        size: 5, // 点的大小
        sizeAttenuation: false, // 禁用大小衰减，使点在世界空间中渲染
      }),
    );
    point.name = `run_point`;
    this.group.add(point);
  }

  updatePointAni() {
    // 获取 point
    let pointMesh = this.group.getObjectByName(`run_point`);
    this.startPointIndex %= this.points.length;
    this.startPointIndex += 1;
    if (this.startPointIndex >= this.points.length) {
      this.startPointIndex = 0;
    }
    let curPosition = this.points[this.startPointIndex];

    // 直接更新几何体中点的位置
    const positions = new Float32Array([
      curPosition.x,
      curPosition.y,
      curPosition.z,
    ]);
    pointMesh.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    pointMesh.geometry.attributes.position.needsUpdate = true;

    // 同时更新 AxesHelper 的位置
    pointMesh.position.set(0, 0, 0);
  }

  update() {
    this.updatePointAni();
  }
}
