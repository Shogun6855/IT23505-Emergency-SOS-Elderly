const db = require('../config/database');
const logger = require('../utils/logger');

// Add new medication
const addMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, timeSlots, instructions, startDate, endDate } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !dosage || !frequency || !timeSlots || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, dosage, frequency, time slots, and start date are required'
      });
    }

    // Validate time slots format
    if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Time slots must be a non-empty array'
      });
    }

    const query = `
      INSERT INTO medications (user_id, name, dosage, frequency, time_slots, instructions, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      userId,
      name.trim(),
      dosage.trim(),
      frequency,
      JSON.stringify(timeSlots),
      instructions?.trim() || null,
      startDate,
      endDate || null
    ];

    const result = await db.query(query, values);
    const medication = result.rows[0];

    // Generate initial medication logs for the next 7 days
    await generateMedicationLogs(medication);

    logger.info(`Medication added for user ${userId}: ${name}`);

    res.status(201).json({
      success: true,
      message: 'Medication added successfully',
      data: {
        ...medication,
        time_slots: JSON.parse(medication.time_slots)
      }
    });
  } catch (error) {
    logger.error('Error adding medication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add medication'
    });
  }
};

// Get user's medications
const getUserMedications = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT * FROM medications 
      WHERE user_id = $1 AND is_active = true 
      ORDER BY created_at DESC
    `;

    const result = await db.query(query, [userId]);
    const medications = result.rows.map(med => ({
      ...med,
      time_slots: JSON.parse(med.time_slots)
    }));

    res.json({
      success: true,
      data: medications
    });
  } catch (error) {
    logger.error('Error fetching medications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medications'
    });
  }
};

// Update medication
const updateMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dosage, frequency, timeSlots, instructions, startDate, endDate, isActive } = req.body;
    const userId = req.user.id;

    // Check if medication belongs to user
    const checkQuery = 'SELECT id FROM medications WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    const updateQuery = `
      UPDATE medications 
      SET name = $1, dosage = $2, frequency = $3, time_slots = $4, 
          instructions = $5, start_date = $6, end_date = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND user_id = $10
      RETURNING *
    `;

    const values = [
      name?.trim(),
      dosage?.trim(),
      frequency,
      timeSlots ? JSON.stringify(timeSlots) : null,
      instructions?.trim(),
      startDate,
      endDate,
      isActive !== undefined ? isActive : true,
      id,
      userId
    ];

    const result = await db.query(updateQuery, values);
    const medication = result.rows[0];

    logger.info(`Medication updated for user ${userId}: ${id}`);

    res.json({
      success: true,
      message: 'Medication updated successfully',
      data: {
        ...medication,
        time_slots: JSON.parse(medication.time_slots)
      }
    });
  } catch (error) {
    logger.error('Error updating medication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medication'
    });
  }
};

// Delete medication
const deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = 'UPDATE medications SET is_active = false WHERE id = $1 AND user_id = $2';
    const result = await db.query(query, [id, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    logger.info(`Medication deleted for user ${userId}: ${id}`);

    res.json({
      success: true,
      message: 'Medication deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting medication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete medication'
    });
  }
};

// Get today's medication schedule
const getTodaysMedications = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const query = `
      SELECT 
        ml.*,
        m.name,
        m.dosage,
        m.instructions
      FROM medication_logs ml
      JOIN medications m ON ml.medication_id = m.id
      WHERE ml.user_id = $1 
      AND DATE(ml.scheduled_time) = $2
      ORDER BY ml.scheduled_time
    `;

    const result = await db.query(query, [userId, today]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching today\'s medications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s medications'
    });
  }
};

// Mark medication as taken
const markMedicationTaken = async (req, res) => {
  try {
    const { logId } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const query = `
      UPDATE medication_logs 
      SET status = 'taken', taken_at = CURRENT_TIMESTAMP, notes = $1
      WHERE id = $2 AND user_id = $3 AND status = 'pending'
      RETURNING *
    `;

    const result = await db.query(query, [notes || null, logId, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medication log not found or already updated'
      });
    }

    const io = req.app.get('io');
    
    // Notify caregivers
    const caregiverQuery = `
      SELECT uc.caregiver_id 
      FROM user_caregivers uc 
      WHERE uc.elder_id = $1
    `;
    const caregiverResult = await db.query(caregiverQuery, [userId]);
    
    caregiverResult.rows.forEach(row => {
      io.to(`caregiver-${row.caregiver_id}`).emit('medication-taken', {
        elderName: req.user.name,
        medication: result.rows[0],
        timestamp: new Date().toISOString()
      });
    });

    logger.info(`Medication marked as taken by user ${userId}: ${logId}`);

    res.json({
      success: true,
      message: 'Medication marked as taken',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error marking medication as taken:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medication status'
    });
  }
};

// Mark medication as missed
const markMedicationMissed = async (req, res) => {
  try {
    const { logId } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const query = `
      UPDATE medication_logs 
      SET status = 'missed', notes = $1
      WHERE id = $2 AND user_id = $3 AND status = 'pending'
      RETURNING *
    `;

    const result = await db.query(query, [notes || null, logId, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medication log not found or already updated'
      });
    }

    const io = req.app.get('io');
    
    // Notify caregivers about missed medication
    const caregiverQuery = `
      SELECT uc.caregiver_id 
      FROM user_caregivers uc 
      WHERE uc.elder_id = $1
    `;
    const caregiverResult = await db.query(caregiverQuery, [userId]);
    
    caregiverResult.rows.forEach(row => {
      io.to(`caregiver-${row.caregiver_id}`).emit('medication-missed', {
        elderName: req.user.name,
        medication: result.rows[0],
        timestamp: new Date().toISOString()
      });
    });

    logger.info(`Medication marked as missed by user ${userId}: ${logId}`);

    res.json({
      success: true,
      message: 'Medication marked as missed',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error marking medication as missed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medication status'
    });
  }
};

// Helper function to generate medication logs
const generateMedicationLogs = async (medication) => {
  try {
    const timeSlots = JSON.parse(medication.time_slots);
    const startDate = new Date(medication.start_date);
    const endDate = medication.end_date ? new Date(medication.end_date) : null;
    const today = new Date();
    
    // Generate logs for the next 7 days or until end date
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      // Stop if we've reached the end date
      if (endDate && currentDate > endDate) break;
      
      // Skip if before start date
      if (currentDate < startDate) continue;
      
      // Generate logs for each time slot
      for (const timeSlot of timeSlots) {
        const [hours, minutes] = timeSlot.split(':');
        const scheduledTime = new Date(currentDate);
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const insertQuery = `
          INSERT INTO medication_logs (medication_id, user_id, scheduled_time)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `;
        
        await db.query(insertQuery, [medication.id, medication.user_id, scheduledTime]);
      }
    }
  } catch (error) {
    logger.error('Error generating medication logs:', error);
  }
};

module.exports = {
  addMedication,
  getUserMedications,
  updateMedication,
  deleteMedication,
  getTodaysMedications,
  markMedicationTaken,
  markMedicationMissed,
  generateMedicationLogs
};