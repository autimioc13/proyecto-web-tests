-- =====================================================================
-- QuizLab - Complete idempotent remote setup
-- =====================================================================
-- Safe to run multiple times. Brings a database that only has the base
-- schema (0001) up to date with: e-commerce (0002), Stripe (0003),
-- email queue (0003), analytics (0003) and products (0004).
--
-- Every policy is dropped before being (re)created, tables use
-- IF NOT EXISTS, functions use CREATE OR REPLACE, and triggers are
-- dropped before being recreated, so partial states converge cleanly.
--
-- Paste this whole file into Supabase Dashboard > SQL Editor > Run.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- SECTION 0: Base schema safety net (0001) - tables only, IF NOT EXISTS
-- (auth.users is managed by Supabase Auth and already exists)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  provider    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tests (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  category_id  TEXT NOT NULL,
  question_count INT DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id           UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id      TEXT NOT NULL,
  category_id  TEXT,
  answers      JSONB NOT NULL DEFAULT '{}'::JSONB,
  time_spent   INT NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'in_progress',
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.results (
  id          UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  test_id     TEXT NOT NULL,
  test_title  TEXT NOT NULL,
  category_id TEXT,
  score       INT NOT NULL,
  grade       TEXT NOT NULL,
  time_spent  INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id            UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  resource      TEXT,
  resource_id   TEXT,
  details       JSONB,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_results_user ON public.results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_completed ON public.results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_logs(user_id);

ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests         ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "sessions_select_own" ON public.sessions;
CREATE POLICY "sessions_select_own" ON public.sessions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "sessions_insert_own" ON public.sessions;
CREATE POLICY "sessions_insert_own" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "sessions_update_own" ON public.sessions;
CREATE POLICY "sessions_update_own" ON public.sessions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "results_select_own" ON public.results;
CREATE POLICY "results_select_own" ON public.results FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "results_insert_own" ON public.results;
CREATE POLICY "results_insert_own" ON public.results FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_logs_select_own" ON public.activity_logs;
CREATE POLICY "activity_logs_select_own" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "activity_logs_insert_own" ON public.activity_logs;
CREATE POLICY "activity_logs_insert_own" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "tests_select_all" ON public.tests;
CREATE POLICY "tests_select_all" ON public.tests FOR SELECT USING (TRUE);

-- Realtime publication (ignore if the table is already published)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.results;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =====================================================================
-- SECTION 1: E-commerce schema (0002)
-- =====================================================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  items JSONB DEFAULT '[]'::jsonb,
  total_price INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_title TEXT,
  product_price INTEGER,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_roles_admin_read_all" ON public.user_roles;
CREATE POLICY "user_roles_admin_read_all" ON public.user_roles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

DROP POLICY IF EXISTS "carts_select_own" ON public.carts;
CREATE POLICY "carts_select_own" ON public.carts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "carts_update_own" ON public.carts;
CREATE POLICY "carts_update_own" ON public.carts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "carts_insert_own" ON public.carts;
CREATE POLICY "carts_insert_own" ON public.carts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "orders_admin_read_all" ON public.orders;
CREATE POLICY "orders_admin_read_all" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );
DROP POLICY IF EXISTS "order_items_insert_own" ON public.order_items;
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.handle_new_user_ecommerce()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure the public profile row exists first (FK target for roles/carts)
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.carts (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_ecommerce ON auth.users;
CREATE TRIGGER on_auth_user_created_ecommerce
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_ecommerce();

-- =====================================================================
-- SECTION 2: Stripe integration (0003_stripe_integration)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.stripe_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd' CHECK (currency IN ('usd', 'eur', 'gbp', 'mxn')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_client_secret TEXT,
  error_message TEXT,
  refund_reason TEXT,
  refunded_amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.stripe_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  payment_id UUID REFERENCES public.stripe_payments(id) ON DELETE SET NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_payments_user_id ON public.stripe_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_order_id ON public.stripe_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_status ON public.stripe_payments(status);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_stripe_intent ON public.stripe_payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_created_at ON public.stripe_payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_events_stripe_id ON public.stripe_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON public.stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON public.stripe_events(processed);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created_at ON public.stripe_events(created_at DESC);

ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stripe_payments_select_own" ON public.stripe_payments;
CREATE POLICY "stripe_payments_select_own" ON public.stripe_payments
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "stripe_payments_insert_own" ON public.stripe_payments;
CREATE POLICY "stripe_payments_insert_own" ON public.stripe_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "stripe_payments_admin_read_all" ON public.stripe_payments;
CREATE POLICY "stripe_payments_admin_read_all" ON public.stripe_payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "stripe_events_admin_read_all" ON public.stripe_events;
CREATE POLICY "stripe_events_admin_read_all" ON public.stripe_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "stripe_events_service_insert" ON public.stripe_events;
CREATE POLICY "stripe_events_service_insert" ON public.stripe_events
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "stripe_events_service_update" ON public.stripe_events;
CREATE POLICY "stripe_events_service_update" ON public.stripe_events
  FOR UPDATE WITH CHECK (true);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_payment_id UUID REFERENCES public.stripe_payments(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_id ON public.orders(stripe_payment_id);

CREATE OR REPLACE FUNCTION public.handle_stripe_payment_success()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' AND OLD.status != 'succeeded' THEN
    UPDATE public.orders
    SET status = 'completed', stripe_payment_id = NEW.id, updated_at = NOW()
    WHERE id = NEW.order_id AND status = 'pending';
  END IF;
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    UPDATE public.orders SET status = 'failed', updated_at = NOW() WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_stripe_payment_status_change ON public.stripe_payments;
CREATE TRIGGER on_stripe_payment_status_change
  AFTER UPDATE ON public.stripe_payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_stripe_payment_success();

-- =====================================================================
-- SECTION 3: Email queue (0003_email_queue)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  template TEXT NOT NULL CHECK (template IN ('order_confirmation','signup_welcome','payment_success','payment_failed')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON public.email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_template ON public.email_queue(template);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON public.email_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_queue_pending ON public.email_queue(status, retry_count) WHERE status = 'pending';

ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_queue_select_own" ON public.email_queue;
CREATE POLICY "email_queue_select_own" ON public.email_queue
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "email_queue_admin_read_all" ON public.email_queue;
CREATE POLICY "email_queue_admin_read_all" ON public.email_queue
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE OR REPLACE FUNCTION public.update_email_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_email_queue_update ON public.email_queue;
CREATE TRIGGER on_email_queue_update
  BEFORE UPDATE ON public.email_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_email_queue_timestamp();

-- =====================================================================
-- SECTION 4: Analytics backend (0003_analytics_schema)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'quiz_started','quiz_completed','result_viewed','product_viewed',
      'order_created','ad_impression','quiz_abandoned','quiz_restarted',
      'quiz_shared','product_added_to_cart','cart_viewed','checkout_started',
      'level_up','quiz_question_view'
    )
  ),
  quiz_id TEXT,
  product_id TEXT,
  order_id TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  quiz_count INT DEFAULT 0,
  revenue_micros INT DEFAULT 0,
  page_views INT DEFAULT 0,
  events_count INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.monetization_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  event_type TEXT NOT NULL,
  quiz_id TEXT,
  impression_count INT DEFAULT 0,
  completion_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  conversion_count INT DEFAULT 0,
  cpm_rate DECIMAL(10, 2) DEFAULT 2.50,
  total_revenue_micros INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, event_type, quiz_id)
);

