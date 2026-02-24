# Keycloak Service - AI Context

## Overview
OAuth2/OIDC Identity Provider for HumanCare Platform.

## Key Information
- **Port**: 8090
- **Version**: Keycloak 22.0.5
- **Admin Console**: http://localhost:8090/admin
- **Admin Credentials**: admin / admin

## Pre-configured Realm: "humancare"

### Roles
| Role | Description |
|------|-------------|
| PATIENT | Patient user |
| CAREGIVER | Family caregiver |
| DOCTOR | Medical professional |
| ADMIN | System administrator |

### Clients
| Client | Type | Purpose |
|--------|------|---------|
| humancare-webapp | Public | Angular frontend |
| humancare-admin | Public | Admin dashboard |
| humancare-gateway | Confidential | Gateway token validation |

## Realm Configuration Location
```
keycloak-service/realm-config/humancare-realm.json
```

## Token Endpoint
```
POST http://localhost:8090/realms/humancare/protocol/openid-connect/token
```

## When to Modify This Service
- Adding new realm roles
- Configuring new clients
- Changing token settings (expiry, etc.)
- Custom user attributes

## When NOT to Modify This Service
- User data (manage via Patient Service or Admin Console)
- Application logic (Keycloak is just the IDP)

## Export/Import Realm
```bash
# Export (after making changes in UI)
docker exec keycloak /opt/keycloak/bin/kc.sh export --realm humancare --file /tmp/humancare-realm.json
docker cp keycloak:/tmp/humancare-realm.json ./realm-config/
```
