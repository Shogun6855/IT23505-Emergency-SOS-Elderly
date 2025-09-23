const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass
  }
});

const sendEmergencyEmail = async ({ to, elderName, location, time, notes }) => {
  try {
    const mailOptions = {
      from: config.smtp.user,
      to: to,
      subject: `🚨 EMERGENCY ALERT - ${elderName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
            <h1>🚨 EMERGENCY ALERT</h1>
            <h2>${elderName} needs immediate help!</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h3>Emergency Details:</h3>
            <ul style="font-size: 16px; line-height: 1.6;">
              <li><strong>Person:</strong> ${elderName}</li>
              <li><strong>Time:</strong> ${new Date(time).toLocaleString()}</li>
              <li><strong>Location:</strong> ${location}</li>
              ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
            </ul>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
              <strong>Action Required:</strong> Please contact ${elderName} immediately or go to their location to assist.
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; background-color: #e9ecef;">
            <p style="color: #6c757d; font-size: 14px;">
              This is an automated emergency alert from Emergency SOS System.<br>
              If this is a false alarm, please resolve the emergency in the dashboard.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Emergency email sent to ${to} for elder ${elderName}`);
    return { success: true };

  } catch (error) {
    logger.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

const sendWelcomeEmail = async ({ to, name }) => {
  try {
    const mailOptions = {
      from: config.smtp.user,
      to: to,
      subject: 'Welcome to Emergency SOS System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
            <h1>Welcome to Emergency SOS</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2>Hello ${name}!</h2>
            <p>Thank you for joining Emergency SOS System. Your account has been successfully created.</p>
            
            <h3>Next Steps:</h3>
            <ul>
              <li>Complete your profile information</li>
              <li>Set up emergency contacts</li>
              <li>Familiarize yourself with the emergency button</li>
              <li>Test the system with a non-emergency alert</li>
            </ul>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-left: 4px solid #bee5eb;">
              <strong>Remember:</strong> This system is designed to complement, not replace, traditional emergency services. Always call 911 for life-threatening emergencies.
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; background-color: #f8f9fa;">
            <p style="color: #6c757d;">Emergency SOS System - Keeping you connected when it matters most</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${to}`);
    return { success: true };

  } catch (error) {
    logger.error('Welcome email service error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmergencyEmail,
  sendWelcomeEmail
};