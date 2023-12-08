import { clamp } from './utils';
import { scene } from './Scene';
import  {FLUID_CELL, AIR_CELL, SOLID_CELL } from './Constants';



/**
 * Fluid Simulator class for constructing the fluid simulator object.
 * The properties are set in the constuctor. And some properties are set in the GUI.
 * @class
 */
export class FluidSimulator {
    constructor(density, width, height, spacing, particleRadius, maxParticles) {

        // fluid
        this.density = density;
        //set cells
        this.fNumX = Math.floor(width / spacing) + 1;
        this.fNumY = Math.floor(height / spacing) + 1;
        this.h = Math.max(width / this.fNumX, height / this.fNumY);
        this.fInvSpacing = 1.0 / this.h;

        //number of cells in the fluid grid x*y
        this.fNumCells = this.fNumX * this.fNumY;

        //velocity of the fluid u on the x axis and v on the y axis
        this.u = new Float32Array(this.fNumCells);
        this.v = new Float32Array(this.fNumCells);
        this.du = new Float32Array(this.fNumCells);
        this.dv = new Float32Array(this.fNumCells);
        this.prevU = new Float32Array(this.fNumCells);
        this.prevV = new Float32Array(this.fNumCells);
        //pressure 
        this.p = new Float32Array(this.fNumCells);
        this.s = new Float32Array(this.fNumCells);
        this.cellType = new Int32Array(this.fNumCells);
        this.cellColor = new Float32Array(3 * this.fNumCells);

        // set particles array
        this.maxParticles = maxParticles;
        this.particlePos = new Float32Array(2 * this.maxParticles);
        this.particleColor = new Float32Array(3 * this.maxParticles);

        //set all the particles to blue
        for (let i = 0; i < this.maxParticles; i++)
            this.particleColor[3 * i + 2] = 1.0;

        //particleVel velocity of the particles
        this.particleVel = new Float32Array(2 * this.maxParticles);
        this.particleDensity = new Float32Array(this.fNumCells);
        this.particleRestDensity = 0.0;


        this.particleRadius = particleRadius;
        //pInvSpacing is the inverse of the spacing between the particles
        this.pInvSpacing = 1.0 / (2.2 * particleRadius);
        this.pNumX = Math.floor(width * this.pInvSpacing) + 1;
        this.pNumY = Math.floor(height * this.pInvSpacing) + 1;
        this.pNumCells = this.pNumX * this.pNumY;

        this.numCellParticles = new Int32Array(this.pNumCells);
        this.firstCellParticle = new Int32Array(this.pNumCells + 1);
        this.cellParticleIds = new Int32Array(maxParticles);
    }

/**
 * Handle gravity force on particles.
 * update particle positions and velocities.
 * @method
 */
    addGravityOnParticles(dt, gravity) {
        const dtGravity = dt * gravity;
        for (let i = 0; i < this.numParticles; i++) {
            // Update velocity in the y-direction
            this.particleVel[2 * i + 1] += dtGravity;
    
            // Update particle positions using the updated velocity
            this.particlePos[2 * i] += this.particleVel[2 * i] * dt;
            this.particlePos[2 * i + 1] += this.particleVel[2 * i + 1] * dt;
        }
    }
/**
 * push particles apart when they are getting to close.
 * @method
 */
    pushParticlesApart(numIters) 
    {
        let colorDiffusionCoeff = 0.001;

        // count particles per cell
        
        this.numCellParticles.fill(0);

        for (let i = 0; i < this.numParticles; i++) {
            let x = this.particlePos[2 * i];
            let y = this.particlePos[2 * i + 1];

            // boundary check
            let xi = clamp(Math.floor(x * this.pInvSpacing), 0, this.pNumX - 1);
            let yi = clamp(Math.floor(y * this.pInvSpacing), 0, this.pNumY - 1);
        
            let cellNr = xi * this.pNumY + yi;
            this.numCellParticles[cellNr]++;
        }

        // partial sums
        //firstCellParticle is the first particle in each cell
        let first = 0;
      
        
        for (let i = 0; i < this.pNumCells; i++) {
            first += this.numCellParticles[i];
            this.firstCellParticle[i] = first;
        }
        //set the first particle
        this.firstCellParticle[this.pNumCells] = first;		// guard

        // fill particles into cells

        for (let i = 0; i < this.numParticles; i++) {
            let x = this.particlePos[2 * i];
            let y = this.particlePos[2 * i + 1];

            let xi = clamp(Math.floor(x * this.pInvSpacing), 0, this.pNumX - 1);
            let yi = clamp(Math.floor(y * this.pInvSpacing), 0, this.pNumY - 1);
            let cellNr = xi * this.pNumY + yi;
            this.firstCellParticle[cellNr]--;
            this.cellParticleIds[this.firstCellParticle[cellNr]] = i;
        }

        // push particles apart to avoid clustering

        let minDist = 2.0 * this.particleRadius;
        let minDist2 = minDist * minDist;
        //numIters is the number of iterations to push the particles apart
        for (let iter = 0; iter < numIters; iter++) {
            //iterate through all the particles and push them apart
            for (let i = 0; i < this.numParticles; i++) {
                let px = this.particlePos[2 * i];
                let py = this.particlePos[2 * i + 1];

                let pxi = Math.floor(px * this.pInvSpacing);
                let pyi = Math.floor(py * this.pInvSpacing);
                //x0 and y0 are the coordinates of the cell to the left and below the particle
                let x0 = Math.max(pxi - 1, 0);
                let y0 = Math.max(pyi - 1, 0);
                //x1 and y1 are the coordinates of the cell to the right and above the particle?

                let x1 = Math.min(pxi + 1, this.pNumX - 1);
                let y1 = Math.min(pyi + 1, this.pNumY - 1);
            //iterate through all the cells around the particle
                for (let xi = x0; xi <= x1; xi++) {
                    for (let yi = y0; yi <= y1; yi++) {
                        let cellNr = xi * this.pNumY + yi;
                        let first = this.firstCellParticle[cellNr];
                        let last = this.firstCellParticle[cellNr + 1];
                        for (let j = first; j < last; j++) {
                            let id = this.cellParticleIds[j];
                            //skip the particle if it is the same as the current particle
                            if (id === i)
                                continue;
                            let qx = this.particlePos[2 * id];
                            let qy = this.particlePos[2 * id + 1];

                            let dx = qx - px;
                            let dy = qy - py;
                            let d2 = dx * dx + dy * dy;
                            //if the distance between the particles is greater than the minimum distance
                            if (d2 > minDist2 || d2 === 0.0) 
                                continue;
                            //d is the Euclidean distance between the particles 
                            let d = Math.sqrt(d2);
                            //s is the amount to push the particles apart
                            
                            let s = 0.5 * (minDist - d) / d;
                            dx *= s;
                            dy *= s;
                            //i and id new positions
                            this.particlePos[2 * i] -= dx;
                            this.particlePos[2 * i + 1] -= dy;
                            this.particlePos[2 * id] += dx;
                            this.particlePos[2 * id + 1] += dy;

                            // diffuse colors

                            for (let k = 0; k < 3; k++) {
                                let color0 = this.particleColor[3 * i + k];
                                let color1 = this.particleColor[3 * id + k];
                                let color = (color0 + color1) * 0.5;
                                this.particleColor[3 * i + k] = color0 + (color - color0) * colorDiffusionCoeff;
                                this.particleColor[3 * id + k] = color1 + (color - color1) * colorDiffusionCoeff;
                            }
                        }
                    }
                }
            }
        }
    }

/**
 * Handle particle collisions with the obstacle, walls and other particles.
 * @method
 */
    
