# Routine Service

## Overview

The **Routine Service** is a core microservice in the HumanCare healthcare platform that manages patient routines and habits. It provides a RESTful API for creating, retrieving, updating, and deleting patient routines with configurable frequencies (daily, weekly, monthly).

This service enables caregivers and healthcare providers to establish structured routines for patients, track their habits, and manage recurring health-related activities such as medication schedules, exercise routines, meal times, and therapy sessions.

## Technology Stack

| Component | Version |
|-----------|---------|
| Java | 17 |
| Spring Boot | 3.2.2 |
| Spring Cloud | 2023.0.0 |
| H2 Database | 2.2.x (embedded/file) |
| Maven | 3.9+ |

### Spring Boot Starters

- `spring-boot-starter-web` - Web application support
- `spring-boot-starter-data-jpa` - JPA/Hibernate for data persistence
- `spring-boot-starter-validation` - Bean validation support
- `spring-boot-starter-actuator` - Health checks and metrics
- `spring-cloud-starter-netflix-eureka-client` - Service discovery registration
- `spring-cloud-starter-config` - External configuration support
- `spring-boot-starter-amqp` - RabbitMQ event publishing
- `spring-cloud-starter-openfeign` - Inter-service communication
- `com.h2database:h2` - H2 embedded database driver

## Service Configuration

| Property | Value |
|----------|-------|
| Application Name | `routine-service` |
| Port | `8089` |
| Eureka Registration | Yes (`lb://routine-service`) |
| Base API Path | `/api/v1/routines` |
| Database | H2 (embedded, persisted to `/data` in Docker) |

## Database Configuration

### Development (Local)

| Property | Value |
|----------|-------|
| Database Type | H2 (embedded) |
| JDBC URL | `jdbc:h2:mem:routine_db` or `jdbc:h2:file:./routine_db` |
| Database Name | `routine_db` |
| Username | `sa` |
| Password | (empty) |
| Console URL | `http://localhost:8089/h2-console` |

### Docker Environment

| Container | Value |
|-----------|-------|
| Container Name | `hc-routine-service` |
| External Port | `8089` |
| Database | H2 file-based (persisted to `/data/routine_db`) |
| Volume | `hc_routine_data` |

## Entity Model

### Routine Entity

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Primary Key, Auto-generated | Unique identifier for the routine |
| `patientId` | UUID | Not Null | Reference to the patient this routine belongs to |
| `title` | String (150) | Not Null | Short title/name of the routine |
| `description` | String (1000) | Nullable | Detailed description of the routine |
| `frequency` | RoutineFrequency | Not Null | How often the routine occurs (DAILY, WEEKLY, MONTHLY) |
| `timeOfDay` | LocalTime | Nullable | Preferred time for the routine (HH:mm format) |
| `isActive` | Boolean | Not Null, Default: `true` | Whether the routine is currently active |
| `createdAt` | Instant | Auto-generated | Timestamp when the routine was created |
| `updatedAt` | Instant | Auto-updated | Timestamp when the routine was last modified |

### Routine Frequency Enum

```java
public enum RoutineFrequency {
    DAILY,      // Routine occurs every day
    WEEKLY,     // Routine occurs every week
    MONTHLY     // Routine occurs every month
}
```

## API Endpoints

### Base URL

```
Direct:      http://localhost:8089/api/v1/routines
Via Gateway: http://localhost:8081/api/v1/routines
```

### Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/routines` | Get all routines (paginated) | Yes |
| GET | `/api/v1/routines/{id}` | Get routine by ID | Yes |
| GET | `/api/v1/routines/patient/{patientId}` | Get routines by patient ID | Yes |
| POST | `/api/v1/routines` | Create a new routine | Yes (CAREGIVER, DOCTOR, ADMIN) |
| PUT | `/api/v1/routines/{id}` | Update an existing routine | Yes (CAREGIVER, DOCTOR, ADMIN) |
| PATCH | `/api/v1/routines/{id}/complete` | Mark routine as completed | Yes |
| DELETE | `/api/v1/routines/{id}` | Delete a routine | Yes (ADMIN only) |

### Detailed API Documentation

#### 1. Get All Routines

Returns a paginated list of all routines in the system.

