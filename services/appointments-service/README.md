# 📅 Appointments Service

**Healthcare appointment management microservice for the HumanCare platform.**

| Property | Value |
|----------|-------|
| **Service Name** | appointments-service |
| **Owner** | Roudayna |
| **Port** | 8085 |
| **Type** | Java / Spring Boot |
| **Database** | MySQL (appointments_db) |
| **Service Discovery** | Eureka Client (registered) |
| **Container Name** | hc-appointments-service |

---

## 📋 Overview

The Appointments Service is a core microservice in the HumanCare platform responsible for managing medical appointments between patients and healthcare providers. It provides a complete CRUD API for appointment scheduling, tracking, and management.

### Key Features

- ✅ Create, read, update, and delete appointments
- ✅ Filter appointments by patient ID
- ✅ Filter appointments by status (SCHEDULED, COMPLETED, CANCELLED)
- ✅ Get upcoming appointments (next 7 days) for appointment reminders
- ✅ Automatic status defaulting to "SCHEDULED" on creation
- ✅ Publishes `AppointmentBookedEvent` to RabbitMQ when appointments are created
- ✅ Eureka service discovery integration
- ✅ Config Server integration for externalized configuration
- ✅ Health checks and actuator endpoints

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Programming Language |
| Spring Boot | 3.2.0 | Application Framework |
| Spring Cloud | 2023.0.0 | Cloud Native Tools |
| Spring Data JPA | 3.2.0 | ORM / Data Access |
| MySQL Connector | 8.x | Database Driver |
| Lombok | Latest | Boilerplate Reduction |
| Maven | 3.8+ | Build Tool |
| Eureka Client | 2023.0.0 | Service Discovery |

---

## 🌐 Service Configuration

### Port & Eureka

| Setting | Value |
|---------|-------|
| Server Port | 8085 |
| Eureka Registration | ✅ Yes |
| Eureka Server URL | http://localhost:8761/eureka/ |
| Application Name | appointments-service |
| Eureka Instance ID | appointments-service:{random} |

### Database Configuration

| Setting | Local (Dev) | Docker |
|---------|-------------|--------|
| Database | MySQL | MySQL |
| Database Name | appointments_db | appointments_db |
| Host | localhost | hc-mysql-appointments |
| Port | 3306 | 3306 (internal) / 3307 (external) |
| Username | root | root |
| Password | (empty) | root |
| JDBC URL | `jdbc:mysql://localhost:3306/appointments_db` | `jdbc:mysql://hc-mysql-appointments:3306/appointments_db` |

### JPA Configuration

| Setting | Value |
|---------|-------|
| DDL Auto | update |
| Show SQL | true |
| Dialect | MySQLDialect |
| Format SQL | true |

---

## 📦 Data Model

### Appointment Entity

```java
@Entity
@Table(name = "appointments")
public class Appointment {
    private UUID id;                    // Primary Key (Auto-generated)
    private UUID patientId;             // Patient ID (Required)
    private String doctorName;          // Doctor name (Required)
    private LocalDateTime appointmentDate;  // Appointment datetime (Required)
    private String reason;              // Reason for visit (Optional)
    private String status;              // Status: SCHEDULED, COMPLETED, CANCELLED
    private String notes;               // Additional notes (Optional)
}
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID (PK) | Auto | Unique identifier for the appointment |
| `patientId` | UUID | Yes | Reference to the patient user ID |
| `doctorName` | String | Yes | Name of the doctor/healthcare provider |
| `appointmentDate` | LocalDateTime | Yes | Date and time of the appointment (ISO 8601 format) |
| `reason` | String | No | Reason or purpose for the appointment |
| `status` | String | No | Current status: `SCHEDULED` (default), `COMPLETED`, or `CANCELLED` |
| `notes` | String | No | Additional notes or comments |

### Status Values

| Status | Description |
|--------|-------------|
| `SCHEDULED` | Default status when creating a new appointment |
| `COMPLETED` | Appointment has been completed |
| `CANCELLED` | Appointment has been cancelled |

---

## 🔌 API Endpoints

**Base URL:** `http://localhost:8085/api/appointments`

### Endpoint Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/appointments/health` | Health check endpoint | No |
| GET | `/api/appointments` | Get all appointments | Yes |
| GET | `/api/appointments/{id}` | Get appointment by ID | Yes |
| GET | `/api/appointments/patient/{patientId}` | Get appointments by patient | Yes |
| GET | `/api/appointments/status/{status}` | Get appointments by status | Yes |
| GET | `/api/appointments/upcoming` | Get upcoming appointments (next 7 days) | Yes |
| POST | `/api/appointments` | Create new appointment | Yes |
| PUT | `/api/appointments/{id}` | Update appointment | Yes |
| DELETE | `/api/appointments/{id}` | Delete appointment | Yes |

