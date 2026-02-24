# Task: Medications and Appointments Add/Delete Functionality

## Overview
Review and enhance the frontend services and components for medications and appointments to ensure they properly match the backend endpoints and gateway routes, and verify/implement add and delete functionality.

## Current State Analysis

### ✅ Gateway Routes (Verified)
Both services are correctly configured in `config-server/src/main/resources/config-repo/api-gateway.yml`:

| Service | Gateway Path | Backend URI | Status |
|---------|-------------|-------------|--------|
| Medication Service | `/api/medications/**` | `lb://medication-service` | ✅ Correct |
| Appointments Service | `/api/appointments/**` | `lb://appointments-service` | ✅ Correct |

### ✅ Backend Endpoints (Verified)

**Medication Service (`services/medication/src/main/java/.../controller/`)**
- `GET /api/medications/plans` - Get all plans
- `GET /api/medications/plans/{id}` - Get plan by ID
- `GET /api/medications/plans/by-patient/{patientId}` - Get plans by patient
- `GET /api/medications/plans/by-patient/{patientId}/active` - Get active plans
- `POST /api/medications/plans` - Create plan ✅
- `PUT /api/medications/plans/{id}` - Update plan ✅
- `DELETE /api/medications/plans/{id}` - Delete plan ✅
- `GET /api/medications/intakes` - Get all intakes
- `GET /api/medications/intakes/{id}` - Get intake by ID
- `GET /api/medications/plans/{planId}/intakes` - Get intakes by plan
- `POST /api/medications/plans/{planId}/intakes` - Create intake ✅
- `PUT /api/medications/intakes/{id}` - Update intake ✅
- `DELETE /api/medications/intakes/{id}` - Delete intake ✅
- `PATCH /api/medications/intakes/{id}/take` - Mark as taken
- `PATCH /api/medications/intakes/{id}/miss` - Mark as missed
- `PATCH /api/medications/intakes/{id}/skip` - Mark as skipped

**Appointments Service (`services/appointments-service/src/main/java/.../controller/`)**
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/{id}` - Get appointment by ID
- `GET /api/appointments/patient/{patientId}` - Get by patient
- `GET /api/appointments/status/{status}` - Get by status
- `POST /api/appointments` - Create appointment ✅
- `PUT /api/appointments/{id}` - Update appointment ✅
- `DELETE /api/appointments/{id}` - Delete appointment ✅

### ✅ Frontend Services (Verified)

**Medication Service (`frontend/humancare-ui/src/app/features/medications/services/medication.service.ts`)**
- ✅ All CRUD operations properly implemented
- ✅ Correct API URLs: `${environment.apiUrl}/api/medications/...`
- ✅ Matches all backend endpoints

**Appointment Service (`frontend/humancare-ui/src/app/features/appointments/services/appointment.service.ts`)**
- ✅ All CRUD operations properly implemented
- ✅ Correct API URLs: `${environment.apiUrl}/api/appointments`
- ✅ Matches all backend endpoints

### ⚠️ Frontend Components Status

**Medications Components:**
| Component | Create | Read | Update | Delete | Notes |
|-----------|--------|------|--------|--------|-------|
| `patient-medications.component.ts` | ✅ | ✅ | ❌ | ✅ | Uses `MedicationCreateDialogComponent`, has `deleteMedicationPlan()` |
| `doctor-medications.component.ts` | ❌ | ✅ | ✅ | ✅ | Has edit/delete via `MedicationManageDialogComponent`, **missing Add button** |

**Appointments Components:**
| Component | Create | Read | Update | Delete | Notes |
|-----------|--------|------|--------|--------|-------|
| `patient-appointments.component.ts` | ✅ | ✅ | ⚠️ (cancel only) | ❌ | Has `createAppointment()` and `cancelAppointment()`, **missing Delete** |
| `doctor-appointments.component.ts` | ❌ | ✅ | ✅ | ✅ | Has edit/update/delete via `AppointmentManageDialogComponent`, **missing Add button** |

## Identified Gaps

1. **Doctor Medications** - Missing "Add Medication" button in the UI (service method exists)
2. **Doctor Appointments** - Missing "Add Appointment" button in the UI (service method exists)
3. **Patient Appointments** - Missing "Delete/Cancel" functionality in the UI (service method exists, only has status update to CANCELLED)

## Tasks

### Subtask 1: Verify Services Match Backend
- [x] Review `medication.service.ts` - ✅ Matches backend
- [x] Review `appointment.service.ts` - ✅ Matches backend
- [x] Verify gateway routes - ✅ Correct

### Subtask 2: Add Missing UI Components
- [ ] Add "Add Medication" button to `doctor-medications.component.ts`
- [ ] Add "Add Appointment" button to `doctor-appointments.component.ts`
- [ ] Add "Delete/Cancel" button to `patient-appointments.component.ts`

### Subtask 3: Create Missing Dialog Components (if needed)
- [ ] Check if `AppointmentCreateDialogComponent` exists for doctor use (need patientId input)
- [ ] Create or adapt medication create dialog for doctor use (need patientId input)

## Environment Configuration
- Gateway URL: `http://localhost:8081`
- Services correctly use `environment.apiUrl` for base URL

## File Locations

### Services (Verified ✅)
- `frontend/humancare-ui/src/app/features/medications/services/medication.service.ts`
- `frontend/humancare-ui/src/app/features/appointments/services/appointment.service.ts`

### Components to Modify
- `frontend/humancare-ui/src/app/features/medications/components/doctor/doctor-medications.component.ts`
- `frontend/humancare-ui/src/app/features/appointments/components/doctor/doctor-appointments.component.ts`
- `frontend/humancare-ui/src/app/features/appointments/components/patient/patient-appointments.component.ts`

### Dialog Components (Existing)
- `frontend/humancare-ui/src/app/features/appointments/components/patient/dialogs/appointment-create-dialog.component.ts`
- `frontend/humancare-ui/src/app/features/medications/components/dialogs/medication-create-dialog.component.ts`
- `frontend/humancare-ui/src/app/features/appointments/components/doctor/appointment-manage-dialog.component.ts`
- `frontend/humancare-ui/src/app/features/medications/components/doctor/medication-manage-dialog.component.ts`

## Notes
- The services are already well-made and match the backend endpoints
- The main gaps are UI buttons and dialogs for doctors to add new records
- Patient components need delete/cancel functionality
- All backend connectivity is properly configured through the gateway