CREATE TABLE IF NOT EXISTS public.conversion_funnel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  step_1_quiz_started TIMESTAMPTZ,
  step_2_quiz_completed TIMESTAMPTZ,
  step_3_result_viewed TIMESTAMPTZ,
  step_4_product_viewed TIMESTAMPTZ,
  step_5_product_added_to_cart TIMESTAMPTZ,
  step_6_checkout_started TIMESTAMPTZ,
  step_7_order_created TIMESTAMPTZ,
  completed_steps INT DEFAULT 0,
  conversion_value_micros INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_quiz_id ON public.events(quiz_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON public.events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_user_created ON public.events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON public.analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON public.analytics_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON public.analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_monetization_log_date ON public.monetization_log(date DESC);
CREATE INDEX IF NOT EXISTS idx_monetization_log_quiz_date ON public.monetization_log(quiz_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_monetization_log_event_type ON public.monetization_log(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_user_id ON public.conversion_funnel(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_session_id ON public.conversion_funnel(session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_created_at ON public.conversion_funnel(created_at DESC);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monetization_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_funnel ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select_own" ON public.events;
CREATE POLICY "events_select_own" ON public.events FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "events_insert_own" ON public.events;
CREATE POLICY "events_insert_own" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "events_admin_read_all" ON public.events;
CREATE POLICY "events_admin_read_all" ON public.events
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "analytics_sessions_select_own" ON public.analytics_sessions;
CREATE POLICY "analytics_sessions_select_own" ON public.analytics_sessions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "analytics_sessions_insert_own" ON public.analytics_sessions;
CREATE POLICY "analytics_sessions_insert_own" ON public.analytics_sessions FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "analytics_sessions_admin_read_all" ON public.analytics_sessions;
CREATE POLICY "analytics_sessions_admin_read_all" ON public.analytics_sessions
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "monetization_log_admin_read" ON public.monetization_log;
CREATE POLICY "monetization_log_admin_read" ON public.monetization_log
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "monetization_log_admin_insert" ON public.monetization_log;
CREATE POLICY "monetization_log_admin_insert" ON public.monetization_log
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "conversion_funnel_select_own" ON public.conversion_funnel;
CREATE POLICY "conversion_funnel_select_own" ON public.conversion_funnel FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "conversion_funnel_insert_own" ON public.conversion_funnel;
CREATE POLICY "conversion_funnel_insert_own" ON public.conversion_funnel FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "conversion_funnel_admin_read_all" ON public.conversion_funnel;
CREATE POLICY "conversion_funnel_admin_read_all" ON public.conversion_funnel
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE OR REPLACE FUNCTION public.update_conversion_funnel()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.conversion_funnel (user_id, session_id)
  VALUES (NEW.user_id, NEW.session_id)
  ON CONFLICT DO NOTHING;

  UPDATE public.conversion_funnel
  SET
    step_1_quiz_started = CASE WHEN NEW.event_type = 'quiz_started' THEN NEW.created_at ELSE step_1_quiz_started END,
    step_2_quiz_completed = CASE WHEN NEW.event_type = 'quiz_completed' THEN NEW.created_at ELSE step_2_quiz_completed END,
    step_3_result_viewed = CASE WHEN NEW.event_type = 'result_viewed' THEN NEW.created_at ELSE step_3_result_viewed END,
    step_4_product_viewed = CASE WHEN NEW.event_type = 'product_viewed' THEN NEW.created_at ELSE step_4_product_viewed END,
    step_5_product_added_to_cart = CASE WHEN NEW.event_type = 'product_added_to_cart' THEN NEW.created_at ELSE step_5_product_added_to_cart END,
    step_6_checkout_started = CASE WHEN NEW.event_type = 'checkout_started' THEN NEW.created_at ELSE step_6_checkout_started END,
    step_7_order_created = CASE WHEN NEW.event_type = 'order_created' THEN NEW.created_at ELSE step_7_order_created END,
    completed_steps = (
      CASE WHEN step_1_quiz_started IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN step_2_quiz_completed IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN step_3_result_viewed IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN step_4_product_viewed IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN step_5_product_added_to_cart IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN step_6_checkout_started IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN step_7_order_created IS NOT NULL THEN 1 ELSE 0 END
    ),
    updated_at = NOW()
  WHERE session_id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_event_created ON public.events;
CREATE TRIGGER on_event_created
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_conversion_funnel();

CREATE OR REPLACE FUNCTION public.update_session_event_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.analytics_sessions
  SET events_count = events_count + 1, updated_at = NOW()
  WHERE session_id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_event_count ON public.events;
CREATE TRIGGER on_event_count
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_session_event_count();

-- =====================================================================
-- SECTION 5: Products (0004_products_schema)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN (
    'personality-report','learning-course','certificate','premium-bundle','api-access'
  )),
  price INTEGER NOT NULL CHECK (price >= 0),
  image TEXT DEFAULT '',
  features JSONB DEFAULT '[]'::jsonb,
  target_audience TEXT DEFAULT 'all',
  estimated_value TEXT DEFAULT '',
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

CREATE OR REPLACE FUNCTION public.set_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_products_updated_at();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_active" ON public.products;
CREATE POLICY "products_select_active" ON public.products
  FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "products_admin_select_all" ON public.products;
CREATE POLICY "products_admin_select_all" ON public.products
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "products_admin_insert" ON public.products;
CREATE POLICY "products_admin_insert" ON public.products
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "products_admin_update" ON public.products;
CREATE POLICY "products_admin_update" ON public.products
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "products_admin_delete" ON public.products;
CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

INSERT INTO public.products
  (id, title, description, category, price, image, features, target_audience, estimated_value, stock, is_active)
VALUES
  ('personality-deep-dive', 'Personality Deep Dive Report',
   'Comprehensive analysis of your personality type with actionable insights for personal growth.',
   'personality-report', 1299, '/products/personality-report.png',
   '["50-page detailed report","Personalized recommendations","Career guidance based on type","Relationship insights"]'::jsonb,
   'all', 'Understand yourself better', 999999, true),
  ('logic-advanced-course', 'Advanced Logic Mastery Course',
   'Master complex logical reasoning with 10+ hours of video content and exercises.',
   'learning-course', 2999, '/products/logic-course.png',
   '["10+ hours of video content","50+ practice problems","Certificate of completion","Lifetime access"]'::jsonb,
   'advanced', 'Save 20 hours of self-study', 999999, true),
  ('intelligence-fundamentals-course', 'Intelligence Fundamentals Course',
   'Build strong foundations in critical thinking and analytical reasoning.',
   'learning-course', 1999, '/products/intelligence-course.png',
   '["8 modules covering core concepts","Interactive quizzes","Downloadable study materials","30-day money-back guarantee"]'::jsonb,
   'beginners', 'Jump 2 levels in IQ tests', 999999, true),
  ('productivity-mastery', 'Productivity Mastery Course',
   'Learn proven systems to increase productivity and achieve your goals faster.',
   'learning-course', 1799, '/products/productivity-course.png',
   '["6-week program","Weekly live Q&A sessions","Templates and tools","Community access"]'::jsonb,
   'all', 'Save 10+ hours per week', 999999, true),
  ('basic-certificate', 'QuizLab Achievement Certificate',
   'Official certificate proving your test achievement, printable and shareable.',
   'certificate', 499, '/products/certificate-basic.png',
   '["Printable PDF","LinkedIn shareable","Valid for 1 year"]'::jsonb,
   'all', 'Boost your profile', 999999, true),
  ('premium-certificate', 'Premium Achievement Certificate',
   'Luxury certificate with enhanced design, perfect for professional portfolios.',
   'certificate', 999, '/products/certificate-premium.png',
   '["Premium design with QR verification","Blockchain certificate option","Digital + printed version","Valid for 3 years"]'::jsonb,
   'all', 'Professional credibility', 999999, true),
  ('knowledge-master-bundle', 'Knowledge Master Bundle',
   '3 advanced courses + premium certificate. Save $20 vs. individual purchase.',
   'premium-bundle', 4999, '/products/bundle-master.png',
   '["Advanced Logic Course","Intelligence Mastery Course","Productivity Course","Premium Certificate","Save $20"]'::jsonb,
   'advanced', 'Everything you need', 999999, true),
  ('serious-learner-bundle', 'Serious Learner Bundle',
   'Perfect for committed learners. 2 courses + personality report.',
   'premium-bundle', 3499, '/products/bundle-learner.png',
   '["Any 2 courses of your choice","Personality Deep Dive Report","Save $10"]'::jsonb,
   'advanced', 'Best for growth', 999999, true),
  ('developer-api-access', 'Developer API Access',
   'Access QuizLab API for integration into your platform. Per month.',
   'api-access', 2999, '/products/api-access.png',
   '["Full REST API access","10,000 requests/month","Webhook support","Tech support"]'::jsonb,
   'advanced', 'Build on QuizLab', 999999, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- DONE. Verify with: SELECT count(*) FROM public.products;  -- expect 9
-- =====================================================================

-- =====================================================================
-- SECTION 6: Paddle integration (0006_paddle_integration)
-- =====================================================================
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paddle_transaction_id TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_paddle_transaction_id
  ON public.orders(paddle_transaction_id);

CREATE TABLE IF NOT EXISTS public.paddle_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paddle_events_event_id ON public.paddle_events(event_id);
CREATE INDEX IF NOT EXISTS idx_paddle_events_type ON public.paddle_events(event_type);
CREATE INDEX IF NOT EXISTS idx_paddle_events_processed ON public.paddle_events(processed);

ALTER TABLE public.paddle_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "paddle_events_admin_read_all" ON public.paddle_events;
CREATE POLICY "paddle_events_admin_read_all" ON public.paddle_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- =====================================================================
-- SECTION 7: Fix leaderboard Security Definer View advisory (0007)
-- Safe: base tables (user_stats, quiz_completions) have public SELECT.
-- Guarded so it doesn't fail if the view doesn't exist yet.
-- =====================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'user_leaderboard' AND n.nspname = 'public' AND c.relkind = 'v'
  ) THEN
    EXECUTE 'ALTER VIEW public.user_leaderboard SET (security_invoker = on)';
  END IF;
END $$;
