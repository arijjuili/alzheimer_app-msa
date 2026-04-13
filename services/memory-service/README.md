# Memory Service

## Overview

The **Memory Service** is a core microservice in the HumanCare healthcare platform that manages patient memory items. It provides a RESTful API for creating, retrieving, updating, and deleting memories such as photos, videos, audio clips, and notes associated with a patient. This service helps caregivers and family members preserve meaningful moments for patients.

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
- `spring-boot-starter-oauth2-resource-server` - JWT token validation
- `spring-cloud-starter-netflix-eureka-client` - Service discovery registration
- `spring-cloud-starter-config` - External configuration support
- `com.h2database:h2` - H2 embedded database driver

## Service Configuration

| Property | Value |
|----------|-------|
| Application Name | `memory-service` |
| Port | `8086` |
| Eureka Registration | Yes (`lb://memory-service`) |
| Base API Path | `/api/memories` |
| Database | H2 (embedded, persisted to `/data` in Docker) |

### Database Configuration

#### Development (Local)

| Property | Value |
|----------|-------|
| Database Type | H2 (embedded) |
| JDBC URL | `jdbc:h2:mem:memory_db` or `jdbc:h2:file:./memory_db` |
| Database Name | `memory_db` |
| Username | `sa` |
| Password | (empty) |
| Console URL | `http://localhost:8086/h2-console` |

#### Docker Environment

| Container | Value |
|-----------|-------|
| Container Name | `hc-memory-service` |
| External Port | `8086` |
| Database | H2 file-based (persisted to `/data/memory_db`) |
| Volume | `hc_memory_data` |

## Entity Model

### MemoryItem Entity

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Primary Key, Auto-generated | Unique identifier for the memory item |
| `patientId` | UUID | Not Null | Reference to the patient this memory belongs to |
| `title` | String (200) | Not Null | Short title of the memory |
| `description` | String (2000) | Nullable | Detailed description of the memory |
| `memoryDate` | LocalDate | Nullable | The date the memory occurred |
| `memoryType` | MemoryType | Not Null | Type of memory (PHOTO, VIDEO, AUDIO, NOTE) |
| `createdAt` | Instant | Auto-generated | Timestamp when the memory was created |
| `updatedAt` | Instant | Auto-updated | Timestamp when the memory was last modified |

### MemoryType Enum

```java
public enum MemoryType {
    PHOTO,   // Photograph or image
    VIDEO,   // Video recording
    AUDIO,   // Audio recording
    NOTE     // Text note or journal entry
}
```

## API Endpoints

### Base URL

```
Direct:      http://localhost:8086/api/memories
Via Gateway: http://localhost:8081/api/memories
```

### Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/memories` | Get all memory items (paginated) | Yes (any role) |
| GET | `/api/memories/{id}` | Get memory item by ID | Yes (any role) |
| GET | `/api/memories/patient/{patientId}` | Get memory items by patient ID | Yes (any role) |
| POST | `/api/memories` | Create a new memory item | Yes (any role) |
| PUT | `/api/memories/{id}` | Update an existing memory item | Yes (any role) |
| DELETE | `/api/memories/{id}` | Delete a memory item | Yes (PATIENT, ADMIN) |

### Detailed API Documentation

#### 1. Get All Memory Items

Returns a paginated list of all memory items in the system.

**Request:**
```http
GET /api/memories?page=0&size=20&sort=createdAt,desc
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "patientId": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Family Reunion",
      "description": "Summer gathering at the lake house",
      "memoryDate": "2024-07-15",
      "memoryType": "PHOTO",
      "createdAt": "2024-07-20T10:30:00Z",
      "updatedAt": "2024-07-20T10:30:00Z"
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

#### 2. Get Memory Item by ID

Retrieves a specific memory item by its UUID.

**Request:**
```http
GET /api/memories/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Family Reunion",
  "description": "Summer gathering at the lake house",
  "memoryDate": "2024-07-15",
  "memoryType": "PHOTO",
  "createdAt": "2024-07-20T10:30:00Z",
  "updatedAt": "2024-07-20T10:30:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "MemoryItem not found: 550e8400-e29b-41d4-a716-446655440000",
  "details": null,
  "timestamp": "2024-07-20T12:00:00Z",
  "path": "/api/memories/550e8400-e29b-41d4-a716-446655440000"
}
```

---

#### 3. Get Memory Items by Patient

Retrieves all memory items for a specific patient with pagination support.

**Request:**
```http
GET /api/memories/patient/550e8400-e29b-41d4-a716-446655440001?page=0&size=10
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
Same paginated format as Get All Memory Items.

