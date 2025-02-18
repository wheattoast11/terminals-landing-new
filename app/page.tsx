"use client"

import React, { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { NavigationBar } from "@/components/navigation-bar"
import { CosmicTextOverlay } from "@/components/cosmic-text-overlay"
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import type { CanvasWrapper as CanvasWrapperType } from '@/components/canvas-wrapper'

const CanvasWrapper = dynamic<Parameters<typeof CanvasWrapperType>[0]>(() => import('@/components/canvas-wrapper').then(mod => mod.CanvasWrapper), {
  ssr: false
})

export default function Page() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={<div>Loading...</div>}>
          <CanvasWrapper mousePosition={mousePosition} />
        </Suspense>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen">
        <NavigationBar />
        {/* Cosmic Text Overlay */}
        <CosmicTextOverlay />
        <main className="container mx-auto px-4 py-8">
          {/* Main content goes here */}
        </main>

        {/* Intuition Labs text with glow effect, link, and copyright */}
        <motion.div className="fixed bottom-0 right-0 p-4 sm:p-6 flex items-center gap-2 z-20">
          <motion.a
            href="https://intuitionlabs.tech"
            className="limitless-text text-center no-underline"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ 
              scale: 1.05,
              color: ["#ffffff", "#00ffff", "#ff00ff", "#ffffff"],
              textShadow: "0 0 15px rgba(255,255,255,0.8)",
              transition: {
                color: {
                  repeat: Infinity,
                  duration: 2,
                },
                scale: {
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }
            }}
            transition={{ duration: 1.5 }}
            style={{ 
              fontSize: 'clamp(0.75rem, 2vw, 1rem)', 
              fontWeight: '100',
              textShadow: '0 0 10px rgba(255,255,255,0.5)',
              filter: 'blur(0.5px)',
              color: 'inherit',
              transform: 'scale(var(--scale-factor, 1))',
              transformOrigin: 'center'
            }}
          >
            intuition labs
          </motion.a>
          <span style={{ 
            fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)',
            opacity: 0.8,
            textShadow: '0 0 10px rgba(255,255,255,0.5)'
          }}>
            © 2025
          </span>
        </motion.div>
      </div>
    </div>
  )
}

