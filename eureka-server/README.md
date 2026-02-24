# Eureka Server

Service discovery registry for HumanCare Platform. Eureka Server maintains a registry of all running microservices, enabling dynamic service discovery and load balancing.

## Port
- 8761

## Features
- **Service Registry** - Central registry of all microservices
- **Health Monitoring** - Tracks service health and availability
- **Self-Preservation Mode** - Protects against network partitions
- **REST API** - Query service instances programmatically
- **Dashboard UI** - Web interface for visualizing registered services

---

## API Endpoints

### Eureka REST API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/eureka/apps` | List all registered applications |
| GET | `/eureka/apps/{appName}` | Get instances of a specific app |
| GET | `/eureka/apps/{appName}/{instanceId}` | Get specific instance details |
| POST | `/eureka/apps/{appName}` | Register a new instance |
| DELETE | `/eureka/apps/{appName}/{instanceId}` | Deregister an instance |
| PUT | `/eureka/apps/{appName}/{instanceId}` | Send heartbeat |

### Dashboard & UI
| Endpoint | Description |
|----------|-------------|
| `http://localhost:8761` | Eureka Dashboard (shows all registered services) |
| `/eureka/css/**` | Static CSS resources |
| `/eureka/js/**` | Static JS resources |
| `/eureka/images/**` | Static image resources |

### Actuator
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actuator/health` | Health check endpoint |
| GET | `/actuator/info` | Service information |
| GET | `/actuator/metrics` | Metrics data |

---

## Registered Services

The following services register with Eureka:

| Service Name | Port | Description | Status |
|--------------|------|-------------|--------|
| `CONFIG-SERVER` | 8888 | Configuration Server | ✅ Active |
| `API-GATEWAY` | 8081 | API Gateway | ✅ Active |
| `PATIENT-SERVICE` | 8082 | Patient profiles (Node.js) | ✅ Active |
| `NOTIFICATION-SERVICE` | 8004 | Multi-channel notifications | ✅ Active |
| `SAFETY-ALERT-ENGINE` | 8003 | Risk detection & alerts | ⏳ Planned |
| `EVENT-INGESTION` | 8002 | IoT/camera events | ⏳ Planned |
| `COGNITIVE-MEMORY` | 8005 | Brain training & memory aid | 📝 Planned |
| `DAILY-CARE` | 8006 | Habit & routine management | 📝 Planned |
| `MEDICAL-MANAGEMENT` | 8007 | Appointments & medications | 📝 Planned |
| `CARE-TEAM` | 8008 | Caregiver/Doctor assignments | 📝 Planned |
| `COMMUNITY-SOCIAL` | 8009 | Forum & social activities | 📝 Planned |

---

## How Service Registration Works

### Registration Flow
```
1. Service starts up
2. Reads Eureka URL from config (config-server)
3. Registers itself with Eureka (POST /eureka/apps/{serviceName})
4. Sends heartbeat every 30s (PUT)
5. Eureka marks service as UP
6. Other services can discover it via Eureka client
```

### Service Instance Information
Each registered service provides:

| Field | Description | Example |
|-------|-------------|---------|
| `instanceId` | Unique identifier | `patient-service:8082` |
| `app` | Application name | `PATIENT-SERVICE` |
| `ipAddr` | IP address | `192.168.1.100` |
| `status` | UP, DOWN, STARTING, etc. | `UP` |
| `port` | Service port | `8001` |
| `healthCheckUrl` | Health endpoint | `http://.../actuator/health` |
| `statusPageUrl` | Info endpoint | `http://.../actuator/info` |

---

## Frontend Integration Guide

### What Frontend Needs to Know

> ⚠️ **Note:** Frontend applications should **NOT** call Eureka directly. Use the **API Gateway (port 8081)** instead.

Eureka is purely for backend service-to-service communication. The Gateway handles routing to the appropriate services.

### Service Discovery for Backend Developers

Other microservices use Eureka Client to discover services:

