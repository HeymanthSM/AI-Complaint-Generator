import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://civic_user:civic_pass@localhost:5432/civic_navigator',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_navigator',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

  // AI APIs
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  // Google Maps
  GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',

  // Feature flags
  get hasOpenAI() { return !!this.OPENAI_API_KEY; },
  get hasGemini() { return !!this.GEMINI_API_KEY; },
  get hasGoogleMaps() { return !!this.GOOGLE_MAPS_KEY; },
  get hasGoogleOAuth() { return !!this.GOOGLE_CLIENT_ID; },
};
