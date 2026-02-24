# Task Archive: Integrate Notification Service & Routine Service

**Task Name:** Integrate Notification Service & Routine Service

**Status:** COMPLETED

**Priority:** HIGH

**Created:** 2026-02-23

**Completed:** 2026-02-23

**Description:**
Integrate two new microservices (notification-service and routine-service) into the HumanCare platform infrastructure. This includes Config Server setup, API Gateway routing, Security configuration, Docker Compose services, and Dockerfiles.

---

## Summary of Changes

### Notification Service (Port: 8088, DB Port: 3310)

| Component | File | Changes |
|-----------|------|---------|
| **Config Server** | `config-server/src/main/resources/config-repo/notification-service.yml` | Updated from MongoDB to MySQL, port 8088, default/docker/dev profiles |
| **Service POM** | `services/notification-service/pom.xml` | Added `spring-cloud-starter-config` and `mysql-connector-j` dependencies |
| **Service Bootstrap** | `services/notification-service/src/main/resources/application.properties` | Created to bootstrap from config server |
| **API Gateway** | `config-server/src/main/resources/config-repo/api-gateway.yml` | Updated routes to use `/api/notifications/**` in all profiles |
| **Gateway Security** | `api-gateway/src/main/java/com/humancare/gateway/config/SecurityConfig.java` | Added rules: `/api/notifications/health` public, `/api/notifications/**` requires role |
| **Docker Compose** | `docker-compose.yml` | Added `hc-mysql-notification` (port 3310) and `hc-notification-service` (port 8088) |
| **Dockerfile** | `services/notification-service/Dockerfile` | Created multi-stage Dockerfile with healthcheck |

### Routine Service (Port: 8089, DB Port: 3309)

| Component | File | Changes |
|-----------|------|---------|
| **Config Server** | `config-server/src/main/resources/config-repo/routine-service.yml` | Created new config with MySQL, port 8089, default/docker/dev profiles |
| **Service POM** | `services/routine-service/pom.xml` | Added `spring-cloud-starter-config` and `mysql-connector-j` dependencies |
| **Service Bootstrap** | `services/routine-service/src/main/resources/application.properties` | Created to bootstrap from config server |
| **API Gateway** | `config-server/src/main/resources/config-repo/api-gateway.yml` | Added routes for `/api/routines/**` in all profiles |
| **Gateway Security** | `api-gateway/src/main/java/com/humancare/gateway/config/SecurityConfig.java` | Added rules: `/api/routines/health` public, `/api/routines/**` requires role |
| **Docker Compose** | `docker-compose.yml` | Added `hc-mysql-routine` (port 3309) and `hc-routine-service` (port 8089) |
| **Dockerfile** | `services/routine-service/Dockerfile` | Created multi-stage Dockerfile with healthcheck |

---

## Quick Start Commands

```bash
# Start the new services
docker-compose up -d hc-mysql-notification hc-notification-service
docker-compose up -d hc-mysql-routine hc-routine-service

# Verify in Eureka
open http://localhost:8761

# Test via Gateway
curl http://localhost:8081/api/notifications/health
curl http://localhost:8081/api/routines/health
```

---

## Integration Pattern Followed

Both services were integrated following the same pattern used for `appointments-service` and `medication-service`:

1. **Config Server**: Externalized configuration with profiles (default, docker, dev)
2. **Eureka**: Service registration for discovery
3. **API Gateway**: Load-balanced routing with `lb://` prefix
4. **Security**: JWT validation, public health endpoints, role-based access
5. **Database**: MySQL with separate database per service
6. **Docker**: Multi-stage builds with healthchecks

---

## Security Rules Added

```java
// Notification Service
.pathMatchers("/api/notifications/health").permitAll()
.pathMatchers("/api/notifications/**").hasAnyRole("PATIENT", "CAREGIVER", "DOCTOR", "ADMIN")

// Routine Service
.pathMatchers("/api/routines/health").permitAll()
.pathMatchers("/api/routines/**").hasAnyRole("PATIENT", "CAREGIVER", "DOCTOR", "ADMIN")
```

---

## Notes

- Notification service originally used MongoDB, converted to MySQL for consistency
- Both services use Eureka client (already configured in original POMs)
- Health endpoints are public for Docker healthchecks
- All API endpoints require authentication with appropriate Keycloak roles
