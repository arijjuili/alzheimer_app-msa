# Patient Service

A Node.js microservice for managing patients in the HumanCare healthcare platform. This service provides patient CRUD operations, user registration with Keycloak integration, comprehensive audit logging, and role-based access control.

## Overview

The Patient Service is the **only Node.js service** in the HumanCare platform (all other services are Java/Spring Cloud). It manages patient records, handles user registration with role assignment (PATIENT, CAREGIVER, DOCTOR), and maintains audit logs for all patient-related activities.

### Key Features

- **Patient Management**: Full CRUD operations for patient records
- **User Registration**: Direct Keycloak integration for user creation with role assignment
- **Audit Logging**: Comprehensive logging of all VIEW, CREATE, UPDATE, and DELETE operations
- **Assignment Management**: Assign/unassign doctors and caregivers to patients
- **Health Checks**: Built-in health endpoint for monitoring
- **Eureka Integration**: Optional registration with Spring Cloud Eureka (falls back gracefully if unavailable)

---

## Technology Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| Node.js | >= 18.0.0 | Runtime environment |
| Express | ^4.19.2 | Web framework |
| PostgreSQL | 15 | Primary database |
| Sequelize | ^6.37.3 | ORM for database operations |
| Keycloak | - | Authentication & authorization |
| Eureka JS Client | ^4.5.0 | Service discovery (optional) |

### Dependencies

```json
{
  "axios": "^1.13.5",          // HTTP client for Keycloak API
  "cors": "^2.8.5",            // Cross-origin resource sharing
  "dotenv": "^16.4.5",         // Environment variable management
  "eureka-js-client": "^4.5.0", // Eureka service discovery
  "express": "^4.19.2",        // Web framework
  "helmet": "^7.1.0",          // Security headers
  "pg": "^8.12.0",             // PostgreSQL driver
  "pg-hstore": "^2.3.4",       // PostgreSQL hstore support
  "sequelize": "^6.37.3",      // ORM
  "uuid": "^10.0.0"            // UUID generation
}
```

---

## Service Configuration

| Property | Value |
|----------|-------|
| **Service Type** | Node.js + Express + PostgreSQL |
| **Port** | 8082 |
| **Container Name** | `hc-patient-service` |
| **Application Name** | `patient-service` |
| **Eureka Registered** | Optional (falls back if Eureka unavailable) |
| **Database** | PostgreSQL (`patient_db`) |
| **External DB Port** | 5434 (mapped to internal 5432) |

### Network Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  API Gateway    │────▶│  hc-patient-service  │────▶│  PostgreSQL     │
│  (port 8081)    │     │  (port 8082)         │     │  (port 5434)    │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Keycloak       │
                        │  (port 8090)    │
                        └─────────────────┘
```

---

## Database Schema

### Patient Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Auto-generated patient ID |
| `keycloak_id` | STRING | NOT NULL | Reference to Keycloak user ID |
| `first_name` | STRING | NOT NULL | Patient first name |
| `last_name` | STRING | NOT NULL | Patient last name |
| `birth_date` | DATE | NULLABLE | Date of birth |
| `caregiver_id` | UUID | NULLABLE, INDEX | Assigned caregiver reference |
| `doctor_id` | UUID | NULLABLE, INDEX | Assigned doctor reference |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

### Audit Log Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Auto-generated log ID |
| `patient_id` | UUID | NOT NULL, FK | Reference to patient |
| `action` | ENUM | NOT NULL | VIEW, UPDATE, DELETE, CREATE |
| `performed_by` | STRING | NOT NULL | User ID who performed action |
| `timestamp` | TIMESTAMP | DEFAULT NOW() | When action occurred |
| `details` | JSONB | NULLABLE | Additional context data |

### Relationships

- **Patient** has many **AuditLogs** (foreign key: `patient_id`)
- **AuditLog** belongs to **Patient**

---

## API Endpoints

### Health Check (Public)

#### GET `/health`

Health check endpoint for monitoring and load balancers.

**Response:**
```json
{
  "status": "UP",
  "service": "patient-service",
  "timestamp": "2026-02-23T20:00:00.000Z"
}
```

---

### Authentication Endpoints (Public)

#### POST `/auth/register`

Register a new user with Keycloak and assign a role.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "securePassword123",
  "role": "PATIENT"
}
```

