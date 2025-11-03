const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');

// @route   GET /api/appointments
// @desc    Get user's appointments
// @access  Private
router.get('/', auth, appointmentController.getAppointments);

// @route   POST /api/appointments
// @desc    Add new appointment
// @access  Private
router.post('/', auth, appointmentController.addAppointment);

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', auth, appointmentController.updateAppointment);

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', auth, appointmentController.deleteAppointment);

module.exports = router;

