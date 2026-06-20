# Dual Sidebar System - Execution Checklist

**Status:** Ready to Execute  
**Created:** 2026-06-03  
**Target Completion:** 2026-06-05 (estimated)  
**Effort:** ~13 hours development + testing

---

## Phase 1: Foundation & Utilities

### ✓ Task 1: Create Role Detection Utility
**File:** `src/lib/role-detection.ts` (NEW)

```
[ ] Create file
[ ] Implement detectUserRole() function
[ ] Implement isAdminUser() function
[ ] Implement extractCookie() helper
[ ] Add error handling and logging
[ ] Export types
[ ] No TypeScript errors
```

**Acceptance Criteria:**
- Detects role from 3 sources (cookie > env > db > default)
- Returns UserRole type ('admin' | 'user')
- Safe error handling
- Can be used in Server Components

**Commit Message:** `feat: add role detection utility with multi-layer fallback strategy`

---

### ✓ Task 2: Create Admin Sidebar Component
**File:** `src/components/admin/AdminSidebar.tsx` (NEW)

```
[ ] Create file with all 5 menu categories
[ ] Define MenuItem and MenuCategory interfaces
[ ] Build logo area section
[ ] Build categories navigation (scrollable)
[ ] Implement category expand/collapse
[ ] Build active state highlighting
[ ] Add left border (3px) for active items
[ ] Implement hover effects
[ ] Build premium plan section footer
[ ] Add proper glasmorphism styling
[ ] Add dark mode support
[ ] Set width to 250px (fixed)
[ ] Hide on mobile (<md)
[ ] No TypeScript errors
```

**Menu Structure:**
1. Dashboard (2 items)
2. Create & Manage (6 items)
3. Analytics & Growth (4 items)
4. Monetization (4 items)
5. Users & Config (4 items)

**Styling Requirements:**
- bg-white/10 dark:bg-white/5
- border-white/20
- backdrop-blur-md
- Active: bg-white/15 dark:bg-white/10 + left border-white/40
- Hover: bg-white/10 dark:bg-white/5

**Commit Message:** `feat: implement admin sidebar with 5 organized menu categories`

---

### ✓ Task 3: Create Sidebar Wrapper Component
**File:** `src/components/nav/SidebarWrapper.tsx` (NEW)

```
[ ] Create client component
[ ] Implement role detection from admin_session cookie
[ ] Add loading state to prevent hydration mismatch
[ ] Render Sidebar or AdminSidebar based on role
[ ] Default to Sidebar during SSR
[ ] Add useEffect for client-side detection
[ ] No TypeScript errors
```

**Acceptance Criteria:**
- No hydration mismatches
- Correctly detects admin_session cookie
- Fallback to user sidebar
- Works with SSR

**Commit Message:** `feat: create sidebar wrapper for role-based sidebar selection`

---

### ✓ Task 4: Create Admin Layout Wrapper
**File:** `src/components/admin/AdminLayout.tsx` (NEW)

```
[ ] Create server component (async)
[ ] Call isAdminUser() for protection
[ ] Redirect non-admins to /
[ ] Render children with proper layout
[ ] Add md:ml-[250px] for sidebar spacing
[ ] No TypeScript errors
```

**Acceptance Criteria:**
- Non-admins redirected to /
- Admins see layout with 250px margin
- Server-side protection

**Commit Message:** `feat: create admin layout wrapper with route protection`

---

### ✓ Task 5: Update Root Layout
**File:** `src/app/layout.tsx` (MODIFIED)

```
[ ] Import SidebarWrapper instead of Sidebar
[ ] Replace <Sidebar /> with <SidebarWrapper />
[ ] Keep all provider structure intact
[ ] Keep main margin ml-24 (96px for user sidebar)
[ ] Verify no breaking changes
[ ] No TypeScript errors
[ ] Test user sidebar still renders
```

**Changes Summary:**
- Line 6: Change import from Sidebar to SidebarWrapper
- Line 82: Replace <Sidebar /> with <SidebarWrapper />
- Keep everything else identical

