-- FASE 8: Complete Database Migration Scripts
-- Apply migrations in order (1-7)
-- Each migration should be in its own timestamped folder in prisma/migrations/

-- ============================================================================
-- MIGRATION 1: User Profiles
-- File: prisma/migrations/[timestamp]_add_user_profiles/migration.sql
-- ============================================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  provider VARCHAR(50), -- 'google', 'github', 'email'
  bio TEXT,
  phone VARCHAR(20),
  country VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255) UNIQUE,
  verification_token_expires_at TIMESTAMP,
  password_reset_token VARCHAR(255) UNIQUE,
  password_reset_token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  last_login_at TIMESTAMP,

  CONSTRAINT valid_provider CHECK (provider IN ('google', 'github', 'email'))
);

-- Create indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_verification_token ON public.users(verification_token);
CREATE INDEX idx_users_password_reset_token ON public.users(password_reset_token);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read own profile
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Users can update own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policy: Service role can manage all profiles
CREATE POLICY "Service role can manage all profiles" ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policy: Anyone can insert (for signup)
CREATE POLICY "Anyone can insert user profile" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');


-- ============================================================================
-- MIGRATION 2: User Roles (RBAC)
-- File: prisma/migrations/[timestamp]_add_user_roles/migration.sql
-- ============================================================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'user', 'admin', 'moderator'
  assigned_at TIMESTAMP DEFAULT now(),
  assigned_by UUID REFERENCES public.users(id),

  CONSTRAINT valid_role CHECK (role IN ('user', 'admin', 'moderator')),
  UNIQUE(user_id, role)
);

-- Create indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own roles
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Admins can read all roles
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role can manage all roles
CREATE POLICY "Service role can manage all roles" ON public.user_roles
  FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- MIGRATION 3: Database Carts
-- File: prisma/migrations/[timestamp]_add_database_carts/migration.sql
-- ============================================================================

CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]', -- [{productId, quantity, addedAt}]
  total_price BIGINT DEFAULT 0, -- in cents
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_carts_user_id ON public.carts(user_id);
CREATE INDEX idx_carts_updated_at ON public.carts(updated_at);

-- Enable RLS
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read own cart
CREATE POLICY "Users can read own cart" ON public.carts
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update own cart
CREATE POLICY "Users can update own cart" ON public.carts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert own cart
CREATE POLICY "Users can insert own cart" ON public.carts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Service role manages all carts
CREATE POLICY "Service role manages all carts" ON public.carts
  FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- MIGRATION 4: Orders
-- File: prisma/migrations/[timestamp]_add_orders/migration.sql
-- ============================================================================

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  total_price BIGINT NOT NULL, -- in cents
  payment_method VARCHAR(50), -- 'stripe', 'paypal', 'mock'
  payment_intent_id VARCHAR(255), -- Stripe PI ID
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,

  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- Create indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_payment_intent_id ON public.orders(payment_intent_id);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read own orders
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role manages all orders
CREATE POLICY "Service role manages all orders" ON public.orders
  FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- MIGRATION 5: Order Items
-- File: prisma/migrations/[timestamp]_add_order_items/migration.sql
-- ============================================================================

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  product_category VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price BIGINT NOT NULL, -- in cents
  subtotal BIGINT NOT NULL, -- quantity * unit_price
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read own order items
CREATE POLICY "Users can read own order items" ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- RLS Policy: Service role manages all order items
CREATE POLICY "Service role manages all order items" ON public.order_items
  FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- MIGRATION 6: Purchases (Downloads)
-- File: prisma/migrations/[timestamp]_add_purchases/migration.sql
-- ============================================================================

CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  product_id VARCHAR(255) NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  download_url TEXT, -- S3 or similar
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP,
  expires_at TIMESTAMP, -- NULL = never expires
  license_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT now(),

  UNIQUE(order_id, product_id)
);

-- Create indexes
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_product_id ON public.purchases(product_id);
CREATE INDEX idx_purchases_created_at ON public.purchases(created_at);
CREATE INDEX idx_purchases_license_key ON public.purchases(license_key);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read own purchases
CREATE POLICY "Users can read own purchases" ON public.purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update own purchases
CREATE POLICY "Users can update own purchases" ON public.purchases
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Service role manages all purchases
CREATE POLICY "Service role manages all purchases" ON public.purchases
  FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- MIGRATION 7: Audit Logs
-- File: prisma/migrations/[timestamp]_add_audit_logs/migration.sql
-- ============================================================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action VARCHAR(100) NOT NULL, -- 'login', 'logout', 'profile_update', 'order_created', etc.
  resource_type VARCHAR(100), -- 'user', 'order', 'cart', etc.
  resource_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(50), -- 'success', 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs(resource_type);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can read all audit logs
CREATE POLICY "Admins can read all audit logs" ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role manages all audit logs
CREATE POLICY "Service role manages all audit logs" ON public.audit_logs
  FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- MIGRATION 8 (OPTIONAL): Enable Realtime on Tables
-- File: prisma/migrations/[timestamp]_enable_realtime/migration.sql
-- ============================================================================

-- Enable Realtime on purchases (so users see new downloads)
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchases;

-- Enable Realtime on orders (for admin dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable Realtime on user_roles (for permission updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;


-- ============================================================================
-- MANUAL SETUP (Not in migration)
-- ============================================================================
-- These need to be done manually in Supabase UI:

-- 1. Create Supabase Auth providers:
--    - Enable Email/Password in Supabase Console
--    - Add Google OAuth (settings from Google Cloud)
--    - Add GitHub OAuth (settings from GitHub)

-- 2. Configure Auth Redirect URLs:
--    - http://localhost:3000/auth/callback (development)
--    - https://yourdomain.com/auth/callback (production)

-- 3. Create email templates (optional):
--    - Confirmation email
--    - Password reset email
--    - Magic link email

-- 4. Enable Row Level Security:
--    - Go to each table in Supabase Console
--    - Verify RLS is ON
--    - Verify policies are applied

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify migrations applied correctly:

-- Check all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check table row counts
SELECT
  'users' as table_name, COUNT(*) FROM public.users
  UNION ALL
SELECT 'user_roles', COUNT(*) FROM public.user_roles
  UNION ALL
SELECT 'carts', COUNT(*) FROM public.carts
  UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
  UNION ALL
SELECT 'order_items', COUNT(*) FROM public.order_items
  UNION ALL
SELECT 'purchases', COUNT(*) FROM public.purchases
  UNION ALL
SELECT 'audit_logs', COUNT(*) FROM public.audit_logs;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('users', 'user_roles', 'carts', 'orders', 'order_items', 'purchases', 'audit_logs')
ORDER BY tablename;

-- Check policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;


-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If you get "permission denied for schema public"
-- Run as postgres superuser first, then grant permissions:
-- GRANT USAGE ON SCHEMA public TO postgres;
-- GRANT USAGE ON SCHEMA public TO authenticated;
-- GRANT USAGE ON SCHEMA public TO anon;

-- If RLS policies not applying:
-- 1. Verify policy syntax is correct
-- 2. Ensure RLS is enabled on table
-- 3. Check auth.uid() is available
-- 4. Test with service_role_key first (bypasses RLS)

-- If migrations fail:
-- 1. Check Supabase logs for detailed error
-- 2. Try rolling back: npx prisma migrate resolve --rolled-back [migration_name]
-- 3. Fix the migration SQL
-- 4. Re-run: npx prisma migrate deploy

-- ============================================================================
-- END OF MIGRATIONS
-- ============================================================================