    handleParticleCollisions(obstacleX, obstacleY, obstacleRadius) {
        let h = 1.0 / this.fInvSpacing;
        let r = this.particleRadius;
        let minDist = obstacleRadius + r;
        let minDist2 = minDist * minDist;
        //minDist2=Math.sqrt(minDist2);
        let maxForceDistance = minDist * 5.0; 
    
        let minX = h + r;
        let maxX = (this.fNumX - 1) * h - r;
        let minY = h + r;
        let maxY = (this.fNumY - 1) * h - r;
    
        for (let i = 0; i < this.numParticles; i++) {
            let x = this.particlePos[2 * i];
            let y = this.particlePos[2 * i + 1];
            // Distance between the particle and the obstacle
            let dx = x - obstacleX;
            let dy = y - obstacleY;
            let d2 = dx * dx + dy * dy;
    
            // Handle obstacle collision with reduced force
            if (d2 < minDist2) {
                let distance = Math.sqrt(d2);
                let normalizer = 1.0 / distance; // Normalize the direction
    
                // Calculate the scaled velocity change based on distance
                let scale = (maxForceDistance - distance) / maxForceDistance;
                let forceFactor = scale < 0 ? 0 : scale; // Ensure forceFactor is non-negative
    
                // Apply reduced force
                this.particleVel[2 * i] += scene.obstacleVelX * forceFactor;
                this.particleVel[2 * i + 1] += scene.obstacleVelY * forceFactor;
    
                // Move the particle away from the obstacle
                let penetration = minDist - distance;
                x += penetration * (dx * normalizer);
                y += penetration * (dy * normalizer);
            }
    
            // Handle wall collisions
            // If the particle is outside the walls, move it back and set the velocity to 0
            if (x < minX) {
                x = minX;
                this.particleVel[2 * i] = 0.0;
            }
            if (x > maxX) {
                x = maxX;
                this.particleVel[2 * i] = 0.0;
            }
            if (y < minY) {
                y = minY;
                this.particleVel[2 * i + 1] = 0.0;
            }
            if (y > maxY) {
                y = maxY;
                this.particleVel[2 * i + 1] = 0.0;
            }
    
            this.particlePos[2 * i] = x;
            this.particlePos[2 * i + 1] = y;
        }
    }
/**
 * Update the particle density based on the current particle positions and fluid grid.
 * @method
 */
updateParticleDensity() {
    const n = this.fNumY;
    const h = this.h;
    const h1 = this.fInvSpacing;
    const h2 = 0.5 * h;
    const d = this.particleDensity;

    // Reset particle densities to zero
    d.fill(0.0);

    // Iterate over each particle and accumulate density contribution to surrounding fluid cells
    for (let i = 0; i < this.numParticles; i++) {
        let x = clamp(this.particlePos[2 * i], h, (this.fNumX - 1) * h);
        let y = clamp(this.particlePos[2 * i + 1], h, (this.fNumY - 1) * h);

        const x0 = Math.floor((x - h2) * h1);
        const tx = ((x - h2) - x0 * h) * h1;
        const x1 = Math.min(x0 + 1, this.fNumX - 2);

        const y0 = Math.floor((y - h2) * h1);
        const ty = ((y - h2) - y0 * h) * h1;
        const y1 = Math.min(y0 + 1, this.fNumY - 2);

        const sx = 1.0 - tx;
        const sy = 1.0 - ty;

        if (x0 < this.fNumX && y0 < this.fNumY) d[x0 * n + y0] += sx * sy;
        if (x1 < this.fNumX && y0 < this.fNumY) d[x1 * n + y0] += tx * sy;
        if (x1 < this.fNumX && y1 < this.fNumY) d[x1 * n + y1] += tx * ty;
        if (x0 < this.fNumX && y1 < this.fNumY) d[x0 * n + y1] += sx * ty;
    }

    // Calculate the rest density of particles if not initialized
    if (this.particleRestDensity === 0.0) {
        const fluidCells = this.cellType.filter(cell => cell === FLUID_CELL).length;

        if (fluidCells > 0) {
            const sum = d.slice(0, this.fNumCells).reduce((acc, density) => acc + density, 0);
            this.particleRestDensity = sum / fluidCells;
        }
    }
}

    
    //transfer the velocities from the particles to the grid
    //PIC method and FLIP method
    transferVelocities(toGrid, flipRatio)
    {
        let n = this.fNumY;
        let h = this.h;
        let h1 = this.fInvSpacing;
        let h2 = 0.5 * h;
        if (toGrid) {
            this.prevU.set(this.u);
            this.prevV.set(this.v);
            this.du.fill(0.0);
            this.dv.fill(0.0);
            this.u.fill(0.0);
            this.v.fill(0.0);
            for (let i = 0; i < this.fNumCells; i++) 
                this.cellType[i] = this.s[i] === 0.0 ? SOLID_CELL : AIR_CELL;

            for (let i = 0; i < this.numParticles; i++) {
                let x = this.particlePos[2 * i];
                let y = this.particlePos[2 * i + 1];
                let xi = clamp(Math.floor(x * h1), 0, this.fNumX - 1);
                let yi = clamp(Math.floor(y * h1), 0, this.fNumY - 1);
                let cellNr = xi * n + yi;
                if (this.cellType[cellNr] === AIR_CELL)
                    this.cellType[cellNr] = FLUID_CELL;
            }
        }
        
        for (let component = 0; component < 2; component++) {

            let dx = component === 0 ? 0.0 : h2;
            let dy = component === 0 ? h2 : 0.0;

            let f = component === 0 ? this.u : this.v;
            let prevF = component === 0 ? this.prevU : this.prevV;
            let d = component === 0 ? this.du : this.dv;

            for (let i = 0; i < this.numParticles; i++) {
                let x = this.particlePos[2 * i];
                let y = this.particlePos[2 * i + 1];

                x = clamp(x, h, (this.fNumX - 1) * h);
                y = clamp(y, h, (this.fNumY - 1) * h);

                let x0 = Math.min(Math.floor((x - dx) * h1), this.fNumX - 2);
                let tx = ((x - dx) - x0 * h) * h1;
                let x1 = Math.min(x0 + 1, this.fNumX-2);
                
                let y0 = Math.min(Math.floor((y-dy)*h1), this.fNumY-2);
                let ty = ((y - dy) - y0*h) * h1;
                let y1 = Math.min(y0 + 1, this.fNumY-2);

                let sx = 1.0 - tx;
                let sy = 1.0 - ty;

                let d0 = sx*sy;
                let d1 = tx*sy;
                let d2 = tx*ty;
                let d3 = sx*ty;

                let nr0 = x0*n + y0;
                let nr1 = x1*n + y0;
                let nr2 = x1*n + y1;
                let nr3 = x0*n + y1;

                if (toGrid) {
                    let pv = this.particleVel[2 * i + component];
                    f[nr0] += pv * d0;  d[nr0] += d0;
                    f[nr1] += pv * d1;  d[nr1] += d1;
                    f[nr2] += pv * d2;  d[nr2] += d2;
                    f[nr3] += pv * d3;  d[nr3] += d3;
                }
                else {
                    let offset = component === 0 ? n : 1;
                    let valid0 = this.cellType[nr0] !== AIR_CELL || this.cellType[nr0 - offset] !== AIR_CELL ? 1.0 : 0.0;
                    let valid1 = this.cellType[nr1] !== AIR_CELL || this.cellType[nr1 - offset] !== AIR_CELL ? 1.0 : 0.0;
                    let valid2 = this.cellType[nr2] !== AIR_CELL || this.cellType[nr2 - offset] !== AIR_CELL ? 1.0 : 0.0;
                    let valid3 = this.cellType[nr3] !== AIR_CELL || this.cellType[nr3 - offset] !== AIR_CELL ? 1.0 : 0.0;

                    let v = this.particleVel[2 * i + component];
                    let d = valid0 * d0 + valid1 * d1 + valid2 * d2 + valid3 * d3;

                    if (d > 0.0) {
                        let picV = (valid0 * d0 * f[nr0] + valid1 * d1 * f[nr1] + valid2 * d2 * f[nr2] + valid3 * d3 * f[nr3]) / d;
                        let corr = (valid0 * d0 * (f[nr0] - prevF[nr0]) + valid1 * d1 * (f[nr1] - prevF[nr1])
                            + valid2 * d2 * (f[nr2] - prevF[nr2]) + valid3 * d3 * (f[nr3] - prevF[nr3])) / d;
                        let flipV = v + corr;

                        this.particleVel[2 * i + component] = (1.0 - flipRatio) * picV + flipRatio * flipV;
                    }
                }
            }
            if (toGrid) {
                for (let i = 0; i < f.length; i++) {
                    if (d[i] > 0.0)
                        f[i] /= d[i];
                }
                // restore solid cells for obstacle handling

                for (let i = 0; i < this.fNumX; i++) {
                    for (let j = 0; j < this.fNumY; j++) {
                        let solid = this.cellType[i * n + j] === SOLID_CELL;
                        if (solid || (i > 0 && this.cellType[(i - 1) * n + j] === SOLID_CELL))
                            this.u[i * n + j] = this.prevU[i * n + j];
                        if (solid || (j > 0 && this.cellType[i * n + j - 1] === SOLID_CELL))
                            this.v[i * n + j] = this.prevV[i * n + j];
                    }
                }
            }
        }
    }


