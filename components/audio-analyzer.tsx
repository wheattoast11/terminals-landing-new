"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode, useMemo } from "react"

const AUDIO_TRACKS = [
  '/assets/Sing It To Happen.mp3',
  '/assets/Get In The Mood.mp3',
  '/assets/A Latent Space.mp3',
  '/assets/C-Loli.mp3',
  '/assets/Ocotillo.mp3',
  '/assets/Giving You.mp3',
  '/assets/Swimmer.mp3'
]

// Create a singleton audio context
let sharedAudioContext: AudioContext | null = null;

interface AudioAnalyzerContextType {
  audioData?: Uint8Array | null
  nextTrack: () => void
  currentTrackIndex: number
  volume: number
  setVolume: (volume: number) => void
  isPlaying: boolean
  togglePlayback: () => void
  trackCount: number
  isAudioLoaded: boolean
}

const AudioAnalyzerContext = createContext<AudioAnalyzerContextType | null>(null);

const FRAME_THROTTLE = 1000 / 30; // 30fps max for audio analysis

export function AudioAnalyzerProvider({ children }: { children: ReactNode }) {
  const [audioData, setAudioData] = useState<Uint8Array | null>(null)
  const audioDataRef = useRef<Uint8Array | null>(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [volume, setVolume] = useState(0.25) // Start at 25%
  const [isPlaying, setIsPlaying] = useState(true)
  const [isAudioLoaded, setIsAudioLoaded] = useState(false)
  const lastUpdateTimeRef = useRef<number>(0)

  // Use refs to maintain references across renders
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const animationFrameRef = useRef<number>()
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const initIdRef = useRef(0)

  // Add a ref to track if the user has interacted
  const hasInteractedRef = useRef(false);

  const initializeAudioContext = useCallback(() => {
    if (!sharedAudioContext) {
      sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return sharedAudioContext;
  }, []);

  const cleanupAudio = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (error) {
        console.warn('Error stopping sourceRef:', error);
      }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }, []);

  const updateAudioData = useCallback(() => {
    if (!analyserRef.current) return;
    
    const now = performance.now();
    if (now - lastUpdateTimeRef.current < FRAME_THROTTLE) {
      animationFrameRef.current = requestAnimationFrame(updateAudioData);
      return;
    }
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Only update if there's a significant change
    if (!audioDataRef.current || hasSignificantChange(audioDataRef.current, dataArray)) {
      audioDataRef.current = dataArray;
      setAudioData(new Uint8Array(dataArray));
    }
    
    lastUpdateTimeRef.current = now;
    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  }, []);

  const hasSignificantChange = (oldData: Uint8Array, newData: Uint8Array) => {
    const step = Math.max(1, Math.floor(oldData.length / 4));
    const threshold = 10;
    let totalDiff = 0;
    
    for (let i = 0; i < oldData.length; i += step) {
      totalDiff += Math.abs(oldData[i] - newData[i]);
    }
    
    return totalDiff / (oldData.length / step) > threshold;
  };

  const initializeAudio = useCallback(async () => {
    // Increment the initialization counter and capture the local id
    const localInitId = ++initIdRef.current;
    
    // Cleanup any existing audio
    cleanupAudio();

    try {
      const audioContext = initializeAudioContext();

      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
      }

      if (!gainNodeRef.current) {
        gainNodeRef.current = audioContext.createGain();
        gainNodeRef.current.gain.value = volume;
      }

      if (!audioBufferRef.current) {
        const response = await fetch(AUDIO_TRACKS[currentTrackIndex]);
        const arrayBuffer = await response.arrayBuffer();
        audioBufferRef.current = await audioContext.decodeAudioData(arrayBuffer);
      }

      // Check if a newer initialization has started
      if (localInitId !== initIdRef.current) return;

      sourceRef.current = audioContext.createBufferSource();
      sourceRef.current.buffer = audioBufferRef.current;

      sourceRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContext.destination);
      
      // Automatically advance track when the current track ends
      sourceRef.current.onended = () => {
        cleanupAudio();
        audioBufferRef.current = null; // Clear the buffer to load the new track
        setCurrentTrackIndex((prev) => (prev + 1) % AUDIO_TRACKS.length);
      };

      sourceRef.current.start(0);
      setIsPlaying(true);
      setIsAudioLoaded(true);
      
      updateAudioData();

    } catch (err) {
      console.error("Error initializing audio:", err);
    }
  }, [currentTrackIndex, initializeAudioContext, cleanupAudio, updateAudioData]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!sourceRef.current) {
        hasInteractedRef.current = true;
        initializeAudio();
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [initializeAudio]);

  const nextTrack = useCallback(() => {
    cleanupAudio();
    audioBufferRef.current = null; // Clear the buffer to force loading the new track
    setCurrentTrackIndex((prev) => (prev + 1) % AUDIO_TRACKS.length);
  }, [cleanupAudio]);

  const setAudioVolume = useCallback((newVolume: number) => {
    if (gainNodeRef.current && sharedAudioContext) {
      gainNodeRef.current.gain.value = newVolume;
    }
    setVolume(newVolume);
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  const togglePlayback = useCallback(() => {
    if (!sharedAudioContext) return;
    
    if (sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume();
      setIsPlaying(true);
    } else if (sharedAudioContext.state === 'running') {
      sharedAudioContext.suspend();
      setIsPlaying(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    nextTrack,
    currentTrackIndex,
    volume,
    setVolume: setAudioVolume,
    isPlaying,
    togglePlayback,
    trackCount: AUDIO_TRACKS.length,
    isAudioLoaded
  }), [nextTrack, currentTrackIndex, volume, isPlaying, togglePlayback, isAudioLoaded, setAudioVolume]);

  useEffect(() => {
    if (hasInteractedRef.current) {
      initializeAudio();
    }
  }, [currentTrackIndex, initializeAudio]);

  useEffect(() => {
    return () => {
      // Cleanup audio source and animation frame
      cleanupAudio();
      
      // Disconnect analyser node
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch (e) {
          console.error('Error disconnecting analyserRef:', e);
        }
        analyserRef.current = null;
      }
      
      // Disconnect gain node
      if (gainNodeRef.current) {
        try {
          gainNodeRef.current.disconnect();
        } catch (e) {
          console.error('Error disconnecting gainNodeRef:', e);
        }
        gainNodeRef.current = null;
      }

      // Optionally close the shared AudioContext if it exists
      if (sharedAudioContext) {
        sharedAudioContext.close().catch(e => console.warn('Error closing AudioContext:', e));
        sharedAudioContext = null;
      }
    };
  }, [cleanupAudio]);

  return (
    <AudioAnalyzerContext.Provider value={contextValue}>
      {children}
    </AudioAnalyzerContext.Provider>
  );
}

export function useAudioAnalyzer() {
  const context = useContext(AudioAnalyzerContext);
  if (!context) {
    throw new Error('useAudioAnalyzer must be used within an AudioAnalyzerProvider');
  }
  return context;
}

