# Daily Check-in Service

## Overview

The **Daily Check-in Service** is a core microservice in the HumanCare healthcare platform that manages patient daily check-ins and symptom tracking. It provides a RESTful API for creating, retrieving, updating, and deleting daily wellness check-ins with associated symptom reports.

This service enables patients to record their daily mood, energy levels, sleep quality, and any symptoms they may be experiencing. Healthcare providers can then access this data to monitor patient wellness trends and identify potential health issues early.

## Technology Stack

| Component | Version |
|-----------|---------|
| Java | 17 |
| Spring Boot | 3.2.2 |
| Spring Cloud | 2023.0.0 |
| H2 Database | 2.2.x (embedded) |
| Maven | 3.9+ |

### Spring Boot Starters

- `spring-boot-starter-web` - Web application support
- `spring-boot-starter-data-jpa` - JPA/Hibernate for data persistence
- `spring-boot-starter-validation` - Bean validation support
- `spring-boot-starter-actuator` - Health checks and metrics
- `spring-cloud-starter-netflix-eureka-client` - Service discovery registration
- `spring-cloud-starter-config` - External configuration support
- `com.h2database:h2` - H2 embedded database driver

## Service Configuration

| Property | Value |
|----------|-------|
| Application Name | `daily-checkin-service` |
| Port | `8084` |
| Eureka Registration | Yes (`lb://daily-checkin-service`) |
| Base API Path | `/api/v1/checkins` |

## Database Configuration

### Development (Local)

| Property | Value |
|----------|-------|
| Database Type | H2 (embedded) |
| JDBC URL | `jdbc:h2:mem:dailycheckin_db` |
| Database Name | `dailycheckin_db` |
| Username | `sa` |
| Password | (empty) |
| Console URL | `http://localhost:8084/h2-console` |

### Docker Environment

| Container | Value |
|-----------|-------|
| Container Name | `hc-daily-checkin-service` |
| External Port | `8084` |
| Database | H2 in-memory (embedded) |

## Entity Model

### DailyCheckin Entity

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Primary Key, Auto-generated | Unique identifier for the check-in |
| `patientId` | UUID | Not Null | Reference to the patient who created the check-in |
| `mood` | MoodType | Not Null | Patient's mood (EXCELLENT, GOOD, FAIR, POOR, BAD) |
| `energyLevel` | Integer | 1-10 | Patient's energy level rating (1=low, 10=high) |
| `sleepQuality` | SleepQuality | Not Null | Quality of sleep (GREAT, GOOD, FAIR, POOR, BAD) |
| `notes` | String (500) | Nullable | Additional notes or comments from the patient |
| `checkinDate` | LocalDate | Not Null | Date of the check-in |
| `createdAt` | Instant | Auto-generated | Timestamp when the check-in was created |
| `updatedAt` | Instant | Auto-updated | Timestamp when the check-in was last modified |

### MoodType Enum

```java
public enum MoodType {
    EXCELLENT,  // Feeling great
    GOOD,       // Feeling well
    FAIR,       // Feeling okay
    POOR,       // Not feeling well
    BAD         // Feeling very unwell
}
```

### SleepQuality Enum

```java
public enum SleepQuality {
    GREAT,  // Slept very well, fully rested
    GOOD,   // Slept well
    FAIR,   // Slept okay
    POOR,   // Did not sleep well
    BAD     // Very poor sleep or insomnia
}
```

### SymptomCheck Entity (Related)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Primary Key, Auto-generated | Unique identifier |
| `dailyCheckinId` | UUID | Not Null, Foreign Key | Reference to parent DailyCheckin |
| `symptomType` | String (100) | Not Null | Type of symptom (e.g., "headache", "nausea", "fatigue") |
| `severity` | Integer | 1-10 | Severity rating (1=mild, 10=severe) |
| `present` | Boolean | Not Null, Default: `true` | Whether the symptom is present |
| `notes` | String (255) | Nullable | Additional notes about the symptom |

## API Endpoints

### Base URL

```
Direct:      http://localhost:8084/api/v1/checkins
Via Gateway: http://localhost:8081/api/v1/checkins
```

### Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/checkins` | Create a new check-in | Yes (PATIENT) |
| GET | `/api/v1/checkins/{id}` | Get check-in by ID | Yes (PATIENT, CAREGIVER, DOCTOR, ADMIN) |
| GET | `/api/v1/checkins/patient/{patientId}` | Get check-ins by patient ID | Yes (PATIENT, CAREGIVER, DOCTOR, ADMIN) |
| GET | `/api/v1/checkins/patient/{patientId}/today` | Get today's check-in for patient | Yes (PATIENT) |
| PUT | `/api/v1/checkins/{id}` | Update an existing check-in | Yes (PATIENT) |
| DELETE | `/api/v1/checkins/{id}` | Delete a check-in | Yes (PATIENT, ADMIN) |

### Detailed API Documentation

#### 1. Create Check-in

Creates a new daily check-in for a patient.

**Request:**
```http
POST /api/v1/checkins
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "mood": "GOOD",
  "energyLevel": 7,
  "sleepQuality": "GOOD",
  "notes": "Feeling energetic today after good night's sleep",
  "checkinDate": "2024-01-25",
  "symptoms": [
    {
      "symptomType": "headache",
      "severity": 2,
      "present": true,
      "notes": "Mild headache in the morning"
    }
  ]
}
```

**Field Validation:**
| Field | Required | Max Length | Validation |
|-------|----------|------------|------------|
| `patientId` | Yes | - | Valid UUID |
| `mood` | Yes | - | Must be: EXCELLENT, GOOD, FAIR, POOR, BAD |
| `energyLevel` | Yes | - | Integer 1-10 |
| `sleepQuality` | Yes | - | Must be: GREAT, GOOD, FAIR, POOR, BAD |
| `notes` | No | 500 | - |
| `checkinDate` | Yes | - | ISO Date format (YYYY-MM-DD) |
| `symptoms` | No | - | Array of SymptomCheck objects |

**Response (201 Created):**
```json
{
  "id": "770a0622-g41d-63f6-c938-668877662222",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "mood": "GOOD",
  "energyLevel": 7,
  "sleepQuality": "GOOD",
  "notes": "Feeling energetic today after good night's sleep",
  "checkinDate": "2024-01-25",
  "createdAt": "2024-01-25T08:30:00Z",
  "updatedAt": "2024-01-25T08:30:00Z",
  "symptoms": [
    {
      "id": "880b1733-h52e-74g7-d049-779988773333",
      "symptomType": "headache",
      "severity": 2,
      "present": true,
      "notes": "Mild headache in the morning"
    }
  ]
}
```

**Error Response (400 Bad Request - Validation):**
```json
{
  "error": "VALIDATION_FAILED",
  "message": "Validation failed",
  "details": [
    "mood: Mood is required",
    "energyLevel: Energy level must be between 1 and 10"
  ],
  "timestamp": "2024-01-25T08:30:00Z",
  "path": "/api/v1/checkins"
}
```

---

#### 2. Get Check-in by ID

Retrieves a specific check-in by its UUID.

**Request:**
```http
GET /api/v1/checkins/770a0622-g41d-63f6-c938-668877662222
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": "770a0622-g41d-63f6-c938-668877662222",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "mood": "GOOD",
  "energyLevel": 7,
  "sleepQuality": "GOOD",
  "notes": "Feeling energetic today after good night's sleep",
  "checkinDate": "2024-01-25",
  "createdAt": "2024-01-25T08:30:00Z",
  "updatedAt": "2024-01-25T08:30:00Z",
  "symptoms": [
    {
      "id": "880b1733-h52e-74g7-d049-779988773333",
      "symptomType": "headache",
      "severity": 2,
      "present": true,
      "notes": "Mild headache in the morning"
    }
  ]
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "DailyCheckin not found: 770a0622-g41d-63f6-c938-668877662222",
  "details": null,
  "timestamp": "2024-01-25T12:00:00Z",
  "path": "/api/v1/checkins/770a0622-g41d-63f6-c938-668877662222"
}
```

---

#### 3. Get Check-ins by Patient

Retrieves all check-ins for a specific patient with pagination support.

