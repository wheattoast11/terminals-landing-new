"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { disposeThreeObject } from "../utils/three-utils"
import { useAudioAnalyzer } from './audio-analyzer'

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  particles: string
  text: string
  glow: number
  intensity: number
}

interface ExpandingParticleNetworkProps {
  audioIntensity: number
  colors: ThemeColors
}

// New component: NebulaEffect
function NebulaEffect() {
  const { isAudioLoaded } = useAudioAnalyzer();
  if (!isAudioLoaded) return null;
  
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  useEffect(() => {
    return () => {
      if (meshRef.current) {
        disposeThreeObject(meshRef.current);
      }
    };
  }, []);

  return (
    <mesh ref={meshRef} position={[0, 0, -1]} renderOrder={-1}>
      <planeGeometry args={[10, 10]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={`precision highp float;

// Custom uniform
uniform float uTime;

// Varying to pass data to fragment shader
varying vec2 vUv;

// Simplex 3D Noise function (snoise3) implementation
vec4 permute(vec4 t) {
  return mod(((t * 34.0) + 1.0) * t, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise3(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  // Permutations
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients
  float n_ = 1.0/7.0; // N=7
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  // Set the UV coordinates
  vUv = uv;

  // Calculate the displaced position using snoise3.  Ensure correct usage.
  vec3 displacedPosition = position + normal * (snoise3(position + uTime * 0.1) * 0.1 + snoise3(position * 2.0 + uTime * 0.2) * 0.05);

  // Calculate the final position
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
`}
        fragmentShader={`precision highp float;
uniform float uTime;
varying vec2 vUv;

// Improved noise function for better nebula effect
float noise(vec2 p) {
    return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    for(int i = 0; i < 4; i++) { // Keep iterations low for performance
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float dist = length(uv);
    
    // Create subtle edge glow
    float edgeGlow = smoothstep(0.8, 1.5, dist);
    
    // Nebula effect
    float nebula = fbm(uv + uTime * 0.05);
    nebula *= smoothstep(1.2, 0.4, dist); // Fade out towards center
    
    // Subtle color variations
    vec3 nebulaColor = mix(
        vec3(0.02, 0.0, 0.05),  // Deep purple
        vec3(0.0, 0.02, 0.04),  // Deep blue
        nebula
    );
    
    // Add very subtle cyan tint to edges
    nebulaColor += vec3(0.0, 0.01, 0.015) * edgeGlow;
    
    // Time-based pulsing
    float pulse = sin(uTime * 0.2) * 0.5 + 0.5;
    nebulaColor *= 0.8 + pulse * 0.2;
    
    // Combine everything with very low opacity
    gl_FragColor = vec4(nebulaColor, 0.015 + nebula * 0.01);
}`}
        transparent
        blending={THREE.AdditiveBlending}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export function ExpandingParticleNetwork({ audioIntensity, colors }: ExpandingParticleNetworkProps) {
  const pointsRef = useRef<THREE.Points<THREE.BufferGeometry, THREE.Material | THREE.Material[]>>(null);
  const particleCount = 2000;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      const x = Math.sin(theta) * Math.cos(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(theta);

      temp.push(x * 3, y * 3, z * 3);
    }
    return new Float32Array(temp);
  }, []);

  // Store a copy of initial positions for dynamic oscillation
  const initialPositions = useMemo(() => {
    return new Float32Array(particles);
  }, [particles]);

  const colorsArray = useMemo(() => {
    const temp = [];
    const color1 = new THREE.Color(colors.primary);
    const color2 = new THREE.Color(colors.secondary);
    const color3 = new THREE.Color(colors.particles);

    for (let i = 0; i < particleCount; i++) {
      let mixed = color1.clone().lerp(color2, Math.random());
      mixed = mixed.lerp(color3, Math.random());
      temp.push(mixed.r, mixed.g, mixed.b);
    }
    return new Float32Array(temp);
  }, [colors.primary, colors.secondary, colors.particles]);

  // Create a circular texture for particles
  function createParticleTexture() {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (context) {
      // Use a smoother gradient with more stops for better spherical appearance
      const gradient = context.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, "rgb(255, 255, 255)");
      gradient.addColorStop(0.15, "rgba(251, 243, 210, 0.95)");
      gradient.addColorStop(0.35, "rgba(177, 255, 254, 0.7)");
      gradient.addColorStop(0.5, "rgba(255, 83, 83, 0.67)");
      gradient.addColorStop(0.65, "rgba(255,255,255,0.2)");
      gradient.addColorStop(1, "rgba(40, 0, 73, 0.53)");
      
      // Clear the canvas first
      context.clearRect(0, 0, size, size);
      
      // Create base sphere shape
      context.beginPath();
      context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      context.fillStyle = gradient;
      context.fill();
      
      // Add highlight for 3D effect
      const highlightGradient = context.createRadialGradient(
        size * 0.4,
        size * 0.4,
        0,
        size * 0.35,
        size * 0.35,
        size * 0.4
      );
      highlightGradient.addColorStop(0, "rgba(255,255,255,0.4)");
      highlightGradient.addColorStop(0.5, "rgba(193, 9, 129, 0.3)");
      highlightGradient.addColorStop(1, "rgba(62, 206, 225, 0.19)");
      context.fillStyle = highlightGradient;
      context.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // Memoize the particle texture for performance
  const particleTexture = useMemo(() => createParticleTexture(), []);

  const { isAudioLoaded } = useAudioAnalyzer();

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const geometry = pointsRef.current.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    // Compute amplitude modulated by audioIntensity, reduced for smoother effect
    const amplitude = 0.1 + audioIntensity * 0.02;
    for (let i = 0; i < positions.length; i += 3) {
      // Base oscillation with smoother motion
      const phase = t * 0.1 + i * 0.0002;
      const baseX = initialPositions[i] + Math.sin(phase) * amplitude;
      const baseY = initialPositions[i + 1] + Math.sin(phase + 0.5) * amplitude;
      const baseZ = initialPositions[i + 2] + Math.sin(phase + 1.0) * amplitude;
      
      // Compute normalized original direction
      const origX = initialPositions[i], origY = initialPositions[i + 1], origZ = initialPositions[i + 2];
      const d = Math.sqrt(origX * origX + origY * origY + origZ * origZ) || 1;
      const nx = origX / d, ny = origY / d, nz = origZ / d;
      
      // Additional flare displacement for fluid dynamics with slower variation
      const flare = 0.015 * audioIntensity * Math.sin(t * 0.3 + i * 0.0002);
      
      // Added capillary ripple effect
      const rippleX = Math.sin(t * 3 + i) * 0.003 * audioIntensity;
      const rippleY = Math.sin(t * 3 + i + 1) * 0.003 * audioIntensity;
      const rippleZ = Math.sin(t * 3 + i + 2) * 0.003 * audioIntensity;
      
      // Update positions with base oscillation, flare and ripple
      positions[i] = baseX + nx * (flare * d) + rippleX;
      positions[i + 1] = baseY + ny * (flare * d) + rippleY;
      positions[i + 2] = baseZ + nz * (flare * d) + rippleZ;
    }
    geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.x = t * 0.02;
    pointsRef.current.rotation.y = t * 0.03;

    // Apply a subtle pulsing effect to the particle system using smooth interpolation
    const targetScale = 1 + 0.01 * Math.sin(t * 0.1) * audioIntensity;
    pointsRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  useEffect(() => {
    if (!pointsRef.current) return;
    const points = pointsRef.current.geometry;
    if (points) {
      points.dispose();
    }
    if (Array.isArray(pointsRef.current.material)) {
      pointsRef.current.material.forEach(mat => mat.dispose());
    } else if (pointsRef.current.material) {
      pointsRef.current.material.dispose();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (pointsRef.current) {
        if (pointsRef.current.geometry) {
          pointsRef.current.geometry.dispose();
        }
        if (Array.isArray(pointsRef.current.material)) {
          pointsRef.current.material.forEach(mat => mat.dispose());
        } else if (pointsRef.current.material) {
          pointsRef.current.material.dispose();
        }
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (particleTexture) {
        particleTexture.dispose();
      }
    };
  }, [particleTexture]);

  return (
    <group>
      { isAudioLoaded && <NebulaEffect /> }
      <points ref={pointsRef} renderOrder={1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={colorsArray.length / 3} array={colorsArray} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          vertexColors
          transparent
          opacity={0.7 + audioIntensity * 0.1}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          map={particleTexture}
          alphaTest={0.001}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

