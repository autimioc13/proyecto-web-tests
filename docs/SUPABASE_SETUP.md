# Supabase Setup Guide - FASE 4 Integration

This guide covers the manual steps required to set up your Supabase project and integrate it with QuizLab.

## Prerequisites

- GitHub account (for OAuth sign-in)
- Google account (optional, for Google OAuth)
- Project already has the SQL schema file ready at `supabase/migrations/0001_quizlab_schema.sql`

---

## STEP 1: Create Supabase Project

1. Go to **https://supabase.com**
2. Click **"New Project"** or Sign in with GitHub
3. Fill in the project details:
   - **Name:** `QuizLab`
   - **Database Password:** Create a strong password and save it (you'll need it later)
   - **Region:** Select the region closest to your location
4. Click **"Create new project"** (this takes ~2 minutes)

Once created, you'll see the project dashboard.

---

## STEP 2: Get Your API Credentials

1. Go to **Settings** (bottom left) → **API**
2. Copy the following values and save them securely:

   ```
   Project URL: https://xxxxx.supabase.co
   Anon Public Key: (looks like a long alphanumeric string)
   Service Role Key: (KEEP THIS SECRET - never expose to client)
   ```

3. Update your `.env.local` file with these values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

---

## STEP 3: Create Database Schema

1. Go to **SQL Editor** (left sidebar in Supabase dashboard)
2. Click **"New query"**
3. Open the file `supabase/migrations/0001_quizlab_schema.sql` and copy its entire contents
4. Paste it into the SQL Editor in Supabase
5. Click **"Run"** button to execute the SQL

You should see:
- ✓ Tables created (users, tests, sessions, results, activity_logs)
- ✓ Indexes created
- ✓ RLS policies enabled
- ✓ Realtime publication configured

---

## STEP 4: Configure OAuth (Optional but Recommended)

### Google OAuth Setup

1. Go to **Settings** → **Authentication** → **Providers** → **Google**
2. Click **"Enable"**
3. You'll see a Supabase Callback URL - copy it
4. Go to [Google Cloud Console](https://console.cloud.google.com)
5. Create a new project (or use existing)
6. Go to **Credentials** → **Create OAuth 2.0 Client ID**
7. Select **Web application**
8. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourapp.com/auth/callback` (production)
9. Copy **Client ID** and **Client Secret**
10. Paste them into the Supabase Google provider settings
11. Click **Save**

### GitHub OAuth Setup

1. Go to **Settings** → **Authentication** → **Providers** → **GitHub**
2. Click **"Enable"**
3. Go to your GitHub account → **Settings** → **Developer settings** → **OAuth Apps**
4. Click **"New OAuth App"**
5. Fill in:
   - Application name: `QuizLab`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/auth/callback`
6. Copy **Client ID** and **Client Secret**
7. Paste them into the Supabase GitHub provider settings
8. Click **Save**

### Site URL Configuration

1. In Supabase **Settings** → **Authentication** → **URL Configuration**
2. Set:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** `http://localhost:3000/auth/callback`

(Update these for production deployment)

---

## STEP 5: Verify Setup

Run the development server to test the connection:

```bash
npm run dev
```

Check that:
- [ ] App connects to Supabase (no connection errors in console)
- [ ] Database tables are created
- [ ] RLS policies are active

---

## Database Schema Summary

### Tables Created

| Table | Purpose |
|-------|---------|
| `users` | User profiles (mirrors auth.users) |
| `tests` | Reference data for quiz tests |
| `sessions` | In-progress quiz sessions |
| `results` | Completed quiz results |
| `activity_logs` | User activity tracking |

### Security (RLS Policies)

- **users**: Users can only read/update their own profile
- **sessions**: Users can only access their own sessions
- **results**: Users can only view their own results
- **activity_logs**: Users can only view their own logs
- **tests**: Public read access

---

## Troubleshooting

### Connection Issues
- Verify your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check that `.env.local` exists and has the right values
- Restart the dev server after updating env vars

### RLS Policy Errors
- Ensure you're authenticated before accessing protected tables
- Verify that the auth.uid() matches the user_id in the database

### Realtime Not Working
- Check that the publication includes the `results` table
- Verify that `ALTER PUBLICATION supabase_realtime ADD TABLE public.results;` was executed

---

## Next Steps

1. Create authentication routes
2. Implement session creation and management
3. Build API endpoints for quiz operations
4. Add realtime score updates
5. Deploy to production (update OAuth URLs)

---

## Production Checklist

Before deploying to production:

- [ ] Update OAuth redirect URLs to your production domain
- [ ] Set strong database password
- [ ] Enable HTTPS everywhere
- [ ] Store Service Role Key securely (env vars only)
- [ ] Configure backups
- [ ] Set up monitoring/logging
- [ ] Test RLS policies thoroughly
