const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, roleAuth } = require('../middleware/auth');
const { updateProfileValidation, addCaregiverValidation } = require('../middleware/validation');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', 
  auth, 
  updateProfileValidation, 
  userController.updateProfile
);

// @route   GET /api/users/caregivers
// @desc    Get caregivers for an elder
// @access  Private (Elder only)
router.get('/caregivers', 
  auth, 
  roleAuth(['elder']), 
  userController.getCaregivers
);

// @route   POST /api/users/caregivers
// @desc    Add a caregiver for an elder
// @access  Private (Elder only)
router.post('/caregivers', 
  auth, 
  roleAuth(['elder']), 
  addCaregiverValidation, 
  userController.addCaregiver
);

// @route   DELETE /api/users/caregivers/:caregiverId
// @desc    Remove a caregiver for an elder
// @access  Private (Elder only)
router.delete('/caregivers/:caregiverId', 
  auth, 
  roleAuth(['elder']), 
  userController.removeCaregiver
);

// @route   GET /api/users/elders
// @desc    Get elders for a caregiver
// @access  Private (Caregiver only)
router.get('/elders', 
  auth, 
  roleAuth(['caregiver']), 
  userController.getElders
);

module.exports = router;