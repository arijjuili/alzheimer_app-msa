# HumanCare - Reference Documentation

> Comprehensive architecture and coding standards for the Alzheimer Guardians Platform.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Component Architecture](#2-component-architecture)
3. [Data Architecture](#3-data-architecture)
4. [Communication Patterns](#4-communication-patterns)
5. [Security Architecture](#5-security-architecture)
6. [Deployment Architecture](#6-deployment-architecture)
7. [Technology Stack](#7-technology-stack)
8. [Coding Standards](#8-coding-standards)
9. [API Design Standards](#9-api-design-standards)
10. [Database Standards](#10-database-standards)
11. [Docker Standards](#11-docker-standards)
12. [Git Workflow](#12-git-workflow)

---

## 1. Architecture Overview

### 1.1 Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Single Responsibility** | Each service owns one bounded context |
| **Database Per Service** | Independent data stores prevent coupling |
| **API Gateway** | Single entry point for all clients |
| **Event-Driven** | Async communication for loose coupling |
| **Security First** | OAuth2/OIDC for all endpoints |
| **Infrastructure as Code** | Docker Compose for local dev |

### 1.2 System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL ACTORS                                 │
│   ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐       │
│   │ PATIENT  │      │ CAREGIVER│      │  DOCTOR  │      │  ADMIN   │       │
│   └────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘       │
└────────┼─────────────────┼─────────────────┼─────────────────┼─────────────┘
         │                 │                 │                 │
         └─────────────────┴─────────┬───────┴─────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HUMAN CARE PLATFORM                             │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        ANGULAR FRONTEND                              │   │
│  └───────────────────────────────┬─────────────────────────────────────┘   │
│                                  │                                          │
│  ┌───────────────────────────────▼─────────────────────────────────────┐   │
│  │                      API GATEWAY (8081)                              │   │
│  │              [Routing | Auth | Rate Limit | CORS]                    │   │
│  └───────────────────────────────┬─────────────────────────────────────┘   │
│                                  │                                          │
│  ┌───────────────────────────────┼─────────────────────────────────────┐   │
│  │  ┌──────────┐  ┌──────────┐  │  ┌──────────┐  ┌──────────┐        │   │
│  │  │ EUREKA   │  │ CONFIG   │◄─┘  │ KEYCLOAK │  │ RABBITMQ │        │   │
│  │  │ (8761)   │  │ (8888)   │     │ (8090)   │  │ (5673)   │        │   │
│  │  └──────────┘  └──────────┘     └──────────┘  └──────────┘        │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                  │                                          │
│  ┌───────────────────────────────▼─────────────────────────────────────┐   │
│  │                      BUSINESS MICROSERVICES                          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │   │
│  │  │ Patient  │ │Medication│ │ Check-in │ │Appointment│              │   │
│  │  │ (8082)   │ │ (8083)   │ │ (8084)   │ │ (8085)   │              │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │   │
│  │  │ Routines │ │Community │ │Notification│ │ Memory   │             │   │
│  │  │ (8089)   │ │ (8087)   │ │ (8088)   │ │ (8086)   │             │   │
│  │  └────┬─────┘ └────┬─────┘ └─────┬────┘ └────┬─────┘             │   │
│  │       │            │             │           │                   │   │
│  │       └────────────┴──────┬──────┘           │                   │   │
│  │                           ▼                  │                   │   │
│  │              ┌─────────────────────┐         │                   │   │
│  │              │   RabbitMQ Events   │         │                   │   │
│  │              │  humancare.events   │         │                   │   │
│  │              └─────────────────────┘         │                   │   │
│  └────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Infrastructure Components

#### Eureka Server (Service Discovery)

```
┌─────────────────────────────────────────┐
│           EUREKA SERVER                 │
│              (8761)                     │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │     Service Registry            │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │ PATIENT-SERVICE         │   │   │
│  │  │ - instance-1 (UP)       │   │   │
│  │  └─────────────────────────┘   │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │ GATEWAY-SERVICE         │   │   │
│  │  │ - instance-1 (UP)       │   │   │
│  │  └─────────────────────────┘   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### Config Server (Configuration Management)

```
┌─────────────────────────────────────────┐
│          CONFIG SERVER                  │
│             (8888)                      │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │    Configuration Repository     │   │
│  │                                 │   │
│  │  📄 application.yml             │   │
│  │     (shared config)             │   │
│  │  📄 gateway-service.yml         │   │
│  │     (routes, CORS, security)    │   │
│  │  📄 patient-service.yml         │   │
│  │     (DB, patient settings)      │   │
│  │  📄 [service-name].yml          │   │
│  │     (one per service)           │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### API Gateway (Entry Point)

```
┌─────────────────────────────────────────┐
│           API GATEWAY                   │
│             (8081)                      │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │         Security Layer          │   │
│  │  • JWT Validation               │   │
│  │  • Role-Based Access Control    │   │
│  │  • CORS Handling                │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │         Route Table             │   │
│  │  /api/v1/patients/**            │   │
│  │    → lb://PATIENT-SERVICE       │   │
│  │  /api/v1/medications/**         │   │
│  │    → lb://MEDICATION-SERVICE    │   │
│  │  /api/v1/checkins/**            │   │
│  │    → lb://CHECKIN-SERVICE       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### Keycloak (Identity Provider)

```
┌─────────────────────────────────────────┐
│            KEYCLOAK                     │
│            (8090)                       │
├─────────────────────────────────────────┤
│  Realm: "humancare"                    │
│  ┌─────────────────────────────────┐   │
│  │           Roles                 │   │
│  │  • PATIENT                      │   │
│  │  • CAREGIVER                    │   │
│  │  • DOCTOR                       │   │
│  │  • ADMIN                        │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │          Clients                │   │
│  │  humancare-webapp (Public)      │   │
│  │  humancare-gateway (Confidential)│  │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 3. Data Architecture

### 3.1 Database Per Service

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA STORES                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  PostgreSQL  │  │    MySQL     │  │     H2       │  │   MongoDB    ││
│  │  (Port 5434) │  │  (Port 3306) │  │  (Embedded)  │  │ (Port 27017) ││
│  │              │  │              │  │              │  │              ││
│  │  • Identity  │  │  • Medication│  │  • Check-in  │  │• Notification││
│  │  • Patient   │  │  • Appointment│ │  • Routines  │  │              ││
│  │              │  │  • Community │  │  • Memory    │  │              ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Entity Relationship Diagram (Simplified)

```
┌─────────────────────┐         ┌─────────────────────┐
│   PATIENT PROFILE   │         │   MEDICATION PLAN   │
├─────────────────────┤         ├─────────────────────┤
│ PK id: UUID         │◄────────┤ PK id: UUID         │
│    userId: UUID     │   1:M   │    patientId: UUID  │
│    firstName: String│         │    medicationName   │
│    lastName: String │         │    timeToTake: Time │
│    dateOfBirth: Date│         │    active: Boolean  │
└─────────────────────┘         └─────────────────────┘
```

---

## 4. Communication Patterns

### 4.1 Synchronous Communication (REST)

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   ANGULAR   │─────►│   GATEWAY   │─────►│   SERVICE   │
│   (4200)    │      │   (8081)    │      │  (8xxx)     │
└─────────────┘      └─────────────┘      └──────┬──────┘
       │                    │                    │
       │                    ▼                    ▼
       │             ┌─────────────┐      ┌─────────────┐
       │             │   EUREKA    │      │  DATABASE   │
       │             │  (Lookup)   │      └─────────────┘
       │             └─────────────┘
       ▼
┌─────────────────────────────────────────┐
│           REQUEST FLOW                  │
│  1. Angular → Gateway (with JWT)       │
│  2. Gateway validates JWT              │
│  3. Gateway checks roles               │
│  4. Gateway discovers service (Eureka) │
│  5. Gateway → Service                  │
│  6. Service → Database                 │
│  7. Response back through chain        │
└─────────────────────────────────────────┘
```

### 4.2 Asynchronous Communication (Events via RabbitMQ)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EVENT-DRIVEN ARCHITECTURE                         │
│   PUBLISHERS                    MESSAGE BROKER              CONSUMERS   │
│  ┌──────────────┐                                          ┌──────────┐│
│  │  Medication  │         ┌──────────────┐                 │Notification│
│  │   Service    │────────►│   RABBITMQ   │────────────────►│  Service ││
│  │  Publishes:  │         │   (5673)     │                 │          ││
│  │ • Medication │         │              │                 │ Consumes:││
│  │   Taken      │         │  Exchange:   │                 │ • All    ││
│  │ • Medication │         │  humancare   │                 │   events ││
│  │   Missed     │         │   .events    │                 │          ││
│  └──────────────┘         └──────────────┘                 └──────────┘│
│  ┌──────────────┐                                                      │
│  │ Appointment  │──────────────────────────────────────────────────────┤
│  │   Service    │                                                      │
│  │  Publishes:  │                                                      │
│  │ • Appointment│                                                      │
│  │   Booked     │                                                      │
│  └──────────────┘                                                      │
│  ┌──────────────┐                                                      │
│  │   Community  │──────────────────────────────────────────────────────┤
│  │   Service    │                                                      │
│  │  Publishes:  │                                                      │
│  │ • NewPost    │                                                      │
│  │   Created    │                                                      │
│  └──────────────┘                                                      │
│  ┌──────────────┐                                                      │
│  │   Routine    │──────────────────────────────────────────────────────┤
│  │   Service    │                                                      │
│  │  Publishes:  │                                                      │
│  │ • Routine    │                                                      │
│  │   Completed  │                                                      │
│  └──────────────┘                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Event Catalog

| Event Name | Publisher | Consumer | Queue | Payload |
|------------|-----------|----------|-------|---------|
| `MedicationTaken` | Medication Service | Notification Service | notifications.medication.taken | patientId, medicationName, timestamp |
| `MedicationMissed` | Medication Service | Notification Service | notifications.medication.missed | patientId, medicationName, scheduledTime |
| `AppointmentBooked` | Appointment Service | Notification Service | notifications.appointments | patientId, doctorName, dateTime |
| `NewPostCreated` | Community Service | Notification Service | notifications.community | authorId, postId, title, category |
| `RoutineCompleted` | Routine Service | Notification Service | notifications.routine | patientId, routineId, title, completedAt |

### 4.4 Synchronous Communication (OpenFeign)

| Client Service | Provider Service | Purpose |
|----------------|------------------|---------|
| notification-service | appointments-service | Fetch upcoming appointments for reminder notifications |
| notification-service | patient-service | Convert patient DB ID to Keycloak user ID |
| medication-service | patient-service | Validate patient existence when creating a medication plan |
| community-service | patient-service | Enrich post author details via Feign lookup |
| routine-service | patient-service | Validate patient existence when creating a routine |

---

## 5. Security Architecture

### 5.1 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  ANGULAR │────►│ KEYCLOAK │────►│  GATEWAY │────►│ SERVICE  │
│   (UI)   │     │  (8090)  │     │  (8081)  │     │ (8xxx)   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │  1. Login      │                │                │
     │───────────────►                │                │
     │                │                │                │
     │  2. JWT Token  │                │                │
     │◄───────────────│                │                │
     │                │                │                │
     │  3. API Call + JWT              │                │
     │────────────────────────────────►                │
     │                │  4. Validate JWT               │
     │                │◄───────────────│                │
     │                │                │  5. Forward    │
     │                │                │───────────────►
     │                │                │  6. Response   │
     │◄────────────────────────────────────────────────│
```

### 5.2 Authorization Matrix

| Endpoint | PATIENT | CAREGIVER | DOCTOR | ADMIN |
|----------|---------|-----------|--------|-------|
| `/patients/{id}` | Own only | Linked patient | Assigned patients | All |
| `/medications/**` | Own only | Linked patient | Assigned patients | All |
| `/checkins/**` | Own only | Linked patient | Assigned patients | All |
| `/appointments/**` | Own only | ❌ | Own + Assigned | All |
| `/community/posts` | ✅ | ✅ | ✅ | All |
| `/admin/**` | ❌ | ❌ | ❌ | All |

### 5.3 JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-id"
  },
  "payload": {
    "exp": 1708608000,
    "iat": 1708607700,
    "sub": "user-uuid-from-keycloak",
    "preferred_username": "john.doe",
    "email": "john@example.com",
    "realm_access": {
      "roles": ["PATIENT", "CAREGIVER"]
    }
  }
}
```

---

## 6. Deployment Architecture

### 6.1 Docker Compose (Development)

```yaml
# Infrastructure Layer
┌─────────────────────────────────────────────────────────────────────────┐
│  eureka-server     config-server     rabbitmq      postgres-keycloak   │
│     :8761             :8888          :5673             :5435           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
# Data Layer
┌─────────────────────────────────────────────────────────────────────────┐
│  postgres-identity   mysql-community   mongo-notification              │
│       :5434              :3311              :27017                      │
│  mysql-medication    mysql-appointments                                 │
│       :3308              :3307                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
# Service Layer
┌─────────────────────────────────────────────────────────────────────────┐
│  patient-service  medication-service  daily-checkin-service            │
│       :8082            :8083                 :8084                     │
│  appointment-service   routine-service   community-service             │
│       :8085              :8089             :8087                       │
│  notification-service   memory-service                                 │
│       :8088              :8086                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
# Edge Layer
┌─────────────────────────────────────────────────────────────────────────┐
│                            api-gateway                                 │
│                                :8081                                   │
│                           keycloak :8090                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Startup Order

```
1. Eureka Server (other services depend on it)
2. Config Server (needs Eureka, services need config)
3. Infrastructure Services (RabbitMQ, Keycloak DB, Service DBs)
4. Business Services (Identity, Medication, etc.)
5. Edge Services (Gateway, Keycloak)
```

---

## 7. Technology Stack

### 7.1 Complete Stack Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Angular 18                                                      │   │
│  │  • TypeScript 5.x  • RxJS 7.x  • Angular Material               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          GATEWAY LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Spring Cloud Gateway                                            │   │
│  │  • Spring Boot 3.2.2  • Spring Security OAuth2                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       INFRASTRUCTURE LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │    Eureka    │  │    Config    │  │   Keycloak   │  │   RabbitMQ   ││
│  │    Server    │  │    Server    │  │   22.0.5     │  │   3.12       ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER (Java)                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Spring Boot 3.2.2                                               │   │
│  │  • Spring Data JPA  • Spring Cloud Netflix  • Spring AMQP       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                       SERVICE LAYER (Node.js)                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Node.js + Express  • Sequelize ORM  • JWT validation           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  PostgreSQL  │  │    MySQL     │  │      H2      │  │   MongoDB    ││
│  │     15       │  │      8       │  │  (embedded)  │  │      6       ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Version Matrix

| Component | Technology | Version |
|-----------|-----------|---------|
| Java | OpenJDK | 17 |
| Spring Boot | Framework | 3.2.2 |
| Spring Cloud | Ecosystem | 2023.0.0 |
| Node.js | Runtime | 18+ |
| Angular | Framework | 18 |
| PostgreSQL | Database | 15 |
| MySQL | Database | 8 |
| MongoDB | Database | 6 |
| RabbitMQ | Message Broker | 3.12 |
| Keycloak | Identity Provider | 22.0.5 |

---

## 8. Coding Standards

### 8.1 General Principles

#### Code Organization

```
service-name-service/
├── AGENTS.md                 # Service-specific AI context
├── README.md                 # Service documentation
├── Dockerfile                # Container definition
│
# Java Structure
├── src/
│   ├── main/
│   │   ├── java/com/humancare/servicename/
│   │   │   ├── ServiceNameApplication.java
│   │   │   ├── config/           # Configuration classes
│   │   │   ├── controller/       # REST controllers
│   │   │   ├── service/          # Business logic
│   │   │   ├── repository/       # Data access
│   │   │   ├── entity/           # JPA entities
│   │   │   ├── dto/              # Data transfer objects
│   │   │   ├── mapper/           # Entity/DTO mappers
│   │   │   ├── exception/        # Custom exceptions
│   │   │   └── security/         # Security config
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/     # Flyway migrations
│   └── test/
│
# Node.js Structure
├── src/
│   ├── config/               # Database, app config
│   ├── controllers/          # Route handlers
│   ├── models/               # Sequelize models
│   ├── routes/               # Route definitions
│   ├── services/             # Business logic
│   ├── middleware/           # Auth, validation
│   └── app.js                # Entry point
└── package.json
```

#### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Service folders | kebab-case | `patient-service`, `medication-service` |
| Java packages | com.humancare.{service} | `com.humancare.medication` |
| Java classes | PascalCase | `MedicationPlanService` |
| Java methods | camelCase | `findByPatientId()` |
| Java constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Database tables | snake_case, plural | `medication_plans` |
| Database columns | snake_case | `patient_id` |
| REST endpoints | kebab-case | `/api/v1/medication-plans` |
| Environment variables | UPPER_SNAKE_CASE | `DB_HOST`, `SERVER_PORT` |

### 8.2 Java Standards

#### Project Setup

```xml
<!-- pom.xml -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.2</version>
</parent>

<properties>
    <java.version>17</java.version>
    <spring-cloud.version>2023.0.0</spring-cloud.version>
</properties>
```

#### Layered Architecture

```java
// 1. CONTROLLER LAYER - Handle HTTP, validate input
@RestController
@RequestMapping("/api/v1/medications")
@RequiredArgsConstructor
public class MedicationController {
    
    private final MedicationService medicationService;
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicationPlanDTO>> getPatientMedications(
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(medicationService.findByPatientId(patientId));
    }
    
    @PostMapping
    public ResponseEntity<MedicationPlanDTO> create(
            @Valid @RequestBody CreateMedicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicationService.create(request));
    }
}

// 2. SERVICE LAYER - Business logic
@Service
@RequiredArgsConstructor
public class MedicationService {
    
    private final MedicationPlanRepository repository;
    private final MedicationMapper mapper;
    private final RabbitTemplate rabbitTemplate;
    
    @Transactional(readOnly = true)
    public List<MedicationPlanDTO> findByPatientId(UUID patientId) {
        return repository.findByPatientIdAndActiveTrue(patientId)
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public MedicationIntakeDTO recordIntake(UUID planId, IntakeRequest request) {
        // Business logic here
        
        // Publish event
        rabbitTemplate.convertAndSend("notifications", 
            new MedicationTakenEvent(planId, request.getPatientId(), Instant.now()));
        
        return mapper.toIntakeDTO(intake);
    }
}

// 3. REPOSITORY LAYER - Data access
@Repository
public interface MedicationPlanRepository extends JpaRepository<MedicationPlan, UUID> {
    
    List<MedicationPlan> findByPatientIdAndActiveTrue(UUID patientId);
    
    @Query("SELECT m FROM MedicationPlan m WHERE m.patientId = :patientId " +
           "AND m.timeToTake BETWEEN :start AND :end")
    List<MedicationPlan> findDueMedications(
            @Param("patientId") UUID patientId,
            @Param("start") LocalTime start,
            @Param("end") LocalTime end);
}

// 4. ENTITY LAYER - JPA entities
@Entity
@Table(name = "medication_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "patient_id", nullable = false)
    private UUID patientId;
    
    @Column(name = "medication_name", nullable = false, length = 200)
    private String medicationName;
    
    @Column(name = "time_to_take", nullable = false)
    private LocalTime timeToTake;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
```

#### DTO Pattern

```java
// Request DTOs
@Data
@Builder
public class CreateMedicationRequest {
    
    @NotNull(message = "Patient ID is required")
    private UUID patientId;
    
    @NotBlank(message = "Medication name is required")
    @Size(max = 200, message = "Name must be less than 200 characters")
    private String medicationName;
    
    @NotNull(message = "Time to take is required")
    private LocalTime timeToTake;
}

// Response DTOs
@Data
@Builder
public class MedicationPlanDTO {
    private UUID id;
    private UUID patientId;
    private String medicationName;
    private LocalTime timeToTake;
    private Boolean active;
    private OffsetDateTime createdAt;
}
```

#### Exception Handling

```java
// Custom exception
public class MedicationNotFoundException extends RuntimeException {
    public MedicationNotFoundException(UUID id) {
        super("Medication plan not found: " + id);
    }
}

// Global exception handler
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MedicationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(MedicationNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.builder()
                        .error("NOT_FOUND")
                        .message(ex.getMessage())
                        .timestamp(Instant.now())
                        .build());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.toList());
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder()
                        .error("VALIDATION_FAILED")
                        .message("Validation failed")
                        .details(errors)
                        .timestamp(Instant.now())
                        .build());
    }
}
```

### 8.3 Node.js Standards

#### Project Setup

```json
{
  "name": "patient-service",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.0",
    "pg": "^8.11.0",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.0"
  }
}
```

#### Express Structure

```javascript
// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import patientRoutes from './routes/patient.routes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/patients', patientRoutes);

// Health check
app.get('/actuator/health', (req, res) => {
    res.json({ status: 'UP' });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
    console.log(`Patient service running on port ${PORT}`);
});

// src/controllers/patient.controller.js
import PatientService from '../services/patient.service.js';

export const getPatient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient = await PatientService.findById(id);
        
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        
        res.json(patient);
    } catch (error) {
        next(error);
    }
};

// src/services/patient.service.js
import { Patient } from '../models/index.js';
import { publishEvent } from '../utils/rabbitmq.js';

class PatientService {
    async findById(id) {
        return await Patient.findByPk(id);
    }
    
    async findAll(options = {}) {
        const { page = 1, limit = 20 } = options;
        const offset = (page - 1) * limit;
        
        return await Patient.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
    }
    
    async create(data) {
        const patient = await Patient.create(data);
        
        // Publish event
        await publishEvent('profile.updates', {
            type: 'ProfileCreated',
            patientId: patient.id,
            timestamp: new Date().toISOString()
        });
        
        return patient;
    }
}

export default new PatientService();
```

### 8.4 Angular Standards

#### Project Structure

```
frontend/humancare-ui/
├── src/
│   ├── app/
│   │   ├── core/                     # Singleton services, guards, interceptors
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── patient.service.ts
│   │   │   │   └── ...
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   └── interceptors/
│   │   │       └── auth.interceptor.ts
│   │   │
│   │   ├── features/                 # Feature modules
│   │   │   ├── dashboard/
│   │   │   ├── medications/
│   │   │   ├── appointments/
│   │   │   ├── community/
│   │   │   └── profile/
│   │   │
│   │   └── shared/                   # Shared components, pipes, directives
│   │       ├── components/
│   │       ├── pipes/
│   │       └── models/
│   │
│   └── environments/
└── main.ts
```

#### Service Pattern

```typescript
// src/app/core/services/patient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient } from '../../shared/models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/api/v1/patients`;

  constructor(private http: HttpClient) {}

  getPatient(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  getPatients(page = 0, size = 20): Observable<Page<Patient>> {
    return this.http.get<Page<Patient>>(this.apiUrl, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  createPatient(patient: CreatePatientRequest): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient);
  }
}
```

---

## 9. API Design Standards

### 9.1 URL Structure

```
/api/v1/{resource}/{subresource}

Examples:
GET    /api/v1/patients              # List patients
POST   /api/v1/patients              # Create patient
GET    /api/v1/patients/{id}         # Get patient
PUT    /api/v1/patients/{id}         # Update patient
DELETE /api/v1/patients/{id}         # Delete patient

GET    /api/v1/patients/{id}/medications     # Get patient's medications
POST   /api/v1/patients/{id}/autonomy        # Submit autonomy assessment
```

### 9.2 HTTP Methods

| Method | Usage | Response Codes |
|--------|-------|----------------|
| GET | Retrieve resource(s) | 200 OK, 404 Not Found |
| POST | Create resource | 201 Created, 400 Bad Request |
| PUT | Update resource (full) | 200 OK, 404 Not Found |
| PATCH | Update resource (partial) | 200 OK, 404 Not Found |
| DELETE | Delete resource | 204 No Content, 404 Not Found |

### 9.3 Response Format

```json
// Success - Single Resource
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "Marie",
  "lastName": "Dupont",
  "createdAt": "2026-02-22T10:00:00Z"
}

// Success - Collection
{
  "content": [
    { "id": "...", "firstName": "Marie" },
    { "id": "...", "firstName": "Jean" }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 100,
  "totalPages": 5
}

// Error
{
  "error": "VALIDATION_FAILED",
  "message": "Validation failed",
  "details": ["firstName: Name is required"],
  "timestamp": "2026-02-22T10:00:00Z",
  "path": "/api/v1/patients"
}
```

### 9.4 Pagination

```
Query Parameters:
- page: Page number (0-indexed)
- size: Items per page (default 20, max 100)
- sort: Sort field and direction (e.g., "createdAt,desc")

Example:
GET /api/v1/patients?page=0&size=10&sort=createdAt,desc
```

---

## 10. Database Standards

### 10.1 Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Tables | plural, snake_case | `medication_plans`, `daily_checkins` |
| Columns | snake_case | `patient_id`, `created_at` |
| Primary Key | `id` UUID | `id UUID PRIMARY KEY` |
| Foreign Keys | `{table}_id` | `patient_id` references `patients(id)` |
| Indexes | `idx_{table}_{column}` | `idx_medications_patient_id` |

### 10.2 Entity Requirements

```java
@Entity
@Table(name = "medication_plans")
public class MedicationPlan {
    
    // Primary key - always UUID
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    // Foreign keys - not nullable
    @Column(name = "patient_id", nullable = false)
    private UUID patientId;
    
    // Audit fields - always present
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
    
    @Column(name = "created_by")
    private UUID createdBy;
    
    // Soft delete pattern (optional)
    @Column(name = "is_active")
    private Boolean isActive = true;
}
```

### 10.3 Migration Files (Flyway)

```sql
-- V1__create_patient_table.sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_is_active ON patients(is_active);

-- V2__create_medication_plans_table.sql
CREATE TABLE medication_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    medication_name VARCHAR(200) NOT NULL,
    time_to_take TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medication_plans_patient_id ON medication_plans(patient_id);
```

---

## 11. Docker Standards

### 11.1 Dockerfile (Java)

```dockerfile
# Build stage
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Security: Run as non-root
RUN groupadd -r humancare && useradd -r -g humancare humancare
USER humancare

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```

### 11.2 Dockerfile (Node.js)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY src ./src

# Security: Run as non-root
RUN groupadd -r humancare && useradd -r -g humancare humancare
USER humancare

EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8082/actuator/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "src/app.js"]
```

### 11.3 Docker Compose Service Template

```yaml
service-name:
  container_name: hc-service-name
  build:
    context: ./service-name-service
    dockerfile: Dockerfile
  image: humancare/service-name:latest
  environment:
    SERVER_PORT: 808x
    SPRING_PROFILES_ACTIVE: docker
    SPRING_CONFIG_IMPORT: "optional:configserver:http://config:config123@config-server:8888"
    EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: http://eureka-server:8761/eureka/
    DB_HOST: postgres-service
    DB_PORT: 5432
    DB_NAME: service_db
    DB_USERNAME: ${DB_USERNAME:-postgres}
    DB_PASSWORD: ${DB_PASSWORD:-postgres}
    JAVA_OPTS: >
      -XX:+UseContainerSupport
      -XX:MaxRAMPercentage=75.0
      -XX:InitialRAMPercentage=50.0
  ports:
    - "808x:808x"
  depends_on:
    postgres-service:
      condition: service_healthy
    eureka-server:
      condition: service_healthy
    config-server:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:808x/actuator/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 60s
  restart: unless-stopped
```

---

## 12. Git Workflow

### 12.1 Branch Strategy

```
main
  └── develop
        ├── feature/patient-service
        ├── feature/medication-service
        ├── feature/checkin-service
        └── bugfix/fix-auth-issue
```

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch |
| `feature/*` | New features |
| `bugfix/*` | Bug fixes |
| `hotfix/*` | Critical production fixes |

### 12.2 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, semicolons)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Build process, dependencies

**Examples:**
```
feat(medication): add medication plan CRUD endpoints

- POST /api/v1/medications to create plan
- GET /api/v1/medications/patient/{id} to list plans
- Added validation for medication name

Closes #123
```

### 12.3 Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Docker image builds
- [ ] Service registers with Eureka
- [ ] Config loads from Config Server

## Testing
How was this tested?
```

---

*Last updated: 2026-02-22*
