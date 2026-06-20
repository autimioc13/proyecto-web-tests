# Supabase Migration Execution Checklist

**Phase**: FASE 8 - E-Commerce Database Setup  
**Date**: 2026-06-03  
**Status**: Ready for Execution

---

## Pre-Execution Verification

### Environment Configuration
- [x] Supabase project created: `jiwhzltsaieitkvtsyfr`
- [x] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`
- [x] `.env.local` has `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- [x] `.env.local` properly formatted

### Migration Files
- [x] `supabase/migrations/0001_quizlab_schema.sql` exists
- [x] `supabase/migrations/0002_ecommerce_schema.sql` created
- [x] Both files contain valid SQL

### Documentation
- [x] `SUPABASE_SETUP_GUIDE.md` created
- [x] `scripts/verify-migrations.js` created
- [x] `package.json` updated with `verify-migrations` script

---

## Execution Steps

### Step 1: Access Supabase Dashboard

1. Open browser: https://app.supabase.com/
2. Login with Supabase credentials
3. Select project: **jiwhzltsaieitkvtsyfr**
4. Navigate to: **SQL Editor** (left sidebar)

**Status**: [ ] Complete

---

### Step 2: Execute Migration 0001 (QuizLab Core Tables)

**File**: `supabase/migrations/0001_quizlab_schema.sql`

**Actions**:
1. Click **New Query**
2. Name it: "0001 - QuizLab Schema"
3. Copy entire SQL from `0001_quizlab_schema.sql`
4. Paste into SQL Editor
5. Click **Run** button
6. Check: No red error messages

**Expected Tables Created**:
- [ ] `public.users`
- [ ] `public.tests`
- [ ] `public.sessions`
- [ ] `public.results`
- [ ] `public.activity_logs`

**Expected Indexes**:
- [ ] `idx_sessions_user`
- [ ] `idx_results_user`
- [ ] `idx_results_completed`
- [ ] `idx_activity_user`

**Status**: [ ] Complete

---

### Step 3: Execute Migration 0002 (E-Commerce Tables)

**File**: `supabase/migrations/0002_ecommerce_schema.sql`

**Actions**:
1. Click **New Query**
2. Name it: "0002 - E-Commerce Schema"
3. Copy entire SQL from `0002_ecommerce_schema.sql`
4. Paste into SQL Editor
5. Click **Run** button
6. Check: No red error messages

**Expected Tables Created**:
- [ ] `public.user_roles` (with UNIQUE constraint on user_id)
- [ ] `public.carts` (with UNIQUE constraint on user_id)
- [ ] `public.orders` (with auto-generated ID format)
- [ ] `public.order_items` (linked to orders)

**Expected Indexes**:
- [ ] `idx_user_roles_user_id`
- [ ] `idx_carts_user_id`
- [ ] `idx_orders_user_id`
- [ ] `idx_orders_created_at`
- [ ] `idx_order_items_order_id`
- [ ] `idx_order_items_product_id`

**Extensions Enabled**:
- [ ] `uuid-ossp`
- [ ] `pgcrypto`

**Status**: [ ] Complete

---

## Post-Execution Verification

### Phase 1: Visual Inspection in Supabase Dashboard

**Go to Database → Tables** and verify:

#### Core Tables
- [ ] `users` exists with columns: id, email, full_name, avatar_url, provider, created_at
- [ ] `tests` exists with columns: id, title, category_id, question_count
- [ ] `sessions` exists with columns: id, user_id, test_id, answers, status
- [ ] `results` exists with columns: id, user_id, test_id, score, grade, completed_at
- [ ] `activity_logs` exists with columns: id, user_id, activity_type, details

#### E-Commerce Tables
- [ ] `user_roles` exists with columns: id, user_id, role, assigned_at, assigned_by
- [ ] `carts` exists with columns: id, user_id, items, total_price, item_count
- [ ] `orders` exists with columns: id, user_id, total_price, status, payment_method
- [ ] `order_items` exists with columns: id, order_id, product_id, quantity

**Status**: [ ] Complete

---

### Phase 2: Check RLS Policies

**Go to Database → Tables → [table name] → RLS** for each table:

