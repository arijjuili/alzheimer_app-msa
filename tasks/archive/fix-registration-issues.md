# Fix Registration Flow Issues

## Issues Fixed

### Issue 1: Registration Shows Error Despite 201 Success
**Problem:** After successful registration (HTTP 201), the frontend error handler was triggered and showed an error message instead of success + redirect.

**Root Cause:** The HTTP response handling wasn't explicitly checking status codes. The response structure may have caused the error callback to fire.

**Fix:** Updated `signup.component.ts` to:
- Use `{ observe: 'response' }` to get full HTTP response
- Explicitly check for status 201 before showing success
- Added better error logging

**File:** `frontend/humancare-ui/src/app/features/signup/signup.component.ts`

### Issue 2: User Gets Multiple Roles (e.g., DOCTOR + PATIENT)
**Problem:** When registering with a specific role (e.g., DOCTOR), the user ended up with both DOCTOR and PATIENT roles.

**Root Cause:** Keycloak automatically assigns "default realm roles" when creating a user. In the humancare realm, PATIENT was likely configured as a default role, so all new users got PATIENT plus the explicitly assigned role.

**Fix:** Updated `authController.js` to:
- Get user's current roles after creation
- Identify and remove custom roles that aren't the target role
- Preserve default Keycloak roles (offline_access, uma_authorization, default-roles-humancare)
- Assign the target role if not already present

**Files:**
- `services/patient-service/src/controllers/authController.js`
  - Added `getUserRealmRoles()` helper
  - Added `removeRolesFromUser()` helper
  - Updated `assignRoleToUser()` to clean up unwanted roles

## Testing

✅ **VERIFIED WORKING**

Tested with multiple role types - all working correctly:

```
[assignRoleToUser] Starting for user cf223327..., target role: DOCTOR
[assignRoleToUser] Current roles: [ 'PATIENT' ]
[assignRoleToUser] Roles to remove: [ 'PATIENT' ]
Removed roles from user: PATIENT
Role DOCTOR assigned to user

[assignRoleToUser] Starting for user 8d7b1981..., target role: CAREGIVER
[assignRoleToUser] Current roles: [ 'PATIENT' ]
[assignRoleToUser] Roles to remove: [ 'PATIENT' ]
Removed roles from user: PATIENT
Role CAREGIVER assigned to user

[assignRoleToUser] Starting for user 3f41c1a4..., target role: PATIENT
[assignRoleToUser] Current roles: [ 'PATIENT' ]
[assignRoleToUser] Roles to remove: []
[assignRoleToUser] No roles to remove
```

## Rebuild Required

```bash
# Rebuild patient service
docker-compose build hc-patient-service
docker-compose up -d hc-patient-service

# Frontend will hot-reload automatically in dev mode
```
