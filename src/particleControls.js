import React from "react";

export default function ParticleControls({
  showParticles,
  showGrid,
  compensateDrift,
  separateParticles,
  paused,
  gravity,
  flipRatio,
  onPausedChange,
  onShowParticlesChange,
  onShowGridChange,
  onCompensateDriftChange,
  onSeparateParticlesChange,
  onSliderChange,
  onGravityChange,
  density,
  onDensityChange,
}) {
  const buttonStyle = (value) => {
    return {
      backgroundColor: value ? 'green' : 'grey',
    };
  };

  return (
    <div>
      <button
        type="button"
        onClick={onPausedChange}
        value={paused}
        style={buttonStyle(paused)}
      >
        {paused ? 'Start' : 'Pause'}
      </button>
      <button
        type="button"
        onClick={onShowParticlesChange}
        value={showParticles}
        style={buttonStyle(showParticles)}
      >
        Particles
      </button>

      <button
        type="button"
        onClick={onShowGridChange}
        value={showGrid}
        style={buttonStyle(showGrid)}
      >
        Grid
      </button>

      <button
        type="button"
        onClick={onCompensateDriftChange}
        value={compensateDrift}
        style={buttonStyle(compensateDrift)}
      >
        Compensate Drift
      </button>

      <button
        type="button"
        onClick={onSeparateParticlesChange}
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
        value={flipRatio*10}
        className="slider"
        onChange={onSliderChange}
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
        onChange={onGravityChange}
      />
      <label> {gravity}</label>

      <label>Density</label>
        <input
          type="number"
          id = "densitySlider"
          value={density}
          className="slider"
          onChange={onDensityChange}
          style={{ width: "5px" }}
        />
      <label> {density}</label>
    </div>
  );
}
