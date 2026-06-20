'use client';

import { AnalyticsEvent, EventType } from '@/types/analytics';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const QUEUE_STORAGE_KEY = 'analytics_queue';
const SESSION_STORAGE_KEY = 'analytics_session_id';
const BATCH_INTERVAL_MS = 30000; // 30 seconds
const MAX_QUEUE_SIZE = 100;
const API_ENDPOINT = '/api/analytics/track';

interface EventQueueItem {
  event: AnalyticsEvent;
  timestamp: number;
  retry_count: number;
}

class AnalyticsSDK {
  private queue: EventQueueItem[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private sessionId: string = '';
  private isEnabled: boolean = true;

  constructor() {
    this.initializeSession();
    this.loadQueueFromStorage();
  }

  private initializeSession() {
    if (typeof window === 'undefined') return;

    // Get or create session ID
    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    this.sessionId = sessionId;
  }

  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `session_${timestamp}_${random}`;
  }

  private loadQueueFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (err) {
      console.error('[Analytics] Error loading queue from storage:', err);
    }
  }

  private saveQueueToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (err) {
      console.error('[Analytics] Error saving queue to storage:', err);
    }
  }

  private validateEvent(event: AnalyticsEvent): boolean {
    if (!event.event_type) {
      console.warn('[Analytics] Missing event_type');
      return false;
    }

    const validEventTypes: EventType[] = [
      'quiz_started',
      'quiz_completed',
      'result_viewed',
      'product_viewed',
      'order_created',
      'ad_impression',
      'quiz_abandoned',
      'quiz_restarted',
      'quiz_shared',
      'product_added_to_cart',
      'cart_viewed',
      'checkout_started',
      'level_up',
      'quiz_question_view',
    ];

    if (!validEventTypes.includes(event.event_type)) {
      console.warn('[Analytics] Invalid event_type:', event.event_type);
      return false;
    }

    if (!event.session_id) {
      console.warn('[Analytics] Missing session_id');
      return false;
    }

    return true;
  }

  private getClientInfo() {
    if (typeof window === 'undefined') {
      return { ip: '', userAgent: '' };
    }

    return {
      userAgent: navigator.userAgent,
      // IP will be captured server-side from request headers
      ip: '',
    };
  }

  public trackEvent(eventType: EventType, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    const clientInfo = this.getClientInfo();

    const event: AnalyticsEvent = {
      event_type: eventType,
      session_id: this.sessionId,
      metadata,
      user_agent: clientInfo.userAgent,
      created_at: new Date(),
      timestamp: Date.now(),
    };

    if (!this.validateEvent(event)) {
      console.warn('[Analytics] Event validation failed:', event);
      return;
    }

    // Add to queue
    this.queue.push({
      event,
      timestamp: Date.now(),
      retry_count: 0,
    });

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventType, {
        session_id: this.sessionId,
        ...metadata,
      });
    }

    // If queue is getting large, flush immediately
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      this.flush();
    } else if (!this.batchTimer) {
      // Schedule batch flush
      this.scheduleBatchFlush();
    }

    this.saveQueueToStorage();
  }

  private scheduleBatchFlush() {
    if (this.batchTimer) clearTimeout(this.batchTimer);
    this.batchTimer = setTimeout(() => {
      this.flush();
    }, BATCH_INTERVAL_MS);
  }

  public async flush() {
    if (this.queue.length === 0) {
      if (this.batchTimer) clearTimeout(this.batchTimer);
      this.batchTimer = null;
      return;
    }

    if (typeof window === 'undefined') return;

    const itemsToSend = [...this.queue];
    this.queue = [];

    try {
      // Try using sendBeacon first (most reliable for analytics)
      if (navigator.sendBeacon && itemsToSend.length === 1) {
        const success = navigator.sendBeacon(
          API_ENDPOINT,
          JSON.stringify({ events: [itemsToSend[0].event] })
        );
        if (success) {
          this.saveQueueToStorage();
          this.scheduleBatchFlush();
          return;
        }
      }

      // Fallback to fetch
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: itemsToSend.map((i) => i.event) }),
        keepalive: true,
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      this.saveQueueToStorage();
    } catch (err) {
      console.warn('[Analytics] Flush failed:', err);
      // Put items back in queue for retry
      this.queue.unshift(...itemsToSend.map((item) => ({ ...item, retry_count: item.retry_count + 1 })));

      // Remove items that have retried too many times
      this.queue = this.queue.filter((item) => item.retry_count < 3);

      this.saveQueueToStorage();
    }

    this.scheduleBatchFlush();
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public disable() {
    this.isEnabled = false;
    this.flush();
  }

  public enable() {
    this.isEnabled = true;
  }

  public setMetadata(key: string, value: any) {
    if (typeof window === 'undefined') return;
    try {
      const metadata = JSON.parse(sessionStorage.getItem('analytics_metadata') || '{}');
      metadata[key] = value;
      sessionStorage.setItem('analytics_metadata', JSON.stringify(metadata));
    } catch (err) {
      console.error('[Analytics] Error setting metadata:', err);
    }
  }

  public getMetadata(key?: string): any {
    if (typeof window === 'undefined') return null;
    try {
      const metadata = JSON.parse(sessionStorage.getItem('analytics_metadata') || '{}');
      return key ? metadata[key] : metadata;
    } catch (err) {
      console.error('[Analytics] Error getting metadata:', err);
      return null;
    }
  }
}

// Singleton instance
let analyticsInstance: AnalyticsSDK | null = null;

export function getAnalytics(): AnalyticsSDK {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsSDK();
  }
  return analyticsInstance;
}

// Hook for React components
export function useAnalytics() {
  const analytics = getAnalytics();

  return {
    trackEvent: (eventType: EventType, metadata?: Record<string, any>) => {
      analytics.trackEvent(eventType, metadata);
    },
    getSessionId: () => analytics.getSessionId(),
    setMetadata: (key: string, value: any) => analytics.setMetadata(key, value),
    getMetadata: (key?: string) => analytics.getMetadata(key),
  };
}

// Export for direct use in server-side functions
export { AnalyticsSDK, type EventQueueItem };

/**
 * Convenience helpers to track gamification-related analytics events.
 */
export const GamificationEvents = {
  quizCompleted(xpEarned: number, scorePercentage: number, quizSlug: string) {
    getAnalytics().trackEvent('quiz_completed', {
      xpEarned,
      scorePercentage,
      quizSlug,
      gamification: true,
    });
  },
  levelUp(newLevel: number, totalXP: number) {
    getAnalytics().trackEvent('level_up', {
      newLevel,
      totalXP,
      gamification: true,
    });
  },
};
