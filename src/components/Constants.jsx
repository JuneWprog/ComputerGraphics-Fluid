/**
 * constants for the project
 * @file Constants.jsx
 */
const CELL_HEIGHT = 3.0;	
const CANVAS_HEIGHT = window.innerHeight - 100;
const CANVAS_WIDTH = window.innerWidth - 100;
const SCALE = CANVAS_HEIGHT / CELL_HEIGHT;
const CELL_WIDTH = CANVAS_WIDTH / SCALE;
const AIR_CELL = 1;
const FLUID_CELL = 0;
const SOLID_CELL = 2;
const EARTH_GRAVITY = -9.807;
const WATER_DENSITY = 1000.0;


export { CELL_HEIGHT,CANVAS_HEIGHT, CANVAS_WIDTH, SCALE, CELL_WIDTH, FLUID_CELL, SOLID_CELL,AIR_CELL, EARTH_GRAVITY,WATER_DENSITY };