**Request:**
```http
GET /api/v1/routines?page=0&size=20&sort=createdAt,desc
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "patientId": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Morning Walk",
      "description": "30-minute walk around the neighborhood",
      "frequency": "DAILY",
      "timeOfDay": "07:00:00",
      "isActive": true,
      "createdAt": "2024-01-15T08:30:00Z",
      "updatedAt": "2024-01-20T10:15:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true
    }
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "number": 0,
  "size": 20,
  "numberOfElements": 1,
  "empty": false
}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 0 | Page number (0-indexed) |
| `size` | Integer | 20 | Number of items per page |
| `sort` | String | - | Sort field and direction (e.g., `createdAt,desc`) |

---

#### 2. Get Routine by ID

Retrieves a specific routine by its UUID.

**Request:**
```http
GET /api/v1/routines/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Blood Pressure Check",
  "description": "Measure blood pressure and record readings",
  "frequency": "DAILY",
  "timeOfDay": "08:00:00",
  "isActive": true,
  "createdAt": "2024-01-15T08:30:00Z",
  "updatedAt": "2024-01-20T10:15:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Routine not found: 550e8400-e29b-41d4-a716-446655440000",
  "details": null,
  "timestamp": "2024-01-20T12:00:00Z",
  "path": "/api/v1/routines/550e8400-e29b-41d4-a716-446655440000"
}
```

---

#### 3. Get Routines by Patient

Retrieves all routines for a specific patient with pagination support.

**Request:**
```http
GET /api/v1/routines/patient/550e8400-e29b-41d4-a716-446655440001?page=0&size=10
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "patientId": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Morning Medication",
      "description": "Take prescribed morning medications with breakfast",
      "frequency": "DAILY",
      "timeOfDay": "08:00:00",
      "isActive": true,
      "createdAt": "2024-01-15T08:30:00Z",
      "updatedAt": "2024-01-20T10:15:00Z"
    },
    {
      "id": "660f9511-f30c-52e5-b827-557766551111",
      "patientId": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Weekly Doctor Visit",
      "description": "Scheduled check-up with primary care physician",
      "frequency": "WEEKLY",
      "timeOfDay": "14:00:00",
      "isActive": true,
      "createdAt": "2024-01-10T09:00:00Z",
      "updatedAt": "2024-01-10T09:00:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 2,
  "totalPages": 1,
  "last": true,
  "first": true
}
```

---

#### 4. Create Routine

Creates a new routine for a patient.

**Request:**
```http
POST /api/v1/routines
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Evening Stretching",
  "description": "15 minutes of light stretching exercises before bed",
  "frequency": "DAILY",
  "timeOfDay": "21:00:00"
}
```

**Field Validation:**
| Field | Required | Max Length | Validation |
|-------|----------|------------|------------|
| `patientId` | Yes | - | Valid UUID |
| `title` | Yes | 150 | Not blank |
| `description` | No | 1000 | - |
| `frequency` | Yes | - | Must be: DAILY, WEEKLY, or MONTHLY |
| `timeOfDay` | No | - | Format: HH:mm:ss |

**Response (201 Created):**
```json
{
  "id": "770a0622-g41d-63f6-c938-668877662222",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Evening Stretching",
  "description": "15 minutes of light stretching exercises before bed",
  "frequency": "DAILY",
  "timeOfDay": "21:00:00",
  "isActive": true,
  "createdAt": "2024-01-25T14:30:00Z",
  "updatedAt": "2024-01-25T14:30:00Z"
}
```

**Error Response (400 Bad Request - Validation):**
```json
{
  "error": "VALIDATION_FAILED",
  "message": "Validation failed",
  "details": [
    "title: Title is required",
    "frequency: Frequency is required"
  ],
  "timestamp": "2024-01-25T14:30:00Z",
  "path": "/api/v1/routines"
}
```

---

#### 5. Update Routine

Updates an existing routine.

**Request:**
```http
PUT /api/v1/routines/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Morning Walk - Updated",
  "description": "45-minute walk with light jogging",
  "frequency": "DAILY",
  "timeOfDay": "06:30:00",
  "isActive": true
}
```

**Field Validation:**
| Field | Required | Max Length | Validation |
|-------|----------|------------|------------|
| `title` | Yes | 150 | Not blank |
| `description` | No | 1000 | - |
| `frequency` | Yes | - | Must be: DAILY, WEEKLY, or MONTHLY |
| `timeOfDay` | No | - | Format: HH:mm:ss |
| `isActive` | Yes | - | Boolean |

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Morning Walk - Updated",
  "description": "45-minute walk with light jogging",
  "frequency": "DAILY",
  "timeOfDay": "06:30:00",
  "isActive": true,
  "createdAt": "2024-01-15T08:30:00Z",
  "updatedAt": "2024-01-25T15:00:00Z"
}
```