**Valid Roles:** `PATIENT`, `CAREGIVER`, `DOCTOR`

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "660e8400-e29b-41d4-a716-446655440001",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "PATIENT"
}
```

**Note:** When registering with `PATIENT` role, a patient record is automatically created in the local database and the `patientId` is returned.

**Error Responses:**
- `400` - Missing required fields or invalid role
- `409` - User already exists (username or email taken)
- `500` - Registration failed

**Note:** The service automatically removes the default Keycloak role before assigning the selected role, ensuring users have ONLY their chosen role.

#### POST `/auth/sync-patients`

Sync existing PATIENT users from Keycloak to the local patient database. Useful for initial data migration or when Keycloak already has users.

**Response:**
```json
{
  "message": "Sync completed",
  "results": {
    "total": 8,
    "synced": 2,
    "skipped": 6,
    "errors": []
  }
}
```

#### GET `/auth/roles`

Get available registration roles.

**Response:**
```json
{
  "roles": [
    {
      "value": "PATIENT",
      "label": "Patient",
      "description": "I need healthcare services"
    },
    {
      "value": "CAREGIVER",
      "label": "Caregiver",
      "description": "I provide care to patients"
    },
    {
      "value": "DOCTOR",
      "label": "Doctor",
      "description": "I am a medical professional"
    }
  ]
}
```

---

### Patient Endpoints (Authenticated via Gateway)

All patient endpoints require authentication through the API Gateway. The gateway validates JWT tokens from Keycloak and forwards user information via headers (`X-User-Id`, `X-Service-Name`).

#### GET `/api/v1/patients`

Get all patients with pagination and optional filters.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page |
| `doctorId` | UUID | - | Filter by assigned doctor |
| `caregiverId` | UUID | - | Filter by assigned caregiver |

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "keycloakId": "keycloak-uuid-here",
      "firstName": "John",
      "lastName": "Doe",
      "birthDate": "1985-05-15",
      "caregiverId": null,
      "doctorId": "660e8400-e29b-41d4-a716-446655440001",
      "createdAt": "2026-02-23T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### GET `/api/v1/patients/unassigned`

Get patients with no doctor assigned.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page |

**Response:** Same format as GET `/patients`

#### GET `/api/v1/patients/by-doctor/:doctorId`

Get patients assigned to a specific doctor.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `doctorId` | UUID | Doctor's UUID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page |

**Response:** Same format as GET `/patients`

#### GET `/api/v1/patients/:id`

Get a specific patient by ID. **Automatically logs a VIEW action.**

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Patient UUID |

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "keycloakId": "keycloak-uuid-here",
  "firstName": "John",
  "lastName": "Doe",
  "birthDate": "1985-05-15",
  "caregiverId": null,
  "doctorId": "660e8400-e29b-41d4-a716-446655440001",
  "createdAt": "2026-02-23T10:00:00.000Z"
}
```

#### POST `/api/v1/patients`

Create a new patient. **Automatically logs a CREATE action.**

**Request Body:**
```json
{
  "keycloakId": "keycloak-uuid-from-registration",
  "firstName": "John",
  "lastName": "Doe",
  "birthDate": "1985-05-15",
  "caregiverId": null,
  "doctorId": null
}
```

**Required Fields:** `keycloakId`, `firstName`, `lastName`

**Success Response (201):** Returns created patient object

#### PUT `/api/v1/patients/:id`

Update a patient. **Automatically logs an UPDATE action.**

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Patient UUID |

**Request Body:** (all fields optional)
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "birthDate": "1990-08-20",
  "caregiverId": "770e8400-e29b-41d4-a716-446655440002",
  "doctorId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response:** Returns updated patient object

#### PUT `/api/v1/patients/:id/assign-doctor`

Assign a doctor to a patient. **Automatically logs an UPDATE action.**

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Patient UUID |

