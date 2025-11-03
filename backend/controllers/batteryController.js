const db = require('../config/database');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

exports.reportBatteryLevel = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { batteryLevel, deviceInfo } = req.body;

    if (batteryLevel < 0 || batteryLevel > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid battery level'
      });
    }

    // Insert battery alert
    await db.query(
      `INSERT INTO battery_alerts (user_id, battery_level, device_info, alert_sent, created_at)
       VALUES ($1, $2, $3, false, NOW())`,
      [userId, batteryLevel, deviceInfo || 'Unknown device']
    );

    // If battery is low (15% or less), send alert to caregivers
    if (batteryLevel <= 15) {
      await this.sendLowBatteryAlert(userId, batteryLevel);
    }

    logger.info(`Battery level ${batteryLevel}% reported for user ${userId}`);

    res.json({
      success: true,
      message: 'Battery level reported successfully',
      alertSent: batteryLevel <= 15
    });

  } catch (error) {
    logger.error('Report battery level error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report battery level'
    });
  }
};

exports.sendLowBatteryAlert = async (userId, batteryLevel) => {
  try {
    // Get user info
    const userResult = await db.query(
      'SELECT name, email, phone FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) return;

    const user = userResult.rows[0];

    // Get all caregivers for this elder
    const caregiversResult = await db.query(
      `SELECT u.id, u.name, u.email, u.phone, uc.relationship
       FROM users u
       JOIN user_caregivers uc ON u.id = uc.caregiver_id
       WHERE uc.elder_id = $1 AND uc.is_active = true`,
      [userId]
    );

    const caregivers = caregiversResult.rows;
    const message = `🔋 Low Battery Alert: ${user.name}'s phone battery is at ${batteryLevel}%. The phone may go off soon.`;

    for (const caregiver of caregivers) {
      // Create notification
      await db.query(
        `INSERT INTO notifications (user_id, type, message, read, sent_at, created_at)
         VALUES ($1, 'battery_alert', $2, false, NOW(), NOW())`,
        [caregiver.id, message]
      );

      // Send email/SMS if configured
      await notificationService.sendNotification({
        to: caregiver.email,
        subject: `Low Battery Alert: ${user.name}`,
        message: message
      });

      logger.info(`Low battery alert sent to caregiver ${caregiver.id} for elder ${userId}`);
    }

    // Mark alert as sent
    await db.query(
      `UPDATE battery_alerts
       SET alert_sent = true
       WHERE user_id = $1
       AND id = (SELECT id FROM battery_alerts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1)`,
      [userId]
    );

  } catch (error) {
    logger.error('Send low battery alert error:', error);
  }
};

