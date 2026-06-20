# Supabase Manual Testing Guide

**Purpose**: Test database functionality after migrations  
**Date**: 2026-06-03

---

## Quick Tests

### Test 1: Verify All Tables Exist

Run in Supabase SQL Editor:

```sql
SELECT 
  table_name,
  'Table exists' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'users', 'tests', 'sessions', 'results', 'activity_logs',
  'user_roles', 'carts', 'orders', 'order_items'
)
ORDER BY table_name;
```

**Expected Output** (9 rows):
```
activity_logs  | Table exists
carts          | Table exists
order_items    | Table exists
orders         | Table exists
results        | Table exists
sessions       | Table exists
tests          | Table exists
user_roles     | Table exists
users          | Table exists
```

---

### Test 2: Verify Table Structure

#### Check Users Table
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Expected columns**: id, email, full_name, avatar_url, provider, created_at, display_name, first_name, last_name, bio, is_email_verified, is_active, last_login_at

#### Check Orders Table
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
```

**Expected columns**: id, user_id, total_price, status, payment_method, customer_name, customer_email, created_at, updated_at

---

### Test 3: Check Constraints

```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'orders'
ORDER BY constraint_type;
```

**Expected constraints**:
- `orders_pkey` (PRIMARY KEY)
- `orders_user_id_fkey` (FOREIGN KEY)
- `orders_status_check` (CHECK)
- `orders_payment_method_check` (CHECK)

---

### Test 4: Verify Indexes

```sql
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

**Expected indexes**: 10+ indexes starting with `idx_`

---

### Test 5: Check RLS Policies

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected**: Multiple RLS policies per table with PERMISSIVE or RESTRICTIVE

---

## Data Insertion Tests

### Test 6: Insert Test User (Manual)

```sql
-- Create a test user manually (requires raw SQL, not RLS-constrained)
INSERT INTO public.users (id, email, full_name, display_name, provider)
VALUES (
  gen_random_uuid(),
  'test@example.com',
  'Test User',
  'Test User',
  'email'
)
RETURNING id, email, created_at;
```

**Expected**: New user record returned

---

### Test 7: Insert Cart for User

Use the user ID from Test 6:

```sql
INSERT INTO public.carts (user_id, items, total_price, item_count)
VALUES (
  'USER_ID_FROM_TEST_6',
  '[
    {
      "id": "prod-1",
      "title": "Test Product",
      "price": 2999,
      "quantity": 1
    }
  ]'::jsonb,
  2999,
  1
)
RETURNING id, user_id, item_count, total_price;
```

**Expected**: New cart record with items and total price

---

### Test 8: Create an Order

```sql
INSERT INTO public.orders (
  user_id,
  total_price,
  status,
  payment_method,
  customer_name,
  customer_email
)
VALUES (
  'USER_ID_FROM_TEST_6',
  2999,
  'completed',
  'card',
  'Test User',
  'test@example.com'
)
RETURNING id, user_id, total_price, status, created_at;
```

**Expected**: New order with generated ID (format: ORD-2026-xxxxxxxx)

---

### Test 9: Add Order Items

Use the order ID from Test 8:

```sql
INSERT INTO public.order_items (order_id, product_id, product_title, product_price, quantity)
VALUES 
  ('ORDER_ID_FROM_TEST_8', 'prod-1', 'Test Product', 2999, 1),
  ('ORDER_ID_FROM_TEST_8', 'prod-2', 'Another Product', 1999, 2)
RETURNING id, order_id, product_id, quantity, product_price;
```

**Expected**: Two order items created

---

### Test 10: Create User Role

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_FROM_TEST_6', 'user')
ON CONFLICT (user_id) DO NOTHING
RETURNING id, user_id, role, assigned_at;
```

**Expected**: User role record (or no change if already exists)

---

## Query Tests

### Test 11: Get Complete Order with Items

```sql
SELECT 
  o.id,
  o.user_id,
  o.customer_name,
  o.total_price,
  o.status,
  o.created_at,
  COUNT(oi.id) as item_count,
  SUM(oi.quantity) as total_quantity
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
WHERE o.id = 'ORDER_ID_FROM_TEST_8'
GROUP BY o.id, o.user_id, o.customer_name, o.total_price, o.status, o.created_at;
```

**Expected**: Order with aggregated item information

---

### Test 12: Get User's Orders

```sql
SELECT 
  o.id,
  o.total_price,
  o.status,
  o.created_at,
  COUNT(oi.id) as items
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
WHERE o.user_id = 'USER_ID_FROM_TEST_6'
GROUP BY o.id
ORDER BY o.created_at DESC;
```

**Expected**: All orders for test user

---

### Test 13: Get User's Cart Content

```sql
SELECT 
  id,
  user_id,
  items,
  total_price,
  item_count,
  updated_at
FROM public.carts
WHERE user_id = 'USER_ID_FROM_TEST_6';
```

**Expected**: Cart with JSON items array

---

### Test 14: Check User Roles

```sql
SELECT 
  ur.user_id,
  ur.role,
  u.email,
  u.display_name,
  ur.assigned_at
