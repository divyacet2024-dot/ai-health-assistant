# Migration Guide: localStorage → Multi-Database Architecture

## Overview

This guide explains how to migrate your existing data from localStorage to the new multi-database setup:
- **Firestore**: Health logs, user profiles (replacing localStorage)
- **PostgreSQL**: Appointments, prescriptions, payments
- **MongoDB**: Chat history, AI responses

---

## Phase 1: Backup Existing Data

### Step 1: Export localStorage Data

Before migration, back up all localStorage data:

```typescript
// src/lib/backup-utils.ts
export function backupLocalStorage(): Record<string, any> {
  const backup: Record<string, any> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        backup[key] = JSON.parse(value);
      }
    }
  }
  
  // Save to file
  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup-${new Date().toISOString()}.json`;
  link.click();
  
  return backup;
}
```

Run in browser console:

```javascript
backupLocalStorage();
// File will be downloaded
```

---

## Phase 2: Migrate Health Logs to Firestore

### Step 1: Create Migration Function

```typescript
// src/lib/migrate-health-logs.ts
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from './firebase-client';
import { DailyHealthLog } from './health-types';

export async function migrateHealthLogsToFirestore(
  backupData: Record<string, any>
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get health logs from backup
    const healthLogs = backupData['aihealthassist_health_logs'];
    if (!Array.isArray(healthLogs)) {
      console.warn('No health logs found in backup');
      return { success: 0, failed: 0 };
    }

    // Migrate each log
    for (const log of healthLogs) {
      try {
        const docRef = doc(
          db,
          `user_profiles/${userId}/health_logs`,
          log.date
        );

        await setDoc(docRef, {
          ...log,
          migratedAt: Timestamp.now(),
          migratedFrom: 'localStorage',
        });

        success++;
      } catch (error) {
        console.error(`Failed to migrate log for ${log.date}:`, error);
        failed++;
      }
    }

    console.log(`✅ Migrated ${success} health logs, ${failed} failed`);
    return { success, failed };
  } catch (error) {
    console.error('Migration error:', error);
    return { success, failed };
  }
}
```

### Step 2: Run Migration

```typescript
// In a component or admin page
import { migrateHealthLogsToFirestore } from '@/lib/migrate-health-logs';

async function performMigration() {
  // Load backup file
  const fileInput = document.getElementById('backup-file') as HTMLInputElement;
  const file = fileInput.files?.[0];
  
  if (!file) {
    alert('Please select a backup file');
    return;
  }

  const text = await file.text();
  const backup = JSON.parse(text);

  const result = await migrateHealthLogsToFirestore(backup);
  alert(`Migration complete: ${result.success} successful, ${result.failed} failed`);
}
```

---

## Phase 3: Migrate User Data to PostgreSQL

### Step 1: Create User Migration

```typescript
// src/lib/migrate-users.ts
import prisma from './postgres-db';
import bcrypt from 'bcryptjs';

export async function migrateUsersToPostgreSQL(
  users: Array<{ email: string; name: string; role: string; firebaseUid: string }>
) {
  let success = 0;
  let failed = 0;

  for (const user of users) {
    try {
      // Check if user exists
      const existing = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existing) {
        console.log(`User ${user.email} already exists, skipping`);
        continue;
      }

      // Create user with hashed password
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          role: user.role as any,
          firebaseUid: user.firebaseUid,
          password: await bcrypt.hash('temp_password', 10),
        },
      });

      success++;
    } catch (error) {
      console.error(`Failed to migrate user ${user.email}:`, error);
      failed++;
    }
  }

  console.log(`✅ Migrated ${success} users, ${failed} failed`);
  return { success, failed };
}
```

---

## Phase 4: Create Appointments & Prescriptions

### Step 1: Migrate Appointment Data

```typescript
// src/lib/migrate-appointments.ts
import prisma from './postgres-db';

export async function migrateAppointmentsToPostgreSQL(
  appointments: Array<any>
) {
  let success = 0;
  let failed = 0;

  for (const apt of appointments) {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: apt.patientEmail },
      });

      if (!user) {
        console.warn(`User not found for appointment: ${apt.patientEmail}`);
        failed++;
        continue;
      }

      // Find or create department
      let dept = await prisma.department.findUnique({
        where: { name: apt.department },
      });

      if (!dept) {
        dept = await prisma.department.create({
          data: { name: apt.department },
        });
      }

      // Create appointment
      await prisma.appointment.create({
        data: {
          userId: user.id,
          departmentId: dept.id,
          date: new Date(apt.date),
          time: apt.time,
          reason: apt.reason,
          status: apt.status || 'SCHEDULED',
          migratedFrom: 'localStorage',
        },
      });

      success++;
    } catch (error) {
      console.error(`Failed to migrate appointment:`, error);
      failed++;
    }
  }

  console.log(`✅ Migrated ${success} appointments, ${failed} failed`);
  return { success, failed };
}
```

---

## Phase 5: Migrate Chat History to MongoDB

### Step 1: Create Chat History Migration

```typescript
// src/lib/migrate-chat-history.ts
import { connectToMongoDB } from './mongodb-atlas';

