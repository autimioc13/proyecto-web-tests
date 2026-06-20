# Supabase & Database Migrations Setup Guide

**Status**: PHASE 8 - E-Commerce Database Implementation  
**Date**: 2026-06-03  
**Project**: QuizLab Web Monetization

---

## Overview

This guide covers setting up and executing Supabase database migrations for the QuizLab e-commerce system. The project uses two migration files:

1. **0001_quizlab_schema.sql** - Core QuizLab features (tests, sessions, results, activity logs)
2. **0002_ecommerce_schema.sql** - E-commerce features (carts, orders, user roles)

---

## Prerequisites Check ✓

### Environment Configuration

The following Supabase credentials are already configured in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://jiwhzltsaieitkvtsyfr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Status**: ✅ Already Configured

---

## Migration Files Location

```
supabase/
├── migrations/
│   ├── 0001_quizlab_schema.sql       [Existing - Core features]
│   └── 0002_ecommerce_schema.sql     [New - E-commerce features]
```

---

## Execution Steps

### Step 1: Access Supabase SQL Editor

1. Go to https://app.supabase.com/
2. Select your project: **jiwhzltsaieitkvtsyfr**
3. Navigate to **SQL Editor** (left sidebar)
4. Create a new query

### Step 2: Execute Migrations

Execute the migrations in order:

#### A. Run 0001_quizlab_schema.sql

This migration creates core QuizLab tables:
- `public.users` - User profiles
- `public.tests` - Test references
- `public.sessions` - Test sessions
- `public.results` - Test results
- `public.activity_logs` - User activity tracking

**File**: `supabase/migrations/0001_quizlab_schema.sql`

**Action**: 
- Copy the entire SQL content
- Paste into Supabase SQL Editor
- Click "Run" button
- Verify no errors appear

#### B. Run 0002_ecommerce_schema.sql

This migration creates e-commerce tables:
- `public.user_roles` - User role assignment (user, admin, moderator)
- `public.carts` - Shopping carts
- `public.orders` - Customer orders
- `public.order_items` - Items in orders

**File**: `supabase/migrations/0002_ecommerce_schema.sql`

**Action**:
- Copy the entire SQL content
- Paste into Supabase SQL Editor
- Click "Run" button
- Verify no errors appear

---

## Tables Created

### Core Tables (Migration 1)

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User profiles | id, email, full_name, avatar_url, provider |
| `tests` | Test metadata | id, title, category_id, question_count |
| `sessions` | Active test sessions | id, user_id, test_id, answers, status |
| `results` | Completed test results | id, user_id, test_id, score, grade |
| `activity_logs` | User activity tracking | id, user_id, activity_type, details |

### E-Commerce Tables (Migration 2)

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `user_roles` | Role assignment | id, user_id, role (user/admin/moderator) |
| `carts` | Shopping carts | id, user_id, items (JSON), total_price |
| `orders` | Completed orders | id, user_id, total_price, status, payment_method |
| `order_items` | Items in orders | id, order_id, product_id, quantity |

---

## Indexes Created

All tables have performance indexes:

```sql
idx_user_roles_user_id
idx_carts_user_id
idx_orders_user_id
idx_orders_created_at
idx_order_items_order_id
idx_order_items_product_id
```

---

## Row Level Security (RLS) Policies

### User Access Rules

| Table | Policy | Effect |
|-------|--------|--------|
| `users` | Own profile only | Users read/write only their data |
| `user_roles` | Own role + admin | Users see own role, admins see all |
| `carts` | Own cart only | Users manage their shopping cart |
| `orders` | Own orders + admin | Users see own orders, admins see all |
| `order_items` | Own orders only | Users see items from their orders |

### RLS Status

```
✅ users - ENABLED
✅ user_roles - ENABLED
✅ carts - ENABLED
✅ orders - ENABLED
✅ order_items - ENABLED
✅ sessions - ENABLED
✅ results - ENABLED
✅ activity_logs - ENABLED
✅ tests - ENABLED
```

---

## Triggers & Functions

### Automatic User Setup on Signup

Trigger: `on_auth_user_created`  
Function: `handle_new_user()`

**What it does:**
- Creates user profile in `public.users`
- Assigns "user" role in `public.user_roles`
- Creates empty cart in `public.carts`

Trigger: `on_auth_user_created_ecommerce`  
Function: `handle_new_user_ecommerce()`

**What it does:**
- Creates user role if missing
- Creates cart if missing
- Used as backup/supplement

---

## Verification Checklist

After running migrations, verify all tables exist:

### Via Supabase Dashboard

1. **Check Tables**:
   - Go to **Database** → **Tables**
   - Verify these exist:
     - [ ] public.users
     - [ ] public.tests
     - [ ] public.sessions
     - [ ] public.results
     - [ ] public.activity_logs
     - [ ] public.user_roles
     - [ ] public.carts
     - [ ] public.orders
     - [ ] public.order_items

2. **Check Indexes**:
   - Go to **Database** → **Indexes**
   - Verify performance indexes created

3. **Check Policies**:
   - Go to **Database** → **Tables** → select table
   - Check **RLS** tab shows policies enabled

### Via SQL Query

Run this in SQL Editor to verify all tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected output:
```
activity_logs
carts
order_items
orders
results
sessions
tests
user_roles
users
```

---

## Extensions Enabled

The following PostgreSQL extensions are enabled:

- `uuid-ossp` - UUID generation
- `pgcrypto` - Cryptographic functions

---

## Error Handling

### Common Issues

**Issue**: Column already exists
```
ERROR: column "xxx" of relation "public.users" already exists
```
**Solution**: This is expected if running migrations multiple times. Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`

**Issue**: Permission denied
```
ERROR: permission denied for schema public
```
**Solution**: Use a Supabase account with admin rights

**Issue**: Trigger already exists
```
ERROR: trigger "xxx" for table "xxx" already exists
```
**Solution**: Migrations include `DROP TRIGGER IF EXISTS` to handle re-runs

---

## Database Connection String

For server-side operations:

```
postgresql://postgres:[PASSWORD]@db.jiwhzltsaieitkvtsyfr.supabase.co:5432/postgres
```

**Note**: Use `SUPABASE_SERVICE_ROLE_KEY` for API authentication instead

---

## Next Steps

After migration completion:

1. ✅ **Test User Signup**
   - Create test user via auth
   - Verify user/role/cart created automatically

2. ✅ **Test E-Commerce Features**
   - Add items to cart
   - Create order
   - Verify RLS policies work

3. ✅ **Test Admin Features**
   - Assign admin role
   - Verify admin can read all orders

4. ✅ **Run Build**
   ```bash
   npm run build
   ```

5. ✅ **Deploy to Production**
   - Same migrations apply
   - RLS policies protect data
   - Ready for payment integration

---

## Files Modified

- ✅ Created: `supabase/migrations/0002_ecommerce_schema.sql`
- ✅ Verified: `.env.local` has all required Supabase credentials
- ✅ Verified: Supabase project is active and accessible

---

## Support

For detailed e-commerce implementation:
- See: `docs/DUAL_SIDEBAR_SYSTEM_PLAN.md`
- See: `docs/FASE_8_COMPLETE_MIGRATION.sql`

For QuizLab feature details:
- See: `supabase/migrations/0001_quizlab_schema.sql`

---

**Status**: 🟢 Ready for Migration Execution
