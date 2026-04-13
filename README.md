# 🏥 HumanCare - Alzheimer Guardians Platform

> Microservices-based platform for Alzheimer patient support with focus on **infrastructure & architecture** over business logic.

---

## 📋 Overview

**Project Type**: Academic Microservices Project  
**Team Size**: 6 members  
**Focus**: Complete infrastructure demonstration with minimal business logic

This project demonstrates enterprise-grade microservices patterns:
- **7 Business Microservices** (one per team member)
- **4 Infrastructure Services** (shared)
- **Database Per Service** pattern
- **Event-Driven Architecture** with RabbitMQ
- **OAuth2/JWT Security** via Keycloak

---

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────────────┐
│   Angular   │────►│   Gateway   │────►│  Patient  │ Medication │ Check-in  │
│  (Port 4200)│     │  (Port 8081)│     │  (8082)   │  (8083)    │  (8084)   │
└─────────────┘     └─────────────┘     ├─────────────────────────────────────┤
                                               │ Appointment │ Routines    │
                                               │  (8085)     │  (8089)     │
                                        ├─────────────────────────────────────┤
                                        │ Community (8087) │ Notification   │
                                        │                  │ (8088)         │
                                        ├─────────────────────────────────────┤
                                        │ Memory (8086)    │                │
                                        └─────────────────────────────────────┘
                                        
Infrastructure: Eureka (8761) │ Config (8888) │ Keycloak (8090) │ RabbitMQ (5673)
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 18 |
| Gateway | Spring Cloud Gateway |
| Services | Spring Boot 3.2.2 (Java) / Node.js + Express |
| Security | Keycloak (OAuth2/OIDC) |
| Messaging | RabbitMQ |
| Databases | PostgreSQL, MySQL, MongoDB, H2 |
| Discovery | Netflix Eureka |
| Config | Spring Cloud Config |

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Java 17+ (for Java services)
- Node.js 18+ (for Patient service)
- Angular CLI (for frontend)

### 1. Start Infrastructure

```bash
# Start all infrastructure services
docker-compose up -d

# Or start only infrastructure (without business services)
docker-compose up -d hc-eureka-server hc-config-server hc-rabbitmq hc-postgres-keycloak hc-keycloak hc-api-gateway
```

### 2. Verify Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Eureka Dashboard | http://localhost:8761 | - |
| Config Server | http://localhost:8888 | config / config123 |
| RabbitMQ Management | http://localhost:15673 | humancare / humancare123 |
| Keycloak Admin | http://localhost:8090/admin | admin / admin |
| API Gateway | http://localhost:8081 | - |

### 3. Start Business Services

Each service can be started independently:

```bash
# Java service example
cd medication-service
./mvnw spring-boot:run

# Node.js service example
cd patient-service
npm install
npm start
```

### 4. Start Frontend

```bash
cd frontend/humancare-ui
npm install
ng serve
```

### Frontend Features
- **Notification System**: Real-time notification bell with unread count, notification dialog, and full notifications page

---

## 📁 Project Structure

```
HumanCare/
├── AGENTS.md                 ← AI assistant context (read first)
├── README.md                 ← This file
├── REFERENCE.md              ← Architecture & coding standards
├── docker-compose.yml        ← Full stack orchestration
│
├── config-server/            ← Centralized configuration
│   └── src/main/resources/config-repo/
│       ├── application.yml
│       ├── api-gateway.yml
│       └── ...
│
├── eureka-server/            ← Service discovery
├── api-gateway/              ← API Gateway
├── keycloak-service/         ← OAuth2/OIDC provider
│   └── realm-config/
│       └── humancare-realm.json
│
└── services/
    ├── patient-service/      ← Node.js (Salma)
    ├── medication-service/   ← Java (Yosser)
    ├── daily-checkin-service/      ← Java (Iheb)
    ├── appointment-service/  ← Java (Roudayna)
    ├── routine-service/      ← Java (Arij)
    ├── community-service/    ← Java (Mouhib)
    ├── notification-service/ ← Java (Shared)
    └── memory-service/       ← Java (Shared)
```

---

## 👥 Team Assignments

