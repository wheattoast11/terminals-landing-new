"use client"

import { useEffect, useState } from "react"
import { ThemeToggle } from "./theme-toggle"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { AudioControls } from "./audio-controls"
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import React, { useRef, useMemo } from "react"
import { Sphere } from "@react-three/drei"
import Image from "next/image"

const navItems = [
  { label: "/emergence" },
  { label: "/swarms" },
  { label: "/network" },
  { label: "/experience" },
  { label: "/understand" },
]

// Simple Particle Effect for Hover Cards (very subtle)
function SubtleParticles() {
  const { theme } = useTheme();
  const meshRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const positions = new Float32Array(50 * 3); // Reduced particle count
    for (let i = 0; i < 50; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return [positions];
  }, []);

    useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.z += delta * 0.05;
    }
  });

  const color = theme === 'dark' ? "#ffffff" : "#000000";

    useEffect(() => {
    return () => {
      if (meshRef.current) {
        if (meshRef.current.geometry) {
          meshRef.current.geometry.dispose();
        }
        const material = meshRef.current.material;
        if (Array.isArray(material)) {
          material.forEach(mat => {
            if (mat && typeof mat.dispose === 'function') {
              mat.dispose();
            }
          });
        } else if (material && typeof material.dispose === 'function') {
          material.dispose();
        }
      }
    };
  }, []);

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color={color} transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function SubtleBackgroundMesh({ theme }: { theme: string }) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.z = 0.05 * Math.sin(t * 0.8);
      meshRef.current.rotation.x = 0.03 * Math.cos(t * 0.5);
      meshRef.current.position.x = 0.1 * Math.sin(t * 0.9);
      meshRef.current.position.y = 0.1 * Math.cos(t * 0.7);
    }
  });
  const color = theme === 'dark' ? "#ffffff" : "#000000";
  React.useEffect(() => {
    return () => {
      if (meshRef.current) {
        if (meshRef.current.geometry) {
          meshRef.current.geometry.dispose();
        }
        const material = meshRef.current.material;
        if (Array.isArray(material)) {
          material.forEach(mat => {
            if (mat && typeof mat.dispose === 'function') {
              mat.dispose();
            }
          });
        } else if (material && typeof material.dispose === 'function') {
          material.dispose();
        }
      }
    };
  }, []);
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[6, 3]} />
      <meshStandardMaterial color={color} transparent opacity={0.05} />
    </mesh>
  );
}

// Custom Line Component
const NetworkLine = React.memo(({ start, end, color, opacity }: { 
  start: THREE.Vector3, 
  end: THREE.Vector3, 
  color: string,
  opacity: number 
}) => {
  const ref = useRef<THREE.Line>(null);

  useEffect(() => {
    if (ref.current) {
      const positions = new Float32Array([
        start.x, start.y, start.z,
        end.x, end.y, end.z
      ]);
      ref.current.geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  }, [start, end]);

  return (
    <primitive object={new THREE.Line(
      new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.Float32BufferAttribute([
          start.x, start.y, start.z,
          end.x, end.y, end.z
        ], 3)
      ),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    )} ref={ref} />
  );
});

