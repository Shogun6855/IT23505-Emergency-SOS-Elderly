const db = require('../config/database');
const logger = require('../utils/logger');
const notificationService = require('./notificationService');

class CheckInReminderService {
  constructor(io) {
    this.io = io;
    this.checkInterval = null;
  }

  start() {
    // Check every 5 minutes for overdue check-ins
    this.checkInterval = setInterval(() => {
      this.checkOverdueCheckIns();
    }, 5 * 60 * 1000);

    logger.info('Check-in reminder service started');
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    logger.info('Check-in reminder service stopped');
  }

  async checkOverdueCheckIns() {
    try {
      const now = new Date();

      // Find all elders who have overdue check-ins
      const result = await db.query(
        `SELECT DISTINCT ci.user_id, u.name, u.email, u.phone,
                ci.check_in_time, ci.next_reminder_time, ci.reminder_hours
         FROM check_ins ci
         JOIN users u ON ci.user_id = u.id
         WHERE u.role = 'elder'
         AND ci.next_reminder_time <= $1
         AND NOT EXISTS (
           SELECT 1 FROM check_ins ci2
           WHERE ci2.user_id = ci.user_id
           AND ci2.check_in_time > ci.check_in_time
           AND ci2.check_in_time > ci.next_reminder_time
         )`,
        [now]
      );

      for (const elder of result.rows) {
        await this.sendReminderToCaregivers(elder);
        
        // Update next reminder time (extend by another cycle)
        const nextReminder = new Date(elder.next_reminder_time);
        nextReminder.setHours(nextReminder.getHours() + elder.reminder_hours);
        
        await db.query(
          `UPDATE check_ins
           SET next_reminder_time = $1
           WHERE user_id = $2
           AND id = (SELECT id FROM check_ins WHERE user_id = $2 ORDER BY created_at DESC LIMIT 1)`,
          [nextReminder, elder.user_id]
        );
      }

    } catch (error) {
      logger.error('Check overdue check-ins error:', error);
    }
  }

  async sendReminderToCaregivers(elder) {
    try {
      // Get all caregivers for this elder
      const caregiversResult = await db.query(
        `SELECT u.id, u.name, u.email, u.phone, uc.relationship
         FROM users u
         JOIN user_caregivers uc ON u.id = uc.caregiver_id
         WHERE uc.elder_id = $1 AND uc.is_active = true`,
        [elder.user_id]
      );

      const caregivers = caregiversResult.rows;
      const lastCheckIn = new Date(elder.check_in_time);
      const hoursSinceCheckIn = Math.floor((new Date() - lastCheckIn) / (1000 * 60 * 60));

      for (const caregiver of caregivers) {
        const message = `⚠️ Check-in Reminder: ${elder.name} hasn't checked in for ${hoursSinceCheckIn} hours. Last check-in was at ${lastCheckIn.toLocaleString()}.`;

        // Create notification
        await db.query(
          `INSERT INTO notifications (user_id, type, message, read, sent_at, created_at)
           VALUES ($1, 'check_in_reminder', $2, false, NOW(), NOW())`,
          [caregiver.id, message]
        );

        // Send socket notification
        if (this.io) {
          this.io.to(`caregiver-${caregiver.id}`).emit('notification', {
            type: 'check_in_reminder',
            message: message,
            elderName: elder.name,
            hoursSinceCheckIn: hoursSinceCheckIn
          });
        }

        // Send email/SMS if configured
        await notificationService.sendNotification({
          to: caregiver.email,
          subject: `Check-in Reminder: ${elder.name}`,
          message: message
        });

        logger.info(`Check-in reminder sent to caregiver ${caregiver.id} for elder ${elder.user_id}`);
      }

    } catch (error) {
      logger.error('Send reminder to caregivers error:', error);
    }
  }
}

module.exports = CheckInReminderService;

