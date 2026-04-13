# Medication Service

## Overview

The Medication Service is a core microservice in the HumanCare healthcare platform, responsible for managing patient medication plans and tracking medication intake schedules. It provides comprehensive APIs for healthcare providers to create medication prescriptions, schedule dosages, and track patient adherence.

This service enables:
- **Medication Plan Management**: Create and manage patient medication prescriptions with dosages, frequencies, and schedules
- **Intake Tracking**: Schedule and track individual medication doses with status updates (taken, missed, skipped)
- **Adherence Monitoring**: Monitor patient medication compliance through intake status tracking

## Technology Stack

| Component | Version |
|-----------|---------|
| Java | 17 |
| Spring Boot | 3.2.0 |
| Spring Cloud | 2023.0.0 |
| MySQL | 8.0 |
| Maven | 3.9+ |

### Dependencies

- **Spring Boot Starter Web** - REST API framework
- **Spring Boot Starter Data JPA** - Data persistence with Hibernate
- **Spring Boot Starter Validation** - Bean validation (JSR-380)
- **MySQL Connector/J** - MySQL database driver
- **H2 Database** - In-memory database for development/testing
- **Lombok** - Boilerplate code reduction
- **Spring Cloud Starter Netflix Eureka Client** - Service discovery
- **Spring Cloud Starter Config** - External configuration support
- **Spring Cloud Starter OpenFeign** - Inter-service communication
- **Spring Boot Starter AMQP** - RabbitMQ event publishing
- **Spring Boot Starter Actuator** - Health checks and monitoring

## Service Configuration

