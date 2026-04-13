const express = require('express');
const { getDoctors, getCaregivers } = require('../controllers/authController');

const router = express.Router();

// GET /doctors - Get all doctors from Keycloak
router.get('/', getDoctors);

module.exports = router;
