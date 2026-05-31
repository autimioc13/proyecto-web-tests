# Database Setup Guide - QuizLab Compliance System

## Overview

QuizLab uses **PostgreSQL** for storing GDPR compliance data:
- **Activity Logs** - Immutable audit trail of all user actions for compliance and auditing
- **Deletion Requests** - Account deletion workflow with 48-hour confirmation tokens (GDPR Art. 17)
- **Consent Logs** - User consent tracking and version history (GDPR Art. 7)

All database interactions use **Prisma ORM** for type-safe queries and automatic migrations.

---

## Option 1: Local PostgreSQL (Development)

Best for local development and testing compliance features.

### Prerequisites
- PostgreSQL 13+ installed on your machine
- `psql` command available in your terminal
- Node.js 18+ and npm installed

### Setup Steps

1. **Install PostgreSQL**
   
   **Windows:**
   - Download from https://www.postgresql.org/download/windows/
   - Run installer, note the password you set for `postgres` user
   - Verify installation: `psql --version`

   **macOS:**
   ```bash
   brew install postgresql
   brew services start postgresql
   ```

   **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Create database**
   ```bash
   createdb quizlab
   ```

3. **Update .env**
   
   Create or update `.env.local` in project root:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/quizlab
   ```

   Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation.

4. **Run migrations**
   ```bash
   npx prisma migrate deploy
   ```

5. **Verify connection**
   ```bash
   psql -U postgres -d quizlab -c "SELECT version();"
   ```

   Should output PostgreSQL version if connection successful.

6. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

### Development Tools

**View database in Prisma Studio (GUI):**
```bash
npx prisma studio
```
Opens browser at http://localhost:5555 to browse and edit data visually.

**Reset database (development only):**
```bash
npx prisma migrate reset
```

---

## Option 2: Vercel Postgres (Production)

Best for production - automatically handles backups, scaling, and security.

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel

### Setup Steps

1. **Create Vercel Project** (if not already)
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Connect your GitHub repository
   - Deploy project

2. **Add Postgres Storage**
   - Go to project dashboard
   - Click "Storage" tab
   - Click "Create" → "Postgres"
   - Follow the configuration wizard:
     - Choose region (recommend closest to your users)
     - Accept default settings
   - Database is created automatically

3. **Copy Connection String**
   - In Storage tab, click your Postgres database
   - Copy the entire `.env.local` code block
   - It contains `DATABASE_URL` and other variables

4. **Set Environment Variables**
   - Go to "Settings" → "Environment Variables"
   - Paste the environment variables from Vercel Postgres
   - Variables are automatically set in production

5. **Deploy with migrations**
   ```bash
   git push
   ```
   
   Vercel automatically:
   - Runs `npm install`
   - Runs `npx prisma migrate deploy` 
   - Deploys your application

### Monitoring Production Database

**View database logs:**
- Storage tab → Postgres → "Connection" section
- Monitor query performance

**Backup & restore:**
- Storage tab → Postgres → "Backups"
- Point-in-time recovery available
- Automatic daily backups

---

## Option 3: Supabase (Alternative)

Free tier with 500MB storage, great for hobby and test projects.

### Prerequisites
- Supabase account (https://supabase.com)
- GitHub repository (optional, for sync)

### Setup Steps

1. **Create Supabase Project**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Fill in:
     - Project name: `quizlab`
     - Database password (save this!)
     - Region: Choose closest to your location (e.g., US-East)
   - Wait for project creation (takes ~2 minutes)

2. **Get Connection String**
   - Project → Settings → Database
   - Under "Connection string", select "Connecting with Prisma"
   - Copy the connection string (it includes password)
   - Should look like: `postgresql://postgres:[PASSWORD]@db.[REGION].supabase.co:5432/postgres`

