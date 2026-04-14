const axios = require('axios');
const { Patient } = require('../models');
const { v4: uuidv4 } = require('uuid');

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8090';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'humancare';
const KEYCLOAK_ADMIN_USERNAME = process.env.KEYCLOAK_ADMIN_USERNAME || 'admin';
const KEYCLOAK_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';

/**
 * Get admin access token from Keycloak
 */
async function getAdminToken() {
  try {
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
  } catch (error) {
    console.error('Failed to get admin token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Keycloak');
  }
}

async function getRealmRoleByName(adminToken, roleName) {
  const response = await axios.get(
    `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/roles`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    }
  );

  return response.data.find(role => role.name === roleName) || null;
}

async function deleteKeycloakUser(adminToken, userId) {
  await axios.delete(
    `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    }
  );
}

function extractKeycloakErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (responseData?.errorMessage) {
    return responseData.errorMessage;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  return error.message || fallbackMessage;
}

/**
 * Register a new user with a specific role
 */
async function registerUser(req, res) {
  let adminToken;
  let createdUserId = null;

  try {
    const { 
      username, 
      email, 
      firstName, 
      lastName, 
      password, 
      role,
      phone,
      dateOfBirth,
      address,
      emergencyContact,
      medicalHistory
    } = req.body;

    // Validate required fields
    if (!username || !email || !firstName || !lastName || !password || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Username, email, firstName, lastName, password, and role are required'
      });
    }

    // Validate role
    const validRoles = ['PATIENT', 'CAREGIVER', 'DOCTOR'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: `Role must be one of: ${validRoles.join(', ')}`
      });
    }

    // Get admin token
    adminToken = await getAdminToken();

    const targetRole = await getRealmRoleByName(adminToken, role);
    if (!targetRole) {
      return res.status(500).json({
        error: 'Registration failed',
        message: `Realm role ${role} was not found in Keycloak. Reimport the humancare realm or create the role first.`
      });
    }

    // Check if user already exists
    try {
      const existingUsers = await axios.get(
        `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?username=${encodeURIComponent(username)}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );
      
      if (existingUsers.data.length > 0) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'Username is already taken'
        });
      }

      // Check email
      const existingEmails = await axios.get(
        `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?email=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );
      
      if (existingEmails.data.length > 0) {
        return res.status(409).json({
          error: 'Email already exists',
          message: 'Email is already registered'
        });
      }
    } catch (error) {
      console.error('Error checking existing user:', error.message);
    }

    // Create user in Keycloak
    const createUserResponse = await axios.post(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`,
      {
        username,
        email,
        firstName,
        lastName,
        enabled: true,
        emailVerified: true,
        credentials: [
          {
            type: 'password',
            value: password,
            temporary: false
          }
        ],
        attributes: {
          userType: role
        }
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Get the created user ID from Location header
    const locationHeader = createUserResponse.headers.location;
    const userId = locationHeader ? locationHeader.split('/').pop() : null;

    if (!userId) {
      // Try to find the user by username to get the ID
      const userSearch = await axios.get(
        `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?username=${encodeURIComponent(username)}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );
      
      if (userSearch.data.length > 0) {
        const user = userSearch.data[0];
        createdUserId = user.id;
        
        // Assign role to user
        await assignRoleToUser(adminToken, user.id, role);
        
        return res.status(201).json({
          message: 'User registered successfully',
          userId: user.id,
          username,
          email,
          role
        });
      }
      
      return res.status(500).json({
        error: 'Failed to retrieve user ID',
        message: 'User was created but ID could not be retrieved'
      });
    }

    createdUserId = userId;

    // Assign role to user
    await assignRoleToUser(adminToken, userId, role);

    // Create patient record in local database if role is PATIENT
    let patientId = null;
    if (role === 'PATIENT') {
      try {
        const patient = await Patient.create({
          id: uuidv4(),
          keycloakId: userId,
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone || null,
          birthDate: dateOfBirth || null,
          address: address || null,
          emergencyContact: emergencyContact || null,
          medicalHistory: medicalHistory || null,
          caregiverId: null,
          doctorId: null
        });
        patientId = patient.id;
        console.log(`[registerUser] Created patient record for user ${userId}: ${patient.id}`);
      } catch (patientError) {
        console.error('[registerUser] Failed to create patient record:', patientError.message);
        // Don't fail registration if patient creation fails
      }
    }

    return res.status(201).json({
      message: 'User registered successfully',
      userId,
      patientId,
      username,
      email,
      role
    });

  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);

    if (createdUserId && adminToken) {
      try {
        await deleteKeycloakUser(adminToken, createdUserId);
        console.log(`[registerUser] Rolled back Keycloak user ${createdUserId} after failed registration`);
      } catch (cleanupError) {
        console.error(
          `[registerUser] Failed to rollback Keycloak user ${createdUserId}:`,
          cleanupError.response?.data || cleanupError.message
        );
      }
    }
    
    if (error.response?.status === 409) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'Username or email is already registered'
      });
    }
    
    return res.status(500).json({
      error: 'Registration failed',
      message: extractKeycloakErrorMessage(error, 'An error occurred during registration')
    });
  }
}

/**
 * Get all realm roles assigned to a user
 */
async function getUserRealmRoles(adminToken, userId) {
  try {
    const response = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to get user roles:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Remove realm roles from a user
 */
async function removeRolesFromUser(adminToken, userId, roles) {
  try {
    await axios.delete(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        data: roles
      }
    );
    console.log(`Removed roles from user ${userId}:`, roles.map(r => r.name).join(', '));
  } catch (error) {
    console.error('Failed to remove roles:', error.response?.data || error.message);
  }
}

/**
 * Assign a realm role to a user and remove other custom roles
 */
async function assignRoleToUser(adminToken, userId, roleName) {
  try {
    console.log(`[assignRoleToUser] Starting for user ${userId}, target role: ${roleName}`);
    
    // Find the target role
    const targetRole = await getRealmRoleByName(adminToken, roleName);
    if (!targetRole) {
      throw new Error(`Role ${roleName} not found in Keycloak`);
    }

    // Get user's current realm roles
    const currentRoles = await getUserRealmRoles(adminToken, userId);
    console.log(`[assignRoleToUser] Current roles for user ${userId}:`, currentRoles.map(r => r.name));
    
    // Define default Keycloak roles that should be preserved
    const defaultRoles = ['offline_access', 'uma_authorization', 'default-roles-humancare'];
    
    // Find custom roles to remove (non-default roles that are not the target role)
    const rolesToRemove = currentRoles.filter(r => 
      !defaultRoles.includes(r.name) && r.name !== roleName
    );
    
    console.log(`[assignRoleToUser] Roles to remove:`, rolesToRemove.map(r => r.name));

    // Remove unwanted custom roles
    if (rolesToRemove.length > 0) {
      console.log(`[assignRoleToUser] Removing ${rolesToRemove.length} role(s)...`);
      await removeRolesFromUser(adminToken, userId, rolesToRemove);
    } else {
      console.log(`[assignRoleToUser] No roles to remove`);
    }

    // Check if target role is already assigned
    const hasTargetRole = currentRoles.some(r => r.name === roleName);
    
    if (!hasTargetRole) {
      // Assign the target role
      await axios.post(
        `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`,
        [
          {
            id: targetRole.id,
            name: targetRole.name
          }
        ],
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`Role ${roleName} assigned to user ${userId}`);
    }
  } catch (error) {
    console.error(`Failed to assign role ${roleName}:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get available roles (for registration form)
 */
async function getAvailableRoles(req, res) {
  try {
    const roles = [
      { value: 'PATIENT', label: 'Patient', description: 'I need healthcare services' },
      { value: 'CAREGIVER', label: 'Caregiver', description: 'I provide care to patients' },
      { value: 'DOCTOR', label: 'Doctor', description: 'I am a medical professional' }
    ];
    
    return res.json({ roles });
  } catch (error) {
    console.error('Error getting roles:', error.message);
    return res.status(500).json({ error: 'Failed to get roles' });
  }
}

/**
 * Sync PATIENT users from Keycloak to local patient database
 */
async function syncPatientsFromKeycloak(req, res) {
  try {
    const adminToken = await getAdminToken();
    
    // Get all users from Keycloak
    const usersResponse = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?max=1000`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    
    const users = usersResponse.data;
    const results = {
      total: users.length,
      synced: 0,
      skipped: 0,
      errors: []
    };
    
    for (const user of users) {
      try {
        // Get user roles
        const rolesResponse = await axios.get(
          `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${user.id}/role-mappings/realm`,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`
            }
          }
        );
        
        const roles = rolesResponse.data.map(r => r.name);
        
        // Only sync users with PATIENT role
        if (!roles.includes('PATIENT')) {
          results.skipped++;
          continue;
        }
        
        // Check if patient already exists
        const existingPatient = await Patient.findOne({
          where: { keycloakId: user.id }
        });
        
        if (existingPatient) {
          results.skipped++;
          continue;
        }
        
        // Create patient record
        await Patient.create({
          id: uuidv4(),
          keycloakId: user.id,
          firstName: user.firstName || 'Unknown',
          lastName: user.lastName || 'Unknown',
          birthDate: null,
          caregiverId: null,
          doctorId: null
        });
        
        results.synced++;
      } catch (userError) {
        console.error(`[syncPatients] Error processing user ${user.id}:`, userError.message);
        results.errors.push({ userId: user.id, error: userError.message });
      }
    }
    
    return res.json({
      message: 'Sync completed',
      results
    });
  } catch (error) {
    console.error('Sync error:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Sync failed',
      message: error.message
    });
  }
}

