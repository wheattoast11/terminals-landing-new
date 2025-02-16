"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const PARTICLE_COUNT = 500
const SINGULARITY_RADIUS = 0.5

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  particles: string
  text: string
  glow: number
  intensity: number
}

interface QuantumTunnelingProps {
  audioIntensity: number
  colors: ThemeColors
}

export function QuantumTunneling({ audioIntensity, colors }: QuantumTunnelingProps) {
  const particlesRef = useRef<THREE.Points>(null)

  const [positions, velocities] = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const r = Math.random() * 2 + 1

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      velocities[i * 3] = (Math.random() - 0.5) * 0.01
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01
    }

    return [positions, velocities]
  }, [])

  useFrame(() => {
    if (!particlesRef.current) return

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3

      // Update position
      positions[i3] += velocities[i3]
      positions[i3 + 1] += velocities[i3 + 1]
      positions[i3 + 2] += velocities[i3 + 2]

      // Check if particle is close to singularity
      const distanceToCenter = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2)

      if (distanceToCenter < SINGULARITY_RADIUS) {
        // Quantum tunneling effect: teleport particle to a random position
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)
        const r = Math.random() * 2 + 1

        positions[i3] = r * Math.sin(phi) * Math.cos(theta)
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        positions[i3 + 2] = r * Math.cos(phi)
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={new THREE.Color(0x00ffff)}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

