import {CELL_HEIGHT,CELL_WIDTH, EARTH_GRAVITY, WATER_DENSITY } from "./Constants";
import FluidSimulator from "./FluidSimulator";
import { draw } from "./rendering";

//The scene class is used to setup the scene
// draw the scene and update the scene
class Scene {
  constructor() {
    this.gravity = EARTH_GRAVITY;
    this.dt = 1.0 / 60.0;
    this.flipRatio = 0.9;
    this.numPressureIters = 50; 
    this.numParticleIters = 2;
    this.frameNr = 0;
    this.overRelaxation = 1.9;
    this.compensateDrift = true;
    this.separateParticles = true;
    this.obstacleX = 0.0;
    this.obstacleY = 0.0;
    this.obstacleRadius = 0.15;
    this.paused = true;
    this.showObstacle = true;
    this.obstacleVelX = 0.0;
    this.obstacleVelY = 0.0;
    this.showParticles = true;
    this.showGrid = false;
    this.fluid = null;
    this.setupScene = this.setupScene.bind(this);
    this.setObstacle = this.setObstacle.bind(this);
    this.update = this.update.bind(this);
    this.simulate = this.simulate.bind(this);
  }

  setupScene() {
    const res = 100;
    const tankHeight = 1.0 * CELL_HEIGHT;
    const tankWidth = 1.0 * CELL_WIDTH;
    const h = tankHeight / res;
    const density = WATER_DENSITY;
    const relWaterHeight = 0.8;
    const relWaterWidth = 0.7;

    // dam break

    let r = 0.3 * h; 
    let dx = 2.0 * r;
    let dy = (Math.sqrt(3.0) / 2.0) * dx;

    const numX = Math.floor((relWaterWidth * tankWidth - 2.0 * h - 2.0 * r) / dx);
    const numY = Math.floor(
      (relWaterHeight * tankHeight - 2.0 * h - 2.0 * r) / dy
    );
    let maxParticles = numX * numY;

    // create fluid

    let f = (this.fluid = new FluidSimulator(
      density,
      tankWidth,
      tankHeight,
      h,
      r,
      maxParticles
    ));

    // create particles

    f.numParticles = numX * numY;
    let p = 0;
    for (let i = 0; i < numX; i++) {
      for (let j = 0; j < numY; j++) {
        f.particlePos[p++] = h + r + dx * i + (j % 2 === 0 ? 0.0 : r);
        f.particlePos[p++] = h + r + dy * j;
      }
    }

    // setup grid cells for tank

    let n = f.fNumY;

    for (let i = 0; i < f.fNumX; i++) {
      for (let j = 0; j < f.fNumY; j++) {
        let s = 1.0; 
        if (i === 0 || i === f.fNumX - 1 || j === 0) s = 0.0; 
        f.s[i * n + j] = s;
      }
    }
    this.setObstacle(2.0, 2.0, true);
  }

  setObstacle(x, y, reset) {
    let vx = 0.0;
    let vy = 0.0;

    if (!reset) {
      vx = (x - this.obstacleX) / this.dt;
      vy = (y - this.obstacleY) / this.dt;
    }

    this.obstacleX = x;
    this.obstacleY = y;
    let r = this.obstacleRadius;
    let f = this.fluid;
    let n = f.numY;

    for (let i = 1; i < f.numX - 2; i++) {
      for (let j = 1; j < f.numY - 2; j++) {
        f.s[i * n + j] = 1.0;

        let [dx, dy] = [(i + 0.5) * f.h - x, (j + 0.5) * f.h - y];

        if (dx * dx + dy * dy < r * r) {
          f.s[i * n + j] = 0.0;
          f.u[i * n + j] = vx;
          f.u[(i + 1) * n + j] = vx;
          f.v[i * n + j] = vy;
          f.v[i * n + j + 1] = vy;
        }
      }
    }

    this.showObstacle = true;
    this.obstacleVelX = vx;
    this.obstacleVelY = vy;
  }

  simulate() {
    if (!this.paused)
      this.fluid.simulate(
        this.dt,
        this.gravity,
        this.flipRatio,
        this.numPressureIters,
        this.numParticleIters,
        this.overRelaxation,
        this.compensateDrift,
        this.separateParticles,
        this.obstacleX,
        this.obstacleY,
        this.obstacleRadius,
        this.colorFieldNr
      );
    this.frameNr++;
  }
  setObstacleRadius(radius) {
    this.obstacleRadius = radius;
  }
  
  update = () => {
    this.simulate();
    draw();
    requestAnimationFrame(this.update);
}
}

export const scene = new Scene();
