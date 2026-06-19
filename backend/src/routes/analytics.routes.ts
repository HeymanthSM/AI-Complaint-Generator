import { Request, Response, Router } from 'express';
import { prisma } from '../config/database';
import { generatePredictions } from '../services/ai/predictiveEngine';
import { logger } from '../utils/logger';

const router = Router();

// Mock analytics data
const generateMockAnalytics = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  return {
    overview: {
      totalComplaints: 1247,
      pendingComplaints: 342,
      resolvedComplaints: 789,
      inProgressComplaints: 116,
      avgResolutionDays: 8.5,
      satisfactionScore: 4.2,
      emergencyCount: 23,
      thisMonthComplaints: 156,
      lastMonthComplaints: 142,
      growthPercent: 9.8,
    },
    trends: months.slice(0, currentMonth + 1).map((month, i) => ({
      month,
      complaints: Math.floor(80 + Math.random() * 80),
      resolved: Math.floor(60 + Math.random() * 60),
      pending: Math.floor(10 + Math.random() * 30),
    })),
    categoryDistribution: [
      { category: 'POTHOLE', count: 234, percentage: 18.8 },
      { category: 'GARBAGE', count: 198, percentage: 15.9 },
      { category: 'WATER_LEAK', count: 167, percentage: 13.4 },
      { category: 'STREETLIGHT', count: 145, percentage: 11.6 },
      { category: 'DRAINAGE', count: 123, percentage: 9.9 },
      { category: 'ROAD_DAMAGE', count: 98, percentage: 7.9 },
      { category: 'SEWAGE', count: 76, percentage: 6.1 },
      { category: 'NOISE_POLLUTION', count: 54, percentage: 4.3 },
      { category: 'ILLEGAL_CONSTRUCTION', count: 42, percentage: 3.4 },
      { category: 'OTHER', count: 110, percentage: 8.8 },
    ],
    departmentPerformance: [
      { department: 'Public Works Dept', code: 'PWD', total: 332, resolved: 245, avgDays: 9.2, satisfaction: 3.8 },
      { department: 'Sanitation Dept', code: 'SAN', total: 198, resolved: 172, avgDays: 4.1, satisfaction: 4.3 },
      { department: 'Water Board', code: 'WATER', total: 167, resolved: 134, avgDays: 6.8, satisfaction: 3.9 },
      { department: 'Electricity Board', code: 'ELEC', total: 145, resolved: 128, avgDays: 3.5, satisfaction: 4.5 },
      { department: 'Transport Dept', code: 'TRANS', total: 89, resolved: 56, avgDays: 12.3, satisfaction: 3.2 },
      { department: 'Environment Board', code: 'ENV', total: 54, resolved: 31, avgDays: 15.7, satisfaction: 3.0 },
      { department: 'Town Planning', code: 'PLAN', total: 42, resolved: 18, avgDays: 22.1, satisfaction: 2.8 },
      { department: 'Animal Control', code: 'ANIM', total: 34, resolved: 28, avgDays: 5.4, satisfaction: 4.1 },
    ],
    resolutionRates: {
      overall: 63.3,
      byPriority: [
        { priority: 'EMERGENCY', rate: 89.5, count: 23 },
        { priority: 'CRITICAL', rate: 78.2, count: 45 },
        { priority: 'HIGH', rate: 71.4, count: 234 },
        { priority: 'MEDIUM', rate: 62.1, count: 567 },
        { priority: 'LOW', rate: 48.9, count: 378 },
      ],
    },
    sentimentOverview: {
      positive: 34,
      neutral: 28,
      negative: 38,
      avgScore: -0.12,
    },
    heatmapData: [
      { lat: 13.0827, lng: 80.2707, weight: 45, area: 'Central Chennai' },
      { lat: 13.0850, lng: 80.2101, weight: 38, area: 'Anna Nagar' },
      { lat: 13.0418, lng: 80.2341, weight: 32, area: 'T Nagar' },
      { lat: 13.1143, lng: 80.1548, weight: 28, area: 'Ambattur' },
      { lat: 13.0382, lng: 80.1563, weight: 25, area: 'Porur' },
      { lat: 13.0596, lng: 80.2593, weight: 22, area: 'Mylapore' },
      { lat: 11.0168, lng: 76.9558, weight: 35, area: 'Coimbatore Central' },
      { lat: 9.9252, lng: 78.1198, weight: 30, area: 'Madurai Central' },
      { lat: 13.0674, lng: 80.2376, weight: 20, area: 'Nungambakkam' },
      { lat: 12.9716, lng: 77.5946, weight: 40, area: 'Bangalore MG Road' },
      { lat: 13.0524, lng: 80.2508, weight: 18, area: 'Egmore' },
      { lat: 13.1067, lng: 80.2840, weight: 15, area: 'Perambur' },
      { lat: 13.0000, lng: 80.2209, weight: 27, area: 'Guindy' },
      { lat: 13.1233, lng: 80.2258, weight: 22, area: 'Villivakkam' },
      { lat: 12.8438, lng: 80.0689, weight: 19, area: 'Tambaram' },
    ],
  };
};

// GET /api/analytics/overview
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    try {
      const [total, pending, resolved, emergency] = await Promise.all([
        prisma.complaint.count(),
        prisma.complaint.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED'] } } }),
        prisma.complaint.count({ where: { status: 'RESOLVED' } }),
        prisma.complaint.count({ where: { isEmergency: true } }),
      ]);

      res.json({
        totalComplaints: total,
        pendingComplaints: pending,
        resolvedComplaints: resolved,
        inProgressComplaints: total - pending - resolved,
        emergencyCount: emergency,
      });
    } catch {
      res.json(generateMockAnalytics().overview);
    }
  } catch (error) {
    logger.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/analytics/trends
router.get('/trends', async (_req: Request, res: Response) => {
  try {
    res.json(generateMockAnalytics().trends);
  } catch (error) {
    logger.error('Analytics trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// GET /api/analytics/departments
router.get('/departments', async (_req: Request, res: Response) => {
  try {
    res.json(generateMockAnalytics().departmentPerformance);
  } catch (error) {
    logger.error('Department analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch department analytics' });
  }
});

// GET /api/analytics/categories
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    res.json(generateMockAnalytics().categoryDistribution);
  } catch (error) {
    logger.error('Category analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/analytics/resolution-rates
router.get('/resolution-rates', async (_req: Request, res: Response) => {
  try {
    res.json(generateMockAnalytics().resolutionRates);
  } catch (error) {
    logger.error('Resolution rates error:', error);
    res.status(500).json({ error: 'Failed to fetch resolution rates' });
  }
});

// GET /api/analytics/sentiment
router.get('/sentiment', async (_req: Request, res: Response) => {
  try {
    res.json(generateMockAnalytics().sentimentOverview);
  } catch (error) {
    logger.error('Sentiment analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch sentiment data' });
  }
});

// GET /api/analytics/heatmap
router.get('/heatmap', async (_req: Request, res: Response) => {
  try {
    res.json(generateMockAnalytics().heatmapData);
  } catch (error) {
    logger.error('Heatmap data error:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

// GET /api/analytics/predictions
router.get('/predictions', async (_req: Request, res: Response) => {
  try {
    const predictions = generatePredictions();
    res.json(predictions);
  } catch (error) {
    logger.error('Predictions error:', error);
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
});

// GET /api/analytics/all
router.get('/all', async (_req: Request, res: Response) => {
  try {
    const analytics = generateMockAnalytics();
    const predictions = generatePredictions();
    res.json({ ...analytics, predictions });
  } catch (error) {
    logger.error('Full analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
