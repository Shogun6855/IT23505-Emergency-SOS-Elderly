const db = require('../config/database');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getProfile = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, phone, address, emergency_contact, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, phone, address, emergency_contact } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET name = $1, phone = $2, address = $3, emergency_contact = $4, updated_at = NOW()
       WHERE id = $5 
       RETURNING id, name, email, role, phone, address, emergency_contact`,
      [name, phone, address, emergency_contact, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`User profile updated: ${result.rows[0].email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getCaregivers = async (req, res) => {
  try {
    const elderId = req.user.userId;

    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.phone, uc.relationship, uc.created_at
       FROM users u
       JOIN user_caregivers uc ON u.id = uc.caregiver_id
       WHERE uc.elder_id = $1 AND uc.is_active = true
       ORDER BY uc.created_at DESC`,
      [elderId]
    );

    res.json({
      success: true,
      caregivers: result.rows
    });

  } catch (error) {
    logger.error('Get caregivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch caregivers'
    });
  }
};

exports.addCaregiver = async (req, res) => {
  try {
    const { caregiver_email, relationship } = req.body;
    const elderId = req.user.userId;

    // Find caregiver by email
    const caregiverResult = await db.query(
      'SELECT id FROM users WHERE email = $1 AND role = $2',
      [caregiver_email, 'caregiver']
    );

    if (caregiverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    const caregiverId = caregiverResult.rows[0].id;

    // Check if relationship already exists
    const existingResult = await db.query(
      'SELECT id FROM user_caregivers WHERE elder_id = $1 AND caregiver_id = $2',
      [elderId, caregiverId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This caregiver is already added'
      });
    }

    // Add caregiver relationship
    await db.query(
      'INSERT INTO user_caregivers (elder_id, caregiver_id, relationship, is_active, created_at) VALUES ($1, $2, $3, true, NOW())',
      [elderId, caregiverId, relationship]
    );

    logger.info(`Caregiver ${caregiverId} added for elder ${elderId}`);

    res.json({
      success: true,
      message: 'Caregiver added successfully'
    });

  } catch (error) {
    logger.error('Add caregiver error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add caregiver'
    });
  }
};

exports.removeCaregiver = async (req, res) => {
  try {
    const { caregiverId } = req.params;
    const elderId = req.user.userId;

    const result = await db.query(
      'UPDATE user_caregivers SET is_active = false WHERE elder_id = $1 AND caregiver_id = $2',
      [elderId, caregiverId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver relationship not found'
      });
    }

    logger.info(`Caregiver ${caregiverId} removed for elder ${elderId}`);

    res.json({
      success: true,
      message: 'Caregiver removed successfully'
    });

  } catch (error) {
    logger.error('Remove caregiver error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove caregiver'
    });
  }
};

exports.getElders = async (req, res) => {
  try {
    const caregiverId = req.user.userId;

    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.phone, u.address, u.emergency_contact, 
              uc.relationship, uc.created_at,
              (SELECT COUNT(*) FROM emergencies WHERE elder_id = u.id AND status = 'active') as active_emergencies
       FROM users u
       JOIN user_caregivers uc ON u.id = uc.elder_id
       WHERE uc.caregiver_id = $1 AND uc.is_active = true
       ORDER BY uc.created_at DESC`,
      [caregiverId]
    );

    res.json({
      success: true,
      elders: result.rows
    });

  } catch (error) {
    logger.error('Get elders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch elders'
    });
  }
};