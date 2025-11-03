const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { auth } = require('../middleware/auth');

// @route   POST /api/activities
// @desc    Log an activity
// @access  Private
router.post('/', auth, activityController.logActivity);

// @route   GET /api/activities
// @desc    Get user's activities
// @access  Private
router.get('/', auth, activityController.getActivities);

// @route   GET /api/activities/stats
// @desc    Get activity statistics
// @access  Private
router.get('/stats', auth, activityController.getActivityStats);

module.exports = router;

