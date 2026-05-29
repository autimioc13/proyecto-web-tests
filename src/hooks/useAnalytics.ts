'use client';

import { useCallback } from 'react';
import { AnalyticsEvent } from '@/types';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const useAnalytics = () => {
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return '';
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }, []);

  const trackEvent = useCallback(
    async (
      eventName:
        | 'quiz_start'
        | 'quiz_question_view'
        | 'quiz_complete'
        | 'quiz_abandon'
        | 'quiz_share'
        | 'quiz_restart'
        | 'ad_impression',
      quizSlug: string,
      metadata?: Record<string, any>
    ) => {
      const sessionId = getSessionId();

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, {
          quiz_slug: quizSlug,
          session_id: sessionId,
          ...metadata,
        });
      }

      const event: AnalyticsEvent = {
        eventName: eventName as any,
        quizSlug,
        timestamp: Date.now(),
        sessionId,
        metadata,
      };

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/analytics',
          JSON.stringify(event)
        );
      } else {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
          keepalive: true,
        }).catch(() => {});
      }
    },
    [getSessionId]
  );

  return { trackEvent };
};
