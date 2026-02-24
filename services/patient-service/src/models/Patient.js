const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  keycloakId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'keycloak_id'
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name'
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'birth_date'
  },
  caregiverId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'caregiver_id'
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'doctor_id'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'patients',
  timestamps: false,
  indexes: [
    {
      fields: ['doctor_id']
    },
    {
      fields: ['caregiver_id']
    }
  ]
});

module.exports = Patient;
