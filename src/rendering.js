import { simHeight, simWidth } from "./Constants.js";
import { scene } from "./Scene.js";
// import pointVertexShader from "./shaders/pointVertexShader.glsl";
// import pointFragmentShader from "./shaders/pointFragmentShader.glsl";
// import meshVertexShader from "./shaders/meshVertexShader.glsl";
// import meshFragmentShader from "./shaders/meshFragmentShader.glsl";
import { gl, canvas } from "./Canvas.js";
const pointVertexShader = `
		attribute vec2 attrPosition;
		attribute vec3 attrColor;
		uniform vec2 domainSize;
		uniform float pointSize;
		uniform float drawDisk;

		varying vec3 fragColor;
		varying float fragDrawDisk;

		void main() {
		vec4 screenTransform = 
			vec4(2.0 / domainSize.x, 2.0 / domainSize.y, -1.0, -1.0);
		gl_Position =
			vec4(attrPosition * screenTransform.xy + screenTransform.zw, 0.0, 1.0);

		gl_PointSize = pointSize;
		fragColor = attrColor;
		fragDrawDisk = drawDisk;
		}
	`;

	const pointFragmentShader = `
		precision mediump float;
		varying vec3 fragColor;
		varying float fragDrawDisk;

		void main() {
			if (fragDrawDisk == 1.0) {
				float rx = 0.5 - gl_PointCoord.x;
				float ry = 0.5 - gl_PointCoord.y;
				float r2 = rx * rx + ry * ry;
				if (r2 > 0.25)
					discard;
			}
			gl_FragColor = vec4(fragColor, 1.0);
		}
	`;

	const meshVertexShader = `
		attribute vec2 attrPosition;
		uniform vec2 domainSize;
		uniform vec3 color;
		uniform vec2 translation;
		uniform float scale;

		varying vec3 fragColor;

		void main() {
			vec2 v = translation + attrPosition * scale;
		vec4 screenTransform = 
			vec4(2.0 / domainSize.x, 2.0 / domainSize.y, -1.0, -1.0);
		gl_Position =
			vec4(v * screenTransform.xy + screenTransform.zw, 0.0, 1.0);

		fragColor = color;
		}
	`;

	const meshFragmentShader = `
		precision mediump float;
		varying vec3 fragColor;

		void main() {
			gl_FragColor = vec4(fragColor, 1.0);
		}
	`;

var pointShader = null;
var meshShader = null;

var pointVertexBuffer = null;
var pointColorBuffer = null;

var gridVertBuffer = null;
var gridColorBuffer = null;

var diskVertBuffer = null;
var diskIdBuffer = null;