    //handle the  divergence  in a cell
    // solveIncompressibility(numIters, dt, overRelaxation, compensateDrift = true) {
    solveIncompressibility(numIters, dt, overRelaxation, compensateDrift = true) {
        this.p.fill(0.0);
        this.prevU.set(this.u);
        this.prevV.set(this.v);
    
        let n = this.fNumY;
        let cp = this.density * this.h / dt;
    
        let fluidCell = FLUID_CELL;
        let particleRestDensity = this.particleRestDensity;
    
        for (let iter = 0; iter < numIters; iter++) {
            for (let i = 1; i < this.fNumX - 1; i++) {
                for (let j = 1; j < this.fNumY - 1; j++) {
    
                    let center = i * n + j;
                    if (this.cellType[center] !== fluidCell) continue;
    
                    let left = (i - 1) * n + j;
                    let right = (i + 1) * n + j;
                    let bottom = i * n + j - 1;
                    let top = i * n + j + 1;
    
                    let sx0 = this.s[left];
                    let sx1 = this.s[right];
                    let sy0 = this.s[bottom];
                    let sy1 = this.s[top];
                    let s = sx0 + sx1 + sy0 + sy1;
    
                    if (s === 0.0) continue;
    
                    let div = this.u[right] - this.u[center] + this.v[top] - this.v[center];
    
                    if (particleRestDensity > 0.0 && compensateDrift) {
                        let k = 1.0;
                        let compression = this.particleDensity[center] - particleRestDensity;
                        if (compression > 0.0) div -= k * compression;
                    }
    
                    let p = -div / s;
                    p *= overRelaxation;
                    this.p[center] += cp * p;
    
                    this.u[center] -= sx0 * p;
                    this.u[right] += sx1 * p;
                    this.v[center] -= sy0 * p;
                    this.v[top] += sy1 * p;
                }
            }
        }
    }
/**
 * Update particle Colors base on the the particle density .
 * @method
 */
    updateParticleColors() 
    {
        let h1 = this.fInvSpacing;

        for (let i = 0; i < this.numParticles; i++) {

            let s = 0.01;
            //boundary check 0-1
            this.particleColor[3 * i] = clamp(this.particleColor[3 * i] - s, 0.0, 1.0);
            this.particleColor[3 * i + 1] = clamp(this.particleColor[3 * i + 1] - s, 0.0, 1.0);
            this.particleColor[3 * i + 2] = clamp(this.particleColor[3 * i + 2] + s, 0.0, 1.0);

            let x = this.particlePos[2 * i];
            let y = this.particlePos[2 * i + 1];
            let xi = clamp(Math.floor(x * h1), 1, this.fNumX - 1);
            let yi = clamp(Math.floor(y * h1), 1, this.fNumY - 1);
            let cellNr = xi * this.fNumY + yi;

            let d0 = this.particleRestDensity;

            if (d0 > 0.0) {
                let relDensity = this.particleDensity[cellNr] / d0;
                if (relDensity < 0.7) {
                this.particleColor[3 * i] = 0.8;
                this.particleColor[3 * i + 1] = 0.8;
                this.particleColor[3 * i + 2] = 1.0;
            }}
        }
    }

/**
 * Update cell Colors base on the the particle density.
 * cold colors are low density, warm colors are high density
 *
 * @method
 */
   
