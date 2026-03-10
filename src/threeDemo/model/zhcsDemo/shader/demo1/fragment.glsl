
varying vec3 vColor;
uniform sampler2D map;
varying vec2 vUv;
void main() {
    // 计算片元方形点距离片元中心点的距离
    float r = distance(gl_PointCoord, vec2(0.5, 0.5));
    if (r > 0.5) {
        discard;
    } else {
        if (gl_PointCoord.x > 0.5) {
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        } else {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    }
    //    gl_FragColor = texture2D(map, vUv);
    //    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
