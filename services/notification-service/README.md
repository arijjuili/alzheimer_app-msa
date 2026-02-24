# Notification Service

> HumanCare Platform - Notification Management Microservice

## Overview

The Notification Service is a core microservice in the HumanCare healthcare platform that provides comprehensive notification management capabilities. It handles the creation, retrieval, updating, and deletion of notifications for patients, caregivers, doctors, and administrators within the system.

This service enables the platform to send timely alerts, reminders, and informational messages to users, ensuring effective communication throughout the healthcare management ecosystem.

## Key Features

- ✅ CRUD operations for notifications
- ✅ Inter-service communication via OpenFeign
- ✅ Automatic appointment reminder scheduler (runs every 5 minutes)
- ✅ Mark notifications as read (individual and bulk)
- ✅ Unread notification count
- ✅ User-specific notification retrieval

## Technology Stack

| Component | Version |
|-----------|---------|
| Java | 17 |
| Spring Boot | 3.2.2 |
| Spring Cloud | 2023.0.0 |
| MySQL Connector | 8.x |

### Key Dependencies

- **Spring Boot Starter Web** - REST API framework
- **Spring Boot Starter Data JPA** - ORM and data access
- **Spring Boot Starter Validation** - Bean validation (JSR-380)
- **Spring Boot Starter Actuator** - Health checks and monitoring
- **Spring Cloud Starter Netflix Eureka Client** - Service discovery
- **Spring Cloud Starter Config** - Externalized configuration
- **MySQL Connector/J** - Database driver
- **Spring Cloud Starter OpenFeign** - Inter-service communication
- **Spring Boot Starter Scheduling** - Cron jobs and schedulers

## Service Configuration

| Property | Value |
|----------|-------|
| **Service Name** | `notification-service` |
| **Port** | `8088` |
| **Eureka Registered** | Yes |
| **Base Path** | `/api/notifications` |
| **Container Name** | `hc-notification-service` |

## Database Configuration

| Property | Local Development | Docker Environment |
|----------|------------------|-------------------|
| **Database** | MySQL | MySQL |
| **Database Name** | `notifications_db` | `notifications_db` |
| **Internal Port** | 3306 | 3306 |
| **External Port** | 3310 | 3310 |
| **Container Name** | N/A | `hc-mysql-notification` |

### Database Connection (Local)
```properties
spring.datasource.url=jdbc:mysql://localhost:3310/notifications_db
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD:root}
```

## Entity Model

### Notification Entity

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `UUID` | Primary Key, Auto-generated | Unique identifier |
| `recipientId` | `UUID` | Not Null | User ID who receives the notification |
| `title` | `String` | Not Null, Max 150 chars | Notification title |
| `message` | `String` | Not Null, Max 1000 chars | Notification content |
| `type` | `NotificationType` | Not Null | Type of notification (INFO, ALERT, REMINDER) |
| `isRead` | `Boolean` | Not Null, Default: false | Read status |
| `createdAt` | `Instant` | Auto-generated, Immutable | Creation timestamp |
| `updatedAt` | `Instant` | Auto-generated | Last update timestamp |

### Notification Types

| Type | Description |
|------|-------------|
| `INFO` | General information messages |
| `ALERT` | Critical alerts requiring attention |
| `REMINDER` | Scheduled reminders for appointments or medications |

## API Endpoints

### Base URL

```
Direct Access:    http://localhost:8088/api/notifications
Via Gateway:      http://localhost:8081/api/notifications
```

### Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/notifications` | Get all notifications (paginated) | Yes |
| `GET` | `/api/notifications/my` | Get my notifications | Yes |
| `GET` | `/api/notifications/my/unread` | Get my unread notifications | Yes |
| `GET` | `/api/notifications/unread-count` | Get unread count for current user | Yes |
| `GET` | `/api/notifications/{id}` | Get notification by ID | Yes |
| `GET` | `/api/notifications/recipient/{recipientId}` | Get notifications by recipient | Yes |
| `POST` | `/api/notifications` | Create new notification | Yes |
| `PUT` | `/api/notifications/{id}` | Update notification | Yes |
| `PATCH` | `/api/notifications/{id}/read` | Mark notification as read | Yes |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications as read | Yes |
| `DELETE` | `/api/notifications/{id}` | Delete notification | Yes |

