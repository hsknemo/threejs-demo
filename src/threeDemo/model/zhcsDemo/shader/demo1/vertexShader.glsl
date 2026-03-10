

varying vec3 vColor;
attribute vec3 color;
varying vec2 vUv;
void main() {
    vColor = color;
    vUv = uv;
    gl_PointSize = 10.0;
    gl_Position = projectionMatrix  * modelViewMatrix * vec4(position, 1.0);
}
