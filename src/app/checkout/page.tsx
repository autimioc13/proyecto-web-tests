// src/app/checkout/page.tsx

'use client';

import { useCart } from '@/lib/contexts/CartContext';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/products';
import PaddleCheckout from '@/components/PaddleCheckout';

export default function CheckoutPage() {
  const { cart, getTotalPrice } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
          <Link href="/cart" className="text-purple-400 hover:text-purple-300">
            ← Back to cart
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Cart
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-white/60">Complete your order securely with Paddle</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <PaddleCheckout />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-white/80 text-sm">
                    <div>
                      <p className="font-semibold">{item.product.title}</p>
                      <p className="text-white/60">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/20 pt-6">
                <div className="flex justify-between mb-2 text-white/60">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between mb-6 text-white/60">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