// Dynamic Network Component - For /network visualization
function DynamicNetworkLines({ audioIntensity, colors }: { audioIntensity: number, colors: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  
  const [nodes] = useState(() => {
    const initialNodes = [];
    const connections: [number, number][] = [];
    
    // Create nodes
    for (let i = 0; i < 5; i++) {
      initialNodes.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 2
        )
      );
    }
    
    // Create connections
    for (let i = 0; i < initialNodes.length; i++) {
      for (let j = i + 1; j < initialNodes.length; j++) {
        if (Math.random() > 0.5) {
          connections.push([i, j]);
        }
      }
    }
    
    return { nodes: initialNodes, connections };
  });

  useFrame((state) => {
    if (groupRef.current && lineRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Update node positions
      nodes.nodes.forEach((node, i) => {
        node.x += Math.sin(t * 0.5 + i) * 0.003;
        node.y += Math.cos(t * 0.3 + i) * 0.002;
        node.z += Math.sin(t * 0.4 + i) * 0.001;
      });

      // Update line positions
      const positions = new Float32Array(nodes.connections.length * 6);
      nodes.connections.forEach(([from, to], i) => {
        const fromNode = nodes.nodes[from];
        const toNode = nodes.nodes[to];
        
        positions[i * 6] = fromNode.x;
        positions[i * 6 + 1] = fromNode.y;
        positions[i * 6 + 2] = fromNode.z;
        positions[i * 6 + 3] = toNode.x;
        positions[i * 6 + 4] = toNode.y;
        positions[i * 6 + 5] = toNode.z;
      });
      
      lineRef.current.geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nodes.connections.length * 2}
            array={new Float32Array(nodes.connections.length * 6)}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={colors.primary}
          transparent
          opacity={0.6 + audioIntensity * 0.4}
        />
      </lineSegments>
      {nodes.nodes.map((node, i) => (
        <mesh key={i} position={[node.x, node.y, node.z]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color={colors.primary}
            emissive={colors.primary}
            emissiveIntensity={colors.glow}
          />
        </mesh>
      ))}
    </group>
  );
}

// Enhanced Understanding Network - For /understand visualization
function EnhancedNetworkLines({ audioIntensity, colors }: { audioIntensity: number, colors: any }) {
  const [nodes] = useState(() => {
    return Array(8).fill(0).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5)
      ),
      pulsePhase: Math.random() * Math.PI * 2,
      rotationSpeed: Math.random() * 0.2 + 0.1,
      scale: 1
    }));
  });

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    nodes.forEach((node, i) => {
      // Automatic rotation
      const radius = 1 + Math.sin(t * 0.2 + i) * 0.2;
      const angle = t * node.rotationSpeed + i * (Math.PI * 2 / 8);
      
      node.position.x = Math.cos(angle) * radius * 0.5;
      node.position.y = Math.sin(angle) * radius * 0.5;
      node.position.z = Math.sin(t * 0.3 + i) * 0.2;
      
      // Pulse effect
      node.scale = 1 + Math.sin(t * 2 + node.pulsePhase) * 0.3 * (1 + audioIntensity * 0.3);
    });
  });

  return (
    <group>
      {nodes.map((node, i) => (
        <group key={i}>
          <Sphere 
            position={[node.position.x, node.position.y, node.position.z]}
            scale={node.scale}
            args={[0.1, 32, 32]}
          >
            <meshStandardMaterial
              color={colors.primary}
              emissive={colors.primary}
              emissiveIntensity={colors.glow * node.scale}
              transparent
              opacity={0.9}
            />
          </Sphere>
          {nodes.slice(i + 1).map((otherNode, j) => {
            const distance = node.position.distanceTo(otherNode.position);
            if (distance < 1) {
              const opacity = (1 - distance) * 0.5 * (1 + audioIntensity * 0.3);
              return (
                <NetworkLine
                  key={`${i}-${j}`}
                  start={node.position}
                  end={otherNode.position}
                  color={colors.primary}
                  opacity={opacity}
                />
              );
            }
            return null;
          })}
        </group>
      ))}
    </group>
  );
}

