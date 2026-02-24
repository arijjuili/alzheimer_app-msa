/**
 * Eureka Client Configuration for Patient Service
 * 
 * Registers this Node.js service with the Spring Cloud Eureka Server.
 * Uses hc- prefix naming convention for containerized environments.
 */

const { Eureka } = require('eureka-js-client');

// Configuration from environment variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 8082;
const EUREKA_HOST = process.env.EUREKA_HOST || 'localhost';
const EUREKA_PORT = process.env.EUREKA_PORT || 8761;
const HOSTNAME = process.env.HOSTNAME || 'localhost';

// Generate a unique instance ID
const INSTANCE_ID = `${HOSTNAME}:${PORT}`;

// Eureka client configuration
const client = new Eureka({
  instance: {
    instanceId: INSTANCE_ID,
    app: 'patient-service',
    hostName: HOSTNAME,
    ipAddr: '127.0.0.1',  // Required by Eureka, but not used for routing
    statusPageUrl: `http://${HOSTNAME}:${PORT}/health`,
    port: {
      '$': PORT,
      '@enabled': 'true',
    },
    vipAddress: 'patient-service',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
    leaseInfo: {
      renewalIntervalInSecs: 30,
      durationInSecs: 90,
    },
  },
  eureka: {
    host: EUREKA_HOST,
    port: EUREKA_PORT,
    servicePath: '/eureka/apps/',
    maxRetries: 10,
    requestRetryDelay: 2000,
  },
  logger: {
    debug: (message) => console.log(`[Eureka] DEBUG: ${message}`),
    info: (message) => console.log(`[Eureka] INFO: ${message}`),
    warn: (message) => console.warn(`[Eureka] WARN: ${message}`),
    error: (message) => console.error(`[Eureka] ERROR: ${message}`),
  },
});

// Start registration
function startEurekaRegistration() {
  return new Promise((resolve, reject) => {
    console.log(`[Eureka] Registering with ${EUREKA_HOST}:${EUREKA_PORT}`);
    console.log(`[Eureka] Instance: ${INSTANCE_ID}`);

    client.start((error) => {
      if (error) {
        console.error('[Eureka] Registration failed:', error.message);
        reject(error);
      } else {
        console.log('[Eureka] Registered successfully');
        resolve();
      }
    });
  });
}

// Stop registration
function stopEurekaRegistration() {
  return new Promise((resolve) => {
    console.log('[Eureka] Deregistering...');
    client.stop(() => {
      console.log('[Eureka] Deregistered');
      resolve();
    });
  });
}

module.exports = {
  client,
  startEurekaRegistration,
  stopEurekaRegistration,
};
