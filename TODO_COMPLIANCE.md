## HIPAA/GDPR Compliance Implementation TODO

**Status: ⏳ In Progress** | **Plan Approved: ✅** | **Target: Production-Ready PHI Protection**

### 📋 Phase 1: NextAuth.js + 2FA Setup [Priority: 🚀 Critical]
- [✅] **Step 1.1**: Update package.json (added deps: next-auth, @auth/prisma-adapter, speakeasy, @aws-sdk/client-kms, etc.)
- [✅] **Step 1.2**: Create `/src/app/api/auth/[...nextauth]/route.ts` (NextAuth v5 + Credentials + TOTP 2FA for DOCTOR/ADMIN)
- [✅] **Step 1.3**: Update prisma/schema.prisma (+ Account/Session/VerificationToken + totpSecret + relations)
- [✅] **Step 1.4**: Create prisma/seed.ts (hashed demo users + TOTP secrets for DOCTOR/ADMIN)
- [✅] **Step 1.5**: Add SessionProvider (providers.tsx + layout.tsx) + useAuthSession hook
- [ ] **Step 1.6**: Deprecate src/lib/auth.ts → NextAuth migration

### 🛡️ Phase 2: RBAC Middleware [Priority: 🚀 Critical]
- [✅] **Step 2.1**: middleware.ts (NextAuth middleware + role guards)
- [✅] **Step 2.2**: src/lib/rbac.ts (permission matrix + utils)
- [ ] **Step 2.3**: Protect API routes with getServerSession + RBAC checks

### 🔒 Phase 3: AWS KMS Encryption [Priority: ⚠️ High]
- [ ] **Step 3.1**: Enable pgcrypto PostgreSQL extension
- [ ] **Step 3.2**: Update schema.prisma (encryptedString fields for PHI)
- [ ] **Step 3.3**: Create lib/encryption.ts (KMS envelope encrypt/decrypt)
- [ ] **Step 3.4**: Update postgres-queries.ts (encrypt on write, decrypt on read)
- [ ] **Step 3.5**: Migrate existing data (if any) + test decryption

### 📊 Phase 4: Audit + Hardening [Priority: ✅ Medium]
- [ ] **Step 4.1**: MongoDB audit_logs collection + logPHIaccess util
- [ ] **Step 4.2**: Rate limiting + input sanitization (zod/valibot)
- [ ] **Step 4.3**: HTTPS enforcement + CSP headers (next.config.ts)
- [ ] **Step 4.4**: Env validation + secrets management

### ✅ Phase 5: Testing & Validation [Priority: 🔍 Required]
- [ ] **Step 5.1**: Unit tests (auth flows, RBAC, encryption roundtrip)
- [ ] **Step 5.2**: E2E tests (login → 2FA → restricted dashboard)
- [ ] **Step 5.3**: Compliance checklist (BAA-ready config)
- [ ] **Step 5.4**: Run `npx prisma migrate deploy` + seed

### 🚀 Commands to Run (After Each Phase):
```
npm install
npx prisma generate
npx prisma db push  # dev
npm run dev
```

**Progress Tracker:**
```
Phase 1: [░░░░░░░░░░] 0/6
Phase 2: [░░░░░░░░░░] 0/3  
Phase 3: [░░░░░░░░░░] 0/5
Phase 4: [░░░░░░░░░░] 0/4
Phase 5: [░░░░░░░░░░] 0/4

Current Step: ⏳ 1.1 - package.json update
```

**Completion Criteria:**
- ✅ 2FA login works for all roles
- ✅ Patients see only own appointments
- ✅ Doctors see patient data (RBAC)
- ✅ PHI encrypts/decrypts correctly (KMS)
- ✅ Audit logs capture all access
- ✅ No plaintext PHI in DB

**Docs:** [AWS KMS Guide](https://docs.aws.amazon.com/kms/latest/developerguide/getting-started.html) | [NextAuth v5](https://authjs.dev/getting-started/installation/nextjs)

