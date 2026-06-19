import { env } from '../../config/env';
import { logger } from '../../utils/logger';

interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

// Basic phrase dictionary for common civic terms
const CIVIC_DICTIONARY: Record<string, Record<string, string>> = {
  en_ta: {
    'pothole': 'குழி',
    'road': 'சாலை',
    'water': 'நீர்',
    'garbage': 'குப்பை',
    'streetlight': 'தெரு விளக்கு',
    'drainage': 'வடிகால்',
    'sewage': 'கழிவுநீர்',
    'electricity': 'மின்சாரம்',
    'complaint': 'புகார்',
    'department': 'துறை',
    'municipality': 'நகராட்சி',
    'urgent': 'அவசரம்',
    'repair': 'பழுது பார்',
    'broken': 'உடைந்த',
    'leak': 'கசிவு',
    'flood': 'வெள்ளம்',
    'danger': 'ஆபத்து',
    'public': 'பொது',
    'safety': 'பாதுகாப்பு',
  },
  en_hi: {
    'pothole': 'गड्ढा',
    'road': 'सड़क',
    'water': 'पानी',
    'garbage': 'कचरा',
    'streetlight': 'स्ट्रीट लाइट',
    'drainage': 'जल निकासी',
    'sewage': 'सीवेज',
    'electricity': 'बिजली',
    'complaint': 'शिकायत',
    'department': 'विभाग',
    'municipality': 'नगर पालिका',
    'urgent': 'अत्यावश्यक',
    'repair': 'मरम्मत',
    'broken': 'टूटा',
    'leak': 'रिसाव',
    'flood': 'बाढ़',
    'danger': 'खतरा',
    'public': 'सार्वजनिक',
    'safety': 'सुरक्षा',
  },
};

function simpleTranslate(text: string, sourceLang: string, targetLang: string): string {
  if (sourceLang === targetLang) return text;

  const dictKey = `${sourceLang}_${targetLang}`;
  const dict = CIVIC_DICTIONARY[dictKey];

  if (!dict) {
    // Return with a note about translation not available
    return `[Translation: ${sourceLang} → ${targetLang}] ${text}`;
  }

  let translated = text;
  for (const [eng, local] of Object.entries(dict)) {
    translated = translated.replace(new RegExp(`\\b${eng}\\b`, 'gi'), local);
  }

  return translated;
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<TranslationResult> {
  // Try OpenAI first
  if (env.hasOpenAI) {
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const langNames: Record<string, string> = { en: 'English', ta: 'Tamil', hi: 'Hindi' };

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a translator specializing in Indian civic and government terminology. Translate the following text from ${langNames[sourceLanguage] || sourceLanguage} to ${langNames[targetLanguage] || targetLanguage}. Preserve the meaning and context of civic complaints. Return only the translated text.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      });

      const translatedText = response.choices[0].message.content || text;
      logger.info(`Translation successful: ${sourceLanguage} → ${targetLanguage}`);

      return {
        translatedText,
        sourceLanguage,
        targetLanguage,
        confidence: 0.95,
      };
    } catch (error) {
      logger.warn('OpenAI translation failed, using dictionary:', error);
    }
  }

  // Fallback to simple dictionary translation
  const translatedText = simpleTranslate(text, sourceLanguage, targetLanguage);

  return {
    translatedText,
    sourceLanguage,
    targetLanguage,
    confidence: 0.6,
  };
}
