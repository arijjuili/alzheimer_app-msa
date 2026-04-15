# HumanCare Frontend Development Plan

> **Goal:** Transform the current Angular frontend into a fully functional, backend-driven healthcare web application that leverages all 8 microservices efficiently.
> **Status:** This is a planning document. No code changes should be made until this plan is reviewed and approved.

---

## 1. Current State Snapshot

### What Already Works
| Feature | Backend Integration | Quality |
|---------|---------------------|---------|
| **Auth (Keycloak)** | ✅ Full SSO via `keycloak.service.ts` | Production-ready |
| **Notifications** | ✅ Bell + page + unread count + mark read | Production-ready |
| **Patients (CRUD)** | ✅ List, detail, edit, doctor/caregiver assignment | Production-ready |
| **Appointments** | ✅ Patient & doctor views, create, status update | Good |
| **Medications** | ✅ Plans + intakes, taken/missed/skipped | Good |
| **Profile** | ✅ View, edit, audit logs | Good |

### What's Missing Entirely
| Feature | Backend Service | Why It Matters |
|---------|-----------------|----------------|
| **Daily Check-ins** | `daily-checkin-service` (8084) | Core patient wellness tracking (mood, sleep, symptoms) |
| **Community Wall** | `community-service` (8087) | Social feature for patients/caregivers to share posts |
| **Routines & Habits** | `routine-service` (8089) | Recurring tasks (meds, exercise, therapy) with completion |
| **Memory Items** | `memory-service` (8086) | Photo/video/audio/note memories for Alzheimer's care |

### What's Broken / Static
- **Patient Dashboard**: All data is hardcoded mock arrays (`upcomingAppointments`, `medications`, `careTeam`).
- **Caregiver Dashboard**: Entirely static mock data.
- **Admin Dashboard**: Entirely static mock data.
- **Menu Items**: Several menu entries route to non-existent pages (`/app/health`, `/app/schedule`, `/app/my-patients`, `/app/all-patients`, `/app/medical-records`, `/app/users`, `/app/settings`).

---

## 2. Target Architecture Vision

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HumanCare Angular App                           │
├─────────────────────────────────────────────────────────────────────────┤
│  Core Layer: Auth, Keycloak, HTTP Interceptors, Error Handling, Guards  │
├─────────────────────────────────────────────────────────────────────────┤
│  Feature Modules (Lazy Loaded):                                         │
│  ├─ Dashboard       ← Aggregates data from 6+ services                  │
│  ├─ Patients        ← Existing (keep + enhance)                         │
│  ├─ Appointments    ← Existing (keep + enhance)                         │
│  ├─ Medications     ← Existing (keep + enhance)                         │
│  ├─ Daily Check-in  ← NEW                                               │
│  ├─ Community       ← NEW                                               │
│  ├─ Routines        ← NEW                                               │
│  ├─ Memories        ← NEW                                               │
│  ├─ Notifications   ← Existing                                          │
│  └─ Profile         ← Existing                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Shared Layer: Material Module, Models, Pipes, Reusable Dialogs         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Phase 1: Build Missing Core Modules

### 3.1 Daily Check-in Module (`/app/checkins`)
**Backend:** `daily-checkin-service` @ `/api/v1/checkins`

#### UI Components
- `patient-checkins.component` — Patient view
  - Card-based list of past check-ins
  - "Check-in Today" form (mood selector, energy slider 1-10, sleep quality selector, symptoms list, notes)
  - If today's check-in exists, show it instead of the form
- `caregiver-checkins.component` — Caregiver view
  - List of assigned patients with today's check-in status (done / not done)
  - Drill-down to patient check-in history
- `doctor-checkins.component` — Doctor view
  - Table of all patients with latest check-in summary
  - Filter by date range, mood, symptoms

#### Services & Models
- `checkin.service.ts`
  - `getMyCheckins(page, size, sort)`
  - `getCheckinsByPatient(patientId, page, size)`
  - `getTodaysCheckin(patientId)`
  - `createCheckin(request)`
  - `updateCheckin(id, request)`
  - `deleteCheckin(id)`
- `checkin.model.ts`
  - Interfaces: `DailyCheckin`, `SymptomCheck`, `MoodType`, `SleepQuality`, `CreateDailyCheckinRequest`, `UpdateDailyCheckinRequest`

