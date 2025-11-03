const db = require('../config/database');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

exports.getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { upcoming = true } = req.query;

    let query = 'SELECT * FROM appointments WHERE user_id = $1';
    const params = [userId];

    if (upcoming === 'true') {
      query += ' AND appointment_date > NOW() AND completed = false ORDER BY appointment_date ASC';
    } else {
      query += ' ORDER BY appointment_date DESC';
    }

    const result = await db.query(query, params);

    res.json({
      success: true,
      appointments: result.rows
    });
  } catch (error) {
    logger.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
};

exports.addAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      appointment_type,
      doctor_name,
      location,
      appointment_date,
      notes
    } = req.body;

    if (!title || !appointment_date) {
      return res.status(400).json({
        success: false,
        message: 'Title and appointment date are required'
      });
    }

    const result = await db.query(
      `INSERT INTO appointments (
        user_id, title, description, appointment_type, doctor_name,
        location, appointment_date, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [userId, title, description, appointment_type, doctor_name, location, appointment_date, notes]
    );

    logger.info(`Appointment added for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Appointment added successfully',
      appointment: result.rows[0]
    });
  } catch (error) {
    logger.error('Add appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add appointment'
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Verify ownership
    const check = await db.query(
      'SELECT id FROM appointments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (['title', 'description', 'appointment_type', 'doctor_name', 'location', 'appointment_date', 'notes', 'completed'].includes(key)) {
        updateFields.push(`${key} = $${paramCount++}`);
        values.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    await db.query(
      `UPDATE appointments SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    res.json({
      success: true,
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    logger.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment'
    });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM appointments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    logger.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment'
    });
  }
};

