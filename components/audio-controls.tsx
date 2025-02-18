"use client"

import React, { useCallback, useRef, useEffect } from 'react'
import { Volume2, VolumeX, SkipForward, Pause, Play } from "lucide-react"
import { useAudioAnalyzer } from "./audio-analyzer"
import { Button } from "@/components/ui/button"
import * as SliderPrimitive from '@radix-ui/react-slider'

const SliderRoot = SliderPrimitive.Root
const SliderTrack = SliderPrimitive.Track
const SliderRange = SliderPrimitive.Range
const SliderThumb = SliderPrimitive.Thumb

export function AudioControls() {
  const { 
    nextTrack, 
    volume, 
    setVolume, 
    isPlaying, 
    togglePlayback
  } = useAudioAnalyzer()

  const lastVolumeRef = useRef(volume)

  const handleVolumeChange = useCallback((newValue: number[]) => {
    const value = newValue[0]
    if (value >= 0 && value <= 1) {
      setVolume(value)
      lastVolumeRef.current = value
    }
  }, [setVolume])

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
      className="flex items-center gap-1 touch-manipulation"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-0.5">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={togglePlayback}
          className="w-8 h-8 sm:w-7 sm:h-7 touch-manipulation"
        >
          {isPlaying ? <Pause size={16} className="sm:w-3.5 sm:h-3.5" /> : <Play size={16} className="sm:w-3.5 sm:h-3.5" />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={nextTrack}
          className="w-8 h-8 sm:w-7 sm:h-7 touch-manipulation"
        >
          <SkipForward size={16} className="sm:w-3.5 sm:h-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-1 w-28 sm:w-24">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleMuteToggle}
          className="w-8 h-8 sm:w-7 sm:h-7 touch-manipulation"
        >
          {volume === 0 ? <VolumeX size={16} className="sm:w-3.5 sm:h-3.5" /> : <Volume2 size={16} className="sm:w-3.5 sm:h-3.5" />}
        </Button>
        
        <div className="relative flex-1">
          <SliderRoot
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.01}
            className="relative flex items-center select-none touch-manipulation w-16 sm:w-14 h-8 sm:h-5"
            aria-label="Volume"
          >
            <SliderTrack className="relative h-1.5 sm:h-1 w-full grow overflow-hidden rounded-full bg-foreground/20">
              <SliderRange className="absolute h-full bg-foreground/40" />
            </SliderTrack>
            <SliderThumb className="block h-4 w-4 sm:h-3 sm:w-3 rounded-full border border-foreground/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
          </SliderRoot>
        </div>
      </div>
    </div>
  )
}