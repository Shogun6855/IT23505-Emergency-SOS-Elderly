const express = require('express');
const router = express.Router();
const medicalProfileController = require('../controllers/medicalProfileController');
const { auth, roleAuth } = require('../middleware/auth');

// @route   GET /api/medical-profile
// @desc    Get user's medical profile
// @access  Private
router.get('/', auth, medicalProfileController.getMedicalProfile);

// @route   PUT /api/medical-profile
// @desc    Update user's medical profile
// @access  Private
router.put('/', auth, medicalProfileController.updateMedicalProfile);

// @route   GET /api/medical-profile/elder/:elderId
// @desc    Get elder's medical profile (caregiver only)
// @access  Private (Caregiver only)
router.get('/elder/:elderId',
  auth,
  roleAuth(['caregiver']),
  medicalProfileController.getElderMedicalProfile
);

module.exports = router;

