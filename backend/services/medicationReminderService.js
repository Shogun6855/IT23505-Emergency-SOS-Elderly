const db = require('../config/database');
const logger = require('../utils/logger');
const cron = require('node-cron');
const { generateMedicationLogs } = require('../controllers/medicationController');

class MedicationReminderService {
  constructor(io) {
    this.io = io;
    this.scheduleMedicationCheck();
    this.scheduleDailyLogGeneration();
  }

  // Check for upcoming medications every minute
  scheduleMedicationCheck() {
    cron.schedule('* * * * *', async () => {
      try {
        await this.checkUpcomingMedications();
      } catch (error) {
        logger.error('Error checking upcoming medications:', error);
      }
    });
  }

  // Generate medication logs for the next day at midnight
  scheduleDailyLogGeneration() {
    cron.schedule('0 0 * * *', async () => {
      try {
        await this.generateDailyMedicationLogs();
      } catch (error) {
        logger.error('Error generating daily medication logs:', error);
      }
    });
  }

  async checkUpcomingMedications() {
    try {
      const now = new Date();
      const reminderTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

      const query = `
        SELECT 
          ml.*,
          m.name as medication_name,
          m.dosage,
          m.instructions,
          u.name as user_name,
          u.id as user_id
        FROM medication_logs ml
        JOIN medications m ON ml.medication_id = m.id
        JOIN users u ON ml.user_id = u.id
        WHERE ml.status = 'pending'
        AND ml.scheduled_time BETWEEN $1 AND $2
        AND m.is_active = true
      `;

      const result = await db.query(query, [now, reminderTime]);
      
      for (const medication of result.rows) {
        await this.sendMedicationReminder(medication);
      }
    } catch (error) {
      logger.error('Error in checkUpcomingMedications:', error);
    }
  }

  async sendMedicationReminder(medication) {
    try {
      const reminderData = {
        id: medication.id,
        medicationName: medication.medication_name,
        dosage: medication.dosage,
        scheduledTime: medication.scheduled_time,
        instructions: medication.instructions,
        userName: medication.user_name
      };

      // Send real-time notification to elder
      this.io.to(`elder-${medication.user_id}`).emit('medication-reminder', reminderData);

      // Send notification to caregivers
      const caregiverQuery = `
        SELECT uc.caregiver_id 
        FROM user_caregivers uc 
        WHERE uc.elder_id = $1
      `;
      const caregiverResult = await db.query(caregiverQuery, [medication.user_id]);
      
      caregiverResult.rows.forEach(row => {
        this.io.to(`caregiver-${row.caregiver_id}`).emit('medication-reminder-caregiver', {
          ...reminderData,
          elderName: medication.user_name
        });
      });

      logger.info(`Medication reminder sent for user ${medication.user_id}: ${medication.medication_name}`);
    } catch (error) {
      logger.error('Error sending medication reminder:', error);
    }
  }

  async generateDailyMedicationLogs() {
    try {
      logger.info('Generating daily medication logs...');

      const query = `
        SELECT * FROM medications 
        WHERE is_active = true 
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
      `;

      const result = await db.query(query);
      
      for (const medication of result.rows) {
        await generateMedicationLogs(medication);
      }

      logger.info(`Generated logs for ${result.rows.length} active medications`);
    } catch (error) {
      logger.error('Error generating daily medication logs:', error);
    }
  }

  async checkMissedMedications() {
    try {
      const now = new Date();
      const gracePeriod = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago

      const query = `
        UPDATE medication_logs 
        SET status = 'missed'
        WHERE status = 'pending' 
        AND scheduled_time < $1
        RETURNING *
      `;

      const result = await db.query(query, [gracePeriod]);
      
      if (result.rows.length > 0) {
        logger.info(`Marked ${result.rows.length} medications as missed`);
        
        // Notify caregivers about missed medications
        for (const missedMed of result.rows) {
          const caregiverQuery = `
            SELECT uc.caregiver_id, u.name as elder_name
            FROM user_caregivers uc 
            JOIN users u ON uc.elder_id = u.id
            WHERE uc.elder_id = $1
          `;
          const caregiverResult = await db.query(caregiverQuery, [missedMed.user_id]);
          
          caregiverResult.rows.forEach(row => {
            this.io.to(`caregiver-${row.caregiver_id}`).emit('medication-auto-missed', {
              elderName: row.elder_name,
              medicationId: missedMed.id,
              scheduledTime: missedMed.scheduled_time,
              timestamp: new Date().toISOString()
            });
          });
        }
      }
    } catch (error) {
      logger.error('Error checking missed medications:', error);
    }
  }

  // Get medication adherence statistics
  async getMedicationStats(userId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const query = `
        SELECT 
          COUNT(*) as total_scheduled,
          COUNT(CASE WHEN status = 'taken' THEN 1 END) as taken,
          COUNT(CASE WHEN status = 'missed' THEN 1 END) as missed,
          COUNT(CASE WHEN status = 'skipped' THEN 1 END) as skipped
        FROM medication_logs 
        WHERE user_id = $1 
        AND scheduled_time >= $2
      `;

      const result = await db.query(query, [userId, startDate]);
      const stats = result.rows[0];

      return {
        totalScheduled: parseInt(stats.total_scheduled),
        taken: parseInt(stats.taken),
        missed: parseInt(stats.missed),
        skipped: parseInt(stats.skipped),
        adherenceRate: stats.total_scheduled > 0 
          ? Math.round((stats.taken / stats.total_scheduled) * 100) 
          : 0
      };
    } catch (error) {
      logger.error('Error getting medication stats:', error);
      return null;
    }
  }
}

module.exports = MedicationReminderService;