#### Backend Endpoints to Use
```
GET  /api/v1/checkins/patient/{patientId}
GET  /api/v1/checkins/patient/{patientId}/today
POST /api/v1/checkins
PUT  /api/v1/checkins/{id}
DELETE /api/v1/checkins/{id}
```

---

### 3.2 Community Module (`/app/community`)
**Backend:** `community-service` @ `/api/v1/posts`

#### UI Components
- `community-wall.component` — Main feed
  - Paginated post cards (author name, title, content snippet, category chip, timestamp)
  - Filter chips: GENERAL, SUPPORT, ADVICE, EVENT
  - "New Post" floating button → opens dialog
- `post-create-dialog.component` — Create post
  - Form: title, content textarea, category select
  - `authorId` auto-filled from current user
- `post-detail-dialog.component` — View full post
  - Full content, category, timestamp
  - Edit/Delete buttons for author/admins
- `post-edit-dialog.component` — Edit post

#### Services & Models
- `community.service.ts`
  - `getPosts(page, size, sort, authorId?, category?)`
  - `getPostById(id)`
  - `createPost(request)`
  - `updatePost(id, request)`
  - `deletePost(id)`
- `community.model.ts`
  - Interfaces: `CommunityPost`, `PostCategory`, `CreatePostRequest`, `UpdatePostRequest`, `PostResponse`

#### Backend Endpoints to Use
```
GET    /api/v1/posts
GET    /api/v1/posts/{id}
POST   /api/v1/posts
PUT    /api/v1/posts/{id}
DELETE /api/v1/posts/{id}
```

---

### 3.3 Routines Module (`/app/routines`)
**Backend:** `routine-service` @ `/api/v1/routines`

#### UI Components
- `patient-routines.component` — Patient view
  - List of active routines with "Complete" buttons
  - Visual progress indicator (e.g., circular progress for daily completions)
- `caregiver-routines.component` / `doctor-routines.component`
  - Table of routines by patient
  - Create/Edit/Delete actions (caregiver/doctor/admin only)
- `routine-create-dialog.component`
  - Form: patient select, title, description, frequency (DAILY/WEEKLY/MONTHLY), time picker
- `routine-edit-dialog.component`

#### Services & Models
- `routine.service.ts`
  - `getAllRoutines(pageable)`
  - `getRoutineById(id)`
  - `getRoutinesByPatient(patientId, pageable)`
  - `createRoutine(request)`
  - `updateRoutine(id, request)`
  - `deleteRoutine(id)`
  - `completeRoutine(id)` ← PATCH endpoint
- `routine.model.ts`
  - Interfaces: `Routine`, `RoutineFrequency`, `CreateRoutineRequest`, `UpdateRoutineRequest`, `RoutineResponse`

#### Backend Endpoints to Use
```
GET    /api/v1/routines
GET    /api/v1/routines/{id}
GET    /api/v1/routines/patient/{patientId}
POST   /api/v1/routines
PUT    /api/v1/routines/{id}
PATCH  /api/v1/routines/{id}/complete
DELETE /api/v1/routines/{id}
```

---

### 3.4 Memory Module (`/app/memories`)
**Backend:** `memory-service` @ `/api/memories`

#### UI Components
- `memories-gallery.component` — Main gallery view
  - Masonry or grid layout of memory cards
  - Color-coded by type: PHOTO (purple), VIDEO (red), AUDIO (blue), NOTE (green)
  - Filter tabs: All | Photos | Videos | Audio | Notes
  - "Add Memory" button → dialog
- `memory-create-dialog.component`
  - Form: title, description, memory date picker, type select, patient select (for caregivers/doctors)
- `memory-detail-dialog.component`
  - Full view with larger typography, edit/delete actions
- `memory-edit-dialog.component`

#### Services & Models
- `memory.service.ts`
  - `getAllMemories(pageable)`
  - `getMemoryById(id)`
  - `getMemoriesByPatient(patientId, pageable)`
  - `createMemory(request)`
  - `updateMemory(id, request)`
  - `deleteMemory(id)`
- `memory.model.ts`
  - Interfaces: `MemoryItem`, `MemoryType`, `CreateMemoryItemRequest`, `UpdateMemoryItemRequest`, `MemoryItemResponse`

#### Backend Endpoints to Use
```
GET    /api/memories
GET    /api/memories/{id}
GET    /api/memories/patient/{patientId}
POST   /api/memories
PUT    /api/memories/{id}
DELETE /api/memories/{id}
```

