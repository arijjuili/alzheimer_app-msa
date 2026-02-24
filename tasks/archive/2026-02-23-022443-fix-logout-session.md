# Fix Login/Logout Session Handling

## Problem
1. **Logout doesn't work properly**: When user logs out, they can still access protected pages because the Keycloak server-side session wasn't terminated.
2. **Token always present on landing page**: The landing page was always fetching tokens because Keycloak `check-sso` finds valid session cookies and automatically authenticates the user.

## Root Causes

### Issue 1: Logout Not Working
- The logout was using a hidden iframe to load Keycloak's logout URL
- Hidden iframe doesn't properly terminate the server-side Keycloak session
- The session cookies remained valid, so `check-sso` would automatically re-authenticate
- Without `id_token_hint`, Keycloak doesn't properly terminate the session

## Fixes Applied

### 1. Fixed Keycloak Logout (`keycloak.service.ts`)
- **Problem**: Hidden iframe approach doesn't reliably terminate Keycloak sessions
- **Solution**: Use Keycloak's built-in `logout()` method with proper `redirectUri`
  - Changed `post.logout.redirect.uris` in Keycloak config to allow `/*` (any path)
  - Use `keycloakInstance.logout({ redirectUri: ... })` for proper session termination
  - This method sends the `id_token_hint` and properly clears server-side cookies

### 2. Fixed Logout Component (`logout.component.ts`)
- Added logic to detect if user is authenticated or already logged out
- If authenticated: calls `authService.logout()` which redirects to Keycloak
- If not authenticated (returning from Keycloak): redirects to landing page after 1 second

### 3. Fixed Header Logout (`header.component.ts`)
- Changed logout to navigate to `/logout` route instead of calling service directly
- This ensures consistent logout flow through the logout component

### 4. Updated Keycloak Config (`humancare-realm.json`)
- Changed `post.logout.redirect.uris` from `/logout` specific to `/*` wildcard
- This allows redirecting to any path after logout

## Testing

### Test Logout Flow
1. Login to the application
2. Navigate to any protected page (dashboard)
3. Click Logout
4. **Expected**: User is redirected to Keycloak logout page
5. **Expected**: After Keycloak logout, user returns to `/logout` route
6. **Expected**: User is then redirected to landing page
7. **Expected**: User should NOT be automatically logged in when returning to landing page
8. **Expected**: "Login" button should be visible, not "Dashboard"

### Test Protected Routes After Logout
1. Login and go to dashboard
2. Logout
3. Try to manually navigate to `/app/dashboard`
4. **Expected**: Should be redirected to login page

## Important Notes

1. **Keycloak Container Restart Required**: After changing `humancare-realm.json`, you need to restart the Keycloak container:
   ```bash
   docker-compose restart hc-keycloak
   ```
   Or for a full reset:
   ```bash
   docker-compose rm -f hc-keycloak
   docker-compose up -d hc-keycloak
   ```

2. **Browser Cookies**: If you still have issues, clear browser cookies for:
   - `localhost`
   - `127.0.0.1`
   
   Look for cookies like:
   - `AUTH_SESSION_ID`
   - `KEYCLOAK_SESSION`
   - `KEYCLOAK_IDENTITY`

## Files Modified
- `frontend/humancare-ui/src/app/core/keycloak/keycloak.service.ts`
- `frontend/humancare-ui/src/app/features/logout/logout.component.ts`
- `frontend/humancare-ui/src/app/shared/components/header/header.component.ts`
- `keycloak-service/realm-config/humancare-realm.json`
