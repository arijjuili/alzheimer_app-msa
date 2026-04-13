# HumanCare UI

Angular frontend for the HumanCare healthcare platform.

## Features

### Role-Based Dashboards
All dashboards are fully data-driven and integrate with the backend microservices in real time:

- **Patient Dashboard**: Health overview (today's check-in), upcoming appointments, today's medications, active routines, recent memories, and care team status
- **Doctor Dashboard**: Assigned patients, today's appointments, quick actions, patient alerts (missing check-ins, missed medications), and unassigned patient count
- **Caregiver Dashboard**: Assigned patients, today's unified schedule (routines + appointments + medications), patient alerts, and pending routines
- **Admin Dashboard**: Total user counts, recent registrations, today's appointments, and system health indicators

### Notification System
The application includes a complete notification system for alerting users about important events:

- **Real-time Notification Bell**: Header displays unread count badge
- **Notification Dialog**: Quick view of recent notifications via bell icon click
- **Notifications Page**: Full notification management at `/app/notifications`
  - View all notifications with filtering (All/Unread/Read)
  - Mark individual notifications as read
  - Mark all notifications as read
  - Delete notifications
  - Color-coded by type (INFO=blue, ALERT=red, REMINDER=orange)

### Daily Check-ins (`/app/checkins`)
Patient wellness tracking with mood, energy level, sleep quality, and symptom logging:

- **Patient View**: "Check In Today" form, view today's check-in summary, browse past check-ins
- **Caregiver/Doctor/Admin View**: Paginated table of all patient check-ins
- **Models**: `MoodType`, `SleepQuality`, `SymptomCheck`, `DailyCheckin`
- **Backend**: `daily-checkin-service`

### Community Wall (`/app/community`)
Social feature for patients, caregivers, and doctors to share posts and support discussions:

- **Community Feed**: Paginated post cards with category filters (GENERAL, SUPPORT, ADVICE, EVENT)
- **Create/Edit/Delete Posts**: Full CRUD with role-based permissions
- **Backend**: `community-service`

### Routines & Habits (`/app/routines`)
Recurring health-related activities (medication schedules, exercise, therapy sessions):

- **Patient View**: Active routine cards with "Complete" action
- **Caregiver/Doctor/Admin View**: Full CRUD table for managing patient routines
- **Frequency Support**: DAILY, WEEKLY, MONTHLY with optional time-of-day
- **Backend**: `routine-service`

### Memories (`/app/memories`)
Memory preservation feature for Alzheimer's care:

- **Gallery View**: Grid of memory items filtered by type (PHOTO, VIDEO, AUDIO, NOTE)
- **List View**: Table view for doctors/caregivers/admins
- **CRUD Dialogs**: Create, edit, view detail, and delete memory items
- **Backend**: `memory-service`

### Appointments (`/app/appointments`)
- **Patient View**: View upcoming appointments and create new ones
- **Doctor/Admin View**: Manage and update appointment statuses
- **Backend**: `appointments-service`

### Medications (`/app/medications`)
- **Patient View**: View active plans, see today's scheduled intakes, mark as Taken/Missed/Skipped
- **Doctor View**: Create medication plans and manage intakes for assigned patients
- **Backend**: `medication-service`

### Patients (`/app/patients`)
- **Doctor/Caregiver/Admin View**: Patient list, detail hub, edit profile, assign/unassign doctors and caregivers
- **Backend**: `patient-service`

### Profile (`/app/profile`)
- View and edit personal profile
- View audit logs of patient-related activities
- **Backend**: `patient-service`

## Technology Stack

| Technology | Version |
|------------|---------|
| Angular | 18.2.21 |
| Angular Material | 18.x |
| TypeScript | 5.x |
| RxJS | 7.x |
| Keycloak JS | 25.x |

## Development

### Prerequisites
- Node.js 18+
- npm 9+

### Install Dependencies
```bash
cd frontend/humancare-ui
npm install
```

### Run Development Server
```bash
ng serve
```
Navigate to `http://localhost:4200/`

### Build
```bash
ng build
```
Build artifacts in `dist/` directory.

## Project Structure

```
src/app/
├── core/                      # Core services, auth, guards, keycloak
│   ├── auth/
│   ├── components/app-shell/
│   ├── keycloak/
│   └── services/
├── features/                  # Feature modules (lazy loaded)
│   ├── appointments/
│   ├── checkins/             # Daily wellness check-ins
│   ├── community/            # Community wall & posts
│   ├── dashboard/            # Role-based dashboards
│   ├── medications/          # Medication plans & intakes
│   ├── memories/             # Memory items gallery
│   ├── notifications/        # Notification management
│   ├── patients/             # Patient CRUD & assignments
│   ├── profile/              # User profile & audit logs
│   └── routines/             # Routines & habits
├── shared/                    # Shared components, models, services
│   ├── components/
│   │   ├── header/           # With notification bell
│   │   ├── notifications-dialog/
│   │   ├── confirm-dialog/
│   │   ├── loading/
│   │   ├── sidebar/
│   │   └── footer/
│   ├── models/
│   │   ├── appointment.model.ts
│   │   ├── checkin.model.ts
│   │   ├── community.model.ts
│   │   ├── medication.model.ts
│   │   ├── memory.model.ts
│   │   ├── notification.model.ts
│   │   ├── patient.model.ts
│   │   ├── routine.model.ts
│   │   └── user.model.ts
│   ├── pipes/
│   └── services/
│       └── notification.service.ts
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

## API Integration Reference

The frontend communicates with all backend microservices through the API Gateway at `http://localhost:8081`.

### Notifications
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications/my` | GET | Get user's notifications |
| `/api/notifications/unread-count` | GET | Get unread count |
| `/api/notifications/{id}/read` | PATCH | Mark as read |
| `/api/notifications/read-all` | PATCH | Mark all as read |

### Check-ins
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/checkins/patient/{patientId}` | GET | Get check-ins by patient |
| `/api/v1/checkins/patient/{patientId}/today` | GET | Get today's check-in |
| `/api/v1/checkins` | POST | Create new check-in |

### Community
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/posts` | GET | Get all posts |
| `/api/v1/posts` | POST | Create post |
| `/api/v1/posts/{id}` | PUT | Update post |
| `/api/v1/posts/{id}` | DELETE | Delete post |

### Routines
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/routines` | GET | Get all routines |
| `/api/v1/routines/patient/{patientId}` | GET | Get routines by patient |
| `/api/v1/routines` | POST | Create routine |
| `/api/v1/routines/{id}/complete` | PATCH | Mark routine as completed |

### Memories
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/memories` | GET | Get all memories |
| `/api/memories/patient/{patientId}` | GET | Get memories by patient |
| `/api/memories` | POST | Create memory |
| `/api/memories/{id}` | PUT | Update memory |

## Environment Configuration

Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081',  // Gateway URL
  keycloak: {
    url: 'http://localhost:8090',
    realm: 'humancare',
    clientId: 'humancare-webapp'
  }
};
```

## Further Help

For Angular CLI help: `ng help` or visit [Angular CLI Reference](https://angular.dev/tools/cli)
