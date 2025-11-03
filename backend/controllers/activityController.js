const db = require('../config/database');
const logger = require('../utils/logger');

exports.logActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activity_type, description, mood, energy_level, notes, activity_date } = req.body;

    if (!activity_type) {
      return res.status(400).json({
        success: false,
        message: 'Activity type is required'
      });
    }

    const result = await db.query(
      `INSERT INTO activities (user_id, activity_type, description, mood, energy_level, notes, activity_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [userId, activity_type, description, mood, energy_level, notes, activity_date || new Date().toISOString().split('T')[0]]
    );

    logger.info(`Activity logged for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      activity: result.rows[0]
    });
  } catch (error) {
    logger.error('Log activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log activity'
    });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7, activity_type } = req.query;

    let query = 'SELECT * FROM activities WHERE user_id = $1';
    const params = [userId];
    let paramCount = 2;

    if (days) {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - parseInt(days));
      query += ` AND activity_date >= $${paramCount++}`;
      params.push(dateLimit);
    }

    if (activity_type) {
      query += ` AND activity_type = $${paramCount++}`;
      params.push(activity_type);
    }

    query += ' ORDER BY activity_date DESC, created_at DESC';

    const result = await db.query(query, params);

    res.json({
      success: true,
      activities: result.rows
    });
  } catch (error) {
    logger.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
};

exports.getActivityStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    // Get activity type distribution
    const typeStats = await db.query(
      `SELECT activity_type, COUNT(*) as count
       FROM activities
       WHERE user_id = $1 AND activity_date >= $2
       GROUP BY activity_type
       ORDER BY count DESC`,
      [userId, dateLimit]
    );

    // Get average energy level
    const energyStats = await db.query(
      `SELECT AVG(energy_level) as avg_energy, COUNT(*) as total_activities
       FROM activities
       WHERE user_id = $1 AND activity_date >= $2 AND energy_level IS NOT NULL`,
      [userId, dateLimit]
    );

    // Get mood distribution
    const moodStats = await db.query(
      `SELECT mood, COUNT(*) as count
       FROM activities
       WHERE user_id = $1 AND activity_date >= $2 AND mood IS NOT NULL
       GROUP BY mood
       ORDER BY count DESC`,
      [userId, dateLimit]
    );

    res.json({
      success: true,
      stats: {
        activityTypes: typeStats.rows,
        averageEnergy: energyStats.rows[0]?.avg_energy ? parseFloat(energyStats.rows[0].avg_energy).toFixed(1) : null,
        totalActivities: parseInt(energyStats.rows[0]?.total_activities || 0),
        moodDistribution: moodStats.rows
      }
    });
  } catch (error) {
    logger.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics'
    });
  }
};

