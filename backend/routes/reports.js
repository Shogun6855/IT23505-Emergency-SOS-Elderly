const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth, roleAuth } = require('../middleware/auth');

// @route   GET /api/reports/medication
// @desc    Get medication adherence report
// @access  Private
router.get('/medication', auth, reportController.getMedicationReport);

// @route   GET /api/reports/medication/elder/:elderId
// @desc    Get elder's medication report (caregiver only)
// @access  Private (Caregiver only)
router.get('/medication/elder/:elderId',
  auth,
  roleAuth(['caregiver']),
  reportController.getElderMedicationReport
);

module.exports = router;

