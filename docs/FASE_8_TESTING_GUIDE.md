# FASE 8: Testing & Verification Guide

## Complete Testing Strategy for Production

---

## UNIT TESTS

### 1. Auth Context Test

**File:** `src/lib/contexts/__tests__/AuthContext.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/contexts/AuthContext';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client');

describe('AuthContext', () => {
  it('initializes with null user', async () => {
    const TestComponent = () => {
      const { user, loading } = useAuth();
      return <div>{loading ? 'loading' : 'ready'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('ready')).toBeInTheDocument();
    });
  });

  it('fetches user profile after login', async () => {
    const mockProfile = {
      id: 'user-1',
      email: 'test@example.com',
      full_name: 'Test User',
    };

    (createSupabaseClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
        }),
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [mockProfile] }),
          single: jest.fn().mockResolvedValue({ data: mockProfile }),
        }),
      }),
    });

    const TestComponent = () => {
      const { profile } = useAuth();
      return <div>{profile?.email}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('refreshUser updates profile', async () => {
    const TestComponent = () => {
      const { profile, refreshUser } = useAuth();
      return (
        <div>
          <div>{profile?.full_name}</div>
          <button onClick={() => refreshUser()}>Refresh</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Test refreshUser method
    // ...
  });

  it('logout clears all state', async () => {
    const TestComponent = () => {
      const { user, logout } = useAuth();
      return (
        <div>
          {user ? <button onClick={() => logout()}>Logout</button> : <div>logged out</div>}
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Test logout
    // ...
  });
});
```

**Run:**
```bash
npm run test -- src/lib/contexts/__tests__/AuthContext.test.tsx
```

---

### 2. Cart Context Test

**File:** `src/lib/contexts/__tests__/CartContext.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '@/lib/contexts/CartContext';
import { Product } from '@/types/products';

describe('CartContext', () => {
  const mockProduct: Product = {
    id: 'prod-1',
    title: 'Test Product',
    description: 'Test',
    category: 'personality-report',
    price: 9999, // $99.99
    image: 'https://example.com/image.jpg',
    features: [],
    targetAudience: 'all',
    estimatedValue: 'Test',
  };

  it('adds product to cart', async () => {
    const TestComponent = () => {
      const { cart, addToCart } = useCart();
      return (
        <div>
          <button onClick={() => addToCart(mockProduct, 1)}>Add</button>
          <div>{cart.itemCount}</div>
        </div>
      );
    };

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const button = screen.getByRole('button', { name: /add/i });
    await userEvent.click(button);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('removes product from cart', async () => {
    const TestComponent = () => {
      const { cart, addToCart, removeFromCart } = useCart();
      return (
        <div>
          <button onClick={() => addToCart(mockProduct, 1)}>Add</button>
          <button onClick={() => removeFromCart(mockProduct.id)}>Remove</button>
          <div>{cart.itemCount}</div>
        </div>
      );
    };

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByRole('button', { name: /add/i });
    await userEvent.click(addButton);

    const removeButton = screen.getByRole('button', { name: /remove/i });
    await userEvent.click(removeButton);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('updates quantity', async () => {
    const TestComponent = () => {
      const { cart, addToCart, updateQuantity } = useCart();
      return (
        <div>
          <button onClick={() => addToCart(mockProduct, 1)}>Add</button>
          <button onClick={() => updateQuantity(mockProduct.id, 5)}>Update</button>
          <div>{cart.itemCount}</div>
        </div>
      );
    };

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByRole('button', { name: /add/i });
    await userEvent.click(addButton);

    const updateButton = screen.getByRole('button', { name: /update/i });
    await userEvent.click(updateButton);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('persists cart to localStorage', async () => {
    const TestComponent = () => {
      const { cart, addToCart } = useCart();
      return (
        <div>
          <button onClick={() => addToCart(mockProduct, 1)}>Add</button>
          <div>{cart.itemCount}</div>
        </div>
      );
    };

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const button = screen.getByRole('button');
    await userEvent.click(button);

    const saved = localStorage.getItem('quizlab-cart');
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved!);
    expect(parsed.itemCount).toBe(1);
  });
});
```

**Run:**
```bash
npm run test -- src/lib/contexts/__tests__/CartContext.test.tsx
```

---

## INTEGRATION TESTS

### 1. Auth Flow Test

**File:** `src/app/auth/__tests__/auth-flow.integration.test.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

describe('Auth Flow Integration', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let userId: string;

  it('signs up with email', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe(testEmail);
    userId = data.user!.id;
  });

  it('creates user profile after signup', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    expect(error).toBeNull();
    expect(data.email).toBe(testEmail);
    expect(data.is_verified).toBe(false);
  });

  it('assigns default user role', async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    expect(error).toBeNull();
    expect(data).toContainEqual({ role: 'user' });
  });

  it('signs in with email', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    expect(error).toBeNull();
    expect(data.user?.email).toBe(testEmail);
  });

  it('updates last_login_at', async () => {
    // Simulate login timestamp update
    const { data, error } = await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);

    expect(error).toBeNull();
  });

  afterAll(async () => {
    // Cleanup - delete test user
    await supabase.auth.admin.deleteUser(userId);
  });
});
```