FROM public.user_roles ur
JOIN public.users u ON ur.user_id = u.id
WHERE ur.user_id = 'USER_ID_FROM_TEST_6';
```

**Expected**: User with assigned role

---

## RLS Policy Tests

These tests verify that Row Level Security policies work correctly.

### Test 15: Test RLS - User Can't See Others' Orders

```sql
-- This test requires switching to a different user's context
-- In production with auth, a user would only see their own orders

SELECT id, user_id, total_price
FROM public.orders
WHERE user_id != 'USER_ID_FROM_TEST_6'
LIMIT 1;
```

**Expected with RLS**: No rows returned (RLS blocks access)
**Expected without RLS**: Rows returned (data visible)

---

### Test 16: Verify User Role Uniqueness

```sql
-- Try to insert duplicate user_role (should fail due to UNIQUE constraint)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_FROM_TEST_6', 'admin');
```

**Expected Error**: `duplicate key value violates unique constraint "user_roles_user_id_key"`

---

### Test 17: Verify Cart Uniqueness

```sql
-- Try to insert second cart for same user (should fail)
INSERT INTO public.carts (user_id)
VALUES ('USER_ID_FROM_TEST_6');
```

**Expected Error**: `duplicate key value violates unique constraint "carts_user_id_key"`

---

## Trigger Tests

### Test 18: Test Auto-Trigger on New User

When a new user signs up via Supabase Auth:

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. Create user
5. Check if:

```sql
-- User created in public.users
SELECT id, email FROM public.users WHERE email = 'newuser@example.com';

-- Role created in public.user_roles  
SELECT user_id, role FROM public.user_roles WHERE user_id = (
  SELECT id FROM public.users WHERE email = 'newuser@example.com'
);

-- Cart created
SELECT user_id FROM public.carts WHERE user_id = (
  SELECT id FROM public.users WHERE email = 'newuser@example.com'
);
```

**Expected**: 3 records returned (user, role, cart created automatically)

---

## Performance Tests

### Test 19: Index Usage

Check that indexes are being used:

```sql
EXPLAIN ANALYZE
SELECT * FROM public.orders 
WHERE user_id = 'USER_ID_FROM_TEST_6'
ORDER BY created_at DESC;
```

**Expected**: Plan should use `idx_orders_user_id` index

---

### Test 20: Large Dataset Simulation

```sql
-- Count orders by status (tests index efficiency)
SELECT 
  status,
  COUNT(*) as count
FROM public.orders
GROUP BY status;
```

**Expected**: Query completes quickly even with many orders

---

## Cleanup (Optional)

To clean up test data:

```sql
-- Delete test user and all related data (cascading deletes)
DELETE FROM public.users 
WHERE email = 'test@example.com';

-- Verify deletion
SELECT COUNT(*) as remaining_orders
FROM public.orders
WHERE user_id NOT IN (SELECT id FROM public.users);
```

**Expected**: All related orders, carts, roles deleted automatically

---

## Troubleshooting

### Issue: "permission denied for schema public"

**Solution**: 
- Use Supabase dashboard (not raw psql)
- Ensure service role key is used for admin operations

### Issue: "violates row-level security policy"

**Solution**:
- Expected for user data access
- Shows RLS is working correctly

### Issue: "duplicate key value violates unique constraint"

**Solution**:
- Expected when re-running migrations
- Migrations use `CREATE TABLE IF NOT EXISTS`

### Issue: Indexes not showing

**Solution**:
- Indexes may be auto-created by Supabase
- Not critical for functionality
- Verify with query performance

---

## Next Steps

After all tests pass:

1. ✅ Proceed with authentication implementation
2. ✅ Implement API endpoints for cart/order operations
3. ✅ Add payment integration
4. ✅ Test e2e user flow

---

## Test Results Log

| Test # | Name | Status | Notes |
|--------|------|--------|-------|
| 1 | Verify Tables Exist | [ ] | |
| 2 | Verify Table Structure | [ ] | |
| 3 | Check Constraints | [ ] | |
| 4 | Verify Indexes | [ ] | |
| 5 | Check RLS Policies | [ ] | |
| 6 | Insert Test User | [ ] | |
| 7 | Insert Cart | [ ] | |
| 8 | Create Order | [ ] | |
| 9 | Add Order Items | [ ] | |
| 10 | Create User Role | [ ] | |
| 11 | Get Order with Items | [ ] | |
| 12 | Get User Orders | [ ] | |
| 13 | Get User Cart | [ ] | |
| 14 | Check User Roles | [ ] | |
| 15 | Test RLS Access | [ ] | |
| 16 | Verify Role Uniqueness | [ ] | |
| 17 | Verify Cart Uniqueness | [ ] | |
| 18 | Test Auth Trigger | [ ] | |
| 19 | Index Usage | [ ] | |
| 20 | Performance Query | [ ] | |

**Overall Status**: [ ] ALL PASSED [ ] SOME FAILED

**Date Tested**: ___________  
**Tested By**: ___________

