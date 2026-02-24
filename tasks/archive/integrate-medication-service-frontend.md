# Task: Integrate Medication Service into Frontend

**Status:** COMPLETED  
**Created:** 2026-02-23  
**Priority:** HIGH  

---

## 🎯 Overview

Integrate the medication microservice (backend already completed) into the Angular frontend. Enable patients to manage their medications and track intakes, and allow doctors/caregivers to view patient medication plans.

---

## 📋 Background

### Medication Service API (Backend - Already Working)
- **Port:** 8083
- **Base Path:** `/api/medications`
- **Eureka:** Registered as `MEDICATION-SERVICE`
- **Gateway:** http://localhost:8081/api/medications

### Available Endpoints

#### Medication Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/medications/plans` | Get all plans |
| `POST` | `/api/medications/plans` | Create new plan |
| `GET` | `/api/medications/plans/{id}` | Get plan by ID |
| `PUT` | `/api/medications/plans/{id}` | Update plan |
| `DELETE` | `/api/medications/plans/{id}` | Delete plan |
| `GET` | `/api/medications/plans/by-patient/{patientId}` | Get patient plans |
| `GET` | `/api/medications/plans/by-patient/{patientId}/active` | Get active plans |

#### Medication Intakes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/medications/intakes` | Get all intakes |
| `GET` | `/api/medications/intakes/{id}` | Get intake by ID |
| `POST` | `/api/medications/plans/{planId}/intakes` | Create intake for plan |
| `GET` | `/api/medications/plans/{planId}/intakes` | Get plan intakes |
| `PUT` | `/api/medications/intakes/{id}` | Update intake |
| `DELETE` | `/api/medications/intakes/{id}` | Delete intake |
| `PATCH` | `/api/medications/intakes/{id}/take` | Mark as taken |
| `PATCH` | `/api/medications/intakes/{id}/miss` | Mark as missed |
| `PATCH` | `/api/medications/intakes/{id}/skip` | Mark as skipped |

---

## 📦 Data Models

```typescript
// MedicationForm enum
enum MedicationForm {
  TABLET = 'TABLET',
  SYRUP = 'SYRUP',
  INJECTION = 'INJECTION',
  DROPS = 'DROPS',
  OTHER = 'OTHER'
}

// IntakeStatus enum
enum IntakeStatus {
  SCHEDULED = 'SCHEDULED',
  TAKEN = 'TAKEN',
  MISSED = 'MISSED',
  SKIPPED = 'SKIPPED'
}

// MedicationPlan interface
interface MedicationPlan {
  id?: number;
  patientId: number;
  medicationName: string;
  dosage: string;
  form: MedicationForm;
  frequencyPerDay: number;
  startDate: string;  // ISO date: "2024-06-15"
  endDate?: string;   // ISO date: "2024-07-15"
  instructions?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// MedicationIntake interface
interface MedicationIntake {
  id?: number;
  planId?: number;
  scheduledAt: string;  // ISO datetime: "2024-06-15T08:00:00"
  takenAt?: string;     // ISO datetime
  status: IntakeStatus;
  notes?: string;
}
```

---

## 📁 Reference Files

### Existing Patterns (Follow These)
| File | Purpose |
|------|---------|
| `appointment.service.ts` | Service pattern to follow |
| `appointment.model.ts` | Model pattern to follow |
| `appointments.routes.ts` | Routing pattern to follow |
| `patient-appointments.component.ts` | Component pattern for patient view |
| `menu.service.ts` | Add menu item here |
| `app.routes.ts` | Add route here |

---

## ✅ Sub-Tasks

### Sub-Task 1: Create Models
**File:** `frontend/humancare-ui/src/app/shared/models/medication.model.ts`

Create TypeScript interfaces/enums for:
- `MedicationForm` enum
- `IntakeStatus` enum  
- `MedicationPlan` interface
- `MedicationIntake` interface
- Create/Update request interfaces

---

### Sub-Task 2: Create Medication Service
**File:** `frontend/humancare-ui/src/app/features/medications/services/medication.service.ts`

Create service with methods:
- Plans: `getPlans()`, `getPlansByPatient()`, `getActivePlans()`, `createPlan()`, `updatePlan()`, `deletePlan()`
- Intakes: `getIntakesByPlan()`, `createIntake()`, `updateIntake()`, `deleteIntake()`, `markAsTaken()`, `markAsMissed()`, `markAsSkipped()`

Use `environment.apiUrl` as base (see appointment.service.ts for pattern).

---

### Sub-Task 3: Create Patient Medications Component
**Files:**
- `frontend/humancare-ui/src/app/features/medications/components/patient/patient-medications.component.ts`
- `frontend/humancare-ui/src/app/features/medications/components/patient/patient-medications.component.html`
- `frontend/humancare-ui/src/app/features/medications/components/patient/patient-medications.component.scss`

