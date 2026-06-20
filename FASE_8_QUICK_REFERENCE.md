# FASE 8: Quick Reference & Execution Guide

## Overview
Complete production-ready user authentication system with profiles, cart persistence, order management, and admin controls.

---

## Phase Summary

| Phase | Tasks | Duration | Files Created |
|-------|-------|----------|---|
| **Phase 1: Auth Core** | 1-7 | 3 days | AuthContext, Login page, Auth types |
| **Phase 2: Database** | 12 | 1 day | 7 migration files |
| **Phase 3: User Features** | 8-11, 13 | 3 days | Profile, Orders, Protected routes |
| **Phase 4: Production** | 14-20 | 3 days | Email, Payments, Admin, Checkout |
| **Phase 5: Testing** | All | 2 days | Integration tests, E2E |

---

## Critical Files (Execution Order)

### TIER 1: Must Create First
```
src/lib/supabase/types.ts (Task 1)
src/lib/contexts/AuthContext.tsx (Task 2)
src/middleware.ts (Task 4)
```

### TIER 2: Core Functionality
```
prisma/migrations/* (Task 12 - 7 migration files)
src/app/auth/callback/route.ts (Task 5)
src/app/auth/login/login-content.tsx (Task 6)
```

### TIER 3: User Features
```
src/app/(protected)/profile/page.tsx (Task 8)
src/app/api/orders/create/route.ts (Task 10)
src/app/(protected)/checkout/page.tsx (Task 17)
```

### TIER 4: Production Ready
```
src/app/auth/verify-email/page.tsx (Task 14)
src/app/auth/reset-password/page.tsx (Task 15)
src/app/admin/dashboard/page.tsx (Task 11)
src/app/api/payment/create-intent/route.ts (Task 20)
```

---

## Database Schema (7 Tables)

1. **public.users** - User profiles (extends auth.users)
2. **public.user_roles** - RBAC (user, admin, moderator)
3. **public.carts** - Database-backed shopping carts
4. **public.orders** - Purchase orders
5. **public.order_items** - Items in each order
6. **public.purchases** - Downloadable products
7. **public.audit_logs** - Authentication & action logs

Each table includes:
- ✓ Row Level Security (RLS) policies
- ✓ Appropriate indexes
- ✓ Timestamp columns
- ✓ Foreign keys with CASCADE

---

## Key Components

### AuthContext Hook
```typescript
const { user, profile, roles, isAdmin, logout } = useAuth();
```

### Cart Syncing
- Browser: localStorage (before login)
- Database: Supabase (after login)
- Automatic sync on login/logout

### Order Creation Flow
```
User Adds Products → Cart → Checkout → Create Order → Create Order Items → Create Purchases → Payment
```

### Protected Routes
```
/profile          → Requires auth
/dashboard        → Requires auth
/checkout         → Requires auth
/admin/*          → Requires auth + admin role
```

---

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Auth Callbacks
NEXT_PUBLIC_AUTH_CALLBACK_URL=http://localhost:3000/auth/callback

# Email
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=

# Payment
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Admin
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

---

## Development Workflow

### 1. Setup (30 minutes)
```bash
# 1. Update types
# - Copy Task 1 code to src/lib/supabase/types.ts

# 2. Create AuthContext
# - Copy Task 2 code to src/lib/contexts/AuthContext.tsx

# 3. Create AuthProvider wrapper
# - Copy Task 3 code to src/components/providers/AuthProvider.tsx

# 4. Create middleware
# - Copy Task 4 code to src/middleware.ts
```

### 2. Database (30 minutes)
```bash
# Copy each migration from Task 12 to prisma/migrations/
# Create timestamped folders with migration.sql files

# Apply migrations
npx prisma migrate deploy

# Verify in Supabase dashboard
```

### 3. Auth Pages (2 hours)
```bash
# Update auth callback - Task 5
# Update login page - Task 6
# Create signup wrapper - Task 7
# Update root layout - Task 18
```

### 4. User Features (4 hours)
```bash
# Create profile page - Task 8
# Create protected layout - Task 13
# Create order API - Task 10
# Update cart context - Task 9
# Create checkout - Task 17
```

### 5. Production (4 hours)
```bash
# Email verification - Task 14
# Password reset - Task 15
# Admin dashboard - Task 11
# Payment intent - Task 20
# Seed admin account - Task 19
```

