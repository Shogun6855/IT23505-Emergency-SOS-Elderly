const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();

  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

const roleAuth = (roles) => {
  return async (req, res, next) => {
    try {
      const db = require('../config/database');
      
      const result = await db.query(
        'SELECT role FROM users WHERE id = $1',
        [req.user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userRole = result.rows[0].role;

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: insufficient permissions'
        });
      }

      next();

    } catch (error) {
      logger.error('Role auth middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in role authorization'
      });
    }
  };
};

module.exports = {
  auth,
  roleAuth
};