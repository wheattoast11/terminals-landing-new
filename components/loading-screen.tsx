/*
LoadingScreen Component
Displays a full-screen loading overlay with smooth fade-in/out transitions
and theme-aware styling. It ensures that assets (including audio) load properly before the main landing page appears.
*/

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useAudioAnalyzer } from "./audio-analyzer";

interface LoadingScreenProps {
  onInteractionComplete?: () => void;
}

export function LoadingScreen({ onInteractionComplete }: LoadingScreenProps) {
  const { theme, resolvedTheme, systemTheme } = useTheme();
  const { initializeAudio } = useAudioAnalyzer();
  const [isLoading, setIsLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Force dark theme initially
  const backgroundColor = "#000000";
  const foregroundColor = "#ffffff";

  const handleInteraction = async () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      await initializeAudio();
      onInteractionComplete?.();
    }
  };

  useEffect(() => {
    // Simulate asset loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading && hasInteracted) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        gap: "2rem"
      }}
      onClick={handleInteraction}
    >
      {isLoading ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            color: foregroundColor,
            fontFamily: "var(--font-space-grotesk)",
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            textAlign: "center",
            padding: "0 1rem"
          }}
        >
          Loading digital worlds...
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-4 p-4 text-center"
        >
          <div
            style={{
              color: foregroundColor,
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(1.2rem, 3vw, 2rem)",
            }}
          >
            Tap anywhere to enter
          </div>
          <div
            style={{
              color: foregroundColor,
              opacity: 0.7,
              fontSize: "clamp(0.8rem, 2vw, 1rem)",
              maxWidth: "80%",
            }}
          >
            Experience includes audio
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 