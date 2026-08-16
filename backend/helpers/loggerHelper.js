const { activity_logs } = require("../models");

/**
 * Log an activity to activity_logs table
 * @param {Object} req - Express request object (contains req.user if authenticated)
 * @param {string} moduleName - Module name (e.g. "Client", "Driver", "Settings", "Vehicle Settings", "Geofence", "Promo Code")
 * @param {string} message - Human readable log message (e.g. "Sub Admin Created sub-admin: Ketan Ketan")
 * @param {Object|string} dataPayload - Object or string of detail payload
 */
const logActivity = async (req, moduleName, message, dataPayload = null) => {
  try {
    let userId = null;
    let client = "Sub Admin";

    if (req) {
      if (req.user) {
        userId = req.user.id;
        if (req.user.role === 'admin') {
          client = 'Admin';
        } else if (req.user.role === 'subadmin') {
          client = 'Sub Admin';
        } else {
          client = req.user.role || 'User';
        }
      }
    }

    await activity_logs.create({
      user_id: userId,
      client,
      module: moduleName,
      message,
      data: dataPayload
    });
  } catch (error) {
    console.error("Error creating activity log:", error);
  }
};

module.exports = {
  logActivity
};
