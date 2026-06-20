import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazily-created Supabase clients for server-side use.
 *
 * These are Proxies that only instantiate the underlying client on first
 * property access. This means importing a module that uses them NEVER throws
 * at build time ("Collecting page data") when env vars are absent — it only
 * fails if actually used at request time without configuration.
 */
function lazyClient(getKey: () => string | undefined, label: string): SupabaseClient {
  let client: SupabaseClient | null = null;

  const init = (): SupabaseClient => {
    if (!client) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = getKey();
      if (!url || !key) {
        throw new Error(`Supabase ${label} client is not configured (missing env vars)`);
      }
      client = createClient(url, key);
    }
    return client;
  };

  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      const c = init();
      const value = (c as unknown as Record<string | symbol, unknown>)[prop];
      return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(c) : value;
    },
  });
}

/** Service-role client (bypasses RLS). Server-only. */
export const serviceSupabase = lazyClient(
  () => process.env.SUPABASE_SERVICE_ROLE_KEY,
  'service-role'
);

/** Anon client for server-side reads that rely on RLS. */
export const anonSupabase = lazyClient(
  () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'anon'
);
