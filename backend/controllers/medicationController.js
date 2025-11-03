const db = require('../config/database');
const logger = require('../utils/logger');

// Add new medication
const addMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, timeSlots, instructions, startDate, endDate } = req.body;
    
    // Debug logging
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    
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

// Get medications for elders under a caregiver's care
const getCaregiverMedications = async (req, res) => {
  try {
    const caregiverId = req.user.id;

    // Get all elders assigned to this caregiver
    const eldersQuery = `
      SELECT u.id, u.name, u.email
      FROM users u
      JOIN user_caregivers uc ON u.id = uc.elder_id
      WHERE uc.caregiver_id = $1 AND uc.is_active = true
    `;

    const eldersResult = await db.query(eldersQuery, [caregiverId]);
    const elders = eldersResult.rows;

    const medicationData = [];

    for (const elder of elders) {
      // Get active medications for this elder
      const medsQuery = `
        SELECT * FROM medications 
        WHERE user_id = $1 AND is_active = true
        ORDER BY created_at DESC
      `;
      const medsResult = await db.query(medsQuery, [elder.id]);
      const medications = medsResult.rows.map(med => ({
        ...med,
        time_slots: JSON.parse(med.time_slots)
      }));

      // Get today's medication logs
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const logsQuery = `
        SELECT ml.*, m.name as medication_name, m.dosage
        FROM medication_logs ml
        JOIN medications m ON ml.medication_id = m.id
        WHERE ml.user_id = $1
        AND ml.scheduled_time BETWEEN $2 AND $3
        ORDER BY ml.scheduled_time ASC
      `;

      const logsResult = await db.query(logsQuery, [elder.id, todayStart, todayEnd]);
      const todayLogs = logsResult.rows;

      // Calculate statistics
      const takenCount = todayLogs.filter(log => log.status === 'taken').length;
      const missedCount = todayLogs.filter(log => log.status === 'missed').length;
      const pendingCount = todayLogs.filter(log => log.status === 'pending').length;
      const totalScheduled = todayLogs.length;
      const adherenceRate = totalScheduled > 0 
        ? Math.round((takenCount / totalScheduled) * 100) 
        : 0;

      // Get next scheduled medication
      const nextScheduledQuery = `
        SELECT ml.*, m.name as medication_name, m.dosage
        FROM medication_logs ml
        JOIN medications m ON ml.medication_id = m.id
        WHERE ml.user_id = $1
        AND ml.status = 'pending'
        AND ml.scheduled_time > NOW()
        ORDER BY ml.scheduled_time ASC
        LIMIT 1
      `;
      const nextResult = await db.query(nextScheduledQuery, [elder.id]);
      const nextScheduled = nextResult.rows[0] || null;

      // Get last 7 days adherence
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekLogsQuery = `
        SELECT COUNT(*) as total, 
               COUNT(CASE WHEN status = 'taken' THEN 1 END) as taken
        FROM medication_logs
        WHERE user_id = $1
        AND scheduled_time >= $2
      `;
      const weekResult = await db.query(weekLogsQuery, [elder.id, weekStart]);
      const weekStats = weekResult.rows[0];
      const weekAdherence = weekStats.total > 0
        ? Math.round((parseInt(weekStats.taken) / parseInt(weekStats.total)) * 100)
        : 0;

      medicationData.push({
        elderId: elder.id,
        elderName: elder.name,
        elderEmail: elder.email,
        activeMedications: medications.length,
        medications: medications,
        todayStats: {
          taken: takenCount,
          missed: missedCount,
          pending: pendingCount,
          total: totalScheduled,
          adherence: adherenceRate
        },
        weekAdherence: weekAdherence,
        nextScheduled: nextScheduled ? {
          medication: nextScheduled.medication_name,
          dosage: nextScheduled.dosage,
          time: nextScheduled.scheduled_time
        } : null,
        todayLogs: todayLogs
      });
    }

    res.json({
      success: true,
      data: medicationData
    });
  } catch (error) {
    logger.error('Error fetching caregiver medications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medication data'
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

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(name.trim());
    }
    if (dosage !== undefined) {
      updateFields.push(`dosage = $${paramCount++}`);
      values.push(dosage.trim());
    }
    if (frequency !== undefined) {
      updateFields.push(`frequency = $${paramCount++}`);
      values.push(frequency);
    }
    if (timeSlots !== undefined) {
      updateFields.push(`time_slots = $${paramCount++}`);
      values.push(JSON.stringify(timeSlots));
    }
    if (instructions !== undefined) {
      updateFields.push(`instructions = $${paramCount++}`);
      values.push(instructions?.trim() || null);
    }
    if (startDate !== undefined) {
      updateFields.push(`start_date = $${paramCount++}`);
      values.push(startDate);
    }
    if (endDate !== undefined) {
      updateFields.push(`end_date = $${paramCount++}`);
      values.push(endDate || null);
    }
    if (isActive !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      values.push(isActive);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE medications 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    const medication = result.rows[0];

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

    // Check if medication belongs to user
    const checkQuery = 'SELECT id FROM medications WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    // Soft delete by setting is_active to false
    await db.query(
      'UPDATE medications SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );

    logger.info(`Medication ${id} deleted by user ${userId}`);

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

// Get today's medications
const getTodaysMedications = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query = `
      SELECT ml.*, m.name, m.dosage, m.instructions
      FROM medication_logs ml
      JOIN medications m ON ml.medication_id = m.id
      WHERE ml.user_id = $1
      AND ml.scheduled_time >= $2
      AND ml.scheduled_time < $3
      ORDER BY ml.scheduled_time ASC
    `;

    const result = await db.query(query, [userId, today, tomorrow]);
    const logs = result.rows.map(log => ({
      ...log,
      medication: {
        name: log.name,
        dosage: log.dosage,
        instructions: log.instructions
      }
    }));

    res.json({
      success: true,
      data: logs
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

    // Get the medication log and verify ownership
    const logQuery = `
      SELECT ml.*, m.name as medication_name
      FROM medication_logs ml
      JOIN medications m ON ml.medication_id = m.id
      WHERE ml.id = $1 AND ml.user_id = $2
    `;
    const logResult = await db.query(logQuery, [logId, userId]);

    if (logResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medication log not found'
      });
    }

    const medicationLog = logResult.rows[0];

    // Update log status
    await db.query(
      `UPDATE medication_logs 
       SET status = 'taken', 
           taken_at = NOW(), 
           notes = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [notes || null, logId]
    );

    // Notify caregivers via socket
    const io = req.app.get('io');
    if (io) {
      const caregiverQuery = `
        SELECT uc.caregiver_id, u.name as elder_name
        FROM user_caregivers uc
        JOIN users u ON uc.elder_id = u.id
        WHERE uc.elder_id = $1 AND uc.is_active = true
      `;
      const caregiverResult = await db.query(caregiverQuery, [userId]);

      caregiverResult.rows.forEach(row => {
        io.to(`caregiver-${row.caregiver_id}`).emit('medication-taken', {
          elderName: row.elder_name,
          medication: medicationLog.medication_name,
          timestamp: new Date().toISOString()
        });
      });
    }

    logger.info(`Medication ${medicationLog.medication_name} marked as taken by user ${userId}`);

    res.json({
      success: true,
      message: 'Medication marked as taken'
    });
  } catch (error) {
    logger.error('Error marking medication as taken:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark medication as taken'
    });
  }
};

// Mark medication as missed
const markMedicationMissed = async (req, res) => {
  try {
    const { logId } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    // Get the medication log and verify ownership
    const logQuery = `
      SELECT ml.*, m.name as medication_name
      FROM medication_logs ml
      JOIN medications m ON ml.medication_id = m.id
      WHERE ml.id = $1 AND ml.user_id = $2
    `;
    const logResult = await db.query(logQuery, [logId, userId]);

    if (logResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medication log not found'
      });
    }

    const medicationLog = logResult.rows[0];

    // Update log status
    await db.query(
      `UPDATE medication_logs 
       SET status = 'missed', 
           notes = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [notes || null, logId]
    );

    // Notify caregivers about missed medication
    const io = req.app.get('io');
    if (io) {
      const caregiverQuery = `
        SELECT uc.caregiver_id, u.name as elder_name
        FROM user_caregivers uc
        JOIN users u ON uc.elder_id = u.id
        WHERE uc.elder_id = $1 AND uc.is_active = true
      `;
      const caregiverResult = await db.query(caregiverQuery, [userId]);

      // Notify caregivers about missed medication
      caregiverResult.rows.forEach(row => {
        io.to(`caregiver-${row.caregiver_id}`).emit('medication-missed', {
          elderName: row.elder_name,
          medication: medicationLog.medication_name,
          timestamp: new Date().toISOString()
        });
      });
    }

    logger.info(`Medication ${medicationLog.medication_name} marked as missed by user ${userId}`);

    res.json({
      success: true,
      message: 'Medication marked as missed'
    });
  } catch (error) {
    logger.error('Error marking medication as missed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark medication as missed'
    });
  }
};

// Generate medication logs for a medication
const generateMedicationLogs = async (medication) => {
  try {
    const timeSlots = JSON.parse(medication.time_slots);
    const startDate = new Date(medication.start_date);
    const endDate = medication.end_date ? new Date(medication.end_date) : null;

    // Generate logs for the next 7 days
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);

      // Skip if past end date
      if (endDate && currentDate > endDate) {
        break;
      }

      for (const timeSlot of timeSlots) {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        const scheduledTime = new Date(currentDate);
        scheduledTime.setHours(hours, minutes, 0, 0);

        // Only create logs for future times
        if (scheduledTime > new Date()) {
          await db.query(
            `INSERT INTO medication_logs (medication_id, user_id, scheduled_time, status, created_at)
             VALUES ($1, $2, $3, 'pending', NOW())
             ON CONFLICT DO NOTHING`,
            [medication.id, medication.user_id, scheduledTime]
          );
        }
      }
    }

    logger.info(`Generated medication logs for medication ${medication.id}`);
  } catch (error) {
    logger.error('Error generating medication logs:', error);
    throw error;
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
  generateMedicationLogs,
  getCaregiverMedications
};
