import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export async function connectMongoDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    logger.info('✅ MongoDB connected');
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    logger.warn('⚠️ Running without MongoDB - chat history will not persist');
  }
}

export async function disconnectMongoDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

// MongoDB Schemas

// Chat History Schema
const chatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatHistorySchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  messages: [chatMessageSchema],
  context: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Analytics Log Schema
const analyticsLogSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

// Image Analysis Schema
const imageAnalysisSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, index: true },
  imageUrl: { type: String, required: true },
  detections: [{
    label: String,
    confidence: Number,
    boundingBox: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
  }],
  overallCategory: { type: String },
  description: { type: String },
  model: { type: String, default: 'simulation' },
  analyzedAt: { type: Date, default: Date.now },
});

export const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export const AnalyticsLog = mongoose.model('AnalyticsLog', analyticsLogSchema);
export const ImageAnalysis = mongoose.model('ImageAnalysis', imageAnalysisSchema);
