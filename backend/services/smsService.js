const twilio = require('twilio');
const config = require('../config/config');
const logger = require('../utils/logger');

let client;

if (config.twilio.accountSid && config.twilio.authToken) {
  client = twilio(config.twilio.accountSid, config.twilio.authToken);
} else {
  logger.warn('Twilio credentials not configured. SMS functionality will be disabled.');
}

const sendEmergencySMS = async ({ to, elderName, location, time }) => {
  try {
    if (!client) {
      logger.warn('Twilio not configured, skipping SMS');
      return { success: false, error: 'SMS service not configured' };
    }

    const message = `🚨 EMERGENCY ALERT: ${elderName} needs immediate help! 
Location: ${location}
Time: ${new Date(time).toLocaleString()}
Please contact them immediately or go to their location. 
- Emergency SOS System`;

    const result = await client.messages.create({
      body: message,
      from: config.twilio.phoneNumber,
      to: to
    });

    logger.info(`Emergency SMS sent to ${to} for elder ${elderName}. SID: ${result.sid}`);
    return { success: true, sid: result.sid };

  } catch (error) {
    logger.error('SMS service error:', error);
    return { success: false, error: error.message };
  }
};

const sendWelcomeSMS = async ({ to, name }) => {
  try {
    if (!client) {
      logger.warn('Twilio not configured, skipping SMS');
      return { success: false, error: 'SMS service not configured' };
    }

    const message = `Welcome to Emergency SOS, ${name}! Your account is now active. Remember to complete your profile and set up emergency contacts. Stay safe! - Emergency SOS System`;

    const result = await client.messages.create({
      body: message,
      from: config.twilio.phoneNumber,
      to: to
    });

    logger.info(`Welcome SMS sent to ${to}. SID: ${result.sid}`);
    return { success: true, sid: result.sid };

  } catch (error) {
    logger.error('Welcome SMS service error:', error);
    return { success: false, error: error.message };
  }
};

const sendTestSMS = async ({ to, message }) => {
  try {
    if (!client) {
      return { success: false, error: 'SMS service not configured' };
    }

    const result = await client.messages.create({
      body: `TEST: ${message} - Emergency SOS System`,
      from: config.twilio.phoneNumber,
      to: to
    });

    logger.info(`Test SMS sent to ${to}. SID: ${result.sid}`);
    return { success: true, sid: result.sid };

  } catch (error) {
    logger.error('Test SMS service error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmergencySMS,
  sendWelcomeSMS,
  sendTestSMS
};