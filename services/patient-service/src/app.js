const express = require('express');
const helmet = require('helmet');
const patientRoutes = require('./routes/patients');
const authRoutes = require('./routes/auth');

const app = express();

// Security middleware
app.use(helmet());

// Note: CORS is handled by the API Gateway, not needed here

// JSON parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: process.env.SERVICE_NAME || 'patient-service',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/v1/patients', patientRoutes);
app.use('/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
