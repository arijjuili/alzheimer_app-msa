# Task: Integrate Appointments Service into HumanCare Infrastructure

**Status:** Configuration Complete  
**Started:** 2026-02-23  
**Owner:** Code Agent

---

## Service Overview

| Property | Value |
|----------|-------|
| **Name** | appointments-service |
| **Port** | 8085 |
| **Type** | Java / Spring Boot |
| **Database** | MySQL |
| **Owner** | Roudayna |
| **Eureka** | Yes (already configured) |
| **Config Server** | Needs integration |

---

## Integration Checklist

### 1. Config Server Integration ✅
- [x] Create `appointments-service.yml` in config-repo
- [x] Add Spring Cloud Config Client dependency to pom.xml
- [x] Update `application.properties` to bootstrap from config server
- [x] Externalize DB config, Eureka config to config server

### 2. API Gateway Routes ✅
- [x] Add route for `/api/appointments/**` to appointments-service
- [x] Add route for local development profile
- [x] Add route for Docker profile

### 3. API Gateway Security ✅
- [x] Add role-based access rules for `/api/appointments/**`
- [x] Health endpoint should be public

### 4. Docker Integration ✅
- [x] Create Dockerfile for appointments-service
- [x] Add MySQL container for appointments DB to docker-compose.yml
- [x] Add appointments-service container to docker-compose.yml
- [x] Configure proper networking and depends_on

### 4. Testing
- [ ] Verify service registers with Eureka
- [ ] Verify config is loaded from config server
- [ ] Verify API Gateway routes requests correctly
- [ ] Verify health endpoint works

---

## API Endpoints (from README)

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/appointments/health` | Health check |
| GET | `/api/appointments` | Get all appointments |
| GET | `/api/appointments/{id}` | Get by ID |
| GET | `/api/appointments/patient/{patientId}` | Get by patient |
| GET | `/api/appointments/status/{status}` | Get by status |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/{id}` | Update appointment |
| DELETE | `/api/appointments/{id}` | Delete appointment |

---

## Security Configuration

Added to `api-gateway/src/main/java/com/humancare/gateway/config/SecurityConfig.java`:

```java
// Public health check
.pathMatchers("/api/appointments/health").permitAll()

// All other appointment endpoints require authentication
.pathMatchers("/api/appointments/**").hasAnyRole("PATIENT", "CAREGIVER", "DOCTOR", "ADMIN")
```

**Access Control:**
| Role | Access |
|------|--------|
| PATIENT | View own appointments, create appointments |
| CAREGIVER | View assigned patient appointments |
| DOCTOR | View all appointments, update status |
| ADMIN | Full access |

---

## Configuration Requirements

### Database (MySQL)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/appointments_db
spring.datasource.username=root
spring.datasource.password=
```

### Eureka
```properties
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true
```

### Config Server
```properties
spring.config.import=optional:configserver:http://localhost:8888
spring.cloud.config.fail-fast=false
```

---

## Notes

- Service already has `@EnableDiscoveryClient` annotation
- Uses Spring Data JPA with MySQL
- Port 8085 is already used by the service
- Need to use `hc-` prefix for container names