### Detailed API Documentation

#### 1. Get All Notifications

```http
GET /api/notifications?page=0&size=20&sort=createdAt,desc
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 0 | Page number (0-indexed) |
| `size` | Integer | 20 | Number of items per page |
| `sort` | String | createdAt,desc | Sort field and direction |

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "recipientId": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Appointment Reminder",
      "message": "You have a doctor appointment tomorrow at 10:00 AM",
      "type": "REMINDER",
      "isRead": false,
      "createdAt": "2024-01-15T08:30:00Z",
      "updatedAt": "2024-01-15T08:30:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    }
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "size": 20,
  "number": 0,
  "numberOfElements": 1,
  "first": true,
  "empty": false
}
```

#### 2. Get Notifications by Recipient

```http
GET /api/notifications/recipient/{recipientId}?page=0&size=20
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `recipientId` | UUID | The recipient's user ID |

**Response (200 OK):** Same format as Get All Notifications

#### 3. Get Notification by ID

```http
GET /api/notifications/{id}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | The notification ID |

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "recipientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Appointment Reminder",
  "message": "You have a doctor appointment tomorrow at 10:00 AM",
  "type": "REMINDER",
  "isRead": false,
  "createdAt": "2024-01-15T08:30:00Z",
  "updatedAt": "2024-01-15T08:30:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Notification not found: 550e8400-e29b-41d4-a716-446655440000",
  "details": null,
  "timestamp": "2024-01-15T08:30:00Z",
  "path": "/api/notifications/550e8400-e29b-41d4-a716-446655440000"
}
```

#### 4. Create Notification

```http
POST /api/notifications
Content-Type: application/json
```

**Request Body:**
```json
{
  "recipientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Medication Alert",
  "message": "Time to take your prescribed medication",
  "type": "ALERT"
}
```

**Field Constraints:**
| Field | Required | Validation |
|-------|----------|------------|
| `recipientId` | Yes | Valid UUID |
| `title` | Yes | Not blank, max 150 characters |
| `message` | Yes | Not blank, max 1000 characters |
| `type` | Yes | One of: INFO, ALERT, REMINDER |

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "recipientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Medication Alert",
  "message": "Time to take your prescribed medication",
  "type": "ALERT",
  "isRead": false,
  "createdAt": "2024-01-15T09:00:00Z",
  "updatedAt": "2024-01-15T09:00:00Z"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "VALIDATION_FAILED",
  "message": "Validation failed",
  "details": [
    "title: Title is required",
    "type: Type is required"
  ],
  "timestamp": "2024-01-15T09:00:00Z",
  "path": "/api/notifications"
}
```

#### 5. Update Notification

```http
PUT /api/notifications/{id}
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | The notification ID to update |

**Request Body:**
```json
{
  "title": "Updated Title",
  "message": "Updated message content",
  "type": "INFO",
  "isRead": true
}
```

**Field Constraints:**
| Field | Required | Validation |
|-------|----------|------------|
| `title` | Yes | Not blank, max 150 characters |
| `message` | Yes | Not blank, max 1000 characters |
| `type` | Yes | One of: INFO, ALERT, REMINDER |
| `isRead` | Yes | Boolean |

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "recipientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Updated Title",
  "message": "Updated message content",
  "type": "INFO",
  "isRead": true,
  "createdAt": "2024-01-15T08:30:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

#### 6. Delete Notification

```http
DELETE /api/notifications/{id}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | The notification ID to delete |

**Response (204 No Content):** Empty body

#### 7. Get My Notifications

```http
GET /api/notifications/my
```

Returns all notifications for the currently authenticated user.

**Response (200 OK):** Same format as Get All Notifications

#### 8. Get My Unread Notifications

```http
GET /api/notifications/my/unread
```

Returns unread notifications for the current user.

**Response (200 OK):** Same format as Get All Notifications

#### 9. Get Unread Count

```http
GET /api/notifications/unread-count
```

Returns the count of unread notifications for the current user.