**Request:**
```http
GET /api/v1/checkins/patient/550e8400-e29b-41d4-a716-446655440001?page=0&size=10&sort=checkinDate,desc
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 0 | Page number (0-indexed) |
| `size` | Integer | 20 | Number of items per page |
| `sort` | String | `checkinDate,desc` | Sort field and direction |
| `fromDate` | LocalDate | - | Filter check-ins from date (YYYY-MM-DD) |
| `toDate` | LocalDate | - | Filter check-ins to date (YYYY-MM-DD) |

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "770a0622-g41d-63f6-c938-668877662222",
      "patientId": "550e8400-e29b-41d4-a716-446655440001",
      "mood": "GOOD",
      "energyLevel": 7,
      "sleepQuality": "GOOD",
      "notes": "Feeling energetic today",
      "checkinDate": "2024-01-25",
      "createdAt": "2024-01-25T08:30:00Z",
      "updatedAt": "2024-01-25T08:30:00Z",
      "symptoms": []
    },
    {
      "id": "660f9511-f30c-52e5-b827-557766551111",
      "patientId": "550e8400-e29b-41d4-a716-446655440001",
      "mood": "FAIR",
      "energyLevel": 5,
      "sleepQuality": "FAIR",
      "notes": "Okay day, a bit tired",
      "checkinDate": "2024-01-24",
      "createdAt": "2024-01-24T09:00:00Z",
      "updatedAt": "2024-01-24T09:00:00Z",
      "symptoms": [
        {
          "id": "990c2844-i63f-85h8-e150-880099884444",
          "symptomType": "fatigue",
          "severity": 4,
          "present": true,
          "notes": "Felt tired in the afternoon"
        }
      ]
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": true
    }
  },
  "totalElements": 2,
  "totalPages": 1,
  "last": true,
  "first": true
}
```

---

#### 4. Get Today's Check-in

Retrieves the check-in for the current date for a specific patient.

**Request:**
```http
GET /api/v1/checkins/patient/550e8400-e29b-41d4-a716-446655440001/today
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": "770a0622-g41d-63f6-c938-668877662222",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "mood": "GOOD",
  "energyLevel": 7,
  "sleepQuality": "GOOD",
  "notes": "Feeling energetic today after good night's sleep",
  "checkinDate": "2024-01-25",
  "createdAt": "2024-01-25T08:30:00Z",
  "updatedAt": "2024-01-25T08:30:00Z",
  "symptoms": []
}
```

**Error Response (404 Not Found - No check-in today):**
```json
{
  "error": "NOT_FOUND",
  "message": "No check-in found for patient today",
  "details": null,
  "timestamp": "2024-01-25T12:00:00Z",
  "path": "/api/v1/checkins/patient/550e8400-e29b-41d4-a716-446655440001/today"
}
```

---

#### 5. Update Check-in

Updates an existing check-in.

**Request:**
```http
PUT /api/v1/checkins/770a0622-g41d-63f6-c938-668877662222
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "mood": "EXCELLENT",
  "energyLevel": 9,
  "sleepQuality": "GREAT",
  "notes": "Updated: Feeling even better after morning walk!",
  "symptoms": [
    {
      "symptomType": "headache",
      "severity": 1,
      "present": false,
      "notes": "Headache gone after medication"
    }
  ]
}
```

**Field Validation:**
| Field | Required | Max Length | Validation |
|-------|----------|------------|------------|
| `mood` | Yes | - | Must be: EXCELLENT, GOOD, FAIR, POOR, BAD |
| `energyLevel` | Yes | - | Integer 1-10 |
| `sleepQuality` | Yes | - | Must be: GREAT, GOOD, FAIR, POOR, BAD |
| `notes` | No | 500 | - |
| `symptoms` | No | - | Array of SymptomCheck objects |

**Response (200 OK):**
```json
{
  "id": "770a0622-g41d-63f6-c938-668877662222",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "mood": "EXCELLENT",
  "energyLevel": 9,
  "sleepQuality": "GREAT",
  "notes": "Updated: Feeling even better after morning walk!",
  "checkinDate": "2024-01-25",
  "createdAt": "2024-01-25T08:30:00Z",
  "updatedAt": "2024-01-25T14:00:00Z",
  "symptoms": [
    {
      "id": "880b1733-h52e-74g7-d049-779988773333",
      "symptomType": "headache",
      "severity": 1,
      "present": false,
      "notes": "Headache gone after medication"
    }
  ]
}
```

