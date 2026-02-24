# Task: Integrate Community Service

**Status:** COMPLETED

**Priority:** HIGH

**Created:** 2026-02-23

**Completed:** 2026-02-23

**Description:**
Integrate the community-service microservice into the HumanCare platform infrastructure following the same pattern as notification-service and routine-service.

## Service Details
- **Name:** community-service
- **Port:** 8087
- **Database:** MySQL (community_db)
- **Owner:** Mouhib

## Subtasks

- [x] Config Server - Create community-service.yml with default/docker/dev profiles
- [x] Service POM - Add spring-cloud-starter-config dependency
- [x] Service Config - Create application.properties to bootstrap from config server
- [x] API Gateway - Add routes for /api/community/** in all profiles
- [x] Gateway Security - Add security rules for community endpoints
- [x] Docker Compose - Add MySQL (port 3311) and service containers
- [x] Dockerfile - Create multi-stage Dockerfile

## Summary of Changes

| Component | File | Changes |
|-----------|------|---------|
| **Config Server** | `config-server/src/main/resources/config-repo/community-service.yml` | Created with MySQL, port 8087, 3 profiles |
| **Service POM** | `services/community-service/pom.xml` | Added `spring-cloud-starter-config` |
| **Service Bootstrap** | `services/community-service/src/main/resources/application.properties` | Created, deleted old `application.yml` |
| **API Gateway** | `config-server/src/main/resources/config-repo/api-gateway.yml` | Added routes in all 3 profiles |
| **Gateway Security** | `api-gateway/src/main/java/com/humancare/gateway/config/SecurityConfig.java` | Added `/api/community/**` rules |
| **Docker Compose** | `docker-compose.yml` | Added `hc-mysql-community` (3311) + `hc-community-service` (8087) |
| **Dockerfile** | `services/community-service/Dockerfile` | Created multi-stage build |

## Quick Start

```bash
# Start the community service
docker-compose up -d hc-mysql-community hc-community-service

# Verify in Eureka
open http://localhost:8761

# Test via Gateway
curl http://localhost:8081/api/community/health
```

## Progress Log

- [2026-02-23] Task created, subagents spawned
- [2026-02-23] Config Server config created
- [2026-02-23] Service POM updated with config client
- [2026-02-23] API Gateway routes added
- [2026-02-23] Gateway security rules added
- [2026-02-23] Docker Compose updated
- [2026-02-23] Dockerfile created
- [2026-02-23] Task completed

## Notes

- Service already had MySQL connector and Eureka client configured
- Integration follows same pattern as other Java services
