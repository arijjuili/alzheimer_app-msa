# Config Server - AI Context

## Overview
Centralized configuration management for HumanCare Platform.

## Key Information
- **Port**: 8888
- **Technology**: Spring Cloud Config Server
- **Storage**: File system (native profile) - `./src/main/resources/config-repo/`

## Config Files Location
```
src/main/resources/config-repo/
├── application.yml              # Shared config for ALL services
├── api-gateway.yml              # Gateway routes & security
├── patient-service.yml          # Patient service config
├── eureka-server.yml            # Eureka settings
└── [future services].yml        # Add new service configs here
```

## Important Notes for AI
1. **Profile-based configs**: Services request config via `/{app}/{profile}`
2. **Native profile**: Uses filesystem (good for local dev)
3. **Config hierarchy**: `application.yml` → `{service}.yml` → `{service}-{profile}.yml`
4. **Password protection**: Config endpoints use HTTP Basic Auth (config/config123)

## When to Modify This Service
- Adding new service configuration files
- Changing shared properties (affects ALL services)
- Updating CORS settings (in api-gateway.yml)
- Adding new routes to Gateway

## When NOT to Modify This Service
- Individual service business logic (change the service, not config)
- Database schemas (change in respective services)
- API endpoints (change in respective services)
