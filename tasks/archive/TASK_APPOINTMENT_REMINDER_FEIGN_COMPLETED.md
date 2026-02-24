# Task: OpenFeign Communication - Appointment Reminder Cron Job

**Status:** ✅ COMPLETED  
**Started:** 2026-02-23  
**Completed:** 2026-02-24  

---

## Summary

Successfully implemented inter-service communication using OpenFeign between notification-service (client) and appointments-service (provider). The system creates automatic REMINDER notifications for patients with upcoming appointments.

---

## What Was Built

### Backend (Java/Spring Boot)

#### 1. Appointments Service (Provider)
**New Endpoint:**
- `GET /api/appointments/upcoming` - Returns appointments scheduled in next 7 days with status=SCHEDULED

**Files Modified:**
- `AppointmentRepository.java` - Added `findByAppointmentDateBetweenAndStatus()`
- `AppointmentService.java` - Added `getUpcomingAppointments()`
- `AppointmentController.java` - Added `/upcoming` endpoint

#### 2. Notification Service (Consumer)
**New Components:**
- `AppointmentClient` - Feign client to call appointments-service
- `PatientClient` - Feign client to convert patient DB ID to Keycloak ID
- `AppointmentScheduler` - Runs every 5 minutes, creates reminder notifications
- `AppointmentDto` - DTO for appointment data
- `PatientDto` - DTO for patient data with keycloakId
- `SecurityConfig` - JWT authentication configuration

**New API Endpoints:**
- `GET /api/notifications/my` - Get current user's notifications
- `GET /api/notifications/my/unread` - Get unread notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/{id}/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `POST /api/notifications/test/trigger-appointment-reminders` - Manual scheduler trigger

**Dependencies Added:**
- `spring-cloud-starter-openfeign`
- `spring-cloud-starter-loadbalancer`
- `spring-boot-starter-oauth2-resource-server`

### Frontend (Angular)

**New Components:**
- `notification.model.ts` - Notification interfaces
- `notification.service.ts` - HTTP service for notifications
- `notifications-dialog.component.ts` - Popup dialog (header bell click)
- `notifications-page.component.ts` - Full page at `/app/notifications`

**Modified:**
- `header.component.ts/html` - Added notification bell with badge
- `app.routes.ts` - Added `/app/notifications` route

**Features:**
- Real-time notification bell with unread count
- Notification popup dialog
- Full notification management page
- Mark as read / mark all as read
- Filter by All/Unread/Read
- Color-coded by type (INFO/ALERT/REMINDER)

---

## How It Works

```
Every 5 minutes
    │
    ▼
┌─────────────────────┐
│ AppointmentScheduler│
└──────────┬──────────┘
           │ Feign Client
           ▼
┌─────────────────────┐
│ Appointments Service│
│ GET /upcoming       │
└──────────┬──────────┘
           │ Returns appointments
           ▼
┌─────────────────────┐
│ For each appointment│
│ 1. Get patient by ID│
│ 2. Extract keycloakId
│ 3. Create REMINDER  │
└──────────┬──────────┘
           │ Save to DB
           ▼
┌─────────────────────┐
│ notifications table │
│ (recipient_id =     │
│  patient.keycloakId)│
└─────────────────────┘
```

---

## Key Issue Fixed

**Problem:** Initially notifications weren't showing because:
- Appointments stored `patientId` (internal DB UUID)
- JWT token contains `sub` claim (Keycloak UUID)
- These are different values!

**Solution:** Added `PatientClient` to fetch patient details and convert DB ID → Keycloak ID before creating notifications.

---

## Testing

### Manual Test Steps:
1. Create a patient via doctor dashboard
2. Create an appointment for that patient (within next 7 days)
3. Wait 5 minutes for scheduler OR call manual trigger:
   ```bash
   curl -X POST http://localhost:8081/api/notifications/test/trigger-appointment-reminders \
     -H "Authorization: Bearer <token>"
   ```
4. Login as that patient
5. Click notification bell → See reminder
6. Go to `/app/notifications` → Full page

---

## Documentation Updated

- ✅ `services/appointments-service/README.md` - Added `/upcoming` endpoint docs
- ✅ `services/notification-service/README.md` - Complete overhaul with Feign, scheduler, new endpoints
- ✅ `frontend/humancare-ui/README.md` - Notification system docs
- ✅ `AGENTS.md` - Added inter-service communication section
- ✅ `README.md` (root) - Added features and API endpoints

---

## Services Status

| Service | Port | Status |
|---------|------|--------|
| hc-notification-service | 8088 | ✅ Running with scheduler |
| hc-appointments-service | 8085 | ✅ Running with /upcoming endpoint |
| hc-api-gateway | 8081 | ✅ Routing configured |
| hc-eureka-server | 8761 | ✅ Service discovery |
| hc-config-server | 8888 | ✅ Config for all services |

---

## Files Created/Modified

### Backend
```
services/notification-service/src/main/java/com/humancare/notification/
├── client/
│   ├── AppointmentClient.java (NEW)
│   └── PatientClient.java (NEW)
├── config/
│   └── SecurityConfig.java (NEW)
├── dto/
│   ├── AppointmentDto.java (NEW)
│   └── PatientDto.java (NEW)
├── scheduler/
│   └── AppointmentScheduler.java (NEW)
└── controller/
    └── NotificationController.java (MODIFIED)

services/appointments-service/src/main/java/com/roudayna/appointments/
├── repository/AppointmentRepository.java (MODIFIED)
├── service/AppointmentService.java (MODIFIED)
└── controller/AppointmentController.java (MODIFIED)
```

### Frontend
```
frontend/humancare-ui/src/app/
├── shared/
│   ├── models/notification.model.ts (NEW)
│   ├── services/notification.service.ts (NEW)
│   └── components/
│       ├── notifications-dialog/ (NEW)
│       └── header/ (MODIFIED)
└── features/notifications/ (NEW)
```

---

## Known Limitations

- No duplicate prevention (same appointment can generate multiple notifications)
- No email/push notification integration (only in-app)
- Scheduler runs every 5 minutes (not real-time)

---

## Next Steps (Future)

- Add WebSocket for real-time notifications
- Add email/SMS notification delivery
- Add duplicate prevention logic
- Add notification preferences/settings
