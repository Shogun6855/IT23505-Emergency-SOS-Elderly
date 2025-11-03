const db = require('./config/database');
const logger = require('./utils/logger');

exports.getMedicationReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.query;

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    // Get medication adherence statistics
    const adherenceStats = await db.query(
      `SELECT 
        COUNT(*) as total_scheduled,
        COUNT(CASE WHEN status = 'taken' THEN 1 END) as taken,
        COUNT(CASE WHEN status = 'missed' THEN 1 END) as missed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
       FROM medication_logs
       WHERE user_id = $1 AND scheduled_time >= $2`,
      [userId, dateLimit]
    );

    const stats = adherenceStats.rows[0];
    const adherenceRate = stats.total_scheduled > 0
      ? Math.round((parseInt(stats.taken) / parseInt(stats.total_scheduled)) * 100)
      : 0;

    // Get daily breakdown
    const dailyBreakdown = await db.query(
      `SELECT 
        DATE(scheduled_time) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'taken' THEN 1 END) as taken,
        COUNT(CASE WHEN status = 'missed' THEN 1 END) as missed
       FROM medication_logs
       WHERE user_id = $1 AND scheduled_time >= $2
       GROUP BY DATE(scheduled_time)
       ORDER BY date DESC`,
      [userId, dateLimit]
    );

    // Get medication-specific stats
    const medicationStats = await db.query(
      `SELECT 
        m.name,
        m.dosage,
        COUNT(ml.id) as total_scheduled,
        COUNT(CASE WHEN ml.status = 'taken' THEN 1 END) as taken,
        COUNT(CASE WHEN ml.status = 'missed' THEN 1 END) as missed
       FROM medications m
       JOIN medication_logs ml ON m.id = ml.medication_id
       WHERE ml.user_id = $1 AND ml.scheduled_time >= $2
       GROUP BY m.id, m.name, m.dosage
       ORDER BY total_scheduled DESC`,
      [userId, dateLimit]
    );

    res.json({
      success: true,
      report: {
        period: `${days} days`,
        overall: {
          totalScheduled: parseInt(stats.total_scheduled),
          taken: parseInt(stats.taken),
          missed: parseInt(stats.missed),
          pending: parseInt(stats.pending),
          adherenceRate: adherenceRate
        },
        dailyBreakdown: dailyBreakdown.rows,
        medicationBreakdown: medicationStats.rows
      }
    });
  } catch (error) {
    logger.error('Get medication report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate medication report'
    });
  }
};

exports.getElderMedicationReport = async (req, res) => {
  try {
    const { elderId } = req.params;
    const caregiverId = req.user.id;
    const { days = 7 } = req.query;

    // Verify caregiver relationship
    const relationship = await db.query(
      'SELECT id FROM user_caregivers WHERE elder_id = $1 AND caregiver_id = $2 AND is_active = true',
      [elderId, caregiverId]
    );

    if (relationship.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    const adherenceStats = await db.query(
      `SELECT 
        COUNT(*) as total_scheduled,
        COUNT(CASE WHEN status = 'taken' THEN 1 END) as taken,
        COUNT(CASE WHEN status = 'missed' THEN 1 END) as missed
       FROM medication_logs
       WHERE user_id = $1 AND scheduled_time >= $2`,
      [elderId, dateLimit]
    );

    const stats = adherenceStats.rows[0];
    const adherenceRate = stats.total_scheduled > 0
      ? Math.round((parseInt(stats.taken) / parseInt(stats.total_scheduled)) * 100)
      : 0;

    res.json({
      success: true,
      report: {
        period: `${days} days`,
        totalScheduled: parseInt(stats.total_scheduled),
        taken: parseInt(stats.taken),
        missed: parseInt(stats.missed),
        adherenceRate: adherenceRate
      }
    });
  } catch (error) {
    logger.error('Get elder medication report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate medication report'
    });
  }
};

