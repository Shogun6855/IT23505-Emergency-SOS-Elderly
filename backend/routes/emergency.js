const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { auth, roleAuth } = require('../middleware/auth');
const { emergencyValidation } = require('../middleware/validation');

// @route   POST /api/emergency/trigger
// @desc    Trigger an emergency alert
// @access  Private (Elder only)
router.post('/trigger', 
  auth, 
  roleAuth(['elder']), 
  emergencyValidation, 
  emergencyController.triggerEmergency
);

// @route   GET /api/emergency/active
// @desc    Get active emergencies for a caregiver
// @access  Private (Caregiver only)
router.get('/active', 
  auth, 
  roleAuth(['caregiver']), 
  emergencyController.getActiveEmergencies
);

// @route   PUT /api/emergency/:id/resolve
// @desc    Resolve an emergency
// @access  Private (Caregiver only)
router.put('/:id/resolve', 
  auth, 
  roleAuth(['caregiver']), 
  emergencyController.resolveEmergency
);

// @route   GET /api/emergency/history
// @desc    Get emergency history
// @access  Private
router.get('/history', 
  auth, 
  emergencyController.getEmergencyHistory
);

module.exports = router;