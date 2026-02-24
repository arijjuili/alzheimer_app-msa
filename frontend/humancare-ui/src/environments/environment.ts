export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081',  // Gateway URL
  keycloak: {
    url: 'http://localhost:8090',
    realm: 'humancare',
    clientId: 'humancare-webapp'
  }
};