| Service | Owner | Technology | Port | Database |
|---------|-------|------------|------|----------|
| Patient Profile | Shared | Node.js + Express | 8082 | PostgreSQL |
| Medication | Yosser | Java Spring Boot | 8083 | MySQL |
| Daily Check-in | Iheb | Java Spring Boot | 8084 | H2 |
| Appointments | Roudayna | Java Spring Boot | 8085 | MySQL |
| Routines & Habits | Arij | Java Spring Boot | 8089 | H2 |
| Community Wall | Mouhib | Java Spring Boot | 8087 | MySQL |
| **Notifications** | Salma | Java Spring Boot | 8088 | MongoDB |
| **Memory** | Shared | Java Spring Boot | 8086 | H2 |

---

## ✨ Features

| Feature | Status | Description |
|---------|--------|-------------|
| Inter-service communication via OpenFeign | ✅ | 5 synchronous scenarios across medication, community, routine, and notification services |
| Event-driven architecture with RabbitMQ | ✅ | 5 asynchronous event types (medication, appointment, community, routine) |
| Automatic appointment reminder notifications | ✅ | Scheduled reminders for upcoming appointments (next 7 days) |
| Real-time notification system in frontend | ✅ | Notification bell, unread count, and full notifications page |

---

## 🔐 Security

### Keycloak Realm
- **Realm**: `humancare`
- **Roles**: PATIENT, CAREGIVER, DOCTOR, ADMIN

### JWT Flow
1. User logs in via Keycloak
2. Keycloak returns JWT token
3. Angular includes token in API requests
4. Gateway validates token
5. Request routed to appropriate service

---

## 📡 Inter-Service Communication

### Synchronous (REST)
```
Angular → Gateway → Service → Database
```

### Asynchronous (Events via RabbitMQ)
| Event | Publisher | Consumer | Queue |
|-------|-----------|----------|-------|
| MedicationTaken | Medication Service | Notification Service | notifications.medication.taken |
| MedicationMissed | Medication Service | Notification Service | notifications.medication.missed |
| AppointmentBooked | Appointment Service | Notification Service | notifications.appointments |
| NewPostCreated | Community Service | Notification Service | notifications.community |
| RoutineCompleted | Routine Service | Notification Service | notifications.routine |

### Synchronous (OpenFeign)
| Client Service | Target Service | Purpose |
|----------------|----------------|---------|
| Notification Service | Appointments Service | Fetch upcoming appointments for reminders |
| Notification Service | Patient Service | Resolve patient DB ID to Keycloak ID |
| Medication Service | Patient Service | Validate patient existence on plan creation |
| Community Service | Patient Service | Enrich post author details |
| Routine Service | Patient Service | Validate patient existence on routine creation |

### API Endpoints

#### Notification Service Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications/my` | GET | Get user's notifications |
| `/api/notifications/unread-count` | GET | Get unread notification count |
| `/api/notifications/{id}/read` | PATCH | Mark notification as read |
| `/api/notifications/read-all` | PATCH | Mark all as read |

#### Appointment Service Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/appointments/upcoming` | GET | Get appointments (next 7 days) |

## Microservices Communication

### Synchronous (OpenFeign)
- **Notification Service → Appointments Service**: Fetches upcoming appointments every 5 minutes to create reminder notifications

### Asynchronous (Future)
- Event-driven architecture with message broker (planned)

---

## 🐳 Docker Notes

### Port Conflicts
HumanCare uses different ports than your existing AlzCare cluster:
- Gateway: **8081** (was 8080)
- RabbitMQ: **5673/15673** (was 5672/15672)
- PostgreSQL: **5434/5435** (was 5432/5439)

### Container Prefix
All HumanCare containers are prefixed with `hc-` to avoid conflicts.

### Useful Commands
```bash
# View HumanCare containers only
docker ps --filter "name=hc-"

# Stop HumanCare containers
docker stop $(docker ps -q --filter "name=hc-")

# View gateway logs
docker logs -f hc-api-gateway
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `AGENTS.md` | AI assistant context & task tracking |
| `REFERENCE.md` | Detailed architecture & coding standards |
| `README.md` | This file - overview & quick start |

---

## ✅ Success Criteria (For Teacher)

- ✅ 7 microservices running independently
- ✅ 3 infrastructure services (Eureka, Config, Gateway)
- ✅ Service discovery - No hardcoded URLs
- ✅ Centralized config - Externalized configuration
- ✅ API Gateway - Single entry point, auth filtering
- ✅ Event-driven - RabbitMQ for async communication
- ✅ Security - JWT tokens, role-based access
- ✅ Database per service - Different DB technologies
- ✅ Docker - All services containerized
- ✅ Frontend - Angular consuming all APIs

---

*Last updated: 2026-02-23*