---

## 4. Phase 2: Make Dashboards Data-Driven

Currently all dashboards except Doctor's contain static arrays. We need to replace mock data with real service calls and add loading states.

### 4.1 Patient Dashboard (`/app/dashboard/patient`)
**Current:** Hardcoded BPM, BP, SpO2, appointments, meds, care team.

**Target Data Sources:**
| Card Section | Backend Service | Endpoint |
|--------------|-----------------|----------|
| **Health Overview** | `daily-checkin-service` | `GET /api/v1/checkins/patient/{id}/today` |
| **Upcoming Appointments** | `appointments-service` | `GET /api/appointments/patient/{id}` (filter next 7 days) |
| **Today's Medications** | `medication-service` | `GET /api/medications/plans/by-patient/{id}/active` + intakes for today |
| **Care Team** | `patient-service` | `GET /api/v1/patients/{id}` (read doctorId / caregiverId, then fetch names) |
| **My Routines** | `routine-service` | `GET /api/v1/routines/patient/{id}` |
| **Recent Memories** | `memory-service` | `GET /api/memories/patient/{id}?size=3` |

**UI Changes:**
- Replace static metrics grid with today's check-in summary (mood, energy, sleep)
- Add quick-action buttons: "Check In Today", "View Memories", "My Routines"
- Show empty states when no data exists (e.g., "No appointments this week")

### 4.2 Doctor Dashboard (`/app/dashboard/doctor`)
**Current:** Already loads real patient data. Needs enhancements.

**Additions:**
- **Today's Appointments** card: call `GET /api/appointments` and filter by doctor's name (or patient list)
- **Pending Check-ins** card: show patients who haven't checked in today
- **Medication Alerts** card: patients with missed medications (requires adding `getMissedIntakes` or filtering)
- **Quick Actions:** "Add Medication", "Book Appointment", "Create Routine"

### 4.3 Caregiver Dashboard (`/app/dashboard/caregiver`)
**Current:** Entirely static.

**Target Data Sources:**
| Card Section | Backend Service | Endpoint |
|--------------|-----------------|----------|
| **My Patients** | `patient-service` | `GET /api/v1/patients` (filter by assigned caregiver) |
| **Today's Schedule** | Aggregated from `routine-service` + `appointments-service` + `medication-service` for assigned patients |
| **Alerts** | `notification-service` or aggregated misses | Show patients with missed meds / no check-in |
| **Tasks** | Derived from routines | Routines not yet completed today |

### 4.4 Admin Dashboard (`/app/dashboard/admin`)
**Current:** Entirely static user table.

**Target Data Sources:**
| Card Section | Backend Service | Endpoint |
|--------------|-----------------|----------|
| **System Stats** | Eureka/Actuator or aggregated service calls | Total patients, doctors, caregivers, appointments today |
| **Recent Users** | `patient-service` | `GET /api/v1/patients` (last registered via auth sync) |
| **Service Health** | Gateway `/actuator/health` or individual services | Simple up/down indicators |
| **Recent Activity** | Audit logs from `patient-service` | `GET /api/v1/patients/{id}/audit` aggregated |

---

## 5. Phase 3: Navigation & UX Unification

### 5.1 Fix the Sidebar Menu (`menu.service.ts`)
Remove dead links and align with real features.

**New Menu Structure:**
```typescript
// Common
{ icon: 'dashboard', label: 'Dashboard', route: '/app/dashboard', roles: ALL }

// Patient only
{ icon: 'favorite', label: 'My Health', route: '/app/checkins', roles: [PATIENT] }
{ icon: 'medication', label: 'Medications', route: '/app/medications', roles: [PATIENT] }
{ icon: 'event', label: 'Appointments', route: '/app/appointments', roles: [PATIENT] }
{ icon: 'schedule', label: 'My Routines', route: '/app/routines', roles: [PATIENT] }
{ icon: 'photo_library', label: 'Memories', route: '/app/memories', roles: [PATIENT] }
{ icon: 'forum', label: 'Community', route: '/app/community', roles: [PATIENT, CAREGIVER, DOCTOR] }

// Caregiver
{ icon: 'people', label: 'My Patients', route: '/app/patients', roles: [CAREGIVER] }
{ icon: 'schedule', label: 'Routines', route: '/app/routines', roles: [CAREGIVER] }

// Doctor
{ icon: 'people', label: 'Patients', route: '/app/patients', roles: [DOCTOR] }
{ icon: 'medication', label: 'Medications', route: '/app/medications', roles: [DOCTOR] }
{ icon: 'event', label: 'Appointments', route: '/app/appointments', roles: [DOCTOR] }
{ icon: 'schedule', label: 'Routines', route: '/app/routines', roles: [DOCTOR] }

// Admin
{ icon: 'people', label: 'User Management', route: '/app/patients', roles: [ADMIN] }
{ icon: 'settings', label: 'System Settings', route: '/app/settings', roles: [ADMIN] }

// Common last
{ icon: 'notifications', label: 'Notifications', route: '/app/notifications', roles: ALL }
{ icon: 'person', label: 'My Profile', route: '/app/profile', roles: ALL }
```

