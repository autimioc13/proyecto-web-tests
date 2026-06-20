# FASE 9: Stripe Integration - Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install stripe @stripe/js @stripe/react-stripe-js
```

### Step 2: Get Stripe Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy **Publishable Key** (starts with `pk_test_`)
3. Copy **Secret Key** (starts with `sk_test_`)

### Step 3: Configure Environment
Create `.env.local`:
```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_test_your_secret_here
```

### Step 4: Run Migrations
```bash
# In Supabase dashboard or via CLI
supabase db push  # Applies 0003_stripe_integration.sql
```

### Step 5: Start Development
```bash
npm run dev
# Navigate to http://localhost:3000/checkout
```

### Step 6: Setup Webhooks (Local Testing)
```bash
# Install Stripe CLI from https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy signing secret to .env.local
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
```

---

## Test Payment Flow

### Using Test Card:
```
Card Number:  4242 4242 4242 4242
Exp Date:     12/25 (any future date)
CVC:          123 (any 3 digits)
Name:         Test User
Postal Code:  12345
```

**Expected Result:** Payment succeeded → Order marked as "completed"

---

## Files Modified

| File | Changes |
|------|---------|
| `supabase/migrations/0003_stripe_integration.sql` | ✅ New |
| `src/app/api/payments/create-intent/route.ts` | ✅ New |
| `src/app/api/webhooks/stripe/route.ts` | ✅ New |
| `src/lib/stripe.ts` | ✅ New |
| `src/app/checkout/page.tsx` | ✅ Updated |
| `package.json` | ✅ Updated |
| `.env.example` | ✅ Updated |

---

## API Endpoints

### POST `/api/payments/create-intent`
Creates Stripe PaymentIntent
```bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "orderId": "ORD-123",
    "amount": 29.99,
    "customerEmail": "user@example.com",
    "customerName": "John Doe"
  }'
```

**Response:**
```json
{
  "clientSecret": "pi_test_xxxxx_secret_xxxxx",
  "paymentIntentId": "pi_test_xxxxx",
  "paymentId": "payment-uuid"
}
```

### GET `/api/payments/create-intent?paymentIntentId=pi_xxxxx`
Get payment status
```bash
curl http://localhost:3000/api/payments/create-intent?paymentIntentId=pi_test_xxxxx
```

**Response:**
```json
{
  "status": "succeeded",
  "amount": 2999,
  "currency": "usd"
}
```

### POST `/api/webhooks/stripe`
Stripe webhook endpoint (automatic)

---

## Database Tables

### `stripe_payments`
```sql
SELECT * FROM stripe_payments WHERE user_id = 'user-123';
```

### `stripe_events`
```sql
SELECT * FROM stripe_events ORDER BY created_at DESC LIMIT 10;
```

---

## Debugging

### Check Stripe Test Events:
https://dashboard.stripe.com/logs/events

### Check Database:
```bash
supabase db query  # or use Supabase dashboard
```

### Local Logs:
```bash
npm run dev
# Look for console logs: "Received Stripe event: payment_intent.succeeded"
```

### Webhook Issues:
```bash
stripe logs tail  # If using Stripe CLI
```

---

## Common Issues

### ❌ "Missing stripe-signature header"
**Fix:** Webhook secret not configured correctly
- Copy `STRIPE_WEBHOOK_SECRET` from Stripe Dashboard
- Restart dev server

### ❌ "Stripe is not loaded"
**Fix:** Stripe.js not initialized
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Browser console for network errors

### ❌ Payment shows pending forever
**Fix:** Webhook not processing
- Check Stripe webhook logs
- Verify endpoint is accessible
- Restart webhook listener: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## Going to Production

### 1. Get Live Keys
```
https://dashboard.stripe.com/apikeys
Switch to Live mode (toggle in top right)
Copy live keys (start with pk_live_, sk_live_)
```

### 2. Update Production Env
```env
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxx
```

### 3. Update Webhook URL
Stripe Dashboard → Webhooks → Edit endpoint
```
URL: https://yourdomain.com/api/webhooks/stripe
```

### 4. Test with Small Transaction
- Process $0.01 payment
- Check Stripe Dashboard → Transactions
- Verify DB updated with "succeeded" status

---

## Monitoring Checklist

- [ ] Monitor failed payments in Stripe Dashboard
- [ ] Check webhook delivery success rate (>99%)
- [ ] Review error logs in `stripe_events` table
- [ ] Ensure RLS policies are working (test with different users)
- [ ] Backup sensitive env vars securely

---

**Status:** ✅ Ready for Development  
**Next Phase:** Email notifications + Admin dashboard