**Run:**
```bash
npm run test:integration -- auth-flow.integration.test.ts
```

---

### 2. Order Creation Test

**File:** `src/app/api/orders/__tests__/create.integration.test.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('Order Creation Integration', () => {
  let userId: string;
  let sessionToken: string;

  beforeAll(async () => {
    // Create test user
    const { data: authUser } = await supabase.auth.admin.createUser({
      email: `order-test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      email_confirm: true,
    });

    userId = authUser.user!.id;

    // Create user profile
    await supabase.from('users').insert({
      id: userId,
      email: authUser.user!.email,
      full_name: 'Test User',
      is_verified: true,
    });

    // Get session token
    const { data } = await supabase.auth.admin.getUserById(userId);
    sessionToken = (data.user as any).session?.access_token || '';
  });

  it('creates order with items', async () => {
    const orderData = {
      items: [
        {
          productId: 'prod-1',
          productTitle: 'Test Product',
          category: 'personality-report',
          quantity: 1,
          unitPrice: 9999,
        },
      ],
      total_price: 9999,
      payment_method: 'stripe',
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_BASE_URL}/api/orders/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(orderData),
      }
    );

    expect(response.status).toBe(200);
    const order = await response.json();
    expect(order.id).toBeDefined();
    expect(order.status).toBe('pending');
  });

  it('creates order items', async () => {
    // Create order first
    const orderData = {
      items: [
        {
          productId: 'prod-1',
          productTitle: 'Test Product',
          category: 'personality-report',
          quantity: 2,
          unitPrice: 9999,
        },
      ],
      total_price: 19998,
      payment_method: 'stripe',
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_BASE_URL}/api/orders/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(orderData),
      }
    );

    const order = await response.json();

    // Verify order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    expect(items?.length).toBe(1);
    expect(items?.[0].quantity).toBe(2);
    expect(items?.[0].subtotal).toBe(19998);
  });

  it('logs audit event for order creation', async () => {
    // Create order
    const orderData = {
      items: [
        {
          productId: 'prod-1',
          productTitle: 'Test Product',
          category: 'personality-report',
          quantity: 1,
          unitPrice: 9999,
        },
      ],
      total_price: 9999,
      payment_method: 'stripe',
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_BASE_URL}/api/orders/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(orderData),
      }
    );

    // Verify audit log
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('action', 'order_created');

    expect(logs?.length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    // Cleanup - delete test user
    await supabase.auth.admin.deleteUser(userId);
  });
});
```

**Run:**
```bash
npm run test:integration -- order-creation.integration.test.ts
```

---

## E2E TESTS (Playwright)

### Complete User Journey Test

**File:** `tests/e2e/user-journey.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  const testEmail = `e2e-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test('sign up with email', async ({ page }) => {
    await page.goto('/auth/login');

    // Click email tab
    await page.click('text=Email');

    // Fill form
    await page.fill('input[placeholder="tu@email.com"]', testEmail);
    await page.fill('input[placeholder="••••••••"]', testPassword);

    // Click signup button
    await page.click('text=Registrarse');

    // Check for success message
    await expect(page.locator('text=Check your email')).toBeVisible();
  });

  test('login with email', async ({ page }) => {
    await page.goto('/auth/login');

    // Click email tab
    await page.click('text=Email');

    // Fill form
    await page.fill('input[placeholder="tu@email.com"]', testEmail);
    await page.fill('input[placeholder="••••••••"]', testPassword);

    // Click login button
    await page.click('text=Iniciar Sesión');

    // Should redirect to dashboard
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');
  });

  test('view profile', async ({ page, context }) => {
    // Login first
    await page.goto('/auth/login');
    await page.click('text=Email');
    await page.fill('input[placeholder="tu@email.com"]', testEmail);
    await page.fill('input[placeholder="••••••••"]', testPassword);
    await page.click('text=Iniciar Sesión');
    await page.waitForURL('/dashboard');

    // Navigate to profile
    await page.goto('/profile');

    // Check profile elements
    await expect(page.locator('text=Mi Perfil')).toBeVisible();
    await expect(page.locator(`text=${testEmail}`)).toBeVisible();
  });

  test('add product to cart', async ({ page }) => {
    // Assuming /store page exists with products
    await page.goto('/store');

    // Click add to cart on first product
    const addButtons = await page.locator('button:has-text("Agregar al Carrito")');
    if (await addButtons.count() > 0) {
      await addButtons.first().click();

      // Check cart count updated
      await expect(page.locator('text=1')).toBeVisible(); // or cart badge
    }
  });

  test('checkout creates order', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.click('text=Email');
    await page.fill('input[placeholder="tu@email.com"]', testEmail);
    await page.fill('input[placeholder="••••••••"]', testPassword);
    await page.click('text=Iniciar Sesión');
    await page.waitForURL('/dashboard');

    // Go to store and add product
    await page.goto('/store');
    const addButtons = await page.locator('button:has-text("Agregar al Carrito")');
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
    }

    // Go to checkout
    await page.goto('/checkout');

    // Verify checkout page
    await expect(page.locator('text=Checkout')).toBeVisible();

    // Click checkout button
    await page.click('text=Proceder al Pago');

    // Check success
    await expect(page.locator('text=Orden creada')).toBeVisible();
  });

  test('logout', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.click('text=Email');
    await page.fill('input[placeholder="tu@email.com"]', testEmail);
    await page.fill('input[placeholder="••••••••"]', testPassword);
    await page.click('text=Iniciar Sesión');
    await page.waitForURL('/dashboard');

    // Click logout
    await page.click('button:has-text("Cerrar Sesión")');

    // Should redirect to home
    await page.waitForURL('/');
    expect(page.url()).not.toContain('/dashboard');
  });

  test('protected route redirects to login', async ({ page }) => {
    // Try accessing protected route without auth
    await page.goto('/profile', { waitUntil: 'networkidle' });

    // Should redirect to login
    await expect(page).toHaveURL(/.*auth\/login/);
  });

  test('admin can access admin dashboard', async ({ page }) => {
    // Assuming admin account exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

    await page.goto('/auth/login');
    await page.click('text=Email');
    await page.fill('input[placeholder="tu@email.com"]', adminEmail);
    await page.fill('input[placeholder="••••••••"]', adminPassword);
    await page.click('text=Iniciar Sesión');

    // Navigate to admin
    await page.goto('/admin/dashboard');

    // Check admin content
    await expect(page.locator('text=Panel Administrativo')).toBeVisible();
  });
});
```

