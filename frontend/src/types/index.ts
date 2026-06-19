export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CITIZEN' | 'ADMIN' | 'OFFICIAL';
  phone?: string;
  avatar?: string;
  city?: string;
  state?: string;
  createdAt?: string;
  _count?: {
    complaints: number;
    notifications: number;
  };
}

export type ComplaintCategory =
  | 'POTHOLE'
  | 'GARBAGE'
  | 'WATER_LEAK'
  | 'STREETLIGHT'
  | 'DRAINAGE'
  | 'ROAD_DAMAGE'
  | 'SEWAGE'
  | 'NOISE_POLLUTION'
  | 'ILLEGAL_CONSTRUCTION'
  | 'STRAY_ANIMALS'
  | 'PARKS_GARDENS'
  | 'OTHER';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'ESCALATED';

export interface Department {
  id?: string;
  name: string;
  code: string;
  description?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  address: string;
  ward?: string;
  municipality?: string;
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  isEmergency: boolean;
  emergencyReason?: string;
  aiConfidence?: number;
  estimatedResolution?: string;
  generatedLetter?: string;
  userId: string;
  department?: Department;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  images: string[];
  language?: string;
  sentimentScore?: number;
  sentimentLabel?: string;
}

export interface AuditBlock {
  index: number;
  action: string;
  description: string;
  hash: string;
  previousHash: string;
  timestamp: string;
  verified: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface AnalyticsOverview {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
  avgResolutionDays: number;
  satisfactionScore: number;
  emergencyCount: number;
  thisMonthComplaints: number;
  lastMonthComplaints: number;
  growthPercent: number;
}

export interface AnalyticsTrend {
  month: string;
  complaints: number;
  resolved: number;
  pending: number;
}

export interface CategoryDist {
  category: ComplaintCategory;
  count: number;
  percentage: number;
}

export interface DeptPerformance {
  department: string;
  code: string;
  total: number;
  resolved: number;
  avgDays: number;
  satisfaction: number;
}

export interface PredictionItem {
  category: ComplaintCategory;
  predictedCount: number;
  confidence: number;
  reason: string;
  recommendedAction: string;
}

export interface HeatmapItem {
  lat: number;
  lng: number;
  weight: number;
  area: string;
}
