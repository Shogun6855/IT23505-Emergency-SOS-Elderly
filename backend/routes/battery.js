const express = require('express');
const router = express.Router();
const batteryController = require('../controllers/batteryController');
const { auth } = require('../middleware/auth');

// @route   POST /api/battery
// @desc    Report battery level (from mobile app)
// @access  Private
router.post('/', 
  auth, 
  batteryController.reportBatteryLevel
);

module.exports = router;

