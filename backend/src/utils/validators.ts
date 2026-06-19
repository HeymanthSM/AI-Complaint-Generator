import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const complaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'POTHOLE', 'GARBAGE', 'STREETLIGHT', 'WATER_LEAK', 'ROAD_DAMAGE',
    'DRAINAGE', 'SEWAGE', 'ELECTRICITY', 'PUBLIC_TRANSPORT', 'NOISE_POLLUTION',
    'AIR_POLLUTION', 'ILLEGAL_CONSTRUCTION', 'ENCROACHMENT', 'STRAY_ANIMALS',
    'TRAFFIC', 'PUBLIC_SAFETY', 'SANITATION', 'PARKS_GARDENS', 'OTHER'
  ]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  ward: z.string().optional(),
  municipality: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  language: z.string().default('en'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY']).optional(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  conversationId: z.string().optional(),
});

export const translateSchema = z.object({
  text: z.string().min(1),
  targetLanguage: z.enum(['en', 'ta', 'hi']),
  sourceLanguage: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ComplaintInput = z.infer<typeof complaintSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type TranslateInput = z.infer<typeof translateSchema>;