**Commit Message:** `refactor: integrate SidebarWrapper into root layout`

---

## Phase 2: Admin Page Scaffolding

### ✓ Task 6: Create Admin Overview Page
**File:** `src/app/admin/page.tsx` (NEW)

```
[ ] Create main admin dashboard page
[ ] Add "Admin Overview" heading
[ ] Create quick stats section (3 cards)
[ ] Create quick actions section (AI Factory, Analytics)
[ ] Apply glasmorphism styling
[ ] Add dark mode support
[ ] Test navigation links work
[ ] No TypeScript errors
```

**Stats to Display:**
- Active Users (example: 2,847, +12%)
- Tests Today (example: 847, +5%)
- Revenue (example: $4,231, +23%)

**Commit Message:** `feat: create admin overview dashboard page`

---

### ✓ Task 7: Create Admin Tests Page
**File:** `src/app/admin/tests/page.tsx` (NEW)

```
[ ] Create stub page with heading
[ ] Add placeholder table structure
[ ] Add "Create Test" button
[ ] Apply glasmorphism styling
[ ] Add dark mode support
[ ] No TypeScript errors
```

**Placeholder Content:**
- Heading: "Tests Management"
- Description: "Create, edit, and manage all tests"
- Table headers: ID, Title, Category, Questions, Status, Created
- Sample data rows (3-5 rows)

**Commit Message:** `feat: create admin tests management page stub`

---

### ✓ Task 8: Create Admin Bulk Generator Page
**File:** `src/app/admin/bulk-generate/page.tsx` (NEW)

```
[ ] Create stub page with heading
[ ] Add form placeholder
[ ] Add field placeholders (CSV upload, category, count)
[ ] Add "Generate" button
[ ] Apply glasmorphism styling
[ ] Add dark mode support
[ ] No TypeScript errors
```

**Commit Message:** `feat: create admin bulk test generator page stub`

---

### ✓ Task 9: Create Admin Users Page
**File:** `src/app/admin/users/page.tsx` (NEW)

```
[ ] Create stub page with heading
[ ] Add placeholder table structure
[ ] Add "Add User" button
[ ] Apply glasmorphism styling
[ ] Add dark mode support
[ ] No TypeScript errors
```

**Table Headers:** ID, Email, Role, Tests Completed, Status, Actions

**Commit Message:** `feat: create admin users management page stub`

---

### ✓ Task 10: Create Admin Revenue Page
**File:** `src/app/admin/revenue/page.tsx` (NEW)

```
[ ] Create stub page with heading
[ ] Add revenue metrics cards (3-4 cards)
[ ] Add chart placeholder
[ ] Apply glasmorphism styling
[ ] Add dark mode support
[ ] No TypeScript errors
```

**Metrics:** Total Revenue, Avg per Test, Monthly Trend, Top Sources

**Commit Message:** `feat: create admin revenue tracking page stub`

---

### ✓ Task 11: Create Admin Settings Page
**File:** `src/app/admin/settings/page.tsx` (NEW)

```
[ ] Create stub page with heading
[ ] Add settings sections (Site, Email, Security)
[ ] Add form fields placeholders
[ ] Add "Save Settings" button
[ ] Apply glasmorphism styling
[ ] Add dark mode support
[ ] No TypeScript errors
```

**Settings Sections:**
- General Settings
- Email Configuration
- Security Settings
- System Preferences

**Commit Message:** `feat: create admin settings configuration page stub`

---

### ✓ Task 12: Update/Create Middleware
**File:** `src/middleware.ts` (NEW or MODIFIED)

```
[ ] Create/update middleware file
[ ] Add route matching for /admin/*
[ ] Check admin_session cookie
[ ] Validate session with validateAdminSession()
[ ] Redirect to /admin/login if invalid
[ ] Allow /admin/login without auth
[ ] Export config with matcher
[ ] No TypeScript errors
```

**Middleware Logic:**
1. Check if pathname starts with /admin
2. Skip /admin/login
3. Check admin_session cookie
4. Validate session expiration
5. Redirect to /admin/login if invalid
6. Allow request if valid

