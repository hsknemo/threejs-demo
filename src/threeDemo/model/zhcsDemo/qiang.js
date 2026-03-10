// 绘制墙
import * as THREE from "three";

export default {
    load(scene) {
        return;
        let pointArr = [0, 0, 20, 0, 20, 50, 0, 50, 0, 0];

        let gemotry = new THREE.BufferGeometry();
        let h = 20;
        let posArr = [
            // 前面 (z=0)
            0, 0, 0, 20, 0, 0, 20, 20, 0, 0, 0, 0, 20, 20, 0, 0, 20, 0,

            // 后面 (z=20)
            0, 0, 20, 20, 20, 20, 20, 0, 20, 0, 0, 20, 0, 20, 20, 20, 20, 20,

            // 左面 (x=0)
            0, 0, 0, 0, 20, 0, 0, 20, 20, 0, 0, 0, 0, 20, 20, 0, 0, 20,

            // 右面 (x=20)
            20, 0, 0, 20, 20, 20, 20, 20, 0, 20, 0, 0, 20, 0, 20, 20, 20, 20,

            // 底面 (y=0)
            0, 0, 0, 20, 0, 20, 20, 0, 0, 0, 0, 0, 0, 0, 20, 20, 0, 20,

            // 顶面 (y=20)
            0, 20, 0, 20, 20, 0, 20, 20, 20, 0, 20, 0, 20, 20, 20, 0, 20, 20,
        ];
        console.log(new Float32Array(posArr));
        gemotry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(posArr), 3),
        );
        gemotry.computeVertexNormals();
        let material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            // wireframe: true
        });
        let mesh = new THREE.Mesh(gemotry, material);

        scene.add(mesh);
    },
};