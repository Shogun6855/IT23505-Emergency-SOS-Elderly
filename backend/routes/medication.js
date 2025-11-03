const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  addMedication,
  getUserMedications,
  updateMedication,
  deleteMedication,
  getTodaysMedications,
  markMedicationTaken,
  markMedicationMissed,
  getCaregiverMedications
} = require('../controllers/medicationController');

// All routes require authentication
router.use(auth);

// Medication CRUD operations
router.post('/', addMedication);
router.get('/', getUserMedications);
router.put('/:id', updateMedication);
router.delete('/:id', deleteMedication);

// Medication scheduling and tracking
router.get('/today', getTodaysMedications);
router.put('/logs/:logId/taken', markMedicationTaken);
router.put('/logs/:logId/missed', markMedicationMissed);

// Caregiver medication overview
router.get('/caregiver/overview', getCaregiverMedications);

module.exports = router;