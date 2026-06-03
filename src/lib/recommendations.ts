// src/lib/recommendations.ts

import { Product, ProductRecommendation, RecommendationCondition } from '@/types/products';
import { PRODUCTS } from './products';

/**
 * Recommendation configuration
 * Maps products to conditions that trigger their recommendation
 */
export const RECOMMENDATION_CONFIG: ProductRecommendation[] = [
  // Logic course - high logic scores
  {
    productId: 'logic-advanced-course',
    conditions: [
      {
        testSilo: 'lógica',
        minScore: 80,
      },
    ],
    reason: 'You excelled in logic! Master advanced techniques with our course.',
    priority: 10,
  },

  // Intelligence course - moderate intelligence scores
  {
    productId: 'intelligence-fundamentals-course',
    conditions: [
      {
        testSilo: 'inteligencia',
        minScore: 70,
        maxScore: 85,
      },
    ],
    reason: 'Build on your intelligence foundations with structured training.',
    priority: 9,
  },

  // Personality report - personality test takers
  {
    productId: 'personality-deep-dive',
    conditions: [
      {
        testSilo: 'personalidad',
        minScore: 60,
      },
    ],
    reason: 'Discover deeper insights about your personality type.',
    priority: 8,
  },

  // Productivity course - general high performers
  {
    productId: 'productivity-mastery',
    conditions: [
      {
        testSilo: 'productividad',
        minScore: 70,
      },
    ],
    reason: 'Optimize your productivity with proven systems.',
    priority: 8,
  },

  // Premium certificate - high achievers
  {
    productId: 'premium-certificate',
    conditions: [
      {
        minScore: 90,
      },
    ],
    reason: 'Celebrate your exceptional score with a premium certificate.',
    priority: 7,
  },

  // Basic certificate - passing students
  {
    productId: 'basic-certificate',
    conditions: [
      {
        minScore: 60,
      },
    ],
    reason: 'Get an official certificate for your achievement.',
    priority: 6,
  },

  // Master bundle - very high performers
  {
    productId: 'knowledge-master-bundle',
    conditions: [
      {
        minScore: 85,
        minCompletedTests: 5,
      },
    ],
    reason: 'You\'re a serious learner. Get everything at a discount.',
    priority: 9,
  },

  // Serious learner bundle - high performers
  {
    productId: 'serious-learner-bundle',
    conditions: [
      {
        minScore: 75,
        minCompletedTests: 3,
      },
    ],
    reason: 'Accelerate your growth with curated courses.',
    priority: 8,
  },
];

/**
 * User context needed for recommendations
 */
export interface UserContext {
  userId?: string;
  totalCompletedTests: number;
  totalXP: number;
  purchasedProductIds: string[];
  previousRecommendationIds: string[];
}

/**
 * Match a single condition against test/user data
 */
function matchesCondition(
  condition: RecommendationCondition,
  testScore: number,
  testSilo: string,
  userContext: UserContext
): boolean {
  // Score range check
  if (condition.minScore !== undefined && testScore < condition.minScore) {
    return false;
  }

  if (condition.maxScore !== undefined && testScore > condition.maxScore) {
    return false;
  }

  // Silo check (if specified)
  if (condition.testSilo && condition.testSilo !== testSilo) {
    return false;
  }

  // Completed tests check
  if (condition.minCompletedTests && userContext.totalCompletedTests < condition.minCompletedTests) {
    return false;
  }

  // XP level check
  if (condition.minXPLevel && userContext.totalXP < condition.minXPLevel) {
    return false;
  }

  return true;
}

/**
 * Match a recommendation against test/user data
 */
function matchesRecommendation(
  recommendation: ProductRecommendation,
  testScore: number,
  testSilo: string,
  userContext: UserContext
): boolean {
  // At least one condition must match
  return recommendation.conditions.some((condition) =>
    matchesCondition(condition, testScore, testSilo, userContext)
  );
}

/**
 * Get personalized product recommendations
 * Returns 2-3 products matched to user's test performance
 */
export function getRecommendations(
  testScore: number,
  testSilo: string,
  userContext: UserContext,
  maxRecommendations: number = 3
): Array<Product & { reason: string; priority: number }> {
  // Filter config for matching recommendations
  const matching = RECOMMENDATION_CONFIG.filter((rec) =>
    matchesRecommendation(rec, testScore, testSilo, userContext)
  );

  // Filter out already purchased products
  const available = matching.filter(
    (rec) => !userContext.purchasedProductIds.includes(rec.productId)
  );

  // Sort by priority (higher first)
  const sorted = available.sort((a, b) => b.priority - a.priority);

  // Take top N and hydrate with product data
  return sorted.slice(0, maxRecommendations).map((rec) => {
    const product = PRODUCTS[rec.productId];
    if (!product) {
      throw new Error(`Product not found: ${rec.productId}`);
    }
    return {
      ...product,
      reason: rec.reason,
      priority: rec.priority,
    };
  });
}

/**
 * Get fallback recommendations (bestsellers)
 * Used when no personalized match found
 */
export function getFallbackRecommendations(
  userContext: UserContext,
  maxRecommendations: number = 3
): Array<Product & { reason: string; priority: number }> {
  // Bestseller IDs (hardcoded order)
  const bestsellers = [
    'personality-deep-dive',
    'premium-certificate',
    'serious-learner-bundle',
  ];

  // Filter out purchased and return
  return bestsellers
    .filter((id) => !userContext.purchasedProductIds.includes(id))
    .slice(0, maxRecommendations)
    .map((id) => {
      const product = PRODUCTS[id];
      if (!product) {
        throw new Error(`Product not found: ${id}`);
      }
      return {
        ...product,
        reason: 'Our most popular product. Thousands of learners love it.',
        priority: 5,
      };
    });
}

/**
 * Smart recommendation getter
 * Returns personalized if available, falls back to bestsellers
 */
export function getSmartRecommendations(
  testScore: number,
  testSilo: string,
  userContext: UserContext,
  maxRecommendations: number = 3
): Array<Product & { reason: string; priority: number }> {
  const recommendations = getRecommendations(testScore, testSilo, userContext, maxRecommendations);

  // If we got at least 2 personalized recommendations, return them
  if (recommendations.length >= 2) {
    return recommendations;
  }

  // Otherwise, pad with bestsellers
  const fallback = getFallbackRecommendations(userContext, maxRecommendations - recommendations.length);
  return [...recommendations, ...fallback].slice(0, maxRecommendations);
}