> **Note:** Authentication is handled via Keycloak. The service expects a valid JWT token in the `Authorization: Bearer <token>` header for all endpoints except health checks.

---

### 1. Health Check

Check if the service is running.

```http
GET /api/appointments/health
```

**Response:**
```json
{
  "service": "appointments-service",
  "status": "UP",
  "owner": "Roudayna",
  "port": "8085"
}
```

---

### 2. Get All Appointments

Retrieve all appointments in the system.

```http
GET /api/appointments
```

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "doctorName": "Dr. Smith",
    "appointmentDate": "2024-06-15T10:30:00",
    "reason": "Annual checkup",
    "status": "SCHEDULED",
    "notes": "Patient prefers morning appointments"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "patientId": "550e8400-e29b-41d4-a716-446655440003",
    "doctorName": "Dr. Johnson",
    "appointmentDate": "2024-06-16T14:00:00",
    "reason": "Follow-up",
    "status": "COMPLETED",
    "notes": null
  }
]
```

---

### 3. Get Appointment by ID

Retrieve a specific appointment by its ID.

```http
GET /api/appointments/{id}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Appointment ID |

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "doctorName": "Dr. Smith",
  "appointmentDate": "2024-06-15T10:30:00",
  "reason": "Annual checkup",
  "status": "SCHEDULED",
  "notes": "Patient prefers morning appointments"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Appointment not found with id: 999"
}
```

---

### 4. Get Appointments by Patient ID

Retrieve all appointments for a specific patient.

```http
GET /api/appointments/patient/{patientId}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patientId` | UUID | Yes | Patient ID |

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "doctorName": "Dr. Smith",
    "appointmentDate": "2024-06-15T10:30:00",
    "reason": "Annual checkup",
    "status": "SCHEDULED",
    "notes": "Patient prefers morning appointments"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "doctorName": "Dr. Williams",
    "appointmentDate": "2024-07-01T09:00:00",
    "reason": "Dental cleaning",
    "status": "SCHEDULED",
    "notes": null
  }
]
```

---

### 5. Get Appointments by Status

Retrieve appointments filtered by status.

```http
GET /api/appointments/status/{status}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | String | Yes | Status value (case-insensitive): `scheduled`, `completed`, `cancelled` |

**Example Request:**
```http
GET /api/appointments/status/completed
```

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "patientId": "550e8400-e29b-41d4-a716-446655440003",
    "doctorName": "Dr. Johnson",
    "appointmentDate": "2024-06-16T14:00:00",
    "reason": "Follow-up",
    "status": "COMPLETED",
    "notes": null
  }
]
```

---

### 6. Get Upcoming Appointments

Retrieve appointments scheduled in the next 7 days with status "SCHEDULED".

```http
GET /api/appointments/upcoming
```

**Parameters:** No parameters required

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "doctorName": "Dr. Smith",
    "appointmentDate": "2024-06-15T10:30:00",
    "reason": "Annual checkup",
    "status": "SCHEDULED",
    "notes": "Patient prefers morning appointments"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "doctorName": "Dr. Williams",
    "appointmentDate": "2024-06-18T09:00:00",
    "reason": "Dental cleaning",
    "status": "SCHEDULED",
    "notes": null
  }
]
```

**Used by:** Notification Service for appointment reminder notifications

---

### 7. Create Appointment

Create a new appointment. Status defaults to "SCHEDULED" if not provided.

```http
POST /api/appointments
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "doctorName": "Dr. Smith",
  "appointmentDate": "2024-06-15T10:30:00",
  "reason": "Annual checkup",
  "status": "SCHEDULED",
  "notes": "Patient prefers morning appointments"
}
```

**Field Requirements:**
| Field | Required | Default |
|-------|----------|---------|
| `patientId` | Yes | - |
| `doctorName` | Yes | - |
| `appointmentDate` | Yes | - |
| `reason` | No | null |
| `status` | No | "SCHEDULED" |
| `notes` | No | null |

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "doctorName": "Dr. Smith",
  "appointmentDate": "2024-06-15T10:30:00",
  "reason": "Annual checkup",
  "status": "SCHEDULED",
  "notes": "Patient prefers morning appointments"
}
```

---

### 8. Update Appointment

Update an existing appointment.

