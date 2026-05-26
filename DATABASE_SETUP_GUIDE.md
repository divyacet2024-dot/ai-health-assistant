# Backend Database Integration - Step-by-Step Implementation

## Quick Start

### 1. Install Dependencies

```bash
cd web

# Install all required packages
npm install firebase firebase-admin pg prisma @prisma/client mongoose bcryptjs jsonwebtoken

# Or install individually:
npm install firebase              # Firebase SDK
npm install pg                    # PostgreSQL client
npm install prisma @prisma/client # ORM for PostgreSQL
npm install mongoose              # MongoDB driver
```
#
## 2. Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "node prisma/seed.ts",
    "db:setup": "prisma generate && prisma migrate dev --name init",
    "db:reset": "prisma migrate reset"
  }
}
```

### 3. Set Up Environment Variables

Create `.env.local` in the `web/` directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Service Account (for server-side)
# Download from Firebase Console → Project Settings → Service Accounts
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json

# PostgreSQL
# Local: postgresql://postgres:password@localhost:5432/ai_health_assistant
# Cloud: postgresql://user:password@host:5432/ai_health_assistant?sslmode=require
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_health_assistant
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5432/ai_health_assistant

# MongoDB Atlas
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGODB_URI=mongodb://localhost:27017/ai_health_assistant

# JWT Secret (for authentication)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 4. Firebase Setup

#### Option A: Create Firebase Project (Recommended for Production)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Authentication (Email/Password, Google, etc.)
5. Get your API keys from Project Settings
6. Generate service account key and save as `serviceAccountKey.json`

#### Option B: Use Firebase Emulator (For Local Development)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize Firebase emulator
firebase init emulator

# Start emulator
firebase emulators:start
```

### 5. PostgreSQL Setup

#### Option A: Local PostgreSQL (Development)

```bash
# On macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database and user
createuser postgres -s
psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
createdb -U postgres ai_health_assistant
```

#### Option B: PostgreSQL in Docker

```bash
docker run -d \
  --name postgres-ai \
  -e POSTGRES_DB=ai_health_assistant \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15
```

#### Option C: Cloud PostgreSQL (Production)

- **AWS RDS**: Follow [AWS RDS Setup Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- **Vercel Postgres**: Use `vercel postgres` for easy integration
- **Supabase**: PostgreSQL-as-a-Service with extras

### 6. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/ai_health_assistant?retryWrites=true&w=majority`
5. Update `MONGODB_URI` in `.env.local`
6. Whitelist your IP address in Network Access

### 7. Initialize Prisma and Run Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migrations
npm run prisma:migrate

# This will:
# 1. Create migration files
# 2. Apply migrations to your PostgreSQL database
# 3. Generate Prisma Client
```

First migration will create all tables. You should see:

```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "ai_health_assistant" at "localhost:5432"

✔ Enter a name for the new migration: › init

✔ Your database is now in sync with your schema.

Generated Prisma Client (version 5.x.x) to ./node_modules/.prisma/client in XXXms
```

### 8. Seed Initial Data (Optional)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed departments
  const departments = await prisma.department.createMany({
    data: [
      { name: 'Cardiology', description: 'Heart and cardiovascular diseases' },
      { name: 'Neurology', description: 'Brain and nervous system' },
      { name: 'Orthopedics', description: 'Bones and joints' },
      { name: 'General Medicine', description: 'General health checkup' },
    ],
    skipDuplicates: true,
  });

  console.log(`Seeded ${departments.count} departments`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Run:

```bash
npx prisma db seed
```

### 9. Update Existing Components

#### Replace localStorage with Firestore in useHealthLog hook

**Before** (localStorage):

```typescript
const logs = JSON.parse(localStorage.getItem('health_logs') || '[]');
```

**After** (Firestore):

```typescript
import { getHealthLogs, saveHealthLog } from '@/lib/firestore-storage';

const logs = await getHealthLogs();
await saveHealthLog(newLog);
```

#### Replace old API calls with Unified DB

**Before**:

```typescript
const response = await fetch('/api/old-appointments');
```

**After**:

```typescript
import UnifiedDB from '@/lib/unified-db';

const appointments = await UnifiedDB.getAppointmentsByUser(userId);
```

### 10. Test the Integration

```bash
# Check database connections
curl http://localhost:3000/api/health/check

# Expected response:
# {
#   "status": "healthy",
#   "databases": {
#     "firestore": "✅ Online",
#     "postgresql": "✅ Online",
#     "mongodb": "✅ Online"
#   }
# }
```

### 11. Deploy to Production

#### Environment Variables Setup

1. **Vercel** (if using Next.js on Vercel):
   ```
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add DATABASE_URL
   vercel env add MONGODB_URI
   ```

2. **Other Platforms**: Add to your hosting provider's environment configuration

#### Database Backups

- **PostgreSQL**: Use `pg_dump` or cloud provider backups
- **MongoDB**: Enable automatic backups in Atlas dashboard
- **Firestore**: Enable automated backups in GCP console

---

## Database Selection Reference

| Feature | Firestore | PostgreSQL | MongoDB |
|---------|-----------|-----------|---------|
| **Best for** | Real-time, user data | Relational, transactions | Flexible schema |
| **Data** | Health logs, profiles | Appointments, payments | Chat history, records |
| **Scale** | Small-medium | Medium-large | Large, flexible |
| **Cost** | Pay-per-use | Fixed | Pay-per-use |
| **Queryability** | Good | Excellent | Good |

---

## Troubleshooting

### Firebase Connection Issues

```typescript
// Add this debug code to firebase-client.ts
if (process.env.NODE_ENV === 'development') {
  import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (e) {
      // Already connected
    }
  });
}
```

### PostgreSQL Connection Issues

```bash
# Test connection
psql postgresql://postgres:postgres@localhost:5432/ai_health_assistant -c "SELECT 1"

# View logs
# Linux: sudo tail -f /var/log/postgresql/postgresql.log
# macOS: tail -f /usr/local/var/log/postgres.log
```

### MongoDB Connection Issues

```bash
# Test connection
mongosh "mongodb+srv://user:password@cluster.mongodb.net/ai_health_assistant"

# Check IP whitelist
# MongoDB Atlas Console → Network Access
```

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Set up environment variables
3. ✅ Configure Firebase project
4. ✅ Set up PostgreSQL database
5. ✅ Set up MongoDB Atlas
6. ✅ Run Prisma migrations
7. ✅ Update components to use new databases
8. ✅ Test connections
9. ✅ Deploy to production

**Total setup time**: ~30-45 minutes

---

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)

For issues, check the Troubleshooting section or consult the official documentation.
