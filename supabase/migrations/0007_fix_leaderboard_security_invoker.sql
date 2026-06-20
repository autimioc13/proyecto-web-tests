-- Fix: Supabase "Security Definer View" advisory on public.user_leaderboard
-- Created: 2026-06-20
--
-- Views run with the view owner's privileges (SECURITY DEFINER behavior) by
-- default, bypassing the querying user's RLS. We switch to security_invoker so
-- the view respects the caller's RLS.
--
-- Safe to apply: the underlying tables (user_stats, quiz_completions) already
-- expose public SELECT policies, so the leaderboard remains visible to everyone.

ALTER VIEW public.user_leaderboard SET (security_invoker = on);
