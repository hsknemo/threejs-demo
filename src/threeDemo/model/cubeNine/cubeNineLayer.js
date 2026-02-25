// 面有六个 每一个分成九个小面，然后每个面可以设置自己的颜色及文字
import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";

/**
 * 创建带有颜色和文字的Canvas纹理
 * @param {string} text - 要显示的文字
 * @param {string} color - 背景颜色
 * @param {string} textColor - 文字颜色
 * @returns {THREE.CanvasTexture} - 生成的纹理
 */
function createTexturedCanvas(text, color, textColor = "#ffffff") {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // 填充背景颜色
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制文字
  ctx.fillStyle = textColor;
  ctx.font = "bold 80px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default {
  width: 50,
  height: 50,
  depth: 50,
  name: "cubeNineLayer",
  // 每个面分成3x3=9个小格
  gridSize: 3,
  // 存储所有面组的引用，用于后续更新
  faceGroups: {},
  // 存储所有小格的引用，用于更新
  cellMeshes: {},
  // 每个面的扩散配置，0表示不扩散
  faceExpand: {
    right: 15,
    left: 10,
    top: 15,
    bottom: 25,
    front: 15,
    back: 15,
  },
  // 每个面的配置，可以自定义颜色和文字
  faceConfigs: {
    // right (x+)
    right: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"],
    // left (x-)
    left: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"],
    // top (y+)
    top: ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"],
    // bottom (y-)
    bottom: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9"],
    // front (z+)
    front: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9"],
    // back (z-)
    back: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9"],
  },
  // 每个面的背景颜色配置
  faceColors: {
    right: "#e74c3c",
    left: "#3498db",
    top: "#2ecc71",
    bottom: "#f39c12",
    front: "#9b59b6",
    back: "#1abc9c",
  },
  /**
   * 创建带文字和颜色的小平面
   * @param {string} text - 文字内容
   * @param {string} color - 背景颜色
   * @param {number} width - 平面宽度
   * @param {number} height - 平面高度
   * @returns {THREE.Mesh} - 创建的小平面
   */
  createFacePlate(text, color, width, height) {
    // 创建Canvas纹理（只包含文字）
    const texture = createTexturedCanvas(text, "#ffffff");
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      color: color,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const geometry = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  },
  /**
   * 创建立方体的六个面，每面分成9个小格
   * @param {THREE.Scene} scene - Three.js 场景对象
   */
  layout(scene) {
    // 创建立方体组
    const cubeGroup = new THREE.Group();
    cubeGroup.name = this.name;

    // 计算每个小格的尺寸
    const cellSize = this.width / this.gridSize;

    // 定义六个面的方向和旋转，以及扩散方向向量
    const faces = [
      {
        name: "right",
        position: new THREE.Vector3(this.width / 2, 0, 0),
        rotation: new THREE.Euler(0, Math.PI / 2, 0),
        direction: new THREE.Vector3(1, 0, 0), // 向x正方向扩散
      },
      {
        name: "left",
        position: new THREE.Vector3(-this.width / 2, 0, 0),
        rotation: new THREE.Euler(0, -Math.PI / 2, 0),
        direction: new THREE.Vector3(-1, 0, 0), // 向x负方向扩散
      },
      {
        name: "top",
        position: new THREE.Vector3(0, this.height / 2, 0),
        rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
        direction: new THREE.Vector3(0, 1, 0), // 向y正方向扩散
      },
      {
        name: "bottom",
        position: new THREE.Vector3(0, -this.height / 2, 0),
        rotation: new THREE.Euler(Math.PI / 2, 0, 0),
        direction: new THREE.Vector3(0, -1, 0), // 向y负方向扩散
      },
      {
        name: "front",
        position: new THREE.Vector3(0, 0, this.depth / 2),
        rotation: new THREE.Euler(0, 0, 0),
        direction: new THREE.Vector3(0, 0, 1), // 向z正方向扩散
      },
      {
        name: "back",
        position: new THREE.Vector3(0, 0, -this.depth / 2),
        rotation: new THREE.Euler(0, Math.PI, 0),
        direction: new THREE.Vector3(0, 0, -1), // 向z负方向扩散
      },
    ];

    // 遍历六个面
    faces.forEach((face) => {
      // 获取当前面的配置
      const texts = this.faceConfigs[face.name];
      const baseColor = this.faceColors[face.name];

      // 创建一个面组
      const faceGroup = new THREE.Group();
      faceGroup.rotation.copy(face.rotation);
      faceGroup.position.copy(face.position);
      // 保存扩散方向到面组
      faceGroup.userData.expandDirection = face.direction;
      faceGroup.userData.originalPosition = face.position.clone();

      // 存储面组引用
      this.faceGroups[face.name] = faceGroup;
      // 存储该面所有小格的引用
      this.cellMeshes[face.name] = [];

      // 遍历3x3网格
      for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
          // 计算每个小格的位置（相对于面中心）
          // 行索引从下到上，列索引从左到右
          const x = (col - 1) * cellSize;
          const y = (1 - row) * cellSize;

          // 获取对应的文字
          const textIndex = row * this.gridSize + col;
          const text = texts[textIndex];

          // 直接使用基础颜色
          const cellColor = baseColor;

          // 创建小平面
          const cellMesh = this.createFacePlate(
            text,
            cellColor,
            cellSize * 0.95,
            cellSize * 0.95,
          );
          cellMesh.position.set(x, y, 0);

          // 保存原始位置，用于扩散计算
          cellMesh.userData.originalPosition = new THREE.Vector3(x, y, 0);

          faceGroup.add(cellMesh);
          // 存储小格引用
          this.cellMeshes[face.name].push(cellMesh);
        }
      }

      cubeGroup.add(faceGroup);
    });

    // 添加到场景
    scene.add(cubeGroup);
  },
  /**
   * 设置指定面的扩散大小
   * @param {string} faceName - 面名称 (right, left, top, bottom, front, back)
   * @param {number} expandSize - 扩散大小，0表示不扩散
   */
  setExpand(faceName, expandSize) {
    if (this.faceExpand.hasOwnProperty(faceName)) {
      this.faceExpand[faceName] = expandSize;
    }
  },
  /**
   * 更新所有面的扩散状态
   * 需要在每一帧调用
   */
  update() {
    // 遍历六个面
    Object.keys(this.faceGroups).forEach((faceName) => {
      const faceGroup = this.faceGroups[faceName];
      const expandSize = this.faceExpand[faceName];
      const direction = faceGroup.userData.expandDirection;

      // 更新面组的整体位置（向外扩散）
      // 子对象（cell）会自动跟随移动，不需要单独处理
      const originalPos = faceGroup.userData.originalPosition;
      faceGroup.position
        .copy(originalPos)
        .addScaledVector(direction, expandSize);
    });
  },
  setVisible() {
    let mesh = findMeshFromScene(this.name);
    mesh.visible = !mesh.visible;
  },
};