**Commit Message:** `feat: add middleware to protect admin routes`

---

## Phase 3: Admin Layout

### ✓ Task 13: Create Admin Layout File
**File:** `src/app/admin/layout.tsx` (NEW)

```
[ ] Create admin layout component
[ ] Call isAdminUser() for server-side check
[ ] Redirect non-admins to /
[ ] Set main margin to md:ml-[250px]
[ ] Wrap children in main element
[ ] Add min-h-screen class
[ ] No TypeScript errors
```

**Acceptance Criteria:**
- Non-admins redirected to /
- Admin pages show with 250px left margin
- Sidebar wrapper renders correctly above layout

**Commit Message:** `feat: create admin layout with sidebar margin and protection`

---

## Phase 4: Mobile Responsiveness

### ✓ Task 14: Implement Mobile Hamburger Menu
**File:** `src/components/admin/AdminSidebar.tsx` (MODIFIED)

```
[ ] Add mobile menu state (useState)
[ ] Create hamburger button component
[ ] Show button on mobile only (md:hidden)
[ ] Implement menu slide-in animation
[ ] Add overlay for mobile menu
[ ] Close menu on item click
[ ] Close menu on overlay click (click-outside)
[ ] Add escape key handler
[ ] Smooth transitions
[ ] No TypeScript errors
```

**Mobile Behavior:**
- Hidden sidebar by default on <768px
- Hamburger button visible on mobile
- Menu slides in from left with overlay
- Overlay is semi-transparent (30% opacity)
- Menu closes on item click or overlay click

**Commit Message:** `feat: add mobile hamburger menu for admin sidebar`

---

## Phase 5: Testing & Verification

### ✓ Task 15: Test User Sidebar (Non-Admin)

**Test Environment:**
- Fresh browser (no admin_session cookie)
- User should see 96px sidebar with user items

**Test Cases:**

```
[ ] User sidebar renders without admin_session
    - Go to / (home page)
    - Verify 96px sidebar visible (desktop)
    - Verify sidebar hidden (mobile)
    
[ ] Navigation items work
    - Click Home → / loads
    - Click Tests → /tests loads
    - Click Dashboard → /dashboard loads
    - Click Profile → /profile loads
    
[ ] Sound toggle works
    - Click sound button
    - Sound state changes
    - Tooltip shows "Sonido" or "Silencio"
    
[ ] Theme toggle works
    - Click theme button
    - Light/dark mode toggles
    - Tooltip shows "Claro" or "Oscuro"
    - Background changes appropriately
    
[ ] Responsive on mobile (<768px)
    - Sidebar is hidden
    - Content full width
    - No visual glitches
    
[ ] Dark mode renders correctly
    - Enable dark mode
    - Verify contrast and readability
    - No color issues
```

**Commit Message:** `test: verify user sidebar functionality for non-admin users`

---

### ✓ Task 16: Test Admin Sidebar & Role Detection

**Test Environment:**
- Login as admin (password from ADMIN_PASSWORD)
- Verify admin_session cookie set
- Admin should see 250px sidebar with admin menu

**Test Cases:**

```
[ ] Admin sidebar renders after login
    - Go to /admin/login
    - Enter correct password
    - Submit form
    - Verify redirect to /admin/analytics
    - Verify admin sidebar visible (250px)
    
[ ] Admin sidebar shows all categories
    - Verify 5 categories visible:
      - DASHBOARD
      - CREATE & MANAGE
      - ANALYTICS & GROWTH
      - MONETIZATION
      - USERS & CONFIG
    
[ ] Menu items visible and clickable
    - Expand each category
    - Verify all menu items present
    - Click each item
    - Verify page loads
    
[ ] Active state highlighting works
    - Click "Analytics" (should be active)
    - Verify background highlight + left border
    - Navigate to another page
    - Verify previous item no longer active
    - Verify new item is active
    
[ ] Category collapse/expand works
    - Click category header
    - Category items collapse
    - Click again
    - Category items expand
    
[ ] Premium plan section visible
    - Scroll to bottom
    - Verify "Pro Plan Active" section visible
    - Verify "Ver Plan" button clickable
    
[ ] Dark mode works
    - Enable dark mode
    - Verify sidebar background dark (white/5)
    - Verify text readable
    - Verify hover states work
    
[ ] Mobile hamburger menu works
    - Resize to <768px
    - Sidebar should be hidden
    - Hamburger button visible
    - Click hamburger
    - Menu slides in
    - Click item
    - Menu closes and navigates
    
[ ] Responsive on desktop
    - Resize to 1920x1080
    - Sidebar visible (250px)
    - Content properly margined
    - No overlaps
```

