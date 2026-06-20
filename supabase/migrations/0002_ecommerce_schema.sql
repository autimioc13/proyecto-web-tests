-- FASE 8: E-Commerce Tables Migration
-- Created: 2026-06-03
-- Purpose: Add tables for cart, orders, and order management

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== Enhance users table with e-commerce fields ==========
-- Add missing fields to public.users if they don't exist
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- ========== user_roles table (for admin/moderator management) ==========
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- ========== carts table (replace localStorage) ==========
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  items JSONB DEFAULT '[]'::jsonb,
  total_price INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== orders table ==========
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || SUBSTR(MD5(RANDOM()::TEXT || NOW()::TEXT), 1, 8),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_price INTEGER NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('card', 'paypal', 'mock')),
  customer_name TEXT,
  customer_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== order_items table ==========
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_title TEXT,
  product_price INTEGER,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== Indexes for performance ==========
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ========== Enable Row Level Security (RLS) ==========
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ========== RLS Policies ==========

-- user_roles: users can read their own role, admins can read all
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_roles_admin_read_all" ON public.user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- carts: Users can read their own cart
CREATE POLICY "carts_select_own" ON public.carts
  FOR SELECT USING (auth.uid() = user_id);

-- carts: Users can update their own cart
CREATE POLICY "carts_update_own" ON public.carts
  FOR UPDATE USING (auth.uid() = user_id);

-- carts: Users can insert their own cart
CREATE POLICY "carts_insert_own" ON public.carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- orders: Users can read their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- orders: Users can insert orders
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- orders: Admins can read all orders
CREATE POLICY "orders_admin_read_all" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- order_items: Users can read items from their own orders
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- order_items: Users can insert items in their orders
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- ========== Trigger to create user_roles and cart on signup ==========
CREATE OR REPLACE FUNCTION public.handle_new_user_ecommerce()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default user role if doesn't exist
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;

  -- Create empty cart for user if doesn't exist
  INSERT INTO public.carts (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created_ecommerce ON auth.users;

-- Create trigger to run on auth signup
CREATE TRIGGER on_auth_user_created_ecommerce
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_ecommerce();
