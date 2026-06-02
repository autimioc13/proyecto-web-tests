# Sound System Architecture (FASE 5.5)

## Overview
The Sound System implements a centralized audio management solution using React Context and AudioManager class. It provides preloading, playback control, and user preferences persistence.

## Components

### 1. AudioManager (`src/lib/sounds.ts`)
Core class handling sound operations:

```typescript
const manager = new AudioManager(enabled: boolean);

// Preload all sounds (called automatically by SoundProvider)
manager.preloadSounds();

// Play a sound with optional volume control
manager.play('correct', 0.7);  // volume 0-1

// Toggle sound enable/disable state
manager.setEnabled(false);

// Check current state
if (manager.isEnabled()) { ... }
```

**Sound Registry (SOUND_ASSETS)**
- `correct` → `/sounds/correct.mp3`
- `incorrect` → `/sounds/incorrect.mp3`
- `levelUp` → `/sounds/level-up.mp3`
- `achievement` → `/sounds/achievement.mp3`
- `newBadge` → `/sounds/new-badge.mp3`

### 2. SoundContext (`src/lib/contexts/SoundContext.tsx`)
React Context providing sound functionality throughout the app:

```typescript
interface SoundContextType {
  audioManager: AudioManager | null;      // Manager instance
  soundEnabled: boolean;                   // Current state
  toggleSound: () => void;                 // Toggle sound on/off
  playSound: (sound: SoundKey, volume?: number) => void;  // Play a sound
}
```

**Hook Usage:**
```typescript
const { playSound, soundEnabled, toggleSound } = useSoundContext();

// Play a sound
playSound('correct', 0.8);

// Toggle sound preference
toggleSound();

// Check if enabled
if (soundEnabled) { ... }
```

### 3. SoundProvider (`src/components/providers/SoundProvider.tsx`)
Wrapper component that initializes the sound system:

- Initializes AudioManager on client side only
- Loads user preference from localStorage (`sound-enabled`)
- Preloads all sounds automatically
- Provides context to all children

### 4. Integration in layout.tsx
Root layout wraps the entire app with SoundProvider:

```tsx
<SoundProvider>
  <AnimatedGradient>
    {/* app content */}
  </AnimatedGradient>
</SoundProvider>
```

## Usage Examples

### In a Quiz Component
```typescript
'use client';

import { useSoundContext } from '@/lib/contexts/SoundContext';

export function QuizComponent() {
  const { playSound } = useSoundContext();

  const handleCorrectAnswer = () => {
    playSound('correct', 0.8);
    // ... update quiz state
  };

  const handleIncorrectAnswer = () => {
    playSound('incorrect', 0.6);
    // ... update quiz state
  };

  return (
    // component JSX
  );
}
```

### In a Settings Component
```typescript
'use client';

import { useSoundContext } from '@/lib/contexts/SoundContext';

export function SoundSettings() {
  const { soundEnabled, toggleSound } = useSoundContext();

  return (
    <button onClick={toggleSound}>
      {soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
    </button>
  );
}
```

## Storage & Persistence

The user's sound preference is automatically saved to localStorage:
- Key: `sound-enabled`
- Value: `'true'` or `'false'` string

On app reload, the saved preference is automatically restored.

## Audio Files

Placeholder files created in `/public/sounds/`:
- All files are currently empty placeholders
- Replace with actual MP3 audio files for production
- Recommended audio specs:
  - Format: MP3 (best browser compatibility)
  - Duration: 0.5-2 seconds per sound
  - Volume: Normalized to -14dB LUFS
  - Sample Rate: 44.1kHz or 48kHz

## Client-Side Only

- AudioManager and SoundProvider are initialized only on the client
- Safe to use in Server Components via the context hook
- No server-side audio processing required

## Type Safety

All sound keys are strongly typed:
```typescript
type SoundKey = 'correct' | 'incorrect' | 'levelUp' | 'achievement' | 'newBadge';
```

Attempting to play an invalid sound will result in a TypeScript error.
