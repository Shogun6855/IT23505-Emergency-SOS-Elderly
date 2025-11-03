const db = require('../config/database');
const logger = require('../utils/logger');

class AppointmentReminderService {
  constructor(io) {
    this.io = io;
    this.checkInterval = null;
  }

  start() {
    // Check every 15 minutes for upcoming appointments
    this.checkInterval = setInterval(() => {
      this.checkUpcomingAppointments();
    }, 15 * 60 * 1000);

    logger.info('Appointment reminder service started');
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    logger.info('Appointment reminder service stopped');
  }

  async checkUpcomingAppointments() {
    try {
      const now = new Date();
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Check for appointments 24 hours away
      const dayAhead = await db.query(
        `SELECT a.*, u.name as elder_name, u.email
         FROM appointments a
         JOIN users u ON a.user_id = u.id
         WHERE a.completed = false
         AND a.reminder_sent_24h = false
         AND a.appointment_date BETWEEN $1 AND $2`,
        [oneDayFromNow, new Date(oneDayFromNow.getTime() + 15 * 60 * 1000)]
      );

      for (const appointment of dayAhead.rows) {
        await this.send24HourReminder(appointment);
        await db.query(
          'UPDATE appointments SET reminder_sent_24h = true WHERE id = $1',
          [appointment.id]
        );
      }

      // Check for appointments 1 hour away
      const hourAhead = await db.query(
        `SELECT a.*, u.name as elder_name, u.email
         FROM appointments a
         JOIN users u ON a.user_id = u.id
         WHERE a.completed = false
         AND a.reminder_sent_1h = false
         AND a.appointment_date BETWEEN $1 AND $2`,
        [oneHourFromNow, new Date(oneHourFromNow.getTime() + 15 * 60 * 1000)]
      );

      for (const appointment of hourAhead.rows) {
        await this.send1HourReminder(appointment);
        await db.query(
          'UPDATE appointments SET reminder_sent_1h = true WHERE id = $1',
          [appointment.id]
        );
      }

    } catch (error) {
      logger.error('Check upcoming appointments error:', error);
    }
  }

  async send24HourReminder(appointment) {
    try {
      const message = `📅 Reminder: You have an appointment "${appointment.title}" tomorrow at ${new Date(appointment.appointment_date).toLocaleString()}`;

      // Create notification
      await db.query(
        `INSERT INTO notifications (user_id, type, message, read, sent_at, created_at)
         VALUES ($1, 'appointment_reminder', $2, false, NOW(), NOW())`,
        [appointment.user_id, message]
      );

      // Send socket notification
      if (this.io) {
        this.io.to(`elder-${appointment.user_id}`).emit('appointment-reminder', {
          appointment: appointment,
          reminderType: '24h',
          message: message
        });
      }

      // Notify caregivers
      const caregivers = await db.query(
        `SELECT uc.caregiver_id
         FROM user_caregivers uc
         WHERE uc.elder_id = $1 AND uc.is_active = true`,
        [appointment.user_id]
      );

      for (const caregiver of caregivers.rows) {
        const caregiverMessage = `📅 ${appointment.elder_name} has an appointment "${appointment.title}" tomorrow at ${new Date(appointment.appointment_date).toLocaleString()}`;

        await db.query(
          `INSERT INTO notifications (user_id, type, message, read, sent_at, created_at)
           VALUES ($1, 'appointment_reminder', $2, false, NOW(), NOW())`,
          [caregiver.caregiver_id, caregiverMessage]
        );

        if (this.io) {
          this.io.to(`caregiver-${caregiver.caregiver_id}`).emit('appointment-reminder', {
            appointment: appointment,
            elderName: appointment.elder_name,
            reminderType: '24h',
            message: caregiverMessage
          });
        }
      }

      logger.info(`24h appointment reminder sent for appointment ${appointment.id}`);
    } catch (error) {
      logger.error('Send 24h reminder error:', error);
    }
  }

  async send1HourReminder(appointment) {
    try {
      const message = `⏰ Reminder: You have an appointment "${appointment.title}" in 1 hour at ${new Date(appointment.appointment_date).toLocaleString()}`;

      // Create notification
      await db.query(
        `INSERT INTO notifications (user_id, type, message, read, sent_at, created_at)
         VALUES ($1, 'appointment_reminder', $2, false, NOW(), NOW())`,
        [appointment.user_id, message]
      );

      // Send socket notification
      if (this.io) {
        this.io.to(`elder-${appointment.user_id}`).emit('appointment-reminder', {
          appointment: appointment,
          reminderType: '1h',
          message: message
        });
      }

      logger.info(`1h appointment reminder sent for appointment ${appointment.id}`);
    } catch (error) {
      logger.error('Send 1h reminder error:', error);
    }
  }
}

module.exports = AppointmentReminderService;

