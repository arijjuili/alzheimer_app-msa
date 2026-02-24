Based on my analysis of the codebase, here's the current authentication flow:

## 🔐 Authentication Flow Summary

### **Direct Keycloak ↔ Frontend (for Login/Logout)**

The **login and logout** flow is **purely between the Frontend and Keycloak** - it does NOT go through the patient service:

```
Frontend (Angular) → Keycloak (port 8090)
   ↓                        ↓
keycloak.service.ts    Direct OIDC flow
auth.service.ts        Login/logout pages
```

**Key files:**
- `frontend/humancare-ui/src/app/core/keycloak/keycloak.service.ts` - Direct Keycloak-JS integration
- `frontend/humancare-ui/src/app/core/auth/auth.service.ts` - Thin wrapper around Keycloak service
- `frontend/humancare-ui/src/environments/environment.ts` - Keycloak config (`http://localhost:8090`)

The frontend connects **directly** to Keycloak at `http://localhost:8090` using the `keycloak-js` library.

---

### **Patient Service Only Handles Registration**

The **only** auth-related endpoint that goes through the patient service is **user registration**:

```
Frontend → API Gateway → Patient Service → Keycloak Admin API
POST /auth/register           (Node.js)      (creates user)
```

**Key files:**
- `services/patient-service/src/routes/auth.js` - Only has `/register` and `/roles` endpoints
- `services/patient-service/src/controllers/authController.js` - Uses Keycloak Admin API to create users

The patient service acts as a **proxy for user registration only** - it uses Keycloak's Admin API (`admin-cli` client) to create users and assign roles.

---

### **API Gateway JWT Validation**

For **all other API calls**, the flow is:

```
Frontend → API Gateway → Backend Services
              ↓
         Validates JWT (Keycloak public key)
              ↓
         Routes to services
```

**Key config:** `config-server/src/main/resources/config-repo/api-gateway.yml`
- Public paths: `/realms/**`, `/auth/**`, `/actuator/**`, `/health`
- All other paths require valid JWT
- JWT validated against Keycloak's JWKS endpoint

---

### **Summary Table**

| Auth Operation | Goes Through Patient Service | Flow |
|---------------|------------------------------|------|
| **Login** | ❌ No | Frontend ↔ Keycloak (direct) |
| **Logout** | ❌ No | Frontend ↔ Keycloak (direct) |
| **Token Refresh** | ❌ No | Frontend ↔ Keycloak (direct) |
| **Registration** | ✅ Yes | Frontend → Gateway → Patient Service → Keycloak Admin API |
| **API Calls** | ❌ No (JWT validated at Gateway) | Frontend → Gateway (validate JWT) → Services |

So to answer your question: **Login/logout is purely Keycloak ↔ Frontend business. Only registration passes through the patient service.**