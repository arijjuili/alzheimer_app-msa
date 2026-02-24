# Task: Add Eureka Registration to Patient Service

## Objective
Enable Eureka service registration for the Node.js patient-service microservice.

## Status: ✅ COMPLETED

---

## Changes Made

### 1. Created Eureka Client Config
**File:** `services/patient-service/src/config/eureka.js`

Created a complete Eureka client configuration using `eureka-js-client`:
- Configured instance metadata (app name, hostname, ports)
- Stable instance ID: `${HOSTNAME}:${PORT}` format
- Fixed `ipAddr` to use `'127.0.0.1'` (Eureka requires IP, not hostname)
- Helper functions for start/stop registration
- Graceful error handling

**Key Configuration:**
```javascript
instance: {
  instanceId: `${HOSTNAME}:${PORT}`,  // Stable ID prevents register/cancel loop
  app: 'patient-service',
  hostName: HOSTNAME,                  // hc-patient-service in Docker
  ipAddr: '127.0.0.1',                 // Required by Eureka
  port: { '$': PORT, '@enabled': 'true' },
  vipAddress: 'patient-service',
  dataCenterInfo: { '@class': '...', name: 'MyOwn' },
  leaseInfo: { renewalIntervalInSecs: 30, durationInSecs: 90 },
}
```

### 2. Updated Server Startup
**File:** `services/patient-service/server.js`

- Integrated Eureka registration on server start
- Added graceful shutdown handlers (SIGINT, SIGTERM)
- Deregisters from Eureka on shutdown
- Non-blocking error handling (service works even if Eureka is down)

### 3. Updated API Gateway Routing
**File:** `config-server/src/main/resources/config-repo/api-gateway.yml`

Docker Profile:
- Changed from: `uri: http://hc-patient-service:8082`
- Changed to: `uri: lb://patient-service`
- Fixed YAML structure (avoided duplicate `cloud:` keys)
- Added LoadBalancer configuration (Ribbon disabled)

Local Profile (unchanged):
- Still uses: `uri: http://localhost:8082`

### 4. Updated Docker Compose
**File:** `docker-compose.yml`

- Added `HOSTNAME: hc-patient-service` environment variable
- Ensures consistent container naming with `hc-` prefix
- Eureka env vars already present: `EUREKA_HOST`, `EUREKA_PORT`

---

## Issues Encountered & Fixed

### Issue 1: Missing `debug` method in logger
**Error:** `TypeError: _this.logger.debug is not a function`
**Fix:** Added `debug` method to logger configuration.

### Issue 2: Duplicate `spring:` sections in YAML
**Error:** `Could not resolve placeholder 'spring.security.oauth2.resourceserver.jwt.jwk-set-uri'`
**Fix:** Merged duplicate `cloud:` sections under single `spring:` section.

### Issue 3: Accessing `instanceId` before available
**Error:** `TypeError: Cannot read properties of undefined (reading 'instanceId')`
**Fix:** Removed access to `client.instance.instanceId`, used config values instead.

### Issue 4: Register/Cancel Loop
**Error:** Service registered then immediately cancelled repeatedly
**Fix:** 
- Set explicit `instanceId` to stable value (`${HOSTNAME}:${PORT}`)
- Changed `ipAddr` from hostname to `'127.0.0.1'`
- Eureka requires IP address for `ipAddr`, not hostname

---

## Naming Convention Compliance

| Item | Naming | Status |
|------|--------|--------|
| Container | `hc-patient-service` | ✅ |
| Eureka App | `PATIENT-SERVICE` | ✅ |
| Instance ID | `hc-patient-service:8082` | ✅ |
| Gateway Route | `lb://patient-service` | ✅ |
| Container Prefix | `hc-` | ✅ |

---

## Verification

### Eureka Dashboard
- Open http://localhost:8761
- Verify `PATIENT-SERVICE` appears in registered services
- Instance ID should show: `hc-patient-service:8082`

### Gateway Routing
```bash
curl http://localhost:8081/api/v1/patients/health
```

### Service Logs
```bash
docker-compose logs hc-patient-service | grep Eureka
```
Expected output:
```
[Eureka] Registering with hc-eureka-server:8761
[Eureka] Instance: hc-patient-service:8082
[Eureka] Registered successfully
```

---

## Files Modified

| File | Change Type | Lines Changed |
|------|-------------|---------------|
| `services/patient-service/src/config/eureka.js` | Created | ~70 lines |
| `services/patient-service/server.js` | Modified | +10 lines |
| `config-server/src/main/resources/config-repo/api-gateway.yml` | Modified | ~5 lines |
| `docker-compose.yml` | Modified | +1 line |

---

## Next Steps (Optional)

- Apply same pattern to other Node.js services if added
- Consider adding service discovery for local development profile
- Monitor Eureka registration health in production
