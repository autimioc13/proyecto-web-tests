-- Fix: "infinite recursion detected in policy for relation user_roles"
-- Created: 2026-06-20
--
-- The policy "user_roles_admin_read_all" selected FROM user_roles inside a
-- policy defined ON user_roles, which Postgres rejects as infinite recursion.
-- This broke the profile query (users JOIN user_roles), leaving the client
-- without a user and causing redirect/loading issues.
--
-- Admin-wide reads happen server-side via the service role key (bypasses RLS),
-- so this policy is unnecessary. Users can still read their OWN role via
-- "user_roles_select_own".

DROP POLICY IF EXISTS "user_roles_admin_read_all" ON public.user_roles;
