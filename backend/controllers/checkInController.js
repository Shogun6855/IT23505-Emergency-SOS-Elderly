const db = require('../config/database');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reminderHours = 6 } = req.body;

    const nextReminderTime = new Date();
    nextReminderTime.setHours(nextReminderTime.getHours() + reminderHours);

    // Delete old check-ins and insert new one
    await db.query(
      `DELETE FROM check_ins WHERE user_id = $1`,
      [userId]
    );

    // Insert new check-in
    await db.query(
      `INSERT INTO check_ins (user_id, check_in_time, next_reminder_time, reminder_hours, created_at)
       VALUES ($1, NOW(), $2, $3, NOW())`,
      [userId, nextReminderTime, reminderHours]
    );

    // Get elder information
    const elderResult = await db.query(
      'SELECT id, name, email, phone FROM users WHERE id = $1',
      [userId]
    );

    if (elderResult.rows.length > 0) {
      const elder = elderResult.rows[0];

      // Get all caregivers for this elder
      const caregiversResult = await db.query(
        `SELECT u.id, u.name, u.email, u.phone, uc.relationship
         FROM users u
         JOIN user_caregivers uc ON u.id = uc.caregiver_id
         WHERE uc.elder_id = $1 AND uc.is_active = true`,
        [userId]
      );

      const caregivers = caregiversResult.rows;

      // Notify caregivers via socket
      const io = req.app.get('io');
      if (io) {
        caregivers.forEach(caregiver => {
          io.to(`caregiver-${caregiver.id}`).emit('elder-check-in', {
            elderId: elder.id,
            elderName: elder.name,
            checkInTime: new Date().toISOString(),
            message: `${elder.name} has checked in - all is okay!`
          });
        });
      }

      // Create notifications for caregivers
      for (const caregiver of caregivers) {
        const message = `✅ ${elder.name} has checked in - all is okay!`;
        
        await db.query(
          `INSERT INTO notifications (user_id, type, message, read, sent_at, created_at)
           VALUES ($1, 'check_in', $2, false, NOW(), NOW())`,
          [caregiver.id, message]
        );
      }

      logger.info(`Check-in recorded for user ${userId} and notified ${caregivers.length} caregiver(s)`);
    } else {
      logger.info(`Check-in recorded for user ${userId}`);
    }

    res.json({
      success: true,
      message: 'Check-in recorded successfully',
      nextReminderTime: nextReminderTime.toISOString()
    });

  } catch (error) {
    logger.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record check-in'
    });
  }
};

exports.getLastCheckIn = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT check_in_time, next_reminder_time, reminder_hours
       FROM check_ins
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        checkIn: null
      });
    }

    res.json({
      success: true,
      checkIn: result.rows[0]
    });

  } catch (error) {
    logger.error('Get check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch check-in'
    });
  }
};