3. **Configure .env**
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REGION].supabase.co:5432/postgres
   ```

4. **Run migrations**
   ```bash
   npx prisma migrate deploy
   ```

5. **Verify connection**
   ```bash
   npx prisma studio
   ```
   Should open database explorer without errors.

### Supabase Dashboard

Access your data:
- Project → SQL Editor: Run raw SQL queries
- Project → Table Editor: Browse and edit records
- Project → Database: Manage schema and connections

---

## Environment Variables

### Required

```env
# Database connection
DATABASE_URL=postgresql://user:password@host:5432/quizlab
```

### Optional (for compliance features)

```env
# Encryption for sensitive data (generate values below)
ENCRYPTION_KEY=base64_encoded_256bit_key
ENCRYPTION_IV=base64_encoded_128bit_iv

# Email notifications for deletion requests
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=compliance@quizlab.com

# GDPR configurations
GDPR_DATA_RETENTION_DAYS=30
GDPR_LOG_RETENTION_DAYS=365
```

### Generating Encryption Keys

```bash
# Generate 256-bit encryption key (base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate 128-bit IV (base64)
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

Copy the output to your `.env` file.

---

## Database Schema

### ActivityLog Table

Immutable audit trail recording every user action for GDPR compliance.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key, auto-generated |
| userId | String | User who triggered the activity |
| activityType | String | Action type: `quiz_completed`, `data_exported`, `account_deleted`, `consent_given`, `consent_withdrawn`, etc. |
| resource | String (nullable) | What was affected: `profile`, `test_result`, `account`, `consent`, etc. |
| resourceId | String (nullable) | ID of affected resource |
| details | JSON | Additional metadata (quiz scores, exported fields, etc.) |
| ipAddress | String (nullable) | IP address where activity happened |
| userAgent | String (nullable) | Browser/client info for forensics |
| consentLevel | String (nullable) | User's consent status at time of activity: `full`, `minimal`, `none` |
| timestamp | DateTime (Timestamptz) | When activity occurred (immutable) |

**Indexes:**
- `userId` - Query user's activity history
- `timestamp` - Query activities by date range
- `activityType` - Query specific activity types

**Example Data:**
```json
{
  "id": "cjs1a2b3c4d5e6f7g8h9i0j1k",
  "userId": "user-123",
  "activityType": "quiz_completed",
  "resource": "quiz",
  "resourceId": "quiz-456",
  "details": {
    "score": 95,
    "duration": 600,
    "questions": 20
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "consentLevel": "full",
  "timestamp": "2025-05-30T14:23:45.000Z"
}
```

### DeletionRequest Table

Track account deletion requests with confirmation workflow (GDPR Art. 17 - Right to be Forgotten).

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key, auto-generated |
| email | String (UNIQUE) | User's email requesting deletion |
| confirmationToken | String (UNIQUE, nullable) | 48-hour confirmation token sent via email |
| tokenExpiresAt | DateTime (nullable) | When confirmation token expires |
| confirmed | Boolean | Whether user confirmed deletion via email link |
| confirmedAt | DateTime (nullable) | When user confirmed deletion |
| deletedAt | DateTime (nullable) | When account data was actually deleted |
| status | String | Request status: `pending`, `confirmed`, `completed`, `cancelled` |
| createdAt | DateTime (Timestamptz) | When deletion was requested |
| updatedAt | DateTime (Timestamptz) | Last update |

**Indexes:**
- `email` - Find deletion request by email
- `status` - Query by status
- `createdAt` - Query by date

**Workflow:**
1. User requests deletion → status = `pending`
2. Confirmation email sent with token (48hr expiry)
3. User clicks email link → status = `confirmed`
4. Automatic deletion job runs → status = `completed`
5. Record kept 30 days for audit → then deleted

**Example Data:**
```json
{
  "id": "cjs2x1y2z3a4b5c6d7e8f9g0",
  "email": "user@example.com",
  "confirmationToken": "abc123def456...",
  "tokenExpiresAt": "2025-06-01T14:23:45.000Z",
  "confirmed": true,
  "confirmedAt": "2025-05-31T10:15:30.000Z",
  "deletedAt": "2025-06-01T02:00:00.000Z",
  "status": "completed",
  "createdAt": "2025-05-30T14:23:45.000Z",
  "updatedAt": "2025-06-01T02:00:00.000Z"
}
```

