// import React, { useEffect, useRef, useState } from 'react';
// import {scene} from "./App.js";
// import {canvas} from "./Canvas.js";

// const CanvasComponent = ({ setObstacle, setScene }) => {
//     const canvasRef = useRef(canvas);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const bounds = canvas.getBoundingClientRect();
//     console.log("canvas obstacle", scene.obstacleX, scene.obstacleY);

//     const startDrag = (x, y) => {
//       let mx = x - bounds.left - canvas.clientLeft;
//       let my = y - bounds.top - canvas.clientTop;
//       x = mx / scene.cScale;
//       y = (canvas.height - my) / scene.cScale;

//       setScene((prevScene) => ({
//         ...prevScene,
//         obstacleX: x, // update obstacleX and other properties as needed
//         obstacleY: y,
//         mouseDown: true,
//         paused: false,
//       }));
//     };

//     const drag = (x, y) => {
//       let mx = x - bounds.left - canvas.clientLeft;
//       let my = y - bounds.top - canvas.clientTop;
//       x = mx / scene.cScale;
//       y = (canvas.height - my) / scene.cScale;

//       setObstacle(x, y, false);
//     };

//     const endDrag = () => {
//       setScene((prevScene) => ({
//         ...prevScene,
//         mouseDown: false,
//         obstacleVelX: 0.0,
//         obstacleVelY: 0.0,
//       }));
//     };
//     const handleMouseDown = (event) => {
//         startDrag(event.clientX, event.clientY);
//       };
  
//       const handleMouseUp = () => {
//         endDrag();
//       };
  
//       const handleMouseMove = (event) => {
//         drag(event.clientX, event.clientY);
//       };
  
//       const handleTouchStart = (event) => {
//         startDrag(event.touches[0].clientX, event.touches[0].clientY);
//       };
  
//       const handleTouchEnd = () => {
//         endDrag();
//       };
  
//       const handleTouchMove = (event) => {
//         event.preventDefault();
//         event.stopImmediatePropagation();
//         drag(event.touches[0].clientX, event.touches[0].clientY);
//       };
//       canvas.addEventListener('mousedown', handleMouseDown);
//       canvas.addEventListener('mouseup', handleMouseUp);
//       canvas.addEventListener('mousemove', handleMouseMove);
//       canvas.addEventListener('touchstart', handleTouchStart);
//       canvas.addEventListener('touchend', handleTouchEnd);
//       canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

//     return () => {
//       // Cleanup: Remove event listeners when the component unmounts
//       canvas.removeEventListener('mousedown', handleMouseDown);
//       canvas.removeEventListener('mouseup', handleMouseUp);
//       canvas.removeEventListener('mousemove', handleMouseMove);
//       canvas.removeEventListener('touchstart', handleTouchStart);
//       canvas.removeEventListener('touchend', handleTouchEnd);
//       canvas.removeEventListener('touchmove', handleTouchMove, { passive: false });
//     };
//   }, [scene.cScale, setObstacle, setScene, scene.obstacleX, scene.obstacleY]);

//   return <canvas ref={canvasRef} id="myCanvas" />;
// };

// export default CanvasComponent;