---

#### 6. Delete Check-in

Deletes a check-in permanently.

**Request:**
```http
DELETE /api/v1/checkins/770a0622-g41d-63f6-c938-668877662222
Authorization: Bearer <jwt_token>
```

**Response (204 No Content):**
```
(empty body)
```

**Note:** Only the patient who created the check-in or an ADMIN can delete it.

## Data Transfer Objects (DTOs)

### CreateDailyCheckinRequest

```java
public record CreateDailyCheckinRequest(
    @NotNull UUID patientId,
    @NotNull MoodType mood,
    @NotNull @Min(1) @Max(10) Integer energyLevel,
    @NotNull SleepQuality sleepQuality,
    @Size(max = 500) String notes,
    @NotNull LocalDate checkinDate,
    List<SymptomCheckRequest> symptoms
) {}
```

### UpdateDailyCheckinRequest

```java
public record UpdateDailyCheckinRequest(
    @NotNull MoodType mood,
    @NotNull @Min(1) @Max(10) Integer energyLevel,
    @NotNull SleepQuality sleepQuality,
    @Size(max = 500) String notes,
    List<SymptomCheckRequest> symptoms
) {}
```

### DailyCheckinResponse

```java
public record DailyCheckinResponse(
    UUID id,
    UUID patientId,
    MoodType mood,
    Integer energyLevel,
    SleepQuality sleepQuality,
    String notes,
    LocalDate checkinDate,
    Instant createdAt,
    Instant updatedAt,
    List<SymptomCheckResponse> symptoms
) {}
```

### SymptomCheckRequest

```java
public record SymptomCheckRequest(
    @NotBlank @Size(max = 100) String symptomType,
    @NotNull @Min(1) @Max(10) Integer severity,
    @NotNull Boolean present,
    @Size(max = 255) String notes
) {}
```

### SymptomCheckResponse

```java
public record SymptomCheckResponse(
    UUID id,
    String symptomType,
    Integer severity,
    Boolean present,
    String notes
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
  "path": "/api/v1/checkins/invalid-id"
}
```

### Exception Types

| Exception | HTTP Status | Description |
|-----------|-------------|-------------|
| `DailyCheckinNotFoundException` | 404 Not Found | Check-in with given ID does not exist |
| `MethodArgumentNotValidException` | 400 Bad Request | Validation errors in request body |
| `IllegalArgumentException` | 400 Bad Request | Invalid enum values or parameters |

## Build Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.9+

### Local Build

```bash
# Navigate to service directory
cd services/daily-checkin-service

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
# target/daily-checkin-service-0.1.0.jar
```

## Docker Build and Run

### Using Docker Compose (Recommended)

```bash
# From project root - starts all services including daily-checkin-service
docker-compose up -d

# Check service status
docker-compose ps

# View daily-checkin service logs
docker-compose logs -f hc-daily-checkin-service
```

### Manual Docker Build

```bash
# Build Docker image
cd services/daily-checkin-service
docker build -t humancare/daily-checkin:latest .

# Run container (requires Eureka)
docker run -d \
  --name hc-daily-checkin-service \
  -p 8084:8084 \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://hc-eureka-server:8761/eureka/ \
  humancare/daily-checkin:latest
```

### Docker Image Details

- **Base Image:** `eclipse-temurin:17-jre-alpine`
- **Build Image:** `maven:3.9-eclipse-temurin-17-alpine`
- **Exposed Port:** 8084
- **Health Check:** `GET /actuator/health` every 30s

## Service Dependencies

| Service | Required | Purpose |
|---------|----------|---------|
| hc-eureka-server | Yes | Service discovery registration |
| hc-config-server | Yes | External configuration |
| hc-keycloak | Yes | OAuth2/JWT token validation |
| hc-api-gateway | No (but recommended) | API routing and auth |

## Health and Monitoring

### Actuator Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /actuator/health` | Service health status |
| `GET /actuator/info` | Application information |

### Health Check Example

