# Current Task: Eureka & Service Discovery Improvements

**Status:** IN PROGRESS  
**Started:** 2026-02-22  
**Assigned to:** AI Agent

---

## Objective
Review and improve Eureka service discovery configuration to follow Spring Cloud best practices.

## Findings

### Issues Identified
1. **Missing LoadBalancer dependency** - Required for `lb://` routing but not in pom.xml
2. **Not using lb:// routing** - Gateway uses hardcoded URLs instead of Eureka service discovery
3. **Wrong Keycloak hostname** - Uses `keycloak` instead of `hc-keycloak` in docker profile
4. **Eureka config conflict** - `prefer-ip-address: true` combined with explicit `hostname`

### Services Analysis
- **Java Services:** Should use `lb://SERVICE-NAME` for load balancing
- **Node.js Services:** Use direct container hostnames (no Eureka client)
- **Keycloak:** External service, use direct hostname

## Changes Required

### 1. api-gateway/pom.xml
Add dependency:
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

### 2. config-repo/api-gateway.yml
- Change Java services from `http://service:port` to `lb://SERVICE-NAME`
- Keep Node.js services as `http://hc-service:port`
- Fix Keycloak hostname to `hc-keycloak`

### 3. config-repo/patient-service.yml
- Remove explicit `hostname` from Eureka instance config

## Testing Checklist
- [ ] Gateway starts successfully
- [ ] Services register with Eureka
- [ ] lb:// routing works for Java services
- [ ] Direct routing works for Node.js services
- [ ] Keycloak endpoints accessible through Gateway

---

## Notes
- Java services with Eureka client: notification-service, safety-alert-engine, etc.
- Node.js services without Eureka: patient-service
- Keycloak is external OAuth provider, not a microservice
