import { env } from '../../config/env';
import { logger } from '../../utils/logger';

interface DepartmentDetectionResult {
  department: string;
  departmentCode: string;
  category: string;
  priority: string;
  confidence: number;
  estimatedDays: number;
  reasoning: string;
}

// Department knowledge base
const DEPARTMENT_MAP: Record<string, { name: string; code: string; categories: string[]; keywords: string[]; avgDays: number }> = {
  PWD: {
    name: 'Public Works Department',
    code: 'PWD',
    categories: ['POTHOLE', 'ROAD_DAMAGE', 'DRAINAGE'],
    keywords: ['road', 'pothole', 'bridge', 'highway', 'pavement', 'crack', 'construction', 'footpath', 'drainage', 'drain', 'culvert', 'flyover'],
    avgDays: 14,
  },
  WATER: {
    name: 'Water Supply & Sewerage Board',
    code: 'WATER',
    categories: ['WATER_LEAK', 'SEWAGE'],
    keywords: ['water', 'pipe', 'leak', 'sewage', 'sewerage', 'supply', 'contamination', 'bore', 'well', 'tank', 'overflow', 'flooding'],
    avgDays: 7,
  },
  ELECTRICITY: {
    name: 'Electricity Board',
    code: 'ELEC',
    categories: ['STREETLIGHT', 'ELECTRICITY'],
    keywords: ['light', 'streetlight', 'electricity', 'power', 'transformer', 'wire', 'cable', 'pole', 'outage', 'voltage', 'electric', 'lamp'],
    avgDays: 5,
  },
  SANITATION: {
    name: 'Municipal Sanitation Department',
    code: 'SAN',
    categories: ['GARBAGE', 'SANITATION'],
    keywords: ['garbage', 'waste', 'trash', 'dump', 'rubbish', 'clean', 'sanitation', 'hygiene', 'sweeping', 'collection', 'bin', 'dustbin'],
    avgDays: 3,
  },
  TRANSPORT: {
    name: 'Transport Department',
    code: 'TRANS',
    categories: ['PUBLIC_TRANSPORT', 'TRAFFIC'],
    keywords: ['bus', 'transport', 'traffic', 'signal', 'sign', 'parking', 'auto', 'taxi', 'metro', 'train', 'crossing', 'zebra'],
    avgDays: 10,
  },
  ENVIRONMENT: {
    name: 'Environment & Pollution Control Board',
    code: 'ENV',
    categories: ['NOISE_POLLUTION', 'AIR_POLLUTION'],
    keywords: ['pollution', 'noise', 'air', 'smoke', 'emission', 'factory', 'industrial', 'chemical', 'smell', 'dust', 'environment'],
    avgDays: 15,
  },
  PLANNING: {
    name: 'Town Planning Department',
    code: 'PLAN',
    categories: ['ILLEGAL_CONSTRUCTION', 'ENCROACHMENT'],
    keywords: ['construction', 'illegal', 'encroachment', 'building', 'permit', 'plan', 'violation', 'unauthorized', 'demolition'],
    avgDays: 21,
  },
  ANIMAL_CONTROL: {
    name: 'Animal Husbandry Department',
    code: 'ANIM',
    categories: ['STRAY_ANIMALS'],
    keywords: ['dog', 'animal', 'stray', 'cattle', 'cow', 'monkey', 'snake', 'bite', 'rabies', 'veterinary'],
    avgDays: 7,
  },
  POLICE: {
    name: 'Police Department',
    code: 'POL',
    categories: ['PUBLIC_SAFETY'],
    keywords: ['crime', 'theft', 'safety', 'police', 'violence', 'harassment', 'eve-teasing', 'drugs', 'drunk', 'accident'],
    avgDays: 3,
  },
  PARKS: {
    name: 'Parks & Gardens Department',
    code: 'PARK',
    categories: ['PARKS_GARDENS'],
    keywords: ['park', 'garden', 'tree', 'playground', 'bench', 'fence', 'lawn', 'fountain', 'green'],
    avgDays: 10,
  },
};

function detectDepartmentByKeywords(text: string): DepartmentDetectionResult {
  const lowerText = text.toLowerCase();
  let bestMatch = { dept: 'SANITATION', score: 0 };

  for (const [key, dept] of Object.entries(DEPARTMENT_MAP)) {
    let score = 0;
    for (const keyword of dept.keywords) {
      if (lowerText.includes(keyword)) {
        score += keyword.length; // Longer matches = higher confidence
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { dept: key, score };
    }
  }

  const dept = DEPARTMENT_MAP[bestMatch.dept];
  const confidence = Math.min(0.95, 0.5 + (bestMatch.score / 50));

  // Priority detection
  let priority = 'MEDIUM';
  const emergencyWords = ['danger', 'emergency', 'urgent', 'collapse', 'fire', 'flood', 'accident', 'death', 'injury', 'electric shock', 'gas leak'];
  const highWords = ['broken', 'hazard', 'risk', 'severe', 'major', 'overflow', 'blocking'];
  const lowWords = ['minor', 'small', 'slight', 'cosmetic', 'suggestion'];

  if (emergencyWords.some(w => lowerText.includes(w))) {
    priority = 'EMERGENCY';
  } else if (highWords.some(w => lowerText.includes(w))) {
    priority = 'HIGH';
  } else if (lowWords.some(w => lowerText.includes(w))) {
    priority = 'LOW';
  }

  return {
    department: dept.name,
    departmentCode: dept.code,
    category: dept.categories[0],
    priority,
    confidence,
    estimatedDays: dept.avgDays,
    reasoning: `Detected keywords matching ${dept.name}. Primary category: ${dept.categories[0]}.`,
  };
}

export async function detectDepartment(description: string, title?: string): Promise<DepartmentDetectionResult> {
  const fullText = `${title || ''} ${description}`;

  // Try OpenAI first if available
  if (env.hasOpenAI) {
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an Indian civic complaint classifier. Analyze the complaint and return JSON with:
              - department: Full department name
              - departmentCode: One of: PWD, WATER, ELEC, SAN, TRANS, ENV, PLAN, ANIM, POL, PARK
              - category: One of: POTHOLE, GARBAGE, STREETLIGHT, WATER_LEAK, ROAD_DAMAGE, DRAINAGE, SEWAGE, ELECTRICITY, PUBLIC_TRANSPORT, NOISE_POLLUTION, AIR_POLLUTION, ILLEGAL_CONSTRUCTION, ENCROACHMENT, STRAY_ANIMALS, TRAFFIC, PUBLIC_SAFETY, SANITATION, PARKS_GARDENS, OTHER
              - priority: One of: LOW, MEDIUM, HIGH, CRITICAL, EMERGENCY
              - confidence: number 0-1
              - estimatedDays: number (estimated resolution time)
              - reasoning: brief explanation`,
          },
          { role: 'user', content: fullText },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      logger.info('AI department detection successful');
      return result as DepartmentDetectionResult;
    } catch (error) {
      logger.warn('OpenAI department detection failed, falling back to keywords:', error);
    }
  }

  // Fallback to keyword-based detection
  logger.info('Using keyword-based department detection');
  return detectDepartmentByKeywords(fullText);
}
