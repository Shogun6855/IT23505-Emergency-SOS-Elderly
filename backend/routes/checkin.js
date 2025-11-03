const express = require('express');
const router = express.Router();
const checkInController = require('../controllers/checkInController');
const { auth, roleAuth } = require('../middleware/auth');

// @route   POST /api/checkin
// @desc    Record a check-in (I'm Okay button)
// @access  Private (Elder only)
router.post('/', 
  auth, 
  roleAuth(['elder']), 
  checkInController.checkIn
);

// @route   GET /api/checkin
// @desc    Get last check-in for an elder
// @access  Private (Elder only)
router.get('/', 
  auth, 
  roleAuth(['elder']), 
  checkInController.getLastCheckIn
);

module.exports = router;