**Response (200 OK):**
```json
{
  "count": 5
}
```

#### 10. Mark as Read

```http
PATCH /api/notifications/{id}/read
```

Marks a single notification as read.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | The notification ID to mark as read |

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "recipientId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Appointment Reminder",
  "message": "You have a doctor appointment tomorrow at 10:00 AM",
  "type": "REMINDER",
  "isRead": true,
  "createdAt": "2024-01-15T08:30:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

#### 11. Mark All as Read

```http
PATCH /api/notifications/read-all
```

Marks all notifications for the current user as read.

**Response (200 OK):** Returns the number of notifications marked as read
```json
{
  "markedAsRead": 3
}
```

### Inter-Service Communication

The notification service uses **OpenFeign** to communicate with other microservices:

#### Appointment Reminder Scheduler

- **Schedule**: Runs every 5 minutes
- **Source**: Appointments Service (`lb://appointments-service`)
- **Endpoint**: `GET /api/appointments/upcoming`
- **Action**: Creates REMINDER notifications for appointments in the next 7 days
- **Notification Content**: "You have an appointment with Dr. {doctorName} on {date}"

### Appointment Reminder Flow

```
┌─────────────────────┐     Feign Client      ┌─────────────────────┐
│ Notification Service│ ─────────────────────►│  Appointments Service│
│   (Scheduler)       │  GET /upcoming        │                     │
└─────────────────────┘                       └─────────────────────┘
         │                                               │
         │ Creates REMINDER notifications                │ Returns upcoming
         │ for each appointment                          │ appointments
         ▼                                               ▼
┌─────────────────────┐                       ┌─────────────────────┐
│  notifications_db   │                       │  appointments_db    │
│  (REMINDER type)    │                       │  (SCHEDULED status) │
└─────────────────────┘                       └─────────────────────┘
```

### Health Check Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /actuator/health` | Service health status |
| `GET /actuator/info` | Service information |

## Data Transfer Objects (DTOs)

### CreateNotificationRequest
```java
record CreateNotificationRequest(
    @NotNull UUID recipientId,
    @NotBlank @Size(max = 150) String title,
    @NotBlank @Size(max = 1000) String message,
    @NotNull NotificationType type
)
```

### UpdateNotificationRequest
```java
record UpdateNotificationRequest(
    @NotBlank @Size(max = 150) String title,
    @NotBlank @Size(max = 1000) String message,
    @NotNull NotificationType type,
    @NotNull Boolean isRead
)
```

### NotificationResponse
```java
record NotificationResponse(
    UUID id,
    UUID recipientId,
    String title,
    String message,
    NotificationType type,
    Boolean isRead,
    Instant createdAt,
    Instant updatedAt
)
```

## Build Instructions

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- MySQL 8.0+ (running on port 3310)

### Build Commands

```bash
# Clean and compile
cd services/notification-service
mvn clean compile

# Run tests
mvn test

# Package application
mvn clean package

# Skip tests and package
mvn clean package -DskipTests

# Run locally (requires MySQL running)
mvn spring-boot:run
```

### Build Output
The packaged JAR will be created at:
```
target/notification-service-0.1.0.jar
```

## Docker Instructions

### Build Docker Image

```bash
# From project root
docker build -t humancare/notification:latest -f services/notification-service/Dockerfile services/notification-service

# Or using docker-compose
docker-compose build hc-notification-service
```

### Run with Docker Compose (Recommended)

```bash
# Start all services (includes notification service and MySQL)
docker-compose up -d

# Start only notification service with dependencies
docker-compose up -d hc-mysql-notification hc-notification-service

# View logs
docker-compose logs -f hc-notification-service

# Check health
curl http://localhost:8088/actuator/health
```

### Run Standalone Docker Container

```bash
# Run MySQL container first
docker run -d \
  --name hc-mysql-notification \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=notifications_db \
  -p 3310:3306 \
  mysql:8.0

# Build and run notification service
docker build -t humancare/notification:latest .

docker run -d \
  --name hc-notification-service \
  -p 8088:8088 \
  -e SERVER_PORT=8088 \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=root \
  -e EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://hc-eureka-server:8761/eureka/ \
  --link hc-mysql-notification \
  humancare/notification:latest
```

