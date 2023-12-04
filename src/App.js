import React, { useState, useEffect } from 'react';
import ParticleControls from './particleControls';
import { scene } from './Scene';
import { setupCanvas } from "./Canvas";

function App() {

  useEffect(() => {
    setupCanvas();
    scene.setupScene();
    scene.update();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
      <h3>Fluid Simulator</h3>
      </header>
      <body className="App-body">
        <ParticleControls />
        <canvas id="myCanvas"/>
      </body>
    </div>
  )
}

export default App;
