-- QuizLab FASE 4 schema - Run in Supabase SQL Editor
-- Auth tables (auth.users) already exist. We create public tables + RLS.

-- ========== users (1:1 profile mirror with auth.users) ==========
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  provider    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== tests (reference only) ==========
CREATE TABLE IF NOT EXISTS public.tests (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  category_id  TEXT NOT NULL,
  question_count INT DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== sessions ==========
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

-- ========== results ==========
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

-- ========== activity_logs ==========
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

-- ========== Indexes ==========
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_results_user ON public.results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_completed ON public.results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_logs(user_id);

-- ========== RLS Enable ==========
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests         ENABLE ROW LEVEL SECURITY;

-- ========== RLS Policies ==========

-- users: owner can read/update own
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- sessions: owner only
CREATE POLICY "sessions_select_own" ON public.sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sessions_insert_own" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions_update_own" ON public.sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- results: owner only
CREATE POLICY "results_select_own" ON public.results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "results_insert_own" ON public.results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- activity_logs: own logs only
CREATE POLICY "activity_logs_select_own" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "activity_logs_insert_own" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- tests: public read
CREATE POLICY "tests_select_all" ON public.tests
  FOR SELECT USING (TRUE);

-- Enable realtime for results table
ALTER PUBLICATION supabase_realtime ADD TABLE public.results;
