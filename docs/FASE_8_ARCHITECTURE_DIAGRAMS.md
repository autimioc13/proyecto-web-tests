# FASE 8: Architecture Diagrams & Flow Charts

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FASE 8: ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────┘

                          Next.js 16 (App Router)
                    ┌─────────────────────────────┐
                    │    Client Components        │
                    │  - Login/Signup Pages       │
                    │  - Profile Page             │
                    │  - Checkout Page            │
                    │  - Admin Dashboard          │
                    └────────────┬────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼─────┐           ┌──────▼──────┐
              │  Contexts │           │  Middleware │
              │ - Auth    │           │  (Protected │
              │ - Cart    │           │   Routes)   │
              │ - Sound   │           └─────────────┘
              └─────┬─────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼────┐  ┌──────▼───┐  ┌────────▼────┐
│Browser │  │HTTP Lib  │  │  API Routes │
│Storage │  │(Supabase)│  │ /api/orders │
│        │  │          │  │ /api/payment│
└────────┘  └──────┬───┘  └────────┬────┘
                   │               │
                   └───────┬───────┘
                           │
                    ┌──────▼──────────┐
                    │  Supabase Edge  │
                    │  Functions (JWT │
                    │  Validation)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼─────┐    ┌────────▼────────┐  ┌───────▼────────┐
   │Supabase  │    │  PostgreSQL DB  │  │  Row-Level    │
   │Auth      │    │  (7 Tables)     │  │  Security    │
   │- Google  │    │                 │  │  (RLS)       │
   │- GitHub  │    │  - users        │  │  Policies    │
   │- Email   │    │  - user_roles   │  │              │
   │          │    │  - carts        │  │              │
   │          │    │  - orders       │  │              │
   │          │    │  - order_items  │  │              │
   │          │    │  - purchases    │  │              │
   │          │    │  - audit_logs   │  │              │
   └──────────┘    └─────────────────┘  └────────────────┘
        │                   │
        └─────────┬─────────┘
                  │
         ┌────────▼─────────┐
         │  External APIs   │
         │  - Google OAuth  │
         │  - GitHub OAuth  │
         │  - Stripe        │
         │  - SendGrid      │
         └──────────────────┘
```

---

## 2. Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                            │
└──────────────────────────────────────────────────────────────────┘

        USER SIGNUP / LOGIN
              │
        ┌─────▼─────┐
        │ OAuth or  │
        │ Email/    │
        │ Password  │
        └─────┬─────┘
              │
         ┌────▼────┐
         │Supabase │
         │  Auth   │
         └────┬────┘
              │
    ┌─────────┼─────────┐
    │                   │
    │ (OAuth Redirect)  │ (Email/Password)
    │                   │
┌───▼──────┐      ┌─────▼──────┐
│Google/   │      │Email/Password
│GitHub    │      │Validation
│Provider  │      │
└───┬──────┘      └─────┬──────┘
    │                   │
    └─────────┬─────────┘
              │
         ┌────▼────────────────┐
         │Exchange Code/Token  │
         │ for Session (JWT)   │
         └────┬────────────────┘
              │
         ┌────▼──────────────────────────┐
         │ GET /auth/callback with code  │
         │ ↓                             │
         │ supabase.auth.exchangeCode()  │
         │ ↓                             │
         │ Get authenticated user        │
         └────┬───────────────────────────┘
              │
         ┌────▼──────────────────────────┐
         │ Create/Update User Profile    │
         │                               │
         │ INSERT INTO public.users      │
         │ {                             │
         │   id,                         │
         │   email,                      │
         │   full_name,                  │
         │   avatar_url,                 │
         │   provider,                   │
         │   is_verified,                │
         │   last_login_at               │
         │ }                             │
         └────┬───────────────────────────┘
              │
         ┌────▼──────────────────────────┐
         │ Assign Default User Role      │
         │                               │
         │ INSERT INTO public.user_roles │
         │ {                             │
         │   user_id,                    │
         │   role: 'user'                │
         │ }                             │
         └────┬───────────────────────────┘
              │
         ┌────▼──────────────────────────┐
         │ Log Auth Event                │
         │                               │
         │ INSERT INTO public.audit_logs │
         │ {                             │
         │   user_id,                    │
         │   action: 'login',            │
         │   status: 'success',          │
         │   ip_address,                 │
         │   timestamp                   │
         │ }                             │
         └────┬───────────────────────────┘
              │
         ┌────▼──────────────────┐
         │ Set HTTP-only Cookie  │
         │ (Session Token)       │
         └────┬──────────────────┘
              │
         ┌────▼──────────────────┐
         │ Redirect to Dashboard │
         │ /dashboard            │
         └───────────────────────┘
```