**Request Body:**
```json
{
  "doctorId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response:** Returns updated patient object

#### DELETE `/api/v1/patients/:id/assign-doctor`

Remove doctor assignment from a patient. **Automatically logs an UPDATE action.**

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Patient UUID |

**Response:** Returns updated patient object

#### PUT `/api/v1/patients/:id/assign-caregiver`

Assign a caregiver to a patient. **Automatically logs an UPDATE action.**

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Patient UUID |

**Request Body:**
```json
{
  "caregiverId": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Response:** Returns updated patient object

#### DELETE `/api/v1/patients/:id/assign-caregiver`

Remove caregiver assignment from a patient. **Automatically logs an UPDATE action.**

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Patient UUID |

**Response:** Returns updated patient object

#### GET `/api/v1/patients/:id/audit`

Get audit logs for a specific patient.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Patient UUID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |

**Response:**
```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "patientId": "550e8400-e29b-41d4-a716-446655440000",
      "action": "VIEW",
      "performedBy": "user-uuid-here",
      "timestamp": "2026-02-23T15:30:00.000Z",
      "details": {
        "source": "api-gateway"
      }
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "patientId": "550e8400-e29b-41d4-a716-446655440000",
      "action": "UPDATE",
      "performedBy": "admin-uuid-here",
      "timestamp": "2026-02-23T14:00:00.000Z",
      "details": {
        "type": "ASSIGN_DOCTOR",
        "oldDoctorId": null,
        "newDoctorId": "660e8400-e29b-41d4-a716-446655440001"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

## Required Keycloak Roles

The Patient Service itself does not enforce role-based access control - this is handled by the API Gateway. However, the typical role structure in the HumanCare platform is:

| Role | Patient Data Access | User Registration |
|------|--------------------|--------------------|
| **PATIENT** | Own data only | Self-register |
| **CAREGIVER** | Assigned patients | Self-register |
| **DOCTOR** | All patients (typically) | Self-register |
| **ADMIN** | All data | Can register others |

**Note:** Role enforcement is configured in the API Gateway using Spring Cloud Gateway security filters.

---

## Environment Variables

### Required Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `8082` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `DB_HOST` | PostgreSQL host | `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | Yes |
| `DB_NAME` | Database name | `patient_db` | Yes |
| `DB_USER` | Database username | `postgres` | Yes |
| `DB_PASSWORD` | Database password | `password` | Yes |

### Optional Variables (Eureka)

| Variable | Description | Default |
|----------|-------------|---------|
| `EUREKA_HOST` | Eureka server host | `localhost` |
| `EUREKA_PORT` | Eureka server port | `8761` |
| `HOSTNAME` | Service hostname | `localhost` |
| `SERVICE_NAME` | Service identifier | `patient-service` |

### Keycloak Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KEYCLOAK_URL` | Keycloak base URL | `http://localhost:8090` |
| `KEYCLOAK_REALM` | Keycloak realm name | `humancare` |
| `KEYCLOAK_ADMIN_USERNAME` | Keycloak admin username | `admin` |
| `KEYCLOAK_ADMIN_PASSWORD` | Keycloak admin password | `admin` |

### CORS Variable

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | Allowed CORS origin | `*` (all origins) |

### Example `.env` File

```bash
# Server Configuration
PORT=8082
NODE_ENV=development
SERVICE_NAME=patient-service

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=patient_db
DB_USER=postgres
DB_PASSWORD=password

# Eureka Configuration (optional)
EUREKA_HOST=localhost
EUREKA_PORT=8761
HOSTNAME=localhost

# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8090
KEYCLOAK_REALM=humancare
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# CORS Configuration
CORS_ORIGIN=*
```

---

## Build Instructions

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL 15+
- npm or yarn

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

4. **Verify the service is running:**
   ```bash
   curl http://localhost:8082/health
   ```

### Available npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node server.js` | Start production server |
| `dev` | `node --watch server.js` | Start with file watching (Node 18+) |

---

## Docker Instructions

### Build Docker Image

```bash
# From the project root
docker build -t humancare/patient:latest ./services/patient-service

# Or from the service directory
cd services/patient-service
docker build -t humancare/patient:latest .
```

### Run Docker Container

```bash
# With environment variables file
docker run -d \
  --name hc-patient-service \
  -p 8082:8082 \
  --env-file .env \
  humancare/patient:latest

# With inline environment variables
docker run -d \
  --name hc-patient-service \
  -p 8082:8082 \
  -e DB_HOST=hc-postgres-patient \
  -e DB_PORT=5432 \
  -e DB_NAME=patient_db \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e KEYCLOAK_URL=http://hc-keycloak:8080 \
  humancare/patient:latest
```

### Using Docker Compose (Recommended)

The service is configured in the root `docker-compose.yml`:

```bash
# Start all services
docker-compose up -d

# Start only patient service and its dependencies
docker-compose up -d hc-patient-service hc-postgres-patient

# View logs
docker-compose logs -f hc-patient-service

# Check status
docker-compose ps
```

### Docker Health Check

The Dockerfile includes a health check that verifies the service is responding:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8082/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

---

## Service Dependencies

### Required Dependencies

| Service | Purpose | Connection |
|---------|---------|------------|
| **PostgreSQL** | Data persistence | Direct TCP connection |

### Optional Dependencies

| Service | Purpose | Connection | Fallback Behavior |
|---------|---------|------------|-------------------|
| **Eureka Server** | Service discovery | HTTP REST | Continues without registration |
| **Keycloak** | User registration | HTTP REST | Registration fails with error |

### Dependency Startup Order (Docker Compose)

1. `hc-postgres-patient` (must be healthy)
2. `hc-eureka-server` (must be healthy)
3. `hc-patient-service`

---

## Architecture Notes

### Why Node.js?

This is the **only Node.js service** in the HumanCare platform. It was built with Node.js to:

- Demonstrate polyglot microservices architecture
- Leverage JavaScript/TypeScript ecosystem for rapid development
- Provide a lightweight alternative to Java services

### Eureka Integration

Unlike Java services that require Eureka for service discovery, this Node.js service:

- **Can register with Eureka** (optional) for compatibility with the Spring Cloud ecosystem
- **Falls back gracefully** if Eureka is unavailable - the service continues to function
- **Uses direct DNS** for database connections (not Eureka-based)

### API Gateway Routing

The API Gateway routes requests to this service using direct DNS (not load-balanced Eureka discovery):

```yaml
# Gateway route configuration
- id: patient-service
  uri: http://hc-patient-service:8082  # Direct DNS, not lb://
  predicates:
    - Path=/api/v1/patients/**
```

---

## Testing

### Health Check

```bash
curl http://localhost:8082/health
```

### Create a Patient

```bash
curl -X POST http://localhost:8082/api/v1/patients \
  -H "Content-Type: application/json" \
  -H "X-User-Id: admin-user-id" \
  -d '{
    "keycloakId": "keycloak-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "birthDate": "1985-05-15"
  }'
```

### Register a User

```bash
curl -X POST http://localhost:8082/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "password123",
    "role": "PATIENT"
  }'
```

---

## Troubleshooting

### Database Connection Issues

```
Error: Unable to start server
```
- Verify PostgreSQL is running
- Check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` in `.env`
- Ensure database `patient_db` exists

### Eureka Registration Fails

```
[Eureka] Registration failed: Error: connect ECONNREFUSED
```
- This is non-fatal; the service continues without Eureka
- To enable registration, ensure Eureka is running at `EUREKA_HOST:EUREKA_PORT`

### Keycloak Registration Fails

```
Registration failed: Failed to authenticate with Keycloak
```
- Verify Keycloak is running
- Check `KEYCLOAK_URL`, `KEYCLOAK_ADMIN_USERNAME`, `KEYCLOAK_ADMIN_PASSWORD`
- Ensure the `humancare` realm exists in Keycloak

---

## Contributing

When modifying this service:

1. Follow the existing code structure (controllers, routes, models)
2. Add audit logging for any new patient-related operations
3. Update this README for any new endpoints or environment variables
4. Test both with and without Eureka connectivity
5. Ensure graceful degradation when dependencies are unavailable

---

## License

This is a school project for educational purposes.