**Run:**
```bash
npx playwright test tests/e2e/user-journey.spec.ts --headed
```

---

## MANUAL TESTING CHECKLIST

### Authentication (2 hours)

#### Email/Password
- [ ] Signup with valid email creates account
- [ ] Signup with existing email shows error
- [ ] Signup with weak password shows error
- [ ] Password visibility toggle works
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong password fails
- [ ] After signup, user redirected to email verification page
- [ ] Email verification link works (if implemented)

#### OAuth
- [ ] Google OAuth redirects to Google login
- [ ] After Google auth, user profile created with name/avatar
- [ ] GitHub OAuth redirects to GitHub login
- [ ] After GitHub auth, user profile created
- [ ] OAuth users have provider field set
- [ ] OAuth users can link to email later

#### Session Management
- [ ] After login, session persists on page refresh
- [ ] After logout, session cleared
- [ ] Logout clears localStorage
- [ ] Session expires after 24 hours (if configured)
- [ ] Multiple tabs stay in sync

### Profile Management (1 hour)

- [ ] Profile page displays user info
- [ ] Edit name works and updates
- [ ] Avatar displays correctly
- [ ] Email shown and not editable
- [ ] Account creation date displays
- [ ] Verification status shows correctly
- [ ] Last login date updates after login
- [ ] Profile syncs with Supabase in real-time

### Cart & Checkout (2 hours)

- [ ] Add product to cart works
- [ ] Remove product from cart works
- [ ] Update quantity works
- [ ] Cart total calculates correctly
- [ ] Cart persists across pages (before login)
- [ ] After login, cart syncs to database
- [ ] After logout, localStorage cart still available
- [ ] Checkout page shows all items
- [ ] Order subtotal calculates correctly
- [ ] Order creation succeeds
- [ ] Order appears in profile purchases
- [ ] Payment method selection works
- [ ] Checkout redirects to profile after success

### Orders & Purchases (1.5 hours)

- [ ] Orders appear in user profile
- [ ] Order items display correctly
- [ ] Order dates show correctly
- [ ] Download button appears for purchases
- [ ] Download link works
- [ ] Download count increments
- [ ] Expired products show as expired
- [ ] License key displays correctly

### Admin Features (1 hour)

- [ ] Admin can access /admin/dashboard
- [ ] Non-admin cannot access /admin
- [ ] Admin dashboard shows user count
- [ ] Admin dashboard shows order count
- [ ] Admin dashboard shows total revenue
- [ ] Activity logs display
- [ ] Admin can view user activity
- [ ] Admins cannot delete users from dashboard

### Security (1.5 hours)