// Concept Visualization Component
function ConceptVisualization({ concept, theme }: { concept: string; theme: string }) {
  const baseColors = {
    primary: theme === 'dark' ? '#ffffff' : '#000000',
    secondary: theme === 'dark' ? '#ffffff' : '#000000',
    background: theme === 'dark' ? '#000000' : '#ffffff',
    particles: theme === 'dark' ? '#ffffff' : '#000000',
    text: theme === 'dark' ? '#ffffff' : '#000000',
    glow: 0.5,
    intensity: 0.5
  };

  // Reuse existing components based on the concept
  switch(concept) {
    case "/emergence":
      return (
        <div className="h-[240px] w-full relative overflow-hidden rounded-lg">
          <Canvas camera={{ position: [0, 0, 2] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <CentralSingularity 
              audioIntensity={0.5}
              colors={{
                ...baseColors,
                glow: 0.8,
                intensity: 0.7
              }}
            />
          </Canvas>
        </div>
      );
    case "/swarms":
      return (
        <div className="h-[240px] w-full relative overflow-hidden rounded-lg">
          <Canvas camera={{ position: [0, 0, 2] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <ExpandingParticleNetwork 
              audioIntensity={0.5}
              colors={{
                ...baseColors,
                glow: 0.6,
                intensity: 0.8
              }}
            />
          </Canvas>
        </div>
      );
    case "/network":
      return (
        <div className="h-[240px] w-full relative overflow-hidden rounded-lg">
          <Canvas camera={{ position: [0, 0, 2] }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} />
            <DynamicNetworkLines 
              audioIntensity={0.5} 
              colors={{
                ...baseColors,
                glow: 0.7,
                intensity: 0.6
              }} 
            />
          </Canvas>
        </div>
      );
    case "/experience":
      return (
        <div className="h-[240px] w-full relative overflow-hidden rounded-lg">
          <Canvas camera={{ position: [0, 0, 2] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <DimensionalTransform 
              audioIntensity={0.5}
              colors={{
                ...baseColors,
                glow: 0.6,
                intensity: 0.7
              }}
            />
          </Canvas>
        </div>
      );
    case "/understand":
      return (
        <div className="h-[240px] w-full relative overflow-hidden rounded-lg">
          <Canvas camera={{ position: [0, 0, 2] }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} />
            <EnhancedNetworkLines 
              audioIntensity={0.8}
              colors={{
                ...baseColors,
                glow: 0.9,
                intensity: 0.8
              }} 
            />
          </Canvas>
        </div>
      );
    default:
      return (
        <div className="h-[240px] w-full relative overflow-hidden rounded-lg">
          <Canvas camera={{ position: [0, 0, 2] }}>
            <SubtleParticles />
          </Canvas>
        </div>
      );
  }
}

// DimensionalTransform Component - Shows 2D to 3D transformation
function DimensionalTransform({ audioIntensity, colors }: { audioIntensity: number, colors: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [morphProgress, setMorphProgress] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      // Oscillate between 2D and 3D
      const newProgress = (Math.sin(t * 0.5) + 1) / 2;
      setMorphProgress(newProgress);
      
      // Rotate smoothly
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1, 0.3, 16, 32]} />
      <meshStandardMaterial
        color={colors.primary}
        metalness={0.5}
        roughness={0.2}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Central Singularity Component - Rotating portal effect
function CentralSingularity({ audioIntensity, colors }: { audioIntensity: number, colors: any }) {
  const portalRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (portalRef.current && ringRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Rotate portal
      portalRef.current.rotation.z = t * 0.5;
      
      // Counter-rotate ring
      ringRef.current.rotation.z = -t * 0.3;
      
      // Pulse effect
      const pulse = Math.sin(t * 2) * 0.1 + 1;
      portalRef.current.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <group>
      {/* Central portal */}
      <mesh ref={portalRef}>
        <torusGeometry args={[0.8, 0.2, 30, 100]} />
        <meshStandardMaterial
          color={colors.primary}
          emissive={colors.primary}
          emissiveIntensity={colors.glow}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Outer ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[1.2, 1.3, 50]} />
        <meshStandardMaterial
          color={colors.secondary}
          emissive={colors.secondary}
          emissiveIntensity={colors.glow * 0.5}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}

// Expanding Particle Network - Swarm behavior
function ExpandingParticleNetwork({ audioIntensity, colors }: { audioIntensity: number, colors: any }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const [positions] = useMemo(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    const radius = 1;
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return [positions];
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Rotate the entire swarm
      particlesRef.current.rotation.y = t * 0.2;
      particlesRef.current.rotation.z = Math.sin(t * 0.5) * 0.3;
      
      // Pulse the size based on audio
      const scale = 1 + audioIntensity * 0.2;
      particlesRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={colors.primary}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Add gradient themes for each concept
const cardGradients: { [key: string]: string } = {
  "/emergence": "from-cyan-500/[0.03] via-transparent to-transparent",
  "/swarms": "from-emerald-500/[0.03] via-transparent to-transparent",
  "/network": "from-violet-500/[0.03] via-transparent to-transparent",
  "/experience": "from-amber-500/[0.03] via-transparent to-transparent",
  "/understand": "from-blue-500/[0.03] via-transparent to-transparent",
  "/enter": "from-teal-500/[0.03] via-transparent to-transparent"
};

export function NavigationBar() {
  const { theme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [showSoonTooltip, setShowSoonTooltip] = useState(false)

  const descriptions: { [key: string]: { 
    title: string; 
    caption: string;
    nonTechnical: string[];
    technical: string[];
    visual: string;
  } } = {
    "/emergence": {
      title: "/universal-synergy",
      caption: "the next chapter in our digital journey",
      nonTechnical: [
        "witness ideas evolve and combine in unexpected ways",
        "experience a whole greater than its parts",
        "watch as patterns of thought emerge naturally"
      ],
      technical: [
        "model complex quantum dynamics on classical hardware",
        "real-time tracking of emergent machine intelligence",
        "neuromorphic architecture for unprecedented performance"
      ],
      visual: "like the swirling patterns you see, new insights emerge from the network"
    },
    "/swarms": {
      title: "/digital-democracy",
      caption: "a billion minds solving impossible problems",
      nonTechnical: [
        "harness the power of collective problem-solving",
        "dynamic groups adapt and evolve to meet any challenge",
        "inspire a generation of machines to help humanity"
      ],
      technical: [
        "novel field dynamics ensure swarm coherence",
        "ai that collaborates and shares information, without orchestration",
        "associative memory network for rapid knowledge access"
      ],
      visual: "like the interconnected clusters you see, swarms form and re-form to achieve shared goals"
    },
    "/network": {
      title: "/evolutionary-fabric",
      caption: "a living network of minds",
      nonTechnical: [
        "connect with global creators and innovators",
        "share ideas seamlessly across boundaries",
        "experience the power of collective action"
      ],
      technical: [
        "decentralized governance and consensus",
        "peer-to-peer ZK communication",
        "homomorphic encryption for privacy"
      ],
      visual: "each flowing line represents a secure connection in this global network"
    },
    "/experience": {
      title: "/merge-reality",
      caption: "where digital and physical coalesce",
      nonTechnical: [
        "immerse in collective creativity",
        "blur the lines of reality",
        "explore infinite possibility through interaction"
      ],
      technical: [
        "webgpu-accelerated real-time gaussian splatting",
        "intuitive universal interface design",
        "multi-token prediction for imperceptible latency"
      ],
      visual: "the flowing depths mirror the richness of this new experience"
    },
    "/understand": {
      title: "/truth-realized",
      caption: "the foundation to true understanding",
      nonTechnical: [
        "learn forever and build intuition",
        "unshackle your creative potential",
        "witness order emerge from chaos"
      ],
      technical: [
        "study emergent relationships between disparate fields",
        "contribute to the democratization of super intelligence",
        "research collective intelligence patterns"
      ],
      visual: "these intricate patterns reveal the underlying order of emergence"
    },
    "/enter": {
      title: "/join-us",
      caption: "your journey begins here",
      nonTechnical: [
        "step into the future of collaboration",
        "unleash your creative potential",
        "the world is ready. are you?"
      ],
      technical: [
        "create your Zero instance",
        "connect to the global Terminals network",
        "begin your journey into emergent intelligence"
      ],
      visual: "Every point of light represents a creator like you, waiting to connect"
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40">
        {/* Enhanced background blur and gradient */}
        <div className="absolute inset-0 backdrop-blur-md bg-gradient-to-b from-background/80 via-background/60 to-background/40">
          {/* Aesthetic glow gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/[0.02] to-transparent" />
        </div>
        
        {/* Subtle border */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <nav className="px-8 h-24 flex items-center justify-between relative max-w-[1920px] mx-auto">
          <div className="flex items-center space-x-12">
            <div className="flex items-center space-x-4 group">
              <Image
                src="/logo.jpg"
                alt="Terminals Logo"
                width={48}
                height={48}
                className="rounded-full transition-transform duration-300 group-hover:scale-105"
                title=""
              />
              <span 
                className="text-3xl font-mono tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 relative"
                aria-hidden="true"
                title=""
              >
                terminals
                <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </span>
            </div>
          </div>

          {/* Centered navigation items */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="hidden md:flex items-center">
              <div className="flex items-center space-x-12">
                {navItems.map((item) => (
                  <div
                    key={item.label}
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    aria-hidden="true"
                    title=""
                  >
                    <span className="text-sm font-mono transition-colors relative" title="">
                      {item.label}
                      <div className="absolute -inset-x-2 -inset-y-1 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </span>
                    {hoveredItem === item.label && (
                      <div 
                        className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-background/95 border border-primary/20 rounded-lg text-xs font-mono shadow-lg"
                        aria-hidden="true"
                        title=""
                      >
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                        <div className="absolute inset-0 rounded-lg backdrop-blur-sm" />
                        <div className="relative z-10">
                          <span className="text-primary/90 drop-shadow-sm">
                            {descriptions[item.label]?.caption || "Coming soon"}
                          </span>
                          <div className="absolute inset-0 bg-primary/10 blur-xl opacity-50" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div 
              className="relative cursor-not-allowed group"
              onMouseEnter={() => setShowSoonTooltip(true)}
              onMouseLeave={() => setShowSoonTooltip(false)}
              aria-hidden="true"
              title=""
            >
              <span className="text-sm font-mono opacity-50 relative" title="">
                /enter
                <div className="absolute -inset-x-2 -inset-y-1 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </span>
              {showSoonTooltip && (
                <div 
                  className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-background/95 border border-primary/20 rounded-lg text-xs font-mono shadow-lg"
                  aria-hidden="true"
                  title=""
                >
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                  <div className="absolute inset-0 rounded-lg backdrop-blur-sm" />
                  <div className="relative z-10">
                    <span className="text-primary/90 drop-shadow-sm">soon</span>
                    <div className="absolute inset-0 bg-primary/10 blur-xl opacity-50" />
                  </div>
                </div>
              )}
            </div>
            <AudioControls />
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Elegant Vertical Hover Cards */}
      <AnimatePresence mode="wait">
        {hoveredItem && descriptions[hoveredItem] && (
          <motion.div
            initial={{ opacity: 0, x: -40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ 
              opacity: 0,
              x: -20,
              scale: 0.95,
              filter: "blur(10px)",
              transition: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            transition={{ 
              duration: 0.3,
              ease: [0.19, 1.0, 0.22, 1.0]
            }}
            className="fixed top-24 left-8 bottom-8 z-30 w-[600px]"
          >
            <motion.div
              className={`w-full h-full rounded-2xl shadow-2xl overflow-hidden relative backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-black/[0.85] via-gray-900/[0.75] to-transparent border border-gray-800/30'
                  : 'bg-gradient-to-br from-white/[0.85] via-gray-50/[0.75] to-transparent border border-gray-200/30'
              }`}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            >
              {/* Enhanced gradient elements */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${cardGradients[hoveredItem] || cardGradients["/enter"]}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div 
                className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${
                  hoveredItem === "/emergence" ? "from-transparent via-cyan-500/40 to-transparent" :
                  hoveredItem === "/swarms" ? "from-transparent via-emerald-500/40 to-transparent" :
                  hoveredItem === "/network" ? "from-transparent via-violet-500/40 to-transparent" :
                  hoveredItem === "/experience" ? "from-transparent via-amber-500/40 to-transparent" :
                  hoveredItem === "/understand" ? "from-transparent via-blue-500/40 to-transparent" :
                  "from-transparent via-teal-500/40 to-transparent"
                }`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.4 }}
              />

              <div className="p-10 relative h-full overflow-y-auto custom-scrollbar">
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Header Section */}
                  <motion.div
                    className="mb-12"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className={`text-5xl font-mono font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${
                      theme === 'dark' 
                        ? 'from-white via-white to-white/80'
                        : 'from-gray-900 via-gray-900 to-gray-700'
                    }`}>
                      {descriptions[hoveredItem]?.title}
                    </h3>
                    <p className={`mt-4 text-2xl font-light tracking-wide ${
                      theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                    }`}>
                      {descriptions[hoveredItem]?.caption}
                    </p>
                  </motion.div>

                  {/* Content Sections - Moved before visualization */}
                  <div className="space-y-16 flex-grow">
                    {/* Non-Technical Section */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="relative z-10"
                    >
                      <h4 className={`text-xl font-mono mb-6 flex items-center gap-4 relative ${
                        theme === 'dark' ? 'text-white/90' : 'text-gray-800'
                      }`}>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-[2px]">
                          <div className="w-full h-full bg-gradient-to-r from-cyan-500/90 via-cyan-500/70 to-transparent" />
                        </div>
                        <span className="pl-20">For Creators</span>
                      </h4>
                      <div className="space-y-6 pl-16">
                        {descriptions[hoveredItem]?.nonTechnical.map((point, index) => (
                          <motion.div
                            key={index}
                            className="relative"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                          >
                            <span className="absolute -left-8 top-[12px] font-mono text-lg opacity-50">//</span>
                            <p className={`text-xl font-light leading-relaxed tracking-wide ${
                              theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                            }`}>
                              {point}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Technical Section */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      className="relative z-10"
                    >
                      <h4 className={`text-xl font-mono mb-6 flex items-center gap-4 relative ${
                        theme === 'dark' ? 'text-white/90' : 'text-gray-800'
                      }`}>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-[2px]">
                          <div className="w-full h-full bg-gradient-to-r from-fuchsia-500/90 via-fuchsia-500/70 to-transparent" />
                        </div>
                        <span className="pl-20">For Engineers</span>
                      </h4>
                      <div className="space-y-6 pl-16">
                        {descriptions[hoveredItem]?.technical.map((point, index) => (
                          <motion.div
                            key={index}
                            className="relative"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                          >
                            <span className="absolute -left-8 top-[12px] font-mono text-lg opacity-50">//</span>
                            <p className={`text-xl font-light leading-relaxed tracking-wide ${
                              theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                            }`}>
                              {point}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Concept Visualization - Moved after content */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-12 mb-8"
                  >
                    <ConceptVisualization 
                      concept={hoveredItem} 
                      theme={theme || 'dark'} 
                    />
                  </motion.div>

                  {/* Visual Connection Caption */}
                  <motion.div
                    className="mt-4 pt-8 border-t border-gray-800/20"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    <p className={`text-xl italic font-light tracking-wide ${
                      theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      {descriptions[hoveredItem]?.visual}
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(124, 58, 237, 0.3) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(124, 58, 237, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(124, 58, 237, 0.5);
        }
      `}</style>

      <style jsx>{`
        .nav-item {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          position: relative;
          cursor: pointer;
        }

        .nav-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .nav-item::after {
          content: "";
          position: absolute;
          bottom: -3px;
          left: 0;
          height: 2px;
          width: 0;
          background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.5), rgba(255,255,255,0));
          transition: width 0.3s ease-in-out;
        }

        .nav-item:hover::after {
          width: 100%;
        }
      `}</style>
    </>
  )
}
