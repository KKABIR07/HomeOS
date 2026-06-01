require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./src/config/db');
const { globalErrorHandler, notFound } = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');

// Route imports
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const projectRoutes = require('./src/routes/projects');
const floorplanRoutes = require('./src/routes/floorplans');
const aiRoutes = require('./src/routes/ai');
const architectRoutes = require('./src/routes/architects');
const costRoutes = require('./src/routes/costEstimate');
const adminRoutes = require('./src/routes/admin');

// ─── Allowed Origins ───────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

// ─── App Setup ─────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// ─── Connect to Database ───────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ─── Request Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Logging ────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Global Rate Limiting ───────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'HouseOS API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/floorplans', floorplanRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/architects', architectRoutes);
app.use('/api/cost-estimate', costRoutes);
app.use('/api/admin', adminRoutes);

// ─── Socket.io Real-Time Collaboration ─────────────────────────────────────────
const connectedUsers = new Map(); // socket.id -> { userId, userName, projectId }
const projectRooms = new Map();   // projectId -> Set of { socketId, userId, userName }

io.on('connection', (socket) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Socket] Connected: ${socket.id}`);
  }

  /**
   * Join a project collaboration room
   */
  socket.on('join-project', ({ projectId, userId, userName }) => {
    if (!projectId || !userId) return;

    socket.join(`project:${projectId}`);
    connectedUsers.set(socket.id, { userId, userName, projectId });

    if (!projectRooms.has(projectId)) {
      projectRooms.set(projectId, new Set());
    }
    projectRooms.get(projectId).add({ socketId: socket.id, userId, userName });

    // Notify other members in the room
    socket.to(`project:${projectId}`).emit('user-joined', {
      userId,
      userName,
      timestamp: new Date().toISOString(),
    });

    // Send current room members to the joining user
    const members = Array.from(projectRooms.get(projectId) || []);
    socket.emit('room-members', { members });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Socket] ${userName} joined project:${projectId}`);
    }
  });

  /**
   * Leave a project room
   */
  socket.on('leave-project', ({ projectId }) => {
    if (!projectId) return;

    socket.leave(`project:${projectId}`);
    const user = connectedUsers.get(socket.id);

    if (user) {
      const room = projectRooms.get(projectId);
      if (room) {
        for (const member of room) {
          if (member.socketId === socket.id) {
            room.delete(member);
            break;
          }
        }
      }
      socket.to(`project:${projectId}`).emit('user-left', {
        userId: user.userId,
        userName: user.userName,
      });
    }
  });

  /**
   * Broadcast floor plan updates to collaborators
   */
  socket.on('floor-plan-update', ({ projectId, floorPlanId, elements, userId, version }) => {
    if (!projectId) return;
    socket.to(`project:${projectId}`).emit('floor-plan-updated', {
      floorPlanId,
      elements,
      userId,
      version,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Broadcast cursor position for collaborative editing
   */
  socket.on('cursor-move', ({ projectId, x, y, userId, userName }) => {
    if (!projectId) return;
    socket.to(`project:${projectId}`).emit('cursor-moved', {
      x,
      y,
      userId,
      userName,
    });
  });

  /**
   * Project-scoped chat messages
   */
  socket.on('chat-message', ({ projectId, message, userId, userName }) => {
    if (!projectId || !message) return;
    io.to(`project:${projectId}`).emit('new-message', {
      message,
      userId,
      userName,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Element selection lock (prevent conflicting edits)
   */
  socket.on('element-lock', ({ projectId, elementId, userId }) => {
    socket.to(`project:${projectId}`).emit('element-locked', { elementId, userId });
  });

  socket.on('element-unlock', ({ projectId, elementId, userId }) => {
    socket.to(`project:${projectId}`).emit('element-unlocked', { elementId, userId });
  });

  /**
   * Handle disconnection
   */
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);

    if (user && user.projectId) {
      const room = projectRooms.get(user.projectId);
      if (room) {
        for (const member of room) {
          if (member.socketId === socket.id) {
            room.delete(member);
            break;
          }
        }
      }

      socket.to(`project:${user.projectId}`).emit('user-left', {
        userId: user.userId,
        userName: user.userName,
      });
    }

    connectedUsers.delete(socket.id);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    }
  });
});

// ─── Error Handling ─────────────────────────────────────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000;

server.listen(PORT, () => {
  console.log('\n================================================');
  console.log(`  HouseOS API Server`);
  console.log('================================================');
  console.log(`  Status   : Running`);
  console.log(`  Port     : ${PORT}`);
  console.log(`  Env      : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  API      : http://localhost:${PORT}/api`);
  console.log(`  Health   : http://localhost:${PORT}/api/health`);
  console.log('================================================\n');
});

// ─── Process Error Handlers ─────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION]', err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err.name, err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('[SIGTERM] Gracefully shutting down...');
  server.close(() => {
    console.log('[SIGTERM] Server closed.');
    process.exit(0);
  });
});

module.exports = { app, server, io };
