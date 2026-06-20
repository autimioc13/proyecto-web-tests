# Dual Sidebar System - Architecture Diagrams

**Visual Reference Guide for the Dual Sidebar System**  
**Created:** 2026-06-03

---

## 1. System Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     USER REQUEST                             │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────┐
         │      Next.js Middleware           │
         │  1. Check /admin/* route?         │
         │  2. Validate admin_session        │
         │  3. Redirect if invalid           │
         └────────────┬────────────────────┘
                      │
          ┌───────────┴────────────┐
          │                        │
          ▼                        ▼
      /admin/*              /user/* or /
      Routes                  Routes
          │                    │
          ├─────────────┬──────┤
          │             │      │
          ▼             ▼      ▼
     AdminLayout    RootLayout PageComponent
     ├─ Check role     │
     ├─ Protect        ├─ Render Providers
     └─ Margin 250px   ├─ Render SidebarWrapper
                       └─ Render MainContent
                          │
                          ▼
                    ┌──────────────────┐
                    │ SidebarWrapper   │
                    │ (Client Comp)    │
                    │                  │
                    │ useEffect() {    │
                    │  detect role     │
                    │  from cookie     │
                    │ }                │
                    └─────┬────────────┘
                          │
              ┌───────────┴────────────┐
              │                        │
     admin_session exists     No admin_session
              │                        │
              ▼                        ▼
        ┌──────────────┐        ┌──────────────┐
        │  AdminSidebar│        │    Sidebar   │
        │  (250px)     │        │   (96px)     │
        │  5 Categories│        │  User Items  │
        │  20 Items    │        │              │
        └──────────────┘        └──────────────┘
              │                        │
              │        ┌──────────────┬┘
              │        │
              ▼        ▼
        ┌──────────────────────┐
        │   Rendered Page      │
        │   with Sidebar       │
        └──────────────────────┘
```

---

## 2. Role Detection Flow

```
    ┌─────────────────────────────────────────────┐
    │  detectUserRole() called                    │
    │  (Server Component or API Route)            │
    └──────────────────┬──────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  STEP 1: Check Cookie       │
        │  admin_session exists?      │
        │  & not expired?             │
        └──┬─────────────────────────┬┘
           │ YES               │ NO
           │                   │
      return               continue
      'admin'                  │
                               ▼
            ┌──────────────────────────────┐
            │  STEP 2: Check Env Variable  │
            │  User email in                │
            │  ADMIN_EMAILS list?          │
            └──┬──────────────────────────┬┘
               │ YES             │ NO
               │                 │
          return            continue
          'admin'                 │
          (dev only)              ▼
                    ┌──────────────────────────────┐
                    │  STEP 3: Check Database      │
                    │  Supabase user.role =        │
                    │  'admin'?                    │
                    └──┬────────────────────────┬──┘
                       │ YES          │ NO
                       │              │
                  return          return
                  'admin'          'user'
                                (default)
                       │
                       └──────┬───────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   UserRole       │
                    │  ('admin'|'user')│
                    └──────────────────┘
```

---

## 3. Component Hierarchy

```
RootLayout (src/app/layout.tsx)
├── Providers (ThemeProvider, SoundProvider)
├── SidebarWrapper (NEW)
│   ├── [Client-side role detection]
│   │
│   ├─ If loading: <Sidebar /> (SSR safe)
│   │
│   ├─ If isLoaded:
│   │   ├─ role='admin': <AdminSidebar />
│   │   │   └─ 5 Categories
│   │   │       ├─ DASHBOARD (2 items)
│   │   │       ├─ CREATE & MANAGE (6 items)
│   │   │       ├─ ANALYTICS & GROWTH (4 items)
│   │   │       ├─ MONETIZATION (4 items)
│   │   │       └─ USERS & CONFIG (4 items)
│   │   │
│   │   └─ role='user': <Sidebar />
│   │       └─ Nav Items (4 items)
│   │           ├─ Home
│   │           ├─ Tests
│   │           ├─ Dashboard
│   │           └─ Profile
│   │       + Sound/Theme Toggles
│   │
│   └── [Premium Plan Section] (admin only)
│
├── MainContent
│   └── <children /> (pages)
│
└── Footer + CookieConsent

AdminLayout (src/app/admin/layout.tsx)
├── Server-side role check
├─ If not admin: redirect('/')
├─ If admin: render with md:ml-[250px]
└── <children />
```

---

## 4. File Structure Tree

```
src/
├── components/
│   ├── nav/
│   │   ├── Sidebar.tsx .......................... [EXISTING - no changes]
│   │   │   └─ 96px fixed, icon-only
│   │   │   └─ Home, Tests, Dashboard, Profile
│   │   │   └─ Sound, Theme toggles
│   │   │
│   │   └── SidebarWrapper.tsx .................. [NEW]
│   │       └─ Role detection wrapper
│   │       └─ Client component ('use client')
│   │       └─ Renders Sidebar or AdminSidebar
│   │
│   └── admin/
│       └── AdminSidebar.tsx .................... [NEW]
│           └─ 250px fixed, icon + label
│           └─ 5 categories, 20 items
│           └─ Collapsible categories
│           └─ Premium plan footer
│           └─ Mobile hamburger
│
├── app/
│   ├── layout.tsx ............................. [MODIFIED]
│   │   └─ OLD: <Sidebar />
│   │   └─ NEW: <SidebarWrapper />
│   │
│   ├── page.tsx ............................... [EXISTING]
│   ├── tests/ ................................. [EXISTING]
│   ├── dashboard/ ............................. [EXISTING]
│   ├── profile/ ............................... [EXISTING]
│   │
│   └── admin/
│       ├── layout.tsx ......................... [NEW]
│       │   └─ Server-side role check
│       │   └─ Redirect non-admins to /
│       │   └─ md:ml-[250px] margin
│       │
│       ├── page.tsx ........................... [NEW]
│       │   └─ Admin overview dashboard
│       │
│       ├── login/ ............................. [EXISTING]
│       │   └─ Admin login form
│       │
│       ├── analytics/ ......................... [EXISTING]
│       │   └─ Analytics dashboard
│       │
│       ├── generate/ .......................... [EXISTING]
│       │   └─ AI test generator
│       │
│       ├── tests/ ............................. [NEW]
│       │   └─ Tests management page
│       │
│       ├── bulk-generate/ .................... [NEW]
│       │   └─ Bulk test generation
│       │
│       ├── users/ ............................ [NEW]
│       │   └─ User management
│       │
│       ├── revenue/ .......................... [NEW]
│       │   └─ Revenue tracking
│       │
│       ├── settings/ ......................... [NEW]
│       │   └─ Admin settings
│       │
│       ├── borrowers/ ........................ [NEW]
│       ├── categories/ ....................... [NEW]
│       ├── results/ .......................... [NEW]
│       ├── traffic/ .......................... [NEW]
│       ├── sources/ .......................... [NEW]
│       ├── funnel/ ........................... [NEW]
│       ├── retention/ ........................ [NEW]
│       ├── products/ ......................... [NEW]
│       ├── ads/ .............................. [NEW]
│       ├── affiliates/ ....................... [NEW]
│       ├── roles/ ............................ [NEW]
│       └── legal/ ............................ [NEW]
│
├── lib/
│   ├── role-detection.ts ...................... [NEW]
│   │   ├─ detectUserRole()
│   │   ├─ isAdminUser()
│   │   └─ extractCookie()
│   │
│   └── admin-auth.ts .......................... [EXISTING]
│       ├─ isValidPassword()
│       ├─ createAdminSession()
│       └─ validateAdminSession()
│
└── middleware.ts ............................. [NEW or MODIFIED]
    └─ Route protection for /admin/*
    └─ Cookie validation
    └─ Redirect to /admin/login if invalid
```

---

## 5. State Flow Diagram

```
                    User Visits Page
                          │
                          ▼
                    ┌──────────────┐
                    │ RootLayout   │ (Server)
                    │ renders      │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────────────┐
                    │ SidebarWrapper       │ (Client)
                    │ (useState: isLoaded) │
                    │ (useState: role)     │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼──────────┐
                    │ During SSR/Initial  │
                    │ isLoaded = false    │
                    │ Render: <Sidebar /> │
                    │ (Safe default)      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ After Hydration     │
                    │ useEffect fires     │
                    │ Check cookie:       │
                    │ 'admin_session'?    │
                    │ setRole() & setIsLoaded()
                    └──────────┬──────────┘
                               │
          ┌────────────────────┴─────────────────┐
          │                                      │
     ┌────▼──────────┐                ┌─────────▼─────┐
     │ role='admin'  │                │ role='user'   │
     │ isLoaded=true │                │ isLoaded=true │
     └────┬──────────┘                └─────────┬─────┘
          │                                     │
          ▼                                     ▼
   ┌────────────────┐                ┌─────────────────┐
   │ AdminSidebar   │                │    Sidebar      │
   │ (250px)        │                │   (96px)        │
   │ - 5 Categories │                │ - 4 Nav Items   │
   │ - 20 Items     │                │ - Sound Toggle  │
   │ - Active state │                │ - Theme Toggle  │
   │ - Mobile menu  │                │ - Same styles   │
   └────┬───────────┘                └────┬────────────┘
        │                                 │
        └────────────┬────────────────────┘
                     │
                     ▼
           ┌──────────────────┐
           │  Page Rendered   │
           │  with Sidebar    │
           │  + Content       │
           └──────────────────┘
```

---

## 6. Admin Sidebar Categories Layout

```
┌─────────────────────────────────┐
│    QUIZLAB COMMAND CENTER       │  ▲
│            🧪                   │  │ Logo Area (60px)
├─────────────────────────────────┤  ▼
│                                 │
│ ▼ DASHBOARD (collapsible)       │
│   • Overview                    │  ◄─ Active: bg highlight
│   • Analytics                   │     + left border
│                                 │
│ ▼ CREATE & MANAGE               │
│   • AI Factory                  │  ◄─ Scrollable
│   • Tests                       │     content area
│   • Bulk Generator              │
│   • Borrowers                   │
│   • Categories                  │
│   • Results                     │
│                                 │
│ ▼ ANALYTICS & GROWTH            │
│   • Real-time Traffic           │
│   • Traffic Sources             │
│   • Conversion Funnel           │
│   • Retention                   │
│                                 │
│ ▼ MONETIZATION                  │
│   • Revenue                     │
│   • Products                    │
│   • Ads                         │
│   • Affiliates                  │
│                                 │
│ ▼ USERS & CONFIG                │
│   • Users                       │
│   • Roles & Permissions         │
│   • Settings                    │
│   • Legal & Compliance          │
│                                 │  ◄─ flex-1 grows
│                                 │
├─────────────────────────────────┤
│     🌟 Pro Plan Active          │  ▲
│  Full access to all features    │  │ Premium
│  ┌───────────────────────────┐  │  │ Section
│  │      Ver Plan             │  │  │ (60px)
│  └───────────────────────────┘  │  ▼
└─────────────────────────────────┘
◄─────────── 250px ──────────────►
```

---

## 7. Request Flow - Admin User

```
        User visits /admin/analytics
                    │
                    ▼
        ┌─────────────────────────────┐
        │      Middleware Check       │
        │  pathname: /admin/*?  YES   │
        │  Check admin_session        │
        └──────────┬──────────────────┘
                   │
           ┌───────▼────────┐
           │                │
      VALID            INVALID
        │                │
        ▼                ▼
     Continue      Redirect to
     request       /admin/login
        │                │
        ▼                ▼
   AdminLayout      Login Page
   (Server)         ├─ Form
   Check role       ├─ Input password
   Is admin?        └─ Submit
     │              (creates session)
  YES│
     ▼
  Render:
  - Set md:ml-[250px] margin
  - Pass children
     │
     ▼
  Page renders
  ├─ SidebarWrapper
  │  └─ admin_session in cookie
  │     └─ isLoaded = true after hydration
  │        └─ role = 'admin'
  │           └─ Render AdminSidebar (250px)
  │
  └─ MainContent with proper margin
     └─ Admin Analytics Page
        ├─ KPI Cards
        ├─ Charts
        └─ Tables
```

---

## 8. Request Flow - Regular User

```
        User visits /tests
                    │
                    ▼
        ┌─────────────────────────────┐
        │      Middleware Check       │
        │  pathname: /admin/*?  NO    │
        │  Skip admin checks          │
        └──────────┬──────────────────┘
                   │
              Continue
              request
                   │
                   ▼
            RootLayout
            ├─ No AdminLayout
            ├─ Normal md:ml-24 margin
            └─ <children>
               │
               ▼
            Tests Page
            ├─ SidebarWrapper
            │  └─ No admin_session in cookie
            │     └─ isLoaded = true after hydration
            │        └─ role = 'user'
            │           └─ Render Sidebar (96px)
            │              ├─ Home
            │              ├─ Tests (active)
            │              ├─ Dashboard
            │              ├─ Profile
            │              ├─ Sound toggle
            │              └─ Theme toggle
            │
            └─ MainContent
               └─ Tests Listing Page
                  ├─ Test cards
                  ├─ Categories
                  └─ Filters
```

---

## 9. Mobile Layout Diagram

### Desktop View (>=768px)
```
┌─────┬──────────────────────────────────────┐
│     │                                      │
│ AD  │                                      │
│ MI  │        MAIN CONTENT                 │
│ N   │        (with proper margin)         │
│ SB  │                                      │
│     │        For admin: md:ml-[250px]    │
│ 250 │        For user: md:ml-24          │
│ px  │                                      │
│     │                                      │
│     │                                      │
│     │                                      │
└─────┴──────────────────────────────────────┘
```

### Mobile View (<768px)
```
┌──────────────────────────────────────┐
│ ☰  QUIZLAB              🌙 🔊       │  ◄─ Header
├──────────────────────────────────────┤
│                                      │
│        MAIN CONTENT                  │
│        (full width)                  │
│                                      │
│        For admin: No sidebar         │
│        (hamburger menu in header)    │
│                                      │
│        For user: No sidebar          │
│        (only on desktop md:)        │
│                                      │
│                                      │
└──────────────────────────────────────┘
```

### Mobile With Admin Menu Open
```
┌────────────────────────────────────┐
│ ← QUIZLAB          (Close)         │ ◄─ Header
├────────────────────────────────────┤
│ ▐ DASHBOARD                        │ ◄─ Sidebar
│   • Overview                       │    (slides in)
│   • Analytics                      │
│                                    │
│ ▐ CREATE & MANAGE                  │
│   • AI Factory                     │
│   • Tests                          │
│   • ... (scrollable)               │
│                                    │
│                                    │
│                          ┌────────┐│
│ (Overlay/Backdrop)      │Content ││
│ (semi-transparent)      │Visible?││
│                         └────────┘│
└────────────────────────────────────┘
```

---

## 10. Data Flow - Session Management

```
                 /admin/login
                      │
                      ▼
            ┌──────────────────────┐
            │  Admin Login Form    │
            │  ├─ Email (future)   │
            │  ├─ Password         │
            │  └─ Submit button    │
            └──────────┬───────────┘
                       │
                       ▼ POST /api/admin/login
            ┌──────────────────────────────┐
            │   API Validation             │
            │   ├─ Check password          │
            │   │  vs ADMIN_PASSWORD       │
            │   └─ Is valid?               │
            └──┬──────────────────────┬────┘
         NO │                        │ YES
           │                        │
           ▼                        ▼
     Return error            ┌──────────────────┐
     ├─ 401 Unauthorized     │ Create Session   │
     └─ Message: "Contraseña │ ├─ Token: random │
        incorrecta"          │ └─ Expires: +24h │
                             └────────┬─────────┘
                                      │
                                      ▼
                             ┌─────────────────────────┐
                             │ Set admin_session       │
                             │ Cookie                  │
                             ├─ Name: admin_session   │
                             ├─ Value: token:expires  │
                             ├─ httpOnly: true        │
                             ├─ Secure: true (prod)   │
                             ├─ SameSite: strict      │
                             ├─ Path: /admin          │
                             └─ MaxAge: 86400        │
                                      │
                                      ▼
                             ┌─────────────────────┐
                             │ Return 200 OK       │
                             │ + Cookie            │
                             │ + Redirect signal   │
                             └────────┬────────────┘
                                      │
                                      ▼ Client redirect
                             /admin/analytics
                                      │
                                      ▼
                             SidebarWrapper
                             ├─ useEffect
                             ├─ Check cookie
                             ├─ Found: admin_session
                             ├─ Set role = 'admin'
                             └─ Render AdminSidebar
```

---

## 11. Component Interaction Diagram

```
┌────────────────────────────────────────────────────────┐
│                   RootLayout                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ThemeProvider + SoundProvider                   │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ <SidebarWrapper />                         │  │  │
│  │  │ (Client Component)                         │  │  │
│  │  │ - useEffect: detect admin_session          │  │  │
│  │  │ - useState: isLoaded, role                 │  │  │
│  │  │ - Render Sidebar OR AdminSidebar           │  │  │
│  │  │   based on role                            │  │  │
│  │  │                                            │  │  │
│  │  │ ┌─ <Sidebar /> ──────────────┐             │  │  │
│  │  │ │ (User sidebar)             │             │  │  │
│  │  │ │ - 96px fixed width         │             │  │  │
│  │  │ │ - 4 nav items              │             │  │  │
│  │  │ │ - Sound toggle             │             │  │  │
│  │  │ │ - Theme toggle             │             │  │  │
│  │  │ └────────────────────────────┘             │  │  │
│  │  │                                            │  │  │
│  │  │ ┌─ <AdminSidebar /> ────────┐             │  │  │
│  │  │ │ (Admin sidebar)            │             │  │  │
│  │  │ │ - 250px fixed width        │             │  │  │
│  │  │ │ - 5 categories             │             │  │  │
│  │  │ │ - 20 menu items            │             │  │  │
│  │  │ │ - Premium plan footer      │             │  │  │
│  │  │ │ - Mobile hamburger         │             │  │  │
│  │  │ └────────────────────────────┘             │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ <main className="md:ml-24">               │  │  │
│  │  │ {children}                                │  │  │
│  │  │ </main>                                   │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                            │
                            ├─ User pages
                            │  └─ / /tests /dashboard /profile
                            │     (md:ml-24 margin)
                            │
                            └─ Admin pages
                               └─ /admin/* 
                                  └─ AdminLayout wrapper
                                     (md:ml-[250px] margin)
                                     (server-side role check)
```

---

## 12. Authentication State Machine

```
┌─────────────────────────────────────────────────────────┐
│                  Authentication States                  │
└─────────────────────────────────────────────────────────┘

      ┌──────────────────┐
      │   UNAUTHENTICATED│
      │  (No admin_session)
      └────────┬─────────┘
               │
      Click "Login"
               │
               ▼
      ┌──────────────────┐
      │   LOGIN_PENDING  │
      │  (Submitting form)
      └────┬───────────┬─┘
      ✓    │           │    ✗
        ┌──┘           └──┐
        │                 │
        ▼                 ▼
   AUTHENTICATED    LOGIN_ERROR
   (admin_session    (401 Unauthorized)
    set, valid)      (Show error msg)
        │                 │
        └─────────┬───────┘
                  │
          Try Again
                  │
                  └─────► LOGIN_PENDING
                            │
        ┌───────────────────┴─────────────────────┐
        │                                         │
        ▼                                         ▼
    SESSION_EXPIRED                      AUTHENTICATED
    (24hr passed, cookie)                (admin_session
    (Redirect to login)                   still valid)
        │                                   │
        │                                   ├─ Access /admin/*
        │                                   │  (Middleware allows)
        │                                   │
        └───────────────► UNAUTHENTICATED ◄─┤ Click Logout
                                             │
                                             └─ Clear cookie
```

---

## Summary

These diagrams provide visual representation of:
1. ✓ Overall system flow and user journey
2. ✓ Role detection priority and logic
3. ✓ Component hierarchy and nesting
4. ✓ File structure and organization
5. ✓ State management and updates
6. ✓ Admin sidebar menu layout
7. ✓ Admin vs. regular user flows
8. ✓ Mobile and desktop layouts
9. ✓ Session management flow
10. ✓ Component interactions
11. ✓ Authentication state machine

Use these diagrams as reference while implementing the system.

---

**Diagrams Created:** 2026-06-03  
**For Reference During:** Implementation Phase
