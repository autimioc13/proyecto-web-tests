'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AudioManager, SoundKey } from '@/lib/sounds';

interface SoundContextType {
  audioManager: AudioManager | null;
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (sound: SoundKey, volume?: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function useSoundContext() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundContext must be used within a SoundProvider');
  }
  return context;
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [audioManager, setAudioManager] = useState<AudioManager | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize AudioManager on client side
  useEffect(() => {
    const manager = new AudioManager(true);
    manager.preloadSounds();
    setAudioManager(manager);

    // Load preference from localStorage
    const savedPreference = localStorage.getItem('sound-enabled');
    const isEnabled = savedPreference === null ? true : savedPreference === 'true';
    setSoundEnabled(isEnabled);
    manager.setEnabled(isEnabled);
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const newState = !prev;
      localStorage.setItem('sound-enabled', String(newState));
      if (audioManager) {
        audioManager.setEnabled(newState);
      }
      return newState;
    });
  };

  const playSound = (sound: SoundKey, volume?: number) => {
    if (audioManager && soundEnabled) {
      audioManager.play(sound, volume);
    }
  };

  return (
    <SoundContext.Provider
      value={{
        audioManager,
        soundEnabled,
        toggleSound,
        playSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}