---

#### 4. Create Memory Item

Creates a new memory item for a patient.

**Request:**
```http
POST /api/memories
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "First Steps",
  "description": "Recorded audio of the first therapy session",
  "memoryDate": "2024-06-10",
  "memoryType": "AUDIO"
}
```

**Field Validation:**
| Field | Required | Max Length | Validation |
|-------|----------|------------|------------|
| `patientId` | Yes | - | Valid UUID |
| `title` | Yes | 200 | Not blank |
| `description` | No | 2000 | - |
| `memoryDate` | No | - | ISO Date (YYYY-MM-DD) |
| `memoryType` | Yes | - | Must be: PHOTO, VIDEO, AUDIO, or NOTE |

**Response (201 Created):**
```json
{
  "id": "770a0622-g41d-63f6-c938-668877662222",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "First Steps",
  "description": "Recorded audio of the first therapy session",
  "memoryDate": "2024-06-10",
  "memoryType": "AUDIO",
  "createdAt": "2024-07-20T14:30:00Z",
  "updatedAt": "2024-07-20T14:30:00Z"
}
```

**Error Response (400 Bad Request - Validation):**
```json
{
  "error": "VALIDATION_FAILED",
  "message": "Validation failed",
  "details": [
    "title: Title is required",
    "memoryType: Memory type is required"
  ],
  "timestamp": "2024-07-20T14:30:00Z",
  "path": "/api/memories"
}
```

---

#### 5. Update Memory Item

Updates an existing memory item.

**Request:**
```http
PUT /api/memories/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Family Reunion - Updated",
  "description": "Updated description with more details",
  "memoryDate": "2024-07-15",
  "memoryType": "PHOTO"
}
```

**Field Validation:**
| Field | Required | Max Length | Validation |
|-------|----------|------------|------------|
| `title` | Yes | 200 | Not blank |
| `description` | No | 2000 | - |
| `memoryDate` | No | - | ISO Date (YYYY-MM-DD) |
| `memoryType` | Yes | - | Must be: PHOTO, VIDEO, AUDIO, or NOTE |

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Family Reunion - Updated",
  "description": "Updated description with more details",
  "memoryDate": "2024-07-15",
  "memoryType": "PHOTO",
  "createdAt": "2024-07-20T10:30:00Z",
  "updatedAt": "2024-07-20T15:00:00Z"
}
```

---

#### 6. Delete Memory Item

Deletes a memory item permanently.

**Request:**
```http
DELETE /api/memories/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt_token>
```

**Response (204 No Content):**
```
(empty body)
```

**Note:** Only the patient who owns the memory or an `ADMIN` can delete it.

## Data Transfer Objects (DTOs)

### CreateMemoryItemRequest

```java
public class CreateMemoryItemRequest {
    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be less than 200 characters")
    private String title;

    @Size(max = 2000, message = "Description must be less than 2000 characters")
    private String description;

    private LocalDate memoryDate;

    @NotNull(message = "Memory type is required")
    private MemoryType memoryType;
}
```

### UpdateMemoryItemRequest

```java
public class UpdateMemoryItemRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be less than 200 characters")
    private String title;

    @Size(max = 2000, message = "Description must be less than 2000 characters")
    private String description;

    private LocalDate memoryDate;

    @NotNull(message = "Memory type is required")
    private MemoryType memoryType;
}
```

### MemoryItemResponse

```java
public class MemoryItemResponse {
    private UUID id;
    private UUID patientId;
    private String title;
    private String description;
    private LocalDate memoryDate;
    private MemoryType memoryType;
    private Instant createdAt;
    private Instant updatedAt;
}
```

## Exception Handling

The service implements a global exception handler that returns standardized error responses:

### ErrorResponse Structure

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": ["Additional details if available"],
  "timestamp": "2024-07-20T14:30:00Z",
  "path": "/api/memories/invalid-id"
}
```