    setSciColor(cellNr, val, minVal, maxVal) 
    {
        val = Math.min(Math.max(val, minVal), maxVal- 0.0001);
        let d = maxVal - minVal;
        val = d === 0.0 ? 0.5 : (val - minVal) / d;
        let m = 0.25;
        let num = Math.floor(val / m);
        let s = (val - num * m) / m;
        let r, g, b;

        switch (num) {
            case 0 : r = 0.0; g = s; b = 1.0; break;
            case 1 : r = 0.0; g = 1.0; b = 1.0-s; break;
            case 2 : r = s; g = 1.0; b = 0.0; break;
            case 3 : r = 1.0; g = 1.0 - s; b = 0.0; break;
            default: break;
        }

        this.cellColor[3 * cellNr] = r;
        this.cellColor[3 * cellNr + 1] = g;
        this.cellColor[3 * cellNr + 2] = b;
    }
    // set the color of the cells according to desity
    setCellColors() 
    {
        this.cellColor.fill(0.0);

        for (let i = 0; i < this.fNumCells; i++) {

            if (this.cellType[i] === SOLID_CELL) {
                this.cellColor[3*i] = 0.5;
                this.cellColor[3*i + 1] = 0.5;
                this.cellColor[3*i + 2] = 0.5;
            }
            else if (this.cellType[i] === FLUID_CELL) {
                let d = this.particleDensity[i];
                if (this.particleRestDensity > 0.0)
                    d /= this.particleRestDensity;
                this.setSciColor(i, d, 0.0, 2.0);
            }
        }
    }

    simulate(dt, gravity, flipRatio, numPressureIters, numParticleIters, overRelaxation, compensateDrift, separateParticles, obstacleX, abstacleY, obstacleRadius) 
    {
        let numSubSteps = 1;
        let sdt = dt / numSubSteps;

        for (let step = 0; step < numSubSteps; step++) {
            this.addGravityOnParticles(sdt, gravity);
            if (separateParticles){
                this.pushParticlesApart(numParticleIters); 
            }
            this.handleParticleCollisions(obstacleX, abstacleY, obstacleRadius)
            this.transferVelocities(true);
            this.updateParticleDensity();
            this.solveIncompressibility(numPressureIters, sdt, overRelaxation, compensateDrift);
            this.transferVelocities(false, flipRatio);
        }

        this.updateParticleColors();
        this.setCellColors();
    }
}
export default FluidSimulator;