```http
PUT /api/appointments/{id}
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Appointment ID to update |

**Request Body:**
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "doctorName": "Dr. Smith",
  "appointmentDate": "2024-06-20T11:00:00",
  "reason": "Annual checkup - Rescheduled",
  "status": "SCHEDULED",
  "notes": "Rescheduled to afternoon"
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "550e8400-e29b-41d4-a716-446655440001",
  "doctorName": "Dr. Smith",
  "appointmentDate": "2024-06-20T11:00:00",
  "reason": "Annual checkup - Rescheduled",
  "status": "SCHEDULED",
  "notes": "Rescheduled to afternoon"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Appointment not found with id: 999"
}
```

---

### 9. Delete Appointment

Delete an appointment by ID.

```http
DELETE /api/appointments/{id}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Appointment ID to delete |

**Response (200 OK):**
```json
{
  "message": "Appointment deleted successfully"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Appointment not found with id: 999"
}
```

---

## 🔐 Authentication & Roles

This service integrates with **Keycloak** for authentication. The HumanCare platform uses the following roles:

| Role | Access Level |
|------|--------------|
| `PATIENT` | Can view and manage own appointments only |
| `CAREGIVER` | Can view and manage appointments for assigned patients |
| `DOCTOR` | Can view and manage all patient appointments |
| `ADMIN` | Full access to all appointment operations |

### Authentication Header

Include the JWT token in all requests (except health checks):

```http
Authorization: Bearer <access_token>
```

### Obtaining a Token

```http
POST http://localhost:8090/realms/humancare/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&
client_id=humancare-webapp&
username=<username>&
password=<password>
```

---

## 🚀 Build Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.8+
- MySQL 8.0+ (or Docker for containerized database)
- Eureka Server running on port 8761

### Maven Commands

```bash
# Clean and compile
cd services/appointments-service
mvn clean compile

# Run tests
mvn test

# Package the application
mvn clean package

# Run locally
mvn spring-boot:run

# Skip tests during build
mvn clean package -DskipTests
```

### Build Output

The build produces a JAR file at:
```
target/appointments-service-1.0.0.jar
```

---

## 🐳 Docker Instructions

### Build Docker Image

```bash
cd services/appointments-service
docker build -t humancare/appointments:latest .
```

### Run with Docker Compose (Recommended)

From the project root:

```bash
# Start all services including appointments-service
docker-compose up -d

# Start only appointments-service and its dependencies
docker-compose up -d hc-mysql-appointments hc-appointments-service

# Check service status
docker-compose ps

# View logs
docker-compose logs -f hc-appointments-service
```

### Run Standalone Docker Container

```bash
# Run the container
docker run -d \
  --name hc-appointments-service \
  -p 8085:8085 \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=root \
  -e EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://hc-eureka-server:8761/eureka/ \
  -e SPRING_CONFIG_IMPORT=optional:configserver:http://config:config123@hc-config-server:8888 \
  humancare/appointments:latest
```

### Docker Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Internal server port | 8085 |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | default |
| `DB_USERNAME` | Database username | root |
| `DB_PASSWORD` | Database password | root |
| `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE` | Eureka server URL | http://localhost:8761/eureka/ |
| `SPRING_CONFIG_IMPORT` | Config server import | optional:configserver:http://localhost:8888 |
| `JAVA_OPTS` | JVM options | - |

---

## 🔗 Service Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                    appointments-service                     │
│                      (Port: 8085)                           │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  hc-mysql-      │  │  hc-eureka-     │  │  hc-config-     │
│  appointments   │  │  server         │  │  server         │
│  (Port: 3307)   │  │  (Port: 8761)   │  │  (Port: 8888)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  notification-  │
                    │  service        │
                    │  (Port: 8088)   │
                    │  (Consumer via  │
                    │   OpenFeign)    │
                    └─────────────────┘
```

| Dependency | Required | Purpose |
|------------|----------|---------|
| hc-mysql-appointments | Yes | MySQL database for appointment data |
| hc-eureka-server | Yes | Service discovery and registration |
| hc-config-server | No | Externalized configuration (optional) |
| hc-keycloak | Indirect | Authentication via API Gateway |
| hc-api-gateway | Indirect | Route external requests to this service |
| notification-service | Consumer | Consumes `/upcoming` endpoint via OpenFeign for appointment reminders |
| RabbitMQ | Publisher | Publishes `AppointmentBookedEvent` to `notifications.appointments` queue |

---

## 📊 Actuator Endpoints

Spring Boot Actuator provides monitoring and management capabilities:

