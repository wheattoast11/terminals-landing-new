import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';

interface TimeContextProps {
  time: number;
}

const TimeContext = createContext<TimeContextProps>({ time: 0 });

export const TimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [time, setTime] = useState(0);
  const lastTime = useRef(0);

  useFrame((state) => {
      // Throttle the updates to avoid unnecessary re-renders
      const now = performance.now();
      if (now - lastTime.current > 16) { // Roughly 60fps
          setTime(state.clock.getElapsedTime());
          lastTime.current = now;
      }
  });

  return (
    <TimeContext.Provider value={{ time }}>
      {children}
    </TimeContext.Provider>
  );
};

export const useTime = () => useContext(TimeContext); 