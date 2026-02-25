import * as THREE from "three";
import { findMeshFromScene } from "../../utils/meshControl.js";

// 传感器层
export default {
  width: 50,
  height: 50,
  depth: 50,
  name: "sensorLayer",
  sensorGroup: null,
  sensorCountPerFace: 3,
  materialConfig: {
    color: 0x888888,
  },
  layout(scene) {
    this.sensorGroup = new THREE.Group();
    this.sensorGroup.name = this.name;

    const halfW = this.width / 2;
    const halfH = this.height / 2;
    const halfD = this.depth / 2;

    const faceConfigs = [
      {
        name: "right",
        normal: [1, 0, 0],
        position: [halfW, 0, 0],
        rotation: [0, Math.PI / 2, 0],
      },
      {
        name: "left",
        normal: [-1, 0, 0],
        position: [-halfW, 0, 0],
        rotation: [0, -Math.PI / 2, 0],
      },
      {
        name: "top",
        normal: [0, 1, 0],
        position: [0, halfH, 0],
        rotation: [-Math.PI / 2, 0, 0],
      },
      {
        name: "bottom",
        normal: [0, -1, 0],
        position: [0, -halfH, 0],
        rotation: [Math.PI / 2, 0, 0],
      },
      {
        name: "front",
        normal: [0, 0, 1],
        position: [0, 0, halfD],
        rotation: [0, 0, 0],
      },
      {
        name: "back",
        normal: [0, 0, -1],
        position: [0, 0, -halfD],
        rotation: [0, Math.PI, 0],
      },
    ];

    faceConfigs.forEach((face) => {
      for (let i = 0; i < this.sensorCountPerFace; i++) {
        const sensor = this.createSensor(face, i);
        this.sensorGroup.add(sensor);
      }
    });

    scene.add(this.sensorGroup);
  },
  createSensor(face, index) {
    const sensorGroup = new THREE.Group();

    const cylinderLength = 30;
    const cylinderGeometry = new THREE.CylinderGeometry(
      0.5,
      0.5,
      cylinderLength,
      16,
    );
    const cylinderMaterial = new THREE.MeshBasicMaterial(this.materialConfig);
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

    cylinder.rotation.z = Math.PI / 2;
    sensorGroup.add(cylinder);

    const points = [];
    const pointsSpacing = 10;
    const startX = -pointsSpacing;

    for (let i = 0; i < 3; i++) {
      const pointGeometry = new THREE.SphereGeometry(0.7, 16, 16);
      const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      point.position.set(startX + i * pointsSpacing, 0, 0);
      points.push(point);
      sensorGroup.add(point);
    }

    sensorGroup.position.set(...face.position);

    const rotation = face.rotation;
    sensorGroup.rotation.set(rotation[0], rotation[1], rotation[2]);

    const offsetStep = this.width / (this.sensorCountPerFace + 1);
    let offsetX = -this.width / 2 + (index + 1) * offsetStep;
    let offsetZ = 0;

    if (face.name === "top" || face.name === "bottom") {
      offsetZ = (index - 1) * 8;
    }

    if (face.name === "right" || face.name === "left") {
      sensorGroup.position.y += offsetX;
    } else if (face.name === "top" || face.name === "bottom") {
      //   sensorGroup.position.x += offsetX;
      sensorGroup.position.z += offsetZ;
    } else {
      sensorGroup.position.y += offsetX;
    }

    return sensorGroup;
  },
  setVisible() {
    let mesh = findMeshFromScene(this.name);
    mesh.visible = !mesh.visible;
  },
};
