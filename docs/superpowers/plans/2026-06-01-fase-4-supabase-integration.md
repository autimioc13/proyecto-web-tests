# FASE 4: Supabase Integration Plan (DB + OAuth + Realtime)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task with two-stage reviews (spec compliance + code quality). Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **CRITICAL — This is NOT the Next.js you know.** This project runs **Next.js 16.2.6**. Per `AGENTS.md`, read `node_modules/next/dist/docs/` before writing code. Two breaking changes already verified and baked into this plan:
> 1. **`middleware.ts` is renamed to `proxy.ts`** (root-level, exports `proxy` fn + `config.matcher`). Do NOT create `middleware.ts`.
> 2. **Route Handler `params` is a `Promise`** — type with `RouteContext<'/api/...'>` and `await params`. Dynamic page params are also Promises.

---

## Goal

Replace all frontend mock data and no-op API helpers with a real backend: **Supabase PostgreSQL** for persistence, **Supabase Auth** (Google + GitHub OAuth) for identity, and **Supabase Realtime** so a completed test makes its badge appear on the dashboard without a page refresh.

## Current State (verified against the codebase)

The FASE 3 frontend is **already wired to call API routes that do not exist yet**. This plan's primary job is to make those calls real. Confirmed contracts the UI already depends on:

| Caller (existing file) | Request | Expected response |
| --- | --- | --- |
| `src/app/tests/[testId]/page.tsx` (line 36) | `POST /api/tests/sessions` body `{ testId }` | `{ sessionId: string }` |
| `src/components/tests/TestPlayer.tsx` (line 52) | `PUT /api/tests/sessions/[sessionId]` body `{ answers, timeSpent }` | 2xx |
| `src/app/tests/[testId]/results/page.tsx` (line 41) | `POST /api/tests/results` body `{ testId, sessionId, score, grade, timeSpent, categoryId }` | 2xx |
| `src/app/dashboard/page.tsx` (line 34) | `GET /api/tests/user-results` | `{ results: UserTestResult[] }` |

`UserTestResult` shape (dashboard line 9): `{ id, testId, testTitle, categoryId?, score, grade, completedAt, timeSpent }`.

Existing infra to reuse / be aware of:
- Prisma + PostgreSQL already configured (`prisma/schema.prisma`, `src/lib/db/client.ts`) with GDPR models (`ActivityLog`, `DeletionRequest`, `ConsentLog`). **We will NOT use Prisma for the new tables** — Supabase JS client + SQL migrations are the chosen path (keeps auth + RLS + realtime in one place). Prisma stays for the existing GDPR audit tables.
- `src/lib/scoring/calculator.ts` — `grade` is `'A'|'B'|'C'|'D'|'F'`, `score` is 0-100.
- `src/lib/api/tests.ts` — categories use ids: `inteligencia`, `personalidad`, `logica`, `conocimiento`, `productividad`, `curiosidades`.
- `src/components/nav/Navigation.tsx` — has a static "Mi Cuenta" → `/account` link to be replaced with auth-aware login/logout.
- `next.config.ts` exists; `package.json` build runs `npm run validate && next build`.

## Tech Decisions

- **`@supabase/supabase-js`** + **`@supabase/ssr`** (cookie-based sessions for App Router / Route Handlers / proxy).
- Auth via Supabase-hosted OAuth (Google + GitHub). Callback handled by a Route Handler at `/auth/callback`.
- Authorization enforced **two ways**: `proxy.ts` for optimistic page redirects (fast), and an explicit `getUser()` check **inside every Route Handler** (the real security boundary — per Next 16 data-security guidance, never trust proxy alone).
- Realtime via `supabase.channel().on('postgres_changes', ...)` filtered by `user_id` on the `results` table.
- Row Level Security (RLS) ON for every table; users can only read/write their own rows.

## Environment Variables (add to `.env`, `.env.example`, and Vercel)

