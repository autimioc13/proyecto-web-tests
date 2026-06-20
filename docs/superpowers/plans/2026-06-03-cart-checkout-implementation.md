# Cart & Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete Mock Checkout Cart & Products Flow with shopping cart management, product catalog, checkout form, and order confirmation—plus admin sales dashboard integration.

**Architecture:** 
- Zustand store for client-side cart state management (immutable, with localStorage persistence)
- Type-safe product catalog with mock data
- Multi-step checkout flow: product listing → cart review → order form → confirmation
- Mock transaction handler (no real payment gateway yet, easy to swap)
- Admin dashboard enhanced with sales metrics, recent transactions, and revenue tracking

**Tech Stack:**
- Next.js 14+, TypeScript, React 19, Tailwind CSS
- Zustand for state management (lightweight, hooks-based)
- Existing component patterns (PrimaryButton, glassmorphism, dark mode support)
- Recharts for transaction visualization in admin

---

## File Structure

**New files to create:**
- `src/types/ecommerce.ts` - Product, Cart, Order types
- `src/store/cartStore.ts` - Zustand cart state + localStorage sync
- `src/hooks/useCart.ts` - Cart operations hook
- `src/lib/products.ts` - Mock product catalog & calculations
- `src/components/ecommerce/ProductCard.tsx` - Product display card
- `src/components/ecommerce/CartIcon.tsx` - Sidebar cart badge
- `src/components/ecommerce/CartSidebar.tsx` - Cart drawer/modal
- `src/components/ecommerce/CheckoutForm.tsx` - Order form with validation
- `src/components/ecommerce/OrderSummary.tsx` - Order review before payment
- `src/components/admin/SalesMetrics.tsx` - Revenue card for admin
- `src/components/admin/RecentTransactions.tsx` - Transaction table for admin
- `src/app/products/page.tsx` - Products catalog page
- `src/app/checkout/page.tsx` - Checkout page
- `src/app/order-confirmation/page.tsx` - Confirmation with receipt
- `src/app/api/orders/route.ts` - Mock order creation endpoint

**Modified files:**
- `src/components/nav/Sidebar.tsx` - Add cart icon with badge
- `src/app/admin/analytics/page.tsx` - Add sales metrics section

---

## Task Breakdown

### Task 1: Create E-commerce Type Definitions

**Files:**
- Create: `src/types/ecommerce.ts`

- [ ] **Step 1: Write type definitions**

```typescript
// src/types/ecommerce.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in USD cents (e.g., 999 = $9.99)
  emoji: string;
  category: 'reports' | 'analytics' | 'certification' | 'tools' | 'api';
  features: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  priceAtAdd: number; // Snapshot price when added
}

export interface Cart {
  items: CartItem[];
  createdAt: number;
  updatedAt: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number; // cents
  tax: number; // cents (10% of subtotal)
  total: number; // cents
  customerName: string;
  customerEmail: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface CartStore {
  // State
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (productId: string, product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;

  // Selectors
  itemCount: () => number;
  subtotal: () => number;
  tax: () => number;
  total: () => number;
}
```

- [ ] **Step 2: Verify types are exported**

Run: Check types are exported from `src/types/index.ts`

```bash
grep -n "ecommerce" "/c/Users/LENOVO/Desktop/PROYECTO WEB MONETIZATION/src/types/index.ts"
```

If not present, add: `export * from './ecommerce';`

---

### Task 2: Create Mock Product Catalog

**Files:**
- Create: `src/lib/products.ts`

- [ ] **Step 1: Write product catalog and calculation functions**

