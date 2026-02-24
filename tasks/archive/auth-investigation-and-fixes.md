# Task: Auth Investigation & Registration Role Fixes

**Date:** 2026-02-23  
**Status:** ✅ Completed

---

## Summary

Investigated the authentication flow and fixed multiple issues related to role assignment during user registration.

---

## 1. Auth Flow Investigation

**Finding:** Authentication is **direct** between Frontend and Keycloak

```
Login/Logout:    Frontend ↔ Keycloak (direct via keycloak-js)
Registration:    Frontend → Gateway → Patient Service → Keycloak Admin API
API Calls:       Frontend → Gateway (JWT validation) → Services
```

**Patient Service only handles registration** - not login/logout.

---

## 2. Default PATIENT Role Bug (Fixed)

### Problem
When registering with DOCTOR or CAREGIVER role, users also got PATIENT role.

### Root Cause
Keycloak realm config had `defaultRole: { name: "PATIENT" }` which auto-assigned PATIENT to every new user.

### Fix Applied

**File:** `keycloak-service/realm-config/humancare-realm.json`
```json
// Before
"defaultRole": { "name": "PATIENT" }

// After
"defaultRole": { "name": "default-roles-humancare" }
```

**Note:** Required full reset of Keycloak to reload realm config:
```bash
docker-compose rm -sfv hc-keycloak hc-postgres-keycloak
docker volume rm humancare_hc_pg_keycloak
docker-compose up -d
```

**Also reverted:** Code workaround in `authController.js` that explicitly removed PATIENT role.

---

## 3. Token Role Cleanup (Fixed)

### Problem
Token contained duplicate and unnecessary roles:
```javascript
roles: ['offline_access', 'uma_authorization', 'CAREGIVER', 'default-roles-humancare', 
        'offline_access', 'uma_authorization', 'CAREGIVER', 'default-roles-humancare']
```

### Fixes Applied

**Option A - Removed Duplicate Mapper:**
- Keycloak Admin Console → Clients → humancare-webapp → Client Scopes
- Removed duplicate `roles` scope/mapper

**Option C - Cleaned Composite Role:**
- Realm Settings → Roles → default-roles-humancare → Composite Roles
- Removed: `offline_access`, `uma_authorization`

### Result
Clean token:
```javascript
roles: ['CAREGIVER', 'default-roles-humancare']
Extracted roles: ['CAREGIVER', 'DEFAULT-ROLES-HUMANCARE']
```

---

## 4. SSO Auto-Login Bug (Fixed)

### Problem
After logout, clicking "Login" would auto-authenticate without asking for credentials.

### Root Cause
Keycloak maintains server-side SSO session; `keycloak.login()` by default reuses valid sessions.

### Fix Applied

**File:** `frontend/humancare-ui/src/app/core/keycloak/keycloak.service.ts`
```typescript
await this.keycloakInstance.login({
  redirectUri: redirectUri || defaultRedirect,
  prompt: 'login'  // Force re-authentication
});
```

Now users always see the login screen after logout.

---

## Files Modified

| File | Change |
|------|--------|
| `keycloak-service/realm-config/humancare-realm.json` | Changed defaultRole from PATIENT to default-roles-humancare |
| `services/patient-service/src/controllers/authController.js` | Reverted explicit PATIENT removal workaround |
| `frontend/humancare-ui/src/app/core/keycloak/keycloak.service.ts` | Added `prompt: 'login'` to force re-auth |

---

## Verification

- [x] Register as CAREGIVER → Only CAREGIVER role assigned
- [x] Register as DOCTOR → Only DOCTOR role assigned
- [x] Register as PATIENT → Only PATIENT role assigned
- [x] Token contains no duplicates, no offline_access/uma_authorization
- [x] Logout then Login → Login page shown (not auto-login)
