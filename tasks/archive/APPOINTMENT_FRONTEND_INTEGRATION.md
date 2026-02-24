# Task: Integrate Appointment Functionality into Frontend

## Overview
Integrate the existing appointment microservice (port 8085) into the Angular frontend to enable patients to view and manage their appointments, and doctors to view and manage their patient appointments.

## Background

### Appointment Service API (Backend - Already Working)
- **Port:** 8085
- **Base Path:** `/api/appointments`
- **Eureka:** Registered as `APPOINTMENTS-SERVICE`
- **Owner:** Roudayna

### Available Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/appointments/health` | Health check |
| GET | `/api/appointments` | Get all appointments |
| GET | `/api/appointments/{id}` | Get by ID |
| GET | `/api/appointments/patient/{patientId}` | Get by patient |
| GET | `/api/appointments/status/{status}` | Get by status |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/{id}` | Update appointment |
| DELETE | `/api/appointments/{id}` | Delete appointment |

### Appointment Model (Backend)
```java
{
  "id": Long,
  "patientId": Long,
  "doctorName": String,
  "appointmentDate": LocalDateTime (ISO format),
  "reason": String,
  "status": String, // SCHEDULED, COMPLETED, CANCELLED
  "notes": String
}
```

## Requirements

### 1. Core Services & Models
- Create `Appointment` model interface in Angular
- Create `AppointmentService` to communicate with backend via Gateway (port 8081)

### 2. Patient Features
- View my appointments list
- View appointment details
- Request new appointment (create)
- Cancel my appointment

### 3. Doctor Features
- View today's appointments
- View all appointments
- View appointment details
- Update appointment status (complete, cancel)
- Add notes to appointment

### 4. UI/UX
- Add "Appointments" link to sidebar navigation
- Create appointment list view (table/card based)
- Create appointment detail view
- Create appointment form (create/update)
- Role-based access control (PATIENT vs DOCTOR)

### 5. Role-Based Access
| Feature | PATIENT | DOCTOR |
|---------|---------|--------|
| View own appointments | ✅ | ✅ |
| View all appointments | ❌ | ✅ |
| Create appointment | ✅ | ❌ |
| Cancel appointment | ✅ (own only) | ✅ |
| Update status/notes | ❌ | ✅ |
| Delete appointment | ❌ | ✅ |

## Technical Details

### Gateway URL
- Frontend → Gateway: `http://localhost:8081`
- Gateway routes to appointments-service via Eureka

### Auth
- JWT token automatically attached via AuthInterceptor
- Role checks via RoleGuard

### Existing Patterns to Follow
See `patient.service.ts` and `patients.routes.ts` for reference implementation.

## Acceptance Criteria
- [ ] Patient can view their appointments list
- [ ] Patient can create a new appointment request
- [ ] Patient can cancel their appointment
- [ ] Doctor can view all appointments
- [ ] Doctor can update appointment status
- [ ] Doctor can add notes to appointment
- [ ] Sidebar shows "Appointments" menu item
- [ ] Role-based access works correctly
- [ ] Manual testing passes with docker-compose up

## Related Files
- `services/appointments-service/` - Backend service
- `frontend/humancare-ui/src/app/features/` - Frontend features folder
- `frontend/humancare-ui/src/app/shared/models/` - Models folder
- `frontend/humancare-ui/src/app/core/services/` - Services folder
