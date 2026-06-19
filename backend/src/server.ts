import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { connectPostgres } from './config/database';
import { connectMongoDB } from './config/mongodb';
import { errorHandler, notFound } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import complaintRoutes from './routes/complaint.routes';
import aiRoutes from './routes/ai.routes';
import analyticsRoutes from './routes/analytics.routes';
import chatbotRoutes from './routes/chatbot.routes';

const app = express();

// ============================================
// Middleware
// ============================================
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = [env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter(200, 60000));

// Ensure upload directory exists
const uploadDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Ensure logs directory exists
const logsDir = path.resolve('logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ============================================
// Health Check
// ============================================
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: true,
      openai: env.hasOpenAI,
      gemini: env.hasGemini,
      googleMaps: env.hasGoogleMaps,
    },
    version: '1.0.0',
  });
});

// ============================================
// Routes
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chatbot', chatbotRoutes);

// ============================================
// Error Handling
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
async function startServer() {
  // Connect to databases (non-blocking - app runs in demo mode if DBs unavailable)
  await connectPostgres().catch(() => {});
  await connectMongoDB().catch(() => {});

  app.listen(env.PORT, () => {
    logger.info(`
╔══════════════════════════════════════════════════╗
║         🏛️  AI CIVIC NAVIGATOR API              ║
║──────────────────────────────────────────────────║
║  Server:    http://localhost:${env.PORT}              ║
║  Env:       ${env.NODE_ENV.padEnd(36)}║
║  OpenAI:    ${(env.hasOpenAI ? '✅ Connected' : '⚠️  Simulation mode').padEnd(36)}║
║  Gemini:    ${(env.hasGemini ? '✅ Connected' : '⚠️  Simulation mode').padEnd(36)}║
║  Maps:      ${(env.hasGoogleMaps ? '✅ Connected' : '⚠️  Using Leaflet').padEnd(36)}║
╚══════════════════════════════════════════════════╝
    `);
  });
}

startServer();

export default app;
