const db = require('../config/database');
const logger = require('../utils/logger');

exports.getMedicalProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM medical_profiles WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        profile: null
      });
    }

    res.json({
      success: true,
      profile: result.rows[0]
    });
  } catch (error) {
    logger.error('Get medical profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical profile'
    });
  }
};

exports.updateMedicalProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      allergies,
      conditions,
      current_medications,
      blood_type,
      doctor_name,
      doctor_phone,
      doctor_email,
      insurance_provider,
      insurance_number,
      emergency_notes
    } = req.body;

    // Check if profile exists
    const existing = await db.query(
      'SELECT id FROM medical_profiles WHERE user_id = $1',
      [userId]
    );

    if (existing.rows.length === 0) {
      // Create new profile
      await db.query(
        `INSERT INTO medical_profiles (
          user_id, allergies, conditions, current_medications, blood_type,
          doctor_name, doctor_phone, doctor_email, insurance_provider,
          insurance_number, emergency_notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          userId, allergies, conditions, current_medications, blood_type,
          doctor_name, doctor_phone, doctor_email, insurance_provider,
          insurance_number, emergency_notes
        ]
      );
    } else {
      // Update existing profile
      await db.query(
        `UPDATE medical_profiles SET
          allergies = $1, conditions = $2, current_medications = $3,
          blood_type = $4, doctor_name = $5, doctor_phone = $6,
          doctor_email = $7, insurance_provider = $8, insurance_number = $9,
          emergency_notes = $10, updated_at = NOW()
        WHERE user_id = $11`,
        [
          allergies, conditions, current_medications, blood_type,
          doctor_name, doctor_phone, doctor_email, insurance_provider,
          insurance_number, emergency_notes, userId
        ]
      );
    }

    logger.info(`Medical profile updated for user ${userId}`);

    res.json({
      success: true,
      message: 'Medical profile updated successfully'
    });
  } catch (error) {
    logger.error('Update medical profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medical profile'
    });
  }
};

exports.getElderMedicalProfile = async (req, res) => {
  try {
    const { elderId } = req.params;
    const caregiverId = req.user.id;

    // Verify caregiver relationship
    const relationship = await db.query(
      'SELECT id FROM user_caregivers WHERE elder_id = $1 AND caregiver_id = $2 AND is_active = true',
      [elderId, caregiverId]
    );

    if (relationship.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Not authorized to view this profile'
      });
    }

    const result = await db.query(
      'SELECT * FROM medical_profiles WHERE user_id = $1',
      [elderId]
    );

    res.json({
      success: true,
      profile: result.rows[0] || null
    });
  } catch (error) {
    logger.error('Get elder medical profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical profile'
    });
  }
};

