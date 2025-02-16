/* cosmic-text-overlay.tsx */
"use client"

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

// Messages source
const messages = [
  "reality decoded. your senses reimagined.",
  "your mind is the architect of a digital cosmos.",
  "experience a universe built by neural connections.",
  "where consciousness meets code.",
  "transcend the digital divide.",
  "neural pathways illuminate the void."
];

// Create an array of all individual words from messages

// Define the data structure for a word
interface WordData {
  id: string;
  text: string;
  top: string; // e.g., "50%"
  left: string; // e.g., "30%"
}

interface CosmicWordProps {
  text: string;
  top: string;
  left: string;
  onComplete: () => void;
  theme: string;
}

// CosmicWord component uses CSS animation for the typewriter effect
function CosmicWord({ text, top, left, onComplete, theme }: CosmicWordProps) {
  const [randomStyle] = useState(() => {
    const fontSize = (0.8 + Math.random() * 0.2).toFixed(3) + "rem";
    const opacity = 0.7 + Math.random() * 0.2; // Narrower opacity range
    const gradientAngle = Math.floor(Math.random() * 360);
    // More cohesive gradient with softer transitions
    const gradient = `linear-gradient(${gradientAngle}deg, 
      rgba(248,250,252,0.9) 0%, 
      rgba(124,58,237,0.85) 30%,
      rgba(219,39,119,0.85) 60%,
      rgba(245,158,11,0.85) 90%,
      transparent 100%)`;
    return { fontSize, opacity, gradient };
  });
  
  const typingDuration = 0.15 * text.length;

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, (typingDuration + 2.5) * 1000);
    return () => clearTimeout(timer);
  }, [typingDuration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, filter: 'blur(2px)' }}
      animate={{ 
        opacity: randomStyle.opacity, 
        scale: 1,
        filter: 'blur(0px)',
        textShadow: [
          '0 0 15px rgba(248,250,252,0.6)',
          '0 0 20px rgba(124,58,237,0.4)',
          '0 0 15px rgba(248,250,252,0.6)'
        ]
      }}
      exit={{ opacity: 0, scale: 0.8, filter: 'blur(2px)' }}
      transition={{ 
        duration: 1.5,
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
        fontSize: randomStyle.fontSize,
        backgroundImage: randomStyle.gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontWeight: "400", // Slightly reduced weight
        letterSpacing: "0.04em", // Slightly tighter spacing
        mixBlendMode: "screen" // Helps with color blending
      }}
      className="font-mono lowercase select-none"
    >
      <span
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          overflow: "hidden",
          width: "0",
          animation: `typing ${typingDuration}s steps(${text.length}, end) forwards`,
          textShadow: "0 0 10px rgba(248,250,252,0.4)" // Softer text shadow
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

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      setWords(current => {
        if (current.length >= 3) { // Increased max active words
          return current;
        }
        const randomWord = messages[Math.floor(Math.random() * messages.length)];
        const topPos = Math.floor(Math.random() * 80 + 10) + "%"; // Avoid edges
        const leftPos = Math.floor(Math.random() * 80 + 10) + "%"; // Avoid edges
        const newWord: WordData = {
          id: Date.now().toString() + Math.random().toString(),
          text: randomWord,
          top: topPos,
          left: leftPos
        };
        return [...current, newWord];
      });
    }, 4000); // Reduced spawn interval
    return () => clearInterval(spawnInterval);
  }, []);

  // Handler to remove a word by id
  const removeWord = (id: string) => {
    setWords(current => current.filter(word => word.id !== id));
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      <AnimatePresence>
        {words.map(word => (
          <CosmicWord
            key={word.id}
            text={word.text}
            top={word.top}
            left={word.left}
            onComplete={() => removeWord(word.id)}
            theme={theme === "dark" ? "dark" : "light"}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const CosmicTextOverlay = React.memo(CosmicTextOverlayComponent); 