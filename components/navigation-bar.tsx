"use client"

import { useEffect, useState, useMemo } from "react"
import { ThemeToggle } from "./theme-toggle"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { AudioControls } from "./audio-controls"
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import React, { useRef } from "react"
import Image from "next/image"
import { TerminalsLogo } from "./terminals-logo"

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
  const groupRef = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  
  const nodes = useMemo(() => {
    const innerCount = 5;
    const outerCount = 8;
    const nodes = [];
    const connections: [number, number][] = [];
    
    // Create nodes with initial positions and motion parameters
    for (let i = 0; i < innerCount; i++) {
      nodes.push({
        ring: 'inner',
        index: i,
        x: 0, y: 0, z: 0,
        speed: 0.3 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
        verticalPhase: Math.random() * Math.PI * 2
      });
    }
    for (let i = 0; i < outerCount; i++) {
      nodes.push({
        ring: 'outer',
        index: i,
        x: 0, y: 0, z: 0,
        speed: 0.2 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        verticalPhase: Math.random() * Math.PI * 2
      });
    }
    
    // Create connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].ring === nodes[j].ring || Math.random() > 0.5) {
          connections.push([i, j]);
        }
      }
    }
    
    return { nodes, connections };
  }, []);

  useFrame((state) => {
    if (!groupRef.current || !lineRef.current) return;
    const t = state.clock.getElapsedTime();

    const positions = new Float32Array(nodes.connections.length * 6);
    
    nodes.nodes.forEach((node) => {
      const isInner = node.ring === 'inner';
      const radius = isInner ? 0.4 : 1.0;
      
      // Calculate position based on time and node parameters
      const angle = t * node.speed + node.phase;
      node.x = Math.cos(angle) * radius;
      node.y = Math.sin(t * 0.2 + node.verticalPhase) * 0.2;
      node.z = Math.sin(angle) * radius;
    });

    nodes.connections.forEach(([i, j], index) => {
      const from = nodes.nodes[i];
      const to = nodes.nodes[j];
      positions[index * 6] = from.x;
      positions[index * 6 + 1] = from.y;
      positions[index * 6 + 2] = from.z;
      positions[index * 6 + 3] = to.x;
      positions[index * 6 + 4] = to.y;
      positions[index * 6 + 5] = to.z;
    });

    lineRef.current.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    // Add gentle group rotation
    groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.2;
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
          opacity={0.3 + audioIntensity * 0.2}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      {nodes.nodes.map((node, i) => (
        <mesh key={i} position={[node.x, node.y, node.z]}>
          <sphereGeometry args={[node.ring === 'inner' ? 0.06 : 0.04, 16, 16]} />
          <meshStandardMaterial
            color={colors.primary}
            emissive={colors.primary}
            emissiveIntensity={colors.glow * (node.ring === 'inner' ? 1.2 : 0.8)}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

// Concept Visualization Component
function ConceptVisualization({ concept, theme }: { concept: string; theme: string }) {
  const baseColors = useMemo(() => ({
    primary: theme === 'dark' ? '#ffffff' : '#000000',
    secondary: theme === 'dark' ? '#ffffff' : '#000000',
    background: theme === 'dark' ? '#000000' : '#ffffff',
    particles: theme === 'dark' ? '#ffffff' : '#000000',
    text: theme === 'dark' ? '#ffffff' : '#000000',
    glow: 0.8,
    intensity: 0.7
  }), [theme]);

  const visualComponent = useMemo(() => {
    switch(concept) {
      case "/emergence":
        return <CentralSingularity audioIntensity={0.7} colors={baseColors} />;
      case "/swarms":
        return <ExpandingParticleNetwork audioIntensity={0.7} colors={baseColors} />;
      case "/network":
        return <DynamicNetworkLines audioIntensity={0.7} colors={baseColors} />;
      case "/experience":
        return <DimensionalTransform audioIntensity={0.7} colors={baseColors} />;
      case "/understand":
        return <EnhancedNetworkLines audioIntensity={0.7} colors={baseColors} />;
      default:
        return <SubtleParticles />;
    }
  }, [concept, baseColors]);

  return (
    <div className="h-full w-full relative overflow-hidden rounded-lg">
      <Canvas
        camera={{
          position: [0, 0, 2.5],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
        dpr={[1, 2]}
        linear
        flat
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <group scale={[1.2, 1.2, 1.2]}>
          {visualComponent}
        </group>
      </Canvas>
    </div>
  );
}

// DimensionalTransform Component - Shows 2D to 3D transformation
function DimensionalTransform({ audioIntensity, colors }: { audioIntensity: number, colors: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const planeRef = useRef<THREE.Mesh>(null);
  const [morphProgress, setMorphProgress] = useState(0);

  // Create grid texture
  const gridTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Fill background
    ctx.fillStyle = 'rgba(150, 237, 255, 0.26)';
    ctx.fillRect(0, 0, size, size);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.64)';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1 + audioIntensity * 0.4;
    
    const step = size / 10;
    for (let i = 0; i <= size; i += step) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [colors.primary, audioIntensity]);

  useFrame((state) => {
    if (meshRef.current && planeRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Smooth oscillation between 2D and 3D states
      const newProgress = (Math.sin(t * 0.3) + 1) / 2;
      setMorphProgress(newProgress);
      
      // Rotate the 3D object smoothly
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.y = t * 0.3;
      
      // Scale based on morph progress to create transition effect
      meshRef.current.scale.setScalar(0.6 + (1 - newProgress) * 0.4);
      planeRef.current.scale.setScalar(0.6 + newProgress * 0.4);
      
      // Fade opacity based on morph progress
      if (meshRef.current.material instanceof THREE.Material) {
        meshRef.current.material.opacity = 0.1 + (1 - newProgress) * 0.8;
      }
      if (planeRef.current.material instanceof THREE.Material) {
        planeRef.current.material.opacity = 0.1 + newProgress * 0.8;
      }
      
      // Add subtle wobble to plane
      planeRef.current.position.y = Math.sin(t * 2) * 0.01;
    }
  });

  // Cleanup texture on unmount
  useEffect(() => {
    return () => {
      gridTexture.dispose();
    };
  }, [gridTexture]);

  return (
    <group position={[0, 0, 0]} scale={[0.8, 0.8, 0.8]}>
      {/* 3D Object */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial
          color={colors.primary + audioIntensity * 0.2}
          metalness={0.2}
          roughness={0.1}
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
      
      {/* 2D Plane */}
      <mesh ref={planeRef} rotation={[0, 0, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial
          color={colors.primary}
          metalness={0.3}
          roughness={0.2}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          map={gridTexture}
        />
      </mesh>
    </group>
  );
}

// Central Singularity Component - Rotating portal effect
function CentralSingularity({ audioIntensity, colors }: { audioIntensity: number, colors: any }) {
  const portalRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Create particles for the portal effect
  const [particles] = useState(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    const radius = 0.6;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radiusVariation = radius + (Math.random() - 0.5) * 0.2;
      positions[i * 3] = Math.cos(angle) * radiusVariation;
      positions[i * 3 + 1] = Math.sin(angle) * radiusVariation;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    
    return positions;
  });

  useFrame((state) => {
    if (portalRef.current && ringRef.current && particlesRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Rotate portal more slowly
      portalRef.current.rotation.z = t * 0.3;
      
      // Counter-rotate ring
      ringRef.current.rotation.z = -t * 0.2;
      
      // Gentle pulse effect
      const pulse = Math.sin(t * 1.5) * 0.05 + 1;
      portalRef.current.scale.set(pulse, pulse, 1);
      
      // Rotate particles
      particlesRef.current.rotation.z = t * 0.1;
      
      // Scale effect based on audio
      const scale = 1 + audioIntensity * 0.1;
      particlesRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group scale={[0.8, 0.8, 0.8]}>
      {/* Particle system */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color={colors.primary}
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      
      {/* Central portal - smaller and more defined */}
      <mesh ref={portalRef}>
        <torusGeometry args={[0.6, 0.15, 30, 100]} />
        <meshStandardMaterial
          color={colors.primary}
          emissive={colors.primary}
          emissiveIntensity={colors.glow * 0.8}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Outer ring - more subtle */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.9, 0.95, 50]} />
        <meshStandardMaterial
          color={colors.secondary}
          emissive={colors.secondary}
          emissiveIntensity={colors.glow * 0.3}
          transparent
          opacity={0.3}
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
        size={0.03}
        color={colors.primary}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Update the cardGradients with more transparent values
const cardGradients: { [key: string]: string } = {
  "/emergence": "from-cyan-950/[0.02] via-transparent to-transparent",
  "/swarms": "from-slate-900/[0.02] via-transparent to-transparent",
  "/network": "from-blue-950/[0.02] via-transparent to-transparent",
  "/experience": "from-gray-900/[0.02] via-transparent to-transparent",
  "/understand": "from-slate-950/[0.02] via-transparent to-transparent",
  "/enter": "from-blue-900/[0.02] via-transparent to-transparent"
};

export function NavigationBar() {
  const { theme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [showSoonTooltip, setShowSoonTooltip] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false)
    }
  }, [isMobile])

  // Handle mobile menu item click
  const handleMobileItemClick = (item: string) => {
    if (isMobile) {
      setHoveredItem(item)
      setIsMobileMenuOpen(false)
    }
  }

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
        "experience AI that evolves through physical and digital interaction",
        "witness the emergence of truly adaptive intelligence",
        "be part of an ecosystem that bridges human and machine understanding"
      ],
      technical: [
        "adaptive agent meshes with real-time state coherence tracking",
        "hyperbolic manifold coordination for emergent intelligence",
        "vector-enabled state persistence with HNSW similarity search"
      ],
      visual: "// like these swirling patterns, new insights naturally emerge from the network"
    },
    "/swarms": {
      title: "/digital-democracy",
      caption: "a billion minds solving impossible problems",
      nonTechnical: [
        "collaborate with AI teams across physical and digital domains",
        "witness real-time problem-solving at universal scale",
        "shape the future of embodied intelligence"
      ],
      technical: [
        "decentralized multi-agent systems with adaptive optimization",
        "real-time performance monitoring with coherence metrics",
        "dynamic resource allocation with elastic scaling"
      ],
      visual: "// like these interconnected clusters, swarms coalesce to achieve shared goals"
    },
    "/network": {
      title: "/evolutionary-fabric",
      caption: "a living network of minds and machines",
      nonTechnical: [
        "experience seamless collaboration across all realities",
        "interact with a global network of human and machine intelligence",
        "build in an environment that adapts to any challenge"
      ],
      technical: [
        "in-memory MCP server with SSE transport",
        "wasm vector databases with real-time state synchronization",
        "adaptive consensus protocols for network stability"
      ],
      visual: "// each flowing line represents a secure connection in this global network"
    },
    "/experience": {
      title: "/merge-realities",
      caption: "where digital and physical worlds unite",
      nonTechnical: [
        "transform memories and spaces into immersive 3D experiences",
        "bridge physical and digital realities through AI-powered perception",
        "participate in hybrid experiences that transcend traditional boundaries"
      ],
      technical: [
        "generalist world agent integration with multimodal perception",
        "real-time 3D scene reconstruction from video and sensor data",
        "hybrid IRL/URL event orchestration with VR/AR capabilities"
      ],
      visual: "// watch as the boundaries between real and digital dissolve into seamless experience"
    },
    "/understand": {
      title: "/truth-realized",
      caption: "perception meets possibility",
      nonTechnical: [
        "witness AI agents learn and adapt through real-world interaction",
        "explore complex systems through immersive simulation",
        "shape the future of human-AI experiential learning"
      ],
      technical: [
        "experiential learning framework with real-time feedback loops",
        "multi-agent simulation environment for robotic training",
        "advanced perception system with cross-modal understanding"
      ],
      visual: "// every human and machine interaction resonates with continuous layers of meaning"
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
        "create your eternal `zero` instance",
        "connect to the global `terminals` network",
        "begin your journey into emergent intelligence"
      ],
      visual: "// every point of light represents a creator like you, waiting to connect"
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

        <nav className="px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between relative max-w-screen-2xl mx-auto">
          <div className="flex items-center space-x-6 sm:space-x-8 lg:space-x-12">
            <TerminalsLogo />
          </div>

          {/* Desktop Navigation */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
            <div className="flex items-center space-x-6 lg:space-x-12">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  aria-hidden="true"
                >
                  <span className={`text-sm sm:text-base font-mono transition-colors relative ${
                    hoveredItem === item.label ? 'text-primary' : ''
                  }`}>
                    {item.label}
                    <div className={`absolute -inset-x-2 -inset-y-1 bg-primary/5 rounded-lg transition-all duration-300 ${
                      hoveredItem === item.label 
                        ? 'opacity-100 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' 
                        : 'opacity-0'
                    }`} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div 
              className="relative cursor-not-allowed group hidden sm:block"
              onMouseEnter={() => setShowSoonTooltip(true)}
              onMouseLeave={() => setShowSoonTooltip(false)}
            >
              <span className="text-sm sm:text-base font-mono opacity-50">/enter</span>
              {showSoonTooltip && (
                <div 
                  className="absolute -top+40 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-background/95 border border-primary/20 rounded-lg text-xs font-mono shadow-lg"
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
            <div className="hidden md:flex items-center space-x-4">
              <AudioControls />
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* Mobile Menu Button - Moved to left */}
        <button
          className="md:hidden absolute left-4 z-50 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span className={`w-full h-0.5 bg-primary transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-full h-0.5 bg-primary transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-full h-0.5 bg-primary transform transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </header>

      {/* Elegant Vertical Hover Cards */}
      <AnimatePresence mode="wait">
        {hoveredItem && descriptions[hoveredItem] && (
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -20, y: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ 
              opacity: 0,
              x: isMobile ? 0 : -10,
              y: isMobile ? 10 : 0,
              transition: {
                duration: 0.2,
                ease: "easeOut"
              }
            }}
            transition={{ 
              duration: 0.2,
              ease: "easeOut"
            }}
            className={`fixed z-30 ${
              isMobile
                ? 'inset-4 top-20'
                : 'top-24 left-8 bottom-8 w-[500px]'
            } pointer-events-auto`}
          >
            <motion.div
              className={`${
                isMobile ? 'w-full' : 'w-[1000px]'
              } h-full rounded-2xl shadow-2xl overflow-hidden relative backdrop-blur-xl ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-black/[0.65] via-gray-950/[0.55] to-black/[0.65] border border-gray-800/20'
                  : 'bg-gradient-to-br from-white/[0.75] via-gray-50/[0.65] to-white/[0.75] border border-gray-200/30'
              }`}
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {/* Enhanced gradient elements with more subtle colors */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${cardGradients[hoveredItem] || cardGradients["/enter"]}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div 
                className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${
                  hoveredItem === "/emergence" ? "from-transparent via-cyan-800/40 to-transparent" :
                  hoveredItem === "/swarms" ? "from-transparent via-slate-700/40 to-transparent" :
                  hoveredItem === "/network" ? "from-transparent via-blue-800/40 to-transparent" :
                  hoveredItem === "/experience" ? "from-transparent via-gray-700/40 to-transparent" :
                  hoveredItem === "/understand" ? "from-transparent via-slate-800/40 to-transparent" :
                  "from-transparent via-blue-900/40 to-transparent"
                }`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.4 }}
              />

              <div className={`${isMobile ? 'flex-col' : 'flex'} h-full overflow-auto relative z-10`}>
                <div className={`${isMobile ? 'w-full' : 'w-[450px]'} p-8 sm:p-12 relative`}>
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Add subtle backdrop blur to content sections */}
                    <div className="absolute inset-0 backdrop-blur-md bg-black/10" />
                    
                    <motion.div
                      className="mb-8 relative"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <h3 className={`text-4xl sm:text-5xl font-mono font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${
                        theme === 'dark' 
                          ? 'from-white/95 via-white/90 to-white/80'
                          : 'from-gray-900 via-gray-900 to-gray-700'
                      }`}>
                        {descriptions[hoveredItem]?.title}
                      </h3>
                      <p className={`mt-4 text-base sm:text-xl font-light tracking-wide ${
                        theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                      }`}>
                        {descriptions[hoveredItem]?.caption}
                      </p>
                    </motion.div>

                    <div className="space-y-10 relative">
                      {/* Content sections with improved contrast */}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="relative z-10"
                      >
                        <div className="absolute inset-0 backdrop-blur-sm bg-black/5 rounded-lg" />
                        <h4 className={`relative text-xl font-mono mb-5 flex items-center gap-4 ${
                          theme === 'dark' ? 'text-white/95' : 'text-gray-800'
                        }`}>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-[2px]">
                            <div className="w-full h-full bg-gradient-to-r from-cyan-500/90 via-cyan-500/70 to-transparent" />
                          </div>
                          <span className="pl-20">For Creators</span>
                        </h4>
                        <div className="space-y-4 pl-16 relative">
                          {descriptions[hoveredItem]?.nonTechnical.map((point, index) => (
                            <motion.div
                              key={index}
                              className="relative"
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                            >
                              <span className="absolute -left-8 top-[10px] font-mono text-sm opacity-50">//</span>
                              <p className={`text-l leading-relaxed tracking-wide ${
                                theme === 'dark' ? 'text-white/90' : 'text-gray-700'
                              }`}>
                                {point}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Engineers section with similar styling */}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className="relative z-10"
                      >
                        <div className="absolute inset-0 backdrop-blur-sm bg-black/5 rounded-lg" />
                        <h4 className={`relative text-xl font-mono mb-5 flex items-center gap-4 ${
                          theme === 'dark' ? 'text-white/95' : 'text-gray-800'
                        }`}>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-[2px]">
                            <div className="w-full h-full bg-gradient-to-r from-fuchsia-500/90 via-fuchsia-500/70 to-transparent" />
                          </div>
                          <span className="pl-20">For Engineers</span>
                        </h4>
                        <div className="space-y-4 pl-16 relative">
                          {descriptions[hoveredItem]?.technical.map((point, index) => (
                            <motion.div
                              key={index}
                              className="relative"
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.6 + index * 0.1 }}
                            >
                              <span className="absolute -left-8 top-[10px] font-mono text-sm opacity-50">//</span>
                              <p className={`text-l leading-relaxed tracking-wide ${
                                theme === 'dark' ? 'text-white/90' : 'text-gray-700'
                              }`}>
                                {point}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                <div className={`${isMobile ? 'w-full h-[350px]' : 'flex-1'} p-6 sm:p-8 relative flex flex-col`}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 relative"
                  >
                    <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-br from-background/10 via-transparent to-background/10" />
                    <div className="relative z-5 h-full">
                      <ConceptVisualization 
                        concept={hoveredItem} 
                        theme={theme || 'dark'} 
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    className="mt-4 px-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    <p className={`text-xl italic font-light tracking-wide text-center ${
                      theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                    }`}>
                      {descriptions[hoveredItem]?.visual}
                    </p>
                  </motion.div>
                </div>
              </div>

              {isMobile && (
                <button
                  className="absolute top-4 right-4 p-2 rounded-full bg-primary/10 text-primary"
                  onClick={() => setHoveredItem(null)}
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 md:hidden overflow-hidden"
          >
            <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />
            <nav className="relative h-full pt-20">
              <div className="h-full overflow-y-auto pb-safe">
                <div className="flex flex-col space-y-4 px-4 min-h-full">
                  <div className="flex-1 space-y-2">
                    {navItems.map((item) => (
                      <motion.button
                        key={item.label}
                        className={`w-full text-left p-4 rounded-lg font-mono text-lg ${
                          hoveredItem === item.label 
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-primary/5'
                        }`}
                        onClick={() => handleMobileItemClick(item.label)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.button>
                    ))}
                    <motion.button
                      className="w-full text-left p-4 rounded-lg font-mono text-lg opacity-50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 0.5, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      /enter
                      <span className="ml-2 text-sm">(soon)</span>
                    </motion.button>
                  </div>

                  <motion.div
                    className="pt-6 border-t border-primary/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className="flex flex-col space-y-6 pb-8">
                      <div className="px-4">
                        <h3 className="text-sm font-mono text-primary/60 mb-3">Audio Controls</h3>
                        <div className="bg-primary/5 rounded-lg p-4">
                          <AudioControls />
                        </div>
                      </div>

                      <div className="px-4">
                        <h3 className="text-sm font-mono text-primary/60 mb-3">Theme</h3>
                        <div className="bg-primary/5 rounded-lg p-4 flex items-center justify-between">
                          <span className="font-mono text-sm">
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                          </span>
                          <ThemeToggle />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </nav>
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