| Endpoint | URL | Description |
|----------|-----|-------------|
| Health | `/actuator/health` | Service health status |
| Info | `/actuator/info` | Application information |
| Metrics | `/actuator/metrics` | Runtime metrics |

**Health Check Response:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    },
    "discoveryComposite": {
      "status": "UP"
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

---

## 📝 Configuration Files

### Local Development: `src/main/resources/application.properties`

```properties
# Bootstrap Configuration
spring.application.name=appointments-service
server.port=8085

# Config Server
spring.config.import=optional:configserver:http://localhost:8888
spring.cloud.config.fail-fast=false

# Eureka Client (bootstrap - will be overridden by config server)
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true
```

### Config Server: `appointments-service.yml`

The complete configuration is stored in the Config Server at:
```
config-server/src/main/resources/config-repo/appointments-service.yml
```

This file includes:
- Database connection settings
- JPA/Hibernate configuration
- Eureka client settings
- Management/Actuator settings
- Logging configuration
- Profile-specific configurations (docker, dev)

---

## 🧪 Testing with cURL

### Health Check
```bash
curl http://localhost:8085/api/appointments/health
```

### Get All Appointments
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8085/api/appointments
```

### Create Appointment
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "doctorName": "Dr. Smith",
    "appointmentDate": "2024-06-15T10:30:00",
    "reason": "Annual checkup",
    "notes": "Patient prefers morning"
  }' \
  http://localhost:8085/api/appointments
```

### Update Appointment
```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "doctorName": "Dr. Smith",
    "appointmentDate": "2024-06-20T11:00:00",
    "reason": "Annual checkup - Rescheduled",
    "status": "SCHEDULED",
    "notes": "Rescheduled to afternoon"
  }' \
  http://localhost:8085/api/appointments/550e8400-e29b-41d4-a716-446655440000
```

### Delete Appointment
```bash
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  http://localhost:8085/api/appointments/550e8400-e29b-41d4-a716-446655440000
```

---

## 🔄 Inter-Service Communication

### RabbitMQ Event Publishing

When a new appointment is created, the service publishes an `AppointmentBookedEvent` to the `notifications.appointments` queue.

| Event | Queue | Consumer |
|-------|-------|----------|
| `AppointmentBookedEvent` | `notifications.appointments` | Notification Service |

---

## 🌐 Platform Architecture

The Appointments Service is part of the HumanCare microservices ecosystem:

```
┌──────────────────────────────────────────────────────────────────────┐
│                        API Gateway (8081)                            │
└──────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   Patient    │          │ Appointments │          │   Medication │
│   Service    │          │   Service    │          │   Service    │
│   (8082)     │◄────────►│   (8085)     │◄────────►│   (8083)     │
└──────────────┘          └──────────────┘          └──────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            ┌──────────────┐      ┌──────────────┐
            │   Eureka     │      │   Config     │
            │   Server     │      │   Server     │
            │   (8761)     │      │   (8888)     │
            └──────────────┘      └──────────────┘
```

---

## 🆘 Troubleshooting

### Database Connection Issues

```
Error: Communications link failure
```
**Solution:** Ensure MySQL is running and the database `appointments_db` exists.

```sql
CREATE DATABASE appointments_db;
```

### Eureka Registration Failed

```
Cannot register with Eureka
```
**Solution:** Verify Eureka Server is running on port 8761.

### Port Already in Use

```
Port 8085 was already in use
```
**Solution:** Stop any service using port 8085 or change the port in `application.properties`.

### Config Server Unavailable

```
Could not locate PropertySource
```
**Solution:** The service will fall back to local configuration. Start the Config Server for centralized config.

---

## 👥 HumanCare Platform Services

| Service | Port | Owner | Technology |
|---------|------|-------|------------|
| Patient Service | 8082 | Shared | Node.js |
| Medication Service | 8083 | Yosser | Java |
| Daily Check-in Service | 8084 | Iheb | Java |
| **Appointments Service** | **8085** | **Roudayna** | **Java** |
| Memory Service | 8086 | Arij | Java |
| Community Service | 8087 | Mouhib | Java |
| Notification Service | 8088 | Salma | Java |
| Routine Service | 8089 | Arij | Java |
| API Gateway | 8081 | - | Java |
| Eureka Server | 8761 | - | Java |
| Config Server | 8888 | - | Java |
| Keycloak | 8090 | - | Java |

---

## 📄 License

This is a school project for the HumanCare healthcare platform.

---

## 👤 Author

**Roudayna** - Appointments Service Developer

For questions or issues, please contact the HumanCare development team.
