// src/app/checkout/page.tsx

'use client';

import { useCart } from '@/lib/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Loader } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/products';

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    paymentMethod: 'card' as 'card' | 'paypal',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
          <Link
            href="/cart"
            className="text-purple-400 hover:text-purple-300"
          >
            ← Back to cart
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      // Validate form
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
        throw new Error('Please fill in all fields');
      }

      // Mock payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create order
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Simulate order creation
      const order = {
        id: orderId,
        items: cart.items,
        totalPrice,
        status: 'completed' as const,
        createdAt: new Date(),
        paymentMethod: formData.paymentMethod,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
      };

      // Store order in sessionStorage for confirmation page
      sessionStorage.setItem('lastOrder', JSON.stringify(order));

      // Clear cart
      clearCart();

      // Redirect to confirmation
      router.push(`/checkout/confirmation?orderId=${orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <Link
          href="/cart"
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Cart
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-white/60">Complete your order</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
                  {error}
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    className="
                      w-full px-4 py-3
                      bg-white/10 border border-white/20
                      rounded-lg text-white placeholder-white/40
                      focus:outline-none focus:border-white/40
                      transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    className="
                      w-full px-4 py-3
                      bg-white/10 border border-white/20
                      rounded-lg text-white placeholder-white/40
                      focus:outline-none focus:border-white/40
                      transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    className="
                      w-full px-4 py-3
                      bg-white/10 border border-white/20
                      rounded-lg text-white placeholder-white/40
                      focus:outline-none focus:border-white/40
                      transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {(['card', 'paypal'] as const).map((method) => (
                    <label
                      key={method}
                      className="
                        flex items-center gap-3 p-4
                        bg-white/10 border border-white/20 rounded-lg
                        cursor-pointer hover:bg-white/15 transition-colors
                      "
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={formData.paymentMethod === method}
                        onChange={handleInputChange}
                        disabled={isProcessing}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-white font-semibold">
                        {method === 'card' ? '💳 Credit Card' : '🅿️ PayPal'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="
                  w-full px-6 py-3
                  bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50
                  text-white font-bold
                  rounded-lg
                  transition-colors
                  flex items-center justify-center gap-2
                  disabled:cursor-not-allowed
                "
              >
                {isProcessing ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Complete Purchase - ${formatPrice(totalPrice)}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
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
                  <span>Included</span>
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