**Commit Message:** `test: verify admin sidebar functionality and role detection`

---

### ✓ Task 17: Test Route Protection & Redirects

**Test Environment:**
- Test both authenticated and unauthenticated states

**Test Cases:**

```
[ ] Non-admin redirected from /admin/*
    - Clear admin_session cookie (DevTools)
    - Try to access /admin/analytics
    - Should redirect to /
    
[ ] Invalid session redirects to login
    - Set admin_session to invalid value
    - Try to access /admin/analytics
    - Should redirect to /admin/login
    
[ ] Expired session redirects to login
    - Modify admin_session cookie expiration to past date
    - Try to access /admin/analytics
    - Should redirect to /admin/login
    
[ ] /admin/login accessible without auth
    - Clear admin_session cookie
    - Go to /admin/login
    - Page loads (no redirect)
    
[ ] Successful login sets cookie
    - Go to /admin/login
    - Enter correct password
    - Submit
    - Check DevTools Cookies
    - Verify admin_session cookie exists
    - Verify httpOnly flag set
    - Verify path = /admin
    - Verify maxAge = 86400 (24hr)
    
[ ] Middleware validates correctly
    - Set valid admin_session
    - Access /admin/analytics
    - Page loads (no redirect)
    - Access /admin/tests
    - Page loads (no redirect)
    
[ ] Routes without /admin/ not affected
    - Clear admin_session
    - Go to / (home)
    - Page loads (no redirect)
    - Go to /tests
    - Page loads (no redirect)
    - Go to /dashboard
    - Page loads (no redirect)
```

**Commit Message:** `test: verify route protection and authentication redirects`

---

### ✓ Task 18: Final Integration & Polish

**Pre-Deployment Verification:**

```
[ ] Build without errors
    - Run: npm run build
    - No TypeScript errors
    - No build warnings
    - Build size acceptable (<+20KB)
    
[ ] No console errors
    - Open Chrome DevTools Console
    - Load / (home)
    - Verify no errors
    - Verify no warnings
    - Load /admin/login
    - Verify no errors
    - Load /admin/analytics
    - Verify no errors
    
[ ] No hydration mismatches
    - Check for "Hydration mismatch" errors
    - All pages render correctly SSR + CSR
    
[ ] Accessibility
    - Install axe DevTools extension
    - Run audit on /
    - Run audit on /admin/analytics
    - Verify no critical issues
    - Check keyboard navigation (Tab, Enter, Escape)
    - Check screen reader compatibility
    
[ ] Dark mode consistency
    - Enable dark mode
    - Check / (user sidebar)
    - Check /admin/analytics (admin sidebar)
    - Check /admin/login
    - Verify all pages look correct
    - Verify contrast meets WCAG AA
    
[ ] Responsive design
    - Desktop (1920x1080)
      - [ ] Sidebar visible
      - [ ] Content properly margined
      - [ ] No horizontal scroll
    - Tablet (768x1024)
      - [ ] Sidebar transition working
      - [ ] Content responsive
    - Mobile (375x667)
      - [ ] Hamburger menu visible
      - [ ] Sidebar hidden until hamburger clicked
      - [ ] Full width content
      - [ ] Touch-friendly buttons
    
[ ] All admin pages load
    - [ ] /admin (overview)
    - [ ] /admin/analytics (existing)
    - [ ] /admin/generate (existing)
    - [ ] /admin/tests (new)
    - [ ] /admin/bulk-generate (new)
    - [ ] /admin/users (new)
    - [ ] /admin/revenue (new)
    - [ ] /admin/settings (new)
    
[ ] All user pages still work
    - [ ] / (home)
    - [ ] /tests
    - [ ] /dashboard
    - [ ] /profile
    
[ ] No breaking changes
    - User sidebar functionality unchanged
    - Navigation links work
    - Theme/Sound toggles work
    - Existing admin pages (analytics, generate) work
    
[ ] Git history clean
    - All commits have good messages
    - No WIP commits
    - Feature branch ready for PR
```