---

## 3. Protected Routes Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                  PROTECTED ROUTES MIDDLEWARE                      │
└──────────────────────────────────────────────────────────────────┘

        USER REQUESTS PAGE
              │
         ┌────▼─────────────────┐
         │ Middleware intercepts │
         │ (src/middleware.ts)   │
         └────┬─────────────────┘
              │
         ┌────▼──────────────────────────────┐
         │ Check Route Pattern              │
         │ - /admin/*                       │
         │ - /dashboard/*                   │
         │ - /profile/*                     │
         │ - /checkout/*                    │
         └────┬───────────────────────────────┘
              │
    ┌─────────┴──────────┐
    │ Is Protected Route? │
    └─┬──────────────┬──┐
      NO             YES
      │              │
  ┌───▼──┐    ┌──────▼─────────┐
  │Allow │    │Get auth session │
  │▼     │    │from cookies     │
  └──────┘    └─────┬──────────┘
                    │
              ┌─────▼─────────┐
              │User logged in?│
              └┬────────────┬─┘
               NO          YES
               │           │
         ┌─────▼────┐  ┌────▼────────┐
         │Redirect  │  │Check route  │
         │to /auth/ │  │type         │
         │login     │  └┬───────┬────┘
         │?next=... │   │      │
         └──────────┘   │      │
                   ┌────┴──┬────┴──┐
                   │       │       │
              /admin* /profile /dashboard
                │       │        │
          ┌─────▼──┐ ┌──▼──┐ ┌──▼──┐
          │Check   │ │Allow│ │Allow│
          │admin   │ │  ▼  │ │  ▼  │
          │role    │ └─────┘ └─────┘
          └┬────┬──┘
           YES NO
           │   │
        ┌──▼┐ ┌▼──────────┐
        │All│ │Redirect to│
        │ow │ │home page  │
        │▼  │ │/          │
        └───┘ └───────────┘
```

---

## 4. Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                   DATABASE RELATIONSHIPS                          │
└──────────────────────────────────────────────────────────────────┘

        auth.users (Supabase Auth)
            │
            │ FK: auth.users.id → public.users.id
            │
        ┌───▼────────────────────┐
        │   public.users         │
        │ ────────────────       │
        │ id (UUID, PK)          │
        │ email (VARCHAR)        │
        │ full_name (VARCHAR)    │
        │ avatar_url (TEXT)      │
        │ provider (VARCHAR)     │
        │ is_verified (BOOL)     │
        │ last_login_at (TS)     │
        └───┬────────────────────┘
            │
     ┌──────┴────────────┬──────────────┬─────────────┐
     │                   │              │             │
FK   │ 1                 │ 1            │ 1           │ 1
     │ to N              │ to N         │ to N        │ to N
     │                   │              │             │
┌────▼──────────┐  ┌────▼──────────┐ ┌▼───────────┐┌▼──────────────┐
│public.        │  │public.        │ │public.    ││public.        │
│user_roles     │  │carts          │ │orders     ││purchases      │
├───────────────┤  ├───────────────┤ ├───────────┤├────────────────┤
│id (PK)        │  │id (PK)        │ │id (PK)    ││id (PK)        │
│user_id (FK)   │  │user_id (FK)   │ │user_id(FK)││order_id (FK)  │
│role           │  │items (JSONB)  │ │status     ││user_id (FK)   │
│assigned_at    │  │total_price    │ │total_price││product_id    │
│assigned_by    │  │item_count     │ │created_at ││product_title │
└───────────────┘  └───────────────┘ └─────┬─────┘└────────────────┘
                                           │
                                           │ 1 to N
                                           │
                                    ┌──────▼────────────┐
                                    │public.order_items │
                                    ├──────────────────┤
                                    │id (PK)           │
                                    │order_id (FK)     │
                                    │product_id        │
                                    │product_title     │
                                    │quantity          │
                                    │unit_price        │
                                    │subtotal          │
                                    └──────────────────┘


    Each user has:
    - 1+ roles (user, admin, moderator)
    - 0-1 cart
    - 0+ orders
    - 0+ purchases
    - 0+ order items (through orders)
    - 0+ audit logs
```

---

## 5. Cart Sync Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    CART SYNCHRONIZATION                           │
└──────────────────────────────────────────────────────────────────┘

        USER NOT LOGGED IN
              │
        ┌─────▼──────────────┐
        │ Use localStorage   │
        │ 'quizlab-cart'     │
        │                    │
        │ {                  │
        │   items: [...],    │
        │   totalPrice,      │
        │   itemCount        │
        │ }                  │
        └─────┬──────────────┘
              │
              │ When user logs in:
              │
        ┌─────▼─────────────────────────┐
        │ AuthContext detects user      │
        └─────┬───────────────────────────┘
              │
        ┌─────▼──────────────────────────┐
        │ CartContext useEffect fires    │
        │ (user?.id dependency)          │
        └─────┬───────────────────────────┘
              │
        ┌─────▼─────────────────────────────────┐
        │ Fetch cart from database              │
        │                                       │
        │ SELECT * FROM public.carts           │
        │ WHERE user_id = auth.uid()           │
        └─────┬───────────────────────────────┘
              │
         ┌────┴────┐
         │          │
    ┌────▼──┐  ┌───▼─────┐
    │ Cart  │  │Cart not  │
    │found  │  │found     │
    │       │  │          │
    └────┬──┘  └────┬─────┘
         │          │
      Load from   Create
      DB          empty cart
         │          │
         └────┬─────┘
              │
        ┌─────▼──────────────────┐
        │ setCart(databaseCart)  │
        └─────┬──────────────────┘
              │
              │ When user adds/removes/updates items:
              │
        ┌─────▼──────────────────────────────┐
        │ CartContext state updates          │
        └─────┬───────────────────────────────┘
              │
        ┌─────▼──────────────────────────────────┐
        │ useEffect triggered (cart dependency) │
        └─────┬──────────────────────────────────┘
              │
        ┌─────▼──────────────────────────────┐
        │ syncCartToDatabase()               │
        │                                    │
        │ UPDATE public.carts SET           │
        │   items = [...],                  │
        │   total_price = X,                │
        │   item_count = Y,                 │
        │   updated_at = now()              │
        │ WHERE user_id = auth.uid()        │
        └──────────────────────────────────┘
```

---

## 6. Order Creation & Payment Flow

```
┌──────────────────────────────────────────────────────────────────┐
│              ORDER CREATION & PAYMENT FLOW                        │
└──────────────────────────────────────────────────────────────────┘

        USER ON CHECKOUT PAGE
              │
        ┌─────▼──────────────────┐
        │ Review Cart Items      │
        │ - Product names        │
        │ - Quantities           │
        │ - Prices               │
        │ - Total                │
        └─────┬──────────────────┘
              │
        ┌─────▼──────────────────┐
        │ Select Payment Method  │
        │ - Stripe (Cards)       │
        │ - PayPal               │
        │ - Mock (Testing)       │
        └─────┬──────────────────┘
              │
        ┌─────▼──────────────────────────────┐
        │ Click "Proceder al Pago"           │
        └─────┬────────────────────────────────┘
              │
        ┌─────▼─────────────────────────────────────────┐
        │ POST /api/orders/create                      │
        │ {                                            │
        │   items: [                                   │
        │     {                                        │
        │       productId,                            │
        │       productTitle,                         │
        │       category,                             │
        │       quantity,                             │
        │       unitPrice                             │
        │     }                                        │
        │   ],                                         │
        │   total_price,                              │
        │   payment_method                            │
        │ }                                            │
        └─────┬──────────────────────────────────────┘
              │
        ┌─────▼──────────────────────────────────┐
        │ Server validates auth (JWT)           │
        │ - Get user from session              │
        │ - Verify user ID                      │
        └─────┬───────────────────────────────┘
              │
        ┌─────▼────────────────────────────────────┐
        │ CREATE Order in Database                │
        │                                          │
        │ INSERT INTO public.orders {             │
        │   user_id: auth.uid(),                 │
        │   status: 'pending',                   │
        │   total_price,                          │
        │   payment_method,                      │
        │   created_at: now()                    │
        │ }                                       │
        │ RETURNING id                           │
        └─────┬──────────────────────────────────┘
              │
        ┌─────▼────────────────────────────────────┐
        │ CREATE Order Items                       │
        │                                          │
        │ INSERT INTO public.order_items {        │
        │   order_id,                            │
        │   product_id,                          │
        │   product_title,                       │
        │   quantity,                            │
        │   unit_price,                          │
        │   subtotal                             │
        │ } (for each item)                      │
        └─────┬──────────────────────────────────┘
              │
        ┌─────▼─────────────────────────────────┐
        │ Log Audit Event                       │
        │                                       │
        │ INSERT INTO public.audit_logs {      │
        │   user_id,                           │
        │   action: 'order_created',           │
        │   resource_type: 'order',            │
        │   resource_id: order.id,             │
        │   status: 'success'                  │
        │ }                                    │
        └─────┬────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    │ PAYMENT PROCESSOR │
    │                   │
    │ If Stripe:        │
    │   POST /api/      │
    │   payment/create- │
    │   intent          │
    │                   │
    │   Create Stripe   │
    │   PaymentIntent   │
    │                   │
    │   Return          │
    │   clientSecret    │
    │                   │
    │ Client submits    │
    │ payment via       │
    │ Stripe Elements   │
    └─────┬─────────────┘
          │
    ┌─────▼──────────────────────────────┐
    │ Payment Succeeds / Fails           │
    └─────┬──────┬───────────────────────┘
          │      │
       SUCCESS FAILURE
          │      │
    ┌─────▼─┐ ┌──▼──────────┐
    │UPDATE │ │Mark as      │
    │order  │ │'failed'     │
    │status:│ │             │
    │'compl-│ │Log error    │
    │eted' │ │             │
    └─────┬─┘ └──┬──────────┘
          │      │
    ┌─────▼─┐ ┌──▼──────────┐
    │CREATE │ │Retry or     │
    │PURCHAS│ │show error   │
    │ES for │ │to user      │
    │all    │ │             │
    │items  │ │             │
    └─────┬─┘ └─────────────┘
          │
    ┌─────▼─────────────────┐
    │CLEAR User's Cart      │
    │                       │
    │DELETE FROM           │
    │public.carts WHERE    │
    │user_id = auth.uid() │
    └─────┬─────────────────┘
          │
    ┌─────▼──────────────────┐
    │REDIRECT to Profile     │
    │/profile (downloads)    │
    └───────────────────────┘
```

---

## 7. Admin Dashboard Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD FLOW                           │
└──────────────────────────────────────────────────────────────────┘

        USER VISITS /admin/dashboard
              │
        ┌─────▼──────────────────────────┐
        │ Middleware checks:             │
        │ - Is user authenticated?       │
        │ - Does user have admin role?   │
        └─────┬────────────────────────────┘
              │
         ┌────┴────┐
         │          │
    ┌────▼──┐  ┌───▼───────────┐
    │Deny   │  │Allow Access   │
    │(401)  │  │               │
    └───────┘  └───┬───────────┘
                   │
            ┌──────▼──────────────┐
            │Load Admin Component │
            │ (/admin/dashboard)  │
            └──────┬───────────────┘
                   │
        ┌──────────▼──────────────┐
        │ Parallel Queries:      │
        │                        │
        │ 1. Count users        │
        │    SELECT COUNT(*)    │
        │    FROM public.users  │
        │                       │
        │ 2. Count orders       │
        │    SELECT COUNT(*)    │
        │    FROM public.orders │
        │    WHERE status='comp'│
        │                       │
        │ 3. Sum revenue        │
        │    SELECT SUM(        │
        │      total_price      │
        │    )                  │
        │    FROM public.orders │
        │    WHERE status='comp'│
        │                       │
        │ 4. Recent activity    │
        │    SELECT * FROM      │
        │    public.audit_logs  │
        │    ORDER BY created_at│
        │    LIMIT 10           │
        └──────┬────────────────┘
               │
        ┌──────▼────────────────────────┐
        │ Render Stats Cards:           │
        │ - Total Users                 │
        │ - Total Orders                │
        │ - Total Revenue               │
        │ - Recent Activity Count       │
        └──────┬────────────────────────┘
               │
        ┌──────▼────────────────────────┐
        │ Render Activity Table:        │
        │ - Action                      │
        │ - User ID                     │
        │ - Resource Type               │
        │ - Timestamp                   │
        └──────────────────────────────┘
```

---

## 8. Session & Token Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│                  SESSION & TOKEN LIFECYCLE                        │
└──────────────────────────────────────────────────────────────────┘

        USER LOGS IN
              │
        ┌─────▼─────────────────────┐
        │ Supabase Auth creates JWT │
        │ (JSON Web Token)          │
        │                           │
        │ Header:                   │
        │ {                         │
        │   alg: "HS256",          │
        │   typ: "JWT"             │
        │ }                         │
        │                           │
        │ Payload:                  │
        │ {                         │
        │   sub: user_id,          │
        │   aud: "authenticated",  │
        │   exp: (now + 1 hour),   │
        │   iat: now,              │
        │   email: user.email      │
        │ }                         │
        │                           │
        │ Signature: HMAC(          │
        │   SECRET_KEY              │
        │ )                         │
        └─────┬─────────────────────┘
              │
        ┌─────▼──────────────────┐
        │ Set HTTP-only Cookie   │
        │ (Browser stores JWT)   │
        │                        │
        │ Set-Cookie:            │
        │ auth_token=JWT         │
        │ Path=/                 │
        │ HttpOnly               │
        │ Secure (HTTPS)         │
        │ SameSite=Lax           │
        │ Max-Age=3600           │
        └─────┬──────────────────┘
              │
        ┌─────▼──────────────────┐
        │ User Browsing App      │
        │ (Authenticated)        │
        │                        │
        │ Every request includes │
        │ JWT in cookie auto.    │
        └─────┬──────────────────┘
              │
        ┌─────▼─────────────────────┐
        │ Token Expiry            │
        │ Default: 1 hour         │
        └─────┬───────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    │ BEFORE EXPIRY      │ EXPIRED
    │ (0-55 min)         │ (>1 hour)
    │                    │
    │ ┌───────────────┐  │
    │ │Still valid    │  │
    │ │Requests work  │  │
    │ │              │  │
    │ │Supabase auto-│  │ ┌──────────────┐
    │ │refreshes if  │  │ │Check if token│
    │ │expired during│  │ │is expired    │
    │ │request       │  │ │              │
    │ └───────────────┘  │ └──────┬───────┘
    │                    │        │
    │                    │   ┌────▼────┐
    │                    │   │Show login│
    │                    │   │page      │
    │                    │   │          │
    │                    │   └──────────┘
    │                    │
    └────────┬───────────┘
             │
        ┌────▼─────────────┐
        │User Logs Out     │
        │                  │
        │- Delete cookie   │
        │- Clear state     │
        │- Redirect to /   │
        └──────────────────┘
```

---

## 9. RLS (Row-Level Security) Policy Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│            ROW-LEVEL SECURITY (RLS) POLICIES                      │
└──────────────────────────────────────────────────────────────────┘

                     Query to public.orders
                            │
                    ┌───────▼────────┐
                    │ RLS Policy:    │
                    │ "Users can     │
                    │ read own       │
                    │ orders"        │
                    └───────┬────────┘
                            │
                   ┌────────▼────────┐
                   │ Check condition:│
                   │ auth.uid()      │
                   │ = user_id       │
                   │ ?               │
                   └────────┬────────┘
                            │
                   ┌────────┴────────┐
                   │                 │
                ┌──▼──┐          ┌───▼───┐
                │YES  │          │NO     │
                │     │          │       │
            ┌───▼──┐ │      ┌────▼──┐   │
            │Allow │ │      │Deny   │   │
            │rows  │ │      │all    │   │
            │      │ │      │rows   │   │
            └──────┘ │      └───────┘   │
                │    │
         (Returns     │
          matching    │
          rows)       │
                
        Example Policies:
        ───────────────
        
        1. Users can read OWN profile
           POLICY "users_read_own_profile"
           FOR SELECT
           USING (auth.uid() = id)
        
        2. Admins can read ALL profiles
           POLICY "admins_read_all_profiles"
           FOR SELECT
           USING (
             EXISTS (
               SELECT 1 FROM public.user_roles
               WHERE user_id = auth.uid() AND role = 'admin'
             )
           )
        
        3. Service role bypasses RLS
           POLICY "service_role_all"
           FOR ALL
           USING (auth.role() = 'service_role')
```

---

## 10. Component Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│                     COMPONENT HIERARCHY                           │
└──────────────────────────────────────────────────────────────────┘

        Layout (Root)
        │
        ├── AuthProvider
        │   │
        │   ├── CartProvider
        │   │   │
        │   │   ├── SoundProvider
        │   │   │   │
        │   │   │   ├── Header (AuthButtons)
        │   │   │   │
        │   │   │   ├── Page Route
        │   │   │   │   ├── /auth/login
        │   │   │   │   │   └── LoginContent
        │   │   │   │   │       ├── OAuth Buttons
        │   │   │   │   │       └── Email/Password Form
        │   │   │   │   │
        │   │   │   │   ├── /auth/callback
        │   │   │   │   │   └── (Server-side auth)
        │   │   │   │   │
        │   │   │   │   ├── /auth/signup
        │   │   │   │   │   └── LoginContent (with signup tab)
        │   │   │   │   │
        │   │   │   │   ├── /(protected)/profile
        │   │   │   │   │   └── ProfilePage
        │   │   │   │   │       ├── Profile Card
        │   │   │   │   │       ├── Edit Name Form
        │   │   │   │   │       ├── Account Info
        │   │   │   │   │       └── Purchases Table
        │   │   │   │   │
        │   │   │   │   ├── /(protected)/checkout
        │   │   │   │   │   └── CheckoutPage
        │   │   │   │   │       ├── Order Summary
        │   │   │   │   │       ├── Payment Method
        │   │   │   │   │       └── Checkout Button
        │   │   │   │   │
        │   │   │   │   ├── /admin/dashboard
        │   │   │   │   │   └── AdminDashboard
        │   │   │   │   │       ├── Stats Cards
        │   │   │   │   │       │   ├── Users Count
        │   │   │   │   │       │   ├── Orders Count
        │   │   │   │   │       │   ├── Revenue
        │   │   │   │   │       │   └── Activity Count
        │   │   │   │   │       │
        │   │   │   │   │       └── Activity Table
        │   │   │   │   │           ├── Action
        │   │   │   │   │           ├── User
        │   │   │   │   │           ├── Resource
        │   │   │   │   │           └── Timestamp
        │   │   │   │   │
        │   │   │   │   └── Other pages
        │   │   │   │
        │   │   │   └── Footer
        │   │   │
        │   │   └── Quizzes / Tests (existing)
        │   │
        │   └── (Other existing providers)
        │
        └── (Other root-level components)
```

---

## 11. State Management Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT FLOW                           │
└──────────────────────────────────────────────────────────────────┘

        Global State (React Context)
        │
        ├── AuthContext
        │   ├── user (Supabase User | null)
        │   ├── profile (UserProfile | null)
        │   ├── roles (UserRole[])
        │   ├── loading (boolean)
        │   ├── isAdmin (boolean)
        │   ├── isAuthenticated (boolean)
        │   ├── refreshUser() → async
        │   └── logout() → async
        │
        ├── CartContext
        │   ├── cart (Cart)
        │   │   ├── items (CartItem[])
        │   │   ├── totalPrice (number)
        │   │   ├── itemCount (number)
        │   │   └── lastUpdated (Date)
        │   │
        │   ├── addToCart(product, qty) → void
        │   ├── removeFromCart(productId) → void
        │   ├── updateQuantity(productId, qty) → void
        │   ├── clearCart() → void
        │   ├── getTotalItems() → number
        │   └── getTotalPrice() → number
        │
        ├── SoundContext (existing)
        │   ├── audioManager (AudioManager | null)
        │   ├── soundEnabled (boolean)
        │   ├── toggleSound() → void
        │   └── playSound(key, volume?) → void
        │
        └── Other contexts...
        
        Component-level state (useState)
        ├── User input (form fields)
        ├── UI state (modal open, loading)
        ├── Temporary data (search results)
        └── Component-specific flags
        
        Server state (Database)
        ├── User data in public.users
        ├── Roles in public.user_roles
        ├── Cart in public.carts
        ├── Orders in public.orders
        ├── Audit logs in public.audit_logs
        └── Purchases in public.purchases
```

---

## 12. Error Handling Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING FLOW                            │
└──────────────────────────────────────────────────────────────────┘

        Error Occurs
        │
        ├─► Auth Error
        │   ├─ PGRST116: Not found
        │   │  └─ Profile not created yet (ignore)
        │   │
        │   ├─ 401: Unauthorized
        │   │  └─ Invalid session
        │   │  └─ Redirect to /auth/login
        │   │
        │   ├─ Invalid email/password
        │   │  └─ Show error message
        │   │  └─ Don't redirect
        │   │
        │   └─ OAuth error
        │      └─ Redirect to /auth/login?error=auth_failed
        │
        ├─► Database Error
        │   ├─ RLS Policy violation
        │   │  └─ 403: Permission denied
        │   │  └─ Don't expose to user
        │   │  └─ Log for debugging
        │   │
        │   ├─ Connection timeout
        │   │  └─ Retry logic
        │   │  └─ Show "Try again" button
        │   │
        │   └─ Constraint violation
        │      └─ "Email already exists"
        │      └─ Show user-friendly message
        │
        ├─► API Error
        │   ├─ 400: Bad request
        │   │  └─ Validation error
        │   │  └─ Show field-specific errors
        │   │
        │   ├─ 500: Server error
        │   │  └─ Log to Sentry
        │   │  └─ Show generic "Try again"
        │   │
        │   └─ Network error
        │      └─ Offline detection
        │      └─ Show offline message
        │
        ├─► Payment Error
        │   ├─ Card declined
        │   │  └─ "Try different payment method"
        │   │
        │   ├─ Invalid amount
        │   │  └─ "Cart total changed"
        │   │
        │   └─ Timeout
        │      └─ Retry or contact support
        │
        └─► UI Error
            ├─ useAuth outside provider
            │  └─ Error message in console
            │  └─ Component won't render
            │
            └─ Type error
               └─ TypeScript catches at build
               └─ Never reaches production
```

---

## 13. Deployment & CI/CD Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│               DEPLOYMENT & CI/CD PIPELINE                         │
└──────────────────────────────────────────────────────────────────┘

        Developer commits to main
                │
        ┌───────▼────────┐
        │ GitHub Actions │
        │ CI/CD starts   │
        └───────┬────────┘
                │
        ┌───────▼──────────────┐
        │ 1. Run Linter        │
        │    npm run lint      │
        └───────┬──────────────┘
                │
    ┌───────────┴──────────────┐
    │ Failed: Reject PR        │ Passed: Continue
    │ Request changes          │
    └──────────────────────────┴──────┬──────────┐
                                      │
                            ┌─────────▼────────┐
                            │ 2. Build Next.js │
                            │    npm run build │
                            └─────────┬────────┘
                                      │
                        ┌─────────────┴────────────┐
                        │ Failed: Stop & notify   │ Passed
                        └────────────────────────┬─┘
                                                 │
                            ┌────────────────────▼─────────┐
                            │ 3. Run Unit Tests             │
                            │    npm run test               │
                            └────────────────┬──────────────┘
                                            │
                        ┌───────────────────┴──────────┐
                        │ Failed: Request changes      │ Passed
                        │                              │
                        └──────────────────┬───────────┘
                                          │
                        ┌─────────────────▼──────┐
                        │ 4. Run Integration     │
                        │    Tests               │
                        │    npm run test:int    │
                        └────────┬────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │ Failed: Review & fix    │ Passed
                    │                         │
                    └─────────────────┬───────┘
                                     │
                    ┌────────────────▼──────┐
                    │ 5. Code Review        │
                    │    (Manual or auto)   │
                    └─────────────┬────────┘
                                 │
                   ┌─────────────┴──────────┐
                   │ Approved: Merge to     │ Rejected: Changes
                   │ main branch            │ requested
                   └────────────┬───────────┘
                                │
        ┌───────────────────────▼────────┐
        │ 6. Deploy to Staging (optional)│
        │    - Run migrations            │
        │    - Deploy code               │
        │    - Smoke tests               │
        └────────────┬────────────────────┘
                     │
        ┌────────────▼─────────────────┐
        │ 7. Approval for Production   │
        │    (Manual gate)             │
        └────────────┬─────────────────┘
                     │
        ┌────────────▼──────────────────────┐
        │ 8. Deploy to Production            │
        │    - Run final migrations          │
        │    - Blue/green deployment         │
        │    - Health checks                 │
        │    - Verify auth working           │
        │    - Verify payments working       │
        └────────────┬─────────────────────┘
                     │
        ┌────────────▼──────────────────┐
        │ 9. Post-deployment Verification│
        │    - Check error rates         │
        │    - Monitor performance       │
        │    - Auth metrics              │
        │    - Payment success rate      │
        └────────────┬───────────────────┘
                     │
        ┌────────────▼──────────┐
        │ 10. Notify Team       │
        │    Deployment Success │
        │    Slack / Email      │
        └───────────────────────┘
```

---

**These diagrams provide visual representations of:**

1. Overall system architecture
2. Authentication flow (OAuth, email, signup/login)
3. Protected routes with middleware
4. Database relationships
5. Cart synchronization
6. Order creation and payment
7. Admin dashboard
8. Session and token management
9. RLS (Row-Level Security) policies
10. Component hierarchy
11. State management
12. Error handling
13. CI/CD deployment pipeline

Each diagram can be referenced when implementing corresponding tasks or explaining system behavior to team members.

---

**Version:** 1.0
**Date:** 2026-06-03
**Status:** COMPLETE
