// Vercel Serverless Function — wraps the Express app
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const connectDB = require('../server/src/config/db');
const { globalErrorHandler, notFound } = require('../server/src/middleware/errorHandler');
const { apiLimiter } = require('../server/src/middleware/rateLimiter');

const authRoutes = require('../server/src/routes/auth');
const userRoutes = require('../server/src/routes/users');
const projectRoutes = require('../server/src/routes/projects');
const floorplanRoutes = require('../server/src/routes/floorplans');
const aiRoutes = require('../server/src/routes/ai');
const architectRoutes = require('../server/src/routes/architects');
const costRoutes = require('../server/src/routes/costEstimate');
const adminRoutes = require('../server/src/routes/admin');

const app = express();

// Connect DB once (cached across warm invocations)
connectDB();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: (origin, cb) => (!origin || allowedOrigins.some(o => origin.startsWith(o)) || origin.endsWith('.vercel.app') ? cb(null, true) : cb(new Error(`CORS: ${origin}`))),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', apiLimiter);

app.get('/api/health', (_, res) => res.json({ success: true, status: 'ok', service: 'HouseOS API' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/floorplans', floorplanRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/architects', architectRoutes);
app.use('/api/cost', costRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;