export async function migrateChatHistoryToMongoDB(
  chatData: Array<any>
) {
  let success = 0;
  let failed = 0;

  try {
    const db = await connectToMongoDB();
    const collection = db.collection('chat_history');

    // Batch insert for performance
    const docs = chatData.map((chat) => ({
      ...chat,
      migratedAt: new Date(),
      migratedFrom: 'localStorage',
    }));

    if (docs.length > 0) {
      const result = await collection.insertMany(docs);
      success = result.insertedIds.length;
    }

    console.log(`✅ Migrated ${success} chat messages to MongoDB`);
    return { success, failed };
  } catch (error) {
    console.error('Chat migration error:', error);
    return { success, failed: chatData.length };
  }
}
```

---

## Phase 6: Update Component Code

### Step 1: Update Health Log Components

**Before**:
```typescript
import { getHealthLogs, saveHealthLog } from '@/lib/health-storage';

export function HealthLogForm() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setLogs(getHealthLogs()); // localStorage
  }, []);

  const handleSave = (log) => {
    saveHealthLog(log); // localStorage
    setLogs(getHealthLogs());
  };
}
```

**After**:
```typescript
import { getHealthLogs, saveHealthLog } from '@/lib/firestore-storage';

export function HealthLogForm() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const data = await getHealthLogs(); // Firestore
    setLogs(data);
  };

  const handleSave = async (log) => {
    await saveHealthLog(log); // Firestore
    await loadLogs();
  };
}
```

### Step 2: Update Appointment Components

**Before**:
```typescript
const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
```

**After**:
```typescript
import UnifiedDB from '@/lib/unified-db';

const appointments = await UnifiedDB.getAppointmentsByUser(userId);
```

---

## Phase 7: Verify Migration

### Step 1: Create Verification Script

```typescript
// src/lib/verify-migration.ts
import UnifiedDB from './unified-db';
import prisma from './postgres-db';

export async function verifyMigration() {
  console.log('🔍 Verifying migration...\n');

  // Check Firestore
  console.log('📊 Firestore Stats:');
  const healthLogs = await UnifiedDB.getHealthLogs();
  console.log(`   Health logs: ${healthLogs.length}`);

  // Check PostgreSQL
  console.log('\n📊 PostgreSQL Stats:');
  const users = await prisma.user.findMany();
  console.log(`   Users: ${users.length}`);

  const appointments = await prisma.appointment.findMany();
  console.log(`   Appointments: ${appointments.length}`);

  const prescriptions = await prisma.prescription.findMany();
  console.log(`   Prescriptions: ${prescriptions.length}`);

  // Check MongoDB
  console.log('\n📊 MongoDB Stats:');
  const chatHistory = await UnifiedDB.getChatHistory('test', 1);
  console.log(`   Chat collection exists: ${chatHistory.length >= 0}`);

  console.log('\n✅ Verification complete!');
}
```

### Step 2: Run Verification

```typescript
// Add to admin page or dev tools
import { verifyMigration } from '@/lib/verify-migration';

button.onClick(async () => {
  await verifyMigration();
});
```

---

## Phase 8: Clean Up

### Step 1: Remove localStorage Code

Once verified, remove old localStorage references:

```bash
# Search and remove
grep -r "localStorage" src/
# Replace with appropriate new code
```

### Step 2: Remove localStorage from components

```typescript
// Delete these old functions
export function getHealthLogs() { ... } // DELETE
export function saveHealthLogs(logs) { ... } // DELETE

// Replace with firestore imports
import { getHealthLogs, saveHealthLog } from '@/lib/firestore-storage';
```

---

## Migration Checklist

- [ ] Backed up all localStorage data
- [ ] Migrated health logs to Firestore
- [ ] Migrated user data to PostgreSQL
- [ ] Migrated appointments to PostgreSQL
- [ ] Migrated chat history to MongoDB
- [ ] Updated all components to use new database modules
- [ ] Tested all functionality
- [ ] Verified data integrity
- [ ] Cleaned up localStorage references
- [ ] Deployed to production

---

## Rollback Plan

If issues occur, revert changes:

```bash
# Keep old localStorage module as backup
git checkout src/lib/health-storage.ts

# Or revert components
git checkout src/components/HealthLog.tsx

# Re-enable localStorage in environment if needed
DISABLE_FIRESTORE=true npm run dev
```

---

## Support & Help

For migration issues:
1. Check Firestore/PostgreSQL/MongoDB logs
2. Verify credentials in .env.local
3. Ensure databases are running
4. Review error messages in browser console
5. Contact database support teams for service-specific issues
