"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import * as THREE from "three"

const GridMaterial = shaderMaterial(
  {
    uTime: 0,
    uScale: 10.0,
    uIntensity: 0.15,
    uColor: [0.5, 0.8, 1.0],
    uRotation: 0.0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform float uScale;
    uniform float uIntensity;
    uniform float uRotation;
    uniform vec3 uColor;
    
    varying vec2 vUv;
    
    mat2 rotate2D(float angle) {
      return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    }
    
    void main() {
      vec2 rotatedUV = rotate2D(vUv - 0.5, uRotation) + 0.5;
      float dist = length(rotatedUV - 0.5);
      
      vec2 center = rotatedUV - 0.5;
      float line = min(center.x, center.y);
      
      float alpha = 1.0 - min(line, 1.0);
      alpha *= smoothstep(1.0, 0.2, dist) * uIntensity * 0.5;
      
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
)

// Extend the shader material to make it available in JSX
extend({ GridMaterial })

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  particles: string
  text: string
  glow: number
  intensity: number
}

interface BackgroundGridProps {
  theme: string
  colors: ThemeColors
}

export function BackgroundGrid({ theme, colors }: BackgroundGridProps) {
  const material = useMemo(() => new GridMaterial(), [])

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.getElapsedTime()
    material.uniforms.uScale.value = 10.0
    material.uniforms.uIntensity.value = theme === 'dark' ? 0.15 : 0.1
    material.uniforms.uColor.value = new THREE.Color(colors.particles)
    material.uniforms.uRotation.value = state.clock.getElapsedTime() * 0.05
  })

  return (
    <mesh position={[0, 0, -2]} rotation={[0, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <primitive object={material} attach="material" transparent depthWrite={false} />
    </mesh>
  )
}

