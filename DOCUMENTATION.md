# Bilal Hospital Management System (BHMS)
## MongoDB Migration & Production Reliability Documentation

---

### 1. Final Architecture Overview

```
                      USERS / CLIENTS
                             │
                             ▼
                     HTTPS / TLS (Port 443)
                             │
                             ▼
                    RENDER / RAILWAY PLATFORM
                             │
                    Managed Load Balancer
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
      NestJS API 1                      NestJS API 2
   (Stateless Container)             (Stateless Container)
            │                                 │
            └────────────────┬────────────────┘
                             │
                             ▼
                 MongoDB Production Cluster
                    (Primary Application DB)
                             │
                             │ Scheduled Out-of-Band
                             │ Dump Worker (Cron Job)
                             ▼
                   Dedicated Backup Worker
                             │
                             ▼
                   MongoDB Backup Cluster
                 (Isolated Backup Secondary DB)
                             │
                     ┌───────┴───────┐
                     ▼               ▼
                 Backup 1        Backup 2
                     │               │
                     ▼               ▼
                 Backup 3        Backup 4
```

* **Production Traffic Flow**: `NestJS API → MongoDB Production Cluster` exclusively.
* **Backup Process Flow**: `MongoDB Production Cluster → Dedicated Backup Worker → MongoDB Backup Cluster`. The backup database is **never** queried by normal API requests.

---

### 2. MongoDB Collection Blueprint (21 Collections)

1. `users` - Staff accounts & role authorization (`ADMIN`, `CONSULTANT`, `RECEPTIONIST`, `LAB_STAFF`, `PHARMACY_STAFF`, `ULTRASOUND_STAFF`).
2. `consultants` - Doctor profiles & consultation fees.
3. `patients` - Master patient demographics & MR numbers.
4. `patient_visits` - OPD/OT/Gyne visit check-ins & status workflow.
5. `consultations` - Encounter clinical notes & vitals.
6. `prescriptions` - Digital prescriptions with embedded `items: [PrescriptionItem]`.
7. `lab_orders` - Diagnostic lab orders with embedded `items: [LabOrderItem]`.
8. `lab_reports` - Versioned lab reports with embedded `versions: [LabReportVersion]`.
9. `lab_revision_requests` - Consultant lab result revision requests.
10. `ultrasound_orders` - Ultrasound scan requests.
11. `ultrasound_reports` - Ultrasound reports with embedded `versions: [UltrasoundReportVersion]`.
12. `ultrasound_revision_requests` - Ultrasound revision requests.
13. `medicines` - Master pharmaceutical catalog with embedded `batches: [MedicineBatch]`.
14. `inventory_transactions` - Stock movement ledger.
15. `pharmacy_dispensings` - Medication dispensing with embedded `items: [PharmacyDispensingItem]`.
16. `ot_records` - Operating theater surgical bookings.
17. `gyne_records` - Gynecological ward admissions.
18. `cash_transactions` - Income/expense cash ledger.
19. `daily_cash_closings` - Daily register closing balances.
20. `audit_logs` - Security audit trail.
21. `system_health_records` - Infrastructure telemetry.

---

### 3. PostgreSQL → MongoDB Mapping Matrix

| Relational PostgreSQL Table | MongoDB Collection | Relationship Strategy |
| :--- | :--- | :--- |
| `User` | `users` | Standalone collection with unique indexes |
| `Consultant` | `consultants` | Standalone collection (`userId` ref) |
| `Patient` | `patients` | Standalone collection with text index |
| `PatientVisit` | `patient_visits` | Standalone collection (`patientId`, `consultantId` refs) |
| `Consultation` | `consultations` | Standalone collection (`visitId` ref) |
| `Prescription` | `prescriptions` | Embeds `items: [PrescriptionItem]` array |
| `LabOrder` | `lab_orders` | Embeds `items: [LabOrderItem]` array |
| `LabReport` | `lab_reports` | Embeds `versions: [LabReportVersion]` array |
| `Medicine` | `medicines` | Embeds `batches: [MedicineBatch]` array |
| `PharmacyDispensing` | `pharmacy_dispensings` | Embeds `items: [PharmacyDispensingItem]` array |
| `CashTransaction` | `cash_transactions` | Standalone collection with compound date index |

---

### 4. Required Environment Variables

| Variable Name | Required Scope | Purpose | Example / Value |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Production & Dev | Runtime environment mode | `production` |
| `PORT` | Managed Deployment | Application server port | Provided by Render/Railway |
| `MONGODB_PRODUCTION_URI` | API Service & Backup | Primary Application DB | `mongodb+srv://user:pass@prod.mongodb.net/bilal_hospital_prod` |
| `MONGODB_BACKUP_URI` | Dedicated Backup Job | Secondary Backup DB | `mongodb+srv://user:pass@backup.mongodb.net/bilal_hospital_backup` |
| `JWT_SECRET` | API Service | JWT token signing key | `secure-random-32-byte-hex` |

---

### 5. Production Operations & Commands

```bash
# 1. Install dependencies
npm install

# 2. Build production assets
npm run build

# 3. Start API Server
npm run start

# 4. Execute Idempotent PostgreSQL -> MongoDB Migration Script
npm run db:migrate

# 5. Run PostgreSQL vs MongoDB Data Validation
npm run db:validate

# 6. Execute Manual MongoDB -> MongoDB Backup Worker
npm run backup:run

# 7. Execute Controlled Administrator Restore (into Staging DB)
npx tsx scripts/restore-worker.ts backup_2026-09-14T20-35-00

# 8. Run End-to-End Application Integration Tests
npm run test
```

---

### 6. Health Monitoring & Security Controls

* **Health Endpoint**: `GET /api/health` returns `HTTP 200 OK` with DB connection status without exposing secrets.
* **NoSQL Injection Defense**: Automated middleware strips query operator keys starting with `$` or containing `.` from input payloads.
* **Stateless Horizontal Scaling**: Multiple API instances scale dynamically on Render/Railway while sharing a single Production MongoDB Cluster with connection pooling (`maxPoolSize: 50`).
* **PostgreSQL Rollback Safety**: PostgreSQL data remains untouched and accessible on `master` branch for instant rollback if required.
