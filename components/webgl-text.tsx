"use client"

import { useRef, useEffect } from "react"
import { extend, useFrame, useThree } from "@react-three/fiber"
import { Text } from "@react-three/drei"

extend({ Text })

export function WebGLText({ text, position, color, size, audioIntensity = 0 }: { text: string, position: [number, number, number], color: string, size: number, audioIntensity?: number }) {
  const textRef = useRef()
  const { camera } = useThree()

  useEffect(() => {
    if (textRef.current) {
      (textRef.current as any).sync()
    }
  }, [textRef])

  useFrame(({ clock }) => {
    if (textRef.current) {
      const t = textRef.current as any;
      t.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.05;
      t.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.05;
      t.lookAt(camera.position);

      const pulsing = 1 + (audioIntensity * 0.05) + Math.sin(clock.elapsedTime * 2) * 0.02;
      t.scale.set(pulsing, pulsing, pulsing);

      if (t.material) {
        t.material.outlineWidth = 0.015 * (1 + audioIntensity * 0.3);
        t.material.opacity = 0.98 + 0.02 * audioIntensity;
        t.material.outlineOpacity = 0.2;
      }
    }
  })

  return (
    <Text
      ref={textRef}
      position={position}
      color={color}
      fontSize={size}
      maxWidth={100}
      lineHeight={1}
      letterSpacing={0.3}
      textAlign="center"
      anchorX="center"
      anchorY="middle"
      characters="terminals"
      material-transparent={true}
      material-opacity={0.9}
      outlineWidth={0.05}
      outlineColor="#000000"
      outlineOpacity={0.2}
    >
      {text}
    </Text>
  )
}