```typescript
// src/lib/products.ts
import { Product } from '@/types/ecommerce';

export const PRODUCTS: Product[] = [
  {
    id: 'premium-reports',
    name: 'Premium Reports',
    description: 'Advanced PDF reports with insights and analytics',
    price: 999, // $9.99
    emoji: '📊',
    category: 'reports',
    features: ['Detailed analysis', 'Custom visualizations', 'Monthly updates'],
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Real-time performance tracking and insights',
    price: 1999, // $19.99
    emoji: '📈',
    category: 'analytics',
    features: ['Real-time data', 'Custom dashboards', 'API access'],
  },
  {
    id: 'certificate-pack',
    name: 'Certificate Pack',
    description: 'Verified digital certificates for completed quizzes',
    price: 1499, // $14.99
    emoji: '🎓',
    category: 'certification',
    features: ['Digital certificates', 'Printable format', 'Social sharing'],
  },
  {
    id: 'custom-tests',
    name: 'Custom Tests',
    description: 'Create unlimited custom tests and assessments',
    price: 2499, // $24.99
    emoji: '⚙️',
    category: 'tools',
    features: ['Unlimited tests', 'AI-assisted creation', 'Analytics'],
  },
  {
    id: 'api-access',
    name: 'API Access',
    description: 'Full API access for integration and automation',
    price: 2999, // $29.99
    emoji: '🔌',
    category: 'api',
    features: ['REST API', 'Webhooks', 'Developer support'],
  },
];

export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find((p) => p.id === id);
};

export const calculateSubtotal = (items: Array<{ priceAtAdd: number; quantity: number }>): number => {
  return items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
};

export const calculateTax = (subtotal: number): number => {
  return Math.round(subtotal * 0.1); // 10% tax
};

export const calculateTotal = (subtotal: number): number => {
  const tax = calculateTax(subtotal);
  return subtotal + tax;
};

export const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};
```

- [ ] **Step 2: Test calculations manually**

Run: Create a quick test in Node to verify math
```bash
node -e "
const subtotal = 999;
const tax = Math.round(subtotal * 0.1);
const total = subtotal + tax;
console.log('Subtotal:', subtotal, 'Tax:', tax, 'Total:', total);
"
```

Expected output: `Subtotal: 999 Tax: 100 Total: 1099`

---

### Task 3: Create Zustand Cart Store

**Files:**
- Create: `src/store/cartStore.ts`

- [ ] **Step 1: Install zustand (if not already installed)**

Run: 
```bash
cd "/c/Users/LENOVO/Desktop/PROYECTO WEB MONETIZATION" && npm list zustand 2>/dev/null | grep zustand || npm install zustand
```

- [ ] **Step 2: Write Zustand store with localStorage persistence**

```typescript
// src/store/cartStore.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartStore, CartItem } from '@/types/ecommerce';
import { calculateSubtotal, calculateTax, calculateTotal } from '@/lib/products';

const STORAGE_KEY = 'quizlab-cart';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (productId, product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === productId);

          if (existingItem) {
            // Update quantity if product already in cart
            return {
              items: state.items.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          // Add new item
          return {
            items: [
              ...state.items,
              {
                productId,
                quantity,
                priceAtAdd: product.price,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      subtotal: () => {
        return calculateSubtotal(get().items);
      },

      tax: () => {
        return calculateTax(get().subtotal());
      },

      total: () => {
        return calculateTotal(get().subtotal());
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
```

- [ ] **Step 3: Test store initialization**

Create a test file `src/store/__tests__/cartStore.test.ts`:

```typescript
import { useCartStore } from '../cartStore';
import { PRODUCTS } from '@/lib/products';

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('should initialize with empty cart', () => {
    const { items } = useCartStore.getState();
    expect(items).toEqual([]);
  });

  it('should add item to cart', () => {
    const store = useCartStore.getState();
    const product = PRODUCTS[0];
    store.addItem(product.id, product, 1);

    expect(store.items).toHaveLength(1);
    expect(store.items[0].productId).toBe(product.id);
    expect(store.items[0].quantity).toBe(1);
  });

  it('should calculate totals correctly', () => {
    const store = useCartStore.getState();
    const product = PRODUCTS[0]; // $9.99 = 999 cents

    store.addItem(product.id, product, 1);
    expect(store.subtotal()).toBe(999);
    expect(store.tax()).toBe(100); // 10% of 999
    expect(store.total()).toBe(1099);
  });
});
```

Run: `npm test -- src/store/__tests__/cartStore.test.ts`

Expected: All tests pass

---

### Task 4: Create useCart Hook

**Files:**
- Create: `src/hooks/useCart.ts`

