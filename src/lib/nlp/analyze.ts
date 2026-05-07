import type { NLPAnalysis, NLPIntent } from './types';

const SYMPTOM_TERMS = [
  'fever', 'headache', 'migraine', 'cough', 'cold', 'flu', 'nausea', 'vomit', 'diarrhea',
  'pain', 'ache', 'rash', 'fatigue', 'dizzy', 'breath', 'chest', 'stomach', 'abdominal',
  'throat', 'congestion', 'chills', 'sweat', 'insomnia', 'anxiety', 'swelling', 'bleeding',
  'bukhaar', 'sar dard', 'talenova', 'jwara', 'jevu', 'kasunu',
];

const BODY_TERMS = [
  'head', 'chest', 'back', 'stomach', 'abdomen', 'leg', 'arm', 'throat', 'ear', 'eye',
  'heart', 'lung', 'skin', 'neck', 'joint', 'knee',
];

const MED_TERMS = [
  'paracetamol', 'acetaminophen', 'ibuprofen', 'aspirin', 'antibiotic', 'insulin',
  'tablet', 'pill', 'capsule', 'syrup', 'injection', 'dosage', 'prescription',
];

const DURATION_PATTERNS = [
  /\b(\d+)\s*(day|days|week|weeks|month|months|hour|hours)\b/gi,
  /\b(since|for)\s+(yesterday|today|last week)\b/gi,
  /\b(last|past)\s+(\d+)\s+(day|days|week|weeks)\b/gi,
];

/** Common Indian + global city hints (extend as needed) */
const CITY_HINTS: RegExp[] = [
  /\b(?:in|at|near|around)\s+([a-z][a-z\s]{2,34})\b/gi,
  /\b(Bangalore|Bengaluru|Mumbai|Delhi|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Jaipur|Kochi|Thiruvananthapuram|Visakhapatnam|Indore|Nagpur|Lucknow|Kanpur|Surat|Patna|Bhopal|Ludhiana|Coimbatore|Guwahati|Nashik|Dehradun|Mysuru|Mysore)\b/gi,
];

function norm(s: string): string {
  return s.toLowerCase().trim();
}

function scoreIntent(msg: string): { intent: NLPIntent; confidence: number } {
  const t = norm(msg);

  if (/\b(emergency|critical|urgent|save me|help me|heart attack|stroke|can'?t breathe)\b/.test(t)) {
    return { intent: 'emergency', confidence: 0.92 };
  }
  if (/\bcaretaker\b/.test(t) && /\b(call|phone|ring|dial|notify|contact)\b/.test(t)) {
    return { intent: 'caretaker_call', confidence: 0.9 };
  }
  if (/\b(book|schedule|appointment|token|visit doctor|clinic|hospital slot)\b/.test(t)) {
    return { intent: 'appointment', confidence: 0.82 };
  }
  if (/\b(medicine|tablet|drug|dosage|prescription|side effect)\b/.test(t)) {
    return { intent: 'medicine_info', confidence: 0.78 };
  }
  if (/\b(lab|report|cbc|lipid|hba1c|x-?ray|scan|result)\b/.test(t)) {
    return { intent: 'lab_report', confidence: 0.75 };
  }
  if (SYMPTOM_TERMS.some((w) => t.includes(w))) {
    return { intent: 'symptom_check', confidence: 0.8 };
  }
  if (/\b(explain|physiology|anatomy|pathology|exam|study|mnemonic)\b/.test(t)) {
    return { intent: 'education_query', confidence: 0.72 };
  }
  if (/\b(hello|hi |thanks|thank you|bye|good morning)\b/.test(t) && t.length < 80) {
    return { intent: 'conversation', confidence: 0.55 };
  }
  return { intent: 'general_health', confidence: 0.6 };
}

function extractSymptoms(t: string): string[] {
  const out = new Set<string>();
  for (const w of SYMPTOM_TERMS) {
    if (t.includes(w)) out.add(w);
  }
  return [...out].slice(0, 8);
}

function extractBodyParts(t: string): string[] {
  const out = new Set<string>();
  for (const w of BODY_TERMS) {
    if (new RegExp(`\\b${w}\\b`, 'i').test(t)) out.add(w);
  }
  return [...out];
}

function extractMeds(t: string): string[] {
  const out = new Set<string>();
  for (const w of MED_TERMS) {
    if (t.includes(w)) out.add(w);
  }
  return [...out].slice(0, 6);
}

function extractDurations(original: string): string[] {
  const t = original;
  const found: string[] = [];
  for (const re of DURATION_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(t)) !== null) {
      found.push(m[0]);
    }
  }
  return [...new Set(found)].slice(0, 4);
}

function extractLocationsInText(original: string): string[] {
  const found = new Set<string>();
  for (const re of CITY_HINTS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(original)) !== null) {
      const g = m[1] || m[0];
      if (g && g.length > 2 && g.length < 40) found.add(g.trim());
    }
  }
  return [...found].slice(0, 5);
}

function severityCue(t: string): 'low' | 'moderate' | 'high' | undefined {
  if (/\b(severe|intense|unbearable|worst|emergency|blood|unconscious)\b/i.test(t)) return 'high';
  if (/\b(mild|slight|little bit|somewhat)\b/i.test(t)) return 'low';
  if (/\b(moderate|medium|pretty bad)\b/i.test(t)) return 'moderate';
  return undefined;
}

/**
 * Deterministic NLP — fast, no network. Pair with LLM for final wording.
 */
export function analyzeUtterance(message: string): NLPAnalysis {
  const t = norm(message);
  const { intent, confidence } = scoreIntent(message);

  return {
    primaryIntent: intent,
    confidence,
    entities: {
      symptoms: extractSymptoms(t),
      medications: extractMeds(t),
      bodyParts: extractBodyParts(message),
      durations: extractDurations(message),
      locationsInText: extractLocationsInText(message),
      severityCue: severityCue(message),
    },
  };
}

/** Compact block injected into system / user prompts */
export function formatNlpContext(analysis: NLPAnalysis, geoLabel?: string | null): string {
  const e = analysis.entities;
  const lines: string[] = [
    `Detected intent: ${analysis.primaryIntent} (confidence ~${Math.round(analysis.confidence * 100)}%).`,
  ];
  if (e.symptoms.length) lines.push(`Symptoms mentioned: ${e.symptoms.join(', ')}.`);
  if (e.bodyParts.length) lines.push(`Body areas: ${e.bodyParts.join(', ')}.`);
  if (e.medications.length) lines.push(`Medicine-related terms: ${e.medications.join(', ')}.`);
  if (e.durations.length) lines.push(`Time context: ${e.durations.join('; ')}.`);
  if (e.locationsInText.length) lines.push(`Place names in message: ${e.locationsInText.join(', ')}.`);
  if (e.severityCue) lines.push(`Severity cue: ${e.severityCue}.`);
  if (geoLabel) lines.push(`Approximate user location (device): ${geoLabel}.`);
  lines.push(
    'Use this context to tailor advice (local facilities, climate, travel). Do not fabricate addresses.'
  );
  return lines.join('\n');
}
