// src/app/checkout/confirmation/page.tsx

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, Download, Share2 } from 'lucide-react';
import { formatPrice } from '@/lib/products';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve order from sessionStorage
    const orderData = sessionStorage.getItem('lastOrder');
    if (orderData) {
      try {
        setOrder(JSON.parse(orderData));
      } catch (err) {
        console.error('Failed to parse order:', err);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!order || !orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Order Not Found</h1>
          <Link
            href="/"
            className="text-purple-400 hover:text-purple-300"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-green-500/20 rounded-full mb-6">
            <CheckCircle size={64} className="text-green-400" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">Order Confirmed!</h1>
          <p className="text-white/60 mb-6">
            Thank you for your purchase. Your order has been processed successfully.
          </p>

          {/* Order Number */}
          <div className="bg-white/10 border border-white/20 rounded-lg p-6 mb-8">
            <p className="text-white/60 text-sm mb-2">Order Number</p>
            <p className="text-2xl font-bold text-white font-mono">{orderId}</p>
            <p className="text-white/60 text-sm mt-2">
              A confirmation email has been sent to {order.customerEmail}
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 text-left">
            <h2 className="text-xl font-bold text-white mb-4">Order Details</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-white/20">
              {order.items.map((item: any) => (
                <div key={item.product.id} className="flex justify-between">
                  <div>
                    <p className="text-white font-semibold">{item.product.title}</p>
                    <p className="text-white/60 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-white font-semibold">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Tax</span>
                <span>Included</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold text-white border-t border-white/20 pt-4">
              <span>Total</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 mb-8">
            <button className="w-full px-6 py-3 bg-white/20 border border-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
              <Download size={20} />
              Download Invoice
            </button>
            <button className="w-full px-6 py-3 bg-white/20 border border-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
              <Share2 size={20} />
              Share Your Achievement
            </button>
          </div>

          {/* Next Steps */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-bold text-white mb-3">📚 What's Next?</h3>
            <ul className="text-white/70 text-sm space-y-2">
              <li>✓ Your products are ready to access in your dashboard</li>
              <li>✓ Check your email for download links and instructions</li>
              <li>✓ Join our community to connect with other learners</li>
              <li>✓ Start your course and track your progress</li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/tests"
              className="block px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Take Another Test
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
