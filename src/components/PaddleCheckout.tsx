'use client';

import { useState } from 'react';
import { Loader } from 'lucide-react';
import { useCart } from '@/lib/contexts/CartContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { formatPrice } from '@/lib/products';
import { openPaddleCheckout } from '@/lib/paddle/client';
import { getPaddlePriceId, isPaddleConfigured } from '@/lib/paddle/config';

/**
 * Paddle-based checkout.
 * 1. Validates that every cart product has a configured Paddle price id.
 * 2. Asks the server to create a pending order (prices computed server-side).
 * 3. Opens the Paddle overlay; Paddle charges the customer and our webhook
 *    marks the order as completed.
 */
export default function PaddleCheckout() {
  const { cart, getTotalPrice } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = getTotalPrice();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!isPaddleConfigured()) {
      setError('Payments are not configured yet. Please try again later.');
      return;
    }

    // Map cart items to Paddle price ids
    const paddleItems: { priceId: string; quantity: number }[] = [];
    for (const item of cart.items) {
      const priceId = getPaddlePriceId(item.product.id);
      if (!priceId) {
        setError(`"${item.product.title}" is not available for purchase yet.`);
        return;
      }
      paddleItems.push({ priceId, quantity: item.quantity });
    }

    setIsProcessing(true);
    try {
      // 1) Create a pending order server-side (authoritative prices)
      const res = await fetch('/api/payments/paddle/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          userId: user?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not create your order');
      }

      const { orderId } = await res.json();

      // 2) Open the Paddle overlay
      await openPaddleCheckout({
        items: paddleItems,
        email: formData.email,
        customData: { orderId, userId: user?.id || '' },
        successUrl: `${window.location.origin}/checkout/confirmation`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
        <div className="space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors disabled:opacity-50"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors disabled:opacity-50"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            disabled={isProcessing}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors disabled:opacity-50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader size={20} className="animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${formatPrice(totalPrice)}`
        )}
      </button>

      <p className="text-xs text-white/50 text-center">
        Secure payment powered by Paddle. Taxes calculated at checkout based on your location.
      </p>
    </form>
  );
}
