-- FASE 9: Stripe Payment Integration Migration
-- Created: 2026-06-03
-- Purpose: Add tables for Stripe payments and webhook event tracking

-- ========== stripe_payments table ==========
CREATE TABLE IF NOT EXISTS public.stripe_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Amount in cents (e.g., 2999 = $29.99)
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

-- ========== stripe_events table (for audit trail and webhook processing) ==========
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

-- ========== Indexes for performance ==========
CREATE INDEX IF NOT EXISTS idx_stripe_payments_user_id ON public.stripe_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_order_id ON public.stripe_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_status ON public.stripe_payments(status);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_stripe_intent ON public.stripe_payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_created_at ON public.stripe_payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_events_stripe_id ON public.stripe_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON public.stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON public.stripe_events(processed);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created_at ON public.stripe_events(created_at DESC);

-- ========== Enable Row Level Security (RLS) ==========
ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- ========== RLS Policies for stripe_payments ==========

-- Users can read their own payments
CREATE POLICY "stripe_payments_select_own" ON public.stripe_payments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "stripe_payments_insert_own" ON public.stripe_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can read all payments
CREATE POLICY "stripe_payments_admin_read_all" ON public.stripe_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ========== RLS Policies for stripe_events ==========

-- Admins can read all events (for auditing)
CREATE POLICY "stripe_events_admin_read_all" ON public.stripe_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can insert events
CREATE POLICY "stripe_events_service_insert" ON public.stripe_events
  FOR INSERT WITH CHECK (true);

-- Service role can update events
CREATE POLICY "stripe_events_service_update" ON public.stripe_events
  FOR UPDATE WITH CHECK (true);

-- ========== Update orders table to include Stripe payment ID ==========
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_payment_id UUID REFERENCES public.stripe_payments(id) ON DELETE SET NULL;

-- Add index for the new column
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_id ON public.orders(stripe_payment_id);

-- ========== Trigger to update order status when payment succeeds ==========
CREATE OR REPLACE FUNCTION public.handle_stripe_payment_success()
RETURNS TRIGGER AS $$
BEGIN
  -- Update order status to 'paid' when payment succeeds
  IF NEW.status = 'succeeded' AND OLD.status != 'succeeded' THEN
    UPDATE public.orders
    SET status = 'completed', stripe_payment_id = NEW.id, updated_at = NOW()
    WHERE id = NEW.order_id AND status = 'pending';
  END IF;

  -- Update order status to 'failed' when payment fails
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    UPDATE public.orders
    SET status = 'failed', updated_at = NOW()
    WHERE id = NEW.order_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_stripe_payment_status_change ON public.stripe_payments;

-- Create trigger to run on stripe_payments update
CREATE TRIGGER on_stripe_payment_status_change
  AFTER UPDATE ON public.stripe_payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_stripe_payment_success();
