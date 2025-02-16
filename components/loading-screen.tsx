/*
LoadingScreen Component
Displays a full-screen loading overlay with smooth fade-in/out transitions
and theme-aware styling. It ensures that assets (including audio) load properly before the main landing page appears.
*/

"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export function LoadingScreen() {
  const { theme } = useTheme();
  const backgroundColor = theme === "dark" ? "#000000" : "#ffffff";
  const foregroundColor = theme === "dark" ? "#ffffff" : "#000000";

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 2, duration: 1 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          color: foregroundColor,
          fontFamily: "monospace",
          fontSize: "2rem"
        }}
      >
        Loading...
      </motion.div>
    </motion.div>
  );
} 