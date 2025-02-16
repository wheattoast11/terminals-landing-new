"use client"

import React, { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { CanvasWrapper } from "@/components/canvas-wrapper"
import { NavigationBar } from "@/components/navigation-bar"
import { Button } from "@/components/ui/button"
import { CosmicTextOverlay } from "@/components/cosmic-text-overlay"

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
        <CanvasWrapper mousePosition={mousePosition} />
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
        <motion.div className="absolute bottom-4 right-4 p-4 flex items-center gap-2">
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
              fontSize: '1rem', 
              fontWeight: '100',
              textShadow: '0 0 10px rgba(255,255,255,0.5)',
              filter: 'blur(0.5px)',
              color: 'inherit'
            }}
          >
            intuition labs
          </motion.a>
          <span style={{ 
            fontSize: '0.8rem',
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

