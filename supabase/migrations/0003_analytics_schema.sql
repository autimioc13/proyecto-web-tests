-- FASE 12: Analytics Backend Migration
-- Created: 2026-06-03
-- Purpose: Add comprehensive analytics and monetization tracking tables

-- ========== Enable extensions ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== events table - Track all user interactions ==========
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'quiz_started',
      'quiz_completed',
      'result_viewed',
      'product_viewed',
      'order_created',
      'ad_impression',
      'quiz_abandoned',
      'quiz_restarted',
      'quiz_shared',
      'product_added_to_cart',
      'cart_viewed',
      'checkout_started'
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

-- ========== analytics_sessions table - Track user sessions ==========
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

-- ========== monetization_log table - Aggregate daily metrics ==========
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

-- ========== conversion_funnel table - Track user journey ==========
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

-- ========== Indexes for performance ==========
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

-- ========== Enable Row Level Security (RLS) ==========
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monetization_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_funnel ENABLE ROW LEVEL SECURITY;

-- ========== RLS Policies ==========

-- events: Users can read their own events, admins can read all
CREATE POLICY "events_select_own" ON public.events
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "events_insert_own" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "events_admin_read_all" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- analytics_sessions: Users can read their own sessions, admins can read all
CREATE POLICY "analytics_sessions_select_own" ON public.analytics_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "analytics_sessions_insert_own" ON public.analytics_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "analytics_sessions_admin_read_all" ON public.analytics_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- monetization_log: Admins only
CREATE POLICY "monetization_log_admin_read" ON public.monetization_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "monetization_log_admin_insert" ON public.monetization_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- conversion_funnel: Users can read their own funnel, admins can read all
CREATE POLICY "conversion_funnel_select_own" ON public.conversion_funnel
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "conversion_funnel_insert_own" ON public.conversion_funnel
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "conversion_funnel_admin_read_all" ON public.conversion_funnel
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ========== Triggers for automatic updates ==========

-- Trigger: Auto-update conversion_funnel when events occur
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

-- Trigger: Update analytics_sessions event count
CREATE OR REPLACE FUNCTION public.update_session_event_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.analytics_sessions
  SET
    events_count = events_count + 1,
    updated_at = NOW()
  WHERE session_id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_event_count ON public.events;

CREATE TRIGGER on_event_count
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_session_event_count();
