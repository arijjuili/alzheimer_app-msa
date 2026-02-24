# HumanCare Platform - Agent Context

> **What:** Healthcare microservices platform (school project)  
> **Stack:** Spring Cloud (Gateway, Eureka, Config) + Node.js + Keycloak + PostgreSQL  
> **Goal:** Patient/caregiver management system with role-based access

---

## 📚 Files to Read (If Needed)

| File | When to Read |
|------|--------------|
| `README.md` (root) | Project overview, setup instructions |
| `REFERENCE.md` | Detailed reference, troubleshooting |
| `docker-compose.yml` | Service definitions, ports, environment |
| `api-gateway/README.md` | Gateway routes, auth, API integration |
| `keycloak-service/README.md` | Keycloak setup, realm config, users |
| `services/*/README.md` | Service-specific docs |

---

## 🚀 Quick Start

```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f hc-api-gateway
```

**URLs:**
- Gateway: http://localhost:8081
- Eureka: http://localhost:8761
- Keycloak Admin: http://localhost:8090/admin (admin/admin)

**Auth Flow:**
- **Login:** Keycloak login page → Dashboard (on success)
- **Logout:** Keycloak logout → Landing page (session terminated)
- **Register:** `/auth/register` (public) → Login page (on success)

**Public Endpoints (No Auth Required):**
- `/actuator/**`, `/health` - Health checks
- `/realms/**` - Keycloak endpoints
- `/auth/**` - Registration & auth endpoints

**Notification Endpoints (Auth Required):**
- `GET /api/notifications/my` - Get my notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/{id}/read` - Mark as read

---

## 🏗️ Architecture

```
Angular (4200) → Gateway (8081) → Services
                          ↓
                    Keycloak (8090) - OAuth2/JWT
```

**Core Services:**
| Service | Type | Port | Eureka |
|---------|------|------|--------|
| api-gateway | Java/Gateway | 8081 | Client |
| eureka-server | Java/Registry | 8761 | Server |
| config-server | Java/Config | 8888 | Client |
| patient-service | Node.js/Express | 8082 | ❌ |
| **appointments-service** | **Java/Spring** | **8085** | **Client** |
| **notification-service** | **Java/Spring** | **8088** | **Client** |

---

## 📝 Working Conventions

### Container Naming
**Always use `hc-` prefix** to avoid conflicts:
- ✅ `hc-eureka-server`, `hc-keycloak`, `hc-patient-service`
- ❌ `eureka-server` (conflicts with other projects)

### Routing Strategy

| Service Type | Gateway URI | Example |
|-------------|-------------|---------|
| Java + Eureka | `lb://SERVICE-NAME` | `lb://notification-service` |
| Node.js (no Eureka) | `http://hc-service:port` | `http://hc-patient-service:8082` |
| External | `http://host:port` | `http://hc-keycloak:8080` |
| notification-service (Java + Eureka) | `lb://notification-service` | Used by frontend for notifications |

### Config Location
All service configs in **Config Server** (`config-server/src/main/resources/config-repo/`)

---

## 🔗 Inter-Service Communication

### OpenFeign Integration
The platform uses **Spring Cloud OpenFeign** for synchronous inter-service communication:

| Client Service | Provider Service | Purpose |
|----------------|------------------|---------|
| notification-service | appointments-service | Fetch upcoming appointments for reminders |

### Appointment Reminder Flow
```
Notification Service (Scheduler)
        │ Every 5 mins
        ▼
Feign Client: GET lb://appointments-service/api/appointments/upcoming
        │
        ▼
Appointments Service → Returns appointments (next 7 days, status=SCHEDULED)
        │
        ▼
Notification Service → Creates REMINDER notifications
```

### Feign Client Configuration
```java
@FeignClient(name = "appointments-service")
public interface AppointmentClient {
    @GetMapping("/api/appointments/upcoming")
    List<AppointmentDto> getUpcomingAppointments();
}
```

**Note:** When using Eureka service discovery, use only the `name` attribute (not `url`). The LoadBalancer will resolve `appointments-service` to the actual instance.

### Scheduler Configuration
```java
@Scheduled(fixedRate = 300000)  // 5 minutes
public void checkUpcomingAppointments() {
    // Fetch and create reminders
}
```

---

## 🔐 Auth & Roles

Keycloak realm: `humancare`

| Role | Access |
|------|--------|
| PATIENT | Own data only |
| CAREGIVER | Assigned patients |
| DOCTOR | All patients |
| ADMIN | Everything |

**Login:**
```http
POST /realms/humancare/protocol/openid-connect/token
grant_type=password&client_id=humancare-webapp&username=...&password=...
```

---

## 📋 Task Workflow (IMPORTANT)

### 1. Start New Task
- **Write task details to:** `tasks/current/TASK_NAME.md`
- **Update:** `tasks/current/current-task.md` with task name and status

### 2. During Work
- Document progress in current task file
- Note any issues, decisions, blockers

### 3. When Done → ASK USER
```
"Task complete. Archive to tasks/archive/? [Yes/No]"
```

### 4. If Yes → Archive
- Move `tasks/current/TASK_NAME.md` to `tasks/archive/`
- Keep `current-task.md` updated with status

---

## 📂 Task Locations

| Location | Purpose |
|----------|---------|
| `tasks/current/current-task.md` | Active task + project status |
| `tasks/current/*.md` | In-progress task details |
| `tasks/archive/*.md` | Completed task history |

---

## ⚠️ Important Notes

1. **Only use root docker-compose.yml** - No nested compose files
2. **LoadBalancer required** for `lb://` routing
3. **Mixed stack** - Java uses Eureka, Node.js uses direct DNS
4. **Port conflicts avoided** - `hc-` prefixes, custom ports vs AlzCare
5. **Registration role assignment** - Backend removes default PATIENT role before assigning selected role (users get only their chosen role)
