# API Gateway - AI Context

## Overview
Spring Cloud Gateway - Single entry point for all API requests.

## Key Information
- **Port**: 8081
- **Technology**: Spring Cloud Gateway
- **Base URL for Frontend**: `http://localhost:8081`

## Current Routes (from Config Server)
| Route ID | Path Pattern | Destination |
|----------|-------------|-------------|
| patient-service | `/api/v1/patients/**`, `/api/v1/audit/**` | Patient Service (8082) |
| keycloak | `/realms/**`, `/resources/**` | Keycloak (8090) |

## Adding New Routes

Routes are configured in: `config-server/src/main/resources/config-repo/api-gateway.yml`

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: medication-service
          uri: lb://MEDICATION-SERVICE
          predicates:
            - Path=/api/v1/medications/**
          filters:
            - StripPrefix=0
            - name: Retry
              args:
                retries: 3
                statuses: BAD_GATEWAY,SERVICE_UNAVAILABLE
```

## Security
- JWT validation against Keycloak
- Role-based access control
- CORS configured for Angular (localhost:4200)

## When to Modify This Service
- Adding new filters (logging, rate limiting)
- Custom authentication logic
- Advanced routing rules

## When NOT to Modify This Service
- Route definitions (change in Config Server)
- Individual service logic
- Database queries