- [ ] **Step 1: Write hook wrapper for convenient store access**

```typescript
// src/hooks/useCart.ts
'use client';

import { useCallback } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types/ecommerce';
import { formatPrice } from '@/lib/products';

export const useCart = () => {
  const store = useCartStore();

  const addItem = useCallback(
    (product: Product, quantity: number = 1) => {
      store.addItem(product.id, product, quantity);
    },
    [store]
  );

  const removeItem = useCallback(
    (productId: string) => {
      store.removeItem(productId);
    },
    [store]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      store.updateQuantity(productId, quantity);
    },
    [store]
  );

  return {
    items: store.items,
    isOpen: store.isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart: () => store.clearCart(),
    toggleCart: () => store.toggleCart(),
    closeCart: () => store.closeCart(),
    itemCount: store.itemCount(),
    subtotal: formatPrice(store.subtotal()),
    tax: formatPrice(store.tax()),
    total: formatPrice(store.total()),
    subtotalRaw: store.subtotal(),
    taxRaw: store.tax(),
    totalRaw: store.total(),
  };
};
```

- [ ] **Step 2: Verify hook compiles**

Run:
```bash
cd "/c/Users/LENOVO/Desktop/PROYECTO WEB MONETIZATION" && npx tsc --noEmit src/hooks/useCart.ts
```

Expected: No errors

---

### Task 5: Create ProductCard Component

**Files:**
- Create: `src/components/ecommerce/ProductCard.tsx`

- [ ] **Step 1: Write product card component**

```typescript
// src/components/ecommerce/ProductCard.tsx
'use client';

import { Product } from '@/types/ecommerce';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/products';
import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const isInCart = items.some((item) => item.productId === product.id);

  const handleAddToCart = () => {
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group relative rounded-lg border border-gray-200/50 dark:border-white/20 bg-gray-100/50 dark:bg-white/5 backdrop-blur-xl hover:bg-gray-100/70 dark:hover:bg-white/10 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-white/10 flex flex-col">
      {/* Emoji Header */}
      <div className="text-5xl mb-4">{product.emoji}</div>

      {/* Title & Description */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {product.name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-grow">
        {product.description}
      </p>

      {/* Features List */}
      <div className="mb-4 space-y-2">
        {product.features.map((feature) => (
          <div
            key={feature}
            className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600" />
            {feature}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200/50 dark:border-white/20 my-4" />

      {/* Price & Button */}
      <div className="flex items-end justify-between gap-3">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatPrice(product.price)}
        </div>
        <PrimaryButton
          onClick={handleAddToCart}
          size="sm"
          variant={isInCart ? 'solid' : 'gradient'}
          icon={isAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
        >
          {isAdded ? 'Added!' : isInCart ? 'In Cart' : 'Add'}
        </PrimaryButton>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify component renders without errors**

Check TypeScript compilation passes.

---

### Task 6: Create CartIcon Component with Badge

**Files:**
- Create: `src/components/ecommerce/CartIcon.tsx`

- [ ] **Step 1: Write cart icon with item count badge**

```typescript
// src/components/ecommerce/CartIcon.tsx
'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export default function CartIcon() {
  const { itemCount, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
      aria-label="Shopping cart"
    >
      <ShoppingCart size={20} className="text-gray-900 dark:text-white" />
      
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Verify component compiles**

---

### Task 7: Create CartSidebar Component

**Files:**
- Create: `src/components/ecommerce/CartSidebar.tsx`

- [ ] **Step 1: Write cart drawer component**

```typescript
// src/components/ecommerce/CartSidebar.tsx
'use client';

import { useCart } from '@/hooks/useCart';
import { getProductById, formatPrice } from '@/lib/products';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-50 dark:bg-gray-900/95 border-l border-gray-200/50 dark:border-white/20 shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-white/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Your Cart ({itemCount})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X size={20} className="text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => {
              const product = getProductById(item.productId);
              if (!product) return null;

              return (
                <div
                  key={item.productId}
                  className="rounded-lg border border-gray-200/50 dark:border-white/20 bg-gray-100/50 dark:bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{product.emoji}</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatPrice(item.priceAtAdd)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Minus size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                      className="w-12 text-center bg-white/10 dark:bg-white/5 border border-gray-200/50 dark:border-white/20 rounded text-gray-900 dark:text-white text-sm py-1"
                      min="1"
                    />
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Plus size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200/50 dark:border-white/20 p-6 space-y-4 bg-gray-100/50 dark:bg-white/5">
            <div className="text-lg font-bold text-gray-900 dark:text-white flex justify-between">
              <span>Total:</span>
              <span>{total}</span>
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <PrimaryButton className="w-full">Proceed to Checkout</PrimaryButton>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify component compiles**

---

### Task 8: Update Sidebar to Include Cart Icon

**Files:**
- Modify: `src/components/nav/Sidebar.tsx`

- [ ] **Step 1: Read current Sidebar structure**

Run:
```bash
head -50 "/c/Users/LENOVO/Desktop/PROYECTO WEB MONETIZATION/src/components/nav/Sidebar.tsx"
```

- [ ] **Step 2: Add CartIcon import and include in navigation**

Add this import near the top:
```typescript
import CartIcon from '@/components/ecommerce/CartIcon';
```

Find the navigation section where other icons/buttons are rendered and add:
```tsx
<CartIcon />
```

- [ ] **Step 3: Add CartSidebar component to Sidebar**

Add near the end of the Sidebar component (before closing tags):
```tsx
import CartSidebar from '@/components/ecommerce/CartSidebar';
```

Then include `<CartSidebar />` in the return JSX.

- [ ] **Step 4: Commit**

```bash
cd "/c/Users/LENOVO/Desktop/PROYECTO WEB MONETIZATION"
git add src/components/ecommerce/CartIcon.tsx src/components/ecommerce/CartSidebar.tsx src/components/nav/Sidebar.tsx
git commit -m "feat: add cart icon and sidebar to navigation"
```

---

### Task 9: Create OrderSummary Component

**Files:**
- Create: `src/components/ecommerce/OrderSummary.tsx`

- [ ] **Step 1: Write order summary display component**

```typescript
// src/components/ecommerce/OrderSummary.tsx
'use client';

import { CartItem } from '@/types/ecommerce';
import { getProductById, formatPrice } from '@/lib/products';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  showDetails?: boolean;
}

