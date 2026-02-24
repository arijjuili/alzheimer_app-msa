# Task: Patient-Doctor Assignment System

## Goal
Enable doctors to view all patients, assign patients to themselves, and manage assigned patients (medications, appointments, etc.).

## Current State
- Patient model has `doctorId` field (UUID) but no API to use it
- Doctor dashboard shows mock data only
- No way to link doctors to patients
- Medication service uses Long for patientId (type mismatch with Patient service UUID)

## Sub-Tasks

### 1. Backend - Patient Service Enhancement ✅
**Files:** `services/patient-service/`

- [x] Add endpoint `GET /patients/by-doctor/:doctorId` - get patients assigned to a doctor
- [x] Add endpoint `PUT /patients/:id/assign-doctor` - assign a doctor to a patient
- [x] Add endpoint `PUT /patients/:id/assign-caregiver` - assign a caregiver to a patient  
- [x] Add endpoint `GET /patients/unassigned` - get patients with no doctor (optional filter)
- [x] Update existing `GET /patients` to optionally filter by `doctorId` query param
- [x] Add validation that doctor/caregiver IDs are valid UUIDs
- [x] Add DELETE endpoints for unassign (or use PUT with null)
- [x] **BUG FIX:** Fixed route path (`/patients` → `/api/v1/patients`) to match gateway routing
- [x] **BUG FIX:** Removed duplicate CORS middleware (handled by gateway)
- [x] **FEATURE:** Auto-create patient record on registration (for PATIENT role)
- [x] **FEATURE:** Added `/auth/sync-patients` endpoint to import existing Keycloak patients

### 2. Backend - Medication Service Fix ✅
**Files:** `services/medication/`

- [x] Change `patientId` type from `Long` to `String` (UUID) to match Patient service
- [x] Update all repositories, services, and controllers
- [x] Update database schema/migrations

### 3. Frontend - Doctor Dashboard & Patient List ✅
**Files:** `frontend/humancare-ui/src/app/features/`

- [x] Update `patient.service.ts` - add methods for assignment APIs
- [x] Update `patient-list.component.ts` - add "Assign to Me" button for doctors
- [x] Show assignment status (assigned/unassigned) in patient list
- [x] Filter options: "All Patients", "My Patients", "Unassigned Patients"
- [x] Update `doctor-dashboard.component.ts` - load real "my patients" data
- [x] Update HTML templates for new UI components
- [x] **BUG FIX:** Fixed hardcoded API paths to use correct `/api/v1/patients` prefix

### 4. Frontend - Patient Detail Enhancement ✅
**Files:** `frontend/humancare-ui/src/app/features/patients/`

- [x] Show assigned doctor/caregiver info in patient detail
- [x] Add "Assign Doctor" button (admin/doctor can assign)
- [x] Add "Assign Caregiver" button
- [x] Quick actions: Add Medication, Schedule Appointment

### 5. Frontend - Medication Management for Doctor's Patients
**Files:** `frontend/humancare-ui/src/app/features/medications/`

- [ ] Update `doctor-medications.component.ts` - default filter to "my patients"
- [ ] When creating medication, dropdown shows only doctor's assigned patients
- [ ] Quick link from patient detail to add medication for that patient

## API Changes

### New Endpoints
```
GET    /api/v1/patients?doctorId={uuid}          - Filter patients by doctor
GET    /api/v1/patients/by-doctor/{doctorId}     - Get doctor's patients
PUT    /api/v1/patients/{id}/assign-doctor       - Body: { doctorId }
DELETE /api/v1/patients/{id}/assign-doctor       - Unassign doctor
PUT    /api/v1/patients/{id}/assign-caregiver    - Body: { caregiverId }
DELETE /api/v1/patients/{id}/assign-caregiver    - Unassign caregiver
GET    /api/v1/patients/unassigned               - Patients with no doctor
POST   /auth/sync-patients                       - Sync Keycloak patients to DB
```

### Bug Fixes
```
Fixed: Route path /patients → /api/v1/patients (404 errors)
Fixed: Duplicate CORS headers (CORS policy errors)
Fixed: Frontend API URLs missing /v1 prefix
```

### Modified Endpoints
```
GET    /api/patients                          - Add doctorId query param filter
POST   /api/medications/plans                 - patientId now String (UUID)
GET    /api/medications/plans/by-patient/{id} - id now String (UUID)
```

## Data Flow
1. Doctor logs in → sees dashboard with "My Patients" count
2. Doctor navigates to "Patients" → sees all patients with assignment status
3. Doctor clicks "Assign to Me" on unassigned patient
4. Patient now appears in "My Patients" list
5. Doctor can now add medications, view details for assigned patients

## Testing Checklist
- [x] Doctor can view all patients
- [x] Doctor can assign patient to self
- [x] Doctor can unassign (reassign) patient
- [x] Doctor sees only their patients in "My Patients" view
- [ ] Medications can be created for assigned patients
- [x] Type alignment works (UUID across services)
- [x] Patient records auto-created on registration
- [x] Existing Keycloak patients can be synced


## Rebuild Required

### 1. Medication Service (Critical - Type Changes)
```bash
cd services/medication
mvn clean package -DskipTests
docker build -t hc-medication-service .
```

### 2. Patient Service (New Endpoints)
```bash
cd services/patient-service
npm install
docker build -t hc-patient-service .
```

### 3. Restart Services
```bash
docker-compose up -d hc-medication-service hc-patient-service
```

## Manual Testing Steps

### Pre-requisite: Sync Existing Patients (One-time)
If you have existing PATIENT users in Keycloak but the patient database is empty:
```bash
curl -X POST http://localhost:8081/auth/sync-patients
```

### Main Testing Flow

1. **Login as DOCTOR**
   - Check Dashboard shows real stats (not 142, 8, 3)
   - Should show actual patient counts

2. **Navigate to Patients**
   - See tabs: "All", "My Patients", "Unassigned"
   - Unassigned patients show "Assign to Me" button

3. **Assign Patient**
   - Click "Assign to Me" on unassigned patient
   - Confirm dialog appears
   - Patient now in "My Patients" tab

4. **Patient Detail**
   - Click on patient → See Assignment card
   - Shows "Assigned" badge for doctor
   - Quick Actions: "Add Medication", "Schedule Appointment"

5. **Medications**
   - From patient detail → Click "Add Medication"
   - Should navigate to medication create with patientId in URL

### Testing Patient Registration
1. **Register new PATIENT**
   - Go to registration page, select PATIENT role
   - Submit registration
   - Check that patient record is auto-created in database
