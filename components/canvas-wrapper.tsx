"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Suspense } from "react"
import { QuantumScene } from "./quantum-scene"
import { useTheme } from "next-themes"
import * as THREE from 'three';
import React, { useRef } from 'react';

export interface CanvasWrapperProps {
  mousePosition: {
    x: number;
    y: number;
  };
}

function CameraEffects({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const { camera } = useThree();
  // Ref to store smoothed mouse values
  const smoothedMouse = React.useRef({ x: 0, y: 0 });
  // Ref to throttle updates
  const accumulatedTime = React.useRef(0);
  
  useFrame((state, delta) => {
    accumulatedTime.current += delta;
    if (accumulatedTime.current < 0.2) {  // update only every 0.2 sec
      return;
    }
    accumulatedTime.current = 0;
    
    // Dampen the mouse movement effect
    smoothedMouse.current.x += (mousePosition.x - smoothedMouse.current.x) * 0.05;
    smoothedMouse.current.y += (mousePosition.y - smoothedMouse.current.y) * 0.05;
    
    // If mouse is near center, gently decay to 0
    if (Math.abs(mousePosition.x) < 0.01) {
      smoothedMouse.current.x *= 0.98;
    }
    if (Math.abs(mousePosition.y) < 0.01) {
      smoothedMouse.current.y *= 0.98;
    }
    
    const persCamera = camera as THREE.PerspectiveCamera;
    const baseFov = 75;
    // Use an even smaller multiplier for FOV effect
    const fovOffset = smoothedMouse.current.x * 0.001;
    const targetFov = baseFov + fovOffset;
    if (Math.abs(targetFov - persCamera.fov) > 0.5) {  // update only if difference is significant
      persCamera.fov += (targetFov - persCamera.fov) * 0.1;
      persCamera.updateProjectionMatrix();
    }
    
    // Apply even smaller, smooth rotations
    const targetRotationX = smoothedMouse.current.y * 0.00002;
    const targetRotationZ = smoothedMouse.current.x * 0.00002;
    if (Math.abs(targetRotationX - persCamera.rotation.x) > 0.00005) {
      persCamera.rotation.x += (targetRotationX - persCamera.rotation.x) * 0.1;
    }
    if (Math.abs(targetRotationZ - persCamera.rotation.z) > 0.00005) {
      persCamera.rotation.z += (targetRotationZ - persCamera.rotation.z) * 0.1;
    }
  });
  return null;
}

export const CanvasWrapper: React.FC<CanvasWrapperProps> = ({ mousePosition }) => {
  const { theme } = useTheme()

  const stableMousePosition = React.useMemo(() => ({ x: mousePosition.x, y: mousePosition.y }), [mousePosition.x, mousePosition.y]);

  return (
    <Canvas 
      camera={{ position: [0, 0, 5], fov: 75 }} 
      style={{ position: "absolute" }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
        logarithmicDepthBuffer: true,
        // Prevent color separation
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        // Improve edge smoothing
        preserveDrawingBuffer: false,
        // Prevent temporal artifacts
        precision: "highp"
      }}
      dpr={[1, 2]} // Limit max pixel ratio to 2
      linear // Use linear color space for materials
    >
      <color attach="background" args={[theme === "dark" ? "#000000" : "#ffffff"]} />
      <CameraEffects mousePosition={stableMousePosition} />
      <InteractiveScene mousePosition={stableMousePosition} />
      <Suspense fallback={null}>
        <QuantumScene mousePosition={stableMousePosition} />
      </Suspense>
    </Canvas>
  )
}

function InteractiveScene({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  useFrame((state) => {
    const { camera } = state;
    if (camera instanceof THREE.PerspectiveCamera) {
      const baseFov = 75;
      // Calculate offset relative to center
      const offsetX = (mousePosition.x - window.innerWidth / 2) / (window.innerWidth / 2);
      const offsetY = (mousePosition.y - window.innerHeight / 2) / (window.innerHeight / 2);
      
      // Use much smaller multipliers for a subtle effect
      const targetFov = baseFov + offsetX * 0.5;
      camera.fov += (targetFov - camera.fov) * 0.03;
      
      // Adjust camera rotation for a very subtle tilt
      camera.rotation.x += ((-offsetY * 0.02) - camera.rotation.x) * 0.03;
      camera.rotation.y += ((offsetX * 0.02) - camera.rotation.y) * 0.03;
      camera.updateProjectionMatrix();
    } else {
      // If not a PerspectiveCamera, we skip updating fov.
    }
  });
  return null;
}