### 5.2 Global UX Improvements
- **Loading Skeletons:** Replace blank screens with Material skeleton loaders on all dashboards.
- **Empty States:** Consistent "No data" illustrations + CTA buttons across all lists.
- **Toast Notifications:** Use Angular Material Snackbar for success/error messages after CRUD operations.
- **Confirmation Dialogs:** Already have `confirm-dialog.component.ts` — ensure it's used for all destructive actions (delete).
- **Mobile Responsiveness:** Ensure all new modules use `fxLayout` or CSS Grid with proper breakpoints.

---

## 6. Phase 4: Cross-Feature Integration & Power User Features

### 6.1 Patient Detail Page as a Hub
The existing `patient-detail.component` should become a unified hub showing:
- Patient profile info (already exists)
- **Appointments** tab: mini list with "Book New" button
- **Medications** tab: active plans + recent intakes
- **Check-ins** tab: last 7 days of mood/energy charts (simple line/bar chart using `chart.js` or SVG)
- **Routines** tab: active routines + completion history
- **Memories** tab: recent memory items
- **Audit Log** tab: already exists as `profile-audit`, reuse pattern

*This avoids forcing doctors/caregivers to jump between modules for a single patient.*

### 6.2 Real-Time Notification Triggers
The backend already publishes RabbitMQ events that land in the Notification Service. The frontend should make these feel immediate:
- **Notification Polling:** Bell already polls unread count. Keep it but increase to every 30s (or use SSE/WebSocket if RabbitMQ is bridged — out of scope, use polling).
- **Toast on Action:** When a doctor books an appointment, show a success toast and the patient will see the notification on next poll.

### 6.3 Global Search (Optional but High Value)
Add a search bar in the header for power users (doctors/admins):
- Search patients by name
- Search medications by name
- Search community posts by title
*Backend services would need search endpoints — if they don't exist, this becomes a Phase 5 item.*

---

## 7. Technical Implementation Guidelines

### 7.1 Folder Structure for New Features
Follow the existing convention:

```
src/app/features/<feature-name>/
├── components/
│   ├── <role>-<feature>.component.ts/html/scss
│   ├── dialogs/
│   │   ├── <feature>-create-dialog.component.ts
│   │   ├── <feature>-edit-dialog.component.ts
│   │   └── <feature>-detail-dialog.component.ts
│   └── <feature>-redirect.component.ts
├── services/
│   └── <feature>.service.ts
├── models/
│   └── <feature>.model.ts          # OR place in shared/models/
└── <feature>.routes.ts
```

### 7.2 Model Placement
Add interfaces to `src/app/shared/models/` for consistency:
- `checkin.model.ts`
- `community.model.ts`
- `routine.model.ts`
- `memory.model.ts`

### 7.3 Route Registration
Update `app.routes.ts` to lazy-load new modules under `/app`:

```typescript
{
  path: 'checkins',
  loadChildren: () => import('./features/checkins/checkins.routes').then(m => m.CHECKINS_ROUTES)
},
{
  path: 'community',
  loadChildren: () => import('./features/community/community.routes').then(m => m.COMMUNITY_ROUTES)
},
{
  path: 'routines',
  loadChildren: () => import('./features/routines/routines.routes').then(m => m.ROUTINES_ROUTES)
},
{
  path: 'memories',
  loadChildren: () => import('./features/memories/memories.routes').then(m => m.MEMORIES_ROUTES)
}
```