export default function OrderSummary({
  items,
  subtotal,
  tax,
  total,
  showDetails = true,
}: OrderSummaryProps) {
  return (
    <div className="rounded-lg border border-gray-200/50 dark:border-white/20 bg-gray-100/50 dark:bg-white/5 backdrop-blur-xl p-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order Summary</h3>

      {/* Item Details */}
      {showDetails && (
        <div className="space-y-2 pb-4 border-b border-gray-200/50 dark:border-white/20">
          {items.map((item) => {
            const product = getProductById(item.productId);
            if (!product) return null;

            return (
              <div key={item.productId} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  {product.emoji} {product.name} x {item.quantity}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(item.priceAtAdd * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <span>Tax (10%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200/50 dark:border-white/20">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify component compiles**

---

### Task 10: Create CheckoutForm Component

**Files:**
- Create: `src/components/ecommerce/CheckoutForm.tsx`

- [ ] **Step 1: Write checkout form with validation**

```typescript
// src/components/ecommerce/CheckoutForm.tsx
'use client';

import { useState } from 'react';
import PrimaryButton from '@/components/buttons/PrimaryButton';

interface CheckoutFormProps {
  onSubmit: (data: { name: string; email: string }) => Promise<void>;
  isLoading?: boolean;
}

export default function CheckoutForm({ onSubmit, isLoading = false }: CheckoutFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: 'Failed to process order. Please try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Full Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-white/20 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-white/30 transition-all"
          placeholder="John Doe"
          disabled={isLoading}
        />
        {errors.name && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-white/20 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-white/30 transition-all"
          placeholder="john@example.com"
          disabled={isLoading}
        />
        {errors.email && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</p>}
      </div>

      {errors.submit && (
        <div className="p-4 rounded-lg bg-red-100/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50">
          <p className="text-sm text-red-700 dark:text-red-300">{errors.submit}</p>
        </div>
      )}

      <PrimaryButton type="submit" className="w-full" loading={isLoading}>
        {isLoading ? 'Processing...' : 'Complete Purchase'}
      </PrimaryButton>

      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
        This is a demo checkout. No real payment processing occurs.
      </p>
    </form>
  );
}
```

- [ ] **Step 2: Verify component compiles**

---

### Task 11: Create Products Page

**Files:**
- Create: `src/app/products/page.tsx`

- [ ] **Step 1: Write products catalog page**

```typescript
// src/app/products/page.tsx
import { Metadata } from 'next';
import ProductCard from '@/components/ecommerce/ProductCard';
import { PRODUCTS } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Products | QuizLab',
  description: 'Explore premium QuizLab products and features',
};

export default function ProductsPage() {
  const categories = Array.from(
    new Set(PRODUCTS.map((p) => p.category))
  ).sort();

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Premium Products
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Unlock advanced features and tools to enhance your quiz experience. Each product is
            designed to provide value and help you get the most out of QuizLab.
          </p>
        </div>

        {/* Products by Category */}
        {categories.map((category) => {
          const categoryProducts = PRODUCTS.filter((p) => p.category === category);
          const categoryTitle = category
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          return (
            <div key={category} className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {categoryTitle}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify page structure and metadata**

---

### Task 12: Create Checkout Page

**Files:**
- Create: `src/app/checkout/page.tsx`

- [ ] **Step 1: Write checkout page with cart review and form**

```typescript
// src/app/checkout/page.tsx
'use client';

import { Metadata } from 'next';
import { redirect, useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import CheckoutForm from '@/components/ecommerce/CheckoutForm';
import OrderSummary from '@/components/ecommerce/OrderSummary';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalRaw, taxRaw, totalRaw, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect to products if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your cart is empty
          </h1>
          <Link href="/products">
            <PrimaryButton>Browse Products</PrimaryButton>
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckoutSubmit = async (data: { name: string; email: string }) => {
    setIsProcessing(true);
    try {
      // Call mock checkout API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          subtotal: subtotalRaw,
          tax: taxRaw,
          total: totalRaw,
          customerName: data.name,
          customerEmail: data.email,
        }),
      });

      if (!response.ok) throw new Error('Order creation failed');

      const order = await response.json();
      clearCart();
      router.push(`/order-confirmation?orderId=${order.id}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
        >
          <ChevronLeft size={20} />
          Continue Shopping
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Checkout Form */}
          <div className="order-2 md:order-1">
            <CheckoutForm onSubmit={handleCheckoutSubmit} isLoading={isProcessing} />
          </div>

          {/* Right: Order Summary */}
          <div className="order-1 md:order-2">
            <OrderSummary
              items={items}
              subtotal={subtotalRaw}
              tax={taxRaw}
              total={totalRaw}
              showDetails={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify page compiles**

Note: This is a client component to handle the cart state. The metadata would need to be in a parent layout if needed.

---

### Task 13: Create Order Confirmation Page

**Files:**
- Create: `src/app/order-confirmation/page.tsx`

- [ ] **Step 1: Write order confirmation page with receipt**

```typescript
// src/app/order-confirmation/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Order } from '@/types/ecommerce';
import OrderSummary from '@/components/ecommerce/OrderSummary';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import Link from 'next/link';
import { Check, Download, Share2 } from 'lucide-react';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error('Order not found');

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 dark:text-red-400 mb-6">{error || 'Order not found'}</p>
          <Link href="/products">
            <PrimaryButton>Back to Products</PrimaryButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100/50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50 mb-4">
            <Check size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Thank you for your purchase. A confirmation email has been sent.
          </p>
        </div>

        {/* Order ID Card */}
        <div className="rounded-lg border border-gray-200/50 dark:border-white/20 bg-gray-100/50 dark:bg-white/5 backdrop-blur-xl p-6 mb-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Order ID</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono break-all">
            {order.id}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Order Summary */}
          <div>
            <OrderSummary
              items={order.items}
              subtotal={order.subtotal}
              tax={order.tax}
              total={order.total}
              showDetails={true}
            />
          </div>

          {/* Customer Info */}
          <div className="rounded-lg border border-gray-200/50 dark:border-white/20 bg-gray-100/50 dark:bg-white/5 backdrop-blur-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Customer Details</h3>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
              <p className="text-gray-900 dark:text-white">{order.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-white break-all">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-gray-900 dark:text-white capitalize font-semibold">
                {order.status}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <PrimaryButton icon={<Download size={20} />}>Download Receipt</PrimaryButton>
          <PrimaryButton variant="outline" icon={<Share2 size={20} />}>
            Share Order
          </PrimaryButton>
          <Link href="/products" className="flex-1">
            <PrimaryButton className="w-full">Continue Shopping</PrimaryButton>
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 rounded-lg bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This is a demo order. Products will be immediately available in your account. Check your
            email for access details.
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify page compiles**

---

### Task 14: Create Mock Order API Routes

**Files:**
- Create: `src/app/api/orders/route.ts`
- Create: `src/app/api/orders/[orderId]/route.ts`

- [ ] **Step 1: Write POST handler for order creation**

```typescript
// src/app/api/orders/route.ts
import { Order } from '@/types/ecommerce';
import { NextRequest, NextResponse } from 'next/server';

// Mock in-memory order storage (replace with DB later)
const orders = new Map<string, Order>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { items, subtotal, tax, total, customerName, customerEmail } = body;

    if (!items || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const order: Order = {
      id: orderId,
      items,
      subtotal,
      tax,
      total,
      customerName,
      customerEmail,
      createdAt: new Date().toISOString(),
      status: 'completed',
    };

    orders.set(orderId, order);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Write GET handler for individual order**

```typescript
// src/app/api/orders/[orderId]/route.ts
import { orders } from '../route'; // Import mock storage
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    // In production, fetch from database
    // For now, we'll need to modify the route.ts to export orders
    // This is a simplified mock - see next step for better approach

    return NextResponse.json(
      { error: 'Order not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Refactor to use shared storage**

Modify `src/app/api/orders/route.ts` to export the orders map:

```typescript
// src/app/api/orders/route.ts
import { Order } from '@/types/ecommerce';
import { NextRequest, NextResponse } from 'next/server';

// Mock in-memory order storage (replace with Supabase later)
export const orders = new Map<string, Order>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, subtotal, tax, total, customerName, customerEmail } = body;

    if (!items || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const order: Order = {
      id: orderId,
      items,
      subtotal,
      tax,
      total,
      customerName,
      customerEmail,
      createdAt: new Date().toISOString(),
      status: 'completed',
    };

    orders.set(orderId, order);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
```

Then update `[orderId]/route.ts`:

```typescript
// src/app/api/orders/[orderId]/route.ts
import { orders } from '../route';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const order = orders.get(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Test API endpoints**

```bash
# Test POST order creation
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "premium-reports", "quantity": 1, "priceAtAdd": 999}],
    "subtotal": 999,
    "tax": 100,
    "total": 1099,
    "customerName": "John Doe",
    "customerEmail": "john@example.com"
  }'

# Response should include order ID
```

Expected: Returns order object with ID and status "completed"

---

### Task 15: Create SalesMetrics Component for Admin

**Files:**
- Create: `src/components/admin/SalesMetrics.tsx`

- [ ] **Step 1: Write sales metrics card for admin dashboard**

```typescript
// src/components/admin/SalesMetrics.tsx
'use client';

import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface SalesMetricsProps {
  orders?: Array<{ total: number; createdAt: string }>;
}

export default function SalesMetrics({ orders = [] }: SalesMetricsProps) {
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return {
      totalRevenue: `$${(totalRevenue / 100).toFixed(2)}`,
      totalOrders,
      avgOrderValue: `$${(avgOrderValue / 100).toFixed(2)}`,
    };
  }, [orders]);

  const kpis = [
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: metrics.totalRevenue,
      color: 'from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-900/5',
      borderColor: 'border-green-200/50 dark:border-green-800/50',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      icon: ShoppingCart,
      label: 'Orders',
      value: metrics.totalOrders.toString(),
      color: 'from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/5',
      borderColor: 'border-blue-200/50 dark:border-blue-800/50',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: TrendingUp,
      label: 'Avg Order Value',
      value: metrics.avgOrderValue,
      color: 'from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/5',
      borderColor: 'border-purple-200/50 dark:border-purple-800/50',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className={`rounded-lg border ${kpi.borderColor} bg-gradient-to-br ${kpi.color} backdrop-blur-xl p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              </div>
              <Icon size={32} className={kpi.textColor} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify component compiles**

---

### Task 16: Create RecentTransactions Component for Admin

**Files:**
- Create: `src/components/admin/RecentTransactions.tsx`

- [ ] **Step 1: Write recent transactions table**

```typescript
// src/components/admin/RecentTransactions.tsx
'use client';

import { Order } from '@/types/ecommerce';
import { formatPrice } from '@/lib/products';
import { format } from 'date-fns';
import { CheckCircle, Clock } from 'lucide-react';

interface RecentTransactionsProps {
  orders?: Order[];
}

export default function RecentTransactions({ orders = [] }: RecentTransactionsProps) {
  const recentOrders = orders.slice(0, 10);

  return (
    <div className="rounded-lg border border-gray-200/50 dark:border-white/20 bg-gray-100/50 dark:bg-white/5 backdrop-blur-xl p-6 overflow-hidden">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Transactions</h3>

      {recentOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No orders yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200/50 dark:border-white/20">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Items
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Amount
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-white/20">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-gray-900 dark:text-white font-mono text-xs">
                    {order.id.substring(0, 12)}...
                  </td>
                  <td className="py-4 px-4 text-gray-900 dark:text-white">
                    <div>
                      <p className="font-semibold">{order.customerName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{order.items.length}</td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {order.status === 'completed' ? (
                        <>
                          <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                            Completed
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                          <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                            Pending
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs">
                    {format(new Date(order.createdAt), 'MMM dd, HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify component compiles**

---

### Task 17: Update Admin Dashboard to Show Sales Data

**Files:**
- Modify: `src/app/admin/analytics/page.tsx`

- [ ] **Step 1: Add SalesMetrics and RecentTransactions imports and sections**

Add these imports at the top:
```typescript
import SalesMetrics from '@/components/admin/SalesMetrics';
import RecentTransactions from '@/components/admin/RecentTransactions';
import { orders } from '@/app/api/orders/route';
```

Find the section where you render KPI cards and add after them:

```tsx
{/* Sales Section */}
<div className="mt-12">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sales</h2>
  <SalesMetrics orders={Array.from(orders.values())} />
  <RecentTransactions orders={Array.from(orders.values())} />
</div>
```

- [ ] **Step 2: Verify page compiles without errors**

---

### Task 18: Install Zustand Dependency (if needed)

**Files:**
- None (dependency only)

- [ ] **Step 1: Check if zustand is installed**

Run:
```bash
cd "/c/Users/LENOVO/Desktop/PROYECTO WEB MONETIZATION" && npm list zustand 2>&1 | head -5
```

If not found, install:
```bash
npm install zustand
```

- [ ] **Step 2: Verify installation**

Run:
```bash
npm list zustand
```

Expected: Shows zustand version (e.g., `zustand@4.x.x`)

---

### Task 19: Full System Integration Test

**Files:**
- None (testing existing components)

- [ ] **Step 1: Start development server**

Run:
```bash
cd "/c/Users/LENOVO/Desktop/PROYECTO WEB MONETIZATION" && npm run dev
```

Expected: Server starts on port 3000

- [ ] **Step 2: Test products page**

Open: `http://localhost:3000/products`

Expected:
- Page loads with 5 products displayed
- Products grouped by category
- Each product shows emoji, name, description, features, price, and "Add" button

- [ ] **Step 3: Test add to cart**

Click "Add" on any product

Expected:
- Button shows "Added!" briefly
- Cart icon in sidebar shows badge with count
- Button changes to "In Cart"

- [ ] **Step 4: Test cart sidebar**

Click cart icon in sidebar

Expected:
- Sidebar opens from right with products listed
- Shows quantity controls
- Shows subtotal, tax, total
- "Proceed to Checkout" button visible

- [ ] **Step 5: Test checkout flow**

Click "Proceed to Checkout"

Expected:
- Navigates to `/checkout`
- Shows order summary on right
- Shows checkout form on left
- Form requires name and email

- [ ] **Step 6: Test form validation**

Try submitting form without data

Expected:
- Shows error messages for empty fields
- Submit button stays disabled

- [ ] **Step 7: Test successful checkout**

Fill form with valid data and submit

Expected:
- Shows processing state
- Redirects to confirmation page with order ID
- Shows order summary and customer details
- Cart is cleared

- [ ] **Step 8: Test admin dashboard**

Navigate to `/admin/analytics`

Expected:
- Shows Sales section with metrics
- Recent Transactions table shows the order you just created
- Order details match what was entered

---

### Task 20: Final Commit and Cleanup

**Files:**
- Multiple (from previous tasks)

- [ ] **Step 1: Review all changes**

Run:
```bash
cd "/c/Users/LENOVO/Desktop\PROYECTO WEB MONETIZATION" && git status
```

Expected: Shows all new files for e-commerce feature

- [ ] **Step 2: Add all files**

```bash
git add src/types/ecommerce.ts src/store/cartStore.ts src/hooks/useCart.ts src/lib/products.ts src/components/ecommerce/ src/app/products/ src/app/checkout/ src/app/order-confirmation/ src/app/api/orders/ src/components/admin/SalesMetrics.tsx src/components/admin/RecentTransactions.tsx
```

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: implement cart & checkout flow with mock orders and admin integration

- Add Zustand cart store with localStorage persistence
- Create product catalog with mock data (5 products across 5 categories)
- Implement products page with category filtering
- Build checkout flow (products → cart → checkout form → confirmation)
- Add mock order API endpoints (/api/orders)
- Create OrderSummary and CheckoutForm components
- Integrate cart icon with badge into sidebar
- Add SalesMetrics and RecentTransactions for admin dashboard
- Include form validation and error handling
- Ready for real payment gateway integration"
```

- [ ] **Step 4: Verify no build errors**

Run:
```bash
npm run build
```

Expected: Build completes successfully

- [ ] **Step 5: Verify tests pass (if any)**

Run:
```bash
npm test
```

Expected: All tests pass or no tests found (depending on your setup)

---

## Spec Coverage Verification

✅ **Products structure** - Task 2 (PRODUCTS array with all 5 products, prices, emojis)
✅ **Cart features** - Task 3, 4, 7 (add/remove, quantity, calculations)
✅ **Cart icon** - Task 6 (icon with badge in sidebar)
✅ **Products page** - Task 11 (`/products` with catalog and category filters)
✅ **Checkout page** - Task 12 (`/checkout` with cart review and form)
✅ **Order confirmation** - Task 13 (`/order-confirmation` with receipt and order ID)
✅ **Admin integration** - Task 15, 16, 17 (sales metrics, revenue, transactions table)
✅ **Mock checkout** - Task 14 (mock order API, no real gateway)
✅ **Ready for upgrades** - Easy to swap mock handler for real Stripe/PayPal later

---

## Next Steps After Implementation

1. **Persistence:** Replace in-memory `orders` Map with Supabase database
2. **Stripe Integration:** Swap mock checkout for real Stripe payment handler
3. **Email Notifications:** Send order confirmation emails via SendGrid
4. **Product Management:** Move products to database, add admin product editor
5. **Analytics:** Track purchase events for revenue reporting

---

**Plan complete and saved to `docs/superpowers/plans/2026-06-03-cart-checkout-implementation.md`.**

## Execution Options

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task with review checkpoints between tasks for fast iteration and quality gates

**2. Inline Execution** - Execute tasks sequentially in this session using superpowers:executing-plans, batch with checkpoints

**Which approach would you prefer?**