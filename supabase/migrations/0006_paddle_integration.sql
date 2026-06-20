-- FASE 13: Paddle (Merchant of Record) integration
-- Created: 2026-06-19
-- Purpose: Track Paddle webhook events (idempotency/audit) and link orders to
--          their Paddle transaction. Paddle handles charging, currency and tax;
--          our orders/order_items remain the internal record of truth.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Link an order to the Paddle transaction that paid for it
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paddle_transaction_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_paddle_transaction_id
  ON public.orders(paddle_transaction_id);

-- ========== paddle_events table (idempotency + audit trail) ==========
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

-- Only admins can read events; inserts/updates happen via the service role
-- (which bypasses RLS), so no public write policy is created.
DROP POLICY IF EXISTS "paddle_events_admin_read_all" ON public.paddle_events;
CREATE POLICY "paddle_events_admin_read_all" ON public.paddle_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
