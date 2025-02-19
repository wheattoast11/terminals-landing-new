"use client"

import { useRef, Suspense, useMemo, useEffect, useState } from "react"
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
  const { theme } = useTheme()
  const { audioData, getAudioIntensity, isAudioLoaded } = useAudioAnalyzer()
  const { isLowPerfDevice } = useDeviceCapabilities()
  const [isMobile, setIsMobile] = useState(false)
  const previousIntensityRef = useRef(0)
  const [smoothedIntensity, setSmoothedIntensity] = useState(0)
  const lastUpdateTimeRef = useRef(0)

  // Update smoothed intensity with lerp and throttling
  useEffect(() => {
    const updateIntensity = () => {
      const now = performance.now()
      // Throttle updates to 24fps
      if (now - lastUpdateTimeRef.current < 1000 / 24) {
        return
      }
      lastUpdateTimeRef.current = now

      const currentIntensity = getAudioIntensity()
      const lerpFactor = 0.08 // Slightly reduced for smoother transitions
      const newIntensity = previousIntensityRef.current + (currentIntensity - previousIntensityRef.current) * lerpFactor
      
      // Only update if change is significant
      if (Math.abs(newIntensity - previousIntensityRef.current) > 0.01) {
        previousIntensityRef.current = newIntensity
        setSmoothedIntensity(newIntensity)
      }
    }

    const intervalId = setInterval(updateIntensity, 1000 / 24) // Reduced to 24fps
    return () => clearInterval(intervalId)
  }, [getAudioIntensity])

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime()
      // Reduced base animation values and audio reactivity multipliers
      const baseRotationSpeed = 0.03
      const audioRotationBoost = smoothedIntensity * 0.02
      groupRef.current.rotation.x = t * (baseRotationSpeed + audioRotationBoost) * 0.01
      groupRef.current.rotation.y = t * (baseRotationSpeed + audioRotationBoost) * 0.01
      
      // Simplified oscillation with reduced audio impact
      const baseOscillation = 0.008
      groupRef.current.position.y = Math.sin(t * 0.2) * baseOscillation
    }
  })

  // Theme-aware colors with reduced updates
  const colors = useMemo(() => ({
    primary: theme === "dark" ? "#0fbfff" : "#6366f1",
    secondary: theme === "dark" ? "#e0e0e0" : "#818cf8",
    background: theme === "dark" ? "#000000" : "#ffffff",
    particles: theme === "dark" ? "#ffffff" : "#6366f1",
    text: theme === "dark" ? "#ffffff" : "#2c2c2c",
    glow: theme === "dark" ? 1.2 : 0.8, // Reduced glow intensity
    intensity: theme === "dark" ? 0.6 : 0.4 // Reduced base intensity
  }), [theme])

  // Optimized post-processing parameters
  const effectiveBloomIntensity = effectsConfig?.bloomIntensity ?? (colors.glow + smoothedIntensity * 0.5)
  const effectiveBloomThreshold = effectsConfig?.bloomThreshold ?? 0.2
  const effectiveBloomSmoothing = effectsConfig?.bloomSmoothing ?? 0.95
  const effectiveBloomHeight = effectsConfig?.bloomHeight ?? 100 // Reduced height
  const effectiveChromaticMultiplier = effectsConfig?.chromaticMultiplier ?? 0.6
  const chromaticAudioEffect = smoothedIntensity * 0.001 // Reduced effect

  return (
    <>
      {/* Scene Lighting */}
      <ambientLight intensity={theme === "dark" ? 0.1 : 0.3} />
      <pointLight position={[10, 10, 10]} intensity={theme === "dark" ? 0.5 : 0.7} />

      {/* Main Scene Group */}
      <group ref={groupRef}>
        <Suspense fallback={null}>
          <CentralSingularity audioIntensity={smoothedIntensity} colors={colors} />
          <ExpandingParticleNetwork audioIntensity={smoothedIntensity * 0.01} colors={colors} />
          <NetworkLines audioIntensity={0} colors={colors} />
          <InteractiveQuantumParticles mousePosition={mousePosition} audioIntensity={smoothedIntensity} colors={colors} />
          {!isLowPerfDevice && (
            <>
              <QuantumTunneling audioIntensity={smoothedIntensity * 0.2} colors={colors} />
              <VolumetricLight audioIntensity={0} colors={colors} />
            </>
          )}
          <WebGLText 
            text="terminals" 
            position={[0, isMobile ? 0.5 : 0.75, 0]} 
            color={colors.text} 
            size={isMobile ? 0.5 : 0.7} 
            audioIntensity={smoothedIntensity * 0.3} 
          />
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
              (0.001 * colors.intensity + chromaticAudioEffect) * effectiveChromaticMultiplier, 
              (0.001 * colors.intensity + chromaticAudioEffect) * effectiveChromaticMultiplier
            )} 
            radialModulation={true}
            modulationOffset={0.5}
          />
        </EffectComposer>
      )}
    </>
  )
}

// Export only the memoized version
export const MemoizedQuantumScene = React.memo(QuantumScene);
export { MemoizedQuantumScene as QuantumScene };

