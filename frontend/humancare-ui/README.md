# HumanCare UI

Angular frontend for the HumanCare healthcare platform.

## Features

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

### Key Components

| Component | Path | Description |
|-----------|------|-------------|
| `header` | `app/shared/components/header` | App header with notification bell |
| `notifications-dialog` | `app/shared/components/notifications-dialog` | Popup notification list |
| `notifications-page` | `app/features/notifications/components/notifications-page` | Full notifications page |
| `notification.service` | `app/shared/services/notification.service` | HTTP service for notifications |
| `notification.model` | `app/shared/models/notification.model` | Notification interfaces |

## Technology Stack

| Technology | Version |
|------------|---------|
| Angular | 18.2.21 |
| Angular Material | 18.x |
| TypeScript | 5.x |
| RxJS | 7.x |

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
├── core/                      # Core services, auth, guards
│   ├── auth/
│   ├── components/app-shell/
│   └── services/
├── features/                  # Feature modules
│   ├── appointments/
│   ├── dashboard/
│   ├── medications/
│   ├── notifications/         # Notification feature
│   └── profile/
├── shared/                    # Shared components, models, services
│   ├── components/
│   │   ├── header/           # With notification bell
│   │   ├── notifications-dialog/
│   │   └── ...
│   ├── models/
│   │   └── notification.model.ts
│   └── services/
│       └── notification.service.ts
└── ...
```

## Notification API Integration

The frontend communicates with the notification-service via the API Gateway:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications/my` | GET | Get user's notifications |
| `/api/notifications/unread-count` | GET | Get unread count |
| `/api/notifications/{id}/read` | PATCH | Mark as read |
| `/api/notifications/read-all` | PATCH | Mark all as read |

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
