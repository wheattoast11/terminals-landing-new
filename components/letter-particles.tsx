/*
LetterParticles Component
Renders each letter from the word "TERMINALS" as a sprite particle using a canvas texture.
This adds a subtle tactile layer inspired by iconic physical design details.
*/

"use client"

import React, { useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LetterParticles = React.memo(function LetterParticles({ colors, numParticles = 15 }: { colors?: { text?: string }, numParticles?: number }) {
  const baseLetters = "TERMINALS";

  // Precompute a texture for each unique letter once and cache it.
  const letterTextures = useMemo(() => {
    const textures: { [key: string]: THREE.CanvasTexture } = {};
    for (const letter of baseLetters) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = colors?.text || "#ffffff";
        ctx.font = "48px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(letter, canvas.width / 2, canvas.height / 2);
      }
      textures[letter] = new THREE.CanvasTexture(canvas);
    }
    return textures;
  }, [colors?.text]);

  // Add cleanup effect to dispose textures on component unmount
  useEffect(() => {
    return () => {
      Object.values(letterTextures).forEach(texture => {
        texture.dispose();
      });
    };
  }, [letterTextures]);

  // Generate particles using the precomputed textures.
  const particles = useMemo(() => {
    const arr: Array<{ texture: THREE.CanvasTexture; position: THREE.Vector3; scale: number }> = [];
    // Create 15 particles.
    for (let i = 0; i < numParticles; i++) {
      const letter = baseLetters[i % baseLetters.length];
      arr.push({
        texture: letterTextures[letter],
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5
        ),
        scale: Math.random() * 0.05 + 0.05,
      });
    }
    return arr;
  }, [letterTextures, baseLetters, numParticles]);

  const groupRef = React.useRef<THREE.Group>(null!);
  const rotationAccumulator = React.useRef(0);
  useFrame((state, delta) => {
    rotationAccumulator.current += delta;
    if (rotationAccumulator.current >= 0.1) {
      if (groupRef.current) {
        groupRef.current.rotation.y += 0.01 * rotationAccumulator.current;
      }
      rotationAccumulator.current = 0;
    }
  });
  
  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <sprite key={i} position={[p.position.x, p.position.y, p.position.z]} scale={[p.scale, p.scale, p.scale]}>
          <spriteMaterial map={p.texture} transparent />
        </sprite>
      ))}
    </group>
  );
});

export default LetterParticles; 