/**
 * Get all Keycloak users with a specific realm role
 */
async function getUsersByRole(req, res, roleName) {
  try {
    const adminToken = await getAdminToken();
    
    // Get all users from Keycloak (max 1000)
    const usersResponse = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?max=1000`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    
    const users = usersResponse.data;
    const matchedUsers = [];
    
    for (const user of users) {
      try {
        const rolesResponse = await axios.get(
          `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${user.id}/role-mappings/realm`,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`
            }
          }
        );
        
        const roles = rolesResponse.data.map(r => r.name);
        
        if (roles.includes(roleName)) {
          matchedUsers.push({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            enabled: user.enabled
          });
        }
      } catch (err) {
        console.error(`[getUsersByRole] Error fetching roles for user ${user.id}:`, err.message);
      }
    }
    
    return res.json(matchedUsers);
  } catch (error) {
    console.error(`[getUsersByRole] Error getting ${roleName} users:`, error.response?.data || error.message);
    return res.status(500).json({ 
      error: `Failed to get ${roleName} users`,
      message: error.message
    });
  }
}

/**
 * Get all doctors from Keycloak
 */
async function getDoctors(req, res) {
  return getUsersByRole(req, res, 'DOCTOR');
}

/**
 * Get all caregivers from Keycloak
 */
async function getCaregivers(req, res) {
  return getUsersByRole(req, res, 'CAREGIVER');
}

module.exports = {
  registerUser,
  getAvailableRoles,
  syncPatientsFromKeycloak,
  getDoctors,
  getCaregivers
};
