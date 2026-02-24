# Current Task: Fix HumanCare Project Structure - COMPLETED ✅

**Completed:** 2026-02-22

## Summary of Changes

### 1. ✅ Removed identity-service
- Deleted entire `identity-service/` folder (was overlapping with Keycloak + patient-service responsibilities)
- Removed from `docker-compose.yml`
- Deleted `config-server/src/main/resources/config-repo/identity-service.yml`

### 2. ✅ Renamed gateway-service to api-gateway
- Renamed folder `gateway-service/` → `api-gateway/`
- Updated `docker-compose.yml` service name from `hc-gateway-service` to `hc-api-gateway`
- Updated `config-server/src/main/resources/config-repo/gateway-service.yml` → `api-gateway.yml`
- Fixed package declarations in Java files from `com.alzcare` to `com.humancare`
- Updated `application.yml` app name to `api-gateway`

### 3. ✅ Created patient-service (Node.js + Express)
Created `services/patient-service/` with:
- `package.json` - Express, PostgreSQL (pg), Sequelize, JWT dependencies
- `Dockerfile` - Multi-stage Node.js build
- `src/models/Patient.js` - Patient model (id, keycloakId, firstName, lastName, birthDate, caregiverId, doctorId, createdAt)
- `src/models/AuditLog.js` - Audit tracking model
- `src/controllers/patientController.js` - CRUD with audit logging
- `src/routes/patients.js` - REST endpoints
- `src/config/database.js` - Sequelize PostgreSQL config
- `src/app.js` - Express setup
- `server.js` - Entry point (port 8082)
- `.env.example` - Environment template

### 4. ✅ Updated docker-compose.yml
- Removed identity-service and its PostgreSQL database
- Added patient-service (hc-patient-service) on port 8082
- Added hc-postgres-patient database on port 5434
- Changed gateway references to api-gateway
- Updated Keycloak realm from `alzcare` to `humancare`

### 5. ✅ Updated Config Server
- Created `patient-service.yml` configuration
- Updated `api-gateway.yml` routes to point to patient-service
- Changed Keycloak realm references from `alzcare` to `humancare`

## Final Project Structure

```
humancare-platform/
├── infrastructure/
│   ├── eureka-server/          (Spring Boot) ✅
│   ├── config-server/          (Spring Boot) ✅
│   ├── api-gateway/            (Spring Cloud Gateway) ✅
│   └── docker-compose.yml      ✅
├── services/
│   └── patient-service/        (Node.js + Express + PostgreSQL) ✅
├── keycloak-service/           (Keycloak with realm config)
└── archive/
```

## API Endpoints (Patient Service)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/patients` | List all patients (paginated) |
| GET | `/patients/:id` | Get patient by ID (logs VIEW audit) |
| POST | `/patients` | Create new patient (logs CREATE audit) |
| PUT | `/patients/:id` | Update patient (logs UPDATE audit) |
| GET | `/patients/:id/audit` | Get patient audit logs |
| GET | `/health` | Health check |

## ✅ Keycloak Fixed

- ✅ Renamed `alzcare-realm.json` → `humancare-realm.json`
- ✅ Updated realm id, name, displayName to "HumanCare"
- ✅ Updated keycloak-service/docker-compose.yml (volume/network names)
- ✅ Updated keycloak-service documentation (AGENTS.md, README.md)

## Remaining alzcare References (Non-critical)

The following files still contain "alzcare" but are **documentation, Docker LABELs, or placeholder configs**:
- `REFERENCE.md`, `README.md`, `AGENTS.md` (root) - Documentation
- `api-gateway/Dockerfile`, `config-server/Dockerfile`, `eureka-server/Dockerfile` - LABEL descriptions
- `config-repo/notification-service.yml`, `config-repo/safety-alert-engine.yml` - Placeholder configs for future services
- `target/` folders - Build artifacts (will be regenerated on next build)

## Next Steps

1. **Build and test:**
   ```bash
   docker-compose up -d
   ```

2. **Create other services** as per original spec:
   - medication-service (Spring Boot + MySQL)
   - checkin-service (Spring Boot + H2)
   - appointment-service (Spring Boot + MySQL)
   - routine-service (Spring Boot + H2)
   - community-service (Spring Boot + MySQL)
   - notification-service (Spring Boot + H2 + RabbitMQ)

3. **Create Angular frontend** (`frontend/humancare-ui/`)

## Port Mapping

| Service | Port | Notes |
|---------|------|-------|
| Eureka | 8761 | Service Discovery |
| Config Server | 8888 | Centralized Config |
| API Gateway | 8081 | Entry point |
| Keycloak | 8090 | Auth/OIDC |
| RabbitMQ AMQP | 5673 | Messaging |
| RabbitMQ UI | 15673 | Management UI |
| Patient Service | 8082 | Node.js |
| PostgreSQL (Patient) | 5434 | Patient DB |
