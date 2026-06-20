# Dual Sidebar System - Technical Reference

**Quick Reference Guide for Implementation**  
**Created:** 2026-06-03

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Specifications](#component-specifications)
3. [Role Detection Details](#role-detection-details)
4. [Styling Reference](#styling-reference)
5. [File Paths & Imports](#file-paths--imports)
6. [API & Functions](#api--functions)
7. [Testing Checklist](#testing-checklist)
8. [Common Issues & Solutions](#common-issues--solutions)

---

## Architecture Overview

### System Design

```
User Request
    ↓
SidebarWrapper (Client Component)
    ↓
    ├─ Has admin_session cookie?
    │   ├─ YES → Render AdminSidebar (250px)
    │   └─ NO → Render Sidebar (96px)
    ↓
Route Handler
    ↓
Middleware Check (Server)
    ├─ Is /admin/* route?
    │   ├─ YES → Check admin_session
    │   │   ├─ Valid? → Continue
    │   │   └─ Invalid? → Redirect /admin/login
    │   └─ NO → Continue
    ↓
Admin Layout (Server Component)
    ├─ Is /admin/* route?
    │   ├─ YES → Check isAdminUser()
    │   │   ├─ true → Render with md:ml-[250px]
    │   │   └─ false → Redirect /
    │   └─ NO → Render normally
    ↓
Page Renders
```

### Layer Responsibilities

| Component | Layer | Responsibility |
|-----------|-------|-----------------|
| SidebarWrapper | Client | Detect admin_session, render correct sidebar |
| Sidebar | Client | User navigation (96px) |
| AdminSidebar | Client | Admin navigation (250px) |
| Middleware | Server | Route protection, session validation |
| AdminLayoutWrapper | Server | Protected admin layout, role check |
| role-detection.ts | Server | Multi-layer role detection |
| admin-auth.ts | Server | Session validation, password check |

---

## Component Specifications

### 1. SidebarWrapper.tsx

**Type:** Client Component (`'use client'`)

**Props:** None

**State:**
- `role: UserRole` - 'admin' | 'user'
- `isLoaded: boolean` - Hydration state

**Behavior:**
```typescript
const [role, setRole] = useState<UserRole>('user');
const [isLoaded, setIsLoaded] = useState(false);

useEffect(() => {
  const cookies = document.cookie;
  const hasAdminSession = cookies.includes('admin_session');
  setRole(hasAdminSession ? 'admin' : 'user');
  setIsLoaded(true);
}, []);

if (!isLoaded) return <Sidebar />; // SSR safe
return role === 'admin' ? <AdminSidebar /> : <Sidebar />;
```

**Key Points:**
- Renders user sidebar during SSR (no hydration mismatch)
- Detects role client-side after hydration
- Uses `document.cookie` (only available on client)
- Safe fallback to user sidebar

---

### 2. AdminSidebar.tsx

**Type:** Client Component (`'use client'`)

**Props:** None

**State:**
- `expandedCategories: Set<string>` - Open categories

**Menu Structure:**
```typescript
const menuCategories: MenuCategory[] = [
  {
    title: 'DASHBOARD',
    items: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  // ... 4 more categories
];
```

**Key Features:**
- 250px fixed width
- Collapsible categories
- Active state highlighting
- Left border accent (3px)
- Premium plan footer
- Mobile hamburger (mobile version)

**Styling:**
```css
/* Container */
bg-white/10 dark:bg-white/5
backdrop-blur-md
border-r border-white/20
shadow-lg

/* Active Item */
bg-white/15 dark:bg-white/10
border-l-3 border-white/40
text-gray-900 dark:text-white

/* Hover */
hover:bg-white/10 dark:hover:bg-white/5
text-gray-900 dark:hover:text-white
```

---

### 3. AdminLayoutWrapper.tsx

**Type:** Server Component (async)

**Props:** `{ children: ReactNode }`

**Behavior:**
```typescript
export async function AdminLayoutWrapper({ children }: AdminLayoutProps) {
  const isAdmin = await isAdminUser();
  
  if (!isAdmin) {
    redirect('/');
  }
  
  return (
    <div className="md:ml-[250px]">
      {children}
    </div>
  );
}
```

**Key Points:**
- Server-side protection
- Calls `isAdminUser()` for role detection
- Redirects non-admins to /
- Sets 250px left margin for sidebar

---

## Role Detection Details

### Detection Strategy (Priority Order)

```
1. admin_session COOKIE
   ├─ Exists?
   ├─ Valid (not expired)?
   ├─ YES → return 'admin'
   └─ NO → continue

2. ADMIN_EMAILS ENV VAR
   ├─ User email in list?
   ├─ YES → return 'admin' (dev only)
   └─ NO → continue

3. DATABASE user.role
   ├─ Query Supabase users.role
   ├─ role = 'admin'?
   ├─ YES → return 'admin' (future)
   └─ NO → continue

4. DEFAULT
   └─ return 'user'
```

### Implementation Reference

**`src/lib/role-detection.ts`**

```typescript
export async function detectUserRole(): Promise<UserRole> {
  try {
    // Step 1: Check cookie
    const headersList = await headers();
    const cookies = headersList.get('cookie') || '';
    const adminSession = extractCookie(cookies, 'admin_session');
    
    if (adminSession && validateAdminSession(adminSession)) {
      return 'admin';
    }

    // Step 2: Check env
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const userEmail = extractCookie(cookies, 'user_email') || '';
    
    if (adminEmails.includes(userEmail)) {
      return 'admin';
    }

    // Step 3 & 4: Database + Default
    return 'user';
  } catch (error) {
    return 'user'; // Safe default
  }
}
```

### Where to Call detectUserRole()

| Location | Type | Example |
|----------|------|---------|
| Server Component | Sync | `const role = await detectUserRole();` |
| API Route | Sync | `const role = await detectUserRole();` |
| Middleware | Sync | `const role = await detectUserRole();` |
| Client Component | ❌ Not supported | Use SidebarWrapper instead |

---

## Styling Reference

### Color Palette (B&W + Glasmorphism)

```css
/* Light Mode */
bg-white/10              /* Very light glassmorphic bg */
bg-white/15              /* Slightly more opaque (active) */
bg-white/20              /* Border/divider color */
text-gray-600            /* Secondary text */
text-gray-700            /* Primary text */
text-gray-900            /* Dark text */

/* Dark Mode */
dark:bg-white/5          /* Very light on dark */
dark:bg-white/10         /* Active state */
dark:bg-white/20         /* Borders */
dark:text-gray-300       /* Secondary text */
dark:text-gray-400       /* Tertiary text */
dark:text-white          /* Primary text */
```

### Component Styling Templates

**Sidebar Container:**
```css
bg-white/10 dark:bg-white/5
backdrop-blur-md
border-r border-white/20
shadow-lg
fixed left-0 top-0 h-screen
```

**Navigation Item (Inactive):**
```css
text-gray-600 dark:text-gray-400
hover:bg-white/10 dark:hover:bg-white/5
hover:text-gray-900 dark:hover:text-white
border-l-3 border-transparent
transition-all duration-200
```

**Navigation Item (Active):**
```css
bg-white/15 dark:bg-white/10
text-gray-900 dark:text-white
border-l-3 border-white/40
```

**Category Header:**
```css
text-xs font-semibold
text-gray-700 dark:text-gray-300
hover:text-gray-900 dark:hover:text-white
transition-colors duration-200
```

---

## File Paths & Imports

### File Structure

```
src/
├── components/
│   ├── nav/
│   │   ├── Sidebar.tsx (existing)
│   │   └── SidebarWrapper.tsx (NEW)
│   └── admin/
│       ├── AdminSidebar.tsx (NEW)
│       └── AdminLayout.tsx (NEW - actually not used, use admin/layout.tsx)
├── app/
│   ├── layout.tsx (MODIFIED)
│   ├── admin/
│   │   ├── layout.tsx (NEW)
│   │   ├── page.tsx (NEW - overview)
│   │   ├── analytics/ (existing)
│   │   ├── generate/ (existing)
│   │   ├── login/ (existing)
│   │   ├── tests/ (NEW)
│   │   ├── bulk-generate/ (NEW)
│   │   ├── users/ (NEW)
│   │   ├── revenue/ (NEW)
│   │   ├── settings/ (NEW)
│   │   └── ... (other pages as needed)
├── lib/
│   ├── role-detection.ts (NEW)
│   ├── admin-auth.ts (existing)
└── middleware.ts (NEW or MODIFIED)
```

### Key Imports

**In `src/app/layout.tsx`:**
```typescript
import SidebarWrapper from '@/components/nav/SidebarWrapper';
// Replace: import Sidebar from '@/components/nav/Sidebar';
```

**In `src/components/nav/SidebarWrapper.tsx`:**
```typescript
import Sidebar from './Sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
```

**In `src/components/admin/AdminSidebar.tsx`:**
```typescript
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, BarChart3, ... } from 'lucide-react';
```

**In `src/app/admin/layout.tsx`:**
```typescript
import { isAdminUser } from '@/lib/role-detection';
import { redirect } from 'next/navigation';
```

**In `src/lib/role-detection.ts`:**
```typescript
import { headers } from 'next/headers';
import { validateAdminSession } from '@/lib/admin-auth';
```

---

## API & Functions

### `src/lib/role-detection.ts`

```typescript
// Types
export type UserRole = 'admin' | 'user';

// Functions
export async function detectUserRole(): Promise<UserRole>
  // Detects user role using multi-layer fallback
  // Returns 'admin' or 'user'

export async function isAdminUser(): Promise<boolean>
  // Convenience function
  // Returns true if user is admin, false otherwise

function extractCookie(cookies: string, name: string): string | null
  // Private helper
  // Extracts cookie value from cookie string
```

### `src/lib/admin-auth.ts` (Existing)

```typescript
export function isValidPassword(password: string): boolean
  // Validates admin password against ADMIN_PASSWORD env

export function createAdminSession(): string
  // Creates session token with expiration
  // Format: "token:expirationTimestamp"

export function validateAdminSession(session: string): boolean
  // Validates session token and expiration
  // Returns true if valid and not expired
```

---

## Testing Checklist

### Unit Tests

**File:** `src/lib/__tests__/role-detection.test.ts`

```typescript
describe('detectUserRole', () => {
  test('returns admin for valid admin_session', () => {
    // Mock headers with valid admin_session
    // Expect: 'admin'
  });

  test('returns user for expired admin_session', () => {
    // Mock headers with expired admin_session
    // Expect: 'user'
  });

  test('returns admin for email in ADMIN_EMAILS', () => {
    // Mock env ADMIN_EMAILS
    // Expect: 'admin'
  });

  test('returns user for unknown email', () => {
    // No admin_session, no email match
    // Expect: 'user'
  });

  test('handles errors gracefully', () => {
    // Throw error in headers()
    // Expect: 'user'
  });
});
```

### Integration Tests

**Test Scenarios:**

1. **Login Flow**
   - Navigate to /admin/login
   - Submit correct password
   - Verify redirect to /admin/analytics
   - Verify admin_session cookie set
   - Verify AdminSidebar renders

2. **Route Protection**
   - Clear admin_session cookie
   - Navigate to /admin/tests
   - Verify redirect to /admin/login
   - Verify no 404 error

3. **Role Switching**
   - Login as admin (AdminSidebar)
   - Clear cookie or logout
   - Verify SidebarWrapper switches to user Sidebar
   - No page refresh needed (client-side detection)

### Manual Verification

**Checklist:**

```
User Sidebar
  [ ] Renders without admin_session
  [ ] 96px width (md:hidden shows hidden correctly)
  [ ] 4 nav items work
  [ ] Sound toggle works
  [ ] Theme toggle works
  [ ] Dark mode looks good

Admin Sidebar
  [ ] Renders after successful login
  [ ] 250px width
  [ ] 5 categories with correct items
  [ ] Categories expand/collapse
  [ ] Active state highlighting works
  [ ] Dark mode looks good
  [ ] Premium plan section visible

Route Protection
  [ ] Non-admin redirected from /admin/*
  [ ] Expired session redirects to login
  [ ] Valid session allows access

Mobile Responsive
  [ ] User sidebar hidden on mobile
  [ ] Admin hamburger menu works
  [ ] Menu slides in/out smoothly
  [ ] No overlaps or visual glitches

Dark Mode
  [ ] Both sidebars look good
  [ ] Text contrast meets WCAG AA
  [ ] Icons visible
  [ ] Active states clear

Performance
  [ ] Build time acceptable
  [ ] No console errors
  [ ] No hydration mismatches
  [ ] Page load time not affected
```

---

## Common Issues & Solutions

### Issue 1: Hydration Mismatch on Sidebar

**Symptom:** Console error: "Hydration failed because..."

**Cause:** SidebarWrapper renders different content on server vs client

**Solution:**
```typescript
const [isLoaded, setIsLoaded] = useState(false);

useEffect(() => {
  setIsLoaded(true); // Only after hydration
}, []);

if (!isLoaded) {
  return <Sidebar />; // Return same as SSR
}

return role === 'admin' ? <AdminSidebar /> : <Sidebar />;
```

**Prevention:** Always render default (user sidebar) during SSR.

---

### Issue 2: Admin Sidebar Not Appearing

**Symptom:** Login successful, but still see user sidebar

**Cause:** 
- Cookie not set
- Cookie name mismatch
- Cookie value incorrect
- Page not refreshed after login

**Debug:**
```javascript
// In browser console
document.cookie // Check if admin_session exists
// Expected: "admin_session=token:timestamp"
```

**Solution:**
1. Verify API response sets cookie:
   ```typescript
   response.cookies.set('admin_session', session, { ... })
   ```
2. Verify cookie name matches: `admin_session`
3. Verify SidebarWrapper checks for `'admin_session'`
4. Try page refresh after login

---

### Issue 3: Routes Redirecting to Login Unexpectedly

**Symptom:** Clicking admin links redirects to /admin/login

**Cause:** 
- Middleware validation failing
- Cookie path incorrect
- Session expired

**Debug:**
```javascript
// Check cookie in DevTools
// Path should be: /admin
// HttpOnly: checked
// Secure: checked (production)
```

**Solution:**
1. Verify middleware.ts exists
2. Check cookie is set with path: '/admin'
3. Check session duration is 24 hours
4. Verify validateAdminSession() works

---

### Issue 4: Mobile Menu Not Closing

**Symptom:** Hamburger menu opens but doesn't close when item clicked

**Cause:** Event handler not attached or not firing

**Solution:**
```typescript
const handleItemClick = () => {
  setMenuOpen(false); // Close on item click
};

// Or use overlay click-outside
const handleOverlayClick = () => {
  setMenuOpen(false);
};
```

---

### Issue 5: Dark Mode Colors Look Wrong

**Symptom:** Sidebar doesn't look good in dark mode

**Cause:** Missing `dark:` prefix or incorrect opacity

**Verify:**
```css
/* Light mode */
bg-white/10

/* Dark mode (REQUIRED) */
dark:bg-white/5  /* Lighter in dark mode */
```

**Solution:**
- Always pair light mode with dark mode classes
- Use lower opacity in dark mode
- Test both light and dark modes

---

### Issue 6: Sidebar Width Causing Layout Shift

**Symptom:** Content shifts when switching sidebars

**Cause:** Different margin values (96px vs 250px)

**Solution:**
```typescript
// In SidebarWrapper - render logic doesn't change margin
// In specific layouts:

// User sidebar pages (default layout)
<main className="md:ml-24"> {/* 96px = 24 * 4px */}

// Admin pages (admin/layout.tsx)
<main className="md:ml-[250px]"> {/* 250px */}
```

**Note:** Root layout uses `md:ml-24` for user sidebar. Admin pages override with `md:ml-[250px]`.

---

## Env Variables Required

### `.env.local` (for development)

```env
# Admin authentication
ADMIN_PASSWORD=your_secure_password_here

# Optional: Admin emails (for development)
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

### Production Checklist

```
[ ] ADMIN_PASSWORD set to strong value (not 'changeme')
[ ] No test passwords in production
[ ] Secure flag enabled on admin_session cookie
[ ] HttpOnly flag enabled
[ ] SameSite: strict enabled
[ ] Session duration appropriate (24h)
[ ] Middleware active
```

---

## Performance Metrics

### Bundle Size Impact

```
New Components:
  - SidebarWrapper: ~3KB
  - AdminSidebar: ~12KB
  - Role detection: ~2KB
  Total: ~17KB (uncompressed)
  
Gzipped: ~5-7KB

User-only bundle: No increase (code split)
Admin-only bundle: +17KB
```

### Load Time Impact

```
User pages: No impact (SidebarWrapper minimal)
Admin pages: +17KB but only on admin routes
Initial page load: No impact (lazy loaded)
```

### Client-Side Performance

```
SidebarWrapper render: <1ms (minimal logic)
Role detection: Client-side cookie check (instant)
AdminSidebar render: <10ms (React render)
DOM operations: Minimal (CSS classes only)
```

---

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✓ Full |
| Firefox | 88+ | ✓ Full |
| Safari | 14+ | ✓ Full |
| Edge | 90+ | ✓ Full |
| Mobile Safari | 14+ | ✓ Full |
| Chrome Android | 90+ | ✓ Full |

**Key Features Needed:**
- CSS Grid
- CSS Backdrop Filter
- CSS Custom Properties
- localStorage (SidebarWrapper uses document.cookie)

---

## References

### Related Files

- `src/components/nav/Sidebar.tsx` - User sidebar (reference)
- `src/app/layout.tsx` - Root layout (to modify)
- `src/lib/admin-auth.ts` - Existing auth (reference)
- `src/app/admin/login/page.tsx` - Login flow (reference)

### Documentation

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [React hooks: useState, useEffect](https://react.dev/reference/react)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)

### Tools

- [Lucide React Icons](https://lucide.dev) - Icon library
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Debugging
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility

---

## Deployment Notes

### Pre-Deployment

```bash
# Type check
tsc --noEmit

# Lint
npm run lint

# Build
npm run build

# Test
npm test
```

### Post-Deployment

- Monitor error logs for hydration mismatches
- Check admin login flows work
- Verify admin sidebar renders
- Verify route protection active
- Monitor 24h for cookie issues

### Rollback Plan

```bash
# If major issues, revert to previous commit
git revert <commit-hash>

# Or if needed, checkout previous version
git checkout <previous-branch>
```

---

**Reference Guide Created:** 2026-06-03  
**Last Updated:** 2026-06-03  
**For Implementation of:** Dual Sidebar System (18 tasks)
