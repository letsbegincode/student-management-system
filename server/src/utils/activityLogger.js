const prisma = require('../services/prismaClient');

const logActivity = async (action, studentId, studentName, details = null) => {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        studentId,
        studentName,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
};

module.exports = { logActivity };
