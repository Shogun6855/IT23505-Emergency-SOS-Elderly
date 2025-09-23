const { body } = require('express-validator');

const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .isIn(['elder', 'caregiver'])
    .withMessage('Role must be either elder or caregiver'),
  
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters')
];

const emergencyValidation = [
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

const addCaregiverValidation = [
  body('caregiver_email')
    .isEmail()
    .withMessage('Please provide a valid caregiver email')
    .normalizeEmail(),
  
  body('relationship')
    .notEmpty()
    .withMessage('Relationship is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Relationship must be between 2 and 50 characters')
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  emergencyValidation,
  addCaregiverValidation
};