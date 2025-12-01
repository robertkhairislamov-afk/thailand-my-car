const pool = require('../config/database');

/**
 * Log an activity to the database
 * @param {Object} params - Log parameters
 * @param {string} params.action - Action type (e.g., 'login', 'investment_update', 'password_change')
 * @param {string} params.entityType - Entity type (e.g., 'investment', 'user', 'admin')
 * @param {string} params.entityId - Entity ID
 * @param {string} params.userType - 'admin' or 'user'
 * @param {string} params.userId - User/Admin ID
 * @param {string} params.userEmail - User/Admin email
 * @param {string} params.ipAddress - IP address
 * @param {string} params.userAgent - User agent string
 * @param {Object} params.details - Additional details as JSON
 */
async function logActivity({
  action,
  entityType = null,
  entityId = null,
  userType = 'admin',
  userId = null,
  userEmail = null,
  ipAddress = null,
  userAgent = null,
  details = null
}) {
  try {
    await pool.query(
      `INSERT INTO activity_logs
       (action, entity_type, entity_id, user_type, user_id, user_email, ip_address, user_agent, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [action, entityType, entityId, userType, userId, userEmail, ipAddress, userAgent, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

/**
 * Get client IP from request
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.ip;
}

/**
 * Create a logging middleware for specific actions
 */
function createLogMiddleware(action, entityType = null) {
  return (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = function(data) {
      // Only log successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const user = req.user || {};
        logActivity({
          action,
          entityType,
          entityId: req.params.id || data?.id,
          userType: user.type || 'admin',
          userId: user.id,
          userEmail: user.email,
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent'],
          details: {
            method: req.method,
            path: req.path,
            body: sanitizeBody(req.body)
          }
        });
      }
      return originalJson(data);
    };

    next();
  };
}

/**
 * Sanitize request body for logging (remove sensitive data)
 */
function sanitizeBody(body) {
  if (!body) return null;
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'token', 'secret'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***';
    }
  });
  return sanitized;
}

module.exports = {
  logActivity,
  getClientIp,
  createLogMiddleware
};
