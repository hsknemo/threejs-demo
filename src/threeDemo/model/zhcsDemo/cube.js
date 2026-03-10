import * as THREE from "three";

export default class Cube {
  constructor(props) {
    this.width = 5;
    this.height = 5;
    this.depth = 5;
    this.name = "地质体";
    this.scene = props.scene;
    this.mesh = null;
    // 开启调试模式
    this.debugMode = true;

    this.init();
    // this.initTexture()
  }

  getGeometry() {
    return new THREE.BoxGeometry(this.width, this.height, this.depth);
  }

  getMaterial() {
    return new THREE.MeshPhysicalMaterial({
      // color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
    });
  }

  getMesh() {
    const geometry = this.getGeometry();
    const material = this.getMaterial();
    return new THREE.Mesh(geometry, material);
  }

  setVisible(visible) {
    this.mesh.visible = visible;
  }

  createPlane(config = {}) {
    let mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        map: config.texture,
      })
    );

    mesh.rotation.set(config.rotateX, config.rotateY, config.rotateZ)
    mesh.position.set(config.positionX, config.positionY, config.positionZ)

    return mesh

  }

  init() {
    const cube = this.getMesh();
    let imgUrl = "/texture/dzttt.png";
    const texture = new THREE.TextureLoader().load(imgUrl);
    cube.name = this.name;
    cube.material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        map: { value: texture },
        opacity: { value: cube.material.opacity },
      },
      opacity: 0.5,
      side: THREE.DoubleSide, // 必须加，洞内壁才会显示
      vertexShader: `
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
         uniform sampler2D map; 
         varying vec2 vUv;
         uniform float opacity;
         // 所有的坐标
         varying vec3 vPosition;
         void main() {
           
            vec4 texColor = texture2D(map, vUv);
            // 镂空隧道口
            if (vPosition.x > 1.4 && vPosition.y > 1.5) {
            }
            
            gl_FragColor = vec4(texColor.rgb, opacity);
         }
      `,
    });

    // 创建六个面去做立方体
    let topPlane = this.createPlane({
      rotateX: Math.PI / 2,
      rotateY: 0,
      rotateZ: 0,
      positionX: 0,
      positionY: 2.5,
      positionZ: 0,
      texture,
    })

    let bottomPlane = this.createPlane({
      rotateX: Math.PI / 2,
      rotateY: 0,
      rotateZ: 0,
      positionX: 0,
      positionY: -2.5,
      positionZ: 0,
      texture,
    })

    let leftPlane = this.createPlane({
      rotateX: 0,
      rotateY: Math.PI / 2,
      rotateZ: 0,
      positionX: -2.5,
      positionY: 0,
      positionZ: 0,
      texture,
    })

    let backPlane = this.createPlane({
      rotateX: 0,
      rotateY: 0,
      rotateZ: Math.PI / 2,
      positionX: 0,
      positionY: 0,
      positionZ: -2.5,
      texture,
    })

    let frontPlane = this.createPlane({
      rotateX: 0,
      rotateY: 0,
      rotateZ: Math.PI / 2,
      positionX: 0,
      positionY: 0,
      positionZ: 2.5,
      texture,
    })

    let rightPlane = this.createPlane({
      rotateX: 0,
      rotateY: Math.PI / 2,
      rotateZ: 0,
      positionX: 2.5,
      positionY: 0,
      positionZ: 0,
      texture,
    })

    rightPlane.material = new THREE.ShaderMaterial({
      transparent: true,
      opacity: 0.5,
      uniforms: {
        map: { value: texture },
        opacity: { value: cube.material.opacity },
      },
      side: THREE.DoubleSide,
      vertexShader: `
        varying vec3 vPosition;
        varying vec2 vUv;  
        void main() {
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform sampler2D map;
         uniform float opacity;
        varying vec3 vPosition;
            varying vec2 vUv;
        void main() {
           // 绘制半圆
           float centerX = 0.1;
           float centerY = 0.35;
           float bj =  0.49;
           
           if (length(vPosition.yy + 0.3) < 0.8 &&
            length(vPosition.xx - 0.09) < 0.7 
            ) {
             // gl_FragColor = vec4(1.0, 0.0, 0.0, 0.4);
             discard;
             return;
           }
           
           if (distance(vPosition.xy, vec2(centerX, centerY)) < bj) {
             // gl_FragColor = vec4(1.0, 0.0, 0.0, 0.4);
             discard;
             return;
           }
           
            vec4 texColor = texture2D(map, vUv);
           
           gl_FragColor = vec4(texColor.rgb, opacity);
        }
      `
    })

    let cubeGroup = new THREE.Group();
    cubeGroup.add(topPlane, bottomPlane, leftPlane, backPlane, frontPlane, rightPlane);

    this.scene.add(cubeGroup);
    cubeGroup.name = this.name
    this.mesh = cubeGroup;

    setTimeout(() => this.initGUI(), 1000);
  }

  initTexture() {}

  changeCubeMaterialProperty(property, value) {
    this.mesh.material[property] = value;
  }

  initGUI() {
    if (!this.debugMode) return;
    let g = window.gui.addFolder("地质体控制");

    g.add(this.mesh.material, "opacity", 0, 1, 0.01)
      .onChange((v) => {
        this.mesh.material.opacity = v;
      })
      .name("修改材质透明度");

    g.addColor(this.mesh.material, "color").name("修改材质颜色");

    this.mesh.geometry.scaleWidth = 0;
    this.mesh.geometry.scaleHeihgt = 0;
    this.mesh.geometry.scaleDepth = 0;
    g.add(this.mesh.geometry, "scaleWidth", 5, 20, 1)
      .onChange((value) => {
        this.mesh.geometry.dispose(); // 释放旧几何体内存
        this.width = value;
        this.mesh.geometry = this.getGeometry();
      })
      .name("修改物体长度");

    g.add(this.mesh.geometry, "scaleHeihgt", 5, 20, 1)
      .onChange((value) => {
        this.mesh.geometry.dispose(); // 释放旧几何体内存
        this.depth = value;
        this.mesh.geometry = this.getGeometry();
      })
      .name("修改物体宽");

    g.add(this.mesh.geometry, "scaleDepth", 5, 20, 1)
      .onChange((value) => {
        this.mesh.geometry.dispose(); // 释放旧几何体内存
        this.height = value;
        this.mesh.geometry = this.getGeometry();
      })
      .name("修改物体高");

    g.add(this.mesh.rotation, "x", 0, 360, 0.1).name("旋转x");
    g.add(this.mesh.rotation, "y", 0, 360, 0.1).name("旋转y");
    g.add(this.mesh.rotation, "z", 0, 360, 0.1).name("旋转z");
  }
}