Features:
- View my medication plans (table/card view)
- View intakes for each plan
- Mark intake as taken/missed/skipped
- Create new medication plan
- Cancel/delete plan

---

### Sub-Task 4: Create Doctor/Caregiver Medications Component
**Files:**
- `frontend/humancare-ui/src/app/features/medications/components/doctor/doctor-medications.component.ts`
- `frontend/humancare-ui/src/app/features/medications/components/doctor/doctor-medications.component.html`
- `frontend/humancare-ui/src/app/features/medications/components/doctor/doctor-medications.component.scss`

Features:
- View all patient medications (search by patient)
- View patient medication details
- Update medication plan
- Add notes to medication
- View intake history

---

### Sub-Task 5: Create Dialog Components
**Files:**
- `frontend/humancare-ui/src/app/features/medications/components/dialogs/medication-create-dialog.component.ts`
- `frontend/humancare-ui/src/app/features/medications/components/dialogs/medication-detail-dialog.component.ts`
- `frontend/humancare-ui/src/app/features/medications/components/dialogs/intake-status-dialog.component.ts`

Dialogs for:
- Creating medication plan (form with all fields)
- Viewing medication details
- Updating intake status with notes

---

### Sub-Task 6: Setup Routes
**File:** `frontend/humancare-ui/src/app/features/medications/medications.routes.ts`

Create routes:
- `/app/medications` → redirect based on role
- `/app/medications/patient` → PatientMedicationsComponent (PATIENT, ADMIN)
- `/app/medications/doctor` → DoctorMedicationsComponent (DOCTOR, CAREGIVER, ADMIN)

---

### Sub-Task 7: Update App Routes
**File:** `frontend/humancare-ui/src/app/app.routes.ts`

Add lazy-loaded route:
```typescript
{
  path: 'medications',
  loadChildren: () => import('./features/medications/medications.routes').then(m => m.MEDICATIONS_ROUTES)
}
```

---

### Sub-Task 8: Add Menu Item
**File:** `frontend/humancare-ui/src/app/core/services/menu.service.ts`

Add menu item:
```typescript
{ icon: 'medication', label: 'Medications', route: '/app/medications', roles: [Role.PATIENT, Role.DOCTOR, Role.CAREGIVER, Role.ADMIN] }
```

---

## 🔐 Role-Based Access

| Feature | PATIENT | CAREGIVER | DOCTOR | ADMIN |
|---------|---------|-----------|--------|-------|
| View own medications | ✅ | ❌ | ❌ | ✅ |
| View assigned patient meds | ❌ | ✅ | ✅ | ✅ |
| Create medication plan | ✅ | ❌ | ✅ | ✅ |
| Update own plan | ✅ | ❌ | ✅ | ✅ |
| Delete own plan | ✅ | ❌ | ✅ | ✅ |
| Mark intake status | ✅ | ❌ | ❌ | ✅ |
| View intake history | ✅ | ✅ | ✅ | ✅ |

---

## 🎨 UI Guidelines

- Use Angular Material components (MatCard, MatTable, MatButton, MatIcon, MatChips, MatDialog)
- Follow existing styling patterns from appointments feature
- Use icons: `medication`, `schedule`, `check_circle`, `cancel`, `skip_next`
- Color coding for status: TAKEN (green/accent), MISSED (red/warn), SKIPPED (orange), SCHEDULED (primary)

---

## 📁 File Structure

```
frontend/humancare-ui/src/app/
├── shared/models/
│   └── medication.model.ts
├── features/medications/
│   ├── medications.routes.ts
│   ├── services/
│   │   └── medication.service.ts
│   └── components/
│       ├── medications-redirect/
│       │   └── medications-redirect.component.ts
│       ├── patient/
│       │   ├── patient-medications.component.ts
│       │   ├── patient-medications.component.html
│       │   └── patient-medications.component.scss
│       ├── doctor/
│       │   ├── doctor-medications.component.ts
│       │   ├── doctor-medications.component.html
│       │   └── doctor-medications.component.scss
│       └── dialogs/
│           ├── medication-create-dialog.component.ts
│           ├── medication-detail-dialog.component.ts
│           └── intake-status-dialog.component.ts
```

---

## ✅ Acceptance Criteria

- [ ] Models created with proper TypeScript interfaces
- [ ] MedicationService with all API methods
- [ ] Patient can view their medication plans
- [ ] Patient can create medication plan
- [ ] Patient can mark intakes as taken/missed/skipped
- [ ] Doctor/Caregiver can view patient medications
- [ ] Doctor can update medication plans
- [ ] Sidebar shows "Medications" menu item
- [ ] Role-based access works correctly
- [ ] Routes configured with lazy loading
- [ ] Manual testing passes with docker-compose

---

## 🚀 Quick Test

```bash
# Start medication service
docker-compose up -d hc-mysql-medication hc-medication-service

# Frontend
cd frontend/humancare-ui
npm start
```

Access: http://localhost:4200/app/medications
