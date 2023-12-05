import React, { useState, useEffect } from 'react';
import ParticleControls from './particleControls';
import { scene } from './Scene';
import {EARTH_GRAVITY}  from "./Constants";
import { setupCanvas } from "./Canvas";  

function App() {
  const [showParticles, setShowParticles] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [compensateDrift, setCompensateDrift] = useState(true);
  const [separateParticles, setSeparateParticles] = useState(true);
  const [paused, setPaused] = useState(true);
  const [gravity, setGravity] = useState(EARTH_GRAVITY); 
  const [flipRatio, setFlipRatio] = useState(0.9);

 
  const handlePausedChange = () => {
    setPaused(!paused);
  };

  const handleShowParticlesChange = () => {
    setShowParticles(!showParticles);
  };

  const handleShowGridChange = () => {
    setShowGrid(!showGrid);
  };

  const handleCompensateDriftChange = () => {
    setCompensateDrift(!compensateDrift);
  };

  const handleSeparateParticlesChange = () => {
    setSeparateParticles(!separateParticles);
  };

  const handleSliderChange = (event) => {
    const newFlipRatio = 0.1 * event.target.value;
    setFlipRatio(newFlipRatio);
  };

  const handleGravityChange = (event) => {
    const newGravity = event.target.value;
    setGravity(newGravity);
  };
  //only run once when the component mounts
  useEffect(() => {
    setupCanvas();
    scene.setupScene();
  }, []); 

  //run every time the state changes
  useEffect(() => {
    scene.gravity = gravity;
    scene.flipRatio = flipRatio;
    scene.showParticles = showParticles;
    scene.showGrid = showGrid;
    scene.compensateDrift = compensateDrift;
    scene.separateParticles = separateParticles;
    scene.paused = paused;
    scene.update();
  }, [showParticles,showGrid, compensateDrift,separateParticles,paused,flipRatio, gravity]);

  return (
    <div className="App">
      <header className="App-header">
      <h3>Fluid Simulator</h3>
      </header>
      <body className="App-body">
        <ParticleControls 
        showParticles={showParticles}
        showGrid={showGrid}
        compensateDrift={compensateDrift}
        separateParticles={separateParticles}
        paused={paused}
        gravity={gravity}
        flipRatio={flipRatio}
        onPausedChange={handlePausedChange}
        onShowParticlesChange={handleShowParticlesChange}
        onShowGridChange={handleShowGridChange}
        onCompensateDriftChange={handleCompensateDriftChange}
        onSeparateParticlesChange={handleSeparateParticlesChange}
        onSliderChange={handleSliderChange}
        onGravityChange={handleGravityChange}
        />
        <canvas id="myCanvas"/>
      </body>
    </div>
  )
}

export default App;