| Property | Value |
|----------|-------|
| Application Name | `medication-service` |
| Service Port | `8083` |
| Eureka Registered | Yes |
| Container Name | `hc-medication-service` |
| Database | MySQL `medication_db` |
| External DB Port | `3308` (mapped to internal 3306) |
| Flyway Migrations | Yes |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway (8081)                           │
│                      /api/medications/**                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Medication Service (8083) - Eureka Client          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   REST API   │  │   Service    │  │   Data Access Layer  │  │
│  │  Controllers │◄─┤    Layer     │◄─┤   (JPA/Hibernate)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│          │                  │                  │               │
│          ▼                  ▼                  ▼               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MySQL Database                         │  │
│  │         medication_plans | medication_intakes             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Model

### Entities

#### MedicationPlan

Represents a patient's medication prescription with dosing schedule.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `UUID` | PK, Auto-generated | Unique identifier |
| `patientId` | `UUID` | Not null, Indexed | Patient UUID reference |
| `medicationName` | `String` | Not null | Name of the medication |
| `dosage` | `String` | Not null | Dosage amount (e.g., "500mg") |
| `form` | `MedicationForm` | Not null, Enum | Medication form (TABLET, SYRUP, etc.) |
| `frequencyPerDay` | `Integer` | Not null, Min=1 | Times per day |
| `startDate` | `LocalDate` | Not null | Treatment start date |
| `endDate` | `LocalDate` | Nullable | Treatment end date (optional) |
| `instructions` | `String` | Nullable | Special instructions |
| `active` | `Boolean` | Not null, Default=true | Plan active status |
| `createdAt` | `LocalDateTime` | Not null, Auto-set | Creation timestamp |
| `updatedAt` | `LocalDateTime` | Auto-set | Last update timestamp |
| `intakes` | `List<MedicationIntake>` | One-to-Many | Associated intake records |

#### MedicationIntake

Represents a single scheduled medication dose with tracking status.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `UUID` | PK, Auto-generated | Unique identifier |
| `plan` | `MedicationPlan` | Not null, FK | Parent medication plan |
| `scheduledAt` | `LocalDateTime` | Not null, Indexed | Scheduled intake time |
| `takenAt` | `LocalDateTime` | Nullable | Actual intake time |
| `status` | `IntakeStatus` | Not null, Default=SCHEDULED | Current status |
| `notes` | `String` | Nullable | Additional notes |

### Enums

#### MedicationForm

```java
public enum MedicationForm {
    TABLET,      // Solid oral medication
    SYRUP,       // Liquid oral medication
    INJECTION,   // Injectable medication
    DROPS,       // Eye/ear drops
    OTHER        // Other forms (creams, patches, etc.)
}
```

#### IntakeStatus

```java
public enum IntakeStatus {
    SCHEDULED,   // Intake scheduled but not yet taken
    TAKEN,       // Intake completed successfully
    MISSED,      // Intake missed (past scheduled time)
    SKIPPED      // Intake intentionally skipped
}
```

## Database Schema

### Tables

#### medication_plans

```sql
CREATE TABLE medication_plans (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    form ENUM('TABLET', 'SYRUP', 'INJECTION', 'DROPS', 'OTHER') NOT NULL,
    frequency_per_day INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    
    INDEX idx_patient_id (patient_id),
    INDEX idx_active (active),
    INDEX idx_patient_active (patient_id, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### medication_intakes

```sql
CREATE TABLE medication_intakes (
    id VARCHAR(36) PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL,
    scheduled_at DATETIME NOT NULL,
    taken_at DATETIME,
    status ENUM('SCHEDULED', 'TAKEN', 'MISSED', 'SKIPPED') NOT NULL,
    notes TEXT,
    
    CONSTRAINT fk_intake_plan 
        FOREIGN KEY (plan_id) 
        REFERENCES medication_plans(id) 
        ON DELETE CASCADE,
    
    INDEX idx_plan_id (plan_id),
    INDEX idx_status (status),
    INDEX idx_plan_status (plan_id, status),
    INDEX idx_scheduled_at (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

- **One-to-Many**: `MedicationPlan` → `MedicationIntake` (cascade delete enabled)
- **Foreign Key**: `medication_intakes.plan_id` references `medication_plans.id`

## API Endpoints

### Base URL

```
http://localhost:8083/api/medications
```

> **Note**: When accessing through the API Gateway, use `http://localhost:8081/api/medications`

---

### Medication Plans

#### Create a Medication Plan

```http
POST /api/medications/plans
Content-Type: application/json
```

**Request Body:**

```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "medicationName": "Amoxicillin",
  "dosage": "500mg",
  "form": "TABLET",
  "frequencyPerDay": 3,
  "startDate": "2024-01-15",
  "endDate": "2024-01-22",
  "instructions": "Take with food. Do not skip doses.",
  "active": true
}
```

**Required Fields:**
- `patientId` (UUID)
- `medicationName` (String, not blank)
- `dosage` (String, not blank)
- `form` (Enum: TABLET, SYRUP, INJECTION, DROPS, OTHER)
- `frequencyPerDay` (Integer, min=1)
- `startDate` (ISO Date: YYYY-MM-DD)

**Optional Fields:**
- `endDate` (ISO Date)
- `instructions` (String)
- `active` (Boolean, default: true)

**Response (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "medicationName": "Amoxicillin",
  "dosage": "500mg",
  "form": "TABLET",
  "frequencyPerDay": 3,
  "startDate": "2024-01-15",
  "endDate": "2024-01-22",
  "instructions": "Take with food. Do not skip doses.",
  "active": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

---

#### Get All Medication Plans

```http
GET /api/medications/plans
```

**Response (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "medicationName": "Amoxicillin",
    "dosage": "500mg",
    "form": "TABLET",
    "frequencyPerDay": 3,
    "startDate": "2024-01-15",
    "endDate": "2024-01-22",
    "instructions": "Take with food. Do not skip doses.",
    "active": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

---

#### Get Medication Plan by ID

```http
GET /api/medications/plans/{id}
```

**Path Parameters:**
- `id` (UUID) - Plan ID

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "medicationName": "Amoxicillin",
  "dosage": "500mg",
  "form": "TABLET",
  "frequencyPerDay": 3,
  "startDate": "2024-01-15",
  "endDate": "2024-01-22",
  "instructions": "Take with food. Do not skip doses.",
  "active": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Error Response (404 Not Found):**

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "NOT_FOUND",
  "message": "MedicationPlan not found with id : '999'",
  "path": "/api/medications/plans/999"
}
```

---

#### Get Plans by Patient ID

```http
GET /api/medications/plans/by-patient/{patientId}
```

**Path Parameters:**
- `patientId` (UUID) - Patient UUID

**Response (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "medicationName": "Amoxicillin",
    "dosage": "500mg",
    "form": "TABLET",
    "frequencyPerDay": 3,
    "startDate": "2024-01-15",
    "endDate": "2024-01-22",
    "instructions": "Take with food. Do not skip doses.",
    "active": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "medicationName": "Vitamin D",
    "dosage": "1000 IU",
    "form": "TABLET",
    "frequencyPerDay": 1,
    "startDate": "2024-01-01",
    "endDate": null,
    "instructions": "Take in the morning",
    "active": true,
    "createdAt": "2024-01-01T08:00:00",
    "updatedAt": "2024-01-01T08:00:00"
  }
]
```

---

#### Get Active Plans by Patient ID

```http
GET /api/medications/plans/by-patient/{patientId}/active
```

**Path Parameters:**
- `patientId` (UUID) - Patient UUID

**Response (200 OK):** Array of active medication plans (same format as above)

---

#### Update a Medication Plan

```http
PUT /api/medications/plans/{id}
Content-Type: application/json
```

**Path Parameters:**
- `id` (UUID) - Plan ID

**Request Body:** (Same as Create)

```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "medicationName": "Amoxicillin",
  "dosage": "750mg",
  "form": "TABLET",
  "frequencyPerDay": 2,
  "startDate": "2024-01-15",
  "endDate": "2024-01-25",
  "instructions": "Updated instructions",
  "active": true
}
```

**Response (200 OK):** Updated medication plan

---

#### Delete a Medication Plan

```http
DELETE /api/medications/plans/{id}
```

**Path Parameters:**
- `id` (UUID) - Plan ID

**Response (204 No Content)**

> **Note**: Deleting a plan will cascade delete all associated intake records.

---

### Medication Intakes

#### Create an Intake for a Plan

```http
POST /api/medications/plans/{planId}/intakes
Content-Type: application/json
```

**Path Parameters:**
- `planId` (UUID) - Parent medication plan ID

**Request Body:**

```json
{
  "scheduledAt": "2024-01-15T08:00:00",
  "status": "SCHEDULED",
  "notes": "Morning dose"
}
```

**Required Fields:**
- `scheduledAt` (ISO DateTime: YYYY-MM-DDTHH:mm:ss)

**Optional Fields:**
- `status` (Enum, default: SCHEDULED)
- `takenAt` (ISO DateTime) - Only set when status is TAKEN
- `notes` (String)

**Response (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "scheduledAt": "2024-01-15T08:00:00",
  "takenAt": null,
  "status": "SCHEDULED",
  "notes": "Morning dose"
}
```

---

#### Get All Intakes for a Plan

```http
GET /api/medications/plans/{planId}/intakes
```

**Path Parameters:**
- `planId` (UUID) - Plan ID

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "scheduledAt": "2024-01-15T08:00:00",
    "takenAt": null,
    "status": "SCHEDULED",
    "notes": "Morning dose"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "scheduledAt": "2024-01-15T14:00:00",
    "takenAt": null,
    "status": "SCHEDULED",
    "notes": "Afternoon dose"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "scheduledAt": "2024-01-15T20:00:00",
    "takenAt": null,
    "status": "SCHEDULED",
    "notes": "Evening dose"
  }
]
```

---

#### Get Intakes by Plan and Status

```http
GET /api/medications/plans/{planId}/intakes?status={status}
```

**Path Parameters:**
- `planId` (UUID) - Plan ID

**Query Parameters:**
- `status` (Enum) - Filter by status: SCHEDULED, TAKEN, MISSED, SKIPPED

**Example:**

```http
GET /api/medications/plans/550e8400-e29b-41d4-a716-446655440000/intakes?status=TAKEN
```

**Response (200 OK):** Array of filtered intake records

---

#### Get All Intakes

```http
GET /api/medications/intakes
```

**Response (200 OK):** Array of all intake records across all plans

---

#### Get Intake by ID

```http
GET /api/medications/intakes/{id}
```

**Path Parameters:**
- `id` (UUID) - Intake ID

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "scheduledAt": "2024-01-15T08:00:00",
  "takenAt": "2024-01-15T08:05:00",
  "status": "TAKEN",
  "notes": "Taken with breakfast"
}
```

---

#### Update an Intake

```http
PUT /api/medications/intakes/{id}
Content-Type: application/json
```

**Path Parameters:**
- `id` (UUID) - Intake ID

**Request Body:**

```json
{
  "scheduledAt": "2024-01-15T08:00:00",
  "takenAt": "2024-01-15T08:05:00",
  "status": "TAKEN",
  "notes": "Updated notes"
}
```

**Response (200 OK):** Updated intake record

---

#### Delete an Intake

```http
DELETE /api/medications/intakes/{id}
```

**Path Parameters:**
- `id` (UUID) - Intake ID

**Response (204 No Content)**

---

### Status Management Endpoints

#### Mark Intake as Taken

```http
PATCH /api/medications/intakes/{id}/take
Content-Type: application/json
```

**Path Parameters:**
- `id` (UUID) - Intake ID

**Request Body** (Optional):

```json
{
  "notes": "Taken with water"
}
```

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "scheduledAt": "2024-01-15T08:00:00",
  "takenAt": "2024-01-15T08:15:30",
  "status": "TAKEN",
  "notes": "Taken with water"
}
```

> **Note**: The `takenAt` field is automatically set to the current timestamp.

---

#### Mark Intake as Missed

```http
PATCH /api/medications/intakes/{id}/miss
Content-Type: application/json
```

**Path Parameters:**
- `id` (UUID) - Intake ID

**Request Body** (Optional):

```json
{
  "notes": "Patient was unavailable"
}
```

**Response (200 OK):** Updated intake with status `MISSED`

---

#### Mark Intake as Skipped

```http
PATCH /api/medications/intakes/{id}/skip
Content-Type: application/json
```

**Path Parameters:**
- `id` (UUID) - Intake ID

**Request Body** (Optional):

```json
{
  "notes": "Skipped on doctor's advice"
}
```

**Response (200 OK):** Updated intake with status `SKIPPED`

---

## Error Handling

The service returns standardized error responses:

### Error Response Format

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed: {dosage=Dosage is required}",
  "path": "/api/medications/plans",
  "validationErrors": {
    "dosage": "Dosage is required",
    "medicationName": "Medication name is required"
  }
}
```

### HTTP Status Codes

| Status Code | Description | Scenario |
|-------------|-------------|----------|
| `200 OK` | Success | GET, PUT, PATCH requests successful |
| `201 Created` | Resource created | POST requests successful |
| `204 No Content` | No response body | DELETE requests successful |
| `400 Bad Request` | Validation error | Invalid request body or parameters |
| `404 Not Found` | Resource not found | Entity with given ID doesn't exist |
| `500 Internal Server Error` | Server error | Unexpected errors |

### Exception Types

- **ResourceNotFoundException** (404) - When a requested resource doesn't exist
- **BadRequestException** (400) - For invalid business logic requests
- **MethodArgumentNotValidException** (400) - For @Valid validation failures
- **ConstraintViolationException** (400) - For constraint violations

---

## Authentication & Authorization

This service integrates with the HumanCare Keycloak server for authentication and authorization.

### Keycloak Configuration

| Property | Value |
|----------|-------|
| Realm | `humancare` |
| Keycloak URL | `http://localhost:8090` |
| Issuer URI | `http://hc-keycloak:8080/realms/humancare` |

### Roles

The HumanCare platform uses the following roles:

| Role | Description | Medication Service Access |
|------|-------------|---------------------------|
| `PATIENT` | Healthcare recipient | View own plans/intakes only |
| `CAREGIVER` | Patient caregiver | View assigned patients' data |
| `DOCTOR` | Medical professional | Full CRUD on all patients |
| `ADMIN` | System administrator | Full access |

> **Note**: Role-based access control is enforced at the API Gateway level. The medication service itself focuses on business logic.

---

## Build Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.9+
- MySQL 8.0 (for production)
- Docker & Docker Compose (for containerized deployment)

### Local Development Build

```bash
# Navigate to service directory
cd services/medication

# Compile the project
mvn clean compile

# Run tests
mvn test

# Package the application
mvn clean package -DskipTests

# Run the application (with H2 database for development)
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Build JAR

```bash
# Build production JAR
mvn clean package -DskipTests

# The JAR will be available at:
# target/medication-0.0.1-SNAPSHOT.jar
```

---

## Docker Instructions

### Build Docker Image

```bash
# Build the Docker image
cd services/medication
docker build -t humancare/medication:latest .
```

### Run with Docker Compose (Recommended)

The medication service is configured in the root `docker-compose.yml`:

```bash
# Start all services
docker-compose up -d

# Start only medication service and its dependencies
docker-compose up -d hc-mysql-medication hc-medication-service

# View logs
docker-compose logs -f hc-medication-service

# Check service status
docker-compose ps
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Application port | `8083` |
| `SPRING_APPLICATION_NAME` | Eureka service name | `medication-service` |
| `SPRING_PROFILES_ACTIVE` | Active profile | `docker` |
| `SPRING_CONFIG_IMPORT` | Config server URL | `optional:configserver:http://config:config123@hc-config-server:8888` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `root` |
| `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE` | Eureka server URL | `http://hc-eureka-server:8761/eureka/` |
| `JAVA_OPTS` | JVM options | `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0` |

### Manual Docker Run

```bash
# Run the container manually
docker run -d \
  --name hc-medication-service \
  -p 8083:8083 \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=root \
  -e EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://hc-eureka-server:8761/eureka/ \
  humancare/medication:latest
```

---

## Inter-Service Communication

### OpenFeign Integration

The medication service uses **OpenFeign** to validate patient existence before creating a medication plan:

| Client | Target | Purpose |
|--------|--------|---------|
| `PatientClient` | `patient-service` | `GET /api/v1/patients/{patientId}` — validates the patient exists |

### RabbitMQ Event Publishing

When a medication intake is marked as taken or missed, the service publishes events to RabbitMQ:

| Event | Queue | Consumer |
|-------|-------|----------|
| `MedicationTakenEvent` | `notifications.medication.taken` | Notification Service |
| `MedicationMissedEvent` | `notifications.medication.missed` | Notification Service |

## Service Dependencies

The medication service depends on the following services:

```
┌─────────────────────────────────────────────────────────────┐
│                  hc-medication-service                       │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│hc-mysql-      │   │ hc-eureka-    │   │ hc-config-    │
│medication     │   │ server        │   │ server        │
│(Port 3308)    │   │(Port 8761)    │   │(Port 8888)    │
└───────────────┘   └───────────────┘   └───────────────┘
```

| Service | Purpose | Required |
|---------|---------|----------|
| `hc-mysql-medication` | Persistent data storage | Yes |
| `hc-eureka-server` | Service discovery and registration | Yes |
| `hc-config-server` | External configuration | Optional (config import is optional) |
| `hc-rabbitmq` | Event publishing | No |
| `patient-service` | Patient validation via Feign | No |

---

## Configuration Profiles

### Default Profile (`application.yml`)

- Connects to Config Server
- No embedded database

### Development Profile (`application-dev.yml`)

- Uses H2 in-memory database
- H2 Console enabled at `/h2-console`
- SQL logging enabled
- Auto DDL: `create-drop`

### Docker Profile

- Uses MySQL database
- Connects to Config Server at `hc-config-server:8888`
- Eureka registration enabled
- Managed by root docker-compose.yml

---

## Health Checks & Monitoring

### Actuator Endpoints

The service exposes Spring Boot Actuator endpoints:

| Endpoint | Description | Access |
|----------|-------------|--------|
| `/actuator/health` | Health status | Public |
| `/actuator/info` | Application info | Public |
| `/actuator/metrics` | Metrics data | Internal |

### Health Check Example

```bash
curl http://localhost:8083/actuator/health
```

**Response:**

```json
{
  "status": "UP"
}
```

### Docker Health Check

The Dockerfile includes a health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8083/actuator/health || exit 1
```

---

## Testing

### Unit Tests

```bash
# Run all unit tests
mvn test

# Run with coverage
mvn test jacoco:report
```

### Integration Testing with H2

For integration testing, the dev profile uses H2 database:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Access H2 Console at: `http://localhost:8083/h2-console`

- JDBC URL: `jdbc:h2:mem:medication_db`
- Username: `sa`
- Password: (empty)

### API Testing Examples

```bash
# Create a medication plan
curl -X POST http://localhost:8083/api/medications/plans \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "medicationName": "Aspirin",
    "dosage": "100mg",
    "form": "TABLET",
    "frequencyPerDay": 1,
    "startDate": "2024-01-15",
    "instructions": "Take with food"
  }'

# Create an intake for the plan
curl -X POST http://localhost:8083/api/medications/plans/550e8400-e29b-41d4-a716-446655440000/intakes \
  -H "Content-Type: application/json" \
  -d '{
    "scheduledAt": "2024-01-15T08:00:00",
    "notes": "Morning dose"
  }'

# Mark intake as taken
curl -X PATCH http://localhost:8083/api/medications/intakes/550e8400-e29b-41d4-a716-446655440005/take \
  -H "Content-Type: application/json" \
  -d '{"notes": "Taken with breakfast"}'

# Get all plans for a patient
curl http://localhost:8083/api/medications/plans/by-patient/550e8400-e29b-41d4-a716-446655440001

# Get intakes by status
curl "http://localhost:8083/api/medications/plans/550e8400-e29b-41d4-a716-446655440000/intakes?status=TAKEN"
```

---

## Project Structure

```
services/medication/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── medication/
│   │   │       └── medication/
│   │   │           ├── MedicationApplication.java
│   │   │           ├── controller/
│   │   │           │   ├── MedicationIntakeController.java
│   │   │           │   └── MedicationPlanController.java
│   │   │           ├── entity/
│   │   │           │   ├── MedicationIntake.java
│   │   │           │   ├── MedicationPlan.java
│   │   │           │   └── enums/
│   │   │           │       ├── IntakeStatus.java
│   │   │           │       └── MedicationForm.java
│   │   │           ├── exception/
│   │   │           │   ├── BadRequestException.java
│   │   │           │   └── ResourceNotFoundException.java
│   │   │           ├── handler/
│   │   │           │   └── GlobalExceptionHandler.java
│   │   │           ├── repository/
│   │   │           │   ├── MedicationIntakeRepository.java
│   │   │           │   └── MedicationPlanRepository.java
│   │   │           └── service/
│   │   │               ├── MedicationIntakeService.java
│   │   │               └── MedicationPlanService.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       └── db/
│   │           └── migration/
│   │               └── V1__init.sql
│   └── test/
│       └── java/
│           └── medication/
│               └── medication/
│                   └── MedicationApplicationTests.java
├── Dockerfile
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

---

## Troubleshooting

### Common Issues

#### Database Connection Failed

**Symptom:** Service fails to start with database connection error.

**Solution:**
```bash
# Check if MySQL container is running
docker-compose ps hc-mysql-medication

# Check MySQL logs
docker-compose logs hc-mysql-medication

# Restart MySQL
docker-compose restart hc-mysql-medication
```

#### Eureka Registration Failed

**Symptom:** Service starts but is not visible in Eureka dashboard.

**Solution:**
```bash
# Check Eureka server
curl http://localhost:8761/eureka/apps

# Restart medication service
docker-compose restart hc-medication-service
```

#### Port Already in Use

**Symptom:** `BindException: Address already in use` on port 8083.

**Solution:**
```bash
# Find process using port 8083
lsof -i :8083

# Kill the process or change port in application-dev.yml
```

---

## License

This is a school project for educational purposes as part of the HumanCare healthcare platform.

---

## Contact & Support

For issues or questions regarding the Medication Service:

1. Check the main project documentation in `README.md` (root)
2. Review `REFERENCE.md` for detailed troubleshooting
3. Check service logs: `docker-compose logs -f hc-medication-service`
