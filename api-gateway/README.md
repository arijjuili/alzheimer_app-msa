# API Gateway

Spring Cloud Gateway for HumanCare Platform. The Gateway is the single entry point for all client requests, handling routing, authentication, CORS, and load balancing.

## Port
- 8081

## Features
- **API Routing** - Routes requests to appropriate microservices
- **JWT Validation** - Validates tokens with Keycloak
- **Role-Based Access Control** - Enforces authorization rules
- **CORS Configuration** - Handles cross-origin requests from Angular
- **Global Logging** - Correlation IDs for distributed tracing
- **Retry Filter** - Automatic retry for failed requests
- **Service Discovery** - Eureka integration with `lb://` load balancing for all services

---

## API Endpoints

### Gateway Routes

| Route ID | Path | Destination | Description |
|----------|------|-------------|-------------|
| `patient-service` | `/api/v1/patients/**`<br>`/api/v1/audit/**` | Patient Service (8082) | Patient profiles & audit logs |
| `event-ingestion` | `/api/v1/events/**`<br>`/api/v1/devices/**` | Event Service (8002) | IoT device events |
| `safety-alert-engine` | `/api/behavior-logs/**`<br>`/api/alerts/**` | Safety Service (8003) | Risk detection & alerts |
| `notification-service` | `/api/v1/notifications/**`<br>`/api/v1/notification-templates/**`<br>`/api/v1/schedules/**` | Notification Service (8004) | Notifications & schedules |
| `cognitive-memory` | `/api/v1/cognitive/**`<br>`/api/v1/games/**`<br>`/api/v1/memories/**` | Cognitive Service (8005) | Brain training |
| `daily-care` | `/api/v1/daily-care/**`<br>`/api/v1/habits/**` | Daily Care (8006) | Habit management |
| `medical-management` | `/api/v1/medical/**`<br>`/api/v1/appointments/**`<br>`/api/v1/medications/**` | Medical Service (8007) | Appointments & meds |
| `care-team` | `/api/v1/care-team/**` | Care Team (8008) | Caregiver assignments |
| `community-social` | `/api/v1/community/**` | Community (8009) | Forum & social |
| `ml-prediction` | `/api/v1/ml/**` | ML Service (8094) | AI/ML analytics |
| `keycloak` | `/realms/**`<br>`/resources/**` | Keycloak (8090) | OAuth endpoints |

### Public Endpoints (No Auth Required)
| Endpoint | Description |
|----------|-------------|
| `/actuator/**` | Health and metrics |
| `/realms/**` | Keycloak authentication endpoints |
| `/resources/**` | Keycloak static resources |
| `/` | Root path |

### Actuator
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actuator/health` | Health check |
| GET | `/actuator/info` | Service info |
| GET | `/actuator/gateway/routes` | List all routes |
| GET | `/actuator/gateway/globalfilters` | List global filters |
| GET | `/actuator/metrics` | Metrics data |

---

## Frontend Integration Guide

### Base URL

All API calls from Angular should use:

```
http://localhost:8081
```

**DO NOT** call services directly on their ports (8001, 8004, etc.). Always use the Gateway.

### Authentication

Include JWT token in Authorization header:

```javascript
// Angular HTTP interceptor example
const headers = new HttpHeaders({
  'Authorization': `Bearer ${keycloakToken}`,
  'Content-Type': 'application/json'
});

this.http.get('http://localhost:8080/api/v1/patients/123', { headers });
```

### Complete Request Examples

#### Login (via Keycloak)
```http
POST http://localhost:8081/realms/humancare/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&
client_id=humancare-webapp&
username=patient@example.com&
password=password123
```

Response:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
  "expires_in": 300,
  "token_type": "Bearer"
}
```

#### Get Patient Profile
```http
GET http://localhost:8081/api/v1/patients/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

#### Create Notification (Admin only)
```http
POST http://localhost:8081/api/v1/notifications
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "recipientId": "123e4567-e89b-12d3-a456-426614174000",
  "type": "REMINDER",
  "channel": "IN_APP",
  "priority": "NORMAL",
  "title": "Medication Reminder",
  "message": "Time to take your medication"
}
```

### CORS Configuration

The Gateway is configured to accept requests from:
- `http://localhost:4200` (Angular web app)
- `http://localhost:4201` (Admin dashboard)
- `http://127.0.0.1:4200`
- `http://127.0.0.1:4201`

Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS

### Error Responses

| Status Code | Meaning | Example Response |
|-------------|---------|------------------|
| 401 | Unauthorized (no/invalid token) | `{ "error": "Unauthorized" }` |
| 403 | Forbidden (no permission) | `{ "error": "Access Denied" }` |
| 404 | Route not found | `{ "error": "Not Found" }` |
| 504 | Gateway Timeout | `{ "error": "Service Unavailable" }` |

---

## Authorization Matrix

| Endpoint Pattern | PATIENT | CAREGIVER | DOCTOR | ADMIN |
|------------------|---------|-----------|--------|-------|
| `/api/v1/patients/{userId}` | Own only | ❌ | ❌ | ✅ All |
| `/api/v1/patients/**` | Own only | Assigned | Assigned | ✅ All |
| `/api/v1/doctors/**` | ❌ | ❌ | Own | ✅ All |
| `/api/v1/caregivers/**` | ❌ | Own | ❌ | ✅ All |
| `/api/v1/admin/**` | ❌ | ❌ | ❌ | ✅ All |
| `/api/v1/schedules/**` | ❌ | ❌ | ❌ | ✅ All |
| `/api/alerts/**` | Own | Assigned | Assigned | ✅ All |
| `/api/behavior-logs/**` | ❌ | Assigned | Assigned | ✅ All |
| `/api/v1/notifications/**` | Own | ❌ | ❌ | ✅ All |
| `/api/v1/events/**` | ❌ | ✅ | ✅ | ✅ All |

