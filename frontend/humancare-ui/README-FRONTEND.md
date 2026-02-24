# HumanCare UI - Angular 18 Frontend

## Project Overview
Angular 18 standalone application with Keycloak authentication for the HumanCare platform.

## Project Structure
```
frontend/humancare-ui/
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton services, guards, interceptors
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts      # Auth wrapper service
│   │   │   │   ├── auth.guard.ts        # Route protection guard
│   │   │   │   ├── role.guard.ts        # Role-based access guard
│   │   │   │   ├── auth.interceptor.ts  # HTTP interceptor (class)
│   │   │   │   └── auth.interceptor.fn.ts # HTTP interceptor (function)
│   │   │   └── keycloak/
│   │   │       └── keycloak.service.ts  # Keycloak integration
│   │   │
│   │   ├── features/                # Feature modules (lazy loaded)
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   └── dashboard.routes.ts
│   │   │   ├── profile/
│   │   │   │   ├── profile.component.ts
│   │   │   │   └── profile.routes.ts
│   │   │   ├── login/
│   │   │   │   └── login.component.ts
│   │   │   ├── logout/
│   │   │   │   └── logout.component.ts
│   │   │   └── unauthorized/
│   │   │       └── unauthorized.component.ts
│   │   │
│   │   ├── shared/                  # Shared components, models
│   │   │   ├── models/
│   │   │   │   ├── user.model.ts        # User & Role enums
│   │   │   │   └── patient.model.ts     # Patient interfaces
│   │   │   └── components/
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │
│   ├── environments/
│   │   ├── environment.ts           # Development config
│   │   └── environment.prod.ts      # Production config
│   │
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss
│   └── silent-check-sso.html        # Keycloak silent SSO
│
├── angular.json
├── proxy.conf.json                  # Dev proxy for API
└── package.json
```

## Dependencies Installed

### Keycloak Integration
- `keycloak-angular@16.1.0` - Angular Keycloak adapter
- `keycloak-js` - Keycloak JavaScript adapter
- `@auth0/angular-jwt` - JWT token handling

### Angular Material
- `@angular/material@18` - Material Design components
- `@angular/cdk@18` - Component Dev Kit

## Environment Configuration

### Development (`environments/environment.ts`)
```typescript
{
  production: false,
  apiUrl: 'http://localhost:8081',  // Gateway URL
  keycloak: {
    url: 'http://localhost:8090',
    realm: 'humancare',
    clientId: 'humancare-webapp'
  }
}
```

## Keycloak Configuration
- **Realm**: `humancare`
- **Client ID**: `humancare-webapp`
- **Auth Server URL**: `http://localhost:8090`

## Running the Application

```bash
# Navigate to project directory
cd frontend/humancare-ui

# Install dependencies
npm install

# Start development server
ng serve

# Or with proxy for API calls
ng serve --proxy-config proxy.conf.json
```

## Authentication Flow

1. **Unauthenticated User**: Redirected to `/login`
2. **Login Component**: Triggers Keycloak login flow
3. **Keycloak**: Authenticates user, returns JWT token
4. **Auth Interceptor**: Attaches Bearer token to all HTTP requests
5. **Auth Guard**: Protects routes requiring authentication
6. **Role Guard**: Checks user roles for specific routes

## Available Routes

| Route | Guard | Description |
|-------|-------|-------------|
| `/login` | - | Redirects to Keycloak login |
| `/logout` | - | Logs out user |
| `/unauthorized` | - | Access denied page |
| `/dashboard` | AuthGuard | Main dashboard (role-based content) |
| `/profile` | AuthGuard | User profile page |

## Roles

- `PATIENT` - Patient user
- `CAREGIVER` - Caregiver user  
- `DOCTOR` - Doctor user
- `ADMIN` - Administrator

## Services

### AuthService
```typescript
login(): Promise<void>
logout(): Promise<void>
isAuthenticated(): boolean
getCurrentUser(): User | null
hasRole(role: Role): boolean
getToken(): string | undefined
refreshToken(): Observable<string | undefined>
```

### KeycloakService
```typescript
init(): Promise<boolean>
login(redirectUri?: string): Promise<void>
logout(redirectUri?: string): Promise<void>
getToken(): string | undefined
getUserInfo(): UserInfo | null
getRoles(): string[]
hasRole(role: string): boolean
```

## Build

```bash
# Development build
ng build

# Production build
ng build --configuration production
```

## Notes
- Project uses Angular 18 standalone components (no NgModules)
- Lazy loading implemented for feature routes
- Angular Material prebuilt theme: `indigo-pink`
- Proxy config for API calls during development