### 7.4 Role Guards
Use existing `RoleGuard` for feature-level protection:
- `Daily Check-in`: Patient (create own), Caregiver/Doctor (view assigned)
- `Community`: All authenticated
- `Routines`: All authenticated (create restricted to Caregiver+, delete to Admin)
- `Memories`: All authenticated (delete restricted to Patient/Admin)

### 7.5 API Gateway Base URL
All services already point to `environment.apiUrl = 'http://localhost:8081'`. No change needed.

---

## 8. Backend API Reference for Frontend

Quick reference of all endpoints the frontend needs to hit:

### Daily Check-in (`/api/v1/checkins`)
```
GET    /api/v1/checkins/patient/{patientId}?page=&size=&sort=
GET    /api/v1/checkins/patient/{patientId}/today
POST   /api/v1/checkins
PUT    /api/v1/checkins/{id}
DELETE /api/v1/checkins/{id}
```

### Community (`/api/v1/posts`)
```
GET    /api/v1/posts?authorId=&category=&page=&size=&sort=
GET    /api/v1/posts/{id}
POST   /api/v1/posts
PUT    /api/v1/posts/{id}
DELETE /api/v1/posts/{id}
```

### Routines (`/api/v1/routines`)
```
GET    /api/v1/routines?page=&size=&sort=
GET    /api/v1/routines/{id}
GET    /api/v1/routines/patient/{patientId}?page=&size=&sort=
POST   /api/v1/routines
PUT    /api/v1/routines/{id}
PATCH  /api/v1/routines/{id}/complete
DELETE /api/v1/routines/{id}
```

### Memories (`/api/memories`)
```
GET    /api/memories?page=&size=&sort=
GET    /api/memories/{id}
GET    /api/memories/patient/{patientId}?page=&size=&sort=
POST   /api/memories
PUT    /api/memories/{id}
DELETE /api/memories/{id}
```

### Existing (for reference)
```
Patients:    /api/v1/patients/**
Appointments:/api/appointments/**
Medications: /api/medications/**
Notifications:/api/notifications/**
```

---

## 9. Implementation Priority Order

### Sprint A: Foundations (Week 1)
1. **Create shared models** for Check-in, Community, Routine, Memory.
2. **Create 4 new services** (HTTP layer only — no UI yet).
3. **Register new routes** in `app.routes.ts`.
4. **Fix `menu.service.ts`** to remove dead links and add real ones.

### Sprint B: New Feature Modules (Week 2)
5. **Daily Check-in module** — patient form + caregiver/doctor views.
6. **Routines module** — CRUD + complete button.
7. **Memories module** — gallery grid + CRUD dialogs.

### Sprint C: Social & Polish (Week 3)
8. **Community module** — wall feed + post dialogs.
9. **Patient Dashboard** — replace mock data with real service calls.
10. **Caregiver Dashboard** — replace mock data.

### Sprint D: Advanced Integration (Week 4)
11. **Doctor Dashboard** — enhance with appointments, alerts, quick actions.
12. **Admin Dashboard** — basic stats + service health indicators.
13. **Patient Detail Hub** — add tabs for meds, appointments, check-ins, routines, memories.
14. **Global UX pass** — skeletons, empty states, toast notifications, mobile responsiveness.

---

## 10. Success Criteria

- [ ] All 8 backend services have corresponding frontend functionality.
- [ ] No dashboard contains hardcoded mock data.
- [ ] Navigation menu has zero dead links.
- [ ] A user can log in, view their dashboard, and perform CRUD on every feature relevant to their role.
- [ ] Notifications appear in real-time (via polling) after backend events trigger them.
- [ ] The app is usable on tablet and desktop screen sizes.

---

## 11. Open Questions for Review

1. **Charts:** Should we add `chart.js` or `ngx-charts` for check-in mood/energy history visualization, or keep it table-based initially?
2. **Mobile:** Is mobile responsiveness a priority, or is desktop/tablet sufficient for the school demo?
3. **Admin Settings:** The `/app/settings` page is currently a dead link. Should we build a simple admin settings page (e.g., system info), or remove it from the menu?
4. **Community moderation:** Should admins be able to delete any post, or only their own?
5. **File uploads:** Memory items mention PHOTO/VIDEO/AUDIO but the backend currently stores only metadata (title/description/type). Should we add actual file upload support, or treat this as a "memory log" of text metadata only for now?

---

**Next Step:** Review and approve this plan, answer the open questions, and then we will begin implementation starting with Sprint A.
