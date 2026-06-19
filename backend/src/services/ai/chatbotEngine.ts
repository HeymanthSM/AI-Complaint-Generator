import { env } from '../../config/env';
import { logger } from '../../utils/logger';

interface ChatResponse {
  reply: string;
  suggestions: string[];
  context?: string;
}

const CIVIC_FAQ: Record<string, string> = {
  'file complaint': 'To file a complaint, go to the "File Complaint" section. You can describe your issue using text, upload an image, record a voice note, or pick a location on the map. Our AI will automatically categorize your complaint and route it to the correct department.',
  'track complaint': 'You can track your complaint status from the Dashboard. Each complaint has a unique reference number and shows real-time status updates including: Submitted → Under Review → Assigned → In Progress → Resolved.',
  'departments': 'We route complaints to the following departments:\n• Public Works Department (PWD) — Roads, bridges, potholes\n• Water Supply Board — Water leaks, sewage\n• Electricity Board — Streetlights, power issues\n• Municipal Sanitation — Garbage, waste management\n• Transport Department — Traffic, public transport\n• Environment Board — Pollution control\n• Town Planning — Illegal construction\n• Police — Public safety\n• Animal Control — Stray animals\n• Parks Department — Parks and gardens',
  'emergency': 'For emergencies (gas leaks, building collapse, live wires, fires), our system automatically detects the urgency and escalates your complaint. You can also call:\n• Police: 100\n• Fire: 101\n• Ambulance: 108\n• Disaster Management: 1070\n• Women Helpline: 1091',
  'languages': 'Our platform supports English, Tamil (தமிழ்), and Hindi (हिन्दी). You can file complaints and receive responses in any of these languages.',
  'status meaning': 'Complaint statuses:\n• SUBMITTED — Your complaint has been received\n• UNDER REVIEW — Being reviewed by the system\n• ASSIGNED — Assigned to a department/officer\n• IN PROGRESS — Being actively worked on\n• ESCALATED — Raised to higher authority\n• RESOLVED — Issue has been fixed\n• CLOSED — Complaint is closed after verification',
  'response time': 'Typical response times:\n• Emergency: Within 24 hours\n• Critical: 1-3 days\n• High Priority: 3-7 days\n• Medium Priority: 7-14 days\n• Low Priority: 14-30 days',
  'grievance': 'If your complaint is not resolved within the estimated time, you can escalate it through the platform. The system automatically tracks delays and notifies higher authorities.',
  'rti': 'RTI (Right to Information) is a separate process. You can file RTI applications through the government portal at rtionline.gov.in. Our platform helps with civic complaints and grievances.',
  'ward': 'Your ward number is determined by your location. When you file a complaint, our system automatically detects your ward based on GPS coordinates or the address you provide.',
};

function findBestMatch(message: string): string | null {
  const lower = message.toLowerCase();

  // Direct keyword matching
  for (const [key, response] of Object.entries(CIVIC_FAQ)) {
    const keywords = key.split(' ');
    if (keywords.every(k => lower.includes(k))) {
      return response;
    }
  }

  // Partial matching
  let bestMatch: { key: string; score: number } = { key: '', score: 0 };
  for (const key of Object.keys(CIVIC_FAQ)) {
    const keywords = key.split(' ');
    const score = keywords.filter(k => lower.includes(k)).length / keywords.length;
    if (score > bestMatch.score && score > 0.5) {
      bestMatch = { key, score };
    }
  }

  return bestMatch.key ? CIVIC_FAQ[bestMatch.key] : null;
}

function generateSuggestions(message: string): string[] {
  const lower = message.toLowerCase();
  const suggestions: string[] = [];

  if (lower.includes('complaint') || lower.includes('issue') || lower.includes('problem')) {
    suggestions.push('How do I file a complaint?');
    suggestions.push('What departments handle my issue?');
  }
  if (lower.includes('status') || lower.includes('track')) {
    suggestions.push('What do the status codes mean?');
    suggestions.push('How long will resolution take?');
  }
  if (!suggestions.length) {
    suggestions.push('How do I file a complaint?', 'What departments are available?', 'How do I track my complaint?', 'What are the emergency numbers?');
  }

  return suggestions.slice(0, 4);
}

export async function chatWithBot(message: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<ChatResponse> {
  // Try OpenAI / Gemini first
  if (env.hasOpenAI) {
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const messages: any[] = [
        {
          role: 'system',
          content: `You are the AI Civic Navigator Assistant, a helpful chatbot for an Indian public grievance platform. Help citizens with:
1. Filing complaints about civic issues (potholes, garbage, water leaks, etc.)
2. Understanding government procedures and departments
3. Tracking complaint status
4. Emergency guidance
5. Information about civic rights and services

Be friendly, informative, and helpful. When users describe an issue, help them understand which department handles it and guide them to file a complaint. Always provide actionable next steps.

Available departments: PWD, Water Board, Electricity Board, Sanitation, Transport, Environment, Town Planning, Police, Animal Control, Parks.
Supported languages: English, Tamil, Hindi.
Emergency numbers: Police (100), Fire (101), Ambulance (108).`,
        },
        ...(conversationHistory || []).slice(-10).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const reply = response.choices[0].message.content || 'I apologize, I could not process that request.';

      return {
        reply,
        suggestions: generateSuggestions(message),
      };
    } catch (error) {
      logger.warn('OpenAI chatbot failed, using FAQ:', error);
    }
  }

  // Fallback to FAQ-based responses
  const faqResponse = findBestMatch(message);

  if (faqResponse) {
    return {
      reply: faqResponse,
      suggestions: generateSuggestions(message),
    };
  }

  // Default response
  return {
    reply: `Thank you for your message! I'm the AI Civic Navigator Assistant. I can help you with:

🔹 **Filing complaints** about civic issues
🔹 **Tracking** your complaint status
🔹 **Understanding** which department handles your issue
🔹 **Emergency** guidance and helpline numbers
🔹 **Information** about civic procedures

Could you please describe your issue or ask a specific question? I'm here to help!`,
    suggestions: [
      'How do I file a complaint?',
      'What departments are available?',
      'Show me emergency numbers',
      'How do I track my complaint?',
    ],
  };
}
