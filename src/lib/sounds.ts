/**
 * Audio sound assets registry and AudioManager
 * Handles preloading and playing sound effects in the application
 */

export const SOUND_ASSETS = {
  correct: '/sounds/correct.mp3',
  incorrect: '/sounds/incorrect.mp3',
  levelUp: '/sounds/level-up.mp3',
  achievement: '/sounds/achievement.mp3',
  newBadge: '/sounds/new-badge.mp3',
} as const;

export type SoundKey = keyof typeof SOUND_ASSETS;

/**
 * AudioManager class handles sound preloading and playback
 */
export class AudioManager {
  private audioElements: Map<SoundKey, HTMLAudioElement> = new Map();
  private enabled: boolean;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  /**
   * Preload all sound assets into memory
   * Should be called once during app initialization
   */
  preloadSounds(): void {
    if (typeof window === 'undefined') return;

    Object.entries(SOUND_ASSETS).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.audioElements.set(key as SoundKey, audio);
    });
  }

  /**
   * Play a sound effect
   * @param sound - The sound key to play
   * @param volume - Volume level (0-1), defaults to 0.7
   */
  play(sound: SoundKey, volume: number = 0.7): void {
    if (!this.enabled || typeof window === 'undefined') return;

    const audio = this.audioElements.get(sound);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = Math.max(0, Math.min(1, volume));
      audio
        .play()
        .catch((error) => {
          console.debug(`Could not play sound ${sound}:`, error);
        });
    }
  }

  /**
   * Enable or disable all sounds
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
