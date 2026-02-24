# Keycloak Service

OAuth2/OIDC Identity Provider for HumanCare Platform.

## Overview

- **Version**: Keycloak 22.0.5
- **Port**: 8090 (host)
- **Database**: PostgreSQL 15 (container: hc-postgres-keycloak)
- **Admin Console**: http://localhost:8090/admin

## Quick Start

> ⚠️ **Use the root docker-compose.yml** - This service is managed by the centralized compose at project root.

```bash
# From project root
docker-compose up -d hc-keycloak

# Or start full stack
docker-compose up -d
```

## Admin Access

- **URL**: http://localhost:8090/admin
- **Username**: `admin`
- **Password**: `admin`

## Pre-configured Realm: "humancare"

### Roles
| Role | Description |
|------|-------------|
| `PATIENT` | Patient user with access to own profile |
| `CAREGIVER` | Caregiver with access to assigned patients |
| `DOCTOR` | Doctor with full medical access |
| `ADMIN` | System administrator with full access |

### Clients
| Client ID | Type | Description |
|-----------|------|-------------|
| `humancare-webapp` | Public | Angular web app for patients/caregivers |
| `humancare-admin` | Public | Admin dashboard |
| `humancare-gateway` | Confidential | API Gateway service account |

### Pre-configured User
| Username | Password | Role |
|----------|----------|------|
| `admin` | `Admin123!` | ADMIN |

## Realm Configuration

The realm is imported from `realm-config/humancare-realm.json` on first startup.

To update the realm:
1. Make changes in Keycloak Admin Console
2. Export: `docker exec hc-keycloak /opt/keycloak/bin/kc.sh export --realm humancare --file /tmp/humancare-realm.json`
3. Copy: `docker cp hc-keycloak:/tmp/humancare-realm.json ./realm-config/`

## Security Notes

⚠️ **Development Only** - These credentials are for local development:
- Change default passwords in production
- Use proper secrets management (K8s Secrets, Vault)
- Enable HTTPS in production
- Update client secrets

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /realms/humancare/.well-known/openid-configuration` | OIDC Discovery |
| `POST /realms/humancare/protocol/openid-connect/token` | Token endpoint |
| `GET /realms/humancare/protocol/openid-connect/certs` | JWKS (public keys) |
| `GET /admin/realms/humancare/users` | Admin API - List users |

## Integration with Patient Service

Patient Service manages patient profiles and links to Keycloak users:

1. Patient profile created in Patient Service (Node.js)
2. Store Keycloak user ID (`keycloakId`) in patient entity
3. User managed in Keycloak (roles, credentials)
4. Patient Service validates tokens via Keycloak public keys

## Health Check

```bash
# Check if Keycloak is ready
curl http://localhost:8090/health/ready

# Check realm is accessible
curl http://localhost:8090/realms/humancare/.well-known/openid-configuration
```
