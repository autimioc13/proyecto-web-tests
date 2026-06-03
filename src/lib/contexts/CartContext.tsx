// src/lib/contexts/CartContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/products';
import { Cart, CartItem } from '@/types/products';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'quizlab-cart';

/**
 * Initialize empty cart
 */
function createEmptyCart(): Cart {
  return {
    items: [],
    totalPrice: 0,
    itemCount: 0,
    lastUpdated: new Date(),
  };
}

/**
 * Calculate cart totals
 */
function calculateCartTotals(items: CartItem[]): { totalPrice: number; itemCount: number } {
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { totalPrice, itemCount };
}

/**
 * Serialize cart for localStorage
 */
function serializeCart(cart: Cart): string {
  return JSON.stringify({
    items: cart.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      addedAt: item.addedAt.toISOString(),
    })),
    totalPrice: cart.totalPrice,
    itemCount: cart.itemCount,
    lastUpdated: cart.lastUpdated.toISOString(),
  });
}

/**
 * Deserialize cart from localStorage
 */
function deserializeCart(json: string): Cart {
  try {
    const data = JSON.parse(json);
    return {
      items: data.items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
        addedAt: new Date(item.addedAt),
      })),
      totalPrice: data.totalPrice,
      itemCount: data.itemCount,
      lastUpdated: new Date(data.lastUpdated),
    };
  } catch (error) {
    console.error('Failed to deserialize cart:', error);
    return createEmptyCart();
  }
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(createEmptyCart());
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCart(deserializeCart(saved));
    }
    setIsHydrated(true);
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, serializeCart(cart));
    }
  }, [cart, isHydrated]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      // Check if product already in cart
      const existingItem = prevCart.items.find((item) => item.product.id === product.id);

      let newItems: CartItem[];
      if (existingItem) {
        // Update quantity
        newItems = prevCart.items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [
          ...prevCart.items,
          {
            product,
            quantity,
            addedAt: new Date(),
          },
        ];
      }

      const { totalPrice, itemCount } = calculateCartTotals(newItems);
      return {
        items: newItems,
        totalPrice,
        itemCount,
        lastUpdated: new Date(),
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.product.id !== productId);
      const { totalPrice, itemCount } = calculateCartTotals(newItems);
      return {
        items: newItems,
        totalPrice,
        itemCount,
        lastUpdated: new Date(),
      };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) => {
      if (quantity <= 0) {
        return prevCart;
      }

      const newItems = prevCart.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );

      const { totalPrice, itemCount } = calculateCartTotals(newItems);
      return {
        items: newItems,
        totalPrice,
        itemCount,
        lastUpdated: new Date(),
      };
    });
  };

  const clearCart = () => {
    setCart(createEmptyCart());
  };

  const getTotalItems = () => cart.itemCount;
  const getTotalPrice = () => cart.totalPrice;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