### ConsentLog Table

Track all user consent decisions and changes (GDPR Art. 7 - Consent).

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key, auto-generated |
| userId | String | User who gave/withdrew consent |
| consentType | String | Type of consent: `privacy_policy`, `cookies`, `marketing`, `analytics` |
| accepted | Boolean | Whether user accepted (true) or withdrew (false) consent |
| version | String | Policy version (e.g., `1.0`, `2.1`) for tracking policy changes |
| ipAddress | String (nullable) | IP where consent was given |
| userAgent | String (nullable) | Browser/client info |
| timestamp | DateTime (Timestamptz) | When consent was recorded |

**Indexes:**
- `userId` - Query user's consent history
- `timestamp` - Query consent changes by date
- `consentType` - Query specific consent types

**Example Data:**
```json
{
  "id": "cjs3p1q2r3s4t5u6v7w8x9y0",
  "userId": "user-123",
  "consentType": "cookies",
  "accepted": true,
  "version": "2.1",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6)",
  "timestamp": "2025-05-30T14:23:45.000Z"
}
```

---

## Running Migrations

### Create a New Migration

When you modify `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name descriptive_name
```

This will:
1. Create migration file in `prisma/migrations/` (timestamped)
2. Apply migration to your local database
3. Auto-generate Prisma Client types

Example:
```bash
npx prisma migrate dev --name add_user_table
npx prisma migrate dev --name add_gdpr_compliance_fields
```

### View Migration Status

```bash
npx prisma migrate status
```

Shows:
- Applied migrations ✓
- Pending migrations ⏳
- Failed migrations ✗

### Deploy to Production

```bash
npx prisma migrate deploy
```

Use in:
- CI/CD pipelines (GitHub Actions, GitLab CI)
- Vercel deployments (automatic)
- Manual database updates

**Safe to run multiple times** - Prisma tracks applied migrations and skips already-applied ones.

### Create Empty Migration

To write custom SQL:

```bash
npx prisma migrate dev --name custom_sql --create-only
```

Edit the created `.sql` file in `prisma/migrations/` manually, then run:

```bash
npx prisma migrate deploy
```

---

## Using Database Query Functions

All database operations are abstracted through functions in `src/lib/db/`. This ensures type safety and consistent GDPR logging.

### Activity Logs

**Import:**
```typescript
import { 
  createActivityLog, 
  getUserActivityLogs,
  getActivityLogsByType,
  countUserActivities,
  getComplianceActivityReport,
  deleteUserActivityLogs 
} from '@/lib/db/activityLog';
```

**Log an activity:**
```typescript
const log = await createActivityLog({
  userId: 'user-123',
  activityType: 'quiz_completed',
  resource: 'quiz',
  resourceId: 'quiz-456',
  details: { score: 95, duration: 600, questions: 20 },
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  consentLevel: 'full',
});

console.log(log.id); // Activity logged successfully
```

**Get user's activity logs (paginated):**
```typescript
const { data, total, hasMore } = await getUserActivityLogs(
  'user-123',
  50,  // limit (default: 100)
  0    // offset/skip (default: 0)
);

console.log(`Total activities: ${total}`);
console.log(`Showing: ${data.length}/${total}`);
console.log(`More available: ${hasMore}`);

// Pagination example: Get page 2 (50 items per page)
const page2 = await getUserActivityLogs('user-123', 50, 50);
```

**Get activities by type:**
```typescript
const { data: deletions } = await getActivityLogsByType(
  'account_deleted',
  100,
  0
);
```

**Count user activities in date range:**
```typescript
const count = await countUserActivities(
  'user-123',
  new Date('2025-01-01'),
  new Date('2025-05-31')
);

console.log(`Activities this period: ${count}`);
```

