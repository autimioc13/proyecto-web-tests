'use client';

import React from 'react';
import { SoundProvider as InternalSoundProvider } from '@/lib/contexts/SoundContext';

export function SoundProvider({ children }: { children: React.ReactNode }) {
  return <InternalSoundProvider>{children}</InternalSoundProvider>;
}
