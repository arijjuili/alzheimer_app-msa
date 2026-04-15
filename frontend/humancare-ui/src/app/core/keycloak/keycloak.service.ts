import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private keycloakInstance: Keycloak | null = null;
  private initialized = false;

  get instance(): Keycloak | null {
    return this.keycloakInstance;
  }

  async init(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      this.keycloakInstance = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      });

      const authenticated = await this.keycloakInstance.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
      });

      this.initialized = true;
      console.log('Keycloak initialized, authenticated:', authenticated);
      console.log('Token parsed:', this.keycloakInstance.tokenParsed);
      console.log('Extracted roles:', this.getRoles());
      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      return false;
    }
  }

  async forceLogoutBeforeLogin(redirectUri?: string): Promise<void> {
    // Directly navigate to Keycloak logout endpoint with redirect to login
    // This ensures the SSO session is completely cleared
    const keycloakBaseUrl = `${environment.keycloak.url}/realms/${environment.keycloak.realm}`;
    const redirectTo = redirectUri || (window.location.origin + '/login?relogin=true');
    const logoutUrl = `${keycloakBaseUrl}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(redirectTo)}`;

    window.location.href = logoutUrl;
  }

  async login(redirectUri?: string): Promise<void> {
    if (this.keycloakInstance) {
      // Default redirect to /app/dashboard after login
      const defaultRedirect = window.location.origin + '/app/dashboard';

      // If already authenticated as a different user, force logout first
      if (this.keycloakInstance.authenticated) {
        const currentUser = this.getUserInfo();
        const currentEmail = currentUser?.email || 'unknown';
        console.log(`Already authenticated as ${currentEmail}, forcing logout first...`);

        await this.forceLogoutBeforeLogin(redirectUri);
        return;
      }

      await this.keycloakInstance.login({
        redirectUri: redirectUri || defaultRedirect,
        prompt: 'login',  // Force re-authentication even if SSO session exists
        maxAge: 0  // Force re-authentication regardless of SSO session age
      });
    }
  }

  async logout(redirectUri?: string): Promise<void> {
    // Default redirect to /logout route which shows "Logging out..." then goes to landing page
    // The /logout path is registered in Keycloak's post.logout.redirect.uris
    const redirect = redirectUri || (window.location.origin + '/logout');

    if (this.keycloakInstance) {
      // Clear local tokens first to ensure clean state
      this.keycloakInstance.clearToken();

      // Use Keycloak's built-in logout with redirect
      // This properly terminates the server-side session
      await this.keycloakInstance.logout({
        redirectUri: redirect
      });
      // Note: logout() redirects the browser, code below won't execute
    } else {
      // No Keycloak instance, just redirect
      window.location.href = redirectUri || window.location.origin;
    }
  }

  isAuthenticated(): boolean {
    return this.keycloakInstance?.authenticated ?? false;
  }

  getToken(): string | undefined {
    return this.keycloakInstance?.token;
  }

  async refreshToken(): Promise<string | undefined> {
    if (this.keycloakInstance && this.keycloakInstance.authenticated) {
      try {
        // Check if token needs refresh (less than 30 seconds remaining)
        const parsed = this.keycloakInstance.tokenParsed as any;
        if (parsed && parsed.exp) {
          const expTime = parsed.exp * 1000;
          const now = Date.now();
          const timeUntilExpiry = expTime - now;

          // If token still valid with more than 30 seconds, just return current token
          if (timeUntilExpiry > 30000) {
            return this.keycloakInstance.token;
          }
        }

        await this.keycloakInstance.updateToken(30);
        return this.keycloakInstance.token;
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Don't return undefined and trigger logout - return current token and let the API fail naturally
        return this.keycloakInstance.token;
      }
    }
    return undefined;
  }

  getUserInfo(): { id: string; email: string; firstName: string; lastName: string } | null {
    if (!this.keycloakInstance) {
      return null;
    }

    const tokenParsed = this.keycloakInstance.tokenParsed as any;
    if (!tokenParsed) {
      return null;
    }

    return {
      id: tokenParsed.sub || '',
      email: tokenParsed.email || '',
      firstName: tokenParsed.given_name || '',
      lastName: tokenParsed.family_name || ''
    };
  }

  getRoles(): string[] {
    if (!this.keycloakInstance) {
      return [];
    }

    const tokenParsed = this.keycloakInstance.tokenParsed as any;
    if (!tokenParsed) {
      return [];
    }

    // Get roles from all possible locations in the token
    const allRoles: string[] = [];

    // 1. Root level roles (as seen in your token)
    if (tokenParsed.roles && Array.isArray(tokenParsed.roles)) {
      allRoles.push(...tokenParsed.roles);
    }

    // 2. Realm access roles
    if (tokenParsed.realm_access?.roles) {
      allRoles.push(...tokenParsed.realm_access.roles);
    }

    // 3. Client-specific roles
    if (tokenParsed.resource_access?.[environment.keycloak.clientId]?.roles) {
      allRoles.push(...tokenParsed.resource_access[environment.keycloak.clientId].roles);
    }

    // Normalize roles to uppercase and remove duplicates
    return [...new Set(allRoles.map(r => r.toUpperCase()))];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role.toUpperCase());
  }
}
