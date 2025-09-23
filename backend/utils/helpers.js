const moment = require('moment');

/**
 * Format phone number to international format
 */
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add country code if not present (assuming US)
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+${digits}`;
  }
  
  return phone; // Return original if already formatted or invalid
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Format emergency data for API responses
 */
const formatEmergencyData = (emergency) => {
  return {
    id: emergency.id,
    elderId: emergency.elder_id,
    elderName: emergency.elder_name,
    elderPhone: emergency.elder_phone,
    location: {
      latitude: emergency.latitude,
      longitude: emergency.longitude,
      address: emergency.address
    },
    notes: emergency.notes,
    status: emergency.status,
    priority: emergency.priority,
    createdAt: moment(emergency.created_at).toISOString(),
    resolvedAt: emergency.resolved_at ? moment(emergency.resolved_at).toISOString() : null,
    resolvedBy: emergency.resolved_by_name || emergency.resolved_by,
    resolutionNotes: emergency.resolution_notes,
    timeElapsed: moment().diff(moment(emergency.created_at), 'minutes')
  };
};

/**
 * Format user data for API responses (remove sensitive information)
 */
const formatUserData = (user) => {
  const formattedUser = { ...user };
  delete formattedUser.password;
  
  return {
    id: formattedUser.id,
    name: formattedUser.name,
    email: formattedUser.email,
    phone: formattedUser.phone,
    role: formattedUser.role,
    address: formattedUser.address,
    emergencyContact: formattedUser.emergency_contact,
    createdAt: formattedUser.created_at ? moment(formattedUser.created_at).toISOString() : null,
    lastLogin: formattedUser.last_login ? moment(formattedUser.last_login).toISOString() : null
  };
};

/**
 * Generate random string for testing purposes
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Sanitize user input to prevent XSS
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Create pagination metadata
 */
const createPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    currentPage: parseInt(page),
    totalPages,
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null
  };
};

/**
 * Check if emergency is recent (within last 24 hours)
 */
const isRecentEmergency = (timestamp) => {
  return moment().diff(moment(timestamp), 'hours') < 24;
};

/**
 * Get emergency priority color
 */
const getEmergencyPriorityColor = (priority) => {
  const colors = {
    critical: '#dc3545',
    high: '#fd7e14',
    medium: '#ffc107',
    low: '#28a745'
  };
  
  return colors[priority] || colors.medium;
};

module.exports = {
  formatPhoneNumber,
  calculateDistance,
  formatEmergencyData,
  formatUserData,
  generateRandomString,
  isValidEmail,
  isValidPhoneNumber,
  sanitizeInput,
  createPaginationMeta,
  isRecentEmergency,
  getEmergencyPriorityColor
};