**Generate compliance report:**
```typescript
const { data, total } = await getComplianceActivityReport(
  new Date('2025-01-01'),
  new Date('2025-05-31'),
  1000,  // all records
  0
);

// Export for audits
const report = {
  period: '2025-01-01 to 2025-05-31',
  totalActivities: total,
  activities: data
};
```

**Delete user's activity logs (after account deletion):**
```typescript
const deletedCount = await deleteUserActivityLogs('user-123');
console.log(`Deleted ${deletedCount} activity logs for user`);
```

### Deletion Requests

**Import:**
```typescript
import { 
  createDeletionRequest, 
  confirmDeletionRequest,
  completeDeletion,
  getDeletionRequest,
  getDeletionRequestByEmail,
  getPendingDeletionRequests
} from '@/lib/db/deletionRequest';
```

**User requests account deletion:**
```typescript
const request = await createDeletionRequest({
  email: 'user@example.com',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});

console.log(`Token expires at: ${request.tokenExpiresAt}`);
// Send confirmation email with: request.confirmationToken
```

**User clicks confirmation email link:**
```typescript
try {
  const confirmed = await confirmDeletionRequest(token);
  console.log(`Deletion confirmed for: ${confirmed.email}`);
} catch (error) {
  // Token expired, invalid, or already confirmed
  console.error(error.message);
}
```

**After deletion job completes:**
```typescript
await completeDeletion(requestId);
// status becomes 'completed', deletedAt is set
```

**Check deletion request status:**
```typescript
const request = await getDeletionRequest(requestId);
console.log(request.status); // 'pending', 'confirmed', 'completed', 'cancelled'

// Or find by email
const byEmail = await getDeletionRequestByEmail('user@example.com');
```

### Consent Logs

**Import:**
```typescript
import { 
  createConsentLog, 
  getUserConsentLogs,
  getUserLatestConsents
} from '@/lib/db/consentLog';
```

**Log consent decision:**
```typescript
const log = await createConsentLog({
  userId: 'user-123',
  consentType: 'cookies',  // 'privacy_policy' | 'cookies' | 'marketing' | 'analytics'
  accepted: true,
  version: '2.1',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});

console.log(`Consent logged at: ${log.timestamp}`);
```

**Get user's consent history:**
```typescript
const { data, total, hasMore } = await getUserConsentLogs(
  'user-123',
  50,  // limit
  0    // offset
);

// Review all past consent decisions
data.forEach(consent => {
  console.log(`${consent.consentType}: ${consent.accepted} (v${consent.version})`);
});
```

**Get latest consent status:**
```typescript
const latest = await getUserLatestConsents('user-123');

console.log(latest.cookies.accepted);       // true/false
console.log(latest.cookies.version);        // '2.1'
console.log(latest.cookies.timestamp);      // Date

console.log(latest.marketing.accepted);     // false
console.log(latest.privacy_policy.version); // '1.0'
```

---

## Querying the Database Directly

For complex queries, use Prisma Client directly:

```typescript
import { prisma } from '@/lib/db/client';

// Raw query
const results = await prisma.$queryRaw`
  SELECT userId, COUNT(*) as count 
  FROM "ActivityLog" 
  WHERE timestamp > NOW() - INTERVAL '7 days'
  GROUP BY userId
  ORDER BY count DESC
`;

// Complex aggregations
const activityStats = await prisma.activityLog.groupBy({
  by: ['activityType'],
  _count: {
    id: true,
  },
  where: {
    timestamp: {
      gte: new Date('2025-01-01'),
    },
  },
});

// Close connection when done
await prisma.$disconnect();
```

**Note:** Always use the abstracted functions in `src/lib/db/` for consistency and audit logging.

---

## Troubleshooting

### "Can't reach database server"

**Symptoms:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solutions:**
1. Verify database is running:
   - **Linux:** `sudo systemctl status postgresql`
   - **macOS:** `brew services list | grep postgres`
   - **Windows:** Check Services (Ctrl+Alt+Delete → Services → postgresql-x64)