---

#### 6. Complete Routine

Marks a routine as completed and publishes a `RoutineCompletedEvent` to RabbitMQ.

**Request:**
```http
PATCH /api/v1/routines/550e8400-e29b-41d4-a716-446655440000/complete
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Morning Walk",
  "description": "30-minute walk around the neighborhood",
  "frequency": "DAILY",
  "timeOfDay": "07:00:00",
  "isActive": true,
  "createdAt": "2024-01-15T08:30:00Z",
  "updatedAt": "2024-01-20T10:15:00Z"
}
```

---

#### 7. Delete Routine

Deletes a routine permanently.

**Request:**
```http
DELETE /api/v1/routines/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt_token>
```

**Response (204 No Content):**
```
(empty body)
```

**Note:** Only users with the `ADMIN` role can delete routines.

## Data Transfer Objects (DTOs)

### CreateRoutineRequest

```java
public record CreateRoutineRequest(
    @NotNull UUID patientId,
    @NotBlank @Size(max = 150) String title,
    @Size(max = 1000) String description,
    @NotNull RoutineFrequency frequency,
    LocalTime timeOfDay
) {}
```

### UpdateRoutineRequest

```java
public record UpdateRoutineRequest(
    @NotBlank @Size(max = 150) String title,
    @Size(max = 1000) String description,
    @NotNull RoutineFrequency frequency,
    LocalTime timeOfDay,
    @NotNull Boolean isActive
) {}
```

### RoutineResponse

```java
public record RoutineResponse(
    UUID id,
    UUID patientId,
    String title,
    String description,
    RoutineFrequency frequency,
    LocalTime timeOfDay,
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {}
```

## Exception Handling

The service implements a global exception handler that returns standardized error responses:

### ErrorResponse Structure

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": ["Additional details if available"],
  "timestamp": "2024-01-25T14:30:00Z",
  "path": "/api/v1/routines/invalid-id"
}
```

### Exception Types

| Exception | HTTP Status | Description |
|-----------|-------------|-------------|
| `RoutineNotFoundException` | 404 Not Found | Routine with given ID does not exist |
| `MethodArgumentNotValidException` | 400 Bad Request | Validation errors in request body |

## Inter-Service Communication

### OpenFeign Integration

The routine service uses **OpenFeign** to validate patient existence before creating a routine:

| Client | Target | Purpose |
|--------|--------|---------|
| `PatientClient` | `patient-service` | `GET /api/v1/patients/{patientId}` — validates the patient exists |

### RabbitMQ Event Publishing

When a routine is marked as completed (`PATCH /api/v1/routines/{id}/complete`), the service publishes a `RoutineCompletedEvent` to the `notifications.routine` queue.

## Build Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.9+
- H2 Database (embedded, no external DB needed)

### Local Build

```bash
# Navigate to service directory
cd services/routine-service

# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package application
mvn clean package

# Run application
mvn spring-boot:run
```

### Build for Production

```bash
# Create executable JAR with all dependencies
mvn clean package -DskipTests

# JAR file will be created at:
# target/routine-service-0.1.0.jar
```

## Docker Build and Run

### Using Docker Compose (Recommended)

```bash
# From project root - starts all services including routine-service
docker-compose up -d

# Check service status
docker-compose ps

# View routine service logs
docker-compose logs -f hc-routine-service
```

### Manual Docker Build

```bash
# Build Docker image
cd services/routine-service
docker build -t humancare/routine:latest .

# Run container (requires Eureka)
docker run -d \
  --name hc-routine-service \
  -p 8089:8089 \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://hc-eureka-server:8761/eureka/ \
  humancare/routine:latest