- [ ] Cannot access /profile without auth
- [ ] Cannot access /checkout without auth
- [ ] Cannot access /admin without admin role
- [ ] RLS prevents user A from seeing user B's cart
- [ ] RLS prevents user A from seeing user B's orders
- [ ] Password not visible in network tab
- [ ] Auth token in HTTP-only cookie (not localStorage)
- [ ] CSRF protection on auth endpoints
- [ ] SQL injection not possible in login form
- [ ] XSS not possible in profile name field

### Email Flows (1 hour) - If Implemented

- [ ] Verification email sent after signup
- [ ] Verification link valid for 24 hours
- [ ] Expired verification link shows error
- [ ] Password reset email sent when requested
- [ ] Password reset link valid for 15 minutes
- [ ] Can reset password with valid link
- [ ] Cannot reset password with invalid link

### Performance (30 minutes)

- [ ] Login completes in <2 seconds
- [ ] Profile page loads in <1 second
- [ ] Cart sync to DB in <500ms
- [ ] Checkout creation in <2 seconds
- [ ] Admin dashboard loads in <3 seconds
- [ ] No N+1 queries on profile page
- [ ] No memory leaks in auth context

---

## PERFORMANCE BENCHMARKS

### Target Metrics

| Operation | Target | Acceptable |
|-----------|--------|----------|
| Login | <1s | <2s |
| Profile Load | <500ms | <1s |
| Cart Sync | <200ms | <500ms |
| Checkout | <2s | <3s |
| Admin Dashboard | <2s | <3s |
| Auth Context Initialize | <300ms | <500ms |

### Measurement Commands

```bash
# Measure bundle size
npm run build
# Check .next/static folder size

# Measure runtime performance
npm run dev
# Open Chrome DevTools → Performance tab
# Record page load for /auth/login, /profile, /checkout

# Measure API latency
# Use browser Network tab
# Check response times for:
# - /api/auth/callback
# - /api/orders/create
# - /api/payment/create-intent
```

---

## SECURITY AUDIT CHECKLIST

### Authentication Security
- [ ] Passwords hashed with bcrypt (Supabase handles)
- [ ] No passwords in logs
- [ ] No auth tokens in localStorage
- [ ] HTTP-only cookies enabled
- [ ] Secure flag on cookies (HTTPS)
- [ ] SameSite=Lax on cookies
- [ ] CORS headers restrictive
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after N failed attempts
- [ ] Password reset token expires

### Database Security
- [ ] RLS enabled on all tables
- [ ] RLS policies prevent privilege escalation
- [ ] Parameterized queries used (ORM)
- [ ] No raw SQL in user inputs
- [ ] Sensitive data encrypted at rest
- [ ] Database backups encrypted
- [ ] Access logs enabled
- [ ] Principle of least privilege applied

### Application Security
- [ ] No sensitive data in error messages
- [ ] No stack traces in production
- [ ] Security headers set (CSP, X-Frame-Options, etc.)
- [ ] XSS prevention (React escaping)
- [ ] CSRF tokens on forms
- [ ] Input validation on all fields
- [ ] Output encoding on all displays
- [ ] Third-party dependencies scanned for vulnerabilities

### Secrets Management
- [ ] .env files in .gitignore
- [ ] Secrets only in environment variables
- [ ] Separate dev/staging/prod keys
- [ ] Key rotation policy in place
- [ ] No hardcoded API keys
- [ ] Secrets Manager used in production

---

## ISSUE TRACKING

### Test Failure Resolution Template

```markdown
## Failed: [Test Name]

### Error Message
[Exact error from test output]

### Environment
- OS: [Windows/Mac/Linux]
- Node: [version]
- Next.js: 16.2.6
- Supabase: [version]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]

### Expected Result
[What should happen]

### Actual Result
[What actually happens]

### Root Cause
[Analysis]

### Fix Applied
[Code changes]

### Verification
- [ ] Test passes
- [ ] No regressions
- [ ] Documented in CHANGELOG
```

---

## Continuous Integration Setup

### GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci

      - run: npm run lint

      - run: npm run build

      - run: npm run test:unit

      - run: npm run test:integration
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci

      - run: npx playwright install

      - run: npm run build

      - run: npm run start &
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}

      - run: npx playwright test tests/e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Reporting

### Coverage Goals

```
Statements   : 80%+ (critical paths 95%+)
Branches     : 75%+ (auth paths 90%+)
Functions    : 80%+ (all exports)
Lines        : 80%+ (no dead code)
```

### Generate Coverage Report

```bash
npm run test -- --coverage --coveragePathIgnorePatterns=/node_modules/

# Output: coverage/lcov-report/index.html
```

---

**Testing Guide Version:** 1.0
**Status:** COMPLETE
**Last Updated:** 2026-06-03
