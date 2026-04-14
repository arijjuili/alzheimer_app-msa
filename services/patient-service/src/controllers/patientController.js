const axios = require('axios');
const { Patient, AuditLog, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8090';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'humancare';
const KEYCLOAK_ADMIN_USERNAME = process.env.KEYCLOAK_ADMIN_USERNAME || 'admin';
const KEYCLOAK_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';

async function getAdminToken() {
  const response = await axios.post(
    `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
    new URLSearchParams({
      username: KEYCLOAK_ADMIN_USERNAME,
      password: KEYCLOAK_ADMIN_PASSWORD,
      grant_type: 'password',
      client_id: 'admin-cli'
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}

async function updateKeycloakUser(adminToken, keycloakId, payload) {
  await axios.put(
    `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${keycloakId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

async function deleteKeycloakUser(adminToken, keycloakId) {
  await axios.delete(
    `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${keycloakId}`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    }
  );
}

// Get all patients with pagination and optional filters
const getAllPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { doctorId, caregiverId } = req.query;

    // Build where clause based on query params
    const whereClause = {};
    if (doctorId) {
      whereClause.doctorId = doctorId;
    }
    if (caregiverId) {
      whereClause.caregiverId = caregiverId;
    }

    const { count, rows: patients } = await Patient.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      data: patients,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

// Get patients by doctor ID
const getPatientsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: patients } = await Patient.findAndCountAll({
      where: { doctorId },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      data: patients,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching patients by doctor:', error);
    res.status(500).json({ error: 'Failed to fetch patients by doctor' });
  }
};

// Get unassigned patients (no doctor assigned)
const getUnassignedPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: patients } = await Patient.findAndCountAll({
      where: { 
        doctorId: { [Op.is]: null }
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      data: patients,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching unassigned patients:', error);
    res.status(500).json({ error: 'Failed to fetch unassigned patients' });
  }
};

// Assign doctor to patient
const assignDoctor = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { doctorId } = req.body;
    const performedBy = req.headers['x-user-id'] || 'system';

    if (!doctorId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'doctorId is required' });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(doctorId)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid doctorId format. Expected UUID.' });
    }

    const patient = await Patient.findByPk(id, { transaction });

    if (!patient) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Patient not found' });
    }

    const oldDoctorId = patient.doctorId;

    await patient.update({ doctorId }, { transaction });

    // Log ASSIGN_DOCTOR action
    await AuditLog.create({
      id: uuidv4(),
      patientId: id,
      action: 'UPDATE',
      performedBy,
      details: {
        type: 'ASSIGN_DOCTOR',
        oldDoctorId,
        newDoctorId: doctorId
      }
    }, { transaction });

    await transaction.commit();
    res.json(patient);
  } catch (error) {
    await transaction.rollback();
    console.error('Error assigning doctor:', error);
    res.status(500).json({ error: 'Failed to assign doctor' });
  }
};

// Assign caregiver to patient
const assignCaregiver = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { caregiverId } = req.body;
    const performedBy = req.headers['x-user-id'] || 'system';

    if (!caregiverId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'caregiverId is required' });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(caregiverId)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid caregiverId format. Expected UUID.' });
    }

    const patient = await Patient.findByPk(id, { transaction });

    if (!patient) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Patient not found' });
    }

    const oldCaregiverId = patient.caregiverId;

    await patient.update({ caregiverId }, { transaction });

    // Log ASSIGN_CAREGIVER action
    await AuditLog.create({
      id: uuidv4(),
      patientId: id,
      action: 'UPDATE',
      performedBy,
      details: {
        type: 'ASSIGN_CAREGIVER',
        oldCaregiverId,
        newCaregiverId: caregiverId
      }
    }, { transaction });

    await transaction.commit();
    res.json(patient);
  } catch (error) {
    await transaction.rollback();
    console.error('Error assigning caregiver:', error);
    res.status(500).json({ error: 'Failed to assign caregiver' });
  }
};

// Get patient by ID with VIEW audit logging
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const performedBy = req.headers['x-user-id'] || 'system';

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Log VIEW action
    await AuditLog.create({
      id: uuidv4(),
      patientId: id,
      action: 'VIEW',
      performedBy,
      details: { source: req.headers['x-service-name'] || 'unknown' }
    });

    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
};

// Create new patient
const createPatient = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { keycloakId, firstName, lastName, birthDate, caregiverId, doctorId } = req.body;
    const performedBy = req.headers['x-user-id'] || 'system';

    if (!keycloakId || !firstName || !lastName) {
      await transaction.rollback();
      return res.status(400).json({ error: 'keycloakId, firstName, and lastName are required' });
    }

    const patient = await Patient.create({
      id: uuidv4(),
      keycloakId,
      firstName,
      lastName,
      birthDate,
      caregiverId,
      doctorId
    }, { transaction });

    // Log CREATE action
    await AuditLog.create({
      id: uuidv4(),
      patientId: patient.id,
      action: 'CREATE',
      performedBy,
      details: { 
        firstName,
        lastName,
        birthDate,
        caregiverId,
        doctorId
      }
    }, { transaction });

    await transaction.commit();
    res.status(201).json(patient);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
};

