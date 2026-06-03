// src/components/ProductRecommendation.tsx

'use client';

import { Product } from '@/types/products';
import { formatPrice } from '@/lib/products';
import { useCart } from '@/lib/contexts/CartContext';
import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';

interface ProductRecommendationProps {
  product: Product & { reason: string };
  testScore: number;
}

export default function ProductRecommendation({
  product,
  testScore,
}: ProductRecommendationProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div
      className="
        relative rounded-2xl overflow-hidden
        bg-white/10 dark:bg-white/5
        backdrop-blur-xl
        border border-white/20
        shadow-lg
        hover:shadow-2xl
        transition-all duration-300
        flex flex-col
        h-full
      "
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image Container */}
      <div className="relative w-full h-40 bg-gradient-to-br from-white/10 to-white/5 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <span className="text-4xl">📦</span>
          </div>
        )}
        {/* Score badge */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-sm font-semibold text-white">
          {testScore}%
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Category badge */}
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
          {product.category.replace('-', ' ')}
        </span>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-white/70 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Reason for recommendation */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-2 mb-4">
          <p className="text-xs text-white/80 italic">
            💡 {product.reason}
          </p>
        </div>

        {/* Features (abbreviated) */}
        <ul className="text-xs text-white/60 mb-4 space-y-1">
          {product.features.slice(0, 2).map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-1 h-1 bg-white/40 rounded-full" />
              {feature}
            </li>
          ))}
        </ul>

        {/* Price and Button */}
        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-sm text-white/60">Starting at</span>
            <p className="text-2xl font-bold text-white">
              {formatPrice(product.price)}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            className={`
              px-4 py-2 rounded-lg font-semibold
              transition-all duration-300
              flex items-center gap-2
              ${
                isAdded
                  ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                  : 'bg-white/20 hover:bg-white/30 border border-white/20 text-white'
              }
            `}
          >
            {isAdded ? (
              <>
                <Check size={18} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
