const sequelize = require('../config/database');
const Patient = require('./Patient');
const AuditLog = require('./AuditLog');

// Define associations
Patient.hasMany(AuditLog, {
  foreignKey: 'patientId',
  as: 'auditLogs'
});

AuditLog.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient'
});

module.exports = {
  sequelize,
  Patient,
  AuditLog
};
