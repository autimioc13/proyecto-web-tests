// src/types/products.ts

/**
 * Product Categories
 */
export type ProductCategory =
  | 'personality-report'
  | 'learning-course'
  | 'certificate'
  | 'premium-bundle'
  | 'api-access';

/**
 * Product representation
 */
export interface Product {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  price: number; // in USD cents (e.g., 999 = $9.99)
  image: string; // URL to product image
  features: string[];
  targetAudience: string; // "beginners", "advanced", "all"
  estimatedValue: string; // e.g., "Save 20 hours of study time"
}

/**
 * Recommendation condition based on test performance
 */
export interface RecommendationCondition {
  testSilo?: string; // "inteligencia", "personalidad", etc. - optional for general conditions
  minScore: number; // 0-100
  maxScore?: number; // optional upper bound
  minCompletedTests?: number;
  minXPLevel?: number;
  personalityType?: string; // e.g., "ENFP"
}

/**
 * Product recommendation with matching logic
 */
export interface ProductRecommendation {
  productId: string;
  conditions: RecommendationCondition[];
  reason: string; // Why was this recommended? (shown to user)
  priority: number; // Higher = shown first (1-10)
}

/**
 * Cart item (product + quantity)
 */
export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

/**
 * Cart state
 */
export interface Cart {
  items: CartItem[];
  totalPrice: number; // in cents
  itemCount: number;
  lastUpdated: Date;
}

/**
 * Order after checkout
 */
export interface Order {
  id: string;
  userId?: string;
  items: CartItem[];
  totalPrice: number; // in cents
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  paymentMethod: 'card' | 'paypal' | 'mock';
}

/**
 * Analytics event for tracking
 */
export interface RecommendationAnalyticsEvent {
  eventType: 'recommendation_shown' | 'product_clicked' | 'product_added_to_cart' | 'product_purchased';
  productId: string;
  testId: string;
  testScore: number;
  testSilo: string;
  timestamp: Date;
  userId?: string;
}
