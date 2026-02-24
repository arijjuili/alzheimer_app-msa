# Eureka Server - AI Context

## Overview
Service discovery registry for HumanCare Platform.

## Key Information
- **Port**: 8761
- **Technology**: Netflix Eureka Server (Spring Boot)
- **Dashboard**: http://localhost:8761

## How Services Register
1. Service starts up
2. Reads `eureka.client.service-url.defaultZone`
3. Registers with Eureka
4. Sends heartbeat every 30s

## Important Notes for AI
1. **No config changes usually needed** - This service is pretty static
2. **Self-preservation mode**: If many services go down, Eureka stops expiring instances (prevents mass deregistration during network issues)
3. **Standalone mode**: Does not register with itself

## When to Modify This Service
- Changing eviction intervals
- Enabling peer mode (HA setup)
- Adding custom health checks

## When NOT to Modify This Service
- Adding new services (they register themselves)
- Changing routes (do in Gateway)
- Business logic changes (irrelevant to Eureka)
