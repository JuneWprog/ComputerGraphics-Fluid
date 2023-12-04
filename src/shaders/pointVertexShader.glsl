attribute vec2 attrPosition;
attribute vec3 attrColor;
uniform vec2 domainSize;
uniform float pointSize;
uniform float drawDisk;

varying vec3 fragColor;
varying float fragDrawDisk;

void main() {
    vec4 screenTransform = vec4(2.0 / domainSize.x, 2.0 / domainSize.y, -1.0, -1.0);
    gl_Position = vec4(attrPosition * screenTransform.xy + screenTransform.zw, 0.0, 1.0);

    gl_PointSize = pointSize;
    fragColor = attrColor;
    fragDrawDisk = drawDisk;
}