2. Check DATABASE_URL in `.env`:
   - Verify hostname (localhost or IP)
   - Verify port (default 5432)
   - Verify database name matches

3. Test connection manually:
   ```bash
   psql -U postgres -h localhost -d quizlab -c "SELECT 1"
   ```

4. Firewall issues:
   - Windows Firewall: Allow PostgreSQL on port 5432
   - Network: If using Vercel/Supabase, ensure IP is whitelisted

### "Database does not exist"

```bash
createdb quizlab
```

Or in psql:
```bash
CREATE DATABASE quizlab;
```

### "Role does not exist"

If using different user than `postgres`:

```bash
createuser youruser
createdb -O youruser quizlab
```

Update DATABASE_URL:
```env
DATABASE_URL=postgresql://youruser:password@localhost:5432/quizlab
```

### "Migration failed"

**Check migration file:**
```bash
cat prisma/migrations/*/migration.sql
```

**Verify database permissions:**
```bash
psql -U postgres -d quizlab -c "\dp" # View permissions
```

**Reset (development only):**
```bash
npx prisma migrate reset
```

**Manual fix:**
```bash
psql -U postgres -d quizlab
\d  # List tables
DROP TABLE "ActivityLog" CASCADE;  # Remove problematic table
```

Then rerun migration:
```bash
npx prisma migrate deploy
```

### "Type errors in TypeScript"

```bash
# Regenerate Prisma types
npx prisma generate

# Clear cache
rm -rf node_modules/.prisma
rm -rf dist  # if you have compiled code

# Reinstall
npm install
```

### Connection Pool Exhausted

If using serverless functions, you might see connection pool errors. Use Prisma Data Proxy:

```env
DATABASE_URL=prisma://... # From Prisma Cloud
```

Or implement connection pooling:

```typescript
// src/lib/db/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### "DEADLOCK detected"

Usually from concurrent writes. Ensure:
1. Transactions are short
2. Avoid nested transactions
3. Process deletion requests sequentially (not in parallel)

---

## Performance Optimization

### Add Indexes for Common Queries

Already indexed in schema:
- `ActivityLog.userId` - User activity queries
- `ActivityLog.timestamp` - Date range queries
- `ActivityLog.activityType` - Activity type filters
- `DeletionRequest.email` - Email lookups
- `ConsentLog.userId` - User consent queries

### Monitor Slow Queries

```bash
# In PostgreSQL
ALTER DATABASE quizlab SET log_min_duration_statement = 1000; # Log queries > 1s
```

### Analyze Query Plans

```bash
EXPLAIN ANALYZE SELECT * FROM "ActivityLog" WHERE "userId" = 'user-123';
```

### Vacuum and Analyze

```bash
# Regular maintenance
VACUUM ANALYZE;
```

Or set automatic:
```bash
ALTER DATABASE quizlab SET autovacuum = on;
```

---

## Backup & Recovery

### Vercel Postgres

- **Automatic daily backups** - Included free
- **Access backups:**
  1. Go to project Storage → Postgres
  2. Click "Backups" tab
  3. Restore to specific point in time

### Supabase

- **Automatic daily backups** - Included
- **Access backups:**
  1. Project → Settings → Backups
  2. View backup history
  3. One-click restore

### Self-hosted PostgreSQL

**Full backup:**
```bash
pg_dump -U postgres quizlab > backup.sql
```

**Backup with compression:**
```bash
pg_dump -U postgres -Fc quizlab > backup.dump
```

**Restore:**
```bash
psql -U postgres quizlab < backup.sql
# OR
pg_restore -U postgres -d quizlab backup.dump
```

**Restore to specific time (with WAL archiving):**
```bash
# Configure postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/backups/wal/%f'

