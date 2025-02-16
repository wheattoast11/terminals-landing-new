'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      quantumMaterial: any;
    }
  }
}

const QuantumMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorA: new THREE.Color('#00ffff'),
    uColorB: new THREE.Color('#ff00ff'),
    uIntensity: 1.0,
    uAudioIntensity: 0,
    uDisplacement: 0.1,
    uPulse: 1.0,
  },
  // Vertex Shader with dynamic displacement
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform highp float uTime;
    uniform float uDisplacement;

    void main() {
      vUv = uv;
      vPosition = position;
      // Using a simpler displacement for now.  We'll re-introduce noise if needed *after* resolving the core issue.
      vec3 displacedPosition = position + normal * (sin(position.x + uTime) * uDisplacement);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
    }
  `,
  // Fragment Shader with enhanced glow effect
  `
    uniform highp float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uIntensity;
    uniform float uAudioIntensity;
    uniform float uPulse;

    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      float dist = length(vUv - 0.5);
      float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
      float ring = smoothstep(0.5, 0.45, dist) * smoothstep(0.25, 0.30, dist);

      vec3 color = mix(uColorA, uColorB, pulse);
      float alpha = ring * (1.0 - dist * 2.0) * uIntensity;

      // Audio reactivity with pulse effect
      alpha *= uPulse * (1.0 + uAudioIntensity * 0.5);
      color += vec3(uAudioIntensity * 0.2, uAudioIntensity * 0.1, uAudioIntensity * 0.3);

      gl_FragColor = vec4(color, alpha);
    }
  `
)

extend({ QuantumMaterial })

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  particles: string
  text: string
  glow: number
  intensity: number
}

interface CentralSingularityProps {
  audioIntensity: number
  colors: ThemeColors
}

export function CentralSingularity({ audioIntensity, colors }: CentralSingularityProps) {
  const groupRef = useRef<THREE.Group>(null)

  const material = useMemo(() => new QuantumMaterial(), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    material.uniforms.uTime.value = t;
    material.uniforms.uIntensity.value = 0.8 + Math.sin(t) * 0.2;
    material.uniforms.uAudioIntensity.value = audioIntensity;
    material.uniforms.uColorA.value = new THREE.Color(colors.primary);
    material.uniforms.uColorB.value = new THREE.Color(colors.secondary);
    material.uniforms.uPulse.value = 1.0;
    if (groupRef.current) {
      groupRef.current.rotation.z = t * 0.1;
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[4, 4, 32, 32]} />
        <primitive object={material} attach="material" transparent depthWrite={false} />
      </mesh>
    </group>
  )
}

