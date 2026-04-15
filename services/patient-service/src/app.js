const express = require('express');
const helmet = require('helmet');
const path = require('path');
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

// Swagger API Docs
app.get('/v3/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'swagger.json'));
});
app.get('/swagger-ui.html', (req, res) => {
  res.redirect('https://petstore.swagger.io/?url=' + req.protocol + '://' + req.get('host') + '/v3/api-docs');
});

// API routes
app.use('/api/v1/patients', patientRoutes);
app.use('/auth', authRoutes);

// Doctor & Caregiver lookups (Keycloak proxy)
const { getDoctors, getCaregivers } = require('./controllers/authController');
app.get('/api/v1/doctors', getDoctors);
app.get('/api/v1/caregivers', getCaregivers);

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
