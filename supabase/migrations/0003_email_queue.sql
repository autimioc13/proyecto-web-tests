-- FASE 10: Email Notifications - Email Queue Table
-- Created: 2026-06-03
-- Purpose: Store email queue for processing with retry logic

-- ========== email_queue table ==========
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  template TEXT NOT NULL CHECK (template IN (
    'order_confirmation',
    'signup_welcome',
    'payment_success',
    'payment_failed'
  )),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== Indexes for performance ==========
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON public.email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_template ON public.email_queue(template);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON public.email_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_queue_pending ON public.email_queue(status, retry_count)
  WHERE status = 'pending';

-- ========== Enable Row Level Security (RLS) ==========
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- ========== RLS Policies ==========

-- email_queue: Users can read their own email queue
CREATE POLICY "email_queue_select_own" ON public.email_queue
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- email_queue: Admins can read all email queues
CREATE POLICY "email_queue_admin_read_all" ON public.email_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ========== Trigger to update updated_at ==========
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
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_queue_timestamp();
