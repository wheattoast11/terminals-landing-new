"use client"

import React from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

export function TerminalsLogo() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <motion.div 
      className="relative flex items-center gap-2 group cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Quantum plasma field with fluid light dynamics */}
      <motion.div
        className="relative w-12 h-8"
        initial={{ opacity: 0.6 }}
        animate={{
          opacity: [0.6, 0.85, 0.6],
          scale: [1, 1.08, 0.97, 1],
          rotate: [0, 8, -8, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Plasma base with light reflections */}
        <div className={`absolute inset-0 rounded-[45%] blur-md bg-gradient-to-br ${
          isDark 
            ? "from-cyan-950/30 via-violet-950/20 to-blue-950/30" 
            : "from-cyan-900/30 via-violet-900/20 to-blue-900/30"
        }`}>
          <motion.div 
            className="w-full h-full"
            animate={{
              borderRadius: ['45%', '65%', '35%', '60%', '45%'],
              scaleX: [1, 1.2, 0.9, 1.1, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        {/* Cyan light waves */}
        <motion.div 
          className="absolute inset-[-2px] rounded-[40%] bg-gradient-to-r from-cyan-200/10 via-cyan-100/20 to-cyan-200/10 backdrop-blur-[2px]"
          animate={{
            borderRadius: ['40%', '60%', '35%', '55%', '40%'],
            scaleX: [1.1, 0.9, 1.2, 0.95, 1.1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 15, -15, 10, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        {/* Dynamic plasma core with light interactions */}
        <motion.div 
          className={`absolute inset-0 rounded-[38%] ${
            isDark
              ? "bg-gradient-to-br from-cyan-900/20 via-violet-950/30 to-blue-900/20"
              : "bg-gradient-to-br from-cyan-800/20 via-violet-900/30 to-blue-800/20"
          } opacity-40 group-hover:opacity-70 transition-all duration-1000`}
          animate={{
            borderRadius: ['38%', '62%', '40%', '58%', '38%'],
            scaleX: [1, 1.15, 0.95, 1.1, 1],
            rotate: [0, -10, 10, -5, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/70 to-transparent mix-blend-multiply" />
        </motion.div>
        
        {/* Off-white fluid reflections */}
        <motion.div 
          className="absolute inset-0 rounded-[42%] bg-gradient-to-br from-white/15 via-slate-50/10 to-white/5 mix-blend-soft-light"
          animate={{
            borderRadius: ['42%', '58%', '38%', '62%', '42%'],
            scaleX: [1.05, 0.95, 1.15, 0.9, 1.05],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Pulsing light glow effects */}
        <motion.div
          className="absolute inset-[-4px] rounded-full blur-xl"
          animate={{
            background: [
              'radial-gradient(circle, rgba(103,232,249,0.15) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(103,232,249,0.1) 50%, transparent 100%)',
              'radial-gradient(circle, rgba(103,232,249,0.15) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
            ],
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Fluid light streaks */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          animate={{
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <motion.div
            className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent blur-sm"
            animate={{
              y: ['-200%', '400%'],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 2
            }}
          />
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.span
        className={`text-2xl font-mono tracking-wider ${
          isDark
            ? "text-white/90"
            : "text-black/90"
        }`}
        initial={{ opacity: 0.9 }}
        animate={{
          opacity: [0.9, 1, 0.9],
          textShadow: isDark
            ? [
                "0 0 8px rgba(255,255,255,0.3)",
                "0 0 12px rgba(255,255,255,0.4)",
                "0 0 8px rgba(255,255,255,0.3)"
              ]
            : [
                "0 0 8px rgba(0,0,0,0.2)",
                "0 0 12px rgba(0,0,0,0.3)",
                "0 0 8px rgba(0,0,0,0.2)"
              ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        terminals
      </motion.span>

      {/* Hover effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={`absolute inset-0 blur-xl ${
          isDark
            ? "bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20"
            : "bg-gradient-to-r from-cyan-600/20 via-purple-600/20 to-blue-600/20"
        }`} />
      </div>
    </motion.div>
  )
} 