// Update patient with UPDATE audit logging
const updatePatient = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      emergencyContact,
      medicalHistory,
      birthDate,
      caregiverId,
      doctorId
    } = req.body;
    const performedBy = req.headers['x-user-id'] || 'system';

    const patient = await Patient.findByPk(id, { transaction });

    if (!patient) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Patient not found' });
    }

    const oldValues = {
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      medicalHistory: patient.medicalHistory,
      birthDate: patient.birthDate,
      caregiverId: patient.caregiverId,
      doctorId: patient.doctorId
    };

    const nextValues = {
      firstName: firstName || patient.firstName,
      lastName: lastName || patient.lastName,
      email: email !== undefined ? email : patient.email,
      phone: phone !== undefined ? phone : patient.phone,
      address: address !== undefined ? address : patient.address,
      emergencyContact: emergencyContact !== undefined ? emergencyContact : patient.emergencyContact,
      medicalHistory: medicalHistory !== undefined ? medicalHistory : patient.medicalHistory,
      birthDate: birthDate !== undefined ? birthDate : patient.birthDate,
      caregiverId: caregiverId !== undefined ? caregiverId : patient.caregiverId,
      doctorId: doctorId !== undefined ? doctorId : patient.doctorId
    };

    if (patient.keycloakId && (firstName !== undefined || lastName !== undefined || email !== undefined)) {
      const adminToken = await getAdminToken();
      await updateKeycloakUser(adminToken, patient.keycloakId, {
        firstName: nextValues.firstName,
        lastName: nextValues.lastName,
        email: nextValues.email
      });
    }

    await patient.update(nextValues, { transaction });

    // Log UPDATE action
    await AuditLog.create({
      id: uuidv4(),
      patientId: id,
      action: 'UPDATE',
      performedBy,
      details: {
        oldValues,
        newValues: nextValues
      }
    }, { transaction });

    await transaction.commit();
    res.json(patient);
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
};

const deletePatient = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id, { transaction });

    if (!patient) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (patient.keycloakId) {
      const adminToken = await getAdminToken();
      await deleteKeycloakUser(adminToken, patient.keycloakId);
    }

    await AuditLog.destroy({
      where: { patientId: id },
      transaction
    });

    await patient.destroy({ transaction });
    await transaction.commit();

    return res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting patient:', error.response?.data || error.message || error);
    return res.status(500).json({
      error: 'Failed to delete patient'
    });
  }
};

// Unassign doctor from patient
const unassignDoctor = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const performedBy = req.headers['x-user-id'] || 'system';

    const patient = await Patient.findByPk(id, { transaction });

    if (!patient) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Patient not found' });
    }

    const oldDoctorId = patient.doctorId;

    if (!oldDoctorId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Patient has no doctor assigned' });
    }

    await patient.update({ doctorId: null }, { transaction });

    // Log UNASSIGN_DOCTOR action
    await AuditLog.create({
      id: uuidv4(),
      patientId: id,
      action: 'UPDATE',
      performedBy,
      details: {
        type: 'UNASSIGN_DOCTOR',
        oldDoctorId,
        newDoctorId: null
      }
    }, { transaction });

    await transaction.commit();
    res.json(patient);
  } catch (error) {
    await transaction.rollback();
    console.error('Error unassigning doctor:', error);
    res.status(500).json({ error: 'Failed to unassign doctor' });
  }
};

// Unassign caregiver from patient
const unassignCaregiver = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const performedBy = req.headers['x-user-id'] || 'system';

    const patient = await Patient.findByPk(id, { transaction });

    if (!patient) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Patient not found' });
    }

    const oldCaregiverId = patient.caregiverId;

    if (!oldCaregiverId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Patient has no caregiver assigned' });
    }

    await patient.update({ caregiverId: null }, { transaction });

    // Log UNASSIGN_CAREGIVER action
    await AuditLog.create({
      id: uuidv4(),
      patientId: id,
      action: 'UPDATE',
      performedBy,
      details: {
        type: 'UNASSIGN_CAREGIVER',
        oldCaregiverId,
        newCaregiverId: null
      }
    }, { transaction });

    await transaction.commit();
    res.json(patient);
  } catch (error) {
    await transaction.rollback();
    console.error('Error unassigning caregiver:', error);
    res.status(500).json({ error: 'Failed to unassign caregiver' });
  }
};

// Get patient audit logs
const getPatientAudit = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where: { patientId: id },
      limit,
      offset,
      order: [['timestamp', 'DESC']]
    });

    res.json({
      data: logs,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

module.exports = {
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
  unassignCaregiver
};
