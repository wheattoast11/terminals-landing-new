"use client"

import { useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"

const VolumetricLightMaterial = shaderMaterial(
  {
    uTime: 0,
    uLightPosition: new THREE.Vector3(0, 0, 0),
    uLightColor: new THREE.Color(0x00ffff),
    uDensity: 0.5,
  },
  // Vertex shader
  `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform vec3 uLightPosition;
    uniform vec3 uLightColor;
    uniform float uDensity;
    varying vec3 vPosition;

    void main() {
      vec3 lightDirection = normalize(uLightPosition - vPosition);
      float intensity = pow(max(dot(lightDirection, normalize(vPosition)), 0.0), 2.0);
      intensity *= uDensity;
      intensity *= (sin(uTime * 2.0) * 0.5 + 0.5) * 0.5 + 0.5; // Pulsating effect
      gl_FragColor = vec4(uLightColor, intensity);
    }
  `,
)

extend({ VolumetricLightMaterial })

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  particles: string
  text: string
  glow: number
  intensity: number
}

interface VolumetricLightProps {
  audioIntensity: number
  colors: ThemeColors
}

export function VolumetricLight({ audioIntensity, colors }: VolumetricLightProps) {
  const material = useMemo(() => new VolumetricLightMaterial(), []);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh>
      <sphereGeometry args={[2, 32, 32]} />
      <primitive object={material} attach="material" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

