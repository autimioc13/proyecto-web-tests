// src/lib/products.ts

import { Product } from '@/types/products';

/**
 * Product Inventory
 * Indexed by ID for O(1) lookup in recommendations
 */
export const PRODUCTS: Record<string, Product> = {
  // Personality Reports
  'personality-deep-dive': {
    id: 'pri_01kvhps1w3bax4qs1de0qvdyvz',
    title: 'Personality Deep Dive Report',
    description: 'Comprehensive analysis of your personality type with actionable insights for personal growth.',
    category: 'personality-report',
    price: 1299, // $12.99
    image: '/products/personality-report.png',
    features: [
      '50-page detailed report',
      'Personalized recommendations',
      'Career guidance based on type',
      'Relationship insights',
    ],
    targetAudience: 'all',
    estimatedValue: 'Understand yourself better',
  },

  // Learning Courses
  'logic-advanced-course': {
    id: 'pri_01kvhpr1gdz61mcgywdxa5q691',
    title: 'Advanced Logic Mastery Course',
    description: 'Master complex logical reasoning with 10+ hours of video content and exercises.',
    category: 'learning-course',
    price: 2999, // $29.99
    image: '/products/logic-course.png',
    features: [
      '10+ hours of video content',
      '50+ practice problems',
      'Certificate of completion',
      'Lifetime access',
    ],
    targetAudience: 'advanced',
    estimatedValue: 'Save 20 hours of self-study',
  },

  'intelligence-fundamentals-course': {
    id: 'pri_01kvhpqa8w276vb1z33ay3167r',
    title: 'Intelligence Fundamentals Course',
    description: 'Build strong foundations in critical thinking and analytical reasoning.',
    category: 'learning-course',
    price: 1999, // $19.99
    image: '/products/intelligence-course.png',
    features: [
      '8 modules covering core concepts',
      'Interactive quizzes',
      'Downloadable study materials',
      '30-day money-back guarantee',
    ],
    targetAudience: 'beginners',
    estimatedValue: 'Jump 2 levels in IQ tests',
  },

  'productivity-mastery': {
    id: 'pri_01kvhpp65tybzf3qs0xfn29vm8',
    title: 'Productivity Mastery Course',
    description: 'Learn proven systems to increase productivity and achieve your goals faster.',
    category: 'learning-course',
    price: 1799, // $17.99
    image: '/products/productivity-course.png',
    features: [
      '6-week program',
      'Weekly live Q&A sessions',
      'Templates and tools',
      'Community access',
    ],
    targetAudience: 'all',
    estimatedValue: 'Save 10+ hours per week',
  },

  // Certificates
  'basic-certificate': {
    id: 'pri_01kvhpnea2dxyxg15acvap49pv',
    title: 'QuizLab Achievement Certificate',
    description: 'Official certificate proving your test achievement, printable and shareable.',
    category: 'certificate',
    price: 499, // $4.99
    image: '/products/certificate-basic.png',
    features: [
      'Printable PDF',
      'LinkedIn shareable',
      'Valid for 1 year',
    ],
    targetAudience: 'all',
    estimatedValue: 'Boost your profile',
  },

  'premium-certificate': {
    id: 'pri_01kvhpme8gcvv71p6109efwj4r',
    title: 'Premium Achievement Certificate',
    description: 'Luxury certificate with enhanced design, perfect for professional portfolios.',
    category: 'certificate',
    price: 999, // $9.99
    image: '/products/certificate-premium.png',
    features: [
      'Premium design with QR verification',
      'Blockchain certificate option',
      'Digital + printed version',
      'Valid for 3 years',
    ],
    targetAudience: 'all',
    estimatedValue: 'Professional credibility',
  },

  // Bundles
  'knowledge-master-bundle': {
    id: 'pri_01kvhpkkzcxd8ab0nf5rea8fzs',
    title: 'Knowledge Master Bundle',
    description: '3 advanced courses + premium certificate. Save $20 vs. individual purchase.',
    category: 'premium-bundle',
    price: 4999, // $49.99
    image: '/products/bundle-master.png',
    features: [
      'Advanced Logic Course',
      'Intelligence Mastery Course',
      'Productivity Course',
      'Premium Certificate',
      'Save $20',
    ],
    targetAudience: 'advanced',
    estimatedValue: 'Everything you need',
  },

  'serious-learner-bundle': {
    id: 'pri_01kvhpje4tsk32tsbrxddepcx7',
    title: 'Serious Learner Bundle',
    description: 'Perfect for committed learners. 2 courses + personality report.',
    category: 'premium-bundle',
    price: 3499, // $34.99
    image: '/products/bundle-learner.png',
    features: [
      'Any 2 courses of your choice',
      'Personality Deep Dive Report',
      'Save $10',
    ],
    targetAudience: 'advanced',
    estimatedValue: 'Best for growth',
  },

  // API Access
  'developer-api-access': {
    id: 'pri_01kvhph91g00sasry5dzeg221j',
    title: 'Developer API Access',
    description: 'Access QuizLab API for integration into your platform. Per month.',
    category: 'api-access',
    price: 2999, // $29.99/month
    image: '/products/api-access.png',
    features: [
      'Full REST API access',
      '10,000 requests/month',
      'Webhook support',
      'Tech support',
    ],
    targetAudience: 'advanced',
    estimatedValue: 'Build on QuizLab',
  },
};

/**
 * Get product by ID with type safety
 */
export function getProduct(id: string): Product | null {
  return PRODUCTS[id] ?? null;
}

/**
 * Get all products
 */
export function getAllProducts(): Product[] {
  return Object.values(PRODUCTS);
}

/**
 * Format price as USD string (cents to dollars)
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Calculate savings between products (for bundles)
 */
export function calculateSavings(productIds: string[]): number {
  const total = productIds.reduce((sum, id) => {
    const product = getProduct(id);
    return sum + (product?.price || 0);
  }, 0);
  return total;
}
