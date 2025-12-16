import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { GamePhase, AppMode } from '../types';
import { AUDIO_CONFIG } from '../gameConfig';

export const AudioController: React.FC = () => {
  const { gamePhase, isMuted, appMode } = useGameStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio Element
  useEffect(() => {
    const audio = new Audio(AUDIO_CONFIG.BGM_URL);
    audio.loop = true;
    audio.volume = AUDIO_CONFIG.BGM_VOLUME;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Handle Play/Pause based on State
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.pause();
      return;
    }

    // Determine if music should be playing
    // Play during MENU, LEVEL_SELECT, INTRO, PLAYING, LEVEL_COMPLETE
    // Basically always, unless specifically stopped.
    // For a nice effect, maybe we pause in IDLE if it's not menu? 
    // Let's play continuously for a soothing atmosphere.
    
    const shouldPlay = true; 

    if (shouldPlay) {
      // Browser autoplay policy might block this initially until interaction
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Autoplay was prevented. This is expected until user interaction.
          // We fail silently.
        });
      }
    } else {
      audio.pause();
    }
  }, [gamePhase, appMode, isMuted]);

  return null; // Logic only component
};