export function draw() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // prepare shaders

  if (pointShader == null)
    pointShader = createShader(gl, pointVertexShader, pointFragmentShader);
  if (meshShader == null)
    meshShader = createShader(gl, meshVertexShader, meshFragmentShader);

  // grid

  if (gridVertBuffer == null) {
    var f = scene.fluid;
    gridVertBuffer = gl.createBuffer();
    var cellCenters = new Float32Array(2 * f.fNumCells);
    var p = 0;

    for (var i = 0; i < f.fNumX; i++) {
      for (var j = 0; j < f.fNumY; j++) {
        cellCenters[p++] = (i + 0.5) * f.h;
        cellCenters[p++] = (j + 0.5) * f.h;
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gridVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cellCenters, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  if (gridColorBuffer == null) gridColorBuffer = gl.createBuffer();

  if (scene.showGrid) {
    var pointSize = ((0.9 * scene.fluid.h) / simWidth) * canvas.width;

    gl.useProgram(pointShader);
    gl.uniform2f(
      gl.getUniformLocation(pointShader, "domainSize"),
      simWidth,
      simHeight
    );
    gl.uniform1f(gl.getUniformLocation(pointShader, "pointSize"), pointSize);
    gl.uniform1f(gl.getUniformLocation(pointShader, "drawDisk"), 0.0);

    gl.bindBuffer(gl.ARRAY_BUFFER, gridVertBuffer);
    var posLoc = gl.getAttribLocation(pointShader, "attrPosition");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, gridColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, scene.fluid.cellColor, gl.DYNAMIC_DRAW);

    var colorLoc = gl.getAttribLocation(pointShader, "attrColor");
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, scene.fluid.fNumCells);

    gl.disableVertexAttribArray(posLoc);
    gl.disableVertexAttribArray(colorLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  // water

  if (scene.showParticles) {
    gl.clear(gl.DEPTH_BUFFER_BIT);

    var pointSize =
      ((2.0 * scene.fluid.particleRadius) / simWidth) * canvas.width;

    gl.useProgram(pointShader);
    gl.uniform2f(
      gl.getUniformLocation(pointShader, "domainSize"),
      simWidth,
      simHeight
    );
    gl.uniform1f(gl.getUniformLocation(pointShader, "pointSize"), pointSize);
    gl.uniform1f(gl.getUniformLocation(pointShader, "drawDisk"), 1.0);

    if (pointVertexBuffer == null) pointVertexBuffer = gl.createBuffer();
    if (pointColorBuffer == null) pointColorBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, pointVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, scene.fluid.particlePos, gl.DYNAMIC_DRAW);

    var posLoc = gl.getAttribLocation(pointShader, "attrPosition");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, scene.fluid.particleColor, gl.DYNAMIC_DRAW);

    var colorLoc = gl.getAttribLocation(pointShader, "attrColor");
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, scene.fluid.numParticles);

    gl.disableVertexAttribArray(posLoc);
    gl.disableVertexAttribArray(colorLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  // disk

  // prepare disk mesh

  var numSegs = 50;

  if (diskVertBuffer == null) {
    diskVertBuffer = gl.createBuffer();
    var dphi = (2.0 * Math.PI) / numSegs;
    var diskVerts = new Float32Array(2 * numSegs + 2);
    var p = 0;
    diskVerts[p++] = 0.0;
    diskVerts[p++] = 0.0;
    for (var i = 0; i < numSegs; i++) {
      diskVerts[p++] = Math.cos(i * dphi);
      diskVerts[p++] = Math.sin(i * dphi);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, diskVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, diskVerts, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    diskIdBuffer = gl.createBuffer();
    var diskIds = new Uint16Array(3 * numSegs);
    p = 0;
    for (var i = 0; i < numSegs; i++) {
      diskIds[p++] = 0;
      diskIds[p++] = 1 + i;
      diskIds[p++] = 1 + ((i + 1) % numSegs);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, diskIdBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, diskIds, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  gl.clear(gl.DEPTH_BUFFER_BIT);

  var diskColor = [1.0, 0.0, 0.0];

  gl.useProgram(meshShader);
  gl.uniform2f(
    gl.getUniformLocation(meshShader, "domainSize"),
    simWidth,
    simHeight
  );
  gl.uniform3f(
    gl.getUniformLocation(meshShader, "color"),
    diskColor[0],
    diskColor[1],
    diskColor[2]
  );
  gl.uniform2f(
    gl.getUniformLocation(meshShader, "translation"),
    scene.obstacleX,
    scene.obstacleY
  );
  gl.uniform1f(
    gl.getUniformLocation(meshShader, "scale"),
    scene.obstacleRadius + scene.fluid.particleRadius
  );

  posLoc = gl.getAttribLocation(meshShader, "attrPosition");
  gl.enableVertexAttribArray(posLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, diskVertBuffer);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, diskIdBuffer);
  gl.drawElements(gl.TRIANGLES, 3 * numSegs, gl.UNSIGNED_SHORT, 0);

  gl.disableVertexAttribArray(posLoc);
}

export function createShader(gl, vsSource, fsSource) {
  const vsShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vsShader, vsSource);
  gl.compileShader(vsShader);
  if (!gl.getShaderParameter(vsShader, gl.COMPILE_STATUS))
    console.log(
      "vertex shader compile error: " + gl.getShaderInfoLog(vsShader)
    );

  const fsShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fsShader, fsSource);
  gl.compileShader(fsShader);
  if (!gl.getShaderParameter(fsShader, gl.COMPILE_STATUS))
    console.log(
      "fragment shader compile error: " + gl.getShaderInfoLog(fsShader)
    );

  var shader = gl.createProgram();
  gl.attachShader(shader, vsShader);
  gl.attachShader(shader, fsShader);
  gl.linkProgram(shader);

  return shader;
}
