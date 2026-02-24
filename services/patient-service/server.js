require('dotenv').config();

const app = require('./src/app');
const { sequelize } = require('./src/models');
const { startEurekaRegistration, stopEurekaRegistration } = require('./src/config/eureka');

const PORT = process.env.PORT || 8082;

// Track server state for graceful shutdown
let server;

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('Database models synchronized.');

    // Start server
    server = app.listen(PORT, async () => {
      console.log(`Patient service running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);

      // Register with Eureka server
      try {
        await startEurekaRegistration();
      } catch (error) {
        console.error('Eureka registration failed, continuing without service discovery:', error.message);
        // Don't exit - service can still work without Eureka
      }
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close HTTP server (stop accepting new connections)
  if (server) {
    console.log('Closing HTTP server...');
    server.close(() => {
      console.log('HTTP server closed.');
    });
  }

  // Deregister from Eureka
  try {
    await stopEurekaRegistration();
  } catch (error) {
    console.error('Error during Eureka deregistration:', error.message);
  }

  // Close database connection
  try {
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  }

  console.log('Graceful shutdown complete.');
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION').then(() => process.exit(1));
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  gracefulShutdown('UNHANDLED_REJECTION').then(() => process.exit(1));
});

// Start the server
startServer();
