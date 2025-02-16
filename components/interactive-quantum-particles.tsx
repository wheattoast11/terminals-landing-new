'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { InstancedMesh } from 'three'
import { gsap } from 'gsap'

const PARTICLE_COUNT = 1000
const INTERACTION_RADIUS = 0.5

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
  const meshRef = useRef<InstancedMesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null)
  const { mouse, viewport } = useThree()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const mouseTemp = useMemo(() => new THREE.Vector3(), [])
  const forceVec = useMemo(() => new THREE.Vector3(), [])
  const baseColor = useMemo(() => new THREE.Color(colors.particles), [colors.particles])

  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    gsap.to({ val: 0 }, {
      val: 1,
      duration: 1.0,
      onUpdate: function() {
        setOpacity(this.targets()[0].val);
      }
    });
  }, []);

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const position = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      )
      const velocity = new THREE.Vector3(
        Math.random() * 0.01 - 0.005,
        Math.random() * 0.01 - 0.005,
        Math.random() * 0.01 - 0.005
      )
      const color = new THREE.Color(colors.particles).multiplyScalar(Math.random() * 0.5 + 0.5)
      temp.push({ position, velocity, color })
    }
    return temp
  }, [colors.particles])

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    const { viewport } = state
    
    // Compute mouse position in world coordinates once per frame
    mouseTemp.set((mousePosition.x * viewport.width) / 2, (mousePosition.y * viewport.height) / 2, 0)
    
    // Update baseColor from current theme color
    baseColor.set(colors.particles)
    
    particles.forEach((particle, i) => {
      // Update particle position and velocity
      particle.position.add(particle.velocity)
      if (particle.position.length() > 2) {
        particle.position.setLength(2)
        particle.velocity.multiplyScalar(-1)
      }
      
      // Reuse forceVec to compute interaction force
      const distance = mouseTemp.distanceTo(particle.position)
      if (distance < INTERACTION_RADIUS) {
        forceVec.copy(mouseTemp).sub(particle.position).normalize().multiplyScalar(0.001)
        particle.velocity.add(forceVec)
      }
      
      // Update dummy's transformation for instancing
      dummy.position.copy(particle.position).add(new THREE.Vector3(
        Math.sin(time * 3 + i) * 0.002 * audioIntensity,
        Math.sin(time * 3 + i + 1) * 0.002 * audioIntensity,
        Math.sin(time * 3 + i + 2) * 0.002 * audioIntensity
      ))
      dummy.scale.setScalar(0.02 + Math.sin(time * 2 + i) * 0.01 + audioIntensity * 0.05)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
      
      // Update particle color based on baseColor and audio reactivity
      particle.color.copy(baseColor).multiplyScalar(0.5 + Math.sin(time * 0.1 + i) * 0.25 + audioIntensity * 0.2)
      meshRef.current!.setColorAt(i, particle.color)
    })
    
    meshRef.current!.instanceMatrix.needsUpdate = true
    if (meshRef.current!.instanceColor) {
      meshRef.current!.instanceColor!.needsUpdate = true
    }
  })

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);

  return (
    <instancedMesh ref={meshRef} count={PARTICLE_COUNT}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial transparent opacity={opacity * colors.intensity} />
    </instancedMesh>
  )
}

