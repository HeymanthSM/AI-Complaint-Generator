import { logger } from '../../utils/logger';

interface EmergencyDetectionResult {
  isEmergency: boolean;
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  suggestedActions: string[];
}

const EMERGENCY_PATTERNS = [
  { pattern: /gas\s*leak/i, severity: 'CRITICAL' as const, reason: 'Gas leak detected - immediate evacuation may be required', actions: ['Evacuate area', 'Call fire department', 'Do not use electrical switches'] },
  { pattern: /building\s*(collapse|collapsing|falling)/i, severity: 'CRITICAL' as const, reason: 'Building structural failure reported', actions: ['Evacuate building', 'Call emergency services', 'Set up safety perimeter'] },
  { pattern: /electric(al)?\s*shock|electrocution/i, severity: 'CRITICAL' as const, reason: 'Electrical hazard - risk of electrocution', actions: ['Cut power supply', 'Call emergency services', 'Do not touch victim'] },
  { pattern: /fire|burning|blaze/i, severity: 'CRITICAL' as const, reason: 'Fire emergency reported', actions: ['Call fire department', 'Evacuate area', 'Use fire extinguisher if safe'] },
  { pattern: /flood(ing|ed)?|water\s*rising/i, severity: 'HIGH' as const, reason: 'Flooding situation detected', actions: ['Move to higher ground', 'Avoid walking in flood water', 'Contact disaster management'] },
  { pattern: /tree\s*fall(en|ing)|branch\s*fall/i, severity: 'HIGH' as const, reason: 'Fallen tree/branch blocking area', actions: ['Avoid the area', 'Contact PWD', 'Check for trapped people'] },
  { pattern: /sinkhole|ground\s*collapse/i, severity: 'CRITICAL' as const, reason: 'Ground collapse/sinkhole reported', actions: ['Evacuate area', 'Set up warning signs', 'Contact geological survey'] },
  { pattern: /open\s*manhole|uncovered\s*(manhole|pit)/i, severity: 'HIGH' as const, reason: 'Open manhole - risk of falling', actions: ['Place warning markers', 'Contact municipal corporation', 'Keep children away'] },
  { pattern: /live\s*wire|exposed\s*wire|wire\s*down/i, severity: 'CRITICAL' as const, reason: 'Exposed electrical wire - electrocution risk', actions: ['Stay at least 10 feet away', 'Call electricity board', 'Do not attempt to move wire'] },
  { pattern: /sewage\s*overflow|sewage\s*spill/i, severity: 'HIGH' as const, reason: 'Sewage overflow - health hazard', actions: ['Avoid contact with water', 'Contact water board', 'Wear protective gear'] },
  { pattern: /accident|collision|crash/i, severity: 'HIGH' as const, reason: 'Accident reported', actions: ['Call ambulance', 'Do not move injured', 'Direct traffic'] },
  { pattern: /dead\s*body|death|killed/i, severity: 'CRITICAL' as const, reason: 'Death/serious injury reported', actions: ['Call police immediately', 'Call ambulance', 'Do not disturb the scene'] },
  { pattern: /child(ren)?\s*(missing|trapped|stuck)/i, severity: 'CRITICAL' as const, reason: 'Child in danger', actions: ['Call police', 'Search immediate area', 'Alert neighbors'] },
  { pattern: /bomb|explosive|blast/i, severity: 'CRITICAL' as const, reason: 'Explosive threat reported', actions: ['Evacuate immediately', 'Call bomb squad', 'Do not touch suspicious objects'] },
];

const URGENCY_WORDS = ['immediately', 'urgent', 'asap', 'right now', 'dying', 'critical', 'life threatening', 'danger', 'helpless', 'serious'];

export function detectEmergency(text: string): EmergencyDetectionResult {
  const matchedPatterns: Array<{ severity: string; reason: string; actions: string[] }> = [];

  for (const { pattern, severity, reason, actions } of EMERGENCY_PATTERNS) {
    if (pattern.test(text)) {
      matchedPatterns.push({ severity, reason, actions });
    }
  }

  if (matchedPatterns.length === 0) {
    // Check for urgency words
    const lower = text.toLowerCase();
    const urgencyCount = URGENCY_WORDS.filter(w => lower.includes(w)).length;

    if (urgencyCount >= 2) {
      return {
        isEmergency: true,
        severity: 'MEDIUM',
        reason: 'Multiple urgency indicators detected in the complaint',
        suggestedActions: ['Prioritize this complaint', 'Assign to field team'],
      };
    }

    return {
      isEmergency: false,
      severity: 'NONE',
      reason: 'No emergency indicators detected',
      suggestedActions: [],
    };
  }

  // Use the highest severity found
  const severityOrder = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  matchedPatterns.sort((a, b) => severityOrder.indexOf(b.severity) - severityOrder.indexOf(a.severity));
  const topMatch = matchedPatterns[0];

  logger.warn(`🚨 EMERGENCY DETECTED: ${topMatch.reason}`);

  return {
    isEmergency: true,
    severity: topMatch.severity as EmergencyDetectionResult['severity'],
    reason: topMatch.reason,
    suggestedActions: topMatch.actions,
  };
}