```yaml
# In service's application.yml
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    register-with-eureka: true
    fetch-registry: true
```

Then use service name instead of hardcoded URLs:
```java
// Instead of http://localhost:8082
// Use: http://PATIENT-SERVICE
@FeignClient(name = "PATIENT-SERVICE")
public interface PatientClient {
    // ...
}
```

---

## Build

```bash
# Compile
mvn clean compile

# Run tests
mvn test

# Package
mvn clean package -DskipTests

# Build Docker image
docker build -t humancare/eureka-server:latest .
```

## Run

### Local Development
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Access the dashboard at: http://localhost:8761

### Docker
```bash
docker run -p 8761:8761 \
  -e SPRING_PROFILES_ACTIVE=docker \
  humancare/eureka-server:latest
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Application port | 8761 |
| `SPRING_PROFILES_ACTIVE` | Active profile | dev |
| `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE` | Peer Eureka nodes (for HA) | http://localhost:8761/eureka/ |
| `EUREKA_INSTANCE_HOSTNAME` | Hostname advertised to clients | localhost |
| `EUREKA_SERVER_ENABLE_SELF_PRESERVATION` | Enable self-preservation mode | true |
| `EUREKA_SERVER_EVICTION_INTERVAL_TIMER_IN_MS` | Eviction interval | 60000 |

---

## Configuration Properties

### Eureka Server Settings

```yaml
eureka:
  server:
    # Remove expired instances (ms)
    eviction-interval-timer-in-ms: 60000
    
    # Self-preservation: don't expire instances if too many go down
    enable-self-preservation: true
    
    # Renewal percent threshold for self-preservation
    renewal-percent-threshold: 0.85
    
    # Response cache update interval
    response-cache-update-interval-ms: 30000
  
  client:
    # Don't register Eureka with itself (standalone mode)
    register-with-eureka: false
    fetch-registry: false
    
    # Service URL
    service-url:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
  
  instance:
    hostname: localhost
    prefer-ip-address: true
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     EUREKA SERVER                            │
│                     (Port 8761)                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────┐    ┌──────────────────────────────┐  │
│   │  Service        │    │  In-Memory Registry          │  │
│   │  Registry       │◄──►│  (ConcurrentHashMap)         │  │
│   │  (REST API)     │    │                              │  │
│   └────────┬────────┘    │  App1 -> [Instance1, I2...]  │  │
│            │             │  App2 -> [Instance1, I2...]  │  │
│            ▼             └──────────────────────────────┘  │
│   ┌─────────────────┐                                       │
│   │  Self-Preservation                                      │
│   │  Mode             ──► Protects against network issues   │
│   └─────────────────┘                                       │
│                                                              │
│   Dashboard: http://localhost:8761                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           ▲
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │  Patient │    │   API    │    │  Config  │
   │  Service │    │ Gateway  │    │  Server  │
   └──────────┘    └──────────┘    └──────────┘
   (Heartbeat every 30s)
```

---

## High Availability (Optional)

For production, run multiple Eureka instances in peer mode:

```yaml
# Eureka 1
eureka:
  client:
    service-url:
      defaultZone: http://eureka2:8762/eureka/

# Eureka 2  
eureka:
  client:
    service-url:
      defaultZone: http://eureka1:8761/eureka/
```

---

## Troubleshooting

### Services not appearing in dashboard
- Check service has `eureka.client.register-with-eureka: true`
- Verify Eureka URL is correct
- Check network connectivity between services

### Services shown as DOWN
- Check service health endpoint `/actuator/health`
- Verify service is sending heartbeats
- Check for clock skew between servers

### Self-preservation mode activated
- This is normal during mass service restarts
- Eureka stops expiring instances to prevent false positives
- Will clear automatically when >85% of services renew

---

## Dependencies

- Spring Boot 3.2.2
- Spring Cloud Netflix Eureka Server 2023.0.0
- Spring Cloud Config Client
- Spring Boot Actuator

## License

Copyright © 2025 HumanCare Platform