**Commit Message:** `test: final integration verification and polish`

---

## Commit Summary

**Expected commits (18 total):**

```
1. feat: add role detection utility with multi-layer fallback strategy
2. feat: implement admin sidebar with 5 organized menu categories
3. feat: create sidebar wrapper for role-based sidebar selection
4. feat: create admin layout wrapper with route protection
5. refactor: integrate SidebarWrapper into root layout
6. feat: create admin overview dashboard page
7. feat: create admin tests management page stub
8. feat: create admin bulk test generator page stub
9. feat: create admin users management page stub
10. feat: create admin revenue tracking page stub
11. feat: create admin settings configuration page stub
12. feat: add middleware to protect admin routes
13. feat: create admin layout with sidebar margin and protection
14. feat: add mobile hamburger menu for admin sidebar
15. test: verify user sidebar functionality for non-admin users
16. test: verify admin sidebar functionality and role detection
17. test: verify route protection and authentication redirects
18. test: final integration verification and polish
```

---

## Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- npm packages installed (`npm install`)
- Knowledge of Next.js, React, Tailwind CSS
- Understanding of current QuizLab architecture

### Step-by-Step Execution

**1. Start Feature Branch**
```bash
git checkout -b feature/dual-sidebar-system
git pull origin main
```

**2. Execute Phase 1 (5 tasks, ~2-3 hours)**
- Create role detection utility
- Create admin sidebar component
- Create sidebar wrapper
- Create admin layout wrapper
- Update root layout
- Commit each task

**3. Execute Phase 2 (7 tasks, ~3-4 hours)**
- Create admin overview page
- Create 5 admin page stubs
- Update middleware
- Commit each task

**4. Execute Phase 3 (1 task, ~30 minutes)**
- Create admin layout.tsx
- Commit task

**5. Execute Phase 4 (1 task, ~1-2 hours)**
- Add mobile hamburger menu
- Commit task

**6. Execute Phase 5 (4 tasks, ~2-3 hours)**
- Test user sidebar
- Test admin sidebar
- Test route protection
- Final verification
- Commit test results

**7. Submit Pull Request**
```bash
git push origin feature/dual-sidebar-system
# Create PR on GitHub
```

### Testing Commands

```bash
# Type check
tsc --noEmit

# Lint
npm run lint

# Build
npm run build

# Dev server (for manual testing)
npm run dev
```

---

## Troubleshooting

### Issue: Hydration Mismatch
**Cause:** SidebarWrapper renders different content on server vs client
**Solution:** Use loading state and SSR default (render user sidebar during SSR)

### Issue: Admin Sidebar Not Appearing
**Cause:** admin_session cookie not set or expired
**Solution:** Check cookie in DevTools, verify login flow worked

### Issue: Route Redirects to /admin/login
**Cause:** Middleware validation failed
**Solution:** Verify middleware.ts exists, check cookie validation logic

### Issue: Mobile Menu Not Working
**Cause:** Event handlers not firing
**Solution:** Verify useEffect, event listener setup, z-index conflicts

---

## Success Metrics

✓ All tests passing  
✓ No console errors  
✓ No TypeScript errors  
✓ No breaking changes  
✓ User sidebar unchanged  
✓ Admin sidebar fully functional  
✓ Route protection working  
✓ Mobile responsive  
✓ Dark mode support  
✓ Accessibility standards met  

---

**Plan Created:** 2026-06-03  
**Last Updated:** 2026-06-03  
**Ready to Execute:** YES
