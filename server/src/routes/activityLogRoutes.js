const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityLogController');

// GET /api/activity-logs
router.get('/', getActivityLogs);

module.exports = router;
