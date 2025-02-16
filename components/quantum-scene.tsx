"use client"

import { useRef, Suspense, useMemo, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing"
import { CentralSingularity } from "./central-singularity"
import { ExpandingParticleNetwork } from "./expanding-particle-network"
import { NetworkLines } from "./network-lines"
import { InteractiveQuantumParticles } from "./interactive-quantum-particles"
import { QuantumTunneling } from "./quantum-tunneling"
import { VolumetricLight } from "./volumetric-light"
import { WebGLText } from "./webgl-text"
import { useAudioAnalyzer } from "@/components/audio-analyzer"
import { useTheme } from "next-themes"
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities"
import * as THREE from "three"
import LetterParticles from "./letter-particles"
import React from "react"

interface QuantumSceneProps {
  mousePosition: { x: number; y: number },
  effectsConfig?: QuantumEffectsConfig
}

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  particles: string
  text: string
  glow: number
  intensity: number
}

interface ComponentProps {
  audioIntensity: number
  colors: ThemeColors
}

interface InteractiveProps extends ComponentProps {
  mousePosition: { x: number; y: number }
}

interface BackgroundGridProps extends Omit<ComponentProps, 'audioIntensity'> {
  theme: string
}

interface QuantumEffectsConfig {
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  bloomHeight?: number;
  chromaticMultiplier?: number;
}

function DynamicCursor({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { camera, size } = useThree();
  const lastUpdateRef = useRef<number>(0);
  
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useEffect(() => {
    return () => {
      gradientTexture.dispose();
    };
  }, [gradientTexture]);

  useFrame(() => {
    // Throttle updates to prevent rapid state changes
    const now = performance.now();
    if (now - lastUpdateRef.current < 16) { // ~60fps
      return;
    }
    lastUpdateRef.current = now;

    if (meshRef.current) {
      const ndcX = (mousePosition.x / size.width) * 2 - 1;
      const ndcY = -(mousePosition.y / size.height) * 2 + 1;
      const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
      vec.unproject(camera);
      meshRef.current.position.lerp(vec, 0.1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[0.1, 0.1]} />
      <meshBasicMaterial 
        map={gradientTexture}
        transparent
        opacity={0.08}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function QuantumScene({ mousePosition, effectsConfig }: QuantumSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { audioData } = useAudioAnalyzer()
  const { theme } = useTheme()
  const { isLowPerfDevice } = useDeviceCapabilities()

  const previousIntensityRef = useRef(0);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
    }
  })

  const getAudioIntensity = useMemo(() => {
    if (!audioData) return previousIntensityRef.current;
    const sum = audioData.reduce((acc, val) => acc + val, 0);
    const currentIntensity = sum / audioData.length / 255; // Normalize to 0-1 range
    const alpha = 0.9; // smoothing factor (adjustable)
    previousIntensityRef.current = previousIntensityRef.current * alpha + currentIntensity * (1 - alpha);
    return previousIntensityRef.current;
  }, [audioData]);

  // Theme-aware colors
  const colors = useMemo(() => ({
    primary: theme === "dark" ? "#0fbfff" : "#6366f1",
    secondary: theme === "dark" ? "#e0e0e0" : "#818cf8",
    background: theme === "dark" ? "#000000" : "#ffffff",
    particles: theme === "dark" ? "#ffffff" : "#6366f1",
    text: theme === "dark" ? "#ffffff" : "#2c2c2c",
    glow: theme === "dark" ? 1.5 : 0.9,
    intensity: theme === "dark" ? 1 : 0.6
  }), [theme])

  // After defining colors and getAudioIntensity, compute effective post-processing parameters
  const effectiveBloomIntensity = effectsConfig?.bloomIntensity ?? (colors.glow * 1.1 + getAudioIntensity);
  const effectiveBloomThreshold = effectsConfig?.bloomThreshold ?? 0.1;
  const effectiveBloomSmoothing = effectsConfig?.bloomSmoothing ?? 0.95;
  const effectiveBloomHeight = effectsConfig?.bloomHeight ?? 300;
  const effectiveChromaticMultiplier = effectsConfig?.chromaticMultiplier ?? 1.05;

  return (
    <>
      {/* Scene Lighting */}
      <ambientLight intensity={theme === "dark" ? 0.1 : 0.3} />
      <pointLight position={[10, 10, 10]} intensity={theme === "dark" ? 0.5 : 0.7} />

      {/* Main Scene Group */}
      <group ref={groupRef}>
        <Suspense fallback={null}>
          <CentralSingularity audioIntensity={getAudioIntensity} colors={colors} />
          <ExpandingParticleNetwork audioIntensity={getAudioIntensity} colors={colors} />
          <NetworkLines audioIntensity={getAudioIntensity} colors={colors} />
          <InteractiveQuantumParticles mousePosition={mousePosition} audioIntensity={getAudioIntensity} colors={colors} />
          {!isLowPerfDevice && (
            <>
              <QuantumTunneling audioIntensity={getAudioIntensity} colors={colors} />
              <VolumetricLight audioIntensity={getAudioIntensity} colors={colors} />
            </>
          )}
          <WebGLText text="terminals" position={[0, 0.75, 0]} color={colors.text} size={0.7} />
          {!isLowPerfDevice && <LetterParticles colors={colors} />}
        </Suspense>
      </group>

      {/* Dynamic Cursor Effect */}
      <DynamicCursor mousePosition={mousePosition} />

      {/* Post Processing */}
      {!isLowPerfDevice && (
        <EffectComposer>
          <Bloom 
            intensity={effectiveBloomIntensity} 
            luminanceThreshold={effectiveBloomThreshold} 
            luminanceSmoothing={effectiveBloomSmoothing} 
            height={effectiveBloomHeight} 
          />
          <ChromaticAberration 
            offset={new THREE.Vector2(
              (0.002 * colors.intensity + getAudioIntensity * 0.002) * effectiveChromaticMultiplier, 
              (0.002 * colors.intensity + getAudioIntensity * 0.002) * effectiveChromaticMultiplier
            )} 
            radialModulation={false}
            modulationOffset={0}
          />
        </EffectComposer>
      )}
    </>
  )
}

const MemoizedQuantumScene = React.memo(QuantumScene);
export { MemoizedQuantumScene as QuantumScene };