> **Note:** Role checks are enforced by Gateway's SecurityConfig. Additional fine-grained authorization may be implemented in individual services.

---

## Security Configuration

### JWT Validation Flow
```
1. Request arrives at Gateway
2. Extract JWT from Authorization header
3. Validate signature with Keycloak public key
4. Extract roles from JWT claims
5. Check role against route permissions
6. Route to service (if authorized)
   Return 401/403 (if not authorized)
```

### Role Extraction
Roles are extracted from JWT `realm_access.roles` claim:
```json
{
  "realm_access": {
    "roles": ["PATIENT", "CAREGIVER"]
  }
}
```

Prefixed with `ROLE_` for Spring Security:
- `PATIENT` → `ROLE_PATIENT`
- `ADMIN` → `ROLE_ADMIN`

---

## Build

```bash
# Compile
mvn clean compile

# Run tests
mvn test

# Package
mvn clean package -DskipTests

# Build Docker image
docker build -t humancare/gateway:latest .
```

## Run

### Local Development
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The `local` profile routes to localhost services instead of Docker hostnames.

### Docker
```bash
docker run -p 8081:8080 \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://eureka-server:8761/eureka/ \
  humancare/gateway:latest
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Gateway port | 8080 (internal) |
| `SPRING_PROFILES_ACTIVE` | Active profile | `dev` |
| `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE` | Eureka server URL | `http://localhost:8761/eureka/` |
| `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI` | Keycloak realm URL | `http://localhost:8090/realms/humancare` |
| `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI` | Keycloak JWKS URL | `http://localhost:8090/realms/humancare/protocol/openid-connect/certs` |

---

## Route Configuration

Routes are defined in `config-server/config-repo/api-gateway.yml`:

### Routing Types

| Type | Format | Use Case | Example |
|------|--------|----------|---------|
| **Load Balanced** | `lb://SERVICE-NAME` | Services registered with Eureka | `lb://patient-service` |
| **External** | `http://host:port` | Keycloak, external APIs | `http://hc-keycloak:8080` |

### Java Services (with Eureka)
```yaml
# Services that register with Eureka use lb:// prefix
- id: notification-service
  uri: lb://notification-service  # Load balanced via Eureka
  predicates:
    - Path=/api/v1/notifications/**
```

### External Services (without Eureka)
```yaml
# External services use direct hostname
- id: keycloak
  uri: http://hc-keycloak:8080
  predicates:
    - Path=/realms/**
```

### Retry Filter
Automatically retries failed requests:
- **Retries:** 3 attempts
- **Statuses:** 502 (Bad Gateway), 503 (Service Unavailable)
- **Backoff:** Exponential

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                      │
│  (Angular Web App @ localhost:4200)                                 │
│  (Mobile Apps)                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                                    │
│                      (Port 8081)                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌───────────────┐    ┌───────────────┐    ┌───────────────┐      │
│   │   Security    │    │    Routes     │    │    Filters    │      │
│   │   Config      │───►│    (YAML)     │───►│  (Retry, Log) │      │
│   │               │    │               │    │               │      │
│   │ • JWT Valid.  │    │ • Path Match  │    │ • Correlation │      │
│   │ • Role Check  │    │ • Service Map │    │ • Rate Limit  │      │
│   │ • CORS        │    │ • Load Balance│    │ • Circuit Br. │      │
│   └───────────────┘    └───────────────┘    └───────────────┘      │
│                                                                      │
│   Keycloak Public Key ◄────────────────────────────────────────────│
│   (JWT Validation)                                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐        ┌──────────┐        ┌──────────────┐
   │ Identity │        │ Notification│     │   Safety     │
   │ Service  │        │ Service     │     │ Alert Engine │
   │ :8001    │        │ :8004       │     │ :8003        │
   └──────────┘        └─────────────┘     └──────────────┘
```

---

## Global Filters

### LoggingFilter
Adds correlation ID to every request for distributed tracing:
```
[550e8400-e29b-41d4-a716-446655440000] GET /api/v1/patients/123 - Started
[550e8400-e29b-41d4-a716-446655440000] GET /api/v1/patients/123 - Completed in 45ms - Status: 200
```

Correlation ID header: `X-Correlation-ID`

---

## Startup Order

Gateway should start **after** all backend services:

```
Startup Order:
1. Eureka Server (8761)
2. Config Server (8888)
3. RabbitMQ (5672)
4. Keycloak (8090)
5. All microservices (8001, 8003, 8004...)
6. Gateway Service (8080)  ◄── YOU ARE HERE
```

If Gateway starts before services, routes will fail until services register.

---

## Troubleshooting

### 401 Unauthorized
- Check JWT token is valid and not expired
- Verify token is in `Authorization: Bearer <token>` format
- Check Keycloak is accessible from Gateway

### 403 Forbidden
- Verify user has required role for the endpoint
- Check SecurityConfig role mappings
- Verify roles are in `realm_access.roles` claim

### 504 Gateway Timeout
- Target service may be down
- Check Eureka for service registration
- Verify network connectivity between containers

### CORS errors in browser
- Check allowed origins include your frontend URL
- Verify preflight OPTIONS requests are allowed
- Check `allowCredentials: true` is set

### Routes not working
- Check route definitions in config-server
- Verify Gateway fetched config from Config Server
- Check `/actuator/gateway/routes` for loaded routes

---

## Dependencies

- Spring Boot 3.2.2
- Spring Cloud Gateway 2023.0.0
- Spring Security OAuth2 Resource Server
- Spring Cloud Netflix Eureka Client
- Spring Cloud Config Client
- Spring Boot Actuator

## License

Copyright © 2025 AlzCare Platform