## Service Dependencies

The Notification Service depends on the following infrastructure:

| Service | Required | Purpose |
|---------|----------|---------|
| **MySQL** | Yes | Primary data storage |
| **Eureka Server** | Yes | Service discovery and registration |
| **Config Server** | No | Externalized configuration (optional) |
| **API Gateway** | No | Request routing (for external access) |
| **Keycloak** | No | JWT token validation (handled at Gateway) |
| **Appointments Service** | No | Upcoming appointment data (for scheduler) |

### Dependency Startup Order

```
MySQL → Eureka Server → Config Server (optional) → Appointments Service → Notification Service
```

## Architecture

```
┌─────────────────┐
│  API Gateway    │ (Port 8081)
│  (Keycloak Auth)│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│    Notification Service     │ (Port 8088)
│  ┌─────────────────────┐    │
│  │  NotificationController  │    │
│  └─────────────────────┘    │
│              │              │
│  ┌───────────┴───────────┐  │
│  │   NotificationService │  │
│  └───────────┬───────────┘  │
│              │              │
│  ┌───────────┴───────────┐  │
│  │ NotificationRepository│  │
│  │    (Spring Data JPA)  │  │
│  └───────────────────────┘  │
└──────────────┬──────────────┘
               │
               ▼
      ┌────────────────┐
      │  MySQL 8.0     │ (Port 3310)
      │ notifications_db│
      └────────────────┘
```

## Exception Handling

The service provides standardized error responses:

| Exception | HTTP Status | Description |
|-----------|-------------|-------------|
| `NotificationNotFoundException` | 404 Not Found | Notification ID not found |
| `MethodArgumentNotValidException` | 400 Bad Request | Validation errors in request body |

### Error Response Format
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message",
  "details": ["List of validation errors"],
  "timestamp": "2024-01-15T08:30:00Z",
  "path": "/api/notifications/..."
}
```

## Security

- **Authentication**: JWT tokens validated at API Gateway (Keycloak)
- **Authorization**: Role-based access control (RBAC)
- **Transport**: HTTPS in production (TLS termination at Gateway)

### Keycloak Roles

| Role | Access Level |
|------|-------------|
| `ADMIN` | Full CRUD access to all notifications |
| `DOCTOR` | Create, read, update notifications for their patients |
| `CAREGIVER` | Create, read, update notifications for assigned patients |
| `PATIENT` | Read-only access to their own notifications |

## Monitoring

### Actuator Endpoints

| Endpoint | Description |
|----------|-------------|
| `/actuator/health` | Health indicators (liveness/readiness) |
| `/actuator/info` | Application version and metadata |
| `/actuator/metrics` | Runtime metrics (JVM, HTTP, etc.) |

### Health Check

```bash
curl http://localhost:8088/actuator/health
```

Expected response:
```json
{
  "status": "UP"
}
```

## Development

### Project Structure
```
services/notification-service/
├── src/main/java/com/humancare/notification/
│   ├── NotificationServiceApplication.java
│   ├── client/
│   │   └── AppointmentClient.java          # Feign client for appointments
│   ├── controller/
│   │   └── NotificationController.java
│   ├── dto/
│   │   ├── AppointmentDto.java             # Appointment data transfer object
│   │   ├── CreateNotificationRequest.java
│   │   ├── NotificationResponse.java
│   │   └── UpdateNotificationRequest.java
│   ├── entity/
│   │   ├── Notification.java
│   │   └── NotificationType.java
│   ├── exception/
│   │   ├── ErrorResponse.java
│   │   ├── GlobalExceptionHandler.java
│   │   └── NotificationNotFoundException.java
│   ├── mapper/
│   │   └── NotificationMapper.java
│   ├── repository/
│   │   └── NotificationRepository.java
│   ├── scheduler/
│   │   └── AppointmentScheduler.java       # Cron job for reminders
│   └── service/
│       └── NotificationService.java
├── src/main/resources/
│   └── application.properties
├── Dockerfile
├── pom.xml
└── README.md
```

## License

This is a school project for the HumanCare healthcare platform.
