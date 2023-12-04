precision mediump float;
varying vec3 fragColor;
varying float fragDrawDisk;

void main() {
    if(fragDrawDisk == 1.0) {
        float rx = 0.5 - gl_PointCoord.x;
        float ry = 0.5 - gl_PointCoord.y;
        float r2 = rx * rx + ry * ry;
        if(r2 > 0.25)
            discard;
    }
    gl_FragColor = vec4(fragColor, 1.0);
}