```bash
curl http://localhost:8084/actuator/health
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
# Create check-in
curl -X POST http://localhost:8084/api/v1/checkins \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "mood": "GOOD",
    "energyLevel": 7,
    "sleepQuality": "GOOD",
    "notes": "Feeling good today",
    "checkinDate": "2024-01-25",
    "symptoms": [
      {
        "symptomType": "headache",
        "severity": 2,
        "present": true,
        "notes": "Mild headache"
      }
    ]
  }'

# Get check-in by ID
curl http://localhost:8084/api/v1/checkins/<checkin-id> \
  -H "Authorization: Bearer $TOKEN"

# Get check-ins for patient
curl http://localhost:8084/api/v1/checkins/patient/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer $TOKEN"

# Get today's check-in
curl http://localhost:8084/api/v1/checkins/patient/550e8400-e29b-41d4-a716-446655440001/today \
  -H "Authorization: Bearer $TOKEN"

# Update check-in
curl -X PUT http://localhost:8084/api/v1/checkins/<checkin-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "EXCELLENT",
    "energyLevel": 9,
    "sleepQuality": "GREAT",
    "notes": "Feeling even better!"
  }'

# Delete check-in
curl -X DELETE http://localhost:8084/api/v1/checkins/<checkin-id> \
  -H "Authorization: Bearer $TOKEN"
```

## Project Structure

```
services/daily-checkin-service/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/humancare/dailycheckin/
│       │       ├── DailyCheckinServiceApplication.java    # Spring Boot entry point
│       │       ├── controller/
│       │       │   └── DailyCheckinController.java        # REST API endpoints
│       │       ├── dto/
│       │       │   ├── CreateDailyCheckinRequest.java     # Create request DTO
│       │       │   ├── UpdateDailyCheckinRequest.java     # Update request DTO
│       │       │   ├── DailyCheckinResponse.java          # Response DTO
│       │       │   ├── SymptomCheckRequest.java           # Symptom request DTO
│       │       │   └── SymptomCheckResponse.java          # Symptom response DTO
│       │       ├── entity/
│       │       │   ├── DailyCheckin.java                  # JPA entity
│       │       │   ├── SymptomCheck.java                  # Symptom JPA entity
│       │       │   ├── MoodType.java                      # Mood enum
│       │       │   └── SleepQuality.java                  # Sleep quality enum
│       │       ├── exception/
│       │       │   ├── ErrorResponse.java                 # Error response model
│       │       │   ├── GlobalExceptionHandler.java        # Exception handler
│       │       │   └── DailyCheckinNotFoundException.java # Custom exception
│       │       ├── mapper/
│       │       │   ├── DailyCheckinMapper.java            # Entity/DTO mapping
│       │       │   └── SymptomCheckMapper.java            # Symptom mapper
│       │       ├── repository/
│       │       │   ├── DailyCheckinRepository.java        # JPA repository
│       │       │   └── SymptomCheckRepository.java        # Symptom repository
│       │       └── service/
│       │           ├── DailyCheckinService.java           # Business logic
│       │           └── SymptomCheckService.java           # Symptom service
│       └── resources/
│           └── application.properties                     # Bootstrap config
├── Dockerfile                                             # Docker build config
├── pom.xml                                                # Maven dependencies
└── README.md                                              # This file
```

## Keycloak Integration

The daily-checkin-service relies on the API Gateway for authentication. All endpoints require a valid JWT token issued by Keycloak for the `humancare` realm.

### Required Roles

| Endpoint | Required Role(s) |
|----------|------------------|
| POST /api/v1/checkins | PATIENT |
| GET /api/v1/checkins/{id} | PATIENT, CAREGIVER, DOCTOR, ADMIN |
| GET /api/v1/checkins/patient/{patientId} | PATIENT, CAREGIVER, DOCTOR, ADMIN |
| GET /api/v1/checkins/patient/{patientId}/today | PATIENT |
| PUT /api/v1/checkins/{id} | PATIENT |
| DELETE /api/v1/checkins/{id} | PATIENT, ADMIN |

### Token Validation

Tokens are validated by the API Gateway before requests reach the daily-checkin-service. The service receives the authenticated principal through the Gateway.

## License

This service is part of the HumanCare Platform - a healthcare microservices project for educational purposes.