# Later: PITR
recovery_target_timeline = 'latest'
recovery_target_time = '2025-05-30 14:00:00'
```

---

## GDPR Compliance Features

### Data Retention

Configure in environment:
```env
GDPR_LOG_RETENTION_DAYS=365    # Keep activity logs 1 year
GDPR_REQUEST_RETENTION_DAYS=30 # Keep deletion requests 30 days
```

Cleanup job (run periodically):
```typescript
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

await prisma.deletionRequest.deleteMany({
  where: {
    status: 'completed',
    deletedAt: {
      lt: thirtyDaysAgo
    }
  }
});
```

### Data Export (SAR - Subject Access Request)

```typescript
// Collect all user data
const [activities, consents, deletion] = await Promise.all([
  getUserActivityLogs('user-123', 10000, 0),
  getUserConsentLogs('user-123', 10000, 0),
  getDeletionRequestByEmail('user@example.com'),
]);

const export = {
  activityLog: activities.data,
  consentLog: consents.data,
  deletionRequest: deletion,
  exportDate: new Date(),
};

// Return as JSON or CSV
```

### Right to be Forgotten

1. User requests deletion → `createDeletionRequest()`
2. Confirmation email with 48-hour token
3. User confirms → `confirmDeletionRequest(token)`
4. Deletion job runs:
   ```typescript
   // Delete user's personal data
   // Keep only pseudonymous activity logs
   await deleteUserActivityLogs('user-123');
   await completeDeletion(requestId);
   ```
5. Record kept 30 days for audit trail
6. Then `DELETE FROM deletion_requests WHERE id = '...'`

---

## Security Best Practices

### Environment Variables

Never commit `.env`:
```bash
# .gitignore
.env
.env.local
.env.*.local
```

Use `.env.example`:
```bash
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/quizlab
# DO NOT include real credentials
```

### SQL Injection Prevention

Always use Prisma - **never** string concatenation:

```typescript
// ✓ Safe: Prisma parameterizes
const logs = await prisma.activityLog.findMany({
  where: { userId }
});

// ✗ UNSAFE: SQL injection risk
const logs = await prisma.$queryRaw(`
  SELECT * FROM ActivityLog WHERE userId = '${userId}'
`);

// ✓ Safe: Parameterized
const logs = await prisma.$queryRaw`
  SELECT * FROM ActivityLog WHERE userId = ${userId}
`;
```

### Connection Security

- **Local:** Trust localhost, no special security needed
- **Vercel:** All connections encrypted (TLS)
- **Supabase:** All connections encrypted (TLS)

Add SSL requirement for production:
```env
DATABASE_URL=postgresql://...&sslmode=require
```

### Audit Logging

All changes are logged automatically via `createActivityLog()`. Review logs regularly:

```typescript
const auditTrail = await getComplianceActivityReport(
  thirtyDaysAgo,
  today
);

// Look for suspicious patterns:
// - Multiple failed logins
// - Unusual data access
// - Deletion requests
```

---

## Next Steps

1. **Choose your deployment option:**
   - Local: Follow "Option 1" for development
   - Production: Use "Option 2" (Vercel Postgres)
   - Hobby: Use "Option 3" (Supabase)

2. **Set DATABASE_URL** in `.env` or `.env.local`

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Verify connection:**
   ```bash
   npx prisma studio
   ```

5. **Start using query functions** in your routes and components

6. **Monitor activity logs** - All compliance events are automatically tracked

---

## Additional Resources

- **Prisma Documentation:** https://www.prisma.io/docs
- **PostgreSQL Documentation:** https://www.postgresql.org/docs
- **GDPR Regulation:** https://gdpr-info.eu
- **Data Privacy:** https://www.privacyshield.gov
- **Vercel Storage Docs:** https://vercel.com/docs/storage/vercel-postgres
- **Supabase Docs:** https://supabase.com/docs

---

## Support

For issues:
1. Check "Troubleshooting" section above
2. Review Prisma logs: `npx prisma generate` then check error messages
3. Test database directly: `psql -U postgres -d quizlab`
4. Check environment variables: `echo $DATABASE_URL`
