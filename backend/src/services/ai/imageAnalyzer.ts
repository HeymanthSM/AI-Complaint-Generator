import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';

interface ImageAnalysisResult {
  category: string;
  description: string;
  severity: string;
  detections: Array<{
    label: string;
    confidence: number;
  }>;
  suggestedTitle: string;
  suggestedPriority: string;
}

// Simulated image analysis based on filename patterns
function simulateImageAnalysis(filename: string): ImageAnalysisResult {
  const lower = filename.toLowerCase();

  const issuePatterns: Record<string, ImageAnalysisResult> = {
    pothole: {
      category: 'POTHOLE',
      description: 'A significant pothole has been detected in the road surface. The damage appears to span approximately 2 feet in diameter and poses a risk to vehicles and pedestrians.',
      severity: 'HIGH',
      detections: [
        { label: 'pothole', confidence: 0.92 },
        { label: 'road_damage', confidence: 0.85 },
        { label: 'asphalt_crack', confidence: 0.78 },
      ],
      suggestedTitle: 'Road Pothole Requiring Immediate Repair',
      suggestedPriority: 'HIGH',
    },
    garbage: {
      category: 'GARBAGE',
      description: 'Accumulated garbage and waste material detected in a public area. The waste appears to include household refuse and may pose health hazards.',
      severity: 'MEDIUM',
      detections: [
        { label: 'garbage_pile', confidence: 0.94 },
        { label: 'plastic_waste', confidence: 0.87 },
        { label: 'organic_waste', confidence: 0.72 },
      ],
      suggestedTitle: 'Garbage Accumulation in Public Area',
      suggestedPriority: 'MEDIUM',
    },
    streetlight: {
      category: 'STREETLIGHT',
      description: 'A non-functional streetlight has been identified. The pole appears intact but the light fixture may be damaged or disconnected.',
      severity: 'MEDIUM',
      detections: [
        { label: 'broken_streetlight', confidence: 0.89 },
        { label: 'dark_area', confidence: 0.76 },
      ],
      suggestedTitle: 'Non-Functional Streetlight',
      suggestedPriority: 'MEDIUM',
    },
    water: {
      category: 'WATER_LEAK',
      description: 'A water leak has been detected, likely from a municipal water supply pipe. Water is pooling in the area and may cause road damage.',
      severity: 'HIGH',
      detections: [
        { label: 'water_leak', confidence: 0.91 },
        { label: 'pipe_burst', confidence: 0.83 },
        { label: 'water_pooling', confidence: 0.88 },
      ],
      suggestedTitle: 'Water Pipeline Leak',
      suggestedPriority: 'HIGH',
    },
    drain: {
      category: 'DRAINAGE',
      description: 'A blocked or overflowing drainage system has been detected. Standing water and debris are visible.',
      severity: 'HIGH',
      detections: [
        { label: 'blocked_drain', confidence: 0.90 },
        { label: 'stagnant_water', confidence: 0.85 },
        { label: 'debris', confidence: 0.73 },
      ],
      suggestedTitle: 'Blocked Drainage System',
      suggestedPriority: 'HIGH',
    },
    road: {
      category: 'ROAD_DAMAGE',
      description: 'Road surface damage detected including cracks and uneven surfaces that pose a hazard to traffic.',
      severity: 'MEDIUM',
      detections: [
        { label: 'road_crack', confidence: 0.88 },
        { label: 'surface_damage', confidence: 0.82 },
      ],
      suggestedTitle: 'Road Surface Damage',
      suggestedPriority: 'MEDIUM',
    },
  };

  // Match by filename
  for (const [key, result] of Object.entries(issuePatterns)) {
    if (lower.includes(key)) return result;
  }

  // Default analysis
  return {
    category: 'OTHER',
    description: 'An urban infrastructure issue has been detected in the uploaded image. Further manual review is recommended for accurate classification.',
    severity: 'MEDIUM',
    detections: [
      { label: 'infrastructure_issue', confidence: 0.75 },
      { label: 'urban_damage', confidence: 0.65 },
    ],
    suggestedTitle: 'Infrastructure Issue Detected',
    suggestedPriority: 'MEDIUM',
  };
}

export async function analyzeImage(imagePath: string): Promise<ImageAnalysisResult> {
  // Try OpenAI Vision first
  if (env.hasOpenAI && fs.existsSync(imagePath)) {
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an urban infrastructure issue detector. Analyze the image and identify civic issues like potholes, garbage, broken streetlights, water leaks, road damage, drainage issues, etc. Return JSON with:
              - category: POTHOLE, GARBAGE, STREETLIGHT, WATER_LEAK, ROAD_DAMAGE, DRAINAGE, SEWAGE, or OTHER
              - description: detailed description of the issue
              - severity: LOW, MEDIUM, HIGH, or CRITICAL
              - detections: array of {label, confidence} objects
              - suggestedTitle: a concise title for a complaint
              - suggestedPriority: LOW, MEDIUM, HIGH, CRITICAL, or EMERGENCY`,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this image for civic infrastructure issues:' },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      logger.info('AI image analysis successful');
      return result as ImageAnalysisResult;
    } catch (error) {
      logger.warn('OpenAI image analysis failed, using simulation:', error);
    }
  }

  // Fallback to simulation
  const filename = path.basename(imagePath);
  logger.info('Using simulated image analysis for:', filename);
  return simulateImageAnalysis(filename);
}