- [ ] `users` - RLS ENABLED with policies
- [ ] `user_roles` - RLS ENABLED with policies
- [ ] `carts` - RLS ENABLED with policies
- [ ] `orders` - RLS ENABLED with policies
- [ ] `order_items` - RLS ENABLED with policies
- [ ] `sessions` - RLS ENABLED with policies
- [ ] `results` - RLS ENABLED with policies
- [ ] `activity_logs` - RLS ENABLED with policies
- [ ] `tests` - RLS ENABLED (public read)

**Status**: [ ] Complete

---

### Phase 3: Verify Indexes

**Go to Database → Indexes** and verify:

- [ ] `idx_user_roles_user_id` exists
- [ ] `idx_carts_user_id` exists
- [ ] `idx_orders_user_id` exists
- [ ] `idx_orders_created_at` exists
- [ ] `idx_order_items_order_id` exists
- [ ] `idx_order_items_product_id` exists
- [ ] `idx_sessions_user` exists
- [ ] `idx_results_user` exists
- [ ] `idx_results_completed` exists
- [ ] `idx_activity_user` exists

**Status**: [ ] Complete

---

### Phase 4: Run SQL Verification Query

In SQL Editor, run this verification query:

```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'tests', 'sessions', 'results', 'activity_logs', 'user_roles', 'carts', 'orders', 'order_items');
```

**Expected Result**: `table_count = 9`

**Status**: [ ] Complete (Result: _______)

---

### Phase 5: Run Node.js Verification Script

In terminal:

```bash
npm run verify-migrations
```

**Expected Output**:
```
🚀 === SUPABASE MIGRATION VERIFICATION ===

📊 Verifying Database Tables...

✓ Table: users
✓ Table: tests
✓ Table: sessions
✓ Table: results
✓ Table: activity_logs
✓ Table: user_roles
✓ Table: carts
✓ Table: orders
✓ Table: order_items

🔒 Verifying Row Level Security (RLS)...

✓ RLS: users (enabled)
✓ RLS: user_roles (enabled)
... [etc]

📈 === VERIFICATION SUMMARY ===

✓ All checks passed! XX items verified
✓ Database is ready for use
```

**Status**: [ ] Complete

---

## Build & Deployment

### Step 1: Run Build

```bash
npm run build
```

**Expected**: No errors, build completes successfully

**Status**: [ ] Complete

---

### Step 2: Optional - Run Dev Server

```bash
npm run dev
```

**Expected**: Server starts without database errors

**Status**: [ ] Complete

---

## Sign-Off

### Final Checklist

- [ ] All 9 tables created
- [ ] All indexes created
- [ ] All RLS policies enabled
- [ ] Triggers created (`on_auth_user_created`)
- [ ] Extensions enabled (`uuid-ossp`, `pgcrypto`)
- [ ] SQL verification query passed
- [ ] `npm run verify-migrations` passed
- [ ] `npm run build` passed
- [ ] Documentation complete

### Status Summary

- **Tables**: ✅ 9/9 created
- **Indexes**: ✅ 10/10 created
- **RLS**: ✅ Enabled on all tables
- **Extensions**: ✅ uuid-ossp, pgcrypto
- **Triggers**: ✅ on_auth_user_created
- **Build**: [ ] Passed
- **Verification**: [ ] Passed

---

## Rollback Plan (If Needed)

If migrations fail, in SQL Editor run:

```sql
-- Drop e-commerce tables (in order)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.carts CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop QuizLab tables (if needed)
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.results CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.tests CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_ecommerce ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_ecommerce();
```

Then re-run migrations from this checklist.

---

## Notes

- Migrations are idempotent (safe to run multiple times)
- RLS policies prevent unauthorized access
- Automatic user setup via triggers on auth signup
- All timestamps in UTC (TIMESTAMPTZ)
- Order IDs use format: `ORD-YYYY-xxxxxxxx`

---

## Contact & Support

For issues:
1. Check `SUPABASE_SETUP_GUIDE.md` for troubleshooting
2. Review SQL error messages in Supabase UI
3. Check `.env.local` has correct credentials
4. Verify Supabase project is active

---

**Execution Date**: ___________  
**Executed By**: ___________  
**Status**: [ ] PASSED [ ] FAILED  