### 6. Testing (Full day)
```bash
# Manual testing of all flows
# Integration tests
# E2E tests with Playwright
```

---

## Testing Each Task

### Task 1: Types
```bash
npm run build  # Should have 0 errors
```

### Tasks 2-3: AuthContext
```typescript
// In browser console
const { user, profile, roles } = useAuth();
console.log(user, profile, roles);  // Should be populated
```

### Task 4: Middleware
```bash
# Try accessing /admin without auth → should redirect to /auth/login
# Try accessing /admin with user role → should redirect to /
# Try accessing /admin with admin role → should allow
```

### Task 5-7: Auth Pages
```bash
# Test signup flow
# Test login with email
# Test OAuth login (Google/GitHub)
# Verify user profile created in DB
```

### Tasks 8-10: User Features
```bash
# Add product to cart
# Checkout and create order
# Verify order in database
# See order in profile page
```

### Tasks 14-15: Email Flows
```bash
# Check email verification token expires after 24h
# Check password reset token expires after 15m
# Test invalid token handling
```

### Task 20: Payments
```bash
# Use Stripe test cards
# 4242 4242 4242 4242 → success
# 4000 0000 0000 9995 → decline
# Verify payment intent created
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "useAuth must be used within AuthProvider" | Missing wrapper | Add AuthProvider to layout.tsx |
| RLS policy preventing inserts | Wrong policy | Verify policy conditions in Supabase |
| Cart not syncing to DB | Auth not initialized | Wait for useAuth loading=false |
| 401 on protected routes | No session cookie | Check Supabase SSR setup |
| Email not sending | Wrong API key | Verify SENDGRID_API_KEY in env |
| Payment fails silently | Missing Stripe key | Check STRIPE_SECRET_KEY |

---

## Deployment Checklist

Before going live:

- [ ] All migrations applied
- [ ] RLS policies tested
- [ ] Admin account created
- [ ] Email service working
- [ ] Payment processor configured
- [ ] Environment variables set in hosting
- [ ] SSL certificate valid
- [ ] Database backups enabled
- [ ] Error logging configured
- [ ] Rate limiting active
- [ ] CORS whitelist set
- [ ] Auth URLs correct
- [ ] Redirect URLs in OAuth apps
- [ ] Load testing passed
- [ ] Security audit completed

---

## Timeline & Sprint Plan

**Sprint 1 (Days 1-3):** Core Auth
- Tasks 1-7, 12, 18
- Goal: Users can login/signup

**Sprint 2 (Days 4-6):** User Profiles & Orders
- Tasks 8-10, 13
- Goal: Users can make purchases

**Sprint 3 (Days 7-9):** Production Features
- Tasks 14-15, 19-20
- Goal: Email and payments working

**Sprint 4 (Days 10-11):** Testing & Deployment
- Full integration testing
- E2E testing
- Production deployment

---

## Success Metrics

Track completion:
- [ ] 100% test coverage on auth paths
- [ ] 0 SQL injection vulnerabilities
- [ ] 0 auth-related security issues
- [ ] <100ms auth check latency
- [ ] 99.9% payment success rate
- [ ] <5 min order creation latency
- [ ] All RLS policies active
- [ ] Audit logs complete
- [ ] Email delivery >99%
- [ ] Zero unencrypted passwords

---

## Support Resources

### Supabase Docs
- Auth: https://supabase.com/docs/guides/auth
- RLS: https://supabase.com/docs/guides/auth/row-level-security
- Realtime: https://supabase.com/docs/guides/realtime

### Next.js
- Middleware: https://nextjs.org/docs/advanced-features/middleware
- SSR: https://nextjs.org/docs/advanced-features/ssr-caching

### Stripe
- API Docs: https://stripe.com/docs/api
- Testing: https://stripe.com/docs/testing

### Security
- OWASP: https://owasp.org/
- Auth0 Best Practices: https://auth0.com/blog

---

## Post-Launch Maintenance

### Weekly
- [ ] Monitor failed auth attempts
- [ ] Check error logs
- [ ] Review RLS violations

### Monthly
- [ ] Database optimization
- [ ] Unused table cleanup
- [ ] Compliance audit

### Quarterly
- [ ] Security assessment
- [ ] Performance testing
- [ ] Dependency updates

---

**Document Version:** 1.0
**Date:** 2026-06-03
**Status:** READY FOR IMPLEMENTATION
