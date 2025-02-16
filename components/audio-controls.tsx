"use client"

import React, { useCallback, useRef, useEffect } from 'react'
import { Volume2, VolumeX, SkipForward, Pause, Play } from "lucide-react"
import { useAudioAnalyzer } from "./audio-analyzer"
import { Button } from "@/components/ui/button"
import * as SliderPrimitive from '@radix-ui/react-slider'

const SliderRoot = SliderPrimitive.Root as any;
const SliderTrack = SliderPrimitive.Track as any;
const SliderRange = SliderPrimitive.Range as any;
const SliderThumb = SliderPrimitive.Thumb as any;

export function AudioControls() {
  const { 
    nextTrack, 
    currentTrackIndex, 
    volume, 
    setVolume, 
    isPlaying, 
    togglePlayback,
    trackCount 
  } = useAudioAnalyzer()

  const lastVolumeRef = useRef(volume)
  const volumeChangeTimeoutRef = useRef<NodeJS.Timeout>()

  // UPDATED: handleVolumeChange using correct volume update
  const handleVolumeChange = useCallback((value: number[]) => {
    if (volumeChangeTimeoutRef.current) {
      clearTimeout(volumeChangeTimeoutRef.current);
    }
    // Set volume using the first value from the array
    setVolume(value[0]);
    volumeChangeTimeoutRef.current = setTimeout(() => {
      lastVolumeRef.current = value[0];
    }, 200);
  }, [setVolume]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (volumeChangeTimeoutRef.current) {
        clearTimeout(volumeChangeTimeoutRef.current)
      }
    }
  }, [])

  // Handle mute/unmute
  const handleMuteToggle = useCallback(() => {
    if (volume === 0) {
      setVolume(lastVolumeRef.current || 0.5)
    } else {
      lastVolumeRef.current = volume
      setVolume(0)
    }
  }, [volume, setVolume])

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()} 
      onTouchStart={(e) => e.stopPropagation()}
      className="flex items-center gap-1"
    >
      <div className="flex items-center gap-0.5">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={togglePlayback}
          className="w-7 h-7"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={nextTrack}
          className="w-7 h-7"
        >
          <SkipForward size={14} />
        </Button>
      </div>

      <div className="flex items-center gap-1 w-24">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleMuteToggle}
          className="w-7 h-7"
        >
          {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </Button>
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <SliderRoot
            onPointerDown={(e: any) => e.stopPropagation()}
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.01}
            className="relative flex items-center select-none touch-none w-14 h-5"
          >
            <SliderTrack className="relative h-1 w-full grow overflow-hidden rounded-full bg-foreground/20">
              <SliderRange className="absolute h-full bg-foreground/40" />
            </SliderTrack>
            <SliderThumb className="block h-3 w-3 rounded-full border border-foreground/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
          </SliderRoot>
        </div>
      </div>
    </div>
  )
}