# Task Archive: User Management & Eureka Best Practices

**Status:** COMPLETED  
**Started:** 2026-02-22  
**Completed:** 2026-02-22  

---

## Part 1: User Management Architecture Review

### Objective
Understand how users are handled backend-wise (login, signup, roles, tokens).

### Findings

#### Keycloak Configuration
- **Version:** 22.0.5
- **Port:** 8090
- **Realm:** `humancare`
- **Database:** PostgreSQL 15 (port 5435)

#### Roles
| Role | Description |
|------|-------------|
| `PATIENT` | Patient user with access to own profile |
| `CAREGIVER` | Caregiver with access to assigned patients |
| `DOCTOR` | Doctor with full medical access |
| `ADMIN` | System administrator with full platform access |

#### Clients
| Client ID | Type | Purpose |
|-----------|------|---------|
| `humancare-webapp` | Public | Angular web app (port 4200) |
| `humancare-admin` | Public | Admin dashboard (port 4201) |
| `humancare-gateway` | Confidential | API Gateway service account |

#### Token Flow
```
POST /realms/humancare/protocol/openid-connect/token
grant_type=password&client_id=humancare-webapp&username=...&password=...
```

#### User Signup Flow
1. User created in Keycloak (Admin API or Registration)
2. Patient profile created in Patient Service with `keycloakId`
3. Roles assigned in Keycloak
4. JWT tokens used for authentication

### Cleanup
- **Removed:** Redundant `keycloak-service/docker-compose.yml`
- **Updated:** `keycloak-service/README.md` with correct container names

---

## Part 2: Eureka Best Practices Implementation

### Objective
Fix Eureka service discovery configuration following Spring Cloud best practices.

### Issues Fixed

| Issue | Before | After |
|-------|--------|-------|
| Missing LoadBalancer | Not in pom.xml | Added `spring-cloud-starter-loadbalancer` |
| No lb:// routing | Hardcoded `http://service:port` | `lb://SERVICE-NAME` for Java services |
| Wrong Keycloak hostname | `http://keycloak:8080` | `http://hc-keycloak:8080` |
| Eureka config conflict | `prefer-ip-address: true` + `hostname` | Only `prefer-ip-address: true` |

### Routing Strategy Established

| Service Type | Eureka | Gateway URI |
|-------------|--------|-------------|
| Java/Spring Boot | ✅ Yes | `lb://SERVICE-NAME` |
| Node.js | ❌ No | `http://hc-service-name:port` |
| External (Keycloak) | N/A | `http://hc-keycloak:8080` |

### Files Modified
```
api-gateway/pom.xml                                    (+ LoadBalancer dependency)
config-server/src/main/resources/config-repo/api-gateway.yml     (lb:// routing)
config-server/src/main/resources/config-repo/patient-service.yml (Eureka config)
keycloak-service/README.md                             (container names)
keycloak-service/docker-compose.yml                    (DELETED)
```

### Testing
- [x] Gateway starts successfully
- [x] Services register with Eureka
- [x] lb:// routing configured for Java services
- [x] Direct routing configured for Node.js services
- [x] Keycloak endpoints accessible

---

## Key Learnings

1. **LoadBalancer is required** for `lb://` routing in Spring Cloud Gateway
2. **Mixed architecture** (Java + Node.js) requires different routing strategies
3. **Container naming** with `hc-` prefix prevents conflicts with other projects
4. **Eureka config** - don't mix `prefer-ip-address: true` with explicit `hostname`

---

## Related Documentation
- `api-gateway/README.md` - Updated routing documentation
- `keycloak-service/README.md` - Updated setup instructions
