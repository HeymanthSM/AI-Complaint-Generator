import { env } from '../../config/env';
import { logger } from '../../utils/logger';

interface SentimentResult {
  score: number; // -1 to 1
  label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  confidence: number;
  keywords: string[];
}

// Keyword-based sentiment analysis
const POSITIVE_WORDS = [
  'thank', 'good', 'great', 'excellent', 'happy', 'satisfied', 'resolved', 'fixed',
  'appreciate', 'wonderful', 'amazing', 'helpful', 'quick', 'efficient', 'best',
  'awesome', 'perfect', 'love', 'nice', 'well', 'improved', 'better', 'fantastic',
];

const NEGATIVE_WORDS = [
  'bad', 'worst', 'terrible', 'horrible', 'angry', 'frustrated', 'unresolved', 'ignored',
  'useless', 'pathetic', 'corrupt', 'lazy', 'negligent', 'careless', 'waste', 'disgusting',
  'dangerous', 'unsafe', 'broken', 'damaged', 'dirty', 'filthy', 'stinking', 'complaint',
  'poor', 'slow', 'delayed', 'failure', 'incompetent', 'irresponsible', 'shameful',
];

function analyzeSentimentByKeywords(text: string): SentimentResult {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  let posCount = 0;
  let negCount = 0;
  const foundKeywords: string[] = [];

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (POSITIVE_WORDS.includes(cleanWord)) {
      posCount++;
      foundKeywords.push(`+${cleanWord}`);
    }
    if (NEGATIVE_WORDS.includes(cleanWord)) {
      negCount++;
      foundKeywords.push(`-${cleanWord}`);
    }
  }

  const total = posCount + negCount || 1;
  const score = (posCount - negCount) / total;

  let label: SentimentResult['label'];
  if (score > 0.5) label = 'very_positive';
  else if (score > 0.1) label = 'positive';
  else if (score > -0.1) label = 'neutral';
  else if (score > -0.5) label = 'negative';
  else label = 'very_negative';

  return {
    score: Math.round(score * 100) / 100,
    label,
    confidence: Math.min(0.85, 0.5 + (total / 20)),
    keywords: foundKeywords.slice(0, 10),
  };
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  if (env.hasOpenAI) {
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Analyze the sentiment of this civic feedback text. Return JSON with:
              - score: number from -1 (very negative) to 1 (very positive)
              - label: very_negative, negative, neutral, positive, or very_positive
              - confidence: number 0-1
              - keywords: array of key sentiment words found`,
          },
          { role: 'user', content: text },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      logger.info('AI sentiment analysis successful');
      return result as SentimentResult;
    } catch (error) {
      logger.warn('OpenAI sentiment analysis failed, using keywords:', error);
    }
  }

  return analyzeSentimentByKeywords(text);
}
