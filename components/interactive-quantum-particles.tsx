'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { InstancedMesh } from 'three'
import { gsap } from 'gsap'

const PARTICLE_COUNT = 400
const INTERACTION_RADIUS = 0.4

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  particles: string
  text: string
  glow: number
  intensity: number
}

interface InteractiveQuantumParticlesProps {
  mousePosition: { x: number; y: number }
  audioIntensity: number
  colors: ThemeColors
}

export function InteractiveQuantumParticles({ mousePosition, audioIntensity, colors }: InteractiveQuantumParticlesProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { mouse, viewport } = useThree()
  const mouseTemp = useMemo(() => new THREE.Vector3(), [])
  const forceVec = useMemo(() => new THREE.Vector3(), [])
  const baseColor = useMemo(() => new THREE.Color(colors.particles), [colors.particles])
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(1, 16, 16), [])

  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    const tween = gsap.to({ val: 0 }, {
      val: 1,
      duration: 1.0,
      onUpdate: function() {
        setOpacity(this.targets()[0].val);
      }
    });
    return () => {
      tween.kill();
      return undefined;
    };
  }, []);

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.cbrt(Math.random()) * 2
      
      const position = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      )
      const velocity = new THREE.Vector3(
        Math.random() * 0.006 - 0.004,
        Math.random() * 0.006 - 0.004,
        Math.random() * 0.006 - 0.002
      )
      const color = new THREE.Color(colors.particles).multiplyScalar(Math.random() * 0.5 + 0.5)
      temp.push({ position, velocity, color })
    }
    return temp
  }, [colors.particles])

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.getElapsedTime()
    
    // Compute mouse position in world coordinates once per frame
    mouseTemp.set((mousePosition.x * viewport.width) / 2, (mousePosition.y * viewport.height) / 2, 0)
    
    // Update baseColor from current theme color
    baseColor.set(colors.particles)
    
    particles.forEach((particle, i) => {
      // Update particle position and velocity with smoother motion
      particle.position.add(particle.velocity)
      if (particle.position.length() > 2) {
        particle.position.setLength(2)
        particle.velocity.multiplyScalar(-0.9)
      }
      
      // Enhanced interaction force with smoother falloff
      const distance = mouseTemp.distanceTo(particle.position)
      if (distance < INTERACTION_RADIUS) {
        const forceFactor = (1 - distance / INTERACTION_RADIUS) * 0.001
        forceVec.copy(mouseTemp).sub(particle.position).normalize().multiplyScalar(forceFactor)
        particle.velocity.add(forceVec)
      }
      
      // Smoother audio-reactive motion with reduced intensity
      const audioScale = 0.002 * (1 + audioIntensity * 0.5)
      particle.position.add(new THREE.Vector3(
        Math.sin(time * 1.5 + i) * audioScale,
        Math.cos(time * 1.5 + i + 1) * audioScale,
        Math.sin(time * 1.2 + i + 2) * audioScale
      ))
      
      // Update color with gentler audio reactivity
      const intensityFactor = 0.7 + Math.sin(time * 0.5 + i) * 0.2 + audioIntensity * 0.3
      particle.color.copy(baseColor).multiplyScalar(intensityFactor)
      
      // Update the mesh
      const mesh = groupRef.current!.children[i] as THREE.Mesh
      mesh.position.copy(particle.position)
      const scale = 0.015 + Math.sin(time * 1.2 + i) * 0.003 + audioIntensity * 0.005
      mesh.scale.setScalar(scale)
      ;(mesh.material as THREE.MeshStandardMaterial).color.copy(particle.color)
    })
  })

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (groupRef.current) {
        groupRef.current.children.forEach(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose())
            } else if (child.material) {
              child.material.dispose()
            }
          }
        })
      }
    }
  }, [])

  return (
    <group ref={groupRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position} geometry={sphereGeometry}>
          <meshStandardMaterial
            transparent
            opacity={opacity * colors.intensity * 0.9}
            emissive={new THREE.Color(colors.particles)}
            emissiveIntensity={colors.glow * 0.7}
            metalness={0.5}
            roughness={0.1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