```

### Docker Image Details

- **Base Image:** `eclipse-temurin:17-jre-alpine`
- **Build Image:** `maven:3.9-eclipse-temurin-17-alpine`
- **Exposed Port:** 8089
- **Health Check:** `GET /actuator/health` every 30s

## Service Dependencies

| Service | Required | Purpose |
|---------|----------|---------|
| hc-eureka-server | Yes | Service discovery registration |
| hc-config-server | Yes | External configuration |
| hc-keycloak | Yes | OAuth2/JWT token validation |
| hc-api-gateway | No (but recommended) | API routing and auth |
| hc-rabbitmq | No | Publishes `RoutineCompletedEvent` |
| Patient Service | No | Validated via OpenFeign on create |

## Health and Monitoring

### Actuator Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /actuator/health` | Service health status |
| `GET /actuator/info` | Application information |

### Health Check Example

```bash
curl http://localhost:8089/actuator/health
```

**Response:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    },
    "diskSpace": {
      "status": "UP"
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

## Testing with cURL

### Authentication (via Keycloak)

```bash
# Get access token
TOKEN=$(curl -s -X POST http://localhost:8090/realms/humancare/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=humancare-webapp" \
  -d "username=<username>" \
  -d "password=<password>" \
  | jq -r '.access_token')
```

### API Calls

```bash
# Create routine
curl -X POST http://localhost:8089/api/v1/routines \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Daily Exercise",
    "description": "30 minutes of cardio",
    "frequency": "DAILY",
    "timeOfDay": "07:00:00"
  }'

# Get all routines
curl http://localhost:8089/api/v1/routines \
  -H "Authorization: Bearer $TOKEN"

# Get routines for patient
curl http://localhost:8089/api/v1/routines/patient/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer $TOKEN"

# Update routine
curl -X PUT http://localhost:8089/api/v1/routines/<routine-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description",
    "frequency": "WEEKLY",
    "timeOfDay": "08:00:00",
    "isActive": true
  }'

# Delete routine
curl -X DELETE http://localhost:8089/api/v1/routines/<routine-id> \
  -H "Authorization: Bearer $TOKEN"
```

## Project Structure

```
services/routine-service/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/humancare/routine/
│       │       ├── RoutineServiceApplication.java    # Spring Boot entry point
│       │       ├── controller/
│       │       │   └── RoutineController.java        # REST API endpoints
│       │       ├── dto/
│       │       │   ├── CreateRoutineRequest.java     # Create request DTO
│       │       │   ├── UpdateRoutineRequest.java     # Update request DTO
│       │       │   └── RoutineResponse.java          # Response DTO
│       │       ├── entity/
│       │       │   ├── Routine.java                  # JPA entity
│       │       │   └── RoutineFrequency.java         # Frequency enum
│       │       ├── exception/
│       │       │   ├── ErrorResponse.java            # Error response model
│       │       │   ├── GlobalExceptionHandler.java   # Exception handler
│       │       │   └── RoutineNotFoundException.java # Custom exception
│       │       ├── mapper/
│       │       │   └── RoutineMapper.java            # Entity/DTO mapping
│       │       ├── repository/
│       │       │   └── RoutineRepository.java        # JPA repository
│       │       └── service/
│       │           └── RoutineService.java           # Business logic
│       └── resources/
│           └── application.properties                # Bootstrap config
├── Dockerfile                                        # Docker build config
├── pom.xml                                          # Maven dependencies
└── README.md                                        # This file
```

## Keycloak Integration

The routine-service relies on the API Gateway for authentication. All endpoints require a valid JWT token issued by Keycloak for the `humancare` realm.

### Required Roles

| Endpoint | Required Role(s) |
|----------|------------------|
| GET endpoints | Any authenticated user |
| POST | CAREGIVER, DOCTOR, ADMIN |
| PUT | CAREGIVER, DOCTOR, ADMIN |
| DELETE | ADMIN only |

### Token Validation

Tokens are validated by the API Gateway before requests reach the routine-service. The service receives the authenticated principal through the Gateway.

## License

This service is part of the HumanCare Platform - a healthcare microservices project for educational purposes.