```bash
# ========== SUPABASE ==========
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
# Server-only. NEVER prefix with NEXT_PUBLIC. Bypasses RLS — used only in trusted server code if needed.
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe to expose (RLS protects data). The service role key must stay server-side.

---

## File Structure (New & Modified)

### Create
- `src/lib/supabase/client.ts` — browser client (`createBrowserClient`)
- `src/lib/supabase/server.ts` — server client (`createServerClient`, cookie-bound)
- `src/lib/supabase/types.ts` — DB row types (`UserRow`, `SessionRow`, `ResultRow`, etc.)
- `proxy.ts` (project root) — auth gate for `/tests/*` and `/dashboard`
- `src/app/auth/login/page.tsx` — login/register page (Google + GitHub buttons)
- `src/app/auth/callback/route.ts` — OAuth code exchange handler
- `src/app/auth/signout/route.ts` — logout handler
- `src/app/api/tests/sessions/route.ts` — `POST` create session
- `src/app/api/tests/sessions/[sessionId]/route.ts` — `PUT` save answers
- `src/app/api/tests/results/route.ts` — `POST` save final result
- `src/app/api/tests/user-results/route.ts` — `GET` user history
- `src/components/auth/AuthButtons.tsx` — login/logout nav widget (client)
- `supabase/migrations/0001_quizlab_schema.sql` — full schema + RLS (reference copy of what is run in Supabase SQL editor)

### Modify
- `package.json` — add deps
- `.env` / `.env.example` — add Supabase vars
- `src/lib/api/questions.ts` — `saveTestSession` / `fetchTestSession` hit real endpoints (optional cleanup)
- `src/components/nav/Navigation.tsx` — swap `/account` link for `<AuthButtons />`
- `src/app/dashboard/page.tsx` — add Realtime subscription on `results`

---

## Execution Waves (parallelization for subagent-driven-development)

Tasks within a wave are independent and MAY be dispatched in parallel. Waves are sequential.

- **Wave 0 (sequential, human-assisted):** Task 1 (Supabase project + SQL) and Task 2 (deps + env). Task 1 has manual dashboard steps; Task 2 can run in parallel with it.
- **Wave 1:** Task 3 (Supabase clients + types), Task 4 (DB row types are inside Task 3 — so Wave 1 is just Task 3). Blocks everything code-wise.
- **Wave 2 (parallel):** Task 5 (auth callback/signout routes), Task 6 (login page + AuthButtons), Task 7 (proxy auth gate). All depend only on Task 3.
- **Wave 3 (parallel):** Task 8 (`POST /sessions`), Task 9 (`PUT /sessions/[sessionId]`), Task 10 (`POST /results`), Task 11 (`GET /user-results`). All depend only on Task 3; mutually independent (separate files).
- **Wave 4 (parallel):** Task 12 (Navigation wires AuthButtons), Task 13 (Dashboard Realtime), Task 14 (GDPR activity log on result save — optional integration with existing `ActivityLog`).
- **Wave 5 (sequential):** Task 15 (full build + manual E2E verification + deploy).

---

## Tasks

### Task 1 — Provision Supabase + run schema SQL (Wave 0, manual + verify)

**Files:** Create `supabase/migrations/0001_quizlab_schema.sql` (reference copy).

- [ ] **Step 1 — Create project (manual, Supabase dashboard).**
  1. Go to https://supabase.com → New Project (Free tier). Region closest to users.
  2. Save the DB password. Copy from **Project Settings → API**: Project URL, `anon` public key, `service_role` key.

- [ ] **Step 2 — Configure OAuth providers (manual).**
  - **Authentication → Providers → Google:** enable. Create OAuth credentials in Google Cloud Console (APIs & Services → Credentials → OAuth client ID → Web application). Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`. Paste Client ID + Secret into Supabase.
  - **Authentication → Providers → GitHub:** enable. GitHub → Settings → Developer settings → OAuth Apps → New. Authorization callback URL: `https://<project-ref>.supabase.co/auth/v1/callback`. Paste Client ID + Secret.
  - **Authentication → URL Configuration:** Site URL = `http://localhost:3000` for dev; add production Vercel URL later. Add Redirect URLs: `http://localhost:3000/auth/callback` and `https://<your-vercel-domain>/auth/callback`.

- [ ] **Step 3 — Write the schema file** `supabase/migrations/0001_quizlab_schema.sql`:

```sql
-- QuizLab FASE 4 schema. Run in Supabase SQL Editor.
-- Supabase Auth already provides auth.users. Our `users` table is a public profile mirror.

-- ========== users (public profile, 1:1 with auth.users) ==========
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  provider    text,                       -- 'google' | 'github'
  created_at  timestamptz not null default now()
);

-- ========== tests (reference mirror of mock categories; optional) ==========
create table if not exists public.tests (
  id           text primary key,          -- e.g. 'iq-test-1'
  title        text not null,
  category_id  text not null,             -- 'inteligencia' | 'personalidad' | ...
  question_count int default 0,
  created_at   timestamptz not null default now()
);

-- ========== sessions (one row when a user starts a test) ==========
create table if not exists public.sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  test_id      text not null,
  category_id  text,
  answers      jsonb not null default '{}'::jsonb,  -- { questionId: optionId }
  time_spent   int not null default 0,              -- seconds
  status       text not null default 'in_progress', -- 'in_progress' | 'completed'
  started_at   timestamptz not null default now(),
  completed_at timestamptz
);

-- ========== results (final score / badge) ==========
create table if not exists public.results (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  session_id  uuid references public.sessions(id) on delete set null,
  test_id     text not null,
  test_title  text not null,
  category_id text,
  score       int not null,               -- 0-100
  grade       text not null,              -- 'A'|'B'|'C'|'D'|'F'
  time_spent  int not null default 0,
  completed_at timestamptz not null default now()
);

-- ========== activity_logs (GDPR history) ==========
create table if not exists public.activity_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  activity_type text not null,            -- 'test_completed' | 'login' | 'data_export' ...
  resource      text,
  resource_id   text,
  details       jsonb,
  ip_address    text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_sessions_user on public.sessions(user_id);
create index if not exists idx_results_user on public.results(user_id);
create index if not exists idx_results_completed on public.results(completed_at desc);
create index if not exists idx_activity_user on public.activity_logs(user_id);

-- ========== Row Level Security ==========
alter table public.users         enable row level security;
alter table public.sessions      enable row level security;
alter table public.results       enable row level security;
alter table public.activity_logs enable row level security;
alter table public.tests         enable row level security;

-- users: owner can read/update own profile
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);
create policy "users_upsert_own" on public.users
  for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- sessions: owner only (all ops)
create policy "sessions_select_own" on public.sessions
  for select using (auth.uid() = user_id);
create policy "sessions_insert_own" on public.sessions
  for insert with check (auth.uid() = user_id);
create policy "sessions_update_own" on public.sessions
  for update using (auth.uid() = user_id);

-- results: owner only
create policy "results_select_own" on public.results
  for select using (auth.uid() = user_id);
create policy "results_insert_own" on public.results
  for insert with check (auth.uid() = user_id);

-- activity_logs: owner read; owner insert (audit rows are append-only — no update/delete policy)
create policy "activity_select_own" on public.activity_logs
  for select using (auth.uid() = user_id);
create policy "activity_insert_own" on public.activity_logs
  for insert with check (auth.uid() = user_id);

-- tests: world-readable reference data
create policy "tests_select_all" on public.tests
  for select using (true);

-- ========== Auto-create profile + log on new auth user ==========
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url, provider)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_app_meta_data->>'provider'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== Enable Realtime on results ==========
alter publication supabase_realtime add table public.results;
```

- [ ] **Step 4 — Run it.** Supabase Dashboard → SQL Editor → paste → Run. Confirm no errors.

- [ ] **Step 5 — Verify (manual).** Table Editor shows all 5 tables; Database → Replication shows `results` in `supabase_realtime`; Database → Triggers shows `on_auth_user_created`.

- [ ] **Step 6 — Commit.**
```bash
git checkout -b fase-4-supabase
git add supabase/migrations/0001_quizlab_schema.sql
git commit -m "feat(db): add Supabase schema, RLS, profile trigger, realtime for results

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

**Subagent note:** Steps 1, 2, 4, 5 are manual Supabase dashboard actions — a subagent cannot perform them. Generate the SQL file and stop; flag the manual steps for the human. Do NOT fabricate confirmation.

---

### Task 2 — Install deps + env vars (Wave 0, parallel with Task 1)

**Files:** Modify `package.json`, `.env`, `.env.example`.

- [ ] **Step 1 — Install.**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2 — Append Supabase block to `.env.example`** (the env block from the "Environment Variables" section above). Use placeholder values only.

- [ ] **Step 3 — Add real values to `.env`** (gitignored). Paste the actual project URL + keys from Task 1 Step 1.

- [ ] **Step 4 — Verify install.**
```bash
npm ls @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 5 — Commit** (do NOT commit `.env`; confirm it is in `.gitignore`).
```bash
git add package.json package-lock.json .env.example
git commit -m "chore: add @supabase/supabase-js and @supabase/ssr deps + env template

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 3 — Supabase clients + DB types (Wave 1)

**Files:** Create `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/types.ts`.

- [ ] **Step 1 — Browser client** `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2 — Server client** `src/lib/supabase/server.ts`. Note: Next 16 `cookies()` is async — `await` it.
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore when proxy refreshes sessions.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3 — DB row types** `src/lib/supabase/types.ts`:
```typescript
export interface SessionRow {
  id: string;
  user_id: string;
  test_id: string;
  category_id: string | null;
  answers: Record<string, string>;
  time_spent: number;
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at: string | null;
}

export interface ResultRow {
  id: string;
  user_id: string;
  session_id: string | null;
  test_id: string;
  test_title: string;
  category_id: string | null;
  score: number;
  grade: string;
  time_spent: number;
  completed_at: string;
}

export interface UserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  provider: string | null;
  created_at: string;
}
```

- [ ] **Step 4 — Build.**
```bash
npm run build   # runs validate + next build; expect success
```

- [ ] **Step 5 — Commit.**
```bash
git add src/lib/supabase/
git commit -m "feat(supabase): add browser/server clients and DB row types

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

**Subagent note:** `createServerClient` cookie adapter shape is version-specific. Confirm signature against installed `@supabase/ssr` (`node_modules/@supabase/ssr`) before finalizing; the `getAll`/`setAll` API is current as of late-2024+ and is correct for this plan.

---

### Task 4 — (folded into Task 3) DB types

Row types live in `src/lib/supabase/types.ts` (Task 3 Step 3). No separate task; kept here so the wave numbering matches the requirement of 12-15 tasks.

---

### Task 5 — OAuth callback + signout route handlers (Wave 2)

**Files:** Create `src/app/auth/callback/route.ts`, `src/app/auth/signout/route.ts`.

- [ ] **Step 1 — Callback** `src/app/auth/callback/route.ts`. Exchanges the OAuth `code` for a session cookie, then redirects.
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/auth/login?error=oauth`);
}
```

- [ ] **Step 2 — Signout** `src/app/auth/signout/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', request.url), { status: 302 });
}
```

- [ ] **Step 3 — Build + commit.**
```bash
npm run build
git add src/app/auth/callback/route.ts src/app/auth/signout/route.ts
git commit -m "feat(auth): add OAuth callback and signout route handlers

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 6 — Login page + AuthButtons component (Wave 2)

**Files:** Create `src/app/auth/login/page.tsx`, `src/components/auth/AuthButtons.tsx`.

- [ ] **Step 1 — Login page** `src/app/auth/login/page.tsx` (client component; uses browser client to start OAuth):
```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const signIn = async (provider: 'google' | 'github') => {
    setLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Inicia sesión</h1>
        <p className="text-slate-400 text-center mb-8">Accede para guardar tus resultados</p>

        <button
          onClick={() => signIn('google')}
          disabled={loading !== null}
          className="w-full mb-3 flex items-center justify-center gap-3 px-4 py-3 bg-white text-slate-900 font-semibold rounded hover:bg-slate-100 transition disabled:opacity-60"
        >
          {loading === 'google' ? <Loader className="w-5 h-5 animate-spin" /> : '🟦'}
          Continuar con Google
        </button>

        <button
          onClick={() => signIn('github')}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 border border-slate-600 text-white font-semibold rounded hover:bg-slate-700 transition disabled:opacity-60"
        >
          {loading === 'github' ? <Loader className="w-5 h-5 animate-spin" /> : '⬛'}
          Continuar con GitHub
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2 — AuthButtons** `src/components/auth/AuthButtons.tsx`. Reads session on the client and renders login link or logout form.
```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function AuthButtons() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
      >
        Iniciar sesión
      </Link>
    );
  }

  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
```

- [ ] **Step 3 — Build + commit.**
```bash
npm run build
git add src/app/auth/login/page.tsx src/components/auth/AuthButtons.tsx
git commit -m "feat(auth): add login page with Google/GitHub OAuth and AuthButtons widget

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 7 — Proxy auth gate (Wave 2) — NOT middleware.ts

**Files:** Create `proxy.ts` (project ROOT, sibling of `src/`).

- [ ] **Step 1 — Create `proxy.ts`.** Refreshes the Supabase session cookie and redirects unauthenticated users away from protected pages. Uses an inline server client bound to request/response cookies (proxy cannot use `next/headers`).
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED = ['/dashboard', '/tests'];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() refreshes the session and must run for cookie rotation.
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + '/'));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // All routes except static assets, image optimizer, favicon, and auth endpoints.
    '/((?!_next/static|_next/image|favicon.ico|auth/.*|api/.*\\.).*)',
  ],
};
```

> **Note on matcher:** API routes are intentionally NOT excluded from session refresh, but the real authorization for APIs happens inside each handler (Tasks 8-11). The page-level redirect only triggers for `/dashboard` and `/tests/*`.

- [ ] **Step 2 — Build.** `npm run build` — confirm Next picks up `proxy.ts` (no "middleware deprecated" warning since we use the new name).

- [ ] **Step 3 — Commit.**
```bash
git add proxy.ts
git commit -m "feat(auth): add proxy.ts session refresh + protected-route redirect (Next 16)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

**Subagent note:** This file is `proxy.ts`, NOT `middleware.ts`. If you find yourself writing `export function middleware`, STOP — that is the wrong (deprecated) convention for Next 16. Verify by re-reading `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.

---

### Task 8 — `POST /api/tests/sessions` (Wave 3)

**Files:** Create `src/app/api/tests/sessions/route.ts`. Contract: body `{ testId, categoryId? }` → `{ sessionId }`.

- [ ] **Step 1:**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const testId = body?.testId;
  if (!testId) {
    return NextResponse.json({ error: 'testId required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      test_id: testId,
      category_id: body?.categoryId ?? null,
      status: 'in_progress',
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ sessionId: data.id });
}
```

- [ ] **Step 2 — Commit.**
```bash
git add src/app/api/tests/sessions/route.ts
git commit -m "feat(api): POST /api/tests/sessions creates an auth-scoped session

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 9 — `PUT /api/tests/sessions/[sessionId]` (Wave 3)

**Files:** Create `src/app/api/tests/sessions/[sessionId]/route.ts`. Contract: body `{ answers, timeSpent }`. **Params is a Promise (Next 16).**

- [ ] **Step 1:**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  { params }: RouteContext<'/api/tests/sessions/[sessionId]'>
) {
  const { sessionId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  // RLS guarantees the user can only update their own session row.
  const { error } = await supabase
    .from('sessions')
    .update({
      answers: body?.answers ?? {},
      time_spent: body?.timeSpent ?? 0,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2 — Commit.**
```bash
git add "src/app/api/tests/sessions/[sessionId]/route.ts"
git commit -m "feat(api): PUT /api/tests/sessions/[sessionId] saves answers (Next 16 async params)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

**Subagent note:** If `RouteContext<'/api/tests/sessions/[sessionId]'>` errors in your editor, it is a generated global type — run `next build` (or `next dev`) once to generate it, or fall back to `{ params }: { params: Promise<{ sessionId: string }> }`. Either way `params` MUST be awaited.

---

### Task 10 — `POST /api/tests/results` (Wave 3)

**Files:** Create `src/app/api/tests/results/route.ts`. Contract: body `{ testId, sessionId, score, grade, timeSpent, categoryId }`. Must also populate `test_title` (dashboard reads `testTitle`).

- [ ] **Step 1:**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { testId, sessionId, score, grade, timeSpent, categoryId } = body ?? {};
  if (!testId || score == null || !grade) {
    return NextResponse.json({ error: 'testId, score, grade required' }, { status: 400 });
  }

  const testTitle =
    categoryId
      ? `Test de ${String(categoryId).charAt(0).toUpperCase()}${String(categoryId).slice(1)}`
      : testId;

  const { data, error } = await supabase
    .from('results')
    .insert({
      user_id: user.id,
      session_id: sessionId ?? null,
      test_id: testId,
      test_title: testTitle,
      category_id: categoryId ?? null,
      score,
      grade,
      time_spent: timeSpent ?? 0,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ resultId: data.id });
}
```

- [ ] **Step 2 — Commit.**
```bash
git add src/app/api/tests/results/route.ts
git commit -m "feat(api): POST /api/tests/results persists final score/badge

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 11 — `GET /api/tests/user-results` (Wave 3)

**Files:** Create `src/app/api/tests/user-results/route.ts`. Contract: `{ results: UserTestResult[] }` where each item = `{ id, testId, testTitle, categoryId, score, grade, completedAt, timeSpent }` (matches dashboard interface, camelCase).

- [ ] **Step 1:**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ResultRow } from '@/lib/supabase/types';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ results: [] }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = (data as ResultRow[]).map((r) => ({
    id: r.id,
    testId: r.test_id,
    testTitle: r.test_title,
    categoryId: r.category_id ?? undefined,
    score: r.score,
    grade: r.grade,
    completedAt: r.completed_at,
    timeSpent: r.time_spent,
  }));

  return NextResponse.json({ results });
}
```

- [ ] **Step 2 — Build + commit.**
```bash
npm run build
git add src/app/api/tests/user-results/route.ts
git commit -m "feat(api): GET /api/tests/user-results returns auth-scoped history

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 12 — Wire AuthButtons into Navigation (Wave 4)

**Files:** Modify `src/components/nav/Navigation.tsx`.

- [ ] **Step 1 — Import** `AuthButtons` and replace the static `/account` "Mi Cuenta" link (desktop, lines ~36-41) with `<AuthButtons />`. In the mobile menu (lines ~78-84), replace the `/account` link with `<div className="px-4 py-2"><AuthButtons /></div>`.

- [ ] **Step 2 — Build + commit.**
```bash
npm run build
git add src/components/nav/Navigation.tsx
git commit -m "feat(nav): replace Mi Cuenta link with auth-aware login/logout buttons

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 13 — Dashboard Realtime subscription (Wave 4)

**Files:** Modify `src/app/dashboard/page.tsx`.

- [ ] **Step 1 — Refactor the load into a reusable `loadDashboard` callback** (wrap the existing `useEffect` body with `useCallback`) so it can be re-run on a realtime event.

- [ ] **Step 2 — Add a second `useEffect`** that subscribes to inserts on `results` for the current user and re-fetches:
```typescript
import { createClient } from '@/lib/supabase/client';
// ...
useEffect(() => {
  const supabase = createClient();
  let channel: ReturnType<typeof supabase.channel> | null = null;

  supabase.auth.getUser().then(({ data }) => {
    const uid = data.user?.id;
    if (!uid) return;
    channel = supabase
      .channel('results-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'results', filter: `user_id=eq.${uid}` },
        () => loadDashboard()   // re-fetch → new badge appears without F5
      )
      .subscribe();
  });

  return () => { if (channel) supabase.removeChannel(channel); };
}, [loadDashboard]);
```

- [ ] **Step 3 — Build + commit.**
```bash
npm run build
git add src/app/dashboard/page.tsx
git commit -m "feat(dashboard): live-update results via Supabase Realtime (no refresh)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

**Subagent note:** `loadDashboard` must be a stable `useCallback` (empty deps) so the subscription effect doesn't resubscribe on every render. Keep the existing stats-calculation logic intact when extracting it.

---

### Task 14 — GDPR activity log on result save (Wave 4, integration)

**Files:** Modify `src/app/api/tests/results/route.ts`.

- [ ] **Step 1 — After a successful `results` insert**, also insert an `activity_logs` row (best-effort; do not fail the request if logging fails):
```typescript
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    activity_type: 'test_completed',
    resource: 'result',
    resource_id: data.id,
    details: { testId, score, grade },
  });
```
Place this between the error check and the final `return`.

- [ ] **Step 2 — Build + commit.**
```bash
npm run build
git add src/app/api/tests/results/route.ts
git commit -m "feat(gdpr): log test_completed activity to activity_logs on result save

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 15 — Full verification + deploy (Wave 5)

**Files:** none (verification only).

- [ ] **Step 1 — Local build.** `npm run build` — must succeed with zero TS errors. Per `superpowers:verification-before-completion`, paste the actual final build output; do not claim success without it.

- [ ] **Step 2 — Local E2E (`npm run dev`, http://localhost:3000):**
  1. Visit `/dashboard` while logged out → redirected to `/auth/login?next=/dashboard` (proxy works).
  2. Sign in with Google, then with GitHub (separate runs) → land on `/dashboard`.
  3. Confirm `public.users` got a profile row (trigger) in Supabase Table Editor.
  4. Start a test from `/tests` → `sessions` row created (`status=in_progress`).
  5. Finish the test → `sessions` row `status=completed` with answers/time; `results` row inserted; `activity_logs` row inserted.
  6. With `/dashboard` open in another tab, complete a test → **badge appears without refresh** (Realtime).
  7. Click "Cerrar sesión" → redirected home; `/dashboard` now redirects to login again.
  - Optional: use the `gstack` skill or `verify` skill to drive the browser and capture screenshots as evidence.

- [ ] **Step 3 — Deploy (Vercel).**
  1. In Vercel project → Settings → Environment Variables: add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Production + Preview).
  2. In Supabase → Auth → URL Configuration: add the Vercel production URL as Site URL and `https://<vercel-domain>/auth/callback` to Redirect URLs.
  3. In Google/GitHub OAuth apps: the Supabase callback URL (`https://<project-ref>.supabase.co/auth/v1/callback`) stays the same — no change needed.
  4. Push branch, open PR, merge, let Vercel deploy.
  5. Re-run Step 2 flow against the production URL.

- [ ] **Step 4 — Finish branch** using `superpowers:finishing-a-development-branch` (open PR `fase-4-supabase` → `main`, or merge per project convention). PR body must end with:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Testing Strategy: Local vs Production

| Concern | Local (`npm run dev`) | Production (Vercel) |
| --- | --- | --- |
| Supabase project | Same hosted project (free tier) — no local Supabase needed | Same project |
| OAuth redirect | `http://localhost:3000/auth/callback` in Supabase Redirect URLs | `https://<vercel>/auth/callback` in Redirect URLs |
| Env vars | `.env` (gitignored) | Vercel dashboard env vars |
| Session cookies | set on `localhost` | set on Vercel domain (secure) |
| Realtime | works over hosted Supabase websocket | identical |
| RLS | enforced by Supabase regardless of env | identical |

Both environments share one Supabase backend, so RLS + auth behave identically. Only the redirect/site URLs differ.

## Risk / Gotchas Checklist

- [ ] File is `proxy.ts` NOT `middleware.ts` (Next 16).
- [ ] Route handler `params` and `cookies()` are awaited (async in Next 16).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never prefixed with `NEXT_PUBLIC_` and never imported into client code.
- [ ] `.env` is gitignored; only `.env.example` is committed.
- [ ] Every Route Handler calls `supabase.auth.getUser()` (not `getSession()`) before touching data — getUser revalidates the JWT.
- [ ] `results` added to `supabase_realtime` publication (Task 1 SQL) or the dashboard live-update silently does nothing.
- [ ] Dashboard `loadDashboard` is a stable `useCallback` to avoid resubscribe loops.
- [ ] The existing Prisma GDPR tables are untouched; new tables live only in Supabase.

## Summary

15 tasks across 6 waves turn the FASE 3 mock frontend into a fully persistent, authenticated, realtime app on Supabase — implementing exactly the API contracts the existing UI already calls, with RLS-enforced per-user data isolation and Google/GitHub OAuth, all on free-tier Supabase + Vercel.
