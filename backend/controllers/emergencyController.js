const db = require('../config/database');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');
const { v4: uuidv4 } = require('uuid');

exports.triggerEmergency = async (req, res) => {
  try {
    const { latitude, longitude, address, notes } = req.body;
    const elderId = req.user.userId;

    // Insert emergency record
    const emergencyResult = await db.query(
      `INSERT INTO emergencies (id, elder_id, latitude, longitude, address, notes, status, priority, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, 'active', 'critical', NOW()) 
       RETURNING id, created_at`,
      [uuidv4(), elderId, latitude, longitude, address, notes]
    );

    const emergency = emergencyResult.rows[0];

    // Get elder information
    const elderResult = await db.query(
      'SELECT name, phone, email FROM users WHERE id = $1',
      [elderId]
    );
    const elder = elderResult.rows[0];

    // Get all caregivers for this elder
    const caregiversResult = await db.query(
      `SELECT u.id, u.name, u.email, u.phone, uc.relationship 
       FROM users u 
       JOIN user_caregivers uc ON u.id = uc.caregiver_id 
       WHERE uc.elder_id = $1 AND uc.is_active = true`,
      [elderId]
    );

    const caregivers = caregiversResult.rows;

    // Send notifications to all caregivers
    const notificationPromises = caregivers.map(caregiver => 
      notificationService.sendEmergencyNotification({
        caregiver,
        elder,
        emergency: {
          id: emergency.id,
          location: address || `${latitude}, ${longitude}`,
          time: emergency.created_at,
          notes
        }
      })
    );

    await Promise.allSettled(notificationPromises);

    // Emit socket event to caregivers
    const io = req.app.get('io');
    caregivers.forEach(caregiver => {
      io.to(`caregiver-${caregiver.id}`).emit('new-emergency', {
        id: emergency.id,
        elderName: elder.name,
        elderPhone: elder.phone,
        location: address || `${latitude}, ${longitude}`,
        time: emergency.created_at,
        notes,
        priority: 'critical',
        status: 'active'
      });
    });

    logger.info(`Emergency triggered by elder ${elderId}: ${emergency.id}`);

    res.json({
      success: true,
      message: 'Emergency alert sent successfully',
      emergencyId: emergency.id,
      notifiedCaregivers: caregivers.length
    });

  } catch (error) {
    logger.error('Emergency trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send emergency alert'
    });
  }
};

exports.getActiveEmergencies = async (req, res) => {
  try {
    const caregiverId = req.user.userId;

    const result = await db.query(
      `SELECT e.id, e.elder_id, e.latitude, e.longitude, e.address, e.notes, 
              e.status, e.priority, e.created_at, e.resolved_at,
              u.name as elder_name, u.phone as elder_phone
       FROM emergencies e
       JOIN users u ON e.elder_id = u.id
       JOIN user_caregivers uc ON u.id = uc.elder_id
       WHERE uc.caregiver_id = $1 AND e.status = 'active'
       ORDER BY e.created_at DESC`,
      [caregiverId]
    );

    res.json({
      success: true,
      emergencies: result.rows
    });

  } catch (error) {
    logger.error('Get active emergencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active emergencies'
    });
  }
};

exports.resolveEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution_notes } = req.body;
    const caregiverId = req.user.userId;

    // Update emergency status
    const result = await db.query(
      `UPDATE emergencies 
       SET status = 'resolved', resolved_at = NOW(), resolved_by = $1, resolution_notes = $2
       WHERE id = $3 AND status = 'active'
       RETURNING elder_id`,
      [caregiverId, resolution_notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emergency not found or already resolved'
      });
    }

    const elderId = result.rows[0].elder_id;

    // Notify the elder that emergency is resolved
    const io = req.app.get('io');
    io.to(`elder-${elderId}`).emit('emergency-resolved', {
      emergencyId: id,
      resolvedBy: caregiverId,
      resolvedAt: new Date()
    });

    logger.info(`Emergency ${id} resolved by caregiver ${caregiverId}`);

    res.json({
      success: true,
      message: 'Emergency marked as resolved'
    });

  } catch (error) {
    logger.error('Resolve emergency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve emergency'
    });
  }
};

exports.getEmergencyHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query;
    let params;

    // Check user role to determine which emergencies to show
    const userResult = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    const userRole = userResult.rows[0].role;

    if (userRole === 'elder') {
      // Show emergencies triggered by this elder
      query = `
        SELECT e.id, e.latitude, e.longitude, e.address, e.notes, 
               e.status, e.priority, e.created_at, e.resolved_at, e.resolution_notes,
               u.name as resolved_by_name
        FROM emergencies e
        LEFT JOIN users u ON e.resolved_by = u.id
        WHERE e.elder_id = $1
        ORDER BY e.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      params = [userId, limit, offset];
    } else {
      // Show emergencies for elders this caregiver is responsible for
      query = `
        SELECT e.id, e.elder_id, e.latitude, e.longitude, e.address, e.notes, 
               e.status, e.priority, e.created_at, e.resolved_at, e.resolution_notes,
               u.name as elder_name, u.phone as elder_phone,
               resolver.name as resolved_by_name
        FROM emergencies e
        JOIN users u ON e.elder_id = u.id
        JOIN user_caregivers uc ON u.id = uc.elder_id
        LEFT JOIN users resolver ON e.resolved_by = resolver.id
        WHERE uc.caregiver_id = $1
        ORDER BY e.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      params = [userId, limit, offset];
    }

    const result = await db.query(query, params);

    res.json({
      success: true,
      emergencies: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length
      }
    });

  } catch (error) {
    logger.error('Get emergency history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency history'
    });
  }
};