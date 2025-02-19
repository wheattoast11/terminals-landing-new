/* cosmic-text-overlay.tsx */
"use client"

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

// Ethereal messages with philosophical undertones
const messages = [
  "consciousness encoded",
  "neural pathways illuminate",
  "digital echoes resonate",
  "quantum thoughts emerge",
  "signals in the void",
  "patterns in chaos",
  "ethereal connections",
  "digital realms",
  "neural resonance",
  "quantum fields",
  "illuminating paths",
  "runic universes",
  "symphony of data"
];

// Create an array of all individual words from messages

// Define the data structure for a word
interface WordData {
  id: string;
  text: string;
  top: string;
  left: string;
  radius: number;
  angle: number;
}

interface CosmicWordProps {
  text: string;
  top: string;
  left: string;
  onComplete: () => void;
  theme: string;
}

// Define corner zones for text placement
const CORNER_ZONES = [
  { x: 0.15, y: 0.15 },    // Top-left
  { x: 0.85, y: 0.15 },    // Top-right
  { x: 0.15, y: 0.85 },    // Bottom-left
  { x: 0.85, y: 0.85 }     // Bottom-right
];

// CosmicWord component uses CSS animation for the typewriter effect
function CosmicWord({ text, top, left, onComplete, theme }: CosmicWordProps) {
  const [randomStyle] = useState(() => {
    const fontSize = `clamp(0.9rem, ${(0.8 + Math.random() * 0.2).toFixed(3)}rem, 1.3rem)`;
    const opacity = 0.6 + Math.random() * 0.1; // Very high opacity
    
    // Simpler, more readable color schemes
    const colorSchemes = [
      // White with slight blue tint
      {
        start: 'rgba(255, 255, 255, 0.98)',
        middle: 'rgba(220, 240, 255, 0.9)',
        end: 'rgba(175, 216, 250, 0.65)'
      },
      // Pure white to soft white
      {
        start: 'rgba(255, 255, 255, 0.85)',
        middle: 'rgba(250, 250, 255, 0.78)',
        end: 'rgba(245, 245, 255, 0.55)'
      },
      // Soft cyan
      {
        start: 'rgba(255, 255, 255, 0.98)',
        middle: 'rgba(235, 255, 255, 0.95)',
        end: 'rgba(172, 252, 252, 0.69)'
      }
    ];
    
    const scheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    const gradient = `linear-gradient(${Math.random() * 360}deg, 
      ${scheme.start},
      ${scheme.middle},
      ${scheme.end})`;
    
    return { fontSize, opacity, gradient };
  });
  
  const typingDuration = Math.min(0.8 * text.length, 4); // Faster typing
  const fadeOutDelay = typingDuration + 3;
  const totalDuration = fadeOutDelay + 1.5;

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, totalDuration * 1000);
    return () => clearTimeout(timer);
  }, [totalDuration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(2px)' }}
      animate={{ 
        opacity: randomStyle.opacity, 
        filter: 'blur(0.5px)',
        textShadow: [
          '0 0 1px rgba(255,255,255,1)',
          '0 0 2px rgba(255,255,255,0.95)',
          '0 0 1px rgba(255,255,255,1)'
        ]
      }}
      exit={{ opacity: 0, filter: 'blur(2px)' }}
      transition={{ 
        duration: 1.5,
        ease: "easeInOut",
        textShadow: {
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }
      }}
      style={{
        position: "absolute",
        top,
        left,
        transform: 'translate(-50%, -50%)',
        fontSize: randomStyle.fontSize,
        fontWeight: "400", // Slightly reduced weight for clarity
        letterSpacing: "0.08em", // Reduced for better readability
        color: "#ffffff",
        backgroundImage: randomStyle.gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        mixBlendMode: "screen", // Changed to normal for clearer text
        pointerEvents: "none",
        userSelect: "none",
        whiteSpace: "nowrap",
        zIndex: 30,
        textTransform: "lowercase",
        fontFamily: "var(--font-space-grotesk)",
        filter: "brightness(0.9) contrast(1)", // Slightly enhance contrast
      }}
    >
      <span
        style={{
          display: "inline-block",
          overflow: "hidden",
          width: "0",
          animation: `typing ${typingDuration}s steps(${text.length}, end) forwards, fadeOut 1.5s ${fadeOutDelay}s forwards`,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "optimizeLegibility",
          textShadow: "0 0 1px rgba(255,255,255,0.4)",
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

// Wrap CosmicTextOverlay with React.memo to avoid unnecessary re-renders
const CosmicTextOverlayComponent = () => {
  const { theme } = useTheme();
  const [words, setWords] = useState<WordData[]>([]);
  const maxWords = window?.innerWidth < 768 ? 2 : 3;

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      setWords(current => {
        if (current.length >= maxWords) {
          return current;
        }

        // Select a random corner zone
        const zone = CORNER_ZONES[Math.floor(Math.random() * CORNER_ZONES.length)];
        
        // Add some randomness to the position within the corner zone
        const xOffset = (Math.random() - 0.5) * 0.2; // Increased variation
        const yOffset = (Math.random() - 0.5) * 0.2;
        
        const x = (zone.x + xOffset) * window.innerWidth;
        const y = (zone.y + yOffset) * window.innerHeight;

        // Convert to percentage
        const topPos = (y / window.innerHeight) * 100 + "%";
        const leftPos = (x / window.innerWidth) * 100 + "%";

        const newWord: WordData = {
          id: Date.now().toString() + Math.random().toString(),
          text: messages[Math.floor(Math.random() * messages.length)],
          top: topPos,
          left: leftPos,
          radius: Math.sqrt(x * x + y * y),
          angle: Math.atan2(y, x)
        };
        return [...current, newWord];
      });
    }, window?.innerWidth < 768 ? 4000 : 3000);

    return () => clearInterval(spawnInterval);
  }, [maxWords]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-20">
      <style jsx global>{`
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes fadeOut {
          0% { opacity: 1 }
          100% { opacity: 0 }
        }
      `}</style>
      <AnimatePresence>
        {words.map(word => (
          <CosmicWord
            key={word.id}
            text={word.text}
            top={word.top}
            left={word.left}
            onComplete={() => setWords(current => current.filter(w => w.id !== word.id))}
            theme={theme === "dark" ? "dark" : "light"}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const CosmicTextOverlay = React.memo(CosmicTextOverlayComponent); 