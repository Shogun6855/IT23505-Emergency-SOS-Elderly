const emailService = require('./emailService');
const smsService = require('./smsService');
const logger = require('../utils/logger');
const db = require('../config/database');

const sendEmergencyNotification = async ({ caregiver, elder, emergency }) => {
  try {
    const promises = [];

    // Send email notification
    promises.push(
      emailService.sendEmergencyEmail({
        to: caregiver.email,
        elderName: elder.name,
        location: emergency.location,
        time: emergency.time,
        notes: emergency.notes
      })
    );

    // Send SMS notification
    promises.push(
      smsService.sendEmergencySMS({
        to: caregiver.phone,
        elderName: elder.name,
        location: emergency.location,
        time: emergency.time
      })
    );

    const results = await Promise.allSettled(promises);

    // Log notification record
    await db.query(
      `INSERT INTO notifications (emergency_id, recipient_id, recipient_type, channel, status, created_at)
       VALUES ($1, $2, 'caregiver', 'email', $3, NOW())`,
      [emergency.id, caregiver.id, results[0].status === 'fulfilled' && results[0].value.success ? 'sent' : 'failed']
    );

    await db.query(
      `INSERT INTO notifications (emergency_id, recipient_id, recipient_type, channel, status, created_at)
       VALUES ($1, $2, 'caregiver', 'sms', $3, NOW())`,
      [emergency.id, caregiver.id, results[1].status === 'fulfilled' && results[1].value.success ? 'sent' : 'failed']
    );

    logger.info(`Emergency notifications sent to caregiver ${caregiver.id} for emergency ${emergency.id}`);

    return {
      success: true,
      email: results[0].status === 'fulfilled' ? results[0].value : { success: false },
      sms: results[1].status === 'fulfilled' ? results[1].value : { success: false }
    };

  } catch (error) {
    logger.error('Notification service error:', error);
    return { success: false, error: error.message };
  }
};

const sendWelcomeNotification = async ({ user }) => {
  try {
    const promises = [];

    // Send welcome email
    promises.push(
      emailService.sendWelcomeEmail({
        to: user.email,
        name: user.name
      })
    );

    // Send welcome SMS
    promises.push(
      smsService.sendWelcomeSMS({
        to: user.phone,
        name: user.name
      })
    );

    const results = await Promise.allSettled(promises);

    logger.info(`Welcome notifications sent to user ${user.id}`);

    return {
      success: true,
      email: results[0].status === 'fulfilled' ? results[0].value : { success: false },
      sms: results[1].status === 'fulfilled' ? results[1].value : { success: false }
    };

  } catch (error) {
    logger.error('Welcome notification service error:', error);
    return { success: false, error: error.message };
  }
};

const sendTestNotification = async ({ userId, phone, email, message }) => {
  try {
    const promises = [];

    if (email) {
      promises.push(
        emailService.sendEmergencyEmail({
          to: email,
          elderName: 'Test User',
          location: 'Test Location',
          time: new Date(),
          notes: message || 'This is a test notification'
        })
      );
    }

    if (phone) {
      promises.push(
        smsService.sendTestSMS({
          to: phone,
          message: message || 'This is a test notification'
        })
      );
    }

    const results = await Promise.allSettled(promises);

    logger.info(`Test notifications sent to user ${userId}`);

    return {
      success: true,
      results: results.map(result => 
        result.status === 'fulfilled' ? result.value : { success: false }
      )
    };

  } catch (error) {
    logger.error('Test notification service error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmergencyNotification,
  sendWelcomeNotification,
  sendTestNotification
};