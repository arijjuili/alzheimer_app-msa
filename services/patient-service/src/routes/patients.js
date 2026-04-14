const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientAudit,
  getPatientsByDoctor,
  getUnassignedPatients,
  assignDoctor,
  assignCaregiver,
  unassignDoctor,
  unassignCaregiver,
  unassignCurrentUser
} = require('../controllers/patientController');

// GET /patients - Get all patients with pagination (supports ?doctorId and ?caregiverId filters)
router.get('/', getAllPatients);

// GET /patients/unassigned - Get patients with no doctor assigned
router.get('/unassigned', getUnassignedPatients);

// GET /patients/by-doctor/:doctorId - Get patients assigned to a specific doctor
router.get('/by-doctor/:doctorId', getPatientsByDoctor);

// GET /patients/:id - Get patient by ID
router.get('/:id', getPatientById);

// POST /patients - Create new patient
router.post('/', createPatient);

// PUT /patients/:id - Update patient
router.put('/:id', updatePatient);

// DELETE /patients/:id - Delete patient and linked Keycloak user
router.delete('/:id', deletePatient);

// PUT /patients/:id/assign-doctor - Assign a doctor to a patient
router.put('/:id/assign-doctor', assignDoctor);

// DELETE /patients/:id/assign-doctor - Unassign doctor from patient
router.delete('/:id/assign-doctor', unassignDoctor);

// PUT /patients/:id/assign-caregiver - Assign a caregiver to a patient
router.put('/:id/assign-caregiver', assignCaregiver);

// DELETE /patients/:id/assign-caregiver - Unassign caregiver from patient
router.delete('/:id/assign-caregiver', unassignCaregiver);

// DELETE /patients/:id/unassign - Unassign current user (doctor or caregiver) from patient
router.delete('/:id/unassign', unassignCurrentUser);

// GET /patients/:id/audit - Get patient audit logs
router.get('/:id/audit', getPatientAudit);

module.exports = router;
