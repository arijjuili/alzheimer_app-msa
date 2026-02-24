# Task: Daily Check-in Service

**Owner:** Iheb  
**Technology:** Java Spring Boot  
**Port:** 8084  
**Database:** H2 (embedded)  
**Type:** Microservice (Eureka-registered)

## Description
Create a Daily Check-in microservice for patients to record their daily status, mood, and well-being. This service integrates with the HumanCare platform infrastructure.

## Service Details

| Property | Value |
|----------|-------|
| Service Name | daily-checkin-service |
| Container Name | hc-daily-checkin-service |
| Package | com.humancare.checkin |
| Base Path | /api/v1/checkins |
| Port | 8084 |
| Database | H2 (embedded, file-based or in-memory) |
| Discovery | Eureka (lb://DAILY-CHECKIN-SERVICE) |

## Functional Requirements

### Core Entities
1. **DailyCheckin**
   - id: UUID
   - patientId: UUID (required)
   - mood: Enum (EXCELLENT, GOOD, FAIR, POOR, BAD)
   - energyLevel: Integer (1-10)
   - sleepQuality: Enum (GREAT, GOOD, FAIR, POOR, BAD)
   - notes: String (optional, max 500 chars)
   - checkinDate: LocalDate
   - createdAt: OffsetDateTime
   - updatedAt: OffsetDateTime

2. **SymptomCheck** (optional, embedded or separate)
   - symptomType: String (e.g., "headache", "nausea", "pain")
   - severity: Integer (1-10)
   - present: Boolean

### API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/v1/checkins | Create check-in | PATIENT (own only) |
| GET | /api/v1/checkins/{id} | Get check-in by ID | PATIENT (own), ADMIN |
| GET | /api/v1/checkins/patient/{patientId} | List patient check-ins | PATIENT (own), CAREGIVER (linked), DOCTOR (assigned), ADMIN |
| GET | /api/v1/checkins/patient/{patientId}/today | Get today's check-in | PATIENT (own) |
| GET | /api/v1/checkins/patient/{patientId}/range | Get check-ins by date range | PATIENT (own), ADMIN |
| PUT | /api/v1/checkins/{id} | Update check-in (same day only) | PATIENT (own) |
| DELETE | /api/v1/checkins/{id} | Delete check-in | PATIENT (own), ADMIN |
| GET | /api/v1/checkins/patient/{patientId}/statistics | Get mood/energy statistics | PATIENT (own), DOCTOR, ADMIN |

### Events (RabbitMQ)
- `DailyCheckinCreated` - Published when a patient submits a check-in
- `DailyCheckinUpdated` - Published when a check-in is updated

## Technical Requirements

### Dependencies
- Spring Boot 3.2.2
- Spring Cloud 2023.0.0
- Spring Data JPA
- Spring Web
- Spring Actuator
- Spring Cloud Netflix Eureka Client
- Spring Cloud Config Client
- Spring Security (OAuth2 Resource Server)
- H2 Database
- Lombok
- MapStruct (optional, or manual mappers)

### Configuration
```yaml
spring:
  application:
    name: daily-checkin-service
  datasource:
    url: jdbc:h2:file:/data/checkin_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    driver-class-name: org.h2.Driver
    username: sa
    password: 
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  h2:
    console:
      enabled: true
      path: /h2-console
  config:
    import: optional:configserver:http://localhost:8888

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/

server:
  port: 8084

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
```

### Docker Integration
- Add service to root `docker-compose.yml`
- Container name: `hc-daily-checkin-service`
- Image: `humancare/daily-checkin:latest`
- Volume for H2 data persistence

### API Gateway Route
Add to gateway configuration:
```yaml
- id: daily-checkin-service
  uri: lb://DAILY-CHECKIN-SERVICE
  predicates:
    - Path=/api/v1/checkins/**
  filters:
    - StripPrefix=0
```

## Subtasks

1. **Project Setup** - Maven project with dependencies
2. **Domain Layer** - Entities, enums, repositories
3. **Service Layer** - Business logic, DTOs, mappers
4. **API Layer** - Controllers, exception handling
5. **Security Config** - JWT validation, role-based access
6. **Docker & Integration** - Dockerfile, docker-compose.yml updates
7. **Config Server** - Add `daily-checkin-service.yml` to config-repo

## Acceptance Criteria

- [ ] Service starts and registers with Eureka
- [ ] All CRUD endpoints work correctly
- [ ] JWT authentication is enforced
- [ ] Role-based access control works
- [ ] H2 console accessible in dev mode
- [ ] Health check endpoint returns UP
- [ ] Docker image builds successfully
- [ ] Service communicates via API Gateway

## Notes

- Follow existing Java service patterns (see medication, routine services)
- Use existing package naming convention: `com.humancare.checkin`
- Use constructor injection with `@RequiredArgsConstructor`
- Follow REST API standards from REFERENCE.md
