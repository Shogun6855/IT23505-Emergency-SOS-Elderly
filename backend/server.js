const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const db = require('./config/database');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth');
const emergencyRoutes = require('./routes/emergency');
const userRoutes = require('./routes/user');
const medicationRoutes = require('./routes/medication');
const MedicationReminderService = require('./services/medicationReminderService');

const app = express();
const server = createServer(app);

// Allow multiple origins for LAN access
const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.1.3:3000", // Your home Wi-Fi IP
  "http://192.168.20.177:3000", // Your previous public Wi-Fi IP
  "http://10.204.198.101:3000", // Your current network IP
  "http://172.21.224.1:3000", // WSL IP (if needed)
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Specific rate limit for emergency endpoint
const emergencyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5 // limit emergency requests
});
app.use('/api/emergency/trigger', emergencyLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Store io instance in app for use in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medications', medicationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Active users statistics
app.get('/api/stats/active-users', (req, res) => {
  res.json({
    success: true,
    data: {
      activeElders: activeUsers.elders.size,
      activeCaregivers: activeUsers.caregivers.size,
      totalConnections: io.engine.clientsCount,
      timestamp: new Date().toISOString()
    }
  });
});

// Track active users
const activeUsers = {
  elders: new Map(), // Map<userId, {socketId, name, joinedAt}>
  caregivers: new Map() // Map<userId, {socketId, name, joinedAt}>
};

// Helper function to broadcast active counts
const broadcastActiveCounts = () => {
  const counts = {
    activeElders: activeUsers.elders.size,
    activeCaregivers: activeUsers.caregivers.size,
    timestamp: new Date().toISOString()
  };
  
  io.emit('active-users-update', counts);
  logger.info(`Active users broadcasted: ${counts.activeElders} elders, ${counts.activeCaregivers} caregivers`);
};

// Socket.io connection handling
io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId;
  const userRole = socket.handshake.auth?.role;
  
  logger.info(`User connected: ${socket.id}, Role: ${userRole}, UserID: ${userId}`);

  socket.on('join-caregiver-room', (caregiverId) => {
    socket.join(`caregiver-${caregiverId}`);
    
    // Track active caregiver
    activeUsers.caregivers.set(caregiverId, {
      socketId: socket.id,
      joinedAt: new Date().toISOString()
    });
    
    logger.info(`Caregiver ${caregiverId} joined room`);
    broadcastActiveCounts();
  });

  socket.on('join-elder-room', (elderId) => {
    socket.join(`elder-${elderId}`);
    
    // Track active elder
    activeUsers.elders.set(elderId, {
      socketId: socket.id,
      joinedAt: new Date().toISOString()
    });
    
    logger.info(`Elder ${elderId} joined room`);
    broadcastActiveCounts();
  });

  // Handle user authentication after connection
  socket.on('user-authenticated', (userData) => {
    const { userId, role, name } = userData;
    
    if (role === 'elder') {
      activeUsers.elders.set(userId, {
        socketId: socket.id,
        name: name,
        joinedAt: new Date().toISOString()
      });
    } else if (role === 'caregiver') {
      activeUsers.caregivers.set(userId, {
        socketId: socket.id,
        name: name,
        joinedAt: new Date().toISOString()
      });
    }
    
    broadcastActiveCounts();
  });

  // Send current active counts to newly connected user
  socket.emit('active-users-update', {
    activeElders: activeUsers.elders.size,
    activeCaregivers: activeUsers.caregivers.size,
    timestamp: new Date().toISOString()
  });

  socket.on('disconnect', () => {
    // Remove user from active lists
    for (const [elderId, elderData] of activeUsers.elders.entries()) {
      if (elderData.socketId === socket.id) {
        activeUsers.elders.delete(elderId);
        logger.info(`Elder ${elderId} disconnected`);
        break;
      }
    }
    
    for (const [caregiverId, caregiverData] of activeUsers.caregivers.entries()) {
      if (caregiverData.socketId === socket.id) {
        activeUsers.caregivers.delete(caregiverId);
        logger.info(`Caregiver ${caregiverId} disconnected`);
        break;
      }
    }
    
    logger.info(`User disconnected: ${socket.id}`);
    broadcastActiveCounts();
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces

server.listen(PORT, HOST, () => {
  logger.info(`Server running on ${HOST}:${PORT}`);
  
  // Initialize medication reminder service
  const medicationService = new MedicationReminderService(io);
  logger.info('Medication reminder service initialized');
});

module.exports = { app, server, io };