'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/products';
import { Cart, CartItem } from '@/types/products';
import { useAuth } from './AuthContext';
import { createClient } from '@supabase/supabase-js';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function createEmptyCart(): Cart {
  return {
    items: [],
    totalPrice: 0,
    itemCount: 0,
    lastUpdated: new Date(),
  };
}

function calculateCartTotals(items: CartItem[]): { totalPrice: number; itemCount: number } {
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { totalPrice, itemCount };
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>(createEmptyCart());
  const [loading, setLoading] = useState(true);

  // Load cart from database on mount or when user changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (!user) {
          // Not logged in, use localStorage as fallback
          const saved = localStorage.getItem('quizlab-cart-guest');
          if (saved) {
            const data = JSON.parse(saved);
            setCart({
              ...data,
              items: data.items.map((item: any) => ({
                ...item,
                addedAt: new Date(item.addedAt),
              })),
              lastUpdated: new Date(data.lastUpdated),
            });
          }
          setLoading(false);
          return;
        }

        // Logged in, load from database
        const { data, error } = await supabase
          .from('carts')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

        if (data) {
          const items = (data.items as any[]).map((item) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          }));
          const { totalPrice, itemCount } = calculateCartTotals(items);
          setCart({
            items,
            totalPrice,
            itemCount,
            lastUpdated: new Date(data.updated_at),
          });
        } else {
          setCart(createEmptyCart());
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
        setCart(createEmptyCart());
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Save cart to database or localStorage
  const saveCart = async (newCart: Cart) => {
    try {
      if (!user) {
        // Guest user, save to localStorage
        localStorage.setItem('quizlab-cart-guest', JSON.stringify({
          items: newCart.items,
          totalPrice: newCart.totalPrice,
          itemCount: newCart.itemCount,
          lastUpdated: newCart.lastUpdated.toISOString(),
        }));
        return;
      }

      // Logged in user, save to database
      const cartData = {
        user_id: user.id,
        items: newCart.items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          addedAt: item.addedAt.toISOString(),
        })),
        total_price: newCart.totalPrice,
        item_count: newCart.itemCount,
      };

      await supabase
        .from('carts')
        .upsert(cartData, { onConflict: 'user_id' });
    } catch (err) {
      console.error('Failed to save cart:', err);
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.items.find((item) => item.product.id === product.id);

      let newItems: CartItem[];
      if (existingItem) {
        newItems = prevCart.items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
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
      const newCart = {
        items: newItems,
        totalPrice,
        itemCount,
        lastUpdated: new Date(),
      };

      saveCart(newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.product.id !== productId);
      const { totalPrice, itemCount } = calculateCartTotals(newItems);
      const newCart = {
        items: newItems,
        totalPrice,
        itemCount,
        lastUpdated: new Date(),
      };

      saveCart(newCart);
      return newCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) => {
      if (quantity <= 0) return prevCart;

      const newItems = prevCart.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );

      const { totalPrice, itemCount } = calculateCartTotals(newItems);
      const newCart = {
        items: newItems,
        totalPrice,
        itemCount,
        lastUpdated: new Date(),
      };

      saveCart(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    const newCart = createEmptyCart();
    saveCart(newCart);
    setCart(newCart);
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
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
