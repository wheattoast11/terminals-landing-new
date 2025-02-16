"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { extend, Object3DNode } from '@react-three/fiber'
import React, { forwardRef, useImperativeHandle } from 'react'
import { disposeThreeObject } from '../utils/three-utils'

const ThreeLineCustom = THREE.Line;
extend({ ThreeLineCustom });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ThreeLineCustom: Object3DNode<THREE.Line, typeof THREE.Line>
    }
  }
}

const LineWrapper = forwardRef<THREE.Line, React.PropsWithChildren<{}>>((props, ref) => {
  const localRef = useRef<THREE.Line | null>(null);
  if (!localRef.current) {
    localRef.current = new THREE.Line();
  }
  useImperativeHandle(ref, () => localRef.current as THREE.Line);
  return <primitive object={localRef.current} {...props} />;
});

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  particles: string
  text: string
  glow: number
  intensity: number
}

interface NetworkLinesProps {
  audioIntensity: number
  colors: ThemeColors
}

export function NetworkLines({ audioIntensity }: NetworkLinesProps) {
  const linesRef = useRef<THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>>(null);
  const lineCount = 100;
  const lineSegments = 50;

  const positions = useMemo(() => {
    const ptsPerLine = lineSegments; // assuming curve.getPoints returns exactly 'lineSegments' points
    const total = lineCount * ptsPerLine * 3;
    const posArray = new Float32Array(total);
    let index = 0;
    for (let i = 0; i < lineCount; i++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(THREE.MathUtils.randFloatSpread(4), THREE.MathUtils.randFloatSpread(4), THREE.MathUtils.randFloatSpread(4)),
        new THREE.Vector3(THREE.MathUtils.randFloatSpread(4), THREE.MathUtils.randFloatSpread(4), THREE.MathUtils.randFloatSpread(4)),
        new THREE.Vector3(THREE.MathUtils.randFloatSpread(4), THREE.MathUtils.randFloatSpread(4), THREE.MathUtils.randFloatSpread(4))
      ]);
      const pts = curve.getPoints(lineSegments);
      for (let j = 0; j < pts.length; j++) {
        posArray[index++] = pts[j].x;
        posArray[index++] = pts[j].y;
        posArray[index++] = pts[j].z;
      }
    }
    return posArray;
  }, []);

  const initialPositions = useMemo(() => new Float32Array(positions), [positions]);

  const colors = useMemo(() => {
    const total = lineCount * lineSegments * 3;
    const colArray = new Float32Array(total);
    const color1 = new THREE.Color("#00ffff");
    const color2 = new THREE.Color("#ff00ff");
    let idx = 0;
    const ptsCount = lineCount * lineSegments;
    for (let i = 0; i < ptsCount; i++) {
      const mixed = color1.clone().lerp(color2, Math.random());
      colArray[idx++] = mixed.r;
      colArray[idx++] = mixed.g;
      colArray[idx++] = mixed.b;
    }
    return colArray;
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      const t = state.clock.getElapsedTime();
      const geometry = linesRef.current.geometry;
      const pos = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        const capX = Math.sin(t * 2 + i) * 0.005 * (1 + audioIntensity);
        const capY = Math.sin(t * 2 + i + 1) * 0.005 * (1 + audioIntensity);
        const capZ = Math.sin(t * 2 + i + 2) * 0.005 * (1 + audioIntensity);
        pos[i] = initialPositions[i] + Math.sin(t + i) * 0.05 * (1 + audioIntensity) + capX;
        pos[i + 1] = initialPositions[i + 1] + Math.sin(t + i + 1) * 0.05 * (1 + audioIntensity) + capY;
        pos[i + 2] = initialPositions[i + 2] + Math.sin(t + i + 2) * 0.05 * (1 + audioIntensity) + capZ;
      }
      geometry.attributes.position.needsUpdate = true;
      linesRef.current.rotation.x = t * 0.03;
      linesRef.current.rotation.y = t * 0.04;

      // Apply subtle undulating motion to each line based on time and audio intensity
      const lines = [linesRef.current];
      const uTime = t;
      const uAudioIntensity = audioIntensity;
      lines.forEach((line, idx) => {
        let sineOffset = Math.sin(uTime + idx) * 0.05; // base sine oscillation
        line.position.x += sineOffset * uAudioIntensity; // modulate position with audio intensity
        // Optionally update material opacity if available
        if(line.material && line.material.opacity !== undefined) {
          line.material.opacity = Math.max(0, 1.0 - Math.abs(sineOffset) * 10);
        }
      });
    }
  });

  useEffect(() => {
    return () => {
      if (linesRef.current) {
        disposeThreeObject(linesRef.current);
      }
    };
  }, []);

  return (
    <LineWrapper ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.4} blending={THREE.AdditiveBlending} />
    </LineWrapper>
  );
}