### Exception Types

| Exception | HTTP Status | Description |
|-----------|-------------|-------------|
| `MemoryItemNotFoundException` | 404 Not Found | Memory item with given ID does not exist |
| `MethodArgumentNotValidException` | 400 Bad Request | Validation errors in request body |

## Build Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.9+
- H2 Database (embedded, no external DB needed)

### Local Build

```bash
# Navigate to service directory
cd services/memory-service

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
# target/memory-service-0.1.0.jar
```

## Docker Build and Run

### Using Docker Compose (Recommended)

```bash
# From project root - starts all services including memory-service
docker-compose up -d

# Check service status
docker-compose ps

# View memory service logs
docker-compose logs -f hc-memory-service
```

### Manual Docker Build

```bash
# Build Docker image
cd services/memory-service
docker build -t humancare/memory:latest .

# Run container (requires Eureka)
docker run -d \
  --name hc-memory-service \
  -p 8086:8086 \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://hc-eureka-server:8761/eureka/ \
  humancare/memory:latest
```

### Docker Image Details

- **Base Image:** `eclipse-temurin:17-jre-alpine`
- **Build Image:** `maven:3.9-eclipse-temurin-17-alpine`
- **Exposed Port:** 8086
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
| `GET /actuator/info` | Service information |

### Health Check Example

```bash
curl http://localhost:8086/actuator/health
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
# Create memory item
curl -X POST http://localhost:8086/api/memories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Birthday Party",
    "description": "Photos from the surprise birthday party",
    "memoryDate": "2024-05-10",
    "memoryType": "PHOTO"
  }'

# Get all memory items
curl http://localhost:8086/api/memories \
  -H "Authorization: Bearer $TOKEN"

# Get memory items for patient
curl http://localhost:8086/api/memories/patient/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer $TOKEN"

# Update memory item
curl -X PUT http://localhost:8086/api/memories/<memory-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description",
    "memoryDate": "2024-05-10",
    "memoryType": "VIDEO"
  }'

# Delete memory item
curl -X DELETE http://localhost:8086/api/memories/<memory-id> \
  -H "Authorization: Bearer $TOKEN"
```

## Project Structure

```
services/memory-service/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/humancare/memory/
│       │       ├── MemoryServiceApplication.java    # Spring Boot entry point
│       │       ├── config/
│       │       │   └── SecurityConfig.java          # OAuth2 resource server + H2 console config
│       │       ├── controller/
│       │       │   └── MemoryItemController.java    # REST API endpoints
│       │       ├── dto/
│       │       │   ├── CreateMemoryItemRequest.java # Create request DTO
│       │       │   ├── UpdateMemoryItemRequest.java # Update request DTO
│       │       │   └── MemoryItemResponse.java      # Response DTO
│       │       ├── entity/
│       │       │   ├── MemoryItem.java              # JPA entity
│       │       │   └── MemoryType.java              # Memory type enum
│       │       ├── exception/
│       │       │   ├── ErrorResponse.java           # Error response model
│       │       │   ├── GlobalExceptionHandler.java  # Exception handler
│       │       │   └── MemoryItemNotFoundException.java # Custom exception
│       │       ├── repository/
│       │       │   └── MemoryItemRepository.java    # JPA repository
│       │       └── service/
│       │           └── MemoryItemService.java       # Business logic
│       └── resources/
│           └── application.properties               # Bootstrap config
├── Dockerfile                                       # Docker build config
├── pom.xml                                          # Maven dependencies
└── README.md                                        # This file
```

## Keycloak Integration

The memory-service relies on the API Gateway for authentication. All endpoints require a valid JWT token issued by Keycloak for the `humancare` realm.

### Required Roles

| Endpoint | Required Role(s) |
|----------|------------------|
| GET endpoints | Any authenticated user |
| POST | Any authenticated user |
| PUT | Any authenticated user |
| DELETE | PATIENT, ADMIN |

### Token Validation

Tokens are validated by the API Gateway before requests reach the memory-service. The service receives the authenticated principal through the Gateway.

## License

This service is part of the HumanCare Platform - a healthcare microservices project for educational purposes.
