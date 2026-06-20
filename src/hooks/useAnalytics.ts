'use client';

import { useCallback, useEffect } from 'react';
import { EventType } from '@/types/analytics';
import { useAnalytics as useAnalyticsSDK } from '@/lib/analytics';

/**
 * Hook for tracking analytics events in React components
 * Uses the analytics SDK with batch queue system
 */
export const useAnalytics = () => {
  const analytics = useAnalyticsSDK();

  useEffect(() => {
    // Flush events on page unload
    const handleBeforeUnload = () => {
      analytics.trackEvent('cart_viewed', {
        action: 'page_unload',
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [analytics]);

  const trackEvent = useCallback(
    (eventType: EventType, metadata?: Record<string, any>) => {
      analytics.trackEvent(eventType, metadata);
    },
    [analytics]
  );

  const trackQuizStarted = useCallback(
    (quizId: string, metadata?: Record<string, any>) => {
      trackEvent('quiz_started', {
        quiz_id: quizId,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackQuizCompleted = useCallback(
    (quizId: string, score: number, metadata?: Record<string, any>) => {
      trackEvent('quiz_completed', {
        quiz_id: quizId,
        score,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackResultViewed = useCallback(
    (quizId: string, resultId: string, metadata?: Record<string, any>) => {
      trackEvent('result_viewed', {
        quiz_id: quizId,
        result_id: resultId,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackProductViewed = useCallback(
    (productId: string, productTitle: string, metadata?: Record<string, any>) => {
      trackEvent('product_viewed', {
        product_id: productId,
        product_title: productTitle,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackProductAddedToCart = useCallback(
    (productId: string, price: number, metadata?: Record<string, any>) => {
      trackEvent('product_added_to_cart', {
        product_id: productId,
        price,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackCartViewed = useCallback((itemCount: number, metadata?: Record<string, any>) => {
    trackEvent('cart_viewed', {
      item_count: itemCount,
      ...metadata,
    });
  }, [trackEvent]);

  const trackCheckoutStarted = useCallback((totalPrice: number, metadata?: Record<string, any>) => {
    trackEvent('checkout_started', {
      total_price: totalPrice,
      ...metadata,
    });
  }, [trackEvent]);

  const trackOrderCreated = useCallback(
    (orderId: string, totalPrice: number, itemCount: number, metadata?: Record<string, any>) => {
      trackEvent('order_created', {
        order_id: orderId,
        total_price: totalPrice,
        item_count: itemCount,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackQuizAbandoned = useCallback(
    (quizId: string, questionsAnswered: number, metadata?: Record<string, any>) => {
      trackEvent('quiz_abandoned', {
        quiz_id: quizId,
        questions_answered: questionsAnswered,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackQuizRestarted = useCallback(
    (quizId: string, metadata?: Record<string, any>) => {
      trackEvent('quiz_restarted', {
        quiz_id: quizId,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackQuizShared = useCallback(
    (quizId: string, platform: string, metadata?: Record<string, any>) => {
      trackEvent('quiz_shared', {
        quiz_id: quizId,
        platform,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const trackAdImpression = useCallback(
    (adId: string, placement: string, metadata?: Record<string, any>) => {
      trackEvent('ad_impression', {
        ad_id: adId,
        placement,
        ...metadata,
      });
    },
    [trackEvent]
  );

  const getSessionId = useCallback(() => analytics.getSessionId(), [analytics]);

  const setMetadata = useCallback(
    (key: string, value: any) => analytics.setMetadata(key, value),
    [analytics]
  );

  return {
    trackEvent,
    trackQuizStarted,
    trackQuizCompleted,
    trackResultViewed,
    trackProductViewed,
    trackProductAddedToCart,
    trackCartViewed,
    trackCheckoutStarted,
    trackOrderCreated,
    trackQuizAbandoned,
    trackQuizRestarted,
    trackQuizShared,
    trackAdImpression,
    getSessionId,
    setMetadata,
  };
};
