const express = require('express');
const { registerUser, getAvailableRoles, syncPatientsFromKeycloak } = require('../controllers/authController');

const router = express.Router();

// Public registration endpoint (no authentication required)
router.post('/register', registerUser);

// Get available roles for registration
router.get('/roles', getAvailableRoles);

// Sync patients from Keycloak (admin endpoint)
router.post('/sync-patients', syncPatientsFromKeycloak);

module.exports = router;
