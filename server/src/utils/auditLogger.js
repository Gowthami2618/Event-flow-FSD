const AuditLog = require('../models/AuditLog');

const logAction = async ({ user, action, resource, resourceId, details, req, status = 'success' }) => {
  try {
    await AuditLog.create({
      user: user?._id || user,
      action,
      resource,
      resourceId,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers?.['user-agent'],
      status,
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = logAction;
