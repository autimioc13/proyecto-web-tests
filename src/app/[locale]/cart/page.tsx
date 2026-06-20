// src/app/cart/page.tsx

'use client';

import { useCart } from '@/lib/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/products';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const router = useRouter();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <div className="text-center py-12">
            <ShoppingCart size={64} className="mx-auto text-white/30 mb-6" />
            <h1 className="text-3xl font-bold text-white mb-2">Your cart is empty</h1>
            <p className="text-white/60 mb-8">
              Complete a test to get personalized product recommendations!
            </p>
            <Link
              href="/tests"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Take a Test
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <Link
          href="/"
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Shopping Cart</h1>
          <p className="text-white/60">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {/* Cart Items */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items Column */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.product.id}
                className="
                  bg-white/10 dark:bg-white/5
                  backdrop-blur-xl
                  border border-white/20
                  rounded-2xl p-6
                  flex items-center justify-between
                  hover:bg-white/15 transition-colors
                "
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {item.product.title}
                  </h3>
                  <p className="text-sm text-white/60 mb-3">
                    {item.product.description}
                  </p>
                  <p className="text-lg font-bold text-white">
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4 ml-6">
                  <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg p-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                      }
                      className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-white font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-lg font-bold text-white w-24 text-right">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-1">
            <div
              className="
                sticky top-4
                bg-white/10 dark:bg-white/5
                backdrop-blur-xl
                border border-white/20
                rounded-2xl p-6
              "
            >
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-white/20">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between mb-8">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-2xl font-bold text-white">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="
                  w-full px-6 py-3
                  bg-purple-600 hover:bg-purple-700
                  text-white font-bold
                  rounded-lg
                  transition-colors
                  mb-3
                "
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => router.push('/tests')}
                className="
                  w-full px-6 py-3
                  bg-white/10 hover:bg-white/20
                  text-white font-semibold
                  rounded-lg
                  border border-white/20
                  transition-colors
                "
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
