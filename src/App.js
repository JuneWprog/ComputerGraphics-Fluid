import React, { useState, useEffect, useCallback } from "react";
import ParticleControls from "./components/particleControls";
import { scene } from "./components/Scene";
import { EARTH_GRAVITY } from "./components/Constants";
import { canvas, setupCanvas } from "./components/Canvas";
import { SCALE } from "./components/Constants";
import './style/App.css';

export default function App() {
  const [showParticles, setShowParticles] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [compensateDrift, setCompensateDrift] = useState(true);
  const [separateParticles, setSeparateParticles] = useState(true);
  const [paused, setPaused] = useState(true);
  const [gravity, setGravity] = useState(EARTH_GRAVITY);
  const [flipRatio, setFlipRatio] = useState(0.93);
  const [mouseDown, setMouseDown] = useState(false);
  const [density, setDensity] = useState(1.0);
  const [obstacleRadius, setObstacleRadius] = useState(0.15);

  // Control handlers
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

  const handleDensityChange = (event) => {
    const newDensity = event.target.value;
    setDensity(newDensity);
  };

  const handleRefreshClick = useCallback(() => {
    window.location.reload();
  }, []);

  const handleObstacleRadiusChange = useCallback((event) => {
    const newRadius = parseFloat(event.target.value);
    setObstacleRadius(newRadius);
    scene.setObstacleRadius(newRadius);
  }, []);

  // Define event handler functions with useCallback
  const startDrag = useCallback((x, y) => {
    let bounds = canvas.getBoundingClientRect();
    let mx = x - bounds.left - canvas.clientLeft;
    let my = y - bounds.top - canvas.clientTop;
    setMouseDown(true);

    x = mx / SCALE;
    y = (canvas.height - my) / SCALE;

    scene.setObstacle(x, y, true);
    setPaused(false);
  }, []);

  const drag = useCallback(
    (x, y) => {
      if (mouseDown) {
        let bounds = canvas.getBoundingClientRect();
        let mx = x - bounds.left - canvas.clientLeft;
        let my = y - bounds.top - canvas.clientTop;
        x = mx / SCALE;
        y = (canvas.height - my) / SCALE;
        scene.setObstacle(x, y, false);
      }
    },
    [mouseDown]
  );

  const endDrag = useCallback(() => {
    setMouseDown(false);
    scene.obstacleVelX = 0.0;
    scene.obstacleVelY = 0.0;
  }, []);

  const handleMouseDown = useCallback(
    (event) => {
      startDrag(event.clientX, event.clientY);
    },
    [startDrag]
  );

  const handleMouseUp = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleMouseMove = useCallback(
    (event) => {
      drag(event.clientX, event.clientY);
    },
    [drag]
  );

  const handleTouchStart = useCallback(
    (event) => {
      startDrag(event.touches[0].clientX, event.touches[0].clientY);
    },
    [startDrag]
  );

  const handleTouchEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleTouchMove = useCallback(
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      drag(event.touches[0].clientX, event.touches[0].clientY);
    },
    [drag]
  );

  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case "p":
        setPaused(true);
        break;
      case "s":
        setPaused(false);
        break;
      default:
        break;
    }
  }, []);

  // useEffect for setting up canvas and scene run once on mount
  useEffect(() => {
    setupCanvas();
    scene.setupScene();
  }, []);

  // useEffect for updating scene on state changes
  useEffect(() => {
    scene.gravity = gravity;
    scene.flipRatio = flipRatio;
    scene.showParticles = showParticles;
    scene.showGrid = showGrid;
    scene.compensateDrift = compensateDrift;
    scene.separateParticles = separateParticles;
    scene.paused = paused;
    scene.update();
  }, [
    showParticles,
    showGrid,
    compensateDrift,
    separateParticles,
    paused,
    flipRatio,
    gravity,
  ]);

  // useEffect for setting up and cleaning up event listeners
  useEffect(() => {
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleKeyDown,
  ]);

  return (
    <div className="App" style={{ boxSizing: "content-box" }}>
      <header className="App-header">
        <h3>Fluid Simulator</h3>
      </header>
      <body className="App-body" style={{ overflow: "hidden" }}>
        <ParticleControls
          showParticles={showParticles}
          showGrid={showGrid}
          compensateDrift={compensateDrift}
          separateParticles={separateParticles}
          paused={paused}
          gravity={gravity}
          flipRatio={flipRatio}
          density={density}
          obstacleRadius={obstacleRadius}
          onPausedChange={handlePausedChange}
          onShowParticlesChange={handleShowParticlesChange}
          onShowGridChange={handleShowGridChange}
          onCompensateDriftChange={handleCompensateDriftChange}
          onSeparateParticlesChange={handleSeparateParticlesChange}
          onSliderChange={handleSliderChange}
          onGravityChange={handleGravityChange}
          onDensityChange={handleDensityChange}
          onObstacleRadiusChange={handleObstacleRadiusChange}
        />
        <canvas
          id="myCanvas"
          style={{ height: "80vh", boxSizing: "content-box", width: "100%" }}
        />
      </body>
      <button onClick={handleRefreshClick} className="refreshButton">Refresh</button>
    </div>
  );
}
