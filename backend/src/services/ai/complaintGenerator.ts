import { env } from '../../config/env';
import { logger } from '../../utils/logger';

interface ComplaintLetterResult {
  title: string;
  letter: string;
  language: string;
  department: string;
  category: string;
  priority: string;
}

const TEMPLATES: Record<string, (data: any) => string> = {
  en: (data) => `
FORMAL COMPLAINT LETTER

Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}

To,
The Commissioner/Officer,
${data.department}
${data.municipality || 'Municipal Corporation'}
${data.district || ''}, ${data.state || 'Tamil Nadu'}

Subject: ${data.title} - Complaint Regarding ${data.category.replace(/_/g, ' ')}

Respected Sir/Madam,

I, the undersigned, wish to bring to your kind attention the following civic issue that requires immediate attention:

COMPLAINT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Category: ${data.category.replace(/_/g, ' ')}
Priority: ${data.priority}
Location: ${data.address || 'As mentioned below'}
${data.ward ? `Ward: ${data.ward}` : ''}

DESCRIPTION:
${data.description}

${data.isEmergency ? '⚠️ EMERGENCY: This issue poses an immediate threat to public safety and requires urgent action.' : ''}

I kindly request you to take necessary action at the earliest to resolve this issue. The affected area is causing significant inconvenience to the residents and may lead to further complications if not addressed promptly.

I trust that your department will take swift action on this matter.

Thanking you,
Yours faithfully,
${data.userName || 'Concerned Citizen'}
${data.userPhone ? `Contact: ${data.userPhone}` : ''}
${data.userEmail ? `Email: ${data.userEmail}` : ''}

Complaint Reference: ${data.refNumber || 'To be assigned'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),

  ta: (data) => `
அதிகாரபூர்வ புகார் கடிதம்

தேதி: ${new Date().toLocaleDateString('ta-IN', { year: 'numeric', month: 'long', day: 'numeric' })}

பெறுநர்,
ஆணையர்/அதிகாரி,
${data.department}
${data.municipality || 'மாநகராட்சி'}
${data.district || ''}, ${data.state || 'தமிழ்நாடு'}

பொருள்: ${data.title} - ${data.category.replace(/_/g, ' ')} தொடர்பான புகார்

மதிப்பிற்குரிய ஐயா/அம்மா,

உடனடி கவனம் தேவைப்படும் பின்வரும் குடிமை பிரச்சினையை உங்கள் கவனத்திற்கு கொண்டு வர விரும்புகிறேன்:

புகார் விவரங்கள்:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
வகை: ${data.category.replace(/_/g, ' ')}
முன்னுரிமை: ${data.priority}
இடம்: ${data.address || 'கீழே குறிப்பிடப்பட்டுள்ளது'}

விளக்கம்:
${data.description}

${data.isEmergency ? '⚠️ அவசரம்: இந்த பிரச்சினை பொது பாதுகாப்புக்கு உடனடி அச்சுறுத்தலாக உள்ளது.' : ''}

இந்த பிரச்சினையை விரைவில் தீர்க்க நடவடிக்கை எடுக்குமாறு கேட்டுக்கொள்கிறேன்.

நன்றி,
உங்கள் உண்மையுள்ள,
${data.userName || 'அக்கறையுள்ள குடிமகன்'}

புகார் எண்: ${data.refNumber || 'ஒதுக்கப்படும்'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),

  hi: (data) => `
आधिकारिक शिकायत पत्र

दिनांक: ${new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}

सेवा में,
आयुक्त/अधिकारी,
${data.department}
${data.municipality || 'नगर निगम'}
${data.district || ''}, ${data.state || 'तमिलनाडु'}

विषय: ${data.title} - ${data.category.replace(/_/g, ' ')} संबंधित शिकायत

माननीय महोदय/महोदया,

मैं निम्नलिखित नागरिक समस्या को आपके संज्ञान में लाना चाहता/चाहती हूँ जिसे तत्काल ध्यान देने की आवश्यकता है:

शिकायत विवरण:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
श्रेणी: ${data.category.replace(/_/g, ' ')}
प्राथमिकता: ${data.priority}
स्थान: ${data.address || 'नीचे वर्णित'}

विवरण:
${data.description}

${data.isEmergency ? '⚠️ आपातकाल: यह समस्या सार्वजनिक सुरक्षा के लिए तत्काल खतरा है।' : ''}

कृपया इस समस्या को शीघ्र हल करने के लिए आवश्यक कार्रवाई करें।

धन्यवाद,
आपका विश्वासपात्र,
${data.userName || 'चिंतित नागरिक'}

शिकायत संदर्भ: ${data.refNumber || 'आवंटित किया जाएगा'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim(),
};

export async function generateComplaintLetter(data: {
  title: string;
  description: string;
  category: string;
  department: string;
  priority: string;
  language?: string;
  address?: string;
  ward?: string;
  municipality?: string;
  district?: string;
  state?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  isEmergency?: boolean;
  refNumber?: string;
}): Promise<ComplaintLetterResult> {
  const lang = data.language || 'en';

  // Try AI generation first
  if (env.hasOpenAI) {
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const langName = lang === 'ta' ? 'Tamil' : lang === 'hi' ? 'Hindi' : 'English';

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional complaint letter writer for Indian civic issues. Write a formal, professional complaint letter in ${langName}. The letter should be addressed to the appropriate government department and include all relevant details. Make it compelling but professional.`,
          },
          {
            role: 'user',
            content: JSON.stringify(data),
          },
        ],
        temperature: 0.7,
      });

      const letter = response.choices[0].message.content || '';
      logger.info('AI complaint letter generated');

      return {
        title: data.title,
        letter,
        language: lang,
        department: data.department,
        category: data.category,
        priority: data.priority,
      };
    } catch (error) {
      logger.warn('OpenAI letter generation failed, using template:', error);
    }
  }

  // Fallback to template
  const template = TEMPLATES[lang] || TEMPLATES.en;
  const letter = template(data);

  return {
    title: data.title,
    letter,
    language: lang,
    department: data.department,
    category: data.category,
    priority: data.priority,
  };
}
