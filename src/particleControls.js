import React, { useState } from "react";
import {EARTH_GRAVITY}  from "./Constants";

export default function ParticleControls() {
  const [showParticles, setShowParticles] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [compensateDrift, setCompensateDrift] = useState(true);
  const [separateParticles, setSeparateParticles] = useState(true);
  const [paused, setPaused] = useState(true);
  const [gravity, setGravity] = useState(EARTH_GRAVITY); 
  //TODO add gravity menu for user to select 
 
  const [flipRatio, setFlipRatio] = useState(9);

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

  const handlePausedChange = () => {
    setPaused(!paused);
  }

  const handleSliderChange = (event) => {
    const newFlipRatio = 0.1 * event.target.value;
    setFlipRatio(newFlipRatio);
  };

  const handleGravityChange = (event) => {
    const newGravity = event.target.value;
    setGravity(newGravity);
  };
  const buttonStyle = (value) => {
    return {
      backgroundColor: value ? "green" : "grey",
    };
  };


  return (
    <div>
       <button
        type="button"
        onClick={handlePausedChange}
        value={paused}
        style={buttonStyle(paused)}
      >
       {paused?"Start":"Pause"}
      </button>
      <button
        type="button"
        onClick={handleShowParticlesChange}
        value={showParticles}
        style={buttonStyle(showParticles)}
      >
        Particles
      </button>

      <button
        type="button"
        onClick={handleShowGridChange}
        value={showGrid}
        style={buttonStyle(showGrid)}
      >
        Grid
      </button>

      <button
        type="button"
        onClick={handleCompensateDriftChange}
        value={compensateDrift}
        style={buttonStyle(compensateDrift)}
      >
        Compensate Drift
      </button>

      <button
        type="button"
        onClick={handleSeparateParticlesChange}
        value={separateParticles}
        style={buttonStyle(separateParticles)}
      >
        Separate Particles
      </button>
      <label>PIC</label>
      <input
        type="range"
        id="flipRatioSlider"
        min="0"
        max="10"
        value={flipRatio * 10}
        className="slider"
        onChange={handleSliderChange}
        
      />
      <label>FLIP</label>

      <label>Gravity</label>
      <input
        type="range"
        id="gravitySlider"
        min="-20"
        max="0"
        value={gravity}
        className="slider"
        onChange={handleGravityChange}
      
      />
      <label> {gravity}</label>
    </div>
  );
}
