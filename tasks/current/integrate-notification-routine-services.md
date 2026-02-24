# Task: Integrate Notification Service & Routine Service

**Status:** COMPLETED

**Priority:** HIGH

**Created:** 2026-02-23

**Completed:** 2026-02-23

## Description
Integrated two new microservices (notification-service and routine-service) into the HumanCare platform infrastructure following the same pattern as appointments-service and medication-service.

## Services Integrated

### Notification Service
- **Port:** 8088
- **Database:** MySQL (notifications_db) on port 3310
- **Container:** hc-notification-service / hc-mysql-notification

### Routine Service
- **Port:** 8089
- **Database:** MySQL (routine_db) on port 3309
- **Container:** hc-routine-service / hc-mysql-routine

## Changes Made

### 1. Config Server
| File | Action |
|------|--------|
| `notification-service.yml` | Rewrote to use MySQL instead of MongoDB, port 8088 |
| `routine-service.yml` | Created new config with MySQL, port 8089 |
| `api-gateway.yml` | Updated routes for both services in all profiles |

### 2. Service POMs
| Service | Changes |
|---------|---------|
| notification-service | Added spring-cloud-starter-config, mysql-connector-j |
| routine-service | Added spring-cloud-starter-config, mysql-connector-j |

### 3. Service Bootstrap Config
| Service | Changes |
|---------|---------|
| notification-service | Replaced application.yml with application.properties |
| routine-service | Replaced application.yml with application.properties |

### 4. API Gateway Routes
- `/api/notifications/**` → notification-service
- `/api/notification-templates/**` → notification-service
- `/api/schedules/**` → notification-service
- `/api/routines/**` → routine-service

### 5. Gateway Security (SecurityConfig.java)
```java
.pathMatchers("/api/notifications/health").permitAll()
.pathMatchers("/api/notifications/**").hasAnyRole("PATIENT", "CAREGIVER", "DOCTOR", "ADMIN")
.pathMatchers("/api/routines/health").permitAll()
.pathMatchers("/api/routines/**").hasAnyRole("PATIENT", "CAREGIVER", "DOCTOR", "ADMIN")
```

### 6. Docker Compose
| Container | Type | Port | Description |
|-----------|------|------|-------------|
| hc-mysql-notification | MySQL | 3310:3306 | Database for notification service |
| hc-notification-service | Java | 8088:8088 | Notification service |
| hc-mysql-routine | MySQL | 3309:3306 | Database for routine service |
| hc-routine-service | Java | 8089:8089 | Routine service |

### 7. Dockerfiles
- `services/notification-service/Dockerfile` - Multi-stage build
- `services/routine-service/Dockerfile` - Multi-stage build

## Quick Start

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

## Port Summary

| Service | External Port | Internal Port | Database Port |
|---------|---------------|---------------|---------------|
| notification-service | 8088 | 8088 | 3310 (MySQL) |
| routine-service | 8089 | 8089 | 3309 (MySQL) |

## Notes
- Both services follow the exact same integration pattern as appointments-service
- All services use Config Server for centralized configuration
- All services register with Eureka for service discovery
- Gateway routes use `lb://` for load balancing
- Health endpoints are public for Docker healthchecks
- All other endpoints require PATIENT, CAREGIVER, DOCTOR, or ADMIN role
