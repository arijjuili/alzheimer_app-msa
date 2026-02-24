const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'patient_id',
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM('VIEW', 'UPDATE', 'DELETE', 'CREATE'),
    allowNull: false
  },
  performedBy: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'performed_by'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: false
});

module.exports = AuditLog;
