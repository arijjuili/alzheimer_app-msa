# Config Server

Centralized configuration management for HumanCare Platform. Config Server provides externalized configuration properties to all microservices, enabling dynamic updates without redeployment.

## Port
- 8888

## Features
- **Centralized Configuration** - Single source of truth for all service configs
- **Profile-Based Configs** - Different configs for dev, test, production
- **File System Backend** - Native filesystem storage for local development
- **Git Backend Support** - Ready for Git-based config (production)
- **Dynamic Refresh** - Services can refresh config without restart (via Actuator)
- **Environment Encryption** - Encrypt sensitive properties (optional)

---

## API Endpoints

### Configuration Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/{application}/{profile}` | Get config for app+profile |
| GET | `/{application}/{profile}/{label}` | Get config with Git label |
| GET | `/encrypt` | Encrypt a value (POST body) |
| GET | `/decrypt` | Decrypt a value (POST body) |

### Configuration URL Pattern
```
http://localhost:8888/{application-name}/{profile}/{label}

Examples:
- http://localhost:8888/patient-service/dev
- http://localhost:8888/api-gateway/docker
- http://localhost:8888/application/default
```

### Response Format
```json
{
  "name": "patient-service",
  "profiles": ["docker"],
  "label": null,
  "version": null,
  "propertySources": [
    {
      "name": "file:/config-repo/patient-service.yml",
      "source": {
        "server.port": 8082,
        "spring.application.name": "patient-service"
      }
    },
    {
      "name": "file:/config-repo/application.yml",
      "source": {
        "logging.level.root": "INFO"
      }
    }
  ]
}
```

### Actuator
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actuator/health` | Health check endpoint |
| GET | `/actuator/info` | Service information |
| GET | `/actuator/metrics` | Metrics data |
| POST | `/actuator/refresh` | Refresh configuration (for clients) |

---

## Configuration Repository Structure

```
config-repo/
├── application.yml          # Shared config for ALL services
├── eureka-server.yml        # Eureka specific config
├── api-gateway.yml          # Gateway routing & security config
├── patient-service.yml      # Patient service config
├── notification-service.yml # Notification service config
└── safety-alert-engine.yml  # Safety alert engine config
```

### Configuration Hierarchy
Properties are resolved in this order (later overrides earlier):

```
1. application.yml (default, shared by all)
        ↓
2. {service-name}.yml (service-specific)
        ↓
3. {service-name}-{profile}.yml (profile-specific)
        ↓
4. Command-line arguments
        ↓
5. Local application.yml (in service's resources)
```

---

## Current Configurations

### application.yml (Shared)
Common settings for all services:
- Jackson JSON serialization settings
- Management/Actuator endpoint configuration
- Logging patterns

### api-gateway.yml
- **Route definitions** - All microservice routes
- **CORS configuration** - Frontend origins (localhost:4200, 4201)
- **OAuth2/JWT** - Keycloak integration
- **Retry filters** - For resilient routing

### patient-service.yml
- PostgreSQL database connection
- Server port: 8082

### notification-service.yml
- MongoDB connection
- RabbitMQ consumer settings
- Scheduler configuration
- Server port: 8004

### eureka-server.yml
- Self-preservation settings
- Server port: 8761

### safety-alert-engine.yml
- PostgreSQL database connection
- RabbitMQ producer settings
- Drools rules configuration
- Server port: 8003

---

## Frontend Integration Guide

### What Frontend Needs to Know

> ⚠️ **Note:** Frontend applications should **NOT** call Config Server directly.

Configuration is managed server-side only. The Gateway Service routes requests to appropriate backend services which have their own configurations.

### How Services Get Config

```yaml
# In each microservice's bootstrap.yml
spring:
  application:
    name: patient-service  # Used to fetch patient-service.yml
  config:
    import: "optional:configserver:http://localhost:8888"
```

On startup, the service:
1. Contacts Config Server at `http://localhost:8888`
2. Requests config for `{application-name}/{profile}`
3. Merges with local `application.yml`
4. Starts with resolved configuration

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
docker build -t humancare/config-server:latest .
```

## Run

### Local Development
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=native
```

The `native` profile activates file system backend.

### Docker
```bash
docker run -p 8888:8888 \
  -e SPRING_PROFILES_ACTIVE=native \
  -v $(pwd)/config-repo:/config-repo:ro \
  humancare/config-server:latest
```

Note: Volume mount is required for Docker to access config files.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Application port | 8888 |
| `SPRING_PROFILES_ACTIVE` | Active profile | `native` |
| `SPRING_CLOUD_CONFIG_SERVER_NATIVE_SEARCH_LOCATIONS` | Config file location | `file:/config-repo` |
| `CONFIG_SERVER_USERNAME` | HTTP Basic Auth username | `config` |
| `CONFIG_SERVER_PASSWORD` | HTTP Basic Auth password | `config123` |
| `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE` | Eureka server URL | `http://localhost:8761/eureka/` |

---

## Changing Configurations

### Local Development

1. Edit file in `config-server/src/main/resources/config-repo/`
2. Restart config-server (file system backend)
3. Services need restart to pick up new config

Or use `/actuator/refresh` on client services (if Spring Cloud Bus not configured):
```bash
curl -X POST http://localhost:8082/actuator/refresh
```

### Production (Git Backend)

Uncomment in `application.yml`:
```yaml
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/humancare/config-repo
          default-label: main
          search-paths: '{application}'
```

Then:
1. Commit config changes to Git
2. Services automatically refresh (with Spring Cloud Bus + Webhooks)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONFIG SERVER                                │
│                     (Port 8888)                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │  REST API       │    │  Native File System Backend         │ │
│  │  /{app}/{profile}◄────┤  config-repo/*.yml                  │ │
│  └────────┬────────┘    └─────────────────────────────────────┘ │
│           │                                                      │
│           │    ┌─────────────────────────────────────┐          │
│           └───►│  Git Backend (Production)           │          │
│                │  github.com/alzcare/config-repo     │          │
│                └─────────────────────────────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
    │ Patient │          │  API    │          │ Notification│
    │ Service │          │ Gateway │          │ Service     │
    └─────────┘          └─────────┘          └─────────────┘
   
   Startup: Fetch config via:
   http://localhost:8888/{service-name}/{profile}
```

---

## Startup Order Dependency

Config Server must start **before** other services:

```
Startup Order:
1. Eureka Server (8761)
2. Config Server (8888)  ◄── YOU ARE HERE
3. RabbitMQ (5672)
4. Keycloak (8090)
5. All microservices
6. API Gateway (8081)
```

If services start before Config Server:
- They'll fail to fetch config
- With `optional:` prefix, they fall back to local config
- Without `optional:`, they fail to start

---

## Troubleshooting

### Services can't connect to Config Server
- Verify Config Server is running: `curl http://localhost:8888/actuator/health`
- Check firewall/network settings
- Verify `spring.config.import` URL is correct

### Config changes not reflected
- File system backend requires Config Server restart
- Use `/actuator/refresh` on client services
- Or enable Spring Cloud Bus for automatic refresh

### "Could not locate PropertySource" error
- Check config file exists: `{service-name}.yml`
- Verify `spring.application.name` matches filename
- Check profile name is correct

---

## Dependencies

- Spring Boot 3.2.2
- Spring Cloud Config Server 2023.0.0
- Spring Cloud Netflix Eureka Client
- Spring Security (for endpoint protection)
- Spring Boot Actuator

## License

Copyright © 2025 HumanCare Platform
