// src/components/ProductRecommendations.tsx

'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/products';
import ProductRecommendation from './ProductRecommendation';
import { getSmartRecommendations } from '@/lib/recommendations';
import { Loader } from 'lucide-react';

interface ProductRecommendationsProps {
  testScore: number;
  testSilo: string;
  totalCompletedTests: number;
  totalXP: number;
  purchasedProductIds?: string[];
  userId?: string;
}

export default function ProductRecommendations({
  testScore,
  testSilo,
  totalCompletedTests,
  totalXP,
  purchasedProductIds = [],
  userId,
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<
    Array<Product & { reason: string; priority: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userContext = {
        userId,
        totalCompletedTests,
        totalXP,
        purchasedProductIds,
        previousRecommendationIds: [],
      };

      const recs = getSmartRecommendations(
        testScore,
        testSilo,
        userContext,
        3
      );

      setRecommendations(recs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      console.error('Recommendation error:', err);
    } finally {
      setLoading(false);
    }
  }, [testScore, testSilo, totalCompletedTests, totalXP, purchasedProductIds, userId]);

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-center gap-2 text-white/60">
          <Loader size={20} className="animate-spin" />
          <span>Loading personalized recommendations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4">
        <div className="text-center text-red-400/80">
          <p>Could not load recommendations</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="py-12 px-4">
        <div className="text-center text-white/60">
          <p>No recommendations available at this time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          ✨ Just for You
        </h2>
        <p className="text-white/60">
          Based on your {testScore}% score, we recommend these products to help you grow.
        </p>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((product) => (
          <ProductRecommendation
            key={product.id}
            product={product}
            testScore={testScore}
          />
        ))}
      </div>

      {/* Upsell section */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20">
        <h3 className="text-lg font-bold text-white mb-2">💎 Want Everything?</h3>
        <p className="text-white/70 mb-4">
          Check our premium bundles for even more value and savings.
        </p>
        <button
          className="
            px-6 py-2 bg-white/20 hover:bg-white/30
            border border-white/20 rounded-lg
            text-white font-semibold
            transition-all duration-300
          "
        >
          View All Products
        </button>
      </div>
    </div>
  );
}
