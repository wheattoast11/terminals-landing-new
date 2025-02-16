import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, Menu } from 'lucide-react';
import { SystemState } from '@/sources/types';

interface TerminalsOverlayProps {
  systemState: SystemState;
}

const TerminalsOverlay: React.FC<TerminalsOverlayProps> = ({ systemState }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showMetrics, setShowMetrics] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [overlayOpacity, setOverlayOpacity] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      // Smoother opacity transition
      setIsVisible(prev => {
        if (!prev) {
          return true;
        }
        return prev;
      });
      setMousePosition({ x: e.clientX, y: e.clientY });
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsVisible(false), 2000); // Shorter timeout
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const sections = [
    {
      id: 'emergence',
      title: '/emergence',
      description: 'the birth of decentralized intelligence',
      color: 'from-cyan-500/20 to-transparent'
    },
    {
      id: 'swarms',
      title: '/swarms',
      description: 'compose. connect. create.',
      color: 'from-fuchsia-500/20 to-transparent'
    },
    {
      id: 'network',
      title: '/network',
      description: 'join the digital (r)evolution',
      color: 'from-violet-500/20 to-transparent'
    }
  ];

  return (
    <motion.div 
      className="fixed inset-0 pointer-events-none select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }} // Slower, smoother transition
    >
      {/* Background Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/40 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: overlayOpacity }}
        transition={{ duration: 0.8, ease: "easeInOut" }} // Smoother overlay transition
      />

      {/* Metrics Panel */}
      <motion.div
        className="fixed bottom-4 right-4 pointer-events-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.button
          className="p-2 bg-white/10 backdrop-blur-sm rounded-full
                     hover:bg-white/20 transition-all duration-300
                     border border-white/20 hover:border-white/40
                     shadow-lg shadow-white/5 hover:shadow-white/10"
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowMetrics(!showMetrics)}
        >
          <Gauge className="w-6 h-6 text-white/70" />
        </motion.button>

        <AnimatePresence>
          {showMetrics && (
            <motion.div
              className="absolute bottom-full right-0 mb-2 p-4 w-48
                         bg-black/60 backdrop-blur-md rounded-lg
                         border border-white/10
                         text-sm text-white/70 space-y-2"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
            >
              <div className="flex items-center justify-between">
                <span>/entropy</span>
                <span>{systemState.entropy.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>/complexity</span>
                <span>{systemState.complexity.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>/clusters</span>
                <span>{systemState.emergentClusters}</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex items-center justify-between">
                <span>/bass</span>
                <span>{(systemState.audioData.bass * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>/mid</span>
                <span>{((systemState.audioData.midLow + systemState.audioData.midHigh) * 50).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>/treble</span>
                <span>{(systemState.audioData.treble * 100).toFixed(0)}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Section Details */}
      <AnimatePresence>
        {activeSection && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-12 pointer-events-none
                       backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setOverlayOpacity(0.6)}
            onMouseLeave={() => setOverlayOpacity(0)}
          >
            <div className={`relative p-8 rounded-lg bg-gradient-to-t ${sections.find(s => s.id === activeSection)?.color}
                            shadow-lg shadow-white/5 border border-white/10`}>
              <motion.h2 
                className="text-4xl font-light mb-2
                           bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {sections.find(s => s.id === activeSection)?.title}
              </motion.h2>
              <motion.p
                className="text-lg text-white/70"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {sections.find(s => s.id === activeSection)?.description}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Cursor Effect */}
      <motion.div
        className="fixed w-32 h-32 pointer-events-none mix-blend-difference"
        animate={{
          x: mousePosition.x - 64,
          y: mousePosition.y - 64,
          scale: activeSection || showMetrics ? 1.2 : 1
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.1
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-radial from-white/5 to-transparent" />
      </motion.div>
    </motion.div>
  );
};

export default TerminalsOverlay;