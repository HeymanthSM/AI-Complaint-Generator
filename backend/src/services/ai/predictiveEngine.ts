import { logger } from '../../utils/logger';

interface PredictionResult {
  predictions: Array<{
    category: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    predictedComplaints: number;
    confidence: number;
    reasoning: string;
    affectedAreas: string[];
  }>;
  insights: string[];
  timeframe: string;
}

// Seasonal patterns for Indian civic issues
const SEASONAL_PATTERNS: Record<string, { peakMonths: number[]; multiplier: number; reason: string }> = {
  POTHOLE: { peakMonths: [7, 8, 9, 10], multiplier: 2.5, reason: 'Monsoon season causes road deterioration' },
  WATER_LEAK: { peakMonths: [4, 5, 6], multiplier: 2.0, reason: 'Summer heat causes pipe expansion and bursts' },
  DRAINAGE: { peakMonths: [6, 7, 8, 9], multiplier: 3.0, reason: 'Heavy rains overwhelm drainage systems' },
  GARBAGE: { peakMonths: [4, 5, 10, 11], multiplier: 1.8, reason: 'Festival seasons increase waste generation' },
  STREETLIGHT: { peakMonths: [6, 7, 8], multiplier: 1.5, reason: 'Monsoon storms damage electrical infrastructure' },
  SEWAGE: { peakMonths: [7, 8, 9], multiplier: 2.2, reason: 'Flooding causes sewage overflow' },
  STRAY_ANIMALS: { peakMonths: [3, 4, 5], multiplier: 1.8, reason: 'Breeding season increases stray animal activity' },
  ROAD_DAMAGE: { peakMonths: [8, 9, 10], multiplier: 2.0, reason: 'Post-monsoon road damage becomes visible' },
};

// Historical complaint data simulation
function generateHistoricalTrend(category: string, months: number = 12): number[] {
  const baseRate = Math.floor(Math.random() * 50) + 20;
  const pattern = SEASONAL_PATTERNS[category];
  const currentMonth = new Date().getMonth() + 1;

  const trend: number[] = [];
  for (let i = months; i >= 1; i--) {
    const month = ((currentMonth - i + 12) % 12) + 1;
    let complaints = baseRate + Math.floor(Math.random() * 15) - 7;

    if (pattern && pattern.peakMonths.includes(month)) {
      complaints = Math.floor(complaints * pattern.multiplier);
    }

    trend.push(Math.max(0, complaints));
  }

  return trend;
}

/**
 * Simple linear regression for trend prediction
 */
function predictNext(values: number[], periodsAhead: number = 3): number[] {
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predictions: number[] = [];
  for (let i = 0; i < periodsAhead; i++) {
    const predicted = Math.max(0, Math.round(intercept + slope * (n + i)));
    predictions.push(predicted);
  }

  return predictions;
}

export function generatePredictions(complaintData?: any[]): PredictionResult {
  const currentMonth = new Date().getMonth() + 1;
  const predictions: PredictionResult['predictions'] = [];
  const insights: string[] = [];

  for (const [category, pattern] of Object.entries(SEASONAL_PATTERNS)) {
    const historical = generateHistoricalTrend(category);
    const forecast = predictNext(historical);
    const avgForecast = forecast.reduce((a, b) => a + b, 0) / forecast.length;
    const avgHistorical = historical.reduce((a, b) => a + b, 0) / historical.length;

    const isUpcoming = pattern.peakMonths.some(m => m >= currentMonth && m <= currentMonth + 3);
    const trendDirection = avgForecast > avgHistorical ? 'increasing' : 'decreasing';

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (avgForecast > avgHistorical * 2) riskLevel = 'CRITICAL';
    else if (avgForecast > avgHistorical * 1.5) riskLevel = 'HIGH';
    else if (avgForecast > avgHistorical) riskLevel = 'MEDIUM';

    predictions.push({
      category,
      riskLevel,
      predictedComplaints: Math.round(avgForecast),
      confidence: isUpcoming ? 0.85 : 0.65,
      reasoning: `${pattern.reason}. Trend is ${trendDirection} with ${isUpcoming ? 'peak season approaching' : 'normal seasonal variation'}.`,
      affectedAreas: ['Ward 1', 'Ward 5', 'Ward 12', 'Central Zone'].sort(() => Math.random() - 0.5).slice(0, 2),
    });

    if (isUpcoming && riskLevel !== 'LOW') {
      insights.push(`⚠️ ${category.replace(/_/g, ' ')} complaints expected to ${trendDirection} — ${pattern.reason}`);
    }
  }

  // Sort by risk level
  const riskOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  predictions.sort((a, b) => riskOrder[b.riskLevel] - riskOrder[a.riskLevel]);

  // Add general insights
  insights.push(`📊 Overall complaint volume is predicted to ${predictions.filter(p => p.riskLevel !== 'LOW').length > 4 ? 'increase' : 'remain stable'} in the next quarter`);
  insights.push(`🎯 Focus areas: ${predictions.slice(0, 3).map(p => p.category.replace(/_/g, ' ')).join(', ')}`);

  logger.info(`Generated ${predictions.length} predictive insights`);

  return {
    predictions,
    insights,
    timeframe: 'Next 3 months',
  };
}
