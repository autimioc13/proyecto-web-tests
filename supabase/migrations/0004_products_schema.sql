-- FASE 11: Products Table Migration
-- Created: 2026-06-19
-- Purpose: Persist the product catalog in Supabase so the admin panel
--          can manage products (CRUD) instead of using mock data.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== products table ==========
-- Mirrors the Product type in src/types/products.ts plus admin
-- management fields (stock, is_active).
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN (
    'personality-report',
    'learning-course',
    'certificate',
    'premium-bundle',
    'api-access'
  )),
  price INTEGER NOT NULL CHECK (price >= 0), -- in USD cents
  image TEXT DEFAULT '',
  features JSONB DEFAULT '[]'::jsonb,
  target_audience TEXT DEFAULT 'all',
  estimated_value TEXT DEFAULT '',
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== Indexes ==========
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- ========== updated_at trigger ==========
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

-- ========== Row Level Security ==========
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read active products
DROP POLICY IF EXISTS "products_select_active" ON public.products;
CREATE POLICY "products_select_active" ON public.products
  FOR SELECT USING (is_active = true);

-- Admins can read all products (active or not)
DROP POLICY IF EXISTS "products_admin_select_all" ON public.products;
CREATE POLICY "products_admin_select_all" ON public.products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert products
DROP POLICY IF EXISTS "products_admin_insert" ON public.products;
CREATE POLICY "products_admin_insert" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update products
DROP POLICY IF EXISTS "products_admin_update" ON public.products;
CREATE POLICY "products_admin_update" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete products
DROP POLICY IF EXISTS "products_admin_delete" ON public.products;
CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ========== Seed: existing static catalog (src/lib/products.ts) ==========
-- Digital products: stock set high (effectively unlimited).
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
